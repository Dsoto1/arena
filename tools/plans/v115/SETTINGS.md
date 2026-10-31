# v1.15 candidate — SETTINGS REORGANISATION (audit + proposal, mock-up only)

Source: tools/plans/backlog.md "SETTINGS REORGANISATION" (his idea 2026-10-20, while answering the v1.08 Lighting wording).
Status: **mock-up + audit, nothing built.** Per CLAUDE.md §1, nothing is built until he answers the questions at the end.

- Mock-up: `tools/plans/v115/settings-mock.html` (OLD v1.14b and NEW side by side, tabs clickable, "New at 390 px" view; markers ↪ moved ·
  ✎ renamed · ⊕ merged · ✓ text fixed · ✕ removed · ＋ new tab).
- Screenshots (gitignored, local only): `tools/plans/v115/shots/settings_{desk,phone}_<tab>[_end].png` = the REAL window today (1440×900 and
  390×844); `mock_both_<tab>.png`, `mock_phone_<tab>.png` = the mock-up.
- Audited on the built page (`sh build.sh` → SYNTAX_OK) by opening Settings with Playwright and reading every row of every tab, then matched
  to the modules that build them.

## 1. How the window is built today (why moving rows is cheap)

`12-settings` `settingsHTML(tab)` still builds the old tabbed HTML (general · themes · tokens · sponsors · audio · saves · visuals); 18 later
modules wrap it (82, 94, 103, 106, 107, 138, 142, 149, 159, 186, 190, 191, 216, 396 …). Since v0.98, `246-v98ui` builds each full-screen PAGE
from that finished HTML (`set98General / set98Help / set98Pieces / set98Themes / set98Audio / set98Access` + `set98Frame` for the rail) by
**lifting each control out with its attributes** — so every handler (12's `box.onchange/onclick`, 142, 159, 186, 190, 216 …) and every
`SETTINGS` key keeps working. Later rows are added by wrapping `set98Pieces` (263 face99, 277 hit100, 321 bases101, 399/417 Quality+Lighting,
422 P3 note) or `set98General` (288 frame meter). Old tab keys map through `SET98_MAP` (tokens/sponsors → pieces, profiles → themes,
visuals → general). A reorganisation = one new module that re-sorts the finished cards/rows of the pages (or new `set98*` page builders that
lift the same controls) + `SET98_PAGES`/`SET98_MAP` entries. **No key, handler or stored value changes.**

## 2. Audit — every row the window shows (v1.14b) and where it goes

Tabs today (rail `data-stab`): PLAY: General `general` · Hints & board `help` — LOOK: Board & pieces `pieces` · Themes `themes` —
SOUND & ACCESS: Audio `audio` · Accessibility `access`. Header: ↺ Restore all defaults. Footer: link to 💾 Saves.

Legend: **key** = where the value lives (`S.x` = `SETTINGS.x` in localStorage `flavius_settings`, also covered by 422's checked save +
cookie `flavius_set111`; `ls:` = its own localStorage key; `TH.x` = theme `flavius_theme`). **Shows** = only in some cases.

| # | Old tab → card | Label old → NEW | Key | Module(s) | Shows | New tab → card | Tests that select it |
|---|---|---|---|---|---|---|---|
| 1 | General (top) | Language | ls:`flavius_lang` (`data-ldd98`, items `data-lang91`) | 142, 148, 190, 246 | always | Play (top) — desc shortened | tv86, tv89j, tv98a |
| 2 | General → Gameplay | CPU speed | `SPEED` + ls:`flavius_speed111` (`data-sspeed`) | 12, 159, 424 | always (Pause/Step only matter in a match) | Play → Pace — desc says it is remembered (v1.11c) | tv88s, tv111sp |
| 3 | General → Gameplay | Animations Full/Quick/Off | S.`anim88` (`data-anim88`) | 159 | always | Play → Pace | tv88p, tv88s, tv98a, tv111set |
| 4 | General → Gameplay | Confirm before End turn | S.`confirmEnd` | 142 | always | Play → Turns | tv84u, tv88s, tv98a (+ gameplay tests that set the key directly: tv104h tv105a tv105aa tv105l tv106e tv106f tv96k tv99k — unaffected) |
| 5 | General → Gameplay | Follow camera | S.`cam88` | 159 | always | Play → Camera | tv88s, tv98a (flip loop) |
| 6 | General → Gameplay | Event briefing | S.`briefing` | 12, 159 | always | Play → Turns | tv98a (flip loop) |
| 7 | General → Gameplay | Context menus | S.`ctxMenu` | 12, 159 | always | Play → Turns | tv98a (flip loop) |
| 8 | General → Gameplay | "⚔ Confirm attacks ⓘ" → **Confirm attacks** | S.`confirmAtk106` | 396 | **offline only** (hidden in an Online match) | Play → Turns — **FIX: today it is injected by 396 into the finished page as a raw old-style checkbox row (`label.setrow`) with its description in a tooltip; restyle as a normal switch row** | tv106d (`settingsHTML('general')` regex — stays true) |
| 9 | General → Gameplay | Famous visitors | S.`famous` | 12 | always | Crowd & voices → Voices | tv98a (flip loop) |
| 10 | General (own row) | 🐞 Error log [Open (n)] | `ERR92` (`data-err92o`) | 216 | always | **Data & saves** → Help us fix it | trng92 (`[data-err92o]`, opens `general`) |
| 11 | General → Performance | Show frame meter | S.`fps100` | 288 (set98General wrapper) | always | Graphics → Quality | tv100fps (`#setBody input[data-set="fps100"]` after `openSettings()` — needs the Graphics page) |
| 12 | Hints & board → Hints & help | Hints — master switch (H) | S.`hints` | 12, 149, 246 | always; never in Ranked | Hints → Hints & help | tv98a, tlive36, tv87x |
| 13–17 | Hints & board → Hints & help | 🧭 Strategy panel · 📖 Rule popups · ✨ Turn hints · 📜 Rule hints · 📰 Turn recap | S.`hintDock` `rulePops` `turnHints` `ruleHints` `turnRecap` | 12, 149 | greyed while the master is off | Hints → Hints & help (unchanged) | tv98a, tv87x |
| 18 | Hints & board → On the board | Floating combat numbers → **merged into Hit feedback "Off"** (Q4) | S.`fx` | 12, 55-anim, 227, 277 | always | Hints → On the board | tv98a (flip loop) |
| 19 | Hints & board → On the board | Card reveals | S.`reveals` | 12 | always | Hints → On the board | tv98a |
| 20 | Hints & board → On the board | Log on the arena | S.`capFeed` | 12 | always | Hints → On the board (desc names the 📌 button) | tv98a |
| 21 | Hints & board → On the board | Screen shake on big hits | S.`shake` | 12 | always | **Accessibility** → Reading & motion | tv98a |
| 22 | Hints & board → On the board | Blood & severed limbs | S.`gore` | 12 | always | **Graphics** → Pieces | tv98a |
| 23 | Hints & board → On the board | See-through auto/on/off → **Auto / On / Off** | S.`xray` (`data-sxray`) | 12 | always | **Play** → Camera — **FIX: button labels are raw lower-case `${v}`, never translated** | tv88s, tv98a (`go('help')` → must go to `general`), tv111set |
| 24 | Hints & board → On the board | Hot seat: turn the board | S.`hsTurn90` | 186 | always (also on Play Now's hot-seat card `data-pn100hst`) | **Play** → Turns | tv90b (`settingsHTML('help')` regex → `general`), tv98a, tv100pn |
| 25 | Hints & board → Voices & bubbles | Spectator shouts | S.`shoutsSpect` | 12 | always | **Crowd & voices** → Voices | tv98a |
| 26 | Hints & board → Voices & bubbles | The editor in the box → **Editor reacts** | S.`flavius` (also hides the box portrait/podium: 93, 192, 303) | 12 | always | **Crowd & voices** → Editors in the box (merged card with #31) | tv98a |
| 27 | Hints & board → Voices & bubbles | CPU thought bubbles | S.`thoughts` | 12 | always | Crowd & voices → Voices | tv98a |
| 28 | Hints & board → Voices & bubbles | City-square chatter | S.`cityChatter` | 12 | always (only matters in Manager) | Crowd & voices → Voices | tv98a |
| 29 | Board & pieces → Quality | Quality Auto/High/Medium/Low | S.`quality110` (`data-q110`), migration `q110v`, drives `lite84` | 417, 422 | always | Graphics → Quality | tv110a, tv111set, tv114h, tv98a |
| 30 | Board & pieces → Quality | Lighting By quality/Full/Light/Off | S.`light106` + ls:`flavius_light106`, `#l111now` | 399, 409, 417, 422 | hidden with kill switch `flavius_light106off` | Graphics → Quality — **desc rewritten to name the v1.08 torchlight** | tv106l, tv110a, tv111set |
| 31 | Board & pieces → Editors in the box | 12 city selects + "n / 12 cities won" | `SPON.map` (`sponSave`, `data-spcity`) | 24-sponsors, 246, 400 (`s98-edpair`) | card only if the sponsor list builds; EDITOR12 cheat unlocks every editor | **Crowd & voices** → Editors in the box | tv98a (`.s98-eds select[data-spcity]` on `pieces`) |
| 32 | Board & pieces → Blessings on pillars | Clay pots / Token rounds (picture cards) | S.`pots90` (`data-pots90`) | 186, 246 | always | Graphics → Blessings on pillars | tv90b, tv98a, tv107a |
| 33 | Board & pieces → Blessings on pillars | Floor spikes Iron/Bronze | TH.`spike` (`data-spike98`) | 246, 134 | always | Graphics → Blessings on pillars | tv98a, tv111set |
| 34 | Board & pieces → Portraits | Portrait detail Full/Light/Off | S.`face99` (`data-face99`) | 263 | always | **Graphics → Quality** (its own card goes) | tv99f, tv111set |
| 35 | Board & pieces → Hits | Hit feedback Full/Mine/Quiet (+ Off, Q4) | S.`hit100` (`data-hit100`) | 277 | hidden with `flavius_hit100off` | **Hints** → On the board | tv100h (`set98Pieces(...)` regex — must call the Help builder), tv111set |
| 36 | Board & pieces → Token bases | Show token bases | S.`bases101` | 321 | always | Graphics → Pieces (its own card goes) | tv101e (`set98Pieces(()=>'<div></div>')` — stays on pieces), tv111set (+ 9 tests that set the key directly — unaffected) |
| 37 | Themes | Swatch grid (Themes · Roman · Accessibility · Arenas) | TH.* (`data-preset`) | 12, 142, 246 | always | Themes (unchanged) | tv84u, tv98a |
| 38 | Themes → Tune it | Highlight strength · Outside-zone shade · Board brightness | TH.`hlAlpha` `outZone` `warm` (`data-tr`) | 12 | always | Themes (unchanged) | tv84u, tv98a |
| 39 | Themes → Tune it | Location flavours | S.`locFlavor` | 12 | always | Themes (unchanged) | tv98a |
| 40 | Themes | 💾 Save this look (name, Save, saved looks) | ls:`flavius_profiles` (`data-psave/papply/pdel`) | 12, 142 | always | Themes (unchanged) | tv84u, tv98a |
| 41 | Themes | 🖌 Custom colours (folded) + Reset to default | TH.* (`data-tk`, `data-sreset`) | 12, 142 | always | Themes (unchanged) | tv98a |
| 42 | Audio → Sound | Sound · Arena music · Sound effects · Music between events | S.`audio` (`data-aud`) | 21, 12 | always | Audio (unchanged) | tv88s, tv98a, taud36, taud49 |
| 43 | Audio → Sound | Music volume · Effects volume · Try it | S.`audio.mvol/svol` (`data-audv`, `data-audtry`) | 12, 159 | always | Audio (unchanged) | tv98a |
| 44 | Audio → The music | Theme list (locked folded); MUSIC cheat unlocks all | `#audTracks` | 159, 21 | always | Audio (unchanged) | tv88p, tv98a |
| 45 | Accessibility → Reading & motion | Text size 100/115/130 % | S.`tscale` (`data-ts98`) | 142, 246 | always | Accessibility (unchanged) | tv63, tv84u, tv98a, tv111set |
| 46 | Accessibility → Reading & motion | Reduce motion | S.`calm` | 82 | always | Accessibility (unchanged) | tv98a |
| 47 | Accessibility → Reading & motion | Colour-blind colours (select) | S.`cvdMode` + `cvd` (`data-cvd84`) | 142, 82 | always | Accessibility (unchanged) | tv63, tv84u, tv98a |
| 48 | Accessibility → Reading & motion | Confirm before End turn ("Also in General.") | S.`confirmEnd` | 246 | always | **REMOVED — duplicate of #4** (Q5) | tv84u (checks it on `access`) |
| 49 | Accessibility | Preview · Text sample · Keyboard note (display only) | — | 246 | always | Accessibility (unchanged) | tv98a |
| 50 | Header | ↺ Restore all defaults | `data-rst84` (settings + theme, saves stay) | 142, 246 | always | **Data & saves** → Reset (Q6) | tv84u, tv98a (`.s98-hd [data-rst84]`), tv100sb (its sandstone/carbon slab) |
| 51 | Footer | 💾 Saves link | `data-sv84="hub"` | 142, 246 | always | **Data & saves** → Saves & backups (footer keeps one line "Saved in this browser · changes apply at once") | tb4, tv84u, tv98a (`.s98-foot [data-sv84]`) |
| 52 | (none today) | Settings storage — read-only line, shown only when 422 had to fall back to the cookie | `V111SET` / cookie `flavius_set111` | 422 | only after a refused save | Data & saves → Saves (Q7, optional) | tv111set |

**Keys with no row (left alone, values kept):** `banners`, `emotesSpect` (removed in v0.98), `skipMenu` (removed v0.76, forced off),
`standees`/`tokenStyle`/`mini3d` (pinned to 'figure' by 400 in v1.07), `armorStyle` (v0.84), `lessonsMenu` (v0.84), `lite84` (driven by
Quality since v1.10), `THEME.scale` (the old "Text & UI size" slider, gone since v0.84 — still applied if an old theme carries it; harmless).

**Duplicates / overlaps found:**
- **Confirm before End turn** twice (General + Accessibility "Also in General.") → keep once (Play → Turns).
- **Floating combat numbers (`fx`)** is NOT only numbers: `fx=false` also turns off `animOn()` (55-anim → every board animation, like
  Animations Off), the 277 hit readouts and 238's clean-up crew. Its label hides that. Overlaps Animations Off and Hit feedback → Q4.
- **The editor in the box** (switch, Voices) vs **Editors in the box** (city picks, Board & pieces): same subject in two tabs → one card.
- **Portrait detail**, **Lighting**, **frame meter** are performance levers sitting in three different cards/tabs from Quality → one Quality card.
- **CPU speed** = the arena bar's switch (by design, keep), **Hot seat: turn the board** = also on Play Now's hot-seat card (by design, keep).

**Broken / dead today:**
- #8 Confirm attacks renders as a raw old-style checkbox with the text in a tooltip (396 inserts after `data-set="ctxMenu"…</label>` in the
  already-built v0.98 page). Visible in `shots/settings_desk_general.png`.
- #23 See-through button labels `auto/on/off` are lower-case and untranslated (12-settings writes `${v}`).
- Phones: CPU speed's "❚❚ Pause" is clipped at 390 px (`settings_phone_general.png`); the rail is a horizontally scrolling pill row (6 pills,
  3 visible) — stays the same pattern with 8 pills.

## 3. The proposal (new tab map)

Rail (groups stay three + one; `data-stab` keys of the existing pages are KEPT so old calls and tests still land):

| Group | Tab (key) | Was | Cards → rows |
|---|---|---|---|
| PLAY | ⚔ **Play** (`general`) | General | Language · **Pace**: CPU speed, Animations · **Turns**: Confirm before End turn, Confirm attacks (offline), Event briefing, Context menus, Hot seat: turn the board · **Camera**: Follow camera, See-through |
| PLAY | 💡 **Hints** (`help`) | Hints & board | **Hints & help** (unchanged, H) · **On the board**: Hit feedback Full/Mine/Quiet/Off, Card reveals, Log on the arena |
| LOOK | 🖥 **Graphics** (`pieces`) | Board & pieces | **Quality**: Quality, Lighting, Portrait detail, Show frame meter · **Pieces**: Show token bases, Blood & severed limbs · **Blessings on pillars**: pots/tokens pictures, Floor spikes |
| LOOK | 🏟 **Crowd & voices** (`crowd`, NEW) | — | **Editors in the box**: Editor reacts + the 12 city picks · **Voices**: Spectator shouts, CPU thought bubbles, City-square chatter, Famous visitors |
| LOOK | 🎨 Themes (`themes`) | same | unchanged |
| SOUND & ACCESS | 🔊 Audio (`audio`) | same | unchanged |
| SOUND & ACCESS | ♿ Accessibility (`access`) | same | Text size, Reduce motion, **Screen shake on big hits**, Colour-blind colours · Preview (Confirm End turn copy removed) |
| DATA | 💾 **Data & saves** (`data`, NEW) | header + footer + General | **Saves**: Saves & backups (opens 💾 Saves), settings-storage line (only after a refused save) · **Help us fix it**: 🐞 Error log · **Reset**: Restore all defaults |

`SET98_MAP` gains `sponsors → crowd` (24-sponsors' `openSettings('sponsors')` from the "editor unlocked" news lands on the editors),
`tokens → pieces` stays, `saves` keeps its SET84.full shelf. 17 rows move, 2 are renamed, 1 merge, 1 duplicate removed, 6 texts fixed.

**New descriptions (succinct; no new tooltips; English, translations through tools/i18n):**
- Language: "Game terms (class names, CF, the Fate, Missio) stay English. Switching reloads the page."
- CPU speed: "Same as the arena bar; kept between events. Step waits after each CPU action."
- Animations: "Flying stones and spears, the clean-up crew, market rolls. Quick halves them."
- Confirm attacks: "Asks “Strike …?” before each attack. Not online."
- See-through: "Fade pillars in front of what you look at. X toggles." (buttons Auto / On / Off, translated)
- Hit feedback: "Full: your fights in full, others faint. Mine: only your fights. Quiet: only your fighter’s body. Off: no numbers."
- Log on the arena: "The newest log lines over the arena corner. 📌 does the same."
- **Lighting**: "Full: sun and torch shadows, sand grain, depth. Light: soft shadows at the feet. Off: the flat board, fastest." (the
  "By quality: X." / 422 `#l111now` prefix stays)
- Portrait detail: "Light and shade on faces. Light and Off are plainer and faster."
- Show frame meter: "Frames per second in a corner. Keeps the page awake while shown."
- Editor reacts: "Cheers, insults, the odd tear from the box."
- Editors in the box (city picks): "Who sits in each city’s box. Win there to unlock its editor."

## 4. What this replaces (NAME WHAT IS REPLACED)

| Earlier decision | Where | What the new layout changes |
|---|---|---|
| **v0.84 Settings tidy** (his "all ★", 2026-10-04; 142-v84ui) | docs/decisions.md "SETTINGS TIDY + LANDING FIT" | Language stays first (now in Play). Confirm before End turn stays in the play tab only. The Saves-tab button (later the v0.98 footer link) becomes the Data & saves tab. Restore all defaults moves from the header into Data & saves. One text size + colour-blind select in Accessibility: unchanged. (Its "Performance row Auto/Full/Light" was already REPLACED by v1.10 Quality.) |
| **v0.88 settings pass** (his "we should organize these together", 2026-10-05; 159-v88set) | docs/history.md v0.88 "grouped Settings"; 159 header | Its General groups (Gameplay · Hints & help · On the board · Voices) are re-cut: Gameplay → Pace / Turns / Camera; On the board loses Screen shake (→ Accessibility), Blood (→ Graphics), See-through and Hot seat (→ Play), Floating numbers (merged into Hit feedback); Voices & bubbles leaves for Crowd & voices. Animations / Follow camera rows themselves unchanged. |
| **v0.90 Blessings on pillars + hot-seat turning board "Settings → On the board"** (2026-10-05) | docs/decisions.md v0.90 QUEUED ×2 | Blessings stay in the Look side (Graphics); the hot-seat switch moves to Play → Turns. |
| **v0.98 Settings mock-up** (his mock tools/plans/mock98/settings.html, 2026-10-08; 246-v98ui) | docs/decisions.md v0.98 CHANGES ("SETTINGS FULL SCREEN … Board & pieces tab (old Tokens + Editors merged) … Hints & help shares a row with On the board … Saves tab removed") | Full-screen window, rail, groups, phone pill row, lifting of controls: KEPT. Changed: tab names General → Play, Hints & board → Hints, Board & pieces → Graphics; "old Tokens + Editors merged" into Board & pieces is REPLACED (editors go to Crowd & voices); the Accessibility copy of Confirm End turn (added by the v0.98 build) goes; footer Saves link → Data & saves; two new tabs. |
| **v1.0 frame meter in General → Performance** (288-v100fps) | docs/modules.md 288 | Moves to Graphics → Quality. |
| **v0.99 Portraits card / v1.0 Hits card / v1.01 Token bases card** (263, 277, 321) | docs/modules.md | Each one-row card is folded: Portrait detail → Quality card, Hit feedback → Hints → On the board, Token bases → Graphics → Pieces. |
| **v1.06 Confirm attacks in General** (2026-10-18, 396) | docs/decisions.md 396 line | Stays in the play tab (Turns), offline only; restyled to a normal row. |
| **v1.07 editors move** ("Settings editors beside Blessings", 400-v107tok `s98-edpair`) | docs/history.md v1.07 | REPLACED: the editors leave Board & pieces for Crowd & voices; 400's pairing wrapper becomes a no-op (Blessings full width, or beside the Pieces card). |
| **2026-10-20 "the Lighting description stays as is"** (his 1a 2a on the v1.08 build) | docs/decisions.md 2026-10-20 | REPLACED by his own backlog note of the same day ("Lighting should name the v1.08 torchlight") — new text above. |
| **v1.10 Quality card first in Board & pieces, Lighting under it** (417) | docs/decisions.md / modules 417 | Kept, and the card also takes Portrait detail + frame meter. |
| **v1.11c settings that stick** (422) | modules 422 | Unchanged in behaviour; optional read-only status line in Data & saves (Q7). |

When he confirms: mark the v0.98 "Board & pieces (old Tokens + Editors merged)" and the v1.07 editors-beside-Blessings placement and the
2026-10-20 Lighting-text call REPLACED in docs/decisions.md.

## 5. Risks

- **Saved choices must not reset.** Nothing in this plan changes a `SETTINGS` key, a localStorage key (`flavius_settings`, `flavius_theme`,
  `flavius_lang`, `flavius_light106`, `flavius_speed111`, `flavius_profiles`, the sponsor map) or a default. Rows are moved by lifting the same
  controls (same `data-*`), so the 12-settings change handler writes the same key. No SAVE_MIGRATIONS needed. A build test should load a
  v1.14b `flavius_settings` with every non-default value, open each new tab, and check every control shows that value and that
  `applySettings()` writes it back byte-identical.
- **422's checked save + cookie backup**: works on `applySettings` and `flavius_settings`, not on the layout — unaffected. Its P3 panel texts
  (`#q110d`, `#l111now`) are found by id; they must stay inside the Quality card (they do). Keep `set111Live` working after the move.
- **Merging `fx` into Hit feedback "Off"** (Q4) is the one behaviour-visible change: today the switch also stops board animations. Either
  Off keeps writing `fx=false` (same effect, honest text) or `fx` is decoupled from `animOn` (a rule-free display change, but players who
  turned the switch off would start seeing animations again) — his call.
- **Wrapper order**: 263/277/321/399/417/422 wrap `set98Pieces`, 288 wraps `set98General`, 396 wraps `settingsHTML`. The new module must
  sit after all of them (last before 08-setup, like 288/277) and move finished cards by their data-attributes, never by text (translations).
- **Kill switch** `flavius_v115setoff=1` = today's layout exactly.
- **Phones (390 px)**: 8 pills instead of 6 in the scrolling bottom row; labels shorter ("Play", "Hints", "Graphics") so 3–4 fit. The mock-up
  fits 390 px without sideways scroll. Fix the clipped "❚❚ Pause" at the same time (seg buttons wrap or shrink).
- **Languages**: ~15 new/changed strings → tools/i18n prep/finish; tv86/tv87l check long labels (German "Grafik", "Menge & Stimmen" …).
- **Online**: Profile & Settings in Online (252/l89) is a separate window — not touched. Confirm attacks stays hidden in Online matches.

## 6. Tests a build would touch

Must be updated on purpose (keep their intent):
- **tv98a** — rail list `['general','help','pieces','themes','audio','access']` + `grp===3` → 8 keys / 4 groups; `go('help')` for See-through
  → `general`; `.s98-eds select[data-spcity]` on `pieces` → `crowd`; `.s98-hd [data-rst84]` and `.s98-foot [data-sv84]` → Data & saves; the
  "removed rows" check gains nothing new (keys stay).
- **tv84u** — Restore all defaults / Saves button locations; Confirm End turn on `access` (removed); `data-stab="saves"` mapping.
- **tv88s** — General / Hints rows (See-through, Hot seat moved), CPU speed on `general` (stays).
- **tv100h** — `set98Pieces(...)` hit100 row → the Hints builder.
- **tv100fps** — frame meter: `openSettings()` lands on Play; the test must click `pieces` first.
- **tv90b** — `settingsHTML('help')` has hsTurn90 → `general`.
- **trng92** — `[data-err92o]` after `openSettings('general')` → `data`.
- **tv100sb** — the Restore all defaults slab (header carbon) → its new place.
- **tv111set** — goes through every `data-stab`; keys unchanged, check the Quality-card ids.
Re-run (should pass unchanged): tv63, tv66, tv86, tv87l, tv87x, tv88p, tv89j, tv99f, tv101e, tv106d, tv106l, tv110a, tv111sp, tv114h, tb4,
tb8, thist, tlive36, tv107a (pots on `pieces`, no token style — stays true), taud36, taud49, tv72, tv74, tv75, tv93i, tv102c, tv103a, tv100pn + phones tv66/tv88. A new test `tv115set` for the
round-trip of saved values (Risk 1) and the 390 px fit.

## 7. Questions for Virgilante

1. **Tab names.** a) Play · Hints · Graphics · Crowd & voices · Themes · Audio · Accessibility · Data & saves — my pick ·
   b) keep today's names (General · Hints & board · Board & pieces) and only add the two new tabs · c) English short words only (Play · Help ·
   Look · Crowd · Colours · Sound · Access · Data).
2. **Crowd & voices as its own tab** (editors in the box + every talking system + famous visitors). a) own tab under LOOK — my pick ·
   b) no new tab: editors stay in Graphics, voices stay in Hints · c) voices go to Audio ("Sound & voices"), editors stay in Graphics.
   *This replaces the v0.98 "Board & pieces = old Tokens + Editors merged" and the v1.07 editors-beside-Blessings placement.*
3. **Data & saves tab** (Saves & backups, Error log, Restore all defaults). a) a tab — my pick · b) no tab: keep the footer link, Error log
   stays in General, Restore stays in the header · c) a tab, AND Restore all defaults also stays in the header.
   *This replaces the v0.84 Saves button / v0.98 footer link and the v0.84 header Restore.*
4. **"Floating combat numbers"** (it also stops every board animation today). a) fold it into Hit feedback as a 4th button "Off" that keeps
   today's exact effect, text says so — my pick · b) keep it as its own switch, renamed "Board effects" with the honest description ·
   c) fold it into Hit feedback and make it numbers-only (animations follow the Animations row alone; players who had it off see
   animations again).
5. **Confirm before End turn** is in General and Accessibility. a) only in Play — my pick · b) keep both.
   *This removes the copy the v0.98 build added.*
6. **Performance rows** (Quality, Lighting, Portrait detail, frame meter). a) all in one Quality card in Graphics — my pick ·
   b) Quality + Lighting only; Portraits keeps its card and the frame meter stays in General · c) merge Lighting INTO Quality (no separate
   Lighting row; Quality alone decides) — note this would retire the v1.10 "Lighting stays as an advanced choice under it" (his 3a).
7. **Settings-storage line** in Data & saves, shown only after the browser refused a save (422's cookie fallback). a) yes, one read-only line —
   my pick · b) no, the 422 toast is enough.
8. **Phones (390 px).** a) keep the bottom pill row (8 pills, scrolls), shorter labels, fix the clipped Pause — my pick · b) phones get a
   list page first (tap a tab name → its page, ← back), like a phone settings app.
