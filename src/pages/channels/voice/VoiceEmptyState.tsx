import { useCallback } from "preact/hooks";
import { Channel as ChannelI } from "revolt.js/dist/maps/Channels";
import styled from "styled-components";

import Button from "../../../components/ui/Button";
import { voiceState } from "../../../lib/vortex/VoiceState";

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Content = styled.div`
    text-align: center;
    max-width: 640px;
    margin: auto;
`;

const Title = styled.h1`
    font-size: 40px;
    font-weight: bold;
    margin: 0 0 16px;
`;

const Label = styled.div`
    font-size: 20px;
    opacity: 0.75;
`;

const Buttons = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
`;

export interface VoiceEmptyStateProps {
    channel: ChannelI;
}

export const VoiceEmptyState = ({ channel }: { channel: ChannelI }) => {
    const connectToVoice = useCallback(async () => {
        await voiceState.loadVoice();
        voiceState.disconnect();
        voiceState.connect(channel);
    }, [channel]);

    return (
        <Wrapper>
            <Content>
                <Title>No one here yet</Title>
                <Label>Be the first and join this voice channel.</Label>
                <Buttons>
                    <Button accent onClick={connectToVoice}>
                        Join {channel.name}
                    </Button>
                </Buttons>
            </Content>
        </Wrapper>
    );
};
