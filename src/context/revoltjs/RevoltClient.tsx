/* eslint-disable react-hooks/rules-of-hooks */
import { observer } from "mobx-react-lite";
import { Client } from "revolt.js";

import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import { Preloader } from "@revoltchat/ui";

import { useApplicationState } from "../../mobx/State";

import { useIntermediate } from "../intermediate/Intermediate";
import { registerEvents } from "./events";
import { takeError } from "./util";

export enum ClientStatus {
    READY,
    LOADING,
    OFFLINE,
    DISCONNECTED,
    CONNECTING,
    RECONNECTING,
    ONLINE,
}

export interface ClientOperations {
    logout: (shouldRequest?: boolean) => Promise<void>;
}

export const AppContext = createContext<Client>(null!);
export const StatusContext = createContext<ClientStatus>(null!);
export const LogOutContext = createContext(() => {});

type Props = {
    children: Children;
};

export default observer(({ children }: Props) => {
    const state = useApplicationState();
    const { openScreen } = useIntermediate();
    const [client, setClient] = useState<Client>(null!);
    const [status, setStatus] = useState(ClientStatus.LOADING);
    const [loaded, setLoaded] = useState(false);

    function logout() {
        setLoaded(false);
        client.logout(false);
    }

    useEffect(() => {
        if (navigator.onLine) {
            state.config.createClient().api.get("/").then(state.config.set);
        }
    }, []);

    useEffect(() => {
        if (state.auth.isLoggedIn()) {
            setLoaded(false);
            const client = state.config.createClient();
            setClient(client);

            client
                .useExistingSession(state.auth.getSession()!)
                .catch((err) => {
                    const error = takeError(err);
                    if (error === "Forbidden" || error === "Unauthorized") {
                        client.logout(true);
                        openScreen({ id: "signed_out" });
                    } else {
                        setStatus(ClientStatus.DISCONNECTED);
                        openScreen({ id: "error", error });
                    }
                })
                .finally(() => setLoaded(true));
        } else {
            setStatus(ClientStatus.READY);
            setLoaded(true);
        }
    }, [state.auth.getSession()]);

    useEffect(() => registerEvents(state, setStatus, client), [client]);
    useEffect(() => state.registerListeners(client), [client]);

    if (!loaded || status === ClientStatus.LOADING) {
        return <Preloader type="spinner" />;
    }

    return (
        <AppContext.Provider value={client}>
            <StatusContext.Provider value={status}>
                <LogOutContext.Provider value={logout}>
                    {children}
                </LogOutContext.Provider>
            </StatusContext.Provider>
        </AppContext.Provider>
    );
});

export const useClient = () => useContext(AppContext);
