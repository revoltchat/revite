import { Coffee } from "@styled-icons/boxicons-regular";
import { Home as HomeIcon } from "@styled-icons/boxicons-solid";
import { Link } from "react-router-dom";

import styles from "./Home.module.scss";
import { Text } from "preact-i18n";

import wideSVG from "../../assets/wide.svg";
import Tooltip from "../../components/common/Tooltip";
import Button from "../../components/ui/Button";
import Header from "../../components/ui/Header";

export default function Home() {
    return (
        <div className={styles.home}>
            <Header placement="primary">
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
                    <Button contrast error>
                        Join testers server
                    </Button>
                </Link>
                <a
                    href="https://insrt.uk/donate"
                    target="_blank"
                    rel="noreferrer">
                    <Button contrast gold>
                        Donate to Revolt
                    </Button>
                </a>
                <Link to="/settings/feedback">
                    <Button contrast>Give feedback</Button>
                </Link>
                <Link to="/settings">
                    <Tooltip content="You can also right-click the user icon in the top left, or left click it if you're already home.">
                        <Button contrast>Open settings</Button>
                    </Tooltip>
                </Link>
            </div>
        </div>
    );
}
