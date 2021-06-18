import { Client } from "revolt.js";
import { createContext } from "preact";
import { useState } from "preact/hooks";
import { Children } from "../../types/Preact";
import { Route } from "revolt.js/dist/api/routes";
import { connectState } from "../../redux/connector";
import { WithDispatcher } from "../../redux/reducers";
import { AuthState } from "../../redux/reducers/auth";
import { SyncOptions } from "../../redux/reducers/sync";

export enum ClientStatus {
    LOADING,
    READY,
    OFFLINE,
    DISCONNECTED,
    CONNECTING,
    RECONNECTING,
    ONLINE,
}

export interface ClientOperations {
    login: (data: Route<"POST", "/auth/login">["data"]) => Promise<void>;
    logout: (shouldRequest?: boolean) => Promise<void>;
    loggedIn: () => boolean;
    ready: () => boolean;
}

export interface AppState {
    status: ClientStatus;
    operations: ClientOperations;
}

export const AppContext = createContext<AppState>(undefined as any);

export const RevoltClient = new Client({
    autoReconnect: false,
    apiURL: import.meta.env.VITE_API_URL,
    debug: process.env.NODE_ENV === "development",
    // db: new Db("state", 3, ["channels", "servers", "users", "members"])
});

type Props = WithDispatcher & {
    auth: AuthState;
    sync: SyncOptions;
    children: Children;
};

function Context({ auth, sync, children, dispatcher }: Props) {
    const [status, setStatus] = useState(ClientStatus.LOADING);

    const value: AppState = {
        status,
        operations: {
            login: async data => {},
            logout: async shouldRequest => {},
            loggedIn: () => false,
            ready: () => false
        }
    };

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    );
}

export default connectState<{ children: Children }>(
    Context,
    state => {
        return {
            auth: state.auth,
            sync: state.sync
        };
    },
    true
);
