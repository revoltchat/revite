import { observer } from "mobx-react-lite";

import { Text } from "preact-i18n";

import { Column, ObservedInputElement } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

import { FONTS, Fonts, FONT_KEYS } from "../../../context/Theme";

import { EmojiSelector } from "./legacy/EmojiSelector";

/**
 * ! LEGACY
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

export default observer(() => {
    const settings = useApplicationState().settings;

    return (
        <>
            <Column>
                {/* Combo box of available fonts. */}
                <h3>
                    <Text id="app.settings.pages.appearance.font" />
                </h3>
                <ObservedInputElement
                    type="combo"
                    value={() => settings.theme.getFont()}
                    onChange={(value) => settings.theme.setFont(value as Fonts)}
                    options={FONT_KEYS.map((value) => ({
                        value,
                        name: FONTS[value as keyof typeof FONTS].name,
                    }))}
                />
                {/* Option to toggle liagures for supported fonts. */}
                {settings.theme.getFont() === "Inter" && (
                    <ObservedInputElement
                        type="checkbox"
                        value={() =>
                            settings.get("appearance:ligatures") ?? true
                        }
                        onChange={(v) =>
                            settings.set("appearance:ligatures", v)
                        }
                        title={
                            <Text id="app.settings.pages.appearance.ligatures" />
                        }
                        description={
                            <Text id="app.settings.pages.appearance.ligatures_desc" />
                        }
                    />
                )}
            </Column>
            <hr />
            {/* Emoji pack selector */}
            <ShimDisplayEmoji />
        </>
    );
});
