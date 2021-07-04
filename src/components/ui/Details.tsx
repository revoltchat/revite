import styled from "styled-components";

export default styled.details`
    summary {
        outline: none;
        list-style: none;
        transition: .2s opacity;

        &::marker, &::-webkit-details-marker {
            display: none;
        }

        svg {
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
