import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { Channel } from "revolt-api/types/Channels";

import Persistent from "../interfaces/Persistent";

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
export default class NotificationOptions implements Persistent<Data> {
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

    toJSON() {
        return {
            server: this.server,
            channel: this.channel,
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
