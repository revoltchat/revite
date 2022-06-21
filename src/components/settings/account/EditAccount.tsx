import { At } from "@styled-icons/boxicons-regular";
import { Envelope, Key, Pencil } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";

import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import {
    AccountDetail,
    CategoryButton,
    Column,
    HiddenValue,
} from "@revoltchat/ui";

import { modalController } from "../../../context/modals";
import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

export default observer(() => {
    const client = useClient();
    const status = useContext(StatusContext);

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
                        modalController.push({
                            type: "modify_account",
                            client,
                            field,
                        })
                    }>
                    <Text id={`login.${field}`} />
                </CategoryButton>
            ))}
        </>
    );
});
