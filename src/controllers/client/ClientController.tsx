import { detect } from "detect-browser";
import { action, computed, makeAutoObservable, ObservableMap } from "mobx";
import { API, Client, Nullable } from "revolt.js";

import { injectController } from "../../lib/window";

import { state } from "../../mobx/State";
import Auth from "../../mobx/stores/Auth";

import { resetMemberSidebarFetched } from "../../components/navigation/right/MemberSidebar";
import { modalController } from "../modals/ModalController";
import Session from "./Session";
import { takeError } from "./jsx/error";

/**
 * Controls the lifecycles of clients
 */
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

        // ! FIXME: loop until success infinitely
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
        this.switchAccount(
            this.current ?? this.sessions.keys().next().value ?? null,
        );
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

    /**
     * Get the currently selected session
     * @returns Active Session
     */
    @computed getActiveSession() {
        return this.sessions.get(this.current!);
    }

    /**
     * Get the currently ready client
     * @returns Ready Client
     */
    @computed getReadyClient() {
        const session = this.getActiveSession();
        return session && session.ready ? session.client! : undefined;
    }

    /**
     * Get an unauthenticated instance of the Revolt.js Client
     * @returns API Client
     */
    @computed getAnonymousClient() {
        return this.apiClient;
    }

    /**
     * Get the next available client (either from session or API)
     * @returns Revolt.js Client
     */
    @computed getAvailableClient() {
        return this.getActiveSession()?.client ?? this.apiClient;
    }

    /**
     * Fetch server configuration
     * @returns Server Configuration
     */
    @computed getServerConfig() {
        return this.configuration;
    }

    /**
     * Check whether we are logged in right now
     * @returns Whether we are logged in
     */
    @computed isLoggedIn() {
        return this.current !== null;
    }

    /**
     * Check whether we are currently ready
     * @returns Whether we are ready to render
     */
    @computed isReady() {
        return this.getActiveSession()?.ready;
    }

    /**
     * Start a new client lifecycle
     * @param entry Session Information
     * @param knowledge Whether the session is new or existing
     */
    @action addSession(
        entry: { session: SessionPrivate; apiUrl?: string },
        knowledge: "new" | "existing",
    ) {
        const user_id = entry.session.user_id!;

        const session = new Session();
        this.sessions.set(user_id, session);
        this.pickNextSession();

        session
            .emit({
                action: "LOGIN",
                session: entry.session,
                apiUrl: entry.apiUrl,
                configuration: this.configuration!,
                knowledge,
            })
            .catch((err) => {
                const error = takeError(err);
                if (error === "Unauthorized") {
                    this.sessions.delete(user_id);
                    this.current = null;
                    this.pickNextSession();
                    state.auth.removeSession(user_id);
                    modalController.push({ type: "signed_out" });
                    session.destroy();
                } else {
                    modalController.push({
                        type: "error",
                        error,
                    });
                }
            });
    }

    /**
     * Login given a set of credentials
     * @param credentials Credentials
     */
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
            while (session.result === "MFA") {
                const mfa_response: API.MFAResponse | undefined =
                    await new Promise((callback) =>
                        modalController.push({
                            type: "mfa_flow",
                            state: "unknown",
                            available_methods: allowed_methods,
                            callback,
                        }),
                    );

                if (typeof mfa_response === "undefined") {
                    break;
                }

                try {
                    session = await this.apiClient.api.post(
                        "/auth/session/login",
                        {
                            mfa_response,
                            mfa_ticket: session.ticket,
                            friendly_name,
                        },
                    );
                } catch (err) {
                    console.error("Failed login:", err);
                }
            }

            if (session.result === "MFA") {
                throw "Cancelled";
            }
        }

        // Start client lifecycle
        this.addSession(
            {
                session: session as never,
            },
            "new",
        );
    }

    /**
     * Log out of a specific user session
     * @param user_id Target User ID
     */
    @action logout(user_id: string) {
        const session = this.sessions.get(user_id);
        if (session) {
            if (user_id === this.current) {
                this.current = null;
            }

            this.sessions.delete(user_id);
            this.pickNextSession();
            session.destroy();
        }
    }

    /**
     * Logout of the current session
     */
    @action logoutCurrent() {
        if (this.current) {
            this.logout(this.current);
        }
    }

    /**
     * Switch to another user session
     * @param user_id Target User ID
     */
    @action switchAccount(user_id: string) {
        this.current = user_id;

        // This will allow account switching to work more seamlessly,
        // maybe it'll be properly / fully implemented at some point.
        resetMemberSidebarFetched();
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
