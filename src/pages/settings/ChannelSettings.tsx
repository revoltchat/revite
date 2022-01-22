import { ListUl } from "@styled-icons/boxicons-regular";
import { InfoCircle } from "@styled-icons/boxicons-solid";
import { Route, Switch, useHistory, useParams } from "react-router-dom";

import { Text } from "preact-i18n";

import { Category } from "@revoltchat/ui/lib/components/atoms/layout/Category";

import { useClient } from "../../context/revoltjs/RevoltClient";
import { getChannelName } from "../../context/revoltjs/util";

import { GenericSettings } from "./GenericSettings";
import Overview from "./channel/Overview";
import Permissions from "./channel/Permissions";

export default function ChannelSettings() {
    const { channel: cid } = useParams<{ channel: string }>();

    const client = useClient();
    const history = useHistory();
    const channel = client.channels.get(cid);

    if (!channel) return null;
    if (
        channel.channel_type === "SavedMessages" ||
        channel.channel_type === "DirectMessage"
    )
        return null;

    function switchPage(to?: string) {
        let base_url;
        switch (channel?.channel_type) {
            case "TextChannel":
            case "VoiceChannel":
                base_url = `/server/${channel.server_id}/channel/${cid}/settings`;
                break;
            default:
                base_url = `/channel/${cid}/settings`;
        }

        if (to) {
            history.replace(`${base_url}/${to}`);
        } else {
            history.replace(base_url);
        }
    }

    return (
        <GenericSettings
            pages={[
                {
                    category: <div>{getChannelName(channel, true)}</div>,
                    id: "overview",
                    icon: <InfoCircle size={20} />,
                    title: (
                        <Text id="app.settings.channel_pages.overview.title" />
                    ),
                },
                {
                    id: "permissions",
                    icon: <ListUl size={20} />,
                    title: (
                        <Text id="app.settings.channel_pages.permissions.title" />
                    ),
                },
            ]}
            children={
                <Switch>
                    <Route path="/server/:server/channel/:channel/settings/permissions">
                        <Permissions channel={channel} />
                    </Route>
                    <Route path="/channel/:channel/settings/permissions">
                        <Permissions channel={channel} />
                    </Route>

                    <Route>
                        <Overview channel={channel} />
                    </Route>
                </Switch>
            }
            category="channel_pages"
            switchPage={switchPage}
            defaultPage="overview"
            showExitButton
        />
    );
}
