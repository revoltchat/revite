import { Text } from "preact-i18n";

import { Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { useApplicationState } from "../../../mobx/State";

import { ModalProps } from "../types";

export default function LinkWarning({
    link,
    callback,
    ...props
}: ModalProps<"link_warning">) {
    const settings = useApplicationState().settings;

    return (
        <Modal
            {...props}
            title={<Text id={"app.special.modals.external_links.title"} />}
            actions={[
                {
                    onClick: callback,
                    confirmation: true,
                    palette: "accent",
                    children: "Continue",
                },
                {
                    onClick: noopTrue,
                    confirmation: false,
                    children: "Cancel",
                },
                {
                    onClick: () => {
                        try {
                            const url = new URL(link);
                            settings.security.addTrustedOrigin(url.hostname);
                        } catch (e) {}

                        return callback();
                    },
                    palette: "plain",
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
