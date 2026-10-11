# Flavius Rule Arena — handoff notes for Claude Code

A single-file HTML/JS/Canvas adaptation of **Virgilante's board game "Flavius Rule"** (gladiators in a 13×13 isometric
arena, Roman-themed). Current version: **v0.99**. Owner: Virgilante.

Modes: **Play Now / New event** (single events, festival, missio, tournament), **Manager mode** (run a ludus through
12-week seasons), **Creator Studio** (designers for characters, classes, lanistas, beasts, cohorts, tokens, weapons,
armor, trophies, banners, events, tournaments, invitationals, editors, spectators, roster sets, names),
**Hot seat** multiplayer, lessons (Classic + Manager), Annals/Hall, Imperium (empire map + world events).

---

## 1. Working with Virgilante (standing rules)

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
- Batches may come split into **NEW** (features/additions) and **FIXES / CHANGES** (where · what happened · what was expected).
  Fixes go straight into the next build; features get clarifying questions first. Keep his numbering in questions and summaries.
- **Deleting a custom creation always asks first** (`DEL76` in 109-v761: one centred popup naming it). A new designer's delete
  button must use one of those attributes or be added to `DEL76`; test `tdel76`.
- **When he sends a list, do NOT build, commit or publish until he says go** — sometimes he only wants to dump notes. Read it, sort it,
  ask the questions, then wait. (A release he already approved may finish.)

- **STABILIZATION RELEASES (his call 2026-10-07, from v0.95):** releases focus on fixes + changes to established features. He sends notes
  (where · what happened · what was expected, 🔴/🟠/🟢); when an item is really a NEW feature — even if he files it as a fix — say so, sort it
  into "New feature?" in the questions, and park it in tools/plans/backlog.md unless he pulls it in. Fixes go straight into the next build.

- **ONE CONVERSATION AT A TIME (his call 2026-10-09):** two places work on this repo (VS Code on API credits, the cloud session). Before editing, run `sh tools/baton.sh status`; take the baton with `sh tools/baton.sh take <vscode|cloud>`, and when he says wrap up/hand off: update tools/plans/HANDOFF.md ("Last session notes"), commit, push, `sh tools/baton.sh give`. If the other side holds the baton, stop and tell him. Keep him honest.

- **QUOTA RULE (his, 2026-10-07):** the lead (Opus) plans features, reviews, merges and runs releases; routine bug fixes, test edits and
  small immediate code changes go to a Sonnet sub-agent (Agent tool `model: "sonnet"`) to save tokens. Big feature builds stay with the lead's
  default model unless he says otherwise.

- **VISUAL POLISH RULE (his, 2026-10-07):** preserve gameplay clarity, responsiveness, accessibility, localization, save compatibility, network
  authority and the existing desktop + mobile experiences — never improve a beauty shot while making the game harder to read or slower to play.
  Every visual change must keep passing: draw-cost budgets (tv91r "draw time", tv92p soak/idle), clarity (tv91r nothing over the sand/pieces),
  FRAME TARGET (his, 2026-10-11): 60 fps on a mid-range laptop and 30+ fps on a mid-range phone in a normal match at Normal speed, zoomed
  and not (≈16 ms a frame on a laptop; a feature that pushes a typical laptop frame over 16 ms is a bug) — checked on his devices with the Settings FPS meter;
  headless tests keep relative budgets. phones (tv66 / tv88 phone tests, 390 px checks), languages (tv86 / tv87l walks: leftover English + overflow), saves (SAVE_MIGRATIONS + the
  tab/version guards), the dice (trng92), online lockstep (tonl*), Reduce motion / animations Off honoured; a new effect gets an Off path.

## 2. Layout & build

```
flavius/   (repo root; build.sh and tools/*.py resolve paths from their own location)
  build.sh              concatenates src/ in a fixed order into flavius-arena.html, then node --check → prints SYNTAX_OK
  flavius-arena.html    the built game (references assets/ relatively)
  assets/               ~35 image assets (armor2/chtok are .webp since v0.57; cr_* credits art since v0.59) (arena.jpg card sheet, classes.jpg, weapons.jpg, armor2.png, avatar.png,
                        blessing.png, tunnel_open.jpg / tunnel_door.jpg, rtok.webp, logo.png, map.jpg, …)
  src/                  ~69 source files (see order in build.sh)
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
  `55-anim`, `56-v52`, `57-classes`, `58-looks`, `59-bye`, `60-v53`, `61-studio53`, `62-rules53`, `63-empire53`, `64-v54`,
  `65-stats55`, `66-mgr55`, `67-studio55`, `68-fix55`, `69-v56`, `70-v57`, `71-v58`, `72-v59`, `73-credits`, `74-zora`, `75-naum59`, `76-chariot59`, `77-rivalry`, `78-v60`, `79-screens`, `80-aitiers`, `81-v63`, `82-access`, `83-edsteps`, `84-v64`, `85-v65`, `86-v66`, `87-v67`, `88-v68`, `89-stands`, `90-armfit`, `91-v69`, `92-v70`, `93-v71`, `94-v72`, `95-v73`, `96-armlv`, `97-armor73`, `98-avatar73`, `99-phone73`, `100-sica73`, `101-rec73`, `102-minis73`, `103-v74`, `104-cards74`, `105-mgr74`, `106-v75`, `107-v751`, `108-v76`, `109-v761`, `110-v77`, `111-onlcore`, `112-online`, `113-onlmatch`, `114-onlnet`, `115-v79`, `116-onl79`, `117-onltz`, `118-onl80`, `119-onl80rules`, `120-v80fix`, `121-onl80fix`, `122-v81play`, `123-v81art`, `124-v81onl`, `125-v81fix`, `126-v82fix`, `127-v82onl`, `128-v82stands`, `129-v82beasts`, `130-v82vis`, `131-v83council`, `132-v83arrows`, `134-v83spikes`, `135-v83chest`, `136-v83sand`, `133-v83onl`, `137-v83onlui`, `139-v84onl`, `138-v84`, `140-v84prog`, `142-v84ui`, `143-v84roster`, `141-v85faith`, `144-v85rec`, `145-v85fix`, `146-v85land`, `147-v85music`, `148-v86lang`, `149-v87fix`, `150-v87mgr`, `151-v87ward`, `152-v87npc`, `153-v87card`, … `164-ready`, `165-v89seats` … `182-v89vault`, `168-v89rotate`, `183-v90ward` … `187-v90pn`, `188-v91sponsor` … `202-v91ludus`, `203-v91editor`, `206-v92econ`, `208-v92zoom`, `207-v92extras`, `205-v92pn`, `204-v92perf`, `209-v92cheer`, `210-v92fix` … `216-v92errui` (last before 08-setup); `00b-perf` and `00c-errlog` run FIRST (build order as listed; `00-lang` runs FIRST, before 02-data; the language file assets/lang_<l>.js is loaded by 01-head before the script).
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
  → 1–12. **Bye weeks 4 & 11** (59-bye; 77-rivalry moved the second from 8). **Empire closures** (63): a shut host city moves games to the nearest open
  arena; impromptu bye only if no arena can host, once per season. Pay-to-join free agents + fight requests (64).
- **Tooltips (52-v50 + 56 + 60):** `data-tip` / `data-tt` (glossary `GLOSS`), placed beside the anchor, max depth 2;
  glossary tab in Rules & strategy.
- **Cheats:** never put code words in plain text anywhere in the page. Register with
  `cheatRegister('h'+hashStr('code:'+WORD), run, label)`; the reveal list `CHEAT_SHOW` stores char codes +7.
  Current words: EDITOR12 (all editors), MUSIC (every theme, v0.85; the old 16-theme word is retired), LUDUS50 (+50 coin), CHARD / DUCKIO (bonus houses), ARMORFIT (the printed-set fit tool), LOBBY77 (Online preview), ONLSRV (shows the Online server box on the sign-in card). (Touch screens: holding the main menu version badge = the C key, 126.)
- **Ratings (65/66/67, v0.55):** every gladiator has `st`/`g.stats` = {spd,str,int,lck,cha}, 50–99 (`STATS`,
  `statBonuses`). Speed → +1/+2 movement (76/96), Strength → +1/+2/+3 damage (76/87/96), Luck → coin/turn, Charisma →
  CF/turn (76/96), Intelligence → CPU difficulty (`bandInt`: Easy <76, Normal, Hard 96+). Movement/damage/coin/CF pay
  only when `caAllowed()`; helpers `statDmgB`, `statMvB`, `statTurn` (called in takeChoice). The class abilities
  mv/dmg/coin/cf/vet (`STAT_ABILS`) are nulled on the player — classes keep loadout, weakness, stones, and Zora or a
  tamed ally (`C.ally`, released via `spawnZora`). Ratings come from `seatStats`: seat `stats` (Manager `seatFor`),
  a Studio character's `stats` (375 pool, `STAT_BUDGET`), or a roll leaning by printed class (`STAT_LEAN`, seeded off
  the event seed — never the dice RNG). Hard CPUs no longer get the veteran's edge. Beasts: `npcRatings` (display only).
  Manager: `gStats(g)` creates ratings lazily (deterministic from id); `statGain` grows them (bouts in `applyBout`,
  exhibitions, Training Yard, loyalty bonds, rival/free-agent drift) and posts band-ups; `statOvr` feeds `effOvr`.
- **Manager v0.55 (66):** `sendLetter`/`lettersHTML` (letters only in Your ludus + Match Week); `adviseWeek`
  (Consilium letter when `worldImpact` is bad); loans: syndicate only (`loanLender`), `loanWeek` = interest + weekly
  minimum, no garnish; 3 short weeks → `w.syndSpear` → next `boutCfg`/`exhibCfg` carries `syndSpear` → spear at
  rotation 7 (`spectatorsAct` wrapper); friendly houses send gifts (`friendGift`); home games (`homeCfg`, seat
  `homeHouse` → +2 CF); medal-ladder grades (`gradeCol`, `gradeChip`); rail headers fold (`flavius_railshut`).
- **Mail (69, v0.56):** Your ludus opens with a 📬 Mail panel. `buyOfferHTML` (the old top-of-tab card stack) now
  prints nothing except Vulso's cart; `mailLive` re-reads that stack (`MAIL_BASE_TOP`), pulls `.invbox/.specbox/
  .loanbox.offer/.lagbox` out of the ludus body, and adds `w.letters` → envelopes (offer/invite/letter/report) that
  keep their own buttons. `mailSync` logs them in `w.mailLog` (past mail); `w.mailRead` = read keys; the rail shows
  the unread count. New notices: `sendLetter(w,{key,kind,from,seal,title,body,until})`. Match Week shows one line.
- **v0.57 (70):** `startTileAlpha` fades start marks; `LAUREL_DELAY` (laurels after fanfare + horns, none on kills);
  clean-up show herds beasts out and keeps them out (07-ui `npcs` phase returns 2); `modal(...,{keep:v=>…})` keeps the
  window up when it will reopen (results Save); `START_DIFF` for custom houses (`choice.mgr.diff`); word-houses in the
  take-over list (`data-takehouse`); mail keeps unread letters ≤8 weeks, no past mail; `g.court` (last offer) chips on
  the shortlist; `loanTag` = purple LOANED + terms; travel gates enter/watch/fight/spect/walk (`data-dis`); `MGR.loopHidden`;
  first-bye letter (`w.byeLetter`); one billing per fighter (22-trophies cm_set); `recallFee` + `data-recall`.
- **v0.58 (71):** Naumachia ships are 3x5 rectangles (all 15 tiles deck; `SHIP_LAYOUT` sets r0/c0/rows/cols/pillar/rot — a pinwheel ring:
  two north-south, two east-west, rot 0-3 = bow N/E/S/W); `drawShipTile` (hooked in draw's tile loop) paints `assets/ship.webp` through `shipXform` (affine art→iso);
  bows drawn after the last tile. Hull bar = HP only; `describeTile` names the ship on its pillar. Prototype gallery
  `protoOpen` (`[data-proto]`: menu footer D.Soto, Play Now guide) shows assets/proto1-5.jpg.
- **v0.59 (72-77):** `72-v59` — Ludus/Road → Play Now hand-off holds the curtain (`HANDOFF_SEL`); menu launches keep the curtain
  while the mode opens (`MM.launchPending`, `transitUncover` wrapper; the built-in 3 s watchdog stands down); `turnSweep` clears
  #cardShow/#bubbles at each `beginTurn`; `#mmMute` beside Settings (no #audChip); #btnSimEnd moved into the Speed tray ("⏭ To the end"). `73-credits` — `creditsOpen(tab)` (Credits |
  Prototype), assets cr_*.*, text in tools/art/credits/. `74-zora` — `STANDEE_SRC.zoraMini` + `drawZoraMini` (figure/standee
  styles; cylinders and panels keep the disc). `75-naum59` — `SHIP_LAYOUT59` (TL/BR east-west, TR/BL north-south), `shipDeck`
  (no corners), `shipBoarding`/`canBoard` (nReach rewritten), `WATER_TOK59` pinwheel, art over the whole box (`shipBoxAt`),
  boarding fx in a naumStep wrapper; swimmers waist-deep (07-ui drawPlayer). `76-chariot59` — snake `chariotDraft` with
  `CH_CARDS59`, `ch.gateAt` free step (chReach rewritten), horse/wheel tokens via `chTok` (chtok.webp), flip (`horse.flipT`),
  `CH_DROPS`. `77-rivalry` — `BYE_WKS` = [4,11]; week 12 fixture = familia; `rivalPairs` (mutual heat), `rivalLock` at week 11
  (letter with `[data-rivcommit]`), `rivalNight` (3 card bouts, `n.bgRival` background pairings), `rivalBackground` at endWeek,
  fame for the winner. Event-card repaints: tools/evfix.py (used by mkscans `events`; needs numpy + opencv).
- **v0.60 (78):** Road from the record — `ludusDetail` wrapper puts 🛣 Send on the Road (`data-roadsend`, handler in 48-arena47)
  on every living non-CPU gladiator (custom characters too) and ⚔ Walk stage (`#ludusBody [data-road="go"]`) on the walker's;
  `ROAD_NOW` cached in an `openLudus` wrapper; the Hall's Road box (`roadVisualHTML` wrapper) has no dropdown, only a
  `data-tab="ludus"` button. Annals loop fix: `openHall` drops a stale hidden `#hallBody` so a fresh window opens.
  `mmAfterClose` wrapper: curtain + 320 ms grace so window-to-window hand-offs never flash the main menu.
  Tame (rulebook p.40): CARDS.tame shows the Lyre face; tamed NPCs carry no aggro (swept each beginTurn); `tamedAttack`
  wrapper — no instant counter: wild target → `setAggro(target, owner,'tamed')`, rival's tamed target → `hitBy` and the
  owner answers in their Resolve (`cpuCommand` wrapper goes for the hitter first). CF offerings land like other offerings
  (`revealOffering` wrapper) and pay on pickup (`pickupAt` wrapper); Spiders/Curse stay instant. Truces: `truceWho` (class
  chip in the offer modals, 06-ai + 07-ui), `drawPlayer` wrapper draws 🕊 + dashed ring for the viewer's truce partners.
- **Screens (79, v0.61):** ONE decider for what is on screen. Openers in `SCREEN_OPENERS` (openHall, openLudus, openSetup,
  openManager, openStudio, playNowMenu, managerMenu, matchSavesWindow, showRules, openSettings, cheatPrompt) register a
  `screenIntent` when called (ends when a window/event/city is up, the opener gives up, or 15 s). `screenSettle()` runs on
  window close (mmAfterClose now just calls it) and when an intent ends: window up → uncover · intent pending / horns →
  wait · live event or city → show it · came from the menu → menuShow · else nothing. `MM.launchPending` is a getter for
  "an intent is pending". **Any new function that ends in a window should be added to SCREEN_OPENERS.** The Annals'
  own menu timer (10-meta) is off when screenSettle exists.
- **Five minds (80, v0.62):** Intelligence → `AI_TIERS` (Novice <65, Apprentice 65, Fighter 76, Veteran 86, Master 96; `aiTierOf`,
  `aiTier(p)`, chip `aiTierChip` beside the ratings, seat picker values = tier keys, old easy/normal/hard still map). Each tier sets
  `diff` (Easy/Normal/Hard switches), `blunder` (noise ×6 now and then) and `sk` skills read by `aiSk(p,k,default)` in 06-ai:
  steady, items, shop, focus, escape, shortcut, route, merchant, dodge (`aiDodge`), focusKill, lookahead (`aiLookahead`, built but
  measured no gain — off). `AI_SUBS`/`aiSubLevel` can run a subsystem at another level. Attack weights: `AIW_BASE` (06-ai), `aiW(p)`,
  `AIW_TUNED` (tools/aitune.js found nothing better yet). Ladder check: `node tools/aitiers.js flavius-arena.html 450 3` (v0.62:
  65/66/56/55%). Seat overrides for experiments: aiw, aiNoise, aiBlunder, aiPers, aiSub, aiSk, aiDz, aiDiff.
- **v0.63 (81-83):** `81-v63` — rail to-do borders (700 ms sweep `railPend`: recruit green while `w.hours`, practice amber while
  training hours, infirmary white while someone needs healing; Match Week `.nightpend` restyled to a light purple border);
  **training hours** (`thMax` 10 +2/yard level +4 bye; `thPlan(w)` = {wk,g:{gid:{spd,str,int,cha,rehab}},doc,pairs,spent},
  `thLeft`, `needTHrs`; exhibitions (`EXHIB_HOURS`) now spend them; `thResolve` runs in an `endWeek` wrapper before the base,
  doctore hours lift `m.fac.yard` by doc/4 during the week's resolution (facLvl is a const arrow)); Training Yard layout =
  banner, then `.yardtop` (hours plan | practice arena), then tiles/regime/board; `recFit` sizes `#recTable` to the details
  column; fighter panel ratings moved into `.pb-head` (`panelStatsUp`). `LANISTA_CITIES` (14-names) = the 12 arenas for house
  home cities (gladiator birthplaces keep `HOME_CITIES`). `82-access` — Settings → General → Accessibility: `SETTINGS.calm`
  (body.calm, `reduceMotion()` and `animOn` honour it), `SETTINGS.tscale` 100/115/130 (CSS zoom on panels/log/side/#mBody,
  never the canvas), `SETTINGS.cvd` (Okabe–Ito `CVD_COLORS` for the 8 printed classes, class letter on tokens, blue/orange
  badges). `83-edsteps` — Event Designer guided steps (`ED_STEPS`: Basics, Board, Rounds, Rules, Fighters & beasts, Finish)
  over the existing sub-tabs: DOM-tags `#edPane` children by the headings they follow (`edTagPane`); "All sections"
  (`flavius_edall`) shows the classic tabs. `cpuMind(p)` (80) labels CPUs by mind everywhere. mkshare / the in-game download
  inline only real asset references (comments named assets/arena.jpg → a second 5 MB copy): share build 36 → ~25 MB.
- **v0.64 (84):** missios to the rulebook (p.56): `advanceMissio` replaced — pass = win, or (non-Win step) 20+ CF / spared,
  or in no-CF events (`missioNoCF`: chariot, familia, naumachia, goldenEagle, juggernaut, gauntlet, commodus) surviving to
  the end; `missioNoFate` skips the Fate for the missio character there (10-meta fate line; `resultCard` wrapper prints
  "no Fate"); elimination → `checkEnd` wrapper ends the event at once (`S.missioFell`), record `markFallen`, missio status
  'fallen', RR lost; survivor who misses → status 'failed'; `missioHero()`. No sim in missios (07-ui hide + `simToEnd` guard).
  Modifier limbs (`player.modLoss`) never become missio wounds. Picker = whole active roster, scrollable, custom classes
  greyed. `sideRand()` (02-data) = seeded crowd stream (spectFavEnsure/spectWagers; state `S._sideS`). Chariots:
  `chRideTok` (chariot token under the racer, also parked), `chFloorTok` (spare tokens), `chCardComp` (tokens on the
  chariot card's dashed circles in the panel); 76's loose horse/wheel board tokens are off.
- **v0.65 (85):** Training Yard order = banner → regime (`.yardreg`, moved by a practiceHTML wrapper) → `.yardtop` → rest;
  `thPlanHTML` replaced: hours bank + fighter cards (`thcard`) with focus tiles (`thTile`: +1 h per tap, pips −1, preview of
  the planned gain via `GROW_SLOW`/`TH_DRILL`, next band `bandsOf`); rehab-only cards for the hurt. Rail: `.hrchip` hours on
  Recruiting/Training tabs (700 ms sweep), every to-do outline 1px muted, no glow/pulse. Fatigue `g.fat` (`FAT_*`):
  applyBout +25, regime/drills/spar at endWeek, decay after, `g.restWk` (Infirmary 🛏 Rest week, blocks drills) −50; >50 →
  up to 20% "worn down" injury. Infirmary: `careHTML` wrapper swaps the cure buttons for `planTiles` (cost + fit week via
  `fitWeekOf`), `.rtimeline`, on-the-card warning (`onCard`); Fatigue section with rest buttons.
- **v0.66 (86):** tutorial bumpers — capture guard `tutGuard` (click/pointer/touch) while `tutLive()`: coach, #modal, tooltips
  always; 🏛 → `tutExit`; tour steps (`tutTourNow`) look-only; hands-on steps only `TUT_PLAY` surfaces; body.tutlock dims
  the top bar. Phones: `phoneLand()` (min side ≤520, landscape, live event) → body.phoneL: top bar/actions/side/log become
  drawers (`pl-nav/pl-act/pl-side/pl-log`), `#plDock` buttons, actions auto-open on your move (`plTick`); draw() fits the
  arena to the full height in phoneL. Camera: `camFocus` (07-ui draw, zoomed only, not the duel) eases toward `cur()`;
  `CAM.z` pinch zoom (1–2.4, wraps duelCam); `phonePort()` → body.phoneP + `#plRot` hint. Tablets use the normal layout.
- **v0.67 (87 + small edits):** recruiting portal — `pipelineHTML` replaces the favbox (stages via `recStage`: watch / scouted /
  court (interest 30+) / ready (`recReady`: signs at the ask or 1.1×), next step `nextStep`); list Fit chip (`recFit`) + odds
  (`recOdds`), filters `MGR.rf` (aff/fit/court) by row removal; `detailHTML` for free agents = 3 steps (`MGR.recStep`,
  `recStepNow`) with a range `#ofWage` and live `ofMeterUpdate` from `offerVerdict` (no side effects). Also: Training Yard stat squares beside the regime (`.yardreg.yr2`, `cutDiv`); wagers on a
  fighter taken off a card are void + refunded (`voidBets` in 17-manager: enter, withdraw, the Gambit, and a guard at
  settlement; bet log status 'void'); career switch "Bring my Ludus Flavius gladiators into the league" (`lfPoolOn`,
  localStorage flavius_lfpool, default on); `fillNight` takes the nearest-rated free agents before creating a fighter.
- **v0.68 (88-90):** `88-v68` — Your ludus checklist replaces the todobox (`weekChecklist` items {done,ic,txt,btn},
  one button each, done items fold), header ledger badge (`weekMoney`: wages+drills vs gate share+fees of entered bouts → net/wk,
  runway, "before fees"), "You are about to skip" in `endConfirmHTML`. Economy levers in 87-v67 (`ECON`: fees 12/24/40, wages ×0.85,
  gate share 5+fame/4 ≤30 a week for every house, +100 starting purse once via `w._econ68`); tools/mgrsim.js = season simulator
  (base/yard/cheap). Rivals train (`rivalTrain` in an endWeek wrapper before the base: regime by Discipline/purse with
  cost + injury odds, hours on the weaker of Speed/Strength, rest above fatigue 60; `rivalRest` decays fatigue after; `RIVAL_TRAIN`
  turns off the old flat +0.3 drift in 66 weeklyGrowth). `89-stands` — right column tabs `SIDE.tab` fighter/field/stands (`sideApply` after render; `flavius_sidetab`):
  Fighter = #board, Field = #rosterGrp + #npcPanel (+ deck count, 📖 Bestiary button), Stands = `#standsPane` (`standsDrawerHTML`);
  #crowdPanel always hidden; the old drawer's `openDrawer` routes to the tabs; `#crowdTick` under the board = newest `S.spectLog`
  line (click → Stands); top-bar #btnDrawB = 🏟 Stands · N; `openMenagerie` = Bestiary only (B key, Field, Rules & strategy).
- **Armor on the avatar (90-armfit, v0.68):** the printed armor art (armor2.webp cut-outs, drawn for avatar.png) is worn on the
  player-board avatar: `ARM_CROP[img]` (alpha bounds; Femoralia/Greaves cells are pairs → one half), `ARM_FIT[key]` = {at,dx,dy,w,r}
  anchored to the avatar's equip points `EQ`/`EQ_L` (arm/leg pieces by their printed `pt` via `ARM_PT_AT`: upper→sho/thigh, lower→fore/shin, hand→hand) (head, sho, fore, hand, chest, belt, thigh, shin); left side mirrored; clipped
  `<image>` (not nested svg — panel CSS sizes every svg). `armShares`: the location AP pool (rulebook p.22) → every piece on it dims
  (`ARM_DIM`) and cracks together, all fall off at 0 (`ARM_FALL`, CSS `.armfall`); the steel sheen is stripped. Editors (DEV_KEY): Armor forge
  "🎯 Fit the printed set" (sliders, saved in localStorage flavius_armfit, ⇪ Export → paste into ARM_FIT). Custom pieces: equip
  point select (`CA_EQ`, `[data-caeq]`) snaps `ca.fit` to the point.
  Placement follows the rulebook's armored figure (p.22). Sprite fixes (p.23 vs the v0.57 sheet, whose cells 19-21 shifted):
  `ARM.legwrapsU.img=19` (orange-brown upper padding); Flavius' Bracers' gold engraved art is NOT on armor2.webp — the dark
  plates (cell 15, shared with the Provocator Manica, upper arm) graded gold (v0.69: Virgilante drew them as one art, graded per level).
  Sides: `ARM_LEFTART` = art drawn for the LEFT limb (thighplate, legwrapsU) → flipped on the right; `ARM_PAIR` cells (Femoralia 22,
  Greaves 24) give each leg its own half (image-left half = body's right leg), never mirrored. Everything else is drawn for the right side.
- **v0.69 (91-v69):** armor designer — #caPiece then the mock-up `#caAv` (`caMockSVG`/`caMockHTML`, no view tabs; hidden
  `#caRedraw` = data-gs caview piece for redraws); required equip point `ca.eq` (`CA_EQ_ALL`: head/chest/belt/sho/fore/hand/
  thigh/shin → slot + pt; `[data-caeq2]`; save blocked without it); free drag/wheel/Size/Turn/Mirror stored RELATIVE to the point
  `ca.f2={dx,dy,s,r,flip}` (`caF2`, `caSync` keeps `ca.fit` absolute for 07-ui); `caFit`/`caOnBodySVG` wrapped (left side = EQ_L
  point, mirrored); single limb pieces show one side, Pair both. Sculpted set only when `SETTINGS.armorStyle` is 'drawn' (`armSculptOn`).
  🎯 Fit the printed set is ungated (afitHTML/afitSave replaced): drag/wheel/sliders/Mirror (`flip` in ARM_FIT_OVR → armBox), saved
  to Store `armorFit`/'sys' (in SAVE_COLS) and loaded at start. PLAN (Virgilante): bake his saved fits into ARM_FIT, then REMOVE the
  tool. Bracers = cell 15 + `BRACER_GOLD` CSS filter (avatar image + `cardStyle('a:bracers')`).
  Phones/tablets: `phoneLand` wrapped (false while #mainMenu is up); body.chromeoff (250 ms sweep: menu up or CUR_MODAL) hides
  #plDock/#plRot/#mobTabs/#crowdTick; draw()'s fit uses `fitReserve()` (header top + dock ≤150 + ticker + hover line, measured) instead of 230.
- **v0.70 (92-v70 + 90 edits):** Virgilante's fits baked into ARM_FIT (90; ARMFIT_BAKED = their save time — older Store/localStorage
  overrides ignored). `ARM_PAIR` emptied: legs wear one art, mirrored left. armBox: `f.L` = left-side own {dx,dy,w,r}; `side` flag;
  turn = r × mirror × side (mirrors on the left). Fit tool behind ARMORFIT (`afitOn`, localStorage flavius_armfit_on, 🔒 `[data-afhide]`),
  ids `#afPrev2`/`[data-afit2]`/`[data-afside]`, single pieces on the chosen side, pairs both, drag follows the pointer, no HP/AP chips;
  studio avatars use `AV_VB` [0,-18,150,336] (91 mock-up + fit tool). Data: provmanica pt 'lower'; legwrapsU n 'Leather Upper Leg Armor'.
  Custom armor levels I/II/III WIP parked in src/wip-armlevels.js (not built).
- **v0.71 (93-v71 + small edits):** Virgilante's medallions (tools/art/medallions/, his uploads) baked into assets/rtok.webp cells
  (chest, key, key2 [new cell, RTOK_NAMES +'key2'], mw1-3, ma1-3, ap2/3, elix2/4, merc1/2, cf1/2, spiders, curse, eagle, water,
  boar, blessing) — every rtok consumer uses them. `ICO.coin` = his coin (assets/coin.webp; 🪙 emoji in 17/64 → ICO.coin).
  Summa rudis medallions assets/sr_<democritus|egidious|cassian>.webp: `drawFlavius` wrapper (beside the box), briefing `.brsr`,
  status chip, festival picker `#festSRimg`, Manager Grand Games line. Mandata back assets/mandata_back.webp on hidden mf items
  (boardHTML wrapper); "Mandati Flavi" → "Mandata Flavi" everywhere. Round marker assets/round.webp ("ROUND :" baked; number in
  `.roundmk b` at 76.2%) prefixed to the status round chip (`statusDecor` after render). #crowdTick retired: `#slogPin` = first
  li of #log (re-prepended by a log wrapper; click → Stands; tests reading the newest log line skip it: `#log > li:not(#slogPin)`). Wager bubbles: 300 ms `wagerWatch` (new sp.bet / p.selfBet / S.bets)
  → `.wbub` in their own layer #wbubs (renderBubbles clears #bubbles). Tunnels: sharper tunnel_open/door.jpg. `verAsk` replaced:
  a centred popup (`.veraskbg`) instead of a box inserted beside the button.
- **v0.72 (94-v72):** new avatar.png (same body, equip points unchanged); round-2 fits baked (ARMFIT_BAKED 2026-10-02T16:04).
  Shared set cards in every designer (`setGridify` MutationObserver tags lists after "Your …"/"System …" h4s → `.setgrid`/`.sys`,
  headings "🔒 System X · N"); armor: `armSetsHTML` (system armor always listed, `armArtCell` follows `SETTINGS.armorStyle`);
  weapons: `wpnSetsHTML` + `sysWeapons` + `cwFromSystem` (`[data-gs="cwsys"]`). Fit tool merged into the armor designer: with ARMORFIT on,
  printed cards get 🎯 Fit (`[data-afit3]`) → `AFIT.mode` (banner + `_afitHTML` panel, ✓ Done `[data-afdone]`); `afitHTML` returns ''.
  Custom pairs: `ST.caSide` R/L (`[data-caside]`), left fit in `ca.f2.L`. **3D minis:** `SETTINGS.mini3d` on top of tokenStyle 'standee'
  (tokenStyle is a const arrow); `miniApply` swaps STANDEE_SRC to assets/mini_<key>.webp (flat files — mkshare only lists assets/ top
  level); `MINI_A` = anchor (base centre px) + base footprint mm; `miniScale` (round base 0.8 TW, long beast bases ≤1.1 TW, pillar ×0.62);
  wrappers on drawStandee/standeeSize/drawZoraMini/drawNPC (Zora via the figure path)/drawPillar (pots on top)/settingsHTML/applySettings.
  Renders: TTS bundles → UnityPy obj + textures → three.js ortho at 30° (2:1 board), gladiators rot 70, long-base beasts rot 150;
  Barb = Ursa, Leaena from her own bundle ("Leana"). One facing (the game has no facing yet).
- **v0.73 (95-102):** `95-v73` — Manager rail ovals (`.mcount.c73`, 500 ms sweep: ludus tasks `ludusTodo73`, recruit/yard hours,
  infirmary `infirmNeed73`; old `.hrchip` hidden), banners on every tab (`BANNERS73`, `roomScene73` 600x120 centred + full-width sky,
  `banner73` inserted after `<div class="railmain">`; right-side count `bannerStat73`/`tabStat73` only where needed, also on the
  yard/infirmary rooms), header Recruiting/Training hours badges removed, scouting block on the free-agent card (`ratingsHTML` +
  `persTags73`), short-handed checklist item clears with a board recruit (88 edit), Summa Rudis medallion behind `#srInfo` ⓘ
  (`SR_OPEN`, 93 edit), `RAT_SHUT` defaults folded, old auto-recruits offer (`oldRecruits73`, `[data-oldrec]`, localStorage
  flavius_oldrec73). `96-armlv` = the levels WIP shipped. `97-armor73` — Start from (`select[data-caf="start"]`, printed pieces by
  equip point, "Base shape" holds the templates); `caFromSystem` also sets `ca.art`, eq + f2 from ARM_FIT (`CA_S_K` 1.15);
  `caArtOn(ca)` → printed art in preview (`armArtCell`), on the body (`armPieceSVG` at the copy's placement), armSVG and scan cards;
  sculpt layers/base shape turn it off (`ca.noArt`). `98-avatar73` — avatar chips stripped, zones `[data-avtip]/[data-avloc]` +
  `#avPop` hover card, `AVHIT` flash, try-on ghost `#tryOn` on `#modal [data-card^="a:"]`, `avatarFor73`/`avatarCls73` on Ludus
  records and the class designer; custom class cards use `classSnap73` (61-studio53 figure; printed cards keep their art — Virgilante has better printed cards to send); `#board .loc .pieces .cimg` hidden. `99-phone73` — portrait match `body.phoneP2` (`#ppTabs`
  act/side/log + ⋯ nav, `--ppTop`, fitReserve wrapper 45%); ≤600px windows full screen, Manager/Studio rail = bottom pill row
  (hides on scroll down, `.navhide`), one-line badge header. `100-sica73` — `sicaEnsure` (m.sica 'm_sica', 4 enforcers),
  `SICA` odds; spear via `cfg.syndSpear` in his bouts (`b.sicaSpear`), AI bribes (`g.thrown` + rumour letter), your bribe
  (`w.sicaBribe`, `[data-sicabribe]`, pays in applyBout if not won and CPU-controlled, caught → fame/morale), poaching
  (`sicaPoach` morale<35); Superbus top4 filters `!m.sica` (17 edit). `101-rec73` — `recPlanHTML`, `MGR.cmp` + `[data-reccmp]`,
  `signCard73` after signGlad. `102-minis73` — `assets/minis8_<key>.webp` (8 yaw cells `MINI_YAW`, `MINI8` cell meta),
  `miniFace` from the last step (`p._fr/_fc/_face`), `MINI_CUR` set by drawPlayer/drawNPC wrappers.
- **v0.74 (103-105 + 95 fixes + 06/07 edits):** `103-v74` — armor2.webp has 5 rows: cells 27/28 Belt I/II (`balteus1`, `balteus`),
  29 Centurian Helm (`centurion` L2 head 3), 30 Steel Helm (`steelhelm` L1 head 2), 31/32 Leather Greaves (`lgreaves`, pair), 33/34
  Flavius' Bracers single/pair (no gold grade), 35 the Manica's shoulder guard (`provmanica`, upper arm, fit = spaulder's), 36-42 pair
  thumbnails; `ARM[k].thumb` = card/thumbnail cell (cardRef wrapper), `ARM[k].img` = avatar cut. `ARM_NAMES74` = his names. Classes:
  Soldier centurion+balteus(II), Venatore steelhelm+balteus1, Hero/Slave legwraps (lower), Hero L thracian, Trident, ability text
  "while class abilities are on". His drawn set ('scan') is the default; the Sculpted row is removed from Settings; everyone switched
  once (localStorage flavius_armscan74). Veteranus Old debts: `player.taxPref` coin|cf, market button "⚖ Pay old debts in …" (07-ui),
  CPU pays CF when it has more (06-ai). `104-cards74` — assets/cls_<key>.webp printed cards (cardHTML/cardStyle 'k:'); custom
  classes: `classCard74(k,ch)` 554x800 live card (`svgToG74` places svgs as <g>; nested svgs get stretched by page CSS).
  `105-mgr74` — `thPlan(w).x74` {morale,study,gear,rub} counted by a thUsed wrapper; yard one-hour jobs (`[data-yj]`), `g.gear74` → boostFor
  +1 AP; Infirmary `injuryAvatar74` (injLoc74 from the wound label; `.injmark`) + baths (`[data-bath]`); recruiting `[data-rec74]`
  watch/ask/note:<tone> (`TONES74`, `recAdvice74` ★ + `.adv74`), promise → offerVerdict needs 10% more; nextStep wears ★ + ⋯.
  95 fixes: Your ludus ✓ follows weekly checklist; `tabDone73` per-tab ✓; `CK_KEY` dismiss (`w.ckSkip`); Wagers week strip
  (`weekStrip73`); Summa Rudis seal `#srInfo.srseal` at Flavius's box corner → hover/tap `#srPop` (event card + medallion; never drawn on the canvas); banner count = `.roomstat.rs2 .ptbox` coloured per tab; perk points = `.ptpill`; #tip watchdog.
- **v0.75 (106-v75 + small edits):** ratings fold toggles on pointerdown (board redraws swallowed clicks). His weapon-card icons
  (`WICO75` data URIs, tools/art/icons/strip9 → wico_sheet.png) replace `CW_ICO` art (custom weapon cards + forge tiles; `cwIcoSVG`
  replaced). `ARM.ornate` (Ornate Chest Armor, cell 44, L2 4 AP) = Royalty chest; Flavius' Greaves avatar = single art cell 43, thumb
  cell 24. Minis: the Standees row is gone from Settings → Tokens, standee style always wears the minis (applySettings keeps
  `SETTINGS.mini3d`), pillar ×0.85 (`MINI_PILLAR75`) re-rendered with his pillar standee's stone (tools/art/minis/render3.html +
  shot3.js + pillar_tex.png; local server http://localhost:8123 from /tmp/claude-0/x). Top bar: FR mark (assets/fr_icon.png, also the
  tab favicon), `statusRow75` (no #calChip, `.evchip75` = `evTok75` token + name, round chip without the zone size), rule chips moved to
  the turn panel (`renderTurnInd` wrapper → `.tp75` `.tprules`), #btnEvInfo moved into #navDrawer; hover/click the event chip → `#evPop75`
  (card in his frame assets/event_frame.webp, place/date/this week/board, Event details + Season schedule buttons). Crowd: `houseCount`
  = n×1000, `houseHTML` "13K"; every head count reads "NK spectators" (edits in 05/07/10/16/17/18/22/25/30/47/66/89). Market to the
  rulebook (`marketBuy75`): pay a level, one die, take the slot's weapon or one armor piece; armor = `S.market.a[lv].piles` (4 face-up
  piles, no deck; `slots` = live Proxy view so chooseMarket/marketPullArmor/choose2 still work; `mktFix75` after matchLoad); weapon
  slot 4 flip stays face up (`W.up4` = deck top); `marketRoll` (free items) = marketBuy75 with `only`; CPU buys via marketBuy75 (06-ai edit);
  window = his board (`boardHTML75`, assets/market_board.webp, `MB75` slot boxes; weapon cards stand upright). Play Now: `pnLayout75`
  re-seats the Single-event setup controls into the mockup layout (top row · Where | What strip + framed card + players badge
  assets/badge_players.webp + Annals record · Who seat cards with minis + SIM50 win rates · Options · sticky start bar); Quick start
  (`[data-pnquick]`: this week's fixture, you random class); presets localStorage flavius_pnpresets.
- **v0.75 follow-up (107-v751):** his weapon card backs (tools/art/cardbacks → assets/weapon_back1-4.webp) on market slot 4
  (`boardHTML75` wrapper, `.mb-back75`); human `openChest` shows `🗝 The Arena Chest` flipping the Level 4 back to the weapon. Match Week
  banner = host city (`CITY75` colours + landmark per arena, `cityScene75`; `banner73('night')` wrapper; byes keep the old banner).
  `weaponChips` (54-v51) replaced with his icons. Settings: the skipMenu row removed and the setting forced off once.
- **v0.76 (108-v76, parts A–G, each with its own header):** A save hub — `continue76`/`last76Note` (localStorage flavius_last76) → main
  menu ▶ Continue; `savesHub76(tab)` matches/careers/campaigns/backups (`data-hub76`), matchSavesWindow redirected. B Play Now roster chip
  `.rs76` + seat cards `.st76` (class picker `pick76HTML`, `[data-who76]`, `[data-mind76]`, `[data-team76]`, `details.more76`; originals hidden `.h76`).
  C Road lock `roadLocked76` (t.gone set by travelClick / the first played bout; `LOCK76` click guard, `.lock76` note), before-you-leave
  `leaveList76` in `ask76` (centred popup — never modal() over the Manager, it replaces the window); sit a week out `sbyeOK76`/`takeSbye76`
  (w.night.selfBye, w.sbye76; 87 gate-share edit; thMax/weekMoney wrappers); beds `bedsOf76` = 1 + Valetudinarium, `serious76` (inj.ser76),
  w.beds76, half-pace mending in an endWeek wrapper, physician cures need a bed. D Manager ideas: `ROAD76` road events (t.road76),
  house medicus w.medicus76 (`MED_SK76`, saves limbs in applyBout, poachable), `TEMPLE76` offerings (w.night.god76 → boostFor), FAC.kitchen /
  FAC.shrine, contract clauses g.contract.cl76 {nonaum,winb} on wageBreakHTML, Darling of the Arena `darlingVote76` (w.darling76, after
  week 6), `rivalLetter76` (letters with `[data-rl76]`; w.chal76 = challenge this week, purse twice). E Beast pen: hidden custom event
  EVENTS.pen76 (non-enumerable), `PEN76` (box [3,8], 8 rotations, fees, +2 flat bonus, −3 fame), dijkstra/freeGrid/checkEndCustom/
  gameOver wrappers while S.pen76, cage + watchers drawn as pieces injected into S.pillars during draw() only (drawPillar: f76/w76),
  `#pen76Off` Call it off, `penApply76` (wounds via `penWound76`, never death). F Training Yard = `yardHTML76` (fighter cards `.yd76c`:
  Drills data-tp · Care ptrain/data-yj/bond · Bout spar/exhibition/pen, one a week `boutDone76`, panels MGR.yb76). G Infirmary =
  `wardHTML76` (cots `.wd76cot`, bench, bathhouse). menuShow skips a just-started Manager bout (S.pen76/exhibCtx/mgrCtx; fixes bouts opening behind the menu); the
  turn panel's ⃠ rule chips (.tprules) moved into its ⓘ tooltip ("This round: no PvP"); beds don't apply in the lesson league.
- **v0.76 follow-up (109-v761):** safe updates — hosted copies poll `version.json` beside the page (5 min + on tab focus; release.sh
  writes it) and show `#upd76` "v0.XX is out — finish your match, then reload" (never auto-reloads; asks during a live match).
  Newer-version guard: localStorage `flavius_newestver` = newest version that ran here; an older page (or one holding a world with
  a newer `w.ver`) blocks Store.put / saveWorld / matchSlotPut and says reload. Deploy order: assets → index.html → version.json,
  old assets may be deleted while nobody plays online yet (his call 2026-10-06; v0.91 dropped mandati.jpg + weapon_back1-4.webp) — keep them again once there are players, index.html Cache-Control no-cache, invalidate only the changed files. Test `tupd76`.
  Studio: armor level = one radio (`name="calv76"`); system armor/weapons are examples only (`sysExample76` strips Edit/Copy, casys/cwsys
  clicks blocked, armor "Start from" removed); printed class rows show his card (`cardHTML('k:'+k)`) + `CLS_CARD_TXT76` wording.
  Level 4 custom weapons: weapon designer Level select (`data-cwf="chest"` → `cw.chest`); `cwBuild` wrapper → lv 4, `cwChest` instead of
  market/loadout; `gearRebuild` wrapper resets `CHEST_W` from `CHEST_W0_76` and adds chest weapons that pass `rosterGate` (so a
  Manager career's roster set decides, like every custom item). Main menu Multiplayer: LAN removed (Hot seat + Online disabled).
  Main menu: no ▶ Continue (`continue76` returns null; Manager mode's own menu has Continue); 📜 Saves sits in the Settings row.
- **Studio tidy (110-v77):** Roster sets = deck builder: `rosterStudioHTML` replaced — set cards `.rs77set` (`[data-rs77open]`, `[data-rs77new]`,
  badges ▶ Play Now / 💼 open career), bench `.rs77open`: tiles per kind `[data-rs77t="kind|id"]` (`rs77Ico` thumbnails), All/None
  `[data-rs77all]/[data-rs77none]`, search `#rs77q`, printed pieces in a folded 🔒 list, empty kinds in one "Not made yet" row of designer
  buttons; system sets open read-only (Copy & edit); save/lock/copy/delete/useplay keep the old `data-rs` handlers; `rs77Sel(R)` = a set's
  picks (Rolls computed like its Copy). Rail: rosters moved into ST_GROUPS Overview; `st77Counts` → `.st77c` count per tab. A tidy pass
  `st77Tidy` (MutationObserver, 30 ms debounce — a microtask observer starved timers — plus a studioRedraw wrapper) does: one-line
  intros (`p.intro77` + ⓘ with the rest), All creations first-make tiles `.st77f` + "Play Now set" column, Names 📌 Pin / ✎ Use
  (localStorage flavius_namepins77, `[data-nm77pin]`, `[data-nm77use]`), Spectators Personality/Look heads + face-card list, Editors
  progress bar `.ed77bar`, Invitational steps ①–⑤ (`.sx77h`), tournament seats wider + `.tn77you` 🎮 You pills. Test `tv77`.
- **Online (111-114 + server/, after v0.76; behind the word LOBBY77 → localStorage flavius_online77):**
  `111-onlcore` = THE shared rules (also `require`d by the Lambda — copy with `node tools/mkserver.js`, which also writes
  server/src/catalog.json): ranks Tiro→Gregarius→Veteranus→Primus Palus→Summa Rudis (`rankFor`: ranked bouts survived AND
  lifetime CF), START_STATS 55 each (no choosing; +1 lowest rating per bout survived, +1 more for a win), recruit kit = class
  weapons only, PRICE 15/60/180 by market level ≤ rank's `mkt`, PURSE by rank × survival streak (+10%/bout, ≤+100%), Ranked death
  = the game's own Fate (result row `survives`), Hall only if great (`hallWorthy`: Veteranus+, 25 survived, 500 CF, Commodus),
  wagers `betOK`/`settle` (pool split by stake, 5% to host, fighters back only themselves, close at start), lobbies `newLobby`/`canJoin`
  (Ranked = equal rank). `112-online` = `NET` (req/on/emit), the in-page MOCK server (`MOCK_ROUTES`, localStorage flavius_onlmock,
  BroadcastChannel; account id in sessionStorage so two windows = two players; mirrors server/src/routes.js), the window
  `onlineOpen` (rail Play · Lobby Browser · Spectate · Armory & Market · Character · Hall), creator, `onlEnter` (seats from lobby kits:
  humans cpu:false, bots/empty = CPUs), kit via mkPlayer/giveLoadout wrappers, `onlReport` (match.result after gameOver), no sim online.
  `113-onlmatch` = LOCKSTEP: host runs startEvent; first beginTurn sends `matchSnapshot` (~15 KB) via match.open; others `onlJoinMatch`
  (load it, beginTurn). Inputs recorded by their owner (`onlmOwner`: humanCommand override → RESPONDER → cur() → lowest human seat):
  `tile` (onTile wrapper, S.mode + focus), `act` (trusted [data-act] clicks; replayed by clicking a hidden twin button), `modal`
  (decision values; remote-owned modals wait for the value). Not recorded: popRule/eventBriefing (ONLM.info), windows opened by a
  trusted click outside board/actions within 300 ms (ONLM.uiAt), anything after S.over. CPU truce/trade offers to humans are declined
  everywhere (v1: the engine doesn't say which human). Hash `onlHash` before each input; mismatch → match.snapreq/snap resync from the
  owner. Off-turn: real clicks/hotkeys blocked, `#onlWait` banner, body.onl-off. Own inputs' seqs come from the reply (`ONLM.own`).
  `114-onlnet` = `NETWS` WebSocket (config play/online.json or the sign-in screen's "Online server" box → localStorage flavius_onlserver;
  `{ws,auth,client}` or `{ws,dev:true}`), Google via Cognito hosted UI + PKCE (tokens localStorage flavius_onltok, refresh), reconnect +
  catch-up, socket closes when Online shuts and no match is live. **server/**: template.yaml (lint: /tmp venv cfn-lint), deploy.sh
  (CloudShell), README.md (Google client steps, costs), src/{index,routes,store,jwt}.js (single-table DynamoDB; a move = one `bump`
  update returning seq + conns + one put + pushes to the others), test/routes.test.js (`npm test`), test/localws.js (the Lambda on a
  local ws server). Tests: `tonl77` (two windows, mock), `tonlws77` (two windows through the real handler; needs server/node_modules).
  ANTI-CHEAT: server keeps seeds/order/wallets/gear/ranks/wagers/deaths; a move must carry the sender's own seat (else the seq
  becomes a server `void` input, skipped by clients); results by agreement (`ONLC.agree`: every human reports the whole table +
  end hash, strict majority wins, a lone human vs CPUs is accepted unverified, 2 disagreeing → void: no pay/deaths/wager refund,
  strikes for the minority); 3 strikes → only matched with struck accounts (lobby.flag); a ranked player whose socket is gone
  3 min (`AWAY_MS`, $disconnect marks META.away) can be dropped by the others (`match.drop` → a server `drop` input: seat → CPU at
  that point on every client, pending window gets its close value, else endTurn) and still faces the Fate; settlement pushes
  `match.settled`. Board/act readiness uses `onlmActor()` (never a CPU's turn — the lowest-human fallback is for windows only).
  DEPLOYED (2026-10-03, us-east-1, stack flavius-arena): ws wss://8mok5w9i11.execute-api.us-east-1.amazonaws.com/live, sign-in
  https://flaviusrule-arena.auth.us-east-1.amazoncognito.com, client 5qhkffer4i9jla5qkojt917ms, pool us-east-1_VdMsuDJ59 (not secrets;
  play/online.json holds the first three). Checked from here: bad token → 401, old protocol → 426. The Cognito domain is blocked by
  this sandbox's proxy, so Google sign-in can only be tried in his browser. Updates: CloudShell `sh deploy.sh <email>` with GOOGLE_ID/SECRET.
  **Google sign-in WORKS (2026-10-03, v0.78 + server-6).** The long invalid_client hunt was a Cognito client_id polluted by a pasted command
  (`read-s-p"…deploy.sh<email>158703920017-…`); deploy.sh now accepts only `^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$` and a
  `GOCSPX-` secret. Diagnose with `describe-identity-provider … ProviderDetails.client_id` or the Location header of Cognito's
  /oauth2/authorize. Google client "FlaviusRuleOnline" (Web app, project FlaviusRule, number 158703920017); its secret was rotated after
  appearing in chat. Site: bucket flaviusrule.com, CloudFront E3P6OKSHPTXJGF (a function 301s /play/index.html → /play/, so check headers on
  /play/); privacy page flaviusrule.com/privacy.html (self-styled, in the consent screen); full site zip in website/flavius-site-v0.78.zip.
  He prefers click-through console steps for site uploads (S3 Upload with System-defined Cache-Control no-cache metadata + CloudFront
  invalidation); server zips still run in CloudShell. Give CloudShell commands one per line (his pastes once lost all spaces).
  Budget kill switch (template): ACTUAL ≥ budget → SNS → `flavius-arena-switch` sets the arena Lambda's concurrency to 0; an
  EventBridge rule reopens it on the 1st (or the `ReopenCommand` output). Hidden info (only the Mandata) is not protected — decided:
  not game-breaking.
  **v0.78 (protocol VER 2):** 👁 Watch (`onlWatch` in 113, server `match.watch`/`match.unwatch`, M.watch {acct:conn} ≤30, pushes via
  toMatch): the watcher asks a fighter for a snapshot (`match.snapreq`; answered only at `onlmSettled()` — a human's own decision,
  nothing resolving, no move in flight: a loaded client cannot resume a CPU turn), else replays from the opening; ONLM.me=-1, never moves.
  🎟 Tickets (`ONLC.ticketOK`): before the horns, ≤8 (`STANDS_MAX`), L.stands [{id,name,paid}], coin → L.pot. Ticket holders sit in
  S.spect as human spectators (`onlSeatStands`, `onlIdx` = fighters+k; owners/M.seats continue after the fighters; M.specs) and take
  the engine's own `humanSpectatorTurn` one by one (wrapper sets ONLM.override); their windows auto-pass after 45 s (`onlmAutoPass`);
  other screens name them (log wrapper, `ONLM.specName`). `ONLC.settle(bets,wins,{pot,tix,seatAcct,void})`: pot joins the winning
  bets, else goes to the winning fighters; void / called off → bets and tickets refunded. 👥 Parties (`party.create/join/leave/get`,
  PARTY#/PCODE# items, 5-letter `partyCode`, ≤4): only the leader creates/joins (`groupOf` / `mockGroup`), `ONLC.seatGroup` seats the
  group together; team events `EVENTS_TEAM` = familia (4 seats, `L.team`, players' `team` A/B, `seatTeams` fills CPUs). Test `tonl78`
  (party in Familia + ticket holder + late watcher, four windows).
  **v0.79 (protocol VER 3; 115-v79 menu, 116-onl79 online client):** menu — version badge → `verNotes79` (What's new card), C on the
  main menu → cheatPrompt (not while typing / a window / a live online match), Multiplayer row = 2 columns. Online — up to 3 living
  gladiators (`ONLC.GLAD_MAX`), account `active` (server `liveChar` = active), `char.active` / `char.edit` (`ONLC.editChar`: name, class
  among the 8, look via `cleanLook` ≤3 KB, `equip` subset of gear; refused while in a waiting/live game, `busyIn`); 🛡 My Gladiators
  (`onlCharHTML` replaced: slots, Studio portrait selects `data-onlgp`, own token `data-onlgt` over TOKEN_DEF, gear ticks). Looks in
  play: kit.look → seat.onl.look → p._onlLook/_onlTok; `tokenForP` merge (ONL_TOKKEYS) + drawPlayer lends CLASSES[cls].custom while
  drawing (wantFigure/hasCustomToken are const arrows), `pArt` portrait. Pre-match room (`onlMyLobbyHTML` replaced): seats with figures,
  host rules `lobby.set` (Custom abandon 'cpu'|'fate'; `standsOff`), chat `lobby.chat` (`cleanChat` filter, 1/s, last 40, closes at the
  horns), start needs `ONLC.canStart` (2+ humans, connected on AWS); everyone seated auto-enters on lobby.update. Abandon: server
  `match.abandon` → a server input {k:'abandon',seat,rule} that only MARKS the seat (`onlmAbandonMark`); the seat is taken off at its
  next decision (`onlmLeftCheck` on render idle; its windows answer the default) — 'fate' = eliminate(retire), 'cpu' = CPU; Ranked kills
  the gladiator on the server at once (`fallen`); abandoned players can only watch (`ONL.leftMatch`, `onlAttach` → watch). Rejoin:
  `onlAttach(L,'seat')` = the watcher path with my seat (snapshot from another human); a late onlEnter (>20 s after start) routes there;
  dropped (CPU took the seat) → watch. Last human gone (abandoned/dropped) → `closeMatch` (void, refunds); `prune` in hello/lobby.list
  closes waiting games whose host is offline 5 min (`offAt` set in $disconnect) or older than 3 h, and live matches empty / all away
  10 min. Online bar: body.onlarena hides New event/sim/saves/Studio/Manager/Annals/main menu; `#btnOnlLeave` 🚪 Abandon / Leave /
  Back to Online (`onlExit`). Stands: ticket holders act only in round 1 and never with standsOff (humanSpectatorTurn wrapper).
  Sign-in return: `#onlLoad` covers the page until #onl is up (handoff 300 ms). Custom sign-in domain: template params
  CustomAuthDomain/HostedZoneId (ACM cert DNS-validated in Route 53 + UserPoolDomain CustomDomainConfig + alias A record);
  deploy.sh looks up the zone for AUTH_DOMAIN (default login.flaviusrule.com; AUTH_DOMAIN=none to skip). After that deploy: Google
  redirect URI https://login.flaviusrule.com/oauth2/idpresponse, then play/online.json auth = https://login.flaviusrule.com.
  Custom domain DIAGNOSED (2026-10-03, CloudTrail): CreateUserPoolDomain got 'The specified SSL certificate doesn't exist…' from
  CloudFront for a certificate CloudFormation had issued seconds before (CloudFront needs minutes to see it); a pool CAN have a custom
  domain beside the prefix one (no swap). Fix: template param CustomAuthStage cert|live (condition CustomAuthLive); deploy.sh
  AUTH_DOMAIN defaults to none and AUTH_STAGE to cert. Plan (after v0.80 is stable): deploy AUTH_DOMAIN=login.flaviusrule.com
  (stage cert) → 15+ min later the same with AUTH_STAGE=live → add the Google redirect https://login.flaviusrule.com/oauth2/idpresponse
  (keep the old one) → play/online.json auth = https://login.flaviusrule.com.
  DONE 2026-10-03: he added the Google redirect https://login.flaviusrule.com/oauth2/idpresponse (old one kept); the two deploys + online.json remain.
  After v0.79 (unreleased, 116 tail): Online opens on the main window even with no gladiator (`onlNoGladHTML` card on Play/Armory,
  empty slots in My Gladiators); actions in `ONL_NEEDS_GLAD` are caught on window-capture and ask first (`onlNeedGlad` → ask76 popup
  "You need a gladiator …", wording per action in `ONL_WHY`) before opening the creator (`ONL.newGlad`); creator stage = portrait +
  small mini, always has Back. 114: signed in but refused → the sign-in card says why (+ ↻ Try again).
  Tests: `tv79`, `tonl79` (room, look on the other screen, rejoin after reload, abandon, shutdown). NOT yet: Stakes matches, referee replay,
  more events, reclaiming a seat a CPU took.
- **v0.80 (protocol VER 4; 117-121 + server):** plan/contract in tools/plans/onl80-contract.md + onl80-praeco.md.
  ROOMS (ONLC `roomJoin/sitGroup/roomSit/roomStand/roomLeave/roomGiveHost/roomKick/roomSet/roomTeam/autoBalance/seatTeams/startRoom/quickPick`,
  `liteRow` for other rooms): ≤8 members sit or stand, host keeps a seat, give host (the unseated new host takes the old seat), kick (5 min,
  `L.kicked`), event/city/seats/ticket/abandon/standsOff/teams until the horns (Classics exactly 4, Familia 4–8, 2+ teams; Ranked/auto-balance),
  unseated at the horns → 'started without you' (`ONL.unseated80`, 10 s). QUICK CHAT only (`ONLC.QC` room/match/after/forum phrase codes,
  `QC_TEXT`; lobby.chat refused): room phrases = CHAT# items (`lobby.say`, ✓ Ready marks the seat), match bubbles (`match.say` → `onlBubble80`,
  farewells 10 min after), the Forum (`forum.say`, FORUM lines ttl 1 day, a daily push meter FMETER#). THE PRAECO: `lobby.quick` (Find me a
  fight; the room is ELECTED through a consistent pointer item QUICK#<ev>#<rank|c>#<flag>|OPEN — the GSI is eventually consistent),
  📣 `lobby.call` (3 a room, 2 min apart, to ≤40 free lanistas who fit: `fitFor`), ✉ `lobby.invite` (rates), ⚔ `lobby.again` (after your own
  report), 🔇 `forum.mute` (server-side, `A.mutes`, also filters match.say), 🔔/🔕 Quiet (localStorage flavius_onlquiet80). Names online =
  the active gladiator's (`nameOf`; never the Google name; `ONLC.nameBad` word filter on gladiator names). PRESENCE: ACCT GSI1PK 'ON' while a
  socket is open (`store.clearConn` conditional; a gone push also marks the match away), `hello.here` = {n,fight,wait,zones} by time zone
  (`ONLC.cleanTz`). ORBIS TERRARUM (117 `ONL_TZ`/`onlTzLL`/`onlTzXY`; assets/orbis.webp, tools/art/orbis/): the oval under the Playlists,
  glows per zone, click → large view; 📯 the Forum beside it. SERVER HARDENING: rooms and gladiators are written versioned (`store.putRev`,
  `editLobby`/`editChar` retries) — refunds, payouts and buys happen once; `store.flip` = one settlement; ConsistentRead gets; hello/lobby.list
  ≤ ~115 KB. BUSY RULE: `stillFighting(A)` — a lanista whose gladiator is in a live match (a CPU may hold the seat) cannot open/join rooms or
  buy tickets until it ends, they abandon, or they reported; `hello.live` = {id,ev,loc,ranked,dropped}; hello carries `now` (server clock).
  ONLINE RULES (119): printed gear only (classic roster), no offline records (`onl80Rec` + Store guard), Ranked no hints/strategy/Focus
  suggestions/odds, no pause; MAJORITY RESYNC (`match.hashq/hasha/odd`, generation `g`, `ONLM.odd`): the odd one is skipped, struck, and told
  (`match.youodd`) — it asks the lowest-seat voter for the arena. SNAPSHOTS ONLY WHEN ASKED (121: `ONLM.asked` per account, 45 s). Stuck
  inputs (another seat's move while the game waits elsewhere) → void after 2.5 s settled if the pre-hash matches, else the vote (121
  `onl80fStuckCheck`). The socket stays 10 min after a match. REJOIN/ABANDON (121): localStorage flavius_onlmatch80 (set on entering as a
  fighter, confirmed/cleared by hello.live) → main menu `#mmLive80` ⚔ Back to your match / 🚪 Abandon; the abandon popup (`onlAbandonAsk80`,
  ask76 + `onlStakeHTML80`) shows face + token, record, ratings, the gear brought and what is lost. TODAY IN THE ARENA: WORLD DAY#<utc day>
  (ONLC `dayFromMatch`/`dayFell`/`dayOut`, ≤14 KB, faces trimmed from the tail) → `hello.today` (yesterday's while today is empty) →
  `#onlToday80` two boxes on the landing (🏆 victors by CF in one match; 🪦 fallen — Ranked deaths best rank first, Damnatio — and upsets).
  v0.80 fixes (120): hot seat stays out of other modes (`HS_GO`), Gate of Life writes the record by id, the Summa Rudis seal is gone,
  `#boot` cover (01-head) until the menu or a window is up. Tests: `tonl80` (rooms, phrases, Forum, Orbis, invites), `tonl80r` (rules +
  majority resync with a tampered client), `tonl80m` (main-menu rejoin/abandon popup, Today), `tonlws80` (three windows on the REAL
  handler via server/test/localws.js), `thsleak80`; server: `cd server && npm test` (3 suites).
- **v0.81 (122-125):** `122-v81play` — drafts (`runDraft` replaced): only this pick's offers, 2 per row, rest folded; offers fit the
  drafter (no 3rd weapon, armor only on a free spot, ends early when nothing fits; CPUs too); drafted gear leaves the market; L1 = one
  Belt I + one Belt II; `MARKET_A0` refilled from the live lists (the 1 s gearRebuild reset no longer drops v0.74/75 pieces); Juggernaut
  declare cards only from `S.deck` ("×N left", taken cards leave it). Pillars (`doTopple` replaced, `landing81`): log names fall line +
  rubble ("no Blessings left"), offering on the 4th tile (one back from a pillar, edge of the sand, under a beast, straight to a gladiator,
  into the spikes). Turn bar: #hover fixed 2 lines; desktop fit cached per window/layout (`FIT81`, max dock seen, ≥170), `body.dockfit81`
  unsticks the dock; 07-ui stands divisor 10.9. `123-v81art` — his sharper pieces as files `assets/arm81_*` (`ARM[k].art81`), pair
  thumbnails Λ→V `armthumb81_*`, his 12 fits baked (ARMFIT_BAKED 2026-10-03T19:57:18Z), Belt I over the chest, `thrachelm` Thracian Helm
  (L2 head 4, Hero), Veteranus musculata, hidden data `chestarm81`/`rarmarm81`, token rounds for dropped gear (`dropTok81`, `ptok81_<cls>`,
  custom classes recoloured at runtime, `ptokring81`), stands wood (`standsTex81`). `124-v81onl` — results: hash at gameOver, report sent at
  once, kept per account in localStorage `flavius_onlreport81.<acct>` and resent (net.back/hello/reload); over-bout abandon = leave (no
  Damnatio); stale matches (`flavius_onlover81.<acct>`) never re-entered, "⏳ Waiting for the others to confirm"; #onlWait only over the
  arena; invites checked via lobby.list (no timer; "That room closed before you got there" + 👁 Watch); ICO.wheat for online CF; ONLSRV
  word (`flavius_onlsrv81`) shows the server box; landing Option 1 (world map = stage backdrop, Forum right column with 📰 headlines,
  Today ribbon, playlists last, phone one column), playlists scroll sideways ≤760 px, border tones per event. `125-v81fix` — #cardShow
  scales on phones/tablets; ratings always show (fold removed); Online rail one swipe row on phones. Also: 106 ratfold touch double toggle
  (RAT_PD), 05-flow armorDesc no "chest chest". Tests `tv81p`, `tv81a`, `tv81o`. tools: per-test kill limit = max(400, 1.6×time+60);
  release.sh share build always (SHARE=0 skips; it is the site download play/flavius-rule-arena.zip — his call, v0.82) + advert shot share/arena_shot.webp → play/arena_shot.webp on play.html (tools/siteshot.js); flavius.sh `release` = server → game (+ play/flavius-rule-arena.zip) → site → privacy,
  `login` (two-step login.flaviusrule.com, remembered in ~/.flavius.conf). Site v0.81 (website/, not in git): Contact off the nav, Media =
  Videos only, Play page Online card + What's new.
- **v0.82 (126-130 + server, protocol VER 5, contract tools/plans/onl82-contract.md):** `126-v82fix` — unique spawn cards leave the deck
  once their beast is on the sand (`UNIQUE_CARD82`, `uniqueOut82`; fixes Tholo drawn twice), hunched sculpted figures ×1.062 (Hero height),
  Tholo's sculpted token from his card (laurel, grey hair/beard, cape), main menu: Play Now + Manager one row (v0.84: stacked, Manager under Play Now — his pick), 🎓 Tutorials button folds
  #mmLearn (`data-mm82="tut"`), slim row Annals/Rules/Settings/Saves/mute (`mmLabels82`); Domus showcase on stone_wall, main card on
  parchment; Glory bar measured to the bottom of the gladiator cards (`rb82Fit`); round-rule chip row hidden (`#turnInd .tprules`, rules
  only in the ⓘ); BLESSING_TABLE.spiders 6→2; Open Arena Chest glimmers gold (`[data-act="chest"]`); the chest's Level 4 card flips
  LANDSCAPE (back turned on its side) with his sharper back `weapon_back4b.webp` (107 `WBACK75` lv 4); `flavK()` (16-crowd) = Flavius's box
  ×0.7 on phones (box, capFit, turnIndFit, SR medallion, spear float); phones sideways: actions drawer SHUT in your Action phase (⚔
  `.glow82`), shuts on picking an action (capture click) or tapping the sand, Choice still opens it (`plActFix82`). `127-v82onl` — DOMUS (house name required before a gladiator, record incl. Purses, 4 slots, Storeroom move/equip locked in a
  match), GLORY rank bar (lifeCF + 12×survived + 8×wins; living counts per rank from the server), table factor (2 humans pay less),
  guests watch read-only, invites `lobby.accept`, prices by AP, PATRON (set at founding, ✎ fold on the Domus `details.pat82d`), free
  tickets, daily guest pass + house Fame, `match.speared` refund. `128-v82stands` — online stands GROUP TURN (`#st82Pop` private popups,
  `stands.result` input), spear refund, sculpted online tokens (`p._onlSc`), random starting class in the creator. `129-v82beasts` —
  beast cards (`nc82*`; printed beasts flip to their arena-deck card `NC82_BACKCARD`, custom ones get a generated 1- or 3-state back
  whose HP counts down; his STATS SIDES for all five printed beasts `assets/npcback82p_<key>.webp` via `NC82_BACKART`,
  sources in tools/art/npcbacks82/), spawn show `beastShow82`, custom beasts in the deck (`spawn_cn_<id>`, unique tick `unique82`, grid dice),
  deck slots Tholo + 3 (`SLOT82_DEF`, roster set row `rosterSlots82`, Event Designer `ed82*`), spear = Flavius scowls + "−N 🪙" float +
  the spearer draws a Mandati Flavi (`mfDeck82`, none if the deck is empty). `130-v82vis` — pillar shadows under the base
  (`pillarShadow82`), iron/bronze spikes (`drawSpikeTile` in 07-ui, `SPIKE82`), pieces face their attack target (minis' `_face`).
  Server: Scan permission in template.yaml → FULL stack redeploy (server zip flavius-server-9). Tests `tv82s`, `tv82o`, `tv82b`, `tv82v`.
- **v0.83 (131-137 + server, protocol VER 6, contract tools/plans/onl83-contract.md):** `131-v83council` — Manager council
  (`COUNCIL83`, `council83Make` from the career id, `w.council83`, face in OPENED letters via `advisor83`/`ADV_FROM83`, `#council83` card
  in Your ludus; SAVE_MIGRATIONS '0.83'). `132-v83arrows` — `S.stuck83` arrows/bolts on board tokens ONLY (`STUCK_AVATAR83=false`), ≤2
  per location + N, `STUCK83_K` per token style, minis turn them with `MINI_YAW` facing; Tholo: a Focus-aimed bolt kills him. `134-v83spikes`
  — Floor Spikes medallion (rtok 'spike', tools/art/spikes83/make.py) in log/tile line/Event Designer; spike tiles = 3D sewer caps with
  7 spikes (`drawSpikeTile` wrapper). `135-v83chest` — `drawChest83` his chest in 3D; carried chest = token in the inventory
  (`CHEST_INV83`, 07-ui figure boxes skipped). `136-v83sand` — 3D `drawPot`, `SAND83` grain/shade, `SCAR83` scars (claw/divot/gash/
  scuff by hash per arena). `133-v83onl` + `137-v83onlui` — 8 ranks, gear levels (L1–3 printed; named L4 wear Veteranus+), treasury 20%,
  offerings (shelf/satchel, bring ≤2), Ranked broken/repair/loot window/used market, house gifts (chest token glows purple + count),
  named weapons (`nw_<uid>`, rarity cards, Legendary uniques), Ludi Infames, countdown + Hold, trophies, profiles + ★ follow + #domus=
  share, Wagers tab, TESTER grants (template param `Testers` → env TESTERS; deploy.sh `TESTERS='a@x.com'`; granted houses = test, Custom
  only). Also: 03-engine `armorConflict` — padding stacks per equip point (upper + lower), hard pieces on top; Leather Tasset thumb
  `armthumb81_legwrapsU`; weapon backs `weapon_back1b-4b` from his full-size scans (tools/art/cardbacks); main-menu show keeps its
  aspect on phones; letter buttons readable. Tests `tv83c`, `tv83a`, `tonl83`, `tonl83u`.
- **v0.84 (138-143 + server, protocol VER 7, contract tools/plans/onl84-contract.md):** `138-v84` — council letters (Recruiter bargain /
  ★ pick, Medicus risks), board life (`LIFE84`: blood fades over 4 rotations, dust puff per fallen, rubble settles; Light board Auto/On/Off),
  one tab per save (BroadcastChannel, losing tab blocked via the 109 save guard), backups (storage.persist, nudge after a season / 10 events /
  14 days, last backup date), file:// Online button → flaviusrule.com/play, translate-safe (`GAME_TERMS` translate="no" observer, buttons keep
  `data-en84` — match on data-en84||textContent), phone fixes. `139-v84onl` — named armor (`na#<uid>`, `AFFIX_A`, `UNIQUES_A` 6 world-unique),
  `.holo84` shimmer, seasons = the Manager calendar (`ONLC.seasonFixtures`, clock from 2026-10-01 UTC; weekly challenge, 1 gift/house/week),
  your-turn notices (title flash + horn + opt-in Notification), RECLAIM (drop/abandon inputs carry `until`; clients halt at that seat's next CPU
  turn for a server `reclaim`/`cpugo`), CPU-won cut (`CPU_SHARE` >50% turns → ×0.25, no gifts/trophies), FLAVIUS'S AUCTION (`auction.list/bid`,
  escrow, +5 min anti-snipe, one lead/win per house per week, min half value, coin sink, 3 lots/week), `ONLC.armFit` (named + printed never on one
  point). `140-v84prog` — 🖌 programmata (`PROG84`, m.prog84; deface, AI campaigns, memorial, map 🖌). `142-v84ui` — Settings tidy (Language row
  `LANGS84`, one text-size slider, colour-blind select `SETTINGS.cvdMode`, Profiles → Themes "Save this look", Saves tab → Saves window, end-turn
  confirm, Restore all defaults; Spikes picker KEPT — the 3D caps use THEME.spike) + Online landing fits without scrolling (≥1300×900).
  `143-v84roster` — depth chart = barracks wall (plaques, empty columns as posts). Menu: Manager under Play Now, 💾 Saves before Settings;
  online wagers wear 💰. Tests `tv84`, `tv84p`, `tv84u`, `tv84r`, `tonl84`.
- **v0.85 (141, 144-147 + server, no protocol bump):** `141-v85faith` — FAITH (`FAITH85`: ~10% Christian by id hash, ✝ chip, no temple
  boost, believers' morale bond, jeering cities, edicts/denunciations → Hide/Bribe/Face/Refuse, hidden EVENTS.bestias85 bout with other condemned,
  Ad Flamma, martyrs, Studio faith field, `faithMark85`). `144-v85rec` — recruiting tidy (plan line, wall of tablets with 📌 + one-line next steps +
  topic tags + ★ advised, one-line list, 🆕 this week only, local card swaps, "the lanista's hours"). `145-v85fix` — his v0.84 notes: free agent
  preview no longer favorites (offerVerdict), Match Week walks in the Road box, banner BOUT TRACKER (`bt85X` rudes/iron/golden gladii), road deals
  enter the fighter (`dealBout85`), ludus banner flag, road wounds don't nag, "Cost: N coin", no Start-next-week on the Acta, rail ovals by room +
  Match Week bouts-left, card steps swap locally, Forum day reset + 30-min grace, playlist row, stage map zoomed on you (`myXY85`, light-blue dot),
  no landing figure, online count bottom right. `146-v85land` — Online landing II (see §8). `147-v85music` — the five-letter music word, AVE ARENA
  (his MIDI → AVE85, AUD_FN.ave85) while Online is open. Readability pass 08–25 merged. Tests `tv85f`, `tv85r`, `tv85x`, `tv85m`, `tv85l`.
- **v0.86 LANGUAGES (00-lang, 00-lang-es, 148-v86lang; tools/i18n/):** every player-facing literal is marked `_T('…')`, `_T`…${x}…``
  or `${_T`run`}` inside HTML templates (tools/i18n/wrap.js, a surgical AST codemod — idempotent; `--list` dry run; never `T` — locals
  named T shadow it). English = identity (`_T` returns what the literal made). Other language: key = English text with `${…}`→{0},{1}…
  (trimmed) → `LANG_DICT` (00-lang-es.js, GENERATED by tools/i18n/mkdict.js from tools/i18n/es/part-NN.json — edit the parts). Language
  is fixed at load (localStorage `flavius_lang`); switching reloads (asks during a live match). NEW CODE: write the English as usual, then
  `node tools/i18n/wrap.js --write` + `node tools/i18n/frag.js --write` (short words chosen at runtime inside translated text, e.g. is/are)
  + `node tools/i18n/newkeys.js` (untranslated keys incl. 01-head static text → next part) → translate (GUIDE-es.md) → `check.js` → mkdict.
  Skipped files: 111-onlcore (shared with the server; its texts = tools/i18n/srvkeys.js → part-25, matched on arrival by `TXP`),
  14-names, 13-sim, 148. Names + GAME_TERMS stay English (tools/i18n/names.json). Static 01-head text: `langStatic86` + `TX`.
  Test `tv86` (first-run ask, Spanish walk with leftover-English/overflow ceilings LEFT_MAX/CUT_MAX, switch back, English untouched).
- **v0.87 (149-153 + server, no protocol bump):** `149-v87fix` — his v0.86 notes 1–20 (header lists them: Orbis 🔍 only, softer
  Ave Arena bass, plain online market panel, Storeroom shelf #sh87 + no buying in the Domus, try-on real art/V bracers/either-side marks,
  hidden-mechanic tooltips gone, perk task, half-width mail, yard hours grey, Hygeia banner card, city kits follow the fighter + refunds
  (g.kitPaid87), stale mail dropped (L.g87), 📜 Acta of the day (DAY# `acta` list, ONLC.dayFromMatch), 🧠 hues, no menu mute, fallen
  fighters only watch (ONLC.standsHolders / FELL_WATCH, server too), results open on players + 💰 Wagers tab, event pop-up without schedule,
  Hints box #hint87, try-on gold marks after a 120 ms rest, never the hit flash). `150-v87mgr` — lanista's hours gone (w.hours accessor,
  HRS87, SAVE_MIGRATIONS '0.87'), perk tree PERK87 (m.perks87), standing orders g.ord87/ROUT87 + squad table yard87HTML, Fit fit87Score
  (✓ for the best 3 affordable), win rewards WIN87 (upset ≤×2 × streak +25%/win ≤×2, growth/morale/bond, fame, fans → crowd CF, patron
  letter after a 3-win streak). `151-v87ward` — beds for any wounded (bedOK87), bed picker, plans repeat (inj.plan87), Beds full → build,
  ONE CHANCE AT HOME (g.maim87: a 3rd lost limb waits a week for Hygeia). `152-v87npc` — deck-drawn beast's card in the Field top row while
  it lives (n.card87), starting beasts = token + stats popup (npcStats87), rows carry their own data-nc82 (11-extra). `153-v87card` —
  classBack87: the class card RULES side on his template (assets/clsback87.webp), beside the printed card on hover.
  LANGUAGES: es, it, pt (Brasil), fr, de — tools/i18n/<l>/part-NN.json → `node tools/i18n/mkdict.js` → assets/lang_<l>.js
  (window.LANG_PACK {l,d,s}); 01-head `<script data-lang87>` document.writes only the picked one (standalone: from ASSET_DATA, mkshare puts
  the data block before it); no pack → English. LANG_UI87 (148) = the switch/ask words per language; first-run ask in any of them.
  Plural form {n|one|many} (one = '' / 1 / y / is / was / has); tools/i18n/plurals.js lists runtime-plural keys; `// i18n:skip` on a line
  stops wrap.js (text used as a key — the music theme keys crashed fr/de). Tests: tv87x tv87m tv87w tv87n tv87c tv87l (WALK_LANG walk of
  tv86 in it/pt/fr/de). Music: 1 s lookahead on a 100 ms timer (Safari).
- **v0.88 (155-163 + 156-158 agents, no server change):** `155-v88market` — ONE MARKET WINDOW: marketBuy75/chooseMarket/runDraft windows
  re-skinned on boardHTML75 via a `modal` wrapper (title match): d4 roll show `mk88Roll` (cosmetic, after the seeded roll; tap skips), lit pieces
  carry their hidden buttons' data-mi, info panel `mk88Info` (art + stats + fits you/replaces X), draft spread `mk88SpreadHTML`, CPU peek `mk88Peek`
  by SPEED. `156-v88domus` — Domus showcase (avatar + 2 weapon slots, purse/treasury, 4 slot cards, creator popup, Storeroom/Offerings/Trophies
  tabs), `onlImmortalis88` (Invictus + 25 Ranked), `.imm88` laurel frame; tester houses count their own gladiators on the rank bar. `157-v88mgr` —
  Immortalis (`mgrImmortalis88`: 82 rating + 15 wins + a title, g.imm88), WIN_CAP88 ×3, Recruiting II (g.court88 counter-bid in week 3, `wants88`,
  rating ranges). `158-v88hs` — hot-seat batch (tools/plans/hotseat-next.md items; pill #hsPill88, Mandata backs + peek, table saves, no owner
  records). `159-v88set` — Settings grouped (Gameplay · Hints & help · On the board), SETTINGS.anim88 Full/Quick/Off, SETTINGS.cam88, audio
  sliders + locked themes folded. `161-v88pl` — Familia playlist box cycles ONL_EVENTS_OK88. `162-v88gear` — MANAGE (rulebook word) between turns:
  off-turn + not under attack (ATK88) → swap primary/secondary, take loot (never uses the turn's Loot); CPUs fill free hands/spots at beginTurn;
  online off (v0.89). `163-v88fix` — Crowd Favor window with art + Spear moved in (openCrowd replaced), spikes ×0.82, bar/hover heights held
  (no arena jumps), avatar node kept, trade offers show both sides (TRADE88 set in 06-ai/07-ui), closed market dimmed, sand skipped while CAM eases,
  result cards: Fate card left + sums right. `160-v88phone` — phone pass. Weapon labels "Right hand - Primary / Left hand - Secondary".
  His art: weapon_back1-4b + npcback82p_* + arena.jpg beast cells (sources tools/art/cards88/). Tests tv88k/s/d/m/h/g/r/p.
- **v0.89 (165-182 + server, no protocol bump):** `165-v89seats` Play Now seats dealt at random (UI Math.random, only while untouched).
  `166-v89fix` boot-window close → menu, START89 counts as live. `167-v89moods` Flavius's painted face, 11 moods (assets/flavmood_<m>.webp,
  tools/art/flavmoods89/make.py; 'really'). `168-v89rotate` MY CORNER AT THE BOTTOM: display-only quarter turns `ROT89.k` (rot89Want: one
  human's p.start offline / S.onl.seat online; off in hot seat, 2+ humans, chariot, naumachia, lessons, watchers, all-CPU); iso() projects the
  turned index, `isoFix` = unturned, `dep89` draw depth, pick turns back; Flavius's box top centre (`flavXY89`); test tv89b. `169-v89loot` loot
  window on the market-board look. `170-v89hs` hot-seat recap only when something happened, Abandon/Save & leave ask the table. `171-v89onl`
  rooms when lanistas go (lobby.leave on close/pagehide, ONLC.ROOM_GRACE 60 s, host passes on, 30 s lobby.get prune ping; mock test hook
  localStorage flavius_onltest89) + MANAGE ONLINE (lockstep input {k:'gear'}, filed in S.gear89[seat]); tests tonl89, server v89.test.
  `172-v89city` painted forum 18×18 (N89, CV89 per arena), bubbles kept off labels (keep89), `cityFig89` lit figures, exit "Back to Match
  Week" when not home. `173-v89cjk` Japanese + CJK fonts (CJK_LANGS89; zh next). `174-v89onlui` Acta smaller, 👥 ⓘ, bells gone, armory
  hover = avatar only, ⚔ Play CTA, leaving Online → menu. `175-v89domus` Domus rebuilt (banner + treasury ledger led89, equipment bar Gear |
  Offerings, class change 100, loadouts, keep home, upgrades, memorial, crest; contract tools/plans/onl89-domus.md). `176-v89sculpt3d` lit
  sculpted tokens everywhere (`sc3dSVG`, `sc3dCanvas`, `lit89(svg)`, TOKEN_IMG3, SC3D_VH 176). `177-v89affix` permanent armor affixes
  (lapid = stone guard, spin, venat, miss, firm, integ, fid, fort; tiers 60/28/10/2; Ranked stones never kill; odds ⓘ `.odds89i`;
  tools/affixsim.js). `178-v89mkt` Commodus = unlock disabled (no CF), class starting cards leave S.deck (giveLoadout wrapper; tame→lyre).
  `179-v89market` NO d4: pay a level → its row lights, take any piece; slot 4 face up (W.up4 getter); Market Choice = free weapon L1-3;
  drafts light every fitting piece (tv89k). `180-v89profile` lanista name (30-day rename), FID-XXXXXX, fid.find, domus.visit, privacy,
  acct.delete (tonl89p). `181-v89citybar` square sidebar tabs + THIS VISIT purchases (tv89y). `182-v89vault` auction never empty (vault lots
  60/32/8, reserved old houses Virgilante, Zora350, SrgtSlaughta, Duckio, Sotonius; tonl89n). 06-ai: CPUs never revisit a tile in one move
  (seen89). Tholo: no hanging cape (126). Art: npccard82_* = his card fronts (tools/art/npccards82), armthumb81_lgreaves + mirrored tassets.
- **v0.90 (183-187 + zh, no server change):** `183-v90ward` Infirmary = list (hurt + tired, HP/fatigue mini-bars) → avatar
  (injuryAvatar74, wound glow) with HP bar (hp90: defaults 5/6/5, lighter segment above default from boostFor, cap 7) + fatigue bar → care
  panel (existing handlers re-homed; "Which cure?" ⓘ on the banner); REST WEEK = can't fight (locked Match Week slot, enter/exhib/road deal
  refuse, sweep90 swaps resting fighters off unfought bouts); FATIGUE BANDS in bouts via seatFor seat.fat90 → mvMax: Fresh 0–30 +1 move in
  round 1 (S.ri===0), Worn 61+ −1 all bout; Care routine −20/wk (FAT_CARE90); band chips (fatChip90). `184-v90yard` previews every
  routine/drill/regime gain (yd90Week, same sums as endWeek, regime randomness left out), fighter card beside the squad table, Doctore +
  Study cards in the right column, yard87Row replaced (no First/Normal/Last; ord87RunAll in roster order), rail no-flicker (MutationObserver
  keeps the rail node), roadLocked76 → thLeft 0 ("🛣 Away"); tail re-applies fatChip90 to the new rows. `185-v90week` Match Week without the
  temple/walk, City Square button with a forum thumbnail; WALK THE SAND at the city arena gate (cbar89Body Arena tab, coin only — walkFee 6 /
  3 home — no hours, n.scouted once a week); League: season stakes (LP90: 120+5 fame / 80 / 50 / 25 / 10 / 10, paid once at week 12 via
  qsClose wrapper, w.lp90), next-prize line on League/Match Week/checklist, rival row → scouting card + ⚔ Challenge (w.chal76); pen fights
  start zoomed (S.zoomIn ×1.8). `186-v90board` HUNT90 (Tholo + lions, not aggro/tamed/lyred: closest living thing every Resolve, gladiator
  before beast on ties, skip own kind (HUNT90.sameKind — his call: lions never hunt each other), Zora never prey, Fresh +1 for every seat (his yes), beast kills via hurtNPC byNpc, Tholo's hoard takes beast coin;
  tools/huntsim.js), Crowd Favor tile disabled when nothing affordable (crowdCan90; CF only — his call 2026-10-06, the 10-coin throw no longer counts) or Commodus, SETTINGS.pots90
  token-round Blessings (rtok blessing face, flips to the offering), SETTINGS.hsTurn90 hot-seat turning board (ROT89, 650 ms ease).
  `187-v90pn` Play Now: Options under the event card, no Rules-in-this-build / Presets, Begin Event (#goBtn) in the top bar, 🎲 Random
  event (event + city + class, Math.random, rolls only); Version history in tabs of ten (historyHTML replaced), entries v0.52+ trimmed.
  Chinese (zh): GUIDE-zh.md, 36+ parts, LANGS86 简体中文, LANG_UI87.zh (173), CJK font stack already in 173; walk test tv87l includes zh.
  Glue fixed: REC_VERB, stone thrower line, the horns line are whole _T keys.
- **v0.91 (188-202 + server, no protocol bump):** `188-v91sponsor` painted sponsors (Flavius's look, 11 moods, more parts, mood row,
  box colours). `189-v91night` night matches (Manager 2nd bout, Play Now Day/Night, room rule; `night91On`, rim torches `night91Spots`,
  dusk square). `190-v91flags` flags beside languages + English (Australia) (tools/i18n/mkau.js → assets/lang_au.js). `191-v91fix` pen
  camera, unmirrored greaves (ARM_NOMIRROR91). `192-v91arena` THE ARENA LOOK (stone per arena `ar91Mat`, foundation + stairs, near walls cut
  down with a thin red edge, far walls with banners + red cap, gully + drains on the FAR edges only, flat-faced corner towers AT the sand
  corners (his sketch), podium/temple; layers under/deco/top cached by key; test tv91r). `193-v91crowd` sculpted spectators. `194-v91wear`
  blood trickles to the drains, walkable rubble, sand wear. `195/196` server version chip (tools/srvstamp.js writes server/src/build.json +
  195-v91srvexp.js). `197-v91econ` ONLINE ECONOMY II (see §8). `198-v91morph` morph91 = in-place patch for online screens (no flicker).
  `199-v91items` elixirs/tokens cancellable, per-side armor art (armSideArt91). `200-v91panel` fighter panel = earned perk chips (ratings in
  the title), mind chip only on CPUs, Hand to CPU top right. `201-v91zora` take the chest from your own Zora (adjacent, offline). `202-v91ludus`
  Your ludus: mail + checklist one row (.lrow91), Acta in the mail header, Week in review = first letter (.rev91), its numbers = banner chips
  (.lst91) — a final mgrHTML wrapper. Also: 21-audio pump (3 s lookahead while hidden), 90-armfit chest under all pieces, city figures built
  once + no old stand-in while decoding (172), city clock/save-button writes only on change (25/38). Tests tv91a/c/e/i/l/m/n/r/s/v/w/z.
- **v0.92 PERFORMANCE (00b-perf FIRST in build.sh + 204-v92perf):** UI sweeps (setInterval 250–1000 ms whose callback source holds a
  signature in `PERF92_SWEEPS`, 28 today) are filed in `PERF92.tasks` instead of real timers and run by ONE heartbeat `perf92Beat`:
  busy (input/activity <10 s) = each at its own pace · quiet = only after a change (`perf92Mark`: input, render, log, modal, beginTurn,
  mToast, MGR_REDRAW, studioRedraw, onlRedraw, menu; `perf92Sig` state signature) or 2× its delay · IDLE (2 min no input + no activity)
  = body.idle92 pauses every CSS animation (the endless pulses were ~90% of idle cost), sweeps ≤1/s, city crowd + night flicker stop.
  `perf92Return` on visibility/5 s gap: stale FX dropped, one render/draw/window redraw, every sweep once, dead NETWS reconnected.
  Game timers (audio, online net/lockstep, countdowns, CPU pacing, one-shots, plTick) stay real. **A new UI poller: add its signature
  to PERF92_SWEEPS** (or leave it real when timing matters). Off: localStorage flavius_perf92off=1. Test `tv92p` (soak + idle numbers).
- **v0.92 (00b/00c + 204-216 + server, no protocol bump):** `204-v92perf` heartbeat/idle (see PERFORMANCE above). `205-v92pn` Play Now 🎟 Stands
  card + guide charts on one row (findings = one `.gft` span per line — loose text pieces became grid cells). `206-v92econ` ONE TREASURY + online KITS
  (server routes.js "v0.92" section, kits92.json from mkserver; purse92 sweeps purses; lobby.send 0–10 coin sent; market.kit; daily Issued kit; restock).
  `207-v92extras` armor-designer extras per location (X92_K, at:[…], Murmillo fish crest, Secutor dome). `208-v92zoom` arena layers in a padded
  REFERENCE frame (AR92.ref; no repaint while the camera eases), no emoji emotes, try-on hides #tip, market modal offers only affordable levels.
  `209-v92cheer` crowd arm bursts by mood + waves (CHEER92; look91 o.up; cached sprites). `210-v92fix` Attack tile says why (atk92Why: Telemachus…),
  Manager music stays on the Manager theme under popups (MUS92), mail pickers readable, sit-out week walks the HOME square (sitOut92), Infirmary
  fighters' yard rows locked (yard92Lock). `211-v92sev` SEV92 = per-location outlines traced from avatar.png (tools/art/sev92.py: neck/shoulder/
  waist 418/crotch cuts) — severed = dark fill + dashed red outline + dashed cuts; wound tint + AP sheen use them too (07-ui avatarSVG). `212-v92pick`
  pick on the body: Focus = target avatar, light-maroon outlines + its worn armor tinted red (filter #av92red); Distribute health/armor = hover-only
  green / dark gray with +N (clicks go through the window's own buttons / CUR_MODAL.done). `213-v92yard` TRAINING YARD (agent): fighter cards
  (+/− sessions, cap 3, 1 house hour each, 🔒 Lock in gold, incremental previews y92Sim == endWeek, dropped if unlocked), Doctore panel (level =
  1 + yard + doc hours/2 ≤6; Intensity = the old regime × gains 1/1.1/1.2/1.35 × fatigue 1/1/1.25/1.5 — Y92_MUL; drills Footwork/Iron/Showman/Blood and
  Sand/Veteran/Parade, 2 h, one a week, outside the cap, bonus 10% + 5%/level), ↻ Same as last week (w.y92last), Care button, ⚔ Trials of the Yard strip
  (old data-yb76 handlers). `214-v92tabs` one live Online per account (connect &tab=NET.conn; server index.js pushes session.replaced to the older
  tab → #tab92 cover: Use here / Leave Online; NET.req refused while covered) + the Autosave/table slots belong to one tab (auto92 via TAB84 bc).
  `215-v92mkt` online market level tabs I/II/III (ONL92M, Level I default) + 🎒 Kits as its own Armory tab. `216-v92errui` Settings → 🐞 Error log
  viewer (Copy for a bug report / Clear) + gold Lock in CSS. `00c-errlog` ERR92 ring (50, localStorage flavius_errlog92): window error, unhandled
  rejection, every console.error; errNew92(mark) for tests. 186: beasts act only on their target's turn (gladiator prey = its own Resolve; beast prey
  = the Resolve of the gladiator nearest the hunter). 192: near walls + the dark gap run on to the corner towers. 53: guide findings fixed.
  Tests: tv92c/f/k/m/p/s/t/x/y, trng92 (dice don't move while screens open + no new errors), tonl92, server v92 + v92t. 3D TOKEN GROUNDWORK:
  tools/art/rig92/ (body.js procedural skinned body, rig.js joints in his colours + IK + pose JSON ≤600 B, presets.js, rig.html editor, make.js →
  out/ sheets in the minis8 format; README.md lists v0.93 work) — not in the game yet.
- **v0.93 HARDENING, phase 1 (223-v93harden + 223a-v93srvtext + server/src/harden93.js; shared numbers = the v0.93 section of 111-onlcore):**
  IDEMPOTENCY — requests in `ONLC.IDEM93` carry a `rid` (NET.req adds one; its own retries reuse it); the server keeps the reply in
  `RID#<acct>`/<rid> 10 min (replay → stored reply, `rid_busy`, `rid_reuse`, a failed request forgets its rid); the mock mirrors it
  (localStorage flavius_onlrid93). RATE LIMIT — `ONLC.limiter93` per account in the Lambda container's memory, `RATE93` 40 burst / 10 s⁻¹,
  `match.*` 90 / 30; refusal `rate_limit` + `wait` (NET.req waits and retries ≤5×); `makeHandler({limits:false})` in tests. TEXT CODES — refusals
  carry `mcode` + `vals` (texts93.json from `node tools/i18n/srvtext93.js`; code = 't'+FNV of the English template); the page shows
  `SRV_TEXT93[mcode]` in its language, `err` stays English for old pages. RAW ERRORS — server: internal failures → `server_error` +
  "(ref S-XXXXX)" (logged); page: `errText92(e, fallback)` (00c) → "Something went wrong. (ref E-XXXX)" + the 🐞 log entry, used at every
  place an error reached the screen; mToast refuses raw text. Money routes wrap the change after a payment in `soft93` (a store failure
  refunds). i18n checks: `node tools/i18n/check93.js` (missing / unused / broken placeholders, every language) + tv93i (pseudolocalized
  walk). Tests: server/test/v93.test.js, tv93i. Docs: docs/.
- **v0.93 EVENT BUS + LAYERS (00d-bus, 218-v93bus, 219-v93layers):** `BUS.on(name,fn)→off`, `once`, `off`, `emit`, `has`; handlers are sync,
  try/caught into the 00c error log. Events + payloads in 218's header (turn.begin via resetTurn, phase, hit, elim, spear, round.end, event.start/over,
  market.buy, chest.open, save, window.open/close, log, render, draw.after); with nobody listening every emitter is the old call (same promise).
  NEW FEATURES LISTEN instead of wrapping core functions. draw() (07-ui) paints ONE ordered list `drawLayers93([[name,paint],…])`: rim · stands
  (192 under/deco cached) · tiles · walls (192 top/light/sky cached, 189 night) · floor · decals (194 wear cached) · highlights · pieces · overlays ·
  crowdtop · flavius · fx · duel — a new board layer goes in that list. `LAYERS93` = order check, per-layer ms (`report()`, printed by tv92p),
  cache hits/misses, `debugOff(name)` (dev/tests only); kill switch localStorage flavius_layers93off=1. Test `tv93l` (pixel-identical ON/OFF).
- **v0.93 TOKEN MODELLER (222-v93token + tools/art/rig92):** Studio custom characters get a posable 3D token: the Character designer's token step
  has the "🧍 3D token" card (`[data-t93card]`, 3D/Classic `[data-t93mode]`, Pose `[data-t93="open"]`) → overlay `#t93m` (6 presets, joint drag,
  IK, pinned feet, 8-facing strip). Look/gear → `t93Parts(c)`; Save renders the minis8 sheet once (`t93Make`) → `c.tok93={v,mode,pose,pk,parts,h,
  sheet,meta,at}` (webp ~35 KB). three.js + the engine load on demand via assetURL: assets/three93.js (window.THREE93) + assets/tok93.js
  (window.TOK93LIB), regenerated by `node tools/art/rig92/mkgame.js` after any rig92 edit (plain scripts: modules fail on file://). Board:
  tokenForCls/tokenForP carry a non-enumerable `t93`; drawFigureTok draws the `miniFace` cell + seat-colour rim. AUTO-CONVERT while the Studio is
  open (idle, one at a time, saved once; headless needs localStorage flavius_tok93auto=1). Off in HEADLESS/sims/online (online = v0.94). Test tv93k.
- **v0.93 ACCESSIBILITY (220-v93a11y):** board canvas is a Tab stop; arrows move a gold dashed tile cursor in SCREEN directions (works turned),
  Enter/Space = a real canvas click on that tile, Esc = back to Move, I = read the board summary (S stays Stands); windows take focus on open,
  trap Tab, return focus on close (#modal + every [role=dialog][aria-modal]); polite live region (turns, big log lines, cursor tile); hidden board
  summary; aria-labels on icon buttons; one gold :focus-visible ring; contrast: --dim #a3907a + class/player colours lifted only where below AA
  (30/594 → 1/598 below AA). Online matches still block keys. Test tv93a. MANAGER LESSON (36-mtutor): steps carry keys (`k:`), Training Yard
  steps (card, + session, 🔒 Lock in, a drill, Doctore panel, Trials), fixed rail/pitch/schooling/perk/city/rival steps. Test tv93t (51 steps).
- **v0.94 ONLINE 3D TOKENS AS SERVER PICTURES (226-v94onltok + 111-onlcore v0.94 section + server routes.js v0.94 block; docs/backend.md "Token
  pictures"):** the Domus showcase gets a "🧍 3D token" card (`[data-t94card]`, `[data-t94="pose"|"off"]`) → the v0.93 modeller (222 `t93Open(c, {save,
  errText})` now takes any character; `t94Char(ch)` = the online look's face/colour, wrapped forearms, no weapons) → `t94Sheet` renders once as WebP
  (quality steps down to ≤ `ONLC.TOK94.MAX` 64 KB) → `t94Upload`: `char.tok` in parts ≤ 24000 base64 chars (API Gateway 32 KB frame), each with a rid;
  the last part is checked (RIFF/WEBP magic + RIFF size, 8×meta[0] × meta[1] from the VP8/VP8L/VP8X header, meta bounds, pose ≤ 600 B) and stored as
  `TOK#<char>/PIC`; the gladiator carries only `ch.tok94={h,at}`; `ONLC.kitOf` → `kit.look.t94={c,h}`; owner only, refused in a room/match (`in_match`),
  ≤ 12 a day (`tok_day`); `char.tok {off}` = Classic. Viewers: `t94Rec(ref)` memory → localStorage `flavius_tok94.<h>` (≤ 12, index flavius_tok94i)
  → `tok.get` (guests too; deduped, a failure waits a minute); prefetched on onlEnter/onlJoinMatch/onlWatch/onlAttach and whenever onlFig shows a
  seat. Board: tokenForP tags the sculpted spec (p._onlSc) with a non-enumerable t93 from `p._onlLook.t94` → 222's figure path (any token style);
  figureHTML/onlFig show the front cell. Never in S state or onlHash; missing → sculpted. Mock: MOCK_ROUTES char.tok/tok.get, pictures in localStorage
  flavius_onlmocktok94. Tests `tonl94`, server `v94.test.js`. Abuse: content is not checked (any WebP of the right size) — see docs/backend.md.
  SAFARI (his ask): its canvas cannot make WebP → `t94EncWasm` loads assets/webpenc94.js on demand (libwebp WebAssembly from @jsquash/webp,
  Apache-2.0, rebuilt by tools/mkwebpenc94.py; wasm inlined as base64; T94.noWebp remembers) — same WebP bytes, no server change; mkshare skips it
  (the standalone has no Online). tonl94 1b fakes Safari (toDataURL answers PNG). Not tried on a real Safari here.
- **v0.94 EVENT DESIGNER AS THE ARENA VIEW (224-v94designer):** the Board step (83 ED_STEPS[1] = "🏟 Arena"; editing a saved event lands
  there) = `e94HTML` (edBoardHTML wrapper; localStorage flavius_ed94off=1 → the old grid). BOARD = the real draw(): `e94Base` swaps in a designer
  state (`e94State`: the draft layout as S, phase 'setup', no players, `S.ed94` → computeHL off, zoomOut, the selected round's zone), parks #cv in an
  off-screen box, copies the picture to `#e94cv` and restores S/RNG(null while painting)/uid/CAM/SETTINGS.fit/#cv — cached by `E94.baseKey`;
  overlays (`e94Paint`): start corners (team A/B colours in team mode), round areas `E94_RC`, hover, check flash, keyboard cursor, drag target.
  Hidden event `EVENTS.__e94` (non-enumerable getter). PALETTE tabs Terrain / Pieces / Zones (`e94PalHTML`, tools `[data-e94tool]`, options
  `[data-e94o]`); only fields the layout holds (no water/doors). `e94Place/e94Remove/e94Move/e94Top` keep the old data shapes. TOOLS: round strip
  (`[data-e94]` round/flag/zone/addround/rmround/rleft/rright, fields `[data-e94f]` = setPath paths), ed82HTML deck slots, music, `e94Checks`
  (click → flash), Undo/Redo (`E94.undo/redo` whole-draft JSON, Ctrl+Z/Y; old controls inside #ed94 snapshot first via `e94Snap`). Mouse: drag
  palette → tile, drag piece, right-click removes, click = stamp; touch: tap item + tap tiles, long-press removes; keyboard: arrows/Enter/Delete/Esc.
  ▶ TEST PLAY (`e94Test`/`e94TestEnd`): draft copy → `EVENTS.__e94t` (non-enumerable), all-CPU startEvent, `S.e94test` (set by a newState
  wrapper) mutes the record functions (119's list + calAdvance/careerHoldsClock) and EVERY Store write; results offer only ◀ Back to the designer;
  `#e94back` leaves any time; coming back reopens the Studio on the arena with draft + undo/redo + palette as they were. Test `tv94d`.
- **v0.94 MANAGER ARMORY (225-v94armory, part 2 of v0.94):** owned gear per house: `m.arm94.sh` = the shelf of pieces `{id,t:'w'|'a'|'o',k,dmg?,loc?}`
  (ids from `w.n94`), a contracted fighter's `g.eq94={h,R,L,a:[armor],o:[≤2 offerings]}` (a pair = one piece on both sides). `arm94EnsureG`
  (seatFor, endWeek, mgrMigrate/newWorld, SAVE_MIGRATIONS '0.94' — saved once via `_arm94dirty`): first signing brings the class loadout (`g.k94`,
  never twice), leaving the house/dying puts his gear on its shelf, old one-week `g.kit` → owned offerings (149's refund finds nothing). Bouts:
  seatFor → `seat.gear94` (damaged pieces + severed limbs skipped), mkPlayer `p._g94`, giveLoadout wrapper swaps the class armor/weapons for
  them (class keeps ability/weakness/coin/keys/items/CF; `p._g94got`), boutCfg carries the offerings (festItems). gameOver snapshots Manager
  seats into `res.g94` (sims via S.sim.done, live via mgrAfterWatch) → applyBout wrapper `arm94Settle`: brought weapon not held = lost, armor
  stripped at 0 AP = damaged (🩹, left home until repaired), held/looted gear kept (empty hand or shelf), unused offerings home, the dead
  man's gear → shelf. Fits: `arm94Fit` (armorConflict rules, severed limbs, two-handed), moves `arm94Put`. UI: Armory card under the Roster
  wall (rosterBlockHTML wrapper; plaque/chip click selects `MGR.ar94`; pointer drag or tap-select `AR94.sel` + tap a zone `[data-ar94z]` /
  chip / plaque / shelf; ＋ `[data-ar94wear]`, ✕ `[data-ar94off]`). City Square: `cbar89StallsHTML` replaced by `arm94ShopHTML` (arms market,
  armorer, 🔨 repairs ⅕ price (`ARM94.repK`; 🔨 Repair all · N coin in the stalls and on the checklist item `[data-arm94fixall]`), offerings stall; sell-back from the shelf 30% (15% damaged), ≤3 sales a week per house (`sellMax`, `pm.sell94`); "For" picker `#arm94Who`), stock `arm94Stock` = hash(world, city, season, week) — `CITY94`
  sizes (sz3 Roma/Capua all levels, sz2 sometimes one L3, sz1 none) + `SPEC94` specialties ×3 weight, 15% off; bought counts `w.stk94`;
  THIS VISIT rows (k 'arm94' with ↶ 70% `[data-arm94undo]`, 'fix94'). Match Week "🛡 Gear up in <city>" (`[data-arm94sq]` → Stalls tab),
  checklist nudges (empty hand the class fills / bare hands, pieces to repair), lesson step 'armory'. Rivals: `arm94AutoShop` in an endWeek
  wrapper (repairs, shelf first, class pieces; budget ≤ `rivMax` above `rivFloor`; hash RNG); mgrsim calls it for its player. Prices
  `ARM94`: weapons 12/30/60 (L4 150), armor AP×3/6/10 (pairs ×1.5), offerings = the old stall prices. Stats `arm94Stats(w)` (+ `w.st94.fl` coin flows by side p/r via `arm94Fl`). IN-BOUT MARKET BUYS NEVER COME HOME: `pick89` (market levels, Choose card, free rolls),
  `chooseMarket` and `runDraft` tag the key on `p._g94mk` (via the gainWeapon/gainArmorPiece wrappers) → snapshot `mk` → `arm94Settle` skips one looted piece per key
  (`ARM94.mkHome=true` turns it off); pieces taken from fighters/floor and offerings found on the sand still come home. Repairs use ONE rule for every house
  (`arm94AutoShop`: mend all while the purse stays above `rivFloor`). TUNING v0.94 (tools/mgrsim.js base, 2 seasons, 20 runs, args `… base on|off|old|rkN`):
  gear off treasury 2148 / wins 14.1; old rules (rep ⅓, sell 40%, no cap, market buys kept) 1400 / 12.1, shelf 59, rival loot 19206 value; rep ¼ 1374-1509 / 12.1-12.3
  (two runs); ⅕ (CHOSEN) 1834 / 13.4 (−15%), shelf 37, rival loot 9278, rivals never broke (lowest 50, avg 163); 1/6 1806 / 13.9; 1/8 1924 / 14.5. myOvr/myGain swing ±5 between
  identical-rule batches (rk4 −6.1 and −3.2, rk6 +5.8) = noise, effOvr reads no gear; the scripted player re-arms every week (audit: bare-handed 0.0, missing armor 0.0).
  The scripted player never sells (sell 0), so the cap is covered by tv94m only. Test tv94m.
- **v0.95 part A BOARD & MATCH (227-v95board, last before 08-setup; header lists the 9 items):** Zora's mini scaled to one tile (`ZORA95_W`); team rings
  in team events (`teamColor` A blue/B orange/C green/D pink in 07-ui; dash patterns per team in colour-blind modes, `TEAMDASH95`); floating numbers moved to an
  overlay canvas `#fx95` above #bubbles (drawFX wrapper: text numbers leave `FX` while the old drawFX runs; clusters on one tile fan out, `fx95Pos`); Crowd Favor
  spend feedback via BUS window.close/open (toast, fx number, flying token `cf95Fly`, 650 ms hold + click swallow, `B95.lock`); Arena Key tokens in the inventory
  (`keyTokens95`: keys count → 2-key/1-key tokens, boardHTML wrapper); chest swap buttons carry the outgoing weapon card (`.c95top`, modal wrapper while
  openChest runs); Focus roll dice = locdie.jpg art in a column beside the avatar (CSS only + `--fh95`); `edTold95` (editors toast once, 24-sponsors edit);
  `ate95` (humanoids "slain", 16-crowd edit) and the Bestiary as a tab `#rulTab-best95` inside Rules & strategy (window-capture click beats 89-stands).
  Test `tv95a`.
- **v0.95 part B, CREATOR STUDIO + PLAY NOW (228-v95studio; header lists items 1-11 of his notes):** roster-set Find = `#rs95q` (max 340 px, 32 chars) filtering IN PLACE
  (`rs95Fill`, no Studio redraw; query cleared when the Studio opens; also on the system set "All my creations"); live class-card preview in the character designer
  (`ch95Card`); ratings panel on the right (`st95Panel`, `.st95c3` third grid column, meter + "Abilities gained" chips, `st95Live`); class designer legs = one card
  (Leather Tasset = a Legs · Upper (pair) option, `arm.legUp` turned into `legU='legwrapsU'` on edit, `#studio .avhit` hidden); armor fit tool sides `AFIT.side` B|R|L
  (`afitF/afitSet/afitAvatar` overrides, per-side flip via an `armBox` wrapper reading the side's own `flip`, Save in fit mode = save the fit, Both default for limbs);
  beast token round letter drawn BEHIND the art (43-beasts rtokSVG, none over a printed base); cohort card = HTML `.pc95` with `pmTok` tokens; `pelt10_95(player)` = only
  the printed Damnatio gets the +10 CF win bonus (05-flow finalCF + 10-meta result lines; WEAKNESSES.pelted text); `humanoid95` filters `allyOpts`; weapon designer
  `cw95Clean` (≤4 icons: plain = Attack power + Range + ≤2 others, shield = Absorb + optional `stats.shP`/`shR` + ≤1 other; on shield tick, on Save and inside cwBuild),
  `.cw95cap` counter, full cards disable the extra ticks; sculptors: `scbPickColor95` random colours, 🔒 Lock proportions (`L.lkp`/`L.pr`, scbInput wrapper), slider ticks =
  shared `<datalist id=snp95_N>` set by a MutationObserver + pointer-only snap (`SNAP95.ptr`, keyboard keeps its steps; `data-nosnap` opts out); Play Now: Stands fold closes
  (`pers95Close`: outside click, Esc, any window.open), seat picker tabs Classes | ⭐ Your characters (`PK95`, You/CPU switch, roster-set filtered via onRollsR) +
  `[data-fill95]` "🎲 Fill CPU seats with my characters" (`pn95Fill`, Math.random). "Dead loading screen" after Find was NOT reproduced (the old 250 ms full redraw + refocus is
  gone, which was the only suspect). Test `tv95b`.
- **v0.95 MANAGER (229-v95mgr, part C):** `offerLive95` withdraws a trade offer whose fighters are gone (offersWeek/offersHTML wrappers; offerAccept refuses with
  `OFFER_FAIL95` "This offer is no longer on the table."). `weekEndGo95` = the End-the-week landing (awards → Acta) also used when `sp_close` (trophyMgrClick wrapper)
  closes an invitational on a finished week. signCard73 face = `gArt(g,'md')`. Recruiting tablets (pipelineHTML wrapper) lose their buttons: a caption `.nx95`, click
  selects. Week in review: `growSnap95` (growthDigest wrapper; statGain wrapper records w.sup95 points + band-ups) → `w.growth95` → `growHTML95` inside `.rev91 .mbody`
  (final mgrHTML wrapper); the `grow-` letter is muted (sendLetter guard). Yard cards: container query on `.y92c`. ARMORY TAB `armory` (MGR_GROUPS spliced, railTabs +
  ludusTabHTML wrappers, `armoryTab95`); hurt fighters: `arm94Fit` refuses, `inj95Sweep` (render, applyBout, endWeek) moves gear to the shelf (`g.re95` ids; checklist
  "has healed — equip him again" + `[data-re95]` Re-equip; only the player's house). ROSTER: `g.slot95` 1–3 = Bout I/II/III (TIERS under/feature/main), `st95Ensure` keeps
  ≤3 + syncs `g.bench`; `st95Set/st95Bench`; `st95Fill` puts starters on their bout's card (once a week via `w.fill95`, and after a plan change with force); `rosterBlockHTML`
  wrapper = `.st95wrap` (depth card with a Loans tab, list rows with Promote/Bench/Lend, the card at the right); 17-manager's Match Week picker no longer filters `!g.bench`.
  `ST95.perk` (+2 morale, +1 loyB a starter; −1 morale a benched arena-time want) applied after endWeek. SAVE_MIGRATIONS '0.95' + mgrMigrate/newWorld (`_st95dirty`, saved
  in openManager). Trophy case: `.trli.lock95/earned95` + `--tb` border per trophy (hallTrophiesHTML wrapper). Lesson 'armory' step opens the tab. Test `tv95c`; updated
  tv84r (new chart), tv85r (tablet captions), tv94m (Armory tab), tv88m (chips), tmgr47/48, tv88p.
- **v0.95 PERFORMANCE (230-v95perf, part D; + 02-data sleep):** display only — rules, dice, S, online hash untouched. Kill switch localStorage
  flavius_perf95off=1 (debug: flavius_cut95off, flavius_cut95only=a.jpg,b.webp, flavius_fit95off). (1) PATCH IN PLACE: render()/renderTurnInd()
  run into fresh empty twins of #status #rosterHd #roster #board #npcPanel #turnInd (`p95Patch`; every wrapper/post-processor sees what it
  always saw; 81's panelStatsUp runs on the twin first), then `morph95` patches the live panel (isEqualNode fast path, keyed rows `P95_KEYS`,
  one-step look-ahead, a lit figure's svg kept when only its s3h ids changed else swapped whole); inside a panel each node remembers its
  TEMPLATE attributes (`_p95`) and a patch changes only what the template changed, so observer decorations stay (220 contrast lift + aria,
  138 data-en84). (2) CUT-OUTS `cut95`: cardStyle / rtokHTML / armPieceSVG (the avatar's armor) show a sheet cell as its own blob image, cut in
  a WORKER (fetch → createImageBitmap → OffscreenCanvas → PNG ≤200k px else JPEG/WebP q .92; all cells of a sheet in one go; page-thread
  fallback); styles are rebuilt from the ref and matched whole (no scan of the standalone's data: URIs). Only http(s) and data: sheets —
  a file:// page cannot read pixels back, so tests on file:// keep the sheets. (3) COALESCED render: CPU acting at Fast/Normal, offline, no
  window, no input in 400 ms → ≤ `P95.cpuHz` 4 panel updates/s (trailing call always lands; draw() still runs every call). (4) FAST: no speech /
  wager bubbles, no cheer waves, LIFE84 dust/settle ⅓, floating numbers 600 ms. (5) LAYOUT: wrap/cv clientWidth + fitReserve kept by
  ResizeObservers (`FIT95`; 163's bar keeper still measures inside render's draw, `P95.act.status`). (6) sleep() waits >150 ms re-read SPEED
  every ≤100 ms (Pause holds, Slow→Fast finishes at Fast's pace). (7) Main menu show waits ≤1.5 s for its decoded figures (`MM95`) and draws
  them from a raster cache (`mm95Raster`). MEASURED (tools/perf95/compare.sh, http, all-CPU Democritus 1440×900, 2 rounds, load ~2):
  Normal 31–32→31–33 fps, p95 frame 89–104→86–96 ms, image decoding 2.8–3.1 s→0.07–0.37 s per 8 s; Fast 13–14→15–17 fps, p50 44–54→44–53 ms,
  p95 222–225→133–145 ms, busy 83–85→73–75%, decoding 4.8–6.2 s→0.16–0.24 s per 8 s (40→8–13 decodes/s, now small cut-outs). Loaded machine
  (tv95p OFF vs ON in one run, load 8–20): Fast 9–11→19–20 fps, p50 120→51–55 ms, decoding ~1000→36–42 ms a second. Menu show: first-load p50
  frame 16.7 ms (was 13 frames in 8 s under load). NOT MET: Fast ≥40 fps
  in headless — the main thread is ~95% busy at Fast: COMMIT = the software 2D canvas rasterising the recorded board (~20 ms per full draw,
  the tiles layer ≈ half: 169 clipped tiles with grain/shade/scar) + the CPU turns' own script; a cached tiles layer (±1 rounding at the board
  edge) is the next lever. tools/perf95: prof.js · trace.js (decodes, main CPU ms/s, commits; LS='{…}' page flags) · imgs.js · compare.sh ·
  pixels.js (230 ON vs OFF in one page: identical) · serve.js. Test tv95p (OFF vs ON in one run, decode ms/s, p50, patch = innerHTML, sleep).
- **v1.0 online diplomacy (06-ai cpuDiplomacy partners filter, test `tonl100t`):** in `S.onl` a CPU never offers a truce/trade to a HUMAN seat (filter before any dice, so identical on every client); 113's title-regex auto-decline is now only a dead fallback (titles are translated, it never matched in non-English). CPU↔CPU offers unchanged.
- **v0.97 bout tracker (242-v96bt):** Match Week banner chips are a grid (sword mark 26 px LEFT of day/bout/result, never over them; phones 18 px, day + result only); test tv96t, shots tools/plans/bt96.
- **v0.98 online at mixed speeds (254-v98fastonl):** while an `endTurn()` / `settle()` runs (counted per S in `F98`), board inputs (tile/act/drop) are not ready (`onlmReady`), not "impossible" (121), your own board clicks are not taken (`onlmMine`) and no snapshot is cut — the End-turn act clears S.busy before endTurn while the phase is still 'action', so a Fast lanista's next-turn move was applied inside a slower window's old turn (mismatch → resync). A resync snapshot no longer sets this viewer's SPEED (`onlmLoad` wrapper). Test `tonl98f` (Fast + Normal, Beta's turn end stretched 1.5 s).
- **v0.97 grow (245-v96grow):** `weeklyGrowth` wrapper (66 runs for every house's contracted fighters): beside the +0.2 Luck, `grow96Roll(w,g,week)` (hash of world id + fighter id + absolute week, never the dice RNG) gives 10% (`GROW96.chance`) +0.2 to one of spd/str/int/cha through statGain, so band-ups and "From your Doctores" show it. Test `tv96g`.
- **v0.98 part E ONLINE (252-v98onl + the v0.98 section of 111-onlcore + server routes.js "v0.98" block; docs/backend.md "v0.98"; NO protocol bump — VER stays 7):**
  🔒 Custom-room PASSWORDS (`pwWhy98`, `pwHash98` = pure-JS SHA-256 of a salt + the password, kept in `LOBBY#<id>`/`PW98` — never on the room, which carries `pw:1`;
  `lobby.create {pw}` / host's `lobby.set {pw}` ('' clears), `lobby.join {pw}` → `pw_need` / `pw_bad`, `PW98.TRIES` 8 tries per 10 min (`slow`), Ranked → `pw_ranked`,
  invitations skip it, `quickPick` never picks a 🔒 room; page: a `NET.req` wrapper asks (`pw98Ask`) for every join path, the table settings' 🔒 Password row).
  REGIONS: `regionOf98(tz)` → 7 `REGIONS98` from the host's time zone (page sends `tz` on lobby.create/quick; else hello's; hidden lanista → none) → `L.reg`; flags drawn with
  flagURI (`rg98Flag`); Lobby Browser Region filter + sort (`ONL96.reg`). HOUSE CARD: route `house.card {acct|id|fid|name}` (guests too, look89 rate) = public domus row,
  living gladiators by Glory, fallen, best rank ever, last 6 `D.recent` W/L, lanista/FID, now (hidden → off); page `hc98Open` from any `[data-hc98]` (list host, room
  names) / `[data-hc98d]` (followed houses), 🏛 Visit (`onl89Visit`) · ★ Follow. DOMUS RANK: `drankScore98` = best 4 living Glory + 20% of all fallen, `D.dr98` keeps the
  best (never drops; recomputed on domus.get / house.card / after settleMatch / match.abandon), `DRANKS98` Tugurium 0 · Taberna 200 · Ludus Minor 600 · Ludus 1500 ·
  Ludus Magnus 3000 · Familia Nota 5500 · Domus Illustris 9000 · Domus Aurea 15000 (symbols hut/amphora/rudis/blades/helm/shield/laurel/eagle); `domusRow.dr98={s,k}`;
  room members/players/host carry `dr` (groupOf re-point → `C.roomJoin` wrapper; `C.liteRow` keeps it); page `dr98URI` = a swallow-tail banner image (flagURI cloth +
  symbol layer), `dr98Chip` beside names, the big one atop the Domus Glory bar (`onlRankBar82` wrapper). Find me a fight is SILENT (makeRoom re-point: quick → cry:false;
  `announce` skips `L.quick`). EVENTS: `EVENTS_CUSTOM98` = Ludus [2,4] + Golden Eagle [4,8] (team) — `C.EVENTS_ALL`/`C.EVENTS_TEAM` are NEW arrays (the internal
  ones, so `onlineFixture`, unchanged); newLobby/roomSet refuse them in Ranked; GAUNTLET LEFT OUT (solo, 1 seat — an online match needs 2 lanistas); page: in
  ONL_EVENTS_OK88 + two cycling squares under the playlists (`ev98Squares`, ⚔ Play = lobby.quick ranked:false), no Ranked buttons for them. DAMNATIO only at creation
  (`C.classWhy` wrapper; the Domus picker greys it). RENAMES (his table): UNIQUES gloria → Gloriosus II, percussor → Acutus II, UNIQUES_A mercurialis → Velox II,
  gloriosa → Laudis; affixes crowd/pierce/swift get " I". Named pieces STORE their names, so `rename98(def)` rewrites from aff/uq (gender kept, idempotent) in
  rollNamed/rollNamedArmor/cleanNamed/cleanNamedA, and the page walks every reply + push (`ONLC.renameDeep98` in NET.req/NET.emit wrappers); AUC96_AFF labels follow.
  👤 PROFILE & SETTINGS = his mock (tools/plans/mock98/profile.html): header card + Privacy · Find (+ followed houses) · Tester | Notifications · Account;
  separate switches flavius_onlflash98 / flavius_onlhorn98 (`onl84Alert` replaced). Tests tonl98 (mock, 4 windows: Ludus + Golden Eagle played in lockstep), server v98.test.js.
- **v0.96 (231-234, parts A–D; 111-onlcore armPlace changed → the server redeploys):** `231-v96mgr` — trait cards `trait96Grade` (A+≥92 A≥85
  B+≥78 B≥70 C+≥62 C≥54 D≥44 F), "Save and Exit", League "🏆 Standings" podium (Superbus art on 1st, hover = prizes + Quaestor) + columns Place ·
  Ludus · Top gladiator · Record · Latest event · Superbus, `w.acta96[week]` → Season tab 📜 Acta column, Road box sized to content + Consilium
  note inside + next-prize letter (once, on change), no Gear-up tile, warnings stamped with city+week (stale dropped), "no fighter entered"
  clears as soon as one is on a card, invitational Answer = picker popup, Armory anvil icon + "🩹 Damaged" card. `232-v96board` — EVERY attack
  logged ("… misses X"), no aim window after a full miss, Focus windows closed/invalid → best location / rolled dice (root cause of the silent
  head shots), save floats (Fidelis, elixir), belts layer −0.5 (custom forge pieces join the layer order), Shield of Achilles text unescaped,
  panel snaps to your fighter at your turn, To the end: no beast cards, #slogPin GONE (seat switches/wagers → Stands log only), spectator
  upkeep only when something is possible + `#btnSec96` Switch section · 3 CF, stone cap 3 hits/gladiator/turn (`S.stone96`), FAST = no waits +
  one draw per move, weapon counters (ammo/throws/uses), `armPad()` (only lower padding + belt stack under hard pieces → the Leather Tasset
  takes the upper leg alone; shared 111 armPlace too; Manager tassets under hard thigh pieces → shelf), Carmina = one window with 3 cards and
  verse columns. `233-v96bar` — the compact action bar: a render() wrapper RE-HOMES the existing buttons (data-act/handlers untouched, `.acts`
  kept) into rail + Attack/Move/Deal/Market·Crowd + End turn; unusable = dimmed placeholder without data-act; Trade · Truce = ONE button (one
  `trade` act — a second one would not be recorded by lockstep); Wager on yourself off the bar; extras: hover previews drawn in computeHL's
  step (never S), pips, unused line, done-phase tips (log() side map), turn owner + next, keys A (weapons) / P (push) / Enter, hint glow,
  phones one swipe row; kill switch localStorage flavius_bar96off=1. `234-v96onl` — the room re-laid out by a last wrapper over the finished
  room HTML (seats 2×4 centred, list right, settings under, picker bottom right), bubbles under tokens (`R96.BUB` 6 s), send coin in your seat,
  Exit/Close lobby, lobby.create sends cry:false (Find me a fight still cries — server, v0.97), lobby list filters/sort (localStorage
  flavius_onllb96) + ↻, Domus Loadouts + Restock gone, reload → straight back into a confirmed live match (flavius_onlauto96=0 = old menu row).
  Tests tv96m, tv96b, tv96a, tonl96.
- **v0.96 FAST THAT FLOWS (235-v96fast, last before 08-setup; display only):** at Fast a move (232's fast96Batch, offline only) waits ONE
  animation frame per step (02-data `SLEEP_HOOK` → `pace96Frame`, rAF + setTimeout fallback when hidden) with the step's draws folded into
  that frame — the piece glides, no step chain is a long task (`PACE96.maxStep`); draws between frames while a CPU acts at Fast are folded
  into one rAF draw (`coal96`, uses 230's p95Defer); the 'tiles' layer is cached (`TILES96`, `tiles96Key`: canvas + transform + iso
  projection + theme + S + zones + scars/sand; naumachia/chariot/designer paint directly; ±2 levels on anti-aliased seams vs off). Kill
  switches localStorage flavius_pace96off=1 (pacing + coalescing) / flavius_tiles96off=1. SEAMS (his note: tile gaps flicker while
  zooming): `tilePath` wrapper puts tile corners on whole device pixels (`SNAP96`) and the tiles layer's grid line is 1.6 px at 0.66
  strength (`GRID96`, read by 07-ui) — frame-to-frame seam jumps ~5 → ~1.6 levels; kill switch flavius_snap96off=1. Test tv96f
  (pixels, frame per step, seeded dice+log ON == OFF in fresh browsers, seams while zooming).
- **v0.97 deals (236-v96deals, last before 08-setup):** `noCF96(key)` = every round forbids CF → the bar's Market/Crowd tiles read "No CF this event" (+ tip) all match, chip `🌾 No CF: no Market buys` on Match Week bout rows (nightHTML) and the online room head (r96Layout); Trade·Truce menu chips 🕊 Truce / 🛡 Teammate sorted first (modal wrapper); accepted truce/trade banner `.acc96` ~2.5 s (makeTruce/doTrade wrappers, DOM only); ONE trade-or-truce offer per gladiator per target per turn (`S.offers96` {turnNo,from,to:[ids]}, marked in cpuAcceptsTruce/cpuAcceptsTrade/hsAsk wrappers; `tradePartners` hides used targets while `CPUDIP96`; menu row greyed, Trade/Propose-a-truce disabled in the next window, gifts stay open); digital house rule: lifting the Arena Chest costs 1 movement and is refused at 0 (07-ui button+handler, 06-ai Orpheus pickup, Zora hand-over free; mvMax −1 only on later turns; note in RULE_TILE.chest + Tactics Interpretations); Move not `.on` at 0 movement (`spent96`). Test tv96d.
- **v0.97 Domus fixes (237-v96domus):** online Domus banner — 🏆 Trophies under the treasury (`.db96-tc`), 🧪 Tester panel moved to Profile & Settings (`l89ProfHTML` wrapper), worn-armor chips >5 → first 4 + "＋N more ▾" (`data-wr96`, localStorage flavius_dm96arm). Test `tv96o`.
- **v0.96 CLEAN-UP SHOW REDRAWN (238-v96clean, his picks 1a 2c 3b 4; display only — 07-ui's startCleanCrew/cleanTick9/CLEAN_PH, the 320 ms tick
  and the countdown are untouched):** the crew = flat sheets rendered ONCE with the rig92 token modeller (tools/art/clean96: crew.js poses/props/dress
  on rig92's body, make.js → assets/crew96_slave|charun|guard.webp, ~240 KB, one ROW per pose × 8 MINI_YAW cells, no base, meta [cellW,cellH,ax,ay,rows]
  in CREW96_META at CREW96_PXMM 2.6; re-render → paste out/meta.json). Slave (exomis, irons, collar + chain): walkA/B stand rakeA/B carryA/B pushA/B
  haulA/B; Charun (bone mask, mallet): walk raise strike; guard (galea, whip): walk idle crack. Facing = screen direction of movement (cl96Yaw, so
  ROT89 is free); display glide between ticks (cl96Pos, WeakMap per crew object). Props painted in a small iso frame (cl96F/cl96P, metres): spoked
  turning-wheel cart + stretcher + shrouded body, the column carried / hauled on rollers / set up under shear legs + pulley, chest bearers. Effects
  (Full only): comb lines behind rake heads, ruts, drag furrows (CL96.lines, fade 9 s), dust, removed blood fading (CLEAN_PH.blood wrapper → cl96Ghost),
  a whip-cracking guard in every work phase, a third (unchained) raker. LAYERS: ground work in 'decals' (drawCleanCrew wrapper), figures/props sorted
  with the pieces as transient `cl96` items in S.pillars during draw() only (108's pen pattern; drawPillar wrapper). MOTION: Full = rAF loop ≤15 fps
  that keeps itself under ~¼ of the main thread (CL96.cost); Fast = jumps, no effects; calm / Reduce motion / Animations Off / effects off = static;
  HEADLESS, sheets not decoded or localStorage flavius_clean96off=1 → the old blobs. 55-anim's speared-spectator crew draws the slave sprite (drawSlave9
  wrapper). Shots: tools/art/clean96/shots.js → tools/plans/clean96/. Test tv96c (same pace per tick ±5% on/off/calm, sheets, guard, lines, no leak).
- **v0.97 auction card (239-v96auc):** `auc96Fix` rebuilds each Flavius's Auction lot (final `onl84Auction` wrapper) = big art 40% left + name/base line/"Bonuses" list (`AUC96_AFF`: glyph, name, plain rule per affix id; unique = gold row) + compact bottom strip `.au96f`; one refusal note `.au96-note` above the grid; phones one column. Test `tv96u`.
- **v0.97 pulse (240-v96pulse):** hosting a WAITING room pulses the Online "Lobby Browser" rail tab (`.pu96`; calm = static; idle92 pauses), my list row = static gold outline (`.pu96row`); a new lanista joining flashes the tab + their seat/name green 1.5 s (`.pu96g`) and toasts "<name> joined your room" when the room screen isn't showing; state on `PULSE96`, classes re-applied after each onlRedraw; test tv96l.
- **241-v96skip (v0.96 fix):** last weekChecklist wrapper — on the road drops Infirmary/Yard items (⚕🛏🦿🔒🏋⏳), once all bouts are fought drops ⚔/⭐ items, no 🩹 repair without a city; feeds skip list, Your ludus list, rail count; treasury line prints "≈ −40". Test tv96k.
- **v0.97 Match Week walk (244-v96walk):** a final `mgrHTML` wrapper (tab night, not bye) moves `[data-mg="city"]` (forum image, text only) + `.city90n` into the city banner (`.walk96`, `.has-walk96`) and flattens the `.travelcard` (Road box) + the mailline "🗣 Asking for a fight" into ONE strip `.travelcard.strip96` (`.ask96`); shots tools/plans/walk96/, test `tv96w`.
- **v0.98 part B (247-v98pn, last before 08-setup):** PLAY NOW to the approved mock (`pn98` setupBody wrapper, re-homes only): #mTitle hidden via `:has`,
  sticky `.pn-top` with "Play Now" + upper-right `.pn98go` (`.pn-sum` · 🎲 `[data-pnrand90]` + `.pn98tip` · #goBtn), #setupErr under it, `.pn-start` gone,
  calendar chip without the week's event (Follow's title); WHO = `.pn98who`: `.pn98pc` (badge + count picker `[data-pn98n]` → hidden #nSel change) + `.seats.pn98seats`
  (4 columns + 270 px Stands column; `.stands92` stays inside .seats, sticky, max-height = window) + dashed `.pn98add` empty seats. Play Now submenu: `modal`
  wrapper adds "🛡 Your Play Now Gladiators" (value pngl98 → openLudus). STUDIO DESIGNER TABS `st98Apply` (body MutationObserver 30 ms + studioRedraw wrapper):
  sections = h4/h3.sxh3 headings + framed boxes (`.card2` with a <b> title / `div.sect`-titled, ≥2 per parent, not in .formgrid); other sections only get
  `.st98off` (values/hooks kept), a Save row after design headings stays; tab per designer in localStorage flavius_st98tab (`ST98`), Edit/Copy/New → first
  form tab; off for events/rosters/names/all. Class cards: classCardHTML + classThumbHTML wrappers add the weapon cards (`.cc98w`; big under, small on hover).
  Character designer: [data-t93card] + .st95stats in `.st98rc` (upper right), .perswrap 2 columns. rig92: game.js editor lights the hovered/dragged joint
  (`ed.hot()`, `ed.screenOf(k)`; `T93.ed` via a t93Load wrapper), body.js `ATH` athletic build (opt.ath 0 = old) → tok93.js regenerated. Test `tv98b`.
- **v0.97 prep (243-v96armban):** the Manager Armory banner has its own scene (`armoryScene96`: racks, hung shields, armor stand, anvil + brazier glow, static under Reduce motion/idle), subtitle "what the house owns, and who wears it", chip = pieces to repair else on the shelf (tabStat73 wrapper); test `tv96r`.
- **v0.98 part A (246-v98ui, his mock-ups tools/plans/mock98/):** SETTINGS full screen (modal opt.full via an openSettings/modal wrapper) — header
  (Restore all defaults = 142's data-rst84; the ✕ is #mClose restyled), left RAIL `data-stab` = general · help (Hints & board) · pieces (Board & pieces) ·
  themes · audio · access, footer → 💾 Saves (data-sv84); phones = bottom pill row. Pages are BUILT FROM the old tabs' finished HTML (`set98T` + lift each
  control with its attributes/state), so every old handler and SETTINGS key keeps working; old tab keys map (`SET98_MAP`: tokens/sponsors → pieces,
  profiles → themes; 'saves' only with SET84.full). Language = one dropdown (`[data-ldd98]`, items are 190's data-lang91), Blessings on pillars = picture
  cards (assets/pillar98_pots|tokens.webp), Floor spikes Iron/Bronze (`data-spike98` → THEME.spike), text size steps `data-ts98` (SETTINGS.tscale).
  Removed rows: Saves tab, home-city banners, spectator emotes (keys keep their values). Kill switch localStorage flavius_set98off=1. TACTICS replaces
  showRules (tabs `data-tac98` tut/build/new/strat/ref + 📖 rulebook link; Reference sub-tabs `data-tac98r` qr/gloss/best; NOT data-rul — 60/227 listeners
  hide panes on it): Rules at a Glance (ten cards, purple ◆ DIGITAL `.dg98`, beasts from NPCT), Quick Reference assets/quickref98.webp (rulebook p.72) +
  digital notes, Bestiary cards via 129's nc82Front/nc82Back + the old ledgers folded, ids #rulTab-build/-new/-hist/-guide/-mguide kept. MAIN MENU: `mm98`
  (replaces mmLabels82) gives every button a carved svg + `.ss98` sandstone slab, Play Now porphyry + gold leaf, "Rules" → "Tactics". Test `tv98a`.
- **v0.98 part C (248-v98bar, last before 08-setup):** ACTION BAR v2 (his mock tools/plans/mock98/actionbar2.html): a final render wrapper MOVES 233's
  (already 236-processed) buttons into one plate — Move · Attack · Forum · End turn, shared header/button heights; Choice = centred gold "✦ Choose one"
  (keys 1/2); Forum = .k96 Market + Crowd on top, .d96 Loot + Trade · Truce below, coin · CF in its header; Attack = one `.wpn98` row per weapon (icon,
  name, "N dmg · rng N", A) with a `.dock98`: ◎ Focus (07-ui's ONE focus act; other weapons carry copies with the same data-act + `data-w98` → the
  click aims focus at that weapon via the local m- mode; while focus is on the other docks are `data-m98` weapon switches) + ↗ Throw (07-ui's own
  m-atk?T button). Phones: dmg·rng hidden, long-press shows it (#lp98). Kill switch flavius_bar98off=1 → 233's bar (tv96a runs with it).
  FOCUS DIGITAL RULE: `FOCUS98.min` 3 — the button is refused below 3 with the reason (focus98Gate), doAttack ignores a focus flag below 3, `act`
  wrapper clears a focus flag an action left under 3, 06-ai CPUs need mv ≥ 3. RULE B (`FOCUS98.bless`, on — his call 2026-10-08): with Focus a
  ranged/thrown weapon may also target a Blessings pot in range + LOS (targetsFor wrapper, `f98` targets), a focused hit on a pot gets +1
  (statDmgB +1 for that attack), breakPot as today, throws spent as today; PvP rounds only (where 07-ui shows Focus); CPUs via `focus98CpuPot`
  (06-ai, aiTier ≥ 3, only when it beats their best attack). Purple notes in 08-setup Interpretations. Test tv98c.
- **v0.98 part D RECRUITING III (249-v98rec, Manager only):** free agents' ratings are letter grades (trait96Grade) — "?" until scouted, hover = meaning + how
  sure; NO rating numbers before signing (estOvr/ratingsHTML/recCmpHTML wrappers + 17/25/50/64 "rated ~" edits). RECRUITER'S HOURS `REC98.hrs` 20/wk +4 a Recruiter
  level, ≤8 on one recruit, each action once a recruit a week (w.rh98, g.sc98 = {p: precision 0–3 per stat, s, a, h, sc}): 🍺 ask 1 h (one rough grade) · 👁 watch 2 h
  (spd/str fair) · 🍷 cup 2 h (int/cha fair) · 📜 study 3 h (all +1, lck fair) · ⚔ trial 5 h + 4 coin (all sure, interest, 7% bruise). Estimates `rec98Est` = truth +
  hashed noise REC98.sig[p] × lvK[level] (never the dice RNG); rivals court with `rec98Rival` (17 cpuLeagueWeek edit). `rec98Sync` keeps g.scout in step (all five
  graded → 2 = personality/wants/motives revealed; all sure → 3; older paths raising g.scout raise precisions). Personality: temper, wants, cares-about, DEAL98
  dealbreaker (~6/10; broken → needs ask ×1.25 in offerVerdict). COURT: house grades = the lanista traits; PITCH98 six pitches each on a trait + want + motive
  (gain REC98.pitch by grade, ×2 on his wish, + motive ×10, Broker +3; PITCH_MAX + one per recruit a week), projections (Yard, champion). Advisor ★ via recAdvice74
  wrapper. "The truth" block on the sign card (g.truth98). ADVISOR LEVELS w.council83[i].lv: new 1 · Easy 2 · taken-over 2/3 (fame 40+); ⬆ Train on the Recruiter's
  council card (REC98.up coin) — only the Recruiter's level has effects. SAVE_MIGRATIONS '0.98'. Lesson scout/pitch steps use [data-rec98a]/[data-rec98p]. Test tv98d;
  shots tools/plans/rec98/ (shot.js).
- **v0.99 zoomed in (260-v99zoom, last before 08-setup; display only):** zoomed, the tiles layer is painted ONCE in the board's own frame
  (`Z99`: screen-sized passes on #cv with the origin moved, copied out as chunks; key = 235's minus OX/OY) and slid by the camera offset in
  whole device pixels — 235's key held OX/OY, so the follow camera rebuilt it every frame (22 ms). Cached canvases (these chunks, 192's
  padded stone layers via an `ar91Blit` override, 194's wear layer via `z99Img`) are blitted as ImageBitmap PIECES (`z99Put`, `Z99.part`
  256, cut after `Z99.uses` blits of a key): big canvas blits pushed Chrome's next flush (corpse filter / Flavius's box) 8-20 ms dearer once a
  frame's image bytes passed a budget. Zoomed tile corners round on their offset from the origin (tie-bias; absolute rounding flipped
  half-pixel corners as the camera moved = the seam shimmer); stands off → the rim rides in the cache; a second draw in one frame folds into
  the next rAF while a CPU acts zoomed at Normal; Reduce motion → camera jumps. Kill switch flavius_zoom99off=1. Test `tv99z`.
- **v0.99 ONE FACE, phase 1 (263-v99face; plan tools/plans/mock99/PORTRAITS.md):** every human face paints through `face99(spec,{frame,size,color})`
  from ONE flat spec FACE1 (keys + adapters documented in 263's header: `faceNorm99`, `fromSpect99`, `fromCouncil99`, `fromPatron99`, `fromOnlLook99`,
  `fromGlad99`, `fromRecord99`, `fromLanista99`, `face99Out` for storage). portraitSVG / portraitHTML / specFaceSVG / onlPatronFace82 / face83 (131 edit)
  route through it; the bust geometry = the old chain captured as `FACE99.geom` (busts byte-identical, `tools/plans/face99/cmp.js`); spectators,
  advisors and patrons are the bust CROPPED (`face99Spect`: head ≤39 px, chip ≥40 px). String cache `FACE99.cache` (custom-banner bgs never cached).
  `SETTINGS.face99` Full/Light/Off (Board & pieces → Portraits) all draw today's look until the polish phase. No saved data rewritten.
  Kill switch localStorage flavius_face99off=1; prototype polish preview flavius_face99polish=1. Test `tv99f`; shots tools/plans/face99/.
- **v0.99 THE LANISTA'S DESK (270-v99desk, last before 08-setup; plan tools/plans/mock99/DESK.md, shots tools/plans/desk99/):** Your ludus = ONE card
  `#desk99` replacing 202's .lrow91 (a final mgrHTML wrapper). `deskItems99()` = weekChecklist rows (src 'ck', each with a dismiss key `x.k99`; ⚖ ✝ 🦿
  `req99` = no ✕) + mailLive letters that need an answer (src 'mail': a body button other than File it away; one plain button is re-homed, two+ or a
  form → "Decide ▾" opens the letter's own HTML inside the row `.dk99ex`; sendLetter's optional `act:{ic,line,btn,due,tier}` / `act:false` overrides);
  tiers 1 required · 2 card · 3 deadline · 4 care · 5 planning; med84/contracts/fa85 letters ride on their checklist row as its 📜. Letters (no answer)
  = 69's own envelopes + Week in review first + Past letters (w.mailLog). ✕/↶ = w.ckSkip keys (checklist keys or mail keys). `ludusTodo73` = open
  rows → ONE rail oval `.mcount.hot.dk99n` (69's ✉ removed, 95's c73 hidden via body.dk99on) + banner "this week"; endConfirmHTML skip list `.sk99l`
  with lost/expires/until chips. Phones: 6 rows + "▸ N more". No save change. Kill switch localStorage flavius_desk99off=1. Test `tv99k`.
- **v0.99 ONE FACE phase 2 (268-v99face2, after 263's phase 1; plan tools/plans/mock99/PORTRAITS.md §5–7):** `face99` replaced by the painterly
  painter (face99b.js) + the 12 VARIETY parts (face99v.js) ported as production code on a tiny string tree (`p99`/`V99`/`ser99`, no DOMParser):
  geometry → `F2V.prePass` (shape) → `F2B.strong99` (paint). Tiers by bust-equivalent px (`face2Tier`): ≤32 shapes only · 33–47 lite · 48–119 ·
  ≥120 textures (grain ≥150); Light = lite everywhere; Off = 263 phase 1 (byte-identical inline SVG). Key `fx` = 12 base-36 chars + kh (keep hair
  when old), `fx99Pack/fx99Unpack`; generated looks (gladPortrait's key list `GEN99`) and crowd looks roll fx from their own content at draw time
  (`fx99Gen`/`fx99Crowd`, never Math.random); patrons (c1/c2) and stored looks keep today's shapes; randomPortrait rolls fx (UI). RASTER CACHE `R99`:
  portraitHTML/portraitSVG/crowd faces = `<svg viewBox><image data-f99 href=blob>` built once per spec+frame+tier+px, an idle JPEG swapped in, LRU 640
  (faces on the page kept); vector only for flag:c: backdrops and the Summa Rudis card (`FACE2.vec`). Designer: 🧬 Features card (`.fx99card`,
  `[data-fx99p/o/r/z/kh]`) added into 262's Appearance / Portrait tab (char · Studio lanista · new career). Online: cleanLook/cleanPatron keep `fx`
  (no server change). Test tv99f; shots + list perf tools/plans/face99/phase2.js · perf2.js.
- **v0.99 FIXES FROM HIS NOTES V99 (271-v99fix3, built by hand, no agents — see tools/plans/backlog.md for what waits for v1.0):** 1b, 5a-5c (coach fixed in one place; teachers TUTOR99/MTUTOR99 = city editors), 7a/7b (Online refresh returns via sessionStorage flavius_onlopen99), 9a (seatCanToggle false online), 10b/10c (room foot `.r99-foot`), 11a, 12a/12c, 13b (RZ99: music looks 3 s ahead while resizing, draw folded in a resize storm). Test `tv99o`.
- **v0.99 FIX4 (272-v99fix4, his notes 2026-10-09 + answers; header lists every item):** ISSUED STARTER KITS (P.iss = fighter id: not sellable, vanish when
  he dies/leaves wherever they are — iss99Purge in an arm94Strip wrapper; old saves marked once w.iss99), damaged armor off the body after a bout (dmg99Shelve in an
  applyBout wrapper), selling from the Armory (sell99: damaged = scrap 15% outside the 3/week cap; 💰 Sell all damaged + Spares fold on dmg96HTML), 🔨 prices with
  the coin icon, Match Week compact buttons + verdict card + 🦅 Golden Eagle chip (final mgrHTML pass), Recruiting oval = Recruiter's hours (hr99Sync, in
  PERF92_SWEEPS; 95's c73 hidden for recruit), Ask column coin, Week in review ✕ (w.rev99), recruit step reset on select, fallen total pm.fallen99 (applyBout/
  settlePending/endWeek snapshots), welcome scroll + founding ledger sealed together (w.welc99), no invitations weeks 1-12 (specWeekStart placeholders),
  Triumviratus → Undercard (makeNight wrapper), CITY_CLS99 city classes 40% + Damnatio only via Vulso/auction (genGlad wrapper, GEN99B.dam), soul steal on a kill
  auto-placed (distributeHP 4th arg), eagle/CF offerings earn in no-CF rounds (04/133 edits), tamed beasts move AND attack either order (07-ui S.cmd.attacked),
  tame/lyre pickers show token rounds, tunnel exits with a bright edge, Studio 3D tokens ×0.88 (T99B.t93k), Zora figure image assets/zora99.webp (his TTS model,
  rendered with tools/plans/fix99b/zshot.js on the v0.72 render page). Test `tv99q`; shots tools/plans/fix99b/.
- **v1.0 TAME BONDS (04-rules lureOK100/breakBond100, 02-data card texts; test tv100t):** a bond (n.tamedBy) breaks when the Meat Lure is played on the beast (any live beast except Zora, Commodus, custom humanoids via hum95ally; Tholo still lurable, open question) or an Ursa/Brutum card is drawn (only that bear; any owner's bond; the bear goes aggro on the drawer, CF fallback only when the bear is gone). One log line "🐾 <beast> breaks free of <owner>!"; the CPU lure (06-ai) uses the same helpers.
- **v1.0 CROWD STANDS UP (283-v100stand, last before 08-setup; display only):** on elim / beast + boss / topple / spear / Flavius cheer-laugh-shock / a duel round / waves, spectators rise from the bench (happiest first, 18 ms stagger rank, 1.1-1.9 s) then sit; 12% of delighted 209 bursts stand. Standing = one more 193 sprite91 variant (`o.st` in the key, canvas +16 units head room, body lifted 20 units, legs drawn by a paint91 wrapper; `o.nosh` skips the seat shadow); gated by cheer92OK (hidden, idle92, Reduce motion, anim off, sims, Fast), own 700 ms tick, one redraw only when a pose changed. Kill switch localStorage flavius_stand100off=1. Test `tv100s`; shots tools/plans/stand100/.
- **v1.0 FRAME METER (288-v100fps, last before 08-setup; display only):** Settings → General → Performance "Show frame meter" (`SETTINGS.fps100`, default off; row added by a `set98General` wrapper, `applySettings` wrapper runs `fps100Sync`). On = corner overlay `#fps100` (bl/br/tl/tr, ⇱ in the expanded view, localStorage flavius_fps100pos): fps over 1 s, slowest frame of 5 s, share of frames >16.7 / >33 ms, 60-frame sparkline, green >=55 · amber 30-54 · red <30; click expands to the measured screen (`fps100Screen`) + top 3 `LAYERS93.report()` layers. rAF timestamps only (`F100`), loop stops when hidden or off (no loop, no element when off); it keeps the page awake while shown (tooltip says so; idle92 still pauses CSS animations). Test `tv100fps`, shots tools/plans/fps100/.
- **v1.0 3D GEAR (276-v100gear + tools/art/rig92, his look100 rounds 2–8 + pick c):** rig92 = the promoted look-test body/gear/rig + sculpt.js
  (SDF sculpts, build time only) + gear8.js (decode/skin/mirror/merge the bake, one mesh + one outline, sculpted belts hide the harness belt) +
  hold.js (his card weapons in the fist, sword 15° straight wrist, armed stand `api.standFor`, scutum round 8 + `api.shieldCheck`). Printed pieces
  are sculpted ONCE by `node tools/art/rig92/mkgear.js` → assets/gear100.js (window.GEAR100, meshoptimizer-simplified + coded, ~300 KB; full detail
  would be 5.2 MB), loaded on demand by a t93Load wrapper; re-run it after editing body/rig/sculpt/gear8 (tv100g checks the source hash), then
  mkgame.js. T93_VER 2 (one re-convert), board size = TW·MINI_BASE/(25.4·MINI_PXMM) (272's ×0.88 retired), loincloth per printed class (CLOTH100). Test tv100g.
  FOLLOW-UP (his 1a 2a 3a 4a): the BODY's core (body.js coreSteps: mesh, skin weights, face paint, crease ink, harness points) is pre-baked
  too by mkgear.js → assets/body100.js (window.BODY100, meshopt-simplified 292k → 60k tris with paint/group edges locked, ~330 KB; `--btris`,
  `--bfull`, `--nobody`; gear8.js loadBody8; game.js falls back to the on-device build when missing/stale); 276 g100Load loads both. Bow STRING
  (hold.js bowString, rebuilt each render; the bow turned so its limbs curve back to the archer). BEST FIT (game.js reach/fitTile): base stays
  0.8 tile; a figure (net included) reaching past its tile column / lowest corner in any of the 8 facings is scaled down inside the render;
  spears + tridents stand upright in the armed stand (stands ≥ 0.75 for every class; thrust/lunge with long shafts shrink to ~0.45).
  tv100g checks every class kit + max load × 24 presets × 8 facings. Tools: tools/plans/gear100/{fitscan,bowprobe,shots}.js + shots.
- **v1.0 MANAGER WORLD TABS (290-v100world, his W1–W9 all a; mock tools/plans/mock100/world.html, shots tools/plans/world100/):** ONE shell for the
  five World tabs (news, league, imp, trophy, sched): a final mgrHTML wrapper swaps 95's banner for `wd100Banner` (keeps `.roomhd.b73.b73-<k>` +
  `.roomttl`; League keeps 231's `.lp96pod` podium in it) and puts the tab's new view in #mgrPane. NO FOLDS (his 1c, 2026-10-11): the old content's useful parts moved INTO the views with their handlers/ids
  intact — League's full ledger = the house card's "Ledger" (`wd100Ledger`: roster, fame, treasury, morale, rivals, heat, all-time, bets, personality, latest
  event, prize now; prizes on a row's hover), Season's Billing (`#cm_<abs>` + cm_set/cm_undo) + Invitations (iv_open = 231's popup, iv_withdraw) = "Billing" /
  "Invitations" under the Calendar lists (a finished week's Acta card = one line `.sact96` in Your Acta), Imperium's layers = four chips `[data-wd100lay]` on
  the new map (`wd100LayerSVG` runs 18-world's drawing with them) + "The city file" (`#standsHubBody.wd100file`: empire strip, city tile / roster, family
  ties; a standsHubHTML wrapper keeps it on crowd refreshes), News: every notice on the wall (Show all) + the Ludus Archives (archiveHTML) under it. The old
  `.lp96t` / `table.stable2` / `tr.lrowlink` / `svg.impmap` no longer exist in the Manager — tests read `.wd100r`, `.wd100led`, `.wd100bill`, `.wd100lay`. CSS prefix `wd100` (287 owns `w100`). Shared: `parma100(m,px)`/`scutum100(m)` house insignia (flagURI emblem,
  cached), `face100`, `gch100` grade chips, `plq100` bronze plaque, `seg100`, `tituli100Plaque({art,name,sub,won,prog,hint})` (reusable plaque).
  NEWS = Acta pinned (P.darwin, P.rabble, victors from g.recent; 📜 Read it = data-mg="paper") + programmata wall 3 across from w.news + this week's
  world events (tags Ours/Rival/Arena/Empire, filter WD100.nf). LEAGUE = next-prize bar (lp90Next), one-line rows `[data-wd100h]` (parma, Pts, form
  dots from roster g.recent, top gladiator + grade, W-L, rivalry flames) → MGR.lg90 → right-column house card `.wd100hc[data-lg90box]` (🔍 Scout =
  185 lg90HTML in `.lg90row.wd100scout`, ⚔ Challenge = 185 `[data-lg90ch]`, 🏛 Team screen). IMPERIUM = map.jpg + 12 pins `[data-wd100c]` (host,
  home, closed, event/weather badges, fans glow from CROWD_CACHE) + floating city card (AR91MAT stone, CITY94/SPEC94 stalls, TEMPLE76 gods,
  CITY_CLS99, worldImpact news, next games art); 🏛 Walk the square = data-ct="square" ONLY when citySquareGate is null; no Plan a trip (his call);
  phones: the card drops under the map. TROPHIES = Tituli plaques (trophySVG art, never emoji; progress from season tallies g.ss, HIDDEN before week 12 for the season/fun awards ("awarded at season's end");
  the BANNER shows only earned trophies — cups first (`wd100TroBest`), none = 4 empty plinths + "Your first honour awaits", all = laurel ring "ALL n"; filters Manager ·
  Play Now (Store hallTrophies) · Online (ONL82.dg.trophies, art mapped TIT100_ONL)); the glass case stays under it. SEASON = 12 DARK tablets + Final
  on the light parchment, current week gold ring + THIS WEEK (scrolled into view), switcher This season · Next · The one after (seasonSchedule; TBA),
  listed schedule = dark ink on striped near-white rows (AA ≥ 4.5), current row highlighted. The lesson's "rival" step lights the new row/card.
  Display only. Kill switch localStorage flavius_world100off=1. Test `tv100w2`.
- **v1.0 ONLINE TURN FLOW + TIMERS (290-v100tt + 113 edits + the v1.0 section of 111-onlcore + routes.js "v1.0 TURN TIMERS"; PROTOCOL 8; docs/backend.md
  "v1.0 turn timers"; his picks 1a 2b 3a 4a 5b+c 6a 7a 8c, mock tools/plans/mock100/turn.html):** 1a online, a window with ≤1 button, no grid/onOpen and nothing
  clickable in its body is a NOTICE: every client answers it at once (no input), the owner gets a toast. 2b my decision windows dock beside the board
  (`#modal.dock100` over the right column, phones `.sheet100` bottom sheet) with `#dk100` (step dots, clock, "No answer in N s → default", `.def100`
  marked) — same modal() underneath. 3a `#tt100` = the TURN PANEL (top of `.side`; phones a strip above #actions): face in a ring, bar, next, seats
  with rings, "<name> is choosing… <title>" (never the options), the BIG number in the ring in the last 10 s, `#tt100edge` four 6 px red strips at the
  screen edges on my own late turn (never over the board), `tt100Tick` soft two-knock tick each second of my last 5 s (SFX bus). #onlWait hidden while
  the panel shows. TIMERS `ONLC.ttOf100(L)`: Ranked 60 s + 20 s decisions (locked), Custom `L.turnT` Off/30/60/90/120 (host's room select
  `[data-onlrs="turnT"]`, `lobby.set {turnT}`), decisions clocked only with a timer on. SERVER-ORDERED: pages report clocks (`match.clock` turn/end/dec,
  first report wins, server time) and `match.tick` when their estimate passed; the server orders `{k:'dto',seat,d}` (lock DEC#d — the answer takes the
  same lock; a late answer → void + `late`) and `{k:'timeout',seat,t,n}` (lock TO#t; late tile/act of that turn carry `tn` → void). Decisions are
  numbered `S.dn100` (in S → snapshots); with clocks on my own answer is applied when its seq comes round (113 pump `ONLM.ownq`/`ownHold`). A timeout is a
  MARK (S.tt100x, p.cpu, `p._tt100`) at a wait point; the CPU finishes THAT turn (`tt100Finish`) at the next settled point; human again at the next
  beginTurn. Another seat's window pauses the turn clock (server `tc100.pz/x`, page mirrors). Two applied timeouts → the others get "Hand to CPU / Wait"
  (`match.vote100`, majority `dropNeed100`) → server `{k:'drop',tt:1,until}` = a mark (`ONLM.left` 'tt100', the CPU plays from that seat's next decision;
  139 reclaim window). Mock: one clock keeper (lowest live human) reports/ticks; test hook localStorage flavius_onltest100='{"t":14,"d":5}'.
  Tests `tonl100tt` (2 windows), server `v100tt.test.js`.
- **v1.0 FREE AGENTS HEAL (17-manager endWeek, his pick a 2026-10-11):** a free agent's surgeon wound never festers — the city physician closes it on its due week (history line); contracted fighters unchanged. Test tv100f.
- **v1.0 CITY SQUARE WARM-UP (279-v100city):** the square opens under a black cover (`#cityFade.hold100`): paint → bake89 → one cityDraw (figure images requested) → wait for decodes (≤ `WARM100.cap` 1.8 s) → priming draw → reveal; walkers get random start phases (Math.random), animals/chatter/beast timers fresh starts; Reduce motion = cover cuts (`cut100`). Root cause: the 600 ms bake ran in the first loop frame and no walker had t0, so all stepped together. Kill switch flavius_city100off=1. Test tv100c.
- **v1.0 FIXES FROM HIS v0.99 TEST NOTES (284-v100fix + small edits; header lists F1-F4, C1-C3; test `tv100x`, shots tools/plans/fix100/):** F1 196 srv91Chip needs #onl on screen and
  the main menu NOT on top. F2 `trainAP100` (05-flow) replaces distributeAP for the Manager start bonus `s.boost.ap` (armored locations only, bare = nothing; a HUMAN places it in the distribute dialog — `DIST100.only` (284) = the armored locations, 199's distModal disables the rest with "No armor here" (212's body-pick follows); CPUs/sims/headless auto-place lowest AP first; test tv100x F2e).
  F3 bed patients (`inBed76`) never train: `yard92Lock` → "🛏 In bed", thResolve drops their plan/y92/spar pairs, ord87Apply skips, old yard buttons refuse (capture guard),
  17-manager regime lists them "sat out — in bed". F4 the Focus! card already picks the location in a popup without a roll (chooseLocation 'card'); doAttack now spends no
  movement for a Focus act while `player.focusNext` is declared. C1 League standings Points column + ⓘ (`LP100_TIP` in 231). C2 Trials card compact (CSS in 284). C3 Acta
  "RABBLE-ROUSERS OF THE WEEK": per-spectator tallies `s.t100` {st,off,sur} (16-crowd), `rab100Snap` (mgrAfterWatch wrapper → `w.rab100[week]`, SAVE_MIGRATIONS '1.00'),
  `rab100List` fills unwatched weeks from CROWD_CACHE / hash-generated people (never the dice RNG), composeWeekPaper adds `P.rabble`, paperHTML prints it under the Darwinius awards.
- **v1.0 WHO'S ONLINE (287-v100who + the "v1.0 WHO'S ONLINE" section of 111-onlcore + its block in server/src/routes.js; docs/backend.md "Who's online"; his picks
  1c 2b 3a, no protocol bump):** route `here.list {status?,region?,sort?,cursor?}` → `{rows,n,next,at}` (≤ `WHO100.MAX` 200 rows / ≤ 60 KB a page; 200 rows ≈ 29 KB) from
  ONE presence query (`here()`, GSI1 'ON') + the rooms list — rows `{id,ln,g,rk,dn,dom,dr,rg,st idle|room|fight|watch,rm,m,ni,fo,me,hid}` (`whoRow100`); the house tier rides
  on the account (`ACCT dr100`, set on hello / domus.get), watching = `ACCT w100 {id,at}` (match.watch / unwatch wrappers). Hidden lanistas (priv89.hide), guests and bots
  never listed; guests may read it (no Invite/Follow); my row first ("you", "you · hidden"). Page: the landing has NO panel any more (his 2026-10-11 answers) — the list lives only in the Lobby Browser strip
  ⚔ Rooms | 👥 Online now (`WHO100.lb`) → `#who100t` with Status / Region / Sort filters + Show more (cursor); localStorage flavius_onlwho100. Row: Domus-rank banner
  (dr98URI), status dot, lanista name (→ house card), "you", region flag (rg98Flag), gladiator + rank chip; ✉ Invite (only while I host a waiting room; disabled with the
  reason for fighting / in a room / no invitations), 👁 Watch (onlWatch), 🏛 house card (hc98Open), ★/☆ Follow (ONL83.follow). Poll: a REAL 5 s timer that asks only when
  a panel shows, the tab is visible, not idle92, and 30 s passed (`ONLC.WHO100.POLL_MS`); lists patched in place. Mock `MOCK_ROUTES['here.list']`.  Kill switch localStorage
  flavius_who100off=1. Tests tonl100w (mock, 3 windows), server/test/v100w.test.js.
  FOLLOW-UP (his answers 2026-10-11): PER-GLADIATOR status — `st` = the lanista's CURRENT activity; a gladiator of his still fighting in a Custom match he abandoned
  (a CPU holds the seat) rides as `ab {m,g}` (row chip `.w100ab` "⚔ <gladiator> still fighting" + 👁 Watch on that match). Server: `match.abandon` wrapper marks
  `ACCT.ab100 {m,at}` (abandon clears the live flag `A.match`); `here.list` reads `MATCH#<m>/META` ONLY for rows whose ab100 match is still live (cached `AB_TTL` 10 s per
  match, ≤ `AB_READS` 20 reads a request; a reclaim clears `M.abandoned[acct]` → mark gone; Ranked abandons are a recorded Fate → never marked); shared `whoMaps100`
  (`fightAll`, `gname`) / `whoStatus100(A,maps,ab)` / `whoAb100` / `whoRow100(…,{ab})`. LANDING (a100, final onlPlayHTML + v85ShowHTML wrappers in 287): ★ Followed houses
  card, its Find box and the 📜 Acta box are GONE from the landing; grid = stage + playlists | ONE right column `.a100-right` (This week + 🏆/🪦 boxes, acta lines merged:
  winner box = the day's results, loser box = bouts where someone fell, each line opens the day's list) at ≥1100 px, tablets stack, phones one column; fits ≥1300×900.
  Profile & Settings → Find (name OR FID: `l89FindHTML` wrapper + a capture click → `onl89Visit({name})`) already lists the followed houses (252 `pr98Follows`). Also 146's
  tall-showcase media block is scoped to `:not(.l100)`. A lanista with no house/gladiator yet shows only in the tab. Tests tonl100w (+ landing fit, merged boxes,
  Profile find/follow, abandoned-but-fighting row), server v100w.
- **v1.0 CHEAP PERFORMANCE (288-v100perf, last before 08-setup; display only; tools/plans/perf100/AUDIT.md "After"):** (1) a full-screen window (`#modal.full`: Online/Manager/Studio/Settings) covering `#mainMenu` stops the menu show (`mmLoop` wrapper, clock held in `MM100.at`, resumes where it was) and `body.mm100cov` pauses the menu's CSS animations; (2) the looping glows now animate compositor-only properties: the SAME `@keyframes` names are redefined (later rule wins) as `filter: drop-shadow` pulses over each element's static shadow, the leader/turn dots' halo is a `::before` ring (`pulse` = transform+opacity), chest sheen / grade-A shine / progress stripes are translated layers; NOT converted: flow, glow90, injp (SVG paint), holo84sheen (its ::after is the clip), gift83glow already a filter; a NEW glow must animate opacity/transform/filter, never box-shadow; (3) `bar88Hold` measures in its own ResizeObserver (clean layout), the draw-time call returns once the observer has reported (`BAR100`); fitReserve was already cached by 230's FIT95. Kill switch localStorage flavius_perf100off=1. t12 = ONE on-screen event per shard (naumachia / gauntlet / orpheus) + the rest as headless `simEvent` sims in one page, prints `ERRS [...]` (unfinished/errors fail); fixed sleeps in tb1/tb7/tcity/tres/tseed46/ttoss/tv84/tv87i/tv93k/tonl83u/tonl84 are condition waits (`waitForFunction`, polling 100). Measure: `SECS=6 TAG=_x node tools/plans/perf100/measure.js mgr,event,onlsign,menu` then `node tools/plans/perf100/cmp.js scenes_before.json scenes_x.json`.
- **v1.0 ONLINE SERVER BATCH A (292-v100srvA + the "===== v1.0 SERVER BATCH A =====" section at the end of 111-onlcore + the "v1.0 SERVER BATCH A" block
  at the end of routes.js; docs/backend.md "v1.0 server batch A" incl. the security findings table; no protocol bump):** RANKED = EQUIPPED ONLY (seat.onl.rk →
  giveLoadout skips the class weapons; Custom keeps them; Domus labels "recruit kit · Custom only"). ISSUED KIT = market.kit 'daily': `issueList100(cls)` = DAILY92
  padding + `ISSUE_W100` Level 1 class weapons (stand-ins for L2), once an online day a house, ONE set a house (`issueElsewhere100`: the claim takes back the house's
  other Issued pieces), armor on bare points, weapons only for empty hands; worth 0 everywhere (usedPrice/repairCost 0, the dead's Issued left-at-home pieces vanish).
  WAGERS CLOSED (`betOK` → `WAGER_OFF100`, bet.place code `wager_off`; no Wagers tab/buttons/bubbles online; old bets still settle). RESULTS FOR EVERY PLAYER: the
  online results window opens with `#onr100` "Your match" (outcome, coin to the treasury / "Custom bout — no coin is paid", lifetime CF, Glory, every seat + Fate;
  waits for the settlement, the settlement toasts land in it). DOMUS SLOTS (`SLOT100`: start 1; slot 2 = 150 Glory + 200 coin, 3 = 600 + 500, 4 = 1500 + 1000; Glory =
  the house's best Domus-rank score dr98; `D.slots100`, a house without it gets one slot per LIVING gladiator on first touch (min 1, stored once); route domus.slot in IDEM93; the coin 5th slot is REMOVED (max 4; a house that already built it keeps it); locked
  `.gc89.sl100` cards). WATCHERS (hereSummary `watch`; Who's online ticket holders = watch/room). TAUNTS (QC lions/senate/garum, tickle/granny/yawn/sandal, bigger).
  SECURITY: fighters-only strikes (match.odd), no self-ending your turn clock, far-ahead turn reports need 2 lanistas (`TURN_JUMP100`), ids/chars short strings
  (`bad_req`), domus.equip living + own house. Older test suites that need four gladiators set `C.SLOT100.start=4` / `ONLC.SLOT100.start=4`. Tests tonl100a, server v100a.
- **v1.0 SERVER BATCH B (293-v100srvB + the "v1.0 SERVER BATCH B" section of 111-onlcore + its block in routes.js; docs/backend.md "v1.0 server batch B"; NO
  protocol bump):** RANKED: hidden Elo per gladiator (`ELO#<char>`, server only; `ELO100` K 40→24, window 150) — Find me a fight prefers close ratings (groupOf
  wrapper keyed by `qp100`, `eloPrefer100`, never stalls); queue estimate (`QETA#`, `eta100`, `lobby.quick` reply `eta100`, route `queue.eta`, `.eta100` chip in the room
  head via an r96Layout wrapper); Ranked non-team seats dealt at random at the horns (`C.startRoom` wrapper, server rnd `C.seatRnd100`, bets follow; `C.SEAT_RND100=false`
  off — routes.test.js); Ranked WATCHERS ONE TURN BEHIND (`META.wd100` + `rel100`, released at the next turn clock / the end; match.get filtered; no snapshots —
  `ranked_delay`; mock: the page holds pushes until `match.rel100`; chip `#rw100`); LEAVERS `ACCT.lv100` (Ranked abandon / drop / 2 timeouts once a match) →
  `LEAVE100` 3 in 7 d = house-card "Often leaves", 3 in 24 h = no Ranked 15 min (`ranked_cd`); CONNECTION DOTS `match.conn100` → `.cd100` in #tt100 rows (15 s real
  timer); SEASON board `season.board` (SEASON#/G#, WORLD STOP#, Tituli `SEASON100.TITULI` once → `D.tit100`, house card) = rail tab 🏆 Season; REPORT `match.report100`
  (REPORT#, GSI1 'REPORTS', once a match, 10 a day, no penalty) from 🚩 in #tt100 + the summary; AFTER-MATCH SUMMARY `#as100` (onlSettled wrapper; 🔗 `#replay=<id>` —
  "replays are coming soon" popup; ⚔ Again; 🚩). SIDELINING: `match.clock` kinds `own` (the owner's report restarts his clock, ≤ 10 s) and `fx` (reveal credit
  chest/spawn/market 900 ms, ≤ 5 s a turn); online: nc82Ms ×0.4 fixed, no clean-up show, CPU crowd never spends (only ticket holders, group turn); Tactics 🌐 Online
  page. SPECTATE → Lobby Browser sub-tabs ⚔ Rooms · 👁 Live matches (`data-b100tab`, reuses onlSpectHTML) · 👥 Online now. Kill switch flavius_srvb100off=1. Tests tonl100b, server v100b.
- **v1.0 CITY SQUARE WARM-UP (279-v100city):** the square opens under a black cover (`#cityFade.hold100`): paint → bake89 → one cityDraw (figure images requested) → wait for decodes (≤ `WARM100.cap` 1.8 s) → priming draw → reveal; walkers get random start phases (Math.random), animals/chatter/beast timers fresh starts; Reduce motion = cover cuts (`cut100`). Root cause: the 600 ms bake ran in the first loop frame and no walker had t0, so all stepped together. Kill switch flavius_city100off=1. Test tv100c. CALM (280-v100citycalm): under Reduce motion / Animations Off (`city100Calm()`, read every frame) the crowd stands still (no wander, glides = jumps incl. yours, no animal/water/flag motion, no chatter, no beast parade; your own walk still runs); and the crowd is ambient only — `cityAt` no longer hit-tests figures (no hover/click); their actions live in the sidebar (People list `data-cbar89reg`, Arena tab `data-cw89` gladiators, Auction tab).
- **Guide data:** `SIM50` in 53-guide50 is regenerated by `node tools/simguide.js flavius-arena.html 600` (SIMVER env);
  it includes `perk` (wins by rating perk), charted by 69-v56.
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
- **While building a batch: `node tools/smartreg.js`** — runs only what the edits can reach: tests whose executed functions
  changed (V8 function coverage via tools/regcov.js, matched to TypeScript-parser function boundaries, compared by text hash),
  or whose files' top-level code changed (or that ran a function a changed file reassigns), plus new/edited tests, tests
  warming up (< 5 passes), flaky ones, and a 5% rotation of the idle rest. A failure is re-run alone (pass → reported FLAKY,
  never hidden); a real failure pulls in its idle domain. It tests a snapshot (`.regpage.html`), so you can keep building.
  `--dry` prints the plan; `--full` runs everything (and refreshes the maps). State is committed: tools/regstate.json,
  tools/regmap.json — commit them with the release. A batch that wraps core functions still selects nearly everything;
  that is correct, not a bug.
- **ONE FULL RUN AT A TIME (v0.88):** agents never run the full suite or `smartreg` without names — only the tests they touch
  (`node tools/smartreg.js <names>`). The full suite runs once, by the lead, at release. (v0.88: three agents' full runs + the release on 4 cores = load 60, everything 3–5× slower and flaky.)
- **Releases always run the full suite** (tools/release.sh does it). Old runner: `(nohup sh tools/runreg.sh >/dev/null 2>&1 &)`
  then watch `tools/reg.txt` for `ALLDONE` (~30 min: 4 tests at once, `-j N`; v0.88 measured `smartreg --full`: -j 4 = 29 min, -j 3 = 36 min). smartreg keeps ONE Chromium per worker (launchServer → `REGWS`; regcov.js turns a plain `chromium.launch()` into a connect, a launch with options still launches; re-runs of failures use their own browser; `REGSHARE=0` = off). Tests wait for `window.FLAVIUS_READY` (164-ready: menu or first window up + boot loaders done) after `goto`, not a fixed 2 s.
  Pass = every block ends `exit=0` and prints `ERRS []`. Run a subset: `node tools/smartreg.js tv53 tpia`. (v0.76: 138 tests.)
- `t12` plays every event via sims (slow); the suite runs it as three parallel shards `t12a/b/c` (`SHARDS` in t12.js, balanced by event time, every event exactly once); `t12` by name still runs them all. Version tests: `tv50…tv54`-style files (`tv52`, `tv53`), plus feature tests
  (`tcls` classes, `tlook` accessories, `tbye` bye weeks, `temp53` closures, `t53s` studio, `tres` results,
  `tmgr54` manager, `tpia` piacula, `t54a` studio/event designer, `tv55` ratings/letters/loans/home/grades,
  `tstat55` Studio ratings and allies, `tv56` mail and ratings help, `tv57` the v0.57 batch, `tv58` ships/prototype, `tv59` the v0.59 batch, `tv60` Road from the record + Annals loop, `tv60b` tame/counters/CF offerings/truces, `tv61` screens, `tv62` five minds, `tv63` the v0.63 batch, `tv64` missios/chariot tokens, `tv65` yard/fatigue/infirmary, `tv66` bumpers/phones, `tv67` recruiting board, `tv68` checklist/ledger/economy/rivals/stands tabs/armor on the avatar, `tv69` armor designer/equip points/fit tool, `tv70` baked fits/left-side fitting/code word, `tv71` printed pieces/coin/summa rudis/round marker/log pin/wager bubbles, `tv72` set cards/merged fit/system weapons/3D minis, `tv73` the v0.73 batch, `tv74` printed set/class cards/manager hours/recruiting, `tv75` the v0.75 batch, `tv76` the v0.76 batch, `tv77` the Studio tidy).
- When a UI move breaks an old test intentionally, update the test (keep its intent).
- Visual checks: write a short Playwright script, screenshot, and look at it.

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
  Releases are no longer published as claude.ai artifacts (his 3A, 2026-10-07).

## 6. Release workflow
**HIS DEPLOY IS ALWAYS THE SAME (v0.88):** release.sh step 6 writes share/deploy/flavius-site-update-vX.zip (play/ page + version.json +
advert shot + ALL assets + flavius.sh) and flavius-download-vX.zip (play/flavius-rule-arena.zip). Send those (+ flavius-server-N.zip when the
server changed). He: CloudShell → Actions → Upload file (all zips) → `bash flavius.sh release` → y. The script updates itself from the game zip,
runs server → game → download → site → privacy, clears CloudFront (incl. /play/assets/*), files used zips in ~/flavius-done and prints status.
NEVER give him console click-through steps for a release again — fix flavius.sh / release.sh instead. Each zip must stay ≤30 MiB (step 6 warns).
**FROM v0.92: RELEASES DEPLOY STRAIGHT FROM GITHUB (his pick 2026-10-06).** `bash flavius.sh release [X.YY]` with no zips in his home folder →
cmd_gitrelease: GitHub token (fine-grained, read-only Contents on dsoto1/arena; asked once hidden → ~/.flavius.conf GH_TOKEN) → the branch whose
version.json is the highest (or X.YY) → shallow clone to ~/.flavius-src → self-update from tools/deploy/flavius.sh → server only when its code hash
changed (SERVER_HASH in the conf) → page + version.json + assets + tools/deploy/arena_shot.webp → the standalone built there (mkshare) → status.
So a release MUST be committed + pushed (release.sh copies the advert shot to tools/deploy/arena_shot.webp). v0.91 still ships zips once (its game
zip carries the new flavius.sh); zips stay the fallback (if any are uploaded, release uses them).

(tools/release.sh also takes the play.html advert shot → share/arena_shot.webp → the game zip's play/arena_shot.webp, and always builds the
share copy — the site download play/flavius-rule-arena.zip.)
1. Bump the badge in `src/01-head.html` (`arena · vX.YY`) — this sets `GAME_VER`.
2. Add a `MILESTONES` entry at the top of `src/34-notes.js` (`hi` = new features, `fx` = fixes/changes; keep it short).
3. Add a `SAVE_MIGRATIONS` entry if world data changed shape.
4. `sh tools/release.sh X.YY` — build, page hygiene (cheat words, e-mail), FULL regression, share build + smoke test, zip.
   (By hand: `sh build.sh` → full regression → `python3 tools/mkshare.py X.YY` → smoke-test the share build.)
5. Publish to the claude.ai artifact **https://claude.ai/artifact/8LU6eHbPpuznn64JeWZ6We** with the page and all
   assets (label "vX.YY"); check the live version with an Artifact read before publishing. Before publishing, review any new shared-Store writes and make
   sure no cheat word appears in plain text. Send Virgilante the share build file.

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
- **v0.55** five ratings (Speed/Strength/Intelligence/Luck/Charisma) replace class stat abilities; Manager rating
  growth + weekly growth news; Studio rating sliders (375 pool), tamed-ally classes, beast ratings; syndicate loans
  (manual pay, weekly minimum, spear); Consilium letters; home games; medal-ladder grades; folding rail; Match Week
  YOURS/loan tags; pay-to-join only in Ludus/Recruiting; no Hard veteran's edge; Safari/iOS audio unlock + chip.
  (Published as artifact Version 66.)
- **v0.56** the lanista's mail (inbox in Your ludus, actionable offers/invitations, past mail, unread count); ratings in
  the glossary/tooltips/guides/to-do/arena hints; Play Now guide re-run on 600 sims with a wins-by-perk chart;
  rolled Intelligence follows the overall (most CPUs Normal). (Published as artifact Version 67.)
- **v0.57** starting difficulty for new houses; word-houses takeable; shortlist courting chips; loan recall; bye letter;
  save cards with record/treasury; laurels after horns; start marks fade; no beasts after clean-up; no flicker on Save;
  unread-only mail; Match Week colours/tags/wager count/travel gating/end-week buttons; Consilium↔Schooling; one billing;
  sharper art from Virgilante's PDF scans (tools/mkscans.py): fates, chariot cards/tokens, armor, 8 new offering tokens.
  (Published as artifact Version 68.)
- **v0.58** 3x5 Naumachia ships in a pinwheel ring with the printed deck art; hull HP labels, names on hover; arena deck
  (480x704), event cards (480x692) and weapon cards (600x416) from scans; prototype gallery (D.Soto link); clearer
  invitational frequency wording. (Published as artifact Version 69.)
- **v0.59** Rivalry Week (Familia 2v2 vs your top rival, byes 4 & 11); Naumachia and Chariot Racing to the rulebook; Credits
  page; Zora's mini; repainted event cards; menu mute; no menu/arena flashes; turn sweep; 'David' → 'Virgilante'.  (Published as artifact Version 70; update with random Naumachia first team + draft wording = Version 71.)
- **v0.60** Road from the gladiator's record (any living gladiator), Hall Road box without the dropdown, Annals loop fixed,
  smooth window hand-offs; tame card face, tamed beasts without aggro, rulebook counters, CF offerings fall, truce marker.
  (Published as artifact Version 72.)
- **v0.61** screen manager (79-screens): one decider for what shows when a window closes; parallel regression (~11 min).
  (Published as artifact Version 73.)
- **v0.62** five minds: Intelligence tiers with measured skills (Master: dodge, routing, merchant, Focus-to-kill); tier chip + seat picker.
  (Published as artifact Version 74.)
- **v0.63** training hours + Training Yard layout; rail to-do borders; free-agent list fills the column; lanista cities = 12 arenas;
  accessibility (reduce motion, colour-blind palette, text size); Event Designer guided steps; ratings in the panel header;
  CPU labels name the mind; share build ~25 MB; smart regression + release script. (Published as artifact Version 75.)
- **v0.64** missios by the rulebook (no-CF events, Missio failed, fallen, no sim, roster picker); chariot tokens; seeded crowd.
  (Published as artifact Version 76.)
- **v0.65** training-hours cards with previews; fatigue + rest weeks; Infirmary treatment plans + timeline; regime first; rail hours + soft outlines.
  (Published as artifact Version 77.)
- **v0.66** tutorial bumpers; phones in landscape (drawers, dock, auto actions); follow camera + pinch zoom; portrait hint.
  (Published as artifact Version 78.)
- **v0.67** recruiting board + Fit/Odds/filters + 3-step card with offer meter; void wagers; Ludus Flavius switch; pool-first fillers; yard row.
  (Published as artifact Version 79.)
- **v0.68** printed armor worn on the avatar (rulebook placement and scale, dims/cracks, falls at 0, editors' Fit mode); arena right
  column tabs Fighter · Field · Stands + crowd ticker, Menagerie → Bestiary; Manager weekly checklist + money ledger, economy
  levers, rivals that train; brain colours, one Juggernaut, Road button in the record row. (Published as artifact Version 80.)
- **v0.69** armor designer (mock-up under the piece, required equip point, free placement relative to it, single/pair limbs); open
  printed-set fit tool saved in the game data (to bake + remove later); gold Flavius' Bracers; sculpted set follows the setting;
  phones: match controls hidden under menu/windows; tablets: measured arena fit. (Published as artifact Version 81.)
- **v0.70** Virgilante's armor fits baked in; fit tool behind ARMORFIT with Right/Left fitting; legs mirror one art; turning
  mirrors; Provocator Manica lower arm; Leather Upper Leg Armor; studio avatars lower. (Published as artifact Version 82.)
- **v0.71** Virgilante's printed pieces: medallion tokens, gold coin, summa rudis medallions, Mandata card back + spelling, round
  marker, stands line pinned in the log, live wager bubbles, sharper tunnels; old-save question as its own window. (Published as artifact Version 83.)
- **v0.72** 3D minis token style (his TTS minis + pillar); new avatar art; round-2 armor fits; shared system-set cards in every designer
  (weapons included); armor art toggle keeps the system set; fit tool inside the armor designer; custom pairs fit per side. (Published as artifact Version 84.)
- **v0.73** Sica's Syndicate house; Manager banners + rail counts; armor levels; avatar hover/flash/try-on; phones portrait + bottom tabs;
  recruiting plan/compare/signing card; mini facings; Start from fix; Summa Rudis on ⓘ; Crocodile medallion. (Published as artifact Version 85.)
- **v0.74** his class cards (printed) + live custom class card; his drawn armor set + names + new pieces + pair thumbnails; classes to
  his cards; Veteranus coin-or-CF debts; yard one-hour jobs, infirmary body + baths, recruiting choices with advisor; dismissable tasks,
  per-tab checks, week strip, banner boxes; lingering pop-up fix. (Published as artifact Version 86.)
- **v0.75** the market to the rulebook on his board; Play Now redesign; one-row arena bar with the event pop-up and the turn panel; minis
  replace standees, shorter textured pillar; his weapon icons, Ornate Chest, single greave; one crowd count (13K). (Published as artifact Version 87;
  follow-up with card backs, chest flip, city Match Week banners, icon weapon chips, no skip-menu = Version 88.)
- **v0.76** save hub (▶ Continue + 📜 Saves); Play Now roster chip + seat cards; road lock, sit a week out, infirmary beds; Training Yard
  as fighter cards; Infirmary as a ward; the beast pen; road events, medicus, temple, kitchen/shrine, clauses, Darling, rival letters;
  round rules in the turn panel's ⓘ. (Published as artifact Version 89; his site files page got a one-file "Update to v0.76" button.)
- **v0.77** the Creator Studio tidied (roster sets as a deck builder, counts, first-make tiles, name pins, grouped spectators,
  invitational steps), level 4 chest weapons, one armor level, printed pieces as examples, printed class cards; delete asks first;
  update notice + newer-save guard; menu: Saves beside Settings, no LAN/Continue; Online preview behind LOBBY77 with the AWS stack
  deployed (us-east-1). (Published as artifact Version 90; site update = play/index.html + play/version.json.)
- **v0.78** Online: free live watching, tickets with your own stands turns (coin into the wager pot), parties by code, Familia 2 v 2 with
  your party on one team; online protocol 2 (redeploy the server). (Published as artifact Version 91.)
- **v0.79** Online: My Gladiators (3, active, look/token/class/gear), pre-match room with chat + host rules, 2-lanista minimum, Abandon /
  Rejoin / the online bar, cleanup of dead games, login.flaviusrule.com; menu: version notes, C for words, two-button Multiplayer.
  (Published as artifact Version 92; server zip flavius-server-7.)
- **v0.80** Online rooms (sit/stand, host hand-off, kick, teams), quick chat only, the Praeco (Find me a fight, calls, invites, Again),
  Orbis Terrarum + the Forum, Today in the arena, ⚔ Back to your match / 🚪 Abandon on the main menu with the gladiator at stake; online
  rules (printed gear, no offline records, Ranked no hints, no pause, majority resync); hot-seat leak + ghost record + boot cover fixes.
  (Published as artifact Version 93; server zip flavius-server-8, protocol 4 — deploy the server FIRST; site update zip v0.80 +
  privacy page.) Release run: 149/151 — t12 passes alone in 432 s (over the runner's 400 s limit), tonl80r flaky under load.
- **v0.81** fair drafts (fit-only, 2 per row, Juggernaut from the real deck), pillar offerings by the rules + log, steady turn bar; his
  sharper armor + 12 fits + Thracian Helm + Forged Chest Veteranus + V pair cards + token rounds + wood stands; online results sent at the
  bout's end (resent), no stale matches, invites die with rooms, wheat CF, new landing, playlists scroll; ratings always shown, phone cards
  scaled. (Published as artifact Version 94; no server change; game zip flavius-site-update-v0.81 + site zip flavius-site-v0.81.)
  Release run: 151/151 (tlive flaky once; tv73 updated for the always-on ratings).
- **v0.82** Domus (house, record, Storeroom, patron), Glory rank bar with living counts, smaller pay at 2-human tables, guests may watch,
  free tickets + guest pass, stands group turn online, spear refunds + Flavius's scowl + a Mandate for the spearer, beast cards with
  their backs, custom beasts in the arena deck (Tholo + 3 slots, unique tick), sculpted online tokens, Tholo's new token, Hero height,
  tidier main menu, pillar shadows, iron spikes, pieces face their target. his beast stats sides, sharper Level 4 back,
  landscape chest card + gold chest button, 2 spiders, smaller Flavius on phones, phones sideways keep the board clear on your move; release
  makes the play.html advert shot. (Published as artifact Version 95, + hold-the-version-badge words of power on touch = Version 96; server zip flavius-server-9, protocol 5 — full stack deploy FIRST;
  game zip flavius-site-update-v0.82 carries the v0.81 art too + play/arena_shot.webp; site zip v0.82 points play.html at it.)
  Release run: 150/151 + tv64 flaky (passed alone); late fixes covered by tv66/tv71/tv82b/tv53/tv75.

- **v0.83** Online treasures (8 ranks, treasury, offerings, broken gear + repair + loot, house gifts, named weapons, Ludi Infames,
  countdown, trophies, profiles + follow, Wagers, tester grants); Manager council with faces; sticking arrows/bolts (turning on minis,
  Tholo eye-bolt); 3D spike caps, his chest in 3D, 3D pots, sand grain + scars; padding stacks per point; sharp weapon backs.
  (Published as artifact Version 97; server zip flavius-server-10, protocol 6 + Testers parameter — FULL stack deploy FIRST;
  game zip flavius-site-update-v0.83.) Release run: 148/151 + tv64/tv60/tv59 flaky (passed alone).

- **v0.84** named armor + holographic cards, Flavius's Auction, seasons + weekly challenge, seat reclaim, your-turn notices; programmata;
  council letters; blood/dust/rubble; one tab per save; backup nudges; translate-safe; Settings tidy; landing fits; Roster as the barracks wall.
  (Published as artifact Version 98; server zip flavius-server-11, protocol 7 — deploy FIRST; game zip flavius-site-update-v0.84.)
  Release run: 151/151; the 16 tests written since v0.81 were missing from runreg's DEFAULT list — added (13 pass, tv81o/tonl84/tv82o flaky).

- **v0.85** faith (edicts, ad bestias, martyrs); recruiting as a wall of tablets; Match Week bout tracker + walks in the Road box; online landing II
  (playlists grid, biggest winner/loser, Party button, 8 PM New York day); Ave Arena (his Online theme); many fixes from his v0.84 notes. (Published as artifact Version 99; server zip flavius-server-12, no protocol bump —
  deploy it FIRST; game zip flavius-site-update-v0.85.) Release run: 169/172 + tv64/tv82o/tlive flaky (passed alone).

- **v0.86** the game in Spanish (neutral Latin-American, tú): ~11.5k strings, Settings → Language, first-run ask on Spanish browsers,
  online phrases/server messages per player; English untouched. (Published as artifact Version 100; no server change; game zip
  flavius-site-update-v0.86.) Release run: 169/173 + tonl80r/t12/tv82o/tv84p flaky (passed alone).
  The site was missing the v0.81 arm81_*/armthumb81_* art (empty armory tiles online) → flavius-art-v0.86.zip (page + ALL of assets/, ~21 MB,
  no game download). From now on every game zip carries play/assets/ in full (s3 sync uploads only new/changed files); keep it ≤30 MB
  to send (else split: art zip + game zip).

- **v0.87** four more languages (it, pt-BR, fr, de; each its own file, loaded only when picked), plural forms, class card rules side on his
  template, the lanista's hours gone + perk tree + standing orders + Fit for the best few + win rewards, infirmary beds + one chance at
  home, his 20 v0.86 notes (Acta of the day, fallen fighters only watch, wagers tab, gold try-on marks…), coin/wheat + weapon icons everywhere,
  beasts in the Field tab, smoother Safari music, steadier tests. (Published as artifact Version 101; server zip flavius-server-13, no protocol
  bump — deploy it FIRST; site zip flavius-site-update-v0.87 = page + ALL assets incl. lang_*.js; flavius-download-v0.87 = page + the standalone
  play/flavius-rule-arena.zip.) Release run: 179/180, tv84 failed (random free agents made the ★ pick win) → test fixed, 5/5.

- **v0.88** one market board (rolls, picks, drafts), the Domus redesign + Immortalis, Recruiting II, the hot-seat table, Manage between turns,
  grouped Settings, Crowd Favor with pictures, visible trades, results side by side, phones fixed; his new weapon backs + beast cards.
  (Published as artifact Version 102; no server change; site zip flavius-site-update-v0.88 + flavius-download-v0.88.) Release run: 186/188
  (tv59 = a real draft bug, fixed; tarena47 flaky, passed alone).

- **v0.89** your corner at the bottom (board turns to you), the city center as a painted forum + its sidebar, Flavius's painted face (11 moods),
  the market without the d4, the online Domus rebuilt, armor bonuses (stone guard…), lanista names + FID + house visits, rooms that clean up,
  Manage online, the auction's vault, lit sculpted tokens, 日本語; CPUs stop pacing, starting cards leave the deck, Commodus blocks only the unlock.
  (Published as artifact Version 103; server zip flavius-server-15, no protocol bump — deploy it FIRST; site zip flavius-site-update-v0.89 +
  flavius-download-v0.89.) Release run (REGJ=3): 204/205 + tonl80 flaky (passed alone); -j 4 runs tripped online tests under load.

- **v0.90** the infirmary as one ward (HP + fatigue bars, care that says what it does), fatigue that counts in bouts, resting fighters sit
  out, Training Yard previews, League prizes + scouting, temple and Walk the Sand in the city, Tholo and the lions hunt anything alive,
  token-round Blessings, a turning hot-seat board, Play Now tidy + Random event, Version history in tabs, 简体中文.
  (Published as artifact Version 104; no server change; site zip flavius-site-update-v0.90 + flavius-download-v0.90 (29.9 MiB — mkshare
  skips RETIRED weapon_back1-4.webp).) Release run (REGJ=2): 207/209 + tv76 flaky; tv86 fixed (waits for the ask card), rest run by hand.

- **v0.91** the arena rebuilt in stone (banners, towers, drains, blood that trickles, worn sand), night matches, painted sponsors, a sculpted
  crowd, English (Australia) + flags; online: the Donativum, an open printed market, damaged armor + repair, six auction lots, the server
  version on screen, no flicker; elixirs/tokens can be taken back, perk chips on the fighter panel, the chest from Zora, Your ludus tidied.
  Also: all 15 Mandata Flavi = his sharp scans (mandati91.webp, tools/art/mandata91/make.py), printed class hover = his card only, the Editor
  picker (203), beasts counter-attack beasts at once (186), corner towers flat-faced at the sand corners.
  (Published as artifact Version 105; server zip flavius-server-17 — deploy FIRST (flavius.sh release does); game zip flavius-site-update-v0.91
  only: the download outgrew 30 MiB, so flavius.sh builds the standalone in CloudShell from the game zip (it carries tools/mkshare.py).
  The last zip release; from v0.92 flavius.sh deploys from GitHub.) Release run (REGJ=2): 217/222 + 5 re-run green (tests edited mid-run).

- **v0.92** a new Training Yard (fighter cards, sessions, Lock in, the Doctore's drills, Trials), one house treasury + online kits, the performance
  heartbeat + idle mode, pick on the body (Focus / health / armor), severed parts traced from the avatar, cheering crowd, one live Online per account,
  market level tabs + Kits tab, error log + dice check, shaded laurels, rubble that splits lengthwise; fixes (beasts on their target's turn, Attack
  tile reason, Manager music, sit-out square, infirmary fighters don't train). (Published as artifact Version 106; first GITHUB release: `bash
  flavius.sh release` clones the branch; server deploys too (v92t session.replaced). Fallback zip flavius-site-update-v0.92 only — the download
  outgrew 30 MiB.) Release run (REGJ=3): 228/234 + 4 flaky (passed alone) + tv91r (passed alone) + tonl84 (date bug in the TEST: on a week's last
  day the lots outlive the week, so last week's six show beside the new six — the test now runs mid-week). Laurels + rubble landed after the
  snapshot: covered by ttoss / tv91w.

- **v0.93** 3D tokens you pose yourself (token modeller in the Character designer, auto-converted characters, three.js on demand), keyboard play +
  screen-reader summary + focus handling + contrast (30 → 1 below AA), the Manager lesson teaches the new Training Yard, event bus + layer manager
  (pixel-identical), online hardening (a request id per paying route, a rate limit, codes + values for server texts, no raw errors, refs), pseudoloc +
  key checks, docs/. (Published as artifact Version 107; server changes — `bash flavius.sh release` deploys it from GitHub.) Release run (REGJ=3):
  236/239 + tonl83u/tv91n flaky (passed alone) + tv87l (Italian walk counted the new screen-reader text as leftover English — the walker now skips
  .sr93; 5 languages green).

- **v0.94** the Event Designer as the arena (palette, round strip, checks, Undo/Redo, ▶ Test play), the Manager Armory (owned gear, Roster
  dressing like the Domus, City Square stalls per city/week, repairs ⅕, sell-back 30% ≤3/week, market buys not kept), online 3D tokens as
  server pictures (Safari via libwebp WebAssembly). (Published as artifact Version 108; server changes — `bash flavius.sh release` deploys it
  from GitHub.) Release run (REGJ=3): 238/242 + tonl78/tonl83u/tv86/tv91n flaky (passed alone); the armory tuning landed after the run:
  tv94m tcity tv89y tv87x tv93t tv85f tv86 green (tv94m flaky once under smartreg, 3/3 alone). mgrsim 20 runs: player treasury −15% vs
  gear off, wins −0.7, rivals healthy, shelves ~37.

- **v0.95** stabilization: team rings, numbers above bubbles, Focus dice art, key tokens, Bestiary tab; Studio fixes (Find, live card, legs layout,
  fit tool sides, shields ≤4 icons, sculptor locks/snaps, ratings panel, Your characters in Play Now); Manager (3 starters per bout, Armory tab,
  hurt fighters' gear to the shelf, From your Doctores, stale trade offers withdrawn); performance (panels patched in place, cut-out images, Fast
  extras off, speed at once); language sweep (~50 places matched English text — translated pages kept old layouts; Thumb-of-Flavius spares not
  counted alive in other languages). FIRST RELEASE TESTED ON GITHUB ACTIONS: full run 244/244 + 3 flaky (tv91n t12b tv65). No server change.

- **v0.96** a clearer turn: the compact action bar (phase rail in the phase colours, grouped actions, board previews on hover, unused moves,
  done-phase tips, turn owner + next, key hints, hint glow, phones swipe row); every attack logged (the silent head shots: full misses never
  logged, an aim window after a miss, a closed Focus window aimed at nothing); belts under thigh armor, Leather Tasset alone on the upper leg
  (server rule too), stone cap 3, Fast skips frames, weapon counters, Carmina window, no pinned stands line; Manager standings podium, Acta per
  week in the Season tab, trait cards, Road box, invitational picker, anvil Armory + damaged card, warnings for this week only; online room
  2×4 seats + bubbles under tokens, crier only on the host's click, lobby filters + refresh, reload straight back into a live match, no Domus
  loadouts; invitations to a just-created room no longer dropped. GitHub full run: 249/249 + tv87l/tv91n flaky (first run caught tv81o =
  the invitation bug, tonlws80 = test expected the old crier). Server changed (111 armPlace) — flavius.sh release deploys it.

- **v0.97** smoother and tidier (no server change, his split 2026-10-08): Fast frame-paced + cached tiles + steady seams (235), deals (236: one
  trade/truce offer per player per turn, accepted banner, chest pickup costs 1 movement — digital rule, No-CF reasons + chips), online Domus tidy
  (237), clean-up show crew rendered with rig92 (238), auction cards (239), Lobby Browser host pulse (240), only-doable end-week tasks (241), banner
  bout tracker (242), Armory banner (243), Walk the city square on the banner + one road strip (244), 10% weekly chance of +0.2 to another rating
  (245); counters only on the card badge, Leather Tasset pair mirrored, road "you paid N for the trip".

- **v0.98** everything together: Settings full screen + Tactics (Quick Reference) + sandstone menu (246); Play Now upper-right group, Studio designer
  tabs, class card weapons, athletic poser (247); action bar v2 Move · Attack · Forum + Focus digital rule ≥3 movement + Blessings pot rule B (248);
  Recruiting III + advisor levels (coin to 2, levels 3–5 earned; rivals build councils) (249/256); bear cards name the arena's bears (250); catch-up
  bar, Vulso 2 of 3, podium in the League banner (251/255); online passwords/regions/house card/Domus rank/Golden Eagle Custom/Damnatio at creation/
  bonus renames/Profile regroup (252, server); Domus layout + offerings cap 2 (253, server); online Fast desync fixed (254); custom gear joins drafts
  (257); chariot horses: pool of 12 two-horse tokens, drawn per race, visible flip, his sharper art (258); regression fixes (259). Ludus stays off
  online until a real per-lanista draft exists (backlog). Server changed — flavius.sh release deploys it. GitHub full run: 258/259 + tv91n (flaky, passed alone) + 3 flaky.

- **v0.99** one face, one desk (no server change): every human face through one painterly painter + shapeable features (263/268), the Lanista's
  desk (270), twelve arena themes on by default, zoomed play steady (260), Character + Lanista designers on one frame (262), Event Designer test play
  seats all starts, pick your fighter in a live Manager bout, fixes from his V99 notes (271) and fix4 (272: issued kits, damaged armor shelved, Armory
  selling, compact Match Week, welcome scroll, city classes, tamed beasts move+attack, eagle CF in no-CF rounds, new Zora figure).
  GitHub full run #20: green (first run #19 caught 9 tests still expecting pre-v0.99 screens — tests updated, no game change).

## 8. Next steps / open items
- Next for the class cards: Virgilante sends the BLANK card template + each class's figure (+ mini photos, city badge, fonts) → the
  8 printed classes move to the live template (104-cards74 classCard74) so rule changes update their cards. Art NOT drawn yet (optional,
  his call; checked 2026-10-04): Chest Armor (chestarm81) + Reinforced Arm Armor (rarmarm81) — hidden data until they have art. Floor Spikes
  medallion DONE (v0.83, 134-v83spikes; recipe tools/art/spikes83/make.py from his Spiders/Water/Key medallions). The Iron Spaulder IS the Manica (his word, 2026-10-04) — same piece, same art, no separate art needed. Thracian Helm + Ornate Chest are DONE (his art).
- **v0.81 art (his, intake in tools/art/armor81/, not wired yet):** higher-resolution art for 8 existing pieces (Reinforced Chest Armor,
  Steel Helm, Flavius' Greaves, Iron Spaulder/Manica shoulder, Flavius' Bracers, Leather Greaves, Helm of Flavius, Hoplomachus Helm) + the NEW
  Thracian Helm (his TTS list: L2 · head · 4 AP) — decided: the HERO starts with it (instead of the Steel Gated Helm, also L2 4 AP).
  His TTS armor list (L/slot/AP/bonus) is the reference for stats — it also names Chest Armor (L2 chest 4) and Reinforced Arm Armor (L3 lower arm 3).
- **v0.81 token rounds (his, intake in tools/art/ptokens81/, not wired yet):** for each printed class a mosaic side (`<cls>_color.webp`,
  in the class colour — replaces the coloured dots drawn when a player DROPS things in play) and a figure side (`<cls>_figure.webp`);
  `blank_template.webp` (wall + empty banner) and `border_ring.webp` (frame, transparent centre) for CUSTOM classes. Custom mosaic
  APPROVED look (his "that's the look"): recolour his Hero mosaic — green patches → the class colour (keep each cell's light/shade),
  the cross-hatch cells between and the darker cells → muted, darker shades of the same colour (s×0.42, l×0.78), lead lines stay dark,
  then the border on top. Recipe: tools/art/ptokens81/recolor.py (preview in tools/art/ptokens81/custom_preview.png).
- **v0.81 tooling:** smartreg/runreg kill a test at 400 s; t12 needs ~430 s alone → scale the limit by each test's recorded time.
  Rules & Strategy's words-of-power text still says "click the version button" (since v0.79 that opens What's new) → "press C on the main menu".
- **Online decisions (his, for v0.81+):** online CF uses the wheat icon (ICO.wheat) everywhere; the Online ludus = **Domus** — 4 gladiators
  (GLAD_MAX 3→4, server change), each lanista NAMES their house (word-filtered), ONE active gladiator; online gladiators wear SCULPTED tokens
  (the Studio sculpt bench in the online creator; shown to every viewer whatever their token style; CPU seats/beasts keep the viewer's style;
  board token only, no portrait sculpt; existing gladiators auto-converted from their parts). Tokens carry NO weapons/armor except lower padded
  arm or lower padded leg. Hide the sign-in card's "Online server" box; guests may watch without signing in (read-only); invites expire
  (countdown, die with the room); playlists scroll sideways on narrow screens, each with its own border tone; a reported match is never
  re-entered (the stale "… is on the move" banner bug). GEAR ECONOMY idea (his, design questions pending): brought gear can be lost
  (destroyed/taken), owner history on looted pieces, repair of pieces destroyed in a match you survived, Arena Chest for high ranks
  (CF → RNG named weapons with rarities/extra stats) + a special playlist where only those may be used.
- **His answers (2026-10-03, for v0.81 and the gear batch after it):**
  ONLINE PATRON (v0.82, his pick): NO required spectator. A ticket holder sits as "🎟 Patron of House <domus>" (also the spear-list
  label); optional Patron look on the Domus screen (face, colours, seat cushion in the house colours, from the Studio spectator face
  maker), generated by default. Guests have no house, no patron, no seat — they only watch. Spearing a ticket holder (his pick): allowed;
  a speared ticket holder gets the TICKET PRICE REFUNDED (server: refund on the speared result), keeps the wager and keeps watching.
  STANDS FOR THE POOR (v0.82, his pick a+b): the host may set tickets to FREE; a daily 🎟 Flavius's guest pass (one a day per house)
  ONLY while the wallet is low (default: under 15 coin) AND some room is selling seats right now (waiting, before the horns, stands not
  full/off) — no card when nothing is on; the card names that room; sitting through a match on it gives
  the Domus a small bonus (default +1 house Fame — a new Fame line on the house record; he said "Fame or CF"). Watching stays free for all.
  Spear reaction: Flavius hates seeing spectators speared (refund line: "Flavius refunds the ticket…"); offline he LAUGHS today
  (16-crowd flaviusReact case 'spear' → flaviusMood('laugh')) — HIS PICK: SCOWL. v0.82: flaviusMood('angry',3600,.8) with spear lines
  ("My spectators are not targets!", "Who pays for that seat now?"), offline and online alike.
  EVERY spearing (offline + online, CPU crowd too) = a refund: Flavius "refunds" the seat — a small "−N 🪙" floats off his box with
  the scowl (N = the room's ticket price online, a nominal seat price offline/CPU spectators: that refund goes into the ether; only a
  real ticket holder gets coin back). And the SPEARER draws an EXTRA Mandata Flavi card (on top of those held) — an angry emperor's
  demand; log line: "… a Mandati Flavi (Mandate from Flavius)" (his wording for this line; the cards stay "Mandata Flavi"). Online: the draw is in the lockstep stream (same card on every screen). If the Mandata deck is empty, no card is
  issued (the scowl and the refund still happen; the log just names the spearing).
  GLORY (v0.82, his ask "a mix of record and CF"): rank by glory = lifeCF + 12×survived + 8×wins (Ranked); Tiro 0 / Gregarius 180 /
  Veteranus 550 / Primus 1150 / Summa 2100; never demoted (ch.rankK keeps the best). TABLE SIZE: humans seated 2 → ×0.5, 3 → ×0.75,
  4+ → ×1 on coin AND glory (the Fate in full); the room says so. RANK BAR on the RIGHT of the Domus screen (tokens at their glory like a
  fundraiser bar, live count of LIVING gladiators per rank via hello.rankCounts). New online gladiators start on a RANDOM class.
  HOUSE TREASURY (his pick b, NEXT server update / v0.83): 20% of every survival award goes to the house treasury ("the lanista's
  cut"); the treasury buys gear into the Storeroom for any of the house's gladiators; it and the Storeroom outlive a gladiator's death
  (his own purse + carried gear are lost); table-size factors apply. v0.82 shows the gladiators' total purses on the house record.
  PATRON (his pick a): chosen while founding the house (127 found card), editable later from the folded "✎ Patron" on the Domus screen.
  ONLINE PRICES (v0.82, with the coin rework; ONLC PRICE is shared with the server): weapons L1 60 / L2 250 / L3 750; armor by AP
  15 / 55 / 150 coin per AP at L1/L2/L3 (Greaves L2 4 AP = 220, Forged Chest L3 5 AP = 750); owned gear and wallets untouched.
  COIN (online): no pay-out for carried coin — flat survival award by rank (Tiro 8 / Gregarius 12 / Veteranus 18 / Primus 25 / Summa 35,
  win bonus +50%, survival streak kept); Custom pays NO coin; no daily cap. GEAR BATCH (after v0.81): brought gear can be destroyed/taken
  (Ranked only), owner history, Whole/Broken + repair ⅓ of price, gear of a gladiator killed by beast/CPU/Fate → back to the market with its
  history; Flavius's Gifts = chest openings earned by play/rank-ups (mostly coin, a CF bonus = extra STARTING CF next Ranked match, offering
  tokens; L1 gear uncommon, L2/L3 rare, famous pieces very rare); named pieces Common 0 / Rare 1 / Epic 2 / Legendary 2 + unique effect;
  their playlist "Ludi Infames", Veteranus+; chest pieces can't be bought/sold but HOLD A VALUE = level price × rarity
  (Common ×1 / Rare ×2 / Epic ×4 / Legendary ×8; L4 base 1500) — shown on the card, in the gear score, stake lines and loot history;
  repair of a named piece = ⅓ of its FULL value (his pick, "a rogue-like"); GENERATED chest weapons (proposed, his nod): the SERVER
  rolls them (base type + rarity budget of capped affixes, Latin-part names, his icons tinted by rarity), stored on the gladiator as a
  full weapon def, carried in the kit → every client builds it like a custom weapon; Common/Rare = printed + 0–1 affix, Epic = fully
  generated + 2 affixes, Legendary = generated + 2 affixes + one hand-coded unique effect (start ~10–15; he may write some), each unique; start COUNTDOWN 10 s after the host's Start (line-up + what is at stake shown, host ✕ Hold,
  any line-up change cancels). v0.81: Online server box behind a word of power; guests may watch read-only, counted SEPARATELY on the map
  (a different glow colour), may read the Forum, 2 h connection limit; invites have NO timer — they die with the room (start/fill/close);
  playlist borders Democritus bronze-gold / Egidious deep red / Cassian steel blue / Familia olive green; DOMUS REQUIRED before any online
  gladiator (house name, word-filtered; the house keeps a record; a new house only while it has no gladiators yet); his sharp armor art as
  one file per piece (full detail); the Veteranus' chest → Forged Chest Armor (L3 5 AP; Flavius' Chest Armor off the class). PILLAR
  offerings: landing on another pillar → one tile back; on an NPC's tile → it lies UNDER the NPC; on a player's tile → that player gets it;
  on spikes → it falls INTO the spikes (pick it up = take the spike damage). SPECTATOR GROUP TURN (online only): every ticket holder gets
  their own private popup at the same time (nobody else sees the choices), one action each per window; a thrown stone/offering is LOCKED to
  its tile and still fires — whoever stands there when it lands is hit / receives it.
- **Custom beast spawn cards (agreed 2026-10-04, v0.82):** every Studio beast gets an arena spawn card (printed-card frame + token/
  portrait + name; still open: 1 auto card vs his template — my pick auto); beast designer checkbox "☐ Unique — enters an event at most once",
  UNTICKED by default (ticked = like Tholo: once per event, card leaves the deck when placed/entered; unticked = like wolves: many); a drawn custom beast
  enters by the GRID DICE like Leo/Leaena. ANY arena deck holds at most 4 beast spawn cards = THOLO FIXED + 3 SLOTS (Tholo stays for
  the chant; only where the rulebook removes him — Orpheus, Juggernaut — all slots are free). Standard events: slots default to Leo,
  Leaena, Commodus; a ROSTER SET has an "Arena deck beasts" row (Tholo fixed + 3 slots) whose author may swap any slot for one of their
  beasts (Manager careers on that set follow it); an untouched set = the rulebook. Custom events: the Event Designer deck section shows
  the same 1+3 slots (Tholo removable) — replaces the deckSpawns ticks; beasts PLACED at the start don't use a slot (a unique placed
  beast's card leaves the deck, 126-v82fix). Zora is not a beast slot. Online: printed beasts only, never custom.
- **Online market ideas (his, 2026-10-04, for the gear batch v0.83 — questions pending):** (1) the Armory sells OFFERINGS (tokens) a
  gladiator can carry into a match in their inventory and bring back out if they survive/win; (2) the online market shows weapons and
  armor on his market board art (boardHTML75 / assets/market_board.webp) — one side of the board for weapons, the other for armor. A row of OFFERINGS runs above both sides
  (his layout). CONFIRMED for v0.83 ("8 sure").
- **v0.83 plan (his answers 2026-10-04; build after v0.82 ships, wait for his go on the batch):** GEAR LEVELS: 1–3 = printed system
  gear, 4 = named chest gear (Common/Rare/Epic/Legendary from the Arena Chest + Flavius's Gifts); NO rank gate on buying (prices gate);
  the first 3 ranks (Tiro, Novicius, Gregarius) may only WEAR printed gear — named pieces wait in the Storeroom until Veteranus.
  8 RANKS by Glory: Tiro 0 · Novicius 90 · Gregarius 180 · Veteranus 550 · Primus Palus 1150 · Summa Rudis 2100 · Rudiarius 3500 ·
  Invictus 5500 (longer rank bar). Domus TROPHY ROOM (server-awarded rare/special-event trophies). Domus PROFILE PAGE (click any house
  name) + ★ FRIENDS (landing list: online, Invite, Watch) + 🔗 share link. Online WAGERS TAB (open bets/pot/odds, history, weekly top
  bettors). STICKING ARROWS + BOLTS: tip buried, fletching out, slight variation, up to 3 per location + "+N"; bolts shorter/thicker;
  shooters may target ANY location where possible; on beasts in random spots or the head when Focus-targeted; they stay until the END
  OF THE EVENT; a SEVERED limb takes its arrows with it. THOLO HOUSE RULE (his): a bolt to Tholo's targeted head kills him outright
  with any damage. Plus: house treasury (20% cut), market board with an offerings row, offerings carried in/out, gear economy, Gifts,
  countdown. v0.82 got: stone wall behind the Domus showcase (his pick).
  v0.83 GO (2026-10-04) + his answers: RANKED GEAR LOSS = armor whose location reaches 0 AP and weapons used up/broken come out
  BROKEN (repair ⅓ of price / ⅓ of full value for named); on death the KILLER (a human gladiator) takes ONE piece of his choice (owner
  history kept), the rest → the market; killed by beast/CPU/Fate → everything → the market. FRIENDS = ★ follow (one tap, no request).
  FLAVIUS'S GIFTS = every rank-up + every 5 Ranked bouts survived. ARMORY OFFERINGS = the printed Blessings set (elixirs, AP, Mercury,
  CF offerings) priced by level (~40 for +2, ~120 for +4/+3), at most 2 carried into a match, back out if he survives.
  CHEST (his ask 2026-10-04): the board's Arena Chest = his chest token's chest in 3D (135-v83chest drawChest83). FLAVIUS'S GIFTS
  online use the CHEST TOKEN ROUND (rtokHTML('chest')) — glowing PURPLE with a count badge when the player has unopened gifts.
  BOARD LOOK (v0.83, his asks): 3D spike caps (134), his chest in 3D (135), 3D clay pots + a subtle sand grain/shade on the tiles
  (136-v83sand: drawPot replaced, drawShipTile wrapper paints SAND83 on non-water tiles).
  v0.83 SERVER BUILT (133-v83onl + server, protocol 6, contract tools/plans/onl83-contract.md). His calls on its open points: BROKEN = any
  brought piece not held at the bout's end; FREEBIES (Flavius's Gifts, free tickets/guest passes, etc.) belong to the DOMUS, not a gladiator —
  they survive his death (offerings carried INTO a match are lost with him; unbrought ones stay on the house shelf); NAMED pieces = weapons only
  for now; a dead gladiator's unlooted named piece goes BACK TO FLAVIUS'S CHEST (with its owner history).
  TESTER GRANTS (his pick, v0.83): server-side only — deploy-time TESTERS (Google e-mails, never in the page/repo) → `admin.grant` to
  the tester's own house; every grant logged; a granted house is permanently D.test: Custom only, never in Today/rank counts/wager tops,
  "TEST" chip. Client "🧪 Tester" panel only when hello says tester:true. No word of power.
  MANAGER COUNCIL (his answers 2026-10-04, for v0.83): six advisors with a face + Roman name — Consilium (strategy), Recruiter (★ pick),
  Doctore (yard), Medicus (ward), Clerk (money letters), Barracks master; faces from the spectator/patron face maker, rolled ONCE per career
  from its seed (fixed, no re-roll; old careers get theirs on first load, saved once); they never leave (the poachable house medicus stays a
  separate hire). The face shows only INSIDE an opened letter (envelopes unchanged) + a council card in Your ludus (faces, names, specialty).
- **v0.84 plan (his picks 2026-10-04; wait for his go):** NAMED ARMOR (Rare/Epic/Legendary like the weapons) + the upper tiers' card
  BORDER SHIMMERS holographic (Epic/Legendary; Rare subtle). ONLINE SEASONS = the system schedule (the Manager 12-week calendar): the
  week's fixture shows on the Online main menu and is always the WEEKLY CHALLENGE; complete all challenges + win an event → a Flavius
  Gift — but GIFTS MUST STAY RARE (cap them: ~1 a week from challenges, no stacking). "YOUR TURN" notices. RECLAIM A SEAT a CPU took —
  only within a limited window (not at the last second after the CPU did the work); a match a CPU finished/won for them pays SEVERELY
  reduced rewards. MANAGER COUNCIL speaks more (Recruiter ★ picks / bargains, Medicus risk
  letters…). BOARD LIFE: blood soaks into the sand and fades, light dust drifting toward where a corpse falls (subtle — "not Pigpen"),
  rubble settling. NO online tutorial. READABILITY PASS (08+) + PHONE PASS (every v0.82/83 screen at 390 px + landscape, lighter
  rendering for old phones). TRANSLATIONS (his plan 2026-10-04): v0.84 = BROWSER-TRANSLATE SAFE (game terms marked translate="no", nothing breaks when
  Chrome/Edge translate the page, tested in es + ja). Then built-in languages ONE PER PASS, SPANISH FIRST (string tables + a language
  switch; cards/tokens keep his English art and get a hover/long-press panel with the translated name + rules). KEY GAMEPLAY TERMS
  STAY ENGLISH in every language so all players share them (class names, ranks, Fate/Thumb of Flavius, Missio, Lanista, Domus, CF,
  AP/HP, PvE/PvP, Focus, Mandata Flavi, event names…) — keep one GAME_TERMS list used by both the translate="no" marks and the
  string tables. BACKUP REMINDERS (his idea, v0.84): saves live in the browser (localStorage / artifact Store) and vanish if the player clears
  site data. The 📜 Saves → 🗄 Backups tab already exports/imports everything — add: navigator.storage.persist() at start (asks the
  browser not to evict the game's data); a gentle "⬇ Back up your saves" nudge (never a popup over play) on the main menu / Saves
  after milestones — a Manager season ends, every ~10 events, or 14 days since the last backup — with one-tap download + "Remind me
  later"; last-backup date shown in Backups. Online progress is on the server, so the nudge says it covers offline modes only.
  STANDALONE (the share file / site download) runs from file:// — it has NO online: no online.json beside it and Cognito only accepts
  the site's redirect URLs. v0.84: in the standalone the Online button says "Online plays at flaviusrule.com/play" and opens it. Its saves
  live in that file's own browser storage, SEPARATE from the site's — so the "download the standalone" suggestion must say: back up here,
  then Import in the standalone (Saves → Backups) to carry careers over.
  ONE TAB PER SAVE (his yes, v0.84): when the same Manager career / match save is opened in a second tab (BroadcastChannel,
  like the online mock), ask "This career is open in another tab — continue here (the other tab stops saving) / Cancel"; the losing tab
  shows a notice and blocks its saves (same mechanism as the newer-version guard in 109-v761).
  FLAVIUS'S AUCTION (his yes 2026-10-04, v0.84) — built to avoid the pitfalls he agreed with (death losing its sting, alt-account
  feeding, rich houses cornering the market): ONLY FLAVIUS SELLS — the weekly lots are named pieces that went back to his chest (dead
  gladiators' unlooted gear) with their full owner history on the lot card; players bid, nobody lists. Veteranus+ only; coin held in
  escrow, refunded the moment you're outbid; a bid in the last 5 min extends 5 min (no sniping); ONE win per house per week; minimum
  bid = half the piece's value; the winning coin leaves the game (sink). Player listings: NOT now — only revisit if the economy looks
  healthy, and then with a cooldown on fresh pieces, a floor price and Flavius' cut.
- **PROGRAMMATA (his yes 2026-10-04, v0.84):** Manager → Your ludus → 📯 Promote gets a 4th action 🖌 Paint the programmata — painted
  wall notices for 2–4 weeks (you choose) in up to 3 chosen cities, paid weekly: fame trickle, more gate money at your bouts there, a
  featured fighter gains fans/crowd favour; rivals deface notices (chance to lose a week, likelier from bitter rivals) and run their own;
  a featured fighter's death turns the notices into a memorial (fame, no more fans). Painted-wall card (red letters) + Imperium map marks.
  Also decided (same message): a house gift's CF bonus with no living gladiator → 8 coin a point into the treasury (as built in v0.83).
- **FAITH (his answers 2026-10-04, v0.85 — wait for his go):** every fighter is PAGAN or
  CHRISTIAN (no other cults); Christians are rolled at creation only (~1 in 10, no conversions); faith is OPEN on the record; pagan temple
  offerings give Christians no boost; perk = morale bonds between believers in the ludus; risks = some cities' crowds jeer (less crowd
  favour), a governor's EDICT (sporadic city persecutions: a Christian may be condemned — hide him (sit out), bribe, or let him face it;
  the sentence uses the printed Damnatio Fates Ad Flamma / Ad Bestias), a rival house may DENOUNCE him (rivalries trigger the edict);
  Manager + a faith field on Studio characters (Play Now); never online; memorial wall mark = ✝ for Christians, D · M for pagans.
  SENTENCE (Q10c): the condemned faces an AD BESTIAS bout together with other condemned Christians (fellow believers, his own house's
  and others'); he may survive it; refusing to fight = Ad Flamma. MARTYR (Q11b): a Christian who dies under an edict is remembered as a
  martyr — ✝ on his record + memorial, fellow believers in the ludus gain morale.
- **SETTINGS TIDY + LANDING FIT (his "all ★", 2026-10-04, v0.84):** remove the lesson-buttons row, one text-size control (Accessibility),
  colour-blind = the themes (General select applies them), drop dead Chest/Spikes pickers and the one-choice Armor section, Saves tab → button
  to the 💾 Saves window, Profiles → bottom of Themes ("Save this look"), 🌐 Language row first in General (English only; LANGS list),
  Performance row (Auto/Full/Light) + backup date/reminder switch, optional confirm before End turn (default off), Restore all defaults;
  Online notices/Quiet stay in Online. Online landing must fit WITHOUT SCROLLING on desktop (stage not stretched; playlists' first row visible).
- **RECRUITING TIDY (his yes 2026-10-04, v0.85):** weekly plan folds to one line; the board = the Roster's wall look (compact tablets,
  empty lanes = narrow posts, names fit); free-agent list rows on ONE line; 🆕 only for this week's arrivals; detail card before scouting
  = one "Ratings: scout to see" line; hours shown in banner + rail only; the advisor's pick = ★ on the right button (no separate box);
  filters in one toolbar optional; PHONES: recruit cards/tablets must not skew or squash (check 390 portrait + landscape).
  Board card buttons: next step on ONE line (label · cost), ⋯ a small square icon. HOURS (his pick 1): the weekly pool is "The lanista's
  hours" — shown on Recruiting AND Promote (Feast/criers/programmata draw on it), costs unchanged.
- **ROADMAP (his picks 2026-10-04):** v0.84 = release now (he tests it and sends notes); v0.85 = faith batch (branch ready) + recruiting
  tidy + readability pass + his v0.84 notes — START RIGHT AFTER v0.84 IS PUBLISHED; v0.86 = BUILT-IN SPANISH (one string table, GAME_TERMS
  stay English, live Language switch + first-run prompt for Spanish browsers, hover/long-press panels on English-art cards/tokens,
  a test walking the screens in Spanish for leftover English + overflow); then one language per release.
  His call (2026-10-04): NAMES STAY ENGLISH like the class names — weapons, armor, beasts, offerings, cards (the translated
  panel gives the rules text, the name stays as printed).
- **LANGUAGES UPDATE (his call 2026-10-05, "why wait"):** Italian DONE (29 parts); Portuguese/French/German translating NOW (agents);
  plural forms {n|one|many} in 00-lang + check.js; v0.87 = each language as its own file loaded only when picked (standalone inlines all).
  The card he sent (tools/art/cardtpl87) = THE CLASS CARD TEMPLATE (name in the banner, figure + rules on the parchment).
- **v0.89 CITY CENTER REIMAGINED (his picks 2026-10-05; reference picture tools/art/city89/reference_forum.jpg = STYLE REFERENCE ONLY, never
  shipped):** HYBRID — a painted panorama behind (terracotta city, hills, sky, the Colosseum; per-city variants: harbour, Vesuvius, desert…)
  + the walkable isometric forum redrawn in that palette (cobblestones, terracotta roofs, temple fronts with columns, striped awnings, fountain
  with statue, carts/animals in the crowd). Landmarks: TEMPLE → god offerings (TEMPLE76 / blessings); MARKET STALLS → the shops (arms, armor,
  city kits, offerings) + the auction on the forum steps; TRAINING GROUND beside the arena → watch/spar/exhibitions (Training Yard links).
  No triumphal arch (leaving stays a button). Keep walking, the living crowd, the sidebar (Kin/Stands/Roster/Menagerie), the arena gate + horns.
  Module 25-city.js is the base (CITY_BLDG, CITY_DRESS, cityIso).
  His pick: the square grows to ~18×18 (faster walking). Buildings are DETAILED structures, not the old boxes (columns, pediments,
  roof-tile rows, porticoes, awnings with stripes/scalloped edges, shading, windows/doors, steps) — step 1 = Roma screenshots for his ok.
  LIGHT: one sun (upper left), lit/shaded faces, soft cast shadows, contact shading, figure shadows; baked once per city. His rule: Match
  Week's 2ND BOUT IS THE NIGHT MATCH — the square shows dusk + torches/lamps before it; daylight otherwise. NIGHT ARENA mock shown (torches on the stands' edge, moonlit
  sand, moon + stars) — HIS CALL 2026-10-05: NIGHT IS ON THE BACK BURNER (not in v0.89).
- **FLAVIUS'S MOOD FACES (his picks 2026-10-05, v0.89):** Flavius in the box = HIS PAINTED FACE from the Mandata Flavi card back
  (tools/art/medallions/mandata_back.webp 822x1122): tools/art/flavmoods89/make.py crops the bust (card 300-540 x 266-466 with a 30 px pad)
  and makes the 10 moods (calm pleased smug cheer laugh shock angry bored weep facepalm) by warping brows/lids/mouth, painted open mouths,
  tears, a red flush; cheer uses HIS painted arm/fist; facepalm = after the statue facepalm (his pick): head bowed 25° into his own hand (mirrored, narrowed, finger ink lines) cupping the right side of his face, fingers over the brow; head yaw tried and rejected. Pleased/smug/bored pushed harder so they read at box
  size (his pick). Wire: flavFace (16-crowd) draws the image for Flavius (SPONSOR_FLAVIUS / no sponsor); flavFaceURL too. Known nit: bored's
  turn shows a gold sliver of the logo top-left — mask the corners. SPONSORS (city editors + Studio-made): keep their own looks (parts) but
  DRAW THEM WITH MORE DETAIL (card-style outlines + shading, nose, cheekbones, better beard/hair, the bigger mood changes) — update the
  sponsor creator (24-sponsors) if it needs new parts.
  NEW 11th MOOD 'really' (his Picard "what was THAT?" picture, 2026-10-05): brow up, mouth mid-sentence, open palm held out — his LEFT
  hand from the card (draped on the chair arm) flipped upside down = palm up (make.py palm_up). For Flavius AND every sponsor (drawn
  version too). Use it for: truces, a hit that misses / no attack (nohit), running into a tunnel, gifts to rivals, sparing; add it to
  FLAV_PRI/FLAV_LINES (lines like "Really?", "What was THAT?", "I paid for this?") and the sponsor preview row.
- **ROOMS WHEN THE HOST/LANISTAS GO (his ask 2026-10-05, v0.89 fix + server zip):** TODAY: Leave works (roomLeave passes host
  to the earliest joiner, empty → closed + refunds), but closing the Online window / tab only drops the socket (netIdleClose) — no
  lobby.leave is sent; the server then only closes a WAITING room whose HOST has been offline 5 min (or the room is 3 h old), lazily
  in `prune` (runs on someone's hello/lobby.list), and it closes the whole room even when others are in it; other members who drop
  stay seated as ghosts. HIS PICKS: (1) closing Online / the tab while in a waiting room sends lobby.leave at once (onlClose +
  pagehide, best effort); (2) a DROPPED socket gets a 60 s grace (room shows "host reconnecting…" / the seat dims), then the server
  removes that lanista via roomLeave — ANY member, not only the host; (3) host gone → PASS HOST to the longest-waiting lanista still
  there (takes a seat); nobody left → close + refund tickets/wagers; (4) enforcement: prune runs on hello/lobby.list AND on a 30 s
  lobby.get ping from every open room screen, so rooms clean up even when nobody browses; rooms with a gone host never show in lists.
- **PLAY NOW SEATS DEALT AT RANDOM (his ask 2026-10-05, BUILT for v0.89: 165-v89seats, test tv89s):** at page load and each fresh New
  event, CFG.seats get distinct random printed classes (Math.random) — only while the seats still hold what was dealt (a hand change, preset
  or custom character stops it for the session).
- **MY CORNER AT THE BOTTOM (his picks 2026-10-05, v0.89):** display-only rotation (rules, tile names A-1… and the log unchanged; draw +
  click input turned) so the human's start corner is at the bottom. ALWAYS ON (no setting — his call: at a real table everyone sits
  at their own side) for a single human player and ONLINE (each player their own corner; watchers standard view). FIXED (no rotation): hot seat, CHARIOT RACING and
  NAUMACHIA (one shared static view), lessons/tutorials. FLAVIUS'S BOX stays FIXED AT THE TOP OF THE SCREEN in every event (today it
  hangs over the A-1 corner — move it off the corner for all events, rotated or not). Turn with the view: stands quadrants, minis' yaw,
  stuck arrows, pillars/pots/chest/spikes, start marks, the hover/tile lines. Screenshot every event rotated before shipping.
- **v0.89 ANSWERS (2026-10-05):** LOOT WINDOW → the market-board style (pieces with their own art, enlarge + "fits you / replaces X",
  untakeable dimmed, same layout for Manage). HOT SEAT "since your last turn" window opens ONLY when something happened. HOT SEAT 🚪 Abandon and 💾 Save & leave ASK THE TABLE first (each
  human confirms, like ⏭ To the end). 'really' mood hand = his reference photo tools/art/flavmoods89/ref/really_hand.png, mirrored + re-inked.
  HIS GO for v0.89 comes once he confirms the mood set.
- **v0.90 QUEUED (his ok 2026-10-05): BLESSINGS AS TOKEN ROUNDS on the pillars** — Settings → On the board → "Blessings on pillars":
  Clay pots (3D, today) / Token rounds. Token mode: each pillar's Blessings lie as a small stack of his round tokens on top, BLESSING FACE UP
  (tools/art/medallions/blessing.png = rtok 'blessing': pot + "2 COIN · 1 CF"), so the offering stays hidden; when one is knocked off/taken it
  flips to its OFFERING face (the BLESSING_TABLE key's medallion: elix2/elix4/ap2/ap3/ma1-3/mw1-3/spiders) and lands/drops like the pots do.
  Rules, dice and log unchanged (works offline, hot seat, online; a per-viewer setting).
- **v0.90 QUEUED (his notes 2026-10-05): PLAY NOW SETUP TIDY** — (1) the Options section moves up into the empty space under the event
  card in the "What · the event" panel (his yellow box); the spectator options stay below; (2) remove the "Rules in this build" button;
  (3) "Sound the horns" → "Begin Event", moved into the top bar (the free space right of Follow); (4) ⚡ Quick start → "🎲 Random event": a RANDOM event + RANDOM
  city each time (his pick a), you as a random class vs CPUs (Math.random — UI, never the dice RNG); (5) remove ★ Presets.
- **v0.90 QUEUED (his card + picks 2026-10-06): THOLO AND THE LIONS HUNT THE CLOSEST LIVING THING** — not aggro: at the start of EVERY
  gladiator's Resolve phase Tholo, Leo and Leaena scan for the closest living thing (gladiators AND other beasts), walk and strike (today: only in
  the closest gladiator's Resolve, gladiators only; 04-rules npcTrigger 'scan' + closestPlayer). Aggro rules unchanged. Tholo collects the coin of
  anything he eliminates (players already go into npc.hoard; add beasts' coin rewards) — his killer gets 12 + the hoard. Tie rule: asked.
  Card checked: HP states Initial 20 / Raged ≤14 / Fazed ≤5 and 4·1·2 / 5·1·3 / 3·1·1 already match NPCT.tholo; round 3 = grid dice (S.ri≥2).
- **v0.90 QUEUED (his ok 2026-10-06): COMPACT VERSION HISTORY** — 34-notes historyHTML: one line per version (icon · vX · title), tap to
  open its bullets; only the newest open; What's new (115 verNotes79) unchanged. ALSO (his ask): CUT THE WORDING of each entry — mainly the
  newer ones (≈v0.70+): short title + 3–4 terse bullets each, fixes folded into one line; retranslate the changed keys in all languages.
  TABS (his ask): Version history in tabs of ten versions — 1–10 · 11–20 · … · 81–90 (a ranged entry like 0.6–0.11 sits in the tab of its
  first version); a tab shows only its versions, so each entry may keep the words it needs (cut + compact, easy to get through); newest tab open. Tholo tie rule (his pick):
  a gladiator before a beast; between gladiators the one whose turn is now or next. Then sims before/after (deaths, beast kills, length);
  knob if too deadly: scan every Resolve but strike at most once a rotation.
- **v0.90 QUEUED (his notes 2026-10-06):** (1) the action bar's 🌾 Crowd Favor tile is DISABLED when the CF on hand can't pay for anything
  in the Crowd Favor window (cheapest available option > CF, or Commodus) — today it lights with "1 CF to spend" though nothing costs 1;
  (2) Manager beast-pen fights / training bouts (108 PEN76, S.pen76, exhibitions) AUTO-ZOOM the camera onto the pen/fight area (the cage box),
  no manual Zoom needed.
- **v0.90 MANAGER NOTES (his list 2026-10-06; fixes go in, features wait for answers/go):** FIXES — F1 a fighter on 🛏 Rest week CAN'T
  fight (Match Week slot locked "Resting"; undo in the Infirmary); F2 Training Yard First/Normal/Last control goes (flickers, unclear); F3 Manager
  rail tab clicks flicker; F4 travelling for Match Week zeroes the remaining training hours. INFIRMARY (his design): a compact list of the
  hurt/tired like the recruiting list → avatar on the right with the areas that need care GLOWING → right of it how he can be healed (what it
  does, where); TWO BARS in different colours, HP and FATIGUE, near/above the avatar and small in the list; "Which cure should I use" → banner
  ⓘ popup; bathhouse made obvious. (Fatigue today = only the worn-down injury risk above 50, FAT_* in 85-v65.) HP (his rule): defaults head 5 · chest 6 · arms/legs 5; ANY location may be raised to max 7 (elixirs in play already do; in Manager, week care — temple, baths, Medicus, etc. — can lift locations above default for that week's bout, never past 7). FATIGUE (his pick): rides on the weekly routine (standing orders ROUT87, set once, repeats) — bout +25, Hard drills +15, Normal +8,
  Light +3, Care −20 (bathhouse + rubdown folded into Care), Rest week −50 (sits out, F1); IN THE BOUT by band: Fresh 0–30 = +1 movement in
  round 1 · Tired 31–60 = normal · Worn 61+ = −1 movement all bout + the injury risk; chips on Match Week/infirmary/yard. No extra
  micromanaging: meaningful weekly decisions only. WALK THE SAND (his pick): moves to the ARENA GATE in the City Center — click to perform
  (same bonus: 2 h + 6 coin → fighters on the card +1 AP and +1 coin, once a week); gone from Match Week; 'Send the Doctores' dropped.
  GO: v0.90 starts right after v0.89 is published.
  TRAINING YARD: each routine/option previews the week's gain per stat (icon 67 → 67.4 in green, decimals shown); the clicked fighter's card
  stops spanning the full width (sits beside the squad, no empty right); Doctore + Study cards to the right column. MATCH WEEK: Temple only
  in the City Center; Walk the City Square button with a thumbnail of that forum; Walk the Sand needs a new home (open). LEAGUE: stakes per
  table position + scout a rival house from the table (his picks).
- **ONLINE ECONOMY II (v0.91, 197-v91econ; shared rules = the v0.91 section at the end of 111-onlcore; server routes.js "v0.91 ONLINE ECONOMY II"):**
  DAMAGED PRINTED ARMOR (Ranked only): every client adds row.dmg = [[engine key, AP lost on its location 0..1]] (onl91Dmg: 1 − cur/total like
  armShares, a pair = its worst leg; printed armor brought and still worn) → cleanRow keeps it (cleanDmg: KEY_RE, clamp, 2 decimals, ≤16) →
  gearAfter marks a Ranked survivor's piece pc.st 'damaged' + pc.dmg in place (damageItem91; out.dmg). Repair = ceil(value × dmg) (repairCost),
  gear.repair mends broken AND damaged (paid as before: the treasury or one purse). kitOf lists kit.dmgd → roomJoin / seatGroup / startRoom strip
  them from RANKED kits only (worn in Custom). Domus: tile "🩹 Damaged · repair N" + 🔨, worn list 🩹 🔨 N; after-bout toast lists them.
  KEEP HOME = NAMED PIECES ONLY: homeSet refuses printed (server/mock code home_named), isHome/kitOf ignore an old printed flag; the 🔒 shows only
  on named pieces (tip "Never taken into Ranked: safe from loss and loot, still worn in Custom."). AUCTION: AUC_LOTS 6; aucPlan91 = the vault's
  forced options so chest + vault lots hold ≥1 top tier (Legendary while a unique of that kind is unclaimed, else Epic), ≥2 armor, ≥2 weapons
  (vaultLot89 o.kind / o.rar floor, draws unchanged → deterministic; a lost unique race re-rolls with cap 'epic'); a week the chest alone fills
  gets no guarantees. Lot cards one size (fixed height, owner history + bids fold into overlays: onl91AucFold). The purse → treasury OVERDRAFT
  was dropped (his call: v0.92 replaces purses with one house treasury). Tests: server/test/v91.test.js, tv91e (+ tonl84/tonl89n/tonl89d, v84/v89n/v89d
  server tests to six lots / named-only lock; v84's loot flake = a random Fidelis affix, stripped in the test).
- **I18N SOURCE GLUE (found by the zh translators, fix in v0.90):** 16-crowd stone line puts a CPU spectator's English name + "hurls"
  before translated text; recruiting "You already {0} {1}" takes English verbs (scouted/feasted/pitched); a 10-meta "…first" fragment + tier
  name stay English. Wrap the verbs with _T / reword into whole keys.
- **v0.91 SCOPE (his call 2026-10-06):** (1) SPONSORS improved (drawn with more detail + the bigger mood set incl. 'really'; sponsor
  creator updated) · (2) steady online tests (condition waits, not fixed times) · (3) readability pass slice · (4) NIGHT MATCH back on — improve
  the feel, lights must NOT block the view · (5) Crowd Favor tile CF-only (built). Dropped from the open list: printed class cards to the live
  template (he has the system cards + the custom template — done as is); login.flaviusrule.com works (his word).
  HIS PICKS: SPONSORS = the PAINTED look like his Flavius (ink outlines, shading, nose/cheekbones, better hair/beards, all 11 moods incl.
  'really' with the open palm, big readable changes) for every city editor + Studio sponsor; the sponsor creator gains MORE PARTS (hair,
  beards, wreaths/headwear, jewelry, skin tones, ages), a MOOD PREVIEW ROW (all 11), BOX COLOURS/FRAME. NIGHT = Manager Match Week's 2nd
  bout + a Play Now Day/Night option + online rooms (host picks; server roomSet field); look = TORCHES ON THE RIM ONLY (stands' edge and
  corners, outside the sand), soft warm pools at the sand edges, moonlit blue over the middle, pieces fully readable (rim light), gentle
  flicker (Reduce motion stops it); the square shows dusk before a night bout.
- **TOKEN MODELLER (his picks 2026-10-06, after v0.91):** posable 3D tokens that look like the naked avatar (assets/avatar.png: skin, harness,
  belt, loincloth, sandal straps, ink outline) — the NEW STANDARD for every Studio + online character, shown wherever a character shows
  (board, Studio, Play Now seats, Manager cards, Domus, results…); PRINTED classes keep his 3D minis. The 3D kitbash of his TTS minis was
  REJECTED. Rig = his pose app's joints (yellow spine/neck/head, blue/red sides, pink hands/pelvis); presets + drag joints; one or both feet
  pinned to the base (IK), stance kept on the base. Body needs real anatomy (deltoids/trapezius into the neck, ears, eyes, nose, mouth) —
  first mock (tools: /tmp r3d/rig.html) was a capsule mannequin. Gear = 3D shells attached to body segments (fit any pose), printed pieces
  modelled once, custom from base shapes + EXTRAS (his idea: spikes, fur, studs/rivets, neck guard on the upper arm…). Rendered to the 8
  MINI_YAW facings and cached; pose + parts stored small (online look ≤3 KB). LATER: Event Designer AS THE ARENA VIEW — the board in the
  middle, the avatar/side area = a drag-and-drop palette of everything placeable, the log area = designer tools.
- **v0.93 ALSO (his yes 2026-10-07, after the "functionally complete?" review):** (A) ACCESSIBILITY PASS — keyboard-only play (board tile
  focus + arrow keys, every action reachable), focus order and focus trap/return in windows and popups, screen-reader labels (aria) on buttons/
  chips/cards, a text summary of the board for screen readers (whose turn, positions, HP/AP, beasts in reach), contrast check of text/chips
  against WCAG AA, visible focus rings; a test walking it. (B) MANAGER LESSON UPDATE — 36-mtutor teaches the v0.92 Training Yard (fighter cards,
  sessions, Lock in, the Doctore's drills, Trials of the Yard) and anything else it describes that changed; test it end to end.
  Not yet: a live online playtest with real players + tonlws77/tonlws80 on the real handler (needs `cd server && npm i ws`).
- **v0.93 GO (his word 2026-10-07):** all six parts in ONE release — token modeller, backend + i18n phase 1, accessibility pass, Manager
  lesson update, event bus, layer manager. Token modeller answers: existing Studio characters AUTO-CONVERT (a 3D token built from their look —
  skin, hair, beard, colours — in a default pose, re-posable; the old token stays as a fallback setting); the modeller lives INSIDE the
  Character designer's token step; ONLINE keeps the sculpted tokens until v0.94 (then: three.js in online matches vs server-stored sprites).
  v0.94 = drag-and-drop gear in the Manager Roster (like the Domus) + the Event Designer as the arena view + online 3D tokens.
- **v0.94 GO (his picks 2026-10-07, ONE release):** (1) EVENT DESIGNER AS THE ARENA VIEW — the real board in the middle (never turned,
  tile names on hover), right column = palette tabs Terrain (pillar+Blessings, spikes, tunnel/door, water, chest, pots, eraser) · Pieces (start
  corners 1–4 / team colours, printed + custom beasts, Zora) · Zones (paint each round's area, a colour per round); bottom (log area) = tools:
  round strip (R1..Rn cards: zone, PvE/PvP/CF/CA, end, reward; click → its zone), deck slots (Tholo + 3), music, live checks list (click → the
  tile), Undo/Redo; step tabs Basics · Rounds · Rules · Finish stay on top for text settings; drag/right-click on desktop, tap-to-stamp +
  long-press remove on phones; old custom events open unchanged. NO mirror switch (his "place by hand"); ▶ Test play YES (his later word): a quick all-CPU game of the unsaved draft, no records, back to the designer unchanged.
  (2) MANAGER ARMORY — a house Armory (Storeroom) of owned weapons/armor/offerings; the Roster works like the Domus (plaque → avatar wearing
  the gear + shelf, drag onto body/hands and between fighters, fits/replaces + stacking rules); 1a a signed fighter brings his class loadout as
  owned pieces; 2a a dead fighter's gear returns to the Armory minus what broke; 3a the one-week City Square kits are replaced (offerings = the
  carry-in items, ≤2, unused come home); 4a stock per city and per week with specialties (bigger cities carry L3); 5a used-up/broken weapons are
  lost, armor at 0 AP comes back damaged → repair at the armorer; checklist nudges; rival houses buy gear (check with tools/mgrsim.js);
  SAVE_MIGRATIONS: current class loadouts become owned pieces. (3) ONLINE 3D TOKENS = SERVER PICTURES (his pick): the owner's browser renders
  the 8-facing sheet (~35 KB webp), uploads it, the server stores it (size/type limits), other screens download the picture — no three.js in matches.
- **EVENT BUS + LAYER MANAGER (his yes 2026-10-07, v0.93):** (1) EVENT BUS — one in-page `emit(name,data)` / `on(name,fn)` for game
  happenings (turn began, hit, elimination, spear, round end, market buy, save, window opened…) so new features listen instead of wrapping
  core functions (log/render/beginTurn wrappers today); wrappers stay where they are, new code uses the bus; perf92Mark, the error log and
  online lockstep can subscribe. (2) LAYER MANAGER — one ordered list of canvas layers (sky, under, sand, tiles, decals/blood, pieces, FX,
  top walls, night, UI marks) each with its own cache key + Off path, replacing the scattered draw() order + ad-hoc caches (192/194/208);
  draw() asks each layer to paint or reuse; per-layer timings feed tv92p. Both behaviour-neutral: screenshots + tv91r/tv92p before/after.
- **THREE.JS IN THE GAME (his yes 2026-10-07, v0.93):** the token modeller loads three.js ON DEMAND (from play/assets, only when the Studio's
  token modeller opens; cached by the browser after) — never bundled into the page. Matches never run 3D: the modeller renders each token once to
  the minis8 sprite-sheet format and the board keeps drawing flat images. The standalone download must still work (inline or skip the modeller there).
- **v0.95 STABILIZATION (his notes + answers 2026-10-07; numbering = his list):** FIXES: Zora mini fits a tile; menu intro preloads (no
  stutter); Bestiary opens inside the rules window and returns there; humanoids "slay", never "eat"; Trophy Case locked look until earned + own
  border colour each; Studio Find a creation crash + search width = name length; starting Arena Key token = "2 keys" face → "1 key" → discarded;
  character card preview live; class editor legs laid out like arms (Leather Tasset under Legs · Upper (pair), no padded upper leg), no red leg
  flash; armor fit tool Both sides + independent sides, Mirror works, "choose an equip point" save error gone (then he Exports, we bake); beast
  token rounds without the letter; Cohorts card header + real token; CF purchase feedback + arena keys in the inventory; damage/AP popups above
  bubbles, fanned out; "editors unlocked" popup no longer after every event.
  CHANGES: team rings at mini bases (fixed A–D colours, colour-blind safe); main menu buttons AAA quality (sandstone, bevel, raised); Rules window
  → "Tactics" (button + title): Tutorials, one Rules-at-a-Glance (purple/gold marks, no scroll), What's New = first card of Version History,
  Strategy tab (Play Now Guide + Manager Guide), Reference tab (Glossary · Bestiary of system + custom TYPES · Quick Reference from his PDF),
  one Rulebook link in the last tab; Your Play Now Gladiators button in the Play Now submenu (Annals keeps it); SETTINGS FULL SCREEN (Studio-like
  rail); Language = an inline dropdown, the flag updates (no popup); Blessings on pillars → the "Board & pieces" tab (old Tokens + Editors merged)
  with pot/token pictures; home-city-banner setting removed; Hints & help shares a row with On the board; Themes as compact swatches; Saves tab
  removed from Settings; spectator emotes setting removed; custom class card shows its weapon cards (1×2) or on hover; Arena Chest swap shows the
  outgoing card; Focus roll = locdie.jpg faces, dice stacked in a column, clearer clickable limbs; 3D poser joint highlight, athletic body, 3D card
  upper right, short personality sliders; PLAY NOW: Begin Event + 🎲 (icon, hover text) + one-line event summary grouped compactly in the UPPER
  RIGHT, player-count picker under its icon, seats >4 on a second row, Stands card fixed right; Creator Studio designers get TABS (like elsewhere).
  RULES: ONLINE — Damnatio only at creation, never switched into or out of, other class switches stay 100 coin (server). FOCUS — players only
  (beasts never Focus); costs at least 3 movement and uses ALL remaining movement; Focus on a pillar's Blessings = +1 damage on a successful
  attack (like the Soldier ability) — DIGITAL-EXCLUSIVE rule (his call): with 5 movement you may walk 2 then Focus with the last 3; the
  rulebook's 'Focus = all available movement' stays in the Quick Reference with a purple digital note. UPLOADS IN: Zora's TTS bundle
  (tools/art/zora95/zora2024.unity3d → render like the other minis), Quick Reference p.72 (tools/art/quickref95/quickref_p72.webp + refpage.pdf;
  checked vs the engine 2026-10-07: NPC stats, move/push/topple costs, hit dice 2 vs players / 4 vs beasts / 2 beast vs beast, damage order,
  HP 7 all match). Still waiting: his armor-fit Export.
  PERFORMANCE (his yes, v0.95; measured 2026-10-07 with /tmp prof95 scripts: all-CPU Democritus, Normal 26 fps p95 114 ms, Fast 9 fps p50 80 ms,
  busy 74-81% but game script only ~9%; the rest = IMAGE RE-DECODING (#board fighter panel rebuilt by innerHTML up to 5×/s → avatar, armor2.webp,
  weapons.jpg, arena.jpg, coin, sr medallion re-inserted; #npcPanel re-inserts rtok.webp ~30/s) + forced layout (clientWidth on every draw)):
  (1) patch panels in place with morph91 (fighter panel, Field, status, turn panel); (2) small cut-out images instead of the big sheets in
  panels, keep big ones decoded once; (3) ≤1 panel update per frame, ~4/s while CPUs act (own turn immediate); (4) at Fast skip decorative
  extras (speech/wager bubbles, cheer waves, dust/blood anims short, floating numbers short) — rules/log/dice unchanged; (5) measure layout once;
  (6) speed changes take effect at once (sleep re-reads SPEED mid-wait). Goal Fast ≥40 fps; a perf test joins the suite. Spectators were NOT the cost.
  MORE NOTES (2026-10-07): Classes — custom "Hated by the crowd" (pelted) = the stone each Resolve ONLY, no +10 CF (that stays the printed
  Damnatio's); tamed-ally picker excludes humanoids (Tholo, Commodus, custom humanoid types) — lions, Zora, Ursa, Brutum, snake, wolf, custom
  non-humanoid beasts on the rolls. Character creator: 375-point budget + the abilities gained shown on the RIGHT, visually distinct. Sculptors:
  lock proportions, random default colour (not always yellow), check height/width sliders (may be swapped), snap ticks on sliders game-wide.
  Custom weapons: ≤4 icons; "A shield?" checkbox → must have Absorb, optional Attack power + Range, + one other (4 max); BUG: icons picked
  before ticking shield stay on the preview AND the saved weapon. Play Now: The Stands personality dropdown stays open (bug); characters on
  the rolls can't be found for CPU seats with "All my creations" (bug) + an easy way to seat them (pending his pick). HIS ANSWERS: 1a Studio ratings 40–99, below 60 = Poor: Speed −1 move,
  Strength −1 dmg (min 1), Luck −1 coin every other turn, Charisma −1 CF every other turn, Intelligence = weaker CPU mind; 2a characters on the
  rolls stay editable — running careers + saved matches keep the version they started with, new events use the edit; 3a each Play Now seat
  picker gets a "Your characters" tab (roster-set filtered, seat as You or CPU) + "🎲 Fill CPU seats with my characters".
  MORE (2026-10-07): BUG trade offers — a swap offer stays open 2 weeks even when THEIR offered fighter dies/leaves (offersWeek only checks
  ours) → "You get" empty, Accept hands ours over for nothing (offerAccept skips missing ones) → withdraw at week start / when shown / on
  Accept ("This offer is no longer on the table"). CHANGE: the "How the fighters grew this week" letter goes INTO the Week N in review letter
  (202 .rev91) as a subsection "From your Doctores": one row per fighter (portrait, the five rating icons with old → new and a green +0.4,
  band-ups highlighted, fatigue chip), quiet fighters folded; the separate letter is no longer sent. Mail letters may use icons/structure freely.
  FIXES (v0.95): after a SPECIAL EVENT week the game did not return to Your ludus nor show the Acta Diurna — every week end the same path;
  a signed recruit shows his PORTRAIT (was a blank avatar); recruiting board tablets lose their buttons (click selects; act on the right card).
  RECRUITING III = v0.96 HEADLINE (his 1a, 2026-10-07): ① SCOUT — ratings as letter-grade blocks A+…F (start "?", hover = meaning + how sure),
  no numbers before signing; weekly RECRUITER'S HOURS (2a: 20/week, ≤8 per recruit, scaled with the Recruiter): Ask around the forum 1 h (one
  rough grade) · Watch him train 2 h (Speed/Strength) · Share a cup 2 h (Intelligence/Charisma) · Study his bouts 3 h (sharpens all + Luck) ·
  Trial bout 5 h (+ a little coin, small injury risk, sharpens everything); all five graded → personality (wants, temper, dealbreakers) revealed;
  grades are ESTIMATES (an A may be 91–99 or really a B+), accuracy from the Recruiter's level. ② COURT — the ludus has PUBLIC GRADES the whole
  league sees (4a: Training, Medicine, Glory, Pay, City); recruit grades are known only to houses that scouted them; pitches tied to house grades +
  his wants (Show him the Training Yard, Dine at the lanista's table, Promise him the sand, Tour the infirmary, Meet your champion…) with
  projections ("with our Doctore his Strength B could reach A-"); wants-matching pitches count most; rival counter-bids stay; the Scout tab stays
  usable while courting. ③ OFFER as today. On signing a "The truth" card: scouted grade vs real value. Card tabs reorganised (clear sections,
  emphasis on what matters). ADVISOR LEVELS (his 3): every council advisor starts at LEVEL 1 in a new career, EXCEPT taking over an EXISTING house (the
  starter houses offered to take over: level 2–3 by how established) or an Easy start (level 2); levels rise (perk tree / hiring for coin) — in v0.96 the Recruiter's level drives grade accuracy + hours; other advisors' effects later.
  ROSTER + ARMORY (his notes 2026-10-07, v0.95): ARMORY becomes its own Manager rail tab (out of the Roster); only HEALTHY fighters can be
  equipped; an INJURED fighter's weapons/armor/offerings go to the armory shelf at once (the manager re-equips after healing; checklist nudge).
  Roster: AT MOST 3 STARTERS; the bench = every healthy non-starter (no depth columns at the top); Promote to starter + Lend live on the fighter
  list rows below; Loans = a tab beside the depth chart (not under it); the fighter card on the right moves up into the freed space.
  STARTERS (his answer): each of the 3 starters is set to ONE Match Week bout (Bout I / II / III), all reassignable by the manager; Match Week
  fills the bouts from them by default (still swappable there). Starter perk (my proposal, his "maybe"): +2 morale and +1 loyalty per week as a
  starter; a benched healthy fighter whose want is "arena time" loses 1 morale a week — tunable.
  FIX: Training Yard fighter card → Bond: the "Nobody free to bond with" box, the + buttons and the N/N count overflow the card (wrap/shrink inside it).
- **v0.96 NOTES (his list 2026-10-07 evening; his picks 1b 2a 3a 5a 6b):** v0.95 ships as merged; ALL of these go into v0.96 beside Recruiting III.
  FIXES: belts drawn above thigh armor on every avatar · raw HTML in the "Raise the Shield of Achilles?" window · 🔴 an attack that should eliminate
  (often the head) uses the weapon but applies nothing and leaves no log line — trace it first; RULE: every attack is logged (hit or miss), anything
  that cancels/saves (block, heal) shows on screen for everyone · your turn → the panel snaps back to your own avatar · Sim to end shows no beast
  cards and none linger after the end. CHANGES: online Domus loses Loadouts ("save what he wears") · Carmina window = 3 cards, each with its verses as
  a selectable column to its left, no empty space · uses/ammo/absorb counters on weapons/shields · the pinned stands line (#slogPin) goes; spectator
  actions touching a gladiator/the arena stay in the arena log, seat switches + wagers only under Stands · a spectator without CF gets no upkeep window;
  small "Switch section (CF)" button in the arena tools; the window still offers the switch when it opens for Tholo/stone/offering · STONE CAP (2a): at
  most 3 stones HIT one gladiator per turn, the rest fly wide (log line) · ONLINE RELOAD (3a): reloading during a match goes straight back into it (one
  live match per lanista is already the server's busy rule) · FAST (5a): Fast skips in-between animation frames (pieces jump, no bubbles/cards, one
  board draw per action); Slow/Normal unchanged; rules/log/dice unchanged · ACTION BUTTONS (6b): MOCK-UP FIRST — ⚔ Attack (weapons + Focus, red frame),
  🏃 Move (remaining movement on top + Topple/Push/Tunnel), 🤝 Deal (Trade/Truce/Loot), 🏛 Market & Crowd always shown (greyed when not usable, what's
  left + what you can afford), End turn apart. Q4a (his): the Leather Tasset (legwrapsU) is NOT padding any more — it takes the upper leg alone like a thigh
  plate (armorConflict: only LOWER padding stacks under hard pieces); check class loadouts that wear both + the Manager/online shelves. Confirmed: two hard pieces on one equip point never
  stack (armorConflict), belts sit on top of chest armor.
- **v0.96 NOTES II (his list 2026-10-08 + answers q1a q2(a assumed) q3a q4a q5a):** FIXES — (6) pre-fight warning letters cover only the CURRENT
  week's event/city (a Capua warning arrived while fighting in Roma); (7) Manica/galerus: Right/Left shoulder choice wherever gear is dressed
  (Manager Armory, Domus, designers) — today it always lands on the left and they replace each other; (8) a fighter on the card but the "no fighter
  entered" letter/checklist item stays; (10) City Square fades in only after the crowd has loaded and walks. CHANGES — (1, q1a) ONE set of house
  grades: the lanista traits ARE the public grades recruits see (Recruiting III uses them); the perk tab's "hone a trait" row = prominent trait cards
  with current grade + green gain preview; (2) "Save and leave your career" → "Save and Exit"; (3, q2a) standings: "Now" → "Ludus", the Quaestor
  line leaves the table (stays in the season-end ledger letter + the podium prize hover), league prize column → banner podium with the Superbus
  trophy on 1st (hover = season-finish prizes), new columns top-rated gladiator · record · latest event result, livelier look; (4, q3a) Season tab:
  each finished week's Acta results card (your house's bouts) stored to the right of Billing; (5) Match Week Road box sized to content, advisor's
  "don't fight" note inside it, "N points to the next prize" → a letter, "Gear up in <city>" removed (City Square → Stalls covers it; guide line);
  (11, q5a) invitational Answer opens the fighter picker + accept at once (no reopening the letter). PARKED (q4a): trade bundles 2+-for-1 +
  counter-offers by mail → tools/plans/backlog.md.
  (12, his screenshot 2026-10-08) ONLINE ROOM SCREEN (onlMyLobbyHTML, 118/137): the middle is empty (seats + host rules squeezed into a thin right
  column, FID invite floating mid-page, chat box at the very bottom) → proposed: seats as large cards across the middle (figure, name, class,
  rank, Ready; open seats as dashed cards with Invite), event card + rules as one strip above them, host settings + Start/Call/Send in the right
  column, invite-by-FID + quick-chat phrases in one row under the seats; phones one column. Mock-ups sent 2026-10-08: tools/plans/mock96/ (room, lobby list, domus rank banners, action buttons).
- **v0.96 NOTES III (his list 2026-10-08, ONLINE + armory; mock-ups tools/plans/mock96/mock.html):** (13) Manager Armory rail icon = an ANVIL (today the
  Roster's), damaged pieces in their own section on the right of the Armory tab; (14) ROOM LAYOUT (his): seats CENTRED 2×4, user list on the RIGHT
  (👑 host, Give host, kick), table settings UNDER the seats, the "send coin" box (new coin icon, not the silver one) INSIDE your own seat card,
  Leave = "Exit lobby" when others are there / "Close lobby" when alone, host leaves → crown to the earliest joiner (already the server rule);
  (15) the crier (📣 lobby.call) ONLY by the host's click — never automatic on create; (16) Custom rooms may set a PASSWORD (server keeps a hash;
  join asks; 🔒 in the list); (17) lobby list: filter/sort by event, city, region + ↻ Refresh; a REGION FLAG per room (regions drawn with the
  system banner creator); (18) click a host/member name (list or room) → house card: record, gladiators, fallen, best rank, last 6 events W/L
  (like Manager League rosters), Visit house · ★ Follow; (19) DOMUS RANK (new, needs his answers): one online rank per house from its whole
  roster, shown beside every name in rooms/lists, a VERTICAL BANNER per rank (top right of the Domus above the rank bar).
  HIS ANSWERS (2026-10-08): q1a DOMUS RANK = sum of the best 4 LIVING gladiators' Glory + 20% of all fallen gladiators' Glory, never drops;
  Tugurium 0 · Taberna 200 · Ludus Minor 600 · Ludus 1500 · Ludus Magnus 3000 · Familia Nota 5500 · Domus Illustris 9000 · Domus Aurea 15000;
  q2a REGION from the browser time zone (no IP); q3a password = Custom rooms only; q4a I draw the 8 rank banners + ~7 region flags with the system
  banner creator, each rank banner carries a SYMBOL (hut, amphora, wooden sword, crossed blades, helm, shield, laurel, eagle — no numerals; mock
  tools/plans/mock96/mock2.html C); q5a room approved + NO chat feed: quick-chat phrases pop as bubbles over the speaker's seat (standing lanistas
  beside their name in the list), the phrase picker sits bottom right under the user list; q5b ACTION BAR restyled to HIS PICTURE (painted
  materials: brass plate Attack with blade/trident-shaped weapon buttons + Focus medallion, wood-plank Move with stitched leather buttons + compass,
  parchment scroll Deal with wax-seal Trade/Truce + chest Loot, stitched leather Market & Crowd with coin purse + laurel, a brass handle End turn) —
  mock2 D shown → HE REFINED (2026-10-08): do NOT recreate it — keep TODAY's action bar and its tiles, only give it that look (mock3.html):
  the 1 Resolve · 2 Choice · 3 Action · 4 End phase strip stays as a brass rail on top (done ✓, current lit gold); groups Attack (brass: one
  button per weapon + Focus centred below), Move (wood + stitched leather: Move/Push/Topple/Tunnel, movement left in the header), Deal (parchment,
  wax-seal Trade/Truce + Loot), Market · Crowd (stitched leather: Market/Crowd Favor/Wager on yourself); End turn = a plain red button with brass
  rivets ("to phase IV", Enter). ROOM bubbles go UNDER the speaker's token (space kept, no jumping, fade ~6 s).
  FINAL PICK (2026-10-08, mock4.html / mock96e_full.png): the COMPACT version — today's height, the house's dark panels, materials only on the
  group header strips, one-line buttons with a short cost (full reason on hover), slim phase rail IN THE PHASE COLOURS used everywhere (.ph-resolve teal, .ph-choice gold, .ph-action red, .ph-end grey: underline per segment, done ✓, current filled), End turn red with gold edge + rivets.
  "Wager on yourself" leaves the action bar (his call: not needed — the button only; CPU self-bets/the Wagers list stay as they are).
  EXTRAS (all 8, his yes 2026-10-08): (1) hover a button → preview on the board (weapon → targets in range, Push/Topple → usable tiles/pillars,
  Market → affordable levels); (2) pips in the headers (Move = orange movement pips, hovering a cost dims what it would spend; Attack = 2 sword
  pips); (3) "3 move · 2 attacks unused" under End turn; (4) hover a done phase → what happened in it (Resolve: no beasts stirred / Choice: took
  2 coin); (5) whose turn + "next: <name>" with a small face at the left of the rail; (6) small key hints on the buttons (A/M/P/T/Enter, the
  v0.93 keyboard layer); (7) hints mode only (never Ranked): soft glow on the action the strategy hints would pick; (8) phones: the groups = one
  swipe row, End turn fixed on the right.
- **v0.98 = EVERYTHING (his call 2026-10-08, "put it all together"):** the v0.95 CHANGES block that slipped (never built: Settings full
  screen with a rail + inline Language dropdown + "Board & pieces" tab + Themes swatches + removals; Rules → "Tactics" window with the Quick
  Reference; main-menu AAA buttons; Play Now upper-right group; Studio designer tabs; custom class card weapon cards; 3D poser tweaks; Your Play
  Now Gladiators in the Play Now submenu; FOCUS digital rule ≥3 movement + all the rest, +1 dmg on Blessings; online Damnatio only at creation)
  + Recruiting III + the online list below. Mock-ups first for Settings / Tactics / main menu / Play Now.
  ALSO v0.98 (his 2026-10-08): Online 👤 Profile & Settings regrouped (today one big row across the top; mock-up 5); named-gear bonus texts
  approved as listed; NAMES: the same kind of bonus at a higher level shares the name with a Roman numeral (Gloriosus I / II …) — proposed
  mapping APPROVED (2026-10-08): Gloriosus → Gloriosus I; weapon unique Gloriae (+2 CF a gladiator hit) → Gloriosus II;
  Acutus → Acutus I; Percussor (AP 2) → Acutus II; Velox → Velox I; Mercurii (+1 move always) → Velox II; armor unique Gloriae (+1 CF when armor
  stops a hit) → Laudis; Tutus (armor) and Aegis (weapon) keep their names (same strength, different gear). Names live in 111-onlcore
  AFFIX/AFFIX_A/UNIQUES/UNIQUES_A + AUC96_AFF (239) → server deploy; owned gear shows the new names.
- **v0.97 / v0.98 (his ok 2026-10-08):** v0.97 = the post-v0.96 fixes round (above, no server change). v0.98 (server deploy, wait for his go)
  = Recruiting III + advisor levels + house grades, passwords (Custom), region flags (time zone), house card on names, Domus rank + banners, silent
  lobby.quick, AND online events beyond the Classics (his 1a 2b 3a: printed events as Custom only, in approved waves — Familia already, then Ludus,
  Golden Eagle, Gauntlet; two squares under the playlists each cycle a random approved event and open/join a Custom room for it). Asked, not yet
  answered: Match Week "This week" card (3 bout tiles) — the walk button + road strip were built instead.
- **SPLIT (his call 2026-10-08): v0.96 / v0.97.** v0.96 SHIPPED; GRADE CUT-OFFS CONFIRMED (his ok 2026-10-08): A+92 A85 B+78 B70 C+62 C54 D44 F — Recruiting III uses trait96Grade as is; v0.97 also gets: Find me a fight (lobby.quick) still cries — make it silent server-side. v0.96 (no server change) = all Manager fixes/changes of notes I/II/III (standings, Season
  Acta cards, Match Week Road box, invitational answer, warnings, "no fighter" item, Armory anvil + damaged section, Save and Exit, trait
  cards), all board/match items of notes I (🔴 attack trace first, belts, Shield popup, snap-back, sim beast cards, stone cap, Fast skips
  frames, counters, #slogPin, spectator upkeep, Tasset, Carmina window) + the COMPACT ACTION BAR with its 8 extras, and the client-only online
  items: room screen layout + bubbles under tokens, crier on click only, Exit/Close lobby, coin box in your seat, lobby ↻ Refresh + event/city
  filters, Domus Loadouts off, reload goes straight back into the match. v0.97 (server deploy) = RECRUITING III (+ advisor levels, house grades)
  + online passwords, region flags (time zone), house card on names, DOMUS RANK + banners.
- **ARMOR EXTRAS (his picks 2026-10-06):** printed pieces stay ONE fused unit (the Manica is one piece, no separate galerus piece/AP).
  The 2D Armor designer gets CLICK-TO-ADD extras (all COSMETIC, no AP): galerus/neck guard, Manica segments, studs/rivets, spikes, fur trim,
  emblems (house crest), damage (dents/scratches/cracks), rope/cloth wraps, leather lacing/straps, trim bands, paint. Same set later on the 3D
  token gear. Timing (my call, he left it to me): v0.92 = the 2D designer extras + the 3D body/rig groundwork; v0.93 = the token modeller
  (poses, printed gear in 3D, extras on 3D); then the Event Designer as the arena view.
- **DONATIVUM (his picks 2026-10-06, v0.91):** Flavius's free online gifts are called a DONATIVUM (pl. Donativa); ⓘ on the card says it is from
  Flavius; no "earned by · opened for" line; ALWAYS BRAND NEW — gift.open never hands out a used chest-pool piece (owner history is only for
  arena-worn pieces, which go to the auction). Server change → ships with the v0.91 server.
- **OPEN MARKET + USED-UP GEAR (his picks 2026-10-06, v0.91, server change):** printed gear (L1–3) is an open market — any number of copies
  per gladiator/house (canBuy has no copy limit; tiles show "owned ×N"; spares wait on the shelf, dressApply still wears one). In RANKED a printed
  piece the gladiator brought and no longer holds at the end (armor at 0 AP, weapon broken/thrown/dropped/used up) is DESTROYED (gearAfter →
  out.gone, toast "🔥 Used up in the bout … buy new in the Armory"); NAMED pieces still come back Broken (repair ⅓ of value). Custom: nothing.
- **NO FLICKER (v0.91, 198-v91morph):** onlRedraw patches #onl in place with `morph91(root, html)` (kept nodes, details stay open, focused
  inputs untouched, canvases kept) instead of innerHTML. Other full-redraw screens (Manager MGR_REDRAW, Studio) can adopt morph91 the same way.
- **PLAY GUIDE CHARTS (his ask 2026-10-06, v0.92 or later):** the Play Now guide's charts (53-guide50 / 69-v56 SIM50 graphs) stay on ONE row at
  the top — no wrapping to a second row (shrink/scroll them to fit).
- **v0.92 START (his picks 2026-10-06):** (1) PERFORMANCE PASS first — measured idle: ~54 setInterval sweeps (0.1–1 s) keep the page
  restyling/repainting 25–45% busy while scripts are 1–3%; build ONE heartbeat (sweeps only after a change, ≤4/s), IDLE MODE after 2 min
  without input (decorative motion off, sweeps 1/s, wake on input), CLEAN RETURN on visibility (one redraw, drop stale FX backlog, audio/net
  check), a SOAK test (hours compressed: heap, nodes, draw cost). Tools: /tmp/claude-0/idle*.js measured with CDP Performance metrics.
  (2) PLAY NOW SPECTATORS → a "🎟 The Stands" card beside the 4 seat cards (crowd size, personality fold, Play as a spectator — ticking it
  turns every seat CPU, visibly). Then kits, one treasury, 2D armor extras.
- **ONE TREASURY (his picks 2026-10-06, v0.92 — replaces gladiator purses):** no purse, no banking; every survival award 100% to the house
  treasury (the 20% cut goes; the ledger still shows earnings per gladiator); today's purses move into their house treasury once (ledger line).
  Before a match the lanista sends 0–10 coin from the treasury ON TOP of the class's starting coin (3 + 10 = 13 → at most one L3 item); a survivor
  brings leftover coin home (up to what was sent), the dead lose it. At stake = gear brought + coin sent. Kits/restock/repairs/buys = treasury.
- **ONLINE KITS (his picks 2026-10-06, v0.92 — build in v0.92):** Armory "Kits" row: CLASS KITS (each printed class's loadout on the avatar;
  owned pieces on him/the shelf skipped, "Complete the kit · N"), budget tiers (Scrap · Recruit · Class · Champion L2–3), 15% bundle discount;
  FREE DAILY KIT once a day per house (plain L1, pieces marked Issued: worth 0, unsellable, unrepairable, never looted, vanish when lost);
  🛒 Restock on saved loadouts (rebuys what a bout used up); paid from his PURSE first, the TREASURY covers the shortfall (overdraft, his pick).
  Kit discount is PROPORTIONAL: 15% × the share of the kit bought (owned pieces skipped, each missing piece at its own price). One server route market.kit
  (one charge, then dress), a daily marker per house, kit tables from class data via mkserver/catalog. Arc Raiders-style loop.
- **ONLINE SERVER VERSION (v0.91, 196-v91srv):** hello.build from server/src/build.json (tools/srvstamp.js, run by release.sh; only re-stamps when
  the server code hash changes) + SRV_EXPECT91 in the page (generated 195-v91srvexp.js) → chip bottom-left of Online screens (ok / ⚠ older /
  practice); "Unknown request" → "the server is older than this page". Found 2026-10-06: the live AWS server lacked the v0.89 Domus routes
  (domus.look) — re-sent as flavius-server-16 (= the v0.89 release tree; he deploys with `bash flavius.sh server flavius-server-16.zip`).
- **RUBBLE IS WALKABLE (his note 2026-10-06, built in 194):** low stump ring, flat drums, pieces off the tile middle, hover "Rubble — walkable".
- **v0.93 BACKEND + I18N HARDENING, PHASE 1 (his yes 2026-10-07; audit given in chat):** already in place = server owns money/progression/
  inventory/wagers/auction/matchmaking/rooms (routes.js), shared rules (111-onlcore ↔ server/src/onlcore.js), Cognito JWT on connect (jwt.js),
  no secrets in the page (Google secret = NoEcho deploy param), store.js memory|dynamo + versioned writes (putRev/flip), 13 server suites,
  _T keys in 8 languages + plurals + check/newkeys/mkdict + walk tests, player-written server errors (TXP). PHASE 1 (v0.93, alongside the token
  modeller): (1) request ids on every paying route → a replayed buy/bid/ticket/repair/kit is answered once (idempotency); (2) one general
  per-account rate limit on top of the per-feature ones; (3) tests: authorization (wrong account/seat), replay, concurrency races, rate limits,
  failure recovery; (4) player-facing error audit — no raw err.message on screen, plain wording + a short reference code from the 00c error log;
  (5) server texts as stable codes + values (client turns them into words) instead of English sentences matched by TXP; (6) pseudolocalization +
  missing/unused-key + fallback checks in the test suite; (7) docs/ folder (architecture, backend run/test/extend, data shapes + rollout/rollback,
  i18n workflow) LINKED from CLAUDE.md (no second source of truth). PHASE 2 (later, his call): server-side verification of Ranked results
  (separate the engine from the screen code, replay seed + inputs on the server). RTL: skipped unless an RTL language is planned.
- **v0.90 QUEUED (his yes 2026-10-05): HOT-SEAT TURNING BOARD** — a setting (Settings → On the board, OFF by default): with 2+ humans
  on one screen, the board turns to the active human's corner at the start of each human's turn (short eased spin; Reduce motion / Off
  animations = an instant cut), using the v0.89 display rotation (168). CPU turns keep the last human's view. Never in Chariot,
  Naumachia or lessons. Display only (rules, tile names, log unchanged).
- **His calls (2026-10-05):** NO new online events until the Classics play properly online (no real players yet; ONL_EVENTS_OK88 stays
  empty). legendsim: LEAVE IT HARD — a Manager must diversify; one fighter carrying a house is meant to die by volume.
- **166-v89fix (built):** boot-window close → main menu (not the background arena); startEvent in progress (START89) counts as live for
  screenSettle + the 08-setup / 72-v59 launch watchdogs (fixes the Naumachia draft dropping to the main menu while CPUs pick — any event
  whose start-up windows outlast 15 s); Play Now 🧠 mind chip changes the seat without redrawing the setup (flicker). Test tv89f.
- **CJK SCHEDULE (his call 2026-10-05): JAPANESE v0.89, CHINESE SIMPLIFIED v0.90 (moved up; es/it/pt/fr/de are done).**
- **LANGUAGES (his pick 2026-10-05): one per release alongside the features** — Italian v0.87, Portuguese (BR) v0.88, French v0.89, German v0.90,
  Japanese v0.91, Chinese SIMPLIFIED v0.92 (his pick; shares the CJK work: system-font fallback stack incl. canvas, no small-caps/
  letter-spacing/uppercase for CJK, space-splitting spots fixed). Names/GAME_TERMS stay English in every language. Tooling per language: tools/i18n/<lang>/part-NN.json + GUIDE-<lang>.md.
- **RECRUITING II (his yes 2026-10-04, v0.87):** (1) decision deadline + the rival house's counter-bid in the last week (Recruiter letter:
  match / outbid on another want / walk away); (2) each fighter has 1–2 WANTS (coin, arena time, fame, rudis path, home city, a friend in
  the house) revealed by scouting — pitches on a want gain big, the button previews the gain; (3) progressive scouting: ratings as ranges
  that narrow (ask around < watch train < scout / trial = exact); (5) the weekly plan becomes a real planner (assign hours by priority,
  resolves at the week's end with a report letter; direct clicks still work).
- **v0.85 server change:** the Forum starts fresh each UTC day (routes.js forumLines filters by today) — v0.85 ships a server zip (no protocol bump).
- **ONLINE LANDING II (his "all ★", 2026-10-04, v0.85):** playlists in a 2×2 grid on the LEFT (This week · Classic with tabs ·
  Familia · Ludi Infames); the RIGHT shows two tall SHOWCASE boxes — 🏆 Biggest winner (most CF in one match: CF + coin earned, rank,
  house, event) and 🪦 Biggest loser (the best-ranked gladiator who fell in Ranked that day: rank, CF, what he lost — gear value + purse);
  each with "See today's list" (the readable popup); the Today strip and "+ more" go. The online DAY turns at 8 PM New York time (DST-aware)
  for Today AND the Forum reset (30-min grace kept). "👥 Party" button beside the Invite slots opens a small panel (your code / enter a code).
- **SPLIT (his ok):** v0.87 = ALL the fixes below + Manager (hours removed, perk tree, yard standing orders, beds, Fit, stale mail,
  tools/legendsim.js); v0.88 = Domus redesign (+ storeroom/shelf) + Legend of the Sand (Manager + Online) + Recruiting II (1–3).
- **v0.87 = HIS v0.86 NOTES (2026-10-04; wait for his GO):** FIXES — Orbis: only the 🔍 enlarges (no click-anywhere zoom); Ave Arena bass
  softer; online market: no market-board art behind it (keep the layout); Storeroom: no "Buy for the shelf", buying only in Armory & Market,
  Move to shelf actually lands on a visible shelf; try-on: Flavius' Bracers show real art (no ? placeholder cards), in a V tilted inward;
  red flash on the right location — either-arm pieces (Lorica) flash both arms and can be equipped on either (flipped); Fame tooltip loses
  the "drifts to 35" internal note (sweep other hidden-mechanic explanations too); unspent perk points = checklist task, drop the extra
  top-right count; infirmary: injured fighter could not be put on the bed (bug) + Hygeia's Blessing → small card on the banner; city
  center: the kit list follows the selected fighter, kits bought for a fighter who doesn't fight that week are REFUNDED (today lost at
  week's end, 17-manager ~656); Manager mail panel half width.
  WIN REWARDS (his picks 2026-10-05, v0.87 150-v87mgr): bigger riskier purses (upset/stronger field up to ×2, streak +25%/win cap ×2);
  winners grow faster (bigger rating gain, morale, loyalty — a winner renews); fame/fans/sponsors (faster fame, fans → crowd CF, patron offer
  after a 3-win streak). Not picked: 'Flavius remembers' (Fate favor).
  GLADIATOR STATUS NAME (his pick 2026-10-05): "IMMORTALIS" (not "Legend of the Sand" — that is the top house LEGACY_TIERS tier; Invictus
  = top online rank). legendsim (tools/legendsim.js): a lone fighter rarely survives 2 seasons (Fate blood prices, road-locked infirmary,
  money, contract renewal) — balance levers offered, his answer pending.
  HIS PICKS: DOMUS REDESIGN = showcase + 4 (the active gladiator's avatar wearing his gear, 2 dotted weapon slots to its left as horizontal
  cards, purse/record beside; 4 slot cards to switch the active one; "+ New gladiator" popup only when a slot is free; Storeroom ·
  Offerings shelf · Trophies as tabs under the stage; purse = his, treasury = the house's, labelled clearly; no buying in the Domus).
  LANISTA HOURS REMOVED (recruiting/promote actions cost coin, limited per fighter per week, each says what it gained) — this replaces
  Recruiting II item (5) "weekly planner of hours". SCHOOLING → a lanista PERK TREE on the Lanista tab (perks say plainly what they do;
  task when points are unspent; one count). LEGEND OF THE SAND = career milestones (Manager e.g. top rating band + 25 wins + a Grand
  Games title; Online e.g. Invictus + 25 Ranked survived): gold laurel frame on cards/tokens, Annals line, rivals fear them.
  TOOLING: tools/legendsim.js — one cheap recruit through Manager seasons → how long to the top, where it stalls, death rate.
  MORE (same day): STALE MAIL — letters about a fighter who is sold/traded/released/dead, or whose action can no longer be taken, are
  removed (e.g. "needs healing" after you sold her); a letter whose button does nothing must not exist. The infirmary letter's "to the ward"
  link does nothing (bug). RECRUITING FIT (his pick): ✓ only for the BEST FEW — how much the fighter improves YOUR roster (missing class,
  beats your weakest, lifts your average) AND affordable; ~ decent, ✗ poor; "thin roster" no longer makes everyone ✓ (87-v67 recFit).
  TRAINING YARD (his pick): STANDING ORDERS — each fighter has a weekly routine (drill focus / care / rest) that repeats until changed;
  the yard opens on a compact squad table (one row per fighter: ratings, fatigue, routine chip, last week's gain), only rows that need
  him are highlighted (hurt, worn out, a band reached), bulk "apply to selected".
  Training Yard banner hours box = the same colours as its rail oval (light gray, v0.85 145 rail ovals) — one look per room.
  INFIRMARY BEDS STAY (his yes): fix the bed bug; 🛏 Put in bed on each bench card + the empty bed offers the bench; the bed shows the
  patient (avatar + wound mark, treatment, fit week, Take out); the plan runs until healed; one line says what a bed gives vs the bench;
  'Beds full — build another' when full.
  FORUM (his call 2026-10-05): drop the landing Forum (phrase chips + chat feed) — quick chat stays in rooms/matches; server forum routes
  stay unused; IN ITS PLACE (his idea): "📜 Acta of the day" — the last 8 online match results, newest first (time · event at city —
  🏆 winner (house) CF · ✝ if anyone fell), click → today's list; empty → yesterday's; may add a small `recent` list to the DAY record.
  ALSO v0.87 (his adds 2026-10-05): FLAKY TESTS made reliable (tv64, tv82o, tlive, tv84p — fix the waits, never skip); CHOPPY MUSIC on
  Mac Safari (main menu + during a match): 21-audio audTick schedules only 0.25 s ahead every 60 ms and skips the backlog when late
  (line ~130) → lookahead ~1 s, interval ~100 ms, skip only when the tab was hidden; verify with CPU throttling + a live match.
  v0.88 ADDS: HOT SEAT batch (tools/plans/hotseat-next.md) + PHONE PASS (after the Domus redesign). READABILITY PASS: a slice of files
  every release from now on. LOGIN DOMAIN: he runs `bash flavius.sh login` twice, 15 min apart (not yet done as of 2026-10-05).
  I18N SOURCE FIXES (v0.87): 128-v82stands `v('hurl','hurls')` verbs reach the log untranslated (wrap them); 10-meta ~591 ' lies';
  02-data ~2365 'Any remaining level ' pieces; 04-rules 's feet'/'at '; 141-v85faith is/are/waits values — all need _T or reworded keys.
  I18N PLURALS (v0.87): ~40 keys glue an English plural 's'/'' as a value ({1}); Italian can't build plurals that way → add a
  dictionary form {n:singular|plural} (picked by whether value n is '' / '1' vs anything else) in 00-lang langLook86, then revise those keys in it/es.
  CLASS CARD BACK (his art 2026-10-05, tools/art/cardtpl87/blank_card.webp 822x1122): the RULES side of the class card (title banner +
  parchment + column) → drawn live for the 8 printed + custom classes: name in the banner (class colour), ability/weakness/coin/keys/CF/
  loadout from the data, translated rules (name stays English). Figure side = his cls_<key>.webp (printed) / live figure (custom). v0.87.
  ANSWERED: Domus purse = the gladiator's own coin (lost at death); treasury = the house's 20% cut (outlives deaths, buys for anyone).
- **ICONS SWEEP (his rule 2026-10-05, v0.87):** ANY coin or CF amount shown as a reward/cost/gain uses ICO.coin (gold coin) and ICO.wheat
  (CF) — offline and online, panels, popups, results, letters, log; wherever a weapon stat or weapon action is named, use his weapon icons
  (WICO75: dmg, rng, thr = throw, abs = absorb, ammo, use, both, soul, cf) — e.g. log lines for absorbing and throwing carry the abs/thr icon.
  Changed _T keys → re-run newkeys and retranslate those keys in every language. Do it AFTER the 149/150/151 merges (touches many files).
- **v0.88 ANSWERS (his picks 2026-10-05):** IMMORTALIS (Manager) = rating 82+ AND 15 career wins AND one invitational or Superbus title;
  (Online) = Invictus rank + 25 Ranked bouts survived. Win purses: combined cap ×3 (upset × streak; was up to ×4). Recruiting II: the rival
  house counter-bids in the 3rd week a free agent is courted (match / outbid with one of his wants / walk away).
- **PLAYLIST CYCLE (his ask 2026-10-05, v0.88 161-v88pl):** the Online landing's Familia box slowly cycles (9 s, cross-fade, dots, pauses on
  hover) through every event he has TESTED AND APPROVED for online. To approve one: add its key to `ONL_EVENTS_OK88` (161) AND to the shared
  online events in 111-onlcore (EVENTS_ALL / EVENTS_TEAM, EV_SEATS) + redeploy the server. Approved events get no card of their own.
- **ONE MARKET WINDOW (his idea 2026-10-05, v0.88 first item):** the market board (boardHTML75) serves every market moment: BUY (as today),
  PICK (cards/tokens "choose a Level 2 armor / Level 1 weapon", drafts: only eligible pieces lit, rest dimmed; hover/tap enlarges a piece:
  armor = location on a small figure + AP + bonus location, weapons = damage, range, icons, bonuses in one line; "fits you / replaces X" tag),
  ROLL (random slot of a level: d4 with Roman numerals spins, the lit slot hops like a prize wheel and stops; result from the seeded dice
  first, animation cosmetic; tap skips). His picks: v0.88; drafts on the board too (CPU picks fly off); CPU buys/rolls shown by Speed
  (short peek on slow/normal, skipped on fast); a rolled empty slot falls to the closest filled one left or right (the lit slot slides there); enlarged card = his art on the left + a clean info panel beside it (location, AP, bonus, damage, range, "fits you / replaces X").
- Floor Spikes has no medallion yet.
- Armor/avatar ideas still open: bonus-AP links, severed-limb drop.

- **Hot seat — agreed next batch (after v0.80; wait for his go):** plan + review in tools/plans/hotseat-next.md. Scope = all fixes +
  table basics (whose-move pill, own gladiator names, every window names who answers, truce decree asks each bound player, seat rules,
  ▶ Resume the table, table games stay OUT of the owner's records). No curtain: other players' Mandata always show the card back, your
  own too with a 👁 hold-to-peek. Later list: only "Guest in Manager bouts". Two fixes ship in v0.80: hot seat leaking into other modes
  (lessons, Manager bouts, pen, the Online host) and the Gate of Life ghost Ludus record.
- **Online — (1)–(5) BUILT in v0.80 (with ROOMS, QUICK CHAT, the Praeco, Orbis); the rest of this note is still open:** (1) online uses PRINTED gear only (host's custom chest
  weapons / roster-set gear leak into S.chest/S.market today → crash/desync risk); (2) online results never write offline records (Annals,
  Hall, crowd memory, music unlocks); (3) Ranked: no hints/strategy panel/Focus suggestions/win odds (Custom allows); (4) no pause online
  (own animation speed stays); (5) resync by MAJORITY of humans' states, not the mover's snapshot (a tampered client can push its state
  today) + strike the odd one out. Token parts are all open since v0.47 (`achLocked` returns null) — nothing to lock. Spectator GROUP
  TURN (his design): once a rotation a 20 s window, all ticket holders choose at once (host's clock closes it, early when all answered),
  Tholo decided from everyone's choices at close, stones/offerings fire on the TARGET's turn, section moves at once. Open questions:
  refund if the target falls first; one action or as many as CF allows; offline too; CPU crowd. Also proposed: 3-stack AWS split
  (data / sign-in / server + test copy) with the login.flaviusrule.com swap, take back a seat a CPU took, Quick match, friends,
  "your turn" notices, more events, Stakes, weekly challenges that count, leaderboards/seasons, sell-back + gear score, record page,
  report/mute. His view: in-game collusion (truces/trades) is allowed — Flavius breaks truces anyway.
- **Online ROOMS — agreed spec (BUILT in v0.80):** a lobby becomes a room: created with no setup (defaults), the host
  changes event/city/rules/ticket price until the horns; Ranked/Custom FIXED at creation. Room holds up to 8 lanistas; seats = the
  event's size picked by the host within its min–max (Classics are exactly 4 — fix: today's 'Seats 2/3/4' can start a Classic with 2;
  CPUs must fill to the event's size), start needs 2+ humans seated. Host always keeps a seat; others grab empty seats first come and
  may stand; a party takes seats together (same team). Give Host to anyone (an unseated new host takes the old host's seat); host leaves
  → the earliest joiner still present becomes host (+ that seat). Host may remove a player (5-min rejoin block, not after start). Event
  change with fewer seats → last to sit stand up (ready marks reset). At the horns the unseated see a greyed room, 'started without you'
  10 s countdown back to Online + 👁 Watch. Team events: teams A/B/C/D… any split of the seated count (4v4, 2v2v2v2, 3v3v2,
  1v2v1v2v2; ≥2 teams; engine supports N teams — team1 end + S.order by team); Custom: players pick their team on their seat, host can
  move anyone, optional auto-balance; Ranked: auto-balance (host picks the number of teams; even sizes, parties together, strengths
  mixed by ratings + gear). Playlist Ranked/Custom = find a room with that event and a free seat, else create one.
- **Online QUICK CHAT + the Praeco — agreed (BUILT in v0.80, protocol 4):** full plan in
  tools/plans/onl80-praeco.md. No free text anywhere online (room text box → phrases; phrases before/after AND a short set during the
  match as bubbles, never game state); 📣 calls from a room to free lanistas who fit, Here now count + name pills (Invite/Join/Watch/Mute),
  server-side Find me a fight (fixes twin games), ⚔ Again; names = active gladiator; NO horn (nothing listens offline); Mute + Quiet only.
  Bundled fixes: AWS online count 0, room chat rewriting the lobby + lobby.list storm, full lobbies in hello/lobby.list (128 KB cap).
  Same batch: Orbis Terrarum — his empire-map style world map in a gold-bordered sideways OVAL (ends cropped) under the Playlists,
  ember glows by TIME ZONE (no IPs, no names), 'N lanistas online · M fighting · K waiting'; click → large view; beside it (right)
  📯 The Forum: Praeco feed + landing phrase chips (plan + art tools + mock2 in tools/plans/orbis/).
- **Online — the design (after v0.76, Virgilante):** Multiplayer → Online opens a Halo-Infinite-style landing space: your online
  gladiator lit on a stage (mini/avatar + armor, name, class, mind, lifetime CF, wallet, bouts survived), party slots beside them
  (+ Invite, for team events), left rail Play · Lobby Browser · Spectate · Armory & Market · Character · Hall of the Fallen, event
  "playlists" as big cards with his event art (players online, wait, Ranked/Custom), weekly challenges + empire news. A **Lobby
  Browser** tab = an old-school Age-of-Empires list of every hosted Ranked/Custom game (host, event, city, seats, gear-score range,
  ping, Waiting/In progress) with Join · Create · 👁 Watch (free) · 🎟 Ticket (wallet coin → a seat in the stands: stones, offerings,
  wagers, cheers; the price goes to host/pot). **Online characters:** made in a trimmed Studio (class, look, 375 ratings), personal
  wallet (coin) + lifetime CF, gear bought between matches up to high-end sets (veterans may arrive fully geared — intended), ratings
  grow like Manager fighters. **Death = the Fate table, Ranked only** (under 17 CF condemned; 17-19 Thumb of Flavius); the dead go
  to the Hall of the Fallen; **nothing carries over** to the next character. **Sign-in accounts** (AWS Cognito: Google / email link)
  replace "guests". **Live first:** real-time matches via API Gateway WebSockets + Lambda + DynamoDB (lobby list, live watch,
  tickets). Server is the authority for dice, hidden cards, wallets and deaths. **Play-by-link: sidelined indefinitely.**
  **Login: Google accounts** (Cognito federated). **Deploy: one CloudFormation template** (WebSockets API Gateway, Lambda,
  DynamoDB, Cognito) + a code zip packaged to S3 from CloudShell (`aws cloudformation package/deploy`; same cost as any other way —
  CFN is free). **No backdrops yet** (build from existing art; he may send some later). **The slow grind:** characters start with
  almost nothing (recruit kit, empty wallet); Roman ranks **Tiro → Gregarius → Veteranus → Primus Palus → Summa Rudis**, earned by
  survived ranked bouts + lifetime CF; matchmaking pairs similar ranks (Tiro only meets Tiro); each rank unlocks a market tier
  (Tiro: level 1 gear only); it should take a long time and reward survivors and the cunning. **Death by the Fate table from the
  very first ranked bout** (no grace). **Hall of the Fallen = only the great:** fell at Veteranus or above, or with a legendary feat
  (e.g. 25+ survived bouts, 500 lifetime CF, slew Commodus); everyone else suffers damnatio memoriae (erased).
- **Online multiplayer — earlier decisions (superseded where the design above differs; play-by-link shelved):** Model B: server-held games
  (AWS: API Gateway HTTP API + Lambda + DynamoDB, deployed by Virgilante from CloudShell with a template I write — no keys in chat;
  if keys are ever needed: environment variables AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY in the environment settings). The link is
  only a game id + a secret per seat; the server rolls dice and keeps hidden cards. Scope: the three classic events; guests with a
  name (no accounts). Turn notices: Web Push (free) + copy-link fallback; SES email optional (he worried about cost — ~$0.10/1,000).
  Versions online (agreed): every server-held match records the rules/protocol version it started on; the server
  rejects moves from a client on another version and tells it to reload between turns; a match finishes on the rules it
  began with (the server keeps the old rules module until its open matches end); the update notice (109-v761) also fires
  from the server's reply.
  Order (when resumed): engine/UI request layer (every in-match decision through one layer; test locally with two windows) →
  the AWS template → wire the client. Hosting: the game sits at flaviusrule.com/play/ (S3 + CloudFront).
- **His website (flaviusrule.com):** the public pages live in `site/` (in git since 2026-10-11, his call — never his AWS policy file or
  secrets). `bash flavius.sh release` syncs them when their hash changed (SITE_HASH in ~/.flavius.conf) and deletes the paths in
  site/REMOVED.txt; play/ (the game) and FlaviusSiteMedia/ stay S3-only. Menu = Home · Overview · Downloads · ⚔ Play (Media, Videos, Contact removed).
  play.html shows play/arena_shot.webp (retaken each release). Old site zips sit in website/ (git-excluded).
- **Readability pass, phase 2+** (Virgilante chose "phased"): files 02–07 are done (Babel scope-safe parameter renames via
  `tools/rename.js`, then comments on every function with `TWEAK:` notes; verified with `tools/samecode.js`, which
  compares code ignoring comments/whitespace). Remaining: 08–64, file by file, regression after each. Rename only
  function parameters in the safe map unless verified; never change behaviour.
- Event Designer: a full step-by-step wizard was deferred (Virgilante chose the "Beasts hub + pieces" scope for v0.54).
- Play Now setup: the city/modifier header above the map could align exactly to the map width.
- Hot-seat LAN/Online lobbies are placeholders.
- Audio in the artifact-downloaded copy: v0.55 added Safari/iOS fixes; confirm with Virgilante which device/browser it was.
- Scans: Virgilante's original PDFs are not in the repo (uploads only). `pdfimages -png <pdf> <dir>/i` then
  `python3 tools/mkscans.py <root> [out]`; rtok.webp now has 5 rows (RTOK_ROWS).
- Arena deck scans: uploaded as arenacards1-3.pdf (thirds). mkscans `arena`/`events` sections map cells → scans (`ARENA_CARDS`,
  `EVENT_CARDS`); no scan for Forge +3 AP (26, 70) or Floor Spikes (46); the Orpheus event scan is a different print (kept).
  Drive connector caps downloads at 10 MB, and drive.google.com is blocked — ask for uploads or <10 MB parts.
- Decided (v0.59): Ludus cut ties → most CF, then most coin, then d12 roll-offs (`ludusRank` in 72-v59); Orpheus keeps the
  game's event art. Naumachia: a random team goes first (seeded shuffle in 05-flow); teammates still play back to back.
- Keep watching: shared-Store writes on load (conversions must be idempotent and saved once).
