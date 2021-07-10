/**
 * This file monitors the message cache to delete any queued messages that have already sent.
 */
import { Message } from "revolt.js";

import { useContext, useEffect } from "preact/hooks";

import { dispatch } from "../../redux";
import { connectState } from "../../redux/connector";
import { QueuedMessage } from "../../redux/reducers/queue";
import { Typing } from "../../redux/reducers/typing";

import { AppContext } from "./RevoltClient";

type Props = {
    messages: QueuedMessage[];
    typing: Typing;
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
    }, [props.messages]);

    useEffect(() => {
        function removeOld() {
            if (!props.typing) return;
            for (const channel of Object.keys(props.typing)) {
                const users = props.typing[channel];

                for (const user of users) {
                    if (+new Date() > user.started + 5000) {
                        dispatch({
                            type: "TYPING_STOP",
                            channel,
                            user: user.id,
                        });
                    }
                }
            }
        }

        removeOld();

        const interval = setInterval(removeOld, 1000);
        return () => clearInterval(interval);
    }, [props.typing]);

    return null;
}

export default connectState(StateMonitor, (state) => {
    return {
        messages: [...state.queue],
        typing: state.typing,
    };
});
