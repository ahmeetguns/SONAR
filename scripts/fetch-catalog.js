import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchMovies, fetchSeries, warmGenres } from "./lib/tmdb.js";
import { fetchMusic } from "./lib/music.js";

function loadExistingData(root) {
  const p = join(root, "src", "data.json");
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnv() {
  const path = join(ROOT, ".env");
  if (!existsSync(path)) {
    console.error("✗ Missing .env file at", path);
    console.error("  Copy .env.example to .env and fill in your keys.");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, "utf8").replace(/^﻿/, "").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const TARGETS = {
  movies: 1500,
  series: 1500,
  music:  1500,
};

async function main() {
  const env = loadEnv();
  const tmdbKey   = env.TMDB_API_KEY;
  const lastfmKey = env.LASTFM_API_KEY;

  if (!tmdbKey) { console.error("✗ TMDB_API_KEY missing in .env"); process.exit(1); }

  const t0 = Date.now();
  console.log("Sonar catalog fetch starting…");
  console.log(`Targets: ${TARGETS.movies} movies, ${TARGETS.series} series, ${TARGETS.music} music`);
  if (!lastfmKey) console.log("ℹ  No LASTFM_API_KEY — existing music from data.json will be preserved.");
  console.log("");

  await warmGenres(tmdbKey);

  const { movies, series } = await (async () => {
    const movies = await fetchMovies(tmdbKey, TARGETS.movies);
    const series = await fetchSeries(tmdbKey, TARGETS.series);
    return { movies, series };
  })();

  let music;
  if (lastfmKey) {
    music = await fetchMusic(lastfmKey, TARGETS.music);
  } else {
    const existing = loadExistingData(ROOT);
    music = existing?.music || [];
    console.log(`ℹ  Kept ${music.length} existing music items (no Last.fm key).`);
  }

  const reIndex = arr => arr.map((it, i) => ({ ...it, id: i + 1 }));

  const data = {
    movies: reIndex(movies),
    series: reIndex(series),
    music:  reIndex(music),
    meta: {
      fetchedAt: new Date().toISOString(),
      counts: {
        movies: movies.length,
        series: series.length,
        music:  music.length,
      },
    },
  };

  const outPath = join(ROOT, "src", "data.json");
  writeFileSync(outPath, JSON.stringify(data, null, 2));

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("");
  console.log(`✓ Wrote ${outPath}`);
  console.log(`  movies: ${movies.length}`);
  console.log(`  series: ${series.length}`);
  console.log(`  music:  ${music.length}`);
  console.log(`  total:  ${movies.length + series.length + music.length}`);
  console.log(`  time:   ${dt}s`);
}

main().catch(err => {
  console.error("");
  console.error("✗ Fetch failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
