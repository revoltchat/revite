/* eslint-disable react-hooks/rules-of-hooks */
import { action, makeAutoObservable } from "mobx";
import { Channel, Message, Nullable } from "revolt.js";

import { SimpleRenderer } from "./simple/SimpleRenderer";
import { RendererRoutines, ScrollState } from "./types";

export const SMOOTH_SCROLL_ON_RECEIVE = false;

export class ChannelRenderer {
    channel: Channel;

    state: "LOADING" | "WAITING_FOR_NETWORK" | "EMPTY" | "RENDER" = "LOADING";
    scrollState: ScrollState = { type: "ScrollToBottom" };
    atTop: Nullable<boolean> = null;
    atBottom: Nullable<boolean> = null;
    messages: Message[] = [];

    currentRenderer: RendererRoutines = SimpleRenderer;

    stale = false;
    fetching = false;
    scrollPosition = 0;
    scrollAnchored = false;

    constructor(channel: Channel) {
        this.channel = channel;

        makeAutoObservable(this, {
            channel: false,
            currentRenderer: false,
            scrollPosition: false,
            scrollAnchored: false,
        });

        this.receive = this.receive.bind(this);
        this.updated = this.updated.bind(this);
        this.delete = this.delete.bind(this);

        const client = this.channel.client;
        client.addListener("message", this.receive);
        client.addListener("message/updated", this.updated);
        client.addListener("message/delete", this.delete);
    }

    destroy() {
        const client = this.channel.client;
        client.removeListener("message", this.receive);
        client.removeListener("message/updated", this.updated);
        client.removeListener("message/delete", this.delete);
    }

    private receive(message: Message) {
        this.currentRenderer.receive(this, message);
    }

    private updated(id: string, message: Message) {
        this.currentRenderer.updated(this, id, message);
    }

    private delete(id: string) {
        this.currentRenderer.delete(this, id);
    }

    @action async init(message_id?: string) {
        if (message_id) {
            if (this.state === "RENDER") {
                const message = this.messages.find((x) => x._id === message_id);

                if (message) {
                    this.emitScroll({
                        type: "ScrollToView",
                        id: message_id,
                    });

                    return;
                }
            }
        }

        this.stale = false;
        this.state = "LOADING";
        this.currentRenderer.init(this, message_id);
    }

    @action emitScroll(state: ScrollState) {
        this.scrollState = state;
    }

    @action markStale() {
        this.stale = true;
    }

    @action complete() {
        this.fetching = false;
    }

    async reloadStale() {
        if (this.stale) {
            this.stale = false;
            await this.init();
        }
    }

    async loadTop(ref?: HTMLDivElement) {
        if (this.fetching) return;
        this.fetching = true;

        function generateScroll(end: string): ScrollState {
            if (ref) {
                let heightRemoved = 0,
                    removing = false;
                const messageContainer = ref.children[0];
                if (messageContainer) {
                    for (const child of Array.from(messageContainer.children)) {
                        // If this child has a ulid, check whether it was removed.
                        if (
                            removing ||
                            (child.id?.length === 26 &&
                                child.id.localeCompare(end) === 1)
                        ) {
                            removing = true;
                            heightRemoved +=
                                child.clientHeight +
                                // We also need to take into account the top margin of the container.
                                parseInt(
                                    window
                                        .getComputedStyle(child)
                                        .marginTop.slice(0, -2),
                                    10,
                                );
                        }
                    }
                }

                return {
                    type: "OffsetTop",
                    previousHeight: ref.scrollHeight - heightRemoved,
                };
            }
            return {
                type: "OffsetTop",
                previousHeight: 0,
            };
        }

        if (await this.currentRenderer.loadTop(this, generateScroll)) {
            this.fetching = false;
        }
    }

    async loadBottom(ref?: HTMLDivElement) {
        if (this.fetching) return;
        this.fetching = true;

        function generateScroll(start: string): ScrollState {
            if (ref) {
                let heightRemoved = 0,
                    removing = true;
                const messageContainer = ref.children[0];
                if (messageContainer) {
                    for (const child of Array.from(messageContainer.children)) {
                        // If this child has a ulid check whether it was removed.
                        if (
                            removing /* ||
                            (child.id?.length === 26 &&
                                child.id.localeCompare(start) === -1)*/
                        ) {
                            heightRemoved +=
                                child.clientHeight +
                                // We also need to take into account the top margin of the container.
                                parseInt(
                                    window
                                        .getComputedStyle(child)
                                        .marginTop.slice(0, -2),
                                    10,
                                );
                        }

                        if (
                            child.id?.length === 26 &&
                            child.id.localeCompare(start) !== -1
                        )
                            removing = false;
                    }
                }

                return {
                    type: "ScrollTop",
                    y: ref.scrollTop - heightRemoved,
                };
            }
            return {
                type: "ScrollToBottom",
            };
        }

        if (await this.currentRenderer.loadBottom(this, generateScroll)) {
            this.fetching = false;
        }
    }

    async jumpToBottom(smooth: boolean) {
        if (this.state === "RENDER" && this.atBottom) {
            this.emitScroll({ type: "ScrollToBottom", smooth });
        } else {
            await this.currentRenderer.init(this, undefined, true);
        }
    }
}

const renderers: Record<string, ChannelRenderer> = {};

export function getRenderer(channel: Channel) {
    let renderer = renderers[channel._id];
    if (!renderer) {
        renderer = new ChannelRenderer(channel);
        renderers[channel._id] = renderer;
    }

    return renderer;
}

export function deleteRenderer(channel_id: string) {
    delete renderers[channel_id];
}
