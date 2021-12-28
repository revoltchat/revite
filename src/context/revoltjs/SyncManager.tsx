/**
 * This file monitors changes to settings and syncs them to the server.
 */
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";

import { useEffect } from "preact/hooks";

import { reportError } from "../../lib/ErrorBoundary";

import { useApplicationState } from "../../mobx/State";

import { useClient } from "./RevoltClient";

export default function SyncManager() {
    const client = useClient();
    const state = useApplicationState();

    // Sync settings from Revolt.
    useEffect(() => {
        if (client) {
            state.sync.pull(client);
        }
    }, [client]);

    // Keep data synced.
    useEffect(() => state.registerListeners(client), [client]);

    // Take data updates from Revolt.
    useEffect(() => {
        if (!client) return;
        function onPacket(packet: ClientboundNotification) {
            if (packet.type === "UserSettingsUpdate") {
                try {
                    state.sync.apply(packet.update);
                } catch (err) {
                    reportError(err, "failed_sync_apply");
                }
            }
        }

        client.addListener("packet", onPacket);
        return () => client.removeListener("packet", onPacket);
    }, [client]);

    return <></>;
}
