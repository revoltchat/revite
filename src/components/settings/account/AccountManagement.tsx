import { Block } from "@styled-icons/boxicons-regular";
import { Trash } from "@styled-icons/boxicons-solid";

import { Text } from "preact-i18n";

import { CategoryButton } from "@revoltchat/ui";

import {
    clientController,
    useClient,
} from "../../../controllers/client/ClientController";
import { modalController } from "../../../controllers/modals/ModalController";

export default function AccountManagement() {
    const client = useClient();

    const callback = (route: "disable" | "delete") => () =>
        modalController.mfaFlow(client).then(
            (ticket) =>
                ticket &&
                client.api
                    .post(`/auth/account/${route}`, undefined, {
                        headers: {
                            "X-MFA-Ticket": ticket.token,
                        },
                    })
                    .then(clientController.logoutCurrent),
        );

    return (
        <>
            <h3>
                <Text id="app.settings.pages.account.manage.title" />
            </h3>

            <h5>
                <Text id="app.settings.pages.account.manage.description" />
            </h5>
            <CategoryButton
                icon={<Block size={24} color="var(--error)" />}
                description={
                    <Text id="app.settings.pages.account.manage.disable_description" />
                }
                action="chevron"
                onClick={callback("disable")}>
                <Text id="app.settings.pages.account.manage.disable" />
            </CategoryButton>

            <CategoryButton
                icon={<Trash size={24} color="var(--error)" />}
                description={
                    <Text id="app.settings.pages.account.manage.delete_description" />
                }
                action="chevron"
                onClick={callback("delete")}>
                <Text id="app.settings.pages.account.manage.delete" />
            </CategoryButton>
        </>
    );
}
