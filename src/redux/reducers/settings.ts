import { filter } from ".";
import { SyncUpdateAction } from "./sync";
import { Theme, ThemeOptions } from "../../context/Theme";

export interface NotificationOptions {
    desktopEnabled?: boolean;
    soundEnabled?: boolean;
    outgoingSoundEnabled?: boolean;
}

export type EmojiPacks = "mutant" | "twemoji" | "noto" | "openmoji";
export interface AppearanceOptions {
    emojiPack?: EmojiPacks;
}

export interface Settings {
    theme?: ThemeOptions;
    appearance?: AppearanceOptions;
    notification?: NotificationOptions;
}

export type SettingsAction =
    | { type: undefined }
    | {
          type: "SETTINGS_SET_THEME";
          theme: ThemeOptions;
      }
    | {
          type: "SETTINGS_SET_THEME_OVERRIDE";
          custom?: Partial<Theme>;
      }
    | {
          type: "SETTINGS_SET_NOTIFICATION_OPTIONS";
          options: NotificationOptions;
      }
    | {
          type: "SETTINGS_SET_APPEARANCE";
          options: Partial<AppearanceOptions>;
      }
    | SyncUpdateAction
    | {
          type: "RESET";
      };

export function settings(
    state = {} as Settings,
    action: SettingsAction
): Settings {
    // setEmojiPack(state.appearance?.emojiPack ?? 'mutant');

    switch (action.type) {
        case "SETTINGS_SET_THEME":
            return {
                ...state,
                theme: {
                    ...filter(state.theme, ["custom", "preset"]),
                    ...action.theme,
                },
            };
        case "SETTINGS_SET_THEME_OVERRIDE":
            return {
                ...state,
                theme: {
                    ...state.theme,
                    custom: {
                        ...state.theme?.custom,
                        ...action.custom,
                    },
                },
            };
        case "SETTINGS_SET_NOTIFICATION_OPTIONS":
            return {
                ...state,
                notification: {
                    ...state.notification,
                    ...action.options,
                },
            };
        case "SETTINGS_SET_APPEARANCE":
            return {
                ...state,
                appearance: {
                    ...filter(state.appearance, ["emojiPack"]),
                    ...action.options,
                },
            };
        case "SYNC_UPDATE":
            return {
                ...state,
                appearance: action.update.appearance?.[1] ?? state.appearance,
                theme: action.update.theme?.[1] ?? state.theme,
            };
        case "RESET":
            return {};
        default:
            return state;
    }
}
