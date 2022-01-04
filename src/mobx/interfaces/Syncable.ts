import Store from "./Store";

/**
 * A data store which syncs data to Revolt.
 */
export default interface Syncable extends Store {
    apply(key: string, data: unknown, revision: number): void;
    toSyncable(): { [key: string]: object };
}
