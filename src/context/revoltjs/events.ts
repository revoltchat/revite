import { Client } from "revolt.js/dist";
import { Message } from "revolt.js/dist/maps/Messages";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

import { StateUpdater } from "preact/hooks";

import { dispatch } from "../../redux";

import { ClientOperations, ClientStatus } from "./RevoltClient";

export let preventReconnect = false;
let preventUntil = 0;

export function setReconnectDisallowed(allowed: boolean) {
    preventReconnect = allowed;
}

export function registerEvents(
    { operations }: { operations: ClientOperations },
    setStatus: StateUpdater<ClientStatus>,
    client: Client,
) {
    function attemptReconnect() {
        if (preventReconnect) return;
        function reconnect() {
            preventUntil = +new Date() + 2000;
            client.websocket.connect().catch((err) => console.error(err));
        }

        if (+new Date() > preventUntil) {
            setTimeout(reconnect, 2000);
        } else {
            reconnect();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let listeners: Record<string, (...args: any[]) => void> = {
        connecting: () =>
            operations.ready() && setStatus(ClientStatus.CONNECTING),

        dropped: () => {
            if (operations.ready()) {
                setStatus(ClientStatus.DISCONNECTED);
                attemptReconnect();
            }
        },

        packet: (packet: ClientboundNotification) => {
            switch (packet.type) {
                case "ChannelAck": {
                    dispatch({
                        type: "UNREADS_MARK_READ",
                        channel: packet.id,
                        message: packet.message_id,
                    });
                    break;
                }
            }
        },

        message: (message: Message) => {
            if (message.mention_ids?.includes(client.user!._id)) {
                dispatch({
                    type: "UNREADS_MENTION",
                    channel: message.channel_id,
                    message: message._id,
                });
            }
        },

        ready: () => setStatus(ClientStatus.ONLINE),
    };

    if (import.meta.env.DEV) {
        listeners = new Proxy(listeners, {
            get:
                (target, listener) =>
                (...args: unknown[]) => {
                    console.debug(`Calling ${listener.toString()} with`, args);
                    Reflect.get(target, listener)(...args);
                },
        });
    }

    // TODO: clean this a bit and properly handle types
    for (const listener in listeners) {
        client.addListener(listener, listeners[listener]);
    }

    const online = () => {
        if (operations.ready()) {
            setStatus(ClientStatus.RECONNECTING);
            setReconnectDisallowed(false);
            attemptReconnect();
        }
    };

    const offline = () => {
        if (operations.ready()) {
            setReconnectDisallowed(true);
            client.websocket.disconnect();
            setStatus(ClientStatus.OFFLINE);
        }
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
        for (const listener in listeners) {
            client.removeListener(
                listener,
                listeners[listener as keyof typeof listeners],
            );
        }

        window.removeEventListener("online", online);
        window.removeEventListener("offline", offline);
    };
}
