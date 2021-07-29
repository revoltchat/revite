import { Cog } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { ServerPermission } from "revolt.js/dist/api/permissions";
import styled from "styled-components";

import { Server } from "../../mobx";

import { useClient } from "../../context/revoltjs/RevoltClient";
import { useServerPermission } from "../../context/revoltjs/hooks";

import Header from "../ui/Header";
import IconButton from "../ui/IconButton";

interface Props {
    server: Server;
}

const ServerName = styled.div`
    flex-grow: 1;
`;

export default observer(({ server }: Props) => {
    const permissions = useServerPermission(server._id);
    const client = useClient();

    const bannerURL = client.servers.getBannerURL(
        server._id,
        { width: 480 },
        true,
    );

    return (
        <Header
            borders
            placement="secondary"
            background={typeof bannerURL !== "undefined"}
            style={{
                background: bannerURL ? `url('${bannerURL}')` : undefined,
            }}>
            <ServerName>{server.name}</ServerName>
            {(permissions & ServerPermission.ManageServer) > 0 && (
                <div className="actions">
                    <Link to={`/server/${server._id}/settings`}>
                        <IconButton>
                            <Cog size={24} />
                        </IconButton>
                    </Link>
                </div>
            )}
        </Header>
    );
});
