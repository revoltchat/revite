/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

cleanupOutdatedCaches();

// Generate list using scripts/locale.js
// prettier-ignore
const locale_keys = ["af","am","ar-dz","ar-kw","ar-ly","ar-ma","ar-sa","ar-tn","ar","az","be","bg","bi","bm","bn","bo","br","bs","ca","cs","cv","cy","da","de-at","de-ch","de","dv","el","en-au","en-ca","en-gb","en-ie","en-il","en-in","en-nz","en-sg","en-tt","en","eo","es-do","es-pr","es-us","es","et","eu","fa","fi","fo","fr-ca","fr-ch","fr","fy","ga","gd","gl","gom-latn","gu","he","hi","hr","ht","hu","hy-am","id","is","it-ch","it","ja","jv","ka","kk","km","kn","ko","ku","ky","lb","lo","lt","lv","me","mi","mk","ml","mn","mr","ms-my","ms","mt","my","nb","ne","nl-be","nl","nn","oc-lnc","pa-in","pl","pt-br","pt","ro","ru","rw","sd","se","si","sk","sl","sq","sr-cyrl","sr","ss","sv-fi","sv","sw","ta","te","tet","tg","th","tk","tl-ph","tlh","tr","tzl","tzm-latn","tzm","ug-cn","uk","ur","uz-latn","uz","vi","x-pseudo","yo","zh-cn","zh-hk","zh-tw","zh","ang","ar","az","be","bg","bn","bottom","br","ca","ca@valencia","ckb","contributors","cs","cy","da","de","de_CH","el","en","en_US","enchantment","enm","eo","es","et","eu","fa","fi","fil","fr","frm","ga","got","he","hi","hr","hu","id","it","ja","kmr","ko","la","lb","leet","li","lt","lv","mk","ml","ms","mt","nb_NO","nl","owo","peo","piglatin","pl","pr","pt_BR","pt_PT","ro","ro_MD","ru","si","sk","sl","sq","sr","sv","ta","te","th","tlh-qaak","tokipona","tr","uk","vec","vi","zh_Hans","zh_Hant"];

precacheAndRoute(
    self.__WB_MANIFEST.filter((entry) => {
        try {
            const url = typeof entry === "string" ? entry : entry.url;
            if (url.includes("-legacy")) return false;

            const fn = url.split("/").pop();
            if (fn) {
                if (
                    fn.endsWith("css") &&
                    !isNaN(parseInt(fn.substring(0, 3)))
                ) {
                    return false;
                }

                for (const key of locale_keys) {
                    if (fn.startsWith(`${key  }.`)) {
                        return false;
                    }
                }
            }

            return true;
        } catch (err) {
            return false;
        }
    }),
);

self.addEventListener("push", (event) => {
    async function process() {
        if (event.data) {
            const data = event.data.json();
            await self.registration.showNotification(data.author, {
                icon: data.icon,
                image: data.image,
                body: data.body,
                timestamp: data.timestamp * 1000,
                tag: data.tag,
                badge: "https://app.revolt.chat/assets/icons/monochrome.svg",
                data: data.url,
            });
        }
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
