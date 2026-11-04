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

  const blocks = {
    HERO: [
      `  <img src="${badge('Commits', fmt(stats.commits), 'a855f7', 'git')}" alt="Commits"/>`,
      `  &nbsp;`,
      `  <img src="${badge('Pull Requests', String(stats.prs), '4ECDC4', 'gitkraken')}" alt="Pull requests"/>`,
    ].join('\n'),

    TABLE: [
      `| Metric | Value |`,
      `|:--|:--|`,
      `| 👤 **Name** | ${stats.name} |`,
      `| 🆔 **Username** | [\`@${stats.username}\`](https://github.com/${stats.username}) |`,
      `| 📍 **Location** | ${stats.location} |`,
      `| 🌐 **Website** | [${stats.websiteLabel}](${stats.websiteUrl}) |`,
      `| 📦 **Public Repositories** | **${fmt(stats.repos)}** *(Live from API)* |`,
      `| ⭐ **Total Stars Earned** | **${fmt(stats.stars)}** *(Live from API)* |`,
      `| 🍴 **Total Forks** | **${fmt(stats.forks)}** *(Live from API)* |`,
      `| 💻 **Commits Authored** | **${fmt(stats.commits)}** *(Search API)* |`,
      `| 🔀 **Pull Requests** | **${fmt(stats.prs)}** *(Search API)* |`,
      `| 🐞 **Issues Opened** | **${fmt(stats.issues)}** *(Search API)* |`,
      `| 👥 **Followers** | **${fmt(stats.followers)}** *(Live from API)* |`,
      `| ➡️ **Following** | **${fmt(stats.following)}** *(Live from API)* |`,
      `| 🗓️ **Joined GitHub** | ${stats.joined} |`,
      `| ✅ **Last Verified** | ${stats.syncedAt} |`,
    ].join('\n'),

    MILESTONES: [
      `| 🏆 Milestone | 📈 Detail |`,
      `|:--|:--|`,
      `| 🗓️ **Joined GitHub** | ${stats.joined} |`,
      `| 📅 **Days since joining** | **${fmt(stats.joinedDays)}** days of shipping code |`,
      `| 📦 **Public repositories** | **${fmt(stats.repos)}** shipped and open |`,
      `| 💻 **Commits authored** | **${fmt(stats.commits)}** across all repositories |`,
      `| 🔀 **Pull requests** | **${fmt(stats.prs)}** opened and merged through review |`,
      `| ⭐ **Stars earned** | **${fmt(stats.stars)}** from the developer community |`,
      `| 🍴 **Forks received** | **${fmt(stats.forks)}** — others building on my work |`,
      `| 🐍 **Automation** | Contribution snake + 3D calendar generated daily by GitHub Actions |`,
      `| 🧊 **3D contribution calendar** | Self-hosted, animated, regenerated every night |`,
    ].join('\n'),

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
