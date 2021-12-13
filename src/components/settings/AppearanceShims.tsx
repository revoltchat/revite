import { Store } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";

import { Text } from "preact-i18n";

import TextAreaAutoSize from "../../lib/TextAreaAutoSize";

import { useApplicationState } from "../../mobx/State";
import { EmojiPack } from "../../mobx/stores/Settings";

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
import mutantSVG from "./mutant_emoji.svg";
import notoSVG from "./noto_emoji.svg";
import openmojiSVG from "./openmoji_emoji.svg";
import twemojiSVG from "./twemoji_emoji.svg";

import { ThemeBaseSelector } from "./appearance/ThemeBaseSelector";

export const ThemeBaseSelectorShim = observer(() => {
    const theme = useApplicationState().settings.theme;
    return (
        <ThemeBaseSelector value={theme.getBase()} setValue={theme.setBase} />
    );
});

export const ThemeShopShim = () => {
    if (!useApplicationState().experiments.isEnabled("theme_shop")) return null;

    return (
        <Link to="/settings/theme_shop" replace>
            <CategoryButton icon={<Store size={24} />} action="chevron" hover>
                <Text id="app.settings.pages.theme_shop.title" />
            </CategoryButton>
        </Link>
    );
};

export const ThemeAccentShim = observer(() => {
    const theme = useApplicationState().settings.theme;
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.accent_selector" />
            </h3>
            <ColourSwatches
                value={theme.getVariable("accent")}
                onChange={(colour) => theme.setVariable("accent", colour)}
            />
        </>
    );
});

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

export const DisplayCompactShim = () => {
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

export const DisplayLigaturesShim = observer(() => {
    const settings = useApplicationState().settings;
    if (settings.theme.getFont() !== "Inter") return null;

    return (
        <p>
            <Checkbox
                checked={settings.get("appearance:ligatures") ?? false}
                onChange={(v) => settings.set("appearance:ligatures", v)}
                description={
                    <Text id="app.settings.pages.appearance.ligatures_desc" />
                }>
                <Text id="app.settings.pages.appearance.ligatures" />
            </Checkbox>
        </p>
    );
});

export const DisplayEmojiShim = observer(() => {
    const settings = useApplicationState().settings;
    const emojiPack = settings.get("appearance:emoji");
    const setPack = (v: EmojiPack) => () => settings.set("appearance:emoji", v);

    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.emoji_pack" />
            </h3>
            <div /* className={styles.emojiPack} */>
                <div /* className={styles.row} */>
                    <div>
                        <div
                            /* className={styles.button} */
                            onClick={setPack("mutant")}
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
                            /* className={styles.button} */
                            onClick={setPack("twemoji")}
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
                <div /* className={styles.row} */>
                    <div>
                        <div
                            /* className={styles.button} */
                            onClick={setPack("openmoji")}
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
                            /* className={styles.button} */
                            onClick={setPack("noto")}
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
        </>
    );
});
