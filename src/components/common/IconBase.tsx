import { Attachment } from "revolt-api/types/Autumn";
import styled, { css } from "styled-components";

export interface IconBaseProps<T> {
    target?: T;
    attachment?: Attachment;

    size: number;
    hover?: boolean;
    animate?: boolean;
}

interface IconModifiers {
    square?: boolean;
    hover?: boolean;
}

export default styled.svg<IconModifiers>`
    flex-shrink: 0;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;

        ${(props) =>
            !props.square &&
            css`
                border-radius: var(--border-radius-half);
            `}
    }

    ${(props) =>
        props.hover &&
        css`
            &:hover .icon {
                filter: brightness(0.8);
            }
        `}
`;

export const ImageIconBase = styled.img<IconModifiers>`
    flex-shrink: 0;
    object-fit: cover;

    ${(props) =>
        !props.square &&
        css`
            border-radius: var(--border-radius-half);
        `}

    ${(props) =>
        props.hover &&
        css`
            &:hover img {
                filter: brightness(0.8);
            }
        `}
`;
