import { At, Key, Block } from "@styled-icons/boxicons-regular";
import { Envelope, HelpCircle, Lock, Trash } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link, useHistory } from "react-router-dom";
import { Profile } from "revolt-api/types/Users";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";
import Button from "../../../components/ui/Button";
import Tip from "../../../components/ui/Tip";

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
                .req("GET", "/auth/user")
                .then((account) => setEmail(account.email));
        }

        if (profile === undefined && status === ClientStatus.ONLINE) {
            client
                .user!.fetchProfile()
                .then((profile) => setProfile(profile ?? {}));
        }
    }, [status]);

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
                        @{client.user!.username}
                        <div className={styles.userid}>
                            <Tooltip content={<Text id="app.settings.pages.account.unique_id" />}>
                                <HelpCircle size={16} />
                            </Tooltip>
                            <Tooltip content={<Text id="app.special.copy" />}>
                                <a onClick={() => writeClipboard(client.user!._id)}>
                                    {client.user!._id}
                                </a>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                
                <Button
                    onClick={() => switchPage("profile")}
                    contrast>
                    Edit Profile
                </Button>
            </div>
            <div className={styles.details}>
                {(
                    [
                        ["username", client.user!.username, <At size={24} />],
                        ["email", email, <Envelope size={24} />],
                        ["password", "•••••••••", <Key size={24} />],
                    ] as const
                ).map(([field, value, icon]) => (
                    <div>
                        {icon}
                        <div className={styles.detail}>
                            <div className={styles.subtext}>
                                <Text id={`login.${field}`} />
                            </div>
                            <div className={styles.entry}>
                                {field === "email" ? (
                                    revealEmail ? (
                                        <>
                                            {value}{" "}
                                            <a
                                                onClick={() =>
                                                    setRevealEmail(false)
                                                }>
                                                <Text id="app.special.modals.actions.hide" />
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            •••••••••••@{value.split("@").pop()}{" "}
                                            <a
                                                onClick={() =>
                                                    setRevealEmail(true)
                                                }>
                                                <Text id="app.special.modals.actions.reveal" />
                                            </a>
                                        </>
                                    )
                                ) : (
                                    value
                                )}
                            </div>
                        </div>
                        <div>
                            <Button
                                onClick={() =>
                                    openScreen({
                                        id: "modify_account",
                                        field,
                                    })
                                }
                                plain>
                                <Text id="app.settings.pages.account.change_field" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <h3>
                <Text id="app.settings.pages.account.2fa.title" />
            </h3>
            <h5><Text id="app.settings.pages.account.2fa.description" /></h5>
            <div className={styles.entrytest}>
                <Lock size={24}/>
                <div className={styles.content}>
                    Currently not available
                    <div className={styles.description}>
                        Two-factor auth is currently work-in-progress, see{" "}
                        <a
                            href="https://gitlab.insrt.uk/insert/rauth/-/issues/2"
                            target="_blank"
                            rel="noreferrer">
                            tracking issue here
                        </a>
                        .
                    </div>
                </div>
                <Button accent compact disabled>
                    <Text id="app.settings.pages.account.2fa.add_auth" />
                </Button>
            </div>
            <h3>
                <Text id="app.settings.pages.account.manage.title" />
            </h3>
            <h5>
                <Text id="app.settings.pages.account.manage.description" />
            </h5>
            <div className={styles.entrytest}>
                <Block size={24}/>
                <div className={styles.content}>
                    <Text id="app.settings.pages.account.manage.disable" />
                    <div className={styles.description}>
                        Disable your account. You won't be able to access it unless you log back in.
                    </div>
                </div>
                <Button accent compact disabled>
                    Unavailable
                </Button>
            </div>
            <div className={styles.entrytest}>
                <Trash size={24}/>
                <div className={styles.content}>
                    <Text id="app.settings.pages.account.manage.delete" />
                    <div className={styles.description}>
                        Delete your account, including all of your data.
                    </div>
                </div>
                <a href="mailto:contact@revolt.chat?subject=Delete%20my%20account">
                    <Button error compact>
                        <Text id="app.settings.pages.account.manage.delete" />
                    </Button>
                </a>
            </div>
            <div className={styles.buttons}>
                {/* <Button contrast>
                    <Text id="app.settings.pages.account.manage.disable" />
                </Button> 
                <a href="mailto:contact@revolt.chat?subject=Delete%20my%20account">
                    <Button error compact>
                        <Text id="app.settings.pages.account.manage.delete" />
                    </Button>
                </a>*/}
            </div>
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
