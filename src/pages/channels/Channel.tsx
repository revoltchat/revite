import { Hash } from "@styled-icons/boxicons-regular";
import { Ghost } from "@styled-icons/boxicons-solid";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { Redirect, useParams } from "react-router-dom";
import { Channel as ChannelI } from "revolt.js/dist/maps/Channels";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useEffect, useMemo } from "preact/hooks";

import ErrorBoundary from "../../lib/ErrorBoundary";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";
import { SIDEBAR_MEMBERS } from "../../mobx/stores/Layout";

import { useClient } from "../../context/revoltjs/RevoltClient";

import AgeGate from "../../components/common/AgeGate";
import MessageBox from "../../components/common/messaging/MessageBox";
import JumpToBottom from "../../components/common/messaging/bars/JumpToBottom";
import NewMessages from "../../components/common/messaging/bars/NewMessages";
import TypingIndicator from "../../components/common/messaging/bars/TypingIndicator";
import { PageHeader } from "../../components/ui/Header";

import RightSidebar from "../../components/navigation/RightSidebar";
import ChannelHeader from "./ChannelHeader";
import { MessageArea } from "./messaging/MessageArea";
import VoiceHeader from "./voice/VoiceHeader";

const ChannelMain = styled.div`
    flex-grow: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
    flex-direction: row;

    > * > ::-webkit-scrollbar-thumb {
        background-clip: content-box;
        border-top: 48px solid transparent;
    }
`;

const ChannelContent = styled.div`
    flex-grow: 1;
    display: flex;
    overflow: hidden;
    flex-direction: column;
`;

const PlaceholderBase = styled.div`
    @keyframes floating {
        0% {
            transform: translate(0, 0px);
        }
        50% {
            transform: translate(0, 15px);
        }
        100% {
            transform: translate(0, -0px);
        }
    }

    flex-grow: 1;
    display: flex;
    overflow: hidden;
    flex-direction: column;

    .floating {
        animation-name: floating;
        animation-duration: 3s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
    }

    .placeholder {
        justify-content: center;
        text-align: center;
        margin: auto;
        padding: 12px;

        .primary {
            color: var(--secondary-foreground);
            font-weight: 700;
            font-size: 22px;
            margin: 0 0 5px 0;
        }

        .secondary {
            color: var(--tertiary-foreground);
            font-weight: 400;
        }

        svg {
            margin: 2em auto;
            fill-opacity: 0.8;
        }
    }
`;

export function Channel({ id, server_id }: { id: string; server_id: string }) {
    const client = useClient();
    const channel = client.channels.get(id);

    if (server_id && !channel) {
        const server = client.servers.get(server_id);
        if (server && server.channel_ids.length > 0) {
            return (
                <Redirect
                    to={`/server/${server_id}/channel/${server.channel_ids[0]}`}
                />
            );
        }
    }

    if (!channel) return <ChannelPlaceholder />;

    if (channel.channel_type === "VoiceChannel") {
        return <VoiceChannel channel={channel} />;
    }

    return <TextChannel channel={channel} />;
}

const TextChannel = observer(({ channel }: { channel: ChannelI }) => {
    const layout = useApplicationState().layout;

    // Cache the unread location.
    const last_id = useMemo(
        () =>
            (channel.unread
                ? channel.client.unreads?.getUnread(channel._id)?.last_id
                : undefined) ?? undefined,
        [channel],
    );

    // Mark channel as read.
    useEffect(() => {
        const checkUnread = () =>
            channel.unread &&
            channel.client.unreads!.markRead(
                channel._id,
                channel.last_message_id!,
                true,
            );

        checkUnread();
        return reaction(
            () => channel.last_message_id,
            () => checkUnread(),
        );
    }, [channel]);

    return (
        <AgeGate
            type="channel"
            channel={channel}
            gated={
                !!(
                    (channel.channel_type === "TextChannel" ||
                        channel.channel_type === "Group") &&
                    channel.nsfw
                )
            }>
            <ChannelHeader channel={channel} />
            <ChannelMain>
                <ErrorBoundary section="renderer">
                    <ChannelContent>
                        <VoiceHeader id={channel._id} />
                        <NewMessages channel={channel} last_id={last_id} />
                        <MessageArea channel={channel} last_id={last_id} />
                        <TypingIndicator channel={channel} />
                        <JumpToBottom channel={channel} />
                        <MessageBox channel={channel} />
                    </ChannelContent>
                </ErrorBoundary>
                {!isTouchscreenDevice &&
                    layout.getSectionState(SIDEBAR_MEMBERS, true) && (
                        <RightSidebar />
                    )}
            </ChannelMain>
        </AgeGate>
    );
});

function VoiceChannel({ channel }: { channel: ChannelI }) {
    return (
        <>
            <ChannelHeader channel={channel} />
            <VoiceHeader id={channel._id} />
        </>
    );
}

function ChannelPlaceholder() {
    return (
        <PlaceholderBase>
            <PageHeader icon={<Hash size={24} />}>
                <span className="name">
                    <Text id="app.main.channel.errors.nochannel" />
                </span>
            </PageHeader>

            <div className="placeholder">
                <div className="floating">
                    <Ghost width={80} />
                </div>
                <div className="primary">
                    <Text id="app.main.channel.errors.title" />
                </div>
                <div className="secondary">
                    <Text id="app.main.channel.errors.nochannels" />
                </div>
            </div>
        </PlaceholderBase>
    );
}

export default function ChannelComponent() {
    const { channel, server } =
        useParams<{ channel: string; server: string }>();

    return <Channel id={channel} server_id={server} key={channel} />;
}
