import { Reply } from "@styled-icons/boxicons-regular";
import { File } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Channel, Message, API } from "revolt.js";
import styled, { css } from "styled-components/macro";

import { Text } from "preact-i18n";
import { useLayoutEffect, useState } from "preact/hooks";

import { getRenderer } from "../../../../lib/renderer/Singleton";

import Markdown from "../../../markdown/Markdown";
import UserShort from "../../user/UserShort";
import { SystemMessage } from "../SystemMessage";

interface Props {
    parent_mentions: string[];
    channel?: Channel;
    index: number;
    id: string;
}

export const ReplyBase = styled.div<{
    head?: boolean;
    fail?: boolean;
    preview?: boolean;
}>`
    gap: 8px;
    min-width: 0;
    display: flex;
    margin-inline-start: 30px;
    margin-inline-end: 12px;
    font-size: 0.8em;
    user-select: none;
    align-items: end;
    color: var(--secondary-foreground);

    &::before {
        content: "";
        flex-shrink: 0;
        width: 22px;
        height: 10px;
        border-inline-start: 2px solid var(--message-box);
        border-top: 2px solid var(--message-box);
        align-self: flex-end;
    }

    * {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .user {
        //margin-inline-start: 12px;
        gap: 6px;
        display: flex;
        flex-shrink: 0;
        font-weight: 600;
        overflow: visible;
        align-items: center;
        padding: 2px 0;

        span {
            cursor: pointer;
            &:hover {
                text-decoration: underline;
            }
        }
    }

    .content {
        max-height: 32px;

        gap: 4px;
        display: flex;
        padding: 2px 0;
        cursor: pointer;
        overflow: hidden;
        align-items: center;
        flex-direction: row;

        transition: filter 1s ease-in-out;
        transition: transform ease-in-out 0.1s;
        filter: brightness(1);

        > svg {
            flex-shrink: 0;
        }

        > span > p {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        &:hover {
            filter: brightness(2);
        }

        &:active {
            transform: translateY(1px);
        }

        > * {
            pointer-events: none;
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

            &::before {
                border-start-start-radius: 4px;
            }
        `}

    ${(props) =>
        props.preview &&
        css`
            margin-left: 0;
        `}
`;

export const MessageReply = observer(
    ({ index, channel, id, parent_mentions }: Props) => {
        if (!channel) return null;

        const view = getRenderer(channel);
        if (view.state !== "RENDER") return null;

        const [message, setMessage] = useState<Message | undefined>(undefined);

        useLayoutEffect(() => {
            const message = channel.client.messages.get(id);
            if (message) {
                setMessage(message);
            } else {
                channel.fetchMessage(id).then(setMessage);
            }
        }, [id, channel, view.messages]);

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
                {/*<Reply size={16} />*/}

                {message.author?.relationship === "Blocked" ? (
                    <Text id="app.main.channel.misc.blocked_user" />
                ) : (
                    <>
                        {message.author_id === "00000000000000000000000000" ? (
                            <SystemMessage message={message} hideInfo />
                        ) : (
                            <>
                                <div className="user">
                                    <UserShort
                                        size={14}
                                        showServerIdentity
                                        user={message.author}
                                        masquerade={message.masquerade!}
                                        prefixAt={parent_mentions.includes(
                                            message.author_id,
                                        )}
                                    />
                                </div>
                                <div
                                    className="content"
                                    onClick={() => {
                                        const channel = message.channel!;
                                        if (
                                            channel.channel_type ===
                                            "TextChannel"
                                        ) {
                                            history.push(
                                                `/server/${channel.server_id}/channel/${channel._id}/${message._id}`,
                                            );
                                        } else {
                                            history.push(
                                                `/channel/${channel._id}/${message._id}`,
                                            );
                                        }
                                    }}>
                                    {message.attachments && (
                                        <>
                                            <File size={16} />
                                            <em>
                                                {message.attachments.length >
                                                1 ? (
                                                    <Text id="app.main.channel.misc.sent_multiple_files" />
                                                ) : (
                                                    <Text id="app.main.channel.misc.sent_file" />
                                                )}
                                            </em>
                                        </>
                                    )}
                                    {message.content && (
                                        <Markdown
                                            disallowBigEmoji
                                            content={message.content.replace(
                                                /\n/g,
                                                " ",
                                            )}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </ReplyBase>
        );
    },
);
