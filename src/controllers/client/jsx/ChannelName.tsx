// ! This should be moved into @revoltchat/ui
import { Channel } from "revolt.js";

import { Text } from "preact-i18n";

interface Props {
    channel?: Channel;
    prefix?: boolean;
}

/**
 * Channel display name
 */
export function ChannelName({ channel, prefix }: Props) {
    if (!channel) return <></>;

    if (channel.channel_type === "SavedMessages")
        return <Text id="app.navigation.tabs.saved" />;

    if (channel.channel_type === "DirectMessage") {
        return (
            <>
                {prefix && "@"}
                {channel.recipient!.username}
            </>
        );
    }

    if (channel.channel_type === "TextChannel" && prefix) {
        return <>{`#${channel.name}`}</>;
    }

    return <>{channel.name}</>;
}
