import { observer } from "mobx-react-lite";
import { Redirect, useParams } from "react-router";
import styled, { css } from "styled-components";

import { attachContextMenu } from "preact-context-menu";
import { useEffect } from "preact/hooks";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";

import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";
import { Unreads } from "../../../redux/reducers/unreads";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { useClient } from "../../../context/revoltjs/RevoltClient";

import CollapsibleSection from "../../common/CollapsibleSection";
import ServerHeader from "../../common/ServerHeader";
import Category from "../../ui/Category";
import { mapChannelWithUnread, useUnreads } from "./common";

import { ChannelButton } from "../items/ButtonItem";
import ConnectionStatus from "../items/ConnectionStatus";

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

const ServerSidebar = observer((props: Props) => {
    const client = useClient();
    const { server: server_id, channel: channel_id } =
        useParams<{ server: string; channel?: string }>();

    const server = client.servers.get(server_id);
    if (!server) return <Redirect to="/" />;

    const channel = channel_id ? client.channels.get(channel_id) : undefined;
    if (channel_id && !channel) return <Redirect to={`/server/${server_id}`} />;
    if (channel) useUnreads({ ...props, channel });

    useEffect(() => {
        if (!channel_id) return;

        dispatch({
            type: "LAST_OPENED_SET",
            parent: server_id!,
            child: channel_id!,
        });
    }, [channel_id]);

    const uncategorised = new Set(server.channel_ids);
    const elements = [];

    function addChannel(id: string) {
        const entry = client.channels.get(id);
        if (!entry) return;

        const active = channel?._id === entry._id;

        return (
            <ConditionalLink
                key={entry._id}
                active={active}
                to={`/server/${server!._id}/channel/${entry._id}`}>
                <ChannelButton
                    channel={entry}
                    active={active}
                    // ! FIXME: pull it out directly
                    alert={mapChannelWithUnread(entry, props.unreads).unread}
                    compact
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

export default connectState(ServerSidebar, (state) => {
    return {
        unreads: state.unreads,
    };
});
