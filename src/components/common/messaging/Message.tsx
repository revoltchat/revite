import { observer } from "mobx-react-lite";
import { Message as MessageObject } from "revolt.js";

import { useTriggerEvents } from "preact-context-menu";
import { memo } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

import { Category } from "@revoltchat/ui";

import { internalEmit } from "../../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { QueuedMessage } from "../../../mobx/stores/MessageQueue";

import { I18nError } from "../../../context/Locale";

import { modalController } from "../../../controllers/modals/ModalController";
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
import { Reactions } from "./attachments/Reactions";
import { MessageOverlayBar } from "./bars/MessageOverlayBar";
import Embed from "./embed/Embed";
import InviteList from "./embed/EmbedInvite";

interface Props {
    attachContext?: boolean;
    queued?: QueuedMessage;
    message: MessageObject & { webhook: { name: string; avatar?: string } };
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
        const client = message.client;
        const user = message.author;

        const content = message.content;
        const head =
            preferHead || (message.reply_ids && message.reply_ids.length > 0);

        const userContext = attachContext
            ? useTriggerEvents("Menu", {
                  user: message.author_id,
                  contextualChannel: message.channel_id,
                  contextualMessage: message._id,
                  // eslint-disable-next-line
              })
            : undefined;

        const openProfile = () =>
            modalController.push({
                type: "user_profile",
                user_id: message.author_id,
            });

        const handleUserClick = (e: MouseEvent) => {
            if (e.shiftKey && user?._id) {
                internalEmit(
                    "MessageBox",
                    "append",
                    `<@${user._id}>`,
                    "mention",
                );
            } else {
                openProfile();
            }
        };

        // ! FIXME(?): animate on hover
        const [mouseHovering, setAnimate] = useState(false);
        const [reactionsOpen, setReactionsOpen] = useState(false);
        useEffect(() => setAnimate(false), [replacement]);

        return (
            <div id={message._id}>
                {!hideReply &&
                    message.reply_ids?.map((message_id, index) => (
                        <MessageReply
                            key={message_id}
                            index={index}
                            id={message_id}
                            channel={message.channel}
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
                    mention={
                        message.mention_ids && client.user
                            ? message.mention_ids.includes(client.user._id)
                            : undefined
                    }
                    failed={typeof queued?.error !== "undefined"}
                    {...(attachContext
                        ? useTriggerEvents("Menu", {
                              message,
                              contextualChannel: message.channel_id,
                              queued,
                          })
                        : undefined)}
                    onMouseEnter={() => setAnimate(true)}
                    onMouseLeave={() => setAnimate(false)}>
                    <MessageInfo click={typeof head !== "undefined"}>
                        {head ? (
                            <UserIcon
                                className="avatar"
                                url={message.generateMasqAvatarURL()}
                                override={
                                    message.webhook?.avatar
                                        ? `https://autumn.revolt.chat/avatars/${message.webhook.avatar}`
                                        : undefined
                                }
                                target={user}
                                size={36}
                                onClick={handleUserClick}
                                animate={mouseHovering}
                                {...(userContext as any)}
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
                                    user={user}
                                    className="author"
                                    showServerIdentity
                                    onClick={handleUserClick}
                                    masquerade={message.masquerade!}
                                    override={message.webhook?.name}
                                    {...userContext}
                                />
                                <MessageDetail
                                    message={message}
                                    position="top"
                                />
                            </span>
                        )}
                        {replacement ??
                            (content && <Markdown content={content} />)}
                        {!queued && <InviteList message={message} />}
                        {queued?.error && (
                            <Category>
                                <I18nError error={queued.error} />
                            </Category>
                        )}
                        {message.attachments?.map((attachment, index) => (
                            <Attachment
                                key={index}
                                attachment={attachment}
                                hasContent={
                                    index > 0 ||
                                    (content ? content.length > 0 : false)
                                }
                            />
                        ))}
                        {message.embeds?.map((embed, index) => (
                            <Embed key={index} embed={embed} />
                        ))}
                        <Reactions message={message} />
                        {(mouseHovering || reactionsOpen) &&
                            !replacement &&
                            !isTouchscreenDevice && (
                                <MessageOverlayBar
                                    reactionsOpen={reactionsOpen}
                                    setReactionsOpen={setReactionsOpen}
                                    message={message}
                                    queued={queued}
                                />
                            )}
                    </MessageContent>
                </MessageBase>
            </div>
        );
    },
);

export default memo(Message);
