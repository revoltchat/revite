import { ListUl } from "@styled-icons/boxicons-regular";
import {
    InfoCircle,
    Group,
    FlagAlt,
    Envelope,
    UserX,
    Trash,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Route, Switch, useHistory, useParams } from "react-router-dom";

import styles from "./Settings.module.scss";
import { Text } from "preact-i18n";

import { useIntermediate } from "../../context/intermediate/Intermediate";
import RequiresOnline from "../../context/revoltjs/RequiresOnline";
import { useClient } from "../../context/revoltjs/RevoltClient";

import Category from "../../components/ui/Category";
import LineDivider from "../../components/ui/LineDivider";

import ButtonItem from "../../components/navigation/items/ButtonItem";
import { GenericSettings } from "./GenericSettings";
import { Bans } from "./server/Bans";
import { Categories } from "./server/Categories";
import { Invites } from "./server/Invites";
import { Members } from "./server/Members";
import { Overview } from "./server/Overview";
import { Roles } from "./server/Roles";

export default observer(() => {
    const { openScreen } = useIntermediate();
    const { server: sid } = useParams<{ server: string }>();
    const client = useClient();
    const server = client.servers.get(sid);
    if (!server) return null;

    const owner = server.owner === client.user?._id;
    const history = useHistory();
    function switchPage(to?: string) {
        if (to) {
            history.replace(`/server/${sid}/settings/${to}`);
        } else {
            history.replace(`/server/${sid}/settings`);
        }
    }

    return (
        <GenericSettings
            pages={[
                {
                    category: <Category variant="uniform" text={server.name} />,
                    id: "overview",
                    icon: <InfoCircle size={20} />,
                    title: (
                        <Text id="app.settings.server_pages.overview.title" />
                    ),
                },
                {
                    id: "categories",
                    icon: <ListUl size={20} />,
                    title: (
                        <Text id="app.settings.server_pages.categories.title" />
                    ),
                    hideTitle: true,
                },
                {
                    id: "members",
                    icon: <Group size={20} />,
                    title: (
                        <Text id="app.settings.server_pages.members.title" />
                    ),
                },
                {
                    id: "invites",
                    icon: <Envelope size={20} />,
                    title: (
                        <Text id="app.settings.server_pages.invites.title" />
                    ),
                },
                {
                    id: "bans",
                    icon: <UserX size={20} />,
                    title: <Text id="app.settings.server_pages.bans.title" />,
                },
                {
                    id: "roles",
                    icon: <FlagAlt size={20} />,
                    title: <Text id="app.settings.server_pages.roles.title" />,
                    hideTitle: true,
                },
            ]}
            children={
                <Switch>
                    <Route path="/server/:server/settings/categories">
                        <Categories server={server} />
                    </Route>
                    <Route path="/server/:server/settings/members">
                        <RequiresOnline>
                            <Members server={server} />
                        </RequiresOnline>
                    </Route>
                    <Route path="/server/:server/settings/invites">
                        <RequiresOnline>
                            <Invites server={server} />
                        </RequiresOnline>
                    </Route>
                    <Route path="/server/:server/settings/bans">
                        <RequiresOnline>
                            <Bans server={server} />
                        </RequiresOnline>
                    </Route>
                    <Route path="/server/:server/settings/roles">
                        <RequiresOnline>
                            <Roles server={server} />
                        </RequiresOnline>
                    </Route>
                    <Route>
                        <Overview server={server} />
                    </Route>
                </Switch>
            }
            category="server_pages"
            switchPage={switchPage}
            defaultPage="overview"
            custom={
                owner ? (
                    <>
                        <LineDivider />
                        <ButtonItem
                            onClick={() =>
                                openScreen({
                                    id: "special_prompt",
                                    type: "delete_server",
                                    target: server,
                                })
                            }
                            className={styles.deleteServer}
                            compact>
                            <Trash size={20} />
                            <Text id="app.context_menu.delete_server" />
                        </ButtonItem>
                    </>
                ) : undefined
            }
            showExitButton
        />
    );
});
