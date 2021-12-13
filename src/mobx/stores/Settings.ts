import { action, computed, makeAutoObservable, ObservableMap } from "mobx";

import { mapToRecord } from "../../lib/conversion";

import { Fonts, MonospaceFonts, Overrides, Theme } from "../../context/Theme";

import { Sounds } from "../../assets/sounds/Audio";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";
import STheme from "./helpers/STheme";

export type SoundOptions = {
    [key in Sounds]?: boolean;
};

export type EmojiPack = "mutant" | "twemoji" | "noto" | "openmoji";

interface ISettings {
    "notifications:desktop": boolean;
    "notifications:sounds": SoundOptions;

    "appearance:emoji": EmojiPack;
    "appearance:ligatures": boolean;

    "appearance:theme:base": "dark" | "light";
    "appearance:theme:overrides": Partial<Overrides>;
    "appearance:theme:light": boolean;
    "appearance:theme:font": Fonts;
    "appearance:theme:monoFont": MonospaceFonts;
    "appearance:theme:css": string;
}

/**
 * Manages user settings.
 */
export default class Settings implements Store, Persistent<ISettings> {
    private data: ObservableMap<string, unknown>;

    theme: STheme;

    /**
     * Construct new Settings store.
     */
    constructor() {
        this.data = new ObservableMap();
        makeAutoObservable(this);

        this.theme = new STheme(this);
    }

    get id() {
        return "settings";
    }

    toJSON() {
        return JSON.parse(JSON.stringify(mapToRecord(this.data)));
    }

    @action hydrate(data: ISettings) {
        Object.keys(data).forEach((key) =>
            this.data.set(key, (data as any)[key]),
        );
    }

    /**
     * Set a settings key.
     * @param key Colon-divided key
     * @param value Value
     */
    @action set<T extends keyof ISettings>(key: T, value: ISettings[T]) {
        this.data.set(key, value);
    }

    /**
     * Get a settings key.
     * @param key Colon-divided key
     * @returns Value at key
     */
    @computed get<T extends keyof ISettings>(key: T) {
        return this.data.get(key) as ISettings[T] | undefined;
    }

    @action remove<T extends keyof ISettings>(key: T) {
        this.data.delete(key);
    }

    /**
     * Set a value in settings without type-checking.
     * @param key Colon-divided key
     * @param value Value
     */
    @action setUnchecked(key: string, value: unknown) {
        this.data.set(key, value);
    }

    /**
     * Get a settings key with unknown type.
     * @param key Colon-divided key
     * @returns Value at key
     */
    @computed getUnchecked(key: string) {
        return this.data.get(key);
    }
}
