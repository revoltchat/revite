import { At, Reply as ReplyIcon } from "@styled-icons/boxicons-regular";
import { File, XCircle } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { SYSTEM_USER_ID } from "revolt.js";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { StateUpdater, useEffect } from "preact/hooks";

import { internalSubscribe } from "../../../../lib/eventEmitter";
import { useRenderState } from "../../../../lib/renderer/Singleton";

import { Reply } from "../../../../redux/reducers/queue";

import IconButton from "../../../ui/IconButton";

import Markdown from "../../../markdown/Markdown";
import UserShort from "../../user/UserShort";
import { SystemMessage } from "../SystemMessage";
import { ReplyBase } from "../attachments/MessageReply";

interface Props {
    channel: string;
    replies: Reply[];
    setReplies: StateUpdater<Reply[]>;
}

const Base = styled.div`
    display: flex;
    height: 30px;
    padding: 0 12px;
    user-select: none;
    align-items: center;
    background: var(--message-box);
        
        .username {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
        }
    }

    > div {
        flex-grow: 1;
        margin-bottom: 0;
    }

    .actions {
        gap: 12px;
        display: flex;
    }

    .toggle {
        gap: 4px;
        display: flex;
        font-size: 12px;
        align-items: center;
        font-weight: 600;
    }

    /*@media (pointer: coarse) { //FIXME: Make action buttons bigger on pointer coarse
        .actions > svg {
            height: 25px;
        }
    }*/
`;

// ! FIXME: Move to global config
const MAX_REPLIES = 5;
export default observer(({ channel, replies, setReplies }: Props) => {
    useEffect(() => {
        return internalSubscribe(
            "ReplyBar",
            "add",
            (id) =>
                replies.length < MAX_REPLIES &&
                !replies.find((x) => x.id === id) &&
                setReplies([...replies, { id, mention: false }]),
        );
    }, [replies]);

    const view = useRenderState(channel);
    if (view?.type !== "RENDER") return null;

    const ids = replies.map((x) => x.id);
    const messages = view.messages.filter((x) => ids.includes(x._id));

    return (
        <div>
            {replies.map((reply, index) => {
                const message = messages.find((x) => reply.id === x._id);
                // ! FIXME: better solution would be to
                // ! have a hook for resolving messages from
                // ! render state along with relevant users
                // -> which then fetches any unknown messages
                if (!message)
                    return (
                        <span>
                            <Text id="app.main.channel.misc.failed_load" />
                        </span>
                    );

                return (
                    <Base key={reply.id}>
                        <ReplyBase preview>
                            <ReplyIcon size={22} />
                            <div class="username">
                                <UserShort user={message.author} size={16} />
                            </div>
                            <div class="message">
                                {message.attachments && (
                                    <>
                                        <File size={16} />
                                        <em>{message.attachments.length > 1 ?
                                            "Sent multiple attachments" :
                                            "Sent an attachment"}</em>
                                    </>
                                )}
                                {message.author_id === SYSTEM_USER_ID ? (
                                    <SystemMessage message={message} />
                                ) : (
                                    <Markdown
                                        disallowBigEmoji
                                        content={(
                                            message.content as string
                                        ).replace(/\n/g, " ")}
                                    />
                                )}
                            </div>
                        </ReplyBase>
                        <span class="actions">
                            <IconButton
                                onClick={() =>
                                    setReplies(
                                        replies.map((_, i) =>
                                            i === index
                                                ? { ..._, mention: !_.mention }
                                                : _,
                                        ),
                                    )
                                }>
                                <span class="toggle">
                                    <At size={16} />{" "}
                                    {reply.mention ? "ON" : "OFF"}
                                </span>
                            </IconButton>
                            <IconButton
                                onClick={() =>
                                    setReplies(
                                        replies.filter((_, i) => i !== index),
                                    )
                                }>
                                <XCircle size={16} />
                            </IconButton>
                        </span>
                    </Base>
                );
            })}
        </div>
    );
});
