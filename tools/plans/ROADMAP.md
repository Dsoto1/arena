# Flavius Rule Arena — Approved Improvement Roadmap

**Status:** OWNER APPROVED DIRECTION  
**Approval date:** 2026-10-21  
**Project baseline:** Flavius Rule Arena v1.08b  
**Source:** `Flavius Rule Arena — Improvement Assessment Brief` + `FLAVIUS_IMPROVEMENT_REVIEW.md`

> This document is the active improvement roadmap produced after owner review of the assessment. It supersedes the earlier draft `FLAVIUS_ROADMAP.md` as a planning authority. Existing repository decisions remain authoritative unless a change below is explicitly verified against the repo, approved, and the prior decision is marked `REPLACED` according to project process.

---

## 1. Owner Decisions — APPROVED

The owner accepted all recommended choices from `FLAVIUS_IMPROVEMENT_REVIEW.md`:

| Decision | Approved choice |
|---|---|
| Q1 | **B — Take one small stability/tooling release first, then continue planned features.** |
| Q2 | **B — Consolidate small, proven-obsolete wrapper chains continuously across future releases.** |
| Q3 | **B — Add an Auto visual-quality profile while retaining manual controls.** |
| Q4 | **B — Tactical clarity and consequence previews are the next major arena-facing feature area after foundation work.** |
| Q5 | **B — Move onboarding toward a short guided first fight plus contextual lessons.** |
| Q6 | **C — Manager Mode should emphasize persistent people, stories, and consequences that feed back into arena play.** |
| Q7 | **B — Annals/Hall should become career history for notable fighters, seasons, wounds, rivalries, Fate, and achievements.** |
| Q8 | **B — Creator Studio sharing is planned, but parked until definitions/versioning are stable.** |
| Q9 | **B — Migrate content families toward shared game definitions incrementally when there is a concrete benefit.** |

These choices approve the **direction and release planning** below. They do not waive repo verification, beta validation, replacement tracking, or the owner's normal go/no-go gate for a specific release plan.

---

## 2. Governing Rules for Every Agent

These rules remain mandatory throughout the roadmap:

1. **Do not create a second live implementation of an existing rule, screen, setting, cache, or system.**
2. Before changing overlapping behavior, identify the current owning module(s), relevant decision/date, and exactly what the new work replaces. Mark superseded decisions `REPLACED` using the established repo process.
3. **Do not perform a wholesale rewrite.** Consolidation is incremental and evidence-based.
4. Keep **fixes separate from features**. A feature discovered while fixing something belongs in the appropriate feature release/backlog unless separately approved.
5. Preserve seeded RNG boundaries: rules use seeded RNG; UI-only behavior must not consume it.
6. Preserve save/migration requirements, `SAVE_COLS`, `GAME_VER`, online lockstep, replay goldens, localization coverage, and existing security/cheat-word rules.
7. Preserve performance targets: **60 fps on a mid-range laptop and 30+ fps on a mid-range phone** at Normal speed, zoomed and unzoomed.
8. Visual improvements must retain **Reduce Motion / Animations Off** paths and may not reduce tactical readability.
9. A **figure re-bake ships alone** unless the owner explicitly replaces that decision.
10. Deployment changes belong in `flavius.sh` / `release.sh`, not manual console procedures. Raise `FSH_VER` when required by existing rules.
11. In-game wording remains succinct; tooltips nest no more than two levels.
12. Every release goes through the established work branch → release tooling → CI → beta owner play → release flow.
13. Repo evidence overrides assumptions in this roadmap. If the repo contradicts a technical assumption, stop and report it rather than forcing the proposed design.

---

# 3. Release Roadmap

## v1.08c — Stability & Tooling

**Purpose:** Reduce current rework before adding another major feature area.

### Priority A — Deterministic CI timing

Investigate the named GitHub-only/flaky tests, especially `tv106d`, `tv100z`, `tv104d`, and the broader flaky set recorded in the assessment.

Prefer semantic state waits over fixed sleeps where repo evidence supports them. Candidate concepts include:

- game/turn ready
- arena stable
- animation idle
- popup settled
- save complete
- asset/sprite ready

Do not create a parallel test synchronization framework if an existing helper can own this behavior.

**Acceptance target:** repeated CI runs of the targeted tests no longer fail because a step occurred before the game reached the state the test actually required. Diagnostic output should identify the awaited state on failure.

### Priority B — Recurring tooling defects

Investigate and fix, where reproducible:

- false `_T` wrapping from i18n prep
- `smartreg --dry` unexpectedly planning everything
- `testslot.sh` hangs
- letter-version update-notice parsing for future releases
- art/bake output differences where identical inputs should be deterministic or the source of nondeterminism should be explicitly understood/documented

Do not retroactively alter released v1.08a/b builds merely to restore their missed update notices.

### Priority C — Render/cache investigation

Map the current dependencies among board/cell drawing, aim rings/outlines, lighting, night grade, shadows, bitmaps and sprite/cell state.

Deliver a proposal for a coherent invalidation model. **Do not add another independent invalidation system merely because one cache is stale.** Determine first whether a canonical cell/state revision, dependency generation, dirty-region model, or an existing mechanism should own invalidation.

### Priority D — Establish measured performance baselines

Record current good-state measurements before assigning hard subsystem budgets. Measure at least:

- board render cost
- lighting/shadow cost
- tactical/aim overlay cost
- animation/update cost
- peak frame time during popup/zoom/Fast CPU scenarios
- decoded sprite/asset memory where practical
- representative Chrome/Safari and phone behavior already covered by project tests

**Do not invent arbitrary budgets before measuring the current baseline.**

### v1.08c non-goals

- new gameplay systems
- Winter Quarters content
- tactical UX redesign
- major renderer rewrite
- bulk wrapper cleanup
- figure re-bake

---

## v1.09 — Winter Quarters

**Purpose:** Continue the already planned feature line after the stability release.

Scope remains centered on the existing Winter Quarters plan: off-season rooms plus the Winter Classic tournament. The repo plan/mock-up and later owner decisions define exact content.

### Roadmap guidance

Winter Quarters should begin establishing the long-term Manager direction without silently expanding scope. Where existing design naturally supports it, prefer choices that can later carry persistent fighter/staff/story consequences rather than adding rooms solely as isolated menus.

### Boundaries

- Do not turn v1.09 into the full Living Ludus system.
- Do not add Annals career-history architecture unless required by already-approved v1.09 scope.
- Any newly proposed persistent consequence must still be specified in the release notes and approved under normal project process.

---

## v1.10 — Arena Foundation

**Purpose:** Make the arena rendering/performance foundation easier to reason about and more resilient before the tactical UX expansion.

### A. Coherent render invalidation

Implement the v1.08c investigation's approved invalidation design if evidence supports it.

The conceptual render responsibilities should become understandable as a pipeline such as:

1. arena/static base
2. environment/state layers
3. units/figures
4. shadows and lighting
5. tactical overlays
6. interface/compositing

This is a conceptual ownership model, not permission to rewrite working rendering wholesale.

**Acceptance:** state changes cannot leave known dependent cached visuals stale; invalidation ownership is documented; existing performance tests remain within project targets.

### B. Adaptive visual quality

Add an **Auto** quality path while retaining manual controls.

Potential internal levers, subject to repo inspection:

- board render scale / DPR
- 1× vs 2× figures where supported
- shadow complexity
- lighting quality
- environmental animation/detail
- crowd/secondary animation

Auto should choose conservatively from capability/runtime evidence and must incorporate rather than duplicate existing Lighting Full/Light/Off and Safari fallback behavior.

**Do not remove manual control.**

### C. Incremental wrapper consolidation begins

Identify only wrapper chains proven obsolete/fully superseded. For each candidate:

1. name the chain and current owner
2. identify the decision/history that produced it
3. prove final behavior with tests/goldens
4. fold behavior into the canonical owner
5. remove only dead wrappers
6. record the replacement

Keep the batch small. Wrapper cleanup becomes an ongoing maintenance practice, not a rewrite project.

### D. Performance/memory budgets

Using v1.08c baselines, establish useful regression thresholds for major passes and memory-sensitive asset paths. Budgets should diagnose regressions while preserving the project's 60/30+ fps owner targets.

---

## v1.11 — Tactical UX

**Purpose:** Make Flavius Rule's depth easier to read without simplifying its rules.

### A. Unified Tactical Information Layer

Selection/hover/targeting should use one coherent information language. Depending on context and existing rules, this may expose:

- reachable tiles
- legal attack targets
- weapon range
- line-of-sight/relevant obstruction state
- current target
- chance to wound/hit information already supported by the game
- likely consequence/body-location information when rules allow it
- NPC aggro relationships
- hazards
- tunnel/escape interactions
- objective-relevant tiles

This system should extend/replace overlapping aim/ring/guide behavior rather than stacking another unrelated overlay system on top.

### B. Turn information hierarchy

A player should be able to answer quickly:

1. **Whose turn is it?**
2. **What can I do?**
3. **What is likely to happen if I do it?**

Secondary information—Crowd Favor, Coin, equipment, NPC aggro, conditions, objectives and other state—should remain accessible without competing with the immediate decision.

### C. Accessibility/performance

Tactical clarity cannot depend solely on animation. It must remain usable with reduced motion/animations off and on phone layouts. New overlays must be included in draw-cost/performance testing.

### v1.11 non-goals

- changing combat math merely to simplify previews
- exposing hidden information the rules do not permit
- consuming seeded RNG to generate UI previews
- adding flashy effects with no tactical value

---

## v1.12 — First Hour

**Purpose:** Teach Flavius Rule by playing rather than front-loading the complete ruleset.

### A. Guided first fight

Move toward a short guided experience that introduces the core loop in context, approximately:

1. movement
2. attack/targeting
3. hit and body-location consequences
4. enemy/NPC activation where appropriate
5. Crowd Favor
6. weapon/equipment interaction
7. elimination/Fate

Exact lesson order must follow actual repo rules and existing lesson decisions.

### B. Contextual lessons

Advanced systems should appear when first relevant rather than all being taught before normal play. Reuse the existing lesson/tutorial infrastructure where possible; do not build a second tutorial engine without evidence that the current one cannot support the approved design.

### C. First-hour review

Evaluate:

- Play Now entry flow
- mode explanation
- settings discoverability
- phone layout
- lesson interruption/re-entry
- whether the player knows why Crowd Favor matters
- whether the player understands the three-round/event structure at the appropriate point

---

## v1.13 — Living Ludus

**Purpose:** Make Manager Mode generate people and stories the player cares about, not just more management screens.

### A. Persistent consequences

Prioritize systems where decisions create future consequences involving fighters and the ludus. Candidate design areas include:

- rivalries/grudges
- injuries and recovery history
- training specialties/development
- staff/advisor relationships
- patron/sponsor relationships where consistent with existing design
- reputation/fame consequences
- meaningful debts/obligations where supported by the economy design
- fighter milestones and notable arena history

These are approved **directional areas**, not pre-approved mechanics or balance numbers. Each concrete mechanic still requires specification against `docs/decisions.md`, economy plans and Manager modules.

### B. Annals/Hall becomes career memory

Evolve Annals/Hall toward preserving notable careers and seasons, potentially including:

- bouts
- wins/losses where tracked
- notable kills/beasts defeated
- wounds and severed limbs
- Fate outcomes
- rivalries
- championships/season achievements
- freedom/death/retirement outcomes where applicable
- ownership/ludus history where relevant

The goal is for a fighter's history to explain **why the player remembers them**, not merely display a leaderboard row.

### C. Arena ↔ Manager feedback

Prefer consequences that connect management decisions to arena stories and arena outcomes back to management. Avoid adding isolated meters solely for additional complexity.

---

## v1.14 — Creator Community

**Purpose:** Prepare safe sharing of Creator Studio content after definition/versioning work is sufficiently stable.

### A. Shareable definitions

Investigate/import-export formats for suitable Creator Studio content such as created fighters, beasts, events or other supported definitions.

Prefer compact configuration/seed/definition data over bundling assets whenever possible.

### B. Required safeguards before shipping

A sharing format must define:

- schema/version
- validation
- compatibility behavior
- unsupported/unknown-field behavior
- migration policy or explicit incompatibility behavior
- safety limits for imported values
- deterministic behavior where required by game rules

Do not prioritize community sharing ahead of stable definitions.

---

# 4. Cross-Release Architecture Direction

## 4.1 Shared Game Definitions — incremental only

The owner approved moving content families toward shared definitions **when there is a concrete benefit**.

Good candidates are systems currently represented in multiple places—runtime rules, Creator Studio, cards/UI, tests, Manager, etc.—where a shared canonical definition would remove drift.

For each family:

1. identify duplicate sources of truth
2. choose the canonical owner
3. define the data contract
4. migrate one family
5. prove runtime/Creator/tests agree
6. remove or replace the superseded representation
7. record migrations/compatibility needs

**Never attempt an all-at-once conversion of major content systems.**

## 4.2 Wrapper consolidation — continuous maintenance

Every future release may include a small amount of proven-safe consolidation when it directly touches an obsolete wrapper chain. Do not pad releases with unrelated cleanup merely to reduce module count.

## 4.3 Performance is a feature constraint

Every visual or UI proposal must answer:

- What does it cost per frame?
- What does it cost in decoded memory?
- What happens on Safari/low-end devices?
- What is the reduced-motion/animations-off behavior?
- What quality tier can disable/reduce it?
- Does it affect online/replay determinism?

---

# 5. Explicit Non-Goals

This roadmap does **not** authorize:

- rewriting Flavius Rule in a framework
- replacing Canvas wholesale
- converting the game to a new engine
- replacing seeded RNG
- changing established combat rules without a separate owner decision
- replacing the save system wholesale
- rebuilding online/server architecture without evidence and approval
- a 410-module architecture rewrite
- sacrificing readability for visual polish
- sacrificing performance for 2× assets/effects
- merging figure re-bakes into unrelated releases
- removing manual visual-quality controls
- creating a second live implementation of an existing rule/system
- implementing every candidate Living Ludus idea as written
- implementing Creator sharing before schema/versioning readiness
- migrating all content to shared definitions at once

---

# 6. Agent Execution Protocol

For each release, before code changes:

1. Read `CLAUDE.md`, `docs/known-issues.md`, `docs/decisions.md`, `docs/history.md`, `docs/modules.md`, relevant plans, and the modules named by the assessment/roadmap.
2. Treat later owner decisions as authoritative.
3. Separate the release notes into **FIXES** and **FEATURES/ARCHITECTURE**.
4. For every proposed overlapping change, record:
   - current module/system
   - relevant decision/date
   - proposed replacement
   - why replacement is needed
   - tests/goldens affected
   - save/migration implications
   - online/determinism implications
   - performance/accessibility implications
5. Ask only questions the repo cannot answer. Use multiple choice and mark the agent's recommended option.
6. Write the proposed work to the versioned `tools/plans/vXYY/NOTES.md` location/process used by the repo.
7. **Wait for owner go before building that release.** Approval of this roadmap is approval of direction, not permission to bypass the established per-release gate.
8. After go, implement the smallest coherent release.
9. Run smart regression/relevant goldens and full CI when required.
10. Owner plays beta before release.
11. Record replacements/history so a future agent does not resurrect retired behavior.

---

# 7. Immediate Assignment for the Coding Agent

The next active planning target is **v1.08c — Stability & Tooling**.

### Do now

Inspect the repo and prepare the v1.08c `NOTES.md` plan covering:

1. named CI timing/flaky-test causes and proposed semantic-wait replacements
2. i18n prep false wrapping
3. `smartreg --dry`
4. `testslot.sh` hangs
5. future letter-version update parsing
6. art/bake reproducibility investigation
7. current render/cache dependency map and recommended invalidation owner/model
8. baseline performance/memory measurements and how they will be collected

For each item, identify evidence, module ownership, overlap/replacement, effort, risk, tests and whether it is a FIX or architecture/tooling work.

### Do not do yet

- Do not implement v1.08c until the owner approves the release notes/plan.
- Do not begin v1.09–v1.14 implementation.
- Do not refactor wrapper chains unrelated to the v1.08c investigation.
- Do not change gameplay rules or balance.
- Do not re-bake figures as part of this release.

---

# 8. Definition of Roadmap Success

This roadmap is succeeding if Flavius Rule becomes:

- **more reliable to change** — CI and tooling are trusted
- **easier to reason about** — fewer stale caches and obsolete wrapper chains
- **faster and more scalable** — visual quality adapts without sacrificing the game's look
- **clearer to play** — tactical information makes deep rules understandable
- **easier to learn** — the first fight teaches the game in context
- **more memorable** — Manager Mode and Annals preserve fighter stories and consequences
- **more extensible** — Creator Studio and runtime systems increasingly share stable definitions
- **safer for agents to develop** — every change has one owner, one source of truth, and a recorded replacement path

The guiding principle is:

> **Improve how Flavius Rule's existing systems reinforce one another before measuring progress by the number of new systems added.**
