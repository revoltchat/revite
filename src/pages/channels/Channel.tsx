import { useParams, useHistory } from "react-router-dom";
import { Channels } from "revolt.js/dist/api/objects";
import styled from "styled-components";

import { useState } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { dispatch, getState } from "../../redux";

import { useChannel, useForceUpdate } from "../../context/revoltjs/hooks";

import MessageBox from "../../components/common/messaging/MessageBox";
import JumpToBottom from "../../components/common/messaging/bars/JumpToBottom";
import TypingIndicator from "../../components/common/messaging/bars/TypingIndicator";
import AgeGate from "../../components/common/AgeGate";

import MemberSidebar from "../../components/navigation/right/MemberSidebar";
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
    const ctx = useForceUpdate();
    const channel = useChannel(id, ctx);

    if (!channel) return null;

    if (channel.channel_type === "VoiceChannel") {
        return <VoiceChannel channel={channel} />;
    } else {
        return <TextChannel channel={channel} />;
    }
}

const MEMBERS_SIDEBAR_KEY = "sidebar_members";
function TextChannel({ channel }: { channel: Channels.Channel }) {
    const [showMembers, setMembers] = useState(
        getState().sectionToggle[MEMBERS_SIDEBAR_KEY] ?? true,
    );

    let id = channel._id;
    return (
        <AgeGate
            type="channel"
            channel={channel}
            gated={(channel.channel_type === "TextChannel" ||
                channel.channel_type === "Group") &&
                channel.name.includes("nsfw")}>
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
                    <MessageArea id={id} />
                    <TypingIndicator id={id} />
                    <JumpToBottom id={id} />
                    <MessageBox channel={channel} />
                </ChannelContent>
                {!isTouchscreenDevice && showMembers && (
                    <MemberSidebar channel={channel} />
                )}
            </ChannelMain>
        </AgeGate>
    );
}

function VoiceChannel({ channel }: { channel: Channels.Channel }) {
    return (
        <>
            <ChannelHeader channel={channel} />
            <VoiceHeader id={channel._id} />
        </>
    );
}

export default function () {
    const { channel } = useParams<{ channel: string }>();
    return <Channel id={channel} key={channel} />;
}
