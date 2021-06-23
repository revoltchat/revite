import dayjs from "dayjs";
import Tooltip from "../Tooltip";
import { decodeTime } from "ulid";
import { Text } from "preact-i18n";
import styled, { css } from "styled-components";
import { MessageObject } from "../../../context/revoltjs/util";

export interface BaseMessageProps {
    head?: boolean,
    failed?: boolean,
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

    ${ props => props.failed && css`
        color: var(--error);
    ` }

    .author {
        gap: 8px;
        display: flex;
        align-items: center;
    }
    
    .copy {
        width: 0;
        height: 0;
        opacity: 0;
        display: block;
        overflow: hidden;
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
    }

    time, .edited {
        cursor: default;
        display: inline;
        font-size: 10px;
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

export const DetailBase = styled.div`
    gap: 4px;
    font-size: 10px;
    display: inline-flex;
    color: var(--tertiary-foreground);
`;

export function MessageDetail({ message, position }: { message: MessageObject, position: 'left' | 'top' }) {
    if (position === 'left') {
        if (message.edited) {
            return (
                <>
                    <span className="copy">
                        [<time>{dayjs(decodeTime(message._id)).format("H:mm")}</time>]
                    </span>
                    <span className="edited">
                        <Tooltip content={dayjs(message.edited).format("LLLL")}>
                            <Text id="app.main.channel.edited" />
                        </Tooltip>
                    </span>
                </>
            )
        } else {
            return (
                <>
                    <time>
                        <i className="copy">[</i>
                        { dayjs(decodeTime(message._id)).format("H:mm") }
                        <i className="copy">]</i>
                    </time>
                </>
            )
        }
    }

    return (
        <DetailBase>
            <time>
                {dayjs(decodeTime(message._id)).calendar()}
            </time>
            { message.edited && <Tooltip content={dayjs(message.edited).format("LLLL")}>
                <Text id="app.main.channel.edited" />
            </Tooltip> }
        </DetailBase>
    )
}
