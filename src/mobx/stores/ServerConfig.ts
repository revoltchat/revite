import { action, computed, makeAutoObservable } from "mobx";
import { API, Client, Nullable } from "revolt.js";

import { isDebug } from "../../revision";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

/**
 * Stores server configuration data.
 */
export default class ServerConfig
    implements Store, Persistent<API.RevoltConfig>
{
    private config: Nullable<API.RevoltConfig>;

    /**
     * Construct new ServerConfig store.
     */
    constructor() {
        this.config = null;
        makeAutoObservable(this);
        this.set = this.set.bind(this);
    }

    get id() {
        return "server_conf";
    }

    toJSON() {
        return JSON.parse(JSON.stringify(this.config));
    }

    @action hydrate(data: API.RevoltConfig) {
        this.config = data ?? null;
    }

    /**
     * Create a new Revolt client.
     * @returns Revolt client
     */
    createClient() {
        const client = new Client({
            unreads: true,
            autoReconnect: true,
            apiURL: import.meta.env.VITE_API_URL,
            debug: isDebug(),
            onPongTimeout: "RECONNECT",
        });

        if (this.config !== null) {
            client.configuration = this.config;
        }

        return client;
    }

    /**
     * Get server configuration.
     * @returns Server configuration
     */
    @computed get() {
        return this.config;
    }

    /**
     * Set server configuration.
     * @param config Server configuration
     */
    @action set(config: API.RevoltConfig) {
        this.config = config;
    }
}
