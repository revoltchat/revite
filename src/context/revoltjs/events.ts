import { Client } from "revolt.js/dist";
import { Server } from "revolt.js/dist/maps/Servers";

import { StateUpdater } from "preact/hooks";

import { deleteRenderer } from "../../lib/renderer/Singleton";

import Auth from "../../mobx/stores/Auth";

import { resetMemberSidebarFetched } from "../../components/navigation/right/MemberSidebar";
import { ClientStatus } from "./RevoltClient";

export function registerEvents(
    auth: Auth,
    setStatus: StateUpdater<ClientStatus>,
    client: Client,
) {
    if (!client) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let listeners: Record<string, (...args: any[]) => void> = {
        connecting: () => setStatus(ClientStatus.CONNECTING),
        dropped: () => setStatus(ClientStatus.DISCONNECTED),

        ready: () => {
            resetMemberSidebarFetched();
            setStatus(ClientStatus.ONLINE);
        },

        logout: () => {
            auth.logout();
            setStatus(ClientStatus.READY);
        },

        "channel/delete": (channel_id: string) => {
            deleteRenderer(channel_id);
        },

        "server/delete": (_, server: Server) => {
            if (server) {
                for (const channel_id of server.channel_ids) {
                    deleteRenderer(channel_id);
                }
            }
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
        client.options.autoReconnect = false;
        client.websocket.connect();
    };

    const offline = () => {
        client.options.autoReconnect = false;
        client.websocket.disconnect();
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
