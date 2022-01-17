import { DotsVerticalRounded, LinkAlt } from "@styled-icons/boxicons-regular";
import {
    Pencil,
    Trash,
    Share,
    InfoSquare,
    Notification,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { ChannelPermission } from "revolt.js";
import { Message as MessageObject } from "revolt.js/dist/maps/Messages";
import styled from "styled-components";

import { openContextMenu } from "preact-context-menu";
import { useEffect, useState } from "preact/hooks";

import { internalEmit } from "../../../../lib/eventEmitter";
import { shiftKeyPressed } from "../../../../lib/modifiers";
import { getRenderer } from "../../../../lib/renderer/Singleton";

import { QueuedMessage } from "../../../../mobx/stores/MessageQueue";

import {
    Screen,
    useIntermediate,
} from "../../../../context/intermediate/Intermediate";
import { useClient } from "../../../../context/revoltjs/RevoltClient";

import Tooltip from "../../../common/Tooltip";

interface Props {
    message: MessageObject;
    queued?: QueuedMessage;
}

const OverlayBar = styled.div`
    display: flex;
    position: absolute;
    justify-self: end;
    align-self: end;
    align-content: center;
    justify-content: center;
    right: 0;
    top: -18px;
    z-index: 0;
    transition: box-shadow 0.1s ease-out;
    border-radius: 5px;
    background: var(--primary-header);
    border: 1px solid var(--background);

    &:hover {
        box-shadow: rgb(0 0 0 / 20%) 0px 2px 10px;
    }
`;

const Entry = styled.div`
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    transition: 0.2s ease background-color;
    color: var(--secondary-foreground);

    &:hover {
        background-color: var(--secondary-header);
        color: var(--foreground);
    }

    &:focus {
        border-radius: var(--border-radius);
        box-shadow: 0 0 0 2.5pt var(--accent);
    }

    &:active {
        svg {
            transform: translateY(1px);
        }
    }
`;

const Divider = styled.div`
    margin: 6px 4px;
    width: 0.5px;
    background: var(--tertiary-background);
`;

export const MessageOverlayBar = observer(({ message, queued }: Props) => {
    const client = useClient();
    const { openScreen, writeClipboard } = useIntermediate();
    const isAuthor = message.author_id === client.user!._id;

    const [copied, setCopied] = useState<"link" | "id">(null!);
    const [extraActions, setExtra] = useState(shiftKeyPressed);

    useEffect(() => {
        const handler = (ev: KeyboardEvent) => setExtra(ev.shiftKey);

        document.addEventListener("keyup", handler);
        document.addEventListener("keydown", handler);

        return () => {
            document.removeEventListener("keyup", handler);
            document.removeEventListener("keydown", handler);
        };
    });

    return (
        <OverlayBar>
            <Tooltip content="Reply">
                <Entry onClick={() => internalEmit("ReplyBar", "add", message)}>
                    <Share size={18} />
                </Entry>
            </Tooltip>

            {isAuthor && (
                <Tooltip content="Edit">
                    <Entry
                        onClick={() =>
                            internalEmit(
                                "MessageRenderer",
                                "edit_message",
                                message._id,
                            )
                        }>
                        <Pencil size={18} />
                    </Entry>
                </Tooltip>
            )}
            {isAuthor ||
            (message.channel &&
                message.channel.permission &
                    ChannelPermission.ManageMessages) ? (
                <Tooltip content="Delete">
                    <Entry
                        onClick={(e) =>
                            e.shiftKey
                                ? message.delete()
                                : openScreen({
                                      id: "special_prompt",
                                      type: "delete_message",
                                      target: message,
                                  } as unknown as Screen)
                        }>
                        <Trash size={18} color={"var(--error)"} />
                    </Entry>
                </Tooltip>
            ) : undefined}
            <Tooltip content="More">
                <Entry
                    onClick={() =>
                        openContextMenu("Menu", {
                            message,
                            contextualChannel: message.channel_id,
                            queued,
                        })
                    }>
                    <DotsVerticalRounded size={18} />
                </Entry>
            </Tooltip>
            {extraActions && (
                <>
                    <Divider />
                    <Tooltip content="Mark as Unread">
                        <Entry
                            onClick={() => {
                                // ! FIXME: deduplicate this code with ctx menu
                                const messages = getRenderer(
                                    message.channel!,
                                ).messages;
                                const index = messages.findIndex(
                                    (x) => x._id === message._id,
                                );

                                let unread_id = message._id;
                                if (index > 0) {
                                    unread_id = messages[index - 1]._id;
                                }

                                internalEmit("NewMessages", "mark", unread_id);
                                message.channel?.ack(unread_id, true);
                            }}>
                            <Notification size={18} />
                        </Entry>
                    </Tooltip>
                    <Tooltip
                        content={copied === "link" ? "Copied!" : "Copy Link"}
                        hideOnClick={false}>
                        <Entry
                            onClick={() => {
                                setCopied("link");
                                writeClipboard(message.url);
                            }}>
                            <LinkAlt size={18} />
                        </Entry>
                    </Tooltip>
                    <Tooltip
                        content={copied === "id" ? "Copied!" : "Copy ID"}
                        hideOnClick={false}>
                        <Entry
                            onClick={() => {
                                setCopied("id");
                                writeClipboard(message._id);
                            }}>
                            <InfoSquare size={18} />
                        </Entry>
                    </Tooltip>
                </>
            )}
        </OverlayBar>
    );
});
