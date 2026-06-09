const SCREEN_GENRE_MOODS = {
  "Horror":         ["Scared", "Anxious"],
  "Thriller":       ["Anxious"],
  "Mystery":        ["Anxious"],
  "Crime":          ["Anxious"],
  "War":            ["Sad", "Anxious"],
  "Drama":          ["Sad"],
  "History":        ["Sad"],
  "Biography":      ["Sad"],
  "Comedy":         ["Laugh", "Happy"],
  "Family":         ["Happy"],
  "Animation":      ["Happy"],
  "Music":          ["Happy"],
  "Romance":        ["Happy", "Sad"],
  "Action":         ["Anxious"],
  "Adventure":      ["Anxious"],
  "Sci-Fi":         ["Anxious", "Relaxed"],
  "Science Fiction":["Anxious", "Relaxed"],
  "Fantasy":        ["Relaxed"],
  "Western":        ["Relaxed"],
  "Documentary":    [],
  "News":           [],
  "Reality":        [],
  "Talk":           [],
  "Soap":           [],
  "Kids":           [],
};

const MUSIC_GENRE_KEYWORDS = {
  "Sad":      ["sad", "melancholic", "melancholy", "blue", "mournful", "elegiac",
               "heartbreak", "slowcore", "sadcore", "emo", "lonely", "wistful"],
  "Happy":    ["happy", "uplifting", "feel good", "feel-good", "joyful", "sunny",
               "summer", "dance", "disco", "funk", "pop", "afrobeat", "samba",
               "bossa nova", "soca", "reggae"],
  "Laugh":    ["comedy", "novelty", "parody", "satirical"],
  "Anxious":  ["dark", "tense", "intense", "industrial", "post-punk", "noise",
               "experimental", "avant-garde", "drone", "doom", "black metal",
               "death metal", "grindcore", "harsh", "dissonant"],
  "Scared":   ["horror", "haunting", "creepy", "eerie", "occult", "witch house",
               "dark ambient"],
  "Relaxed":  ["ambient", "chill", "chillout", "downtempo", "mellow", "soft",
               "acoustic", "smooth", "easy listening", "lo-fi", "lofi", "shoegaze",
               "dream pop", "post-rock", "jazz", "meditation", "new age"],
};

const MUSIC_GENRE_BUCKETS = [
  ["Hip-Hop",       ["hip hop", "hip-hop", "rap", "trap"]],
  ["R&B",           ["rnb", "r&b", "r and b", "contemporary r&b"]],
  ["Soul",          ["soul", "neo-soul", "neo soul", "motown"]],
  ["Jazz",          ["jazz", "bebop", "fusion"]],
  ["Electronic",    ["electronic", "electronica", "idm", "techno", "house",
                     "dnb", "drum and bass", "dubstep", "garage", "edm"]],
  ["House",         ["house", "deep house", "tech house"]],
  ["Ambient",       ["ambient", "drone", "dark ambient"]],
  ["Rock",          ["rock", "classic rock", "hard rock"]],
  ["Alternative",   ["alternative", "indie rock", "post-rock"]],
  ["Indie",         ["indie", "indie pop", "indie folk"]],
  ["Pop",           ["pop", "synthpop", "synth-pop", "art pop"]],
  ["Folk",          ["folk", "americana", "country", "bluegrass"]],
  ["Experimental",  ["experimental", "avant-garde", "noise", "musique concrete"]],
  ["Shoegaze",      ["shoegaze", "dream pop"]],
  ["Funk",          ["funk", "afrobeat"]],
  ["Psychedelic",   ["psychedelic", "psych rock", "psych pop"]],
  ["Art Rock",      ["art rock", "progressive rock", "prog"]],
  ["Afrobeat",      ["afrobeat", "afrobeats"]],
  ["Bossa Nova",    ["bossa nova", "tropicalia", "mpb"]],
];

const COUNTRY_TO_REGION = {
  "US": "North America", "CA": "North America", "MX": "North America",
  "BR": "Latin America", "AR": "Latin America", "CL": "Latin America",
  "CO": "Latin America", "PE": "Latin America", "UY": "Latin America",
  "VE": "Latin America", "BO": "Latin America", "EC": "Latin America",
  "GB": "UK & Ireland", "UK": "UK & Ireland", "IE": "UK & Ireland",
  "FR": "Western Europe", "DE": "Western Europe", "NL": "Western Europe",
  "BE": "Western Europe", "AT": "Western Europe", "CH": "Western Europe",
  "LU": "Western Europe",
  "SE": "Nordic", "NO": "Nordic", "DK": "Nordic", "FI": "Nordic", "IS": "Nordic",
  "PL": "Eastern Europe", "CZ": "Eastern Europe", "HU": "Eastern Europe",
  "RO": "Eastern Europe", "RU": "Eastern Europe", "UA": "Eastern Europe",
  "BG": "Eastern Europe", "RS": "Eastern Europe", "HR": "Eastern Europe",
  "IT": "Mediterranean", "ES": "Mediterranean", "PT": "Mediterranean",
  "GR": "Mediterranean", "MT": "Mediterranean", "CY": "Mediterranean",
  "IL": "Middle East", "LB": "Middle East", "JO": "Middle East",
  "SA": "Middle East", "AE": "Middle East", "IR": "Middle East",
  "IQ": "Middle East", "SY": "Middle East", "PS": "Middle East",
  "TR": "Turkey",
  "EG": "North Africa", "MA": "North Africa", "TN": "North Africa",
  "DZ": "North Africa", "LY": "North Africa", "SD": "North Africa",
  "NG": "Sub-Saharan Africa", "ZA": "Sub-Saharan Africa", "KE": "Sub-Saharan Africa",
  "GH": "Sub-Saharan Africa", "SN": "Sub-Saharan Africa", "ET": "Sub-Saharan Africa",
  "ML": "Sub-Saharan Africa", "CD": "Sub-Saharan Africa", "TZ": "Sub-Saharan Africa",
  "JP": "East Asia", "KR": "East Asia", "CN": "East Asia",
  "TW": "East Asia", "HK": "East Asia", "MN": "East Asia",
  "IN": "South Asia", "PK": "South Asia", "BD": "South Asia",
  "LK": "South Asia", "NP": "South Asia",
  "ID": "Southeast Asia", "PH": "Southeast Asia", "TH": "Southeast Asia",
  "VN": "Southeast Asia", "MY": "Southeast Asia", "SG": "Southeast Asia",
  "AU": "Oceania", "NZ": "Oceania",
  "JM": "Caribbean", "CU": "Caribbean", "DO": "Caribbean",
  "PR": "Caribbean", "TT": "Caribbean", "HT": "Caribbean",
};

const COUNTRY_NAMES = {
  "US": "USA", "GB": "UK", "UK": "UK", "FR": "France", "DE": "Germany",
  "IT": "Italy", "JP": "Japan", "KR": "South Korea", "DK": "Denmark",
  "TR": "Turkey", "IN": "India", "ES": "Spain", "IS": "Iceland",
  "AU": "Australia", "NZ": "New Zealand", "CA": "Canada", "BR": "Brazil",
  "MX": "Mexico", "AR": "Argentina", "CN": "China", "TW": "Taiwan",
  "HK": "Hong Kong", "RU": "Russia", "PL": "Poland", "CZ": "Czech Republic",
  "SE": "Sweden", "NO": "Norway", "FI": "Finland", "NL": "Netherlands",
  "BE": "Belgium", "IE": "Ireland", "GR": "Greece", "PT": "Portugal",
  "IL": "Israel", "EG": "Egypt", "ZA": "South Africa", "NG": "Nigeria",
  "TH": "Thailand", "ID": "Indonesia", "PH": "Philippines",
  "VN": "Vietnam", "MY": "Malaysia", "SG": "Singapore",
  "LB": "Lebanon", "IR": "Iran", "MA": "Morocco",
};

export function moodsFromScreenGenres(genres) {
  const moods = new Set();
  for (const g of genres) {
    const key = Object.keys(SCREEN_GENRE_MOODS).find(k =>
      g.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(g.toLowerCase())
    );
    if (key) {
      for (const m of SCREEN_GENRE_MOODS[key]) moods.add(m);
    }
  }
  return [...moods];
}

export function moodsFromMusicTags(tags) {
  const moods = new Set();
  const lowered = tags.map(t => t.toLowerCase());
  for (const [mood, keywords] of Object.entries(MUSIC_GENRE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lowered.some(t => t.includes(kw))) {
        moods.add(mood);
        break;
      }
    }
  }
  return [...moods];
}

export function bucketMusicGenre(tags) {
  const lowered = tags.map(t => t.toLowerCase());
  for (const [bucket, keywords] of MUSIC_GENRE_BUCKETS) {
    for (const kw of keywords) {
      if (lowered.some(t => t.includes(kw))) return bucket;
    }
  }
  return null;
}

export function countryName(iso) {
  if (!iso) return null;
  return COUNTRY_NAMES[iso.toUpperCase()] || iso.toUpperCase();
}

export function regionFromCountry(iso) {
  if (!iso) return null;
  return COUNTRY_TO_REGION[iso.toUpperCase()] || null;
}
