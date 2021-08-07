import { Plus } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { RelationshipStatus } from "revolt-api/types/Users";
import styled, { css } from "styled-components";

import { attachContextMenu } from "preact-context-menu";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { connectState } from "../../../redux/connector";
import { LastOpened } from "../../../redux/reducers/last_opened";
import { Unreads } from "../../../redux/reducers/unreads";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

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
    padding-left: 2px;
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
    padding-bottom: 20px;
    /*width: 58px;*/
    flex-direction: column;

    scrollbar-width: none;

    > :first-child > svg {
        margin: 6px 0 6px 4px;
    }

    &::-webkit-scrollbar {
        width: 0px;
    }

    /*${isTouchscreenDevice &&
    css`
        width: 58px;
    `}*/
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
                width="54"
                height="106"
                viewBox="0 0 54 106"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M54 53C54 67.9117 41.9117 80 27 80C12.0883 80 0 67.9117 0 53C0 38.0883 12.0883 26 27 26C41.9117 26 54 38.0883 54 53Z"
                    fill="var(--sidebar-active)"
                />
                <path
                    d="M27 80C4.5 80 54 53 54 53L54.0001 106C54.0001 106 49.5 80 27 80Z"
                    fill="var(--sidebar-active)"
                />
                <path
                    d="M27 26C4.5 26 54 53 54 53L53.9999 0C53.9999 0 49.5 26 27 26Z"
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

    const history = useHistory();
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
                                homeActive && history.push("/settings")
                            }>
                            <UserHover user={client.user}>
                                <Icon size={42} unread={homeUnread}>
                                    <UserIcon
                                        target={client.user}
                                        size={32}
                                        status
                                        hover
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
                            key={entry.server._id}
                            active={active}
                            to={`/server/${entry.server._id}${
                                id ? `/channel/${id}` : ""
                            }`}>
                            <ServerEntry
                                active={active}
                                onContextMenu={attachContextMenu("Menu", {
                                    server: entry.server._id,
                                    unread: entry.unread,
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
                {/*<IconButton
                    onClick={() =>
                        openScreen({
                            id: "special_input",
                            type: "create_server",
                        })
                    }>
                    <Compass size={36} />
                </IconButton>*/}
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
