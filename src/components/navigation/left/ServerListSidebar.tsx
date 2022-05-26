import { observer } from "mobx-react-lite";
import { Link, useParams } from "react-router-dom";

import { ServerList } from "@revoltchat/ui";

import { useClient } from "../../../context/revoltjs/RevoltClient";

export default observer(() => {
    const client = useClient();

    const { server: server_id } = useParams<{ server?: string }>();
    const servers = [...client.servers.values()];

    return (
        <ServerList
            active={server_id!}
            servers={servers as any}
            linkComponent={({ id, children }) => (
                <Link to={`/server/${id}`}>
                    <a>{children}</a>
                </Link>
            )}
        />
    );
});
