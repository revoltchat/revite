import { Channel } from "revolt.js";

import { Text } from "preact-i18n";

import { Children } from "../../types/Preact";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function takeError(error: any): string {
    if (error.response) {
        const status = error.response.status;
        switch (status) {
            case 429:
                return "TooManyRequests";
            case 401:
            case 403:
                return "Unauthorized";
            default:
                return error.response.type ?? "UnknownError";
        }
    } else if (error.request) {
        return "NetworkError";
    }

    console.error(error);
    return "UnknownError";
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
