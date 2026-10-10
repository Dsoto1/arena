# Online room v1.0 — mock-up notes (items 10a, 10e, 10f/10g, 10i)

Mock: `lobby.html#host | #guest | #full | #phone` (static; real art pulled from the built game by `lobby_extract.js` → `lobby_art.js`:
portraits via portraitSVG(gladPortrait), sculpted tokens via onlFig, Domus rank banners via dr98URI). Shots: `node tools/plans/mock100/lobby_shot.js`
→ lobby_host_1440.png, lobby_guest_1440.png, lobby_full_1440.png (+ _page), lobby_phone_390.png (+ _full).

## Changes vs today (fix99/after_lobby_room.png)
- **10a Banner** across the top of the room (was a card + one-line strip inside it): event + city, Ranked/Custom, Day/Night,
  Free-for-all/Teams, in-room and seated counts, Ranked rank gate. Right side: **Room code** (copyable, "copied ✓"),
  📣 **Call the crier** (host only; "2 of 3 left · next in 1:24", disabled during the 2-min rest, "Crier spent" at 0),
  🚪 **Close lobby** (host alone) / **Exit lobby** (anyone else; host's exit passes the crown). **No Invite, no Invite by FID** in the room.
- **10e Player list** = always **8 rows**, empty ones dashed "open"; 370 px wide (was ~260). Row: 👑 or index · Domus rank banner ·
  name (+ "you") · house · Glory rank · Domus rank · Seat N (+ team) / standing / 👁 watching · ✓ ready / ○ not yet.
  Host actions **👑 Give host · ✕ Kick** appear on hover (shown hovered on Marcus in #host). Name click = house card (hc98).
- **10f/10g Seat cards**: portrait (top-left) + token on a lit floor + 👑 host before the name + class · house + **Glory rank chip** +
  **Domus rank chip** (banner + name) + ✓ Ready ribbon. Quick-chat bubble UNDER the token (space reserved, no jump).
  Open seat = dashed, 🪑, "a CPU if empty at the horns", **Sit here** for a standing member. Your seat holds **Send N coin of <treasury>**.
  Team events: coloured top edge + TEAM A/B label.
- Seats centred, 4 per row (Classic = 1 row of 4; Familia 6–8 = 2 rows). Table settings under the seats (dashed read-only for guests,
  "set by the host · <name>"). Start / Ready stay in the 271 foot bar bottom-right; the foot names who is not ready.
- **Quick chat** picker sits bottom right under the list (no Ready chip, as in 271).
- **10i Watchers**: before the horns a dashed "🧍 Standing" strip warns "no seat at the horns = watch (not a player)"; at the horns
  (#full: countdown 0:07 + host ✕ Hold) it becomes "👁 Watching" and the list rows read "watching"; they are not counted in "6/6 seated".
- Phone (390): banner wraps (code row, crier + exit side by side), seats 2 per row, settings 2 columns, list after the seats,
  Start/Ready pinned to the bottom.

## Not decided in the mock (see questions)
Where the invite-by-FID goes now (Lobby Browser? house card?), whether the room code is new or reuses the host FID, Glory chip art.

## Revision 2 (his answers C1a–C4a)
- **C1a** `#extras`: Lobby Browser top bar gets a **Join by code / FID** box (R-… → that room, FID-… → the room that lanista is in; refusals
  inline under it). House cards gain **⚔ Join** while that house sits in a waiting room you may enter (beside 🏛 Visit · ★ Follow).
- **C2a room code — why it is needed:** it replaces Invite. A friend types or pastes it and lands straight in your room without searching
  the list, and it works across regions and list filters (a 🔒 Custom room still asks for the password).
  *Alternative:* drop the code and join only from house cards (follow the house → its card shows ⚔ Join). Simpler, but the friend must
  find your house first, and a room hosted by a stranger can't be shared.
- **C3** `#eight`: 8-seat Familia, teams A/B, 4×2 **compact** seat cards (portrait 44 px + 90 px token + name + Glory medal chip +
  Domus rank chip, bubble kept). Phone 390: 2 per row (`lobby_eight_390*.png`).
- **C4a** Glory rank medals for the 8 online ranks (ONLC.RANKS): Tiro wood/rudis · Novicius copper/sprig · Gregarius bronze/shield ·
  Veteranus iron/crossed swords · Primus Palus silver/column · Summa Rudis gold/crown · Rudiarius gold + red enamel/gladius ·
  Invictus gold + purple enamel + laurel/eagle. Used on seat chips (18 px), list rows (14 px), the banner rank gate and house cards;
  medal sheet in `#extras`. Drawn as inline SVG (`medal(k,size)` in lobby.html) — can ship as code, no image files.
