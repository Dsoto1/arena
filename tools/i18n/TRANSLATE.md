# One-pass translation brief (give this to ONE sub-agent, model sonnet)
Translate the newest source part tools/i18n/src/part-NN.json (array of {k: English key, w: where}) into es, it, pt, fr, de, ja, zh:
write tools/i18n/<l>/part-NN.json = one JSON object {"<English key>": "<translation>"} with EVERY key, same format as the previous part.
Follow tools/i18n/GUIDE-<l>.md (es neutral Latin-American tú; pt = Brasil, você; fr/de informal). Keep {0},{1}… placeholders, HTML tags,
entities, emoji and plural forms {n|one|many} exactly. Names + GAME_TERMS stay English (tools/i18n/names.json; Manager, Domus, Lanista, CF,
AP, HP, PvE/PvP, Focus, Mandata Flavi, class/event/weapon/armor/beast names) — "Manager" is never translated, also not in ja/zh. Reuse the
established terms (grep the language folder). Keep lengths close to the English. Code-like keys (paths, "×{0}") stay as they are.
Then run `node tools/i18n/check.js` and fix what it reports. Do not build, test or commit.
