import { Children } from "../../types/Preact";
import styled, { css } from "styled-components";
import { InfoCircle } from "@styled-icons/boxicons-regular";

interface Props {
    warning?: boolean
    error?: boolean
}

export const TipBase = styled.div<Props>`
    display: flex;
    padding: 12px;
    overflow: hidden;
    align-items: center;

    font-size: 14px;
    border-radius: 7px;
    background: var(--primary-header);
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

    ${ props => props.warning && css`
        color: var(--warning);
        border: 2px solid var(--warning);
        background: var(--secondary-header);
    ` }

    ${ props => props.error && css`
        color: var(--error);
        border: 2px solid var(--error);
        background: var(--secondary-header);
    ` }
`;

export default function Tip(props: Props & { children: Children }) {
    const { children, ...tipProps } = props;
    return (
        <TipBase {...tipProps}>
            <InfoCircle size={20} />
            <span>{props.children}</span>
        </TipBase>
    );
}
