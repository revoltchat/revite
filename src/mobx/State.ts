import { makeAutoObservable } from "mobx";

import { createContext } from "preact";
import { useContext } from "preact/hooks";

import Auth from "./stores/Auth";
import Draft from "./stores/Draft";

interface StoreDefinition {
    id: string;
    instance: Record<string, unknown>;
    persistent: boolean;
    synced: boolean;
    global: boolean;
}

/**
 * Handles global application state.
 */
export default class State {
    auth: Auth;
    draft: Draft;

    /**
     * Construct new State.
     */
    constructor() {
        this.auth = new Auth();
        this.draft = new Draft();

        makeAutoObservable(this);
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
