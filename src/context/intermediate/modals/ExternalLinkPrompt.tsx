import { Text } from "preact-i18n";

import { dispatch } from "../../../redux";

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
                        window.open(link, "_blank", "noreferrer");
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
                {
                    onClick: () => {
                        try {
                            const url = new URL(link);
                            dispatch({
                                type: "TRUSTED_LINKS_ADD_DOMAIN",
                                domain: url.hostname,
                            });
                        } catch (e) {}
                        window.open(link, "_blank", "noreferrer");
                        onClose();
                    },
                    plain: true,
                    children: (
                        <Text id="app.special.modals.external_links.trust_domain" />
                    ),
                },
            ]}>
            <Text id="app.special.modals.external_links.short" /> <br />
            <a>{link}</a>
        </Modal>
    );
}
