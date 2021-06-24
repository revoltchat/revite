import { Channel } from "revolt.js";

export type NotificationState = 'all' | 'mention' | 'none' | 'muted';

export type Notifications = {
    [key: string]: NotificationState
}

export const DEFAULT_STATES: { [key in Channel['channel_type']]: NotificationState } = {
    'SavedMessages': 'all',
    'DirectMessage': 'all',
    'Group': 'all',
    'TextChannel': 'mention',
    'VoiceChannel': 'mention'
};

export function getNotificationState(notifications: Notifications, channel: Channel) {
    return notifications[channel._id] ?? DEFAULT_STATES[channel.channel_type];
}

export type NotificationsAction =
    | { type: undefined }
    | {
        type: "NOTIFICATIONS_SET";
        key: string;
        state: NotificationState;
      }
    | {
        type: "NOTIFICATIONS_REMOVE";
        key: string;
      }
    | {
        type: "RESET";
      };

export function notifications(
    state = {} as Notifications,
    action: NotificationsAction
): Notifications {
    switch (action.type) {
        case "NOTIFICATIONS_SET":
            return {
                ...state,
                [action.key]: action.state
            };
        case "NOTIFICATIONS_REMOVE":
            {
                const { [action.key]: _, ...newState } = state;
                return newState;
            }
        case "RESET":
            return {};
        default:
            return state;
    }
}
