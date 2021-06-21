/**
 * This file monitors the message cache to delete any queued messages that have already sent.
 */

import { Message } from "revolt.js";
import { AppContext } from "./RevoltClient";
import { Typing } from "../../redux/reducers/typing";
import { useContext, useEffect } from "preact/hooks";
import { connectState } from "../../redux/connector";
import { WithDispatcher } from "../../redux/reducers";
import { QueuedMessage } from "../../redux/reducers/queue";

type Props = WithDispatcher & {
    messages: QueuedMessage[];
    typing: Typing
};

function StateMonitor(props: Props) {
    const client = useContext(AppContext);

    useEffect(() => {
        props.dispatcher({
            type: 'QUEUE_DROP_ALL'
        });
    }, [ ]);

    useEffect(() => {
        function add(msg: Message) {
            if (!msg.nonce) return;
            if (!props.messages.find(x => x.id === msg.nonce)) return;

            props.dispatcher({
                type: 'QUEUE_REMOVE',
                nonce: msg.nonce
            });
        }

        client.addListener('message', add);
        return () => client.removeListener('message', add);
    }, [ props.messages ]);

    useEffect(() => {
        function removeOld() {
            if (!props.typing) return;
            for (let channel of Object.keys(props.typing)) {
                let users = props.typing[channel];

                for (let user of users) {
                    if (+ new Date() > user.started + 5000) {
                        props.dispatcher({
                            type: 'TYPING_STOP',
                            channel,
                            user: user.id
                        });
                    }
                }
            }
        }

        removeOld();

        let interval = setInterval(removeOld, 1000);
        return () => clearInterval(interval);
    }, [ props.typing ]);

    return <></>;
}

export default connectState(
    StateMonitor,
    state => {
        return {
            messages: [...state.queue],
            typing: state.typing
        };
    },
    true
);
