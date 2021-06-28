import { Text } from "preact-i18n";
import styles from "./Panes.module.scss";
import Checkbox from "../../../components/ui/Checkbox";
import { connectState } from "../../../redux/connector";
import { WithDispatcher } from "../../../redux/reducers";
import { AVAILABLE_EXPERIMENTS, ExperimentOptions } from "../../../redux/reducers/experiments";

interface Props {
    options?: ExperimentOptions;
}

export function Component(props: Props & WithDispatcher) {
    return (
        <div className={styles.notifications}>
            <h3>
                <Text id="app.settings.pages.experiments.features" />
            </h3>
            {
                (AVAILABLE_EXPERIMENTS).map(
                    key =>
                        <Checkbox
                            checked={(props.options?.enabled ?? []).indexOf(key) > -1}
                            onChange={enabled => {
                                props.dispatcher({
                                    type: enabled ? 'EXPERIMENTS_ENABLE' : 'EXPERIMENTS_DISABLE',
                                    key
                                });
                            }}
                        >
                            <Text id={`app.settings.pages.experiments.titles.${key}`} />
                            <p>
                                <Text id={`app.settings.pages.experiments.descriptions.${key}`} />
                            </p>
                        </Checkbox>
                )
            }
            {
                AVAILABLE_EXPERIMENTS.length === 0 &&
                <div className={styles.empty}>
                    <Text id="app.settings.pages.experiments.not_available" />
                </div>
                
            }
        </div>
    );
}

export const ExperimentsPage = connectState(
    Component,
    state => {
        return {
            options: state.experiments
        };
    },
    true
);
