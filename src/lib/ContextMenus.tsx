import {
    At,
    Bell,
    BellOff,
    Check,
    CheckSquare,
    ChevronRight,
    Block,
    Square,
    LeftArrowAlt,
    Trash,
} from "@styled-icons/boxicons-regular";
import { Cog } from "@styled-icons/boxicons-solid";
import { useHistory } from "react-router-dom";
import {
    Attachment,
    Channels,
    Message,
    Servers,
    Users,
} from "revolt.js/dist/api/objects";
import {
    ChannelPermission,
    ServerPermission,
    UserPermission,
} from "revolt.js/dist/api/permissions";

import {
    ContextMenu,
    ContextMenuWithData,
    MenuItem,
    openContextMenu,
} from "preact-context-menu";
import { Text } from "preact-i18n";
import { useContext } from "preact/hooks";

import { dispatch } from "../redux";
import { connectState } from "../redux/connector";
import {
    getNotificationState,
    Notifications,
    NotificationState,
} from "../redux/reducers/notifications";
import { QueuedMessage } from "../redux/reducers/queue";

import { useIntermediate } from "../context/intermediate/Intermediate";
import {
    AppContext,
    ClientStatus,
    StatusContext,
} from "../context/revoltjs/RevoltClient";
import {
    useChannel,
    useChannelPermission,
    useForceUpdate,
    useServer,
    useServerPermission,
    useUser,
    useUserPermission,
} from "../context/revoltjs/hooks";
import { takeError } from "../context/revoltjs/util";

import UserStatus from "../components/common/user/UserStatus";
import IconButton from "../components/ui/IconButton";
import LineDivider from "../components/ui/LineDivider";

import { Children } from "../types/Preact";
import { internalEmit } from "./eventEmitter";

interface ContextMenuData {
    user?: string;
    server?: string;
    server_list?: string;
    channel?: string;
    message?: Message;

    unread?: boolean;
    queued?: QueuedMessage;
    contextualChannel?: string;
}

type Action =
    | { action: "copy_id"; id: string }
    | { action: "copy_selection" }
    | { action: "copy_text"; content: string }
    | { action: "mark_as_read"; channel: Channels.Channel }
    | { action: "retry_message"; message: QueuedMessage }
    | { action: "cancel_message"; message: QueuedMessage }
    | { action: "mention"; user: string }
    | { action: "reply_message"; id: string }
    | { action: "quote_message"; content: string }
    | { action: "edit_message"; id: string }
    | { action: "delete_message"; target: Channels.Message }
    | { action: "open_file"; attachment: Attachment }
    | { action: "save_file"; attachment: Attachment }
    | { action: "copy_file_link"; attachment: Attachment }
    | { action: "open_link"; link: string }
    | { action: "copy_link"; link: string }
    | { action: "remove_member"; channel: string; user: string }
    | { action: "kick_member"; target: Servers.Server; user: string }
    | { action: "ban_member"; target: Servers.Server; user: string }
    | { action: "view_profile"; user: string }
    | { action: "message_user"; user: string }
    | { action: "block_user"; user: Users.User }
    | { action: "unblock_user"; user: Users.User }
    | { action: "add_friend"; user: Users.User }
    | { action: "remove_friend"; user: Users.User }
    | { action: "cancel_friend"; user: Users.User }
    | { action: "set_presence"; presence: Users.Presence }
    | { action: "set_status" }
    | { action: "clear_status" }
    | { action: "create_channel"; target: Servers.Server }
    | {
          action: "create_invite";
          target:
              | Channels.GroupChannel
              | Channels.TextChannel
              | Channels.VoiceChannel;
      }
    | { action: "leave_group"; target: Channels.GroupChannel }
    | {
          action: "delete_channel";
          target: Channels.TextChannel | Channels.VoiceChannel;
      }
    | { action: "close_dm"; target: Channels.DirectMessageChannel }
    | { action: "leave_server"; target: Servers.Server }
    | { action: "delete_server"; target: Servers.Server }
    | { action: "open_notification_options"; channel: Channels.Channel }
    | { action: "open_settings" }
    | { action: "open_channel_settings"; id: string }
    | { action: "open_server_settings"; id: string }
    | { action: "open_server_channel_settings"; server: string; id: string }
    | {
          action: "set_notification_state";
          key: string;
          state?: NotificationState;
      };

type Props = {
    notifications: Notifications;
};

function ContextMenus(props: Props) {
    const { openScreen, writeClipboard } = useIntermediate();
    const client = useContext(AppContext);
    const userId = client.user!._id;
    const status = useContext(StatusContext);
    const isOnline = status === ClientStatus.ONLINE;
    const history = useHistory();

    function contextClick(data?: Action) {
        if (typeof data === "undefined") return;

        (async () => {
            switch (data.action) {
                case "copy_id":
                    writeClipboard(data.id);
                    break;
                case "copy_selection":
                    writeClipboard(document.getSelection()?.toString() ?? "");
                    break;
                case "mark_as_read":
                    {
                        if (
                            data.channel.channel_type === "SavedMessages" ||
                            data.channel.channel_type === "VoiceChannel"
                        )
                            return;

                        let message =
                            data.channel.channel_type === "TextChannel"
                                ? data.channel.last_message
                                : data.channel.last_message._id;
                        dispatch({
                            type: "UNREADS_MARK_READ",
                            channel: data.channel._id,
                            message,
                        });

                        client.req(
                            "PUT",
                            `/channels/${data.channel._id}/ack/${message}` as "/channels/id/ack/id",
                        );
                    }
                    break;

                case "retry_message":
                    {
                        const nonce = data.message.id;
                        const fail = (error: any) =>
                            dispatch({
                                type: "QUEUE_FAIL",
                                nonce,
                                error,
                            });

                        client.channels
                            .sendMessage(data.message.channel, {
                                nonce: data.message.id,
                                content: data.message.data.content as string,
                                replies: data.message.data.replies,
                            })
                            .catch(fail);

                        dispatch({
                            type: "QUEUE_START",
                            nonce,
                        });
                    }
                    break;

                case "cancel_message":
                    {
                        dispatch({
                            type: "QUEUE_REMOVE",
                            nonce: data.message.id,
                        });
                    }
                    break;

                case "mention":
                    {
                        internalEmit(
                            "MessageBox",
                            "append",
                            `<@${data.user}>`,
                            "mention",
                        );
                    }
                    break;

                case "copy_text":
                    writeClipboard(data.content);
                    break;

                case "reply_message":
                    {
                        internalEmit("ReplyBar", "add", data.id);
                    }
                    break;

                case "quote_message":
                    {
                        internalEmit(
                            "MessageBox",
                            "append",
                            data.content,
                            "quote",
                        );
                    }
                    break;

                case "edit_message":
                    {
                        internalEmit(
                            "MessageRenderer",
                            "edit_message",
                            data.id,
                        );
                    }
                    break;

                case "open_file":
                    {
                        window
                            .open(
                                client.generateFileURL(data.attachment),
                                "_blank",
                            )
                            ?.focus();
                    }
                    break;

                case "save_file":
                    {
                        window.open(
                            // ! FIXME: do this from revolt.js
                            client
                                .generateFileURL(data.attachment)
                                ?.replace(
                                    "attachments",
                                    "attachments/download",
                                ),
                            "_blank",
                        );
                    }
                    break;

                case "copy_file_link":
                    {
                        const { filename } = data.attachment;
                        writeClipboard(
                            // ! FIXME: do from r.js
                            client.generateFileURL(data.attachment) +
                                `/${encodeURI(filename)}`,
                        );
                    }
                    break;

                case "open_link":
                    {
                        window.open(data.link, "_blank")?.focus();
                    }
                    break;

                case "copy_link":
                    {
                        writeClipboard(data.link);
                    }
                    break;

                case "remove_member":
                    {
                        client.channels.removeMember(data.channel, data.user);
                    }
                    break;

                case "view_profile":
                    openScreen({ id: "profile", user_id: data.user });
                    break;

                case "message_user":
                    {
                        const channel = await client.users.openDM(data.user);
                        if (channel) {
                            history.push(`/channel/${channel._id}`);
                        }
                    }
                    break;

                case "add_friend":
                    {
                        await client.users.addFriend(data.user.username);
                    }
                    break;

                case "block_user":
                    openScreen({
                        id: "special_prompt",
                        type: "block_user",
                        target: data.user,
                    });
                    break;
                case "unblock_user":
                    await client.users.unblockUser(data.user._id);
                    break;
                case "remove_friend":
                    openScreen({
                        id: "special_prompt",
                        type: "unfriend_user",
                        target: data.user,
                    });
                    break;
                case "cancel_friend":
                    await client.users.removeFriend(data.user._id);
                    break;

                case "set_presence":
                    {
                        await client.users.editUser({
                            status: {
                                ...client.user?.status,
                                presence: data.presence,
                            },
                        });
                    }
                    break;

                case "set_status":
                    openScreen({
                        id: "special_input",
                        type: "set_custom_status",
                    });
                    break;

                case "clear_status":
                    {
                        let { text, ...status } = client.user?.status ?? {};
                        await client.users.editUser({ status });
                    }
                    break;

                case "leave_group":
                case "close_dm":
                case "leave_server":
                case "delete_channel":
                case "delete_server":
                case "delete_message":
                case "create_channel":
                case "create_invite":
                    // The any here is because typescript flattens the case types into a single type and type structure and specifity is lost or whatever
                    openScreen({
                        id: "special_prompt",
                        type: data.action,
                        target: data.target as any,
                    });
                    break;

                case "ban_member":
                case "kick_member":
                    openScreen({
                        id: "special_prompt",
                        type: data.action,
                        target: data.target,
                        user: data.user,
                    });
                    break;

                case "open_notification_options": {
                    openContextMenu("NotificationOptions", {
                        channel: data.channel,
                    });
                    break;
                }

                case "open_settings":
                    history.push("/settings");
                    break;
                case "open_channel_settings":
                    history.push(`/channel/${data.id}/settings`);
                    break;
                case "open_server_channel_settings":
                    history.push(
                        `/server/${data.server}/channel/${data.id}/settings`,
                    );
                    break;
                case "open_server_settings":
                    history.push(`/server/${data.id}/settings`);
                    break;

                case "set_notification_state": {
                    const { key, state } = data;
                    if (state) {
                        dispatch({ type: "NOTIFICATIONS_SET", key, state });
                    } else {
                        dispatch({ type: "NOTIFICATIONS_REMOVE", key });
                    }
                    break;
                }
            }
        })().catch((err) => {
            openScreen({ id: "error", error: takeError(err) });
        });
    }

    return (
        <>
            <ContextMenuWithData id="Menu" onClose={contextClick}>
                {({
                    user: uid,
                    channel: cid,
                    server: sid,
                    message,
                    server_list,
                    queued,
                    unread,
                    contextualChannel: cxid,
                }: ContextMenuData) => {
                    const forceUpdate = useForceUpdate();
                    const elements: Children[] = [];
                    var lastDivider = false;

                    function generateAction(
                        action: Action,
                        locale?: string,
                        disabled?: boolean,
                        tip?: Children,
                    ) {
                        lastDivider = false;
                        elements.push(
                            <MenuItem data={action} disabled={disabled}>
                                <Text
                                    id={`app.context_menu.${
                                        locale ?? action.action
                                    }`}
                                />
                                {tip && <div className="tip">{tip}</div>}
                            </MenuItem>,
                        );
                    }

                    function pushDivider() {
                        if (lastDivider || elements.length === 0) return;
                        lastDivider = true;
                        elements.push(<LineDivider />);
                    }

                    if (server_list) {
                        let server = useServer(server_list, forceUpdate);
                        let permissions = useServerPermission(
                            server_list,
                            forceUpdate,
                        );
                        if (server) {
                            if (permissions & ServerPermission.ManageChannels)
                                generateAction({
                                    action: "create_channel",
                                    target: server,
                                });
                            if (permissions & ServerPermission.ManageServer)
                                generateAction({
                                    action: "open_server_settings",
                                    id: server_list,
                                });
                        }

                        return elements;
                    }

                    if (document.getSelection()?.toString().length ?? 0 > 0) {
                        generateAction(
                            { action: "copy_selection" },
                            undefined,
                            undefined,
                            <Text id="shortcuts.ctrlc" />,
                        );
                        pushDivider();
                    }

                    const channel = useChannel(cid, forceUpdate);
                    const contextualChannel = useChannel(cxid, forceUpdate);
                    const targetChannel = channel ?? contextualChannel;

                    const user = useUser(uid, forceUpdate);
                    const serverChannel =
                        targetChannel &&
                        (targetChannel.channel_type === "TextChannel" ||
                            targetChannel.channel_type === "VoiceChannel")
                            ? targetChannel
                            : undefined;
                    const server = useServer(
                        serverChannel ? serverChannel.server : sid,
                        forceUpdate,
                    );

                    const channelPermissions = targetChannel
                        ? useChannelPermission(targetChannel._id, forceUpdate)
                        : 0;
                    const serverPermissions = server
                        ? useServerPermission(server._id, forceUpdate)
                        : serverChannel
                        ? useServerPermission(serverChannel.server, forceUpdate)
                        : 0;
                    const userPermissions = user
                        ? useUserPermission(user._id, forceUpdate)
                        : 0;

                    if (channel && unread) {
                        generateAction({ action: "mark_as_read", channel });
                    }

                    if (contextualChannel) {
                        if (user && user._id !== userId) {
                            generateAction({
                                action: "mention",
                                user: user._id,
                            });

                            pushDivider();
                        }
                    }

                    if (user) {
                        let actions: Action["action"][];
                        switch (user.relationship) {
                            case Users.Relationship.User:
                                actions = [];
                                break;
                            case Users.Relationship.Friend:
                                actions = ["remove_friend", "block_user"];
                                break;
                            case Users.Relationship.Incoming:
                                actions = [
                                    "add_friend",
                                    "cancel_friend",
                                    "block_user",
                                ];
                                break;
                            case Users.Relationship.Outgoing:
                                actions = ["cancel_friend", "block_user"];
                                break;
                            case Users.Relationship.Blocked:
                                actions = ["unblock_user"];
                                break;
                            case Users.Relationship.BlockedOther:
                                actions = ["block_user"];
                                break;
                            case Users.Relationship.None:
                            default:
                                actions = ["add_friend", "block_user"];
                        }

                        if (userPermissions & UserPermission.ViewProfile) {
                            generateAction({
                                action: "view_profile",
                                user: user._id,
                            });
                        }

                        if (
                            user._id !== userId &&
                            userPermissions & UserPermission.SendMessage
                        ) {
                            generateAction({
                                action: "message_user",
                                user: user._id,
                            });
                        }

                        for (let i = 0; i < actions.length; i++) {
                            // The any here is because typescript can't determine that user the actions are linked together correctly
                            generateAction({ action: actions[i] as any, user });
                        }
                    }

                    if (contextualChannel) {
                        if (contextualChannel.channel_type === "Group" && uid) {
                            if (
                                contextualChannel.owner === userId &&
                                userId !== uid
                            ) {
                                generateAction({
                                    action: "remove_member",
                                    channel: contextualChannel._id,
                                    user: uid,
                                });
                            }
                        }

                        if (
                            server &&
                            uid &&
                            userId !== uid &&
                            uid !== server.owner
                        ) {
                            if (
                                serverPermissions & ServerPermission.KickMembers
                            )
                                generateAction({
                                    action: "kick_member",
                                    target: server,
                                    user: uid,
                                });

                            if (serverPermissions & ServerPermission.BanMembers)
                                generateAction({
                                    action: "ban_member",
                                    target: server,
                                    user: uid,
                                });
                        }
                    }

                    if (queued) {
                        generateAction({
                            action: "retry_message",
                            message: queued,
                        });

                        generateAction({
                            action: "cancel_message",
                            message: queued,
                        });
                    }

                    if (message && !queued) {
                        generateAction({
                            action: "reply_message",
                            id: message._id,
                        });

                        if (
                            typeof message.content === "string" &&
                            message.content.length > 0
                        ) {
                            generateAction({
                                action: "quote_message",
                                content: message.content,
                            });

                            generateAction({
                                action: "copy_text",
                                content: message.content,
                            });
                        }

                        if (message.author === userId) {
                            generateAction({
                                action: "edit_message",
                                id: message._id,
                            });
                        }

                        if (
                            message.author === userId ||
                            channelPermissions &
                                ChannelPermission.ManageMessages
                        ) {
                            generateAction({
                                action: "delete_message",
                                target: message,
                            });
                        }

                        if (message.attachments) {
                            pushDivider();
                            const { metadata } = message.attachments[0];
                            const { type } = metadata;

                            generateAction(
                                {
                                    action: "open_file",
                                    attachment: message.attachments[0],
                                },
                                type === "Image"
                                    ? "open_image"
                                    : type === "Video"
                                    ? "open_video"
                                    : "open_file",
                            );

                            generateAction(
                                {
                                    action: "save_file",
                                    attachment: message.attachments[0],
                                },
                                type === "Image"
                                    ? "save_image"
                                    : type === "Video"
                                    ? "save_video"
                                    : "save_file",
                            );

                            generateAction(
                                {
                                    action: "copy_file_link",
                                    attachment: message.attachments[0],
                                },
                                "copy_link",
                            );
                        }

                        if (document.activeElement?.tagName === "A") {
                            let link =
                                document.activeElement.getAttribute("href");
                            if (link) {
                                pushDivider();
                                generateAction({ action: "open_link", link });
                                generateAction({ action: "copy_link", link });
                            }
                        }
                    }

                    let id = sid ?? cid ?? uid ?? message?._id;
                    if (id) {
                        pushDivider();

                        if (channel) {
                            if (channel.channel_type !== "VoiceChannel") {
                                generateAction(
                                    {
                                        action: "open_notification_options",
                                        channel,
                                    },
                                    undefined,
                                    undefined,
                                    <ChevronRight size={24} />,
                                );
                            }

                            switch (channel.channel_type) {
                                case "Group":
                                    // ! generateAction({ action: "create_invite", target: channel }); FIXME: add support for group invites
                                    generateAction(
                                        {
                                            action: "open_channel_settings",
                                            id: channel._id,
                                        },
                                        "open_group_settings",
                                    );
                                    generateAction(
                                        {
                                            action: "leave_group",
                                            target: channel,
                                        },
                                        "leave_group",
                                    );
                                    break;
                                case "DirectMessage":
                                    generateAction({
                                        action: "close_dm",
                                        target: channel,
                                    });
                                    break;
                                case "TextChannel":
                                case "VoiceChannel":
                                    // ! FIXME: add permission for invites
                                    generateAction({
                                        action: "create_invite",
                                        target: channel,
                                    });

                                    if (
                                        serverPermissions &
                                        ServerPermission.ManageServer
                                    )
                                        generateAction(
                                            {
                                                action: "open_server_channel_settings",
                                                server: channel.server,
                                                id: channel._id,
                                            },
                                            "open_channel_settings",
                                        );

                                    if (
                                        serverPermissions &
                                        ServerPermission.ManageChannels
                                    )
                                        generateAction({
                                            action: "delete_channel",
                                            target: channel,
                                        });

                                    break;
                            }
                        }

                        if (sid && server) {
                            if (
                                serverPermissions &
                                ServerPermission.ManageServer
                            )
                                generateAction(
                                    {
                                        action: "open_server_settings",
                                        id: server._id,
                                    },
                                    "open_server_settings",
                                );

                            if (userId === server.owner) {
                                generateAction(
                                    { action: "delete_server", target: server },
                                    "delete_server",
                                );
                            } else {
                                generateAction(
                                    { action: "leave_server", target: server },
                                    "leave_server",
                                );
                            }
                        }

                        generateAction(
                            { action: "copy_id", id },
                            sid
                                ? "copy_sid"
                                : cid
                                ? "copy_cid"
                                : message
                                ? "copy_mid"
                                : "copy_uid",
                        );
                    }

                    return elements;
                }}
            </ContextMenuWithData>
            <ContextMenuWithData
                id="Status"
                onClose={contextClick}
                className="Status">
                {() => (
                    <>
                        <div className="header">
                            <div className="main">
                                <div>@{client.user!.username}</div>
                                <div className="status">
                                    <UserStatus user={client.user!} />
                                </div>
                            </div>
                            <IconButton>
                                <MenuItem data={{ action: "open_settings" }}>
                                    <Cog size={18} />
                                </MenuItem>
                            </IconButton>
                        </div>
                        <LineDivider />
                        <MenuItem
                            data={{
                                action: "set_presence",
                                presence: Users.Presence.Online,
                            }}
                            disabled={!isOnline}>
                            <div className="indicator online" />
                            <Text id={`app.status.online`} />
                        </MenuItem>
                        <MenuItem
                            data={{
                                action: "set_presence",
                                presence: Users.Presence.Idle,
                            }}
                            disabled={!isOnline}>
                            <div className="indicator idle" />
                            <Text id={`app.status.idle`} />
                        </MenuItem>
                        <MenuItem
                            data={{
                                action: "set_presence",
                                presence: Users.Presence.Busy,
                            }}
                            disabled={!isOnline}>
                            <div className="indicator busy" />
                            <Text id={`app.status.busy`} />
                        </MenuItem>
                        <MenuItem
                            data={{
                                action: "set_presence",
                                presence: Users.Presence.Invisible,
                            }}
                            disabled={!isOnline}>
                            <div className="indicator invisible" />
                            <Text id={`app.status.invisible`} />
                        </MenuItem>
                        <LineDivider />
                        <div className="header">
                            <div className="main">
                                <MenuItem
                                    data={{ action: "set_status" }}
                                    disabled={!isOnline}>
                                    <Text
                                        id={`app.context_menu.custom_status`}
                                    />
                                </MenuItem>
                            </div>
                            {client.user!.status?.text && (
                                <IconButton>
                                    <MenuItem data={{ action: "clear_status" }}>
                                        <Trash size={18} />
                                    </MenuItem>
                                </IconButton>
                            )}
                        </div>
                    </>
                )}
            </ContextMenuWithData>
            <ContextMenuWithData
                id="NotificationOptions"
                onClose={contextClick}>
                {({ channel }: { channel: Channels.Channel }) => {
                    const state = props.notifications[channel._id];
                    const actual = getNotificationState(
                        props.notifications,
                        channel,
                    );

                    let elements: Children[] = [
                        <MenuItem
                            data={{
                                action: "set_notification_state",
                                key: channel._id,
                            }}>
                            <Text
                                id={`app.main.channel.notifications.default`}
                            />
                            <div className="tip">
                                {state !== undefined && <Square size={20} />}
                                {state === undefined && (
                                    <CheckSquare size={20} />
                                )}
                            </div>
                        </MenuItem>,
                    ];

                    function generate(key: string, icon: Children) {
                        elements.push(
                            <MenuItem
                                data={{
                                    action: "set_notification_state",
                                    key: channel._id,
                                    state: key,
                                }}>
                                {icon}
                                <Text
                                    id={`app.main.channel.notifications.${key}`}
                                />
                                {state === undefined && actual === key && (
                                    <div className="tip">
                                        <LeftArrowAlt size={20} />
                                    </div>
                                )}
                                {state === key && (
                                    <div className="tip">
                                        <Check size={20} />
                                    </div>
                                )}
                            </MenuItem>,
                        );
                    }

                    generate("all", <Bell size={24} />);
                    generate("mention", <At size={24} />);
                    generate("muted", <BellOff size={24} />);
                    generate("none", <Block size={24} />);

                    return elements;
                }}
            </ContextMenuWithData>
        </>
    );
}

export default connectState(ContextMenus, (state) => {
    return {
        notifications: state.notifications,
    };
});
