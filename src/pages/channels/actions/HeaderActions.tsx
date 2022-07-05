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
import styled, { css } from "styled-components/macro";

import { IconButton } from "@revoltchat/ui";

import { chainedDefer, defer } from "../../../lib/defer";
import { internalEmit } from "../../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { voiceState, VoiceStatus } from "../../../lib/vortex/VoiceState";

import { useApplicationState } from "../../../mobx/State";
import { SIDEBAR_MEMBERS } from "../../../mobx/stores/Layout";

import UpdateIndicator from "../../../components/common/UpdateIndicator";
import { modalController } from "../../../controllers/modals/ModalController";
import { ChannelHeaderProps } from "../ChannelHeader";

const Container = styled.div`
    display: flex;
    gap: 16px;
`;

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    background: var(--primary-background);
    border-radius: 4px;
    position: relative;
    width: 120px;
    transition: width .25s ease;

    :focus-within {
        width: 200px;
        box-shadow: 0 0 0 1pt var(--accent);
    }

    input {
        all: unset;
        font-size: 13px;
        padding: 0 8px;
        font-weight: 400;
        height: 100%;
        width: 100%;
        }
    }

    .actions {
        display: flex;
        align-items: center;
        position: absolute;
        right: 0;
        padding: 0 8px;
        pointer-events: none;
        background: inherit;

        svg {
            opacity: 0.4;
            color: var(--foreground);
        }
    }
`;

export default function HeaderActions({ channel }: ChannelHeaderProps) {
    const layout = useApplicationState().layout;
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
            <Container>
                <UpdateIndicator style="channel" />
                {channel.channel_type === "Group" && (
                    <>
                        <IconButton
                            onClick={() =>
                                modalController.push({
                                    type: "user_picker",
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
                {(channel.channel_type === "Group" ||
                    channel.channel_type === "TextChannel") && (
                    <IconButton onClick={openMembers}>
                        <Group size={25} />
                    </IconButton>
                )}
                {channel.channel_type !== "VoiceChannel" && (
                    /*<SearchBar>
                        <input
                            type="text"
                            placeholder="Search..."
                            onClick={openSearch}
                        />
                        <div className="actions">
                            <Search size={18} />
                        </div>
                    </SearchBar>*/
                    <IconButton onClick={openSearch}>
                        <Search size={25} />
                    </IconButton>
                )}
            </Container>
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
