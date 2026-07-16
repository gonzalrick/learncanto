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
  lib/        srs · streak · session · store (Zustand) · speech · launch
  components/  Jyutping · Speaker · Tabs · DeckChips · Flashcards · Quiz · SessionOverlay · …
  pages/      Today · Line · Practice · Foundations · Characters · Dojo · VocabLesson (Basics/Beyond/Conversational/Family)
```

## Development

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # typecheck + production build to dist/
npm run preview   # serve the built app
npm run test      # vitest (logic + component + page smoke tests)
```

## Deployment

Firebase Hosting serves `dist/`. Merging to `main` triggers `.github/workflows/firebase-hosting-merge.yml`, which builds and deploys. Old `/cantonese-*.html` URLs 301-redirect to the new clean routes (see `firebase.json`).

## A note on audio & progress

- Audio uses each device's built-in Cantonese text-to-speech voice. iPhone/Mac and Android tend to sound best.
- Progress is saved per device in the browser (localStorage). It persists on the same device but does not sync across devices.
