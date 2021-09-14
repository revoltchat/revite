import { reaction } from "mobx";
import { Channel } from "revolt.js/dist/maps/Channels";

import { useLayoutEffect } from "preact/hooks";

import { dispatch } from "../../../redux";
import { Unreads } from "../../../redux/reducers/unreads";

type UnreadProps = {
    channel: Channel;
    unreads: Unreads;
};

export function useUnreads({ channel, unreads }: UnreadProps) {
    useLayoutEffect(() => {
        function checkUnread(target: Channel) {
            if (!target) return;
            if (target._id !== channel._id) return;
            if (
                target.channel_type === "SavedMessages" ||
                target.channel_type === "VoiceChannel"
            )
                return;

            const unread = unreads[channel._id]?.last_id;
            if (target.last_message) {
                const message =
                    typeof target.last_message === "string"
                        ? target.last_message
                        : target.last_message._id;
                if (!unread || (unread && message.localeCompare(unread) > 0)) {
                    dispatch({
                        type: "UNREADS_MARK_READ",
                        channel: channel._id,
                        message,
                    });

                    channel.ack(message);
                }
            }
        }

        checkUnread(channel);
        return reaction(
            () => channel.last_message,
            () => checkUnread(channel),
        );
    }, [channel, unreads]);
}

export function mapChannelWithUnread(channel: Channel, unreads: Unreads) {
    const last_message_id = channel.last_message_id;

    let unread: "mention" | "unread" | undefined;
    let alertCount: undefined | number;
    if (last_message_id && unreads) {
        const u = unreads[channel._id];
        if (u) {
            if (u.mentions && u.mentions.length > 0) {
                alertCount = u.mentions.length;
                unread = "mention";
            } else if (
                u.last_id &&
                (last_message_id as string).localeCompare(u.last_id) > 0
            ) {
                unread = "unread";
            }
        } else {
            unread = "unread";
        }
    }

    return {
        channel,
        timestamp: last_message_id ?? channel._id,
        unread,
        alertCount,
    };
}
