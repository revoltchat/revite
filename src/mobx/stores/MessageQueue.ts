import {
    action,
    computed,
    IObservableArray,
    makeAutoObservable,
    observable,
} from "mobx";
import { Message } from "revolt.js";

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

        this.onMessage = this.onMessage.bind(this);
    }

    get id() {
        return "queue";
    }

    /**
     * Add a message to the queue.
     * @param id Nonce value
     * @param channel Channel ID
     * @param data Message data
     */
    @action add(id: string, channel: string, data: QueuedMessageData) {
        this.messages.push({
            id,
            channel,
            data,
            status: QueueStatus.SENDING,
        });
    }

    /**
     * Fail a queued message.
     * @param id Nonce value
     * @param error Error string
     */
    @action fail(id: string, error: string) {
        const entry = this.messages.find((x) => x.id === id)!;
        entry.status = QueueStatus.ERRORED;
        entry.error = error;
    }

    /**
     * Mark a queued message as sending.
     * @param id Nonce value
     */
    @action start(id: string) {
        const entry = this.messages.find((x) => x.id === id)!;
        entry.status = QueueStatus.SENDING;
    }

    /**
     * Remove a queued message.
     * @param id Nonce value
     */
    @action remove(id: string) {
        const entry = this.messages.find((x) => x.id === id)!;
        this.messages.remove(entry);
    }

    /**
     * Get all queued messages for a channel.
     * @param channel Channel ID
     * @returns Array of queued messages
     */
    @computed get(channel: string) {
        return this.messages.filter((x) => x.channel === channel);
    }

    /**
     * Handle an incoming Message
     * @param message Message
     */
    @action onMessage(message: Message) {
        if (!message.nonce) return;
        if (!this.get(message.channel_id).find((x) => x.id === message.nonce))
            return;

        this.remove(message.nonce);
    }
}
