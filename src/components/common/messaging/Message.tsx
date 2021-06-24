import Embed from "./embed/Embed";
import UserIcon from "../user/UserIcon";
import { Username } from "../user/UserShort";
import Markdown from "../../markdown/Markdown";
import { Children } from "../../../types/Preact";
import Attachment from "./attachments/Attachment";
import { attachContextMenu } from "preact-context-menu";
import { useUser } from "../../../context/revoltjs/hooks";
import { QueuedMessage } from "../../../redux/reducers/queue";
import { MessageObject } from "../../../context/revoltjs/util";
import MessageBase, { MessageContent, MessageDetail, MessageInfo } from "./MessageBase";
import Overline from "../../ui/Overline";
import { useContext } from "preact/hooks";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { memo } from "preact/compat";
import { MessageReply } from "./attachments/MessageReply";

interface Props {
    attachContext?: boolean
    queued?: QueuedMessage
    message: MessageObject
    contrast?: boolean
    content?: Children
    head?: boolean
}

function Message({ attachContext, message, contrast, content: replacement, head: preferHead, queued }: Props) {
    // TODO: Can improve re-renders here by providing a list
    // TODO: of dependencies. We only need to update on u/avatar.
    const user = useUser(message.author);
    const client = useContext(AppContext);

    const content = message.content as string;
    const head = preferHead || (message.replies && message.replies.length > 0);
    const userContext = attachContext ? attachContextMenu('Menu', { user: message.author, contextualChannel: message.channel }) : undefined as any; // ! FIXME: tell fatal to make this type generic

    return (
        <>
            { message.replies?.map((message_id, index) => <MessageReply index={index} id={message_id} channel={message.channel} />) }
            <MessageBase id={message._id}
                head={head && !(message.replies && message.replies.length > 0)}
                contrast={contrast}
                sending={typeof queued !== 'undefined'}
                mention={message.mentions?.includes(client.user!._id)}
                failed={typeof queued?.error !== 'undefined'}
                onContextMenu={attachContext ? attachContextMenu('Menu', { message, contextualChannel: message.channel, queued }) : undefined}>
                <MessageInfo>
                    { head ?
                        <UserIcon target={user} size={36} onContextMenu={userContext} /> :
                        <MessageDetail message={message} position="left" /> }
                </MessageInfo>
                <MessageContent>
                    { head && <span className="detail">
                        <span className="author">
                            <Username user={user} onContextMenu={userContext} />
                        </span>
                        <MessageDetail message={message} position="top" />
                    </span> }
                    { replacement ?? <Markdown content={content} /> }
                    { queued?.error && <Overline type="error" error={queued.error} /> }
                    { message.attachments?.map((attachment, index) =>
                        <Attachment key={index} attachment={attachment} hasContent={ index > 0 || content.length > 0 } />) }
                    { message.embeds?.map((embed, index) =>
                        <Embed key={index} embed={embed} />) }
                </MessageContent>
            </MessageBase>
        </>
    )
}

export default memo(Message);
