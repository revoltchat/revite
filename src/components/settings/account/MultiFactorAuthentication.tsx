import { ListOl } from "@styled-icons/boxicons-regular";
import { Lock } from "@styled-icons/boxicons-solid";
import { API } from "revolt.js";

import { Text } from "preact-i18n";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";

import { CategoryButton, Tip } from "@revoltchat/ui";

import { modalController } from "../../../context/modals";
import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

/**
 * Temporary helper function for Axios config
 * @param token Token
 * @returns Headers
 */
export function toConfig(token: string) {
    return {
        headers: {
            "X-MFA-Ticket": token,
        },
    };
}

/**
 * Component for configuring MFA on an account.
 */
export default function MultiFactorAuthentication() {
    // Pull in prerequisites
    const client = useClient();
    const status = useContext(StatusContext);

    // Keep track of MFA state
    const [mfa, setMFA] = useState<API.MultiFactorStatus>();

    // Fetch the current MFA status on account
    useEffect(() => {
        if (!mfa && status === ClientStatus.ONLINE) {
            client.api.get("/auth/mfa/").then(setMFA);
        }
    }, [client, mfa, status]);

    // Action called when recovery code button is pressed
    const recoveryAction = useCallback(async () => {
        // Perform MFA flow first
        const ticket = await modalController.mfaFlow(client);

        // Check whether action was cancelled
        if (typeof ticket === "undefined") {
            return;
        }

        // Decide whether to generate or fetch.
        let codes;
        if (mfa!.recovery_active) {
            // Fetch existing recovery codes
            codes = await client.api.post(
                "/auth/mfa/recovery",
                undefined,
                toConfig(ticket.token),
            );
        } else {
            // Generate new recovery codes
            codes = await client.api.patch(
                "/auth/mfa/recovery",
                undefined,
                toConfig(ticket.token),
            );

            setMFA({
                ...mfa!,
                recovery_active: true,
            });
        }

        // Display the codes to the user
        modalController.push({
            type: "mfa_recovery",
            client,
            codes,
        });
    }, [mfa]);

    // Action called when TOTP button is pressed
    const totpAction = useCallback(async () => {
        // Perform MFA flow first
        const ticket = await modalController.mfaFlow(client);

        // Check whether action was cancelled
        if (typeof ticket === "undefined") {
            return;
        }

        // Decide whether to disable or enable.
        if (mfa!.totp_mfa) {
            // Disable TOTP authentication
            await client.api.delete("/auth/mfa/totp", toConfig(ticket.token));

            setMFA({
                ...mfa!,
                totp_mfa: false,
            });
        } else {
            // Generate a TOTP secret
            const { secret } = await client.api.post(
                "/auth/mfa/totp",
                undefined,
                toConfig(ticket.token),
            );

            // Open secret modal
            let success;
            while (!success) {
                try {
                    // Make the user generator a token
                    const totp_code = await modalController.mfaEnableTOTP(
                        secret,
                        client.user!.username,
                    );

                    if (totp_code) {
                        // Check whether it is valid
                        await client.api.put(
                            "/auth/mfa/totp",
                            {
                                totp_code,
                            },
                            toConfig(ticket.token),
                        );

                        // Mark as successful and activated
                        success = true;

                        setMFA({
                            ...mfa!,
                            totp_mfa: true,
                        });
                    } else {
                        break;
                    }
                } catch (err) {}
            }
        }
    }, [mfa]);

    const mfaActive = !!mfa?.totp_mfa;

    return (
        <>
            <h3>
                <Text id="app.settings.pages.account.2fa.title" />
            </h3>
            <h5>
                <Text id="app.settings.pages.account.2fa.description" />
            </h5>

            <CategoryButton
                icon={<ListOl size={24} />}
                description={
                    mfa?.recovery_active
                        ? "View and download your 2FA backup codes."
                        : "Get ready to use 2FA by setting up a recovery method."
                }
                disabled={!mfa}
                onClick={recoveryAction}>
                {mfa?.recovery_active
                    ? "View Backup Codes"
                    : "Generate Recovery Codes"}
            </CategoryButton>
            <CategoryButton
                icon={
                    <Lock
                        size={24}
                        color={!mfa?.totp_mfa ? "var(--error)" : undefined}
                    />
                }
                description={"Set up time-based one-time password."}
                disabled={!mfa || (!mfa.recovery_active && !mfa.totp_mfa)}
                onClick={totpAction}>
                {mfa?.totp_mfa ? "Disable" : "Enable"} Authenticator App
            </CategoryButton>

            {mfa && (
                <Tip palette={mfaActive ? "primary" : "error"}>
                    {mfaActive
                        ? "Two-factor authentication is currently on!"
                        : "Two-factor authentication is currently off!"}
                </Tip>
            )}
        </>
    );
}
