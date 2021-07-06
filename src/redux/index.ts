import localForage from "localforage";
import { createStore } from "redux";
import { Core } from "revolt.js/dist/api/objects";

import { Language } from "../context/Locale";

import rootReducer, { Action } from "./reducers";
import { AuthState } from "./reducers/auth";
import { Drafts } from "./reducers/drafts";
import { ExperimentOptions } from "./reducers/experiments";
import { LastOpened } from "./reducers/last_opened";
import { Notifications } from "./reducers/notifications";
import { QueuedMessage } from "./reducers/queue";
import { SectionToggle } from "./reducers/section_toggle";
import { Settings } from "./reducers/settings";
import { SyncOptions } from "./reducers/sync";
import { Typing } from "./reducers/typing";
import { Unreads } from "./reducers/unreads";

export type State = {
    config: Core.RevoltNodeConfiguration;
    locale: Language;
    auth: AuthState;
    settings: Settings;
    unreads: Unreads;
    queue: QueuedMessage[];
    typing: Typing;
    drafts: Drafts;
    sync: SyncOptions;
    experiments: ExperimentOptions;
    lastOpened: LastOpened;
    notifications: Notifications;
    sectionToggle: SectionToggle;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const store = createStore((state: any, action: any) => {
    if (import.meta.env.DEV) {
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
        config,
        locale,
        auth,
        settings,
        unreads,
        queue,
        drafts,
        sync,
        experiments,
        lastOpened,
        notifications,
        sectionToggle,
    } = store.getState() as State;

    localForage.setItem("state", {
        config,
        locale,
        auth,
        settings,
        unreads,
        queue,
        drafts,
        sync,
        experiments,
        lastOpened,
        notifications,
        sectionToggle,
    });
});

export function dispatch(action: Action) {
    store.dispatch(action);
}

export function getState(): State {
    return store.getState();
}
