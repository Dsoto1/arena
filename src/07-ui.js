/* =====================================================================
   07-UI · EVERYTHING YOU SEE
   =====================================================================
   - draw(): the isometric canvas. Tiles -> tunnels (printed tokens) -> pillars/pots ->
     pieces -> stands (16-crowd) -> Flavius's box -> floating damage numbers.
     TW is the tile width; everything scales from it.
   - avatarSVG(): the player-board figure. Armor art sits BESIDE the HP/AP bars;
     the body itself shows AP as steel sheen, wounds as red tint, severed as a strike.
   - render(): rebuilds the side panels (status chips, action dock, boards, crowd panel).
   - modal(): the one dialog everything uses. In HEADLESS mode it auto-answers
     (first enabled button, or the close value) so simulations never block.
   ===================================================================== */
/* ================= HUMAN INPUT ================= */
/* humanTurn — true when an event is running, it is a human's turn, and nothing is busy. */
const humanTurn = () => S && !S.over && !cur().cpu && !S.busy;
/* act — wraps a human action: marks the game busy, runs fn, then settles Mandata, end checks and pending effects, and ends the turn itself if the player died, exited or was forced to end. */
async function act(fn) {
  if (!S || S.busy) return;
  const G = S;
  S.busy = true;
  render();
  try {
    await fn();
  } finally {
    if (G === S) {
      const p = cur();
      checkMandata(p);
      await flushMF();
      S.busy = false;
      checkEnd();
      await settle();
      if (G === S && !S.over && (!p.alive || p.exited) && S.phase === 'action') {
        S.phase = 'end';
        advanceTurn();
      } else if (G === S && !S.over && p.forceEnd && S.phase === 'action' && !p.cpu) {
        p.forceEnd = false;
        render();
        await endTurn();
        return;
      }
    }
    render();
  }
}
/* computeHL — rebuilds HL, the map of highlighted tiles for the current mode: move costs, attack targets, push/topple/tunnel/Rete targets, or a tamed beast's moves and attacks while commanding. */
function computeHL() {
  HL = new Map();
  if (!S || S.over) return;
  if (S.phase === 'command' && S.cmd) {
    const {
      n,
      p,
      moved
    } = S.cmd;
    if (!moved) {
      const fly = !!NPCT[n.t].fly;
      const blk = fly ? (r, c) => !!unitAt(r, c) && unitAt(r, c) !== n : npcBlock(n);
      const {
        dist
      } = dijkstra(n.r, n.c, blk, fly);
      const mv = npcStats(n).mv;
      for (let k = 0; k < N * N; k++) {
        const r = Math.floor(k / N),
          c = k % N;
        if (dist[k] > 0 && dist[k] <= mv && !blk(r, c)) HL.set(k, {
          t: 'cmove',
          cost: dist[k]
        });
      }
    }
    for (const t of tamedTargets(n, p)) HL.set(t.r * N + t.c, {
      t: 'catk',
      target: t
    });
    return;
  }
  if (!humanTurn() || S.phase !== 'action') return;
  const p = cur();
  const m = S.mode;
  if (m === 'move' && !p.focusRoll) {
    for (const [k, c] of reach(p).tiles) if (c <= p.mv) HL.set(k, {
      t: 'move',
      cost: c
    });
  } else if (m.startsWith('atk')) {
    const [arm, thr] = [m[3], m[4] === 'T'];
    const src = attackSources(p).find(s => s.arm === arm && !!s.thr === thr);
    if (src) for (const t of [...targetsFor(p, src), ...(src.thr ? [] : shipTargets(p))]) HL.set(t.r * N + t.c, {
      t: 'atk',
      src,
      target: t
    });
  } else if (m === 'push') for (const t of pushTargets(p)) HL.set(t.r * N + t.c, {
    t: 'push',
    target: t
  });else if (m === 'topple') for (const pl of toppleTargets(p)) HL.set(pl.r * N + pl.c, {
    t: 'topple',
    target: pl
  });else if (m === 'tunnel') for (const t of tunnelExits(p)) HL.set(t.r * N + t.c, {
    t: 'tunnel',
    target: t
  });else if (m === 'rete') for (const u of reteTargets(p)) HL.set(u.r * N + u.c, {
    t: 'rete',
    target: u
  });
}
/* onTile — handles a click on a board tile: runs the highlighted action there (move, attack, push, topple, tunnel, Rete, or a tamed beast's move/attack). */
function onTile(r, c) {
  if (!S || S.over) return;
  const h = HL.get(r * N + c);
  if (!h) return;
  if (S.phase === 'command' && S.cmd && !S.cmd.lock) {
    const cmd = S.cmd;
    cmd.lock = true;
    (async () => {
      if (h.t === 'cmove') {
        const fly = !!NPCT[cmd.n.t].fly;
        await npcWalk(cmd.n, [[r, c]], npcStats(cmd.n).mv + (fly ? 0 : 0));
        cmd.moved = true;
        cmd.lock = false;
        if (!tamedTargets(cmd.n, cmd.p).length) {
          finishCommand();
        } else render();
      } else if (h.t === 'catk') {
        await tamedAttack(cmd.n, cmd.p, h.target);
        finishCommand();
      }
    })();
    return;
  }
  if (!humanTurn() || S.phase !== 'action') return;
  const p = cur();
  if (h.t === 'move') act(async () => {
    const path = reach(p).path(r * N + c);
    if (path) await movePlayer(p, path);
    await checkEagleScore(p);
  });else if (h.t === 'atk') act(async () => {
    await doAttack(p, h.src, h.target, {
      focusRoll: p.focusRoll
    });
    p.focusRoll = false;
    S.mode = 'move';
  });else if (h.t === 'push') act(async () => {
    await doPush(p, h.target);
    S.mode = 'move';
  });else if (h.t === 'topple') act(async () => {
    await doTopple(p, h.target);
    S.mode = 'move';
  });else if (h.t === 'tunnel') act(async () => {
    await doTunnel(p, h.target);
    S.mode = 'move';
    S.busy = false;
    await endTurn();
  });else if (h.t === 'rete') act(async () => {
    const u = h.target;
    u.netted = true;
    if (u.cls) bumpRel(u, p, -10, 'netted');
    p.items = p.items.filter(x => x.id !== S.reteItem);
    log(`${nm(p)} throws the Rete over ${nm(u)}. It loses its movement next turn.`);
    S.mode = 'move';
  });
}
/* humanCommand — enters the command phase for a human's tamed beast; the returned promise resolves when finishCommand runs. */
function humanCommand(player, n) {
  return new Promise(res => {
    S.phase = 'command';
    S.cmd = {
      p: player,
      n,
      moved: false,
      lock: false,
      res
    };
    log(`Command ${nm(n)}: move it, attack an adjacent enemy, or finish.`);
    render();
  });
}
/* finishCommand — leaves the command phase and resolves humanCommand's promise. */
function finishCommand() {
  const c = S.cmd;
  S.cmd = null;
  S.phase = 'resolve';
  render();
  if (c) c.res();
}

/* ================= CANVAS ================= */
const cv = $('#cv'),
  ctx = cv.getContext('2d');
/* iso — grid (row, col) to screen x,y of the tile's top corner, from the OX/OY origin and the TW/TH tile size. */
function iso(r, c) {
  return {
    x: OX + (c - r) * TW / 2,
    y: OY + (c + r) * TH / 2
  };
}
/* tilePath — traces a tile's diamond outline onto ctx without filling or stroking it; inset shrinks the diamond. */
function tilePath(r, c, inset = 0) {
  const {
    x,
    y
  } = iso(r, c);
  const w = TW / 2 - inset,
    h = TH / 2 - inset / 2;
  const cx = x,
    cy = y + TH / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  ctx.lineTo(cx + w, cy);
  ctx.lineTo(cx, cy + h);
  ctx.lineTo(cx - w, cy);
  ctx.closePath();
}
/* center — screen x,y of a tile's center. */
function center(r, c) {
  const {
    x,
    y
  } = iso(r, c);
  return {
    x,
    y: y + TH / 2
  };
}
/* shade — lightens (f > 0, toward white) or darkens (f < 0, toward black) a #rrggbb color by the fraction |f|; returns an rgb() string. */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16,
    g = n >> 8 & 255,
    b = n & 255;
  const t = f < 0 ? 0 : 255,
    a = Math.abs(f);
  r = Math.round((t - r) * a + r);
  g = Math.round((t - g) * a + g);
  b = Math.round((t - b) * a + b);
  return `rgb(${r},${g},${b})`;
}
/* ell — starts a new path holding a full ellipse; the caller fills or strokes it. */
function ell(x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}
/* v0.22 ICONS: gold coin, wheat (Crowd Favor), key, trophy — crisp inline SVG so the colors hold everywhere */
const ICO = {
  coin: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#e6b93a" stroke="#8a6414" stroke-width="1.2"/><circle cx="8" cy="8" r="4.6" fill="none" stroke="#fff0b0" stroke-width=".9" opacity=".8"/><path d="M6.4 5.6h3.2M8 5.6v4.8M6.4 10.4h3.2" stroke="#8a6414" stroke-width="1.2" stroke-linecap="round"/></svg>',
  wheat: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15V4" stroke="#d9b24a" stroke-width="1.3" stroke-linecap="round"/><g fill="#e8c65a" stroke="#9a7a24" stroke-width=".5"><ellipse cx="8" cy="2.6" rx="1.3" ry="2"/><ellipse cx="6.2" cy="5" rx="1.1" ry="1.9" transform="rotate(-30 6.2 5)"/><ellipse cx="9.8" cy="5" rx="1.1" ry="1.9" transform="rotate(30 9.8 5)"/><ellipse cx="6.2" cy="8" rx="1.1" ry="1.9" transform="rotate(-30 6.2 8)"/><ellipse cx="9.8" cy="8" rx="1.1" ry="1.9" transform="rotate(30 9.8 8)"/><ellipse cx="6.2" cy="11" rx="1.1" ry="1.9" transform="rotate(-30 6.2 11)"/><ellipse cx="9.8" cy="11" rx="1.1" ry="1.9" transform="rotate(30 9.8 11)"/></g></svg>',
  key: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="8" r="3.4" fill="none" stroke="#d6ab4c" stroke-width="1.8"/><path d="M8.3 8H15M12.5 8v2.6M14.5 8v2" stroke="#d6ab4c" stroke-width="1.8" stroke-linecap="round"/></svg>',
  trophy: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h8v3.5a4 4 0 0 1-8 0Z" fill="#e6b93a" stroke="#8a6414" stroke-width=".8"/><path d="M4 3.2H1.8c0 2.4 1 3.4 2.6 3.6M12 3.2h2.2c0 2.4-1 3.4-2.6 3.6" fill="none" stroke="#e6b93a" stroke-width="1.1"/><path d="M8 9.5v2.5M5 14h6l-1-2H6Z" fill="#c9962a" stroke="#8a6414" stroke-width=".8"/></svg>',
  laurel: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><g fill="#7ccf4f" stroke="#244d12" stroke-width=".55"><ellipse cx="3" cy="4.2" rx="1.5" ry="2.6" transform="rotate(-18 3 4.2)"/><ellipse cx="2.6" cy="8.2" rx="1.5" ry="2.6" transform="rotate(-48 2.6 8.2)"/><ellipse cx="4.6" cy="11.8" rx="1.5" ry="2.6" transform="rotate(-72 4.6 11.8)"/><ellipse cx="13" cy="4.2" rx="1.5" ry="2.6" transform="rotate(18 13 4.2)"/><ellipse cx="13.4" cy="8.2" rx="1.5" ry="2.6" transform="rotate(48 13.4 8.2)"/><ellipse cx="11.4" cy="11.8" rx="1.5" ry="2.6" transform="rotate(72 11.4 11.8)"/></g><path d="M6.2 14.4h3.6" stroke="#e6b93a" stroke-width="1.6" stroke-linecap="round"/></svg>'
};
/* v0.22 STANDEES on the board: the classic minis replace the cylinders for the 8 classes and the default beasts */
const STANDEE_IMG = {};
/* standeeImg — lazy-loads and caches the standee picture for key k; returns it once loaded (and redraws when it arrives), else null. */
function standeeImg(k) {
  if (!k || typeof STANDEE_SRC === 'undefined' || !STANDEE_SRC[k] || HEADLESS) return null;
  let im = STANDEE_IMG[k];
  if (!im) {
    im = new Image();
    im.onload = () => {
      try {
        draw();
      } catch (e) {}
    };
    im.src = STANDEE_SRC[k];
    STANDEE_IMG[k] = im;
  }
  return im.complete && im.naturalWidth ? im : null;
}
/* standeeKeyNPC — the standee key for a beast (by its key or name, or Tholo/Commodus by type), or null. */
const standeeKeyNPC = npc => {
  if (!npc) return null;
  const k = String(npc.key || npc.name || '').toLowerCase();
  if (typeof STANDEE_SRC !== 'undefined' && STANDEE_SRC[k]) return k;
  return npc.t === 'tholo' || npc.t === 'commodus' ? npc.t : null;
};
/* standeeKeyCls — the class name if a standee picture exists for it, else null. */
const standeeKeyCls = cls => typeof STANDEE_SRC !== 'undefined' && STANDEE_SRC[cls] ? cls : null;
/* standeeHTML — an img tag for standee k at h px, for panels ('' if there is none). TWEAK: the default height 40. */
const standeeHTML = (k, h = 40, cls = 'stnd') => typeof STANDEE_SRC !== 'undefined' && STANDEE_SRC[k] ? `<img class="${cls}" src="${STANDEE_SRC[k]}" alt="" style="height:${h}px">` : '';
const TYPE_STANDEE = {
  snake: 'glykon',
  wolf: 'valencia',
  bear: 'ursa',
  lion: 'leo',
  tholo: 'tholo',
  commodus: 'commodus'
};
/* v0.22: true-to-scale minis — heights from the printed standees (300 dpi), normalized so the tallest gladiator ≈ 1.3 tiles; bases kept inside the tile */
const STANDEE_H = {
  amazonia: 612,
  damnatio: 591,
  veteranus: 653,
  venatore: 670,
  hero: 464,
  royalty: 623,
  soldier: 632,
  slave: 546,
  commodus: 760,
  tholo: 664,
  arenosus: 321,
  glykon: 237,
  moechus: 342,
  valencia: 286,
  brutum: 570,
  ursa: 492,
  leo: 504,
  leaena: 507
};
/* standeeSize — on-board height in px for standee k, scaled from its printed height (STANDEE_H) but kept narrow enough to fit the tile.
   TWEAK: 1.3 tiles for the tallest gladiator, width caps of 1.0 tile (beasts) and 0.82 tile (gladiators). */
function standeeSize(k) {
  const im = standeeImg(k);
  if (!im) return TW;
  const ar = im.naturalWidth / im.naturalHeight;
  const want = TW * 1.3 * ((STANDEE_H[k] || 600) / 670);
  const maxW = TW * (['brutum', 'ursa', 'leo', 'leaena', 'arenosus', 'glykon', 'moechus', 'valencia', 'zoraMini'].includes(k) ? 1.0 : 0.82);
  return Math.min(want, maxW / ar);
}
/* standeesOn — true when the token style setting is 'standee' (or no such setting exists). */
const standeesOn = () => typeof tokenStyle !== 'function' || tokenStyle() === 'standee';
// v0.23: sculpted figure tokens (20-tokens.js) — base centered on (x,y)
/* v0.32: the figure a player wears RIGHT NOW — the class token plus every limb the bout has taken */
/* v0.46: nothing useful left this turn? the End turn button beats like a heart */
function turnSpent(player, srcs, loot, ex) {
  try {
    if (S.busy || !humanTurn()) return false;
    const canMove = player.mv > 0 && [...reach(player).tiles].some(([k, c]) => c > 0 && c <= player.mv);
    const canHit = srcs.some(s => targetsFor(player, s).length > 0);
    const canPush = pushTargets(player).length > 0 || toppleTargets(player).length > 0;
    const canUse = player.items.some(i => i.kind === 'offer' || i.kind === 'card' && typeof CARDS !== 'undefined' && CARDS[i.key] && CARDS[i.key].type !== 'passive');
    return !canMove && !canHit && !canPush && !(loot && loot.length) && !canUse && !canOpenChest(player);
  } catch (e) {
    return false;
  }
}
/* tokenForP — the figure token for a gladiator right now: the class token plus any severed limbs, and a Creator Studio weapon in the right hand. */
function tokenForP(player) {
  let base = tokenForCls(player.cls);
  const sev = {};
  let n = 0;
  for (const l of ['rarm', 'larm', 'rleg', 'lleg']) if (player.hp[l] <= 0) {
    sev[l] = 1;
    n++;
  }
  /* v0.45: a weapon forged in the Creator Studio shows in the fighter's hand on the sand — bought, looted or carried in */
  const wk = player.wR && player.wR.key;
  if (wk && String(wk).startsWith('cw_') && W[wk] && W[wk].art && base.weapon !== wk) base = {
    ...base,
    weapon: wk
  };
  return n ? {
    ...base,
    sev
  } : base;
}
/* v0.33 THE POST-SHOW: when the games end the arena resets itself, in order, before your eyes.
   The victor is walked out first, then the survivors. If a Fate reads CHARUN, his masked likeness
   comes through the Porta Libitinensis and drags that body out on a long iron hook. Slaves cart the
   remaining corpses off, wipe the blood, clear the rubble, heave the pillars back onto their plinths
   with fresh Blessings chained above, sink the spikes, walk the chest back to its mark — and last of
   all the handlers lead every surviving beast back to its starting position. Pure curtain-call: a new
   event replaces the state anyway, and cleanFinishNow() jumps straight to the reset if interrupted. */
/* nearGate9 — the corner gate closest to (r, c) by walking distance. */
const nearGate9 = (r, c) => [[0, 0], [0, N - 1], [N - 1, 0], [N - 1, N - 1]].reduce((b, g) => {
  const d = Math.abs(g[0] - r) + Math.abs(g[1] - c);
  return !b || d < b.d ? {
    g,
    d
  } : b;
}, null).g;
/* step9 — moves a one tile (diagonals allowed) toward (tr, tc); returns true once it has arrived. */
const step9 = (a, tr, tc) => {
  a.r += Math.sign(tr - a.r) || 0;
  a.c += Math.sign(tc - a.c) || 0;
  return a.r === tr && a.c === tc;
};
/* cleanCorpses9 — corpses still on the sand for the carts: gladiator corpse piles (not Charun's) and dead beasts. */
function cleanCorpses9() {
  const out = [];
  for (const pl of S.piles || []) if (pl.corpse && !pl.gone && !pl.retiredOut && !pl.charun) out.push({
    kind: 'pile',
    o: pl
  });
  for (const n of S.npcs || []) if (!n.alive && !n.gone) out.push({
    kind: 'npc',
    o: n
  });
  return out;
}
const CLEAN_PH = {
  // 1 · the living leave: the victor first, arms raised, then the rest
  escort: C => {
    const id = C.escort[C.esc];
    if (id == null) return C.escDid ? 1 : 2;
    const p = S.players[id];
    if (!p || !p.alive || p.exited || p.retired) {
      C.esc++;
      C.escG = null;
      return 0;
    }
    if (!C.escDid) {
      C.escDid = 1;
      if ((S.lastResult && S.lastResult.winners || []).includes(p.id)) log(`${nm(p)} is walked to the gate first, arms raised to the crowd.`, 'thought');
    }
    if (!C.escG) C.escG = nearGate9(p.r, p.c);
    if (step9(p, C.escG[0], C.escG[1])) {
      p.exited = true;
      C.escG = null;
      C.esc++;
    }
    return 0;
  },
  // 1b · v0.35: handlers with nets and long poles herd the surviving beasts out through the beast gates
  beastsOut: C => {
    const L = (S.npcs || []).filter(n => n.alive && !n.out);
    if (!L.length) return C.boDid ? 1 : 2;
    if (!C.boDid) {
      C.boDid = 1;
      log('Handlers with nets and long poles herd the surviving beasts out through the beast gates.', 'thought');
    }
    for (const n of L) {
      n.aggro = null;
      n.netted = false;
      if (n.t === 'zora') {
        n.out = 1;
        n.flown = 1;
        continue;
      }
      n.tamedBy = null;
      const g = n.gate9 || (n.gate9 = nearGate9(n.r, n.c));
      if (step9(n, g[0], g[1])) n.out = 1;
    }
    return 0;
  },
  // 1c · v0.35 NAUMACHIA: boatmen fish out every water token first — nobody trusts that water
  fish: C => {
    if (!isNaum()) return 2;
    const wt = S.waterTok || [];
    if (!wt.length) return C.fiDid ? 1 : 2;
    if (!C.fiDid) {
      C.fiDid = 1;
      log('Boatmen pole across the flooded arena, fishing out every token — some of them bite.', 'thought');
    }
    for (const cw of C.crew) {
      const tgt = (S.waterTok || []).reduce((b, x) => {
        const d = Math.max(Math.abs(x.r - cw.r), Math.abs(x.c - cw.c));
        return !b || d < b.d ? {
          x,
          d
        } : b;
      }, null);
      if (!tgt) break;
      if (tgt.d === 0) S.waterTok = S.waterTok.filter(x => x !== tgt.x);else step9(cw, tgt.x.r, tgt.x.c);
    }
    return 0;
  },
  // 1d · then the sluices open and the water drains away, corner to corner, to plain sand
  drain: C => {
    if (!isNaum() || S.drained) return 2;
    if (C.drainLine == null) {
      C.drainLine = -1;
      log('The sluices open: the sea drains out of the arena, corner to corner, and the sand comes back.', 'thought');
    }
    C.drainLine += 2;
    S.drainLine = C.drainLine;
    if (C.drainLine >= 2 * N) {
      S.drained = 1;
      return 1;
    }
    return 0;
  },
  // 2 · Charun comes for the fated
  charun: C => {
    if (!C.ch) {
      const tgt = (S.piles || []).find(pillar => pillar.charun && pillar.corpse && !pillar.gone);
      if (!tgt) return C.chDid ? 1 : 2;
      C.ch = {
        r: N - 1,
        c: 0,
        tgt,
        mode: 'in'
      };
      C.chDid = 1;
      log(`A hush falls. Through the Porta Libitinensis stalks a masked figure in <b>Charun's</b> likeness, a long iron hook in hand — come for <b>${esc(tgt.name)}</b>, as the Fates decreed.`, 'big');
      return 0;
    }
    const ch = C.ch,
      t = ch.tgt;
    if (ch.mode === 'in') {
      if (step9(ch, t.r, t.c)) ch.mode = 'drag';
      return 0;
    }
    const pr = ch.r,
      pc = ch.c;
    if (step9(ch, N - 1, 0)) {
      t.corpse = false;
      t.gone = 1;
      log(`${esc(t.name)} is dragged from the sand, hook under the arm, heels carving a line in the sand.`, 'thought');
      C.ch = null;
      return 0;
    }
    t.r = pr;
    t.c = pc;
    if (Math.random() < .6) bloodAt(pr, pc, 'drop');
    return 0;
  },
  // 3 · small carts wheel the corpses out
  carts: C => {
    let busy = false;
    for (const ct of C.carts) {
      if (ct.load) {
        busy = true;
        if (!ct.g) ct.g = nearGate9(ct.r, ct.c);
        if (step9(ct, ct.g[0], ct.g[1])) {
          ct.load = null;
          ct.g = null;
        }
        continue;
      }
      if (!ct.tgt) {
        const t = cleanCorpses9().find(x => !x.o.claim9);
        if (t) {
          t.o.claim9 = 1;
          ct.tgt = t;
          if (!C.cartDid) {
            C.cartDid = 1;
            log('Slaves wheel small carts onto the sand and heave the fallen aboard.', 'thought');
          }
        }
      }
      if (ct.tgt) {
        busy = true;
        const o = ct.tgt.o;
        if (step9(ct, o.r, o.c)) {
          if (ct.tgt.kind === 'pile') o.corpse = false;
          o.gone = 1;
          ct.load = {
            c: o.color || (typeof NPCT !== 'undefined' && NPCT[o.t] ? NPCT[o.t].col : '#7d6a55')
          };
          ct.tgt = null;
        }
      }
    }
    if (!busy) {
      let mv = false;
      for (const ct of C.carts) {
        const g = nearGate9(ct.r, ct.c);
        if (ct.r !== g[0] || ct.c !== g[1]) {
          mv = true;
          step9(ct, g[0], g[1]);
        }
      }
      if (!mv) return C.cartDid ? 1 : 2;
    }
    return 0;
  },
  // 4 · rags and rakes take the blood
  blood: C => {
    if (!S.blood || !S.blood.length) return C.bloodDid ? 1 : 2;
    if (!C.bloodDid) {
      C.bloodDid = 1;
      log('Chained slaves shuffle across the sand with rags and rakes, wiping away the day’s blood.', 'thought');
    }
    for (const cw of C.crew) {
      const tgt = S.blood.reduce((b, x) => {
        const d = Math.abs(x.r - cw.r) + Math.abs(x.c - cw.c);
        return !b || d < b.d ? {
          x,
          d
        } : b;
      }, null);
      if (!tgt) break;
      if (tgt.d === 0) S.blood = S.blood.filter(x => !(x.r === cw.r && x.c === cw.c));else step9(cw, tgt.x.r, tgt.x.c);
    }
    return 0;
  },
  // 4a · v0.43: the laurels and flowers the crowd threw — gathered up, armful by armful
  laurels: C => {
    const L = (S.tosses || []).filter(other => other.r != null);
    if (!L.length) {
      S.tosses = [];
      return C.laurDid ? 1 : 2;
    }
    if (!C.laurDid) {
      C.laurDid = 1;
      log('Boys with baskets gather the laurels and flowers the crowd threw.', 'thought');
    }
    for (const cw of C.crew) {
      const tgt = L.reduce((b, x) => {
        const d = Math.abs(x.r - cw.r) + Math.abs(x.c - cw.c);
        return !b || d < b.d ? {
          x,
          d
        } : b;
      }, null);
      if (!tgt) break;
      if (tgt.d === 0) S.tosses = S.tosses.filter(other => !(other.r === cw.r && other.c === cw.c));else step9(cw, tgt.x.r, tgt.x.c);
    }
    return 0;
  },
  // 4b · v0.34: everything LEFT BEHIND — drop markers, dropped kit, offerings, keys, the Eagle, thrown weapons
  loot: C => {
    const tg = [];
    for (const pl of S.piles || []) if (!pl.gone && !pl.corpse && !pileEmpty(pl)) tg.push({
      t: 'pile',
      o: pl
    });
    for (const f of S.floor || []) tg.push({
      t: 'floor',
      o: f
    });
    if (!tg.length) return C.lootDid ? 1 : 2;
    if (!C.lootDid) {
      C.lootDid = 1;
      log('The crew sweeps the sand for what the fighters left behind — dropped kit, offerings, thrown steel — every scrap carried to the vaults.', 'thought');
    }
    for (const cw of C.crew) {
      const tgt = tg.filter(x => !x.o.claim8).reduce((b, x) => {
        const d = Math.abs(x.o.r - cw.r) + Math.abs(x.o.c - cw.c);
        return !b || d < b.d ? {
          x,
          d
        } : b;
      }, null);
      if (!tgt) break;
      if (tgt.d === 0) {
        const x = tgt.x;
        if (x.t === 'pile') {
          x.o.gone = 1;
          x.o.weapons = [];
          x.o.armor = [];
          x.o.coin = 0;
          x.o.items = [];
        } else {
          S.floor = S.floor.filter(f => f !== x.o);
        }
        x.o.claim8 = 1;
      } else step9(cw, tgt.x.o.r, tgt.x.o.c);
    }
    return 0;
  },
  // 5 · toppled stone is carried off
  rubble: C => {
    const rb = S.rubble || [];
    if (!rb.length) return C.rubDid ? 1 : 2;
    C.rubDid = 1;
    for (const cw of C.crew) {
      const t = rb[0];
      if (!t) break;
      if (cw.r === t.r && cw.c === t.c) S.rubble.shift();else step9(cw, t.r, t.c);
    }
    return 0;
  },
  // 6 · pillars back on their plinths, fresh Blessings chained above
  pillars: C => {
    const init = S.init && S.init.pillars || [];
    if (!C.pil) {
      const extra = S.pillars.find(pillar => !init.some(ip => ip.id === pillar.id));
      if (extra) {
        S.pillars = S.pillars.filter(x => x !== extra);
        C.pil = {
          kind: 'haul',
          r: extra.r,
          c: extra.c,
          g: nearGate9(extra.r, extra.c)
        };
        if (!C.haulDid) {
          C.haulDid = 1;
          log(isNaum() ? 'The crews unstep the ships\u2019 masts and drag them out \u2014 the sand is being set for Classic games.' : 'The crew hauls away the stone that does not belong.', 'thought');
        }
        return 0;
      }
      const missing = init.find(ip => !S.pillars.some(pillar => pillar.id === ip.id));
      if (missing) {
        C.pil = {
          ip: missing,
          r: 0,
          c: N - 1,
          kind: 'carry'
        };
        if (!C.pilDid) {
          C.pilDid = 1;
          log(isNaum() ? 'Teams of slaves carry out twelve pillars and set them on the Classic marks, fresh Blessings pots chained above.' : 'Teams of slaves heave the fallen pillars back onto their plinths and chain fresh Blessings pots above.', 'thought');
        }
        return 0;
      }
      const short = init.map(ip => ({
        ip,
        pl: S.pillars.find(pillar => pillar.id === ip.id)
      })).find(x => x.pl && x.pl.pots.length < x.ip.pots);
      if (short) {
        C.pil = {
          ip: short.ip,
          pl: short.pl,
          r: 0,
          c: N - 1,
          kind: 'pots'
        };
        if (!C.pilDid) {
          C.pilDid = 1;
          log('Fresh Blessings pots are chained atop the pillars.', 'thought');
        }
        return 0;
      }
      return C.pilDid ? 1 : 2;
    }
    const j = C.pil;
    if (j.kind === 'haul') {
      if (step9(j, j.g[0], j.g[1])) C.pil = null;
      return 0;
    }
    if (step9(j, j.ip.r, j.ip.c)) {
      if (j.kind === 'carry') S.pillars.push({
        id: j.ip.id,
        r: j.ip.r,
        c: j.ip.c,
        pots: Array(j.ip.pots).fill('?')
      });else j.pl.pots = Array(j.ip.pots).fill('?');
      C.pil = null;
    }
    return 0;
  },
  // 7 · the winches turn and the spikes sink home
  spikes: C => {
    if (!S.spikes || !S.spikes.length) return C.spkDid ? 1 : 2;
    if (!C.spkDid) {
      C.spkDid = 1;
      log('Below the sand, the winches turn: the spikes sink back into their housings.', 'thought');
    }
    C.spikeH -= 0.18;
    if (C.spikeH <= 0) {
      S.spikes = [];
      C.spikeH = 1;
    }
    return 0;
  },
  // 8 · the Arena Chest is walked back to its mark
  chest: C => {
    const t = S.init && S.init.chest;
    if (!t) return 2;
    if (S.chest && S.chest.r === t.r && S.chest.c === t.c && S.chest.held == null) return C.chsDid ? 1 : 2;
    if (!C.chsDid) {
      C.chsDid = 1;
      log('The Arena Chest is carried back to its mark.', 'thought');
    }
    if (!S.chest) S.chest = {
      r: 0,
      c: 0,
      weapons: [],
      held: null
    };
    S.chest.held = null;
    step9(S.chest, t.r, t.c);
    return 0;
  },
  // 9 · v0.34: the ushers empty the tiers — every spectator is out before the beasts walk home
  stands: C => {
    const sp = (S.spect || []).filter(x => !x.gone);
    if (!sp.length) return C.stDid ? 1 : 2;
    if (!C.stDid) {
      C.stDid = 1;
      log('The ushers work the tiers: the last spectators drain out through the vomitoria, still arguing about the card.', 'thought');
    }
    const k = Math.max(2, Math.ceil((S.spect || []).length / 10));
    for (let i = 0; i < k && i < sp.length; i++) sp[i].gone = true;
    return 0;
  },
  // 10 · very last: the handlers walk every surviving beast back to its starting position
  npcs: C => {
    return 2; /* v0.57: the beasts stay behind the gates once herded out — no live beast or gladiator is left on the sand */
    let moving = false;
    for (const n of S.npcs || []) {
      if (!n.alive || n.sr == null || n.flown) continue;
      n.aggro = null;
      n.netted = false;
      if (n.out) {
        const g = nearGate9(n.sr, n.sc);
        n.r = g[0];
        n.c = g[1];
        n.out = 0;
        n.gate9 = null;
      } // led back in from the gate nearest its mark
      if (n.r !== n.sr || n.c !== n.sc) {
        moving = true;
        step9(n, n.sr, n.sc);
      }
    }
    if (moving) {
      if (!C.npcDid) {
        C.npcDid = 1;
        log('Last of all, the handlers lead the beasts back in and walk them to their marks.', 'thought');
      }
      return 0;
    }
    return C.npcDid ? 1 : 2;
  }
};
/* v0.36: a drained Naumachia is set for its next games the way every arena is — Classic Elimination:
   twelve pillars on their printed marks, a Blessings pot on each, the chest in the center. The masts go. */
function naumClassicInit() {
  if (!isNaum() || S.initClassic) return;
  S.init = S.init || {};
  S.init.pillars = PILLARS.map(([r, c], i) => ({
    id: i,
    r,
    c,
    pots: 1
  }));
  S.init.chest = {
    r: 6,
    c: 6
  };
  S.initClassic = 1;
}
const CLEAN_ORDER = ['spikes', 'escort', 'beastsOut', 'fish', 'drain', 'charun', 'carts', 'blood', 'laurels', 'loot', 'rubble', 'pillars', 'chest', 'stands', 'npcs']; // v0.35: spikes sink first, the living walk out, the beasts are led off, THEN the crew works
/* startCleanCrew — starts the post-show after an event: clears anything with no tile, marks Charun's victims, lines up the escort (winners first) and, if there is work, starts a timer running cleanTick9.
   TWEAK: the 320 ms tick (cleanHUD assumes 0.32 s per tick), the crew and cart starting corners. */
function startCleanCrew() {
  if (HEADLESS || !S || S.clean || !S.over || S.sim || S.cleanDone) return; // v0.35: already reset (Return to Match Week / New event) — no second show
  naumClassicInit();
  // v0.36: anything with no place on the board (a fighter never seated, a pile with no tile) is simply gone — nothing to walk to
  {
    /* bad — true for anything without a finite board position. */
    const bad = o => !Number.isFinite(o.r) || !Number.isFinite(o.c);
    for (const pl of S.piles || []) if (bad(pl)) {
      pl.gone = 1;
      pl.corpse = false;
    }
    for (const p of S.players || []) if (bad(p)) {
      p.exited = true;
    }
    for (const n of S.npcs || []) if (bad(n)) {
      n.gone = 1;
      if (n.alive) n.out = 1;
      n.flown = 1;
    }
    S.blood = (S.blood || []).filter(b => !bad(b));
    S.floor = (S.floor || []).filter(f => !bad(f));
    S.waterTok = (S.waterTok || []).filter(f => !bad(f));
  }
  const R = S.lastResult || {};
  // Charun claims only those whose Fate reads Charun (Fatal Charades, 15-16 CF)
  const charunIds = (R.rows || []).filter(x => /Charun$/.test(String(x.fate || ''))).map(x => x.id);
  for (const id of charunIds) {
    const p = S.players[id];
    if (p && p.alive && !p.exited && !p.retired) {
      p.exited = true;
      S.piles.push({
        id: uid++,
        owner: p.id,
        color: p.color,
        name: p.name,
        cls: p.cls,
        sev: {},
        r: p.r,
        c: p.c,
        corpse: true,
        cosmetic: 1,
        weapons: [],
        armor: [],
        coin: 0,
        items: []
      });
    }
  }
  for (const pl of S.piles || []) if (pl.corpse && charunIds.includes(pl.owner)) pl.charun = 1;
  const winners = new Set(R.winners || []);
  const escort = S.players.filter(player => player.alive && !player.exited && !player.retired).sort((a, b) => (winners.has(b.id) ? 1 : 0) - (winners.has(a.id) ? 1 : 0)).map(player => player.id);
  // is there anything at all to do?
  const init = S.init || {};
  const pillarWork = (init.pillars || []).some(ip => {
    const pl = S.pillars.find(x => x.id === ip.id);
    return !pl || pl.pots.length < ip.pots;
  }) || S.pillars.some(pillar => !(init.pillars || []).some(ip => ip.id === pillar.id));
  const chestWork = !!(init.chest && (!S.chest || S.chest.r !== init.chest.r || S.chest.c !== init.chest.c || S.chest.held != null));
  const npcWork = false; /* v0.57: beasts are not walked back to their marks */
  const lootWork = (S.piles || []).some(pillar => !pillar.gone && !pillar.corpse && !pileEmpty(pillar)) || (S.floor || []).length;
  const standsWork = (S.spect || []).some(x => !x.gone);
  const beastWork = (S.npcs || []).some(n => n.alive && n.t !== 'zora');
  const naumWork = isNaum() && !S.drained;
  if (!escort.length && !cleanCorpses9().length && !(S.piles || []).some(pillar => pillar.charun && pillar.corpse) && !(S.blood || []).length && !(S.rubble || []).length && !pillarWork && !(S.spikes || []).length && !chestWork && !npcWork && !lootWork && !standsWork && !beastWork && !naumWork) {
    S.zoneFull = 1;
    S.cleanDone = 1;
    if (S.mgrCtx && S.mgrReturnPending && $('#modal').hidden) mgrFadeBack();
    return;
  }
  S.clean = {
    phase: 0,
    crew: [{
      r: 0,
      c: 0,
      f: 0
    }, {
      r: N - 1,
      c: N - 1,
      f: 1
    }],
    carts: [{
      r: 0,
      c: 0,
      load: null
    }, {
      r: N - 1,
      c: N - 1,
      load: null
    }],
    escort,
    esc: 0,
    spikeH: 1,
    t: null
  };
  log('The games are done. The Porta Triumphalis opens for the living; the crew of the arena takes the sand.', 'thought');
  const G9 = S,
    C = S.clean;
  cleanHUD(C);
  C.t = setInterval(() => {
    try {
      cleanTick9(G9, C);
    } catch (e) {
      try {
        clearInterval(C.t);
      } catch (_) {}
      ;
      if (S && S.clean === C) S.clean = null;
    }
  }, 320);
}
/* cleanTick9 — one post-show tick: runs the current CLEAN_PH phase (0 = still working, 1 = finished, 2 = nothing to do, go straight on). After the last phase it stops the timer, draws the curtain and fades back to Match Week or shows the after-show prompt.
   TWEAK: the 1200 / 1600 ms delays before those. */
function cleanTick9(G9, C) {
  if (G9 !== S || S.clean !== C || !S.over) {
    clearInterval(C.t);
    if (S && S.clean === C) S.clean = null;
    cleanHUD(null);
    return;
  }
  if (typeof CITY !== 'undefined' && CITY.open) return;
  let guard = 0;
  while (guard++ < 12) {
    const ph = CLEAN_ORDER[C.phase];
    if (!ph) {
      clearInterval(C.t);
      S.clean = null;
      S.zoneFull = 1;
      S.cleanDone = 1;
      cleanHUD(null);
      if (typeof curtainTo === 'function') curtainTo(1, 1800); /* v0.42: the show is over — the curtain draws */
      if (typeof tutAfterShow === 'function') tutAfterShow(); // v0.34: the ropes come down — the full 13×13 opens again
      if ((S.mgrCtx || S.specCtx) && $('#modal').hidden) {
        const G8 = S;
        setTimeout(() => {
          if (S === G8 && $('#modal').hidden && $('#mainMenu').hidden && !document.getElementById('mgrBody')) mgrFadeBack();
        }, 1200);
      } // v0.46: the show is over — Match Week always fades back in
      if (!S.mgrCtx && !S.specCtx && !S.tutorial && !S.tourn && !S.exhib && !S.fest && !S.missio && !S.road && !HEADLESS) {
        const G9 = S;
        setTimeout(() => {
          if (S !== G9 || !$('#modal').hidden || !$('#mainMenu').hidden) return;
          afterShowPrompt();
        }, 1600);
      } /* v0.46 */
      log('The sand is raked smooth, the ropes come down to open the full square, the pillars stand dressed, and the beast gates are barred. The arena waits for its next games.', 'thought');
      try {
        draw();
      } catch (e) {}
      return;
    }
    const done = CLEAN_PH[ph](C);
    if (done === 2) {
      C.phase++;
      continue;
    }
    if (done) C.phase++;
    break;
  }
  cleanHUD(C);
  try {
    draw();
  } catch (e) {}
}
/* jump straight to the reset — called when a new-event screen opens mid-show, so returning
   to the arena always finds it reset, whatever the animation was doing */
function cleanFinishNow() {
  if (S) S.tosses = [];
  if (!S) return;
  if (S.clean) {
    try {
      clearInterval(S.clean.t);
    } catch (e) {}
    ;
    S.clean = null;
  }
  cleanHUD(null);
  if (S.over) {
    S.cleanDone = 1;
    if (typeof curtainTo === 'function') curtainTo(1, 900);
  }
  if (!S.over || HEADLESS) return;
  S.blood = [];
  S.rubble = [];
  S.spikes = [];
  for (const pl of S.piles || []) if (pl.corpse) {
    pl.corpse = false;
    pl.gone = 1;
  }
  for (const n of S.npcs || []) {
    if (!n.alive) n.gone = 1;else if (n.t === 'zora') {
      n.out = 1;
      n.flown = 1;
    } else {
      n.out = 1; /* v0.57: herded out and kept out */
      n.gone = 1;
      n.aggro = null;
      n.netted = false;
      n.tamedBy = null;
    }
  }
  if (isNaum()) {
    S.waterTok = [];
    S.drained = 1;
  }
  for (const p of S.players || []) if (p.alive && !p.retired) p.exited = true;
  for (const pl of S.piles || []) if (!pileEmpty(pl)) {
    pl.gone = 1;
    pl.weapons = [];
    pl.armor = [];
    pl.coin = 0;
    pl.items = [];
  } // v0.34: leftovers to the vaults
  S.floor = [];
  for (const sp of S.spect || []) sp.gone = true;
  S.zoneFull = 1;
  naumClassicInit();
  const init = S.init;
  if (init && init.pillars) S.pillars = S.pillars.filter(pillar => init.pillars.some(ip => ip.id === pillar.id));
  if (init) {
    for (const ip of init.pillars || []) {
      let pl = S.pillars.find(x => x.id === ip.id);
      if (!pl) {
        pl = {
          id: ip.id,
          r: ip.r,
          c: ip.c,
          pots: []
        };
        S.pillars.push(pl);
      }
      if (pl.pots.length < ip.pots) pl.pots = Array(ip.pots).fill('?');
    }
    if (init.chest) {
      if (!S.chest) S.chest = {
        weapons: [],
        held: null
      };
      S.chest.r = init.chest.r;
      S.chest.c = init.chest.c;
      S.chest.held = null;
    }
  }
  try {
    draw();
  } catch (e) {}
}
/* ---- v0.35 the post-show countdown (upper left of the arena) ---- */
/* cheb9 — king-move (Chebyshev) distance from a to (r, c). */
const cheb9 = (a, r, c) => Math.max(Math.abs(a.r - r), Math.abs(a.c - c));
/* cleanEstTicks — rough number of ticks the rest of the post-show will take, summed over the phases still to run; drives the countdown.
   TWEAK: the per-phase guesses (e.g. 6 per corpse, 3 per rubble or loot pile, 12 per pillar). */
function cleanEstTicks(C) {
  /* at — true if phase k has not finished yet. */
  const at = k => CLEAN_ORDER.indexOf(k) >= C.phase;
  let t = 0;
  if (at('spikes') && (S.spikes || []).length) t += Math.ceil(C.spikeH / 0.18);
  if (at('escort')) for (const id of C.escort.slice(C.esc)) {
    const p = S.players[id];
    if (p && p.alive && !p.exited) {
      const g = nearGate9(p.r, p.c);
      t += cheb9(p, g[0], g[1]);
    }
  }
  if (at('beastsOut')) {
    let m = 0;
    for (const n of S.npcs || []) if (n.alive && !n.out) {
      const g = nearGate9(n.r, n.c);
      m = Math.max(m, cheb9(n, g[0], g[1]));
    }
    t += m;
  }
  if (at('fish')) t += (S.waterTok || []).length * 3;
  if (at('drain') && isNaum() && !S.drained) t += Math.ceil((2 * N - (C.drainLine == null ? -1 : C.drainLine)) / 2);
  if (at('charun')) for (const pl of S.piles || []) if (pl.charun && pl.corpse && !pl.gone) t += cheb9(pl, N - 1, 0) * 2;
  if (at('carts')) t += Math.ceil(cleanCorpses9().length * 12 / 2) + (C.cartDid ? 4 : 0);
  if (at('blood')) t += Math.ceil((S.blood || []).length * 1.2) + ((S.blood || []).length ? 3 : 0);
  if (at('loot')) t += ((S.piles || []).filter(pillar => !pillar.gone && !pillar.corpse && !pileEmpty(pillar)).length + (S.floor || []).length) * 3;
  if (at('rubble')) t += (S.rubble || []).length * 3;
  if (at('pillars')) {
    const init = S.init && S.init.pillars || [];
    t += init.filter(ip => {
      const pl = S.pillars.find(x => x.id === ip.id);
      return !pl || pl.pots.length < ip.pots;
    }).length * 12 + S.pillars.filter(pillar => !init.some(ip => ip.id === pillar.id)).length * 8;
  }
  if (at('chest') && S.init && S.init.chest && S.chest) t += cheb9(S.chest, S.init.chest.r, S.init.chest.c);
  if (at('stands')) {
    const n = (S.spect || []).filter(x => !x.gone).length;
    t += Math.ceil(n / Math.max(2, Math.ceil((S.spect || []).length / 10)));
  }
  if (at('npcs')) t += (S.npcs || []).some(n => n.alive && !n.flown) ? 8 : 0;
  return t;
}
/* cleanHUD — shows or updates the "arena crew" countdown with a Skip (or Return to Match Week) button; pass null to remove it. */
function cleanHUD(C) {
  if (HEADLESS) return;
  const wrap = cv.parentElement;
  let el = document.getElementById('cleanHUD');
  if (!C) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('div');
    el.id = 'cleanHUD';
    el.className = 'cleanhud';
    wrap.appendChild(el);
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-clskip]');
      if (!b) return;
      const mgr = !!(S && S.mgrCtx);
      cleanFinishNow();
      if (mgr) mgrFadeBack();
    });
  }
  const secs = Math.max(1, Math.round(cleanEstTicks(C) * 0.32));
  const mgr = !!S.mgrCtx;
  const html = `<span>🧹 <b>The arena crew</b> · ~${secs}s to reset</span><button class="btn tksm" type="button" data-clskip="1">${mgr ? '⏎ Return to Match Week' : '⏭ Skip the show'}</button>`;
  if (el.dataset.h !== html) {
    el.dataset.h = html;
    el.innerHTML = html;
  }
}
/* v0.35: back to Match Week with a fade, the way you came in */
/* fadeTo — fades the screen to black, runs cb, then fades back in (cb runs at once in headless mode). TWEAK: 640 ms to black, 120 ms hold, 650 ms fade-out. */
function fadeTo(cb) {
  if (HEADLESS) {
    cb();
    return;
  }
  const fd = document.createElement('div');
  fd.id = 'cityFade';
  document.body.appendChild(fd);
  requestAnimationFrame(() => fd.classList.add('dark'));
  setTimeout(() => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      fd.classList.remove('dark');
      setTimeout(() => fd.remove(), 650);
    }, 120);
  }, 640);
}
/* v0.46: the show is over — a new match, or stay and look at the arena */
async function afterShowPrompt() {
  const v = await modal('🧹 The arena is ready', '<p>The crew has reset the sand. What next?</p>', [{
    label: '⚔️ Start a new match',
    sub: 'choose the arena, event and gladiators',
    value: 'new',
    primary: 1
  }, {
    label: '🏟 Back to the arena',
    sub: 'stay and look around',
    value: 'stay'
  }, {
    label: '🏛',
    sub: 'main menu',
    value: 'menu'
  }], {
    close: 'stay'
  });
  if (v === 'new') openSetup(true);else if (v === 'menu' && typeof transitRun === 'function') transitRun(() => menuShow(), 'The main menu…');
}
/* mgrFadeBack — fades back to Manager mode's Match Week (the 'night' tab). */
function mgrFadeBack() {
  if (S) S.mgrReturnPending = false;
  fadeTo(() => {
    if (typeof openManager === 'function') {
      if (typeof MGR !== 'undefined') MGR.tab = 'night';
      openManager('night');
    }
  });
}
/* ---- the crew on canvas ---- */
/* drawSlave9 — draws a crew member (shadow, tunic, head) at screen point m, optionally holding a rake. TWEAK: colors and TW-relative sizes. */
function drawSlave9(m, withRake) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ell(m.x, m.y, TW * 0.22, TW * 0.09);
  ctx.fill();
  ctx.fillStyle = '#6a5a48';
  ctx.beginPath();
  ctx.moveTo(m.x - TW * 0.14, m.y);
  ctx.quadraticCurveTo(m.x - TW * 0.16, m.y - TW * 0.34, m.x, m.y - TW * 0.38);
  ctx.quadraticCurveTo(m.x + TW * 0.16, m.y - TW * 0.34, m.x + TW * 0.14, m.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c9a074';
  ell(m.x, m.y - TW * 0.44, TW * 0.085, TW * 0.085);
  ctx.fill();
  if (withRake) {
    ctx.strokeStyle = '#7a4a2a';
    ctx.lineWidth = Math.max(1.4, TW * 0.03);
    ctx.beginPath();
    ctx.moveTo(m.x + TW * 0.12, m.y - TW * 0.05);
    ctx.lineTo(m.x + TW * 0.12, m.y - TW * 0.5);
    ctx.stroke();
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(m.x + TW * 0.06, m.y - TW * 0.56, TW * 0.13, TW * 0.05);
  }
  ctx.restore();
}
/* drawCart9 — draws a corpse cart (wheels, bed, handle) with a slave pulling it; when loaded, a shrouded body ringed in load.c. TWEAK: colors and sizes. */
function drawCart9(m, load) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ell(m.x + 2, m.y + 2, TW * 0.3, TW * 0.12);
  ctx.fill();
  for (const dx of [-TW * 0.16, TW * 0.16]) {
    ctx.fillStyle = '#4a381f';
    ell(m.x + dx, m.y, TW * 0.09, TW * 0.09);
    ctx.fill();
    ctx.strokeStyle = '#2a1c0c';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.fillStyle = '#7a5a34';
  ctx.fillRect(m.x - TW * 0.26, m.y - TW * 0.28, TW * 0.52, TW * 0.2);
  ctx.strokeStyle = '#4a3018';
  ctx.lineWidth = 1;
  ctx.strokeRect(m.x - TW * 0.26, m.y - TW * 0.28, TW * 0.52, TW * 0.2);
  ctx.strokeStyle = '#5a4225';
  ctx.lineWidth = Math.max(1.4, TW * 0.035);
  ctx.beginPath();
  ctx.moveTo(m.x + TW * 0.26, m.y - TW * 0.2);
  ctx.lineTo(m.x + TW * 0.44, m.y - TW * 0.06);
  ctx.stroke();
  if (load) {
    ctx.fillStyle = '#d8cfc0';
    ell(m.x, m.y - TW * 0.3, TW * 0.2, TW * 0.09);
    ctx.fill();
    ctx.strokeStyle = load.c || '#7d6a55';
    ctx.lineWidth = 2;
    ctx.stroke();
  } // the shrouded body, ringed in its colors
  drawSlave9({
    x: m.x + TW * 0.5,
    y: m.y + TW * 0.04
  }, false);
  ctx.restore();
}
/* drawCharun9 — draws the masked Charun figure with his long iron hook at m. TWEAK: colors and sizes. */
function drawCharun9(m) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ell(m.x, m.y, TW * 0.26, TW * 0.11);
  ctx.fill();
  ctx.fillStyle = '#2a3444';
  ctx.beginPath();
  ctx.moveTo(m.x - TW * 0.17, m.y);
  ctx.quadraticCurveTo(m.x - TW * 0.2, m.y - TW * 0.5, m.x, m.y - TW * 0.56);
  ctx.quadraticCurveTo(m.x + TW * 0.2, m.y - TW * 0.5, m.x + TW * 0.17, m.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#cfd4cd';
  ell(m.x, m.y - TW * 0.62, TW * 0.095, TW * 0.11);
  ctx.fill();
  ctx.fillStyle = '#2a3444';
  ctx.beginPath();
  ctx.moveTo(m.x - TW * 0.01, m.y - TW * 0.62);
  ctx.lineTo(m.x + TW * 0.06, m.y - TW * 0.56);
  ctx.lineTo(m.x - TW * 0.01, m.y - TW * 0.56);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#101418';
  ell(m.x - TW * 0.035, m.y - TW * 0.645, TW * 0.016, TW * 0.02);
  ctx.fill();
  ell(m.x + TW * 0.035, m.y - TW * 0.645, TW * 0.016, TW * 0.02);
  ctx.fill();
  ctx.strokeStyle = '#7d868f';
  ctx.lineWidth = Math.max(1.6, TW * 0.04);
  ctx.beginPath();
  ctx.moveTo(m.x + TW * 0.14, m.y + TW * 0.02);
  ctx.lineTo(m.x + TW * 0.3, m.y - TW * 0.72);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(m.x + TW * 0.11, m.y + TW * 0.05, TW * 0.07, -0.4, 2.2);
  ctx.stroke();
  ctx.restore();
}
/* drawCleanCrew — draws the post-show workers for the current phase: the chained raking pair, carts, Charun, pillar bearers and the chest carrier. */
function drawCleanCrew() {
  const C = S.clean;
  if (!C) return;
  const ph = CLEAN_ORDER[C.phase];
  if (ph === 'blood' || ph === 'loot' || ph === 'rubble' || ph === 'pillars' || ph === 'fish') {
    for (const cw of C.crew) drawSlave9(center(cw.r, cw.c), true);
    const [a, b] = C.crew.map(cw => center(cw.r, cw.c)); // the chain between them
    if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) < TW * 7) {
      ctx.save();
      ctx.strokeStyle = 'rgba(160,160,170,.5)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y - TW * 0.2);
      ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + TW * 0.4, b.x, b.y - TW * 0.2);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (ph === 'carts') for (const ct of C.carts) if (ct.load || ct.tgt || ph === 'carts') drawCart9(center(ct.r, ct.c), ct.load);
  if (C.ch) drawCharun9(center(C.ch.r, C.ch.c));
  if (C.pil && (C.pil.kind === 'carry' || C.pil.kind === 'haul')) {
    const m = center(C.pil.r, C.pil.c); // a pillar on the move, carried flat by two bearers
    drawSlave9({
      x: m.x - TW * 0.34,
      y: m.y + TW * 0.05
    }, false);
    drawSlave9({
      x: m.x + TW * 0.34,
      y: m.y + TW * 0.05
    }, false);
    ctx.save();
    const pc = THEME.pillar || '#ece4d4';
    ctx.fillStyle = pc;
    ctx.strokeStyle = 'rgba(80,70,55,.5)';
    ctx.lineWidth = 1;
    ctx.translate(m.x, m.y - TW * 0.3);
    ctx.rotate(-0.16);
    ctx.fillRect(-TW * 0.5, -TW * 0.1, TW * 1.0, TW * 0.2);
    ctx.strokeRect(-TW * 0.5, -TW * 0.1, TW * 1.0, TW * 0.2);
    ctx.restore();
  }
  if (C.pil && C.pil.kind === 'pots') drawSlave9(center(C.pil.r, C.pil.c), false);
  if (ph === 'chest' && S.chest) drawSlave9({
    x: center(S.chest.r, S.chest.c).x - TW * 0.3,
    y: center(S.chest.r, S.chest.c).y + TW * 0.04
  }, false);
}
/* a fallen figure in the sand — the token laid on its side, drained of color */
/* drawCorpseFig — TWEAK: the dead look (filter 'saturate(.4) brightness(.72)'), the 1.32 rad tilt, and the color ring's .65 alpha. */
function drawCorpseFig(m, sp, col) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,6,3,.4)';
  ell(m.x, m.y, TW * 0.33, TW * 0.13);
  ctx.fill();
  const im = typeof tokenImg === 'function' ? tokenImg(sp) : null;
  if (im) {
    const h = TW * 1.02,
      w = h * 100 / 170;
    ctx.translate(m.x - TW * 0.05, m.y + TW * 0.02);
    ctx.rotate(1.32);
    try {
      ctx.filter = 'saturate(.4) brightness(.72)';
    } catch (e) {}
    ctx.globalAlpha *= 0.95;
    ctx.drawImage(im, -w / 2, -h * (157 / 170), w, h);
    ctx.restore();
    if (col) {
      ctx.save();
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 1.6;
      ell(m.x, m.y, TW * 0.3, TW * 0.12);
      ctx.stroke();
      ctx.restore();
    }
    return;
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = col || '#7d6a55';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(m.x - TW * 0.1, m.y - TW * 0.05);
  ctx.lineTo(m.x + TW * 0.1, m.y + TW * 0.05);
  ctx.moveTo(m.x + TW * 0.1, m.y - TW * 0.05);
  ctx.lineTo(m.x - TW * 0.1, m.y + TW * 0.05);
  ctx.stroke();
  ctx.restore();
}
/* drawFigureTok — draws sculpted figure token sp with its base centered on (x, y), h px tall, plus a shadow. Returns a y near its top (for HP bars), or null if the image is not ready. */
function drawFigureTok(sp, x, y, h, opt = {}) {
  const im = typeof tokenImg === 'function' ? tokenImg(sp) : null;
  if (!im) return null;
  const w = h * 100 / 170;
  const top = y - h * (157 / 170);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ell(x + 2, y + 3, w * 0.34, w * 0.11);
  ctx.fill();
  if (opt.filter) ctx.filter = opt.filter;
  ctx.drawImage(im, x - w / 2, top, w, h);
  ctx.restore();
  return top + h * 0.12;
}
/* wantFigure — whether to draw a sculpted figure instead of a standee: always in 'figure' style, and for custom pieces in 'standee' style. */
const wantFigure = isCustom => {
  const st = typeof tokenStyle === 'function' ? tokenStyle() : 'standee';
  return st === 'figure' || isCustom && st === 'standee';
};
// draws the mini with its base centered on (x,y); h = on-board height in px. Returns the top y, or null if not drawn.
function drawStandee(k, x, y, h, opt = {}) {
  const im = standeesOn() ? standeeImg(k) : null;
  if (!im) return null;
  const w = h * im.naturalWidth / im.naturalHeight;
  const baseOff = h * 0.06;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.38)';
  ell(x + 2, y + 2, Math.min(w * 0.42, TW * 0.42), Math.min(w * 0.42, TW * 0.42) * 0.45);
  ctx.fill();
  if (opt.dim) ctx.globalAlpha = opt.dim;
  if (opt.filter) ctx.filter = opt.filter;
  ctx.drawImage(im, x - w / 2, y - h + baseOff, w, h);
  ctx.restore();
  return y - h + baseOff;
}
/* drawCyl — draws the fallback cylinder piece (shadow, darker side, colored top) used when no picture is available. */
function drawCyl(x, y, rx, h, col, top) {
  const ry = rx * 0.5;
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ell(x + 2, y + 2, rx * 1.08, ry * 1.08);
  ctx.fill();
  ctx.fillStyle = shade(col, -0.35);
  ctx.beginPath();
  ctx.moveTo(x - rx, y - h);
  ctx.lineTo(x - rx, y);
  ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(x + rx, y - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = top || col;
  ell(x, y - h, rx, ry);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.45)';
  ctx.lineWidth = 1;
  ctx.stroke();
}
/* drawPot — draws a clay Blessings amphora of size s standing at (x, y); a gold one marked E for the Golden Eagle. TWEAK: THEME.pot and the gold colors. */
function drawPot(x, y, s, eagle) {
  // clay amphora: body, shoulder, neck, rim, and a chain loop
  const potC = THEME.pot || '#b5582f';
  const body = eagle ? '#d9b44a' : potC,
    dark = eagle ? '#8a6a18' : shade(potC, -0.35),
    lite = eagle ? '#f5de8a' : shade(potC, 0.35);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ell(x, y + 1, s * 0.42, s * 0.14);
  ctx.fill();
  const g = ctx.createLinearGradient(x - s * 0.45, 0, x + s * 0.45, 0);
  g.addColorStop(0, dark);
  g.addColorStop(.4, lite);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.14, y);
  ctx.bezierCurveTo(x - s * 0.52, y - s * 0.1, x - s * 0.5, y - s * 0.62, x - s * 0.16, y - s * 0.72);
  ctx.lineTo(x + s * 0.16, y - s * 0.72);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.62, x + s * 0.52, y - s * 0.1, x + s * 0.14, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,15,5,.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = body;
  ctx.fillRect(x - s * 0.11, y - s * 0.9, s * 0.22, s * 0.2);
  ctx.fillStyle = lite;
  ell(x, y - s * 0.9, s * 0.17, s * 0.06);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = eagle ? '#5c3f0c' : 'rgba(30,10,4,.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.36, y - s * 0.42);
  ctx.quadraticCurveTo(x, y - s * 0.3, x + s * 0.36, y - s * 0.42);
  ctx.stroke();
  if (eagle) {
    ctx.fillStyle = '#5c3f0c';
    ctx.font = `700 ${Math.round(s * 0.3)}px Marcellus SC, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', x, y - s * 0.38);
  }
}
/* spriteBox — approximate screen box a pillar, player or NPC covers at (x, y); see-through uses it to tell whether a sprite hides a tile behind it. TWEAK: the box sizes. */
function spriteBox(kind, x, y) {
  const h = kind === 'pillar' ? TW * 1.35 + TW * 0.5 : kind === 'player' ? TW * 0.75 : TW * 0.55;
  const w = kind === 'pillar' ? TW * 0.34 : TW * 0.32;
  return {
    x0: x - w,
    x1: x + w,
    y0: y - h,
    y1: y + TH * 0.1
  };
}
let DRAW_EMPTY = false; // v0.42: the seat map's snapshot — the sand without anyone on it
/* draw — repaints the whole canvas: sizes TW/TH/OX/OY to the window, then rim, stands, tiles and zone tints, event marks, tunnels, spikes, rubble, corpses, blood, crew, floor tokens, chest and highlights,
   then pillars/beasts/gladiators sorted back to front, aggro lines, attack rings, fan flags, Flavius and effects.
   TWEAK: the tile-size divisors (16.4 / 13.8 tiles wide, 14.2 / 12.4 on phones; 10.3 / 9.5 tall), minimum TW 20, the 230 px kept for the action dock, highlight colors. */
function draw() {
  if (HEADLESS) return;
  if (S && S.snap && !S.over) return; /* v0.42: nothing to watch while the event snaps to its end */
  const wrap = cv.parentElement;
  const Wd = wrap.clientWidth;
  // fit the arena (and the stands) to the window so the action dock below it stays in view
  const fitH = SETTINGS.fit === false ? 1e9 : Math.max(360, innerHeight - 230);
  const mob9 = innerWidth <= 700;
  TW = Math.max(20, Math.floor(Math.min(Wd / (STANDS ? mob9 ? 14.2 : 16.4 : mob9 ? 12.4 : 13.8), fitH / (STANDS ? 10.3 : 9.5)))); /* v0.51: on a phone the arena fills the width; the outer benches may crop */
  TH = TW / 2;
  OX = Wd / 2;
  OY = TW * (STANDS ? 2.3 : 1.9);
  const Hd = Math.ceil(OY + N * TH + TW * (STANDS ? 2.1 : 1.1));
  {
    const z = typeof duelCam === 'function' ? duelCam() : 1;
    if (z > 1.001) {
      TW = TW * z;
      TH = TW / 2;
      OX = Wd / 2;
      OY = Hd * 0.56 - N * TH / 2;
    }
  } /* v0.46: the final duel camera leans in on the centre of the sand */
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.round(Wd * dpr);
  cv.height = Math.round(Hd * dpr);
  cv.style.height = Hd + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, Wd, Hd);
  if (!S) return;
  computeHL();
  const tA = iso(0, 0),
    tB = iso(0, N),
    tC = iso(N, N),
    tD = iso(N, 0);
  ctx.beginPath();
  ctx.moveTo(tA.x, tA.y - 10);
  ctx.lineTo(tB.x + 16, tB.y);
  ctx.lineTo(tC.x, tC.y + 10);
  ctx.lineTo(tD.x - 16, tD.y);
  ctx.closePath();
  ctx.fillStyle = TB.rim;
  ctx.fill();
  ctx.fillStyle = shade(TB.rim, -0.3);
  ctx.beginPath();
  ctx.moveTo(tD.x - 16, tD.y);
  ctx.lineTo(tC.x, tC.y + 10);
  ctx.lineTo(tC.x, tC.y + 10 + TW * 0.35);
  ctx.lineTo(tD.x - 16, tD.y + TW * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(TB.rim, -0.45);
  ctx.beginPath();
  ctx.moveTo(tC.x, tC.y + 10);
  ctx.lineTo(tB.x + 16, tB.y);
  ctx.lineTo(tB.x + 16, tB.y + TW * 0.35);
  ctx.lineTo(tC.x, tC.y + 10 + TW * 0.35);
  ctx.closePath();
  ctx.fill();
  // stadium seating (rulebook p.35 seating chart): 8 sections, 2 per quadrant, one per gladiator
  if (STANDS) drawStands();
  const [za, zb] = ZONES[RD().zone];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    tilePath(r, c);
    ctx.fillStyle = (r + c) % 2 ? TB.tileA : TB.tileB;
    if (isNaum() && !(S.drained || S.drainLine != null && r + c <= S.drainLine)) {
      const t = nTerr(r, c);
      ctx.fillStyle = t === 'ship' ? (r + c) % 2 ? '#8a6440' : '#7d5a39' : t === 'solid' ? '#9c9585' : (r + c) % 2 ? '#4f8f97' : '#46838b';
    }
    if (isChariot() && inPlayerZone(r, c)) ctx.fillStyle = (r + c) % 2 ? '#d8b39c' : '#cda58e';
    ctx.fill();
    if (typeof drawShipTile === 'function') drawShipTile(r, c); /* v0.58: the printed deck art, tile by tile */
    if (isChariot() && chHatched(r, c)) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(60,40,30,.45)';
      ctx.lineWidth = 2;
      const m = center(r, c);
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(m.x - TW / 2 + i * TW * 0.18, m.y - TH / 2);
        ctx.lineTo(m.x - TW / 2 + i * TW * 0.18 + TW * 0.4, m.y + TH / 2);
        ctx.stroke();
      }
      ctx.restore();
      tilePath(r, c);
    }
    if (isChariot() && CH_GATES.some(([a, b]) => a === r && b === c)) {
      ctx.fillStyle = 'rgba(240,207,125,.35)';
      ctx.fill();
    }
    for (const n of S.npcs) if (n.zone && n.alive && n.tamedBy == null && r >= n.zone[0] && r <= n.zone[1] && c >= n.zone[2] && c <= n.zone[3]) {
      ctx.fillStyle = ZONE_TINT[n.t];
      ctx.fill();
    }
    if (!inZone(r, c) && !S.zoneFull) {
      ctx.fillStyle = TB.outZone;
      ctx.fill();
    } // v0.34: after the post-show the ropes are down — full board
    ctx.strokeStyle = TB.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // exit / capture tiles
  if (S.evKey === 'orpheus' || S.evKey === 'goldenEagle') for (const p of S.players) {
    if (!p.alive) continue;
    tilePath(p.start[0], p.start[1], 3);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (S.capture) {
    tilePath(S.capture.r, S.capture.c, 2);
    ctx.fillStyle = 'rgba(240,207,125,.45)';
    ctx.fill();
    ctx.strokeStyle = '#f0cf7d';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  if (isChariot()) {
    /* seg — dashed line between two grid corners (the chariot start and finish lines). */
    const seg = (r1, c1, r2, c2, col) => {
      const a = iso(r1, c1),
        b = iso(r2, c2);
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    seg(10, 10, 10, 13, '#9bd070');
    seg(10, 10, 13, 10, '#c0433a');
    for (const q of S.players) if (q.alive && q.ch && !q.ch.mounted) {
      const m = center(q.ch.cr, q.ch.cc);
      drawWheel(m.x, m.y, q.color);
    }
  }
  if (isNaum() && !S.drained) {
    for (const d of S.doors) {
      tilePath(d.r, d.c, TW * 0.1);
      ctx.fillStyle = '#6a4a2c';
      ctx.fill();
      ctx.strokeStyle = '#3a2616';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    for (const w of S.waterTok) {
      const m = center(w.r, w.c);
      ctx.fillStyle = 'rgba(220,235,240,.55)';
      ell(m.x, m.y, TW * 0.14, TW * 0.07);
      ctx.fill();
      ctx.strokeStyle = '#2c5a60';
      ctx.stroke();
    }
    const m = center(6, 6);
    ctx.fillStyle = '#bdb3a0';
    ell(m.x, m.y, TW * 0.2, TW * 0.1);
    ctx.fill();
    ctx.strokeStyle = '#6d6558';
    ctx.stroke();
  }
  if (RD().zone > 1 && !S.zoneFull) {
    const a = iso(za, za),
      b = iso(za, zb + 1),
      c2 = iso(zb + 1, zb + 1),
      d = iso(zb + 1, za);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.strokeStyle = '#f0cf7d';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.font = `${Math.round(TW * 0.24)}px IBM Plex Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#b39d80';
  for (let r = 0; r < N; r++) {
    const m = center(r, -0.9);
    ctx.fillText(ROWL[r], m.x, m.y);
  }
  for (let c = 0; c < N; c++) {
    const m = center(-0.9, c);
    ctx.fillText(COLL[c], m.x, m.y);
  }
  const stA = typeof startTileAlpha === 'function' ? startTileAlpha() : 1; /* v0.57: the numbered start marks fade once the match begins */
  if (!isChariot() && !isNaum() && stA > 0) STARTS.slice(0, Math.max(4, S.players.length)).forEach(([r, c], i) => {
    ctx.globalAlpha = stA;
    const m = center(r, c);
    ctx.fillStyle = 'rgba(60,20,10,.55)';
    ell(m.x, m.y, TW * 0.2, TW * 0.1);
    ctx.fill();
    ctx.fillStyle = '#f0cf7d';
    ctx.font = `${Math.round(TW * 0.2)}px Marcellus SC, serif`;
    ctx.fillText(i + 1, m.x, m.y + 1);
    ctx.globalAlpha = 1;
  });
  for (const t of S.tunnels) {
    const sealed = typeof tunnelUsable === 'function' && !tunnelUsable(t);
    const exitNow = S.players.some(other => other.alive && other.underground && other.r === t.r && other.c === t.c) || S.tunExit && S.tunExit.r === t.r && S.tunExit.c === t.c && S.tunExit.until > S.turnNo;
    const img = IMG[exitNow ? 'tunnel_open' : 'tunnel_door']; /* v0.53: the door side by default; the dark shaft side marks the exit a gladiator came up through */
    if (img && img.complete && img.naturalWidth) {
      // the printed square tunnel tokens: an open shaft, or the barred door when sealed
      ctx.save();
      tilePath(t.r, t.c, TW * 0.08);
      ctx.clip();
      const m = center(t.r, t.c);
      ctx.drawImage(img, m.x - TW * 0.78, m.y - TW * 0.58, TW * 1.56, TW * 1.16);
      if (sealed) {
        ctx.fillStyle = 'rgba(10,5,3,.5)';
        ctx.fillRect(m.x - TW, m.y - TW, TW * 2, TW * 2);
      }
      ctx.restore();
      tilePath(t.r, t.c, TW * 0.08);
      ctx.strokeStyle = '#7a6048';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      tilePath(t.r, t.c, TW * 0.12);
      ctx.fillStyle = '#3a2b20';
      ctx.fill();
      ctx.strokeStyle = '#7a6048';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      const m = center(t.r, t.c);
      ctx.strokeStyle = '#5c4634';
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(m.x + i * TW * 0.07 - TW * 0.12, m.y - TW * 0.04 + i * TW * 0.035);
        ctx.lineTo(m.x + i * TW * 0.07 + TW * 0.12, m.y + TW * 0.04 + i * TW * 0.035);
        ctx.stroke();
      }
    }
  }
  {
    const sh9 = S.clean && S.clean.spikeH < 1 ? Math.max(0, S.clean.spikeH) : 1; // v0.33: the winches lower the spikes during the post-show
    for (const s of S.spikes) {
      tilePath(s.r, s.c, TW * 0.08);
      ctx.fillStyle = THEME.spike || '#6d6862';
      ctx.fill();
      const m = center(s.r, s.c);
      ctx.fillStyle = shade(THEME.spike || '#6d6862', 0.55);
      if (sh9 > 0.03) for (const [dx, dy] of [[-.14, 0], [.14, 0], [0, -.07], [0, .07]]) {
        const x = m.x + dx * TW,
          y = m.y + dy * TW;
        ctx.beginPath();
        ctx.moveTo(x - TW * 0.05, y + 2);
        ctx.lineTo(x, y - TW * 0.18 * sh9);
        ctx.lineTo(x + TW * 0.05, y + 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  // rubble where pillars were toppled
  for (const rb of S.rubble || []) for (const [k, sz] of [[0, 1], [1, .75], [2, .5]]) {
    const r = rb.r + rb.dr * k,
      c = rb.c + rb.dc * k;
    if (!inB(r, c)) continue;
    const m = center(r, c);
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4 + rb.r * 1.3 + k,
        x = m.x + Math.cos(a) * TW * 0.18 * sz,
        y = m.y + Math.sin(a) * TW * 0.08 * sz;
      ctx.fillStyle = i % 2 ? THEME.rubble || '#bdb3a0' : shade(THEME.rubble || '#bdb3a0', -0.15);
      ctx.beginPath();
      ctx.ellipse(x, y, TW * 0.06 * sz + 1, TW * 0.035 * sz + 1, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // piles and corpses — v0.33: the fallen LIE where they fell (token on its side) until the crew carts them out
  for (const pl of S.piles) {
    if (pl.gone || pileEmpty(pl) && !pl.corpse) continue;
    const m = center(pl.r, pl.c);
    if (pl.corpse) {
      if (SETTINGS.gore !== false && pl.cls && !pl.retiredOut) {
        const base = typeof tokenForCls === 'function' ? tokenForCls(pl.cls) : null;
        if (base) {
          drawCorpseFig(m, pl.sev && Object.values(pl.sev).some(Boolean) ? {
            ...base,
            sev: pl.sev
          } : base, pl.color);
          continue;
        }
      }
      ctx.fillStyle = shade(pl.color, -0.45);
      ell(m.x, m.y, TW * 0.3, TW * 0.15);
      ctx.fill();
      ctx.strokeStyle = pl.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(240,220,200,.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(m.x - TW * 0.1, m.y - TW * 0.05);
      ctx.lineTo(m.x + TW * 0.1, m.y + TW * 0.05);
      ctx.moveTo(m.x + TW * 0.1, m.y - TW * 0.05);
      ctx.lineTo(m.x - TW * 0.1, m.y + TW * 0.05);
      ctx.stroke();
    } else {
      ctx.fillStyle = pl.color;
      ell(m.x + TW * 0.18, m.y + TW * 0.04, TW * 0.09, TW * 0.045);
      ctx.fill();
      ctx.strokeStyle = pl.owner < 0 ? '#f5ead2' : '#1a120c';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  // slain beasts and NPCs stay in the sand as corpses too, until the carts come
  if (SETTINGS.gore !== false) for (const n of S.npcs) if (!n.alive && !n.gone) {
    const tk = typeof tokenForNPC === 'function' ? tokenForNPC(n) : null;
    drawCorpseFig(center(n.r, n.c), tk && n.t === 'tholo' ? {
      ...tk,
      headless: true
    } : tk, null);
  } // v0.36: Tholo falls headless
  // v0.32 THE SAND REMEMBERS: blood left by severed limbs, eliminations and dragging stumps (Settings → Visuals)
  if (SETTINGS.gore !== false && S.blood && S.blood.length) for (const B of S.blood) {
    const m = center(B.r, B.c);
    const R9 = mulberry32(B.seed || 1);
    /* rr — next number from this splash's seeded random generator, so blood looks the same every frame. */
    const rr = () => R9.next();
    ctx.save();
    ctx.globalAlpha = B.kind === 'drop' ? 0.5 : 0.72;
    ctx.fillStyle = B.kind === 'elim' ? '#6e120c' : '#8a1c14';
    const k = B.kind === 'elim' ? 9 : B.kind === 'limb' ? 5 : 2;
    for (let i = 0; i < k; i++) {
      const a = rr() * Math.PI * 2,
        d = rr() * (B.kind === 'elim' ? 0.42 : 0.26);
      ell(m.x + Math.cos(a) * TW * d, m.y + Math.sin(a) * TW * d * 0.5, TW * (B.kind === 'drop' ? 0.03 : 0.05 + rr() * 0.06), TW * (B.kind === 'drop' ? 0.018 : 0.03 + rr() * 0.03));
      ctx.fill();
    }
    if (B.kind === 'elim') {
      ctx.globalAlpha = 0.6;
      ell(m.x, m.y, TW * 0.3, TW * 0.15);
      ctx.fill();
    }
    ctx.restore();
  }
  if (S.clean && S.clean.crew) drawCleanCrew();
  for (const f of S.floor) {
    const m = center(f.r, f.c);
    if (f.kind === 'wheel') {
      drawWheel(m.x, m.y, '#caa46a');
      continue;
    }
    if (f.kind === 'horse') {
      ctx.fillStyle = '#8a5a34';
      ell(m.x, m.y, TW * 0.2, TW * 0.1);
      ctx.fill();
      ctx.fillStyle = '#f5e8cc';
      ctx.font = `700 ${Math.round(TW * 0.16)}px IBM Plex Mono, monospace`;
      ctx.fillText('H', m.x, m.y + 1);
      continue;
    }
    // a thrown weapon in the sand is just a small tracker in the thrower's color, like a dropped pile
    if (f.kind === 'weapon') {
      const o = S.players[f.owner];
      ctx.fillStyle = o ? o.color : '#d7dde2';
      ell(m.x - TW * 0.18, m.y + TW * 0.04, TW * 0.09, TW * 0.045);
      ctx.fill();
      ctx.strokeStyle = '#f5ead2';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      continue;
    }
    if (typeof drawFloorTok === 'function' && drawFloorTok(f, m)) continue; /* v0.47: the printed token, laid on the sand */
    const eag = f.kind === 'eagle';
    ctx.fillStyle = eag ? '#f0cf7d' : f.kind === 'key' ? '#9aa4ad' : '#d6ab4c';
    ell(m.x, m.y, TW * (eag ? 0.22 : 0.16), TW * (eag ? 0.11 : 0.08));
    ctx.fill();
    ctx.strokeStyle = '#6b4d17';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#3a2508';
    ctx.font = `700 ${Math.round(TW * 0.16)}px IBM Plex Mono, monospace`;
    ctx.fillText(eag ? 'E' : f.kind === 'key' ? 'K' : OFFER[f.key]?.g || '?', m.x, m.y + 1);
  }
  if (S.chest && S.chest.held == null) {
    const m = center(S.chest.r, S.chest.c);
    const w = TW * 0.22,
      h = TW * 0.16;
    ctx.fillStyle = THEME.chestWood || '#6a4520';
    ctx.fillRect(m.x - w, m.y - h, w * 2, h);
    ctx.fillStyle = THEME.chestGold || '#d6ab4c';
    ctx.fillRect(m.x - w, m.y - h - 4, w * 2, 5);
    ctx.fillRect(m.x - 2, m.y - h, 4, h * 0.7);
  }
  // highlights
  for (const [k, h] of HL) {
    const r = Math.floor(k / N),
      c = k % N;
    tilePath(r, c, 2);
    const col = {
      move: TB.hlMove,
      cmove: TB.hlMove,
      atk: TB.hlAtk,
      catk: TB.hlAtk,
      push: TB.hlPush,
      topple: TB.hlPush,
      tunnel: 'rgba(90,140,200,.55)',
      rete: 'rgba(80,180,170,.5)'
    }[h.t];
    ctx.globalAlpha = TB.hlAlpha;
    ctx.fillStyle = col;
    ctx.fill();
    ctx.globalAlpha = 1;
    if ((h.t === 'move' || h.t === 'cmove') && TW > 30) {
      const m = center(r, c);
      ctx.fillStyle = 'rgba(50,20,0,.85)';
      ctx.font = `500 ${Math.round(TW * 0.22)}px IBM Plex Mono, monospace`;
      ctx.fillText(h.cost, m.x, m.y);
    }
  }
  if (hoverTile) {
    tilePath(hoverTile.r, hoverTile.c, 1);
    ctx.strokeStyle = '#efe3cc';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // see-through focus points
  const focus = [];
  if (hoverTile) focus.push(hoverTile);
  if (S.players[S.cur] && !S.over) {
    const p = S.players[S.cur];
    focus.push({
      r: p.r,
      c: p.c
    });
  }
  for (const k of HL.keys()) focus.push({
    r: Math.floor(k / N),
    c: k % N
  });
  /* alphaFor — see-through opacity for a sprite: fixed when X-ray is on or off; in auto, faded when it covers a hovered, current or highlighted tile behind it.
     TWEAK: 0.3 / 0.55 (on) and 0.28 / 0.45 (auto) for pillars / other pieces. */
  const alphaFor = (kind, r, c) => {
    if (XRAY === 'on') return kind === 'pillar' ? 0.3 : 0.55;
    if (XRAY === 'off') return 1;
    const m = center(r, c);
    const b = spriteBox(kind, m.x, m.y);
    for (const f of focus) {
      if (f.r + f.c >= r + c) continue;
      const fm = center(f.r, f.c);
      if (fm.x > b.x0 && fm.x < b.x1 && fm.y > b.y0 && fm.y < b.y1) return kind === 'pillar' ? 0.28 : 0.45;
    }
    return 1;
  };
  const objs = [];
  for (const pl of S.pillars) objs.push({
    d: pl.r + pl.c,
    f: () => {
      ctx.globalAlpha = alphaFor('pillar', pl.r, pl.c);
      drawPillar(pl);
      ctx.globalAlpha = 1;
    }
  });
  if (!DRAW_EMPTY) for (const n of S.npcs) if (n.alive && !n.out) objs.push({
    d: n.r + n.c + .1,
    f: () => {
      ctx.globalAlpha = alphaFor('npc', n.r, n.c);
      drawNPC(n);
      ctx.globalAlpha = 1;
    }
  });
  if (!DRAW_EMPTY) for (const p of S.players) if (p.alive && !p.exited) objs.push({
    d: p.r + p.c + .2,
    f: () => {
      if (p.underground) {
        drawUnderground(p);
        return;
      } /* v0.41: underground = off the board; only the exit is marked */
      ctx.globalAlpha = alphaFor('player', p.r, p.c);
      drawPlayer(p);
      ctx.globalAlpha = 1;
    }
  });
  objs.sort((a, b) => a.d - b.d).forEach(o => o.f());
  // aggro tethers: each wild NPC points at its single aggro target
  for (const n of S.npcs) {
    if (!n.alive || n.out || n.aggro == null || n.tamedBy != null) continue;
    const q = S.players[n.aggro];
    if (!q || !q.alive || q.exited) continue;
    const a = center(n.r, n.c),
      b = center(q.r, q.c);
    ctx.strokeStyle = 'rgba(224,90,68,.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - TW * 0.2);
    ctx.lineTo(b.x, b.y - TW * 0.3);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for (const [k, h] of HL) if (h.t === 'atk' || h.t === 'rete' || h.t === 'catk') {
    const r = Math.floor(k / N),
      c = k % N,
      m = center(r, c);
    ctx.strokeStyle = h.t === 'rete' ? '#62d0c0' : TB.ring;
    ctx.lineWidth = 2.5;
    ell(m.x, m.y, TW * 0.36, TW * 0.18);
    ctx.stroke();
  }
  try {
    if (typeof drawSugTile === 'function') drawSugTile();
  } catch (e) {}
  try {
    if (typeof drawTosses === 'function') drawTosses();
  } catch (e) {}
  if (STANDS && typeof drawFanFlags === 'function') try {
    drawFanFlags();
  } catch (e) {} // v0.35: banners above the board — the front tiers no longer lose them to the sand
  if (STANDS) drawEmotes(); // above the board: front-row shouts used to disappear under the sand
  drawFlavius();
  drawFX();
  renderBubbles();
  try {
    if (typeof duelVignette === 'function') duelVignette(Wd, Hd);
    if (typeof duelUI === 'function') duelUI();
  } catch (e) {}
}
/* drawWheel — draws a chariot wheel (spare or under a mounted chariot) ringed in col. */
function drawWheel(x, y, col) {
  ctx.fillStyle = '#6a4520';
  ell(x, y, TW * 0.34, TW * 0.17);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = '#caa46a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(a) * TW * 0.3, y - Math.sin(a) * TW * 0.15);
    ctx.lineTo(x + Math.cos(a) * TW * 0.3, y + Math.sin(a) * TW * 0.15);
    ctx.stroke();
  }
}
/* drawPillar — draws a pillar (base, fluted shaft, cap) with one amphora per Blessings pot stacked on top, and an xN label for 2+ pots.
   TWEAK: radius 0.17 TW, height 0.95 TW, THEME.pillar / pillarBase colors. */
function drawPillar(pl) {
  const m = center(pl.r, pl.c);
  const rx = TW * 0.17,
    h = TW * 0.95;
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ell(m.x + 3, m.y + 2, TW * 0.3, TW * 0.14);
  ctx.fill();
  ctx.fillStyle = THEME.pillarBase || '#bdb3a0';
  ctx.fillRect(m.x - TW * 0.26, m.y - TW * 0.08, TW * 0.52, TW * 0.1);
  const pc = THEME.pillar || '#ece4d4';
  const g = ctx.createLinearGradient(m.x - rx, 0, m.x + rx, 0);
  g.addColorStop(0, shade(pc, -0.34));
  g.addColorStop(.45, pc);
  g.addColorStop(1, shade(pc, -0.27));
  ctx.fillStyle = g;
  ctx.fillRect(m.x - rx, m.y - h, rx * 2, h - TW * 0.06);
  ctx.strokeStyle = 'rgba(80,70,55,.4)';
  ctx.lineWidth = 1;
  for (const f of [-.5, 0, .5]) {
    ctx.beginPath();
    ctx.moveTo(m.x + f * rx, m.y - h + 4);
    ctx.lineTo(m.x + f * rx, m.y - TW * 0.1);
    ctx.stroke();
  }
  ctx.fillStyle = shade(THEME.pillar || '#ece4d4', -0.07);
  ctx.fillRect(m.x - TW * 0.24, m.y - h - TW * 0.09, TW * 0.48, TW * 0.1);
  let y = m.y - h - TW * 0.09;
  // Blessings pots are clay amphorae chained atop the pillar; the token art only appears when one shatters
  pl.pots.forEach(() => {
    drawPot(m.x, y, TW * 0.46, false);
    y -= TW * 0.44;
  });
  if (pl.pots.length > 1 && TW > 28) {
    ctx.fillStyle = '#f0cf7d';
    ctx.font = `500 ${Math.round(TW * 0.18)}px IBM Plex Mono, monospace`;
    ctx.fillText('×' + pl.pots.length, m.x + TW * 0.34, m.y - h);
  }
}
/* drawNPC — draws a beast: owner-colored ring if tamed, red ring if Raged, then a figure, standee or lettered cylinder, an HP bar (green wild, red with aggro, blue tamed), carried item, chest and net. Zora on a pillar is drawn raised.
   TWEAK: HP bar colors and the Fazed / Raged image filters. */
function drawNPC(npc) {
  const m = center(npc.r, npc.c),
    T = NPCT[npc.t];
  const big = ['tholo', 'lion', 'bear', 'commodus'].includes(npc.t) || T.custom && T.hp >= 12;
  const rx = TW * (big ? 0.27 : 0.22),
    h = TW * (big ? 0.34 : 0.24);
  if (npc.tamedBy != null) {
    const o = S.players[npc.tamedBy];
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 2.5;
    ell(m.x, m.y, rx * 1.35, rx * 0.68);
    ctx.stroke();
  }
  if (npc.t === 'zora' && pillarAt(npc.r, npc.c)) m.y -= TW * 1.05;
  const st = npcStats(npc);
  if (npc.alive && st.state === 'Raged') {
    ctx.strokeStyle = 'rgba(230,70,50,.85)';
    ctx.lineWidth = 2;
    ell(m.x, m.y, rx * 1.25, rx * 0.62);
    ctx.stroke();
  }
  const sk = standeeKeyNPC(npc);
  const sh = sk ? standeeSize(sk) : TW * 0.8;
  const filt = st.state === 'Fazed' ? 'brightness(.6) saturate(.6)' : st.state === 'Raged' ? 'saturate(1.4) contrast(1.1)' : '';
  const zTop = npc.t === 'zora' && typeof drawZoraMini === 'function' ? drawZoraMini(m.x, m.y + TW * 0.04, filt) : null; /* v0.59: his own mini (74-zora) */
  const stTop = zTop != null ? zTop : wantFigure(!!T.custom || npc.t === 'zora' && tokenStyle() === 'figure') ? drawFigureTok(tokenForNPC(npc), m.x, m.y + TW * 0.02, TW * 1.25, {
    filter: filt
  }) : sk && npc.t !== 'zora' ? drawStandee(sk, m.x, m.y + TW * 0.04, sh, {
    filter: st.state === 'Fazed' ? 'brightness(.6) saturate(.6)' : st.state === 'Raged' ? 'saturate(1.4) contrast(1.1)' : ''
  }) : null;
  if (stTop != null) {
    const maxhp = Math.max(T.hp, npc.hp);
    const bw = TW * 0.5,
      y2 = stTop - 6;
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(m.x - bw / 2, y2, bw, 4);
    ctx.fillStyle = npc.tamedBy != null ? '#7fb4e0' : npc.aggro != null ? '#e05a44' : '#9cc46e';
    ctx.fillRect(m.x - bw / 2, y2, bw * Math.max(0, npc.hp) / maxhp, 4);
    if (npc.carry) {
      ctx.fillStyle = '#f0cf7d';
      ell(m.x + TW * 0.28, stTop + 8, TW * 0.08, TW * 0.08);
      ctx.fill();
    }
    if (S.chest && S.chest.held === npc.id) {
      ctx.fillStyle = '#d6ab4c';
      ctx.fillRect(m.x + TW * 0.2, m.y - TW * 0.3, TW * 0.16, TW * 0.11);
    }
    if (npc.netted) {
      ctx.strokeStyle = '#62d0c0';
      ctx.lineWidth = 1;
      ell(m.x, m.y - sh / 2, TW * 0.35, sh * 0.45);
      ctx.stroke();
    }
    return;
  }
  drawCyl(m.x, m.y, rx, h, st.state === 'Fazed' ? shade(T.col, -0.3) : T.col);
  if (npc.carry) {
    ctx.fillStyle = '#f0cf7d';
    ell(m.x + rx, m.y - h, TW * 0.08, TW * 0.08);
    ctx.fill();
  }
  ctx.fillStyle = '#fff6e6';
  ctx.font = `700 ${Math.round(TW * 0.24)}px Marcellus SC, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(T.g, m.x, m.y - h + 1);
  const maxhp = Math.max(T.hp, npc.hp);
  const bw = TW * 0.5,
    y = m.y - h - TW * 0.2;
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  ctx.fillRect(m.x - bw / 2, y, bw, 4);
  ctx.fillStyle = npc.tamedBy != null ? '#7fb4e0' : npc.aggro != null ? '#e05a44' : '#9cc46e';
  ctx.fillRect(m.x - bw / 2, y, bw * Math.max(0, npc.hp) / maxhp, 4);
  if (S.chest && S.chest.held === npc.id) {
    ctx.fillStyle = '#d6ab4c';
    ctx.fillRect(m.x + rx * 0.6, m.y - h * 0.6, TW * 0.16, TW * 0.11);
  }
  if (npc.netted) {
    ctx.strokeStyle = '#62d0c0';
    ctx.lineWidth = 1;
    ell(m.x, m.y - h / 2, rx * 1.2, h * 0.8);
    ctx.stroke();
  }
}
/* drawPlayer — draws a gladiator: gold ring on whoever's turn it is, then a figure or standee with color/team rings and a color pennant (clipped at the waterline when swimming);
   falls back to a cylinder with the class initial. Also marks the Eagle carrier, chest carrier and netted. */
function drawPlayer(player) {
  const m = center(player.r, player.c);
  const rx = TW * 0.25,
    h = TW * 0.55;
  if (player.ch && player.ch.mounted) drawWheel(m.x, m.y, player.color);
  if (isNaum() && player.onDoor != null) {}
  if (S.players[S.cur] === player && !S.over) {
    ctx.strokeStyle = '#f0cf7d';
    ctx.lineWidth = 2.5;
    ell(m.x, m.y, TW * 0.4, TW * 0.2);
    ctx.stroke();
  }
  {
    const sk = standeeKeyCls(player.cls);
    const sh = sk ? standeeSize(sk) : TW * 1.25;
    const useFig = wantFigure(hasCustomToken(player.cls));
    if (useFig ? tokenImg(tokenForP(player)) : sk && standeesOn() && standeeImg(sk)) {
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 3;
      ell(m.x, m.y + TW * 0.03, TW * 0.3, TW * 0.15);
      ctx.stroke();
      if (EV().teams || EV().coop) {
        ctx.strokeStyle = teamColor(player.team);
        ctx.lineWidth = 1.5;
        ell(m.x, m.y + TW * 0.03, TW * 0.36, TW * 0.18);
        ctx.stroke();
      }
      /* drawMe — draws the figure or standee and returns its top y. */
      const drawMe = () => useFig ? drawFigureTok(tokenForP(player), m.x, m.y + TW * 0.02, TW * 1.3) : drawStandee(sk, m.x, m.y + TW * 0.04, sh);
      let top;
      if (swimming(player)) { /* v0.59: waist-deep — the figure sinks half a tile and the water closes over its legs */
        const sink = TW * 0.36, wl = m.y + TW * 0.02, rx2 = TW * 0.3, ry2 = TW * 0.12;
        ctx.fillStyle = 'rgba(30,70,78,.55)';
        ell(m.x, wl, rx2, ry2);
        ctx.fill(); /* the dark water round them */
        ctx.save();
        ctx.beginPath();
        ctx.rect(m.x - TW, wl - TW * 2.6, TW * 2, TW * 2.6);
        ctx.clip();
        ctx.translate(0, sink);
        top = drawMe() + sink;
        ctx.restore();
        ctx.strokeStyle = 'rgba(225,244,248,.9)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(m.x, wl, rx2, ry2, 0, 0, Math.PI);
        ctx.stroke(); /* the ripple in front of them */
        ctx.strokeStyle = 'rgba(225,244,248,.35)';
        ctx.beginPath();
        ctx.ellipse(m.x, wl + TW * 0.02, rx2 * 1.4, ry2 * 1.45, 0, 0.15, Math.PI - 0.15);
        ctx.stroke();
      } else top = drawMe();
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.moveTo(m.x, top - 2);
      ctx.lineTo(m.x - 5, top - 9);
      ctx.lineTo(m.x + 5, top - 9);
      ctx.closePath();
      ctx.fill(); // a pennant over the head in the player's color
      if (player.eagle) {
        ctx.fillStyle = '#f0cf7d';
        ell(m.x + TW * 0.25, top + 8, TW * 0.1, TW * 0.1);
        ctx.fill();
        ctx.fillStyle = '#5c3f0c';
        ctx.font = `700 ${Math.round(TW * 0.13)}px Marcellus SC, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', m.x + TW * 0.25, top + 9);
      }
      if (player.carrying) {
        ctx.fillStyle = '#d6ab4c';
        ctx.fillRect(m.x - TW * 0.38, m.y - TW * 0.4, TW * 0.16, TW * 0.11);
      }
      if (player.netted) {
        ctx.strokeStyle = '#62d0c0';
        ctx.lineWidth = 1;
        ell(m.x, m.y - sh / 2, TW * 0.33, sh * 0.45);
        ctx.stroke();
      }
      return;
    }
  }
  if (swimming(player)) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(m.x - TW, m.y - TW * 2, TW * 2, TW * 2 - TW * 0.18);
    ctx.clip();
    drawCyl(m.x, m.y, rx, h, player.color, shade(player.color, 0.15));
    ctx.restore();
    ctx.strokeStyle = 'rgba(220,240,245,.8)';
    ctx.lineWidth = 1.5;
    ell(m.x, m.y - TW * 0.18, rx * 1.3, rx * 0.6);
    ctx.stroke();
  } else drawCyl(m.x, m.y, rx, h, player.color, shade(player.color, 0.15));
  ctx.strokeStyle = EV().teams || EV().coop ? teamColor(player.team) : '#f0cf7d';
  ctx.lineWidth = 1.5;
  ell(m.x, m.y - h, rx, rx * 0.5);
  ctx.stroke();
  ctx.fillStyle = '#1a120c';
  ctx.font = `${Math.round(TW * 0.26)}px Marcellus SC, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CLASSES[player.cls].name[0], m.x, m.y - h + 1);
  if (player.eagle) {
    ctx.fillStyle = '#f0cf7d';
    ell(m.x + rx * 0.9, m.y - h - 4, TW * 0.1, TW * 0.1);
    ctx.fill();
    ctx.fillStyle = '#5c3f0c';
    ctx.font = `700 ${Math.round(TW * 0.13)}px Marcellus SC, serif`;
    ctx.fillText('E', m.x + rx * 0.9, m.y - h - 3);
  }
  if (player.carrying) {
    ctx.fillStyle = '#d6ab4c';
    ctx.fillRect(m.x - rx * 1.4, m.y - h * 0.6, TW * 0.16, TW * 0.11);
  }
  if (player.netted) {
    ctx.strokeStyle = '#62d0c0';
    ctx.lineWidth = 1;
    ell(m.x, m.y - h / 2, rx * 1.3, h * 0.7);
    ctx.stroke();
  }
}
/* teamColor — ring color for a team letter (gold if unknown). TWEAK: the team colors. */
const teamColor = target => ({
  A: '#e0a33a',
  B: '#6fb0e6',
  C: '#9bd070',
  D: '#d07ad0',
  J: '#ff6a55',
  T: '#6fb0e6'
})[target] || '#f0cf7d';
/* pick — converts a mouse event to the board tile under it (the inverse of iso), or null when off the board. */
function pick(eventDef) {
  const b = cv.getBoundingClientRect();
  const x = eventDef.clientX - b.left,
    y = eventDef.clientY - b.top;
  const fr = ((y - OY) / (TH / 2) - (x - OX) / (TW / 2)) / 2,
    fc = ((x - OX) / (TW / 2) + (y - OY) / (TH / 2)) / 2;
  const r = Math.floor(fr),
    c = Math.floor(fc);
  return inB(r, c) ? {
    r,
    c
  } : null;
}
/* describeTile — hover text for a tile: who or what stands there, terrain, tokens, piles, zones and move cost. */
function describeTile(target) {
  if (!target || !S) return 'Hover or tap a tile to inspect it.';
  const {
    r,
    c
  } = target;
  const bits = [`<b>${tl(r, c)}</b>`];
  const p = playerAt(r, c),
    n = npcAt(r, c),
    pl = pillarAt(r, c);
  if (p && p.underground) bits.push(`⬇ ${nm(p)} is <b>underground</b> — surfaces on this tunnel at the start of their next turn, and cannot be attacked until then`);else if (p) bits.push(`${nm(p)} · Head ${p.hp.head}/${p.ap.head}AP · Chest ${p.hp.chest}/${p.ap.chest}AP · CF ${p.cf}${p.underground ? ' · underground' : ''}`);
  if (n) {
    const T = NPCT[n.t],
      st = npcStats(n);
    bits.push(`${nm(n)} (${npcKind(n.t)}) · ${n.hp} HP · MV ${st.mv} · ATK ${st.ap}${st.state ? ` · ${st.state}` : ''}${n.aggro != null ? ' · aggro on ' + S.players[n.aggro].name : ''}${n.tamedBy != null ? ' · tamed by ' + S.players[n.tamedBy].name : ''}`);
  }
  if (pl) bits.push(pl.pots.length ? `Pillar with ${pl.pots.length} Blessings pot${pl.pots.length > 1 ? 's' : ''} (contents hidden)` : 'Pillar');
  if (isNaum()) {
    const sh = shipAt(r, c);
    bits.push(sh ? `${sh.name} (Team ${sh.team}, ${Math.max(0, sh.hp)} HP)` : nTerr(r, c) === 'solid' ? 'Sunken pillar top (solid footing)' : 'Water');
    if (doorAt(r, c)) bits.push('Floating door (board for 2 movement)');
  }
  if (isChariot()) {
    if (chHatched(r, c)) bits.push('Cannot be traversed');else if (inPlayerZone(r, c)) bits.push('Player-only zone');else bits.push('Race track');
    if (CH_GATES.some(([a, b]) => a === r && b === c)) bits.push('Pillar gate');
  }
  if (tunnelAt(r, c)) bits.push(tunnelUsable(tunnelAt(r, c)) ? 'Tunnel' : 'Tunnel (sealed by a pillar)');
  if (spikeAt(r, c)) bits.push('Floor spike (2 damage on entry)');
  if (S.chest && S.chest.held == null && S.chest.r === r && S.chest.c === c) bits.push(`Arena Chest (locked, ${S.chest.weapons.length} inside)`);
  for (const f of S.floor) if (f.r === r && f.c === c) bits.push(f.kind === 'weapon' ? `${f.owner != null && S.players[f.owner] ? S.players[f.owner].name + "'s thrown" : 'Thrown'} ${f.w.n} (free to pick up)` : f.kind === 'wheel' ? 'Spare wheel' : f.kind === 'horse' ? 'Spare horse' : f.kind === 'eagle' ? 'Golden Eagle' : f.kind === 'key' ? 'Arena Key' : `Offering: ${OFFER[f.key].n} (${OFFER[f.key].s})`);
  for (const pile of pilesAt(r, c)) bits.push(`${pile.corpse ? 'Corpse of ' + pile.name : pile.owner < 0 ? 'Left in the sand' : 'Items dropped by ' + pile.name}: ${[...pile.weapons.map(weapon => weapon.n), ...pile.armor.map(a => a.n), pile.coin ? pile.coin + ' coin' : '', ...pile.items.map(i => itemInfo(i).n)].filter(Boolean).join(', ')}`);
  if (S.capture && S.capture.r === r && S.capture.c === c) bits.push('Golden Eagle capture tile');
  for (const b of S.npcs) if (b.zone && b.alive && b.tamedBy == null && inRect(b.zone, {
    r,
    c
  })) bits.push(`${b.name}'s zone`);
  if (!inZone(r, c)) bits.push('outside the playable zone');
  const q = quadOf({
    r,
    c
  });
  if (q && S.spect.length) bits.push(`Q${q}`);
  const h = HL.get(r * N + c);
  if (h && (h.t === 'move' || h.t === 'cmove')) bits.push(`move cost ${h.cost}`);
  return bits.join(' · ');
}
cv.addEventListener('mousemove', e => {
  const t = pick(e);
  if (JSON.stringify(t) !== JSON.stringify(hoverTile)) {
    hoverTile = t;
    $('#hover').innerHTML = describeTile(t) + (typeof ruleForTile === 'function' ? ruleForTile(t) : '');
    draw();
  }
});
cv.addEventListener('mouseleave', () => {
  hoverTile = null;
  draw();
});
cv.addEventListener('click', e => {
  const t = pick(e);
  if (!t) return;
  hoverTile = t;
  $('#hover').innerHTML = describeTile(t);
  onTile(t.r, t.c);
});
window.addEventListener('resize', () => draw());
window.addEventListener('keydown', e => {
  if ((e.key === 'x' || e.key === 'X') && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    cycleXray();
  }
});
/* cycleXray — cycles see-through mode auto -> on -> off (button or X key) and redraws. */
function cycleXray() {
  XRAY = {
    auto: 'on',
    on: 'off',
    off: 'auto'
  }[XRAY];
  $('#btnXray').textContent = 'See-through: ' + XRAY;
  draw();
}
$('#btnXray').onclick = cycleXray;

/* ================= AVATAR ================= */
/* hpColor — body color by HP share: tan at 80%+, orange at 50%+, red below, none when severed. TWEAK: the cutoffs and colors. */
function hpColor(victim, base) {
  if (victim <= 0) return 'none';
  const r = victim / base;
  return r >= 0.8 ? '#c9a27e' : r >= 0.5 ? '#c98a5e' : '#c0503a';
}
/* avatarSVG — builds the player-board body SVG: avatar image, fitted custom armor, red wound tint, steel sheen for AP, HP/AP number chips, severed marks, greaves and weapon labels.
   TWEAK: wound tint opacity (0.3 x share lost), AP sheen opacity 0.14 + 0.055 per AP. */
function avatarSVG(player) {
  // the player-board avatar (assets/avatar.png). Armor art lives BESIDE the HP/AP bars, not on the body:
  // here the body itself tells the story — steel sheen where AP protects a location, red as HP drains, a hard strike when it is severed.
  const parts = {
    head: {
      d: 'M58 24a17 23 0 1 1 34 0a17 23 0 1 1 -34 0z',
      cx: 75,
      cy: 47
    },
    // v0.33: helm sheen a touch lower still — squarely over the face
    chest: {
      d: 'M47 60h56l-3 40-4 35H54l-4-35z',
      cx: 75,
      cy: 97
    },
    rarm: {
      d: 'M22 64h26l-2 56-6 55H24l-2-55z',
      cx: 35,
      cy: 120
    },
    larm: {
      d: 'M102 64h26l2 56-2 55h-16l-6-55z',
      cx: 115,
      cy: 120
    },
    rleg: {
      d: 'M51 175h22l-1 63 1 62H53l-2-62z',
      cx: 62,
      cy: 238
    },
    lleg: {
      d: 'M77 175h22l2 62-2 63H79l-1-63z',
      cx: 88,
      cy: 238
    }
  };
  let s = `<svg viewBox="0 0 150 332" role="img" aria-label="${player.name}'s body: health and armor by location">`;
  s += `<defs><linearGradient id="met${player.id}" x1="0" x2="1"><stop offset="0" stop-color="#7d868f"/><stop offset=".45" stop-color="#e6ebef"/><stop offset="1" stop-color="#8a939c"/></linearGradient></defs>`;
  s += `<image href="${typeof assetURL === 'function' ? assetURL('avatar.png') : ASSET + 'avatar.png'}" x="7" y="6" width="136" height="301" opacity="0.96"/>`;
  // v0.39: custom armor fitted on the avatar in the Armor forge is WORN there (mirrored on the left side)
  if (typeof caOnBodySVG === 'function') for (const l of LOCS) {
    if (player.hp[l] <= 0) continue;
    for (const pc of player.pieces[l]) {
      const A = ARM[pc.key];
      const cu = A && A.caId ? (CUSTOM.armor || []).find(c => c.id === A.caId) : null;
      if (cu && cu.fit) s += caOnBodySVG(cu, pc.key, l === 'larm' || l === 'lleg');
    }
  }
  // wounds tint each location red as its HP drops; severed locations are struck out
  for (const l of LOCS) {
    const P = parts[l];
    const hp = player.hp[l];
    if (hp <= 0) {
      s += `<path d="${P.d}" fill="#1a0f0b" fill-opacity=".55" stroke="#d24a3a" stroke-width="1.8" stroke-dasharray="4 3"><title>${LOCN[l]} ${sevLabel(l).toLowerCase()}</title></path><text x="${P.cx}" y="${P.cy - 5}" fill="#ff6a55" font-size="16" font-weight="700" text-anchor="middle" dominant-baseline="middle">✕</text><text x="${P.cx}" y="${P.cy + 9}" fill="#ff8a70" font-size="7" font-family="IBM Plex Mono, monospace" text-anchor="middle" dominant-baseline="middle">${sevLabel(l).toUpperCase()}</text>`;
      continue;
    }
    const wound = 1 - hp / BASE_HP[l];
    s += `<path d="${P.d}" fill="${wound > 0 ? '#c0392b' : 'none'}" fill-opacity="${(wound * 0.3).toFixed(2)}" stroke="none"><title>${LOCN[l]}: ${hp} HP, ${player.ap[l]} AP${player.pieces[l].length ? ' \u00b7 ' + player.pieces[l].map(x => x.n).join(', ') : ''}</title></path>`;
    if (player.ap[l] > 0) s += `<path d="${P.d}" fill="url(#met${player.id})" fill-opacity="${(0.14 + player.ap[l] * 0.055).toFixed(2)}" stroke="#dfe5ea" stroke-opacity=".8" stroke-width="${(0.6 + player.ap[l] * 0.22).toFixed(1)}" pointer-events="none"/>`;
  }
  // HP / AP chips
  for (const l of LOCS) {
    const P = parts[l];
    if (player.hp[l] <= 0) continue;
    s += `<circle cx="${P.cx}" cy="${P.cy}" r="9" fill="#140f0b" fill-opacity=".8"/><text x="${P.cx}" y="${P.cy + 1}" fill="#efe3cc" font-size="10" font-family="IBM Plex Mono, monospace" text-anchor="middle" dominant-baseline="middle">${player.hp[l]}</text>`;
    if (player.ap[l] > 0) s += `<circle cx="${P.cx + 11}" cy="${P.cy - 10}" r="7" fill="#b9c1c9"/><text x="${P.cx + 11}" y="${P.cy - 9}" fill="#140f0b" font-size="8" font-weight="700" font-family="IBM Plex Mono, monospace" text-anchor="middle" dominant-baseline="middle">${player.ap[l]}</text>`;
  }
  if (greavesOn(player)) s += `<path d="M52 300h18M78 300h18" stroke="#d6ab4c" stroke-width="3"><title>Flavius' Greaves: +1 movement</title></path>`;
  /* wl — weapon name label for one hand ('fist' when empty; nothing if the arm is gone). */
  const wl = (a, x, anchor) => {
    const w = player['w' + a];
    if (!armAlive(player, a)) return '';
    return `<text x="${x}" y="196" fill="${w ? '#f0cf7d' : '#7d6a55'}" font-size="9" font-family="Alegreya Sans, sans-serif" text-anchor="${anchor}">${w ? w.n : 'fist'}</text>`;
  };
  s += wl('R', 2, 'start') + wl('L', 148, 'end');
  s += `<text x="8" y="60" fill="#c9a458" font-size="10" font-family="IBM Plex Mono, monospace">R</text><text x="136" y="60" fill="#7fa6c9" font-size="10" font-family="IBM Plex Mono, monospace">L</text>`;
  return s + '</svg>';
}
/* seg7 — a 7-segment HP or AP bar with the first victim segments filled; low adds the warning style. */
const seg7 = (victim, cls, low) => `<div class="seg7 ${cls === 'a' ? 'ap' : ''}">${Array.from({
  length: 7
}, (_, i) => `<i class="${i < victim ? cls + (low ? ' low' : '') : ''}"></i>`).join('')}</div>`;
/* sideBadge — small R/L badge for arm and leg locations. */
const sideBadge = l => LOCSIDE[l] ? `<span class="side-badge ${LOCSIDE[l]}" aria-label="${LOCSIDE[l] === 'R' ? 'right' : 'left'}">${LOCSIDE[l]}</span>` : '';
/* boardHTML — the full player-board panel: header, coin/CF/keys/trophies, avatar and location bars, status badges (bonuses, feelings, truces, team...), chariot, weapons, movement track, hand and class card.
   interactive shows the Use/Declare buttons. */
function boardHTML(player, interactive) {
  const badges = [];
  if (statDmgB(player) || hasCestus(player, 'R') || hasCestus(player, 'L')) badges.push(`<span class="badge good">+${statDmgB(player) + (hasCestus(player, 'R') || hasCestus(player, 'L') ? 1 : 0)} DMG${hasCestus(player, 'R') || hasCestus(player, 'L') ? ' (Cestus)' : ''}</span>`);
  if (greavesOn(player)) badges.push('<span class="badge good">+1 MV Greaves</span>');
  if (player.hercules) badges.push(`<span class="badge good">Hercules +${player.hercules}</span>`);
  if (player.focusNext) badges.push('<span class="badge gold">Focus! ready</span>');
  if (player.warded) badges.push('<span class="badge good">Ward active</span>');
  if (S && player.mercRound === S.ri) badges.push('<span class="badge good">+1 MV this round</span>');
  if (player.mercBonus) badges.push(`<span class="badge good">+${player.mercBonus} MV this turn</span>`);
  if (player.cpu && player.rel) {
    for (const q of S.players) {
      if (q === player || !q.alive) continue;
      const v = relOf(player, q);
      const st = relState(v);
      if (st[1] !== 'Neutral') badges.push(`<span class="badge ${v > 0 ? 'good' : 'bad'}" title="${esc(player.name)}'s feeling toward ${esc(q.name)}: ${v}">${st[2]} ${st[1]} toward ${esc(q.name)}</span>`);
    }
  }
  if (player.cpu && player.pers && S.over) {
    const P = player.pers;
    const top = PERS_KEYS.map(([k, l]) => [l, P[k]]).sort((a, b) => b[1] - a[1]).slice(0, 2);
    badges.push(`<span class="badge" title="${PERS_KEYS.map(([k, l]) => l + ' ' + P[k]).join(' · ')}">Priorities: ${top.map(([l, v]) => l + ' ' + v).join(', ')}</span>`);
  }
  if (player.netted) badges.push('<span class="badge bad">Netted</span>');
  if (player.carrying) badges.push('<span class="badge gold">Carrying chest (−1 MV)</span>');
  if (player.eagle) badges.push('<span class="badge gold">Golden Eagle</span>');
  if (player.captured.length) badges.push(`<span class="badge gold">Captured ${player.captured.length}/2</span>`);
  if (EV().teams || EV().coop) badges.push(`<span class="badge" style="border-color:${teamColor(player.team)}">Team ${player.team}</span>`);
  for (const q of S.players) if (q !== player && inTruce(player, q)) badges.push(`<span class="badge">Truce with ${q.name}</span>`);
  for (const n of S.npcs) if (n.alive && n.tamedBy === player.id) badges.push(`<span class="badge good">Ally: ${n.name}</span>`);
  if (player.noEagle) badges.push('<span class="badge bad">No Zora</span>');
  if (swimming(player)) badges.push('<span class="badge bad">Swimming: −1 MV, −1 range</span>');
  if (player.onDoor != null && isNaum()) badges.push('<span class="badge good">Riding a floating door</span>');
  for (const n of S.npcs) if (n.alive && n.tamedBy === player.id && n.carry) badges.push(`<span class="badge gold">${n.name} carries ${n.carry.label}</span>`);
  if (player.ch) {
    const ch = player.ch;
    badges.push(`<span class="badge gold">Lap ${ch.laps}/3</span>`, `<span class="badge ${ch.wheel ? 'good' : 'bad'}">Wheel ${ch.wheel ? ch.wheel.hp + ' HP' : 'missing (−2 MV)'}</span>`, `<span class="badge ${ch.horse ? 'good' : 'bad'}">${ch.horse ? `Horse ${ch.horse.sides[ch.horse.face].hp - ch.horse.dmg} HP · +${ch.horse.sides[ch.horse.face].mv} MV` : 'Horse missing'}</span>`);
  }
  const isCur = S.players[S.cur] === player && S.phase === 'action';
  return `<div class="pb-head" style="--pc:${player.color}">${clsPieceHTML(player.cls, 58, 'stnd phead') || '<span class="sw"></span>'}<div><div class="pname">${player.name}</div><div class="pcls">${CLASSES[player.cls].name} · ${CLASSES[player.cls].sub}${player.drafted ? ' (drafted)' : ''} · ${player.cpu ? 'CPU ' + cpuMind(player) : 'You'} · ${player.exited ? 'exited' : player.alive ? tl(player.r, player.c) : 'fallen'}</div>${typeof seatChipHTML === 'function' ? seatChipHTML(player) : ''}</div></div>
   <div class="econ"><div class="stat" title="${player.coinLog ? Object.entries(player.coinLog).map(([k2, v2]) => `${v2 > 0 ? '+' : ''}${v2} ${k2}`).join(String.fromCharCode(10)) : 'No coin has moved yet.'}"><span>Coin ⓘ</span><b>${ICO.coin} ${player.coin}</b></div><div class="stat" title="${player.cfLog && Object.keys(player.cfLog).length ? Object.entries(player.cfLog).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1])).map(([k2, v2]) => `${v2 > 0 ? '+' : ''}${v2} ${k2}`).join(String.fromCharCode(10)) : 'No Crowd Favor has moved yet.'}">${(() => {
    const rr = S.over && S.result ? S.result.rows.find(x => x.id === player.id) : null;
    return rr ? `<span title="The final Fate score — the same number the results show">Fate ⓘ</span><b>${ICO.wheat} ${rr.f}</b>` : `<span>CF ⓘ</span><b>${ICO.wheat} ${player.cf}</b>`;
  })()}${(() => {
    try {
      if (S.over && S.result) {
        const rr = S.result.rows.find(x => x.id === player.id);
        return rr && rr.f !== player.cf ? `<small class="ifwin" title="Crowd Favor held when the event ended${rr.won ? '; the winner\u2019s bonuses make up the difference' : ''}">held ${player.cf}</small>` : '';
      }
      const wv = finalCF(player, true);
      return wv !== player.cf && player.alive ? `<small class="ifwin" title="Final Fate score if this gladiator wins now: held CF plus the winner's bonuses (event reward, 5 per 3 trophies, Flavius items, a held Golden Eagle), minus 5 per hidden Mandati Flavi">win → ${wv}</small>` : '';
    } catch (e) {
      return '';
    }
  })()}</div><div class="stat"><span>Keys</span><b>${ICO.key} ${player.keys}</b></div><button class="stat" type="button" data-act="trophies" data-pid="${player.id}" title="Trophies: ${player.trophies.filter(target => target.pk === 'player').length} gladiators, ${player.trophies.filter(target => target.pk !== 'player').length} beasts"><span>Trophies ▸</span><b>${ICO.trophy} ${player.trophies.filter(target => target.pk === 'player').length}<span style="font-size:11px;color:var(--dim)"> ⚔ </span>${player.trophies.filter(target => target.pk !== 'player').length}<span style="font-size:11px;color:var(--dim)"> 🐾</span></b></button></div>
   <div class="boardgrid"><div class="avatar">${avatarSVG(player)}</div>
   <div class="locs">${LOCS.map(l => {
    const v = player.hp[l];
    return `<div class="loc"><span class="ln">${sideBadge(l)}${LOCS_SHORT[l]}</span><span class="nums">${v <= 0 ? `<span class="sevd">${sevLabel(l).toUpperCase()}</span>` : `HP ${v} · AP ${player.ap[l]}`}</span><div class="bars">${seg7(Math.max(0, v), 'h', v <= 2)}${seg7(player.ap[l], 'a')}</div>${player.pieces[l].length ? `<div class="pieces">${player.pieces[l].map(x => `<span data-card="a:${x.key}" style="cursor:help">${cardHTML('a:' + x.key, 'xs')} ${x.n}</span>`).join(' ')}</div>` : ''}</div>`;
  }).join('')}</div></div>
   ${player.st ? `<div class="badges statrow" title="Ratings: Speed, Strength, Intelligence, Luck, Charisma">${statChips(player.st)}</div>` : ''}
   ${badges.length ? `<div class="badges">${badges.join('')}</div>` : ''}
   ${player.ch && player.ch.mounted ? `<div class="sect">Chariot</div><div class="wrow"><span class="wn">${player.ch.art ? cardHTML('g:' + player.ch.art, 'xs') : ''}<span><b>${esc(player.ch.name || 'Chariot')}</b></span></span><span class="ws">${player.ch.horse ? `<span data-card="h:${player.ch.horse.sides[player.ch.horse.face].art || 'saxoA'}" style="cursor:help">${cardHTML('h:' + (player.ch.horse.sides[player.ch.horse.face].art || 'saxoA'), 'xs')} ${esc(player.ch.horse.name || 'horse')} ${player.ch.horse.sides[player.ch.horse.face].hp - player.ch.horse.dmg}HP</span>` : 'no horse'} · ${player.ch.wheel ? `<span data-card="h:${player.ch.wheel.art || 'wheel8'}" style="cursor:help">${cardHTML('h:' + (player.ch.wheel.art || 'wheel8'), 'xs')} ${player.ch.wheel.hp}HP</span>` : 'no wheel'}</span></div>` : ''}
   <div class="sect">Weapons</div>
   ${['R', 'L'].map(a => {
    const w = player['w' + a];
    const used = armAlive(player, a) && player.armUses[a] >= (w && w.both ? 2 : 1);
    return `<div class="wrow ${used ? 'used' : ''}"><span class="wn">${w && armAlive(player, a) ? w.gart ? cardHTML(w.gart, 'xs') : w.lyre ? cardHTML('c:lyre', 'xs') : cardRef('w:' + w.key) ? cardHTML('w:' + w.key, 'xs') : '' : ''}<span>${a === 'R' ? 'Right (primary)' : 'Left (secondary)'}: <b>${armAlive(player, a) ? w ? w.n : 'empty hand' : '—'}</b></span></span><span class="ws">${armAlive(player, a) ? w ? wStats(w) : 'punch P1 · R1' : 'severed'}${used ? ' · spent' : ''}</span></div>`;
  }).join('')}
   <div class="sect">Movement ${isCur ? `· ${player.mv} left` : `· ${mvMax(player)}${statMvB(player) ? '+' + statMvB(player) : ''} per turn`}</div>
   <div class="mvtrack" aria-label="movement">${Array.from({
    length: 7
  }, (_, i) => `<i class="${isCur ? i < player.mv ? 'f' : '' : i < mvMax(player) ? '' : 'cap'}"></i>`).join('')}</div>
   ${player.items.length ? `<div class="sect">Hand, offerings & objectives</div><div class="items">${player.items.map(it => {
    const hidden = it.kind === 'mf' && player.cpu && !S.over;
    const I = hidden ? {
      n: 'Mandati Flavi',
      t: 'Secret objective',
      d: ''
    } : itemInfo(it);
    const ref = it.kind === 'card' ? 'c:' + it.key : it.kind === 'mf' && !hidden ? 'm:' + it.idx : null;
    const canUse = interactive && (it.kind !== 'mf' || MANDATA[it.idx].declare);
    return `<div class="item ${it.kind === 'mf' ? 'mf' : ''}"><span>${ref ? cardHTML(ref, 'xs') : it.kind === 'offer' && typeof offerTokHTML === 'function' ? offerTokHTML(it.key, 30) : ''}<span>${I.n}<em>${I.t}${I.d ? ' · ' + I.d : ''}</em></span></span>${canUse ? `<button class="btn" type="button" data-act="item" data-id="${it.id}">${it.kind === 'mf' ? 'Declare' : 'Use'}</button>` : ''}</div>`;
  }).join('')}</div>` : ''}
   <div class="hint"><span data-card="k:${player.cls}" style="text-decoration:underline dotted;cursor:help">${CLASSES[player.cls].name} card</span> · ${player.drafted ? 'Drafted gladiator: no class ability or weakness.' : CLASSES[player.cls].ab}${player.abil === 'vet' ? ` <button class="btn" type="button" data-act="vetpref" style="padding:2px 8px">Lanista takes: ${player.vetPref === 'cf' ? 'CF' : 'coin'}</button>` : ''}</div>`;
}

/* ================= RENDER PANELS ================= */
// the Standings button's pulsing dot: the color of whoever leads on Crowd Favor right now (flashes when the lead changes)
let LEAD_ID = null;
/* updateLeadDot — colors the Standings button's dot for the current CF leader (ties keep the old leader) and flashes it when the lead changes. */
function updateLeadDot() {
  const d = document.getElementById('leadDot');
  if (!d) return;
  if (!S || !S.players || !S.players.length || S.sim) {
    d.hidden = true;
    return;
  }
  const top = [...S.players].sort((a, b) => (b.cf || 0) - (a.cf || 0));
  const lead = (top[0].cf || 0) > (top[1] ? top[1].cf || 0 : -1) ? top[0] : S.players.find(player => player.id === LEAD_ID) || top[0]; // ties keep the old leader
  d.hidden = false;
  d.style.setProperty('--lc', lead.color);
  d.title = `${lead.name} leads with ${lead.cf || 0} CF`;
  const btn = document.getElementById('btnGraph');
  if (btn) btn.title = `Standings — ${lead.name} leads with ${lead.cf || 0} CF`;
  if (LEAD_ID !== lead.id) {
    if (LEAD_ID != null) {
      d.classList.remove('flip');
      void d.offsetWidth;
      d.classList.add('flip');
    }
    LEAD_ID = lead.id;
  }
}
/* render — rebuilds the side panels (status chips, roster, player board, phase bar and action buttons, hints, crowd and beast panels), then calls draw().
   While an event snaps to its end it only renders every 40th call. TWEAK: the 40. */
function render() {
  if (HEADLESS) return;
  if (S && S.snap && !S.over) {
    S._snapN = (S._snapN || 0) + 1;
    if (S._snapN % 40) return;
  }
  if (!S) {
    draw();
    return;
  }
  updateLeadDot();
  const p = cur(),
    ev = EV(),
    rd = RD();
  const z = ZONES[rd.zone],
    zs = z[1] - z[0] + 1;
  /* flag — a small allowed / not-allowed chip. */
  const flag = (ok, l) => `<span class="chip ${ok ? 'yes' : 'no'}" title="${l} ${ok ? 'allowed' : 'not allowed'}">${l}</span>`;
  // the status bar (v0.21): WHERE · WHEN · WHO WATCHES, then the event, then the round. Beasts slain ride on the Menagerie button.
  {
    const live = S && !S.over && S.phase !== 'setup';
    const se = $('#btnSimEnd');
    if (se) se.hidden = !(live && !S.snap && !S.tutorial);
    const hs = $('#hintsSeg');
    if (hs) hs.hidden = true;
    {
      const hd = $('#hintDock');
      if (hd) hd.hidden = !HINTS || typeof SETTINGS !== 'undefined' && SETTINGS.hintDock === false;
    } /* v0.43: one master switch, in Settings (H) */
    if (typeof spectUI === 'function') spectUI();
  } // v0.22: event-only controls hide between events
  {
    const bb = $('#btnDrawB');
    if (bb) bb.innerHTML = `🐾 Menagerie${S.npcKills ? ` · <b>${S.npcKills}</b> slain` : ''}`;
  }
  const idle = S.phase === 'setup'; // v0.22: no event on the sand → the location reads “?” (or the New event pick) and the date is the empire's own
  const cal = typeof calNow === 'function' ? idle ? calNow() : S.cal || calNow() : null;
  const dt = cal ? empireDate(cal.season, cal.week) : null;
  const rules = [rd.pve ? 'PvE' : null, rd.pvp ? 'PvP' : null, cfAllowed() ? 'CF' : null, rd.ca ? 'cards' : null].filter(Boolean);
  const off = [rd.pve ? null : 'no PvE', rd.pvp ? null : 'no PvP', cfAllowed() ? null : RD().cf && commodusIn() ? 'no CF (Commodus is in the arena)' : 'no CF'].filter(Boolean);
  $('#status').innerHTML = `<span class="chip calchip" id="calChip" role="button" tabindex="0" style="border-color:var(--gold);cursor:pointer" title="Click for the season schedule · ${dt ? dt.long : ''}${LOCATIONS[S.locIdx] && LOCATIONS[S.locIdx].good ? ' · class modifiers apply here (see New event)' : ''}${S.cal && S.cal.onSched === false ? ' · off the season schedule' : ''}">📍 ${idle ? '?' : LOCATIONS[S.locIdx] ? LOCATIONS[S.locIdx].n : 'Roma'}${dt ? ` · 📅 ${dt.short}` : ''}${!idle && S.spect && S.spect.length ? ` · 🏟 ${houseHTML(S.spect.length, S.seed, S.locIdx)}` : ''}</span><span class="chip" title="${ev.n}${ev.sr ? ' · Summa Rudis ' + ev.sr : ''}">${ev.short}${ev.sr ? ' · ' + ev.sr : ''}</span><span class="chip" title="Round ${S.ri + 1} of ${ev.rounds.length}: ${rd.n}. Zone ${zs}×${zs}. Allowed now: ${rules.join(', ') || '—'}${off.length ? '. ' + off.join(', ') : ''}">Round ${S.ri + 1}/${ev.rounds.length} · ${rd.n} · ${zs}×${zs}</span>${(() => {
    const rr = roundRules(rd, true);
    return Object.keys(RULE_INFO).filter(k => !rr[k]).map(k => `<span class="chip rulechip" role="button" tabindex="0" title="${esc(RULE_INFO[k][3])} — click for the event briefing">🚫 ${RULE_INFO[k][0]} ${k === 'ca' ? 'No abilities' : 'No ' + RULE_INFO[k][1]}${k === 'cf' && rd.cf && commodusIn() ? ' · Commodus is in' : ''}</span>`).join('');
  })()}${S.evKey === 'ludus' ? `<span>Rotation <b>${S.rotation}</b>/10</span>` : ''}${S.evKey === 'goldenEagle' ? Object.keys(S.teamPts).length ? `<span>Eagles ${Object.entries(S.teamPts).map(([t, v]) => `${t}: <b>${v}</b>`).join(' · ')}</span>` : '<span>Eagles 0</span>' : ''}${isNaum() ? S.ships.map(ship => `<span class="chip ${ship.sunk ? 'no' : ''}">${ship.name.replace('Ship of ', '')} ${ship.team}·${Math.max(0, ship.hp)}</span>`).join('') : ''}${S.fest ? `<span class="chip">${festName(S.fest.kind)} · event ${S.fest.stage + 1}/3</span>` : ''}${S.missio ? `<span class="chip">Missio · ${S.missio.name} · step ${S.missio.step + 1}/5</span>` : ''}`;
  if (idle) {
    const pv = window.SETUP_OPEN && typeof CFG !== 'undefined' && EVENTS[CFG.ev] ? {
      L: LOCATIONS[CFG.loc],
      E: EVENTS[CFG.ev]
    } : null;
    $('#status').innerHTML = `<span class="chip calchip" id="calChip" role="button" tabindex="0" style="border-color:var(--gold);cursor:pointer" title="Click for the season schedule · ${dt ? dt.long : ''}">📍 ${pv && pv.L ? pv.L.n : '?'}${dt ? ` · 📅 ${dt.short}` : ''}</span>${pv ? `<span class="chip" title="Selected in New event">${esc(pv.E.short || pv.E.n)}${pv.E.sr ? ' · ' + pv.E.sr : ''} · <i>selected</i></span>` : '<span class="chip" style="opacity:.7">No event on the sand</span>'}`;
  }
  {
    const hd = $('#rosterHd');
    if (hd) {
      const st = S.players.filter(other => other.alive && !other.exited).length;
      hd.innerHTML = S.phase === 'setup' ? '' : `<span>⚔ Fighting in this event</span><small>${st} of ${S.players.length} standing</small>`;
    }
  }
  {
    const bm = $('#btnManager');
    if (bm) bm.hidden = !(S.mgrCtx || S.specCtx);
    const bb = $('#btnBets');
    if (bb) bb.hidden = !(S.mgrCtx || S.specCtx);
  }
  $('#roster').innerHTML = S.players.map(other => `<button type="button" class="rc ${other === p && !S.over || S.over && S.boardPid === other.id ? 'cur' : ''} ${other.alive ? '' : 'dead'}" style="--pc:${other.color}" data-act="inspect" data-pid="${other.id}">
    <div class="top">${(S.mgrCtx || S.specCtx) && other.mgrGid && typeof gById === 'function' && gById(other.mgrGid) ? `<span class="favstar ${gById(other.mgrGid).favd ? 'on' : ''}" role="button" tabindex="0" data-favg="${other.mgrGid}" title="${gById(other.mgrGid).favd ? 'On your ★ Favorites board — click to remove' : 'Add to your ★ Favorites board (Manager mode)'}">${gById(other.mgrGid).favd ? '★' : '☆'}</span>` : ''}<span class="nm">${other.name}</span><span class="tag">${CLASSES[other.cls].name}${EV().teams || EV().coop ? ' · Team ' + other.team : ''} · ${other.cpu ? 'CPU ' + cpuMind(other) : 'You'}</span></div>
    <div class="mini">${[['head', 'chest'], ['rarm', 'larm'], ['rleg', 'lleg']].flat().map(l => {
    const v = other.hp[l];
    return `<div class="mloc"><span class="lab">${sideBadge(l)}${LOCS_SHORT[l]}</span><div class="mbars">${v <= 0 ? `<span class="sevd">${sevLabel(l).toLowerCase()}</span>` : seg7(v, 'h', v <= 2) + seg7(other.ap[l], 'a')}</div></div>`;
  }).join('')}</div>
    ${other.cpu && other.alive && other.lastThought ? `<div class="thought">“${esc(other.lastThought)}”</div>` : ''}<div class="nums">${other.exited ? 'Exited the arena' : other.alive ? `${other.ch ? `Lap ${other.ch.laps}/3${other.ch.mounted ? '' : ' · on foot'} · ` : ''}${swimming(other) ? 'swimming · ' : ''}CF ${other.cf} · coin ${other.coin} · ⚔ ${other.trophies.filter(target => target.pk === 'player').length} 🐾 ${other.trophies.filter(target => target.pk !== 'player').length}${other.underground ? ' · underground' : ''}${rd.zone > 1 && !inZone(other.r, other.c) ? ' · outside zone' : ''}` : 'Eliminated'}</div></button>`).join('');
  const shown = typeof boardShown === 'function' ? boardShown(p) : S.over && S.boardPid != null && S.players[S.boardPid] ? S.players[S.boardPid] : p;
  $('#board').innerHTML = boardHTML(shown, humanTurn() && S.phase === 'action' && !shown.cpu && shown === p);
  // actions
  const ph = S.phase;
  const pbar = `<div class="phasebar">${[['resolve', '1 Resolve'], ['choice', '2 Choice'], ['action', '3 Action'], ['end', '4 End']].map(([k, l]) => `<span class="${ph === k || ph === 'command' && k === 'resolve' ? 'on' : ''}">${l}</span>`).join('')}</div>`;
  let a = '';
  if (S.over) a = '<p class="hint">The event is over. Start a new one from the top bar.</p>';else if (ph === 'command' && S.cmd) {
    const n = S.cmd.n,
      zo = n.t === 'zora' ? zoraPickOptions(n) : [];
    a = `<p class="hint">Command <b>${n.name}</b>: click an orange tile to move${S.cmd.moved ? ' (moved)' : ''}${n.carry ? `. Carrying ${n.carry.label}: half movement, no attacks` : ', or a red ring to attack'}${n.t === 'zora' ? '. Zora flies over everything and can land on pillars' : ''}.</p><div class="acts">${zo.map((o, i) => `<button class="btn" type="button" data-act="zpick" data-i="${i}">Pick up ${o.label}<small>halves his movement</small></button>`).join('')}${n.carry ? `<button class="btn" type="button" data-act="zdrop">${cheb(n, S.cmd.p) <= 1 ? 'Deliver to ' + S.cmd.p.name : 'Drop here'}<small>${n.carry.label}</small></button>` : ''}<button class="btn primary" type="button" data-act="cmddone">Done commanding</button></div>`;
  } else if (p.cpu) a = `<p class="hint">${p.name} (CPU, ${typeof AI_TIERS !== 'undefined' && p.tier != null ? AI_TIERS[p.tier].n : p.diff}) is taking their turn…</p>`;else if (ph === 'resolve') a = '<p class="hint">The arena reacts to you. NPCs are moving…</p>';else if (ph === 'choice') a = `<div class="acts"><button class="btn primary" type="button" data-act="coin" ${S.busy ? 'disabled' : ''}>Take 2 coin<small>safe</small></button><button class="btn" type="button" data-act="card" ${S.busy || !canDraw() ? 'disabled' : ''}>Draw arena card<small>${canDraw() ? S.deck.length + ' left · high risk' : 'no arena deck in this event'}</small></button></div>`;else if (ph === 'action' && isChariot()) {
    const srcs = attackSources(p).filter(s => !s.thr);
    const m = S.mode;
    const ch = p.ch;
    /* btn — one action-dock button (on = current mode, en = enabled; always disabled while busy). */
    const btn = (act, label, sub, on, en = true) => `<button class="btn ${on ? 'on' : ''}" type="button" data-act="${act}" ${!en || S.busy ? 'disabled' : ''}>${label}<small>${sub}</small></button>`;
    a = `<div class="acts">${btn('m-move', ch.mounted ? 'Drive' : 'Move on foot', `${p.mv} movement${ch.mounted ? ' · forward or forward-diagonal only' : ''}`, m === 'move')}
      ${srcs.map(s => {
      const id = 'm-atk' + s.arm;
      const n = targetsFor(p, s).length;
      return btn(id, `Attack · ${s.w.n}`, chCanAttack(p) ? `${n} in range · once per lap` : ch.laps < 1 ? 'after your first lap' : 'already attacked this lap', m === id.slice(2), chCanAttack(p));
    }).join('')}
      ${ch.mounted ? btn('dismount', 'Dismount', 'fetch spare wheels or horses on foot', false) : p.r === ch.cr && p.c === ch.cc ? btn('mount', 'Mount chariot', 'free', false) : ''}
      <button class="btn primary" type="button" data-act="end" ${S.busy ? 'disabled' : ''}>End turn<small>next racer</small></button></div>
    <p class="hint">Race counter-clockwise: north up the right side, west along the top, south down the left, east along the bottom across the red finish line. Lap ${ch.laps}/3. Pillar gates at the top and bottom middle flip your horse, draw an offering and give a free step.${ch.mounted ? '' : ' On foot you can enter the center to pick up spare wheels and horses; a chariot that hits you eliminates you.'}</p>`;
  } else if (ph === 'action') {
    const srcs = attackSources(p);
    const m = S.mode;
    /* btn — one action-dock button (on = current mode, en = enabled; always disabled while busy). */
    const btn = (act, label, sub, on, en = true) => `<button class="btn ${on ? 'on' : ''}" type="button" data-act="${act}" ${!en || S.busy ? 'disabled' : ''}>${label}<small>${sub}</small></button>`;
    const atkBtns = srcs.map(s => {
      const n = targetsFor(p, s).length;
      const id = 'm-atk' + s.arm + (s.thr ? 'T' : '');
      return btn(id, `${s.thr ? 'Throw' : 'Attack'} · ${s.w.n}`, `${s.arm === 'R' ? 'right' : 'left'} · ${n} target${n === 1 ? '' : 's'}`, m === id.slice(2), n > 0 || m === id.slice(2));
    }).join(''); /* v0.53: no target in reach = no attack */
    const focusTargets = srcs.some(s => targetsFor(p, s).some(target => target.kind === 'player'));
    const loot = lootOptions(p).filter(o => o.t === 'fw' || !p.looted);
    const ex = tunnelExits(p);
    a = `<div class="acts">
      ${btn('m-move', 'Move', p.focusRoll ? 'locked — Focus spends your movement' : `${p.mv} movement · diagonal 2`, m === 'move' && !p.focusRoll, !p.focusRoll)}
      <div class="atkgrp ${p.focusRoll ? 'focused' : ''}">${RD().pvp && p.mv > 0 && srcs.length ? `<button class="btn focbtn ${p.focusRoll ? 'on' : ''}" type="button" data-act="focus" ${S.busy || !focusTargets && !p.focusRoll ? 'disabled' : ''} title="Spend ALL your remaining movement: the location die is rolled three times and you pick where your next attack on a gladiator lands">🎯 Focus roll: ${p.focusRoll ? '<b>ON</b>' : 'off'}<small>${p.focusRoll ? 'your next attack picks 1 of 3 rolled locations' : `costs your ${p.mv} movement · pick 1 of 3 locations`}</small></button>` : ''}${atkBtns || btn('none', 'Attack', 'no attacks left', false, false)}</div>
      ${btn('m-push', 'Push', '2 movement', m === 'push', pushTargets(p).length > 0)}
      ${btn('m-topple', 'Topple pillar', '3 movement', m === 'topple', toppleTargets(p).length > 0)}
      ${!weak(p, 'noTunnel') ? btn('m-tunnel', 'Tunnel', '1 Arena Key · ends turn', m === 'tunnel', ex.length > 0) : ''}
      ${canOpenChest(p) ? btn('chest', 'Open Arena Chest', '1 Arena Key', false) : ''}
      ${S.chest && onChestTile(p) && !p.carrying && armsAttached(p).length === 2 ? btn('chestup', 'Pick up chest', '−1 movement while held', false) : ''}
      ${p.carrying ? btn('chestdown', 'Drop chest', 'free', false) : ''}
      ${loot.length ? btn('loot', 'Loot', p.looted ? 'thrown weapons only' : '1 item per turn', false) : ''}
      ${EV().noMarket ? '' : btn('market', 'Market', p.market ? 'unlocked' : cfAllowed() ? '3 CF to unlock' : 'CF locked', false)}
      ${btn('crowd', 'Crowd Favor', cfAllowed() ? `${p.cf} CF to spend` : 'locked this round', false, cfAllowed())}
      ${tradePartners(p).length ? btn('trade', 'Trade or truce', 'within 4 tiles', false) : ''}
      ${spearTargets(p).length ? btn('spear', 'Spear a spectator', '3 CF · once per event', false) : ''}
      ${canSelfWager(p) ? btn('selfbet', 'Wager on yourself', 'coin at today\'s odds', false) : ''}
      ${p.abil === 'zora' && caAllowed() && (p.zoraUsed || 0) < (p.abilVal || 1) && !p.noEagle ? btn('zora', 'Release Zora', (p.abilVal || 1) > 1 ? `${(p.abilVal || 1) - (p.zoraUsed || 0)} release${(p.abilVal || 1) - (p.zoraUsed || 0) === 1 ? '' : 's'} left` : 'once per event', false) : ''}
      ${canExit(p) ? btn('exit', 'Exit the arena', 'ends your event here', false) : ''}
      ${isNaum() && p.onDoor != null ? btn('leavedoor', 'Leave the door', 'swim from here', false) : ''}
      <button class="btn primary ${turnSpent(p, srcs, loot, ex) ? 'heartbeat' : ''}" type="button" data-act="end" ${S.busy ? 'disabled' : ''}>End turn<small>${turnSpent(p, srcs, loot, ex) ? 'nothing left to do this turn' : 'Phase 4'}</small></button>
    </div>
    <p class="hint">${{
      move: 'Click an orange tile to move. Numbers show the movement it costs.',
      push: 'Click a yellow tile to push that pillar, player or NPC one tile away. Push beasts or rivals onto spikes, or pillars onto tunnels to seal them.',
      topple: 'Click a pillar to topple it away from you. Anything on the next two tiles takes 3 damage and every pot on it breaks.',
      tunnel: 'Click a blue tunnel to exit there. You stay underground until your next turn.',
      rete: 'Click a teal target to throw the net.'
    }[m] || 'Click a red-ringed target. Pots need 2 damage to break.'}${rd.zone > 1 && p.grace > 0 ? ` Grace: ${p.grace} turn${p.grace > 1 ? 's' : ''} left to reach the zone.` : ''}</p>`;
  }
  const hs = typeof MTUT !== 'undefined' && MTUT.on ? [] : strategyHints(p);
  $('#actions').innerHTML = pbar + a;
  $('#hintDock').innerHTML = hs.length ? `<div class="hintbox" aria-label="Hints"><h4>Hints</h4><ul>${hs.map(h => `<li>${h}</li>`).join('')}</ul></div>` : '';
  try {
    if (typeof matchSaveUI === 'function') matchSaveUI();
  } catch (e) {}
  if (typeof crowdPanelHTML === 'function') {
    const cp = $('#crowdPanel');
    const h = crowdPanelHTML();
    cp.hidden = !h;
    if (h) cp.innerHTML = h;
  }
  $('#npcPanel').innerHTML = npcTrackerHTML();
  if (typeof renderDrawer === 'function') renderDrawer();
  renderTurnInd();
  try {
    if (typeof guideAfterRender === 'function' && !(typeof MTUT !== 'undefined' && MTUT.on)) guideAfterRender(p);
  } catch (e) {
    console.error(e);
  } // v0.37: suggestion, spotlight, recap
  draw();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || !S) return;
  const k = b.dataset.act;
  if (k === 'trophies') {
    e.stopPropagation();
    return;
  } /* v0.51: the trophies read on hover, like coin and CF */
  if (k === 'inspect') {
    const q = S.players[+b.dataset.pid];
    if (!q) return;
    const home = typeof boardHome === 'function' ? boardHome(cur()) : null; /* v0.51: the panel swaps in place — click your own card to come back */
    S.boardPid = q === home || q.id === S.boardPid ? null : q.id;
    render();
    return;
  }
  if (k === 'cmddone') {
    if (S.cmd && !S.cmd.lock) finishCommand();
    return;
  }
  if (k === 'zpick') {
    if (S.cmd && !S.cmd.lock) {
      const o = zoraPickOptions(S.cmd.n)[+b.dataset.i];
      if (o) {
        zoraPickup(S.cmd.n, o);
        render();
      }
    }
    return;
  }
  if (k === 'zdrop') {
    if (S.cmd && !S.cmd.lock) {
      S.cmd.lock = true;
      zoraDrop(S.cmd.n, S.cmd.p).then(() => {
        if (S.cmd) {
          S.cmd.lock = false;
          render();
        }
      });
    }
    return;
  }
  if (k === 'vetpref') {
    const p = S.players.find(other => other.abil === 'vet' && !other.cpu);
    if (p) {
      p.vetPref = p.vetPref === 'cf' ? 'coin' : 'cf';
      render();
    }
    return;
  }
  const p = cur();
  if (!humanTurn()) return;
  if (k === 'coin' || k === 'card') {
    act(() => takeChoice(p, k));
    return;
  }
  if (S.phase !== 'action') return;
  if (k.startsWith('m-')) {
    S.mode = k.slice(2);
    render();
    return;
  }
  if (k === 'focus') {
    p.focusRoll = !p.focusRoll;
    if (p.focusRoll && S.mode === 'move') {
      const s0 = attackSources(p)[0];
      if (s0) S.mode = 'atk' + s0.arm + (s0.thr ? 'T' : '');
    }
    render();
    return;
  }
  if (k === 'end') {
    S.mode = 'move';
    act(async () => {
      S.busy = false;
      await endTurn();
    });
    return;
  }
  if (k === 'market') act(() => openMarket(p));
  if (k === 'crowd') act(() => openCrowd(p));
  if (k === 'chest') act(() => openChest(p));
  if (k === 'chestup') act(async () => {
    p.carrying = true;
    S.chest.held = 'p' + p.id;
    p.mv = Math.max(0, p.mv - 1);
    log(`${nm(p)} lifts the Arena Chest.`);
  });
  if (k === 'chestdown') act(async () => {
    p.carrying = false;
    S.chest.held = null;
    S.chest.r = p.r;
    S.chest.c = p.c;
    log(`${nm(p)} sets the chest down.`);
  });
  if (k === 'loot') act(async () => {
    const opts = lootOptions(p).filter(o => o.t === 'fw' || !p.looted);
    const i = await modal('Loot', `<p>Take one item per turn from a corpse or a dropped pile. Thrown weapons in the sand can always be picked up.</p>`, opts.map((o, i) => {
      const w = o.t === 'w' ? o.pl.weapons[o.i] : o.t === 'fw' ? o.floor.w : null;
      const own = o.pl && S.players[o.pl.owner];
      return {
        label: o.label,
        sub: o.sub,
        value: i,
        card: w && w.key ? 'w:' + w.key : own ? 'b:' + own.cls : null
      };
    }).concat([{
      label: 'Cancel',
      value: null
    }]));
    if (i != null) await doLoot(p, opts[i]);
  });
  if (k === 'trade') act(() => openTrade(p));
  if (k === 'spear') act(() => humanSpear(p));
  if (k === 'selfbet') act(() => humanSelfWager(p));
  if (k === 'zora') act(async () => {
    if (spawnZora(p)) p.zoraUsed = (p.zoraUsed || 0) + 1;
  });
  if (k === 'dismount') act(async () => {
    p.ch.mounted = false;
    p.mv = Math.min(p.mv, 3);
    log(`${nm(p)} dismounts.`);
  });
  if (k === 'mount') act(async () => {
    p.ch.mounted = true;
    log(`${nm(p)} mounts their chariot.`);
  });
  if (k === 'leavedoor') act(async () => {
    p.onDoor = null;
    log(`${nm(p)} slips off the door into the water.`);
  });
  if (k === 'exit') act(async () => {
    doExit(p);
    S.busy = false;
    await endTurn();
  });
  if (k === 'item') {
    const it = p.items.find(x => x.id == +b.dataset.id);
    if (it) act(() => useItem(p, it));
  }
});
/* showTrophies — shows a gladiator's trophy tables, reusing the open window if there is one. */
function showTrophies(player) {
  if (!$('#modal').hidden) {
    $('#mTitle').textContent = `${player.name}'s trophies`;
    $('#mBody').innerHTML = trophyHTML(player);
    return;
  }
  modal(`${player.name}'s trophies`, trophyHTML(player), [{
    label: 'Close',
    value: 1
  }]);
}
/* trophyHTML — trophy tables (gladiators, then beasts) with coin and CF totals. */
function trophyHTML(player) {
  /* tbl — one titled trophy table, or "None yet". */
  const tbl = (list, title) => `<h4>${title} · ${list.length}</h4>` + (list.length ? `<table class="tally"><tr><th>Trophy</th><th>Type</th><th>Round</th><th>Coin</th><th>CF</th></tr>${list.map(target => `<tr><td>${target.name}</td><td>${target.kind}</td><td class="n">${target.round}</td><td class="n">${target.coin}</td><td class="n">${target.cf}</td></tr>`).join('')}<tr><td><b>Total</b></td><td></td><td></td><td class="n"><b>${list.reduce((s, target) => s + target.coin, 0)}</b></td><td class="n"><b>${list.reduce((s, target) => s + target.cf, 0)}</b></td></tr></table>` : '<p>None yet.</p>');
  return `<p>Every 3 trophies held by a winner add 5 CF at the end. ${player.trophies.length} in total.</p>${tbl(player.trophies.filter(target => target.pk === 'player'), 'Gladiators eliminated (players &amp; CPUs)')}${tbl(player.trophies.filter(target => target.pk !== 'player'), 'Beasts eliminated (NPCs)')}`;
}

/* ================= MODALS ================= */
let modalQueue = Promise.resolve();
let CUR_MODAL = null;
// Is a window in the way? A window with a harmless way out (results, manager, Imperium…) simply closes
// so the new one can open; a window that needs a real game decision keeps the player's attention.
/* v0.41 THE DEADLOCK: windows open through a queue, each waiting for the last to resolve. A window hidden
   without being answered used to block every later window forever (no mode would open until a reload).
   An orphan — a current window that is neither shown nor minimised — is now answered with its close value. */
function modalHealOrphan() {
  if (CUR_MODAL && $('#modal').hidden && $('#mReturn').hidden) {
    const c = CUR_MODAL;
    CUR_MODAL = null;
    try {
      c.done(c.closeB ? c.closeB.value : null);
    } catch (e) {}
    return true;
  }
  return false;
}
/* modalDismiss — closes the current window with its close value (or just hides the modal if none is tracked). */
function modalDismiss() {
  if (CUR_MODAL) {
    const c = CUR_MODAL;
    try {
      c.done(c.closeB ? c.closeB.value : null);
    } catch (e) {}
  } else $('#modal').hidden = true;
}
/* modalBusy — true if a window that needs an answer is open; orphans are healed and harmless windows closed on the spot first. */
const modalBusy = () => {
  modalHealOrphan();
  if ($('#modal').hidden && $('#mReturn').hidden) return false;
  if (CUR_MODAL && CUR_MODAL.harmless) {
    CUR_MODAL.done(CUR_MODAL.closeB.value);
    return false;
  }
  return true;
};
/* v0.22: any window that opens during a live event pauses the match; closing the last window resumes it at the same pace */
let MODAL_PAUSE = null;
/* setSpeedUI — sets the game speed and highlights the matching speed button. */
const setSpeedUI = victim => {
  SPEED = victim;
  document.querySelectorAll('[data-speed]').forEach(x => x.classList.toggle('on', x.dataset.speed === victim));
  try {
    renderTurnInd();
  } catch (e) {}
};
/* modalPause — pauses a live event while a window is open, remembering the previous speed. */
function modalPause() {
  if (!S || S.over || S.sim || HEADLESS) return;
  if (MODAL_PAUSE == null && SPEED !== 'pause') {
    MODAL_PAUSE = SPEED;
    setSpeedUI('pause');
  }
}
/* modalResume — restores the remembered speed once no window is open. */
function modalResume() {
  if (MODAL_PAUSE == null) return;
  if (!$('#modal').hidden) return; // another window took its place
  const back = MODAL_PAUSE;
  MODAL_PAUSE = null;
  if (SPEED === 'pause' && S && !S.over) setSpeedUI(back);
}
/* modal — the one dialog everything uses: queues behind any open window, shows title, body and buttons (plus an optional grid) and resolves with the chosen value.
   The x / Escape give the close value; windows without one can be minimised to peek at the board. In HEADLESS mode it answers at once (close value, else the first enabled button). */
function modal(title, body, buttons, opt = {}) {
  if (HEADLESS) {
    const b = [...buttons, ...(opt.grid || [])].find(x => !x.disabled);
    return Promise.resolve(opt.close !== undefined ? opt.close : b ? b.value : null);
  }
  /* run — builds and shows the window once its turn in the queue comes. */
  const run = () => new Promise(res => {
    $('#modal').classList.toggle('full', !!opt.full); // v0.35: the big modes run full screen wherever they are opened from
    $('#mboxEl').classList.toggle('wide', !!opt.wide);
    $('#mboxEl').classList.toggle('xwide', !!opt.xwide);
    $('#mboxEl').classList.toggle('tall', !!(opt.wide || opt.xwide)); // big windows keep one height, so switching tabs never resizes them
    $('#mTitle').innerHTML = title;
    $('#mBody').innerHTML = (opt.card ? `<div class="mcard">${cardHTML(opt.card, 'lg')}</div>` : '') + body;
    const all = [...buttons];
    // a × (and Escape) closes any window that has a harmless way out
    const closeB = opt.close !== undefined ? {
      value: opt.close
    } : buttons.find(b => /^(Close|Cancel|Keep it|Skip|Look at the board|Opt out)/.test(String(b.label)));
    /* btnHTML — one dialog button with optional card art and a sub-label. */
    const btnHTML = (b, i) => `<button class="btn ${b.primary ? 'primary' : ''}" type="button" data-mi="${i}" ${b.disabled ? 'disabled' : ''} ${b.style ? `style="${b.style}"` : ''}>${b.card && cardRef(b.card) ? cardHTML(b.card, cardRef(b.card).sh.wide ? 'sm' : 'xs') : ''}${b.label}${b.sub ? `<small>${b.sub}</small>` : ''}</button>`;
    if (opt.grid) {
      const g = $('#pickgrid');
      const off = all.length;
      all.push(...opt.grid);
      g.innerHTML = opt.grid.map((b, i) => btnHTML(b, off + i)).join('');
    }
    // v0.21: the × at the top right replaces redundant bottom "Close" buttons
    $('#mBtns').innerHTML = buttons.map((b, i) => closeB && (b === closeB || b.value === closeB.value) && /^Close$/.test(String(b.label)) ? '' : btnHTML(b, i)).join('');
    $('#mBtns').hidden = !$('#mBtns').innerHTML.trim();
    $('#modal').hidden = false;
    document.body.classList.add('modal-open'); // no scroll bleed into the page behind
    $('#mBody').scrollTop = 0;
    $('#mboxEl').scrollTop = 0; // v0.28: every window opens at its top
    modalPause();
    /* done — closes the window, removes its handlers, resumes game speed and resolves with the value. */
    const done = victim => {
      const hold = !!(opt.keep && opt.keep(victim)); /* v0.57: a window that will reopen at once (e.g. results after Save) stays up — no flash of the arena */
      if (!hold && typeof MM !== 'undefined' && MM.fromMenu && $('#modal').classList.contains('full') && typeof transitCover === 'function') transitCover(1400); /* v0.41: no arena flash on the way back */
      CUR_MODAL = null;
      $('#mClose').classList.remove('saveq');
      $('#mClose').textContent = '×';
      if (!hold) {
        document.body.classList.remove('modal-open');
        $('#modal').hidden = true;
        $('#modal').classList.remove('full');
      }
      setTimeout(modalResume, 80);
      setTimeout(() => {
        try {
          if (typeof mmAfterClose === 'function') mmAfterClose();
        } catch (e) {}
      }, 420);
      $('#mReturn').hidden = true;
      $('#mboxEl').onclick = null;
      document.removeEventListener('keydown', esc_);
      $('#mClose').hidden = true;
      $('#mPeek').hidden = true;
      res(victim);
    };
    /* esc_ — Escape closes the window when it has a close value. */
    const esc_ = e => {
      if (e.key === 'Escape' && closeB) {
        e.preventDefault();
        done(closeB.value);
      }
    };
    $('#mClose').hidden = !closeB;
    $('#mClose').onclick = e => {
      e.stopPropagation();
      if (closeB) done(closeB.value);
    };
    document.addEventListener('keydown', esc_);
    // windows that need an answer can be minimised to look at the board, then reopened
    $('#mPeek').hidden = !!closeB;
    $('#mPeek').onclick = e => {
      e.stopPropagation();
      $('#modal').hidden = true;
      const r = $('#mReturn');
      r.textContent = 'Back to: ' + $('#mTitle').textContent;
      r.hidden = false;
      r.onclick = () => {
        r.hidden = true;
        $('#modal').hidden = false;
      };
    };
    $('#mboxEl').onclick = e => {
      const el = e.target.closest('[data-mi]');
      if (!el || el.disabled) return;
      done(all[+el.dataset.mi].value);
    };
    CUR_MODAL = {
      done,
      closeB,
      harmless: !!closeB && (opt.close !== undefined || /^(Close|Look at the board)$/.test(String(closeB.label)))
    };
    if (opt.onOpen) opt.onOpen(done);
    requestAnimationFrame(() => {
      $('#mBody').scrollTop = 0;
    });
    const f = $('#mboxEl').querySelector('button:not([disabled])[data-mi]');
    if (f) f.focus({
      preventScroll: true
    });
  });
  modalHealOrphan();
  const pr = modalQueue.then(run);
  modalQueue = pr.catch(() => {});
  return pr;
}
/* distModal — dialog to spread n HP or AP over body locations (7 max each). Auto uses cpuHealPlan for HP, or fills armored locations first in HEAL_ORDER for AP. Resolves with {location: amount}. */
function distModal(player, n, why, kind) {
  const plan = {};
  LOCS.forEach(l => plan[l] = 0);
  /* cap — room left in a location before it reaches 7. */
  const cap = l => kind === 'hp' ? 7 - player.hp[l] : 7 - player.ap[l];
  const okLoc = l => player.hp[l] > 0 && cap(l) > 0;
  const left = () => n - LOCS.reduce((s, l) => s + plan[l], 0);
  /* body — renders the distribution rows and the amount left to assign. */
  const body = () => `<p>Distribute <b>${n} ${kind === 'hp' ? 'HP' : 'AP'}</b> from ${why}. Put it all in one location or spread it. Nothing can exceed 7.</p>
   <div class="dist">${LOCS.map(l => `<span>${sideBadge(l)} ${LOCN[l]} <span style="color:var(--dim);font:12px var(--mono)">${kind === 'hp' ? player.hp[l] : player.ap[l]} → ${(kind === 'hp' ? player.hp[l] : player.ap[l]) + plan[l]}</span></span><button class="btn" type="button" data-d="-" data-l="${l}" ${plan[l] ? '' : 'disabled'} aria-label="Remove from ${LOCN[l]}">−</button><span class="v">${plan[l]}</span><button class="btn" type="button" data-d="+" data-l="${l}" ${okLoc(l) && plan[l] < cap(l) && left() > 0 ? '' : 'disabled'} aria-label="Add to ${LOCN[l]}">+</button>`).join('')}</div>
   <p style="margin-top:10px">Left to assign: <b id="distLeft">${left()}</b></p>`;
  return modal(kind === 'hp' ? 'Distribute health' : 'Distribute armor', body(), [{
    label: 'Auto: head, chest, arms, legs',
    value: 'auto'
  }, {
    label: 'Confirm',
    value: 'ok',
    primary: 1
  }], {
    onOpen: () => {
      const box = $('#mBody');
      box.onclick = e => {
        const b = e.target.closest('[data-d]');
        if (!b || b.disabled) return;
        const l = b.dataset.l;
        plan[l] += b.dataset.d === '+' ? 1 : -1;
        box.innerHTML = body();
      };
    }
  }).then(victim => {
    $('#mBody').onclick = null;
    if (victim === 'auto') {
      if (kind === 'hp') return cpuHealPlan(player, n);
      const pl = {};
      LOCS.forEach(l => pl[l] = 0);
      let k = n;
      for (const l of HEAL_ORDER) {
        while (k > 0 && okLoc(l) && pl[l] < cap(l) && player.ap[l] > 0) {
          pl[l]++;
          k--;
        }
      }
      for (const l of HEAL_ORDER) {
        while (k > 0 && okLoc(l) && pl[l] < cap(l)) {
          pl[l]++;
          k--;
        }
      }
      return pl;
    }
    return plan;
  });
}

/* ================= HUMAN MENUS ================= */
/* openMarket — the human market window (the sutler's stall): unlock for 3 CF, then buy weapon or armor levels 1-3 until closed. TWEAK: the sutler names. */
async function openMarket(player) {
  const vet = weak(player, 'tax') ? 1 : 0;
  // v0.34 THE SUTLER'S STALL: the market is a proper stall now — striped awning, plank shelves,
  // the PRINTED cards racked face-up in their slots, the deck face-down beside them. Same rules,
  // same die; it just finally looks like a place a gladiator would spend coin between rounds.
  const sutler = ['Barbatus', 'Mercator Felix', 'Old Vibius', 'Naso the sutler', 'Crassus Minor', 'the widow Tertia'][Math.abs(S && S.seed || 0) % 6]; // one sutler per event — he remembers you
  for (;;) {
    const m = S.market;
    const RM = ['Ⅰ', 'Ⅱ', 'Ⅲ'];
    /* shelf — one market shelf: the three face-up card slots plus the face-down deck for a level. */
    const shelf = (kind, lv) => {
      const M = m[kind][lv];
      const slots = M.slots.map((k, i) => `<span class="slotwrap"><span class="slotn">${i + 1}</span>${k ? cardHTML((kind === 'w' ? 'w:' : 'a:') + k, 'sm') : '<span class="cardback mtEmpty">✕</span>'}</span>`).join('');
      const fd = `<span class="slotwrap"><span class="slotn">4</span><span class="cardback" title="${M.deck.length} card${M.deck.length === 1 ? '' : 's'} face-down in the level ${lv} deck">🏛<small>×${M.deck.length}</small></span></span>`;
      return `<div class="shelf"><div class="shelf-hd"><b>LEVEL ${RM[lv - 1]}</b><span class="shelf-price">${purchaseCost(player, lv) + vet} coin</span></div><div class="shelf-slots">${slots}${fd}</div></div>`;
    };
    const notes = [vet ? '⚖ Old debts: +1 coin per purchase' : '', player.discount ? `％ Discount: −${player.discount} coin this turn` : '', player.mchoice ? '☝ Choose: pick your slot, no die' : ''].filter(Boolean);
    const body = `<div class="stall">
      <div class="stall-awn"></div>
      <div class="stall-sign"><span>⚖ MERCATVS FLAVII ⚖</span><span class="rc-sub">the market die (1-4) picks the slot · re-roll 2 coin</span></div>
      <div class="stall-body">
        <div><div class="shelfcol-hd">🗡 The weapon racks</div>${[3, 2, 1].map(lv => shelf('w', lv)).join('')}</div>
        <div><div class="shelfcol-hd">🛡 The armor shelves</div>${[3, 2, 1].map(lv => shelf('a', lv)).join('')}</div>
      </div>
      <div class="stall-foot"><span>${typeof specFaceSVG === 'function' ? specFaceSVG({
      skin: '#d8a47a',
      hair: '#8a7a60',
      beard: true,
      robe: '#7a5a2a'
    }) : '👤'} <b>${esc(sutler)}</b> eyes your purse</span><span class="stall-purse">💰 <b>${player.coin}</b> coin · 🌾 <b>${player.cf}</b> CF${player.market ? ' · <b style="color:var(--gold2)">stall open</b>' : ''}</span></div>
      ${player.market ? '' : `<div class="stall-lock"><div><div style="font-size:30px">🔒</div><b>The shutters are up.</b><br><span class="rc-sub">3 Crowd Favor opens the stall for this turn — then buy as often as your coin allows.</span></div></div>`}
    </div>${notes.length ? `<p class="rc-sub" style="margin:6px 0 0">${notes.join(' · ')}</p>` : ''}${hint('market')}`;
    const btns = [];
    if (!player.market) btns.push({
      label: 'Unlock market',
      sub: cfAllowed() ? '3 CF' : 'Crowd Favor is locked',
      value: 'unlock',
      disabled: player.cf < 3 || !cfAllowed(),
      primary: 1
    });else {
      for (const lv of [1, 2, 3]) btns.push({
        label: `Weapon LV ${lv}`,
        sub: `${purchaseCost(player, lv) + vet} coin`,
        value: 'w' + lv,
        disabled: player.coin < purchaseCost(player, lv) + vet
      });
      for (const lv of [1, 2, 3]) btns.push({
        label: `Armor LV ${lv}`,
        sub: `${purchaseCost(player, lv) + vet} coin`,
        value: 'a' + lv,
        disabled: player.coin < purchaseCost(player, lv) + vet
      });
    }
    btns.push({
      label: 'Close market',
      value: 'close'
    });
    const v = await modal('Market of Flavius', body, btns, {
      wide: 1
    });
    if (v === 'close' || !v) break;
    if (v === 'unlock') {
      player.cf -= 3;
      player.market = true;
      log(`${nm(player)} spends 3 CF to unlock the market.`);
      continue;
    }
    const kind = v[0],
      lv = +v[1];
    player.coin -= purchaseCost(player, lv) + vet;
    coinLog(player, -(purchaseCost(player, lv) + vet), 'market purchases');
    stat(player, 'buy');
    crowdReact('buy', {
      p: player
    });
    log(`${nm(player)} buys at level ${lv}.`);
    const key = await marketRoll(player, kind, lv);
    if (kind === 'w') await gainWeapon(player, key);else if (key) await gainArmorPiece(player, key);
    checkMandata(player);
    render();
  }
}
/* openCrowd — the Crowd Favor shop: market unlock 3 CF, key 5, arena card 5, elixir 8, AP token 8, or 10 coin for 2 CF.
   TWEAK: the prices, but each appears twice (label and deduction), so change both together. */
async function openCrowd(player) {
  for (;;) {
    if (!cfAllowed()) return;
    const opts = [{
      label: 'Unlock market for this turn',
      sub: '3 CF',
      value: 'mk',
      disabled: player.cf < 3 || player.market || !!EV().noMarket
    }, {
      label: 'Arena Key',
      sub: '5 CF',
      value: 'key',
      disabled: player.cf < 5
    }, {
      label: 'Arena card',
      sub: '5 CF',
      value: 'card',
      disabled: player.cf < 5 || !canDraw()
    }, {
      label: 'Health Elixir token (+4 HP)',
      sub: '8 CF',
      value: 'el',
      disabled: player.cf < 8
    }, {
      label: 'AP Upgrade token (+3 AP)',
      sub: '8 CF',
      value: 'ap',
      disabled: player.cf < 8
    }, {
      label: 'Discard 10 coin for 2 CF',
      sub: '10 coin',
      value: 'dc',
      disabled: player.coin < 10
    }, {
      label: 'Close',
      value: 'close'
    }];
    const v = await modal('Crowd Favor', `<p>Crowd Favor is spent in Phase 3. If it ever drops below zero, you are eliminated. You have <b>${player.cf} CF</b> and <b>${player.coin} coin</b>.</p>`, opts);
    if (v === 'close' || !v) break;
    if (v === 'mk') {
      player.cf -= 3;
      player.market = true;
      log(`${nm(player)} spends 3 CF to unlock the market.`);
    }
    if (v === 'key') {
      player.cf -= 5;
      player.keys++;
      log(`${nm(player)} buys an Arena Key.`);
    }
    if (v === 'card') {
      player.cf -= 5;
      await drawArena(player);
    }
    if (v === 'el') {
      player.cf -= 8;
      player.items.push(mkOffer('elix4'));
      log(`${nm(player)} buys a Health Elixir token.`);
    }
    if (v === 'ap') {
      player.cf -= 8;
      player.items.push(mkOffer('ap3'));
      log(`${nm(player)} buys an AP Upgrade token.`);
    }
    if (v === 'dc') {
      player.coin -= 10;
      coinLog(player, -10, 'thrown to the crowd');
      player.cf += 2;
      log(`${nm(player)} throws 10 coin to the crowd (+2 CF).`);
    }
    render();
    if (S.over || !player.alive) break;
  }
}
/* openTrade — human trade window: pick a gladiator in range, then trade, gift, or propose / break a truce. CPUs answer via cpuAcceptsTrade / cpuAcceptsTruce; humans get a dialog. */
async function openTrade(player) {
  const partners = tradePartners(player);
  const qid = await modal('Trade or truce', '<p>Trading is a one-to-one exchange with a gladiator within 4 tiles. A truce is a verbal pact with no penalty for breaking it.</p>', partners.map(other => ({
    label: other.name,
    sub: `${other.cpu ? 'CPU' : 'player'} · ${cheb(player, other)} tiles away${inTruce(player, other) ? ' · in truce' : ''}`,
    value: other.id
  })).concat([{
    label: 'Cancel',
    value: null
  }]));
  if (qid == null) return;
  const q = S.players[qid];
  const what = await modal(`With ${q.name}`, '<p>What would you like to propose?</p>', [{
    label: 'Propose a trade',
    value: 'trade',
    primary: 1
  }, {
    label: 'Give a gift',
    sub: 'hand over an item, coin or weapon',
    value: 'gift'
  }, {
    label: inTruce(player, q) ? 'Break the truce' : 'Propose a truce',
    value: 'truce',
    disabled: (!!EV().noTruce || !!S.truceGone) && !inTruce(player, q),
    sub: S.truceGone && !inTruce(player, q) ? 'no more truces this event' : S.tutorial && !inTruce(player, q) ? 'Flavius will not allow it in a lesson' : undefined
  }, {
    label: 'Cancel',
    value: null
  }]);
  if (what === 'truce') {
    if (inTruce(player, q)) {
      S.truces.delete(truceKey(player.id, q.id));
      log(`${nm(player)} ends the truce with ${nm(q)}.`);
      return;
    }
    let ok;
    if (q.cpu) ok = cpuAcceptsTruce(q, player);else ok = await modal(`${q.name}: truce offer`, `<p>${typeof truceWho==='function'?truceWho(player):player.name} proposes a truce. Accept?</p>`, [{
      label: 'Accept',
      value: 1,
      primary: 1
    }, {
      label: 'Refuse',
      value: 0
    }]);
    if (ok) {
      makeTruce(player, q);
    } else log(`${nm(q)} refuses the truce.`);
    return;
  }
  if (what === 'gift') {
    const mine = tradeables(player);
    if (!mine.length) return;
    const gi = await modal(`Gift to ${q.name}`, '<p>Choose what to give. Allies remember generosity.</p>', mine.map((x, i) => ({
      label: x.label,
      value: i
    })).concat([{
      label: 'Cancel',
      value: null
    }]));
    if (gi == null) return;
    doGift(player, q, mine[gi]);
    if (q.cpu) think(q, pickOne(['Gratias, friend.', 'I will not forget this.', 'The gods smile on you.']), 'gift');
    return;
  }
  if (what !== 'trade') return;
  const mine = tradeables(player),
    theirs = tradeables(q);
  if (!mine.length || !theirs.length) {
    await modal('Nothing to trade', '<p>One of you has nothing tradeable.</p>', [{
      label: 'OK',
      value: 1
    }]);
    return;
  }
  const gi = await modal('You give…', '', mine.map((x, i) => ({
    label: x.label,
    value: i
  })).concat([{
    label: 'Cancel',
    value: null
  }]));
  if (gi == null) return;
  const ti = await modal('…and ask for', `<p>${q.name} holds:</p>`, theirs.map((x, i) => ({
    label: x.label,
    value: i
  })).concat([{
    label: 'Cancel',
    value: null
  }]));
  if (ti == null) return;
  const give = mine[gi],
    get = theirs[ti];
  let ok;
  if (q.cpu) ok = cpuAcceptsTrade(q, give, get);else ok = await modal(`${q.name}: trade offer`, `<p>${player.name} offers ${give.label} for your ${get.label}. Accept?</p>`, [{
    label: 'Accept',
    value: 1,
    primary: 1
  }, {
    label: 'Refuse',
    value: 0
  }]);
  if (ok) {
    doTrade(player, q, give, get);
  } else log(`${nm(q)} refuses the trade.`);
}
document.addEventListener('click', e => {
  if (e.target.closest('#btnSimEnd')) simToEnd();
});

/* v0.25 THE HORNS SOUND: a title card as every event begins — what it is, where, how many fight; the summa rudis in smaller type */
/* v0.45 THE EVENT BRIEFING — replaces the 3-second splash. It opens when the horns sound (the first turn waits
   for it), names the event, where, who fights, each round's rules and how the round ends, and how to WIN.
   The 📋 Event button on the top bar reopens it at any time. Settings → General can switch the opening one off. */
const END_TXT = {
  'npc4|elim1': 'four beasts are slain, or one gladiator falls',
  'alive2': 'only two gladiators remain',
  'alive1': 'one gladiator (or side) is left standing',
  allnpc: 'every beast in the arena is slain or tamed',
  commodus: 'Commodus is dethroned',
  eagle: 'the Golden Eagles are carried to the gates',
  exit2: 'two gladiators have escaped through the gates',
  lion1: 'a lion has fallen',
  race: 'a chariot completes three laps',
  rot20: 'twenty rotations have passed',
  rot10: 'ten rotations have passed',
  team1: 'one team is left standing',
  elim1: 'the first gladiator falls',
  npc: 'enough beasts are slain',
  rot: 'enough rotations have passed',
  cf: 'a gladiator reaches the Crowd Favor target',
  beasts: 'every beast is slain or tamed',
  survive: 'the rotations run out — everyone standing wins'
};
const RULE_INFO = {
  pve: ['🐾', 'PvE', 'beasts may be attacked', 'No PvE: beasts cannot be attacked this round'],
  pvp: ['⚔', 'PvP', 'gladiators may attack each other', 'No PvP: gladiators cannot attack each other this round'],
  cf: ['👑', 'CF', 'Crowd Favor can be spent (market, crowd purchases, the Eagle)', 'No CF: Crowd Favor cannot be SPENT this round — no market unlock, no crowd purchases, no Eagle redemption. You still earn it.'],
  ca: ['✦', 'Abilities', 'class abilities work', 'No class abilities this round']
};
/* roundRules — which of PvE, PvP, CF and abilities a round allows; live uses the current CF state (e.g. Commodus in the arena). */
function roundRules(roundDef, live) {
  const r = {
    pve: !!roundDef.pve,
    pvp: !!roundDef.pvp,
    cf: live ? cfAllowed() : !!roundDef.cf,
    ca: !!roundDef.ca
  };
  return r;
}
/* briefingHTML — the event briefing: name, place, gladiators, each round's rules, end condition and reward, and how to win. */
function briefingHTML() {
  const ev = EV();
  const L = LOCATIONS[S.locIdx];
  const n = S.players.length;
  const teams = ev.teams || ev.coop ? [...new Set(S.players.map(player => player.team))].length : 0;
  const rows = ev.rounds.map((roundDef, i) => {
    const on = i === S.ri && S.phase !== 'setup';
    const rr = roundRules(roundDef, on);
    const zs = ZONES[roundDef.zone] ? ZONES[roundDef.zone][1] - ZONES[roundDef.zone][0] + 1 : 13;
    const chips = Object.keys(RULE_INFO).map(k => `<span class="rchip ${rr[k] ? 'yes' : 'no'}" title="${esc(rr[k] ? RULE_INFO[k][2] : RULE_INFO[k][3])}">${rr[k] ? '' : '🚫 '}${RULE_INFO[k][0]} ${RULE_INFO[k][1]}</span>`).join('');
    const rw = roundDef.reward || {};
    const rwTxt = [rw.win ? `the winner takes ${rw.win} CF` : '', rw.coin ? `+${rw.coin} coin` : '', rw.cf ? `+${rw.cf} CF` : '', rw.cards ? `${rw.cards} cards` : ''].filter(Boolean).join(' · ');
    return `<div class="brround ${on ? 'on' : ''} ${i < S.ri ? 'done' : ''}"><div class="brhd"><b>Round ${i + 1} · ${esc(roundDef.n)}</b>${on ? '<em>now</em>' : i < S.ri ? '<em>done</em>' : ''}<span class="rc-sub">${zs}×${zs} zone</span></div><div class="brchips">${chips}</div><div class="brend">Ends when <b>${esc(END_TXT[roundDef.end] || roundDef.end)}</b>${rwTxt ? ` <span class="rc-sub">· ${esc(rwTxt)}</span>` : ''}</div></div>`;
  }).join('');
  const last = ev.rounds[ev.rounds.length - 1];
  const how = ev.teams || ev.coop ? `Be the side still standing when <b>${esc(END_TXT[last.end] || last.end)}</b>.` : `Survive every round. The event is won when <b>${esc(END_TXT[last.end] || last.end)}</b>${last.reward && last.reward.win ? ` — worth <b>${last.reward.win} CF</b>` : ''}. Crowd Favor decides your Fate at the end.`;
  const glads = S.players.map(player => `<span class="brglad ${player.alive ? '' : 'out'}" style="--pc:${player.color}"><b>${esc(player.name)}</b> ${esc(CLASSES[player.cls] ? CLASSES[player.cls].name : '')}${teams ? ' · Team ' + esc(String(player.team)) : ''} · ${player.cpu ? 'CPU' : S.hotseat ? '🎮 player' : 'you'}${player.alive ? '' : player.exited ? ' · exited' : ' · ✝'}</span>`).join('');
  return `<div class="brief"><div class="brtop">${cardHTML('e:' + S.evKey, 'md') || ''}<div><div class="ei-tag">${esc(ev.tag || ev.short || '')}${S.fest ? ' · ' + esc(festName(S.fest.kind)) : ''}${S.missio ? ' · Missio' : ''}</div>
    <div class="brname">${esc(ev.n)}</div><div class="rc-sub">📍 ${esc(L ? L.n : '')} · ⚔ ${n} gladiator${n === 1 ? '' : 's'}${teams ? ` in ${teams} ${ev.coop ? 'as one side' : 'teams'}` : ''}${S.spect && S.spect.length ? ` · 🏟 ${S.spect.filter(x => !x.gone).length} regulars in the stands` : ''}${ev.sr ? ` · Summa rudis: ${esc(ev.sr)}` : ''}</div>
    ${ev.blurb ? `<p style="margin:6px 0 0">${esc(ev.blurb)}</p>` : ''}<div class="brhow">🏆 <b>How to win.</b> ${how}</div></div></div>
    <h4 class="secth">The rounds</h4><div class="brrounds">${rows}</div>
    <h4 class="secth">On the sand</h4><div class="brglads">${glads}</div>
    <p class="rc-sub" style="margin-top:8px">🚫 marks what is <b>not allowed</b> in that round — hover a chip for the full rule. Reopen this any time with <b>📋 Event</b> on the top bar.</p></div>`;
}
/* eventBriefing — opens the briefing window (at the start, or from the Event button). Falls back to the splash in sims, tutorials, when switched off, or if another window stays open (waits up to 1.5 s). */
async function eventBriefing(opening) {
  if (HEADLESS || !S || S.phase === 'setup' && !opening) return;
  const want = typeof SETTINGS === 'undefined' || SETTINGS.briefing === true || SETTINGS.briefing !== false && !navigator.webdriver; /* automated runs boot the old way unless they ask for it */
  if (opening && (S.sim || S.tutorial || !want || typeof MTUT !== 'undefined' && MTUT.on)) {
    eventIntroSplash();
    return;
  }
  if (opening) {
    const G = S;
    for (let i = 0; i < 15 && modalBusy(); i++) await new Promise(r => setTimeout(r, 100));
    if (G !== S) return;
    if (modalBusy()) {
      eventIntroSplash();
      return;
    }
  }
  if (typeof sfx === 'function' && opening) sfx('cheer');
  await modal(opening ? '📋 The briefing' : '📋 This event', briefingHTML(), [{
    label: opening ? '⚔ To the sand' : 'Back to the sand',
    value: 1,
    primary: 1
  }], {
    wide: true,
    close: 1
  });
}
/* eventIntro — old entry point; just shows the splash. */
function eventIntro() {
  eventIntroSplash();
}
/* eventIntroSplash — shows the event title card over the arena; click it or wait for it to fade. TWEAK: display time (1800 ms on fast speed, 3400 ms otherwise). */
function eventIntroSplash() {
  const ev = EV();
  const L = LOCATIONS[S.locIdx];
  const wrap = cv && cv.parentElement;
  if (!wrap) return;
  const old = document.getElementById('evIntro');
  if (old) old.remove();
  const n = S.players.length;
  const d = document.createElement('div');
  d.id = 'evIntro';
  d.className = 'evintro';
  d.innerHTML = `<div class="ei-card">${cardHTML('e:' + S.evKey, 'md') || ''}<div class="ei-txt"><div class="ei-tag">${esc(ev.tag || ev.short || '')}</div><div class="ei-name">${esc(ev.n)}</div><div class="ei-where">📍 ${esc(L ? L.n : '')} <span>·</span> ⚔ ${n} gladiator${n === 1 ? '' : 's'}</div></div></div>`;
  d.onclick = () => d.remove();
  wrap.appendChild(d);
  setTimeout(() => {
    d.classList.add('out');
    setTimeout(() => d.remove(), 700);
  }, SPEED === 'fast' ? 1800 : 3400);
}
document.addEventListener('click', e => {
  if (e.target.closest('#btnEvInfo,.rulechip')) {
    if (!S || S.phase === 'setup') {
      mToastSafe('No event on the sand yet — sound the horns from New event.');
      return;
    }
    if (!modalBusy()) eventBriefing(false);
  }
});

/* v0.41: a gladiator in the tunnels is not on the sand — the chosen exit shows a pulsing ring in their color */
/* drawUnderground — note: the ring and name use the class color (CLASSES[cls].color), not the player color. TWEAK: 1600 ms pulse, alpha .35 +/- .35, ring size 0.34 TW. */
function drawUnderground(player) {
  const m = center(player.r, player.c);
  const ph = performance.now() % 1600 / 1600;
  const col = CLASSES[player.cls] && CLASSES[player.cls].color || '#c9a458';
  ctx.save();
  ctx.strokeStyle = col;
  ctx.globalAlpha = 0.35 + 0.35 * Math.sin(ph * Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ell(m.x, m.y, TW * 0.34, TW * 0.17);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = col;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⬇ ' + String(player.name).split(' ')[0], m.x, m.y - TW * 0.26);
  ctx.restore();
}
