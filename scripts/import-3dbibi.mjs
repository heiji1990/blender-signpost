#!/usr/bin/env node
// One-shot importer: 3DBibi YouTube channel → tutorials collection (t021〜).
// Source list captured via yt-dlp flat playlist (TEMP/3dbibi_clean.json: [{id,title,dur}]).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TUT_DIR = join(__dirname, '..', 'src', 'content', 'tutorials');
const SRC = join(process.env.TEMP, '3dbibi_clean.json');

const list = JSON.parse(readFileSync(SRC, 'utf8').replace(/^﻿/, ''));

// Deterministic sequential IDs from t021 (overwrites prior 3DBibi import).
let n = 21;
const nextId = () => 't' + String(n++).padStart(3, '0');

function durLabel(s) {
  const min = Math.max(1, Math.round(s / 60));
  if (min >= 60) {
    const h = Math.floor(min / 60), r = min % 60;
    return r ? `${h}時間${r}分` : `${h}時間`;
  }
  return `${min}分`;
}

function blenderVersion(t) {
  const m = t.match(/blender\s?(\d\.\d{1,2})/i);
  return m ? m[1] : null;
}

function cleanTitle(t) {
  return t
    .replace(/[【［\[].*?[】］\]]/g, '')        // 【tag】
    .replace(/−\s*[a-zA-Z0-9 ]+\s*−/g, '')      // − english −
    .replace(/※.*$/, '')                         // ※notes
    .replace(/[｜|].*$/, '')                      // trailing ｜sub
    .replace(/\s+/g, ' ')
    .replace(/^[\s！!]+|[\s！!]+$/g, '')
    .trim();
}

function categories(t) {
  const c = new Set(['beginner']);
  const has = (re) => re.test(t);
  if (has(/モデリング|作ろう|作り方|モデル/)) c.add('modeling');
  if (has(/アニメ|モーション|歩き/)) c.add('character_animation');
  if (has(/リギング|リグ/)) c.add('rigging');
  if (has(/物理演算|剛体|ドミノ|エフェクト|光の筋|VFX/)) c.add('motion_design');
  if (has(/回転し続け|ループ/)) c.add('loop_animation');
  if (has(/セルルック|トゥーン/)) c.add('cell_look');
  if (has(/アドオン/)) c.add('addon_usage');
  if (has(/フォトリアル|リアルな|リアルに|質感/)) c.add('photorealistic');
  if (has(/ドット絵|コンポジ/)) c.add('compositing');
  return [...c].slice(0, 4);
}

function levels(t) {
  if (/間違い|挫折|あるある|メイキング|レビュー|教科書|初期設定|無駄|Tips|まずやるべき|リリースしました/.test(t)) {
    return ['beginner'];
  }
  if (/アニメーション|リギング|物理演算|エフェクト|VFX|ノード|UV展開|質感|完全講座/.test(t)) {
    return ['beginner', 'intermediate'];
  }
  return ['beginner_zero', 'beginner'];
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
    creator: '3D Bibi',
    language: 'ja',
    level: levels(v.title),
    categories: categories(v.title),
    goals: [],
    duration: durLabel(v.dur),
    recommendedOrder: null,
    summary: `${core}。Blender初心者向けに3DBibiが丁寧に実演解説。機械音痴でもゼロから3DCG制作を学べます。`,
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
console.log(`Created ${created} tutorial files (3DBibi).`);
