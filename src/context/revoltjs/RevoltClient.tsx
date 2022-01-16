/* eslint-disable react-hooks/rules-of-hooks */
import { observer } from "mobx-react-lite";
import { Client } from "revolt.js";

import { createContext } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import { internalEmit } from "../../lib/eventEmitter";

import { useApplicationState } from "../../mobx/State";
import { KeybindAction } from "../../mobx/stores/Keybinds";

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

    useEffect(() => registerEvents(state.auth, setStatus, client), [client]);

    // register keybind listener
    useEffect(() => {
        // const handler = state.keybinds.createHandler();
        document.addEventListener("keydown", state.keybinds);
        return () => document.addEventListener("keydown", state.keybinds);
    }, [state.keybinds]);

    // todo: create a better solution than this for handling conflicting / layered keybinds that need to have exclusivity
    state.keybinds.useAction(KeybindAction.NavigatePreviousContext, (e) => {
        internalEmit("action", KeybindAction.NavigatePreviousContextModal, e);
        if (!e.defaultPrevented) {
            internalEmit(
                "action",
                KeybindAction.NavigatePreviousContextSettings,
                e,
            );
        }
    });

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
