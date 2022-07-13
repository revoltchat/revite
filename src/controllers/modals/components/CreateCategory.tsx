import { ulid } from "ulid";

import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { ModalProps } from "../types";

/**
 * Category creation modal
 */
export default function CreateCategory({
    target,
    ...props
}: ModalProps<"create_category">) {
    return (
        <ModalForm
            {...props}
            title={<Text id="app.context_menu.create_category" />}
            schema={{
                name: "text",
            }}
            data={{
                name: {
                    field: (
                        <Text id="app.main.servers.channel_name" />
                    ) as React.ReactChild,
                },
            }}
            callback={async ({ name }) => {
                await target.edit({
                    categories: [
                        ...(target.categories ?? []),
                        {
                            id: ulid(),
                            title: name,
                            channels: [],
                        },
                    ],
                });
            }}
            submit={{
                children: <Text id="app.special.modals.actions.create" />,
            }}
        />
    );
}
