import { Text } from "preact-i18n";

import { useTranslation } from "../../../lib/i18n";

import { useApplicationState } from "../../../mobx/State";

import Modal from "../../../components/ui/Modal";

import { useIntermediate } from "../Intermediate";

interface Props {
    onClose: () => void;
    link: string;
}

export function ExternalLinkModal({ onClose, link }: Props) {
    const { openLink } = useIntermediate();
    const settings = useApplicationState().settings;
    const translate = useTranslation();

    return (
        <Modal
            visible={true}
            onClose={onClose}
            title={<Text id={"app.special.modals.external_links.title"} />}
            actions={[
                {
                    onClick: () => {
                        openLink(link, true);
                        onClose();
                    },
                    confirmation: true,
                    contrast: true,
                    accent: true,
                    children: translate("app.special.modals.actions.continue"),
                },
                {
                    onClick: onClose,
                    confirmation: false,
                    children: translate("app.special.modals.actions.cancel"),
                },
                {
                    onClick: () => {
                        try {
                            const url = new URL(link);
                            settings.security.addTrustedOrigin(url.hostname);
                        } catch (e) {}

                        openLink(link, true);
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
