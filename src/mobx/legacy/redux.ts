import { runInAction } from "mobx";
import { Session } from "revolt-api/types/Auth";

import { Language } from "../../context/Locale";
import {
    Fonts,
    MonospaceFonts,
    Overrides,
    ThemeOptions,
} from "../../context/Theme";

import State from "../State";
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

export interface LegacySettings {
    theme?: LegacyThemeOptions;
    appearance?: LegacyAppearanceOptions;
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

/**
 * Remove trolling from an object
 * @param inp Object to remove trolling from
 * @returns Object without trolling
 */
function detroll(inp: object): ISettings {
    const obj: object = {};
    Object.keys(inp)
        .filter((x) => typeof (inp as any)[x] !== "undefined")
        .map((x) => ((obj as any)[x] = (inp as any)[x]));

    return obj as unknown as ISettings;
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

export type LegacyState = {
    locale: Language;
    auth: LegacyAuthState;
    settings: LegacySettings;
    sync: LegacySyncOptions;
    notifications: LegacyNotifications;
};

export function legacyMigrateForwards(
    data: Partial<LegacyState>,
    target: State,
) {
    runInAction(() => {
        if ("sync" in data) {
            target.sync.hydrate(legacyMigrateSync(data.sync!));
        }

        if ("locale" in data) {
            target.locale.hydrate(legacyMigrateLocale(data.locale!));
        }

        if ("auth" in data) {
            target.auth.hydrate(legacyMigrateAuth(data.auth!));
        }

        if ("settings" in data) {
            if (data!.settings!.theme) {
                target.settings.hydrate(
                    detroll(legacyMigrateTheme(data.settings!.theme!)),
                );
            }

            if (data!.settings!.appearance) {
                target.settings.hydrate(
                    detroll(
                        legacyMigrateAppearance(data.settings!.appearance!),
                    ),
                );
            }
        }

        if ("notifications" in data) {
            target.notifications.hydrate(
                legacyMigrateNotification(data.notifications!),
            );
        }
    });
}
