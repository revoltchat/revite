import { Docked, OverlappingPanels, ShowIf } from "react-overlapping-panels";
import { Switch, Route, useLocation } from "react-router-dom";
import styled, { css } from "styled-components/macro";

import ContextMenus from "../lib/ContextMenus";
import { isTouchscreenDevice } from "../lib/isTouchscreenDevice";

import { useApplicationState } from "../mobx/State";
import { SIDEBAR_CHANNELS } from "../mobx/stores/Layout";

import Popovers from "../context/intermediate/Popovers";
import Notifications from "../context/revoltjs/Notifications";
import StateMonitor from "../context/revoltjs/StateMonitor";

import { Titlebar } from "../components/native/Titlebar";
import BottomNavigation from "../components/navigation/BottomNavigation";
import LeftSidebar from "../components/navigation/LeftSidebar";
import RightSidebar from "../components/navigation/RightSidebar";
import Open from "./Open";
import Channel from "./channels/Channel";
import Developer from "./developer/Developer";
import Discover from "./discover/Discover";
import Friends from "./friends/Friends";
import Home from "./home/Home";
import InviteBot from "./invite/InviteBot";
import ChannelSettings from "./settings/ChannelSettings";
import ServerSettings from "./settings/ServerSettings";
import Settings from "./settings/Settings";

const AppContainer = styled.div`
    background-size: cover !important;
    background-position: center center !important;
`;

const StatusBar = styled.div`
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    gap: 14px;

    .button {
        padding: 5px;
        border: 1px solid white;
        border-radius: var(--border-radius);
    }
`;

const Routes = styled.main.attrs({ "data-component": "routes", id: "main" })<{
    borders: boolean;
}>`
    min-width: 0;
    display: flex;
    position: relative;
    flex-direction: column;

    background: var(--primary-background);

    /*background-color: rgba(
        var(--primary-background-rgb),
        max(var(--min-opacity), 0.75)
    );*/
    //backdrop-filter: blur(10px);

    ${() =>
        isTouchscreenDevice &&
        css`
            overflow: hidden;
        `}

    ${(props) =>
        props.borders &&
        css`
            border-start-start-radius: 8px;
        `}
`;

export default function App() {
    const path = useLocation().pathname;
    const fixedBottomNav =
        path === "/" ||
        path === "/settings" ||
        path.startsWith("/friends") ||
        path.startsWith("/discover");
    const inChannel = path.includes("/channel");
    const inServer = path.includes("/server");
    const inSpecial =
        (path.startsWith("/friends") && isTouchscreenDevice) ||
        path.startsWith("/invite") ||
        path.includes("/settings");

    return (
        <>
            {/*<StatusBar>
                <div className="title">Planned outage: CDN (~2 hours)</div>
                <div className="button">View status</div>
            </StatusBar>*/}
            <AppContainer>
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
                    <Routes borders={inServer}>
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
                            <Route
                                path="/channel/:channel"
                                component={Channel}
                            />

                            <Route
                                path="/settings/:page"
                                component={Settings}
                            />
                            <Route path="/settings" component={Settings} />

                            <Route path="/discover" component={Discover} />

                            <Route path="/dev" component={Developer} />
                            <Route path="/friends" component={Friends} />
                            <Route path="/open/:id" component={Open} />
                            <Route path="/bot/:id" component={InviteBot} />
                            <Route path="/" component={Home} />
                        </Switch>
                    </Routes>
                    <ContextMenus />
                    <Popovers />
                    <Notifications />
                    <StateMonitor />
                </OverlappingPanels>
            </AppContainer>
        </>
    );
}
