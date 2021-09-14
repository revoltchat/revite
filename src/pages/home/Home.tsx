import { Home as HomeIcon } from "@styled-icons/boxicons-solid";
import { Link } from "react-router-dom";

import styles from "./Home.module.scss";
import { Text } from "preact-i18n";

import wideSVG from "../../assets/wide.svg";
import Emoji from "../../components/common/Emoji";
import Tooltip from "../../components/common/Tooltip";
import Header from "../../components/ui/Header";
import CategoryButton from "../../components/ui/fluent/CategoryButton";
import { dispatch, getState } from "../../redux";
import { useState } from "preact/hooks";
import styled, { css } from "styled-components";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

const CHANNELS_SIDEBAR_KEY = "sidebar_channels";

const IconConainer = styled.div`
    cursor: pointer;
    color: var(--secondary-foreground);

    ${!isTouchscreenDevice && css`
        &:hover {
            color: var(--foreground);
        }
    `}
`

export default function Home() {
    const [showChannels, setChannels] = useState(
        getState().sectionToggle[CHANNELS_SIDEBAR_KEY] ?? true,
    );

    const toggleChannelSidebar = () => {
        if (isTouchscreenDevice) {
            return
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
    }

    return (
        <div className={styles.home}>
            <Header placement="primary">
                <IconConainer onClick={toggleChannelSidebar} ><HomeIcon size={24} /></IconConainer>
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
                        <Text id="app.home.join-testers" />
                    </CategoryButton>
                </Link>
                <a
                    <CategoryButton
                        action="external"
                        icon={<Emoji emoji="💷" size={32} />}>
                        <Text id="app.home.donate" />
                    </CategoryButton>
                </a>
                <Link to="/settings/feedback">
                    <CategoryButton
                        action="chevron"
                        icon={<Emoji emoji="🎉" size={32} />}>
                        <Text id="app.home.feedback" />
                    </CategoryButton>
                </Link>
                <Tooltip content={<Text id="app.home.settings-tooltip" />}>
                    <Link to="/settings">
                        <CategoryButton
                            action="chevron"
                            icon={<Emoji emoji="🔧" size={32} />}>
                            <Text id="app.home.settings" />
                        </CategoryButton>
                    </Link>
                </Tooltip>
            </div>
        </div>
    );
}
