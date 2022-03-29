import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { useApplicationState } from "../../../mobx/State";

import Checkbox from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";

export const PluginsPage = observer(() => {
    const plugins = useApplicationState().plugins;
    return (
        <div className={styles.plugins}>
            <Tip error hideSeparator>
                Warning: This feature is still in development.
            </Tip>
            {plugins.list().map((plugin) => {
                // TODO(lexisother): Stop using Checkbox, write a custom component
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

            {plugins.list().length === 0 && (
                <div className={styles.empty}>
                    <Text id="app.settings.pages.plugins.no_plugins" />
                </div>
            )}
        </div>
    );
});
