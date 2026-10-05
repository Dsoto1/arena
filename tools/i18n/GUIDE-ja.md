# Japanese translation guide (v0.89)

Input: `tools/i18n/src/part-NN.json` — an array of `{k, w}`: `k` = the English key exactly as the game builds it,
`w` = where it lives (`file:line`; open `src/<file>` around that line when the meaning is unclear).
Output: `tools/i18n/ja/part-NN.json` — ONE JSON object `{ "<key>": "<Japanese>", … }` with EVERY key of the part.
Check it with `node tools/i18n/check.js tools/i18n/ja/part-NN.json` (must report 0 errors; fix the warnings that are real).

## Voice
- Natural, modern game Japanese. **Help text, hints, tooltips, letters to the player, rules** = polite です/ます.
  **Buttons, chips, tabs, column heads, short labels** = short noun phrases or plain dictionary forms
  (「保存」「閉じる」「攻撃する」「次へ」), never です/ます, no 。 at the end.
- **Log lines** (what happens on the sand: "Leo attacks Marcus") = short plain past/present (だ/である not needed):
  「LeoがMarcusを攻撃」「Marcusは倒れた」. Flavour text (letters, Acta Diurna, Fates, quotes, Flavius's lines) may be literary
  and a little Roman/archaic in tone, but stay readable.
- Address the player as あなた only when the English must; usually drop the subject (Japanese does). Advisors' letters to the
  lanista may be respectful (〜でございます is too much — use plain polite です/ます).
- Japanese is SHORTER than English in characters but each character is wider: keep buttons ≤ ~8 characters where possible.
- Gladiators can be women; follow the English pronoun only where Japanese needs one (彼/彼女); usually use the name or drop it.
- Reference: the Spanish/French of the same key (tools/i18n/es|fr/part-NN.json) shows how each fragment was handled — use them to
  understand fragments/placeholders, but translate from the ENGLISH.

## Typography
- Full-width Japanese punctuation: 、。「」『』！？：（）・ — but keep ASCII for numbers, `+3`, `×2`, `1/4`, `%`, times, and anything
  inside a placeholder pattern. Use 「…」 for quoted words/phrases (never add `"`: the checker refuses new `"`, `<`, `>`, `&`).
- No space between Japanese and English names/game terms: 「Gladiusを装備」「CF +3」 is fine (a space is kept where the
  English had a number/term next to another term: `CF {0}` → `CF {0}`).
- Keep emoji/symbols exactly (· — ⓘ ★ ✓ ⚔ 🪙 🛏 …) and where they sit (start of a label stays at the start).
- The game renders Japanese with the system Japanese font; there is NO small caps or ALL CAPS in Japanese — do not try to imitate
  English capitals (「ROUND」 → 「ラウンド」 unless it is a game term).
- Leading/trailing spaces of a key are re-added by the game automatically — you do not need to copy them.

## Never change
- `{0}`, `{1}` … placeholders: every one of the key must appear at least once (order may change — Japanese word order usually
  moves them: `{0} attacks {1}` → `{0}が{1}を攻撃`).
- HTML: every tag and attribute exactly as written (`<b style="…">`, `<span class="x">`, `<br>` …) — translate only
  the visible text between tags. Tags may move with the words they wrap.
- `&nbsp;`-style entities, numbers, line breaks.
- **Names and game terms stay English, exactly as written (Latin letters, never katakana)**: everything in
  `tools/i18n/names.json` (classes, ranks, Fate/Fates, Thumb of Flavius, Missio, Lanista, Ludus, Domus, CF, AP, HP, PvE, PvP, Focus,
  Mandata Flavi, Piacula, Blessings, Arena Chest, every weapon/armor/beast/card/offering/event/city name) plus people's names,
  house names, gods' names and Latin words/phrases (ave, rudis, summa rudis, damnatio memoriae, programmata, Acta Diurna,
  Consilium …). Example: "You equip the Gladius" → 「Gladiusを装備した」, "Leo attacks" → 「Leoの攻撃」, "a Veteranus" → 「Veteranus」.
- Keys that are not human text (a CSS class list, an id, a file name, code, a lone symbol) → the value is the key unchanged.

## Plurals glued at runtime
Many keys add an English plural ending as a value: `{0} room{1}`, `{2} week{3}` (the value is "s" or ""), `entr{1}` ("y"/"ies"),
`{1}` = "is"/"are". Japanese has no plural: write the empty plural form **`{n||}`** for that placeholder (it prints nothing, and
it tells the checker you dropped it on purpose). Examples:
- `{0} room{1}` → `{0}部屋{1||}`  · `{2} week{3}` → `{2}週{3||}`  · `{0} fighter{1} {2} hurt` (`{2}` = is/are) → `{0}人{1||}が負傷{2||}`
- If a word really should differ for one vs many (rare), `{n|one|many}` works as in the other languages.
The checker accepts a missing placeholder in ja only when it is a known plural placeholder (tools/i18n/plurals.json) — but
`{n||}` is always the clean way.

## Fragments
Some keys are pieces glued together at runtime ("{0} pays", ", backing <b>{0}</b>", "— they are marked fallen in the Ludus").
Japanese word order often cannot follow English glue exactly — translate so the piece reads acceptably in place (look at
`w` to see what comes before/after). Keep the leading punctuation shape (a key starting with ", " → start with 「、」;
"— …" → keep the dash). Never put the whole sentence in one fragment and leave the others empty.

## Glossary (use these every time)
gladiator 剣闘士 · fighter 闘士 · house 家門 · Lanista / Ludus / Domus (keep) · bout 試合 · event 大会 · round ラウンド ·
rotation ローテーション · turn ターン · phase フェイズ · Resolve / Choice / Action / End 解決 / 選択 / 行動 / 終了 ·
attack 攻撃（する） · move 移動（する） · tile マス · the sand 砂場（the arena floor: 闘技場の砂） · arena 闘技場 · stands 観客席 ·
crowd 観衆 · spectator 観客 · wager / bet 賭け / 賭ける · purse 賞金 · coin コイン · CF (keep) · crowd favour 観衆の支持 ·
weapon 武器 · armor 防具 · location (hit location) 部位 · head 頭 · chest 胴 · arm 腕 · leg 脚 · upper/lower 上/下 · belt ベルト ·
market 市場 · draft ドラフト · offering 供物 · beast 猛獣 · pillar 柱 · spikes スパイク · key 鍵 · card カード · deck 山札 ·
injury 負傷 · wound 傷 · heal 治療（する） · Speed / Strength / Intelligence / Luck / Charisma 速さ / 力 / 知力 / 運 / 魅力 ·
rating(s) 能力値 · morale 士気 · fatigue 疲労 · fame 名声 · rival 宿敵 · free agent フリーエージェント · recruit 勧誘 / 新人 ·
scout 偵察 · court (a recruit) 口説く · offer 提示 · wage 給金 · contract 契約 · loan 借金 · week 週 · season シーズン ·
bye week 休養週 · Match Week 試合週 · Training Yard 訓練場 · Infirmary 診療所 · Recruiting 勧誘 · Your ludus あなたのLudus ·
letter 手紙 · mail 郵便 · advisor 相談役 · Main menu メインメニュー · Play Now すぐ遊ぶ · Manager mode マネージャーモード ·
Creator Studio クリエイタースタジオ · Settings 設定 · Saves セーブ · Save 保存 · Load 読み込む · Back 戻る · Close 閉じる ·
Cancel キャンセル · Continue 続ける · Start 開始 · Rules & strategy ルールと戦略 · Glossary 用語集 · Tutorials チュートリアル ·
lesson レッスン · Hot seat / Online / Ranked (keep) · Custom カスタム · room ルーム · host ホスト · seat 席 · party パーティー ·
invite 招待 · ticket 入場券 · treasury 金庫 · Storeroom 倉庫 · patron 後援者 · gift 贈り物 · trophy トロフィー · rank 階級 ·
playlist プレイリスト · Forum フォーラム.
