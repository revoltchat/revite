import { Helmet } from "react-helmet";
import { createGlobalStyle } from "styled-components";

import { createContext } from "preact";
import { useEffect } from "preact/hooks";

import { connectState } from "../redux/connector";

import { Children } from "../types/Preact";
import { fetchManifest, fetchTheme } from "../pages/settings/panes/ThemeShop";
import { getState } from "../redux";

export type Variables =
    | "accent"
    | "background"
    | "foreground"
    | "block"
    | "message-box"
    | "mention"
    | "success"
    | "warning"
    | "error"
    | "hover"
    | "scrollbar-thumb"
    | "scrollbar-track"
    | "primary-background"
    | "primary-header"
    | "secondary-background"
    | "secondary-foreground"
    | "secondary-header"
    | "tertiary-background"
    | "tertiary-foreground"
    | "status-online"
    | "status-away"
    | "status-busy"
    | "status-streaming"
    | "status-invisible";

// While this isn't used, it'd be good to keep this up to date as a reference or for future use
export type HiddenVariables =
    | "font"
    | "ligatures"
    | "app-height"
    | "sidebar-active"
    | "monospace-font";

export type Fonts =
    | "Open Sans"
    | "Inter"
    | "Atkinson Hyperlegible"
    | "Roboto"
    | "Noto Sans"
    | "Lato"
    | "Bree Serif"
    | "Montserrat"
    | "Poppins"
    | "Raleway"
    | "Ubuntu"
    | "Comic Neue";
export type MonospaceFonts =
    | "Fira Code"
    | "Roboto Mono"
    | "Source Code Pro"
    | "Space Mono"
    | "Ubuntu Mono";

export type Theme = {
    [variable in Variables]: string;
} & {
    light?: boolean;
    font?: Fonts;
    css?: string;
    monospaceFont?: MonospaceFonts;
};

export interface ThemeOptions {
    base?: string;
    ligatures?: boolean;
    custom?: Partial<Theme>;
}

export const FONTS: Record<Fonts, { name: string; load: () => void }> = {
    "Open Sans": {
        name: "Open Sans",
        load: async () => {
            await import("@fontsource/open-sans/300.css");
            await import("@fontsource/open-sans/400.css");
            await import("@fontsource/open-sans/600.css");
            await import("@fontsource/open-sans/700.css");
            await import("@fontsource/open-sans/400-italic.css");
        },
    },
    Inter: {
        name: "Inter",
        load: async () => {
            await import("@fontsource/inter/300.css");
            await import("@fontsource/inter/400.css");
            await import("@fontsource/inter/600.css");
            await import("@fontsource/inter/700.css");
        },
    },
    "Atkinson Hyperlegible": {
        name: "Atkinson Hyperlegible",
        load: async () => {
            await import("@fontsource/atkinson-hyperlegible/400.css");
            await import("@fontsource/atkinson-hyperlegible/700.css");
            await import("@fontsource/atkinson-hyperlegible/400-italic.css");
        },
    },
    Roboto: {
        name: "Roboto",
        load: async () => {
            await import("@fontsource/roboto/400.css");
            await import("@fontsource/roboto/700.css");
            await import("@fontsource/roboto/400-italic.css");
        },
    },
    "Noto Sans": {
        name: "Noto Sans",
        load: async () => {
            await import("@fontsource/noto-sans/400.css");
            await import("@fontsource/noto-sans/700.css");
            await import("@fontsource/noto-sans/400-italic.css");
        },
    },
    "Bree Serif": {
        name: "Bree Serif",
        load: () => import("@fontsource/bree-serif/400.css"),
    },
    Lato: {
        name: "Lato",
        load: async () => {
            await import("@fontsource/lato/300.css");
            await import("@fontsource/lato/400.css");
            await import("@fontsource/lato/700.css");
            await import("@fontsource/lato/400-italic.css");
        },
    },
    Montserrat: {
        name: "Montserrat",
        load: async () => {
            await import("@fontsource/montserrat/300.css");
            await import("@fontsource/montserrat/400.css");
            await import("@fontsource/montserrat/600.css");
            await import("@fontsource/montserrat/700.css");
            await import("@fontsource/montserrat/400-italic.css");
        },
    },
    Poppins: {
        name: "Poppins",
        load: async () => {
            await import("@fontsource/poppins/300.css");
            await import("@fontsource/poppins/400.css");
            await import("@fontsource/poppins/600.css");
            await import("@fontsource/poppins/700.css");
            await import("@fontsource/poppins/400-italic.css");
        },
    },
    Raleway: {
        name: "Raleway",
        load: async () => {
            await import("@fontsource/raleway/300.css");
            await import("@fontsource/raleway/400.css");
            await import("@fontsource/raleway/600.css");
            await import("@fontsource/raleway/700.css");
            await import("@fontsource/raleway/400-italic.css");
        },
    },
    Ubuntu: {
        name: "Ubuntu",
        load: async () => {
            await import("@fontsource/ubuntu/300.css");
            await import("@fontsource/ubuntu/400.css");
            await import("@fontsource/ubuntu/500.css");
            await import("@fontsource/ubuntu/700.css");
            await import("@fontsource/ubuntu/400-italic.css");
        },
    },
    "Comic Neue": {
        name: "Comic Neue",
        load: async () => {
            await import("@fontsource/comic-neue/300.css");
            await import("@fontsource/comic-neue/400.css");
            await import("@fontsource/comic-neue/700.css");
            await import("@fontsource/comic-neue/400-italic.css");
        },
    },
};

export const MONOSPACE_FONTS: Record<
    MonospaceFonts,
    { name: string; load: () => void }
> = {
    "Fira Code": {
        name: "Fira Code",
        load: () => import("@fontsource/fira-code/400.css"),
    },
    "Roboto Mono": {
        name: "Roboto Mono",
        load: () => import("@fontsource/roboto-mono/400.css"),
    },
    "Source Code Pro": {
        name: "Source Code Pro",
        load: () => import("@fontsource/source-code-pro/400.css"),
    },
    "Space Mono": {
        name: "Space Mono",
        load: () => import("@fontsource/space-mono/400.css"),
    },
    "Ubuntu Mono": {
        name: "Ubuntu Mono",
        load: () => import("@fontsource/ubuntu-mono/400.css"),
    },
};

export const FONT_KEYS = Object.keys(FONTS).sort();
export const MONOSPACE_FONT_KEYS = Object.keys(MONOSPACE_FONTS).sort();

export const DEFAULT_FONT = "Open Sans";
export const DEFAULT_MONO_FONT = "Fira Code";

// Generated from https://gitlab.insrt.uk/revolt/community/themes
export const PRESETS: Record<string, Theme> = {
    light: {
        light: true,
        accent: "#FD6671",
        background: "#F6F6F6",
        foreground: "#000000",
        block: "#414141",
        "message-box": "#F1F1F1",
        mention: "rgba(251, 255, 0, 0.40)",
        success: "#65E572",
        warning: "#FAA352",
        error: "#ED4245",
        hover: "rgba(0, 0, 0, 0.2)",
        "scrollbar-thumb": "#CA525A",
        "scrollbar-track": "transparent",
        "primary-background": "#FFFFFF",
        "primary-header": "#F1F1F1",
        "secondary-background": "#F1F1F1",
        "secondary-foreground": "#1f1f1f",
        "secondary-header": "#F1F1F1",
        "tertiary-background": "#4D4D4D",
        "tertiary-foreground": "#3a3a3a",
        "status-online": "#3ABF7E",
        "status-away": "#F39F00",
        "status-busy": "#F84848",
        "status-streaming": "#977EFF",
        "status-invisible": "#A5A5A5",
    },
    dark: {
        light: false,
        accent: "#FD6671",
        background: "#191919",
        foreground: "#F6F6F6",
        block: "#2D2D2D",
        "message-box": "#363636",
        mention: "rgba(251, 255, 0, 0.06)",
        success: "#65E572",
        warning: "#FAA352",
        error: "#ED4245",
        hover: "rgba(0, 0, 0, 0.1)",
        "scrollbar-thumb": "#CA525A",
        "scrollbar-track": "transparent",
        "primary-background": "#242424",
        "primary-header": "#363636",
        "secondary-background": "#1E1E1E",
        "secondary-foreground": "#C8C8C8",
        "secondary-header": "#2D2D2D",
        "tertiary-background": "#4D4D4D",
        "tertiary-foreground": "#848484",
        "status-online": "#3ABF7E",
        "status-away": "#F39F00",
        "status-busy": "#F84848",
        "status-streaming": "#977EFF",
        "status-invisible": "#A5A5A5",
    },
};

// todo: store used themes locally
export function getBaseTheme(name: string): Theme {
    if (name in PRESETS) {
        return PRESETS[name]
    }

    const themes = getState().themes

    if (name in themes) {
        const { theme } = themes[name];

        return {
            ...PRESETS[theme.light ? 'light' : 'dark'],
            ...theme
        }
    }

    // how did we get here
    return PRESETS['dark']
}

const keys = Object.keys(PRESETS.dark);
const GlobalTheme = createGlobalStyle<{ theme: Theme }>`
:root {
	${(props) => generateVariables(props.theme)}
}
`;

export const generateVariables = (theme: Theme) => {
    return (Object.keys(theme) as Variables[]).map((key) => {
        if (!keys.includes(key)) return;
        return `--${key}: ${theme[key]};`;
    })
}

// Load the default default them and apply extras later
export const ThemeContext = createContext<Theme>(PRESETS["dark"]);

interface Props {
    children: Children;
    options?: ThemeOptions;
}

function Theme({ children, options }: Props) {
    const theme: Theme = {
        ...getBaseTheme(options?.base ?? 'dark'),
        ...options?.custom,
    };

    const root = document.documentElement.style;
    useEffect(() => {
        const font = theme.font ?? DEFAULT_FONT;
        root.setProperty("--font", `"${font}"`);
        FONTS[font].load();
    }, [root, theme.font]);

    useEffect(() => {
        const font = theme.monospaceFont ?? DEFAULT_MONO_FONT;
        root.setProperty("--monospace-font", `"${font}"`);
        MONOSPACE_FONTS[font].load();
    }, [root, theme.monospaceFont]);

    useEffect(() => {
        root.setProperty("--ligatures", options?.ligatures ? "normal" : "none");
    }, [root, options?.ligatures]);

    useEffect(() => {
        const resize = () =>
            root.setProperty("--app-height", `${window.innerHeight}px`);
        resize();

        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, [root]);

    return (
        <ThemeContext.Provider value={theme}>
            <Helmet>
                <meta name="theme-color" content={theme["background"]} />
            </Helmet>
            <GlobalTheme theme={theme} />
            {theme.css && (
                <style dangerouslySetInnerHTML={{ __html: theme.css }} />
            )}
            {children}
        </ThemeContext.Provider>
    );
}

export default connectState<{ children: Children }>(Theme, (state) => {
    return {
        options: state.settings.theme,
    };
});
