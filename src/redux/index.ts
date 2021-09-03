import localForage from "localforage";
import { createStore } from "redux";
import { RevoltConfiguration } from "revolt-api/types/Core";

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
import { TrustedLinks } from "./reducers/trusted_links";
import { Unreads } from "./reducers/unreads";

export type State = {
    config: RevoltConfiguration;
    locale: Language;
    auth: AuthState;
    settings: Settings;
    unreads: Unreads;
    queue: QueuedMessage[];
    drafts: Drafts;
    sync: SyncOptions;
    experiments: ExperimentOptions;
    lastOpened: LastOpened;
    notifications: Notifications;
    sectionToggle: SectionToggle;
    trustedLinks: TrustedLinks;
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
        trustedLinks,
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
        trustedLinks,
    });
});

export function dispatch(action: Action) {
    store.dispatch(action);
}

export function getState(): State {
    return store.getState();
}
