import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { Checkbox, Column } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";
import {
    AVAILABLE_EXPERIMENTS,
    EXPERIMENTS,
} from "../../../mobx/stores/Experiments";

export const ExperimentsPage = observer(() => {
    const experiments = useApplicationState().experiments;

    return (
        <div className={styles.experiments}>
            <h3>
                <Text id="app.settings.pages.experiments.features" />
            </h3>
            <Column>
                {AVAILABLE_EXPERIMENTS.map((key) => (
                    <Checkbox
                        key={key}
                        value={experiments.isEnabled(key)}
                        onChange={(enabled) =>
                            experiments.setEnabled(key, enabled)
                        }
                        description={EXPERIMENTS[key].description}
                        title={EXPERIMENTS[key].title}
                    />
                ))}
            </Column>
            {AVAILABLE_EXPERIMENTS.length === 0 && (
                <div className={styles.empty}>
                    <Text id="app.settings.pages.experiments.not_available" />
                </div>
            )}
        </div>
    );
});
