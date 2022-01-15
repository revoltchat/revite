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

import { internalEmit } from "../../../../lib/eventEmitter";

import { QueuedMessage } from "../../../../mobx/stores/MessageQueue";

import {
    Screen,
    useIntermediate,
} from "../../../../context/intermediate/Intermediate";
import { useClient } from "../../../../context/revoltjs/RevoltClient";

import Tooltip from "../../../common/Tooltip";
import IconButton from "../../../ui/IconButton";

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
    //overflow: hidden;
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

    &:hover {
        background: var(--secondary-header);
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
    const { openScreen } = useIntermediate();
    const isAuthor = message.author_id === client.user!._id;

    return (
        <OverlayBar>
            <Tooltip content="Reply">
                <Entry onClick={() => internalEmit("ReplyBar", "add", message)}>
                    <IconButton>
                        <Share size={18} />
                    </IconButton>
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
                        <IconButton>
                            <Pencil size={18} />
                        </IconButton>
                    </Entry>
                </Tooltip>
            )}
            {isAuthor ||
            (message.channel &&
                message.channel.permission &
                    ChannelPermission.ManageMessages) ? (
                <Tooltip content="Delete">
                    <Entry
                        onClick={() =>
                            openScreen({
                                id: "special_prompt",
                                type: "delete_message",
                                target: message,
                            } as unknown as Screen)
                        }>
                        <IconButton>
                            <Trash size={18} color={"var(--error)"} />
                        </IconButton>
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
                    <IconButton>
                        <DotsVerticalRounded size={18} />
                    </IconButton>
                </Entry>
            </Tooltip>
            <Divider />
            <Tooltip content="Mark as Unread">
                <Entry
                    onClick={() =>
                        openContextMenu("Menu", {
                            message,
                            contextualChannel: message.channel_id,
                            queued,
                        })
                    }>
                    <IconButton>
                        <Notification size={18} />
                    </IconButton>
                </Entry>
            </Tooltip>
            <Tooltip content="Copy Link">
                <Entry
                    onClick={() =>
                        openContextMenu("Menu", {
                            message,
                            contextualChannel: message.channel_id,
                            queued,
                        })
                    }>
                    <IconButton>
                        <LinkAlt size={18} />
                    </IconButton>
                </Entry>
            </Tooltip>
            <Tooltip content="Copy ID">
                <Entry
                    onClick={() =>
                        openContextMenu("Menu", {
                            message,
                            contextualChannel: message.channel_id,
                            queued,
                        })
                    }>
                    <IconButton>
                        <InfoSquare size={18} />
                    </IconButton>
                </Entry>
            </Tooltip>
        </OverlayBar>
    );
});
