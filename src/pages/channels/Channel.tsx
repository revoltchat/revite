import styled from "styled-components";
import { useParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import { useRenderState } from "../../lib/renderer/Singleton";
import { useChannel, useForceUpdate, useUsers } from "../../context/revoltjs/hooks";
import { MessageArea } from "./messaging/MessageArea";

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

export default function Channel() {
    const { channel: id } = useParams<{ channel: string }>();

    const ctx = useForceUpdate();
    const channel = useChannel(id, ctx);

    if (!channel) return null;
    // const view = useRenderState(id);

    return (
        <>
            <Header placement="primary">
                Channel
            </Header>
            <ChannelMain>
                <ChannelContent>
                    <MessageArea id={id} />
                </ChannelContent>
            </ChannelMain>
        </>
    )
}
