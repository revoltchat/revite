import { DotsHorizontalRounded, Reply } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Message as MessageObject } from "revolt.js/dist/maps/Messages";
import styled, { css } from "styled-components";

import { attachContextMenu } from "preact-context-menu";

import { internalEmit } from "../../../../lib/eventEmitter";

import { QueuedMessage } from "../../../../mobx/stores/MessageQueue";

import IconButton from "../../../ui/IconButton";

import { Children } from "../../../../types/Preact";

export const OverlayBase = styled.div`
    position: relative;
`;

export const OverlayBarFlexItemStyled = styled.div`
    width: 25px;
    height: 25px;
    opacity: 75%;
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
}
export const OverlayBar = styled.div<OverlayBarProps>`
    ${(props) =>
        props.visible === true &&
        css`
            display: inline-flex;
        `};
    ${(props) =>
        props.visible !== true &&
        css`
            display: none;
        `};

    position: absolute;
    justify-content: end;
    justify-self: end;
    align-self: end;
    align-items: end;
    top: 0;
    right: 0;
    z-index: 0;
    width: 50px;
`;

export const MessageOverlayBar = observer(
    ({ message, queued, mouseOver }: MessageOverlayBarProps) => {
        const handleReplyQuickAction = () => {
            internalEmit("ReplyBar", "add", message);
        };
        const handleMoreQuickAction = (e: any) => {
            attachContextMenu("Menu", {
                message,
                contextualChannel: message.channel_id,
                queued,
            })(e);
        };
        return (
            <OverlayBar visible={mouseOver}>
                <OverlayBarFlexItem
                    onClick={handleReplyQuickAction}
                    iconContent={<Reply />}
                />
                <OverlayBarFlexItem
                    onClick={handleMoreQuickAction}
                    iconContent={<DotsHorizontalRounded />}
                />
            </OverlayBar>
        );
    },
);
