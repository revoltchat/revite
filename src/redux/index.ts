import { createStore } from "redux";
import rootReducer from "./reducers";
import localForage from "localforage";

import { Core } from "revolt.js/dist/api/objects";
import { Typing } from "./reducers/typing";
import { Drafts } from "./reducers/drafts";
import { AuthState } from "./reducers/auth";
import { Language } from "../context/Locale";
import { Unreads } from "./reducers/unreads";
import { SyncOptions } from "./reducers/sync";
import { Settings } from "./reducers/settings";
import { QueuedMessage } from "./reducers/queue";
import { ExperimentOptions } from "./reducers/experiments";
import { LastOpened } from "./reducers/last_opened";
import { Notifications } from "./reducers/notifications";
import { SectionToggle } from "./reducers/section_toggle";

export type State = {
    config: Core.RevoltNodeConfiguration,
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
        sectionToggle
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
        sectionToggle
    });
});
