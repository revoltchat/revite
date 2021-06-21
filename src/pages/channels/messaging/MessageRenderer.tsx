import { decodeTime } from "ulid";
import { useEffect, useState } from "preact/hooks";
import ConversationStart from "./ConversationStart";
import { connectState } from "../../../redux/connector";
import Preloader from "../../../components/ui/Preloader";
import { RenderState } from "../../../lib/renderer/types";
import DateDivider from "../../../components/ui/DateDivider";
import { QueuedMessage } from "../../../redux/reducers/queue";
import { MessageObject } from "../../../context/revoltjs/util";
import RequiresOnline from "../../../context/revoltjs/RequiresOnline";
import { useForceUpdate, useUsers } from "../../../context/revoltjs/hooks";
import { Children } from "../../../types/Preact";
import { SystemMessage } from "../../../components/common/messaging/SystemMessage";
import Message from "../../../components/common/messaging/Message";

interface Props {
    id: string;
    state: RenderState;
    queue: QueuedMessage[];
}

function MessageRenderer({ id, state, queue }: Props) {
    if (state.type !== 'RENDER') return null;

    const ctx = useForceUpdate();
    const users = useUsers();
    const userId = ctx.client.user!._id;

    /*
    const view = useView(id);*/

    const [editing, setEditing] = useState<string | undefined>(undefined);
    const stopEditing = () => {
        setEditing(undefined);
        // InternalEventEmitter.emit("focus_textarea", "message");
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

        // InternalEventEmitter.addListener("edit_last", editLast);
        // InternalEventEmitter.addListener("edit_message", setEditing);

        return () => {
            // InternalEventEmitter.removeListener("edit_last", editLast);
            // InternalEventEmitter.removeListener("edit_message", setEditing);
        };
    }, [state.messages]);

    let render: Children[] = [],
        previous: MessageObject | undefined;

    if (state.atTop) {
        render.push(<ConversationStart id={id} />);
    } else {
        render.push(
            <RequiresOnline>
                <Preloader />
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
        }

        head = curAuthor !== prevAuthor || Math.abs(btime - atime) >= 420000;
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
            render.push(
                <Message message={message}
                    key={message._id}
                    head={head}
                    attachContext />
            );
            /*render.push(
                <Message
                    editing={editing === message._id ? stopEditing : undefined}
                    user={users.find(x => x?._id === message.author)}
                    message={message}
                    key={message._id}
                    head={head}
                />
            );*/
        }

        previous = message;
    }

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

            /*render.push(
                <Message
                    user={users.find(x => x?._id === userId)}
                    message={msg.data}
                    queued={msg}
                    key={msg.id}
                    head={head}
                />
            );*/
            render.push(
                <Message message={msg.data}
                    key={msg.id}
                    head={head}
                    attachContext />
            );
        }

        render.push(<div>end</div>);
    } else {
        render.push(
            <RequiresOnline>
                <Preloader />
            </RequiresOnline>
        );
    }

    return <>{ render }</>;
}

export default connectState<Omit<Props, 'queue'>>(MessageRenderer, state => {
    return {
        queue: state.queue
    };
});
