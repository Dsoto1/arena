# Clean layers — engine vs screen (audit + plan, 2026-10-11)

## In one screen (for Virgilante)
**Today:** the rules and the screen are one piece.
- A rule that needs your choice opens the window itself.
- A rule waits for an animation by pausing itself.
- Every rule writes its own log line into the page.
- 69 later modules add 187 wrappers onto 70 rule functions.
- The rules cannot run without a browser: 202 of 277 files touch the page as they load.

**Goal:** the rules ASK (one question port) and ANNOUNCE (events on the BUS). The screen, a CPU, an online opponent or the server
answers and shows. The pixels, the dice and the log stay identical at every step.

| Phase | What | Effort | Risk | Worth it on its own? |
|---|---|---|---|---|
| 0 | Replay harness: seed + opening + inputs → same end hash/log/dice (tests only) | 1–2 d | low | YES: the safety net, and a referee for disputes |
| A | One question port `ask()` for the 33 core decisions; online records the port, not window titles | 5–8 d | med-high (online) | YES: fixes a class of desyncs, incl. the probable truce/language bug |
| B | Log as events: the rules announce, the screen writes the line | 0.5–1 d | low | small (a step toward D) |
| C | Pauses through a presentation port; the engine says when it waits for input | 2–4 d | medium | YES with A: the 254-type "move applied mid-pause" desyncs go |
| D1 | Rules runnable in Node via a stub page (no browser) | 3–5 d | medium | some: sims and tools without Chromium |
| E | The server replays Ranked matches and checks the result | 4–6 d + deploy | medium | YES if Ranked cheating matters (a lone human vs CPUs is unverified today) |
| D2 | Full "pure rules package" (no wrappers into the screen) | 3–6 wk | high | not now |

**Verdict:** do 0 now and A–C after v1.0. Do D1 + E once Ranked has enough players to make cheating matter. Skip D2.

---

## 1. Measured inventory
**Method:** the TypeScript parser (as in tools/smartreg.js) run over each src file in build.sh order, plus grep.
"Engine core" = 02-data, 03-engine, 04-rules, 05-flow and 06-ai (260 top-level functions).

### 1.1 Core files: UI touches per file (AST call counts)
| file | log/caption/think | render/draw/computeHL | modal-family¹ | waits² | fx/crowd³ | DOM | Math.random | HEADLESS | S.sim |
|---|---|---|---|---|---|---|---|---|---|
| 02-data | 2 | 0 | 1 | 9 (definitions) | 0 | 5 | 3 | 3 | 0 |
| 03-engine | 62 | 0 | 13 | 3 | 17 | 10 | 1 | 4 | 1 |
| 04-rules | 77 | 8 | 22 | 6 | 7 | 0 | 0 | 0 | 0 |
| 05-flow | 96 | 15 | 17 | 18 | 12 | 16 | 2 | 10 | 9 |
| 06-ai | 23 | 14 | 2 | 9 | 1 | 0 | 1 | 1 | 0 |
| **total** | **260** | **37** | **55** | **45** | **37** | **31** | **7** | **18** | **10** |

¹ modal, mToast, popRule, distModal, openMarket/Trade/Crowd, eventBriefing, humanCommand.
² sleep, later, setTimeout, curtainTo, fadeTo.
³ fx, fxLine, shake, crowdReact, crowdStart, flaviusTruceCheck.
Audio: 0 calls in the core (sfx lives in UI modules: 17 calls in 11 files).

### 1.2 Line lists (core)
- **Decision windows (33):**
  - 02-data: 2400
  - 03-engine: 366, 400, 496, 683, 734, 1329, 1352, 1369, 1419, 1466
  - 04-rules: 117, 150, 191, 206, 598, 803, 1034, 1099, 1130, 1214, 1224
  - 05-flow: 677, 695, 939, 979, 1261, 1876, 1966, 2002, 2026
  - 06-ai: 446, 468
  - Notices (one button, 7): 03-engine 490 · 04-rules 1027, 1093, 1122, 1204, 1249 · 05-flow 1908.
  - 07-ui adds 12 decision windows and 3 notice windows (market, trade, distribute, defend …) that the engine awaits.
- **sleep() in the rules (25):**
  - 03-engine: 605
  - 04-rules: 437, 459, 998, 1004, 1010, 1017
  - 05-flow: 1090, 1097, 1110, 1121, 1134, 1147, 1150, 1157, 1409
  - 06-ai (CPU pacing, render + sleep pairs): 274, 365, 420, 526, 940, 947, 979, 991, 998
- **render()/draw() from the rules (37):**
  - 04-rules: 171, 436, 458, 775, 997, 1003, 1009, 1016
  - 05-flow: 404, 686, 1009, 1072, 1088, 1101, 1109, 1120, 1130, 1133, 1163, 1234, 1402, 1898, 2047
  - 06-ai: 273, 364, 419, 525, 904, 915, 939, 946, 978, 990, 997, 1015, 1047, 1091
- **Direct DOM:**
  - 03-engine: 151–175 (log and caption build `<li>`)
  - 05-flow: 316, 360, 363, 376 (`$('#log').innerHTML=''`), 382, 2049
  - 02-data: 45
- **log() call sites:** 03-engine 62 · 04-rules 77 · 05-flow 96 · 06-ai 23. All text is translated at the call site with _T.
- **HEADLESS branches:**
  - 02-data: 58, 62, 70 (later/sleep)
  - 03-engine: 150, 167, 605, 703
  - 05-flow: 261, 280, 313, 376, 380, 393, 401, 561, 2024, 2047
  - 06-ai: 160
  - Whole codebase: 251 references.
  - 07-ui:3099 is the modal auto-answer (the close value, else the first enabled button). It is today's de facto "headless decision provider".
- **Math.random in the rules (7):** all harmless.
  - Seeds: 03-engine:708, 05-flow:116.
  - A blood trail, cosmetic: 05-flow:1388.
  - A thought throttle: 06-ai:162.
  - The rand() fallback: 02-data:143.
  - Seeded rand/rnd/pickOne/shuffle calls in the core: 82.
  - NB crowdReact (16-crowd:424) uses the SEEDED dice (spectator moods and grudges), so it belongs to the engine, not the screen.
- **Display-only S fields** (of 230 distinct S.* names, 175 written somewhere):
  - mode: a UI selection, but recorded by lockstep 'tile'
  - logLines, bubbles, boardPid, showResults, clean/cleanDone
  - zoomIn/zoomOut/zoom90, musicPick/musicPick85
  - night: display only, per onlcore
  - S.busy (64 refs in 20 files) is a UI lock that also gates lockstep readiness.
- **Logic that reads the screen:**
  - 170-v89hs:21 reads the text of S.logLines.
  - 134-v83spikes:13 and 113:143 rewrite log HTML with an English regex. Cosmetic, but it misses in other languages.

### 1.3 Wrappers (the patch chain)
- 187 wrapper assignments on 70 of the 260 core functions, in **69 modules**.
  - They contain 90 screen calls: log 48, modal 12, DOM 10, fx 6, render 5, mToast 3, …
- Most wrapped functions: beginTurn 18 · startEvent 15 · newState 13 · log 11 · mkPlayer 11 · doAttack 8 · giveLoadout 7 · hurt 7 · eliminate 4.
- Modules with the most wrappers: 218-v93bus 8 · 133-v83onl 7 · 139-v84onl 7 · 232-v96board 7 · 80-aitiers 6 · 225-v94armory 6.
- Whole codebase:
  - 1,700 function reassignments in 218 modules.
  - 89 modules both change game state and call the screen.
- modal() is wrapped in 21 modules (113, 119, 121, 149, 155, 158, 163, 166, 169, 170, 178, 179, 204, 208, 218, 224, 227, 236, 246, 247).
  About 40 places recognise a window by its (translated) title.
- Call counts across the codebase:
  - modal: 143 calls in 50 files
  - log: about 501 in 70
  - draw(): 526 in 96
  - mToast: 233 in 83
  - Math.random: 375 in 79

### 1.4 Online lockstep today (113-onlmatch, 121, 254)
**Inputs:**
- tile: onTile
- act: a trusted [data-act] click, replayed by clicking a hidden twin button. There are 73 data-act sites in 20 files.
- modal: the value a window resolved with, matched by order plus a slice of its title

**Screen-timing heuristics in the protocol:**
- `ONLM.uiAt` 300 ms: a window that opens within 300 ms of a click on a bar is treated as local and not recorded.
- 121: an input that "cannot apply" is voided locally after 2.5 s settled. It is not a server input, so a replayer cannot know about it.
- 254: inputs were applied in the middle of endTurn, because sleep-paced continuations left phase='action' with S.busy false.

**Probable bug:** 113:56 auto-declines a CPU's truce or trade offer with `/offers a truce|proposes a trade/.test(title)`.
- The title is translated (06-ai:446,468 `_T`…), and the "decline" button is found by an English label regex.
- A non-English client probably falls through to a recorded decision while an English client auto-declines, so they drift apart.
- A tonl test needs to confirm it.

**What the server keeps:**
- It stores `MATCH#id/OPEN {snap}` and `IN#seq {in}` (routes.js:591,803; 2-day TTL). The HOST cuts the opening snapshot.
- Results are decided by agreement (onlcore.js:349). A lone human against CPUs is "unverified".

## 2. Target architecture
- **Engine** = S + the rules + the CPU (02–06 plus the rule parts of later modules).
  - It never touches the DOM, never sleeps and never opens a window.
  - It draws dice only from rand()/sideRand().
  - Crowd moods stay in the engine (they use the dice).
- **Input port (one):** `ask(seat, kind, spec) → Promise<value>`.
  - kind = a stable key ('defend', 'focusLoc', 'limbRegrow', 'truceOffer', 'roundReward', …).
  - spec = the options as data, plus the HTML the window shows today.
  - Plus `command(seat, {k:'tile'|'act', …})` for turn actions, dispatched through a registry instead of DOM clicks.
  - Providers, chosen per seat:
    - human/UI: today's modal(), same pixels
    - CPU: the existing inline `p.cpu ? … :` branches, moved behind the port later
    - headless: the 07-ui:3099 rule
    - lockstep: record mine and await theirs, keyed by kind + seq instead of the title
    - replayer: feeds the recorded values (server and tests)
  - The engine is "ready for input" exactly when a request is pending; that becomes onlmReady.
- **Events out:** the BUS (it already exists: 00d-bus, with 218 emitters).
  - Add 'log' {html, cls} as the ONLY path for log text; the DOM writer and the caption become subscribers.
  - The text stays translated where it is made. Re-keying the 500 call sites is out of scope and buys nothing for the goals.
  - The server ignores text.
- **Waits:** the engine calls `beat(kind, ms)`.
  - The presentation port turns it into today's sleep: speed, pause, step, snap, and the 235 Fast hook.
  - Headless and the server resolve it at once.
  - render()/draw() calls from the rules become `BUS.emit('state')`, and the UI repaints on its own frame.
  - fx, shake and fxLine become announcements.
- **HEADLESS** becomes "the headless providers are installed". The 251 checks shrink as the call sites move behind the ports.

## 3. Phases
Each phase ships on its own. The gate for each is the suite (tv93l pixels, trng92 dice, t12a/b/c sims, tonl*) plus Phase 0's replay.

**Phase 0: replay harness (1–2 d, low).**
- Record the seed, the opening snapshot and every input (tile/act/modal values) of an offline match.
- Replay it headless in the page and compare the end hash (onlHash), S.logLines and RNG.s.
- Add a tonl variant that replays a recorded 2-seat online match.
- Add a test for the truce/language case.
- *Value on its own: yes.*

**Phase A: question port (5–8 d, med-high).**
- A1: `ask()` with the UI provider = today's modal call, with the same title/body/buttons. Applied at:
  - the 33 core decision sites
  - the 12 07-ui decision sites
  - the 12 modal calls inside engine wrappers
  - The pixels can't change.
- A2: lockstep records `ask` by kind + seq. That drops:
  - the title regex
  - the 300 ms heuristic for engine windows
  - the title matches in 163 and 236
- A3: a `command()` registry for data-act. Keep the twin-button click as a fallback until every handler is registered.
- Make the 121 "void" a server-ordered input.
- Risks:
  - modal wrappers in 21 modules
  - hot seat (hsAsk) and the stands' decisions must keep their owners
- *Value on its own: yes (online robustness).*

**Phase B: log as events (0.5–1 d, low).**
- log()/caption() → BUS 'log' + S.logLines.
- The DOM writer becomes a subscriber, installed first so the 8 log wrappers (93, 113, 134, 139, 204, 218, 220, 233) keep their order.
- Keep HEADLESS skipping, so sims stay as fast as before.
- Gate: the log is identical in t12/tonl.

**Phase C: waits through the presentation port (2–4 d, medium).**
- The 25 core sleeps, the CPU pacing and the 37 render/draw calls → beat()/'state'.
- The engine exposes `awaiting` (the pending ask/command), and onlmReady reads it; the F98 counters in 254 retire.
- Gate: the tv92p soak, the step/pause/snap/Fast tests, Reduce motion, and the tonl98f mixed-speed test.

**Phase D1: Node without a browser (3–5 d, medium).**
- A ~200-line stub page (document/window/canvas/localStorage no-ops) loads the built script with the headless providers.
- A tool generates the bundle (like 195-v91srvexp).
- Proof: replay a recorded online match in Node and get the same end hash as the browsers.
- The 202 load-time modules mostly do addEventListener / createElement / head.appendChild, which a stub can absorb.

**Phase E: Ranked verification (4–6 d + deploy).**
- A separate verify Lambda: Ranked only, ≥512 MB, 60–120 s, invoked async after match.report.
- It loads the D1 bundle for the build hash the match was played on, replays OPEN + IN#, and compares the results table and end hash
  with the agreed result.
- On a mismatch it follows the policy you pick in Q3.
- Later: rebuild the opening from the seed and config instead of trusting the host's snapshot.
- Today's Lambda (256 MB, 10 s, no packages) can't host this.

**Phase D2: full carve-out (3–6 wk, high).**
- Move the rule parts of 89 mixed modules into an engine bundle with no screen code.
- Not recommended now.

## 4. Cost and benefit
- **Goal 1 (server check):** needs 0 + A2 (explicit voids) + C + D1 + E, about 3–4 weeks. It closes the lone-human-vs-CPU hole.
- **Goal 3 (desyncs):** A + C, about 1.5–2 weeks. It removes the timing heuristics behind 121/254 and the probable language bug.
- **Goal 2 (sims):** small. A headless simEvent already takes 50–90 ms; D1 mostly saves the Chromium start-up.
- **Goal 4 (renderer swap):** needs D2. Not a reason to start now.
- **Most fragile:**
  - wrappers that rely on call order (beginTurn ×18, startEvent ×15, modal ×21 modules)
  - the lockstep's modal/act recording (title slices, hidden twin buttons, the 300 ms gap)
  - the speed modes (step/pause/snap/Fast SLEEP_HOOK)
  - logic that reads log text (170-v89hs)
- **Now vs v1.0:** B and C touch draw()/render() and hit feedback. That is exactly where v1.0's 3D gear, arena and hit-feedback work hooks
  in, so starting them in parallel would mean two moving targets in the same wrappers.
- **Recommendation:** first phases only: 0 now, then A–C after v1.0. D1/E when you decide Ranked needs them. Not D2.

## Critical files
- src/113-onlmatch.js: lockstep recording of modal/act/tile, onlmReady, and the truce title regex at line 56.
- src/07-ui.js: modal() and its HEADLESS auto-answer at line 3099, act() at line 17, the data-act dispatcher at line 2871, humanCommand.
- src/03-engine.js: log/caption at lines 149–175, plus 10 decision windows.
- src/05-flow.js and src/04-rules.js: most of the decisions, sleeps and render calls.
- src/218-v93bus.js and src/00d-bus.js: the event bus the plan builds on.
- Also relevant:
  - src/254-v98fastonl.js and src/121-onl80fix.js: the timing-heuristic fixes.
  - src/02-data.js: rand/sleep/later/HEADLESS.
  - server/src/routes.js: OPEN and IN# storage, at lines 591 and 803.
  - server/src/onlcore.js: agree() at line 349.
