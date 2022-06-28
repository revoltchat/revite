import { action, makeAutoObservable, ObservableMap } from "mobx";
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
            session.emit({
                action: "LOGIN",
                session: entry.session,
            });
        }
    }

    getActiveSession() {
        return this.sessions;
    }

    isLoggedIn() {
        return this.current === null;
    }
}

export const clientController = new ClientController();
