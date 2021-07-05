import styled from "styled-components";

export default styled.select`
    padding: 8px;
    border-radius: 6px;
    font-family: inherit;
    color: var(--secondary-foreground);
    background: var(--secondary-background);
    font-size: 0.875rem;
    border: none;
    outline: 2px solid transparent;
    transition: outline-color 0.2s ease-in-out;
    transition: box-shadow 0.3s;
    cursor: pointer;
    width: 100%;

    &:focus {
        box-shadow: 0 0 0 2pt var(--accent);
    }
`;
