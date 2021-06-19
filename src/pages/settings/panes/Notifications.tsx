import { Text } from "preact-i18n";
import styles from "./Panes.module.scss";
import Checkbox from "../../../components/ui/Checkbox";
import { connectState } from "../../../redux/connector";
import { WithDispatcher } from "../../../redux/reducers";
import { useContext, useEffect, useState } from "preact/hooks";
import { urlBase64ToUint8Array } from "../../../lib/conversion";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { NotificationOptions } from "../../../redux/reducers/settings";
import { useIntermediate } from "../../../context/intermediate/Intermediate";

interface Props {
    options?: NotificationOptions;
}

export function Component(props: Props & WithDispatcher) {
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();
    const [pushEnabled, setPushEnabled] = useState<undefined | boolean>(
        undefined
    );

    // Load current state of pushManager.
    useEffect(() => {
        navigator.serviceWorker?.getRegistration().then(async registration => {
            const sub = await registration?.pushManager?.getSubscription();
            setPushEnabled(sub !== null && sub !== undefined);
        });
    }, []);

    return (
        <div className={styles.notifications}>
            <h3>
                <Text id="app.settings.pages.notifications.push_notifications" />
            </h3>
            <Checkbox
                disabled={!("Notification" in window)}
                checked={props.options?.desktopEnabled ?? false}
                onChange={async desktopEnabled => {
                    if (desktopEnabled) {
                        let permission = await Notification.requestPermission();
                        if (permission !== "granted") {
                            return openScreen({
                                id: "error",
                                error: "DeniedNotification"
                            });
                        }
                    }

                    props.dispatcher({
                        type: "SETTINGS_SET_NOTIFICATION_OPTIONS",
                        options: { desktopEnabled }
                    });
                }}
            >
                <Text id="app.settings.pages.notifications.enable_desktop" />
                <p>
                    <Text id="app.settings.pages.notifications.descriptions.enable_desktop" />
                </p>
            </Checkbox>
            <Checkbox
                disabled={typeof pushEnabled === "undefined"}
                checked={pushEnabled ?? false}
                onChange={async pushEnabled => {
                    const reg = await navigator.serviceWorker?.getRegistration();
                    if (reg) {
                        if (pushEnabled) {
                            const sub = await reg.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: urlBase64ToUint8Array(
                                    client.configuration!.vapid
                                )
                            });

                            // tell the server we just subscribed
                            const json = sub.toJSON();
                            if (json.keys) {
                                client.req("POST", "/push/subscribe", {
                                    endpoint: sub.endpoint,
                                    ...json.keys
                                } as any);
                                setPushEnabled(true);
                            }
                        } else {
                            const sub = await reg.pushManager.getSubscription();
                            sub?.unsubscribe();
                            setPushEnabled(false);

                            client.req("POST", "/push/unsubscribe");
                        }
                    }
                }}
            >
                <Text id="app.settings.pages.notifications.enable_push" />
                <p>
                    <Text id="app.settings.pages.notifications.descriptions.enable_push" />
                </p>
            </Checkbox>
            <h3>
                <Text id="app.settings.pages.notifications.sounds" />
            </h3>
            <Checkbox
                checked={props.options?.soundEnabled ?? true}
                onChange={soundEnabled =>
                    props.dispatcher({
                        type: "SETTINGS_SET_NOTIFICATION_OPTIONS",
                        options: { soundEnabled }
                    })
                }
            >
                <Text id="app.settings.pages.notifications.enable_sound" />
                <p>
                    <Text id="app.settings.pages.notifications.descriptions.enable_sound" />
                </p>
            </Checkbox>
            <Checkbox
                checked={props.options?.outgoingSoundEnabled ?? true}
                onChange={outgoingSoundEnabled =>
                    props.dispatcher({
                        type: "SETTINGS_SET_NOTIFICATION_OPTIONS",
                        options: { outgoingSoundEnabled }
                    })
                }
            >
                <Text id="app.settings.pages.notifications.enable_outgoing_sound" />
                <p>
                    <Text id="app.settings.pages.notifications.descriptions.enable_outgoing_sound" />
                </p>
            </Checkbox>
        </div>
    );
}

export const Notifications = connectState(
    Component,
    state => {
        return {
            options: state.settings.notification
        };
    },
    true
);
