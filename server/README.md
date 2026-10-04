# Flavius Rule — the Online Arena server

One CloudFormation stack: a WebSocket API (API Gateway), one Lambda (Node 24, arm64, 256 MB), one DynamoDB table
(on demand, entries expire on their own), Cognito sign-in with Google, and a monthly budget alarm by e-mail.
The game page talks to it; the shared rules (`src/onlcore.js`) are the same file the game uses.

## What it costs
- Nothing fixed: every piece is pay-per-use. A quiet month with a few test matches is a few cents.
- A 4-player match ≈ 1,000 WebSocket messages + ~300 small database writes → roughly **$0.002 per match**.
  1,000 matches a month ≈ $2–3; 10,000 ≈ $15–25.
- Cognito is free up to 10,000 monthly sign-ins. Lambda stays in the free tier at this size.
- The budget e-mails you when the month's forecast passes `BUDGET` (default $10). When the real spend reaches it, the arena
  **closes itself** (the arena Lambda's concurrency goes to 0: nothing runs, nothing is billed, nothing is deleted) and players
  see "the online arena is closed for now". It reopens on the 1st of the month, or by hand with the stack's `ReopenCommand` output.

## One-time: a Google sign-in client (5 minutes)
1. https://console.cloud.google.com → create (or pick) a project → **APIs & Services → OAuth consent screen**:
   External, app name "Flavius Rule", your e-mail; publish it when ready.
2. **Credentials → Create credentials → OAuth client ID** → *Web application*.
   - Authorized JavaScript origins: `https://flaviusrule.com`
   - Authorized redirect URIs: leave empty for now (step 4 gives you the exact one).
3. Keep the **Client ID** and **Client secret** for the deploy (never paste them into a chat).

## Deploy (AWS CloudShell, in the region you want — us-east-1 is cheapest and simplest)
1. Upload `server/` as a zip (CloudShell → Actions → Upload file), then `unzip flavius-server.zip && cd server`.
2. First deploy:
   ```
   GOOGLE_ID='your-client-id' GOOGLE_SECRET='your-client-secret' sh deploy.sh you@example.com
   ```
   (`AUTH_PREFIX=...` if `flaviusrule-arena` is taken; `BUDGET=20` to change the alarm.)
3. It prints the outputs. Copy **GoogleRedirectUri** into the Google client's *Authorized redirect URIs* (step 2 above).
4. Confirm the budget e-mail AWS sends you.
5. Make `play/online.json` on the site (next to the game's index.html) — exactly this shape:
   ```
   {"ws":"<WebSocketUrl>","auth":"<SignInDomain>","client":"<UserPoolClientId>"}
   ```
   Upload it with the same no-cache header as index.html. The game reads it and switches from the mock to the real server.

Updating later: run the same `sh deploy.sh you@example.com` (with the GOOGLE_ variables) after replacing `src/`.

## Online testers (v0.83)
`TESTERS='first@gmail.com,second@gmail.com' GOOGLE_ID=… GOOGLE_SECRET=… sh deploy.sh you@example.com` — the Google e-mails that may use
**admin.grant** (coin, gifts, gear, offerings, Glory) on their OWN house and active gladiator. The list is a stack parameter (NoEcho) → the
Lambda's `TESTERS` environment variable; it is never in the page or the repo, and only a yes/no rides on a connection. Left out of a later
deploy, the stack keeps the list; `TESTERS=none` clears it. Changing it is a template parameter → a full stack deploy. A house that ever got
a grant is a **TEST house** for good: Custom only (code `testHouse`), never in Today, the rank counts, the wagers' top list or Victor of the
Day; its gladiators wear a TEST chip. Every grant is logged in the table (PK `ADMIN`, SK `log`).

## A test stack (optional)
`STACK=flavius-arena-test AUTH_PREFIX=flaviusrule-arena-test DEV=true sh deploy.sh you@example.com`
lets anyone sign in with a typed name — use it only for testing, then `aws cloudformation delete-stack --stack-name flavius-arena-test`.
In the game: Online → sign-in → **Online server** → paste `{"ws":"<its WebSocketUrl>","dev":true}`.

## Locally (no AWS)
```
cd server && npm install && npm test          # the requests on an in-memory store
node test/localws.js 8787                     # the same Lambda on ws://127.0.0.1:8787 (dev sign-in)
```
The game's regression test `tools/tests/tonlws77.js` plays two windows against that local server.

## Anti-cheat
- The server alone holds dice seeds, move order, wallets, gear, ranks, wagers and deaths; every buy/bet/gladiator is checked
  against the shared rules.
- A move may only speak for the sender's own seat.
- Results by agreement: every player reports the whole results table; the majority table is paid out. Two players who disagree
  → the match is void (no pay, no deaths, wagers refunded) and both get a strike; 3 strikes → matched only with other struck accounts.
- Leaving doesn't save a gladiator: after 3 minutes away a CPU takes the seat and the Fate still applies.
- Not covered yet: peeking at hidden cards with browser tools (needs the game engine on the server — the bigger option).

## Watching, tickets and parties
- 👁 Watch: anyone can follow a live match for free (up to 30 watchers). A watcher gets a fresh snapshot from a fighter, then
  every move as it happens; watchers never move.
- 🎟 Tickets: sold until the horns (up to 8 per game). A ticket holder sits in the stands as a human spectator and takes the
  engine's own stands turn each rotation (stones, offerings, change section, chant). The ticket coin goes into the wager pot:
  winning bets share it; with no winning bet it goes to the winning fighters; a game called off or void refunds every ticket.
- 👥 Parties: share a 5-letter code (up to 4). The leader picks the game; the whole party sits down together, on one team in
  team events (Familia 2 v 2).

## v0.80 (protocol 4, server-8): rooms, quick chat, the Forum, presence, the map
Deploy this server BEFORE the v0.80 page (`sh deploy.sh <email>` with `AUTH_DOMAIN=none` until the custom-domain swap); older pages
are refused with "Please reload".
- **Rooms.** A lobby is a room of up to 8 lanistas: the event's seats sit (Classics exactly 4, Familia 4–8), the rest stand. The host
  changes event, city, seats, teams, ticket and rules until the horns (`lobby.set`); fewer seats → the last to sit stand up. Ranked/Custom
  is fixed at creation. 👑 `lobby.host` gives the room away (an unseated new host takes the old host's seat); a leaving host hands it to
  the earliest joiner still there. `lobby.kick` removes someone for 5 minutes. Team events: players pick teams in Custom
  (`lobby.team`), Ranked is balanced at the horns (parties together). At the horns the unseated leave with a "started without you" push.
  Every `lobby.update` push carries the whole changed room, so clients never re-read the list; lists (`hello`, `lobby.list`) send
  small rows (< 1 KB) for every room but your own.
- **Quick chat.** No free text anywhere online. Phrases are codes (`lobby.say` in rooms, `match.say` as bubbles during and 10 minutes
  after a match, `forum.say` on the landing), one per 3 s (Forum 10 s) per account. Room phrases are their own small items
  (`CHAT#…`, kept a day), so a line never rewrites the room. 🔇 `forum.mute` (≤ 50): a muted lanista's phrases, calls and
  invitations never reach you.
- **The Praeco.** `lobby.quick` (the playlists) sits you in the fullest fitting room or opens one — never twin rooms; a new room is
  cried in the Forum to free lanistas who fit (same strike group, Ranked = same rank, not fighting, at most 40, newest first).
  📣 `lobby.call`: 3 calls a room (the opening counts), 2 minutes apart, only with a free seat. ✉ `lobby.invite`: one every 4 s,
  the same lanista once in 2 minutes, 15 an hour. ⚔ `lobby.again`: a room like the last match, its lanistas invited.
- **The Forum.** The landing's feed: phrases, opened rooms, calls and results (`FORUM` items, kept a day, the last 30 shown).
  A daily meter (`WORLD FMETER#<day>`) stops live Forum pushes after 100,000 in a UTC day; lines are still kept and shown.
- **Presence and the map.** An open socket marks the account `GSI1PK 'ON'` (no extra table); closing it — or a push that finds it
  gone — clears that only if it is still the account's newest socket. `hello` returns `{n, fight, wait, zones}`: the only location
  is the browser's time-zone name (e.g. `Europe/Rome`), counted per zone; no IP addresses are kept. The Lambda caches the list 20 s.
- **Majority resync.** `match.hashq` / `match.hasha` relay state hashes between the live humans of a match; `match.odd` votes that a
  seat is out of step — a strike once a match when a majority of 3+ humans agree.
- **What it costs.** A phrase = 1 small write + one push per listener; a call/opening ≤ 40 pushes. At 10 players about $0.10 a
  month; at 200 at once about $5–8 a month (mostly WebSocket messages, $1 per million). The Forum meter caps its pushes at about
  $0.10 a day; the map adds about $0.05 a month at 10 players, $1–1.50 at 200. The budget switch still closes everything at the limit.

## Efficiency notes (why it is cheap)
- A move = one DynamoDB update (returns the seq and the players' connections) + one small put + one push to each other player.
- The match record stays small (the 15 KB opening lives in its own item): DynamoDB bills updates by item size.
- Opening the Online window is one request (`hello` with everything); the socket closes when you leave Online.
- Lobbies, inputs and connections expire (TTL) — no clean-up jobs, no storage growth.
