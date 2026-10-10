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
