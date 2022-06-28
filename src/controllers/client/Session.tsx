import { action, computed, makeAutoObservable } from "mobx";
import { Client } from "revolt.js";

type State = "Ready" | "Connecting" | "Online" | "Disconnected" | "Offline";

type Transition =
    | {
          action: "LOGIN";
          session: SessionPrivate;
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

export default class Session {
    state: State = window.navigator.onLine ? "Ready" : "Offline";
    client: Client | null = null;

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
     * Initiate logout and destroy client.
     */
    @action destroy() {
        if (this.client) {
            this.client.logout(false);
            this.state = "Ready";
            this.client = null;
        }
    }

    private onOnline() {
        this.emit({
            action: "ONLINE",
        });
    }

    private onOffline() {
        this.emit({
            action: "OFFLINE",
        });
    }

    private onDropped() {
        this.emit({
            action: "DISCONNECT",
        });
    }

    private onReady() {
        this.emit({
            action: "SUCCESS",
        });
    }

    private createClient() {
        this.client = new Client({
            unreads: true,
            autoReconnect: false,
            onPongTimeout: "EXIT",
            apiURL: import.meta.env.VITE_API_URL,
        });

        this.client.addListener("dropped", this.onDropped);
        this.client.addListener("ready", this.onReady);
    }

    private destroyClient() {
        this.client!.removeAllListeners();
        this.client = null;
    }

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

    @action async emit(data: Transition) {
        console.info("Handle event:", data);

        switch (data.action) {
            // Login with session
            case "LOGIN": {
                this.assert("Ready");
                this.state = "Connecting";
                this.createClient();

                try {
                    await this.client!.useExistingSession(data.session);
                } catch (err) {
                    this.state = "Ready";
                    throw err;
                }

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
                        this.emit({
                            action: "RETRY",
                        });
                    }, 1500);
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
        return this.client?.user;
    }
}
