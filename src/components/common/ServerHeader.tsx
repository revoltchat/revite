import Header from "../ui/Header";
import styled from "styled-components";
import { Link } from "react-router-dom";
import IconButton from "../ui/IconButton";
import { Cog } from "@styled-icons/boxicons-solid";
import { Server } from "revolt.js/dist/api/objects";
import { ServerPermission } from "revolt.js/dist/api/permissions";
import { HookContext, useServerPermission } from "../../context/revoltjs/hooks";

interface Props {
    server: Server,
    ctx: HookContext
}

const ServerName = styled.div`
    flex-grow: 1;
`;

export default function ServerHeader({ server, ctx }: Props) {
    const permissions = useServerPermission(server._id, ctx);
    const bannerURL = ctx.client.servers.getBannerURL(server._id, { width: 480 }, true);

    return (
        <Header placement="secondary"
            background={typeof bannerURL !== 'undefined'}
            style={{ background: bannerURL ? `linear-gradient(to bottom, transparent 50%, #000e), url('${bannerURL}')` : undefined }}>
            <ServerName>
                { server.name }
            </ServerName>
            { (permissions & ServerPermission.ManageServer) > 0 && <div className="actions">
                <Link to={`/server/${server._id}/settings`}>
                    <IconButton>
                        <Cog size={24} />
                    </IconButton>
                </Link>
            </div> }
        </Header>
    )
}
