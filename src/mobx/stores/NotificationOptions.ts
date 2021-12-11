import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Message } from "revolt.js/dist/maps/Messages";
import { Server } from "revolt.js/dist/maps/Servers";

import { mapToRecord } from "../../lib/conversion";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

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

interface Data {
    server?: Record<string, NotificationState>;
    channel?: Record<string, NotificationState>;
}

/**
 * Manages the user's notification preferences.
 */
export default class NotificationOptions implements Store, Persistent<Data> {
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

    computeForChannel(channel: Channel) {
        if (this.channel.has(channel._id)) {
            return this.channel.get(channel._id);
        }

        if (channel.server_id) {
            return this.computeForServer(channel.server_id);
        }

        return DEFAULT_STATES[channel.channel_type];
    }

    shouldNotify(message: Message) {
        const state = this.computeForChannel(message.channel!);

        switch (state) {
            case "muted":
            case "none":
                return false;
            case "mention":
                if (!message.mention_ids?.includes(message.client.user!._id))
                    return false;
        }

        return true;
    }

    computeForServer(server_id: string) {
        if (this.server.has(server_id)) {
            return this.server.get(server_id);
        }

        return DEFAULT_SERVER_STATE;
    }

    getChannelState(channel_id: string) {
        return this.channel.get(channel_id);
    }

    setChannelState(channel_id: string, state?: NotificationState) {
        if (state) {
            this.channel.set(channel_id, state);
        } else {
            this.channel.delete(channel_id);
        }
    }

    getServerState(server_id: string) {
        return this.server.get(server_id);
    }

    setServerState(server_id: string, state?: NotificationState) {
        if (state) {
            this.server.set(server_id, state);
        } else {
            this.server.delete(server_id);
        }
    }

    isMuted(target?: Channel | Server) {
        if (target instanceof Channel) {
            return this.computeForChannel(target) === "muted";
        } else if (target instanceof Server) {
            return this.computeForServer(target._id) === "muted";
        } else {
            return false;
        }
    }
}
