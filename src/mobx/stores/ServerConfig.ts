import { action, computed, makeAutoObservable } from "mobx";
import { RevoltConfiguration } from "revolt-api/types/Core";
import { Client } from "revolt.js";
import { Nullable } from "revolt.js/dist/util/null";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

/**
 * Stores server configuration data.
 */
export default class ServerConfig
    implements Store, Persistent<RevoltConfiguration>
{
    private config: Nullable<RevoltConfiguration>;

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

    @action hydrate(data: RevoltConfiguration) {
        this.config = data;
    }

    /**
     * Create a new Revolt client.
     * @returns Revolt client
     */
    createClient() {
        const client = new Client({
            unreads: true,
            autoReconnect: false,
            apiURL: import.meta.env.VITE_API_URL,
            debug: import.meta.env.DEV,
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
    @action set(config: RevoltConfiguration) {
        this.config = config;
    }
}
