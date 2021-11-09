import styled from "styled-components";

import { Text } from "preact-i18n";

import { useApplicationState } from "../../../mobx/State";

import Modal from "../../../components/ui/Modal";

import { useIntermediate } from "../Intermediate";

const UrlText = styled.div`
    overflow-y: scroll;
    max-height: calc(100vh - 250px);
    word-break: break-all;
`;

interface Props {
    onClose: () => void;
    link: string;
}

export function ExternalLinkModal({ onClose, link }: Props) {
    const { openLink } = useIntermediate();
    const settings = useApplicationState().settings;

    return (
        <Modal
            visible={true}
            onClose={onClose}
            title={<Text id={"app.special.modals.external_links.title"} />}
            limitWidth={true}
            actions={[
                {
                    onClick: () => {
                        openLink(link, true);
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
            <h4>
                <Text id="app.special.modals.external_links.short" /> <br />
            </h4>
            <UrlText>
                <a>{link}</a>
            </UrlText>
        </Modal>
    );
}
