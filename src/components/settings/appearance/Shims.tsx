import { Brush } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
// @ts-expect-error shade-blend-color does not have typings.
import pSBC from "shade-blend-color";

import { Text } from "preact-i18n";

import {
    CategoryButton,
    Checkbox,
    ColourSwatches,
    ComboBox,
    Radio,
} from "@revoltchat/ui";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";

import { useApplicationState } from "../../../mobx/State";

import {
    Fonts,
    FONTS,
    FONT_KEYS,
    MonospaceFonts,
    MONOSPACE_FONTS,
    MONOSPACE_FONT_KEYS,
} from "../../../context/Theme";

import { EmojiSelector } from "./EmojiSelector";
import { ThemeBaseSelector } from "./ThemeBaseSelector";

/**
 * Component providing a way to switch the base theme being used.
 */
export const ShimThemeBaseSelector = observer(() => {
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
 */
export const ShimThemeShop = () => {
    return (
        <Link to="/discover/themes" replace>
            <CategoryButton
                icon={<Brush size={24} />}
                action="chevron"
                description={
                    <Text id="app.settings.pages.appearance.discover.description" />
                }>
                <Text id="app.settings.pages.appearance.discover.title" />
            </CategoryButton>
        </Link>
    );
};

/**
 * Component providing a way to change current accent colour.
 */
export const ShimThemeAccent = observer(() => {
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
export const ShimThemeCustomCSS = observer(() => {
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
export const ShimDisplayCompact = () => {
    // TODO: WIP feature
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.message_display" />
            </h3>
            <div /* className={styles.display} */>
                <Radio
                    title={
                        <Text id="app.settings.pages.appearance.display.default" />
                    }
                    description={
                        <Text id="app.settings.pages.appearance.display.default_description" />
                    }
                    value={true}
                />
                <Radio
                    title={
                        <Text id="app.settings.pages.appearance.display.compact" />
                    }
                    description={
                        <Text id="app.settings.pages.appearance.display.compact_description" />
                    }
                    value={false}
                    disabled
                />
            </div>
        </>
    );
};

/**
 * Component providing a way to change primary text font.
 */
export const ShimDisplayFont = observer(() => {
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
export const ShimDisplayMonospaceFont = observer(() => {
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
export const ShimDisplayLigatures = observer(() => {
    const settings = useApplicationState().settings;
    if (settings.theme.getFont() !== "Inter") return null;

    return (
        <>
            <Checkbox
                value={settings.get("appearance:ligatures") ?? false}
                onChange={(v) => settings.set("appearance:ligatures", v)}
                title={<Text id="app.settings.pages.appearance.ligatures" />}
                description={
                    <Text id="app.settings.pages.appearance.ligatures_desc" />
                }
            />
        </>
    );
});

/**
 * Component providing a way to toggle showing the send button on desktop.
 */
export const ShimShowSendButton = observer(() => {
    const settings = useApplicationState().settings;

    return (
        <Checkbox
            value={settings.get("appearance:show_send_button") ?? false}
            onChange={(v) => settings.set("appearance:show_send_button", v)}
            title={
                <Text id="app.settings.pages.appearance.appearance_options.show_send" />
            }
            description={
                <Text id="app.settings.pages.appearance.appearance_options.show_send_desc" />
            }
        />
    );
});

/**
 * Component providing a way to toggle seasonal themes.
 */
export const ShimDisplaySeasonal = observer(() => {
    const settings = useApplicationState().settings;

    return (
        <Checkbox
            value={settings.get("appearance:seasonal") ?? true}
            onChange={(v) => settings.set("appearance:seasonal", v)}
            title={
                <Text id="app.settings.pages.appearance.theme_options.seasonal" />
            }
            description={
                <Text id="app.settings.pages.appearance.theme_options.seasonal_desc" />
            }
        />
    );
});

/**
 * Component providing a way to toggle transparency effects.
 */
export const ShimDisplayTransparency = observer(() => {
    const settings = useApplicationState().settings;

    return (
        <Checkbox
            value={settings.get("appearance:transparency") ?? true}
            onChange={(v) => settings.set("appearance:transparency", v)}
            title={
                <Text id="app.settings.pages.appearance.theme_options.transparency" />
            }
            description={
                <Text id="app.settings.pages.appearance.theme_options.transparency_desc" />
            }
        />
    );
});

/**
 * Component providing a way to change emoji pack.
 */
export const ShimDisplayEmoji = observer(() => {
    const settings = useApplicationState().settings;
    return (
        <EmojiSelector
            value={settings.get("appearance:emoji")}
            setValue={(v) => settings.set("appearance:emoji", v)}
        />
    );
});
