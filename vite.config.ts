import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";
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
    return readFileSync("VERSION").toString();
}

export default defineConfig({
    plugins: [
        viteCompression({
            verbose: true,
            algorithm: "brotliCompress",
        }),
        preact(),
        VitePWA({
            srcDir: "src",
            filename: "sw.ts",
            strategies: "injectManifest",
            manifest: {
                name: "Revolt",
                short_name: "Revolt",
                description: "User-first, privacy-focused chat platform.",
                categories: ["messaging"],
                start_url: "/",
                orientation: "portrait",
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
            },
        }),
        replace({
            __GIT_REVISION__: getGitRevision(),
            __GIT_BRANCH__: getGitBranch(),
            __APP_VERSION__: getVersion(),
            preventAssignment: true,
        }),
    ],
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                ui: resolve(__dirname, "ui/index.html"),
            },
        },
    },
    optimizeDeps: {
        exclude: ["revolt.js"],
    },
});
