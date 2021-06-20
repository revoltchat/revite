import { Text } from "preact-i18n";
import styled from "styled-components";
import { getChannelName } from "../../../context/revoltjs/util";
import { useChannel, useForceUpdate } from "../../../context/revoltjs/hooks";

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
    id: string;
}

export default function ConversationStart({ id }: Props) {
    const ctx = useForceUpdate();
    const channel = useChannel(id, ctx);
    if (!channel) return null;

    return (
        <StartBase>
            <h1>{ getChannelName(ctx.client, channel, true) }</h1>
            <h4>
                <Text id="app.main.channel.start.group" />
            </h4>
        </StartBase>
    );
}
