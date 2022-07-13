import { action, computed, makeAutoObservable, ObservableMap } from "mobx";

import { mapToRecord } from "../../lib/conversion";

import { clientController } from "../../controllers/client/ClientController";
import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

interface Account {
    session: Session;
    apiUrl?: string;
}

export interface Data {
    sessions: Record<string, Account>;
}

/**
 * Handles account authentication, managing multiple
 * accounts and their sessions.
 */
export default class Auth implements Store, Persistent<Data> {
    private sessions: ObservableMap<string, Account>;

    /**
     * Construct new Auth store.
     */
    constructor() {
        this.sessions = new ObservableMap();

        // Inject session token if it is provided.
        if (import.meta.env.VITE_SESSION_TOKEN) {
            this.sessions.set("0", {
                session: {
                    name: "0",
                    user_id: "0",
                    token: import.meta.env.VITE_SESSION_TOKEN as string,
                },
            });
        }

        makeAutoObservable(this);
    }

    get id() {
        return "auth";
    }

    @action toJSON() {
        return {
            sessions: JSON.parse(JSON.stringify(mapToRecord(this.sessions))),
        };
    }

    @action hydrate(data: Data) {
        if (Array.isArray(data.sessions)) {
            data.sessions.forEach(([key, value]) =>
                this.sessions.set(key, value),
            );
        } else if (
            typeof data.sessions === "object" &&
            data.sessions !== null
        ) {
            const v = data.sessions;
            Object.keys(data.sessions).forEach((id) =>
                this.sessions.set(id, v[id]),
            );
        }
    }

    /**
     * Add a new session to the auth manager.
     * @param session Session
     * @param apiUrl Custom API URL
     */
    @action setSession(session: Session, apiUrl?: string) {
        this.sessions.set(session.user_id, { session, apiUrl });
    }

    /**
     * Remove existing session by user ID.
     * @param user_id User ID tied to session
     */
    @action removeSession(user_id: string) {
        this.sessions.delete(user_id);
    }

    /**
     * Get all known accounts.
     * @returns Array of accounts
     */
    @computed getAccounts() {
        return [...this.sessions.values()];
    }

    /**
     * Remove current session.
     */
    /*@action logout() {
        this.current && this.removeSession(this.current);
    }*/

    /**
     * Get current session.
     * @returns Current session
     */
    /*@computed getSession() {
        if (!this.current) return;
        return this.sessions.get(this.current)!.session;
    }*/

    /**
     * Check whether we are currently logged in.
     * @returns Whether we are logged in
     */
    @computed isLoggedIn() {
        // ! FIXME: temp proxy info
        return clientController.getActiveSession()?.ready;
    }
}
