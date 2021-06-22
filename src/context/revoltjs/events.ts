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
    const listeners = {
        connecting: () =>
            operations.ready() && setStatus(ClientStatus.CONNECTING),

        dropped: () => {
            operations.ready() && setStatus(ClientStatus.DISCONNECTED);

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

        ready: () => {
            setStatus(ClientStatus.ONLINE);
        }
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

    /*const online = () =>
        operations.ready() && setStatus(ClientStatus.RECONNECTING);
    const offline = () =>
        operations.ready() && setStatus(ClientStatus.OFFLINE);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
        for (const listener of Object.keys(listenerFunc)) {
            RevoltClient.removeListener(listener, (listenerFunc as any)[listener]);
        }

        window.removeEventListener("online", online);
        window.removeEventListener("offline", offline);
    };*/
}
