import { ListUl } from "@styled-icons/boxicons-regular";
import {
    InfoCircle,
    Group,
    FlagAlt,
    Envelope,
    UserX,
    Trash,
    HappyBeaming,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Route, Switch, useHistory, useParams } from "react-router-dom";

import styles from "./Settings.module.scss";
import { Text } from "preact-i18n";

import { LineDivider } from "@revoltchat/ui";

import { state } from "../../mobx/State";

import ButtonItem from "../../components/navigation/items/ButtonItem";
import { useClient } from "../../controllers/client/ClientController";
import RequiresOnline from "../../controllers/client/jsx/RequiresOnline";
import { modalController } from "../../controllers/modals/ModalController";
import { GenericSettings } from "./GenericSettings";
import { Bans } from "./server/Bans";
import { Categories } from "./server/Categories";
import { Emojis } from "./server/Emojis";
import { Invites } from "./server/Invites";
import { Members } from "./server/Members";
import { Overview } from "./server/Overview";
import { Roles } from "./server/Roles";

export default observer(() => {
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
                    category: <div>{server.name}</div>,
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
                    id: "roles",
                    icon: <FlagAlt size={20} />,
                    title: <Text id="app.settings.server_pages.roles.title" />,
                    hideTitle: true,
                },
                {
                    category: (
                        <Text id="app.settings.server_pages.customisation.title" />
                    ),
                    id: "emojis",
                    icon: <HappyBeaming size={20} />,
                    title: <Text id="app.settings.server_pages.emojis.title" />,
                },
                {
                    category: (
                        <Text id="app.settings.server_pages.management.title" />
                    ),
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
                    <Route path="/server/:server/settings/emojis">
                        <RequiresOnline>
                            <Emojis server={server} />
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
                                modalController.push({
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
