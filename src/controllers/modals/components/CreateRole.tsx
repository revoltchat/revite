import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { ModalProps } from "../types";

/**
 * Role creation modal
 */
export default function CreateRole({
    server,
    callback,
    ...props
}: ModalProps<"create_role">) {
    return (
        <ModalForm
            {...props}
            title={<Text id="app.settings.permissions.create_role" />}
            schema={{
                name: "text",
            }}
            data={{
                name: {
                    field: (
                        <Text id="app.settings.permissions.role_name" />
                    ) as React.ReactChild,
                },
            }}
            callback={async ({ name }) => {
                const role = await server.createRole(name);
                callback(role.id);
            }}
            submit={{
                children: <Text id="app.special.modals.actions.create" />,
            }}
        />
    );
}
