import { Github } from "@styled-icons/boxicons-logos";
import { BugAlt, Group, ListOl } from "@styled-icons/boxicons-regular";
import { Link } from "react-router-dom";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { CategoryButton, Column, Tip } from "@revoltchat/ui";

export function Feedback() {
    return (
        <Column>
            <Tip palette="warning">
                <span>
                    We are currently rebuilding the client from scratch. You can{" "}
                    <a
                        style={{ color: "inherit", fontWeight: "600" }}
                        href="https://github.com/revoltchat/frontend/issues/14"
                        target="_blank"
                        rel="noreferrer">
                        view our progress here
                    </a>
                    ; in the meantime, we are only accepting and fixing critical
                    bugs with the current client.
                </span>
            </Tip>
            <div className={styles.feedback}>
                <a
                    href="https://github.com/revoltchat/revolt/discussions"
                    target="_blank"
                    rel="noreferrer">
                    <CategoryButton
                        action="external"
                        icon={<Github size={24} />}
                        description={
                            <Text id="app.settings.pages.feedback.suggest_desc" />
                        }>
                        <Text id="app.settings.pages.feedback.suggest" />
                    </CategoryButton>
                </a>
                <a
                    href="https://github.com/revoltchat/revite/issues/new/choose"
                    target="_blank"
                    rel="noreferrer">
                    <CategoryButton
                        action="external"
                        icon={<ListOl size={24} />}
                        description={
                            <Text id="app.settings.pages.feedback.issue_desc" />
                        }>
                        <Text id="app.settings.pages.feedback.issue" />
                    </CategoryButton>
                </a>
                <a
                    href="https://github.com/orgs/revoltchat/projects/3"
                    target="_blank"
                    rel="noreferrer">
                    <CategoryButton
                        action="external"
                        icon={<BugAlt size={24} />}
                        description={
                            <Text id="app.settings.pages.feedback.bug_desc" />
                        }>
                        <Text id="app.settings.pages.feedback.bug" />
                    </CategoryButton>
                </a>
                <Link to="/invite/Testers">
                    <a>
                        <CategoryButton
                            action="chevron"
                            icon={<Group size={24} />}
                            description="You can report issues and discuss improvements with us directly here.">
                            {"Join the Revolt Lounge"}
                        </CategoryButton>
                    </a>
                </Link>
            </div>
        </Column>
    );
}
