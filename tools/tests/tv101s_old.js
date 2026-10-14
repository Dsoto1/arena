/* tv101s fixture: the card/offering dispatch EXACTLY as it was before 328-v101fx (04-rules resolveDrawn/useItem, 03-engine revealOffering
   bases + the 64/129 resolveDrawn and 133/179/199 useItem wrappers, copied verbatim, renamed OLD101_*). Loaded into the page by tv101s. */
async function OLD101_rdBase(player, k) {
  const C = CARDS[k];
  cardShow('c:' + k, player, _T('🂠 Drawn'));
  /* reveal — logs the card reveal with the given log style. */
  const reveal = (cls = 'big') => log(_T`${nm(player)} reveals <b>${C.n}</b>: ${C.d}`, cls);
  if (C.cls) {
    // Piaculum
    const tgt = activePlayers().find(other => other.cls === C.cls);
    reveal('');
    if (!tgt) log(_T`No ${CLASSES[C.cls].name} is in the arena. The Piaculum is discarded.`);else if (tgt === player) {
      let tot = 0;
      for (const q of activePlayers()) if (q !== player) {
        const v = Math.min(2, q.coin);
        q.coin -= v;
        coinLog(q, -v, 'cards');
        tot += v;
      }
      player.coin += tot;
      coinLog(player, tot, 'cards');
      log(_T`Everyone pays the ${CLASSES[C.cls].name}: ${nm(player)} collects ${coinAmt87(tot)}.`);
    } else {
      const v = Math.min(2, player.coin);
      player.coin -= v;
      coinLog(player, -v, 'cards');
      tgt.coin += v;
      coinLog(tgt, v, 'cards');
      log(_T`${nm(player)} pays ${nm(tgt)} ${coinAmt87(v)}.`);
    }
    return;
  }
  if (C.loc) {
    reveal('bad');
    if (player.hp[C.loc] > 0 && (player.ap[C.loc] > 0 || player.pieces[C.loc].length)) {
      stripLoc(player, C.loc);
      log(_T`${nm(player)}'s ${LOCN[C.loc].toLowerCase()} armor falls away (0 AP).`);
    } else log(_T('There was no armor there to lose.'));
    return;
  }
  switch (k) {
    case 'wealth3':
    case 'wealth5':
      {
        const v = k === 'wealth3' ? 3 : 5;
        player.coin += v;
        coinLog(player, v, 'cards');
        log(_T`${nm(player)} draws <b>Wealth of Saturn</b>: ${coinAmt87('+'+(v))}.`);
        return;
      }
    case 'wpnR':
    case 'wpnL':
      {
        const a = k === 'wpnR' ? 'R' : 'L';
        const w = player['w' + a];
        reveal('bad');
        if (w && !w.lyre && !w.noAtk) {
          player['w' + a] = null;
          log(_T`${nm(player)}'s ${w.n} falls apart and is discarded.`, 'bad');
          think(player, pickOne([_T('Cheap Capuan steel!'), _T('Of course it breaks now.')]), 'angry');
        } else log(_T('Nothing in that hand to lose.'));
        return;
      }
    case 'fallsApart':
      reveal('bad');
      for (const l of LOCS) stripLoc(player, l);
      think(player, _T('All bad fortune is conquered by endurance.'), 'quote');
      return;
    case 'merc1':
    case 'merc2':
      player.mercBonus = (player.mercBonus || 0) + C.mv;
      log(_T`${nm(player)} draws <b>Speed of Mercury</b>: +${C.mv} movement this turn.`);
      return;
    case 'mercRound':
      player.mercRound = S.ri;
      log(_T`${nm(player)} draws <b>Speed of Mercury</b> (active): +1 movement for the rest of the round.`);
      return;
    case 'ursa':
    case 'brutum':
      {
        const n = S.npcs.find(n => (n.key || n.name) === C.bear);
        reveal();
        if (!n || !n.alive) {
          player.cf += 2;
          log(_T`${beastName(C.bear)} is gone: ${nm(player)} gains ${cfAmt87(2)} instead.`);
        } else {
          breakBond100(n);
          n.aggro = null;
          setAggro(n, player, 'card');
        }
        return;
      }
    case 'marm1':
    case 'marm2':
      reveal('');
      await chooseMarket(player, 'a', C.lv);
      return;
    case 'telonium':
      {
        const v = Math.min(4, player.coin);
        player.coin -= v;
        coinLog(player, -v, 'cards');
        log(_T`${nm(player)} draws <b>Flavius Telonium</b> and pays ${coinAmt87(v)} in tax.`, 'bad');
        return;
      }
    case 'fortuna':
      {
        player.cf += 2;
        player.coin += 2;
        coinLog(player, 2, 'cards');
        reveal();
        for (let i = 0; i < 2; i++) {
          const [r, c] = freeGrid();
          placeFloor('offer', drawOffer(), r, c);
          log(_T`An offering lands on ${tl(r, c)}.`);
        }
        if (S.deck.length) {
          log(_T`${nm(player)} draws another arena card.`);
          await drawArena(player);
        }
        return;
      }
    case 'lashings':
      reveal('bad');
      await hurt(player, 'chest', 2, {
        type: 'env'
      }, _T('Lashings'), {
        noShield: 1,
        direct: 1
      });
      player.forceEnd = true;
      return;
    case 'spikes':
      reveal();
      await raiseSpikes();
      return;
    case 'telemachus':
      S.active.telemachus = 1;
      reveal();
      await popRule('telemachus');
      return;
    case 'restless':
      S.active.restless = 4;
      reveal();
      await popRule('restless');
      return;
    case 'endgame':
      S.endgame = 1;
      reveal();
      banner(_T('Flavius Rule'), _T('4 hit dice · attackers choose the location'));
      log(_T('Flavius Rule is in play: every attack now rolls 4 hit dice and the attacker chooses the hit location.'), 'hd');
      await popRule('endgame');
      return;
    case 'boar':
      S.active.boar = {
        left: activePlayers().length
      };
      reveal();
      await popRule('boar');
      return;
    case 'spawnLeo':
    case 'spawnLeaena':
      reveal();
      spawnNPC('lion', k === 'spawnLeo' ? _T('Leo') : _T('Leaena'));
      paint('draw');
      await beat('resolveDrawn', 400);
      return;
    case 'spawnTholo':
      reveal();
      spawnNPC('tholo', _T('Tholo'), S.ri < 2 ? [6, 6] : null);
      paint('draw');
      await beat('resolveDrawn', 400);
      return;
    case 'spawnCommodus':
      reveal();
      await spawnCommodus();
      paint('draw');
      await beat('resolveDrawn', 400);
      return;
  }
  if (String(k).startsWith('pair_') && typeof pairCardPlay === 'function') {
    reveal();
    await pairCardPlay(player, k);
    paint('draw');
    await beat('resolveDrawn', 400);
    return;
  }
  player.items.push(mkCard(k));
  log(_T`${nm(player)} draws <b>${C.n}</b> (${C.type}) and keeps it in hand.`);
}
async function OLD101_useBase(player, it) {
  // returns true when the item is consumed
  if (it.kind === 'mf') return declareMandata(player, it);
  if (it.kind === 'offer') {
    const k = it.key;
    if (k === 'elix2' || k === 'elix4') await distributeHP(player, k === 'elix2' ? 2 : 4, _T('a Health Elixir'));else if (k === 'ap2' || k === 'ap3') {
      if (!(await apUp(player, k === 'ap2' ? 2 : 3))) return false;
    } else if (k[0] === 'm' && k[1] === 'w') {
      const lv = +k[2];
      const key = await marketRoll(player, 'w', lv, {
        free: 1
      });
      await gainWeapon(player, key);
    } else if (k[0] === 'm' && k[1] === 'a') {
      const lv = +k[2];
      const key = await marketRoll(player, 'a', lv, {
        free: 1
      });
      if (key) await gainArmorPiece(player, key);
    } else if (k === 'merc1' || k === 'merc2') {
      const v = k === 'merc1' ? 1 : 2;
      player.mv = Math.min(7, player.mv + v);
      log(_T`${nm(player)} declares Speed of Mercury: +${v} movement.`);
    } else if (k === 'eagle') {
      /* v0.99 (his rule): a no-CF round only stops SPENDING Crowd Favor — trading the Eagle to the crowd still earns it */
      player.cf += 5;
      log(_T`${nm(player)} trades the Golden Eagle to the crowd for ${cfAmt87(5)}. It respawns atop a pillar.`);
      const pl = pickOne(S.pillars);
      if (pl) pl.pots.push('eagle');
    } else return false;
    player.items = player.items.filter(x => x !== it);
    return true;
  }
  if (it.kind !== 'card') return false;
  const k = it.key,
    C = CARDS[k];
  let ok = true;
  switch (k) {
    case 'elixir4':
    case 'elixir2':
      await distributeHP(player, C.hp, _T('a Health Elixir'));
      break;
    case 'hygeia':
      {
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
        break;
      }
    case 'ward':
      player.warded = true;
      log(_T`${nm(player)} declares the Ward of the Evil Eye.`);
      break;
    case 'rete':
      S.mode = 'rete';
      S.reteItem = it.id;
      return false;
    case 'lure':
      {
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
        break;
      }
    case 'lyre':
    case 'tame':
      {
        const n = await pickNPC(player, C.n, n => tameable(n) && n.tamedBy !== player.id, _T('Choose the beast to tame. Fazed beasts cannot be tamed.'));
        if (!n) return false;
        if (n.tamedBy != null) log(_T`${nm(player)} steals ${n.name} from ${S.players[n.tamedBy].name}!`, 'big');
        n.tamedBy = player.id;
        n.aggro = null;
        stat(player, 'tame');
        log(_T`${nm(player)} tames ${nm(n)}. It obeys from their next Resolve phase.`, 'big');
        break;
      }
    case 'focus':
      player.focusNext = true;
      log(_T`${nm(player)} declares Focus! for their next attack.`);
      break;
    case 'forge3':
    case 'forge2':
      if (!(await apUp(player, C.ap))) return false;
      break;
    case 'hercules1':
    case 'hercules2':
      player.hercules = (player.hercules || 0) + C.dmg;
      log(_T`${nm(player)} declares Herculean Vigor: +${C.dmg} damage if their next attack lands.`);
      break;
    case 'discount':
      player.discount = (player.discount || 0) + 2;
      log(_T`${nm(player)} declares % Off: market items cost 2 less this turn.`);
      break;
    case 'mchoice':
      player.mchoice = true;
      log(_T`${nm(player)} declares Choose: market purchases this turn are chosen, not rolled.`);
      break;
    case 'ammo':
      {
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
          break;
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
        break;
      }
    case 'zora':
      if (!spawnZora(player)) return false;
      break;
    case 'omnia1':
    case 'omnia2':
    case 'fidelis':
    case 'minerva':
    case 'elixirSave':
      if (!player.cpu) await askW(player, 'cardReaction', C.n, `<p>${_T`This card is played as a reaction. You will be asked when an attack is rolled against you or by you.`}</p>`, [{
        label: 'OK',
        value: 1
      }]);
      return false;
    default:
      ok = false;
  }
  if (ok) {
    player.items = player.items.filter(x => x !== it);
    cardShow('c:' + k, player, _T('📣 Declared'));
    stat(player, 'cardsPlayed');
  }
  return ok;
}
async function OLD101_revealBase(player, off, land) {
  const O = OFFER[off];
  if (off === 'spiders') {
    log(_T`Spiders pour out onto ${nm(player)}!`, 'bad');
    if (typeof hitFlash === 'function') hitFlash(player.r, player.c, 'spiders');
    if (!HEADLESS && !S.sim) await beat('revealOffering', 900);
    for (const l of ['larm', 'rarm', 'rleg', 'lleg']) if (player.alive && player.hp[l] > 0) await hurt(player, l, 1, {
      type: 'env'
    }, _T('Spiders bite'), {
      noShield: 1,
      noCards: 1
    });
    return;
  }
  if (off === 'curse') {
    const r = d6(),
      l = rollLoc(player);
    log(_T`A Curse Tablet! ${nm(player)} rolls ${r}.`, 'bad');
    await hurt(player, l, r, {
      type: 'env'
    }, _T('The curse strikes'), {
      noShield: 1,
      noCards: 1
    });
    return;
  }
  if (off === 'cf1' || off === 'cf2') {
    const v = off === 'cf1' ? 1 : 2;
    if (weak(player, 'noBlessCF')) {
      log(_T`The crowd cheers, but ${nm(player)} gains no CF from Blessings.`);
    } else {
      player.cf += v;
      log(_T`${nm(player)} gains ${cfAmt87(v)} from the crowd.`);
    }
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
let OLD101_rd1,OLD101_rd,OLD101_u1,OLD101_u2,OLD101_use;
{const baseDrawn=OLD101_rdBase;OLD101_rd1=async function(player,k){const C=CARDS[k];if(!C||!C.cls)return baseDrawn.apply(this,arguments);
  const id=C.cls;const L=piaLabel(id);cardShow('c:'+k,player,_T('🂠 Drawn'));log(_T`${nm(player)} reveals <b>${C.n}</b>: ${C.d}`);
  const tgt=activePlayers().find(q=>piaIdentity(q)===id);
  if(!tgt){log(_T`No ${esc(L.name)} is in the arena. The Piaculum is discarded.`);return}
  if(tgt===player){let tot=0;for(const q of activePlayers())if(q!==player){const v=Math.min(2,q.coin);q.coin-=v;coinLog(q,-v,'cards');tot+=v}player.coin+=tot;coinLog(player,tot,'cards');log(_T`Everyone pays the ${esc(L.name)}: ${nm(player)} collects ${coinAmt87(tot)}.`)}
  else{const v=Math.min(2,player.coin);player.coin-=v;coinLog(player,-v,'cards');tgt.coin+=v;coinLog(tgt,v,'cards');log(_T`${nm(player)} pays ${nm(tgt)} ${coinAmt87(v)}.`)}}}
{const base=OLD101_rd1;OLD101_rd=async function(player,k){if(typeof k==='string'&&k.startsWith('spawn_cn_')){const C=CARDS[k];const t='cn_'+k.slice(9);
    cardShow('c:'+k,player,_T('🂠 Drawn'));if(!C||!NPCT[t]){log(_T`${nm(player)} draws a beast card for a beast that is no longer in the pens.`);return}
    log(_T`${nm(player)} reveals <b>${esc(C.n)}</b>: ${esc(C.d)}`,'big');spawnNPC(t,C.n,null);draw();await sleep(400);return}
  return base.apply(this,arguments)}}
{const base=OLD101_useBase;OLD101_u1=async function(player,it){if(it&&it.kind==='offer'&&(it.key==='cf1'||it.key==='cf2')){
    /* v0.99: a no-CF round blocks spending only; the offering still earns */
    const v=it.key==='cf1'?1:2;cfWhy('offerings');player.cf+=v;log(_T`${nm(player)} offers to the crowd: <b>${cfAmt87('+'+(v))}</b>.`);player.items=player.items.filter(x=>x!==it);return true}
  return base.apply(this,arguments)}}
{const base=OLD101_u1;OLD101_u2=async function(player,it){if(!it||it.kind!=='card'||it.key!=='mchoice')return base.apply(this,arguments);
  if(!armsAttached(player).length||!mchoiceHas89()){
    if(!player.cpu)await askW(player,'marketNone',CARDS.mchoice.n,`<p>${!armsAttached(player).length?_T('You have no arm left to hold a weapon.'):_T('No weapon is left in the market.')}</p>`,[{label:'OK',value:1}]);
    return false}
  player.items=player.items.filter(x=>x!==it);cardShow('c:mchoice',player,_T('📣 Declared'));stat(player,'cardsPlayed');
  log(_T`${nm(player)} declares Choose: a free weapon from the market.`);
  const r=await pick89(player,[1,2,3],['w'],{title:_T('Choose · a free weapon')});if(r&&r.key)await gainWeapon(player,r.key);
  return true}}
{const base=OLD101_u2;OLD101_use=async function(player,it){
  const el=it&&((it.kind==='offer'&&(it.key==='elix2'||it.key==='elix4'))||(it.kind==='card'&&(it.key==='elixir2'||it.key==='elixir4')));
  if(el){const n=it.kind==='offer'?(it.key==='elix2'?2:4):(CARDS[it.key].hp|0);DIST91.cancel=true;let ok=false;try{ok=await distributeHP(player,n,_T('a Health Elixir'))}finally{DIST91.cancel=false}
    if(!ok)return false;player.items=player.items.filter(x=>x!==it);if(it.kind==='card'){cardShow('c:'+it.key,player,_T('📣 Declared'));stat(player,'cardsPlayed')}return true}
  const mk=it&&it.kind==='offer'&&/^m[wa][123]$/.test(it.key||'');
  if(mk){const kind=it.key[1],lv=+it.key[2];const key=await marketRoll(player,kind,lv,{free:1});if(!key)return false;
    if(kind==='w')await gainWeapon(player,key);else await gainArmorPiece(player,key);player.items=player.items.filter(x=>x!==it);return true}
  return base.apply(this,arguments)}}
