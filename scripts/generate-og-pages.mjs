#!/usr/bin/env node
// Build-time per-page OG images for courses / addons / routes.
// Runs LOCALLY (needs Yu Gothic for JP); PNGs are committed like og-default.png.
// Re-run after adding/renaming content: `node scripts/generate-og-pages.mjs`
import sharp from 'sharp';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'og');
await mkdir(OUT_DIR, { recursive: true });

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Approx visual width in em units (CJK ~1.0, latin ~0.55).
const charW = (c) => (/[ -~]/.test(c) ? 0.55 : 1.0);

function wrap(text, maxUnits, maxLines) {
  const tokens = text.split(/(\s+)/);
  const lines = [];
  let line = '', w = 0;
  const pushLine = () => { lines.push(line); line = ''; w = 0; };
  for (const tok of tokens) {
    if (tok === '') continue;
    let tw = 0; for (const ch of tok) tw += charW(ch);
    if (/^\s+$/.test(tok)) { if (line) { line += ' '; w += 0.55; } continue; }
    if (w + tw <= maxUnits) { line += tok; w += tw; continue; }
    // token doesn't fit on current line
    if (line) pushLine();
    if (lines.length >= maxLines) break;
    if (tw <= maxUnits) { line = tok; w = tw; }
    else { // hard-break long token char by char
      for (const ch of tok) {
        const cw = charW(ch);
        if (w + cw > maxUnits) { pushLine(); if (lines.length >= maxLines) break; }
        line += ch; w += cw;
      }
    }
  }
  if (line && lines.length < maxLines) pushLine();
  if (lines.length > maxLines) lines.length = maxLines;
  // ellipsize last line if text overflowed
  const used = lines.join('').length;
  if (used < text.replace(/\s+/g, ' ').replace(/\s/g, '').length && lines.length) {
    let last = lines[lines.length - 1];
    while (last && [...last].reduce((a, c) => a + charW(c), 0) > maxUnits - 1) last = [...last].slice(0, -1).join('');
    lines[lines.length - 1] = last.replace(/\s+$/, '') + '…';
  }
  return lines;
}

const TYPES = {
  course: { label: '有料講座', accent: '#3b82f6' },
  addon: { label: 'アドオン', accent: '#22c55e' },
  route: { label: '学習ルート', accent: '#f97316' },
};

function svgFor({ type, title, sub }) {
  const { label, accent } = TYPES[type];
  // font size by title length (CJK-equivalent units)
  const tlen = [...title].reduce((a, c) => a + charW(c), 0);
  const fs = tlen <= 14 ? 76 : tlen <= 24 ? 64 : tlen <= 38 ? 52 : tlen <= 56 ? 44 : 38;
  const maxUnits = 960 / fs;
  const lines = wrap(title, maxUnits, 4);
  const lineH = fs * 1.22;
  const blockH = lines.length * lineH;
  let ty = 315 - blockH / 2 + fs * 0.82; // vertically center around y=315
  const titleTspans = lines
    .map((ln) => { const t = `<text x="120" y="${Math.round(ty)}" fill="#ffffff" font-size="${fs}" font-weight="900" class="jp">${esc(ln)}</text>`; ty += lineH; return t; })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8"/><stop offset="50%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#0c1d3d"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="55%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.16)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <style>.jp{font-family:"Yu Gothic","YuGothic","Hiragino Sans","Meiryo",sans-serif;}.num{font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;}</style>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1"><line x1="0" y1="105" x2="1200" y2="105"/><line x1="0" y1="525" x2="1200" y2="525"/></g>

  <!-- Compass mark -->
  <g transform="translate(120,72) scale(0.62)">
    <circle cx="55" cy="55" r="50" fill="none" stroke="#ffffff" stroke-width="4"/>
    <polygon points="55,15 64,55 55,55 46,55" fill="#f97316"/>
    <polygon points="55,95 64,55 55,55 46,55" fill="#ffffff"/>
    <circle cx="55" cy="55" r="4" fill="#ffffff"/>
  </g>
  <text x="185" y="112" fill="rgba(255,255,255,0.75)" font-size="26" font-weight="600" class="jp" letter-spacing="3">Blenderの道しるべ</text>

  <!-- Type badge -->
  <g transform="translate(120,150)">
    <rect x="0" y="0" width="${label.length * 30 + 56}" height="50" rx="25" fill="${accent}"/>
    <text x="${(label.length * 30 + 56) / 2}" y="33" fill="#ffffff" font-size="24" font-weight="700" class="jp" text-anchor="middle">${label}</text>
  </g>

  <!-- Title -->
  ${titleTspans}

  <!-- Sub line -->
  ${sub ? `<text x="120" y="500" fill="#bfdbfe" font-size="28" font-weight="500" class="jp">${esc(sub)}</text>` : ''}

  <line x1="120" y1="555" x2="1080" y2="555" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <text x="120" y="595" fill="#93c5fd" font-size="24" font-weight="500" class="num">blender-michishirube.com</text>
  <rect x="0" y="0" width="1200" height="6" fill="${accent}"/>
</svg>`;
}

async function loadJson(subdir) {
  const dir = join(ROOT, 'src', 'content', subdir);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  const out = [];
  for (const f of files) out.push({ id: f.replace(/\.json$/, ''), ...JSON.parse(await readFile(join(dir, f), 'utf8')) });
  return out;
}
async function loadRoutes() {
  const dir = join(ROOT, 'src', 'content', 'routes');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  const out = [];
  for (const f of files) {
    const raw = await readFile(join(dir, f), 'utf8');
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const get = (k) => (fm && fm[1].match(new RegExp(`^${k}:\\s*"?(.+?)"?\\s*$`, 'm')) || [])[1] || '';
    out.push({ id: f.replace(/\.md$/, ''), title: get('title'), targetLevel: get('targetLevel') });
  }
  return out;
}

let n = 0;
async function emit(type, id, title, sub) {
  const svg = svgFor({ type, title: title || id, sub });
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(1200, 630, { fit: 'fill' })
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(join(OUT_DIR, `${type}-${id}.png`));
  n++;
}

for (const c of await loadJson('courses')) await emit('course', c.id, c.title, c.creator);
for (const a of await loadJson('addons')) await emit('addon', a.id, a.title, a.creator);
for (const r of await loadRoutes()) await emit('route', r.id, r.title, r.targetLevel ? `対象: ${r.targetLevel}` : '');
console.log(`Generated ${n} OG images -> public/og/`);
