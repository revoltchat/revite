import { Localizer, Text } from "preact-i18n";
import { useContext, useEffect } from "preact/hooks";
import { Home, Group, Wrench, Save } from "@styled-icons/boxicons-regular";

import Category from '../../ui/Category';
import PaintCounter from "../../../lib/PaintCounter";
import UserHeader from "../../common/user/UserHeader";
import { Channels } from "revolt.js/dist/api/objects";
import { connectState } from "../../../redux/connector";
import ConnectionStatus from '../items/ConnectionStatus';
import { WithDispatcher } from "../../../redux/reducers";
import { Unreads } from "../../../redux/reducers/unreads";
import ConditionalLink from "../../../lib/ConditionalLink";
import { mapChannelWithUnread, useUnreads } from "./common";
import { Users as UsersNS } from 'revolt.js/dist/api/objects';
import ButtonItem, { ChannelButton } from '../items/ButtonItem';
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { GenericSidebarBase, GenericSidebarList } from "../SidebarBase";
import { Link, Redirect, useLocation, useParams } from "react-router-dom";
import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useDMs, useForceUpdate, useUsers } from "../../../context/revoltjs/hooks";

type Props = WithDispatcher & {
    unreads: Unreads;
}

function HomeSidebar(props: Props) {
    const { pathname } = useLocation();
    const client = useContext(AppContext);
    const { channel } = useParams<{ channel: string }>();
    const { openScreen } = useIntermediate();

    const ctx = useForceUpdate();
    const channels = useDMs(ctx);

    const obj = channels.find(x => x?._id === channel);
    if (channel && !obj) return <Redirect to="/" />;
    if (obj) useUnreads({ ...props, channel: obj });

    useEffect(() => {
        if (!channel) return;

        props.dispatcher({
            type: 'LAST_OPENED_SET',
            parent: 'home',
            child: channel
        });
    }, [ channel ]);

    const channelsArr = channels
        .filter(x => x.channel_type !== 'SavedMessages')
        .map(x => mapChannelWithUnread(x, props.unreads));

    const users = useUsers(
        (channelsArr as (Channels.DirectMessageChannel | Channels.GroupChannel)[])
            .reduce((prev: any, cur) => [ ...prev, ...cur.recipients ], [])
    , ctx);

    channelsArr.sort((b, a) => a.timestamp.localeCompare(b.timestamp));

    return (
        <GenericSidebarBase padding>
            <UserHeader user={client.user!} />
            <ConnectionStatus />
            <GenericSidebarList>
                {!isTouchscreenDevice && (
                    <>
                        <ConditionalLink active={pathname === "/"} to="/">
                            <ButtonItem active={pathname === "/"}>
                                <Home size={20} />
                                <span><Text id="app.navigation.tabs.home" /></span>
                            </ButtonItem>
                        </ConditionalLink>
                        <ConditionalLink active={pathname === "/friends"} to="/friends">
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
                                <Group size={20} />
                                <span><Text id="app.navigation.tabs.friends" /></span>
                            </ButtonItem>
                        </ConditionalLink>
                    </>
                )}
                <ConditionalLink active={obj?.channel_type === "SavedMessages"} to="/open/saved">
                    <ButtonItem active={obj?.channel_type === "SavedMessages"}>
                        <Save size={20} />
                        <span><Text id="app.navigation.tabs.saved" /></span>
                    </ButtonItem>
                </ConditionalLink>
                {import.meta.env.DEV && (
                    <Link to="/dev">
                        <ButtonItem active={pathname === "/dev"}>
                            <Wrench size={20} />
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
                        action={() => openScreen({ id: "special_input", type: "create_group" })}
                    />
                </Localizer>
                {channelsArr.length === 0 && <img src="/assets/images/placeholder.svg" />}
                {channelsArr.map(x => {
                    let user;
                    if (x.channel_type === 'DirectMessage') {
                        if (!x.active) return null;

                        let recipient = client.channels.getRecipient(x._id);
                        user = users.find(x => x?._id === recipient);

                        if (!user) {
                            console.warn(`Skipped DM ${x._id} because user was missing.`);
                            return null;
                        }
                    }
                    
                    return (
                        <ConditionalLink active={x._id === channel} to={`/channel/${x._id}`}>
                            <ChannelButton
                                user={user}
                                channel={x}
                                alert={x.unread}
                                alertCount={x.alertCount}
                                active={x._id === channel}
                            />
                        </ConditionalLink>
                    );
                })}
                <PaintCounter />
            </GenericSidebarList>
        </GenericSidebarBase>
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
