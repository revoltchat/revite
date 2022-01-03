import { observer } from "mobx-react-lite";
import { Route, Switch } from "react-router";

import { internalEmit } from "../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";
import { SIDEBAR_CHANNELS } from "../../mobx/stores/Layout";

import SidebarBase from "./SidebarBase";
import HomeSidebar from "./left/HomeSidebar";
import ServerListSidebar from "./left/ServerListSidebar";
import ServerSidebar from "./left/ServerSidebar";

export default observer(() => {
    const layout = useApplicationState().layout;
    const isOpen =
        isTouchscreenDevice || layout.getSectionState(SIDEBAR_CHANNELS, true);

    // Register events here to reduce keybind conflicts.
    document.body.addEventListener("keydown", (e) => {
        const emit = (event: string, direction: number) => {
            e.preventDefault();
            internalEmit("LeftSidebar", event, direction);
        };

        if (e.ctrlKey && e.altKey && e.key === "ArrowUp")
            return emit("navigate_servers", -1);

        if (e.ctrlKey && e.altKey && e.key === "ArrowDown")
            return emit("navigate_servers", 1);

        if (e.altKey && e.key === "ArrowUp")
            return emit("navigate_channels", -1);

        if (e.altKey && e.key === "ArrowDown")
            return emit("navigate_channels", 1);
    });

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
