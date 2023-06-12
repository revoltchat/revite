import { UpArrowAlt } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Channel } from "revolt.js";
import { decodeTime } from "ulid";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { internalSubscribe } from "../../../../lib/eventEmitter";
import { getRenderer } from "../../../../lib/renderer/Singleton";

import { dayjs } from "../../../../context/Locale";

import { Bar } from "./JumpToBottom";

export default observer(
    ({ channel, last_id }: { channel: Channel; last_id?: string }) => {
        const [hidden, setHidden] = useState(false);
        const [timeAgo, setTimeAgo] = useState("");
        const hide = () => setHidden(true);

        useEffect(() => setHidden(false), [last_id]);
        useEffect(() => internalSubscribe("NewMessages", "hide", hide), []);
        useEffect(() => {
            const onKeyDown = (e: KeyboardEvent) =>
                e.key === "Escape" && hide();

            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }, []);

        useEffect(() => {
            if (last_id) {
                try {
                    setTimeAgo(dayjs(decodeTime(last_id)).fromNow());
                } catch (err) {}
            }
        }, [last_id]);

        const renderer = getRenderer(channel);
        const history = useHistory();
        if (renderer.state !== "RENDER") return null;
        if (!last_id) return null;
        if (hidden) return null;

        return (
            <Bar position="top" accent>
                <div
                    onClick={() => {
                        setHidden(true);
                        if (channel.channel_type === "TextChannel") {
                            history.push(
                                `/server/${channel.server_id}/channel/${channel._id}/${last_id}`,
                            );
                        } else {
                            history.push(`/channel/${channel._id}/${last_id}`);
                        }
                    }}>
                    <div>
                        <Text
                            id="app.main.channel.misc.new_messages"
                            fields={{
                                time_ago: timeAgo,
                            }}
                        />
                    </div>
                    <div className="right">
                        <span>
                            <Text id="app.main.channel.misc.jump_beginning" />
                        </span>
                        <UpArrowAlt size={20} />
                    </div>
                </div>
            </Bar>
        );
    },
);
