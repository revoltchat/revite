import { Menu } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

interface Props {
    borders?: boolean;
    background?: boolean;
    placement: "primary" | "secondary";
}

export default styled.div<Props>`
    gap: 10px;
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

    .menu {
        margin-inline-end: 8px;
        color: var(--secondary-foreground);
    }

    /*@media only screen and (max-width: 768px) {
        padding: 0 12px;
    }*/

    ${() =>
        isTouchscreenDevice &&
        css`
            height: 56px;
        `}

    ${(props) =>
        props.background &&
        css`
            height: 120px !important;
            align-items: flex-end;

            text-shadow: 0px 0px 1px black;
        `}

    ${(props) =>
        props.placement === "secondary" &&
        css`
            background-color: var(--secondary-header);
            padding: 14px;
        `}

    ${(props) =>
        props.borders &&
        css`
            border-start-start-radius: 8px;
        `}
`;

export function HamburgerAction() {
    if (!isTouchscreenDevice) return null;

    function openSidebar() {
        document
            .querySelector("#app > div > div")
            ?.scrollTo({ behavior: "smooth", left: 0 });
    }

    return (
        <div className="menu" onClick={openSidebar}>
            <Menu size={27} />
        </div>
    );
}
