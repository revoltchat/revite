import { Home as HomeIcon } from "@styled-icons/boxicons-solid";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import styles from "./Home.module.scss";
import "./snow.scss";
import { Text } from "preact-i18n";
import { useContext, useMemo, useState } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { dispatch, getState } from "../../redux";

import { AppContext } from "../../context/revoltjs/RevoltClient";

import wideSVG from "../../../public/assets/wide.svg";
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

const Overlay = styled.div`
    display: grid;
    height: 100%;

    > * {
        grid-area: 1 / 1;
    }

    .content {
        z-index: 1;
    }
`;

export default function Home() {
    const client = useContext(AppContext);
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

    const snowflakes = useMemo(() => {
        const flakes = [];

        // Disable outside of December
        if (new Date().getMonth() !== 11) return [];

        for (let i = 0; i < 15; i++) {
            flakes.push("❄️");
            flakes.push("❄");
        }

        for (let i = 0; i < 2; i++) {
            flakes.push("🎄");
            flakes.push("☃️");
            flakes.push("⛄");
        }

        return flakes;
    }, []);

    return (
        <div className={styles.home}>
            <Overlay>
                <div class="snowfall">
                    {snowflakes.map((emoji, index) => (
                        <div key={index} class="snowflake">
                            {emoji}
                        </div>
                    ))}
                </div>
                <div class="content">
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
                                {client.servers.get(
                                    "01F7ZSBSFHQ8TA81725KQCSDDP",
                                ) ? (
                                    <Text id="app.home.goto-testers" />
                                ) : (
                                    <Text id="app.home.join-testers" />
                                )}
                            </CategoryButton>
                        </Link>
                        <a
                            href="https://insrt.uk/donate"
                            target="_blank"
                            rel="noreferrer">
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
                        <a
                            href="https://revolt.social"
                            target="_blank"
                            rel="noreferrer">
                            <CategoryButton
                                action="external"
                                icon={<Emoji emoji="🧭" size={32} />}>
                                <Text id="app.home.social" />
                            </CategoryButton>
                        </a>
                        <Tooltip
                            content={<Text id="app.home.settings-tooltip" />}>
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
            </Overlay>
        </div>
    );
}
