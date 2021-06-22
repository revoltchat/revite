import { resolve } from 'path'
import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import replace from '@rollup/plugin-replace'

function getGitRevision() {
  try {
    const rev = readFileSync('.git/HEAD').toString().trim();
    if (rev.indexOf(':') === -1) {
      return rev;
    } else {
      return readFileSync('.git/' + rev.substring(5)).toString().trim();
    }
  } catch (err) {
    console.error('Failed to get Git revision.');
    return '?';
  }
}

function getGitBranch() {
  try {
    const rev = readFileSync('.git/HEAD').toString().trim();
    if (rev.indexOf(':') === -1) {
      return 'DETACHED';
    } else {
      return rev.split('/').pop();
    }
  } catch (err) {
    console.error('Failed to get Git branch.');
    return '?';
  }
}

function getVersion() {
  return readFileSync('VERSION').toString();
}

const branch = getGitBranch();
const isNightly = branch !== 'production';
const iconPrefix = isNightly ? 'nightly-' : '';

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      srcDir: 'src',
      filename: 'sw.ts',
      strategies: 'injectManifest',
      manifest: {
        name: isNightly ? "REVOLT nightly" : "REVOLT",
        short_name: "REVOLT",
        description: isNightly ? "Early preview builds of REVOLT." : "User-first, privacy-focused chat platform.",
        categories: ["messaging"],
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#101823",
        icons: [
            {
                "src": `/assets/icons/${iconPrefix}android-chrome-192x192.png`,
                "type": "image/png",
                "sizes": "192x192"
            },
            {
                "src": `/assets/icons/${iconPrefix}android-chrome-512x512.png`,
                "type": "image/png",
                "sizes": "512x512"
            }
        ]
      }
    }),
    replace({
      __GIT_REVISION__: getGitRevision(),
      __GIT_BRANCH__: getGitBranch(),
      __APP_VERSION__: getVersion(),
      preventAssignment: true
    })
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ui: resolve(__dirname, 'ui/index.html')
      }
    }
  }
})
