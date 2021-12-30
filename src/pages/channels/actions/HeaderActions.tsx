/* eslint-disable react-hooks/rules-of-hooks */
import { Search } from "@styled-icons/boxicons-regular";
import {
    UserPlus,
    Cog,
    PhoneCall,
    PhoneOff,
    Group,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";

import { internalEmit } from "../../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { voiceState, VoiceStatus } from "../../../lib/vortex/VoiceState";

import { useApplicationState } from "../../../mobx/State";
import { SIDEBAR_MEMBERS } from "../../../mobx/stores/Layout";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import UpdateIndicator from "../../../components/common/UpdateIndicator";
import IconButton from "../../../components/ui/IconButton";

import { ChannelHeaderProps } from "../ChannelHeader";

export default function HeaderActions({ channel }: ChannelHeaderProps) {
    const layout = useApplicationState().layout;
    const { openScreen } = useIntermediate();
    const history = useHistory();

    function openRightSidebar() {
        const panels = document.querySelector("#app > div > div > div");
        panels?.scrollTo({
            behavior: "smooth",
            left: panels.clientWidth * 3,
        });
    }

    function openSidebar() {
        if (isTouchscreenDevice) {
            openRightSidebar();
        } else {
            layout.toggleSectionState(SIDEBAR_MEMBERS, true);
        }
    }

    return (
        <>
            <UpdateIndicator style="channel" />
            {channel.channel_type === "Group" && (
                <>
                    <IconButton
                        onClick={() =>
                            openScreen({
                                id: "user_picker",
                                omit: channel.recipient_ids!,
                                callback: async (users) => {
                                    for (const user of users) {
                                        await channel.addMember(user);
                                    }
                                },
                            })
                        }>
                        <UserPlus size={27} />
                    </IconButton>
                    <IconButton
                        onClick={() =>
                            history.push(`/channel/${channel._id}/settings`)
                        }>
                        <Cog size={24} />
                    </IconButton>
                </>
            )}
            <VoiceActions channel={channel} />
            {channel.channel_type !== "VoiceChannel" && (
                <IconButton
                    onClick={() => {
                        internalEmit("RightSidebar", "open", "search");
                        openRightSidebar();
                    }}>
                    <Search size={25} />
                </IconButton>
            )}
            {(channel.channel_type === "Group" ||
                channel.channel_type === "TextChannel") && (
                <IconButton
                    onClick={() => {
                        internalEmit("RightSidebar", "open", undefined);
                        openRightSidebar();
                    }}>
                    <Group size={25} />
                </IconButton>
            )}
        </>
    );
}

const VoiceActions = observer(
    ({ channel }: Pick<ChannelHeaderProps, "channel">) => {
        if (
            channel.channel_type === "SavedMessages" ||
            channel.channel_type === "TextChannel"
        )
            return null;

        if (voiceState.status >= VoiceStatus.READY) {
            if (voiceState.roomId === channel._id) {
                return (
                    <IconButton onClick={voiceState.disconnect}>
                        <PhoneOff size={22} />
                    </IconButton>
                );
            }

            return (
                <IconButton
                    onClick={async () => {
                        await voiceState.loadVoice();
                        voiceState.disconnect();
                        voiceState.connect(channel);
                    }}>
                    <PhoneCall size={24} />
                </IconButton>
            );
        }

        return (
            <IconButton>
                <PhoneCall size={24} /** ! FIXME: TEMP */ color="red" />
            </IconButton>
        );
    },
);
