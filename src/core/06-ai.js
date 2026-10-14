/* ================= CPU PERSONALITY =================
   Every CPU gladiator carries six 1-100 priorities. They weight every decision, and a little noise
   (more on Easy, less on Hard, more for risk-takers) keeps them from playing perfectly. */
const PERS_KEYS = [['survival', _T('Survival'), _T('Heals early, dodges, retreats and hides in tunnels when hurt')], ['hunt', _T('NPC hunting'), _T('Chases beasts for trophies, coin and CF')], ['coin', _T('Coin'), _T('Takes coin over cards, loots purses, buys when rich')], ['cf', _T('Crowd Favor'), _T('Breaks pots, plays to the crowd and chases freedom (50 CF)')], ['aggression', _T('PvP aggression'), _T('Attacks gladiators, refuses truces')], ['loyalty', _T('Loyalty'), _T('Helps allies with gifts and focus fire; keeps truces')]];
const PERS_PRESETS = {
  balanced: {
    n: 'Balanced',
    v: {
      survival: 50,
      hunt: 50,
      coin: 50,
      cf: 50,
      aggression: 50,
      loyalty: 50
    }
  },
  brute: {
    n: 'Brute',
    v: {
      survival: 25,
      hunt: 45,
      coin: 30,
      cf: 55,
      aggression: 90,
      loyalty: 30
    }
  },
  survivor: {
    n: 'Survivor',
    v: {
      survival: 90,
      hunt: 35,
      coin: 55,
      cf: 40,
      aggression: 30,
      loyalty: 60
    }
  },
  beastmaster: {
    n: 'Beastmaster',
    v: {
      survival: 45,
      hunt: 90,
      coin: 45,
      cf: 55,
      aggression: 35,
      loyalty: 50
    }
  },
  merchant: {
    n: 'Merchant',
    v: {
      survival: 60,
      hunt: 35,
      coin: 90,
      cf: 40,
      aggression: 35,
      loyalty: 45
    }
  },
  showman: {
    n: 'Showman',
    v: {
      survival: 40,
      hunt: 55,
      coin: 35,
      cf: 92,
      aggression: 60,
      loyalty: 40
    }
  },
  loyal: {
    n: 'Loyal ally',
    v: {
      survival: 55,
      hunt: 50,
      coin: 40,
      cf: 45,
      aggression: 45,
      loyalty: 95
    }
  },
  schemer: {
    n: 'Schemer',
    v: {
      survival: 65,
      hunt: 40,
      coin: 60,
      cf: 60,
      aggression: 55,
      loyalty: 15
    }
  }
};
const CLASS_PERS = {
  soldier: 'brute',
  royalty: 'merchant',
  hero: 'showman',
  slave: 'survivor',
  veteranus: 'balanced',
  amazonia: 'brute',
  venatore: 'beastmaster',
  damnatio: 'schemer'
};
/* rollPersonality — builds a new CPU's six personality sliders: its class preset (CLASSES[cls].pers, else CLASS_PERS -> PERS_PRESETS) plus random jitter, clamped to 1-100.
   TWEAK: the jitter (rand() * 40 - 20 = +/-20); widen it for more varied CPUs, narrow it for more predictable ones. */
function rollPersonality(cls) {
  const base = CLASSES[cls] && CLASSES[cls].pers || PERS_PRESETS[CLASS_PERS[cls] || 'balanced'].v,
    o = {};
  for (const [k] of PERS_KEYS) o[k] = clamp(Math.round(base[k] + (rand() * 40 - 20)), 1, 100);
  return o;
}
/* persRaw — the gladiator's raw personality sliders, or the Balanced preset if it has none. */
const persRaw = player => player && player.pers || PERS_PRESETS.balanced.v;
// Hard CPUs keep their personality but lean it toward what wins (the simulations: hunt beasts, don't over-hide, don't over-fight)
/* pers — the sliders a CPU actually decides with. Hard CPUs get a cached, adjusted copy; everyone else gets their raw sliders.
   TWEAK: the Hard nudges (hunt +18, survival clamped 30-62, aggression clamped 35-78, cf at least 45). */
const pers = player => {
  const P = persRaw(player);
  if (!player || player.diff !== 'hard') return P;
  if (!player._hp || player._hpSrc !== P) {
    player._hpSrc = P;
    player._hp = {
      ...P,
      hunt: Math.min(100, P.hunt + 18),
      survival: clamp(P.survival, 30, 62),
      aggression: clamp(P.aggression, 35, 78),
      cf: Math.max(P.cf, 45),
      loyalty: P.loyalty
    };
    if (player.aiPers) for (const k of Object.keys(player.aiPers)) player._hp[k] = clamp(player._hp[k] + player.aiPers[k], 1, 100); /* v0.62: a tier's instincts (80-aitiers) */
  }
  return player._hp;
};
/* pw50 — one slider as a multiplier (50 -> 1.0, 100 -> 2.0, 25 -> 0.5); used to scale scores by personality. */
const pw50 = (player, k) => pers(player)[k] / 50; // 1.0 = neutral
/* noise — random jitter added to every attack score so CPUs don't play perfectly; larger for aggressive, low-survival CPUs.
   TWEAK: spread per difficulty (easy 4.5, normal 3.4, hard 0.6) and the /250 personality factors. */
function noise(player, scale = 1) {
  const d = player.diff === 'easy' ? 4.5 : player.diff === 'hard' ? 0.6 : 3.4;
  return (rand() - .5) * d * scale * (0.6 + pers(player).aggression / 250 + (100 - pers(player).survival) / 250);
}

/* ================= THOUGHTS (CPU speech bubbles) ================= */
const QUOTES = {
  kill: [_T('Another name for the crowd to forget.'), _T('The people wanted blood. There it is.'), _T('Hail Flavius!'), _T('Stay down.'), _T('One step closer to the Rudis.')],
  hurt: [_T('That one stung.'), _T('I can still stand. I think.'), _T('Hygeia, now would be nice.'), _T('Not like this. Not in the sand.')],
  start: [_T('Eyes on the crowd, feet in the sand.'), _T('Patience. Let them bleed first.'), _T('Today I earn my freedom.'), _T('The pots first, then the beasts.')],
  npc: [_T('Come here, beast.'), _T('A trophy for the wall.'), _T('That pelt will fetch coin.')],
  pvp: [_T('Nothing personal, friend.'), _T('The crowd wants a duel.'), _T('Only one of us walks out.')],
  gift: [_T('Take it. You need it more than I do.'), _T('For the familia.'), _T('Stay alive, ally.')],
  retreat: [_T('Fall back. Live to fight.'), _T('Not today, Flavius.'), _T('Let them come to me.')],
  market: [_T('Coin well spent.'), _T('Better steel, better odds.')],
  truce: [_T('Allies, for now.'), _T('Watch my back and I watch yours.')]
};
let THOUGHTS = true;
/* think — shows a CPU speech bubble and stores it as lastThought. Skipped in headless runs, for repeats of the same line within 15 s, and randomly for casual thoughts (humans only get 'say' bubbles).
   TWEAK: the chance a casual thought shows (.35 on fast speed, .8 otherwise) and the 15000 ms repeat window. */
function think(player, text, mood = 'think') {
  if (HEADLESS || !THOUGHTS || !S || !player || !player.alive && mood !== 'say') return;
  if (!player.cpu && mood !== 'say') return;
  if (mood !== 'say' && mood !== 'angry' && mood !== 'gift' && Math.random() > (SPEED === 'fast' ? .35 : .8)) return;
  const now = Date.now();
  S.saidAt = S.saidAt || {};
  const key = player.id + '|' + text;
  if (S.saidAt[key] && now - S.saidAt[key] < 15000) return; // never repeat the same line straight away
  S.saidAt[key] = now;
  S.bubbles = (S.bubbles || []).filter(b => b.pid !== player.id);
  S.bubbles.push({
    id: bubSeq++,
    pid: player.id,
    text,
    mood,
    at: now
  });
  player.lastThought = text;
  renderBubbles();
}

/* ================= RELATIONSHIPS (how each CPU feels about every other gladiator) =================
   -100..100. Like behavior states, feelings pass thresholds (Devoted, Friendly, Neutral, Hostile, Vengeful)
   and change what the CPU does: who it hunts, who it trusts with a truce, who it gifts. */
const REL_STATES = [[60, _T('Devoted'), '😊'], [25, _T('Friendly'), '🙂'], [-24, _T('Neutral'), '😐'], [-59, _T('Hostile'), '😠'], [-101, _T('Vengeful'), '😡']];
/* relOf — how player feels about other, -100..100 (0 when no feeling is recorded). */
const relOf = (player, other) => player && other && player.rel ? player.rel[other.id] || 0 : 0;
/* relState — maps a feeling value to its REL_STATES row: [threshold, name, emoji]. TWEAK: the thresholds live in REL_STATES above. */
const relState = victim => REL_STATES.find(s => victim >= s[0]);
const REL_LINES = {
  up: {
    Friendly: [_T('I like your style, {n}.'), _T('{n}, you are all right.')],
    Devoted: [_T('I would bleed for you, {n}.'), _T('Brothers in the sand, {n}.')]
  },
  down: {
    Hostile: [_T('Watch yourself, {n}.'), _T('You will regret that, {n}.')],
    Vengeful: [_T('{n} dies by my hand. Today.'), _T('I will not rest until {n} falls!')]
  }
};
/* bumpRel — shifts a CPU's feeling toward another gladiator by d (clamped -100..100). Crossing a threshold makes the CPU say a REL_LINES line and logs the change. */
function bumpRel(player, other, d, why) {
  if (!S || !player || !other || player === other || !player.cpu || !player.alive) return;
  player.rel = player.rel || {};
  const before = relOf(player, other);
  const after = clamp(Math.round(before + d), -100, 100);
  player.rel[other.id] = after;
  const a = relState(before)[1],
    b = relState(after)[1];
  if (a !== b) {
    const up = after > before;
    const lines = (up ? REL_LINES.up : REL_LINES.down)[b];
    if (lines) think(player, pickOne(lines).replace('{n}', other.name), up ? 'gift' : 'angry');
    log(_T`${nm(player)} now feels <b>${b.toLowerCase()}</b> toward ${nm(other)}${why ? ` (${why})` : ''}.`, 'thought');
  }
}
/* relDecay — fades every CPU's feelings 7% toward neutral; called once per rotation from the turn flow.
   TWEAK: 0.93 (lower = grudges and friendships fade faster). */
function relDecay() {
  for (const p of S.players) if (p.rel) for (const k in p.rel) p.rel[k] = Math.round(p.rel[k] * 0.93);
}

/* ================= CPU DECISIONS ================= */
/* cpuChoice — the Phase 2 choice: returns 'coin' (take 2 coin) or 'card' (draw an arena card), whichever weight is higher.
   TWEAK: coinW (coin/50, +0.5 under 4 coin, +0.25 under 8), cardW ((cf+aggression+hunt)/150, +0.6 at 12+ coin, +0.3 when CF is locked),
   the random add (rand() on Easy, rand()*.6 otherwise) and the Hard tweaks (-0.6 card below 60% HP, +0.3 coin under 8 coin). */
function cpuChoice(player) {
  if (!canDraw()) return 'coin';
  if (player.tutTame) return 'coin'; /* v0.46: the tutorial rival stops drawing once the duel begins */
  const P = pers(player);
  let coinW = P.coin / 50 + (player.coin < 4 ? 0.5 : 0) + (player.coin < 8 ? 0.25 : 0);
  let cardW = (P.cf + P.aggression + P.hunt) / 150 + (player.coin >= 12 ? 0.6 : 0) + (!cfAllowed() ? 0.3 : 0);
  if (player.diff === 'easy') {
    coinW += rand();
    cardW += rand();
  } else {
    coinW += rand() * .6;
    cardW += rand() * .6;
  }
  if (player.diff === 'hard') {
    if (hpFrac(player) < 0.6) cardW -= 0.6;
    if (player.coin < 8) coinW += 0.3;
  } // hard CPUs avoid deck risk when hurt and bank coin for the market
  return cardW > coinW ? 'card' : 'coin';
}
/* strength — rough fighting power: remaining HP + AP over all locations plus 2x each hand's weapon score. Used for truce offers and how brave a CPU is around beasts. */
const strength = u => LOCS.reduce((s, l) => s + Math.max(0, u.hp[l]) + u.ap[l], 0) + wScore(u.wR) * 2 + wScore(u.wL) * 2;
/* hurtBad — true when the gladiator is in real danger: head or chest at 2 HP or less, or any live location at 1 HP.
   TWEAK: those cutoffs; they trigger healing, gifts, retreats and tunnel escapes. */
const hurtBad = player => player.hp.head <= 2 || player.hp.chest <= 2 || LOCS.some(l => player.hp[l] > 0 && player.hp[l] <= 1);
/* hpFrac — share of the starting HP still left, 0..1. */
const hpFrac = player => LOCS.reduce((s, l) => s + Math.max(0, player.hp[l]), 0) / LOCS.reduce((s, l) => s + BASE_HP[l], 0);
/* alliesOf — gladiators this one treats as friends: teammates in team/co-op events, truce partners, or everyone in co-op. Anyone underground is skipped. */
function alliesOf(player) {
  if (!S) return [];
  return activePlayers().filter(other => other !== player && !other.underground && (friendly(player, other) && (EV().teams || EV().coop) || inTruce(player, other) || EV().coop));
}
/* enemiesOf — gladiators this one may attack; truce partners are left out unless only two gladiators remain. */
function enemiesOf(player) {
  return activePlayers().filter(other => canHarmPlayer(player, other) && (!inTruce(player, other) || activePlayers().length <= 2));
}
/* threatsTo — wild (untamed) beasts that have this gladiator as their aggro target or stand within 2 tiles. TWEAK: the 2-tile radius. */
const threatsTo = player => S.npcs.filter(n => n.alive && n.tamedBy == null && (n.aggro === player.id || cheb(n, player) <= 2));
/* cpuUseItems — walks the CPU's hand once and plays what fits right now: declares Mandata, heals when hurt, uses forge/ammo/Zora cards at once, Ward when a beast is on it,
   Focus/Hercules near a target, throws a Meat Lure onto a rival, tames a beast (biggest first), nets an enemy with the Rete.
   TWEAK: the conditions in the switch, e.g. declare odds .25 + cf/250, elixir card at hpFrac < .45, Eagle offering needs cf > 70 at 20% odds, Focus odds aggression/80, and the sleep pauses (300/220 ms). */
async function cpuUseItems(player) {
  const P = pers(player);
  for (const it of [...player.items]) {
    if (!player.alive || S.over) return;
    const k = it.key;
    let use = false;
    if (it.kind === 'mf') {
      if (MANDATA[it.idx].declare && rand() < .25 + P.cf / 250) {
        await declareMandata(player, it);
        render();
        await sleep(300);
      }
      continue;
    }
    if (it.kind === 'offer') {
      if (k === 'elix2' || k === 'elix4') use = LOCS.some(l => player.hp[l] > 0 && player.hp[l] < BASE_HP[l] - (P.survival > 60 ? 0 : 1)) || hurtBad(player);else if (k === 'eagle') use = P.cf > 70 && cfAllowed() && rand() < .2;else use = true;
    } else if (it.kind === 'card') {
      const aggroed = threatsTo(player).length > 0;
      switch (k) {
        case 'elixir4':
        case 'elixir2':
          use = (hurtBad(player) || hpFrac(player) < .45) && (P.survival < 50 || player.items.filter(i => isElixir(i.key)).length > 1);
          break;
        case 'forge3':
        case 'forge2':
        case 'ammo':
        case 'zora':
          use = true;
          break;
        case 'hygeia':
          use = LOCS.some(l => player.hp[l] <= 0);
          break;
        case 'ward':
          use = aggroed && (P.survival > 35 || hurtBad(player));
          break;
        case 'focus':
          use = RD().pvp && enemiesOf(player).some(other => cheb(player, other) <= 3) && rand() < P.aggression / 80;
          break;
        case 'hercules1':
        case 'hercules2':
          use = enemiesOf(player).some(other => cheb(player, other) <= 2) && RD().pvp || S.npcs.some(n => n.alive && n.tamedBy == null && cheb(player, n) <= 2);
          break;
        case 'lure':
          use = player.diff !== 'easy' && S.npcs.some(n => lureOK100(n) && n.aggro === player.id) && enemiesOf(player).some(other => cheb(player, other) <= 4);
          break;
        case 'lyre':
        case 'tame':
          use = player.diff !== 'easy' && S.npcs.some(n => tameable(n) && n.tamedBy == null);
          break;
        case 'rete':
          use = player.diff !== 'easy' && reteTargets(player).some(u => u.cls ? canHarmPlayer(player, u) && !inTruce(player, u) : u.tamedBy == null && (u.aggro === player.id || P.survival > 60));
          break;
        default:
          use = false;
        // reactions (Omnia, Fidelis, Minerva) and market cards are played elsewhere
      }
      if (k === 'lure' && use) {
        const n = S.npcs.find(n => lureOK100(n) && n.aggro === player.id);
        const q = enemiesOf(player).filter(other => cheb(player, other) <= 4).sort((a, b) => cheb(n, a) - cheb(n, b))[0];
        if (n && q) {
          player.items = player.items.filter(x => x !== it);
          log(_T`${nm(player)} throws a Meat Lure at ${nm(q)}.`, 'big');
          breakBond100(n);
          setAggro(n, q, 'lure');
          bumpRel(q, player, -25, _T('meat lure'));
          cardShow('c:lure', player);
          think(player, _T('Accept without conceit, relinquish without reluctance.'), 'quote');
        }
        continue;
      }
      if (k === 'lyre' || k === 'tame') {
        if (use) {
          const n = S.npcs.filter(n => tameable(n) && n.tamedBy == null).sort((a, b) => NPCT[b.t].hp - NPCT[a.t].hp || cheb(player, a) - cheb(player, b))[0];
          if (n) {
            player.items = player.items.filter(x => x !== it);
            n.tamedBy = player.id;
            n.aggro = null;
            stat(player, 'tame');
            log(_T`${nm(player)} plays ${CARDS[k].n} and tames ${nm(n)}!`, 'big');
            cardShow('c:' + k, player);
            think(player, (CARDS[k].q || _T('Easy now, beast')) + '.', 'quote');
          }
        }
        continue;
      }
      if (k === 'rete' && use) {
        const u = reteTargets(player).find(u => u.cls ? canHarmPlayer(player, u) && !inTruce(player, u) : u.tamedBy == null);
        if (u) {
          u.netted = true;
          player.items = player.items.filter(x => x !== it);
          log(wIco87('thr') + _T`${nm(player)} throws the Rete over ${nm(u)}.`);
          if (u.cls) bumpRel(u, player, -10, 'netted');
          cardShow('c:rete', player);
        }
        continue;
      }
    }
    if (use) {
      const ok = await useItem(player, it);
      if (ok && it.kind === 'card' && CARDS[k].q && rand() < .5) think(player, CARDS[k].q + '.', 'quote');
      render();
      await sleep(220);
    }
  }
}
/* cpuMarket — decides whether to pay 3 CF to open the market, then buys up to 3 weapons or armor (highest affordable level first) while keeping a coin reserve. Plays % Off if held. v0.89: every purchase picks the best piece of the level's row (179-v89market).
   TWEAK: reserve (coin slider/12, /24 on Hard), weapon wanted when the weakest weapon score < 3.5 (4.5 Hard), armor wanted at survival > 55 (40 Hard) with a location under 2 AP,
   "rich" at 12+ coin, minimum CF (4, or 3 on Hard), and showmen (cf > 80) skipping half the time to save CF for freedom. */
async function cpuMarket(player) {
  if (!cfAllowed() || EV().noMarket) return;
  const P = pers(player),
    vetCF = weak(player, 'tax') && player.cf > player.coin + 3 ? 1 : 0, /* v0.74: Old debts in coin or CF, whichever it has more of */
    vet = weak(player, 'tax') && !vetCF ? 1 : 0;
  const weakest = Math.min(...armsAttached(player).map(a => wScore(player['w' + a])));
  const disc = player.items.find(i => i.kind === 'card' && i.key === 'discount');
  const sharp = aiSk(player, 'merchant', false); // Master: buys what the body lacks, whatever the temper
  const reserve = sharp ? 0 : Math.round(P.coin / (player.diff === 'hard' ? 24 : 12)); // merchants keep a purse
  const wantW = weakest < (player.diff === 'hard' ? 4.5 : 3.5) && armsAttached(player).length > 0 && (sharp || (P.aggression + P.hunt) / 2 > 30);
  const wantA = (sharp || P.survival > 55 || player.diff === 'hard' && P.survival > 40) && LOCS.some(l => player.hp[l] > 0 && player.ap[l] < 2);
  const rich = player.coin >= 12 + vet + reserve;
  if (!(wantW || wantA || rich) || player.cf < 3 + (player.diff === 'hard' ? 0 : 1) || player.coin + (disc ? 2 : 0) < 4 + vet + reserve) return;
  if (!sharp && P.cf > 80 && player.cf >= 17 && player.cf < 50 && rand() < .5) return; // showmen hoard CF for freedom
  player.cf -= 3;
  player.market = true;
  log(_T`${nm(player)} spends ${cfAmt87(3)} to unlock the market.`);
  if (disc) {
    player.items = player.items.filter(x => x !== disc);
    player.discount = 2;
    log(_T`${nm(player)} declares % Off.`);
  }
  /* v0.89: Choose is no longer a market card — it is a free weapon (179-v89market; cpuUseItems plays it) */
  for (let guard = 0; guard < 3; guard++) {
    const weak = Math.min(...armsAttached(player).map(a => wScore(player['w' + a])));
    let kind = 'w',
      lv = 0;
    for (const l of [3, 2, 1]) if (player.coin >= purchaseCost(player, l) + vet + (guard ? reserve : 0)) {
      lv = l;
      break;
    }
    if (!lv) break;
    if (weak >= 4 || !armsAttached(player).length || wantA && !wantW) {
      kind = 'a';
      if (player.diff === 'easy') break;
    }
    if (kind === 'a' && lv < 2 && player.coin < 8) break;
    player.coin -= purchaseCost(player, lv) + vet;
    if (vetCF) player.cf -= 1;
    stat(player, 'buy');
    crowdReact('buy', {
      p: player
    });
    log(_T`${nm(player)} buys at level ${lv}.`);
    const got = typeof marketBuy75 === 'function' ? await marketBuy75(player, lv, { pref: kind }) : { kind, key: await marketRoll(player, kind, lv) }; /* v0.89: the best piece of the row, either side */
    if (got.kind === 'w' && got.key) await gainWeapon(player, got.key);else if (got.key) await gainArmorPiece(player, got.key);
    think(player, pickOne(QUOTES.market), 'think');
    render();
    await sleep(250);
    if (player.coin < 12 + reserve) break;
  }
  checkMandata(player);
}
/* cpuDiplomacy — now and then (not Easy, PvP round, 3+ gladiators, no offer by anyone in the last 4 turns) offers a rival a truce or a trade.
   Truce when the rival is about as strong or stronger, the CPU is loyal, or it likes them; otherwise swaps coin/an item for the rival's best item (value 4+). A human target gets a dialog.
   TWEAK: base chance (.3 Hard, .15 normal) x (0.5 + (survival + loyalty - aggression + 50)/150), .6 when a Truce/Trade Mandatum wants it, the 0.9 strength ratio, loyalty > 75 coin flip, the 4-turn cooldown. */
async function cpuDiplomacy(player) {
  if (EV().noTruce || S.truceGone || S.tutorial || !RD().pvp || player.diff === 'easy' || EV().teams) return;
  const act = activePlayers();
  if (act.length < 3) return;
  if ((S.lastOffer || -9) > S.turnNo - 4) return;
  const P = pers(player);
  const partners = tradePartners(player).filter(other => !friendly(player, other) && !inTruce(player, other) && relOf(player, other) > -60 && !(S.onl && !other.cpu)); /* v1.0: online, a CPU never offers a human a truce or trade (decided before any dice, same on every client) */
  const mfWant = player.items.find(i => i.kind === 'mf' && [_T('The Truce'), _T('The Trade')].includes(MANDATA[i.idx].n));
  let chance = (player.diff === 'hard' ? .3 : .15) * (0.5 + (P.survival + P.loyalty - P.aggression + 50) / 150);
  if (mfWant && player.diff !== 'easy') chance = Math.max(chance, .6);
  if (!partners.length || rand() > chance) return;
  const q = pickOne(partners);
  S.lastOffer = S.turnNo;
  // offer a truce when outmatched (or when loyal), otherwise try a trade
  const wantTruce = mfWant && MANDATA[mfWant.idx].n === 'The Truce',
    wantTrade = mfWant && MANDATA[mfWant.idx].n === 'The Trade';
  if (!wantTrade && (wantTruce || strength(q) > strength(player) * 0.9 || P.loyalty > 75 && rand() < .5 || relOf(player, q) >= 25)) {
    let ok;
    if (q.cpu) ok = cpuAcceptsTruce(q, player);else ok = await hsAsk(q, () => askX(q, 'truceOffer', { from: player }, _T`${player.name} offers a truce`, `<p>${_T`${typeof truceWho==='function'?truceWho(player):player.name} (CPU) proposes a truce. Neither of you will be targeted by the other, but there is no penalty for breaking it. Only one gladiator can win.`}</p>${hint('truce')}`, [{
      label: _T('Accept truce'),
      value: 1,
      primary: 1
    }, {
      label: _T('Refuse'),
      value: 0
    }]));
    if (ok) {
      makeTruce(player, q);
      think(player, pickOne(QUOTES.truce), 'think');
    } else log(_T`${nm(q)} refuses ${nm(player)}'s truce.`);
    return;
  }
  const mine = tradeables(player).filter(x => x.t === 'coin' || x.t === 'item');
  const theirs = tradeables(q).filter(x => x.t === 'item' && x.val >= 4);
  if (!mine.length || !theirs.length) return;
  const get = theirs.sort((a, b) => b.val - a.val)[0];
  const give = mine.filter(x => x.val >= get.val * 0.9).sort((a, b) => a.val - b.val)[0];
  if (!give) return;
  let ok;
  TRADE88 = { give, get, from: player, to: q }; /* v0.88: the offer window shows both sides (163-v88fix) */
  if (q.cpu) ok = cpuAcceptsTrade(q, give, get);else ok = await hsAsk(q, () => askX(q, 'tradeOffer', { from: player }, _T`${player.name} proposes a trade`, `<p>${_T`${player.name} offers <b>${give.label}</b> for your <b>${get.label}</b>.`}</p>`, [{
    label: _T('Accept trade'),
    value: 1,
    primary: 1
  }, {
    label: _T('Refuse'),
    value: 0
  }]));
  if (ok) {
    doTrade(player, q, give, get);
  } else log(_T`${nm(q)} refuses ${nm(player)}'s trade.`);
}
/* Allies (teammates, co-op partners, truce partners) share what they can spare. */
/* cpuHelpAllies — gives at most one gift per turn to the most-hurt ally within 4 tiles: a heal, an armor token, a key for the chest, or 3 coin.
   TWEAK: care = loyalty/100 (x0.45 for truce partners, x0.6 on Easy), the 4-tile range, and the needs (ally under 50% HP, 3+ AP behind, under 4 coin while the giver has 10+). */
async function cpuHelpAllies(player) {
  if (player.gifted || isChariot() || isNaum()) return;
  const P = pers(player);
  const allies = alliesOf(player).filter(other => cheb(player, other) <= 4);
  if (!allies.length) return;
  /* truceOnly — true for an ally who is only a truce partner (not a teammate) outside co-op. */
  const truceOnly = other => !friendly(player, other) && !EV().coop;
  for (const q of allies.sort((a, b) => hpFrac(a) - hpFrac(b))) {
    const care = P.loyalty / 100 * (truceOnly(q) ? 0.45 : 1); // truce partners are still rivals
    if (rand() > care * (player.diff === 'easy' ? .6 : 1)) continue;
    const mine = tradeables(player);
    let gift = null,
      why = '';
    const heal = mine.find(x => x.t === 'item' && (x.it.key === 'elix4' || x.it.key === 'elix2' || isElixir(x.it.key)));
    if (heal && (hurtBad(q) || hpFrac(q) < .5) && (!hurtBad(player) || P.loyalty > 85)) {
      gift = heal;
      why = _T('to patch their wounds');
    }
    if (!gift) {
      const ap = mine.find(x => x.t === 'item' && (x.it.key === 'ap2' || x.it.key === 'ap3' || isForge(x.it.key)));
      if (ap && LOCS.some(l => q.ap[l] > 0) && LOCS.reduce((s, l) => s + q.ap[l], 0) < LOCS.reduce((s, l) => s + player.ap[l], 0) - 3) {
        gift = ap;
        why = _T('to shore up their armor');
      }
    }
    if (!gift && q.keys === 0 && player.keys > 1 && S.chest && S.chest.weapons.length && cheb(q, S.chest) < cheb(player, S.chest)) {
      gift = mine.find(x => x.t === 'key');
      why = _T('for the chest');
    }
    if (!gift && q.coin < 4 && player.coin >= 10 && P.coin < 65) {
      gift = {
        t: 'coin',
        v: 3,
        label: coinAmt87(3),
        val: 3
      };
      why = _T('to keep them in the fight');
    }
    if (gift) {
      doGift(player, q, gift, why);
      player.gifted = true;
      think(player, pickOne(QUOTES.gift), 'gift');
      render();
      await sleep(260);
      return;
    }
  }
}
/* allyBonus — focus-fire bonus to an attack score: a beast hunting an ally or wounded next to one, a gladiator who hit an ally or was hit by one. Scaled by loyalty.
   TWEAK: the bonuses 5 / 2 (beasts) and 3 / 4 (gladiators). */
function allyBonus(player, target) {
  // focus fire: favor targets threatening or already wounded by allies
  const al = alliesOf(player);
  if (!al.length) return 0;
  const L = pers(player).loyalty / 100;
  if (target.kind === 'npc') {
    const n = target.ref;
    if (n.aggro != null && al.some(a => a.id === n.aggro)) return 5 * L;
    if (NPCT[n.t].hp - n.hp > 0 && al.some(a => cheb(a, n) <= 2)) return 2 * L;
  }
  if (target.kind === 'player') {
    const q = target.ref;
    if (q.lastHitBy != null && al.some(a => a.id === q.lastHitBy)) return 3 * L;
    if (al.some(a => a.lastHitBy === q.id)) return 4 * L;
  }
  return 0;
}
/* ---- attack math: chance a roll reaches a damage target, counting bonuses and Omnia flips the CPU would play ---- */
const BIN = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1]];
/* pAtLeast — chance that n dice (each a 50/50 hit; damage = hits x weapon power + bonus, 0 on no hits) reach need damage, letting up to flips misses count as hits (Omnia cards). Uses the BIN table. */
function pAtLeast(n, pw, bonus, need, flips = 0) {
  if (need <= 0) return 1;
  let P = 0;
  for (let h = 0; h <= n; h++) {
    const hh = Math.min(n, h + flips);
    const d = hh > 0 ? hh * pw + bonus : 0;
    if (d >= need) P += BIN[n][h] / (1 << n);
  }
  return P;
}
/* atkPlan — what the CPU can count on for one attack: dice (4 vs beasts or in the endgame, else 2), weapon power, flat bonus (class damage ability in round 1, Cestus, Hercules),
   Omnia flips it holds (none on Easy) and the expected damage. */
function atkPlan(player, source, target) {
  // dice, bonus and flips this CPU can count on for this attack
  const n = S.endgame ? 4 : target.kind === 'npc' ? 4 : 2;
  const pw = srcPow(source);
  const bonus = statDmgB(player) + (hasCestus(player, source.arm) ? 1 : 0) + (player.hercules || 0);
  const om = player.diff === 'easy' ? 0 : player.items.some(i => i.kind === 'card' && i.key === 'omnia2') ? 2 : player.items.some(i => i.kind === 'card' && i.key === 'omnia1') ? 1 : 0;
  return {
    n,
    pw,
    bonus,
    flips: om,
    exp: n * 0.5 * pw + bonus * (1 - 1 / (1 << n))
  };
}
/* AIW_BASE — the hand-set attack-scoring weights cpuScoreAttack reads (v0.62). Tiers blend these toward AIW_TUNED (80-aitiers).
   TWEAK: every value here; tools/aitune.js searches around them. */
const AIW_BASE = {potFloor:0.5,potBase:3,potPer:2,ship:10,threat:6,killR:4,tamedBase:4,tamedKill:6,huntMul:2.2,huntBias:1/12,fistBeast:4,risk:0.5,riskHurt:1.4,riskOk:0.35,slog:0.8,
  pvpBase:3,strip:1.6,lethal:14,hurtFoe:2,fewLocs:1.5,leader:2.5,lethalHard:6,rel:1/12,friend:4,punch:1.5,throwNear:1,throwFar:3,lastUse:2};
/* cpuScoreAttack — scores one attack option; cpuAct takes the highest positive score and -1 means never. These weights shape most CPU fighting behavior.
   Pots only if the swing breaks one often enough; beasts score high when they threaten the CPU, otherwise a hunt value (trophy worth to this personality minus risk);
   gladiators score by damage that gets through plus lethal chance, scaled by aggression. Allies, relationships and weapon conservation adjust it, then noise is added.
   TWEAK: pot break floor (.5, .25 Easy) and value (3 + 2 per pot) x pr x ((cf+coin)/100 + .5); threat 6 + exp + kill x (4 + reward);
   hunt (...x2.2 + kill x (4 + reward) + (hunt-50)/12, -4 with fists, risk x0.35 / x1.4 when hurt, -0.8 per turn past 6);
   PvP 3 + strip x1.6 + lethal x14 (+2 vs hurtBad, +1.5 when 3 or fewer locations left, Hard +2.5 vs the CF leader and +lethal x6);
   relationship -r/12 capped -3..+7 and -4 vs friends; -1.5 for punches, -3 (or -1) for throwing, -2 to save a weapon's last use. */
function cpuScoreAttack(player, source, target) {
  const P = pers(player);
  const W = typeof aiW === 'function' ? aiW(player) : AIW_BASE; /* v0.62: the tunable weights (80-aitiers) */
  const pl = atkPlan(player, source, target);
  const {
    n,
    pw,
    bonus,
    flips,
    exp
  } = pl;
  const hard = player.diff === 'hard',
    easy = player.diff === 'easy';
  let s;
  if (target.kind === 'pot') {
    // only swing at a pot that can realistically break (2 damage)
    const pr = pAtLeast(n, pw, bonus, 2, Math.min(flips, 1));
    const mustSwing = S.active.restless && player.attacks === 0; // any attack keeps the restless crowd from stoning everyone
    if (pr < (easy ? 0.25 : W.potFloor) && !mustSwing) return -1; // a power-1 weapon breaks a pot only 1 time in 4: not worth the swing
    s = (W.potBase + target.ref.pots.length * W.potPer) * pr * ((P.cf + P.coin) / 100 + 0.5);
  } else if (target.kind === 'ship') s = W.ship + exp;else if (target.kind === 'npc' && S.evKey === 'orpheus' && S.ri === 0 && NPCT[target.ref.t].tameable && target.ref.tamedBy == null) {
    s = target.ref.aggro === player.id && cheb(player, target.ref) <= 1 ? target.ref.hp <= exp * 1.5 || hurtBad(player) ? 8 : 5 : -1;
  } else if (target.kind === 'npc') {
    const m = target.ref,
      T = NPCT[m.t],
      st = npcStats(m);
    const kill = pAtLeast(n, pw, bonus, m.hp, flips);
    const reward = (T.cf * (P.cf + 40) + T.coin * (P.coin + 20)) / 100; // what the trophy is worth to this personality
    const threat = m.tamedBy == null && (m.aggro === player.id || cheb(player, m) <= 1);
    if (S.evKey === 'gauntlet' || S.evKey === 'commodus' || threat) s = W.threat + exp + kill * (W.killR + reward);else if (m.tamedBy != null) s = (W.tamedBase + exp + kill * W.tamedKill) * pw50(player, 'aggression');else {
      // hunting a beast that is not after us: worth it only if it can die soon or we are built for the hunt
      // value = share of the trophy this swing earns, plus the chance to finish it now, minus the aggro it draws
      const turns = m.hp / Math.max(0.5, exp);
      s = (W.killR + reward) * Math.min(1, exp / m.hp) * W.huntMul + kill * (W.killR + reward) + (P.hunt - 50) * W.huntBias;
      if (exp < 1) s -= W.fistBeast; // a fist against a lion just earns its attention
      const risk = st.ap * W.risk * Math.min(turns, 4) * (P.survival / 100) * (hurtBad(player) || hpFrac(player) < .5 ? W.riskHurt : W.riskOk);
      s -= risk;
      if (turns > 6) s -= (turns - 6) * W.slog; // a slog the crowd won't wait for
    }
    if (source.w.punch && m.t === 'bear' && player.items.some(i => i.kind === 'mf' && MANDATA[i.idx].n === 'Bear Puncher')) s += 8;
  } else {
    // a gladiator
    const q = target.ref;
    if (inTruce(player, q) && activePlayers().length > 2) return -1;
    const locs = LOCS.filter(l => q.hp[l] > 0);
    let lethal = 0,
      strip = 0;
    for (const l of locs) {
      const eff = source.w.punch && q.ap[l] > 0 && !hasCestus(player, source.arm) ? 0 : 1; // fists glance off armor
      const vital = l === 'head' || l === 'chest' || l === 'rarm' && q.hp.larm <= 0 || l === 'larm' && q.hp.rarm <= 0;
      if (eff) lethal += vital ? pAtLeast(n, pw, bonus, q.hp[l] + q.ap[l], flips) : 0;
      strip += eff * Math.min(exp, q.ap[l] + q.hp[l]);
    }
    lethal /= locs.length;
    strip /= locs.length;
    if (strip < 0.5) return -1; // nothing gets through
    s = (W.pvpBase + strip * W.strip + lethal * W.lethal) * pw50(player, 'aggression');
    if (hurtBad(q)) s += W.hurtFoe * pw50(player, 'aggression');
    if (locs.length <= 3) s += W.fewLocs; // a foe down to few whole locations is close to done: press them
    if (hard) {
      const lead = activePlayers().filter(x => x !== player).sort((a, b) => b.cf - a.cf)[0];
      if (lead === q) s += W.leader; // hard CPUs go after the leader
      s += lethal * W.lethalHard;
    }
    if (S.evKey === 'goldenEagle' && q.eagle) s += 6;
    if (S.evKey === 'orpheus' && S.ri === 0) s = q.wR && q.wR.lyre || q.wL && q.wL.lyre ? 8 : 2;
  }
  s += allyBonus(player, target);
  if (target.kind === 'player') {
    const r = relOf(player, target.ref);
    s += clamp(-r * W.rel, -3, 7);
    if (r >= 25 && activePlayers().length > 2) s -= W.friend;
  }
  if (source.w.punch) s -= W.punch;
  if (source.thr) s -= isNaum() ? 99 : target.kind === 'player' && pAtLeast(n, pw, bonus, 3) > 0.5 ? W.throwNear : W.throwFar; // don't throw away a spear lightly
  if (source.w.atkUses && source.w.atkLeft <= 1 && s < 6) s -= W.lastUse; // save the last swing of a failing weapon
  return s + noise(player);
}

/* cpuTactic — picks the best Push or Topple (not on Easy), or null. Push: an enemy onto spikes 10, out of the shrinking zone 4, for The Push Mandatum 3; Hard may push a pillar onto a tunnel 3.
   Topple: 2.5 per pot x (cf+coin)/100 (+4 with no weapon, +1.5 for a showman with spectators) plus 6 x aggression per rival and 5/2 per beast in the fall line, -20 per friend; needs 5+.
   TWEAK: those scores and the 5 threshold. */
function cpuTactic(player) {
  if (player.diff === 'easy') return null;
  let best = null;
  const P = pers(player);
  for (const t of pushTargets(player)) {
    let s = 0;
    const [r2, c2] = t.to;
    if (t.u) {
      const enemy = t.u.cls ? canHarmPlayer(player, t.u) && !inTruce(player, t.u) : t.u.tamedBy == null;
      if (!enemy) continue;
      if (spikeAt(r2, c2)) s = 10;else if (t.u.cls && RD().zone > 1 && !inZone(r2, c2) && t.u.grace <= 0) s = 4;else if (t.u.cls && player.items.some(i => i.kind === 'mf' && MANDATA[i.idx].n === 'The Push')) s = 3;
    } else if (t.pl && player.diff === 'hard' && tunnelAt(r2, c2) && (player.keys === 0 || weak(player, 'noTunnel'))) s = 3;
    if (s > 0 && (!best || s > best.s)) best = {
      s,
      kind: 'push',
      t
    };
  }
  for (const pl of toppleTargets(player)) {
    const dr = pl.r - player.r,
      dc = pl.c - player.c;
    let s = pl.pots.length * 2.5 * ((P.cf + P.coin) / 100);
    if (pl.pots.length && !player.wR && !player.wL) s += 4; // no blade to break a pot politely: bring the whole pillar down and loot the shards
    if (S.spect && S.spect.length && P.cf >= 60) s += 1.5; // the stands ADORE falling masonry (crowdReact('topple') pays in mood)
    for (const k of [1, 2]) {
      const r = pl.r + dr * k,
        c = pl.c + dc * k;
      if (!inB(r, c)) continue;
      const q = playerAt(r, c);
      if (q && canHarmPlayer(player, q) && !inTruce(player, q)) s += 6 * pw50(player, 'aggression');
      const n = npcAt(r, c);
      if (n && n.tamedBy == null) s += n.hp <= 3 ? 5 : 2;
      if (q && q.cls && (friendly(player, q) || inTruce(player, q))) s -= 20;
    }
    if (s >= 5 && (!best || s > best.s)) best = {
      s,
      kind: 'topple',
      t: pl
    };
  }
  return best;
}
/* shouldRetreat — true when a cautious CPU (survival 45+) is badly hurt or under 40% HP with danger nearby (beast attack power + 3 per rival within 2 tiles, total 3+), rolled at survival/100 odds. Never in Gauntlet or Commodus.
   TWEAK: 45, .4 and the danger threshold 3. */
function shouldRetreat(player) {
  const P = pers(player);
  if (P.survival < 45 || S.evKey === 'gauntlet' || S.evKey === 'commodus') return false;
  const danger = threatsTo(player).reduce((s, n) => s + npcStats(n).ap, 0) + enemiesOf(player).filter(other => cheb(player, other) <= 2).length * 3;
  return (hurtBad(player) || hpFrac(player) < .4) && danger >= 3 && rand() < P.survival / 100;
}
/* cpuGoals — the tiles the CPU wants to walk toward, first match wins: get into the zone, event objectives (Eagle, Orpheus), retreat, nearby offerings/keys, loot piles, a free weapon, the chest,
   helping an ally in trouble, a pot, then a spot in range of the nearest target; else the center.
   TWEAK: PvP targeting odds 0.35 + aggression/100, ally help odds loyalty/110, pot odds 0.45 + 0.4 x (cf+coin)/100, bravery strength x (0.6 + hunt/100) > 50,
   loot range 3 (+2 when coin > 70), chest range 4 (9 on Hard). */
function cpuGoals(player) {
  /* free — on the board, no pillar, and empty or holding this CPU. */
  const free = (r, c) => inB(r, c) && !pillarAt(r, c) && (!unitAt(r, c) || unitAt(r, c) === player);
  const all = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (free(r, c)) all.push([r, c]);
  const zoneOK = ([r, c]) => RD().zone === 1 || inZone(r, c);
  const near = (list, k) => list.sort((a, b) => cheb(player, a) - cheb(player, b)).slice(0, k);
  const P = pers(player);
  if (RD().zone > 1 && !inZone(player.r, player.c)) return all.filter(zoneOK);
  // event objectives come first
  if (S.evKey === 'goldenEagle') {
    if (player.eagle && S.capture) return [[S.capture.r, S.capture.c]];
    if ((S.teamPts[player.team] || 0) >= 3) return [player.start];
    const eg = S.floor.find(f => f.kind === 'eagle');
    if (eg && cheb(player, eg) <= 8) return [[eg.r, eg.c]];
    const carrier = activePlayers().find(other => other.eagle && !friendly(player, other));
    if (carrier) return adjTiles(carrier).filter(([r, c]) => free(r, c));
    const mate = activePlayers().find(other => other.eagle && friendly(player, other) && other !== player);
    if (mate && rand() < P.loyalty / 100) return adjTiles(mate).filter(([r, c]) => free(r, c)); // escort the carrier
  }
  if (S.evKey === 'orpheus' && S.ri === 0) {
    const hasLyre = player.wR && player.wR.lyre || player.wL && player.wL.lyre;
    if (hasLyre && player.captured.length >= 2) return [player.start];
    if (hasLyre) return all.filter(([r, c]) => {
      const d = Math.max(Math.abs(r - player.start[0]), Math.abs(c - player.start[1]));
      return d >= 2 && d <= 3;
    });
    if (S.chest && S.chest.held == null && player.keys > 0) return [[S.chest.r, S.chest.c]];
  }
  // hurt and cautious: back away from whatever is hunting us
  player.retreating = false;
  if (shouldRetreat(player)) {
    const foes = [...threatsTo(player), ...enemiesOf(player).filter(other => cheb(player, other) <= 3)];
    if (foes.length) {
      const safe = all.filter(zoneOK).filter(target => Math.min(...foes.map(f => Math.max(Math.abs(target[0] - f.r), Math.abs(target[1] - f.c)))) >= 3 && cheb(player, {
        r: target[0],
        c: target[1]
      }) <= 4);
      if (safe.length) {
        player.retreating = true;
        return near(safe, 6);
      }
    }
  }
  const floorItems = S.floor.filter(f => (f.kind === 'offer' || f.kind === 'key') && cheb(player, f) <= 3 && zoneOK([f.r, f.c]));
  if (floorItems.length) return near(floorItems, 1).map(f => [f.r, f.c]);
  if (!player.looted) {
    const arms = armsAttached(player);
    const minW = arms.length ? Math.min(...arms.map(a => wScore(player['w' + a]))) : 99;
    const piles = S.piles.filter(pillar => (pillar.coin > 0 && P.coin > 30 || pillar.items.length || pillar.armor.length || pillar.weapons.some(weapon => wScore(weapon) > minW)) && cheb(player, pillar) > 0 && cheb(player, pillar) <= 3 + (P.coin > 70 ? 2 : 0) && zoneOK([pillar.r, pillar.c]));
    if (piles.length) return near(piles, 1).map(pillar => [pillar.r, pillar.c]);
  }
  if (armsAttached(player).some(a => !player['w' + a])) {
    const fw = S.floor.filter(f => f.kind === 'weapon' && cheb(player, f) > 0 && cheb(player, f) <= 4);
    if (fw.length) return near(fw, 1).map(f => [f.r, f.c]);
  }
  if (S.chest && S.chest.held == null && player.keys > 0 && S.chest.weapons.length && cheb(player, S.chest) <= (player.diff === 'hard' ? 9 : 4) && player.diff !== 'easy' && zoneOK([S.chest.r, S.chest.c])) return [[S.chest.r, S.chest.c]];
  const range = Math.max(1, ...armsAttached(player).map(a => player['w' + a] && !player['w' + a].lyre && !player['w' + a].noAtk ? player['w' + a].r : 1));
  /* inRangeOf — free in-zone tiles within weapon range of the target with line of sight. */
  const inRangeOf = target => all.filter(([r, c]) => {
    const d = Math.max(Math.abs(r - target.r), Math.abs(c - target.c));
    return d >= 1 && d <= range && zoneOK([r, c]) && los({
      r,
      c
    }, target);
  });
  let targets = [];
  if (S.evKey === 'gauntlet' || S.evKey === 'commodus') targets = S.npcs.filter(n => n.alive && n.tamedBy == null);else if (RD().pvp && !(S.evKey === 'orpheus' && S.ri === 0) && rand() < 0.35 + P.aggression / 100) targets = enemiesOf(player);
  if (S.evKey === 'orpheus' && S.ri === 0 && !(player.wR && player.wR.lyre || player.wL && player.wL.lyre)) {
    const lyrePile = S.piles.find(pillar => pillar.weapons.some(weapon => weapon.lyre));
    if (lyrePile) return [[lyrePile.r, lyrePile.c]];
  }
  // loyal CPUs go help an ally who is in trouble
  const al = alliesOf(player).filter(other => threatsTo(other).length || enemiesOf(other).some(e => cheb(e, other) <= 2));
  if (al.length && rand() < P.loyalty / 110) {
    const q = al.sort((a, b) => hpFrac(a) - hpFrac(b))[0];
    const foe = [...threatsTo(q), ...enemiesOf(player).filter(e => cheb(e, q) <= 2)].sort((a, b) => cheb(player, a) - cheb(player, b))[0];
    if (foe) {
      const g = inRangeOf(foe);
      if (g.length) return g;
    }
  }
  if (!targets.length) {
    const bearZone = ([r, c]) => S.npcs.some(n => n.alive && n.t === 'bear' && n.tamedBy == null && inRect(n.zone, {
      r,
      c
    }));
    let bl = S.pillars.filter(pillar => pillar.pots.length);
    const potLove = (P.cf + P.coin) / 100;
    const potPow = Math.max(0, ...armsAttached(player).map(a => {
      const w = player['w' + a];
      return (w && !w.lyre && !w.noAtk && w.p ? w.p : hasCestus(player, a) ? 1 : 0) + (hasCestus(player, a) ? 1 : 0);
    })) + statDmgB(player);
    if (potPow < 2 && player.diff !== 'easy') bl = []; // can't reliably break a pot: don't walk to one
    if (bl.length && rand() < 0.45 + potLove * 0.4) {
      bl.sort((a, b) => cheb(player, a) - cheb(player, b));
      for (const pl of bl) {
        let g = adjTiles(pl).filter(([r, c]) => free(r, c) && zoneOK([r, c]));
        if ((player.diff === 'hard' || P.survival > 65) && strength(player) < 45) g = g.filter(x => !bearZone(x));
        if (g.length) return g;
      }
    }
    const brave = strength(player) * (0.6 + P.hunt / 100);
    targets = S.npcs.filter(n => n.alive && n.tamedBy == null && (n.t === 'snake' || n.t === 'wolf' || brave > 50 || n.aggro === player.id));
    if (!targets.length && RD().pvp) targets = enemiesOf(player);
  }
  if (!targets.length) return all.filter(zoneOK).filter(([r, c]) => Math.abs(r - 6) + Math.abs(c - 6) <= 4);
  // Walk the target list nearest-first until one is actually attackable from somewhere.
  // A beast walled in behind rubble must never stall the whole plan (the editor's patience is a backstop, not a strategy).
  const byDist = [...targets].sort((a, b) => cheb(player, a) - cheb(player, b));
  for (const t of byDist) {
    let g = inRangeOf(t);
    // archers keep their distance: with a range-3+ weapon, prefer firing positions the target cannot answer from
    if (g.length > 1 && player.diff !== 'easy' && range >= 3) {
      const far = g.filter(([r, c]) => Math.max(Math.abs(r - t.r), Math.abs(c - t.c)) >= 2);
      if (far.length) g = far;
    }
    if (g.length) return g;
  }
  // nothing attackable is reachable this turn: close the gap toward the nearest target anyway
  const t0 = byDist[0];
  return all.filter(zoneOK).filter(([r, c]) => !(r === player.r && c === player.c)).sort((a, b) => Math.max(Math.abs(a[0] - t0.r), Math.abs(a[1] - t0.c)) - Math.max(Math.abs(b[0] - t0.r), Math.abs(b[1] - t0.c))).slice(0, 6);
}
// how dangerous each tile is for p at the end of its turn (beasts that will act on p, rivals who can reach it)
/* dangerMap — TWEAK: beast danger = its attack x 1.2 when adjacent, x 0.7 further out; rival danger = weapon power x 0.8, eased by how much that rival likes this CPU (/-150). */
function dangerMap(player) {
  const d = new Float32Array(N * N);
  for (const n of S.npcs) {
    if (!n.alive || n.tamedBy != null) continue;
    const st = npcStats(n);
    const hunts = n.aggro === player.id || (NPCT[n.t].scan || n.scan) && n.aggro == null;
    const reach = hunts ? st.mv + 1 : 1;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const k = Math.max(Math.abs(r - n.r), Math.abs(c - n.c));
      if (k <= reach || n.zone && !n.displaced && n.aggro == null && inRect(n.zone, {
        r,
        c
      })) d[r * N + c] += st.ap * (k <= 1 ? 1.2 : 0.7);
    }
  }
  if (RD().pvp) for (const q of enemiesOf(player)) {
    if (inTruce(player, q)) continue;
    const R = Math.max(1, ...armsAttached(q).map(a => q['w' + a] && !q['w' + a].noAtk ? q['w' + a].r || 1 : 1));
    const pw = Math.max(1, ...armsAttached(q).map(a => q['w' + a] ? q['w' + a].p || 1 : 1));
    const reach = mvMax(q) + R;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const k = Math.max(Math.abs(r - q.r), Math.abs(c - q.c));
      if (k <= reach) d[r * N + c] += pw * 0.8 * (1 + relOf(q, player) / -150);
    }
  }
  return d;
}
/* aiSk — is a CPU skill on? d is the old Easy/Normal/Hard answer; 80-aitiers lets each Intelligence tier set skills one by one. */
function aiSk(player, k, d) {
  return d;
}
async function aiLookahead(player) {
  return false;
}
async function aiDodge(player) {}
/* cpuAct — runs a CPU's whole Phase 3: maybe a thought, items, Zora, market, diplomacy, gifts, then up to 18 steps of: exit if allowed, loot, open the chest, best attack,
   push/topple, tunnel escape or shortcut, else walk one tile toward cpuGoals while routing around dangerMap.
   TWEAK: thought odds .25, item-use odds (.6 Easy, .8 normal, always Hard), Easy hesitation 25% (skips PvP that turn), schemer betrayal (loyalty < 25, 25% vs a hurt truce partner),
   danger routing weight dw (0.6 Hard, 0.3 otherwise), tunnel shortcut (walk 6+, saves 4+), and the pauses (250/380 ms). */
async function cpuAct(player) {
  const G = S;
  const P = pers(player);
  player.hesitant = !aiSk(player, 'steady', player.diff !== 'easy') && rand() < .25;
  if (rand() < .25) think(player, hurtBad(player) ? pickOne(QUOTES.hurt) : pickOne(QUOTES.start), 'think');
  if (aiSk(player, 'items', player.diff === 'hard') || rand() < (player.diff === 'easy' ? .6 : .8)) await cpuUseItems(player);
  if (G !== S || !player.alive) return;
  if (player.abil === 'zora' && caAllowed() && (player.zoraUsed || 0) < (player.abilVal || 1) && !player.noEagle) {
    if (spawnZora(player)) player.zoraUsed = (player.zoraUsed || 0) + 1;
  }
  if (aiSk(player, 'shop', player.diff !== 'easy')) await cpuMarket(player);
  await cpuDiplomacy(player);
  await cpuHelpAllies(player);
  await flushMF();
  render();
  const seen89 = new Set([player.r * N + player.c]); // v0.89 (his note): tiles stood on this turn — never step back onto one
  for (let guard = 0; guard < 18; guard++) {
    if (G !== S || !player.alive || player.exited || S.over) return;
    await flushMF();
    if (S.pending) {
      await settle();
      if (G !== S || S.over) return;
    }
    if (canExit(player)) {
      doExit(player);
      render();
      return;
    }
    {
      const arms = armsAttached(player);
      const minW = arms.length ? Math.min(...arms.map(a => wScore(player['w' + a]))) : 99;
      const useful = lootOptions(player).filter(o => {
        if (o.t === 'fw') return o.val > minW;
        if (player.looted) return false;
        if (o.t === 'w') return o.val > minW;
        if (o.t === 'a') {
          const pc = o.pl.armor[o.i];
          const d = ARM[pc.key];
          if (o.pl.owner === player.id && !o.pl.corpse) return false;
          return sideLocs(d).some(l => {
            if (player.hp[l] <= 0) return false;
            const c = armorConflict(player, l, pc.key);
            return !c || pc.ap > Math.min(c.ap, player.ap[l]);
          });
        }
        return true;
      });
      if (useful.length) {
        await doLoot(player, useful.sort((a, b) => b.val - a.val)[0]);
        render();
        await sleep(250);
        continue;
      }
    }
    if (canOpenChest(player)) {
      await openChest(player);
      render();
      await sleep(250);
      continue;
    }
    if (S.evKey === 'orpheus' && S.chest && onChestTile(player) && player.keys === 0 && allLimbs(player) && !player.carrying && player.mv >= 1 && player.diff === 'hard') {
      player.carrying = true;
      S.chest.held = 'p' + player.id;
      player.mv = Math.max(0, player.mv - 1);
      log(_T`${nm(player)} picks up the chest to keep it from the others.`);
    }
    // attacks
    let best = null;
    for (const src of attackSources(player)) for (const t of targetsFor(player, src)) {
      if (S.evKey === 'goldenEagle' && t.kind === 'npc' && cheb(player, t.ref) > 1 && t.ref.aggro !== player.id) continue;
      if (player.hesitant && t.kind === 'player') continue;
      let s = cpuScoreAttack(player, src, t);
      if (t.kind === 'player' && inTruce(player, t.ref) && activePlayers().length > 2) {
        // schemers occasionally betray a badly hurt truce partner
        if (P.loyalty < 25 && hurtBad(t.ref) && rand() < .25) s = 8 + noise(player);else continue;
      }
      if (s > 0 && (!best || s > best.s)) best = {
        s,
        src,
        t
      };
    }
    /* v0.98: a Veteran / Master may take a focused shot at a Blessings pot when it beats the best attack (248-v98bar) */
    const fp98 = typeof focus98CpuPot === 'function' ? focus98CpuPot(player, best) : null;
    if (fp98) {
      await doAttack(player, fp98.src, fp98.t, {
        focusRoll: true
      });
      render();
      await sleep(380);
      continue;
    }
    if (best) {
      const q0 = best.t.ref,
        reachKill = best.t.kind === 'player' && ['head', 'chest'].some(l => q0.hp[l] > 0 && q0.hp[l] + q0.ap[l] <= 2 * srcPow(best.src) + statDmgB(player));
      const focus = aiSk(player, 'focus', player.diff === 'hard') && best.t.kind === 'player' && player.mv >= (typeof FOCUS98 !== 'undefined' ? FOCUS98.min : 1) && (player.mv <= 3 || aiSk(player, 'focusAny', false) || aiSk(player, 'focusKill', false) && reachKill); // Master: spends a full walk on Focus when a vital blow can kill
      if (best.t.kind === 'player' && rand() < .3) think(player, pickOne(QUOTES.pvp), 'think');else if (best.t.kind === 'npc' && rand() < .2) think(player, pickOne(QUOTES.npc), 'think');
      await doAttack(player, best.src, best.t, {
        focusRoll: focus
      });
      render();
      await sleep(380);
      continue;
    }
    const tac = cpuTactic(player);
    if (tac) {
      if (tac.kind === 'push') await doPush(player, tac.t);else await doTopple(player, tac.t);
      render();
      await sleep(380);
      continue;
    }
    // TUNNELS, used like a fighter who has read the arena's floor plan:
    // 1) ESCAPE — hurt, with a beast on your scent or blades closing in: surface far away.
    {
      const beastHeat = S.npcs.some(n => n.alive && n.aggro === player.id);
      /* gStr — rough menace of a gladiator: body HP plus armor. */
      const gStr = u => LOCS.reduce((s2, l) => s2 + Math.max(0, u.hp[l]) + u.ap[l], 0); // rough menace: body + armor
      const bladeHeat = enemiesOf(player).filter(other => cheb(player, other) <= 2 && gStr(other) >= gStr(player) * 0.9).length >= (player.diff === 'hard' ? 1 : 2);
      if (aiSk(player, 'escape', player.diff !== 'easy') && (P.survival > 55 || player.diff === 'hard') && hurtBad(player) && (beastHeat || bladeHeat)) {
        const ex = tunnelExits(player);
        if (ex.length) {
          const threats = enemiesOf(player).concat(S.npcs.filter(n => n.alive && n.tamedBy == null));
          const safe = ex.sort((a, b) => Math.min(...threats.map(target => cheb(b, target))) - Math.min(...threats.map(target => cheb(a, target))))[0];
          think(player, pickOne(QUOTES.retreat), 'think');
          await doTunnel(player, safe);
          render();
          return;
        }
      }
    }
    // 2) TRAVEL — a spare key, a distant goal, and an exit that cuts the walk by 4+ tiles: take the shortcut.
    if (aiSk(player, 'shortcut', player.diff === 'hard') && player.keys > 1 && player.mv > 0) {
      const goals0 = cpuGoals(player);
      if (goals0.length) {
        const g0 = goals0[0];
        const walk = cheb(player, {
          r: g0[0],
          c: g0[1]
        });
        if (walk >= 6) {
          const ex = tunnelExits(player);
          const cut = ex.filter(target => cheb({
            r: target.r,
            c: target.c
          }, {
            r: g0[0],
            c: g0[1]
          }) <= walk - 4).sort((a, b) => cheb(a, {
            r: g0[0],
            c: g0[1]
          }) - cheb(b, {
            r: g0[0],
            c: g0[1]
          }))[0];
          if (cut) {
            think(player, _T('The crowd above never sees the roads below.'), 'think');
            await doTunnel(player, cut);
            render();
            return;
          }
        }
      }
    }
    if (player.mv <= 0) break;
    if (aiSk(player, 'lookahead', false) && (await aiLookahead(player))) continue; // Master: step to the tile with the best blow
    const goals = cpuGoals(player);
    if (!goals.length) break;
    if (player.retreating && guard === 0) think(player, pickOne(QUOTES.retreat), 'think');
    /* blk — tiles the path may not cross: blocked tiles plus spikes, unless the spike is itself a goal. */
    const blk = (r, c) => playerBlock(player)(r, c) || spikeAt(r, c) && !goals.some(g => g[0] === r && g[1] === c);
    const {
      dist,
      prev
    } = dijkstra(player.r, player.c, blk);
    // route around danger: hard CPUs always weigh it, normal ones half the time, easy ones stroll obliviously
    const dz = (aiSk(player, 'route', player.diff === 'hard') || player.diff === 'normal' && (player._dzRoll ?? (player._dzRoll = rand())) < 0.5 || P.survival > 65) && !(S.evKey === 'gauntlet') ? dangerMap(player) : null;
    const dw = player.aiDz != null ? player.aiDz : player.diff === 'hard' ? 0.6 : 0.3;
    let gk = -1,
      gd = 1e9;
    for (const [r, c] of goals) {
      const k = r * N + c;
      if (dist[k] >= 1e9) continue;
      const v = dist[k] + (dz ? dz[k] * dw : 0);
      if (v < gd) {
        gd = v;
        gk = k;
      }
    }
    if (gk >= 0) gd = dist[gk];
    if (gk < 0 || gd === 0 || gd >= 1e9) break;
    const path = pathTo(prev, player.r * N + player.c, gk);
    if (!path || !path.length) break;
    const k = path[0],
      r = Math.floor(k / N),
      c = k % N,
      cost = r !== player.r && c !== player.c ? 2 : 1;
    if (cost > player.mv) break;
    if (seen89.has(k)) break; // v0.89: going back and forth to spend movement — the CPU just ends its move instead
    await movePlayer(player, [k]);
    seen89.add(player.r * N + player.c);
    await checkEagleScore(player);
    render();
  }
  if (G === S && player.alive && !player.exited && !S.over && aiSk(player, 'dodge', false)) await aiDodge(player); // Master: spare steps go to safer ground
  await flushMF();
}
/* cpuCommand — moves and attacks with a beast this CPU has tamed. Zora first breaks pots or runs its own pick-up logic; otherwise the beast walks to the nearest foe and attacks, preferring gladiators, then the lowest HP. */
async function cpuCommand(player, n) {
  const G = S;
  if (n.t === 'zora') {
    const pots = tamedTargets(n, player).filter(target => target.kind === 'pot');
    if (pots.length && !n.carry) {
      await tamedAttack(n, player, pots[0]);
      return;
    }
    if (await cpuZora(player, n)) return;
  }
  let targets = [];
  const al = alliesOf(player);
  for (const m of S.npcs) {
    if (!m.alive || m === n) continue;
    if (m.tamedBy != null) {
      const o = S.players[m.tamedBy];
      if (o === player || friendly(o, player)) continue;
    }
    targets.push(m);
  }
  for (const q of S.players) if (canHarmPlayer(player, q, true) && !inTruce(player, q)) targets.push(q);
  if (S.evKey !== 'orpheus' && !RD().pvp) targets = targets.filter(target => !target.cls || S.ri > 0);
  /* pri — target priority for a tamed beast: distance, minus 3 if the target is hunting this CPU or an ally. TWEAK: the 3. */
  const pri = target => cheb(n, target) - (target.aggro != null && (target.aggro === player.id || al.some(a => a.id === target.aggro)) ? 3 : 0);
  targets.sort((a, b) => pri(a) - pri(b));
  const t = targets[0];
  if (!t) return;
  if (cheb(n, t) > 1) {
    if (n.netted) n.netted = false;else await npcWalk(n, adjTiles(t), npcStats(n).mv);
  }
  if (G !== S) return;
  const opts = tamedTargets(n, player);
  if (opts.length) {
    const hv = target => target.kind === 'player' ? target.ref.hp.head : target.kind === 'npc' ? target.ref.hp : 0;
    const pick = opts.sort((a, b) => (a.kind === 'player' ? -1 : 0) - (b.kind === 'player' ? -1 : 0) || hv(a) - hv(b))[0];
    await tamedAttack(n, player, pick);
  }
}
/* cpuDraftPick — picks one weapon or armor from a draft pool: item value +10 for a first weapon, +4 x survival/50 for a shield or +2 for a second weapon, -20 with both hands full;
   armor -6 if that slot already has 5+ AP, +2 for head/chest. Weapons scale with aggression, armor with survival.
   TWEAK: those bonuses, the /170 scaling and the random add (4 Easy, 1 otherwise). */
function cpuDraftPick(player, avail) {
  const ws = ['R', 'L'].filter(a => player['w' + a]).length;
  const P = pers(player);
  const wants = avail.map(x => {
    let v = itemValue(x.kind, x.k);
    if (x.kind === 'w') {
      if (ws === 0) v += 10;else if (ws === 1) v += W[x.k].shield ? 4 * pw50(player, 'survival') : 2;else v -= 20;
      v *= 0.7 + P.aggression / 170;
    } else {
      const a = ARM[x.k];
      const loc = a.slot === 'arm' ? 'rarm' : a.slot === 'leg' ? 'rleg' : a.slot;
      if (player.ap[loc] >= 5) v -= 6;
      if (a.slot === 'head' || a.slot === 'chest') v += 2;
      v *= 0.7 + P.survival / 170;
    }
    return {
      x,
      v: v + rand() * (player.diff === 'easy' ? 4 : 1)
    };
  });
  return wants.sort((a, b) => b.v - a.v)[0].x;
}
