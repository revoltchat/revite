import { Reply, File } from "@styled-icons/boxicons-regular";
import { SYSTEM_USER_ID } from "revolt.js";
import styled, { css } from "styled-components";

import { Text } from "preact-i18n";

import { useRenderState } from "../../../../lib/renderer/Singleton";

import { useForceUpdate, useUser } from "../../../../context/revoltjs/hooks";

import Markdown from "../../../markdown/Markdown";
import UserShort from "../../user/UserShort";
import { SystemMessage } from "../SystemMessage";
import { Users } from "revolt.js/dist/api/objects";
import { useHistory } from "react-router-dom";
import { useEffect, useLayoutEffect, useState } from "preact/hooks";
import { mapMessage, MessageObject } from "../../../../context/revoltjs/util";

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
        display: flex;
        gap: 4px;
        flex-shrink: 0;
        font-weight: 600;
        align-items: center;

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
        `}

    ${(props) =>
        props.preview &&
        css`
            margin-left: 0;
        `}
`;

export function MessageReply({ index, channel, id }: Props) {
    const ctx = useForceUpdate();
    const view = useRenderState(channel);
    if (view?.type !== "RENDER") return null;

    const [ message, setMessage ] = useState<MessageObject | undefined>(undefined);
    useLayoutEffect(() => {
        // ! FIXME: We should do this through the message renderer, so it can fetch it from cache if applicable.
        const m = view.messages.find((x) => x._id === id);

        if (m) {
            setMessage(m);
        } else {
            ctx.client.channels.fetchMessage(channel, id)
                .then(m => setMessage(mapMessage(m)));
        }
    }, [ view.messages ]);

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

    const user = useUser(message.author, ctx);
    const history = useHistory();

    return (
        <ReplyBase head={index === 0}>
            <Reply size={16} />
            { user?.relationship === Users.Relationship.Blocked ?
                <>Blocked User</> :
                <>
                    {message.author === SYSTEM_USER_ID ? (
                        <SystemMessage message={message} hideInfo />
                    ) : <>
                        <div className="user"><UserShort user={user} size={16} /></div>
                        <div className="content" onClick={() => {
                            let obj = ctx.client.channels.get(channel);
                            if (obj?.channel_type === 'TextChannel') {
                                history.push(`/server/${obj.server}/channel/${obj._id}/${message._id}`);
                            } else {
                                history.push(`/channel/${channel}/${message._id}`);
                            }
                        }}>
                            {message.attachments && message.attachments.length > 0 && (
                                <File size={16} />
                            )}
                            <Markdown
                                disallowBigEmoji
                                content={(message.content as string).replace(/\n/g, " ")}
                            />
                        </div>
                    </>}
                </>
            }
        </ReplyBase>
    );
}
