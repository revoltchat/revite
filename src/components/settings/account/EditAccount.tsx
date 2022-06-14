import { At } from "@styled-icons/boxicons-regular";
import { Envelope, Key, Pencil } from "@styled-icons/boxicons-solid";

import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import {
    AccountDetail,
    CategoryButton,
    Column,
    HiddenValue,
} from "@revoltchat/ui";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

export default function EditAccount() {
    const client = useClient();
    const status = useContext(StatusContext);
    const { openScreen } = useIntermediate();

    const [email, setEmail] = useState("...");

    useEffect(() => {
        if (email === "..." && status === ClientStatus.ONLINE) {
            client.api
                .get("/auth/account/")
                .then((account) => setEmail(account.email));
        }
    }, [client, email, status]);

    return (
        <>
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
        </>
    );
}
