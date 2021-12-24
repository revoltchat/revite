import { Session } from "revolt-api/types/Auth";

import { Language } from "../../context/Locale";
import { Fonts, MonospaceFonts, Overrides } from "../../context/Theme";

import { Data as DataAuth } from "../stores/Auth";
import { Data as DataLocaleOptions } from "../stores/LocaleOptions";
import { Data as DataNotificationOptions } from "../stores/NotificationOptions";
import { ISettings } from "../stores/Settings";
import { Data as DataSync } from "../stores/Sync";

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

export type LegacySyncKeys =
    | "theme"
    | "appearance"
    | "locale"
    | "notifications";

export interface LegacySyncOptions {
    disabled?: LegacySyncKeys[];
    revision?: {
        [key: string]: number;
    };
}

export interface LegacyAuthState {
    accounts: {
        [key: string]: {
            session: Session;
        };
    };
    active?: string;
}

export function legacyMigrateAuth(auth: LegacyAuthState): DataAuth {
    return {
        current: auth.active,
        sessions: auth.accounts,
    };
}

export function legacyMigrateLocale(lang: Language): DataLocaleOptions {
    return {
        lang,
    };
}

export function legacyMigrateTheme(
    theme: LegacyThemeOptions,
): Partial<ISettings> {
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

export function legacyMigrateAppearance(
    appearance: LegacyAppearanceOptions,
): Partial<ISettings> {
    return {
        "appearance:emoji": appearance.emojiPack,
    };
}

export function legacyMigrateNotification(
    channel: LegacyNotifications,
): DataNotificationOptions {
    return {
        channel,
    };
}

export function legacyMigrateSync(sync: LegacySyncOptions): DataSync {
    return {
        disabled: sync.disabled ?? [],
        revision: {
            ...sync.revision,
        },
    };
}
