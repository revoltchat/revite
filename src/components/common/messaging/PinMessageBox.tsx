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
    Key,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Message, Channel, API } from "revolt.js";
import styled from "styled-components/macro";
import { decodeTime } from "ulid";

import { useTriggerEvents } from "preact-context-menu";
import { Text } from "preact-i18n";

import { Row } from "@revoltchat/ui";

import { TextReact } from "../../../lib/i18n";

import { useApplicationState } from "../../../mobx/State";

import { dayjs } from "../../../context/Locale";

import Markdown from "../../markdown/Markdown";
import Tooltip from "../Tooltip";
import UserShort from "../user/UserShort";
import MessageBase, { MessageDetail, MessageInfo } from "./MessageBase";
import { Pin } from "@styled-icons/boxicons-regular";
import { useHistory } from "react-router-dom";

const SystemContent = styled.div`
    gap: 4px;
    display: flex;
    padding: 2px 0;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: row;
    font-size: 14px;
    color: var(--secondary-foreground);

    span {
        font-weight: 600;
        color: var(--foreground);
    }

    svg {
        margin-inline-end: 4px;
    }

    svg,
    span {
        cursor: pointer;
    }

    span:hover {
        text-decoration: underline;
    }
`;

interface Props {
    attachContext?: boolean;
    message: Message;
    highlight?: boolean;
    hideInfo?: boolean;
    channel: Channel
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
    channel_ownership_changed: Key,
    text: InfoCircle,
};

export const PinMessageBox = observer(
    ({ attachContext, message, channel, highlight, hideInfo }: Props) => {
        const data: any = message.system
        if (!data) return null;
        const history = useHistory();


        let children = null;
        let userName = message.client ? message.client.user?.username : ""


        if (data.type as string == "message_pinned") {
            children = children = (
                <div
                    onClick={() => {
                        if (channel.channel_type === "TextChannel") {
                            history.push(
                                `/server/${channel.server_id}/channel/${channel._id}/${data.id}`,
                            );
                        } else {
                            history.push(`/channel/${channel._id}/${data.id}`);
                        }
                    }}
                >
                    <TextReact
                        id={`app.main.channel.system.message_pinned`}
                        fields={{
                            user: userName,
                        }}
                    />
                </div>
            );
        }
        if (data.type as string == "message_unpinned") {
            children = children = (
                <div
                    onClick={() => {
                        if (channel.channel_type === "TextChannel") {
                            history.push(
                                `/server/${channel.server_id}/channel/${channel._id}/${data.id}`,
                            );
                        } else {
                            history.push(`/channel/${channel._id}/${data.id}`);
                        }
                    }}
                >
                    <TextReact
                        id={`app.main.channel.system.message_unpinned`}
                        fields={{
                            user: userName,
                        }}
                    />
                </div>
            );
        }



        return (
            <MessageBase highlight={highlight}>


                {!hideInfo && (
                    <MessageInfo click={false}>
                        <MessageDetail message={message} position="left" />
                        {/* <SystemMessageIcon className="systemIcon" /> */}
                    </MessageInfo>
                )}


                <SystemContent style={{ height: 20, fontSize: 12, display: "block", width: "100%", textAlign: "center", cursor: "pointer" }}>{children}</SystemContent>
            </MessageBase>
        );
    },
);
