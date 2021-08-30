import { Text } from "preact-i18n";

import Modal from "../../../components/ui/Modal";

interface Props {
    onClose: () => void;
    link: string;
}

export function ExternalLinkModal({ onClose, link }: Props) {
    return (
        <Modal
            visible={true}
            onClose={onClose}
            title={<Text id={"app.special.modals.external_links.title"} />}
            actions={[
                {
                    onClick: () => {
                        window.open(link, "_blank");
                        onClose();
                    },
                    confirmation: true,
                    contrast: true,
                    accent: true,
                    children: "Continue",
                },
                {
                    onClick: onClose,
                    confirmation: false,
                    children: "Cancel",
                },
            ]}>
            <Text id={"app.special.modals.external_links.short"} /> <br />
            <a>{link}</a>
        </Modal>
    );
}
