import styled from "styled-components";

import { Children } from "../../../../types/Preact";

const Grid = styled.div<{ width: number; height: number }>`
    display: grid;
    aspect-ratio: ${(props) => props.width} / ${(props) => props.height};

    max-width: min(
        100%,
        ${(props) => props.width}px,
        var(--attachment-max-width)
    );

    max-height: min(${(props) => props.height}px, var(--attachment-max-height));

    @supports not (
        aspect-ratio: ${(props) => props.width} / ${(props) => props.height}
    ) {
        div::before {
            float: left;
            padding-top: ${(props) => (props.height / props.width) * 100}%;
            content: "";
        }

        div::after {
            display: block;
            content: "";
            clear: both;
        }
    }

    img,
    video {
        grid-area: 1 / 1;

        display: block;

        max-width: 100%;
        max-height: 100%;

        overflow: hidden;

        object-fit: contain;
    }

    video {
        width: 100%;
        height: 100%;
    }

    &.spoiler {
        img,
        video {
            filter: blur(44px);
        }

        border-radius: var(--border-radius);
    }
`;

export default Grid;

type Props = Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "children" | "as" | "style"
> & {
    children?: Children;
    width: number;
    height: number;
};

export function SizedGrid(props: Props) {
    const { width, height, children, ...divProps } = props;

    return (
        <Grid {...divProps} width={width} height={height}>
            {children}
        </Grid>
    );
}
