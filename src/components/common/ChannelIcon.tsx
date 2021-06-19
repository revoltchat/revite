import { useContext } from "preact/hooks";
import { Hash } from "@styled-icons/feather";
import { Channels } from "revolt.js/dist/api/objects";
import { ImageIconBase, IconBaseProps } from "./IconBase";
import { AppContext } from "../../context/revoltjs/RevoltClient";

interface Props extends IconBaseProps<Channels.GroupChannel | Channels.TextChannel> {
    isServerChannel?: boolean;
}

const fallback = '/assets/group.png';
export default function ChannelIcon(props: Props & Omit<JSX.HTMLAttributes<HTMLImageElement>, keyof Props>) {
    const client = useContext(AppContext);

    const { size, target, attachment, isServerChannel: server, animate, children, as, ...imgProps } = props;
    const iconURL = client.generateFileURL(target?.icon ?? attachment, { max_side: 256 }, animate);
    const isServerChannel = server || target?.channel_type === 'TextChannel';

    if (typeof iconURL === 'undefined') {
        if (isServerChannel) {
            return (
                <Hash size={size} />
            )
        }
    }

    return (
        // ! fixme: replace fallback with <picture /> + <source />
        <ImageIconBase {...imgProps}
            width={size}
            height={size}
            aria-hidden="true"
            square={isServerChannel}
            src={iconURL ?? fallback}
            onError={ e => {
                let el = e.currentTarget;
                if (el.src !== fallback) {
                    el.src = fallback
                }
            }} />
    );
}
