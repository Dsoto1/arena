# One Banner Press (v1.0 mock) — notes

Mock: `banner.html` (engine `banner_engine.js`, Today samples `banner_today_data.js` + `banner_today/arena.png` from `banner_today.js`
against the built game over http — file:// taints the canvas). Shots: `node tools/plans/mock100/banner_shot.js` → `banner_1440*.png`, `banner_390*.png`.

## The model
ONE heraldry object, five KINDS (shape + frame only):

| Kind | Shape / frame | Motto | Typical use |
|---|---|---|---|
| Flag | waving rectangle on a pole (finial, fly fringe, cord tassel) | under the device | masthead, square poles, fan flags, region/city/empire |
| Banner | vertical, swallow-tail or straight + fringe, crossbar | on a band | ludus room, gate poles, arena wall banners |
| Pennant | the dr98 cut (swallow-tail, gold bar + finials, tier tassels / red band) | never | Domus ranks, Play Now seat, Studio |
| Tapestry | wide, rod, woven meander border, fringe, tassels | along the border | the stands (192 deco layer) |
| Crest | heater shield, bevel light, inner line, motto scroll | on the scroll | chips: league table, records, room lists |

Layers (same for every kind, all in flagURI's 600×340 "charge space", so old devices and sculpt layers line up unchanged):
cloth (c1, c2, division: plain · pale · fess · quarterly · chevron · bordure · saltire) → device (FLAG_SHAPES + DR_SYM98 symbols) →
sculpt layers (scbLayers, ×6 as today) → motto → texture (weave + noise) → folds → weathering → edge → trim (gold edge, tassels, fringe, bar/pole, red top band).
Small sizes (< 44 px): no texture, motto or sculpt; thicker edge. Cache key = design hash + kind + px.

Suggested data: `{v:2, c1, c2, fg, div, dev, motto, layers, baked, trim:{gold,tassels,fringe,bar,topbar}, wear, tail}`; old `{bg,fg,txt,shape}`
maps bg→c1, fg→fg (and c2), txt→motto, shape→dev, div 'plain'. One function `heraldry(design, kind, px)` → data URI / cached Image.

## Today's systems → the one press

| Today | Where | Becomes | Replaces | Stays / note |
|---|---|---|---|---|
| Empire + city banners | 12-settings `flagURI`, `flagSVG`, `flagURIk`, `FLAGS`, `CITY_FLAG`, 27 `EMPIRE_FLAG` | Flag · 15 locked system designs | flagURI's body (keep the name as a shim → heraldry(...,'flag')) | `flagBG` page backdrop, `bg:'flag:<k>'` portrait keys keep working |
| Manager house flags | 27 `mgrFlagOf`, `houseFlagURI`, `flagChip`, `flagImg`, `flagSpread`, `flagPickerHTML` | the house heraldry (`m.flag`) | houseFlagURI/flagChip/flagImg bodies | rivals still derived from id + city (FLAG_PALS, FLAG_SHAPES12) so nobody's banner changes; chips become Crest |
| Family banners | 27 `famFlagOf`, `famFlagChip` | derived heraldry → Crest chip | famFlagChip body | kin share it |
| Studio Banner press | 27 `flagStudioHTML`, `blankFlag`, `flagStudioClick/Input`, `flagSculpt` + 31 `scbLayersSVG` | THE designer (Studio → Banners & heraldry) | the press page | sculpt bench reused as is; button row 📜 · 🔒 · Edit · Copy · Delete, delete via DEL76 |
| Crowd fan flags | 27 `drawFanFlags` | Flag at LOD size | the fill/stroke fallback | canvas draws the cached image |
| Arena tapestries | 192 `ar91FlagSrc`, `ar91DecoPaint` | Tapestry of the section's house (Manager / Studio banner91 / Domus) | the studs + fringe + frame paint around flagURI | 192 deco cache key = design hash; still drawn skewed in the iso stands |
| Wall banners + drape | 192 `ar91Banner`, `ar91Drape` | Banner · arena system designs (XII / S / IV, FR drape) | both painters | locked; canvas blits the image |
| Domus rank pennants | 252 `dr98URI`, `dr98Chip`, `DR_SYM98`, 111 `DRANKS98` | Pennant · 8 locked system designs = the quality bar | dr98URI body | server data untouched; dr98Chip keeps its name |
| Region flags | 252 `rg98Flag`, 111 `REGIONS98` | Flag · 7 locked system designs | the flagURI call + RG98_CACHE | server data untouched |
| Online Domus crest | 175 `d89Crest`, `d89Banner`, `d89Look`, 111 `CREST89` | the Domus heraldry: Crest (banner card) + top of the rank pennant (Q1) | d89Crest body | server `cleanLook89` accepts the optional new fields (Q4) — needs a server deploy |
| Ludus room pennants | 145 `roomScene73` wrapper (line ~121) | Banner pair + Flag from the house heraldry | the hand-drawn `<path>` pennants | banner73 scene layout kept |
| Manager portrait backdrops | 17 `gLook` (`bg:'flag:'+city`), 192 charEditor `banner91` | Flag cloth, no frame, behind the bust | — | face99 / R99 cache unchanged |
| Flavius's box banner | 16-crowd (the FLAVIUS pennant over the box) | (optional) Pennant system design | — | not asked; left as is unless he wants it |
| **Language flags** | 190 `flag91`, `FLAG91` | **stays separate** | — | real country flags, never heraldry |

## What stays separate
- Language flags (flag91) — real flags, not editable, never in the designer.
- Online rank pennants and region flags — fixed SYSTEM designs (locked, "Copy & edit" only) made with the same engine; the server keeps owning DRANKS98 / REGIONS98.
- City / empire banners and the arena's wall banners — locked system designs.

## Save compatibility
- `customFlags` rows (`{id,name,bg,fg,txt,shape,layers,baked,v}`) open in the new designer unchanged: read-time adapter (no Store rewrite on load),
  saved as v2 only when the player saves. Missing fields = today's look (plain division, no trim beyond the default gold edge, wear 0).
- `m.flag` in Manager worlds: same adapter; no SAVE_MIGRATIONS entry needed (optional '1.00' entry only if we want to stamp v:2).
- `banner91 = 'flag:<key>'` / `'flag:c:<id>'` keys unchanged (flagURIk resolves them through the new engine).
- Online `look89 {c1,c2,crest}` stays valid; new optional fields only after a server deploy (Q4). Old pages ignore them.
- SAVE_COLS already holds customFlags; no new collection.

## Open questions (in the mock, §6)
Q1 rank pennant + house crest · Q2 solid vs watermark device · Q3 who ages a banner · Q4 how much heraldry online · Q5 language flags · Q6 rail name.
