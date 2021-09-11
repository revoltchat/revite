import { At, Reply as ReplyIcon } from "@styled-icons/boxicons-regular";
import { File, XCircle } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Message } from "revolt.js/dist/maps/Messages";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { StateUpdater, useEffect } from "preact/hooks";

import { internalSubscribe } from "../../../../lib/eventEmitter";
import { getRenderer } from "../../../../lib/renderer/Singleton";

import { dispatch, getState } from "../../../../redux";
import { Reply } from "../../../../redux/reducers/queue";

import { useClient } from "../../../../context/revoltjs/RevoltClient";

import IconButton from "../../../ui/IconButton";

import Markdown from "../../../markdown/Markdown";
import UserShort from "../../user/UserShort";
import { SystemMessage } from "../SystemMessage";
import { ReplyBase } from "../attachments/MessageReply";

interface Props {
    channel: Channel;
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

    > div {
        flex-grow: 1;
        margin-bottom: 0;

        &::before {
            display: none;
        }
    }

    .toggle {
        gap: 2px;
        display: flex;
        font-size: 12px;
        align-items: center;
        font-weight: 600;
        text-transform: uppercase;
        min-width: 6ch;
    }

    .username {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
    }

    .message {
        display: flex;
    }

    .actions {
        gap: 12px;
        display: flex;
    }

    /*@media (pointer: coarse) { //FIXME: Make action buttons bigger on pointer coarse
        .actions > svg {
            height: 25px;
        }
    }*/
`;

// ! FIXME: Move to global config
const MAX_REPLIES = 4;
export default observer(({ channel, replies, setReplies }: Props) => {
    const client = useClient();

    useEffect(() => {
        return internalSubscribe("ReplyBar", "add", (_message) => {
            const message = _message as Message;
            if (
                replies.length >= MAX_REPLIES ||
                replies.find((x) => x.id === message._id)
            )
                return;

            setReplies([
                ...replies,
                {
                    id: message._id,
                    mention:
                        message.author_id === client.user!._id
                            ? false
                            : getState().sectionToggle.mention ?? false,
                },
            ]);
        });
    }, [replies, setReplies, client.user]);

    const renderer = getRenderer(channel);
    if (renderer.state !== "RENDER") return null;

    const ids = replies.map((x) => x.id);
    const messages = renderer.messages.filter((x) => ids.includes(x._id));

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
                                <UserShort
                                    user={message.author}
                                    size={16}
                                    showServerIdentity
                                />
                            </div>
                            <div class="message">
                                {message.attachments && (
                                    <>
                                        <File size={16} />
                                        <em>
                                            {message.attachments.length > 1 ? (
                                                <Text id="app.main.channel.misc.sent_multiple_files" />
                                            ) : (
                                                <Text id="app.main.channel.misc.sent_file" />
                                            )}
                                        </em>
                                    </>
                                )}
                                {message.author_id ===
                                    "00000000000000000000000000" ? (
                                    <SystemMessage message={message} hideInfo />
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
                            {message.author_id !== client.user!._id && (
                                <IconButton
                                    onClick={() => {
                                        let state = false;
                                        setReplies(
                                            replies.map((_, i) => {
                                                if (i === index) {
                                                    state = !_.mention;
                                                    return {
                                                        ..._,
                                                        mention: !_.mention,
                                                    };
                                                }

                                                return _;
                                            }),
                                        );

                                        dispatch({
                                            type: "SECTION_TOGGLE_SET",
                                            id: "mention",
                                            state,
                                        });
                                    }}>
                                    <span class="toggle">
                                        <At size={15} />
                                        <Text id={reply.mention ? 'general.on' : 'general.off'} />
                                    </span>
                                </IconButton>
                            )}
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
