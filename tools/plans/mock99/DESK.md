# The Lanista's desk (v0.99 plan, mock-up only)

The 📬 Mail panel and the ✅ weekly checklist in **Your ludus** become ONE card, *🪶 The Lanista's desk*.
- Mock: `desk.html`. Shots: `desk_1440.png`, `desk_390.png`, `desk_endweek.png`, `desk_page.png` (`node tools/plans/mock99/desk_shot.js`).
- Before: `desk_before_1440.png` (+ `_full`) and `desk_before_390.png` (`node tools/plans/mock99/desk_before.js flavius-arena.html`: a pre-made
  house, two weeks ended, one wound, 2 perk points, a swap offer, the Recruiter's and Medicus' letters).

What the before shots show: 9 envelopes and 4 to-dos sit side by side, and the rail carries two counts (`✉ 9` + `📋 4`). The things that
really need an answer (the trade offer, the invitation, the fighter asking for a fight, the rival's taunt, the Recruiter's pick) look exactly
like the news (Quaestor, Top of the table, laurels), and none of them is in the checklist or the "about to skip" list.

## Layout
1. **Header**: `🪶 The Lanista's desk` · "N wait for you · M unread letters" · 📜 Read the Acta Diurna (moved here from 202's mail header).
2. **This week** (`.sec` "This week · N to do"): one row per open item, sorted by urgency (below):
   `icon · one line (bold subject, a short muted reason, a due chip) · 📜 (only when a letter stands behind it) · ONE action button · ✕`.
   - The action is the item's own button, unchanged (`data-mg="tab"`, `data-ckskip`, `data-rec84`, `data-rl76`, `data-re95`, …).
   - Offers with two answers (trade Accept/Decline, loan, Sica's bribe, patron offer) get one **Decide ▾** button that opens the letter's body
     INLINE under the row (the existing offerbox/loanbox HTML with its own handlers) — that is the open row in the mock.
   - 📜 opens the letter the same way (read-only view of the same HTML) and marks it read.
   - ✕ = "not this week" (dismiss). Required rows (⚖ verdicts, ✝ edicts, 🦿 one chance at home) have no ✕.
   - Done and dismissed rows fold into "✓ N done · K not this week"; a dismissed row has ↶ Back on the list.
3. **Letters** (`.sec` "Letters · M unread"): everything without an action. Unread first, then the rest of this week, then "Past letters · N kept"
   (today's `w.mailLog` past mail). Rows are the parchment envelopes of today, one line each; opening one shows the body as today (advisor face
   via `advisor83`, Week in review with 229's "From your Doctores").
4. **Rail**: ONE count on Your ludus = open This-week rows (`.mcount.hot`). Unread letters no longer count (the desk header says them).
   The banner box (95's "tasks left") shows the same number.
5. **End the week**: the "You are about to skip" list (88 `endConfirmHTML` wrapper) reads the This-week rows (icon + line + due chip:
   *lost* = gone after this week, *expires*, *until wk N*); letters are never listed.
6. **Phone (≤600 px)**: rows wrap to two lines (text, then due chip · 📜 · button right-aligned), ✕ top right; the first 6 rows show, the rest fold
   with the done list ("▸ 3 more · ✓ 4 done"); 📜 Acta becomes a small button in the header; the bottom pill shows the one count.

## Where today's items go

| Source today | Kind / key | Section | Row action |
|---|---|---|---|
| 88 weekChecklist ⚖ verdicts | `w.pend` | This week, tier 1, no ✕ | Settle |
| 141 ✝ edict (fa85 rows) + its `fa85-*` letter | letter | This week, tier 1, no ✕, 📜 | Decide |
| 151 🦿 one chance at home | checklist | This week, tier 1, no ✕ | its button |
| 88 ⚔ "None of your fighters is on this week's card" / 231 onCard96 / 225 bare hands / 229 ⭐ starters | checklist | This week, tier 2 | Enter / Armory / Roster |
| 69 `fightreq` "Fighters asking for a fight" (`wantFight`) | report (mailClass) | This week, tier 2 (expires) | Enter him |
| 69 `offerbox` trade offers (47 `w.offers`, 229 offerLive95) | offer | This week, tier 3, due "answer by week N" (o.until) | Decide ▾ (inline Accept/Decline) |
| 69 `invbox` / `specbox` invitations, Flavian Awards | invite | This week, tier 3 | Pick a fighter (231's picker) |
| 69 `payjoin` pay-to-join free agent | offer | This week, tier 3 | Decide ▾ |
| 69 `loanbox.offer`, 66 `synd-warn` / `synd-spear` | offer / letter | This week, tier 3 | Decide ▾ / Pay |
| 100 `sica-bribe-*` | offer | This week, tier 3 | Decide ▾ |
| 150 patron offer (`pt87`, until week+2) | offer | This week, tier 3 | Decide ▾ |
| 108 `rivalLetter76` challenge/taunt (`data-rl76`), 77 `rival-*` Rivalry Week commit (`data-rivcommit`) | letter | This week, tier 3 (expires this week) | ✍ Answer / Commit |
| 108 `darl76` Darling vote | letter | This week, tier 3 | Vote |
| 88 ⚕ hurt, 108 🛏 bed waiting, 138 `med84-*` Medicus risks | checklist / letter | This week, tier 4, 📜 on the Medicus one | Infirmary / ⚕ To the ward |
| 88 📜 contract ends, 69 `contracts-*` report | checklist / report | This week, tier 4 (report becomes its 📜) | Renew |
| 138 `rec84-*` Recruiter's bargain / ★ pick, 249 rec98 courting | letter | This week, tier 5, 📜 | See in Recruiting |
| 88 🏋 drills, ⏳ hours, 213 🔒 lock in, 149 🎓 perk points, 225 🩹 repairs, 229 🛡 re-equip, 88 🤝 short-handed | checklist | This week, tier 5 | their buttons |
| 69 `qscard` Quaestor's ledger (Seal the ledger) | report | Letters (opening it = seal; the button stays inside) | — |
| 202 `.rev91` Week N in review + 229 growHTML95 "From your Doctores", the first week's welcome | report | Letters, pinned first while unread | — |
| Acta Diurna (`data-mg="paper"`) | — | header button; past Actas as Letters rows | — |
| 66 `consil-*` Consilium, 256 advisor laurels, 131/138 council letters without a button, 231 `lp96` next-prize, 157 `imm88_*`, 100 `sica-rumour/poach`, 140 `pg84*`, 141 `fa85bond`/`fa85res`, 66 `gift-*`, 70 `bye-*`, 69 `grow-*` (muted since 229) | letter / report | Letters | — |
| 69 `lagbox` letter from the capital | letter | Letters | — |

Rule of thumb for new code: a letter whose body holds a button (other than "File it away") is a This-week row; otherwise it is a letter.
`sendLetter` gets an optional `act:{ic,line,btn,due,tier}` so new senders choose explicitly; without it the classifier decides by the rule above.

## Urgency order (tiers, then due week, then the order the sources gave)
1. **Required**: ⚖ verdicts, ✝ edicts, 🦿 one chance at home — no dismiss.
2. **This week's card**: unentered bouts (open bouts with none of your fit fighters), empty starter slots, bare hands, a fighter asking for a fight.
3. **Answers with a deadline**: offers/invitations/challenges, sorted by `until` (this week first, "lost" before "until wk N").
4. **Care**: hurt, bed waiting, Medicus risk, contract ending this week.
5. **Planning**: Recruiter's pick, drills, hours, lock in, perk points, repairs, re-equip, short-handed.

Due chips: red "this week / lost" when the item is gone after End the week, gold "answer by week N" otherwise, none for planning rows.

## State — no save change needed
- **Dismiss**: keep `w.ckSkip {wk,s,keys}`. Checklist rows keep their `CK_KEY` keys; mail rows use their mail key (`'L:'+key`, `offer:…`,
  `invite:…`) in the same array. `tabDone73`, `ludusTodo73` and 241 keep working (they read `weekChecklist()` / `ckSkip`). ↶ removes the key.
- **Read**: keep `w.mailRead` (mail keys). A This-week row whose letter was opened counts as read; the row stays until done/dismissed/expired.
- **Past**: keep `w.mailLog` + `mailSync` as is (answered/expired rows land in Past letters as today).
- Nothing is renamed or reshaped, so no `SAVE_MIGRATIONS` entry; old worlds open with their read/dismissed state intact.

## Modules to touch (one new module, `NN-v99desk.js`, last before 08-setup)
- **New `deskItems99()`** = `weekChecklist()` rows (each tagged `src:'ck'`) + `mailLive(body)` items (`src:'mail'`), classified into
  `{sec:'week'|'letter', tier, due, ic, line, btn, ltrKey, key}`; mail rows get their one-line text from the envelope title + a short
  reason per class (offerbox → "wants X for Y + N", invbox → "invite one fighter", fightreq → names). Sorted as above.
- **69-v56** `ludusTabHTML` wrapper: today it prints `mailPanelHTML(live)+live.body` — the new module wraps it (or replaces `mailPanelHTML`) to
  print the desk; `mailSync` and the `toggle`→`mailRead` listener stay. Its rail-count wrapper (✉ N) is dropped.
- **88-v68** `checklistHTML` is no longer printed in Your ludus (the mgrHTML wrapper's todobox swap → empty); `weekChecklist` stays the source.
  The `endConfirmHTML` skip wrapper reads `deskItems99().filter(sec==='week' && !done)` instead of `weekChecklist()`.
- **95-v73** `ludusTodo73` → count of open This-week rows (the banner box and the rail oval read it); CK_KEY dismiss handler accepts mail keys.
- **202-v91ludus**: the `.lrow91` two-column row goes; Week in review still moves into the Letters list (pinned first), the Acta button into the
  desk header, the numbers into the banner (unchanged).
- **229-v95mgr** growHTML95 stays inside the Week in review letter. **241-v96skip** keeps filtering (it runs inside weekChecklist).
- **145-v85fix / 95 rail ovals**: Your ludus shows ONE oval (`.mcount.hot` = This-week open count); the `✉ N` unread oval goes.
- **36-mtutor** lesson steps that point at `#mailBox` / `.wkcheck` → the desk selectors; **i18n**: new keys (desk title, section names, due chips,
  "Decide", "not this week", "Back on the list") → wrap.js / newkeys / translations.
- **Tests**: tv56 (mail), tv68/tv88* (checklist), tv74 (dismiss), tv91l (202 layout), tv95c (growth), tv96k (skip list) read old selectors —
  update them to the desk; new `tv99d`: every source lands in the right section, urgency order, dismiss/↶, read state, end-week skip list,
  one rail count, 390 px rows without overflow.

## Open questions for Virgilante
1. Rail count = open This-week rows only (my pick), or also a small dot for unread letters?
2. Decide ▾ opens the offer inline (mock) — or straight to a centred popup like 231's invitational picker?
3. Phone: show the first 6 rows and fold the rest (mock), or all rows?
