import { Docked, OverlappingPanels } from "react-overlapping-panels";
import { isTouchscreenDevice } from "../lib/isTouchscreenDevice";
import { Switch, Route } from "react-router-dom";
import styled from "styled-components";

import Popovers from "../context/intermediate/Popovers";
import ContextMenus from "../lib/ContextMenus";

import LeftSidebar from "../components/navigation/LeftSidebar";
import RightSidebar from "../components/navigation/RightSidebar";

import Home from './home/Home';
import Friends from "./friends/Friends";
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
    return (
        <OverlappingPanels
            width="100vw"
            height="100%"
            leftPanel={{ width: 292, component: <LeftSidebar /> }}
            rightPanel={{ width: 240, component: <RightSidebar /> }}
            docked={isTouchscreenDevice ? Docked.None : Docked.Left}>
            <Routes>
                <Switch>
                    <Route path="/server/:server/channel/:channel/settings/:page" component={ChannelSettings} />
                    <Route path="/server/:server/channel/:channel/settings" component={ChannelSettings} />
                    <Route path="/server/:server/settings/:page" component={ServerSettings} />
                    <Route path="/server/:server/settings" component={ServerSettings} />
                    <Route path="/channel/:channel/settings/:page" component={ChannelSettings} />
                    <Route path="/channel/:channel/settings" component={ChannelSettings} />
                    
                    <Route path="/settings/:page" component={Settings} />
                    <Route path="/settings" component={Settings} />

                    <Route path="/dev" component={Developer} />
                    <Route path="/friends" component={Friends} />
                    <Route path="/" component={Home} />
                </Switch>
            </Routes>
            <ContextMenus />
            <Popovers />
        </OverlappingPanels>
    );
};

/**
 * 
 * <Route path="/channel/:channel/message/:message">
                            <ChannelWrapper />
                        </Route> 

                        <Route path="/server/:server/channel/:channel">
                            <ChannelWrapper />
                        </Route>
                        <Route path="/server/:server" />
                        <Route path="/channel/:channel">
                            <ChannelWrapper />
                        </Route>
                        
                        <Route path="/open/:id">
                            <Open />
                        </Route>
                        {/*<Route path="/invite/:code">
                            <OpenInvite />
                        </Route>
 */
