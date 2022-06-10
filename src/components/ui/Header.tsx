import {
    ChevronLeft,
    ChevronRight,
    Menu,
} from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";
import styled, { css } from "styled-components/macro";

import { Header } from "@revoltchat/ui";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";
import { SIDEBAR_CHANNELS } from "../../mobx/stores/Layout";

interface Props {
    topBorder?: boolean;
    bottomBorder?: boolean;

    withBackground?: boolean;
    withTransparency?: boolean;
    placement: "primary" | "secondary";
}

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
                palette="primary"
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
