import { Docked, OverlappingPanels, ShowIf } from "react-overlapping-panels";
import { Switch, Route, useLocation } from "react-router-dom";
import styled from "styled-components";

import ContextMenus from "../lib/ContextMenus";
import { isTouchscreenDevice } from "../lib/isTouchscreenDevice";

import Popovers from "../context/intermediate/Popovers";
import Notifications from "../context/revoltjs/Notifications";
import StateMonitor from "../context/revoltjs/StateMonitor";
import SyncManager from "../context/revoltjs/SyncManager";

import { Titlebar } from "../components/native/Titlebar";
import BottomNavigation from "../components/navigation/BottomNavigation";
import LeftSidebar from "../components/navigation/LeftSidebar";
import RightSidebar from "../components/navigation/RightSidebar";
import Open from "./Open";
import Channel from "./channels/Channel";
import Developer from "./developer/Developer";
import Friends from "./friends/Friends";
import Home from "./home/Home";
import Invite from "./invite/Invite";
import InviteBot from "./invite/InviteBot";
import ChannelSettings from "./settings/ChannelSettings";
import ServerSettings from "./settings/ServerSettings";
import Settings from "./settings/Settings";

const Routes = styled.div`
    min-width: 0;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    background: var(--primary-background);
`;

export default function App() {
    const path = useLocation().pathname;
    const fixedBottomNav =
        path === "/" || path === "/settings" || path.startsWith("/friends");
    const inChannel = path.includes("/channel");
    const inSpecial =
        (path.startsWith("/friends") && isTouchscreenDevice) ||
        path.startsWith("/invite") ||
        path.includes("/settings");

    return (
        <>
            {window.isNative && !window.native.getConfig().frame && (
                <Titlebar />
            )}
            <OverlappingPanels
                width="100vw"
                height={
                    window.isNative && !window.native.getConfig().frame
                        ? "calc(var(--app-height) - var(--titlebar-height))"
                        : "var(--app-height)"
                }
                leftPanel={
                    inSpecial
                        ? undefined
                        : { width: 288, component: <LeftSidebar /> }
                }
                rightPanel={
                    !inSpecial && inChannel
                        ? { width: 236, component: <RightSidebar /> }
                        : undefined
                }
                bottomNav={{
                    component: <BottomNavigation />,
                    showIf: fixedBottomNav ? ShowIf.Always : ShowIf.Left,
                    height: 50,
                }}
                docked={isTouchscreenDevice ? Docked.None : Docked.Left}>
                <Routes>
                    <Switch>
                        <Route
                            path="/server/:server/channel/:channel/settings/:page"
                            component={ChannelSettings}
                        />
                        <Route
                            path="/server/:server/channel/:channel/settings"
                            component={ChannelSettings}
                        />
                        <Route
                            path="/server/:server/settings/:page"
                            component={ServerSettings}
                        />
                        <Route
                            path="/server/:server/settings"
                            component={ServerSettings}
                        />
                        <Route
                            path="/channel/:channel/settings/:page"
                            component={ChannelSettings}
                        />
                        <Route
                            path="/channel/:channel/settings"
                            component={ChannelSettings}
                        />

                        <Route
                            path="/channel/:channel/:message"
                            component={Channel}
                        />
                        <Route
                            path="/server/:server/channel/:channel/:message"
                            component={Channel}
                        />

                        <Route
                            path="/server/:server/channel/:channel"
                            component={Channel}
                        />
                        <Route path="/server/:server" component={Channel} />
                        <Route path="/channel/:channel" component={Channel} />

                        <Route path="/settings/:page" component={Settings} />
                        <Route path="/settings" component={Settings} />

                        <Route path="/dev" component={Developer} />
                        <Route path="/friends" component={Friends} />
                        <Route path="/open/:id" component={Open} />
                        <Route path="/bot/:id" component={InviteBot} />
                        <Route path="/invite/:code?" component={Invite} />
                        <Route path="/" component={Home} />
                    </Switch>
                </Routes>
                <ContextMenus />
                <Popovers />
                <Notifications />
                <StateMonitor />
                <SyncManager />
            </OverlappingPanels>
        </>
    );
}
