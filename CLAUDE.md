# Flavius Rule Arena — handoff notes for Claude Code

A single-file HTML/JS/Canvas adaptation of **Virgilante's board game "Flavius Rule"** (gladiators in a 13×13 isometric
arena, Roman-themed). Current version: **v0.82**. Owner: Virgilante.

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
  `65-stats55`, `66-mgr55`, `67-studio55`, `68-fix55`, `69-v56`, `70-v57`, `71-v58`, `72-v59`, `73-credits`, `74-zora`, `75-naum59`, `76-chariot59`, `77-rivalry`, `78-v60`, `79-screens`, `80-aitiers`, `81-v63`, `82-access`, `83-edsteps`, `84-v64`, `85-v65`, `86-v66`, `87-v67`, `88-v68`, `89-stands`, `90-armfit`, `91-v69`, `92-v70`, `93-v71`, `94-v72`, `95-v73`, `96-armlv`, `97-armor73`, `98-avatar73`, `99-phone73`, `100-sica73`, `101-rec73`, `102-minis73`, `103-v74`, `104-cards74`, `105-mgr74`, `106-v75`, `107-v751`, `108-v76`, `109-v761`, `110-v77`, `111-onlcore`, `112-online`, `113-onlmatch`, `114-onlnet`, `115-v79`, `116-onl79`, `117-onltz`, `118-onl80`, `119-onl80rules`, `120-v80fix`, `121-onl80fix`, `122-v81play`, `123-v81art`, `124-v81onl`, `125-v81fix`, `126-v82fix`, `127-v82onl`, `128-v82stands`, `129-v82beasts`, `130-v82vis`.
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
  Current words: EDITOR12 (all editors), MUSICA16 (all 16 themes), LUDUS50 (+50 coin), CHARD / DUCKIO (bonus houses), ARMORFIT (the printed-set fit tool), LOBBY77 (Online preview), ONLSRV (shows the Online server box on the sign-in card). Touch screens: HOLD the main menu version badge (126) = the C key.
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
  never delete old assets, index.html Cache-Control no-cache, invalidate only the changed files. Test `tupd76`.
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
  Tholo's sculpted token from his card (laurel, grey hair/beard, cape), main menu: Play Now + Manager one row, 🎓 Tutorials button folds
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
- **Releases always run the full suite** (tools/release.sh does it). Old runner: `(nohup sh tools/runreg.sh >/dev/null 2>&1 &)`
  then watch `tools/reg.txt` for `ALLDONE` (~11 min: 3 tests at once, `-j N`).
  Pass = every block ends `exit=0` and prints `ERRS []`. Run a subset: `node tools/smartreg.js tv53 tpia`. (v0.76: 138 tests.)
- `t12` plays every event via sims (slow). Version tests: `tv50…tv54`-style files (`tv52`, `tv53`), plus feature tests
  (`tcls` classes, `tlook` accessories, `tbye` bye weeks, `temp53` closures, `t53s` studio, `tres` results,
  `tmgr54` manager, `tpia` piacula, `t54a` studio/event designer, `tv55` ratings/letters/loans/home/grades,
  `tstat55` Studio ratings and allies, `tv56` mail and ratings help, `tv57` the v0.57 batch, `tv58` ships/prototype, `tv59` the v0.59 batch, `tv60` Road from the record + Annals loop, `tv60b` tame/counters/CF offerings/truces, `tv61` screens, `tv62` five minds, `tv63` the v0.63 batch, `tv64` missios/chariot tokens, `tv65` yard/fatigue/infirmary, `tv66` bumpers/phones, `tv67` recruiting board, `tv68` checklist/ledger/economy/rivals/stands tabs/armor on the avatar, `tv69` armor designer/equip points/fit tool, `tv70` baked fits/left-side fitting/code word, `tv71` printed pieces/coin/summa rudis/round marker/log pin/wager bubbles, `tv72` set cards/merged fit/system weapons/3D minis, `tv73` the v0.73 batch, `tv74` printed set/class cards/manager hours/recruiting, `tv75` the v0.75 batch, `tv76` the v0.76 batch, `tv77` the Studio tidy).
- When a UI move breaks an old test intentionally, update the test (keep its intent).
- Visual checks: write a short Playwright script, screenshot, and look at it.

## 6. Release workflow
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
  MANAGER COUNCIL (his answers 2026-10-04, for v0.83): six advisors with a face + Roman name — Consilium (strategy), Recruiter (★ pick),
  Doctore (yard), Medicus (ward), Clerk (money letters), Barracks master; faces from the spectator/patron face maker, rolled ONCE per career
  from its seed (fixed, no re-roll; old careers get theirs on first load, saved once); they never leave (the poachable house medicus stays a
  separate hire). The face shows only INSIDE an opened letter (envelopes unchanged) + a council card in Your ludus (faces, names, specialty).
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
- **His website (flaviusrule.com):** redesigned to the game's look and delivered as zips (site + play/ folder) — NOT in git (his
  call; the source also holds his AWS policy file). Pages keep their class names; styles.css rewritten; play.html added;
  FlaviusSiteMedia/ (logo, covers, STL renders) lives only on S3 — he will send it for previews.
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
