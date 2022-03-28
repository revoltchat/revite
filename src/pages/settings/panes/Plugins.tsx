import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";

import { useApplicationState } from "../../../mobx/State";

import Checkbox from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";

export const PluginsPage = observer(() => {
    const plugins = useApplicationState().plugins;
    return (
        <div className={styles.plugins}>
            {/* TODO(lexisother): Wrap in <h3><Text /></h3> */}
            <h1>Plugins</h1>
            <Tip error hideSeparator>
                Warning: This feature is still in development.
            </Tip>
            {plugins.list().map((plugin) => {
                return (
                    <Checkbox
                        key={plugin.id}
                        checked={plugin.enabled!}
                        onChange={() => {
                            !plugin.enabled
                                ? plugins.load(plugin.namespace, plugin.id)
                                : plugins.unload(plugin.namespace, plugin.id);
                        }}
                        description={""}>
                        {plugin.namespace} / {plugin.id}
                    </Checkbox>
                );
            })}
        </div>
    );
});
