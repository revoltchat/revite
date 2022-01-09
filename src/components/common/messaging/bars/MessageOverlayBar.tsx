import {
    DotsHorizontalRounded,
    Edit,
    Reply,
    Trash,
} from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Message as MessageObject } from "revolt.js/dist/maps/Messages";
import styled, { css } from "styled-components";

import { attachContextMenu } from "preact-context-menu";
import { useContext } from "preact/hooks";

import { internalEmit } from "../../../../lib/eventEmitter";

import { QueuedMessage } from "../../../../mobx/stores/MessageQueue";

import {
    Screen,
    useIntermediate,
} from "../../../../context/intermediate/Intermediate";
import { AppContext } from "../../../../context/revoltjs/RevoltClient";

import IconButton from "../../../ui/IconButton";
import LineDivider from "../../../ui/LineDivider";

import { Children } from "../../../../types/Preact";

const OverlayButtonWidth = 25;
const OverlayButtonPadding = 5;
const OverlayButtonTotalWidth = OverlayButtonWidth + OverlayButtonPadding;

export const OverlayBase = styled.div`
    position: relative;
`;

export const OverlayBarFlexItemStyled = styled.div`
    width: ${OverlayButtonWidth}px;
    height: 25px;
    display: inline-flex;
    opacity: 75%;
    padding-left: ${OverlayButtonPadding}px;
    padding-right: ${OverlayButtonPadding}px;
`;

interface MessageOverlayBarProps {
    message: MessageObject;
    queued?: QueuedMessage;
    mouseOver: boolean;
}
interface FlexItemProps {
    onClick: (event: any) => void;
    iconContent: Children;
}
export const OverlayBarFlexItem = observer(
    ({ onClick, iconContent }: FlexItemProps) => {
        const clickReact = (e: any) => {
            onClick(e);
        };
        return (
            <OverlayBarFlexItemStyled>
                <IconButton onClick={clickReact}>{iconContent}</IconButton>
            </OverlayBarFlexItemStyled>
        );
    },
);

export interface OverlayBarProps {
    visible?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}
export const OverlayBar = styled.div<OverlayBarProps>`
    ${(props) =>
        props.visible === true &&
        css`
            opacity: 1;
        `};
    ${(props) =>
        props.visible !== true &&
        css`
            opacity: 0;
        `};
    display: inline-flex;
    position: absolute;
    justify-self: end;
    align-self: end;
    align-content: center;
    justify-content: center;
    background: var(--primary-header);
    top: 0;
    right: 0;
    z-index: 0;
    width: ${(props) =>
        OverlayButtonTotalWidth * 2 +
        (props.canEdit === true ? OverlayButtonTotalWidth : 0) +
        (props.canDelete === true ? OverlayButtonTotalWidth : 0)}px;
    border: 2px;
    border-style: solid;
    border-color: rgba(255, 255, 255, 0.25);
    border-radius: 5px;
`;

export const MessageOverlayBar = observer(
    ({ message, queued, mouseOver }: MessageOverlayBarProps) => {
        const { openScreen, writeClipboard } = useIntermediate();

        const client = useContext(AppContext);
        const userId = client.user!._id;
        const userIsAuthor = message.author_id === userId;

        const handleReplyQuickAction = () => {
            internalEmit("ReplyBar", "add", message);
        };
        const handleEditQuickAction = () => {
            internalEmit("MessageRenderer", "edit_message", message._id);
        };
        const handleDeleteQuickAction = () => {
            // Typescript flattens the case types into a single type and type structure and specifity is lost
            openScreen({
                id: "special_prompt",
                type: "delete_message",
                target: message,
            } as unknown as Screen);
        };

        const handleMoreQuickAction = (e: any) => {
            attachContextMenu("Menu", {
                message,
                contextualChannel: message.channel_id,
                queued,
            })(e);
        };

        return (
            <OverlayBar
                visible={mouseOver}
                canDelete={userIsAuthor}
                canEdit={userIsAuthor}>
                <OverlayBarFlexItem
                    onClick={handleReplyQuickAction}
                    iconContent={<Reply />}
                />
                {userIsAuthor && (
                    <OverlayBarFlexItem
                        onClick={handleEditQuickAction}
                        iconContent={<Edit />}
                    />
                )}
                {userIsAuthor && (
                    <OverlayBarFlexItem
                        onClick={handleDeleteQuickAction}
                        iconContent={<Trash />}
                    />
                )}
                |
                <OverlayBarFlexItem
                    onClick={handleMoreQuickAction}
                    iconContent={<DotsHorizontalRounded />}
                />
            </OverlayBar>
        );
    },
);
