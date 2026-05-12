import { Hash } from "@styled-icons/boxicons-regular";
import { Ghost } from "@styled-icons/boxicons-solid";
import dayjs from "dayjs";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { Channel as ChannelI } from "revolt.js";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";
import { useEffect, useRef, useState } from "preact/hooks";

import ErrorBoundary from "../../lib/ErrorBoundary";
import { internalSubscribe } from "../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";
import { SIDEBAR_MEMBERS } from "../../mobx/stores/Layout";

import AgeGate from "../../components/common/AgeGate";
import MessageBox from "../../components/common/messaging/MessageBox";
import JumpToBottom from "../../components/common/messaging/bars/JumpToBottom";
import NewMessages from "../../components/common/messaging/bars/NewMessages";
import TypingIndicator from "../../components/common/messaging/bars/TypingIndicator";
import RightSidebar from "../../components/navigation/RightSidebar";
import { PageHeader } from "../../components/ui/Header";
import { useClient } from "../../controllers/client/ClientController";
import ChannelHeader from "./ChannelHeader";
import { MessageArea } from "./messaging/MessageArea";
import VoiceHeader from "./voice/VoiceHeader";

const NudgeWrap = styled.div<{ $visible: boolean }>`
    @keyframes nudge-float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-4px); }
    }
    @keyframes nudge-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes nudge-out {
        from { opacity: 1; }
        to   { opacity: 0; pointer-events: none; }
    }

    display: flex;
    justify-content: center;
    padding: 0 0 10px 0;
    animation: ${({ $visible }) => ($visible ? "nudge-in 0.4s ease forwards" : "nudge-out 0.3s ease forwards")};

    .pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 18px;
        border-radius: 999px;
        background: var(--secondary-background);
        border: 1px solid var(--tertiary-background);
        font-size: 13px;
        color: var(--secondary-foreground);
        animation: nudge-float 2.8s ease-in-out infinite;
        box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        user-select: none;

        .key {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 1px 7px;
            border-radius: 4px;
            background: var(--tertiary-background);
            font-family: monospace;
            font-size: 12px;
            font-weight: 700;
            color: var(--foreground);
        }
    }
`;

function HiNudge({ channel }: { channel: ChannelI }) {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dismissed = useRef(false);

    const isStartChannel = channel.name?.toLowerCase().startsWith("start");

    useEffect(() => {
        if (!isStartChannel) return;
        const userId = channel.client.user?._id;
        channel.fetchMessagesWithUsers({ limit: 100 }).then(({ messages }) => {
            const hasSent = messages.some((m: any) => m.author_id === userId && !m.author?.bot);
            if (!hasSent) {
                setMounted(true);
                setVisible(true);
            }
        }).catch(() => {
            setMounted(true);
            setVisible(true);
        });
    }, [channel, isStartChannel]);

    useEffect(() => {
        if (!isStartChannel) return;
        function onMsg(msg: any) {
            if (dismissed.current) return;
            if (msg.channel_id === channel._id && msg.author_id === channel.client.user?._id && !msg.author?.bot) {
                dismissed.current = true;
                setVisible(false);
                setTimeout(() => setMounted(false), 400);
            }
        }
        channel.client.addListener("message", onMsg);
        return () => channel.client.removeListener("message", onMsg);
    }, [channel, isStartChannel]);

    if (!isStartChannel || !mounted) return null;

    return (
        <NudgeWrap $visible={visible}>
            <div className="pill">
                <span>👋</span>
                <span>Type</span>
                <span className="key">hi</span>
                <span>and press</span>
                <span className="key">Enter</span>
                <span>to get started</span>
            </div>
        </NudgeWrap>
    );
}

const ChannelMain = styled.div.attrs({ "data-component": "channel" })`
    flex-grow: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
    flex-direction: row;
`;

const ChannelContent = styled.div.attrs({
    "data-component": "content",
})`
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

export const Channel = observer(
    ({ id, server_id }: { id: string; server_id: string }) => {
        const client = useClient();
        const state = useApplicationState();

        if (!client.channels.exists(id)) {
            if (server_id) {
                const server = client.servers.get(server_id);
                if (server && server.channel_ids.length > 0) {
                    let target_id = server.channel_ids[0];
                    const last_id = state.layout.getLastOpened(server_id);
                    if (last_id) {
                        if (client.channels.has(last_id)) {
                            target_id = last_id;
                        }
                    }

                    return (
                        <Redirect
                            to={`/server/${server_id}/channel/${target_id}`}
                        />
                    );
                }
            } else {
                return <Redirect to="/" />;
            }

            return <ChannelPlaceholder />;
        }

        const channel = client.channels.get(id)!;
        if (channel.channel_type === "VoiceChannel") {
            return <VoiceChannel channel={channel} />;
        }

        return <TextChannel channel={channel} />;
    },
);

const TextChannel = observer(({ channel }: { channel: ChannelI }) => {
    const layout = useApplicationState().layout;
    const history = useHistory();

    // Detect ONBOARDING_COMPLETE signal from Otto and redirect to home
    useEffect(() => {
        const client = channel.client;
        function handleMsg(msg: any) {
            if (
                msg.channel_id === channel._id &&
                msg.author?.bot !== null &&
                typeof msg.content === "string" &&
                msg.content.includes("ONBOARDING_COMPLETE")
            ) {
                history.push("/");
            }
        }
        client.addListener("message", handleMsg);
        return () => client.removeListener("message", handleMsg);
    }, [channel, history]);

    // Store unread location.
    const [lastId, setLastId] = useState<string | undefined>(undefined);

    useEffect(
        () =>
            internalSubscribe("NewMessages", "hide", () =>
                setLastId(undefined),
            ),
        [],
    );

    useEffect(
        () => internalSubscribe("NewMessages", "mark", setLastId as any),
        [],
    );

    // Mark channel as read.
    useEffect(() => {
        setLastId(
            (channel.unread
                ? channel.client.unreads?.getUnread(channel._id)?.last_id
                : undefined) ?? undefined,
        );

        const checkUnread = () =>
            channel.unread &&
            document.hasFocus() &&
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

    useEffect(() => {
        let lastSubscribed: number | undefined;
        function subscribe() {
            if (document.hasFocus()) {
                if (
                    !lastSubscribed ||
                    dayjs().subtract(10, "minutes").isAfter(lastSubscribed)
                ) {
                    lastSubscribed = +new Date();
                    channel.server?.subscribe();
                }
            }
        }

        // Trigger logic every minute
        const subTimer = setInterval(subscribe, 60e3);
        subscribe();

        function onFocus() {
            // Mark channel as read if it's unread
            if (channel.unread) {
                channel.client.unreads!.markRead(
                    channel._id,
                    channel.last_message_id!,
                    true,
                );
            }

            // Subscribe to channel if expired
            subscribe();
        }

        addEventListener("focus", onFocus);

        return () => {
            removeEventListener("focus", onFocus);
            clearInterval(subTimer);
        };
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
                        <NewMessages channel={channel} last_id={lastId} />
                        <MessageArea channel={channel} last_id={lastId} />
                        <TypingIndicator channel={channel} />
                        <JumpToBottom channel={channel} />
                        <HiNudge channel={channel} />
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
