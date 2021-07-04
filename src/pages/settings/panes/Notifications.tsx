import { Text } from "preact-i18n";
import styles from "./Panes.module.scss";
import defaultsDeep from "lodash.defaultsdeep";
import Checkbox from "../../../components/ui/Checkbox";
import { connectState } from "../../../redux/connector";
import { WithDispatcher } from "../../../redux/reducers";
import { SOUNDS_ARRAY } from "../../../assets/sounds/Audio";
import { useContext, useEffect, useState } from "preact/hooks";
import { urlBase64ToUint8Array } from "../../../lib/conversion";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { DEFAULT_SOUNDS, NotificationOptions, SoundOptions } from "../../../redux/reducers/settings";

interface Props {
    options?: NotificationOptions;
}

export function Component({ options, dispatcher }: Props & WithDispatcher) {
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

    const enabledSounds: SoundOptions = defaultsDeep(options?.sounds ?? {}, DEFAULT_SOUNDS);
    return (
        <div className={styles.notifications}>
            <h3>
                <Text id="app.settings.pages.notifications.push_notifications" />
            </h3>
            <Checkbox
                disabled={!("Notification" in window)}
                checked={options?.desktopEnabled ?? false}
                description={<Text id="app.settings.pages.notifications.descriptions.enable_desktop" />}
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

                    dispatcher({
                        type: "SETTINGS_SET_NOTIFICATION_OPTIONS",
                        options: { desktopEnabled }
                    });
                }}
            >
                <Text id="app.settings.pages.notifications.enable_desktop" />
            </Checkbox>
            <Checkbox
                disabled={typeof pushEnabled === "undefined"}
                checked={pushEnabled ?? false}
                description={<Text id="app.settings.pages.notifications.descriptions.enable_push" />}
                onChange={async pushEnabled => {
                    try {
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
                    } catch (err) {
                        console.error('Failed to enable push!', err);
                    }
                }}
            >
                <Text id="app.settings.pages.notifications.enable_push" />
            </Checkbox>
            <h3>
                <Text id="app.settings.pages.notifications.sounds" />
            </h3>
            {
                SOUNDS_ARRAY.map(key =>
                    <Checkbox
                        checked={enabledSounds[key] ? true : false}
                        onChange={enabled =>
                            dispatcher({
                                type: "SETTINGS_SET_NOTIFICATION_OPTIONS",
                                options: {
                                    sounds: {
                                        ...options?.sounds,
                                        [key]: enabled
                                    }
                                }
                            })
                        }>
                        <Text id={`app.settings.pages.notifications.sound.${key}`} />
                    </Checkbox>
                )
            }
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
