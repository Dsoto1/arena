# Flavius Rule Arena

A browser adaptation of **Flavius Rule**, Virgilante's board game of gladiators fighting for the crowd's favor in a
13×13 isometric arena. It is a single HTML page (JavaScript + Canvas) with no framework and no install.

Play it at **[flaviusrule.com/play](https://flaviusrule.com/play/)**, or open `flavius-arena.html` from this folder in a browser.

## What's in the game

- **Play Now**: single events, festivals, missios and tournaments against CPU gladiators (five Intelligence tiers).
- **Manager mode**: run a ludus through 12-week seasons. You recruit, train, heal, travel the empire's cities, bet and
  build a house that lasts.
- **Creator Studio**: make your own characters, classes, beasts, weapons, armor, events, tournaments and roster sets.
- **Hot seat**: several players at one screen.
- **Online**: real-time matches (Ranked / Custom) with your Domus, gladiators, gear, auction, ranks and the Fate.
- **Languages**: English, Español, Italiano, Português (Brasil), Français, Deutsch, 日本語.

## Layout

```
src/              the game, one file per module in topic folders (src/core, src/manager, src/online, …); build.sh joins them in a fixed order
assets/           images, language packs (lang_<l>.js), minis, card art
flavius-arena.html  the built game (generated — do not edit by hand)
server/           the Online backend: AWS CloudFormation template, Lambda (WebSockets + DynamoDB), tests
tools/            build/release scripts, the regression suite (tools/tests), i18n tooling, art sources (tools/art)
share/            release outputs (not in git)
CLAUDE.md         detailed developer notes: architecture, systems, conventions, history
```

## Build and test

```sh
sh build.sh                      # → flavius-arena.html, ends with SYNTAX_OK
node tools/smartreg.js <tests>   # run named tests (Playwright + Chromium), e.g. tv89m tcity
node tools/smartreg.js --full    # the whole suite (~30 min)
cd server && npm test            # the Online server's tests
```

New code goes into a new module in its topic folder under `src/` that wraps earlier functions. Insert it in `build.sh` before `src/core/08-setup.js`.
See CLAUDE.md §3–§5.

## Releases

`sh tools/release.sh X.YY` does not change the version for you. First set the version badge in `src/core/01-head.html` and add the notes in
`src/meta/34-notes.js`. Then the script builds, runs the full regression, makes the standalone share build and writes the deploy
zips to `share/deploy/`. Deploying to the site and server is one command in AWS CloudShell: `bash flavius.sh release`
(CLAUDE.md §6).

## Translations

Player-facing text is marked with `_T`. Translations live in `tools/i18n/<lang>/part-NN.json` and are compiled by
`node tools/i18n/mkdict.js` into `assets/lang_<lang>.js`. Each language has a guide in `tools/i18n/GUIDE-<lang>.md`.
Game terms and names (classes, Fate, CF, weapons, beasts…) stay in English in every language.

## Credits

© 2026 Flavius Rule. Game design, rules and art by Virgilante; see the in-game Credits page.
