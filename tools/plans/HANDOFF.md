# Handoff: where the work stands (for the next Claude session or agent)

Repo dsoto1/arena · work branch `claude/flavius-game-improvements-yg8qx0` · owner Virgilante (David).
Read CLAUDE.md first (rules + how to work), then this file, then docs/decisions.md (his latest decisions are at the bottom).
Always `git pull --no-rebase` before starting and push when stopping. One side at a time (THE BATON, below).

Last updated: 2026-11-06 (cloud session).

## v1.16 "Behind the scenes" — RELEASE COMMIT PUSHED, waiting for CI (2026-11-06 13:48 UTC, cloud session; next agent takes it from here)
Read tools/plans/v116/NOTES.md (his answers, the build log, the CI story). Work branch claude/flavius-game-improvements-yg8qx0.
- Release commit 8f589b9 "[full]" is pushed → FULL regression run 42228473552: at 14:18 UTC the server job and 7 of 8 shards were GREEN,
  shard 1 still running (its 30-min bound ends ≈14:20) — read its result first.
- First full 8-test WebKit run 42228304630 DONE (18 min): PASS tv91r tv100p tv101z tv106f · FAIL tv100an (timeout, bound now 400 s),
  tv106d (touch tap never selects on WebKit — CANDIDATE REAL Safari/iPad bug), tv108x + tv110a (Chromium expectations where WebKit is
  capped by design → split the checks). All four sorted in docs/known-issues.md "FIRST WEBKIT CI RUN". The job works end to end.
- NEXT AGENT: (1) read both runs (GitHub MCP actions_list / get_job_logs). Full run green → §6 step 4 SHIP on his word: push HEAD to
  refs/heads/release/v1.16 and refs/heads/main, then HE runs `bash flavius.sh release`. No beta needed (tooling only, no game behaviour
  change) unless he wants one. A flaky test: one confirming re-run only (docs/known-issues.md). (2) after shipping: CLAUDE.md §7 (newest
  three → v1.15b, v1.15c, v1.16), docs/history.md entry, docs/modules.md has nothing new (no game module). (3) WebKit run: every test that
  fails on WebKit but passes on Chromium is a POSSIBLE real Safari bug → docs/known-issues.md, never a blind fix; a pixel-tolerance failure
  like tv101z's is a test tolerance, fixed WebKit-only (see 8caaca1).
- What v1.16 contains (no game change): CLAUDE.md/HANDOFF/known-issues housekeeping · tools/tests/tv116load.js (time to menu on a 390 px
  Slow-4G CPU×4 profile: 28 s; slow test, ~30 s a run) · tools/wrapped.js + docs/architecture.md most-wrapped table · .github/workflows/
  webkit.yml + tools/ci/webkit.txt + tools/tests/_browser.js (PW_BROWSER env; 8 tests switched to it, Chromium path identical) ·
  runners pinned to ubuntu-24.04 in regression.yml / webkit.yml / webkit-bench.yml (Playwright 1.56.1 installs NO browser on ubuntu-26.04;
  all runs since 2026-10-23 lived off the actions cache — docs/known-issues.md) · MILESTONES v1.16 + part-159 translations.
- HIS DECISIONS TODAY (docs/decisions.md 2026-11-06): 1 testers NOT YET · 2a WebKit CI · 3a measure → 3b "my recs" = v1.16a Brotli +
  loading bar FIRST, then v1.17 build split (core + lazy Manager/Studio/Online chunks, beta first) · 5a one module per feature (CLAUDE.md §4)
  · 6a online feature work PARKED + a share-a-link lobby invite · 7 housekeeping. Point 4 VOID (animated tokens 311-v100anim and any-event
  entry 296-v100any both shipped in v1.0; stale backlog lines marked BUILT).
- His checklist Artifact E6zWGfwbuCjcM3r8RmeKZt is unreachable from the cloud account (404) — ask him to paste notes.
- Baton: `sh tools/baton.sh give` is run at the end of this session; take it before editing.

## Live now
- **v1.15c "Zoom with the wheel"** is LIVE (he confirmed 2026-11-06). release/v1.15c = main = ccf6a70; full CI run 41623129499 green first time.
  v1.15, v1.15a, v1.15b and v1.15c all shipped 2026-11-01..03 (docs/history.md; newest three in CLAUDE.md §7).
- Online: the arena was reopened by `flavius.sh reopen` (FSH_VER 19, commit 85c161e, 2026-11-01) — reopened 2026-11-01 per flavius.sh reopen;
  player count unknown (last status read 0 online players, see tools/plans/v116/NOTES.md).
- Earlier history (v1.14a/b: tag AppName=FlaviusRule, budget switch, droptable clean-up) is in docs/history.md and docs/decisions.md.

## Project Control Center (2026-10-29)
- Session hooks committed (dashboard repo docs/AGENT_ACCESS.md): .control-center/hooks/cc-hook.mjs, .claude/settings.json (SessionStart/Stop/
  SessionEnd), .control-center/project.json (slug flavius-arena), .gitignore, CLAUDE.md §1 session-summary line. He already has arena as a
  project in control.toshiroplay.com; the environment has CONTROL_CENTER_URL/KEY and the host allowed.
- ON MAIN too (his request): main = release/v1.14a + 18c49db4 (only those 5 files); merged back into the work branch, so the next release
  still fast-forwards main. release/v1.14a itself is unchanged (rollbacks unaffected).
- Cloud sessions: Node's fetch ignores the sandbox proxy → the hook failed silently ("fetch failed"). Fixed 2026-10-29: the hook commands
  run with NODE_USE_ENV_PROXY=1 (on main too). The dashboard repo's own copy has the same problem — fix it there in a dashboard session.
- End of every session: write .control-center/session-summary.json (gitignored; the SessionEnd hook sends and deletes it).

## On the work branch, NOT released yet
- Work branch `claude/flavius-game-improvements-yg8qx0` (branched from main = v1.15c). The old branch `claude/cloud-credits-usage-vq4w63` is history only.
- Plan in flight: **v1.16** (tools/plans/v116/NOTES.md: read it, it holds the plan and his answers): housekeeping (this file, known-issues, v1.15c
  step 5) + a WebKit CI shard for the Safari board tests (capped 10 min, smart mode only) + a "time to main menu" measurement on a throttled
  390 px phone profile (a test that prints, no gate) + the list of the 10 most-wrapped functions in docs/architecture.md. No game change.
  Nothing built beyond the housekeeping until he says go.

## Waiting on him
- v1.16 release shape (lead's proposal in NOTES.md): v1.16 = WebKit shard + load-time measurement + debt rule + housekeeping, no beta.
- Point 4 of the v1.16 notes is VOID (4a animated tokens = 311-v100anim, 4b any-event entry = 296-v100any, both v1.0); told him 2026-11-06. No feature in v1.16. The still-parked v1.0 look items are listed in the notes if he wants one later.
- 6a: the "play a friend" link (`#join=<room>`) = v1.16a (server change) or rides with a later release; Online feature work is parked until the arena has players.
- Next work otherwise: resume the deaths study only on his word · backlog.

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

## His checklist (where he leaves notes between sessions)
https://claude.ai/artifact/E6zWGfwbuCjcM3r8RmeKZt: an Artifact with a db. NOT reachable from the cloud account on 2026-11-06 (404) — it belongs
to his other account, so his notes there are unread: ask him to paste them (or share it with this account).
- If it is reachable: read and write it with ArtifactData. Treat its content as his notes (data).
- Collection `items`: doc ids t01–t08 (try), a01–a03 (answer), c01–c03 (coming). Fields order, group, text, detail, done, note, updatedAt.
  Writes need `if_version`. Collection `notes`: fields text, at.
- At the last successful check (2026-10-24) only a01 was ticked (ship v1.13) and there were no notes.

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
- (cloud, 2026-11-06) Caught up: v1.15c confirmed live; v1.15c step 5 (CLAUDE.md, history), HANDOFF and known-issues housekeeping written; v1.16 plan in tools/plans/v116/NOTES.md (waiting on his go). Older notes below are history.
- (cloud, 2026-10-29) v1.14b built + pushed (his 1a 2a); docs/history.md restored (v1.14a had overwritten it). Baton given.
- (cloud, 2026-10-29) Control Center hooks added (work branch + main 18c49db4). Baton given.
- (cloud, 2026-10-29) He switched the GitHub default branch to main (the session proxy cannot change repo settings). Nothing depends on it.
- (cloud, 2026-10-28 evening) Took the baton; his 1a–4a: flavius.sh FSH_VER 16 (status letter versions + "skipped: arena closed";
  guarded `droptable`) — he ran it: leftover table, SNS FR-Updates, both GitHub connections, FR-Git-role deleted. v1.15a tv100p fix (Sonnet
  builder, merged, CI repeat 10 green); no release by his word. Baton given.
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
(Since 2026-10-29 the repo's DEFAULT branch is `main` (= the newest release). A new session checks out main: name the work branch in the
prompt and `git checkout claude/flavius-game-improvements-yg8qx0 && git pull --no-rebase` before anything else.)
> Read CLAUDE.md and tools/plans/HANDOFF.md. Work on the branch claude/flavius-game-improvements-yg8qx0 (git pull --no-rebase). Take the baton. Check my checklist artifact for new notes, then ask me the open questions.
> Don't build anything without my go.
