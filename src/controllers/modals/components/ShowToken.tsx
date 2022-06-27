import { Text } from "preact-i18n";

import { Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { ModalProps } from "../types";

export default function ShowToken({
    name,
    token,
    ...props
}: ModalProps<"show_token">) {
    return (
        <Modal
            {...props}
            title={
                <Text
                    id={"app.special.modals.token_reveal"}
                    fields={{ name }}
                />
            }
            actions={[
                {
                    onClick: noopTrue,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.close" />,
                },
            ]}>
            <code style={{ userSelect: "all", wordBreak: "break-all" }}>
                {token}
            </code>
        </Modal>
    );
}
