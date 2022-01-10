import { observer } from "mobx-react-lite";
import { Route, Switch } from "react-router";
import { useLocation } from "react-router-dom";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";
import { SIDEBAR_CHANNELS } from "../../mobx/stores/Layout";

import SidebarBase from "./SidebarBase";
import HomeSidebar from "./left/HomeSidebar";
import ServerListSidebar from "./left/ServerListSidebar";
import ServerSidebar from "./left/ServerSidebar";

export default observer(() => {
    const layout = useApplicationState().layout;
    const { pathname } = useLocation();
    const isOpen =
        !pathname.startsWith("/discover") &&
        (isTouchscreenDevice || layout.getSectionState(SIDEBAR_CHANNELS, true));

    return (
        <SidebarBase>
            <Switch>
                <Route path="/settings" />
                <Route path="/server/:server/channel/:channel">
                    <ServerListSidebar />
                    {isOpen && <ServerSidebar />}
                </Route>
                <Route path="/server/:server">
                    <ServerListSidebar />
                    {isOpen && <ServerSidebar />}
                </Route>
                <Route path="/channel/:channel">
                    <ServerListSidebar />
                    {isOpen && <HomeSidebar />}
                </Route>
                <Route path="/">
                    <ServerListSidebar />
                    {isOpen && <HomeSidebar />}
                </Route>
            </Switch>
        </SidebarBase>
    );
});
