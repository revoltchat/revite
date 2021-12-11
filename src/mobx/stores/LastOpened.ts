import { action, computed, makeAutoObservable, ObservableMap } from "mobx";

import Persistent from "../Persistent";

interface Data {
    server?: Record<string, string>;
}

/**
 * Keeps track of the last open channels, tabs, etc.
 * Handles providing good UX experience on navigating
 * back and forth between different parts of the app.
 */
export default class Experiments implements Persistent<Data> {
    private server: ObservableMap<string, string>;

    /**
     * Construct new Experiments store.
     */
    constructor() {
        this.server = new ObservableMap();
        makeAutoObservable(this);
    }

    toJSON() {
        return {
            server: this.server,
        };
    }

    @action hydrate(data: Data) {
        if (data.server) {
            Object.keys(data.server).forEach((key) =>
                this.server.set(key, data.server![key]),
            );
        }
    }

    /**
     * Get last opened channel in a server.
     * @param server Server ID
     */
    @computed get(server: string) {
        return this.server.get(server);
    }

    /**
     * Set last opened channel in a server.
     * @param server Server ID
     * @param channel Channel ID
     */
    @action enable(server: string, channel: string) {
        this.server.set(server, channel);
    }
}
