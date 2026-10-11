# Heraldry (v1.0 mock, round 2 — ANCIENT ROMAN) — notes

Mock: `banner.html` (engine `banner_engine.js`; Today samples `banner_today_data.js` + `banner_today/arena.png` + `banner_today/flavbox.png`
from `banner_today.js`, run against the built game over http because file:// taints the canvas). Shots: `node tools/plans/mock100/banner_shot.js`
→ `banner_1440*.png`, `banner_390*.png`.

Round 1 read MEDIEVAL (heater shields, per pale / quarterly / chevron / saltire). Round 2 = Roman objects, Roman patterns, Latin labels.

## Decided (his answers, round 1)
1a the house parma rides the rank streamer's crossbar from Ludus Magnus up · 2a solid emblem + ink line + soft shadow · 3a weathering = the designer
slider only · 4a full design online, sculpt layers offline only · 5c Studio name "Heraldry" (Roman alternatives Signa / Insignia asked again) ·
6 Flavius's box pennant = the purple pennant under his portrait over the arena (drawFlavius, 16-crowd:930) — crop in §1 card 13.

## The model
ONE house design, six Roman KINDS (shape + frame only):

| Kind | Object | Inscription | Typical use |
|---|---|---|---|
| Vexillum | square cloth from a crossbar on a spear-tipped pole; ribbons (vittae), fringe, corner tassels | gold-leaf square capitals on the cloth | masthead, the square, fan flags, city / empire / region, arena wall cloths |
| Signum | pole standard: emblem topper in gold, crossbar + ribbons, laurel ring, phalerae discs, a clipeus disc with the emblem, lunula | bronze tabula ansata | ludus room, procession, gate |
| Flammula | narrow streamer (the dr98 cut) from a crossbar on a lance | never | Domus ranks (system), Studio / Play Now seat, Flavius's box |
| Velarium | wide awning cloth on ropes, sagging top, sewn panels, fringe | bronze tabula ansata | the stands (192 deco layer) |
| Scutum | curved rectangular shield: painted fresco, bronze rim, spina + umbo, emblem above the boss | never | record / fighter card, Manager house card, Domus banner card |
| Parma | round gladiator shield, bronze rim + rivets | never | THE chip: league table, room lists, records (< 44 px) |

Layers (same for every kind, all in flagURI's 600×340 space, so today's emblems and sculpt layers line up unchanged):
cloth dye (c1) + second dye (c2) → PATTERN: plain · clavi (two stripes) · meander (Greek-key border) · waves (running-wave border) · clipeus
(central roundel) · laurel (wreath round the emblem) · halved → EMBLEM (game FLAG_SHAPES + DR_SYM98 + new: bull, capricorn, scorpion, Gorgon,
crossed gladii, net + trident, palm, murmillo / thraex helms, open hand, S·P·Q·R, numerals) → sculpt layers → INSCRIPTION (square capitals,
U→V, J→I) → texture (dyed wool on cloth, painted fresco on shields) → folds → weathering → TRIM (gilded edge / bronze rim, tassels, fringe,
crossbar, madder band; fringe + tassel colour) · signum TOPPER (house emblem / manus / aquila / laurel / palm).
Palette with Latin names: Purpura (Tyrian purple), Rubia (madder), Ochra, Crocus (saffron), Aerugo (verdigris), Caeruleum (Egyptian blue),
Creta (chalk), Atramentum (lamp black) + any colour.
Small sizes (< 44 px): no texture, inscription or sculpt; thicker rim + ink line. Cache key = design hash + kind + px.

Suggested data: `{v:2, c1, c2, fg, pat, emb, top, ins, layers, baked, trim:{gilt,tassels,fringe,bar,topbar,fc}, wear}`; old `{bg,fg,txt,shape}`
maps bg→c1 (and c2), fg→fg, txt→ins, shape→emb, pat 'plain'. One function `heraldry(design, kind, px)` → data URI / cached Image.

## Today's systems → the one press

| Today | Where | Becomes | Replaces | Stays / note |
|---|---|---|---|---|
| Empire + city banners | 12-settings `flagURI`, `flagSVG`, `flagURIk`, `FLAGS`, `CITY_FLAG`, 27 `EMPIRE_FLAG` | Vexillum · 15 locked system designs | flagURI's body (name kept as a shim → heraldry(...,'vexillum')) | `flagBG` page backdrop and `bg:'flag:<k>'` portrait keys keep working |
| Manager house flags | 27 `mgrFlagOf`, `houseFlagURI`, `flagChip`, `flagImg`, `flagSpread`, `flagPickerHTML` | the house design (`m.flag`) | houseFlagURI / flagChip / flagImg bodies | rivals still derived from id + city (FLAG_PALS, FLAG_SHAPES12) so nobody's banner changes; chips = Parma |
| Family banners | 27 `famFlagOf`, `famFlagChip` | derived design → Parma chip | famFlagChip body | kin share it |
| Studio Banner press | 27 `flagStudioHTML`, `blankFlag`, `flagStudioClick/Input`, `flagSculpt` + 31 `scbLayersSVG` | THE designer (Studio → Heraldry) | the press page | sculpt bench reused; button row 📜 · 🔒 · Edit · Copy · Delete, delete via DEL76 |
| Crowd fan flags | 27 `drawFanFlags` | a small Vexillum held up | the fill/stroke fallback | canvas draws the cached image |
| Arena tapestries | 192 `ar91FlagSrc`, `ar91DecoPaint` | Velarium of the section's house | the studs + fringe + frame paint | 192 deco cache key = design hash; still skewed into the iso stands |
| Wall banners + drape | 192 `ar91Banner`, `ar91Drape` | Vexillum · arena system designs (XII / S / IV, FR drape) | both painters | locked |
| Domus rank pennants | 252 `dr98URI`, `dr98Chip`, `DR_SYM98`, 111 `DRANKS98` | Flammula · 8 locked system designs = the quality bar; house parma on the crossbar from Ludus Magnus (1a) | dr98URI body | server data untouched; dr98Chip keeps its name |
| Region flags | 252 `rg98Flag`, 111 `REGIONS98` | Vexillum · 7 locked system designs | the flagURI call + RG98_CACHE | server data untouched |
| Online Domus crest | 175 `d89Crest`, `d89Banner`, `d89Look`, 111 `CREST89` | the Domus design: Parma (chips) + Scutum (banner card) | d89Crest body | server `cleanLook89` accepts the new optional fields (pattern, inscription, trim, wear; no sculpt — 4a) → server deploy |
| Ludus room pennants | 145 `roomScene73` wrapper (~121) | Signum pair + Vexillum from the house design | the hand-drawn `<path>` pennants | banner73 scene layout kept |
| Manager portrait backdrops | 17 `gLook` (`bg:'flag:'+city`), 192 charEditor `banner91` | Vexillum cloth, no frame, behind the bust | — | face99 / R99 cache unchanged |
| Flavius's box pennant | 16-crowd `drawFlavius` | Flammula · locked system design (Q3) | the box's pennant paint | portrait + moods unchanged |
| **Language flags** | 190 `flag91`, `FLAG91` | **stays separate** | — | real country flags, never heraldry |

## What stays separate
- Language flags (flag91) — real flags, not editable, never in the designer.
- Rank streamers, region vexilla, city / empire vexilla, the arena's wall cloths, Flavius's box — locked SYSTEM designs ("Copy & edit" only) made with
  the same engine; the server keeps owning DRANKS98 / REGIONS98.

## Save compatibility
- `customFlags` rows (`{id,name,bg,fg,txt,shape,layers,baked,v}`) open in the new designer unchanged: a read-time adapter (no Store rewrite on load),
  saved as v2 only when the player saves. Missing fields = today's look (plain pattern, gilded edge, wear 0).
- `m.flag` in Manager worlds: same adapter; no SAVE_MIGRATIONS entry needed (optional '1.00' stamp only).
- `banner91 = 'flag:<key>'` / `'flag:c:<id>'` keys unchanged (flagURIk resolves them through the new engine).
- Online `look89 {c1,c2,crest}` stays valid (crest → emb); the new optional fields only after a server deploy. Old pages ignore them.
- SAVE_COLS already holds customFlags; no new collection.

## Open questions (in the mock, §6)
Q1 name (Heraldry / Signa / Insignia) · Q2 the chip (parma / scutum / vexillum) · Q3 Flavius's box pennant · Q4 signum topper · Q5 tabula ansata
material · Q6 velarium stripes.
