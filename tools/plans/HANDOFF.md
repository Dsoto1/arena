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
