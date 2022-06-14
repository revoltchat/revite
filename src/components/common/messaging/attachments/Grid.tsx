import styled from "styled-components/macro";

import { Ref } from "preact";

const Grid = styled.div<{ width: number; height: number }>`
    --width: ${(props) => props.width}px;
    --height: ${(props) => props.height}px;

    display: grid;
    overflow: hidden;
    aspect-ratio: ${(props) => props.width} / ${(props) => props.height};

    max-width: min(var(--width), var(--attachment-max-width));
    max-height: min(var(--height), var(--attachment-max-height));

    // This is a hack for browsers not supporting aspect-ratio.
    // Stolen from https://codepen.io/una/pen/BazyaOM.
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

        // It's something
        object-position: left;
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
    innerRef?: Ref<any>;
};

export function SizedGrid(props: Props) {
    const { width, height, children, innerRef, ...divProps } = props;

    return (
        <Grid {...divProps} width={width} height={height} ref={innerRef}>
            {children}
        </Grid>
    );
}
