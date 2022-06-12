import styled from "styled-components";

import { Text } from "preact-i18n";
import { useCallback, useState } from "preact/hooks";

import { Modal } from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { modalController } from "..";
import { toConfig } from "../../../components/settings/account/MultiFactorAuthentication";
import { ModalProps } from "../types";

/**
 * List of recovery codes
 */
const List = styled.div`
    display: grid;
    text-align: center;
    grid-template-columns: 1fr 1fr;
    font-family: var(--monospace-font), monospace;

    span {
        user-select: text;
    }
`;

/**
 * Recovery codes modal
 */
export default function MFARecovery({
    codes,
    client,
    onClose,
}: ModalProps<"mfa_recovery">) {
    // Keep track of changes to recovery codes
    const [known, setCodes] = useState(codes);

    // Subroutine to reset recovery codes
    const reset = useCallback(async () => {
        const ticket = await modalController.mfaFlow(client);
        if (ticket) {
            const codes = await client.api.patch(
                "/auth/mfa/recovery",
                undefined,
                toConfig(ticket.token),
            );

            setCodes(codes);
        }

        return false;
    }, [client]);

    return (
        <Modal
            title={<Text id="app.special.modals.mfa.recovery_codes" />}
            description={<Text id="app.special.modals.mfa.save_codes" />}
            actions={[
                {
                    palette: "primary",
                    children: <Text id="app.special.modals.actions.done" />,
                    onClick: noopTrue,
                    confirmation: true,
                },
                {
                    palette: "plain",
                    children: <Text id="app.special.modals.actions.reset" />,
                    onClick: reset,
                },
            ]}
            onClose={onClose}>
            <List>
                {known.map((code) => (
                    <span key={code}>{code}</span>
                ))}
            </List>
        </Modal>
    );
}
