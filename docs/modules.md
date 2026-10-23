# Module notes — what each version module does (moved out of CLAUDE.md on 2026-10-15)

Grep this file for a module name (`317-v101mgrui`), a global (`ARM94`) or a kill switch before changing an area. One bullet per
module or batch, oldest first. Each module's own header comment is the primary source; this file is the index. New modules add
their bullet at the END of the "Systems" list below (the release that ships them also adds a line to docs/history.md).

## Systems
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
  Current words: EDITOR12 (all editors), MUSIC (every theme, v0.85; the old 16-theme word is retired), LUDUS50 (+50 coin), DUCKIO (bonus house), ARMORFIT (the printed-set fit tool), LOBBY77 (Online preview), ONLSRV (shows the Online server box on the sign-in card). (Touch screens: holding the main menu version badge = the C key, 126.)
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
  ★ pick, Medicus risks), board life (`LIFE84`: blood fades over 4 rotations, dust puff per fallen, rubble settles; Light board Auto/On/Off — REPLACED in v1.10 by Quality Low, see 417),
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
- **v1.0 THE 3D CROWD (313-v100crowd, last before 08-setup; his 3D answers: crowd everywhere + the same people in the forum; display only):** sheets
  pre-rendered by `node tools/art/crowd100/make.js [spec|cls|probe]` (production rig92 token, CPU WebGL ~40 s a look; meta between the CROWD100_META
  markers in 313): assets/crowd100_s0..s5.webp = 6 looks × rows sit/sitcheer/sitfist/stand/standcheer/standfist/walk0-3 × 4 facings (cells cropped,
  [x,y,w,h,ax,ay,hx,hy,maskN]; anchor = seat for sitting rows, feet for upright), tunic in a KEY grey + its mask in the sheet's right half (`mx`) →
  tinted by canvas multiply (no pixel reads → works on file://); crowd100_c_<class>.webp = printed-class forum stand-ins (stand + walk0-3). ~85 KB a
  look, ~35 KB a class, 793 KB total; mkshare skips crowd100_* (standalone = today's crowd). STANDS: draw91 replaced while the sheets are decoded
  (`cr100Draw`: same seats/walk-in/rings/cushions/hover/CR91.seen); pose from 193's look91 as 209/283 wrap it (o.up / o.st); facing: near stands
  backs, far stands front, walkers by their step; look by fem/beard/skin (`cr100Look`), tunic = 193's mantle (fan: allegCol, else robeOf) mixed 40%
  with the city wool (`cr100Of`, cached per spectator); size ×1.2 (`CR100.size`), seated on the tier edge; sprites cached per look·row·facing·tint·
  device bucket (`CR100_CV`, counts into CR91.hits/miss). CLARITY: a near-stand stand-up whose crown would reach the sand cheers seated (`CR100.sat`),
  leftovers clipped at the sand's edge (`cr100Clip`). FORUM: `cityImg` wrapped for 'fg' figures → a cached canvas of 172's figure box (townsfolk =
  crowd looks tinted by robe, guards = soldier, gladiators = their printed class), walk rows while gliding, facing their step; placeholders in
  CITY.imgs stop 172 building svgs; 279's warm-up counts the sheets. Kill switch localStorage flavius_crowd100off=1 (193 + 172 exactly). Test `tv100cr`
  (incl. pixels inside the board identical with/without the crowd, RNG.s untouched by crowd draws, ON/OFF perf); shots tools/plans/crowd100/shots.js.
- **v1.0 MAIN MENU SHOW IN 3D (282-v100menu, before 288-v100tray so 288's cover pause wraps it; display only):** 08's show (mmPlan times/picks,
  positions, painter's order) redrawn by `mm100Loop` with RENDERED frames: assets/mm100_g_<class>.webp (walk/idle/flex/hit), mm100_d_<class> (duel atk/kneel,
  only the challenger's strip loads), mm100_lion/wolf/snake/bear/tholo (walk/attack, then walk off dragging), mm100_commodus (walk/idle/raise/atk/hit/die);
  eagle stays painted (mmEagle); duel dust = light puffs at the feet (mmOverlay wrapper). Cells [x,w,h,ax,ay] in `MM100_META` (between markers, written by
  `node tools/art/mm100/make.js [glad|hum|beast|clip]` — gladiators = production rig92 token + gear100, beasts/Commodus/Tholo = the newest
  tools/plans/look100/beastN_rig.js + beastN_hum.js; clip → tools/plans/menu100/menu100_show.webp). ~630 KB webp total (~490 KB a visit), right-facing
  native, left mirrored, front row 1:1 (`MM100_FRONT`), beasts `MM100_BOOST`. menuShow wrapper HOLDS the show until the strips decode (≤1.5 s, `MM100S.cap`;
  late strips take over only during the walk-in); else the flat show (230's MM95/mm95Raster) for that visit. Reduce motion / Animations Off = one still
  group photo, no loop. The canvas is tainted on file:// (screenshots, not toDataURL). Kill switch localStorage flavius_mm100off=1. Test `tv100mm`.
- **v1.0 ZOOMED CAMERA WITHOUT HITCHES (294-v100zoomcam, last before 08-setup; display only):** cause measured (tools/perf95/zoomab.js, zoomflush.js,
  zoom100.js, trace.js `{"zoom":1,"wait":ms}`): every ~0.18 screen of follow-camera travel 208's padded stone layers (192 under/deco/top/light) took a new
  reference and repainted all four (a turn change = 3-6 repaints, each a 70-450 ms draw on the test box); pinch/zoom toggles repainted them + 260's
  tiles + 194's wear every frame. (1) zoomed by z (z² ≤ `Z100.maxK` 2.25) the stone layers are painted ONCE in a frame holding the whole arena
  (padding (z−1)/2 + `Z100.m` 0.1, origin from the unzoomed draw captured in a duelCam wrapper) — panning never repaints; above it 208's margin with
  the new reference centred on the camera's destination; (2) while TW changes (this or the previous draw) the last crisp stone layers, 260's tiles
  chunks and 194's wear bake are drawn SCALED through 260's ImageBitmap pieces (`z100PutS`), crisp again `Z100.hold` 160 ms after the zoom holds;
  (3) zoomed while a CPU acts (p95Defer), a second draw with the same document.timeline time waits for the next frame. Kill switch
  localStorage flavius_zoomcam100off=1; stats `Z100.stats`. Remaining zoomed cost = rasterising a full board every frame the camera moves
  (headless software raster ≈ 16 ms a draw, same as unzoomed); next lever: static layers as GPU-composited canvases. Test `tv100z`.
- **v1.0 FRAME METER (288-v100fps, last before 08-setup; display only):** Settings → General → Performance "Show frame meter" (`SETTINGS.fps100`, default off; row added by a `set98General` wrapper, `applySettings` wrapper runs `fps100Sync`). On = corner overlay `#fps100` (bl/br/tl/tr, ⇱ in the expanded view, localStorage flavius_fps100pos): fps over 1 s, slowest frame of 5 s, share of frames >16.7 / >33 ms, 60-frame sparkline, green >=55 · amber 30-54 · red <30; click expands to the measured screen (`fps100Screen`) + top 3 `LAYERS93.report()` layers. rAF timestamps only (`F100`), loop stops when hidden or off (no loop, no element when off); it keeps the page awake while shown (tooltip says so; idle92 still pauses CSS animations). Test `tv100fps`, shots tools/plans/fps100/.
- **v1.0 THE ARENA LOOK (277-v100arena + small 192 edits; his picks 1a 2b 3b 4a 5a; prototype tools/plans/look100/NOTES-arena.md, shots tools/plans/arena100/
  via shots.js):** a stone family per arena `A100[k]` (k = THEME.arena99 → S.locIdx → Roma) with its own tileable texture assets/stone100_<k>_<key>.webp
  (one loaded on demand via ar91Img), cap, rail + colours, band. 192 now has `ar91NearGeom()` (towers + near walls in ONE helper), `ar91Face(g,Q,kind)`
  hook (foundation sides + tower fronts) and passes 'floor' to `ar91Fill` on flat fills (277 lays an iso matrix there). RAIL on the old faint near-stand
  line, painted at the end of 'under' (before the tiles → never over sand/pieces): bronze / stone balustrade / marble parapet by stone family, metal per
  arena (`A100BRZ` gilt Roma, bronze Arles, dark Nemausus, verdigris Pola), Capua the gilt parapet; corner towers get a PLINTH down to the walkway,
  piers ONLY at run ends (tower faces, both sides of each stair opening, the near corner). Dado BAND with a motif on all 12 (ar91Face + far-wall foot via
  an ar91TopPaint wrapper). THEMES99 palettes `A100PAL` (Capua/Thysdrus/Pompeii benches, Leptis green), AA checked; Ludus keeps plaster; Light board
  skips rail shadows/gradients. `A100X.last` = rail geometry of the last bake. Kill switch flavius_arena100off=1 (bare 192, pixel-identical). Test tv100r.
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
  FOLLOW-UP 2 (his 1a 2b + the archer bug): spears/tridents stay upright in the armed stand. SHAFT FIT (game.js `SHAFT`, `shaftFit`): when a pose
  would shrink a figure below 0.72, its held weapons (not bow/lyre/shields; the trident's net gathers in) are raised toward the diagonal about the grip
  (15° steps ≤ 60°) then shortened (≥ 0.6) for the render only — every printed class × every preset now keeps ≥ 70% (the max load ≥ 60%: its scutum).
  ARCHER: H5.bow targets are relative to the POSED shoulder (`rel`, x = out) with fixed poles (`pole`, `drawR.elb` = where the draw elbow should be),
  the bow stance turns the chest (H5.bow.j via `stanceFor`); `elbowCheck`/`bowOk` (api.elbows, 8 facings): bow arm nearly straight bending out,
  draw elbow behind shoulder + head at shoulder height; every kit × preset elbow bends the natural hinge (anat). fitTile({keep:true}) keeps the
  shaft change until restore(). Shots: + tools/plans/gear100/{armprobe,lunge}.js, lunge_sheet.png. tok93.js is 257 KB of tv100g's 260 KB cap.
  FOLLOW-UP 3 (his Aim note: the draw arm went through his body — the torso was turned the wrong way, +60° left, so the draw hand had to cross
  the chest into the neck): Aim = side-on (chest −100°, head +50° back to the facing, bow straight ahead, centred −100 mm), draw hand at the
  right cheek, elbow back/out at shoulder height; the armed stand's drawR raised to the cheek (rel [0.12,0.13,0.16]); labrys' second hand gets
  an elbow pole (two.pole). CHECKS: `armClash` (hold.js; api.clash) = arm centre lines vs chest/belly/neck/head volumes (ARMCLASH, tol 15 mm),
  tv100g runs it on every kit × preset × 8 facings; bowOk adds draw hand ≤ 0.1 m from the cheek (R.ch) + forearm ≤ 35° off the arrow (R.fa).
  Probe: tools/plans/gear100/aimprobe.js (strip + close-up; spec + wL search). tok93.js ≈ 259.8 KB of the 260 KB cap — trim comments before adding code.
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
  Tests `tonl100tt` (2 windows), server `v100tt.test.js`. The vote's drop (`tt:1`) is a MARK only: 113's pump calls onlmDrop for every
  'drop', so 290 wraps onlmDrop → tt100DropMark, and the drop applies only at a shared wait point (`tt100DropReady`) — it used to end the
  current turn wherever each screen was (the tonl100tt 1-in-8 desync).
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
- **v1.0 HIT FEEDBACK (277-v100hit, last before 08-setup; display only — wrappers on hurt/hurtNPC/fx/drawFX/boardShown/avatarSVG return the base's own value; never S or onlHash):** a blow on a gladiator = ONE readout (cause icon WICO75 dmg / ✊ / 🐾 / 🪨 / ⚠, "4 → Chest: 2 armor, 2 health") + a 6-zone body pip beside the token (lit zone + one total) on 227's #fx95 overlay, queued per piece (`H100.list`, never stacked); words Missed / Blocked / Absorbed N / Dodged / Saved; the fighter-panel avatar gets grey −N armor / red −N health / "Severed" over the location (`.h100n`, svg tagged `data-h100`), the panel PEEKS at your target `H100_PEEK` ms (display state `H100.peek`, never S.boardPid) then snaps back; other fighters' exchanges = faded small marks; `SETTINGS.hit100` full|mine|quiet (Settings → Board & pieces → 🎯 Hits); hits a human takes outside his turn = tick marks on his avatar (`H100.ticks`, hover "Leo: −3 left leg", cleared at BUS turn.begin); coin/CF text floats never show on the board — the icon flies to the panel counter (`.h100fly`) + pulse95; Fast = no pop-ups/flies/peek; Reduce motion / anim off = still. Kill switch localStorage flavius_hit100off=1 (tv95a 3 uses it to check 227's old floats). Test `tv100h` (incl. seeded dice + log ON == OFF); shots tools/plans/hit100/.
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
- **v1.0 PUSH ANIMATION (294-v100push, last before 08-setup; display only):** a doPush wrapper plays the shove BEFORE the real doPush (S still on the old tiles): the pusher leans into it (`push100Tilt` around its base + a 0.3-tile lunge, face82), the pushed piece/pillar slides one tile (ease-out), the pusher follows, then a small wobble, dust puff (fx) and scrape marks (decals layer via a drawLayers93 wrapper, fade 9 s); spike damage lands after the slide. Pieces drawn with a ctx offset (drawPlayer/drawNPC/drawPillar wrappers), so ROT89/zoom follow. Fast: a CPU's / other seat's push = one paced frame, YOUR own still plays (`push100Own`, his pick a); snap / sims / HEADLESS / Reduce motion / Animations Off / hidden tab / kill switch flavius_push100off=1 = today's jump. Hook `push100Pose` for the future pose sheets. Never touches S, dice or onlHash. Test `tv100p`; shots tools/plans/push100/.
- **v1.0 MY LUDUS + ADVISORS (294-v100ludus + 294a-v100scenes, last before 08-setup; his mock tools/plans/mock100/ludus.html rounds 1–6, shots tools/plans/ludus100/):**
  a final mgrHTML wrapper reshapes Your ludus: BANNER `.roomhd.b73.b73-ludus.lu100ban` (week medallion, "Week N · Match Week" — the name STAYS Match
  Week, his call; 202's .lst91 chips + "N this week"; the Match Week card `.lu100mw[data-mg=tab][data-id=night]` with bout chips: day · bout, face
  (`lu100Face`), name, fatigue dot `s.fd.fresh|tired|worn`; a bye = stone plate + next fixture). WEEKLY TASKS = 270's `#desk99` restyled as parchment
  (`.lu100tasks`; every desk row/handler kept; desktop: pinned to the tiles' height, list scrolls in `.lu100tl` + `.lu100more`; ≤900 px in the flow,
  phones keep 270's 6-row fold) + "Coming up" + a Flavius line; 📬 Letters `[data-lu100mail]` opens the LETTERS DRAWER `.lu100mail` (270's letters +
  past + Acta) over the tiles (a letter opened by any path shows it). TILES `.lu100tiles`: Team → roster tab · Promote / Upgrade School =
  `[data-mg=run]` promote / fac → 23's run panel under the tiles (`LU100.panel`, ✕) · Armory → armory tab · Advisors (wide) = `#council83.lu100fz`
  BRONZE FRIEZE (each `.c83p` a head, `[data-lu100adv]`; 249/256 chips kept hidden in `.c83x`; an unread advisor letter LIGHTS the head: colour,
  glow pulse on opacity only, `.note`) → popover `#lu100pop` (level + progress, effect, latest advice + 📜 Read it `[data-lu100read]`, ⬆ Train =
  249's `[data-c98up]` or the earned line; phones = bottom sheet + `.lu100scrim`). Links row: 🏛 Consilium's counsel · 📜 Ledger (· 🎓 Schooling in the
  lesson). Art: `SCENE99(k,mode)` (team/promote/school/armory/council) = his D5b scenes; `scene100(k,mode)` = an <img> of a cached blob, rasterised
  once to WebP (290's News banner uses it too). ADVISOR LEVELS (his a): `ADV100` — Consilium +2 coin a level above 1 per bout your fighters fought,
  Doctore +1/+2 yard Doctore level (y92DocLv wrapper), Medicus new wounds 1/2 weeks sooner (`med100Apply`, inj.md100), Clerk 3%/level of wages back,
  Barracks +1 morale/level for fighters under 70; player's house, Lv ≥2, week end (`adv100Fx` = the text). No save change. Kill switch
  localStorage flavius_ludus100off=1. Test `tv100l`.
- **v1.0 MY LUDUS ROUND 2 (297-v100ludus2, last before 08-setup; his answers 2026-10-11, shots tools/plans/ludus100/r2_* via shot2.js):** BUILDINGS
  BELONG TO THE ADVISORS (`LU2_FAC`, TWEAK): Doctore → Training yard + Practice stands · Medicus → Valetudinarium + Kitchen · Barracks master → Barracks +
  Shrine + Armory · Clerk → Stables (+ the Ledger) · Recruiter → the Ludus grade note · Consilium → overview (grade, buildings by advisor `.lu2o[data-lu100adv]`, the next
  build you can pay for and who holds it, unmapped FAC keys). Rows live in his popover (a `lu100PopHTML` wrapper) and use 23's own `[data-mg="build"]`
  (FAC_COST, levels, one project a week). `.lu2bm` 🏗 on a head with an affordable building (inside .c83f via a `lu100Frieze` wrapper). Upgrade School tile
  = `data-lu100adv="consilium"` (no data-mg). Lesson step 'fac' lights the Stables holder's head (spot/say/until rewritten; tv93t clicks the spot).
  CLERK REBATE: `weekMoney` wrapper adds `r.clerk` (= 294's endWeek sum, `lu2Rebate`) to net; the header badge (`[data-lu2led]`, click/Enter → Your ludus
  + Ledger panel) prints "wages N (−R Clerk)". Roster + Armory banners = `scene100('team'|'armory','banner')` (`roomScene73` wrapper, img.lu2ban).
  COUNSEL: the Consilium's head lights ONLY for a warning/decision this week (`lu2Counsel`: treasury in debt, wages cover <3 weeks, a loan payment due, a rival challenge letter waiting; plus 66's own 'consil-' advice letter via the mail path) — quiet week = dark; `w.lu2c` = week read (key 'lu2:consil' → counsel panel); the counsel stays readable from his popover any time; "The Consilium's counsel" button in his popover,
  "📜 Ledger" in the Clerk's; the links row keeps only 🎓 Schooling. Kill switch localStorage flavius_ludus2100off=1 (tv100l runs with it). Test `tv100l2`.
- **v1.0 THE MANAGER ROOMS (298-v100rooms, last before 08-setup; his mock tools/plans/mock100/rooms.html + NOTES-rooms.md round 4, shots
  tools/plans/rooms100/ via shots.js):** Roster · Training Yard · Infirmary in the recruit3 look. A final mgrHTML wrapper RE-HOMES the finished
  page (live nodes move, every data-* handler / MGR state stays): compact fresco banner `.rm100ban` (the room's advisor as a round head
  `.rm100adv` — Barracks master / Doctore / Medicus — + the count box = the old `.roomstat`), a LIST column `.rm100list` and a DOSSIER
  `.rm100dos` (container rm100d; ≤760 two columns, ≤560 one; ≤980 px viewport the list goes on top). ROSTER (`.rm100.st95list`): rows
  `[data-mg="lsel"]` (slot I/II/III/B/L · face · Ovr · W–L · fatigue dot · ⚕/✂ · weeks); `.depth.rm100stt` = the three `.st95slot` nodes as
  starter tablets (their Change… + 🪑 Bench kept in a foot); portrait block (17's header line), ratings (17's `.ratgrid` + Overall),
  personality · record · scars (g.hist wound lines) · last (g.recent); Bench & loans (⭐ Promote / Lend… moved from the old rows, ⚕ Ward =
  data-inf90go, 70's ⇠ Recall); the contract TABULA `.rm100con` (Clerk's line, wage, weeks, `.cl76` clauses, askWage, ✍ = data-mg extend,
  ⇢ Lend, ✕ release); Keeping him (the card's `.acts`) + a fold with the rest of the card. ST95.tab is forced to 'chart' while rendering.
  YARD: MGR.tr92 = the dossier fighter (rows = 269's `[data-y99sel]`; the lesson forces MTUT.B); his `.y92c` beside a portrait, the other
  cards in a hidden `.rm100hold` (buttons still answer); `.y92doc.rm100doc` (bronze head = CSS filter, intensity as a segmented row);
  the week's plan tabula `.rm100plan` (moved [data-y92same] / [data-y92care] / [data-y92all]); DRILL PLATES `.rm100drills` = buttons
  `[data-y92pre="id|k"]` only when allowed (else `data-rm100pre` + disabled with the reason; the dossier card's own `.y92pb` are removed);
  `.y92trials.rm100tri` = three big plates (art replaced). INFIRMARY (`.rm100.rm100-ward.iv90`): 183's `.iv90list` rows; `.rm100w3.iv90mid`
  = patient (the HP/fatigue bars moved in) · MARBLE STATUE (`rm100Statue`: avatar image greyed to marble, a lost limb MASKED off the image +
  211's severed path as a pale ghost, the wound = a radial spot `.rm100spot`; 183's `.glow90` kept but hidden) · the road back tabula (fit
  weeks read from the tiles); `.iv90care.rm100care` = plates (its `.iv90s` sections display:contents, every button gets art). Art = 294a's
  scene100 + mini_<cls>.webp + council faces (no new assets). 36-mtutor spots patched: 'lsel' → the list row, 'ydrill' → `.rm100drills`.
  Old layout tests run behind the kill switch (tv84r, tv99y); tv93t/tv95c read the new rows. Kill switch localStorage
  flavius_rooms100off=1. Test `tv100rm`.
- **v1.0 MAP INSETS (295-v100maps, last before 08-setup; his "all 7", backlog "MAP INTEGRATION"; display only):** ONE helper `mapInset100(o)` → cached
  HTML (`MI100.html` ≤240): an svg whose viewBox crops assets/map.jpg around the places it marks (city x,y = LOCATIONS 0..1, same frame as MAP_PX/290's pins;
  birthplaces beyond the 12 arenas = `MI100_XTRA`, off-map → an edge arrow); pins by kind (host/next lit gold + opacity glow, home blue, sel red, won green,
  pin2 plain), curved route, labels with a dark halo, optional `extra` svg. Background = one cached raster per crop+size (`mi100Bg` → idle canvas cut →
  blob URL, ≤64; http(s)/blob only — file:// keeps the viewBox crop; the standalone's data: map = ONE blob URL `mi100Src`). Places: (1) final mgrHTML
  wrapper: 244's `.strip96` gets `.mi100tr` home → host; (3) Recruiting card `.mi100rcard` ("<city> · his/her home", sx) + home-city filter
  `select[data-rc100]` (MGR.rc100, rows removed like MGR.rf); (5) 290's `.wd100hc` house home `.mi100hcw`; (2) mailLive wrapper: letters keyed
  `MI100_LETTERS` (consil-/fa85/pg84/…) or carrying loc96 get `.mi100let` with the cities their text names; (4) roadVisualHTML wrapper: the painted road →
  `.mi100road` = the real map (HALL_ORDER, won ✓, next lit, token on the last arena won; keeps svg#roadSvg + .roadtok/data-to for 48's slide) + a
  numbered stop list; (6) pg84SetupHTML wrapper: `.mi100pgw` map whose pins carry `data-pg84="city"` (140's handler; data-dis when 3 picked), ⚔ badges
  where the league fights, the old buttons kept; (7) `#mi100tip` on hover/focus of 290's `.wd100wk` (fine pointers; `window.__mi100hover` in tests).
  Reduce motion / calm = no glow pulse (`.mi100still`). Phones ≤600 px: insets shrink / drop under text. Kill switch localStorage flavius_maps100off=1.
  Test `tv100mp`; shots tools/plans/maps100/shots.js.
- **v1.0 ENTER ANY EVENT (296-v100any, last before 08-setup; his picks 1a 2b 3a 4a 5a 6b 7 8a; mock tools/plans/mock100/anyevent.html, shots tools/plans/any100/ via shots.js):**
  the week's HEADLINE SPECIALS sit on Match Week on top of Bouts I–III as extra `w.night.bouts` entries, tier `spc100` (`TIERS.spc100`) with `b.any100={fee,src:'fx'|'ed',rx,side:{gid:A|B},paid:{gid:coin},hire:{gid:{by,c}},ed:{gid:mgrId}}`, `b.fee` 0. OWN DAYS (his 2a): `b.any100.day` 0/1/2 = Fri/Sat/Sun from `any100Hash(w,'day:'+ev)`, nudged so two specials never share a day (default Sunday for old ones); `any100Key`/`any100Seq`/`any100Before` = play order (day, a special AFTER the classic bout of its day, array order); classics keep array slots 0-2 (night match, Gambit, fixture code index them) while 17-manager's order guards + Simulate Match Week, the tracker, Match Week cards, weekStrip73, 294's chips and the week card all follow that order and show `any100DayShort/DayOf` (Fri ★…).
  NEVER A SPECIAL (his 5b): Gauntlet and Commodus (`ANY100.ban`) are out of the pool and, as the week's fixture, stay the Main event (not turned into a headline). A special fixture leaves the Main event (Main → Classic · Cassian, `n.any100.fx` keeps it; nightHTML sees the classic fx) and becomes the first headline;
  the editor adds one more from `ANY100.pool` (hash of world id + absolute week — `any100Hash`, never the dice RNG). None in bye / rivalry / lesson / closed-bye weeks.
  ENTRY FEE per seat you fill (solo purse/10, team purse/(seats×2.5)) paid on entry, refunded on withdraw until the full card is set; purse main × 1.8 (fixture ×1.2×its
  multiplier, rookie ×0.55); team purses split between the winners (applyBout wrapper), a hired partner's share goes to the hirer. ONE EVENT PER FIGHTER: `any100Enter`
  (THE entry function — player, rivals, mgrsim) moves a fighter off his bout (`n.any100.from`), `any100Drop` puts him back while that seat is open; st95Fill skips
  fighters in a special. TEAM events (teams===1): your side = the one with more room, partner = yours / hired free agent (`any100HireFee`) / editor's pick
  (`any100EdPick`, free); sides in `b.any100.side`, `any100Order` makes ents A/B/A/B (boutCfg's i%2); rivals fill one side first so a whole side stays open.
  RESTRICTED ~every 3rd week: one special takes only B and above (70+) or C and below (≤61) (`ANY100.hi/lo`, trait96Grade(effOvr)); picker greys + a click says why.
  CARDS FILL EARLY: makeNight → `any100Rivals` (seats left open); `any100FillAll` (rivals, then free agents, then new fighters in every open seat of every bout and
  special; `n.any100.full`) runs on travelClick (paid) or the week's first bout (runBoutSim / watchBout / boutCfg). fillNight never fills specials (wrapper hides them
  behind a phantom bout). Specials can be booked BEFORE travel (classic entries still need the road paid). UI: `#any100wk` "This week at <city>" card above the bout
  cards (`.a1ev` rows: day, art, chips, seats, purse/fee, `[data-any100="pick|i"]` / `"drop|i"`), picker `#any100pk` (`.a1fr` rows `sel|gid`, partners `.a1po` `pt|k|gid`,
  `ok`, `x`), special bout cards `.spc100` (Bet/Watch/Fight/Simulate kept, our Enter/Withdraw), tracker chips `.bt85.bt100s` (day ★). mgrsim: `ANY100=off|play`
  (play = the scripted lanista books every special). 1 season × 8 runs base: off 1104 coin / 6.1 wins · rivals only 1031 / 6.3 · player books all 1045 / 7.5 (no exploit).
  No save migration (new fields only on the current night). Kill switch localStorage flavius_any100off=1 (no new specials, no week card). Test `tv100ae`.
- **v1.0 PLAY NOW IN SANDSTONE (300-v100pn, last before 08-setup; his mock tools/plans/mock100/playnow.html + NOTES-playnow.md A1–A5 + the event ROW (V99 2b, A1b: a plain sideways row, not a ring); shots tools/plans/pn100/ via shots.js):**
  a last setupBody wrapper `pn100` over 247's pn98 page RE-HOMES controls (ids/data-*/handlers/CFG untouched): top bar "Play Now" · tabs · date chip (Follow removed) ·
  summary · 🎲 · #goBtn as the SANDSTONE primary `.sb100.pri` (porphyry + gold leaf; `.sb100` = secondary, `.dan` carbon black, sizes l/m/s — shared CSS); "THE EVENT"
  panel `.pn100ev`: EVENT ROW `.pn100car` > `.pn100trk` (all cards one size in the list's order, picked one gold-outlined, scrolls sideways by wheel/touch/trackpad; `[data-pnev]` = 106's own click → #evSel change, ‹ › `[data-pn100step]` SCROLL the row (don't pick), arrows/Home/End
  move a roving focus, Enter picks, focus restored after the redraw; `pn100Mount` (MutationObserver on #mBody) scrolls the picked card into view, no slide;
  #evSel kept hidden in `.pn100sel`), then card | map (#mapbox, #locSel, #roll6/#roll12, class modifiers) | name, blurb, ROUNDS TABLE `pn100Rounds` (END_TXT, RULE_INFO,
  ZONES), record. OPTIONS `.pn100opt`: FOLLOW THE SCHEDULE switch `[data-pn100follow]` = `CFG.follow100` (on: this week's ev + loc, LOCKED — lockbar + Unlock, cards `.lk`,
  map dimmed + pill, #locSel/rolls disabled; clicks blocked on a WINDOW capture listener because 106's [data-pnev] handler is a document capture; `pn100Follow()` drops it
  when CFG no longer matches; 🎲 Random event (pnRand90 wrapper) turns it off), 📅 Season schedule fold `[data-pn100sched]` (scheduleHTML), the .opts labels in a 3-column grid
  (short labels, full text as the tip), Day/Night buttons `[data-pn100night]` over #oNight91. HOT SEAT on the same page: the wrapper runs pnLayout75 → pnTidy90 → stands92 →
  pn98 itself for CFG.hotseat (106/108/247 skip it), then `.pn100hs`: "Hot Seat" + 🪑 ONE SCREEN, blue pass strip `.pn100pass` (`[data-pn100hst]` = SETTINGS.hsTurn90), 51's
  .hsbanner kept whole in `details.pn100prof`, seats tagged `.pn100tag` 👤 PLAYER N / CPU, no "Play as a spectator"; 🎲 keeps who plays; in the match a BUS turn.begin
  listener shows `#hs100rib` "👤 <name> — your turn" over header.bar ~1.5 s (2+ humans; Reduce motion = no slide). SUBMENUS: a modal wrapper dresses '⚔️ Play now' /
  '💼 Manager mode' (opt.onOpen) as the sandstone tablet `#modal.sand100` (svg icons, slabs `.sb100` — the primary keeps class `primary`, the two save buttons `.half`, Back
  moved into `.sand100ft` (still a [data-mi] inside #mboxEl), #mClose = stone stud); body.sub100 steps the menu back (scale 1.045, 14 px, blur 3.5, 50%; calm/Reduce
  motion = dim only; phones = bottom sheet `.grab100`, no blur); 288's mm100Covered wrapper pauses the menu show under it. Kill switch localStorage flavius_pn100off=1.
  Test `tv100pn` (tv90p / tv98b read the new places).
- **v1.0 PRE-MATCH BRIEFING (301-v100brief, last before 08-setup; his mock tools/plans/mock100/brief.html + NOTES-brief.md round 2 (1c 2a 3a 4a 5a); shots
  tools/plans/brief100/ via shots.js):** 07-ui's eventBriefing → modal stays THE call (title "📋 The briefing"/"📋 This event" kept in #mTitle, visually hidden;
  one primary button value 1, close 1 = Esc), so 05-flow's first turn, 113's ONLM.info (online: local, never an input), lessons/sims (splash) and every test
  answering '#mBtns button' keep working. An eventBriefing wrapper sets `BF100.cur` (1 opening / 2 reopened) → the briefingHTML wrapper returns
  `brief100HTML` and the modal wrapper adds `#modal.bf100` (removed on close via opt.keep, and by any other window's onOpen), the footer note `.bf100note` and
  the sandstone "Enter the arena" / "Back to the sand". Parts: header (event card, kicker CLASSIC · ROUND I OF III / TEAMS · SPECIAL EVENT / … IN PROGRESS,
  name without "Classic · ", Summa Rudis chip `.brsr.bf100sr`, meta pills city/date (not online)/Day-Night/gladiators-teams/stands, gold How to win with
  `BF100_HOW` per event), Flavius face assets/flavmood_smug|pleased + a line (`BF100_LINES` 2a pool, Math.random; reopened = FLAV_LINES.pleased); rounds
  `.bf100rd` (chips keep `rchip no`, FIRST / NOW / ✓ DONE, `BF100_END` per event|end); rule cards `.bf100rc` (`BF100_EVR` = an event's own complete set,
  gold `.ev`; else blurb + The Fate / Arena deck (beasts left in S.deck) / Blessings / Mandata on-off / No CF · no abilities; ≤6, no digital cards); seats
  `.bf100st` (portrait = Manager gLook / custom / online look / gladPortrait + ptokf81 round, mini_<cls> or figure, YOU / CPU · mind / PLAYER, team chip, fallen
  ✝ "fell in round N" from an eliminate wrapper → WeakMap `BF100.fell`, display only). Phones ≤600: full screen, button sticky at the bottom, seats swipe
  in `.bf100strip`. Online joiners load the host's snapshot and skip it (as before). Kill switch localStorage flavius_brief100off=1. Test `tv100bf`.
- **v1.0 RECRUITING DOSSIER + SIGNING DAY (299-v100recruit, last before 08-setup; his mocks tools/plans/mock100/recruit3.html + signing.html, shots
  tools/plans/recruit100/ via shot.js; display only):** recruit tab = toolbar (.rtb85) above · `.mgrid.rc100g` narrow list (≤300 px, rows ★ · face · name ·
  class `.rc1cl` · grade · interest; Fit/Ask/stars folded by CSS, still in the DOM) | the dossier · the board (.pipeline) below. The free agent's card
  (last detailHTML wrapper) is RE-HOMED from the finished HTML: its own buttons keep data-*/classes/disabled reasons (data-rec98a, data-rec98p, data-mg
  visit/gift2/offer, data-rec74, data-recstep, data-reccmp, want88 chips). Head `.rc1head` = portrait fresco + info/chips (map inset `.rc1map` moved in by
  the mgrHTML wrapper) · Stats Tablet (`.gs98 .gb98.rc1g` rows, same tips/data-gb98/data-p; the overall row carries data-po, not data-p) · personality
  `.pe98` (lock names `rec98Next`). Steps `.rsteps.rc1steps` (gold/green/red, sticky on phones). ① `.rc1act` cards (mural, ✓ this week, ★ ADVISED
  `.star85.rc1adv`) + "What your recruiter learned" / "On the street"; ② `.rc1hg` house grades row, `.rc1pit` pitch cards (gain = rec98PGain), Win him
  over `.rc1wo`, Suitors `.rc1su` (parma100 shields) + "Signs at ~N", notes `.rc1nr` (fit badge); ③ `.rc1off` (the old slider/meter/offer) + Where he
  stands + the contract tablet `.rc1tab` (`[data-rc100tab]` rows follow #ofWage/#ofWeeks/#ofBonus/#ofPledge/#ofRudis88 live). Leftovers → `.rc100x`.
  Murals: assets/rec100_<k>.webp (tools/art/recruit100/make.py from the mock's plates), face83, gArt, mini_<cls>.webp, scene100. Banner = the forum
  panorama + the Recruiter's roundel (roomScene73 wrapper). SIGNING DAY: signCard73 wrapper when g.truth98 (`sg100Show`): seal → staggered flips
  (scouted → real grade + number) → verdict `sg100Verdict` gem (overall +2, or +1 with the ratings up on average) / fair / dud (mirror) with the
  Recruiter's line; gem = laurel + burst + sparks (one-shot, ≤4 s), dud = crack + dust + greyed portrait; click/key = last frame, Esc/backdrop/buttons
  close; Reduce motion / Animations Off = `.rm` static card. Keeps #signCard .sgbox .sgface .tr98 [data-sgclose]. signGlad wrapper remembers the signing
  bonus + precisions in memory (RC100.sig/pre). C2b (his answer, one step at a time): the step bar is a TABLIST (role=tab, aria-selected); only the chosen step's section is in the card (145's [data-recstep] handler rebuilds the card from `MGR.recStep`, so the choice survives MGR_REDRAW; default = `recStepNow`); head/Stats Tablet/personality stay above; desktop >=1251 px CSS compaction keeps each tab's card under 900 px tall (scout ~590, court ~750, offer ~820 at 1440; banner + toolbar above still scroll away); phones keep the sticky bar. C3b (his answer): GEM only when the real overall's letter grade is at least one WHOLE grade above the scouted estimate's (two ladder steps on F/D/C/C+/B/B+/A/A+: B to A, B+ to A+; a plus-step alone is fair), DUD the mirror, else fair; the ratings-mean clause is gone (`RC100.gem` 2, `sg100Verdict`). Kill switch localStorage flavius_recruit100off=1. Test `tv100rc` (tv99g's list width check updated) (tabs + verdict-threshold cases added).
- **v1.0 INSIGNIA (304-v100insig + 304a-v100insigui, last before 08-setup; spec tools/plans/mock100/NOTES-banner.md + mock banner.html/banner_engine.js (ported), his answers:
  name Insignia, 1a parma on the rank streamer from Ludus Magnus, 2a solid emblem + ink + shadow, 3a wear = slider only, 4a full design online / sculpt offline;
  shots tools/plans/insig100/):** ONE function `insignia100(design,kind,px,opt)` → data URI (cache `INS100.uri`, key = kind + px + `ins100Hash`), `.img()` →
  a decoded Image | null for canvases; kinds vexillum · signum · flammula · velarium · scutum · parma (+ internal `pannus` = the cloth alone at 600×340, and
  `wall` = the arena's hanging cloth); px < 44 = no texture/inscription/sculpt. Design `{v:2,c1,c2,fg,pat,emb,top,ins,layers,baked,trim{gilt,tassels,fringe,bar,
  topbar,fc},wear}`; READ-TIME adapter `ins100Norm` (old `{bg,fg,txt,shape}` → c1/c2=bg, ins=txt, emb=shape, plain, gilt, wear 0; rgb() colours too) — nothing
  rewritten on load; `ins100Row` = what Save stores (v2 + bg/fg/txt/shape kept for old pages); `ins100FromLook` = an online look89. Emblems = FLAG_SHAPES (read
  from `flagURI0`, opacity stripped) + DR_SYM98 (`sym:*`) + `INS100_R` (bull, capricorn, scorpion, medusa, gladii, rete, palma, murmillo, thraex, manus, spqr,
  num). LOCKED SYSTEM designs `ins100Sys()` (33: empire, 14 cities, 8 Domus ranks, 7 regions, arena wall cloth + drape, Flavius). 12-settings: `const flagURI`
  became `flagURI0` + `let flagURI` (the shim → pannus). Replaced: flagURI, houseFlagURI/flagImg (pannus), flagChip/famFlagChip + 290 parma100/scutum100
  (parma/scutum), blankFlag (v2), drawFanFlags (small vexillum), 252 dr98URI (flammula, `ins100Rank(k,look)` adds the house parma from idx 4) / rg98Flag
  (vexillum), 175 d89Crest (parma) + d89Banner crest (scutum), hc98HTML/l89VisitHTML (full-design parma), onlRankBar82 (parma on my streamer), 145 roomScene73
  (Signum pair + vexillum), flagPickerHTML (whole v2 row), 192 ar91FlagSrc/ar91DecoKey/ar91DecoPaint (velarium per section, key = design hashes + decoded
  flags; a decode redraws only that layer), ar91Banner/ar91Drape (wall cloths, tile names/FR icon still painted on top), ar91Pennant (Flavius = flammula).
  Rivals/families stay derived (mgrFlagOf/famFlagOf). Language flags (190) separate. STUDIO tab 🛡 Insignia (key 'flags'; 247's designer tabs off it):
  `insignia100StudioHTML` — six kind buttons, big preview, tabs Cloth/Pattern/Emblem/Inscription/Sculpt/Trim & wear (`[data-in100k|t|pc|fg|pat|emb|top|fc|a|f|tr]`,
  in-place refresh `in100Refresh`), the old sculpt bench ('f', #fdPrev), rack = crActs('f') (DEL76 via [data-cr="del"]; cards `.in100rc.studcard`), system
  cards = sysActs(`data-in100sys`) Copy & edit only, ⬇ Use for my house (m.flag); aquila topper only for an online Domus Aurea. ONLINE: the Domus look editor
  (`.lk100`, d89LookHTML wrapper) sends {c1,c2,crest,c3,pat,ins,trim,wear,top}; 111-onlcore "v1.0 INSIGNIA" `cleanLook100` = `C.cleanLook89` (CREST100,
  ins = Roman caps ≤ 12 word-filtered, no layers; same error texts) → server deploy. Kill switch localStorage flavius_insig100off=1 (today's flags exactly).
  Tests `tv100in`, server `v100ins.test.js`.
- **v1.0 ONE BUBBLE FAMILY (303-v100bubbles, last before 08-setup; spec tools/plans/mock100/NOTES-bubbles.md + bubbles.html, his B1a B2 B3 B4a B5b B6a;
  shots tools/plans/bubbles100/ via shots.js; display only — never S or onlHash):** five variants in one parchment shape (tail tip on the ANCHOR):
  SPEECH (think() → S.bubbles, read only; angry/gift tint the ink), THOUGHT = the same box in italics, SHOUT = Flavius's FLAV.line (drawFlavius wrapper
  blanks it for the base: never painted on the canvas), WAGER (93's wagerBubble re-pointed, rises), CHAT (118's onlBubble80 re-pointed; off-sand seat →
  a tab from the board top; 234's room phrase restyled by CSS), CROWD (16's drawEmotes replaced: the emote glyph `e.g100` inside, phones glyph only
  unless zoomed; 172's city chatter calls `cityBub100` — the old chips when it returns false). Board voices live in ONE HTML layer `#bb100`
  (replaces #bubbles + #wbubs; aria-hidden; z 3 under #fx95): measured once on arrival (`bbMeasure`, again only when the plate/size changes), placed
  after every draw() by transform only (`bbPlace` → `bbLayout`: slots N → NE → NW → E → W, Flavius E → W; keep-out = head columns `bbHeads`, Flavius's
  box, the turn chip, the edge, earlier bubbles; nothing fits → least covering, `forced`); ZOOMED (ar91Zoomed) the layer hides and the layer 'bubbles'
  (order 85, after 'pieces', added to LAYERS93.defs) paints the same items from cached pictures (`bbPic`, LRU `BB100.pics`, scaled while TW moves).
  Name plate only with 2+ speech/thought up (`bbSolo`); cap 3 speakers + Flavius + ≤4 wagers (thoughts first, then oldest speech, chat never);
  life .16 s in + 2 s + 50 ms/char (≤6 s) + .3 s out, Slow ×1.6, Pause/hover hold, chat 6 s; FAST = none (chat excepted); turnSweep drops thoughts,
  event over/clean-up clears. Reduce motion = `#bb100.rm` fade only (calm: 82's global no-animation). Click on a bubble = capture listener on
  coordinates → scrolls #log to its line (the click still reaches the board). `keep100(rect,list,pad)` = the shared keep-out test. `BB100.set(on)`
  switches at runtime (tests). Kill switch localStorage flavius_bubbles100off=1 → today's bubbles. Test `tv100bb` (variants, cap, keep-out, zoom,
  reduce motion, kill switch, seeded dice + log ON == OFF, PERF ON vs OFF draw+layout per frame flat and zoomed panning).
- **v1.0 ONLINE BRIEFING FOR JOINERS (305-v100briefonl, last before 08-setup; his B1b; display only):** after `onlJoinMatch` loads the host's snapshot and before the first beginTurn (S.turnNo 0, empty queue, fighters only: ONLM.me < onlmFighters(); watchers, ticket holders, onlAttach rejoins and mid-match joins skip it) the joiner opens 301's briefing locally via modal() with `ONLM.info` raised for that one synchronous call (113 then never records it; nothing in S/onlHash). It never holds the match: it closes on BUS turn.begin of my seat, on any non-info modal() (decision / remote-owned window), on an incoming input in `onlmReady` (the pump needs !CUR_MODAL), onlExit, gameOver; info windows (rule pop-ups) queue behind it as behind the host's. Kill switch localStorage flavius_briefonl305off=1. Test `tonl100bf` (+ tv100bf).
- **v1.0 ONLINE ROOM (302-v100lobby, last before 08-setup; his mock tools/plans/mock100/lobby.html + NOTES-lobby.md revisions 1–3 (10a 10e 10f/g 10i,
  C1a–C4a); shots tools/plans/lobby100/ via `SHOT=tools/plans/lobby100 node tools/tests/tonl100lb.js flavius-arena.html`):** a LAST onlRoomHTML80 wrapper
  lays the finished room out again (`lb100Room`): MOVES the stateful controls (`.r80-set` selects incl. 290's turn timer / 189's Day-Night / 252's `.pw98r`,
  206's `.snd92`, 271's foot `.r80-go`, `[data-onl=rcall]`, `[data-onl=leave]`, 137's `.cd83`, the unseated `.r80-over`, `.tbl82`, `.onl-busy`, `.eta100`,
  264's `.rk99`, 252's `.pw98b`/`.rg98t`) and rebuilds plain buttons with the same `data-onl` (rsit, rhost, rkick, rsay). Root `#onlRoom80.lb100` (not `.r96`).
  BANNER `.lb100-ban` (event card, name, `.r80-tags` chips incl. Ranked gate medal, ROOM CODE `.lb100-code` + ⧉ `[data-lb100copy]` → "copied ✓", 📣 crier HOST ONLY
  "N of 3 left · next in m:ss" (`[data-lb100cr]`, one 1 s timer only while it rests) / "Crier spent", 🚪 Close/Exit lobby); NO ✉ Invite / Invite by FID in the room.
  SEATS `.lb100-seats > .r80-seat.lb100-s` (portrait `onl80Face` + `onlFig` token, 👑, class · house, `lb100Gr` medal 18 px + `lb100Dr` Domus-rank chip,
  234's bubble `.r96-bub.lb100-bub[data-bub96]` under the token, ✓ Ready ribbon, team edge `--tc100`, open = dashed "a CPU if empty at the horns" + Sit here);
  5–8 seats `.lb100-cmp`. `.lb100-watch` 🧍 Standing → 👁 Watching once `L.startAt` / unseated. Settings: host's `.r80-set` in a 4-column grid, guests a dashed
  read-only grid `.r80-rules.lb100-ro`. LIST `.lb100-side`: 8 `.lb100-row` (`[data-u96]`, `.r96-u` kept for 240/252 hooks, empty = dashed), medal 14 px, Domus
  banner, host's `.lb100-ra` 👑 Give host · ✕ Kick on hover/focus-within; quick chat Room (`LB100_ROOMQ`) / Taunts (`LB100_TAUNT`; codes added to 111's
  "v1.0 SERVER BATCH A" §7). `medal100(k,px)` = the 8 Glory-rank medals as inline SVG (also house cards). 127's name markers ⟦n⟧ stripped (`lb100Nm`).
  C1a: Lobby Browser `.onl-lbtop` gets `form[data-lb100jf]` `#lb100In` (R-… / FID-…; `lb100Join` → route `lobby.code`, 🔒 asks via 252's pw98Ask, refusals in
  `#lb100Msg`, code_live offers 👁 Watch); `hc98HTML` wrapper: ⚔ Join `[data-lb100hj]` + the room line while `house.card` says `now.room`. C2a ROOM CODE =
  `ONLC.roomCode100(id)` (derived, nothing stored); route `lobby.code` in routes.js "v1.0 LOBBY ROOM" (joins THROUGH lobby.join; FID quota; docs/backend.md
  "v1.0 lobby room") + MOCK_ROUTES['lobby.code'] + house.card now.room. Kill switch localStorage flavius_lobby100off=1 → the v0.96 room (tonl96, tonl80,
  tonl89p run with it). Tests `tonl100lb`, server `v100lobby.test.js`.
- **v1.0 SANDSTONE MAIN BUTTONS (306-v100sand, last before 08-setup; his A3a extended; display only, shots tools/plans/sand100/):** the 300 slab look on
  every window's MAIN button, written for existing `.btn`s (own CSS generator `sd100CSS(groups)`, same tokens/noise URI as `.sb100`; sub-lines wrap).
  modal(): a MutationObserver on #mBtns (NO onOpen added — 290's NOTICE detection relies on that) tags `.sd100` + `.sd100p` (the .primary / only /
  non-cancel of a 2-button confirm, size m `.sd100m`) / `.sd100d` carbon (destructive label via LBLRX: Delete, Abandon, Release, Remove, Leave, Close/Exit
  lobby, Restore defaults, Cancel them, Ad Flamma…, or class danger/red) / plain = sandstone s. LEFT ALONE: #modal.full / .dock100 / .sheet100 / .sand100 /
  .bf100 (CSS :not scope), buttons with card art/img/svg, >8 buttons, inline colours. ask76 wrapper: yes = primary m (carbon when destructive or a 🗑 title),
  no = sandstone. CSS-only hooks: Manager .wkloop End the week + Back, ⚡ simall, rail .endwk (≥601 px only), Online data-onl="quick" (Ranked = porphyry,
  Custom = sandstone), room ▶ Start (m) + 🚪 leave (carbon), Studio designer Save (data-*="save"), Settings [data-rst84] (carbon). Panel controls, chips,
  tabs, rails, the action bar, list rows untouched. AA: secondary #3a2410 ≥4.8:1, primary #f6dc98 ≥6.9:1, carbon #f08a70 ≥7.6:1; ≥40 px; m → s under
  600 px; html.sd100rm (Reduce motion / Animations Off, synced on tag + applySettings) = no lift; transitions only transform/filter. Kill switch
  localStorage flavius_sand100off=1 (no html.sd100on, no tagging). Test `tv100sb`.
- **v1.0 THE TITULI (307-v100tituli, last before 08-setup; backlog "v1.0 EXTRAS" 2 + his RULE: no emoji as achievement art):** ONE catalogue `TITULI100`
  (`tit100Cat()`, entries {id, n Latin title, sub, how, modes manager|playnow|online, tags (+ 'any' when 2+ modes), kind trophy|feat|imm|onl|season, art(px)})
  merges TROPHY_LIB (manager + playnow), the Annals ACHIEVEMENTS (ids `pn:<k>`, Latin titles in `TIT100_ACH`), Immortalis (manager + online, one titulus),
  the online Domus keys (`o:first:<ev>`, `o:rank:<k>`, `o:vday`, `o:surv10/25`, `o:thumb`, season `o:s100v/p/x`; slew:tholo|commodus = the Play Now
  `pn:tholo`/`pn:commodus`, `tit100ForOnl(k)`). Art = svg/img only: trophySVG, rtok cells as svg <image> (`tit100Tok`), sr_*.webp, medal100, Fate card
  'f:9' (`tit100Card`), insignia100 scutum (`tit100Scutum`), ptok81/ptokf81 rings, map, Flavius face, coin, generated laurels (`tit100Laurel`, `TIT100_LAU`).
  Earned/progress = read-only adapters `tit100State(e,mode,D)` (290 tit100Mgr for the lib, g.imm88; Store hall/ach, hall/progress, hall/road, hallTrophies
  via `tit100PnLoad`; ONL82.dg trophies + glads) — no save change, no new collection. Views: 290's `wd100TrophyView` replaced (filters fed from the catalogue;
  plaques carry `.t100p[data-t100]`, lib plaques keep data-wd100tp), hallHTML('hall') achgrid → plaques (`.t100ann`), 137's `onl83Trophies` shelf
  (`.t100sh`, `[data-t100k]`, TROPHY_IC83 emoji no longer shown), hc98HTML season 🏅 → laurel. "Titulus earned" `#tit100rv` (`tit100Reveal`, queue ≤3,
  3.8 s, click dismisses, `.rm` static under Reduce motion/anim off) from achGrant / hallTrophy / earnTrophy / imm88Stamp / new online keys on onlRedraw
  (`tit100OnlCheck`, first read = baseline); the old 🏆 toast for the same honour is swallowed (`tit100Hush` + mToast wrapper). Kill switch localStorage
  flavius_tituli100off=1. Test `tv100ti` (tv100w2 counts the manager catalogue); shots tools/plans/tituli100/.
- **v1.0 THE FIRST HOUR (308-v100first, last before 08-setup; backlog "v1.0 EXTRAS" 1; shots tools/plans/first100/):** a `firstRunPrompt` wrapper gives a
  brand-new player (flavius_firstrun 'pending', no flavius_first100) the welcome ⚔ Play your first match (guided) · 💼 Start your first ludus (guided) · Skip
  (value 'play'; the hint switches stay folded with #frhAll — tv52). FIRST MATCH = a real startEvent: Democritus at its own city, Soldier vs three CPUs on Play
  Now's easy pick (Novice), seed `FH100.seed` 100 (`fh100Match`). Tips `FH100_MATCH` show ONCE each at their moment (first turn + the Choice, Action/move, a
  target in reach + Focus, a beast within 3, Market lit, End turn, the Fate when S.over) in `#fh100` (the coach look `.tutcoach.cue`; desktop: placed just above
  #actions by `fh100Place`, never over a button; phones: full width above the dock); Got it / No more tips (st.off); a tip closes when its moment passes;
  `.fh100spot` = outline only, NEVER a click guard. FIRST LUDUS = the player's REAL career (the 36 lesson's sandbox blocks clicks, ruled out): `fh100Mgr` opens
  Manager mode on Create with NEWMGR.diff 'easy'; `FH100_MGR` tips g_create · g_desk · g_recruit · g_yard · g_night · g_sim · g_end · g_review (📬 Letters), the
  rail tab of the next unseen step outlined; tied to the first non-lesson world opened (st.cid, st.w0), done when the week turns. State localStorage
  flavius_first100 {seen,off,m,mDone,gDone,cid,w0}; an unfinished guide = `#fh100mm` card on the main menu (▶ Play it / ▶ Continue · ✕ ends the guide). Tick =
  PERF92 sweep 'fh100Tick()' (400 ms). Never in HEADLESS, sims, online, hot seat, lessons; DOM only (no S, no dice). Kill switch localStorage
  flavius_first100off=1 → the old welcome. Test `tv100fh`.
- **v1.0 DAILY + WEEKLY CHALLENGES (310-v100daily, last before 08-setup; his pick, backlog "v1.0 EXTRAS" item 4; offline only, no server):**
  `dc100Spec(kind,key)` builds a challenge from a hash of its key ONLY (FNV-1a `dc100Fnv` → its own mulberry32, never the dice RNG): today = UTC
  day 'YYYY-MM-DD' (`dc100Day`), this week = ISO week 'YYYY-Www' (`dc100Week`); event (`DC100_EVD` classics/Triumviratus/Orpheus/Ludus; weekly
  `DC100_EVW` + Gauntlet/Commodus solo) + city + your class (seat 0) + CPU classes/minds (daily Apprentice–Veteran, weekly Veteran/Master) + fixed
  seat ratings (seat.stats) + twist(s) (daily 1, weekly 2, solo 1) + the event SEED. SAME DICE EVERYWHERE: `dc100Begin` runs startEvent under
  CFG.roster 'classic', Flavius presides (sponsorStart), strangers in the stands (CROWD_CACHE emptied, seatOffDuty skipped), no seedOpening,
  no calendar move (careerHoldsClock); `S.daily100` {kind,key,att,tw,human}. TWISTS `DC100_TW` (all guarded by S.daily100): nomarket (openMarket /
  cpuMarket refuse) · pauper (you 0 coin) · bare (you no armor; giveLoadout wrapper) · wild (beasts' aggro on you; newState wrapper) · noheal (your
  elixirs refused; useItem) · cf20 (a win counts only with 20+ CF) · mandata (opts.mandata) · mods (opts.mods, a city with modifiers). SCORE `dc100Score`
  = win 100 + 3·CF + 60·rounds done/rounds + coin ≤30 + 15/gladiator + 5/beast + pace max(0, 40 − 2·rotations) (win only); medals bronze 100 ·
  silver 250 · gold 400 (48 sims: wins 300–550, losses ~30–230). Attempts counted at the start: daily only attempt 1 counts (later = practice; left unfinished = ✕), weekly 3, best counts,
  a 4th refused. localStorage `flavius_daily100` {v,d:{day:{n,a:{att:{s,m,won,f,at}}}},w:{…}} (backups carry flavius_* keys; 60-day prune);
  `dc100Streak` (today may be open), 14-day calendar. UI: Play Now submenu "📅 Challenges" (value dc100), strip `.dc100pn` above 300's `.pn100ev`
  (`[data-dc100pn]`), window `dc100Open` (own screenIntent; `[data-dc100go="d|w"]`), results window `.dc100res` card + 📅 Challenges, no Replay.
  BUS 'challenge.done' {kind,day,score,medal,counted,att} (for the Tituli). MEDALS ONLY (his 2a): no Annals/achievements/Hall/trophies/crowd memory/Ludus/autosave/editor unlocks while a challenge plays and 2 min after (`dc100NoRec`; 119's record list + its offline collections). His 1a 3a 4a 5a = as built; 6 (more twists) parked. Kill switch localStorage flavius_daily100off=1. Test `tv100dc`; shots
  tools/plans/daily100/ (SHOT=dir node tools/tests/tv100dc.js …).
- **v1.0 REPLAYS (309-v100replay, last before 08-setup + the "v1.0 REPLAYS" section of 111-onlcore + its block in routes.js; docs/backend.md "v1.0 replays";
  no protocol bump):** a replay = the opening snapshot (`matchSnapshot` at the FIRST beginTurn, the same thing 113 hands a joiner; a match loaded from a save
  slot starts from that save, `start:'load'`) + the ordered HUMAN DECISIONS + the end hash (`onlHash` at gameOver entry) + GAME_VER. Recorded by observing:
  onTile wrapper (`tile` r,c,mode,focus), a document-capture [data-act] listener (`act` with the button's data-* copied; m-/inspect/trophies local), the
  outermost `modal` wrapper (`modal` value + title 40 chars + hash at open; windows that look opened from a bar — a trusted click outside the board/actions,
  or ≤300 ms after one — carry `u:1` and playback passes over them unless something asks), seatToggle (`seat`), simSnapShow (`sim`), gear88Swap/Take (`gear`),
  timeUp (`tu`). Inputs made while something resolves are filed by POSITION {t, s: RNG.s} and replayed right after the roll that reached that state
  (best effort). Settled inputs carry the hash before them (a mismatch marks "out of step"). Never recorded: HEADLESS, sims, lessons, e94 test play, replays.
  LOCAL: last `RP100.KEEP` 10 + ★ pinned (localStorage `flavius_rp100i` index + `flavius_rp100.<id>` gzip/base64 via CompressionStream; ~7 KB all-CPU
  Democritus), 📜 Saves → 🎞 Replays tab (hubBody76 wrapper; `[data-rp100go|pin|del]`, delete = second click), results window "🎞 Watch the replay"
  (value `rp100w`, plain events only — Manager bouts from the Saves tab). ONLINE fighters fetch `match.get` at gameOver (ids blanked: `ONLC.replayAnon100`);
  Ranked → `replay.put {id,h,v}` (server builds it from ITS OWN OPEN + IN#, once, settled only, 30-day ttl, GSI1PK 'REPLAYS'); `replay.get` for guests too;
  mock mirrors (`w.replays100`). 293's after-match card gets 🎞 Watch + real link text; `#replay=<id>` (b100Deep re-pointed + a capture hashchange) opens
  local first, else the server. PLAYBACK `rp100Play(id)`: offline = matchLoad of the opening → beginTurn, own pump (`RPP`) applies inputs at the same
  settled points as 113 (twin buttons, onTile, decision windows answered from the list — never opened; rule pop-ups pass by; the viewer's own windows
  open); online = onlmLoad + onlmWatchOn (S.onl.rp100, watch:true; NET.req match.*/stands.*/bet.* answered locally). `#rp100bar`: ⏸/▶ (Space), ×1 ×2 ×4
  (×4 = Fast; `SPEEDMUL.rp100x2`), ⏭ Next turn, Jump to round (forward = Fast until S.ri, back = restart), 🔊/🔇 (audToggleMute), ✕ Exit (restores SPEED,
  HINTS, CFG.hotseat/mode, LAST_CFG; startEvent/menuShow also exit). No records while playing: 224's record list + setPurse + Store.put/del +
  careerHoldsClock + matchSaveOK; gameOver is NOT run (end card: ✓ the same ending / ⚠ drifted; "made with vX — may not replay exactly" when GAME_VER differs).
  Kill switch localStorage flavius_replay100off=1 (no wrappers, the old "coming soon"). Tests `tv100rp`, server `v100rp.test.js`. HIS ANSWERS (2026-10-12, 1a 2a 3a): local replays stay OUT of backups; Manager bouts watched only from the Saves tab; server replays 30 days, Ranked only, once a match.
- **v1.0 ONLINE BALANCE (316-v100balonl + the "v1.0 BALANCE" section of 111-onlcore + its block in routes.js; docs/backend.md "v1.0 balance"; his O1–O3 from
  tools/plans/balance100/REPORT.md; no protocol bump):** O1 a printed piece lost in a Ranked bout comes home DENTED (pc.st 'damaged', dmg 1, stays on the
  survivor; out.dent100) instead of used up; a Ranked death: the human killer still takes ONE piece (printed or named), every printed piece nobody takes
  goes home to the dead man's house shelf dented (toMarket / mockToMarket83 wrappers via C.homeRoute100 — last history 'fell'; house by DNAME#), named
  → Flavius's chest as before, so the used market stays thin; printed repair = ceil(value/10); AWARD LADDER 24/30/36/42/50/60/70/80 Tiro→Invictus (gift
  coin keeps the old table, AWARD_GIFT100). O2 RANKS Glory halved (0/45/90/275/575/1050/1750/2750; WORLD COUNTS recounted once,
  'seeded100'). O3 one rank-up gift per house per rank (D.rkg100, giftsIn + after100 → out.giftDup100). Test switches C.BAL100.dent/home. Tests server
  v100bal (+ routes/v83/v84/v85/v89a/v91/v92 updated), tonl83, tonl83u, tv91e.
- **v1.01 MANAGER UI (317-v101mgrui, last before 08-setup; his notes 2026-10-13 + answers 1a 2a 3a 4a 8a; header lists M1–M45; test `tv101a`; kill switch localStorage flavius_v101aoff=1):** one final mgrHTML wrapper (`a101Post`, one template parse) + wrappers on detailHTML / recAdvice74 / wd100Banner / wd100LayerSVG / wd100TrophyView / tabStat73 / lu100PopHTML / lu100Frieze / lu2Panel / mailLive / sendLetter / applyBout / face99. Recruiting: no Stable filter, tab always opens on Free agents (`P101.last`; 17's gcard keeps 'mine' internally), board under the banner, no plan line, wide list column, Offer step pulses (`rc101rdy`), Hard start (`w.startDiff`) hides ★ below top Recruiter level. World: Season tab only via the League banner button (rail button removed in DOM, MGR.tab 'sched' still works), house card without Scout/Challenge ("Team Details"), bare Imperium map, Tituli = Honours | Glass case (`WD101.sub`), coin + fame on plaques, Manager trophies pay no CF (22-trophies), unseen honours set `w.tit101seen`, rail ovals `.mcount.c101` (perk points, unseen Tituli), My Acta (`wd101Acta`, per-bout purse in `w.my101[abs][name]`). My Ludus: "The Council" (Consilium on top, `.c101top`), his counsel + the Ledger live INSIDE the popovers (`lu2Panel` redefined; nothing opens under the tiles), Promote = centred popup (`.lu100panel.pr101`), a popover closes on any other click, the Clerk writes the Sica loan letter (`clerk-loan`, `clk101Sync` in mailLive; `adv:'clerk'`), negative treasury = `.tiphint.neg101` above the banner. Other edits: 77 rivalLetter, 157 rudis tooltip, 290 house card / Season hook / banner kicker, 36-mtutor wording, bout cards nowrap (CSS).
- **v1.01 WINDOWS + CITY (320-v101win, last before 08-setup; his M21 + M39; display only):** M21 the correspondence windows RE-HOMED (template
  parse, live nodes keep every data-*/id/disabled reason) into the v1.0 rooms look: TEAM SCREEN (teamHTML wrapper → `.v101tm`: fresco banner
  `.v101ban` with the lanista portrait, house shield + name, chips incl. opinion, gradebox/tcbtn/← Back moved in; roster rows `.v101lr` (fav kept,
  grade chip, 🔍 `.v101cardb[data-v101card]` → Recruiting Signed elsewhere on him); Correspondence `.v101cor`; envoys as PLATES `.v101plt`
  (`v101Plate`: icon · title · chips from the old <small>); trade / debt `.tradebox` → wax tabula `.v101tab` (rm100tab classes)); a CONTRACTED
  fighter's card (detailHTML wrapper, skipped while rosterBlockHTML runs via `V101C.ros`) → `.v101card[data-v101fc]` (`.v101fh` fresco head +
  chips, every `.sect` block → `section.v101s` via `v101Sections`, Keeping-him rows → plates, yours: contract tabula `.v101con` with the wagebox +
  clauses, Extend `.v101pri` / Release `.v101dan`; a rival's: poach tabula `.v101poach`); ROSTER (final mgrHTML wrapper): 298's `.rm100keep`
  plates + the More fold as sections. Sandstone via 306's `sd100CSS` on `.v101pri/.v101sec/.v101dan`. M39 CITY: door89 wrapped to record painted
  door heights while bake89 runs → `V101C.h` = 0.85 × median door (z × ZK89, clamp 0.34–1 tile) → CR100.cityH (313's figures) + ours; cityImg
  wrapper (outermost): 'me' = a crowd look tinted by his robe (house colour in Manager), 'yd<cls>' = crowd100_c_<class> (walk frames while
  lunging), 'yddoc' = the bearded look in brown; flat fallbacks rescaled into their box; figShadow89 scaled; placeholders seeded; calm = stand.
  Kill switch localStorage flavius_v101coff=1. Test `tv101d`; shots tools/plans/v101/shots/ (before_*/after_* via the scratch shot scripts, tv101d_*).
- **v1.01 DOMUS RECORDS (end of 111-onlcore + 324-v101domrec; docs/backend.md "v1.01 domus records"; his ask: 2 records a house):** Ranked seats write the old top-level `D.bouts/wins/lifeCF/survived/fallen` (history before v1.01 stays there, so the Ranked line shows a small ⓘ "includes earlier Custom matches played before v1.01" when `D.pre101>0` or no `D.split101`), every non-ranked seat writes `D.cu`; `domusRow` carries `cu/split101/pre101`; the Domus banner (`d89Banner`), visit page (`l89VisitHTML`) and house card (`hc98HTML`) print "⚔ Ranked: …" + "🎭 Unranked: …" (the 137 `onl83Profile` pop-up still shows the old single record). Glory/Domus rank/coin/trophies untouched. Tests `tonl101r`, server `v101rec.test.js`.
- **v1.01 ONLINE (322-v101onl + the "v1.01" section of 111-onlcore + its block in routes.js + index.js `requireGoogle`; docs/backend.md "v1.01";
  findings tools/plans/v101/SECURITY.md; no protocol bump):** online kits/loadouts follow the v1.0 classes (Damnatio kit Iron Helm + Belt I, no Falcata;
  322 makes 315's `bal100Old` a plain call). SECURITY: snapshots (`match.open`/`match.snap`, `C.snapBad101` → `snap_bad`, opening written once) and moves
  (`C.inBad101` → `in_bad`) carrying markup are refused; the page cleans every state it loads + other pages' moves (`snap101Clean`, kill switch
  flavius_snap101off=1); result tables cleaned against the room (`tableFix101`) + `AUDIT#<match>` for odd/unverified Ranked tables (wave 2's server check
  reads them); Cognito self sign-up off + `REQUIRE_GOOGLE` (stack update); own routes only. Tests `tonl101`, server `v101.test.js`.
- **v1.0 ANIMATED GLADIATOR TOKENS (311-v100anim, last before 08-setup; his 3D answers 2026-10-11 + SPEED × ANIMATION a + ANIM MEMORY; look test
  tools/plans/look100/NOTES-look-anim.md; display only — never S, dice, RNG, the log or onlHash):** the 8 PRINTED classes wear rig92 3D stand-ins (production
  token + gear100/body100 bake + each class kit from t93Parts, mm100's LOOK per class) rendered ONCE by `node tools/art/anim100/make.js [cls…]` (SwiftShader,
  ~4 min a class; run in the background) at the drawn size (pxmm 2.6), 8 MINI_YAW facings, no mirroring, as TWO sheets: assets/anim100_<cls>_move.webp (idle 4 +
  walk 6, loaded when the class first shows) + anim100_<cls>_act.webp (attack 5, block 3, hit 3, limp 4, cower 3, push 4, topple 4, knock 3, fall 5, sever 3 —
  downloaded after the move sheet; ~175 + ~620 KB a class, 6.2 MB for the 8; each ACTION decoded into its own ImageBitmap only when first used, `an100Bm`). Row meta `ANIM100_META[cls][set].rows[name]`
  = [[y,cellW,cellH,ax,ay]…] between markers in 311 (written by make.js). The POSE LIST + renderer = the `ANIM100_LIB` block (`AN100L.ROWS/SETS/render`), which
  make.js evaluates — the same code renders Studio (222 tok93) and online (226 t94, parts via t94Char) tokens ON THE DEVICE (`an100Dev` → queue `an100Pump`: idle
  callbacks, never while T93.busy/conv, never HEADLESS / sims / headless browsers unless localStorage flavius_anim100dev=1), cached in IndexedDB
  'flavius_anim100' keyed by look+gear+pose set+scale (≤ `AN100.dbMax` 24); until ready they draw today's token. Worn in the figure AND standee token styles
  (drawFigureTok / drawStandee wrappers while `AN100.cur` = the gladiator drawPlayer is drawing). SEVERED SETS: one lost limb → assets/anim100_<cls>_<limb>_move|act.webp
  (`make.js sev` + sevenc.py; idle 1 + walk/hobble 4 · attack, hit, fall 2; 3.3 MB for 32; meta `.sev[limb]`), loaded only then, after the sever pose; 2+ limbs = today's token.
  GEAR-TRUE: loadout noted at the first turn (`AN100.gear`); not the class kit → rendered on the device keyed by look + loadout (+ limb; moves first, yours first). Poses step every 120 ms; the position GLIDES (drawPlayer wrapper, screen offset like 294; ROT89/zoom follow; far jumps snap; no second glide after
  doPush). Started by BUS hit (hit / block when armour took all / sever + flash) and elim (fall row drawn after the 'pieces' layer, lies 1.3 s, fades), doAttack
  (attack), doTopple (topple), breakPot (knock), 294's push100Pose hook (push row by progress; push100Tilt returns 0 for a stand-in); limp = a leg ≤2 HP; scared =
  a wild beast hunting him within 2 tiles. SPEED: Slow/Normal full · Fast = CPU / other online seats on the still cell + glide + flash, YOUR OWN animate · snap /
  sims nothing · Animations Off / Reduce motion / calm = still cell, no glide · hidden tab no loop · idle92 no breathing. Clock `an100Tick`: rAF only during a
  glide/action, else a timer to the next pose change, nothing when still. mkshare skips anim100_*.webp (standalone = today's tokens). Kill switch localStorage
  flavius_anim100off=1 (exactly today). Test `tv100an`; shots tools/plans/anim100/.
- **v1.0 ANIMATED 3D BEASTS (312-v100beasts, last before 08-setup; display only — never S, dice, RNG, log, onlHash):** every system beast (Leo, Leaena,
  Ursa, Brutum, Valencia, Moechus, Glykon, Arenosus, Zora on her pillar chunk, Tholo, Commodus) is drawn from its 3D rig sheets: assets/beast100_<key>.webp
  = idle 4 + walk 6 (loaded when first drawn), beast100_<key>_act.webp = attack 5 + hit 3 + die 5 (loaded on its first walk/action), 8 MINI_YAW facings,
  no mirroring, rendered AT DRAWN SIZE; meta `BEAST100_META` between markers, written by `node tools/art/anim100b/make.js [keys]` (promotes the newest
  tools/plans/look100/beastN_rig.js + beastN_hum.js; quadrupeds ~1 min, Tholo/Commodus ~15–30 min each — run in the background). Hooks: drawFigureTok /
  miniDraw / drawZoraMini while 102's MINI_CUR is a system beast (custom beasts, boar/croc, the cylinder style = today's); glide = drawNPC wrapped with a
  translate (npcWalk steps; pushes/jumps never glide); attack = fxLine from a beast + tamedAttack; hit / die = BUS 'hit' (die = a ghost in S.pillars
  during draw(), like 238); idle breathing 320 ms a pose on one clock. One scheduler `bst100Sched` (frame loop only while gliding/flying/fading, else one
  draw at the next pose boundary; idle92 = no breathing). Cells pre-scaled once (LRU `BST100.cc`, 3% scale steps). EFFECTS: spider swarm = the modelled
  spider (drawHitFX wrapper), Rete = painted net thrown from cur() then wrapped while netted (netted watched on log/draw), Fortuna's Bounty = its two
  offerings tossed from the stands (hidden via a drawFloorTok wrapper until they land; dust + glints). SPEED: Slow/Normal full · Fast = still + glide ·
  To the end / calm / Reduce motion / Animations Off = still cell · hidden tab no loop. mkshare skips beast100_* (standalone = today's). Kill switch
  localStorage flavius_beasts100off=1 (no wrappers). Test `tv100bs`; shots tools/plans/beasts100/ (shots.js).
- **v1.0 THE SOUND PASS (314-v100sound, last before 08-setup; his pick "Audit + new SFX"; sound only — never S, dice, RNG, log, onlHash):** AUDIT measured by
  `node tools/plans/sound100/measure.js flavius-arena.html [off]` (every effect + music rendered through the game's own graph on an OfflineAudioContext; peak + loudest
  100 ms RMS at the master): per-sound trims `SND100_TRIM` (dB; blows/horns/beasts ≈ −22..−25, cues ≈ −28..−33, the 290 turn tick +13); music dips 3 dB under a blow /
  elimination / beast / horn (`AUD.duck` between AUD.fade and the master); the reverb sends follow the sliders (`AUD.vM` music through `AUD.vF` = the fade mirror,
  `AUD.vS` effects, scaled by slider/default — identical at the default sliders; before, Effects/Music 0 still let reverb tails through); one blow = ONE sound (fx's
  −AP + −HP + ELIMINATED folded within `SND100.win` 30 ms, strongest wins; Fast ≤1 blow/140 ms); the fanfare family (fanfare, titulus, medal) once in 1.5 s; To the end
  (S.snap / SPEED 'snap') = board sounds silent; new sounds for topple CRASH!, +N HP, spear, chest, market buy. NEW SFX (`SND100_K`, through the sfx() wrapper + trims):
  step (BUS draw.after: the active piece moved one tile), growl/bark per kind (`SND100_VOICE` lion/bear/wolf/snake/zora/grunt; spawnNPC after turn 0, BUS hit by a beast),
  net + netwrap (BUS log, a unit newly netted), scrape (doPush), rise (stand100Wave returned true), titulus (tit100Next's fanfare), gem/fair/dud (sg100Show: when the
  verdict shows), medal (BUS challenge.done, +`SND100.medalMs`), rp (#rp100bar clicks / Space). Fast = only your own (`o.own`, push100Own); sims/HEADLESS none.
  `SND100.log` = what played. Kill switch localStorage flavius_sound100off=1 (nothing installed). Test `tv100sd`.
- **v1.01 THE INFIRMARY LOOP (318-v101ward, workstream B1, his 5a; test `tv101b`):** MEDICUS HOURS a week = 4 + 3/Valetudinarium level + 2/house-medicus skill
  (`mh101Max/Left/Spend`, w.mh101 · rivals m.mh101 {wk,u}); every treatment = hours (`CARE101.h` Medicus 2 · surgeon 3 · Hygeia 3/limb · bath 1 · Asclepius 1) + half the old coin
  (`care101Coin`); the old repCap/w.repair cap no longer limits. ONE executor `care101Do` + reason `care101Why` (capture click on [data-mg=medic|surgeon|heal|bath|asclepius];
  refusals = data-dis); planTiles / planRun87 / care90HTML / careGuideHTML replaced; rivals via `care101Cpu` (edits in 23-ludus + 17 endWeek Hygeia). Banner = hurt · beds ·
  hours · coin + medicus hire popup + Hygeia; .wd76top + Cleared for the sand gone; rub-down / Care routine / Rest week = "Recovery" on the yard's Doctore side; suggested order
  `ord101` (★ tile); Take out on the list row; tile art per option (`ART101`) in one scrolling row; Valetudinarium build = a care option. M14: `morph90` replaced (the
  recruiting-hours oval .hr99 is sweep-owned → no flicker on redraw). Kill switch localStorage flavius_v101boff=1.
- **v1.01 MANAGER RULES (319-v101rules, last before 08-setup; header lists M13…M42; his notes 2026-10-13 + answers 6a 7a 9a; kill switch localStorage flavius_rules101off=1; test `tv101c`):**
  `r101Block/r101Bare(g)` = why one of YOUR fighters cannot be entered (war, bed, any lost limb, hurt, serious) — used by a window-capture click guard on `[data-mg="enter"]`, `any100Why/any100Short` wrappers, `exhibSetup`, `travelClick('traveldeal')`, a `st95Fill` hold, `r101Sweep` (render + inj95Sweep: takes bed/limb/war patients off unfought cards, war leaves the bed); resting is NOT a block (entering ends the rest, `r101Unrest`; the `[data-rest]` click takes him off the card first, `r101OffCard`). Match Week: `.nofit101` "why the others don't fit" (`r101WhyNot`), blocked options greyed. `rec98HrsMax` = 24/16/10/6 by roster + level bonus (tips via `rec101Tips`). `sell99HTML` → "Spares — sell". LOANER KIT: `ln101Sync(w)` (seatFor/mgrHTML/endWeek) gives a loaned fighter a flagged (`P.ln101`) gladius + legwraps, his own gear goes to his home shelf and comes back on return; a borrowed fighter is re-equipped from the borrower's shelf (`arm94Put` wrapper lifts the loan checks, `P.own101` marks the borrower's pieces, loaner pieces vanish; `arm94All` hides ln101 outside a put; `arm94Settle` settles on the borrower's shelf). Full specials keep a free-agent filler (`any100Rivals` pads phantom ids). `b.res.house101` {tot,by} = coin per fighter (applyBout wrapper) → `.h101` cells + a log line. Checklist: no 🩹 once the week is fought; ⏳ button forced to the Training Yard. Fight requests: `mailFromHTML` strips the card once all bouts are fought; `fightRequests` wrapper → `w.review.fx101` (`rev101Note`) shown in the Week in review. Desk: `deskItems99` wrapper → `r101Group` (one `.dk101g` row per advisor with ≥2 open rows, `adv101Of`; lines keep their own buttons). M41: applyBout wrapper drops limbs regrown mid-bout from `glad.severed` (root cause of "only one leg armor"); `SAVE_MIGRATIONS '1.01'` + `r101Repair` normalise severed lists. Levy: `levyExempt101` (17-manager filter + settlePending).
- **v1.01 3D ANIMATION PASS (workstream E: 311 + 312 edits + 323-v101proj; his "3d token animations" notes; display only — never S, dice, RNG, log, onlHash):**
  G6 NO IDLE MOTION: gladiators stand on idle:0 (the idle row is ONE frame now), no breathing, no cower near a hunting beast, no limp loop (both rows
  dropped from the act sheet); beasts hold idle0 and 312's scheduler sets no timer for a still board. G10 ATTACK VARIETY: ANIM100_LIB `ATK_ROWS` slash
  (overhead down) · sweep (across) · thrust (poke) · throw, 4 frames each (VER 2 → the device cache re-renders); `an100AtkRow(p,src,t)` picks by weapon
  key — blades (`AN100_BLADE`) random slash/sweep/thrust with Math.random, heavy heads (`AN100_CHOP`: axe/labrys/mace/charun) no poke, spears
  (`AN100_SPEAR` hasta/trident/jade/pilum) thrust, src.thr or knives throw, anything else (bows, stones, fists) the old 'attack'; custom weapons by
  art type/name. `an100Slash` = a gold arc of light along the swing (slash/sweep) or a streak (thrust) drawn after the pieces (`AN100.vfx`,
  `AN100_VFX` timing), same rules as the pose (no motion → none, Fast: only your own). Severed sets borrow 'attack' (SEV_MAP). G12 WALK: 8 frames,
  stride ±150 mm, bob 14 mm, a crouched forward lean; the frame steps with the glide (half a stride a tile, `an100Pose`). Sheets re-rendered by
  tools/art/anim100/make.js; `node tools/art/anim100/preview.js <cls> <out.png> row,row [pxmm]` renders some rows for a look (AN100L.render `o.rows`).
  G13 PROJECTILES (323): 55's drawMissile repainted lit (shaft + light edge, lit metal leaf heads, filled vanes, shaded stones), drawProjectiles adds a
  ground shadow + a trail and a slight swell at the arc's top, arrows/bolts/knives/spears/axes fly a higher arc (`V101P.arc`), 312's flying net gets a
  shadow. Kill switch localStorage flavius_proj101off=1 (55/312 exactly); 311's flavius_anim100off / 312's flavius_beasts100off as before. Test `tv101f`
  (tv100an 3a reads the new rows, tv100bs 2b/2c expect a still board); shots tools/plans/v101/anim/.
- **v1.01 BOARD + GENERAL (321-v101board, last before 08-setup; workstream D; header lists G1–G22; display only; kill switch localStorage flavius_board101off=1):**
  G1 Labrys (`both:1`) leaves the OTHER hand free — 225 arm94Fit/auto-dress/settle, label "· both attacks", Domus/112/133 kit dressing (111-onlcore has no hand rule).
  G2 one coach "Terynious Tutorialis" (`coachName101` prefixes `.tutstep`, MTUTOR99 = TUTOR99, the 'hello' sentence naming Flavius is cut at runtime; Learn to play step 'hand'
  follows a toppled pillar's offering: names the tile, suggests the walk, waits for the pickup). G3 sandstone submenu = Back only (✕ + ESC·BACK seal hidden). G4 the 313 crowd
  sheets' four facings were mirrored → `CROWD100_META.a[k].r[row].reverse()` once at load. G5 challenges (`S.daily100`): simToEnd / seatCanToggle / rp100RecOK refused, #btnSimEnd hidden,
  seed line hidden/dropped. G8/G9 an100DrawP wrapper redraws the whole-body set (temporary sevT) while the severed set decodes; `CORPSE101` keeps the fall row's last frame
  (drawn first in 'pieces', `drawCorpseFig` skips that tile). G14 `drawFanFlags` no-op; `flag101Draw` (after draw91) puts the gladiator's vexillum (ar91Design100 of his section) in the hands of
  the FIRST fan seated for each gladiator (any mode, his call 2026-10-14; no floating pole flags) on the 313 path (POSE101 from look91: seated = by the hip, cheering = raised; near stands clipped off the sand). G15 modal wrapper resets #mClose title/class
  every window; the Play Now setup's ✕ = 🏛 "Main menu". G16 Lobby Browser: Join by FID right + quiet, sandstone buttons via 306's `sd100CSS`. G17 WICO75 `thr`/`both` images were
  swapped in 106 (pink double arrow = throw). G18 Challenges = `.pn-tabs` button `[data-dc100pn]`, `.calline` moved into `.pn100follow`. G19 `BS101`: a ctx.drawImage patch active
  only inside miniDraw / an100Cell / the t93 token squeezes the base wall per column to `BS101.thin` 0.85; `SETTINGS.bases101===false` (Settings → Board & pieces → Token bases)
  floods the base away from its outline (`bs101Off`, needs readable pixels — https / data: sheets; file:// keeps the thin base). G20 `Z101`: 294's one big settle draw is split
  into one stale layer per frame (`Z100.force` + budget, `z100Moving` held true for the rest); zoom stays online. G21 `emote` rate limit (EM101: ≤3 per 0.9 s, queue ≤10, 90–260 ms apart;
  `sp.human` immediate). G22 Minerva's step window gets `.m101` (SVG of the 3×3 round the victim in the board's own projection, lit tiles = the step buttons). Test `tv101e`.
- **v1.01 ZOOM PRE-BAKED WHILE IDLE (330-v101zoom2, his pick 3a; + 331-v101lbref his 2a; display only):** the other zoom level (zoomed ↔ unzoomed,
  at the camera target `zb101Target`) is painted in advance into a SECOND SLOT of each cache and swapped in by key: stone layers `ZB101.alt[name]`
  beside AR91.L (208 reference frames reused by geometry, `ZB101.refMap`), 260's zoomed tiles kept while unzoomed (Z99.key no longer forgotten) +
  pre-baked (so 294's ease scales them instead of 169 direct tiles a frame), 235's unzoomed tiles `ZB101.t96`, 194's wear `ZB101.wear` (`zb101WearKey`
  mirrors 194's key — keep in step); the 1 < z ≤ 1.001 ease frames paint the tiles at z = 1 (no 235 rebuild each way). Idle only: requestIdleCallback
  after a draw, nobody touching the page `quietMs`, no CPU acting unless paused, no window, no ease, visible, NOT idle92; never HEADLESS/sims/naumachia/
  chariot/designer/pen/duel lean-in/pinch. Slices ≤ `budget` 8 ms: layers + tiles in clipped horizontal BANDS sized from the last band; tiles painted
  through 07-ui's const ctx POINTED at the offscreen canvas (`zb101Point`: own-property forwarders, deleted after; off-band tiles skip fill/stroke/
  drawShipTile). Bands differ from one paint only by edge anti-aliasing (<0.6% px, ≤24 levels; `ZB101.whole` = exact). `ZB101.maxPx` caps the second
  slots. MEASURED (tools/perf95/zoombake.js, http, paused Democritus + 48 spectators, A/B in one page): zoom IN worst draw 83–94 → 13–36 ms, sum of
  draws over 2.2 s 938–971 → 171–198 ms; zoom OUT 37–63 → 11–37 ms; pinch to 1.3 unchanged (no target to guess); slices median ~7 ms, p90 ~9.
  Kill switch localStorage flavius_zoombake101off=1. 331: Lobby Browser ↻ Refresh (234 `[data-lb96r]`) = `.sd100.lb101r` sandstone (306 sd100CSS,
  secondary, s). Test `tv101z`.
- **v1.01 REPLAY HARNESS (wave 2 Foundations phase 0; 325-v101replay0 = test probe, only with localStorage flavius_replay0=1):** `node tools/replay/record.js`
  (re-record goldens with `--update` ONLY after a deliberate rule/AI change) / `node tools/replay/check.js` (first divergence: turn hash, log line, online input seq);
  15 goldens in tools/replay/golden (11 printed events all-CPU, 3 scripted human, 1 two-window online mock); suite test `treplay101` (kill limit 1500 s). The harness
  empties CROWD_CACHE and uses class-default personalities. Known rule leak: 108-v76 freeGrid (beast pen) uses Math.random; rand() falls back to Math.random when RNG
  is null. Docs: docs/testing.md "Replays".
- **v1.01 QUESTION PORT + COMMAND REGISTRY (326-v101ask, last before 08-setup; wave 2 Phase A of tools/plans/layers100/PLAN.md; PROTOCOL 9 — the server redeploys):**
  a rule that needs a human's choice calls `ask(seat, kind, spec)` (window forms `askW(seat, kind, title, body, buttons, opt)` / `askX(seat, kind, extra, …)`) instead
  of modal(): kind = a stable key ('defend', 'focusLoc', 'limbRegrow', 'truceOffer', 'roundReward', 'market', 'draftPick' …), seat = whom it is asked of; the UI
  provider is the SAME modal() call (same pixels, every modal wrapper still runs), HEADLESS answers with `askAuto` (07-ui's rule, now one function), `askUse(kind|'*',
  fn)` installs a provider (tests; a replayer / the server later). CPU branches stay inline. Routed: 02-data 1, 03-engine 11, 04-rules 16, 05-flow 10, 06-ai 2, 07-ui 12
  (loot, distribute, market, crowd, the whole trade/truce/gift flow), wrappers 199 4, 106 4, 179 2, 09 3, 76 2, 62 2, 122 2, 232 1, 162 1 (local), 107 1, 16-crowd 3.
  `askNow()` / `askKind()` = the question while its window opens (read at a wrapper's entry): 113, 290, 309, 163 (trade picture), 236 (trade menu chips) use the kind,
  the title only for un-asked windows. `spec.local` (retire confirm, ⏭ Sim to end, 162's off-turn gear) = not a decision of the match. Every non-local ask counts
  `S.ask101` (in snapshots) = Q.ds. ONLINE (113/290): a window answer is `{k:'modal', v, kd, ds, pre}` (no title); both hashes of a window = `onlmQHash(Q)` =
  onlHash()+'|'+kind+'#'+ds, so a client facing a different question takes the majority's arena instead of a wrong value; owner = the stands / humanCommand override,
  else the human fighter asked (`onlmAskOwner`), else the old RESPONDER / cur() / lowest-human rule; asked windows are recorded even right after a bar click (the 300 ms
  `ONLM.uiAt` gap only for un-asked windows); the English title regex that declined CPU truce/trade offers is gone (a stray one is declined by KIND; 06-ai never makes
  one online). 309 records `kd` and matches by kind (older recordings by title). COMMANDS: 07-ui's act dispatcher is `uiAct(k, dataset)` (the click listener calls it);
  `command(seat, {k:'act', a, id, i | d})` runs the registered handler (`CMD101.reg`, every 07-ui act + m-*), else the old hidden twin button (`cmdTwin`);
  `command(seat, {k:'tile', r, c, mode, focus})` = the tile replay. Used by 113 onlmApply / drops / abandons, 290's timeout finish and 309 rp100Do. 121's local "void
  after 2.5 s" stays local (why: the module header). Kill switch localStorage flavius_cmd101off=1 (acts through the twin button). Left on the old path: seatMapPick
  and spectChooseFav (opened by both the engine and UI buttons), rule pop-ups / the briefing (info), Manager / setup / results windows. Test `tv101q`; the online golden
  was re-recorded (window answers carry kd/ds now).
- **v1.01 LOG AS EVENTS + PRESENTATION PORT (327-v101beat, last before 08-setup; wave 2 Phases B + C of tools/plans/layers100/PLAN.md; no protocol bump, no save
  change):** B — `log(html, cls)` (03-engine) only emits BUS 'log' {html, cls}; `logDom` (03-engine, subscribed at load = FIRST) writes the <li>, S.logLines and the
  caption; `caption(html)` emits BUS 'caption' {html} → `captionDom` (first). The 12 log wrappers keep their order: html-changing ones run before the base (the BUS
  carries the final line), DOM/logLines readers after it (emit is synchronous). 218 no longer emits 'log'. HEADLESS returns before the BUS (sims unchanged). C —
  `beat(kind, ms)` replaces the 25 core sleeps (kind = the rule function: revealOffering, npcWalk, resolveDrawn, beginTurn, movePlayer, cpuUseItems, cpuMarket,
  cpuHelpAllies, cpuAct); the default port is sleep() itself (speed/pause/Step/snap/235 Fast hook; HEADLESS = sleep's own resolved promise, so microtask order is
  unchanged); `beatUse(fn)` = another port; `BEAT101.count`. `paint('render'|'draw')` replaces the 36 core render()/draw() calls: BUS 'state' {k} → `paintUI101`
  (first subscriber) calls render()/draw() at once (same frames); HEADLESS calls them directly (their wrappers still run). `awaiting()` = {k:'ask', kind, seat, ds}
  while a non-local ask() window is unanswered (326 `ASK.pend`, tracked only outside HEADLESS) · {k:'command', seat} while the game idles for a turn action · null
  (inside endTurn()/settle(): `ENG101` counter per S, `engRunning101()` — 254's F98 counters moved here; 254's onlmReady wrapper reads awaiting(), `F98.held` stays
  for tonl98f, `f98Busy()` = engRunning101()). Test `tv101r`.
- **v1.01 CARD / BEAST EFFECTS AS DATA (328-v101fx, last before 08-setup; wave 2 Foundations; audit tools/plans/v101/EFFECTS.md; dice, log, S
  unchanged — treplay101 goldens not re-recorded):** ONE lookup `fx101Row(kind,key)`: 'card' → {draw, use}, 'offer' → {reveal, use}, 'beast' →
  `fx101Beast(t)`, 'mf' → the Mandata row. An effect = {fam, …params}: fam = a FAMILY in `FX101.fam` (coin, loseHand, stripLoc, stripAll, moveTurn,
  moveRound, bearAggro, marketPick, tax, activeRule, spawn, heal, apUp, freeRoll, moveCap, crowdCF, mark, reaction, limbBite, curse, potCF) or a
  bespoke handler registered there (fortuna, lashings, spikes, endgame, boar, spawnCommodus, pair, piaculum, spawnCustom, hygeia, rete, lure, tame,
  ammo, zora, mchoice, eagle). A row's param wins, else the family reads the CARDS field (hp, mv, ap, dmg, lv, bear, loc). Patterns: C.cls →
  piaculum, spawn_cn_* → spawnCustom, pair_* → pair, C.loc → stripLoc. 04 `resolveDrawn`/`useItem` and 03 `revealOffering` are thin
  (`fx101Drawn`/`fx101Use`/`fx101Reveal`); the 64 Piaculum, 129 spawn_cn, 133 CF-offering, 179 Choose and 199 elixir/free-roll wrappers moved INTO the
  table (same code). A use effect returns true (caller drops it + shows a card as declared), false, or 'done'. NEW CARD/OFFERING OF A KNOWN KIND = a row
  in 328. BEASTS: `FX101.beast` = behaviour NPCT lacks (hunt, prey, hoard, chest, picksCF, lure); `fx101Beast` merges NPCT (scan, tame, fly), Studio
  beasts (cn_*) read their own NPCT row; 04 lure/aggro/Commodus pick/chest/tame, 03 hoard/chest drop, 186 HUNT90 read it. `fx101Check()` = every key
  resolves. Left as code (EFFECTS.md §3): Omnia/Minerva/Fidelis inside the roll, offering landing (78/122), pots, spectators, class abilities.
  Test `tv101s` (old dispatch verbatim in tools/tests/tv101s_old.js run beside the new on seeded states).
- **v1.01 RULES IN NODE (tools/node, wave 2 Phase D1 of tools/plans/layers100/PLAN.md; docs/architecture.md "The rules in Node", docs/testing.md):**
  `tools/node/page.js` runs the built script in a Node `vm` behind `tools/node/dom.js` (fake DOM: lazy innerHTML parse + an id/class/attr/tag
  index, events, a do-nothing canvas) on a VIRTUAL clock (timers/rAF/Date/performance.now; 1 µs per clock read), seeded Math.random, and
  CHROMIUM'S Array.prototype.sort (arrays < 8 = plain binary insertion — the rules sort with rand() comparators, Node 22's TimSort drew other dice).
  Only src change: 07-ui `draw()` returns when `window.FLAVIUS_NODE` (set by the stub; never in a browser). `node tools/node/replay.js` replays the
  goldens through 309's rp100Play / 113's watcher pump in rules mode (HEADLESS) and screen mode (log); `node tools/node/sim.js <event|all> [seed]`
  = headless simEvent (~0.1–0.5 s; same hashes as Chromium); `node tools/node/mkbundle.js` → server/verify/rules.js + rules.json {v, build =
  sha256(script)[0:12]} (not committed, ~9 MB, not in the server zip) for Phase E. Test `tnode101` (plain node; registered in runreg DEFAULT).
- **v1.01 RANKED VERIFICATION (wave 2 Phase E; server/verify + the "v1.01 wave 2 RANKED VERIFICATION" block in routes.js + index.js + 329-v101build;
  docs/backend.md "v1.01 Ranked verification"; NO protocol bump):** a separate Lambda `flavius-arena-verify` (1024 MB, 120 s; template VerifyFn/VerifyRole,
  param `VerifyMode` log|off|enforce) is ASYNC-invoked (awaited ~30 ms, `META.vq101`) by the request that settles a Ranked match with a table; it replays
  MATCH# OPEN + IN# through 113's late-watcher path in rules mode with the deployed bundle (`server/verify/rules.js`, built by deploy.sh with
  tools/node/mkbundle.js), takes the end hash at 124's `onlRepStart81` and the rows via `onlRow81`, compares with the agreed table + hash and writes
  `VERIFY#<id>`/V once (+ `AUDIT#<id>`/VERIFY kind 'verify_mismatch'). LOG ONLY (his policy for the first month; 'enforce' = TODO). BUILD PINNING: the
  host page sends `build` (sha256 of its main script, 12 hex = mkbundle --hash; `build101()` via document.currentScript + crypto.subtle) on match.open →
  `META.build`; another build → skipped 'build'. `admin.verify` (testers) lists verdicts. flavius.sh fetches tools/node and its server hash includes the
  page → every game release redeploys the stack (the verifier holds the players' build). Rollback `VERIFY_MODE=off`. Test `server/test/verify.test.js` (npm test).
- **v1.01 MANAGER MORPH RENDERING (330-v101morph, last before 08-setup; wave 2 Foundations, last step):** 17's wireManager redraw (= MGR_REDRAW and every
  say/redraw inside it) now ends in `mgrPaint(el, html)` (17, plain innerHTML) — 330 replaces it with a patch IN PLACE (`mm101Morph`): mgrHTML() and every
  final-mgrHTML post-processor run unchanged on their detached templates (they still return a string), only string → page changed. Nodes are matched by tag +
  identity keys `MM101_KEYS` (id, data-id, data-gid, data-mg, data-mail, data-dk99 …; one-step look-ahead for rows), each node remembers its TEMPLATE
  attributes (`_p95`, like 230's morph95) so live decorations stay (rail sweep classes, 220 contrast/aria, 138 data-en84, 306 sandstone tags) and a
  <details> the player opened stays open (the template opening/closing one on purpose still wins); sweep-owned children `MM101_OWN` (.c73 .c85n .hr99
  .imm88lf .fear88 .hrchip) are left in place; focused inputs, canvases and inner scrollers are kept; the modal's first paint is recorded in a wireManager
  wrapper. EVENT IN FLIGHT: a node holding `window.event`'s target is not removed mid-event — it stays as a hidden inert GHOST (its replacement
  before it, removed next task), so later handlers' `e.target.closest('#lu100pop')` still work as with innerHTML's detached tree; ONE ACTIVATION
  PER KEY: within one Enter/Space key event a second script click on the same Manager node is swallowed (220 + 294/298 both clicked role=button
  nodes; with innerHTML the second one hit a detached node). A NEW sweep that inserts nodes into Manager nodes: add its class to MM101_OWN. Measured (tv101m, 1440×900, redraw + forced layout):
  Your ludus 52–58 → 26–32 ms, Recruiting 87–92 → 45–46 ms, Training Yard 63–65 → 35–37 ms, and nothing re-decodes. Kill switch localStorage
  flavius_mgrmorph101off=1 (innerHTML). Stats `MM101.n`. Test `tv101m`.
- **v1.02 H · MANAGER GEAR LOOP IN STEP WITH ONLINE (339-v102gear + small 225 edits; his M11 pick 2a; test `tv102h`):** a fighter who joins a house
  (signing, a NEW career's starting rosters, rivals' recruits; each signing again) gets only the Issued L1 kit (`iss102Kit` = online's issueList100:
  galea + wraps + legwraps + ISSUE_W100 weapons, P.iss = his id) instead of 225's class loadout; the rule runs once a world has `w.gear102`
  (new worlds {old:0,fund}, SAVE_MIGRATIONS '1.02' marks older careers {old:1} — nothing they own changes). Repairs = ceil(value/10) ≥1 (`ARM94.fixFn`,
  225's arm94Fix reads it; the stalls say "a tenth"); Issued armor stripped to 0 AP vanishes (`ARM94.issVanish` in arm94Settle); Issued pieces picked up
  on the sand never come home (seat.gear94.iss → arm94Snap skip list). arm94AutoShop wrapper: empty hands first (`g102Hands`), then 225's shop, then
  `g102Upgrade` (Issued piece where the class kit wants a real one → shelf/buy, the Issued one dropped); the mgrsim player buys like a rival (≤ rivMax a
  week). STARTING TREASURY (his answer: no separate fund): every house of a NEW career starts with `GR102.start` (100) more coin (w.gear102.start);
  later gear is paid by wins and podiums; mgrsim `GEAR102='{"start":N}'` overrides it. Lesson armory step +
  first-hour Recruiting tip mention the Issued kit. tv94m runs its old-career part without gear102. Kill switch localStorage flavius_v102hoff=1.
- **v1.02 ONLINE PROGRESSION (340-v102prog + the "v1.02 PROGRESSION" section of 111-onlcore + its block in routes.js; docs/backend.md "v1.02 progression";
  his I answers in tools/plans/v102/NOTES.md, mock tools/plans/mock102/progress.html; NO protocol bump):** the silent per-bout grow() is gone — XP levels
  instead, decided only at settlement (`C.xpSettle102` inside applyResult: round(f × K × (min(CF,40) + 20 survived + 15 won)), K 1 Ranked / 0.5 Custom
  (≤300 a UTC day) / 0 fell); level n→n+1 = round(42 + 0.6(n−1)) XP, cap 100 (laurel); each level +1 to the weakest + 1 point (`ch.pts`) placed on the
  level-up screen `#lu102` (`char.lvup {id,k}`, IDEM93, refused in a room/match). `ch.last102` → the RESULTS TALLY `#tl102` on the next Online window
  (once, `char.seen102`; click skips, Reduce motion = end state). Domus: XP bar `.xp102w`, "🔒 class set at creation" (`char.class` → class_fixed), slot
  cards "Lv N" + ⋯ `.gc102m` menu → release `#rl102` (`char.release {id,name,rudis}`: typed name, gear → shelf, Issued vanish, Hall only when worthy;
  🗡 rudis 100 coin → always a Hall plaque). `lv102Chip` on room seats/members, lobby list, Who's online, house card. Kill switch localStorage
  flavius_v102ioff=1. Tests `tonl102p`, server `v102prog.test.js` (routes/v89d/v93/v98 updated: class fixed, no growth, presence lv).
- **v1.02 THE ACTA DIURNA RESTYLED (342-v102acta, last before 08-setup; his K picks 1b 2a 3a 4a + 1c 2c 3a 4a 5a; mock tools/plans/mock102/acta.html +
  NOTES-acta.md):** paperHTML = ONE papyrus page `.paper.ak102`: masthead (◀ ▶ `[data-ak102=prev|next]`, ACTA DIURNA, price/omen) · strip of only the
  non-zero numbers · lead (sepia/hatch engraving of gArt, kicker, deck, two ruled columns + drop cap, fact box with the event card) · Your House
  (`.ak102house`; no bouts → "<ludus> did not fight this week" + yard) · The Arena + In Memoriam · The Empire (mapInset100) · Darwinius · Rabble-rousers
  (284's P.rabble, `.rab100` kept) · Overheard · In brief · Classifieds (hire names `[data-ak102="fa:<gid>"]` → the free agent's dossier, `scout` → Free agents,
  `league`) · Next week ribbon, information only (NO Start-next-week button; the lesson's 'acta' step now lights the rail's Your ludus). LEAD: composeWeekPaper
  wrapper `ak102HouseLead` — your house first (season title, your fighter fell, upset ≥ `ACTA102.upset` 8, Main event win, signing rated ≥70, any win), else
  the old lead (moved one to P.also); P.k102 = house/arena/obit facts, P._k102 = edition key. `w.acta102` = last 12 TRIMMED editions (`ak102Trim`, ~3 KB;
  old worlds start from lastPaper); MGR.ak102 = the edition shown (old = "As printed then" + Back to this week). Archives (w.papers) still render via paperHTML
  (no pager). Kill switch localStorage flavius_v102koff=1. Test `tv102k`.
- **v1.02 L · LOANS (343-v102loans; his answers 2026-10-14; test `tv102l`):** at most `LOAN102.cap` 4 of a house's own fighters out on loan
  (lendTo / borrowFrom wrappers refuse with the reason; Lend pickers → `.l102full`; asks and 'loanin' offers past the cap dropped). WEEKLY MARKET
  `loan102Fee(w,g,m,wk)` = loanFee(g) (rating + fame) × `loan102Demand` (hash of world id + absolute week + house, never the dice; + short-handed,
  + hurt, − glut of league loans; 0.6–1.6), capped below `loan102Starter(g)` × 0.8 (top tier's purse × 0.25 = what he would earn the house
  fighting). Studs lend for real profit (the borrower pays the wage); fighting pays more. Pickers show this week's price (final mgrHTML
  pass). THE CLERK (`adv98Lv(w,'clerk')` ≥ `LOAN102.clerkLv` 3) adds a 💰 desk row in a good week (demand ≥ 1.35) "<name> is market-worthy this
  week — <house> offers N a week" + `[data-l102lend]`; at the top level he names the best week/house of the next 4. mgrsim prints a "loans:"
  line (a starter's coin per bout vs bench fees). Kill switch localStorage flavius_v102loff=1.
- **Guide data:** `SIM50` in 53-guide50 is regenerated by `node tools/simguide.js flavius-arena.html 600` (SIMVER env);
  it includes `perk` (wins by rating perk), charted by 69-v56.
- **Music:** procedural Web Audio (21-audio, 45-music, 16 themes; unlocked by winning in cities). Play Now plays a
  random unlocked theme or the Custom Event's `music`; Manager keeps city themes; final duel uses the boss theme.

- **v1.03 MANAGER (345-v103mgr; his M1–M9, N8, N9a; test tv103b; kill switch flavius_v103boff=1):** w.sb103 (specCrown wrapper) → w.review.sb103 (endWeek wrapper) → Superbus review title/box and the Acta lead (composeWeekPaper wrapper re-stores 342's edition; 17's Acta prints week ((wk-1)%12)+1); sb103Is(w) = finale open → rail "🏛 Superbus Week" (the "4" was the bouts-left oval: card + headline special), banners, regal .specbox.sb103c, no headline special on a finale week (any100Make wrapper); riv103(w) = Rivalry Week closed (window-capture guard RIV103_SEL, data-dis, exhibSetup/travelClick/st95Fill wrappers, specWeekStart pushes invitations off week 12); MGR_CAP103=15 + cap103Why/cap103Trim (offerVerdict, poachVerdict, court88Sign, borrowFrom, offerAccept swap, CAP103_SEL guard, detailHTML marks the buttons, desk row 👥 "Over the cap"; rivals release their weakest surplus); lendTo/borrowFrom refuse g.inj; arm94HTML wrapper re-tags starters (arm103Gold); offersHTML wrapper draws loan asks "They pay N a week" (loanReq103) + off103Ok drops offers that pay nothing (the "empty trade" was a loan ask drawn as a trade); emptyBarracksWeek wrapper sends the Recruiter letter, the cart bar only on Recruiting; final mgrHTML pass a103Post (record badge lp102Rec podium format, no "N fighters", Treated ✓ chip .t103, Armory/Promote tile swap, council faces 84 px).
- **v1.03 GENERAL (344-v103gen, last before 08-setup; his v1.02 notes G1–G4, N1a, E7; kill switch localStorage flavius_v103aoff=1; test `tv103a`):** G1 the ✕ / 🏛 buttons of windows
  (`.mclose`, `#mClose`, `.s98-x`, `.lu100x`, `.dc102x`) are rounded SQUARES (9 px, CSS `!important` over 246/300/334; the `.saveq` pill stays). G2 `rndCF103()` = `RD().cf` false →
  a render wrapper disables the bar's Market ("No CF this round" + tip) and gives Crowd the same tip (adds to 236's whole-event `noCF96`). G3 challenge start: the 08-setup mmLaunch 3 s
  watchdog showed the menu in the gap between the Challenges window closing and startEvent starting (no goAt — the horns click stamps it, Enter did not): a capture click on
  `[data-dc100go]` + `dc100Begin` stamp `MM.goAt` and clear `MM.fromMenu` (`dc103Stamp`; 72-v59's own 2.9 s watchdog got the same goAt guard). G4 `abandonAsk` wrapper: while `S.daily100` one ask76 popup (`dc103Cost`: daily = scored attempt
  spent / practice = nothing lost / weekly = N of 3 left); Abandon → 'abandon' (REPLACES 08's "Leave the arena?" window for challenges; no Save & leave). N1a one section switch a match:
  `s.sw103` on the spectator (in S), `sw103Block(s)` read by 16-crowd's CPU move (before its rand()), the human upkeep option, 232's #btnSec96 (REPLACES its `_sec96` once-a-rotation rule)
  and 128's `st82Apply` (online, same on every client); CPU moves go to the least crowded section facing the target (`sw103Dest`); `sw103Spread()` (crowdStart, before the seat log) spreads
  NEUTRAL spectators over ceil(n/8) a section, no dice. E7 words "1 switch left" / "Switched" (`sw103Note`): `#btnSec96[data-sw103]` (CSS ::after), the Stands tab `.sw103s`, the upkeep
  option, the online window `.sw103n`. Rule change → the treplay101 goldens need a deliberate re-record (tools/replay/record.js --update).
- **v1.03 3D TOKENS + STUDIO GEAR (346-v103board, last before 08-setup; his T1–T6, S1; display only; kill switch localStorage flavius_v103coff=1; test `tv103c`):** T1 bears ×0.8, lions ×0.82 and
  narrower (`SLIM103` squeezes the mesh's local x: Leo 0.8, Leaena 0.84), wolves ×0.88 — tools/plans/look100/beast5_rig.js `SIZE103`/`SLIM103` (sheet() takes `o.sx`), sheets re-rendered by
  tools/art/anim100b/make.js (assets only). T2 bases off: `B103_HUM` (Tholo, Commodus) → `b103Proc` (334's g6Geom; wall band + rim ink cut whole, top flooded only along smooth top colour,
  pockets that stay in the oval; fallback = wall only), `B103_WALL` (snakes) → 334's g6Proc + the rim band cleared (`b103Wall`), the rest keep 334's G6; sculpted figures (custom
  humanoids / beasts, sculpt tokens) drawn from a figureSVG without its base ellipses (`_nb103` spec twin via tokenImg / sc3dCanvas wrappers while drawFigureTok runs, `NB103.in`). T3
  `rim103(k)` = the seat-colour arc on 311/222 base rims (small edits there): thin base → 0.6 width on the squeezed wall, bases off → none. T4 `tun103Why(p)` on the disabled Tunnel /
  its placeholder (tip, aria-label, small): missing a limb · no key · carrying the chest · no tunnel beside you · no exit. T5 Telemachus: `atk103Apply` puts 210's atk92Why on every
  attack control + the group header (259 covered only the weapon buttons). T6 MEASURED: printed sheets 2.6 px/mm vs drawn TW·0.8/25.4 px/mm × device ratio = 0.68× at 1440×900/1× but
  1.36× zoomed or on a 2× screen; the pre-scaled cell (3% steps) was drawn again at w·s at fractional positions (second resample every frame), and 312/334 beast cells ignored the device
  ratio. `sh103Blit` (311/312/334 small edits) draws a pre-scaled cell at its own size on whole device pixels (anchor kept); 312's bst100CellCanvas + 334's g6Scaled made at the device
  ratio; up-scaled cells (> `V103C.sharpMin` 1.05) get a 3×3 unsharp mask once (`sh103Sharpen`, ≤ `sharpMax` 2 a frame, not while TW changes; needs readable pixels). S1 Weapons /
  Armor / Trophies join 335's designer frame (D102_SPEC.gear getter by ST.gearSub + .trophies; removed from 247's ST98_ON); Insignia keeps 304a's own bench.
- **347-v103beta** (src/batches; v1.03 beta fixes B1–B6, kill switch flavius_v103eoff=1, test tv103e): B1 drawPlayer/drawNPC wrapped — while 312 draws nets (BST100.on, bst100Mode()!='off') the unit's netted flag reads false during the draw so 07-ui's turquoise ring is skipped; B2 DC100_TW.wild renamed 'Wild: every beast hunts you' (🐺) + bf100Rules (301) prepends the running challenge's twists as rule cards; B3 modal wrapper disables the Crowd Favor grid's 'mk' (Unlock market) with a reason when dc100Has('nomarket') or EV().noMarket (v103eMarketWhy); B4 the same wrapper drops the 'dc100' button from the Manager submenu (sand100Titles()[1]); B5 CSS centres .pn98dice (inline-flex); B6 infirmNeed73 re-wrapped: counts fighters (inj non-war or severed, not trt103) once each, 145's Road lock kept, 108's double bed-wait addition replaced.
- **349-v104careers** (src/manager; v1.04 B, his E3 a / A1a A3a A4a / N3a; kill switch flavius_v104boff=1; test tv104b): AGE — genGlad wrapper: arrivals 18–30 (replaces 16–21 rookies / 19–35 / the odd 36–80). FIVE CAREER KINDS `c104Kind(g)` from hashStr of the id (never the dice): Meteor 1/100 (prime 2, +8 OVR bloom, steep fade) · Blazer 1/10 (3–4, +4, fast) · Common ~78% (4–6) · Steady 1/10 (8–12, slow) · Ageless 1/150 (15–25, very slow); prime start 23–27 (late bloomers ~1 in 8: 28–30), 0.8–1.2 spread (`C104` knobs); `c104Phase(g)` rise/prime/fade by age. SEASON TURN `c104Turn(w,ctx)` once a season via builder A's `OFF104.on` (else the first endWeek of a new season, `w.c104s`): first sight = curve only (`g.c104={n,pk,ph,fs,fx}`, nobody fades before a season), rising = statGain bonus, prime entry = bloom, fading = ratings lost Speed first … Intelligence last (`c104Lose`), up to 35% slower with weeks drilled (`g.tr104`, weeklyGrowth wrapper); statOvr clamp −25…+25 for fighters with a curve. RETIREMENT at the turn (`c104RetireP`: faded, older, lower; hash of world+fighter+turn) — replaces 17-manager's weekly 35+ "hung up the sword" (gated by `c104Live`); farewell letter, news, chronicle, Annals Liberti line (libertyEntry) for yours + greats (`c104Great`: Immortalis or peak 78+ with 8+ wins); your great → letter `[data-c104adv]` → `c104Seat` Doctore / Barracks master at level 3 (name + face); a rival's great raises his house's Doctore to 3 half the time. FORM LINE on the fighter card (detailHTML wrapper, `.c104form[data-c104form][data-c104read]`): reads from rec98K precisions (rough = phase + "short, bright career"/"long career", fair = ~N ±1, sure = N + kind) or, for your own, the Doctore's level (1 rough · 2–3 fair · 4–5 sure). FAME FOLLOWS RESULTS: applyBout wrapper scales a house's fame gain by 0.5 + 0.5 × win rate ÷ the league's (`c104Mean`, 0.5–1.3, carry m.fm104); a season under ¾ of the league's rate (4+ bouts) drifts fame down. ADVISOR PACE: one level per advisor per season (w.adv104 / m.adv104 snapshots; adv98Up refuses, adv98Req/adv98RReq add "next season"). Turn summary `w.c104rev`, BUS 'career.season' / 'career.retired'. tools/mgrsim.js prints "careers" lines per season; `V104B=off` = before/after.
- **348-v104season** (src/manager; v1.04 builder A — the season's shape, kill switch flavius_v104aoff=1, test tv104a): CALENDAR byes 4 & 12 + Rivalry Week 11 (77's `RIVAL_WK` is now a `let`; lock/letter week 10) per career via `w.cal104` (first new-calendar season; newWorld = now, SAVE_MIGRATIONS '1.04' = next season unless still in week 1) and `cal104Sync(w)` (BYE_WKS/RIVAL_WK at makeNight/endWeek/mgrHTML/seasonTabHTML). SUPERBUS PLAYOFFS replace 17's top-4 `finaleDue` special for a new-calendar season (specWeekStart wrapper drops it): `w.po104` {s, seeds[12] ('m:<mgrId>' / null → outsider 'o:<gid>'), phase pre|r1|sf|fin|off|done, r1/sf [{k,adv,pl}], fin {k,pl}, champ, champG, paid, pick, ren, rev, extra}; seeds by leagueSort (no Sica), R1 = seeds 5·8·9·12 / 6·7·10·11, SF = 1·4 + R1-A top 2 / 2·3 + R1-B top 2, final = SF top 2s; bouts tier `TIERS.sb104` (cassian, `b.po104` {r,i,k}) in w.night.bouts; `po104Order(b)` = the event's own places; one gladiator per house a round (`po104PickFor`, your `[data-po104pick]` select; no fit fighter = a hired free agent, −5 fame); prizes `V104A.prize` (SF 40 / final 80 / champion 250 + Superbus Cup via seasonAwards' palm_roma) paid once after the week (`po104PayRound`). FROZEN WEEKS: the end of week 11 / R1 / SF runs the whole endWeek chain (BYE_WKS without 12 while `V104A.inHold`) then `po104Rewind` (w.week back to 11, injuries + pledges a week on, …Wk scalars / clk87 / tplan / cart … at 11 → 10, hours refilled) and `po104Night` replaces the throwaway night (Roma, no travel). Houses without a bout in a playoff week get half their wages back (59's bye rule). No league points (leaguePtsAfterBout wrapper restores spS), no fixing (boutRiggable), no enter/withdraw/rig (window-capture guard), no sit-out (sbyeOK76), st95Fill skipped, calLag 0. The final's end runs into the real week 12 = OFF-SEASON (`n.po104='off'`, a 59 bye): seasonAwards (Flavian Awards; E2a league awards = Aureus Gladius / NEW `lg104rec` Best Record / Tiro Laurel / Iron Thumb), `po104Renewals` (E4a raises ≤8 weeks left, benched unhappy leave asks; rivals at once; `[data-po104="ren|gid|y|n"]`, unanswered lapse at week end), OFF104 handlers + BUS 'season.offseason', Season in Review letter `sr104-<s>` (`po104Review`: came/went from `w.sr104` snapshot, coin/fame, record, titles, fallen, grade band-ups, playoff run, awards, ctx.add lines). Its end = 17's season end (old Superbus news dropped). w.finale / w.sb103 feed 345's review box + Acta lead; specialLog gets the champion. BRACKET overlay `#po104br` (`po104Open/po104BracketHTML`, `[data-po104="bracket"]` in the League banner `.kick`, the Match Week banner and the card; projected from week 9 `data-po104proj=1`). Pages: `po104CardHTML` (345's .sb103c + .sb103ban, picker, compact bracket), `po104OffHTML` (podium `.po104pod`, review, renewals, recruiting), `po104Post` (rail/banner labels Superbus · Round 1 / Semifinals / Superbus Week / Off-season, End-week title, review title, the old "top four" texts). HOOKS: `OFF104.on(fn(w,ctx{season,add}))`, `OFF104.active(w)`, `OFF104.phase(w)`, `OFF104.frozen(w)`. tools/mgrsim.js runs calendar weeks (frozen weeks included) and prints the Superbus line.
- **350-v104roster** (src/manager; v1.04 builder C — his N5 cap/starters/layout/order a, N6a, X1a, X2, X5, E1a; kill switch flavius_v104coff=1; test tv104c):
  ROSTER CAP `cap104(m)` = 8 + facLvl(m,'barracks') (0–3) + Barracks master level − 1 (adv98Lv 'barracks'; a rival's = 1 + fame/20, max 5), ≤ `CAP104.hard` 15 —
  REPLACES 345's flat MGR_CAP103 (cap103Why / cap103Trim re-pointed, offerAccept checks both houses). Over the cap (X1a): nobody released, no signing / borrowing,
  desk row 👥 "Over the cap N / cap" + Release / Lend / Trade, the fighters above the cap (latest signed, `cap104Over`) cost +25% (`cap104Extra`: weekMoney.cap104 +
  charged at endWeek). FAC.barracks.fx + adv100Fx('barracks') say "+N roster place". 4 + 4: `g.tm104` 'A' First team (g.slot95 Bouts I–III stay the Match Week
  rule + one reserve who covers a hurt / resting starter's bout in st95Fill and gets the starter perk) · 'B' Second team (4) · none = Rostered · Lent out apart
  (`team104(g)`, `tm104Ensure`, `tm104Move(gid,k,slot)`; st95Set/st95Bench/signGlad wrappers; rivals' depthOf = their best 4); SAVE_MIGRATIONS '1.04' (w.tm104).
  ROSTER PAGE (final mgrHTML pass on 298's room, `.rm100.r104`): `.rm100list` = one list in `.r104g[data-r104g=A|B|R|L]` groups, header `.r104h` sort buttons
  `[data-r104s]` (R104.sort, localStorage flavius_r104sort; OVR by default, sorted inside each group), rows keep `[data-mg="lsel"]` + `draggable` `[data-r104d]`
  (drag between groups), bout chip `.r104c` (I/II/III/R), ⋯ `[data-r104m]` → `.r104pop` menu (`[data-r104a="A|B|R|gid|slot"]`, `[data-r104lend="gid|mid"]`,
  70's `[data-recall]`, ward); the dossier keeps only the selected fighter: portrait (+ `.r104tc` team / bout control), ratings, personality, the contract tabula
  with `details.r104keep` (the old .rm100keep inside; open in the lesson) — 298's `.rm100stt` tablets and `.rm100bench` are removed. LOAN CONTRACT (N6a): new loans
  (lendTo / borrowFrom wrappers) carry `loanFrom.{c104,lump,wk0,w0}`: lump = this week's fee (343 loan102Fee) × weeks paid up front, the borrower pays the wage,
  loansWeek hides them from 47's weekly fee and counts them down; 2+ wins on the loan → a buy-out: a rival's `kind:'coin'` offer with `bo104` (Sell / Keep him) or
  `w.bi104` (his house sells him to you, `[data-r104bo]`). Old loans finish on their weekly fee (X2). A Bout starter is not lent; a borrower needs room under its cap
  and the lump. loanReq103 / loanTerms / loanTag show the lump terms. TRADE BUNDLES (E1a): tradeHTML wrapper `.tb104` checkboxes `[data-tb104g]` (MGR.trade.bun) + a
  capture on `[data-mg="tradego"]`: 2+ of yours for 1 (best in full, others × 0.55, + coin/6) vs 23's need; once a week (`w.tb104Wk`, + the envoy rule); their cap
  must hold it; a refusal within 80% stores `w.tb104` → next week's counter-offer letter (`c104Counter`, `[data-tb104="yes|no|id"]`). Rival team page: 1st / 2nd team
  chips + "cap N". Tests updated on purpose: tv95c (8a via the ⋯ menu), tv100rm (roster groups / menu), tv102l (lump-sum paid at lending; picker in the tabula),
  tv103b (cap raised to 15 by Barracks III + master 5 before checking the hard cap), tv101c (M24 lends a non-starter; borrower can pay), tv88m (Immortalis laurel on
  the list-row face `.r104av`), tv88p (phone key buttons include the 36 px ⋯ `.r104m`).
- **351-v104ward** (src/manager; v1.04 builder D — his N4a N7a N9a N10a + R1 1a 2a 3a 4; kill switch flavius_v104doff=1; test tv104d; the lesson league (w.tutorial) keeps the old rules):
  RECRUITING — rec98HrsMax wrapper `W104.rec.bands` (≤3 fighters 16 h · 4–6 12 · 7–9 9 · 10+ 6) + 3 a Recruiter level (REPLACES 319's 24/16/10/6 bands; rec101Why text follows);
  `rec104Bump` raises every action's REC98.acts[a].h by 1 per action already taken on that recruit this week while rec98Can / rec98Act / rec98Btn / rc100ActCard run;
  the trial needs 2 earlier looks in an EARLIER week (g.sc98.l104 weeks; REPLACES 333's "one cheaper look"); the board holds 6 + Recruiter level (`bd104Cap`, `bd104Sync`
  keeps w.bd104 = pin order, old over-full boards keep their names, newcomers unpinned; window capture refuses pin / pitch / visit / gift / wishes off a full board; cityFav
  wrapper). OFFERS NEXT WEEK: window capture on [data-mg="offer"] for a free agent → `of104Send` (w.of104[gid] terms; cap + pending room, treasury, insulted, board) →
  endWeek `of104Answer`: signed elsewhere / lowball (< 0.75 × ask: interest −12, g.sc104 no talks 2 weeks) / offerVerdict refusal (a leaning rival may sign him, 50%) /
  hashed acceptance chance by wage over ask + interest / signGlad (+ rudis88); a recruiter letter each (key of104_*); Withdraw [data-of104x]; the offer button says "answered
  next week", the board tablet ✍. RIVALS: cpuLeagueWeek wrapper turns a fresh rival signing of a free agent into w.ro104 (news line removed), answered at next week's
  cpuLeagueWeek (your better pending offer heard first). INFIRMARY TWO WINGS — final mgrHTML pass `w104Page` replaces 298/318's ward grid (.rm100-ward) with `.w104`:
  banner `.w104ban` = Medicus head + ONE hours bar `.w104hb` (wound care .k104wc / recovery .k104rc / left) + hire/let go + ⓘ; list `.w104list` groups 🩸 Wounded
  (.w104grp.wd) / 💤 Weary (.wy) / Fit and fresh (details .fr), rows [data-inf90] with mini-bars, Treated ✓ (.trt103) / Rested ✓ (.rst104), 🛏 Take out; Hygeia's Blessing
  (.hyg87) at the list top; centre `.w104mid` = portrait + HP bar + 298's rm100Statue in .rm100niche + fatigue gauge `.w104g` (next week's marker when recovery is booked);
  plate tabs [data-w104t] ⚕ Ward (bed, Medicus/surgeon, Hygeia, Asclepius, Valetudinarium) | ♨ Baths (bathhouse, rub-down, Care routine, Rest week) opening on the
  fitting one (MGR.w104t/w104for); plates `.v104pl[data-v104p]` with hours + coin + effect, ★ = the next step (`w104Steps` = 318's ord101 + Baths steps); tabula
  `.w104tab` = hours split, booked this week, the Medicus's order, ⚕ Treat the wounded in order [data-mq104] (`mq104Run`: bed / Hygeia / surgeon / Medicus / bathhouse
  when short, festering → starters → rating), the selected fighter's steps, `mq104Warn` (also on Your ludus + Match Week). HOURS: mh101Max +3 (all houses), thMax −2;
  rub-down = window capture on [data-bath] (1 Medicus hour, w.rc104.rub; 105's training-hour rub no longer runs); Care routine = ord87Apply wrapper (1 Medicus hour a
  week, w.rc104.care; an unpaid week's −20 skipped by swapping ord87 to off during endWeek); Rest week 0 h; 318's yard "Recovery" block (.v101rec2) removed;
  careGuideHTML + ROUT87_SUB.care texts; FAC.valet.fx = beds + Medicus hours. BUILDINGS TAKE WEEKS — facBuild wrapper: one project per house (m.bp104 {k,l,s,end}, level N =
  N weeks, paid at the start), m.facWk kept on the running week (every "builders busy" check holds), endWeek `bp104Week` finishes it when its last week ends, OFF104.on
  (348) finishes all in the off-season; ludusClick 'build' wrapper says so; banner chip `.bp104c`; Upgrade School = lu102FacHTML wrapper tiles `.bp104t` (NOW → NEXT art
  `bp104Art`: rec100 murals / scene100 with level filters .bp104l0–3, Build disabled with the reason unless affordable + builders free, weeks to build); 297's lu2Row
  disabled while a project runs; Promote = promoteCardHTML wrapper art tiles (.pr104g/.pr104t). No save change.
- **354-v104fixw** (manager, v1.04 beta fixes B12 B13 B18 B20; kill switch `flavius_v104woff=1`; test tv104g): B12 the Yard's 🗣 Care button is gone (y92Card wrapper strips `data-y92care`;
  the Baths' Care routine replaces it); B13 the Doctore's name/stars/summary in the Yard banner (`.v104dc`), his Intensity + Time = the top row of the week's plan (the old `.y92doc`
  node moved into `.rm100plan .rm100wax`, class `.v104top`; the yard is two columns, `.v104y`), his hours lock (week plan `P.doclk`) with a card's drill that needs more than his
  hour-less level (y92LockIn wrapper) and with Lock in all (window-capture guard; also `P.reglk` locks the Intensity) — up yes, down no; locked drill tiles say what unlocks them
  (`y104Need`, `.v104unl`); B18 the hired house medicus is the CAPSARIUS (texts in 108/318/345/351), a staff slot in the Infirmary banner (`.v104cap`, face from `cap104Look`, candidates
  carry a stored `face`), his hours a gold `.k104cp` segment on the hours bar, the hire popup `cap104Pop` (three `.v104ct` tiles, `data-v101mh` kept, window-capture takes `[data-v101med]`
  because 318's opener is block-scoped), the list's small hire button gone; B20 row chips "Receiving treatment" / "Resting" (no ✓; 345's text changed too). No save change.
- **355-v104fixs** (src/manager; v1.04 beta 1 fixes B22 B21 B23 B24 B4 B3; kill switch flavius_v104soff=1, test tv104h) — B22: a playoff bout (tier sb104)
  takes only the bracket's houses; `sb104Why(w,b)` = the reason ("out of the Superbus" / "not in this round" / "not in this bout" / "chosen on the Superbus card");
  any100Why / any100Enter / any100Classic / any100Book / any100Open refuse sb104 bouts; st95Fill returns 0 in a playoff week (350's reserve cover swapped an
  outsider's seat — the leak); r101OffCard skips sb104 bouts and a window-capture refuses [data-rest] on a playoff fighter and [data-mg="underdog"]; the sb104
  cards lose the select / Enter / Withdraw / Fix and show `.v104sno`. B21: `po104BracketHTML` REPLACED by `sb104Tree` (R1 Bout A/B → Semi I/II → final →
  champion; CSS connectors `.v104k.k1/.k2`, `.lit` once the next round is set; rows `.v104e` seed · flagChip · house · place (RN), `.adv` gold / `.out` faded /
  `.me` outlined / `.pj` projected grey; root keeps `.po104bk[data-po104proj]`, boxes `.po104b.v104b`; `.v104sx` scrolls on phones, min-width 720); shown open:
  `.v104top` above the playoff card (card + banner bracket buttons removed), `.v104sbr` on the off-season page (its button removed), the League "Superbus" view
  (`MGR.sb104v`, banner button `[data-v104s="sb"|"std"]` next to 📅 Season, drawn into #mgrPane by sb104Post; any [data-mg="tab"] clears it; 348's League
  overlay button removed). The Match Week banner keeps its overlay button only in weeks 9–11. B23: endWeek wrapper sets V104S.toOff when the off-season opens; the
  next mgrHTML turns tab awards/paper into night; the off-season header gets 🏆 awards + 📜 Acta buttons (`.v104soa`). B24: composeWeekPaper wrapper stores a playoff
  week's edition as `<season>.11.<ph>` (rec.ph; week 11's own edition kept); paperHTML wrapper names it in the pager / masthead (`data-v104ed`) and the ribbon's
  next stage (week 11's ribbon → "Superbus · Round 1"). B4: no reset on a new career (tested); the wipe = an old-calendar career's season 1 (17's old Superbus
  special opens in week 1 of the next season). B3: `.mbox:has(.pn100) > #mClose.menu101` 46 px, in the Begin Event row (phones unchanged).
- **352-v104fixr** (manager, v1.04 beta fixes B1 B2 B6 B19; kill switch `flavius_v104roff=1`; test tv104e): B1 Keeping him = six (meal, word, kintix, bonus, raise, promise; `ptrain`/`medic` cut from the roster tray by an outer `mgrHTML`, they stay in the Yard / Infirmary), fold open by default (`R104.keepOpen`), one row via container query `r104k`; B2 `.r104rows` one grid with subgrid rows, name column `fit-content(210px)`, list column max 540 px (350 CSS superseded); B6 `r104TeamCtl` returns empty (the menu keeps the moves), hint `.r104hint`, `body.r104dnd` lights the group headers; B19 group "Injured" (`inj104`, `inj104Sync` inside `tm104Ensure`, `team104` answers `I`, `g.home104/step104/cover104`, `tm104Move` refuses injured; 350 got the `I` group + TM104 entry), Worn (fat over 60) warning on row / panel / bout picker, `mq104Warn` also fires when a vacated slot has no stand-in. No migration.
- **353-v104fixl** (manager, v1.04 beta fixes B5 B7 B8 B9 B10 B11 B14 B15 B16 B17; kill switch `flavius_v104loff`; test tv104f): cal104Init wrapper sends one "new season format" letter; recruit list column fills to the card beside it (!important over 64's inline max-height); quietButtons wrapper keeps coin icons, Promote popup in the popup font; arm94Redraw refreshes the Spares sell list; l104Sweep (mailLive + mgrHTML) files previous-season letters except offers, the old review, dead cart / bargain (data-rec84) / medicus letters; Vulso cart ✕ + auto-close at 2 bought; detailHTML wrapper keeps an offer-made button disabled with its box; the Week review starts collapsed.
- **356-v104fixb** (board, v1.04 beta fix B25; kill switch `flavius_v104boff=1`; test tv104i): floor marks never cross a figure. 07's 'pieces' layer calls `floor104(alphaFor)` before its depth-sorted figures (`floor104End` after): for still pieces it paints 227's team ring (bit 32), the gold active ring (1), the seat + thin team rings (2), tamed / Raged beast rings (4 / 8) and the shadow disc (64) first; the seat colour on the base rim (311 / 222 arc drawn after the figure) becomes a full floor ring outside the base wall (16, gold ring steps out). 07 / 227 skip marks the pass drew (`fl104Has`); the figure drawers' shadow discs (311 / 312 / 222 / 102 / 94) call `fl104Sh` (records per piece, skips when the pass painted the same disc a frame earlier); `fl104Rim` records the base for the pass. Moving pieces (glide, shove, beast walk, swimming, mounted, chariot events) draw inline as before. `FL104.st` = stats.
- **358-v104fixp** (manager, v1.04 beta-2 fixes B29 B34 B35; kill switch `flavius_v104poff=1`; test tv104k): B29 Play Now's 🎲 gets 🏛's sandstone tile at Begin Event's height, Begin sits 10 px from Home (247's `.pn-top` margin-right 40 px overridden, Home z-index 9); B34 an outer `mgrHTML` makes the banner bracket buttons (`.po104bb`, League `.v104slb[data-v104s=sb]`) regal (`.v104rg`: laurel + Superbus Cup, gold on crimson); B35 the playoff tree card is a block (title + legend above, full width, 7 even columns, phones scroll in `.v104sx`), bout titles one line ("Bout A · seeds 5·8·9·12", edit in 355's `sb104Tree`), the banner's `[data-bt85]` day tabs of sb104 bouts read Round 1 / Bout A, Bout B, Superbus / Semifinal I, Superbus / The Final (phones show the bout line).
- **357-v104fixm** (manager, v1.04 beta-2 fixes B26 B27 B28 B30 B33; kill switch `flavius_v104moff=1`; test tv104j): B26 roster page grid `fit-content(560px) 1fr` from 981 px, the list drops its inline-size container so the box is as wide as its rows (hint / bar / group headers add no width); B27 pitch / note / gift / feast draw on the Recruiter's hours (WOO104 1/1/2/4 h from w.rh98, +W104.rec.step per further action on the recruit that week, K.wo104 on the scouting record; paid in a recMark wrapper, the note after its handler; rec98Can / rec98Act / rec98Btn / rc100ActCard wrapped again so scouting rises after a woo; mgrHTML + detailHTML skin every wooing button with `.m104h` hours and disable it with the reason; a window-capture guard refuses a forced click); B28 weekChecklist + leaveList76 treat the "No drills set" item as done once the Yard plan is locked (P.reglk or every fit fighter has a locked card); B30 a booked Hygeia regrowth (g.rg102) disables every data-unbed76 with the reason, clicking the booked data-mg="heal" plate cancels it (hours + coin back; a double click books once); B33 pj104Send (endWeek + mgrHTML, week 9–10, once a season, w.pj104) sends the Consilium's letter on the projected bracket (seed, rest week / Round 1, neighbours + gap, advice, bracket button), none when unseeded. **B43 (v1.05):** woo104Skin puts the hours chip ONCE per action: pitch / gift / feast on their own button (gift + feast inside the tile's text block `.rc1wt`, tiles 56 px), the Private note ONCE in the card's title line (`.m104hd`, rows stay clean, none once the note is sent); disabled rows keep their reason.
- **359-v104fixb2** (board, v1.04 beta-2 fixes B31 + B32; kill switch `flavius_v104b2off`; test tv104l): 356 skipped moving pieces (glide 311 / shove 294 / beast walk), which then drew the gold ring and rim inline; now the pass paints their marks too, shifted by `fl104Offs` (glide delta / shove dx,dy), and `fl104Abs` keeps the cell-relative records valid after a step. B32: attack / net target rings (07 overlays), the Guide suggestion ring (29, `drawSugTile` wrapper) and the truce ring (78, bit 128) are painted in the pass when a piece stands on the tile (`b2Extra`, `fl104HlDone`); markers above the head stay above.
- **361-v105read** (manager, v1.05 workstream B "Your read"; kill switch `flavius_v105boff=1`; test tv105b): global `yourRead105(g)` -> null or {est,lo,hi,rough,src:sand|dossier|watched} (deterministic per world/week/fighter via hashStr; Recruiter lv 4+ = exact; wraps estOvr so boutProbs/Recruiting use it); betting column "Your scouts" -> "Your read" (17); wsand90Walk (185) reads every fighter on the card; a read = one rough look in Recruiting (g.sc98.l104, g.scout untouched); mgrAfterWatch gives the same look to a bout watched live; stored in w.read105 {wk,src}, aged out after 3 weeks.
- **362-v105league** (manager, v1.05 workstream C: N1 + F1; kill switch `flavius_v105coff=1`; test tv105c): N1 League season picker (a select from season 2: that season's final table from `m.spS[season]`, its Superbus bracket via 355's `sb104Tree` read-only on a stand-in world, its Flavian awards from `w.awardHist`); endWeek wrapper archives `w.seasons105[season]={po}` (a copy of that season's `w.po104`) when the season rolls over; older seasons show what exists or "Not recorded". F1 rail chips: `.hr99`, `.hrchip`, `.tabchk` float right like the other ovals.
- **363-v105renown** (manager, v1.05 x1a; kill switch `flavius_v105doff=1`; test tv105d): the lanista's perk points come from ONE Renown bar (REPLACES the free +1 a week and the scattered +1s). 17-manager's five grants (week, win, pledge, train, exhib) now call `perkGain105(m,src)`; this module wraps it: week = nothing, the rest = renown (`renown105(m,key,n)`, amounts in `REN105.amt`, level cost `REN105.cost` = 10 +2 per 12 levels, 1 point per level paid at once). Extra sources by wrapper: applyBout (Superbus round played / won / final won, full house >=90% of capacity), signGlad (new signing ovr>=62 or pot>=75), BUS season.offseason (podium 1-3 in the final league table). `m.renown={lv,xp,s,src,prev}` is created lazily (existing careers keep their points, bar starts at 0; no migration). `perkTree87` (150) text line `.pk87how` is replaced by the bar `#ren105`.
- **364-v105contrast** (ui, v1.05; kill switch `flavius_v105ctoff=1`; test tv93a): player-colour names (`<b style="color:#hex">` from nm() and panels) are lifted to a lighter tint of the same hue on the dark panels, so every PALETTE/class colour is AA (purple #8a5cc0 was 3.7:1, red 3.4, blue 4.3, dark grey 3.1). CSS only; seat colour in tokens/chips unchanged.
- **360-v105mw** (manager, v1.05 workstream A — N2 Match Week rework + picks 1–9 + B35d + mw1; kill switch `flavius_v105aoff=1`; test tv105a): a final `mgrHTML` wrapper (tab night, not bye / lesson / special) reshapes the page in a template. Cards are matched to bouts by a hidden `[data-mw105i]` marker (`boutSidesHTML` wrapper while `nightHTML` runs, `MW105.tag`). BANNER `.mw105ban` (slim, flex): `.mw105L` = title, `.mw105chips` (road / omen / Grand Games / 🔒 road lock; playoffs: `.mw105po` seed + spot, `[data-mw105="tree"]` scrolls to the tree — B21 keeps bracket buttons off this page), `.mw105row` (bt85 day tabs — a click opens that bout — + Walk the city square); `.mw105wk` "Your week at <city>" (entered · fees · your take · bets · verdicts · fought; `[data-mw105="off"]` 🛣 Set off, Simulate the rest `.mw105sb[data-mg="simall"]` (no .btn, so 306 leaves it plain), `[data-mw105="end"]`, `.mw105nt` reason; no treasury). LIST `.mw105list > article.mw105b[data-mw105b=i]` in `any100Seq` order: head = 296's `.a1ev` row (built by `mw105HeadHTML` when missing, e.g. Superbus bouts) + `.mw105c` HP/fatigue/morale + `.mw105w` wound warning, chevron `[data-mw105t]`; body `.mw105bd` = the old `.card2.bout` (purse + fee tiles removed — on the row only; tickets bar `.mw105bar`; `.bstake` removed, hidden `#mgStake<i>` kept; "Your read" column from `yourRead105(g)` (361) with `.mw105vb` value/trap on the odds + `.mw105bv` ★ best value; `.mw105rv` ⚔ Rival (rivalOf pair or heat ≥ 35); ONE Watch (watch when your fighter is in the bout, else spect with the seat fee); `.mw105y` reasons on `[data-dis]`; phones: `table.mw105tb` rows as cards). Fought = `.mw105res` (place, house, CF, fate, house101 coin, bet slips, `.mw105vd` this bout's verdict rows moved from #pendbox) + `.mw105rt` result tag; `#nightRes` and `#any100wk` removed. Open set `MW105.open` (the next bout; after a bout ends: that result + the next). `.mw105sum` "what changed" once all are fought (`w.mw105s` snapshot {wk,pos,ovr} taken at the first render / applyBout of the week). Bet → `.mw105pop` window (−/+, 5·10·25·50 within `betMaxStake`, pays, Place bet → 17's `[data-mg="bet"]` re-clicked with `MW105.pass`). mw1: `mw105NeedOff(w)` (away, paid, not `travel.gone`) — Fight/Watch/Sim/Spectate/Simulate the rest/Set off and the travel buttons show the set-off window on a trusted click — a script click sets off silently — (`mw105Leave` = leaveList76 + Recruiter hours) instead of 108's; confirming sets `travel.gone`. `mw105RecLocked` = roadLocked76: `recruitHTML` wrapper adds `.mw105rl` + `data-dis` on `REC105` actions (Signed view stays open), a window-capture guard, `hr99Sync` chip "🛣 Away". `endConfirmHTML` wrapper: on the road no skip list / hours / perk lines; `.mw105sim` names the bouts End the week simulates (`[data-mg="endweek"]` capture runs them first; verdicts stop it).

- **365-v105cal** (src/manager) — his q1a: a NEW career starts at Season 1 week 1 on its own calendar. `newWorld` wrapper runs the base with `calNow()` answering S1 W1 and `calSet` a no-op (`CAL105.on`), so every season-derived field (fixture, first night, 348 `cal104`, 349 curves, `startSeason`, mid-season join records) is built for season 1; then `w.ownCal=true`, `w.cal105=1`. A `cal105` world never `calSet`s the empire calendar (makeNight) and `calLag` is 0 (no banner, no catch-up). Old careers and the lesson career untouched. Kill switch `flavius_v105caloff=1`. Test tv105e.
- **366-v105fixb3** (board, v1.05 beta-1 fix B36; kill switch `flavius_v105b3off=1`; test tv105f): ROOT CAUSE of B25/B31/B36 "seat disc over the active mini's shins": 07-ui's 'pieces' alphaFor (See-through 'auto', the default) faded the piece whose turn it is because his own move tiles (HL) / the hover tile behind him fall in his sprite box, so his legs went see-through and his floor marks + base showed through them (nothing was drawn after the figure; the earlier tests ran with XRAY='off'). Wraps `floor104` (passes an alphaFor that keeps the active piece at 1), `floor104End`, `drawPlayer` (the active piece at full opacity inside the pieces layer only; other pieces/pillars still fade; See-through 'on' unchanged). Bases off: `fl104Sh` records the scale 321's `ell` drew the shadow at (`k105`) and `fl104Shadow` repaints it at that scale (the pass drew it base-sized ≈0.9 tile, the inline frames small — the intermittent disc); a 312 3D beast's shadow (outside 321's wrapper, flag set by a `bst100Piece` wrapper) shrinks ×0.62 too. Stats `B3105.st`.

- **370-v105net** (board, v1.05 B41; kill switch `flavius_v105netoff=1`; test tv105i): the wrapped net (312 `bst100NetWrap`, the bell/dome of cords on a netted piece) was painted from `drawFX`, after every figure, so it crossed a gladiator standing in front of a netted snake. While 312's `bst100NetsPaint` runs `NET105.skip` makes `bst100NetWrap` a no-op; `drawNPC` / `drawPlayer` (wrapped last) call `net105Own(u)` right after the figure, so the depth sort puts the net behind pieces in front and over pieces behind. Same geometry and look; the throw (wind-up, flight, flat drop disc) stays in 312's FX pass, the drop's wrap fades in with the piece. Works for netted beasts and gladiators on the 3D figure and classic token paths; Animations Off / Reduce motion keep the still net. `NET105.rec` is a test-only recorder.
- **369-v105flag** (stands, v1.05 B40): the held flag hangs ON its pole. 321 `flag101Draw` drew the vexillum bitmap (own centred pole + margin) at the pole x, so the cloth floated right; a wrapper swaps its one `drawImage` for a cloth-only crop with the hoist edge on the pole x just under the finial (same scale/art, both facings, any zoom). `FLAG105.last` = [{px,hx}]. Kill switch `flavius_v105flagoff=1`. Test tv105h.
- **367-v105menu** (ui, v1.05 B38; kill switch `flavius_v105moff=1` = 282's old 1.5 s cap → flat show; test tv105g): the main menu show NEVER falls back to the flat show. A visit whose mm100 strips are not decoded waits: a quiet backdrop (`mm105Backdrop`), the still 3D group photo (282's still picture via an `mm100Still` wrapper while `MM105.wait`) once the gladiators' `g_*` strips are in, then the 3D show from its start (`mm105Go`); 282's cap timer stands down (its `MM100S.tok` goes stale); a failed strip is re-asked once after 2 s, then the still stays. Same B38: assets/mm100_*.webp RE-RENDERED by tools/art/mm100/make.js from today's figures (the game's tok93.js at FIG_SCALE + 311 ANIM100_LIB rows; beast5 rigs with SIZE102/103 + SLIM103; humanoids k102) at one board-true scale (MM100_META v2 `px`; long bases per 312 bst100Scale), 282 `MM100_BOOST` all 1, `MM100_TIP` read from the meta, the duel challenger at Commodus's scale. NO BASES on the menu figures (his call 2026-10-17, "default the main menu show to no bases"; not tied to Settings → Show token bases): make.js renders every strip without its base (tok93 `baseG` hidden, the humanoids' TOK base hidden, beasts `makeBase(null)`; the scale is still probed on the soldier WITH his base), every cell's anchor = the feet (gladiators' anchor moved up from the base bottom by 3.2 mm at 30°), `MM100_META.nb` 1; 282 `mm100Spr` draws a soft contact shadow at the feet (`mm100Shadow`: one gradient sprite, the board's base-less ×0.62 size) instead of the base-sized ellipse.
- **371-v105pot** (board, v1.05 B42; kill switch `flavius_v105potoff=1`; test tv105j): a pot that holds shows it on the board. doAttack's pot branch emits BUS `pot.hold` {r,c,dmg,need}; the module floats one readout above the pillar through 277's `h100Add` ("Holds · 1 of 2", or "Miss" which replaces the small "Missed") and jiggles the pot (drawPillar/drawPot wrapper) unless Reduce motion / Animations Off. Display only; 277 readouts take an optional `up`.
- **368-v105pnrow** (playnow, v1.05 beta fix B39; kill switch `flavius_v105poff2=1`; test tv104k): Play Now's action row is one row. Cause: 247's `.pn98 .pn-top` sticky `top:-18px` + `margin-top:-6px` clipped the tops of 🎲 / Begin Event, and 🏛 is the modal's own `#mClose` (child of `.mbox`), so it never moved with the row. Now (> 600 px) the row sticks at `top:0` and the real `#mClose` node is moved into `.pn98go` after Begin Event (static, 46 px, centered, 10 px gaps); it returns to `.mbox` before `modal()` writes a body, on close/re-render and on phones (<= 600 px keep 🏛 in the header).

- **377-v105ban** (src/manager) — his F2: the Your-ludus week banner loses its review chips (.lst91: treasury now, fame, wins/bouts, fallen · N in all, N this week; made by 202/272/294). A last `mgrHTML` wrapper drops them; the building-project chip (.bp104c) stays. Kill switch `flavius_v105banoff=1`. Test tv105n.
- **376-v105city** (city, v1.05 B47; kill switch `flavius_v105cityoff=1`; test tv105m): no house stands under or in front of the arena in any City Square. 172 `outer89` (the procedural ring of outer houses, seeded by the city name, not hand-placed) is wrapped and drops a block when its footprint lies within 0.6 tile of the arena ellipse, when its foot lies inside the arena's screen silhouette (the wall hid its base, only the roof peeked out), or when its silhouette overlaps the arena's and it stands nearer the camera (the arena sprite is painted over the baked houses). Deterministic geometry only (no dice); `city105Placed(city)` / `city105Hit(block)` / `CITY105.last` expose the data for tests.
- **379-v105loan** (src/manager, v1.05 B55; kill switch `flavius_v105loanoff=1`; test tv105p): accepting a loan ask from its letter. 47's `offyes` handler ignored lendTo's return and always dropped the letter, so a refusal (343 cap, 345 hurt, 350 bout slot / no room / cannot pay the lump) looked accepted. A window-capture handler now lends through lendTo only, answers the letter only on success, and otherwise keeps it open with the reason (`.l105why`, via a `loanReq103` wrapper).
- **380-v105rudis** (src/manager, v1.05 B56; kill switch `flavius_v105rudisoff=1`; test tv105q): rudis (freedom) asks only in the off-season. `rudis105Window(w)` = OFF104.active (the hook v1.07 Winter festival moves). Wraps `leagueFate` (17: an in-season 50+ CF Freedom fate is stored as g.rudis105 and asked when the off-season opens) and `purseWeek` (28: the buy-freedom ask is masked, made in the OFF104 handler). The off-season page lists pending verdicts. Pending asks in old saves stay answerable; Online 340 and Play Now untouched. v1.09c: ask105 exposed as `window.rudis105Ask`; 416 closes the window in Winter Quarters until the Saturnalia has a winner.
- **373-v105yard** (manager, v1.05 B44 — the Training Yard rework, his t1a t2a t3a y1a + the approved mock-up; kill switch `flavius_v105yoff=1` = the v1.04 Yard; test tv105k): `yard92HTML` returns a slot and a final `mgrHTML` wrapper builds the room: banner with ONE big "training hours left of N"; the DOCTORE ROW (face, Time with him − N h + `data-y105="doc|±1"` from the same weekly pool P.doc, level ladder, 📜 Study, Intensity = `data-mg="regime"` greyed without hours, ONE team-drill tile cycled ‹ › `data-y105="dr|±1"` over Y92_PRE, sit-out chips `data-y105="out|id"`); the squad list (`data-y99sel`) · the fighter's own sessions (213's y92Bar / `data-y92s`, previews incl. the team drill, Bond + Own doctore) · ONE ⚔ trial tile cycled `data-y105="tr|±1"` with the old `data-yb76` run button + yardCard76 panel; the TABULA strip (box per fighter, ↻ `data-y105="same"`, 🔒 `data-y105="lock"` Lock in all). Level = hours: 1 h Lv 1, +1 per 2 more h, cap min(5, 2 + Yard + Council Doctore bonus); bonus = y92Bonus(lv) + 5% per Yard level. Lock in all locks sessions (y92LockIn), hours (P.doclk), Intensity (P.reglk), drill + sit-outs (P.y105 {k,out,on,lv,bn}, P.lk105); a window-capture guard refuses every Yard control afterwards. thResolve wrapper trains every fit, not sat-out fighter (213 preset maths, fatigue PRE_H × FAT_HOUR × Intensity); endWeek wrapper holds w.train at 'off' when he has no hours (also weekMoney), caps the 81 regime lift at TH_DOC, keeps w.y105last. Old per-fighter drills: locked ones still resolve, unlocked dropped (SAVE_MIGRATIONS '1.05'). Re-words 36-mtutor's yard steps + 308's g_yard tip. Replaces 213's per-fighter drills / "level = 1 + Yard + hours/2", 298's yard room + drill plates, 354's v104top row.
- **378-v105rec** (src/manager) — his B49 B50 P1a B51 B52 B54 B57 B59 + M1a (tools/plans/v105/NOTES.md). A recruit who signed elsewhere = a plain notice (sendLetter wrapper on 351 of104Letter keys, act:false, files itself next week; the advice stays for a free agent). A fighter signed in the last 4 weeks (`set105Left`, contract.since) takes no offer: rival poaching (17, temp noPoach), Sica (100), trade / loan asks (47 offersWeek + loansWeek pruned), buy-outs (350), Clerk market advice (343); the player cannot poach or trade for a rival new signing (poachVerdict, disabled Poach / Send with the reason); the tag "🆕 settling in · N wk" via gTags + 350 r104Row. A bargain letter is not made for a recruit on the board and files when he is added (B51). The mail panel hides when empty (B52). Recruiting keeps the picked recruit options panel in view across redraws (B54). "Answer by" only for tasks: link-only letters become information (B57/M1a); "asks for a fight" clears once he is entered (B59). Kill switch `flavius_v105recoff=1`; test tv105o.

- **381-v105seed** (manager, v1.05 B58; kill switch `flavius_v105seedoff=1`; test tv105r): seeds are not table places (po104Seeds skips Sica; leagueSort = points, win rate, fame). 290 `wd100LeagueView` is wrapped: from week 9 a narrow Seed column (po104Seeds itself, or the real `w.po104.seeds` once drawn; 1-4 marked as rest, Sica "—", outsiders blank) and the tie-break order as the # tooltip. 357 B33 Consilium letter is dated "(after week N)" and filed for its week only (a `sendLetter` wrapper). The Match Week Superbus chip already reads the real seeds.
- **374-v105mwban** (manager, v1.05 B45; kill switch `flavius_v105mwbanoff=1`; test tv105a): the Match Week banner of 360 made slim (about half the height). A wrapper of `mw105Shape` re-arranges the DOM (class `.mw105slim`): row 1 = city + "Match Week · week N" + the chips inline (24 px pills, text centred, one line, ellipsis + title), row 2 = map inset + day tabs + Walk the city square (+ links); the "Your week" box compact at the right (six tiles in one row, Simulate the rest / End the week + reason line on one row); phones (≤760 px) stack. Also in 360 (same release): B53 a finished bout folds to its result row, only the next bout is open, after the last all fold and the page scrolls to the top (smooth; instant with Reduce motion); B60 `[data-mg="city"]` is a set-off trigger (`MW105_START`): in an away week the city square asks "Set off for <city>?" first.
- **382-v105home** (v1.05 B61): a recruit's home-city want + the +8 home interest bonus name a city WITH AN ARENA — arena-city recruits keep theirs, other towns take the nearest arena city (`homeArena105(g)`, cached `g.homeArena105`; towns' map positions from MI100_XTRA/CITY_XY); wraps want88Fits/want88How/baseInterest; `want88Def(k,g)` shows "Home: Thysdrus (from Alexandria)". glad.city unchanged. Kill switch `flavius_v105homeoff=1`. Test tv105s.
- **375-v105mgr** (manager, v1.05 B46 + B48): the Golden Eagle is in at most ONE Match Week bout a week, about half the weeks none (`eg105Pick(w)` = hashStr(world:season:week), never the dice RNG; a `boutCfg` wrapper sets `opts.eaglePot` only on that bout; 272's "Golden Eagle in play" chip asks `eg105Has`; 17's exhibition/trial specs carry no Eagle via `eg105Live()`; Play Now, tournaments, Online untouched). The Infirmary shows no unbuilt building (B48, his call 2026-10-17): every `[data-mg="build"]` on the infirmary page is removed with its plate/section (351's Valetudinarium `.v104pl`, 318's `.iv90s.bd`; an emptied `.acts` too), so there is no button, link, art or price and the grid closes up; buildings are bought only in My Ludus. Care bookings (Hygeia, Asclepius, surgeon, Medicus, baths) stay. Kill switch `flavius_v105mgroff=1`. Test tv105l.
- **386-v105renew** (manager, v1.05 B67; kill switch `flavius_v105renewoff=1`; test tv105w): wraps `po104OffHTML` (348): each off-season contract-renewal row gets one compact line after the name: grade chip + OVR (`r104Grade`/`gradeCol`/`effOvr`, the roster's), W–L (`g.rec`, the roster's number) and the last 5 results as `.fchip` dots (`g.recent`, as the League). Wraps at 390 px.
- **384-v105start** (manager, v1.05 B64; kill switch `flavius_v105startoff=1`; test tv105u): the Match Week warning reads THIS WEEK's card. `mq104Warn` (351, widened by 352) is replaced: `st105Gaps(w,pm)` lists the undone bouts the house is in (own fighter entered, or a starter holds / was moved off that bout's slot) with no fit fighter; the text names each ("Sat Feature has no fit fighter") and keeps the "promote one on the Roster" hint. None on a bye, off-season, or when every bout has its fighter. Every display (Your ludus, Match Week, Infirmary, tasks) goes through mq104Warn, so one check.
- **387-v105task** (v1.05 B68/B69, kill switch flavius_v105taskoff): empty-hand tasks + Match Week Gear-up line only for fighters who fight this week (First team or entered in a bout; wraps arm94Todo); the building-project chip (.bp104c) also on the banner of its building's page (valet→Infirmary, yard/stands→Yard, armory, barracks→Roster, stables→Match Week). 382 gained HOME_OVR105 (Londinium→Nemausus, Antiochia→Syracusae). Test tv105x.
- **383-v105riv** (src/manager, v1.05 B62/B63/C1a; kill switch `flavius_v105rivoff=1`; test tv105t): Rivalry Week (week 11). B62: the trip costs nothing (n.travel paid, cost kept for the set-off window, flag free105; travel card + 360 banner chip "trip paid by the games"). B63: the player house is always seated: rivalPairs never leaves him the odd house, rivalEligible uses the game fitness (riv105Fit: no injury, not resting) for him, a Match Week card (data-riv105) shows his auto-picked pair, editable until set-off or the first bout, free-agent places re-seat when his fighters heal, fewer than 2 fit = warning + 77 forfeit rule (-8 fame, free agents). C1a: edits 373 y105DocHTML — ladder shows "free" steps / hours still needed and "+N from <advisor> (your Doctore advisor)" on the ladder and the Doctore line.
- **385-v105dead** (manager, v1.05 B66; kill switch `flavius_v105deadoff=1`; test tv105v): a fighter killed in a bout (killFighter, so also blood-money "let him go") KEEPS his contract, marked `g.fallen105`, until the week ends (was: contract cleared at once, so every `!g.contract` test read him as a free agent). `fallen105(m)` lists them; endWeek wrapper clears the contract after the base week-end (grave entry already written by the death); offerVerdict/recMark/cityFav refuse the dead; roster page gets a "Fallen this week" strip (r104ListHTML wrapper). A verdict that frees him alive (rudis, bought freedom) is unchanged: Liberti, contract cleared at once.
- **389-v105sq** (src/manager, v1.05 B74/B75; kill switch `flavius_v105sqoff=1`; test tv105aa): the City Square is locked until the house sets off (citySquareGate + openCitySquare refuse, the Walk button shows 🔒 Set off first; replaces beta 3's set-off ask); the Match Week banner drops the trip chip, world-event chip and temple/sand links, the trip cost sits on the Set off button
- **388-v105compact** (manager, v1.05 beta-3 B70/B71, his Y1a Y2a Y3 Y4a; kill switch `flavius_v105compactoff=1`; test tv105z): LAYOUT ONLY, a `mgrHTML` wrapper after 387 that moves/restyles the DOM 373/299/243 build (same buttons, handlers, data attributes). Yard (`.y105.cp105`): one top band (Doctore | Time with him: stepper + Lv ladder on one row, then the advisor/sub line + 📜 Study chip | Intensity, shorter buttons), blocks top-aligned; then one row: the Team drill card at its content width (‹ › kept) + the Who-drills chips. Lock in (`[data-y105="lock"]`, 373's handler) moves from the Tabula into the banner beside the hours chip; its note becomes its title. Trial of the Yard: a disabled run button whose reason is printed under it (`.y105why`, e.g. Beast pen "Needs 2 hours") loses its duplicate title. Armory / Recruiting / Yard banners = the slim Roster/Infirmary banner (`.cp105ban`, 298's rm100ban look re-scoped to `#mgrBody`, 74 px at 1440): face at left (Doctore · the Recruiter, replacing 299's `.rc1banf` · a 🛡 medallion for the Armory), title + one line, counters as chips (`.y105hrs` keeps `.y105big`; `.roomstat` + rm100cnt, still shown on phones); 387's `.bp104c` moved before the counters. Phones: the Yard banner wraps, Lock in stays in the first screen. Review round: time block in two columns (`.cp105ts` stepper + Study chip | `.cp105tl` ladder + lines), Intensity 310 px (no strip under it); the locked button carries the Tabula's note as its title; the Armory title drops its own 🛡; phones keep Armory / Recruiting to one row (`.cp105one`: the counter's number only). Review round 2: `.y105dtop` is a grid — Doctore `minmax(170px,220px)` | Time `minmax(0,auto)` (its content width: no gap before Intensity at 2000 px) | Intensity `minmax(380px,1fr)` (buttons ≥ 90 px, cost on one line; idle, the four "needs his time" are hidden — the note says it); wide Yard (container ≥ 1500) Doctore up to 340 px; container ≤ 1000 (laptops ~1100–1300 px) two columns: Doctore over Intensity | Time beside both; ≤ 620 one column. Drill card `width:max-content` (max 560). The Time block's advisor line is dropped when the Doctore's level line already names him. No title on the counter chips (Recruiting keeps 319's data-tip); phones: the Armory number gets a 🛡 (`.cp105arm`). Review round 3: the Armory's "🛡 Your Armory" heading (229) is dropped and its "⚕ Hurt: …" line becomes a `.roomstat.cp105hurt` banner chip after the shelf chip (count; names + the fit-only rule in its data-tip); the Doctore column 228–236 px below 1500 px (one-line eyebrow, 12 px text), the Study chip one line, the Time lines 11 px; ≥1500 px the "N of N fit fighters drill" note sits on the chips' line.
- **390-v105wban** (manager, v1.05 B73, his L1a L2a; kill switch `flavius_v105wbanoff=1`; test tv105ab): a `mgrHTML` wrapper after 388 that gives the Lanista tab (`b73-me`) and the five World tabs (290: news, league, imp, trophy, sched) the slim banner of 388 (`.cp105ban` + `.wb105`, 74 px at 1440 = the Roster banner): the painted `.pic` stays behind, the round `.wd100ico` is the face (Lanista: your portrait, its title drops the 👤), h2 = title, `.sub` = the one line (the "World · X" eyebrow text goes; `.kick` keeps the League Season / Superbus / Bracket buttons), the counters (`.wd100bc`, 317 perk points) are chips. League: the podium is three `.wb105med` chips 🥇🥈🥉 (parma100 + short house name + points, title = lp96Tip prize line). Tituli: up to 4 `trophySVG` 22 px icons (`.wb105tro .wd100pl .tr`, wd100TroBest order) + an "N of M earned" chip (`.wb105of`, `.all` gold when complete); none earned = "Your first honour awaits" as the line. REPLACES the v1.0 painted World banners, the banner podium + cup and the trophy plinths / laurel ring.
- **391-v105b5a** (v1.05 beta-5 A: B76 the Armory (225 arm94Sel/arm94HTML via arm105Own) lists only First team / Second team / Reserves — not lent out, not injured; B77 the weekly 'contract ends' task shows one button per fighter naming him; B78 Save & quit (#mClose, the same element) moves into the Manager rail below End the week, the end of the bottom bar on phones — put home before every mgrPaint / rail90Fix swap / modal(); 368's homeBack skips it). Kill switch flavius_v105b5aoff=1. Test tv105ac.
- **392-v105hrs** (manager, v1.05 beta-4 B79/B80/B81, his T1a T2a H1a H2a H3a; kill switch `flavius_v105hrsoff=1`; test tv105ad): a `mgrHTML` wrapper after 388 (reuses its `.cp105ban`). Yard: the Tabula (`.y105tab`) and "Last week in the yard" (`.yd76log`) are removed, "↻ Same as last week" (`data-y105="same"`) sits in the banner beside Lock in. Wagers (`exch`): the slim banner with a 💰 medallion and the week's bouts as small chips. ONE hours chip `hrs105Chip(left,total,label,state,tip)` (`.hc105`, states on / done ✓ / over) on the Yard (Training), Recruiting (Recruiter) and Infirmary (Medicus; its Capsarius `.v104cap` is a separate chip `.cp105cap`) banners — numbers from thLeft/thMax, rec99Left/rec98HrsMax, mh101Left/mh101Max. ONE rail pill `.hp105` (`hp105Sync`, via a `hr99Sync` wrapper + 600 ms sweep; gold "N h", dim ✓ when spent) on Recruiting + Training Yard; the old hr99 / c73 ovals there are hidden by CSS. REPLACES the Yard's `.y105hrs` plate, Recruiting's hours `.roomstat`, the Infirmary's `.w104hb` box.
- **393-v106lock** (manager, v1.06 SEASON LOCKS, his d1a d2-1,2,3; kill switch `flavius_v106lockoff=1`; test tv106a): trade + loan DEADLINE at the end of week 8 (`LK106.dl`; `lk106Past(w)` = season week 9–12, the frozen playoff weeks included). From week 9 no new trades, loans or loan asks for the player, the rivals and Sica: offersWeek makes none, open swap/coin/loan/loanin/buy-out offers + w.bi104 + the tb104 counter lapse (`lk106Prune`, their news lines go too), lendTo / borrowFrom / offerAccept / c104Swap / c104BuyOut / c104Counter / doPoach / poachVerdict / ludusClick (Propose a trade, Send) refuse, cpuLeagueWeek poaching (noPoach) and sicaPoach stop, the Clerk's loan advice is not given; running loans finish on their terms. Locked buttons/pickers show "🔒 Deadline passed" disabled (`lk106Sweep` after `mgrPaint` + a body MutationObserver for popups; the roster ⋯ menu gets one locked line). Week-7 information letter "Trade deadline after week 8" (`lk106Warn`, key `lk106-<season>`). Signing after it only into an empty spot: `cap103Why` counts your fighters out on loan. Superbus roster frozen: `w.lk106 = {s, wk, r:{mid:[gid]}}` taken at the first week end past the deadline (older saves: the first time it is needed, no migration); `po104Fit` accepts only those fighters. Playoff weeks (po104Ph r1/sf/fin): Release locked (window guard + sweep), rivals keep their extras.
- **394-v106trade** (manager, v1.06 RIVAL TRADE MOTIVES, his t1a; kill switch `flavius_v106troff=1`; test tv106b): REPLACES 47's value-match offer (47's offersWeek now prunes then calls `offersGen`, which 394 wraps). `tr106Motive(w,m)` = wages (coin < 3 weeks of wages or < 60) · allin (top 4 in weeks 7–8) · gap (a hurt starter) · sell (an own fighter about to fade, 349 c104Phase) · gap (a squad of ≤ 2 classes lacking one you have) · youth (bottom third from week 3, or squad age 27+). `tr106Val` / `tr106Parts` = rating×2.2 + fame×1.2 + age (+1.5/yr under 24, −4/yr over 28) + career phase/kind + potential − wage×2. `tr106Plan` builds the offer (coin ≤ treasury − 4 weeks of wages), `tr106Gen` picks the week's one from `mulberry32(hashStr('tr106|world|season|week'))` (no Math.random). Offer fields `mot106`, `why106`, `dw106` (weekly cost for you); the card (offersHTML wrapper) adds `.tr106` = the reason + "+N/wk for you". `w.tr106n` counts by motive (tools/mgrsim.js prints it; `V106T=off`, `TRADES=accept`).
- **395-v106inf** (manager, v1.06 I1; kill switch `flavius_v106infoff=1`; test tv106c): LAYOUT ONLY, a `mgrHTML` wrapper after 392: the Infirmary's slim banner gets "⚕ N injured" (`.hc106inj`, the `.hc105` look in its own class so `.hc105` still finds the hours chip; dim `.hc106z` at 0; tip adds how many still need care) before the Capsarius and Medicus hours chips. The rail keeps "⚕ N". 74 px at 1440.
- **396-v106aim** (board, v1.06 TARGET CLARITY, his u1c u2a; kill switch `flavius_v106aimoff=1`; tests tv106d tv106g): DISPLAY/INPUT ONLY. While HL holds `atk`/`catk` tiles (`AIM106.tmap`), the target figures' `ctx.drawImage` calls are recorded in a `drawPlayer`/`drawNPC` wrapper (`aim106Rec`; `bs101Patch` waits while recording) and `pick()` returns the tile of the front-most target BODY under the pointer (`aim106Body`: 1×1 alpha sample; tainted image = its rectangle), then the attack tile. Hover (pointermove, one test per rAF, redraw only on change): red ring (`aim106Ring`, highlights layer; pulses ≈1.5 s, static under Reduce motion / Animations Off), cached outline sprite drawn in the figure's depth slot (`aim106Outline`, ≤8 cached), crosshair cursor, tag "Name · NN% to wound · ~N dmg" (`aim106Tag`, overlays; his a1a a2a 2026-10-18: `aim106Wound(att,target,kind,src)` → {p, avg, notes} = the EXACT chance to put ≥1 damage on the location / beast (a pot: to break), dice enumerated + rollLoc's distribution + every modifier in tools/plans/v106/AIM-MODIFIERS.md; defender choices (shield, Minerva, Fidelis) assumed made, attacker choices (Omnia in hand, Focus spot) in his favour; pure; `aim106Chance(h)` caches per HL entry + state stamp; `aim106Line` formats; the damage shows at 50%+; test tv106g = model vs a Monte-Carlo of the real doAttack/tamedAttack, 38 cases). Touch: tap = select (`AIM106.sel`), same target again = strike, elsewhere = cancel (window capture click). Settings → General "⚔ Confirm attacks" (`SETTINGS.confirmAtk106`, off): an `onTile` wrapper asks `ask76` "Strike …?" first; OFFLINE ONLY (`aim106Online`: row hidden, setting ignored).
- **399-v106light** (board, v1.06a LIGHT + SHADOWS, his brief 2026-10-17 + v1a–v6a + his mock-up ok 2026-10-18; kill switch `flavius_light106off=1` = Off; test tv106l; tools/plans/v106/NOTES.md, MOCKUP.md, BASELINE.md "v1.06a final"): ONE SUN `LIGHT106_SUN` (az 30° el 55°, shadows lower right) + the bake light `LIGHT106_BAKE` (key = sun, fill, thin rim, base darkened baseK 0.7) read by tools/art/anim100/make.js l106 (the 8 classes' move + act + 32 severed sets, re-lit IN PLACE over assets/anim100_* + ANIM100_META; ground-shadow sheets assets/anim106_<cls>[_<limb>]_<set>_sh.webp at half resolution, black + lossy alpha via tools/art/anim100/shenc.py, phone set anim106p_* = half of that; meta `L106_META`) and tools/art/anim100b/make.js l106 (312's beasts re-lit over assets/beast100_*, shadows anim106[p]_beast_<part>_sh.webp, meta `L106_BMETA`; the look rigs use tools/art/anim100b/l106.js; the spider swarm gets none). 311 ANIM100_LIB `light()` / `shadowRow()` = the same light + shadow for Studio / Online tokens rendered on the device (VER 5, the shadow blob in IndexedDB beside the sheet; a device that fails it → today's render, `AN100.noLight`). Settings → Board & pieces → Lighting (`SETTINGS.light106` full | light | off; default Full desktop, Light on phones ≤ 700 px / coarse pointer; localStorage `flavius_light106` overrides): Off = the old discs, no pass; Light = contact shadows only; Full = + casts. Full → Light by itself (`l106Drop`, one toast, `flavius_light106drop` until Full is picked again) when ≥ 60 % of the frames in 5 s (≥ 60 frames) run over 17.5 ms — 288's meter (F100.fr) when shown, else the rAF interval after a board draw; `flavius_light106auto=0` never. THE PASS at the end of 'decals' (under highlights, rings, figures): (1) a CACHED STATIC LAYER (pillar/jug/chest solids of revolution + rubble stones merged at full strength, laid at .cast once, + their contacts), key = mode, night, 3% size step, orientation, pillars/jugs/chest/rubble; stored in tile units against A-1 (a pan moves it); a shoved pillar drawn live at its offset; (2) Full: each gladiator's / beast's BAKED shadow cell for THIS frame's pose (an100Pose / bst100Pose, facing, glide, shove) straight on the board; no baked shadow (device render pending, standalone) = contact only; (3) contact sprite at every piece (fl104Sh records the base size; position fresh). Cast shadows lifted 75 % off highlighted tiles by a clip (`l106Lifted`). Night = same direction, ~half strength. Stats `L106.st`, `L106.last`; bench tools/bench/board.js. Display only: no S, rand(), save or lockstep.
- **398-v106b1b** (board, v1.06 beta-1 G5 + G4, his g4a g5a; kill switch `flavius_v106b1boff=1`; test tv106f): G5a NO RINGS UNDER FIGURES (REPLACES the v1.0 team rings at the mini bases / 346 thin rim / 356 floor rings): `fl104Has` answers true for the ring bits (1 gold, 2 seat+team, 4 tamed, 8 Raged, 16 rim, 32 227 team ring, 128 truce) so every inline drawer skips them; inside 356's floor pass `fl104Ring` is a no-op and, in team events only, a gated stroke/fill installed ONCE on the board ctx (`b1bGate`, `B1B106.mute===2`) mutes 356's team ring + tint; `fl104Shadow` and 359's `b2Extra` (attack / net target rings, Guide ring) are let through, its truce ring goes (`truceViewer` null there). NEW: the active piece's tile highlighted gold in the 'highlights' layer (`b1bTile`, drawLayers93 wrapper); team events: a team-colour chip with the team letter beside the pennant (`b1bChip`, drawn from drawFigureTok/drawStandee inside drawPlayer, skipped in 193's mirror). G5 SPECKS/DASHED RING/DARK RING: `cl398` cleans each bases-off beast cell once (wraps 334 `g6Proc`, 346 `b103Wall`/`b103Proc`): a 3×3 opening in the base's rim band, then small pieces in the footprint (< 6 % of the figure) or band pieces (< 15 %, ≥ 70 % in the band) cleared, then faint orphans. Moechus re-rendered grey (tools/plans/look100/beast5_rig.js fur #8c8884; his baked shadow sheets kept). G4a: `mw105ResTag` wrapper — the fought bout's right box shows our fighter(s): gArt face, name, Won / Lost / Fell, purse (319 house101.by); none of ours → the winner's face + "Won the bout" (`.mw398`, `.mw398x` = fell).
- **397-v106b1** (v1.06 beta-1 G1–G3): an AWAY Match Week before Set off plays no bout (`bt106Locked` = 389 `sq105Locked`; runBoutSim / watchBout / boutCfg refuse, Watch / Simulate / Fight / Simulate the rest / End the week show "🔒 Set off first"; 360 calls it ahead of its auto set-off; entering stays allowed). City Square: speed control removed (25-city), sign plates sized by ink width and shrunk for long names (`lab106W`, used by 172), soft dark edge fade baked into the fg layer (wraps `bake89`). Kill switch `flavius_v106b1off=1`. Test tv106e.
- **400-v107tok** (board, v1.07 OLD TOKEN PIECES RETIRED, his t1a–t5a 2026-10-19; kill switch `flavius_v107tokoff=1`; test tv107a; art tools/art/still107/make.py): REPLACES the v0.72 "3D minis" style (94), v0.75 minis-for-standees (106) and the Figures / Standees / Cylinders styles. `SETTINGS.tokenStyle` is a getter = 'figure' and `mini3d` = false (`st107Pin`, re-put by every applySettings) → every piece goes through drawFigureTok (311 / 312's 3D). The token-style rows leave settingsHTML('tokens') (Armor rows stay) and set98Pieces loses the "Gladiators & beasts" card. ONE STILL FRAME when 3D can't show: `an100DrawP` wrapped → `st107DrawP` draws the idle cell of `assets/still107_<cls>.webp` (the idle row of anim100_<cls>_move, ANIM100_META anchors) through 311's an100Cell (a fake source `ST107_SRC`); a 222 t93 picture keeps its own frame; custom / online → the class (or base class) still; two lost limbs too. Beasts: outer drawFigureTok / drawZoraMini wrapper (`st107Piece`) draws `still107_b_<key>.webp` (beast100 idle0, BEAST100_META iw, 312's bst100CellCanvas) whenever 312 won't. Off the board: figureHTML (spec → class by identity / TOKEN_DEF / TOKEN_OVR JSON, `st107KeyOfSpec`), clsPieceHTML, npcPieceHTML, onlFig (no 226 picture) → `st107HTML` = `assets/still107f_<k>.webp` (front, trimmed; `ST107.F` sizes); MINI_URL → the fronts; `st107Mini(k)` used by 298 / 299 / 301 / 129 (direct edits). minis8_* only in Credits → Prototype ("The tabletop minis", protoHTML wrapper); 102's mini8Img → null. mkshare inlines still107* (~0.35 MB).
- **402-v107city** (src/city/; v1.07 beta-1 note 1, his 2026-10-19: the City Square walkers + the main menu show in 3D; kill switch `flavius_v107cityoff=1` or 400's `flavius_v107tokoff=1`; test tv107c; art `node tools/art/anim100/make.js city` → `assets/city107_<cls>.webp` + `CITY107_META`): CITY — `cityImg` wrapped (outermost): 'fg…' gladiators / guards and the yard pair 'ydhero'/'ydsoldier' → `c107Glad` = a cached canvas of 172's figure box from the city107 sheet (idle + 8-frame walk × 8 MINI_YAW facings, lit by 399's sun, NO base; walk frames while gliding, facing by 102 miniFace's rule `c107Face`, idle under city100Calm), else 400's still107 cell, else today's; Studio characters → their 222 tok93 sheet (`c107Custom`) else the base class. REPLACES 313's crowd100_c_<class> stand-ins (gladiators + guards) and 320's v101cYard pair; townsfolk / your lanista / the doctore stay 313/320's crowd looks. Beasts to the pens: a cityLoop wrapper spawns only lion / bear / wolf / viper (`C107_BEAST`, 172's rhythm + log line) drawn from 282's base-less MM100 strips (`c107Beast`, mirrored walking left). Placeholders in CITY.imgs (no svg built), 279's warm-up counts the sheets (`city100Imgs`). MENU — `mmFig` wrapped: the figure's MM100 strip (idle cell; Zora = mmEagle), while decoding its contact shadow, after a failed strip the still107f front; `mmLoop` + `tokenImg` wrapped so 08's flat-show Commodus is his strip in the token frame (`mm107Frame`). `V107C.st` counts. mkshare inlines city107_*.
- **401-v107perf** (board, v1.07 FRAME RATE, his beta-1 note 2; kill switch `flavius_v107perfoff=1`; test tv107p; tools/plans/v107/PERF.md; bench tools/bench/live.js + livesum.js + shots107.js, board.js `--ablate`): DISPLAY ONLY. P1 311's `an100Bm` rows cut from the sheet's fetched bytes (`p107Blob`, `createImageBitmap(Blob, rect)` = worker decode; an `<img>` source decoded the whole sheet on the main thread, 100–150 ms a call); file:// / fetch failure → 311's path; `an100Trim` drops the bytes. P2 399's static shadow layer (`l106DrawStatic`, split out of l106Pass; the layer keeps `rects` + `ds`) drawn 1:1 on device pixels in 128² pieces that hold pixels (`p107Chunks`); the highlight lift clip (`p107Lift`) cut to the pieces / figure shadows (`l106DrawFigs`) touching a highlighted tile instead of 399's whole-canvas evenodd mask; a layer built mid-zoom is rebuilt once the zoom holds. P3 `HTMLCanvasElement.getContext` gets `{willReadFrequently:true}` inside an100CellCanvas / bst100CellCanvas / g6Scaled / b103Scaled (only when 346 will sharpen: up > V103C.sharpMin), bs101Proc mode 2, g6Proc / b103Proc / b103Wall, aim106Outline (no GPU read-back stall). P4 227's #fx95 overlay: a full clear of an already blank overlay is skipped (`P107.st.fxSkip`). P5 312's `bst100Live` reads `cv.offsetParent` once per animation frame. Stats `P107.st`.
- **404-v107corpse** (board, v1.07 beta-2 note 3, his 2026-10-19: corpses are the 3D figure, never the old minis tipped over; kill switch `flavius_v107corpseoff=1`; test tv107g): REPLACES 07's `drawCorpseFig` picture (v0.33 token on its side) for the printed classes + system beasts. DISPLAY ONLY. Beasts: the last frame of 312's die row (`die4`, `bst100Cell`, the facing it fell — 312's ghost face / miniFace at death), held back while 312's ghost plays. Gladiators: 321's CORPSE101 keeps its fall frame; any other corpse pile (no ghost: Animations Off / To the end, resumed match) = the last frame of 311's fall row (`an100Cell`, one lost limb = its severed set). Fallback (standalone, no sheet, load failed, two limbs): a lying pose built ONCE from 400's still107 sheets (`cv107Lie`, LRU 64: upright figures laid on their side across a flat-painted base, four-legged beasts pressed low seen side-on, drained colour baked in). Contact disc via `fl104Sh` (399). Same place/layer as 07 ('decals'); custom Studio beasts / boar / croc keep today's picture. Beta 4 (his note: a bear corpse 2–3 tiles big — not reproducible in Chromium, where every corpse draws at the living scale; he plays on Safari): `cv107Sane` compares the die4 cut with the idle cut once per (beast, facing) and `cv107Size`/`cv107Check` measure the drawn die / fall frame each frame against the living scale (±15–18 %); a mismatch → the lying still for that kind (`CV107.bad`, stats `insane`/`bad`, console warning).
- **403-v107fix** (board, v1.07 beta-2 fixes, his notes 1 + 2 2026-10-19; kill switch `flavius_v107fixoff=1`; test tv107f): DISPLAY ONLY. F1 the aim outline (396 `aim106Outline` replaced) is built from the VISIBLE body (alpha ≥ `F107.cut` 128, not every rim pixel of the soft 3D cells), `F107.w` 1.5 CSS px wide at any zoom/DPR (16 + 8 taps), the soft rim punched twice so the ink shows — it hugs the figure instead of a halo 2 px beyond the faintest rim. F2 `body.modal-open` (overflow hidden) no longer removes a real page scrollbar: while it is on and the page is taller than the window, `html.sg107{scrollbar-gutter:stable}` (MutationObserver on body's class) — the board column keeps its width, so no ResizeObserver rebuild of every size-keyed layer on each window open/close (was 2 rebuilds per "Raise the shield?" ask, 133–415 ms frames). Headless browsers hide scrollbars — tv107f launches without `--hide-scrollbars`. F3 (beta 4): 396's `aim106Rec` replaced — the target's NATIVE draw calls are recorded (`BS101.nat` tapped while the figure draws; 396's record when no 321 patch is in place), because with bases off 321's `bs101Patch` swaps in the base-less cell and draws it T·ppm lower than the call 396 saw (the ring floated above the figure and took the cut base in).
- **405-v107perf2** (board, v1.07 beta-3 note 4, his 2026-10-19: Hand to CPU + CPU speed Fast → 0–10 fps on his GPU laptop; kill switch `flavius_v107perf2off=1`; test tv107r; tools/plans/v107/PERF.md "beta 3"; bench tools/bench/rec107.js + gpu107.js, live.js `--gpu --speed fast --rb --decodes`): DISPLAY ONLY. Q1 268's face→JPEG step (`r99Step` replaced) draws on a `{willReadFrequently:true}` canvas — toBlob of a GPU canvas was a synchronous GPU read-back that waited for every queued board frame. Q2 312's `bst100Live` "board shown" from a ResizeObserver on #cv (`P107B.vis`), no `offsetParent` forced layout. Q3 THE RECORDER in 288's frame meter: `⏺ 10 s` (`REC107`, `rec107Start/Stop`) times areas (draw = `drawLayers93`, render, light, cells, clean, faces, save, ai, aim, log, audio, stands, bus) with wrappers put in at the start and taken out at the end (zero cost off), counts new canvases / canvas resizes / getImageData / toBlob / toDataURL / createImageBitmap / image loads with who asked, long tasks (with the areas inside them) + long animation frames (scripts), slow frames, layers, zoom, DPR, lighting, speed, UA, GPU renderer; downloads `flavius-perf-<date>-<time>.json` + one line in the meter. Q4 230's `p95Patch` replaced: the live panels stay in the page (id parked, the twin written in a hidden `#p107hold` first in <body>), so a render no longer re-lays-out / repaints six whole panels (`P107B.hold=false` = 230's swap).
- **406-v107safari** (board, v1.07 beta 4: his two Safari recorder reports, Safari 26.6 / macOS / DPR 2: paused 5 fps, Slow 4.5 fps with our JS 2–5 ms a frame; the same Mac in Chrome is fine; kill switch `flavius_v107safarioff=1`; `flavius_v107safariforce=1` = the WebKit path in any browser; test tv107s; tools/plans/v107/PERF.md "beta 4"; bench tools/bench/webkit.js + manual workflow .github/workflows/webkit-bench.yml): DISPLAY ONLY. W1 WebKit only: the page's `window.devicePixelRatio` is capped (`W1.cap` 1.5; once to 1 when the drawn frames' median stays > 45 ms; `flavius_v107dpr` = a fixed cap, 2 = none) — Safari rasterises the 2D canvas with CoreGraphics on the CPU, so the board's cost follows its device pixels. W2 all browsers: 29's `drawSugTile` (wrapped outermost, over 359) draws the Guide's gold ring still (its middle size) and cancels `GUIDE.raf` (it redrew the whole board every animation frame while a suggestion stood); the pulse is `#sug107`, a body-level ring animated by CSS transform/opacity, shown only when nothing stands on the tile (hidden: Reduce motion, Animations Off, a window/menu up). W3 WebKit only (`#perf=v107bmall` elsewhere): an in-memory (`willReadFrequently`) canvas drawn by the board twice unchanged is copied once to an ImageBitmap (`createImageBitmap`) that the board draws instead; any change (its context's draw calls, a width/height set) drops the copy; copies unused for 600 draws are closed. The board's drawImage hook sits on `CanvasRenderingContext2D.prototype` (`this===ctx`) because 321's `bs101Patch` replaces any instance wrapper. W4 the 405 recorder: `rec107Where` reads Safari stacks, counts `draw()` callers, and `rec107Extra()` (spread into the report by 405's `rec107Stop`) adds `switches`, `page` {dprReal, dprUsed, canvases > 256 px, cssAnims + names, boardDraws, drawsPerFrame, drawnPerFrame, drawnKinds per board draw, tw, boardSizes, sugTile} and `p107s`. 00b-perf (top): `#perf=a,b,key:value` in the page address = localStorage `flavius_<a>`='1' / `flavius_<key>`=value for that load only (`PERF_SW`); pseudo-switch `animoff` = Animations Off for the load.

- **407-v108proto** — RETIRED in v1.08 (the mock-up prototype; removed from build.sh, file deleted): made real as 409-v108light below, without its runtime metal pass (his 7a: a sheet re-bake, its own release v1.08b).
- **409-v108light** (board, v1.08 NIGHT TORCHES + SAND GRAIN / PLANKS / JUG GLINT + WALL/STANDS DEPTH, his answers 1a–8a 2026-10-20, tools/plans/v108/MOCKUP.md; ON by default; kill switches `flavius_v108torchoff=1`, `flavius_v108matoff=1`, `flavius_v108depthoff=1`; test tv108l): DISPLAY ONLY (no S / rand() / log / save / onlHash; flicker = performance.now). Follows 399's Lighting: Off (or `flavius_light106off`) = none of it; Light (phones' default, Full after the auto-drop) = pools + flames + the baked look, no torch shadows; Full = all (`v108Item`, `l106Mode`). Night = 189 `night91On`. TORCH: pools baked into 189's grade (`night91Bake` wrapper: destination-out .72 + warm .2 round each rim light, moonMid lift), 189's live pools/lights replaced in a `night91Sand` wrapper by small breathing pools + the same fires (`v108DrawTorches`, still under Reduce motion / Animations Off / Light board via `night91Flick`; `V108.lastF` = the flame factors); torch shadows (Full): the two strongest rim lights re-aim 399's baked sun shadow per piece (`v108Near`/`v108M`) — figures + beasts in an `l106DrawFigs` wrapper, pillars/jugs/chest merged into a copy of 399's static layer (`v108TorchLayer`) built IN PIECES (F2: ops into a half-resolution scratch canvas, then ≤ `V108K.tlPx` device px merged a frame, each part rasterised in its frame by a 1-px `createImageBitmap` snapshot, never while the zoom eases — the previous layer with the same pieces is drawn scaled meanwhile). MAT: sand grain (not on the Naumachia), bench planks/joints/nosing, jug glaze glint (`drawPot` wrapper). DEPTH: AO at the sand's edges and the treads' backs, lit far-wall cap, darker far stands. Baked into 192's LIGHT layer by day (`ar91LightPaint` wrapper, straight) and 189's grade by night. F1: while the view moves (TW/OX/OY changed within `V108K.settleMs` 160 ms, `v108Moving`) the last sharp night grade is laid in scaled over 189's fresh one (clipped 'copy'), then one sharp re-bake (`v108Settle`). A change of the gates (`v108Sig`) bumps AR91.ver + 189's key. Bench: `V108.set(on)`, `V108.ab`, `V108.noKick`, `V108.benchSync`; stats `V108.st` (frameMax, tlStepMax, nightReuse…), `V108.tlLog`; tools/bench/v108ab.js, v108shots.js (variants = kill-switch sets).
- **408-v108sfx** (audio, v1.08a RECORDED SOUND EFFECTS, his ask + picks 2026-10-20, tools/plans/v108a/NOTES.md; kill switch `flavius_sfx108off=1`; test tsfx108): SOUND ONLY. 25 mp3s `assets/sfx108_<key>.mp3` (≈0.49 MB, flat in assets/ because mkshare inlines files, not folders; CC0 / CC BY 4.0, listed in Credits → Sound effects via a `creditsHTML` wrapper) replace only the synth voice inside 314's `snd100Fire` routing (wrapped to capture `base`; `SND100_K[kind]` entries wrapped): trims, Effects slider, mute, fold window, fanfare family, Fast / To-the-end gating and ducking unchanged; no buffer → the synth. Kinds: hit, bighit, block, whoosh, death, spear, net, netwrap, scrape, crash, step, cheer, rise, horn, fanfare, titulus, medal; growl / bark by beast voice (lion, bear, wolf, snake, zora → eagle, tholo / commodus → grunt, other → beast; bark = the first 0.45 of the sample). NEW kind `axe`: an Axe thrown (`doAttack` wrapper, `src.thr` + `w.key==='axe'`; only the axe). Levels matched at load to sound100/after.txt (`SFX108_DB`) with a peak ceiling; ±3 % rate jitter on hit / step / block (Math.random). Lazy load after the AudioContext exists (3 at a time, fetch + decodeAudioData; file:// loads only from ASSET_DATA). `SFX108.log` / `.buf` / `.fail` for tests.
- **410-v108x2** (board, v1.08b ONE FIGURE RE-BAKE: METAL + 2× SHEETS FOR BIG SCREENS, his 1b 2a 3a + 7a, tools/plans/v108b/NOTES.md; kill switch `flavius_x2off=1` = always 1×, `flavius_x2force=1` = 2× anywhere; test tv108x): DISPLAY ONLY. The bake: `node tools/art/anim100/make.js x2` (+ `x2 sev`) renders every printed class sheet ONCE at 5.2 px/mm lit by 399's sun with 311's new METAL material (`AN100L.metal` inside `AN100L.light`: gear by colour — cool low-saturation grey = steel, bright orange-yellow = bronze/gold; the body's skin / cloth / leather never — a tight hard highlight from directionalLights[0], the lit colour clamped then darkened + tinted, a thin sun-side rim; ANIM100_LIB VER 6 so device caches re-render), `tools/art/anim100/x2enc.py` repacks it (a 2× cell = exactly 2 × the 1× cell) and box-filters the 1× sheet out of it → `assets/anim100x2_*.webp` + `assets/anim100_*.webp` (names unchanged), ANIM100_META in 1× units with `x2:1`. Beasts: `node tools/art/anim100b/make.js x2` (the look files' pxk 2) → `assets/beast100x2_*.webp` + BEAST100X2_META here. Shadow sheets anim106* stay 1×; stills re-cut (tools/art/still107/make.py). Loader: `x108Want()` once a visit — http(s) only (not file:// / the download), not a phone (399 l106Phone), innerWidth ≥ 900, deviceMemory not ≤ 4, real DPR × drawn scale × zoom 2 ≥ 1.15; 311's an100Sheet asks for the 2× file, an error → 1×; 311 / 401 cut each action's rows at k× (off-thread, lazy as before), a 2× decode failure → `an100X2Fail` back to 1×; 311's an100Cell cuts k× and draws the same on-screen size. Beasts: 312's bst100Img loads the 2× pair and swaps BEAST100_META[k] to the 2× meta for the visit (sizes come from bst100Scale·px), a failure restores 1×; bases off (bs101Mode 2) → that beast wears 1× (334/346 base cut-outs are tuned on 1×); 400's still / 404's lying still read the 1× meta (BST108X1). mkshare skips anim100x2_* / beast100x2_*. Studio / online device bakes stay 1×.
- **411-v109wqproto** (manager, v1.09 WINTER QUARTERS MOCK-UP, his N4 o1a o2a + w1a–w5a, tools/plans/v109/MOCKUP.md; OFF unless `flavius_v109wq=1`; no test — a prototype): DISPLAY ONLY, never writes the world/Store/saves (every action button is blocked with a "Mock-up — not live yet" toast). In the off-season week (348 OFF104.active) the Match Week tab reads "❄ Winter Quarters" and its pane is a stepper of rooms (WQ109.step 0–11 + 'hall'): overview · 1 Awards night · 2 Quaestor's accounts (47's Ledger lines recomputed read-only) · 3 Council review · 4 Renown & perks (150 perkTree87 reused) · 5 Facilities (23 facilitiesHTML reused) · 6 Personnel (348 P.ren + 386 ren105Line, rudis) · 7 Winter market · 8 Winter camp · 9 THE WINTER CLASSIC (seeds = 348 P.seeds, drawn with 355's v104 tree classes; mock results; the Cup in the Hall) · ✦ Saturnalia (FEST_KINDS.saturnalia) · 10 Next season. Mock spots listed in MOCKUP.md. To be retired when v1.09 is built.
- **v1.08c builder B tools** (tools, no game module; his 2a 6a, tools/plans/v108c/NOTES.md items 2 5 6): tools/i18n/wrap.js skip rules (Error/throw, console + concatenation, shader / font / selector / open-tag fragments, DATA_TABLES + DEV_LITERALS, i18n:skip-begin/end blocks; test ti18nwrap); LETTER VERSIONS in 54-v51 (GAME_VER numeric for saves, GAME_VERL with the letter for What's new 115, the menu version button, error report 216, recorder 405, update notice 109 verOffer76; verParse/verCmp order 1.08 < 1.08a < 1.08b < 1.09 < 1.10; test tupd76); BAKE CHECK tools/art/bakecheck.js + make.js --check + BAKE_VERSIONS.json (docs/testing.md); l106.js shadowCell sizes both canvas sides.
- **412-v108cread** (board, v1.08c item 0b, his 7a, tools/plans/v108c/NOTES.md; kill switch `flavius_rb108off=1`, `flavius_rb108force=1` = on in any browser; test tv108c): DISPLAY ONLY, WebKit path only (406 `P107S.webkit`). 321's bases-off clean-up (`bs101Proc` → `bs101Off`, a getImageData = ≈28 ms a call on Safari) runs in a Worker on an OffscreenCanvas with 321's own `bs101Off` source: a new cell is sent with `createImageBitmap` (no read-back), the pixels come back into `BS101.cache` under 321's key (byte-identical to the sync path); meanwhile (1–3 frames) the figure's last base-less cell drawn within 0.35 tile is shown, re-anchored and scaled; a figure's first base-less cell, file://, no Worker / OffscreenCanvas 2D / createImageBitmap, a non-integer source rect, > 24 in flight → 321's sync path. `RB108.st`; the ⏺ recorder report carries `rb108` and (405) times createImageBitmap's sync part. Tools: tools/bench/readback.js (read-backs by caller), tools/bench/dprdrop.js (406 W1 drop vs cached sizes); docs/render-caches.md (cache map + v1.10 proposal).
- **411-v109wqproto** — RETIRED in v1.09 (the Winter Quarters mock-up; removed from build.sh, file deleted): its markup/CSS live on in 412-v109wq.
- **413-v109wq** (manager, v1.09 WINTER QUARTERS — the shell + rooms 1 Awards night, 2 The Quaestor's accounts, 6 Personnel, 10 Next season; his W1a–W21a, tools/plans/v109/NOTES.md + MOCKUP.md; kill switch `flavius_v109wqoff=1` = the old off-season page, letters, confirm and no ledger; test tv109w): in the off-season week (348 OFF104.active) the Match Week tab reads "❄ Winter Quarters" (mgrHTML wrapper replaces #mgrPane): stepper (❄ overview + the rooms that exist; any order; ✓ = awards visited / Ledger sealed / Personnel visited with no open ask) + slim banner + room + Back/Next/▶ Begin. REPLACES 348 po104OffHTML (380's pendingHTML kept on top), the off-season End-the-week confirm (rail endask → room 10; Begin = 229 weekEndGo95), 22's Awards screen in the off-season (awards tab → room 1, marks w.awardShow seen), 355 B21/B23 off-season extras, 47's Ledger letter (sealed in room 2), 348's "contract asks wait" news, 349's farewell letters (c104ret-* → room 6), 88 weekChecklist's contract item that week (→ room items); ONE letter `wq109-<s>` "Winter Quarters are open"; po104RevHTML's letter button says Winter Quarters. MONEY LEDGER `w.led109` {s,c0,c:{cat:{i,o}},part,wk0} (+ `w.led109h` last 2): an accessor on the player's mgr.coin books every change by the stack's function name (LED109_FN), lines inside endWeek/applyBout wrappers found by text and calibrated to document lines (LED109_LN, LED109_CAL), else the clicked data-mg (LED109_ACT), else Senate & other; categories wages · purses · bets · sales · loans · travel · repairs · recruiting · facilities · senate; SAVE_MIGRATIONS '1.09' (old worlds part:1, "itemised from week N"). LEDGER SEAL: wqQ builds w.qsDue exactly like 47 qsClose (+51 rich), quaestorLedger called once on ✍ Seal (or by Begin); a qsClose wrapper drops the sealed season's second qsDue (w.qs.wq109paid) while 185's league prize and 256's records still run at the week's end. State `w.wq109` {s,step,v,sealed}. Rudis asks untouched (380 rudis105Window; v1.09c).
- **414-v109a** (manager, v1.09a WINTER QUARTERS — the house rooms; his W9a W10a W11c W12a W13a W14a, tools/plans/v109/NOTES.md + MOCKUP.md; kill switch `flavius_v109aoff=1` = v1.09's five steps; test tv109a): registers rooms in 413's hook (`WQ_X.rooms/sum`, `WQ_K` spliced to over · awards · books · council · renown · fac · staff · market · camp · next; 413's `wqBan` takes a room key; `WQ_FN.next` wrapped for the goals), `wqDone` wrapper for the ✓s. 3 COUNCIL: six advisors (face83, ★ level, a one-line report from adv98S / table / roster, 256 adv98Req progress); ONE free ⬆ Promote a winter (`a109Promote`, levels 3–5, record met — 349's "next season" row ignored, `w.wq109a.promo`; an `adv104Rose` wrapper makes it that advisor's rise for the next season); `adv98Check` returns false in the off-season week and its end (A109.end); 349's retired-great letters `c104adv-*` removed, answered in the room with 349's `[data-c104adv]` buttons. 4 RENOWN: `perkTree87()` as is. 5 FACILITIES: 333 `lu102FacHTML`'s `.lu102fb` (351 bp104 tiles, data-mg build) inline + a "❄ Winter works" line; `facBuild` wrapper in the winter sets bp104 n=1 (every house; ready at week 1), `ludusClick` build wrapper words it; `m.facWk` cleared when the off-season opens. 7 MARKET: `a109Gen(w)` 8–12 rookies aged 18–20 (genGlad with Math.random / RNG / Date.now / genName's taken set swapped for a hash stream of world id + season → same world, same intake; `g.wq109a`), rows with rec98Ovr grade / OVR, askWage, the ★ pick (recFit ✓ then rec98Ovr), `[data-wq109a="rec|id|1/3"]` → Recruiting card step Scout / Offer; `recruiter84` returns null in that week and its letter `rec84-<s-w>` is removed at the opening. 8 CAMP: `A109_CAMP` str (str+spd, rested) · wpn (str+int) · mend (rested, +5 morale) · bond (+4 morale, +4 loyB); gain = TH_DRILL × (1 + y92Bonus(council Doctore lv)) × Y92_MUL.std (≈0.40–0.47); fit = alive and not hurt; once (`w.wq109a.camp`), only after 349's turn (w.c104s), unheld → run at the off-season's endWeek with the chosen focus; that endWeek's 373 team drill is skipped (thResolve wrapper); the room shows the turn (`w.wq109a.turn` OVR before → after, snapshot around po104OffStart) then the gains. 10 GOALS: `w.gl109a` {s, list [{k top|wins|grow|tiro, t, ren 20/15/20/20}], w0, o0, paid} made when Winter Quarters opens (`a109GoalsMake`: top max(3, pos−2) ≤ 12, wins last season +1 (3–20), +4 OVR if a fighter ≤ 22 else a tiro ≤ 20 wins a bout); counting starts at week 1 (w0 wins, o0 OVRs); paid before the next season turn (po104OffStart pre) as Renown source `goal` "Consilium goals" (REN105.lab), news line, `w.gl109aLast`; progress line `[data-wq109agl]` on the council card. State `w.wq109a` {s, promo, camp, focus, works, intake, turn}; no migration (`a109Ensure` on draw fills an old mid-winter save).
- **415-v109b** (manager, v1.09b THE WINTER CLASSIC — his W3a W5a W6a W15a W16a W17a W18a W20a W21a, W1a confirmed 2026-10-22; tools/plans/v109/NOTES.md + MOCKUP.md room 9; kill switch `flavius_v109boff=1` = v1.09a, no room 9, Begin free; test tv109b): room `classic` spliced into 413's `WQ_K` before `next` (`WQ_X.rooms/sum.classic`, `WQ_FN.classic=wc109Room`, `wqDone` ✓ = answered): 4 rule chips, prize line, seed, fighter picker `[data-wc109pick]` + `[data-wc109="in"|"out"]`, bracket in 355's tree CSS (`.wc109bk .v104g`, `[data-wc109seat]`, `.wc109tag.wild/.inv`), the day's bout cards `.wc109bt[data-wc109bout]` with 17's own `data-mg` watch/fight/sim/bet (stake `#mgStake<bi>`), `[data-wc109="day"]` simulate the day, `[data-wc109="final"]`, `[data-wc109="view|br|hall"]`. STATE `w.wc109` {s, seeds (348 P.seeds, Sica out), out (W16a `wc109Out`: best fighter hurt or coin < max(60, 2 weeks' wages) → hashStr(world+season+house)%100<50, at most 3, fixed when WQ opens), st null|in|out|none, pick, seats[{k,i,kind house|wild|inv,was,gid}] (`wc109Seats`: empty seats in seed order → Sica's wildcard first = that seed, W3a; then invited free agents), d{1,2,3:[{ix,adv,pl}]}, fin (4 seat indices), champ, champG, paid}; `w.wc109h` plates [{s,n,k,lud,gid,gn,mine}]; `w.wc109rep`. BOUTS tier `TIERS.wc109` in w.night.bouts of the off-season week (`b.wc109` {s,d,i,ix,k}): Day I = seeds 5·8·9·12 / 6·7·10·11 (Cassian, top 2 on), Day II = 1·4 + A / 2·3 + B, their top 2s = four finalists; `wcSettle` advances; DAY III PROVISIONAL `wc109Final(w,C)` = one simulated 4-fighter Democritus via 17 runBoutSim (v1.09c replaces this ONE function with the Saturnalia). CLEMENCY: leagueFate → clemency verdict for wc109; applyBout wrapper restores each entrant's rec/ss/recent/inj/severed/streak87 and each house's bouts/wins/spS (no wounds, free regrowth, no records), the 1-coin purse share back; leaguePtsAfterBout skipped; boutRiggable false; renown105 muted inside the bout. W5a: `weekReady` not ok until answered (undone wc109 bouts count as done), `wqBegin` sends you to room 9; endWeek wrapper `wc109Finish` sims what is left (unanswered = sat out, `C.auto`). PRIZES `wcPay`/`wc109Pay`: +60 coin (ledger 'purses'), +5 morale/+5 loyB for the house, +20 Renown (REN105 'wc109' "Winter Classic"), a plate; 3 player wins → `earnTrophy('wc109rep')` (TROPHY_LIB "The Winter Classic Replica", cat special; `tit100Mgr` progress n/3). Tituli: `wd100TrophyView` wrapper puts `.wc109tit` (plinth `wc109HallHTML`: cup, holder, plates I–VI, replica pips) under the tools row of the Manager tab. 413's letter gets a Classic line; overview text, room 10 notes and the checklist get the Classic. Test hooks `window.WC109T`, `wc109Answer`, `wc109Ensure`, `wc109Out`, `wc109Finish`.
- **416-v109c** (manager, v1.09c THE SATURNALIA — his W1a W2a W4a; tools/plans/v109/NOTES.md + MOCKUP.md ✦ row; kill switch `flavius_v109coff=1` = v1.09b: 415's provisional one-bout Day III, rudis asks when the off-season opens; test tv109c): Day III = 10-meta's festival for the four finalists as two wc109 bouts in w.night.bouts (`b.wc109.fs` 1 race / 2 Democritus; `C.d[3]` = [festival finish, race, Democritus]), played by 17's runBoutSim / watchBout / applyBout (415's clemency, no records/points/Renown). `boutCfg` wrapper: stage 1 = startFestival's config (ev chariot, loc 7, `chPvp:false`, `fest {kind:'saturnalia',sr:'democritus',stage:1,wc109:{s,bi}}` → 05-flow runs `runCarmina` as the ceremony, W2a); stage 2 = continueFestival's (carried CF/coin + the boon, race order, loc 6) from `C.fest` {carry[{gid,cf,coin}], oid, oidG, gids}, captured by a `gameOver` wrapper that CALLS `continueFestival(rows)` with startEvent/log held (`V109C.cap` → applyBout). Live: "Continue the festival" → `watchBout(stage 2)`. The Cup = gameOver's festival-champion rule (highest final CF of the last event) → 415 `WC109T.settle` with the festival standings (415's own settle is held for stage 2), prizes/plate unchanged. `window.wc109Final` = `satFinal` (415 now calls it through window: ⚡ `[data-wc109="final"]`, wc109Finish at Begin/endWeek). Play Now: `recordEvent` / `updateCrowdAfterEvent` / `logCustomChars` skip any fest with `.wc109`. W4a: `rudis105Window` closed in WQ until `C.champ`; `satAsks` (`window.wc109Asks`) makes 380's asks once (`C.rud`), one news line; the pending box moves into room 10 (`[data-sat109rud]`) and leaves other rooms when it holds only freedom asks; `wqBegin` wrapper finishes the Saturnalia first and stops in room 10 if asks appear (380: verdicts block the week's end); endWeek wrapper finishes + asks. Room 9: tree's final column "✦ Saturnalia", the Day III card `.sat109[data-sat109]` (events `[data-sat109ev]`, finalists `[data-sat109fin]` with race place / CF / finish, Watch / Fight / Simulate per event via data-mg). 415 edits: WC109T gains bout/s/m/cup/name; the two internal wc109Final calls go through window. A v1.09b save mid Day III drops the provisional bout.
- **417-v110auto** (board, v1.10 AUTO QUALITY + THE SAFARI FIXES — his 1a–6a, tools/plans/v110/NOTES.md, ROADMAP v1.10 B; kill switch `flavius_v110autooff=1` = v1.09c exactly; test tv110a): Settings → Board & pieces first card **Quality** Auto / High / Medium / Low (`SETTINGS.quality110`, default auto for everyone; `data-q110`), 399's Lighting row moved under it with a 4th button "By quality" (`data-light106="q"` = no override; an explicit `SETTINGS.light106` overrides the preset's lighting only); 399's own Lighting card removed. Presets: High = Lighting Full, 2× sheets where 410 allows, board DPR uncapped (WebKit 1.5 = `W1.cap`), full crowd · Medium = Light, 1×, DPR ≤ 1.5 (WebKit 1 = `W1.low`), crowd reacts only (CHEER92.p zeroed, STAND100.on off, `walkOK91` false) · Low = Off, 1×, DPR 1, still crowd (`cheer92OK` false). Phones DPR ≥ 3: board ≤ 2× ALWAYS, zoomed or not (follow-up 2a 2026-10-22, REPLACES 6a's "only when zoomed"). Follow-up 1a: on desktops Auto never goes below Medium (`q110MaxRung`; Low only when picked), phones keep the full ladder. Follow-up 3a: the v0.84 setting "Light board for older phones" (`data-lite84`, 138/160/246) is REPLACED by Quality — Low ⇒ `SETTINGS.lite84='on'`, High / Medium ⇒ 'off', Auto at rung 3 ⇒ 'on' (written in `q110Refresh`; modules still read `lite84On()`), control removed from Settings; migration `SETTINGS.q110v` 2: old lite84 'on' + no Quality chosen ⇒ Quality Low. AUTO = one ladder `Q110_R` (0 high · 1 high-light · 2 medium · 3 low): start from capability (`q110Cap`: phone → 1, deviceMemory ≤ 4 → 1 / ≤ 2 → 2, cores ≤ 2 off WebKit → 2, old `flavius_light106drop` → 1; headless → phone rule only), then rAF intervals after board draws (`q110Feed`, per-second buckets; `Q110K`: down when ≥ 60 % of ≥ 40 frames in 5 s are over 17.5 ms / 34 ms phone; up after 20 s of ≤ 10 % late, doubling per further drop at that boundary, never after 3; 10 s between steps; samples restart 4 s after a step); a step waits for a quiet frame (`q110Quiet`: no fxRAF / AN100.raf / zoom ease / walk-in, 250 ms without a draw) or `turn.begin`. 2× sheets: permitted at rung 0 (WebKit: after 30 s of on-time frames at rung 0, 4a), never revoked by Auto; loaded sheets swap at the next `event.start` (`q110Sheets`). Levers: own `window.devicePixelRatio` getter on every browser (406 W1's getter + drop rule retired: `W1.dropped=true`, `w1Real` = the real ratio; `flavius_v107dpr` still fixes WebKit), `l106Pref` wrapped (399's auto-drop off: `L106.noAuto`), `x108Want` wrapped (410's memory gate = an Auto input), `lite84On` keeps the pre-v1.10 ratio (`Q110.raw`; the on/off itself now follows Quality). 5a: `l106Build` gets a fresh layer canvas every build (kill `flavius_l106freshoff=1`). State `window.Q110` {mode, tier, n, rung, why, cap, steps, lv, x2ok}; 405's recorder report field `q110`; test hooks `Q110.feed/judge/commit/refresh`; runtime stepping off in HeadlessChrome unless `flavius_v110autorun=1`.
- **418-v110b** (board, v1.10a TWO VISUAL FIXES — owner screenshots, tools/plans/v110/NOTES.md; kill switch `flavius_v110boff=1` = v1.10 exactly; test tv110b): F1 Chariot Racing riders are the 3D figures — 311's `an100On()` refused Chariot Racing since v1.00, so `AN100.cur` stayed null and the rider fell to the old flat figure (07 drawFigureTok); 418 wraps `an100On` (yes in the chariot, same other gates) → 311 animated figure / 400's still, `chRideTok` draws the chtok disc at 0.98 tile (the mini's 0.8 base would hide the 0.86 disc; no newer chtok art exists, horse / wheel tokens untouched), `ST110.stats.riders`. F2 front-stand spectators cover their bench — 409's plank seams are baked in 192's LIGHT layer, laid source-atop over the crowd by night91Sand; the seams of the screen-front sections (`st110Front` = 193 nearSec91) are painted live by a wrapper on `ar91Deco` (after the benches, before the spectators; `st110Planks`) and 409's baked pass skips them (one direct edit); back stands keep the baked seams.
- **419-v111amph** (board, v1.11 art PREVIEW — THE AMPHITHEATRE, his concept 2026-10-22, decisions 11a–14a, tools/plans/v111/AMPH.md; **off by default**: `flavius_amph111=1` (read at load) installs it, otherwise nothing is wrapped or loaded): the baked 3D surround (tools/art/amph111: scene.js/props.js built in code, make.js renders it with three93 in SwiftShader at the game's exact 2:1 projection, tile corner (0,0) = (OX, OY), one tile = TW) painted first in 192's cached 'under' layer by an `ar91Under` wrapper, so the board, walls/plaques, inner stands, live spectators and Flavius's banner lie on top unchanged. Six layers assets/amph111_{stone,bench,cloth,fixed,fire,glow}.webp + a small 'front' mask (440 KB since pass 8, frame 2576×1624 at TW0 112, 11.5 TW either side of OX, 3.6 above / 10.9 below OY since pass 7; assets/amph111.json): stone/bench/cloth are luminance, tinted per arena (ar91Mat().cap, THEME.standB, THEMES99 blood) and ADDED with the fixed-colour layer + flames into one cached composite (`AMPH111.comp`, key = tints + scale; half size when TW·dpr < 80), then a recede vignette (desaturate + darken from 9 TW). Night: 189's grade darkens it; the glow layer (only the braziers' light) is added after the grade by a `night91Sand` wrapper, only its lit 16×10 cells (`amphCells`). Skipped: ludus, Light board / Quality Low, Lighting Off. PASS 7 (his front picture, 1a 2a 3a): the near sides are a carved façade under the stands (piers, plain arched doorways, eagle banners, potted cypress + ivy) and the grand stair with two pillars + their big braziers and two lions; nothing beyond (the game's background). The pillars/braziers stand in front of the game's stands corner: an `ar91DecoPaint` wrapper paints the composite again through the `front` mask (382×302 box) at the end of the cached 'deco' layer. PASS 8 final (his pick (c) + raised view 2026-10-22): the bottom corners and below the stair are ground only — paving + three steps down to street level fading into a dark warm haze (make.js --variant ground, the default; p7/city reproducible), the stair light = two small pools on its top steps. FRAMING: today's in every window (pass 7's tall-window canvas growth and flavius_amph111frameoff removed). Test tv111am.
- **419-v111gl** — REMOVED 2026-10-22 (his 1a: Safari no-go, see tools/plans/v111/GL-SPIKE.md; code kept at commit 4e155f2). Was: (board, v1.11 SPIKE — a WebGL board renderer, OPT-IN ONLY; his 1a 2a 3a 2026-10-22, tools/plans/v111/GL-SPIKE.md; on with localStorage `flavius_gl111=1` or `#perf=gl111`, `flavius_gl111lv=1` = planes only, `flavius_gl111v1=1` = WebGL1, `flavius_gl111keep=1` = preserveDrawingBuffer (debug); off = nothing installed; test tv111gl, bench tools/bench/gl111.js): wraps `drawLayers93` (outermost) + the board ctx's prototype `drawImage`; board-sized sources (192 AR91.L via 260 `z99Put` whole, 235 TILES96, 194 wear, 399/409 layers, the rim painted once per view into its own canvas) → PLANES on a WebGL canvas `#gl111p` under `#cv` (re-rendered only when a source revision / place changes); the 'pieces' layer's other drawImage → SPRITES on `#gl111s` over `#cv`, streamed in painter's order; everything else stays 2D on `#cv`. Content revision `__g111` on every 2D canvas made after it switches on (+ 406's `__v107`). Zoomed / Naumachia / Chariot boards draw 2D. 405's report gains `gl111:{on, ctx, drawsPerFrame, texUploadsPerS, msPerFrame, …}`. `GL111.set(on)` dev toggle.
- **420-v111safari** (board, v1.11 SAFARI 2D FIXES — his pick 2a 2026-10-22 after the GL spike; WebKit only (406 `P107S.webkit`, `flavius_v107safariforce=1` = any browser), never HEADLESS; kill switch `flavius_v111soff=1` / `#perf=v111soff` = v1.10 exactly (the recorder's v111 block reads on:false); `V111.live=false` = the old drawing for this load (bench/tests); bench tools/bench/safari111.js; test tv111s): **S1** a recorder engine `RG111` on `CanvasRenderingContext2D.prototype` (every method + property wrapped; acts only for `this===ctx` while a range records; other contexts' drawing calls bump a content version `__v111v`, canvas width/height `__v111w`, 2D contexts mapped in `RG111.ctxOf` by a getContext wrapper): inside a range the board's calls are recorded (tokens: method/prop id + args; canvases by id+version, bitmaps/images by id, gradients/patterns by what made them incl. CanvasPattern.setTransform) and state calls go to a 1×1 sink; at the end identical tokens → one blit of the cached canvas, else replay into the cache + blit (`rg111End`), then the end state carried to the board (`rg111Carry`, or `rg111Restate` when the range ends inside its own save levels). Flush (replay so far onto the board, rest live) on: the board read (#cv as a source / toDataURL / createImageBitmap, 235's tiles rebuild), getImageData / reset on the board, a used picture about to change, a nested draw(), an argument it cannot compare. Hysteresis `rg111Hist` (3 misses in 4 → live, doubling). Ranges (`S1_111`): **M** rim → the sky blit (rim, stands under/benches/texture/deco/418 planks, a still crowd, tiles, 192 top/light/sky); split when M keeps missing (a live crowd): **R1** rim → `ar91Deco` end, **R2** stands end → top blit; **D** floor start → `l106DrawStatic` end (floor marks, decals, wear ×2, chest, 399's static shadows); ends also at `ar91Flames`, walls/highlights/pieces. **S2** each `drawPot` jug as a sprite (device box, `S2_111.map` LRU 48, source-over only). **S3** `Z99.bmOn=false` (no 256² ImageBitmap pieces; `#perf=v111z99` keeps them). **S4** #fx95 `visibility:hidden` while 401 P4 says blank. **S5** `window.an111Yield` — 311 an100Pump's yields (small direct edit "v1.11 (420)") wait for a quiet board (no draw for 220 ms or the board not shown; ≤ 5 s). **S6** recorder: `v111` block (board/pot hit %, flushes, big blits + drawing calls saved per draw, bake waits) + areas sharpen / thin / cellmk. Canvases dropped after 600 unused draws.
- **423-v111csafari** (board, v1.11c SAFARI FOLLOW-UP — his first v1.11b Safari ⏺ zoomed 1.4: 420's caches never ran, sh103Sharpen ≈ 50 ms a call in every big slow frame, 24 aim read-backs / 10 s; WebKit only (406 `P107S.webkit`, `flavius_v107safariforce=1` = any browser), never HEADLESS; kill switch `flavius_v111csoff=1` / `#perf=v111csoff` = v1.11b exactly; `flavius_v111cbfoff=1` = zoomed moving frames live (A/B); bench `tools/bench/safari111.js --zoom 1.4 --only b,c`; test tv111c): DISPLAY ONLY. Z1 zoomed boards: 420's ranges (M / R1+R2 / D) run on zoomed entries swapped into `S1_111` for the draw (`S1Z_111C`), every call tokenised RELATIVE TO THE CAMERA (device coordinates through the call's transform minus the camera's whole-pixel offset; 260's screen-cut 1:1 blits = the whole picture at its place; gradients / patterns by where they land; a linear gradient by its place along its own line; 313/321's huge "all but the board" rects as one token). Camera HOLDING → 420's exact screen picture (every call incl. the strips replayed at the screen's place); camera MOVING → a board-frame picture (`E.cv`, window + `Z1_111C.margin` a side, stretched by `lead` × the last camera step) slid under the camera, the cut blits replayed whole; 419's Amphitheatre strips (screen-fixed) drawn live before it when nothing before them touches them and nothing after blends over them in another mode (device-box check), else live. Begins at `z99Rim` (or the stands / tiles layer when the rim is in 260's tiles cache); the sky (screen-fixed) ends M before it. Moving frames are within Skia's whole-pixel-slide wobble (tv111c: mean < 0.2, ≤ 0.05% px over 8, max ≤ 32; measured max 11–18 on a few edge pixels), holding frames ≤ 8 like tv111s. Z2 the jugs zoomed keyed by board place (their speckles are seeded by screen position in 192 drawPot, so they hit only while the camera holds). Z3 `sh103Maybe` → a Worker running 346's own `sh103Sharpen` source on an OffscreenCanvas (createImageBitmap in, pixels back, the same putImageData = the same pixels); 321's `BS101.cache`, 412's jobs and 396's outline sprites for that cell are dropped when the pixels land; no worker → the main thread sharpens only on a quiet board. Z4 `aim106Body` reads each image's source rect once into an alpha mask (keyed by 420's content version + `__sh111c`). Z5 the ⏺ recorder's `v111c` block (zoomed hit %, still / moving hits, builds, strips, jugs, sharpen jobs + `mainMs`, aim masks).
