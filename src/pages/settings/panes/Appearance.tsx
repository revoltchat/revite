import { Text } from "preact-i18n";
import styles from "./Panes.module.scss";
import { debounce } from "../../../lib/debounce";
import Button from "../../../components/ui/Button";
import InputBox from "../../../components/ui/InputBox";
import { connectState } from "../../../redux/connector";
import { WithDispatcher } from "../../../redux/reducers";
import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import ColourSwatches from "../../../components/ui/ColourSwatches";
import { EmojiPacks, Settings } from "../../../redux/reducers/settings";
import { Theme, ThemeContext, ThemeOptions } from "../../../context/Theme";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import { useIntermediate } from "../../../context/intermediate/Intermediate";

// @ts-ignore
import pSBC from 'shade-blend-color';

import lightSVG from '../assets/light.svg';
import darkSVG from '../assets/dark.svg';

import mutantSVG from '../assets/mutant_emoji.svg';
import notoSVG from '../assets/noto_emoji.svg';
import openmojiSVG from '../assets/openmoji_emoji.svg';
import twemojiSVG from '../assets/twemoji_emoji.svg';

interface Props {
    settings: Settings;
}

// ! FIXME: code needs to be rewritten to fix jittering
export function Component(props: Props & WithDispatcher) {
    const theme = useContext(ThemeContext);
    const { writeClipboard, openScreen } = useIntermediate();

    function setTheme(theme: ThemeOptions) {
        props.dispatcher({
            type: "SETTINGS_SET_THEME",
            theme
        });
    }

    function pushOverride(custom: Partial<Theme>) {
        props.dispatcher({
            type: "SETTINGS_SET_THEME_OVERRIDE",
            custom
        });
    }

    function setAccent(accent: string) {
        setOverride({
            accent,
            "scrollbar-thumb": pSBC(-0.2, accent)
        });
    }

    const emojiPack = props.settings.appearance?.emojiPack ?? 'mutant';
    function setEmojiPack(emojiPack: EmojiPacks) {
        props.dispatcher({
            type: 'SETTINGS_SET_APPEARANCE',
            options: {
                emojiPack
            }
        });
    }

    const setOverride = useCallback(debounce(pushOverride, 200), []) as (
        custom: Partial<Theme>
    ) => void;
    const [ css, setCSS ] = useState(props.settings.theme?.custom?.css ?? '');

    useEffect(() => setOverride({ css }), [ css ]);

    const selected = props.settings.theme?.preset ?? "dark";
    return (
        <div className={styles.appearance}>
            <h3>
                <Text id="app.settings.pages.appearance.theme" />
            </h3>
            <div className={styles.themes}>
                <div className={styles.theme}>
                    <img
                        src={lightSVG}
                        data-active={selected === "light"}
                        onClick={() =>
                            selected !== "light" &&
                            setTheme({ preset: "light" })
                        } />
                    <h4>
                        <Text id="app.settings.pages.appearance.color.light" />
                    </h4>
                </div>
                <div className={styles.theme}>
                    <img
                        src={darkSVG}
                        data-active={selected === "dark"}
                        onClick={() =>
                            selected !== "dark" && setTheme({ preset: "dark" })
                        } />
                    <h4>
                        <Text id="app.settings.pages.appearance.color.dark" />
                    </h4>
                </div>
            </div>

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
                <Text id="app.settings.pages.appearance.emoji_pack" />
            </h3>
            <div className={styles.emojiPack}>
                <div className={styles.row}>
                    <div>
                        <div className={styles.button}
                            onClick={() => setEmojiPack('mutant')}
                            data-active={emojiPack === 'mutant'}>
                            <img src={mutantSVG} draggable={false} />
                        </div>
                        <h4>Mutant Remix <a href="https://mutant.revolt.chat" target="_blank">(by Revolt)</a></h4>
                    </div>
                    <div>
                        <div className={styles.button}
                            onClick={() => setEmojiPack('twemoji')}
                            data-active={emojiPack === 'twemoji'}>
                            <img src={twemojiSVG} draggable={false} />
                        </div>
                        <h4>Twemoji</h4>
                    </div>
                </div>
                <div className={styles.row}>
                    <div>
                        <div className={styles.button}
                            onClick={() => setEmojiPack('openmoji')}
                            data-active={emojiPack === 'openmoji'}>
                            <img src={openmojiSVG} draggable={false} />
                        </div>
                        <h4>Openmoji</h4>
                    </div>
                    <div>
                        <div className={styles.button}
                            onClick={() => setEmojiPack('noto')}
                            data-active={emojiPack === 'noto'}>
                            <img src={notoSVG} draggable={false} />
                        </div>
                        <h4>Noto Emoji</h4>
                    </div>
                </div>
            </div>

            <details>
                <summary>
                    <Text id="app.settings.pages.appearance.advanced" />
                    <div className={styles.divider}></div>
                </summary>
                <h3>
                    <Text id="app.settings.pages.appearance.overrides" />
                </h3>
                <div className={styles.actions}>
                    <Button contrast
                        onClick={() => setTheme({ custom: {} })}>
                        <Text id="app.settings.pages.appearance.reset_overrides" />
                    </Button>
                    <Button contrast
                        onClick={() => writeClipboard(JSON.stringify(theme))}>
                        <Text id="app.settings.pages.appearance.export_clipboard" />
                    </Button>
                    <Button contrast
                        onClick={async () => {
                            const text = await navigator.clipboard.readText();
                            setOverride(JSON.parse(text));
                        }}>
                        <Text id="app.settings.pages.appearance.import_clipboard" />
                    </Button>
                    <Button contrast
                        onClick={async () => {
                            openScreen({
                                id: "_input",
                                question: <Text id="app.settings.pages.appearance.import_theme" />,
                                field: <Text id="app.settings.pages.appearance.theme_data" />,
                                callback: async string => setOverride(JSON.parse(string))
                            });
                        }}>
                        <Text id="app.settings.pages.appearance.import_manual" />
                    </Button>
                </div>
                <div className={styles.overrides}>
                    {([
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
                        "sidebar-active",
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
                        "hover"
                    ] as const).map(x => (
                        <div className={styles.entry} key={x}>
                            <span>{x}</span>
                            <div className={styles.override}>
                                <div className={styles.picker}
                                    style={{ backgroundColor: theme[x] }}>
                                    <input
                                        type="color"
                                        value={theme[x]}
                                        onChange={v =>
                                            setOverride({
                                                [x]: v.currentTarget.value
                                            })
                                        }
                                    />
                                </div>
                                <InputBox
                                    className={styles.text}
                                    value={theme[x]}
                                    onChange={y =>
                                        setOverride({
                                            [x]: y.currentTarget.value
                                        })
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <h3>
                    <Text id="app.settings.pages.appearance.custom_css" />
                </h3>
                <TextAreaAutoSize
                    maxRows={20}
                    minHeight={480}
                    code
                    value={css}
                    onChange={ev => setCSS(ev.currentTarget.value)} />
            </details>
        </div>
    );
}

export const Appearance = connectState(
    Component,
    state => {
        return {
            settings: state.settings
        };
    },
    true
);
