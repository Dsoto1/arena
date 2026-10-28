# Handoff: where the work stands (for the next Claude session or agent)

Repo dsoto1/arena · work branch `claude/cloud-credits-usage-vq4w63` · owner Virgilante (David).
Read CLAUDE.md first (rules + how to work), then this file, then docs/decisions.md (his latest decisions are at the bottom).
Always `git pull --no-rebase` before starting and push when stopping. One side at a time (THE BATON, below).

Last updated: 2026-10-28 (cloud session, new account).

## Live now
- **v1.14a "Behind the scenes"** is LIVE (his `bash flavius.sh release`, 2026-10-28 18:37 UTC: server deployed, game/download/site ✓; the
  switch's old log group handed over, now 7 days). `release/v1.14a` = `main`. CloudShell runs flavius.sh FSH_VER 15.
- Online is closed by the budget switch until 2026-11-01 (his 9a).
- flavius.sh FSH_VER 16 (his 1a–3a, 2026-10-28, via `update`, no release): status reads letter versions + "skipped: arena closed"; he ran
  `droptable`: the leftover table, SNS FR-Updates, both GitHub connections (AWSFR-GH-connect ×2) and FR-Git-role are DELETED; audit confirms.
  Left: the now-unattached customer policy AWSCodePipelineServiceRole-…-Git-FR-pipeline (harmless; remove only on his word). onceWeek kept (4a).
- Budget: billing had not seen the tag `app` yet at release time ("budget counts" yellow, "this month $0 of $10"). He activates the cost
  allocation tags `app`, `AppName`, `Project` (2026-10-28). The cloud session scheduled a check-in for 2026-10-29 12:45 ET; if you work in
  VS Code instead, ask him then for `bash flavius.sh status`'s "budget counts" + "this month" lines (expect green + real spend; if still
  yellow → `bash flavius.sh budget`).
- Full history: docs/history.md · newest three in CLAUDE.md §7.

## On the work branch, NOT released yet
- Nothing.

## Waiting on him (asked 2026-10-28 after his `audit` output; keep the numbering)
Findings from `bash flavius.sh audit` and the v1.14a status:
- status FALSE alarms: "game version" (its regex `arena · v[0-9.]*` drops the letter → reads v1.14 for v1.14a, also happened on v1.11d);
  "versions match … answer 500" and "ranked check … no reserved 3" are only because the arena + verifier are closed (concurrency 0).
- Tables: the second `flavius-arena-Table-…1MZ1…` was created 6 min BEFORE the stack (2026-10-03 02:07 vs 02:13), 0 items, 0 KB, no tags,
  not in the stack = left by the failed first deploy (deploy.sh deleted the ROLLBACK_COMPLETE stack; Retain kept the table). The stack's
  table is `…4CW5…` (54 items, tagged).
- FR-Site = his flaviusrule.com SITE setup from 2024-10 (tag Project=FR-Site on the site bucket, CloudFront, the ACM cert, the Route 53
  zone — LIVE, never touch). Rule `onceWeek` is active (rate 7 days, 4 runs in 30 days) → Lambda `myStatsSteam` (not this repo). Look
  unused: SNS `FR-Updates` (0 published in 30 days, 1 e-mail subscriber), two identical GitHub CodeConnections (AVAILABLE), IAM `FR-Git-role`
  (last used 2024-10-20, the day it was made).
Questions (my picks first):
1. status false alarms: a) fix in flavius.sh (letter versions; "skipped: arena closed" while the switch holds it closed) — he gets it with
   `bash flavius.sh update`, no release (my pick) · b) leave
2. the leftover table: a) delete via a guarded one-off `bash flavius.sh droptable` (refuses unless NOT in the stack AND 0 items) (my pick) · b) keep
3. unused FR-Site pieces (SNS FR-Updates, both GitHub connections, FR-Git-role): a) remove via the same guarded command, each shown + y/N
   (my pick) · b) keep
4. onceWeek → myStatsSteam: a) keep (active, not Flavius) (my pick) · b) remove
HIS ANSWERS (2026-10-28, cloud): 1a · 2a · 3a · 4a (docs/decisions.md). Not built yet — waits for his go.
Still open: what v1.15 is — a) fix tv100p (flaky, test only) (my pick) · b) resume the deaths study · c) Settings reorganisation (mock-up first).
Never write account numbers / ARNs / pool / client / CloudFront ids into the repo (CLAUDE.md §6, idscan).

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

## Waiting on him
- Whether `bash flavius.sh release` for v1.14 ran (and `status`). What v1.15 is.

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
- (cloud, 2026-10-28 afternoon) v1.14a went live; ran `audit` with him (findings + questions 1–4 above). He moved the conversation to
  Claude Code (VS Code): baton given.
- (cloud, NEW ACCOUNT flaviusrule, 2026-10-28) Took over from the other account via this file. Shipped v1.14 (+ the deploy fix for the
  deleted login.flaviusrule.com) and v1.14a (no AWS ids in the repo, audit, switch logs). His checklist artifact belongs to the OLD account:
  this account cannot read it unless he shares it — ask him to paste notes instead.
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
