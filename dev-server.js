import { createRequire } from "module";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const fs = require("fs");
const dotenv = require("dotenv");

const envContent = fs.readFileSync(`${__dirname}/.env`, "utf8");
const parsed = dotenv.parse(envContent);
Object.assign(process.env, parsed);

import express from "express";

const app = express();
app.use(express.json());

app.post("/api/recommend", async (req, res) => {
  const { default: handler } = await import(`./api/recommend.js?t=${Date.now()}`);
  return handler(req, res);
});

app.post("/api/enrich", async (req, res) => {
  const { default: handler } = await import(`./api/enrich.js?t=${Date.now()}`);
  return handler(req, res);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ API server → http://localhost:${PORT}`);
});
