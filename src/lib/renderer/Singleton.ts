import { RendererRoutines, RenderState, ScrollState } from "./types";
import { SimpleRenderer } from "./simple/SimpleRenderer";
import { useEffect, useState } from "preact/hooks";
import EventEmitter3 from 'eventemitter3';
import { Client, Message } from "revolt.js";

export const SMOOTH_SCROLL_ON_RECEIVE = false;

export class SingletonRenderer extends EventEmitter3 {
    client?: Client;
    channel?: string;
    state: RenderState;
    currentRenderer: RendererRoutines;

    stale = false;
    fetchingTop = false;
    fetchingBottom = false;

    constructor() {
        super();

        this.receive = this.receive.bind(this);
        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);

        this.state = { type: 'LOADING' };
        this.currentRenderer = SimpleRenderer;
    }

    private receive(message: Message) {
        this.currentRenderer.receive(this, message);
    }

    private edit(id: string, patch: Partial<Message>) {
        this.currentRenderer.edit(this, id, patch);
    }

    private delete(id: string) {
        this.currentRenderer.delete(this, id);
    }

    subscribe(client: Client) {
        if (this.client) {
            this.client.removeListener('message', this.receive);
            this.client.removeListener('message/update', this.edit);
            this.client.removeListener('message/delete', this.delete);
        }

        this.client = client;
        client.addListener('message', this.receive);
        client.addListener('message/update', this.edit);
        client.addListener('message/delete', this.delete);
    }

    private setStateUnguarded(state: RenderState, scroll?: ScrollState) {
        this.state = state;
        this.emit('state', state);

        if (scroll) {
            this.emit('scroll', scroll);
        }
    }

    setState(id: string, state: RenderState, scroll?: ScrollState) {
        if (id !== this.channel) return;
        this.setStateUnguarded(state, scroll);
    }

    markStale() {
        this.stale = true;   
    }

    async init(id: string) {
        this.channel = id;
        this.stale = false;
        this.setStateUnguarded({ type: 'LOADING' });
        await this.currentRenderer.init(this, id);
    }

    async reloadStale(id: string) {
        if (this.stale) {
            this.stale = false;
            await this.init(id);
        }
    }

    async loadTop(ref?: HTMLDivElement) {
        if (this.fetchingTop) return;
        this.fetchingTop = true;

        function generateScroll(end: string): ScrollState {
            if (ref) {
                let heightRemoved = 0;
                let messageContainer = ref.children[0];
                if (messageContainer) {
                    for (let child of Array.from(messageContainer.children)) {
                        // If this child has a ulid.
                        if (child.id?.length === 26) {
                            // Check whether it was removed.
                            if (child.id.localeCompare(end) === 1) {
                                heightRemoved += child.clientHeight +
                                    // We also need to take into account the top margin of the container.
                                    parseInt(window.getComputedStyle(child).marginTop.slice(0, -2));
                            }
                        }
                    }
                }

                return {
                    type: 'OffsetTop',
                    previousHeight: ref.scrollHeight - heightRemoved
                }
            } else {
                return {
                    type: 'OffsetTop',
                    previousHeight: 0
                }
            }
        }

        await this.currentRenderer.loadTop(this, generateScroll);

        // Allow state updates to propagate.
        setTimeout(() => this.fetchingTop = false, 0);
    }

    async loadBottom(ref?: HTMLDivElement) {
        if (this.fetchingBottom) return;
        this.fetchingBottom = true;

        function generateScroll(start: string): ScrollState {
            if (ref) {
                let heightRemoved = 0;
                let messageContainer = ref.children[0];
                if (messageContainer) {
                    for (let child of Array.from(messageContainer.children)) {
                        // If this child has a ulid.
                        if (child.id?.length === 26) {
                            // Check whether it was removed.
                            if (child.id.localeCompare(start) === -1) {
                                heightRemoved += child.clientHeight +
                                    // We also need to take into account the top margin of the container.
                                    parseInt(window.getComputedStyle(child).marginTop.slice(0, -2));
                            }
                        }
                    }
                }

                return {
                    type: 'ScrollTop',
                    y: ref.scrollTop - heightRemoved
                }
            } else {
                return {
                    type: 'ScrollToBottom'
                }
            }
        }

        await this.currentRenderer.loadBottom(this, generateScroll);

        // Allow state updates to propagate.
        setTimeout(() => this.fetchingBottom = false, 0);
    }

    async jumpToBottom(id: string, smooth: boolean) {
        if (id !== this.channel) return;
        if (this.state.type === 'RENDER' && this.state.atBottom) {
            this.emit('scroll', { type: 'ScrollToBottom', smooth });
        } else {
            await this.currentRenderer.init(this, id, true);
        }
    }
}

export const SingletonMessageRenderer = new SingletonRenderer();

export function useRenderState(id: string) {
    const [state, setState] = useState<Readonly<RenderState>>(SingletonMessageRenderer.state);
    if (typeof id === "undefined") return;

    function render(state: RenderState) {
        setState(state);
    }

    useEffect(() => {
        SingletonMessageRenderer.addListener("state", render);
        return () => SingletonMessageRenderer.removeListener("state", render);
    }, [id]);

    return state;
}
