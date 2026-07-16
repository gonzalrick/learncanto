import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // The old hand-written /sw.js is replaced by this Workbox SW at the same
      // scope. cleanupOutdatedCaches handles Workbox's own caches; the legacy
      // "canto-v*" caches are purged separately in src/pwa.ts on startup.
      filename: "sw.js",
      includeAssets: [
        "icon-180.png",
        "icon-192.png",
        "icon-512.png",
        "icon-192-maskable.png",
        "icon-512-maskable.png",
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,woff,woff2,png,svg,ico}"],
      },
      manifest: {
        name: "Learn Cantonese 學廣東話",
        short_name: "Cantonese",
        description:
          "Learn Cantonese with one five-minute session a day — spaced review, new words, and ear training on a single learning line.",
        lang: "en",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0a101d",
        theme_color: "#0a101d",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Today's session", short_name: "Today", url: "/" },
          { name: "Listening Dojo", short_name: "Listen", url: "/dojo" },
          { name: "Meeting the Family", short_name: "Family", url: "/family" },
        ],
      },
    }),
  ],
  server: { port: 5173 },
});
