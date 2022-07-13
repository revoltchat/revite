import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { Checkbox, Column } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";
import { SyncKeys } from "../../../mobx/stores/Sync";

export const Sync = observer(() => {
    const sync = useApplicationState().sync;

    return (
        <div className={styles.notifications}>
            {/*<h3>
                <Text id="app.settings.pages.sync.options" />
            </h3>
            <h5>Sync items automatically</h5>*/}
            <h3>
                <Text id="app.settings.pages.sync.categories" />
            </h3>
            <Column>
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
                        value={sync.isEnabled(key)}
                        title={<Text id={`app.settings.pages.${title}`} />}
                        description={
                            <Text
                                id={`app.settings.pages.sync.descriptions.${key}`}
                            />
                        }
                        onChange={() => sync.toggle(key)}
                    />
                ))}
            </Column>
            {/*<h5 style={{ marginTop: "20px", color: "grey" }}>
                Last sync at 12:00
                </h5>*/}
        </div>
    );
});
