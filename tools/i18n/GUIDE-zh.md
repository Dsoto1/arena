# Chinese (Simplified) translation guide (v0.90)

Input: `tools/i18n/src/part-NN.json` — an array of `{k, w}`: `k` = the English key exactly as the game builds it,
`w` = where it lives (`file:line`; open `src/<file>` around that line when the meaning is unclear).
Output: `tools/i18n/zh/part-NN.json` — ONE JSON object `{ "<key>": "<简体中文>", … }` with EVERY key of the part.
Check it with `node tools/i18n/check.js tools/i18n/zh/part-NN.json` (must report 0 errors; fix the warnings that are real).

## Voice
- Natural, modern Mainland game Chinese (简体, 普通话 register). Address the player as 你 (never 您 except an advisor's very formal letter).
- **Buttons, chips, tabs, column heads, short labels** = short verb/noun phrases, no 。 at the end (「保存」「关闭」「攻击」「下一步」).
- **Help text, hints, tooltips, rules, letters** = clear full sentences with 。
- **Log lines** (what happens on the sand: "Leo attacks Marcus") = short: 「Leo攻击Marcus」「Marcus倒下了」. Flavour text (letters,
  Acta Diurna, Fates, quotes, Flavius's lines) may sound a little classical/Roman (半文半白 is fine sparingly) but stay readable.
- Chinese is SHORTER than English in characters but each is wide: keep buttons ≤ ~6 characters where possible.
- Gladiators can be women; use 他/她 only where needed — usually repeat the name or drop the pronoun.
- Reference: the Japanese and Spanish of the same key (tools/i18n/ja|es/part-NN.json) show how fragments/placeholders were handled —
  use them to understand, but translate from the ENGLISH. Do NOT copy Japanese kanji words that differ in Chinese.

## Typography
- Full-width Chinese punctuation: ，。、「」『』！？：（）· — but keep ASCII for numbers, `+3`, `×2`, `1/4`, `%`, times, and anything
  inside a placeholder pattern. Quotes: use 「…」 or “…” (never add new ASCII `"`: the checker refuses new `"`, `<`, `>`, `&`).
- No space between Chinese and English names/game terms: 「装备Gladius」「CF +3」 (keep a space where the English had a number/term next
  to another term: `CF {0}` → `CF {0}`).
- Keep emoji/symbols exactly (· — ⓘ ★ ✓ ⚔ 🪙 🛏 …) and where they sit (start of a label stays at the start).
- No ALL CAPS / small caps imitation.
- Leading/trailing spaces of a key are re-added by the game automatically — you do not need to copy them.

## Never change
- `{0}`, `{1}` … placeholders: every one of the key must appear at least once (order may change — Chinese word order may
  move them: `{0} attacks {1}` → `{0}攻击{1}`).
- HTML: every tag and attribute exactly as written (`<b style="…">`, `<span class="x">`, `<br>` …) — translate only
  the visible text between tags. Tags may move with the words they wrap.
- `&nbsp;`-style entities, numbers, line breaks.
- **Names and game terms stay English, exactly as written (Latin letters, never transliterated into Chinese)**: everything in
  `tools/i18n/names.json` (classes, ranks, Fate/Fates, Thumb of Flavius, Missio, Lanista, Ludus, Domus, CF, AP, HP, PvE, PvP, Focus,
  Mandata Flavi, Piacula, Blessings, Arena Chest, every weapon/armor/beast/card/offering/event/city name) plus people's names,
  house names, gods' names and Latin words/phrases (ave, rudis, summa rudis, damnatio memoriae, programmata, Acta Diurna,
  Consilium …). Example: "You equip the Gladius" → 「你装备了Gladius」, "Leo attacks" → 「Leo发动攻击」, "a Veteranus" → 「一名Veteranus」.
- Keys that are not human text (a CSS class list, an id, a file name, code, a lone symbol) → the value is the key unchanged.

## Plurals glued at runtime
Many keys add an English plural ending as a value: `{0} room{1}`, `{2} week{3}` (the value is "s" or ""), `entr{1}` ("y"/"ies"),
`{1}` = "is"/"are". Chinese has no plural: write the empty plural form **`{n||}`** for that placeholder (it prints nothing, and
it tells the checker you dropped it on purpose). Examples:
- `{0} room{1}` → `{0}个房间{1||}`  · `{2} week{3}` → `{2}周{3||}`  · `{0} fighter{1} {2} hurt` (`{2}` = is/are) → `{0}名斗士{1||}受伤{2||}`
- If a word really should differ for one vs many (rare), `{n|one|many}` works as in the other languages.
The checker accepts a missing placeholder in ja/zh only when it is a known plural placeholder (tools/i18n/plurals.json) — but
`{n||}` is always the clean way.

## Fragments
Some keys are pieces glued together at runtime ("{0} pays", ", backing <b>{0}</b>", "— they are marked fallen in the Ludus").
Chinese word order often cannot follow English glue exactly — translate so the piece reads acceptably in place (look at
`w` to see what comes before/after). Keep the leading punctuation shape (a key starting with ", " → start with 「，」;
"— …" → keep the dash). Never put the whole sentence in one fragment and leave the others empty.

## Glossary (use these every time)
gladiator 角斗士 · fighter 斗士 · house 家族 / 门第 (a gladiator house: 角斗士之家 when needed; short: 家族) · Lanista / Ludus / Domus (keep) ·
bout 比赛 · event 赛事 · round 回合 · rotation 轮 · turn 回合（a player's turn: 行动回合; "your turn" 轮到你） · phase 阶段 ·
Resolve / Choice / Action / End 结算 / 选择 / 行动 / 结束 · attack 攻击 · move 移动 · tile 格 · the sand 沙场 · arena 竞技场 ·
stands 看台 · crowd 观众 · spectator 观众 · wager / bet 赌注 / 下注 · purse 奖金 · coin 金币 · CF (keep) · crowd favour 观众的青睐 ·
weapon 武器 · armor 护甲 · location (hit location) 部位 · head 头 · chest 胸 · arm 手臂 · leg 腿 · upper/lower 上/下 · belt 腰带 ·
market 市场 · draft 选秀 · offering 祭品 · beast 野兽 · pillar 柱子 · spikes 尖刺 · key 钥匙 · card 卡牌 · deck 牌库 ·
injury 伤势 · wound 伤口 · heal 治疗 · Speed / Strength / Intelligence / Luck / Charisma 速度 / 力量 / 智力 / 运气 / 魅力 ·
rating(s) 属性 · morale 士气 · fatigue 疲劳 · fame 名望 · rival 宿敌 · free agent 自由斗士 · recruit 招募 / 新人 · scout 侦察 ·
court (a recruit) 拉拢 · offer 报价 · wage 薪水 · contract 合同 · loan 借款 · week 周 · season 赛季 · bye week 轮空周 ·
Match Week 比赛周 · Training Yard 训练场 · Infirmary 医务所 · Recruiting 招募 · Your ludus 你的Ludus · letter 信 · mail 邮件 ·
advisor 顾问 · Main menu 主菜单 · Play Now 立即游戏 · Manager mode 经理模式 · Creator Studio 创作工坊 · Settings 设置 · Saves 存档 ·
Save 保存 · Load 读取 · Back 返回 · Close 关闭 · Cancel 取消 · Continue 继续 · Start 开始 · Rules & strategy 规则与策略 ·
Glossary 术语表 · Tutorials 教程 · lesson 课程 · Hot seat / Online / Ranked (keep) · Custom 自定义 · room 房间 · host 房主 · seat 座位 ·
party 小队 · invite 邀请 · ticket 门票 · treasury 金库 · Storeroom 仓库 · patron 赞助人 · gift 礼物 · trophy 奖杯 · rank 等级 ·
playlist 赛程表 · Forum 广场 · Loadout 装备组 · Epic 史诗 · Rare 稀有 · Common 普通 · Legendary 传说 · affix 词缀 · vault 宝库.
