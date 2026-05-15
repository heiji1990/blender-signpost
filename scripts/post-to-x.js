#!/usr/bin/env node
import { TwitterApi } from 'twitter-api-v2';
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SITE_URL = 'https://blender-michishirube.com';

const auth = {
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
};

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

function assertAuth() {
  const missing = Object.entries(auth)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error('Missing env vars:', missing.join(', '));
    console.error('Required: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET');
    process.exit(1);
  }
}

async function loadCollection(subdir, type) {
  const dir = join(REPO_ROOT, 'src', 'content', subdir);
  const files = await readdir(dir);
  const items = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const id = file.replace(/\.json$/, '');
    const data = JSON.parse(await readFile(join(dir, file), 'utf-8'));
    if (data.status && data.status !== 'active') continue;
    items.push({ id, type, ...data });
  }
  return items;
}

function detailPath(item) {
  switch (item.type) {
    case 'tutorial': return `/tutorials/${item.id}/`;
    case 'course': return `/courses/${item.id}/`;
    case 'addon': return `/addons/${item.id}/`;
    default: return '/';
  }
}

function typeLabel(type) {
  switch (type) {
    case 'tutorial': return { emoji: '📺', label: 'チュートリアル' };
    case 'course': return { emoji: '🎓', label: '有料講座' };
    case 'addon': return { emoji: '🔧', label: 'アドオン' };
    default: return { emoji: '📚', label: 'コンテンツ' };
  }
}

function truncate(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function formatPost(item) {
  const url = `${SITE_URL}${detailPath(item)}`;
  const { emoji, label } = typeLabel(item.type);
  const lines = [
    `${emoji} 今日のおすすめ${label}`,
    '',
    `「${truncate(item.title, 55)}」`,
  ];
  if (item.creator) lines.push(`👤 ${item.creator}`);
  if (item.summary) {
    lines.push('');
    lines.push(truncate(item.summary, 70));
  }
  lines.push('');
  lines.push('👇 詳しくはこちら');
  lines.push(url);
  lines.push('');
  lines.push('#Blender #Blender学習 #3DCG');
  return lines.join('\n');
}

async function buildTestPost() {
  const stamp = new Date().toISOString();
  return [
    '🧪 テスト投稿 — Blenderの道しるべ自動投稿システム疎通確認',
    '',
    `稼働開始: ${stamp}`,
    SITE_URL,
    '',
    '#Blender #Blender学習',
  ].join('\n');
}

function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}

const intersects = (a = [], b = []) => a.some((x) => b.includes(x));

function matchContent(pain, { tutorials, courses, addons }) {
  const m = pain.match || {};
  let base;
  if (m.type === 'tutorial') base = tutorials;
  else if (m.type === 'course') base = courses;
  else if (m.type === 'addon') base = addons;
  else base = [...tutorials, ...courses];

  let pool = base.filter((it) => intersects(it.categories, m.categories || []));
  if (pool.length === 0) pool = base; // relax category

  const kws = (pain.keywords || []).map((k) => k.toLowerCase());
  const score = (it) => {
    const title = (it.title || '').toLowerCase();
    let s = 0;
    s += (it.categories || []).filter((c) => (m.categories || []).includes(c)).length; // category overlap
    if (m.level && intersects(it.level, m.level)) s += 2;                                // level fit
    s += kws.filter((k) => title.includes(k)).length * 4;                               // keyword-in-title (strong)
    if (it.language === 'ja') s += 1;                                                    // JP audience preference
    return s;
  };

  let best = -1;
  const scored = pool.map((it) => { const v = score(it); if (v > best) best = v; return { it, v }; });
  const top = scored.filter((x) => x.v === best).map((x) => x.it);
  return top.length ? top[Math.floor(Math.random() * top.length)] : null;
}

function buildPainpointPost(pain, item) {
  const url = `${SITE_URL}${detailPath(item)}`;
  const reasons = (pain.reasons || []).slice(0, 2).map((r) => `✓ ${r}`);
  const lines = [
    '🎯 今週のBlenderお悩み',
    '',
    `「${pain.pain}」`,
    '',
    `💡 ${pain.advice}`,
    '',
    `📌 これが効く →`,
    `「${truncate(item.title, 42)}」（${item.creator}）`,
    ...reasons,
    '',
    '🔗 詳しくはこちら',
    url,
    '',
    '#Blender #Blender学習 #3DCG',
  ];
  return lines.join('\n');
}

async function main() {
  const mode = process.argv[2] || 'test';

  let text;
  if (mode === 'test') {
    text = await buildTestPost();
  } else if (mode === 'painpoint') {
    const { items } = JSON.parse(
      await readFile(join(REPO_ROOT, 'scripts', 'painpoints.json'), 'utf-8')
    );
    const pain = items[isoWeek() % items.length];
    const tutorials = await loadCollection('tutorials', 'tutorial');
    const courses = await loadCollection('courses', 'course');
    const addons = await loadCollection('addons', 'addon');
    const item = matchContent(pain, { tutorials, courses, addons });
    if (!item) {
      console.error(`No content matched painpoint: ${pain.id}`);
      process.exit(1);
    }
    console.log(`Painpoint [${pain.id}] -> [${item.type}/${item.id}]: ${item.title}`);
    text = buildPainpointPost(pain, item);
  } else {
    const tutorials = await loadCollection('tutorials', 'tutorial');
    const courses = await loadCollection('courses', 'course');
    const addons = await loadCollection('addons', 'addon');

    let pool;
    if (mode === 'tutorial') pool = tutorials;
    else if (mode === 'course') pool = courses;
    else if (mode === 'addon') pool = addons;
    else if (mode === 'random') pool = [...tutorials, ...courses, ...addons];
    else {
      console.error(`Unknown mode: ${mode}`);
      console.error('Valid modes: test | painpoint | random | tutorial | course | addon');
      process.exit(1);
    }

    if (pool.length === 0) {
      console.error(`No active items in pool: ${mode}`);
      process.exit(1);
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    console.log(`Picked [${pick.type}/${pick.id}]: ${pick.title}`);
    text = formatPost(pick);
  }

  console.log('--- Post content ---');
  console.log(text);
  console.log('--- end ---');
  console.log(`Length: ${text.length} chars`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Skipped actual posting.');
    return;
  }

  assertAuth();
  const client = new TwitterApi(auth);
  const res = await client.v2.tweet(text);
  console.log('Posted:', res.data);
}

main().catch((err) => {
  console.error('Error:', err);
  if (err.data) console.error('API response:', JSON.stringify(err.data, null, 2));
  process.exit(1);
});
