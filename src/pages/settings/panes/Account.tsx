import { At, Key, Block } from "@styled-icons/boxicons-regular";
import { Envelope, Lock, Trash, Pencil } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import {
    AccountDetail,
    CategoryButton,
    Column,
    HiddenValue,
    Tip,
} from "@revoltchat/ui";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { modalController } from "../../../context/modals";
import {
    ClientStatus,
    LogOutContext,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

export const Account = observer(() => {
    const { openScreen } = useIntermediate();
    const logOut = useContext(LogOutContext);
    const status = useContext(StatusContext);

    const client = useClient();

    const [email, setEmail] = useState("...");

    useEffect(() => {
        if (email === "..." && status === ClientStatus.ONLINE) {
            client.api
                .get("/auth/account/")
                .then((account) => setEmail(account.email));
        }
    }, [client, email, status]);

    return (
        <div className={styles.user}>
            <Column group>
                <AccountDetail user={client.user!} />
            </Column>

            {(
                [
                    ["username", client.user!.username, At],
                    ["email", email, Envelope],
                    ["password", "•••••••••", Key],
                ] as const
            ).map(([field, value, Icon]) => (
                <CategoryButton
                    key={field}
                    icon={<Icon size={24} />}
                    description={
                        field === "email" ? (
                            <HiddenValue
                                value={value}
                                placeholder={"•••••••••••@••••••.•••"}
                            />
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
                <Link to="/settings/profile" replace>
                    <Text id="app.settings.tips.account.b" />
                </Link>
            </Tip>
        </div>
    );
});
