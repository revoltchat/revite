import { makeAutoObservable } from "mobx";
import { Session } from "revolt-api/types/Auth";
import { Nullable } from "revolt.js/dist/util/null";

import Persistent from "../Persistent";
import { deleteKey } from "../objectUtil";

interface Data {
    sessions: Record<string, Session>;
    current?: string;
}

/**
 * Handles account authentication, managing multiple
 * accounts and their sessions.
 */
export default class Auth implements Persistent<Data> {
    private sessions: Record<string, Session>;
    private current: Nullable<string>;

    /**
     * Construct new Auth store.
     */
    constructor() {
        this.sessions = {};
        this.current = null;
        makeAutoObservable(this);
    }

    // eslint-disable-next-line require-jsdoc
    toJSON() {
        return {
            sessions: this.sessions,
            current: this.current,
        };
    }

    // eslint-disable-next-line require-jsdoc
    hydrate(data: Data) {
        this.sessions = data.sessions;
        if (data.current && this.sessions[data.current]) {
            this.current = data.current;
        }
    }

    /**
     * Add a new session to the auth manager.
     * @param session Session
     */
    setSession(session: Session) {
        this.sessions = {
            ...this.sessions,
            [session.user_id]: session,
        };

        this.current = session.user_id;
    }

    /**
     * Remove existing session by user ID.
     * @param user_id User ID tied to session
     */
    removeSession(user_id: string) {
        this.sessions = deleteKey(this.sessions, user_id);

        if (user_id == this.current) {
            this.current = null;
        }
    }
}
