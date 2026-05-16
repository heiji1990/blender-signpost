#!/usr/bin/env node
// Weekly new-upload detector for the 5 tracked YouTube channels.
// Generates draft tutorial JSON for genuinely-new uploads -> opened as a PR by CI.
// Dedup by known YouTube IDs. Ducky was imported as a filtered subset, so for it
// we additionally require a recent upload_date to avoid re-adding the old backlog.
//
// Usage: node scripts/detect-new-content.mjs [--dry]
//   Reads TEMP/recent_<key>.txt lines "id|YYYYMMDD|title|duration" (yt-dlp, CI provides them).
//   --dry : print what would be created, write nothing.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TUT_DIR = join(__dirname, '..', 'src', 'content', 'tutorials');
const DRY = process.argv.includes('--dry');
const TMP = process.env.TEMP || process.env.TMPDIR || '/tmp';

const CHANNELS = {
  '3dbibi':   { creator: '3D Bibi',   lang: 'ja',   fullyImported: true },
  'ducky':    { creator: 'Ducky 3D',  lang: 'en',   fullyImported: false }, // subset import -> need date window
  'redblueen':{ creator: 'redblueen', lang: 'en',   fullyImported: true },
  'extra3d':  { creator: 'Extra 3d',  lang: 'auto', fullyImported: true },
  'adiidiin': { creator: 'adiidiin',  lang: 'auto', fullyImported: true },
};
const DUCKY_MAX_AGE_DAYS = 21;

const isJa = (t) => /[぀-ヿ㐀-鿿]/.test(t);
function durLabel(s) {
  const min = Math.max(1, Math.round((+s || 0) / 60));
  if (min >= 60) { const h = Math.floor(min / 60), r = min % 60; return r ? `${h}時間${r}分` : `${h}時間`; }
  return `${min}分`;
}
function blenderVersion(t) { const m = (t || '').match(/blender\s?(\d\.\d{1,2})/i); return m ? m[1] : null; }

function classify(key, title) {
  const t = (title || '').toLowerCase();
  const has = (re) => re.test(title || '');
  let level, cats;
  if (key === '3dbibi') {
    level = /アニメーション|リギング|物理|ノード|UV|質感/.test(title) ? ['beginner', 'intermediate'] : ['beginner_zero', 'beginner'];
    cats = new Set(['beginner']);
    if (has(/モデリング|作ろう|作り方/)) cats.add('modeling');
    if (has(/アニメ|モーション/)) cats.add('character_animation');
    if (has(/アドオン/)) cats.add('addon_usage');
  } else if (key === 'ducky') {
    level = /\beasy\b|beginner|basics/i.test(t) ? ['beginner', 'intermediate'] : ['intermediate'];
    cats = new Set(['motion_design']);
    if (/geometry node|geo node/i.test(t)) cats.add('geometry_nodes');
    if (/\bloop/i.test(t)) cats.add('loop_animation');
    if (/logo/i.test(t)) cats.add('logo_animation');
    if (/subdivide|model/i.test(t)) cats.add('modeling');
  } else if (key === 'redblueen') {
    level = /breakdown|shader/i.test(t) ? ['intermediate', 'advanced'] : ['intermediate'];
    cats = new Set(['cell_look', 'motion_design']);
  } else if (key === 'extra3d') {
    level = /quick|easy|beginner|入門|初心者/i.test(t) ? ['beginner', 'intermediate']
          : /ultimate|master|pro|advanced|究極/i.test(t) ? ['intermediate', 'advanced'] : ['intermediate'];
    cats = new Set();
    if (has(/照明|ライト|light/i)) cats.add('lighting');
    if (has(/composit|cinematic|シネマ|映画/i)) cats.add('compositing');
    if (has(/photoreal|realistic|リアル|render|レンダ|texture|テクスチャ|shader|material/i)) cats.add('photorealistic');
    if (cats.size === 0) cats.add('photorealistic');
  } else { // adiidiin
    level = /easy|simple|簡単|step by step/i.test(t) ? ['beginner', 'intermediate'] : ['intermediate'];
    cats = new Set(['modeling']);
    if (/toon|cel|sketch|stylized|シェーダー|トゥーン/i.test(title || '')) cats.add('cell_look');
  }
  return { level, categories: [...cats].slice(0, 4) };
}

// next tNNN
const existing = readdirSync(TUT_DIR).filter((f) => f.endsWith('.json'));
let n = Math.max(...existing.map((f) => +f.slice(1, 4))) + 1;
const known = new Set();
for (const f of existing) {
  const j = JSON.parse(readFileSync(join(TUT_DIR, f), 'utf8'));
  const m = (j.url || '').match(/[?&]v=([\w-]{11})/);
  if (m) known.add(m[1]);
}

const now = Date.now();
const created = [];
for (const [key, cfg] of Object.entries(CHANNELS)) {
  const file = join(TMP, `recent_${key}.txt`);
  if (!existsSync(file)) continue;
  const lines = readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
  for (const ln of lines) {
    const [id, d, title, dur] = ln.split('|');
    if (!id || known.has(id)) continue;
    let publishedAt = null, ageDays = Infinity;
    if (/^\d{8}$/.test(d)) {
      publishedAt = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
      ageDays = (now - new Date(publishedAt).getTime()) / 86400000;
    }
    // Ducky: subset-imported -> only accept recent uploads (avoid old backlog mass-add)
    if (!cfg.fullyImported && !(ageDays <= DUCKY_MAX_AGE_DAYS)) continue;
    // fully-imported channels: unknown id = genuinely new; cap absurd backfill at 120d when dated
    if (cfg.fullyImported && publishedAt && ageDays > 120) continue;

    const language = cfg.lang === 'auto' ? (isJa(title) ? 'ja' : 'en') : cfg.lang;
    const { level, categories } = classify(key, title);
    const id4 = 't' + String(n++).padStart(3, '0');
    const rec = {
      type: 'tutorial', title, url: `https://www.youtube.com/watch?v=${id}`,
      platform: 'youtube', priceType: 'free', creator: cfg.creator, language,
      level, categories, goals: [], duration: durLabel(dur), recommendedOrder: null,
      summary: language === 'ja'
        ? `${title}。${cfg.creator}による最新Blender解説。`
        : `${title} — a recent Blender tutorial by ${cfg.creator}.`,
      comment: null, affiliateUrl: null, isAffiliate: false, isPr: false,
      updatedAt: new Date().toISOString().slice(0, 10),
      status: 'active', publishedAt, blenderVersion: blenderVersion(title),
    };
    if (!DRY) writeFileSync(join(TUT_DIR, `${id4}.json`), JSON.stringify(rec, null, 2) + '\n', 'utf8');
    created.push({ id: id4, key, publishedAt: publishedAt || '?', title });
  }
}

const summary = created.length
  ? created.map((c) => `- ${c.id} [${c.key} ${c.publishedAt}] ${c.title}`).join('\n')
  : '(no new uploads detected)';
console.log(`detected ${created.length} new`);
console.log(summary);
if (process.env.GITHUB_OUTPUT) {
  const fs = await import('node:fs');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `count=${created.length}\n`);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary<<EOF\n${summary}\nEOF\n`);
}
