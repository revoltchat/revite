import { action, computed, makeAutoObservable } from "mobx";
import { API, Client } from "revolt.js";

import { state } from "../../mobx/State";

import { resetMemberSidebarFetched } from "../../components/navigation/right/MemberSidebar";
import { modalController } from "../modals/ModalController";

/**
 * Current lifecycle state
 */
type State = "Ready" | "Connecting" | "Online" | "Disconnected" | "Offline";

/**
 * Possible transitions between states
 */
type Transition =
    | {
          action: "LOGIN";
          apiUrl?: string;
          session: SessionPrivate;
          configuration?: API.RevoltConfig;

          knowledge: "new" | "existing";
      }
    | {
          action:
              | "SUCCESS"
              | "DISCONNECT"
              | "RETRY"
              | "LOGOUT"
              | "ONLINE"
              | "OFFLINE";
      };

/**
 * Client lifecycle finite state machine
 */
export default class Session {
    state: State = window.navigator.onLine ? "Ready" : "Offline";
    user_id: string | null = null;
    client: Client | null = null;

    /**
     * Create a new Session
     */
    constructor() {
        makeAutoObservable(this);

        this.onDropped = this.onDropped.bind(this);
        this.onReady = this.onReady.bind(this);
        this.onOnline = this.onOnline.bind(this);
        this.onOffline = this.onOffline.bind(this);

        window.addEventListener("online", this.onOnline);
        window.addEventListener("offline", this.onOffline);
    }

    /**
     * Initiate logout and destroy client
     */
    @action destroy() {
        if (this.client) {
            this.client.logout(false);
            this.state = "Ready";
            this.client = null;
        }
    }

    /**
     * Called when user's browser signals it is online
     */
    private onOnline() {
        this.emit({
            action: "ONLINE",
        });
    }

    /**
     * Called when user's browser signals it is offline
     */
    private onOffline() {
        this.emit({
            action: "OFFLINE",
        });
    }

    /**
     * Called when the client signals it has disconnected
     */
    private onDropped() {
        this.emit({
            action: "DISCONNECT",
        });
    }

    /**
     * Called when the client signals it has received the Ready packet
     */
    private onReady() {
        resetMemberSidebarFetched();
        this.emit({
            action: "SUCCESS",
        });
    }

    /**
     * Create a new Revolt.js Client for this Session
     * @param apiUrl Optionally specify an API URL
     */
    private createClient(apiUrl?: string) {
        this.client = new Client({
            unreads: true,
            autoReconnect: false,
            onPongTimeout: "EXIT",
            apiURL: apiUrl ?? import.meta.env.VITE_API_URL,
        });

        this.client.addListener("dropped", this.onDropped);
        this.client.addListener("ready", this.onReady);
    }

    /**
     * Destroy the client including any listeners.
     */
    private destroyClient() {
        this.client!.removeAllListeners();
        this.client!.logout();
        this.user_id = null;
        this.client = null;
    }

    /**
     * Ensure we are in one of the given states
     * @param state Possible states
     */
    private assert(...state: State[]) {
        let found = false;
        for (const target of state) {
            if (this.state === target) {
                found = true;
                break;
            }
        }

        if (!found) {
            throw `State must be ${state} in order to transition! (currently ${this.state})`;
        }
    }

    /**
     * Continue logging in provided onboarding is successful
     * @param data Transition Data
     */
    private async continueLogin(data: Transition & { action: "LOGIN" }) {
        try {
            await this.client!.useExistingSession(data.session);
            this.user_id = this.client!.user!._id;
            state.auth.setSession(data.session);
        } catch (err) {
            this.state = "Ready";
            throw err;
        }
    }

    /**
     * Transition to a new state by a certain action
     * @param data Transition Data
     */
    @action async emit(data: Transition) {
        console.info(`[FSM ${this.user_id ?? "Anonymous"}]`, data);

        switch (data.action) {
            // Login with session
            case "LOGIN": {
                this.assert("Ready");
                this.state = "Connecting";
                this.createClient(data.apiUrl);

                if (data.configuration) {
                    this.client!.configuration = data.configuration;
                }

                if (data.knowledge === "new") {
                    await this.client!.fetchConfiguration();
                    this.client!.session = data.session;
                    (this.client! as any).$updateHeaders();

                    const { onboarding } = await this.client!.api.get(
                        "/onboard/hello",
                    );

                    if (onboarding) {
                        modalController.push({
                            type: "onboarding",
                            callback: async (username: string) =>
                                this.client!.completeOnboarding(
                                    { username },
                                    false,
                                ).then(() => this.continueLogin(data)),
                        });

                        return;
                    }
                }

                await this.continueLogin(data);

                break;
            }
            // Ready successfully received
            case "SUCCESS": {
                this.assert("Connecting");
                this.state = "Online";
                break;
            }
            // Client got disconnected
            case "DISCONNECT": {
                if (navigator.onLine) {
                    this.assert("Online");
                    this.state = "Disconnected";

                    setTimeout(() => {
                        // Check we are still disconnected before retrying.
                        if (this.state === "Disconnected") {
                            this.emit({
                                action: "RETRY",
                            });
                        }
                    }, 1000);
                }

                break;
            }
            // We should try reconnecting
            case "RETRY": {
                this.assert("Disconnected");
                this.client!.websocket.connect();
                this.state = "Connecting";
                break;
            }
            // User instructed logout
            case "LOGOUT": {
                this.assert("Connecting", "Online", "Disconnected");
                this.state = "Ready";
                this.destroyClient();
                break;
            }
            // Browser went offline
            case "OFFLINE": {
                this.state = "Offline";
                break;
            }
            // Browser went online
            case "ONLINE": {
                this.assert("Offline");
                if (this.client) {
                    this.state = "Disconnected";
                    this.emit({
                        action: "RETRY",
                    });
                } else {
                    this.state = "Ready";
                }
                break;
            }
        }
    }

    /**
     * Whether we are ready to render.
     * @returns Boolean
     */
    @computed get ready() {
        return !!this.client?.user;
    }
}
