import { openDB } from 'idb';
import { Client } from "revolt.js";
import { takeError } from "./util";
import { createContext } from "preact";
import { Children } from "../../types/Preact";
import { useHistory } from 'react-router-dom';
import { Route } from "revolt.js/dist/api/routes";
import { connectState } from "../../redux/connector";
import Preloader from "../../components/ui/Preloader";
import { WithDispatcher } from "../../redux/reducers";
import { AuthState } from "../../redux/reducers/auth";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useIntermediate } from '../intermediate/Intermediate';
import { registerEvents, setReconnectDisallowed } from "./events";
import { SingletonMessageRenderer } from '../../lib/renderer/Singleton';

export enum ClientStatus {
    INIT,
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

    openDM: (user_id: string) => Promise<string>;
}

// By the time they are used, they should all be initialized.
// Currently the app does not render until a client is built and the other two are always initialized on first render.
// - insert's words
export const AppContext = createContext<Client>(null!);
export const StatusContext = createContext<ClientStatus>(null!);
export const OperationsContext = createContext<ClientOperations>(null!);

type Props = WithDispatcher & {
    auth: AuthState;
    children: Children;
};

function Context({ auth, children, dispatcher }: Props) {
    const history = useHistory();
    const { openScreen } = useIntermediate();
    const [status, setStatus] = useState(ClientStatus.INIT);
    const [client, setClient] = useState<Client>(undefined as unknown as Client);

    useEffect(() => {
        (async () => {
            let db;
            try {
                // Match sw.ts#L23
                db = await openDB('state', 3, {
                    upgrade(db) {
                        for (let store of [ "channels", "servers", "users", "members" ]) {
                            db.createObjectStore(store, {
                                keyPath: '_id'
                            });
                        }
                    },
                });
            } catch (err) {
                console.error('Failed to open IndexedDB store, continuing without.');
            }

            const client = new Client({
                autoReconnect: false,
                apiURL: import.meta.env.VITE_API_URL,
                debug: import.meta.env.DEV,
                db
            });

            setClient(client);
            SingletonMessageRenderer.subscribe(client);
            setStatus(ClientStatus.LOADING);
        })();
    }, [ ]);

    if (status === ClientStatus.INIT) return null;

    const operations: ClientOperations = useMemo(() => {
        return {
            login: async data => {
                setReconnectDisallowed(true);

                try {
                    const onboarding = await client.login(data);
                    setReconnectDisallowed(false);
                    const login = () =>
                        dispatcher({
                            type: "LOGIN",
                            session: client.session! // This [null assertion] is ok, we should have a session by now. - insert's words
                        });

                    if (onboarding) {
                        openScreen({
                            id: "onboarding",
                            callback: (username: string) =>
                                onboarding(username, true).then(login)
                        });
                    } else {
                        login();
                    }
                } catch (err) {
                    setReconnectDisallowed(false);
                    throw err;
                }
            },
            logout: async shouldRequest => {
                dispatcher({ type: "LOGOUT" });

                client.reset();
                dispatcher({ type: "RESET" });

                openScreen({ id: "none" });
                setStatus(ClientStatus.READY);

                client.websocket.disconnect();

                if (shouldRequest) {
                    try {
                        await client.logout();
                    } catch (err) {
                        console.error(err);
                    }
                }
            },
            loggedIn: () => typeof auth.active !== "undefined",
            ready: () => (
                operations.loggedIn() &&
                typeof client.user !== "undefined"
            ),
            openDM: async (user_id: string) => {
                let channel = await client.users.openDM(user_id);
                history.push(`/channel/${channel!._id}`);
                return channel!._id;
            }
        }
    }, [ client, auth.active ]);

    useEffect(() => registerEvents({ operations, dispatcher }, setStatus, client), [ client ]);

    useEffect(() => {
        (async () => {
            if (client.db) {
                await client.restore();
            }

            if (auth.active) {
                dispatcher({ type: "QUEUE_FAIL_ALL" });

                const active = auth.accounts[auth.active];
                client.user = client.users.get(active.session.user_id);
                if (!navigator.onLine) {
                    return setStatus(ClientStatus.OFFLINE);
                }

                if (operations.ready())
                    setStatus(ClientStatus.CONNECTING);
                
                if (navigator.onLine) {
                    await client
                        .fetchConfiguration()
                        .catch(() =>
                            console.error("Failed to connect to API server.")
                        );
                }

                try {
                    await client.fetchConfiguration();
                    const callback = await client.useExistingSession(
                        active.session
                    );

                    if (callback) {
                        openScreen({ id: "onboarding", callback });
                    }
                } catch (err) {
                    setStatus(ClientStatus.DISCONNECTED);
                    const error = takeError(err);
                    if (error === "Forbidden" || error === "Unauthorized") {
                        operations.logout(true);
                        openScreen({ id: "signed_out" });
                    } else {
                        openScreen({ id: "error", error });
                    }
                }
            } else {
                try {
                    await client.fetchConfiguration()
                } catch (err) {
                    console.error("Failed to connect to API server.");
                }

                setStatus(ClientStatus.READY);
            }
        })();
    }, []);

    if (status === ClientStatus.LOADING) {
        return <Preloader type="spinner" />;
    }

    return (
        <AppContext.Provider value={client}>
            <StatusContext.Provider value={status}>
                <OperationsContext.Provider value={operations}>
                    { children }
                </OperationsContext.Provider>
            </StatusContext.Provider>
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
