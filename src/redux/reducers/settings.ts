import { filter } from ".";
import type { SyncUpdateAction } from "./sync";
import type { Sounds } from "../../assets/sounds/Audio";
import type { Theme, ThemeOptions } from "../../context/Theme";
import { setEmojiPack } from "../../components/common/Emoji";

export type SoundOptions = {
    [key in Sounds]?: boolean
}

export const DEFAULT_SOUNDS: SoundOptions = {
    message: true,
    outbound: false,
    call_join: true,
    call_leave: true
};

export interface NotificationOptions {
    desktopEnabled?: boolean;
    sounds?: SoundOptions
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
    setEmojiPack(state.appearance?.emojiPack ?? 'mutant');

    switch (action.type) {
        case "SETTINGS_SET_THEME":
            return {
                ...state,
                theme: {
                    ...filter(state.theme, ["custom", "preset", "ligatures"]),
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
