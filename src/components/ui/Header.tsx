import styled, { css } from "styled-components";

interface Props {
    borders?: boolean;
    background?: boolean;
    placement: 'primary' | 'secondary'
}

export default styled.div<Props>`
    height: 56px;
    font-weight: 600;
    user-select: none;

    display: flex;
    align-items: center;

    gap: 10px;
    flex: 0 auto;
    display: flex;
    padding: 0 20px;
    flex-shrink: 0;
    align-items: center;

    background-color: var(--primary-header);
    background-size: cover !important;
    background-position: center !important;

    svg {
        flex-shrink: 0;
    }

    @media only screen and (max-width: 768px) {
        padding: 0 12px;
    }
    

    ${ props => props.background && css`
        height: 120px;
        align-items: flex-end;
    ` }

    ${ props => props.placement === 'secondary' && css`
        background-color: var(--secondary-header);
        padding: 14px;
    ` }

    ${ props => props.borders && css`
        border-start-start-radius: 8px;
        border-end-start-radius: 8px;
    ` }
`;
