import styled, { css } from "styled-components/macro";

interface Props {
    readonly compact?: boolean;
    readonly accent?: boolean;
    readonly contrast?: boolean;
    readonly plain?: boolean;
    readonly error?: boolean;
    readonly gold?: boolean;
    readonly iconbutton?: boolean;
}

export type ButtonProps = Props &
    Omit<JSX.HTMLAttributes<HTMLButtonElement>, "as">;

export default styled.button<Props>`
    //z-index: 1;
    display: flex;
    height: 38px;
    min-width: 96px;
    align-items: center;
    justify-content: center;
    padding: 2px 16px;
    font-size: 0.8125rem;
    font-family: inherit;
    font-weight: 500;
    flex-shrink: 0;

    transition: 0.2s ease opacity;
    transition: 0.2s ease background-color;

    background: var(--primary-background);
    color: var(--foreground);

    border-radius: var(--border-radius);
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
        props.compact &&
        css`
            height: 32px !important;
            padding: 2px 12px !important;
            font-size: 13px;
        `}

    ${(props) =>
        props.iconbutton &&
        css`
            height: 38px !important;
            width: 38px !important;
            min-width: unset !important;
        `}

    ${(props) =>
        props.accent &&
        css`
            background: var(--accent) !important;
        `}

    ${(props) =>
        props.plain &&
        css`
            background: transparent !important;

            &:hover {
                text-decoration: underline;
            }

            &:disabled {
                cursor: not-allowed;
                opacity: 0.5;
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
            font-weight: 600;
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
    
    ${(props) =>
        props.gold &&
        css`
            color: black;
            font-weight: 600;
            background: goldenrod;

            &:hover {
                filter: brightness(1.2);
                background: goldenrod;
            }

            &:disabled {
                cursor: not-allowed;
                background: goldenrod;
            }
        `}
`;
