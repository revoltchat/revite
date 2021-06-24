import { Link } from "react-router-dom";
import { Settings } from "@styled-icons/feather";
import { Redirect, useParams } from "react-router";
import { ChannelButton } from "../items/ButtonItem";
import { Channels } from "revolt.js/dist/api/objects";
import { ServerPermission } from "revolt.js/dist/api/permissions";
import { Unreads } from "../../../redux/reducers/unreads";
import { WithDispatcher } from "../../../redux/reducers";
import { useChannels, useForceUpdate, useServer, useServerPermission } from "../../../context/revoltjs/hooks";
import { mapChannelWithUnread, useUnreads } from "./common";
import Header from '../../ui/Header';
import ConnectionStatus from '../items/ConnectionStatus';
import { connectState } from "../../../redux/connector";
import PaintCounter from "../../../lib/PaintCounter";
import styled from "styled-components";
import { attachContextMenu } from 'preact-context-menu';
import ServerHeader from "../../common/ServerHeader";

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
    if (channel) useUnreads({ ...props, channel }, ctx);

    return (
        <ServerBase>
            <ServerHeader server={server} ctx={ctx} />
            <ConnectionStatus />
            <ServerList onContextMenu={attachContextMenu('Menu', { server_list: server._id })}>
                {channels.map(entry => {
                    return (
                        <Link to={`/server/${server._id}/channel/${entry._id}`}>
                            <ChannelButton
                                key={entry._id}
                                channel={entry}
                                active={channel?._id === entry._id}
                                alert={entry.unread}
                                compact
                            />
                        </Link>
                    );
                })}
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
