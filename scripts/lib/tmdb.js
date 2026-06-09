import { moodsFromScreenGenres, countryName } from "./moods.js";

const BASE = "https://api.themoviedb.org/3";
const POLITE_DELAY_MS = 50;

const MOVIE_MIN_VOTES = 1000;
const MOVIE_MIN_RATING = 6.5;
const SERIES_MIN_VOTES = 200;
const SERIES_MIN_RATING = 6.5;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tmdbGet(path, params, apiKey) {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params || {})) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${path} → ${res.status} ${res.statusText}`);
  await sleep(POLITE_DELAY_MS);
  return res.json();
}

let _movieGenres = null;
let _tvGenres = null;

async function getGenreLookup(kind, apiKey) {
  if (kind === "movie" && _movieGenres) return _movieGenres;
  if (kind === "tv" && _tvGenres) return _tvGenres;
  const data = await tmdbGet(`/genre/${kind}/list`, {}, apiKey);
  const lookup = {};
  for (const g of data.genres) lookup[g.id] = g.name;
  if (kind === "movie") _movieGenres = lookup;
  else _tvGenres = lookup;
  return lookup;
}

async function discoverMovies(apiKey, opts = {}) {
  const all = [];
  const pages = opts.pages || 5;
  const sortBy = opts.sortBy || "vote_average.desc";
  const extra = opts.extra || {};

  for (let page = 1; page <= pages; page++) {
    const data = await tmdbGet("/discover/movie", {
      sort_by: sortBy,
      "vote_count.gte": MOVIE_MIN_VOTES,
      "vote_average.gte": MOVIE_MIN_RATING,
      include_adult: false,
      page,
      ...extra,
    }, apiKey);
    all.push(...(data.results || []));
    if (page >= (data.total_pages || 1)) break;
  }
  return all;
}

async function getMovieDetails(id, apiKey) {
  return tmdbGet(`/movie/${id}`, {}, apiKey);
}

function normalizeMovie(detail) {
  const genres = (detail.genres || []).map(g => g.name);
  const country = (detail.production_countries || [])[0]?.iso_3166_1 || null;
  return {
    id: detail.id,
    title: detail.title,
    year: detail.release_date ? Number(detail.release_date.slice(0, 4)) : null,
    genre: genres.slice(0, 2).join("/") || "Drama",
    director: null,
    rating: detail.vote_average ? Number(detail.vote_average.toFixed(1)) : null,
    country: countryName(country),
    moods: moodsFromScreenGenres(genres),
    poster: detail.poster_path
      ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
      : null,
  };
}

export async function fetchMovies(apiKey, target = 1000) {
  console.log(`[tmdb] fetching ~${target} movies…`);
  const seen = new Set();
  const candidates = [];

  const queries = [
    { sortBy: "vote_average.desc", pages: 15 },
    { sortBy: "popularity.desc",   pages: 15 },
    { sortBy: "vote_count.desc",   pages: 15 },
    { sortBy: "vote_average.desc", pages: 8, extra: { "primary_release_date.gte": "1920-01-01", "primary_release_date.lte": "1969-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "primary_release_date.gte": "1970-01-01", "primary_release_date.lte": "1979-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "primary_release_date.gte": "1980-01-01", "primary_release_date.lte": "1989-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "primary_release_date.gte": "1990-01-01", "primary_release_date.lte": "1999-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "primary_release_date.gte": "2000-01-01", "primary_release_date.lte": "2009-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "primary_release_date.gte": "2010-01-01", "primary_release_date.lte": "2019-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "primary_release_date.gte": "2020-01-01" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "FR" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "KR" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "JP" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "IT" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "DE" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "GB" } },
    { sortBy: "vote_average.desc", pages: 4, extra: { with_origin_country: "TR" } },
    { sortBy: "vote_average.desc", pages: 4, extra: { with_origin_country: "IN" } },
    { sortBy: "vote_average.desc", pages: 4, extra: { with_origin_country: "ES" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "DK" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "SE" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "RU" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "MX" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "BR" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "IR" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "CN" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "HK" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "TW" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "PL" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "AR" } },
  ];

  for (const q of queries) {
    if (candidates.length >= target * 1.4) break;
    const results = await discoverMovies(apiKey, q);
    for (const m of results) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        candidates.push(m.id);
      }
    }
    process.stdout.write(`\r[tmdb] movies: ${candidates.length} candidates collected`);
  }
  process.stdout.write("\n");

  const toHydrate = candidates.slice(0, Math.min(candidates.length, target));
  const hydrated = [];
  let i = 0;
  for (const id of toHydrate) {
    try {
      const detail = await getMovieDetails(id, apiKey);
      const norm = normalizeMovie(detail);
      if (norm.year && norm.title) hydrated.push(norm);
    } catch (e) { }
    i++;
    if (i % 25 === 0) {
      process.stdout.write(`\r[tmdb] movies: hydrated ${i}/${toHydrate.length}`);
    }
  }
  process.stdout.write(`\r[tmdb] movies: hydrated ${hydrated.length}/${toHydrate.length}\n`);
  return hydrated;
}

async function discoverSeries(apiKey, opts = {}) {
  const all = [];
  const pages = opts.pages || 5;
  const sortBy = opts.sortBy || "vote_average.desc";
  const extra = opts.extra || {};

  for (let page = 1; page <= pages; page++) {
    const data = await tmdbGet("/discover/tv", {
      sort_by: sortBy,
      "vote_count.gte": SERIES_MIN_VOTES,
      "vote_average.gte": SERIES_MIN_RATING,
      include_adult: false,
      page,
      ...extra,
    }, apiKey);
    all.push(...(data.results || []));
    if (page >= (data.total_pages || 1)) break;
  }
  return all;
}

async function getSeriesDetails(id, apiKey) {
  return tmdbGet(`/tv/${id}`, {}, apiKey);
}

function normalizeSeries(detail) {
  const genres = (detail.genres || []).map(g => g.name);
  const country = (detail.origin_country || [])[0] || null;
  const creator = (detail.created_by || [])[0]?.name || null;
  return {
    id: detail.id,
    title: detail.name,
    year: detail.first_air_date ? Number(detail.first_air_date.slice(0, 4)) : null,
    genre: genres.slice(0, 2).join("/") || "Drama",
    creator,
    rating: detail.vote_average ? Number(detail.vote_average.toFixed(1)) : null,
    country: countryName(country),
    moods: moodsFromScreenGenres(genres),
    poster: detail.poster_path
      ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
      : null,
  };
}

export async function fetchSeries(apiKey, target = 700) {
  console.log(`[tmdb] fetching ~${target} series…`);
  const seen = new Set();
  const candidates = [];

  const queries = [
    { sortBy: "vote_average.desc", pages: 15 },
    { sortBy: "popularity.desc",   pages: 15 },
    { sortBy: "vote_count.desc",   pages: 15 },
    { sortBy: "vote_average.desc", pages: 8, extra: { "first_air_date.gte": "1980-01-01", "first_air_date.lte": "1999-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "first_air_date.gte": "2000-01-01", "first_air_date.lte": "2009-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "first_air_date.gte": "2010-01-01", "first_air_date.lte": "2019-12-31" } },
    { sortBy: "vote_average.desc", pages: 8, extra: { "first_air_date.gte": "2020-01-01" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "GB" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "KR" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "JP" } },
    { sortBy: "vote_average.desc", pages: 5, extra: { with_origin_country: "DE" } },
    { sortBy: "vote_average.desc", pages: 4, extra: { with_origin_country: "TR" } },
    { sortBy: "vote_average.desc", pages: 4, extra: { with_origin_country: "IN" } },
    { sortBy: "vote_average.desc", pages: 4, extra: { with_origin_country: "FR" } },
    { sortBy: "vote_average.desc", pages: 4, extra: { with_origin_country: "ES" } },
    { sortBy: "vote_average.desc", pages: 4, extra: { with_origin_country: "IT" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "DK" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "SE" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "BR" } },
    { sortBy: "vote_average.desc", pages: 3, extra: { with_origin_country: "MX" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "RU" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "TW" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "TH" } },
    { sortBy: "vote_average.desc", pages: 2, extra: { with_origin_country: "AU" } },
  ];

  for (const q of queries) {
    if (candidates.length >= target * 1.4) break;
    const results = await discoverSeries(apiKey, q);
    for (const s of results) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        candidates.push(s.id);
      }
    }
    process.stdout.write(`\r[tmdb] series: ${candidates.length} candidates collected`);
  }
  process.stdout.write("\n");

  const toHydrate = candidates.slice(0, Math.min(candidates.length, target));
  const hydrated = [];
  let i = 0;
  for (const id of toHydrate) {
    try {
      const detail = await getSeriesDetails(id, apiKey);
      const norm = normalizeSeries(detail);
      if (norm.year && norm.title) hydrated.push(norm);
    } catch (e) { }
    i++;
    if (i % 25 === 0) {
      process.stdout.write(`\r[tmdb] series: hydrated ${i}/${toHydrate.length}`);
    }
  }
  process.stdout.write(`\r[tmdb] series: hydrated ${hydrated.length}/${toHydrate.length}\n`);
  return hydrated;
}

export async function warmGenres(apiKey) {
  await getGenreLookup("movie", apiKey);
  await getGenreLookup("tv", apiKey);
}
