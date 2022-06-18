import { Text } from "preact-i18n";
import { useCallback } from "preact/hooks";

import { Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { ModalProps } from "../types";

/**
 * Confirm whether a user wants to sign out of all other sessions
 */
export default function SignOutSessions(
    props: ModalProps<"sign_out_sessions">,
) {
    const onClick = useCallback(() => {
        props.onDeleting();
        props.client.api.delete("/auth/session/all").then(props.onDelete);
        return true;
    }, []);

    return (
        <Modal
            {...props}
            title={<Text id={"app.special.modals.sessions.title"} />}
            actions={[
                {
                    onClick: noopTrue,
                    palette: "accent",
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.back" />,
                },
                {
                    onClick,
                    confirmation: true,
                    children: <Text id="app.special.modals.sessions.accept" />,
                },
            ]}>
            <Text id="app.special.modals.sessions.short" /> <br />
        </Modal>
    );
}
