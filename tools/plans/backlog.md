# Feature backlog (parked — nothing here is built until Virgilante pulls it into a release)

From v0.95 releases are STABILIZATION releases: fixes + changes to established features. New feature ideas land here.
Each line: idea · where it came from · date.

## Parked features
- Token modeller polish: severed limbs on the 3D token, a female body, hands that grip weapons, emblem/damage/wraps/lacing extras in 3D,
  3D token ~20% shorter than flat tokens (may be a fix — check in play) · v0.93 follow-ups · 2026-10-07
- Online: pose step inside the online creator; Domus showcase/slot cards show the 3D token · v0.94 report · 2026-10-07
- Phase 2 hardening: server-side verification of Ranked results (engine separated from screen code, replay seed + inputs) · 2026-10-07
- Online: Stakes matches, referee replay, more events (only after the Classics play well online), reclaim a seat a CPU took (partly built v0.84) · v0.79+
- Event Designer: water / doors / more than 3 rounds / zone sizes other than 13·9·5 (the custom event data has no fields for them) · v0.94 report · 2026-10-07
- Hot seat: Guest in Manager bouts · tools/plans/hotseat-next.md
- Armor/avatar: bonus-AP links, severed-limb drop · open since v0.73
- Class cards: the 8 printed classes on the live template (needs his blank template + figures) · open
- Player listings in Flavius's Auction (only if the economy is healthy; cooldown, floor price, Flavius' cut) · v0.84 decision
- Event Designer full step-by-step wizard (deferred v0.54) · old
- Play Now setup: city/modifier header aligned to the map width · old

- **Trade bundles (his note 2026-10-08, parked q4a):** from a rival's team page offer 2+ of yours for 1 of theirs; once a week; a declined offer with interest comes back as a counter-offer letter the next week.
- Online Ludus: real per-lanista draft over the network before the horns (his pick C, v0.98) — Ludus is kept out of online until then · 2026-10-08
- **Animated tokens in the arena (his 8a: next release):** walk / attack / hit / die poses rendered from the rig92 token like the clean-up crew
  (238-v96clean: flat sheets rendered ONCE, one row per pose × 8 MINI_YAW cells), a per-token sheet per character (Studio + online 3D tokens;
  made beside the v0.93 minis8 sheet, cached by the look + pose hash, uploaded like 226's pictures online), frames picked by the board's
  move/attack/hurt/eliminate moments; perf budget (one drawImage per piece as today, decode once, ≤ ~150 KB a sheet, tv91r draw time + tv92p idle
  unchanged); Off path = the still sheet (Settings Animations Off, Reduce motion, Fast, HEADLESS/sims) · v0.99 pose batch · 2026-10-08
