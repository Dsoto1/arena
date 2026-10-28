# Handoff: where the work stands (for the next Claude session or agent)

Repo dsoto1/arena · work branch `claude/cloud-credits-usage-vq4w63` · owner Virgilante (David).
Read CLAUDE.md first (rules + how to work), then this file, then docs/decisions.md (his latest decisions are at the bottom).
Always `git pull --no-rebase` before starting and push when stopping. One side at a time (THE BATON, below).

Last updated: 2026-10-28 (cloud session, new account).

## Live now
- **v1.13 "The scribes check"** is the newest release: `release/v1.13` = `main` = f9aba45 (server release: Ranked results decided by
  the server's replay, enforced). Deployed (his 6a, 2026-10-28).
- Full history: docs/history.md · newest three in CLAUDE.md §7.

## On the work branch, NOT released yet
- **v1.14 built, [full] run 40691237980 GREEN** (attempt 2; attempt 1: tv100p, flaky on v1.13 too — docs/known-issues.md). Contents
  (tools/plans/v114/NOTES.md, his 1a–9a): Figures from turn one (428, translated) · Quality "High" own key (4a, tv114h) · budget counts
  only Flavius (7a: template tags + CostFilter `user:app$flavius`, flavius.sh `cost_tags`/`budget`, FSH_VER 12) = a SERVER release.
- NEXT: his BETA (2a) — `bash flavius.sh beta`, one Studio-look match in Safari + ⏺ recording. On his ok: push release/v1.14 + main, he runs
  `bash flavius.sh release` (server redeploys: tags + budget), then `bash flavius.sh status`; "budget counts" goes green only after billing
  sees the tag (≤24 h) → `bash flavius.sh budget` the next day if yellow. Then CLAUDE.md §7 + docs/history.md.
- Sign-in on login.toshiroplay.com: DONE (his word 2026-10-28). Online is closed by the budget switch until 2026-11-01 (his 9a).

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
- The v1.14 beta (above). Answers 1–9 are in tools/plans/v114/NOTES.md.

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
