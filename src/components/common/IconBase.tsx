import { Attachment } from "revolt.js/dist/api/objects";
import styled, { css } from "styled-components";

export interface IconBaseProps<T> {
    target?: T;
    attachment?: Attachment;

    size: number;
    animate?: boolean;
}

export default styled.svg<{ square?: boolean }>`
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;

        ${ props => !props.square && css`
            border-radius: 50%;
        ` }
    }
`;
