import Store from "./Store";

/**
 * A data store which is migrated forwards.
 */
export default interface Migrate<K extends string> extends Store {
    /**
     * Migrate this data store.
     */
    migrate(key: K, data: Record<string, unknown>, rev: number): void;
}
