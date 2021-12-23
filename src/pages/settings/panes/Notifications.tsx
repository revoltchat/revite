import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { urlBase64ToUint8Array } from "../../../lib/conversion";

import { useApplicationState } from "../../../mobx/State";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Checkbox from "../../../components/ui/Checkbox";

export function Notifications() {
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();
    const settings = useApplicationState().settings;
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
                checked={settings.get("notifications:desktop", false)!}
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

                    settings.set("notifications:desktop", desktopEnabled);
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
            {settings.sounds.getState().map(({ id, enabled }) => (
                <Checkbox
                    key={id}
                    checked={enabled}
                    onChange={(enabled) =>
                        settings.sounds.setEnabled(id, enabled)
                    }>
                    <Text id={`app.settings.pages.notifications.sound.${id}`} />
                </Checkbox>
            ))}
        </div>
    );
}
