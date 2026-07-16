import { registerSW } from "virtual:pwa-register";

/**
 * Registers the Workbox service worker (auto-updating) and purges the
 * legacy hand-written caches from the vanilla app. Workbox only cleans
 * its own caches, so the old "canto-v*" caches must be deleted here.
 */
export function initPwa() {
  if ("caches" in window) {
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith("canto-")).map((k) => caches.delete(k)),
        ),
      )
      .catch(() => {});
  }
  registerSW({ immediate: true });
}
