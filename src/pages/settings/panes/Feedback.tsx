import { Github } from "@styled-icons/boxicons-logos";
import { BugAlt, Group, ListOl } from "@styled-icons/boxicons-regular";
import { Link } from "react-router-dom";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import CategoryButton from "../../../components/ui/fluent/CategoryButton";

export function Feedback() {
    return (
        <div className={styles.feedback}>
            <a
                href="https://github.com/dislistme/revolt/discussions"
                target="_blank"
                rel="noreferrer">
                <CategoryButton
                    hover
                    action="external"
                    icon={<Github size={24} />}
                    description={
                        <Text id="app.settings.pages.feedback.suggest_desc" />
                    }>
                    <Text id="app.settings.pages.feedback.suggest" />
                </CategoryButton>
            </a>
            <a
                href="https://github.com/dislistme/revite/issues/new"
                target="_blank"
                rel="noreferrer">
                <CategoryButton
                    hover
                    action="external"
                    icon={<ListOl size={24} />}
                    description={
                        <Text id="app.settings.pages.feedback.issue_desc" />
                    }>
                    <Text id="app.settings.pages.feedback.issue" />
                </CategoryButton>
            </a>
            <a
                href="https://support.chatnet.me"
                target="_blank"
                rel="noreferrer">
                <CategoryButton
                    hover
                    action="external"
                    icon={<BugAlt size={24} />}
                    description={
                        <Text id="app.settings.pages.feedback.bug_desc" />
                    }>
                    <Text id="app.settings.pages.feedback.bug" />
                </CategoryButton>
            </a>
            <Link to="/invite/3td0gR2y">
                <a>
                    <CategoryButton
                        hover
                        action="chevron"
                        icon={<Group size={24} />}
                        description="You can report issues and discuss improvements with us directly here.">
                        Join Testers server.
                    </CategoryButton>
                </a>
            </Link>
        </div>
    );
}
