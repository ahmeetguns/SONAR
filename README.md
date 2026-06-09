# Sonar — Cinematic AI

An AI-powered recommendation engine for movies, TV series, and music. Type a title you love, get twelve curated suggestions in seconds — with poster images, match scores, and mood-based filtering.

## Features

- **AI recommendations** — Claude Haiku generates 12 relevant titles per query, enriched with posters and metadata from TMDB and Last.fm
- **Three content tabs** — Movies, Series, and Music, each with its own animated background and color theme
- **Fuse.js fuzzy search** — local catalog of ~1,000 titles for instant dropdown suggestions as you type
- **Sonar Moodboard** — filter by genre, mood (Happy / Sad / Anxious / Scared / Relaxed / Laugh), and country or region; settings persist across sessions
- **Rate limiting & caching** — 6 requests per minute per IP, results cached for 1 hour to reduce API costs
- **Keyboard navigation** — ↑↓ to navigate the search dropdown, Enter to select, Esc to close

## Tech Stack

- **Frontend:** React 18, Vite 8, Framer Motion, Fuse.js
- **Backend:** Express.js (local dev), configured for Vercel Serverless Functions
- **APIs:** Anthropic Claude Haiku, TMDB, Last.fm, MusicBrainz

## Setup

You need [Node.js 18+](https://nodejs.org/).

### 1. Install dependencies

```bash
npm install
```

### 2. Get free API keys

- **Anthropic** — https://console.anthropic.com/api-keys
- **TMDB** — https://www.themoviedb.org/signup → Settings → API → request a key (Developer tier, free)
- **Last.fm** — https://www.last.fm/api/account/create (free, instant)

### 3. Fill in your keys

```bash
cp .env.example .env
```

Open `.env` and paste your keys. The file is gitignored — keys never reach the browser.

### 4. Run the dev server

```bash
npm run dev
```

Starts both the Vite frontend and the Express API server. Open http://localhost:5173.

### 5. (Optional) Refresh the catalog

```bash
npm run fetch-catalog
```

Fetches fresh data from TMDB and Last.fm and writes `src/data.json`. Takes 8–12 minutes. The repo already includes a pre-built catalog so this step is optional.

## Project Structure

```
cinematic-ahmeti/
├── .env                     ← API keys (gitignored)
├── .env.example             ← key template
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── dev-server.js            ← local Express API server
├── api/
│   ├── recommend.js         ← Claude Haiku handler
│   └── enrich.js            ← TMDB / Last.fm enrichment handler
├── scripts/
│   ├── fetch-catalog.js     ← catalog fetch orchestrator
│   └── lib/
│       ├── moods.js         ← genre → mood mapping tables
│       ├── tmdb.js          ← movie + series fetcher
│       └── music.js         ← music fetcher (Last.fm + MusicBrainz)
└── src/
    ├── main.jsx
    ├── data.json            ← pre-built catalog (~1,000 titles)
    └── App.jsx              ← full frontend application
```

## Deploying to Vercel

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/cinematic-ahmeti.git
git push -u origin main
```

**2. Deploy:** Sign up at vercel.com, click "Import Project", pick this repo. Vercel auto-detects Vite — click Deploy.

**3. Set environment variables:** In Vercel project settings → Environment Variables, add `ANTHROPIC_API_KEY`, `TMDB_API_KEY`, and `LASTFM_API_KEY`.
