# v1.0 status (2026-10-11)

## Done and merged on the branch
- **3D gear in the game:**
  - Printed pieces are sculpted once at build time and shipped in one 293 KB file.
  - Swords sit in the fist with a straight wrist.
  - The scutum passes its shield check.
  - The base is 0.8 tile and tokens are 15% bigger.
  - A soldier-kit character converts in 34 s instead of 67 s.
- **Free agents heal:** the city physician closes their surgeon wounds; they no longer fester.
- **City Square opens cleanly:** it loads under a cover, then the crowd is already walking, each figure on its own pace.

## Building now (parallel branches; merged as they finish)
| Item | Notes |
|---|---|
| Hit feedback | Numbers on the avatar, a body diagram on the board, one readout per action, words for saves, others' hits faded, Full/Mine/Quiet, hits marked until your turn, coin/CF fly to their counters, no pop-ups at Fast |
| Arena look | Rail with piers, connected corner towers, 12 stone families, all 3 rail styles, bands on all 12, Capua gilt parapet, per-arena bronze, 4 theme palettes |
| Push animation | Lunge, slide, wobble, dust; spikes hit after the slide |
| Main-menu 3D show | Same story with animated 3D figures |
| Zoom stutter fix | Root cause first, then the fix |
| City | Reduce motion = still crowd; the crowd is not clickable; spectator actions move to the right panel |
| Tame bond | Meat Lure breaks it (not on humanoids); the bear charge cards break a tamed bear's bond |
| Online truces | CPUs make no truce or trade offers to humans online; tested with one window in Spanish |
| Crowd stands up | On big moments |
| Gear follow-up | Pre-built body, bow string, nothing spills out of the tile |
| Beasts round 3 (look) | Your joint list, slim snake, mane, Commodus hood, swinging cape, smaller Zora |
| Babylon prototype (look only) | Not for the game |

## Approved, not started
- **Built from the approved mock-ups:**
  - **Play Now:** sandstone, "your turn" ribbon, centred window / phone bottom sheet, carbon-black danger slab.
  - **Bubbles:** in the page except when zoomed, italics for thoughts, name plate with 2+, none at Fast. Only if speed holds.
  - **Lobby:** 8 compact seats, short room code, Glory medals, user list to the bottom, goofy taunts (server phrases).
  - **My Ludus:**
    - Tiles: Team · Promote · Upgrade School · Armory · Advisors.
    - Bout chips in the banner.
    - Scrolling task list.
    - Letters drawer.
    - Richer scenes.
  - **Advisors:** bronze frieze, glow on news, popover to train.
  - **Signing:** gem/dud reveal.
  - **Recruiting r3:** fresco portraits, one-line rows, grade rows, contract tablet.
  - **Rooms:** Roster / Training Yard / Infirmary (marble statue, full-size ghost limb).
  - **Insignia banner designer:** six Roman kinds, Parma chip, Flammula for Flavius, Signum tops, bronze plaque, Colosseum stripes.
  - **Event briefing:** portrait + token, new Flavius lines, rule cards without digital rules, reopen with NOW/done rounds, "Enter the arena".
- **Advisor levels:** one clear effect each for all six.
- **Online server batch (needs a deploy):**
  - Ranked = equipped gear only.
  - One Issued kit per house, refilled daily (worth 0).
  - Online wagers removed.
  - A results screen for every player.
  - Domus slots bought with Glory + coin.
  - Watchers not counted as players.
  - Goofy taunt phrases.
  - Security pass on the backend.
- **v1.0 extras:**
  - First hour (guided first match + first Manager week).
  - Tituli: one achievement set across all modes, never emoji art; this fixes the online trophy "teddy bear".
  - Replays: each player's last 10 locally, plus the server keeps Ranked.
  - Daily fixed-seed challenges.
  - Sound pass.
  - Balance sims.
  - Release hygiene: phones, accessibility, 9 languages, Tactics.
  - Website update for 1.0.
- **3D to finish:**
  - Animation sheets in the game: idle + walk always, others on use; Fast = CPU still, your moves animate.
  - 3D crowd: cheers + stands.
  - 3D people in the city forum.
  - Final beasts.
  - Spider swarm.
  - Painted rete.
  - Fortuna's Bounty animation.
- **From your v0.99 notes, not built yet:**
  - Online version chip off the main menu.
  - Manager +AP start bonus only on armored locations.
  - A fighter trained while in a bed.
  - The Focus card picks the location in a popup.
  - League Points column + tooltip.
  - Trials of the Yard layout.
  - Acta rabble-rousers.
- **From the V99 list:**
  - Event card carousel.
  - Options example cards.
  - Custom beast guard zones.
  - Autosave offline events + Resume.
  - Enter your gladiator into ANY event, plus occasional rank-restricted events (rank = rating grade).
- **After v1.0 (not in it):** clean layers phases 0–E, including the server Ranked check (log-only for the first month).

## Needs your answer
1. **Turn flow + timers mock-up:** go, or changes? (Reclaim after a drop; decision clock only when the turn timer is on.)
2. **Scope:**
   - a) everything above in ONE v1.0
   - b) v1.0 = what's building + the mock-up builds + the server batch + fixes, and the rest (extras, replays, daily challenges, Fortuna, rete, carousel, guard zones) in v1.01+
   - c) your own cut
3. **"Fight Night" rename** for Match Week: still wanted? The Fight Night card is gone.
4. **Enter any event:** how should the week's card offer special events? a) a mock-up first · b) just add them to the bout picker
5. **Who's-online list** (Orbis): v1.0 or later?
6. **Mandata Flavi cards + round tokens:** waiting for your sharper PNGs.
7. **Tholo and the Meat Lure:** the printed card says it works on him, your note excludes humanoids (asked when the tame job reports).
8. **Website text** for 1.0: will you write the What's New, or should I draft it?
9. **Questions from the running jobs** (hit feedback, arena, push, menu show, beasts, gear, Babylon), sent as each reports.
