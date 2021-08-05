/**
 * This file monitors the message cache to delete any queued messages that have already sent.
 */
import { Message } from "revolt.js/dist/maps/Messages";

import { useContext, useEffect } from "preact/hooks";

import { dispatch } from "../../redux";
import { connectState } from "../../redux/connector";
import { QueuedMessage } from "../../redux/reducers/queue";

import { AppContext } from "./RevoltClient";

type Props = {
    messages: QueuedMessage[];
};

function StateMonitor(props: Props) {
    const client = useContext(AppContext);

    useEffect(() => {
        dispatch({
            type: "QUEUE_DROP_ALL",
        });
    }, []);

    useEffect(() => {
        function add(msg: Message) {
            if (!msg.nonce) return;
            if (!props.messages.find((x) => x.id === msg.nonce)) return;

            dispatch({
                type: "QUEUE_REMOVE",
                nonce: msg.nonce,
            });
        }

        client.addListener("message", add);
        return () => client.removeListener("message", add);
    }, [client, props.messages]);

    return null;
}

export default connectState(StateMonitor, (state) => {
    return {
        messages: [...state.queue],
    };
});
