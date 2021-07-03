import { decodeTime } from "ulid";
import { memo } from "preact/compat";
import styled from "styled-components";
import MessageEditor from "./MessageEditor";
import { Children } from "../../../types/Preact";
import { Users } from "revolt.js/dist/api/objects";
import { X } from "@styled-icons/boxicons-regular";
import ConversationStart from "./ConversationStart";
import { connectState } from "../../../redux/connector";
import Preloader from "../../../components/ui/Preloader";
import { RenderState } from "../../../lib/renderer/types";
import DateDivider from "../../../components/ui/DateDivider";
import { QueuedMessage } from "../../../redux/reducers/queue";
import { useContext, useEffect, useState } from "preact/hooks";
import { MessageObject } from "../../../context/revoltjs/util";
import Message from "../../../components/common/messaging/Message";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import RequiresOnline from "../../../context/revoltjs/RequiresOnline";
import { internalSubscribe, internalEmit } from "../../../lib/eventEmitter";
import { SystemMessage } from "../../../components/common/messaging/SystemMessage";

interface Props {
    id: string;
    state: RenderState;
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

function MessageRenderer({ id, state, queue }: Props) {
    if (state.type !== 'RENDER') return null;

    const client = useContext(AppContext);
    const userId = client.user!._id;

    const [editing, setEditing] = useState<string | undefined>(undefined);
    const stopEditing = () => {
        setEditing(undefined);
        internalEmit("TextArea", "focus", "message");
    };

    useEffect(() => {
        function editLast() {
            if (state.type !== 'RENDER') return;
            for (let i = state.messages.length - 1; i >= 0; i--) {
                if (state.messages[i].author === userId) {
                    setEditing(state.messages[i]._id);
                    return;
                }
            }
        }

        const subs = [
            internalSubscribe("MessageRenderer", "edit_last", editLast),
            internalSubscribe("MessageRenderer", "edit_message", setEditing)
        ]

        return () => subs.forEach(unsub => unsub());
    }, [state.messages]);

    let render: Children[] = [],
        previous: MessageObject | undefined;

    if (state.atTop) {
        render.push(<ConversationStart id={id} />);
    } else {
        render.push(
            <RequiresOnline>
                <Preloader type="ring" />
            </RequiresOnline>
        );
    }

    let head = true;
    function compare(
        current: string,
        curAuthor: string,
        previous: string,
        prevAuthor: string
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
        render.push(<BlockedMessage><X size={16} /> { blocked } blocked messages</BlockedMessage>);
        blocked = 0;
    }

    for (const message of state.messages) {
        if (previous) {
            compare(
                message._id,
                message.author,
                previous._id,
                previous.author
            );
        }

        if (message.author === "00000000000000000000000000") {
            render.push(<SystemMessage key={message._id} message={message} attachContext />);
        } else {
            // ! FIXME: temp solution
            if (client.users.get(message.author)?.relationship === Users.Relationship.Blocked) {
                blocked++;
            } else {
                if (blocked > 0) pushBlocked();

                render.push(
                    <Message message={message}
                        key={message._id}
                        head={head}
                        content={
                            editing === message._id ?
                                <MessageEditor message={message} finish={stopEditing} />
                                : undefined
                        }
                        attachContext />
                );
            }
        }

        previous = message;
    }
    
    if (blocked > 0) pushBlocked();

    const nonces = state.messages.map(x => x.nonce);
    if (state.atBottom) {
        for (const msg of queue) {
            if (msg.channel !== id) continue;
            if (nonces.includes(msg.id)) continue;

            if (previous) {
                compare(
                    msg.id,
                    userId!,
                    previous._id,
                    previous.author
                );
                
                previous = {
                    _id: msg.id,
                    data: { author: userId! }
                } as any;
            }

            render.push(
                <Message
                    message={{
                        ...msg.data,
                        replies: msg.data.replies.map(x => x.id)
                    }}
                    key={msg.id}
                    queued={msg}
                    head={head}
                    attachContext />
            );
        }
    } else {
        render.push(
            <RequiresOnline>
                <Preloader type="ring" />
            </RequiresOnline>
        );
    }

    return <>{ render }</>;
}

export default memo(connectState<Omit<Props, 'queue'>>(MessageRenderer, state => {
    return {
        queue: state.queue
    };
}));
