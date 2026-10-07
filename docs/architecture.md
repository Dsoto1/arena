# Architecture

How the game is put together. CLAUDE.md is the hand-off (what was decided, what each module does, the open items);
this page explains the shape so a newcomer can find their way. When the two disagree, CLAUDE.md wins — fix this page.

## One page, one script

The game is a single HTML file, `flavius-arena.html`, built from `src/` by `build.sh`:

```
src/01-head.html            markup, CSS, the language loader (<script data-lang87>)
<script>
  src/00b-perf.js           the UI heartbeat (runs first)
  src/00c-errlog.js         the error log + errText92 / errRef92 (runs second: it must see every error)
  src/00-lang.js            _T / TX / LANG_DICT (before anything that shows text)
  src/02-data.js … 07-ui.js the engine: data, rules, flow, AI, drawing
  src/09 … 223-*.js         features and "version modules", in the order build.sh lists them
  src/08-setup.js           boot (always last)
</script>
```

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
- New batch work goes into a new `NN-vXX.js` module inserted in `build.sh` before `src/08-setup.js`, with a header comment
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
| `ONLC` | the shared online rules (`src/111-onlcore.js`, also the server's `onlcore.js`) |
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
