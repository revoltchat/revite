import {
    action,
    computed,
    makeAutoObservable,
    ObservableMap,
    ObservableSet,
    runInAction,
} from "mobx";
import { Client } from "revolt.js";

import { mapToRecord } from "../../lib/conversion";

import State from "../State";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

export type SyncKeys =
    | "theme"
    | "appearance"
    | "locale"
    | "notifications"
    | "ordering"
    | "changelog";

export const SYNC_KEYS: SyncKeys[] = [
    "theme",
    "appearance",
    "locale",
    "notifications",
    "ordering",
    "changelog",
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
    private state: State;
    private disabled: ObservableSet<SyncKeys>;
    private revision: ObservableMap<string, number>;

    /**
     * Construct new Sync store.
     */
    constructor(state: State) {
        this.state = state;
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
            disabled: [...this.disabled],
            revision: mapToRecord(this.revision),
        };
    }

    @action hydrate(data: Data) {
        if (data.disabled) {
            for (const key of data.disabled) {
                this.disabled.add(key as SyncKeys);
            }
        }

        if (data.revision) {
            for (const key of Object.keys(data.revision)) {
                this.setRevision(key, data.revision[key]);
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
        return !this.disabled.has(key) && SYNC_KEYS.includes(key);
    }

    @action setRevision(key: string, revision: number) {
        if (revision < (this.getRevision(key) ?? 0)) return;
        this.revision.set(key, revision);
    }

    @computed getRevision(key: string) {
        return this.revision.get(key);
    }

    @action apply(data: Record<string, [number, string]>) {
        const tryRead = (key: string) => {
            if (key in data) {
                const revision = data[key][0];
                if (revision <= (this.getRevision(key) ?? 0)) {
                    return;
                }

                let parsed;
                try {
                    parsed = JSON.parse(data[key][1]);
                } catch (err) {
                    parsed = data[key][1];
                }

                return [revision, parsed];
            }
        };

        runInAction(() => {
            const appearance = tryRead("appearance");
            if (appearance) {
                this.state.setDisabled("appearance");
                this.state.settings.apply(
                    "appearance",
                    appearance[1],
                    appearance[0],
                );
                this.setRevision("appearance", appearance[0]);
            }

            const theme = tryRead("theme");
            if (theme) {
                this.state.setDisabled("theme");
                this.state.settings.apply("theme", theme[1], theme[0]);
                this.setRevision("theme", theme[0]);
            }

            const notifications = tryRead("notifications");
            if (notifications) {
                this.state.setDisabled("notifications");
                this.state.notifications.apply(
                    "notifications",
                    notifications[1],
                    notifications[0],
                );
                this.setRevision("notifications", notifications[0]);
            }

            const ordering = tryRead("ordering");
            if (ordering) {
                this.state.setDisabled("ordering");
                this.state.ordering.apply("ordering", ordering[1], ordering[0]);
                this.setRevision("ordering", ordering[0]);
            }
        });
    }

    async pull(client: Client) {
        const data = await client.syncFetchSettings(
            SYNC_KEYS.filter(this.isEnabled),
        );

        this.apply(data);
    }
}
