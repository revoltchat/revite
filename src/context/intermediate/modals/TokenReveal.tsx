import { Text } from "preact-i18n";

import { Modal } from "@revoltchat/ui";

interface Props {
    onClose: () => void;
    token: string;
    username: string;
}

export function TokenRevealModal({ onClose, token, username }: Props) {
    return (
        <Modal
            onClose={onClose}
            title={
                <Text
                    id={"app.special.modals.token_reveal"}
                    fields={{ name: username }}
                />
            }
            actions={[
                {
                    onClick: onClose,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.close" />,
                },
            ]}>
            <code style={{ userSelect: "all" }}>{token}</code>
        </Modal>
    );
}
