/* =====================================================================
   03-ENGINE · THE PHYSICAL ARENA
   =====================================================================
   The parts of the game that would hurt if they were real:
   - hurt(): every point of damage funnels through here. Order: shield (a CHOICE since
     v0.8 — the defender decides whether to spend a use), then AP, then HP; at 0 HP a
     location is severed (limbs drop as weapons) or the gladiator dies (head/chest/both arms).
   - eliminate(): builds the corpse pile, hands out the +10 CF trophy, breaks truces.
   - NPCs: mkNPC/spawnNPC/hurtNPC, behavior states (Initial/Raged/Fazed), gauntletChain.
   - The market rolls, chest opening, looting, pots (breakPot) and blessing draws.
   Rule of thumb: 04-rules decides WHAT happens in a phase; this file makes it TRUE on the board.
   ===================================================================== */
/* ================= STATE ================= */
let S = null,
  uid = 1;
let TW = 48,
  TH = 24,
  OX = 0,
  OY = 0,
  hoverTile = null,
  HL = new Map(),
  XRAY = 'auto';
/* mkW — makes a fresh weapon instance from its W entry, with live counters ammoLeft, usesLeft, atkLeft and throwsLeft. */
const mkW = k => {
  const d = W[k];
  return {
    ...d,
    key: k,
    ammoLeft: d.ammo ?? null,
    usesLeft: d.uses ?? null,
    atkLeft: d.atkUses ?? null,
    throwsLeft: d.throw ? d.throw.n : null
  };
};
/* mkCard — makes an arena-card inventory item with a unique id. */
const mkCard = k => ({
  id: uid++,
  kind: 'card',
  key: k
});
/* mkOffer — makes an offering inventory item with a unique id. */
const mkOffer = k => ({
  id: uid++,
  kind: 'offer',
  key: k
});
/* itemInfo — name, type line and description for any inventory item (arena card, Mandati Flavi or offering), used by tooltips and lists. */
function itemInfo(it) {
  if (it.kind === 'card') {
    const C = CARDS[it.key];
    return {
      n: C.n,
      t: 'Arena card · ' + C.type,
      d: C.d || ''
    };
  }
  if (it.kind === 'mf') {
    const M = MANDATA[it.idx];
    return {
      n: 'Mandati Flavi: ' + M.n,
      t: 'Secret objective' + (M.declare ? ' · declare on your turn' : ''),
      d: `${M.d} Reward: ${M.r}. Still hidden at the end: −5 CF.`
    };
  }
  const O = OFFER[it.key];
  return {
    n: O.n,
    t: 'Offering · ' + O.s,
    d: ''
  };
}
/* EV — the current event's definition from EVENTS. */
const EV = () => EVENTS[S.evKey];
/* RD — the current round's rules (zone, PvP/PvE/CF/CA flags, end condition, reward). */
const RD = () => EV().rounds[S.ri];
/* cur — the player whose turn it is. */
const cur = () => S.players[S.cur];
/* nm — a player's or NPC's name as bold HTML in their color, for the log. */
const nm = u => u.cls ? `<b style="color:${u.color}">${u.name}</b>` : `<b style="color:${NPCT[u.t].col}">${u.name}</b>`;
/* pillarAt — the pillar on tile (r,c), if any. */
const pillarAt = (r, c) => S.pillars.find(player => player.r === r && player.c === c);
/* spikeAt — true if a raised floor spike is on tile (r,c). */
const spikeAt = (r, c) => S.spikes.some(s => s.r === r && s.c === c);
/* tunnelAt — the tunnel entrance on tile (r,c), if any. */
const tunnelAt = (r, c) => S.tunnels.find(target => target.r === r && target.c === c);
/* playerAt — the living, still-present player on tile (r,c), if any. */
const playerAt = (r, c) => S.players.find(player => player.alive && !player.exited && player.r === r && player.c === c);
/* npcAt — the living NPC on tile (r,c), if any. */
const npcAt = (r, c) => S.npcs.find(n => n.alive && n.r === r && n.c === c);
/* unitAt — the player or NPC on tile (r,c), if any. */
const unitAt = (r, c) => playerAt(r, c) || npcAt(r, c);
/* armLoc — maps a hand letter ('R' / 'L') to its arm location ('rarm' / 'larm'). */
const armLoc = a => a === 'R' ? 'rarm' : 'larm';
/* armAlive — true if that hand's arm still has HP. */
const armAlive = (player, a) => player.hp[armLoc(a)] > 0;
/* armsAttached — the hand letters ('R', 'L') whose arms are still attached. */
const armsAttached = player => ['R', 'L'].filter(a => armAlive(player, a));
/* legs — how many legs (0-2) the player still has. */
const legs = player => (player.hp.rleg > 0) + (player.hp.lleg > 0);
/* allLimbs — true if the player still has all four limbs. */
const allLimbs = player => player.hp.larm > 0 && player.hp.rarm > 0 && player.hp.rleg > 0 && player.hp.lleg > 0;
/* hasPiece — true if any armor piece worn at a location has the given ARM flag (e.g. 'cestus'). */
const hasPiece = (player, location, flag) => player.pieces[location].some(pc => ARM[pc.key][flag]);
/* hasCestus — true if that hand's arm wears a Cestus (lets punches hurt through armor). */
const hasCestus = (player, arm) => hasPiece(player, armLoc(arm), 'cestus');
/* greavesOn — true if both legs wear greaves (+1 movement). */
const greavesOn = player => hasPiece(player, 'rleg', 'greaves') && hasPiece(player, 'lleg', 'greaves');
/* mvMax — a player's movement for the turn: 1 + one per leg, +1 with both greaves, -1 while carrying the chest, +1 in a Speed of Mercury round, capped 0-7. TWEAK: the base 1, the bonuses and the 7 cap. */
function mvMax(player) {
  let m = 1 + legs(player);
  if (greavesOn(player)) m++;
  if (player.carrying) m--;
  if (S && player.mercRound === S.ri) m++;
  return clamp(m, 0, 7);
}
/* inZone — true if (r,c) is inside the current round's shrinking zone (ZONES). */
const inZone = (r, c) => {
  const [a, b] = ZONES[RD().zone];
  return r >= a && r <= b && c >= a && c <= b;
};
/* inRect — true if unit u stands inside rectangle z = [rowMin, rowMax, colMin, colMax]. */
const inRect = (z, u) => u.r >= z[0] && u.r <= z[1] && u.c >= z[2] && u.c <= z[3];
/* activePlayers — players still alive and not exited. */
const activePlayers = () => S.players.filter(player => player.alive && !player.exited);
/* friendly — true if two players are on the same team. */
const friendly = (player, other) => player.team === other.team;
/* commodusIn — true while an untamed Commodus is alive in the arena. */
const commodusIn = () => S.npcs.some(n => n.alive && n.t === 'commodus' && !n.tamedBy);
/* cfAllowed — true if gladiators may earn CF this round (the round's CF flag, and no live Commodus). */
const cfAllowed = () => RD().cf && !commodusIn();
/* caAllowed — true if class abilities work this round (the round's CA flag). */
const caAllowed = () => RD().ca;
/* truceKey — order-independent key 'a-b' for a pair of player ids, used in S.truces. */
const truceKey = (a, b) => a < b ? a + '-' + b : b + '-' + a;
/* inTruce — true if two players have a truce. */
const inTruce = (player, other) => S.truces.has(truceKey(player.id, other.id));
/* canHarmPlayer — true if player may damage other: other must be alive, present, above ground and not a teammate, and the round must allow PvP (or the harm comes via an NPC). */
function canHarmPlayer(player, other, viaNpc = false) {
  if (!other || other === player || !other.alive || other.exited || other.underground) return false;
  if (friendly(player, other)) return false;
  return viaNpc || RD().pvp;
}
/* stat — adds an amount (the misnamed 'victim' param, default 1) to player.stats[k]; these counters feed Mandati checks and results screens. */
function stat(player, k, victim = 1) {
  if (player && player.stats) player.stats[k] = (player.stats[k] || 0) + victim;
}
/* log — prepends an HTML line to the game log (keeps the newest 400), records it in S.logLines, and echoes it as a caption on CPU turns or for 'big' lines. TWEAK: the 400 line limit. */
function log(html, cls = '') {
  if (HEADLESS) return;
  const li = document.createElement('li');
  li.innerHTML = html;
  if (cls) li.className = cls;
  const ol = $('#log');
  ol.prepend(li);
  while (ol.children.length > 400) ol.lastChild.remove();
  if (S && S.logLines) S.logLines.push({
    turn: S.turnNo,
    cls,
    text: li.textContent
  });
  if (S && S.players && cur() && cur().cpu || cls === 'big') caption(html);
}
let capTimer = null;
/* caption — shows a short on-board caption: keeps 3 lines on Slow (2 otherwise) and clears after 5s on Slow (2.5s otherwise). TWEAK: the line counts and timings. */
function caption(html) {
  if (HEADLESS) return;
  const el = $('#caption');
  const d = document.createElement('div');
  d.innerHTML = html;
  el.prepend(d);
  while (el.children.length > (SPEED === 'slow' ? 3 : 2)) el.lastChild.remove();
  clearTimeout(capTimer);
  capTimer = setTimeout(() => {
    el.innerHTML = '';
  }, SPEED === 'slow' ? 5000 : 2500);
}

/* ---------- pathing & sight ---------- */
/* dijkstra — shortest paths on the 13x13 grid from (sr,sc) in 8 directions; blocked tiles are skipped and a diagonal step costs 2 unless fly (then everything costs 1 and nothing blocks). Returns dist and prev arrays indexed r*N+c. TWEAK: the diagonal cost of 2. */
function dijkstra(sr, sc, blocked, fly = false) {
  const INF = 1e9,
    dist = new Array(N * N).fill(INF),
    prev = new Array(N * N).fill(-1);
  dist[sr * N + sc] = 0;
  const pq = [[0, sr, sc]];
  while (pq.length) {
    let bi = 0;
    for (let i = 1; i < pq.length; i++) if (pq[i][0] < pq[bi][0]) bi = i;
    const [d, r, c] = pq.splice(bi, 1)[0];
    if (d > dist[r * N + c]) continue;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr,
        nc = c + dc;
      if (!inB(nr, nc) || !fly && blocked(nr, nc)) continue;
      const nd = d + (dr && dc ? fly ? 1 : 2 : 1),
        k = nr * N + nc;
      if (nd < dist[k]) {
        dist[k] = nd;
        prev[k] = r * N + c;
        pq.push([nd, nr, nc]);
      }
    }
  }
  return {
    dist,
    prev
  };
}
/* pathTo — rebuilds the tile-index path from start sk to goal gk using dijkstra's prev array; null if unreachable. */
function pathTo(prev, sk, gk) {
  const path = [];
  let k = gk;
  while (k !== sk && k !== -1) {
    path.unshift(k);
    k = prev[k];
  }
  return k === sk ? path : null;
}
/* playerBlock — blocking test for player movement: pillars and any other unit. */
const playerBlock = self => (r, c) => !!pillarAt(r, c) || !!unitAt(r, c) && unitAt(r, c) !== self;
/* npcBlock — blocking test for NPC movement: pillars, spikes, tunnels and any other unit. */
const npcBlock = self => (r, c) => !!pillarAt(r, c) || spikeAt(r, c) || !!tunnelAt(r, c) || !!unitAt(r, c) && unitAt(r, c) !== self;
/* blocksLOS — true if a tile blocks line of sight (pillar, spike or any unit). */
function blocksLOS(r, c) {
  return !!pillarAt(r, c) || spikeAt(r, c) || !!unitAt(r, c);
}
/* los — line of sight from a to b along a Bresenham line; any blocking tile strictly between them blocks it (endpoints do not). */
function los(a, b) {
  let x0 = a.c,
    y0 = a.r;
  const x1 = b.c,
    y1 = b.r;
  const dx = Math.abs(x1 - x0),
    dy = -Math.abs(y1 - y0),
    sx = x0 < x1 ? 1 : -1,
    sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let g = 0; g < 40; g++) {
    if (x0 === x1 && y0 === y1) return true;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
    if (x0 === x1 && y0 === y1) return true;
    if (blocksLOS(y0, x0)) return false;
  }
  return true;
}
/* rollLoc — rolls a d6 hit location on HIT_LOC, re-rolling locations already at 0 HP (up to 30 tries, then chest). */
function rollLoc(player) {
  for (let i = 0; i < 30; i++) {
    const l = HIT_LOC[d6()];
    if (player.hp[l] > 0) return l;
  }
  return 'chest';
} // ASSUMPTION: severed locations re-rolled
/* gridRoll — rolls a random board tile with the grid dice, skipping row/col 6 (the center lines). */
function gridRoll() {
  const idx = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12];
  return [pickOne(idx), pickOne(idx)];
}
/* freeGrid — grid-rolls up to 80 times for a tile with no pillar, unit or spike; falls back to the center (6,6). */
function freeGrid() {
  for (let i = 0; i < 80; i++) {
    const [r, c] = gridRoll();
    if (!pillarAt(r, c) && !unitAt(r, c) && !spikeAt(r, c)) return [r, c];
  }
  return [6, 6];
}
/* adjTiles — the up-to-8 on-board tiles surrounding a unit. */
function adjTiles(target) {
  const g = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const r = target.r + dr,
      c = target.c + dc;
    if ((dr || dc) && inB(r, c)) g.push([r, c]);
  }
  return g;
}

/* ================= ARMOR ================= */
// the piece already occupying the same equip point in the same layer (regular vs stackable), if any
// one padded (stackable) piece per body location, and one regular piece per equip point
function armorConflict(player, location, key) {
  const d = ARM[key];
  return player.pieces[location].find(pc => {
    const e = ARM[pc.key];
    return d.stack ? !!e.stack : !e.stack && e.pt === d.pt;
  }) || null;
}
/* equipPiece — puts an armor piece on a location if it is alive and the equip point is free: adds its AP (cap 7) plus any bonus AP to other living locations, remembering how much bonus actually landed. TWEAK: the 7 AP cap. */
function equipPiece(player, key, location, apOverride) {
  const d = ARM[key];
  if (!d || player.hp[location] <= 0) return false;
  if (armorConflict(player, location, key)) return false;
  const piece = {
    id: uid++,
    key,
    n: d.n,
    ap: apOverride ?? d.ap,
    bonus: {}
  };
  player.pieces[location].push(piece);
  player.ap[location] = Math.min(7, player.ap[location] + piece.ap);
  if (d.bonus) for (const [bl, amt] of Object.entries(d.bonus)) if (player.hp[bl] > 0) {
    const b = player.ap[bl];
    player.ap[bl] = Math.min(7, b + amt);
    piece.bonus[bl] = player.ap[bl] - b;
  }
  return true;
}
/* unequipPiece — removes one piece and its bonus AP; returns it carrying the AP it still had (never more than the location's current AP). */
function unequipPiece(player, location, pc) {
  // returns the piece with the AP it still carries
  const i = player.pieces[location].indexOf(pc);
  if (i < 0) return null;
  player.pieces[location].splice(i, 1);
  for (const [bl, amt] of Object.entries(pc.bonus || {})) player.ap[bl] = Math.max(0, player.ap[bl] - amt);
  const left = Math.min(pc.ap, player.ap[location]);
  player.ap[location] = Math.max(0, player.ap[location] - pc.ap);
  return {
    key: pc.key,
    n: pc.n,
    ap: left,
    from: location
  };
}
/* stripLoc — removes every piece at a location (and their bonus AP elsewhere, clearing that location's pieces if its AP hits 0) and sets its AP to 0; returns the removed pieces. toPile is unused. */
function stripLoc(player, location, toPile = false) {
  for (const pc of player.pieces[location]) {
    for (const [bl, amt] of Object.entries(pc.bonus)) {
      player.ap[bl] = Math.max(0, player.ap[bl] - amt);
      if (player.ap[bl] === 0 && bl !== location && player.pieces[bl].length) player.pieces[bl] = [];
    }
  }
  const removed = player.pieces[location];
  player.pieces[location] = [];
  player.ap[location] = 0;
  return removed;
}
/* sideLocs — the body locations an armor piece can go on (head, chest, both arms or both legs). */
const sideLocs = d => d.slot === 'head' || d.slot === 'chest' ? [d.slot] : d.slot === 'arm' ? ['rarm', 'larm'] : ['rleg', 'lleg'];
/* chooseArmorLoc — decides where a piece goes: a pair covers every living side; a CPU (or a single option) takes a free side with the lowest AP; otherwise a human chooses. */
async function chooseArmorLoc(player, key, title, single = false) {
  const d = ARM[key];
  const opts = sideLocs(d).filter(l => player.hp[l] > 0);
  if (!opts.length) return [];
  if (d.pair && !single) return opts;
  if (opts.length === 1 || player.cpu) {
    const free = opts.filter(l => !armorConflict(player, l, key));
    return [(free.length ? free : opts).sort((a, b) => player.ap[a] - player.ap[b])[0]];
  }
  const v = await modal(title || `Equip ${d.n}`, `<p>${d.n}: ${d.ap} AP on the ${PT_NAME[d.pt]} equip point${d.stack ? ' (stackable)' : ''}${d.bonus ? ' · bonus ' + Object.entries(d.bonus).map(([l, a]) => `+${a} ${LOCN[l]}`).join(', ') : ''}. Choose a side.</p>`, opts.map(l => {
    const c = armorConflict(player, l, key);
    return {
      label: LOCN[l],
      sub: `AP ${player.ap[l]} → ${Math.min(7, player.ap[l] + d.ap - (c ? Math.min(c.ap, player.ap[l]) : 0))}${c ? ' · replaces ' + c.n : ''}`,
      value: l
    };
  }), {
    card: 'a:' + key
  });
  return v ? [v] : [];
}
/* gainArmorPiece — gives a player an armor piece: chooses the side(s), and if the equip point is taken a CPU swaps when the new AP+bonus beats the old, a human chooses; old or unwearable pieces drop into the player's pile. */
async function gainArmorPiece(player, key, apOverride, {
  single = false
} = {}) {
  const d = ARM[key];
  const locs = await chooseArmorLoc(player, key, null, single);
  if (!locs.length) {
    log(`${nm(player)} has nowhere to wear the ${d.n}.`);
    pileFor(player).armor.push({
      key,
      n: d.n,
      ap: apOverride ?? d.ap,
      from: 'drop'
    });
    return;
  }
  const put = [];
  for (const l of locs) {
    const c = armorConflict(player, l, key);
    if (c) {
      // same equip point already taken in this layer: swap or keep
      let swap;
      if (player.cpu) swap = (apOverride ?? d.ap) + (d.bonus ? Object.values(d.bonus).reduce((a, b) => a + b, 0) : 0) > Math.min(c.ap, player.ap[l]) + (ARM[c.key].bonus ? 1 : 0);else swap = await modal(`${LOCN[l]}: equip point taken`, `<p>Your ${LOCN[l].toLowerCase()} already wears <b>${c.n}</b> (${Math.min(c.ap, player.ap[l])} AP) on the ${PT_NAME[d.pt]} point. Only one ${d.stack ? 'stackable' : 'regular'} armor fits there${d.stack ? '' : '; stackable padding and belts can sit beneath it'}.</p>`, [{
        label: `Swap in ${d.n}`,
        sub: `${apOverride ?? d.ap} AP · the old piece drops at your feet`,
        value: 1,
        primary: 1
      }, {
        label: `Keep ${c.n}`,
        value: 0
      }], {
        card: 'a:' + key
      });
      if (!swap) continue;
      const old = unequipPiece(player, l, c);
      if (old && old.ap > 0) pileFor(player).armor.push(old);
    }
    if (equipPiece(player, key, l, apOverride)) put.push(l);
  }
  if (put.length) log(`${nm(player)} equips <b>${d.n}</b> on ${put.map(l => LOCN[l]).join(' and ')}.`);else {
    log(`${nm(player)} leaves the ${d.n} at their feet.`);
    pileFor(player).armor.push({
      key,
      n: d.n,
      ap: apOverride ?? d.ap,
      from: 'drop'
    });
  }
}

/* ================= HP / AP DISTRIBUTION ================= */
/* cpuHealPlan — how a CPU spreads n HP: first raises head/chest, then arms, then legs back to BASE_HP (most-hurt ratio first), then up to 7. TWEAK: the tier order and the 7 cap. */
function cpuHealPlan(player, n) {
  const plan = {};
  LOCS.forEach(l => plan[l] = 0);
  const tiers = [['head', 'chest'], ['rarm', 'larm'], ['rleg', 'lleg']];
  const val = l => player.hp[l] + plan[l];
  for (const cap of ['base', 'max']) for (const tier of tiers) {
    for (; n > 0;) {
      const c = tier.filter(l => player.hp[l] > 0 && val(l) < (cap === 'base' ? BASE_HP[l] : 7)).sort((a, b) => val(a) / BASE_HP[a] - val(b) / BASE_HP[b]);
      if (!c.length) break;
      plan[c[0]]++;
      n--;
    }
  }
  return plan;
}
/* distributeHP — heals n HP over locations below 7 (CPU plan or a human dialog), capped at 7 per location. */
async function distributeHP(player, n, why = 'Health Elixir') {
  const locs = LOCS.filter(l => player.hp[l] > 0 && player.hp[l] < 7);
  if (!locs.length) {
    log(`${nm(player)} is already at full health.`);
    return;
  }
  let plan;
  if (player.cpu) plan = cpuHealPlan(player, n);else plan = await distModal(player, n, why, 'hp');
  const parts = [];
  for (const l of LOCS) if (plan[l]) {
    player.hp[l] = Math.min(7, player.hp[l] + plan[l]);
    parts.push(`${LOCN[l]} +${plan[l]}`);
  }
  {
    const tot = LOCS.reduce((s, l) => s + (plan[l] || 0), 0);
    if (tot) fx(player.r, player.c, `+${tot} HP`, '#7fe07a');
  }
  log(`${nm(player)} uses ${why}: ${parts.join(', ') || 'nothing'}.`);
}
/* distributeAP — adds n AP over living locations below 7; a CPU puts each point on its lowest-AP location (HEAL_ORDER breaks ties), a human uses the dialog. Cap 7. */
async function distributeAP(player, n, why) {
  const locs = LOCS.filter(l => player.hp[l] > 0 && player.ap[l] < 7);
  if (!locs.length) return;
  let plan;
  if (player.cpu) {
    plan = {};
    LOCS.forEach(l => plan[l] = 0);
    for (let i = 0; i < n; i++) {
      const c = locs.filter(l => player.ap[l] + plan[l] < 7).sort((a, b) => player.ap[a] + plan[a] - (player.ap[b] + plan[b]) || HEAL_ORDER.indexOf(a) - HEAL_ORDER.indexOf(b));
      if (!c.length) break;
      plan[c[0]]++;
    }
  } else plan = await distModal(player, n, why, 'ap');
  const parts = [];
  for (const l of LOCS) if (plan[l]) {
    player.ap[l] = Math.min(7, player.ap[l] + plan[l]);
    parts.push(`${LOCN[l]} +${plan[l]} AP`);
  }
  log(`${nm(player)} gains ${why}: ${parts.join(', ')}.`);
}
/* apUp — adds n AP to ONE location that already has armor (cap 7); returns false if there is none or the human cancels. */
async function apUp(player, n) {
  const locs = LOCS.filter(l => player.hp[l] > 0 && player.ap[l] > 0 && player.ap[l] < 7);
  if (!locs.length) {
    if (!player.cpu) await modal('No armored location', '<p>AP upgrades only apply to a location that already has armor.</p>', [{
      label: 'OK',
      value: 1
    }]);
    return false;
  }
  const loc = player.cpu ? locs.sort((a, b) => player.ap[a] - player.ap[b] || HEAL_ORDER.indexOf(a) - HEAL_ORDER.indexOf(b))[0] : await modal(`AP Upgrade (+${n})`, '<p>Choose one armored location. A location can never exceed 7 AP.</p>', locs.map(l => ({
    label: LOCN[l],
    sub: `AP ${player.ap[l]} → ${Math.min(7, player.ap[l] + n)}`,
    value: l
  })).concat([{
    label: 'Cancel',
    value: null
  }]));
  if (!loc) return false;
  player.ap[loc] = Math.min(7, player.ap[loc] + n);
  log(`${nm(player)} reinforces ${LOCN[loc]} to ${player.ap[loc]} AP.`);
  return true;
}

/* ================= DROPS, PILES, FLOOR ================= */
/* pileFor — finds or creates the player's drop pile (not a corpse) on their current tile. */
function pileFor(player) {
  let pl = S.piles.find(x => x.owner === player.id && x.r === player.r && x.c === player.c && !x.corpse);
  if (!pl) {
    pl = {
      id: uid++,
      owner: player.id,
      color: player.color,
      name: player.name,
      r: player.r,
      c: player.c,
      corpse: false,
      weapons: [],
      armor: [],
      coin: 0,
      items: []
    };
    S.piles.push(pl);
  }
  return pl;
}
/* pileEmpty — true if a pile holds no weapons, armor, coin or items. */
const pileEmpty = pillar => !pillar.weapons.length && !pillar.armor.length && !pillar.coin && !pillar.items.length;
/* pilesAt — non-empty piles on tile (r,c). */
const pilesAt = (r, c) => S.piles.filter(pillar => pillar.r === r && pillar.c === c && !pileEmpty(pillar));
/* dropWeapon — puts a weapon into the player's pile at their feet. */
function dropWeapon(player, weapon) {
  if (!weapon) return;
  pileFor(player).weapons.push(weapon);
}
/* placeFloor — puts a floor object (offering, key, eagle...) on tile (r,c). */
function placeFloor(kind, key, r, c, extra = {}) {
  S.floor.push({
    id: uid++,
    kind,
    key,
    r,
    c,
    ...extra
  });
}
/* pickupAt — the player on (r,c) picks up offerings, keys and (in Golden Eagle) an eagle; the first eagle lifted sets a random capture tile. */
async function pickupAt(r, c) {
  const p = playerAt(r, c);
  if (!p) return;
  const here = S.floor.filter(f => f.r === r && f.c === c && (f.kind === 'offer' || f.kind === 'key' || f.kind === 'eagle'));
  for (const f of here) {
    if (f.kind === 'eagle') {
      if (S.evKey !== 'goldenEagle') continue;
      if (p.eagle) continue;
      S.floor = S.floor.filter(x => x !== f);
      p.eagle = 1;
      if (!S.capture) {
        const [cr, cc] = freeGrid();
        S.capture = {
          r: cr,
          c: cc
        };
        log(`${nm(p)} lifts a Golden Eagle! The grid dice set its capture tile at <b>${tl(cr, cc)}</b>.`, 'big');
      } else log(`${nm(p)} grabs the Golden Eagle. Capture tile: ${tl(S.capture.r, S.capture.c)}.`, 'big');
      continue;
    }
    S.floor = S.floor.filter(x => x !== f);
    if (f.key === 'key') {
      p.keys++;
      log(`${nm(p)} picks up an Arena Key.`);
      continue;
    }
    p.items.push(mkOffer(f.key));
    log(`${nm(p)} picks up <b>${OFFER[f.key].n}</b> (${OFFER[f.key].s}).`);
  }
  await checkEagleScore(p);
}
/* checkEagleScore — Golden Eagle: if the current player carries an eagle onto the capture tile, their team scores, and a new eagle appears at the center; 3 captures lets the team exit. TWEAK: the 3. */
async function checkEagleScore(player) {
  if (S.evKey !== 'goldenEagle' || !player.eagle || !S.capture) return;
  if (player.r === S.capture.r && player.c === S.capture.c && S.players[S.cur] === player) {
    player.eagle = 0;
    S.capture = null;
    S.teamPts[player.team] = (S.teamPts[player.team] || 0) + 1;
    stat(player, 'eagles');
    placeFloor('eagle', 'eagle', 6, 6);
    log(`${nm(player)} captures the Golden Eagle! Team ${player.team}: ${S.teamPts[player.team]} of 3.`, 'big');
    if (S.teamPts[player.team] >= 3) log(`Team ${player.team} may now exit through their starting tiles.`, 'big');
  }
}

/* ================= OFFERINGS & POTS ================= */
/* revealOffering — resolves a revealed offering: spiders bite each limb for 1, a curse deals d6 to a random location, cf1/cf2 give CF (not to noBlessCF), anything else lands on the land tile (or the player's tile if a pillar) and is picked up. */
async function revealOffering(player, off, land) {
  const O = OFFER[off];
  if (off === 'spiders') {
    log(`Spiders pour out onto ${nm(player)}!`, 'bad');
    if (typeof hitFlash === 'function') hitFlash(player.r, player.c, 'spiders');
    if (!HEADLESS && !S.sim) await sleep(900);
    for (const l of ['larm', 'rarm', 'rleg', 'lleg']) if (player.alive && player.hp[l] > 0) await hurt(player, l, 1, {
      type: 'env'
    }, 'Spiders bite', {
      noShield: 1,
      noCards: 1
    });
    return;
  }
  if (off === 'curse') {
    const r = d6(),
      l = rollLoc(player);
    log(`A Curse Tablet! ${nm(player)} rolls ${r}.`, 'bad');
    await hurt(player, l, r, {
      type: 'env'
    }, 'The curse strikes', {
      noShield: 1,
      noCards: 1
    });
    return;
  }
  if (off === 'cf1' || off === 'cf2') {
    const v = off === 'cf1' ? 1 : 2;
    if (weak(player, 'noBlessCF')) {
      log(`The crowd cheers, but ${nm(player)} gains no CF from Blessings.`);
    } else {
      player.cf += v;
      log(`${nm(player)} gains ${v} CF from the crowd.`);
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
  log(`An offering spills onto ${tl(r, c)}: <b>${O.n}</b> (${O.s}).`);
  await pickupAt(r, c);
}
/* breakPot — breaks one pot (or all) on a pillar: each gives +2 coin, +1 CF (none for noBlessCF) and reveals its offering. TWEAK: the 2 coin and 1 CF. */
async function breakPot(pillar, player, land, all = false) {
  const n = all ? pillar.pots.length : 1;
  for (let i = 0; i < n && pillar.pots.length; i++) {
    const off = pillar.pots.pop();
    player.coin += 2;
    coinLog(player, 2, 'breaking pots');
    const cfGain = weak(player, 'noBlessCF') ? 0 : 1;
    cfWhy('breaking pots');
    player.cf += cfGain;
    stat(player, 'pots');
    fx(pillar.r, pillar.c, '', '', {
      img: 'blessing',
      dur: 1700
    });
    fx(pillar.r, pillar.c, `+2c${cfGain ? ' +1 CF' : ''}`, '#f0cf7d');
    crowdReact && crowdReact('pot', {
      p: player
    });
    log(`${nm(player)} shatters a Blessings pot on ${tl(pillar.r, pillar.c)}: +2 coin${cfGain ? ', +1 CF' : ''}.${pillar.pots.length ? ` ${pillar.pots.length} more pot${pillar.pots.length > 1 ? 's' : ''} still chained above.` : ''}`);
    await revealOffering(player, off, land);
    if (!player.alive) break;
  }
}

/* ================= DAMAGE ================= */
/* isDead — true if head or chest is at 0 HP, or both arms are. */
function isDead(victim) {
  return victim.hp.head <= 0 || victim.hp.chest <= 0 || victim.hp.larm <= 0 && victim.hp.rarm <= 0;
}
/* askCard — offers to play one of the given cards from the player's hand; a CPU plays it if cpuWants agrees and a roll passes (hard always, normal 75%, easy 50%). Returns the played key or null. TWEAK: the .75 / .5 odds. */
async function askCard(player, keys, title, text, cpuWants) {
  keys = [].concat(keys);
  const it = keys.map(k => player.items.find(x => x.kind === 'card' && x.key === k)).find(Boolean);
  if (!it) return null;
  let use;
  if (player.cpu) use = (player.diff === 'hard' || rand() < (player.diff === 'easy' ? .5 : .75)) && cpuWants(it.key);else use = await modal(title, `<p>${text}</p>`, [{
    label: `Play ${CARDS[it.key].n}`,
    sub: CARDS[it.key].d,
    value: 1,
    primary: 1,
    card: 'c:' + it.key
  }, {
    label: 'Keep it',
    value: 0
  }]);
  if (use) {
    player.items = player.items.filter(x => x !== it);
    log(`${nm(player)} plays <b>${CARDS[it.key].n}</b>!`, 'big');
    cardShow('c:' + it.key, player, '📣 Declared');
    return it.key;
  }
  return null;
}
/* bloodAt — adds a cosmetic blood splat (Math.random, never the seeded dice); keeps the newest 160. TWEAK: the 160. */
function bloodAt(r, c, kind) {
  if (!S || HEADLESS) return;
  (S.blood = S.blood || []).push({
    r,
    c,
    kind,
    seed: 1 + Math.floor(Math.random() * 99999)
  }); /* cosmetic: never draws from the seeded dice */
  if (S.blood.length > 160) S.blood.splice(0, S.blood.length - 160);
}
/* hurt — applies damage to one player location in order: optional shield (a choice; CPU easy 80% / normal 95%, hard judges it), then AP (fists glance off armor without a Cestus; direct skips AP), then HP. At 0 HP an Elixir may save it; otherwise an arm drops its weapon (and the chest) and becomes a severed-arm weapon, a leg becomes a severed-leg weapon, and lethal damage calls eliminate. TWEAK: the CPU shield odds. */
async function hurt(victim, location, damage, source, prefix, {
  noShield = false,
  noCards = false,
  direct = false
} = {}) {
  if (!victim.alive || victim.exited) return;
  if (damage > 0 && S) S.lastDmgRot = S.rotation;
  let rem = damage;
  const parts = [];
  if (rem > 0 && !noShield) {
    // a shield absorbs its stated value per use and spends a use; raising it is a CHOICE, not a reflex.
    // The remainder falls on armor, then flesh, as usual (10 in, absorb 3 → 7 continues to AP/HP).
    const sh = ['L', 'R'].map(a => ({
      a,
      w: victim['w' + a]
    })).filter(x => x.w && x.w.shield && x.w.usesLeft > 0 && armAlive(victim, x.a)).sort((x, y) => y.w.absorb - x.w.absorb)[0];
    if (sh) {
      const w = sh.w;
      const ab = Math.min(rem, w.absorb);
      let use;
      if (victim.cpu) use = victim.diff === 'hard' ? ab >= 2 || victim.ap[location] + victim.hp[location] - rem <= 1 || w.usesLeft >= 3 : rand() < (victim.diff === 'easy' ? .8 : .95); // hard lanistae save uses on chip damage when they can afford to
      else use = await modal(`Raise the ${w.n}?`, `<p>${esc(prefix || 'An attack')} brings <b>${rem} damage</b> at your ${LOCN[location].toLowerCase()}. The ${w.n} can absorb <b>${ab}</b> of it; the rest falls on armor, then flesh.</p>${typeof hint === 'function' ? hint('shield') : ''}`, [{
        label: `Absorb ${ab} damage`,
        sub: `${w.usesLeft - 1 === 0 ? 'this use BREAKS the shield' : `${w.usesLeft - 1} use${w.usesLeft - 1 === 1 ? '' : 's'} left after`}`,
        value: 1,
        primary: 1,
        card: 'w:' + w.key
      }, {
        label: 'Save the shield',
        sub: 'take the full hit on armor and flesh',
        value: 0
      }]);
      if (use) {
        rem -= ab;
        w.usesLeft--;
        parts.push(`${w.n} absorbs ${ab}`);
        fx(victim.r, victim.c, `blocked ${ab}`, '#9fd3ff');
        if (w.usesLeft <= 0) {
          victim['w' + sh.a] = null;
          parts.push(`${w.n} breaks`);
        }
      } else if (!victim.cpu) parts.push(`keeps the ${w.n} lowered`);
    }
  }
  if (rem > 0 && source.punch && victim.ap[location] > 0 && !source.cestus) {
    parts.push('the fist glances off armor');
    rem = 0;
  }
  if (rem > 0 && victim.ap[location] > 0 && !direct) {
    const t = Math.min(rem, victim.ap[location]);
    victim.ap[location] -= t;
    rem -= t;
    parts.push(`−${t} AP`);
    fx(victim.r, victim.c, `−${t} AP`, '#c9d2da');
    if (victim.ap[location] === 0) {
      stripLoc(victim, location);
      parts.push('armor destroyed');
    }
  }
  if (rem > 0) {
    victim.hp[location] -= rem;
    stat(victim, 'dmgTaken', rem);
    parts.push(`−${rem} HP`);
    fx(victim.r, victim.c, `−${rem}`, '#ff5a44', {
      big: rem >= 4
    });
    if (rem >= 6) shake();
    if (victim.hp[location] <= 0 && !noCards) {
      if (location !== 'head' && location !== 'chest') bloodAt(victim.r, victim.c, 'limb');
      const lethal = location === 'head' || location === 'chest' || victim.hp[location === 'rarm' ? 'larm' : 'rarm'] <= 0 && (location === 'rarm' || location === 'larm');
      log(`${prefix} → ${nm(victim)} ${LOCN[location]}: ${parts.join(', ')}`, 'bad');
      parts.length = 0;
      const need = 1 - victim.hp[location];
      const saved = await askCard(victim, need <= 2 ? ['elixir2', 'elixir4'] : ['elixir4', 'elixir2'], `${LOCN[location]} at ${victim.hp[location]} HP`, `${victim.name}'s ${LOCN[location].toLowerCase()} has dropped to ${victim.hp[location]} HP${lethal ? ' and this would eliminate them' : ' and the limb will be severed'}. Play a Health Elixir to restore it to 1 HP and distribute the rest?`, k => lethal || victim.diff === 'hard' || pers(victim).survival > 65 && CARDS[k].hp >= need);
      if (saved && CARDS[saved].hp >= need) {
        victim.hp[location] = 1;
        const rest = Math.max(0, CARDS[saved].hp - need);
        if (rest) await distributeHP(victim, rest, 'the rest of the Health Elixir');
        parts.push('saved by a Health Elixir');
      } else if (saved) {
        victim.hp[location] += CARDS[saved].hp;
        parts.push('the Health Elixir is not enough');
      }
    }
    if (victim.hp[location] <= 0) {
      if (location === 'larm' || location === 'rarm') {
        const a = location === 'rarm' ? 'R' : 'L';
        const w = victim['w' + a];
        if (w) {
          parts.push(`drops ${w.n}`);
          dropWeapon(victim, w);
        }
        victim['w' + a] = null;
        stripLoc(victim, location);
        pileFor(victim).weapons.push({
          ...mkW('severedArm'),
          from: victim.id,
          n: `Severed Arm (${victim.name})`
        });
        parts.push(`<b>${LOCN[location]} severed</b>`);
        if (victim.carrying) {
          victim.carrying = false;
          S.chest = {
            ...S.chest,
            r: victim.r,
            c: victim.c,
            held: null
          };
          parts.push('drops the chest');
        }
        if (source.type === 'player') stat(source.p, 'sever');
        if (source.type === 'npc' && source.owner) stat(source.owner, 'sever');
      } else if (location === 'rleg' || location === 'lleg') {
        stripLoc(victim, location);
        pileFor(victim).weapons.push({
          ...mkW('severedLeg'),
          from: victim.id,
          n: `Severed Leg (${victim.name})`
        });
        parts.push(`<b>${LOCN[location]} severed</b>`);
        victim.mv = Math.min(victim.mv, mvMax(victim));
        if (source.type === 'player') stat(source.p, 'sever');
      }
    }
  }
  if (parts.length) log(`${prefix} → ${nm(victim)} ${locIcon(location)}${LOCN[location]}: ${parts.join(', ')}`, rem > 0 ? 'bad' : '');
  if (damage > 0 && victim.cls && !source.spect) crowdReact('hit', {
    att: source.p || (source.n && source.n.tamedBy != null ? S.players[source.n.tamedBy] : source.n) || null,
    def: victim,
    dmg: damage
  });
  if (isDead(victim)) eliminate(victim, source);
}
/* addTrophy — gives a killer the trophy's coin and CF and records it in player.trophies. */
function addTrophy(player, name, kind, coin, cf, pk = 'npc') {
  player.coin += coin;
  coinLog(player, coin, pk === 'player' ? 'gladiator trophies' : 'beast trophies');
  cfWhy(pk === 'player' ? 'gladiator trophies' : 'beast trophies');
  player.cf += cf;
  fx(player.r, player.c, `+${cf} CF`, '#f0cf7d', {
    big: 1
  });
  player.trophies.push({
    name,
    kind,
    coin,
    cf,
    pk,
    round: S.ri + 1
  });
}
/* eliminate — removes a player: builds a lootable corpse pile (weapons, remaining armor AP, coin, items and earlier drops), frees their tamed beasts and aggro, drops eagle/chest, ends truces, lowers friends' relationship with the killer. A gladiator kill gives +10 CF and a trophy; death by a wild beast costs -5 CF (Tholo hoards the coin). TWEAK: the +10, -5, and the -30 relationship hit (for friends at 25+). */
function eliminate(victim, source) {
  if (!victim.alive) return;
  victim.alive = false;
  if (source.type !== 'retire') bloodAt(victim.r, victim.c, 'elim');
  /* v0.57: no laurels mid-match — the crowd throws them only after the closing horns */
  S.elims++;
  fx(victim.r, victim.c, source.type === 'retire' ? 'RETIRED' : 'ELIMINATED', '#ff3b2f', {
    big: 1,
    dur: 2200
  });
  shake();
  // corpse pile holds everything lootable
  const pl = {
    id: uid++,
    owner: victim.id,
    color: victim.color,
    name: victim.name,
    cls: victim.cls,
    sev: {
      rarm: victim.hp.rarm <= 0 ? 1 : 0,
      larm: victim.hp.larm <= 0 ? 1 : 0,
      rleg: victim.hp.rleg <= 0 ? 1 : 0,
      lleg: victim.hp.lleg <= 0 ? 1 : 0
    },
    r: victim.r,
    c: victim.c,
    corpse: true,
    retiredOut: source.type === 'retire',
    weapons: [],
    armor: [],
    coin: victim.coin,
    items: victim.items.filter(i => i.kind !== 'mf')
  };
  for (const a of ['R', 'L']) if (victim['w' + a]) pl.weapons.push(victim['w' + a]);
  for (const l of LOCS) {
    let left = victim.ap[l];
    for (const pc of victim.pieces[l]) {
      const ap = Math.min(pc.ap, left);
      left -= ap;
      if (ap > 0) pl.armor.push({
        key: pc.key,
        n: pc.n,
        ap,
        from: l
      });
    }
  }
  // fold their earlier drops into the corpse
  for (const other of S.piles.filter(x => x.owner === victim.id && !x.corpse)) {
    pl.weapons.push(...other.weapons);
    pl.armor.push(...other.armor);
    pl.coin += other.coin;
    pl.items.push(...other.items);
    other.weapons = [];
    other.armor = [];
    other.coin = 0;
    other.items = [];
  }
  S.piles.push(pl);
  victim.coin = 0;
  victim.items = victim.items.filter(i => i.kind === 'mf');
  for (const n of S.npcs) {
    if (n.aggro === victim.id) n.aggro = null;
    if (n.tamedBy === victim.id) {
      if (n.t === 'zora') {
        n.alive = false;
        log(`Zora flies off with his fallen master.`);
      } else {
        n.tamedBy = null;
        log(`${nm(n)} is wild again.`);
      }
    }
  }
  if (victim.eagle) {
    victim.eagle = 0;
    placeFloor('eagle', 'eagle', victim.r, victim.c);
    log('The Golden Eagle falls to the sand.');
  }
  if (victim.carrying) {
    victim.carrying = false;
    S.chest.r = victim.r;
    S.chest.c = victim.c;
    S.chest.held = null;
  }
  for (const k of [...S.truces]) if (k.split('-').includes(String(victim.id))) S.truces.delete(k);
  const killer = source.type === 'player' ? source.p : source.type === 'npc' && source.n && source.n.tamedBy != null ? S.players[source.n.tamedBy] : null;
  if (killer && killer !== victim) for (const r of S.players) if (r !== killer && r !== victim && r.alive && relOf(r, victim) >= 25) bumpRel(r, killer, -30, `killed ${victim.name}`);
  (S.elimOrder || (S.elimOrder = [])).push({
    id: victim.id,
    turn: S.turnNo,
    rot: S.rotation,
    round: S.ri + 1,
    by: killer ? killer.name : source.type === 'npc' && source.n ? source.n.name : source.type === 'retire' ? 'retired' : source.type === 'env' ? 'the arena' : null
  });
  if (source.type === 'player' && source.p && source.p !== victim) {
    addTrophy(source.p, victim.name, 'Gladiator (' + CLASSES[victim.cls].name + ')', 0, 10, 'player');
    stat(source.p, 'kill_player');
    if (source.w) {
      if (source.w.limb) stat(source.p, 'kill_limb');
      if (source.w.lv === 1) stat(source.p, 'kill_l1');
    }
    think(source.p, pickOne(QUOTES.kill), 'win');
    if (!source.p.cpu) (S.killedClasses || (S.killedClasses = new Set())).add(victim.cls);
    log(`${nm(victim)} is eliminated by ${nm(source.p)} (+10 CF, trophy).`, 'big');
  } else if (source.type === 'npc') {
    if (source.n.tamedBy != null && S.players[source.n.tamedBy] && S.players[source.n.tamedBy] !== victim) {
      const o = S.players[source.n.tamedBy];
      addTrophy(o, victim.name, 'Gladiator (by ' + source.n.name + ')', 0, 10, 'player');
      stat(o, 'kill_player');
      log(`${nm(victim)} is slain by ${nm(source.n)}, tamed by ${nm(o)} (+10 CF, trophy).`, 'big');
    } else {
      cfWhy('slain by a beast');
      victim.cf -= 5;
      if (source.n.t === 'tholo') {
        source.n.hoard += pl.coin;
        pl.coin = 0;
      }
      log(`${nm(victim)} is slain by ${nm(source.n)} (−5 CF).`, 'big');
    }
  } else log(`${nm(victim)} is eliminated.`, 'big');
  if (S.exhib) log(`${nm(victim)} is <b>pulled from the sand</b> — exhibition rules: the doctors call it before anyone dies.`, 'thought');
  crowdReact('elim', {
    v: victim,
    killer: killer || (source.type === 'npc' ? source.n : null)
  });
  checkEnd();
}
/* npcStats — an NPC's current attack (ap), range, move and state label: behavior-state beasts use the NPCT states row matching their HP; tamed or stateless beasts use base values. Adds S.npcDmg (min 1); carrying halves move. */
function npcStats(npc) {
  const T = NPCT[npc.t];
  const dm = S && S.npcDmg || 0;
  if (!T.states || npc.tamedBy != null) {
    const mv = T.states ? T.states[0][3] : T.mv;
    return {
      ap: Math.max(1, (T.states ? T.states[0][1] : T.ap) + (npc.tamedBy != null ? 0 : dm)),
      rng: T.rng || 1,
      mv: npc.carry ? Math.floor(mv / 2) : mv,
      state: T.states ? 'Initial' : null
    };
  }
  const s = T.states.find(s => npc.hp >= s[0]) || T.states[T.states.length - 1];
  return {
    ap: Math.max(1, s[1] + dm),
    rng: s[2],
    mv: s[3],
    state: s[4]
  };
}
/* hurtNPC — damages a beast. On death: trophy (coin + hoard, CF) and stats for the killer, +12 relationship from the player it was hunting, Tholo drops the chest, Gauntlet chain check. Otherwise logs state changes, breaks the bond if you hit your own tame, and turns the beast's aggro on the attacker. TWEAK: the +12. */
function hurtNPC(npc, damage, player, prefix, weapon = null, byNpc = null) {
  if (!npc.alive) return;
  if (damage > 0) S.lastDmgRot = S.rotation;
  const before = npcStats(npc).state;
  npc.hp -= damage;
  if (damage > 0) fx(npc.r, npc.c, `−${damage}`, '#ff9a3c', {
    big: damage >= 6
  });
  if (damage >= 3 && npc.hp > 0) bloodAt(npc.r, npc.c, 'limb'); // v0.33: beasts bleed too — a heavy blow splashes the sand
  if (npc.hp <= 0) {
    fx(npc.r, npc.c, 'SLAIN', '#ffd27a', {
      big: 1,
      dur: 1800
    });
    crowdReact('beast', {
      p: player,
      n: npc
    });
    npc.alive = false;
    bloodAt(npc.r, npc.c, 'elim');
    S.npcKills++;
    npc.killedBy = player && player.cls ? player.name : byNpc ? byNpc.name : null;
    const T = NPCT[npc.t];
    let credit = player;
    if (player && player.cls) {
      addTrophy(player, npc.name, T.n, T.coin + npc.hoard, T.cf, 'npc');
      stat(player, 'kills_npc');
      stat(player, 'kill_' + npc.t);
      if (npc.tamedBy != null && npc.tamedBy !== player.id) stat(player, 'kill_tamed');
      if (weapon && weapon.limb) stat(player, 'kill_limb');
      log(`${prefix} → ${nm(npc)} falls! ${nm(player)} earns ${T.coin + npc.hoard} coin, ${T.cf} CF and a trophy.`, 'big');
    } else log(`${prefix} → ${nm(npc)} falls.`, 'big');
    if (player && player.cls && npc.aggro != null && npc.aggro !== player.id) {
      const saved = S.players[npc.aggro];
      if (saved && saved.alive) bumpRel(saved, player, 12, `slew ${npc.name}`);
    }
    if (npc.t === 'tholo' && S.chest && S.chest.held === npc.id) {
      S.chest.held = null;
      S.chest.r = npc.r;
      S.chest.c = npc.c;
      log(`Tholo drops the Arena Chest at ${tl(npc.r, npc.c)}.`);
    }
    if (npc.t === 'commodus') S.commodusDead = 1;
    if (npc.t === 'lion') S.lionDead = 1;
    gauntletChain();
  } else {
    const after = npcStats(npc).state;
    log(`${prefix} → ${nm(npc)} −${damage} HP (${npc.hp}/${NPCT[npc.t].hp} left).${after && after !== before ? ` <b>${npc.name} is now ${after}!</b>` : ''}`);
    if (after && after !== before && player && player.cls) think(player, after === 'Raged' ? pickOne(['It is only getting angrier.', 'Careful, it is raging now.']) : pickOne(['It staggers. Finish it!', 'Fazed! Now is the moment.']), 'think');
    if (player && player.cls) {
      if (npc.tamedBy === player.id) {
        npc.tamedBy = null;
        log(`${nm(player)} attacked their own tamed ${npc.name}. The bond breaks.`, 'bad');
      }
      /* v0.54: a tamed beast's attack does NOT steal aggro — only a player's own blow does */
      if (npc.tamedBy == null && !byNpc) setAggro(npc, player, 'attack');
    }
  }
  checkEnd();
}
/* gauntletChain — Gauntlet only: both starting snakes dead releases the lions, both wolves brings Commodus (unless removed), both bears unleashes Tholo at the center. */
function gauntletChain() {
  if (S.evKey !== 'gauntlet') return;
  /* dead — true if every starting NPC of that type is dead. */
  const dead = target => S.npcs.filter(n => n.t === target && n.base).every(n => !n.alive);
  if (!S.gSnake && dead('snake')) {
    S.gSnake = 1;
    log('Both snakes are dead. The lions are released!', 'big');
    spawnNPC('lion', 'Leo');
    spawnNPC('lion', 'Leaena');
  }
  if (!S.gWolf && dead('wolf')) {
    S.gWolf = 1;
    if (S.noCommodus) log('Both wolves are dead. Commodus has been removed from this Gauntlet.', 'big');else {
      log('Both wolves are dead. Commodus enters!', 'big');
      S.pendingCommodus = 1;
    }
  }
  if (!S.gBear && dead('bear')) {
    S.gBear = 1;
    log('Both bears are dead. Tholo is unleashed!', 'big');
    spawnNPC('tholo', 'Tholo', [6, 6]);
  }
}

/* ================= SPAWNS ================= */
/* mkNPC — builds an NPC object at (r,c) with HP scaled by S.npcHpMul and the city's local name (Tholo keeps its own). */
function mkNPC(target, name, r, c, extra = {}) {
  return {
    id: uid++,
    t: target,
    key: name,
    name: target === 'tholo' ? name : beastName(name),
    r,
    c,
    sr: r,
    sc: c,
    hp: Math.max(1, Math.round(NPCT[target].hp * (S && S.npcHpMul || 1))),
    alive: true,
    aggro: null,
    netted: false,
    hoard: 0,
    home: null,
    zone: null,
    tamedBy: null,
    base: false,
    ...extra
  };
}
/* v0.35 ONCE PER EVENT: the arena deck holds ONE Tholo, ONE Commodus and TWO lions (Leo, Leaena) —
   however they arrive (card, chant, Gauntlet chain, custom layout), each enters an event at most once. */
const UNIQUE_SPAWN = {
  Tholo: 1,
  Commodus: 1,
  Leo: 1,
  Leaena: 1
};
/* spawnKey — the once-per-event key (Tholo, Commodus, Leo, Leaena) for a spawn, or null if it may appear any number of times. */
const spawnKey = (target, name) => target === 'tholo' ? 'Tholo' : target === 'commodus' ? 'Commodus' : target === 'lion' && UNIQUE_SPAWN[name] ? name : null;
/* bossSpent — true if that unique beast has already entered this event. */
function bossSpent(key) {
  return !!(S && S.spawnedOnce && S.spawnedOnce[key]) || (S && S.npcs || []).some(n => spawnKey(n.t, n.key) === key);
}
/* spawnNPC — spawns a beast at the given tile (or a random free one), refusing a unique beast that already appeared. If it lands on a player it shifts to a free adjacent tile, aggros that player and deals 1 unavoidable head damage. TWEAK: the 1 head damage. */
function spawnNPC(target, name, at, extra = {}) {
  {
    const k9 = extra.tamedBy == null ? spawnKey(target, name) : null;
    if (k9) {
      if (bossSpent(k9)) {
        log(`${k9} has already entered this event — the pens stay shut.`);
        return null;
      }
      (S.spawnedOnce = S.spawnedOnce || {})[k9] = 1;
    }
  }
  if (['tholo', 'commodus', 'lion'].includes(target) && extra.tamedBy == null) later(() => crowdReact('boss', {
    n: name
  }), 0);
  let [r, c] = at && !npcAt(at[0], at[1]) && !pillarAt(at[0], at[1]) ? at : freeGrid();
  const n = mkNPC(target, name, r, c, extra);
  const p = playerAt(r, c);
  if (p) {
    const free = adjTiles(n).filter(([nr, nc]) => !pillarAt(nr, nc) && !unitAt(nr, nc));
    const f = free[0] || [r, c];
    n.r = f[0];
    n.c = f[1];
    n.sr = n.r;
    n.sc = n.c;
    if (n.tamedBy == null) {
      n.aggro = p.id;
      n.aggroWhy = 'spawn';
    }
    S.npcs.push(n);
    log(`${nm(n)} bursts into the arena at ${tl(n.r, n.c)}, on top of ${nm(p)}!`, 'big');
    p.hp.head -= 1;
    log(`${nm(p)} takes 1 unavoidable damage to the head.`, 'bad');
    if (isDead(p)) eliminate(p, {
      type: 'npc',
      n
    });
  } else {
    S.npcs.push(n);
    log(`${nm(n)} enters the arena at ${tl(n.r, n.c)}.`, 'big');
  }
  return n;
}
/* spawnCommodus — spawns Commodus (optional HP override) and hits every active gladiator for 2 on the location the group can best afford (highest weakest HP+AP). TWEAK: the 2 damage. */
async function spawnCommodus(hp) {
  const n = spawnNPC('commodus', 'Commodus', null);
  if (!n) return;
  if (hp) n.hp = hp;
  const act = activePlayers();
  /* score — the lowest HP+AP any active player has at location l (99 if severed). */
  const score = l => Math.min(...act.map(other => other.hp[l] > 0 ? other.hp[l] + other.ap[l] : 99));
  const loc = [...LOCS].sort((a, b) => score(b) - score(a))[0];
  log(`Commodus demands tribute: 2 damage to one body location every gladiator agrees on. They settle on the <b>${LOCN[loc]}</b>.`, 'big');
  for (const q of activePlayers()) {
    const l = q.hp[loc] > 0 ? loc : rollLoc(q);
    await hurt(q, l, 2, {
      type: 'npc',
      n
    }, 'Commodus\' entrance', {
      noShield: 1,
      noCards: 1
    });
  }
}
/* raiseSpikes — raises the four floor spikes at SPIKE_SPOTS (removing any pillar there) and deals 2 damage to whoever stands on them. TWEAK: the 2 damage. */
async function raiseSpikes() {
  if (S.spikes.length) {
    log('The floor spikes have already risen.');
    return;
  }
  S.spikes = SPIKE_SPOTS.map(([r, c]) => ({
    r,
    c
  }));
  log('Floor spikes rise from the sand at D, I, 4 and 9!', 'big');
  for (const s of S.spikes) {
    const pl = pillarAt(s.r, s.c);
    if (pl) S.pillars = S.pillars.filter(x => x !== pl);
    const p = playerAt(s.r, s.c);
    if (p) await hurt(p, rollLoc(p), 2, {
      type: 'env'
    }, 'Floor spike');
    const n = npcAt(s.r, s.c);
    if (n) hurtNPC(n, 2, null, 'Floor spike');
  }
}
/* spawnZora — lands the player's tamed eagle Zora on the first free adjacent tile; false if there is no room. */
function spawnZora(player) {
  const free = adjTiles(player).filter(([r, c]) => !pillarAt(r, c) && !unitAt(r, c));
  if (!free.length) {
    log('There is no room for Zora to land.');
    return false;
  }
  const [r, c] = free[0];
  const z = mkNPC('zora', 'Zora', r, c, {
    tamedBy: player.id
  });
  S.npcs.push(z);
  log(`${nm(player)} releases <b>Zora</b> the eagle at ${tl(r, c)}.`, 'big');
  return true;
}

/* ================= MARKET ================= */
/* marketPull — removes a weapon key from the market (a face-up slot is refilled from the deck), e.g. for class starting weapons. */
function marketPull(key) {
  // a gladiator starts with this card, so it leaves the market
  for (const lv of [1, 2, 3]) {
    const m = S.market.w[lv];
    const i = m.slots.indexOf(key);
    if (i >= 0) {
      m.slots[i] = m.deck.pop() || null;
      return;
    }
    const j = m.deck.indexOf(key);
    if (j >= 0) {
      m.deck.splice(j, 1);
      return;
    }
  }
}
/* marketPullArmor — removes an armor key from the market the same way; true if found. */
function marketPullArmor(key) {
  for (const lv of [1, 2, 3]) {
    const m = S.market.a[lv];
    const i = m.slots.indexOf(key);
    if (i >= 0) {
      m.slots[i] = m.deck.pop() || null;
      return true;
    }
    const j = m.deck.indexOf(key);
    if (j >= 0) {
      m.deck.splice(j, 1);
      return true;
    }
  }
  return false;
}
/* buildMarket — for each level, shuffles MARKET_W / MARKET_A into 3 face-up slots plus a face-down deck (slot 4 on the market die). */
function buildMarket() {
  const m = {
    w: {},
    a: {}
  };
  for (const lv of [1, 2, 3]) {
    const wd = shuffle([...MARKET_W[lv]]);
    m.w[lv] = {
      slots: [wd.pop(), wd.pop(), wd.pop()],
      deck: wd
    };
    const ad = shuffle([...MARKET_A[lv]]);
    m.a[lv] = {
      slots: [ad.pop(), ad.pop(), ad.pop()],
      deck: ad
    };
  }
  return m;
}
/* marketTake — takes the item in slot 1-3 (refilled from the deck) or the top deck card for slot 4; if empty, takes from the nearest filled slot. */
function marketTake(kind, lv, slot) {
  // slot 1-4
  const m = S.market[kind][lv];
  let key = null;
  if (slot <= 3 && m.slots[slot - 1]) {
    key = m.slots[slot - 1];
    m.slots[slot - 1] = m.deck.pop() || null;
  } else if (slot === 4 && m.deck.length) {
    key = m.deck.pop();
  } else {
    const order = [slot - 1, slot - 2, slot, slot - 3, slot + 1].filter(i => i >= 0 && i < 3);
    for (const i of order) if (m.slots[i]) {
      key = m.slots[i];
      m.slots[i] = m.deck.pop() || null;
      break;
    }
  }
  return key;
}
/* marketPeek — what a market slot shows: the key, 'face-down' for slot 4, or '(empty)'. */
function marketPeek(kind, lv, slot) {
  const m = S.market[kind][lv];
  if (slot <= 3) return m.slots[slot - 1] || '(empty)';
  return m.deck.length ? 'face-down' : '(empty)';
}
/* kName — display name for a market key, passing '(empty)' / 'face-down' through. */
const kName = (kind, k) => !k || k[0] === '(' || k === 'face-down' ? k : kind === 'w' ? W[k].n : ARM[k].n;
/* marketRoll — buys from the market: Market Choice picks a slot; otherwise rolls a d4 slot (empty → nearest), and the buyer may re-roll for 2 coin (hard CPUs re-roll half the time when the item is worth under lv*2). Returns the key. TWEAK: the 2-coin re-roll price and CPU re-roll rule. */
async function marketRoll(player, kind, lv, {
  free = false
} = {}) {
  // returns key
  let slot;
  if (player.mchoice && !free) {
    slot = player.cpu ? [1, 2, 3].sort((a, b) => itemValue(kind, S.market[kind][lv].slots[b - 1]) - itemValue(kind, S.market[kind][lv].slots[a - 1]))[0] : await modal('Choose', '<p>Pick the slot you want.</p>', [1, 2, 3, 4].map(s => ({
      label: `Slot ${s}: ${kName(kind, marketPeek(kind, lv, s))}`,
      value: s,
      card: kind === 'w' && s <= 3 && S.market.w[lv].slots[s - 1] ? 'w:' + S.market.w[lv].slots[s - 1] : null
    })));
    log(`${nm(player)} uses Market Choice for slot ${slot}.`);
    return marketTake(kind, lv, slot);
  }
  /* nearest — for an empty slot, returns the closest slot that still has something; ties are chosen by the buyer (CPU takes the better item). */
  const nearest = async slot => {
    // an empty slot: take from the closest slot that still has something; ties are the buyer's choice
    const m = S.market[kind][lv];
    const has = s => s <= 3 ? !!m.slots[s - 1] : m.deck.length > 0;
    if (has(slot)) return slot;
    const cands = [1, 2, 3, 4].filter(has);
    if (!cands.length) return slot;
    const dmin = Math.min(...cands.map(s => Math.abs(s - slot)));
    const near = cands.filter(s => Math.abs(s - slot) === dmin);
    if (near.length === 1) {
      log(`Slot ${slot} is empty; the closest is slot ${near[0]}.`);
      return near[0];
    }
    let pick;
    if (player.cpu) pick = near.sort((a, b) => itemValue(kind, b <= 3 ? m.slots[b - 1] : null) - itemValue(kind, a <= 3 ? m.slots[a - 1] : null))[0];else pick = await modal('Empty market slot', `<p>Slot ${slot} is empty. Slots ${near.join(' and ')} are equally close: choose one.</p>`, near.map(s => ({
      label: `Slot ${s}: ${kName(kind, marketPeek(kind, lv, s))}`,
      value: s,
      card: kind === 'w' && s <= 3 ? 'w:' + m.slots[s - 1] : null
    })));
    log(`Slot ${slot} is empty; ${nm(player)} takes from slot ${pick}.`);
    return pick || near[0];
  };
  for (;;) {
    slot = 1 + rnd(4);
    const peek = marketPeek(kind, lv, slot);
    log(`${nm(player)} rolls the market die: <b>${slot}</b> (${kName(kind, peek)}).`);
    if (peek === '(empty)') {
      slot = await nearest(slot);
    }
    if (free || player.coin < 2) return marketTake(kind, lv, slot);
    let reroll = false;
    if (player.cpu) reroll = player.diff === 'hard' && itemValue(kind, peek === 'face-down' ? null : S.market[kind][lv].slots[slot - 1]) < lv * 2 && player.coin >= 2 && rand() < .5;else reroll = await modal('Market die', `<p>The die shows <b>${slot}</b>: ${kName(kind, peek)}. Take it, or re-roll for 2 coin (you have ${player.coin}).</p>`, [{
      label: 'Take it',
      value: 0,
      primary: 1
    }, {
      label: 'Re-roll',
      sub: '2 coin',
      value: 1
    }]);
    if (!reroll) return marketTake(kind, lv, slot);
    player.coin -= 2;
    coinLog(player, -2, 'market re-rolls');
    log(`${nm(player)} pays 2 coin to re-roll.`);
  }
}
/* itemValue — CPU worth of a market item: unknown 2.5, weapons by wScore, armor = AP +1 bonus +1.5 pair +2 greaves +1 cestus. TWEAK: these weights. */
function itemValue(kind, k) {
  if (!k || k === 'face-down' || k[0] === '(') return 2.5;
  if (kind === 'w') {
    const w = W[k];
    return wScore(w);
  }
  const a = ARM[k];
  return a.ap + (a.bonus ? 1 : 0) + (a.pair ? 1.5 : 0) + (a.greaves ? 2 : 0) + (a.cestus ? 1 : 0);
}
/* wScore — CPU worth of a weapon: power x (1 + 0.4 per extra range) plus bonuses for shield, both attacks, throw, CF per hit, soul steal and Flavius items; -9 if out of ammo; a lyre is worth 20 in Orpheus, else 0. TWEAK: the weights. */
const wScore = weapon => !weapon ? 0 : weapon.lyre ? S && S.evKey === 'orpheus' ? 20 : 0 : weapon.p * (1 + (Math.max(1, weapon.r) - 1) * 0.4) + (weapon.shield ? 1 + weapon.absorb : 0) + (weapon.both ? weapon.p * 0.8 : 0) + (weapon.throw ? 0.5 : 0) + (weapon.cfw ? 1.2 : 0) + (weapon.soul ? 1.5 : 0) + (weapon.flav ? 0.5 : 0) + (weapon.ammo != null && weapon.ammoLeft != null && weapon.ammoLeft <= 0 ? -9 : 0);
/* gainWeapon — puts a weapon in a free hand; with both hands full a CPU replaces its worst if the new one scores higher, a human chooses. Replaced or unholdable weapons drop at the player's feet. */
async function gainWeapon(player, key, fromWeapon) {
  if (!key && !fromWeapon) {
    log('The market is empty at that level.');
    return;
  }
  const w = fromWeapon || mkW(key);
  const arms = armsAttached(player);
  if (!arms.length) {
    log(`${nm(player)} has no arms to hold the ${w.n}.`);
    dropWeapon(player, w);
    return;
  }
  const free = arms.filter(a => !player['w' + a]);
  if (free.length) {
    player['w' + free[0]] = w;
    log(`${nm(player)} equips <b>${w.n}</b> (${wStats(w)}) in the ${free[0] === 'R' ? 'right' : 'left'} hand.`);
    return;
  }
  let choice;
  if (player.cpu) {
    const worst = [...arms].sort((a, b) => wScore(player['w' + a]) - wScore(player['w' + b]))[0];
    choice = wScore(w) > wScore(player['w' + worst]) ? worst : 'drop';
  } else choice = await modal(`New weapon: ${w.n}`, `<p>${wStats(w)}. Both hands are full. Swap one out (it drops at your feet), or leave the new one.</p>`, [...arms.map(a => ({
    label: `Replace ${a === 'R' ? 'right' : 'left'}: ${player['w' + a].n}`,
    sub: wStats(player['w' + a]),
    value: a
  })), {
    label: 'Leave it',
    value: 'drop'
  }]);
  if (choice === 'drop' || !choice) {
    dropWeapon(player, w);
    log(`${nm(player)} leaves the ${w.n} at their feet.`);
    return;
  }
  log(`${nm(player)} swaps ${player['w' + choice].n} for <b>${w.n}</b>.`);
  dropWeapon(player, player['w' + choice]);
  player['w' + choice] = w;
}
/* wStats — short stat line for a weapon (power, range, ammo, shield uses, throws, specials). */
function wStats(weapon) {
  if (!weapon) return '—';
  if (weapon.lyre) return 'control 1 NPC each Resolve';
  if (weapon.noAtk) return 'occupies this slot';
  if (weapon.shield && !weapon.p) return `absorb ${weapon.absorb} · ${weapon.usesLeft} use${weapon.usesLeft === 1 ? '' : 's'} left · no attack`;
  let s = `P${weapon.p} · R${weapon.r}`;
  if (weapon.ammo != null) s += ` · ammo ${weapon.ammoLeft}`;
  if (weapon.shield) s += ` · absorb ${weapon.absorb} · ${weapon.usesLeft} uses`;
  if (weapon.throw) s += ` · throw P${weapon.throw.p} R${weapon.throw.r} ×${weapon.throwsLeft}`;
  if (weapon.atkUses) s += ` · ${weapon.atkLeft} use${weapon.atkLeft === 1 ? '' : 's'} left`;
  if (weapon.both) s += ' · both attacks';
  if (weapon.soul) s += ` · soul steal ${weapon.soul}`;
  if (weapon.cfw) s += ` · +${weapon.cfw} CF per hit`;
  return s;
}
/* purchaseCost — coin price at a market level: COST[lv] x S.priceMul, minus the player's discount, never below 0. */
function purchaseCost(player, lv) {
  return Math.max(0, Math.round(COST[lv] * (S && S.priceMul || 1)) - (player.discount || 0));
}
/* chooseMarket — lets the player take any remaining piece at a level (CPU takes the highest itemValue), removes it from the market and gives it. */
async function chooseMarket(player, kind, lv) {
  // Level 1/2 Armor cards: pick any remaining piece at that level
  const m = S.market[kind][lv];
  const pool = [...m.slots.filter(Boolean), ...m.deck];
  if (!pool.length) {
    log(`No level ${lv} ${kind === 'w' ? 'weapons' : 'armor'} remain.`);
    return;
  }
  let k;
  if (player.cpu) k = pool.sort((a, b) => itemValue(kind, b) - itemValue(kind, a))[0];else k = await modal(`Level ${lv} ${kind === 'w' ? 'weapon' : 'armor'}`, '<p>Choose any remaining piece.</p>', pool.map(x => ({
    label: kind === 'w' ? W[x].n : ARM[x].n,
    sub: kind === 'w' ? wStats(mkW(x)) : armorDesc(x),
    value: x,
    card: kind === 'w' ? 'w:' + x : null
  })));
  k = k || pool[0];
  const i = m.slots.indexOf(k);
  if (i >= 0) m.slots[i] = m.deck.pop() || null;else m.deck.splice(m.deck.indexOf(k), 1);
  if (kind === 'w') await gainWeapon(player, k);else await gainArmorPiece(player, k);
}
