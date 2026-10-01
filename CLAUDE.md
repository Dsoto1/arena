# Flavius Rule Arena — handoff notes for Claude Code

A single-file HTML/JS/Canvas adaptation of **David's board game "Flavius Rule"** (gladiators in a 13×13 isometric
arena, Roman-themed). Current version: **v0.54**. Owner: David.

Modes: **Play Now / New event** (single events, festival, missio, tournament), **Manager mode** (run a ludus through
12-week seasons), **Creator Studio** (designers for characters, classes, lanistas, beasts, cohorts, tokens, weapons,
armor, trophies, banners, events, tournaments, invitationals, editors, spectators, roster sets, names),
**Hot seat** multiplayer, lessons (Classic + Manager), Annals/Hall, Imperium (empire map + world events).

---

## 1. Working with David (standing rules)

- **Ask clarifying questions before starting a batch** — as many as it takes to resolve what's unclear (no fixed
  limit; don't ask what the request already answers), multiple-choice where possible. He sends work as
  numbered item lists ("batches"); answer any direct questions inside them ("correct me if I'm wrong").
- Keep **in-game wording succinct**. No tooltips for internals the player never needs (e.g. how music is generated).
- Tooltips nest **at most 2 levels**; a term never links to itself.
- When a feature is added to one designer, **integrate it into the others** where it fits (shared look controls, same
  button rows: 📜 rolls · 🔒 lock · Edit · Copy · Delete; system sets locked, "Copy & edit").
- **Follow the rulebook** over the printed event cards when they disagree (decided in v0.52).
- Deliver each batch: version bump → regression → share build → publish → concise summary of what changed.
- Communication: concise and technical.

## 2. Layout & build

```
flavius/   (repo root; build.sh and tools/*.py resolve paths from their own location)
  build.sh              concatenates src/ in a fixed order into flavius-arena.html, then node --check → prints SYNTAX_OK
  flavius-arena.html    the built game (references assets/ relatively)
  assets/               23 image assets (arena.jpg card sheet, classes.jpg, weapons.jpg, armor2.png, avatar.png,
                        blessing.png, tunnel_open.jpg / tunnel_door.jpg, rtok.webp, logo.png, map.jpg, …)
  src/                  ~69 source files (see order in build.sh)
  share/                self-contained share builds (assets inlined as data URIs), flavius-rule-arena-vX.YY.html
  tools/
    runreg.sh           full regression runner (115 Playwright tests in tools/tests/)
    tests/*.js          one test per file; each takes the page path as argv[2]
    mkshare.py          python3 tools/mkshare.py 0.54  → share/flavius-rule-arena-v0.54.html (run from project root)
    tshare54.js         smoke test for a share build (expects a copy in /tmp/sharetest39/)
    shot_arena.js       screenshot helper: node tools/shot_arena.js <page> <width> <out.png>
    rename.js / samecode.js   Babel tools used for the readability pass (see §8)
```

- Build: `sh build.sh` (must end with `SYNTAX_OK`; it also trips a guard if code follows a `//` comment on one line).
- **When adding a module**, insert it in build.sh *before* `src/08-setup.js` (08-setup must stay last).
- Playwright + Chromium are preinstalled (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; do not `playwright install`).

## 3. Architecture

One global script; files are concatenated in order. Later "version modules" patch earlier code by **wrapping**:

```js
{const base=fnName;fnName=function(...a){/* before */const r=base.apply(this,a);/* after */return r}}
```
- Works for `function` declarations and `let` functions. **`const` arrows cannot be wrapped** (e.g. `fixtureFor`, `cfAllowed`).
- Module ordering matters: a wrapper only sees wrappers installed before it.
- Version modules: `47-mgr47`, `48-arena47`, `49-studio47`, `50-v48`, `51-v49`, `52-v50`, `53-guide50`, `54-v51`,
  `55-anim`, `56-v52`, `57-classes`, `58-looks`, `59-bye`, `60-v53`, `61-studio53`, `62-rules53`, `63-empire53`, `64-v54`.
  Each starts with a header comment listing what it does. Put new batch work in a new `NN-vXX.js` module.

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

### Systems worth knowing
- **Classes (57/61/64):** a class = the loadout (weapons, armor, ability, weakness, coin, keys, starting CF, ≤3 items).
  Characters (`customChars`) point at one via `classRef`: `cls:<printed>` or `ccl:<id>` (legacy `ccp:<preset>` is
  migrated to user classes). `applyClassToChar` copies the loadout onto the character; `charClass()` registers
  `CLASSES['cc_'+id]` with `clsRef`. Class cards: `classCardSVG/classCardHTML` (character name/portrait/token when
  given). Printed classes are the system defaults (`printedClass(key)`); user classes need unique names and colours
  (`classNameTaken`, `classColorClash`, `uniqueClassColor`).
- **Unique gear (62):** only stackable armor has copies; `giveLoadout` pulls loadout pieces from the market and gives
  stand-ins (same slot, never more AP) when two gladiators' loadouts share a unique piece.
- **Piacula (64):** one per class identity on the sand (`piaIdentity`); printed card if it exists, otherwise a drawn
  card (`pia_cc_*`, layered HTML over the printed art with the class name in its colour).
- **Focus roll (62):** `chooseLocation` → animated dice modal; `bestLocation/locationScore` (head/chest/last arm
  first, legs last); suggestions only with hints + strategy panel on.
- **Manager:** `W_()` world, `me()` player manager, `rosterOf`, `gById`, `mgrById`, `endWeek()` (async),
  `makeNight()` builds the week's 3 bouts (`w.night`), `applyBout`, `MGR_REDRAW()`. Weeks are absolute; `wkOf(abs)`
  → 1–12. **Bye weeks 4 & 8** (59-bye). **Empire closures** (63): a shut host city moves games to the nearest open
  arena; impromptu bye only if no arena can host, once per season. Pay-to-join free agents + fight requests (64).
- **Tooltips (52-v50 + 56 + 60):** `data-tip` / `data-tt` (glossary `GLOSS`), placed beside the anchor, max depth 2;
  glossary tab in Rules & strategy.
- **Cheats:** never put code words in plain text anywhere in the page. Register with
  `cheatRegister('h'+hashStr('code:'+WORD), run, label)`; the reveal list `CHEAT_SHOW` stores char codes +7.
  Current words: EDITOR12 (all editors), MUSICA16 (all 16 themes), LUDUS50 (+50 coin), CHARD / DUCKIO (bonus houses).
- **Music:** procedural Web Audio (21-audio, 45-music, 16 themes; unlocked by winning in cities). Play Now plays a
  random unlocked theme or the Custom Event's `music`; Manager keeps city themes; final duel uses the boss theme.

## 4. Conventions & gotchas
- Never put code after a `//` comment on the same line — use `/* */` (build.sh guard).
- Avoid broad find/replace across files (once turned `fonts.gstatic.com` into `fonts.gtileic.com`).
- Prefer wrapping in a new module over editing old modules; small direct edits are fine when wrapping is impossible
  (template literals, const arrows). When editing templates with Python, assert the old string exists first.
- A `.tt` class name inside other UI clashed with the tooltip engine — tooltip CSS is scoped to `.tt[role="tooltip"]`.
- Tests that need the main menu set `navigator.webdriver=false` and `localStorage flavius_firstrun='shown'` in an
  init script (otherwise the first-run welcome modal appears).

## 5. Testing
- Full suite: `(nohup sh tools/runreg.sh >/dev/null 2>&1 &)` then watch `tools/reg.txt` for `ALLDONE` (~35 min).
  Pass = every block ends `exit=0` and prints `ERRS []`. Run a subset: `sh tools/runreg.sh tv53 tpia`.
- `t12` plays every event via sims (slow). Version tests: `tv50…tv54`-style files (`tv52`, `tv53`), plus feature tests
  (`tcls` classes, `tlook` accessories, `tbye` bye weeks, `temp53` closures, `t53s` studio, `tres` results,
  `tmgr54` manager, `tpia` piacula, `t54a` studio/event designer).
- When a UI move breaks an old test intentionally, update the test (keep its intent).
- Visual checks: write a short Playwright script, screenshot, and look at it.

## 6. Release workflow
1. Bump the badge in `src/01-head.html` (`arena · vX.YY`) — this sets `GAME_VER`.
2. Add a `MILESTONES` entry at the top of `src/34-notes.js` (`hi` = new features, `fx` = fixes/changes; keep it short).
3. Add a `SAVE_MIGRATIONS` entry if world data changed shape.
4. `sh build.sh` → full regression → `python3 tools/mkshare.py X.YY` → smoke-test the share build.
5. Publish to the claude.ai artifact **https://claude.ai/artifact/8LU6eHbPpuznn64JeWZ6We** with the page and all 23
   assets (label "vX.YY"); live is Version 65 = v0.54. Before publishing, review any new shared-Store writes and make
   sure no cheat word appears in plain text. Send David the share build file.

## 7. Version history (recent)
- **v0.48** depth chart, loans, Vulso's cart, Hygeia, two guides, 16-season stress fixes.
- **v0.49** hot seat (profiles in localStorage), Match Week, newcomer balance, music seek bar.
- **v0.50** nesting glossary tooltips, guide re-run on 600 sims with charts, Zora card, truce fix.
- **v0.51** projectiles/corpse crew animation, fighter panel, log tinting, phone tabs, save versioning.
- **v0.52** rulebook round rules (Triumviratus elim1 FFA, Familia no CF/CA, Ludus rot10, Chariot no CF, Naumachia no
  PvE); class creator + auto-converted characters; Lanista creator look maker; 2× accessories; bye weeks 4 & 8;
  arena tools drawer; loading bar + quotes; first-run welcome (hints off for new players).
- **v0.53** Lanista designer in the Studio; class cards show the character; Focus dice; unique armor; empire
  closures; turn indicator dot + ⓘ; Speed tray; 2-level tooltips + Glossary; core files renamed/commented (phase 1).
- **v0.54** Piacula per class; printed classes as system defaults (8 v0.53 presets removed/migrated); Invitationals
  (arena + trophy shell); Event Designer Beasts & cohorts picker with real tokens + arena music; results Save all +
  Fate up front; Manager purse banking, pay-to-join, fight requests, Favorites inside Recruiting, Sort tray;
  tamed beasts don't steal aggro; Play Now random music; roster filled by hand only.

## 8. Next steps / open items
- **Readability pass, phase 2+** (David chose "phased"): files 02–07 are done (Babel scope-safe parameter renames via
  `tools/rename.js`, then comments on every function with `TWEAK:` notes; verified with `tools/samecode.js`, which
  compares code ignoring comments/whitespace). Remaining: 08–64, file by file, regression after each. Rename only
  function parameters in the safe map unless verified; never change behaviour.
- Possibly offer: remove the 32 auto-generated Ludus recruits created by older builds (`recruit:true` in `gladiators`).
- Event Designer: a full step-by-step wizard was deferred (David chose the "Beasts hub + pieces" scope for v0.54).
- Play Now setup: the city/modifier header above the map could align exactly to the map width.
- Hot-seat LAN/Online lobbies are placeholders.
- Keep watching: shared-Store writes on load (conversions must be idempotent and saved once).
