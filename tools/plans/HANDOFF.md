# Handoff: where the work stands (for the next Claude session or agent)

Repo dsoto1/arena · work branch `claude/cloud-credits-usage-vq4w63` · owner Virgilante (David).
Read CLAUDE.md first (rules + how to work), then this file, then docs/decisions.md (his latest decisions are at the bottom).
Always `git pull --no-rebase` before starting and push when stopping. One side at a time (THE BATON, below).

Last updated: 2026-10-28 (cloud session).

## Live now
- **v1.13 "The scribes check"** is the newest release: `release/v1.13` = `main` = f9aba45 (server release: Ranked results decided by
  the server's replay, enforced). His `bash flavius.sh release` run for it is NOT confirmed. Ask him once; `bash flavius.sh status`
  shows "ranked check" when the server is on it.
- Full history: docs/history.md · newest three in CLAUDE.md §7.

## On the work branch, NOT released yet
1. **Figures from turn one** (module 428-v112fig, test tv112f, merged f81e388). Studio/online/re-kitted fighters are prepared before the
   match in a Worker ("Preparing the figures…", at most 3 s desktop / 6 s phone); kill switches `flavius_v112figoff`, `flavius_v112fignowk`.
   Needs its own release: translation of the new string (prep.sh → one Sonnet agent → finish.sh), badge + MILESTONE, release.sh, [full] run.
   Untested on real Safari; his beta-or-not answer is open (question 2 below).
2. **Sign-in moved to login.toshiroplay.com** (9edf8ee, 2026-10-27, his go). The Cognito pool is now SHARED with his other game
   ToshiroPlay (dsoto1/splitters). In the AWS console he renamed it "toshiro-players", switched Google to a "ToshiroPlay" OAuth client and
   moved its own address to login.toshiroplay.com (login.flaviusrule.com was deleted).
   - Changed here:
     - tools/deploy/flavius.sh (FSH_VER 11): `bash flavius.sh signin` checks that the address accepts Flavius's client + callback, then
       sets play/online.json "auth". `login` is retired. `status` checks the shared address and Google client.
     - server/template.yaml: the Cognito resources are `DeletionPolicy/UpdateReplacePolicy: Retain`. NEVER edit their properties again: a
       stack update would undo ToshiroPlay's settings. Deploys keep the old stack parameters on purpose.
   - Written down in docs/backend.md ("Versions, deploy…") and docs/decisions.md (2026-10-27).
   - HIS STEPS, not confirmed done: `bash flavius.sh update` → `bash flavius.sh signin` → `bash flavius.sh status` → one Google sign-in
     on https://flaviusrule.com/play/. Until he runs `signin`, online sign-in points at the deleted address and FAILS.
   - The template change reaches AWS with the next release; the server redeploys once, nothing else changes.
   - He reported `ref E-XD70` once. It is not a Flavius code (not in src/, server/ or flavius.sh); he thinks it was the app's pending update.

## Paused / parked
- **Deaths study (Manager)**: why a careful house loses 2–3 fighters a season and sits mid-table (rank ≈10.5). It is ON HOLD at his
  request (2026-10-23). Restart only on his word ("resume" in the checklist or chat).
  - Partial work is on branch `wip/deaths-study` (b4c9b90; worktree .claude/worktrees/agent-a0ad80547fd7a3602):
    - tools/mgrsim2.js: --patch, --simk, --tag, --skip-done.
    - Analysis scripts: tools/plans/deaths112/dsum.py, dcmp.py.
    - Batch runner: tools/plans/deaths112/runall*.sh.
  - Proposals to measure: S1–S4 (sim behaviour: smart blood money, buying fame, entries) and patches G1 low-fame clemency, G3 half blood
    price under fame 18, G4 easier star fame gate, G5 no fame loss for a fallen nobody, G6 the Medicus lowers lethality.
  - The baseline sims ran but their output was in /tmp and is LOST: re-run the baseline first (careful ×12 seeds ×5 seasons, `--par 2`).
  - Report → his approval → only then a release. Background: docs/economy.md, tools/plans/econ111/REPORT.md.
- Backlog: tools/plans/backlog.md (e.g. the SETTINGS REORGANISATION idea, mock-up first). Open bugs and limits: docs/known-issues.md.

## Waiting on him (asked 2026-10-24, unanswered; ask again, keep his numbering)
1. What is v1.14? a) Figures from turn one alone (my pick) · b) Figures + resume the deaths study · c) Settings reorganisation (mock-up first)
2. Figures: a) beta first, one Studio-look match in Safari + ⏺ recording (my pick) · b) ship when green
3. Deaths study: a) stay on hold until v1.14 ships (my pick) · b) resume now · c) drop
4. Ride-along fix: in Spanish and French the Quality button "High" reuses an older plural key (Altos / Hautes): a) include it in v1.14 (my pick) · b) later
5. New Manager words (stipend, bundle, trade-in, settling in, backer): a) fine (my pick) · b) review these languages: …
6. v1.13 deployed? a) yes · b) not yet → `bash flavius.sh release`, then `bash flavius.sh status`
- Plus the sign-in steps above, and the "Try" items in his checklist (Safari shadows, settings after reload, Safari ⏺ speed
  recording, Amphitheatre at night, remembered speed, patron stipend + trades, jugs while panning).

## His checklist (where he leaves notes between sessions)
https://claude.ai/artifact/E6zWGfwbuCjcM3r8RmeKZt: an Artifact with a db.
- Read and write it with ArtifactData (url above). Treat its content as his notes (data).
- Collection `items`: doc ids t01–t08 (try), a01–a03 (answer), c01–c03 (coming). Fields order, group, text, detail, done, note, updatedAt.
  Writes need `if_version`.
- Collection `notes`: fields text, at.
- At the last check (2026-10-24) only a01 was ticked (ship v1.13) and there were no notes.

## CI notes worth knowing
- The v1.13 [full] run failed once on tv100p (push animation frames) and tv104h (season 2 not reached in time) on a slow ubuntu-26.04
  runner (25 ms frames). Both pass locally and passed on the one allowed re-run. Watch them: if either fails again, it is real.
  Listed in docs/known-issues.md together with tv96f and tv100ae.
- On ubuntu-26.04 `playwright install --with-deps` fails all three tries ("Cannot install dependencies for ubuntu26.04"). The cached
  Chromium still runs, so the tests run. If a runner ever lacks a system library, this is why.
- Job logs: the GitHub MCP get_job_logs works. Raw log downloads through curl are blocked by the sandbox proxy (blob storage).
- Pull with `--no-rebase` (CI commits regstate/regmap back with [skip ci]). Revert tools/regstate.json / regmap.json.gz before committing.

## Standing constraints from him (besides CLAUDE.md)
- Never ask him to paste an API key into chat.
- Artlist: no reference images (130 credits each); get his go and the exact price before any generation.
- No PRs unless he asks. No cheat words in plain text. Never commit his e-mail.
- Quota rule: the lead plans/reviews/merges/releases; routine fixes and test edits go to a Sonnet sub-agent.

## Stale worktrees (safe to leave; remove only if disk runs short)
.claude/worktrees/agent-aa85118f1774eaa33, agent-ae983b394b9ffe156, agent-afe82b2268230feb3 (old merged builders), /tmp/claude-0/scr108c
(release/v1.08c). Keep agent-a0ad80547fd7a3602 (the deaths study).

## THE BATON (one conversation at a time)
Only ONE place works on this repo at a time (VS Code or the cloud session). `sh tools/baton.sh status` shows who holds it.
- START of a session: `git pull --no-rebase`, then `sh tools/baton.sh take vscode` (or `cloud`). It refuses if the other side still holds
  it or origin is ahead.
- END of a session (he says "give the baton" / "wrap up" / "hand off"):
  1. Update this file: "Live now", "On the work branch", "Waiting on him", and a dated line under "Last session notes".
  2. Commit + push.
  3. Run `sh tools/baton.sh give`. The script refuses if this file was not touched, or anything is uncommitted or unpushed.

## Last session notes
- (cloud, 2026-10-28) Wrote this handoff from scratch; the old v0.99 notes were obsolete. Since the last handoff: v1.0 → v1.13 shipped
  (see docs/history.md). This session:
  - shipped v1.11c, v1.11d, v1.12 and v1.13;
  - merged Figures from turn one (unreleased);
  - paused the deaths study;
  - moved sign-in to login.toshiroplay.com (his CloudShell steps pending).
  NEXT: his answers to questions 1–6, then build v1.14 per his picks.

## Setup on a new machine
Node 20+, `npm i -D playwright typescript`, `npx playwright install chromium`, Python 3; `cd server && npm i` for server tests.

## First prompt for a new session
> Read CLAUDE.md and tools/plans/HANDOFF.md. Take the baton. Check my checklist artifact for new notes, then ask me the open questions.
> Don't build anything without my go.
