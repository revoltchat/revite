import type { Channel, Message } from "revolt.js";

import type { SyncUpdateAction } from "./sync";

export type NotificationState = "all" | "mention" | "none" | "muted";

export type Notifications = {
    [key: string]: NotificationState;
};

export const DEFAULT_STATES: {
    [key in Channel["channel_type"]]: NotificationState;
} = {
    SavedMessages: "all",
    DirectMessage: "all",
    Group: "all",
    TextChannel: "mention",
    VoiceChannel: "mention",
};

export function getNotificationState(
    notifications: Notifications,
    channel: Channel,
) {
    return notifications[channel._id] ?? DEFAULT_STATES[channel.channel_type];
}

export function shouldNotify(
    state: NotificationState,
    message: Message,
    user_id: string,
) {
    switch (state) {
        case "muted":
        case "none":
            return false;
        case "mention": {
            if (!message.mentions?.includes(user_id)) return false;
        }
    }

    return true;
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
    | SyncUpdateAction
    | {
          type: "RESET";
      };

export function notifications(
    state = {} as Notifications,
    action: NotificationsAction,
): Notifications {
    switch (action.type) {
        case "NOTIFICATIONS_SET":
            return {
                ...state,
                [action.key]: action.state,
            };
        case "NOTIFICATIONS_REMOVE": {
            const { [action.key]: _, ...newState } = state;
            return newState;
        }
        case "SYNC_UPDATE":
            return action.update.notifications?.[1] ?? state;
        case "RESET":
            return {};
        default:
            return state;
    }
}
