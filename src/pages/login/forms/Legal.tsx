import styles from "../Login.module.scss";
import { Text } from "preact-i18n";

export function Legal() {
    return (
        <span className={styles.footer}>
            <a
                href="https://revolt.chat/about"
                target="_blank"
            >
                <Text id="general.about" />
            </a>
            &middot;
            <a
                href="https://revolt.chat/terms"
                target="_blank"
            >
                <Text id="general.tos" />
            </a>
            &middot;
            <a
                href="https://revolt.chat/privacy"
                target="_blank"
            >
                <Text id="general.privacy" />
            </a>
        </span>
    );
}
