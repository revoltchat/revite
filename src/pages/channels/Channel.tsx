import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { Channel as ChannelI } from "revolt.js/dist/maps/Channels";
import styled from "styled-components";

import { useState } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { dispatch, getState } from "../../redux";

import { useClient } from "../../context/revoltjs/RevoltClient";

import AgeGate from "../../components/common/AgeGate";
import MessageBox from "../../components/common/messaging/MessageBox";
import JumpToBottom from "../../components/common/messaging/bars/JumpToBottom";
import TypingIndicator from "../../components/common/messaging/bars/TypingIndicator";

import RightSidebar from "../../components/navigation/RightSidebar";
import ChannelHeader from "./ChannelHeader";
import { MessageArea } from "./messaging/MessageArea";
import VoiceHeader from "./voice/VoiceHeader";

const ChannelMain = styled.div`
    flex-grow: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
    flex-direction: row;
`;

const ChannelContent = styled.div`
    flex-grow: 1;
    display: flex;
    overflow: hidden;
    flex-direction: column;
`;

export function Channel({ id }: { id: string }) {
    const client = useClient();
    const channel = client.channels.get(id);
    if (!channel) return null;

    if (channel.channel_type === "VoiceChannel") {
        return <VoiceChannel channel={channel} />;
    }

    return <TextChannel channel={channel} />;
}

const MEMBERS_SIDEBAR_KEY = "sidebar_members";
const TextChannel = observer(({ channel }: { channel: ChannelI }) => {
    const [showMembers, setMembers] = useState(
        getState().sectionToggle[MEMBERS_SIDEBAR_KEY] ?? true,
    );

    const id = channel._id;
    return (
        <AgeGate
            type="channel"
            channel={channel}
            gated={
                !!(
                    (channel.channel_type === "TextChannel" ||
                        channel.channel_type === "Group") &&
                    channel.name?.includes("nsfw")
                )
            }>
            <ChannelHeader
                channel={channel}
                toggleSidebar={() => {
                    setMembers(!showMembers);

                    if (showMembers) {
                        dispatch({
                            type: "SECTION_TOGGLE_SET",
                            id: MEMBERS_SIDEBAR_KEY,
                            state: false,
                        });
                    } else {
                        dispatch({
                            type: "SECTION_TOGGLE_UNSET",
                            id: MEMBERS_SIDEBAR_KEY,
                        });
                    }
                }}
            />
            <ChannelMain>
                <ChannelContent>
                    <VoiceHeader id={id} />
                    <MessageArea channel={channel} />
                    <TypingIndicator channel={channel} />
                    <JumpToBottom channel={channel} />
                    <MessageBox channel={channel} />
                </ChannelContent>
                {!isTouchscreenDevice && showMembers && <RightSidebar />}
            </ChannelMain>
        </AgeGate>
    );
});

function VoiceChannel({ channel }: { channel: ChannelI }) {
    return (
        <>
            <ChannelHeader channel={channel} />
            <VoiceHeader id={channel._id} />
        </>
    );
}

export default function ChannelComponent() {
    const { channel } = useParams<{ channel: string }>();
    return <Channel id={channel} key={channel} />;
}
