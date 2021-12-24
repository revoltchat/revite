import { Store } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
// @ts-expect-error shade-blend-color does not have typings.
import pSBC from "shade-blend-color";

import { Text } from "preact-i18n";

import TextAreaAutoSize from "../../lib/TextAreaAutoSize";

import { useApplicationState } from "../../mobx/State";

import {
    Fonts,
    FONTS,
    FONT_KEYS,
    MonospaceFonts,
    MONOSPACE_FONTS,
    MONOSPACE_FONT_KEYS,
} from "../../context/Theme";

import Checkbox from "../ui/Checkbox";
import ColourSwatches from "../ui/ColourSwatches";
import ComboBox from "../ui/ComboBox";
import Radio from "../ui/Radio";
import CategoryButton from "../ui/fluent/CategoryButton";

import { EmojiSelector } from "./appearance/EmojiSelector";
import { ThemeBaseSelector } from "./appearance/ThemeBaseSelector";

/**
 * Component providing a way to switch the base theme being used.
 */
export const ThemeBaseSelectorShim = observer(() => {
    const theme = useApplicationState().settings.theme;
    return (
        <ThemeBaseSelector
            value={theme.isModified() ? undefined : theme.getBase()}
            setValue={(base) => {
                theme.setBase(base);
                theme.reset();
            }}
        />
    );
});

/**
 * Component providing a link to the theme shop.
 * Only appears if experiment is enabled.
 * TODO: stabilise
 */
export const ThemeShopShim = () => {
    if (!useApplicationState().experiments.isEnabled("theme_shop")) return null;

    return (
        <Link to="/settings/theme_shop" replace>
            <CategoryButton
                icon={<Store size={24} />}
                action="chevron"
                description={"Browse themes made by the community"}
                hover>
                <Text id="app.settings.pages.theme_shop.title" />
            </CategoryButton>
        </Link>
    );
};

/**
 * Component providing a way to change current accent colour.
 */
export const ThemeAccentShim = observer(() => {
    const theme = useApplicationState().settings.theme;
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.accent_selector" />
            </h3>
            <ColourSwatches
                value={theme.getVariable("accent")}
                onChange={(colour) => {
                    theme.setVariable("accent", colour as string);
                    theme.setVariable("scrollbar-thumb", pSBC(-0.2, colour));
                }}
            />
        </>
    );
});

/**
 * Component providing a way to edit custom CSS.
 */
export const ThemeCustomCSSShim = observer(() => {
    const theme = useApplicationState().settings.theme;
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.custom_css" />
            </h3>
            <TextAreaAutoSize
                maxRows={20}
                minHeight={480}
                code
                value={theme.getCSS() ?? ""}
                onChange={(ev) => theme.setCSS(ev.currentTarget.value)}
            />
        </>
    );
});

/**
 * Component providing a way to switch between compact and normal message view.
 */
export const DisplayCompactShim = () => {
    // TODO: WIP feature
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.message_display" />
            </h3>
            <div /* className={styles.display} */>
                <Radio
                    description={
                        <Text id="app.settings.pages.appearance.display.default_description" />
                    }
                    checked>
                    <Text id="app.settings.pages.appearance.display.default" />
                </Radio>
                <Radio
                    description={
                        <Text id="app.settings.pages.appearance.display.compact_description" />
                    }
                    disabled>
                    <Text id="app.settings.pages.appearance.display.compact" />
                </Radio>
            </div>
        </>
    );
};

/**
 * Component providing a way to change primary text font.
 */
export const DisplayFontShim = observer(() => {
    const theme = useApplicationState().settings.theme;
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.font" />
            </h3>
            <ComboBox
                value={theme.getFont()}
                onChange={(e) => theme.setFont(e.currentTarget.value as Fonts)}>
                {FONT_KEYS.map((key) => (
                    <option value={key} key={key}>
                        {FONTS[key as keyof typeof FONTS].name}
                    </option>
                ))}
            </ComboBox>
        </>
    );
});

/**
 * Component providing a way to change secondary, monospace text font.
 */
export const DisplayMonospaceFontShim = observer(() => {
    const theme = useApplicationState().settings.theme;
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.mono_font" />
            </h3>
            <ComboBox
                value={theme.getMonospaceFont()}
                onChange={(e) =>
                    theme.setMonospaceFont(
                        e.currentTarget.value as MonospaceFonts,
                    )
                }>
                {MONOSPACE_FONT_KEYS.map((key) => (
                    <option value={key} key={key}>
                        {
                            MONOSPACE_FONTS[key as keyof typeof MONOSPACE_FONTS]
                                .name
                        }
                    </option>
                ))}
            </ComboBox>
        </>
    );
});

/**
 * Component providing a way to toggle font ligatures.
 */
export const DisplayLigaturesShim = observer(() => {
    const settings = useApplicationState().settings;
    if (settings.theme.getFont() !== "Inter") return null;

    return (
        <>
            <Checkbox
                checked={settings.get("appearance:ligatures") ?? false}
                onChange={(v) => settings.set("appearance:ligatures", v)}
                description={
                    <Text id="app.settings.pages.appearance.ligatures_desc" />
                }>
                <Text id="app.settings.pages.appearance.ligatures" />
            </Checkbox>
        </>
    );
});

/**
 * Component providing a way to toggle seasonal themes.
 */
export const DisplaySeasonalShim = observer(() => {
    const settings = useApplicationState().settings;

    return (
        <>
            <h3>Theme Options</h3>
            <Checkbox
                checked={settings.get("appearance:seasonal") ?? true}
                onChange={(v) => settings.set("appearance:seasonal", v)}
                description="Displays effects in the home tab during holiday seasons.">
                Seasonal theme
            </Checkbox>
        </>
    );
});

/**
 * Component providing a way to change emoji pack.
 */
export const DisplayEmojiShim = observer(() => {
    const settings = useApplicationState().settings;
    return (
        <EmojiSelector
            value={settings.get("appearance:emoji")}
            setValue={(v) => settings.set("appearance:emoji", v)}
        />
    );
});
