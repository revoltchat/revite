import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { urlBase64ToUint8Array } from "../../../lib/conversion";

import { useApplicationState } from "../../../mobx/State";
import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";
import { NotificationOptions } from "../../../redux/reducers/settings";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Checkbox from "../../../components/ui/Checkbox";

interface Props {
    options?: NotificationOptions;
}

export function Component({ options }: Props) {
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();
    const sounds = useApplicationState().settings.sounds;
    const [pushEnabled, setPushEnabled] = useState<undefined | boolean>(
        undefined,
    );

    // Load current state of pushManager.
    useEffect(() => {
        navigator.serviceWorker
            ?.getRegistration()
            .then(async (registration) => {
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
                checked={options?.desktopEnabled ?? false}
                description={
                    <Text id="app.settings.pages.notifications.descriptions.enable_desktop" />
                }
                onChange={async (desktopEnabled) => {
                    if (desktopEnabled) {
                        const permission =
                            await Notification.requestPermission();
                        if (permission !== "granted") {
                            return openScreen({
                                id: "error",
                                error: "DeniedNotification",
                            });
                        }
                    }

                    dispatch({
                        type: "SETTINGS_SET_NOTIFICATION_OPTIONS",
                        options: { desktopEnabled },
                    });
                }}>
                <Text id="app.settings.pages.notifications.enable_desktop" />
            </Checkbox>
            <Checkbox
                disabled={typeof pushEnabled === "undefined"}
                checked={pushEnabled ?? false}
                description={
                    <Text id="app.settings.pages.notifications.descriptions.enable_push" />
                }
                onChange={async (pushEnabled) => {
                    try {
                        const reg =
                            await navigator.serviceWorker?.getRegistration();
                        if (reg) {
                            if (pushEnabled) {
                                const sub = await reg.pushManager.subscribe({
                                    userVisibleOnly: true,
                                    applicationServerKey: urlBase64ToUint8Array(
                                        client.configuration!.vapid,
                                    ),
                                });

                                // tell the server we just subscribed
                                const json = sub.toJSON();
                                if (json.keys) {
                                    client.req("POST", "/push/subscribe", {
                                        endpoint: sub.endpoint,
                                        ...(json.keys as {
                                            p256dh: string;
                                            auth: string;
                                        }),
                                    });
                                    setPushEnabled(true);
                                }
                            } else {
                                const sub =
                                    await reg.pushManager.getSubscription();
                                sub?.unsubscribe();
                                setPushEnabled(false);

                                client.req("POST", "/push/unsubscribe");
                            }
                        }
                    } catch (err) {
                        console.error("Failed to enable push!", err);
                    }
                }}>
                <Text id="app.settings.pages.notifications.enable_push" />
            </Checkbox>
            <h3>
                <Text id="app.settings.pages.notifications.sounds" />
            </h3>
            {sounds.getState().map(({ id, enabled }) => (
                <Checkbox
                    key={id}
                    checked={enabled}
                    onChange={(enabled) => sounds.setEnabled(id, enabled)}>
                    <Text id={`app.settings.pages.notifications.sound.${id}`} />
                </Checkbox>
            ))}
        </div>
    );
}

export const Notifications = connectState(Component, (state) => {
    return {
        options: state.settings.notification,
    };
});
