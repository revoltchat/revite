import styled from "styled-components";
import { Children } from "../../../../types/Preact";

const Grid = styled.div`
    display: grid;
    max-width: min(var(--attachment-max-width), 100%, var(--width));
    max-height: min(var(--attachment-max-height), var(--height));
    aspect-ratio: var(--aspect-ratio);

    img, video {
        min-width: 100%;
        min-height: 100%;

        width: auto;
        height: auto;

        max-width: 100%;
        max-height: 100%;

        grid-area: 1 / 1;
    }
`;

export default Grid;

type Props = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'as' | 'style'> & {
    style?: JSX.CSSProperties,
    children?: Children,
    width: number,
    height: number,
};

export function SizedGrid(props: Props) {
    const { width, height, children, style, ...divProps } = props;

    return (
        <Grid {...divProps}
            style={{
                ...style,
                "--width": width + 'px',
                "--height": height + 'px',
                "--aspect-ratio": width / height,
            }}>
            { children }
        </Grid>
    )
}
