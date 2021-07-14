import { attachContextMenu } from "preact-context-menu";
import { memo } from "preact/compat";
import { useContext, useState } from "preact/hooks";

import { QueuedMessage } from "../../../redux/reducers/queue";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { useUser } from "../../../context/revoltjs/hooks";
import { MessageObject } from "../../../context/revoltjs/util";

import Overline from "../../ui/Overline";

import { Children } from "../../../types/Preact";
import Markdown from "../../markdown/Markdown";
import UserIcon from "../user/UserIcon";
import { Username } from "../user/UserShort";
import MessageBase, {
    MessageContent,
    MessageDetail,
    MessageInfo,
} from "./MessageBase";
import Attachment from "./attachments/Attachment";
import { MessageReply } from "./attachments/MessageReply";
import Embed from "./embed/Embed";

interface Props {
    attachContext?: boolean;
    queued?: QueuedMessage;
    message: MessageObject;
    highlight?: boolean;
    contrast?: boolean;
    content?: Children;
    head?: boolean;
}

function Message({
    highlight,
    attachContext,
    message,
    contrast,
    content: replacement,
    head: preferHead,
    queued,
}: Props) {
    // TODO: Can improve re-renders here by providing a list
    // TODO: of dependencies. We only need to update on u/avatar.
    const user = useUser(message.author);
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();

    const content = message.content as string;
    const head = preferHead || (message.replies && message.replies.length > 0);

    // ! FIXME: tell fatal to make this type generic
    // bree: Fatal please...
    const userContext = attachContext
        ? (attachContextMenu("Menu", {
              user: message.author,
              contextualChannel: message.channel,
          }) as any)
        : undefined;

    const openProfile = () =>
        openScreen({ id: "profile", user_id: message.author });

    // ! FIXME: animate on hover
    const [animate, setAnimate] = useState(false);

    return (
        <div id={message._id}>
            {message.replies?.map((message_id, index) => (
                <MessageReply
                    index={index}
                    id={message_id}
                    channel={message.channel}
                />
            ))}
            <MessageBase
                highlight={highlight}
                head={head && !(message.replies && message.replies.length > 0)}
                contrast={contrast}
                sending={typeof queued !== "undefined"}
                mention={message.mentions?.includes(client.user!._id)}
                failed={typeof queued?.error !== "undefined"}
                onContextMenu={
                    attachContext
                        ? attachContextMenu("Menu", {
                              message,
                              contextualChannel: message.channel,
                              queued,
                          })
                        : undefined
                }
                onMouseEnter={() => setAnimate(true)}
                onMouseLeave={() => setAnimate(false)}>
                <MessageInfo>
                    {head ? (
                        <UserIcon
                            target={user}
                            size={36}
                            onContextMenu={userContext}
                            onClick={openProfile}
                            animate={animate}
                        />
                    ) : (
                        <MessageDetail message={message} position="left" />
                    )}
                </MessageInfo>
                <MessageContent>
                    {head && (
                        <span className="detail">
                            <Username
                                className="author"
                                user={user}
                                onContextMenu={userContext}
                                onClick={openProfile}
                            />
                            <MessageDetail message={message} position="top" />
                        </span>
                    )}
                    {replacement ?? <Markdown content={content} />}
                    {queued?.error && (
                        <Overline type="error" error={queued.error} />
                    )}
                    {message.attachments?.map((attachment, index) => (
                        <Attachment
                            key={index}
                            attachment={attachment}
                            hasContent={index > 0 || content.length > 0}
                        />
                    ))}
                    {message.embeds?.map((embed, index) => (
                        <Embed key={index} embed={embed} />
                    ))}
                </MessageContent>
            </MessageBase>
        </div>
    );
}

export default memo(Message);
