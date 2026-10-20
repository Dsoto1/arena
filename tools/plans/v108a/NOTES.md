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

## His picks 2026-10-20 (listening page "Arena Sound Picks", candidates in the session scratchpad sfx108/manifest.json)
hit 2, bighit 2, block 2, whoosh 1, death 2, spear 1, net 1, netwrap 2, scrape 1, crash 1, step 1, lion 1, bear 1, wolf 3, snake 1,
eagle 1, grunt 1, beast 1, cheer 2, rise 1, horn 1, fanfare 3, titulus 1, medal 1
+ "I also like the axe throw sound but for just the axe" → spear_3 (SoundFlakes "Axe Throwing Hitting Flesh", CC-BY 4.0) plays only when
  an Axe is thrown (04-rules throw path); the spear into the stands keeps spear 1. That is a NEW sound: thrown weapons made none before.
- 25 files, ≈ 0.49 MB (well under the 3a budget). wolf 3 checked: CC-BY 4.0, be-steele's Malamute "Igor" (credited).
- CC-BY authors to credit: SoundFlakes, F.M.Audio, CGEffex, nuFF3, tbsounddesigns, be-steele, PRINCEofWORMS, EvanBoyerman, lonemonk,
  _MC5_, tosha73 (all CC-BY 4.0).

## Build (2026-10-20, held until v1.08 ships)
Built as one commit b11fe0f (408-v108sfx + assets/sfx108_<key>.mp3 flat — mkshare can't take a sub-folder — + tsfx108), kept as
tools/plans/v108a/sfx108.bundle so it does not ride into the v1.08 beta. To merge: `git fetch tools/plans/v108a/sfx108.bundle
worktree-agent-a0e5f2433298314ea:v108a && git merge v108a` (or cherry-pick b11fe0f). file:// pages play the synth (no fetch); the site,
beta and the download (inlined) play the recordings. Levels gain-matched to sound100/after.txt; unheard — check axe, rise, step on the beta.
