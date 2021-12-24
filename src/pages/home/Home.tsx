import { Money } from "@styled-icons/boxicons-regular";
import {
    Home as HomeIcon,
    PlusCircle,
    Compass,
    Megaphone,
    Group,
    Cog,
    RightArrowCircle,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import styles from "./Home.module.scss";
import "./snow.scss";
import { Text } from "preact-i18n";
import { useContext, useMemo } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";

import { AppContext } from "../../context/revoltjs/RevoltClient";

import wideSVG from "../../../public/assets/wide.svg";
import Tooltip from "../../components/common/Tooltip";
import { PageHeader } from "../../components/ui/Header";
import CategoryButton from "../../components/ui/fluent/CategoryButton";

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

export default observer(() => {
    const client = useContext(AppContext);
    const state = useApplicationState();

    const toggleSeasonalTheme = () =>
        state.settings.set(
            "appearance:seasonal",
            !state.settings.get("appearance:seasonal"),
        );

    const seasonalTheme = state.settings.get("appearance:seasonal") ?? true;
    const isDecember = !isTouchscreenDevice && new Date().getMonth() === 11;
    const snowflakes = useMemo(() => {
        const flakes = [];

        // Disable outside of December
        if (!isDecember) return [];

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
                {seasonalTheme && (
                    <div class="snowfall">
                        {snowflakes.map((emoji, index) => (
                            <div key={index} class="snowflake">
                                {emoji}
                            </div>
                        ))}
                    </div>
                )}
                <div className="content">
                    <PageHeader icon={<HomeIcon size={24} />}>
                        <Text id="app.navigation.tabs.home" />
                    </PageHeader>
                    <div className={styles.homeScreen}>
                        <h3>
                            <Text id="app.special.modals.onboarding.welcome" />
                            <br />
                            <img src={wideSVG} />
                        </h3>
                        <div className={styles.actions}>
                            <Link to="/settings">
                                <CategoryButton
                                    action="chevron"
                                    icon={<PlusCircle size={32} />}
                                    description={
                                        "Invite all of your friends, some cool bots, and throw a big party."
                                    }>
                                    Create a group
                                </CategoryButton>
                            </Link>
                            <a
                                href="https://revolt.social"
                                target="_blank"
                                rel="noreferrer">
                                <CategoryButton
                                    action="external"
                                    icon={<Compass size={32} />}
                                    description={
                                        "Find a community based on your hobbies or interests."
                                    }>
                                    Join a community
                                </CategoryButton>
                            </a>

                            {client.servers.get(
                                "01F7ZSBSFHQ8TA81725KQCSDDP",
                            ) ? (
                                <Link to="/server/01F7ZSBSFHQ8TA81725KQCSDDP">
                                    <CategoryButton
                                        action="chevron"
                                        icon={<RightArrowCircle size={32} />}
                                        description={
                                            "You can report issues and discuss improvements with us directly here."
                                        }>
                                        <Text id="app.home.goto-testers" />
                                    </CategoryButton>
                                </Link>
                            ) : (
                                <Link to="/invite/Testers">
                                    <CategoryButton
                                        action="chevron"
                                        icon={<Group size={32} />}
                                        description={
                                            "You can report issues and discuss improvements with us directly here."
                                        }>
                                        <Text id="app.home.join-testers" />
                                    </CategoryButton>
                                </Link>
                            )}

                            <Link to="/settings/feedback">
                                <CategoryButton
                                    action="chevron"
                                    icon={<Megaphone size={32} />}
                                    description={
                                        "Let us know how we can improve our app by giving us feedback."
                                    }>
                                    <Text id="app.home.feedback" />
                                </CategoryButton>
                            </Link>
                            <a
                                href="https://insrt.uk/donate"
                                target="_blank"
                                rel="noreferrer">
                                <CategoryButton
                                    action="external"
                                    icon={<Money size={32} />}>
                                    <Text id="app.home.donate" />
                                </CategoryButton>
                            </a>

                            <Tooltip
                                content={
                                    <Text id="app.home.settings-tooltip" />
                                }>
                                <Link to="/settings">
                                    <CategoryButton
                                        action="chevron"
                                        icon={<Cog size={32} />}>
                                        <Text id="app.home.settings" />
                                    </CategoryButton>
                                </Link>
                            </Tooltip>
                        </div>
                        {isDecember && (
                            <a href="#" onClick={toggleSeasonalTheme}>
                                Turn {seasonalTheme ? "off" : "on"} homescreen
                                effects
                            </a>
                        )}
                    </div>
                </div>
            </Overlay>{" "}
        </div>
    );
});
