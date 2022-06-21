import Tooltip from "./Tooltip";
import { Server } from "revolt.js";

import { Text } from "preact-i18n";
import { Check } from "@styled-icons/boxicons-regular";

type Props = {
	server: Server, 
};

export default function ServerBadge(props: Props) {

	const { server } = props;

	if (!server.flags) return undefined;

	if (server.flags & 1) {
			return (<Tooltip
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
					</Tooltip>);
	}
	if (server.flags & 2) {
			return (
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
				);
	}
}
