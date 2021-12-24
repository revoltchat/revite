import { UpArrowAlt } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Channel } from "revolt.js/dist/maps/Channels";
import { decodeTime } from "ulid";

import { getRenderer } from "../../../../lib/renderer/Singleton";

import { dayjs } from "../../../../context/Locale";

import { Bar } from "./JumpToBottom";

export default observer(
    ({ channel, last_id }: { channel: Channel; last_id?: string }) => {
        const renderer = getRenderer(channel);
        const history = useHistory();
        if (renderer.state !== "RENDER") return null;
        if (!last_id) return null;

        return (
            <>
                <Bar position="top" accent>
                    <div
                        onClick={() => {
                            if (channel.channel_type === "TextChannel") {
                                history.push(
                                    `/server/${channel.server_id}/channel/${channel._id}/${last_id}`,
                                );
                            } else {
                                history.push(
                                    `/channel/${channel._id}/${last_id}`,
                                );
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
            </>
        );
    },
);
