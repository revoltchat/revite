export const _ = "";

/*export function registerEvents(
    state: State,
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
            state.auth.logout();
            state.reset();
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
}*/
