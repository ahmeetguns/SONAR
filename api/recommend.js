import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

const queryCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

function getCached(key) {
  const entry = queryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { queryCache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  if (queryCache.size > 500) {
    const oldest = [...queryCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0][0];
    queryCache.delete(oldest);
  }
  queryCache.set(key, { data, ts: Date.now() });
}

const rateLimitMap = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 6;
const MAX_QUERY_LENGTH = 500;

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

  const { query, tab = "movies" } = req.body ?? {};

  if (!["movies", "series", "music"].includes(tab)) {
    return res.status(400).json({ error: "tab must be movies, series, or music" });
  }

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }

  const safeQuery = query.slice(0, MAX_QUERY_LENGTH).trim();
  if (!safeQuery) {
    return res.status(400).json({ error: "query must not be empty" });
  }

  const cacheKey = `${tab}:${safeQuery.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.status(200).json({ recommendations: cached, fromCache: true });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: `You are a professional ${tab === "music" ? "music" : tab === "series" ? "TV series" : "film"} recommendation engine.

The user wants ${tab === "music" ? "MUSIC ALBUMS" : tab === "series" ? "TV SERIES" : "MOVIES"} recommendations SPECIFICALLY similar to: "${safeQuery}"

Rules:
- Recommend EXACTLY 12 ${tab === "music" ? "music albums or artists" : tab === "series" ? "TV series" : "movies"}
- ${tab === "music" ? "Do NOT recommend movies or TV shows — ONLY music" : tab === "series" ? "Do NOT recommend movies or music — ONLY TV series" : "Do NOT recommend TV shows or music — ONLY movies"}
- Titles must closely match the GENRE, TONE, STYLE, and THEMES of "${safeQuery}"
- Do NOT recommend generic "greatest ever" lists — only titles genuinely similar to this specific work
- Use simple, clean titles (e.g. "OK Computer" not "OK Computer (1997)")
- Return ONLY a raw JSON array, no explanation, no markdown

Format: [{"title": "Title", "reason": "One compelling sentence why it matches", "matchScore": 85}]`
        }
      ]
    });

    const text = message.content[0].text;
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const recommendations = JSON.parse(cleanedText);

    if (!Array.isArray(recommendations)) {
      throw new Error("Claude did not return an array");
    }

    setCache(cacheKey, recommendations);
    return res.status(200).json({ recommendations });
  } catch (error) {
    console.error("Anthropic error:", error?.message || error);
    return res.status(500).json({ error: "Recommendation engine is busy, please try again." });
  }
}
