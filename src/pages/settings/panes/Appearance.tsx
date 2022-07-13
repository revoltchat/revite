import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import CollapsibleSection from "../../../components/common/CollapsibleSection";
import AdvancedOptions from "../../../components/settings/appearance/AdvancedOptions";
import AppearanceOptions from "../../../components/settings/appearance/AppearanceOptions";
import ChatOptions from "../../../components/settings/appearance/ChatOptions";
import ThemeOverrides from "../../../components/settings/appearance/ThemeOverrides";
import ThemeSelection from "../../../components/settings/appearance/ThemeSelection";

export const Appearance = observer(() => {
    return (
        <div className={styles.appearance}>
            <ThemeSelection />
            <hr />
            <AppearanceOptions />
            <hr />
            <ChatOptions />
            <hr />
            <CollapsibleSection
                defaultValue={false}
                id="settings_overrides"
                summary={<Text id="app.settings.pages.appearance.overrides" />}>
                <ThemeOverrides />
            </CollapsibleSection>
            <CollapsibleSection
                id="settings_advanced_appearance"
                defaultValue={false}
                summary={<Text id="app.settings.pages.appearance.advanced" />}>
                <AdvancedOptions />
            </CollapsibleSection>
        </div>
    );
});

// <DisplayCompactShim />
