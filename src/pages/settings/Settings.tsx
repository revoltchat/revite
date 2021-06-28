import { Text } from "preact-i18n";
import { Sync } from "./panes/Sync";
import { useContext } from "preact/hooks";
import styles from "./Settings.module.scss";
import { LIBRARY_VERSION } from "revolt.js";
import { APP_VERSION } from "../../version";
import { GenericSettings } from "./GenericSettings";
import { Route, useHistory } from "react-router-dom";
import {
    Bell,
    Palette,
    Coffee,
    Globe,
    IdCard,
    LogOut,
    Sync as SyncIcon,
    Shield,
    Vial,
    User
} from "@styled-icons/boxicons-regular";
import { Brush, Megaphone } from "@styled-icons/boxicons-solid";
import { Gitlab } from "@styled-icons/boxicons-logos";
import { GIT_BRANCH, GIT_REVISION, REPO_URL } from "../../revision";
import LineDivider from "../../components/ui/LineDivider";
import RequiresOnline from "../../context/revoltjs/RequiresOnline";
import ButtonItem from "../../components/navigation/items/ButtonItem";
import { AppContext, OperationsContext } from "../../context/revoltjs/RevoltClient";

import { Account } from "./panes/Account";
import { Profile } from "./panes/Profile";
import { Sessions } from "./panes/Sessions";
import { Feedback } from "./panes/Feedback";
import { Languages } from "./panes/Languages";
import { Appearance } from "./panes/Appearance";
import { Notifications } from "./panes/Notifications";
import { ExperimentsPage } from "./panes/Experiments";

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
                    category: <Text id="app.settings.categories.user_settings" />,
                    id: 'account',
                    icon: <User size={20} />,
                    title: <Text id="app.settings.pages.account.title" />
                },
                {
                    id: 'profile',
                    icon: <IdCard size={20} />,
                    title: <Text id="app.settings.pages.profile.title" />
                },
                {
                    id: 'sessions',
                    icon: <Shield size={20} />,
                    title: <Text id="app.settings.pages.sessions.title" />
                },
                {
                    category: <Text id="app.settings.categories.client_settings" />,
                    id: 'appearance',
                    icon: <Palette size={20} />,
                    title: <Text id="app.settings.pages.appearance.title" />
                },
                {
                    id: 'notifications',
                    icon: <Bell size={20} />,
                    title: <Text id="app.settings.pages.notifications.title" />
                },
                {
                    id: 'language',
                    icon: <Globe size={20} />,
                    title: <Text id="app.settings.pages.language.title" />
                },
                {
                    id: 'sync',
                    icon: <SyncIcon size={20} />,
                    title: <Text id="app.settings.pages.sync.title" />
                },
                {
                    divider: true,
                    id: 'experiments',
                    icon: <Vial size={20} />,
                    title: <Text id="app.settings.pages.experiments.title" />
                },
                {
                    id: 'feedback',
                    icon: <Megaphone size={20} />,
                    title: <Text id="app.settings.pages.feedback.title" />
                }
            ]}
            children={[
                <Route path="/settings/profile"><Profile /></Route>,
                <Route path="/settings/sessions">
                    <RequiresOnline><Sessions /></RequiresOnline>
                </Route>,
                <Route path="/settings/appearance"><Appearance /></Route>,
                <Route path="/settings/notifications"><Notifications /></Route>,
                <Route path="/settings/language"><Languages /></Route>,
                <Route path="/settings/sync"><Sync /></Route>,
                <Route path="/settings/experiments"><ExperimentsPage /></Route>,
                <Route path="/settings/feedback"><Feedback /></Route>,
                <Route path="/"><Account /></Route>
            ]}
            defaultPage="account"
            switchPage={switchPage}
            category="pages"
            custom={[
                <a
                    href="https://gitlab.insrt.uk/revolt"
                    target="_blank"
                >
                    <ButtonItem compact>
                        <Gitlab size={20} />
                        <Text id="app.settings.pages.source_code" />
                    </ButtonItem>
                </a>,
                <a href="https://ko-fi.com/insertish" target="_blank">
                    <ButtonItem className={styles.donate} compact>
                        <Coffee size={20} />
                        <Text id="app.settings.pages.donate.title" />
                    </ButtonItem>
                </a>,
                <LineDivider />,
                <ButtonItem
                    onClick={() => operations.logout()}
                    className={styles.logOut}
                    compact
                >
                    <LogOut size={20} />
                    <Text id="app.settings.pages.logOut" />
                </ButtonItem>,
                <div className={styles.version}>
                    <div>
                        <span className={styles.revision}>
                            <a href={`${REPO_URL}/${GIT_REVISION}`} target="_blank">
                                { GIT_REVISION.substr(0, 7) }
                            </a>
                            {` `}
                            <a href={GIT_BRANCH !== 'DETACHED' ? `https://gitlab.insrt.uk/revolt/client/-/tree/${GIT_BRANCH}` : undefined} target="_blank">
                                ({ GIT_BRANCH })
                            </a>
                        </span>
                        <span>{ GIT_BRANCH === 'production' ? 'Stable' : 'Nightly' } {APP_VERSION}</span>
                        <span>API: {client.configuration?.revolt ?? "N/A"}</span>
                        <span>revolt.js: {LIBRARY_VERSION}</span>
                    </div>
                </div>
            ]}
        />
    )
}
