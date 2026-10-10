# Handoff: cloud session <-> VS Code (API credits)

Branch: `claude/cloud-credits-usage-vq4w63` (v0.99, unreleased). Always `git pull` before starting, `git push` when stopping. One side at a time.

## State
- All V99 fixes and everything already built are committed and pushed (last: 1aea7fc). `sh build.sh` ends SYNTAX_OK.
- v0.99 = fixes + what is built; features and mock-ups wait for v1.0 (tools/plans/backlog.md, "V99 notes").
- Known: tv86 (Spanish walk) fails until the new v0.99 strings are translated.

## Remaining for v0.99
1. Translation pass: `sh tools/i18n/prep.sh` -> ONE agent with tools/i18n/TRANSLATE.md -> `sh tools/i18n/finish.sh` (costs tokens: ask first).
2. MILESTONES entry at the top of src/34-notes.js; badge bump `arena · v0.99` in src/01-head.html.
3. `sh tools/release.sh 0.99` (or the GitHub full run: [full] in the commit message). One full run only.
4. Update CLAUDE.md version line / history; commit + push; he runs `bash flavius.sh release`.
5. Studio designers frame job (module 267-v99designers) was killed by the spend limit; its worktree is unmerged. Restart only if he asks.
6. Re-test online 9a-9c with two real windows; Profile page (7a) needs his report if it still fails (Settings -> Error log).

## In progress right now
- Nothing is running. No agents, no CI runs, no unpushed work. The branch is the single source of truth.
- The only open job is the v0.99 release (see "Remaining for v0.99"). The last work done was the V99 fixes batch.
- The Studio designers frame job (267-v99designers) is parked: its worktree is unmerged and it was killed by the spend limit.

## Needed from him (Virgilante)
1. A "go" on the translation pass (costs tokens: ONE translate agent, prep.sh -> agent -> finish.sh). Until then tv86 stays red on purpose.
2. Test Online with two real windows: no "Hand to CPU" / "Take control" online (9a), lobby Start/Ready bar, and that 9b/9c desync no longer happens.
3. If the Online Profile page is still blank: send what it says (the reason + ref code) and Settings -> Error log -> Copy.
4. Decide: restart the Studio designers frame job now, or leave it for v1.0.
5. After the release is pushed, he runs `bash flavius.sh release` in CloudShell.

## Waiting for v1.0 (do not start without his go)
Mocks: Play Now layout, sandstone buttons/pop-ups, bubbles system, lobby banner/seats. Features: event carousel, option example cards, custom beast guard zones, Resume after refresh, Domus slot progression, spectator support. Server batch: remove online wagers, online results screen/cleanup wording, ranked verification interim. Full list: tools/plans/backlog.md.

## THE BATON (one conversation at a time)
Only ONE place works on this repo at a time (VS Code or the cloud session). `sh tools/baton.sh status` shows who holds it.
- START of a session: `git pull`, then `sh tools/baton.sh take vscode` (or `cloud`). It refuses if the other side still holds it or origin is ahead.
- END of a session (he says "give the baton" / "wrap up"): Claude must (1) update "Last session notes" below with what was done, decisions, mocks made (paths), open questions; (2) commit + push; (3) run `sh tools/baton.sh give`. The script refuses if HANDOFF.md was not touched, anything is uncommitted or unpushed.
- Claude: at the start of any session read BATON and remind him to take it; if the other side holds it, say so and stop before editing. If he says "keep me honest", check `sh tools/baton.sh status` before every build.

## Last session notes
- (cloud, 2026-10-10) BUILT the v0.99 fix4 batch (272-v99fix4 + small edits in 04-rules/07-ui/106/133/29; test tv99q; shots tools/plans/fix99b/). Touched tests green (tv99q tv94m tmgr47 tv96m tv95c + earlier set). NEXT: translation pass (ask him first) -> badge + MILESTONE -> release.
- (cloud, 2026-10-09 end of day) WHERE WE LEFT OFF: nothing built. His 28-item notes + answers are in tools/plans/backlog.md (sections 'NOTES LIST', 'HIS ANSWERS' x2). Rank for restricted events = rating grade (22a). NEXT: wait for his 'go' on the v0.99 fixes (3a 4 5 6 9 10 14 18 23 24 25 26 27 + My ludus fallen-count bug; item 11 = test only), then translation pass (ask first, costs tokens) -> badge + MILESTONE -> release. No auto-start was authorized. Baton: held by cloud.
- (cloud, 2026-10-09 later) VS Code on API credits was tried and BACKED OUT: the API key kept returning "credit balance too low" even though the org shows $199.99 of $200 promo credits (expire 2026-11-05). Work stays in the cloud session for now; VS Code did no work. Baton taken back by cloud (force; no commits from VS Code). If retried: create a key in the org that holds the credits, `/status` must show that org.
- (cloud, 2026-10-09) Moved work to VS Code on API credits. Added HANDOFF.md, PLANNING.md and the baton. No code changes pending. Next: his go on the translation pass, or planning the v1.0 mocks listed in PLANNING.md.

## Standing rules (see CLAUDE.md too)
- No sub-agents and no GitHub Actions runs without asking first (keep costs low). Run only touched tests: `node tools/smartreg.js <names>`.
- Do not build lists/features until he says go; fixes go straight in.
- Never commit his email; no secrets in chat or repo. No cheat words in plain text. No PRs unless asked.
- Commit trailers per the session reminder; `[skip ci]` on non-release commits; push only to this branch.
- Wrap earlier functions in new modules (before src/08-setup.js in build.sh).

## Setup on a new machine
Node 20+, `npm i -D playwright typescript`, `npx playwright install chromium`, Python 3; `cd server && npm i` for server tests.

## First prompt for the VS Code session
> Read CLAUDE.md, tools/plans/HANDOFF.md and tools/plans/backlog.md. We're on branch claude/cloud-credits-usage-vq4w63, v0.99 unreleased. Don't start anything without my go. Keep costs low: no sub-agents, run only touched tests.
