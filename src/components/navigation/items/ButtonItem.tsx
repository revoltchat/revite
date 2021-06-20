import classNames from 'classnames';
import styles from "./Item.module.scss";
import Tooltip from '../../common/Tooltip';
import IconButton from '../../ui/IconButton';
import { Localizer, Text } from "preact-i18n";
import { X, Zap } from "@styled-icons/feather";
import { Children } from "../../../types/Preact";
import UserIcon from '../../common/user/UserIcon';
import ChannelIcon from '../../common/ChannelIcon';
import UserStatus from '../../common/user/UserStatus';
import { attachContextMenu } from 'preact-context-menu';
import { Channels, Users } from "revolt.js/dist/api/objects";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { useIntermediate } from '../../../context/intermediate/Intermediate';

interface CommonProps {
    active?: boolean
    alert?: 'unread' | 'mention'
    alertCount?: number
}

type UserProps = CommonProps & {
    user: Users.User,
    context?: Channels.Channel,
    channel?: Channels.DirectMessageChannel
}

export function UserButton({ active, alert, alertCount, user, context, channel }: UserProps) {
    const { openScreen } = useIntermediate();

    return (
        <div
            className={classNames(styles.item, styles.user)}
            data-active={active}
            data-alert={typeof alert === 'string'}
            data-online={typeof channel !== 'undefined' || (user.online && user.status?.presence !== Users.Presence.Invisible)}
            onContextMenu={attachContextMenu('Menu', {
                user: user._id,
                channel: channel?._id,
                unread: alert,
                contextualChannel: context?._id
            })}>
            <div className={styles.avatar}>
                <UserIcon target={user} size={32} status />
            </div>
            <div className={styles.name}>
                <div>{user.username}</div>
                {
                    <div className={styles.subText}>
                        { channel?.last_message && alert ? (
                            channel.last_message.short
                        ) : (
                            <UserStatus user={user} />
                        ) }
                    </div>
                }
            </div>
            <div className={styles.button}>
                { context?.channel_type === "Group" &&
                    context.owner === user._id && (
                        <Localizer>
                            <Tooltip
                                content={
                                    <Text id="app.main.groups.owner" />
                                }
                            >
                                <Zap size={20} />
                            </Tooltip>
                        </Localizer>
                )}
                {alert && <div className={styles.alert} data-style={alert}>{ alertCount }</div>}
                { !isTouchscreenDevice && channel &&
                    <IconButton
                        className={styles.icon}
                        onClick={() => openScreen({ id: 'special_prompt', type: 'close_dm', target: channel })}>
                        <X size={24} />
                    </IconButton>
                }
            </div>
        </div>
    )
}

type ChannelProps = CommonProps & {
    channel: Channels.Channel,
    user?: Users.User
    compact?: boolean
}

export function ChannelButton({ active, alert, alertCount, channel, user, compact }: ChannelProps) {
    if (channel.channel_type === 'SavedMessages') throw "Invalid channel type.";
    if (channel.channel_type === 'DirectMessage') {
        if (typeof user === 'undefined') throw "No user provided.";
        return <UserButton {...{ active, alert, channel, user }} />
    }

    const { openScreen } = useIntermediate();

    return (
        <div
            data-active={active}
            data-alert={typeof alert === 'string'}
            className={classNames(styles.item, { [styles.compact]: compact })}
            onContextMenu={attachContextMenu('Menu', { channel: channel._id })}>
            <div className={styles.avatar}>
                <ChannelIcon target={channel} size={compact ? 24 : 32} />
            </div>
            <div className={styles.name}>
                <div>{channel.name}</div>
                { channel.channel_type === 'Group' &&
                    <div className={styles.subText}>
                        {(channel.last_message && alert) ? (
                            channel.last_message.short
                        ) : (
                            <Text
                                id="quantities.members"
                                plural={channel.recipients.length}
                                fields={{ count: channel.recipients.length }}
                            />
                        )}
                    </div>
                }
            </div>
            <div className={styles.button}>
                {alert && <div className={styles.alert} data-style={alert}>{ alertCount }</div>}
                {!isTouchscreenDevice && channel.channel_type === "Group" && (
                    <IconButton
                        className={styles.icon}
                        onClick={() => openScreen({ id: 'special_prompt', type: 'leave_group', target: channel })}>
                        <X size={24} />
                    </IconButton>
                )}
            </div>
        </div>
    )
}

type ButtonProps = CommonProps & {
    onClick?: () => void
    children?: Children
    className?: string
    compact?: boolean
}

export default function ButtonItem({ active, alert, alertCount, onClick, className, children, compact }: ButtonProps) {
    return (
        <div className={classNames(styles.item, { [styles.compact]: compact, [styles.normal]: !compact }, className)}
            onClick={onClick}
            data-active={active}
            data-alert={typeof alert === 'string'}>
            <div className={styles.content}>{ children }</div>
                {alert && <div className={styles.alert} data-style={alert}>{ alertCount }</div>}
        </div>
    )
}
