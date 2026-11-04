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

function renderDevId(stats, ranked = []) {
  const kpis = [
    ['PUBLIC REPOS', fmt(stats.repos), 'verified REST v3', '#38BDF8'],
    ['STARS EARNED', fmt(stats.stars), 'across projects', '#F59E0B'],
    ['FORKS', fmt(stats.forks), 'community builds', '#10B981'],
    ['COMMITS', fmt(stats.commits), 'Search API authored', '#C084FC'],
  ];

  const kpiCards = kpis
    .map(([label, value, note, color], index) => {
      const x = 420 + index * 208;
      const y = 134;
      return `  <g>
    <rect x="${x + 0.5}" y="${y + 0.5}" width="194" height="92" rx="14" fill="#0B1220" stroke="#1E293B"/>
    <rect x="${x + 16}" y="${y + 12}" width="22" height="3" rx="1.5" fill="${color}"/>
    <text x="${x + 16}" y="${y + 32}" font-family="'JBM', ui-monospace, monospace" font-size="9" font-weight="700" fill="#94A3B8" letter-spacing="1.4">${label}</text>
    <text x="${x + 16}" y="${y + 68}" font-family="'SG', 'Segoe UI', sans-serif" font-size="32" font-weight="800" fill="${color}">${value}</text>
    <text x="${x + 16}" y="${y + 84}" font-family="'JBM', ui-monospace, monospace" font-size="8.5" fill="#64748B">${note}</text>
  </g>`;
    })
    .join('\n');

  const maxStars = Math.max(...ranked.map((r) => int(r.stargazers_count)), 5);
  const repoBars = (ranked.slice(0, 4) || [])
    .map((repo, idx) => {
      const y = 296 + idx * 54;
      const stars = int(repo.stargazers_count);
      const name = esc(clip(repo.name, 22));
      const lang = esc(clip(repo.language || 'Code', 12));
      const barW = Math.max(16, Math.min(200, Math.round((stars / maxStars) * 200)));
      return `  <g>
    <text x="442" y="${y + 12}" font-family="'JBM', ui-monospace, monospace" font-size="11.5" fill="#E2E8F0">${name}</text>
    <text x="636" y="${y + 12}" font-family="'JBM', ui-monospace, monospace" font-size="9.5" fill="#64748B">${lang}</text>
    <rect x="704" y="${y + 2}" width="200" height="12" rx="6" fill="#1E293B" fill-opacity=".5"/>
    <rect x="704" y="${y + 2}" width="${barW}" height="12" rx="6" fill="url(#diBarG)">
      <animate attributeName="width" values="0;0;${barW}" keyTimes="0;0.5;1" dur="2.${2 + idx * 2}s" begin="0s" fill="freeze" calcMode="spline" keySplines="0 0 1 1;.2 .8 .2 1"/>
    </rect>
    <text x="914" y="${y + 12}" font-family="'JBM', ui-monospace, monospace" font-size="11" font-weight="700" fill="#38BDF8">${stars}&#9733;</text>
  </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1280 620" width="1280" height="620" role="img" aria-label="Developer ID and live GitHub telemetry dashboard for ${esc(stats.name)}: ${stats.repos} public repositories, ${stats.stars} stars, ${stats.forks} forks, and ${fmt(stats.commits)} commits. Verified against GitHub REST API v3.">
  <title>Developer ID &#183; ${esc(stats.name)}</title>
  <desc>Unified 1280px physical swinging lanyard ID with realistic 13deg settle physics and live telemetry dashboard generated by scripts/update-stats.mjs. Generated ${esc(stats.shortStamp)}.</desc>

  <defs>
    <style type="text/css"><![CDATA[
text { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .sg { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; }
      .sgm { font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 500; }
      .jb { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .jbb { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; }

      .settle {
        transform-origin: 212px -10px;
        animation: dropSettle 3.2s cubic-bezier(.34,1.1,.5,1) forwards;
      }
      .sway {
        transform-origin: 212px -10px;
        animation: perpetualSway 4.8s ease-in-out 3.2s infinite;
      }
      .wob {
        transform-origin: 212px 300px;
        animation: cardWobble 4.8s ease-in-out 3.2s infinite;
      }
      @keyframes dropSettle {
        0% { transform: rotate(0deg) translateY(-660px); }
        18% { transform: rotate(0deg) translateY(0); }
        30% { transform: rotate(13deg); }
        46% { transform: rotate(-9deg); }
        62% { transform: rotate(6deg); }
        78% { transform: rotate(-3.5deg); }
        92% { transform: rotate(1.5deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes perpetualSway {
        0%, 100% { transform: rotate(-3.2deg); }
        50% { transform: rotate(3.2deg); }
      }
      @keyframes cardWobble {
        0%, 100% { transform: rotate(1.6deg); }
        50% { transform: rotate(-1.6deg); }
      }
      .foil {
        animation: foilSlide 5s ease-in-out infinite;
      }
      @keyframes foilSlide {
        0% { transform: translateX(-340px) skewX(-18deg); }
        55%, 100% { transform: translateX(420px) skewX(-18deg); }
      }
      .beacon {
        animation: beaconPulse 2s ease-in-out infinite;
      }
      @keyframes beaconPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: .25; transform: scale(.7); }
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; opacity: 1 !important; transform: none !important; }
      }
    ]]></style>

    <linearGradient id="diBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0E131F"/>
      <stop offset="1" stop-color="#080B12"/>
    </linearGradient>
    <linearGradient id="diEdge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38BDF8" stop-opacity=".6"/>
      <stop offset=".5" stop-color="#1E293B"/>
      <stop offset="1" stop-color="#818CF8" stop-opacity=".5"/>
    </linearGradient>
    <linearGradient id="strapG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0F172A"/>
      <stop offset=".5" stop-color="#1E293B"/>
      <stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="metalG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E2E8F0"/>
      <stop offset=".4" stop-color="#94A3B8"/>
      <stop offset=".6" stop-color="#64748B"/>
      <stop offset="1" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="idCardBg" x1="0" y1="0" x2=".7" y2="1">
      <stop offset="0" stop-color="#0F172A"/>
      <stop offset=".55" stop-color="#0B1220"/>
      <stop offset="1" stop-color="#070A11"/>
    </linearGradient>
    <linearGradient id="cyanViolet" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38BDF8"/>
      <stop offset="1" stop-color="#C084FC"/>
    </linearGradient>
    <linearGradient id="foilG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#38BDF8" stop-opacity="0"/>
      <stop offset=".35" stop-color="#38BDF8" stop-opacity=".15"/>
      <stop offset=".5" stop-color="#FFFFFF" stop-opacity=".28"/>
      <stop offset=".65" stop-color="#C084FC" stop-opacity=".15"/>
      <stop offset="1" stop-color="#C084FC" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="chipG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FDE047"/>
      <stop offset=".5" stop-color="#CA8A04"/>
      <stop offset="1" stop-color="#EAB308"/>
    </linearGradient>
    <linearGradient id="diBarG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#38BDF8"/>
      <stop offset="1" stop-color="#818CF8"/>
    </linearGradient>
    <pattern id="diGrid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r=".8" fill="#FFFFFF" fill-opacity=".04"/>
    </pattern>
    <filter id="diShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000000" flood-opacity=".75"/>
    </filter>
    <clipPath id="idCardClip">
      <rect x="56" y="150" width="312" height="430" rx="20"/>
    </clipPath>
    <clipPath id="avatarClip">
      <rect x="144" y="202" width="136" height="146" rx="16"/>
    </clipPath>
  </defs>

  <!-- Canvas Surface -->
  <rect width="1280" height="620" rx="24" fill="url(#diBg)"/>
  <rect width="1280" height="620" rx="24" fill="url(#diGrid)"/>
  <rect x=".75" y=".75" width="1278.5" height="618.5" rx="23.25" fill="none" stroke="url(#diEdge)" stroke-width="1.5"/>

  <!-- Top Right Live Status Pill -->
  <g transform="translate(1076,64)">
    <rect x="0" y="-18" width="164" height="28" rx="14" fill="#10B981" fill-opacity=".1" stroke="#10B981" stroke-opacity=".4"/>
    <circle cx="16" cy="-4" r="4" fill="#10B981"><animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite"/></circle>
    <text class="jbb" x="28" y="0" font-size="9.5" fill="#10B981" letter-spacing="1.1">LIVE &#183; ${esc(stats.shortStamp)}</text>
  </g>

  <!-- Mission Dashboard Header -->
  <text x="420" y="54" class="jbb" font-size="11.5" fill="#38BDF8" letter-spacing="2.2">// MISSION TELEMETRY &amp; LIVE DASHBOARD</text>
  <text x="420" y="86" class="sg" font-size="28" fill="#F1F5F9" letter-spacing="-.4">Real-Time Production Telemetry</text>

  <!-- 4 Dynamic KPI Cards -->
${kpiCards}

  <!-- Top Flagship Missions (Bar Chart) Panel -->
  <g>
    <rect x="420" y="246" width="460" height="332" rx="16" fill="#0B1220" stroke="#1E293B"/>
    <rect x="442" y="260" width="24" height="3" rx="1.5" fill="#38BDF8"/>
    <text x="442" y="280" class="jbb" font-size="10.5" fill="#94A3B8" letter-spacing="1.8">TOP MISSIONS &#183; REPOSITORY STARS</text>

${repoBars}

    <line x1="442" y1="528" x2="856" y2="528" stroke="#1E293B"/>
    <text x="442" y="552" class="jb" font-size="9" fill="#64748B">pulled live from GitHub REST API v3 &#183; auto-ranked</text>
  </g>

  <!-- Operations & Architecture Panel -->
  <g>
    <rect x="900" y="246" width="340" height="332" rx="16" fill="#0B1220" stroke="#1E293B"/>
    <rect x="922" y="260" width="24" height="3" rx="1.5" fill="#C084FC"/>
    <text x="922" y="280" class="jbb" font-size="10.5" fill="#94A3B8" letter-spacing="1.8">ACTIVE ARCHITECTURE</text>

    <!-- Subsystem 1 -->
    <circle cx="928" cy="316" r="3.6" fill="#38BDF8"><animate attributeName="opacity" values="1;.3;1" dur="2.2s" repeatCount="indefinite"/></circle>
    <text x="942" y="320" class="jbb" font-size="9.5" fill="#38BDF8" letter-spacing="1.3">CORE AUTOMATION</text>
    <text x="942" y="338" class="sgm" font-size="12.5" fill="#F1F5F9">GitHub Actions &#183; Cron &#183; CI/CD</text>

    <!-- Subsystem 2 -->
    <circle cx="928" cy="370" r="3.6" fill="#818CF8"><animate attributeName="opacity" values="1;.3;1" dur="2.6s" repeatCount="indefinite"/></circle>
    <text x="942" y="374" class="jbb" font-size="9.5" fill="#818CF8" letter-spacing="1.3">SYSTEMS RUNTIME</text>
    <text x="942" y="392" class="sgm" font-size="12.5" fill="#F1F5F9">Node.js &#183; Python &#183; Linux OS</text>

    <!-- Subsystem 3 -->
    <circle cx="928" cy="424" r="3.6" fill="#10B981"><animate attributeName="opacity" values="1;.3;1" dur="3s" repeatCount="indefinite"/></circle>
    <text x="942" y="428" class="jbb" font-size="9.5" fill="#10B981" letter-spacing="1.3">FULL-STACK CLOUD</text>
    <text x="942" y="446" class="sgm" font-size="12.5" fill="#F1F5F9">Docker &#183; REST APIs &#183; SQL</text>

    <!-- Subsystem 4 -->
    <circle cx="928" cy="478" r="3.6" fill="#F59E0B"><animate attributeName="opacity" values="1;.3;1" dur="3.4s" repeatCount="indefinite"/></circle>
    <text x="942" y="482" class="jbb" font-size="9.5" fill="#F59E0B" letter-spacing="1.3">ZERO FAKE DATA</text>
    <text x="942" y="500" class="sgm" font-size="12.5" fill="#F1F5F9">100% verified against GitHub APIs</text>

    <line x1="922" y1="528" x2="1218" y2="528" stroke="#1E293B"/>
    <text x="922" y="552" class="jb" font-size="9" fill="#64748B">status: operational &#183; systems nominal</text>
  </g>

  <!-- ── Physical Swinging Lanyard Card Rig (Left Side) ────────── -->
  <g class="settle"><g class="sway">
    <!-- Woven Lanyard Strap -->
    <path d="M191 -46 L233 -46 L230 104 L194 104 Z" fill="url(#strapG)"/>
    <line x1="195" y1="-46" x2="198" y2="104" stroke="#FFFFFF" stroke-opacity=".2" stroke-dasharray="3 2"/>
    <line x1="229" y1="-46" x2="226" y2="104" stroke="#FFFFFF" stroke-opacity=".2" stroke-dasharray="3 2"/>
    <text class="jbb" font-size="8.6" fill="#E2E8F0" fill-opacity=".85" letter-spacing="2.3" transform="translate(216,-38) rotate(90)">// SUDHIR SINGH &#183; CREW ACCESS &#183; SYSTEMS</text>

    <!-- Titanium Clip & Ring -->
    <rect x="185" y="100" width="54" height="24" rx="6" fill="url(#metalG)"/>
    <rect x="199" y="106" width="26" height="7" rx="3.5" fill="#0B1220" fill-opacity=".7"/>
    <circle cx="212" cy="139" r="13" fill="none" stroke="url(#metalG)" stroke-width="5"/>

    <!-- Lanyard Obsidian Card Body with Heavy Drop Shadow -->
    <g class="wob">
      <g filter="url(#diShadow)">
        <rect x="56" y="150" width="312" height="430" rx="20" fill="url(#idCardBg)" stroke="url(#cyanViolet)" stroke-width="1.5" stroke-opacity=".6"/>
      </g>

      <!-- Clipped ID Card Inner Surface -->
      <g clip-path="url(#idCardClip)">
        <rect x="56" y="150" width="312" height="430" fill="url(#diGrid)"/>
        <rect x="56" y="150" width="312" height="38" fill="#38BDF8" fill-opacity=".12"/>

        <!-- Card Top Header -->
        <text x="80" y="174" class="jbb" font-size="9.5" fill="#38BDF8" letter-spacing="1.8">// CREW REGISTRATION</text>
        <text x="344" y="174" class="jb" font-size="9.5" fill="#94A3B8" text-anchor="end">ID No. 3047</text>

        <!-- Gold Microchip on Left -->
        <rect x="80" y="206" width="36" height="26" rx="5" fill="url(#chipG)"/>
        <path d="M 80 219 h 36 M 92 206 v 26 M 104 206 v 26" stroke="#854D0E" stroke-width=".8" fill="none"/>

        <!-- Monogram Avatar Box with Orbital Electron Satellite -->
        <rect x="144" y="202" width="136" height="148" rx="16" fill="#070A11" stroke="url(#cyanViolet)" stroke-width="1.8" stroke-opacity=".8"/>
        <path id="diAvatarOrbit" d="M144 218 v116 a16 16 0 0 0 16 16 h104 a16 16 0 0 0 16 -16 v-116 a16 16 0 0 0 -16 -16 h-104 a16 16 0 0 0 -16 16 z" fill="none"/>
        <circle r="3.2" fill="#38BDF8"><animateMotion dur="6s" repeatCount="indefinite"><mpath href="#diAvatarOrbit"/></animateMotion></circle>

        <g clip-path="url(#avatarClip)">
          <circle cx="212" cy="276" r="42" fill="#0B1220" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="4 2"/>
          <text x="212" y="288" class="sg" font-size="34" font-weight="900" fill="url(#cyanViolet)" text-anchor="middle">SS</text>
        </g>

        <!-- S-Rank Stamp Badge -->
        <g transform="translate(320,236)" opacity=".92">
          <circle r="22" fill="none" stroke="#C084FC" stroke-width="2" stroke-opacity=".8"/>
          <circle r="17" fill="#C084FC" fill-opacity=".1"/>
          <text class="jbb" y="-2" text-anchor="middle" font-size="9.5" fill="#C084FC" letter-spacing="1">RANK</text>
          <text class="sg" y="13" text-anchor="middle" font-size="14" fill="#C084FC">S+</text>
        </g>

        <!-- Identity Metadata -->
        <text x="212" y="380" class="sg" font-size="22" fill="#F1F5F9" text-anchor="middle">${esc(stats.name)}</text>
        <text x="212" y="399" class="jbb" font-size="10" fill="#38BDF8" text-anchor="middle" letter-spacing="1.4">SYSTEMS &amp; CLOUD DEVOPS</text>
        <line x1="80" y1="416" x2="344" y2="416" stroke="#1E293B"/>

        <!-- Specs 2x2 Grid -->
        <text x="80" y="434" class="jb" font-size="8.5" fill="#64748B" letter-spacing="1.4">FOCUS</text>
        <text x="80" y="450" class="sgm" font-size="12" fill="#E2E8F0">Full-Stack &amp; DevOps</text>

        <text x="222" y="434" class="jb" font-size="8.5" fill="#64748B" letter-spacing="1.4">BASE</text>
        <text x="222" y="450" class="sgm" font-size="12" fill="#E2E8F0">${esc(stats.location)}</text>

        <text x="80" y="474" class="jb" font-size="8.5" fill="#64748B" letter-spacing="1.4">STATUS</text>
        <text x="80" y="490" class="sgm" font-size="12" fill="#10B981">OPEN TO WORK</text>

        <text x="222" y="474" class="jb" font-size="8.5" fill="#64748B" letter-spacing="1.4">COMMITS</text>
        <text x="222" y="490" class="sgm" font-size="12" fill="#C084FC">${fmt(stats.commits)}</text>

        <!-- Precision Barcode Pattern -->
        <g opacity=".6">
          <rect x="80" y="508" width="2.4" height="16" fill="#94A3B8"/><rect x="84.8" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="88.6" y="508" width="1.4" height="16" fill="#94A3B8"/><rect x="91.6" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="95.4" y="508" width="3.4" height="16" fill="#94A3B8"/><rect x="100.4" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="104.8" y="508" width="3.4" height="16" fill="#94A3B8"/><rect x="109.8" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="114.6" y="508" width="2.4" height="16" fill="#94A3B8"/><rect x="119.4" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="123.2" y="508" width="3.4" height="16" fill="#94A3B8"/><rect x="129" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="133.4" y="508" width="2.4" height="16" fill="#94A3B8"/><rect x="138.2" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="142" y="508" width="3.4" height="16" fill="#94A3B8"/><rect x="147.8" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="152.2" y="508" width="1.4" height="16" fill="#94A3B8"/><rect x="156" y="508" width="3.4" height="16" fill="#94A3B8"/>
          <rect x="161.8" y="508" width="2.4" height="16" fill="#94A3B8"/><rect x="166.6" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="170.4" y="508" width="3.4" height="16" fill="#94A3B8"/><rect x="176.2" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="180.6" y="508" width="2.4" height="16" fill="#94A3B8"/><rect x="185.4" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="189.2" y="508" width="3.4" height="16" fill="#94A3B8"/><rect x="195" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="199.4" y="508" width="2.4" height="16" fill="#94A3B8"/><rect x="204.2" y="508" width="1.4" height="16" fill="#94A3B8"/>
          <rect x="208" y="508" width="3.4" height="16" fill="#94A3B8"/><rect x="213.8" y="508" width="1.4" height="16" fill="#94A3B8"/>
        </g>

        <!-- Holographic Foil Sweep -->
        <g class="foil">
          <rect x="-64" y="150" width="130" height="430" fill="url(#foilG)"/>
        </g>

        <!-- Active Crew Online Badge -->
        <g transform="translate(80,550)">
          <circle r="4" fill="#10B981"><animate attributeName="opacity" values="1;.2;1" dur="1.8s" repeatCount="indefinite"/></circle>
          <text class="jbb" font-size="9" fill="#10B981" letter-spacing="1.2" x="12" y="3">ONLINE &#183; VERIFIED</text>
        </g>
        <text class="jb" font-size="9" fill="#64748B" x="344" y="553" text-anchor="end">@SudhirDevOps1</text>
      </g>
    </g>
  </g></g>
</svg>`;
}

function writeDevId(stats, ranked = []) {
  const svg = renderDevId(stats, ranked);

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
  writeDevId(stats, ranked);

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
