#!/usr/bin/env node
// One-shot importer: Extra 3d (@extra3d537) → tutorials (lighting / compositing / photoreal).
// Source: TEMP/extra3d_clean.json [{id,title,dur}] (yt-dlp flat playlist). IDs from t387.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TUT_DIR = join(__dirname, '..', 'src', 'content', 'tutorials');
const list = JSON.parse(
  readFileSync(join(process.env.TEMP, 'extra3d_clean.json'), 'utf8').replace(/^﻿/, '')
);

let n = 387;
const nextId = () => 't' + String(n++).padStart(3, '0');
const isJa = (t) => /[぀-ヿ㐀-鿿]/.test(t);

function durLabel(s) {
  const min = Math.max(1, Math.round(s / 60));
  if (min >= 60) { const h = Math.floor(min / 60), r = min % 60; return r ? `${h}時間${r}分` : `${h}時間`; }
  return `${min}分`;
}
function blenderVersion(t) { const m = t.match(/blender\s?(\d\.\d{1,2})/i); return m ? m[1] : null; }
function cleanTitle(t) {
  return t.replace(/\s*[-–—|]\s*$/,'').replace(/\s+/g,' ').trim().replace(/[\s!?.]+$/,'');
}
function categories(t) {
  const c = new Set();
  const has = (re) => re.test(t);
  if (has(/照明|ライト|light/i)) c.add('lighting');
  if (has(/compositor|composit|cinematic|シネマティック|映画/i)) c.add('compositing');
  if (has(/photoreal|realistic|リアル|フォトリアル|render|レンダリング|texture|テクスチャ|pbr|shader|material|マテリアル/i)) c.add('photorealistic');
  if (has(/animation|アニメ|physics|simulat|シミュレーション/i)) c.add('motion_design');
  if (c.size === 0) c.add('photorealistic'); // channel default
  return [...c].slice(0, 4);
}
function levels(t) {
  if (/quick guide|easy|beginner|入門|初心者/i.test(t)) return ['beginner', 'intermediate'];
  if (/ultimate guide|master|made me pro|advanced|究極/i.test(t)) return ['intermediate', 'advanced'];
  return ['intermediate'];
}

let created = 0;
for (const v of list) {
  const id = nextId();
  const core = cleanTitle(v.title) || v.title;
  const ja = isJa(v.title);
  const rec = {
    type: 'tutorial',
    title: v.title,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    platform: 'youtube',
    priceType: 'free',
    creator: 'Extra 3d',
    language: ja ? 'ja' : 'en',
    level: levels(v.title),
    categories: categories(v.title),
    goals: [],
    duration: durLabel(v.dur),
    recommendedOrder: null,
    summary: ja
      ? `${core}。Blenderのライティング/コンポジット/フォトリアル系チュートリアル（Extra 3d）。`
      : `${core} — a Blender lighting / compositing / photoreal tutorial by Extra 3d.`,
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
console.log(`Extra3d: created ${created}. IDs t387..t${String(386 + created).padStart(3, '0')}`);
