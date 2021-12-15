/**
 * This file monitors the message cache to delete any queued messages that have already sent.
 */
import { Message } from "revolt.js/dist/maps/Messages";

import { useContext, useEffect } from "preact/hooks";

import { useApplicationState } from "../../mobx/State";
import { connectState } from "../../redux/connector";
import { QueuedMessage } from "../../redux/reducers/queue";

import { setGlobalEmojiPack } from "../../components/common/Emoji";

import { AppContext } from "./RevoltClient";

type Props = {
    messages: QueuedMessage[];
};

function StateMonitor(props: Props) {
    const client = useContext(AppContext);
    const state = useApplicationState();

    useEffect(() => {
        function add(msg: Message) {
            if (!msg.nonce) return;
            if (!props.messages.find((x) => x.id === msg.nonce)) return;
            state.queue.remove(msg.nonce);
        }

        client.addListener("message", add);
        return () => client.removeListener("message", add);
    }, [client, props.messages]);

    // Set global emoji pack.
    useEffect(() => {
        const v = state.settings.get("appearance:emoji");
        v && setGlobalEmojiPack(v);
    }, [state.settings.get("appearance:emoji")]);

    return null;
}

export default connectState(StateMonitor, (state) => {
    return {
        messages: [...state.queue],
    };
});
