# v1.14 — Figures from turn one
Questions asked 2026-10-24 (HANDOFF "Waiting on him" 1–6). Answers 2026-10-28 (his "1a 2a 3a 4a 5a 6a", from the new cloud account):
- (1a) v1.14 = Figures from turn one ALONE (428-v112fig, tv112f, already merged f81e388).
- (2a) BETA first: one Studio-look match in Safari + ⏺ recording before it ships.
- (3a) Deaths study stays ON HOLD until v1.14 ships (wip/deaths-study untouched).
- (4a) Ride-along fix in v1.14: ES/FR Quality button "High" reuses an older plural key (Altos / Hautes) → its own singular key.
- (5a) New Manager words (stipend, bundle, trade-in, settling in, backer) are fine as translated.
- (6a) v1.13 is deployed (`flavius.sh release` done).
Also 2026-10-28: his sign-in steps are done (update → signin → status → Google sign-in on login.toshiroplay.com). He reports the
budget alarm closed Online temporarily (budget switch: arena Lambda concurrency 0 until the 1st, or the stack's ReopenCommand).

## Build list (waiting for his go)
1. Translate the new string ("Preparing the figures…"): sh tools/i18n/prep.sh → one Sonnet agent (tools/i18n/TRANSLATE.md) → sh tools/i18n/finish.sh.
2. Fix 4a (ES/FR "High" key) + a test for it.
3. Badge `arena · v1.14` (01-head.html), MILESTONES entry (34-notes.js). No SAVE_MIGRATIONS (world data unchanged).
4. sh tools/release.sh 1.14 → commit [full] → full GitHub run green.
5. BETA (2a): he runs `bash flavius.sh beta`, plays one Studio-look match in Safari + ⏺ recording → ship on his word.

## Budget scope (asked 2026-10-28 after his domain + Lightsail purchase tripped Flavius's kill switch; answers 7a 8a 9a)
- (7a) The budget counts only Flavius: tag `app=flavius` on Flavius's own resources, flavius.sh activates the tag for billing
  (aws ce update-cost-allocation-tags-status, no console), Budget gets a CostFilter on it. REPLACES the account-wide budget (template
  `Budget`, built with the server). First month undercounts (AWS counts a tag from activation on).
  - Tag resource by resource, NOT as stack tags: stack tags would propagate to the Retained Cognito pool and the update would rewrite
    ToshiroPlay's settings (HANDOFF: never edit them). The shared pool stays untagged (shared cost).
- (8a) Ships in v1.14 → v1.14 becomes a SERVER release (stack only: budget + tags, no game/protocol change); the beta stays offline as always.
- (9a) Online stays closed until the switch reopens it on 2026-11-01.
