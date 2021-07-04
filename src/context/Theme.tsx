import { isTouchscreenDevice } from "../lib/isTouchscreenDevice";
import { createGlobalStyle } from "styled-components";
import { connectState } from "../redux/connector";
import { Children } from "../types/Preact";
import { useEffect } from "preact/hooks";
import { createContext } from "preact";
import { Helmet } from "react-helmet";

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
    | "status-invisible"
    | "sidebar-active";

export type Theme = {
    [variable in Variables]: string;
} & {
    light?: boolean;
    css?: string;
};

export interface ThemeOptions {
    preset?: string;
    custom?: Partial<Theme>;
}

// Generated from https://gitlab.insrt.uk/revolt/community/themes
export const PRESETS: Record<string, Theme> = {
    light: {
        light: true,
        accent: "#FD6671",
        background: "#F6F6F6",
        foreground: "#101010",
        block: "#414141",
        "message-box": "#F1F1F1",
        mention: "rgba(251, 255, 0, 0.40)",
        success: "#65E572",
        warning: "#FAA352",
        error: "#F06464",
        hover: "rgba(0, 0, 0, 0.2)",
        "scrollbar-thumb": "#CA525A",
        "scrollbar-track": "transparent",
        "primary-background": "#FFFFFF",
        "primary-header": "#F1F1F1",
        "secondary-background": "#F1F1F1",
        "secondary-foreground": "#888888",
        "secondary-header": "#F1F1F1",
        "tertiary-background": "#4D4D4D",
        "tertiary-foreground": "#646464",
        "status-online": "#3ABF7E",
        "status-away": "#F39F00",
        "status-busy": "#F84848",
        "status-streaming": "#977EFF",
        "status-invisible": "#A5A5A5",
        "sidebar-active": "var(--secondary-background)"
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
        error: "#F06464",
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
        "sidebar-active": "var(--secondary-background)"
    },
};

const keys = Object.keys(PRESETS.dark);
const GlobalTheme = createGlobalStyle<{ theme: Theme }>`
:root {
	${(props) =>
        (Object.keys(props.theme) as Variables[]).map((key) => {
            if (!keys.includes(key)) return;
            return `--${key}: ${props.theme[key]};`;
        })}
}
`;

// Load the default default them and apply extras later
export const ThemeContext = createContext<Theme>(PRESETS['dark']);

interface Props {
    children: Children;
    options?: ThemeOptions;
}

function Theme(props: Props) {
    const theme: Theme = {
        ...PRESETS["dark"],
        ...PRESETS[props.options?.preset ?? ''],
        ...props.options?.custom
    };

    useEffect(() => {
        const resize = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        resize();

        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    return (
        <ThemeContext.Provider value={theme}>
            <Helmet>
                <meta
                    name="theme-color"
                    content={
                        isTouchscreenDevice
                            ? theme["primary-header"]
                            : theme["background"]
                    }
                />
            </Helmet>
            <GlobalTheme theme={theme} />
            {theme.css && (
                <style dangerouslySetInnerHTML={{ __html: theme.css }} />
            )}
            {props.children}
        </ThemeContext.Provider>
    );
}

export default connectState<{ children: Children }>(Theme, state => {
    return {
        options: state.settings.theme
    };
});
