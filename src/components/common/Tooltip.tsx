import styled from "styled-components";
import { Children } from "../../types/Preact";
import { Position, Tooltip as TooltipCore, TooltipProps } from "react-tippy";

type Props = Omit<TooltipProps, 'html'> & {
    position?: Position;
    children: Children;
    content: Children;
}

const TooltipBase = styled.div`
    padding: 8px;
    font-size: 12px;
    border-radius: 4px;
    color: var(--foreground);
    background: var(--secondary-background);
`;

export default function Tooltip(props: Props) {
    return (
        <TooltipCore
            {...props}
            // @ts-expect-error
            html={<TooltipBase>{props.content}</TooltipBase>} />
    );
}
