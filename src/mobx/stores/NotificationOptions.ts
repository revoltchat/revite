import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { Channel } from "revolt-api/types/Channels";

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
    TextChannel: "mention",
    VoiceChannel: "mention",
};

interface Data {
    server?: Record<string, string>;
    channel?: Record<string, string>;
}

/**
 * Manages the user's notification preferences.
 */
export default class NotificationOptions implements Store, Persistent<Data> {
    private server: ObservableMap<string, string>;
    private channel: ObservableMap<string, string>;

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

    // TODO: implement
}
