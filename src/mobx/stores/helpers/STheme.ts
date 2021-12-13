import { makeAutoObservable, computed } from "mobx";

import {
    Theme,
    PRESETS,
    Variables,
    DEFAULT_FONT,
    DEFAULT_MONO_FONT,
} from "../../../context/Theme";

import Settings from "../Settings";

/**
 * Helper class for reading and writing themes.
 */
export default class STheme {
    private settings: Settings;

    /**
     * Construct a new theme helper.
     * @param settings Settings parent class
     */
    constructor(settings: Settings) {
        this.settings = settings;
        makeAutoObservable(this);
    }

    /**
     * Get the base theme used for this theme.
     * @returns Id of base theme
     */
    @computed getBase() {
        return this.settings.get("appearance:theme:base") ?? "dark";
    }

    /**
     * Get whether the theme is light.
     * @returns True if the theme is light
     */
    @computed isLight() {
        return (
            this.settings.get("appearance:theme:light") ??
            this.getBase() === "light"
        );
    }

    /**
     * Get the current theme's CSS variables.
     * @returns Record of CSS variables
     */
    @computed getVariables(): Theme {
        return {
            ...PRESETS[this.getBase()],
            ...this.settings.get("appearance:theme:overrides"),
            light: this.isLight(),
        };
    }

    /**
     * Get a specific value of a variable by its key.
     * @param key Variable
     * @returns Value of variable
     */
    @computed getVariable(key: Variables) {
        return (this.settings.get("appearance:theme:overrides") ??
            PRESETS[this.getBase()])[key]!;
    }

    /**
     * Get the current applied font.
     * @returns Current font
     */
    @computed getFont() {
        return this.settings.get("appearance:theme:font") ?? DEFAULT_FONT;
    }

    /**
     * Get the current applied monospace font.
     * @returns Current monospace font
     */
    @computed getMonospaceFont() {
        return (
            this.settings.get("appearance:theme:monoFont") ?? DEFAULT_MONO_FONT
        );
    }

    /**
     * Get the currently applied CSS snippet.
     * @returns CSS string
     */
    @computed getCSS() {
        return this.settings.get("appearance:theme:css");
    }
}
