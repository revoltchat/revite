import { ListOl } from "@styled-icons/boxicons-regular";
import { Lock } from "@styled-icons/boxicons-solid";
import { API } from "revolt.js";

import { Text } from "preact-i18n";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";

import { CategoryButton, Column, Preloader } from "@revoltchat/ui";

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
        const { token } = await modalController.mfaFlow(client);

        // Decide whether to generate or fetch.
        let codes;
        if (mfa!.recovery_active) {
            codes = await client.api.post(
                "/auth/mfa/recovery",
                undefined,
                toConfig(token),
            );
        } else {
            codes = await client.api.patch(
                "/auth/mfa/recovery",
                undefined,
                toConfig(token),
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
                    ? "View backup codes"
                    : "Generate recovery codes"}
            </CategoryButton>

            {JSON.stringify(mfa, undefined, 4)}
        </>
    );
}

/*<CategoryButton
    icon={<Lock size={24} color="var(--error)" />}
    description={"Set up 2FA on your account."}
    disabled
    action={<Text id="general.unavailable" />}>
    Set up Two-factor authentication
</CategoryButton>*/
/*<CategoryButton
    icon={<ListOl size={24} />}
    description={"View and download your 2FA backup codes."}
    disabled
    action="chevron">
    View my backup codes
</CategoryButton>*/
