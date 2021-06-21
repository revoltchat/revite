/**
 * This file monitors changes to settings and syncs them to the server.
 */

import isEqual from "lodash.isequal";
import { Language } from "../Locale";
import { Sync } from "revolt.js/dist/api/objects";
import { useContext, useEffect } from "preact/hooks";
import { connectState } from "../../redux/connector";
import { WithDispatcher } from "../../redux/reducers";
import { Settings } from "../../redux/reducers/settings";
import { AppContext, ClientStatus, StatusContext } from "./RevoltClient";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";
import { DEFAULT_ENABLED_SYNC, SyncData, SyncKeys, SyncOptions } from "../../redux/reducers/sync";

type Props = WithDispatcher & {
    settings: Settings,
    locale: Language,
    sync: SyncOptions
};

var lastValues: { [key in SyncKeys]?: any } = { };

export function mapSync(packet: Sync.UserSettings, revision?: { [key: string]: number }) {
    let update: { [key in SyncKeys]?: [ number, SyncData[key] ] } = {};
    for (let key of Object.keys(packet)) {
        let [ timestamp, obj ] = packet[key];
        if (timestamp < (revision ?? {} as any)[key] ?? 0) {
            continue;
        }

        let object;
        if (obj[0] === '{') {
            object = JSON.parse(obj)
        } else {
            object = obj;
        }

        lastValues[key as SyncKeys] = object;
        update[key as SyncKeys] = [ timestamp, object ];
    }

    return update;
}

function SyncManager(props: Props) {
    const client = useContext(AppContext);
    const status = useContext(StatusContext);

    useEffect(() => {
        if (status === ClientStatus.ONLINE) {
            client
                .syncFetchSettings(DEFAULT_ENABLED_SYNC.filter(x => !props.sync?.disabled?.includes(x)))
                .then(data => {
                    props.dispatcher({
                        type: 'SYNC_UPDATE',
                        update: mapSync(data)
                    });
                });

            client
                .syncFetchUnreads()
                .then(unreads => props.dispatcher({ type: 'UNREADS_SET', unreads }));
        }
    }, [ status ]);

    function syncChange(key: SyncKeys, data: any) {
        let timestamp = + new Date();
        props.dispatcher({
            type: 'SYNC_SET_REVISION',
            key,
            timestamp
        });

        client.syncSetSettings({
            [key]: data
        }, timestamp);
    }

    let disabled = props.sync.disabled ?? [];
    for (let [key, object] of [ ['appearance', props.settings.appearance], ['theme', props.settings.theme], ['locale', props.locale] ] as [SyncKeys, any][]) {
        useEffect(() => {
            if (disabled.indexOf(key) === -1) {
                if (typeof lastValues[key] !== 'undefined') {
                    if (!isEqual(lastValues[key], object)) {
                        syncChange(key, object);
                    }
                }
            }

            lastValues[key] = object;
        }, [ disabled, object ]);
    }

    useEffect(() => {
        function onPacket(packet: ClientboundNotification) {
            if (packet.type === 'UserSettingsUpdate') {
                let update: { [key in SyncKeys]?: [ number, SyncData[key] ] } = mapSync(packet.update, props.sync.revision);

                props.dispatcher({
                    type: 'SYNC_UPDATE',
                    update
                });
            }
        }

        client.addListener('packet', onPacket);
        return () => client.removeListener('packet', onPacket);
    }, [ disabled, props.sync ]);

    return <></>;
}

export default connectState(
    SyncManager,
    state => {
        return {
            settings: state.settings,
            locale: state.locale,
            sync: state.sync
        };
    },
    true
);
