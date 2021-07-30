import { ListCheck, ListUl } from "@styled-icons/boxicons-regular";
import { Route, useHistory, useParams } from "react-router-dom";

import { Text } from "preact-i18n";

import { useClient } from "../../context/revoltjs/RevoltClient";
import { getChannelName } from "../../context/revoltjs/util";

import Category from "../../components/ui/Category";

import { GenericSettings } from "./GenericSettings";
import Overview from "./channel/Overview";
import Permissions from "./channel/Permissions";

export default function ChannelSettings() {
    const { channel: cid } = useParams<{ channel: string }>();

    const client = useClient();
    const channel = client.channels.get(cid);
    if (!channel) return null;
    if (
        channel.channel_type === "SavedMessages" ||
        channel.channel_type === "DirectMessage"
    )
        return null;

    const history = useHistory();
    function switchPage(to?: string) {
        let base_url;
        switch (channel?.channel_type) {
            case "TextChannel":
            case "VoiceChannel":
                base_url = `/server/${channel.server}/channel/${cid}/settings`;
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
                    category: (
                        <Category
                            variant="uniform"
                            text={getChannelName(channel, true)}
                        />
                    ),
                    id: "overview",
                    icon: <ListUl size={20} />,
                    title: (
                        <Text id="app.settings.channel_pages.overview.title" />
                    ),
                },
                {
                    id: "permissions",
                    icon: <ListCheck size={20} />,
                    title: (
                        <Text id="app.settings.channel_pages.permissions.title" />
                    ),
                },
            ]}
            children={[
                <Route path="/server/:server/channel/:channel/settings/permissions">
                    <Permissions channel={channel} />
                </Route>,
                <Route path="/channel/:channel/settings/permissions">
                    <Permissions channel={channel} />
                </Route>,

                <Route path="/">
                    <Overview channel={channel} />
                </Route>,
            ]}
            category="channel_pages"
            switchPage={switchPage}
            defaultPage="overview"
            showExitButton
        />
    );
}
