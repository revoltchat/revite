import { At, Key, Block, ListOl } from "@styled-icons/boxicons-regular";
import {
    Envelope,
    HelpCircle,
    Lock,
    Trash,
    Pencil,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Profile } from "revolt-api/types/Users";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { H3 } from "@revoltchat/ui/lib/components/atoms/heading/H3";
import { H5 } from "@revoltchat/ui/lib/components/atoms/heading/H5";
import { Button } from "@revoltchat/ui/lib/components/atoms/inputs/Button";
import { CategoryButton } from "@revoltchat/ui/lib/components/atoms/inputs/CategoryButton";
import { LineDivider } from "@revoltchat/ui/lib/components/atoms/layout/LineDivider";
import { Tip } from "@revoltchat/ui/lib/components/atoms/layout/Tip";

import { stopPropagation } from "../../../lib/stopPropagation";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";

export const Account = observer(() => {
    const { openScreen, writeClipboard } = useIntermediate();
    const status = useContext(StatusContext);

    const client = useClient();

    const [email, setEmail] = useState("...");
    const [revealEmail, setRevealEmail] = useState(false);
    const [profile, setProfile] = useState<undefined | Profile>(undefined);
    const history = useHistory();

    function switchPage(to: string) {
        history.replace(`/settings/${to}`);
    }

    useEffect(() => {
        if (email === "..." && status === ClientStatus.ONLINE) {
            client
                .req("GET", "/auth/account")
                .then((account) => setEmail(account.email));
        }

        if (profile === undefined && status === ClientStatus.ONLINE) {
            client
                .user!.fetchProfile()
                .then((profile) => setProfile(profile ?? {}));
        }
    }, [client, email, profile, status]);

    return (
        <div className={styles.user}>
            <div className={styles.banner}>
                <div className={styles.container}>
                    <UserIcon
                        className={styles.avatar}
                        target={client.user!}
                        size={72}
                        onClick={() => switchPage("profile")}
                    />
                    <div className={styles.userDetail}>
                        <div className={styles.userContainer}>
                            <UserIcon
                                className={styles.tinyavatar}
                                target={client.user!}
                                size={25}
                                onClick={() => switchPage("profile")}
                            />
                            <div className={styles.username}>
                                @{client.user!.username}
                            </div>
                        </div>
                        <div className={styles.userid}>
                            <Tooltip
                                content={
                                    <Text id="app.settings.pages.account.unique_id" />
                                }>
                                <HelpCircle size={16} />
                            </Tooltip>
                            <Tooltip content={<Text id="app.special.copy" />}>
                                <a
                                    onClick={() =>
                                        writeClipboard(client.user!._id)
                                    }>
                                    {client.user!._id}
                                </a>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => switchPage("profile")}
                    palette="secondary">
                    <Text id="app.settings.pages.profile.edit_profile" />
                </Button>
            </div>
            <div>
                {(
                    [
                        [
                            "username",
                            client.user!.username,
                            <At key="at" size={24} />,
                        ],
                        ["email", email, <Envelope key="envelope" size={24} />],
                        ["password", "•••••••••", <Key key="key" size={24} />],
                    ] as const
                ).map(([field, value, icon]) => (
                    <CategoryButton
                        key={field}
                        icon={icon}
                        description={
                            field === "email" ? (
                                revealEmail ? (
                                    <>
                                        {value}{" "}
                                        <a
                                            style={{ fontSize: "13px" }}
                                            onClick={(ev) =>
                                                stopPropagation(
                                                    ev,
                                                    setRevealEmail(false),
                                                )
                                            }>
                                            <Text id="app.special.modals.actions.hide" />
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        •••••••••••@••••••.•••{" "}
                                        <a
                                            style={{ fontSize: "13px" }}
                                            onClick={(ev) =>
                                                stopPropagation(
                                                    ev,
                                                    setRevealEmail(true),
                                                )
                                            }>
                                            <Text id="app.special.modals.actions.reveal" />
                                        </a>
                                    </>
                                )
                            ) : (
                                value
                            )
                        }
                        account
                        action={<Pencil size={20} />}
                        onClick={() =>
                            openScreen({
                                id: "modify_account",
                                field,
                            })
                        }>
                        <Text id={`login.${field}`} />
                    </CategoryButton>
                ))}
            </div>
            <hr />
            <H3>
                <Text id="app.settings.pages.account.2fa.title" />
            </H3>
            <H5>
                {/*<Text id="app.settings.pages.account.2fa.description" />*/}
                Two-factor authentication is currently work-in-progress, see{" "}
                {` `}
                <a
                    href="https://github.com/insertish/rauth/milestone/1"
                    target="_blank"
                    rel="noreferrer">
                    v1 milestone here
                </a>
                .
            </H5>
            <CategoryButton
                icon={<Lock size={24} color="var(--error)" />}
                description={"Set up 2FA on your account."}
                disabled
                action={<Text id="general.unavailable" />}>
                Set up Two-factor authentication
            </CategoryButton>
            {/*<CategoryButton
                icon={<ListOl size={24} />}
                description={"View and download your 2FA backup codes."}
                disabled
                action="chevron">
                View my backup codes
            </CategoryButton>*/}
            <hr />
            <H3>
                <Text id="app.settings.pages.account.manage.title" />
            </H3>
            <H5>
                <Text id="app.settings.pages.account.manage.description" />
            </H5>
            <CategoryButton
                icon={<Block size={24} color="var(--error)" />}
                description={
                    "Disable your account. You won't be able to access it unless you log back in."
                }
                disabled
                action={<Text id="general.unavailable" />}>
                <Text id="app.settings.pages.account.manage.disable" />
            </CategoryButton>
            <a href="mailto:contact@revolt.chat?subject=Delete%20my%20account">
                <CategoryButton
                    icon={<Trash size={24} color="var(--error)" />}
                    description={
                        "Delete your account, including all of your data. (sends an email to contact@revolt.chat)"
                    }
                    hover
                    action="external">
                    <Text id="app.settings.pages.account.manage.delete" />
                </CategoryButton>
            </a>
            <LineDivider />
            <Tip>
                <span>
                    <Text id="app.settings.tips.account.a" />{" "}
                    <a onClick={() => switchPage("profile")}>
                        <Text id="app.settings.tips.account.b" />
                    </a>
                </span>
            </Tip>
        </div>
    );
});
