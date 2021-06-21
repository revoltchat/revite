import Embed from "./embed/Embed";
import UserIcon from "../user/UserIcon";
import { Username } from "../user/UserShort";
import Markdown from "../../markdown/Markdown";
import { Children } from "../../../types/Preact";
import Attachment from "./attachments/Attachment";
import { attachContextMenu } from "preact-context-menu";
import { useUser } from "../../../context/revoltjs/hooks";
import { MessageObject } from "../../../context/revoltjs/util";
import MessageBase, { MessageContent, MessageDetail, MessageInfo } from "./MessageBase";

interface Props {
    attachContext?: boolean
    message: MessageObject
    contrast?: boolean
    content?: Children
    head?: boolean
}

export default function Message({ attachContext, message, contrast, content: replacement, head }: Props) {
    // TODO: Can improve re-renders here by providing a list
    // TODO: of dependencies. We only need to update on u/avatar.
    let user = useUser(message.author);

    const content = message.content as string;
    return (
        <MessageBase contrast={contrast}
            onContextMenu={attachContext ? attachContextMenu('Menu', { message, contextualChannel: message.channel }) : undefined}>
            <MessageInfo>
                { head ?
                    <UserIcon target={user} size={36} /> :
                    <MessageDetail message={message} /> }
            </MessageInfo>
            <MessageContent>
                { head && <Username user={user} /> }
                { replacement ?? <Markdown content={content} /> }
                { message.attachments?.map((attachment, index) =>
                    <Attachment key={index} attachment={attachment} hasContent={ index > 0 || content.length > 0 } />) }
                { message.embeds?.map((embed, index) =>
                    <Embed key={index} embed={embed} />) }
            </MessageContent>
        </MessageBase>
    )
}
