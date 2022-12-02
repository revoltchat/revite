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
import styled from "styled-components/macro";

import styles from "./Home.module.scss";
import "./snow.scss";
import { Text } from "preact-i18n";
import { useMemo } from "preact/hooks";

import { CategoryButton } from "@revoltchat/ui";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";

import wideSVG from "/assets/wide.svg";

import { PageHeader } from "../../components/ui/Header";
import { useClient } from "../../controllers/client/ClientController";
import { modalController } from "../../controllers/modals/ModalController";

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
    const client = useClient();
    const state = useApplicationState();

    const seasonalTheme = state.settings.get("appearance:seasonal", true);
    const toggleSeasonalTheme = () =>
        state.settings.set("appearance:seasonal", !seasonalTheme);

    const isDecember = !isTouchscreenDevice && new Date().getMonth() === 11;
    const isOctober = !isTouchscreenDevice && new Date().getMonth() === 9
    const snowflakes = useMemo(() => {
        const flakes: string[] = [];

        if (isDecember) {
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
        }
        if (isOctober) {
            for (let i = 0; i < 15; i++) {
                flakes.push("🎃");
                flakes.push("💀");
            }

            for (let i = 0; i < 2; i++) {
                flakes.push("👻");
                flakes.push("⚰️");
                flakes.push("🕷️");
            }

            return flakes;
        }

        return flakes;
    }, []);

    return (
        <div className={styles.home}>
            <Overlay>
                {seasonalTheme && (
                    <div className="snowfall">
                        {snowflakes.map((emoji, index) => (
                            <div key={index} className="snowflake">
                                {emoji}
                            </div>
                        ))}
                    </div>
                )}
                <div className="content">
                    <PageHeader icon={<HomeIcon size={24} />} withTransparency>
                        <Text id="app.navigation.tabs.home" />
                    </PageHeader>
                    <div className={styles.homeScreen}>
                        <h3>
                            <Text id="app.special.modals.onboarding.welcome" />
                            <br />
                            <img src={wideSVG} />
                        </h3>
                        <div className={styles.actions}>
                            <a
                                onClick={() =>
                                    modalController.push({
                                        type: "create_group",
                                    })
                                }>
                                <CategoryButton
                                    action="chevron"
                                    icon={<PlusCircle size={32} />}
                                    description={
                                        <Text id="app.home.group_desc" />
                                    }>
                                    <Text id="app.home.group" />
                                </CategoryButton>
                            </a>
                            <Link to="/discover">
                                <a>
                                    <CategoryButton
                                        action="chevron"
                                        icon={<Compass size={32} />}
                                        description={
                                            <Text id="app.home.discover_desc" />
                                        }>
                                        <Text id="app.home.discover" />
                                    </CategoryButton>
                                </a>
                            </Link>

                            {client.servers.get(
                                "01F7ZSBSFHQ8TA81725KQCSDDP",
                            ) ? (
                                <Link to="/server/01F7ZSBSFHQ8TA81725KQCSDDP">
                                    <CategoryButton
                                        action="chevron"
                                        icon={<RightArrowCircle size={32} />}
                                        description={
                                            <Text id="app.home.goto-testers_desc" />
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
                                            <Text id="app.home.join-testers_desc" />
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
                                        <Text id="app.home.feedback_desc" />
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
                                    description={
                                        <Text id="app.home.donate_desc" />
                                    }
                                    icon={<Money size={32} />}>
                                    <Text id="app.home.donate" />
                                </CategoryButton>
                            </a>
                            <Link to="/settings">
                                <CategoryButton
                                    action="chevron"
                                    description={
                                        <Text id="app.home.settings-tooltip" />
                                    }
                                    icon={<Cog size={32} />}>
                                    <Text id="app.home.settings" />
                                </CategoryButton>
                            </Link>
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
