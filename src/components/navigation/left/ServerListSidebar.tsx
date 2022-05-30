import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";

import { useCallback } from "preact/hooks";

import { ServerList } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

/**
 * Server list sidebar shim component
 */
export default observer(() => {
    const client = useClient();
    const state = useApplicationState();
    const { openScreen } = useIntermediate();
    const { server: server_id } = useParams<{ server?: string }>();

    const createServer = useCallback(
        () =>
            openScreen({
                id: "special_input",
                type: "create_server",
            }),
        [],
    );

    return (
        <ServerList
            client={client}
            active={server_id}
            createServer={createServer}
            permit={state.notifications}
            home={state.layout.getLastHomePath}
            servers={state.ordering.orderedServers}
            reorder={state.ordering.reorderServer}
        />
    );
});
