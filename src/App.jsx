import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import catalog from "./data.json";

const SEED_DATA = {
  movies: [
    { id: 1,  title: "Blade Runner 2049", year: 2017, genre: "Sci-Fi", director: "Denis Villeneuve", rating: 8.0, country: "USA", moods: ["Anxious", "Relaxed"] },
    { id: 2,  title: "Inception", year: 2010, genre: "Sci-Fi/Thriller", director: "Christopher Nolan", rating: 8.8, country: "USA", moods: ["Anxious"] },
    { id: 3,  title: "Dune: Part Two", year: 2024, genre: "Sci-Fi/Epic", director: "Denis Villeneuve", rating: 8.5, country: "USA", moods: ["Anxious", "Relaxed"] },
    { id: 4,  title: "The Godfather", year: 1972, genre: "Crime/Drama", director: "Francis Ford Coppola", rating: 9.2, country: "USA", moods: ["Anxious", "Sad"] },
    { id: 5,  title: "Interstellar", year: 2014, genre: "Sci-Fi/Drama", director: "Christopher Nolan", rating: 8.7, country: "USA", moods: ["Sad", "Anxious"] },
    { id: 6,  title: "Parasite", year: 2019, genre: "Thriller/Drama", director: "Bong Joon-ho", rating: 8.5, country: "South Korea", moods: ["Anxious", "Sad"] },
    { id: 7,  title: "The Dark Knight", year: 2008, genre: "Action/Crime", director: "Christopher Nolan", rating: 9.0, country: "USA", moods: ["Anxious"] },
    { id: 8,  title: "2001: A Space Odyssey", year: 1968, genre: "Sci-Fi", director: "Stanley Kubrick", rating: 8.3, country: "UK", moods: ["Relaxed", "Anxious"] },
    { id: 9,  title: "Oppenheimer", year: 2023, genre: "Biography/Drama", director: "Christopher Nolan", rating: 8.4, country: "USA", moods: ["Anxious", "Sad"] },
    { id: 10, title: "Everything Everywhere All at Once", year: 2022, genre: "Sci-Fi/Comedy", director: "Daniels", rating: 7.8, country: "USA", moods: ["Laugh", "Sad", "Happy"] },
    { id: 11, title: "The Shawshank Redemption", year: 1994, genre: "Drama", director: "Frank Darabont", rating: 9.3, country: "USA", moods: ["Sad", "Happy"] },
    { id: 12, title: "Arrival", year: 2016, genre: "Sci-Fi/Drama", director: "Denis Villeneuve", rating: 7.9, country: "USA", moods: ["Sad", "Relaxed"] },
    { id: 13, title: "Mad Max: Fury Road", year: 2015, genre: "Action/Sci-Fi", director: "George Miller", rating: 8.1, country: "Australia", moods: ["Anxious", "Scared"] },
    { id: 14, title: "Her", year: 2013, genre: "Sci-Fi/Romance", director: "Spike Jonze", rating: 8.0, country: "USA", moods: ["Sad", "Happy"] },
    { id: 15, title: "Mulholland Drive", year: 2001, genre: "Mystery/Thriller", director: "David Lynch", rating: 7.9, country: "USA", moods: ["Anxious", "Scared"] },
    { id: 16, title: "No Country for Old Men", year: 2007, genre: "Crime/Thriller", director: "Coen Brothers", rating: 8.2, country: "USA", moods: ["Anxious", "Scared"] },
    { id: 17, title: "The Revenant", year: 2015, genre: "Adventure/Drama", director: "Alejandro G. Iñárritu", rating: 8.0, country: "USA", moods: ["Anxious"] },
    { id: 18, title: "Portrait of a Lady on Fire", year: 2019, genre: "Romance/Drama", director: "Céline Sciamma", rating: 8.1, country: "France", moods: ["Sad", "Relaxed"] },
    { id: 19, title: "Annihilation", year: 2018, genre: "Sci-Fi/Horror", director: "Alex Garland", rating: 6.9, country: "UK", moods: ["Scared", "Anxious"] },
    { id: 20, title: "The Lighthouse", year: 2019, genre: "Mystery/Horror", director: "Robert Eggers", rating: 7.4, country: "USA", moods: ["Scared", "Anxious"] },
  ],
  series: [
    { id: 1,  title: "Severance", year: 2022, genre: "Sci-Fi/Mystery", creator: "Dan Erickson", rating: 8.7, country: "USA", moods: ["Anxious"] },
    { id: 2,  title: "Breaking Bad", year: 2008, genre: "Crime/Drama", creator: "Vince Gilligan", rating: 9.5, country: "USA", moods: ["Anxious"] },
    { id: 3,  title: "Dark", year: 2017, genre: "Sci-Fi/Mystery", creator: "Baran bo Odar", rating: 8.7, country: "Germany", moods: ["Anxious", "Scared"] },
    { id: 4,  title: "Chernobyl", year: 2019, genre: "Drama/Historical", creator: "Craig Mazin", rating: 9.4, country: "UK", moods: ["Sad", "Anxious"] },
    { id: 5,  title: "Succession", year: 2018, genre: "Drama", creator: "Jesse Armstrong", rating: 8.9, country: "USA", moods: ["Laugh", "Anxious"] },
    { id: 6,  title: "The Wire", year: 2002, genre: "Crime/Drama", creator: "David Simon", rating: 9.3, country: "USA", moods: ["Sad", "Anxious"] },
    { id: 7,  title: "True Detective", year: 2014, genre: "Crime/Thriller", creator: "Nic Pizzolatto", rating: 8.9, country: "USA", moods: ["Anxious", "Scared"] },
    { id: 8,  title: "Mindhunter", year: 2017, genre: "Crime/Drama", creator: "Joe Penhall", rating: 8.6, country: "USA", moods: ["Anxious", "Scared"] },
    { id: 9,  title: "Shogun", year: 2024, genre: "Historical/Drama", creator: "Rachel Kondo", rating: 8.7, country: "Japan", moods: ["Anxious"] },
    { id: 10, title: "Fargo", year: 2014, genre: "Crime/Dark Comedy", creator: "Noah Hawley", rating: 8.9, country: "USA", moods: ["Laugh", "Anxious"] },
    { id: 11, title: "Westworld", year: 2016, genre: "Sci-Fi/Western", creator: "Jonathan Nolan", rating: 8.5, country: "USA", moods: ["Anxious"] },
    { id: 12, title: "The Bear", year: 2022, genre: "Drama/Comedy", creator: "Christopher Storer", rating: 8.6, country: "USA", moods: ["Anxious", "Laugh"] },
    { id: 13, title: "Arcane", year: 2021, genre: "Animation/Fantasy", creator: "Christian Linke", rating: 9.0, country: "France", moods: ["Anxious", "Sad"] },
    { id: 14, title: "Fleabag", year: 2016, genre: "Comedy/Drama", creator: "Phoebe Waller-Bridge", rating: 8.7, country: "UK", moods: ["Laugh", "Sad"] },
    { id: 15, title: "Peaky Blinders", year: 2013, genre: "Crime/Drama", creator: "Steven Knight", rating: 8.8, country: "UK", moods: ["Anxious"] },
    { id: 16, title: "The Leftovers", year: 2014, genre: "Drama/Mystery", creator: "Damon Lindelof", rating: 8.3, country: "USA", moods: ["Sad", "Anxious"] },
    { id: 17, title: "Better Call Saul", year: 2015, genre: "Crime/Drama", creator: "Vince Gilligan", rating: 8.8, country: "USA", moods: ["Anxious", "Sad"] },
    { id: 18, title: "Andor", year: 2022, genre: "Sci-Fi/Thriller", creator: "Tony Gilroy", rating: 8.4, country: "USA", moods: ["Anxious"] },
    { id: 19, title: "The Expanse", year: 2015, genre: "Sci-Fi", creator: "Mark Fergus", rating: 8.5, country: "USA", moods: ["Anxious", "Relaxed"] },
    { id: 20, title: "Band of Brothers", year: 2001, genre: "War/Drama", creator: "Steven Spielberg", rating: 9.4, country: "USA", moods: ["Sad", "Anxious"] },
  ],
  music: [
    { id: 1,  title: "Random Access Memories", year: 2013, genre: "Electronic/Funk", artist: "Daft Punk", rating: 9.0, country: "France", region: "Western Europe", moods: ["Happy", "Relaxed"] },
    { id: 2,  title: "To Pimp a Butterfly", year: 2015, genre: "Hip-Hop/Jazz", artist: "Kendrick Lamar", rating: 9.6, country: "USA", region: "North America", moods: ["Anxious", "Sad"] },
    { id: 3,  title: "OK Computer", year: 1997, genre: "Alternative/Rock", artist: "Radiohead", rating: 9.5, country: "UK", region: "UK & Ireland", moods: ["Sad", "Anxious"] },
    { id: 4,  title: "Blonde", year: 2016, genre: "R&B/Alternative", artist: "Frank Ocean", rating: 9.0, country: "USA", region: "North America", moods: ["Sad", "Relaxed"] },
    { id: 5,  title: "In Rainbows", year: 2007, genre: "Alternative/Rock", artist: "Radiohead", rating: 9.4, country: "UK", region: "UK & Ireland", moods: ["Sad", "Relaxed"] },
    { id: 6,  title: "good kid, m.A.A.d city", year: 2012, genre: "Hip-Hop", artist: "Kendrick Lamar", rating: 9.3, country: "USA", region: "North America", moods: ["Anxious", "Sad"] },
    { id: 7,  title: "Discovery", year: 2001, genre: "Electronic/House", artist: "Daft Punk", rating: 9.1, country: "France", region: "Western Europe", moods: ["Happy", "Relaxed"] },
    { id: 8,  title: "Loveless", year: 1991, genre: "Shoegaze", artist: "My Bloody Valentine", rating: 9.2, country: "UK", region: "UK & Ireland", moods: ["Relaxed", "Sad"] },
    { id: 9,  title: "Igor", year: 2019, genre: "R&B/Alternative", artist: "Tyler, the Creator", rating: 8.7, country: "USA", region: "North America", moods: ["Sad", "Happy"] },
    { id: 10, title: "Fetch the Bolt Cutters", year: 2020, genre: "Art Rock", artist: "Fiona Apple", rating: 8.9, country: "USA", region: "North America", moods: ["Anxious", "Sad"] },
    { id: 11, title: "Melodrama", year: 2017, genre: "Indie Pop", artist: "Lorde", rating: 8.5, country: "New Zealand", region: "Oceania", moods: ["Sad", "Happy"] },
    { id: 12, title: "Tago Mago", year: 1971, genre: "Krautrock/Experimental", artist: "Can", rating: 9.0, country: "Germany", region: "Western Europe", moods: ["Anxious", "Relaxed"] },
    { id: 13, title: "The Miseducation of Lauryn Hill", year: 1998, genre: "R&B/Soul", artist: "Lauryn Hill", rating: 9.2, country: "USA", region: "North America", moods: ["Happy", "Sad"] },
    { id: 14, title: "Selected Ambient Works 85–92", year: 1992, genre: "Electronic/Ambient", artist: "Aphex Twin", rating: 9.1, country: "UK", region: "UK & Ireland", moods: ["Relaxed"] },
    { id: 15, title: "Purple Rain", year: 1984, genre: "Pop/Rock/R&B", artist: "Prince", rating: 9.3, country: "USA", region: "North America", moods: ["Happy", "Sad"] },
    { id: 16, title: "Untitled Unmastered", year: 2016, genre: "Hip-Hop", artist: "Kendrick Lamar", rating: 8.6, country: "USA", region: "North America", moods: ["Anxious", "Sad"] },
    { id: 17, title: "Vespertine", year: 2001, genre: "Avant-Pop/Electronic", artist: "Björk", rating: 8.8, country: "Iceland", region: "Nordic", moods: ["Relaxed", "Sad"] },
    { id: 18, title: "Madvillainy", year: 2004, genre: "Hip-Hop/Experimental", artist: "Madvillain", rating: 9.1, country: "USA", region: "North America", moods: ["Relaxed", "Anxious"] },
    { id: 19, title: "Currents", year: 2015, genre: "Psychedelic/Electronic", artist: "Tame Impala", rating: 8.7, country: "Australia", region: "Oceania", moods: ["Sad", "Relaxed"] },
    { id: 20, title: "Either/Or", year: 1997, genre: "Folk/Indie", artist: "Elliott Smith", rating: 8.9, country: "USA", region: "North America", moods: ["Sad"] },
    { id: 21, title: "Transa", year: 1972, genre: "Bossa Nova/MPB", artist: "Caetano Veloso", rating: 9.0, country: "Brazil", region: "Latin America", moods: ["Relaxed", "Happy"] },
    { id: 22, title: "Selda", year: 1976, genre: "Folk/Psychedelic", artist: "Selda Bağcan", rating: 8.8, country: "Turkey", region: "Turkey", moods: ["Sad", "Anxious"] },
    { id: 23, title: "Zombie", year: 1976, genre: "Afrobeat/Funk", artist: "Fela Kuti", rating: 9.1, country: "Nigeria", region: "Sub-Saharan Africa", moods: ["Happy", "Anxious"] },
    { id: 24, title: "Async", year: 2017, genre: "Ambient/Experimental", artist: "Ryuichi Sakamoto", rating: 8.7, country: "Japan", region: "East Asia", moods: ["Sad", "Relaxed"] },
    { id: 25, title: "Wahdon", year: 1979, genre: "Folk/Pop", artist: "Fairuz", rating: 8.9, country: "Lebanon", region: "Middle East", moods: ["Sad", "Relaxed"] },
  ],
};

const DATA = (catalog?.movies?.length || catalog?.series?.length || catalog?.music?.length)
  ? { movies: catalog.movies || [], series: catalog.series || [], music: catalog.music || [] }
  : SEED_DATA;

const SHARED_MOODS = ["Happy", "Sad", "Laugh", "Anxious", "Scared", "Relaxed"];

const SCREEN_GENRES = ["Sci-Fi", "Thriller", "Drama", "Crime", "Horror", "Romance", "Comedy", "Mystery", "Action", "Adventure", "Animation", "Historical", "Biography", "Fantasy"];
const SCREEN_COUNTRIES = ["USA", "UK", "France", "Germany", "Italy", "Japan", "South Korea", "Denmark", "Turkey", "India", "Spain", "Iceland", "Australia", "New Zealand"];

const MUSIC_GENRES = ["Hip-Hop", "R&B", "Soul", "Jazz", "Electronic", "House", "Ambient", "Rock", "Alternative", "Indie", "Pop", "Folk", "Experimental", "Shoegaze", "Funk", "Psychedelic", "Art Rock", "Afrobeat", "Bossa Nova"];
const MUSIC_REGIONS = ["North America", "Latin America", "UK & Ireland", "Western Europe", "Nordic", "Eastern Europe", "Mediterranean", "Middle East", "Turkey", "North Africa", "Sub-Saharan Africa", "East Asia", "South Asia", "Southeast Asia", "Oceania", "Caribbean"];

const MOOD_OPTIONS = {
  movies: {
    genres: SCREEN_GENRES,
    origins: SCREEN_COUNTRIES,
    moods: SHARED_MOODS,
    genreLabel: "Genres",
    originLabel: "Country of origin",
  },
  series: {
    genres: SCREEN_GENRES,
    origins: SCREEN_COUNTRIES,
    moods: SHARED_MOODS,
    genreLabel: "Genres",
    originLabel: "Country of origin",
  },
  music: {
    genres: MUSIC_GENRES,
    origins: MUSIC_REGIONS,
    moods: SHARED_MOODS,
    genreLabel: "Music genres",
    originLabel: "Country / Region",
  },
};

const POETIC_REASONS = [
  "visually stunning cinematography and atmosphere",
  "similar narrative complexity and pacing",
  "auteur-driven storytelling with a unique voice",
  "thematic depth exploring identity and reality",
  "masterful use of tension and emotional release",
  "acclaimed for its raw emotional authenticity",
  "genre-defining influence on modern cinema",
  "hypnotic visual language and sound design",
  "explores moral ambiguity with rare precision",
  "critically revered for its layered writing",
  "unforgettable performances and bold direction",
  "shares a rare cinematic intelligence and vision",
];

const MOOD_NOUN = {
  Happy: "lift", Sad: "ache", Laugh: "delight",
  Anxious: "unease", Scared: "dread", Relaxed: "stillness",
};

function scoreItem(item, board, tab) {
  const itemGenres = item.genre.split("/").map(g => g.trim());
  const genreMatches = board.genres.filter(g =>
    itemGenres.some(ig =>
      ig.toLowerCase().includes(g.toLowerCase()) ||
      g.toLowerCase().includes(ig.toLowerCase())
    )
  ).length;
  const itemOrigin = tab === "music" ? item.region : item.country;
  const originMatch = board.origins.length > 0 && board.origins.includes(itemOrigin) ? 1 : 0;
  const moodMatches = (item.moods || []).filter(m => board.moods.includes(m)).length;

  let score = 0;
  score += moodMatches * 4;
  score += originMatch * 5;
  score += genreMatches * 3;
  score += (item.rating || 0) * 0.3;
  score += Math.random() * 1.2;
  return score;
}

function reasonFor(item, board, isBoardActive, fallbackIndex, tab) {
  if (!isBoardActive) {
    return `${POETIC_REASONS[fallbackIndex % POETIC_REASONS.length]}.`;
  }
  const itemGenres = item.genre.split("/").map(g => g.trim());
  const matchedGenre = board.genres.find(g =>
    itemGenres.some(ig =>
      ig.toLowerCase().includes(g.toLowerCase()) ||
      g.toLowerCase().includes(ig.toLowerCase())
    )
  );
  const itemOrigin = tab === "music" ? item.region : item.country;
  const matchedOrigin = board.origins.includes(itemOrigin) ? itemOrigin : null;
  const matchedMood = (item.moods || []).find(m => board.moods.includes(m));

  const noun = tab === "music" ? "record" : tab === "series" ? "series" : "film";
  const work = tab === "music" ? "music" : "cinema";

  if (matchedOrigin && matchedGenre && matchedMood) {
    return `A ${matchedOrigin} ${matchedGenre.toLowerCase()} ${noun} that carries the ${MOOD_NOUN[matchedMood]} you asked for.`;
  }
  if (matchedGenre && matchedMood) {
    return `${matchedGenre} ${work} in the ${MOOD_NOUN[matchedMood]} register you chose.`;
  }
  if (matchedOrigin && matchedMood) {
    return `From ${matchedOrigin}, with the ${MOOD_NOUN[matchedMood]} you wanted underneath.`;
  }
  if (matchedOrigin && matchedGenre) {
    return `Pure ${matchedOrigin} ${matchedGenre.toLowerCase()} — exactly the territory you set.`;
  }
  if (matchedMood) {
    return `Sits squarely in the ${MOOD_NOUN[matchedMood]} you were after.`;
  }
  if (matchedGenre) {
    return `Lives in the ${matchedGenre.toLowerCase()} space you chose.`;
  }
  if (matchedOrigin) {
    return `Born in ${matchedOrigin}, like you asked.`;
  }
  return `${POETIC_REASONS[fallbackIndex % POETIC_REASONS.length]}.`;
}

const getRecommendations = (tab, selectedItem, board) => {
  const pool = selectedItem ? DATA[tab].filter(i => i.title !== selectedItem.title) : DATA[tab];
  const boardActive = !!(board && (board.genres.length || board.origins.length || board.moods.length));

  const baseBoard = board || { genres: [], origins: [], moods: [] };
  let effectiveBoard = baseBoard;
  if (selectedItem) {
    const itemGenres = selectedItem.genre.split("/").map(g => g.trim());
    const itemMoods = selectedItem.moods || [];
    effectiveBoard = {
      genres:  [...new Set([...baseBoard.genres,  ...itemGenres])],
      origins: baseBoard.origins,
      moods:   [...new Set([...baseBoard.moods,   ...itemMoods])],
    };
  }
  const effectiveActive = !!(selectedItem || boardActive);

  let picks;
  if (effectiveActive) {
    const scored = pool.map(item => ({ item, s: scoreItem(item, effectiveBoard, tab) }));
    scored.sort((a, b) => b.s - a.s);
    picks = scored.slice(0, 12).map(({ item, s }) => ({ item, score: s }));
  } else {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 12);
    picks = shuffled.map(item => ({ item, score: 0 }));
  }

  return picks.map(({ item, score }, i) => ({
    ...item,
    match: effectiveActive
      ? Math.min(98, 80 + Math.round(score * 1.2))
      : Math.floor(Math.random() * 14) + 83,
    reason: reasonFor(item, effectiveBoard, effectiveActive, i, tab),
  }));
};

const CinematicBackground = ({ tab }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const initParticles = () => {
      particlesRef.current = [];
      if (tab === "movies") {
        for (let i = 0; i < 18; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            width: 50 + Math.random() * 40, height: 15 + Math.random() * 10,
            rotation: Math.random() * Math.PI * 2, rotVel: (Math.random() - 0.5) * 0.003,
            vx: (Math.random() - 0.5) * 0.18, vy: -0.08 - Math.random() * 0.15,
            opacity: 0.05 + Math.random() * 0.1, type: "filmstrip",
          });
        }
        for (let i = 0; i < 7; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            radius: 80 + Math.random() * 80,
            vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
            opacity: 0.04 + Math.random() * 0.04, type: "flare",
          });
        }
      } else if (tab === "series") {
        for (let i = 0; i < 28; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            width: 200 + Math.random() * 150, height: 1 + Math.random(),
            vx: 0.4 + Math.random() * 0.6,
            opacity: 0.04 + Math.random() * 0.08, type: "scanline",
          });
        }
        for (let i = 0; i < 10; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            radius: 60 + Math.random() * 90,
            vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
            opacity: 0.05 + Math.random() * 0.05, type: "orb",
          });
        }
      } else {
        for (let i = 0; i < 8; i++) {
          particlesRef.current.push({
            x: canvas.width * 0.5, y: canvas.height * 0.5,
            radius: 60 + i * 40, speed: 0.3 + Math.random() * 0.4,
            phase: Math.random() * Math.PI * 2,
            opacity: 0.05 + Math.random() * 0.04, type: "wave",
          });
        }
        for (let i = 0; i < 6; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            radius: 40 + Math.random() * 40,
            rotation: Math.random() * Math.PI * 2, rotVel: 0.002 + Math.random() * 0.004,
            vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.1,
            opacity: 0.04 + Math.random() * 0.05, type: "vinyl",
          });
        }
      }
    };
    initParticles();

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      particlesRef.current.forEach(p => {
        ctx.save();
        if (p.type === "filmstrip") {
          ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.globalAlpha = p.opacity;
          ctx.strokeStyle = `rgba(255,215,150,1)`; ctx.lineWidth = 1;
          ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);
          for (let h = 0; h < 5; h++) {
            const hx = -p.width / 2 + (p.width / 5) * h + p.width / 10;
            ctx.fillStyle = `rgba(255,215,150,1)`;
            ctx.fillRect(hx - 1.5, -p.height / 2 + 2, 3, 2);
            ctx.fillRect(hx - 1.5, p.height / 2 - 4, 3, 2);
          }
          ctx.beginPath(); ctx.moveTo(-p.width / 2, -p.height / 2 + 7); ctx.lineTo(p.width / 2, -p.height / 2 + 7); ctx.stroke();
          p.x += p.vx; p.y += p.vy; p.rotation += p.rotVel;
          if (p.y < -100) p.y = canvas.height + 100;
          if (p.x < -100) p.x = canvas.width + 100;
          if (p.x > canvas.width + 100) p.x = -100;
        } else if (p.type === "flare") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          g.addColorStop(0, `rgba(255,200,120,${p.opacity})`);
          g.addColorStop(1, `rgba(255,200,120,0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.x < -250 || p.x > canvas.width + 250) p.vx *= -1;
          if (p.y < -250 || p.y > canvas.height + 250) p.vy *= -1;
        } else if (p.type === "scanline") {
          ctx.globalAlpha = p.opacity; ctx.fillStyle = `rgba(100,200,255,1)`;
          ctx.fillRect(p.x, p.y, p.width, p.height);
          p.x += p.vx;
          if (p.x > canvas.width + 350) { p.x = -350; p.y = Math.random() * canvas.height; }
        } else if (p.type === "orb") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          g.addColorStop(0, `rgba(126,184,232,${p.opacity})`);
          g.addColorStop(1, `rgba(126,184,232,0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.x < -150 || p.x > canvas.width + 150) p.vx *= -1;
          if (p.y < -150 || p.y > canvas.height + 150) p.vy *= -1;
        } else if (p.type === "wave") {
          const r = p.radius + Math.sin(t * p.speed + p.phase) * 25;
          ctx.globalAlpha = p.opacity;
          ctx.strokeStyle = `rgba(190,110,255,1)`; ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        } else if (p.type === "vinyl") {
          ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.globalAlpha = p.opacity;
          ctx.strokeStyle = `rgba(196,126,232,1)`; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.stroke();
          for (let g = 1; g <= 6; g++) {
            ctx.beginPath(); ctx.arc(0, 0, p.radius * (0.28 + g * 0.1), 0, Math.PI * 2); ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(0, 0, p.radius * 0.25, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.stroke();
          p.x += p.vx; p.y += p.vy; p.rotation += p.rotVel;
          if (p.x < -150 || p.x > canvas.width + 150) p.vx *= -1;
          if (p.y < -150 || p.y > canvas.height + 150) p.vy *= -1;
        }
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [tab]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />;
};

const tabConfig = {
  movies: { label: "Movies", accent: "#e8c97e", glow: "rgba(232,201,126,0.22)", tagline: "Cinema, curated" },
  series: { label: "TV Series", accent: "#7eb8e8", glow: "rgba(126,184,232,0.22)", tagline: "Stories that linger" },
  music:  { label: "Music",    accent: "#c47ee8", glow: "rgba(196,126,232,0.22)", tagline: "Sound, discovered" },
};
const TABS = ["movies", "series", "music"];

export default function App() {
  const [activeTab, setActiveTab] = useState("movies");
  const [query, setQuery] = useState("");
  const [dropdown, setDropdown] = useState([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiPhase, setAIPhase] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [moodboardOpen, setMoodboardOpen] = useState(false);
  const [boards, setBoards] = useState(() => {
    try {
      const saved = localStorage.getItem("sonar-boards");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      movies: { genres: [], origins: [], moods: [] },
      series: { genres: [], origins: [], moods: [] },
      music:  { genres: [], origins: [], moods: [] },
    };
  });
  const board = boards[activeTab];

  useEffect(() => {
    try { localStorage.setItem("sonar-boards", JSON.stringify(boards)); } catch {}
  }, [boards]);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const recCacheRef = useRef(new Map());
  const cfg = tabConfig[activeTab];

  const boardCount = board.genres.length + board.origins.length + board.moods.length;
  const boardActive = boardCount > 0;

  const getDisplayName = (item) => item.artist ? `${item.title} — ${item.artist}` : item.title;
  const getItemMeta = useCallback((item) => activeTab === "music" ? item.artist : activeTab === "series" ? item.creator : item.director, [activeTab]);

  const fuse = useMemo(() => new Fuse(DATA[activeTab], {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "artist", weight: 0.3 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), [activeTab]);

  const handleQuery = useCallback((val) => {
    setQuery(val);
    setHighlightIdx(-1);
    if (val.length < 1) { setDropdown([]); setDropdownOpen(false); return; }
    const matches = fuse.search(val, { limit: 8 }).map(r => r.item);
    setDropdown(matches); setDropdownOpen(matches.length > 0);
  }, [fuse]);

  const boardKey = useCallback((b) =>
    `${b.genres.sort().join(",")}|${b.origins.sort().join(",")}|${b.moods.sort().join(",")}`,
    []);

  const handleSelect = useCallback(async (item) => {
    setQuery(getDisplayName(item));
    setDropdownOpen(false);
    setHighlightIdx(-1);
    setSelectedItem(item);
    setShowResults(false);
    setLoading(true);
    setAIPhase("llm");

    const itemGenres = item.genre ? item.genre.split("/").map(g => g.trim()) : [];
    const itemMoods = item.moods || [];
    const mergedBoard = {
      genres:  itemGenres,
      origins: board.origins,
      moods:   itemMoods,
    };
    setBoards(prev => ({ ...prev, [activeTab]: mergedBoard }));

    try {
      const llmRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: item.title, tab: activeTab }),
      });
      if (!llmRes.ok) throw new Error("llm");
      const { recommendations: llmRecs } = await llmRes.json();

      setAIPhase("tmdb");
      const tmdbRes = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles: llmRecs.map(r => r.title), tab: activeTab }),
      });
      if (!tmdbRes.ok) throw new Error("tmdb");
      const { enriched } = await tmdbRes.json();

      const recs = llmRecs.map((rec, i) => {
        const tmdb = enriched.find(e => e.title === rec.title) || enriched[i] || {};
        return {
          id: i + 1,
          title: rec.title,
          match: rec.matchScore ?? 85,
          reason: rec.reason ?? "",
          year: tmdb.year || "",
          genre: tmdb.genre || "",
          poster_path: tmdb.poster_path || null,
          overview: tmdb.overview || "",
        };
      });

      setAIPhase(null);
      setRecommendations(recs);
      setLoading(false);
      setShowResults(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

    } catch {
      setAIPhase(null);
      const cacheKey = `${activeTab}|${item.id ?? item.title}|${boardKey(mergedBoard)}`;
      const cached = recCacheRef.current.get(cacheKey);
      const recs = cached || getRecommendations(activeTab, item, mergedBoard);
      if (!cached) recCacheRef.current.set(cacheKey, recs);

      setTimeout(() => {
        setRecommendations(recs);
        setLoading(false);
        setShowResults(true);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }, cached ? 600 : 1800);
    }
  }, [activeTab, board, boardKey, setBoards]);

  useEffect(() => {
    if (!selectedItem || !showResults) return;
    const cacheKey = `${activeTab}|${selectedItem.id}|${boardKey(board)}`;
    const cached = recCacheRef.current.get(cacheKey);
    const recs = cached || getRecommendations(activeTab, selectedItem, board);
    if (!cached) recCacheRef.current.set(cacheKey, recs);

    setLoading(true);
    setShowResults(false);
    const t = setTimeout(() => {
      setRecommendations(recs);
      setLoading(false);
      setShowResults(true);
    }, 450);
    return () => clearTimeout(t);
  }, [board, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowDown" && dropdownOpen) {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, dropdown.length - 1));
    } else if (e.key === "ArrowUp" && dropdownOpen) {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (dropdownOpen && dropdown.length > 0) {
        const idx = highlightIdx >= 0 ? highlightIdx : 0;
        handleSelect(dropdown[idx]);
      } else if (query.trim().length > 0) {
        handleSelect({ title: query.trim(), id: `search-${Date.now()}`, genre: "", moods: [], year: "", rating: null });
      }
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
      setHighlightIdx(-1);
    }
  }, [dropdownOpen, dropdown, highlightIdx, handleSelect, query]);

  const handleTabChange = (tab) => {
    setActiveTab(tab); setQuery(""); setDropdown([]); setDropdownOpen(false);
    setHighlightIdx(-1);
    setSelectedItem(null); setShowResults(false); setRecommendations([]); setLoading(false);
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#060606", fontFamily: "'Cormorant Garamond', serif", color: "white", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Syne:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        input::placeholder { color: rgba(255,255,255,0.22); }
        input:focus { outline: none; }
      `}</style>

      <CinematicBackground tab={activeTab} />

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
          style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: `radial-gradient(ellipse at 50% 35%, ${cfg.glow} 0%, transparent 65%)` }} />
      </AnimatePresence>

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          style={{ width: "100%", padding: "2rem 3rem 0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: cfg.accent, boxShadow: `0 0 12px ${cfg.accent}` }} />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.88rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>Sonar</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </motion.header>

        <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
          <div style={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", alignItems: "center" }}>

            <AnimatePresence mode="wait">
              <motion.p key={activeTab + "tag"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5 }}
                style={{ fontSize: "0.82rem", color: cfg.accent, letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "'Syne', sans-serif", marginBottom: "1.4rem", fontWeight: 500 }}>
                {cfg.tagline}
              </motion.p>
            </AnimatePresence>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2.6rem, 6vw, 4.8rem)", lineHeight: 1.04, textAlign: "center", marginBottom: "1.2rem", letterSpacing: "-0.02em" }}>
              Discover what moves you
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
              style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", textAlign: "center", marginBottom: "3rem", fontStyle: "italic", letterSpacing: "0.02em" }}>
              Tell us one you love. We'll find twelve more.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }}
              style={{ display: "flex", gap: "0.25rem", marginBottom: "2.4rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "100px", padding: "0.3rem" }}>
              {TABS.map(tab => {
                const c = tabConfig[tab]; const isActive = activeTab === tab;
                return (
                  <motion.button key={tab} onClick={() => handleTabChange(tab)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "0.6rem 1.8rem", borderRadius: "100px", border: "none", cursor: "pointer",
                      background: isActive ? `${c.accent}1f` : "transparent",
                      color: isActive ? c.accent : "rgba(255,255,255,0.55)",
                      fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "0.78rem",
                      letterSpacing: "0.18em", textTransform: "uppercase", transition: "color 0.3s, background 0.3s",
                      boxShadow: isActive ? `inset 0 0 0 1px ${c.accent}55` : "none",
                    }}>
                    {c.label}
                  </motion.button>
                );
              })}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9 }}
              style={{ position: "relative", width: "100%" }}>
              <div style={{ position: "relative", background: "rgba(255,255,255,0.045)", border: `1px solid ${dropdownOpen ? cfg.accent + "55" : "rgba(255,255,255,0.08)"}`, borderRadius: "100px", transition: "border 0.3s", boxShadow: dropdownOpen ? `0 0 0 4px ${cfg.accent}10` : "none" }}>
                <div style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: cfg.accent, opacity: 0.65, pointerEvents: "none" }}>
                  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
                <input ref={inputRef} value={query} onChange={e => handleQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => query && dropdown.length && setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 160)}
                  placeholder={`Search a ${activeTab === "movies" ? "film" : activeTab === "series" ? "series" : "record"} you love...`}
                  style={{ width: "100%", padding: "1.2rem 3rem 1.2rem 3.2rem", background: "transparent", border: "none", color: "white", fontSize: "1.02rem", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.01em" }}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setDropdown([]); setDropdownOpen(false); inputRef.current?.focus(); }}
                    style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.1rem", padding: "0.2rem 0.5rem" }}>
                    ✕
                  </button>
                )}
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
                    style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, marginTop: "0.6rem", background: "rgba(15,15,15,0.96)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", overflow: "hidden", maxHeight: 360, overflowY: "auto" }}>
                    {dropdown.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        onMouseDown={() => handleSelect(item)}
                        onMouseEnter={() => setHighlightIdx(i)}
                        style={{
                          padding: "0.85rem 1.3rem", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          borderBottom: i < dropdown.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                          background: i === highlightIdx ? `${cfg.accent}14` : "transparent",
                          transition: "background 0.15s",
                        }}>
                        <div>
                          <div style={{ color: "rgba(255,255,255,0.88)", fontSize: "0.94rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                            {item.title}{item.artist && <span style={{ color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}> — {item.artist}</span>}
                          </div>
                          <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.72rem", fontFamily: "'Syne', sans-serif", letterSpacing: "0.1em", marginTop: 2, textTransform: "uppercase" }}>
                            {item.genre} · {item.year}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.68rem", fontFamily: "'Syne', sans-serif", color: cfg.accent, letterSpacing: "0.1em", fontWeight: 600 }}>★ {item.rating?.toFixed(1)}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
              style={{ marginTop: "1.6rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem" }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic", fontWeight: 300,
                fontSize: "0.94rem",
                color: boardActive ? cfg.accent : "rgba(255,255,255,0.42)",
                letterSpacing: "0.04em", textAlign: "center",
                transition: "color 0.4s",
              }}>
                {boardActive
                  ? <>Moodboard set <span style={{ opacity: 0.7 }}>· {boardCount} trait{boardCount === 1 ? "" : "s"} active</span></>
                  : <>Enhance your selection using the <span style={{ color: "rgba(255,255,255,0.7)" }}>Sonar Moodboard</span></>}
              </p>

              <motion.button
                onClick={() => setMoodboardOpen(true)}
                whileHover={{ scale: 1.06, boxShadow: `0 0 22px ${cfg.accent}66` }}
                whileTap={{ scale: 0.94 }}
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: boardActive ? `${cfg.accent}26` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${boardActive ? cfg.accent : "rgba(255,255,255,0.18)"}`,
                  color: boardActive ? cfg.accent : "rgba(255,255,255,0.6)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.3s, border 0.3s, color 0.3s",
                }}
                aria-label="Open Sonar Moodboard"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </motion.button>
            </motion.div>

            {!loading && !showResults && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }}
                style={{ marginTop: "2.6rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem" }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.6rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Begin</span>
                <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  style={{ width: 1, height: 30, background: `linear-gradient(to bottom, ${cfg.accent}, transparent)` }} />
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: "5rem 1.5rem", textAlign: "center", width: "100%" }}>
              <LoadingOrbits accent={cfg.accent} />
              <p style={{ marginTop: "1.4rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(255,255,255,0.55)", fontSize: "1rem" }}>
                {aiPhase === "llm"
                  ? "Consulting the AI curator…"
                  : aiPhase === "tmdb"
                  ? "Fetching posters & details…"
                  : "Reading the signal in your taste…"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResults && !loading && (
            <motion.div ref={resultsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
              style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "2rem 2.5rem 6rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "3rem" }}>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${cfg.accent}55)` }} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.62rem", letterSpacing: "0.36em", textTransform: "uppercase", color: cfg.accent, fontWeight: 600, marginBottom: "0.4rem" }}>
                    Twelve for you
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(255,255,255,0.45)", fontSize: "0.88rem" }}>
                    {selectedItem
                    ? <>because you love <span style={{ color: cfg.accent }}>{getDisplayName(selectedItem)}</span>{boardActive && <span style={{ color: "rgba(255,255,255,0.35)" }}> · refined by your moodboard</span>}</>
                    : <>curated from your <span style={{ color: cfg.accent }}>moodboard</span> settings</>}
                  </p>
                </div>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${cfg.accent}55)` }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.2rem" }}>
                {recommendations.map((item, i) => (
                  <RecommendCard key={item.id} item={item} index={i} accent={cfg.accent} getItemMeta={getItemMeta} onSelect={handleSelect} />
                ))}
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                style={{ textAlign: "center", marginTop: "3.5rem" }}>
                <button onClick={() => { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${cfg.accent}44`, color: cfg.accent, padding: "0.85rem 2rem", borderRadius: "100px", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: "0.74rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, transition: "background 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${cfg.accent}14`}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                  ↑ Search another
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: "0.72rem", fontFamily: "'Syne', sans-serif", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          <div>Sonar AI · Taste Intelligence Engine · {new Date().getFullYear()}</div>
          <div style={{
            marginTop: "0.7rem",
            fontSize: "0.6rem",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.12)",
            textTransform: "none",
            fontStyle: "italic",
            fontFamily: "'Cormorant Garamond', serif",
          }}>
            Movie & series data from TMDB · Music data from Last.fm and MusicBrainz · Not endorsed or certified by any of the above
          </div>
        </footer>
      </div>

      <MoodboardModal
        open={moodboardOpen}
        onClose={() => setMoodboardOpen(false)}
        accent={cfg.accent}
        glow={cfg.glow}
        initialBoard={board}
        options={MOOD_OPTIONS[activeTab]}
        onConfirm={(newBoard) => {
          setBoards(prev => ({ ...prev, [activeTab]: newBoard }));
          setMoodboardOpen(false);
          const hasTraits = newBoard.genres.length || newBoard.origins.length || newBoard.moods.length;
          if (!selectedItem && hasTraits) {
            setLoading(true);
            setShowResults(false);
            const cacheKey = `${activeTab}|board-only|${newBoard.genres.sort().join(",")}|${newBoard.origins.sort().join(",")}|${newBoard.moods.sort().join(",")}`;
            const cached = recCacheRef.current.get(cacheKey);
            const recs = cached || getRecommendations(activeTab, null, newBoard);
            if (!cached) recCacheRef.current.set(cacheKey, recs);
            setTimeout(() => {
              setRecommendations(recs);
              setLoading(false);
              setShowResults(true);
              setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
            }, 1200);
          }
        }}
      />
    </div>
  );
}

function MoodboardModal({ open, onClose, onConfirm, accent, glow, initialBoard, options }) {
  const [genres, setGenres] = useState(initialBoard.genres);
  const [origins, setOrigins] = useState(initialBoard.origins);
  const [moods, setMoods] = useState(initialBoard.moods);

  useEffect(() => {
    if (open) {
      setGenres(initialBoard.genres);
      setOrigins(initialBoard.origins);
      setMoods(initialBoard.moods);
    }
  }, [open, initialBoard]);

  const toggle = (set, setter) => (val) => {
    setter(set.includes(val) ? set.filter(v => v !== val) : [...set, val]);
  };

  const total = genres.length + origins.length + moods.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 640,
              maxHeight: "calc(100vh - 3rem)", overflowY: "auto",
              background: "rgba(12,12,12,0.96)",
              border: `1px solid ${accent}33`,
              borderRadius: "1.3rem",
              padding: "2.2rem 2.2rem 1.8rem",
              boxShadow: `0 30px 80px -20px ${accent}33, 0 0 60px -10px ${glow}`,
              position: "relative",
            }}
          >
            <button onClick={onClose}
              style={{
                position: "absolute", top: 16, right: 16,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "0.9rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              aria-label="Close moodboard"
            >✕</button>

            <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
              <p style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 600,
                fontSize: "0.62rem", letterSpacing: "0.4em",
                textTransform: "uppercase", color: accent, marginBottom: "0.7rem",
              }}>Sonar Moodboard</p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
                fontSize: "2rem", lineHeight: 1.1, letterSpacing: "-0.01em",
                marginBottom: "0.5rem",
              }}>Refine what you're after</h2>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                color: "rgba(255,255,255,0.42)", fontSize: "0.88rem",
              }}>
                Pick a few traits. Sonar will weigh them against your choice.
              </p>
            </div>

            <Section title={options.genreLabel} accent={accent}>
              {options.genres.map(g => (
                <Pill key={g} label={g} active={genres.includes(g)} onClick={() => toggle(genres, setGenres)(g)} accent={accent} />
              ))}
            </Section>

            <Section title={options.originLabel} accent={accent}>
              {options.origins.map(c => (
                <Pill key={c} label={c} active={origins.includes(c)} onClick={() => toggle(origins, setOrigins)(c)} accent={accent} />
              ))}
            </Section>

            <Section title="I want to feel" accent={accent}>
              {options.moods.map(m => (
                <Pill key={m} label={m} active={moods.includes(m)} onClick={() => toggle(moods, setMoods)(m)} accent={accent} />
              ))}
            </Section>

            <div style={{
              marginTop: "1.8rem", paddingTop: "1.4rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
            }}>
              <button
                onClick={() => { setGenres([]); setOrigins([]); setMoods([]); }}
                style={{
                  background: "transparent", border: "none",
                  color: "rgba(255,255,255,0.4)", cursor: "pointer",
                  fontFamily: "'Syne', sans-serif", fontSize: "0.7rem",
                  letterSpacing: "0.2em", textTransform: "uppercase",
                }}
              >
                Clear all
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                  color: "rgba(255,255,255,0.4)", fontSize: "0.85rem",
                }}>
                  {total === 0 ? "no traits yet" : `${total} trait${total === 1 ? "" : "s"} selected`}
                </span>
                <button
                  onClick={() => onConfirm({ genres, origins, moods })}
                  style={{
                    background: `${accent}22`,
                    border: `1px solid ${accent}88`,
                    color: accent,
                    padding: "0.7rem 1.8rem", borderRadius: "100px", cursor: "pointer",
                    fontFamily: "'Syne', sans-serif", fontSize: "0.74rem", fontWeight: 600,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    transition: "background 0.3s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${accent}3a`}
                  onMouseLeave={e => e.currentTarget.style.background = `${accent}22`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, accent, children }) {
  return (
    <div style={{ marginBottom: "1.6rem" }}>
      <p style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 600,
        fontSize: "0.62rem", letterSpacing: "0.32em",
        textTransform: "uppercase", color: accent,
        marginBottom: "0.85rem",
      }}>{title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
        {children}
      </div>
    </div>
  );
}

function Pill({ label, active, onClick, accent }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      style={{
        padding: "0.45rem 0.95rem",
        borderRadius: "100px",
        border: `1px solid ${active ? accent : "rgba(255,255,255,0.1)"}`,
        background: active ? `${accent}22` : "rgba(255,255,255,0.03)",
        color: active ? accent : "rgba(255,255,255,0.65)",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "0.92rem", letterSpacing: "0.01em",
        cursor: "pointer", transition: "all 0.25s",
      }}
    >
      {label}
    </motion.button>
  );
}

function LoadingOrbits({ accent }) {
  return (
    <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto" }}>
      <style>{`
        @keyframes orbit1{from{transform:rotate(0deg) translateX(28px) rotate(0deg)}to{transform:rotate(360deg) translateX(28px) rotate(-360deg)}}
        @keyframes orbit2{from{transform:rotate(120deg) translateX(20px) rotate(-120deg)}to{transform:rotate(480deg) translateX(20px) rotate(-480deg)}}
        @keyframes orbit3{from{transform:rotate(240deg) translateX(13px) rotate(-240deg)}to{transform:rotate(600deg) translateX(13px) rotate(-600deg)}}
        @keyframes pulse-core{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
      `}</style>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: accent, animation: "pulse-core 1.6s ease-in-out infinite", boxShadow: `0 0 18px ${accent}` }} />
      </div>
      {[["orbit1", "1.4s", 6], ["orbit2", "1.9s", 4.5], ["orbit3", "2.3s", 3.5]].map(([anim, dur, size], i) => (
        <div key={i} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: size, height: size, borderRadius: "50%", background: accent, opacity: 0.85, animation: `${anim} ${dur} linear infinite` }} />
        </div>
      ))}
    </div>
  );
}

function RecommendCard({ item, index, accent, getItemMeta, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const meta = getItemMeta(item);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(item)}
      style={{
        position: "relative",
        background: hovered ? "rgba(255,255,255,0.058)" : "rgba(255,255,255,0.028)",
        border: `1px solid ${hovered ? accent + "55" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "1rem", padding: "1.3rem 1.2rem 1.2rem", cursor: "pointer",
        transition: "background 0.3s, border 0.3s, transform 0.3s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        overflow: "hidden",
        boxShadow: hovered ? `0 18px 40px -12px ${accent}33` : "none",
      }}
    >
      {hovered && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />}

      {item.poster_path && (
        <div style={{ margin: "-1.3rem -1.2rem 1rem", borderRadius: "1rem 1rem 0 0", overflow: "hidden", height: 170 }}>
          <img
            src={item.poster_path}
            alt={item.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${accent}14`, border: `1px solid ${accent}33`, padding: "0.2rem 0.55rem", borderRadius: "100px", marginBottom: "1rem" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: accent }} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.64rem", fontWeight: 600, color: accent, letterSpacing: "0.12em" }}>{item.match}% MATCH</span>
      </div>

      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "1.15rem", color: "rgba(255,255,255,0.94)", marginBottom: "0.35rem", lineHeight: 1.2 }}>
        {item.title}
      </h3>

      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.42)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>
        {item.year} · {item.genre}{meta && ` · ${meta}`}
      </p>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.85rem", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{ marginTop: 4, flexShrink: 0, opacity: 0.8 }}>
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.86rem", color: "rgba(255,255,255,0.56)", lineHeight: 1.45 }}>
          {item.reason}
        </p>
      </div>

      <div style={{ position: "absolute", top: "1.3rem", right: "1.2rem", fontFamily: "'Syne', sans-serif", fontSize: "0.62rem", color: "rgba(255,255,255,0.22)", letterSpacing: "0.18em", fontWeight: 600 }}>
        {String(index + 1).padStart(2, "0")}
      </div>
    </motion.div>
  );
}
