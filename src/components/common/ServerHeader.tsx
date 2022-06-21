import { Cog } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { Server } from "revolt.js";
import styled, { css } from "styled-components/macro";

import { IconButton } from "@revoltchat/ui";

import { useIntermediate } from "../../context/intermediate/Intermediate";

import ServerBadge from "./ServerBadge";

interface Props {
    server: Server;
    background?: boolean;
}

const ServerBanner = styled.div<Omit<Props, "server">>`
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    background-size: cover;
    background-repeat: norepeat;
    background-position: center center;

    ${(props) =>
        props.background
            ? css`
                  height: 120px;

                  .container {
                      background: linear-gradient(
                          0deg,
                          var(--secondary-background),
                          transparent
                      );
                  }
              `
            : css`
                  background-color: var(--secondary-header);
              `}

    .container {
        height: var(--header-height);

        display: flex;
        align-items: center;
        padding: 0 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        gap: 8px;

        .title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-grow: 1;
        }
    }
`;

export default observer(({ server }: Props) => {

    const { openScreen } = useIntermediate();

    const bannerURL = server.generateBannerURL({ width: 480 });

    return (
        <ServerBanner
            background={typeof bannerURL !== "undefined"}
            style={{
                backgroundImage: bannerURL ? `url('${bannerURL}')` : undefined,
            }}>
            <div className="container">
				<ServerBadge server={server} />
				<div className="title"
					onClick={() => 
						openScreen({
							id: "server_info", 
							server, 
						})
					}>{server.name}</div>
                {server.havePermission("ManageServer") && (
                    <Link to={`/server/${server._id}/settings`}>
                        <IconButton>
                            <Cog size={20} />
                        </IconButton>
                    </Link>
                )}
            </div>
        </ServerBanner>
    );
});
