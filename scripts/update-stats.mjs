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

import { readFileSync, writeFileSync } from 'node:fs';

const README = 'README.md';
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

async function api(path, tries = 3) {
  let lastError = '';
  for (let attempt = 1; attempt <= tries; attempt++) {
    const res = await fetch(`${API}${path}`, { headers });
    if (res.ok) return res.json();

    const body = await res.text();
    lastError = `${path} -> HTTP ${res.status} ${body.slice(0, 160)}`;

    // Search API is limited to 30 req/min: back off instead of failing.
    if (res.status === 403 || res.status === 429) {
      await sleep(5000 * attempt);
      continue;
    }
    throw new Error(lastError);
  }
  throw new Error(`retries exhausted: ${lastError}`);
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

async function main() {
  const readme = readFileSync(README, 'utf8');

  const [user, repos, commits, prs, issues] = await Promise.all([
    api(`/users/${OWNER}`),
    allRepos(),
    api(`/search/commits?q=author:${OWNER}&per_page=1`),
    api(`/search/issues?q=author:${OWNER}+type:pr&per_page=1`),
    api(`/search/issues?q=author:${OWNER}+type:issue&per_page=1`),
  ]);

  const stats = {
    name: user.name || OWNER,
    username: user.login,
    location: user.location || 'Bihar, India',
    blog: (user.blog || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
    repos: int(user.public_repos),
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
    syncedStamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }),
  };

  // Honesty guard: refuse to publish obviously broken numbers.
  if (stats.repos === 0 || stats.commits === 0) {
    throw new Error(
      `Refusing to write suspicious stats (repos=${stats.repos}, commits=${stats.commits}). README left untouched.`
    );
  }

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
      `| 🌐 **Website** | [${stats.blog}](https://${stats.blog}) |`,
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
      `| 🏗️ **Studio Stack** | React 19 · TypeScript 5 · Tailwind CSS 4 · Vite 7 |`,
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
      `| 🏗️ **Profile Studio** | Full-stack React 19 + TypeScript app, designed, built and deployed |`,
      `| 🐍 **Automation** | Contribution snake + 3D calendar generated daily by GitHub Actions |`,
      `| 🧊 **3D contribution calendar** | Self-hosted, animated, regenerated every night |`,
    ].join('\n'),

    REPOS: `  <img src="${badge('Browse All Repositories', `${fmt(stats.repos)} Projects`, '36BCF7', 'github')}" alt="All Repos"/>`,

    SYNC: `<sub>🤖 Auto-synced <strong>${stats.syncedAt}</strong> &bull; every number above pulled live from the GitHub API &bull; last run ${stats.syncedStamp} IST</sub>`,
  };

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
