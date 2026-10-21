# v1.08c — Stability & Tooling (PLAN, waiting for his go)
Origin: the approved roadmap (tools/plans/ROADMAP.md §3 v1.08c + §7, his Q1B 2026-10-21; docs/decisions.md 2026-10-21 "next = v1.08c").
PLANNING ONLY — nothing below is built. Numbers measured 2026-10-21 on branch claude/cloud-credits-usage-vq4w63 (HEAD 74a3539).
Each item: evidence · owner · overlap/replaces · approach · effort · risk · tests · kind (FIX = game behaviour, TOOL = tests/tools/docs).

## 0. Carried in (not in ROADMAP §7, already named for v1.08c in docs/known-issues.md 2026-10-21)
- **0a FIX · Safari bear corpse 2–3 tiles + blurry** (CONFIRMED on live v1.08b, Mac Safari 26.6, DPR 2, zoomed, night; 404's size guard
  misses it). Lead's fix is in progress. Suspects sit on three caches with three different identity notions (see 7: 404 `CV107.lie`
  key = sheet key + source x + scale step, not the image; 406 W3 bitmap copies; 410 swaps `BEAST100_META[k]` to the 2× meta).
- **0b FIX/perf · bs101Off read-back** (321 `bs101Off < bs101Proc`, bases-off clean-up): 29 calls = 821 ms in one 10-s Safari recording
  (≈ 28 ms each, file 075400). known-issues says the Safari 1.5× retry waits on removing it → see Q7.

## 1. CI timing / flaky tests — TOOL (no game change expected)
**Evidence.** Flaky set from known-issues: tv106d tv100z tv104d tv104e tv105o tv95c tv85f tv85r tv76 tv96g tv101c tv98d tv91n tv59 tv93a
(runs 39182866366, 39185815500, 39475335064, 39491859097, 39495296888, 39543023058 [tv106d FAILED 5a; flaky tv104e tv105o tv85f],
39546646158). Suite-wide: 4012 fixed sleeps (`W(n)`, `W8(n)`, `waitForTimeout(n)`) in 217 files; 36 files define their own `until`/poll
helper; 34 files patch `Math.random=` ad hoc. Only shared helper today: `tools/tests/_st98.js` (Studio tab reveal). Two causes, not one:

| class | tests | evidence | fix |
|---|---|---|---|
| A · random Manager world (12 of 15) | tv104d tv104e tv105o tv95c tv85f tv85r tv76 tv96g tv101c tv98d tv91n tv59 | all call `newWorld` (153 test files do); world id `'c'+Date.now()` (src/manager/17-manager.js:262); 314 `Math.random()` in src (133 in manager); per-world RNGs keyed by that id (`fa85R(w,…)` 141-v85faith.js:113, `grow96Roll(w,…)`) → every run is another world. tv104d.js:74/97 already hold Math.random for two week ends. | seed the world in the test (R1, below), then fix each test that reads a random fact |
| A′ · test bug exposed by A | tv85f | rival case pushed as `face` (tv85f.js:49) but `rosterOf(rv)[0]` may already have an edict case set to `bribed` at :34; `E.cases.find(c=>c.gid===rg.id)` (:57) returns the OLD case → "bribed instead of face" | pick a rival fighter without a case |
| B · board/frame timing | tv106d | 22 `W()` after pointer moves (tv106d.js:49–107); `AIM106.figs` is cleared on EVERY `drawLayers93` (396-v106aim.js:244) and refilled only while target figures are drawn; hit test = last frame's figs (396:177–182). GitHub draws more frames (rec 756 vs 474) → a draw without the figures between `pts()` and the tap empties the list. DIAG106D from run 39543023058 not yet read (artifact blob blocked; read with MCP get_job_logs first). | wait for `aimReady` (both targets in figs + tmap, no pending rAF) before `pts()` and each pointer step; replace `W(300)` after a tap with `until(AIM106.sel)` |
| B | tv100z (4d, `PACE96.depth 1`) | `SPEED='pause'` (tv100z.js:106) lands while a CPU move is inside `fast96Batch` (235-v96fast.js:31–33: depth++ … pause holds the step) → depth never clears; the 10-s loop (:108) can't help | pause at a turn boundary: wait BUS `turn.begin` / `!PACE96.depth` before pausing |
| B | tv93a (focus return, 1 in 8 locally) | already polls 6 s; 220 `a11ySyncSoon93` 40 ms debounce (220-v93a11y.js:118) vs Escape under load | `popupSettled` (modal hidden + `!A93.syncT`) before reading focus |

**Game-side signals that exist (read-only, usable today):** `FLAVIUS_READY` (164), BUS `turn.begin` `phase` `state` `render` `draw.after`
`save` `window.open/close` `event.over` `round.end` (218 + emitters; 27 names), `PACE96.depth/dirty/raf` (235), `CAM.raf`, `Z99F.raf/tick/inFrame`,
`Z100.st/fr` (294), `AIM106.figs/tmap/raf/sel` (396), `V108.tb` (torch layer building, 409), `X108` + per-sheet `o.loading` (410/311),
`CUR_MODAL`, `A93.syncT`. No new game hooks needed.
**Owner / overlap.** Decisions R1 "seeded test worlds (no Date.now/random ids in tests)" and R2 "a CI input that re-runs only named tests"
(both his r1a r2a, 2026-10-18) — decided, NOT built (workflow_dispatch has only `mode`, regression.yml:9–12). v1.08c builds them; nothing
replaced. Consistent with v0.87 "fix the waits, never skip" (2026-10-05) and docs/testing.md "never a fixed sleep".
**Approach.** ONE helper `tools/tests/_wait.js` (the `_st98.js` convention: `_` = helper, outside testlist.js's `t*.js`):
`boot(pg,{ls,seed})` (webdriver/firstrun init script + seeded `Math.random` + `Date.now` from a fixed epoch advancing with `performance.now`);
`until(pg,what,fn,arg,ms)` that on timeout records `WAIT <what> timed out after N ms` + a state dump (diag106 generalised: draws/s, figs, PACE96,
V108, CUR_MODAL, SPEED, dpr); predicates `turnReady`, `boardIdle`, `aimReady(refs)`, `popupSettled`, `saveDone(kind)` (BUS 'save' since a mark),
`spritesReady`, `mgrDrawn(sel)` (replaces the `GO` helper's fixed `W8(500)`). Rewrite only the 15 named tests (keep every assertion; never
loosen). R2: workflow_dispatch inputs `tests` + `repeat` → plan.js named mode.
smartreg's `depsOf` (smartreg.js:97) must include `_*.js` a test requires (today a `_st98.js` change re-runs nothing).
**Acceptance.** Each named test 20/20 in one R2 dispatch (`repeat 20`); board ones also 10/10 locally `-j 2` with CPU throttle 4; a failure names the awaited state.
**Effort L · Risk M** (test rewrites can hide a real bug → intent kept, diff reviewed by the lead). **Tests:** the 15 + `tools/ci/plan.js`.
Online lockstep / replay goldens / saves: untouched.

## 2. i18n prep false `_T` wraps — TOOL
**Evidence.** prep.sh = wrap.js → frag.js → srvkeys.js → newkeys.js. `node tools/i18n/wrap.js --list` today: 278 would-wrap keys =
224 in 411-v109wqproto (v1.09 mock-up, real prose, not ours) + **54 false wraps in 11 files**:

| pattern | where (file:line) | why wrap.js misses it |
|---|---|---|
| `throw new Error('…')` | 311:262 'shadowRow without light()', 397:15 'Set off first' | skipCtx only skips a literal whose PARENT is `throw`; here the parent is `new Error` (not in CALLSKIP) |
| shader source | 311:251 `'uniform float uMMode…'` (`sh.fragmentShader=` + concat) | `+` concatenation not climbed; `.fragmentShader` not a skipped property |
| console.* concatenation | 404:84, 404:96 `console.warn('404: the '+k+' …')` | skipCtx climbs `()` `?:` `|| && ??` but not `+` |
| property-key concat | 409:56 `s[k+'Max']` | same (`+` inside an element access) |
| font family | 397:31 `'IBM Plex Mono, monospace'` | prose(): two spaced words |
| CSS selector template | 364:13 `${t}[style^="color:${h}"]` | prose() |
| HTML fragment | 362:31 `' <span title="'`, 373:193 `disabled title="${…}"` | prose() on an unclosed tag |
| data tables (names stay English, decisions ≈ v0.86 GAME_TERMS) | 408:34 SFX108_CREDITS (32 keys: titles, 'CC BY 4.0'), 382:14 HOME_OVR105 city names | array rows / object values with non-KEYSKIP keys |
| recorder / dev report | 405:90/91/94 'readback?', 405:125 `note:`, 405:128 'ms/s', 406:89 'canvas(in memory)' | dev-only strings |

Known since v1.05 (known-issues: 362 364 373 382 + an Error in 311) — fixed today by hand: "`git diff src` and revert" after every prep.
Version badge: 01-head.html is not scanned (wrap.js reads .js only); GAME_VER parses `.brand .ed` text (54-v51.js:4) → guard it in the test.
**Approach (rules in wrap.js, no new tool):** (1) skip literals under `new Error/TypeError/RangeError` and anywhere below `throw`; (2) climb
`+` and template spans before the context checks (fixes console/property-key cases with the existing rules); (3) shader text
(`uniform|varying|precision|gl_\w+|vec[234]|void main`) or `.fragmentShader/.vertexShader=`; (4) prose()=false for CSS families/font
shorthand (`… (serif|sans-serif|monospace|cursive|system-ui)$`, `\d+px `), `[attr^=`, `{prop:`; (5) prose()=false for a run that ends inside
an open tag/attribute; (6) block markers `/* i18n:skip-begin */ … /* i18n:skip-end */` next to the existing line marker `i18n:skip`
(v0.87) for data tables and dev reports (408 credits, 382 names, 405/406 recorder). prep.sh prints the would-wrap list per file before `--write`.
**Test (new, node, no browser): `tools/tests/ti18nwrap.js`** — runs `wrap.js --list` over src; fails on any key matching the fingerprints above
and on a fixture of ~10 real prose lines that must still wrap; checks the badge is never wrapped. Into runreg DEFAULT.
**Effort M · Risk L–M** (a rule too wide stops wrapping real text → the fixture). English output byte-identical; tv93i + check93 unchanged.
Note: v1.08c's own prep must pass file args (wrap.js ONLY) so 411 (v1.09 agent's) is not wrapped by us.

## 3. `smartreg --dry` plans everything — TOOL
**Evidence.** `node tools/smartreg.js --dry` now: "smart · 421 of 421 tests · new 109, changed 312 · idle 0". Causes:
(i) tools/regstate.json is stale — 342 tests (DEFAULT has 421), committed 2026-10-16, `lastFull` 2026-10-15T20:28Z;
(ii) `build.sh` is in GLOBAL (smartreg.js:42) → every new module (409, 410, 411 since then) marks ALL tests "changed" — per-file shapes
are already compared (smartreg.js:109), so build.sh adds nothing but noise; (iii) the 7-day rule (smartreg.js:191) makes every run FULL
from **2026-10-22 20:28Z** — this is the "starts a full run" report (with `--dry` it prints the FULL plan; without it, 421 tests locally →
the 10-min agent timeouts); (iv) CI never writes state back: the workflow names `tools/ci/absorb.js` (regression.yml:3) but it does not
exist; (v) CI "smart" = `smartreg --dry` (tools/ci/plan.js `smartPlan`) → every smart push also runs all 421 (and the plan job spends ~2.5 min);
(vi) 28 agent worktrees under .claude/worktrees check out the same committed state.
**Approach.** build.sh out of GLOBAL (keep an ORDER change check); `--dry` prints why a run would be FULL and never escalates silently; age
→ per-test "stale" (lastRun > 7 days), not a FULL; write `tools/ci/absorb.js` (pass/fail/flaky/times from CIRESULT via the GitHub API — the
only channel the proxy lets through) and run it in release step 2; coverage maps: see Q8. **Effort M · Risk L–M** (a wrong plan skips a
test → rotation + release full run still cover). **Tests:** a `--dry` self-check in tools/ci/plan.js output (plan must be < ALL for a one-file change).

## 4. `testslot.sh` hangs / exits 144 — TOOL
**Evidence.** Not in the repo (no commit on any branch); it lives only in this session's scratchpad
(/tmp/claude-0/-home-user-arena/cc1b704a-5035-5a46-beb6-a9feaecd4df4/scratchpad/testslot.sh). It locks with `mkdir /tmp/flavius-testslot-N`,
no owner PID, `sleep 5` forever while both are taken. A holder killed by the agent tool's timeout (144 = 128+16: killed by a signal from
outside) or SIGKILL never runs its trap → the lock dir stays → every later call waits forever (the hang); waiting also counts against the
caller's own Bash timeout. Workaround in known-issues: `smartreg -j 1`.
**Approach.** Retire it; put the slot limit INSIDE smartreg (one owner): `REGSLOTS` (default 2) lock files `/tmp/flavius-reg-slot-N` holding
pid + start + test list via `flock`; a slot is free when its pid is dead (`kill -0`) or > 45 min old; prints "waiting for slot (pid N: tv…)",
gives up after `REGSLOTWAIT` (20 min, exit 75). CLAUDE.md §1 "at most 2 builders test at once" becomes enforced. Replaces the uncommitted
testslot.sh and the `-j 1` workaround. **Effort S · Risk L.** **Tests:** none in the suite; a two-process self-check run once.

## 5. Letter versions in the update notice — FIX (forward only)
**Evidence.** v1.08b badge `arena · v1.08b` → `GAME_VER` regex `/v(\d+\.\d+)/` (54-v51.js:4) = **'1.08'** (his Safari reports say
`"game":"1.08"`); What's new title shows `v${GAME_VER}` (115-v79.js:10) = "v1.08" on v1.08b; error report the same (216:3).
version.json = `{"v":"1.08b"}` (release.sh:27); `verPoll76` accepts only `/^\d+\.\d+$/` (109-v761.js:28) → v1.08/1.08a players got no
notice for 1.08a/1.08b; `verCmp` (54-v51.js:5) does `Number('08b')` = NaN (treated as equal, no crash). Other GAME_VER readers: saves
(`w.ver`, SAVE_MIGRATIONS, verAsk 54-v51:32–57), resume (337:60 exact match), replays (309:73), save banner (93:82).
**Approach.** One parser `verParse('1.08c')` → {n:[1,8], l:'c'}; `verCmp` orders 1.08 < 1.08a < 1.08b < 1.09 (letter only breaks a numeric tie);
`GAME_VERL` = full badge text ('1.08c') for the notice, NEWEST76, What's new title, error report, ⏺ recorder; `GAME_VER` stays numeric for
saves/resume/replays (rollback-safe: old builds never see a letter in a save). Without GAME_VERL the new parser would compare '1.08c'
(version.json) with '1.08' and show the notice on itself. Shipped builds untouched: nobody sees a 1.08c notice; first effect = 1.08c players
when 1.08d/1.09 ships. **Effort S · Risk M** (notice + save version paths). **Tests:** tupd76 (update notice), tver51 (save versions) + cases
1.08 < 1.08a < 1.08b < 1.09, 1.08c vs itself = no bar. Online: no protocol change.

## 6. Bake reproducibility — TOOL (investigation + docs, NO re-bake: R4)
**Evidence.** known-issues 2026-10-18: anim100b `l106` re-run baked different beast shadow sheets (moechus/valencia cell 56×18 anchor y 47 vs
committed 58×28 y 11); lit sheets byte-identical. Inputs since the committed bake: only a moechus recolour (0d5b5fb, beast5_rig.js VARIANTS)
— colour cannot move a shadow. Sources found:
- **shared crop** — `crop()` (anim100b/l106.js) takes ONE bounding box (alpha > 4) over ALL cells of all rows → one faint pixel anywhere
  changes every cell's size and anchor: matches the symptom exactly (prime suspect).
- module-global shadow renderer `R2` reused across cells/beasts (l106.js `let R2`, `setSize` only when width differs): GL state carries over.
- SwiftShader WebGL + PCFSoftShadowMap: stable for one Chromium build, differs across builds (here chromium-1194, Playwright 1.56.1 in CI).
- encoders: colour sheets = Chromium's canvas WebP (version follows Chromium); shadows/severed/2× = PIL 12.3.0 + libwebp 1.6.0, unpinned
  (shenc.py, sevenc.py, x2enc.py, method 6).
- shenc.py globs every PNG in out/l106 of BOTH tools (and x2enc.py all of out/x2 unless named) → leftovers from an earlier run get re-encoded.
- inputs read live: kits from the built page (make.js:89 `partsFromGame`), LIGHT106_* from 399, LOOK constants, assets/three93.js.
- no Math.random inside ANIM100_LIB (311:53–292; the 311 randoms are display-only outside it); make.js:19 random PORT is harmless.
**Approach.** (1) `--check` mode in both make.js: bake into tools/art/<tool>/out/check/, never assets/ or the META blocks; (2) a compare
script: meta must match exactly, pixels within a tolerance (lossy encoders → bytes are NOT the goal); (3) report.json records chromium
revision, Playwright, GL renderer, PIL/libwebp versions, args, git HEAD + dirty; (4) encoders take the file list from make.js, no globbing;
(5) run `l106 --check` for moechus/valencia twice at one commit → classify the 2026-10-18 diff (nondeterminism vs crop) and write it in
docs/ (README beside the tools); fix `crop()` per-row if it is the cause, applied at the NEXT beast re-bake only. **Effort M · Risk L.**
**Tests:** none in the suite (tools only; tbake untouched).

## 7. Render/cache dependency map — ARCHITECTURE (proposal only; build = v1.10 A)
| cache (module) | holds | key | invalidated by | stale/over-invalidation history |
|---|---|---|---|---|
| AR91.L under/deco/top/light/sky (192, key via 208) | stone layers; LIGHT layer (+409 grain/planks/depth by day) | canvas w×h, dpr, TW, 208 ref-frame id, ROT89, N, material, tiers, ludus, night, **AR91.ver**, texture, lite84 | key; `AR91.ver++` on image load (192:99), 277 A100X.set, 409 v108Sig (409:60) | 208 (OX/OY keyed → repaint every camera frame), 294 (ref per 0.18 screen), 330 (2nd slot ZB101.alt), 403 (board column width → every size-keyed layer rebuilt) |
| WEAR91_C (194) | wear, blood, stains, rubble | S, splats, rubble, rotation, drains, TW + `w.ver` | `w.ver++` per wear step (194:33) | — |
| TILES96 (235) | 169 tiles | canvas+transform, iso projection, theme, S id, zones, scars, sand, ROT89, lite84 | key | 260 (camera in key → rebuild per zoomed frame), 330 (ease frames overwrote the unzoomed cache) |
| Z99 chunks / Z100 scaled-last / ZB101 alt slot (260/294/330) | zoomed whole-board tiles; scaled stand-ins while zoom eases; idle pre-bake | zoom, size, theme, zones, state; hold timer | key; `Z100.hold` settle | see above |
| NIGHT91.cache (189) | night grade (+409 pools baked) | Wd, Hd, dpr, TW, OX, OY, STANDS, N | key; 409 clears `NIGHT91.key` by hand (409:60, :133) | 409 F1: re-baked every zoom frame → last sharp grade scaled, re-bake after 160 ms |
| L106.layer (399) | static shadow layer: pillars/jugs/chest casts + contacts | `l106Key` (399:129): mode, night, TW 3 % step, orientation, pillars/jugs/moving, chest, rubble | key; 409 nulls it by hand | 401 P2 split into aligned pieces |
| l106 cell/sprite caches (399 l106Mk/l106Cell) | per-cell shadow sprites | name·q·sun az·el / id·fx·fy·q | key | — |
| V108.tl / tb (409) | torch shadow layer, built over frames | 399 key + '\|v108' AND `tl.src===Ly0` identity (409:252) | 399 rebuild; v108Sig | v1.08 beta disc shadows (casts paired by identity; Safari still open) |
| AN100CC (311 an100CellCanvas) | pre-scaled figure cells, LRU 400 | image id (WeakMap) + set/name/i + rect + 3 % scale (311:391) | LRU; a new image (2× swap) = new id | — |
| sh103 (346) | IN-PLACE unsharp mask of those cells | flag `c._sh103` on the canvas (346:54–57), no revision | never (one-way mutation) | **403 F4**: aim outline built from the unsharpened alpha (key lacked `_sh103`) |
| BS101.cache (321) | bases-off processed cells | WeakMap per image | GC only | Safari: 28 ms per getImageData (0b) |
| an100Bm rows (311 + 401 P1) | ImageBitmap per action row, off-thread decode | per sheet object `o.bm[name]` | 410 `an100X2Fail` closes them | v1.07: main-thread decodes 100–150 ms (fixed by 401) |
| W3 (406, WebKit only) | ImageBitmap copy of in-memory cells | canvas identity + **`__v107` content revision** bumped by every mutating 2D call / resize (406:78–84) | any mutation; 600 unused draws → closed | the ONLY content-revision counter in the pipeline |
| AIM106.oc / figs / tmap (396 + 403) | outline sprites LRU 8; per-frame recorded target figures | ops (img id, rects, transform) + `_sh103` (403:36); figs reset per `drawLayers93` (396:244) | LRU; every frame | 403 F4; tv106d CI misses (1) |
| CV107.lie / sane / face (404) | lying-corpse canvases LRU 64 | sheet key·sx·scale step·side·flat (404:43) — no image identity, no 1×/2× | LRU | bear corpse 2–3 tiles on Safari (0a) |
| X108 (410) | 1×↔2× sheet per class/beast | per sheet `o.k`; `BEAST100_META[k]` swapped to 2× meta | load / fail → `BST100.cc.clear()` (410:73) | readers must use `bst100Scale(M)·M.px` |
| LAYERS93 (219) | watcher: hit/miss/key/ms per layer + sub-layer | reads AR91.L[s].key / WEAR91_C.key | — | owner by decision (below) |

**Dependencies (who must follow whom):**
- BOARD STATE (pieces, pillars, rubble, blood, zones) → 194, 235 (S id), 399 static → 409 torch layer; per frame → AIM106.figs.
- VIEW (canvas size, dpr, TW, OX/OY, ROT89, zoom ease) → 192 via 208 ref, 235/260/294/330, 189 (raw OX/OY), 399 (3 % step) → 409, 311 cells
  (3 % step) → 346 sharpen → 406 W3 → 396/403 outline, 404 (scale step).
- LIGHT (Lighting pref/mode, night, V108 items, lite84) → 192 LIGHT, 189, 399, 409 — today kept in step BY HAND (409:60 bumps AR91.ver and
  clears NIGHT91 + L106.layer).
- ASSETS (image load, 2× swap, sharpen, bases-off) → AR91.ver (stone textures only), AN100CC (new image id), sh103 (mutates, no revision),
  W3 (`__v107`), 403 (`_sh103` special case), 404 (no identity at all), 321 (WeakMap).
**Recommendation (one owner, no new system):** extend 219 LAYERS93 — already the decided owner (v0.93 "LAYER MANAGER … each with its own cache
key + Off path", his yes 2026-10-07; built as a watcher only) — with four generation counters `LAYERS93.gen.{board,view,light,asset}`
(bumped in one place each: BUS turn/hit/elim/spear/state + pillar/rubble moves; the view setter; the Lighting/night/V108 switch; image
load/2× swap/sharpen/clean-up), and make 406's per-canvas `__v107` revision universal (every cached canvas, not WebKit-only). Each cache's key
= its dependency gens + its own params. It would REPLACE: `AR91.ver` (192), 409's manual `NIGHT91.key=''`/`L106.layer=null`, the `_sh103`
key special case (403 F4), W3's private bump, and 404's identity-less corpse key. Cost of universal `__v107` (wrapped 2D calls) must be measured
first (8). Build in v1.10 A only after his pick (Q5).

## 8. Baseline measurements — TOOL (measure, no budgets yet)
**His new Safari recordings** (tools/plans/v107/perf/safari-v108b-*.json; Mac Safari 26.6.2, DPR real 2, Normal speed, ⏺ 10 s, bases off):

| file | board dpr | zoom | Lighting | fps | p50 | p95 | max | >33 ms | >50 ms | draw ms/s | clean ms/s | light ms/s | cells ms/s | getImageData n / ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 075331 | 1.5 | 1 | Full | 38.5 | 17 | 59 | 445 | 47 | 33 | 159.6 | 68.2 | 23.6 | 3.3 | 44 / 578 (bs101Off 26) |
| 075400 | 1.5 | 1.4 | Light | 30.5 | 21 | 95 | 185 | 117 | 49 | 158.5 | 96.6 | 3.2 | 1.0 | 29 / 821 (all bs101Off → 28.3 ms each) |
| 075521 | 1 | 1 | Light | 43.4 | 17 | 54 | 348 | 48 | 24 | 108.8 | 33.0 | 4.1 | 3.8 | 478 / 796 (alphaBox 208 + shadowRow 208 + aim106Body 38 + bs101Off 10) |
| 075540 | 1 | 1.4 | Light | 42.9 | 17 | 49 | 225 | 61 | 20 | 115.7 | 49.6 | 4.5 | 19.2 | 528 / 905 (alphaBox 212 + shadowRow 216 + aim106Body 41 + bs101Off 22) |

- 1.5× costs ≈ +50 ms/s of draw and, zoomed, 12 fps (30.5 vs 42.9) → the auto rule stays (known-issues 2026-10-21).
- 1× runs carry ~420 read-backs (`alphaBox < sheetSteps`, `shadowRow < render`, 943–1013 new canvases) = the one-time LIB VER 6 device
  re-render of Studio/online tokens (311 VER 5→6), not steady state; re-record once it has finished.
- `clean` (321/334 bases-off clean-ups) is the biggest named cost after draw itself: 33–97 ms/s; worst slow frames are `render` (57 ms) + `bus` (19).
- Not comparable to v1.07 (52.6/55 fps, p95 28–29) — those were Slow speed, Lighting Full, DPR 1.
- Recorder gaps: `event` null, `game` '1.08' (5), no 1×/2× sheet state (X108), no memory.
**What to measure, with what (existing tools; no new harness):**

| measure | tool | configs |
|---|---|---|
| board render (js + raster) | tools/bench/board.js `--flush` (forged scene, seed 4242), summary.js | desk 1440×900@1, hd @2, phone 844×390@2 × flat / z1.4 / z2 × day / night |
| lighting / shadow | board.js `--ablate`, v108ab.js (paired A/B in one page), V108.st / L106 stats | same, Lighting Full / Light / Off |
| aim overlay | tv106d step 8 DRAWCOST, live.js desk-z14-aim / z2-aim | desk, hd |
| animation / update | live.js (`--cpu` main CPU/frame), an100Tick draw count (tv100z 4c) | desk / phone, Normal |
| peak frame: popup / zoom / Fast CPU | zoom100.js (normal/fast × zoom), zoombake.js, prof.js `{"speed":"fast"}`, rec107.js with a window open, tv100fps | desk, hd, phone |
| decoded sprite memory | anim100 report.json decodedKB + a `--mem` probe in live.js (sum of live sheet/bitmap/cell canvas px ×4, CDP JSHeapUsedSize like tv92p) | desk 1× / desk 2× (`flavius_x2force`) / phone |
| Safari | his ⏺ recorder (405 Q3/406 W4): 4 runs as above, after 0a/0b + the LIB VER 6 re-render settled | his Mac |
| guards kept | tv91r, tv92p, tv95p, tv100fps, tv108x, tv108l | as in the suite |

Box note (v107/PERF.md): 4 vCPU, no GPU, shared → relative numbers only, A/B in one page. Stored: tools/plans/v108c/BASELINE.md (tables, like
v106/BASELINE.md + v107/PERF.md) + tools/plans/v108c/perf/*.json; v1.10 D sets budgets from these. Small recorder additions (event, GAME_VERL,
X108 state, memory) = dev-only TOOL in 405/406. **Effort M · Risk L.**

## Proposed release scope (in order; fixes first, then tooling, docs last)
1. 0a Safari corpse FIX (lead, in progress) · 0b bs101Off read-back if Q7a.
2. 5 letter-version parser (FIX) — tupd76, tver51.
3. 2 i18n wrap rules + ti18nwrap · 3 smartreg plan fixes + absorb.js · 4 slot limit in smartreg.
4. 1 `_wait.js` + R1 seeded worlds + R2 dispatch input; the 15 tests rewritten; 20× CI proof.
5. 8 baselines measured + recorder fields → BASELINE.md.
6. 6 bake `--check` + versions in report.json + the l106 crop classification (docs).
7. 7 map (this file) → his pick → v1.10 A plan.
Then translations (only 0a/0b/5 touch player text), release.sh 1.08c, [full] run, beta (Safari: corpse, update bar wording unchanged).

## Out (ROADMAP §3 non-goals / §5)
New gameplay; Winter Quarters (411 + v1.09 in its own worktree); tactical UX; renderer rewrite (7 is a proposal only); bulk wrapper cleanup;
any figure or beast re-bake (6 changes no asset; a crop fix applies at the next re-bake); fixing v1.08a/b's missed notices; budgets (v1.10 D).

## Questions (my pick ★)
1. Seeded test worlds (R1): a) test-side only — `_wait.js` seeds Math.random + Date.now before boot, no game change ★ · b) also add a game-side
   `newWorld({seed})` option.
2. Letter versions in saves: a) saves keep the numeric part ('1.08'), the letter only in the notice / What's new / error report / recorder ★ ·
   b) saves carry the letter too (a letter release could then key its own SAVE_MIGRATIONS; rollback readers treat it as equal).
3. smartreg coverage maps (regmap.json, 11.7 MB) can't come back from CI through the proxy: a) CI's full release run commits regstate +
   a gzipped regmap back to the branch with [skip ci] (that job gets contents: write) ★ · b) refresh them by a local `--full` once per release
   (CLAUDE.md §5 says never the whole suite locally) · c) keep them stale; absorb pass/fail/times only.
4. testslot: a) retire it, slot limit inside smartreg ★ · b) commit a fixed tools/testslot.sh.
5. Invalidation owner for v1.10 A: a) extend 219 LAYERS93 with 4 generations + a universal per-canvas revision (406's `__v107`) ★ ·
   b) a dirty-region model (per-tile rects) · c) keep per-module keys, only document them.
6. Bake reproducibility target: a) meta exact + pixels within tolerance, versions recorded, `--check` mode ★ · b) byte-identical
   (pinned Chromium + PIL/libwebp venv; more work, breaks on every Playwright bump).
7. 0b bs101Off read-back (≈ 28 ms a call on Safari, bases off): a) in v1.08c as a FIX, then the Safari 1.5× retry ★ · b) leave it for
   v1.10 Auto quality.
8. A flaky test still failing after its rewrite at the 20× proof: a) the release waits for it ★ · b) ship v1.08c and list it in known-issues.
