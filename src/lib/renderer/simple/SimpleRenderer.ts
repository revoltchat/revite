import { mapMessage } from "../../../context/revoltjs/util";

import { SMOOTH_SCROLL_ON_RECEIVE } from "../Singleton";
import { RendererRoutines } from "../types";

export const SimpleRenderer: RendererRoutines = {
    init: async (renderer, id, nearby, smooth) => {
        if (renderer.client!.websocket.connected) {
            if (nearby)
                renderer
                    .client!.channels.fetchMessagesWithUsers(
                        id,
                        { nearby, limit: 100 },
                        true,
                    )
                    .then(({ messages: data }) => {
                        data.sort((a, b) => a._id.localeCompare(b._id));
                        const messages = data.map((x) => mapMessage(x));
                        renderer.setState(
                            id,
                            {
                                type: "RENDER",
                                messages,
                                atTop: false,
                                atBottom: false,
                            },
                            { type: "ScrollToView", id: nearby },
                        );
                    });
            else
                renderer
                    .client!.channels.fetchMessagesWithUsers(id, {}, true)
                    .then(({ messages: data }) => {
                        data.reverse();
                        const messages = data.map((x) => mapMessage(x));
                        renderer.setState(
                            id,
                            {
                                type: "RENDER",
                                messages,
                                atTop: data.length < 50,
                                atBottom: true,
                            },
                            { type: "ScrollToBottom", smooth },
                        );
                    });
        } else {
            renderer.setState(id, { type: "WAITING_FOR_NETWORK" });
        }
    },
    receive: async (renderer, message) => {
        if (message.channel !== renderer.channel) return;
        if (renderer.state.type !== "RENDER") return;
        if (renderer.state.messages.find((x) => x._id === message._id)) return;
        if (!renderer.state.atBottom) return;

        let messages = [...renderer.state.messages, mapMessage(message)];
        let atTop = renderer.state.atTop;
        if (messages.length > 150) {
            messages = messages.slice(messages.length - 150);
            atTop = false;
        }

        renderer.setState(
            message.channel,
            {
                ...renderer.state,
                messages,
                atTop,
            },
            { type: "StayAtBottom", smooth: SMOOTH_SCROLL_ON_RECEIVE },
        );
    },
    edit: async (renderer, id, patch) => {
        const channel = renderer.channel;
        if (!channel) return;
        if (renderer.state.type !== "RENDER") return;

        const messages = [...renderer.state.messages];
        const index = messages.findIndex((x) => x._id === id);

        if (index > -1) {
            const message = { ...messages[index], ...mapMessage(patch) };
            messages.splice(index, 1, message);

            renderer.setState(
                channel,
                {
                    ...renderer.state,
                    messages,
                },
                { type: "StayAtBottom" },
            );
        }
    },
    delete: async (renderer, id) => {
        const channel = renderer.channel;
        if (!channel) return;
        if (renderer.state.type !== "RENDER") return;

        const messages = [...renderer.state.messages];
        const index = messages.findIndex((x) => x._id === id);

        if (index > -1) {
            messages.splice(index, 1);

            renderer.setState(
                channel,
                {
                    ...renderer.state,
                    messages,
                },
                { type: "StayAtBottom" },
            );
        }
    },
    loadTop: async (renderer, generateScroll) => {
        const channel = renderer.channel;
        if (!channel) return;

        const state = renderer.state;
        if (state.type !== "RENDER") return;
        if (state.atTop) return;

        const { messages: data } =
            await renderer.client!.channels.fetchMessagesWithUsers(
                channel,
                {
                    before: state.messages[0]._id,
                },
                true,
            );

        if (data.length === 0) {
            return renderer.setState(channel, {
                ...state,
                atTop: true,
            });
        }

        data.reverse();
        let messages = [...data.map((x) => mapMessage(x)), ...state.messages];

        let atTop = false;
        if (data.length < 50) {
            atTop = true;
        }

        let atBottom = state.atBottom;
        if (messages.length > 150) {
            messages = messages.slice(0, 150);
            atBottom = false;
        }

        renderer.setState(
            channel,
            { ...state, atTop, atBottom, messages },
            generateScroll(messages[messages.length - 1]._id),
        );
    },
    loadBottom: async (renderer, generateScroll) => {
        const channel = renderer.channel;
        if (!channel) return;

        const state = renderer.state;
        if (state.type !== "RENDER") return;
        if (state.atBottom) return;

        const { messages: data } =
            await renderer.client!.channels.fetchMessagesWithUsers(
                channel,
                {
                    after: state.messages[state.messages.length - 1]._id,
                    sort: "Oldest",
                },
                true,
            );

        if (data.length === 0) {
            return renderer.setState(channel, {
                ...state,
                atBottom: true,
            });
        }

        let messages = [...state.messages, ...data.map((x) => mapMessage(x))];

        let atBottom = false;
        if (data.length < 50) {
            atBottom = true;
        }

        let atTop = state.atTop;
        if (messages.length > 150) {
            messages = messages.slice(messages.length - 150);
            atTop = false;
        }

        renderer.setState(
            channel,
            { ...state, atTop, atBottom, messages },
            generateScroll(messages[0]._id),
        );
    },
};
