import localforage from "localforage";
import { autorun, makeAutoObservable, reaction } from "mobx";

import { createContext } from "preact";
import { useContext } from "preact/hooks";

import Persistent from "./interfaces/Persistent";
import Auth from "./stores/Auth";
import Draft from "./stores/Draft";
import Experiments from "./stores/Experiments";
import Layout from "./stores/Layout";
import LocaleOptions from "./stores/LocaleOptions";

/**
 * Handles global application state.
 */
export default class State {
    auth: Auth;
    draft: Draft;
    locale: LocaleOptions;
    experiments: Experiments;
    layout: Layout;

    private persistent: [string, Persistent<unknown>][] = [];

    /**
     * Construct new State.
     */
    constructor() {
        this.auth = new Auth();
        this.draft = new Draft();
        this.locale = new LocaleOptions();
        this.experiments = new Experiments();
        this.layout = new Layout();

        makeAutoObservable(this);
        this.registerListeners = this.registerListeners.bind(this);
        this.register();
    }

    private register() {
        for (const key of Object.keys(this)) {
            const obj = (
                this as unknown as Record<string, Record<string, unknown>>
            )[key];

            // Check if this is an object.
            if (typeof obj === "object") {
                // Check if this is a Store.
                if (typeof obj.id === "string") {
                    const id = obj.id;

                    // Check if this is a Persistent<T>
                    if (
                        typeof obj.hydrate === "function" &&
                        typeof obj.toJSON === "function"
                    ) {
                        this.persistent.push([
                            id,
                            obj as unknown as Persistent<unknown>,
                        ]);
                    }
                }
            }
        }
    }

    registerListeners() {
        const listeners = this.persistent.map(([id, store]) => {
            return reaction(
                () => store.toJSON(),
                (value) => {
                    localforage.setItem(id, value);
                },
            );
        });

        return () => listeners.forEach((x) => x());
    }

    async hydrate() {
        for (const [id, store] of this.persistent) {
            const data = await localforage.getItem(id);
            if (typeof data === "object" && data !== null) {
                store.hydrate(data);
            }
        }
    }
}

const StateContext = createContext<State>(null!);

export const StateContextProvider = StateContext.Provider;

/**
 * Get the application state
 * @returns Application state
 */
export function useApplicationState() {
    return useContext(StateContext);
}
