import { Attachment } from "revolt.js/dist/api/objects";
import styled, { css } from "styled-components";

export interface IconBaseProps<T> {
    target?: T;
    attachment?: Attachment;

    size: number;
    animate?: boolean;
}

interface IconModifiers {
    square?: boolean;
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
                border-radius: 50%;
            `}
    }
`;

export const ImageIconBase = styled.img<IconModifiers>`
    flex-shrink: 0;
    object-fit: cover;

    ${(props) =>
        !props.square &&
        css`
            border-radius: 50%;
        `}
`;
