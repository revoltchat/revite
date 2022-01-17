import { WifiOff } from "@styled-icons/boxicons-regular";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";
import { useContext } from "preact/hooks";

import Preloader from "../../components/ui/Preloader";

import { Children } from "../../types/Preact";
import { ClientStatus, StatusContext } from "./RevoltClient";

interface Props {
    children: Children;
}

const Base = styled.div`
    gap: 16px;
    padding: 1em;
    display: flex;
    user-select: none;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    color: var(--tertiary-foreground);
    background: var(--secondary-header);

    > div {
        font-size: 18px;
    }
`;

export default function RequiresOnline(props: Props) {
    const status = useContext(StatusContext);

    if (status === ClientStatus.CONNECTING) return <Preloader type="ring" />;
    if (status !== ClientStatus.ONLINE && status !== ClientStatus.READY)
        return (
            <Base>
                <WifiOff size={16} />
                <div>
                    <Text id="app.special.requires_online" />
                </div>
            </Base>
        );

    return <>{props.children}</>;
}
