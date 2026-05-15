#!/usr/bin/env node
// One-shot importer: Ducky 3D (@TheDucky3D) → tutorials (motion design / geometry nodes subset).
// Source: TEMP/ducky_clean.json [{id,title,dur}] (yt-dlp flat playlist). IDs from t099 (overwrites prior Ducky import).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TUT_DIR = join(__dirname, '..', 'src', 'content', 'tutorials');
const SRC = join(process.env.TEMP, 'ducky_clean.json');
const list = JSON.parse(readFileSync(SRC, 'utf8').replace(/^﻿/, ''));

// Keep only motion design / geometry nodes / animation / effect oriented videos.
const KEEP = /geometry node|geo node|motion|animat|\beffect|\bvfx\b|\bloop|particle|simulat|physics|transition|procedural|abstract|gradient|typograph|\bflow\b/i;

let n = 99;
const nextId = () => 't' + String(n++).padStart(3, '0');

function durLabel(s) {
  const min = Math.max(1, Math.round(s / 60));
  if (min >= 60) { const h = Math.floor(min / 60), r = min % 60; return r ? `${h}時間${r}分` : `${h}時間`; }
  return `${min}分`;
}
function blenderVersion(t) { const m = t.match(/blender\s?(\d\.\d{1,2})/i); return m ? m[1] : null; }
function cleanTitle(t) {
  return t
    .replace(/^blender\s*[-–—]\s*/i, '')
    .replace(/\((tutorial|easy|free|beginner)\)/ig, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\s!?.]+$/, '');
}
function categories(t) {
  const c = new Set();
  const has = (re) => re.test(t);
  if (has(/geometry node|geo node/i)) c.add('geometry_nodes');
  if (has(/\bloop/i)) c.add('loop_animation');
  if (has(/logo/i)) c.add('logo_animation');
  if (has(/cell ?look|toon|anime/i)) c.add('cell_look');
  if (has(/photoreal|realistic|render/i)) c.add('photorealistic');
  c.add('motion_design'); // subset theme
  return [...c].slice(0, 4);
}
function levels(t) {
  if (/\beasy\b|beginner|basics|getting started|simple/i.test(t)) return ['beginner', 'intermediate'];
  if (/advanced|complex|in.?depth|deep dive/i.test(t)) return ['intermediate', 'advanced'];
  return ['intermediate'];
}

let created = 0, skipped = 0;
for (const v of list) {
  if (!KEEP.test(v.title)) { skipped++; continue; }
  const id = nextId();
  const core = cleanTitle(v.title) || v.title;
  const rec = {
    type: 'tutorial',
    title: v.title,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    platform: 'youtube',
    priceType: 'free',
    creator: 'Ducky 3D',
    language: 'en',
    level: levels(v.title),
    categories: categories(v.title),
    goals: [],
    duration: durLabel(v.dur),
    recommendedOrder: null,
    summary: `${core} — a Blender motion design / geometry nodes tutorial by Ducky 3D.`,
    comment: null,
    affiliateUrl: null,
    isAffiliate: false,
    isPr: false,
    updatedAt: '2026-05-15',
    status: 'active',
    publishedAt: null,
    blenderVersion: blenderVersion(v.title),
  };
  writeFileSync(join(TUT_DIR, `${id}.json`), JSON.stringify(rec, null, 2) + '\n', 'utf8');
  created++;
}
console.log(`Ducky3D: created ${created}, skipped ${skipped} (of ${list.length}). IDs t099..t${String(98 + created).padStart(3, '0')}`);
