import { observer } from "mobx-react-lite";
import { Message as MessageObject } from "revolt.js/dist/maps/Messages";

import { attachContextMenu } from "preact-context-menu";
import { memo } from "preact/compat";
import { useState } from "preact/hooks";

import { QueuedMessage } from "../../../redux/reducers/queue";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

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
import InviteList from "./embed/EmbedInvite";

interface Props {
    attachContext?: boolean;
    queued?: QueuedMessage;
    message: MessageObject;
    highlight?: boolean;
    contrast?: boolean;
    content?: Children;
    head?: boolean;
    hideReply?: boolean;
}

const Message = observer(
    ({
        highlight,
        attachContext,
        message,
        contrast,
        content: replacement,
        head: preferHead,
        queued,
        hideReply,
    }: Props) => {
        const client = useClient();
        const user = message.author;

        const { openScreen } = useIntermediate();

        const content = message.content as string;
        const head =
            preferHead || (message.reply_ids && message.reply_ids.length > 0);

        // ! TODO: tell fatal to make this type generic
        // bree: Fatal please...
        const userContext = attachContext
            ? (attachContextMenu("Menu", {
                  user: message.author_id,
                  contextualChannel: message.channel_id,
                  // eslint-disable-next-line
              }) as any)
            : undefined;

        const openProfile = () =>
            openScreen({ id: "profile", user_id: message.author_id });

        // ! FIXME(?): animate on hover
        const [animate, setAnimate] = useState(false);

        return (
            <div id={message._id}>
                {!hideReply &&
                    message.reply_ids?.map((message_id, index) => (
                        <MessageReply
                            key={message_id}
                            index={index}
                            id={message_id}
                            channel={message.channel!}
                            parent_mentions={message.mention_ids ?? []}
                        />
                    ))}
                <MessageBase
                    highlight={highlight}
                    head={
                        hideReply
                            ? false
                            : (head &&
                                  !(
                                      message.reply_ids &&
                                      message.reply_ids.length > 0
                                  )) ??
                              false
                    }
                    contrast={contrast}
                    sending={typeof queued !== "undefined"}
                    mention={message.mention_ids?.includes(client.user!._id)}
                    failed={typeof queued?.error !== "undefined"}
                    onContextMenu={
                        attachContext
                            ? attachContextMenu("Menu", {
                                  message,
                                  contextualChannel: message.channel_id,
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
                                showServerIdentity
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
                                    showServerIdentity
                                />
                                <MessageDetail
                                    message={message}
                                    position="top"
                                />
                            </span>
                        )}
                        {replacement ?? <Markdown content={content} />}
                        {!queued && <InviteList message={message} />}
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
    },
);

export default memo(Message);
