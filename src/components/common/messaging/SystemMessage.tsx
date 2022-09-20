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
import { Message, API } from "revolt.js";
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

export const SystemMessage = observer(
    ({ attachContext, message, highlight, hideInfo }: Props) => {
        const data = message.asSystemMessage;
        if (!data) return null;

        const settings = useApplicationState().settings;

        const SystemMessageIcon =
            iconDictionary[data.type as API.SystemMessage["type"]] ??
            InfoCircle;

        let children = null;
        switch (data.type) {
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
            case "user_banned": {
                const createdAt = data.user ? decodeTime(data.user._id) : null;
                children = (
                    <Row centred>
                        <TextReact
                            id={`app.main.channel.system.${data.type}`}
                            fields={{
                                user: <UserShort user={data.user} />,
                            }}
                        />
                        {data.type == "user_joined" &&
                            createdAt &&
                            (settings.get("appearance:show_account_age") ||
                                Date.now() - createdAt <
                                    1000 * 60 * 60 * 24 * 7) && (
                                <Tooltip
                                    content={
                                        <Text
                                            id="app.main.channel.system.registered_at"
                                            fields={{
                                                time: dayjs(
                                                    createdAt,
                                                ).fromNow(),
                                            }}
                                        />
                                    }>
                                    <InfoCircle size={16} />
                                </Tooltip>
                            )}
                    </Row>
                );
                break;
            }
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
            case "channel_ownership_changed":
                children = (
                    <TextReact
                        id={`app.main.channel.system.channel_ownership_changed`}
                        fields={{
                            from: <UserShort user={data.from} />,
                            to: <UserShort user={data.to} />,
                        }}
                    />
                );
                break;
            case "text":
                if (message.system?.type === "text") {
                    children = <Markdown content={message.system?.content} />;
                }
                break;
        }

        return (
            <MessageBase
                highlight={highlight}
                {...(attachContext
                    ? useTriggerEvents("Menu", {
                          message,
                          contextualChannel: message.channel,
                      })
                    : undefined)}>
                {!hideInfo && (
                    <MessageInfo click={false}>
                        <MessageDetail message={message} position="left" />
                        <SystemMessageIcon className="systemIcon" />
                    </MessageInfo>
                )}
                <SystemContent>{children}</SystemContent>
            </MessageBase>
        );
    },
);
