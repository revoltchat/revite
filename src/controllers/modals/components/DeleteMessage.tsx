import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import Message from "../../../components/common/messaging/Message";
import { ModalProps } from "../types";

/**
 * Delete message modal
 */
export default function DeleteMessage({
    target,
    ...props
}: ModalProps<"delete_message">) {
    return (
        <ModalForm
            {...props}
            title={<Text id={"app.context_menu.delete_message"} />}
            description={
                <Text
                    id={`app.special.modals.prompt.confirm_delete_message_long`}
                />
            }
            schema={{
                message: "custom",
            }}
            data={{
                message: {
                    element: <Message message={target} head={true} contrast />,
                },
            }}
            callback={() => target.delete()}
            submit={{
                palette: "error",
                children: <Text id="app.special.modals.actions.delete" />,
            }}
        />
    );
}
