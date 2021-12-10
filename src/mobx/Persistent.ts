/**
 * A data store which is persistent and should cache its data locally.
 */
export default interface Persistent<T> {
    /**
     * Override toJSON to serialise this data store.
     * This will also force all subclasses to implement this method.
     */
    toJSON(): unknown;

    /**
     * Hydrate this data store using given data.
     * @param data Given data
     */
    hydrate(data: T): void;
}
