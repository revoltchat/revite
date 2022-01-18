import { UpArrowAlt } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Channel } from "revolt.js/dist/maps/Channels";
import { decodeTime } from "ulid";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { internalSubscribe } from "../../../../lib/eventEmitter";
import { getRenderer } from "../../../../lib/renderer/Singleton";

import { useApplicationState } from "../../../../mobx/State";
import { KeybindAction } from "../../../../mobx/stores/Keybinds";

import { dayjs } from "../../../../context/Locale";

import { Bar } from "./JumpToBottom";

export default observer(
    ({ channel, last_id }: { channel: Channel; last_id?: string }) => {
        const keybinds = useApplicationState().keybinds;
        const [hidden, setHidden] = useState(false);
        const hide = () => setHidden(true);

        useEffect(() => setHidden(false), [last_id]);
        useEffect(() => internalSubscribe("NewMessages", "hide", hide), []);

        keybinds.useAction(
            KeybindAction.MessagingMarkChannelRead,
            (e) => hide(),
            [],
        );

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
                                time_ago: dayjs(decodeTime(last_id)).fromNow(),
                            }}
                        />
                    </div>
                    <div>
                        <Text id="app.main.channel.misc.jump_beginning" />
                        <UpArrowAlt size={20} />
                    </div>
                </div>
            </Bar>
        );
    },
);
