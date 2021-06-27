import { Text } from "preact-i18n";
import Category from "../../components/ui/Category";
import { GenericSettings } from "./GenericSettings";
import { useServer } from "../../context/revoltjs/hooks";
import { Route, useHistory, useParams } from "react-router-dom";
import { ListUl, Share, Group } from "@styled-icons/boxicons-regular";
import { XSquare } from "@styled-icons/boxicons-solid";
import RequiresOnline from "../../context/revoltjs/RequiresOnline";

import { Overview } from "./server/Overview";
import { Members } from "./server/Members";
import { Invites } from "./server/Invites";
import { Bans } from "./server/Bans";

export default function ServerSettings() {
    const { server: sid } = useParams<{ server: string; }>();
    const server = useServer(sid);
    if (!server) return null;

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
                    id: 'overview',
                    icon: <ListUl size={20} />,
                    title: <Text id="app.settings.channel_pages.overview.title" />
                },
                {
                    id: 'members',
                    icon: <Group size={20} />,
                    title: "Members"
                },
                {
                    id: 'invites',
                    icon: <Share size={20} />,
                    title: "Invites"
                },
                {
                    id: 'bans',
                    icon: <XSquare size={20} />,
                    title: "Bans"
                }
            ]}
            children={[
                <Route path="/server/:server/settings/members"><RequiresOnline><Members server={server} /></RequiresOnline></Route>,
                <Route path="/server/:server/settings/invites"><RequiresOnline><Invites server={server} /></RequiresOnline></Route>,
                <Route path="/server/:server/settings/bans"><RequiresOnline><Bans server={server} /></RequiresOnline></Route>,
                <Route path="/"><Overview server={server} /></Route>
            ]}
            category="server_pages"
            switchPage={switchPage}
            defaultPage="overview"
            showExitButton
        />
    )
}
