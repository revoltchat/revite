import styled, { css } from "styled-components";

interface Props {
    readonly contrast?: boolean;
    readonly error?: boolean;
}

export default styled.button<Props>`
    z-index: 1;
    padding: 8px;
    font-size: 16px;
    text-align: center;
    font-family: inherit;

    transition: 0.2s ease opacity;
    transition: 0.2s ease background-color;

    background: var(--primary-background);
    color: var(--foreground);

    border-radius: 6px;
    cursor: pointer;
    border: none;

    &:hover {
        background: var(--secondary-header);
    }

    &:disabled {
        background: var(--primary-background);
    }

    &:active {
        background: var(--secondary-background);
    }

    ${(props) =>
        props.contrast &&
        css`
            padding: 4px 8px;
            background: var(--secondary-header);

            &:hover {
                background: var(--primary-header);
            }

            &:disabled {
                background: var(--secondary-header);
            }

            &:active {
                background: var(--secondary-background);
            }
        `}

    ${(props) =>
        props.error &&
        css`
            color: white;
            background: var(--error);

            &:hover {
                filter: brightness(1.2);
                background: var(--error);
            }

            &:disabled {
                background: var(--error);
            }
        `}
`;
