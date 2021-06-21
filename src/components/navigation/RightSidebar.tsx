import { Route, Switch } from "react-router";
import SidebarBase from "./SidebarBase";

import MemberSidebar from "./right/MemberSidebar";

export default function RightSidebar() {
    return (
        <SidebarBase>
            <Switch>
                <Route path="/server/:server/channel/:channel">
                    <MemberSidebar />
                </Route>
                <Route path="/channel/:channel">
                    <MemberSidebar />
                </Route>
            </Switch>
        </SidebarBase>
    );
};
