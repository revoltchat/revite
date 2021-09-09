import { Language, Languages } from "../../context/Locale";

import type { SyncUpdateAction } from "./sync";

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

    const values = [];
    for (const key in Language) {
        const value = Language[key as keyof typeof Language];

        // Skip alternative/joke languages
        if (Languages[value].cat === "alt") continue;

        values.push(value);
        if (value.startsWith(code)) {
            return value as Language;
        }
    }

    for (const value of values.reverse()) {
        if (value.startsWith(short)) {
            return value as Language;
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
