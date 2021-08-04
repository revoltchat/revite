import { Reply } from "@styled-icons/boxicons-regular";
import { File } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { RelationshipStatus } from "revolt-api/types/Users";
import { SYSTEM_USER_ID } from "revolt.js";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Message } from "revolt.js/dist/maps/Messages";
import styled, { css } from "styled-components";

import { Text } from "preact-i18n";
import { useLayoutEffect, useState } from "preact/hooks";

import { useRenderState } from "../../../../lib/renderer/Singleton";

import { useClient } from "../../../../context/revoltjs/RevoltClient";

import Markdown from "../../../markdown/Markdown";
import UserShort from "../../user/UserShort";
import { SystemMessage } from "../SystemMessage";

interface Props {
    channel: Channel;
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
        gap: 6px;
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

        /*> span > p {
            display: flex;
        }*/
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
    const view = useRenderState(channel._id);
    if (view?.type !== "RENDER") return null;

    const [message, setMessage] = useState<Message | undefined>(undefined);

    useLayoutEffect(() => {
        // ! FIXME: We should do this through the message renderer, so it can fetch it from cache if applicable.
        const m = view.messages.find((x) => x._id === id);

        if (m) {
            setMessage(m);
        } else {
            channel.fetchMessage(id).then(setMessage);
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

    const history = useHistory();

    return (
        <ReplyBase head={index === 0}>
            <Reply size={16} />
            {message.author?.relationship === RelationshipStatus.Blocked ? (
                <>
                    <Text id="app.main.channel.misc.blocked_user" />
                </>
            ) : (
                <>
                    {message.author_id === SYSTEM_USER_ID ? (
                        <SystemMessage message={message} hideInfo />
                    ) : (
                        <>
                            <div className="user">
                                <UserShort user={message.author} size={16} />
                            </div>
                            <div
                                className="content"
                                onClick={() => {
                                    const channel = message.channel!;
                                    if (
                                        channel.channel_type === "TextChannel"
                                    ) {
                                        console.log(
                                            `/server/${channel.server_id}/channel/${channel._id}/${message._id}`,
                                        );
                                        history.push(
                                            `/server/${channel.server_id}/channel/${channel._id}/${message._id}`,
                                        );
                                    } else {
                                        history.push(
                                            `/channel/${channel._id}/${message._id}`,
                                        );
                                    }
                                }}>
                                {message.attachments &&
                                    message.attachments.length > 0 && (
                                        <>
                                            <File size={16} />
                                            <em>
                                                {message.attachments.length >
                                                0 ? (
                                                    <Text id="app.main.channel.misc.sent_multiple_files" />
                                                ) : (
                                                    <Text id="app.main.channel.misc.sent_file" />
                                                )}
                                            </em>
                                        </>
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
