import { Cog } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { ServerPermission } from "revolt.js/dist/api/permissions";
import { Server } from "revolt.js/dist/maps/Servers";
import styled from "styled-components";

import Header from "../ui/Header";
import IconButton from "../ui/IconButton";

import Tooltip from "./Tooltip";

interface Props {
    server: Server;
}

const ServerName = styled.div`
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const GradientHeader = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: end;
    padding: 15px;
    background: linear-gradient(
        0deg,
        rgba(var(--secondary-background-rgba), 1) 0%,
        rgba(var(--secondary-background-rgba), 0.8) 40%,
        rgba(var(--secondary-background-rgba), 0) 100%
    );
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
            <GradientHeader>
                {server.owner === "01EX2NCWQ0CHS3QJF0FEQS1GR4" ? (
                    <Tooltip
                        content={"Official Server"}
                        placement={"bottom-start"}>
                        <svg width="20" height="20" style={{ marginRight: 5 }}>
                            <image
                                xlinkHref="/assets/badges/verified.svg"
                                height="20"
                                width="20"
                            />
                            <image
                                xlinkHref="/assets/badges/revolt_r.svg"
                                height="15"
                                width="15"
                                x="2"
                                y="3"
                                style={
                                    "justify-content: center; align-items: center; filter: brightness(0);"
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
                                <Tooltip
                                    content={
                                        <Text id="app.context_menu.open_server_settings" />
                                    }
                                    placement="right">
                                    <Cog size={24} />
                                </Tooltip>
                            </IconButton>
                        </Link>
                    </div>
                )}
            </GradientHeader>
        </Header>
    );
});
