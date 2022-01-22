import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { Checkbox } from "@revoltchat/ui/lib/components/atoms/inputs/Checkbox";

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
            {AVAILABLE_EXPERIMENTS.map((key) => (
                <Checkbox
                    key={key}
                    value={experiments.isEnabled(key)}
                    onChange={(enabled) => experiments.setEnabled(key, enabled)}
                    description={EXPERIMENTS[key].description}>
                    {EXPERIMENTS[key].title}
                </Checkbox>
            ))}
            {AVAILABLE_EXPERIMENTS.length === 0 && (
                <div className={styles.empty}>
                    <Text id="app.settings.pages.experiments.not_available" />
                </div>
            )}
        </div>
    );
});
