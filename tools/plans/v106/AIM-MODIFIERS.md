# Aim tag: what changes an attack's hits and damage (audit for his a1a a2a, 2026-10-18)

This is the attack and damage path, read end to end in build order. The model is `aim106Wound` in `src/board/396-v106aim.js`. The test is `tools/tests/tv106g.js`, which runs the model against a Monte-Carlo of the real code.

**Wound** means at least 1 point of damage reaches the target:
- a gladiator: its location's AP or HP
- a beast or a ship: its HP
- a pot: it breaks, which needs 2 damage

**Column D:** *det* = known from the state before the roll. *roll* = the dice, enumerated exactly. *atk-choice* = the attacker's choice, assumed made in the attacker's favour. *def-choice* = the defender's choice, assumed made (the worst case for the attacker) and named in the tag's notes.

## The attack itself
| Module : function | What it changes | D | In the model |
|---|---|---|---|
| 02-data `rollHits`, `HIT_CHANCE` | each hit die lands at 0.5 | roll | binomial enumeration |
| 04-rules `doAttack` | 4 dice vs a beast or in the endgame, else 2 (players, pots, ships) | det | yes |
| 04-rules `doAttack` / `srcPow` | power = weapon p, or throw p for a throw | det | yes |
| 04-rules `doAttack` bonus | +statDmgB, +1 Cestus on that arm, +Herculean Vigor (`p.hercules`); only when at least 1 die hits | det | yes |
| 04-rules `doAttack` Omnia Mutantur | after the roll: 1 or 2 misses turn into hits; omnia2 is offered first when 2+ dice miss | atk-choice (a2a: counted when the card is in hand) | yes |
| 04-rules `doAttack` location | Focus! (`focusNext`) or the endgame: the attacker picks the spot (`chooseLocation 'card'`). Focus roll: the best of 3 location dice. Otherwise `rollLoc` | det / roll / atk-choice | yes: exact rollLoc distribution, and the best spot by damage landed |
| 03-engine `rollLoc` | a d6 on HIT_LOC, re-rolled on lost locations (30 tries, then the chest) | roll | exact distribution |
| 04-rules `doAttack` vs Tholo | a focused Arcuballista hit = a headshot (all his HP) | det | yes (avg = his HP) |
| 132-v83arrows `hurtNPC` wrapper | a focused bolt (arcu or a custom bolt) vs Tholo: damage rises to his HP | det | yes |
| 04-rules `doAttack` pot | breaks at 2 or more damage | det | yes (`% to break`) |
| 248-v98bar `doAttack` + `statDmgB` | the focus roll needs 3+ movement (else it is dropped). A focused attack on a pot gets +1 damage | det | yes |
| 65-stats55 `statDmgB` | the Strength band +0 to +3, only in a round that allows class abilities (`caAllowed`) | det | yes (calls statDmgB) |
| 338-v102draft `statDmgB` | Iron Fist ability pair: +1 in round 1 | det | yes (calls statDmgB) |
| 09-special `chAttack` (chariot vs a player) | 2 dice, +1 Cestus; the attacker picks the wheel, the horse or a body spot; no defence cards | atk-choice | yes: the best option. Not in tv106g, which needs a chariot race |
| 04-rules `tamedAttack` / 78-v60 wrapper | 2 dice × the beast's base AP (tamed: no rage state, no `S.npcDmg`). Vs a player: rollLoc, then defend, then hurt. Vs a beast: hurtNPC | det / roll | yes |
| 03-engine `npcStats` | a tamed beast uses its Initial state; a wild beast's state comes from its HP (beasts attacking players are not tagged) | det | yes |

## The defence (`defend`, 04-rules)
| Module : function | What it changes | D | In the model |
|---|---|---|---|
| 04-rules `defend` Minerva's Push | dodges the whole attack (any damage > 0) | def-choice | yes: p = 0, noted |
| 04-rules `defend` Fidelis Constans | removes 1 hit die when 1+ die hit; the bonus goes with the last die | def-choice | yes: noted |
| 62-rules53 / 130-v82vis / 232-v96board `defend` | who answers, facing, the "Fidelis" FX | none | display only |

## The damage (`hurt`, 03-engine) and its wrappers, outermost first
| Module : function | What it changes | D | In the model |
|---|---|---|---|
| 177-v89affix `hurt` (online only, `S.onl`) | Missilis −1 vs a ranged attack; Venatorius −1 vs a beast; Spinosus bites the attacker back; Firmus (spikes) and Lapidarius (stones) are not attacks | det | Missilis and Venatorius yes. Not in tv106g, which would need an online match |
| 139-v84onl `hurt` (named armor, online catalog) | Vindex +1 when the attacker was hit by this target last; the ward −1 once per rotation; Invicta −1 at its location on a hit of 2+; Gloriosa gives CF only | det | yes |
| 133-v83onl `hurt` (named weapons) | Ultor +1 against the target that hit you last; the Aegis held −1 once per rotation; pierce / Percussor (2): that much damage goes past armor (direct) while the location still stands | det | yes |
| 03-engine `hurt` shield | the biggest-absorb live shield on a live arm absorbs `min(rem, absorb)` and spends a use: a CHOICE | def-choice | yes: always raised, noted |
| 03-engine `hurt` fists | a punch without a Cestus on that arm does nothing to an armored location | det | yes |
| 03-engine `hurt` AP then HP | what is left lands on AP, then on HP | det | landing = AP + HP |
| 03-engine `hurt` Health Elixir | it saves the location after the damage has landed; this does not change the wound | def-choice | not counted (noted here) |
| 132 / 218 / 232 / 264 / 277 `hurt` | arrows that stay stuck in, the bus, "misses" log lines, greaves movement, hit feedback | none | display only |
| 133-v83onl `hurtNPC` Ferox | +1 against a beast | det | yes |
| 218 / 277 `hurtNPC` | the bus, hit feedback | none | display only |

## Other things checked: no effect on this attack's hits or damage
- 55-anim, 56-v52, 130-v82vis, 162-v88gear, 177 (sets J89.atk), 194-v91wear, 311-v100anim `doAttack` wrappers: projectiles, stones picked up, facing, scuffs, animation.
- Nets (`netted`) only stop a beast's walk.
- The Ward of the Evil Eye (`warded`) only stops a beast's attack on a player.
- A truce is broken by the attack (relationship only).
- Rage / Fazed states change a WILD beast's own attack.
- The Golden Eagle, crowd/CF effects and spectators do not touch an attack's damage. The Ranked stone rule is for stones from the stands only.
- Location dice exist only through rollLoc. Gods and blessings reach an attack only through the cards above (Minerva, Fidelis, Omnia, Hercules, Focus!, Health Elixir).
- Achilles' shield is an ordinary shield: absorb 2, 12 uses.
- Soul steal, crowd-pleasing weapons, Sanguis, Gloria and Fortuna act after the damage.

## The test (tv106g)
- 38 cases, each run 10,000 times with a seeded RNG.
- The real doAttack / tamedAttack runs on a frozen democritus state, restored before every trial.
- The question port answers as the model assumes: the shield raised, Minerva or Fidelis played, Omnia played, the best spot picked, Elixirs kept.
- Pass: |p − simulated| ≤ 2 points, the expected damage within max(0.15, 4 SE), the model pure (S and RNG untouched), and the cache answering a second call.
- Not covered: chariot races and the online-only affixes (177), because both need a different state.
