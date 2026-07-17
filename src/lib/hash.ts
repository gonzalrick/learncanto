/** Small stable string hash — seeds SRS jitter, wild-card keys, and the daily
    phrase rotation. Lives on its own so the scheduler and the vocab registry
    can both use it without importing each other. */
export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
