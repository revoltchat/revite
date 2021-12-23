import {
    action,
    computed,
    makeAutoObservable,
    ObservableMap,
    ObservableSet,
} from "mobx";
import { Client } from "revolt.js";

import { mapToRecord } from "../../lib/conversion";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

export type SyncKeys = "theme" | "appearance" | "locale" | "notifications";

export const SYNC_KEYS: SyncKeys[] = [
    "theme",
    "appearance",
    "locale",
    "notifications",
];

export interface Data {
    disabled: SyncKeys[];
    revision: {
        [key: string]: number;
    };
}

/**
 * Handles syncing settings data.
 */
export default class Sync implements Store, Persistent<Data> {
    private disabled: ObservableSet<SyncKeys>;
    private revision: ObservableMap<SyncKeys, number>;

    /**
     * Construct new Sync store.
     */
    constructor() {
        this.disabled = new ObservableSet();
        this.revision = new ObservableMap();
        makeAutoObservable(this);
        this.isEnabled = this.isEnabled.bind(this);
    }

    get id() {
        return "sync";
    }

    toJSON() {
        return {
            enabled: [...this.disabled],
            revision: mapToRecord(this.revision),
        };
    }

    @action hydrate(data: Data) {
        if (data.disabled) {
            for (const key of data.disabled) {
                this.disabled.add(key as SyncKeys);
            }
        }
    }

    @action enable(key: SyncKeys) {
        this.disabled.delete(key);
    }

    @action disable(key: SyncKeys) {
        this.disabled.add(key);
    }

    @action toggle(key: SyncKeys) {
        if (this.isEnabled(key)) {
            this.disable(key);
        } else {
            this.enable(key);
        }
    }

    @computed isEnabled(key: SyncKeys) {
        return !this.disabled.has(key);
    }

    async pull(client: Client) {
        const data = await client.syncFetchSettings(
            SYNC_KEYS.filter(this.isEnabled),
        );
    }
}
