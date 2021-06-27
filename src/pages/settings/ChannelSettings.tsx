import { Text } from "preact-i18n";
import { ListUl } from "@styled-icons/boxicons-regular";
import Category from "../../components/ui/Category";
import { GenericSettings } from "./GenericSettings";
import { getChannelName } from "../../context/revoltjs/util";
import { Route, useHistory, useParams } from "react-router-dom";
import { useChannel, useForceUpdate } from "../../context/revoltjs/hooks";

import { Overview } from "./channel/Overview";

export default function ChannelSettings() {
    const { channel: cid } = useParams<{ channel: string; }>();
    const ctx = useForceUpdate();
    const channel = useChannel(cid, ctx);
    if (!channel) return null;
    if (channel.channel_type === 'SavedMessages' || channel.channel_type === 'DirectMessage') return null;

    const history = useHistory();
    function switchPage(to?: string) {
        if (to) {
            history.replace(`/channel/${cid}/settings/${to}`);
        } else {
            history.replace(`/channel/${cid}/settings`);
        }
    }

    return (
        <GenericSettings
            pages={[
                {
                    category: <Category variant="uniform" text={getChannelName(ctx.client, channel, true)} />,
                    id: 'overview',
                    icon: <ListUl size={20} />,
                    title: <Text id="app.settings.channel_pages.overview.title" />
                }
            ]}
            children={[
                <Route path="/"><Overview channel={channel} /></Route>
            ]}
            category="channel_pages"
            switchPage={switchPage}
            defaultPage="overview"
            showExitButton
        />
    )
}
