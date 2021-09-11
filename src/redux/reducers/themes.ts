import { Theme } from "../../context/Theme";

import { ThemeMetadata } from "../../pages/settings/panes/ThemeShop";

export interface StoredTheme {
    slug: string;
    meta: ThemeMetadata;
    theme: Theme;
}

export type Themes = Record<string, StoredTheme>;

export type ThemesAction =
    | { type: undefined }
    | { type: "THEMES_SET_THEME"; theme: StoredTheme }
    | { type: "THEMES_REMOVE_THEME"; slug: string }
    | { type: "RESET" };

export function themes(state: Themes = {}, action: ThemesAction) {
    switch (action.type) {
        case "THEMES_SET_THEME":
            return {
                ...state,
                [action.theme.slug]: action.theme,
            };
        case "THEMES_REMOVE_THEME":
            return { ...state, [action.slug]: null };
        case "RESET":
            return {};
        default:
            return state;
    }
}
