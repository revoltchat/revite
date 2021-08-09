import { Route, Switch } from "react-router";

import { useEffect, useState } from "preact/hooks";

import { internalSubscribe } from "../../lib/eventEmitter";

import SidebarBase from "./SidebarBase";
import MemberSidebar from "./right/MemberSidebar";
import { SearchSidebar } from "./right/Search";

export default function RightSidebar() {
    const [sidebar, setSidebar] = useState<"search" | undefined>();
    const close = () => setSidebar(undefined);

    useEffect(
        () =>
            internalSubscribe(
                "RightSidebar",
                "open",
                setSidebar as (...args: unknown[]) => void,
            ),
        [setSidebar],
    );

    if (sidebar === "search") {
        return <SearchSidebar close={close} />;
    }

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
}
