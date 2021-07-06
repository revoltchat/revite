import { At } from "@styled-icons/boxicons-regular";
import { Envelope, Key, HelpCircle } from "@styled-icons/boxicons-solid";
import { Link, useHistory } from "react-router-dom";
import { Users } from "revolt.js/dist/api/objects";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import {
    ClientStatus,
    StatusContext,
} from "../../../context/revoltjs/RevoltClient";
import { useForceUpdate, useSelf } from "../../../context/revoltjs/hooks";

import UserIcon from "../../../components/common/user/UserIcon";
import Button from "../../../components/ui/Button";
import Overline from "../../../components/ui/Overline";
import Tooltip from "../../../components/common/Tooltip";
import Tip from "../../../components/ui/Tip";

export function Account() {
    const { openScreen } = useIntermediate();
    const status = useContext(StatusContext);

    const ctx = useForceUpdate();
    const user = useSelf(ctx);
    if (!user) return null;

    const [email, setEmail] = useState("...");
    const [profile, setProfile] = useState<undefined | Users.Profile>(
        undefined,
    );
    const history = useHistory();

    function switchPage(to: string) {
        history.replace(`/settings/${to}`);
    }

    useEffect(() => {
        if (email === "..." && status === ClientStatus.ONLINE) {
            ctx.client
                .req("GET", "/auth/user")
                .then((account) => setEmail(account.email));
        }

        if (profile === undefined && status === ClientStatus.ONLINE) {
            ctx.client.users
                .fetchProfile(user._id)
                .then((profile) => setProfile(profile ?? {}));
        }
    }, [status]);

    return (
        <div className={styles.user}>
            <div className={styles.banner}>
                <UserIcon
                    className={styles.avatar}
                    target={user}
                    size={72}
                    onClick={() => switchPage("profile")}
                />
                <div className={styles.userDetail}>
                    <div className={styles.username}>@{user.username}</div>
                    <div className={styles.userid}>
                        <Tooltip content={<Text id="app.settings.pages.account.tooltip_ulid" />}>
                            <HelpCircle size={16} />
                        </Tooltip>
                        {user._id}
                    </div>
                </div>
            </div>
            <div className={styles.details}>
                {(
                    [
                        ["username", user.username, <At size={24} />],
                        ["email", email, <Envelope size={24} />],
                        ["password", "***********", <Key size={24} />],
                    ] as const
                ).map(([field, value, icon]) => (
                    <div>
                        {icon}
                        <div className={styles.detail}>
                            <div className={styles.subtext}>
                                <Text id={`login.${field}`} />
                            </div>
                            <p>{value}</p>
                        </div>
                        <div>
                            <Button
                                onClick={() =>
                                    openScreen({
                                        id: "modify_account",
                                        field: field,
                                    })
                                }
                                contrast>
                                <Text id="app.settings.pages.account.change_field" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            {/*<h3><Text id="app.settings.pages.account.two_factor_auth.title" /></h3>
            <h5><Text id="app.settings.pages.account.two_factor_auth.description" /></h5>
            <Button accent compact>
                <Text id="app.settings.pages.account.two_factor_auth.add_auth" />
            </Button>*/}
            <h3><Text id="app.settings.pages.account.account_management.title" /></h3>
            <h5><Text id="app.settings.pages.account.account_management.description" /></h5>
            <div className={styles.buttons}>
                {/*<Button error compact>
                    <Text id="app.settings.pages.account.account_management.disable_account" />
                </Button>*/}
                <Button error compact>
                    <Text id="app.settings.pages.account.account_management.delete_account" />
                </Button>
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
}
