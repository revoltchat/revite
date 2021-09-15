import { Home as HomeIcon } from "@styled-icons/boxicons-solid";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import styles from "./Home.module.scss";
import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { dispatch, getState } from "../../redux";

import wideSVG from "../../assets/wide.svg";
import Emoji from "../../components/common/Emoji";
import Tooltip from "../../components/common/Tooltip";
import Header from "../../components/ui/Header";
import CategoryButton from "../../components/ui/fluent/CategoryButton";

const CHANNELS_SIDEBAR_KEY = "sidebar_channels";

const IconConainer = styled.div`
    cursor: pointer;
    color: var(--secondary-foreground);

    ${!isTouchscreenDevice &&
    css`
        &:hover {
            color: var(--foreground);
        }
    `}
`;

export default function Home() {
    const [showChannels, setChannels] = useState(
        getState().sectionToggle[CHANNELS_SIDEBAR_KEY] ?? true,
    );

    const toggleChannelSidebar = () => {
        if (isTouchscreenDevice) {
            return;
        }

        setChannels(!showChannels);

        if (showChannels) {
            dispatch({
                type: "SECTION_TOGGLE_SET",
                id: CHANNELS_SIDEBAR_KEY,
                state: false,
            });
        } else {
            dispatch({
                type: "SECTION_TOGGLE_UNSET",
                id: CHANNELS_SIDEBAR_KEY,
            });
        }
    };

    return (
        <div className={styles.home}>
            <Header placement="primary">
                <IconConainer onClick={toggleChannelSidebar}>
                    <HomeIcon size={24} />
                </IconConainer>
                <Text id="app.navigation.tabs.home" />
            </Header>
            <h3>
                <Text id="app.special.modals.onboarding.welcome" />
                <br />
                <img src={wideSVG} />
            </h3>
            <div className={styles.actions}>
                <Link to="/invite/Testers">
                    <CategoryButton
                        action="chevron"
                        icon={<Emoji emoji="😁" size={32} />}>
                        Join testers server
                    </CategoryButton>
                </Link>
                <a
                    href="https://insrt.uk/donate"
                    target="_blank"
                    rel="noreferrer">
                    <CategoryButton
                        action="external"
                        icon={<Emoji emoji="💷" size={32} />}>
                        Donate to Revolt
                    </CategoryButton>
                </a>
                <Link to="/settings/feedback">
                    <CategoryButton
                        action="chevron"
                        icon={<Emoji emoji="🎉" size={32} />}>
                        Give feedback
                    </CategoryButton>
                </Link>
                <a
                    href="https://revolt.social"
                    target="_blank"
                    rel="noreferrer">
                    <CategoryButton
                        action="external"
                        icon={<Emoji emoji="🧭" size={32} />}>
                        Find Servers & Bots
                    </CategoryButton>
                </a>
                <Tooltip content="You can also right-click the user icon in the top left, or left click it if you're already home.">
                    <Link to="/settings">
                        <CategoryButton
                            action="chevron"
                            icon={<Emoji emoji="🔧" size={32} />}>
                            Settings
                        </CategoryButton>
                    </Link>
                </Tooltip>
            </div>
        </div>
    );
}
