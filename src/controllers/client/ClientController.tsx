import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import type { Nullable } from "revolt.js";

import Auth from "../../mobx/stores/Auth";

import Session from "./Session";

class ClientController {
    /**
     * Map of user IDs to sessions
     */
    private sessions: ObservableMap<string, Session>;

    /**
     * User ID of active session
     */
    private current: Nullable<string>;

    constructor() {
        this.sessions = new ObservableMap();
        this.current = null;

        makeAutoObservable(this);
    }

    /**
     * Hydrate sessions and start client lifecycles.
     * @param auth Authentication store
     */
    @action hydrate(auth: Auth) {
        for (const entry of auth.getAccounts()) {
            const session = new Session();
            this.sessions.set(entry.session._id!, session);
            session.emit({
                action: "LOGIN",
                session: entry.session,
            });
        }

        this.current = this.sessions.keys().next().value ?? null;
    }

    @computed getActiveSession() {
        return this.sessions.get(this.current!);
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
}

export const clientController = new ClientController();
