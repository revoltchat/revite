import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { attachContextMenu } from "preact-context-menu";

import { TextReact } from "../../../lib/i18n";

import { User } from "../../../mobx";
import { useData } from "../../../mobx/State";

import { useForceUpdate, useUser } from "../../../context/revoltjs/hooks";
import { MessageObject } from "../../../context/revoltjs/util";

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

type SystemMessageParsed =
    | { type: "text"; content: string }
    | { type: "user_added"; user: User; by: User }
    | { type: "user_remove"; user: User; by: User }
    | { type: "user_joined"; user: User }
    | { type: "user_left"; user: User }
    | { type: "user_kicked"; user: User }
    | { type: "user_banned"; user: User }
    | { type: "channel_renamed"; name: string; by: User }
    | { type: "channel_description_changed"; by: User }
    | { type: "channel_icon_changed"; by: User };

interface Props {
    attachContext?: boolean;
    message: MessageObject;
    highlight?: boolean;
    hideInfo?: boolean;
}

export const SystemMessage = observer(
    ({ attachContext, message, highlight, hideInfo }: Props) => {
        const store = useData();

        let data: SystemMessageParsed;
        const content = message.content;
        if (typeof content === "object") {
            switch (content.type) {
                case "text":
                    data = content;
                    break;
                case "user_added":
                case "user_remove":
                    data = {
                        type: content.type,
                        user: store.users.get(content.id)!,
                        by: store.users.get(content.by)!,
                    };
                    break;
                case "user_joined":
                case "user_left":
                case "user_kicked":
                case "user_banned":
                    data = {
                        type: content.type,
                        user: store.users.get(content.id)!,
                    };
                    break;
                case "channel_renamed":
                    data = {
                        type: "channel_renamed",
                        name: content.name,
                        by: store.users.get(content.by)!,
                    };
                    break;
                case "channel_description_changed":
                case "channel_icon_changed":
                    data = {
                        type: content.type,
                        by: store.users.get(content.by)!,
                    };
                    break;
                default:
                    data = { type: "text", content: JSON.stringify(content) };
            }
        } else {
            data = { type: "text", content };
        }

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
                    </MessageInfo>
                )}
                <SystemContent>{children}</SystemContent>
            </MessageBase>
        );
    },
);
