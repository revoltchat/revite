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
