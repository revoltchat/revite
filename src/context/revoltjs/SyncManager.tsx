/**
 * This file monitors changes to settings and syncs them to the server.
 */
import isEqual from "lodash.isequal";
import { UserSettings } from "revolt-api/types/Sync";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

import { useCallback, useContext, useEffect, useMemo } from "preact/hooks";

import { dispatch } from "../../redux";
import { connectState } from "../../redux/connector";
import { Notifications } from "../../redux/reducers/notifications";
import { Settings } from "../../redux/reducers/settings";
import {
    DEFAULT_ENABLED_SYNC,
    SyncData,
    SyncKeys,
    SyncOptions,
} from "../../redux/reducers/sync";

import { Language } from "../Locale";
import { AppContext, ClientStatus, StatusContext } from "./RevoltClient";

type Props = {
    settings: Settings;
    locale: Language;
    sync: SyncOptions;
    notifications: Notifications;
};

const lastValues: { [key in SyncKeys]?: unknown } = {};

export function mapSync(
    packet: UserSettings,
    revision?: Record<string, number>,
) {
    const update: { [key in SyncKeys]?: [number, SyncData[key]] } = {};
    for (const key of Object.keys(packet)) {
        const [timestamp, obj] = packet[key];
        if (timestamp < (revision ?? {})[key] ?? 0) {
            continue;
        }

        let object;
        if (obj[0] === "{") {
            object = JSON.parse(obj);
        } else {
            object = obj;
        }

        lastValues[key as SyncKeys] = object;
        update[key as SyncKeys] = [timestamp, object];
    }

    return update;
}

function SyncManager(props: Props) {
    const client = useContext(AppContext);
    const status = useContext(StatusContext);

    useEffect(() => {
        if (status === ClientStatus.ONLINE) {
            client
                .syncFetchSettings(
                    DEFAULT_ENABLED_SYNC.filter(
                        (x) => !props.sync?.disabled?.includes(x),
                    ),
                )
                .then((data) => {
                    dispatch({
                        type: "SYNC_UPDATE",
                        update: mapSync(data),
                    });
                });

            client
                .syncFetchUnreads()
                .then((unreads) => dispatch({ type: "UNREADS_SET", unreads }));
        }
    }, [client, props.sync?.disabled, status]);

    const syncChange = useCallback(
        (key: SyncKeys, data: unknown) => {
            const timestamp = +new Date();
            dispatch({
                type: "SYNC_SET_REVISION",
                key,
                timestamp,
            });

            client.syncSetSettings(
                {
                    [key]: data as string,
                },
                timestamp,
            );
        },
        [client],
    );

    const disabled = useMemo(
        () => props.sync.disabled ?? [],
        [props.sync.disabled],
    );
    for (const [key, object] of [
        ["appearance", props.settings.appearance],
        ["theme", props.settings.theme],
        ["locale", props.locale],
        ["notifications", props.notifications],
    ] as [SyncKeys, unknown][]) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (disabled.indexOf(key) === -1) {
                if (typeof lastValues[key] !== "undefined") {
                    if (!isEqual(lastValues[key], object)) {
                        syncChange(key, object);
                    }
                }
            }

            lastValues[key] = object;
        }, [key, syncChange, disabled, object]);
    }

    useEffect(() => {
        function onPacket(packet: ClientboundNotification) {
            if (packet.type === "UserSettingsUpdate") {
                const update: { [key in SyncKeys]?: [number, SyncData[key]] } =
                    mapSync(packet.update, props.sync.revision);

                dispatch({
                    type: "SYNC_UPDATE",
                    update,
                });
            }
        }

        client.addListener("packet", onPacket);
        return () => client.removeListener("packet", onPacket);
    }, [client, disabled, props.sync]);

    return null;
}

export default connectState(SyncManager, (state) => {
    return {
        settings: state.settings,
        locale: state.locale,
        sync: state.sync,
        notifications: state.notifications,
    };
});
