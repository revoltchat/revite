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

import { chainedDefer, defer } from "../../../lib/defer";
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

    function slideOpen() {
        if (!isTouchscreenDevice) return;
        const panels = document.querySelector("#app > div > div > div");
        panels?.scrollTo({
            behavior: "smooth",
            left: panels.clientWidth * 3,
        });
    }

    function openSearch() {
        if (
            !isTouchscreenDevice &&
            !layout.getSectionState(SIDEBAR_MEMBERS, true)
        ) {
            layout.toggleSectionState(SIDEBAR_MEMBERS, true);
        }

        slideOpen();
        chainedDefer(() => internalEmit("RightSidebar", "open", "search"));
    }

    function openMembers() {
        if (!isTouchscreenDevice) {
            layout.toggleSectionState(SIDEBAR_MEMBERS, true);
        }

        slideOpen();
        chainedDefer(() => internalEmit("RightSidebar", "open", undefined));
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
                <IconButton onClick={openSearch}>
                    <Search size={25} />
                </IconButton>
            )}
            {(channel.channel_type === "Group" ||
                channel.channel_type === "TextChannel") && (
                <IconButton onClick={openMembers}>
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
