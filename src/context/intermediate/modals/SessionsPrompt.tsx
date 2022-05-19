import { Text } from "preact-i18n";

import Modal from "../../../components/ui/Modal";

interface Props {
    onClose: () => void;
    confirm: () => void;
}

export function SessionsModal({ onClose, confirm}: Props) {
    return (
        <Modal
        visible={true}
        onClose={onClose}
        title={<Text id={"app.special.modals.sessions.title"} />}
        actions={[
            {
                onClick: () => {
                    onClose()
                },
                confirmation: true,
                contrast: true,
                accent: true,
                children: <Text id="app.special.modals.actions.back"/>
            },
            {
                onClick: () => {
                    confirm()
                    onClose()
                },
                confirmation: true,
                children: <Text id="app.special.modals.sessions.accept"/>
            }
        ]}>
        <Text id="app.special.modals.sessions.short" /> <br />
        </Modal>
    )   
} 