import { resolve } from 'path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      manifest: {
        name: "Revolt",
        short_name: "Revolt",
        description: "User-first, privacy-focused chat platform.",
        categories: ["messaging"],
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#101823",
        icons: [
            {
                "src": "/assets/icons/android-chrome-192x192.png",
                "type": "image/png",
                "sizes": "192x192"
            },
            {
                "src": "/assets/icons/android-chrome-512x512.png",
                "type": "image/png",
                "sizes": "512x512"
            }
        ]
      },
      workbox: { }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ui: resolve(__dirname, 'ui/index.html')
      }
    }
  }
})
