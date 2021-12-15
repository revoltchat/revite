import { makeAutoObservable, computed, action } from "mobx";

import {
    Theme,
    PRESETS,
    Variables,
    DEFAULT_FONT,
    DEFAULT_MONO_FONT,
    Fonts,
    MonospaceFonts,
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

        this.setBase = this.setBase.bind(this);
        this.reset = this.reset.bind(this);
    }

    @computed toJSON() {
        return JSON.parse(
            JSON.stringify({
                ...this.getVariables(),
                css: this.getCSS(),
                font: this.getFont(),
                monospaceFont: this.getMonospaceFont(),
            }),
        );
    }

    @action hydrate(data: Partial<Theme>) {
        for (const key of Object.keys(data)) {
            const value = data[key as keyof Theme] as string;
            switch (key) {
                case "css": {
                    this.setCSS(value);
                    break;
                }
                case "font": {
                    this.setFont(value as Fonts);
                    break;
                }
                case "monospaceFont": {
                    this.setMonospaceFont(value as MonospaceFonts);
                    break;
                }
                default:
                    this.setVariable(key as Variables, value);
            }
        }
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

    @action setVariable(key: Variables, value: string) {
        this.settings.set("appearance:theme:overrides", {
            ...this.settings.get("appearance:theme:overrides"),
            [key]: value,
        });
    }

    /**
     * Get a specific value of a variable by its key.
     * @param key Variable
     * @returns Value of variable
     */
    @computed getVariable(key: Variables) {
        return (this.settings.get("appearance:theme:overrides")?.[key] ??
            PRESETS[this.getBase()]?.[key])!;
    }

    @action setFont(font: Fonts) {
        this.settings.set("appearance:theme:font", font);
    }

    /**
     * Get the current applied font.
     * @returns Current font
     */
    @computed getFont() {
        return this.settings.get("appearance:theme:font") ?? DEFAULT_FONT;
    }

    @action setMonospaceFont(font: MonospaceFonts) {
        this.settings.set("appearance:theme:monoFont", font);
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

    @action setCSS(value: string) {
        if (value.length > 0) {
            this.settings.set("appearance:theme:css", value);
        } else {
            this.settings.remove("appearance:theme:css");
        }
    }

    /**
     * Get the currently applied CSS snippet.
     * @returns CSS string
     */
    @computed getCSS() {
        return this.settings.get("appearance:theme:css");
    }

    @action setBase(base?: "light" | "dark") {
        if (base) {
            this.settings.set("appearance:theme:base", base);
        } else {
            this.settings.remove("appearance:theme:base");
        }
    }

    @action reset() {
        this.settings.remove("appearance:theme:overrides");
        this.settings.remove("appearance:theme:css");
    }
}
