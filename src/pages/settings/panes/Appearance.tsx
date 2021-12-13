import { Reset, Import } from "@styled-icons/boxicons-regular";
import { Pencil } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
// @ts-expect-error shade-blend-color does not have typings.
import pSBC from "shade-blend-color";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useCallback, useEffect, useState } from "preact/hooks";

import { debounce } from "../../../lib/debounce";

import { useApplicationState } from "../../../mobx/State";
import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";
import { EmojiPacks, Settings } from "../../../redux/reducers/settings";

import { Theme, ThemeOptions } from "../../../context/Theme";
import { useIntermediate } from "../../../context/intermediate/Intermediate";

import CollapsibleSection from "../../../components/common/CollapsibleSection";
import Tooltip from "../../../components/common/Tooltip";
import Button from "../../../components/ui/Button";
import InputBox from "../../../components/ui/InputBox";

import {
    ThemeBaseSelectorShim,
    ThemeShopShim,
    ThemeAccentShim,
    DisplayCompactShim,
    DisplayFontShim,
    DisplayMonospaceFontShim,
    DisplayLigaturesShim,
    DisplayEmojiShim,
    ThemeCustomCSSShim,
} from "../../../components/settings/AppearanceShims";

interface Props {
    settings: Settings;
}

// ! FIXME: code needs to be rewritten to fix jittering
export const Component = observer((props: Props) => {
    //const theme = useApplicationState().settings.theme;
    const { writeClipboard, openScreen } = useIntermediate();

    /*function setTheme(theme: ThemeOptions) {
        dispatch({
            type: "SETTINGS_SET_THEME",
            theme,
        });
    }

    const pushOverride = useCallback((custom: Partial<Theme>) => {
        dispatch({
            type: "SETTINGS_SET_THEME_OVERRIDE",
            custom,
        });
    }, []);

    function setAccent(accent: string) {
        setOverride({
            accent,
            "scrollbar-thumb": pSBC(-0.2, accent),
        });
    }

    const emojiPack = props.settings.appearance?.emojiPack ?? "mutant";
    function setEmojiPack(emojiPack: EmojiPacks) {
        dispatch({
            type: "SETTINGS_SET_APPEARANCE",
            options: {
                emojiPack,
            },
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const setOverride = useCallback(
        debounce(pushOverride as (...args: unknown[]) => void, 200),
        [pushOverride],
    ) as (custom: Partial<Theme>) => void;
    const [css, setCSS] = useState(props.settings.theme?.custom?.css ?? "");

    useEffect(() => setOverride({ css }), [setOverride, css]);

    const selected = theme.getBase();*/
    return (
        <div className={styles.appearance}>
            <ThemeBaseSelectorShim />
            <ThemeShopShim />
            <ThemeAccentShim />
            {/*<DisplayCompactShim />
            <DisplayFontShim />
            <DisplayLigaturesShim />
            <DisplayEmojiShim />*/}

            {/*<CollapsibleSection
                defaultValue={false}
                id="settings_overrides"
                summary={<Text id="app.settings.pages.appearance.overrides" />}>
                <div className={styles.actions}>
                    <Tooltip
                        content={
                            <Text id="app.settings.pages.appearance.reset_overrides" />
                        }>
                        <Button
                            contrast
                            iconbutton
                            onClick={() => setTheme({ custom: {} })}>
                            <Reset size={22} />
                        </Button>
                    </Tooltip>
                    <div
                        className={styles.code}
                        onClick={() => writeClipboard(JSON.stringify(theme))}>
                        <Tooltip content={<Text id="app.special.copy" />}>
                            {" "}
                            {JSON.stringify(theme)}
                        </Tooltip>
                    </div>
                    <Tooltip
                        content={
                            <Text id="app.settings.pages.appearance.import" />
                        }>
                        <Button
                            contrast
                            iconbutton
                            onClick={async () => {
                                try {
                                    const text =
                                        await navigator.clipboard.readText();
                                    setOverride(JSON.parse(text));
                                } catch (err) {
                                    openScreen({
                                        id: "_input",
                                        question: (
                                            <Text id="app.settings.pages.appearance.import_theme" />
                                        ),
                                        field: (
                                            <Text id="app.settings.pages.appearance.theme_data" />
                                        ),
                                        callback: async (string) =>
                                            setOverride(JSON.parse(string)),
                                    });
                                }
                            }}>
                            <Import size={22} />
                        </Button>
                    </Tooltip>
                </div>
                <h3>App</h3>
                <div className={styles.overrides}>
                    {(
                        [
                            "accent",
                            "background",
                            "foreground",
                            "primary-background",
                            "primary-header",
                            "secondary-background",
                            "secondary-foreground",
                            "secondary-header",
                            "tertiary-background",
                            "tertiary-foreground",
                            "block",
                            "message-box",
                            "mention",
                            "scrollbar-thumb",
                            "scrollbar-track",
                            "status-online",
                            "status-away",
                            "status-busy",
                            "status-streaming",
                            "status-invisible",
                            "success",
                            "warning",
                            "error",
                            "hover",
                        ] as const
                    ).map((x) => (
                        <div
                            className={styles.entry}
                            key={x}
                            style={{ backgroundColor: theme.getVariable(x) }}>
                            <div className={styles.input}>
                                <input
                                    type="color"
                                    value={theme.getVariable(x)}
                                    onChange={(v) =>
                                        setOverride({
                                            [x]: v.currentTarget.value,
                                        })
                                    }
                                />
                            </div>
                            <span
                                style={`color: ${getContrastingColour(
                                    theme.getVariable(x),
                                    theme.getVariable("primary-background"),
                                )}`}>
                                {x}
                            </span>
                            <div className={styles.override}>
                                <div
                                    className={styles.picker}
                                    onClick={(e) =>
                                        e.currentTarget.parentElement?.parentElement
                                            ?.querySelector("input")
                                            ?.click()
                                    }>
                                    <Pencil size={24} />
                                </div>
                                <InputBox
                                    type="text"
                                    className={styles.text}
                                    value={theme.getVariable(x)}
                                    onChange={(y) =>
                                        setOverride({
                                            [x]: y.currentTarget.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>*/}

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

export const Appearance = connectState(Component, (state) => {
    return {
        settings: state.settings,
    };
});

function getContrastingColour(hex: string, fallback: string): string {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const cc = (r * 299 + g * 587 + b * 114) / 1000;
    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(cc))
        return getContrastingColour(fallback, "#fffff");
    return cc >= 175 ? "black" : "white";
}
