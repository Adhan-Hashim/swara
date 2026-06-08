# Swara

**An interactive Carnatic ear-training platform built on the 72 Melakarta Raga system.**

Explore raga scales, play swara intervals via the Web Audio API, practice with a Taala metronome, and study classical compositions — all in the browser.

---

## ✨ Features

- **72 Melakarta Raga Index** — Browse all ragas organised by Chakra, with one-click scale selection
- **Swara Register** — Live arohanam/avarohanam display; click any swara to hear its exact frequency
- **Sonic Sequencer** — Play the full ascending/descending scale note-by-note with tempo control
- **Taala Metronome** — Adi, Rupaka, Misra Chapu and more rhythmic cycles with an animated beat tracker
- **Composition Practice** — Study Swaravali exercises, Geetham songs, and Varnam phrases
- **Web Audio API** — Pure-tone synthesis at mathematically correct Carnatic microtonal ratios (no samples needed)

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), TypeScript |
| Animation | Framer Motion |
| Audio | Web Audio API (browser-native) |
| Styling | Tailwind CSS |
| Backend (optional) | Python / FastAPI |

---

## 🚀 Getting Started

```bash
# Install dependencies
cd frontend
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
raagam/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # Page, layout, global styles
│   │   ├── components/
│   │   └── data/      # ragaDb.ts — all 72 Melakarta definitions
│   └── public/        # Static images
└── backend/           # FastAPI server (optional raga detail API)
```

---

## 🎵 About Carnatic Music

In the Carnatic tradition, a **Swara** is not merely a static pitch — it is a dynamic node of consciousness, defined by its precise microtonal relation to the fundamental tonic (**Adhara Shadjam**). The 12 Swarasthanas emerge from natural harmonic ratios, forming a complex mathematical system that has persisted for centuries.

---

*Built with ♩ by [Adhan Hashim](https://github.com/Adhan-Hashim)*
