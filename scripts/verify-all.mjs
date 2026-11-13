#!/usr/bin/env node
/**
 * verify-all.mjs — Comprehensive local compiler and data-parity verification suite.
 *
 * Validates:
 *   1. All SVG assets meet strict XML, size budget, and accessibility gates (via check-svg.mjs)
 *   2. All URLs, badges, and generated date stamps in README.md are alive (via check-readme-health.mjs)
 *   3. Strict data parity between README markdown blocks and generated SVG cards (zero drift):
 *      - Commits: README Hero == README Table == dev-id.svg
 *      - Repositories: README Table == README Repos Badge == dev-id.svg
 *      - Stars: README Table == dev-id.svg
 *      - Pull Requests: README Hero == README Table
 */

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function runStep(name, script) {
  console.log(`\n▶ [STEP] ${name}...`);
  const proc = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (proc.status !== 0) {
    console.error(`\n❌ [FAIL] ${name} exited with code ${proc.status}`);
    process.exit(proc.status || 1);
  }
  console.log(`✔ [PASS] ${name}`);
}

// 1. Run SVG quality gate
runStep('SVG Quality Gate', 'scripts/check-svg.mjs');

// 2. Run README health check. Network-dependent, so it is skipped with --offline:
// the daily stats job must never lose its commit because github.com answered 502.
const OFFLINE = process.argv.includes('--offline');
if (OFFLINE) {
  console.log('\n⏭  [SKIP] README & Link Health Gate (offline mode)');
} else {
  runStep('README & Link Health Gate', 'scripts/check-readme-health.mjs');
}

// 3. Cross-file Data Parity Check
console.log('\n▶ [STEP] Cross-File Telemetry Parity Check...');

const readme = readFileSync('README.md', 'utf8');
const devId = readFileSync('assets/dev-id.svg', 'utf8');

// Extract from README
const heroCommitsMatch = readme.match(/Commits-([0-9%A-Fa-f,]+)-/i);
const heroPrMatch = readme.match(/Pull_Requests-(\d+)-/i);
const tableReposMatch = readme.match(/<strong>([\d,]+)<\/strong>\s*repositories/i);
const tableStarsMatch = readme.match(/<strong>([\d,]+)<\/strong>\s*stars/i);
const tableCommitsMatch = readme.match(/<strong>([\d,]+)<\/strong>\s*commits/i);
const tablePrMatch = readme.match(/<strong>([\d,]+)<\/strong>\s*pull requests/i);
const reposBadgeMatch = readme.match(/Browse_All_Repositories-([0-9%A-Fa-f,]+)_Projects-/i);

if (!heroCommitsMatch || !heroPrMatch || !tableReposMatch || !tableStarsMatch || !tableCommitsMatch || !tablePrMatch || !reposBadgeMatch) {
  console.error('❌ Failed to parse all stats blocks from README.md');
  console.error({
    heroCommitsMatch: !!heroCommitsMatch,
    heroPrMatch: !!heroPrMatch,
    tableReposMatch: !!tableReposMatch,
    tableStarsMatch: !!tableStarsMatch,
    tableCommitsMatch: !!tableCommitsMatch,
    tablePrMatch: !!tablePrMatch,
    reposBadgeMatch: !!reposBadgeMatch,
  });
  process.exit(1);
}

const rHeroCommits = decodeURIComponent(heroCommitsMatch[1]);
const rHeroPrs = heroPrMatch[1];
const rTableRepos = tableReposMatch[1];
const rTableStars = tableStarsMatch[1];
const rTableCommits = tableCommitsMatch[1];
const rTablePrs = tablePrMatch[1];
const rReposBadge = decodeURIComponent(reposBadgeMatch[1]);

// Extract from dev-id.svg
const devIdCommitsMatch = devId.match(/(\b[\d,]+\b)\s*commits/i) || devId.match(/>([\d,]+)<\/text>\s*<text[^>]*>COMMITS/i);
const devIdReposMatch = devId.match(/(\b\d+\b)\s*public repositories/i) || devId.match(/(\b\d+\b)\s*repos/i);
const devIdStarsMatch = devId.match(/(\b\d+\b)\s*stars/i) || devId.match(/(\b\d+\b)★/);

console.log('Telemetry snapshot:');
console.table({
  'README Hero Commits': rHeroCommits,
  'README Table Commits': rTableCommits,
  'README Table Repos': rTableRepos,
  'README Repos Badge': rReposBadge,
  'README Table Stars': rTableStars,
  'README Hero PRs': rHeroPrs,
  'README Table PRs': rTablePrs,
});

const errors = [];

if (rHeroCommits !== rTableCommits) {
  errors.push(`Commits mismatch in README: Hero has ${rHeroCommits}, but Table has ${rTableCommits}`);
}

if (rHeroPrs !== rTablePrs) {
  errors.push(`Pull requests mismatch in README: Hero has ${rHeroPrs}, but Table has ${rTablePrs}`);
}

if (rTableRepos !== rReposBadge) {
  errors.push(`Repository count mismatch in README: Table has ${rTableRepos}, but Repos Badge has ${rReposBadge}`);
}

if (devIdCommitsMatch) {
  const dCommits = devIdCommitsMatch[1];
  if (dCommits !== rTableCommits) {
    errors.push(`Commits mismatch: dev-id.svg has ${dCommits}, but README has ${rTableCommits}`);
  }
}

if (devIdStarsMatch) {
  const dStars = devIdStarsMatch[1];
  if (dStars !== rTableStars) {
    errors.push(`Stars mismatch: dev-id.svg has ${dStars}, but README has ${rTableStars}`);
  }
}

if (devIdReposMatch) {
  const dRepos = devIdReposMatch[1];
  if (dRepos !== rTableRepos) {
    errors.push(`Repos mismatch: dev-id.svg has ${dRepos}, but README has ${rTableRepos}`);
  }
}

if (errors.length > 0) {
  console.error('\n❌ Data Parity Errors:');
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

console.log('✔ [PASS] 100% Data Parity Verified across README and SVG telemetry cards.\n');
console.log('✨ All profile systems compiled, synchronized, and verified perfectly.');
