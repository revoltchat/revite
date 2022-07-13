import { Text } from "preact-i18n";

import { Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { ModalProps } from "../types";

export default function Clipboard({ text, ...props }: ModalProps<"clipboard">) {
    return (
        <Modal
            {...props}
            title={<Text id="app.special.modals.clipboard.unavailable" />}
            description={
                location.protocol !== "https:" ? (
                    <Text id="app.special.modals.clipboard.https" />
                ) : undefined
            }
            actions={[
                {
                    onClick: noopTrue,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.close" />,
                },
            ]}>
            <Text id="app.special.modals.clipboard.copy" />{" "}
            <code style={{ userSelect: "all", wordBreak: "break-all" }}>
                {text}
            </code>
        </Modal>
    );
}
