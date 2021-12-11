import { Github } from "@styled-icons/boxicons-logos";
import {
    Sync as SyncIcon,
    Globe,
    LogOut,
    Desktop,
    Bot,
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
    Speaker,
    Store,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Route, Switch, useHistory } from "react-router-dom";
import { LIBRARY_VERSION } from "revolt.js";

import styles from "./Settings.module.scss";
import { Text } from "preact-i18n";
import { useContext } from "preact/hooks";

import { useApplicationState } from "../../mobx/State";

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
import { Audio } from "./panes/Audio";
import { ExperimentsPage } from "./panes/Experiments";
import { Feedback } from "./panes/Feedback";
import { Languages } from "./panes/Languages";
import { MyBots } from "./panes/MyBots";
import { Native } from "./panes/Native";
import { Notifications } from "./panes/Notifications";
import { Profile } from "./panes/Profile";
import { Sessions } from "./panes/Sessions";
import { Sync } from "./panes/Sync";
import { ThemeShop } from "./panes/ThemeShop";

export default observer(() => {
    const history = useHistory();
    const client = useContext(AppContext);
    const operations = useContext(OperationsContext);
    const experiments = useApplicationState().experiments;

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
                    id: "audio",
                    icon: <Speaker size={20} />,
                    title: <Text id="app.settings.pages.audio.title" />,
                },
                {
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
                    hidden: !window.isNative,
                    icon: <Desktop size={20} />,
                    title: <Text id="app.settings.pages.native.title" />,
                },
                {
                    id: "experiments",
                    icon: <Flask size={20} />,
                    title: <Text id="app.settings.pages.experiments.title" />,
                },
                {
                    divider: !experiments.isEnabled("theme_shop"),
                    category: "revolt",
                    id: "bots",
                    icon: <Bot size={20} />,
                    title: <Text id="app.settings.pages.bots.title" />,
                },
                {
                    hidden: !experiments.isEnabled("theme_shop"),
                    divider: true,
                    id: "theme_shop",
                    icon: <Store size={20} />,
                    title: <Text id="app.settings.pages.theme_shop.title" />,
                },
                {
                    id: "feedback",
                    icon: <Megaphone size={20} />,
                    title: <Text id="app.settings.pages.feedback.title" />,
                },
            ]}
            children={
                <Switch>
                    <Route path="/settings/profile">
                        <Profile />
                    </Route>
                    <Route path="/settings/sessions">
                        <RequiresOnline>
                            <Sessions />
                        </RequiresOnline>
                    </Route>
                    <Route path="/settings/appearance">
                        <Appearance />
                    </Route>
                    <Route path="/settings/audio">
                        <Audio />
                    </Route>
                    <Route path="/settings/notifications">
                        <Notifications />
                    </Route>
                    <Route path="/settings/language">
                        <Languages />
                    </Route>
                    <Route path="/settings/sync">
                        <Sync />
                    </Route>
                    <Route path="/settings/native">
                        <Native />
                    </Route>
                    <Route path="/settings/experiments">
                        <ExperimentsPage />
                    </Route>
                    <Route path="/settings/bots">
                        <MyBots />
                    </Route>
                    {experiments.isEnabled("theme_shop") && (
                        <Route path="/settings/theme_shop">
                            <ThemeShop />
                        </Route>
                    )}
                    <Route path="/settings/feedback">
                        <Feedback />
                    </Route>
                    <Route path="/">
                        <Account />
                    </Route>
                </Switch>
            }
            defaultPage="account"
            switchPage={switchPage}
            category="pages"
            custom={
                <>
                    <a
                        href="https://github.com/revoltchat"
                        target="_blank"
                        rel="noreferrer">
                        <ButtonItem compact>
                            <Github size={20} />
                            <Text id="app.settings.pages.source_code" />
                        </ButtonItem>
                    </a>
                    <a
                        href="https://insrt.uk/donate"
                        target="_blank"
                        rel="noreferrer">
                        <ButtonItem className={styles.donate} compact>
                            <Coffee size={20} />
                            <Text id="app.settings.pages.donate.title" />
                        </ButtonItem>
                    </a>
                    <LineDivider />
                    <ButtonItem
                        onClick={() => operations.logout()}
                        className={styles.logOut}
                        compact>
                        <LogOut size={20} />
                        <Text id="app.settings.pages.logOut" />
                    </ButtonItem>
                    <div className={styles.version}>
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
                                        ? `https://github.com/revoltchat/revite/tree/${GIT_BRANCH}`
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
                        {window.isNative && (
                            <span>Native: {window.nativeVersion}</span>
                        )}
                        <span>
                            API: {client.configuration?.revolt ?? "N/A"}
                        </span>
                        <span>revolt.js: {LIBRARY_VERSION}</span>
                    </div>
                </>
            }
        />
    );
});
