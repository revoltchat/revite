import { UpArrowAlt } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Channel } from "revolt.js/dist/maps/Channels";
import { decodeTime } from "ulid";

import { useEffect, useState } from "preact/hooks";

import { internalSubscribe } from "../../../../lib/eventEmitter";
import { getRenderer } from "../../../../lib/renderer/Singleton";

import { dayjs } from "../../../../context/Locale";

import { Bar } from "./JumpToBottom";

export default observer(
    ({ channel, last_id }: { channel: Channel; last_id?: string }) => {
        const [hidden, setHidden] = useState(false);
        const hide = () => setHidden(true);

        useEffect(() => setHidden(false), [last_id]);
        useEffect(() => internalSubscribe("NewMessages", "hide", hide), []);
        useEffect(() => {
            const onKeyDown = (e: KeyboardEvent) =>
                e.key === "Escape" && hide();

            document.addEventListener("keydown", onKeyDown);
            return () => document.removeEventListener("keydown", onKeyDown);
        }, []);

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
                        New messages since{" "}
                        {dayjs(decodeTime(last_id)).fromNow()}
                    </div>
                    <div>
                        Click to jump to start. <UpArrowAlt size={20} />
                    </div>
                </div>
            </Bar>
        );
    },
);
