# Plan: SudhirDevOps1 profile — Megha-class art, engineered further

**Owner:** @SudhirDevOps1 · **Repo:** `D:\SudhirDevOps1` · **Status:** planning
**Note:** this plan lives outside the repo on purpose — the repo may contain only
`README.md`, `scripts/`, `workflows`, and `assets`.

## Goal

Rebuild the profile README so it plays like a mini movie — the same visual density
and motion quality as `Meghamittal0920/Meghamittal0920` — while removing her two
real weaknesses. Deliverable is **one `README.md`** plus the assets it loads; the
README stays the single file a visitor reads.

---

## Background — what the research actually measured

`megha-profile/` was cloned (`b3082a2`). A PDF text extractor ran over both
build guides (`animated-github-profile-guide.pdf` 17.0 KB, 5 pages;
`animated-github-profile-2page-guide.pdf` 11.6 KB, 2 pages) because the read tool
could not open PDFs in this session — text was inflated out of the
`ASCII85Decode + FlateDecode` streams instead of eyeballing them.

### Her page, measured

| Panel | Size | viewBox | SMIL | CSS keyframes | Embeds |
|:--|--:|:--|--:|--:|:--|
| `megha-banner.svg` / `-light` | 123.5 KB | 1280×740 | 24 | 10 | portrait PNG, 0 fonts |
| `ninja-way.svg` | 90 KB | 1280×520 | 0 | 5 | portrait PNG, 4 fonts |
| `jutsu-stack.svg` | 104 KB | 1280×500 | 15 | 7 | portrait PNG, 4 fonts |
| `ninja-id.svg` | 100 KB | 1280×620 | 38 | 7 | portrait PNG, 4 fonts |
| `id-dashboard.svg` | 134 KB | 1280×600 | 36 | 7 | portrait PNG, 4 fonts |
| `about-life.svg` | 1055 KB | 1280×640 | **1145** | 8 | video-frame carousel, pure vector |
| `hero.svg` | 555 KB | 1280×560 | 41 | 9 | **33 embedded JPEG frames**, 4 fonts |
| `connect.svg` | 104 KB | 1280×440 | 4 | 6 | portrait PNG, 4 fonts |
| `megha-stats.svg` `megha-langs.svg` `megha-trophies.svg` | 4–7 KB | small | 3–7 | 2–4 | none |

Headline: her panels are **7× to 80× heavier** than mine because each one embeds a
**woff2 display + mono font** plus a **portrait raster** inside the SVG.
`hero.svg` additionally embeds **33 JPEG video frames** — every frame of a
2-second clip, base64, toggled with SMIL. That is why her page feels cinematic
and mine feels like a diagram: not talent, *byte budget*. Mine sit at 2.3–14.8 KB
each, capped by my own `check-svg.mjs` 15 KB gate.

### What her guide prescribes (the recipe)

From the single-page guide: typing terminal → name in a **script font converted
to vector outlines** so it renders identically, letter-by-letter gradient pop,
cycling role titles, tech pills, `buildDreams()` code card that types itself,
**flickering neon sign**, hearts + sparkles + particles + pulsing orbs,
**hologram formation** (top-to-bottom scan line), a **continuous 3.5 s scanner**,
`banner-light.svg` switching on `prefers-color-scheme`, lanyard badge with
**damped pendulum physics**, holographic shine sweep, and local
`stats / langs / trophies` cards whose numbers are **typed once and go stale**.

The two-page guide adds: **hero video** framed like a camera viewfinder (corner
brackets drawing in, blinking REC dot, filename label, scrubber bar synced to the
loop), **hobbies carousel** with Instagram-style segment bars, **tech orbit** —
Simple Icons riding three tilted elliptical orbits around a glowing core with two
"moons" that orbit the orbiting icon, and a **3D contribution city** rebuilt
daily by `yoshi389111/github-profile-3d-contrib` (already running here as
`profile-3d.yml`).

### Deliberate rules from her guide worth keeping

- **SVG + CSS + SMIL only** — GitHub strips JS from READMEs, so that is the only
  motion that survives. Verified: every one of her files has `script=no`.
- **SMIL timelines start at 0 s with `keyTimes` delays** and entrance animations
  use `fill-mode both`, so a renderer that ignores animation still shows the
  finished card. This is an accessibility rule, not a decoration rule.
- **`?v=1` cache-busting** on every local image reference — GitHub caches README
  images hard; a stale cache looks like "my edit did nothing".
- **Namespace ids** when composing panels, or CSS from one card bleeds into the next.

### Her two real weaknesses (and therefore the openings)

1. **Stale numbers.** Guide, line: *"Numbers in local stat cards are static;
   refresh them when your stats grow."* Her `megha-stats.svg` bakes values in.
   Mine are **generated daily from the live API** by `update-stats.mjs` and gated
   by the freshness check — that is the differentiator, so it stays.
2. **Zero data honesty.** Her stat cards, project-table stars, and follower count
   are shipped as freeze-frame text. Mine keep REST + Search feeding the page,
   with the badge going red instead of quietly lying.

One more thing her page does not have: my repo **is** the automation. The
profile-as-art is a thin skin over a pipeline that is actually running — nothing
in her version changes by itself overnight.

---

## Constraints — non-negotiables

- README reads as **one file** for the human; art and data are files it links to.
- Repo contains only `README.md`, `scripts/`, `.github/workflows/`, `assets/` —
  no plan files, no docs, no preview HTML.
- **No anime/character copy** — Megha's *technique* is what is being taken, never
  her subject matter. Sudhir's language stays DevOps: terminal, pipeline, gates,
  blueprints.
- **Numbers stay real.** Anything that shows a statistic is either fetched live at
  page load (badge services) or regenerated from REST+Search by the job. Nothing
  hard-coded that can silently lie.
- No network dependency at render time → fonts and raster **inline as base64
  inside each SVG**; no `<script>` in any panel; `prefers-reduced-motion`
  respected; svg ids namespaced per panel.

---

## Deliverable

```
D:\SudhirDevOps1\
├── README.md                        ← the single visitor file
├── scripts\
│   ├── update-stats.mjs             ← REST+Search → README + generated cards (exists, extend)
│   ├── check-svg.mjs                ← quality gate (budget re-tuned per-asset)
│   ├── check-readme-health.mjs      ← images/links/freshness (exists)
│   └── encode-video-hero.mjs        ← frames → SVG encoder (new, only if video is used)
└── assets\
    ├── hero-cinematic.svg           ← 1280×740, viewfinder scene + scan effects
    ├── build-log.svg                ← 1280×640, build-log + carousel cards
    ├── tech-orbit.svg               ← 1280×560, 3 tilted orbits + satellites
    ├── dev-lanyard.svg              ← 420×660, damped pendulum ID with holographic sweep
    ├── live-dashboard.svg           ← 1280×600, KPI tiles + bar chart + "now" panel — GENERATED
    ├── projects-blueprint.svg       ← 1280×520, blueprint-style project sheet
    ├── connect-panel.svg            ← 1280×440, identity + link cards (rework of current)
    └── profile-3d-contrib\…         ← computed on the `output` branch, wired in README
```

---

## Phases

Each phase ends verifiable on its own, so the page never ships half-broken.

### P1 · Rebuild the art pipeline to survive the real budget (prep, 1 session)

Retire the 15 KB blanket. `check-svg.mjs` gates:

- **per-asset budget table** instead of one cap. Static panels —
  `build-log`, `tech-orbit`, `dev-lanyard`, `live-dashboard`,
  `projects-blueprint`, `connect-panel` — cap at **250 KB** (enough for
  inline fonts + one portrait raster; matches the 90–134 KB she actually ships).
  Video-bearing files, if the clip lands — `hero-cinematic`, `build-log` carousel
  — cap at **1.1 MB**, matching her 555 KB / 1055 KB precedents.
- keep: XML validity, `aria-label`/`<title>` present, no `<script>`, no external
  references, `prefers-reduced-motion` present in every animated panel.
- **new rule:** if an `@font-face` is embedded, log the decoded font format;
  PNG (not WebP) mandated for raster — old Safari compatibility.

### P2 · Embed real type and real art (the root problem, 1–2 sessions)

- Adopt her **outline-first** rule for display type: convert headline text to
  vector outlines so it renders identically with zero font files.
- Supplement, not replace, with one subsetted mono+display pair as base64 woff2
  where live data changes (generated card labels), since text projects there
  vary between runs.
- Sudhir identity scene drawn in vector at 1280×740 with the existing token set
  (`#0B0F17`/`#121826` bg, `#161B22`/`#0D1117` panel, `#30363D` border,
  `#36BCF7`/`#A855F7`/`#3FB950`/`#FFD166` accents) — no Megha colors.

Nothing is believed until the local render check opens it and the notes say
"typography identical, portrait reads cleanly at 200 px wide".

### P3 · Cinematic hero (P2 assets → 1 session)

The panel every reviewer judges first. Her technique, new subject:

- corner brackets draw in, blinking REC dot, filename label ticking, scrubber bar
  synced to the loop.
- top-to-bottom **hologram formation** into the frame, then a **continuous
  full-width scanner** sweeping every 3.5 s, clipped to rounded corners.
- name in gradient with a rising mask, cycling role titles, one-line pitch,
  meta row at 1280×740 (she is 1280×560 — mine is taller on purpose: it is where
  every other panel's numbers get read from).
- real frame data: `assets/dev-id.svg` regenerated same hour, `syncedAt` shown.

### P4 · Life of the build (`build-log.svg`, 1 session)

1280×640, two cards:

- **left:** web-browser chrome with URL bar typing `ship.log` + blinking caret;
  beneath it three capability rows she prescribed — icon tile + label + bar.
- **right:** project carousel — my 5 real repos cross-fading every 4 s,
  story-style segment bars, "daily rings" that fill on a loop. Content =
  **repo names read straight from the API at build time**, never typed.

### P5 · Tech orbit (1 session)

1280×560. **Real brand paths from Simple Icons @13** for the orbit ring
(git, github, docker, typescript, python, sql, node) — ~0.6–1.7 KB each,
affordable now that the blanket is gone. Glow core in the middle, three tilted
ellipses, two satellites that orbit a moon that is orbiting the core. Chip grid
grouped Frontend / Backend / DevOps / Data with staggered border-glow.

### P6 · Dev lanyard + live dashboard (1 session)

- `dev-lanyard.svg` 420×660: strap + clasp + portrait frame + gold chip +
  barcode + **holographic foil sweep**; drops from top, damped pendulum, drifts
  into a gentle float.
- `live-dashboard.svg` 1280×600, **generated** by `update-stats.mjs`: KPI tiles
  count-up on entrance, repo bar chart of top-5 stars labeled with real values,
  "now" panel that refreshes every run, so the widget can never go stale.

### P7 · Project blueprint + connect (1 session)

- `projects-blueprint.svg` 1280×520: engineering **blueprint sheet** look
  (grid + dimension lines + title block), each row mapped to a real repo with
  real stars from the API at build time.
- `connect-panel.svg` reworked at 1280×440 with a drawn identity motif.

### P8 · README wiring (the single-file deliverable, 1 session)

- Every link carries `?v=N` cache-bust and `<picture>` dark/light switching.
- Compose order: hero → build-log → tech-orbit → lanyard+dashboard →
  projects-blueprint → 3D city → connect.
- **Plaintext twin** of every number shown in art, as small inline `<sub>`
  strips (already exist for TABLE/MILESTONES markers) — for screen readers,
  no-SVG clients, and search indexing.
- A short **plain-language preamble** at the top for non-technical reviewers.

### P9 · Automation & verification (1 session)

- `encode-video-hero.mjs` only if P3 actually embeds a raster clip; otherwise skip.
- `update-profile-stats.yml` extended: nightly re-render of `live-dashboard.svg`
  + `dev-id.svg`, with cache-bust `v` auto-bump when content has changed.
- `README Health Check` links carry cache busts so the check itself busts.
- Verify: SVG gate extended to every new asset under the P1 budget table, plus a
  reduced-motion render check per panel.

---

## Verification checklist (each phase + final)

1. `node scripts/check-svg.mjs` under the new budget table → pass.
2. `node scripts/update-stats.mjs` then `git status` → only expected files shift.
3. `node scripts/check-readme-health.mjs` → every referenced image + link
   reachable, every generated card fresh.
4. Live page audit (browser DOM, not eyeballs): all referenced images load,
   art/README-body ratio reported, no stale caches.
5. `prefers-reduced-motion=reduce` → every panel's content still legible and
   settled in its final state.

---

## Risks & mitigations

| Risk | Mitigation |
|:--|:--|
| Micro-budget trap (target 15 KB, art needs 100 KB+) | P1 rewrites the gate **first**, before any new art exists |
| SMIL ignored in some README client | `keyTimes` delays from 0 s, `fill-mode both`, final state is the static default |
| Portrait raster makes nearby text unreadable | labels sit on opaque panels, never behind art; text stays vector, only identity/portrait is raster |
| Generated card drifts from the README text twin | both refreshed in the **same run** of `update-stats.mjs`; freshness check flags divergence |
| Cache confusion during iteration | `?v=N` rule enforced before it is ever needed |
| Feature creep breaks the "single file" rule | every new idea must map to either `README.md` or `assets/`; anything else goes to temp |

---

## What "advanced" beats Megha — the scorecard to hit

| Axis | Megha | Target |
|:--|:--|:--|
| Panel byte weight | 90–134 KB each | comparable, minus waste |
| Numbers in art | baked once | **live, regenerated nightly** |
| Panels per page | 7 | 7 |
| SMIL per panel | 24–38 (one panel 1145) | matched, plus scanner/pulse extras |
| Hero | 33 JPEG frames | viewfinder scene |
| Honesty | broken-image-proof only | same + data-freshness gate |
| Reduced motion | unhandled | every panel |
| Scheduled jobs | none | 6 daily/weekly jobs |
| Type fidelity | embedded fonts | embedded fonts **+ vector outlines** |
| Subject | ninja/anime | **DevOps authored** (no copy) |
