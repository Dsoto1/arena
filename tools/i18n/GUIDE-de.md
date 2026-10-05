# German translation guide (v0.90)

Input: `tools/i18n/src/part-NN.json` — an array of `{k, w}`: `k` = the English key exactly as the game builds it,
`w` = where it lives (`file:line`; open `src/<file>` around that line when the meaning is unclear).
Output: `tools/i18n/de/part-NN.json` — ONE JSON object `{ "<key>": "<Spanish>", … }` with EVERY key of the part.
Check it with `node tools/i18n/check.js tools/i18n/de/part-NN.json` (must report 0 errors; fix the warnings that are real).

## Voice
- Standard German, informal **du** (plural "ihr"). Concise, game-like, a little Roman flavour.
- German runs ~30% longer and builds long compounds: buttons and chips MUST stay short — prefer the shortest natural word, abbreviate
  rather than overflow, and avoid compounds over ~14 letters in labels (split with a hyphen or reword).
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
gladiator Gladiator · fighter Kämpfer · house Haus · Lanista / Ludus / Domus (keep) · bout Kampf · event Ereignis · round Runde · rotation Rotation ·
turn Zug · phase Phase · Resolve / Choice / Action / End Auflösung / Wahl / Aktion / Ende · attack angreifen / Angriff · move bewegen / Bewegung ·
tile Feld · the sand der Sand · stands Tribüne · crowd Menge · spectator Zuschauer · wager Wette · purse Preisgeld · coin Münze(n) · CF (keep) ·
weapon Waffe · armor Rüstung · location Zone · head Kopf · chest Brust · arm Arm · leg Bein · upper/lower oben/unten · belt Gürtel · market Markt ·
draft Auswahl · offering Opfergabe · beast Bestie · pillar Säule · spikes Stacheln · key Schlüssel · card Karte · deck Stapel · injury Verletzung ·
wound Wunde · heal heilen · Speed / Strength / Intelligence / Luck / Charisma Tempo / Kraft / Intelligenz / Glück / Charisma · rating(s) Wert(e) ·
morale Moral · fatigue Erschöpfung · fame Ruhm · free agent Vereinsloser · recruit anwerben / Rekrut · scout beobachten · offer Angebot · wage Lohn ·
contract Vertrag · loan Kredit · week Woche · season Saison · bye week spielfreie Woche · Match Week Spielwoche · Training Yard Übungsplatz ·
Infirmary Krankenstube · Recruiting Anwerbung · Your ludus Dein Ludus · letter Brief · mail Post · advisor Berater · Main menu Hauptmenü ·
Play Now Jetzt spielen · Manager mode Manager-Modus · Creator Studio Werkstatt · Settings Einstellungen · Saves Spielstände · Save Speichern ·
Load Laden · Back Zurück · Close Schließen · Cancel Abbrechen · Continue Weiter · Start Starten · Rules & strategy Regeln & Taktik ·
Glossary Glossar · Tutorials Tutorials · Hot seat / Online / Ranked (keep) · Custom Eigene · room Raum · host Gastgeber · seat Platz · party Gruppe ·
invite einladen · ticket Karte · treasury Schatzkammer · Storeroom Lager · patron Gönner · gift Geschenk · trophy Trophäe · rank Rang.
