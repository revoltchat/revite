import { X, Crown } from "@styled-icons/boxicons-regular";
import { Channels, Users } from "revolt.js/dist/api/objects";

import styles from "./Item.module.scss";
import classNames from "classnames";
import { attachContextMenu } from "preact-context-menu";
import { Localizer, Text } from "preact-i18n";

import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { stopPropagation } from "../../../lib/stopPropagation";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import ChannelIcon from "../../common/ChannelIcon";
import Tooltip from "../../common/Tooltip";
import UserIcon from "../../common/user/UserIcon";
import UserStatus from "../../common/user/UserStatus";
import IconButton from "../../ui/IconButton";

import { Children } from "../../../types/Preact";

type CommonProps = Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "children" | "as"
> & {
    active?: boolean;
    alert?: "unread" | "mention";
    alertCount?: number;
};

type UserProps = CommonProps & {
    user: Users.User;
    context?: Channels.Channel;
    channel?: Channels.DirectMessageChannel;
};

export function UserButton(props: UserProps) {
    const { active, alert, alertCount, user, context, channel, ...divProps } =
        props;
    const { openScreen } = useIntermediate();

    return (
        <div
            {...divProps}
            className={classNames(styles.item, styles.user)}
            data-active={active}
            data-alert={typeof alert === "string"}
            data-online={
                typeof channel !== "undefined" ||
                (user.online &&
                    user.status?.presence !== Users.Presence.Invisible)
            }
            onContextMenu={attachContextMenu("Menu", {
                user: user._id,
                channel: channel?._id,
                unread: alert,
                contextualChannel: context?._id,
            })}>
            <UserIcon
                className={styles.avatar}
                target={user}
                size={32}
                status
            />
            <div className={styles.name}>
                <div>{user.username}</div>
                {
                    <div className={styles.subText}>
                        {channel?.last_message && alert ? (
                            channel.last_message.short
                        ) : (
                            <UserStatus user={user} />
                        )}
                    </div>
                }
            </div>
            <div className={styles.button}>
                {context?.channel_type === "Group" &&
                    context.owner === user._id && (
                        <Localizer>
                            <Tooltip
                                content={<Text id="app.main.groups.owner" />}>
                                <Crown size={20} />
                            </Tooltip>
                        </Localizer>
                    )}
                {alert && (
                    <div className={styles.alert} data-style={alert}>
                        {alertCount}
                    </div>
                )}
                {!isTouchscreenDevice && channel && (
                    <IconButton
                        className={styles.icon}
                        onClick={(e) =>
                            stopPropagation(e) &&
                            openScreen({
                                id: "special_prompt",
                                type: "close_dm",
                                target: channel,
                            })
                        }>
                        <X size={24} />
                    </IconButton>
                )}
            </div>
        </div>
    );
}

type ChannelProps = CommonProps & {
    channel: Channels.Channel & { unread?: string };
    user?: Users.User;
    compact?: boolean;
};

export function ChannelButton(props: ChannelProps) {
    const { active, alert, alertCount, channel, user, compact, ...divProps } =
        props;

    if (channel.channel_type === "SavedMessages") throw "Invalid channel type.";
    if (channel.channel_type === "DirectMessage") {
        if (typeof user === "undefined") throw "No user provided.";
        return <UserButton {...{ active, alert, channel, user }} />;
    }

    const { openScreen } = useIntermediate();

    return (
        <div
            {...divProps}
            data-active={active}
            data-alert={typeof alert === "string"}
            aria-label={{}} /*FIXME: ADD ARIA LABEL*/
            className={classNames(styles.item, { [styles.compact]: compact })}
            onContextMenu={attachContextMenu("Menu", {
                channel: channel._id,
                unread: typeof channel.unread !== "undefined",
            })}>
            <ChannelIcon
                className={styles.avatar}
                target={channel}
                size={compact ? 24 : 32}
            />
            <div className={styles.name}>
                <div>{channel.name}</div>
                {channel.channel_type === "Group" && (
                    <div className={styles.subText}>
                        {channel.last_message && alert ? (
                            channel.last_message.short
                        ) : (
                            <Text
                                id="quantities.members"
                                plural={channel.recipients.length}
                                fields={{ count: channel.recipients.length }}
                            />
                        )}
                    </div>
                )}
            </div>
            <div className={styles.button}>
                {alert && (
                    <div className={styles.alert} data-style={alert}>
                        {alertCount}
                    </div>
                )}
                {!isTouchscreenDevice && channel.channel_type === "Group" && (
                    <IconButton
                        className={styles.icon}
                        onClick={() =>
                            openScreen({
                                id: "special_prompt",
                                type: "leave_group",
                                target: channel,
                            })
                        }>
                        <X size={24} />
                    </IconButton>
                )}
            </div>
        </div>
    );
}

type ButtonProps = CommonProps & {
    onClick?: () => void;
    children?: Children;
    className?: string;
    compact?: boolean;
};

export default function ButtonItem(props: ButtonProps) {
    const {
        active,
        alert,
        alertCount,
        onClick,
        className,
        children,
        compact,
        ...divProps
    } = props;

    return (
        <div
            {...divProps}
            className={classNames(
                styles.item,
                { [styles.compact]: compact, [styles.normal]: !compact },
                className,
            )}
            onClick={onClick}
            data-active={active}
            data-alert={typeof alert === "string"}>
            <div className={styles.content}>{children}</div>
            {alert && (
                <div className={styles.alert} data-style={alert}>
                    {alertCount}
                </div>
            )}
        </div>
    );
}
