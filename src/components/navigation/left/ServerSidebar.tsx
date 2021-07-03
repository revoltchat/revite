import { Redirect, useParams } from "react-router";
import { ChannelButton } from "../items/ButtonItem";
import { Channels } from "revolt.js/dist/api/objects";
import { Unreads } from "../../../redux/reducers/unreads";
import { WithDispatcher } from "../../../redux/reducers";
import { useChannels, useForceUpdate, useServer } from "../../../context/revoltjs/hooks";
import { mapChannelWithUnread, useUnreads } from "./common";
import ConnectionStatus from '../items/ConnectionStatus';
import { connectState } from "../../../redux/connector";
import PaintCounter from "../../../lib/PaintCounter";
import styled from "styled-components";
import { attachContextMenu } from 'preact-context-menu';
import ServerHeader from "../../common/ServerHeader";
import { useEffect } from "preact/hooks";
import Category from "../../ui/Category";
import ConditionalLink from "../../../lib/ConditionalLink";

interface Props {
    unreads: Unreads;
}

const ServerBase = styled.div`
    height: 100%;
    width: 240px;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    background: var(--secondary-background);

    border-start-start-radius: 8px;
    border-end-start-radius: 8px;
    overflow: hidden;
`;

const ServerList = styled.div`
    padding: 6px;
    flex-grow: 1;
    overflow-y: scroll;

    > svg {
        width: 100%;
    }
`;

function ServerSidebar(props: Props & WithDispatcher) {
    const { server: server_id, channel: channel_id } = useParams<{ server?: string, channel?: string }>();
    const ctx = useForceUpdate();

    const server = useServer(server_id, ctx);
    if (!server) return <Redirect to="/" />;

    const channels = (useChannels(server.channels, ctx)
        .filter(entry => typeof entry !== 'undefined') as Readonly<Channels.TextChannel | Channels.VoiceChannel>[])
        .map(x => mapChannelWithUnread(x, props.unreads));
    
    const channel = channels.find(x => x?._id === channel_id);
    if (channel_id && !channel) return <Redirect to={`/server/${server_id}`} />;
    if (channel) useUnreads({ ...props, channel }, ctx);

    useEffect(() => {
        if (!channel_id) return;

        props.dispatcher({
            type: 'LAST_OPENED_SET',
            parent: server_id!,
            child: channel_id!
        });
    }, [ channel_id ]);

    let uncategorised = new Set(server.channels);
    let elements = [];
    function addChannel(id: string) {
        const entry = channels.find(x => x._id === id);
        if (!entry) return;

        const active = channel?._id === entry._id;

        return (
            <ConditionalLink active={active} to={`/server/${server!._id}/channel/${entry._id}`}>
                <ChannelButton
                    key={entry._id}
                    channel={entry}
                    active={active}
                    alert={entry.unread}
                    compact
                />
            </ConditionalLink>
        );
    }

    if (server.categories) {
        for (let category of server.categories) {
            elements.push(<Category text={category.title} />);

            for (let id of category.channels) {
                uncategorised.delete(id);
                elements.push(addChannel(id));
            }
        }
    }

    for (let id of uncategorised) {
        elements.unshift(addChannel(id));
    }

    return (
        <ServerBase>
            <ServerHeader server={server} ctx={ctx} />
            <ConnectionStatus />
            <ServerList onContextMenu={attachContextMenu('Menu', { server_list: server._id })}>
                { elements }
            </ServerList>
            <PaintCounter small />
        </ServerBase>
    )
};

export default connectState(
    ServerSidebar,
    state => {
        return {
            unreads: state.unreads
        };
    },
    true
);
