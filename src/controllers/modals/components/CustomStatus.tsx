import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { useClient } from "../../client/ClientController";
import { ModalProps } from "../types";

/**
 * Custom status modal
 */
export default function CustomStatus({
    ...props
}: ModalProps<"custom_status">) {
    const client = useClient();

    return (
        <ModalForm
            {...props}
            title={<Text id="app.context_menu.set_custom_status" />}
            schema={{
                text: "text",
            }}
            defaults={{
                text: client.user?.status?.text as string,
            }}
            data={{
                text: {
                    field: (
                        <Text id="app.context_menu.custom_status" />
                    ) as React.ReactChild,
                },
            }}
            callback={({ text }) =>
                client.users.edit({
                    status: {
                        ...client.user?.status,
                        text: text.trim().length > 0 ? text : undefined,
                    },
                })
            }
            submit={{
                children: <Text id="app.special.modals.actions.save" />,
            }}
        />
    );
}
