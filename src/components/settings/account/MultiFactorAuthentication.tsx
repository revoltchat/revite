import { ListOl } from "@styled-icons/boxicons-regular";
import { Lock } from "@styled-icons/boxicons-solid";
import { API } from "revolt.js";

import { Text } from "preact-i18n";
import { useCallback, useEffect, useState } from "preact/hooks";

import { Category, CategoryButton, Error, Tip } from "@revoltchat/ui";

import { useSession } from "../../../controllers/client/ClientController";
import { takeError } from "../../../controllers/client/jsx/error";
import { modalController } from "../../../controllers/modals/ModalController";

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
    const session = useSession()!;
    const client = session.client!;

    // Keep track of MFA state
    const [mfa, setMFA] = useState<API.MultiFactorStatus>();
    const [error, setError] = useState<string>();

    // Fetch the current MFA status on account
    useEffect(() => {
        if (!mfa && session.state === "Online") {
            client!.api
                .get("/auth/mfa/")
                .then(setMFA)
                .catch((err) => setError(takeError(err)));
        }
    }, [mfa, client, session.state]);

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
            await client.api.delete(
                "/auth/mfa/totp",
                {},
                toConfig(ticket.token),
            );

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

            {error && (
                <Category compact>
                    <Error error={error} />
                </Category>
            )}

            <CategoryButton
                icon={<ListOl size={24} />}
                description={
                    <Text
                        id={`app.settings.pages.account.2fa.${
                            mfa?.recovery_active
                                ? "view_recovery"
                                : "generate_recovery"
                        }_long`}
                    />
                }
                disabled={!mfa}
                onClick={recoveryAction}>
                <Text
                    id={`app.settings.pages.account.2fa.${
                        mfa?.recovery_active
                            ? "view_recovery"
                            : "generate_recovery"
                    }`}
                />
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
                <Text
                    id={`app.settings.pages.account.2fa.${
                        mfa?.totp_mfa ? "remove" : "add"
                    }_auth`}
                />
            </CategoryButton>

            {mfa && (
                <Tip palette={mfaActive ? "primary" : "error"}>
                    <Text
                        id={`app.settings.pages.account.2fa.two_factor_${
                            mfaActive ? "on" : "off"
                        }`}
                    />
                </Tip>
            )}
        </>
    );
}
