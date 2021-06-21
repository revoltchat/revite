import styled, { css } from "styled-components";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

export default styled.div`
    height: 100%;
    display: flex;
    user-select: none;
    flex-direction: row;
    align-items: stretch;

    ${ isTouchscreenDevice && css`
        padding-bottom: 50px;
    ` }
`;

export const GenericSidebarBase = styled.div`
    height: 100%;
    width: 240px;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    background: var(--secondary-background);
`;

export const GenericSidebarList = styled.div`
    padding: 6px;
    flex-grow: 1;
    overflow-y: scroll;

    > svg {
        width: 100%;
    }
`;
