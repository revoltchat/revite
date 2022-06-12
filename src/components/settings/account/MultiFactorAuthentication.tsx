import { Lock } from "@styled-icons/boxicons-solid";

import { Text } from "preact-i18n";

import { CategoryButton } from "@revoltchat/ui";

export default function MultiFactorAuthentication() {
    return (
        <>
            <h3>
                <Text id="app.settings.pages.account.2fa.title" />
            </h3>
            <h5>
                {/*<Text id="app.settings.pages.account.2fa.description" />*/}
                Two-factor authentication is currently in-development, see{" "}
                <a href="https://github.com/revoltchat/revite/issues/675">
                    tracking issue here
                </a>
                .
            </h5>
            <CategoryButton
                icon={<Lock size={24} color="var(--error)" />}
                description={"Set up 2FA on your account."}
                disabled
                action={<Text id="general.unavailable" />}>
                Set up Two-factor authentication
            </CategoryButton>
            {/*<CategoryButton
                icon={<ListOl size={24} />}
                description={"View and download your 2FA backup codes."}
                disabled
                action="chevron">
                View my backup codes
            </CategoryButton>*/}
        </>
    );
}
