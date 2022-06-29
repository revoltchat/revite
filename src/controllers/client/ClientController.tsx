import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { Client, Nullable } from "revolt.js";

import { injectController } from "../../lib/window";

import Auth from "../../mobx/stores/Auth";

import { modalController } from "../modals/ModalController";
import Session from "./Session";

class ClientController {
    /**
     * API client
     */
    private apiClient: Client;

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

        this.sessions = new ObservableMap();
        this.current = null;

        makeAutoObservable(this);

        this.logoutCurrent = this.logoutCurrent.bind(this);

        // Inject globally
        injectController("client", this);
    }

    /**
     * Hydrate sessions and start client lifecycles.
     * @param auth Authentication store
     */
    @action hydrate(auth: Auth) {
        for (const entry of auth.getAccounts()) {
            const user_id = entry.session.user_id!;

            const session = new Session();
            this.sessions.set(user_id, session);

            session
                .emit({
                    action: "LOGIN",
                    session: entry.session,
                    apiUrl: entry.apiUrl,
                })
                .catch((error) => {
                    if (error === "Forbidden" || error === "Unauthorized") {
                        this.sessions.delete(user_id);
                        auth.removeSession(user_id);
                        modalController.push({ type: "signed_out" });
                        session.destroy();
                    }
                });
        }

        this.current = this.sessions.keys().next().value ?? null;
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

    @computed isLoggedIn() {
        return this.current === null;
    }

    @action logout(user_id: string) {
        const session = this.sessions.get(user_id);
        if (session) {
            this.sessions.delete(user_id);
            if (user_id === this.current) {
                this.current = this.sessions.keys().next().value ?? null;
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
