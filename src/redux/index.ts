import { createStore } from "redux";
import rootReducer from "./reducers";
import localForage from "localforage";

import { Typing } from "./reducers/typing";
import { Drafts } from "./reducers/drafts";
import { AuthState } from "./reducers/auth";
import { Language } from "../context/Locale";
import { Unreads } from "./reducers/unreads";
import { SyncOptions } from "./reducers/sync";
import { Settings } from "./reducers/settings";
import { QueuedMessage } from "./reducers/queue";
import { ExperimentOptions } from "./reducers/experiments";

export type State = {
    locale: Language;
    auth: AuthState;
    settings: Settings;
    unreads: Unreads;
    queue: QueuedMessage[];
    typing: Typing;
    drafts: Drafts;
    sync: SyncOptions;
    experiments: ExperimentOptions;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const store = createStore((state: any, action: any) => {
    if (process.env.NODE_ENV === "development") {
        console.debug("State Update:", action);
    }

    if (action.type === "__INIT") {
        return action.state;
    }

    return rootReducer(state, action);
});

// Save state using localForage.
store.subscribe(() => {
    const {
        locale,
        auth,
        settings,
        unreads,
        queue,
        drafts,
        sync,
        experiments,
    } = store.getState() as State;

    localForage.setItem("state", {
        locale,
        auth,
        settings,
        unreads,
        queue,
        drafts,
        sync,
        experiments,
    });
});
