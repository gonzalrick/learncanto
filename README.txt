Learn Cantonese — installable PWA (static site)
================================================

CONTENTS
  public/            <- everything that gets hosted
    index.html       <- the hub (start page)
    cantonese-*.html <- the 6 lesson / practice apps
    voice.js         <- shared Cantonese voice picker (consistent across all pages)
    sw.js            <- service worker (offline support)
    manifest.webmanifest
    icon-*.png       <- app icons (standard + maskable + apple-touch)
  firebase.json      <- ready Firebase Hosting config (no-cache for sw.js/manifest)

DEPLOY TO FIREBASE
  1. Install tools:   npm install -g firebase-tools   (needs Node 18 or 20+)
  2. firebase login
  3. firebase init hosting   -> public dir: "public"; single-page app: No; overwrite index.html: No
     (or just drop these files next to your existing firebase.json)
  4. firebase deploy
  Your site will be live at https://<your-site>.web.app over HTTPS.

  If you created a named site (e.g. "learncanto"):
     firebase target:apply hosting live learncanto
     add  "target": "live"  inside the hosting block of firebase.json
     firebase deploy --only hosting:live

INSTALL AS AN APP
  - Android/Chrome: "Install app" prompt, or menu > Install.
  - iPhone/iPad (Safari): Share > Add to Home Screen.
  - Desktop Chrome/Edge: install icon in the address bar.
  PWA features (install + offline) only work over HTTPS (your live URL), not file://.

MAINTENANCE
  - When you change any file and redeploy, bump the cache version in sw.js
    (e.g. 'canto-v2' -> 'canto-v3') so returning users get the update.

NOTES
  - Audio uses each device's built-in Cantonese voice; pick one via the
    floating "Voice" button (bottom-right). iPhone/Mac and Android do best.
  - Progress saves per-device (browser localStorage). Same-device, it persists;
    it does not sync across devices.
