import { Shield } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory, useLocation, useParams } from "react-router-dom";
import styled from "styled-components/macro";

import { useCallback } from "preact/hooks";

import { ServerList } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

import { useClient } from "../../../controllers/client/ClientController";
import { modalController } from "../../../controllers/modals/ModalController";
import { IS_REVOLT } from "../../../version";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const ServerListFill = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: row;
`;

const AdminButton = styled.div<{ active: boolean }>`
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    color: ${(p) => (p.active ? "var(--accent)" : "var(--secondary-foreground)")};
    &:hover { color: var(--foreground); }
`;

/**
 * Server list sidebar shim component
 */
export default observer(() => {
    const client = useClient();
    const state = useApplicationState();
    const history = useHistory();
    const { pathname } = useLocation();
    const { server: server_id } = useParams<{ server?: string }>();

    const createServer = useCallback(
        () =>
            modalController.push({
                type: "create_server",
            }),
        [],
    );

    return (
        <Wrapper>
            <ServerListFill>
                <ServerList
                    client={client}
                    active={server_id}
                    createServer={client?.user?.privileged ? createServer : undefined}
                    permit={state.notifications}
                    home={state.layout.getLastHomePath}
                    servers={state.ordering.orderedServers}
                    reorder={state.ordering.reorderServer}
                    showDiscovery={IS_REVOLT}
                />
            </ServerListFill>
            {client?.user?.privileged && (
                <AdminButton
                    active={pathname.startsWith("/admin")}
                    onClick={() => history.push("/admin")}>
                    <Shield size={24} />
                </AdminButton>
            )}
        </Wrapper>
    );
});
