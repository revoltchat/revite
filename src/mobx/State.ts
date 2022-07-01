// @ts-expect-error No typings.
import stringify from "json-stringify-deterministic";
import localforage from "localforage";
import { action, makeAutoObservable, reaction, runInAction } from "mobx";
import { Client, ClientboundNotification } from "revolt.js";

import { reportError } from "../lib/ErrorBoundary";
import { injectWindow } from "../lib/window";

import { clientController } from "../controllers/client/ClientController";
import Persistent from "./interfaces/Persistent";
import Syncable from "./interfaces/Syncable";
import Auth from "./stores/Auth";
import Changelog from "./stores/Changelog";
import Draft from "./stores/Draft";
import Experiments from "./stores/Experiments";
import Layout from "./stores/Layout";
import LocaleOptions from "./stores/LocaleOptions";
import MessageQueue from "./stores/MessageQueue";
import NotificationOptions from "./stores/NotificationOptions";
import Ordering from "./stores/Ordering";
import Plugins from "./stores/Plugins";
import ServerConfig from "./stores/ServerConfig";
import Settings from "./stores/Settings";
import Sync, { Data as DataSync, SyncKeys } from "./stores/Sync";

export const MIGRATIONS = {
    REDUX: 1640305719826,
    MULTI_SERVER_CONFIG: 1656350006152,
};

/**
 * Handles global application state.
 */
export default class State {
    auth: Auth;
    changelog: Changelog;
    draft: Draft;
    locale: LocaleOptions;
    experiments: Experiments;
    layout: Layout;
    /**
     * DEPRECATED
     */
    private config: ServerConfig;
    notifications: NotificationOptions;
    queue: MessageQueue;
    settings: Settings;
    sync: Sync;
    plugins: Plugins;
    ordering: Ordering;

    private persistent: [string, Persistent<unknown>][] = [];
    private disabled: Set<string> = new Set();

    /**
     * Construct new State.
     */
    constructor() {
        this.auth = new Auth();
        this.changelog = new Changelog();
        this.draft = new Draft();
        this.locale = new LocaleOptions();
        this.experiments = new Experiments();
        this.layout = new Layout();
        this.config = new ServerConfig();
        this.notifications = new NotificationOptions(this);
        this.queue = new MessageQueue();
        this.settings = new Settings();
        this.sync = new Sync(this);
        this.plugins = new Plugins(this);
        this.ordering = new Ordering(this);

        makeAutoObservable(this);

        this.register();
        this.setDisabled = this.setDisabled.bind(this);
        this.onPacket = this.onPacket.bind(this);

        // Inject into window
        injectWindow("state", this);
    }

    /**
     * Categorise and register stores referenced on this object.
     */
    private register() {
        for (const key of Object.keys(this)) {
            // Skip `client`.
            if (key === "client") continue;

            // Pull out the relevant object.
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
     * Temporarily ignore updates to a key.
     * @param key Key to ignore
     */
    setDisabled(key: string) {
        this.disabled.add(key);
    }

    /**
     * Save to disk.
     */
    async save() {
        for (const [id, store] of this.persistent) {
            await localforage.setItem(
                id,
                JSON.parse(stringify(store.toJSON())),
            );
        }
    }

    /**
     * Consume packets from the client.
     * @param packet Inbound Packet
     */
    @action onPacket(packet: ClientboundNotification) {
        if (packet.type === "UserSettingsUpdate") {
            try {
                this.sync.apply(packet.update);
            } catch (err) {
                reportError(err as any, "failed_sync_apply");
            }
        }
    }

    /**
     * Register reaction listeners for persistent data stores.
     * @returns Function to dispose of listeners
     */
    registerListeners(client?: Client) {
        // If a client is present currently, expose it and provide it to plugins.
        if (client) {
            // Register message listener for clearing queue.
            client.addListener("message", this.queue.onMessage);

            // Register listener for incoming packets.
            client.addListener("packet", this.onPacket);

            // Register events for notifications.
            client.addListener("message", this.notifications.onMessage);
            client.addListener(
                "user/relationship",
                this.notifications.onRelationship,
            );
            document.addEventListener(
                "visibilitychange",
                this.notifications.onVisibilityChange,
            );

            // Sync settings from remote server.
            state.sync
                .pull(client)
                .catch(console.error)
                .finally(() => state.changelog.checkForUpdates());
        }

        // Register all the listeners required for saving and syncing state.
        const listeners = this.persistent.map(([id, store]) => {
            return reaction(
                () => stringify(store.toJSON()),
                async (value) => {
                    try {
                        // Save updated store to local storage.
                        await localforage.setItem(id, JSON.parse(value));

                        // Skip if meta store or client not available.
                        if (id === "sync") return;
                        if (!client) return;

                        // Generate a new revision and upload changes.
                        const revision = +new Date();
                        switch (id) {
                            case "settings": {
                                const { appearance, theme } =
                                    this.settings.toSyncable();

                                const obj: Record<string, unknown> = {};
                                if (this.sync.isEnabled("appearance")) {
                                    if (this.disabled.has("appearance")) {
                                        this.disabled.delete("appearance");
                                    } else {
                                        obj["appearance"] = appearance;
                                        this.sync.setRevision(
                                            "appearance",
                                            revision,
                                        );
                                    }
                                }

                                if (this.sync.isEnabled("theme")) {
                                    if (this.disabled.has("theme")) {
                                        this.disabled.delete("theme");
                                    } else {
                                        obj["theme"] = theme;
                                        this.sync.setRevision(
                                            "theme",
                                            revision,
                                        );
                                    }
                                }

                                if (Object.keys(obj).length > 0) {
                                    if (client.websocket.connected) {
                                        client.syncSetSettings(
                                            obj as any,
                                            revision,
                                        );
                                    }
                                }
                                break;
                            }
                            default: {
                                if (this.sync.isEnabled(id as SyncKeys)) {
                                    if (this.disabled.has(id)) {
                                        this.disabled.delete(id);
                                    }

                                    this.sync.setRevision(id, revision);
                                    if (client.websocket.connected) {
                                        client.syncSetSettings(
                                            (
                                                store as unknown as Syncable
                                            ).toSyncable(),
                                            revision,
                                        );
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Failed to serialise!");
                        console.error(err);
                        console.error(value);
                    }
                },
            );
        });

        return () => {
            // Remove any listeners attached to client.
            if (client) {
                client.removeListener("message", this.queue.onMessage);
                client.removeListener("packet", this.onPacket);
                client.removeListener("message", this.notifications.onMessage);
                client.removeListener(
                    "user/relationship",
                    this.notifications.onRelationship,
                );
                document.removeEventListener(
                    "visibilitychange",
                    this.notifications.onVisibilityChange,
                );
            }

            // Wipe all listeners.
            listeners.forEach((x) => x());
        };
    }

    /**
     * Load data stores from local storage.
     */
    async hydrate() {
        // Load MobX store.
        const sync = (await localforage.getItem("sync")) as DataSync;
        const { revision } = sync ?? { revision: {} };
        for (const [id, store] of this.persistent) {
            if (id === "sync") continue;
            const data = await localforage.getItem(id);
            if (typeof data === "object" && data !== null) {
                store.hydrate(data, revision[id] ?? +new Date());
            }
        }

        // Dump stores back to disk.
        await this.save();

        // Post-hydration, init plugins.
        this.plugins.init();

        // Push authentication information forwards to client controller.
        clientController.hydrate(this.auth);
    }

    /**
     * Reset known state values.
     */
    reset() {
        runInAction(() => {
            this.draft = new Draft();
            this.experiments = new Experiments();
            this.layout = new Layout();
            this.notifications = new NotificationOptions(this);
            this.queue = new MessageQueue();
            this.settings = new Settings();
            this.sync = new Sync(this);
            this.ordering = new Ordering(this);

            this.save();

            this.persistent = [];
            this.register();
        });
    }
}

export const state = new State();

/**
 * Get the application state
 * @returns Application state
 */
export function useApplicationState() {
    return state;
}

/**
 * Get the application state
 * @returns Application state
 */
export function getApplicationState() {
    return state;
}
