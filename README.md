# Learn Cantonese 學廣東話

A free Cantonese learning app built around **one five-minute session a day** — spaced review, a few new words, and ear training, all on a single "learning line". Runs in the browser, installable as a PWA, no account or download required.

**▶ Open the app: [learncanto.web.app](https://learncanto.web.app/)**

## What it is

The course is drawn as a metro-style **line**: each lesson is a station, each level a colored zone, "Meeting the Family" an optional interchange branch, and "Learn the Characters" an optional reading branch. Three surfaces:

- **Today** — one button builds your daily session: reviews about to fade + new words from your current station + a couple of ear reps.
- **The Line** — the whole route map; see where you are and jump anywhere.
- **Practice** — free play: the Listening Dojo, flashcards, quick ear drills, station quizzes.

Learning is scheduled with **spaced repetition** (grade *Again / Got it*), and a **daily streak** with a weekly rest-day shield keeps you coming back.

### The path

| Zone | Lesson | What you'll learn |
|------|--------|-------------------|
| **L0** | **Foundations** 入門 | The six tones, the sounds, jyutping, and your first building-block words. |
| — | **Learn the Characters** 認字 | *(optional)* Chinese characters from zero — pictures, then stories, then reading. |
| **L1** | **Basics** 基礎 | 300+ survival words — greetings, numbers, food, directions, emergencies. |
| — | **Meeting the Family** 見家長 | *(optional)* Warm phrases for meeting your partner's relatives, and what to call everyone. |
| **L1.5** | **Beyond the Basics** 進階 | Scenes, grammar, and 300 more words. |
| **L2** | **Conversational** 講廣東話 | Particles, patterns, and sounding local. |

Plus the **Listening Dojo** 聽力訓練 — adjustable-speed ear training that also feeds every daily session.

### Features

- 🔊 Tap ▶ anywhere to hear a word in your device's Cantonese voice
- 🗣️ Tone-colored jyutping on every word
- 🔁 Spaced-repetition review that brings words back before you forget them
- 🔥 Daily streak with a weekly rest-day shield
- 📲 Installable · 📴 works offline · 🆓 free, no sign-up, no tracking

## Tech stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v4** (design tokens in `src/index.css`)
- **React Router** (SPA)
- **Zustand** for state, persisted to `localStorage` (`canto:v2`)
- **vite-plugin-pwa** (Workbox) for the offline service worker + manifest
- Self-hosted Latin fonts (Archivo, Inter, IBM Plex Mono); Chinese uses the system font

## Project layout

```
src/
  data/       typed lesson data (ported from the original data files) + zones.ts registry
  lib/        srs · streak · session · store (Zustand) · speech · launch · dictionary (search) · translate
  components/  Jyutping · Speaker · Tabs · DeckChips · Flashcards · Quiz · SessionOverlay · …
  pages/      Today · Line · Practice · Search · Translate · Foundations · Characters · Dojo · VocabLesson (Basics/Beyond/Conversational/Family)
functions/    Firebase Cloud Function: /api/translate proxy (holds the Anthropic API key)
```

## Development

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # typecheck + production build to dist/
npm run preview   # serve the built app
npm run test      # vitest (logic + component + page smoke tests)
```

### Testing the translate feature locally

Everything except live translation works with plain `npm run dev` (search, jyutping, audio, translation history). To exercise the real `/api/translate` path locally:

1. Put your Anthropic API key in `functions/.secret.local` (gitignored):
   `ANTHROPIC_API_KEY=sk-ant-...`
2. In one terminal: `firebase emulators:start --only functions`
3. In another: `npm run dev` — the vite dev server proxies `/api/translate` to the emulator (see `vite.config.ts`), so the Translate page works end-to-end with hot reload.

For a production-like check of the built app (service worker, hosting rewrites), use `npm run build && firebase emulators:start --only hosting,functions` and open http://localhost:5000.

## Deployment

Firebase Hosting serves `dist/`, and a Cloud Function in `functions/` serves the `/api/translate` endpoint (English → spoken Cantonese via Claude Haiku; jyutping and audio are derived on-device). Merging to `main` triggers `.github/workflows/firebase-hosting-merge.yml`, which deploys the function first, then hosting. Old `/cantonese-*.html` URLs 301-redirect to the new clean routes (see `firebase.json`).

### One-time setup (browser consoles only, no CLI)

The translate function needs four things set up once. Everything below is point-and-click.

**1. Upgrade to the Blaze plan** *(required for Cloud Functions; the free allowance covers this app's usage)*
[Firebase console](https://console.firebase.google.com/project/learncanto-500508/usage/details) → ⚙️ next to Project Overview → **Usage and billing** → **Modify plan** → Blaze.

**2. Enable the Cloud APIs the first deploy needs**
In the [Google Cloud console API library](https://console.cloud.google.com/apis/library?project=learncanto-500508), search for and **Enable** each of: **Cloud Functions API**, **Cloud Build API**, **Artifact Registry API**, **Cloud Run Admin API**.

**3. Create the Anthropic API key secret and let the function read it**
- Create the key at [console.anthropic.com](https://console.anthropic.com/) (API Keys). While there, set a monthly **spend limit** (e.g. $5) under Billing → Limits.
- [Google Cloud console → Security → Secret Manager](https://console.cloud.google.com/security/secret-manager?project=learncanto-500508) → **Create secret** → name it exactly `ANTHROPIC_API_KEY`, paste the key as the value, leave everything else default.
- Open the new secret → **Permissions** tab → **Grant access** → principal `PROJECT_NUMBER-compute@developer.gserviceaccount.com` (the function's runtime account — find the project number in Firebase console → Project settings → General) → role **Secret Manager Secret Accessor**.

**4. Let the GitHub Actions service account deploy functions**
The deploy workflow reuses the service account Firebase created for hosting deploys (the `FIREBASE_SERVICE_ACCOUNT_LEARNCANTO_500508` repo secret). In [Google Cloud console → IAM](https://console.cloud.google.com/iam-admin/iam?project=learncanto-500508), find the principal named like `github-action-…@learncanto-500508.iam.gserviceaccount.com` → ✏️ **Edit principal** → add four roles: **Cloud Functions Developer**, **Service Account User**, **Secret Manager Viewer**, **Service Usage Consumer**.

After that, every merge to `main` ships web + function together. If a functions deploy ever fails with a permission error, the message names the missing permission — add the matching role to the same principal in the IAM page. The Anthropic key is never in the repo, the workflow, or the PWA bundle; it lives only in Secret Manager.

## A note on audio & progress

- Audio uses each device's built-in Cantonese text-to-speech voice. iPhone/Mac and Android tend to sound best.
- Progress is saved per device in the browser (localStorage). It persists on the same device but does not sync across devices.
