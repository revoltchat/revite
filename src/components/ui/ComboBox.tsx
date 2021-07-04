import styled from "styled-components";

export default styled.select`
    padding: 8px;
    border-radius: 2px;
    font-family: inherit;
    color: var(--secondary-foreground);
    background: var(--secondary-background);

    border: none;
    outline: 2px solid transparent;
    transition: outline-color 0.2s ease-in-out;

    &:focus {
        outline-color: var(--accent);
    }
`;
