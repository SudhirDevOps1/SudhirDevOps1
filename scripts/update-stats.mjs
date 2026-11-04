#!/usr/bin/env node
/**
 * update-stats.mjs — refreshes every real number in README.md from the GitHub API.
 *
 * Nothing here is guessed or demo data:
 *   - user + repo numbers  -> GitHub REST API v3
 *   - commits / PRs / issues -> GitHub Search API
 *
 * The script only writes a section when every request it needs succeeded.
 * If the API looks suspicious (zero repos, zero commits) it aborts without
 * touching the README, so the profile can never show fake or broken numbers.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const README = 'README.md';
const SPOTLIGHT = 'assets/repo-spotlight.svg';
const API = 'https://api.github.com';
const OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'SudhirDevOps1';
const TOKEN = process.env.GITHUB_TOKEN || '';

const headers = {
  'User-Agent': `${OWNER}-profile-stats-bot`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, tries = 4) {
  let lastError = '';
  for (let attempt = 1; attempt <= tries; attempt++) {
    let res;
    try {
      res = await fetch(`${API}${path}`, { headers });
    } catch (error) {
      // Transient DNS / TLS / socket failures must not kill the whole run.
      lastError = `${path} -> network error: ${String(error.message || error).slice(0, 140)}`;
      if (attempt < tries) {
        await sleep(2000 * attempt);
        continue;
      }
      throw new Error(lastError);
    }

    if (res.ok) return res.json();

    const body = await res.text();
    lastError = `${path} -> HTTP ${res.status} ${body.slice(0, 160)}`;

    // 403/429 = rate limit, 5xx = GitHub having a bad day. Both are worth retrying.
    const retryable = res.status === 403 || res.status === 429 || res.status >= 500;
    if (!retryable) throw new Error(lastError);
    if (attempt < tries) await sleep((res.status >= 500 ? 2000 : 5000) * attempt);
  }
  throw new Error(`retries exhausted after ${tries} attempts: ${lastError}`);
}

// A profile with no website must never render "undefined" in the README.
function websiteOf(user) {
  const raw = (user.blog || "").trim();
  if (!raw) {
    return { label: `github.com/${user.login}`, url: `https://github.com/${user.login}` };
  }
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const label = url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return { label, url };
}

async function allRepos() {
  const repos = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await api(`/users/${OWNER}/repos?per_page=100&page=${page}&sort=updated`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
const int = (n) => Math.round(Number(n) || 0);

function dateLabel(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function badge(text, value, color, logo) {
  const label = encodeURIComponent(text).replace(/%20/g, '_');
  const val = encodeURIComponent(value).replace(/%20/g, '_').replace(/%2C/g, '%2C');
  return `https://img.shields.io/badge/${label}-${val}-${color}?style=for-the-badge&logo=${logo}&logoColor=white`;
}

function daysSince(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(diff / 86_400_000));
}

/* ------------------------------------------------------------------------- *
 * Repo spotlight — a self-hosted SVG card drawn from the same live data.
 *
 * Megha-style profiles hardcode their star counts inside the artwork, so the
 * picture slowly becomes a lie. This one is redrawn by the daily workflow, so
 * every number on the card came out of the REST API minutes ago.
 * ------------------------------------------------------------------------- */

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

function clip(value, max) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function pickSpotlight(repos) {
  const eligible = repos.filter(
    (repo) => !repo.fork && !repo.archived && repo.name.toLowerCase() !== OWNER.toLowerCase()
  );

  const ranked = eligible
    .slice()
    .sort(
      (a, b) =>
        int(b.stargazers_count) - int(a.stargazers_count) ||
        new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0)
    )
    .slice(0, 3);

  if (ranked.length < 3) {
    throw new Error(`Refusing to draw a spotlight with only ${ranked.length} eligible repositories`);
  }
  return ranked;
}

function renderSpotlight(ranked, stats) {
  const accent = ['#36BCF7', '#A855F7', '#3FB950'];
  const cards = ranked
    .map((repo, index) => {
      const x = 16 + index * 432;
      const color = accent[index];
      const description = clip(repo.description || 'No description yet — the code speaks first.', 54);
      const language = repo.language || 'Mixed';
      const pushed = dateLabel(repo.pushed_at || repo.updated_at);

      return `  <g>
    <rect x="${x + 0.5}" y="46.5" width="415" height="152" rx="14" fill="#161B22" stroke="#30363D"/>
    <rect x="${x + 0.5}" y="46.5" width="415" height="3" rx="1.5" fill="${color}" fill-opacity=".8"/>

    <text x="${x + 24}" y="84" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10.5" fill="${color}" letter-spacing="2.2">0${index + 1}</text>
    <text x="${x + 24}" y="114" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="18.5" font-weight="700" fill="#E6EDF3">${esc(clip(repo.name, 30))}</text>
    <text x="${x + 24}" y="139" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="11.5" fill="#8B949E">${esc(description)}</text>

    <circle cx="${x + 29}" cy="162" r="4" fill="${color}"/>
    <text x="${x + 40}" y="166" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10.5" fill="#C9D1D9">${esc(clip(language, 16))}</text>
    <text x="${x + 150}" y="166" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10.5" fill="#8B949E">★ ${fmt(int(repo.stargazers_count))}</text>
    <text x="${x + 226}" y="166" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10.5" fill="#8B949E">forks ${fmt(int(repo.forks_count))}</text>

    <text x="${x + 24}" y="188" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#6E7681">pushed ${esc(pushed)}</text>
  </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 236" width="1280" height="236" role="img" aria-label="Top repositories by stars: ${esc(ranked.map((r) => `${r.name}, ${int(r.stargazers_count)} stars`).join('; '))}">
  <title>Repo spotlight — top 3 by stars</title>
  <desc>Self-hosted card regenerated by scripts/update-stats.mjs from the live GitHub REST API. Generated ${esc(stats.shortStamp)}.</desc>

  <!--
    Generated file — do not hand-edit. Every value here is real and refreshed
    by the daily "Update Profile Stats" workflow.
    Tokens: #0D1117/#161B22 surface · #30363D border · #36BCF7 · #A855F7 · #3FB950
  -->

  <defs>
    <linearGradient id="rsBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0D1117"/>
      <stop offset="1" stop-color="#161B22"/>
    </linearGradient>
    <linearGradient id="rsEdge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#36BCF7" stop-opacity=".8"/>
      <stop offset="1" stop-color="#A855F7" stop-opacity=".8"/>
    </linearGradient>
    <style>
      .dot { animation: pulse 2.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .3; transform: scale(.65); } }
      @media (prefers-reduced-motion: reduce) { .dot { animation: none; opacity: 1; } }
    </style>
  </defs>

  <rect x="0.5" y="0.5" width="1279" height="235" rx="16" fill="url(#rsBg)" stroke="#30363D"/>
  <rect x="0" y="22" width="4" height="192" rx="2" fill="url(#rsEdge)"/>

  <text x="24" y="30" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10.5" fill="#8B949E" letter-spacing="2.6">// REPO SPOTLIGHT</text>
  <circle class="dot" cx="1042" cy="26" r="3.6" fill="#3FB950"/>
  <text x="1256" y="30" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10.5" fill="#8B949E" letter-spacing="1.4">TOP 3 BY STARS · LIVE</text>

${cards}

  <text x="24" y="222" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#6E7681" letter-spacing=".5">auto-generated by scripts/update-stats.mjs from the GitHub REST API · no hardcoded numbers</text>
  <text x="1256" y="222" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#6E7681" letter-spacing=".5">generated ${esc(stats.shortStamp)}</text>
</svg>
`;
}

function writeSpotlight(ranked, stats) {
  const svg = renderSpotlight(ranked, stats);

  if (/\b(undefined|NaN|null)\b/.test(svg)) {
    throw new Error('Refusing to write a spotlight card containing undefined/NaN/null.');
  }

  mkdirSync(dirname(SPOTLIGHT), { recursive: true });
  writeFileSync(SPOTLIGHT, svg, 'utf8');
  console.log(
    `Wrote ${SPOTLIGHT} — ${ranked.map((r) => `${r.name} (${int(r.stargazers_count)}★)`).join(', ')}`
  );
}

/* ------------------------------------------------------------------------- *
 * Developer ID — the identity card plus a live dashboard, drawn from the same
 * numbers as the README. This is the piece most profile art gets wrong: the
 * card looks permanent but the numbers are typed once and never updated.
 * Here the whole file is rewritten by the daily job, so the card cannot drift.
 * ------------------------------------------------------------------------- */

const DEV_ID = 'assets/dev-id.svg';

function renderDevId(stats) {
  const tiles = [
    ['REPOSITORIES', fmt(stats.repos), 'public · live from API', '#36BCF7'],
    ['STARS EARNED', fmt(stats.stars), 'across every repository', '#FFD166'],
    ['FORKS', fmt(stats.forks), 'others building on it', '#3FB950'],
    ['COMMITS', fmt(stats.commits), 'authored · Search API', '#A855F7'],
    ['PULL REQUESTS', fmt(stats.prs), 'opened and reviewed', '#4ECDC4'],
    ['FOLLOWERS', fmt(stats.followers), 'live from API', '#F97583'],
  ];

  const cards = tiles
    .map(([label, value, note, color], index) => {
      const x = 596 + (index % 3) * 214;
      const y = 140 + Math.floor(index / 3) * 166;
      return `  <g>
    <rect x="${x + 0.5}" y="${y + 0.5}" width="199" height="149" rx="14" fill="#0D1117" stroke="#30363D"/>
    <rect x="${x + 0.5}" y="${y + 0.5}" width="199" height="3" rx="1.5" fill="${color}" fill-opacity=".8"/>
    <text x="${x + 20}" y="${y + 34}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#8B949E" letter-spacing="1.6">${label}</text>
    <text x="${x + 20}" y="${y + 92}" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="42" font-weight="800" fill="${color}">${value}</text>
    <text x="${x + 20}" y="${y + 122}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#4B5563">${note}</text>
  </g>`;
    })
    .join('\n');

  const row = (y, label, value, color) => `  <text x="84" y="${y}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10" fill="#4B5563" letter-spacing="1.4">${label}</text>
  <text x="528" y="${y}" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" fill="${color}">${value}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 620" width="1280" height="620" role="img" aria-label="Developer ID for ${esc(stats.name)}: ${stats.repos} public repositories, ${stats.stars} stars, ${stats.forks} forks, ${stats.commits} commits, ${stats.prs} pull requests and ${stats.followers} followers. Verified against the GitHub API.">
  <title>Developer ID — ${esc(stats.name)}</title>
  <desc>Identity card and live dashboard generated by scripts/update-stats.mjs from the GitHub REST API and Search API. Generated ${esc(stats.shortStamp)}.</desc>

  <!--
    Generated file — do not hand-edit. Every number is fetched, never typed.
    Tokens: #0B0F17-#121826 bg · #121826/#0D1117 panel · #30363D border
            #36BCF7 · #A855F7 · #3FB950 · #FFD166
  -->

  <defs>
    <linearGradient id="diBg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1280" y2="620">
      <stop offset="0" stop-color="#0B0F17"/>
      <stop offset="1" stop-color="#121826"/>
    </linearGradient>
    <linearGradient id="diEdge" gradientUnits="userSpaceOnUse" x1="84" y1="0" x2="528" y2="0">
      <stop offset="0" stop-color="#36BCF7"/>
      <stop offset="1" stop-color="#A855F7"/>
    </linearGradient>
    <pattern id="diBars" width="6" height="12" patternUnits="userSpaceOnUse">
      <rect width="2" height="12" fill="#4B5563"/>
    </pattern>
    <style>
      .dot { animation: pulse 2.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.7); } }
      @media (prefers-reduced-motion: reduce) { .dot { animation: none; opacity: 1; } }
    </style>
  </defs>

  <rect width="1280" height="620" fill="url(#diBg)"/>

  <!-- ── identity card ─────────────────────────────────────── -->
  <rect x="56" y="80" width="500" height="480" rx="20" fill="#121826" stroke="#30363D"/>
  <rect x="56" y="80" width="500" height="3" rx="1.5" fill="url(#diEdge)"/>

  <text x="84" y="116" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10.5" fill="#8B949E" letter-spacing="2.4">// DEVELOPER ID</text>
  <text x="528" y="116" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10" fill="#4B5563" letter-spacing="1.2">ISSUED ${esc(stats.joined.slice(-4))}</text>

  <circle cx="150" cy="196" r="54" fill="#0D1117" stroke="url(#diEdge)" stroke-width="1.8"/>
  <circle cx="150" cy="196" r="45" fill="none" stroke="#30363D"/>
  <text x="150" y="209" text-anchor="middle" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="34" font-weight="800" fill="url(#diEdge)">SS</text>

  <text x="230" y="186" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#E6EDF3">${esc(stats.name)}</text>
  <text x="230" y="212" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="12.5" fill="#8B949E">Full-Stack Developer · Automation Builder</text>
  <text x="230" y="234" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" fill="#36BCF7">${esc(stats.location)}</text>

  <line x1="84" y1="268" x2="528" y2="268" stroke="#1C2128"/>

${row(300, 'MEMBER SINCE', esc(stats.joined), '#C9D1D9')}
${row(332, 'DAYS SHIPPING', `${fmt(stats.joinedDays)} days`, '#C9D1D9')}
${row(364, 'STATUS', 'OPEN TO WORK', '#3FB950')}
${row(396, 'HANDLE', `@${esc(stats.username)}`, '#36BCF7')}

  <rect x="84" y="424" width="64" height="44" rx="8" fill="#0D1117" stroke="#30363D"/>
  <rect x="98" y="440" width="36" height="12" rx="3" fill="#30363D"/>
  <rect x="168" y="428" width="360" height="36" fill="url(#diBars)" opacity=".5"/>

  <text x="84" y="512" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#4B5563">re-verified against the GitHub API on every scheduled run</text>
  <text x="528" y="512" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#4B5563">${esc(stats.shortStamp)}</text>

  <!-- ── live dashboard ────────────────────────────────────── -->
  <text x="596" y="116" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10.5" fill="#8B949E" letter-spacing="2.4">// LIVE DASHBOARD</text>
  <circle class="dot" cx="1114" cy="112" r="3.6" fill="#3FB950"/>
  <text x="1224" y="116" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10" fill="#3FB950" letter-spacing="1.2">LIVE FROM API</text>

${cards}

  <line x1="596" y1="500" x2="1224" y2="500" stroke="#1C2128"/>
  <text x="596" y="524" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#4B5563">source: GitHub REST v3 + Search API</text>
  <text x="1224" y="524" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9.5" fill="#4B5563">generated ${esc(stats.shortStamp)}</text>
</svg>
`;
}

function writeDevId(stats) {
  const svg = renderDevId(stats);

  if (/\b(undefined|NaN|null)\b/.test(svg)) {
    throw new Error('Refusing to write a developer ID card containing undefined/NaN/null.');
  }

  mkdirSync(dirname(DEV_ID), { recursive: true });
  writeFileSync(DEV_ID, svg, 'utf8');
  console.log(`Wrote ${DEV_ID} — ${stats.repos} repos · ${stats.stars}★ · ${fmt(stats.commits)} commits`);
}

async function main() {
  const readme = readFileSync(README, 'utf8');
  const [user, repos, commits, prs, issues] = await Promise.all([
    api(`/users/${OWNER}`),
    allRepos(),
    api(`/search/commits?q=author:${OWNER}&per_page=1`),
    api(`/search/issues?q=author:${OWNER}+type:pr&per_page=1`),
    api(`/search/issues?q=author:${OWNER}+type:issue&per_page=1`),
  ]);

  const site = websiteOf(user);

  const stats = {
    name: user.name || OWNER,
    username: user.login,
    location: user.location || 'Bihar, India',
    websiteLabel: site.label,
    websiteUrl: site.url,
    // Count from the fetched list, so the table can never disagree with the
    // stars/forks totals that come from the same list (or with the live badge).
    repos: repos.length,
    apiRepos: int(user.public_repos),
    followers: int(user.followers),
    following: int(user.following),
    stars: repos.reduce((sum, r) => sum + int(r.stargazers_count), 0),
    forks: repos.reduce((sum, r) => sum + int(r.forks_count), 0),
    commits: int(commits.total_count),
    prs: int(prs.total_count),
    issues: int(issues.total_count),
    joined: dateLabel(user.created_at),
    joinedDays: daysSince(user.created_at),
    syncedAt: dateLabel(new Date().toISOString()),
    shortStamp: new Date().toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    syncedStamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }),
  };

  if (stats.repos !== stats.apiRepos) {
    console.warn(
      `::warning::Repository count differs (list=${stats.repos}, profile=${stats.apiRepos}); using the fetched list.`
    );
  }


  // Honesty guard: refuse to publish obviously broken numbers.
  if (stats.repos === 0 || stats.commits === 0) {
    throw new Error(
      `Refusing to write suspicious stats (repos=${stats.repos}, commits=${stats.commits}). README left untouched.`
    );
  }

  // Redraw the self-hosted spotlight card from the same live repository list.
  // Done before the early-return below, so the card still refreshes on a day
  // when the README text itself happens to be unchanged.
  const ranked = pickSpotlight(repos);
  writeSpotlight(ranked, stats);
  writeDevId(stats);

  const blocks = {
    HERO: [
      `  <img src="${badge('Commits', fmt(stats.commits), 'a855f7', 'git')}" alt="Commits"/>`,
      `  &nbsp;`,
      `  <img src="${badge('Pull Requests', String(stats.prs), '4ECDC4', 'gitkraken')}" alt="Pull requests"/>`,
    ].join('\n'),

    // Plain-text twin of the developer ID card. The card is the artwork; this
    // strip is what a screen reader, a search engine and a no-SVG client get.
    // Same numbers, same source, one line instead of a 14-row table.
    TABLE: `<div align="center"><sub>📦 <strong>${fmt(stats.repos)}</strong> repositories &nbsp;·&nbsp; ⭐ <strong>${fmt(stats.stars)}</strong> stars &nbsp;·&nbsp; 🍴 <strong>${fmt(stats.forks)}</strong> forks &nbsp;·&nbsp; 💻 <strong>${fmt(stats.commits)}</strong> commits &nbsp;·&nbsp; 🔀 <strong>${fmt(stats.prs)}</strong> pull requests &nbsp;·&nbsp; 🐞 <strong>${fmt(stats.issues)}</strong> issues &nbsp;·&nbsp; 👥 <strong>${fmt(stats.followers)}</strong> followers &nbsp;·&nbsp; ✅ verified <strong>${stats.syncedAt}</strong></sub></div>`,

    MILESTONES: `<div align="center"><sub>🗓️ on GitHub since <strong>${stats.joined}</strong> &nbsp;·&nbsp; <strong>${fmt(stats.joinedDays)}</strong> days of shipping &nbsp;·&nbsp; 📍 ${stats.location} &nbsp;·&nbsp; 🌐 <a href="${stats.websiteUrl}">${stats.websiteLabel}</a></sub></div>`,

    REPOS: `  <img src="${badge('Browse All Repositories', `${fmt(stats.repos)} Projects`, '36BCF7', 'github')}" alt="All Repos"/>`,

    SYNC: `<sub>🤖 Auto-synced <strong>${stats.syncedAt}</strong> &bull; every number above pulled live from the GitHub API &bull; last run ${stats.syncedStamp} IST</sub>`,
  };

  // Last honesty guard: never publish a block containing an empty value.
  const rendered = Object.values(blocks).join('\n');
  if (/\b(undefined|NaN|null)\b/.test(rendered)) {
    throw new Error('Refusing to write a block containing undefined/NaN/null. README left untouched.');
  }

  let updated = readme;
  let changedBlocks = 0;

  for (const [key, value] of Object.entries(blocks)) {
    const re = new RegExp(`(<!-- STATS:${key}:START -->)[\\s\\S]*?(<!-- STATS:${key}:END -->)`, 'm');
    if (!re.test(updated)) {
      throw new Error(`Marker block STATS:${key} not found in ${README}`);
    }
    const next = updated.replace(re, `$1\n${value}\n$2`);
    if (next !== updated) changedBlocks++;
    updated = next;
  }

  if (updated === readme) {
    console.log('Stats already up to date — nothing to commit.');
    return;
  }

  writeFileSync(README, updated, 'utf8');
  console.log(`Updated ${changedBlocks} stat block(s) from live GitHub API:`);
  console.table({
    repos: stats.repos,
    stars: stats.stars,
    forks: stats.forks,
    commits: stats.commits,
    prs: stats.prs,
    issues: stats.issues,
    followers: stats.followers,
    following: stats.following,
    days: stats.joinedDays,
  });
}

main().catch((error) => {
  console.error(`::error::${error.message}`);
  process.exit(1);
});
