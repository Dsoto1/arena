# French translation guide (v0.89)

Input: `tools/i18n/src/part-NN.json` — an array of `{k, w}`: `k` = the English key exactly as the game builds it,
`w` = where it lives (`file:line`; open `src/<file>` around that line when the meaning is unclear).
Output: `tools/i18n/fr/part-NN.json` — ONE JSON object `{ "<key>": "<Spanish>", … }` with EVERY key of the part.
Check it with `node tools/i18n/check.js tools/i18n/fr/part-NN.json` (must report 0 errors; fix the warnings that are real).

## Voice
- Standard French, informal **tu** (plural "vous"). Concise, game-like, a little Roman flavour. French typography: a non-breaking space
  is NOT required before ? ! : — keep it simple (a normal space before ? ! : is fine, no space is also fine; be consistent).
- Buttons and chips stay short — prefer the shorter synonym (French runs ~20–25% longer; boxes are tight).
- Match the English register: terse labels stay terse, flavour text (letters, the Acta Diurna, Fates, quotes) can be literary.
- Gladiators can be women; follow the English pronoun. Avoid gendered forms where a neutral one is natural.
- Reference: the Spanish/Italian of the same key (tools/i18n/es|it/part-NN.json) shows how each fragment was handled — use them to
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

## Plurals glued at runtime
Many keys add an English plural ending as a value: `{0} room{1}`, `{2} week{3}` (the value is "s" or ""), `entr{1}` ("y"/"ies").
Use the plural form **`{n|singular|plural}`**: it shows the first text when value n is the English singular ("" or 1) and the second otherwise.
Example: `{0} room{1}` → Italian `{0} stanz{1|a|e}`, Spanish `{0} sala{1|| s}`… (write whole endings or whole words: `{1|sala|salas}`).
Every placeholder of the key must still appear at least once (a `{n|…|…}` counts).

## Fragments
Some keys are pieces glued together at runtime ("{0} pays", ", backing <b>{0}</b>", "— they are marked fallen in the Ludus").
Translate them so they still read correctly in place; keep the same leading/trailing spaces and punctuation shape.

## Glossary (use these every time)
gladiator gladiateur · fighter combattant · house maison · Lanista / Ludus / Domus (keep) · bout combat · event événement · round manche ·
rotation rotation · turn tour · phase phase · Resolve / Choice / Action / End Résolution / Choix / Action / Fin · attack attaquer / attaque ·
move déplacer / déplacement · tile case · the sand le sable · stands gradins · crowd foule · spectator spectateur · wager pari · purse bourse ·
coin pièce(s) · CF (keep) · weapon arme · armor armure · location zone · head tête · chest torse · arm bras · leg jambe · upper/lower haut/bas ·
belt ceinture · market marché · draft sélection · offering offrande · beast bête · pillar pilier · spikes pointes · key clé · card carte ·
deck pioche · injury blessure · wound plaie · heal soigner · Speed / Strength / Intelligence / Luck / Charisma Vitesse / Force / Intelligence /
Chance / Charisme · rating(s) caractéristique(s) · morale moral · fatigue fatigue · fame renommée · free agent agent libre · recruit recruter / recrue ·
scout observer · offer offre · wage salaire · contract contrat · loan prêt · week semaine · season saison · bye week semaine de repos ·
Match Week Semaine des jeux · Training Yard Cour d'entraînement · Infirmary Infirmerie · Recruiting Recrutement · Your ludus Ton Ludus ·
letter lettre · mail courrier · advisor conseiller · Main menu Menu principal · Play Now Jouer · Manager mode Mode Manager ·
Creator Studio Atelier de création · Settings Réglages · Saves Sauvegardes · Save Sauvegarder · Load Charger · Back Retour · Close Fermer ·
Cancel Annuler · Continue Continuer · Start Commencer · Rules & strategy Règles et stratégie · Glossary Glossaire · Tutorials Tutoriels ·
Hot seat / Online / Ranked (keep) · Custom Personnalisée · room salle · host hôte · seat place · party groupe · invite inviter · ticket billet ·
treasury trésor · Storeroom Réserve · patron mécène · gift cadeau · trophy trophée · rank rang.
