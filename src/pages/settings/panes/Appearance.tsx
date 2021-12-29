import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import CollapsibleSection from "../../../components/common/CollapsibleSection";

import {
    ThemeBaseSelectorShim,
    ThemeShopShim,
    ThemeAccentShim,
    DisplayFontShim,
    DisplayMonospaceFontShim,
    DisplayLigaturesShim,
    DisplayEmojiShim,
    ThemeCustomCSSShim,
    DisplaySeasonalShim,
    DisplayTransparencyShim,
} from "../../../components/settings/AppearanceShims";
import ThemeOverrides from "../../../components/settings/appearance/ThemeOverrides";
import ThemeTools from "../../../components/settings/appearance/ThemeTools";

export const Appearance = observer(() => {
    return (
        <div className={styles.appearance}>
            <ThemeBaseSelectorShim />
            <ThemeShopShim />
            <hr />
            <ThemeAccentShim />
            <hr />
            <h3>
                <Text id="app.settings.pages.appearance.theme_options.title" />
            </h3>
            <DisplayTransparencyShim />
            <DisplaySeasonalShim />
            <hr />
            <DisplayFontShim />
            <DisplayLigaturesShim />
            <hr />
            <DisplayEmojiShim />
            <hr />
            <CollapsibleSection
                defaultValue={false}
                id="settings_overrides"
                summary={<Text id="app.settings.pages.appearance.overrides" />}>
                <ThemeTools />
                <h3>App</h3>
                <ThemeOverrides />
            </CollapsibleSection>
            <CollapsibleSection
                id="settings_advanced_appearance"
                defaultValue={false}
                summary={<Text id="app.settings.pages.appearance.advanced" />}>
                <DisplayMonospaceFontShim />
                <ThemeCustomCSSShim />
            </CollapsibleSection>
        </div>
    );
});

// <DisplayCompactShim />
