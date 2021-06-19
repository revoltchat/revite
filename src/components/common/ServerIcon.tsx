import styled from "styled-components";
import { useContext } from "preact/hooks";
import { Server } from "revolt.js/dist/api/objects";
import IconBase, { IconBaseProps } from "./IconBase";
import { AppContext } from "../../context/revoltjs/RevoltClient";

interface Props extends IconBaseProps<Server> {
    server_name?: string;
}

const ServerText = styled.div`
    display: grid;
    padding: .2em;
    overflow: hidden;
    border-radius: 50%;
    place-items: center;
    color: var(--foreground);
    background: var(--primary-background);
`;

const fallback = '/assets/group.png';
export default function ServerIcon(props: Props & Omit<JSX.SVGAttributes<SVGSVGElement>, keyof Props>) {
    const { client } = useContext(AppContext);

    const { target, attachment, size, animate, server_name, children, as, ...svgProps } = props;
    const iconURL = client.generateFileURL(target?.icon ?? attachment, { max_side: 256 }, animate);

    if (typeof iconURL === 'undefined') {
        const name = target?.name ?? server_name ?? '';

        return (
            <ServerText style={{ width: size, height: size }}>
                { name.split(' ')
                      .map(x => x[0])
                      .filter(x => typeof x !== 'undefined') }
            </ServerText>
        )
    }

    return (
        <IconBase {...svgProps}
            width={size}
            height={size}
            aria-hidden="true"
            viewBox="0 0 32 32">
            <foreignObject x="0" y="0" width="32" height="32">
                <img src={iconURL}
                    onError={ e => {
                        let el = e.currentTarget;
                        if (el.src !== fallback) {
                            el.src = fallback
                        }
                    }} />
            </foreignObject>
        </IconBase>
    );
}
