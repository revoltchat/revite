import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { Column } from "@revoltchat/ui";

import CollapsibleSection from "../../../components/common/CollapsibleSection";
import {
    ShimThemeBaseSelector,
    ShimThemeShop,
    ShimThemeAccent,
    ShimDisplayFont,
    ShimDisplayMonospaceFont,
    ShimDisplayLigatures,
    ShimDisplayEmoji,
    ShimThemeCustomCSS,
    ShimDisplaySeasonal,
    ShimDisplayTransparency,
    ShimShowSendButton,
} from "../../../components/settings/appearance/Shims";
import ThemeOverrides from "../../../components/settings/appearance/ThemeOverrides";
import ThemeTools from "../../../components/settings/appearance/ThemeTools";

export const Appearance = observer(() => {
    return (
        <div className={styles.appearance}>
            <ShimThemeBaseSelector />
            <ShimThemeShop />
            <hr />
            <ShimThemeAccent />
            <hr />
            <h3>
                <Text id="app.settings.pages.appearance.appearance_options.title" />
            </h3>
            <ShimShowSendButton />
            <hr />
            <h3>
                <Text id="app.settings.pages.appearance.theme_options.title" />
            </h3>
            <Column>
                <ShimDisplayTransparency />
                <ShimDisplaySeasonal />
            </Column>
            <hr />
            <ShimDisplayFont />
            <ShimDisplayLigatures />
            <hr />
            <ShimDisplayEmoji />
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
                <ShimDisplayMonospaceFont />
                <ShimThemeCustomCSS />
            </CollapsibleSection>
        </div>
    );
});

// <DisplayCompactShim />
