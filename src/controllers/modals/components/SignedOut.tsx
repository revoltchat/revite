import { Text } from "preact-i18n";

import { Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { ModalProps } from "../types";

/**
 * Indicate that the user has been signed out of their account
 */
export default function SignedOut(props: ModalProps<"signed_out">) {
    return (
        <Modal
            {...props}
            title={<Text id="app.special.modals.signed_out" />}
            actions={[
                {
                    onClick: noopTrue,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.ok" />,
                },
            ]}
        />
    );
}
