import { Route, Switch } from "react-router";

import SidebarBase from "./SidebarBase";
import HomeSidebar from "./left/HomeSidebar";
import ServerListSidebar from "./left/ServerListSidebar";
import ServerSidebar from "./left/ServerSidebar";
import { useSelector } from "react-redux";
import { State } from "../../redux";

export default function LeftSidebar() {
    const isOpen = useSelector((state: State) => state.sectionToggle['sidebar_channels'] ?? true)

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
}
