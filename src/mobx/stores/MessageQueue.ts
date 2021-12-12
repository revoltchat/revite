import {
    action,
    computed,
    IObservableArray,
    makeAutoObservable,
    observable,
} from "mobx";

import Store from "../interfaces/Store";

export enum QueueStatus {
    SENDING = "sending",
    ERRORED = "errored",
}

export interface Reply {
    id: string;
    mention: boolean;
}

export type QueuedMessageData = {
    _id: string;
    author: string;
    channel: string;

    content: string;
    replies: Reply[];
};

export interface QueuedMessage {
    id: string;
    channel: string;
    data: QueuedMessageData;
    status: QueueStatus;
    error?: string;
}

/**
 * Handles waiting for messages to send and send failure.
 */
export default class MessageQueue implements Store {
    private messages: IObservableArray<QueuedMessage>;

    /**
     * Construct new MessageQueue store.
     */
    constructor() {
        this.messages = observable.array([]);
        makeAutoObservable(this);
    }

    get id() {
        return "queue";
    }

    @action add(id: string, channel: string, data: QueuedMessageData) {
        this.messages.push({
            id,
            channel,
            data,
            status: QueueStatus.SENDING,
        });
    }

    @action fail(id: string, error: string) {
        const entry = this.messages.find((x) => x.id === id)!;
        entry.status = QueueStatus.ERRORED;
        entry.error = error;
    }

    @action start(id: string) {
        const entry = this.messages.find((x) => x.id === id)!;
        entry.status = QueueStatus.SENDING;
    }

    @action remove(id: string) {
        const entry = this.messages.find((x) => x.id === id)!;
        this.messages.remove(entry);
    }

    @computed get(channel: string) {
        return this.messages.filter((x) => x.channel === channel);
    }
}
