import { AppearanceOptions } from "./settings";
import { Language } from "../../context/Locale";
import { ThemeOptions } from "../../context/Theme";
import { Notifications } from "./notifications";

export type SyncKeys = "theme" | "appearance" | "locale" | "notifications";

export interface SyncData {
    locale?: Language;
    theme?: ThemeOptions;
    appearance?: AppearanceOptions;
    notifications?: Notifications;
}

export const DEFAULT_ENABLED_SYNC: SyncKeys[] = [
    "theme",
    "appearance",
    "locale",
    "notifications"
];
export interface SyncOptions {
    disabled?: SyncKeys[];
    revision?: {
        [key: string]: number;
    };
}

export type SyncUpdateAction = {
    type: "SYNC_UPDATE";
    update: { [key in SyncKeys]?: [number, SyncData[key]] };
};

export type SyncAction =
    | { type: undefined }
    | {
          type: "SYNC_ENABLE_KEY";
          key: SyncKeys;
      }
    | {
          type: "SYNC_DISABLE_KEY";
          key: SyncKeys;
      }
    | {
          type: "SYNC_SET_REVISION";
          key: SyncKeys;
          timestamp: number;
      }
    | SyncUpdateAction;

export function sync(
    state = {} as SyncOptions,
    action: SyncAction
): SyncOptions {
    switch (action.type) {
        case "SYNC_DISABLE_KEY":
            return {
                ...state,
                disabled: [
                    ...(state.disabled ?? []).filter((v) => v !== action.key),
                    action.key,
                ],
            };
        case "SYNC_ENABLE_KEY":
            return {
                ...state,
                disabled: state.disabled?.filter((v) => v !== action.key),
            };
        case "SYNC_SET_REVISION":
            return {
                ...state,
                revision: {
                    ...state.revision,
                    [action.key]: action.timestamp,
                },
            };
        case "SYNC_UPDATE": {
            const revision = { ...state.revision };
            for (const key of Object.keys(action.update)) {
                const value = action.update[key as SyncKeys];
                if (value) {
                    revision[key] = value[0];
                }
            }

            return {
                ...state,
                revision,
            };
        }
        default:
            return state;
    }
}
