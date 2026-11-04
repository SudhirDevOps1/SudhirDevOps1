# SudhirDevOps1 Cinema-Grade Profile & Orbital Telemetry Engine

* **Author:** @SudhirDevOps1
* **Date:** 2026-11-04
* **Target:** `SudhirDevOps1/SudhirDevOps1` (`README.md` + `assets/`)

---

## Overview

This feature transforms @SudhirDevOps1's GitHub profile into a cinema-grade, telemetry-driven developer command center. We replace generic dark badges and static SVGs with an anamorphic optical viewfinder HUD and a live-rendered orbital tech radar. The system is backed by self-contained vector assets in `assets/` and automated GitHub REST and Search API workflows.

The target audience consists of senior technical recruiters, engineering directors, and open-source collaborators who evaluate candidate capability in under ten seconds. The value proposition is high visual density and motion quality without fake data, stale statistics, or anime tropes.

---

## Analysis

Six parallel Goldfish review lenses analyzed the feature concept. The unified findings are organized below:

### 1. Visual Ergonomics & Anamorphic Framing (Design Lens)
* **2.39:1 Viewfinder Architecture (`assets/hero-viewfinder.svg`)**: 1200×502 viewBox with corner brackets (`┌ ┐ └ ┘`), crosshair reticles, optical telemetry readouts (`FOCAL: 50mm · ƒ/1.4 · ISO 100 · REC [LIVE]`), and coordinates (`LAT 25.5941° N // LON 85.1376° E [BIHAR-IN]`).
* **Orbital Tech Radar (`assets/orbital-radar.svg`)**: Three concentric orbital paths rotating around a central engine core:
  - *Core Orbit (R=95px, 60s rotation)*: Daily driver primitives (`Node.js`, `TypeScript`, `Git/GitHub`, `Linux/Bash`).
  - *Production Orbit (R=165px, 90s reverse rotation)*: Architecture & deployment (`Docker`, `GitHub Actions`, `REST APIs`, `FastAPI/Python`).
  - *Emerging Orbit (R=235px, 120s rotation)*: Active frontiers (`DevSecOps`, `Next.js/React`, `SQL Tuning`, `Reverse Engineering`).
* **Motion Guardrails**: Subtle pulsing status beacon (2.8s breathing cycle) and smooth terminal scanline tick. Fully suppressed under `@media (prefers-reduced-motion: reduce)`.

### 2. Live Data Pipeline & Rate-Limit Resilience (Codebase Lens)
* **Live Dynamic Injection**: `scripts/update-stats.mjs` will inject real lifetime commits from Search API (`author:SudhirDevOps1`), repository counts, and earned stars directly into SVG templates.
* **Rate-Limit Throttling**: The GitHub Actions `GITHUB_TOKEN` Search API is capped at 30 requests per minute. The updater script implements sequential request throttling with exponential backoff and jitter (minimum 2.5s between search calls).
* **Safe Abort on Error**: If the GitHub Search API returns 403 or 429 during a daily cron run, the script aborts without modifying files, preventing `NaN`, `null`, or broken assets.

### 3. CDN Caching & Cross-Theme Immunity (Architecture & Skeptic Lens)
* **Camo Cache Invalidation**: GitHub proxies all README assets via `camo.githubusercontent.com`. Relative repository paths (`./assets/hero-viewfinder.svg?v=1`) coupled with version bumping on SVG content mutation ensure instant cache invalidation.
* **Prohibited Tags**: Zero `<script>`, zero external font imports (`@import url(...)`), and zero `<foreignObject>` tags, which are stripped or broken by Camo.
* **Self-Contained Theme Safety**: Letterboxed dark panels with explicit background fills (`#070A0F`) maintain high contrast (`#E2E8F0` text) regardless of whether the viewer uses GitHub light or dark theme.

### 4. Recruiter Signal & Telemetry Copy (Comprehension Lens)
* **Five-Second Heuristic**: High visual fidelity must never obscure core skills. The hero immediately states: `SUDHIR SINGH // BCA SYSTEMS & AUTOMATION ENGINEER // BIHAR, IN`.
* **Telemetry Copy Hierarchy**: Technical, professional framing replaces casual phrasing:
  - `// SUBSYSTEMS & PRODUCTION BUILDS` (Featured Projects)
  - `// ORBITAL TECH RADAR [SYSTEM STACK]` (Technical Skills)
  - `// FLIGHT TELEMETRY & AUDIT LEDGER` (Contribution Activity)

### 5. Asset Budgeting & Quality Gates (Implementation Readiness Lens)
* **Global Asset Footprint <= 250 KB**:
  - `hero-viewfinder.svg`: <= 18 KB
  - `orbital-radar.svg`: <= 22 KB
  - `telemetry-dashboard.svg`: <= 16 KB
  - `repo-spotlight.svg`: <= 12 KB
  - Supporting UI rules & dividers: <= 4 KB
  - Projected total footprint: **~72 KB**, well below the 250 KB ceiling and significantly lighter than Megha's 1.6 MB raster bloat.
* **Automated Quality Gate**: `scripts/check-svg.mjs` enforces total asset size checks, XML validity, lack of raster binaries, presence of `role="img"`, `<title>`, `<desc>`, and `@media (prefers-reduced-motion)`.

### 6. Document Cadence & Clean Repo Rule (Structural Lens)
* **Single README.md Invariant**: Strictly one markdown file in the root directory. No temporary plan docs or HTML mockups inside the Git index.
* **Vertical Section Rhythm**:
  1. Optical Viewfinder Hero
  2. Telemetry Quickbar (Live status badges)
  3. Orbital Tech Radar
  4. Subsystems & Featured Projects (Markdown table)
  5. Flight Telemetry & Activity Ledger (Streak + 3D contribution city)
  6. Automated Pipeline Audit (Architecture tree)
  7. Comms Channel & Cryptographic Sign-Off

---

## Goals vs. Non-Goals

### In-Scope Goals

* **Single-File Human Delivery**: Only `README.md` in repository root; all generated visual assets live under `assets/`.
* **Cinematic Optical Viewfinder**: 1200×502 anamorphic viewfinder banner with corner reticles, optical telemetry, and live status beacon.
* **Orbital Tech Radar**: Concentric rotating orbits with clean monoline glyphs and radar sweep line.
* **Live Data Engine**: Node.js automated updater (`scripts/update-stats.mjs`) pulling 100% verified metrics from GitHub REST and Search APIs.
* **Strict Asset Budget & Accessibility**: Entire asset collection under 250 KB total; complete `prefers-reduced-motion` compliance.

### Out-of-Scope Non-Goals

* **No Raster Video Loops**: No base64 JPEG sequences (like Megha's 33-frame hero) that bloat repositories and cause network latency.
* **No Fictional / Anime Tropes**: Strictly zero gaming or anime references; all visuals follow systems engineering, avionics, and optical telemetry aesthetics.
* **No Unverified Static Data**: No manually typed star or commit numbers in SVGs that can go stale.

---

## Alternatives Weighed

* **Exact Clone of Megha's Layout**: Rejected. Megha's anime aesthetics, static data anti-pattern, and 1.6 MB file size undermine professional engineering credibility.
* **Third-Party External Badges Only**: Rejected. External badge providers frequently suffer from rate limits, high latency, and broken image icons.
* **Self-Hosted SVG + Automated Daily GitHub Action**: Chosen. Combines complete visual control, resilience to network outages, and 100% real-time data accuracy.

---

## Key Decisions & Staging for Next Steps

1. **Asset Limits**: Cap total `assets/` size at 250 KB.
2. **Palette**: Deep Obsidian (`#070A0F`), Titanium Slate (`#1E293B`), Precision Cyan (`#38BDF8`), Amber (`#F59E0B`), Phosphor Green (`#10B981`).
3. **Execution Roadmap**:
   - **Phase 1**: Author `assets/hero-viewfinder.svg` and `assets/orbital-radar.svg`.
   - **Phase 2**: Update `scripts/update-stats.mjs` to dynamically inject live metrics into the new SVG templates.
   - **Phase 3**: Update `scripts/check-svg.mjs` with the 250 KB directory budget gate.
   - **Phase 4**: Rewrite `README.md` to wire all panels into a unified cinema-grade layout.
   - **Phase 5**: Run CI verification checks (`npm test` / health check script).
