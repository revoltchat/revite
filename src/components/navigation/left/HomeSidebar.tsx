import { Plus } from "@styled-icons/boxicons-regular";
import {
    Home,
    UserDetail,
    Wrench,
    Notepad,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link, useLocation, useParams } from "react-router-dom";
import styled, { css } from "styled-components/macro";

import { Text } from "preact-i18n";
import { useContext, useEffect } from "preact/hooks";

import { Category, IconButton } from "@revoltchat/ui";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../../mobx/State";

import placeholderSVG from "../items/placeholder.svg";

import { useClient } from "../../../controllers/client/ClientController";
import { modalController } from "../../../controllers/modals/ModalController";
import { GenericSidebarBase, GenericSidebarList } from "../SidebarBase";
import ButtonItem, { ChannelButton } from "../items/ButtonItem";
import ConnectionStatus from "../items/ConnectionStatus";

const Navbar = styled.div`
    display: flex;
    align-items: center;
    padding: 0 14px;
    font-weight: 600;
    flex-shrink: 0;
    height: 48px;

    ${() =>
        isTouchscreenDevice &&
        css`
            height: 56px;
        `}
`;

export default observer(() => {
    const { pathname } = useLocation();
    const client = useClient();
    const state = useApplicationState();
    const { channel: channel_id } = useParams<{ channel: string }>();

    const channels = [...client.channels.values()].filter(
        (x) =>
            (x.channel_type === "DirectMessage" && x.active) ||
            x.channel_type === "Group",
    );

    const channel = client.channels.get(channel_id);

    // ! FIXME: move this globally
    // Track what page the user was last on (in home page).
    useEffect(() => state.layout.setLastHomePath(pathname), [pathname]);

    channels.sort((b, a) =>
        a.last_message_id_or_past.localeCompare(b.last_message_id_or_past),
    );

    // ! FIXME: must be a better way
    const incoming = [...client.users.values()].filter(
        (user) => user?.relationship === "Incoming",
    );

    return (
        <GenericSidebarBase mobilePadding>
            <Navbar>
                <Text id="app.home.directs" />
            </Navbar>
            <ConnectionStatus />
            <GenericSidebarList>
                <ConditionalLink active={pathname === "/"} to="/">
                    <ButtonItem active={pathname === "/"}>
                        <Home size={20} />
                        <span>
                            <Text id="app.navigation.tabs.home" />
                        </span>
                    </ButtonItem>
                </ConditionalLink>
                {!isTouchscreenDevice && (
                    <>
                        <ConditionalLink
                            active={pathname === "/friends"}
                            to="/friends">
                            <ButtonItem
                                active={pathname === "/friends"}
                                alert={
                                    incoming.length > 0 ? "mention" : undefined
                                }
                                alertCount={incoming.length}>
                                <UserDetail size={20} />
                                <span>
                                    <Text id="app.navigation.tabs.friends" />
                                </span>
                            </ButtonItem>
                        </ConditionalLink>
                    </>
                )}
                <ConditionalLink
                    active={channel?.channel_type === "SavedMessages"}
                    to="/open/saved">
                    <ButtonItem
                        active={channel?.channel_type === "SavedMessages"}>
                        <Notepad size={20} />
                        <span>
                            <Text id="app.navigation.tabs.saved" />
                        </span>
                    </ButtonItem>
                </ConditionalLink>
                {import.meta.env.DEV && (
                    <Link to="/dev">
                        <ButtonItem active={pathname === "/dev"}>
                            <Wrench size={20} />
                            <span>
                                <Text id="app.navigation.tabs.dev" />
                            </span>
                        </ButtonItem>
                    </Link>
                )}
                <Category>
                    <Text id="app.main.categories.conversations" />
                    <IconButton
                        onClick={() =>
                            modalController.push({
                                type: "create_group",
                            })
                        }>
                        <Plus size={16} />
                    </IconButton>
                </Category>
                {channels.length === 0 && (
                    <img src={placeholderSVG} loading="eager" />
                )}
                {channels.map((channel) => {
                    let user;
                    if (channel.channel_type === "DirectMessage") {
                        if (!channel.active) return null;
                        user = channel.recipient;

                        if (!user) return null;
                    }

                    const isUnread = channel.isUnread(state.notifications);
                    const mentionCount = channel.getMentions(
                        state.notifications,
                    ).length;

                    return (
                        <ConditionalLink
                            key={channel._id}
                            active={channel._id === channel_id}
                            to={`/channel/${channel._id}`}>
                            <ChannelButton
                                user={user}
                                channel={channel}
                                alert={
                                    mentionCount > 0
                                        ? "mention"
                                        : isUnread
                                        ? "unread"
                                        : undefined
                                }
                                alertCount={mentionCount}
                                active={channel._id === channel_id}
                            />
                        </ConditionalLink>
                    );
                })}
                <PaintCounter />
            </GenericSidebarList>
        </GenericSidebarBase>
    );
});
