import {
    ChevronLeft,
    ChevronRight,
    Menu,
} from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";
import styled, { css } from "styled-components/macro";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";
import { SIDEBAR_CHANNELS } from "../../mobx/stores/Layout";

import { Children } from "../../types/Preact";

interface Props {
    topBorder?: boolean;
    bottomBorder?: boolean;

    background?: boolean;
    transparent?: boolean;
    placement: "primary" | "secondary";
}

const Header = styled.header<Props>`
    gap: 10px;
    flex: 0 auto;
    display: flex;
    flex-shrink: 0;
    padding: 0 16px;
    font-weight: 600;
    user-select: none;
    align-items: center;

    height: var(--header-height);

    background-size: cover !important;
    background-position: center !important;

    svg {
        flex-shrink: 0;
    }

    .menu {
        margin-inline-end: 8px;
        color: var(--secondary-foreground);
    }

    ${(props) =>
        props.transparent
            ? css`
                  background-color: rgba(
                      var(--primary-header-rgb),
                      max(var(--min-opacity), 0.75)
                  );
                  backdrop-filter: blur(20px);
                  z-index: 20;
                  position: absolute;
                  width: 100%;
              `
            : css`
                  background-color: var(--primary-header);
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
        props.topBorder &&
        css`
            border-start-start-radius: 8px;
        `}

    ${(props) =>
        props.bottomBorder &&
        css`
            border-end-start-radius: 8px;
        `}
`;

export default Header;

const IconContainer = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--secondary-foreground);
    margin-right: 5px;

    > svg {
        margin-right: -5px;
    }

    ${!isTouchscreenDevice &&
    css`
        &:hover {
            color: var(--foreground);
        }
    `}
`;

type PageHeaderProps = Omit<Props, "placement" | "borders"> & {
    noBurger?: boolean;
    children: Children;
    icon: Children;
};

export const PageHeader = observer(
    ({ children, icon, noBurger, ...props }: PageHeaderProps) => {
        const layout = useApplicationState().layout;
        const visible = layout.getSectionState(SIDEBAR_CHANNELS, true);
        const { pathname } = useLocation();

        return (
            <Header
                {...props}
                placement="primary"
                topBorder={!visible}
                bottomBorder={!pathname.includes("/server")}>
                {!noBurger && <HamburgerAction />}
                <IconContainer
                    onClick={() =>
                        layout.toggleSectionState(SIDEBAR_CHANNELS, true)
                    }>
                    {!isTouchscreenDevice && visible && (
                        <ChevronLeft size={18} />
                    )}
                    {icon}
                    {!isTouchscreenDevice && !visible && (
                        <ChevronRight size={18} />
                    )}
                </IconContainer>
                {children}
            </Header>
        );
    },
);

export function HamburgerAction() {
    if (!isTouchscreenDevice) return null;

    function openSidebar() {
        document
            .querySelector("#app > div > div > div")
            ?.scrollTo({ behavior: "smooth", left: 0 });
    }

    return (
        <div className="menu" onClick={openSidebar}>
            <Menu size={27} />
        </div>
    );
}
