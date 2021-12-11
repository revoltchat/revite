import { makeAutoObservable, ObservableMap } from "mobx";
import { Session } from "revolt-api/types/Auth";
import { Nullable } from "revolt.js/dist/util/null";

import Persistent from "../interfaces/Persistent";

interface Data {
    sessions: Record<string, Session>;
    current?: string;
}

/**
 * Handles account authentication, managing multiple
 * accounts and their sessions.
 */
export default class Auth implements Persistent<Data> {
    private sessions: ObservableMap<string, Session>;
    private current: Nullable<string>;

    /**
     * Construct new Auth store.
     */
    constructor() {
        this.sessions = new ObservableMap();
        this.current = null;
        makeAutoObservable(this);
    }

    toJSON() {
        return {
            sessions: this.sessions,
            current: this.current,
        };
    }

    hydrate(data: Data) {
        Object.keys(data.sessions).forEach((id) =>
            this.sessions.set(id, data.sessions[id]),
        );

        if (data.current && this.sessions.has(data.current)) {
            this.current = data.current;
        }
    }

    /**
     * Add a new session to the auth manager.
     * @param session Session
     */
    setSession(session: Session) {
        this.sessions.set(session.user_id, session);
        this.current = session.user_id;
    }

    /**
     * Remove existing session by user ID.
     * @param user_id User ID tied to session
     */
    removeSession(user_id: string) {
        this.sessions.delete(user_id);

        if (user_id == this.current) {
            this.current = null;
        }
    }
}
