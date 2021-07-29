import { Client } from "revolt.js";
import { Message } from "revolt.js/dist/api/objects";

import { Text } from "preact-i18n";

import { Channel } from "../../mobx";

import { Children } from "../../types/Preact";

export function takeError(error: any): string {
    const type = error?.response?.data?.type;
    const id = type;
    if (!type) {
        if (error?.response?.status === 403) {
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
    client: Client,
    channel: Channel,
    prefixType?: boolean,
): Children {
    if (channel.channel_type === "SavedMessages")
        return <Text id="app.navigation.tabs.saved" />;

    if (channel.channel_type === "DirectMessage") {
        const uid = client.channels.getRecipient(channel._id);
        return (
            <>
                {prefixType && "@"}
                {client.users.get(uid)?.username}
            </>
        );
    }

    if (channel.channel_type === "TextChannel" && prefixType) {
        return <>#{channel.name}</>;
    }

    return <>{channel.name}</>;
}

export type MessageObject = Omit<Message, "edited"> & { edited?: string };
export function mapMessage(message: Partial<Message>) {
    const { edited, ...msg } = message;
    return {
        ...msg,
        edited: edited?.$date,
    } as MessageObject;
}
