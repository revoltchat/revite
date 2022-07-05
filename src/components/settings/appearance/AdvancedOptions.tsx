import { observer } from "mobx-react-lite";

import { Text } from "preact-i18n";

import { ObservedInputElement } from "@revoltchat/ui";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";

import { useApplicationState } from "../../../mobx/State";

import {
    MonospaceFonts,
    MONOSPACE_FONTS,
    MONOSPACE_FONT_KEYS,
} from "../../../context/Theme";

/**
 * ! LEGACY
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

export default function AdvancedOptions() {
    const settings = useApplicationState().settings;
    return (
        <>
            {/** Combo box of available monospaced fonts */}
            <h3>
                <Text id="app.settings.pages.appearance.mono_font" />
            </h3>
            <ObservedInputElement
                type="combo"
                value={() => settings.theme.getMonospaceFont()}
                onChange={(value) =>
                    settings.theme.setMonospaceFont(value as MonospaceFonts)
                }
                options={MONOSPACE_FONT_KEYS.map((value) => ({
                    value,
                    name: MONOSPACE_FONTS[value as keyof typeof MONOSPACE_FONTS]
                        .name,
                }))}
            />
            {/** Custom CSS */}
            <ShimThemeCustomCSS />
        </>
    );
}
