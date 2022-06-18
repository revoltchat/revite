import { Text } from "preact-i18n";

import { Modal } from "@revoltchat/ui";

import { noop, noopTrue } from "../../../lib/js";

import { APP_VERSION } from "../../../version";
import { ModalProps } from "../types";

/**
 * Out-of-date indicator which instructs users
 * that their client needs to be updated
 */
export default function OutOfDate({
    onClose,
    version,
}: ModalProps<"out_of_date">) {
    return (
        <Modal
            title={<Text id="app.special.modals.out_of_date.title" />}
            description={
                <>
                    <Text id="app.special.modals.out_of_date.description" />
                    <br />
                    <Text
                        id="app.special.modals.out_of_date.version"
                        fields={{ client: APP_VERSION, server: version }}
                    />
                </>
            }
            actions={[
                {
                    palette: "plain",
                    onClick: noop,
                    children: (
                        <Text id="app.special.modals.out_of_date.attempting" />
                    ),
                },
                {
                    palette: "plain-secondary",
                    onClick: noopTrue,
                    children: (
                        <Text id="app.special.modals.out_of_date.ignore" />
                    ),
                },
            ]}
            onClose={onClose}
            nonDismissable
        />
    );
}
