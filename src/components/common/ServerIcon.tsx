import styled from "styled-components";
import { useContext } from "preact/hooks";
import { Server } from "revolt.js/dist/api/objects";
import { IconBaseProps, ImageIconBase } from "./IconBase";
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
export default function ServerIcon(props: Props & Omit<JSX.HTMLAttributes<HTMLImageElement>, keyof Props>) {
    const { client } = useContext(AppContext);

    const { target, attachment, size, animate, server_name, children, as, ...imgProps } = props;
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
        <ImageIconBase {...imgProps}
            width={size}
            height={size}
            aria-hidden="true"
            src={iconURL}
            onError={ e => {
                let el = e.currentTarget;
                if (el.src !== fallback) {
                    el.src = fallback
                }
            }} />
    );
}
