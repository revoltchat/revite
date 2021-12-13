import { action, computed, makeAutoObservable, ObservableMap } from "mobx";

import { mapToRecord } from "../../lib/conversion";

import { StoredTheme } from "../../redux/reducers/themes";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

interface Data {
    themes: Record<string, StoredTheme>;
}

/**
 * Cache data store for temporary, long-lived data.
 */
export default class Cache implements Store, Persistent<Data> {
    private themes: ObservableMap<string, StoredTheme>;

    /**
     * Construct new Cache store.
     */
    constructor() {
        this.themes = new ObservableMap();
        makeAutoObservable(this);
    }

    get id() {
        return "draft";
    }

    toJSON() {
        return {
            themes: JSON.parse(JSON.stringify(mapToRecord(this.themes))),
        };
    }

    @action hydrate(data: Data) {
        Object.keys(data.themes).forEach((key) =>
            this.themes.set(key, data.themes[key]),
        );
    }

    /**
     * Cache a given theme.
     * @param theme Theme
     */
    @action cacheTheme(theme: StoredTheme) {
        this.themes.set(theme.slug, theme);
    }

    /**
     * Remove a cached theme.
     * @param slug String
     */
    @action removeTheme(slug: string) {
        this.themes.delete(slug);
    }

    /**
     * Get a cached theme by its slug.
     * @param slug Theme slug
     * @returns Theme, if found
     */
    @computed getTheme(slug: string) {
        return this.themes.get(slug);
    }

    /**
     * Get all cached themes.
     * @returns Themes
     */
    @computed getThemes() {
        return [...this.themes.values()];
    }
}
