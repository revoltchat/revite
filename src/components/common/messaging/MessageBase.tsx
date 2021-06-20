import dayjs from "dayjs";
import styled, { css } from "styled-components";
import { decodeTime } from "ulid";
import { MessageObject } from "../../../context/revoltjs/util";

export interface BaseMessageProps {
    head?: boolean,
    status?: boolean,
    mention?: boolean,
    blocked?: boolean,
    sending?: boolean,
    contrast?: boolean
}

export default styled.div<BaseMessageProps>`
    display: flex;
    overflow-x: none;
    padding: .125rem;
    flex-direction: row;
    padding-right: 16px;

    ${ props => props.contrast && css`
        padding: .3rem;
        border-radius: 4px;
        background: var(--hover);
    ` }

    ${ props => props.head && css`
        margin-top: 12px;
    ` }

    ${ props => props.mention && css`
        background: var(--mention);
    ` }

    ${ props => props.blocked && css`
        filter: blur(4px);
        transition: 0.2s ease filter;

        &:hover {
            filter: none;
        }
    ` }

    ${ props => props.sending && css`
        opacity: 0.8;
        color: var(--tertiary-foreground);
    ` }

    ${ props => props.status && css`
        color: var(--error);
    ` }
    
    .copy {
        width: 0;
        opacity: 0;
    }

    &:hover {
        background: var(--hover);

        time {
            opacity: 1;
        }
    }
`;

export const MessageInfo = styled.div`
    width: 62px;
    display: flex;
    flex-shrink: 0;
    padding-top: 2px;
    flex-direction: row;
    justify-content: center;

    ::selection {
        background-color: transparent;
        color: var(--tertiary-foreground);
    }

    time {
        opacity: 0;
        cursor: default;
        display: inline;
        font-size: 10px;
        padding-top: 1px;
        color: var(--tertiary-foreground);
    }
`;

export const MessageContent = styled.div`
    min-width: 0;
    flex-grow: 1;
    display: flex;
    overflow: hidden;
    font-size: 0.875rem;
    flex-direction: column;
    justify-content: center;
`;

export function MessageDetail({ message }: { message: MessageObject }) {
    return (
        <>
            <time>
                <i className="copy">[</i>
                {dayjs(decodeTime(message._id)).format("H:mm")}
                <i className="copy">]</i>
            </time>
        </>
    )
}
