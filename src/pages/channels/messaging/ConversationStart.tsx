import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";

import { ChannelName } from "../../../controllers/client/jsx/ChannelName";

const StartBase = styled.div`
    margin: 18px 16px 10px 16px;

    h1 {
        font-size: 23px;
        margin: 0 0 8px 0;
    }

    h4 {
        font-weight: 400;
        margin: 0;
        font-size: 14px;
    }
`;

interface Props {
    channel: Channel;
}

export default observer(({ channel }: Props) => {
    return (
        <StartBase>
            <h1>
                <ChannelName channel={channel} prefix />
            </h1>
            <h4>
                <Text id="app.main.channel.start.group" />
            </h4>
        </StartBase>
    );
});
