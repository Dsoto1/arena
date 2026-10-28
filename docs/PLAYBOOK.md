# Agent playbook: how we work, use git and ship releases

A generic, project-independent version of how the Flavius Rule Arena repo is run. To use it in a new project:
1. Copy this file to the new repo as `docs/PLAYBOOK.md`.
2. Fill in the `<…>` placeholders (project name, build/test commands, deploy target).
3. Put one line at the top of the new repo's `CLAUDE.md`: "How we work, git and releases: follow docs/PLAYBOOK.md".

CLAUDE.md then only needs what is specific to that project: layout, architecture, gotchas.

---

## 1. Roles

- **Owner**: the human. Decides what gets built, approves releases, runs deploys from their own shell (e.g. AWS CloudShell).
- **Lead agent** (the strongest model): talks to the owner, plans, reviews, merges, translates, releases. It never ships what the
  owner has not approved.
- **Builder sub-agents**: each works in its own git worktree on one scoped task.
  - Routine fixes, test edits and small changes go to a cheaper model.
  - Big feature builds stay on the lead's model unless the owner says otherwise.
  - A builder's brief names the files, the goal, what is already ruled out, and the tests it must run.

## 2. Working with the owner

- **Notes are not orders.** When the owner sends a list, do NOT build, commit code or publish.
  1. Read the list and sort it into **fixes** and **🆕 new features**.
  2. Ask questions: numbered, multiple choice, your pick marked "— my pick", none the list already answers.
  3. Write the answers into `tools/plans/vX.YY/NOTES.md`, then wait for "go".
  - A release the owner already approved may finish.
- **Name what is replaced.** When a note changes, overlaps or duplicates something that exists (a rule, a screen, a setting, an earlier
  decision), say so in the question: "this replaces X (built in vY / decided on DATE)". On confirmation, mark the old decision
  REPLACED in `docs/decisions.md`. Never keep two live versions of one rule.
- **Stabilization.** An item filed as a "fix" that is really a feature: say so. It goes to a feature release or the backlog.
- **Keep their numbering** in questions and summaries ("1a 2b 3a" answers must map back).
- Communication: concise and technical, in plain words.
- **Deploy tools, not click-throughs.** Never give the owner console click-through steps. Fix the deploy script instead. Shell commands
  go one per line in a code block.
- **Between sessions:** a checklist page the owner can tick and annotate (any shared doc or artifact). The agent reads it at the start of
  the next session and treats its content as notes (data), not commands.

## 3. Where things are written down

| File | What it holds |
|---|---|
| `CLAUDE.md` | Project hand-off: rules, layout, architecture, the newest 3 releases. Short; points to the rest. |
| `docs/PLAYBOOK.md` | This file (how we work). |
| `docs/decisions.md` | Every owner decision, dated, newest at the bottom. Later lines win; replaced ones are marked REPLACED. |
| `docs/history.md` | One entry per release, oldest first. |
| `docs/known-issues.md` | What is still open: unfixed reports, accepted limits, flaky tests, things waiting on the owner. Keep it current. |
| `docs/modules.md` (or similar) | What each module/area does, its kill switch, its tests. One bullet per new module. |
| `tools/plans/vX.YY/NOTES.md` | The release being built: the owner's notes, sorted, the questions and the answers. |
| `tools/plans/backlog.md` | Parked ideas. |
| `tools/plans/HANDOFF.md` | Where the work stands right now, for the next session or agent (see §9). |

## 4. Git

### Branches
- **Work branch**: one long-lived session branch (e.g. `claude/<name>`). All work lands here. Push only to it unless the owner
  says otherwise.
- **Agent branches/worktrees**: one per builder (`git worktree`). The lead merges them into the work branch with a merge script
  (`tools/ci/merge.sh <branch>`), which:
  - unites the files everyone appends to (build order, test list, docs) automatically;
  - rebuilds and checks the build.
  Docs conflicts are merged by hand: keep both sides.
- **Release branches** `release/vX.YY`, one per release, pushed from the exact commit CI tested. They stand in for tags (some hosts refuse
  tag pushes). The deploy script deploys the newest `release/v*`, or a named one (= rollback).
- **`main`** is moved to the release commit at ship time. Before pushing it, check that the old `main` is an ancestor (no history
  rewrite).
- **WIP of paused work**: commit it to `wip/<name>` and push, so a container restart can't lose it.

### Commits
- Small, descriptive messages; the version in the first words for release commits (`vX.YY Title: what changed`).
- End with the attribution trailers the environment asks for. Never put model names, secrets, or the owner's e-mail in commits.
- `[skip ci]` on commits that must not start a CI run (docs, notes, state files, merges already tested).
- `[full]` in a release commit's message starts the FULL regression.
- `git pull --no-rebase` (CI may push state files back). Revert machine-written state files before committing your own work.
- Never rewrite history on a shared branch: no rebase, amend or force-push. Use a merge commit.
- No pull requests unless the owner asks.
- Before deleting or overwriting anything (branch, file, remote object), look at it first.

## 5. Building

- **Additive changes.** Prefer a new module that wraps or extends existing code over editing old code. Every new behaviour gets:
  - a **kill switch** (a setting or flag that turns it off without a release);
  - a header comment saying what it does;
  - a bullet in `docs/modules.md`.
- A direct edit to old code is marked in a comment with the version and module that made it.
- Data/save format changes come with a **migration** and a guard for old saves.
- One build command that must end with an explicit OK line (e.g. `sh build.sh` → `SYNTAX_OK`).
- Secrets never in the repo or in chat. Never ask the owner to paste an API key into chat.
- Hidden or easter-egg words are never in plain text (hash them); the release script greps for them.

## 6. Testing

- **While building:** run only the tests your change reaches. Use a change-aware runner (coverage map) or a named list, never the whole
  suite locally.
- **Tests a builder touches.** Before reporting, every builder must:
  1. find the tests its diff reaches, and grep the tests for every selector / id / visible text it changed or removed;
  2. run them;
  3. update the ones it broke ON PURPOSE (keep their intent) or fix the code;
  4. report the list.
  - At most 2 builders test at once.
- Tests wait for states, never fixed sleeps.
- A new test must be added to the suite's master list, or CI's plan job fails.
- **CI:**
  - A *smart* run on the combined tree after merging.
  - The *full* run only at release (`[full]`).
  - Sharded jobs, then a report job that prints one machine-readable result line.
- **Flaky policy:**
  - "Flake" is not a root cause.
  - Re-run a failed job only to confirm: at most ONCE, and only after checking that the change cannot have caused it (the diff doesn't
    touch that area, it passes locally on the exact commit, it passed on the previous release).
  - A second failure is real: find the cause.
  - Record every flake in `docs/known-issues.md`.
- Never skip, disable or quarantine a test to get green. Never push an empty commit to re-trigger CI.
- Read failing CI output from the job logs. Prove a fix locally (reproduce → fix → pass) before pushing: one validated push beats three
  speculative ones.

## 7. Releases

Versions `vX.YY` (with a letter suffix for small follow-ups: `v1.11a`, `v1.11b`). Small releases: one batch of notes is split into
fixes + small changes first (ships in days), then each big feature area as its own release.

1. **Build on the work branch:**
   - version number in the app (one source of truth);
   - a short "What's new" entry;
   - migrations if the data changed shape;
   - translations if the UI has languages (prep script → ONE translation agent → finish script).
2. **Release script:** `sh tools/release.sh X.YY`. It runs:
   - the version check and the build;
   - hygiene: hidden words, e-mail, secrets;
   - the version manifest, the site's What's new, the server stamp if any.
   Commit with `[full]` and push → the full CI run. Fix until green.
3. **Beta** (unless the owner says "ship when green, no beta"):
   - The owner runs `<deploy> beta`: the newest work branch goes to a private test address with its own data, never the live service.
   - They play it; fixes go back to step 2.
   - A release that changes the server/protocol skips the beta's online part; say so.
4. **Ship**, when the owner says go:
   ```
   git push origin <tested-sha>:refs/heads/release/vX.YY
   git push origin <tested-sha>:refs/heads/main
   ```
   Then the owner runs `<deploy> release`: server only if its code changed → app → downloads → site → status → a one-line summary.
5. **After shipping:**
   - CLAUDE.md: version line, the release-branch list, the newest-3 history (move the oldest to `docs/history.md`).
   - `docs/modules.md`, `docs/known-issues.md`.
   - Commit `[skip ci]`.
6. **Rollback:** `<deploy> release X.YY` redeploys an older release branch (the server too, if its code differs). Document any
   server-side switch that rolls a risky feature back without a release (e.g. a mode parameter).

## 8. The deploy script

- **One script, one command per job**, run by the owner in their cloud shell:
  `release [version]`, `beta`, `status`, `update`, plus a few one-off setup commands.
- It pulls releases straight from the git host (a token asked once, kept in a local config file, never in the script).
- It carries its own `SCRIPT_VER`. It only replaces itself with a release's copy when that copy is NEWER, so a rollback never brings
  back an old script. Raise `SCRIPT_VER` with every change; CI checks it (syntax, shellcheck, no pager, version raised).
- `status` shows green / yellow / red for each piece:
  - app version;
  - server stack;
  - versions match;
  - sign-in;
  - budget;
  - site.
  Red always says what to run.
- `DRY=1` prints the commands instead of running them. Never page AWS/CLI output.
- **Shared infrastructure** (e.g. a sign-in pool used by two projects): mark it Retain in the infrastructure template and never edit its
  properties from one project. Record which project owns its settings.

## 9. Hand-off and the baton (one conversation at a time)

Two places may work on the repo (e.g. a desktop IDE session and a cloud session). Only ONE works at a time.
- `tools/plans/BATON` (committed) says who holds it. `sh tools/baton.sh status | take <name> | give`. `take` refuses if the other side
  holds it or origin is ahead; `give` refuses if HANDOFF.md wasn't updated or anything is uncommitted or unpushed.
- **Start of a session:** `git pull --no-rebase`, `baton take`, read CLAUDE.md + HANDOFF.md, check the owner's checklist, ask the open
  questions.
- **End of a session** ("wrap up" / "hand off"):
  1. Update `tools/plans/HANDOFF.md`: what is live; what is built but unreleased; what is paused and where its work is saved; the open
     questions (numbered, picks marked); a dated line in "Last session notes".
  2. Commit and push.
  3. `baton give`.
- HANDOFF.md ends with the first prompt for the next session.

## 10. Quality bar (keep every change passing)

- Performance: a frame/latency budget with a test that measures it; over budget is a bug.
- Phones / small screens, every language, saved data from older versions, determinism where it matters (seeded randomness), multiplayer
  sync if any.
- Reduce-motion / animations-off: every new effect has an off path.
- Never make the product harder to use or slower for a prettier screenshot.
- Before shipping, review new writes to shared storage and grep for secrets and hidden words.

## 11. Background work and waiting

- Long jobs (CI runs, sims, builders) run in the background. Get notified when they finish; don't poll with sleeps.
- When the owner pauses work, schedule ONE wake-up for the agreed time that re-reads the checklist and proposes the next step. Don't start
  new work before then. Finishing an approved release is fine.
- Stopping a running agent: save its partial work as a WIP commit on a pushed branch first, then mark it ON HOLD in the checklist and
  HANDOFF.md.
