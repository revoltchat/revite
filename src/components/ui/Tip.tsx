import { InfoCircle } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components/macro";

import { Children } from "../../types/Preact";

interface Props {
    warning?: boolean;
    error?: boolean;
}

export const Separator = styled.div<Props>`
    height: 1px;
    width: calc(100% - 10px);
    background: var(--secondary-header);
    margin: 18px auto;
`;

export const TipBase = styled.div<Props>`
    display: flex;
    padding: 12px;
    font-weight: 500;
    overflow: hidden;
    align-items: center;

    font-size: 14px;
    background: var(--primary-header);
    border-radius: var(--border-radius);
    border: 2px solid var(--secondary-header);

    a {
        cursor: pointer;
        &:hover {
            text-decoration: underline;
        }
    }

    svg {
        flex-shrink: 0;
        margin-inline-end: 10px;
    }

    ${(props) =>
        props.warning &&
        css`
            color: var(--warning);
            border: 2px solid var(--warning);
            background: var(--secondary-header);
        `}

    ${(props) =>
        props.error &&
        css`
            color: white;
            border: 2px solid var(--error);
            background: var(--error);
        `}
`;

export default function Tip(
    props: Props & { children: Children; hideSeparator?: boolean },
) {
    const { children, hideSeparator, ...tipProps } = props;
    return (
        <>
            {!hideSeparator && <Separator />}
            <TipBase {...tipProps}>
                <InfoCircle size={20} />
                <span>{children}</span>
            </TipBase>
        </>
    );
}
