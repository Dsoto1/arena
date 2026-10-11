/* look100/page2.js — ROUND 2 (his answers): painted shading pass, figure +15% against the base, the strapped scutum, a female head + skeleton
   table, the 8 class loadouts. Driven by make2.js; window.LOOK_RUN2() returns the composed sheets as data URLs. */
const BG = '#e9e1cf', INK = '#3a2c20', DIM = '#6a5038';
const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(src)); i.src = src; });
const cv = (w, h, bg = BG) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
const txt = (g, s, x, y, size = 15, col = INK, bold) => { g.fillStyle = col; g.font = `${bold ? '600 ' : ''}${size}px Georgia, serif`; g.fillText(s, x, y); };
const webpKB = (c) => Math.round(atob(c.toDataURL('image/webp', 0.9).split(',')[1]).length / 102.4) / 10;
const cells = (im, w, h) => Array.from({ length: 8 }, (_, i) => { const [c, g] = cv(w, h, null); g.drawImage(im, i * w, 0, w, h, 0, 0, w, h); return c; });
const MINI8 = { hero: [106, 115, 52.8, 95.1], veteranus: [80, 124, 40.2, 104.5], amazonia: [111, 136, 55.6, 116.0], damnatio: [80, 125, 40.2, 105.0], royalty: [82, 130, 41.2, 110.5], soldier: [95, 129, 47.3, 109.4], slave: [138, 133, 68.8, 113.3], venatore: [105, 128, 52.3, 107.8] };
/* the stance: deeper crouch, torso turned into the fight, front foot forward (his 7a "more dynamic") */
const STANCE = { p: [0, -140, 10], j: { pe: [4, -20, 0], sp: [12, 10, 0], ch: [8, 10, 0], he: [-16, 8, 0] }, f: { L: [150, 230, 10], R: [-160, -230, -40] } };
const ARMS = {
  shield: { h: { L: [-20, 1050, 330] }, hp: { L: [1, -0.3, 0.3] } },
  offhand: { h: { L: [230, 1060, 300] }, hp: { L: [1, -0.6, -0.2] } },
  sword: { h: { R: [-330, 1050, 250] }, hp: { R: [1, -1, -0.3] } },
  spear: { h: { R: [-250, 1150, 300] }, hp: { R: [1, -1, -0.3] } },
};
const poseSpec = (L, R) => ({ p: STANCE.p, j: STANCE.j, f: STANCE.f, h: Object.assign({}, ARMS[L].h, ARMS[R].h), hp: Object.assign({}, ARMS[L].hp, ARMS[R].hp) });
function grip(T, kit) { if (kit.L === 'scutum' || kit.L === 'thracian') T.align('L', { o: [0, 0, 1] }); else T.align('L', { f: [0.15, 0.3, 1] }); T.align('R', { f: kit.R === 'hasta' || kit.R === 'trident' ? [-0.05, 0.12, 1] : [-0.1, 0.35, 1] }); }
const CLS = [
  ['soldier', 'Soldier · Centurion helm, Balteus II, wraps, Gladius', { look: { hs: 'crop' }, gear: { head: { t: 'centurion' }, arm: { L: { wraps: 1 }, R: { wraps: 1 } }, leg: { L: { upper: { t: 'legwrapsU' } }, R: { upper: { t: 'legwrapsU' } } } }, belt2: 1, kit: { R: 'gladius' } }],
  ['royalty', 'Royalty · Cassis, Ornate chest, Pugio', { look: { hs: 'curly' }, gear: { head: { t: 'cassis' }, chest: { t: 'ornate' }, arm: { L: { wraps: 1 }, R: { wraps: 1 } } }, kit: { R: 'pugio' } }],
  ['hero', 'Hero · Thracian helm, Provocator manica, Sica + Thracian shield', { look: { hs: 'crop' }, gear: { head: { t: 'thrachelm' }, arm: { L: { upper: { t: 'provmanica' }, wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } } }, kit: { R: 'sica', L: 'thracian' } }],
  ['slave', 'Slave · Galea, Manica, Trident', { look: { hs: 'curly', bs: 'stubble' }, gear: { head: { t: 'galea' }, arm: { L: { upper: { t: 'manica' }, wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } } }, kit: { R: 'trident' } }],
  ['veteranus', 'Veteranus · Helm of Flavius, Musculata, Rudis', { look: { hs: 'crop', bs: 'full', hair: '#8a8580' }, gear: { head: { t: 'flavhelm' }, chest: { t: 'musculata' }, arm: { L: { wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } } }, kit: { R: 'rudis' } }],
  ['amazonia', 'Amazonia · her body · Amazon chest, Cestus, Greaves, Axe + Falcata', { fem: 1, look: { hs: 'long', fem: 1 }, gear: { chest: { t: 'amazon' }, arm: { R: { cestus: 1 } }, leg: { L: { lower: { t: 'greaves' } }, R: { lower: { t: 'greaves' } } } }, kit: { R: 'axe', L: 'falcata' } }],
  ['venatore', 'Venatore · Steel helm, leather belt, Hasta', { look: { hs: 'crop', bs: 'goatee' }, gear: { head: { t: 'steelhelm' }, belt: { c: '#7a4a2a' }, arm: { L: { wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } } }, kit: { R: 'hasta' } }],
  ['damnatio', 'Damnatio · wraps only, Sling', { look: { hs: 'bald', bs: 'stubble' }, gear: { arm: { L: { wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } } }, kit: { R: 'sling' } }],
];
const SKIN = '#bd8664', SKIN_F = '#c99474';
async function token(opt) { const t0 = performance.now(); const T = await LOOK.createToken(Object.assign({ res: 0.005, scale: 1.15, paint: 1 }, opt)); T.buildMs = Math.round(performance.now() - t0); return T; }
const sheetOf = (T) => { const r = T.sheet(); return { canvas: r.canvas, meta: r.meta, ms: r.ms, kb: webpKB(r.canvas) }; };
const HERO = { w: 512, h: 512, span: 2.55, cy: 0.98, el: 20 };

window.LOOK_RUN2 = async function () {
  const R = { files: {}, stats: {} }; const out = (k, c) => { R.files[k] = c.toDataURL('image/png'); };
  /* ---------- the Murmillo-like Soldier, round 2 ---------- */
  const M = await token({ body: { grip: { L: 'bar', R: 'hilt' } } });
  M.apply({ look: { hs: 'crop', skin: SKIN } }); LOOK.murmKit(M.B, {});
  M.apply({ pose: M.specPose(poseSpec('shield', 'sword')) }); grip(M, { L: 'scutum', R: 'gladius' });
  const mS = sheetOf(M); R.stats.murm2 = { build: M.buildMs, sheet: mS.ms, kb: mS.kb, meta: mS.meta, px: [mS.canvas.width, mS.canvas.height] }; out('murm2_sheet', mS.canvas);
  const t1 = performance.now(); const mHero = M.hero(Object.assign({ yaw: 24 }, HERO)); mHero.getContext('2d').getImageData(0, 0, 2, 2); R.stats.hero2Ms = Math.round(performance.now() - t1); out('murm2_hero512', mHero);
  const mBack = M.hero(Object.assign({}, HERO, { yaw: 150, w: 300, h: 300 })), mSide = M.hero(Object.assign({}, HERO, { yaw: -75, w: 300, h: 300 }));
  /* the same, round-1 shading at the round-1 size (for the side-by-side) */
  const r1 = await load('murm_sheet.png'), r1m = [90, 126, 45, 102.9];
  const mini = await load('../../../assets/minis8_soldier.webp');
  {
    const [c, g] = cv(1500, 1060); txt(g, 'Round 2 · the Murmillo-like Soldier: painted shading pass, figure +15% on the same 25.4 mm base, the scutum strapped + held, a fighting stance', 20, 32, 18, INK, 1);
    const rows = [['his 3D mini (minis8_soldier)', mini, MINI8.soldier], ['round 1 (flat toon, 1.00×, shield on the hand only)', r1, r1m], ['ROUND 2 (painted, 1.15×, strapped scutum, stance)', mS.canvas, mS.meta]];
    let y = 52; for (const [lab, im, m] of rows) { txt(g, lab, 20, y + 16, 15, INK, 1); cells(im, m[0], m[1]).forEach((cc, i) => g.drawImage(cc, 20 + i * 160 + (160 - m[0]) / 2, y + 24)); y += 180; }
    txt(g, `round 2 sheet ${mS.canvas.width}×${mS.canvas.height} px · cell [${mS.meta}] · ${mS.kb} KB WebP q0.9 · ${mS.ms} ms (SwiftShader)`, 20, y, 14, DIM);
    g.drawImage(mHero, 20, y + 14); g.drawImage(mSide, 560, y + 30); g.drawImage(mBack, 880, y + 30);
    txt(g, 'from the shield side: the forearm runs along the board, a leather strap round it,', 560, y + 360, 14); txt(g, 'the fist on the handle behind the boss; the back of the hand faces forward', 560, y + 380, 14);
    txt(g, '(a grip constraint turns the wrist after the pose, so any pose keeps the shield face-on).', 560, y + 400, 14);
    txt(g, 'Painted pass: 4-band ramp (58/120/186/255 vs 105/175/255), ambient 0.33π (was 0.46π), warm sun 0.8π, tanned skin.', 560, y + 440, 14, DIM);
    out('look100_r2_armor', c);
  }
  /* ---------- female: her own head and her own skeleton table ---------- */
  {
    LOOK.setBody(LOOK.FEM_BODY);
    const F = await token({ body: { fem: 1, grip: { L: 'bar', R: 'hilt' } } });
    F.apply({ look: { hs: 'long', fem: 1, skin: SKIN_F }, pose: F.presets.find(p => p[0] === 'ready')[2] });
    const fS = sheetOf(F); const fHero = F.hero(Object.assign({ yaw: 20 }, HERO)), fFace = F.hero({ yaw: 15, w: 300, h: 300, span: 0.36, cy: 1.72, el: 8 });
    const fFace3 = F.hero({ yaw: 60, w: 300, h: 300, span: 0.36, cy: 1.72, el: 8 });
    F.apply({ look: { hs: 'long', fem: 1, skin: SKIN_F, noHarness: 1 } }); LOOK.murmKit(F.B, { helm: false }); F.apply({ pose: F.specPose(poseSpec('shield', 'sword')) }); grip(F, { L: 'scutum', R: 'gladius' });
    const faS = sheetOf(F);
    LOOK.setBody(null);
    const O = await token({}); O.apply({ look: { hs: 'crop', skin: SKIN }, pose: O.presets.find(p => p[0] === 'ready')[2] });
    const oS = sheetOf(O); const oHero = O.hero(Object.assign({ yaw: 20 }, HERO)), oFace = O.hero({ yaw: 15, w: 300, h: 300, span: 0.36, cy: 1.72, el: 8 });
    R.stats.fem2 = { build: F.buildMs, kb: fS.kb, armedKb: faS.kb, meta: fS.meta }; R.stats.male2 = { kb: oS.kb, meta: oS.meta }; out('fem2_sheet', fS.canvas);
    const [c, g] = cv(1500, 1290); txt(g, 'Round 2 · female body: her own head + her own skeleton table (shoulders −17 mm, hips +11 mm a side) · painted pass · 1.15×', 20, 32, 18, INK, 1);
    let y = 52; for (const [lab, s] of [['male', oS], ['female', fS], ['female + Murmillo kit (no helmet)', faS]]) { txt(g, `${lab} · ${s.kb} KB WebP`, 20, y + 16, 15, INK, 1); cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 20 + i * 160 + (160 - s.meta[0]) / 2, y + 24)); y += 180; }
    g.drawImage(oHero, 20, y); g.drawImage(fHero, 500, y); txt(g, 'male', 30, y + 18, 14, INK, 1); txt(g, 'female', 510, y + 18, 14, INK, 1);
    g.drawImage(oFace, 1000, y - 10, 240, 240); g.drawImage(fFace, 1250, y - 10, 240, 240); g.drawImage(fFace3, 1250, y + 240, 240, 240);
    txt(g, 'male head', 1010, y + 10, 13); txt(g, 'her head', 1260, y + 10, 13);
    ['Her head: narrower + shorter face, small chin + jaw,', 'softer brow, higher cheekbones, bigger eyes, dark', 'upper lids, fuller lips, smaller nose + ears.', 'Her frame: rig100.setBody(FEM_BODY) moves the', 'shoulder chain in and the hips out before the bones', 'are made; the torso follows (x × 0.92 chest, × 1.05 hips).']
      .forEach((s, i) => txt(g, s, 1000, y + 280 + i * 20, 13));
    out('look100_r2_female', c);
  }
  /* ---------- the 8 class loadouts ---------- */
  {
    const minis = {}; for (const [k] of CLS) minis[k] = await load(`../../../assets/minis8_${k}.webp`);
    const male = await token({ body: { grip: { L: 'bar', R: 'hilt' } } });
    LOOK.setBody(LOOK.FEM_BODY); const fem = await token({ body: { fem: 1, grip: { L: 'hilt', R: 'hilt' } } }); LOOK.setBody(null);
    const [c, g] = cv(1760, 70 + CLS.length * 200); txt(g, 'Round 2 · the 8 class loadouts in 3D (printed pieces from gear.js shells/helmets + the round-2 weapon mount) · his mini on the left · painted · 1.15×', 20, 32, 18, INK, 1);
    R.stats.classes = {};
    for (let n = 0; n < CLS.length; n++) {
      const [k, label, d] = CLS[n]; const T = d.fem ? fem : male; if (d.fem) LOOK.setBody(LOOK.FEM_BODY);
      const kitMeshes = [];
      T.apply({ look: Object.assign({ skin: d.fem ? SKIN_F : SKIN }, d.look), gear: d.gear });
      if (d.belt2) kitMeshes.push(...LOOK.murmKit(T.B, { helm: false, manica: false, greave: false, wraps: false, sword: false, shield: false }));
      kitMeshes.push(...LOOK.weaponKit(T.B, d.kit));
      T.apply({ pose: T.specPose(poseSpec(d.kit.L === 'thracian' ? 'shield' : 'offhand', d.kit.R === 'hasta' || d.kit.R === 'trident' ? 'spear' : 'sword')) }); grip(T, d.kit);
      const s = sheetOf(T), hero = T.hero(Object.assign({ yaw: 24 }, HERO, { w: 190, h: 190 }));
      R.stats.classes[k] = { kb: s.kb, ms: s.ms, meta: s.meta }; out('cls2_' + k, s.canvas);
      const y = 52 + n * 200, mm = MINI8[k];
      txt(g, label + ` · ${s.kb} KB`, 20, y + 14, 14, INK, 1);
      const mc = cells(minis[k], mm[0], mm[1]); g.drawImage(mc[0], 20, y + 22); g.drawImage(mc[1], 20 + 140, y + 22);
      cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 300 + i * 160 + (160 - s.meta[0]) / 2, y + 22));
      g.drawImage(hero, 1560, y + 6);
      for (const m of kitMeshes) T.B.kit.kill(m);
      for (const ch of T.B.rig.bones.pe.children) { ch.visible = true; if (ch.userData.ink) ch.userData.ink.visible = true; }
      if (d.fem) LOOK.setBody(null);
    }
    out('look100_r2_classes', c);
  }
  return R;
};
