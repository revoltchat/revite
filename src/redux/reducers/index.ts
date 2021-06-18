import { State } from "..";
import { combineReducers } from "redux";

import { settings, SettingsAction } from "./settings";
import { locale, LocaleAction } from "./locale";
import { auth, AuthAction } from "./auth";
import { unreads, UnreadsAction } from "./unreads";
import { queue, QueueAction } from "./queue";
import { typing, TypingAction } from "./typing";
import { drafts, DraftAction } from "./drafts";
import { sync, SyncAction } from "./sync";
import { experiments, ExperimentsAction } from "./experiments";

export default combineReducers({
    locale,
    auth,
    settings,
    unreads,
    queue,
    typing,
    drafts,
    sync,
    experiments,
});

export type Action =
    | LocaleAction
    | AuthAction
    | SettingsAction
    | UnreadsAction
    | QueueAction
    | TypingAction
    | DraftAction
    | SyncAction
    | ExperimentsAction
    | { type: "__INIT"; state: State };

export type WithDispatcher = { dispatcher: (action: Action) => void };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filter(obj: any, keys: string[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newObj: any = {};
    for (const key of keys) {
        const v = obj[key];
        if (v) newObj[key] = v;
    }

    return newObj;
}
