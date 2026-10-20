# Flavius Rule Arena — handoff notes for Claude Code

A single-file HTML/JS/Canvas adaptation of **Virgilante's board game "Flavius Rule"** (gladiators in a 13×13 isometric
arena, Roman-themed). Current version: **v1.07** (v1.07 shipped 2026-10-20). Owner: Virgilante. Repo dsoto1/arena.

Modes: **Play Now** (single events, festival, missio, tournament, daily/weekly challenges), **Manager mode** (run a ludus through
12-week seasons), **Creator Studio** (designers), **Hot seat**, **Online** (AWS server in server/), lessons, Annals/Hall, Imperium.

**Where things are written down** (this file = rules + how to work; read the others when the task touches them):
- [docs/modules.md](docs/modules.md) — what every version module does (grep a module name, global or kill switch there before changing an area)
- [docs/history.md](docs/history.md) — every release · [docs/decisions.md](docs/decisions.md) — his decisions + open items (later lines win)
- [docs/known-issues.md](docs/known-issues.md) — what is still open: unfixed reports, accepted limits, flaky tests, waiting on him (keep current)
- [docs/architecture.md](docs/architecture.md) · [docs/backend.md](docs/backend.md) (server, deploy, rollback) · [docs/i18n.md](docs/i18n.md) · [docs/testing.md](docs/testing.md)
- tools/plans/vX.YY/NOTES.md — the release being built (his notes, sorted, his answers) · tools/plans/backlog.md — parked ideas

---

## 1. Working with Virgilante (standing rules)

- **When he sends a list, do NOT build, commit code or publish until he says go** — sometimes he only dumps notes. Read it, sort it
  (fixes vs 🆕 new features), ask the questions (multiple choice, my pick marked, as many as needed, none the request already answers),
  write his answers into tools/plans/vX.YY/NOTES.md, then wait. A release he already approved may finish.
- **NAME WHAT IS REPLACED (his call 2026-10-15):** he does not track earlier decisions and treats anything he sees in the game as a
  decision already made. So whenever a note or answer changes, overlaps or duplicates something that exists (a rule, a screen, a
  setting, an earlier decision in docs/decisions.md or a NOTES file), say it in the questions: "this replaces X (built in vY / decided on
  DATE)", and point out redundancies or a chance to reuse/improve an existing area instead of adding a new one. When he confirms, mark the
  old decision REPLACED in docs/decisions.md — never keep two live versions of one rule.
- **SMALL RELEASES (his pick 2026-10-15):** one batch of notes → split into releases: fixes + small changes first (ships in days), then
  each big feature area as its own release. Each release is played on the BETA before it goes live (§6).
- **STABILIZATION (his call 2026-10-07):** an item he files as a fix that is really a new feature → say so; it goes to the feature release
  or the backlog unless he pulls it in. Fixes go straight into the next build.
- Keep **in-game wording succinct**. No tooltips for internals the player never needs. Tooltips nest **at most 2 levels**; a term never links to itself.
- When a feature is added to one designer, **integrate it into the others** where it fits (same button rows: 📜 rolls · 🔒 lock · Edit · Copy · Delete;
  system sets locked, "Copy & edit").
- **Follow the rulebook** over the printed event cards when they disagree.
- **Deleting a custom creation always asks first** (`DEL76` in 109-v761). A new designer's delete button must use one of those attributes or be
  added to `DEL76`; test `tdel76`.
- Communication: concise and technical. Keep his numbering in questions and summaries.
- **ONE CONVERSATION AT A TIME:** two places work on this repo (VS Code, the cloud session). Before editing run `sh tools/baton.sh status`; take it
  with `sh tools/baton.sh take <vscode|cloud>`; on "wrap up/hand off": update tools/plans/HANDOFF.md, commit, push, `sh tools/baton.sh give`.
  If the other side holds the baton, stop and tell him.
- **QUOTA RULE:** the lead (Opus) plans, reviews, merges and releases; routine fixes, test edits and small code changes go to a Sonnet sub-agent
  (Agent tool `model: "sonnet"`). Big feature builds stay with the lead's model unless he says otherwise.
- **TESTS A BUILDER TOUCHES (his pick b, 2026-10-14):** before reporting, every builder (1) runs `node tools/smartreg.js --dry` for its diff AND greps
  tools/tests for every selector / data-* / visible text it changed or removed, (2) runs those tests (`node tools/smartreg.js -j 2 <names>`) and updates
  the ones it broke ON PURPOSE (keep their intent) or fixes the game, then reports the list. At most 2 builders test at once. The lead merges, then ONE
  smart GitHub run on the combined tree; the full run only at release.
- **VISUAL POLISH RULE:** never improve a beauty shot while making the game harder to read or slower to play. Every visual change keeps passing:
  draw cost (tv91r, tv92p), clarity (tv91r), FRAME TARGET 60 fps mid-range laptop / 30+ fps mid-range phone at Normal speed, zoomed and not (≈16 ms a
  frame; over that is a bug), phones (tv66/tv88, 390 px), languages (tv86/tv87l), saves (SAVE_MIGRATIONS + guards), the dice (trng92), online lockstep
  (tonl*), Reduce motion / Animations Off (a new effect gets an Off path).
- **Deploy tools:** never give him console click-through steps — fix flavius.sh / release.sh instead. CloudShell commands one per line.

## 2. Layout & build

## 2. Layout & build

```
flavius/   (repo root; build.sh and tools/*.py resolve paths from their own location)
  build.sh              concatenates src/ in a fixed order into flavius-arena.html, then node --check → prints SYNTAX_OK
  flavius-arena.html    the built game (references assets/ relatively)
  assets/               ~35 image assets (armor2/chtok are .webp since v0.57; cr_* credits art since v0.59) (arena.jpg card sheet, classes.jpg, weapons.jpg, armor2.png, avatar.png,
                        blessing.png, tunnel_open.jpg / tunnel_door.jpg, rtok.webp, logo.png, map.jpg, …)
  src/<topic>/          ~330 modules in topic folders (see "src/ layout" below; the build order is build.sh's one list)
  share/                self-contained share builds (assets inlined as data URIs), flavius-rule-arena-vX.YY.html
  tools/
    release.sh          ONE COMMAND per release: sh tools/release.sh X.YY (version check → build → hygiene → full regression → share + smoke → zip)
    smartreg.js         adaptive regression (change-aware; see §5); regcov.js = its coverage preload; regstate.json/regmap.json = its committed state
    runreg.sh           plain full regression runner (Playwright tests in tools/tests/)
    tests/*.js          one test per file; each takes the page path as argv[2]
    mkshare.py          python3 tools/mkshare.py 0.54  → share/flavius-rule-arena-v0.54.html (run from project root)
    tshare54.js         smoke test for a share build (expects a copy in /tmp/sharetest39/)
    shot_arena.js       screenshot helper: node tools/shot_arena.js <page> <width> <out.png>
    rename.js / samecode.js   Babel tools used for the readability pass (see §8)
```

- **docs/** explains (this file stays the hand-off): [architecture](docs/architecture.md) · [backend](docs/backend.md) (run/test/extend the server, data, deploy + rollback) · [i18n](docs/i18n.md) · [testing](docs/testing.md).
- Build: `sh build.sh` (must end with `SYNTAX_OK`; it also trips a guard if code follows a `//` comment on one line).
- **When adding a module**, put it in its topic folder (`src/<topic>/NN-name.js`) and insert it in build.sh *before*
  `src/core/08-setup.js` (08-setup must stay last). The folders never change the build order; module NAMES stay unique across
  folders, so notes keep naming modules by name. Tools find a module by name with `tools/srcpath.js` (`rel/abs/order/all`).
- **src/ layout** (regrouped in v1.01, pure `git mv`, the built page byte-identical; `tools/srcmap.json` = old flat name → new
  path, for branches made before; tools/ci/merge.sh matches modules by name and flags a new flat one):
  - `core/` (17) boot + engine: 00b-perf, 00c-errlog, 00d-bus, 01-head.html, 02-data … 06-ai, 08-setup, sim, names, ratings, AI tiers, ready, perf heartbeat, bus emitters
  - `lang/` (5) _T + language packs' glue, CJK, flags, server texts (00-lang, 148, 173, 190, 223a)
  - `ui/` (27) 07-ui, panels, settings, rail, screens, access, phones, action bars, faces (263/268), main menu, frame meter, sandstone buttons
  - `board/` (35) what is drawn on the sand: arena look, tokens/minis, 3D anim + beasts, layers, zoom/camera, FX, hit feedback, bubbles
  - `match/` (27) rules + flow added on the sand: special events, market/draft/loot, deals, items, beasts' cards, briefing, replays, balance
  - `stands/` (11) the crowd: spectators, tickets, Flavius + sponsors, cheering, 3D crowd
  - `gear/` (14) armor/weapons/classes art + fits: avatar armor, armor designer, class cards, severed outlines, pick on the body
  - `studio/` (22) the Creator Studio + designers: tokens, flags + Insignia, sculpt, classes, looks, Event Designer, token modeller
  - `playnow/` (10) Play Now setup, tourneys, guide data, hot seat, daily challenges
  - `manager/` (62) Manager mode: world, calendar, ludus, recruiting, yard, infirmary, armory, council, rooms, any event
  - `online/` (49) Online client + the shared rules `111-onlcore.js` (tools/mkserver.js copies it to server/src/onlcore.js)
  - `audio/` (6) Web Audio, music, sound pass · `city/` (5) the City Square · `lessons/` (3) guide, Manager lesson, first hour
  - `meta/` (5) annals/hall (10-meta), trophies, notes (34-notes = MILESTONES), credits, Tituli
  - `batches/` (30) multi-topic version batches and fix rounds (52-v50 … 284-v100fix) — read the header comment
- Playwright + Chromium are preinstalled (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; do not `playwright install`).


## 3. Architecture

One global script; files are concatenated in order. Later modules patch earlier code by **wrapping**:

```js
{const base=fnName;fnName=function(...a){/* before */const r=base.apply(this,a);/* after */return r}}
```
- Works for `function` declarations and `let` functions. **`const` arrows cannot be wrapped** (e.g. `fixtureFor`, `cfAllowed`).
- A wrapper only sees wrappers installed before it. New features LISTEN on the event bus (`BUS.on`, 00d-bus) where an event exists.
- New batch work goes in a new `NN-vXYY*.js` module in its topic folder, with a header comment listing what it does, and a bullet at the
  end of docs/modules.md. A new behaviour gets a kill switch (localStorage `flavius_<id>off=1`).
- Rules that need a human's choice call `ask()` (326); board/turn events go through `log`/`beat`/`paint` (327); card/beast effects are rows in 328.

### Core globals (engine)
- `S` live event state; `cur()` active player; `EV()` event def; `RD()` current round def (`pve,pvp,cf,ca,end,zone`).
- `log(html,cls)`, `caption()`, `render()` (UI panels), `draw()` (canvas), `drawFX()`, `drawStands()`.
- `center(r,c)`, `pt(r,c)`, `iso()` grid→screen; `TW/TH` tile size; `tl(r,c)` → "A-3" tile names.
- `modal(title,body,buttons,opt)` (Promise); `CUR_MODAL`; `mToast()`.
- `HEADLESS` for sims; **`rand()/pickOne()/rnd()` use the seeded RNG — never call them from UI code** (it changes
  the event's dice); use `Math.random()` for cosmetic/UI randomness.
- Data (02-data.js): `CLASSES` (8 printed: soldier, royalty, hero, slave, veteranus, amazonia, venatore, damnatio),
  `BASE_CLS`, `W` weapons, `ARM` armor (stack:1 = padded/belt, duplicable), `NPCT`, `CARDS` (incl. `pia_*` Piacula),
  `EVENTS` (rounds via `R(name,zone,[pve,pvp,cf,ca],end,reward)`), `LOCATIONS`, `MARKET_W/MARKET_A`.
- Round end conditions live in `checkEnd()` (05-flow) — e.g. `elim1`, `team1`, `rot10`, `alive1/2`, `race`, `exit2`, `eagle`.
- Turn phases: resolve (beasts act) → choice → action → end. Max 2 attacks per turn.

### Persistence
- `Store` (10-meta) = shared artifact DB with localStorage fallback. Collections: `customChars, customClasses,
  customLanistas, customNpcs, customEvents, customPairings (cohorts), customSpecials (invitationals), customTourneys,
  customTokens, customWeapons, customArmor, customTrophies, customFlags, customSponsors, rosterSets, gladiators
  (Ludus Flavius), mgrCareers, mgrArchives, hall, infamis, wallet, crowd, arena, …`.
  **Any new collection must be added to `SAVE_COLS`** (12-settings) so backups include it.
- Per-browser conveniences use `localStorage` keys `flavius_*` (e.g. `flavius_settings`, `flavius_firstrun`,
  `flavius_ctopen`, `flavius_hs` hot-seat profiles, `flavius_roster32`, `flavius_hints54`, `flavius_capfeed53`).
- Saves are versioned: `GAME_VER` comes from the badge text `arena · vX.YY` in `01-head.html`;
  `SAVE_MIGRATIONS` (54-v51, appended in later modules) migrate older Manager worlds; `verAsk` prompts before loading old saves.

- **Cheats:** never put code words in plain text anywhere in the page. Register with
  `cheatRegister('h'+hashStr('code:'+WORD), run, label)`; the reveal list `CHEAT_SHOW` stores char codes +7.
  Current words: EDITOR12 (all editors), MUSIC (every theme, v0.85; the old 16-theme word is retired), LUDUS50 (+50 coin), DUCKIO (bonus house), ARMORFIT (the printed-set fit tool), LOBBY77 (Online preview), ONLSRV (shows the Online server box on the sign-in card). (Touch screens: holding the main menu version badge = the C key, 126.)

## 4. Conventions & gotchas
- Never put code after a `//` comment on the same line — use `/* */` (build.sh guard).
- Avoid broad find/replace across files (once turned `fonts.gstatic.com` into `fonts.gtileic.com`).
- Prefer wrapping in a new module over editing old modules; small direct edits are fine when wrapping is impossible
  (template literals, const arrows). When editing templates with Python, assert the old string exists first.
- A `.tt` class name inside other UI clashed with the tooltip engine — tooltip CSS is scoped to `.tt[role="tooltip"]`.
- Tests that need the main menu set `navigator.webdriver=false` and `localStorage flavius_firstrun='shown'` in an
  init script (otherwise the first-run welcome modal appears).


## 5. Testing
- **While building:** `node tools/smartreg.js <names>` (only the tests your change reaches; `--dry` prints the plan). Never the whole suite locally.
  smartreg is change-aware (V8 coverage maps tools/regstate.json + tools/regmap.json, committed with the release); a failure is re-run alone
  (pass → FLAKY, never hidden). Pass = `exit=0` and `ERRS []`. Details: docs/testing.md.
- Tests wait for `window.FLAVIUS_READY` after `goto`. Tests that need the main menu set `navigator.webdriver=false` and
  `localStorage flavius_firstrun='shown'` in an init script.
- `t12` plays every event (shards t12a/b/c). The replay goldens (`node tools/replay/check.js`, test treplay101) catch rule drift; re-record with
  `--update` ONLY after a deliberate rule/AI change. Rules in Node: tools/node (test tnode101).
- When a UI move breaks an old test intentionally, update the test (keep its intent). Visual checks: a short Playwright script + screenshot.
- Screenshots/mock-up pictures are NOT committed (.gitignore blocks png/jpg/webp/gif under tools/plans except mock100/img3).

## 5b. GitHub Actions
## 5b. GitHub Actions regression (v0.95, replaces the local full run)
- `.github/workflows/regression.yml`: push on claude/** or main (CLAUDE.md, docs, tools/art, tools/plans, share, regstate/regmap/reg.txt ignored)
  or workflow_dispatch(mode). Jobs: plan (tools/ci/plan.js) → 8 test shards (smartreg -j 2 on its test list, REGNOEXPAND=1, Playwright
  install bounded 240 s ×3 tries) → server (npm test, full mode) → report (tools/ci/report.js merges reg-N artifacts, prints CIRESULT).
- Budget tools/ci/budget.json (5000 min/month since 2026-10-10: 2000 free + 3000 he pays for, $24/month, reserve 300; "exclusive" = always full until 2026-10-10, then the SPREAD schedule: full only for
  releases ([full] in the message or version.json changed) or manual runs, smart otherwise, skip when over the daily allowance). A full run ≈
  100 GitHub minutes, ~25 min wall. Put `[skip ci]` in a commit that must not start a run (it also keeps a running one from being cancelled).
- Failing output is printed in the job log (artifacts can't be downloaded through this sandbox's proxy): read it with the GitHub MCP
  get_job_logs (failed_only + return_content) or `curl -H "Authorization: Bearer $GITHUB_TOKEN" …/actions/runs/<id>/jobs`.
- Merge agent branches with `sh tools/ci/merge.sh <branch>` (auto-unites build.sh / runreg DEFAULT / CLAUDE.md, rebuilds); translations:
  `sh tools/i18n/prep.sh` → ONE Sonnet agent with tools/i18n/TRANSLATE.md → `sh tools/i18n/finish.sh`.
- release.sh: REG=local runs the suite here; SHARE=1 builds the standalone + zips (off by default — flavius.sh builds it in CloudShell).


- `.github/workflows/deploycheck.yml` checks flavius.sh + server/deploy.sh on every change to them (syntax, shellcheck, no AWS pager,
  FSH_VER raised).

## 6. Release workflow (from v1.03)
**Branches:** work happens on the session branch (claude/…). A RELEASE is the branch `release/vX.YY` (GitHub here refuses tag pushes, so
release branches stand in for tags) plus `main` moved to it. `flavius.sh release` deploys the NEWEST `release/v*`; `bash flavius.sh release 1.01`
deploys that one = ROLLBACK (the server too, if its code differs). Existing: release/v1.0, release/v1.01, release/v1.02, release/v1.03, release/v1.04, release/v1.05, release/v1.06, release/v1.07.

1. Build the release on the work branch: version badge in `src/core/01-head.html` (`arena · vX.YY` = `GAME_VER`), a `MILESTONES` entry at the
   top of `src/meta/34-notes.js` (short), `SAVE_MIGRATIONS` if world data changed shape, translations (`sh tools/i18n/prep.sh` → one Sonnet agent
   with tools/i18n/TRANSLATE.md → `sh tools/i18n/finish.sh`).
2. `sh tools/release.sh X.YY` — build, hygiene (cheat words, e-mail), version.json, server stamp, site What's new, advert shot. Commit with
   `[full]` in the message + push → the FULL GitHub regression. Fix until green.
3. **BETA:** he runs `bash flavius.sh beta` in CloudShell (newest work branch → play-beta/ on CloudFront's own domain: its own saves, offline only;
   never the server, the live game or the site). He plays it; fixes go back to step 2.
4. **SHIP:** when he says it's good: `git push origin HEAD:refs/heads/release/vX.YY` and `git push origin HEAD:refs/heads/main`, then he runs
   `bash flavius.sh release` (server only when its code changed → game → download → site → status → "Release vX.YY done: …" summary).
   A release that changes the server (protocol, routes) skips the beta's online part — say so to him.
5. Update CLAUDE.md §7 (keep the newest three; the full entry goes to docs/history.md) and the module bullets in docs/modules.md.
- flavius.sh only replaces ITSELF with a release's copy when that copy's `FSH_VER` is higher — raise FSH_VER with every flavius.sh change
  (CI checks it), so a rollback never brings back an old script.
- Before shipping, review any new shared-Store writes and make sure no cheat word appears in plain text (release.sh greps).

## 7. Version history (newest three; all: docs/history.md)
- **v1.05** Match Week + Manager polish (tools/plans/v105/NOTES.md, five betas): Match Week rework 360 + slim banner 374/389 (square locked until
  Set off), your read 361, League seasons 362, Renown 363, careers start S1W1 365, Training Yard rework 373 + compact 388, letters = tasks vs
  mail 378, loans/rudis/seeds/home arenas 379–382, Rivalry Week pairs + free trip 383, starters warning by bouts 384, fallen stay signed 385,
  renewals OVR/form 386, tasks/project chips 387, slim banners everywhere 388/390/392 + one hours chip/rail pill 392, Armory list + Save & quit
  in the rail 391, recruiting jitter fix (378). docs/known-issues.md started. No server change.

- **v1.06** one sun + target clarity + season locks (tools/plans/v106/NOTES.md, two betas): lighting 399 (one sun per arena, cast + contact
  shadows, figures re-lit with shadow sheets, Settings Lighting Full/Light/Off with auto-drop), aim 396 (hover ring/crosshair, tag = chance to
  WOUND from the rules incl. blessings/shields/armor/Focus!/Omnia, Minerva named at 0%, Confirm attacks offline only, no % in Ranked),
  trade/loan deadline after week 8 + Superbus roster lock + no poaching 393, rival trade motives 394, Infirmary injured chip 395; beta-1 fixes
  397 (bouts locked until Set off, sign plates, city edge fade, no city speed control) + 398 (no rings under figures, gold active tile, team chip,
  Match Week results box, Moechus grey), beige base disc at zoom/2× fixed (321). Flaky tests hardened (tv92t, tv104d, tv105x, tv100l). No server change.

- **v1.07** one look for every fighter + frame rate (tools/plans/v106/NOTES.md "Old token pieces" + beta notes, five betas): old token pieces
  retired 400 (3D figures everywhere, 3D stills as the fallback + off the board, minis only in Credits → Prototype, no token-style setting),
  City Square walkers + menu show in 3D 402, 3D corpses 404, frame rate 401 (sheet rows decoded off-thread, light pass in pieces, no GPU
  read-backs) + 405 (face JPEGs without read-back, render keeps panels in place, the ⏺ 10 s frame recorder) + 406 (Safari: Guide ring
  without board redraws, board DPR 1.5 cap → 1, bitmap cells, #perf= switches), aim outline from the drawn cell 403 (bases off) + no
  resize on popups, Settings editors beside Blessings, smaller download (text packs + stripped code), Sotonium house removed quietly.
  No server change.
