import { action, computed, makeAutoObservable } from "mobx";

import { Language, Languages } from "../../context/Locale";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

interface Data {
    lang: Language;
}

/**
 * Detect the browser language or match given language.
 * @param lang Language to find
 * @returns Matched Language
 */
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

/**
 * Keeps track of the last open channels, tabs, etc.
 * Handles providing good UX experience on navigating
 * back and forth between different parts of the app.
 */
export default class LocaleOptions implements Store, Persistent<Data> {
    private lang: Language;

    /**
     * Construct new LocaleOptions store.
     */
    constructor() {
        this.lang = findLanguage();
        makeAutoObservable(this);
    }

    get id() {
        return "locale";
    }

    toJSON() {
        return {
            lang: this.lang,
        };
    }

    @action hydrate(data: Data) {
        this.setLanguage(data.lang);
    }

    /**
     * Get current language.
     */
    @computed getLanguage() {
        return this.lang;
    }

    /**
     * Set current language.
     */
    @action setLanguage(language: Language) {
        if (typeof Languages[language] === "undefined") return;
        this.lang = language;
    }
}
