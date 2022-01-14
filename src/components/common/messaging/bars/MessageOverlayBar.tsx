import {
    DotsHorizontalRounded,
    Edit,
    Reply,
    Trash,
} from "@styled-icons/boxicons-regular";
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

import IconButton from "../../../ui/IconButton";

interface Props {
    message: MessageObject;
    queued?: QueuedMessage;
}

const OverlayBar = styled.div`
    display: inline-flex;
    position: absolute;
    justify-self: end;
    align-self: end;
    align-content: center;
    justify-content: center;

    right: 0;
    top: -18px;
    z-index: 0;
    overflow: hidden;

    border-radius: 5px;
    background: var(--primary-header);
    border: 1px sold var(--background);
`;

const Entry = styled.div`
    padding: 4px;
    flex-shrink: 0;
    cursor: pointer;
    transition: 0.2s ease background-color;

    &:hover {
        background: var(--secondary-header);
    }
`;

export const MessageOverlayBar = observer(({ message, queued }: Props) => {
    const client = useClient();
    const { openScreen } = useIntermediate();
    const isAuthor = message.author_id === client.user!._id;

    return (
        <OverlayBar>
            <Entry onClick={() => internalEmit("ReplyBar", "add", message)}>
                <IconButton>
                    <Reply size={24} />
                </IconButton>
            </Entry>
            {isAuthor && (
                <Entry
                    onClick={() =>
                        internalEmit(
                            "MessageRenderer",
                            "edit_message",
                            message._id,
                        )
                    }>
                    <IconButton>
                        <Edit size={24} />
                    </IconButton>
                </Entry>
            )}
            {isAuthor ||
            (message.channel &&
                message.channel.permission &
                    ChannelPermission.ManageMessages) ? (
                <Entry
                    onClick={() =>
                        openScreen({
                            id: "special_prompt",
                            type: "delete_message",
                            target: message,
                        } as unknown as Screen)
                    }>
                    <IconButton>
                        <Trash size={24} />
                    </IconButton>
                </Entry>
            ) : undefined}
            <Entry
                onClick={() =>
                    openContextMenu("Menu", {
                        message,
                        contextualChannel: message.channel_id,
                        queued,
                    })
                }>
                <IconButton>
                    <DotsHorizontalRounded size={24} />
                </IconButton>
            </Entry>
        </OverlayBar>
    );
});
