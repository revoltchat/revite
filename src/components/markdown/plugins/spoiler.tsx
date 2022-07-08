import styled, { css } from "styled-components";

import { useState } from "preact/hooks";

import { createComponent, CustomComponentProps } from "./remarkRegexComponent";

const Spoiler = styled.span<{ shown: boolean }>`
    padding: 0 2px;
    cursor: pointer;
    user-select: none;
    color: transparent;
    background: #151515;
    border-radius: var(--border-radius);

    > * {
        opacity: 0;
        pointer-events: none;
    }

    ${(props) =>
        props.shown &&
        css`
            cursor: auto;
            user-select: all;
            color: var(--foreground);
            background: var(--secondary-background);

            > * {
                opacity: 1;
                pointer-events: unset;
            }
        `}
`;

export function RenderSpoiler({ match }: CustomComponentProps) {
    const [shown, setShown] = useState(false);

    return (
        <Spoiler shown={shown} onClick={() => setShown(true)}>
            {match}
        </Spoiler>
    );
}

export const remarkSpoiler = createComponent("spoiler", /!!([^!]+)!!/g);
