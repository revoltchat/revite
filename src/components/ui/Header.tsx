import styled, { css } from "styled-components";

interface Props {
    borders?: boolean;
    background?: boolean;
    placement: 'primary' | 'secondary'
}

export default styled.div<Props>`
    gap: 6px;
    height: 48px;
    flex: 0 auto;
    display: flex;
    flex-shrink: 0;
    padding: 0 16px;
    font-weight: 600;
    user-select: none;
    align-items: center;

    background-size: cover !important;
    background-position: center !important;
    background-color: var(--primary-header);

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
        height: 120px !important;
        align-items: flex-end;

        text-shadow: 0px 0px 1px black;
    ` }

    ${ props => props.placement === 'secondary' && css`
        background-color: var(--secondary-header);
        padding: 14px;
    ` }

    ${ props => props.borders && css`    
        border-end-start-radius: 8px;
    ` }
`;
