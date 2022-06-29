import { detect } from "detect-browser";
import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { API, Client, Nullable } from "revolt.js";

import { injectController } from "../../lib/window";

import { state } from "../../mobx/State";
import Auth from "../../mobx/stores/Auth";

import { modalController } from "../modals/ModalController";
import Session from "./Session";

class ClientController {
    /**
     * API client
     */
    private apiClient: Client;

    /**
     * Server configuration
     */
    private configuration: API.RevoltConfig | null;

    /**
     * Map of user IDs to sessions
     */
    private sessions: ObservableMap<string, Session>;

    /**
     * User ID of active session
     */
    private current: Nullable<string>;

    constructor() {
        this.apiClient = new Client({
            apiURL: import.meta.env.VITE_API_URL,
        });

        this.apiClient
            .fetchConfiguration()
            .then(() => (this.configuration = this.apiClient.configuration!));

        this.configuration = null;
        this.sessions = new ObservableMap();
        this.current = null;

        makeAutoObservable(this);

        this.login = this.login.bind(this);
        this.logoutCurrent = this.logoutCurrent.bind(this);

        // Inject globally
        injectController("client", this);
    }

    @action pickNextSession() {
        this.current =
            this.current ?? this.sessions.keys().next().value ?? null;
    }

    /**
     * Hydrate sessions and start client lifecycles.
     * @param auth Authentication store
     */
    @action hydrate(auth: Auth) {
        for (const entry of auth.getAccounts()) {
            this.addSession(entry, "existing");
        }

        this.pickNextSession();
    }

    @computed getActiveSession() {
        return this.sessions.get(this.current!);
    }

    @computed getAnonymousClient() {
        return this.apiClient;
    }

    @computed getAvailableClient() {
        return this.getActiveSession()?.client ?? this.apiClient;
    }

    @computed getServerConfig() {
        return this.configuration;
    }

    @computed isLoggedIn() {
        return this.current === null;
    }

    @action addSession(
        entry: { session: SessionPrivate; apiUrl?: string },
        knowledge: "new" | "existing",
    ) {
        const user_id = entry.session.user_id!;

        const session = new Session();
        this.sessions.set(user_id, session);

        session
            .emit({
                action: "LOGIN",
                session: entry.session,
                apiUrl: entry.apiUrl,
                configuration: this.configuration!,
                knowledge,
            })
            .catch((error) => {
                if (error === "Forbidden" || error === "Unauthorized") {
                    this.sessions.delete(user_id);
                    state.auth.removeSession(user_id);
                    modalController.push({ type: "signed_out" });
                    session.destroy();
                }
            });

        this.pickNextSession();
    }

    async login(credentials: API.DataLogin) {
        const browser = detect();

        // Generate a friendly name for this browser
        let friendly_name;
        if (browser) {
            let { name } = browser;
            const { os } = browser;
            let isiPad;
            if (window.isNative) {
                friendly_name = `Revolt Desktop on ${os}`;
            } else {
                if (name === "ios") {
                    name = "safari";
                } else if (name === "fxios") {
                    name = "firefox";
                } else if (name === "crios") {
                    name = "chrome";
                }
                if (os === "Mac OS" && navigator.maxTouchPoints > 0)
                    isiPad = true;
                friendly_name = `${name} on ${isiPad ? "iPadOS" : os}`;
            }
        } else {
            friendly_name = "Unknown Device";
        }

        // Try to login with given credentials
        let session = await this.apiClient.api.post("/auth/session/login", {
            ...credentials,
            friendly_name,
        });

        // Prompt for MFA verificaiton if necessary
        if (session.result === "MFA") {
            const { allowed_methods } = session;
            const mfa_response: API.MFAResponse | undefined = await new Promise(
                (callback) =>
                    modalController.push({
                        type: "mfa_flow",
                        state: "unknown",
                        available_methods: allowed_methods,
                        callback,
                    }),
            );

            if (typeof mfa_response === "undefined") {
                throw "Cancelled";
            }

            session = await this.apiClient.api.post("/auth/session/login", {
                mfa_response,
                mfa_ticket: session.ticket,
                friendly_name,
            });

            if (session.result === "MFA") {
                // unreachable code
                return;
            }
        }

        this.addSession(
            {
                session,
            },
            "new",
        );

        /*const s = session;

        client.session = session;
        (client as any).$updateHeaders();

        async function login() {
            state.auth.setSession(s);
        }

        const { onboarding } = await client.api.get("/onboard/hello");

        if (onboarding) {
            openScreen({
                id: "onboarding",
                callback: async (username: string) =>
                    client.completeOnboarding({ username }, false).then(login),
            });
        } else {
            login();
        }*/
    }

    @action logout(user_id: string) {
        const session = this.sessions.get(user_id);
        if (session) {
            this.sessions.delete(user_id);
            if (user_id === this.current) {
                this.current = null;
                this.pickNextSession();
            }

            session.destroy();
        }
    }

    @action logoutCurrent() {
        if (this.current) {
            this.logout(this.current);
        }
    }

    @action switchAccount(user_id: string) {
        this.current = user_id;
    }
}

export const clientController = new ClientController();

/**
 * Get the currently active session.
 * @returns Session
 */
export function useSession() {
    return clientController.getActiveSession();
}

/**
 * Get the currently active client or an unauthorised
 * client for API requests, whichever is available.
 * @returns Revolt.js Client
 */
export function useClient() {
    return clientController.getAvailableClient();
}

/**
 * Get unauthorised client for API requests.
 * @returns Revolt.js Client
 */
export function useApi() {
    return clientController.getAnonymousClient().api;
}
