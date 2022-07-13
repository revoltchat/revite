import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { useClient } from "../../client/ClientController";
import { mapError } from "../../client/jsx/error";
import { ModalProps } from "../types";

/**
 * Bot creation modal
 */
export default function CreateBot({
    onCreate,
    ...props
}: ModalProps<"create_bot">) {
    const client = useClient();

    return (
        <ModalForm
            {...props}
            title={<Text id="app.special.popovers.create_bot.title" />}
            schema={{
                name: "text",
            }}
            data={{
                name: {
                    field: (<Text id="login.username" />) as React.ReactChild,
                },
            }}
            callback={async ({ name }) => {
                const { bot } = await client.bots
                    .create({ name })
                    .catch(mapError);

                onCreate(bot);
            }}
            submit={{
                children: <Text id="app.special.modals.actions.create" />,
            }}
        />
    );
}
