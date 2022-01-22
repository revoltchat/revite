import { Text } from "preact-i18n";

import { useApplicationState } from "../../../mobx/State";

import { ModalBound } from "../../../components/util/ModalBound";
import { useIntermediate } from "../Intermediate";

interface Props {
    onClose: () => void;
    link: string;
}

export function ExternalLinkModal({ onClose, link }: Props) {
    const { openLink } = useIntermediate();
    const settings = useApplicationState().settings;

    return (
        <ModalBound
            onClose={onClose}
            title={<Text id={"app.special.modals.external_links.title"} />}
            actions={[
                {
                    onClick: () => {
                        openLink(link, true);
                        onClose();
                    },
                    confirmation: true,
                    palette: "accent",
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
                            settings.security.addTrustedOrigin(url.hostname);
                        } catch (e) {}

                        openLink(link, true);
                        onClose();
                    },
                    palette: "plain",
                    children: (
                        <Text id="app.special.modals.external_links.trust_domain" />
                    ),
                },
            ]}>
            <Text id="app.special.modals.external_links.short" /> <br />
            <a>{link}</a>
        </ModalBound>
    );
}
