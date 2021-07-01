import IconButton from "../../ui/IconButton";
import LineDivider from "../../ui/LineDivider";
import { mapChannelWithUnread } from "./common";
import styled, { css } from "styled-components";
import ServerIcon from "../../common/ServerIcon";
import { Children } from "../../../types/Preact";
import { Plus } from "@styled-icons/boxicons-regular";
import PaintCounter from "../../../lib/PaintCounter";
import { attachContextMenu, openContextMenu } from 'preact-context-menu';
import { connectState } from "../../../redux/connector";
import { useLocation, useParams } from "react-router-dom";
import { Unreads } from "../../../redux/reducers/unreads";
import ConditionalLink from "../../../lib/ConditionalLink";
import { Channel, Servers } from "revolt.js/dist/api/objects";
import { LastOpened } from "../../../redux/reducers/last_opened";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useChannels, useForceUpdate, useSelf, useServers } from "../../../context/revoltjs/hooks";

import logoSVG from '../../../assets/logo.svg';
import Tooltip from "../../common/Tooltip";
import UserIcon from "../../common/user/UserIcon";

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
    width: 56px;
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
    // border-right: 2px solid var(--accent);

    scrollbar-width: none;

    > :first-child > svg {
        margin: 6px 0 6px 4px;
    }

    &::-webkit-scrollbar {
        width: 0px;
    }
`;

const ServerEntry = styled.div<{ active: boolean, home?: boolean }>`
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    > * {
        // outline: 1px solid red;
    }

    > div {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        
        border-start-start-radius: 50%;
        border-end-start-radius: 50%;

        ${ props => props.active && css`
            background: var(--sidebar-active);
        ` }
    }

    span {
        width: 6px;
        height: 46px;

        ${ props => props.active && css`
            background: var(--sidebar-active);

            &::before, &::after {
                // outline: 1px solid blue;
            }

            &::before, &::after {
                content: "";
                display: block;
                position: relative;

                width: 31px;
                height: 72px;
                margin-top: -72px;
                margin-left: -25px;
                z-index: -1;

                background: var(--background);
                border-bottom-right-radius: 32px;

                box-shadow: 0 32px 0 0 var(--sidebar-active);
            }

            &::after {
                transform: scaleY(-1) translateY(-118px);
            }
        ` }
    }

    ${ props => (!props.active || props.home) && css`
        cursor: pointer;
    ` }
`;

interface Props {
    unreads: Unreads;
    lastOpened: LastOpened;
}

export function ServerListSidebar({ unreads, lastOpened }: Props) {
    const ctx = useForceUpdate();
    const self = useSelf(ctx);
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
                    <ServerEntry home active={homeActive}>
                        <div onContextMenu={attachContextMenu('Status')}
                            onClick={() => homeActive && openContextMenu("Status")}>
                            <Icon size={42} unread={homeUnread}>
                                <UserIcon target={self} size={32} status />
                            </Icon>
                        </div>
                        <span />
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
                                    <Tooltip content={entry.name} placement="right">
                                        <Icon size={42} unread={entry.unread}>
                                            <ServerIcon size={32} target={entry} />
                                        </Icon>
                                    </Tooltip>
                                    <span />
                                </ServerEntry>
                            </ConditionalLink>
                        )
                    })
                }
                <IconButton onClick={() => openScreen({ id: 'special_input', type: 'create_server' })}>
                    <Plus size={36} />
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
