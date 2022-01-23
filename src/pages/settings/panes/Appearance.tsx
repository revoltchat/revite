import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";

import {
    ThemeBaseSelectorShim,
    ThemeDiscoverShim,
    ThemeAccentShim,
    MessageDisplayShim,
    ThemeOptionsShim,
    FontOptionsShim,
    DisplayEmojiShim,
    AdvancedOptionsShim,
} from "../../../components/settings/AppearanceShims";

export const Appearance = observer(() => {
    return (
        <div className={styles.appearance}>
            <ThemeBaseSelectorShim />
            <ThemeDiscoverShim />
            <ThemeAccentShim />
            <MessageDisplayShim />
            <ThemeOptionsShim />
            <FontOptionsShim />
            <DisplayEmojiShim />
            <AdvancedOptionsShim />
        </div>
    );
});
