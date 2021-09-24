import styled, { css } from "styled-components";

import { Children } from "../../../../types/Preact";

const Grid = styled.div<{ width: number; height: number }>`
    --width: ${props => props.width};
    --height: ${props => props.height};
    --width-px: calc(var(--width) * 1px);
    --height-px: calc(var(--height) * 1px);
    --fixed-width-px: min(var(--width-px), var(--attachment-max-width), 100%);
    --fixed-height-px: min(var(--height-px), var(--attachment-max-height), 100%);
    --aspect: calc(var(--width) / var(--height));
    --aspect-width-px: calc(var(--fixed-height-px) * var(--aspect));
    --aspect-height-px: calc(var(--fixed-width-px) * var(--aspect));
    
    aspect-ratio: var(--width) / var(--height);
    
    ${props => props.width > props.height && css`width: var(--fixed-width-px)`};
    ${props => props.width <= props.height && css`
        width: var(--aspect-width-px);
        height: var(--fixed-height-px);
    `};
  
    max-width: 100%;
    
    display: grid;

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
};

export function SizedGrid(props: Props) {
    const { width, height, children, ...divProps } = props;

    return (
        <Grid {...divProps} width={width} height={height}>
            {children}
        </Grid>
    );
}
