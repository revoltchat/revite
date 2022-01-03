import { observer } from "mobx-react-lite";
import { Redirect, useParams, useHistory } from "react-router-dom";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Server } from "revolt.js/dist/maps/Servers";
import styled, { css } from "styled-components";

import { attachContextMenu } from "preact-context-menu";
import { useEffect, useState } from "preact/hooks";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";
import { useDebounceCallback } from "../../../lib/debounce";
import { internalEmit, internalSubscribe } from "../../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../../mobx/State";

import { useClient } from "../../../context/revoltjs/RevoltClient";
import { serverChannels } from "../../../context/revoltjs/util";

import CollapsibleSection from "../../common/CollapsibleSection";
import ServerHeader from "../../common/ServerHeader";
import Category from "../../ui/Category";

import { ChannelButton } from "../items/ButtonItem";
import ConnectionStatus from "../items/ConnectionStatus";

const ServerBase = styled.div`
    height: 100%;
    width: 232px;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    background: var(--secondary-background);
    border-start-start-radius: 8px;
    border-end-start-radius: 8px;
    overflow: hidden;

    ${isTouchscreenDevice &&
    css`
        padding-bottom: 50px;
    `}
`;

const ServerList = styled.div`
    padding: 6px;
    flex-grow: 1;
    overflow-y: scroll;

    > svg {
        width: 100%;
    }
`;

interface Props {
    server: Server;
}

export default observer(() => {
    const client = useClient();
    const state = useApplicationState();
    const history = useHistory();

    const { server: server_id, channel: channel_id } =
        useParams<{ server: string; channel?: string }>();

    const server = client.servers.get(server_id);
    if (!server) return <Redirect to="/" />;

    const channel = channel_id ? client.channels.get(channel_id) : undefined;

    // ! FIXME: move this globally
    // Track which channel the user was last on.
    useEffect(() => {
        if (!channel_id) return;
        if (!server_id) return;

        state.layout.setLastOpened(server_id, channel_id);
    }, [channel_id, server_id]);

    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

    const openChannel = useDebounceCallback(
        (channel: Channel) => {
            history.push(`/server/${channel.server_id}/channel/${channel._id}`);
            setSelectedChannel(null);
        },
        [],
        275,
    );

    const channels = serverChannels(server, client);

    useEffect(() => {
        function navigateChannels(dir: number) {
            const visibleChannels = channels;

            const channelIndex = visibleChannels.findIndex(
                (ch) => ch?._id === (selectedChannel ?? channel_id),
            );

            const len = visibleChannels.length;
            const channel = visibleChannels[(channelIndex + dir + len) % len];

            if (channel) {
                setSelectedChannel(channel._id);
                openChannel(channel);
            }
        }

        return internalSubscribe(
            "LeftSidebar",
            "navigate_channels",
            navigateChannels as (...args: unknown[]) => void,
        );
    }, [channels]);

    const uncategorised = new Set(server.channel_ids);
    const elements = [];

    function addChannel(id: string) {
        const entry = client.channels.get(id);
        if (!entry) return;

        const active = entry._id === (selectedChannel ?? channel?._id);
        const isUnread = entry.isUnread(state.notifications);
        const mentionCount = entry.getMentions(state.notifications);

        return (
            <ConditionalLink
                onClick={(e) => {
                    if (e.shiftKey) {
                        internalEmit(
                            "MessageBox",
                            "append",
                            `<#${entry._id}>`,
                            "channel_mention",
                        );
                        e.preventDefault();
                    }
                }}
                key={entry._id}
                active={active}
                to={`/server/${server!._id}/channel/${entry._id}`}>
                <ChannelButton
                    channel={entry}
                    active={active}
                    alert={
                        mentionCount.length > 0
                            ? "mention"
                            : isUnread
                            ? "unread"
                            : undefined
                    }
                    compact
                    muted={state.notifications.isMuted(entry)}
                />
            </ConditionalLink>
        );
    }

    if (server.categories) {
        for (const category of server.categories) {
            const channels = [];
            for (const id of category.channels) {
                uncategorised.delete(id);
                channels.push(addChannel(id));
            }

            elements.push(
                <CollapsibleSection
                    id={`category_${category.id}`}
                    defaultValue
                    summary={<Category text={category.title} />}>
                    {channels}
                </CollapsibleSection>,
            );
        }
    }

    for (const id of Array.from(uncategorised).reverse()) {
        elements.unshift(addChannel(id));
    }

    return (
        <ServerBase>
            <ServerHeader server={server} />
            <ConnectionStatus />
            <ServerList
                onContextMenu={attachContextMenu("Menu", {
                    server_list: server._id,
                })}>
                {elements}
            </ServerList>
            <PaintCounter small />
        </ServerBase>
    );
});
