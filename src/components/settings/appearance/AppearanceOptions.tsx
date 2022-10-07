import { Text } from "preact-i18n";

import { Column, ObservedInputElement } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

export default function AppearanceOptions() {
    const settings = useApplicationState().settings;

    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.appearance_options.title" />
            </h3>
            {/* Option to toggle "send message" button on desktop. */}
            <ObservedInputElement
                type="checkbox"
                value={() =>
                    settings.get("appearance:show_send_button") ?? false
                }
                onChange={(v) => settings.set("appearance:show_send_button", v)}
                title={
                    <Text id="app.settings.pages.appearance.appearance_options.show_send" />
                }
                description={
                    <Text id="app.settings.pages.appearance.appearance_options.show_send_desc" />
                }
            />
            {/* Option to always show the account creation age next to join system messages. */}
            <ObservedInputElement
                type="checkbox"
                value={() =>
                    settings.get("appearance:show_account_age") ?? false
                }
                onChange={(v) => settings.set("appearance:show_account_age", v)}
                title={
                    <Text id="app.settings.pages.appearance.appearance_options.show_account_age" />
                }
                description={
                    <Text id="app.settings.pages.appearance.appearance_options.show_account_age_desc" />
                }
            />
            {/* Option to prevent being shown age gate. */}
            <ObservedInputElement
                type="checkbox"
                value={() =>
                    settings.get("appearance:bypass_age_gate") ?? false
                }
                onChange={(v) => settings.set("appearance:bypass_age_gate", v)}
                title={
                    <Text id="app.settings.pages.appearance.appearance_options.bypass_age_gate" />
                }
                description={
                    <Text id="app.settings.pages.appearance.appearance_options.bypass_age_gate_desc" />
                }
            />
            <hr />
            <h3>
                <Text id="app.settings.pages.appearance.theme_options.title" />
            </h3>
            <Column>
                {/* Option to toggle transparency effects in-app. */}
                <ObservedInputElement
                    type="checkbox"
                    value={() =>
                        settings.get("appearance:transparency") ?? true
                    }
                    onChange={(v) => settings.set("appearance:transparency", v)}
                    title={
                        <Text id="app.settings.pages.appearance.theme_options.transparency" />
                    }
                    description={
                        <Text id="app.settings.pages.appearance.theme_options.transparency_desc" />
                    }
                />
                {/* Option to toggle seasonal effects. */}
                <ObservedInputElement
                    type="checkbox"
                    value={() => settings.get("appearance:seasonal") ?? true}
                    onChange={(v) => settings.set("appearance:seasonal", v)}
                    title={
                        <Text id="app.settings.pages.appearance.theme_options.seasonal" />
                    }
                    description={
                        <Text id="app.settings.pages.appearance.theme_options.seasonal_desc" />
                    }
                />
            </Column>
        </>
    );
}
