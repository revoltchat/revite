import styled from "styled-components/macro";

import { Text } from "preact-i18n";

import darkSVG from "./assets/dark.svg";
import lightSVG from "./assets/light.svg";

const List = styled.div`
    gap: 8px;
    width: 100%;
    display: flex;
    margin-bottom: 15px;

    > div {
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    img {
        cursor: pointer;
        border-radius: var(--border-radius);
        transition: border 0.3s;
        border: 3px solid transparent;
        width: 100%;

        &[data-active="true"] {
            cursor: default;
            border: 3px solid var(--accent);

            &:hover {
                border: 3px solid var(--accent);
            }
        }

        &:hover {
            border: 3px solid var(--tertiary-background);
        }
    }
`;

interface Props {
    value?: "light" | "dark";
    setValue: (base: "light" | "dark") => void;
}

export function ThemeBaseSelector({ value, setValue }: Props) {
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.theme" />
            </h3>
            <List>
                <div>
                    <img
                        loading="eager"
                        src={lightSVG}
                        draggable={false}
                        data-active={value === "light"}
                        onClick={() => setValue("light")}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                    <h4>
                        <Text id="app.settings.pages.appearance.color.light" />
                    </h4>
                </div>
                <div>
                    <img
                        loading="eager"
                        src={darkSVG}
                        draggable={false}
                        data-active={value === "dark"}
                        onClick={() => setValue("dark")}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                    <h4>
                        <Text id="app.settings.pages.appearance.color.dark" />
                    </h4>
                </div>
            </List>
        </>
    );
}
