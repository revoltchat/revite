import { action, computed, makeAutoObservable } from "mobx";

import { reorder } from "@revoltchat/ui";

import State from "../State";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";
import Syncable from "../interfaces/Syncable";

export interface Data {
    servers?: string[];
}

/**
 * Keeps track of ordering of various elements
 */
export default class Ordering implements Store, Persistent<Data>, Syncable {
    private state: State;

    /**
     * Ordered list of server IDs
     */
    private servers: string[];

    /**
     * Construct new Layout store.
     */
    constructor(state: State) {
        this.servers = [];
        makeAutoObservable(this);

        this.state = state;
        this.reorderServer = this.reorderServer.bind(this);
    }

    get id() {
        return "ordering";
    }

    toJSON() {
        return {
            servers: this.servers,
        };
    }

    @action hydrate(data: Data) {
        if (data.servers) {
            this.servers = data.servers;
        }
    }

    apply(_key: string, data: unknown, _revision: number): void {
        this.hydrate(data as Data);
    }

    toSyncable(): { [key: string]: object } {
        return {
            ordering: this.toJSON(),
        };
    }

    /**
     * All known servers with ordering applied
     */
    @computed get orderedServers() {
        const known = new Set(this.state.client?.servers.keys() ?? []);
        const ordered = [...this.servers];

        const out = [];
        for (const id of ordered) {
            if (known.delete(id)) {
                out.push(this.state.client!.servers.get(id)!);
            }
        }

        console.info("out1", out);

        for (const id of known) {
            out.push(this.state.client!.servers.get(id)!);
        }

        console.info("out2", out);

        return out;
    }

    /**
     * Re-order a server
     */
    @action reorderServer(source: number, dest: number) {
        this.servers = reorder(
            this.orderedServers.map((x) => x._id),
            source,
            dest,
        );
    }
}
