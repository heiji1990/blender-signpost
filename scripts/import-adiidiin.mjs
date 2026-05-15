#!/usr/bin/env node
// One-shot importer: adiidiin (@adiidiin) → tutorials (character modeling / sculpting / toon shaders).
// Source: TEMP/adiidiin_clean.json [{id,title,dur}] (yt-dlp flat playlist). IDs from t491.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TUT_DIR = join(__dirname, '..', 'src', 'content', 'tutorials');
const list = JSON.parse(
  readFileSync(join(process.env.TEMP, 'adiidiin_clean.json'), 'utf8').replace(/^﻿/, '')
);

let n = 491;
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
  const c = new Set(['modeling']); // character modeling / sculpting channel
  const has = (re) => re.test(t);
  if (has(/toon|cel|crayon|sketch|stylized|シェーダー|トゥーン|クレヨン|スケッチ|手描き/i)) c.add('cell_look');
  if (has(/retopo|リトポ/i)) c.add('modeling');
  if (has(/realistic|リアル/i)) c.add('photorealistic');
  return [...c].slice(0, 4);
}
function levels(t) {
  if (/easy|simple|clean|簡単|シンプル|クリーン|step by step|ステップバイステップ/i.test(t)) return ['beginner', 'intermediate'];
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
    creator: 'adiidiin',
    language: ja ? 'ja' : 'en',
    level: levels(v.title),
    categories: categories(v.title),
    goals: [],
    duration: durLabel(v.dur),
    recommendedOrder: null,
    summary: ja
      ? `${core}。Blenderのキャラクターモデリング/スカルプト・トゥーン系チュートリアル（adiidiin）。`
      : `${core} — a Blender character modeling / sculpting & toon-shader tutorial by adiidiin.`,
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
console.log(`adiidiin: created ${created}. IDs t491..t${String(490 + created).padStart(3, '0')}`);
