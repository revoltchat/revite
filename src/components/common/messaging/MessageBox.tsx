import { useContext } from "preact/hooks";
import { Channel } from "revolt.js";
import { ulid } from "ulid";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { takeError } from "../../../context/revoltjs/util";
import { defer } from "../../../lib/defer";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { SingletonMessageRenderer, SMOOTH_SCROLL_ON_RECEIVE } from "../../../lib/renderer/Singleton";
import { connectState } from "../../../redux/connector";
import { WithDispatcher } from "../../../redux/reducers";
import TextArea from "../../ui/TextArea";

type Props = WithDispatcher & {
    channel: Channel;
    draft?: string;
};

function MessageBox({ channel, draft, dispatcher }: Props) {
    const client = useContext(AppContext);

    function setMessage(content?: string) {
        if (content) {
            dispatcher({
                type: "SET_DRAFT",
                channel: channel._id,
                content
            });
        } else {
            dispatcher({
                type: "CLEAR_DRAFT",
                channel: channel._id
            });
        }
    }

    async function send() {
        const nonce = ulid();

        const content = draft?.trim() ?? '';
        if (content.length === 0) return;

        setMessage();
        dispatcher({
            type: "QUEUE_ADD",
            nonce,
            channel: channel._id,
            message: {
                _id: nonce,
                channel: channel._id,
                author: client.user!._id,
                content
            }
        });

        defer(() => SingletonMessageRenderer.jumpToBottom(channel._id, SMOOTH_SCROLL_ON_RECEIVE));
        // Sounds.playOutbound();

        try {
            await client.channels.sendMessage(channel._id, {
                content,
                nonce
            });
        } catch (error) {
            dispatcher({
                type: "QUEUE_FAIL",
                error: takeError(error),
                nonce
            });
        }
    }

    return (
        <TextArea
            value={draft}
            onKeyDown={e => {
                if (!e.shiftKey && e.key === "Enter" && !isTouchscreenDevice) {
                    e.preventDefault();
                    return send();
                }
            }}
            onChange={e => setMessage(e.currentTarget.value)} />
    )
}

export default connectState<Omit<Props, "dispatcher" | "draft">>(MessageBox, (state, { channel }) => {
    return {
        draft: state.drafts[channel._id]
    }
}, true)
