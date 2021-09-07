import { Menu } from "@styled-icons/boxicons-regular";
import styled, { css } from "styled-components";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

interface Props {
    borders?: boolean;
    background?: boolean;
    placement: "primary" | "secondary";
    padding?: boolean;
}

export default styled.div<Props>`
    gap: 6px;
    height: 48px;
    flex: 0 auto;
    display: flex;
    flex-shrink: 0;
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

    ${(props) =>
        props.padding &&
        css`
            padding: 0 16px;

            /*@media only screen and (max-width: 768px) {
                padding: 0 12px;
            }*/
        `}

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
        props.padding &&
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
