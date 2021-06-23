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
    const head = (message.replies && message.replies.length > 0) || preferHead;
    return (
        <MessageBase id={message._id}
            head={head}
            contrast={contrast}
            sending={typeof queued !== 'undefined'}
            mention={message.mentions?.includes(client.user!._id)}
            failed={typeof queued?.error !== 'undefined'}
            onContextMenu={attachContext ? attachContextMenu('Menu', { message, contextualChannel: message.channel, queued }) : undefined}>
            <MessageInfo>
                { head ?
                    <UserIcon target={user} size={36} /> :
                    <MessageDetail message={message} position="left" /> }
            </MessageInfo>
            <MessageContent>
                { head && <span className="author">
                    <Username user={user} />
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
    )
}

export default memo(Message);
