/* =====================================================================
   04-RULES · THE TURN, PHASE BY PHASE
   =====================================================================
   Implements the printed turn structure:
   1 RESOLVE  beasts aggro'd on you (or whose zone you stand in) act; section cheers pay CF.
   2 CHOICE   2 coin or draw an arena card (handled in 05-flow's takeChoice).
   3 ACTION   attacks live here: hit dice (PvP 2, PvE 4), location die, focus rolls, throws.
   4 END      handled by 05-flow's endTurn.
   Also: Mandata Flavi checking/declaring, Carmina Fescennina, trades and truces.
   The attack path is doAttack() -> rollHits() -> hurt() (in 03-engine).
   ===================================================================== */
/* ================= ATTACKS ================= */
/* attackSources — lists every attack the player can still make this turn: one entry per usable weapon (a bare-fist PUNCH for an empty arm), plus a throw option for a throwable weapon not yet used this turn. Empty under Telemachus or once attacks reach the number of attached arms. TWEAK: uses per weapon per turn (2 for two-handed 'both' weapons, else 1). */
function attackSources(player) {
  if (S.active && S.active.telemachus && !isChariot()) return [];
  const arms = armsAttached(player);
  if (player.attacks >= arms.length) return [];
  const out = [];
  for (const a of arms) {
    const w = player['w' + a];
    if (w) {
      if (w.lyre || w.noAtk || w.shield && !w.p) continue;
      if (player.armUses[a] >= (w.both ? 2 : 1)) continue;
      if (w.atkUses && w.atkLeft <= 0) continue;
      const canNormal = !(w.ammo != null && w.ammoLeft <= 0);
      if (canNormal) out.push({
        arm: a,
        w
      });
      if (w.throw && w.throwsLeft > 0 && player.armUses[a] === 0) out.push({
        arm: a,
        w,
        thr: 1
      });
    } else if (player.armUses[a] < 1) out.push({
      arm: a,
      w: PUNCH
    });
  }
  return out;
}
/* srcRange — range of an attack source; a throw uses the weapon's throw range. */
const srcRange = s => s.thr ? s.w.throw.r : s.w.r;
/* srcPow — damage per hit of an attack source; a throw uses the weapon's throw power. */
const srcPow = s => s.thr ? s.w.throw.p : s.w.p;
/* targetsFor — every target in range and line of sight for this source: harmable players, beasts not tamed by you or an ally, and adjacent pillar pots (melee only; fists need a Cestus). Each target can be hit once per turn. TWEAK: the swimming range penalty (rng--). */
function targetsFor(player, source) {
  let rng = srcRange(source);
  const res = [];
  if (swimming(player)) rng--;
  if (rng <= 0) return res;
  if (isChariot() && !chCanAttack(player)) return res;
  for (const q of S.players) if (canHarmPlayer(player, q) && !player.hitTargets.has('p' + q.id) && cheb(player, q) <= rng && los(player, q)) res.push({
    kind: 'player',
    ref: q,
    key: 'p' + q.id,
    r: q.r,
    c: q.c
  });
  for (const n of S.npcs) {
    if (!n.alive || player.hitTargets.has('n' + n.id)) continue;
    if (n.tamedBy != null) {
      const o = S.players[n.tamedBy];
      if (o === player || o && friendly(o, player)) continue;
    }
    if (cheb(player, n) <= rng && los(player, n)) res.push({
      kind: 'npc',
      ref: n,
      key: 'n' + n.id,
      r: n.r,
      c: n.c
    });
  }
  if (!source.thr && (!source.w.punch || hasCestus(player, source.arm))) for (const pl of S.pillars) if (pl.pots.length && cheb(player, pl) === 1 && !player.hitTargets.has('b' + pl.id)) res.push({
    kind: 'pot',
    ref: pl,
    key: 'b' + pl.id,
    r: pl.r,
    c: pl.c
  });
  return res;
}
/* defend — lets the victim react to an incoming hit with Minerva's Push (dodge; returns -1) or Fidelis Constans (drop one hit die). CPUs decide by difficulty and survival personality, humans get a modal. Returns the new hit count. TWEAK: CPU damage thresholds (Minerva 4 on hard / 6 otherwise, Fidelis 4). */
async function defend(victim, damage, location, pw, bonus, h, attackerName, attacker) {
  // returns new hit count, or -1 when the attack is dodged
  if (!victim.cls || damage <= 0) return h;
  const hasM = victim.items.some(x => x.kind === 'card' && x.key === 'minerva'),
    hasF = victim.items.some(x => x.kind === 'card' && x.key === 'fidelis');
  if (!hasM && !(hasF && h > 0)) return h;
  const eff = victim.hp[location] + victim.ap[location];
  const lethal = damage >= eff;
  let choice = 'take';
  if (victim.cpu) {
    if (victim.diff === 'easy') return h;
    const cau = pers(victim).survival / 100;
    const sev = !lethal && location !== 'head' && location !== 'chest' && damage >= eff;
    if (hasM && (lethal || sev && victim.diff === 'hard' || damage >= (victim.diff === 'hard' ? 4 : 6) - cau * 2)) choice = 'm';else if (hasF && h > 0 && (lethal || (victim.diff === 'hard' || cau > .6) && damage >= 4)) choice = 'f';
  } else {
    const btns = [];
    if (hasM) btns.push({
      label: _T("Play Minerva's Push"),
      sub: _T('step 1 tile and dodge all of it'),
      value: 'm',
      card: 'c:minerva'
    });
    if (hasF && h > 0) btns.push({
      label: _T('Play Fidelis Constans'),
      sub: _T`remove 1 hit die → ${Math.max(0, (h - 1) * pw + (h - 1 > 0 ? bonus : 0))} damage`,
      value: 'f',
      card: 'c:fidelis'
    });
    btns.push({
      label: _T('Take the hit'),
      value: 'take',
      primary: 1
    });
    choice = await askW(victim, 'defend', _T('Incoming attack'), `<p>${_T`${attackerName} will deal <b>${damage}</b> damage to your ${LOCN[location]} (${victim.ap[location]} AP, ${victim.hp[location]} HP).`}</p>${hint('defend')}`, btns);
  }
  if (choice === 'm') {
    fx(victim.r, victim.c, _T('dodged!'), '#9fd3ff', {
      big: 1
    });
    victim.items.splice(victim.items.findIndex(x => x.kind === 'card' && x.key === 'minerva'), 1);
    log(_T`${nm(victim)} plays <b>Minerva's Push</b> and dodges the attack!`, 'big');
    cardShow('c:minerva', victim);
    await minervaStep(victim, attacker);
    return -1;
  }
  if (choice === 'f') {
    victim.items.splice(victim.items.findIndex(x => x.kind === 'card' && x.key === 'fidelis'), 1);
    log(_T`${nm(victim)} plays <b>Fidelis Constans</b>: one hit die removed.`, 'big');
    cardShow('c:fidelis', victim);
    return h - 1;
  }
  return h;
}
/* minervaStep — after a Minerva dodge, moves the victim one free tile (CPU steps farthest from the attacker; humans pick or stay put), dragging a carried chest and picking up items there. Skipped in chariot races and sea fights. */
async function minervaStep(victim, attacker) {
  if (isChariot() || isNaum()) return;
  const free = adjTiles(victim).filter(([r, c]) => !pillarAt(r, c) && !unitAt(r, c) && !spikeAt(r, c));
  if (!free.length) return;
  let t;
  if (victim.cpu) t = free.sort((a, b) => attacker ? cheb({
    r: b[0],
    c: b[1]
  }, attacker) - cheb({
    r: a[0],
    c: a[1]
  }, attacker) : 0)[0];else {
    const k = await askW(victim, 'minervaStep', _T("Minerva's Push"), `<p>${_T`Step one tile in any direction.`}</p>`, free.map(([r, c]) => ({
      label: tl(r, c),
      sub: attacker ? _T`${cheb({
        r,
        c
      }, attacker)} from ${attacker.name}` : '',
      value: r * N + c
    })).concat([{
      label: _T('Stay put'),
      value: -1
    }]));
    if (k == null || k < 0) return;
    t = [Math.floor(k / N), k % N];
  }
  victim.r = t[0];
  victim.c = t[1];
  if (victim.carrying && S.chest) {
    S.chest.r = victim.r;
    S.chest.c = victim.c;
  }
  log(_T`${nm(victim)} steps to ${tl(victim.r, victim.c)}.`);
  paint('draw');
  await pickupAt(victim.r, victim.c);
}
/* the location that ends a gladiator soonest: a vital spot (head/chest) with the least HP+AP left, else the weakest limb. TWEAK: the +3 margin (a vital spot still wins if it is up to 3 points tougher than the weakest limb). */
function focusBest(other, locs) {
  const vit = locs.filter(l => l === 'head' || l === 'chest');
  const eff = l => other.hp[l] + other.ap[l];
  const bv = [...vit].sort((a, b) => eff(a) - eff(b))[0];
  const bl = [...locs].sort((a, b) => eff(a) - eff(b))[0];
  if (bv && eff(bv) <= eff(bl) + 3) return bv;
  return bl;
}
/* chooseLocation — picks the hit location for a focused attack. 'card' (Focus! or Flavius Rule): the attacker picks any living location. 'roll' (focus roll): the location die is rolled 3 times and the attacker picks one result. CPUs take the weakest spot. TWEAK: number of focus rolls (3), the 1.5 weight CPUs give head/chest. */
async function chooseLocation(player, other, how) {
  const locs = LOCS.filter(l => other.hp[l] > 0);
  const weak = [...locs].sort((a, b) => other.hp[a] + other.ap[a] - (other.hp[b] + other.ap[b]) + ((b === 'head' || b === 'chest') - (a === 'head' || a === 'chest')) * 1.5);
  if (how === 'card') {
    if (player.cpu) return weak[0];
    {
      const best = focusBest(other, locs);
      return await askW(player, 'focusLoc', _T('Focus!'), `<p>${_T`Choose where to strike ${esc(other.name)}. 💡 The gold one is the quickest way to put them down.`}</p>`, locs.map(l => ({
        label: `${l === best ? '💡 ' : ''}${LOCN[l]}`,
        sub: _T`AP ${other.ap[l]} · HP ${other.hp[l]}${l === best ? _T(' · the fastest finish') : ''}`,
        value: l,
        primary: l === best
      })));
    }
  }
  const rolls = [rollLoc(other), rollLoc(other), rollLoc(other)];
  log(_T`${nm(player)} focuses: the location die shows ${rolls.map(l => LOCN[l]).join(', ')}.`);
  const opts = [...new Set(rolls)].sort((a, b) => weak.indexOf(a) - weak.indexOf(b));
  if (player.cpu) return opts[0];
  /* v0.46: show the three dice, and point at the location that finishes the target fastest (a lost head or chest is out) */
  const best = focusBest(other, opts);
  const dice = rolls.map(l => `<span class="focdie ${l === best ? 'best' : ''}">${typeof locIcon === 'function' ? locIcon(l) : ''}<b>${LOCN[l]}</b></span>`).join('');
  return await askW(player, 'focusRoll', _T('🎯 Focus roll'), `<p>${_T`The location die was rolled three times for <b>${esc(other.name)}</b>:`}</p><div class="focdice">${dice}</div><p class="rc-sub" style="margin:6px 0 0">${_T`Pick one result to strike. 💡 The gold one is the quickest way to put ${esc(other.name)} down.`}</p>`, opts.map(l => ({
    label: `${l === best ? '💡 ' : ''}${LOCN[l]}`,
    sub: _T`AP ${other.ap[l]} · HP ${other.hp[l]}${l === best ? _T(' · the fastest finish') : ''}${l === 'head' || l === 'chest' ? _T(' · a vital spot') : ''}`,
    value: l,
    primary: l === best
  })));
}
/* doAttack — resolves one attack end to end: rolls hit dice, offers Omnia Mutantur, adds bonus damage, then damages a ship, pot, beast or player (who may defend), and handles weapon wear, soul steal, CF-earning weapons and thrown weapons landing. TWEAK: hit dice (4 vs beasts or under Flavius Rule, 2 vs players), pot break threshold (2 damage), 'bighit' stat threshold (8). */
async function doAttack(player, source, target, {
  focusRoll = false
} = {}) {
  if (isChariot() && target.kind === 'player') return chAttack(player, source, target);
  const w = source.w,
    pw = srcPow(source);
  player.attacks++;
  player.armUses[source.arm]++;
  player.hitTargets.add(target.key);
  if (w.ammo != null && !source.thr) w.ammoLeft--;
  let usedFocus = false;
  if (focusRoll && player.mv > 0 && !player.focusNext) { /* v1.00: a declared Focus! card already picks the location in a popup (no roll, no movement spent) */
    player.mv = 0;
    usedFocus = true;
  }
  const n = S.endgame ? 4 : target.kind === 'npc' ? 4 : 2;
  let hits = rollHits(n);
  const verb = w.punch ? 'punches' : source.thr ? wIco87('thr') + _T`throws the ${w.n}` : _T`attacks with ${w.n}`;
  const tgtName = target.kind === 'pot' ? _T`the pot on ${tl(target.r, target.c)}` : target.kind === 'ship' ? target.ref.name : target.ref.name;
  if (hits.some(x => !x)) {
    const miss = hits.filter(x => !x).length;
    /* wants — CPU test for playing Omnia Mutantur: always vs players, vs beasts when under 2 hits, vs pots when damage would be under 2. */
    const wants = () => target.kind === 'player' || target.kind === 'npc' && cnt(hits) < 2 || target.kind === 'pot' && cnt(hits) * pw < 2;
    const ok = await askCard(player, miss >= 2 ? ['omnia2', 'omnia1'] : ['omnia1', 'omnia2'], _T('Omnia Mutantur'), _T`You rolled ${cnt(hits)} of ${n} hits against ${tgtName}. Turn misses into hits?`, wants);
    if (ok) {
      let f = CARDS[ok].flip;
      hits = hits.map(x => {
        if (!x && f > 0) {
          f--;
          return true;
        }
        return x;
      });
    }
  }
  let h = cnt(hits);
  const herc = player.hercules || 0;
  player.hercules = 0;
  /* bonus — flat damage added when at least one die hits: the class 'dmg' ability (round 1 only), +1 for a Cestus, plus Herculean Vigor. */
  const bonus = () => h > 0 ? statDmgB(player) + (hasCestus(player, source.arm) ? 1 : 0) + herc : 0;
  let dmg = h * pw + bonus();
  fxLine(player, target.kind === 'pot' || target.kind === 'ship' ? {
    r: target.r,
    c: target.c
  } : target.ref, source.w.punch ? '#e6d3b0' : '#ff6a55');
  if (dmg <= 0) fx(target.r, target.c, 'miss', '#b8b0a4');
  const pre = _T`${nm(player)} ${verb} at ${tgtName} ${diceHtml(hits)} ${h}×${pw}${bonus() ? '+' + bonus() : ''} = ${wIco87('dmg') + dmg}`;
  if (dmg > 0 && typeof hitFlash === 'function' && (target.kind === 'pot' || target.kind === 'ship')) hitFlash(target.r, target.c, target.kind === 'pot' ? 'pot' : 'pillar'); /* v0.46 */
  if (dmg >= 8) stat(player, 'bighit');
  stat(player, 'dmgDealt', 0);
  if (target.kind === 'ship') {
    const sh = target.ref;
    sh.hp -= dmg;
    log(_T`${pre} → the ${sh.name}'s pillar (${Math.max(0, sh.hp)} of 12 HP left).`);
    if (sh.hp <= 0) sinkShip(sh, player);
  } else if (target.kind === 'pot') {
    if (dmg >= 2) {
      log(pre + _T(' — the chains snap.'));
      const pl = target.ref;
      await breakPot(pl, player, [pl.r + Math.sign(player.r - pl.r), pl.c + Math.sign(player.c - pl.c)]);
    } else {
      log(_T`${pre} — the pot holds (needs 2).`);
      if (typeof BUS !== 'undefined' && BUS.has('pot.hold')) try { BUS.emit('pot.hold', { r: target.r, c: target.c, dmg: Math.max(0, dmg), need: 2 }); } catch (e) {} /* v1.05 B42: display only */
    }
  } else if (target.kind === 'npc') {
    const nn = target.ref;
    if (w.punch && nn.t === 'bear') stat(player, 'punchBear');
    stat(player, 'dmgDealt', dmg);
    if (nn.t === 'tholo' && w.key === 'arcu' && (usedFocus || player.focusNext) && dmg > 0) {
      player.focusNext = false;
      log(_T`${pre} — a focused Arcuballista bolt to Tholo's head!`, 'big');
      hurtNPC(nn, nn.hp, player, _T('Headshot'), w);
    } else hurtNPC(nn, dmg, player, pre, w);
  } else {
    const q = target.ref;
    if (inTruce(player, q)) {
      breakTruce(player, q);
    }
    if (w.limb && w.from === q.id) stat(player, 'limbRevenge');
    if (w.tradedFrom === q.id && w.tradeTurn === S.turnNo) stat(player, 'tradeAttack');
    let loc;
    if (player.focusNext || S.endgame) {
      player.focusNext = false;
      loc = await chooseLocation(player, q, 'card', dmg);
    } else if (usedFocus) loc = await chooseLocation(player, q, 'roll', dmg);else loc = rollLoc(q);
    const nh = await defend(q, dmg, loc, pw, bonus(), h, player.name, player);
    if (nh < 0) {
      log(pre + _T(' — dodged.'));
    } else {
      h = nh;
      dmg = h * pw + bonus();
      stat(player, 'dmgDealt', dmg);
      if (dmg > 0) stat(player, 'pvpHits');
      await hurt(q, loc, dmg, {
        type: 'player',
        p: player,
        punch: !!w.punch,
        cestus: hasCestus(player, source.arm),
        w
      }, `${nm(player)} ${verb} ${diceHtml(hits)} = ${wIco87('dmg')}${dmg}`);
    }
    bumpRel(q, player, -(5 + Math.max(0, dmg) * 1.5), 'attacked');
    q.lastHitBy = player.id;
  }
  if (w.atkUses && player['w' + source.arm] === w) {
    w.atkLeft--;
    if (w.atkLeft <= 0) {
      player['w' + source.arm] = null;
      log(wIco87('use') + _T`The ${w.n} falls apart after its last use.`);
    }
  }
  if (w.shield && w.p > 0 && player['w' + source.arm] === w) {
    w.usesLeft--;
    if (w.usesLeft <= 0) {
      player['w' + source.arm] = null;
      log(wIco87('use') + _T`The ${w.n} is worn out.`);
    }
  }
  if (h > 0 && w.soul && player.alive) await distributeHP(player, h * w.soul, _T`${w.n}'s soul steal`, target && target.alive === false); /* v0.99: a killing blow places the stolen HP itself */
  if (h > 0 && w.cfw) {
    cfWhy('crowd-pleasing weapons');
    player.cf += h * w.cfw;
    log(_T`${nm(player)} gains ${cfAmt87(h * w.cfw)} from the crowd (${w.n}).`);
  }
  if (source.thr && player['w' + source.arm] === w) {
    player['w' + source.arm] = null;
    w.throwsLeft--;
    if (w.throwsLeft > 0) {
      let [r, c] = [target.r, target.c];
      if (pillarAt(r, c)) {
        r = player.r;
        c = player.c;
      }
      S.floor.push({
        id: uid++,
        kind: 'weapon',
        w,
        r,
        c,
        thrown: S.turnNo,
        owner: player.id
      });
      log(wIco87('thr') + _T`The ${w.n} lands on ${tl(r, c)} (${w.throwsLeft} throw${w.throwsLeft > 1 ? 's' : ''} left).`);
    } else log(wIco87('thr') + _T`The ${w.n} is spent.`);
  }
  checkMandata(player);
  checkEnd();
}
/* breakTruce — removes the truce between two players; unless forced, the victim's opinion of the breaker drops and they say something angry. TWEAK: relationship penalty (-35). */
function breakTruce(player, other, forced) {
  S.truces.delete(truceKey(player.id, other.id));
  if (!forced) {
    bumpRel(other, player, -35, _T('broke their truce'));
    log(_T`${nm(player)} breaks the truce with ${nm(other)}!`, 'bad');
    think(other, pickOne([_T('Traitor! The gods saw that.'), _T('So much for Roman honor.'), _T('I will remember this, ') + player.name + '.']), 'angry');
  }
}

/* ================= NPC PHASE ================= */
/* closestPlayer — the nearest active player (not underground or exited) to a beast; ties go to whoever comes first counting from the current player. */
function closestPlayer(n) {
  let best = null,
    bd = 1e9;
  for (let i = 0; i < S.players.length; i++) {
    const q = S.players[(S.cur + i) % S.players.length];
    if (!q.alive || q.underground || q.exited) continue;
    const d = cheb(n, q);
    if (d < bd) {
      bd = d;
      best = q;
    }
  }
  return best;
}
/* npcWalk — moves a beast toward the nearest reachable goal tile with up to mv movement (diagonals cost 2 for walkers, 1 for fliers), animating each step. Tholo grabs the Arena Chest if he ends on it. Returns true if it moved. TWEAK: step delay (140 ms), 14-step safety cap. */
async function npcWalk(npc, goals, mv) {
  const fly = !!NPCT[npc.t].fly;
  const blk = fly ? (r, c) => !!unitAt(r, c) && unitAt(r, c) !== npc : npcBlock(npc);
  const {
    dist,
    prev
  } = dijkstra(npc.r, npc.c, blk, fly);
  let gk = -1,
    gd = 1e9;
  for (const [r, c] of goals) {
    if (blk(r, c) && !(r === npc.r && c === npc.c)) continue;
    const k = r * N + c;
    if (dist[k] < gd) {
      gd = dist[k];
      gk = k;
    }
  }
  if (gk < 0 || gd >= 1e9) return false;
  let spent = 0,
    moved = false;
  if (!fly) {
    // walk down a distance field from the goal so slow beasts take orthogonal steps instead of stalling on a diagonal
    const gr = Math.floor(gk / N),
      gc = gk % N;
    const {
      dist: dg
    } = dijkstra(gr, gc, (r, c) => blk(r, c) && !(r === npc.r && c === npc.c));
    for (let guard = 0; guard < 14; guard++) {
      const here = dg[npc.r * N + npc.c];
      if (here === 0) break;
      let best = null;
      for (const [r, c] of adjTiles(npc)) {
        if (blk(r, c)) continue;
        const cost = r !== npc.r && c !== npc.c ? 2 : 1;
        if (spent + cost > mv) continue;
        const d = dg[r * N + c];
        if (d >= here) continue;
        const sc = d + cost * 0.01;
        if (!best || sc < best.sc) best = {
          r,
          c,
          cost,
          sc
        };
      }
      if (!best) break;
      spent += best.cost;
      npc.r = best.r;
      npc.c = best.c;
      moved = true;
      paint('draw');
      await beat('npcWalk', 140);
    }
    if (fx101Beast(npc.t).chest && S.chest && S.chest.held == null && npc.r === S.chest.r && npc.c === S.chest.c) {
      S.chest.held = npc.id;
      log(_T('Tholo scoops up the Arena Chest!'), 'big');
    }
    return moved;
  }
  const path = pathTo(prev, npc.r * N + npc.c, gk);
  if (!path) return false;
  for (let i = 0; i < path.length; i++) {
    const k = path[i];
    const r = Math.floor(k / N),
      c = k % N;
    const cost = fly ? 1 : r !== npc.r && c !== npc.c ? 2 : 1;
    if (spent + cost > mv) break;
    if (fly && i < path.length - 1 && spent + cost + 1 > mv && unitAt(r, c)) break;
    spent += cost;
    npc.r = r;
    npc.c = c;
    moved = true;
    paint('draw');
    await beat('npcWalk', 140);
  }
  if (fx101Beast(npc.t).chest && S.chest && S.chest.held == null && npc.r === S.chest.r && npc.c === S.chest.c) {
    S.chest.held = npc.id;
    log(_T('Tholo scoops up the Arena Chest!'), 'big');
  }
  return moved;
}
/* npcAct — one beast activation against a player: walk into range (a netted beast struggles free instead), then attack a random location unless the player is Warded. stay=true skips the walk. TWEAK: hit dice (2). */
async function npcAct(npc, player, stay = false) {
  const st = npcStats(npc);
  if (cheb(npc, player) > st.rng && !stay) {
    if (npc.netted) {
      log(_T`${nm(npc)} struggles in the net.`);
      npc.netted = false;
    } else await npcWalk(npc, adjTiles(player), st.mv);
  }
  if (cheb(npc, player) <= st.rng && player.alive && !player.exited) {
    if (player.warded) {
      log(_T`${nm(npc)} circles ${nm(player)} but the Ward holds it back.`);
      return;
    }
    const hits = rollHits(2);
    let h = cnt(hits);
    const loc = rollLoc(player);
    let dmg = h * st.ap;
    fxLine(npc, player, '#ffa04a');
    if (!dmg) fx(player.r, player.c, 'miss', '#b8b0a4');
    const nh = await defend(player, dmg, loc, st.ap, 0, h, npc.name, npc);
    if (nh < 0) return;
    h = nh;
    dmg = h * st.ap;
    await hurt(player, loc, dmg, {
      type: 'npc',
      n: npc
    }, _T`${nm(npc)}${st.state && st.state !== 'Initial' ? ' (' + st.state + ')' : ''} attacks ${diceHtml(hits)} ${h}×${st.ap} = ${dmg}`);
  }
}
/* tamedTargets — what a tamed beast may attack: adjacent beasts not owned by its master or allies, adjacent harmable players not in truce with the master, and (Zora only) adjacent pots. Nothing while it carries something. */
function tamedTargets(npc, player) {
  const out = [];
  if (npc.carry) return out;
  if (npc.t === 'zora') for (const pl of S.pillars) if (pl.pots.length && cheb(npc, pl) <= 1) out.push({
    kind: 'pot',
    ref: pl,
    r: pl.r,
    c: pl.c
  });
  for (const m of S.npcs) {
    if (!m.alive || m === npc || cheb(npc, m) > 1) continue;
    if (m.tamedBy != null) {
      const o = S.players[m.tamedBy];
      if (o === player || friendly(o, player)) continue;
    }
    out.push({
      kind: 'npc',
      ref: m,
      r: m.r,
      c: m.c
    });
  }
  for (const q of S.players) if (canHarmPlayer(player, q, true) && cheb(npc, q) <= 1 && !inTruce(player, q)) out.push({
    kind: 'player',
    ref: q,
    r: q.r,
    c: q.c
  });
  return out;
}
/* tamedAttack — a tamed beast attacks for its owner. Pots break at 2+ damage; an untamed beast it hits counter-attacks; a player hit may defend and then likes the owner less. TWEAK: hit dice (2), pot threshold (2), relationship penalty (4 + damage). */
async function tamedAttack(npc, player, target) {
  const st = npcStats(npc);
  const hits = rollHits(2);
  let h = cnt(hits);
  let dmg = h * st.ap;
  const pre = _T`${nm(npc)} (${player.name}'s) attacks ${diceHtml(hits)} ${h}×${st.ap} = ${dmg}`;
  if (target.kind === 'pot') {
    const pl = target.ref;
    if (dmg >= 2) {
      log(pre + _T(' at a Blessings pot — it shatters!'));
      await breakPot(pl, player, [pl.r + Math.sign(npc.r - pl.r), pl.c + Math.sign(npc.c - pl.c)]);
    } else log(pre + _T(' at a Blessings pot — it holds.'));
    return;
  }
  if (target.kind === 'npc') {
    const m = target.ref;
    hurtNPC(m, dmg, player, pre, null, npc);
    if (m.alive && m.tamedBy == null) {
      const ms = npcStats(m);
      const ch = rollHits(2);
      const cd = cnt(ch) * ms.ap;
      hurtNPC(npc, cd, null, _T`${nm(m)} counter-attacks ${diceHtml(ch)} = ${cd}`);
      if (!npc.alive) log(_T`${player.name}'s ${npc.name} is lost.`, 'bad');
    }
  } else {
    const q = target.ref,
      loc = rollLoc(q);
    const nh = await defend(q, dmg, loc, st.ap, 0, h, npc.name, npc);
    if (nh >= 0) {
      h = nh;
      dmg = h * st.ap;
      await hurt(q, loc, dmg, {
        type: 'npc',
        n: npc,
        owner: player
      }, pre);
      bumpRel(q, player, -(4 + dmg), _T('set a beast on them'));
    }
  }
}
/* tameable — true if the beast is alive, its type can be tamed, and it is not in its Fazed state. */
function tameable(npc) {
  return npc.alive && fx101Beast(npc.t).tame && npcStats({
    ...npc,
    tamedBy: null
  }).state !== 'Fazed';
}
/* lyreControl — Orpheus round 1: a Lyre holder may lead one untamed, tameable beast toward their starting tile; if it arrives it is captured, and the first capture releases both lions. CPUs pick the beast with the shortest path. */
async function lyreControl(player) {
  if (S.evKey !== 'orpheus' || S.ri !== 0) return;
  if (!(player.wR && player.wR.lyre || player.wL && player.wL.lyre)) return;
  const cands = S.npcs.filter(n => n.alive && n.tamedBy == null && fx101Beast(n.t).tame);
  if (!cands.length) return;
  const [sr, sc] = player.start;
  /* dOf — path distance from a beast to the player's starting tile (1e9 = no path). */
  const dOf = n => {
    const {
      dist
    } = dijkstra(n.r, n.c, npcBlock(n));
    return dist[sr * N + sc];
  };
  let n;
  if (player.cpu) {
    n = cands.map(x => ({
      x,
      d: dOf(x)
    })).filter(o => o.d < 1e9).sort((a, b) => a.d - b.d)[0]?.x;
  } else {
    const id = await askW(player, 'lyreBeast', _T('Lyre of Orpheus'), `<p>${_T`Serenade one beast and lead it toward your starting tile ${tl(sr, sc)}. Two captures let you exit. Step off your starting tile so the beast can reach it.`}</p>`, cands.map(x => ({
      label: `${typeof npcTokHTML === 'function' ? `<span class="tok99">${npcTokHTML(x, 30)}</span>` : ''}${x.name} (${NPCT[x.t].n})`,
      sub: `${tl(x.r, x.c)} · ${dOf(x) >= 1e9 ? _T('no path') : dOf(x) + _T(' moves away')}`,
      value: x.id
    })).concat([{
      label: _T('Skip'),
      value: null
    }]));
    n = cands.find(x => x.id === id);
  }
  if (!n) return;
  n.lyred = player.id;
  n.aggro = null;
  log(_T`${nm(player)} plays the Lyre. ${nm(n)} follows the music.`);
  await npcWalk(n, [[sr, sc]], npcStats(n).mv);
  if (n.r === sr && n.c === sc) {
    n.alive = false;
    player.captured.push({
      t: n.t,
      name: n.name
    });
    log(_T`${nm(player)} captures ${nm(n)}! (${player.captured.length} of 2)`, 'big');
    if (!S.lionsOut) {
      S.lionsOut = 1;
      log(_T('The first capture is made. Both lions are released!'), 'big');
      spawnNPC('lion', _T('Leo'));
      spawnNPC('lion', _T('Leaena'));
    }
    checkEnd();
  }
}
/* v1.0 tame bonds: lureOK100 — the Meat Lure works on any live beast but Zora, Commodus, custom humanoids and human NPCs (Tholo stays lurable: open question). breakBond100 — a bond ends: the beast turns wild, one log line. */
function lureOK100(n) {
  if (!n || !n.alive) return false;
  return fx101Beast(n.t).lure; /* v1.01: the beast table's lure (zora/commodus 0, tholo 1, else not a humanoid) */
}
function breakBond100(n) {
  if (!n || n.tamedBy == null) return false;
  const o = S.players[n.tamedBy];
  n.tamedBy = null;
  log(_T`🐾 ${n.name} breaks free of ${o ? nm(o) : '?'}!`, 'bad');
  return true;
}
// Aggro: each NPC holds at most one aggro target, always the most recent player to attack, push or lure it.
function setAggro(npc, player, why) {
  if (!npc || !npc.alive || npc.tamedBy != null || !player) return;
  if (fx101Beast(npc.t).picksCF && why !== 'card') return; // Commodus picks his own prey
  const prev = npc.aggro;
  npc.aggro = player.id;
  npc.aggroWhy = why;
  if (!player.cpu) popRule('aggro');
  if (prev !== player.id) {
    const old = prev != null ? S.players[prev] : null;
    const because = {
      tamed: _T(' — their tamed beast struck it'),
      card: _T(' — the card sends it'),
      push: ' — pushed',
      lure: ' — lured'
    }[why] || '';
    if (old && old.alive) log(_T`${nm(npc)} turns its aggro from ${nm(old)} to ${nm(player)}${because}.`);else log(_T`${nm(npc)} is now aggro on ${nm(player)}${because}.`);
  }
}
/* npcTrigger — why a beast acts in this player's Resolve phase: 'aggro' (targeting them), 'adjacent'/'opportunist' (within 1 tile), 'zone' (player in its home zone), 'scan' (player is closest); null = idle. Also clears aggro whose target is gone. */
function npcTrigger(npc, player) {
  // why this NPC activates on p's resolve phase (null = it doesn't)
  if (!npc.alive || npc.tamedBy != null || npc.lyred != null) return null;
  if (npc.aggro === player.id) return 'aggro';
  if (cheb(npc, player) <= 1) return npc.aggro != null ? 'opportunist' : 'adjacent';
  if (npc.aggro != null) {
    const a = S.players[npc.aggro];
    if (a && a.alive && !a.exited && !a.underground) return null;
    npc.aggro = null;
  }
  if (npc.zone && !npc.displaced && inRect(npc.zone, player)) return 'zone';
  if ((NPCT[npc.t].scan || npc.scan) && closestPlayer(npc) === player) return 'scan';
  return null;
}
/* resolvePhase — Phase 1 for a player: crowd pelting, the Calydonian Boar, section cheers, Commodus retargets the top-CF player, then triggered beasts act (farthest first), tamed beasts take orders, the Lyre is played and idle home beasts drift back. TWEAK: pelt damage (1), boar damage (2, on an odd d6). */
async function resolvePhase(player) {
  const G = S;
  // weaknesses, active cards, spectators
  if (weak(player, 'pelted') && !player.drafted && pelt100Turn(player)) {
    await hurt(player, rollLoc(player), 1, {
      type: 'env'
    }, _T`The crowd pelts ${player.name} with a stone`);
  }
  if (S.active.boar && player.alive) {
    const r = d6();
    if (r % 2) {
      await hurt(player, rollLoc(player), 2, {
        type: 'env'
      }, _T`The Calydonian Boar charges ${player.name} (rolled ${r}, odd)`);
    } else log(_T`${nm(player)} rolls ${r} and leaps clear of the Calydonian Boar.`);
    if (--S.active.boar.left <= 0) {
      S.active.boar = null;
      log(_T('The Calydonian Boar is driven back into the hypogeum.'));
    }
  }
  sectionCheer(player);
  if (!player.alive) return;
  // Commodus always hunts the closest player, most CF first
  for (const n of S.npcs) if (n.alive && fx101Beast(n.t).picksCF && n.tamedBy == null) {
    const act = activePlayers().filter(other => !other.underground);
    const top = Math.max(...act.map(other => other.cf));
    const c = act.filter(other => other.cf === top).sort((a, b) => cheb(n, a) - cheb(n, b))[0];
    if (c && n.aggro !== c.id) {
      n.aggro = c.id;
      n.aggroWhy = 'commodus';
    }
  }
  const acts = [];
  if (RD().pve !== 0) for (const n of S.npcs) {
    const why = npcTrigger(n, player);
    if (why) {
      n.lastWhy = why;
      acts.push(n);
    }
  }
  acts.sort((a, b) => cheb(b, player) - cheb(a, player));
  if (!acts.length) log(_T('Phase 1 · Resolve: no beasts stir.'));else log(_T`Phase 1 · Resolve: ${acts.map(n => nm(n) + ` <span class="why">(${{
    aggro: 'aggro',
    opportunist: _T('lashes out in reach'),
    adjacent: _T('within reach'),
    zone: 'zone',
    scan: 'scan'
  }[n.lastWhy]})</span>`).join(', ')} ${acts.length > 1 ? _T('activate') : _T('activates')}.`);
  for (const n of acts) {
    if (!player.alive || S.over || G !== S) break;
    await npcAct(n, player, n.lastWhy === 'opportunist');
  }
  player.warded = false;
  if (!player.alive || G !== S) return;
  // tamed allies
  for (const n of S.npcs.filter(n => n.alive && n.tamedBy === player.id)) {
    if (!player.alive || G !== S) break;
    if (player.cpu) await cpuCommand(player, n);else await humanCommand(player, n);
  }
  await lyreControl(player);
  // idle base NPCs drift home
  for (const n of S.npcs) {
    if (!n.alive || !n.home || acts.includes(n) || n.aggro != null || n.tamedBy != null || n.lyred != null) continue;
    if (n.r === n.home[0] && n.c === n.home[1]) continue;
    if (S.players.some(other => other.alive && !other.exited && !other.underground && inRect(n.zone, other))) continue;
    await npcWalk(n, [n.home, ...adjTiles({
      r: n.home[0],
      c: n.home[1]
    })].filter(([r, c]) => !npcBlock(n)(r, c)).slice(0, 1), npcStats(n).mv);
  }
}

/* ================= CARDS & ITEMS ================= */
// Mandata Flavi: tests are checked synchronously; rewards are queued and paid at the next safe point.
function checkMandata(player) {
  if (!player || !player.alive || !S) return;
  for (const it of [...player.items]) if (it.kind === 'mf') {
    const M = MANDATA[it.idx];
    if (M.test && M.test(player)) {
      player.items = player.items.filter(x => x !== it);
      (S.mfQ || (S.mfQ = [])).push({
        p: player,
        idx: it.idx
      });
    }
  }
}
/* flushMF — pays every queued Mandata Flavi reward, in order. */
async function flushMF() {
  while (S && S.mfQ && S.mfQ.length) {
    const {
      p,
      idx
    } = S.mfQ.shift();
    await payMandata(p, idx);
  }
}
/* payMandata — reveals a completed Mandata Flavi (log, card, crowd reaction) and runs its reward. */
async function payMandata(player, idx) {
  const M = MANDATA[idx];
  stat(player, 'mfRevealed');
  crowdReact('mf', {
    p: player
  });
  fx(player.r, player.c, _T('Mandata Flavi!'), '#f0cf7d', {
    big: 1
  });
  log(_T`${nm(player)} reveals a Mandata Flavi: <b>${M.n}</b>. ${M.d} Reward: ${M.r}.`, 'big');
  cardShow('m:' + idx, player, _T('📜 Revealed'));
  if (/applause/.test(M.r)) log(_T('The crowd offers a generous applause.'));
  await M.reward(player);
  paint('render');
}
/* declareMandata — for a Mandatum that is declared instead of tested: removes it, announces it and pays the reward. Returns false if it cannot be declared. */
async function declareMandata(player, it) {
  const M = MANDATA[it.idx];
  if (!M.declare) return false;
  player.items = player.items.filter(x => x !== it);
  log(_T`${nm(player)} faces the crowd: “${M.declare}”`, 'big');
  think(player, `“${M.declare}”`, 'say');
  await payMandata(player, it.idx);
  return true;
}
/* mfLimbSwap — Limb Justice reward: swap a severed-limb weapon for any weapon left in the level 1-3 market (slots or deck); CPUs take the highest-scoring one. */
async function mfLimbSwap(player) {
  const pool = [];
  for (const lv of [1, 2, 3]) {
    const m = S.market.w[lv];
    for (const k of [...m.slots.filter(Boolean), ...m.deck]) pool.push({
      k,
      lv
    });
  }
  if (!pool.length) {
    log(_T('The market has no weapons left to trade for.'));
    return;
  }
  let pick;
  if (player.cpu) pick = pool.sort((a, b) => wScore(W[b.k]) - wScore(W[a.k]))[0];else {
    const i = await askW(player, 'limbSwap', _T('Limb Justice'), `<p>${_T`Trade a severed limb weapon for any remaining weapon in the market.`}</p>`, pool.map((x, i) => ({
      label: W[x.k].n,
      sub: _T`LV${x.lv} · ${wStats(mkW(x.k))}`,
      value: i,
      card: 'w:' + x.k
    })));
    pick = pool[i ?? 0];
  }
  const m = S.market.w[pick.lv];
  const si = m.slots.indexOf(pick.k);
  if (si >= 0) m.slots[si] = m.deck.pop() || null;else m.deck.splice(m.deck.indexOf(pick.k), 1);
  const arm = ['R', 'L'].find(a => player['w' + a] && player['w' + a].limb);
  if (arm) {
    log(_T`${nm(player)} hands over the ${player['w' + arm].n}.`);
    player['w' + arm] = null;
  }
  await gainWeapon(player, pick.k);
}
/* mfClaimArmor — removes an armor piece from the market (used by Mandata rewards). */
function mfClaimArmor(player, key) {
  if (marketPullArmor(key)) log(_T`${ARM[key].n} is taken from the market.`);
}
/* drawArena — draws the top arena card and resolves it; logs if the deck is empty. */
async function drawArena(player) {
  if (!S.deck.length) {
    log(_T('The arena deck is empty.'));
    return;
  }
  const k = S.deck.pop();
  stat(player, 'cardsDrawn');
  await resolveDrawn(player, k);
}
/* resolveDrawn — applies a drawn arena card. v1.01: the effects live in 328-v101fx's table (fx101Drawn: Piacula, armor loss, coin, spawns, rule cards…; anything else goes to the hand). TWEAK: the rows there. */
async function resolveDrawn(player, k) {
  return fx101Drawn(player, k);
}
/* pickNPC — asks the player to choose a beast matching filter (CPU takes the closest); null if none or cancelled. */
async function pickNPC(player, title, filter, note = '') {
  const c = S.npcs.filter(filter);
  if (!c.length) {
    if (!player.cpu) await askW(player, 'npcNone', title, `<p>${_T`There is no valid NPC in the arena.`}</p>`, [{
      label: 'OK',
      value: 1
    }]);
    return null;
  }
  if (player.cpu) return c.sort((a, b) => cheb(player, a) - cheb(player, b))[0];
  const id = await askW(player, 'npcPick', title, `<p>${note}</p>`, c.map(n => ({
    label: `${typeof npcTokHTML === 'function' ? `<span class="tok99">${npcTokHTML(n, 30)}</span>` : ''}${n.name} (${NPCT[n.t].n})`, /* v0.99: the beast's token round beside its name */
    sub: _T`${tl(n.r, n.c)} · ${n.hp} HP${n.tamedBy != null ? _T(' · tamed by ') + S.players[n.tamedBy].name : ''}`,
    value: n.id
  })).concat([{
    label: _T('Cancel'),
    value: null
  }]));
  return c.find(n => n.id === id) || null;
}
/* ammoWeapons — the player's held weapons that use ammo. */
const ammoWeapons = player => ['R', 'L'].map(a => player['w' + a]).filter(weapon => weapon && weapon.ammo != null);
/* useItem — plays an item from hand (Mandata, offerings, declare-type arena cards); returns true when the item is used up. v1.01: the effects live in 328-v101fx's table (fx101Use: one row per card / offering, families + bespoke handlers). */
async function useItem(player, it) {
  return fx101Use(player, it);
}

/* ================= ZORA CARRYING ================= */
/* zoraPickOptions — what Zora can snatch on his tile (floor offerings/keys/weapons, pile weapons/armor, the Arena Chest), each with a value score. TWEAK: values (offering/key 4, chest 6). */
function zoraPickOptions(npc) {
  if (npc.t !== 'zora' || npc.carry) return [];
  const out = [];
  for (const f of S.floor) if (f.r === npc.r && f.c === npc.c && (f.kind === 'offer' || f.kind === 'key' || f.kind === 'weapon')) out.push({
    src: 'floor',
    f,
    label: f.kind === 'weapon' ? f.w.n : f.kind === 'key' ? _T('Arena Key') : OFFER[f.key].n + ' (' + OFFER[f.key].s + ')',
    val: f.kind === 'weapon' ? wScore(f.w) : 4
  });
  for (const pl of pilesAt(npc.r, npc.c)) {
    pl.weapons.forEach((weapon, i) => out.push({
      src: 'pw',
      pl,
      i,
      label: weapon.n + ' from ' + pl.name,
      val: wScore(weapon)
    }));
    pl.armor.forEach((a, i) => out.push({
      src: 'pa',
      pl,
      i,
      label: a.n + ' from ' + pl.name,
      val: a.ap
    }));
  }
  if (S.chest && S.chest.held == null && S.chest.r === npc.r && S.chest.c === npc.c) out.push({
    src: 'chest',
    label: _T('the Arena Chest'),
    val: 6
  });
  return out;
}
/* zoraPickup — Zora takes the chosen thing into his carry slot, removing it from the floor or pile (or holding the chest). */
function zoraPickup(npc, o) {
  if (o.src === 'floor') {
    S.floor = S.floor.filter(x => x !== o.f);
    npc.carry = o.f.kind === 'weapon' ? {
      kind: 'weapon',
      w: o.f.w,
      label: o.label
    } : {
      kind: o.f.kind,
      key: o.f.key,
      label: o.label
    };
  }
  if (o.src === 'pw') {
    const w = o.pl.weapons.splice(o.i, 1)[0];
    npc.carry = {
      kind: 'weapon',
      w,
      label: w.n
    };
  }
  if (o.src === 'pa') {
    const a = o.pl.armor.splice(o.i, 1)[0];
    npc.carry = {
      kind: 'armor',
      a,
      label: a.n
    };
  }
  if (o.src === 'chest') {
    S.chest.held = npc.id;
    npc.carry = {
      kind: 'chest',
      label: _T('the Arena Chest')
    };
  }
  log(_T`${nm(npc)} snatches up ${npc.carry.label}. His movement is halved while carrying.`);
}
/* zoraDrop — Zora drops what he carries: handed to his owner if adjacent, otherwise left on his tile (armor as a small pile, weapons on the floor). */
async function zoraDrop(npc, player) {
  const c = npc.carry;
  if (!c) return;
  npc.carry = null;
  const toOwner = player && player.alive && cheb(npc, player) <= 1;
  if (c.kind === 'chest') {
    S.chest.held = null;
    S.chest.r = toOwner ? player.r : npc.r;
    S.chest.c = toOwner ? player.c : npc.c;
    log(toOwner ? _T`${nm(npc)} drops the Arena Chest at ${player.name}'s feet.` : _T`${nm(npc)} drops the Arena Chest on ${tl(npc.r, npc.c)}.`);
    return;
  }
  if (toOwner) {
    log(_T`${nm(npc)} delivers ${c.label} to ${nm(player)}.`);
    if (c.kind === 'offer') player.items.push(mkOffer(c.key));else if (c.kind === 'key') player.keys++;else if (c.kind === 'weapon') await gainWeapon(player, null, c.w);else if (c.kind === 'armor') await gainArmorPiece(player, c.a.key, c.a.ap, {
      single: true
    });
    return;
  }
  if (c.kind === 'armor') {
    const pl = {
      id: uid++,
      owner: player ? player.id : -1,
      color: '#a0784a',
      name: 'Zora',
      r: npc.r,
      c: npc.c,
      corpse: false,
      weapons: [],
      armor: [c.a],
      coin: 0,
      items: []
    };
    S.piles.push(pl);
  } else if (c.kind === 'weapon') S.floor.push({
    id: uid++,
    kind: 'weapon',
    w: c.w,
    r: npc.r,
    c: npc.c,
    thrown: -1
  });else placeFloor(c.kind, c.key, npc.r, npc.c);
  log(_T`${nm(npc)} drops ${c.label} on ${tl(npc.r, npc.c)}.`);
  await pickupAt(npc.r, npc.c);
}
/* cpuZora — CPU orders for Zora: deliver carried loot, else grab the best item here and bring it, else fetch the nearest floor item in reach. Returns false if there was nothing to do. TWEAK: minimum item value worth grabbing (3). */
async function cpuZora(player, npc) {
  const st = npcStats(npc);
  if (npc.carry) {
    await npcWalk(npc, adjTiles(player).concat([[player.r, player.c]]), st.mv);
    if (cheb(npc, player) <= 1) await zoraDrop(npc, player);
    return true;
  }
  const here = zoraPickOptions(npc).sort((a, b) => b.val - a.val)[0];
  if (here && here.val >= 3) {
    zoraPickup(npc, here);
    await npcWalk(npc, adjTiles(player), npcStats(npc).mv);
    if (cheb(npc, player) <= 1) await zoraDrop(npc, player);
    return true;
  }
  const items = S.floor.filter(f => (f.kind === 'offer' || f.kind === 'key' || f.kind === 'weapon' && f.thrown !== S.turnNo) && cheb(npc, f) <= st.mv && !unitAt(f.r, f.c));
  if (items.length) {
    const f = items.sort((a, b) => cheb(npc, a) - cheb(npc, b))[0];
    await npcWalk(npc, [[f.r, f.c]], st.mv);
    const o = zoraPickOptions(npc)[0];
    if (o) zoraPickup(npc, o);
    return true;
  }
  return false;
}
