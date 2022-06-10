import { At, Key, Block } from "@styled-icons/boxicons-regular";
import {
    Envelope,
    HelpCircle,
    Lock,
    Trash,
    Pencil,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { API } from "revolt.js";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { Button, CategoryButton, LineDivider, Tip } from "@revoltchat/ui";

import { stopPropagation } from "../../../lib/stopPropagation";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { modalController } from "../../../context/modals";
import {
    ClientStatus,
    LogOutContext,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";

export const Account = observer(() => {
    const { openScreen, writeClipboard } = useIntermediate();
    const logOut = useContext(LogOutContext);
    const status = useContext(StatusContext);

    const client = useClient();

    const [email, setEmail] = useState("...");
    const [revealEmail, setRevealEmail] = useState(false);
    const [profile, setProfile] = useState<undefined | API.UserProfile>(
        undefined,
    );
    const history = useHistory();

    function switchPage(to: string) {
        history.replace(`/settings/${to}`);
    }

    useEffect(() => {
        if (email === "..." && status === ClientStatus.ONLINE) {
            client.api
                .get("/auth/account/")
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
            <h3>
                <Text id="app.settings.pages.account.2fa.title" />
            </h3>
            <h5>
                {/*<Text id="app.settings.pages.account.2fa.description" />*/}
                Two-factor authentication is currently in-development, see{" "}
                <a href="https://github.com/revoltchat/revite/issues/675">
                    tracking issue here
                </a>
                .
            </h5>
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
            <h3>
                <Text id="app.settings.pages.account.manage.title" />
            </h3>
            <h5>
                <Text id="app.settings.pages.account.manage.description" />
            </h5>
            <CategoryButton
                icon={<Block size={24} color="var(--error)" />}
                description={
                    "Disable your account. You won't be able to access it unless you contact support."
                }
                action="chevron"
                onClick={() =>
                    modalController.push({
                        type: "mfa_flow",
                        state: "known",
                        client,
                        callback: ({ token }) =>
                            client.api
                                .post("/auth/account/disable", undefined, {
                                    headers: {
                                        "X-MFA-Ticket": token,
                                    },
                                })
                                .then(() => logOut(true)),
                    })
                }>
                <Text id="app.settings.pages.account.manage.disable" />
            </CategoryButton>
            <CategoryButton
                icon={<Trash size={24} color="var(--error)" />}
                description={
                    "Your account will be queued for deletion, a confirmation email will be sent."
                }
                action="chevron"
                onClick={() =>
                    modalController.push({
                        type: "mfa_flow",
                        state: "known",
                        client,
                        callback: ({ token }) =>
                            client.api
                                .post("/auth/account/delete", undefined, {
                                    headers: {
                                        "X-MFA-Ticket": token,
                                    },
                                })
                                .then(() => logOut(true)),
                    })
                }>
                <Text id="app.settings.pages.account.manage.delete" />
            </CategoryButton>
            <Tip>
                <span>
                    <Text id="app.settings.tips.account.a" />
                </span>{" "}
                <a onClick={() => switchPage("profile")}>
                    <Text id="app.settings.tips.account.b" />
                </a>
            </Tip>
        </div>
    );
});
