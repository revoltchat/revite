/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
    async function process() {
        if (event.data === null) return;
        // Need to write notification generator on server.
    }

    event.waitUntil(process());
});

// ? Open the app on notification click.
// https://stackoverflow.com/a/39457287
self.addEventListener("notificationclick", (event) => {
    const url = event.notification.data;
    event.notification.close();
    event.waitUntil(
        self.clients
            .matchAll({ includeUncontrolled: true, type: "window" })
            .then((windowClients) => {
                // Check if there is already a window/tab open with the target URL
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    // If so, just focus it.
                    if (client.url === url && "focus" in client) {
                        return client.focus();
                    }
                }

                // If not, then open the target URL in a new window/tab.
                if (self.clients.openWindow) {
                    return self.clients.openWindow(url);
                }
            }),
    );
});
