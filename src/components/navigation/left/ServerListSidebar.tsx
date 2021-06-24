import IconButton from "../../ui/IconButton";
import LineDivider from "../../ui/LineDivider";
import { mapChannelWithUnread } from "./common";
import styled, { css } from "styled-components";
import ServerIcon from "../../common/ServerIcon";
import { Children } from "../../../types/Preact";
import { PlusCircle } from "@styled-icons/feather";
import PaintCounter from "../../../lib/PaintCounter";
import { attachContextMenu } from 'preact-context-menu';
import { connectState } from "../../../redux/connector";
import { useLocation, useParams } from "react-router-dom";
import { Unreads } from "../../../redux/reducers/unreads";
import ConditionalLink from "../../../lib/ConditionalLink";
import { Channel, Servers } from "revolt.js/dist/api/objects";
import { LastOpened } from "../../../redux/reducers/last_opened";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useChannels, useForceUpdate, useServers } from "../../../context/revoltjs/hooks";

import logoSVG from '../../../assets/logo.svg';

function Icon({ children, unread, size }: { children: Children, unread?: 'mention' | 'unread', size: number }) {
    return (
        <svg
            width={size}
            height={size}
            aria-hidden="true"
            viewBox="0 0 32 32"
        >
            <foreignObject x="0" y="0" width="32" height="32">
                { children }
            </foreignObject>
            {unread === 'unread' && (
                <circle
                    cx="27"
                    cy="27"
                    r="5"
                    fill={"white"}
                />
            )}
            {unread === 'mention' && (
                <circle
                    cx="27"
                    cy="27"
                    r="5"
                    fill={"red"}
                />
            )}
        </svg>
    )
}

const ServersBase = styled.div`
    width: 52px;
    height: 100%;
    display: flex;
    flex-direction: column;

    ${ isTouchscreenDevice && css`
        padding-bottom: 50px;
    ` }
`;

const ServerList = styled.div`
    flex-grow: 1;
    display: flex;
    overflow-y: scroll;
    padding-bottom: 48px;
    flex-direction: column;
    border-inline-end: 2px solid var(--sidebar-active);

    scrollbar-width: none;

    > :first-child > svg {
        margin: 6px 0 6px 4px;
    }

    &::-webkit-scrollbar {
        width: 0px;
    }
`;

const ServerEntry = styled.div<{ active: boolean, invert?: boolean }>`
    height: 44px;
    padding: 4px;
    margin: 2px 0 2px 4px;

    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    img {
        width: 32px;
        height: 32px;
    }

    ${ props => props.active && css`
        background: var(--sidebar-active);
    ` }

    ${ props => props.active && props.invert && css`
        img {
            filter: saturate(0) brightness(10);
        }
    ` }
`;

interface Props {
    unreads: Unreads;
    lastOpened: LastOpened;
}

export function ServerListSidebar({ unreads, lastOpened }: Props) {
    const ctx = useForceUpdate();
    const activeServers = useServers(undefined, ctx) as Servers.Server[];
    const channels = (useChannels(undefined, ctx) as Channel[])
        .map(x => mapChannelWithUnread(x, unreads));
    
    const unreadChannels = channels.filter(x => x.unread)
        .map(x => x._id);

    const servers = activeServers.map(server => {
        let alertCount = 0;
        for (let id of server.channels) {
            let channel = channels.find(x => x._id === id);
            if (channel?.alertCount) {
                alertCount += channel.alertCount;
            }
        }

        return {
            ...server,
            unread: (typeof server.channels.find(x => unreadChannels.includes(x)) !== 'undefined' ?
                ( alertCount > 0 ? 'mention' : 'unread' ) : undefined) as 'mention' | 'unread' | undefined,
            alertCount
        }
    });

    const path = useLocation().pathname;
    const { server: server_id } = useParams<{ server?: string }>();
    const server = servers.find(x => x!._id == server_id);

    const { openScreen } = useIntermediate();

    let homeUnread: 'mention' | 'unread' | undefined;
    let alertCount = 0;
    for (let x of channels) {
        if (((x.channel_type === 'DirectMessage' && x.active) || x.channel_type === 'Group') && x.unread) {
            homeUnread = 'unread';
            alertCount += x.alertCount ?? 0;
        }
    }

    if (alertCount > 0) homeUnread = 'mention';
    const homeActive = typeof server === 'undefined' && !path.startsWith('/invite');

    return (
        <ServersBase>
            <ServerList>
                <ConditionalLink active={homeActive} to={lastOpened.home ? `/channel/${lastOpened.home}` : '/'}>
                    <ServerEntry invert active={homeActive}>
                        <Icon size={36} unread={homeUnread}>
                            <img src={logoSVG} />
                        </Icon>
                    </ServerEntry>
                </ConditionalLink>
                <LineDivider />
                {
                    servers.map(entry => {
                        const active = entry!._id === server?._id;
                        const id = lastOpened[entry!._id];
                        
                        return (
                            <ConditionalLink active={active} to={`/server/${entry!._id}` + (id ? `/channel/${id}` : '')}>
                                <ServerEntry
                                    active={active}
                                    onContextMenu={attachContextMenu('Menu', { server: entry!._id })}>
                                    <Icon size={36} unread={entry.unread}>
                                        <ServerIcon size={32} target={entry} />
                                    </Icon>
                                </ServerEntry>
                            </ConditionalLink>
                        )
                    })
                }
                <IconButton onClick={() => openScreen({ id: 'special_input', type: 'create_server' })}>
                    <PlusCircle size={36} />
                </IconButton>
                <PaintCounter small />
            </ServerList>
        </ServersBase>
    )
}

export default connectState(
    ServerListSidebar,
    state => {
        return {
            unreads: state.unreads,
            lastOpened: state.lastOpened
        };
    }
);
