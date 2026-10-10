# One bubble family — notes (v1.0, his note 4)

Mock: `bubbles.html` (shots `bubbles_mock_1440_*.png`, `bubbles_mock_390_*.png`; `node tools/plans/mock100/bubbles_shot.js`).
Before shots (live v0.99 build): `bubbles_before_arena*.png`, `bubbles_before_shout*.png`, `bubbles_before_city*.png`
(`bubbles_before.js`, `bubbles_before2.js`, `bubbles_city.js` — they also write the clean boards and the speakers' real positions
`bubbles_pos.json` / `bubbles_city.json` the mock uses).

## Inventory — today → new variant

| # | Today | Drawn by (module) | Layer | New variant |
|---|-------|-------------------|-------|-------------|
| 1 | CPU **speech** (`mood` say / angry / gift / quote) — `.bub.say/.angry/.gift/.quote`, name in mono on line 1, tinted bodies | `think()` 06-ai → `S.bubbles` → `renderBubbles()` 11-extra; CSS 01-head `.bub`; cleared by `turnSweep` 72-v59, 48-arena47 (event over), dropped at Fast by 230-v95perf | DOM `#bubbles` | **SPEECH** (moods = ink colour only) |
| 2 | CPU **thought** (`mood` think) — same box as speech | same as 1 | DOM `#bubbles` | **SPEECH**, words in italics (B2) |
| 3 | **Wager** pill (coin / wheat + amount, floats up) | `wagerBubble()` / `wagerWatch()` 93-v71 (`.wbub`) | DOM `#wbubs` | **WAGER** |
| 4 | Online **match quick chat** (`.qbub80`, `.far` when the seat is off the sand) | `onlBubble80()` 118-onl80 (`match.say`) | DOM `#wbubs` | **CHAT** (board; off-sand → top-edge tab) |
| 5 | Online **room** phrase under the seat token (`.bub96`, 6 s, reserved slot) | `r96BubHTML` / `r96BubPatch` 234-v96onl (`R96.BUB`), pulse 240-v96pulse | DOM, room screen | **CHAT** in slot S |
| 6 | **Flavius / sponsor** line on a flat parchment slip beside the box | `flaviusMood()` → `FLAV.line`, painted in `drawFlavius()` 16-crowd; lines `FLAV_LINES`, `sponsorVoice()` 24-sponsors; faces 167-v89moods / 188-v91sponsor | canvas (flavius layer, 219) | **SHOUT** (moves to the HTML layer) |
| 7 | **Spectator** emote emoji + shout rectangle (no tail; emoji floats loose) | `emote()` / `drawEmotes()` 16-crowd (`SHOUTS`); 208-v92zoom keeps shouts, drops emoji emotes | canvas (crowdtop) | **CROWD** |
| 8 | **City square** chatter chips (no tail; keep-out of labels/gate/YOU) | chatter in 25-city (`n.say`), painted in 172-v89city (`keep89`) | canvas (city) | **CROWD**, city size |
| — | Not bubbles, unchanged: online after-bout `onlToast80`, accepted truce/trade banner `.acc96` (236), `#caption`, `#cardShow` beast cards, floating numbers `#fx95` (227) | | | stay as they are |

Settings already exist (Settings → Voices & bubbles, 12-settings / 246-v98ui): `thoughts`, `flavius`, `shoutsSpect`, `emotesSpect`, `cityChatter` — they keep working as the on/off switches per variant.

## His answers (2026-10-10)
- **B2** thoughts = the speech box, only the words in italics (no cloud, no dots).
- **B3** (lead's proposal) name plate only when 2+ speech/thought bubbles are up; a single bubble shows only the colour dot.
- **B4a** cap 3 speakers + Flavius + wagers. **B5b** Fast = no bubbles at all. **B6a** Flavius = gold-rim shout beside his box.
- **B1** asked to understand canvas vs HTML → mock section 7 "Where bubbles are drawn" (below).

## Shape language (shared)
- Body: parchment `#f5ead2` (gradient from `#fbf3e0`), ink text `#241910`, outline `#7a5a34` 1.5 px, radius 9 px, soft shadow.
- Tail: a 14×12 wedge whose tip sits on the **anchor** (the speaker's head = tile centre − 0.95 TW; Flavius's box edge; the seat token online). The body moves between slots, the tail never leaves the anchor.
- Colour = the speaker's colour as a **dot** (speech/thought), a **band** on the left (chat), the **rim** (gold for Flavius). Text never sits on a coloured fill.
- Name plate (B3): with one speech/thought bubble up, the dot only; with 2+ up, each wears its name plate (colour dot + name). Flavius is always named; wagers, chat (band) and crowd never carry a plate.
- Five variants:
  - SPEECH — solid parchment, tail. Moods tint the ink only: angry red `#a3281f`, gift green `#4f7a3a`. **Thoughts** and card quotes = the same box, words in italics.
  - SHOUT — display face (Marcellus SC), gold double rim, from the side of Flavius's box, never over the sand.
  - WAGER — small gold-rim pill: coin or wheat + amount; the only one that drifts up as it fades.
  - CHAT — speech body + 5 px band in the player's colour, bold one-line phrase; speaker not on the sand → a tab hanging from the board's top edge with the name.
  - CROWD — tiny (text − 2 px), one line, no name, short tail; an emote becomes the first glyph inside (no loose emoji).

## Where bubbles are drawn (B1)
- **Canvas** (painted into the board picture): follows zoom, pan and the turning board for free and is cheap, but text blurs when zoomed and screen readers / browser translation can't see it.
- **HTML** (page elements over the board): sharp text and accessible, but must be re-placed every frame while the camera moves; fine for a handful, slow for hundreds.
- **Recommendation:** HTML for everything that talks to the player (speech, thoughts, Flavius, wagers, chat: at most 3 + 1 + a few); canvas for the crowd (stands + city square: many voices, decoration, words also in the Stands log). Crowd text is painted from small cached pictures at screen sharpness, re-made when a zoom settles.
- **Zoom stutter:** today `renderBubbles()` runs inside every `draw()` (07-ui fx layer) and writes `left/top` per bubble, which forces a page layout in the same frame as the board paint. The new layer measures each bubble once on arrival and per frame only sets a `transform` (compositor, no layout), written after the paint, never reading sizes back (well under 1 ms for the cap). The canvas crowd adds no page work and its text pictures aren't remade mid-zoom. Bubbles should therefore stop adding to the stutter; the board's own layers stay the main cost. Proof: a frame-time test zooming with the full cap up, bubbles on vs off.

## Rules
1. **One layer.** Board bubbles live in one HTML layer (replaces `#bubbles` + `#wbubs`, and takes Flavius's line off the canvas), above the pieces, below `#fx95` floating numbers and every window. Stands/city crowd stay on the canvas with the same look.
2. **Placement.** Try slots N → NE → NW → E → W; first that fits wins. S only for room seats. NE/NW slide the body 18 px past the anchor.
3. **Keep-out.** Never covers: the speaker's tile + head column, any other piece's head box (gladiators, beasts, Zora), Flavius's box, the turn chip, another bubble, the phone drawers' fitReserve band. May cover sand, pillars, walls, stands. 6 px inside the board. Nothing fits → least-covering slot, 1 line. 172's `keep89` becomes this shared rule.
4. **Several at once.** One bubble per speaker (new replaces old). Newest takes the best slot; older ones fan up/out on a stem (≤ 1.5 bubble heights). **Cap: 3 speakers + Flavius + wagers** (phones too). Over the cap: thoughts go first, then the oldest speech; chat and Flavius never drop early.
5. **Max lines / width.** Speech 3, thought 2, shout 2, chat 1, crowd 1 (city 2), wager 1. Width 200 px (shout 240, crowd 120). Over → ellipsis; the log keeps the whole line.
6. **Size by zoom.** Text = clamp(11, 0.24 × TW, 15) px — 12.5 at desktop TW 52, 11 on a 390 phone (TW 28), 15 zoomed. Crowd = text − 2 (floor 9.5), wager = text − 0.5. Phone max width = 40% of the board (≤ 150 px).
7. **Lifetime.** in .16 s → hold 2.0 s + 0.05 s/char (≤ 6 s) → fade .3 s. Slow ×1.6; **Fast: no bubbles at all** (words still in the log); Pause holds. Chat is always 6 s (online has no Fast). Hover holds a bubble; click scrolls the log to its line.
8. **Clears.** Turn sweep (72-v59) removes the previous turn's thoughts; event over / clean-up removes everything (48-arena47).
9. **Reduce motion / calm / Animations Off:** opacity only (120 ms) — no rise, scale or stem stretch; wagers don't drift.
10. **Accessibility.** Bubbles are `aria-hidden`; words reach screen readers through the log + live region (220-v93a11y). Contrast parchment/ink ≈ 14:1.
11. **Online.** Display only — never in S, never in onlHash; chat bubbles arrive from `match.say` as today.

## Still open (for Virgilante)
1. B1 — canvas vs HTML: **(a)** the recommendation above (HTML for voices, canvas for the crowd) · (b) everything HTML · (c) everything canvas.
2. Phones, crowd shouts: **(a)** emote glyph only unless zoomed · (b) words too · (c) off.
3. Clicking a bubble: **(a)** scrolls the log to its line · (b) nothing · (c) opens the speaker's panel.
