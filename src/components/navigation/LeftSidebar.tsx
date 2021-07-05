import { Route, Switch } from "react-router";

import SidebarBase from "./SidebarBase";
import HomeSidebar from "./left/HomeSidebar";
import ServerListSidebar from "./left/ServerListSidebar";
import ServerSidebar from "./left/ServerSidebar";

export default function LeftSidebar() {
	return (
		<SidebarBase>
			<Switch>
				<Route path="/settings" />
				<Route path="/server/:server/channel/:channel">
					<ServerListSidebar />
					<ServerSidebar />
				</Route>
				<Route path="/server/:server">
					<ServerListSidebar />
					<ServerSidebar />
				</Route>
				<Route path="/channel/:channel">
					<ServerListSidebar />
					<HomeSidebar />
				</Route>
				<Route path="/">
					<ServerListSidebar />
					<HomeSidebar />
				</Route>
			</Switch>
		</SidebarBase>
	);
}
