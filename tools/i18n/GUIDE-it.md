# Italian translation guide (v0.87)

Input: `tools/i18n/src/part-NN.json` — an array of `{k, w}`: `k` = the English key exactly as the game builds it,
`w` = where it lives (`file:line`; open `src/<file>` around that line when the meaning is unclear).
Output: `tools/i18n/it/part-NN.json` — ONE JSON object `{ "<key>": "<Spanish>", … }` with EVERY key of the part.
Check it with `node tools/i18n/check.js tools/i18n/it/part-NN.json` (must report 0 errors; fix the warnings that are real).

## Voice
- Standard Italian, informal **tu** (plural "you" = voi). Concise, game-like, a little Roman flavour (Italian readers will enjoy it).
- Buttons and chips stay short — prefer the shorter synonym (Italian runs ~15–20% longer; boxes are tight).
- Match the English register: terse labels stay terse, flavour text (letters, the Acta Diurna, Fates, quotes) can be literary.
- Gladiators can be women; follow the English pronoun. Avoid gendered forms where a neutral one is natural.
- Reference: the Spanish translation of the same key (tools/i18n/es/part-NN.json) shows how each fragment was handled — use it to
  understand fragments/placeholders, but translate from the ENGLISH.

## Never change
- `{0}`, `{1}` … placeholders: each one exactly as many times as in the key (order may change).
- HTML: every tag and attribute exactly as written (`<b style="…">`, `<span class="x">`, `<br>` …) — translate only
  the visible text between tags. Never add `"`, `<`, `>` or `&` that the key does not have (use « » or ' for quotes).
- Emoji, symbols (· — ⓘ ★ ✓ ⚔ 🪙 …), numbers, `&nbsp;`-style entities, leading/trailing punctuation, line breaks.
- **Names and game terms stay English, exactly as written**: everything in `tools/i18n/names.json` (classes, ranks,
  Fate/Fates, Thumb of Flavius, Missio, Lanista, Ludus, Domus, CF, AP, HP, PvE, PvP, Focus, Mandata Flavi, Piacula,
  Blessings, Arena Chest, every weapon/armor/beast/card/offering/event/city name) plus people's names, house names,
  gods' names and Latin words/phrases (ave, rudis, summa rudis, damnatio memoriae, programmata, Acta Diurna, Consilium …).
  Weapon/armor/beast/card names stay English even inside a Spanish sentence: "Equipas el Gladius", "Leo ataca".
- Keys that are not human text (a CSS class list, an id, a file name, code, a lone symbol) → the value is the key unchanged.

## Fragments
Some keys are pieces glued together at runtime ("{0} pays", ", backing <b>{0}</b>", "— they are marked fallen in the Ludus").
Translate them so they still read correctly in place; keep the same leading/trailing spaces and punctuation shape.

## Glossary (use these every time)
gladiator gladiatore · fighter combattente · house casa · Lanista / Ludus / Domus (keep) · bout incontro · event evento · round round ·
rotation rotazione · turn turno · phase fase · Resolve / Choice / Action / End Risoluzione / Scelta / Azione / Fine · attack attaccare / attacco ·
move muovere / movimento · tile casella · the sand la sabbia · stands gradinate · crowd folla · spectator spettatore · wager scommessa ·
purse premio · coin moneta/monete · CF (keep) · weapon arma · armor armatura · location zona · head testa · chest torso · arm braccio · leg gamba ·
upper/lower superiore/inferiore · belt cintura · market mercato · draft selezione · offering offerta · beast belva · pillar colonna · spikes punte ·
key chiave · card carta · deck mazzo · injury infortunio · wound ferita · heal curare · Speed / Strength / Intelligence / Luck / Charisma
Velocità / Forza / Intelligenza / Fortuna / Carisma · rating(s) valore/valori · morale morale · fatigue fatica · fame fama · free agent svincolato ·
recruit reclutare / recluta · scout osservare · offer offerta · wage salario · contract contratto · loan prestito · week settimana · season stagione ·
bye week settimana di riposo · Match Week Settimana dei giochi · Training Yard Campo d'addestramento · Infirmary Infermeria · Recruiting Reclutamento ·
Your ludus Il tuo Ludus · letter lettera · mail posta · advisor consigliere · Main menu Menu principale · Play Now Gioca ora · Manager mode Modalità Manager ·
Creator Studio Studio del creatore · Settings Impostazioni · Saves Salvataggi · Save Salva · Load Carica · Back Indietro · Close Chiudi · Cancel Annulla ·
Continue Continua · Start Inizia · Rules & strategy Regole e strategia · Glossary Glossario · Tutorials Tutorial · Hot seat / Online / Ranked (keep) ·
Custom Personalizzata · room stanza · host ospite · seat posto · party gruppo · invite invitare · ticket biglietto · treasury tesoro ·
Storeroom Magazzino · patron patrono · gift dono · trophy trofeo · rank grado.
