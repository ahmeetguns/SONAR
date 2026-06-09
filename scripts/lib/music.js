import { moodsFromMusicTags, bucketMusicGenre, regionFromCountry } from "./moods.js";

const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/";
const MB_BASE = "https://musicbrainz.org/ws/2";

const MB_DELAY_MS = 1100;
const LASTFM_DELAY_MS = 200;

const MB_UA = "SonarTasteEngine/0.1 (https://github.com/cinematic-ai)";

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function lastfm(method, params, apiKey) {
  const url = new URL(LASTFM_BASE);
  url.searchParams.set("method", method);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url);
  await sleep(LASTFM_DELAY_MS);
  if (!res.ok) throw new Error(`Last.fm ${method} → ${res.status}`);
  return res.json();
}

async function topArtistsByTag(tag, apiKey, limit = 50) {
  const data = await lastfm("tag.gettopartists", { tag, limit }, apiKey);
  return (data.topartists?.artist || []).map(a => ({
    name: a.name,
    listeners: Number(a.listeners) || 0,
  }));
}

async function topArtistsGlobal(apiKey, limit = 100) {
  const data = await lastfm("chart.gettopartists", { limit }, apiKey);
  return (data.artists?.artist || []).map(a => ({
    name: a.name,
    listeners: Number(a.listeners) || 0,
  }));
}

async function topAlbumForArtist(artist, apiKey) {
  const data = await lastfm("artist.gettopalbums", { artist, limit: 1 }, apiKey);
  const top = data.topalbums?.album?.[0];
  if (!top) return null;
  return {
    name: top.name,
    artist: top.artist?.name || artist,
    listeners: Number(top.playcount) || 0,
    image: top.image?.find(i => i.size === "extralarge")?.["#text"] || null,
  };
}

async function albumInfo(artist, album, apiKey) {
  try {
    const data = await lastfm("album.getinfo", { artist, album }, apiKey);
    const a = data.album;
    if (!a) return null;
    const tags = (a.tags?.tag || []).map(t => t.name);
    return {
      tags,
      releaseDate: a.releasedate?.trim() || null,
      url: a.url || null,
      image: a.image?.find(i => i.size === "extralarge")?.["#text"] || null,
      mbid: a.mbid || null,
    };
  } catch {
    return null;
  }
}

async function mbArtistCountry(artistName) {
  try {
    const url = new URL(MB_BASE + "/artist");
    url.searchParams.set("query", `artist:"${artistName}"`);
    url.searchParams.set("fmt", "json");
    url.searchParams.set("limit", "1");
    const res = await fetch(url, { headers: { "User-Agent": MB_UA } });
    await sleep(MB_DELAY_MS);
    if (!res.ok) return null;
    const data = await res.json();
    const top = data.artists?.[0];
    return top?.country || top?.["area"]?.["iso-3166-1-codes"]?.[0] || null;
  } catch {
    return null;
  }
}

const REGION_QUERIES = [
  { region: "North America",       tags: ["american", "usa"],                         target: 80 },
  { region: "Latin America",       tags: ["latin", "brazilian", "argentine", "mexican", "salsa"], target: 50 },
  { region: "UK & Ireland",        tags: ["british", "uk", "irish"],                  target: 70 },
  { region: "Western Europe",      tags: ["french", "german", "dutch", "belgian"],    target: 50 },
  { region: "Nordic",              tags: ["swedish", "norwegian", "finnish", "danish", "icelandic"], target: 40 },
  { region: "Eastern Europe",      tags: ["russian", "polish", "czech", "hungarian"], target: 30 },
  { region: "Mediterranean",       tags: ["italian", "spanish", "portuguese", "greek"], target: 40 },
  { region: "Middle East",         tags: ["arabic", "lebanese", "israeli", "iranian", "persian"], target: 35 },
  { region: "Turkey",              tags: ["turkish"],                                 target: 30 },
  { region: "North Africa",        tags: ["egyptian", "moroccan", "tunisian", "raï", "rai"], target: 25 },
  { region: "Sub-Saharan Africa",  tags: ["afrobeat", "afro", "nigerian", "south african", "ethiopian"], target: 35 },
  { region: "East Asia",           tags: ["japanese", "korean", "j-pop", "k-pop", "city pop"], target: 60 },
  { region: "South Asia",          tags: ["indian", "bollywood", "punjabi"],          target: 30 },
  { region: "Southeast Asia",      tags: ["thai", "indonesian", "filipino"],          target: 20 },
  { region: "Oceania",             tags: ["australian", "new zealand"],               target: 25 },
  { region: "Caribbean",           tags: ["reggae", "jamaican", "dancehall"],         target: 25 },
];

export async function fetchMusic(lastfmKey, target = 800) {
  console.log(`[music] fetching ~${target} albums…`);
  const seen = new Set();
  const seenArtists = new Set();

  const items = [];

  const collected = [];
  for (const { region, tags, target: regionTarget } of REGION_QUERIES) {
    const artistsForRegion = [];
    for (const tag of tags) {
      try {
        const artists = await topArtistsByTag(tag, lastfmKey, Math.ceil(regionTarget / tags.length) + 5);
        for (const a of artists) {
          if (!seenArtists.has(a.name.toLowerCase())) {
            seenArtists.add(a.name.toLowerCase());
            artistsForRegion.push({ ...a, hintRegion: region });
          }
        }
      } catch (e) {
        process.stdout.write(`\n[music] tag "${tag}" failed: ${e.message}\n`);
      }
    }
    collected.push(...artistsForRegion.slice(0, regionTarget));
    process.stdout.write(`\r[music] artists collected: ${collected.length}, region: ${region.padEnd(20)}`);
  }
  if (collected.length < target) {
    const global = await topArtistsGlobal(lastfmKey, 100);
    for (const a of global) {
      if (collected.length >= target * 1.2) break;
      if (!seenArtists.has(a.name.toLowerCase())) {
        seenArtists.add(a.name.toLowerCase());
        collected.push({ ...a, hintRegion: null });
      }
    }
  }
  process.stdout.write(`\n[music] ${collected.length} artists ready for hydration\n`);

  let i = 0;
  for (const { name, hintRegion } of collected) {
    if (items.length >= target) break;
    try {
      const album = await topAlbumForArtist(name, lastfmKey);
      if (!album || !album.name) { i++; continue; }

      const key = `${album.artist}::${album.name}`.toLowerCase();
      if (seen.has(key)) { i++; continue; }
      seen.add(key);

      const info = await albumInfo(album.artist, album.name, lastfmKey);
      const tags = info?.tags || [];

      const country = await mbArtistCountry(album.artist);
      const region = regionFromCountry(country) || hintRegion || null;

      const moods = moodsFromMusicTags(tags);
      const genreBucket = bucketMusicGenre(tags) || "Pop";

      items.push({
        id: items.length + 1,
        title: album.name,
        year: info?.releaseDate ? Number(info.releaseDate.match(/\d{4}/)?.[0]) || null : null,
        genre: genreBucket,
        artist: album.artist,
        rating: null,
        country: country || null,
        region: region,
        moods: moods,
        poster: info?.image || album.image || null,
      });
    } catch (e) { }
    i++;
    if (i % 10 === 0) {
      process.stdout.write(`\r[music] hydrated ${items.length}/${target} (processed ${i}/${collected.length})`);
    }
  }
  process.stdout.write(`\n[music] done: ${items.length} albums\n`);
  return items;
}
