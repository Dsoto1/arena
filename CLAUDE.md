# Flavius Rule Arena — handoff notes for Claude Code

A single-file HTML/JS/Canvas adaptation of **David's board game "Flavius Rule"** (gladiators in a 13×13 isometric
arena, Roman-themed). Current version: **v0.58**. Owner: David.

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
  assets/               23 image assets (armor2/chtok are .webp since v0.57) (arena.jpg card sheet, classes.jpg, weapons.jpg, armor2.png, avatar.png,
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
  `55-anim`, `56-v52`, `57-classes`, `58-looks`, `59-bye`, `60-v53`, `61-studio53`, `62-rules53`, `63-empire53`, `64-v54`,
  `65-stats55`, `66-mgr55`, `67-studio55`, `68-fix55`, `69-v56`, `70-v57`, `71-v58`.
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
- Full suite: `(nohup sh tools/runreg.sh >/dev/null 2>&1 &)` then watch `tools/reg.txt` for `ALLDONE` (~35 min).
  Pass = every block ends `exit=0` and prints `ERRS []`. Run a subset: `sh tools/runreg.sh tv53 tpia`. (v0.58: 120 blocks, ~90 min.)
- `t12` plays every event via sims (slow). Version tests: `tv50…tv54`-style files (`tv52`, `tv53`), plus feature tests
  (`tcls` classes, `tlook` accessories, `tbye` bye weeks, `temp53` closures, `t53s` studio, `tres` results,
  `tmgr54` manager, `tpia` piacula, `t54a` studio/event designer, `tv55` ratings/letters/loans/home/grades,
  `tstat55` Studio ratings and allies, `tv56` mail and ratings help, `tv57` the v0.57 batch, `tv58` ships/prototype).
- When a UI move breaks an old test intentionally, update the test (keep its intent).
- Visual checks: write a short Playwright script, screenshot, and look at it.

## 6. Release workflow
1. Bump the badge in `src/01-head.html` (`arena · vX.YY`) — this sets `GAME_VER`.
2. Add a `MILESTONES` entry at the top of `src/34-notes.js` (`hi` = new features, `fx` = fixes/changes; keep it short).
3. Add a `SAVE_MIGRATIONS` entry if world data changed shape.
4. `sh build.sh` → full regression → `python3 tools/mkshare.py X.YY` → smoke-test the share build.
5. Publish to the claude.ai artifact **https://claude.ai/artifact/8LU6eHbPpuznn64JeWZ6We** with the page and all 23
   assets (label "vX.YY"); check the live version with an Artifact read before publishing. Before publishing, review any new shared-Store writes and make
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
  sharper art from David's PDF scans (tools/mkscans.py): fates, chariot cards/tokens, armor, 8 new offering tokens.
  (Published as artifact Version 68.)
- **v0.58** 3x5 Naumachia ships in a pinwheel ring with the printed deck art; hull HP labels, names on hover; arena deck
  (480x704), event cards (480x692) and weapon cards (600x416) from scans; prototype gallery (D.Soto link); clearer
  invitational frequency wording.

## 8. Next steps / open items
- **Readability pass, phase 2+** (David chose "phased"): files 02–07 are done (Babel scope-safe parameter renames via
  `tools/rename.js`, then comments on every function with `TWEAK:` notes; verified with `tools/samecode.js`, which
  compares code ignoring comments/whitespace). Remaining: 08–64, file by file, regression after each. Rename only
  function parameters in the safe map unless verified; never change behaviour.
- Possibly offer: remove the 32 auto-generated Ludus recruits created by older builds (`recruit:true` in `gladiators`).
- Event Designer: a full step-by-step wizard was deferred (David chose the "Beasts hub + pieces" scope for v0.54).
- Play Now setup: the city/modifier header above the map could align exactly to the map width.
- Hot-seat LAN/Online lobbies are placeholders.
- Next (agreed): Sica's syndicate as its own league house (roster, enforcers, dirty tricks) — design with David first.
- Audio in the artifact-downloaded copy: v0.55 added Safari/iOS fixes; confirm with David which device/browser it was.
- Scans: David's original PDFs are not in the repo (uploads only). `pdfimages -png <pdf> <dir>/i` then
  `python3 tools/mkscans.py <root> [out]`; rtok.webp now has 5 rows (RTOK_ROWS).
- Arena deck scans: uploaded as arenacards1-3.pdf (thirds). mkscans `arena`/`events` sections map cells → scans (`ARENA_CARDS`,
  `EVENT_CARDS`); no scan for Forge +3 AP (26, 70) or Floor Spikes (46); the Orpheus event scan is a different print (kept).
  Drive connector caps downloads at 10 MB, and drive.google.com is blocked — ask for uploads or <10 MB parts.
- **Queued for the next batch:** repaint 5 event cards in events.jpg to match the rulebook (the game already follows it):
  Triumviratus (FFA Royale, ends at 1st elimination → highest CF; CF+CA ticked), Familia (CF/CA crossed), Chariot (CF
  crossed), Naumachia (PvE crossed), Ludus (R1 ends at 10x turn rotations, CF ticked). Ludus rulebook: CF ties favor the
  elder (age) — the game breaks ties by seat order; ask David how to map it.
- **Queued for the next batch — Naumachia to the rulebook (pp.48-49):** layout = TL horizontal, TR vertical, BR horizontal,
  BL vertical (mirror of the v0.58 pinwheel); boarding from water only via valid boarding tiles (3 along each long side's
  middle + 1 off each end; corners invalid), 2 MV, door→ship free; the 4 cut-corner ship tiles are invalid in the rulebook
  (game: all 15 deck — confirm); 16 water tokens in a fixed cross on row/col 6; a boarding visual; swimmers drawn
  half-submerged; team turns are simultaneous in the book (game: team members back to back); first team = oldest (no ages).
- Keep watching: shared-Store writes on load (conversions must be idempotent and saved once).
