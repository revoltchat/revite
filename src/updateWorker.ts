import semver from "semver";
import { ulid } from "ulid";
import { registerSW } from "virtual:pwa-register";

import { internalEmit } from "./lib/eventEmitter";

import { modalController } from "./context/modals";

import { APP_VERSION } from "./version";

const INTERVAL_HOUR = 36e5;

let forceUpdate = false;
let registration: ServiceWorkerRegistration | undefined;

export const updateSW = registerSW({
    onNeedRefresh() {
        if (forceUpdate) {
            updateSW(true);
        } else {
            internalEmit("PWA", "update");
        }
    },
    onOfflineReady() {
        console.info("Ready to work offline.");
        // show a ready to work offline to user
    },
    onRegistered(r) {
        registration = r;

        // Check for updates every hour
        setInterval(() => r!.update(), INTERVAL_HOUR);
    },
});

/**
 * Check whether the client is out of date
 */
async function checkVersion() {
    const { version } = (await fetch("https://api.revolt.chat/release").then(
        (res) => res.json(),
    )) as { version: string };

    if (!semver.satisfies(APP_VERSION, version) && APP_VERSION !== version) {
        // Let the worker know we should immediately refresh
        forceUpdate = true;

        // Prompt service worker to update
        registration?.update();

        // Push information that the client is out of date
        modalController.push({
            key: ulid(),
            type: "out_of_date",
            version,
        });
    }
}

if (import.meta.env.VITE_API_URL === "https://api.revolt.chat") {
    // Check for critical updates hourly
    checkVersion();
    setInterval(checkVersion, INTERVAL_HOUR);
}
