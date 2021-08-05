/* eslint-disable react-hooks/rules-of-hooks */
import { X } from "@styled-icons/boxicons-regular";
import { RelationshipStatus } from "revolt-api/types/Users";
import { SYSTEM_USER_ID } from "revolt.js";
import { Message as MessageI } from "revolt.js/dist/maps/Messages";
import styled from "styled-components";
import { decodeTime } from "ulid";

import { Text } from "preact-i18n";
import { memo } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

import { internalSubscribe, internalEmit } from "../../../lib/eventEmitter";
import { RenderState } from "../../../lib/renderer/types";

import { connectState } from "../../../redux/connector";
import { QueuedMessage } from "../../../redux/reducers/queue";

import RequiresOnline from "../../../context/revoltjs/RequiresOnline";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import Message from "../../../components/common/messaging/Message";
import { SystemMessage } from "../../../components/common/messaging/SystemMessage";
import DateDivider from "../../../components/ui/DateDivider";
import Preloader from "../../../components/ui/Preloader";

import { Children } from "../../../types/Preact";
import ConversationStart from "./ConversationStart";
import MessageEditor from "./MessageEditor";

interface Props {
    id: string;
    state: RenderState;
    highlight?: string;
    queue: QueuedMessage[];
}

const BlockedMessage = styled.div`
    font-size: 0.8em;
    margin-top: 6px;
    padding: 4px 64px;
    color: var(--tertiary-foreground);

    &:hover {
        background: var(--hover);
    }
`;

function MessageRenderer({ id, state, queue, highlight }: Props) {
    if (state.type !== "RENDER") return null;

    const client = useClient();
    const userId = client.user!._id;

    const [editing, setEditing] = useState<string | undefined>(undefined);
    const stopEditing = () => {
        setEditing(undefined);
        internalEmit("TextArea", "focus", "message");
    };

    useEffect(() => {
        function editLast() {
            if (state.type !== "RENDER") return;
            for (let i = state.messages.length - 1; i >= 0; i--) {
                if (state.messages[i].author_id === userId) {
                    setEditing(state.messages[i]._id);
                    internalEmit("MessageArea", "jump_to_bottom");
                    return;
                }
            }
        }

        const subs = [
            internalSubscribe("MessageRenderer", "edit_last", editLast),
            internalSubscribe("MessageRenderer", "edit_message", setEditing),
        ];

        return () => subs.forEach((unsub) => unsub());
    }, [state.messages, state.type, userId]);

    const render: Children[] = [];
    let previous: MessageI | undefined;

    if (state.atTop) {
        render.push(<ConversationStart id={id} />);
    } else {
        render.push(
            <RequiresOnline>
                <Preloader type="ring" />
            </RequiresOnline>,
        );
    }

    let head = true;
    function compare(
        current: string,
        curAuthor: string,
        previous: string,
        prevAuthor: string,
    ) {
        const atime = decodeTime(current),
            adate = new Date(atime),
            btime = decodeTime(previous),
            bdate = new Date(btime);

        if (
            adate.getFullYear() !== bdate.getFullYear() ||
            adate.getMonth() !== bdate.getMonth() ||
            adate.getDate() !== bdate.getDate()
        ) {
            render.push(<DateDivider date={adate} />);
            head = true;
        }

        head = curAuthor !== prevAuthor || Math.abs(btime - atime) >= 420000;
    }

    let blocked = 0;
    function pushBlocked() {
        render.push(
            <BlockedMessage>
                <X size={16} />{" "}
                <Text
                    id="app.main.channel.misc.blocked_messages"
                    fields={{ count: blocked }}
                />
            </BlockedMessage>,
        );
        blocked = 0;
    }

    for (const message of state.messages) {
        if (previous) {
            compare(
                message._id,
                message.author_id,
                previous._id,
                previous.author_id,
            );
        }

        if (message.author_id === SYSTEM_USER_ID) {
            render.push(
                <SystemMessage
                    key={message._id}
                    message={message}
                    attachContext
                    highlight={highlight === message._id}
                />,
            );
        } else if (
            message.author?.relationship === RelationshipStatus.Blocked
        ) {
            blocked++;
        } else {
            if (blocked > 0) pushBlocked();

            render.push(
                <Message
                    message={message}
                    key={message._id}
                    head={head}
                    content={
                        editing === message._id ? (
                            <MessageEditor
                                message={message}
                                finish={stopEditing}
                            />
                        ) : undefined
                    }
                    attachContext
                    highlight={highlight === message._id}
                />,
            );
        }

        previous = message;
    }

    if (blocked > 0) pushBlocked();

    const nonces = state.messages.map((x) => x.nonce);
    if (state.atBottom) {
        for (const msg of queue) {
            if (msg.channel !== id) continue;
            if (nonces.includes(msg.id)) continue;

            if (previous) {
                compare(msg.id, userId!, previous._id, previous.author_id);

                previous = {
                    _id: msg.id,
                    author_id: userId!,
                } as MessageI;
            }

            render.push(
                <Message
                    message={
                        new MessageI(client, {
                            ...msg.data,
                            replies: msg.data.replies.map((x) => x.id),
                        })
                    }
                    key={msg.id}
                    queued={msg}
                    head={head}
                    attachContext
                />,
            );
        }
    } else {
        render.push(
            <RequiresOnline>
                <Preloader type="ring" />
            </RequiresOnline>,
        );
    }

    return <>{render}</>;
}

export default memo(
    connectState<Omit<Props, "queue">>(MessageRenderer, (state) => {
        return {
            queue: state.queue,
        };
    }),
);
