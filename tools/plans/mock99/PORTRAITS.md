# Faces in Flavius Rule Arena: inventory and ONE-FACE consolidation plan (v0.99 proposal)

Mock-ups only, no game code changed. Prototype: `face99.js` (one painter + polish), runner `portraits.js` →
`portraits.html`, `portrait_before_after.png` (1440 px), `portrait_before_after_390.png`, `costs.json`.

His rule (2026-10-08): **every face shares ONE core face.** One spec, one painter, one designer component. There are no
separate face systems for online, Manager, Annals, spectators or advisors. Flavius and the sponsors keep their own painted art.

---

## 1. Inventory: every face format, painter and designer in the code

### 1a. Face DATA formats

| # | Format (shape) | Stored in | Records |
|---|---|---|---|
| A | **portrait object**: `{skin,hair,eyes,helm,hs,bs,beard,long,fem,smile,scar,paint,mark,garb,ear,neck,face,bg}` + a separate accent `color`. Legacy booleans `beard`/`long`/`scar`/`paint` sit beside the newer `bs`/`hs`/`mark`. | Studio `customChars[].portrait` · `customLanistas[].portrait` (61-studio53) · Manager `w.mgrs[].portrait` (17-manager newWorld, `NEWMGR.portrait`) · Manager gladiators `g.look` (lazily from `gladPortrait(id,cls)` in `gLook`, 17-manager:161, then saved in the world) · Ludus Flavius `gladiators` records + Hall/Annals rows (10-meta rcard `r.portrait`) · online `char.look.portrait` (flat, `cleanLook` ≤40 keys, strings ≤40, whole look ≤3 KB, 111-onlcore:130) · Play Now seats / custom classes (`CLASSES[cc_*].portrait`) | one per Studio character, lanista, Manager house (×12 a world), Manager fighter (dozens to hundreds a world), Ludus/Hall record, online gladiator (≤4 a house) |
| B | **spectator look**: `{skin,hair,long,fem,beard,hat,tunic,robe,city}`, where `hat` is one of pileus/straw/hood/wreath/veil/helm/turban | crowd regulars `CROWD_CACHE` (Store `crowd`), the Studio's custom spectators, generated CPU crowd (16-crowd) · council advisors `w.council83[].face` (131-v83council `council83Make`, fixed per career) · online PATRON `domus.patron` (127-v82onl `onlPatronDef82`/`cleanPatron` ≤16 keys ≤1 KB, + cushion) · city residents (18-world, 25-city) | crowd ~200 regulars a browser; 6 advisors a career; 1 patron a house |
| C | **beast face** `F={species,c1,c2,eyes,eyeT,horns,mane,fangs,pattern,scar,gear,bg}` + token-round spec `{ring,bg,glyph,base,layers}` | `customNpcs[].face` / `.token` (49-studio47, 43-beasts) | one per Studio beast |
| D | **sponsor look** (SP91 parts: head, beard, robe, trim, gem, …) | `customSponsors`, city editors (188-v91sponsor) | **out of scope**: his painted look |
| E | **sculpted token spec** (31-sculpt / 176 sc3d) | `customTokens`, `c.token`; derived from A by `autoTokenForChar(c)` (20-tokens:283); online `sc82Spec(cls, look)` (128-v82stands:199) reads `look.token` + `look.portrait` | one per token |
| F | **3D token parts** `t93Parts(c)` → `c.tok93={pose,parts,sheet…}` (222-v93token:50, reads A + `c.arm`); online pictures `ch.tok94` (226) | per character |
| G | hot-seat profiles: colour + name only (51-v49 `flavius_hs`) | **out of scope** (his word) |

### 1b. Painters (where faces are drawn)

| Painter | File · function | Draws | Shown in |
|---|---|---|---|
| Bust portrait (SVG 100×140) | 15-custom `portraitSVG` + 58-looks wrapper (extra garb/neck/hair/beards/marks/helms) + 44-studio wrapper (draft banner bg) | format A | `portraitHTML` (sizes xs 26 · sm 54 · md 110 · lg 170 · xl 250 px): Studio character + lanista designers, Manager new career, `mgrPortrait` (houses, League, Annals, trophies), **Manager gladiators** `gArt` (roster, yard, ward, recruiting, Match Week, Armory… ~20 modules), Ludus/Hall cards (10-meta), `pArt`/`classArt` (custom classes), online `onl80Face`/`onlPortraitOf` (116/121/124/146), the online creator preview (116 `data-onlgp`), stands seat cards (128) |
| Spectator face (SVG 24×24 drawn at 20 px) | 16-crowd `specFaceSVG` + `SPEC_HATS` | format B | stands lists, Studio Spectators (15-custom), city residents (18-world, 25-city, 181), market stalls (07-ui), **council** `face83` (131) at any size, **patron** `onlPatronFace82` (127) |
| Crowd figures on the board (canvas) | 193-v91crowd `paint91`/`sprite91` (`look91` reads `sp.look`); 16-crowd stands | format B | the stands around the arena (draw-cost budget!) |
| Beast face (SVG 100×100) | 49-studio47 `beastFaceSVG`, `rtokFaceSVG`; token round 43-beasts `rtokSVG` | format C | Bestiary, Field tab, beast designer, hover cards |
| Sponsors (canvas, painted) | 167-v89moods `sponFace89`, 188 `sp91Paint`/`sp91Portrait` | D | Flavius's box: **stays separate** |
| Flavius | 16-crowd `flavFace` / `flavFaceURL` (his painted face, 11 moods) | — | **stays separate** |
| Board tokens | 20-tokens `figureHTML`/`autoTokenForChar`, 176 `sc3dSVG`, 222 `drawFigureTok` | E / F | the sand, seat cards, panels |

### 1c. Face designer UIs (four separate ones today)

| Designer | File | Format |
|---|---|---|
| Studio Character designer | 15-custom `charEditorHTML` + 58-looks controls | A |
| Studio Lanista designer | 61-studio53 `lanistaStudioHTML` → `portraitControlsHTML` (58) | A |
| Manager new career | 17-manager `startHTML` (MGR.view 'create') + 58-looks wrapper (`data-nmpt`) | A |
| Online creator / My Gladiators | 116-onl79 (`data-onlgp`, own `onlSel` controls), Domus 175 | A (flat) |
| Studio Spectators face maker | 15-custom (spect tab, ~line 411) | B |
| Online patron | 127-v82onl (patron fold on the Domus) | B |
| Council advisors | generated only (`council83Make`) | B |
| Beast designer | 49-studio47 | C |

The result: two human-face systems (A and B) with **three separate controls for A** and two for B, plus a beast system.
This is why a spectator, an advisor or a patron can never look like the same person as a gladiator.

---

## 2. Proposal: one spec, one painter, one designer

### 2a. ONE face spec: `FACE1` (flat, so it fits every online limit unchanged)

Format A becomes the spec, normalised and extended with what B needs:

```
{ v:1, skin, hair, eyes, hs, bs, fem, smile, mark, helm, garb, tunic, robe, ear, neck, face, bg, color }
```
- `hs` / `bs` / `mark` replace the legacy booleans (`long`→hs 'long', `beard`→bs 'full', `scar`/`paint`→mark).
- `helm` gains the spectator hats: pileus, straw (new), hood, veil, turban, wreath→laurel, helm→galea.
- `garb` gains **'mantle'**, which draws `tunic` + `robe` colours. This is the spectator / advisor / patron dress.
- `color` = the accent: class colour for gladiators, house colour for lanistas, the mantle colour for the crowd.
- The spec is flat, with ≤18 keys, keys ≤16 chars, strings ≤40 and ~300 B as JSON. It fits `cleanLook` (≤40 keys, 3 KB) and
  `cleanPatron` (≤16 keys, 1 KB, so drop `v`/`bg` for patrons) with **no server change**.

### 2b. ONE painter: `face99(spec, {frame, size, polish})` (prototype in face99.js)
- Geometry = today's `portraitSVG` (+ the 58-looks parts), so every existing character keeps exactly its shapes, pose,
  proportions, silhouette and palette.
- Frames are crops of the same bust: `bust` 100×140 (portraits), `chip` (spectators, advisors, patrons, stands lists),
  `head` (≤24 px chips), and later `round` (a token-round medallion of the face).
- **Polish passes** (`polish99`): plain SVG gradients and clip paths, no filters, light from the upper left as in the arena:
  - shaded face planes and a warm form shadow on the far side
  - soft occlusion under the brows, the nose, the lower lip and the jaw (on the neck)
  - cheek warmth and a lit nose bridge
  - eyelid lines and catchlights (skipped behind closed helms and eyepatches)
  - hair sheen + strand groups in the hair's own light/dark
  - beard strands + a shaded underside
  - helm specular streak + shaded underside
  - cloth light/shade + two folds + a rim of light on the lit shoulder
  - a cast shadow on the backdrop and a vignette
  - optional paper grain (`feTurbulence`) at large sizes only

  Face passes sit UNDER the hair, eyes and mouth (inserted after the skin ellipse), so features stay crisp.
- Adapters: `fromSpect99(look)` (format B → FACE1, in the prototype), `faceNorm(p)` (format A legacy → FACE1, to build).
- Beasts are not people: `beastPolish99(tokenSVG, F)` gives the beast token round the same light: a head shaded by its
  species outline, fur strands on the lit edge, a contact shadow, a recessed field and a rim glint. The beast face designer stays.

### 2c. ONE designer component: `faceDesigner(spec, {fields, onChange})`
- Sections: **Face** (skin, hair, hairstyle, beard, eyes, expression, marks, face, build) · **Garb & jewellery** (headwear incl. hats,
  garb incl. mantle + its two colours, earring, neck) · **Colours** (backdrop/banner, accent) · 🎲 Random look · live preview.
- `fields:'crowd'` hides gladiator-only items (helmets, armour garb) for spectators and patrons. The fields stay the same and the order stays the same.
- Used by: Studio Character designer (the **Appearance** tab of mock_char_look.png), Studio Lanista designer, Manager new career
  (the **Portrait & colours** tab of mock_lanista_look.png), Studio Spectators, online creator / My Gladiators, online patron.
  Advisors are generated straight into FACE1. The 375-point ratings, class and tokens stay in their own tabs.

### 2d. Tokens derive from the same spec
`autoTokenForChar`, online `sc82Spec` and 3D `t93Parts` all read skin / hair / hs / bs / fem / helm / color from the portrait today. They
switch to one adapter `faceToTokenParts(FACE1)`, so a spectator or patron can also get a sculpted / 3D figure. The crowd canvas
(193 `look91`) reads FACE1 through the same adapter. It keeps its cached sprites and draw budget, with no SVG on the board.

---

## 3. Migration per old format

| Format | How | Saved |
|---|---|---|
| A (chars, lanistas, Manager houses + fighters, Ludus/Hall, online look.portrait) | FACE1 is a superset → `faceNorm` reads legacy booleans at draw time (no rewrite needed); a record gets `v:1` + normalised keys the next time it is saved anyway | lazily, never on load (keeps the "conversions idempotent, saved once" rule) |
| A, Manager gladiators | `gladPortrait` returns FACE1; existing `g.look` are read through `faceNorm` | `SAVE_MIGRATIONS['0.99']` only tags `v` |
| B, crowd regulars (Store `crowd`) + Studio spectators | `fromSpect99` once per collection; keep old keys too for one version (older pages still read them) | once, marker `crowd99` |
| B, council `w.council83[].face` | convert in `council83Ensure` (`SAVE_MIGRATIONS['0.99']`, `_dirty` flag, saved once in openManager) | once |
| B, online patron `domus.patron` | client converts on Domus open and re-sends via `domus.patron` (flat keys pass `cleanPatron` as is); old keys kept beside the new (≤16 total: skin, hair, hs, bs, fem, helm, garb, tunic, robe, eyes, smile + cushion = 12) | per house, once; server untouched |
| A online `look.portrait` | already flat; `cleanLook` accepts new keys (`[a-zA-Z0-9_]{1,16}`, strings ≤40) | none; works with the deployed server |
| C beasts | unchanged format; only the polish pass | none |
| D sponsors, Flavius | **separate** (his painted art) | none |
| G hot seat | colour chips, no faces | none |

---

## 4. Phases

1. **Core**: `faceNorm` + `face99` with `polish:'off'`. `portraitSVG` / `specFaceSVG` become thin wrappers. A pixel test proves
   portraits are identical with polish off (like tv93l). Spectators change look (bust crop) → screenshots for his ok.
2. **Polish on** + a bitmap cache (see costs) + size tiers. Settings → Board & pieces "Portrait detail: Full / Light / Off" (the
   VISUAL POLISH RULE asks for an Off path).
3. **Designer component** + Character designer tabs (mock_char_*.png) + Lanista designer + Manager new career (mock_lanista_*.png) +
   Studio Spectators.
4. **Crowd, council, patron** on FACE1 (migrations above); the board crowd reads it through the token adapter.
5. **Tokens from the spec** (`faceToTokenParts`); online creator + patron editor on the shared component.

## 5. Costs measured (headless Chromium, `portraits.js`, two runs on a loaded machine, load 8–14)

| | today | polished |
|---|---|---|
| bust: build SVG string | 0.003–0.004 ms | 0.04–0.06 ms (grain ≈ same) |
| bust: SVG size | 1.36 KB | 7.9 KB (grain 8.2 KB) |
| bust 170×238: insert + layout + paint, per face | 0.83–1.0 ms | 2.0–2.6 ms (grain 1.7–1.9, noise) |
| bust 54×76 (roster rows): per face | 0.48–0.79 ms | 1.9–4.3 ms |
| spectator chip: build | ~0.001 ms | 0.03–0.04 ms |
| spectator chip: size | 0.75 KB | 7.6 KB |
| spectator 20 px: per face | 0.23–0.25 ms | 1.7–3.4 ms (one face **without** polish 0.35–0.62 ms) |
| beast token: size | 3.9 KB | 6.6 KB |
| beast 28 px: per token | 0.85–1.6 ms | 1.3–3.7 ms |

Reading:
- Building the string is negligible.
- **Rasterising costs 2–4× (up to ~8× at 20 px)** because of the extra clip paths and gradients, and lists show hundreds of faces.
  Mitigations for phase 2:
  - **(a)** a rasterised cache: each (spec hash, frame, px) drawn once into an `<img>` blob, like 230-v95perf's cut-outs, so lists cost
    the same as any small image.
  - **(b)** tiers: ≤32 px = one face with no polish or a 2-gradient lite pass (detail is invisible there); ≥54 px = full; grain only ≥150 px.
  - **(c)** never on the board canvas: the crowd keeps its sprites.

**Risks and checks:**
- **Saves:** the format change is lazy, so no destructive rewrite is needed. Keep the old keys one version for older pages (109 newer-version guard).
- **Online:**
  - `look.portrait` and patron stay flat and inside the 3 KB / 1 KB limits, so there is no server deploy.
  - The other screens' painter must accept both formats during the transition.
- **Performance:** the measurements above, plus tv92p soak/idle and tv91r draw time.
- **Phones:** check the 390 px designers.
- **Tests to touch:**
  - looks: `tlook`, `t53s`
  - lanista / Manager: `tstat55`, `tmgr*`
  - council, online and tokens: `tv83c`, `tv82o`, `tonl79`, `tv93k`
  - perf, i18n and the Studio: `tv92p`, `tv87l`/`tv86` walks, `tv98b` (designer tabs; st98Apply would be replaced for the character designer)

---

## 6. STRONG polish pass (his note: the first pass was too subtle)

Prototype `face99b.js` (copy of the face99 approach, same spec, same `portraitSVG` geometry, palette and silhouette), runner
`strong.js` → `portrait_strong.png` (4 lanistas, 4 Studio characters, 4 Manager gladiators, 3 spectators, 3 advisors, 3 beast
rounds; columns ORIGINAL · FIRST PASS · STRONG painterly · STRONG inked, each at 240 + 64 + 28 px), `portrait_strong_small.png`
(64/28 only), `costs_strong.json`. `portrait_strong.html` is regenerated by the runner (5 MB, not committed).

**How:** the finished SVG is parsed (DOMParser) and every shape is classed by its own fill colour (skin, hair, cloth, metal, gold, fur,
leather, leaf, straw). Each class gets a material, then detail. No shape is moved or reshaped.

| Technique | Adds |
|---|---|
| volume gradient per shape (radial key from the upper left; red-shifted skin shadow, cool-purple cloth shadow) | every flat fill becomes a form; mid-tone = the original colour |
| cool rim from behind right (the shape's own outline shifted, gradient-stroked, clipped to the shape) | separation from the backdrop, back light |
| warm reflected light on the jaw underside (accent tint) | bounce from the tunic |
| cast shadows = offset copies of the shapes above, clipped to what they fall on | ambient occlusion where shapes meet: hair/helm on the brow, head on the neck, neck/beard on the chest, pads on a muzzle |
| face planes (clipped to face + ears): forehead and brow-ridge light, temple shade, eye sockets, cheekbone light + hollows, nose bridge / side plane / tip / wings / nostrils / underside, philtrum, nasolabial, two-tone lips + lower-lip highlight + shadow under it, chin, jaw | the face reads as a modelled head, same features |
| eyes: iris (eye colour, dark eyes get a brown iris), pupil, two catchlights, upper lid line, crease, lit lower lid; milky / patched eyes respected | life in the eyes |
| ears: helix, fold, concha, lobe light, occlusion against the head | anatomy |
| neck: cylinder shading, muscles, collar occlusion | depth under the jaw |
| hair / beard / fur: base mass shading + 3 strand groups (dark, mid, lit) along a flow from the crown (beard: down from the mouth) + sheen band + flyaways off the real top contour | refined hair, beard texture |
| metal / gold: specular band gradient (sky, horizon, ground), bevel (lit inner edge + dark offset), streak + glint on domes | helmets, jewellery read as metal |
| cloth: matte gradient, two folds (shadow + light pair), canvas texture; headgear cloth gets weave instead of folds | material definition |
| leather straps: drop shadow, highlight, stitching | the baldric |
| backdrop: painterly radial gradient, three brush strokes, canvas grain; accent halo kept as a soft disc; the figure's shadow on it | painterly depth behind the bust |
| skin pores (cached pattern), canvas grain (cached pattern) | tasteful texture at ≥120 px |
| **inked** variant: ink contours on silhouette shapes, cel steps instead of soft gradients, a cel shadow crescent + light hatching on the far cheek, no textures | a cleaner comic/illustration look |

**Beast rounds** (`beast99b`): bronze ring with a specular sweep, rivet glints, a recessed field (shadow on the upper-left wall, lit lower
lip), domed glaze; the face: fur volumes + dense short fur strands, mane strands, muzzle modelling (bridge light, eye sockets, cheek
shade, pads casting onto the head, whisker spots), wet-nose highlight, eye iris gradient + lid shadow + star glint, ivory fangs, the
head's shadow on its ground.

**Size tiers** (by output px): ≥120 full · 48–119 no textures / flyaways, ~⅓ of the strands · <48 lite (volumes, one rim, one cast
shadow, a catchlight). At 28 px the strong pass reads like the original with depth; at 64 px detail shows.

**Cost per face** (headless Chromium, insert + layout + paint, median of 5; build = string → string):

| | 240 px | 64 px | 28 px |
|---|---|---|---|
| bust original | 1.4 ms · 1.4 KB | 0.42 ms | 0.36 ms |
| bust first pass | 2.1 ms · 8 KB | 1.3 ms | 1.3 ms |
| bust strong painterly | 4.2 ms · 24 KB (build 2.5 ms) | 3.6 ms · 22 KB | 2.1 ms · 10 KB |
| bust strong inked | 3.5 ms · 22 KB | 3.4 ms | 2.1 ms |
| woman bust strong | 4.2 ms · 30 KB (build 3.1 ms) | 4.0 ms | 2.3 ms |
| spectator chip strong | 4.1 ms · 24 KB | 3.6 ms | 2.3 ms · 10 KB |
| beast round strong | 3.6 ms · 37 KB (build 3.5 ms) | 2.8 ms | 1.8 ms · 11 KB |

Reading: 2.5–3× the original at 240 px, 5–9× in small lists. The build (DOMParser + serializer) is 1.5–3.5 ms in the prototype; a
production painter would emit the same markup as strings (~0.1 ms). **Needed for the game:** the raster cache of §5 (each spec hash ×
size drawn once to a bitmap), so lists cost the same as any small image; the 64-px tier should also drop the strands (most of its KB).
