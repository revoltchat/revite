import { Cog } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { ServerPermission } from "revolt.js/dist/api/permissions";
import { Server } from "revolt.js/dist/maps/Servers";
import styled from "styled-components";

import { Text } from "preact-i18n";

import Header from "../ui/Header";
import IconButton from "../ui/IconButton";

import Tooltip from "./Tooltip";

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
            {server.owner === "01EX2NCWQ0CHS3QJF0FEQS1GR4" ? (
                <Tooltip content={"Official Server"} placement={"bottom-start"}>
                    <svg width="20" height="20">
                        <image
                            xlinkHref="/assets/verified.svg"
                            height="20"
                            width="20"
                        />
                        <image
                            xlinkHref="/assets/badges/developer.svg"
                            height="15"
                            width="15"
                            x="3"
                            y="3"
                            style={
                                "justify-content: center; align-items: center;"
                            }
                        />
                    </svg>
                </Tooltip>
            ) : undefined}

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
