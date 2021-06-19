import { Localizer, Text } from "preact-i18n";
import { useContext, useLayoutEffect } from "preact/hooks";
import { Home, Users, Tool, Settings, Save } from "@styled-icons/feather";

import { Link, Redirect, useHistory, useLocation, useParams } from "react-router-dom";
import { WithDispatcher } from "../../../redux/reducers";
import { Unreads } from "../../../redux/reducers/unreads";
import { connectState } from "../../../redux/connector";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { useChannels, useForceUpdate, useUsers } from "../../../context/revoltjs/hooks";
import { User } from "revolt.js";
import { Users as UsersNS } from 'revolt.js/dist/api/objects';
import { mapChannelWithUnread, useUnreads } from "./common";
import { Channels } from "revolt.js/dist/api/objects";
import UserIcon from '../../common/UserIcon';
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import ConnectionStatus from '../items/ConnectionStatus';
import UserStatus from '../../common/UserStatus';
import ButtonItem, { ChannelButton } from '../items/ButtonItem';
import styled from "styled-components";
import Header from '../../ui/Header';
import UserHeader from "../../common/UserHeader";
import Category from '../../ui/Category';
import PaintCounter from "../../../lib/PaintCounter";

type Props = WithDispatcher & {
    unreads: Unreads;
}

const HomeBase = styled.div`
    height: 100%;
    width: 240px;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    background: var(--secondary-background);
`;

const HomeList = styled.div`
    padding: 6px;
    flex-grow: 1;
    overflow-y: scroll;

    > svg {
        width: 100%;
    }
`;

function HomeSidebar(props: Props) {
    const { pathname } = useLocation();
    const { client } = useContext(AppContext);
    const { channel } = useParams<{ channel: string }>();
    // const { openScreen, writeClipboard } = useContext(IntermediateContext);

    const ctx = useForceUpdate();
    const users = useUsers(undefined, ctx);
    const channels = useChannels(undefined, ctx);

    const obj = channels.find(x => x?._id === channel);
    if (channel && !obj) return <Redirect to="/" />;
    if (obj) useUnreads({ ...props, channel: obj });

    const channelsArr = (channels
        .filter(
            x => x && (x.channel_type === "Group" || (x.channel_type === 'DirectMessage' && x.active))
        ) as (Channels.GroupChannel | Channels.DirectMessageChannel)[])
        .map(x => mapChannelWithUnread(x, props.unreads));

    channelsArr.sort((b, a) => a.timestamp.localeCompare(b.timestamp));

    return (
        <HomeBase>
            <UserHeader user={client.user!} />
            <ConnectionStatus />
            <HomeList>
                {!isTouchscreenDevice && (
                    <>
                        <Link to="/">
                            <ButtonItem active={pathname === "/"}>
                                <Home size={20} />
                                <span><Text id="app.navigation.tabs.home" /></span>
                            </ButtonItem>
                        </Link>
                        <Link to="/friends">
                            <ButtonItem
                                active={pathname === "/friends"}
                                alert={
                                    typeof users.find(
                                        user =>
                                            user?.relationship ===
                                            UsersNS.Relationship.Incoming
                                    ) !== "undefined" ? 'unread' : undefined
                                }
                            >
                                <Users size={20} />
                                <span><Text id="app.navigation.tabs.friends" /></span>
                            </ButtonItem>
                        </Link>
                    </>
                )}
                <Link to="/open/saved">
                    <ButtonItem active={obj?.channel_type === "SavedMessages"}>
                        <Save size={20} />
                        <span><Text id="app.navigation.tabs.saved" /></span>
                    </ButtonItem>
                </Link>
                {import.meta.env.DEV && (
                    <Link to="/dev">
                        <ButtonItem active={pathname === "/dev"}>
                            <Tool size={20} />
                            <span><Text id="app.navigation.tabs.dev" /></span>
                        </ButtonItem>
                    </Link>
                )}
                <Localizer>
                    <Category
                        text={
                            (
                                <Text id="app.main.categories.conversations" />
                            ) as any
                        }
                        action={() => /*openScreen({ id: "special_input", type: "create_group" })*/{}}
                    />
                </Localizer>
                {channelsArr.length === 0 && <img src="/assets/images/placeholder.svg" />}
                {channelsArr.map(x => {
                    let user;
                    if (x.channel_type === 'DirectMessage') {
                        let recipient = client.channels.getRecipient(x._id);
                        user = users.find(x => x!._id === recipient);
                    }
                    
                    return (
                        <Link to={`/channel/${x._id}`}>
                            <ChannelButton
                                user={user}
                                channel={x}
                                alert={x.unread}
                                alertCount={x.alertCount}
                                active={x._id === channel}
                            />
                        </Link>
                    );
                })}
                <PaintCounter />
            </HomeList>
        </HomeBase>
    );
};

export default connectState(
    HomeSidebar,
    state => {
        return {
            unreads: state.unreads
        };
    },
    true,
    true
);
