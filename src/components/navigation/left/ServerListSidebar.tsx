import { Plus } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useLocation, useParams } from "react-router-dom";
import { RelationshipStatus } from "revolt-api/types/Users";
import styled, { css } from "styled-components";

import { attachContextMenu, openContextMenu } from "preact-context-menu";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { connectState } from "../../../redux/connector";
import { LastOpened } from "../../../redux/reducers/last_opened";
import { Unreads } from "../../../redux/reducers/unreads";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import logoSVG from "../../../assets/logo.svg";
import ServerIcon from "../../common/ServerIcon";
import Tooltip from "../../common/Tooltip";
import UserHover from "../../common/user/UserHover";
import UserIcon from "../../common/user/UserIcon";
import IconButton from "../../ui/IconButton";
import LineDivider from "../../ui/LineDivider";
import { mapChannelWithUnread } from "./common";

import { Children } from "../../../types/Preact";

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
                <circle cx="27" cy="5" r="5" fill={"var(--error)"} />
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
        padding-left: 10px;

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
            `}

        svg {
            margin-top: 5px;
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
            <svg
                width="56"
                height="103"
                viewBox="0 0 56 103"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M55.0368 51.5947C55.0368 64.8596 44.2834 75.613 31.0184 75.613C17.7534 75.613 7 64.8596 7 51.5947C7 38.3297 17.7534 27.5763 31.0184 27.5763C44.2834 27.5763 55.0368 38.3297 55.0368 51.5947Z"
                    fill="var(--sidebar-active)"
                />
                <path
                    d="M55.8809 1C55.5597 16.9971 34.4597 25.2244 24.0847 28.6715L55.8846 60.4859L55.8809 1Z"
                    fill="var(--sidebar-active)"
                />
                <path
                    d="M55.8809 102.249C55.5597 86.2516 34.4597 78.0243 24.0847 74.5771L55.8846 42.7627L55.8809 102.249Z"
                    fill="var(--sidebar-active)"
                />
            </svg>
        </span>
    );
}

interface Props {
    unreads: Unreads;
    lastOpened: LastOpened;
}

export const ServerListSidebar = observer(({ unreads, lastOpened }: Props) => {
    const client = useClient();

    const { server: server_id } = useParams<{ server?: string }>();
    const server = server_id ? client.servers.get(server_id) : undefined;
    const activeServers = [...client.servers.values()];
    const channels = [...client.channels.values()].map((x) =>
        mapChannelWithUnread(x, unreads),
    );

    const unreadChannels = channels
        .filter((x) => x.unread)
        .map((x) => x.channel?._id);

    const servers = activeServers.map((server) => {
        let alertCount = 0;
        for (const id of server.channel_ids) {
            const channel = channels.find((x) => x.channel?._id === id);
            if (channel?.alertCount) {
                alertCount += channel.alertCount;
            }
        }

        return {
            server,
            unread: (typeof server.channel_ids.find((x) =>
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
    const { openScreen } = useIntermediate();

    let homeUnread: "mention" | "unread" | undefined;
    let alertCount = 0;
    for (const x of channels) {
        if (
            (x.channel?.channel_type === "DirectMessage"
                ? x.channel?.active
                : x.channel?.channel_type === "Group") &&
            x.unread
        ) {
            homeUnread = "unread";
            alertCount += x.alertCount ?? 0;
        }
    }

    if (
        [...client.users.values()].find(
            (x) => x.relationship === RelationshipStatus.Incoming,
        )
    ) {
        alertCount++;
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
                        <div
                            onContextMenu={attachContextMenu("Status")}
                            onClick={() =>
                                homeActive && openContextMenu("Status")
                            }>
                            <UserHover user={client.user}>
                                <Icon size={42} unread={homeUnread}>
                                    <UserIcon
                                        target={client.user}
                                        size={32}
                                        status
                                    />
                                </Icon>
                            </UserHover>
                        </div>
                    </ServerEntry>
                </ConditionalLink>
                <LineDivider />
                {servers.map((entry) => {
                    const active = entry.server._id === server?._id;
                    const id = lastOpened[entry.server._id];

                    return (
                        <ConditionalLink
                            active={active}
                            to={`/server/${entry.server._id}${
                                id ? `/channel/${id}` : ""
                            }`}>
                            <ServerEntry
                                active={active}
                                onContextMenu={attachContextMenu("Menu", {
                                    server: entry.server._id,
                                })}>
                                <Swoosh />
                                <Tooltip
                                    content={entry.server.name}
                                    placement="right">
                                    <Icon size={42} unread={entry.unread}>
                                        <ServerIcon
                                            size={32}
                                            target={entry.server}
                                        />
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
});

export default connectState(ServerListSidebar, (state) => {
    return {
        unreads: state.unreads,
        lastOpened: state.lastOpened,
    };
});
