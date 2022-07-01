import { Check } from "@styled-icons/boxicons-regular";
import { Cog } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { Server } from "revolt.js";
import styled, { css } from "styled-components/macro";

import { Text } from "preact-i18n";

import { IconButton } from "@revoltchat/ui";

import { modalController } from "../../controllers/modals/ModalController";
import Tooltip from "./Tooltip";

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

            cursor: pointer;
            color: var(--foreground);
        }
    }
`;

export default observer(({ server }: Props) => {
    const bannerURL = server.generateBannerURL({ width: 480 });

    return (
        <ServerBanner
            background={typeof bannerURL !== "undefined"}
            style={{
                backgroundImage: bannerURL ? `url('${bannerURL}')` : undefined,
            }}>
            <div className="container">
                {server.flags && server.flags & 1 ? (
                    <Tooltip
                        content={
                            <Text id="app.special.server-badges.official" />
                        }
                        placement={"bottom-start"}>
                        <svg width="20" height="20">
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
                {server.flags && server.flags & 2 ? (
                    <Tooltip
                        content={
                            <Text id="app.special.server-badges.verified" />
                        }
                        placement={"bottom-start"}>
                        <svg width="20" height="20">
                            <image
                                xlinkHref="/assets/badges/verified.svg"
                                height="20"
                                width="20"
                            />
                            <foreignObject x="2" y="2" width="15" height="15">
                                <Check
                                    size={15}
                                    color="black"
                                    strokeWidth={8}
                                />
                            </foreignObject>
                        </svg>
                    </Tooltip>
                ) : undefined}
                <a
                    className="title"
                    onClick={() =>
                        modalController.push({ type: "server_info", server })
                    }>
                    {server.name}
                </a>
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
