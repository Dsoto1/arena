# v1.08a — recorded sound effects (his ask 2026-10-20: "use better sound effects if able")
Today every effect is synthesized (src/audio/21-audio.js sfx cases + 314-v100sound.js SND100 kinds); music stays synthesized.
Freesound: the cloud proxy injects the API credential for freesound.org/apiv2/ (no key in code/env); hq previews (mp3 ~128 kbps) on
cdn.freesound.org are the usable files (original downloads need OAuth); keep requests few and spaced (rate limits).
His answers 2026-10-20:
- 1a licences CC0 + CC-BY (CC-BY authors credited in Credits); never NonCommercial.
- 2a scope: combat (hit, bighit, block, whoosh, death, spear, net/netwrap, scrape, crash, step), beasts (growl/bark per kind), crowd + ceremony
  (cheer, rise, horn, fanfare, titulus, medal); the UI ticks (coin, card, click, cf, chest, heal, gem/fair/dud, rp) stay synthesized.
- 3a size budget ≈ 1.5–2 MB total (mp3, trimmed, normalised to the SND100 bands).
- 4a its own release v1.08a right after the v1.08 torches.
Flow: candidates (2–3 per effect) on a listening page for his picks → build (assets/sfx108/*.mp3, loader + fallback to the synth, same trims /
Effects slider / mute / fold window / Fast rules / kill switch) → beta.
