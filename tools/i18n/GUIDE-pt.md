# Portuguese (Brazil) translation guide (v0.88)

Input: `tools/i18n/src/part-NN.json` — an array of `{k, w}`: `k` = the English key exactly as the game builds it,
`w` = where it lives (`file:line`; open `src/<file>` around that line when the meaning is unclear).
Output: `tools/i18n/pt/part-NN.json` — ONE JSON object `{ "<key>": "<Spanish>", … }` with EVERY key of the part.
Check it with `node tools/i18n/check.js tools/i18n/pt/part-NN.json` (must report 0 errors; fix the warnings that are real).

## Voice
- Brazilian Portuguese, informal **você** (plural "vocês"). Concise, game-like, a little Roman flavour.
- Buttons and chips stay short — prefer the shorter synonym (Portuguese runs ~20–25% longer; boxes are tight).
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
gladiator gladiador · fighter lutador · house casa · Lanista / Ludus / Domus (keep) · bout combate · event evento · round rodada · rotation rotação ·
turn turno · phase fase · Resolve / Choice / Action / End Resolver / Escolha / Ação / Fim · attack atacar / ataque · move mover / movimento ·
tile casa · the sand a areia · stands arquibancada · crowd público · spectator espectador · wager aposta · purse prêmio · coin moeda(s) · CF (keep) ·
weapon arma · armor armadura · location região · head cabeça · chest peito · arm braço · leg perna · upper/lower superior/inferior · belt cinto ·
market mercado · draft seleção · offering oferenda · beast fera · pillar pilar · spikes espetos · key chave · card carta · deck baralho ·
injury lesão · wound ferida · heal curar · Speed / Strength / Intelligence / Luck / Charisma Velocidade / Força / Inteligência / Sorte / Carisma ·
rating(s) atributo(s) · morale moral · fatigue fadiga · fame fama · free agent agente livre · recruit recrutar / recruta · scout observar ·
offer oferta · wage salário · contract contrato · loan empréstimo · week semana · season temporada · bye week semana de folga ·
Match Week Semana dos jogos · Training Yard Pátio de treino · Infirmary Enfermaria · Recruiting Recrutamento · Your ludus Seu Ludus ·
letter carta · mail correio · advisor conselheiro · Main menu Menu principal · Play Now Jogar agora · Manager mode Modo Manager ·
Creator Studio Estúdio de criação · Settings Configurações · Saves Jogos salvos · Save Salvar · Load Carregar · Back Voltar · Close Fechar ·
Cancel Cancelar · Continue Continuar · Start Começar · Rules & strategy Regras e estratégia · Glossary Glossário · Tutorials Tutoriais ·
Hot seat / Online / Ranked (keep) · Custom Personalizada · room sala · host anfitrião · seat lugar · party grupo · invite convidar ·
ticket ingresso · treasury tesouro · Storeroom Depósito · patron patrono · gift presente · trophy troféu · rank posto.
