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

## Efficiency notes (why it is cheap)
- A move = one DynamoDB update (returns the seq and the players' connections) + one small put + one push to each other player.
- The match record stays small (the 15 KB opening lives in its own item): DynamoDB bills updates by item size.
- Opening the Online window is one request (`hello` with everything); the socket closes when you leave Online.
- Lobbies, inputs and connections expire (TTL) — no clean-up jobs, no storage growth.
