import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { TextReact } from "../../../lib/i18n";

import { ModalProps } from "../types";

/**
 * Confirmation modal
 */
export default function ConfirmLeave(
    props: ModalProps<"leave_group" | "leave_server">,
) {
    const name = props.target.name;

    return (
        <ModalForm
            {...props}
            title={
                <Text
                    id={`app.special.modals.prompt.confirm_leave`}
                    fields={{ name }}
                />
            }
            description={
                <TextReact
                    id={`app.special.modals.prompt.confirm_leave_long`}
                    fields={{ name: <b>{name}</b> }}
                />
            }
            data={{
                silently_leave: {
                    title: <Text id="app.special.modals.prompt.silent_leave" />,
                    description: (
                        <Text id="app.special.modals.prompt.members_not_notified" />
                    ),
                },
            }}
            schema={{
                silently_leave: "checkbox",
            }}
            callback={({ silently_leave }) =>
                props.target.delete(silently_leave)
            }
            submit={{
                palette: "error",
                children: <Text id="app.special.modals.actions.leave" />,
            }}
        />
    );
}
