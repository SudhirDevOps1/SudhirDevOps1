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
 *   4. weight budget: <= 15KB per asset (art, not payload)
 *   5. no <script>, no external URLs, no base64 blobs, no raster <image>
 *   6. any animated asset honours prefers-reduced-motion
 *
 * Exits 1 on the first failing category so the health workflow goes red.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'assets';
const MAX_KB = 15;
const ALLOW_OVER_BUDGET = new Set([]); // nothing is allowed to bloat silently

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

  if (kb > MAX_KB && !ALLOW_OVER_BUDGET.has(file)) {
    problems.push(`${kb.toFixed(1)}KB exceeds the ${MAX_KB}KB budget`);
  }

  problems.push(...parseErrors(source));

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
  if (/<image\b/i.test(source)) problems.push('contains a raster <image>');
  if (/base64,/i.test(source)) problems.push('contains a base64 blob');
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
console.log(`\n${results.length - failed.length}/${results.length} SVG assets pass · ${totalKb.toFixed(1)}KB total`);

if (failed.length > 0) {
  console.error(`::error::${failed.length} of ${results.length} SVG assets failed the quality gate.`);
  process.exit(1);
}
