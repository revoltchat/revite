import {
    InfoCircle,
    UserPlus,
    UserMinus,
    ArrowToRight,
    ArrowToLeft,
    UserX,
    ShieldX,
    EditAlt,
    Edit,
    MessageSquareEdit,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { SystemMessage as SystemMessageI } from "revolt-api/types/Channels";
import { Message } from "revolt.js/dist/maps/Messages";
import styled from "styled-components";

import { attachContextMenu } from "preact-context-menu";

import { TextReact } from "../../../lib/i18n";

import UserShort from "../user/UserShort";
import MessageBase, { MessageDetail, MessageInfo } from "./MessageBase";

const SystemContent = styled.div`
    gap: 4px;
    display: flex;
    padding: 2px 0;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: row;
`;

interface Props {
    attachContext?: boolean;
    message: Message;
    highlight?: boolean;
    hideInfo?: boolean;
}

const iconDictionary = {
    user_added: UserPlus,
    user_remove: UserMinus,
    user_joined: ArrowToRight,
    user_left: ArrowToLeft,
    user_kicked: UserX,
    user_banned: ShieldX,
    channel_renamed: EditAlt,
    channel_description_changed: Edit,
    channel_icon_changed: MessageSquareEdit,
    text: InfoCircle,
};

export const SystemMessage = observer(
    ({ attachContext, message, highlight, hideInfo }: Props) => {
        const data = message.asSystemMessage;
        const SystemMessageIcon =
            iconDictionary[data.type as SystemMessageI["type"]] ?? InfoCircle;

        const SystemIcon = styled(SystemMessageIcon)`
            height: 1.33em;
            width: 1.33em;
            margin-right: 0.5em;
            color: var(--tertiary-foreground);
        `;

        let children;
        switch (data.type) {
            case "text":
                children = <span>{data.content}</span>;
                break;
            case "user_added":
            case "user_remove":
                children = (
                    <TextReact
                        id={`app.main.channel.system.${
                            data.type === "user_added"
                                ? "added_by"
                                : "removed_by"
                        }`}
                        fields={{
                            user: <UserShort user={data.user} />,
                            other_user: <UserShort user={data.by} />,
                        }}
                    />
                );
                break;
            case "user_joined":
            case "user_left":
            case "user_kicked":
            case "user_banned":
                children = (
                    <TextReact
                        id={`app.main.channel.system.${data.type}`}
                        fields={{
                            user: <UserShort user={data.user} />,
                        }}
                    />
                );
                break;
            case "channel_renamed":
                children = (
                    <TextReact
                        id={`app.main.channel.system.channel_renamed`}
                        fields={{
                            user: <UserShort user={data.by} />,
                            name: <b>{data.name}</b>,
                        }}
                    />
                );
                break;
            case "channel_description_changed":
            case "channel_icon_changed":
                children = (
                    <TextReact
                        id={`app.main.channel.system.${data.type}`}
                        fields={{
                            user: <UserShort user={data.by} />,
                        }}
                    />
                );
                break;
        }

        return (
            <MessageBase
                highlight={highlight}
                onContextMenu={
                    attachContext
                        ? attachContextMenu("Menu", {
                              message,
                              contextualChannel: message.channel,
                          })
                        : undefined
                }>
                {!hideInfo && (
                    <MessageInfo>
                        <MessageDetail message={message} position="left" />
                        <SystemIcon className="system-message-icon" />
                    </MessageInfo>
                )}
                <SystemContent>{children}</SystemContent>
            </MessageBase>
        );
    },
);
