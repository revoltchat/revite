import styled, { css } from "styled-components";

interface Props {
    readonly contrast?: boolean;
    readonly plain?: boolean;
    readonly error?: boolean;
}

export default styled.button<Props>`
    z-index: 1;
    display: flex;
    height: 38px;
    min-width: 96px;
    align-items: center;
    justify-content: center;
    padding: 2px 16px;
    font-size: .875rem;
    font-family: inherit;
    font-weight: 500;

    transition: 0.2s ease opacity;
    transition: 0.2s ease background-color;

    background: var(--primary-background);
    color: var(--foreground);

    border-radius: 4px;
    cursor: pointer;
    border: none;

    &:hover {
        background: var(--secondary-header);
    }

    &:disabled {
        cursor: not-allowed;
        background: var(--primary-background);
    }

    &:active {
        background: var(--secondary-background);
    }

    ${(props) =>
        props.plain &&
        css`
            background: transparent !important;

            &:hover {
                text-decoration: underline;
            }

            &:disabled {
                cursor: not-allowed;
                opacity: .5;
            }

            &:active {
                background: var(--secondary-background);
            }
        `}

    ${(props) =>
        props.contrast &&
        css`
            padding: 4px 8px;
            background: var(--secondary-header);

            &:hover {
                background: var(--primary-header);
            }

            &:disabled {
                cursor: not-allowed;
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
                cursor: not-allowed;
                background: var(--error);
            }
        `}
`;
