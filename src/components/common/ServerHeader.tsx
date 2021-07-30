import { Cog } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { ServerPermission } from "revolt.js/dist/api/permissions";
import { Server } from "revolt.js/dist/maps/Servers";
import styled from "styled-components";

import Header from "../ui/Header";
import IconButton from "../ui/IconButton";

interface Props {
    server: Server;
}

const ServerName = styled.div`
    flex-grow: 1;
`;

export default observer(({ server }: Props) => {
    const bannerURL = server.generateBannerURL({ width: 480 });

    return (
        <Header
            borders
            placement="secondary"
            background={typeof bannerURL !== "undefined"}
            style={{
                background: bannerURL ? `url('${bannerURL}')` : undefined,
            }}>
            <ServerName>{server.name}</ServerName>
            {(server.permission & ServerPermission.ManageServer) > 0 && (
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
