import { Plus } from "@styled-icons/boxicons-regular";
import { Cog, Compass } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { RelationshipStatus } from "revolt-api/types/Users";
import styled, { css } from "styled-components";

import { attachContextMenu } from "preact-context-menu";
import { Text } from "preact-i18n";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../../mobx/State";
import { SIDEBAR_CHANNELS } from "../../../mobx/stores/Layout";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import ChannelIcon from "../../common/ChannelIcon";
import ServerIcon from "../../common/ServerIcon";
import Tooltip from "../../common/Tooltip";
import UserHover from "../../common/user/UserHover";
import UserIcon from "../../common/user/UserIcon";
import IconButton from "../../ui/IconButton";
import LineDivider from "../../ui/LineDivider";

import { Children } from "../../../types/Preact";

function Icon({
    children,
    unread,
    count,
    size,
}: {
    children: Children;
    unread?: "mention" | "unread";
    count: number | 0;
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
                <>
                    <circle cx="27" cy="5" r="5" fill={"var(--error)"} />
                    <text
                        x="27"
                        y="5"
                        r="5"
                        fill={"white"}
                        style={"text-align:center;"}
                        text-anchor="middle"
                        fontSize={"7.5"}
                        alignmentBaseline={"middle"}
                        dominant-baseline={"middle"}>
                        {count < 10 ? count : "9+"}
                    </text>
                </>
            )}
        </svg>
    );
}

const ServersBase = styled.div`
    width: 56px;
    height: 100%;
    padding-left: 2px;

    display: flex;
    flex-shrink: 0;
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
    padding-bottom: 20px;
    flex-direction: column;
    margin-top: -2px;

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

    :focus {
        outline: 3px solid blue;
    }

    > div {
        height: 42px;
        padding-inline-start: 6px;

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
            pointer-events: none;
        }
    }

    ${(props) =>
        (!props.active || props.home) &&
        css`
            cursor: pointer;
        `}
`;

const ServerCircle = styled.div`
    width: 54px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .circle {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--primary-background);
        border-radius: 50%;
        height: 42px;
        width: 42px;
        transition: background-color 0.1s ease-in;

        > div svg {
            color: var(--accent);
        }

        &:active {
            transform: translateY(1px);
        }
    }
`;

const SettingsButton = styled.div`
    width: 50px;
    height: 56px;
    display: grid;
    place-items: center;
`;

function Swoosh() {
    const sidebarOpen = useApplicationState().layout.getSectionState(
        SIDEBAR_CHANNELS,
        true,
    );
    const fill = sidebarOpen
        ? "var(--sidebar-active)"
        : "var(--primary-background)";

    return (
        <span>
            <svg
                width="54"
                height="106"
                viewBox="0 0 54 106"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M54 53C54 67.9117 41.9117 80 27 80C12.0883 80 0 67.9117 0 53C0 38.0883 12.0883 26 27 26C41.9117 26 54 38.0883 54 53Z"
                    fill={fill}
                />
                <path
                    d="M27 80C4.5 80 54 53 54 53L54.0001 106C54.0001 106 49.5 80 27 80Z"
                    fill={fill}
                />
                <path
                    d="M27 26C4.5 26 54 53 54 53L53.9999 0C53.9999 0 49.5 26 27 26Z"
                    fill={fill}
                />
            </svg>
        </span>
    );
}

export default observer(() => {
    const client = useClient();
    const state = useApplicationState();

    const { server: server_id } = useParams<{ server?: string }>();
    const server = server_id ? client.servers.get(server_id) : undefined;
    const servers = [...client.servers.values()];
    const channels = [...client.channels.values()];

    const history = useHistory();
    const path = useLocation().pathname;
    const { openScreen } = useIntermediate();

    let alertCount = [...client.users.values()].filter(
        (x) => x.relationship === RelationshipStatus.Incoming,
    ).length;

    const homeActive =
        typeof server === "undefined" &&
        !path.startsWith("/invite") &&
        !path.startsWith("/discover");

    return (
        <ServersBase>
            <ServerList>
                <ConditionalLink
                    active={homeActive}
                    to={state.layout.getLastHomePath()}>
                    <ServerEntry home active={homeActive}>
                        <Swoosh />
                        <div
                            onContextMenu={attachContextMenu("Status")}
                            onClick={() =>
                                homeActive && history.push("/settings")
                            }>
                            <UserHover user={client.user ?? undefined}>
                                <Icon
                                    size={42}
                                    unread={
                                        alertCount > 0 ? "mention" : undefined
                                    }
                                    count={alertCount}>
                                    <UserIcon
                                        target={client.user ?? undefined}
                                        size={32}
                                        status
                                        hover
                                    />
                                </Icon>
                            </UserHover>
                        </div>
                    </ServerEntry>
                </ConditionalLink>
                {channels
                    .filter(
                        (x) =>
                            (x.channel_type === "DirectMessage" ||
                                x.channel_type === "Group") &&
                            x.unread,
                    )
                    .map((x) => {
                        const unreadCount = x.mentions.length;
                        return (
                            <Link to={`/channel/${x._id}`}>
                                <ServerEntry
                                    home
                                    active={false}
                                    onContextMenu={attachContextMenu("Menu", {
                                        channel: x._id,
                                        unread: true,
                                    })}>
                                    <div>
                                        <Icon
                                            size={42}
                                            unread={
                                                unreadCount > 0
                                                    ? "mention"
                                                    : "unread"
                                            }
                                            count={unreadCount}>
                                            {x.channel_type ===
                                            "DirectMessage" ? (
                                                <UserIcon
                                                    target={x.recipient}
                                                    size={32}
                                                    hover
                                                />
                                            ) : (
                                                <ChannelIcon
                                                    target={x}
                                                    size={32}
                                                    hover
                                                />
                                            )}
                                        </Icon>
                                    </div>
                                </ServerEntry>
                            </Link>
                        );
                    })}
                <LineDivider />
                {servers.map((server) => {
                    const active = server._id === server_id;

                    const isUnread = server.isUnread(state.notifications);
                    const mentionCount = server.getMentions(
                        state.notifications,
                    ).length;

                    return (
                        <ConditionalLink
                            key={server._id}
                            active={active}
                            to={state.layout.getServerPath(server._id)}>
                            <ServerEntry
                                active={active}
                                onContextMenu={attachContextMenu("Menu", {
                                    server: server._id,
                                    unread: isUnread,
                                })}>
                                <Swoosh />
                                <Tooltip
                                    content={server.name}
                                    placement="right">
                                    <Icon
                                        size={42}
                                        unread={
                                            mentionCount > 0
                                                ? "mention"
                                                : isUnread
                                                ? "unread"
                                                : undefined
                                        }
                                        count={mentionCount}>
                                        <ServerIcon size={32} target={server} />
                                    </Icon>
                                </Tooltip>
                            </ServerEntry>
                        </ConditionalLink>
                    );
                })}
                {/*<LineDivider />*/}
                <ServerCircle>
                    <Tooltip content="Add a Server" placement="right">
                        <div className="circle">
                            <IconButton
                                onClick={() =>
                                    openScreen({
                                        id: "special_input",
                                        type: "create_server",
                                    })
                                }>
                                <Plus size={32} />
                            </IconButton>
                        </div>
                    </Tooltip>
                </ServerCircle>
                {!isTouchscreenDevice && (
                    <ServerCircle>
                        <Tooltip
                            content={
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                    }}>
                                    <div>Discover Revolt</div>
                                    <div
                                        style={{
                                            padding: "1px 5px",
                                            fontSize: "9px",
                                            background: "var(--status-busy)",
                                            borderRadius: "60px",
                                        }}>
                                        NEW
                                    </div>
                                </div>
                            }
                            placement="right">
                            <div className="circle">
                                <IconButton>
                                    <Link to="/discover">
                                        <a>
                                            <Compass size={32} />
                                        </a>
                                    </Link>
                                </IconButton>
                            </div>
                        </Tooltip>
                    </ServerCircle>
                )}
            </ServerList>
            <PaintCounter small />
            {!isTouchscreenDevice && (
                <SettingsButton>
                    <Link to="/settings">
                        <Tooltip
                            content={<Text id="app.settings.title" />}
                            placement="right">
                            <IconButton>
                                <Cog size={32} strokeWidth="0.5" />
                            </IconButton>
                        </Tooltip>
                    </Link>
                </SettingsButton>
            )}
        </ServersBase>
    );
});
