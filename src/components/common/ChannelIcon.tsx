import { Hash, VolumeFull } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js";

import fallback from "./assets/group.png";

import { useClient } from "../../controllers/client/ClientController";
import { ImageIconBase, IconBaseProps } from "./IconBase";

interface Props extends IconBaseProps<Channel> {
    isServerChannel?: boolean;
}

export default observer(
    (
        props: Props &
            Omit<
                JSX.HTMLAttributes<HTMLImageElement>,
                keyof Props | "children" | "as"
            >,
    ) => {
        const client = useClient();

        const {
            size,
            target,
            attachment,
            isServerChannel: server,
            animate,
            ...imgProps
        } = props;
        const iconURL = client.generateFileURL(
            target?.icon ?? attachment ?? undefined,
            { max_side: 256 },
            animate,
        );
        const isServerChannel =
            server ||
            (target &&
                (target.channel_type === "TextChannel" ||
                    target.channel_type === "VoiceChannel"));

        if (typeof iconURL === "undefined") {
            if (isServerChannel) {
                if (target?.channel_type === "VoiceChannel") {
                    return <VolumeFull size={size} />;
                }
                return <Hash size={size} />;
            }
        }

        // The border radius of the channel icon, if it's a server-channel it should be square (undefined).
        let borderRadius: string | undefined = "--border-radius-channel-icon";
        if (isServerChannel) {
            borderRadius = undefined;
        }

        return (
            // ! TODO: replace fallback with <picture /> + <source />
            <ImageIconBase
                {...imgProps}
                width={size}
                height={size}
                loading="lazy"
                aria-hidden="true"
                borderRadius={borderRadius}
                src={iconURL ?? fallback}
            />
        );
    },
);
