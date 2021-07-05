import styled, { css } from "styled-components";

interface Props {
    readonly contrast?: boolean;
}

export default styled.input<Props>`
    z-index: 1;
    padding: 8px 16px;
    border-radius: 6px;
    
    font-family: inherit;
    color: var(--foreground);
    background: var(--primary-background);
    transition: 0.2s ease background-color;
    
    border: none;
    outline: 2px solid transparent;
    transition: outline-color 0.2s ease-in-out;

    &:hover {
        background: var(--secondary-background);
    }

    &:focus {
        outline: 2px solid var(--accent);
    }

    ${(props) =>
        props.contrast &&
        css`
            color: var(--secondary-foreground);
            background: var(--secondary-background);

            &:hover {
                background: var(--hover);
            }
        `}
`;
