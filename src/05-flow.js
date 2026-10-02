let S_SEED_TMP = 0;
/* =====================================================================
   05-FLOW · THE GAME LOOP
   =====================================================================
   From "Begin" to the results screen:
   - mkPlayer/newState: build the arena from an event definition (or a custom one).
   - startEvent(): applies location flavor themes, rolls the day's omen, seats spectators,
     runs Carmina, then hands control to beginTurn/advanceTurn.
   - The rotation upkeep (look for `wrapped`): spectators act, relationships decay,
     the restless-crowd rule, the Gauntlet's editor's-lash, and the editor's-patience
     failsafe (40 bloodless rotations or 200 total ends any stalemate on CF).
   - takeChoice(): phase 2; note the Gauntlet pays no coin here.
   - checkEnd() lives here; gameOver in 10-meta; this file only detects the moment.
   ===================================================================== */
/* ================= EVENT SETUP ================= */
/* mkPlayer — builds a fresh player for seat i from its seat config: class, name, color, team, CPU personality, starting tile, base HP, zero AP and all per-turn counters. */
function mkPlayer(i, s) {
  const C = CLASSES[s.cls];
  const st = s.start || STARTS[i];
  return {
    id: i,
    cls: s.cls,
    name: s.name || (!s.cpu && !s.saved && typeof clsSavedName === 'function' ? clsSavedName(s.cls) : '') || C.hero,
    color: C.color,
    cpu: s.cpu,
    diff: s.diff || 'normal',
    team: s.team || 'P' + (i + 1),
    pers: s.pers || (s.cpu ? s.preset && typeof finalPers === 'function' ? finalPers(s) : rollPersonality(s.cls) : null),
    saved: s.saved || null,
    city: s.city || (C.custom && typeof CUSTOM !== 'undefined' ? (CUSTOM.chars.find(c => 'cc_' + c.id === s.cls) || {}).city : null) || null,
    rating: s.rating || null,
    mgrGid: s.mgrGid || null,
    mgrColor: s.mgrColor || null,
    r: st[0],
    c: st[1],
    start: [...st],
    hp: {
      ...BASE_HP
    },
    ap: {
      head: 0,
      chest: 0,
      larm: 0,
      rarm: 0,
      rleg: 0,
      lleg: 0
    },
    pieces: {
      head: [],
      chest: [],
      larm: [],
      rarm: [],
      rleg: [],
      lleg: []
    },
    wR: null,
    wL: null,
    coin: 0,
    _cf: 0,
    cfLog: {},
    keys: 0,
    items: [],
    alive: true,
    underground: false,
    exited: false,
    trophies: [],
    grace: 0,
    mv: 0,
    attacks: 0,
    armUses: {
      R: 0,
      L: 0
    },
    hitTargets: new Set(),
    market: false,
    warded: false,
    netted: false,
    abil: C.abil,
    abilVal: C.abilVal || 1,
    drafted: false,
    stats: {},
    looted: false,
    focusNext: false,
    hercules: 0,
    discount: 0,
    mchoice: false,
    zoraUsed: 0,
    noEagle: false,
    carrying: false,
    eagle: 0,
    captured: [],
    vetPref: 'coin',
    spearUsed: false
  };
}
/* giveLoadout — hands a player their class's standard armor, weapons (pulled from the market), coin, keys and starting items. */
function giveLoadout(player) {
  const C = CLASSES[player.cls];
  for (const [k, l] of C.armor) equipPiece(player, k, l);
  if (C.R) {
    player.wR = mkW(C.R);
    marketPull(C.R);
  }
  if (C.L) {
    player.wL = mkW(C.L);
    marketPull(C.L);
  }
  player.coin = C.coin;
  coinLog(player, C.coin, 'starting purse');
  player.keys = C.keys;
  for (const it of C.items) player.items.push(it.startsWith('c:') ? mkCard(it.slice(2)) : mkOffer(it));
}
/* newState — builds the event state S from config: seeds the dice, places beasts, pillars and Blessings pots, displaces beasts for seats 5-8, builds the arena deck (Flavius Rule card at the bottom), applies the location theme, rolls the omen and seats spectators. TWEAK: pots drawn (12), chest start tile (6,6). */
function newState(config) {
  // the dice are cast from a single seed: same seed + same choices + same saved world = the same event, roll for roll
  S_SEED_TMP = config.seed != null && config.seed >>> 0 || (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
  RNG = mulberry32(S_SEED_TMP);
  const ev = EVENTS[config.ev];
  config.opts = {
    ...config.opts
  };
  if (typeof optApplies === 'function') {
    const na = optApplies(ev);
    for (const k in na) if (na[k]) config.opts[k] = false;
  }
  uid = 1;
  S = {
    evKey: config.ev,
    locIdx: config.loc,
    opts: config.opts,
    players: [],
    npcs: [],
    pillars: [],
    tunnels: TUNNELS.map(([r, c]) => ({
      r,
      c
    })),
    chest: {
      r: 6,
      c: 6,
      weapons: shuffle(ev.kind === 'orpheus' ? ['lyre', 'lyre', ...CHEST_W] : [...CHEST_W]),
      held: null
    },
    active: {},
    hist: {},
    spikes: [],
    floor: [],
    piles: [],
    ri: 0,
    cur: 0,
    rotation: 1,
    turnNo: 0,
    phase: 'setup',
    mode: 'move',
    npcKills: 0,
    elims: 0,
    deck: [],
    round2: [],
    market: buildMarket(),
    over: false,
    busy: false,
    pending: null,
    truces: new Set(),
    spect: [],
    exits: [],
    teamPts: {},
    capture: null,
    sim: config.sim || null,
    mgrCtx: config.mgrCtx || null,
    specCtx: config.specCtx || null,
    tourn: config.tourn || null,
    startedAt: Date.now(),
    seed: S_SEED_TMP
  };
  if (ev.custom) customSeatStarts(config, ev);
  if (typeof sponsorStart === 'function') try {
    sponsorStart(config);
  } catch (e) {}
  config.seats.forEach((s, i) => S.players.push(cfTrack(mkPlayer(i, s))));
  // no two gladiators share a color, even with the same class
  {
    const ALT = ['#e07b9a', '#5fc7c0', '#b0d45a', '#f09a3e', '#9aa6ff', '#c9a0dc', '#7fd1ff', '#ffd166', '#ff8c69', '#8fd694'];
    const used = new Set();
    for (const p of S.players) {
      if (used.has(p.color.toLowerCase())) {
        p.color = ALT.find(c => !used.has(c)) || p.color;
      }
      used.add(p.color.toLowerCase());
    }
    const seen = {};
    for (const p of S.players) {
      seen[p.name] = (seen[p.name] || 0) + 1;
      if (seen[p.name] > 1) p.name += ' ' + ['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][seen[p.name] - 1];
    }
  }
  S.opts = config.opts;
  S.bag = buildBag(config.opts);
  if (ev.custom) customBoard(config, ev);else {
    // NPCs
    S.npcs = BASE_NPCS.map(b => mkNPC(b.t, b.name, b.home[0], b.home[1], {
      home: b.home,
      zone: b.zone,
      base: true
    }));
    // Blessings: one pot per pillar drawn from the 36-token table; add-on tokens stack extra pots
    S.pillars = PILLARS.map(([r, c], i) => ({
      id: i,
      r,
      c,
      pots: []
    }));
    // The Blessings bag: every token face-down; 12 are drawn, one pot per pillar. The Golden Eagle, when included, is guaranteed to be one of the 12.
    const drawn = [];
    if (config.opts.eaglePot && ev.kind !== 'eagle') drawn.push('eagle');
    while (drawn.length < 12) drawn.push(S.bag.pop());
    shuffle(drawn).forEach((o, i) => S.pillars[i].pots.push(o));
    // players 5-8 take snake then wolf home tiles; those beasts respawn elsewhere and hunt the closest gladiator
    for (const p of S.players.slice(4)) {
      const n = S.npcs.find(n => n.home && n.home[0] === p.r && n.home[1] === p.c);
      if (n) {
        const [r, c] = freeGrid();
        n.r = r;
        n.c = c;
        n.displaced = 1;
      }
    }
    for (const n of S.npcs.filter(n => n.displaced)) {
      let best = null,
        bd = 1e9;
      for (const q of S.players) {
        const d = cheb(n, q);
        if (d < bd) {
          bd = d;
          best = q;
        }
      }
      if (best) n.aggro = best.id;
    }
  }
  // deck
  if (ev.deck) {
    let d = DECK_BASE.filter(k => k !== 'endgame');
    if (ev.noVenatore) d = d.filter(k => k !== 'zora');
    if (ev.noBoss) d = d.filter(k => k !== 'spawnTholo' && k !== 'spawnCommodus');
    if (ev.noTholo) d = d.filter(k => k !== 'spawnTholo');
    if (ev.kind === 'orpheus') d = d.filter(k => k !== 'lyre' && k !== 'spawnLeo' && k !== 'spawnLeaena');
    if (ev.custom) d = d.filter(k => !ev.noCards || !ev.noCards.includes(k));
    // v0.42: only the Piacula of classes actually on the sand — and a custom character brings their own
    const here = new Set(S.players.map(player => player.cls));
    d = d.filter(k => !CARDS[k] || !CARDS[k].cls || here.has(CARDS[k].cls));
    if (typeof piaCustomCard === 'function') for (const c of here) if (CLASSES[c] && CLASSES[c].custom) {
      const k = piaCustomCard(c);
      if (k) d.push(k);
    }
    if (typeof pairDeckCards === 'function') d.push(...pairDeckCards(ev)); /* v0.46: pairings on the rolls join the deck */
    S.deck = shuffle(d);
    if (ev.rounds[0].reward.cards) S.round2 = shuffle([...ROUND2_CARDS]);else S.deck = shuffle(S.deck.concat(ROUND2_CARDS));
    S.deck.unshift('endgame'); // bottom of the deck
  }
  // each arena wears its own colors (Settings → Location flavors)
  if (!HEADLESS && typeof SETTINGS !== 'undefined' && SETTINGS.locFlavor !== false && typeof LOC_THEMES !== 'undefined' && LOC_THEMES[config.loc]) try {
    applyTheme({
      ...(typeof USER_THEME !== 'undefined' && USER_THEME || THEME),
      ...LOC_THEMES[config.loc].v
    }, false);
  } catch (e) {}
  // the day's omen (weather, city news) is rolled before anyone takes a seat
  S.exhib = !!config.exhibCtx;
  S.exhibCtx = config.exhibCtx || null;
  S.cal = config.cal || (typeof calNow === 'function' ? (() => {
    const c = calNow();
    return {
      season: c.season,
      week: c.week,
      onSched: c.fx.loc === config.loc && c.fx.ev === config.ev
    };
  })() : null); // the empire's date for this event // exhibition: nobody dies, gladiators fill the stands
  S.omen = config.omen || rollOmen();
  S.omenDone = 0;
  if (!HEADLESS) later(() => log(`The dice are cast from seed <b>${S.seed}</b> — enter it under Options → Dice seed to replay these exact rolls.`, 'thought'), 0);
  // spectators
  S.passive = !!ev.passiveSpect; // v0.21: races and sea-fights seat a crowd that only watches — cheers, jeers and words, no stones or gifts
  if (!ev.noSpect) seatSpectators(ev.custom && ev.spect != null ? ev.spect : config.opts.spect || 0, config);
  S.logLines = [];
  S.order = config.order ? [...config.order] : S.players.map(player => player.id);
  S.fest = config.fest || null;
  S.road = config.road || null;
  S.missio = config.missio || null;
  S.noCommodus = !!config.noCommodus;
  S.opts.chPvp = config.chPvp !== false;
  if (ev.kind === 'chariot') chariotSetup();
  if (ev.kind === 'naumachia') naumSetup();
}
/* v0.46 REPLAYS THAT MATCH: the dice come from the seed, but the crowd, the day's omen, the famous visitor and the empire's
   news come from a living world that moves on after every event. So the first time a seed is fought with a given setup, the
   whole opening board is written down beside it; fight the same seed with the same setup again and that exact opening is
   restored — the same crowd in the same seats under the same sky — and the dice take it from there, roll for roll. */
/* seedSig — hashes the setup (event, location, seats, options) into a signature for matching replays; 0 on error. */
function seedSig(config) {
  try {
    return hashStr(JSON.stringify({
      ev: config.ev,
      loc: config.loc,
      s: config.seats.map(x => [x.cls, !!x.cpu, x.diff || '', x.name || '', x.preset || '', x.team || '', x.saved || '']),
      o: config.opts
    }));
  } catch (e) {
    return 0;
  }
}
/* seedOpening — the first time a seed+setup is fought, saves the opening state to localStorage; later fights with the same seed and setup restore it. Skipped for sims, manager, tournaments, festivals and similar modes. TWEAK: saved openings kept (12). */
function seedOpening(config) {
  if (HEADLESS || !S || S.sim || S.mgrCtx || S.specCtx || S.exhib || S.tourn || S.tutorial || S.fest || S.missio || S.road) return;
  let M = {};
  try {
    M = JSON.parse(localStorage.getItem('flavius_seedOpen') || '{}') || {};
  } catch (e) {
    M = {};
  }
  const k = S.seed + '|' + seedSig(config);
  const L = M[k];
  if (L && config.seed != null) {
    try {
      const fresh = JSON.parse(L.S, (key, victim) => victim && typeof victim === 'object' && !Array.isArray(victim) ? victim.__set ? new Set(victim.__set) : victim.__map ? new Map(victim.__map) : victim : victim);
      for (const p of fresh.players) {
        const c = p._cf != null ? p._cf : p.cf || 0;
        delete p.cf;
        p._cf = c;
        cfTrack(p);
      }
      fresh.startedAt = Date.now();
      fresh.logLines = S.logLines || [];
      for (const x of Object.keys(S)) delete S[x];
      Object.assign(S, fresh);
      RNG.s = L.rng >>> 0;
      uid = L.uid || uid;
      later(() => {
        try {
          mToast(`🎲 Seed ${S.seed} with this setup has been fought before — the same crowd, sky and news return for the replay.`);
        } catch (e) {}
      }, 400);
    } catch (e) {
      console.error(e);
    }
    return;
  }
  M[k] = {
    S: JSON.stringify(S, (key, victim) => victim instanceof Set ? {
      __set: [...victim]
    } : victim instanceof Map ? {
      __map: [...victim]
    } : victim),
    rng: RNG.s,
    uid,
    at: Date.now()
  };
  const keys = Object.keys(M).sort((a, b) => (M[b].at || 0) - (M[a].at || 0));
  for (const x of keys.slice(12)) delete M[x];
  try {
    localStorage.setItem('flavius_seedOpen', JSON.stringify(M));
  } catch (e) {
    try {
      localStorage.removeItem('flavius_seedOpen');
    } catch (e2) {}
  }
}
/* startEvent — runs the opening: builds state, the pompa log, loadouts, sworn truces, the hard-CPU edge, carry-overs, draft, Carmina, location modifiers, Mandata and event-specific setup, picks who goes first, then starts the first turn. TWEAK: hard-CPU edge (+3 coin and a 2 HP elixir). */
async function startEvent(config) {
  if (typeof AUD !== 'undefined') {
    AUD.manual = null;
    AUD.paused = false;
  } // v0.36: the arena's own theme takes over
  newState(config);
  const ev = EV();
  const G = S;
  if (!HEADLESS) $('#log').innerHTML = '';
  if (S.fest) log(`${festName(S.fest.kind)} festival · event ${S.fest.stage} of 3.`, 'hd');
  if (S.missio) log(`Missio of ${S.missio.name} · step ${S.missio.step + 1} of 5: ${MISSIOS[S.missio.cls].path[S.missio.step].t}`, 'hd');
  // ---- the pompa: every event opens with formality, as the Romans insisted ----
  if (!HEADLESS && !S.sim) {
    SPEED = 'slow';
    document.querySelectorAll('[data-speed]').forEach(x => x.classList.toggle('on', x.dataset.speed === 'slow'));
  } // CPU pace always begins on Slow
  const locN = LOCATIONS[config.loc] ? LOCATIONS[config.loc].n : 'Roma';
  log(`${ev.n} at ${locN}. The horns sound.`, 'hd');
  if (!S.sim) {
    log(`<i>The pompa winds once around the sand — musicians, priests, and the fighters behind them. The editor rises. The herald fills his lungs:</i>`);
    log(`“Citizens of ${locN}! By the generosity of the editor, <b>FLAVIUS</b>, we present ${ev.n}${ev.tag ? ` — a ${ev.tag} bout` : ''}! ${S.players.length === 1 ? `One brave soul enters the sand alone` : `${['', '', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'][S.players.length] || S.players.length} shall enter the sand`}!”`);
    log(`The roll is called: ${S.players.map(player => `${nm(player)} the ${CLASSES[player.cls] ? CLASSES[player.cls].name : player.cls}`).join(' · ')}.`);
    if (S.turnoutWhy && S.spect) log(`<i>The empire turns out: <b>${S.spect.length}K</b> spectators in the stands — ${S.turnoutWhy.join(', ')}${S.omen && S.omen.att ? `, swayed by ${esc(S.omen.n.toLowerCase())}` : ''}.</i>`);
    if (typeof HINTS !== 'undefined' && HINTS && ev.blurb) log(`<div class="tiphint"><b>${esc(ev.short || ev.n)}</b> ${esc(ev.blurb)} Rounds: ${ev.rounds.map(r => r.n).join(' → ')}.</div>`);
  }
  if (!HEADLESS && typeof curtainTo === 'function') {
    CURTAIN.v = 1;
    CURTAIN.from = 1;
    CURTAIN.to = 1;
    setTimeout(() => {
      if (S === G) curtainTo(0, 3200);
    }, 900);
  } // v0.42: the curtain opens on the editor
  if (!HEADLESS) setTimeout(() => {
    if (S && S.evKey === config.ev) banner(ev.n, `${LOCATIONS[config.loc] ? LOCATIONS[config.loc].n + ' · ' : ''}${ev.rounds[0].n}`);
  }, 300);
  render();
  // loadouts
  for (const p of S.players) {
    if (ev.kind === 'chariot') {
      p.abil = null;
    } else if (ev.kind === 'orpheus') {
      p.wR = mkW('rudis');
      p.keys = 2;
      p.abil = null;
    } else if (ev.kind === 'eagle') {} else if (ev.draft) {
      p.drafted = true;
      p.abil = null;
      if (ev.teams === 'jugg' || ev.kind === 'naumachia') p.keys = 2;
    } else if (ev.custom && ev.loadout === 'empty') {
      p.abil = CLASSES[p.cls].abil;
    } else giveLoadout(p);
  }
  // v0.34 the Debtor's Gambit: the lanista and his chosen fighter enter sworn to a truce
  if (config.truceSeats && config.truceSeats.length === 2) {
    const [a9, b9] = config.truceSeats.map(i => S.players[i]);
    if (a9 && b9) {
      S.truces.add(truceKey(a9.id, b9.id));
      log(`${nm(a9)} and ${nm(b9)} enter under one banner — sworn to a truce, until ${edName()} decides otherwise.`, 'big');
    }
  }
  if (ev.custom) await customStart(ev);
  if (G !== S) return;
  if (typeof pairStart === 'function') {
    await pairStart(config);
    if (G !== S) return;
  } /* v0.46: pairings enter with the pompa */
  /* v0.55: Hard CPUs no longer get a veteran's edge — Intelligence only sharpens their play */
  // carry-over (festivals, missios)
  for (const [i, s] of config.seats.entries()) {
    const p = S.players[i];
    if (s.cfStart) {
      cfWhy('carried in');
      p.cf += s.cfStart;
      log(`${nm(p)} carries ${s.cfStart} CF into this event.`);
    }
    if (s.homeHouse) {
      cfWhy('home crowd');
      p.cf += 2;
      log(`${nm(p)} fights at home for ${esc(s.homeHouse)}: the stands roar (+2 CF).`);
    }
    if (s.coinStart) {
      p.coin += s.coinStart;
    }
    for (const k of s.festItems || []) {
      p.items.push(mkOffer(k));
      log(`${nm(p)} carries a festival boon: a ${OFFER[k] ? OFFER[k].n : 'token'}.`);
    }
    for (const l of s.severed || []) {
      p.hp[l] = 0;
      stripLoc(p, l);
      const a = l === 'rarm' ? 'R' : l === 'larm' ? 'L' : null;
      if (a) p['w' + a] = null;
      log(`${nm(p)} enters without a ${LOCN[l].toLowerCase()} (missio limb persistence).`);
    }
    if (s.noHelm) {
      stripLoc(p, 'head');
      log(`${nm(p)} discards their helm to start.`);
    }
    if (s.noZora) p.noEagle = true;
    // Manager mode: a fighter's rating shows up as a veteran's extra coin and armor
    if (s.boost) {
      if (s.boost.coin) {
        p.coin += s.boost.coin;
        coinLog(p, s.boost.coin, 'training boost');
      }
      if (s.boost.ap) await distributeAP(p, s.boost.ap, `+${s.boost.ap} AP (training)`);
      if (s.boost.cf) p.cf += s.boost.cf;
    }
  }
  if (ev.draft) await runDraft();
  if (ev.kind === 'chariot') await chariotDraft();
  if (G !== S) return;
  if (config.opts.carmina || S.fest && S.fest.stage === 1) await runCarmina();
  if (G !== S) return;
  // class modifiers (p.40)
  if (config.opts.mods && LOCATIONS[config.loc] && !ev.draft && ev.kind !== 'orpheus' && ev.kind !== 'eagle') {
    const L = LOCATIONS[config.loc];
    for (const m of [L.good, L.bad]) {
      if (!m) continue;
      for (const p of S.players.filter(player => m[0] === 'all' || player.cls === m[0])) await applyMod(p, m);
    }
  }
  if (G !== S) return;
  // Mandata Flavi
  if (ev.mandata && config.opts.mandata) {
    const idx = shuffle(MANDATA.map((_, i) => i));
    S.players.forEach((player, i) => player.items.push({
      id: uid++,
      kind: 'mf',
      idx: idx[i]
    }));
    log('Each gladiator is secretly handed a Mandata Flavi.');
  }
  // event specifics
  if (ev.kind === 'orpheus') {
    for (let i = 0; i < 3; i++) {
      const [r, c] = freeGrid();
      placeFloor('offer', drawOffer(), r, c);
    }
    log('The Lyres of Orpheus are locked in the Arena Chest. Three offerings are scattered in the sand.');
  }
  if (ev.kind === 'eagle') {
    for (let i = 0; i < 3; i++) {
      const [r, c] = freeGrid();
      placeFloor('offer', drawOffer(), r, c);
    }
    for (let i = 0; i < 2; i++) {
      const [r, c] = freeGrid();
      placeFloor('key', 'key', r, c);
    }
    placeFloor('eagle', 'eagle', 6, 6);
    log('A Golden Eagle waits on the center tile. Three items and two Arena Keys are scattered in the sand.');
  }
  if (ev.kind === 'commodus') {
    spawnNPC('lion', 'Leo');
    spawnNPC('lion', 'Leaena');
    const [r, c] = freeGrid();
    placeFloor('key', 'key', r, c);
    const [r2, c2] = freeGrid();
    placeFloor('key', 'key', r2, c2);
    log('Both lions prowl the arena. Two Arena Keys lie in the sand.');
  }
  crowdStart();
  if (ev.kind === 'naumachia') {
    const teams = shuffle([...new Set(S.players.map(player => player.team))].sort()); /* v0.59: a random team goes first (Virgilante) */
    S.order = teams.flatMap(target => S.players.filter(player => player.team === target).map(player => player.id));
    log(`🎲 The lots are drawn: Team ${esc(String(teams[0]))} takes the first turn.`);
  }
  if (ev.kind === 'chariot') {
    S.order = S.players.map(player => player.id);
    S.cur = S.order[0];
  } else if (config.order) S.cur = S.order[0];else {
    const first = S.players.findIndex(player => player.cls === 'royalty' || player.cls === 'amazonia');
    S.cur = first >= 0 && !ev.teams ? first : S.order[0];
  }
  /* v0.33: remember how the sand was dressed, so the cleanup crew can put it all back after the games —
     taken here, after custom layouts and spawns, so custom events reset to THEIR opening look. */
  S.init = {
    pillars: S.pillars.map(pillar => ({
      id: pillar.id,
      r: pillar.r,
      c: pillar.c,
      pots: pillar.pots.length
    })),
    chest: S.chest ? {
      r: S.chest.r,
      c: S.chest.c
    } : null,
    spikes: (S.spikes || []).length
  };
  seedOpening(config);
  /* v0.45: the briefing opens with the horns and the first turn waits for it */
  if (!HEADLESS && !S.sim && typeof eventBriefing === 'function') later(async () => {
    try {
      await eventBriefing(true);
    } catch (e) {}
    if (G === S && !S.over) beginTurn();
  }, 60);else later(() => {
    if (G === S) beginTurn();
  }, 60);
}
/* applyMod — applies one location class modifier to a player: HP, AP, CF, coin, damage, or starting without a shield / Cestus / Rudis / Zora / an arm / a leg. */
async function applyMod(player, m) {
  const [, t, v] = m;
  if (t === 'hp') await distributeHP(player, v, `the ${LOCATIONS[S.locIdx].n} modifier`);else if (t === 'ap') await distributeAP(player, v, `the ${LOCATIONS[S.locIdx].n} modifier (+${v} AP)`);else if (t === 'cf') {
    cfWhy('location modifier');
    player.cf += v;
    log(`${nm(player)} starts with +${v} CF (${LOCATIONS[S.locIdx].n}).`);
  } else if (t === 'coin') {
    player.coin = Math.max(0, player.coin + v);
    log(`${nm(player)} loses ${-v} coin (${LOCATIONS[S.locIdx].n}).`);
  } else if (t === 'dmg') await hurt(player, rollLoc(player), v, {
    type: 'env'
  }, `${LOCATIONS[S.locIdx].n} modifier`, {
    noShield: 1,
    noCards: 1
  });else if (t === 'noShield') {
    for (const a of ['R', 'L']) if (player['w' + a] && player['w' + a].shield) player['w' + a] = null;
    log(`${nm(player)} starts without a shield.`);
  } else if (t === 'noCestus') {
    for (const l of ['rarm', 'larm']) {
      const i = player.pieces[l].findIndex(pc => pc.key === 'cestus');
      if (i >= 0) {
        player.ap[l] = Math.max(0, player.ap[l] - player.pieces[l][i].ap);
        player.pieces[l].splice(i, 1);
      }
    }
    log(`${nm(player)} starts without the Cestus.`);
  } else if (t === 'noRudis') {
    for (const a of ['R', 'L']) if (player['w' + a] && player['w' + a].key === 'rudis') player['w' + a] = null;
    log(`${nm(player)} starts without the Rudis.`);
  } else if (t === 'noEagle') {
    player.noEagle = true;
    log(`${nm(player)} cannot call Zora in this event.`);
  } else if (t === 'minusArm') {
    player.hp.larm = 0;
    (player.modLoss = player.modLoss || []).push('larm'); /* v0.64: a modifier's limb is not a missio wound */
    stripLoc(player, 'larm');
    log(`${nm(player)} starts with one arm.`);
  } else if (t === 'minusLeg') {
    player.hp.lleg = 0;
    (player.modLoss = player.modLoss || []).push('lleg');
    stripLoc(player, 'lleg');
    log(`${nm(player)} starts with one leg.`);
  }
}
/* runDraft — snake draft for draft events: each pick offers a random few of the remaining level 1-3 weapons and armor; the Juggernaut then picks 5 declare cards. TWEAK: OFFER (items shown per pick, 8), the level 2 cap for non-Juggernaut players. */
async function runDraft() {
  const ev = EVENTS[S.evKey];
  const pool = [];
  let uidD = 0;
  /* maxLv — highest item level this player may draft (2 for non-Juggernaut players in Juggernaut events, else 3). */
  const maxLv = player => ev.teams === 'jugg' && player.team !== 'J' ? 2 : 3;
  for (const lv of [1, 2, 3]) {
    for (const k of MARKET_W[lv]) pool.push({
      id: uidD++,
      kind: 'w',
      k,
      lv
    });
    for (const k of MARKET_A[lv]) pool.push({
      id: uidD++,
      kind: 'a',
      k,
      lv
    });
  }
  /* picks — how many draft picks this player gets. */
  const picks = player => ev.draft.all || (player.team === 'J' ? ev.draft.jugg : ev.draft.team);
  const maxRounds = Math.max(...S.players.map(picks));
  const OFFER = 8; // each pick, only a random handful of what is left is on offer
  log(`Snake draft: ${S.players.map(player => `${player.name} ${picks(player)} picks`).join(', ')}. Each pick offers a random ${OFFER} of the remaining level 1-3 weapons and armor.`, 'hd');
  let order = S.players.map(player => player.id);
  for (let rd = 0; rd < maxRounds; rd++) {
    for (const id of order) {
      const p = S.players[id];
      if (rd >= picks(p)) continue;
      const left = pool.filter(x => !x.by && x.lv <= maxLv(p));
      if (!left.length) continue;
      const offered = new Set(shuffle([...left]).slice(0, OFFER).map(x => x.id));
      const avail = left.filter(x => offered.has(x.id));
      let pick;
      if (p.cpu) pick = cpuDraftPick(p, avail);else {
        const sorted = [...pool].sort((a, b) => (a.kind > b.kind ? -1 : a.kind < b.kind ? 1 : 0) || a.lv - b.lv);
        const grid = sorted.map(x => {
          const nmx = x.kind === 'w' ? W[x.k].n : ARM[x.k].n;
          if (x.by) {
            const q = S.players[x.by - 1];
            return {
              label: nmx,
              sub: `taken by ${q.name}`,
              value: x.id,
              disabled: true,
              style: `border:2px solid ${q.color};opacity:.55`,
              card: (x.kind === 'w' ? 'w:' : 'a:') + x.k
            };
          }
          const on = offered.has(x.id);
          const lvOK = x.lv <= maxLv(p);
          return {
            label: nmx,
            sub: `LV${x.lv} · ${x.kind === 'w' ? wStats(mkW(x.k)) : armorDesc(x.k)}${!lvOK ? ' · above your draft level' : on ? '' : ' · not offered this pick'}`,
            value: x.id,
            disabled: !on,
            style: on ? 'border-color:var(--gold)' : 'opacity:.35',
            card: (x.kind === 'w' ? 'w:' : 'a:') + x.k
          };
        });
        const idx = await modal(`Draft · ${p.name} · pick ${rd + 1} of ${picks(p)}`, `<p>Choose one weapon or armor from the <b style="color:var(--gold2)">${avail.length} offered</b> this pick (gold borders). Picks already taken show the drafter's color. Weapons go to a free hand; armor equips straight away.</p><div class="pickgrid" id="pickgrid"></div>`, [], {
          wide: 1,
          grid
        });
        pick = avail.find(x => x.id === idx) || avail[0];
      }
      pick.by = p.id + 1;
      log(`${nm(p)} drafts <b>${pick.kind === 'w' ? W[pick.k].n : ARM[pick.k].n}</b>.`);
      if (pick.kind === 'w') await gainWeapon(p, pick.k);else await gainArmorPiece(p, pick.k);
      render();
    }
    order.reverse();
  }
  if (ev.teams === 'jugg') {
    const j = S.players.find(player => player.team === 'J');
    if (j) {
      for (let i = 0; i < 5; i++) {
        let k;
        if (j.cpu) k = ['ward', 'focus', 'forge3', 'hercules2', 'rete'][i];else k = await modal(`Juggernaut card ${i + 1} of 5`, '<p>Choose a Declare-type arena card.</p>', DECLARE_PICKS.map(x => ({
          label: CARDS[x].n,
          sub: CARDS[x].d,
          value: x,
          card: 'c:' + x
        })));
        j.items.push(mkCard(k || 'ward'));
      }
      log(`${nm(j)} chooses 5 declare cards.`);
    }
  }
}
/* armorDesc — one-line description of an armor piece for menus. */
function armorDesc(k) {
  const a = ARM[k];
  return `${a.slot} ${PT_NAME[a.pt]}${a.pair ? ' (pair)' : ''}${a.stack ? ' · stackable' : ''} · ${a.ap} AP${a.bonus ? ' · bonus ' + Object.entries(a.bonus).map(([l, v]) => `+${v} ${LOCN[l]}`).join(', ') : ''}${a.greaves ? ' · +1 MV' : ''}${a.cestus ? ' · +1 DMG' : ''}`;
}

/* ================= END CONDITIONS & ROUNDS ================= */
/* checkEnd — checks whether the event or the current round has ended and stores the outcome in S.pending (settle() acts on it). Co-op loses on any death, no survivors ends it, custom events use checkEndCustom; otherwise RD().end picks the rule below. */
function checkEnd() {
  if (!S || S.over || S.pending || S.phase === 'setup') return;
  const ev = EV(),
    rd = RD(),
    act = activePlayers();
  /* set / win — set stores a pending outcome; win ends the event with the given winners. */
  const set = o => {
    S.pending = o;
  };
  const win = (ws, why) => set({
    over: 1,
    winners: ws,
    reason: why
  });
  if (ev.coop && S.elims >= 1) return set({
    over: 1,
    winners: [],
    reason: `A gladiator fell before Commodus did. ${edName()} laughs, and everyone loses.`
  });
  if (!S.players.some(player => player.alive)) return set({
    over: 1,
    winners: [],
    reason: 'No gladiator survives.'
  });
  const teamsAlive = [...new Set(act.map(player => player.team))];
  if (ev.custom) return checkEndCustom(ev, rd, act, set, win);
  switch (rd.end) {
    /* npc4|elim1 — round ends when 4 beasts are slain (2 in the tutorial), a gladiator falls, or 14 rotations pass in the tutorial; a lone survivor wins. TWEAK: 4 / 2 kills. */
    case 'npc4|elim1':
      {
        if (act.length <= 1) return win(act, 'Last gladiator standing.');
        const need = S.tutorial ? 2 : 4; /* v0.42: the lesson opens round two sooner */
        if (S.npcKills >= need || S.elims >= 1 || S.tutorial && S.rotation >= 14) set({
          next: 1,
          reason: S.elims >= 1 ? 'a gladiator has fallen' : S.npcKills >= need ? need === 2 ? 'two beasts are slain' : 'four beasts are slain' : 'fourteen rotations have passed'
        });
        break;
      }
    /* alive2 — round ends when only 2 gladiators remain; a lone survivor wins. */
    case 'alive2':
      if (act.length <= 1) return win(act, 'Last gladiator standing.');
      if (act.length <= 2) set({
        next: 1,
        reason: 'two gladiators remain'
      });
      break;
    /* alive1 — event ends with the last gladiator standing. */
    case 'alive1':
      if (act.length <= 1) win(act, 'Last gladiator standing.');
      break;
    /* allnpc — Gauntlet: won once every beast is slain or tamed, no Commodus is pending, and the snake, wolf and bear flags (gSnake/gWolf/gBear) are set. */
    case 'allnpc':
      if (!act.length) return;
      if (S.npcs.every(n => !n.alive || n.tamedBy != null) && !S.pendingCommodus && S.gSnake && S.gWolf && S.gBear) win(act, 'Every beast in the Gauntlet is slain.');
      break;
    /* elim1 — event ends at the first death (or 1 left); the highest final CF wins. */
    case 'elim1':
      if (S.elims >= 1 || act.length <= 1) {
        const ranked = [...act].sort((a, b) => finalCF(b, true) - finalCF(a, true));
        win(ranked.slice(0, 1), 'The first gladiator has fallen. The highest Crowd Favor takes the Triumviratus.');
      }
      break;
    /* team1 — event ends with the last team standing. */
    case 'team1':
      if (teamsAlive.length <= 1) win(act, 'Last team standing.');
      break;
    /* rot20 — round ends after 20 rotations; a lone survivor wins early. TWEAK: 20. */
    case 'rot20':
      if (act.length <= 1) return win(act, 'Last gladiator standing.');
      if (S.rotation > 20) set({
        next: 1,
        reason: 'twenty turn rotations have passed'
      });
      break;
    /* rot10 — round ends after 10 rotations; a lone survivor wins early. TWEAK: 10. */
    case 'rot10':
      if (act.length <= 1) return win(act, 'Last gladiator standing.');
      if (S.rotation > 10) set({
        next: 1,
        reason: 'ten turn rotations have passed'
      });
      break;
    /* lion1 — round ends when a lion dies. */
    case 'lion1':
      if (S.lionDead) set({
        next: 1,
        reason: 'a lion has fallen'
      });
      break;
    /* commodus — event ends when Commodus dies. */
    case 'commodus':
      if (S.commodusDead) win(act, 'Commodus is dethroned!');
      break;
    /* race — first to finish 3 laps wins, or the last racer standing. */
    case 'race':
      if (S.raceWinner != null) return win([S.players[S.raceWinner]], 'First to complete three laps!');
      if (act.length <= 1) win(act, 'Last racer standing.');
      break;
    /* exit2 — Orpheus capture round ends when 2 gladiators exit; after 40 rotations the editor waves the top capturers through; if too few beasts are left to capture, everyone still inside is eliminated. TWEAK: 40 rotations. */
    case 'exit2':
      {
        if (S.exits.length >= 2) {
          set({
            next: 1,
            reason: 'two gladiators have exited'
          });
          break;
        }
        if (S.rotation > 40 && act.length) {
          // the crowd will not wait forever
          const ranked = [...act].sort((a, b) => b.captured.length - a.captured.length || b.cf - a.cf);
          for (const p of ranked.slice(0, Math.max(0, 2 - S.exits.length))) {
            p.exited = true;
            S.exits.push(p.id);
            log(`${edName()} grows impatient and waves ${nm(p)} through to the Duel Finale (${p.captured.length} capture${p.captured.length === 1 ? '' : 's'}).`, 'big');
          }
          if (S.exits.length >= 2) {
            set({
              next: 1,
              reason: `${edName()} ended the capture round`
            });
            break;
          }
          const ex = S.exits.map(i => S.players[i]);
          return win(ex, 'Only one gladiator remained for the Duel Finale.');
        }
        const left = act;
        if (!left.length) {
          const ex = S.exits.map(i => S.players[i]);
          return win(ex, ex.length ? 'Only one gladiator escaped the Capture round.' : 'No one escaped.');
        }
        const wild = S.npcs.filter(n => n.alive && n.tamedBy == null && NPCT[n.t].tameable).length;
        const pop = wild + (S.lionsOut || !wild ? 0 : 2);
        const need = Math.min(...left.map(player => 2 - player.captured.length));
        if (pop < need) {
          log('There are not enough beasts left to capture. Every gladiator still in the arena is eliminated.', 'big');
          for (const p of left) {
            p.alive = false;
          }
          const ex = S.exits.map(i => S.players[i]);
          return win(ex, ex.length ? 'Only one gladiator escaped the Capture round.' : 'No one escaped.');
        }
        break;
      }
    /* eagle — the first team to exit wins; otherwise the last team standing. */
    case 'eagle':
      {
        const ex = S.players.find(player => player.exited);
        if (ex) return win(S.players.filter(player => player.team === ex.team), `Team ${ex.team} captured three eagles and exited first.`);
        if (teamsAlive.length <= 1) win(act, 'Last team standing.');
        break;
      }
  }
}
// time limits (custom events): the highest Crowd Favor still standing takes the event
function timeUp(why) {
  if (!S || S.over) return;
  const act = activePlayers();
  const ranked = [...act].sort((a, b) => b.cf - a.cf);
  log(`${why}. The highest Crowd Favor still standing takes the event.`, 'big');
  const top = ranked[0];
  const ws = !top ? [] : EV().teams || EV().coop ? act.filter(player => player.team === top.team) : [top];
  return gameOver(ws, `${why}: the highest Crowd Favor wins.`);
}
/* settle — acts on S.pending: ends the game, or starts the next round and re-checks in case that round is already over. */
async function settle() {
  if (!S || !S.pending || S.over) return;
  const pd = S.pending;
  S.pending = null;
  if (pd.over) return gameOver(pd.winners, pd.reason);
  if (pd.next) {
    await nextRound(pd.reason);
    checkEnd();
    if (S.pending) await settle();
  }
}
/* nextRound — closes the round: pays rewards (coin, CF, set-aside cards, offerings, a level 2 market pick), advances S.ri, runs event transitions (Ludus cut, Orpheus Duel Finale setup, Commodus spawn), gives grace turns and announces the new round. TWEAK: grace turns (2), Ludus survivors kept (2), the 20 passed to spawnCommodus. */
async function nextRound(why) {
  const ev = EV(),
    rd = RD(),
    rw = rd.reward;
  const act = activePlayers();
  log(`${rd.n} ends: ${why}.`, 'big');
  if (S.ri === 0) for (const p of S.players) p.r1pots = p.stats.pots || 0;
  if (rw.coin || rw.cf) {
    for (const p of act) {
      p.coin += rw.coin || 0;
      coinLog(p, rw.coin || 0, 'round rewards');
      cfWhy('round rewards');
      p.cf += rw.cf || 0;
    }
    log(`Survivors receive ${rw.coin || 0} coin and ${rw.cf || 0} CF.`);
  }
  if (rw.cards) {
    for (const p of act) for (let i = 0; i < rw.cards && S.round2.length; i++) p.items.push(mkCard(S.round2.pop()));
    log(`Each survivor draws ${rw.cards} of the set-aside arena cards.`);
    const hasEnd = S.deck[0] === 'endgame';
    S.deck = shuffle((hasEnd ? S.deck.slice(1) : S.deck).concat(S.round2));
    if (hasEnd) S.deck.unshift('endgame');
    S.round2 = [];
  }
  if (rw.applause) log('The crowd offers a generous applause.');
  if (rw.offering) {
    for (const i of S.exits) {
      const p = S.players[i];
      const o = drawOffer();
      p.items.push(mkOffer(o));
      log(`${nm(p)} receives an offering: ${OFFER[o].n} (${OFFER[o].s}).`);
    }
  }
  if (rw.choose2) {
    for (const p of act) {
      const opts = [];
      for (const k of S.market.w[2].slots) if (k) opts.push({
        kind: 'w',
        k
      });
      for (const k of S.market.a[2].slots) if (k) opts.push({
        kind: 'a',
        k
      });
      if (!opts.length) break;
      let pick;
      if (p.cpu) pick = opts.sort((a, b) => itemValue(b.kind, b.k) - itemValue(a.kind, a.k))[0];else {
        const i = await modal(`Reward for ${p.name}`, '<p>Choose any remaining level 2 armor or weapon from the market.</p>', opts.map((o, i) => ({
          label: o.kind === 'w' ? W[o.k].n : ARM[o.k].n,
          sub: o.kind === 'w' ? wStats(mkW(o.k)) : armorDesc(o.k),
          value: i,
          card: (o.kind === 'w' ? 'w:' : 'a:') + o.k
        })));
        pick = opts[i];
      }
      const m = S.market[pick.kind][2];
      m.slots[m.slots.indexOf(pick.k)] = m.deck.pop() || null;
      if (pick.kind === 'w') await gainWeapon(p, pick.k);else await gainArmorPiece(p, pick.k);
    }
  }
  S.ri++;
  const nr = RD();
  S.rotStart = S.rotation;
  S.killStart = S.npcKills;
  S.elimStart = S.elims;
  // special transitions
  if (S.evKey === 'ludus') {
    const ranked = typeof ludusRank === 'function' ? ludusRank(activePlayers(), 2) : [...activePlayers()].sort((a, b) => b.cf - a.cf); /* v0.59: CF, then coin, then d12 roll-offs */
    for (const p of ranked.slice(2)) {
      p.alive = false;
      log(`${nm(p)} did not earn enough favor and is removed from the Ludus.`, 'bad');
    }
  }
  if (S.evKey === 'orpheus') {
    for (const p of activePlayers()) {
      p.alive = false;
      log(`${nm(p)} failed to exit and is eliminated.`, 'bad');
    }
    for (const n of S.npcs) n.alive = false;
    const spots = [[2, 2], [10, 10], [2, 10], [10, 2]];
    for (const [i, id] of S.exits.entries()) {
      const p = S.players[id];
      p.exited = false;
      [p.r, p.c] = spots[i];
      if (p.captured.length) {
        let c;
        if (p.cpu) c = p.captured.sort((a, b) => NPCT[b.t].hp - NPCT[a.t].hp)[0];else {
          const j = await modal(`${p.name}: choose your beast`, '<p>Choose one captured beast to fight beside you in the Duel Finale.</p>', p.captured.map((x, j) => ({
            label: `${x.name} (${NPCT[x.t].n})`,
            value: j
          })));
          c = p.captured[j ?? 0];
        }
        const f = adjTiles(p).find(([r, cc]) => !pillarAt(r, cc) && !unitAt(r, cc));
        const n = mkNPC(c.t, c.name, f[0], f[1], {
          tamedBy: p.id
        });
        S.npcs.push(n);
        log(`${nm(p)} enters the Duel Finale with ${nm(n)}.`);
      }
      for (const a of ['R', 'L']) if (p['w' + a] && p['w' + a].lyre) p['w' + a] = null;
    }
    const firstIdx = S.exits[0];
    S.cur = (firstIdx - 1 + S.players.length) % S.players.length;
  }
  if (S.evKey === 'commodus') {
    await spawnCommodus(20);
  }
  for (const p of activePlayers()) p.grace = 2;
  const z = ZONES[nr.zone];
  if (nr.zone > 1 && activePlayers().some(other => !other.cpu)) popRule('zone');
  {
    const offs = typeof RULE_INFO !== 'undefined' ? Object.keys(RULE_INFO).filter(k => !(k === 'cf' ? cfAllowed() : nr[k])).map(k => k === 'ca' ? 'no abilities' : 'no ' + RULE_INFO[k][1]) : [];
    banner(`Round ${S.ri + 1} · ${nr.n}`, [nr.zone > 1 ? `The zone shrinks to ${ZONES[nr.zone][1] - ZONES[nr.zone][0] + 1}×${ZONES[nr.zone][1] - ZONES[nr.zone][0] + 1}` : '', offs.length ? '🚫 ' + offs.join(' · ') : ''].filter(Boolean).join(' — '));
    if (offs.length) log(`🚫 This round: <b>${offs.join(' · ')}</b>.${!cfAllowed() ? ' Crowd Favor still counts — it just cannot be spent.' : ''}`, 'big');
  }
  log(`Round ${S.ri + 1} · ${nr.n}. ${nr.zone > 1 ? `The zone shrinks to ${z[1] - z[0] + 1}×${z[1] - z[0] + 1}. Two turns of grace to get inside.` : ''} ${nr.pvp ? 'PvP is allowed.' : 'No PvP.'}`, 'hd');
  render();
}
/* finalCF — a player's final CF: -5 per unrevealed Mandata Flavi; a winner adds the last round's win reward (default 15), +10 with the pelted weakness, +5 per 3 trophies, +2 per Flavian item and +15 for the Golden Eagle. Retired players score 0. TWEAK: those bonus numbers. */
function finalCF(player, winner) {
  if (player.retired) return 0;
  let v = player.cf;
  if (player.items) v -= 5 * player.items.filter(i => i.kind === 'mf').length;
  if (winner) {
    v += EV().rounds[EV().rounds.length - 1].reward.win || 15;
    if (weak(player, 'pelted')) v += 10;
    v += Math.floor(player.trophies.length / 3) * 5;
    v += 2 * (['R', 'L'].filter(a => player['w' + a] && player['w' + a].flav).length + LOCS.reduce((s, l) => s + player.pieces[l].filter(pc => ARM[pc.key].flav).length, 0));
    if (player.items.some(i => i.kind === 'offer' && i.key === 'eagle')) v += 15;
  }
  return v;
}

/* ================= TURN FLOW ================= */
/* resetTurn — clears the player's per-turn counters and flags. */
function resetTurn(player) {
  player.attacks = 0;
  player.armUses = {
    R: 0,
    L: 0
  };
  player.hitTargets = new Set();
  player.market = false;
  player.mv = 0;
  player.looted = false;
  player.hercules = 0;
  player.discount = 0;
  player.mchoice = false;
  player.focusRoll = false;
  player.forceEnd = false;
  player.mercBonus = 0;
  player.gifted = false;
}
/* canDraw — true if this event uses the arena deck and it still has cards. */
const canDraw = () => EV().deck && S.deck.length > 0;
/* beginTurn — starts the current player's turn: turn and time limits, the truce check, Telemachus roll (a 1 or 6 removes him), the chariot shortcut, leaving a tunnel, Phase 1 Resolve, eagle scoring, then Phase 2 (CPUs choose and act on their own; a human with no deck takes coin automatically). TWEAK: sim turn cap (900). */
async function beginTurn() {
  const G = S;
  if (!S || S.over) return;
  const p = cur();
  if (!p.alive || p.exited) return advanceTurn();
  S.turnNo++;
  S.phase = 'resolve';
  S.mode = 'move';
  S.busy = true;
  resetTurn(p);
  if (S.sim && S.turnNo > (S.sim.maxTurns || 900)) {
    const act = activePlayers().sort((a, b) => b.cf - a.cf);
    S.busy = false;
    return gameOver(act.slice(0, 1), 'The bout was stopped; the highest Crowd Favor takes it.');
  }
  if (S.limits && S.limits.min && S.startedAt && Date.now() - S.startedAt > S.limits.min * 60000 && !S.sim) {
    S.busy = false;
    return timeUp('The sand-glass runs out');
  }
  log(`${p.name}'s turn · ${RD().n}, rotation ${S.rotation}`, 'hd');
  await flaviusTruceCheck();
  if (G !== S) return;
  if (!p.cpu) {
    render();
    await popRule('firstTurn');
    if (p.items.some(i => i.kind === 'mf')) await popRule('mandata');
    if (G !== S) return;
  }
  if (S.active.telemachus && !isChariot()) {
    const r = d6();
    if (r === 1 || r === 6) {
      S.active.telemachus = 0;
      log(`${nm(p)} rolls ${r}: Telemachus is dragged out of the arena. Attacks resume!`, 'big');
    } else log(`${nm(p)} rolls ${r}: Telemachus still stands between the gladiators. No attacks.`);
  }
  if (isChariot()) {
    S.phase = 'action';
    p.mv = chMv(p);
    log(`Phase 1 · Movement: ${p.ch.mounted ? 'mounted, ' + p.mv + ' movement' : 'on foot'} · lap ${p.ch.laps}/3.`);
    render();
    if (p.cpu) {
      await sleep(350);
      await cpuChariot(p);
      if (G !== S) return;
      S.busy = false;
      checkEnd();
      await settle();
      if (G !== S || S.over) return;
      await sleep(250);
      return endTurn();
    }
    S.busy = false;
    render();
    return;
  }
  if (p.underground) {
    p.underground = false;
    for (const n of S.npcs) if (n.aggro === p.id) n.aggro = null;
    log(`${nm(p)} emerges from the tunnel; all aggro is shaken off.`);
  }
  render();
  await sleep(300);
  if (G !== S) return;
  await resolvePhase(p);
  if (G !== S) return;
  await flushMF();
  checkEnd();
  await settle();
  if (G !== S || S.over) return;
  if (!p.alive || p.exited) {
    S.busy = false;
    render();
    await sleep(400);
    return advanceTurn();
  }
  await checkEagleScore(p);
  checkEnd();
  await settle();
  if (G !== S || S.over) return;
  S.phase = 'choice';
  S.busy = false;
  render();
  if (p.cpu) {
    S.busy = true;
    render();
    await sleep(450);
    await takeChoice(p, cpuChoice(p));
    await flushMF();
    checkEnd();
    await settle();
    if (G !== S || S.over) return;
    cpuSelfWager(p);
    if (!p.alive || p.exited) {
      S.busy = false;
      return advanceTurn();
    }
    if (p.forceEnd) {
      S.busy = false;
      await sleep(300);
      return endTurn();
    }
    await sleep(300);
    if (isNaum()) await cpuNaum(p);else await cpuAct(p);
    if (G !== S) return;
    S.busy = false;
    checkEnd();
    await settle();
    if (G !== S || S.over) return;
    await sleep(300);
    await endTurn();
  } else if (!canDraw()) {
    S.busy = true;
    await takeChoice(p, 'coin');
    S.busy = false;
    render();
  }
}
/* takeChoice — Phase 2 then the start of Phase 3: take 2 coin or draw an arena card (the Gauntlet pays nothing), then set movement (Mercury, net, lashing, swimming) and pay class abilities. TWEAK: coin taken (2), movement cap (7), sling stone cap (6). */
async function takeChoice(player, which) {
  if (S.evKey === 'gauntlet') {
    if (!S.gCoinNote) {
      S.gCoinNote = 1;
      log('Phase 2 · Choice: there is no purse-filling in the Gauntlet — the editor paid for blood, not loitering.');
    }
  } else if (which === 'coin' || !canDraw()) {
    player.coin += 2;
    coinLog(player, 2, 'Phase 2 choices');
    log(`Phase 2 · Choice: ${nm(player)} takes 2 coin.`);
  } else {
    log(`Phase 2 · Choice: ${nm(player)} draws an arena card.`);
    await drawArena(player);
  }
  checkEnd();
  if (S.over || S.pending && S.pending.over || !player.alive) return;
  S.phase = 'action';
  S.mode = 'move';
  player.mv = player.netted ? 0 : mvMax(player);
  if (player.mercBonus && !player.netted) {
    player.mv = Math.min(7, player.mv + player.mercBonus);
    player.mercBonus = 0;
  }
  if (player.forceEnd) {
    player.mv = 0;
    log(`${nm(player)} is lashed and must end the turn.`, 'bad');
  }
  if (swimming(player) && player.mv > 1) {
    player.mv--;
    log(`${nm(player)} is swimming: −1 movement and −1 weapon range.`);
  }
  if (player.netted) log(`${nm(player)} is tangled in a net and cannot move this turn.`);
  if (caAllowed()) {
    const av = player.abilVal || 1;
    if (player.abil === 'coin') {
      player.coin += av;
      coinLog(player, av, 'class ability');
      log(`${nm(player)} collects ${av} coin (class ability).`);
    }
    if (player.abil === 'cf') {
      cfWhy('class ability');
      player.cf += av;
      log(`${nm(player)} earns ${av} CF (class ability).`);
    }
    if (player.abil === 'vet') {
      if (player.vetPref === 'cf') {
        cfWhy('class ability');
        player.cf += av;
        log(`${nm(player)} takes ${av} CF (Lanista).`);
      } else {
        player.coin += av;
        coinLog(player, av, 'class ability');
        log(`${nm(player)} takes ${av} coin (Lanista).`);
      }
    }
    if (player.abil === 'mv' && !player.netted) player.mv = Math.min(7, player.mv + av);
    statTurn(player); /* v0.55: Speed, Luck and Charisma pay here */
    if (player.abil === 'stone') {
      const w = ['R', 'L'].map(a => player['w' + a]).find(weapon => weapon && weapon.stones);
      if (w) {
        w.ammoLeft = Math.min(6, w.ammoLeft + av);
        log(`${nm(player)} gathers ${av > 1 ? av + ' stones' : 'a stone'} (${w.ammoLeft} in the sling).`);
      }
    }
  }
  player.netted = false;
  checkMandata(player);
  render();
}
/* endTurn — Phase 4: -2 CF for ending outside the zone after grace (negative CF eliminates), grace countdown, 10-card hand limit, the restless crowd, history snapshot, then the next turn. TWEAK: zone penalty (2), hand limit (10), restless stone damage (2). */
async function endTurn() {
  const G = S;
  if (!S || S.over) return;
  const p = cur();
  S.mode = 'move';
  if (p.alive && !p.exited) {
    if (RD().zone > 1 && p.grace <= 0 && !inZone(p.r, p.c) && !p.underground) {
      cfWhy('outside the zone');
      p.cf -= 2;
      log(`${nm(p)} ends outside the zone: −2 CF (now ${p.cf}).`, 'bad');
      if (p.cf < 0) {
        log(`${nm(p)}'s crowd favor turns negative.`, 'bad');
        eliminate(p, {
          type: 'env'
        });
      }
    }
    if (p.grace > 0) p.grace--;
    /* hand — cards and Mandata Flavi that count toward the hand limit. */
    const hand = () => p.items.filter(i => i.kind === 'card' || i.kind === 'mf');
    while (p.alive && hand().length > 10) {
      const cards = p.items.filter(i => i.kind === 'card');
      let it;
      if (p.cpu) it = cards[0];else {
        const id = await modal('Hand limit', '<p>Your hand holds more than 10 cards. Discard one.</p>', cards.map(c => ({
          label: CARDS[c.key].n,
          value: c.id
        })));
        it = cards.find(c => c.id === id) || cards[0];
      }
      p.items = p.items.filter(x => x !== it);
      log(`${nm(p)} discards ${CARDS[it.key].n} (hand limit).`);
    }
    checkMandata(p);
  }
  if (S.active.restless > 0 && !isChariot()) {
    if (p.alive && !p.exited && p.attacks === 0 && !S.active.telemachus) {
      log(`${nm(p)} made no attack. The crowd grows restless and stones every gladiator!`, 'bad');
      crowdReact('nohit');
      for (const q of activePlayers()) if (!q.underground) await hurt(q, rollLoc(q), 2, {
        type: 'env'
      }, 'Stones from the restless crowd');
    }
    if (--S.active.restless <= 0) {
      S.active.restless = 0;
      log('The crowd settles. The Crowd Grows Restless is discarded.');
    }
  }
  await flushMF();
  recordHist();
  if (!p.cpu && p.alive && p.cf >= 17 && p.cf < 20) popRule('thumb');
  S.phase = 'end';
  checkEnd();
  await settle();
  if (G !== S || S.over) return;
  advanceTurn();
}
/* advanceTurn — passes the turn to the next living player. On a full rotation: the Gauntlet editor's lash, the self-starting restless crowd, spectators act, relationships decay, the editor's-patience failsafe and any pending Commodus. TWEAK: 3 bloodless rotations for the lash, 6 for the restless crowd, 40 bloodless / 200 total to call the event. */
function advanceTurn() {
  if (!S || S.over) return;
  const G = S;
  let order = S.order && S.order.length ? S.order : S.players.map(player => player.id);
  let pos = order.indexOf(S.cur);
  let wrapped = false,
    found = false;
  for (let i = 1; i <= order.length; i++) {
    const j = (pos + i) % order.length;
    const q = S.players[order[j]];
    if (q.alive && !q.exited) {
      if (j <= pos) wrapped = true;
      S.cur = q.id;
      found = true;
      break;
    }
  }
  if (!found) {
    checkEnd();
    settle();
    return;
  }
  if (wrapped && isChariot()) {
    S.order = chRaceOrder();
    S.cur = S.order[0];
  }
  later(async () => {
    if (G !== S || S.over) return;
    if (wrapped && S.evKey === 'gauntlet' && S.rotation - (S.lastDmgRot ?? S.rotation) >= 3 && !S.over) {
      const gp = activePlayers()[0];
      if (gp) {
        log(`Three rotations without blood. <b>The editor's lash</b>: the handlers whip ${nm(gp)} back toward the beasts (1 damage).`, 'bad');
        await hurt(gp, rollLoc(gp), 1, {
          type: 'env'
        }, "The editor's lash", {
          noShield: true
        });
        checkEnd();
        await settle();
        if (G !== S || S.over) return;
      }
    }
    if (wrapped && !isChariot() && RD().pvp && !S.active.restless && S.rotation - (S.lastDmgRot ?? S.rotation) >= 6 && activePlayers().length > 1) {
      S.active.restless = 4;
      log('Six rotations without blood. <b>The crowd grows restless</b> on its own: for the next 4 turns, a gladiator who does not attack gets everyone stoned.', 'big');
      cardShow('c:restless');
      S.lastDmgRot = S.rotation;
    }
    if (wrapped) {
      S.rotation++;
      relDecay();
      await spectatorsAct();
      checkEnd();
      await settle();
      if (G !== S || S.over) return;
      // the editor's patience: a stalemate (a beast pocketed behind rubble, a race that never ends) cannot outlast the sun.
      // 40+ rotations with no blood at all, or 200 rotations total, and Flavius calls the event on Crowd Favor.
      if (!S.sim && (S.rotation >= 200 || S.lastDmgRot != null && S.rotation - S.lastDmgRot >= 40 && !isChariot())) {
        const act = activePlayers();
        const top = [...act].sort((x, y) => y.cf - x.cf)[0];
        log(`The sun is setting and ${edName()} rises from the box. <b>The editor calls the event.</b> Whatever still prowls the sand is led away by the handlers.`, 'big');
        if (top) gameOver([top], `${top.name} holds the most Crowd Favor as the editor calls time.`);else gameOver([], 'The editor calls time on an empty arena.');
        return;
      }
      if (S.pendingCommodus) {
        S.pendingCommodus = 0;
        await spawnCommodus();
        checkEnd();
        await settle();
        if (G !== S || S.over) return;
      }
      if (!cur().alive || cur().exited) return advanceTurn();
    }
    beginTurn();
  }, 60);
}

/* ================= PLAYER ACTIONS ================= */
/* movePlayer — walks the player along a path while movement lasts (diagonals cost 2), with chariot and sea-fight steps, floor spikes, pickups and end checks each step. TWEAK: spike damage (2), step delay (110 ms). */
async function movePlayer(player, path) {
  for (const st of path) {
    const step = typeof st === 'number' ? {
      k: st
    } : st;
    const r = Math.floor(step.k / N),
      c = step.k % N;
    const cost = step.cost ?? (r !== player.r && c !== player.c ? 2 : 1);
    if (cost > player.mv) break;
    const or = player.r,
      oc = player.c;
    player.mv -= cost;
    player.r = r;
    player.c = c;
    if ((player.hp.rleg <= 0 || player.hp.lleg <= 0) && typeof bloodAt === 'function' && Math.random() < .85) bloodAt(r, c, 'drop', 1); // a stump drags a snail-trail
    if (player.carrying && S.chest) {
      S.chest.r = r;
      S.chest.c = c;
    }
    if (isChariot()) {
      if (player.ch.mounted) {
        player.ch.cr = r;
        player.ch.cc = c;
        await chStep(player, or, oc);
      }
      await chPartPickup(player);
    }
    if (isNaum()) await naumStep(player, step, or, oc);
    draw();
    if (spikeAt(r, c)) await hurt(player, rollLoc(player), 2, {
      type: 'env'
    }, 'Floor spike');
    await pickupAt(r, c);
    checkEnd();
    if (!player.alive || S.over || S.pending) break;
    await sleep(110);
  }
}
/* chFootPickup — in a chariot race, takes a spare wheel or horse on this tile if the chariot is missing one. */
function chFootPickup(player) {
  for (const f of S.floor.filter(f => f.r === player.r && f.c === player.c && (f.kind === 'wheel' || f.kind === 'horse'))) {
    if (f.kind === 'wheel' && !player.ch.wheel) {
      player.ch.wheel = f.part;
      S.floor = S.floor.filter(x => x !== f);
      log(`${nm(player)} fits a spare ${f.part.name || 'wheel'} (${f.part.hp} HP) to their chariot.`);
    }
    if (f.kind === 'horse' && !player.ch.horse) {
      player.ch.horse = f.part;
      S.floor = S.floor.filter(x => x !== f);
      log(`${nm(player)} harnesses ${f.part.name || 'a spare horse'} to their chariot.`);
    }
  }
}
/* pushTargets — adjacent units or pillars the player can shove one tile straight back (needs all limbs and 2 movement; the far tile must be free; allies excluded). */
function pushTargets(player) {
  if (!allLimbs(player) || player.mv < 2) return [];
  const out = [];
  for (const [r, c] of adjTiles(player)) {
    const u = unitAt(r, c),
      pl = pillarAt(r, c);
    if (!u && !pl) continue;
    if (u && u.cls && friendly(player, u) && u !== player) continue;
    const dr = r - player.r,
      dc = c - player.c,
      r2 = r + dr,
      c2 = c + dc;
    if (!inB(r2, c2) || pillarAt(r2, c2) || unitAt(r2, c2)) continue;
    out.push({
      r,
      c,
      to: [r2, c2],
      u,
      pl
    });
  }
  return out;
}
/* doPush — spends 2 movement to shove a unit or pillar and step into its place; a pushed beast aggros on the pusher, a pushed player dislikes them, and a spike deals 2 damage. TWEAK: cost (2), spike damage (2), relationship (-10, -22 onto spikes). */
async function doPush(player, target) {
  player.mv -= 2;
  const [r2, c2] = target.to,
    or = target.r,
    oc = target.c;
  if (target.pl) {
    target.pl.r = r2;
    target.pl.c = c2;
    log(`${nm(player)} shoves the pillar to ${tl(r2, c2)}${tunnelAt(r2, c2) ? ', sealing the tunnel' : ''}.`);
  } else {
    target.u.r = r2;
    target.u.c = c2;
    log(`${nm(player)} pushes ${nm(target.u)} to ${tl(r2, c2)}.`);
    if (!target.u.cls && target.u.tamedBy == null) setAggro(target.u, player, 'push');
    if (target.u.cls) {
      stat(player, 'pushPlayer');
      bumpRel(target.u, player, spikeAt(r2, c2) ? -22 : -10, 'pushed');
    }
    if (spikeAt(r2, c2)) {
      stat(player, 'spikepush');
      if (target.u.cls) await hurt(target.u, rollLoc(target.u), 2, {
        type: 'player',
        p: player
      }, 'Pushed onto a floor spike');else hurtNPC(target.u, 2, player, 'Pushed onto a floor spike');
    }
    if (target.u.cls) await pickupAt(r2, c2);
  }
  player.r = or;
  player.c = oc;
  if (player.carrying) {
    S.chest.r = or;
    S.chest.c = oc;
  }
  await pickupAt(or, oc);
  checkMandata(player);
  checkEnd();
}
/* toppleTargets — adjacent pillars the player can topple (needs all limbs and 3 movement). */
function toppleTargets(player) {
  if (!allLimbs(player) || player.mv < 3) return [];
  return S.pillars.filter(pillar => cheb(player, pillar) === 1);
}
/* doTopple — spends 3 movement to topple a pillar away from the player: it becomes rubble, deals 3 damage to anyone on the next 2 tiles (breaking truces), and its pots break 3 tiles out. TWEAK: cost (3), damage (3), reach (2 tiles). */
async function doTopple(player, pillar) {
  player.mv -= 3;
  const dr = pillar.r - player.r,
    dc = pillar.c - player.c;
  S.pillars = S.pillars.filter(x => x !== pillar);
  stat(player, 'topple');
  crowdReact('topple', {
    p: player
  });
  (S.rubble || (S.rubble = [])).push({
    r: pillar.r,
    c: pillar.c,
    dr,
    dc
  });
  shake();
  fx(pillar.r, pillar.c, 'CRASH!', '#e6d3b0', {
    big: 1
  });
  log(`${nm(player)} topples the pillar at ${tl(pillar.r, pillar.c)}!`, 'big');
  for (const k of [1, 2]) {
    const r = pillar.r + dr * k,
      c = pillar.c + dc * k;
    if (!inB(r, c)) continue;
    const q = playerAt(r, c);
    if (q && q !== player) {
      if (inTruce(player, q)) {
        S.truces.delete(truceKey(player.id, q.id));
        log(`${nm(player)} breaks the truce with ${nm(q)}!`, 'bad');
      }
      await hurt(q, rollLoc(q), 3, {
        type: 'player',
        p: player
      }, 'Falling pillar');
      bumpRel(q, player, -15, 'dropped a pillar on them');
    }
    const n = npcAt(r, c);
    if (n) hurtNPC(n, 3, player, 'Falling pillar');
  }
  if (pillar.pots.length) await breakPot(pillar, player, [pillar.r + dr * 3, pillar.c + dc * 3], true);
  checkMandata(player);
  checkEnd();
}
/* tunnelUsable — a tunnel works unless a pillar sits on it. */
const tunnelUsable = target => !pillarAt(target.r, target.c);
/* tunnelExits — tunnel exits the player can travel to: needs a key, all limbs, no chest, and a usable tunnel within 1 tile; exits must be farther than 1 tile and unoccupied. */
function tunnelExits(player) {
  if (player.keys < 1 || !allLimbs(player) || weak(player, 'noTunnel') || player.carrying) return [];
  if (!S.tunnels.some(target => tunnelUsable(target) && cheb(player, target) <= 1)) return [];
  return S.tunnels.filter(target => tunnelUsable(target) && cheb(player, target) > 1 && !unitAt(target.r, target.c));
}
/* doTunnel — spends a key to go underground and surface at the chosen exit next turn. */
async function doTunnel(player, target) {
  crowdReact('tunnel', {
    p: player
  });
  S.tunExit = {
    r: target.r,
    c: target.c,
    until: S.turnNo + S.players.length + 1
  };
  player.keys--;
  player.r = target.r;
  player.c = target.c;
  player.underground = true;
  stat(player, 'tunnel');
  log(`${nm(player)} uses an Arena Key and vanishes underground, surfacing at ${tl(target.r, target.c)} next turn.`);
  checkMandata(player);
}
/* reteTargets — players and beasts within 4 tiles and line of sight that a net (Rete) can target. TWEAK: range (4). */
function reteTargets(player) {
  const out = [];
  for (const q of S.players) if (q !== player && q.alive && !q.exited && !q.underground && cheb(player, q) <= 4 && los(player, q)) out.push(q);
  for (const n of S.npcs) if (n.alive && cheb(player, n) <= 4 && los(player, n)) out.push(n);
  return out;
}
/* onChestTile — the player stands on the unheld chest. */
const onChestTile = player => S.chest && S.chest.held == null && player.r === S.chest.r && player.c === S.chest.c;
/* canOpenChest — has a key, the chest has weapons left, and the player is on it or carrying it. */
const canOpenChest = player => S.chest && player.keys > 0 && S.chest.weapons.length && (onChestTile(player) || player.carrying);
/* openChest — spends a key for the chest's next weapon; a carried chest is dropped (+1 movement back), and the chest respawns elsewhere until it is empty. */
async function openChest(player) {
  player.keys--;
  const key = S.chest.weapons.pop();
  stat(player, 'chest');
  log(`${nm(player)} unlocks the Arena Chest!`, 'big');
  await gainWeapon(player, key);
  if (player.carrying) {
    player.carrying = false;
    player.mv = Math.min(player.mv + 1, 7);
  }
  if (S.chest.weapons.length) {
    const [r, c] = freeGrid();
    S.chest.r = r;
    S.chest.c = c;
    S.chest.held = null;
    log(`The chest respawns, locked, at ${tl(r, c)}.`);
  } else {
    S.chest = null;
    log('The chest is empty and leaves the arena.');
  }
  checkMandata(player);
}
/* lootOptions — everything lootable on the player's tile (pile weapons, armor, coin, items, and floor weapons not thrown this turn), with CPU value scores. */
function lootOptions(player) {
  const out = [];
  for (const pl of pilesAt(player.r, player.c)) {
    pl.weapons.forEach((weapon, i) => out.push({
      pl,
      t: 'w',
      i,
      label: weapon.n,
      sub: `from ${pl.name}${pl.corpse ? "'s corpse" : ''} · ${wStats(weapon)}`,
      val: wScore(weapon)
    }));
    pl.armor.forEach((a, i) => out.push({
      pl,
      t: 'a',
      i,
      label: a.n,
      sub: `from ${pl.name} · ${a.ap} AP`,
      val: a.ap
    }));
    if (pl.coin) out.push({
      pl,
      t: 'c',
      label: `${pl.coin} coin`,
      sub: `all of ${pl.name}'s coin`,
      val: pl.coin * 0.6
    });
    pl.items.forEach((it, i) => out.push({
      pl,
      t: 'i',
      i,
      label: itemInfo(it).n,
      sub: `from ${pl.name} · ${itemInfo(it).t}`,
      val: 3
    }));
  }
  for (const f of S.floor.filter(f => f.kind === 'weapon' && f.r === player.r && f.c === player.c && f.thrown !== S.turnNo)) out.push({
    floor: f,
    t: 'fw',
    label: f.w.n,
    sub: `lying in the sand · ${wStats(f.w)}`,
    val: wScore(f.w)
  });
  return out;
}
/* doLoot — takes one loot option; looting a pile uses up the turn's loot (floor weapons do not). */
async function doLoot(player, o) {
  if (o.t === 'fw') {
    S.floor = S.floor.filter(x => x !== o.floor);
    log(`${nm(player)} picks up the ${o.floor.w.n}.`);
    await gainWeapon(player, null, o.floor.w);
    return;
  }
  player.looted = true;
  const pl = o.pl;
  if (o.t === 'w') {
    const w = pl.weapons.splice(o.i, 1)[0];
    log(`${nm(player)} loots the ${w.n} from ${pl.name}.`);
    await gainWeapon(player, null, w);
  }
  if (o.t === 'a') {
    const a = pl.armor.splice(o.i, 1)[0];
    log(`${nm(player)} loots ${a.n} (${a.ap} AP) from ${pl.name}.`);
    await gainArmorPiece(player, a.key, a.ap, {
      single: true
    });
  }
  if (o.t === 'c') {
    player.coin += pl.coin;
    coinLog(player, pl.coin, 'looting the fallen');
    log(`${nm(player)} loots ${pl.coin} coin from ${pl.name}.`);
    pl.coin = 0;
  }
  if (o.t === 'i') {
    const it = pl.items.splice(o.i, 1)[0];
    player.items.push(it);
    log(`${nm(player)} loots ${itemInfo(it).n} from ${pl.name}.`);
  }
}
/* tradePartners — active players within 4 tiles (not underground) who can trade. TWEAK: range (4). */
const tradePartners = player => activePlayers().filter(other => other !== player && !other.underground && cheb(player, other) <= 4);
/* tradeables — what the player can offer in a trade: coin in lots of 1/3/5/10, a key, non-Mandata items and held weapons (not Lyres), with CPU values. TWEAK: coin lots, key value (4), weapon weight (1.4). */
function tradeables(player) {
  const out = [];
  if (player.coin > 0) for (const v of [1, 3, 5, 10]) if (player.coin >= v) out.push({
    t: 'coin',
    v,
    label: `${v} coin`,
    val: v
  });
  if (player.keys > 0) out.push({
    t: 'key',
    label: '1 Arena Key',
    val: 4
  });
  player.items.filter(i => i.kind !== 'mf').forEach(it => out.push({
    t: 'item',
    it,
    label: itemInfo(it).n,
    val: itemVal(it)
  }));
  for (const a of ['R', 'L']) if (player['w' + a] && !player['w' + a].lyre) out.push({
    t: 'w',
    a,
    label: player['w' + a].n,
    val: wScore(player['w' + a]) * 1.4
  });
  return out;
}
/* itemVal — CPU value table for cards and offerings in trades. TWEAK: the numbers (unlisted cards 3, offerings 2). */
function itemVal(it) {
  if (it.kind === 'card') return {
    elixir4: 6,
    elixir2: 4,
    minerva: 6,
    omnia1: 3,
    omnia2: 5,
    fidelis: 4,
    lyre: 5,
    tame: 5,
    forge3: 4,
    forge2: 3,
    hercules2: 4,
    hygeia: 4,
    ammo: 2
  }[it.key] || 3;
  const k = it.key;
  return {
    elix4: 5,
    elix2: 3,
    ap3: 4,
    ap2: 3,
    mw3: 7,
    mw2: 5,
    mw1: 3,
    ma3: 6,
    ma2: 4,
    ma1: 3,
    merc2: 3,
    merc1: 2,
    eagle: 8
  }[k] || 2;
}
/* makeTruce — swears a truce (refused in the tutorial or after truces were torn up); both sides like each other more. TWEAK: relationship gain (15). */
function makeTruce(player, other) {
  if (S.tutorial || S.truceGone) {
    log(`${S.tutorial ? edName() : 'The editor'} waves the pact away: ${S.tutorial ? 'this is a lesson in fighting — the truce is broken' : 'no truces are sworn again this event'}.`, 'bad');
    if (!player.cpu || !other.cpu) {
      try {
        mToast(S.tutorial ? `👎 ${esc(edName())} breaks the truce — this lesson is about fighting.` : '👎 No truces are allowed any more this event.');
      } catch (e) {}
    }
    return;
  }
  crowdReact('truce', {
    a: player,
    b: other
  });
  S.truces.add(truceKey(player.id, other.id));
  bumpRel(player, other, 15, 'truce');
  bumpRel(other, player, 15, 'truce');
  stat(player, 'truce');
  stat(other, 'truce');
  log(`${nm(player)} and ${nm(other)} agree to a truce.`, 'big');
  checkMandata(player);
  checkMandata(other);
}
/* doTrade — swaps the two offers; both sides like each other more. TWEAK: relationship gain (8). */
function doTrade(player, other, give, get) {
  transfer(player, other, give);
  transfer(other, player, get);
  bumpRel(player, other, 8, 'fair trade');
  bumpRel(other, player, 8, 'fair trade');
  stat(player, 'trade');
  stat(other, 'trade');
  log(`${nm(player)} trades ${give.label} to ${nm(other)} for ${get.label}.`, 'big');
  checkMandata(player);
  checkMandata(other);
}
/* doGift — gives something away; the receiver likes the giver more. TWEAK: relationship gain (20). */
function doGift(player, other, x, why = '') {
  crowdReact('gift', {
    p: player
  });
  transfer(player, other, x);
  bumpRel(other, player, 20, 'a gift');
  stat(player, 'gifts');
  log(`${nm(player)} gives ${x.label} to ${nm(other)}${why ? ' ' + why : ''}.`, 'big');
}
/* transfer — moves coin, a key, an item or a weapon between players; a traded weapon is tagged with its source and turn and goes to a free hand or the receiver's pile. */
function transfer(from, to, x) {
  if (x.t === 'coin') {
    from.coin -= x.v;
    coinLog(from, -x.v, 'trades & gifts');
    to.coin += x.v;
    coinLog(to, x.v, 'trades & gifts');
  }
  if (x.t === 'key') {
    from.keys--;
    to.keys++;
  }
  if (x.t === 'item') {
    from.items = from.items.filter(i => i !== x.it);
    to.items.push(x.it);
  }
  if (x.t === 'w') {
    const w = from['w' + x.a];
    from['w' + x.a] = null;
    w.tradedFrom = from.id;
    w.tradeTurn = S.turnNo;
    const free = armsAttached(to).find(a => !to['w' + a]);
    if (free) to['w' + free] = w;else pileFor(to).weapons.push(w);
  }
}
/* cpuAcceptsTrade — a CPU accepts if what it receives is worth at least 0.8x (easy), 1.05x (normal) or 1.25x (hard) what it gives. TWEAK: those ratios. */
function cpuAcceptsTrade(other, give, get) {
  // q receives `give`, hands over `get`
  if (other.diff === 'easy') return give.val >= get.val * 0.8;
  return give.val >= get.val * (other.diff === 'hard' ? 1.25 : 1.05);
}
/* cpuAcceptsTruce — never in no-truce events, the tutorial, after truces were torn up, or with 2 or fewer left; otherwise a random roll leaning on loyalty + survival - aggression (hard also wants the asker at least 90% as strong). TWEAK: base odds (.5 easy, .4 hard, .25 normal). */
function cpuAcceptsTruce(other, player) {
  if (EV().noTruce || S.truceGone || S.tutorial) return false;
  const act = activePlayers();
  if (act.length <= 2) return false;
  /* str — rough strength: remaining HP + AP + weapon scores. */
  const str = u => LOCS.reduce((s, l) => s + Math.max(0, u.hp[l]) + u.ap[l], 0) + wScore(u.wR) + wScore(u.wL);
  const P = pers(other),
    lean = (P.loyalty + P.survival - P.aggression) / 200; // 0..1-ish
  if (other.diff === 'easy') return rand() < .5 + lean * .4;
  if (other.diff === 'hard') return str(player) >= str(other) * 0.9 && rand() < .4 + lean * .5;
  return rand() < .25 + lean * .5;
}
/* canExit — on the starting tile and: 2 captures in Orpheus round 1, or 3 team points in goldenEagle. */
function canExit(player) {
  if (!(player.r === player.start[0] && player.c === player.start[1])) return false;
  if (S.evKey === 'orpheus' && S.ri === 0) return player.captured.length >= 2;
  if (S.evKey === 'goldenEagle') return (S.teamPts[player.team] || 0) >= 3;
  return false;
}
/* doExit — the player leaves the arena; a carried eagle goes back to the center tile. */
function doExit(player) {
  player.exited = true;
  S.exits.push(player.id);
  if (player.eagle) {
    player.eagle = 0;
    placeFloor('eagle', 'eagle', 6, 6);
  }
  log(`${nm(player)} exits the arena!`, 'big');
  checkEnd();
}

/* ================= FLAVIUS FORCES TRUCES TO BREAK ================= */
// In elimination events, when every gladiator still standing is bound by truce, nothing can end the event. Flavius dissolves the truces.
async function flaviusTruceCheck() {
  const G9 = S;
  if (!S || S.over || !S.truces.size || !RD().pvp || EV().coop) return;
  const end = RD().end;
  if (!['alive1', 'alive2', 'npc4|elim1', 'team1', 'elim1'].includes(end)) return;
  const act = activePlayers();
  if (act.length < 2) return;
  const teams = [...new Set(act.map(player => player.team))];
  if (teams.length < 2) return;
  const target = end === 'alive2' ? 2 : 1;
  if (end === 'team1' ? teams.length <= 1 : act.length <= target) return;
  const pairs = [];
  for (let i = 0; i < act.length; i++) for (let j = i + 1; j < act.length; j++) if (!friendly(act[i], act[j])) pairs.push([act[i], act[j]]);
  if (!pairs.length || !pairs.every(([a, b]) => inTruce(a, b))) return;
  /* v0.50: CPUs facing the thumb tear their pacts up and fight on (600 simulated events: 1 in 5 had ended with everyone executed) */
  if (!S.truceGone && act.every(other => other.cpu)) {
    S.truces.clear();
    S.truceGone = 1;
    if (!S.sim) banner('The truces are broken', 'The editor rises — the pacts are torn up');
    log(`⚔ ${edName()} rises and the truce-bound understand: <b>they tear up their pacts and fight on.</b> No truce may be sworn again this event.`, 'big');
    return;
  }
  /* v0.46: a human among the truce-bound may tear the pacts up and fight on — but then no truce stands again this event */
  if (!S.truceGone && act.some(other => !other.cpu)) {
    const v = S.tutorial ? 'fight' : await modal(`${edName()} rises from the editor’s seat`, `<div class="decree"><p>Every gladiator still standing (${act.map(other => esc(other.name)).join(', ')}) is bound by truce — and the crowd did not pay to watch friendship.</p><p><b>Break the truces and fight it out</b>, or let the thumb turn down on everyone.</p><p class="rc-sub">Break them and no truce may be sworn again for the rest of this event.</p></div>`, [{
      label: '⚔ Break the truces — fight on',
      value: 'fight',
      primary: 1
    }, {
      label: '👎 Accept the thumb',
      sub: 'every survivor is executed',
      value: 'thumb'
    }], {
      close: 'fight'
    });
    if (G9 !== S || S.over) return;
    if (v === 'fight') {
      S.truces.clear();
      S.truceGone = 1;
      banner('The truces are broken', 'Fight on — no more pacts this event');
      log(`⚔ The truces are torn up before ${edName()}’s box. <b>No truce may be sworn again this event.</b> Fight on!`, 'big');
      if (typeof crowdReact === 'function') try {
        crowdReact('boss', {
          n: 'war'
        });
      } catch (e) {}
      render();
      return;
    }
  }
  // v0.37 THUMBS DOWN: an arena that ends in friendship is no ending at all. Flavius turns his thumb down on
  // every survivor, and each is executed by the d12 of the Fates table — nobody wins.
  S.thumbsDown = act.map(other => other.id);
  banner(`${edName()} turns the thumb down`, 'Friendship is not a spectacle');
  log(`<b>${edName()} rises from the editor’s seat.</b> Every gladiator left standing (${act.map(other => nm(other)).join(', ')}) is bound by truce — and the crowd did not pay to watch friendship. <b>His thumb turns down.</b> Each will meet a death drawn from the d12 of the Fates.`, 'big');
  for (const q of act) think(q, pickOne(['So it ends like this.', 'We should have fought.', 'Flavius has spoken.', 'Forgive me, friend.']), 'think');
  const pr = modal(`${edName()} turns the thumb down`, `<div class="decree"><p><b>${edName()} rises from the editor’s seat.</b></p><p>Every gladiator still standing (${act.map(other => esc(other.name)).join(', ')}) is bound by truce, so no one can win this ${esc(EV().short)}.</p><p>“The people did not come to watch friendship!” <b>The thumb turns down.</b> Each survivor is executed, their death drawn from the d12 of the Fates.</p></div>`, [{
    label: 'So be it',
    value: 1,
    primary: 1
  }]);
  if (humansIn()) await pr;else setTimeout(() => {
    try {
      if (CUR_MODAL && $('#mTitle').textContent === 'Flavius turns his thumb down') CUR_MODAL.done(1);
    } catch (e) {}
  }, 3500);
  if (G9 !== S || S.over) return;
  await gameOver([], `Everyone left standing was bound by truce. ${edName()} turned the thumb down on them all.`);
}

/* ================= PERFORMANCE HISTORY ================= */
/* perfScore — one performance number for the history graph: CF + 0.5 coin + 0.6 HP + 0.4 AP + 1.5 weapon score + 2 per trophy + items. TWEAK: the weights. */
function perfScore(player) {
  const hp = LOCS.reduce((s, l) => s + Math.max(0, player.hp[l]), 0),
    ap = LOCS.reduce((s, l) => s + player.ap[l], 0);
  const ws = ['R', 'L'].reduce((s, a) => s + wScore(player['w' + a]), 0);
  const items = player.items.filter(i => i.kind !== 'mf').length;
  return Math.round((player.cf + player.coin * 0.5 + hp * 0.6 + ap * 0.4 + ws * 1.5 + player.trophies.length * 2 + items) * 10) / 10;
}
/* recordHist — appends each player's snapshot to S.hist; an eliminated or exited player gets one final entry. */
function recordHist() {
  if (!S || !S.hist) return;
  for (const p of S.players) {
    const h = S.hist[p.id] || (S.hist[p.id] = []);
    const last = h[h.length - 1];
    if (!p.alive || p.exited) {
      if (last && !last.end) h.push({
        t: S.turnNo,
        s: last.s,
        cf: p.cf,
        coin: p.coin,
        tr: p.trophies.length,
        fans: 0,
        end: p.exited ? 'exit' : 'elim'
      });
      continue;
    }
    h.push({
      t: S.turnNo,
      s: perfScore(p),
      cf: p.cf,
      coin: p.coin,
      hp: LOCS.reduce((s, l) => s + Math.max(0, p.hp[l]), 0),
      ap: LOCS.reduce((s, l) => s + p.ap[l], 0),
      tr: p.trophies.length,
      fans: S.spect ? S.spect.filter(x => !x.gone && x.fav === p.id).length : 0
    });
  }
}

/* ================= RETIRE ================= */
/* retirePlayer — after confirming, retires the gladiator: CF set to 0 and eliminated. */
async function retirePlayer(player) {
  const ok = await modal(`Retire ${player.name}?`, `<p>Retiring walks your gladiator out of the arena for good. Their Fate is set to <b>0 CF (Ad Memoriae)</b>, they are eliminated from this event, and ${player.saved ? 'their saved record in the Ludus' : 'any saved record or missio for them'} is removed.</p>`, [{
    label: 'Retire from the event',
    value: 1,
    primary: 1
  }, {
    label: 'Cancel',
    value: 0
  }]);
  if (!ok) return;
  player.retired = true;
  player.cf = 0;
  log(`${nm(player)} lays down their weapons and retires from the event. Fate: 0 CF.`, 'big');
  eliminate(player, {
    type: 'retire'
  });
}

/* ================= CHARIOT SPARE PARTS ================= */
// stepping onto a spare wheel or horse fits it to your chariot at once; if you already have one you may swap
async function chPartPickup(player) {
  if (!isChariot() || !player.ch) return;
  /* hpOf / desc — a part's current HP (a horse uses its face HP minus damage) and its menu label. */
  const hpOf = x => x ? x.sides ? x.sides[x.face].hp - x.dmg : x.hp : 0;
  const desc = x => x.sides ? `${x.name || 'horse'} (${hpOf(x)} HP, +${x.sides[x.face].mv} MV)` : `${x.name || 'wheel'} (${x.hp} HP)`;
  for (const f of S.floor.filter(f => f.r === player.r && f.c === player.c && (f.kind === 'wheel' || f.kind === 'horse'))) {
    const ch = player.ch,
      key = f.kind;
    const cur = ch[key];
    if (!cur) {
      S.floor = S.floor.filter(x => x !== f);
      ch[key] = f.part;
      log(`${nm(player)} fits the spare ${desc(f.part)} to their chariot.`, 'big');
      fx(player.r, player.c, '+' + key, '#9bd070');
      continue;
    }
    let swap;
    if (player.cpu) swap = hpOf(f.part) > hpOf(cur);else swap = await modal(`Spare ${key}`, `<p>Your chariot already has a ${desc(cur)}. Swap it for this ${desc(f.part)}? Your old ${key} is left on this tile.</p>`, [{
      label: 'Swap',
      value: 1,
      primary: 1
    }, {
      label: 'Keep mine',
      value: 0
    }]);
    if (!swap) continue;
    const spare = f.part;
    f.part = cur;
    ch[key] = spare;
    log(`${nm(player)} swaps in the spare ${desc(spare)} and leaves their old ${key} behind.`);
    fx(player.r, player.c, 'swap ' + key, '#9bd070');
  }
}

/* v0.21 · SIM TO THE END: hand every human-controlled gladiator to the CPU and let the event finish
   at full speed — from any moment, including "Fight it yourself" in Manager mode. */
async function simToEnd(skipAsk) {
  if (!S || S.over) return;
  const G = S;
  if (!skipAsk && !HEADLESS && typeof modal === 'function') {
    if (modalBusy()) return;
    const ok = await modal('⏭ Sim to end?', '<p>Every gladiator hands to the CPU and the event <b>resolves at once</b> — straight to the results.</p><p class="rc-sub">Just want the CPUs quicker? Use the <b>Fast</b> speed instead. Want to stop playing a fighter but keep watching? Use <b>🤖 Hand to CPU</b> on their board.</p>', [{
      label: 'Sim to end',
      value: 1,
      primary: 1
    }, {
      label: 'Keep playing',
      value: 0
    }], {
      close: 0
    });
    if (!ok || G !== S || S.over) return;
  }
  S.simmed = 1; /* v0.50: a simmed event never counts toward 'Play 25 events' */
  const p = cur();
  const waiting = !p.cpu && !S.busy;
  for (const q of S.players) if (!q.cpu) {
    q.cpu = true;
    q.diff = q.diff || 'normal';
    q.simmed = true;
  }
  S.snap = true;
  if (!HEADLESS && typeof simSnapShow === 'function') simSnapShow();
  SPEED = 'snap';
  document.querySelectorAll('[data-speed]').forEach(x => x.classList.remove('on'));
  log(`⏭ The rest is simulated — the event snaps to its end.`, 'thought');
  if (!waiting) return; // mid-animation: the loop will find a CPU at the next step
  S.busy = true;
  if (S.phase === 'choice') {
    await takeChoice(p, cpuChoice(p));
    await flushMF();
    checkEnd();
    await settle();
    if (G !== S || S.over) return;
    if (!p.alive || p.exited) {
      S.busy = false;
      return advanceTurn();
    }
    if (p.forceEnd) {
      S.busy = false;
      return endTurn();
    }
  }
  if (isNaum()) await cpuNaum(p);else if (isChariot && isChariot()) await cpuChariot(p);else await cpuAct(p);
  if (G !== S) return;
  S.busy = false;
  checkEnd();
  await settle();
  if (G !== S || S.over) return;
  await endTurn();
}
