import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";
import { WithDispatcher } from "../../redux/reducers";
import { Client, Message } from "revolt.js/dist";
import {
    ClientOperations,
    ClientStatus
} from "./RevoltClient";
import { StateUpdater } from "preact/hooks";

export var preventReconnect = false;
let preventUntil = 0;

export function setReconnectDisallowed(allowed: boolean) {
    preventReconnect = allowed;
}

export function registerEvents({
    operations,
    dispatcher
}: { operations: ClientOperations } & WithDispatcher, setStatus: StateUpdater<ClientStatus>, client: Client) {
    function attemptReconnect() {
        if (preventReconnect) return;
        function reconnect() {
            preventUntil = +new Date() + 2000;
            client.websocket.connect().catch(err => console.error(err));
        }

        if (+new Date() > preventUntil) {
            setTimeout(reconnect, 2000);
        } else {
            reconnect();
        }
    }

    const listeners = {
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
                case "ChannelStartTyping": {
                    if (packet.user === client.user?._id) return;
                    dispatcher({
                        type: "TYPING_START",
                        channel: packet.id,
                        user: packet.user
                    });
                    break;
                }
                case "ChannelStopTyping": {
                    if (packet.user === client.user?._id) return;
                    dispatcher({
                        type: "TYPING_STOP",
                        channel: packet.id,
                        user: packet.user
                    });
                    break;
                }
                case "ChannelAck": {
                    dispatcher({
                        type: "UNREADS_MARK_READ",
                        channel: packet.id,
                        message: packet.message_id
                    });
                    break;
                }
            }
        },

        message: (message: Message) => {
            if (message.mentions?.includes(client.user!._id)) {
                dispatcher({
                    type: "UNREADS_MENTION",
                    channel: message.channel,
                    message: message._id
                });
            }
        },

        ready: () => setStatus(ClientStatus.ONLINE)
    };

    let listenerFunc: { [key: string]: Function };
    if (import.meta.env.DEV) {
        listenerFunc = {};
        for (const listener of Object.keys(listeners)) {
            listenerFunc[listener] = (...args: any[]) => {
                console.debug(`Calling ${listener} with`, args);
                (listeners as any)[listener](...args);
            };
        }
    } else {
        listenerFunc = listeners;
    }

    for (const listener of Object.keys(listenerFunc)) {
        client.addListener(listener, (listenerFunc as any)[listener]);
    }

    function logMutation(target: string, key: string) {
        console.log('(o) Object mutated', target, '\nChanged:', key);
    }

    if (import.meta.env.DEV) {
        client.users.addListener('mutation', logMutation);
        client.servers.addListener('mutation', logMutation);
        client.channels.addListener('mutation', logMutation);
        client.servers.members.addListener('mutation', logMutation);
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
        for (const listener of Object.keys(listenerFunc)) {
            client.removeListener(listener, (listenerFunc as any)[listener]);
        }

        if (import.meta.env.DEV) {
            client.users.removeListener('mutation', logMutation);
            client.servers.removeListener('mutation', logMutation);
            client.channels.removeListener('mutation', logMutation);
            client.servers.members.removeListener('mutation', logMutation);
        }

        window.removeEventListener("online", online);
        window.removeEventListener("offline", offline);
    };
}
