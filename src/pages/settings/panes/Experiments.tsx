import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";
import {
    AVAILABLE_EXPERIMENTS,
    ExperimentOptions,
    EXPERIMENTS,
    isExperimentEnabled,
} from "../../../redux/reducers/experiments";

import Checkbox from "../../../components/ui/Checkbox";

interface Props {
    options?: ExperimentOptions;
}

export function Component(props: Props) {
    return (
        <div className={styles.experiments}>
            <h3>
                <Text id="app.settings.pages.experiments.features" />
            </h3>
            {AVAILABLE_EXPERIMENTS.map((key) => (
                <Checkbox
                    key={key}
                    checked={isExperimentEnabled(key, props.options)}
                    onChange={(enabled) =>
                        dispatch({
                            type: enabled
                                ? "EXPERIMENTS_ENABLE"
                                : "EXPERIMENTS_DISABLE",
                            key,
                        })
                    }
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
}

export const ExperimentsPage = connectState(Component, (state) => {
    return {
        options: state.experiments,
    };
});
