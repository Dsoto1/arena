# Performance audit: coupling, slow tests, unnecessary rendering (2026-10-11, v0.99 build)

AUDIT ONLY. No game code was changed. Measurements ran on a shared 4-core machine at load 11–12, in headless Chromium
(software raster), one browser at a time, in 4–10 s windows. Read absolute ms as "this machine". Read ratios (on vs off,
before vs after) as the real signal.

## The summary (for Virgilante)

| # | Finding | Impact | Effort | Risk |
|---|---|---|---|---|
| 1 | **An invisible dot pulses on every screen.** The 📊 Standings "leader dot" is marked hidden, but its CSS overrides that. It draws a glowing pulse under every window, all the time, until idle mode starts after 2 min. | Manager screen idle: **209 → 30 ms of CPU per second** with it switched off (7× lighter). The same happens in the menu, Studio, Online and a paused match. | S (1 CSS line) | very low |
| 2 | **The main menu keeps playing under full-screen windows.** The menu's 28 s intro and its glowing caption keep repainting behind Online, Manager and Studio, which cover the menu entirely. | Online sign-in screen: **604 ms/s** during the intro, ~310 ms/s after it | S | low |
| 3 | **21 looping glow animations repaint every frame.** They animate shadows, filters and backgrounds instead of opacity or position, so each one forces a full repaint 60× a second. | A paused match still burns ~334 ms/s (181 paints/s). The Online landing burns ~550 ms/s. | M | low (looks identical) |
| 4 | **Every Manager click rebuilds the whole Manager page from text.** | Your ludus 31–55 ms, Recruiting **147 ms**, Match Week **195 ms**, Roster 108 ms per click. This is the felt "click lag". | M | medium |
| 5 | **The fighter panel rebuilds ~100 KB of HTML 5× a second while CPUs play.** The accessibility pass then re-measures the colours of every new node. | ~166 ms/s for render() plus ~190 style reads/s during a CPU Normal match | M | medium |
| 6 | **The board's fit check measures the page on every board draw** (offsetParent/offsetHeight right after the panels changed). | The top native cost in a 10 s match profile (483 ms of forced layout) | S–M | low |
| 7 | **t12 plays all 13 events through the full screen at Fast, one shard per CI runner.** Most of that time is drawing nobody looks at. | 637 s of the suite (5 % of it). It could be ~1.5 min with headless sims for most events. | S–M | low |
| 8 | **13 test files are never run by CI.** They are missing from runreg.sh DEFAULT: tv96d/g/k/l/o/r/t/u/w, tv98a/c/f, and the t12 umbrella. This is a coverage hole, not speed. | The v0.96–v0.98 features they cover go untested on release | S | none |
| 9 | **Fixed sleeps and 1-second polling in tests.** There are 1,067 waitForTimeout calls (903 s of literal sleep), and 300 boots at ~4 s each. The flakiest tests are the multi-window online ones. | ~15–25 min of the 211-min serial suite, and most of the flaky re-runs | M | low |
| 10 | **Boot: one 7.5 MB inline script.** It parses and compiles in ~1 s every visit, because an inline script never gets Chrome's code cache. Menu shows at ~2 s, ready at ~4 s. | ~0.6–0.9 s off every visit after the first (estimate) once the script is an external file | M | low–medium (standalone/mkshare) |

**What to do first:** 1 and 2 (an afternoon, near zero risk, and they also speed up every test), then 8 and 7 (tests), then 3, 6 and 4.

**Test-suite savings if 7–9 and the CPU fixes 1–2 land:** about 25–35 min of the 211-min serial suite, which is about 12–17 billed
GitHub minutes per full run (a full run today ≈ 98 billed min). At ~15 full runs a month that is **≈ 180–250 GitHub minutes a month**.

---

## 1. Coupling

### 1.1 Already measured: tools/plans/layers100/PLAN.md (summary)
- The rules (02–06) call the screen directly:
  - 260 log calls
  - 55 decision windows
  - 37 render/draw calls
  - 45 waits
  - 202 of 277 files touch the page as they load
- Wrappers: 187 on 70 core functions, in 69 modules. Codebase-wide there are 1,700 function reassignments in 218 modules.
- Online lockstep depends on window titles, a 300 ms heuristic and hidden twin buttons. There is a probable language bug at 113:56.
- The plan: replay harness (0), then a question port (A), log as events (B) and waits as a presentation port (C). D1/E come later.
- This audit does not repeat that work. It adds what it lacks.

### 1.2 New: whole-codebase wrapper chains (coupling.js → coupling.json)
- **759** top-level function names are reassigned at least once.
- Deepest chains (wrapper layers / modules):

| function | layers | modules | why it matters for speed |
|---|---|---|---|
| endWeek | 35 | 30 | every week end runs 35 nested passes |
| mgrHTML | 29 | 23 | **every MGR_REDRAW** runs 29 string/DOM post-passes (see 3.4) |
| modal | 23 | 22 | every window; about 40 places recognise windows by their translated title (PLAN 1.3) |
| render | 22 | 20 | 5×/s during CPU play (3.5) |
| beginTurn 18 · nightHTML 17 · gameOver 16 · newWorld 15 · startEvent 15 · applyBout 14 · settingsHTML 14 · newState 13 | | | |
| menuShow 12 · detailHTML 12 · weekChecklist 12 · draw 12 · onlPlayHTML 12 · log 11 · mkPlayer 11 · drawPlayer 11 · boardHTML 10 · onlRoomHTML80 10 | | | |

### 1.3 New: full replacements that silently drop earlier wrappers
These are reassignments whose new body never calls the old function, installed after one or more wrappers. Every wrapper
installed before the replacement stops running. The detection is heuristic, so review each one. Most are documented as
"replaced", but nothing guards them: a future wrapper on the wrong side of a replacement dies silently.
- `giveLoadout`: 62-rules53.js:27
- `onlPlayHTML`: 124-v81onl.js:194 (drops 2 wrappers)
- `wardHTML76`: 151-v87ward.js:64, then 183-v90ward.js:167
- `yard87Row`: 184-v90yard.js:67
- `marketBuy75`: 179-v89market.js:50
- `rosterStudioHTML`: 110-v77.js:58
- `portraitSVG`: 263-v99face.js:130, 268-v99face2.js:673
- `mmAfterClose`: 79-screens.js:40, 166-v89fix.js:21
- `showRules`: 246-v98ui.js:306
- `audListRefresh`: 45-music.js:124, 159-v88set.js:41
- `d89Kits`: 234-v96onl.js:107
- `l89ProfHTML`: 252-v98onl.js:203

(False positives were removed: menuShow at 52-v50:31 captures through a ternary; `fx` at 268:598 is a local.)

**Cheap guard:** after load, a dev-only check that each replaced name has no wrappers installed before it. Or a comment
convention like `/* REPLACES name (drops: …) */` that tests can grep.

### 1.4 New: shared mutable globals (files that use / files that WRITE them)

| global | declared in | used by | written by |
|---|---|---|---|
| S | 03-engine | 159 | **71** |
| ctx (the board's canvas 2D context) | 07-ui | 60 | **44** |
| MGR | 17-manager | 59 | 34 |
| ST (Studio) | 15-custom | 36 | 28 |
| SETTINGS | 12-settings | 49 | 21 |
| CFG | 08-setup | 29 | 20 |
| NET | 112-online | 26 | 20 |
| ONL | 112-online | 31 | 18 |
| MOCK_ROUTES | 112-online | 21 | 17 |
| cv | 07-ui | 38 | 13 |
| W (weapons) | 02-data | 77 | 11 |
| CUSTOM | 15-custom | 42 | 10 |
| ARM | 02-data | 59 | 9 |
| CLASSES | 02-data | 80 | 6 |

- 176 distinct `S.*` fields are written somewhere.
- Fields written by the most modules: S.over 11 · S.pillars 8 · S.mode 7 · S.busy 7 · S.floor/chest/phase/zoomIn 5.
- `ctx` written by 44 files means 44 modules swap or re-point the board's drawing context. That is fragile for the planned
  renderer/layer work (it is how 192/208/219/260 draw into caches).

### 1.5 New: load-time work and the size of the one script (boot.js, mkboot.py → boot.json)
**Size:**
- flavius-arena.html is **7.50 MB** (2.79 MB gzipped).
- The inline script is 7.31 MB.
- 645 KB of it is base64 data URIs: 02b-standees.js alone is 554 KB, plus 106-v75 45 KB and 74-zora 33 KB.
- Comments + whitespace are ≥ 0.39 MB (scanner lower bound).

**Parse and compile, per visit (two runs, http):**

| step | ms |
|---|---|
| V8.ParseProgram | 392 |
| PreParse | 242 |
| CompileCode | 335 |
| CompileScript | 212 |
| EvaluateScript (total) | 1,255 |
| ParseHTML (incl. the script) | 1,612 |

**Boot timeline:**
- The script starts at ~0.8 s.
- The main menu is up at **1.84–2.15 s**.
- DOMContentLoaded comes at 3.3–3.7 s and load at 3.8–4.2 s.
- **FLAVIUS_READY comes at 3.85–4.26 s.** It waits for `load` (22 image requests) and the 600–1500 ms boot loaders.
  READY_MIN_MS 1600 is not the binding limit.
- 34 setIntervals, 109 setTimeouts, 23 MutationObservers and 672 listeners are armed by READY.

**Per-module top-level time (the instrumented copy):**
- All 280 modules take 636 ms together. Two modules account for 545 ms of it:
  - 08-setup.js: 366 ms (the menu build and first draw)
  - 12-settings.js: 179 ms (applySettings)
- Every other module is < 4 ms; 258 of them are < 1 ms.
- So "277 modules of load-time work" costs almost nothing. The cost is the parse/compile of 7.3 MB and the first menu build.

**Levers:**
1. **Serve the script as an external file** (play/ only; mkshare keeps inlining). Chrome then caches the compiled code after the
   2nd visit. Inline scripts are never code-cached. Estimated saving: 0.6–0.9 s of the ~1.2 s compile on repeat visits.
2. **Move 02b-standees' 554 KB of base64 out to assets/** (lazy, like three93.js). That is −7 % of the bytes parsed on every boot.
3. **Profile 08-setup's 366 ms.** The menu figures are already lazily decoded (MM95), but the first build is still a third of a second.

---

## 2. Slow tests

Sources:
- tools/regstate.json (290 tests, run 314). Its times were recorded locally under -j 3 load, so they are inflated vs CI.
- tools/ci/plan.js / budget.json.
- GitHub run 38086350101: 8 shards, 8.2–13.5 min each, setup ~0.6 min per shard, ~98 billed min.
- Static scan: slowtests.tsv (waits, pages, boots and sims per test).

### 2.1 The 25 slowest tests in the CI list

| test | s | runs/fails/flaky | why it is slow |
|---|---|---|---|
| tonl78 | 376 | 32/2/2 | 4 windows on the mock, a Familia match played in lockstep with stands turns + a late watcher; waits up to 60 s |
| tv82o | 327 | 33/**12**/4 | several windows; 17 fixed waits (6.3 s); twelve 20–60 s waitForFunction timeouts; reload |
| tv93k | 292 | 8/0/0 | three.js loaded + token sheets rendered; 9.9 s of fixed waits; plays an event to draw the token |
| t12c | 287 | 13/0/0 | 5 events played **through the UI** at Fast, 1 s polling (t12.js:24) |
| tb1 | 214 | 59/2/1 | plays a whole event in the UI, polls every 1 s (tb1.js:22) + 5.9 s waits |
| t12a | 211 | 16/0/0 | 4 events through the UI (shards are unbalanced: a 211 / b 139 / c 287) |
| tonl94 | 207 | 8/1/0 | 2 windows; token upload in parts + Safari WebP fallback (wasm) |
| tv93l | 199 | 10/3/1 | two pages (layers ON vs OFF) pixel-compared + 3 simEvents + 200-frame draw loops |
| tonl80 | 195 | 47/9/4 | 3 windows; 12.5 s fixed waits |
| tv96a | 172 | 7/0/0 | action-bar walk with hover previews at several viewports; 90 s waitForFunction cap |
| tonl83u | 170 | 30/**10**/5 | 2 windows; 16 fixed waits (8.9 s); reload |
| tv87l | 166 | 19/2/0 | spawns the tv86 screen walk **5 times** (it, pt, fr, de, zh): 5 boots + 5 walks |
| tb7 | 165 | 57/0/0 | seeds a Manager world (season sims), polls every 1 s (tb7.js:27) |
| tv81o | 158 | 25/4/2 | 4 pages; **16 s** of fixed waits |
| tseed46 | 153 | 55/0/0 | simToEnd through the UI, 500 ms polling |
| tonlws80 | 153 | 32/5/3 | 3 windows on the REAL handler; **15 s** of fixed waits |
| t12b | 139 | 13/0/0 | 4 events through the UI |
| tonl98f | 132 | 1/0/0 | online lockstep at Fast + Normal, turn end stretched 1.5 s |
| tv82s | 128 | 26/1/0 | stands group turn online; 3.7 s waits |
| ttoss | 123 | 56/0/0 | a full event at 'snap' with 250 ms polling |
| tonl84 | 119 | 29/7/4 | 20 fixed waits (7.4 s), 2 reloads |
| tv88p | 116 | 23/0/0 | 3 contexts (phone sizes), 3 boots |
| tflick | 111 | 55/0/0 | 40 screen switches watched for flicker |
| tcity | 110 | 65/0/0 | City Square walk; **10 s** of fixed waits; canvas commit-heavy (3.7) |
| tonl83 | 110 | 27/2/0 | online treasures; reload |

Totals:
- The full CI list holds 281 tests, **211 min serial**.
- 89 tests play an event to `S.over` through the UI (99 min serial).
- 43 online tests take 62 min.
- 79 Manager tests take 51 min.

### 2.2 Flaky tests (regstate `flaky` = failed, then passed alone on the same build)

| test | fails / runs | flaky re-runs |
|---|---|---|
| tv82o | 12/33 | 4 |
| tv86 | 11/31 | 5 |
| tonl83u | 10/30 | 5 |
| tv91r | 10/26 | 5 |
| tonl80 | 9/47 | 4 |
| tonl80r | 9/31 | 5 |
| tv91n | 7/15 | 5 |
| tonl84 | 7/29 | 4 |
| t12 | 6/45 | 5 |
| tv59 | 6/64 | 4 |
| tv94m | 6/20 | 4 |
| tv95c | 6/15 | 3 |
| tonl79 | 6/35 | 3 |
| tonlws80 | 5/32 | 3 |

- The pattern is multi-window online tests and screen walks that use fixed sleeps.
- Every flaky failure costs one extra solo run of the test (60–330 s each) and sometimes a "domain" expansion.

### 2.3 Fixes, with estimated savings
Savings are given as serial minutes saved per full run. Billed CI minutes ≈ serial ÷ 2 (two tests per runner, setup ≈ 0.6 min/shard).

1. **t12: sims instead of UI for most events** — ~9 min
   - Keep 2–3 events visual (e.g. democritus, chariot, naumachia). Play the rest with the headless `simEvent` (50–90 ms each per
     PLAN §4) and keep the same log assertions.
   - Or keep the UI flow and cut its draw cost with `LAYERS93.debugOff` on all layers plus a no-op render while `SPEEDMUL.fast=0`.
   - Rebalance SHARDS (today a 211 / b 139 / c 287 s).
   - Saves ~637 → ~90 s.
2. **Condition waits instead of sleeps** in the top 12 by literal sleep — ~3 min, and most of the flakes
   - The 12 tests: tv84 23 s, tv81o 16 s, tonlws80 15 s, tonl80 12.5 s, tcity 10 s, tv93k 9.9 s, tonl83u 8.9 s, tonl80r 8.2 s,
     tonl84 7.4 s, tv82o 6.3 s, tb1 5.9 s, ttoss 5.5 s.
   - Change the 1000 ms polling loops (tb1, tb7, t12, and 6 others) to `waitForFunction(…, {polling:100})`. That saves up to 1 s per
     wait and ~0.5 s on average.
3. **Fix findings 1 and 2 in the game** — ~5–10 min (estimate)
   - Every test page today pays ~180–300 ms/s of CPU for the hidden pulse, plus up to 600 ms/s for the menu intro whenever a test
     opens a window from the menu without `menuHide()`.
   - On a 2-vCPU runner running 2 tests that is a real 10–25 % contention.
   - Optional: a `flavius_test` localStorage flag that skips the 28 s menu intro (tmshow keeps it).
4. **Shared boots** — ~5–8 min
   - 305 `goto`s at ~4 s each is ~20 min serial.
   - Merge the old version tests that tools/plans/regprune.md lists as fully covered (tv62, tv51, tv65, tv58, tv61, tv50, tv52,
     tv53; ~1.5 min) into their supersets.
   - Make multi-step tests reuse their page instead of a fresh `newPage` per step: tv88p 3 boots, tv84 3, tonl80r 3, tv81o 4.
   - tv87l could walk 5 languages by switching `flavius_lang` and reloading one page. That still pays a boot per language, but
     drops 5 node + browser launches.
5. **Use CI times for sharding.**
   - plan.js balances on regstate times recorded locally under load. The CI shards span 8.2–13.5 min, and wall time is set by the
     slowest shard.
   - Record per-test times from the CI reg.txt (tools/ci/absorb.js already reads results) into a `ciTime` field and shard on it.
   - Saves ~2–3 min of wall time per run. Billed minutes stay the same.
6. **Add the 13 missing tests to DEFAULT** (tools/runreg.sh) and have smartreg warn when a tools/tests/t*.js file is not in it.
   - The same gap happened at v0.84 (16 tests), so a guard pays off.
   - This adds ~5 min of serial time, but it is coverage the releases assumed they had.

**Total for 1–4:** ≈ 22–30 min serial ≈ **11–15 billed min per full run**. At ~15 full runs a month (20 runs since 2026-10-01, all full
until the exclusive week ended) that is **≈ 165–225 min a month**. The smart-mode runs between releases gain proportionally.

---

## 3. Unnecessary rendering

Tools:
- `measure.js` → scenes_*.json. Per scene with no input it records:
  - render/draw/… calls per second
  - innerHTML writes by target
  - layout-reading calls, stack-sampled
  - CDP Layout/RecalcStyle counts
  - PERF92 runs
  - real setInterval fires and rAF callbacks by callback
  - running CSS animations
  - trace decodes, paints and commits
  - heap and DOM
- Plus `tools/perf95/prof.js` for function self-time.

### 3.1 Scenes at a glance (CPU ms per second of wall time, no input)

| scene | task ms/s | paints/s | commits/s | what is running |
|---|---|---|---|---|
| main menu, intro playing (first 28 s) | 586 | 177 | 59 | mmLoop rAF 63/s (08-setup.js:430, stops at 474 after 27.6 s) + mmglow |
| main menu, after the intro | 295 | 180 | 60 | `pulse #leadDot` (hidden) + `mmglow .mmed` text-shadow |
| main menu, idle mode (2 min) | 16 | 0 | 3.5 | idle92 works: script 3 ms/s |
| CPU match, Normal | 929 | 50 | 15.5 | render 5.1/s × 32 ms, draw 18/s × 8.6 ms, decodes 75/s |
| same match, paused | 334 | 181 | 60 | `pulse #leadDot` + `pulse .turnind .dot` (both box-shadow) |
| Manager Your ludus / Recruiting | 224 / 231 | 120 | 60 | only `pulse #leadDot` (covered by the window). **209 → 30** with it off |
| City Square | 1,005–1,066 | 13.5 | 5.5 | cityDraw 6.6/s × 7.8 ms; the 1100×824 canvas commit 888 ms/s (software raster) |
| Online sign-in, intro behind | 604 | — | — | mmLoop behind a full-screen window |
| Online landing (mock, signed in) | 550 | 231 | 58 | 6 `omapB .omap-dot`, `onlplay89 .on` (box-shadow), and the hidden leadDot + mmglow |
| Studio (characters) | 237 | 120 | 60 | only `pulse #leadDot` |

No needless full redraws were seen in quiet scenes: MGR_REDRAW, onlRedraw and studioRedraw were 0/s with no input. The waste in
quiet scenes is all CSS repaint and hidden canvases.

### 3.2 R1: the hidden leader dot (S, the biggest win per line)
- **Cause:**
  - 01-head.html:1152 renders `<span class="leaddot" id="leadDot" hidden>`.
  - 01-head.html:162 `.leaddot{display:inline-block;…;animation:pulse 1.6s infinite}`. Author CSS `display` beats the UA's `[hidden]`
    rule, so the dot is laid out and pulses.
  - `pulse` animates `box-shadow` (01-head.html:289), which repaints every frame. The dot sits under the window (elementFromPoint =
    #mTitle).
- **Measured:** Manager idle 209 → 30 ms/s with `animation:none`.
- **Fix:**
  - `.leaddot[hidden]{display:none}`.
  - Optionally pause animations under a full-screen window (`body.chromeoff`, 91-v69, already exists).

### 3.3 R2 / R3: animations that repaint, and the menu under windows (S / M)
- **Main menu under windows:**
  - `#mainMenu` stays unhidden under full-screen windows. 08-setup.js:431 `mmLoop` checks only `m.hidden`.
  - 230-v95perf.js:221 restarts the intro (`MM.t0=now`) on each menuShow.
  - **Fix:** treat "a full-screen window covers the menu" as hidden for mmLoop and the menu animations (add a class while
    CUR_MODAL/#onl/#mgrBody is up).
- **Repainting keyframes:**
  - 21 of the 38 infinite keyframes animate paint properties. List in keyframes.txt:
    - pulse, gglow, leadflip, ludbeat, nightbeat, onlplay89, perkpulse, pu96p, sug96, sugpulse, chestGlow82, nw83leg, mmglow
      (shadows)
    - gift83glow (filter)
    - gshine, holo84sheen, cu98s (background-position)
    - chestSheen82 (left)
    - flow, glow90, injp (SVG)
  - **Fix:** the standard compositor-only form. Put the glow on a `::after` with a fixed shadow and animate its `opacity`/`transform`.
    It looks the same and costs no repaint.
  - Idle mode (204) already pauses them after 2 min. This removes the cost in the first 2 minutes and in active play.

### 3.4 R4: Manager redraws by innerHTML (M)
- 17-manager.js:1766: `$('#mgrBody').innerHTML=mgrHTML()`. It has 91 call sites.
- Measured per call:
  - Your ludus: 31–55 ms (49 KB)
  - Recruiting: 147 ms (207 KB)
  - Match Week: 195 ms (101 KB)
  - Roster: 108 ms (163 KB)
  - League: 79 ms
  - Armory: 70 ms
- `mgrHTML()` alone is 14.6 ms (29 wrapper layers). The rest is HTML parse, node creation and the MutationObserver passes that react to
  ~3,000 new nodes: setGridify, a11y 220, st/imm88, av92Paint (which observes the whole document).
- **Fix:** patch with `morph91` (198-v91morph, already used by Online) or 230's `morph95`, keyed on `[data-*]` rows. Keep the
  innerHTML path behind a kill switch.
- Expected: a click that changes one card costs only that card (an estimated 5–10× on Recruiting/Match Week).
- **Risk:** handlers that assume fresh nodes, `<details>` open state (morph91 keeps it), focus.

### 3.5 R5: the arena panels during CPU play (M)
- render() runs 5.1/s at ~32 ms (166 ms/s).
- Each render still builds the full HTML into twins before morph95 patches:
  - #board 48 KB and #npcPanel 43 KB per render
  - 110 innerHTML writes/s
  - 330 K characters/s
  - ParseHTML 206/s
- 220-v93a11y's contrast lift walks ancestors with getComputedStyle for every added node: ~190 style reads/s
  (`a11yBg93` 220-v93a11y.js:142, `a11yLift93` :148, observer :162). A sampled profile shows morph95Node 75 ms + a11yLift93 37 ms
  per 10 s.
- **Fix:**
  1. Render a panel only when its inputs changed (a hash of S fields per panel; #npcPanel changes rarely).
  2. a11y: skip nodes morph95 kept, and cache the lift result per (colour, background) pair.
  3. Image decodes still run at 75/s (37 ms/s) on http. Check which cut-outs (`cut95`) miss: the trace in scenes_event.json.

### 3.6 R6: forced layout in draw() (S–M)
- Profile (10 s, CPU Normal): the top native self-time is `get offsetParent` at **483 ms**. That is layout forced by reading geometry
  right after render() changed the DOM.
- Readers called on each draw:
  - 122-v81play.js:143–149 (`fitReserve`: dock/hover/ticker `offsetParent` + `offsetHeight`)
  - 163-v88fix.js:46 (`bar88Hold`)
  - the 110 ms night timer, 189-v91night.js:147 `cv.offsetParent`
- 230 added ResizeObservers (FIT95), but these reads remain.
- **Fix:** take the heights from the ResizeObservers, and read the bar once per frame before any write.

### 3.7 R7: City Square (M, partly a headless artefact)
- The visible `#cityCv` is 1100×824. cityDraw runs 6.6/s at 7.8 ms, but the commit/raster costs 888 ms/s on this software
  rasteriser (5.5 commits/s at ~160 ms). A GPU will be much cheaper.
- Still: cache the static forum (buildings, ground) in a layer like 192's, and redraw only the moving figures.
- Check on a mid phone before investing.

### 3.8 Low-cost background work (S, low impact; keep in mind for batteries)
- **Real timers wake the page ~50×/s in every scene, even in idle mode.**
  - The timers:
    - the night-flicker guard (110 ms, 189:145)
    - plActFix82 (120 ms, 126:113)
    - g89Flush (200 ms)
    - audBarsSync
    - onl80Answer
    - cd83
    - plTick
    - onlWaitGuard81
    - mtTick
    - tutTick
    - and the invite check
  - Each returns at once (idle script total 3 ms/s), but together they keep the CPU awake.
  - Gate them on their mode (an online match / phone / tutorial) or file them in PERF92.
- **PERF92's 29 sweeps** run 1–3×/s each in quiet scenes (the "2× its delay" rule), ~45 runs/s. Cheap: 5–16 ms/s of script in
  quiet scenes.
- **The av92Paint observer** (212-v92pick.js:41) watches class/hidden/disabled changes on the whole document. It fires a rAF 4–8×/s
  everywhere and returns unless #modal is open. Observe only #modal instead.
- **23 MutationObservers are armed at boot.** Several watch `document.documentElement` with subtree.

### 3.9 Memory over a few minutes (low)
- 3 min of CPU Normal play (measure.js MEM=6):

| | start | after 3 min |
|---|---|---|
| JS heap after GC | 11.1 MB | 14.5 MB (~1.1 MB/min; the log and S grow) |
| CDP Nodes (incl. detached) | 10.3k | 14.0k (peak 16k) |
| document nodes | ~2.5k | ~2.5k |
| listeners | 746 | 756 |

- No leak worth acting on now. Recheck with tv92p's soak after the R4/R5 morph changes.

---

## Files
| file | purpose |
|---|---|
| `measure.js` | scene meter (`node tools/plans/perf100/measure.js menu,menuidle,event,mgr,recruit,city,online,studio`; env SECS, MEM, TAG) |
| `boot.js` + `mkboot.py` | boot timeline + per-module top-level time. mkboot writes `.perf100-boot.html` in the repo root: delete it after. |
| `coupling.js` → `coupling.json` | wrapper chains, replacements, shared globals, S writers (needs typescript: NODE_PATH=/tmp/ci/node_modules) |
| `slowtests.tsv` | every CI test: time, fails, flaky, fixed waits, pages, boots, sims |
| `keyframes.txt` | infinite animations by property class |
| `scenes_*.json`, `boot.json` | the raw numbers quoted above |

---

## After (2026-10-11, the five cheap items; src/288-v100perf.js + test edits)

Measured with the same `measure.js` (6 s windows, headless Chromium, software raster) on a machine at load 16–40 shared with other sessions:
read the ratios. `node tools/plans/perf100/cmp.js` prints this table from `scenes_before.json` / `scenes_after.json`
(new scene `onlsign` = the Online sign-in card with the menu intro still playing behind it).

| scene | before task / script ms per s | after task / script | paints/s before → after | commits/s before → after |
|---|---|---|---|---|
| Manager, Your ludus | 448 / 44 | **61 / 19** | 94 → 0 | 47 → 8 |
| Online sign-in (menu behind) | 1144 / 90 | **55 / 13** | 133 → 0.5 | 44 → 5 |
| paused match | 658 / 21 | **57 / 21** | 152 → 0 | 50 → 3 |
| match, CPU Normal | 1454 / 256 | 1271 / 223 | 36 → 8 | 13 → 3 |
| main menu, intro playing | 1000 / 62 | 926 / 74 | 104 → 0 | 35 → 45 |
| main menu, after the intro | 558 / 12 | 373 / 10 | 148 → 0 | 50 → 50 |

- **1 · menu under windows.** `#modal.full` covering `#mainMenu` stops `mmLoop` (clock held, resumes where it was, checked: covered → no rAF, closed → rAF back and `MM.t0` shifted)
  and `body.mm100cov` pauses the menu's CSS animations. The sign-in scene fell from 1144 to 55 ms/s (the other two items matter there too: the dot and caption glow).
- **2 · glows.** Of the 21: 14 keyframes redefined as `filter` pulses (`mmglow gglow ludbeat nightbeat perkpulse chestGlow82 nw83leg onlplay89 pu96p sug96 sugpulse leadflip`),
  `pulse` (leader + turn dots) = a `::before` ring on transform/opacity, `chestSheen82` = translateX, `cu98s` stripes and `gshine` (grade A) = translated pseudo layers.
  Not converted, with reasons: `flow`, `glow90`, `injp` (SVG attribute paint), `holo84sheen` (its ::after is the clip box of the card), `gift83glow` (already a filter animation).
  After: no running animation repaints (paints/s 0 in the menu, paused match and Manager; the commits left are compositor frames). Idle / calm / reduce-motion still stop them (the pause rules match `::before`/`::after`).
  Look: the same colours and timing; glow shapes follow the element's alpha (drop-shadow) instead of its box, the dot halo is a thin expanding ring (was a filled spread), grade A's sweep is a white band over a still gold chip.
- **3 · forced layout.** `bar88Hold` now measures inside its own ResizeObserver; the draw-time call returns once the observer has reported (sizes unchanged: the same code runs, only where layout is clean).
  fitReserve was already cached by 230's FIT95 (the audit's 122/163 lines are the wrapped bases). Forced-layout sites in a CPU-Normal match: `bar88Hold<fitReserve<draw` gone; layout 108 → 69 ms/s.
  The remaining sampled sites are the a11y contrast lift (`a11yBg93`, finding 5, not in this batch).
- **4 · t12.** One on-screen event per shard (a naumachia 21 s, b gauntlet 31 s, c orpheus 36 s nominal), the other ten events as headless `simEvent` sims in one page (1–6 s each), the same
  seats/options and the same log counts printed; the test now also prints `ERRS [...]` (page errors, a sim error/timeout, an event that never ended fail it; the old loop passed silently after 150 s).
  Recorded under load (smartreg -j 1, regstate times): t12a 211 → 44 s, t12b 139 → 23 s, t12c 287 → 120 s (before 637 s total, after 187 s; on an idle CI runner the on-screen events take their nominal 21–36 s, so ~35–45 s a shard).
  The umbrella `t12` (no argument) runs every shard's plan: 717 → 453 s under this load. Coverage: all 13 events still end through their own end condition (every result row prints `over:true` and the winner line).
- **5 · sleeps.** The 1 s / 250–500 ms polling loops of tb1, tb7, tres, tseed46, ttoss, tv87i became `waitForFunction(…,{polling:100})`; 900 ms boot sleeps (tb1 ×2, tb7, tcity, ttoss) → `FLAVIUS_READY`; tcity's 2.5 s + 1.5 s → "square has npcs" + 0.6 s + 0.9 s; tv93k's 3 s → "the sheet is decoded"; the 300–500 ms poll steps in tv84 / tonl83u / tonl84 / tv93k's `until` → 100–150 ms.
  Kept (timing, not state): the settle waits before screenshots, tv93k's 5 s "no second conversion" negative wait, tonl80/tonlws80/tv82o waits (their loops were already condition polls at 200 ms; the audit's literal-sleep sums are mostly those loop steps).
  Run times (regstate, same load, before → after): tcity 110 → 23, ttoss 123 → 61, tb1 214 → 104, tonl83u 170 → 54, tseed46 153 → 124, tb7 165 → 138, tv84 108 → 93, tonl84 119 → 110; tres 35 → 39 and tv87i 65 → 83 are load noise (the waits there only got shorter).
  Asserts unchanged.
- **Tests run** (`node tools/smartreg.js -j 1 t12a t12b t12c t12 tv92p tv91r tv93l tv98a tmshow tb1 tb7 tcity tres tseed46 ttoss tv84 tv87i tv93k tonl83u tonl84`): 18 pass, tv93k flaky (failed once under the load, passed alone), tv92p failed once under load and passed alone (`ERRS []`, busy ms/s unmanaged 56 · active 54 · idle 31).
