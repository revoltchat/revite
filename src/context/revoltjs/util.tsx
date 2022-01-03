import { Client } from "revolt.js";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Server } from "revolt.js/dist/maps/Servers";

import { Text } from "preact-i18n";

import { Children } from "../../types/Preact";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function takeError(error: any): string {
    const type = error?.response?.data?.type;
    const id = type;
    if (!type) {
        if (
            error?.response?.status === 401 ||
            error?.response?.status === 403
        ) {
            return "Unauthorized";
        } else if (error && !!error.isAxiosError && !error.response) {
            return "NetworkError";
        }

        console.error(error);
        return "UnknownError";
    }

    return id;
}

export function getChannelName(
    channel: Channel,
    prefixType?: boolean,
): Children {
    if (channel.channel_type === "SavedMessages")
        return <Text id="app.navigation.tabs.saved" />;

    if (channel.channel_type === "DirectMessage") {
        return (
            <>
                {prefixType && "@"}
                {channel.recipient!.username}
            </>
        );
    }

    if (channel.channel_type === "TextChannel" && prefixType) {
        return <>#{channel.name}</>;
    }

    return <>{channel.name}</>;
}

// todo: please make a better way to do this
// server.orderedChannels or something
export function serverChannels(server: Server, client: Client) {
    const ids = new Set(server.channel_ids);
    return server?.categories
        ?.flatMap((cat) =>
            cat.channels.map((id) => {
                ids.delete(id);
                return client.channels.get(id);
            }),
        )
        .concat(Array.from(ids, (id) => client.channels.get(id)))
        .filter((ch) => ch !== undefined) as Channel[];
}
