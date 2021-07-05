import { Text } from "preact-i18n";
import styles from "./Panes.module.scss";
import { dispatch } from "../../../redux";
import Checkbox from "../../../components/ui/Checkbox";
import { connectState } from "../../../redux/connector";
import { SyncKeys, SyncOptions } from "../../../redux/reducers/sync";

interface Props {
    options?: SyncOptions;
}

export function Component(props: Props) {
    return (
        <div className={styles.notifications}>
            <h3>
                <Text id="app.settings.pages.sync.categories" />
            </h3>
            {
                ([
                    ['appearance', 'appearance.title'],
                    ['theme', 'appearance.theme'],
                    ['locale', 'language.title']
                    // notifications sync is always-on
                ] as [ SyncKeys, string ][]).map(
                    ([ key, title ]) =>
                        <Checkbox
                            checked={(props.options?.disabled ?? []).indexOf(key) === -1}
                            description={<Text id={`app.settings.pages.sync.descriptions.${key}`} />}
                            onChange={enabled =>
                                dispatch({
                                    type: enabled ? 'SYNC_ENABLE_KEY' : 'SYNC_DISABLE_KEY',
                                    key
                                })
                            }
                        >
                            <Text id={`app.settings.pages.${title}`} />
                        </Checkbox>
                )
            }
        </div>
    );
}

export const Sync = connectState(
    Component,
    state => {
        return {
            options: state.sync
        };
    }
);
