import styled from "styled-components";
import { useState } from "preact/hooks";
import ChannelHeader from "./ChannelHeader";
import { useParams } from "react-router-dom";
import { MessageArea } from "./messaging/MessageArea";
// import { useRenderState } from "../../lib/renderer/Singleton";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";
import MessageBox from "../../components/common/messaging/MessageBox";
import { useChannel, useForceUpdate } from "../../context/revoltjs/hooks";
import MemberSidebar from "../../components/navigation/right/MemberSidebar";
import JumpToBottom from "../../components/common/messaging/bars/JumpToBottom";
import TypingIndicator from "../../components/common/messaging/bars/TypingIndicator";
import { Channel } from "revolt.js";

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

    if (channel.channel_type === 'VoiceChannel') {
        return <VoiceChannel channel={channel} />;
    } else {
        return <TextChannel channel={channel} />;
    }
}

function TextChannel({ channel }: { channel: Channel }) {
    const [ showMembers, setMembers ] = useState(true);

    let id = channel._id;
    return <>
        <ChannelHeader channel={channel} toggleSidebar={() => setMembers(!showMembers)} />
        <ChannelMain>
            <ChannelContent>
                <MessageArea id={id} />
                <TypingIndicator id={id} />
                <JumpToBottom id={id} />
                <MessageBox channel={channel} />
            </ChannelContent>
            { !isTouchscreenDevice && showMembers && <MemberSidebar channel={channel} /> }
        </ChannelMain>
    </>;
}

function VoiceChannel({ channel }: { channel: Channel }) {
    return <>
        <ChannelHeader channel={channel} />
    </>;
}

export default function() {
    const { channel } = useParams<{ channel: string }>();
    return <Channel id={channel} key={channel} />;
}
