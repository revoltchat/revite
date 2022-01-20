import styled, { css } from "styled-components/macro";

import { Text } from "preact-i18n";

import { Children } from "../../types/Preact";

type Props = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "as"> & {
    error?: string;
    hover?: boolean;
    block?: boolean;
    spaced?: boolean;
    noMargin?: boolean;
    children?: Children;
    type?: "default" | "subtle" | "error" | "accent";
};

const OverlineBase = styled.div<Omit<Props, "children" | "error">>`
    display: inline;
    transition: 0.2s ease filter;

    ${(props) =>
        props.hover &&
        css`
            cursor: pointer;
            transition: 0.2s ease filter;

            &:hover {
                filter: brightness(1.2);
            }
        `}

    ${(props) =>
        !props.noMargin &&
        css`
            margin: 0.4em 0;
        `}

    ${(props) =>
        props.spaced &&
        css`
            margin-top: 0.8em;
        `}

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
        props.type === "accent" &&
        css`
            font-size: 12px;
            font-weight: 400;
            color: var(--accent);
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
            {props.error && (
                <Overline type="error">
                    <Text id={`error.${props.error}`}>{props.error}</Text>
                </Overline>
            )}
        </OverlineBase>
    );
}
