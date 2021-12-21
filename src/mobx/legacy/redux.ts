import { AuthState } from "../../redux/reducers/auth";

import { Language } from "../../context/Locale";
import { Fonts, MonospaceFonts, Overrides } from "../../context/Theme";

import { Data as DataAuth } from "../stores/Auth";
import { Data as DataLocaleOptions } from "../stores/LocaleOptions";
import { Data as DataNotificationOptions } from "../stores/NotificationOptions";
import { ISettings } from "../stores/Settings";

export type LegacyTheme = Overrides & {
    light?: boolean;
    font?: Fonts;
    css?: string;
    monospaceFont?: MonospaceFonts;
};

export interface LegacyThemeOptions {
    base?: string;
    ligatures?: boolean;
    custom?: Partial<LegacyTheme>;
}

export type LegacyEmojiPacks = "mutant" | "twemoji" | "noto" | "openmoji";
export interface LegacyAppearanceOptions {
    emojiPack?: LegacyEmojiPacks;
}

export type LegacyNotificationState = "all" | "mention" | "none" | "muted";

export type LegacyNotifications = {
    [key: string]: LegacyNotificationState;
};

export interface LegacySyncData {
    locale?: Language;
    theme?: LegacyThemeOptions;
    appearance?: LegacyAppearanceOptions;
    notifications?: LegacyNotifications;
}

function legacyMigrateAuth(auth: AuthState): DataAuth {
    return {
        current: auth.active,
        sessions: auth.accounts,
    };
}

function legacyMigrateLocale(lang: Language): DataLocaleOptions {
    return {
        lang,
    };
}

function legacyMigrateTheme(theme: LegacyThemeOptions): Partial<ISettings> {
    const { light, font, css, monospaceFont, ...variables } =
        theme.custom ?? {};

    return {
        "appearance:ligatures": theme.ligatures,
        "appearance:theme:base": theme.base === "light" ? "light" : "dark",
        "appearance:theme:light": light,
        "appearance:theme:font": font,
        "appearance:theme:monoFont": monospaceFont,
        "appearance:theme:css": css,
        "appearance:theme:overrides": variables,
    };
}

function legacyMigrateAppearance(
    appearance: LegacyAppearanceOptions,
): Partial<ISettings> {
    return {
        "appearance:emoji": appearance.emojiPack,
    };
}

function legacyMigrateNotification(
    channel: LegacyNotifications,
): DataNotificationOptions {
    return {
        channel,
    };
}
