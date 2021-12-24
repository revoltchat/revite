import { Client } from "revolt.js/dist";

import { StateUpdater } from "preact/hooks";

import Auth from "../../mobx/stores/Auth";

import { ClientStatus } from "./RevoltClient";

export let preventReconnect = false;
let preventUntil = 0;

export function setReconnectDisallowed(allowed: boolean) {
    preventReconnect = allowed;
}

export function registerEvents(
    auth: Auth,
    setStatus: StateUpdater<ClientStatus>,
    client: Client,
) {
    if (!client) return;

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
        connecting: () => setStatus(ClientStatus.CONNECTING),

        dropped: () => {
            setStatus(ClientStatus.DISCONNECTED);
            attemptReconnect();
        },

        ready: () => setStatus(ClientStatus.ONLINE),

        logout: () => {
            auth.logout();
            setStatus(ClientStatus.READY);
        },
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
        setStatus(ClientStatus.RECONNECTING);
        setReconnectDisallowed(false);
        attemptReconnect();
    };

    const offline = () => {
        setReconnectDisallowed(true);
        client.websocket.disconnect();
        setStatus(ClientStatus.OFFLINE);
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
