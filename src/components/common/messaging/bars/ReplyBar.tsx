import styled from "styled-components";
import UserShort from "../../user/UserShort";
import Markdown from "../../../markdown/Markdown";
import { AtSign, CornerUpRight, XCircle } from "@styled-icons/feather";
import { StateUpdater, useEffect } from "preact/hooks";
import { ReplyBase } from "../attachments/MessageReply";
import { Reply } from "../../../../redux/reducers/queue";
import { useUsers } from "../../../../context/revoltjs/hooks";
import { internalSubscribe } from "../../../../lib/eventEmitter";
import { useRenderState } from "../../../../lib/renderer/Singleton";
import IconButton from "../../../ui/IconButton";

interface Props {
    channel: string,
    replies: Reply[],
    setReplies: StateUpdater<Reply[]>
}

const Base = styled.div`
    display: flex;
    padding: 0 22px;
    user-select: none;
    align-items: center;
    background: var(--message-box);

    div {
        flex-grow: 1;
    }

    .actions {
        gap: 12px;
        display: flex;
    }
    
    .toggle {
        gap: 4px;
        display: flex;
        font-size: 0.7em;
        align-items: center;
    }
`;

// ! FIXME: Move to global config
const MAX_REPLIES = 5;
export default function ReplyBar({ channel, replies, setReplies }: Props) {
    useEffect(() => {
        return internalSubscribe("ReplyBar", "add", id => replies.length < MAX_REPLIES && !replies.find(x => x.id === id) && setReplies([ ...replies, { id, mention: false } ]));
    }, [ replies ]);

    const view = useRenderState(channel);
    if (view?.type !== 'RENDER') return null;

    const ids = replies.map(x => x.id);
    const messages = view.messages.filter(x => ids.includes(x._id));
    const users = useUsers(messages.map(x => x.author));
    
    return (
        <div>
            { replies.map((reply, index) => {
                let message = messages.find(x => reply.id === x._id);
                if (!message) return;

                let user = users.find(x => message!.author === x?._id);
                if (!user) return;

                return (
                    <Base key={reply.id}>
                        <ReplyBase preview>
                            <CornerUpRight size={22} />
                            <UserShort user={user} size={16} />
                            <Markdown disallowBigEmoji content={(message.content as string).split('\n').shift()} />
                        </ReplyBase>
                        <span class="actions">
                            <IconButton onClick={() => setReplies(replies.map((_, i) => i === index ? { ..._, mention: !_.mention } : _))}>
                                <span class="toggle">
                                    <AtSign size={16} /> { reply.mention ? 'ON' : 'OFF' }
                                </span>
                            </IconButton>
                            <IconButton onClick={() => setReplies(replies.filter((_, i) => i !== index))}>
                                <XCircle size={16} />
                            </IconButton>
                        </span>
                    </Base>
                )
            }) }
        </div>
    )
}
