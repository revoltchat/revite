import styled, { css } from "styled-components";

interface Props {
    rotate?: string;
    type?: "default" | "circle";
}

const normal = `var(--secondary-foreground)`;
const hover = `var(--foreground)`;

export default styled.div<Props>`
    z-index: 1;
    display: grid;
    cursor: pointer;
    place-items: center;
    transition: 0.1s ease background-color;

    fill: ${normal};
    color: ${normal};
    /*stroke: ${normal};*/

    a {
        color: ${normal};
    }

    svg {
        transition: 0.2s ease transform;
    }

    &:hover {
        fill: ${hover};
        color: ${hover};
        /*stroke: ${hover};*/

        a {
            color: ${hover};
        }
    }

    ${(props) =>
        props.type === "circle" &&
        css`
            padding: 4px;
            border-radius: 50%;
            background-color: var(--secondary-header);

            &:hover {
                background-color: var(--primary-header);
            }
        `}

    ${(props) => props.rotate && css`
        svg {
            transform: rotateZ(${props.rotate});
        }
    ` }
`;
