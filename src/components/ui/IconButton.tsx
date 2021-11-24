import styled, { css } from "styled-components";

interface Props {
    rotate?: string;
    type?: "default" | "circle";
}

const normal = `var(--secondary-foreground)`;
const hover = `var(--foreground)`;

export default styled.button<Props>`
    z-index: 1;
    display: grid;
    cursor: pointer;
    place-items: center;

    transition: 0.1s ease all;

    fill: ${normal};
    color: ${normal};
    background: transparent;
    border: 0;

    a {
        color: ${normal};
    }

    svg {
        transition: 0.2s ease transform;
    }

    &:hover {
        fill: ${hover};
        color: ${hover};

        a {
            color: ${hover};
        }
    }

    ${(props) =>
        props.type === "circle" &&
        css`
            padding: 4px;
            border-radius: var(--border-radius-half);
            background-color: var(--secondary-header);

            &:hover {
                background-color: var(--primary-header);
            }
        `}

    ${(props) =>
        props.rotate &&
        css`
            svg {
                transform: rotateZ(${props.rotate});
            }
        `}
`;
