import { Cog, FolderOpen, Group } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import styled from "styled-components/macro";

import { useClient } from "../../controllers/client/ClientController";
import ClientList from "./panes/ClientList";
import Files from "./panes/Files";
import Jobs from "./panes/Jobs";
import NewClientPane from "./panes/NewClient";

const Layout = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
    background: var(--primary-background);
`;

const Sidebar = styled.div`
    width: 218px;
    flex-shrink: 0;
    background: var(--secondary-background);
    display: flex;
    flex-direction: column;
    padding: 16px 8px;
    gap: 2px;
`;

const SidebarLabel = styled.div`
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--secondary-foreground);
    padding: 4px 8px 8px;
    letter-spacing: 0.04em;
`;

const NavItem = styled(Link)<{ active?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--border-radius);
    font-size: 14px;
    font-weight: 500;
    color: ${(p) => (p.active ? "var(--foreground)" : "var(--secondary-foreground)")};
    background: ${(p) => (p.active ? "var(--tertiary-background)" : "transparent")};
    text-decoration: none;

    &:hover {
        background: var(--tertiary-background);
        color: var(--foreground);
    }
`;

const Content = styled.div`
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 40px 48px;
`;

export default observer(() => {
    const client = useClient();
    const { pathname } = useLocation();

    if (!client?.user?.privileged) {
        return (
            <div style={{ padding: 40, color: "var(--foreground)" }}>
                Not authorized.
            </div>
        );
    }

    const onClients =
        pathname === "/admin" ||
        pathname.startsWith("/admin/clients");
    const onJobs = pathname.startsWith("/admin/jobs");
    const onFiles = pathname.startsWith("/admin/files");

    return (
        <Layout>
            <Sidebar>
                <SidebarLabel>Admin</SidebarLabel>
                <NavItem to="/admin/clients" active={onClients}>
                    <Group size={16} />
                    Clients
                </NavItem>
                <NavItem to="/admin/jobs" active={onJobs}>
                    <Cog size={16} />
                    Jobs
                </NavItem>
                <NavItem to="/admin/files" active={onFiles}>
                    <FolderOpen size={16} />
                    Files
                </NavItem>
            </Sidebar>
            <Content>
                <Switch>
                    <Route path="/admin/clients/new">
                        <NewClientPane />
                    </Route>
                    <Route path="/admin/clients">
                        <ClientList />
                    </Route>
                    <Route path="/admin/jobs">
                        <Jobs />
                    </Route>
                    <Route path="/admin/files">
                        <Files />
                    </Route>
                    <Route>
                        <ClientList />
                    </Route>
                </Switch>
            </Content>
        </Layout>
    );
});
