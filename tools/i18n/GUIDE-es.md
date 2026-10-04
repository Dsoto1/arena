# Spanish translation guide (v0.86)

Input: `tools/i18n/src/part-NN.json` — an array of `{k, w}`: `k` = the English key exactly as the game builds it,
`w` = where it lives (`file:line`; open `src/<file>` around that line when the meaning is unclear).
Output: `tools/i18n/es/part-NN.json` — ONE JSON object `{ "<key>": "<Spanish>", … }` with EVERY key of the part.
Check it with `node tools/i18n/check.js tools/i18n/es/part-NN.json` (must report 0 errors; fix the warnings that are real).

## Voice
- Neutral Latin-American Spanish, informal **tú** (never vosotros; plural "you" = ustedes). Concise, game-like, a little Roman flavour.
- Buttons and chips stay short — prefer the shorter synonym (Spanish runs ~25% longer; boxes are tight).
- Match the English register: terse labels stay terse, flavour text (letters, the Acta Diurna, Fates, quotes) can be literary.
- Gladiators can be women; follow the English pronoun (his → su). Avoid gendered forms where a neutral one is natural.

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
gladiator gladiador · fighter luchador · house casa · lanista Lanista (keep) · ludus Ludus (keep) · bout combate ·
event evento · round ronda · rotation rotación · turn turno · phase fase · Resolve / Choice / Action / End (phases) Resolver / Elección / Acción / Fin ·
attack atacar / ataque · move mover / movimiento · tile casilla · the sand la arena · arena arena · stands gradas · crowd público ·
spectator espectador · wager apuesta · bet apostar · purse premio · coin moneda(s) · CF CF (keep) · crowd favour favor del público ·
weapon arma · armor armadura · location (hit location) zona · head cabeza · chest pecho · arm brazo · leg pierna · upper/lower superior/inferior ·
belt cinturón · market mercado · draft selección · offering ofrenda · blessing Blessing (keep) · beast bestia · pillar pilar · spikes púas ·
chest (arena chest) Arena Chest (keep) · key llave · card carta · deck mazo · injury lesión · wound herida · heal curar ·
Speed / Strength / Intelligence / Luck / Charisma Velocidad / Fuerza / Inteligencia / Suerte / Carisma · rating(s) atributo(s) ·
morale moral · fatigue fatiga · fame fama · rival rival · free agent agente libre · recruit reclutar / recluta · scout explorar / ojeador ·
court (a recruit) cortejar · offer oferta · wage salario · contract contrato · loan préstamo · week semana · season temporada · bye week semana libre ·
Match Week Semana de combates · Training Yard Patio de entrenamiento · Infirmary Enfermería · Recruiting Reclutamiento · Your ludus Tu Ludus ·
letter carta · mail correo · advisor consejero · Main menu Menú principal · Play Now Jugar ya · Manager mode Modo Manager · Creator Studio Estudio del creador ·
Settings Ajustes · Saves Partidas guardadas · Save Guardar · Load Cargar · Back Volver · Close Cerrar · Cancel Cancelar · Continue Continuar ·
Start Empezar · Rules & strategy Reglas y estrategia · Glossary Glosario · Tutorials Tutoriales · lesson lección · Hot seat Hot seat (keep) ·
Online Online (keep) · room sala · host anfitrión · seat asiento · party grupo · invite invitar · Ranked Ranked (keep) · Custom Personalizada ·
playlist modo · ticket entrada · Forum Foro · treasury tesoro · Storeroom Almacén · patron mecenas · gift regalo · trophy trofeo · rank rango.
