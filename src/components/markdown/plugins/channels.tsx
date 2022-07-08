import { Link } from "react-router-dom";

import { clientController } from "../../../controllers/client/ClientController";
import { createComponent, CustomComponentProps } from "./remarkRegexComponent";

export function RenderChannel({ match }: CustomComponentProps) {
    const channel = clientController.getAvailableClient().channels.get(match)!;

    return (
        <Link
            to={`${
                channel.server_id ? `/server/${channel.server_id}` : ""
            }/channel/${match}`}>{`#${channel.name}`}</Link>
    );
}

export const remarkChannels = createComponent(
    "channel",
    /<#([A-z0-9]{26})>/g,
    (match) => clientController.getAvailableClient().channels.has(match),
);
