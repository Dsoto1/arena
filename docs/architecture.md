# Architecture

How the game is put together. CLAUDE.md is the hand-off (what was decided, what each module does, the open items);
this page explains the shape so a newcomer can find their way. When the two disagree, CLAUDE.md wins — fix this page.

## One page, one script

The game is a single HTML file, `flavius-arena.html`, built from `src/` by `build.sh`:

```
src/core/01-head.html             markup, CSS, the language loader (<script data-lang87>)
<script>
  src/core/00b-perf.js            the UI heartbeat (runs first)
  src/core/00c-errlog.js          the error log + errText92 / errRef92 (runs second: it must see every error)
  src/lang/00-lang.js             _T / TX / LANG_DICT (before anything that shows text)
  src/core/02-data.js … 07-ui.js  the engine: data, rules, flow, AI, drawing (07-ui lives in src/ui/)
  src/<topic>/NN-*.js             features and "version modules", in the order build.sh lists them
  src/core/08-setup.js            boot (always last)
</script>
```

src/ is grouped by topic (v1.01): core · lang · ui · board · match · stands · gear · studio · playnow · manager · online ·
audio · city · lessons · meta · batches (multi-topic version batches). The folders only help a reader: the build order is the
one list in build.sh, and module names stay unique across folders (tools/srcpath.js finds a module by name).

`sh build.sh` concatenates the files in the fixed order in `build.sh`, then runs `node --check` on the script and prints
`SYNTAX_OK`. It also trips a guard when code follows a `//` comment on the same line (use `/* */`).

The page needs `assets/` beside it (images, `lang_<l>.js` dictionaries). `tools/mkshare.py` makes the standalone copy
(`share/flavius-rule-arena-vX.YY.html`, every asset inlined as a data URI).

## Version modules and wrapping

Everything lives in one global scope. Later modules change earlier behaviour by **wrapping** a function:

```js
{const base=fnName;fnName=function(...a){/* before */const r=base.apply(this,a);/* after */return r}}
```

- Works for `function` declarations and `let` functions; a `const` arrow cannot be wrapped (edit it in place).
- Order matters: a wrapper only sees the wrappers installed before it (build order, not file number).
- New batch work goes into a new `NN-vXX.js` module inserted in `build.sh` before `src/core/08-setup.js`, with a header comment
  listing what it does. Prefer wrapping over editing old modules; small direct edits are fine where wrapping is impossible.
- Generated files: `195-v91srvexp.js` (tools/srvstamp.js), `223a-v93srvtext.js` (tools/i18n/srvtext93.js),
  `assets/lang_<l>.js` (tools/i18n/mkdict.js). Never edit them by hand.

## Core globals

| Global | What |
|---|---|
| `S`, `cur()`, `EV()`, `RD()` | the live event, the active player, the event and round definitions |
| `render()`, `draw()`, `log()` | UI panels, the canvas, the event log |
| `modal(title, body, buttons, opt)` | the window (a Promise); `CUR_MODAL` is the open one |
| `mToast(html)` | a short notice |
| `rand()` / `pickOne()` / `rnd()` | the **seeded** dice — never from UI code (use `Math.random()` there) |
| `Store` | the save store (artifact DB with a localStorage fallback); new collections go in `SAVE_COLS` |
| `SETTINGS` | the player's settings (`flavius_settings`) |
| `ONLC` | the shared online rules (`src/online/111-onlcore.js`, also the server's `onlcore.js`) |
| `NET` | the online transport: `NET.req(t, d)` → Promise, `NET.on(t, fn)` pushes; mock or AWS (`NETWS`) |
| `ERR92`, `errText92(e)` | the error log; the player-facing form of any error |
| `_T`, `TX`, `LANG`, `LANG_DICT` | translation (see [i18n.md](i18n.md)) |

## Modes

Play Now (single events, festival, missio, tournament) · Manager (`W_()` world, 12-week seasons) · Creator Studio ·
Hot seat · Online (`onlineOpen`, rooms, lockstep matches) · lessons. `79-screens` decides what is on screen when a
window closes (`SCREEN_OPENERS`, `screenSettle`).

## Online in one paragraph

The page and the server share the rules (`111-onlcore` → `server/src/onlcore.js`). The server
(API Gateway WebSocket + one Lambda + one DynamoDB table + Cognito) owns money, gear, ranks, rooms, wagers and the
auction; a match is **lockstep** — the host opens it with a snapshot, every human sends only their own inputs, every
screen runs the same seeded engine, a hash before each input catches drift (majority resync). Details: [backend.md](backend.md).

## Persistence and versions

Saves are versioned by the badge (`arena · vX.YY` in `01-head.html` → `GAME_VER`); `SAVE_MIGRATIONS` upgrades old
Manager worlds; a newer save blocks an older page (109-v761); one tab per save (138-v84).

## Performance

UI pollers run on one heartbeat (`00b-perf` + `204-v92perf`, `PERF92_SWEEPS`); after 2 minutes without input the page
goes idle (animations paused). A new UI poller adds its signature to `PERF92_SWEEPS`.

## The rules in Node (tools/node, v1.01 D1)

The built page also runs WITHOUT a browser: `tools/node/page.js` loads its `<script>` into a Node `vm` context behind a small fake DOM
(`tools/node/dom.js`: a real element tree, innerHTML parsed only when queried, an index by id/class/attribute/tag, events with capture +
bubble, a canvas whose 2D context accepts every call) on a VIRTUAL CLOCK (timers, rAF, Date and performance.now are the page's own; the
clock jumps to the next timer once every microtask has run, and moves 1 µs per read so a loop polling the clock still ends).
Math.random is a seeded stream (cosmetic only). Nothing in src/ knows about Node except one guard: 07-ui `draw()` returns at once when
`window.FLAVIUS_NODE` is set (the board is never painted in Node; undefined in every browser).

- **Array.prototype.sort is Chromium's.** The rules sort with random comparators (`(a,b)=>…+rand()`), so the comparison ORDER draws the
  dice. Chromium (V8 13+) sorts arrays shorter than 8 with a plain binary insertion sort; Node 22's V8 12 runs TimSort's run detection
  first. page.js gives the page realm Chromium's order (8 and longer: the same TimSort). Other engines (Firefox, Safari) differ again — a
  known risk for cross-browser online lockstep in code paths that sort with `rand()` comparators.
- **Two modes.** Rules mode = `HEADLESS` on (no log, windows auto-answered or answered by the replay, no panels) — what Phase E's verifier
  runs. Screen mode = `HEADLESS` off: render(), windows and the log run against the stub too (slower; used to prove the log).
- **Replays** go through the game's own players: 309's `rp100Play` (offline: the opening snapshot + every recorded input at the same
  settled points via `command()` and the recorded window answers) and, for an online stream, 113's pump in watcher mode
  (`onlmLoad` + `onlmWatchOn`: each input applied at a settled point, its pre-hash checked).
- **The rules of one build:** `node tools/node/mkbundle.js` → `server/verify/rules.js` (stub + markup without styles + the script, byte for
  byte; ~9 MB, not committed) and `rules.json` {v, build}. build = first 12 hex of sha256(script) (`--hash` prints it for any page). The
  online server zip (`server/src`) never includes it. `require('./server/verify/rules.js').open({ls, t0})` → the page; `.page` for the
  replay tools.
- **Phase E (v1.01 wave 2):** the verify Lambda (`server/verify/`) runs that bundle on the server to replay every settled Ranked match and log
  mismatches — docs/backend.md "v1.01 Ranked verification".


## Most-wrapped functions (his 5a, 2026-11-06; regenerate with `node tools/wrapped.js --md 25`)

A bug in one of these is usually in the LAST wrapper installed, so start there (third column; `x2` = wrapped twice in one module). The idiom count is 2444 of the 2472 `const base=` lines a plain grep finds; the other 28 are `const base=` lines that are not the `{const base=NAME;NAME=function` shape.

| function | wraps | last wrapper (start here) | all wrapping modules, in build order |
|---|---|---|---|
| `mgrHTML` | 73 | 432-v115bstr | 50-v48, 51-v49 x2, 52-v50 … 415-v109b, 416-v109c, 432-v115bstr |
| `endWeek` | 55 | 427-v112econ | 47-mgr47, 50-v48 x2, 51-v49 … 415-v109b, 416-v109c, 427-v112econ |
| `modal` | 36 | 391-v105b5a | 60-v53, 62-rules53, 113-onlmatch x2 … 347-v103beta, 368-v105pnrow, 391-v105b5a |
| `render` | 26 | 346-v103board | 54-v51, 56-v52, 60-v53 … 321-v101board, 344-v103gen, 346-v103board |
| `applyBout` | 25 | 416-v109c | 64-v54, 66-mgr55, 77-rivalry … 413-v109wq, 415-v109b, 416-v109c |
| `nightHTML` | 25 | 383-v105riv | 59-bye, 63-empire53, 66-mgr55 x2 … 360-v105mw, 380-v105rudis, 383-v105riv |
| `draw` | 23 | 423-v111csafari | 108-v76, 138-v84, 168-v89rotate … 417-v110auto, 420-v111safari, 423-v111csafari |
| `gameOver` | 23 | 428-v112fig | 70-v57, 108-v76, 112-online … 337-v102resume, 416-v109c, 428-v112fig |
| `weekChecklist` | 23 | 416-v109c | 95-v73, 108-v76, 141-v85faith … 413-v109wq, 415-v109b, 416-v109c |
| `beginTurn` | 22 | 337-v102resume | 51-v49, 52-v50, 54-v51 … 309-v100replay, 325-v101replay0, 337-v102resume |
| `detailHTML` | 21 | 378-v105rec | 66-mgr55, 87-v67, 95-v73 … 353-v104fixl, 357-v104fixm, 378-v105rec |
| `newWorld` | 19 | 413-v109wq | 39-sotonium, 44-studio, 50-v48 … 348-v104season, 365-v105cal, 413-v109wq |
| `drawPlayer` | 18 | 418-v110b | 76-chariot59, 78-v60, 82-access … 396-v106aim, 398-v106b1b, 418-v110b |
| `startEvent` | 18 | 338-v102draft | 44-studio, 48-arena47 x2, 51-v49 … 309-v100replay, 337-v102resume, 338-v102draft |
| `menuShow` | 17 | 367-v105menu | 48-arena47, 56-v52, 108-v76 x2 … 309-v100replay, 337-v102resume, 367-v105menu |
| `settingsHTML` | 17 | 430-v115set | 82-access, 94-v72, 103-v74 … 396-v106aim, 400-v107tok, 430-v115set |
| `applySettings` | 15 | 422-v111set | 54-v51, 56-v52, 82-access … 410-v108x2, 417-v110auto, 422-v111set |
| `drawLayers93` | 14 | 423-v111csafari | 219-v93layers, 233-v96bar, 235-v96fast … 398-v106b1b, 420-v111safari, 423-v111csafari |
| `newState` | 14 | 310-v100daily | 51-v49, 52-v50 x2, 64-v54 … 191-v91fix, 224-v94designer, 310-v100daily |
| `onlRedraw` | 13 | 340-v102prog | 116-onl79, 118-onl80, 121-onl80fix … 307-v100tituli, 334-v102fix, 340-v102prog |
| `onlRoomHTML80` | 13 | 340-v102prog | 127-v82onl, 137-v83onlui, 171-v89onl … 290-v100tt, 302-v100lobby, 340-v102prog |
| `log` | 12 | 321-v101board | 54-v51, 56-v52, 60-v53 … 220-v93a11y, 233-v96bar, 321-v101board |
| `mkPlayer` | 12 | 292-v100srvA | 65-stats55, 80-aitiers x2, 112-online … 183-v90ward, 225-v94armory, 292-v100srvA |
| `onlPlayHTML` | 12 | 287-v100who | 116-onl79, 118-onl80, 127-v82onl … 252-v98onl, 264-v99fix2, 287-v100who |
| `setupBody` | 12 | 321-v101board | 51-v49, 52-v50, 106-v75 … 300-v100pn, 310-v100daily, 321-v101board |
