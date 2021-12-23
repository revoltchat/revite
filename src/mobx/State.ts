import localforage from "localforage";
import { autorun, makeAutoObservable, reaction } from "mobx";

import { createContext } from "preact";
import { useContext } from "preact/hooks";

import Persistent from "./interfaces/Persistent";
import Auth from "./stores/Auth";
import Draft from "./stores/Draft";
import Experiments from "./stores/Experiments";
import Layout from "./stores/Layout";
import LocaleOptions from "./stores/LocaleOptions";
import MessageQueue from "./stores/MessageQueue";
import NotificationOptions from "./stores/NotificationOptions";
import ServerConfig from "./stores/ServerConfig";
import Settings from "./stores/Settings";
import Sync from "./stores/Sync";

/**
 * Handles global application state.
 */
export default class State {
    auth: Auth;
    draft: Draft;
    locale: LocaleOptions;
    experiments: Experiments;
    layout: Layout;
    config: ServerConfig;
    notifications: NotificationOptions;
    queue: MessageQueue;
    settings: Settings;
    sync: Sync;

    private persistent: [string, Persistent<unknown>][] = [];

    /**
     * Construct new State.
     */
    constructor() {
        this.auth = new Auth();
        this.draft = new Draft();
        this.locale = new LocaleOptions();
        this.experiments = new Experiments();
        this.layout = new Layout();
        this.config = new ServerConfig();
        this.notifications = new NotificationOptions();
        this.queue = new MessageQueue();
        this.settings = new Settings();
        this.sync = new Sync();

        makeAutoObservable(this);
        this.registerListeners = this.registerListeners.bind(this);
        this.register();
    }

    /**
     * Categorise and register stores referenced on this object.
     */
    private register() {
        for (const key of Object.keys(this)) {
            const obj = (
                this as unknown as Record<string, Record<string, unknown>>
            )[key];

            // Check if this is an object.
            if (typeof obj === "object") {
                // Check if this is a Store.
                if (typeof obj.id === "string") {
                    const id = obj.id;

                    // Check if this is a Persistent<T>
                    if (
                        typeof obj.hydrate === "function" &&
                        typeof obj.toJSON === "function"
                    ) {
                        this.persistent.push([
                            id,
                            obj as unknown as Persistent<unknown>,
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Register reaction listeners for persistent data stores.
     * @returns Function to dispose of listeners
     */
    registerListeners() {
        const listeners = this.persistent.map(([id, store]) => {
            return reaction(
                () => store.toJSON(),
                async (value) => {
                    try {
                        await localforage.setItem(id, value);
                    } catch (err) {
                        console.error("Failed to serialise!");
                        console.error(err);
                        console.error(value);
                    }
                },
            );
        });

        return () => listeners.forEach((x) => x());
    }

    /**
     * Load data stores from local storage.
     */
    async hydrate() {
        for (const [id, store] of this.persistent) {
            const data = await localforage.getItem(id);
            if (typeof data === "object" && data !== null) {
                store.hydrate(data);
            }
        }
    }
}

var state: State;

/**
 * Get the application state
 * @returns Application state
 */
export function useApplicationState() {
    if (!state) state = new State();
    return state;
}

/**
 * 
 * Redux hydration:
 * localForage.getItem("state").then((s) => {
            if (s !== null) {
                dispatch({ type: "__INIT", state: s as State });
            }

            state.hydrate().then(() => setLoaded(true));
        });
 */
