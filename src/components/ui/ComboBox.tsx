import styled from "styled-components";

export default styled.select`
    padding: 10px;
    border-radius: 6px;
    font-family: inherit;
    color: var(--secondary-foreground);
    background: var(--secondary-background);
    font-size: var(--text-size);
    border: none;
    outline: 2px solid transparent;
    transition: outline-color 0.2s ease-in-out;
    transition: box-shadow 0.2s ease-in-out;
    cursor: pointer;
    width: 100%;

    &:focus {
        box-shadow: 0 0 0 1.5pt var(--accent);
    }
`;
