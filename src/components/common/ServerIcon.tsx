import { observer } from "mobx-react-lite";
import { Server } from "revolt.js/dist/maps/Servers";
import styled from "styled-components";

import { useContext } from "preact/hooks";

import { AppContext } from "../../context/revoltjs/RevoltClient";

import { IconBaseProps, ImageIconBase } from "./IconBase";

interface Props extends IconBaseProps<Server> {
    server_name?: string;
}

const ServerText = styled.div`
    display: grid;
    padding: 0.2em;
    font-size: 0.75rem;
    font-weight: 600;
    overflow: hidden;
    place-items: center;
    color: var(--foreground);
    background: var(--primary-background);
    border-radius: var(--border-radius-half);
`;

// const fallback = "/assets/group.png";
export default observer(
    (
        props: Props &
            Omit<
                JSX.HTMLAttributes<HTMLImageElement>,
                keyof Props | "children" | "as"
            >,
    ) => {
        const client = useContext(AppContext);

        const { target, attachment, size, animate, server_name, ...imgProps } =
            props;
        const iconURL = client.generateFileURL(
            target?.icon ?? attachment,
            { max_side: 256 },
            animate,
        );

        if (typeof iconURL === "undefined") {
            const name = target?.name ?? server_name ?? "";

            return (
                <ServerText style={{ width: size, height: size }}>
                    {name
                        .split(" ")
                        .map((x) => x[0])
                        .filter((x) => typeof x !== "undefined")
                        .join("")
                        .substring(0, 3)}
                </ServerText>
            );
        }

        return (
            <ImageIconBase
                {...imgProps}
                width={size}
                height={size}
                borderRadius="--border-radius-server-icon"
                src={iconURL}
                loading="lazy"
                aria-hidden="true"
            />
        );
    },
);
