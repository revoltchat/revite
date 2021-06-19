import { Docked, OverlappingPanels } from "react-overlapping-panels";
import { isTouchscreenDevice } from "../lib/isTouchscreenDevice";
import { Switch, Route } from "react-router-dom";

import LeftSidebar from "../components/navigation/LeftSidebar";
import RightSidebar from "../components/navigation/RightSidebar";

import Home from './home/Home';
import Popovers from "../context/intermediate/Popovers";

export default function App() {
    return (
        <OverlappingPanels
            width="100vw"
            height="100%"
            leftPanel={{ width: 292, component: <LeftSidebar /> }}
            rightPanel={{ width: 240, component: <RightSidebar /> }}
            docked={isTouchscreenDevice ? Docked.None : Docked.Left}>
            <Switch>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
            <Popovers />
        </OverlappingPanels>
    );
};
