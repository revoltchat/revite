import { observer } from "mobx-react-lite";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { Button, Checkbox, Tip } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

// Just keeping this here for general purpose. Should probably be exported
// elsewhere, though.
interface Plugin {
    namespace: string;
    id: string;
    version: string;
    enabled: boolean | undefined;
}

interface CardProps {
    plugin: Plugin;
}

function PluginCard({ plugin }: CardProps) {
    const plugins = useApplicationState().plugins;

    // TODO(lexisother): ...don't hijack bot cards? We need a general-purpose
    // card component.
    return (
        <div className={styles.myBots}>
            <div key={plugin.id} className={styles.botCard}>
                <div className={styles.infocontainer}>
                    <div className={styles.infoheader}>
                        <Checkbox
                            key={plugin.id}
                            value={plugin.enabled!}
                            title={
                                <>
                                    {plugin.namespace} / {plugin.id}
                                </>
                            }
                            onChange={() => {
                                !plugin.enabled
                                    ? plugins.load(plugin.namespace, plugin.id)
                                    : plugins.unload(
                                          plugin.namespace,
                                          plugin.id,
                                      );
                            }}
                        />
                    </div>
                </div>
                <div className={styles.buttonRow}>
                    <Button
                        palette="error"
                        onClick={() =>
                            plugins.remove(plugin.namespace, plugin.id)
                        }>
                        <Text id="app.settings.pages.plugins.delete_plugin" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export const PluginsPage = observer(() => {
    const plugins = useApplicationState().plugins;
    return (
        <div className={styles.plugins}>
            <Tip palette="error">
                <Text id="app.settings.pages.plugins.wip" />
            </Tip>
            {plugins.list().map((plugin) => {
                return <PluginCard key={plugin.id} plugin={plugin} />;
            })}

            {plugins.list().length === 0 && (
                <div className={styles.empty}>
                    <Text id="app.settings.pages.plugins.no_plugins" />
                </div>
            )}
        </div>
    );
});
