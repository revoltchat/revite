import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { Channel, Message, Server, User } from "revolt.js";
import { decodeTime } from "ulid";

import { translate } from "preact-i18n";

import { mapToRecord } from "../../lib/conversion";

import { history, routeInformation } from "../../context/history";

import State from "../State";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";
import Syncable from "../interfaces/Syncable";

/**
 * Possible notification states.
 * TODO: make "muted" gray out the channel
 * TODO: add server defaults
 */
export type NotificationState = "all" | "mention" | "none" | "muted";

/**
 * Default notification states for various types of channels.
 */
export const DEFAULT_STATES: {
    [key in Channel["channel_type"]]: NotificationState;
} = {
    SavedMessages: "all",
    DirectMessage: "all",
    Group: "all",
    TextChannel: undefined!,
    VoiceChannel: undefined!,
};

/**
 * Default state for servers.
 */
export const DEFAULT_SERVER_STATE: NotificationState = "mention";

export interface Data {
    server?: Record<string, NotificationState>;
    channel?: Record<string, NotificationState>;
}

/**
 * Create a notification either directly or using service worker.
 * @param title Notification Title
 * @param options Notification Options
 * @returns Notification
 */
async function createNotification(
    title: string,
    options: globalThis.NotificationOptions,
) {
    try {
        return new Notification(title, options);
    } catch (err) {
        const sw = await navigator.serviceWorker.getRegistration();
        sw?.showNotification(title, options);
    }
}

/**
 * Manages the user's notification preferences.
 */
export default class NotificationOptions
    implements Store, Persistent<Data>, Syncable
{
    private state: State;
    private activeNotifications: Record<string, Notification>;

    private server: ObservableMap<string, NotificationState>;
    private channel: ObservableMap<string, NotificationState>;

    /**
     * Construct new Experiments store.
     */
    constructor(state: State) {
        this.server = new ObservableMap();
        this.channel = new ObservableMap();

        makeAutoObservable(this, {
            onMessage: false,
            onRelationship: false,
        });

        this.state = state;
        this.activeNotifications = {};

        this.onMessage = this.onMessage.bind(this);
        this.onRelationship = this.onRelationship.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
    }

    get id() {
        return "notifications";
    }

    toJSON() {
        return {
            server: mapToRecord(this.server),
            channel: mapToRecord(this.channel),
        };
    }

    @action hydrate(data: Data) {
        if (data.server) {
            Object.keys(data.server).forEach((key) =>
                this.server.set(key, data.server![key]),
            );
        }

        if (data.channel) {
            Object.keys(data.channel).forEach((key) =>
                this.channel.set(key, data.channel![key]),
            );
        }
    }

    /**
     * Compute the actual notification state for a given Channel.
     * @param channel Channel
     * @returns Notification state
     */
    computeForChannel(channel: Channel) {
        if (this.channel.has(channel._id)) {
            return this.channel.get(channel._id);
        }

        if (channel.server_id) {
            return this.computeForServer(channel.server_id);
        }

        return DEFAULT_STATES[channel.channel_type];
    }

    /**
     * Check whether an incoming message should notify the user.
     * @param message Message
     * @returns Whether it should notify the user
     */
    shouldNotify(message: Message) {
        // Make sure the author is not blocked.
        if (message.author?.relationship === "Blocked") {
            return false;
        }

        // Check if the message was sent by us.
        const user = message.client.user!;
        if (message.author_id === user._id) {
            return false;
        }

        // Check whether we are busy.
        if (user.status?.presence === "Busy") {
            return false;
        }

        // Check channel notification settings
        const mentioned = message.mention_ids?.includes(user._id);
        switch (this.computeForChannel(message.channel!)) {
            case "muted":
            case "none":
                // Ignore if muted.
                return false;
            case "mention":
                // Ignore if it doesn't mention us.
                if (!mentioned) return false;
        }

        // Check if we are in focus mode
        if (user.status?.presence === "Focus" && !mentioned) {
            return false;
        }

        return true;
    }

    /**
     * Compute the notification state for a given server.
     * @param server_id Server ID
     * @returns Notification state
     */
    computeForServer(server_id: string) {
        if (this.server.has(server_id)) {
            return this.server.get(server_id);
        }

        return DEFAULT_SERVER_STATE;
    }

    /**
     * Get the notification state of a channel.
     * @param channel_id Channel ID
     * @returns Notification state
     */
    getChannelState(channel_id: string) {
        return this.channel.get(channel_id);
    }

    /**
     * Set the notification state of a channel.
     * @param channel_id Channel ID
     * @param state Notification state
     */
    setChannelState(channel_id: string, state?: NotificationState) {
        if (state) {
            this.channel.set(channel_id, state);
        } else {
            this.channel.delete(channel_id);
        }
    }

    /**
     * Get the notification state of a server.
     * @param server_id Server ID
     * @returns Notification state
     */
    getServerState(server_id: string) {
        return this.server.get(server_id);
    }

    /**
     * Set the notification state of a server.
     * @param server_id Server ID
     * @param state Notification state
     */
    setServerState(server_id: string, state?: NotificationState) {
        if (state) {
            this.server.set(server_id, state);
        } else {
            this.server.delete(server_id);
        }
    }

    /**
     * Check whether a Channel or Server is muted.
     * @param target Channel or Server
     * @returns Whether this object is muted
     */
    isMuted(target?: Channel | Server) {
        let value: NotificationState | undefined;
        if (target instanceof Channel) {
            value = this.computeForChannel(target);
        } else if (target instanceof Server) {
            value = this.computeForServer(target._id);
        }

        if (value === "muted") {
            return true;
        }

        return false;
    }

    /**
     * Handle incoming messages and create a notification.
     * @param message Message
     */
    async onMessage(message: Message) {
        // Ignore if we are currently looking and focused on the channel.
        if (
            message.channel_id === routeInformation.getChannel() &&
            document.hasFocus()
        )
            return;

        // Ignore if muted.
        if (!this.shouldNotify(message)) return;

        // Play a sound and skip notif if disabled.
        this.state.settings.sounds.playSound("message");
        if (!this.state.settings.get("notifications:desktop")) return;

        const effectiveName =
            message.masquerade?.name ?? message.author?.username;

        let title;
        switch (message.channel?.channel_type) {
            case "SavedMessages":
                return;
            case "DirectMessage":
                title = `@${effectiveName}`;
                break;
            case "Group":
                if (message.author?._id === "00000000000000000000000000") {
                    title = message.channel.name;
                } else {
                    title = `@${effectiveName} - ${message.channel.name}`;
                }
                break;
            case "TextChannel":
                title = `@${effectiveName} (#${message.channel.name}, ${message.channel.server?.name})`;
                break;
            default:
                title = message.channel?._id;
                break;
        }

        let image;
        if (message.attachments) {
            const imageAttachment = message.attachments.find(
                (x) => x.metadata.type === "Image",
            );
            if (imageAttachment) {
                image = message.client.generateFileURL(imageAttachment, {
                    max_side: 720,
                });
            }
        }

        let body, icon;
        if (message.content) {
            body = message.client.markdownToText(message.content);

            if (message.masquerade?.avatar) {
                icon = message.client.proxyFile(message.masquerade.avatar);
            } else {
                icon = message.author?.generateAvatarURL({ max_side: 256 });
            }
        } else if (message.system) {
            const users = message.client.users;

            // ! FIXME: I've had to strip translations while
            // ! I move stuff into the new project structure
            switch (message.system.type) {
                case "user_added":
                case "user_remove":
                    {
                        const user = users.get(message.system.id);
                        body = `${user?.username} ${
                            message.system.type === "user_added"
                                ? "added by"
                                : "removed by"
                        } ${users.get(message.system.by)?.username}`;
                        /*body = translate(
                            `app.main.channel.system.${
                                message.system.type === "user_added"
                                    ? "added_by"
                                    : "removed_by"
                            }`,
                            {
                                user: user?.username,
                                other_user: users.get(message.system.by)
                                    ?.username,
                            },
                        );*/
                        icon = user?.generateAvatarURL({
                            max_side: 256,
                        });
                    }
                    break;
                case "user_joined":
                case "user_left":
                case "user_kicked":
                case "user_banned":
                    {
                        const user = users.get(message.system.id);
                        body = `${user?.username}`;
                        /*body = translate(
                            `app.main.channel.system.${message.system.type}`,
                            { user: user?.username },
                        );*/
                        icon = user?.generateAvatarURL({
                            max_side: 256,
                        });
                    }
                    break;
                case "channel_renamed":
                    {
                        const user = users.get(message.system.by);
                        body = `${user?.username} renamed channel to ${message.system.name}`;
                        /*body = translate(
                            `app.main.channel.system.channel_renamed`,
                            {
                                user: users.get(message.system.by)?.username,
                                name: message.system.name,
                            },
                        );*/
                        icon = user?.generateAvatarURL({
                            max_side: 256,
                        });
                    }
                    break;
                case "channel_description_changed":
                case "channel_icon_changed":
                    {
                        const user = users.get(message.system.by);
                        /*body = translate(
                            `app.main.channel.system.${message.system.type}`,
                            { user: users.get(message.system.by)?.username },
                        );*/
                        body = `${users.get(message.system.by)?.username}`;
                        icon = user?.generateAvatarURL({
                            max_side: 256,
                        });
                    }
                    break;
            }
        }

        const notif = await createNotification(title!, {
            icon,
            image,
            body,
            timestamp: decodeTime(message._id),
            tag: message.channel?._id,
            badge: "/assets/icons/android-chrome-512x512.png",
            silent: true,
        });

        if (notif) {
            notif.addEventListener("click", () => {
                window.focus();

                const id = message.channel_id;
                if (id !== routeInformation.getChannel()) {
                    const channel = message.client.channels.get(id);
                    if (channel) {
                        if (channel.channel_type === "TextChannel") {
                            history.push(
                                `/server/${channel.server_id}/channel/${id}`,
                            );
                        } else {
                            history.push(`/channel/${id}`);
                        }
                    }
                }
            });

            this.activeNotifications[message.channel_id] = notif;

            notif.addEventListener(
                "close",
                () => delete this.activeNotifications[message.channel_id],
            );
        }
    }

    /**
     * Handle user relationship changes.
     * @param user User relationship changed with
     */
    async onRelationship(user: User) {
        // Ignore if disabled.
        if (!this.state.settings.get("notifications:desktop")) return;

        // Check whether we are busy.
        // This is checked by `shouldNotify` in the case of messages.
        if (user.status?.presence === "Busy") {
            return false;
        }

        let event;
        switch (user.relationship) {
            case "Incoming":
                /*event = translate("notifications.sent_request", {
                    person: user.username,
                });*/
                event = `${user.username} sent you a friend request`;
                break;
            case "Friend":
                /*event = translate("notifications.now_friends", {
                    person: user.username,
                });*/
                event = `Now friends with ${user.username}`;
                break;
            default:
                return;
        }

        const notif = await createNotification(event, {
            icon: user.generateAvatarURL({ max_side: 256 }),
            badge: "/assets/icons/android-chrome-512x512.png",
            timestamp: +new Date(),
        });

        notif?.addEventListener("click", () => {
            history.push(`/friends`);
        });
    }

    /**
     * Called when document visibility changes.
     */
    onVisibilityChange() {
        if (document.visibilityState === "visible") {
            const channel_id = routeInformation.getChannel()!;
            if (this.activeNotifications[channel_id]) {
                this.activeNotifications[channel_id].close();
            }
        }
    }

    @action apply(_key: "notifications", data: unknown, _revision: number) {
        this.hydrate(data as Data);
    }

    @computed toSyncable() {
        return {
            notifications: this.toJSON(),
        };
    }
}
