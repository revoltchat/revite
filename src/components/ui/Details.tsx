import styled, { css } from "styled-components";

export default styled.details<{ sticky?: boolean, large?: boolean }>`
    summary {
        ${ props => props.sticky && css`
            top: -1px;
            z-index: 10;
            position: sticky;
        ` }

        ${ props => props.large && css`
            padding: 5px 0;
        ` }

        outline: none;
        display: flex;
        cursor: pointer;
        list-style: none;
        align-items: center;
        transition: .2s opacity;

        &::marker, &::-webkit-details-marker {
            display: none;
        }

        > svg {
            flex-shrink: 0;
            transition: .2s ease transform;
        }
    }

    &:not([open]) {
        summary {
            opacity: .7;
        }
        
        summary svg {
            transform: rotateZ(-90deg);
        }
    }
`;
