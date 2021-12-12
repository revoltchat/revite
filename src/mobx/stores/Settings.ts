import { action, computed, makeAutoObservable, ObservableMap } from "mobx";

import { mapToRecord } from "../../lib/conversion";

import { Theme } from "../../context/Theme";

import { Sounds } from "../../assets/sounds/Audio";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

export type SoundOptions = {
    [key in Sounds]?: boolean;
};

export type EmojiPack = "mutant" | "twemoji" | "noto" | "openmoji";

interface ISettings {
    "notifications:desktop": boolean;
    "notifications:sounds": SoundOptions;

    "appearance:emoji": EmojiPack;
    "appearance:ligatures": boolean;
    "appearance:theme:base": string;
    "appearance:theme:custom": Partial<Theme>;
}

/*const Schema: {
    [key in keyof ISettings]:
        | "string"
        | "number"
        | "boolean"
        | "object"
        | "function";
} = {
    "notifications:desktop": "boolean",
    "notifications:sounds": "object",

    "appearance:emoji": "string",
    "appearance:ligatures": "boolean",
    "appearance:theme:base": "string",
    "appearance:theme:custom": "object",
};*/

/**
 * Manages user settings.
 */
export default class Settings implements Store, Persistent<ISettings> {
    private data: ObservableMap<string, unknown>;

    /**
     * Construct new Layout store.
     */
    constructor() {
        this.data = new ObservableMap();
        makeAutoObservable(this);
    }

    get id() {
        return "layout";
    }

    toJSON() {
        return JSON.parse(JSON.stringify(mapToRecord(this.data)));
    }

    @action hydrate(data: ISettings) {
        Object.keys(data).forEach((key) =>
            this.data.set(key, (data as any)[key]),
        );
    }

    @action set<T extends keyof ISettings>(key: T, value: ISettings[T]) {
        return this.data.set(key, value);
    }

    @computed get<T extends keyof ISettings>(key: T) {
        return this.data.get(key) as ISettings[T] | undefined;
    }

    @action setUnchecked(key: string, value: unknown) {
        return this.data.set(key, value);
    }

    @computed getUnchecked(key: string) {
        return this.data.get(key);
    }
}
