#!/usr/bin/env node
// Backfill publishedAt for bulk-imported tutorials using yt-dlp approximate upload dates.
// Source: TEMP/dates_<channel>.txt lines "videoId|YYYYMMDD" (youtubetab:approximate_date).
// Only fills entries where publishedAt is null/empty; never overwrites existing values.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TUT_DIR = join(__dirname, '..', 'src', 'content', 'tutorials');
const channels = ['3dbibi', 'ducky', 'redblueen', 'extra3d', 'adiidiin'];

const dateMap = new Map();
for (const ch of channels) {
  const raw = readFileSync(join(process.env.TEMP, `dates_${ch}.txt`), 'utf8').replace(/^﻿/, '');
  for (const line of raw.split(/\r?\n/)) {
    const [id, d] = line.trim().split('|');
    if (!id || !d || !/^\d{8}$/.test(d)) continue;
    dateMap.set(id, `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`);
  }
}

const ytId = (url) => {
  const m = (url || '').match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

let updated = 0, skippedHasDate = 0, noMatch = 0;
for (const file of readdirSync(TUT_DIR)) {
  if (!file.endsWith('.json')) continue;
  const path = join(TUT_DIR, file);
  const rec = JSON.parse(readFileSync(path, 'utf8').replace(/^﻿/, ''));
  if (rec.publishedAt) { skippedHasDate++; continue; }
  const id = ytId(rec.url);
  const date = id && dateMap.get(id);
  if (!date) { noMatch++; continue; }
  rec.publishedAt = date;
  writeFileSync(path, JSON.stringify(rec, null, 2) + '\n', 'utf8');
  updated++;
}
console.log(`publishedAt backfill: updated ${updated}, kept ${skippedHasDate} (already had date), noMatch ${noMatch}. map size ${dateMap.size}`);
