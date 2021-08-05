import {
    Home,
    UserDetail,
    Wrench,
    Notepad,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link, Redirect, useLocation, useParams } from "react-router-dom";
import { RelationshipStatus } from "revolt-api/types/Users";

import { Text } from "preact-i18n";
import { useContext, useEffect } from "preact/hooks";

import ConditionalLink from "../../../lib/ConditionalLink";
import PaintCounter from "../../../lib/PaintCounter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";
import { Unreads } from "../../../redux/reducers/unreads";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Category from "../../ui/Category";
import placeholderSVG from "../items/placeholder.svg";
import { mapChannelWithUnread, useUnreads } from "./common";

import { GenericSidebarBase, GenericSidebarList } from "../SidebarBase";
import ButtonItem, { ChannelButton } from "../items/ButtonItem";
import ConnectionStatus from "../items/ConnectionStatus";

type Props = {
    unreads: Unreads;
};

const HomeSidebar = observer((props: Props) => {
    const { pathname } = useLocation();
    const client = useContext(AppContext);
    const { channel } = useParams<{ channel: string }>();
    const { openScreen } = useIntermediate();

    const channels = [...client.channels.values()]
        .filter(
            (x) =>
                x.channel_type === "DirectMessage" ||
                x.channel_type === "Group",
        )
        .map((x) => mapChannelWithUnread(x, props.unreads));

    const obj = client.channels.get(channel);
    if (channel && !obj) return <Redirect to="/" />;
    if (obj) useUnreads({ ...props, channel: obj });

    useEffect(() => {
        if (!channel) return;

        dispatch({
            type: "LAST_OPENED_SET",
            parent: "home",
            child: channel,
        });
    }, [channel]);

    channels.sort((b, a) => a.timestamp.localeCompare(b.timestamp));

    return (
        <GenericSidebarBase padding>
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
                                    typeof [...client.users.values()].find(
                                        (user) =>
                                            user?.relationship ===
                                            RelationshipStatus.Incoming,
                                    ) !== "undefined"
                                        ? "unread"
                                        : undefined
                                }>
                                <UserDetail size={20} />
                                <span>
                                    <Text id="app.navigation.tabs.friends" />
                                </span>
                            </ButtonItem>
                        </ConditionalLink>
                    </>
                )}
                <ConditionalLink
                    active={obj?.channel_type === "SavedMessages"}
                    to="/open/saved">
                    <ButtonItem active={obj?.channel_type === "SavedMessages"}>
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
                <Category
                    text={<Text id="app.main.categories.conversations" />}
                    action={() =>
                        openScreen({
                            id: "special_input",
                            type: "create_group",
                        })
                    }
                />
                {channels.length === 0 && (
                    <img src={placeholderSVG} loading="eager" />
                )}
                {channels.map((x) => {
                    let user;
                    if (x.channel.channel_type === "DirectMessage") {
                        if (!x.channel.active) return null;
                        user = x.channel.recipient;

                        if (!user) {
                            console.warn(
                                `Skipped DM ${x.channel._id} because user was missing.`,
                            );
                            return null;
                        }
                    }

                    return (
                        <ConditionalLink
                            key={x.channel._id}
                            active={x.channel._id === channel}
                            to={`/channel/${x.channel._id}`}>
                            <ChannelButton
                                user={user}
                                channel={x.channel}
                                alert={x.unread}
                                alertCount={x.alertCount}
                                active={x.channel._id === channel}
                            />
                        </ConditionalLink>
                    );
                })}
                <PaintCounter />
            </GenericSidebarList>
        </GenericSidebarBase>
    );
});

export default connectState(
    HomeSidebar,
    (state) => {
        return {
            unreads: state.unreads,
        };
    },
    true,
);
