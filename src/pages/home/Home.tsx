import styles from "./Home.module.scss";
import { Link } from "react-router-dom";

import { Text } from "preact-i18n";
import Header from "../../components/ui/Header";

export default function Home() {
    return (
        <div className={styles.home}>
            <Header placement="primary"><Text id="app.navigation.tabs.home" /></Header>
            <h3>
                <Text id="app.special.modals.onboarding.welcome" /> <img src="/assets/wide.svg" />
            </h3>
            <ul>
                <li>
                    Go to your <Link to="/friends">friends list</Link>.
                </li>
                <li>
                    Give <Link to="/settings/feedback">feedback</Link>.
                </li>
                <li>
                    Join <Link to="/invite/Testers">testers server</Link>.
                </li>
                <li>
                    View{" "}
                    <a href="https://gitlab.insrt.uk/revolt" target="_blank">
                        source code
                    </a>
                    .
                </li>
            </ul>
        </div>
    );
}
