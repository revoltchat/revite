import { useContext } from "preact/hooks";
import { Hash } from "@styled-icons/feather";
import IconBase, { IconBaseProps } from "./IconBase";
import { Channels } from "revolt.js/dist/api/objects";
import { AppContext } from "../../context/revoltjs/RevoltClient";

interface Props extends IconBaseProps<Channels.GroupChannel | Channels.TextChannel> {
    isServerChannel?: boolean;
}

const fallback = '/assets/group.png';
export default function ChannelIcon(props: Props & Omit<JSX.SVGAttributes<SVGSVGElement>, keyof Props>) {
    const { client } = useContext(AppContext);

    const { size, target, attachment, isServerChannel: server, animate, children, as, ...svgProps } = props;
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
        <IconBase {...svgProps}
            width={size}
            height={size}
            aria-hidden="true"
            viewBox="0 0 32 32"
            square={isServerChannel}>
            <foreignObject x="0" y="0" width="32" height="32">
                <img src={iconURL ?? fallback}
                    onError={ e => {
                        let el = e.currentTarget;
                        if (el.src !== fallback) {
                            el.src = fallback
                        }
                    } } />
            </foreignObject>
        </IconBase>
    );
}
