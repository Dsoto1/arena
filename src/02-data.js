/* v0.52: a brand-new player is one with nothing of ours in this browser yet — checked before anything is written */
const FIRST_RUN = (() => {
  try {
    return !Object.keys(localStorage).some(k => k.startsWith('flavius_'));
  } catch (e) {
    return false;
  }
})();
/* =====================================================================
   02-DATA · THE RULEBOOK IN TABLES — and a map of the whole codebase
   =====================================================================
   Everything printed on cardboard lives here as plain data: classes, weapons (W),
   armor tokens (ARM), NPC types (NPCT), arena cards, events, Fates, locations,
   chariot horses/wheels, Mandata Flavi. Change a number here and the whole game obeys.

   HOW THE FILES FIT TOGETHER (they are concatenated into one <script> in this order):
     01-head.html   page shell + all CSS
     02-data.js     this file: rules-as-data + HEADLESS switch + tiny helpers (clamp, rnd, pickOne)
     03-engine.js   the physical arena: damage, shields, eliminations, NPCs, spawning, loot
     04-rules.js    turn phases: resolve (beasts act), attacks/dice, mandata, section cheers
     05-flow.js     the game loop: newState/startEvent, turn advance, rotations, omens, endTurn
     06-ai.js       CPU brains: personalities, relationships, target scoring, pathfinding
     07-ui.js       canvas drawing (board, stands, Flavius box) + side panels + modals + avatar
     09-special.js  chariot racing and naumachia (the two odd events)
     10-meta.js     persistence (Store), results screen/gameOver, Infamis/Hall/Liberti records
     11-extra.js    card art sheets + hover popups, hints, Ludus Flavius, strategy guide, fx
     12-settings.js settings + themes (incl. per-location arena palettes)
     13-sim.js      headless simulation: simEvent/simBatch power scouting and match nights
     14-names.js    the gladiator name generator (~590k combos)
     15-custom.js   Creator Studio: custom characters/beasts/events, portraits, locks
     16-crowd.js    spectators (regulars with memory), omens, wagers, Flavius the sponsor
     17-manager.js  Manager mode: recruiting, match nights, rivalry, pledges, bankruptcy
     08-setup.js    (loaded LAST) the New Event screen, rules window, boot

   HEADLESS: when true, all rendering/logging/modals short-circuit and modals auto-answer,
   so 13-sim can run full events in ~50ms. Search for HEADLESS guards before touching UI code.
   ===================================================================== */
/* =========================================================
   FLAVIUS RULE — arena prototype v0.2
   Rules from the Magnus Edition rulebook. Anything marked
   PLACEHOLDER is a stand-in where the rulebook only shows
   the value on card art.
   ========================================================= */
/* $ — shorthand for document.querySelector: returns the first element matching a CSS selector. */
const $ = s => document.querySelector(s);
const N = 13;
const HIT_CHANCE = 0.5; // hit die: 3 hit faces, 3 miss faces
let SPEED = 'slow'; // CPU turn pacing — every event begins on Slow so new arrivals can follow the action
/* SPEEDMUL — multiplier applied to every sleep() delay for each CPU speed setting. TWEAK: raise a value to slow that speed down, lower it to speed up (snap 0 = no waiting). */
const SPEEDMUL = {
  step: 2.2,
  slow: 2.6,
  normal: 1,
  fast: 0.18,
  snap: 0
}; // v0.42 snap: Sim to end resolves the event at once // v0.37: step = slow animation, and a wait between CPU actions
// HEADLESS: events simulated off-screen (scouting reports, manager match nights). No drawing, no waiting, no dialogs.
let HEADLESS = false,
  LATER_N = 0;
/* later — runs fn after ms via setTimeout in normal play; in HEADLESS sims it runs on the microtask queue, yielding a real setTimeout(0) every 30th call so the browser is not starved. TWEAK: the 30 (how often headless runs yield). */
const later = (fn, ms) => {
  if (!HEADLESS) return setTimeout(fn, ms);
  if (++LATER_N % 30) return Promise.resolve().then(fn);
  return setTimeout(fn, 0);
};
/* sleep — awaitable pause scaled by the current SPEED (SPEEDMUL). Instant in HEADLESS, polls every 120ms while paused, waits for Next in step mode, and only yields in snap mode. TWEAK: the 120ms pause poll and the 200ms step-mode threshold. */
const sleep = ms => {
  if (HEADLESS) return Promise.resolve();
  if (SPEED === 'pause') return new Promise(r => {
    const i = setInterval(() => {
      if (SPEED !== 'pause') {
        clearInterval(i);
        r();
      }
    }, 120);
  });
  if (SPEED === 'step' && ms >= 200 && typeof stepGate === 'function' && stepGate()) return stepWait(); // v0.37: a CPU action just finished — wait for Next
  if (SPEED === 'snap') return new Promise(r => setTimeout(r, 0)); // yield to the browser, never wait
  const t = ms * (SPEEDMUL[SPEED] ?? 1);
  if (t <= 0) return Promise.resolve();
  if (t <= 150) return new Promise(r => setTimeout(r, t));
  /* v0.95: a long wait re-reads SPEED every ≤100 ms, so a new speed takes effect at once (Slow → Fast finishes at Fast's pace, Pause holds,
     Step / Sim to end let go). The part already waited counts at the speed it was waited at. TWEAK: the 150 ms / 100 ms. */
  return new Promise(r => {
    let done = 0,
      last = performance.now();
    const tick = () => {
      const now = performance.now(),
        sp = SPEED;
      if (sp === 'pause') {
        last = now;
        setTimeout(tick, 120);
        return;
      }
      const mul = sp === 'step' || sp === 'snap' ? 0 : SPEEDMUL[sp] ?? 1;
      done += mul > 0 ? (now - last) / (ms * mul) : 1;
      last = now;
      if (done >= 0.999) {
        r();
        return;
      }
      setTimeout(tick, Math.min(100, (1 - done) * ms * mul));
    };
    setTimeout(tick, Math.min(100, t));
  });
};
/* sevLabel — the word used when a location reaches 0 HP: chest 'Caved in', head 'Crushed', limbs 'Severed'. TWEAK: the label text. */
const sevLabel = l => l === 'chest' ? _T('Caved in') : l === 'head' ? _T('Crushed') : _T('Severed');
/* ROWL / COLL — board coordinate labels for the 13 rows (A-L) and columns (1-12); index 6 is the center line shown as '·'. TWEAK: label text (keep 13 entries each). */
const ROWL = ['A', 'B', 'C', 'D', 'E', 'F', '·', 'G', 'H', 'I', 'J', 'K', 'L'];
const COLL = ['1', '2', '3', '4', '5', '6', '·', '7', '8', '9', '10', '11', '12'];
/* tl — turns a row/col into a tile label like 'C-4', or 'the center' for (6,6). */
const tl = (r, c) => r === 6 && c === 6 ? _T('the center') : ROWL[r] + '-' + COLL[c];
/* inB — true if (r,c) is on the 13x13 board. */
const inB = (r, c) => r >= 0 && c >= 0 && r < N && c < N;
/* cheb — Chebyshev distance between two {r,c} points (a diagonal step counts as 1); used for range and movement checks. */
const cheb = (a, b) => Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c));
/* ---- SEEDED DICE (v0.14) ----
   Every game-outcome roll flows through rand(): the event's seed (shown at start and on the
   results screen, settable under Options) reproduces the exact same dice, bags, decks and CPU
   whims. Cosmetic rolls (speech-bubble timing, Flavius's face, emote chances) deliberately stay
   on Math.random so they never desynchronize a replay from its headless twin.
   mulberry32: a tiny, fast, well-distributed 32-bit PRNG. */
function mulberry32(seed) {
  return {
    s: seed >>> 0,
    next() {
      let t = this.s = this.s + 0x6D2B79F5 >>> 0;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  };
}
let RNG = null; // set per event in newState; null = unseeded (menus, setup screens)
/* rand — random number 0..1 from the seeded event RNG, or Math.random when no event is seeded. */
const rand = () => RNG ? RNG.next() : Math.random();
/* sideRand — a second stream, seeded from the event seed but separate from the dice: spectators' favourites and wagers use it,
   so a seed replays the same crowd live or loaded, and the crowd never shifts a single die. State lives in S (saved with matches). */
function sideRand() {
  if (typeof S === 'undefined' || !S || S.seed == null) return Math.random();
  let t = (S._sideS = ((S._sideS ?? (S.seed ^ 0x5bd1e995)) + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
/* rnd — seeded random integer from 0 to n-1. */
const rnd = n => Math.floor(rand() * n);
/* pickOne — seeded random element of an array. */
const pickOne = a => a[rnd(a.length)];
/* upick: UNSEEDED pick, for cosmetic flavor text only (commentary, Flavius quips).
   Cosmetic code often runs behind Math.random() gates or HEADLESS guards, so it must
   never consume rolls from the seeded stream — otherwise replays desync. */
const upick = a => a[Math.floor(Math.random() * a.length)];
/* shuffle — seeded Fisher-Yates shuffle of an array, in place; returns the same array. */
const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
/* rollHits — rolls n hit dice and returns an array of true (hit) / false (miss). TWEAK: change HIT_CHANCE (top of file) to make every die hit more or less often. */
const rollHits = n => Array.from({
  length: n
}, () => rand() < HIT_CHANCE);
/* cnt — counts the hits (true values) in a rollHits array. */
const cnt = h => h.filter(Boolean).length;
/* d6 — seeded six-sided die roll, 1-6. */
const d6 = () => 1 + rnd(6);
/* diceHtml — renders a dice array as die icons (hit or miss) for the log. */
const diceHtml = h => h.map(x => `<i class="die ${x ? 'hit' : ''}" title="${x ? 'hit' : 'miss'}"></i>`).join('');
/* clamp — limits a value (first argument, despite its name) to the range a..b. */
const clamp = (victim, a, b) => Math.max(a, Math.min(b, victim));
// the coin ledger: every denarius remembers where it came from (hover the Coin tile on the player board)
/* ---- THE CF LEDGER (v0.20) ---- every change to a gladiator's Crowd Favor is booked under a reason.
   p.cf is a tracked property: engine code keeps writing p.cf+=n as always; cfWhy(reason) names the next
   change(s), and unnamed changes are booked by the phase they land in. Hover the CF stat to read it. */
let CF_WHY = null;
/* cfWhy — names the reason the next CF change will be booked under in the ledger; cleared after one change. */
const cfWhy = weapon => {
  CF_WHY = weapon;
};
/* cfTrack — turns player.cf into a getter/setter: the value lives in _cf and every change is added to player.cfLog under CF_WHY, or under the current phase if no reason was named. TWEAK: the fallback reason names per phase. */
function cfTrack(player) {
  Object.defineProperty(player, 'cf', {
    get() {
      return this._cf;
    },
    set(victim) {
      const d = victim - this._cf;
      this._cf = victim;
      if (!d) return;
      const why = CF_WHY || (S && S.phase === 'resolve' ? _T('section cheers & upkeep') : S && S.phase === 'choice' ? _T('choice phase') : S && S.phase === 'action' ? 'actions & cards' : _T('the event'));
      (this.cfLog = this.cfLog || {})[why] = (this.cfLog[why] || 0) + d;
      CF_WHY = null;
    },
    enumerable: true,
    configurable: true
  });
  return player;
}
/* coinLog — books n coin into player.coinLog under a reason (shown when hovering the Coin tile). */
const coinLog = (player, n, why) => {
  if (!player || !n) return;
  (player.coinLog = player.coinLog || {})[why] = (player.coinLog[why] || 0) + n;
};
/* LOCS / LOCN / LOCS_SHORT / LOCSIDE — the six body location keys, their full names, short names and L/R side. Keys are used everywhere; only change the display text. */
const LOCS = ['head', 'chest', 'rarm', 'larm', 'rleg', 'lleg'];
const LOCN = {
  head: _T('Head'),
  chest: _T('Chest'),
  larm: _T('Left Arm'),
  rarm: _T('Right Arm'),
  rleg: _T('Right Leg'),
  lleg: _T('Left Leg')
};
const LOCS_SHORT = {
  head: _T('Head'),
  chest: _T('Chest'),
  rarm: _T('Arm'),
  larm: _T('Arm'),
  rleg: _T('Leg'),
  lleg: _T('Leg')
};
const LOCSIDE = {
  rarm: 'R',
  larm: 'L',
  rleg: 'R',
  lleg: 'L'
};
/* HIT_LOC — maps a d6 hit-location roll (1-6) to a body location; index 0 is unused. TWEAK: reorder to change which roll hits which location. */
const HIT_LOC = [null, 'head', 'chest', 'larm', 'rarm', 'rleg', 'lleg']; // p.13 order
/* BASE_HP — starting HP per body location for every gladiator. TWEAK: raise or lower to make gladiators tougher or more fragile. */
const BASE_HP = {
  head: 5,
  chest: 6,
  larm: 5,
  rarm: 5,
  rleg: 5,
  lleg: 5
};
/* HEAL_ORDER — tie-break order used when the game (or a CPU) picks which location to heal or add AP to first. TWEAK: reorder to change priority. */
const HEAL_ORDER = ['head', 'chest', 'rarm', 'larm', 'rleg', 'lleg'];

/* ---- Board (p.9) ---- */
/* PILLARS / TUNNELS / SPIKE_SPOTS / STARTS — [row, col] tiles (0-12) of pillars, tunnel entrances, spike traps and player start tiles (starts 1-8 in seat order). Editing moves them on the board; keep tiles in bounds and not overlapping. */
const PILLARS = [[0, 6], [2, 2], [2, 10], [4, 4], [4, 8], [6, 0], [6, 12], [8, 4], [8, 8], [10, 2], [10, 10], [12, 6]];
const TUNNELS = [[3, 3], [3, 9], [9, 3], [9, 9]];
const SPIKE_SPOTS = [[3, 6], [6, 3], [6, 9], [9, 6]];
const STARTS = [[12, 12], [12, 0], [0, 0], [0, 12], [1, 6], [11, 6], [6, 1], [6, 11]]; // 5-8 replace snake then wolf homes
/* ZONES — round zone number → [min, max] row/col bounds of the playable square (1 = whole board, 2 = 9x9, 3 = 5x5). TWEAK: the bounds to change how far the arena shrinks each round. */
const ZONES = {
  1: [0, 12],
  2: [2, 10],
  3: [4, 8]
};
/* QUADS — quadrant number → [rowMin, rowMax, colMin, colMax]. */
const QUADS = {
  1: [0, 5, 7, 12],
  2: [0, 5, 0, 5],
  3: [7, 12, 0, 5],
  4: [7, 12, 7, 12]
}; // rulebook p.35: Q1 top-right (A12), Q2 top-left (A1), Q3 bottom-left (L1), Q4 bottom-right (L12)

/* ---- NPCs (p.28-33). Spawned NPCs have behavior states: [minHP, atk, rng, mv] ---- */
/* NPCT fields: n name · g map letter · mv movement · ap attack power (beasts have no armor) · hp health · coin / cf reward for the kill · col color · tameable (can be tamed) · scan (hunts the closest player instead of guarding a zone) · fly (flies) · states [[minHP, attack, range, move, label]] behavior stages as HP drops. Edit the numbers to rebalance beasts. */
const NPCT = {
  snake: {
    n: 'Snake',
    g: 'S',
    mv: 1,
    ap: 1,
    hp: 3,
    coin: 4,
    cf: 3,
    col: '#b9a23a',
    tameable: 1
  },
  wolf: {
    n: 'Wolf',
    g: 'W',
    mv: 3,
    ap: 2,
    hp: 6,
    coin: 6,
    cf: 4,
    col: '#6b7680',
    tameable: 1
  },
  bear: {
    n: 'Bear',
    g: 'B',
    mv: 2,
    ap: 3,
    hp: 10,
    coin: 8,
    cf: 5,
    col: '#83512e',
    tameable: 1
  },
  lion: {
    n: 'Lion',
    g: 'L',
    mv: 3,
    ap: 3,
    hp: 12,
    coin: 8,
    cf: 5,
    col: '#c98a2e',
    scan: 1,
    tameable: 1,
    states: [[9, 3, 1, 3, _T('Initial')], [5, 4, 1, 3, _T('Raged')], [0, 3, 1, 1, _T('Fazed')]]
  },
  tholo: {
    n: 'Tholo',
    g: 'T',
    mv: 2,
    ap: 4,
    hp: 20,
    coin: 12,
    cf: 6,
    col: '#6a3580',
    scan: 1,
    states: [[15, 4, 1, 2, _T('Initial')], [6, 5, 1, 3, _T('Raged')], [0, 3, 1, 1, _T('Fazed')]]
  },
  commodus: {
    n: 'Commodus',
    g: 'C',
    mv: 2,
    ap: 3,
    hp: 15,
    coin: 10,
    cf: 6,
    col: '#b8b8c8',
    states: [[11, 3, 1, 2, _T('Initial')], [6, 4, 1, 3, _T('Raged')], [0, 2, 1, 1, _T('Fazed')]]
  },
  zora: {
    n: 'Golden Eagle',
    g: 'Z',
    mv: 6,
    ap: 2,
    hp: 6,
    coin: 4,
    cf: 4,
    col: '#a0784a',
    fly: 1
  }
};
/* BASE_NPCS — the six beasts on the board at event start: name (role key, renamed per city by CITY_BEASTS), t NPCT type, home start tile, zone [rowMin, rowMax, colMin, colMax] the beast guards. Edit to move homes or guarded areas. */
const BASE_NPCS = [{
  name: 'Glykon',
  t: 'snake',
  home: [1, 6],
  zone: [0, 3, 4, 8]
}, {
  name: 'Arenosus',
  t: 'snake',
  home: [11, 6],
  zone: [9, 12, 4, 8]
}, {
  name: 'Valencia',
  t: 'wolf',
  home: [6, 1],
  zone: [4, 8, 0, 3]
}, {
  name: 'Moechus',
  t: 'wolf',
  home: [6, 11],
  zone: [4, 8, 9, 12]
}, {
  name: 'Ursa',
  t: 'bear',
  home: [5, 5],
  zone: [4, 6, 4, 6]
}, {
  name: 'Brutum',
  t: 'bear',
  home: [7, 7],
  zone: [6, 8, 6, 8]
}];
/* ---- EVERY CITY KEEPS ITS OWN BEASTS (v0.20) ----
   The base roles never change (2 snakes, 2 wolves, 2 bears, the 2 lions the cards release, one human
   champion who fights like Commodus), but each arena names them after its own legends. Tholo keeps
   the rulebook's name everywhere. Roma keeps the rulebook's names.
   Role keys: Glykon, Arenosus (snakes) · Valencia, Moechus (wolves) · Ursa, Brutum (bears) · Leo, Leaena (lions) · Commodus (the champion). */
/* v0.22: what a named beast IS, for labels like “Archimedes (Human)” */
const NPC_KIND = {
  snake: _T('Snake'),
  wolf: _T('Wolf'),
  bear: _T('Bear'),
  lion: _T('Lion'),
  commodus: _T('Human'),
  tholo: _T('Unknown'),
  zora: _T('Golden eagle')
};
/* npcKind — human-readable kind for an NPC type key (NPC_KIND, else the NPCT name, else the key itself). */
const npcKind = target => NPC_KIND[target] || (typeof NPCT !== 'undefined' && NPCT[target] ? NPCT[target].n : target);
/* npcLbl — display label 'Name (Kind)' for an NPC; the rulebook Tholo is labelled just 'Tholo'. */
const npcLbl = npc => npc.t === 'tholo' && npc.name === 'Tholo' ? _T('Tholo') : `${npc.name} (${npcKind(npc.t)})`;
/* CITY_BEASTS — per-location names for each beast role key (see the role list above); champ is the champion's flavor line. Edit names freely; keep the role keys. */
const CITY_BEASTS = {
  Roma: {
    Glykon: _T('Glykon'),
    Arenosus: _T('Arenosus'),
    Valencia: _T('Valencia'),
    Moechus: _T('Moechus'),
    Ursa: _T('Ursa'),
    Brutum: _T('Brutum'),
    Leo: _T('Leo'),
    Leaena: _T('Leaena'),
    Commodus: _T('Commodus'),
    champ: _T('Commodus, the emperor who fought as a secutor')
  },
  Syracusae: {
    Glykon: _T('Scylla'),
    Arenosus: _T('Charybdis'),
    Valencia: _T('Aetna'),
    Moechus: _T('Cyane'),
    Ursa: _T('Ortygia'),
    Brutum: _T('Dionys'),
    Leo: _T('Hiero'),
    Leaena: _T('Arethusa'),
    Commodus: _T('Archimedes'),
    champ: _T('Archimedes of Syracuse, who burned a fleet with mirrors')
  },
  Verona: {
    Glykon: _T('Adige'),
    Arenosus: _T('Benaco'),
    Valencia: _T('Lupa Veneta'),
    Moechus: _T('Cimbro'),
    Ursa: _T('Montebaldo'),
    Brutum: _T('Lessinia'),
    Leo: _T('Catullo'),
    Leaena: _T('Lesbia'),
    Commodus: _T('Catullus'),
    champ: _T('Catullus the poet, who fights with words and a falcata')
  },
  Arles: {
    Glykon: _T('Rhodanus'),
    Arenosus: _T('Camargue'),
    Valencia: _T('Alyscamps'),
    Moechus: _T('Crau'),
    Ursa: _T('Ventoux'),
    Brutum: _T('Luberon'),
    Leo: _T('Sextius'),
    Leaena: _T('Ligura'),
    Commodus: _T('Sextius'),
    champ: _T('Sextius Calvinus, founder of the colony')
  },
  Capua: {
    Glykon: _T('Volturnus'),
    Arenosus: _T('Liternum'),
    Valencia: _T('Batiatus'),
    Moechus: _T('Lentulus'),
    Ursa: _T('Tifata'),
    Brutum: _T('Sannio'),
    Leo: _T('Crixus'),
    Leaena: _T('Oenomaus'),
    Commodus: _T('Spartacus'),
    champ: _T('Spartacus, the Thracian who broke out of this very ludus')
  },
  Thysdrus: {
    Glykon: _T('Sahel'),
    Arenosus: _T('Byrsa'),
    Valencia: _T('Sufetula'),
    Moechus: _T('Numida'),
    Ursa: _T('Atlas'),
    Brutum: _T('Aures'),
    Leo: _T('Massinissa'),
    Leaena: _T('Sophonisba'),
    Commodus: _T('Gordian'),
    champ: _T('Gordian, proclaimed emperor in this amphitheater')
  },
  Nemausus: {
    Glykon: _T('Vardo'),
    Arenosus: _T('Fontaine'),
    Valencia: _T('Cevenna'),
    Moechus: _T('Garrigue'),
    Ursa: _T('Aigoual'),
    Brutum: 'Lozère',
    Leo: _T('Antoninus'),
    Leaena: _T('Nemausa'),
    Commodus: _T('Antoninus'),
    champ: _T('Antoninus Pius, son of Nemausus, who fights with imperial calm')
  },
  Pompeii: {
    Glykon: _T('Sarnus'),
    Arenosus: _T('Cinis'),
    Valencia: _T('Bark Boi Arlosefus'),
    Moechus: _T('Herculanea'),
    Ursa: _T('Fumus'),
    Brutum: _T('Lapillus'),
    Leo: _T('Toshiro Mifune'),
    Leaena: _T('Miss Fernadette III'),
    /* v0.45: the house pets of Pompeii */Commodus: _T('Celadus'),
    champ: _T('Celadus the Thracian, "sigh of the girls", scratched on these very walls')
  },
  'Leptis Magna': {
    Glykon: _T('Lebda'),
    Arenosus: _T('Garama'),
    Valencia: _T('Syrtis'),
    Moechus: _T('Tripolis'),
    Ursa: _T('Gebel'),
    Brutum: _T('Sirte'),
    Leo: _T('Severus'),
    Leaena: _T('Domna'),
    Commodus: _T('Severus'),
    champ: _T('Septimius Severus, the African emperor, home at last')
  },
  Uthina: {
    Glykon: _T('Oudna'),
    Arenosus: _T('Zaghouan'),
    Valencia: _T('Punica'),
    Moechus: _T('Bagrada'),
    Ursa: _T('Hannibal'),
    Brutum: _T('Hasdrubal'),
    Leo: _T('Hamilcar'),
    Leaena: _T('Dido'),
    Commodus: _T('Hannibal'),
    champ: _T('Hannibal Barca, who fights as he marched — with elephants in mind')
  },
  Pola: {
    Glykon: _T('Histria'),
    Arenosus: _T('Brioni'),
    Valencia: _T('Iapod'),
    Moechus: _T('Liburna'),
    Ursa: 'Učka',
    Brutum: _T('Kvarner'),
    Leo: _T('Diocletian'),
    Leaena: _T('Prisca'),
    Commodus: _T('Diocletian'),
    champ: _T('Diocletian, the soldier-emperor who retired to grow cabbages')
  },
  Puteoli: {
    Glykon: _T('Solfatara'),
    Arenosus: _T('Avernus'),
    Valencia: _T('Cumae'),
    Moechus: _T('Baiae'),
    Ursa: _T('Misenum'),
    Brutum: _T('Ischia'),
    Leo: _T('Sibylla'),
    Leaena: _T('Lucrinus'),
    Commodus: _T('Petronius'),
    champ: _T('Petronius, arbiter of taste, who dines before he duels')
  }
};
/* beastName — the local name of a beast role key at location li (default: the current event's location, else Roma); falls back to the key. */
const beastName = (key, li) => {
  const L = LOCATIONS[li != null ? li : S ? S.locIdx : 6];
  const T = L && CITY_BEASTS[L.n];
  return T && T[key] || key;
};
/* ZONE_TINT — overlay color painted over each beast type's guarded zone. TWEAK: the rgba colors. */
const ZONE_TINT = {
  snake: 'rgba(150,108,20,.32)',
  wolf: 'rgba(215,225,235,.22)',
  bear: 'rgba(163,40,31,.20)'
};

/* ---- Weapons: stats read from the weapon cards (border color = market level; gold = Arena Chest) ----
   p power · r range · ammo · atkUses (uses) · throw {p,r,n throws} · shield absorb/uses · cfw CF per hit · soul HP per hit · both = both attacks.
   img = index in assets/weapons.jpg */
/* W, more fields: n name · lv market level (0 = never sold) · limb severed-limb weapon · noAtk cannot attack · flav / lyre / stones special items. Changing p, r, ammo or throw rebalances that weapon everywhere it appears. */
const W = {
  gladius: {
    n: 'Gladius',
    lv: 1,
    p: 1,
    r: 1,
    img: 0
  },
  mace: {
    n: 'Mace',
    lv: 1,
    p: 1,
    r: 1,
    img: 1
  },
  sica: {
    n: 'Sica',
    lv: 1,
    p: 1,
    r: 1,
    img: 2
  },
  hasta: {
    n: 'Hasta',
    lv: 1,
    p: 1,
    r: 2,
    throw: {
      p: 2,
      r: 4,
      n: 1
    },
    img: 3
  },
  stones: {
    n: 'Stones',
    lv: 1,
    p: 1,
    r: 2,
    ammo: 3,
    img: 4
  },
  thracian: {
    n: 'Thracian Shield',
    lv: 1,
    p: 0,
    r: 0,
    shield: 1,
    absorb: 1,
    uses: 3,
    img: 5
  },
  knives: {
    n: 'Knives',
    lv: 1,
    p: 1,
    r: 3,
    ammo: 4,
    img: 6
  },
  trident: {
    n: 'Tridenti',
    lv: 1,
    p: 1,
    r: 2,
    throw: {
      p: 2,
      r: 4,
      n: 1
    },
    img: 7
  },
  rudis: {
    n: 'Rudis',
    lv: 1,
    p: 1,
    r: 1,
    cfw: 1,
    atkUses: 6,
    img: 8
  },
  severedArm: {
    n: 'Severed Arm',
    lv: 0,
    p: 1,
    r: 1,
    limb: 'arm',
    atkUses: 3,
    img: 9
  },
  severedLeg: {
    n: 'Severed Leg',
    lv: 0,
    p: 1,
    r: 1,
    limb: 'leg',
    atkUses: 3,
    img: 10
  },
  axe: {
    n: 'Axe',
    lv: 2,
    p: 2,
    r: 1,
    throw: {
      p: 2,
      r: 3,
      n: 1
    },
    img: 11
  },
  falcata: {
    n: 'Falcata',
    lv: 2,
    p: 2,
    r: 1,
    img: 12
  },
  bow: {
    n: 'Parthian Bow',
    lv: 2,
    p: 1,
    r: 5,
    ammo: 5,
    img: 13
  },
  pugio: {
    n: 'Royal Dagger',
    lv: 2,
    p: 2,
    r: 1,
    img: 14
  },
  scissor: {
    n: 'Scissor',
    lv: 2,
    p: 1,
    r: 1,
    cfw: 1,
    img: 15
  },
  scutum: {
    n: 'Scutum Shield',
    lv: 2,
    p: 0,
    r: 0,
    shield: 1,
    absorb: 2,
    uses: 4,
    img: 16
  },
  sling: {
    n: 'Stone Sling',
    lv: 2,
    p: 1,
    r: 5,
    ammo: 4,
    stones: 1,
    img: 17
  },
  arcu: {
    n: 'Arcuballista',
    lv: 3,
    p: 2,
    r: 5,
    ammo: 6,
    img: 18
  },
  charun: {
    n: 'Charun',
    lv: 3,
    p: 4,
    r: 2,
    img: 19
  },
  flavgl: {
    n: 'Gladius of Flavius',
    lv: 3,
    p: 4,
    r: 1,
    flav: 1,
    img: 20
  },
  jade: {
    n: 'Jade Spear',
    lv: 3,
    p: 3,
    r: 2,
    throw: {
      p: 4,
      r: 4,
      n: 3
    },
    img: 21
  },
  flail: {
    n: 'Tri-Ball Flail',
    lv: 3,
    p: 4,
    r: 2,
    img: 22
  },
  pilum: {
    n: 'Weighted Pilum',
    lv: 3,
    p: 2,
    r: 2,
    throw: {
      p: 3,
      r: 4,
      n: 6
    },
    img: 23
  },
  labrys: {
    n: 'Labrys',
    lv: 4,
    p: 4,
    r: 2,
    both: 1,
    img: 24
  },
  psykhe: {
    n: 'Psykhe',
    lv: 4,
    p: 4,
    r: 2,
    soul: 1,
    img: 25
  },
  achilles: {
    n: 'Shield of Achilles',
    lv: 4,
    p: 2,
    r: 1,
    shield: 1,
    absorb: 2,
    uses: 12,
    img: 26
  },
  lyre: {
    n: 'Lyre of Orpheus',
    lv: 0,
    p: 0,
    r: 0,
    lyre: 1
  },
  chariotCard: {
    n: 'Chariot card',
    lv: 0,
    p: 0,
    r: 0,
    noAtk: 1
  }
};
/* PUNCH — the bare-fist attack used with an empty hand. TWEAK: p power, r range. */
const PUNCH = {
  n: 'Fist',
  p: 1,
  r: 1,
  punch: 1
};
// one card of each in the market, including a single Rudis and no severed limbs (class starting weapons are pulled out for the gladiators in play)
const MARKET_W = {
  1: ['gladius', 'mace', 'sica', 'hasta', 'stones', 'thracian', 'knives', 'trident', 'rudis'],
  2: ['axe', 'falcata', 'bow', 'pugio', 'scissor', 'scutum', 'sling'],
  3: ['arcu', 'charun', 'flavgl', 'jade', 'flail', 'pilum']
};
/* CHEST_W — weapons that can come out of the Arena Chest. */
const CHEST_W = ['labrys', 'psykhe', 'achilles'];

/* ---- Armor pieces (p.22-23). Each body location has equip points: head helm · chest · arm upper/lower/hand · leg upper/lower.
   A point holds one regular armor and, beneath it, one stackable armor (padded wraps, belts). pair = one purchase covers both sides. ---- */
/* ARM fields: n name · lv market level · slot body part · pt equip point · ap armor points · pair (one buy covers both sides) · stack (stackable under-layer) · bonus {location: AP} extra AP elsewhere · flav Flavius set piece · cestus / greaves special effects. Change ap to rebalance a piece. */
const ARM = {
  galea: {
    n: 'Galea',
    lv: 1,
    slot: 'head',
    pt: 'helm',
    ap: 2
  },
  cassis: {
    n: 'Cassis',
    lv: 2,
    slot: 'head',
    pt: 'helm',
    ap: 3
  },
  crista: {
    n: 'Crested Galea',
    lv: 2,
    slot: 'head',
    pt: 'helm',
    ap: 3,
    bonus: {
      chest: 1
    }
  },
  murmillo: {
    n: 'Murmillo Helm',
    lv: 2,
    slot: 'head',
    pt: 'helm',
    ap: 4
  },
  helm5: {
    n: 'Secutor Helm',
    lv: 3,
    slot: 'head',
    pt: 'helm',
    ap: 5
  },
  flavhelm: {
    n: "Flavius' Helm",
    lv: 3,
    slot: 'head',
    pt: 'helm',
    ap: 5,
    flav: 1
  },
  balteus: {
    n: 'Gladiator Belt',
    lv: 1,
    slot: 'chest',
    pt: 'chest',
    ap: 2,
    stack: 1
  },
  pectorale: {
    n: 'Pectorale',
    lv: 1,
    slot: 'chest',
    pt: 'chest',
    ap: 3
  },
  lorica: {
    n: 'Lorica Squamata',
    lv: 2,
    slot: 'chest',
    pt: 'chest',
    ap: 4
  },
  musculata: {
    n: 'Lorica Musculata',
    lv: 3,
    slot: 'chest',
    pt: 'chest',
    ap: 5
  },
  amazon: {
    n: 'Amazonian Cuirass',
    lv: 3,
    slot: 'chest',
    pt: 'chest',
    ap: 5
  },
  flavchest: {
    n: "Flavius' Chest Armor",
    lv: 3,
    slot: 'chest',
    pt: 'chest',
    ap: 5,
    flav: 1
  },
  thorax: {
    n: 'Thorax Plate',
    lv: 3,
    slot: 'chest',
    pt: 'chest',
    ap: 7,
    bonus: {
      rarm: 4,
      larm: 4
    }
  },
  wraps: {
    n: 'Padded Arm Armor',
    lv: 1,
    slot: 'arm',
    pt: 'lower',
    ap: 2,
    stack: 1,
    pair: 1
  },
  manica: {
    n: 'Manica',
    lv: 2,
    slot: 'arm',
    pt: 'upper',
    ap: 3,
    bonus: {
      head: 1
    }
  },
  provmanica: {
    n: 'Provocator Manica',
    lv: 2,
    slot: 'arm',
    pt: 'upper',
    ap: 3,
    bonus: {
      chest: 2
    }
  },
  spaulder: {
    n: 'Spaulder',
    lv: 2,
    slot: 'arm',
    pt: 'upper',
    ap: 3,
    bonus: {
      chest: 1
    }
  },
  cestus: {
    n: 'Cestus',
    lv: 2,
    slot: 'arm',
    pt: 'hand',
    ap: 2,
    cestus: 1
  },
  galerus: {
    n: 'Galerus',
    lv: 3,
    slot: 'arm',
    pt: 'upper',
    ap: 4,
    bonus: {
      head: 2
    }
  },
  bracers: {
    n: "Flavius' Bracers",
    lv: 3,
    slot: 'arm',
    pt: 'lower',
    ap: 3,
    pair: 1,
    flav: 1
  },
  legwrapsU: {
    n: 'Padded Leg Armor (upper)',
    lv: 1,
    slot: 'leg',
    pt: 'upper',
    ap: 2,
    stack: 1,
    pair: 1
  },
  legwraps: {
    n: 'Padded Leg Armor (lower)',
    lv: 1,
    slot: 'leg',
    pt: 'lower',
    ap: 2,
    stack: 1,
    pair: 1
  },
  femoralia: {
    n: 'Femoralia',
    lv: 2,
    slot: 'leg',
    pt: 'upper',
    ap: 3,
    pair: 1
  },
  ocrea: {
    n: 'Ocrea',
    lv: 2,
    slot: 'leg',
    pt: 'lower',
    ap: 4,
    pair: 1
  },
  greaves: {
    n: "Flavius' Greaves",
    lv: 2,
    slot: 'leg',
    pt: 'lower',
    ap: 3,
    pair: 1,
    greaves: 1,
    flav: 1
  },
  thighplate: {
    n: 'Thigh Plate',
    lv: 3,
    slot: 'leg',
    pt: 'upper',
    ap: 4,
    pair: 1
  },
  cnemis: {
    n: 'Cnemis',
    lv: 3,
    slot: 'leg',
    pt: 'lower',
    ap: 5,
    pair: 1
  }
};
/* PT_NAME — display name for each armor equip point. */
const PT_NAME = {
  helm: 'helm',
  chest: 'chest',
  upper: 'upper',
  lower: 'lower',
  hand: 'hand'
};
// armor token art from the rulebook's armor page (index in assets/armor.jpg)
{
  const order = 'galea,cassis,crista,murmillo,helm5,flavhelm,balteus,pectorale,lorica,musculata,flavchest,amazon,thorax,wraps,manica,provmanica,spaulder,cestus,galerus,bracers,legwrapsU,legwraps,femoralia,ocrea,greaves,thighplate,cnemis'.split(',');
  order.forEach((k, i) => {
    if (ARM[k]) ARM[k].img = i;
  });
}
// Flavius' Chest Armor is set aside until claimed (Mandata Flavi)
/* MARKET_A — armor keys in each market level's pile (a repeated key = extra copies). Edit to change what armor can be bought. */
const MARKET_A = {
  1: ['galea', 'galea', 'pectorale', 'balteus', 'balteus', 'wraps', 'legwrapsU', 'legwraps'],
  2: ['cassis', 'cassis', 'crista', 'murmillo', 'murmillo', 'lorica', 'lorica', 'lorica', 'manica', 'spaulder', 'cestus', 'femoralia', 'ocrea', 'greaves'],
  3: ['flavhelm', 'helm5', 'musculata', 'amazon', 'thorax', 'galerus', 'bracers', 'thighplate', 'cnemis']
};
/* COST — base coin price of market weapons and armor by level (scaled by S.priceMul, minus discounts). TWEAK: the prices. */
const COST = {
  1: 4,
  2: 8,
  3: 12
};

/* ---- Classes (class cards). img = index in assets/classes.jpg and assets/classbacks.jpg ---- */
/* CLASSES fields: name / sub / hero / city flavor · img art index · color token color · armor [[armorKey, location]] starting armor · R / L right / left hand starting weapon · coin and keys starting stock · items starting items ('c:key' = an arena card) · abil ability code · ab ability text. Edit to change starting kits (ab is text only). */
const CLASSES = {
  soldier: {
    name: 'Soldier',
    sub: _T('Legionnaire'),
    hero: _T('Decimus Triarius'),
    city: 'Nemausus',
    img: 0,
    color: '#c0433a',
    armor: [['galea', 'head'], ['balteus', 'chest'], ['wraps', 'rarm'], ['wraps', 'larm'], ['legwrapsU', 'rleg'], ['legwrapsU', 'lleg']],
    R: 'gladius',
    coin: 3,
    keys: 2,
    items: ['ap3'],
    abil: 'dmg',
    ab: _T('Ability: +1 damage to every successful attack in round 1.')
  },
  royalty: {
    name: 'Royalty',
    sub: _T('Patrician'),
    hero: _T('Varinius Gracchi'),
    city: 'Capua',
    img: 2,
    color: '#4f7fc4',
    armor: [['cassis', 'head'], ['lorica', 'chest'], ['wraps', 'rarm'], ['wraps', 'larm']],
    R: 'pugio',
    coin: 3,
    keys: 2,
    items: [],
    abil: 'coin',
    ab: _T('Ability: +1 coin each turn (phase 3).')
  },
  hero: {
    name: 'Hero',
    sub: _T('Provocator'),
    hero: _T('Thraex Murmillo'),
    city: 'Pompeii',
    img: 3,
    color: '#4f9a57',
    armor: [['murmillo', 'head'], ['provmanica', 'larm'], ['wraps', 'rarm'], ['wraps', 'larm'], ['legwrapsU', 'rleg'], ['legwrapsU', 'lleg']],
    R: 'sica',
    L: 'scutum',
    coin: 3,
    keys: 2,
    items: ['c:ward'],
    abil: 'cf',
    ab: _T('Ability: +1 CF each turn (phase 3).')
  },
  slave: {
    name: 'Slave',
    sub: _T('Retiarius'),
    hero: _T('Don Retiarius'),
    city: 'Leptis Magna',
    img: 1,
    color: '#d4b13c',
    armor: [['galea', 'head'], ['manica', 'larm'], ['wraps', 'rarm'], ['wraps', 'larm'], ['legwrapsU', 'rleg'], ['legwrapsU', 'lleg']],
    R: 'trident',
    coin: 3,
    keys: 2,
    items: ['c:rete'],
    abil: 'mv',
    ab: _T('Ability: +1 movement each turn.')
  },
  veteranus: {
    name: 'Veteranus',
    sub: _T('Lanista'),
    hero: _T('Cato Quirinus'),
    city: 'Arles',
    img: 4,
    color: '#cfc6b4',
    armor: [['flavhelm', 'head'], ['flavchest', 'chest'], ['wraps', 'rarm'], ['wraps', 'larm'], ['legwraps', 'rleg'], ['legwraps', 'lleg']],
    R: 'rudis',
    coin: 0,
    keys: 2,
    items: [],
    abil: 'vet',
    ab: _T('Ability: +1 coin or +1 CF each turn. Weakness: weapons, armor and CF purchases cost 1 coin or 1 CF more.')
  },
  amazonia: {
    name: 'Amazonia',
    sub: _T('Gladiatrix'),
    hero: _T('Tullia Maxima'),
    city: 'Syracusae',
    img: 7,
    color: '#dc7a34',
    armor: [['amazon', 'chest'], ['cestus', 'rarm'], ['greaves', 'rleg'], ['greaves', 'lleg'], ['legwraps', 'rleg'], ['legwraps', 'lleg']],
    R: 'axe',
    L: 'falcata',
    coin: 3,
    keys: 2,
    items: [],
    abil: null,
    ab: _T('Ability: none (Cestus +1 damage, greaves +1 movement). Weakness: never receives CF from Blessings.')
  },
  venatore: {
    name: 'Venatore',
    sub: _T('Bestiarius'),
    hero: _T('Trajan Falto'),
    city: 'Uthina',
    img: 6,
    color: '#8a5cc0',
    armor: [['galea', 'head'], ['balteus', 'chest'], ['wraps', 'rarm'], ['wraps', 'larm'], ['legwraps', 'rleg'], ['legwraps', 'lleg']],
    R: 'hasta',
    coin: 0,
    keys: 0,
    items: ['c:tame'],
    abil: 'zora',
    ab: _T('Ability: declare Zora the golden eagle once per event. Weakness: can never use tunnels.')
  },
  damnatio: {
    name: 'Damnatio',
    sub: _T('Condemned'),
    hero: _T('Damnatio'),
    city: 'Roma',
    img: 5,
    color: '#9a8f84',
    armor: [['wraps', 'rarm'], ['wraps', 'larm'], ['legwraps', 'rleg'], ['legwraps', 'lleg']],
    R: 'sling',
    coin: 0,
    keys: 0,
    items: ['c:lure'],
    abil: 'stone',
    ab: _T('Ability: gain 1 stone each turn; +10 CF to the final score if the Damnatio wins any event. Weakness: pelted with a stone (1 damage) each turn.')
  }
};

// class weaknesses as flags, so custom characters can take them too
const CLASS_WEAK = {
  amazonia: 'noBlessCF',
  venatore: 'noTunnel',
  damnatio: 'pelted',
  veteranus: 'tax'
};
/* WEAKNESSES — weakness code → [label, description, point value]; the value is subtracted from a Creator Studio character's point cost. TWEAK: labels, text, point values. */
const WEAKNESSES = {
  none: [_T('None'), _T('No drawback.'), 0],
  noBlessCF: [_T('No Blessings CF'), _T('Never receives CF from Blessings pots or crowd offerings (Amazonia).'), 2],
  noTunnel: [_T('Claustrophobic'), _T('Can never use tunnels (Venatore).'), 1],
  pelted: [_T('Hated by the crowd'), _T('Pelted with a stone (1 damage) every Resolve phase, but +10 CF if they win (Damnatio).'), 4],
  tax: [_T('Old debts'), _T('Weapons, armor and CF purchases cost 1 more (Veteranus).'), 2]
};
/* weak — true if the player's class has weakness k (a custom character's own weak field, else CLASS_WEAK). */
const weak = (player, k) => {
  if (!player) return false;
  const C = CLASSES[player.cls];
  return (C && C.weak || CLASS_WEAK[player.cls] || 'none') === k;
};
const BASE_CLS = Object.keys(CLASSES);

/* ---- Arena deck (70 cards) and the 12 round-2 cards, from the card sheets.
   type: instant (resolve on draw) · declare (phase 3) · anytime (even off-turn) · active (stays in play) · npc (spawn).
   img = index in assets/arena.jpg (row*10+col; 70+ are the round-2 sheet) ---- */
const Q_BAD = _T('All bad fortune is conquered by endurance'),
  Q_BUY = _T('Let the buyer beware');
/* CARDS fields: n name · type (see above) · d card text · q quote · img art index · effect numbers: hp heal amount, loc armor location lost, mv movement, ap Forge AP, lv armor level, dmg Hercules bonus damage, flip Omnia strength, bear which bear aggros, cls Piaculum class. d is text only; the numbers drive the effect. */
const CARDS = {
  wealth3: {
    n: 'Wealth of Saturn',
    type: 'instant',
    d: _T('You are awarded 3 coin.'),
    q: _T('Accept the things to which fate binds you'),
    img: 0
  },
  wealth5: {
    n: 'Wealth of Saturn',
    type: 'instant',
    d: _T('You are awarded 5 coin.'),
    q: _T('Accept the things to which fate binds you'),
    img: 2
  },
  elixir4: {
    n: 'Health Elixir',
    type: 'anytime',
    d: _T('Distribute 4 HP to any remaining body parts (or save a location that drops to 0 HP).'),
    q: _T('From head to heel'),
    img: 4,
    hp: 4
  },
  elixir2: {
    n: 'Health Elixir',
    type: 'anytime',
    d: _T('Distribute 2 HP to any remaining body parts (or save a location that drops to 0 HP).'),
    q: _T('From head to heel'),
    img: 6,
    hp: 2
  },
  wpnR: {
    n: 'Primary Weapon Falls Apart!',
    type: 'instant',
    d: _T('Discard your primary (right-hand) weapon.'),
    q: Q_BAD,
    img: 8
  },
  wpnL: {
    n: 'Secondary Weapon Falls Apart!',
    type: 'instant',
    d: _T('Discard your secondary (left-hand) weapon.'),
    q: Q_BAD,
    img: 9
  },
  armHead: {
    n: 'Your Head Armor Falls Apart!',
    type: 'instant',
    d: _T('Discard all armor on your head and set its AP to 0.'),
    q: Q_BAD,
    img: 10,
    loc: 'head'
  },
  armChest: {
    n: 'Your Chest Armor Falls Apart',
    type: 'instant',
    d: _T('Discard all armor on your chest and set its AP to 0.'),
    q: Q_BAD,
    img: 11,
    loc: 'chest'
  },
  armRarm: {
    n: 'Your Right Arm Armor Falls Apart!',
    type: 'instant',
    d: _T('Discard all armor on your right arm and set its AP to 0.'),
    q: Q_BAD,
    img: 12,
    loc: 'rarm'
  },
  armLarm: {
    n: 'Your Left Arm Armor Falls Apart!',
    type: 'instant',
    d: _T('Discard all armor on your left arm and set its AP to 0.'),
    q: Q_BAD,
    img: 13,
    loc: 'larm'
  },
  armRleg: {
    n: 'Your Right Leg Armor Falls Apart!',
    type: 'instant',
    d: _T('Discard all armor on your right leg and set its AP to 0.'),
    q: Q_BAD,
    img: 14,
    loc: 'rleg'
  },
  armLleg: {
    n: 'Your Left Leg Armor Falls Apart!',
    type: 'instant',
    d: _T('Discard all armor on your left leg and set its AP to 0.'),
    q: Q_BAD,
    img: 15,
    loc: 'lleg'
  },
  fallsApart: {
    n: 'All of Your Armor Falls Apart!',
    type: 'instant',
    d: _T('Discard all of your equipped armor and set all AP to 0.'),
    q: Q_BAD,
    img: 16
  },
  merc1: {
    n: 'Speed of Mercury',
    type: 'instant',
    d: _T('1 extra movement for this turn only.'),
    q: _T('Fortune favors the bold'),
    img: 17,
    mv: 1
  },
  merc2: {
    n: 'Speed of Mercury',
    type: 'instant',
    d: _T('2 extra movement for this turn only.'),
    q: _T('Fortune favors the bold'),
    img: 19,
    mv: 2
  },
  mercRound: {
    n: 'Speed of Mercury',
    type: 'active',
    d: _T('1 extra movement for the remainder of the round.'),
    q: _T('Fortune favors the bold'),
    img: 21
  },
  focus: {
    n: 'Focus!',
    type: 'declare',
    d: _T('Choose the hit location for 1 attack this turn. Declare before rolling any attack dice.'),
    q: _T('Honor to the vanquished'),
    img: 22
  },
  lure: {
    n: 'Meat Lure',
    type: 'declare',
    d: _T('Throw a meat lure (range 4): aggro any 1 NPC in play onto another player. Works on Tholo; breaks a tame bond.'),
    q: _T('Accept without conceit, relinquish without reluctance'),
    img: 23
  },
  mchoice: {
    n: 'Choose',
    type: 'declare',
    d: _T('If you purchase from the market this turn, you may choose your items.'),
    q: Q_BUY,
    img: 24
  },
  discount: {
    n: '% Off',
    type: 'declare',
    d: _T('If you purchase from the market this turn, weapons and armor cost 2 less coin.'),
    q: Q_BUY,
    img: 25
  },
  forge3: {
    n: 'Forge of Vulcan',
    type: 'declare',
    d: _T('Add 3 AP to one of your equipped armor locations.'),
    q: _T('Do brave deeds and endure'),
    img: 26,
    ap: 3
  },
  forge2: {
    n: 'Forge of Vulcan',
    type: 'declare',
    d: _T('Add 2 AP to one of your equipped armor locations.'),
    q: _T('Do brave deeds and endure'),
    img: 27,
    ap: 2
  },
  ursa: {
    n: 'Ursa Aggros You!',
    type: 'instant',
    d: _T("Ursa's aggro token moves to you. If Ursa is already eliminated or tamed, gain 2 CF."),
    q: _T('Devote yourself to inevitable death'),
    img: 28,
    bear: _T('Ursa')
  },
  brutum: {
    n: 'Brutum Aggros You!',
    type: 'instant',
    d: _T("Brutum's aggro token moves to you. If Brutum is already eliminated or tamed, gain 2 CF."),
    q: _T('Devote yourself to inevitable death'),
    img: 29,
    bear: _T('Brutum')
  },
  rete: {
    n: 'Rete',
    type: 'declare',
    d: _T('Throw a net (range 4) on 1 player or NPC. The target loses its movement on its next turn.'),
    q: _T('A man should be upright, not kept upright'),
    img: 30
  },
  marm1: {
    n: 'Level 1 Armor',
    type: 'instant',
    d: _T('Go directly to the market and choose any remaining level 1 armor.'),
    q: _T('Riches do not profit in the day of wrath'),
    img: 32,
    lv: 1
  },
  marm2: {
    n: 'Level 2 Armor',
    type: 'instant',
    d: _T('Go directly to the market and choose any remaining level 2 armor.'),
    q: _T('Riches do not profit in the day of wrath'),
    img: 33,
    lv: 2
  },
  telonium: {
    n: 'Flavius Telonium',
    type: 'instant',
    d: _T('Discard 4 coin.'),
    q: _T('Accept the things to which fate binds you'),
    img: 34
  },
  hygeia: {
    n: 'Blessings of Hygeia',
    type: 'declare',
    d: _T('"Regrow" 1 severed arm or leg and set it to 4 HP.'),
    q: _T('No mortal is wise at all times'),
    img: 35
  },
  fortuna: {
    n: "Fortuna's Bounty",
    type: 'instant',
    d: _T('Gain 2 CF and 2 coin. Spawn 2 offerings and draw another arena card.'),
    q: _T('Let them hate so long as they fear'),
    img: 36
  },
  hercules1: {
    n: 'Herculean Vigor',
    type: 'declare',
    d: _T('If your next attack lands at least 1 hit, add 1 to the total damage. Declare before rolling.'),
    q: _T('Leave all else to the gods'),
    img: 38,
    dmg: 1
  },
  hercules2: {
    n: 'Herculean Vigor',
    type: 'declare',
    d: _T('If your next attack lands at least 1 hit, add 2 to the total damage. Declare before rolling.'),
    q: _T('Leave all else to the gods'),
    img: 72,
    dmg: 2
  },
  omnia1: {
    n: 'Omnia Mutantur',
    type: 'anytime',
    d: _T('Turn 1 miss into a hit.'),
    q: _T('Everything changes, nothing perishes'),
    img: 40,
    flip: 1
  },
  omnia2: {
    n: 'Omnia Mutantur',
    type: 'anytime',
    d: _T('Turn 2 misses into hits.'),
    q: _T('Everything changes, nothing perishes'),
    img: 42,
    flip: 2
  },
  lashings: {
    n: 'Lashings!',
    type: 'instant',
    d: _T('You are dealt 2 damage directly to your chest health. End your turn.'),
    q: _T('There is no easy way from the earth to the stars'),
    img: 43
  },
  ward: {
    n: 'Ward of the Evil Eye',
    type: 'declare',
    d: _T('NPCs cannot attack you during your next resolve phase.'),
    q: _T('Remember that you are alive'),
    img: 44
  },
  spikes: {
    n: 'Floor Spikes!',
    type: 'instant',
    d: _T('The arena shakes as floor spikes rise at D, I, 4 and 9. Anyone on or pushed onto a spike takes 2 damage.'),
    q: _T('It is how well you live that matters, not how long'),
    img: 46
  },
  pia_royalty: {
    n: 'Piaculum',
    type: 'instant',
    d: _T('Give Royalty 2 coin. If that player is you, everyone gives you 2 coin.'),
    q: _T('To bear this worthily is good fortune'),
    img: 47,
    cls: 'royalty'
  },
  pia_soldier: {
    n: 'Piaculum',
    type: 'instant',
    d: _T('Give Soldier 2 coin. If that player is you, everyone gives you 2 coin.'),
    q: _T('To bear this worthily is good fortune'),
    img: 48,
    cls: 'soldier'
  },
  pia_slave: {
    n: 'Piaculum',
    type: 'instant',
    d: _T('Give Slave 2 coin. If that player is you, everyone gives you 2 coin.'),
    q: _T('To bear this worthily is good fortune'),
    img: 49,
    cls: 'slave'
  },
  pia_hero: {
    n: 'Piaculum',
    type: 'instant',
    d: _T('Give Hero 2 coin. If that player is you, everyone gives you 2 coin.'),
    q: _T('To bear this worthily is good fortune'),
    img: 50,
    cls: 'hero'
  },
  pia_amazonia: {
    n: 'Piaculum',
    type: 'instant',
    d: _T('Give Amazonia 2 coin. If that player is you, everyone gives you 2 coin.'),
    q: _T('To bear this worthily is good fortune'),
    img: 51,
    cls: 'amazonia'
  },
  pia_venatore: {
    n: 'Piaculum',
    type: 'instant',
    d: _T('Give Venatore 2 coin. If that player is you, everyone gives you 2 coin.'),
    q: _T('To bear this worthily is good fortune'),
    img: 52,
    cls: 'venatore'
  },
  pia_veteranus: {
    n: 'Piaculum',
    type: 'instant',
    d: _T('Give Veteranus 2 coin. If that player is you, everyone gives you 2 coin.'),
    q: _T('To bear this worthily is good fortune'),
    img: 53,
    cls: 'veteranus'
  },
  ammo: {
    n: 'Ammo',
    type: 'declare',
    d: _T('Replenish all of your ammo, or exchange 2 Ammo cards for any available market weapon that uses ammo.'),
    q: _T('We mortals are but shadows and dust'),
    img: 54
  },
  lyre: {
    n: 'Lyre of Orpheus',
    type: 'declare',
    d: _T('Form a tame bond with 1 snake, wolf, bear or lion in play. Control begins at your next resolve phase.'),
    q: _T("Only the truth gives to the word the Orpheus' Lyre power"),
    img: 58
  },
  minerva: {
    n: "Minerva's Push",
    type: 'anytime',
    d: _T('Move 1 tile and dodge all damage from 1 incoming attack.'),
    q: _T('The goddess indubitable was revealed in her step'),
    img: 60
  },
  telemachus: {
    n: 'Telemachus Interdico!',
    type: 'active',
    d: _T('Players cannot attack while Telemachus is in play. Roll a d6 to start each player turn; only a 1 or 6 removes him.'),
    q: _T('Fear is proof of a degenerate mind'),
    img: 61
  },
  restless: {
    n: 'The Crowd Grows Restless',
    type: 'active',
    d: _T('If the player in turn does not attack at least once, each player is stoned for 2 damage to a rolled location. Discard after 4 turns.'),
    q: _T('The universe is transformation; life is opinion'),
    img: 62
  },
  endgame: {
    n: 'Flavius Rule',
    type: 'active',
    d: _T('End Game. All players roll 4 hit dice and choose the hit location for any of their attacks. Active for the remainder of play.'),
    q: _T('Hidden talent counts for nothing'),
    img: 63
  },
  spawnLeo: {
    n: 'Leo',
    type: 'npc',
    d: _T('Spawn Leo using the grid dice. Leo targets the closest living player each resolve phase.'),
    img: 64
  },
  spawnLeaena: {
    n: 'Leaena',
    type: 'npc',
    d: _T('Spawn Leaena using the grid dice. Leaena targets the closest living player each resolve phase.'),
    img: 65
  },
  spawnCommodus: {
    n: 'Commodus',
    type: 'npc',
    d: _T('Spawn Commodus; all players take 2 damage to an agreed body location. No CF while he is in play; he hunts the closest player (most CF first).'),
    img: 66
  },
  spawnTholo: {
    n: 'Tholo',
    type: 'npc',
    d: _T('In rounds 1-2 Tholo spawns on the arena center and grabs the chest. Cannot be tamed; collects the coin of anyone it eliminates.'),
    img: 67
  },
  zora: {
    n: 'Zora',
    type: 'npc',
    d: _T('Tamed golden eagle: place Zora on a tile next to you. He moves 6, carries items and attacks for you.'),
    img: 68
  },
  boar: {
    n: 'Calydonian Boar!',
    type: 'active',
    d: _T('To start each resolve phase, players must roll an even number to dodge 2 damage from the boar. Discard after 1 turn rotation.'),
    q: _T('Fear is proof of a degenerate mind'),
    img: 69
  },
  fidelis: {
    n: 'Fidelis Constans',
    type: 'anytime',
    d: _T('Remove 1 hit die from an attack.'),
    q: _T('The gods conceal from men the happiness of death, that they may endure life'),
    img: 81
  },
  tame: {
    n: 'Tame',
    type: 'declare',
    d: _T('Tame 1 snake, wolf, bear or lion anywhere in the arena (Venatore starting card).'),
    img: null
  }
};
/* DECK_BASE — the 70-card arena deck as card keys (repeat a key for more copies). ROUND2_CARDS are the 12 extra cards (dealt as round rewards, or shuffled into the deck when the event has none); DECLARE_PICKS are the declare cards a Juggernaut can draft. Add or remove keys to change card frequency. */
const DECK_BASE = ['wealth3', 'wealth3', 'wealth5', 'wealth5', 'elixir4', 'elixir4', 'elixir2', 'elixir2', 'wpnR', 'wpnL', 'armHead', 'armChest', 'armRarm', 'armLarm', 'armRleg', 'armLleg', 'fallsApart', 'merc1', 'merc1', 'merc2', 'merc2', 'mercRound', 'focus', 'lure', 'mchoice', 'discount', 'forge3', 'forge2', 'ursa', 'brutum', 'rete', 'rete', 'marm1', 'marm2', 'telonium', 'hygeia', 'fortuna', 'fortuna', 'hercules1', 'hercules1', 'omnia1', 'omnia1', 'omnia2', 'lashings', 'ward', 'ward', 'spikes', 'pia_royalty', 'pia_soldier', 'pia_slave', 'pia_hero', 'pia_amazonia', 'pia_venatore', 'pia_veteranus', 'ammo', 'ammo', 'omnia1', 'omnia1', 'lyre', 'lyre', 'minerva', 'telemachus', 'restless', 'endgame', 'spawnLeo', 'spawnLeaena', 'spawnCommodus', 'spawnTholo', 'zora', 'boar'];
const ROUND2_CARDS = ['forge3', 'focus', 'hercules2', 'hercules2', 'hercules2', 'hercules1', 'hercules1', 'omnia1', 'omnia1', 'omnia2', 'omnia2', 'fidelis'];
const DECLARE_PICKS = ['focus', 'lure', 'mchoice', 'discount', 'forge3', 'forge2', 'rete', 'hygeia', 'hercules1', 'hercules2', 'ward', 'ammo', 'lyre'];
/* isElixir — true for either Health Elixir card. */
const isElixir = k => k === 'elixir4' || k === 'elixir2';
/* isOmnia — true for either Omnia Mutantur card. */
const isOmnia = k => k === 'omnia1' || k === 'omnia2';
/* isHerc — true for either Herculean Vigor card. */
const isHerc = k => k === 'hercules1' || k === 'hercules2';
/* isForge — true for either Forge of Vulcan card. */
const isForge = k => k === 'forge3' || k === 'forge2';

/* ---- Mandata Flavi (15 secret objectives). Revealed the moment they are completed; unrevealed cards cost 5 CF at the end.
   declare = completed by a spoken declaration on your turn. img = index in assets/mandati91.webp ---- */
/* MANDATA fields: n name · d task · r reward text · test(player) auto-completion check (usually a player.stats counter) · declare spoken line that completes it · img · reward(player) async effect. TWEAK: the CF numbers inside reward. */
const MANDATA = [{
  n: 'Are You Not Entertained?',
  d: _T('Face the spectators and firmly declare, "Are you not entertained!?!"'),
  r: _T('Spawn 3 offerings'),
  declare: _T('Are you not entertained!?!'),
  img: 0,
  reward: async player => {
    for (let i = 0; i < 3; i++) {
      const [r, c] = freeGrid();
      placeFloor('offer', drawOffer(), r, c);
    }
    log(_T('Three offerings tumble into the sand.'));
  }
}, {
  n: 'The Push',
  d: _T('Go push another player.'),
  r: '2 CF',
  test: player => player.stats.pushPlayer >= 1,
  img: 1,
  reward: async player => {
    player.cf += 2;
  }
}, {
  n: 'The Trade',
  d: _T('Trade with another player.'),
  r: '2 CF',
  test: player => player.stats.trade >= 1,
  img: 2,
  reward: async player => {
    player.cf += 2;
  }
}, {
  n: 'Limb Justice',
  d: _T('Use a severed arm or leg weapon to eliminate 1 NPC or player.'),
  r: _T('Trade a severed limb weapon for any remaining market weapon'),
  test: player => player.stats.kill_limb >= 1,
  img: 3,
  reward: async player => {
    await mfLimbSwap(player);
  }
}, {
  n: 'Undying Loyalty',
  d: _T('Look each player in the eyes and declare, "Hail Flavius! I hereby declare my undying loyalty to the republic!"'),
  r: '4 CF',
  declare: _T('Hail Flavius! I hereby declare my undying loyalty to the republic!'),
  img: 4,
  reward: async player => {
    player.cf += 4;
  }
}, {
  n: 'Praise Flavius',
  d: _T('Look each player in the eyes and declare, "Praise you Flavius! May the Gods favor you in return!"'),
  r: _T("Claim Flavius' chest armor"),
  declare: _T('Praise you Flavius! May the Gods favor you in return!'),
  img: 5,
  reward: async player => {
    mfClaimArmor(player, 'flavchest');
    await gainArmorPiece(player, 'flavchest');
  }
}, {
  n: 'Borrowed Blade',
  d: _T('Convince another player to trade you a weapon and attack them with it in the same turn.'),
  r: '5 CF',
  test: player => player.stats.tradeAttack >= 1,
  img: 6,
  reward: async player => {
    player.cf += 5;
  }
}, {
  n: 'Broken Bond',
  d: _T('Eliminate a tamed NPC.'),
  r: '3 CF',
  test: player => player.stats.kill_tamed >= 1,
  img: 7,
  reward: async player => {
    player.cf += 3;
  }
}, {
  n: 'Humble Steel',
  d: _T('Eliminate a player using a level 1 weapon.'),
  r: '5 CF',
  test: player => player.stats.kill_l1 >= 1,
  img: 8,
  reward: async player => {
    player.cf += 5;
  }
}, {
  n: 'Poetic Justice',
  d: _T('Equip the severed limb of another player and attack them with it.'),
  r: _T('3 CF and a generous applause'),
  test: player => player.stats.limbRevenge >= 1,
  img: 9,
  reward: async player => {
    player.cf += 3;
  }
}, {
  n: 'Bear Puncher',
  d: _T('Go punch a bear.'),
  r: _T('3 CF and a generous applause'),
  test: player => player.stats.punchBear >= 1,
  img: 10,
  reward: async player => {
    player.cf += 3;
  }
}, {
  n: 'Underground',
  d: _T('Find the nearest tunnel and enter. Once underground, reveal this card.'),
  r: _T('All players above ground are stoned for 2 damage'),
  test: player => player.underground,
  img: 11,
  reward: async player => {
    for (const q of activePlayers()) if (q !== player && !q.underground) await hurt(q, rollLoc(q), 2, {
      type: 'env'
    }, _T('The crowd stones those above ground'));
  }
}, {
  n: 'Trophy Hunter',
  d: _T('Collect 3 player or NPC trophy tokens.'),
  r: '4 CF',
  test: player => player.trophies.length >= 3,
  img: 12,
  reward: async player => {
    player.cf += 4;
  }
}, {
  n: "Flavius' Treasure",
  d: _T('Open the arena chest.'),
  r: '2 CF',
  test: player => player.stats.chest >= 1,
  img: 13,
  reward: async player => {
    player.cf += 2;
  }
}, {
  n: 'The Truce',
  d: _T('Truce with another player.'),
  r: '2 CF',
  test: player => player.stats.truce >= 1,
  img: 14,
  reward: async player => {
    player.cf += 2;
  }
}];

/* ---- Offerings (p.20). Pots hide these; optional tokens included by default ---- */
/* OFFER fields: n name · s effect text · g map glyph · instant (resolves on reveal). STANDARD_OFFERS / OPTIONAL_OFFERS below list which keys are standard vs optional tokens. */
const OFFER = {
  elix2: {
    n: 'Health Elixir',
    s: '2 HP',
    g: '+'
  },
  elix4: {
    n: 'Health Elixir',
    s: '4 HP',
    g: '+'
  },
  ap2: {
    n: 'AP Upgrade',
    s: '2 AP',
    g: 'A'
  },
  ap3: {
    n: 'AP Upgrade',
    s: '3 AP',
    g: 'A'
  },
  ma1: {
    n: 'Market Armor',
    s: _T('Level 1'),
    g: 'R'
  },
  ma2: {
    n: 'Market Armor',
    s: _T('Level 2'),
    g: 'R'
  },
  ma3: {
    n: 'Market Armor',
    s: _T('Level 3'),
    g: 'R'
  },
  mw1: {
    n: 'Market Weapon',
    s: _T('Level 1'),
    g: 'W'
  },
  mw2: {
    n: 'Market Weapon',
    s: _T('Level 2'),
    g: 'W'
  },
  mw3: {
    n: 'Market Weapon',
    s: _T('Level 3'),
    g: 'W'
  },
  spiders: {
    n: 'Spiders',
    s: _T('1 damage to each limb'),
    g: '!',
    instant: 1
  },
  cf1: {
    n: 'Crowd Favor',
    s: '1 CF',
    g: '¢',
    instant: 1
  },
  cf2: {
    n: 'Crowd Favor',
    s: '2 CF',
    g: '¢',
    instant: 1
  },
  merc1: {
    n: 'Speed of Mercury',
    s: '+1 movement',
    g: 'M'
  },
  merc2: {
    n: 'Speed of Mercury',
    s: '+2 movement',
    g: 'M'
  },
  curse: {
    n: 'Curse Tablet',
    s: _T('d6 damage, unavoidable'),
    g: '†',
    instant: 1
  },
  eagle: {
    n: 'Golden Eagle',
    s: _T('5 CF now, or 15 CF if you win'),
    g: 'E'
  },
  key: {
    n: 'Arena Key',
    s: '1 key',
    g: 'K'
  }
};
const STANDARD_OFFERS = ['elix2', 'elix4', 'ap2', 'ap3', 'ma1', 'ma2', 'ma3', 'mw1', 'mw2', 'mw3', 'spiders'];
const OPTIONAL_OFFERS = ['cf1', 'cf2', 'merc1', 'merc2', 'curse'];

/* ---- Events (p.41-47) ---- flags: [PVE, PVP, CF, CA] ---- */
/* R — builds one round definition: name, zone (1-3, see ZONES), flags [PVE, PVP, CF, CA] (CA = class abilities allowed), end-condition code (e.g. 'alive1', 'npc4|elim1'), reward {cards, coin, cf, win, ...}. */
const R = (n, zone, f, end, reward = {}) => ({
  n,
  zone,
  pve: f[0],
  pvp: f[1],
  cf: f[2],
  ca: f[3],
  end,
  reward
});
/* EVENTS fields: img · n / short / sr / tag labels · loc LOCATIONS index · min / max players · deck (uses the arena deck) · mandata (deals Mandati) · rounds list of R(...) · kind special mode · teams / coop / draft / no* option flags · classes allowed · blurb text. Edit rounds to change zones, PvP, end conditions and rewards. */
const EVENTS = {
  democritus: {
    img: 0,
    n: 'Classic · Democritus',
    short: 'Classic Elimination',
    sr: _T('Democritus'),
    tag: 'Classic',
    loc: 6,
    min: 4,
    max: 4,
    deck: 1,
    mandata: 1,
    blurb: _T('Flavius Rule as it was originally intended. Outlast the other three gladiators.'),
    rounds: [R(_T('Bestiarii'), 1, [1, 0, 1, 1], 'npc4|elim1', {
      cards: 3,
      coin: 2,
      cf: 2
    }), R(_T('Royale'), 2, [1, 1, 1, 0], 'alive2', {
      coin: 2,
      cf: 2
    }), R(_T('Duel'), 3, [1, 1, 0, 0], 'alive1', {
      win: 15
    })]
  },
  egidious: {
    img: 1,
    n: 'Classic · Egidious',
    short: 'Classic Elimination',
    sr: _T('Egidious'),
    tag: 'Easy',
    loc: 2,
    min: 4,
    max: 4,
    deck: 1,
    mandata: 1,
    blurb: _T('Classic Flavius Rule with a slightly forgiving officiator.'),
    rounds: [R(_T('Bestiarii'), 1, [1, 0, 1, 1], 'npc4|elim1', {
      cards: 3,
      coin: 4,
      cf: 3
    }), R(_T('Royale'), 2, [1, 1, 1, 1], 'alive2', {
      coin: 4,
      cf: 3
    }), R(_T('Duel'), 3, [1, 1, 0, 0], 'alive1', {
      win: 15
    })]
  },
  cassian: {
    img: 2,
    n: 'Classic · Cassian',
    short: 'Classic Elimination',
    sr: _T('Cassian'),
    tag: 'Hard',
    loc: 4,
    min: 4,
    max: 4,
    deck: 1,
    mandata: 1,
    blurb: _T('A faintly more difficult variant: PvP from the first round and no class abilities.'),
    rounds: [R(_T('Bestiarii'), 1, [1, 1, 1, 0], 'npc4|elim1', {
      cards: 2,
      coin: 2,
      cf: 2
    }), R(_T('Royale'), 2, [1, 1, 1, 0], 'alive2', {
      applause: 1
    }), R(_T('Duel'), 3, [1, 1, 0, 0], 'alive1', {
      win: 15
    })]
  },
  gauntlet: {
    img: 5,
    n: 'Gauntlet',
    short: 'Gauntlet',
    tag: 'Solo',
    loc: 1,
    min: 1,
    max: 1,
    deck: 0,
    noVenatore: 1,
    blurb: _T('A solo challenge against every NPC. Both snakes down spawns the lions, both wolves spawns Commodus, both bears spawns Tholo. Eliminate them all.'),
    rounds: [R(_T('Royale'), 1, [1, 0, 0, 0], 'allnpc', {
      win: 15
    })]
  },
  triumviratus: {
    img: 9,
    n: 'Triumviratus',
    short: 'Triumviratus',
    tag: '3 players',
    loc: 12,
    min: 3,
    max: 3,
    deck: 1,
    mandata: 1,
    noTruce: 1,
    classes: ['slave', 'soldier', 'royalty', 'amazonia', 'damnatio'],
    blurb: _T('Three gladiators, no trucing. The moment the first gladiator is eliminated the event ends, and the highest Crowd Favor wins.'),
    rounds: [R(_T('Royale'), 1, [1, 1, 1, 1], 'elim1', {
      win: 15
    })]
  },
  orpheus: {
    img: 8,
    n: 'Orpheus',
    short: 'Orpheus',
    tag: 'Capture',
    loc: 10,
    min: 2,
    max: 4,
    deck: 1,
    noBoss: 1,
    kind: 'orpheus',
    blurb: _T('Win a Lyre from the chest, lead 2 beasts onto your starting tile to capture them, then exit. The first two to exit duel with a tamed beast.'),
    rounds: [R(_T('Capture Royale'), 1, [1, 1, 1, 0], 'exit2', {
      offering: 1
    }), R(_T('Duel Finale'), 2, [1, 1, 0, 0], 'alive1', {
      win: 15
    })]
  },
  goldenEagle: {
    img: 6,
    n: 'Golden Eagle',
    short: 'Golden Eagle',
    tag: 'Teams',
    loc: 9,
    min: 4,
    max: 8,
    deck: 1,
    teams: 1,
    kind: 'eagle',
    blurb: _T('Teams race to carry Golden Eagle tokens to capture tiles. Three captures lets a team exit through a starting tile. Everyone starts with nothing.'),
    rounds: [R(_T('Team Capture Royale'), 1, [1, 1, 0, 0], 'eagle', {
      win: 15
    })]
  },
  familia: {
    img: 4,
    n: 'Familia',
    short: 'Familia',
    tag: 'Teams',
    loc: 5,
    min: 4,
    max: 8,
    deck: 1,
    teams: 1,
    blurb: _T('Team elimination royale. No friendly fire. The last team standing wins.'),
    rounds: [R(_T('Elimination Royale'), 1, [1, 1, 0, 0], 'team1', {
      win: 15
    })]
  },
  juggernaut: {
    img: 7,
    n: 'Juggernaut',
    short: 'Juggernaut',
    tag: '1 vs team',
    loc: 11,
    min: 3,
    max: 4,
    deck: 1,
    noBoss: 1,
    teams: 'jugg',
    draft: {
      jugg: 7,
      team: 3
    },
    blurb: _T('One Juggernaut drafts 7 picks (levels 1-3) and 5 declare cards. Everyone else drafts 3 picks (levels 1-2) and fights as a team.'),
    rounds: [R(_T('Team Scenario'), 1, [1, 1, 0, 0], 'team1', {
      win: 15
    })]
  },
  ludus: {
    img: 11,
    n: 'Ludus',
    short: 'Ludus',
    tag: 'Draft',
    loc: 3,
    min: 2,
    max: 4,
    deck: 1,
    draft: {
      all: 5
    },
    noSpect: 1,
    blurb: _T('Snake-draft your gladiator. After 10 turn rotations (or when one gladiator remains) the top two by CF duel.'),
    rounds: [R(_T('Elimination Royale'), 1, [1, 1, 1, 0], 'rot10', {
      applause: 1
    }), R(_T('Duel Finale'), 2, [1, 1, 0, 0], 'alive1', {
      win: 15
    })]
  },
  chariot: {
    img: 10,
    n: 'Chariot Racing',
    short: 'Chariot Racing',
    tag: 'Race',
    loc: 7,
    min: 3,
    max: 6,
    deck: 0,
    kind: 'chariot',
    passiveSpect: 1,
    blurb: _T('Draft a chariot and race three laps counter-clockwise around the outer track. Pillar gates flip your horse and hand out offerings. PvP only after your first lap, once per lap.'),
    rounds: [R(_T('Chariot Race'), 1, [1, 1, 0, 0], 'race', {
      win: 15
    })]
  },
  naumachia: {
    img: 12,
    n: 'Naumachia',
    short: 'Naumachia',
    tag: 'Teams',
    loc: 6,
    min: 6,
    max: 8,
    deck: 0,
    teams: 1,
    kind: 'naumachia',
    draft: {
      all: 3
    },
    passiveSpect: 1,
    blurb: _T('The arena is flooded. Teams start aboard their ships; swim or ride floating doors, board enemy ships and smash their pillars (12 HP) to sink them. Last team afloat wins.'),
    rounds: [R(_T('Elimination Royale'), 1, [0, 1, 0, 0], 'team1', {
      win: 15
    })]
  },
  commodus: {
    img: 3,
    n: 'Commodus',
    short: 'Commodus',
    tag: 'Co-op',
    loc: 8,
    min: 1,
    max: 4,
    deck: 0,
    coop: 1,
    noTholo: 1,
    kind: 'commodus',
    blurb: _T('Face the lions, then Commodus himself. If any gladiator falls before Commodus, everyone loses.'),
    rounds: [R(_T('The Lions'), 1, [1, 0, 0, 0], 'lion1', {
      choose2: 1
    }), R(_T('Commodus'), 2, [1, 0, 0, 0], 'commodus', {
      win: 15
    })]
  }
};

/* ---- Arena locations (p.40). mod: [class|'all', type, value] ---- */
/* LOCATIONS fields (index 1-12, 0 unused): n city · ev home event · x, y map position (0-1) · good / bad modifier [class or 'all', type, value]. Edit good / bad to change location bonuses and penalties. */
const LOCATIONS = [null, {
  n: 'Syracusae',
  ev: 'gauntlet',
  x: 0.7089,
  y: 0.6261,
  good: ['amazonia', 'hp', 4],
  bad: ['venatore', 'noEagle']
}, {
  n: 'Verona',
  ev: 'egidious',
  x: 0.4914,
  y: 0.0925,
  good: ['all', 'cf', 3],
  bad: ['veteranus', 'noRudis']
}, {
  n: 'Arles',
  ev: 'ludus',
  x: 0.2738,
  y: 0.2015,
  good: ['veteranus', 'hp', 4],
  bad: ['amazonia', 'noCestus']
}, {
  n: 'Capua',
  ev: 'cassian',
  x: 0.7396,
  y: 0.2991,
  good: ['royalty', 'cf', 5],
  bad: ['slave', 'coin', -3]
}, {
  n: 'Thysdrus',
  ev: 'familia',
  x: 0.4862,
  y: 0.7858,
  good: ['soldier', 'ap', 4],
  bad: ['hero', 'noShield']
}, {
  n: 'Roma',
  ev: 'democritus',
  x: 0.6360,
  y: 0.2611,
  good: null,
  bad: null
}, {
  n: 'Nemausus',
  ev: 'chariot',
  x: 0.1907,
  y: 0.1711,
  good: ['venatore', 'cf', 4],
  bad: ['damnatio', 'minusArm']
}, {
  n: 'Pompeii',
  ev: 'commodus',
  x: 0.7460,
  y: 0.3346,
  good: ['hero', 'cf', 5],
  bad: ['slave', 'dmg', 3]
}, {
  n: 'Leptis Magna',
  ev: 'goldenEagle',
  x: 0.7409,
  y: 0.9759,
  good: ['slave', 'cf', 5],
  bad: ['soldier', 'dmg', 3]
}, {
  n: 'Uthina',
  ev: 'orpheus',
  x: 0.4543,
  y: 0.7199,
  good: ['venatore', 'cf', 4],
  bad: ['royalty', 'coin', -3]
}, {
  n: 'Pola',
  ev: 'juggernaut',
  x: 0.6859,
  y: 0.0520,
  good: null,
  bad: ['veteranus', 'noRudis']
}, {
  n: 'Puteoli',
  ev: 'triumviratus',
  x: 0.7191,
  y: 0.3232,
  good: ['all', 'cf', 3],
  bad: ['damnatio', 'minusLeg']
}];
/* modText — renders a location modifier like ['royalty','cf',5] as readable text, e.g. 'Royalty +5 CF'. */
function modText(m) {
  if (!m) return _T('None');
  const who = m[0] === 'all' ? _T('All') : CLASSES[m[0]].name;
  const t = {
    hp: _T`+${m[2]} HP`,
    ap: _T`+${m[2]} AP`,
    cf: _T`+${m[2]} CF`,
    coin: _T`${m[2]} coin`,
    dmg: _T`${m[2]} damage`,
    noEagle: _T('no Eagle'),
    noRudis: _T('no Rudis'),
    noCestus: _T('no Cestus'),
    noShield: _T('no Shield'),
    minusArm: '−1 arm',
    minusLeg: '−1 leg'
  }[m[1]];
  return `${who} ${t}`;
}

/* ---- Fate (p.54-55) ---- */
/* fateFor — returns [title, text] for a final CF score. On Thumb of Flavius it rolls a d6 (4+ = spared), otherwise a d12 picks the sacrifice row. TWEAK: the 4+ spare threshold and the d12. */
function fateFor(cf) {
  const f = fateRow(cf);
  if (f.n === 'Thumb of Flavius') {
    const r = d6();
    if (r >= 4) return Object.assign([_T('Thumb of Flavius · spared'), _T`Flavius rolls ${r}: spared. Fate set to 20 CF and sent to the Ludus Flavius.`], {
      d6: r
    });
    const d = 1 + rnd(12);
    const s = fateRow(d);
    return Object.assign([_T`Thumb of Flavius · ${s.n}`, `Flavius rolls ${r}; the d12 shows ${d}: ${s.t}`], {
      d6: r,
      d12: d,
      sub: s
    });
  } // .d6/.d12 let the Thumb ritual reveal the real rolls
  return [`${f.g} · ${f.n}`, f.t];
}

/* ---- Blessings table: 36 standard tokens (PLACEHOLDER mix). One pot per pillar is drawn from it. ---- */
/* BLESSING_TABLE — token key → copies in the Blessings bag. TWEAK: raise a count to make that offering more common. */
const BLESSING_TABLE = {
  elix2: 5,
  elix4: 3,
  ap2: 5,
  ap3: 3,
  ma1: 4,
  ma2: 2,
  ma3: 1,
  mw1: 4,
  mw2: 2,
  mw3: 1,
  spiders: 6
};
/* OPTIONAL_TABLE — optional tokens added to the bag when opts.optOffers is on; key → copies. TWEAK: the counts. */
const OPTIONAL_TABLE = {
  cf1: 3,
  cf2: 2,
  merc1: 3,
  merc2: 2,
  curse: 3
};
/* INSTANT_OFFERS — tokens that resolve on reveal; drawOffer skips them when spawning an offering straight into the sand or a hand. */
const INSTANT_OFFERS = ['spiders', 'curse', 'cf1', 'cf2'];
/* buildBag — builds and shuffles the Blessings bag from BLESSING_TABLE, plus OPTIONAL_TABLE when opts.optOffers is set (kind is unused). TWEAK: edit the tables, not this. */
function buildBag(opts, kind) {
  const bag = [];
  for (const [k, v] of Object.entries(BLESSING_TABLE)) for (let i = 0; i < v; i++) bag.push(k);
  if (opts.optOffers) for (const [k, v] of Object.entries(OPTIONAL_TABLE)) for (let i = 0; i < v; i++) bag.push(k);
  return shuffle(bag);
}
// Draw a token from the event's Blessings bag. Tokens spawned straight into the sand or a hand skip the instant ones (they go back in the bag).
function drawOffer(noInstant = true) {
  if (!S.bag || !S.bag.length) S.bag = buildBag(S.opts);
  const i = S.bag.findIndex(k => !noInstant || !INSTANT_OFFERS.includes(k));
  return i < 0 ? 'elix2' : S.bag.splice(i, 1)[0];
}
/* drawFromTable — expands a {key: count} table into a bag, shuffles it and returns the first n keys. */
function drawFromTable(tbl, n) {
  const bag = [];
  for (const [k, v] of Object.entries(tbl)) for (let i = 0; i < v; i++) bag.push(k);
  shuffle(bag);
  return bag.slice(0, n);
}

/* ---- Carmina Fescennina: 12 verses on 3 cards (img = card index in assets/misc.jpg) ---- */
/* carmWeapon — gives the player a level lv market weapon: a named key is pulled from the market slots (refilled from the deck) or the deck; with no key, a CPU takes the best-scoring one and a human chooses. */
async function carmWeapon(player, lv, key) {
  if (key) {
    const m = S.market.w[lv];
    let i = m.slots.indexOf(key);
    if (i >= 0) m.slots[i] = m.deck.pop() || null;else {
      i = m.deck.indexOf(key);
      if (i >= 0) m.deck.splice(i, 1);
    }
    return gainWeapon(player, key);
  }
  const pool = [...S.market.w[lv].slots.filter(Boolean), ...S.market.w[lv].deck];
  if (!pool.length) {
    log(_T('No level ') + lv + _T(' weapon remains.'));
    return;
  }
  let k;
  if (player.cpu) k = pool.sort((a, b) => wScore(W[b]) - wScore(W[a]))[0];else k = await modal(_T('Choose a weapon'), `<p>${_T`Any remaining level ${lv} weapon.`}</p>`, pool.map(x => ({
    label: W[x].n,
    sub: wStats(mkW(x)),
    value: x,
    card: 'w:' + x
  })));
  return carmWeapon(player, lv, k || pool[0]);
}
/* CARMINA fields: img card art · v verse · d reward text · apply(player) async reward. TWEAK: the coin / CF / HP / AP numbers inside apply. */
const CARMINA = [{
  img: 0,
  v: 'Mars, god of war, bless my blades! The crowd roars for blood, but help me fight for freedom, not accolades!',
  d: _T('Any 1 remaining level 1 weapon'),
  apply: async player => {
    await carmWeapon(player, 1);
  }
}, {
  img: 0,
  v: 'Minerva, goddess of the strategic arts, teach me to fight with a cunning heart!',
  d: _T("1 Minerva's Push arena card"),
  apply: async player => {
    player.items.push(mkCard('minerva'));
  }
}, {
  img: 0,
  v: 'Hercules, son of Jupiter, grant me strength like that of lore. Allow these muscles to flex with your endurance! Prepare me for war!',
  d: _T('3 HP and 3 AP'),
  apply: async player => {
    await distributeHP(player, 3, _T('the verse of Hercules'));
    if (!(await apUp(player, 3))) await distributeAP(player, 3, '3 AP');
  }
}, {
  img: 0,
  v: 'Vulcan, god of fire and forge divine, grant me protection and allow my strikes to align.',
  d: _T('2 AP and 3 AP'),
  apply: async player => {
    if (!(await apUp(player, 2))) await distributeAP(player, 2, '2 AP');
    if (!(await apUp(player, 3))) await distributeAP(player, 3, '3 AP');
  }
}, {
  img: 1,
  v: 'O Diana! Hear this plea - guide my arrows true, guide my arrows free!',
  d: _T('1 level 2 Parthian Bow'),
  apply: async player => {
    await carmWeapon(player, 2, 'bow');
  }
}, {
  img: 1,
  v: 'Praise be to Flavius, who provides us with these glorious spectacles! Let this victory be a tribute, to his giant!',
  d: _T('3 CF and 3 coin'),
  apply: async player => {
    player.cf += 3;
    player.coin += 3;
  }
}, {
  img: 1,
  v: 'The thought of Flavius as emperor... *LAUGH* - Fools! Sic semper tyrannis!',
  d: _T('1 Cestus armor'),
  apply: async player => {
    await gainArmorPiece(player, 'cestus');
  }
}, {
  img: 1,
  v: 'Venus, goddess of love and beauty, let me survive this fray with excess of booty.',
  d: '6 coin',
  apply: async player => {
    player.coin += 6;
  }
}, {
  img: 2,
  v: 'Sponsor Flavius! Favor me with your wealth and power! Let your generosity be rewarded, as I blossom like a flower!',
  d: _T('4 coin and 2 CF'),
  apply: async player => {
    player.coin += 4;
    player.cf += 2;
  }
}, {
  img: 2,
  v: 'Jupiter, Jupiter, king of gods on high, help me earn my freedom or let me die!',
  d: '5 CF',
  apply: async player => {
    player.cf += 5;
  }
}, {
  img: 2,
  v: 'Fortuna, goddess of chance and fate, shower me with your blessings before it\'s too late!',
  d: '6 coin',
  apply: async player => {
    player.coin += 6;
  }
}, {
  img: 2,
  v: 'Hygeia! Goddess of health and healing, let me escape this arena unscathed and still feeling',
  d: '5 HP',
  apply: async player => {
    await distributeHP(player, 5, _T('the verse of Hygeia'));
  }
}];

/* ---- Chariot Racing (p.50-52) ---- */
/* Chariot board: CH_PILLARS pillar tiles · CH_GATES gate tiles · CH_STARTS start tiles · CH_SPARES [type, row, col] spare horse / wheel pickups. Edit to reshape the track. */
const CH_PILLARS = [[0, 6], [2, 6], [10, 6], [12, 6], [3, 3], [3, 9], [9, 3], [9, 9]];
const CH_GATES = [[1, 6], [11, 6]];
const CH_STARTS = [[10, 10], [10, 11], [10, 12], [11, 10], [11, 12], [12, 11]];
const CH_SPARES = [['wheel', 4, 4], ['horse', 4, 8], ['wheel', 8, 4], ['horse', 8, 8]];
/* inPlayerZone — true for tiles in the central 7x7 block (rows and cols 3-9), the chariot infield that only players on foot may enter. */
const inPlayerZone = (r, c) => r >= 3 && r <= 9 && c >= 3 && c <= 9;
/* chHatched — true for infield tiles on the center row or column (the hatched cross that cannot be crossed). */
const chHatched = (r, c) => inPlayerZone(r, c) && (r === 6 || c === 6);
// The printed horse tokens: each horse has a name and two faces (speed bonus / HP), flipped at the lap line
const HORSES = [{
  n: 'Palmatus',
  sides: [{
    hp: 10,
    mv: 3,
    art: 'palmatusA'
  }, {
    hp: 12,
    mv: 2,
    art: 'palmatusB'
  }]
}, {
  n: 'Ocianus',
  sides: [{
    hp: 8,
    mv: 2,
    art: 'ocianusA'
  }, {
    hp: 10,
    mv: 2,
    art: 'ocianusB'
  }]
}, {
  n: 'Saxo',
  sides: [{
    hp: 8,
    mv: 1,
    art: 'saxoA'
  }, {
    hp: 12,
    mv: 1,
    art: 'saxoB'
  }]
}, {
  n: 'Vindex',
  sides: [{
    hp: 8,
    mv: 3,
    art: 'vindexA'
  }, {
    hp: 12,
    mv: 3,
    art: 'vindexB'
  }]
}];
/* WHEELS — chariot wheel tokens: n name · hp durability · art image key. TWEAK: hp. */
const WHEELS = [{
  n: 'Wagon Wheel',
  hp: 8,
  art: 'wheel8'
}, {
  n: 'Laurel Wheel',
  hp: 10,
  art: 'wheel10'
}, {
  n: 'Gilded Wheel',
  hp: 12,
  art: 'wheel12'
}];
// The printed chariot cards, matched to the driver's color
const CHARIOT_NAMES = [['#c0433a', _T('Invicta Gloria'), 'chRed'], ['#4f7fc4', _T('Azureus Magnus'), 'chBlue'], ['#4f9a57', _T('Bellum Quadriga'), 'chTeal'], ['#d4b13c', _T('Aureus Triumphus'), 'chGold'], ['#dc7a34', _T('Aureus Triumphus'), 'chGold'], ['#cfc6b4', _T('Bellator Aequus'), 'chSilver'], ['#6f655b', _T('Bellator Aequus'), 'chSilver'], ['#8a5cc0', _T('Fulgens Velox'), 'chPurple']];
/* chariotFor — picks the CHARIOT_NAMES entry whose color is closest (RGB distance) to the driver's color. */
function chariotFor(color) {
  /* hx — parses '#rrggbb' into [r, g, b]. */
  const hx = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const c = hx(color || '#c0433a');
  return CHARIOT_NAMES.map(([h, n, art]) => {
    const d = hx(h);
    return {
      n,
      art,
      dist: (c[0] - d[0]) ** 2 + (c[1] - d[1]) ** 2 + (c[2] - d[2]) ** 2
    };
  }).sort((a, b) => a.dist - b.dist)[0];
}
/* CH_OFFERS — offering bag used at chariot gates: token key → copies. TWEAK: the counts. */
const CH_OFFERS = {
  merc1: 4,
  merc2: 3,
  cf1: 4,
  cf2: 2,
  curse: 4
};

/* ---- Naumachia (p.48-49) ---- */
/* shipTiles — every tile in the rectangle r0..r1 x c0..c1 except its four corners (a ship's deck). */
function shipTiles(r0, r1, c0, c1) {
  const t = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const corner = (r === r0 || r === r1) && (c === c0 || c === c1);
    if (!corner) t.push([r, c]);
  }
  return t;
}
/* SHIPS_DEF — the four naumachia ships: name · tiles deck · pillar tile that sinks the ship when smashed. Edit the shipTiles bounds to reshape ships. */
const SHIPS_DEF = [{
  name: 'Ship of Neptune',
  tiles: shipTiles(0, 4, 1, 4),
  pillar: [2, 2]
}, {
  name: 'Ship of Mars',
  tiles: shipTiles(1, 5, 9, 12),
  pillar: [3, 10]
}, {
  name: 'Ship of Minerva',
  tiles: shipTiles(7, 11, 1, 4),
  pillar: [9, 2]
}, {
  name: 'Ship of Jupiter',
  tiles: shipTiles(8, 11, 7, 11),
  pillar: [9, 9]
}];
/* DOORS — floating door tiles in naumachia. */
const DOORS = [[5, 5], [5, 7], [7, 5], [7, 7]];

/* ---- Missios (p.56-58) ---- */
/* MISSIOS fields, per class: goal text · req unlock requirement (rr coin deposited, trophies) · path of events {ev event key, loc location, t text, win (must win), plus solo / fest / pair / jugg conditions}. */
const MISSIOS = {
  soldier: {
    goal: _T('Find honor and rest for a weary warrior.'),
    path: [{
      ev: 'familia',
      loc: 5,
      t: _T('A life of service, only to leave dishonored. The right partner could help your reclamation.')
    }, {
      ev: 'naumachia',
      loc: 6,
      t: _T('Survive in what may prove to be your most difficult skirmish yet.')
    }, {
      ev: 'democritus',
      loc: 6,
      t: _T('Roma Classica, in all her glory. May they echo your feats across the great republic.')
    }, {
      ev: 'goldenEagle',
      loc: 9,
      t: _T('Pass down your Ferrata techniques. Reclaim the merit and crest of your legion.')
    }, {
      ev: 'ludus',
      loc: 3,
      t: _T('The ludus can make even the greatest soldiers weep. Win and retire with honor.'),
      win: 1
    }]
  },
  royalty: {
    goal: _T('Regain the respect and wealth of your family.'),
    req: {
      rr: 60
    },
    path: [{
      ev: 'egidious',
      loc: 2,
      t: _T("Erasing the shame you've brought upon your name begins in this Egidious officiated classic event.")
    }, {
      ev: 'triumviratus',
      loc: 12,
      t: _T('Less competition, more focus on you. Hopefully this Triumviratus poses enough of a challenge.')
    }, {
      ev: 'democritus',
      loc: 6,
      t: _T('The infami of Roma should bring you back to terra firma.')
    }, {
      ev: 'commodus',
      loc: 8,
      t: _T('Defeat your royal rival, Commodus.'),
      solo: 1
    }, {
      ev: 'cassian',
      loc: 4,
      t: _T('Return home and win a Cassian officiated festival Saturnalia.'),
      fest: 'saturnalia',
      win: 1
    }]
  },
  hero: {
    goal: _T('A myth etched in stone, infamis legendario.'),
    req: {
      trophies: 15
    },
    path: [{
      ev: 'democritus',
      loc: 6,
      t: _T('Remind Roma why they call you the Hero.')
    }, {
      ev: 'cassian',
      loc: 4,
      t: _T('Wow the people before a Cassian officiated classic event.')
    }, {
      ev: 'gauntlet',
      loc: 1,
      t: _T('They will tell stories of how you handily vanquished beast after beast.'),
      noCommodus: 1
    }, {
      ev: 'commodus',
      loc: 8,
      t: _T('The great Hero is brought before Commodus. Dethrone him.'),
      solo: 1
    }, {
      ev: 'juggernaut',
      loc: 11,
      t: _T('Win against all odds, give the people a legend.'),
      jugg: 1,
      win: 1
    }]
  },
  slave: {
    goal: _T('Left to die far from home, claw back and destroy the person that put you on this missio.'),
    path: [{
      ev: 'goldenEagle',
      loc: 9,
      t: _T('Get your start with the Golden Eagle event.')
    }, {
      ev: 'familia',
      loc: 5,
      t: _T('Teamwork, though a strong partner could carry you safely away from these northern coasts.')
    }, {
      ev: 'chariot',
      loc: 7,
      t: _T('Cross the sea and risk it all in a death-defying survival chariot race.'),
      pvp: 1
    }, {
      ev: 'democritus',
      loc: 6,
      t: _T('Reveal yourself to the people, become their champion. Discard your 2 AP helm to start.'),
      noHelm: 1
    }, {
      ev: 'commodus',
      loc: 8,
      t: _T('Summoned to Pompeii, you must win against your greatest foe: Commodus.'),
      win: 1
    }]
  },
  veteranus: {
    goal: _T("Dust off the gladius for this veteran's final missio."),
    path: [{
      ev: 'triumviratus',
      loc: 12,
      t: _T("A showcase of the most 'exotic' fighters Flavius has to offer."),
      vs: ['venatore', 'amazonia']
    }, {
      ev: 'ludus',
      loc: 3,
      t: _T('Regain your strength while training with your brothers.')
    }, {
      ev: 'familia',
      loc: 5,
      t: _T('A true testament of will: how will you let this dead weight affect your missio?'),
      pair: 'damnatio'
    }, {
      ev: 'goldenEagle',
      loc: 9,
      t: _T('Liven up with an event all the kids are playing.')
    }, {
      ev: 'democritus',
      loc: 6,
      t: _T('Find yourself in the magnitude of all that is Roma during the festival Ludi Apollinare.'),
      fest: 'ludi'
    }]
  },
  amazonia: {
    goal: _T('Even the most exotic roads can lead to Roma.'),
    path: [{
      ev: 'triumviratus',
      loc: 12,
      t: _T("A showcase of the most 'exotic' fighters Flavius has to offer."),
      vs: ['venatore', 'veteranus']
    }, {
      ev: 'orpheus',
      loc: 10,
      t: _T("You dare win on terra Roma?! Pray you're eaten swiftly in this Orpheus event!")
    }, {
      ev: 'familia',
      loc: 5,
      t: _T('Will you need to rely on familia to survive, or can you win solo?')
    }, {
      ev: 'cassian',
      loc: 4,
      t: _T('A true test of worth. No mistakes can be made here, Amazonia.')
    }, {
      ev: 'democritus',
      loc: 6,
      t: _T('The city awaits you, Gladiatrix.')
    }]
  },
  venatore: {
    goal: _T('Build wealth and display your skills to the world.'),
    req: {
      rr: 60
    },
    path: [{
      ev: 'triumviratus',
      loc: 12,
      t: _T("A showcase of the most 'exotic' fighters Flavius has to offer."),
      vs: ['veteranus', 'amazonia']
    }, {
      ev: 'familia',
      loc: 5,
      t: _T('How will you fare against a larger familia? You play on a solo team.'),
      soloTeam: 1
    }, {
      ev: 'goldenEagle',
      loc: 9,
      t: _T('I will hold your pet while you play. Bonam fortunam! Zora is removed.'),
      noZora: 1
    }, {
      ev: 'cassian',
      loc: 4,
      t: _T('Summoned by the wealthiest of spectators, put on a show worth the coin.')
    }, {
      ev: 'democritus',
      loc: 6,
      t: _T('The people of Roma wish to see your fantastical skills. Win and soar!'),
      win: 1
    }]
  },
  damnatio: {
    goal: _T("Literally who? You shouldn't even have a missio."),
    path: [{
      ev: 'chariot',
      loc: 7,
      t: _T("There won't be an easy way out of this race, Damnatio!"),
      pvp: 1
    }, {
      ev: 'naumachia',
      loc: 6,
      t: _T("Now you will be offered to the legions in an 'honorable' re-enactment of our great naval victories!")
    }, {
      ev: 'familia',
      loc: 5,
      t: _T('You dare to continue living?! I hope this old coot ruins you!'),
      pair: 'veteranus'
    }, {
      ev: 'juggernaut',
      loc: 11,
      t: _T("You can't possibly defeat a triumvir of this merit... You play solo."),
      jugg: 1
    }, {
      ev: 'democritus',
      loc: 6,
      t: _T('Fine! Back to Roma it is! Win that precious freedom and begone with your wretched soul!'),
      win: 1
    }]
  }
};
/* Hall of Flavius (p.58): location order 1-12 */
const HALL_ORDER = [3, 7, 10, 5, 9, 1, 12, 8, 4, 11, 2, 6]; // Arles, Nemausus, Uthina, Thysdrus, Leptis Magna, Syracusae, Puteoli, Pompeii, Capua, Pola, Verona, Roma
/* HALL_GOALS — Hall of Flavius achievement texts. */
const HALL_GOALS = [_T('Win all events in order with 1x gladiator'), _T('Win all events with 1x gladiator'), _T('Win all events with any gladiator(s)'), _T('Deposit 100 coin in RR; max 5 events'), _T('Record 20 trophies; max 5 events'), _T('Eliminate every class at least once'), _T('Win Classic Flavius Rule')];

/* ---- Fate table (p.54-55) ---- */
/* FATES fields: lo..hi CF range · g group · n name · t text (img is added below). Ranges must cover 0 upward with no gaps. TWEAK: lo / hi to move thresholds such as survival (20) or freedom (50). */
const FATES = [{
  lo: 0,
  hi: 5,
  g: _T('Damnatio'),
  n: 'Ad Memoriae',
  t: _T('A fate consigned to condemned memory. The relentless onslaught of blunted stones batters your body, as you succumb to an eternity of empty darkness, fading from all remembrance.')
}, {
  lo: 6,
  hi: 7,
  g: _T('Damnatio'),
  n: 'Ad Bestias',
  t: _T("Today, you fulfilled a grim purpose: satisfying Flavius' insatiable beasts. As the ravenous creatures rend your body asunder, you curse Hygieia and ponder... if only I was elixired?!")
}, {
  lo: 8,
  hi: 9,
  g: _T('Damnatio'),
  n: 'Ad Flamma',
  t: _T('Your body shall illuminate the walls of our majestic arenas. Bound atop a wooden pole, flames lick hungrily at your feet before the enthralled, fiery-eyed spectators.')
}, {
  lo: 10,
  hi: 10,
  g: _T('Damnatio'),
  n: 'Ad Tholo',
  t: _T("The resounding chants of 'Tholo' reverberate through the arena. Its unsettling giggle fills the air as it smashes your skull in with blunted clubs, reveling in your petty demise.")
}, {
  lo: 11,
  hi: 11,
  g: _T('Fatal Charades'),
  n: 'Prometheus',
  t: _T("Amidst the obscuring rays of the sun, a Bestiarii materializes at Flavius' side. His loyal eagle claws at your liver, wrenching forth crimson strands that weave a macabre tapestry from within your very being.")
}, {
  lo: 12,
  hi: 12,
  g: _T('Fatal Charades'),
  n: 'Tunic of Nessus',
  t: _T('Acidic, doused robes constrict your body, searing flesh with a deliberate and methodical intensity. Your sizzling sacrifice serves as a morbid source of delight for the ravenous spectators.')
}, {
  lo: 13,
  hi: 13,
  g: _T('Fatal Charades'),
  n: "Pasiphae's Curse",
  t: _T('With a grunt and hoofs scuffing against the sand, the robust bull directs his menacing horns towards your laughable attire, and the crowd erupts in raucous laughter.')
}, {
  lo: 14,
  hi: 14,
  g: _T('Fatal Charades'),
  n: 'Wings of Icarus',
  t: _T('Cast down from the highest perch, your body crashes upon the unforgiving sandstone floor, a grotesque spectacle of entangled feathers and melted wax.')
}, {
  lo: 15,
  hi: 16,
  g: _T('Fatal Charades'),
  n: 'Charun',
  t: _T('With one eye barely clinging to your ravaged face, you realize the thunderous crowd is cheering your name. Your departure from this mortal plane is met with resounding approval.')
}, {
  lo: 17,
  hi: 19,
  g: _T('Judgement'),
  n: 'Thumb of Flavius',
  t: _T('Flavius rolls 1 d6. On 4 or greater you are spared: Fate set to 20 CF and sent to the Ludus Flavius. Otherwise, a d12 decides how you are sacrificed.')
}, {
  lo: 20,
  hi: 49,
  g: _T('Survival'),
  n: 'Ludus Flavius',
  t: _T("A skilled fighter is a rare gem to behold. You haven't amassed enough to secure your freedom, but you may return in your missio with half the Crowd Favor earned today. Severed limbs persist.")
}, {
  lo: 50,
  hi: 9999,
  g: _T('Freedom'),
  n: 'Rudis',
  t: _T('Gratulationes! You have garnered enough favor to secure your freedom. Embrace a life of freedom in exchange for 50 CF, or return to carve a legendary path with half your Crowd Favor.')
}];
FATES.forEach((f, i) => f.img = i);
/* fateRow — the FATES row whose lo..hi range contains cf (the first row if none does). */
const fateRow = cf => FATES.find(f => cf >= f.lo && cf <= f.hi) || FATES[0];
