import { Reset, Import } from "@styled-icons/boxicons-regular";
import { Pencil, Store } from "@styled-icons/boxicons-solid";
// @ts-expect-error shade-blend-color does not have typings.
import pSBC from "shade-blend-color";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import CategoryButton from "../../../components/ui/fluent/CategoryButton";


import { debounce } from "../../../lib/debounce";

import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";
import { EmojiPacks, Settings } from "../../../redux/reducers/settings";


import {
    DEFAULT_FONT,
    DEFAULT_MONO_FONT,
    Fonts,
    FONTS,
    FONT_KEYS,
    MonospaceFonts,
    MONOSPACE_FONTS,
    MONOSPACE_FONT_KEYS,
    Theme,
    ThemeContext,
    ThemeOptions,
} from "../../../context/Theme";
import { useIntermediate } from "../../../context/intermediate/Intermediate";

import CollapsibleSection from "../../../components/common/CollapsibleSection";
import Tooltip from "../../../components/common/Tooltip";
import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import ColourSwatches from "../../../components/ui/ColourSwatches";
import ComboBox from "../../../components/ui/ComboBox";
import InputBox from "../../../components/ui/InputBox";
import darkSVG from "../assets/dark.svg";
import lightSVG from "../assets/light.svg";
import mutantSVG from "../assets/mutant_emoji.svg";
import notoSVG from "../assets/noto_emoji.svg";
import openmojiSVG from "../assets/openmoji_emoji.svg";
import twemojiSVG from "../assets/twemoji_emoji.svg";
import { Link } from "react-router-dom";
import { isExperimentEnabled } from "../../../redux/reducers/experiments";

interface Props {
    settings: Settings;
}

// ! FIXME: code needs to be rewritten to fix jittering
export function Component(props: Props) {
    const theme = useContext(ThemeContext);
    const { writeClipboard, openScreen } = useIntermediate();

    function setTheme(theme: ThemeOptions) {
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

    const selected = props.settings.theme?.base ?? "dark";
    return (
        <div className={styles.appearance}>
            <h3>
                <Text id="app.settings.pages.appearance.theme" />
            </h3>
            <div className={styles.themes}>
                <div className={styles.theme}>
                    <img
                        loading="eager"
                        src={lightSVG}
                        draggable={false}
                        data-active={selected === "light"}
                        onClick={() =>
                            selected !== "light" &&
                            setTheme({ base: "light" })
                        }
                        onContextMenu={(e) => e.preventDefault()}
                    />
                    <h4>
                        <Text id="app.settings.pages.appearance.color.light" />
                    </h4>
                </div>
                <div className={styles.theme}>
                    <img
                        loading="eager"
                        src={darkSVG}
                        draggable={false}
                        data-active={selected === "dark"}
                        onClick={() =>
                            selected !== "dark" && setTheme({ base: "dark" })
                        }
                        onContextMenu={(e) => e.preventDefault()}
                    />
                    <h4>
                        <Text id="app.settings.pages.appearance.color.dark" />
                    </h4>
                </div>
            </div>

            {isExperimentEnabled('theme_shop') && <Link to="/settings/theme_shop" replace>
                <CategoryButton icon={<Store size={24} />} action="chevron" hover>
                    <Text id="app.settings.pages.theme_shop.title" />
                </CategoryButton>
            </Link>}

            <h3>
                <Text id="app.settings.pages.appearance.accent_selector" />
            </h3>
            <ColourSwatches value={theme.accent} onChange={setAccent} />

            {/*<h3>
                <Text id="app.settings.pages.appearance.message_display" />
            </h3>
            <div className={styles.display}>
                <Radio
                    description={
                        <Text id="app.settings.pages.appearance.display.default_description" />
                    }
                    checked
                >
                    <Text id="app.settings.pages.appearance.display.default" />
                </Radio>
                <Radio
                    description={
                        <Text id="app.settings.pages.appearance.display.compact_description" />
                    }
                    disabled
                >
                    <Text id="app.settings.pages.appearance.display.compact" />
                </Radio>
            </div>*/}

            <h3>
                <Text id="app.settings.pages.appearance.font" />
            </h3>
            <ComboBox
                value={theme.font ?? DEFAULT_FONT}
                onChange={(e) =>
                    pushOverride({ font: e.currentTarget.value as Fonts })
                }>
                {FONT_KEYS.map((key) => (
                    <option value={key} key={key}>
                        {FONTS[key as keyof typeof FONTS].name}
                    </option>
                ))}
            </ComboBox>
            {/* TOFIX: Only show when a font with ligature support is selected, i.e.: Inter.*/}
            <p>
                <Checkbox
                    checked={props.settings.theme?.ligatures === true}
                    onChange={() =>
                        setTheme({
                            ligatures: !props.settings.theme?.ligatures,
                        })
                    }
                    description={
                        <Text id="app.settings.pages.appearance.ligatures_desc" />
                    }>
                    <Text id="app.settings.pages.appearance.ligatures" />
                </Checkbox>
            </p>

            <h3>
                <Text id="app.settings.pages.appearance.emoji_pack" />
            </h3>
            <div className={styles.emojiPack}>
                <div className={styles.row}>
                    <div>
                        <div
                            className={styles.button}
                            onClick={() => setEmojiPack("mutant")}
                            data-active={emojiPack === "mutant"}>
                            <img
                                loading="eager"
                                src={mutantSVG}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                        <h4>
                            Mutant Remix{" "}
                            <a
                                href="https://mutant.revolt.chat"
                                target="_blank"
                                rel="noreferrer">
                                (by Revolt)
                            </a>
                        </h4>
                    </div>
                    <div>
                        <div
                            className={styles.button}
                            onClick={() => setEmojiPack("twemoji")}
                            data-active={emojiPack === "twemoji"}>
                            <img
                                loading="eager"
                                src={twemojiSVG}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                        <h4>Twemoji</h4>
                    </div>
                </div>
                <div className={styles.row}>
                    <div>
                        <div
                            className={styles.button}
                            onClick={() => setEmojiPack("openmoji")}
                            data-active={emojiPack === "openmoji"}>
                            <img
                                loading="eager"
                                src={openmojiSVG}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                        <h4>Openmoji</h4>
                    </div>
                    <div>
                        <div
                            className={styles.button}
                            onClick={() => setEmojiPack("noto")}
                            data-active={emojiPack === "noto"}>
                            <img
                                loading="eager"
                                src={notoSVG}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                        <h4>Noto Emoji</h4>
                    </div>
                </div>
            </div>

            <CollapsibleSection
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
                            {/*TOFIX: Try to put the tooltip above the .code div without messing up the css challenge */}
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
                            style={{ backgroundColor: theme[x] }}>
                            <div className={styles.input}>
                                <input
                                    type="color"
                                    value={theme[x]}
                                    onChange={(v) =>
                                        setOverride({
                                            [x]: v.currentTarget.value,
                                        })
                                    }
                                />
                            </div>
                            <span
                                style={`color: ${getContrastingColour(
                                    theme[x],
                                    theme["primary-background"],
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
                                    value={theme[x]}
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
            </CollapsibleSection>

            <CollapsibleSection
                id="settings_advanced_appearance"
                defaultValue={false}
                summary={<Text id="app.settings.pages.appearance.advanced" />}>
                <h3>
                    <Text id="app.settings.pages.appearance.mono_font" />
                </h3>
                <ComboBox
                    value={theme.monospaceFont ?? DEFAULT_MONO_FONT}
                    onChange={(e) =>
                        pushOverride({
                            monospaceFont: e.currentTarget
                                .value as MonospaceFonts,
                        })
                    }>
                    {MONOSPACE_FONT_KEYS.map((key) => (
                        <option value={key} key={key}>
                            {
                                MONOSPACE_FONTS[
                                    key as keyof typeof MONOSPACE_FONTS
                                ].name
                            }
                        </option>
                    ))}
                </ComboBox>

                <h3>
                    <Text id="app.settings.pages.appearance.custom_css" />
                </h3>
                <TextAreaAutoSize
                    maxRows={20}
                    minHeight={480}
                    code
                    value={css}
                    onChange={(ev) => setCSS(ev.currentTarget.value)}
                />
            </CollapsibleSection>
        </div>
    );
}

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
