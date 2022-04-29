/**
 * This file monitors the message cache to delete any queued messages that have already sent.
 */
import { Message } from "revolt.js";

import { useContext, useEffect } from "preact/hooks";

import { useApplicationState } from "../../mobx/State";

import { setGlobalEmojiPack } from "../../components/common/Emoji";

import { AppContext } from "./RevoltClient";

export default function StateMonitor() {
    const client = useContext(AppContext);
    const state = useApplicationState();

    useEffect(() => {
        function add(msg: Message) {
            if (!msg.nonce) return;
            if (
                !state.queue.get(msg.channel_id).find((x) => x.id === msg.nonce)
            )
                return;
            state.queue.remove(msg.nonce);
        }

        client.addListener("message", add);
        return () => client.removeListener("message", add);
    }, [client]);

    // Set global emoji pack.
    useEffect(() => {
        const v = state.settings.get("appearance:emoji");
        v && setGlobalEmojiPack(v);
    }, [state.settings.get("appearance:emoji")]);

    return null;
}
