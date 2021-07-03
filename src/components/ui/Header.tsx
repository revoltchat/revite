import styled, { css } from "styled-components";

interface Props {
    borders?: boolean;
    background?: boolean;
    placement: 'primary' | 'secondary'
}

export default styled.div<Props>`
    display: flex;
    height: 48px;
    font-weight: 600;
    align-items: center;
    user-select: none;
    gap: 6px;
    flex: 0 auto;
    padding: 0 16px;
    flex-shrink: 0;

    background-color: var(--primary-header);
    background-size: cover !important;
    background-position: center !important;

    svg {
        flex-shrink: 0;
    }

    /*@media only screen and (max-width: 768px) {
        padding: 0 12px;
    }*/

    @media (pointer: coarse) {
        height: 56px;
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
        /*border-start-start-radius: 8px;*/
    ` }
`;
