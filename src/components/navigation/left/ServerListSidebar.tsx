import { Plus } from "@styled-icons/boxicons-regular";
import { useLocation, useParams } from "react-router-dom";
import { Channel, Servers } from "revolt.js/dist/api/objects";
import styled, { css } from "styled-components";

import { attachContextMenu, openContextMenu } from "preact-context-menu";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { connectState } from "../../../redux/connector";
import { LastOpened } from "../../../redux/reducers/last_opened";
import { Unreads } from "../../../redux/reducers/unreads";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import {
    useChannels,
    useForceUpdate,
    useSelf,
    useServers,
} from "../../../context/revoltjs/hooks";

import ServerIcon from "../../common/ServerIcon";
import Tooltip from "../../common/Tooltip";
import UserIcon from "../../common/user/UserIcon";
import IconButton from "../../ui/IconButton";
import LineDivider from "../../ui/LineDivider";
import { mapChannelWithUnread } from "./common";

import logoSVG from '../../../assets/logo.svg';
import { Children } from "../../../types/Preact";
import UserHover from "../../common/user/UserHover";

function Icon({
    children,
    unread,
    size,
}: {
    children: Children;
    unread?: "mention" | "unread";
    size: number;
}) {
    return (
        <svg width={size} height={size} aria-hidden="true" viewBox="0 0 32 32">
            <use href="#serverIndicator" />
            <foreignObject
                x="0"
                y="0"
                width="32"
                height="32"
                mask={unread ? "url(#server)" : undefined}>
                {children}
            </foreignObject>
            {unread === "unread" && (
                <circle cx="27" cy="5" r="5" fill={"white"} />
            )}
            {unread === "mention" && (
                <circle cx="27" cy="5" r="5" fill={"red"} />
            )}
        </svg>
    );
}

const ServersBase = styled.div`
    width: 56px;
    height: 100%;
    display: flex;
    flex-direction: column;

    ${isTouchscreenDevice &&
    css`
        padding-bottom: 50px;
    `}
`;

const ServerList = styled.div`
    flex-grow: 1;
    display: flex;
    overflow-y: scroll;
    padding-bottom: 48px;
    flex-direction: column;

    scrollbar-width: none;

    > :first-child > svg {
        margin: 6px 0 6px 4px;
    }

    &::-webkit-scrollbar {
        width: 0px;
    }
`;

const ServerEntry = styled.div<{ active: boolean; home?: boolean }>`
    height: 58px;
    display: flex;
    align-items: center;

    > div {
        height: 42px;
        padding-left: 4px;
        padding-right: 6px;

        display: grid;
        place-items: center;

        border-start-start-radius: 50%;
        border-end-start-radius: 50%;

        &:active {
            transform: translateY(1px);
        }

        ${(props) =>
            props.active &&
            css`
                &:active {
                    transform: none;
                }
            `}
    }

    > span {
        width: 0;
        display: relative;

        ${(props) =>
            !props.active &&
            css`
                display: none;
            ` }

        svg {
            width: 57px;
            height: 117px;
            margin-top: 4px;
            display: relative;

            pointer-events: none;
            // outline: 1px solid red;
        }
    }

    ${(props) =>
        (!props.active || props.home) &&
        css`
            cursor: pointer;
        `}
`;

function Swoosh() {
    return (
        <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="57" height="117" fill="var(--sidebar-active)">
                <path d="M27.746 86.465c14 0 28 11.407 28 28s.256-56 .256-56-42.256 28-28.256 28z"/>
                <path d="M56 58.465c0 15.464-12.536 28-28 28s-28-12.536-28-28 12.536-28 28-28 28 12.536 28 28z"/>
                <path d="M28.002 30.465c14 0 28-11.407 28-28s0 56 0 56-42-28-28-28z"/>
            </svg>
        </span>
    )
}

interface Props {
    unreads: Unreads;
    lastOpened: LastOpened;
}

export function ServerListSidebar({ unreads, lastOpened }: Props) {
    const ctx = useForceUpdate();
    const self = useSelf(ctx);
    const activeServers = useServers(undefined, ctx) as Servers.Server[];
    const channels = (useChannels(undefined, ctx) as Channel[]).map((x) =>
        mapChannelWithUnread(x, unreads),
    );

    const unreadChannels = channels.filter((x) => x.unread).map((x) => x._id);

    const servers = activeServers.map((server) => {
        let alertCount = 0;
        for (let id of server.channels) {
            let channel = channels.find((x) => x._id === id);
            if (channel?.alertCount) {
                alertCount += channel.alertCount;
            }
        }

        return {
            ...server,
            unread: (typeof server.channels.find((x) =>
                unreadChannels.includes(x),
            ) !== "undefined"
                ? alertCount > 0
                    ? "mention"
                    : "unread"
                : undefined) as "mention" | "unread" | undefined,
            alertCount,
        };
    });

    const path = useLocation().pathname;
    const { server: server_id } = useParams<{ server?: string }>();
    const server = servers.find((x) => x!._id == server_id);

    const { openScreen } = useIntermediate();

    let homeUnread: "mention" | "unread" | undefined;
    let alertCount = 0;
    for (let x of channels) {
        if (
            ((x.channel_type === "DirectMessage" && x.active) ||
                x.channel_type === "Group") &&
            x.unread
        ) {
            homeUnread = "unread";
            alertCount += x.alertCount ?? 0;
        }
    }

    if (alertCount > 0) homeUnread = "mention";
    const homeActive =
        typeof server === "undefined" && !path.startsWith("/invite");

    return (
        <ServersBase>
            <ServerList>
                <ConditionalLink
                    active={homeActive}
                    to={lastOpened.home ? `/channel/${lastOpened.home}` : "/"}>
                    <ServerEntry home active={homeActive}>
                        <Swoosh />
                        { isTouchscreenDevice ?
                            <Icon size={42} unread={homeUnread}>
                                <img style={{ width: 32, height: 32 }} src={logoSVG} />
                            </Icon> :
                            <div
                                onContextMenu={attachContextMenu("Status")}
                                onClick={() =>
                                    homeActive && openContextMenu("Status")
                                }>
                                <UserHover user={self}>
                                    <Icon size={42} unread={homeUnread}>
                                        <UserIcon target={self} size={32} status />
                                    </Icon>
                                </UserHover>
                            </div>
                        }
                    </ServerEntry>
                </ConditionalLink>
                <LineDivider />
                {servers.map((entry) => {
                    const active = entry!._id === server?._id;
                    const id = lastOpened[entry!._id];

                    return (
                        <ConditionalLink
                            active={active}
                            to={
                                `/server/${entry!._id}` +
                                (id ? `/channel/${id}` : "")
                            }>
                            <ServerEntry
                                active={active}
                                onContextMenu={attachContextMenu("Menu", {
                                    server: entry!._id,
                                })}>
                                <Swoosh />
                                <Tooltip content={entry.name} placement="right">
                                    <Icon size={42} unread={entry.unread}>
                                        <ServerIcon size={32} target={entry} />
                                    </Icon>
                                </Tooltip>
                            </ServerEntry>
                        </ConditionalLink>
                    );
                })}
                <IconButton
                    onClick={() =>
                        openScreen({
                            id: "special_input",
                            type: "create_server",
                        })
                    }>
                    <Plus size={36} />
                </IconButton>
                <PaintCounter small />
            </ServerList>
        </ServersBase>
    );
}

export default connectState(ServerListSidebar, (state) => {
    return {
        unreads: state.unreads,
        lastOpened: state.lastOpened,
    };
});
