import { Gitlab } from "@styled-icons/boxicons-logos";
import {
    Sync as SyncIcon,
    Globe,
    LogOut,
    Desktop,
} from "@styled-icons/boxicons-regular";
import {
    Bell,
    Palette,
    Coffee,
    IdCard,
    CheckShield,
    Flask,
    User,
    Megaphone,
} from "@styled-icons/boxicons-solid";
import { Route, useHistory } from "react-router-dom";
import { LIBRARY_VERSION } from "revolt.js";

import styles from "./Settings.module.scss";
import { Text } from "preact-i18n";
import { useContext } from "preact/hooks";

import RequiresOnline from "../../context/revoltjs/RequiresOnline";
import {
    AppContext,
    OperationsContext,
} from "../../context/revoltjs/RevoltClient";

import LineDivider from "../../components/ui/LineDivider";

import ButtonItem from "../../components/navigation/items/ButtonItem";
import { GIT_BRANCH, GIT_REVISION, REPO_URL } from "../../revision";
import { APP_VERSION } from "../../version";
import { GenericSettings } from "./GenericSettings";
import { Account } from "./panes/Account";
import { Appearance } from "./panes/Appearance";
import { ExperimentsPage } from "./panes/Experiments";
import { Feedback } from "./panes/Feedback";
import { Languages } from "./panes/Languages";
import { Native } from "./panes/Native";
import { Notifications } from "./panes/Notifications";
import { Profile } from "./panes/Profile";
import { Sessions } from "./panes/Sessions";
import { Sync } from "./panes/Sync";

export default function Settings() {
    const history = useHistory();
    const client = useContext(AppContext);
    const operations = useContext(OperationsContext);

    function switchPage(to?: string) {
        if (to) {
            history.replace(`/settings/${to}`);
        } else {
            history.replace(`/settings`);
        }
    }

    return (
        <GenericSettings
            pages={[
                {
                    category: (
                        <Text id="app.settings.categories.user_settings" />
                    ),
                    id: "account",
                    icon: <User size={20} />,
                    title: <Text id="app.settings.pages.account.title" />,
                },
                {
                    id: "profile",
                    icon: <IdCard size={20} />,
                    title: <Text id="app.settings.pages.profile.title" />,
                },
                {
                    id: "sessions",
                    icon: <CheckShield size={20} />,
                    title: <Text id="app.settings.pages.sessions.title" />,
                },
                {
                    category: (
                        <Text id="app.settings.categories.client_settings" />
                    ),
                    id: "appearance",
                    icon: <Palette size={20} />,
                    title: <Text id="app.settings.pages.appearance.title" />,
                },
                {
                    id: "notifications",
                    icon: <Bell size={20} />,
                    title: <Text id="app.settings.pages.notifications.title" />,
                },
                {
                    id: "language",
                    icon: <Globe size={20} />,
                    title: <Text id="app.settings.pages.language.title" />,
                },
                {
                    id: "sync",
                    icon: <SyncIcon size={20} />,
                    title: <Text id="app.settings.pages.sync.title" />,
                },
                {
                    id: "native",
                    icon: <Desktop size={20} />,
                    title: <Text id="app.settings.pages.native.title" />,
                },
                {
                    divider: true,
                    id: "experiments",
                    icon: <Flask size={20} />,
                    title: <Text id="app.settings.pages.experiments.title" />,
                },
                {
                    id: "feedback",
                    icon: <Megaphone size={20} />,
                    title: <Text id="app.settings.pages.feedback.title" />,
                },
            ]}
            children={[
                <Route path="/settings/profile">
                    <Profile />
                </Route>,
                <Route path="/settings/sessions">
                    <RequiresOnline>
                        <Sessions />
                    </RequiresOnline>
                </Route>,
                <Route path="/settings/appearance">
                    <Appearance />
                </Route>,
                <Route path="/settings/notifications">
                    <Notifications />
                </Route>,
                <Route path="/settings/language">
                    <Languages />
                </Route>,
                <Route path="/settings/sync">
                    <Sync />
                </Route>,
                window.isNative && (
                    <Route path="/settings/native">
                        <Native />
                    </Route>
                ),
                <Route path="/settings/experiments">
                    <ExperimentsPage />
                </Route>,
                <Route path="/settings/feedback">
                    <Feedback />
                </Route>,
                <Route path="/">
                    <Account />
                </Route>,
            ]}
            defaultPage="account"
            switchPage={switchPage}
            category="pages"
            custom={[
                <a
                    href="https://gitlab.insrt.uk/revolt"
                    target="_blank"
                    rel="noreferrer">
                    <ButtonItem compact>
                        <Gitlab size={20} />
                        <Text id="app.settings.pages.source_code" />
                    </ButtonItem>
                </a>,
                <a
                    href="https://insrt.uk/donate"
                    target="_blank"
                    rel="noreferrer">
                    <ButtonItem className={styles.donate} compact>
                        <Coffee size={20} />
                        <Text id="app.settings.pages.donate.title" />
                    </ButtonItem>
                </a>,
                <LineDivider />,
                <ButtonItem
                    onClick={() => operations.logout()}
                    className={styles.logOut}
                    compact>
                    <LogOut size={20} />
                    <Text id="app.settings.pages.logOut" />
                </ButtonItem>,
                <div className={styles.version}>
                    <div>
                        <span className={styles.revision}>
                            <a
                                href={`${REPO_URL}/${GIT_REVISION}`}
                                target="_blank"
                                rel="noreferrer">
                                {GIT_REVISION.substr(0, 7)}
                            </a>
                            {` `}
                            <a
                                href={
                                    GIT_BRANCH !== "DETACHED"
                                        ? `https://gitlab.insrt.uk/revolt/client/-/tree/${GIT_BRANCH}`
                                        : undefined
                                }
                                target="_blank"
                                rel="noreferrer">
                                ({GIT_BRANCH})
                            </a>
                        </span>
                        <span>
                            {GIT_BRANCH === "production" ? "Stable" : "Nightly"}{" "}
                            {APP_VERSION}
                        </span>
                        <span>
                            API: {client.configuration?.revolt ?? "N/A"}
                        </span>
                        <span>revolt.js: {LIBRARY_VERSION}</span>
                    </div>
                </div>,
            ]}
        />
    );
}
