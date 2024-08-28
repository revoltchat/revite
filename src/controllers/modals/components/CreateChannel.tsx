import { useHistory } from "react-router-dom";

import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { ModalProps } from "../types";

/**
 * Channel creation modal
 */
export default function CreateChannel({
    cb,
    target,
    ...props
}: ModalProps<"create_channel">) {
    const history = useHistory();

    return (
        <ModalForm
            {...props}
            title={<Text id="app.context_menu.create_channel" />}
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
                const channel = await target.createChannel({
					type: "Text",
                    name,
                });

                if (cb) {
                    cb(channel as any);
                } else {
                    history.push(
                        `/server/${target._id}/channel/${channel._id}`,
                    );
                }
            }}
            submit={{
                children: <Text id="app.special.modals.actions.create" />,
            }}
        />
    );
}
