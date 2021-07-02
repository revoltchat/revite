import styled, { css } from "styled-components";
import { Children } from "../../types/Preact";
import { Text } from 'preact-i18n';

type Props = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'as'> & {
    error?: string;
    block?: boolean;
    children?: Children;
    type?: "default" | "subtle" | "error";
}

const OverlineBase = styled.div<Omit<Props, "children" | "error">>`
    display: inline;
    margin: 0.4em 0;
    margin-top: 0.8em;

    font-size: 14px;
    font-weight: 600;
    color: var(--foreground);
    text-transform: uppercase;

    ${(props) =>
        props.type === "subtle" &&
        css`
            font-size: 12px;
            color: var(--secondary-foreground);
        `}

    ${(props) =>
        props.type === "error" &&
        css`
            font-size: 12px;
            font-weight: 400;
            color: var(--error);
        `}

    ${(props) =>
        props.block &&
        css`
            display: block;
        `}
`;

export default function Overline(props: Props) {
    return (
        <OverlineBase {...props}>
            {props.children}
            {props.children && props.error && <> &middot; </>}
            {props.error && <Overline type="error">
                <Text id={`error.${props.error}`}>{props.error}</Text>
            </Overline>}
        </OverlineBase>
    );
}
