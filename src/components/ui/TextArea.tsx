import styled, { css } from "styled-components";

export interface TextAreaProps {
    code?: boolean;
    padding?: string;
    lineHeight?: string;
    hideBorder?: boolean;
}

export const TEXT_AREA_BORDER_WIDTH = 2;
export const DEFAULT_TEXT_AREA_PADDING = 16;
export const DEFAULT_LINE_HEIGHT = 20;

export default styled.textarea<TextAreaProps>`
    width: 100%;
    resize: none;
    display: block;
    color: var(--foreground);
    background: var(--secondary-background);
    padding: ${(props) => props.padding ?? "var(--textarea-padding)"};
    line-height: ${(props) =>
        props.lineHeight ?? "var(--textarea-line-height)"};

    ${(props) =>
        props.hideBorder &&
        css`
            border: none;
        `}

    ${(props) =>
        !props.hideBorder &&
        css`
            border-radius: var(--border-radius);
            transition: border-color 0.2s ease-in-out;
            border: var(--input-border-width) solid transparent;
        `}

    &:focus {
        outline: none;

        ${(props) =>
            !props.hideBorder &&
            css`
                border: var(--input-border-width) solid var(--accent);
            `}
    }

    ${(props) =>
        props.code
            ? css`
                  font-family: var(--monospace-font), monospace;
              `
            : css`
                  font-family: inherit;
              `}

    font-variant-ligatures: var(--ligatures);
`;
