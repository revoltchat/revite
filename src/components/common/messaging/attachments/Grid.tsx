import styled from "styled-components";

import { Children } from "../../../../types/Preact";

const Grid = styled.div`
    display: grid;

    aspect-ratio: var(--aspect-ratio);

    max-width: min(100%, var(--width), var(--attachment-max-width));
    max-height: min(var(--height), var(--attachment-max-height));

    img, video {
        grid-area: 1 / 1;
        
        display: block;

        max-width: 100%;
        max-height: 100%;

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
    style?: JSX.CSSProperties;
    children?: Children;
    width: number;
    height: number;
};

export function SizedGrid(props: Props) {
    const { width, height, children, style, ...divProps } = props;

    return (
        <Grid
            {...divProps}
            style={{
                ...style,
                "--width": `${width}px`,
                "--height": `${height}px`,
                "--aspect-ratio": `${width} / ${height}`,
            }}>
            {children}
        </Grid>
    );
}
