# Hot seat — review (2026-10-03) and the agreed next batch

Status: AGREED scope, NOT built — after v0.80; wait for his go.

## His decisions
- Scope: all fixes + table basics = items 1–2, 4–7, 11, 12 below (the Play Now card setup, stands for the fallen, table wagers, Tonight, player cards, history come later).
- Privacy: NO curtain. Mandata Flavi of other players always show the card back (assets/mandata_back.webp, as for CPUs today); your own card shows the back too during play with a 👁 hold-to-peek. The whose-move pill stays up all turn.
- Records: table games stay out of the owner's progress entirely (no Ludus saves, Hall, unlocks, Annals, Infamis, calendar) — only the players' books.
- Later list keeps only: Guest in Manager bouts (a friend plays the rival house's fighter in your live bout). Dropped: festivals/tournaments at the table, player stables, couch + online.
- Fixes 'Hot seat leaks into other modes' and 'Gate of Life ghost Ludus record' ship in v0.80 (they touch Online and every Play Now game).

## State
Hot seat still works end to end. A full Classic played by hand at 3 humans + 1 CPU finished with no errors, and these all worked: the turn banner, the "Since your last turn" window, the fighter panel following the player, defender windows addressed by name, truces, the market, self-wagers, Replay, Save & leave, and both phone layouts. It is still the v0.49 layer, though. The setup is the pre-v0.75 screen (both Play Now redesign wrappers skip hot seat), only single events are offered, and profiles are a name, a dot and counters. Several verified bugs reach beyond the table. Opening Hot seat once turns later lessons, Manager bouts and an Online host's match into hot-seat games. The players' books ignore the Fate and lose any simmed or handed-off event. Guests' results land in the owner's Ludus, Hall and calendar. Every human's Mandata is face up. The table itself lacks a privacy hand-off, an owner for CPU offers, seat-control rules and a reason to spend the wallet. Fallen players sit idle.

## Fixes

- **Hot seat leaks into other modes** — CFG.hotseat is cleared only by playNowMenu. The startEvent guard tests cfg.mgr, which no config ever sets. So after one visit to Hot seat, Learn to Play renames Tiro to 'Player 1', saves a junk profile and forces hints off. The same path reaches Manager live bouts, exhibitions, the beast pen and the Online host, which would rename fighters before the lockstep snapshot. Fix: mark the cfg at the hot-seat Go button with a new key (not cfg.hotseat: the wrapper's own test skips that one), refuse mgrCtx/exhibCtx/specCtx/tutorial/onl/pen76, and clear CFG.hotseat on menuShow and when the setup closes. Keep it for New event and Replay.
- **Players' books ignore the Fate and lose handed-off events** — hsAfterEvent reads p.alive. Livia (33 CF, 'Survives to the Ludus Flavius') was booked as a death with no 'Into the Ludus' honour. It also skips any p.cpu row, so one ⏭ To the end erased the event from every book, the winner's included, and a seat handed to the CPU records nothing. Fix: use aliveInUniverse(x)/x.fate and skip only rows without a pid. A simmed event counts events and wins but gives no honours.
- **Gate of Life writes a ghost Ludus record (every Play Now game)** — The Gate of Life calls Store.put('gladiators', rec.id, rec), but the new record has no id. The auto-update loop then re-saves the real record as 'active'. Result: a duplicate with no id, events counted twice and the infirmary state lost. Fix: put under x.p.saved and skip savedDone rows in the second loop. Run tres.
- **Mandata Flavi readable by the whole table** — boardHTML hides Mandata only for CPUs, so Field → Marcus on Tiro's turn showed his secret objective. At a hot seat, hide every human's card with the card back unless it is the viewer's own turn, and add a hold-to-peek. All cards turn face up after the event as now.
- **'Offer them the sword' crashes at a hot seat** — In the Stands roster during a hot-seat match, the hot-seat stub passes the 'needs a lanista' check, then activeMgrWorld() is null → TypeError on .week. Each click also uses up the regular's one-time ask and advances the seeded dice RNG (UI code calling rand). Fix: hide the action outside Manager and use Math.random for the refusal roll.
- **Taken-over CPU has no player** — '🎮 Take control' gives a seat with no pid. Its turns show no banner, the previous human's wallet pays (Tiro's), and the result is recorded in no book. A new hot-seat branch asks who plays the seat and attaches their pid.
- **Hints come back mid-game** — showStrategy reads SETTINGS.hints, so Focus 💡 suggestions still show at a hot seat. Pressing M (applySettings) sets HINTS back on, and matchLoad never re-applies hints-off. Keep hints off at the table on all three paths.
- **Junk profiles and a dead name box** — A blank Player seat saves a permanent 'Player 4' profile, a repeated or case-variant name saves 'marcus′', and those ghosts pre-fill seats next time. The gladiator-name box is overwritten at the horns, yet typing in it still rewrites Play Now's remembered class name. Block the horns with 'Name every player', and stop the silent rename (see proposal 4). Profile ids use Math.random, not the seeded rnd().
- **'Your turn' window misfires** — It counts the starting players, not the living humans, so a lone survivor gets it every turn. It opens before hsActive is updated, so the previous player's board and wallet are live behind it. S.hsPrevP holds a live player object that match saves duplicate, so after a load the recap is wrong. Count living humans, set the active player first, and store an id instead.
- **Wallet points at the wrong purse** — The hot-seat stub bills the owner's Ludus infirmary cures to the acting guest. 'Buy their cheers' defaults to the first gladiator, so Tiro paid twice and both supporters went to Marcus. Wager settlement runs after S.over, when hsActive is null, so any payout would reach the owner's lanista. Default cheers to the acting player, keep owner-only actions on the owner's purse, and settle by pid.
- **Every human labelled 'You'; truce rings vanish** — Result cards, board headers, the Field roster and the 'You take the reins' line all say 'You' at a hot seat. Show the player's name instead (single-human Play Now keeps 'You'). truceViewer returns null on CPU turns while 2+ humans live; fall back to the last human who moved.
- **Online windows say 'pass the device'** — The defender-window wrapper fires whenever more than one seat is human, so online defend windows carry the couch line. Gate the wrapper to hot seat.
- **Profile delete skips the ask-first popup** — Profile delete is an inline two-click 'Delete?' button. Move it to the standard centred DEL76 popup that names the profile.
- **Phone landscape: End turn off screen** — The action drawer's End turn row ends at 400 px in a 390 px viewport, and in portrait the turn chip cuts the player name to 'M'. Keep End turn on screen and the name always visible.

## Proposal (numbering used in the scope)

**Setup & hand-off**
1. **Pass-the-device curtain.** A full-screen cover in the next player's colour: "🪑 Pass to Livia", with the "since your last turn" recap only if something happened. One tap lifts it, and phone drawers wait for that tap. It replaces the 2.2 s banner and the every-turn window, and is skipped for a lone survivor or the same player twice. It is a table option, on by default. **M**
2. **Whose-move pill.** It stays up for the whole turn in the player's colour. On phones the name always shows. **S**
3. **Hot seat on the Play Now cards.** Seat cards with minis, the class picker with win rates, mind and team chips. A "Who's at the table" row of player chips sits on top; unnamed seats are CPUs. Records fold into a strip, and "Play as a spectator" is hidden. **L**
4. **Own names.** The gladiator keeps its name (typed, Studio character or class default) and the player shows beside it ("Ann · Spartacus"). A per-seat "fight under my own name" tick keeps the v0.49 way. **S**

**At the table**
5. **Every window names who answers.** CPU truce and trade offers, offers between players, and gifts open as "🪑 Livia — … pass the device". **S**
6. **Flavius's truce decree asks each bound player** by name; one "Fight on" breaks the truces. **S**
7. **Seat rules.** You can hand only your own gladiator to the CPU. "Take control" asks which player takes the seat. ⏭ To the end asks the whole table, and the event still counts in everyone's book. **S**
8. **The fallen take the stands.** Each player who falls gets a free seat under their own name and their own stands turn (stones, offerings, moving section, Tholo), behind the curtain, with "Just watch" to skip. It pays off most at 5–8 seats. **M**
9. **Table wagers.** Players stake wallet coin on the winner. The pot goes to the winning bets by stake, paid into each bettor's own wallet. **M**

**Modes**
10. **Same table again.** Hot seat reopens with the last table (players, classes, minds, event). Results open on a "🍷 Tonight" card: place, CF, Fate, coin, new honours and a running points tally (5/3/2/1 by place, +1 per player slain), with 🔁 Same table · 🔀 Swap classes · Next event. **M**
11. **Resume the table.** Hot-seat games get their own 🪑 autosave slot. Saves name the players and who is to move, and Multiplayer → Hot seat offers ▶ Resume, back in hot-seat mode. **S**

**Profiles & records**
12. **The table stays out of your records.** No guest survivors in your Ludus, no Gate of Life, no summoning your Ludus gladiators, and no Hall, Annals, Play Now Record, unlock or calendar changes from guests (see question 3). **M**
13. **Player cards.** Each player gets a portrait, token, colour and a "🎓 hints on my turns" switch, worn on the sand, on the board and on the curtain. **M**
14. **History and head-to-head.** Each player keeps their last 20 events, best class, honours by name, and their record against every other player (⚔ Nemesis). A 🪑 Hot seat tab in the Annals holds the table's leaderboard. **M**

**Later**
15. Festivals and tournaments at the table (the tournament seats one human today, and there is one shared bracket). **L**
16. Team splits with one tap (Players vs CPUs, Pairs, Halves, Shuffle); a team win counts for every teammate. **S**
17. Player stables: up to 3 survivors per player who come back next night with their scars and CF, kept apart from your Ludus. **M**

## Not doing

- Couch Manager league (2–4 lanistas in one world): about 25 world fields assume one player and most Manager modules would change. Only a 'guest fights the rival bout' variant is listed, as question 4.
- Couch + online in one Custom room: needs a protocol and server change for seat ownership; only after Rooms ship (question 4).
- One shared TABLE layer for hot seat and online: it would tie couch play to lockstep and the Lambda. The hot-seat half is item 5; online's part stays in the online batch.
- Sharing the room screen with the v0.80 online room: that code is unfinished and ships in the server zip. The hot-seat setup is built locally (item 3).
- Changing the online wager settle rule for table wagers: that means a server redeploy; table wagers settle locally.
- Spectator group turn at the table: his open questions on it (refunds, actions per CF, the CPU crowd) are still unanswered, and it changes when stones land.
- Real dice entered by hand: the RNG count must match exactly or the seeded dice drift; high effort for a niche taste.
- Haggling (counter-offers in trades): low value against a reply window that can't be wrapped.
- Table season on the empire calendar: after Tonight and Resume prove themselves.
- Missio at the table: it is one character's five-event campaign.

## Engineering notes

Put the work in a new module (e.g. src/117-v80hs.js) inserted before 08-setup. Make direct edits only where wrapping is impossible:
- 07-ui boardHTML Mandata `hidden` test → (player.cpu || hsSecret(player)).
- 06-ai cpuDiplomacy :451/:469: set RESPONDER=q around the two offer modals.
- 07-ui openTrade reply modals :3389/:3446: set RESPONDER.
- 62-rules53 showStrategy (const arrow): read the hot-seat hints override. Also gate its modal wrapper to S.hotseat (!S.onl).
- 51-v49 :197 banner and 52-v50 :44-46 modal: gate behind one flag so the new curtain wrapper replaces them rather than stacking on them.
- 10-meta Gate of Life: put under x.p.saved and skip savedDone in the re-save loop.
- 16-crowd 'Offer them the sword': Math.random for the roll, hidden outside Manager.

Leak fix: the 51 startEvent wrapper skips any cfg that has cfg.hotseat, so mark the source with a new key (cfg.hsTable) and refuse mgrCtx/exhibCtx/specCtx/tutorial/onl/pen76. Clear CFG.hotseat in menuShow and on setup close, but keep it through #btnNew → openSetup(true) and LAST_CFG replay. Festival stage 2 and loaded saves must carry the flag in the cfg or in S; never read the global CFG.

Books: hsAfterEvent filters on !p.pid. Deaths, freed and the ludus honour come from aliveInUniverse(x)/x.fate; Fates are pre-rolled in gameOver before recordEvent, so they are valid there. Honours are skipped when p.simmed.

Curtain: one beginTurn wrapper that sets S.hsActive and S.boardPid BEFORE the cover, counts living humans, stores S.hsPrevId (an id), and skips HEADLESS, S.sim and S.snap. plTick (86) and ppTick (99) wait on body.hscurtain. The first tap must never reach the canvas.

Seat control: a hot-seat branch in 33-tickets seatCanToggle (own seat, own turn). Take control pushes the chosen profile's pid. Wrap the simToEnd prompt.

Owner records: a guestTable() predicate in recordEvent, updateCrowdAfterEvent, saveAllOK, the Gate of Life, calAdvance, and the 11-extra infirmary billing. Hide the 08-setup sav/lcp selects under HS_IN_SETUP. logCustomChars still writes a Studio character's own record.

Setup (item 3): 51's setupBody regex removes the tablist that pnLayout75 re-seats, so rework the wrapper order instead of only dropping the `||CFG.hotseat` skips. ths49 selects .hsname/[data-hsn].

Stands (item 8): a separate hot-seat loop over human spectators. Do not ungate 113:137, which is keyed on ONLM; make sure the base spectatorsAct doesn't run the first human twice. Spectator ids are 'hs:'+pid. Generalise the 'You hurl' → name log rewrite.

Wagers (item 9): S.bets slips carry the pid and settle by pid after S.over. Keep them out of betRec and the Manager bet log. Never touch ONLC.settle.

Looks (item 13): set p._onlLook/_onlTok in mkPlayer from a hot-seat field. Never use seat.onl, because 112 treats seat.onl.gear as a kit. Run cleanLook (≤3 KB). A Studio character's own look wins over the profile's.

Saves: a matchLoad wrapper restores CFG.hotseat, HINTS and LAST_CFG from S.hsCfg. Add a separate 'table' autosave slot, and put the player names in the save summary (which is printed twice today). Consider routing hsPersist through the 109 newer-version guard.

Tests:
- Extend ths49: books after a Fate survival, a simmed table, a handed-off seat, blank and duplicate names blocked.
- Extend ths50: the curtain replaces the away window.
- New ths80: open Hot seat → close → startTutorial and a Manager bout keep their names and hints; Mandata hidden on another human's board; CPU offer titled with the human's name; save/load restores hot-seat mode and Replay; Gate of Life writes no ghost record.
- Run tres (Gate of Life), tv71 (card back), tonl77/78/79 (62 wrapper gate), and re-shoot the tv66/tv73 phone screenshots.

Probes in scratchpad/hs (probe1-4, t1-t3, drv.js) reproduce every bug.

## Play-test problems (raw)

- [bug] The players' books count a gladiator spared by the Fates as a death and refuse the 'Into the Ludus' honour. hsAfterEvent checks p.alive (still on the sand at the end) instead of the Fate result. — src/51-v49.js hsAfterEvent: `if(!p.alive)P.deaths++;if(f>=20&&p.alive)P.ludus++` and `if(f>=20&&p.alive)give('ludus')`
- [bug] ⏭ To the end (sim to end) silently drops the whole event from every player's book. simToEnd sets cpu=true on every human and hsAfterEvent skips p.cpu, so even the winner gets no event and no win. The same happens to anyone left on '🤖 Hand to CPU' when the event ends. — src/05-flow.js simToEnd + src/51-v49.js hsAfterEvent (`if(!p||p.cpu||!p.pid)continue`)
- [bug] Taking control of a CPU at a hot seat ('🎮 Take control') gives a seat with no profile. Its turns get no hand-off banner and no away note, and the wallet in use stays the previous human's, so that person pays for anything bought. Its result goes into no book. — src/33-tickets.js seatToggle + src/51-v49.js beginTurn wrapper (banner/hsActive only when p.pid)
- [bug] Secret objectives (Mandata Flavi) are open to everyone at the table. The board hides them only on CPU players, so any human can open another human's board from the Field tab and read their objective. Your own objective is also shown face up on your board during your turn. — src/07-ui.js boardHTML items: `const hidden = it.kind === 'mf' && player.cpu && !S.over`
- [bug] The Gate of Life writes a Ludus record with no id, then a second auto-save marks the real record 'active' again. The result is a ghost duplicate record, events counted twice, and the infirmary state lost; Marcus's infirmary record disappeared entirely. This is a general bug (any human-run gladiator who survives badly hurt), but here it also puts the hot-seat guests' gladiators into the device owner's Ludus Flavius. — src/10-meta.js ~line 202 `await Store.put('gladiators',rec.id,rec)`: rec comes from gladiatorRecord(), which sets no id on a new record. The loop at ~line 208 then re-saves because p.saved is now set.
- [rough] There is almost nothing to spend the hot-seat wallet on. The bookmaker is closed outside Manager mode (bookOpen() needs mgrCtx/specCtx) and #btnBets/#btnTicket are hidden. Payouts are p.coin (+25 for a win), and a fallen gladiator's coin is 0, so wallets barely move. The 51-v49 header still promises 'wagers, tickets and cheers' from the wallet. — src/16-crowd.js bookOpen/openWagers; src/51-v49.js header + hsAfterEvent coin
- [rough] The hot-seat setup is still the pre-v0.75 layout: event/city dropdowns, plain seat rows, no event-card strip, minis, win rates, Quick start or presets. Both 106-v75 pnLayout75 and 108-v76 seats76 skip CFG.hotseat. With 8 seats it becomes one long right-hand column while the left side under the map stays empty. — src/106-v75.js:291, src/108-v76.js:121 (`||CFG.hotseat`) and the 51-v49 setupBody/seatRows wrappers
- [rough] Each human seat has two name boxes, the player name and the gladiator name. The gladiator name is silently overwritten by the player name at the horns. — src/51-v49.js startEvent wrapper `if(!s.saved)s.name=P.name`
- [rough] Names create profiles without asking. 'marcus' (a case variant of Marcus) becomes a new profile 'marcus′'; an empty Player seat becomes a permanent 'Player 4' profile. On the next open the four most-played names, including the accidental one, pre-fill four Player seats. — src/51-v49.js startEvent wrapper (`while(used.has(nm))nm+='′'`, `|| 'Player '+(i+1)`) and hotSeatOpen
- [rough] The 'your turn' window pops on every human turn, even when it only says 'Nothing touched you.' It also keeps popping when only one human is still alive, because players.length counts the fallen. While it is up, the old turn is still on screen: the board shows the previous player, the turn panel shows the CPU's text, and the active wallet is still the previous human's. — src/52-v50.js beginTurn wrapper (`S.hotseat.players.length>=2`, modal before base so 51's hsActive/banner haven't run)
- [rough] The results window does not show the hot-seat outcome. The players' books are only a log entry plus a toast saying 'see the log', and every human is labelled 'You' ('Soldier · You', 'Tiro (you)'). There is no table or night standings at the end. — src/51-v49.js hsAfterEvent (log + mToast only); 10-meta result cards
- [rough] 'Buy their cheers' defaults to the first gladiator rather than the player whose turn it is, and one click commits the purchase. Twice Tiro paid 5 coin and the spectator became Marcus's supporter. Guests can also ban spectators or offer them the sword in the device owner's shared crowd. — src/16-crowd.js spectator card (#spInfl options in seat order, data-spact infl/ban/sign)
- [rough] On the open table any player can act on everyone's game without asking: ⏭ To the end, 🤖 Hand to CPU on another human's board, 💾 Save & leave and Abandon. To the end then also erases the event from the books (see above). — src/33-tickets.js seatCanToggle (true for every fighter outside Manager) / Speed tray #btnSimEnd / #btnMenu
- [rough] A hot-seat game writes into the device owner's own history: Annals event record, Hall 'latest', the Imperium calendar date, crowd memory and the Ludus, even though the module says the owner's records stay out of it. — 10-meta endgame (recordEvent/updateCrowdAfterEvent/saveGladiator) run unchanged for S.hotseat; only achievementsAfterEvent is skipped
- [rough] Phones: the whose-turn chip loses the name. In portrait the action phase shows 'M | ACTION' and resolve shows only 'RESOLVE', which is the one thing a hot-seat table needs. In landscape the action drawer covers the right half of the board and the End turn row runs past the bottom edge. — body.phoneP2 / body.phoneL turn chip and #actions drawer
- [polish] The hand-off banner is small, lasts 2.2 s and sits over the 'Name · PHASE' chip and the Flavius portrait. It is easy to miss when the device is passed across a table. — src/01-head.html .hsturn (top:70px) + src/51-v49.js hsTurnBanner (2200 ms)
- [polish] The profile colour dots don't match the players' colours in the arena. — src/51-v49.js hsEnsure (PALETTE[n]) vs seat colours
- [polish] Deleting a profile uses an inline 'Delete?' second click instead of the centred ask-first popup used everywhere else (data-hsdel is not in DEL76). — src/51-v49.js [data-hsdel] handler; src/109-v761.js DEL76
- [polish] Match saves don't say they are hot-seat games or who is playing, the summary text is repeated twice, and after loading there is no 'X's turn' banner. — src/38-matchsave.js / 108-v76 savesHub76
- [polish] The hot-seat options include '🎟 Play as a spectator (all seats CPU)', which has no meaning at a hot seat. The setup map's 'Roma' label is hidden under marker 6. — Options block in setupBody (hot seat keeps the old layout)
- [polish] Game text says 'You' for every human at the table: the board subtitle ('Royalty · Patrician · You'), the Field roster and the log ('🎮 You take the reins of …'). — 07-ui board header / rosterGrp / 33-tickets seatToggle log