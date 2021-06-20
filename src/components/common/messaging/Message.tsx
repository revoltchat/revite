import UserIcon from "../UserIcon";
import { Username } from "../UserShort";
import Markdown from "../../markdown/Markdown";
import { Children } from "../../../types/Preact";
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

export default function Message({ attachContext, message, contrast, content, head }: Props) {
    // TODO: Can improve re-renders here by providing a list
    // TODO: of dependencies. We only need to update on u/avatar.
    let user = useUser(message.author);

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
                { content ?? <Markdown content={message.content as string} /> }
            </MessageContent>
        </MessageBase>
    )
}
