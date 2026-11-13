#!/usr/bin/env node
/**
 * check-readme-health.mjs — verifies every image on the profile README, live.
 *
 * Checked:
 *   1. every README image URL — HTTP 200, image content type, real byte size,
 *      and no "error card" strings inside SVG responses
 *   2. every README link — no 404/410, no soft-404, bot-blocking is tolerated
 *   3. assets/streak-buddy.svg — it must exist, show a non-zero streak, and
 *      carry an "updated" stamp no older than a few days, which proves the
 *      daily stats job is still running
 *
 * Writes .github/health/latest.json + a job summary table, and exits 1 when
 * something is actually broken so the workflow badge goes red.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const README = 'README.md';
const REPORT = '.github/health/latest.json';
const STREAK_SVG = 'assets/streak-buddy.svg';
const SPOTLIGHT_SVG = 'assets/repo-spotlight.svg';
const DEV_ID_SVG = 'assets/dev-id.svg';
const BLUEPRINT_SVG = 'assets/projects-blueprint.svg';
const BUILD_LOG_SVG = 'assets/build-log.svg';
const CONCURRENCY = 8;
const ATTEMPTS = 3;
// GitHub's own HTML pages answer 502/504 under load often enough that a single
// bad second must never be reported as a dead link. Transient failures get a
// longer ladder before they are allowed to turn the profile red.
const RETRYABLE_ATTEMPTS = 5;
const RETRYABLE_BACKOFF_MS = 2500;
const MIN_BYTES = 200;
// The daily stats job rewrites the streak card, so it should never be older
// than a couple of days. Anything beyond this means the job silently stopped.
const MAX_STREAK_AGE_DAYS = 3;

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

// Every clickable link on the page: HTML anchors plus markdown inline links.
function extractLinkUrls(markdown, imageUrls) {
  const images = new Set(imageUrls);
  const urls = new Set();
  for (const match of markdown.matchAll(/<a[^>]+href="(https?:\/\/[^"]+)"/g)) {
    if (!images.has(match[1])) urls.add(match[1]);
  }
  for (const match of markdown.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
    if (!images.has(match[1])) urls.add(match[1]);
  }
  return [...urls];
}

// Statuses that mean "a bot was blocked", not "the link is dead".
const BOT_BLOCKED = new Set([401, 403, 405, 429, 999]);

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

  if (!res.ok) return { ok: false, reason: `HTTP ${res.status}`, retryable: res.status >= 500 };
  if (!isImage) return { ok: false, reason: `not an image (${type || 'unknown'})` };
  if (body.length < MIN_BYTES) return { ok: false, reason: `body too small (${body.length} bytes)` };

  const marker = ERROR_MARKERS.find((m) => body.includes(m));
  if (marker) return { ok: false, reason: `error card: "${marker}"`, retryable: true };

  return { ok: true, bytes: body.length, type: type || 'svg' };
}

async function checkWithRetry(url) {
  let last = { ok: false, reason: 'never attempted', retryable: true };
  for (let attempt = 1; attempt <= RETRYABLE_ATTEMPTS; attempt++) {
    try {
      last = await checkOnce(url);
      if (last.ok) return last;
    } catch (error) {
      last = {
        ok: false,
        reason: error.name === 'TimeoutError' ? 'timeout' : String(error.message).slice(0, 90),
        retryable: true,
      };
    }
    const budget = last.retryable ? RETRYABLE_ATTEMPTS : ATTEMPTS;
    if (attempt >= budget) break;
    if (attempt < budget) await sleep(RETRYABLE_BACKOFF_MS * attempt);
  }
  return last;
}

async function checkLinkOnce(url) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SudhirDevOps1-profile-health)',
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(25_000),
      redirect: 'follow',
    });
  } catch (error) {
    return {
      ok: false,
      reason: error.name === 'TimeoutError' ? 'timeout' : String(error.message).slice(0, 90),
      retryable: true,
    };
  }

  if (res.status === 404 || res.status === 410) return { ok: false, reason: `HTTP ${res.status} (dead link)` };
  if (BOT_BLOCKED.has(res.status)) return { ok: true, status: res.status, skipped: 'bot-blocked' };
  if (res.status >= 500) return { ok: false, reason: `HTTP ${res.status} (server error)`, retryable: true };
  if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

  // A soft 404: the host answers 200 but the page says the target is gone.
  try {
    const body = await res.text();
    if (res.url.includes('github.com') && /Page not found/i.test(body)) {
      return { ok: false, reason: 'GitHub page not found (soft 404)' };
    }
  } catch {
    // Body is irrelevant when the status already told us the answer.
  }

  return { ok: true, status: res.status };
}

async function checkLinkWithRetry(url) {
  let last = { ok: false, reason: 'never attempted', retryable: true };
  for (let attempt = 1; attempt <= RETRYABLE_ATTEMPTS; attempt++) {
    last = await checkLinkOnce(url);
    if (last.ok) return last;
    const budget = last.retryable ? RETRYABLE_ATTEMPTS : ATTEMPTS;
    if (attempt >= budget) break;
    await sleep(RETRYABLE_BACKOFF_MS * attempt);
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

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

// The streak card is generated by scripts/update-streak.mjs inside the daily
// stats job. Checking its own timestamp is how we notice that job quietly died
// — a card that still renders but is a week old is a lie, not a success.
function checkStreakCard() {
  let svg;
  try {
    svg = readFileSync(STREAK_SVG, 'utf8');
  } catch {
    return { ok: false, reason: `${STREAK_SVG} is missing` };
  }

  const stamp = svg.match(/updated (\d{2}) ([A-Za-z]{3}) (\d{4})/);
  const current = svg.match(/<text class="t num" x="30" y="122">(\d+)<\/text>/);
  if (!stamp) return { ok: false, reason: 'no "updated <date>" stamp in the card' };
  if (!current) return { ok: false, reason: 'no CURRENT streak value in the card' };

  const streakDays = Number(current[1]);
  if (streakDays <= 0) return { ok: false, reason: 'card shows a zero-day streak' };

  const [, day, mon, year] = stamp;
  const month = MONTHS[mon.toLowerCase()];
  if (month === undefined) return { ok: false, reason: `unreadable month "${mon}" in the card` };

  const drawn = Date.UTC(Number(year), month, Number(day));
  const ageDays = Math.max(0, Math.floor((Date.now() - drawn) / 86_400_000));
  if (ageDays > MAX_STREAK_AGE_DAYS) {
    return { ok: false, reason: `card is ${ageDays} days old (limit ${MAX_STREAK_AGE_DAYS})` };
  }

  return { ok: true, updated: `${day} ${mon} ${year}`, ageDays, streakDays };
}

// Same idea for the generated cards: if the daily stats job stops running, a
// card keeps rendering last week's numbers — a quiet lie. Freshness is the only
// proof that what it shows is still true.
function checkGeneratedCard(file) {
  let svg;
  try {
    svg = readFileSync(file, 'utf8');
  } catch {
    return { ok: false, reason: `${file} is missing` };
  }

  const stamp = svg.match(/generated (\d{2}) ([A-Za-z]{3}) (\d{4})/i);
  if (!stamp) return { ok: false, reason: 'no "generated <date>" stamp in the card' };

  const [, day, mon, year] = stamp;
  const month = MONTHS[mon.toLowerCase()];
  if (month === undefined) return { ok: false, reason: `unreadable month "${mon}" in the card` };

  const drawn = Date.UTC(Number(year), month, Number(day));
  const ageDays = Math.max(0, Math.floor((Date.now() - drawn) / 86_400_000));
  if (ageDays > MAX_STREAK_AGE_DAYS) {
    return { ok: false, reason: `card is ${ageDays} days old (limit ${MAX_STREAK_AGE_DAYS})` };
  }

  return { ok: true, updated: `${day} ${mon} ${year}`, ageDays, svg };
}

function checkSpotlightCard() {
  const result = checkGeneratedCard(SPOTLIGHT_SVG);
  if (!result.ok) return result;

  const stars = [...result.svg.matchAll(/★ ([\d,]+)/g)]
    .map((m) => Number(m[1].replace(/,/g, '')))
    .reduce((sum, n) => sum + n, 0);

  return { ok: true, updated: result.updated, ageDays: result.ageDays, stars };
}

function checkDevIdCard() {
  const result = checkGeneratedCard(DEV_ID_SVG);
  if (!result.ok) return result;
  return { ok: true, updated: result.updated, ageDays: result.ageDays };
}

function checkBlueprintCard() {
  const result = checkGeneratedCard(BLUEPRINT_SVG);
  if (!result.ok) return result;
  return { ok: true, updated: result.updated, ageDays: result.ageDays };
}

function checkBuildLogCard() {
  const result = checkGeneratedCard(BUILD_LOG_SVG);
  if (!result.ok) return result;
  return { ok: true, updated: result.updated, ageDays: result.ageDays };
}

async function main() {
  const markdown = readFileSync(README, 'utf8');
  const urls = extractImageUrls(markdown);
  const links = extractLinkUrls(markdown, urls);

  if (urls.length === 0) throw new Error('No image URLs found in README.md');

  console.log(`Checking ${urls.length} image URLs and ${links.length} profile links from README.md ...`);

  const results = await runPool(
    urls,
    async (url) => ({ url, ...(await checkWithRetry(url)) }),
    CONCURRENCY
  );

  const linkResults = await runPool(
    links,
    async (url) => ({ url, ...(await checkLinkWithRetry(url)) }),
    4
  );

  const failed = results.filter((r) => !r.ok);
  const failedLinks = linkResults.filter((r) => !r.ok);
  const streak = checkStreakCard();
  const spotlight = checkSpotlightCard();
  const devId = checkDevIdCard();
  const blueprint = checkBlueprintCard();
  const buildLog = checkBuildLogCard();
  const passed = results.length - failed.length;
  const passedLinks = linkResults.length - failedLinks.length;

  const report = {
    checkedAt: new Date().toISOString(),
    total: results.length,
    passed,
    failed: failed.length,
    failures: failed.map((f) => ({ url: f.url, reason: f.reason })),
    links: {
      total: linkResults.length,
      passed: passedLinks,
      failed: failedLinks.length,
      failures: failedLinks.map((f) => ({ url: f.url, reason: f.reason })),
      results: linkResults,
    },
    streak,
    spotlight,
    devId,
    blueprint,
    buildLog,
    results,
  };

  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  for (const r of results) {
    console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.ok ? String(r.bytes).padStart(7) : '      -'}  ${r.url}`);
  }
  for (const r of linkResults) {
    console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${String(r.status ?? '-').padStart(7)}  ${r.url}`);
  }
  console.log(
    `${streak.ok ? 'OK  ' : 'FAIL'} ${String(`age ${streak.ageDays ?? '-'}d`).padStart(7)}  ` +
      `${STREAK_SVG} (${streak.ok ? streak.updated : streak.reason})`
  );
  console.log(
    `${spotlight.ok ? 'OK  ' : 'FAIL'} ${String(`age ${spotlight.ageDays ?? '-'}d`).padStart(7)}  ` +
      `${SPOTLIGHT_SVG} (${spotlight.ok ? `${spotlight.updated} · ${spotlight.stars}★` : spotlight.reason})`
  );
  console.log(
    `${devId.ok ? 'OK  ' : 'FAIL'} ${String(`age ${devId.ageDays ?? '-'}d`).padStart(7)}  ` +
      `${DEV_ID_SVG} (${devId.ok ? devId.updated : devId.reason})`
  );
  console.log(
    `${blueprint.ok ? 'OK  ' : 'FAIL'} ${String(`age ${blueprint.ageDays ?? '-'}d`).padStart(7)}  ` +
      `${BLUEPRINT_SVG} (${blueprint.ok ? blueprint.updated : blueprint.reason})`
  );
  console.log(
    `${buildLog.ok ? 'OK  ' : 'FAIL'} ${String(`age ${buildLog.ageDays ?? '-'}d`).padStart(7)}  ` +
      `${BUILD_LOG_SVG} (${buildLog.ok ? buildLog.updated : buildLog.reason})`
  );

  const rows = failed.map((f) => `| ❌ | \`${f.url.slice(0, 110)}\` | ${f.reason} |`);
  const linkRows = failedLinks.map((f) => `| ❌ | \`${f.url.slice(0, 110)}\` | ${f.reason} |`);
  const streakRow = streak.ok ? [] : [`| ❌ | \`${STREAK_SVG}\` | ${streak.reason} |`];
  const spotlightRow = spotlight.ok ? [] : [`| ❌ | \`${SPOTLIGHT_SVG}\` | ${spotlight.reason} |`];
  const devIdRow = devId.ok ? [] : [`| ❌ | \`${DEV_ID_SVG}\` | ${devId.reason} |`];
  const blueprintRow = blueprint.ok ? [] : [`| ❌ | \`${BLUEPRINT_SVG}\` | ${blueprint.reason} |`];
  const buildLogRow = buildLog.ok ? [] : [`| ❌ | \`${BUILD_LOG_SVG}\` | ${buildLog.reason} |`];
  const summary = [
    '## 🩺 README health check',
    '',
    `**${passed}/${results.length} images OK** — ${failed.length} failure(s).`,
    `**${passedLinks}/${linkResults.length} links OK** — ${failedLinks.length} failure(s).`,
    streak.ok
      ? `**Streak card** — drawn ${streak.updated}, ${streak.ageDays} day(s) old, current streak ${streak.streakDays} day(s).`
      : `**Streak card FAILED** — ${streak.reason}.`,
    spotlight.ok
      ? `**Repo spotlight** — generated ${spotlight.updated}, ${spotlight.ageDays} day(s) old, ${spotlight.stars}★ across the top 3.`
      : `**Repo spotlight FAILED** — ${spotlight.reason}.`,
    devId.ok
      ? `**Developer ID** — generated ${devId.updated}, ${devId.ageDays} day(s) old.`
      : `**Developer ID FAILED** — ${devId.reason}.`,
    blueprint.ok
      ? `**Mission blueprint** — generated ${blueprint.updated}, ${blueprint.ageDays} day(s) old.`
      : `**Mission blueprint FAILED** — ${blueprint.reason}.`,
    buildLog.ok
      ? `**Ship log** — generated ${buildLog.updated}, ${buildLog.ageDays} day(s) old.`
      : `**Ship log FAILED** — ${buildLog.reason}.`,
    '',
    ...(failed.length || failedLinks.length || !streak.ok || !spotlight.ok || !devId.ok || !blueprint.ok || !buildLog.ok
      ? ['| Status | Target | Reason |', '|:--|:--|:--|', ...rows, ...linkRows, ...streakRow, ...spotlightRow, ...devIdRow, ...blueprintRow, ...buildLogRow]
      : ['✅ Every image, every link and all five generated cards on the profile are live.']),
  ].join('\n');

  console.log(`\n${summary}`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import('node:fs');
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  }

  if (failed.length > 0 || failedLinks.length > 0 || !streak.ok || !spotlight.ok || !devId.ok || !blueprint.ok || !buildLog.ok) {
    if (failed.length > 0) {
      console.error(`::error::${failed.length} of ${results.length} README images are broken.`);
    }
    if (failedLinks.length > 0) {
      console.error(`::error::${failedLinks.length} of ${linkResults.length} README links are broken.`);
    }
    if (!streak.ok) {
      console.error(`::error::Streak card is not live: ${streak.reason}.`);
    }
    if (!spotlight.ok) {
      console.error(`::error::Repo spotlight is not live: ${spotlight.reason}.`);
    }
    if (!devId.ok) {
      console.error(`::error::Developer ID card is not live: ${devId.reason}.`);
    }
    if (!blueprint.ok) {
      console.error(`::error::Mission blueprint card is not live: ${blueprint.reason}.`);
    }
    if (!buildLog.ok) {
      console.error(`::error::Ship log card is not live: ${buildLog.reason}.`);
    }
    console.error('See .github/health/latest.json for the full report.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`::error::${error.message}`);
  process.exit(1);
});
