import { observer } from "mobx-react-lite";
import { Route, Switch } from "react-router";

import { internalEmit } from "../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";
import { KeybindAction } from "../../mobx/stores/Keybinds";
import { SIDEBAR_CHANNELS } from "../../mobx/stores/Layout";

import SidebarBase from "./SidebarBase";
import HomeSidebar from "./left/HomeSidebar";
import ServerListSidebar from "./left/ServerListSidebar";
import ServerSidebar from "./left/ServerSidebar";

export default observer(() => {
    const state = useApplicationState();
    const isOpen =
        isTouchscreenDevice ||
        state.layout.getSectionState(SIDEBAR_CHANNELS, true);

    const emit = (event: string, direction: number) => () =>
        internalEmit("LeftSidebar", event, direction);

    state.keybinds.useAction(
        KeybindAction.NavigateChannelUp,
        emit("navigate_channels", -1),
    );

    state.keybinds.useAction(
        KeybindAction.NavigateChannelDown,
        emit("navigate_channels", 1),
    );

    state.keybinds.useAction(
        KeybindAction.NavigateServerUp,
        emit("navigate_servers", -1),
    );

    state.keybinds.useAction(
        KeybindAction.NavigateServerDown,
        emit("navigate_servers", 1),
    );

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
