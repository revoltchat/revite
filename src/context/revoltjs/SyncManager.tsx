/**
 * This file monitors changes to settings and syncs them to the server.
 */
import { ClientboundNotification } from "revolt.js";

import { useEffect } from "preact/hooks";

import { reportError } from "../../lib/ErrorBoundary";

import { useApplicationState } from "../../mobx/State";

import {
    useClient,
    useSession,
} from "../../controllers/client/ClientController";

export default function SyncManager() {
    const client = useClient();
    const session = useSession();
    const state = useApplicationState();

    // Sync settings from Revolt.
    useEffect(() => {
        if (session?.ready) {
            state.sync
                .pull(session.client!)
                .catch(console.error)
                .finally(() => state.changelog.checkForUpdates());
        }
    }, [session?.ready]);

    // Take data updates from Revolt.
    useEffect(() => {
        if (!client) return;
        function onPacket(packet: ClientboundNotification) {
            if (packet.type === "UserSettingsUpdate") {
                try {
                    state.sync.apply(packet.update);
                } catch (err) {
                    reportError(err as any, "failed_sync_apply");
                }
            }
        }

        client.addListener("packet", onPacket);
        return () => client.removeListener("packet", onPacket);
    }, [client]);

    return <></>;
}
