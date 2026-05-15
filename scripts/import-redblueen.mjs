#!/usr/bin/env node
// One-shot importer: redblueen (@redblueen) → tutorials (90s cel-look theme).
// Source: TEMP/redblueen_clean.json [{id,title,dur}] (yt-dlp flat playlist). IDs from t367.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TUT_DIR = join(__dirname, '..', 'src', 'content', 'tutorials');
const list = JSON.parse(
  readFileSync(join(process.env.TEMP, 'redblueen_clean.json'), 'utf8').replace(/^﻿/, '')
);

let n = 367;
const nextId = () => 't' + String(n++).padStart(3, '0');

function durLabel(s) {
  const min = Math.max(1, Math.round(s / 60));
  if (min >= 60) { const h = Math.floor(min / 60), r = min % 60; return r ? `${h}時間${r}分` : `${h}時間`; }
  return `${min}分`;
}
function blenderVersion(t) { const m = t.match(/blender\s?(\d\.\d{1,2})/i); return m ? m[1] : null; }
function cleanTitle(t) {
  return t.replace(/\s*[-–—|()]\s*$/,'').replace(/\s+/g,' ').trim().replace(/[\s!?.]+$/,'');
}
function categories(t) {
  const c = new Set(['cell_look']); // 90s cel-look theme
  const has = (re) => re.test(t);
  if (has(/animat|cinematic|stylized|timelapse|clip/i)) c.add('motion_design');
  if (has(/glitch|shader|breakdown|texture|grunge/i)) c.add('compositing');
  if (has(/realistic|eevee next/i)) c.add('photorealistic');
  return [...c].slice(0, 4);
}
function levels(t) {
  return /breakdown|shader/i.test(t) ? ['intermediate', 'advanced'] : ['intermediate'];
}

let created = 0;
for (const v of list) {
  const id = nextId();
  const core = cleanTitle(v.title) || v.title;
  const rec = {
    type: 'tutorial',
    title: v.title,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    platform: 'youtube',
    priceType: 'free',
    creator: 'redblueen',
    language: 'en',
    level: levels(v.title),
    categories: categories(v.title),
    goals: [],
    duration: durLabel(v.dur),
    recommendedOrder: null,
    summary: `${core} — a stylized 90s cel-look Blender animation / shader breakdown by redblueen.`,
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
console.log(`redblueen: created ${created}. IDs t367..t${String(366 + created).padStart(3, '0')}`);
