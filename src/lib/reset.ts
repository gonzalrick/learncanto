import { useStore } from "./store";

/** Clears all progress + the persisted store + caches, then reloads. */
export function initPwaReset() {
  useStore.getState().reset();
  try {
    localStorage.removeItem("canto:v2");
  } catch {
    /* ignore */
  }
  if ("caches" in window) {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
  }
  location.reload();
}
