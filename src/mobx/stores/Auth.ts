import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { Session } from "revolt-api/types/Auth";
import { Nullable } from "revolt.js/dist/util/null";

import { mapToRecord } from "../../lib/conversion";

import Persistent from "../interfaces/Persistent";
import Store from "../interfaces/Store";

interface Account {
    session: Session;
}

export interface Data {
    sessions: Record<string, Account>;
    current?: string;
}

/**
 * Handles account authentication, managing multiple
 * accounts and their sessions.
 */
export default class Auth implements Store, Persistent<Data> {
    private sessions: ObservableMap<string, Account>;
    private current: Nullable<string>;

    /**
     * Construct new Auth store.
     */
    constructor() {
        this.sessions = new ObservableMap();
        this.current = null;

        // Inject session token if it is provided.
        if (import.meta.env.VITE_SESSION_TOKEN) {
            this.sessions.set("0", {
                session: {
                    name: "0",
                    user_id: "0",
                    token: import.meta.env.VITE_SESSION_TOKEN as string,
                },
            });

            this.current = "0";
        }

        makeAutoObservable(this);
    }

    get id() {
        return "auth";
    }

    @action toJSON() {
        return {
            sessions: JSON.parse(JSON.stringify(mapToRecord(this.sessions))),
            current: this.current ?? undefined,
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
            let v = data.sessions;
            Object.keys(data.sessions).forEach((id) =>
                this.sessions.set(id, v[id]),
            );
        }

        if (data.current && this.sessions.has(data.current)) {
            this.current = data.current;
        }
    }

    /**
     * Add a new session to the auth manager.
     * @param session Session
     */
    @action setSession(session: Session) {
        this.sessions.set(session.user_id, { session });
        this.current = session.user_id;
        console.log(this.sessions, this.current);
    }

    /**
     * Remove existing session by user ID.
     * @param user_id User ID tied to session
     */
    @action removeSession(user_id: string) {
        if (user_id == this.current) {
            this.current = null;
        }

        this.sessions.delete(user_id);
    }

    /**
     * Remove current session.
     */
    @action logout() {
        this.current && this.removeSession(this.current);
    }

    /**
     * Get current session.
     * @returns Current session
     */
    @computed getSession() {
        if (!this.current) return;
        return this.sessions.get(this.current)!.session;
    }

    /**
     * Check whether we are currently logged in.
     * @returns Whether we are logged in
     */
    @computed isLoggedIn() {
        return this.current !== null;
    }
}
