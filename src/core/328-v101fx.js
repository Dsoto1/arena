/* =====================================================================
   328-V101FX · CARD / BEAST EFFECTS AS DATA (v1.01 wave 2 Foundations; audit tools/plans/v101/EFFECTS.md)
   =====================================================================
   ONE LOOKUP by key for what a card, an offering or a beast DOES: fx101Row(kind, key)
     kind 'card'  → {draw, use}  draw = what happens when the arena card is drawn (null = it goes to the hand),
                                 use  = what happens when it is played from the hand (null = it cannot be played)
     kind 'offer' → {reveal, use} reveal = an instant effect when a Blessings pot reveals it (null = it lands on the sand),
                                 use    = played from the hand
     kind 'beast' → fx101Beast(t): the behaviour profile of a beast type (NPCT keeps its numbers: hp, ap, mv, coin, cf, states)
     kind 'mf'    → a Mandata Flavi row (the reward stays MANDATA[i].reward — a registered handler)
   Every effect is {fam, …params}. fam names either a FAMILY in FX101.fam (one small interpreter shared by every row of that kind:
   coin grants, armor/weapon loss, movement, aggro, market picks, spawns, heals, AP, free rolls, crowd CF, rule cards…) or a
   BESPOKE handler registered in the same place (Fortuna, Lashings, Flavius Rule, Hygeia, the Meat Lure, taming, Ammo, Rete, Zora,
   the Choose card, the Eagle, the Piaculum, custom spawn cards, cohort cards). A new card / offering of a known kind = a table row.
   Numbers: a row's own param (n, loc, hand, t…) wins; otherwise the family reads the card's CARDS field (hp, mv, ap, dmg, lv, bear, loc).
   Generated keys resolve by pattern: a card with C.cls = a Piaculum (64's identity rule), spawn_cn_<id> = a Studio beast's spawn card
   (129), pair_<id> = a cohort card (44), any other card with C.loc = armor loss.
   The engine entry points are the old functions, now thin: 04-rules resolveDrawn → fx101Drawn, useItem → fx101Use, 03-engine
   revealOffering → fx101Reveal. The resolveDrawn wrappers of 64 (Piacula) and 129 (custom spawn cards) and the useItem wrappers of
   133 (carried-in CF offerings), 179 (the Choose card) and 199 (elixirs, free market rolls) moved INTO the table (same code, same order).
   Dice, the log and S are unchanged (treplay101 goldens; tv101s runs the old dispatch beside the new one on the same seeded states).
   ===================================================================== */
const FX101 = {card: {}, offer: {}, beast: {}, mf: {}, fam: {}, n: 0, used: Object.create(null)};

/* ---------------- the lookup ---------------- */
/* fx101Row — the one lookup: the effect row for a card / offering / beast / Mandata key (null = unknown key) */
function fx101Row(kind, key) {
  if (kind === 'beast') return fx101Beast(key);
  if (kind === 'offer') return FX101.offer[key] || null;
  if (kind === 'mf') return FX101.mf[key] || fx101MfRow(key);
  if (kind !== 'card') return null;
  const C = CARDS[key];
  if (C && C.cls) return FX101_PIA;                                                  /* a Piaculum (printed or drawn), by its class */
  if (typeof key === 'string' && key.startsWith('spawn_cn_')) return FX101_SPAWNCN;  /* a Studio beast's spawn card */
  const R = FX101.card[key];
  if (R) return R;
  if (C && C.loc) return {draw: {fam: 'stripLoc'}, use: null};                       /* any armor-loss card */
  if (typeof key === 'string' && key.startsWith('pair_')) return FX101_PAIR;         /* a cohort card */
  return C ? {draw: null, use: null} : null;
}
/* fx101Fam — the code that runs an effect: its family, else a bespoke handler of the same name */
const fx101Fam = e => e && FX101.fam[e.fam] || null;
/* fx101Num — a row's number: its own param, else the card's field */
const fx101Num = (e, C, f) => e.n != null ? e.n : C ? C[f] : undefined;

/* ---------------- the families (parameter variations) + bespoke handlers ----------------
   ctx = {p: player, k: key, C: CARDS[k] | OFFER[k], it: the hand item, reveal: the card's reveal-line helper, land: [r,c] (pots)}.
   A draw effect returns nothing. A use effect returns true (consumed: the caller drops it from the hand and, for cards, shows it
   as declared), false (not used) or 'done' (it dropped/showed itself). */
const FXF = FX101.fam;
/* --- drawn cards --- */
FXF.coin = async (x, e) => {
  const player = x.p, v = e.n;
  player.coin += v;
  coinLog(player, v, 'cards');
  log(_T`${nm(player)} draws <b>Wealth of Saturn</b>: ${coinAmt87('+'+(v))}.`);
};
FXF.loseHand = async (x, e) => {
  const player = x.p, a = e.hand;
  const w = player['w' + a];
  x.reveal('bad');
  if (w && !w.lyre && !w.noAtk) {
    player['w' + a] = null;
    log(_T`${nm(player)}'s ${w.n} falls apart and is discarded.`, 'bad');
    think(player, pickOne([_T('Cheap Capuan steel!'), _T('Of course it breaks now.')]), 'angry');
  } else log(_T('Nothing in that hand to lose.'));
};
FXF.stripLoc = async (x, e) => {
  const player = x.p, loc = e.loc || x.C.loc;
  x.reveal('bad');
  if (player.hp[loc] > 0 && (player.ap[loc] > 0 || player.pieces[loc].length)) {
    stripLoc(player, loc);
    log(_T`${nm(player)}'s ${LOCN[loc].toLowerCase()} armor falls away (0 AP).`);
  } else log(_T('There was no armor there to lose.'));
};
FXF.stripAll = async x => {
  x.reveal('bad');
  for (const l of LOCS) stripLoc(x.p, l);
  think(x.p, _T('All bad fortune is conquered by endurance.'), 'quote');
};
FXF.moveTurn = async (x, e) => {
  const player = x.p, v = fx101Num(e, x.C, 'mv');
  player.mercBonus = (player.mercBonus || 0) + v;
  log(_T`${nm(player)} draws <b>Speed of Mercury</b>: +${v} movement this turn.`);
};
FXF.moveRound = async x => {
  x.p.mercRound = S.ri;
  log(_T`${nm(x.p)} draws <b>Speed of Mercury</b> (active): +1 movement for the rest of the round.`);
};
FXF.bearAggro = async (x, e) => {
  const player = x.p, bear = e.bear || x.C.bear, cf = e.cf != null ? e.cf : 2;
  const n = S.npcs.find(n => (n.key || n.name) === bear);
  x.reveal();
  if (!n || !n.alive) {
    player.cf += cf;
    log(_T`${beastName(bear)} is gone: ${nm(player)} gains ${cfAmt87(cf)} instead.`);
  } else {
    breakBond100(n);
    n.aggro = null;
    setAggro(n, player, 'card');
  }
};
FXF.marketPick = async (x, e) => {
  x.reveal('');
  await chooseMarket(x.p, e.kind || 'a', fx101Num(e, x.C, 'lv'));
};
FXF.tax = async (x, e) => {
  const player = x.p;
  const v = Math.min(e.n, player.coin);
  player.coin -= v;
  coinLog(player, -v, 'cards');
  log(_T`${nm(player)} draws <b>Flavius Telonium</b> and pays ${coinAmt87(v)} in tax.`, 'bad');
};
FXF.activeRule = async (x, e) => {
  S.active[e.rule] = e.val;
  x.reveal();
  await popRule(e.rule);
};
FXF.spawn = async (x, e) => {
  x.reveal();
  if (e.at) spawnNPC(e.t, e.name(), e.at());else spawnNPC(e.t, e.name());
  paint('draw');
  await beat('resolveDrawn', 400);
};
/* bespoke drawn cards */
FXF.fortuna = async x => {
  const player = x.p;
  player.cf += 2;
  player.coin += 2;
  coinLog(player, 2, 'cards');
  x.reveal();
  for (let i = 0; i < 2; i++) {
    const [r, c] = freeGrid();
    placeFloor('offer', drawOffer(), r, c);
    log(_T`An offering lands on ${tl(r, c)}.`);
  }
  if (S.deck.length) {
    log(_T`${nm(player)} draws another arena card.`);
    await drawArena(player);
  }
};
FXF.lashings = async x => {
  x.reveal('bad');
  await hurt(x.p, 'chest', 2, {
    type: 'env'
  }, _T('Lashings'), {
    noShield: 1,
    direct: 1
  });
  x.p.forceEnd = true;
};
FXF.spikes = async x => {
  x.reveal();
  await raiseSpikes();
};
FXF.endgame = async x => {
  S.endgame = 1;
  x.reveal();
  banner(_T('Flavius Rule'), _T('4 hit dice · attackers choose the location'));
  log(_T('Flavius Rule is in play: every attack now rolls 4 hit dice and the attacker chooses the hit location.'), 'hd');
  await popRule('endgame');
};
FXF.boar = async x => {
  S.active.boar = {
    left: activePlayers().length
  };
  x.reveal();
  await popRule('boar');
};
FXF.spawnCommodus = async x => {
  x.reveal();
  await spawnCommodus();
  paint('draw');
  await beat('resolveDrawn', 400);
};
FXF.pair = async x => {
  x.reveal();
  await pairCardPlay(x.p, x.k);
  paint('draw');
  await beat('resolveDrawn', 400);
};
/* own: these show the card themselves (they ran before the base's reveal as the 64 / 129 wrappers) */
FXF.piaculum = async x => {
  const player = x.p, k = x.k, C = CARDS[k];
  const id=C.cls;const L=piaLabel(id);cardShow('c:'+k,player,_T('🂠 Drawn'));log(_T`${nm(player)} reveals <b>${C.n}</b>: ${C.d}`);
  const tgt=activePlayers().find(q=>piaIdentity(q)===id);
  if(!tgt){log(_T`No ${esc(L.name)} is in the arena. The Piaculum is discarded.`);return}
  if(tgt===player){let tot=0;for(const q of activePlayers())if(q!==player){const v=Math.min(2,q.coin);q.coin-=v;coinLog(q,-v,'cards');tot+=v}player.coin+=tot;coinLog(player,tot,'cards');log(_T`Everyone pays the ${esc(L.name)}: ${nm(player)} collects ${coinAmt87(tot)}.`)}
  else{const v=Math.min(2,player.coin);player.coin-=v;coinLog(player,-v,'cards');tgt.coin+=v;coinLog(tgt,v,'cards');log(_T`${nm(player)} pays ${nm(tgt)} ${coinAmt87(v)}.`)}
};
FXF.spawnCustom = async x => {
  const player = x.p, k = x.k, C = CARDS[k], t = 'cn_' + k.slice(9);
  cardShow('c:'+k,player,_T('🂠 Drawn'));if(!C||!NPCT[t]){log(_T`${nm(player)} draws a beast card for a beast that is no longer in the pens.`);return}
  log(_T`${nm(player)} reveals <b>${esc(C.n)}</b>: ${esc(C.d)}`,'big');spawnNPC(t,C.n,null);draw();await sleep(400);
};

/* --- played from the hand (cards and offerings) --- */
FXF.heal = async (x, e) => {
  const n = e.n != null ? e.n : (x.C.hp | 0);
  DIST91.cancel = true;
  let ok = false;
  try {
    ok = await distributeHP(x.p, n, _T('a Health Elixir'));
  } finally {
    DIST91.cancel = false;
  }
  return !!ok;
};
FXF.apUp = async (x, e) => !!(await apUp(x.p, fx101Num(e, x.C, 'ap')));
FXF.freeRoll = async (x, e) => {
  const player = x.p, kind = e.kind, lv = e.lv;
  const key = await marketRoll(player, kind, lv, {
    free: 1
  });
  if (!key) return false;
  if (kind === 'w') await gainWeapon(player, key);else await gainArmorPiece(player, key);
  return true;
};
FXF.moveCap = async (x, e) => {
  const player = x.p, v = e.n;
  player.mv = Math.min(e.cap, player.mv + v);
  log(_T`${nm(player)} declares Speed of Mercury: +${v} movement.`);
  return true;
};
FXF.crowdCF = async (x, e) => {
  /* v0.99: a no-CF round blocks spending only; the offering still earns */
  const player = x.p, v = e.n;
  cfWhy('offerings');
  player.cf += v;
  log(_T`${nm(player)} offers to the crowd: <b>${cfAmt87('+'+(v))}</b>.`);
  return true;
};
/* mark — a declared card that sets a flag / adds to a counter on the gladiator and says so */
FXF.mark = async (x, e) => {
  const player = x.p, v = e.from ? x.C[e.from] : e.add != null ? e.add : e.val;
  if (e.add != null || e.from) player[e.prop] = (player[e.prop] || 0) + v;else player[e.prop] = v;
  log(e.msg(player, v));
  return true;
};
FXF.reaction = async x => {
  if (!x.p.cpu) await askW(x.p, 'cardReaction', x.C.n, `<p>${_T`This card is played as a reaction. You will be asked when an attack is rolled against you or by you.`}</p>`, [{
    label: 'OK',
    value: 1
  }]);
  return false;
};
FXF.eagle = async x => {
  /* v0.99 (his rule): a no-CF round only stops SPENDING Crowd Favor — trading the Eagle to the crowd still earns it */
  const player = x.p;
  player.cf += 5;
  log(_T`${nm(player)} trades the Golden Eagle to the crowd for ${cfAmt87(5)}. It respawns atop a pillar.`);
  const pl = pickOne(S.pillars);
  if (pl) pl.pots.push('eagle');
  return true;
};
FXF.hygeia = async x => {
  const player = x.p;
  const sev = LOCS.filter(l => player.hp[l] <= 0 && l !== 'head' && l !== 'chest');
  if (!sev.length) {
    if (!player.cpu) await askW(player, 'regrowNone', _T('Nothing to regrow'), `<p>${_T`You have no severed limbs.`}</p>`, [{
      label: 'OK',
      value: 1
    }]);
    return false;
  }
  const l = player.cpu ? sev[0] : await askW(player, 'limbRegrow', _T('Blessings of Hygeia'), `<p>${_T`Choose the limb to regrow.`}</p>`, sev.map(x => ({
    label: LOCN[x],
    value: x
  })));
  if (!l) return false;
  player.hp[l] = 4;
  log(_T`${nm(player)}'s ${LOCN[l]} regrows (4 HP).`, 'big');
  return true;
};
FXF.rete = async x => {
  S.mode = 'rete';
  S.reteItem = x.it.id;
  return false;
};
FXF.lure = async x => {
  const player = x.p;
  const n = await pickNPC(player, _T('Meat Lure'), lureOK100, _T('Choose the NPC to lure.'));
  if (!n) return false;
  const targets = activePlayers().filter(other => other !== player && !other.underground && cheb(player, other) <= 4);
  if (!targets.length) {
    if (!player.cpu) await askW(player, 'lureNone', _T('Meat Lure'), `<p>${_T`No other gladiator is within 4 tiles to throw the lure at.`}</p>`, [{
      label: 'OK',
      value: 1
    }]);
    return false;
  }
  let q;
  if (player.cpu) q = targets.sort((a, b) => cheb(n, a) - cheb(n, b))[0];else {
    const id = await askW(player, 'lureTarget', _T('Meat Lure'), `<p>${_T`Throw the lure at which gladiator (within 4 tiles)? ${n.name} will hunt them.`}</p>`, targets.map(target => ({
      label: target.name,
      sub: _T`${cheb(n, target)} tiles from ${n.name}`,
      value: target.id
    })));
    q = S.players[id];
  }
  if (!q) return false;
  log(_T`${nm(player)} throws a Meat Lure at ${nm(q)}.`, 'big');
  breakBond100(n);
  setAggro(n, q, 'lure');
  bumpRel(q, player, -25, _T('meat lure'));
  return true;
};
FXF.tame = async x => {
  const player = x.p;
  const n = await pickNPC(player, x.C.n, n => tameable(n) && n.tamedBy !== player.id, _T('Choose the beast to tame. Fazed beasts cannot be tamed.'));
  if (!n) return false;
  if (n.tamedBy != null) log(_T`${nm(player)} steals ${n.name} from ${S.players[n.tamedBy].name}!`, 'big');
  n.tamedBy = player.id;
  n.aggro = null;
  stat(player, 'tame');
  log(_T`${nm(player)} tames ${nm(n)}. It obeys from their next Resolve phase.`, 'big');
  return true;
};
FXF.ammo = async x => {
  const player = x.p, it = x.it;
  const need = ammoWeapons(player).filter(weapon => weapon.ammoLeft < weapon.ammo);
  const pair = player.items.filter(x => x.kind === 'card' && x.key === 'ammo').length >= 2;
  const pool = [];
  for (const lv of [1, 2, 3]) {
    const m = S.market.w[lv];
    for (const x of [...m.slots.filter(Boolean), ...m.deck]) if (W[x].ammo) pool.push({
      x,
      lv
    });
  }
  let mode = null;
  if (player.cpu) mode = need.length ? 'refill' : pair && pool.length && armsAttached(player).some(a => !player['w' + a] || wScore(player['w' + a]) < 3) ? 'swap' : null;else {
    const b = [];
    if (need.length) b.push({
      label: _T('Replenish all ammo'),
      sub: need.map(weapon => weapon.n).join(', '),
      value: 'refill'
    });
    if (pair && pool.length) b.push({
      label: _T('Exchange 2 Ammo cards'),
      sub: _T('for any available ammo weapon'),
      value: 'swap'
    });
    if (!b.length) {
      await askW(player, 'ammoNone', _T('Ammo'), `<p>${_T`No weapon needs ammo, and you need 2 Ammo cards to exchange for an ammo weapon.`}</p>`, [{
        label: 'OK',
        value: 1
      }]);
      return false;
    }
    b.push({
      label: _T('Cancel'),
      value: null
    });
    mode = await askW(player, 'ammoMode', _T('Ammo'), hint('ammo'), b);
  }
  if (!mode) return false;
  if (mode === 'refill') {
    for (const w of need) w.ammoLeft = w.ammo;
    log(wIco87('ammo') + _T`${nm(player)} replenishes ${need.map(weapon => weapon.n).join(' and ')}.`);
    return true;
  }
  let pick;
  if (player.cpu) pick = pool.sort((a, b) => wScore(W[b.x]) - wScore(W[a.x]))[0];else {
    const i = await askW(player, 'ammoPick', _T('Ammo exchange'), `<p>${_T`Choose an ammo weapon.`}</p>`, pool.map((o, i) => ({
      label: W[o.x].n,
      sub: wStats(mkW(o.x)),
      value: i,
      card: 'w:' + o.x
    })));
    pick = pool[i ?? 0];
  }
  const other = player.items.find(x => x !== it && x.kind === 'card' && x.key === 'ammo');
  player.items = player.items.filter(x => x !== other);
  const m = S.market.w[pick.lv];
  const si = m.slots.indexOf(pick.x);
  if (si >= 0) m.slots[si] = m.deck.pop() || null;else m.deck.splice(m.deck.indexOf(pick.x), 1);
  log(wIco87('ammo') + _T`${nm(player)} exchanges two Ammo cards for the ${W[pick.x].n}.`);
  await gainWeapon(player, pick.x);
  return true;
};
FXF.zora = async x => !!spawnZora(x.p);
/* the Choose card (179, his answer): ONE free weapon of any level 1-3 — it drops and shows itself before the pick */
FXF.mchoice = async x => {
  const player = x.p, it = x.it;
  if(!armsAttached(player).length||!mchoiceHas89()){
    if(!player.cpu)await askW(player,'marketNone',CARDS.mchoice.n,`<p>${!armsAttached(player).length?_T('You have no arm left to hold a weapon.'):_T('No weapon is left in the market.')}</p>`,[{label:'OK',value:1}]);
    return false}
  player.items=player.items.filter(x=>x!==it);cardShow('c:mchoice',player,_T('📣 Declared'));stat(player,'cardsPlayed');
  log(_T`${nm(player)} declares Choose: a free weapon from the market.`);
  const r=await pick89(player,[1,2,3],['w'],{title:_T('Choose · a free weapon')});if(r&&r.key)await gainWeapon(player,r.key);
  return 'done';
};

/* --- revealed from a Blessings pot --- */
FXF.limbBite = async (x, e) => {
  const player = x.p;
  log(_T`Spiders pour out onto ${nm(player)}!`, 'bad');
  if (typeof hitFlash === 'function') hitFlash(player.r, player.c, 'spiders');
  if (!HEADLESS && !S.sim) await beat('revealOffering', 900);
  for (const l of e.locs) if (player.alive && player.hp[l] > 0) await hurt(player, l, e.n, {
    type: 'env'
  }, _T('Spiders bite'), {
    noShield: 1,
    noCards: 1
  });
};
FXF.curse = async x => {
  const player = x.p;
  const r = d6(),
    l = rollLoc(player);
  log(_T`A Curse Tablet! ${nm(player)} rolls ${r}.`, 'bad');
  await hurt(player, l, r, {
    type: 'env'
  }, _T('The curse strikes'), {
    noShield: 1,
    noCards: 1
  });
};
FXF.potCF = async (x, e) => {
  const player = x.p, v = e.n;
  if (weak(player, 'noBlessCF')) {
    log(_T`The crowd cheers, but ${nm(player)} gains no CF from Blessings.`);
  } else {
    player.cf += v;
    log(_T`${nm(player)} gains ${cfAmt87(v)} from the crowd.`);
  }
};

/* ---------------- the tables ---------------- */
const FX101_PIA = {draw: {fam: 'piaculum', own: 1}, use: null},
  FX101_SPAWNCN = {draw: {fam: 'spawnCustom', own: 1}, use: null},
  FX101_PAIR = {draw: {fam: 'pair'}, use: null};
/* the arena deck (02-data CARDS): draw = the instant effect, use = played from the hand. Cards with neither go to the hand and wait
   for a reaction window (Omnia, Fidelis, Minerva: 04-rules defend / hurt) or stay in play (Mercury's round: S.mercRound). */
(() => {
  const C = FX101.card, hand = use => ({draw: null, use});
  C.wealth3 = {draw: {fam: 'coin', n: 3}, use: null};
  C.wealth5 = {draw: {fam: 'coin', n: 5}, use: null};
  C.wpnR = {draw: {fam: 'loseHand', hand: 'R'}, use: null};
  C.wpnL = {draw: {fam: 'loseHand', hand: 'L'}, use: null};
  for (const [k, loc] of [['armHead', 'head'], ['armChest', 'chest'], ['armRarm', 'rarm'], ['armLarm', 'larm'], ['armRleg', 'rleg'], ['armLleg', 'lleg']]) C[k] = {draw: {fam: 'stripLoc', loc}, use: null};
  C.fallsApart = {draw: {fam: 'stripAll'}, use: null};
  C.merc1 = {draw: {fam: 'moveTurn'}, use: null};
  C.merc2 = {draw: {fam: 'moveTurn'}, use: null};
  C.mercRound = {draw: {fam: 'moveRound'}, use: null};
  C.ursa = {draw: {fam: 'bearAggro', cf: 2}, use: null};
  C.brutum = {draw: {fam: 'bearAggro', cf: 2}, use: null};
  C.marm1 = {draw: {fam: 'marketPick', kind: 'a'}, use: null};
  C.marm2 = {draw: {fam: 'marketPick', kind: 'a'}, use: null};
  C.telonium = {draw: {fam: 'tax', n: 4}, use: null};
  C.fortuna = {draw: {fam: 'fortuna'}, use: null};
  C.lashings = {draw: {fam: 'lashings'}, use: null};
  C.spikes = {draw: {fam: 'spikes'}, use: null};
  C.telemachus = {draw: {fam: 'activeRule', rule: 'telemachus', val: 1}, use: null};
  C.restless = {draw: {fam: 'activeRule', rule: 'restless', val: 4}, use: null};
  C.endgame = {draw: {fam: 'endgame'}, use: null};
  C.boar = {draw: {fam: 'boar'}, use: null};
  C.spawnLeo = {draw: {fam: 'spawn', t: 'lion', name: () => _T('Leo')}, use: null};
  C.spawnLeaena = {draw: {fam: 'spawn', t: 'lion', name: () => _T('Leaena')}, use: null};
  C.spawnTholo = {draw: {fam: 'spawn', t: 'tholo', name: () => _T('Tholo'), at: () => S.ri < 2 ? [6, 6] : null}, use: null};
  C.spawnCommodus = {draw: {fam: 'spawnCommodus'}, use: null};
  /* kept in the hand */
  C.elixir4 = hand({fam: 'heal'});
  C.elixir2 = hand({fam: 'heal'});
  C.forge3 = hand({fam: 'apUp'});
  C.forge2 = hand({fam: 'apUp'});
  C.hercules1 = hand({fam: 'mark', prop: 'hercules', from: 'dmg', msg: (p, v) => _T`${nm(p)} declares Herculean Vigor: +${v} damage if their next attack lands.`});
  C.hercules2 = hand({fam: 'mark', prop: 'hercules', from: 'dmg', msg: (p, v) => _T`${nm(p)} declares Herculean Vigor: +${v} damage if their next attack lands.`});
  C.ward = hand({fam: 'mark', prop: 'warded', val: true, msg: p => _T`${nm(p)} declares the Ward of the Evil Eye.`});
  C.focus = hand({fam: 'mark', prop: 'focusNext', val: true, msg: p => _T`${nm(p)} declares Focus! for their next attack.`});
  C.discount = hand({fam: 'mark', prop: 'discount', add: 2, msg: p => _T`${nm(p)} declares % Off: market items cost 2 less this turn.`});
  C.mchoice = hand({fam: 'mchoice'});
  C.hygeia = hand({fam: 'hygeia'});
  C.rete = hand({fam: 'rete'});
  C.lure = hand({fam: 'lure'});
  C.lyre = hand({fam: 'tame'});
  C.tame = hand({fam: 'tame'});
  C.ammo = hand({fam: 'ammo'});
  C.zora = hand({fam: 'zora'});
  for (const k of ['omnia1', 'omnia2', 'fidelis', 'minerva', 'elixirSave']) C[k] = hand({fam: 'reaction'});
  /* the printed Piacula resolve by their class (fx101Row's C.cls rule); listed here so every printed key has a row */
  for (const k of Object.keys(CARDS)) if (k.startsWith('pia_') && CARDS[k].cls) C[k] = FX101_PIA;
})();
/* the Blessings tokens (02-data OFFER): reveal = instant when a pot breaks (else it lands: 03 revealOffering / 78 / 122), use = from the hand */
(() => {
  const O = FX101.offer;
  O.elix2 = {reveal: null, use: {fam: 'heal', n: 2}};
  O.elix4 = {reveal: null, use: {fam: 'heal', n: 4}};
  O.ap2 = {reveal: null, use: {fam: 'apUp', n: 2}};
  O.ap3 = {reveal: null, use: {fam: 'apUp', n: 3}};
  for (const kind of ['w', 'a']) for (const lv of [1, 2, 3]) O['m' + kind + lv] = {reveal: null, use: {fam: 'freeRoll', kind, lv}};
  O.spiders = {reveal: {fam: 'limbBite', n: 1, locs: ['larm', 'rarm', 'rleg', 'lleg']}, use: null};
  O.curse = {reveal: {fam: 'curse'}, use: null};
  O.cf1 = {reveal: {fam: 'potCF', n: 1}, use: {fam: 'crowdCF', n: 1}};
  O.cf2 = {reveal: {fam: 'potCF', n: 2}, use: {fam: 'crowdCF', n: 2}};
  O.merc1 = {reveal: null, use: {fam: 'moveCap', n: 1, cap: 7}};
  O.merc2 = {reveal: null, use: {fam: 'moveCap', n: 2, cap: 7}};
  O.eagle = {reveal: null, use: {fam: 'eagle'}};
  O.key = {reveal: null, use: null};
})();
/* Mandata Flavi: every card is already its own row (MANDATA[i]: test, declare, reward) — the table points at it by name */
function fx101MfRow(name) {
  const i = MANDATA.findIndex(M => M.n === name);
  return i < 0 ? null : FX101.mf[name] = {fam: 'mandata', idx: i, run: MANDATA[i].reward};
}

/* ---------------- beasts: one behaviour profile per type ----------------
   NPCT keeps the stat profile (hp, ap, mv, rng, coin, cf, states, scan, tameable, fly, huntCF). FX101.beast adds what used to be
   tested by name in the rules:  hunt  = hunts the closest living thing (186 HUNT90: Tholo, the lions)
   prey (default 1) = may be hunted (Zora never)   hoard = keeps the coin of what it kills (Tholo)   chest = scoops up the Arena Chest (Tholo)
   picksCF = picks the top-CF gladiator itself and ignores aggro except cards (Commodus; custom: NPCT huntCF)
   lure (1 / 0 / 'auto') = the Meat Lure works on it ('auto' = not a humanoid: 228 hum95ally). */
FX101.beast = {
  snake: {}, wolf: {}, bear: {},
  lion: {hunt: 1},
  tholo: {hunt: 1, hoard: 1, chest: 1, lure: 1},
  commodus: {picksCF: 1, lure: 0},
  zora: {prey: 0, lure: 0}
};
/* fx101Beast — the behaviour profile of beast type t (printed rows above; a Studio beast cn_<id> from its own NPCT row = npcType) */
function fx101Beast(t) {
  const T = NPCT[t] || {}, B = FX101.beast[t] || {};
  return {
    hunt: !!B.hunt,
    prey: B.prey !== 0,
    hoard: !!B.hoard,
    chest: !!B.chest,
    picksCF: !!(B.picksCF || T.huntCF),
    scan: !!T.scan,
    tame: !!T.tameable,
    fly: !!T.fly,
    lure: B.lure != null ? !!B.lure : !(typeof hum95ally === 'function' && hum95ally(t)),
    custom: !!T.custom
  };
}

/* ---------------- the interpreter (the engine's entry points) ---------------- */
/* fx101Drawn — 04-rules resolveDrawn: a drawn arena card. TWEAK: the rows above, not this. */
async function fx101Drawn(player, k) {
  const C = CARDS[k];
  const R = fx101Row('card', k), e = R && R.draw;
  FX101.n++;
  if (e && e.own) {
    FX101.used[e.fam] = (FX101.used[e.fam] | 0) + 1;
    return FXF[e.fam]({p: player, k, C}, e);
  }
  cardShow('c:' + k, player, _T('🂠 Drawn'));
  /* reveal — logs the card reveal with the given log style. */
  const reveal = (cls = 'big') => log(_T`${nm(player)} reveals <b>${C.n}</b>: ${C.d}`, cls);
  const f = fx101Fam(e);
  if (f) {
    FX101.used[e.fam] = (FX101.used[e.fam] | 0) + 1;
    await f({p: player, k, C, reveal}, e);
    return;
  }
  player.items.push(mkCard(k));
  log(_T`${nm(player)} draws <b>${C.n}</b> (${C.type}) and keeps it in hand.`);
}
/* fx101Use — 04-rules useItem: plays an item from the hand. Returns true when the item is used up. */
async function fx101Use(player, it) {
  if (it.kind === 'mf') return declareMandata(player, it);
  if (it.kind !== 'offer' && it.kind !== 'card') return false;
  const k = it.key, R = fx101Row(it.kind, k), e = R && R.use, f = fx101Fam(e);
  if (!f) return false;
  FX101.n++;
  FX101.used[e.fam] = (FX101.used[e.fam] | 0) + 1;
  const C = it.kind === 'card' ? CARDS[k] : OFFER[k];
  const ok = await f({p: player, k, C, it}, e);
  if (ok === 'done') return true;
  if (!ok) return false;
  player.items = player.items.filter(x => x !== it);
  if (it.kind === 'card') {
    cardShow('c:' + k, player, _T('📣 Declared'));
    stat(player, 'cardsPlayed');
  }
  return true;
}
/* fx101Reveal — 03-engine revealOffering: an instant offering resolves, any other lands on the land tile (or the player's tile if a
   pillar stands there) and is picked up. 78 (CF offerings that land) and 122 (where a pillar's offering falls) wrap it. */
async function fx101Reveal(player, off, land) {
  const O = OFFER[off];
  const R = fx101Row('offer', off), e = R && R.reveal, f = fx101Fam(e);
  if (f) {
    FX101.n++;
    FX101.used[e.fam] = (FX101.used[e.fam] | 0) + 1;
    await f({p: player, k: off, C: O, land}, e);
    return;
  }
  let [r, c] = land;
  r = clamp(r, 0, N - 1);
  c = clamp(c, 0, N - 1);
  if (pillarAt(r, c)) {
    r = player.r;
    c = player.c;
  }
  placeFloor('offer', off, r, c);
  log(_T`An offering spills onto ${tl(r, c)}: <b>${O.n}</b> (${O.s}).`);
  await pickupAt(r, c);
}
/* fx101Check — every key in the game data has a row whose effect resolves to code (tv101s): returns the problems */
function fx101Check() {
  const bad = [];
  const has = e => !e || !!fx101Fam(e);
  for (const k of Object.keys(CARDS)) {
    const R = fx101Row('card', k);
    if (!R) bad.push('card:' + k + ' no row');else if (!has(R.draw) || !has(R.use)) bad.push('card:' + k + ' unknown family'); // i18n:skip (test-facing)
  }
  for (const k of Object.keys(OFFER)) {
    const R = fx101Row('offer', k);
    if (!R) bad.push('offer:' + k + ' no row');else if (!has(R.reveal) || !has(R.use)) bad.push('offer:' + k + ' unknown family'); // i18n:skip (test-facing)
  }
  for (const t of Object.keys(NPCT)) if (!fx101Beast(t)) bad.push('beast:' + t);
  for (const M of MANDATA) {
    const R = fx101Row('mf', M.n);
    if (!R || typeof R.run !== 'function' && M.reward) bad.push('mf:' + M.n);
  }
  return bad;
}
