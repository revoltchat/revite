import styled, { css } from "styled-components";

interface Props {
    background?: boolean;
    placement: 'primary' | 'secondary'
}

export default styled.div<Props>`
    height: 56px;
    font-weight: 600;
    user-select: none;

    gap: 10px;
    flex: 0 auto;
    display: flex;
    padding: 20px;
    flex-shrink: 0;
    align-items: center;

    background-color: var(--primary-background);
    background-size: cover !important;
    background-position: center !important;

    ${ props => props.background && css`
        height: 120px;
        align-items: flex-end;
    ` }

    ${ props => props.placement === 'secondary' && css`
        padding: 14px;
    ` }
`;
