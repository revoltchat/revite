import { Home as HomeIcon } from "@styled-icons/boxicons-solid";
import { Link } from "react-router-dom";

import styles from "./Home.module.scss";
import { Text } from "preact-i18n";

import wideSVG from "../../assets/wide.svg";
import Emoji from "../../components/common/Emoji";
import Tooltip from "../../components/common/Tooltip";
import Header from "../../components/ui/Header";
import CategoryButton from "../../components/ui/fluent/CategoryButton";

export default function Home() {
    return (
        <div className={styles.home}>
            <Header placement="primary" padding={true}>
                <HomeIcon size={24} />
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
