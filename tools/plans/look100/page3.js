/* look100/page3.js — ROUND 3: the shield/elbow fix, FULL OUTFITTING (max load + every printed piece and weapon), FACES. make3.js drives it. */
const BG = '#e9e1cf', INK = '#3a2c20', DIM = '#6a5038';
const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(src)); i.src = src; });
const cv = (w, h, bg = BG) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
const txt = (g, s, x, y, size = 15, col = INK, bold) => { g.fillStyle = col; g.font = `${bold ? '600 ' : ''}${size}px Georgia, serif`; g.fillText(s, x, y); };
const webpKB = (c) => Math.round(atob(c.toDataURL('image/webp', 0.9).split(',')[1]).length / 102.4) / 10;
const cells = (im, w, h) => Array.from({ length: 8 }, (_, i) => { const [c, g] = cv(w, h, null); g.drawImage(im, i * w, 0, w, h, 0, 0, w, h); return c; });
const STANCE = { p: [0, -140, 10], j: { pe: [4, -20, 0], sp: [12, 10, 0], ch: [8, 10, 0], he: [-16, 8, 0] }, f: { L: [150, 230, 10], R: [-160, -230, -40] } };
const ARMS = { shield: { h: { L: [-20, 1050, 330] }, hp: { L: [1, -0.3, 0.3] } }, shieldHi: { h: { L: [40, 1250, 360] }, hp: { L: [1, -0.5, 0.1] } }, shieldLo: { h: { L: [80, 930, 300] }, hp: { L: [1, -0.2, 0.4] } },
  offhand: { h: { L: [210, 1230, 330] }, hp: { L: [1, -0.6, -0.2] } }, sword: { h: { R: [-320, 1160, 280] }, hp: { R: [1, -1, -0.3] } }, swordHi: { h: { R: [-260, 1500, 120] }, hp: { R: [1, 0.2, -1] } } };
const poseSpec = (L, R) => ({ p: STANCE.p, j: STANCE.j, f: STANCE.f, h: Object.assign({}, ARMS[L].h, ARMS[R].h), hp: Object.assign({}, ARMS[L].hp, ARMS[R].hp) });
const isShield = (k) => k === 'scutum' || k === 'thracian' || k === 'achilles';
function grip(T, kit) { if (isShield(kit.L)) T.align('L', { o: [0, 0, 1] }); else T.align('L', { f: [0.15, 0.3, 1] }); if (kit.R) T.align('R', { f: ['hasta', 'trident', 'jade', 'pilum'].includes(kit.R) ? [-0.05, 0.12, 1] : kit.R === 'bow' || kit.R === 'lyre' ? [0, 1, 0.2] : [-0.1, 0.35, 1] }); }
const SKIN = '#ad7a5c', SKIN_F = '#bb8a6c';
const FACE = { face2: 1, headRes: 0.0022 };
async function token(opt) { const t0 = performance.now(); const T = await LOOK.createToken(Object.assign({ res: 0.005, scale: 1.15, paint: 1 }, opt)); T.buildMs = Math.round(performance.now() - t0); return T; }
const sheetOf = (T) => { const r = T.sheet(); return { canvas: r.canvas, meta: r.meta, ms: r.ms, kb: webpKB(r.canvas) }; };
const HERO = { w: 512, h: 512, span: 2.55, cy: 0.98, el: 20 };
const kill = (T, L) => { for (const m of L) { if (Array.isArray(m.material)) { m.material.forEach(x => x.dispose()); m.userData.ownMat = 0; } T.B.kit.kill(m); }
  for (const ch of T.B.rig.bones.pe.children) { ch.visible = true; if (ch.userData.ink) ch.userData.ink.visible = true; } };

window.LOOK_RUN3 = async function () {
  const R = { files: {}, stats: {} }; const out = (k, c) => { R.files[k] = c.toDataURL('image/png'); };
  const inv = await (await fetch('r3_inventory.json')).json();
  const M = await token({ body: Object.assign({ grip: { L: 'bar', R: 'hilt' } }, FACE) }); R.stats.buildFace2 = M.buildMs; R.stats.vertsFace2 = M.B.stats.verts;
  M.apply({ look: { hs: 'crop', skin: SKIN } });
  /* ---------- 1. the elbow behind the scutum ---------- */
  {
    let L = LOOK.murmKit(M.B, {});
    const shots = [];
    for (const [arm, sw, lab] of [['shield', 'sword', 'guard'], ['shieldHi', 'swordHi', 'shield high, sword raised'], ['shieldLo', 'sword', 'shield low']]) {
      M.apply({ pose: M.specPose(poseSpec(arm, sw)) }); grip(M, { L: 'scutum', R: 'gladius' });
      shots.push([lab + ' · front', M.hero(Object.assign({}, HERO, { yaw: 20, w: 260, h: 300 }))], [lab + ' · shield-arm side', M.hero(Object.assign({}, HERO, { yaw: -100, w: 260, h: 300 }))], [lab + ' · behind the shield', M.hero(Object.assign({}, HERO, { yaw: -150, w: 260, h: 300 }))]);
    }
    M.apply({ pose: M.specPose(poseSpec('shield', 'sword')) }); grip(M, { L: 'scutum', R: 'gladius' });
    const s = sheetOf(M); R.stats.shield = { kb: s.kb, meta: s.meta }; out('r3_murm_sheet', s.canvas);
    const [c, g] = cv(20 + 3 * 270, 60 + 3 * 330 + 200); txt(g, 'Round 3 · 1. the elbow stays behind the scutum', 20, 30, 18, INK, 1);
    shots.forEach(([l, im], i) => { const x = 20 + (i % 3) * 270, y = 50 + Math.floor(i / 3) * 330; g.drawImage(im, x, y + 18); txt(g, l, x, y + 12, 13); });
    const y0 = 50 + 3 * 330; cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 20 + i * 100, y0 + 10, cc.width * 0.9, cc.height * 0.9));
    txt(g, 'Fix: the board follows the FOREARM (elbow → wrist), 85 mm off its axis; the grip twist turns about the forearm; brackets join the handle to the board.', 20, y0 + 150, 13, DIM);
    txt(g, `8 facings: ${s.kb} KB WebP · cell [${s.meta}]`, 20, y0 + 170, 13, DIM);
    out('r3_shield', c); kill(M, L);
  }
  /* ---------- 2a. maximum load ---------- */
  {
    const want = [{ k: 'murmillo' }, { k: 'thorax' }, { k: 'balteus' }, { k: 'provmanica', sd: 'R' }, { k: 'wraps', sd: 'R' }, { k: 'bracers', sd: 'R' }, { k: 'galerus', sd: 'L' }, { k: 'wraps', sd: 'L' },
      { k: 'thighplate', sd: 'L' }, { k: 'thighplate', sd: 'R' }, { k: 'legwraps', sd: 'L' }, { k: 'legwraps', sd: 'R' }, { k: 'cnemis', sd: 'L' }, { k: 'ocrea', sd: 'R' },
      { k: 'legwrapsU', sd: 'L' }, { k: 'pectorale' }, { k: 'manica', sd: 'R' }];   /* the last three must be REFUSED by the rules */
    const chk = LOOK.outfitCheck(want); R.stats.maxRefused = chk.refused;
    const t0 = performance.now(); let L = LOOK.outfit(M.B, chk.keep); const WK = LOOK.weaponKit(M.B, { L: 'scutum', R: 'gladius' }); L = L.concat(WK); R.stats.maxBuildMs = Math.round(performance.now() - t0);
    M.apply({ pose: M.specPose(poseSpec('shield', 'sword')) }); grip(M, { L: 'scutum', R: 'gladius' });
    const s = sheetOf(M); R.stats.max = { kb: s.kb, meta: s.meta, ms: s.ms, px: [s.canvas.width, s.canvas.height] }; out('r3_maxload_sheet', s.canvas);
    const hero = M.hero(Object.assign({ yaw: 24 }, HERO)), back = M.hero(Object.assign({}, HERO, { yaw: 200, w: 300, h: 300 })), side = M.hero(Object.assign({}, HERO, { yaw: -70, w: 300, h: 300 }));
    /* without the shield: the stack itself */
    for (const m of WK) { m.visible = false; if (m.userData.ink) m.userData.ink.visible = false; }
    M.apply({ pose: M.presets.find(p => p[0] === 'stand')[2] }); const bare = M.hero(Object.assign({}, HERO, { yaw: 30, w: 300, h: 360 })), bareB = M.hero(Object.assign({}, HERO, { yaw: 210, w: 300, h: 360 }));
    const [c, g] = cv(1620, 940); txt(g, 'Round 3 · 2. MAXIMUM LOAD — every equip point filled by the game\'s stacking rules, layered shells (no z-fight, no poke-through)', 20, 30, 18, INK, 1);
    cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 20 + i * 180 + (180 - s.meta[0]) / 2, 50));
    txt(g, `8 facings ${s.canvas.width}×${s.canvas.height} · ${s.kb} KB WebP · ${s.ms} ms · outfit built in ${R.stats.maxBuildMs} ms`, 20, 220, 13, DIM);
    g.drawImage(hero, 20, 240); g.drawImage(side, 540, 240); g.drawImage(back, 850, 240); g.drawImage(bare, 540, 560); g.drawImage(bareB, 850, 560);
    txt(g, 'shield + sword hidden, standing:', 540, 556, 13);
    const lines = ['WORN (location · equip point · layer):', 'head · helm · Steel Gated Helm (murmillo) — rigid', 'chest · chest · Reinforced Chest (thorax) — plate 12.5 mm, own pauldrons',
      'chest · belt · Leather Belt II (balteus) — belt 19 mm, ON the plate', 'R arm · upper · Manica (provmanica) — plate + flare', 'R arm · lower · Padded Arm (wraps) 6 mm + Flavius\' Bracers 12.5 mm',
      'L arm · upper · Lorica Segmentata (galerus) — plate + 2 flares', 'L arm · lower · Padded Arm (wraps)', 'legs · upper · Tasset Armor (thighplate) both', 'legs · lower · Padded Leg (legwraps) 6 mm under the greaves',
      'L leg · lower · Steel Greaves (cnemis) · R leg · lower · Greaves (ocrea)', 'L hand · Scutum (strapped) · R hand · Gladius', '', 'REFUSED by the rules (outfitCheck = armorConflict + armPad):'].concat(chk.refused.map(r => '✗ ' + r[0] + ' — ' + r[1]));
    lines.forEach((s2, i) => txt(g, s2, 1170, 260 + i * 19, 12, i === 0 || s2.startsWith('REFUSED') ? INK : DIM, i === 0 || s2.startsWith('REFUSED')));
    out('r3_maxload', c); kill(M, L);
  }
  /* ---------- 2b. contact sheet: every printed armor piece + every weapon on the mannequin ---------- */
  {
    const arm = inv.arm.filter(a => LOOK.PIECES[a.k]), wpn = inv.w.filter(w => LOOK.WEAPONS[w.k]);
    const missingA = inv.arm.filter(a => !LOOK.PIECES[a.k]).map(a => a.k), missingW = inv.w.filter(w => !LOOK.WEAPONS[w.k]).map(w => w.k);
    const CW = 190, CH = 250, COLS = 8; const all = arm.map(a => ['a', a]).concat(wpn.map(w => ['w', w])); const rows = Math.ceil(all.length / COLS);
    const [c, g] = cv(20 + COLS * CW, 60 + rows * (CH + 44) + 40); txt(g, `Round 3 · 2. every printed armor piece (${arm.length}) and weapon (${wpn.length}) on the mannequin — name · key · slot/point · AP · layer`, 20, 30, 18, INK, 1);
    M.apply({ look: { hs: 'crop', skin: '#b9a48c' } }); M.B.kit.setHarness(false);
    const t0 = performance.now(); const times = [];
    for (let i = 0; i < all.length; i++) {
      const [kind, it] = all[i], ts = performance.now(); let L, pose;
      if (kind === 'a') { const D = LOOK.PIECES[it.k]; const list = D.seg === 'head' || D.seg === 'torso' || D.seg === 'belt' ? [{ k: it.k }] : [{ k: it.k, sd: 'L' }, { k: it.k, sd: 'R' }]; L = LOOK.outfit(M.B, list); M.apply({ pose: M.presets.find(p => p[0] === 'stand')[2] }); }
      else { const kit = isShield(it.k) ? { L: it.k } : { R: LOOK.WEAPONS[it.k] }; L = LOOK.weaponKit(M.B, kit); M.apply({ pose: M.specPose(poseSpec(isShield(it.k) ? 'shield' : 'offhand', 'swordHi')) }); grip(M, kit); }
      const D = kind === 'a' ? LOOK.PIECES[it.k] : null;
      const yaw = kind === 'a' ? (D.seg === 'head' ? 30 : D.seg.endsWith('U') || D.seg.endsWith('L') ? 35 : 25) : isShield(it.k) ? 15 : 75;
      const im = M.hero(Object.assign({}, HERO, { yaw, w: CW - 10, h: CH, span: 2.65, cy: 1.02 }));
      const x = 20 + (i % COLS) * CW, y = 50 + Math.floor(i / COLS) * (CH + 44);
      g.drawImage(im, x, y + 32); txt(g, (it.n || it.k).slice(0, 26), x, y + 12, 12.5, INK, 1);
      txt(g, kind === 'a' ? `${it.k} · ${it.slot}/${it.pt} · AP ${it.ap} · ${D.layer}` : `${it.k} · L${it.lv}${it.flags.includes('both') ? ' · 2-hand' : ''}${it.flags.includes('shield') ? ' · shield' : ''}`, x, y + 27, 11, DIM);
      kill(M, L); times.push(Math.round(performance.now() - ts));
    }
    R.stats.contact = { pieces: arm.length, weapons: wpn.length, missingA, missingW, ms: Math.round(performance.now() - t0), perCellMs: Math.round(times.reduce((a, b) => a + b, 0) / times.length) };
    txt(g, `Not in this sheet: ${missingA.concat(missingW).join(', ') || 'none'} · one cell ≈ ${R.stats.contact.perCellMs} ms (build pieces + 1 render).`, 20, 50 + rows * (CH + 44) + 20, 13, DIM);
    out('r3_contact', c);
  }
  /* ---------- 3. faces: before vs after, male + female, 512 and board size ---------- */
  {
    const heads = [];
    for (const [lab, fem, face] of [['male · before', 0, 0], ['male · after', 0, 1], ['female · before', 1, 0], ['female · after', 1, 1]]) {
      if (fem) LOOK.setBody(LOOK.FEM_BODY);
      const T = face ? (fem ? await token({ body: Object.assign({ fem: 1 }, FACE) }) : M) : await token({ body: fem ? { fem: 1 } : {} });
      T.apply({ look: fem ? { hs: 'long', fem: 1, skin: SKIN_F } : { hs: 'crop', bs: 'stubble', skin: SKIN }, pose: T.presets.find(p => p[0] === 'ready')[2] });
      const big = T.hero({ yaw: 18, w: 512, h: 512, span: 0.36, focus: 'he', fdy: 0.1, el: 8, outlinePx: 1.6 }), pro = T.hero({ yaw: 70, w: 250, h: 250, span: 0.36, focus: 'he', fdy: 0.1, el: 8, outlinePx: 1.6 });
      const s = sheetOf(T); heads.push({ lab, big, pro, s, verts: T.B.stats.verts, ms: T.buildMs }); if (fem) LOOK.setBody(null);
    }
    R.stats.faces = heads.map(h => ({ lab: h.lab, verts: h.verts, buildMs: h.ms, kb: h.s.kb }));
    const [c, g] = cv(20 + 4 * 530, 60 + 512 + 270 + 330); txt(g, 'Round 3 · 3. FACES — before (5 mm grid, round blends, eyeballs) vs after (2.2 mm head grid, firm planes, painted eyes, mouth line)', 20, 30, 18, INK, 1);
    heads.forEach((h, i) => { const x = 20 + i * 530; txt(g, h.lab, x, 54, 15, INK, 1); g.drawImage(h.big, x, 62); g.drawImage(h.pro, x, 580);
      const cs = cells(h.s.canvas, h.s.meta[0], h.s.meta[1]); g.drawImage(cs[0], x + 260, 590); g.drawImage(cs[1], x + 370, 590);
      /* board size head, zoomed ×3 (nearest) so the pixels show */
      g.imageSmoothingEnabled = false; const hc = cs[0]; g.drawImage(hc, hc.width / 2 - 14, 0, 28, 28, x + 260, 760, 84, 84); g.drawImage(cs[1], cs[1].width / 2 - 14, 0, 28, 28, x + 370, 760, 84, 84); g.imageSmoothingEnabled = true;
      txt(g, `board size (1×) · head ×3 · ${h.s.kb} KB · ${h.verts} verts · build ${h.ms} ms`, x + 260, 870, 11.5, DIM); });
    out('r3_faces', c);
  }
  R.layers = Object.fromEntries(Object.entries(LOOK.PIECES).map(([k, d]) => [k, Object.assign({}, d, { offsetMm: d.layer === 'helm' ? 'rigid' : Math.round((LOOK.LAYER[d.layer] || 0) * 10000) / 10 })]));
  return R;
};
