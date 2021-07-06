import { Text } from "preact-i18n";

import Modal from "../../../components/ui/Modal";

interface Props {
    onClose: () => void;
    error: string;
}

export function ErrorModal({ onClose, error }: Props) {
    return (
        <Modal
            visible={true}
            onClose={() => false}
            title={<Text id="app.special.modals.error" />}
            actions={[
                {
                    onClick: onClose,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.ok" />,
                },
                {
                    onClick: () => location.reload(),
                    children: <Text id="app.special.modals.actions.reload" />,
                },
            ]}>
            <Text id={`error.${error}`}>{error}</Text>
        </Modal>
    );
}
