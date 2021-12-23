import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { useApplicationState } from "../../../mobx/State";
import { SyncKeys } from "../../../mobx/stores/Sync";

import Checkbox from "../../../components/ui/Checkbox";

export const Sync = observer(() => {
    const sync = useApplicationState().sync;

    return (
        <div className={styles.notifications}>
            <h3>
                <Text id="app.settings.pages.sync.categories" />
            </h3>
            {(
                [
                    ["appearance", "appearance.title"],
                    ["theme", "appearance.theme"],
                    ["locale", "language.title"],
                    // notifications sync is always-on
                ] as [SyncKeys, string][]
            ).map(([key, title]) => (
                <Checkbox
                    key={key}
                    checked={sync.isEnabled(key)}
                    description={
                        <Text
                            id={`app.settings.pages.sync.descriptions.${key}`}
                        />
                    }
                    onChange={() => sync.toggle(key)}>
                    <Text id={`app.settings.pages.${title}`} />
                </Checkbox>
            ))}
        </div>
    );
});
