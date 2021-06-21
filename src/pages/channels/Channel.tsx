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
    const [ showMembers, setMembers ] = useState(true);

    return (
        <>
            <ChannelHeader channel={channel} toggleSidebar={() => setMembers(!showMembers)} />
            <ChannelMain>
                <ChannelContent>
                    <MessageArea id={id} />
                    <TypingIndicator id={channel._id} />
                    <JumpToBottom id={id} />
                    <MessageBox channel={channel} />
                </ChannelContent>
                { !isTouchscreenDevice && showMembers && <MemberSidebar channel={channel} /> }
            </ChannelMain>
        </>
    )
}

export default function() {
    const { channel } = useParams<{ channel: string }>();
    return <Channel id={channel} key={channel} />;
}
