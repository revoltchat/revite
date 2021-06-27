import { useContext } from "preact/hooks";
import { Channels } from "revolt.js/dist/api/objects";
import { Hash, VolumeFull } from "@styled-icons/boxicons-regular";
import { ImageIconBase, IconBaseProps } from "./IconBase";
import { AppContext } from "../../context/revoltjs/RevoltClient";

interface Props extends IconBaseProps<Channels.GroupChannel | Channels.TextChannel | Channels.VoiceChannel> {
    isServerChannel?: boolean;
}

import fallback from './assets/group.png';

export default function ChannelIcon(props: Props & Omit<JSX.HTMLAttributes<HTMLImageElement>, keyof Props>) {
    const client = useContext(AppContext);

    const { size, target, attachment, isServerChannel: server, animate, children, as, ...imgProps } = props;
    const iconURL = client.generateFileURL(target?.icon ?? attachment, { max_side: 256 }, animate);
    const isServerChannel = server || (target && (target.channel_type === 'TextChannel' || target.channel_type === 'VoiceChannel'));

    if (typeof iconURL === 'undefined') {
        if (isServerChannel) {
            if (target?.channel_type === 'VoiceChannel') {
                return (
                    <VolumeFull size={size} />
                )
            } else {
                return (
                    <Hash size={size} />
                )
            }
        }
    }

    return (
        // ! fixme: replace fallback with <picture /> + <source />
        <ImageIconBase {...imgProps}
            width={size}
            height={size}
            aria-hidden="true"
            square={isServerChannel}
            src={iconURL ?? fallback} />
    );
}
