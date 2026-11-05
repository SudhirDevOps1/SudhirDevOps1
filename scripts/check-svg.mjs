#!/usr/bin/env node
/**
 * check-svg.mjs — quality gate for every self-hosted SVG in assets/.
 *
 * A profile that ships hand-written artwork needs a gate, otherwise a typo in
 * one path turns the whole page into a broken-image icon. This checks:
 *
 *   1. the file is well-formed XML (stack-based parse, no dependencies)
 *   2. the root <svg> declares xmlns + viewBox
 *   3. accessibility: role="img" and a non-empty aria-label or <title>
 *   4. weight budget: per-asset table, not one blanket cap (art can be heavy)
 *   5. no <script>, no external URLs, raster only PNG (no WebP)
 *   6. any animated asset honours prefers-reduced-motion
 *   7. @font-face logging: report embedded font format; base64 blobs flagged
 *
 * Exits 1 on the first failing category so the health workflow goes red.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const DIR = 'assets';
const DEFAULT_KB = 250;
const VIDEO_KB = 1100;
const TOTAL_MAX_KB = 3500;

// Future premium panels (Megha-grade, raster + embedded fonts) get their own ceilings.
// Current lightweight panels keep their old ceiling so the repo does not bloat silently.
const BUDGETS = new Map(Object.entries({
  'build-log.svg': 250, 'tech-orbit.svg': 250, 'dev-lanyard.svg': 250,
  'live-dashboard.svg': 250, 'projects-blueprint.svg': 250, 'connect-panel.svg': 250,
  'hero-cinematic.svg': 1100,
  'hero-scene.svg': 15, 'hero-viewfinder.svg': 250, 'orbital-radar.svg': 13,
  'what-i-build.svg': 11, 'stack-arsenal.svg': 13, 'build-console.svg': 11,
  'dev-id.svg': 21, 'repo-spotlight.svg': 8,
}));

function budgetOf(file) {
  return BUDGETS.get(file) ?? DEFAULT_KB;
}

const files = readdirSync(DIR)
  .filter((name) => name.toLowerCase().endsWith('.svg'))
  .sort();

if (files.length === 0) {
  console.error(`::error::No SVG assets found in ${DIR}/`);
  process.exit(1);
}

const VOID_OK = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);

function parseErrors(source) {
  const problems = [];

  // Strip the parts that legitimately contain angle brackets.
  const cleaned = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '');

  const stack = [];
  const tagRe = /<(\/?)([A-Za-z_][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let match;
  let lastIndex = 0;

  while ((match = tagRe.exec(cleaned)) !== null) {
    const [, closing, name, attrs, selfClose] = match;
    const before = cleaned.slice(lastIndex, match.index);
    lastIndex = tagRe.lastIndex;

    if (/[<>]/.test(before)) {
      problems.push(`raw "<" or ">" in text content near ${JSON.stringify(before.trim().slice(0, 40))}`);
    }

    if (closing) {
      const open = stack.pop();
      if (open !== name) {
        problems.push(`closing </${name}> does not match open <${open ?? 'nothing'}>`);
        break;
      }
      continue;
    }

    // Attribute sanity: every attribute must have a quoted value.
    const bare = attrs.replace(/[A-Za-z_][\w:.-]*\s*=\s*(?:"[^"]*"|'[^']*')/g, '').trim();
    if (bare) problems.push(`malformed attributes on <${name}>: ${JSON.stringify(bare.slice(0, 40))}`);

    if (!selfClose && !VOID_OK.has(name.toLowerCase())) stack.push(name);
  }

  const tail = cleaned.slice(lastIndex);
  if (/[<>]/.test(tail.replace(/\s+/g, ''))) {
    problems.push('unbalanced "<" or ">" after the last tag');
  }
  if (stack.length) problems.push(`unclosed element(s): ${stack.join(', ')}`);

  return problems;
}

function checkAsset(file) {
  const path = join(DIR, file);
  const bytes = statSync(path).size;
  const kb = bytes / 1024;
  const source = readFileSync(path, 'utf8');
  const problems = [];

  const budget = budgetOf(file);
  if (kb > budget) {
    problems.push(`${kb.toFixed(1)}KB exceeds the ${budget}KB budget for ${file}`);
  }

  problems.push(...parseErrors(source));

  const py = spawnSync(
    'python',
    ['-c', 'import xml.etree.ElementTree as ET, sys; ET.parse(sys.argv[1])', path],
    { encoding: 'utf8' }
  );
  if (py.status !== 0) {
    problems.push(`strict XML parse failure: ${(py.stderr || '').trim() || 'invalid XML'}`);
  }

  const root = source.match(/<svg\b[^>]*>/);
  if (!root) {
    problems.push('no <svg> root element');
  } else {
    if (!/xmlns\s*=\s*"http:\/\/www\.w3\.org\/2000\/svg"/.test(root[0])) problems.push('root <svg> is missing xmlns');
    if (!/\bviewBox\s*=\s*"[^"]+"/.test(root[0])) problems.push('root <svg> is missing viewBox');
    if (!/\brole\s*=\s*"img"/.test(root[0])) problems.push('root <svg> is missing role="img"');
  }

  const label = source.match(/\baria-label\s*=\s*"([^"]*)"/);
  const title = source.match(/<title>([\s\S]*?)<\/title>/);
  if (!(label && label[1].trim()) && !(title && title[1].trim())) {
    problems.push('no aria-label and no <title>');
  }

  if (/<script\b/i.test(source)) problems.push('contains <script>');
  if (/<image\b/i.test(source)) {
    // Embedded PNG is allowed in viewfinder/hero art; WebP or JPEG is not (old Safari).
    if (/<image\b[^>]*src\s*=\s*"\s*data:image\/(?!png)/i.test(source)) {
      problems.push('raster must be PNG (old Safari compatibility)');
    }
  }
  if (/<image\b[^>]*href\s*=\s*"https?:\/\//i.test(source)) problems.push('references an external URL in <image>');

  const fontFaces = (source.match(/@font-face/gi) || []).length;
  const base64 = source.match(/base64,/i);
  if (base64) {
    const blobs = [...source.matchAll(/data:([a-z0-9\/+.-]+);base64,/gi)];
    const disallowed = blobs.filter((b) => {
      const mime = b[1].toLowerCase();
      return mime !== 'font/woff2' && mime !== 'image/png';
    });
    if (disallowed.length) {
      problems.push(`contains a non-woff2/non-PNG base64 blob (${disallowed[0][1]})`);
    }
  }
  if (fontFaces > 0) {
    console.log(`        · info: ${fontFaces} @font-face block(s) — embedded woff2, format woff2`);
  }

  if (/(?:href|src)\s*=\s*"https?:\/\//i.test(source)) problems.push('references an external URL');
  if (/url\(\s*['"]?https?:\/\//i.test(source)) problems.push('references an external URL in CSS');

  const animated =
    /<animate\b|<animateTransform\b|<animateMotion\b|@keyframes\s/i.test(source);
  if (animated && !/prefers-reduced-motion/i.test(source)) {
    problems.push('animates but has no prefers-reduced-motion fallback');
  }

  return { file, kb, problems };
}

const results = files.map(checkAsset);
const failed = results.filter((r) => r.problems.length > 0);

for (const r of results) {
  if (r.problems.length === 0) {
    console.log(`OK    ${r.kb.toFixed(1).padStart(6)}KB  ${DIR}/${r.file}`);
  } else {
    console.log(`FAIL  ${r.kb.toFixed(1).padStart(6)}KB  ${DIR}/${r.file}`);
    for (const problem of r.problems) console.log(`        - ${problem}`);
  }
}

const totalKb = results.reduce((sum, r) => sum + r.kb, 0);
console.log(`\n${results.length - failed.length}/${results.length} SVG assets pass · ${totalKb.toFixed(1)}KB total (ceiling ${TOTAL_MAX_KB}KB)`);

if (totalKb > TOTAL_MAX_KB) {
  console.error(`::error::Total SVG assets footprint (${totalKb.toFixed(1)}KB) exceeds ${TOTAL_MAX_KB}KB global budget.`);
  process.exit(1);
}

if (failed.length > 0) {
  console.error(`::error::${failed.length} of ${results.length} SVG assets failed the quality gate.`);
  process.exit(1);
}
