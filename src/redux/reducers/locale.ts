import { Language } from "../../context/Locale";
import { SyncData, SyncKeys, SyncUpdateAction } from "./sync";

export type LocaleAction =
    | { type: undefined }
    | {
          type: "SET_LOCALE";
          locale: Language;
      }
    | SyncUpdateAction;

export function findLanguage(lang?: string): Language {
    if (!lang) {
        if (typeof navigator === "undefined") {
            lang = Language.ENGLISH;
        } else {
            lang = navigator.language;
        }
    }

    const code = lang.replace("-", "_");

    const short = code.split("_")[0];
    for (const key of Object.keys(Language)) {
        const value = (Language as any)[key];
        if (value.startsWith(code)) {
            return value;
        }
    }

    for (const key of Object.keys(Language).reverse()) {
        const value = (Language as any)[key];
        if (value.startsWith(short)) {
            return value;
        }
    }

    return Language.ENGLISH;
}

export function locale(state = findLanguage(), action: LocaleAction): Language {
    switch (action.type) {
        case "SET_LOCALE":
            return action.locale;
        case "SYNC_UPDATE":
            return (action.update.locale?.[1] ?? state) as Language;
        default:
            return state;
    }
}
