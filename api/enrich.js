const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "https://cinematic-ahmeti.vercel.app",
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const rateLimitMap = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 6;
const MAX_TITLE_LENGTH = 200;
const ALLOWED_TABS = new Set(["movies", "series", "music"]);

function clientIp(req) {
  const isVercel = !!process.env.VERCEL;
  if (isVercel) {
    return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  }
  return req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= MAX_REQUESTS) {
    rateLimitMap.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  if (rateLimitMap.size > 5_000) {
    for (const [key, ts] of rateLimitMap) {
      if (ts.every((t) => t <= cutoff)) rateLimitMap.delete(key);
    }
  }
  return true;
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = clientIp(req);
  if (!checkRateLimit(ip)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests. Please wait a minute." });
  }

  const { titles, tab = "movies" } = req.body ?? {};

  if (!Array.isArray(titles) || titles.length === 0) {
    return res.status(400).json({ error: "titles array is required" });
  }

  if (!ALLOWED_TABS.has(tab)) {
    return res.status(400).json({ error: "tab must be movies, series, or music" });
  }

  const safeTitles = titles
    .slice(0, 12)
    .map((t) => (typeof t === "string" ? t.slice(0, MAX_TITLE_LENGTH).trim() : ""))
    .filter(Boolean);

  try {
    const enriched = await Promise.all(
      safeTitles.map((title) =>
        tab === "music"
          ? enrichLastFm(title)
          : enrichTmdb(title, tab)
      )
    );

    return res.status(200).json({ enriched });
  } catch (err) {
    console.error("enrich handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const MOVIE_GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  53: "Thriller", 10752: "War", 37: "Western",
};
const TV_GENRE_MAP = {
  10759: "Action & Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 9648: "Mystery",
  10765: "Sci-Fi & Fantasy", 10768: "War & Politics", 37: "Western",
};

function cleanTitle(title) {
  return title
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*(Series|Film|Movie)\s*/gi, "")
    .trim();
}

async function enrichTmdb(title, tab) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return { title };

  const searchTitle = cleanTitle(title);
  const endpoint = tab === "series" ? "tv" : "movie";
  const url =
    `https://api.themoviedb.org/3/search/${endpoint}` +
    `?api_key=${key}&query=${encodeURIComponent(searchTitle)}&language=en-US&page=1`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    const hit = data.results?.[0];
    if (!hit) return { title };

    const genreMap = tab === "series" ? TV_GENRE_MAP : MOVIE_GENRE_MAP;
    const genreList = (hit.genre_ids ?? [])
      .slice(0, 2)
      .map(id => genreMap[id])
      .filter(Boolean)
      .join("/");
    return {
      title,
      tmdb_id: hit.id,
      poster_path: hit.poster_path
        ? `https://image.tmdb.org/t/p/w500${hit.poster_path}`
        : null,
      year: (hit.release_date || hit.first_air_date || "").slice(0, 4),
      overview: (hit.overview ?? "").slice(0, 180),
      genre: genreList,
    };
  } catch {
    return { title };
  }
}

async function enrichLastFm(title) {
  const key = process.env.LASTFM_API_KEY;
  if (!key) return { title };

  const url =
    `https://ws.audioscrobbler.com/2.0/?method=album.search` +
    `&album=${encodeURIComponent(title)}&api_key=${key}&format=json&limit=1`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    const album = data.results?.albummatches?.album?.[0];
    if (!album) return { title };

    const image =
      album.image?.find((i) => i.size === "extralarge")?.["#text"] ||
      album.image?.find((i) => i.size === "large")?.["#text"] ||
      null;

    return {
      title,
      poster_path: image && image.length > 0 ? image : null,
      artist: album.artist ?? "",
      year: "",
    };
  } catch {
    return { title };
  }
}
