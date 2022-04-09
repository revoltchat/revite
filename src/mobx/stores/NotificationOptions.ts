import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Message } from "revolt.js/dist/maps/Messages";
import { Server } from "revolt.js/dist/maps/Servers";

import { mapToRecord } from "../../lib/conversion";

import {
    legacyMigrateNotification,
    LegacyNotifications,
} from "../legacy/redux";

import { MIGRATIONS } from "../State";
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
 * Manages the user's notification preferences.
 */
export default class NotificationOptions
    implements Store, Persistent<Data>, Syncable
{
    private server: ObservableMap<string, NotificationState>;
    private channel: ObservableMap<string, NotificationState>;

    /**
     * Construct new Experiments store.
     */
    constructor() {
        this.server = new ObservableMap();
        this.channel = new ObservableMap();
        makeAutoObservable(this);
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

        switch (this.computeForChannel(message.channel!)) {
            case "muted":
            case "none":
                // Ignore if muted.
                return false;
            case "mention":
                // Ignore if it doesn't mention us.
                if (!message.mention_ids?.includes(user._id)) return false;
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
        var value: NotificationState | undefined;
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

    @action apply(_key: "notifications", data: unknown, revision: number) {
        if (revision < MIGRATIONS.REDUX) {
            data = legacyMigrateNotification(data as LegacyNotifications);
        }

        this.hydrate(data as Data);
    }

    @computed toSyncable() {
        return {
            notifications: this.toJSON(),
        };
    }
}
