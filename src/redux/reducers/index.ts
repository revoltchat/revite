import { combineReducers } from "redux";

import { State } from "..";
import { auth, AuthAction } from "./auth";
import { drafts, DraftAction } from "./drafts";
import { experiments, ExperimentsAction } from "./experiments";
import { lastOpened, LastOpenedAction } from "./last_opened";
import { locale, LocaleAction } from "./locale";
import { notifications, NotificationsAction } from "./notifications";
import { queue, QueueAction } from "./queue";
import { sectionToggle, SectionToggleAction } from "./section_toggle";
import { config, ConfigAction } from "./server_config";
import { settings, SettingsAction } from "./settings";
import { sync, SyncAction } from "./sync";
import { typing, TypingAction } from "./typing";
import { unreads, UnreadsAction } from "./unreads";

export default combineReducers({
    config,
    locale,
    auth,
    settings,
    unreads,
    queue,
    typing,
    drafts,
    sync,
    experiments,
    lastOpened,
    notifications,
    sectionToggle,
});

export type Action =
    | ConfigAction
    | LocaleAction
    | AuthAction
    | SettingsAction
    | UnreadsAction
    | QueueAction
    | TypingAction
    | DraftAction
    | SyncAction
    | ExperimentsAction
    | LastOpenedAction
    | NotificationsAction
    | SectionToggleAction
    | { type: "__INIT"; state: State };
