import macrosPlugin from "@insertish/vite-plugin-babel-macros";
import replace from "@rollup/plugin-replace";
import legacy from "@vitejs/plugin-legacy";
import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import preact from "@preact/preset-vite";

function getGitRevision() {
    try {
        const rev = readFileSync(".git/HEAD").toString().trim();
        if (rev.indexOf(":") === -1) {
            return rev;
        }

        return readFileSync(`.git/${rev.substring(5)}`)
            .toString()
            .trim();
    } catch (err) {
        console.error("Failed to get Git revision.");
        return "?";
    }
}

function getGitBranch() {
    try {
        const rev = readFileSync(".git/HEAD").toString().trim();
        if (rev.indexOf(":") === -1) {
            return "DETACHED";
        }

        return rev.split("/").pop();
    } catch (err) {
        console.error("Failed to get Git branch.");
        return "?";
    }
}

function getVersion() {
    return JSON.parse(readFileSync("package.json").toString()).version;
}

export default defineConfig({
    plugins: [
        preact(),
        macrosPlugin(),
        legacy({
            targets: ["defaults", "not IE 11"],
        }),
        VitePWA({
            srcDir: "src",
            filename: "sw.ts",
            strategies: "injectManifest",
            manifest: {
                name: "Revolt",
                short_name: "Revolt",
                description: "User-first, privacy-focused chat platform.",
                categories: ["communication", "chat", "messaging"],
                start_url: "/",
                orientation: "portrait",
                /*display_override: ["window-controls-overlay"],*/
                display: "standalone",
                background_color: "#101823",
                theme_color: "#101823",
                icons: [
                    {
                        src: `/assets/icons/android-chrome-192x192.png`,
                        type: "image/png",
                        sizes: "192x192",
                    },
                    {
                        src: `/assets/icons/android-chrome-512x512.png`,
                        type: "image/png",
                        sizes: "512x512",
                    },
                    {
                        src: `/assets/icons/monochrome.svg`,
                        type: "image/svg+xml",
                        sizes: "48x48 72x72 96x96 128x128 256x256",
                        purpose: "monochrome",
                    },
                    {
                        src: `/assets/icons/masking-512x512.png`,
                        type: "image/png",
                        sizes: "512x512",
                        purpose: "maskable",
                    },
                ],
                //TODO: add shortcuts relating to your last opened direct messages
                /*shortcuts: [
                    {
                      "name": "Open Play Later",
                      "short_name": "Play Later",
                      "description": "View the list of podcasts you saved for later",
                      "url": "/play-later?utm_source=homescreen",
                      "icons": [{ "src": "/icons/play-later.png", "sizes": "192x192" }]
                    },
                    {
                      "name": "View Subscriptions",
                      "short_name": "Subscriptions",
                      "description": "View the list of podcasts you listen to",
                      "url": "/subscriptions?utm_source=homescreen",
                      "icons": [{ "src": "/icons/subscriptions.png", "sizes": "192x192" }]
                    }
                  ]*/
            },
        }),
        replace({
            __GIT_REVISION__: getGitRevision(),
            __GIT_BRANCH__: getGitBranch(),
            __APP_VERSION__: getVersion(),
            preventAssignment: true,
        }) as any,
    ],
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
            },
        },
    },
    optimizeDeps: {
        exclude: ["revolt.js", "preact-context-menu", "@revoltchat/ui"],
    },
    resolve: {
        preserveSymlinks: true,
    },
});
