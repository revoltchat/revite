import { Text } from "preact-i18n";

import { ModalBound } from "../../../components/util/ModalBound";

interface Props {
    onClose: () => void;
    token: string;
    username: string;
}

export function TokenRevealModal({ onClose, token, username }: Props) {
    return (
        <ModalBound
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
        </ModalBound>
    );
}
