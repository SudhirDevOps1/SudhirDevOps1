#!/usr/bin/env node
/**
 * check-readme-health.mjs — verifies every image on the profile README, live.
 *
 * For each unique image URL in README.md it checks:
 *   1. HTTP 200
 *   2. an image content type (or SVG payload)
 *   3. a plausible byte size (a 14-byte body is a 404, not an image)
 *   4. no known "error card" strings inside SVG responses
 *
 * Writes .github/health/latest.json + a job summary table, and exits 1 when
 * something is actually broken so the workflow badge goes red.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const README = 'README.md';
const REPORT = '.github/health/latest.json';
const CONCURRENCY = 8;
const ATTEMPTS = 3;
const MIN_BYTES = 200;

// Real error cards served with HTTP 200 by popular README widget services.
const ERROR_MARKERS = [
  'Something went wrong',
  'Maximum retries exceeded',
  'Rate limit exceeded',
  'API rate limit exceeded',
  'You have exceeded a secondary rate limit',
  'Bad credentials',
  'Service Unavailable',
  'This service is temporarily unavailable',
  'GraphQL Error',
  'Could not fetch',
  'Unable to fetch data',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractImageUrls(markdown) {
  const urls = new Set();
  for (const match of markdown.matchAll(/(?:src|srcset)="(https:\/\/[^"\s]+)"/g)) {
    urls.add(match[1]);
  }
  return [...urls];
}

async function checkOnce(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SudhirDevOps1-profile-health', Accept: 'image/*,text/html;q=0.8,*/*;q=0.5' },
    signal: AbortSignal.timeout(30_000),
    redirect: 'follow',
  });

  const body = await res.text();
  const type = res.headers.get('content-type') || '';
  const looksSvg = body.trimStart().startsWith('<svg') || body.includes('<svg');
  const isImage = /^image\//i.test(type) || looksSvg;

  if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
  if (!isImage) return { ok: false, reason: `not an image (${type || 'unknown'})` };
  if (body.length < MIN_BYTES) return { ok: false, reason: `body too small (${body.length} bytes)` };

  const marker = ERROR_MARKERS.find((m) => body.includes(m));
  if (marker) return { ok: false, reason: `error card: "${marker}"` };

  return { ok: true, bytes: body.length, type: type || 'svg' };
}

async function checkWithRetry(url) {
  let last = { ok: false, reason: 'never attempted' };
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      last = await checkOnce(url);
      if (last.ok) return last;
    } catch (error) {
      last = { ok: false, reason: error.name === 'TimeoutError' ? 'timeout' : String(error.message).slice(0, 90) };
    }
    if (attempt < ATTEMPTS) await sleep(1500 * attempt);
  }
  return last;
}

async function runPool(urls, worker, size) {
  const results = new Array(urls.length);
  let cursor = 0;

  async function lane() {
    while (cursor < urls.length) {
      const index = cursor++;
      results[index] = await worker(urls[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(size, urls.length) }, lane));
  return results;
}

async function main() {
  const markdown = readFileSync(README, 'utf8');
  const urls = extractImageUrls(markdown);

  if (urls.length === 0) throw new Error('No image URLs found in README.md');

  console.log(`Checking ${urls.length} unique image URLs from README.md ...`);

  const results = await runPool(
    urls,
    async (url) => ({ url, ...(await checkWithRetry(url)) }),
    CONCURRENCY
  );

  const failed = results.filter((r) => !r.ok);
  const passed = results.length - failed.length;

  const report = {
    checkedAt: new Date().toISOString(),
    total: results.length,
    passed,
    failed: failed.length,
    failures: failed.map((f) => ({ url: f.url, reason: f.reason })),
    results,
  };

  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  for (const r of results) {
    console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.ok ? String(r.bytes).padStart(7) : '      -'}  ${r.url}`);
  }

  const rows = failed.map((f) => `| ❌ | \`${f.url.slice(0, 110)}\` | ${f.reason} |`);
  const summary = [
    '## 🩺 README health check',
    '',
    `**${passed}/${results.length} images OK** — ${failed.length} failure(s).`,
    '',
    ...(failed.length ? ['| Status | URL | Reason |', '|:--|:--|:--|', ...rows] : ['✅ Every image on the profile loaded with real content.']),
  ].join('\n');

  console.log(`\n${summary}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('node:fs');
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  }

  if (failed.length > 0) {
    console.error(`::error::${failed.length} of ${results.length} README images are broken. See .github/health/latest.json`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`::error::${error.message}`);
  process.exit(1);
});
