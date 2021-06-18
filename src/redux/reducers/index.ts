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
    experiments
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
    | { type: "__INIT"; state: any };

export type WithDispatcher = { dispatcher: (action: Action) => void };

export function filter(obj: any, keys: string[]) {
    const newObj: any = {};
    for (const key of keys) {
        const v = obj[key];
        if (v) newObj[key] = v;
    }

    return newObj;
}
