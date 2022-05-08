import { Check } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { Button } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

import { CheckboxBase, Checkmark } from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";

// Just keeping this here for general purpose. Should probably be exported
// elsewhere, though.
interface Plugin {
    namespace: string;
    id: string;
    version: string;
    enabled: boolean | undefined;
}

const CustomCheckboxBase = styled(CheckboxBase)`
    margin-top: 0 !important;
`;
export interface CheckboxProps {
    checked: boolean;
    disabled?: boolean;
    onChange: (state: boolean) => void;
}
function PluginCheckbox(props: CheckboxProps) {
    // HACK HACK HACK(lexisother): THIS ENTIRE THING IS A HACK!!!!
    /*
        Until some reviewer points me in the right direction, I've resorted to
         fabricating my own checkbox component.
       "WHY?!", you might ask. Well, the normal `Checkbox` component can take
         textual contents, and *also* adds a `margin-top` of 20 pixels.
        We... don't need that. At all. *Especially* the margin. It makes our card
         look disproportionate.
        
        Apologies, @insert!
    */
    return (
        <CustomCheckboxBase disabled={props.disabled}>
            <input
                type="checkbox"
                checked={props.checked}
                onChange={() =>
                    !props.disabled && props.onChange(!props.checked)
                }
            />
            <Checkmark checked={props.checked} className="check">
                <Check size={20} />
            </Checkmark>
        </CustomCheckboxBase>
    );
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
                        <div className={styles.container}>
                            {plugin.namespace} / {plugin.id}
                        </div>
                        <PluginCheckbox
                            key={plugin.id}
                            checked={plugin.enabled!}
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
            <Tip error hideSeparator>
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
