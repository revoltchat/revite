import { Docked, OverlappingPanels, ShowIf } from "react-overlapping-panels";
import { isTouchscreenDevice } from "../lib/isTouchscreenDevice";
import { Switch, Route, useLocation } from "react-router-dom";
import styled from "styled-components";

import ContextMenus from "../lib/ContextMenus";
import Popovers from "../context/intermediate/Popovers";
import SyncManager from "../context/revoltjs/SyncManager";
import StateMonitor from "../context/revoltjs/StateMonitor";
import Notifications from "../context/revoltjs/Notifications";

import LeftSidebar from "../components/navigation/LeftSidebar";
import RightSidebar from "../components/navigation/RightSidebar";
import BottomNavigation from "../components/navigation/BottomNavigation";

import Open from "./Open";
import Home from './home/Home';
import Invite from "./invite/Invite";
import Friends from "./friends/Friends";
import Channel from "./channels/Channel";
import Settings from './settings/Settings';
import Developer from "./developer/Developer";
import ServerSettings from "./settings/ServerSettings";
import ChannelSettings from "./settings/ChannelSettings";

const Routes = styled.div`
    min-width: 0;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    background: var(--primary-background);
`;

export default function App() {
    const path = useLocation().pathname;
    const fixedBottomNav = (path === '/' || path === '/settings' || path.startsWith("/friends"));
    const inSettings = path.includes('/settings');
    const inChannel = path.includes('/channel');
    const inSpecial = (path.startsWith("/friends") && isTouchscreenDevice) || path.startsWith('/invite') || path.startsWith("/settings");

    return (
        <OverlappingPanels
            width="100vw"
            height="100vh"
            leftPanel={inSpecial ? undefined : { width: 292, component: <LeftSidebar /> }}
            rightPanel={(!inSettings && inChannel) ? { width: 240, component: <RightSidebar /> } : undefined}
            bottomNav={{
                component: <BottomNavigation />,
                showIf: fixedBottomNav ? ShowIf.Always : ShowIf.Left,
                height: 50
            }}
            docked={isTouchscreenDevice ? Docked.None : Docked.Left}>
            <Routes>
                <Switch>
                    <Route path="/server/:server/channel/:channel/settings/:page" component={ChannelSettings} />
                    <Route path="/server/:server/channel/:channel/settings" component={ChannelSettings} />
                    <Route path="/server/:server/settings/:page" component={ServerSettings} />
                    <Route path="/server/:server/settings" component={ServerSettings} />
                    <Route path="/channel/:channel/settings/:page" component={ChannelSettings} />
                    <Route path="/channel/:channel/settings" component={ChannelSettings} />

                    <Route path="/channel/:channel/message/:message" component={Channel} />
                    <Route path="/server/:server/channel/:channel" component={Channel} />
                    <Route path="/server/:server" />
                    <Route path="/channel/:channel" component={Channel} />
                    
                    <Route path="/settings/:page" component={Settings} />
                    <Route path="/settings" component={Settings} />

                    <Route path="/dev" component={Developer} />
                    <Route path="/friends" component={Friends} />
                    <Route path="/open/:id" component={Open} />
                    <Route path="/invite/:code" component={Invite} />
                    <Route path="/" component={Home} />
                </Switch>
            </Routes>
            <ContextMenus />
            <Popovers />
            <Notifications />
            <StateMonitor />
            <SyncManager />
        </OverlappingPanels>
    );
};
