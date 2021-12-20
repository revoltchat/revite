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

interface Data {
    disabled: SyncKeys[];
}

/**
 * Handles syncing settings data.
 */
export default class Sync implements Store, Persistent<Data> {
    private disabled: ObservableSet<SyncKeys>;

    /**
     * Construct new Sync store.
     */
    constructor() {
        this.disabled = new ObservableSet();
        makeAutoObservable(this);
        this.isEnabled = this.isEnabled.bind(this);
    }

    get id() {
        return "sync";
    }

    toJSON() {
        return {
            enabled: [...this.disabled],
        };
    }

    @action hydrate(data: Data) {
        if (data.disabled) {
            for (const key of data.disabled) {
                this.disabled.add(key as SyncKeys);
            }
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
