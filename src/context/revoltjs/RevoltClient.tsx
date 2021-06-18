import { Client } from 'revolt.js';

export enum ClientStatus {
    LOADING,
    READY,
    OFFLINE,
    DISCONNECTED,
    CONNECTING,
    RECONNECTING,
    ONLINE
}

export const RevoltJSClient = new Client({
    autoReconnect: false,
    apiURL: process.env.API_SERVER,
    debug: process.env.NODE_ENV === "development",
    // Match sw.js#13
    // db: new Db("state", 3, ["channels", "servers", "users", "members"])
});
