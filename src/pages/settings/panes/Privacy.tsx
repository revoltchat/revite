import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";
import { SyncKeys, SyncOptions } from "../../../redux/reducers/sync";

import Checkbox from "../../../components/ui/Checkbox";

interface Props {
    options?: SyncOptions;
}

export function Component(props: Props) {
    return (
        <div className={styles.notifications}>
            <Checkbox
                key={"everyone_dm"}
                checked={false}
                description={
                    <Text
                        id={`app.settings.pages.privacy.allow_dms.d`}
                    />
                }
                onChange={(enabled) => {console.log(enabled)}}>
                <Text id="app.settings.pages.privacy.allow_dms.t" />
            </Checkbox>
        </div>
    );
}

export const Sync = connectState(Component, (state) => {
    return {
        options: state.sync,
    };
});
