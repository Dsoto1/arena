# One bubble family — notes (v1.0, his note 4)

Mock: `bubbles.html` (shots `bubbles_mock_1440_*.png`, `bubbles_mock_390_*.png`; `node tools/plans/mock100/bubbles_shot.js`).
Before shots (live v0.99 build): `bubbles_before_arena*.png`, `bubbles_before_shout*.png`, `bubbles_before_city*.png`
(`bubbles_before.js`, `bubbles_before2.js`, `bubbles_city.js` — they also write the clean boards and the speakers' real positions
`bubbles_pos.json` / `bubbles_city.json` the mock uses).

## Inventory — today → new variant

| # | Today | Drawn by (module) | Layer | New variant |
|---|-------|-------------------|-------|-------------|
| 1 | CPU **speech** (`mood` say / angry / gift / quote) — `.bub.say/.angry/.gift/.quote`, name in mono on line 1, tinted bodies | `think()` 06-ai → `S.bubbles` → `renderBubbles()` 11-extra; CSS 01-head `.bub`; cleared by `turnSweep` 72-v59, 48-arena47 (event over), dropped at Fast by 230-v95perf | DOM `#bubbles` | **SPEECH** (moods = ink colour only) |
| 2 | CPU **thought** (`mood` think) — same box as speech | same as 1 | DOM `#bubbles` | **THOUGHT** |
| 3 | **Wager** pill (coin / wheat + amount, floats up) | `wagerBubble()` / `wagerWatch()` 93-v71 (`.wbub`) | DOM `#wbubs` | **WAGER** |
| 4 | Online **match quick chat** (`.qbub80`, `.far` when the seat is off the sand) | `onlBubble80()` 118-onl80 (`match.say`) | DOM `#wbubs` | **CHAT** (board; off-sand → top-edge tab) |
| 5 | Online **room** phrase under the seat token (`.bub96`, 6 s, reserved slot) | `r96BubHTML` / `r96BubPatch` 234-v96onl (`R96.BUB`), pulse 240-v96pulse | DOM, room screen | **CHAT** in slot S |
| 6 | **Flavius / sponsor** line on a flat parchment slip beside the box | `flaviusMood()` → `FLAV.line`, painted in `drawFlavius()` 16-crowd; lines `FLAV_LINES`, `sponsorVoice()` 24-sponsors; faces 167-v89moods / 188-v91sponsor | canvas (flavius layer, 219) | **SHOUT** |
| 7 | **Spectator** emote emoji + shout rectangle (no tail; emoji floats loose) | `emote()` / `drawEmotes()` 16-crowd (`SHOUTS`); 208-v92zoom keeps shouts, drops emoji emotes | canvas (crowdtop) | **CROWD** |
| 8 | **City square** chatter chips (no tail; keep-out of labels/gate/YOU) | chatter in 25-city (`n.say`), painted in 172-v89city (`keep89`) | canvas (city) | **CROWD**, city size |
| — | Not bubbles, unchanged: online after-bout `onlToast80`, accepted truce/trade banner `.acc96` (236), `#caption`, `#cardShow` beast cards, floating numbers `#fx95` (227) | | | stay as they are |

Settings already exist (Settings → Voices & bubbles, 12-settings / 246-v98ui): `thoughts`, `flavius`, `shoutsSpect`, `emotesSpect`, `cityChatter` — they keep working as the on/off switches per variant.

## Shape language (shared)
- Body: parchment `#f5ead2` (gradient from `#fbf3e0`), ink text `#241910`, outline `#7a5a34` 1.5 px, radius 9 px, soft shadow.
- Tail: a 14×12 wedge whose tip sits on the **anchor** (the speaker's head = tile centre − 0.95 TW; Flavius's box edge; the seat token online). The body moves between slots, the tail never leaves the anchor.
- Colour = the speaker's colour as a **dot** in the name plate (speech/thought), a **band** on the left (chat), the **rim** (gold for Flavius). Text never sits on a coloured fill; the name is written once (colour-blind safe).
- Variants:
  - SPEECH — solid parchment, name plate, tail. Moods tint the ink only: angry red `#a3281f`, gift green `#4f7a3a`, quote italic.
  - THOUGHT — cloud edge (9-slice border-image), muted, italic, three trailing dots instead of a tail.
  - SHOUT — display face (Marcellus SC), gold double rim, from the side of Flavius's box, never over the sand.
  - WAGER — small gold-rim pill: coin or wheat + amount; the only one that drifts up as it fades.
  - CHAT — speech body + 5 px band in the player's colour, bold one-line phrase; speaker not on the sand → a tab hanging from the board's top edge with the name.
  - CROWD — tiny (text − 2 px), one line, no name, short tail; an emote becomes the first glyph inside (no loose emoji).

## Rules
1. **One layer.** Board bubbles live in one DOM layer (replaces `#bubbles` + `#wbubs`), above the pieces, below `#fx95` floating numbers and every window. Canvas systems (stands, city) use a canvas painter with the same tokens (see Q1).
2. **Placement.** Try slots N → NE → NW → E → W; first that fits wins. S only for room seats. NE/NW slide the body 18 px past the anchor.
3. **Keep-out.** Never covers: the speaker's tile + head column, any other piece's head box (gladiators, beasts, Zora), Flavius's box, the turn chip, another bubble, the phone drawers' fitReserve band. May cover sand, pillars, walls, stands. 6 px inside the board. Nothing fits → least-covering slot, 1 line. 172's `keep89` becomes this shared rule.
4. **Several at once.** One bubble per speaker (new replaces old). Newest takes the best slot; older ones fan up/out on a stem (≤ 1.5 bubble heights). Cap: 3 piece bubbles + 1 shout + wagers (phones 2). Over the cap: thoughts go first, then the oldest speech; chat and shouts never drop early.
5. **Max lines / width.** Speech 3, thought 2, shout 2, chat 1, crowd 1 (city 2), wager 1. Width 200 px (shout 240, crowd 120). Over → ellipsis; the log keeps the whole line.
6. **Size by zoom.** Text = clamp(11, 0.24 × TW, 15) px — 12.5 at desktop TW 52, 11 on a 390 phone (TW 28), 15 zoomed. Crowd = text − 2 (floor 9.5), wager = text − 0.5. Phone max width = 40% of the board (≤ 150 px).
7. **Lifetime.** in .16 s → hold 2.0 s + 0.05 s/char (≤ 6 s) → fade .3 s. Slow ×1.6; Fast: thoughts/crowd/wagers off, speech only when it names you, shout ×0.6; Pause holds. Chat is always 6 s (a person wrote it). Hover holds a bubble; click scrolls the log to its line.
8. **Clears.** Turn sweep (72-v59) removes the previous turn's thoughts; event over / clean-up removes everything (48-arena47).
9. **Reduce motion / calm / Animations Off:** opacity only (120 ms) — no rise, scale or stem stretch; wagers don't drift.
10. **Accessibility.** Bubbles are `aria-hidden`; words reach screen readers through the log + live region (220-v93a11y). Contrast parchment/ink ≈ 14:1.
11. **Online.** Display only — never in S, never in onlHash; chat bubbles arrive from `match.say` as today.

## Open questions (for Virgilante)
1. Canvas systems (stands shouts, city chatter): **(a)** canvas painter with the same tokens (my pick — no DOM per spectator) · (b) move them into the HTML layer too · (c) leave them as they are.
2. Thought look: **(a)** cloud edge + trailing dots (as mocked) · (b) dashed outline · (c) speech shape, muted + italic only.
3. Name plate on speech/thought: **(a)** always · (b) hidden when the speaker is the current fighter (ring says who) · (c) never — colour dot only.
4. Board cap: **(a)** 3 piece bubbles + Flavius + wagers · (b) 2 + Flavius · (c) no cap, fan-out only.
5. Fast speed: **(a)** speech only when it names you, no thoughts/crowd/wagers · (b) nothing at Fast (as v0.95) · (c) everything, shorter.
6. Crowd shouts on phones: **(a)** emote glyph only unless zoomed · (b) words too · (c) off.
7. Flavius's line: **(a)** gold-rim shout beside his box · (b) a ribbon hanging under the box · (c) face only, line in the log.
8. Clicking a bubble: **(a)** scrolls the log to its line · (b) nothing · (c) opens the speaker's panel.
