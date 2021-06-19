import { openDB } from 'idb';
import { Client } from "revolt.js";
import { takeError } from "./error";
import { createContext } from "preact";
import { Children } from "../../types/Preact";
import { Route } from "revolt.js/dist/api/routes";
import { useEffect, useState } from "preact/hooks";
import { connectState } from "../../redux/connector";
import Preloader from "../../components/ui/Preloader";
import { WithDispatcher } from "../../redux/reducers";
import { AuthState } from "../../redux/reducers/auth";
import { SyncOptions } from "../../redux/reducers/sync";
import { registerEvents, setReconnectDisallowed } from "./events";

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
}

export interface AppState {
    client: Client;
    status: ClientStatus;
    operations: ClientOperations;
}

export const AppContext = createContext<AppState>(undefined as any);

type Props = WithDispatcher & {
    auth: AuthState;
    sync: SyncOptions;
    children: Children;
};

function Context({ auth, sync, children, dispatcher }: Props) {
    const [status, setStatus] = useState(ClientStatus.INIT);
    const [client, setClient] = useState<Client>(undefined as unknown as Client);

    useEffect(() => {
        (async () => {
            let db;
            try {
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

            setClient(new Client({
                autoReconnect: false,
                apiURL: import.meta.env.VITE_API_URL,
                debug: import.meta.env.DEV,
                db
            }));

            setStatus(ClientStatus.LOADING);
        })();
    }, [ ]);

    if (status === ClientStatus.INIT) return null;

    const value: AppState = {
        client,
        status,
        operations: {
            login: async data => {
                setReconnectDisallowed(true);

                try {
                    const onboarding = await client.login(data);
                    setReconnectDisallowed(false);
                    const login = () =>
                        dispatcher({
                            type: "LOGIN",
                            session: client.session as any
                        });

                    if (onboarding) {
                        /*openScreen({
                            id: "onboarding",
                            callback: async (username: string) => {
                                await (onboarding as any)(username, true);
                                login();
                            }
                        });*/
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

                delete client.user;
                dispatcher({ type: "RESET" });

                // openScreen({ id: "none" });
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
                value.operations.loggedIn() &&
                typeof client.user !== "undefined"
            )
        }
    };

    useEffect(
        () => registerEvents({ ...value, dispatcher }, setStatus, client),
        [ client ]
    );

    useEffect(() => {
        (async () => {
            await client.restore();

            if (auth.active) {
                dispatcher({ type: "QUEUE_FAIL_ALL" });

                const active = auth.accounts[auth.active];
                client.user = client.users.get(active.session.user_id);
                if (!navigator.onLine) {
                    return setStatus(ClientStatus.OFFLINE);
                }

                if (value.operations.ready())
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

                    //if (callback) {
                        /*openScreen({ id: "onboarding", callback });*/
                    //} else {
                        /*
                        // ! FIXME: all this code needs to be re-written
                        (async () => {
                            // ! FIXME: should be included in Ready payload
                            props.dispatcher({
                                type: 'SYNC_UPDATE',
                                // ! FIXME: write a procedure to resolve merge conflicts
                                update: mapSync(
                                    await client.syncFetchSettings(DEFAULT_ENABLED_SYNC.filter(x => !props.sync?.disabled?.includes(x)))
                                )
                            });
                        })()

                        props.dispatcher({ type: 'UNREADS_SET', unreads: await client.syncFetchUnreads() });*/
                    //}
                } catch (err) {
                    setStatus(ClientStatus.DISCONNECTED);
                    const error = takeError(err);
                    if (error === "Forbidden") {
                        value.operations.logout(true);
                        // openScreen({ id: "signed_out" });
                    } else {
                        // openScreen({ id: "error", error });
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
        return <Preloader />;
    }

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
