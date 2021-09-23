import Tippy, { TippyProps } from "@tippyjs/react";
import styled from "styled-components";

import { Text } from "preact-i18n";

import { Children } from "../../types/Preact";

type Props = Omit<TippyProps, "children"> & {
    children: Children;
    content: Children;
    flex?: boolean;
    className?: string;
};

export default function Tooltip(props: Props) {
    const { children, content, flex, className, ...tippyProps } = props;

    return (
        <Tippy content={content} {...tippyProps}>
            {/*
            // @ts-expect-error Type mis-match. */}
            <div
                style={
                    flex === null || flex === true
                        ? `display: flex;`
                        : `display: inline-block;`
                }
                className={className}>
                {children}
            </div>
        </Tippy>
    );
}

const PermissionTooltipBase = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;

    span {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--secondary-foreground);
    }

    code {
        font-family: var(--monospace-font);
    }
`;

export function PermissionTooltip(
    props: Omit<Props, "content"> & { permission: string },
) {
    const { permission, ...tooltipProps } = props;

    return (
        <Tooltip
            content={
                <PermissionTooltipBase>
                    <span>
                        <Text id="app.permissions.required" />
                    </span>
                    <code>{permission}</code>
                </PermissionTooltipBase>
            }
            {...tooltipProps}
        />
    );
}
