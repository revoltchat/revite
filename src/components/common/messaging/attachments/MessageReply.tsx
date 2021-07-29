import { Reply } from "@styled-icons/boxicons-regular";
import { File } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { SYSTEM_USER_ID } from "revolt.js";
import { Users } from "revolt.js/dist/api/objects";
import styled, { css } from "styled-components";

import { Text } from "preact-i18n";
import { useLayoutEffect, useState } from "preact/hooks";

import { useRenderState } from "../../../../lib/renderer/Singleton";

import { useData } from "../../../../mobx/State";

import { useClient } from "../../../../context/revoltjs/RevoltClient";
import { mapMessage, MessageObject } from "../../../../context/revoltjs/util";

import Markdown from "../../../markdown/Markdown";
import UserShort from "../../user/UserShort";
import { SystemMessage } from "../SystemMessage";

interface Props {
    channel: string;
    index: number;
    id: string;
}

export const ReplyBase = styled.div<{
    head?: boolean;
    fail?: boolean;
    preview?: boolean;
}>`
    gap: 4px;
    min-width: 0;
    display: flex;
    margin-inline-start: 30px;
    margin-inline-end: 12px;
    margin-bottom: 4px;
    font-size: 0.8em;
    user-select: none;
    align-items: center;
    color: var(--secondary-foreground);

    * {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .user {
        gap: 4px;
        display: flex;
        flex-shrink: 0;
        font-weight: 600;
        overflow: visible;
        align-items: center;

        span {
            cursor: pointer;
            &:hover {
                text-decoration: underline;
            }
        }

        /*&::before {
            position:relative;
            width: 50px;
            height: 2px;
            background: red;
        }*/
    }

    .content {
        gap: 4px;
        display: flex;
        cursor: pointer;
        align-items: center;
        flex-direction: row;
        transition: filter 1s ease-in-out;
        transition: transform ease-in-out 0.1s;
        filter: brightness(1);

        &:hover {
            filter: brightness(2);
        }

        &:active {
            transform: translateY(1px);
        }

        > * {
            pointer-events: none;
        }

        > span {
            display: flex;
        }
    }

    > svg:first-child {
        flex-shrink: 0;
        transform: scaleX(-1);
        color: var(--tertiary-foreground);
    }

    ${(props) =>
        props.fail &&
        css`
            color: var(--tertiary-foreground);
        `}

    ${(props) =>
        props.head &&
        css`
            margin-top: 12px;
        `}

    ${(props) =>
        props.preview &&
        css`
            margin-left: 0;
        `}
`;

export const MessageReply = observer(({ index, channel, id }: Props) => {
    const client = useClient();
    const view = useRenderState(channel);
    if (view?.type !== "RENDER") return null;

    const [message, setMessage] = useState<MessageObject | undefined>(
        undefined,
    );
    useLayoutEffect(() => {
        // ! FIXME: We should do this through the message renderer, so it can fetch it from cache if applicable.
        const m = view.messages.find((x) => x._id === id);

        if (m) {
            setMessage(m);
        } else {
            client.channels
                .fetchMessage(channel, id)
                .then((m) => setMessage(mapMessage(m)));
        }
    }, [view.messages]);

    if (!message) {
        return (
            <ReplyBase head={index === 0} fail>
                <Reply size={16} />
                <span>
                    <Text id="app.main.channel.misc.failed_load" />
                </span>
            </ReplyBase>
        );
    }

    const store = useData();
    const user = store.users.get(message.author);
    const history = useHistory();

    return (
        <ReplyBase head={index === 0}>
            <Reply size={16} />
            {user?.relationship === Users.Relationship.Blocked ? (
                <>
                    <Text id="app.main.channel.misc.blocked_user" />
                </>
            ) : (
                <>
                    {message.author === SYSTEM_USER_ID ? (
                        <SystemMessage message={message} hideInfo />
                    ) : (
                        <>
                            <div className="user">
                                <UserShort user={user} size={16} />
                            </div>
                            <div
                                className="content"
                                onClick={() => {
                                    const obj = client.channels.get(channel);
                                    if (obj?.channel_type === "TextChannel") {
                                        history.push(
                                            `/server/${obj.server}/channel/${obj._id}/${message._id}`,
                                        );
                                    } else {
                                        history.push(
                                            `/channel/${channel}/${message._id}`,
                                        );
                                    }
                                }}>
                                {message.attachments &&
                                    message.attachments.length > 0 && (
                                        <File size={16} />
                                    )}
                                <Markdown
                                    disallowBigEmoji
                                    content={(
                                        message.content as string
                                    ).replace(/\n/g, " ")}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </ReplyBase>
    );
});
