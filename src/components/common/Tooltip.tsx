import { Text } from "preact-i18n";
import styled from "styled-components";
import { Children } from "../../types/Preact";
import Tippy, { TippyProps } from '@tippyjs/react';

type Props = Omit<TippyProps, 'children'> & {
    children: Children;
    content: Children;
}

export default function Tooltip(props: Props) {
    const { children, content, ...tippyProps } = props;

    return (
        <Tippy content={content} {...tippyProps}>
            {/*
            // @ts-expect-error */}
            <div>{ children }</div>
        </Tippy>
    );
}

const PermissionTooltipBase = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;

    code {
        font-family: 'Fira Mono';
    }
`;

export function PermissionTooltip(props: Omit<Props, 'content'> & { permission: string }) {
    const { permission, ...tooltipProps } = props;

    return (
        <Tooltip content={<PermissionTooltipBase>
            <Text id="app.permissions.required" />
            <code>{ permission }</code>
        </PermissionTooltipBase>} {...tooltipProps} />
    )
}
