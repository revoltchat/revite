import styled, { css } from "styled-components";

export default styled.details<{ sticky?: boolean, large?: boolean }>`
    summary {
        ${ props => props.sticky && css`
            top: -1px;
            z-index: 10;
            position: sticky;
        ` }

        ${ props => props.large && css`
            /*padding: 5px 0;*/
            background: var(--primary-background);
            color: var(--secondary-foreground);

            .padding { /*TOFIX: make this applicable only for the friends list menu, DO NOT REMOVE.*/
                display: flex;
                align-items: center;
                padding: 5px 0;
                margin: 0.8em 0px 0.4em;
                cursor: pointer;
            }
        ` }

        outline: none;
        cursor: pointer;
        list-style: none;
        align-items: center;
        transition: .2s opacity;
        
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;

        &::marker, &::-webkit-details-marker {
            display: none;
        }

        .title {
            flex-grow: 1;
            margin-top: 1px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }

        .padding { 
            display: flex;
            align-items: center;

            > svg {
                flex-shrink: 0;
                margin-inline-end: 4px;
                transition: .2s ease transform;
            }
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
