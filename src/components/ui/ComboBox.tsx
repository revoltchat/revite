import styled from "styled-components/macro";

export default styled.select`
    width: 100%;
    padding: 10px;
    cursor: pointer;
    border-radius: var(--border-radius);
    font-weight: 500;
    font-family: inherit;
    font-size: var(--text-size);
    color: var(--secondary-foreground);
    background: var(--secondary-background);

    border: none;
    outline: 2px solid transparent;
    transition: box-shadow 0.2s ease-in-out;
    transition: outline-color 0.2s ease-in-out;

    &:focus {
        box-shadow: 0 0 0 1.5pt var(--accent);
    }

    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
`;
