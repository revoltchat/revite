import { action, computed, makeAutoObservable, ObservableMap } from "mobx";

import { mapToRecord } from "../../lib/conversion";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

export interface DraftObject {
    content?: string;
    masquerade?: {
        avatar: string;
        name: string;
    };
}
export interface Data {
    drafts: Record<string, DraftObject>;
}

/**
 * Handles storing draft (currently being written) messages.
 */
export default class Draft implements Store, Persistent<Data> {
    private drafts: ObservableMap<string, DraftObject>;

    /**
     * Construct new Draft store.
     */
    constructor() {
        this.drafts = new ObservableMap();
        makeAutoObservable(this);
    }

    get id() {
        return "draft";
    }

    toJSON() {
        return {
            drafts: mapToRecord(this.drafts),
        };
    }

    @action hydrate(data: Data) {
        Object.keys(data.drafts).forEach((key) =>
            this.drafts.set(key, data.drafts[key]),
        );
    }

    /**
     * Get draft for a channel.
     * @param channel Channel ID
     */
    @computed get(channel: string) {
        return this.drafts.get(channel);
    }

    /**
     * Check whether a channel has a draft.
     * @param channel Channel ID
     */
    @computed has(channel: string) {
        if (!this.drafts.has(channel)) return false;
        // fetch the draft object
        const potentialDraft = this.drafts.get(channel)?.content;
        // if it doesn't have any content return false
        if (!potentialDraft) return false;
        return potentialDraft.length > 0;
    }

    /**
     * Set draft for a channel.
     * @param channel Channel ID
     * @param content Draft content
     */
    @action set(channel: string, content?: DraftObject) {
        if (typeof content === "undefined") {
            return this.clear(channel);
        }

        this.drafts.set(channel, content);
    }

    /**
     * Clear draft from a channel.
     * @param channel Channel ID
     */
    @action clear(channel: string) {
        this.drafts.delete(channel);
    }

    /**
     * Reset and clear all drafts.
     */
    @action reset() {
        this.drafts.clear();
    }
}
