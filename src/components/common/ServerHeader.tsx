import { Cog } from "@styled-icons/boxicons-solid";
import { Link } from "react-router-dom";
import { Server } from "revolt.js/dist/api/objects";
import { ServerPermission } from "revolt.js/dist/api/permissions";
import styled from "styled-components";

import { HookContext, useServerPermission } from "../../context/revoltjs/hooks";

import Header from "../ui/Header";
import IconButton from "../ui/IconButton";

interface Props {
    server: Server;
    ctx: HookContext;
}

const ServerName = styled.div`
    flex-grow: 1;
`;

export default function ServerHeader({ server, ctx }: Props) {
    const permissions = useServerPermission(server._id, ctx);
    const bannerURL = ctx.client.servers.getBannerURL(
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
}
