import { Docked, OverlappingPanels, ShowIf } from "react-overlapping-panels";
import { Switch, Route, useLocation, Link } from "react-router-dom";
import styled, { css } from "styled-components/macro";

import { useEffect, useState } from "preact/hooks";

import ContextMenus from "../lib/ContextMenus";
import { isTouchscreenDevice } from "../lib/isTouchscreenDevice";

import { Titlebar } from "../components/native/Titlebar";
import BottomNavigation from "../components/navigation/BottomNavigation";
import LeftSidebar from "../components/navigation/LeftSidebar";
import RightSidebar from "../components/navigation/RightSidebar";
import { useSystemAlert } from "../updateWorker";
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
    //gap: 14px;
    gap: 8px;

    user-select: none;

    .button {
        padding: 5px;
        border: 1px solid white;
        border-radius: var(--border-radius);
    }

    a {
        cursor: pointer;
        color: var(--foreground);
    }

    .title {
        flex-grow: 1;
        text-align: center;
    }

    .actions {
        gap: 12px;
        display: flex;
        padding-right: 4px;
    }
`;

const Routes = styled.div.attrs({ "data-component": "routes" })<{
    borders: boolean;
}>`
    min-width: 0;
    display: flex;
    position: relative;
    flex-direction: column;

    background: var(--primary-background);

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

    const alert = useSystemAlert();
    const [statusBar, setStatusBar] = useState(false);
    useEffect(() => setStatusBar(true), [alert]);

    return (
        <>
            {alert && statusBar && (
                <StatusBar>
                    <div className="title">{alert.text}</div>
                    <div className="actions">
                        {alert.actions?.map((action) =>
                            action.type === "internal" ? (
                                <Link to={action.href}>
                                    <div className="button">{action.text}</div>
                                </Link>
                            ) : action.type === "external" ? (
                                <a
                                    href={action.href}
                                    target="_blank"
                                    rel="noreferrer">
                                    <div className="button">{action.text}</div>{" "}
                                </a>
                            ) : null,
                        )}
                        {alert.dismissable !== false && (
                            <a onClick={() => setStatusBar(false)}>
                                <div className="button">Dismiss</div>
                            </a>
                        )}
                    </div>
                </StatusBar>
            )}
            <AppContainer>
                {window.isNative && !window.native.getConfig().frame && (
                    <Titlebar />
                )}
                <OverlappingPanels
                    width="100vw"
                    height={
                        (alert && statusBar ? "calc(" : "") +
                        (window.isNative && !window.native.getConfig().frame
                            ? "calc(var(--app-height) - var(--titlebar-height))"
                            : "var(--app-height)") +
                        (alert && statusBar ? " - 40px)" : "")
                    }
                    leftPanel={
                        inSpecial
                            ? undefined
                            : { width: 290, component: <LeftSidebar /> }
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
                </OverlappingPanels>
            </AppContainer>
        </>
    );
}
