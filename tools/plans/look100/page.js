/* look100/page.js — runs inside look.html (driven by make.js). Builds the tokens, renders, composes the five sheets. */
const MURM_POSE = { p: [0, -90, 10], j: { pe: [0, -18, 0], sp: [8, 8, 0], ch: [6, 8, 0], he: [-8, 4, 0], wL: [0, 90, 0], wR: [30, 0, 30] },
  f: { L: [150, 190, 4], R: [-150, -200, -45] }, h: { L: [150, 960, 300], R: [-200, 1000, 260] }, hp: { L: [1, -0.6, -0.2], R: [1, -1, -0.3] } };
const SEV_POSE = { p: [0, -60, 0], j: { pe: [0, -12, 0], sp: [10, 4, 0], ch: [6, 4, 0], he: [-14, 14, 0], wR: [30, 0, 30] },
  f: { L: [150, 120, 6], R: [-150, -140, -35] }, h: { L: [380, 1240, 260], R: [-220, 980, 240] }, hp: { L: [1, -0.2, -0.6], R: [1, -1, -0.3] } };
const BG = '#e9e1cf', INK = '#3a2c20';
const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(src)); i.src = src; });
const cv = (w, h, bg = BG) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
const txt = (g, s, x, y, size = 15, col = INK, bold) => { g.fillStyle = col; g.font = `${bold ? '600 ' : ''}${size}px Georgia, serif`; g.fillText(s, x, y); };
const webpKB = (c) => { const u = c.toDataURL('image/webp', 0.9); return Math.round(atob(u.split(',')[1]).length / 102.4) / 10; };
/* a sheet image → its 8 cells (meta [w,h,ax,ay]) */
const cells = (im, w, h) => Array.from({ length: 8 }, (_, i) => { const [c, g] = cv(w, h, null); g.drawImage(im, i * w, 0, w, h, 0, 0, w, h); return c; });
/* the game's iso tile under a token: TW wide, TH = TW/2, the token scaled so its base fits the tile like the minis do */
function boardRow(g, x0, y0, list, TW = 100) {
  list.forEach(({ c, ax, ay, s }, i) => {
    const cx = x0 + TW / 2 + i * (TW + 16), cy = y0;
    g.beginPath(); g.moveTo(cx, cy - TW / 4); g.lineTo(cx + TW / 2, cy); g.lineTo(cx, cy + TW / 4); g.lineTo(cx - TW / 2, cy); g.closePath();
    g.fillStyle = '#d9c28f'; g.fill(); g.strokeStyle = 'rgba(80,60,30,.55)'; g.lineWidth = 1.2; g.stroke();
    const k = s; g.drawImage(c, cx - ax * k, cy + TW / 8 - ay * k, c.width * k, c.height * k);
  });
}
async function token(opt) { const t0 = performance.now(); const T = await LOOK.createToken(Object.assign({ res: 0.005 }, opt)); T.buildMs = Math.round(performance.now() - t0); return T; }
function sheetOf(T) { const r = T.sheet(); return { canvas: r.canvas, meta: r.meta, ms: r.ms, kb: webpKB(r.canvas) }; }

window.LOOK_RUN = async function () {
  const R = { files: {}, stats: {} };
  const out = (k, c) => { R.files[k] = c.toDataURL('image/png'); };
  /* ---------- tokens ---------- */
  const M = await token({ body: { grip: { L: 'bar', R: 'hilt' } } });
  M.apply({ look: { hs: 'crop' }, pose: M.specPose(MURM_POSE) }); LOOK.murmKit(M.B, {});
  const mS = sheetOf(M); R.stats.murm = { build: M.buildMs, sheet: mS.ms, kb: mS.kb, meta: mS.meta, px: [mS.canvas.width, mS.canvas.height] }; out('murm_sheet', mS.canvas);
  const mHero = M.hero({ yaw: 22, w: 512, h: 512, span: 2.2, cy: 0.86, el: 20 }); out('murm_hero512', mHero);
  const t1 = performance.now(); { const hc = M.hero({ yaw: 22, w: 512, h: 512, span: 2.2, cy: 0.86 }); hc.getContext('2d').getImageData(0, 0, 4, 4); } R.stats.heroMs = Math.round(performance.now() - t1);
  const gripClose = [M.hero({ yaw: -70, w: 300, h: 300, span: 0.42, cy: 1.0, cx: -0.12, cz: 0.2, base: false, outlinePx: 1.2 })];

  const HV = (T, sd, yawDeg, span = 0.3) => { const x = sd === 'R' ? -0.41 : 0.41, y = 0.87, th = yawDeg * Math.PI / 180; return T.hero({ yaw: yawDeg, w: 240, h: 240, span: 0.32, focus: 'w' + sd, base: false, outlinePx: 1.2 }); };
  /* today's open hands, same body, no gear (the v0.99 build) */
  const O = await token({}); O.apply({ look: { hs: 'crop' }, pose: O.presets.find(p => p[0] === 'stand')[2] });
  const openR = [HV(O, 'R', 90), HV(O, 'R', 30)], openL = [HV(O, 'L', -90), HV(O, 'L', -30)];
  /* the fists alone, hanging hands: hilt + shield handle */
  const G = await token({ body: { grip: { L: 'bar', R: 'hilt' } } }); G.apply({ look: { hs: 'crop' }, pose: G.presets.find(p => p[0] === 'stand')[2] });
  LOOK.murmKit(G.B, { helm: false, manica: false, greave: false, belt: false, wraps: false, handle: true });
  const fistR = [HV(G, 'R', 90), HV(G, 'R', 30)], fistL = [HV(G, 'L', -90), HV(G, 'L', -30)];

  /* female (Amazonia-type) vs male, same pose, base kit only */
  const F = await token({ body: { fem: 1 } }); const pose0 = F.presets.find(p => p[0] === 'ready')[2];
  F.apply({ look: { hs: 'long', fem: 1, skin: '#c9a283' }, pose: pose0 });
  const fS = sheetOf(F); R.stats.fem = { build: F.buildMs, sheet: fS.ms, kb: fS.kb, meta: fS.meta }; out('fem_sheet', fS.canvas);
  O.apply({ pose: O.presets.find(p => p[0] === 'ready')[2] });
  const oS = sheetOf(O); R.stats.male = { build: O.buildMs, sheet: oS.ms, kb: oS.kb, meta: oS.meta };
  const fHero = F.hero({ yaw: 25, w: 512, h: 512, span: 2.2, cy: 0.86 }), oHero = O.hero({ yaw: 25, w: 512, h: 512, span: 2.2, cy: 0.86 });
  /* the gladiatrix armed too (same kit, her build) */
  const FA = await token({ body: { fem: 1, grip: { L: 'bar', R: 'hilt' } } }); FA.apply({ look: { hs: 'long', fem: 1, skin: '#c9a283', noHarness: 1 }, pose: FA.specPose(MURM_POSE) });
  LOOK.murmKit(FA.B, { helm: false }); const faS = sheetOf(FA); R.stats.femArmed = { sheet: faS.ms, kb: faS.kb };

  /* severed: left forearm gone */
  const SV = await token({ body: { grip: { R: 'hilt' } } }); SV.apply({ look: { hs: 'crop' }, pose: SV.specPose(SEV_POSE) });
  LOOK.murmKit(SV.B, { severL: true }); const svS = sheetOf(SV); R.stats.sev = { kb: svS.kb, meta: svS.meta };
  const svHero = SV.hero({ yaw: -35, w: 512, h: 512, span: 2.2, cy: 0.86 });

  /* ---------- printed references ---------- */
  const mini = await load('../../../assets/minis8_soldier.webp'), miniH = await load('../../../assets/minis8_hero.webp'), today = await load('../../art/rig92/out/guard_sheet.png');
  const pieces = await load('ref/pieces.png');
  const MINI8 = { soldier: [95, 129, 47.3, 109.4], hero: [106, 115, 52.8, 95.1] };
  const tmeta = await (await fetch('../../art/rig92/out/meta.json')).json();
  const tm = tmeta.guard.cell;

  /* ---------- 1. armor + weapons sheet ---------- */
  {
    const rows = [['His 3D mini today — minis8_soldier.webp', mini, MINI8.soldier], ['His 3D mini — minis8_hero.webp (scutum + manica)', miniH, MINI8.hero],
      ['3D token today (v0.99, bare base kit, Guard)', today, tm], ['LOOK TEST — 3D Murmillo-like Soldier (same sheet format)', mS.canvas, mS.meta]];
    const W = 1500, [c, g] = cv(W, 60 + rows.length * 170 + 330);
    txt(g, 'v1.0 look test 1 · printed armor + weapons modelled in 3D on the token · 8 MINI_YAW facings at game size (1×)', 20, 34, 20, INK, 1);
    let y = 60;
    for (const [lab, im, m] of rows) { txt(g, lab, 20, y + 18, 15, INK, 1); const cs = cells(im, m[0], m[1]); cs.forEach((cc, i) => g.drawImage(cc, 20 + i * 150 + (150 - m[0]) / 2, y + 26)); y += 170; }
    txt(g, `new sheet: ${mS.canvas.width}×${mS.canvas.height} px · cell [${mS.meta}] · ${mS.kb} KB WebP q0.9 · ${mS.ms} ms to render (SwiftShader CPU)`, 20, y + 4, 14, '#6a5038');
    y += 30; txt(g, 'On the board — tile width 100 px (TW), facing 0 / 1 / 7, token scaled ×0.8 like the round-base minis', 20, y + 14, 15, INK, 1);
    const ms = cells(mini, ...MINI8.soldier.slice(0, 2)), ns = cells(mS.canvas, mS.meta[0], mS.meta[1]), ts = cells(today, tm[0], tm[1]);
    const k = 0.8; const L = [];
    for (const i of [0, 1, 7]) L.push({ c: ms[i], ax: MINI8.soldier[2], ay: MINI8.soldier[3], s: k });
    for (const i of [0, 1, 7]) L.push({ c: ts[i], ax: tm[2], ay: tm[3], s: k });
    for (const i of [0, 1, 7]) L.push({ c: ns[i], ax: mS.meta[2], ay: mS.meta[3], s: k });
    boardRow(g, 40, y + 190, L, 100);
    txt(g, 'his mini', 100, y + 270, 13); txt(g, 'today 3D (bare)', 450, y + 270, 13); txt(g, 'look test', 800, y + 270, 13);
    /* 2× zoom of facing 0 and 1 */
    for (const [n, i] of [[0, 0], [1, 1]]) g.drawImage(ns[i], 1100 + n * 190, y + 30, ns[i].width * 2, ns[i].height * 2);
    txt(g, '2× (facings 0, 1)', 1150, y + 25, 13);
    out('look100_armor_sheet', c);
  }
  /* ---------- 2. armor hero + the printed art it follows ---------- */
  {
    const [c, g] = cv(1100, 640); txt(g, 'v1.0 look test 1 · hero render 512 px · after his printed art', 20, 34, 20, INK, 1);
    g.drawImage(mHero, 20, 60);
    const pw = 540, ph = pieces.height * pw / pieces.width; g.drawImage(pieces, 550, 90, pw, ph);
    txt(g, 'his art: arm81 manica/spaulder · arm81 greaves · Murmillo Helm · Manica · Greaves (ocrea) · Balteus II', 550, 80, 13);
    const notes = ['Helmet: dome + round-holed grille (texture) + flared brim + fish crest — rigid on the head bone',
      'Manica (sword arm): steel lames shell on upper + lower arm, bronze hem, flared shoulder guard',
      'Ocrea: one gold greave over the knee on the front (left) leg — a shell, follows the pose',
      'Balteus II: wide maroon shell, gold rim + scroll; the base belt ring/studs hidden under it',
      'Gladius: leaf blade, dark ribbed grip, bronze guard, round pommel — IN the closed fist',
      'Scutum: curved rounded board 1.02 × 0.66 m, painted face after his card, gold boss —',
      '   the fist holds the handle behind the boss (center grip), board just past the knuckles',
      'Padded wraps on the shield forearm (the Soldier kit); harness + sandals = avatar.png base kit'];
    notes.forEach((s, i) => txt(g, '• ' + s, 550, 90 + ph + 40 + i * 24, 14));
    txt(g, `hero render ${R.stats.heroMs} ms · body build ${M.buildMs} ms (res 5 mm, SwiftShader)`, 550, 610, 13, '#6a5038');
    out('look100_armor_hero', c);
  }
  /* ---------- 3. grip ---------- */
  {
    const [c, g] = cv(1060, 640); txt(g, 'v2 look test · hands that GRIP (fingers + thumb closed round a bar) vs today\'s open hands · outer + front', 20, 34, 18, INK, 1);
    const rowsG = [['RIGHT hand', 'today: open', openR, 'closed on the gladius hilt', fistR], ['LEFT hand', 'today: open', openL, 'closed on the scutum handle (board hidden)', fistL]];
    rowsG.forEach(([h, a1, A, b1, Bq], r) => { const y = 60 + r * 280; txt(g, h, 20, y + 14, 15, INK, 1); txt(g, a1, 20, y + 34, 14); txt(g, b1, 530, y + 34, 14);
      A.forEach((im, i) => g.drawImage(im, 20 + i * 250, y + 40)); Bq.forEach((im, i) => g.drawImage(im, 530 + i * 250, y + 40)); });
    txt(g, 'The fist is SCULPTED into the body mesh (skinned to the wrist bone); the weapon rides the wrist bone with its grip centred in the fist.', 20, 615, 13, '#6a5038');
    out('look100_grip', c);
    const [c2, g2] = cv(340, 340); g2.drawImage(gripClose[0], 20, 20); out('look100_grip_inpose', c2);
  }
  /* ---------- 4. female body ---------- */
  {
    const W = 1500, [c, g] = cv(W, 1360); txt(g, 'v2 look test · FEMALE body option (Amazonia-type) on the same rig, beside the male · base kit, Ready pose', 20, 34, 20, INK, 1);
    const rowsF = [['male (v0.99 athletic build)', oS], ['female (body100 opt.fem)', fS], ['female + the same Murmillo kit, no helmet (shows the gear fits her shells)', faS]];
    let y = 60; for (const [lab, s] of rowsF) { txt(g, lab + ` · ${s.kb} KB WebP`, 20, y + 18, 15, INK, 1); cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 20 + i * 150 + (150 - s.meta[0]) / 2, y + 26)); y += 170; }
    txt(g, 'On the board (TW 100 px, ×0.8): male · female · female armed', 20, y + 10, 15, INK, 1);
    const pick = (s, i) => ({ c: cells(s.canvas, s.meta[0], s.meta[1])[i], ax: s.meta[2], ay: s.meta[3], s: 0.8 });
    boardRow(g, 40, y + 160, [pick(oS, 0), pick(oS, 1), pick(fS, 0), pick(fS, 1), pick(faS, 0), pick(faS, 1)]);
    y += 230; g.drawImage(oHero, 20, y); g.drawImage(fHero, 540, y); txt(g, 'male · 512', 30, y + 20, 14, INK, 1); txt(g, 'female · 512', 550, y + 20, 14, INK, 1);
    const notes = ['Same skeleton, joints and pose JSON (poses, presets,', 'IK, pins and the 8 facings all carry over).', '',
      'Sculpt changes (opt.fem):', '• lighter muscle table FEM (pecs ½, traps, delts,', '  lats, arms) instead of ATH', '• breasts under the strophium', '• wider hips + fuller seat, narrower waist',
      '• softer abs, jaw and brow', '', 'Limit: shoulder width is set by the rig joints,', 'so she is narrower in muscle, not in bone.', 'A per-body joint scale (shoulders −8%, hips +6%)', 'would need rig.js to take a body table.'];
    notes.forEach((s, i) => txt(g, s, 1080, y + 40 + i * 22, 14));
    out('look100_female', c);
  }
  /* ---------- 5. severed ---------- */
  {
    const [c, g] = cv(1100, 620); txt(g, 'v2 look test · a severed limb on the 3D token (left forearm gone, one frame)', 20, 34, 20, INK, 1);
    g.drawImage(svHero, 20, 70);
    const sc = cells(svS.canvas, svS.meta[0], svS.meta[1]); txt(g, 'board size (facings 0, 1, 2) · 1× and 2×', 560, 90, 15, INK, 1);
    [0, 1, 2].forEach((i, n) => g.drawImage(sc[i], 560 + n * 110, 110));
    [0, 2].forEach((i, n) => g.drawImage(sc[i], 560 + n * 230, 260, sc[i].width * 2, sc[i].height * 2));
    txt(g, 'How: the body mesh drops the forearm triangles past the cut (index only, no rebuild, instant);', 560, 545, 13);
    txt(g, 'a stump cap (flesh, dark rim, bone) + drips ride the elbow bone; gear on that forearm is left off.', 560, 565, 13);
    txt(g, 'A sheet per severed set would be cached like any look (≈ ' + svS.kb + ' KB).', 560, 585, 13);
    out('look100_severed', c);
  }
  return R;
};
