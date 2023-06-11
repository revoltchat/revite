import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { useClient } from "../../client/ClientController";
import { ModalProps } from "../types";

/**
 * Modify display name modal
 */
export default function ModifyDisplayname({
    ...props
}: ModalProps<"modify_displayname">) {
    const client = useClient();

    return (
        <ModalForm
            {...props}
            title="Update display name"
            schema={{
                display_name: "text",
            }}
            defaults={{
                display_name: (
                    client.user as unknown as { display_name: string }
                )?.display_name as string,
            }}
            data={{
                display_name: {
                    field: "Display Name",
                },
            }}
            callback={({ display_name }) =>
                display_name && display_name !== client.user!.username
                    ? client.users.edit({
                          display_name,
                      } as never)
                    : client.users.edit({
                          remove: ["DisplayName"],
                      } as never)
            }
            submit={{
                children: <Text id="app.special.modals.actions.save" />,
            }}
        />
    );
}
