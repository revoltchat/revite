/* eslint-disable react-hooks/rules-of-hooks */
import { observer } from "mobx-react-lite";
import { Client } from "revolt.js";

import { createContext } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import { useApplicationState } from "../../mobx/State";

import Preloader from "../../components/ui/Preloader";

import { Children } from "../../types/Preact";
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
export const OperationsContext = createContext<ClientOperations>(null!);
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
            new Client().req("GET", "/").then(state.config.set);
        }
    }, []);

    useEffect(() => {
        if (state.auth.isLoggedIn()) {
            const client = state.config.createClient();
            setClient(client);

            client
                .useExistingSession(state.auth.getSession()!)
                .then(() => setLoaded(true))
                .catch((err) => {
                    const error = takeError(err);
                    if (error === "Forbidden" || error === "Unauthorized") {
                        client.logout(true);
                        openScreen({ id: "signed_out" });
                    } else {
                        setStatus(ClientStatus.DISCONNECTED);
                        openScreen({ id: "error", error });
                    }
                });
        } else {
            setStatus(ClientStatus.READY);
            setLoaded(true);
        }
    }, [state.auth.getSession()]);

    useEffect(() => registerEvents(state.auth, setStatus, client), [client]);

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
