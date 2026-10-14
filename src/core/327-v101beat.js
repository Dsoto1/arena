/* =====================================================================
   327-V101BEAT · LOG AS EVENTS + THE PRESENTATION PORT (v1.01 wave 2, Phases B and C of tools/plans/layers100/PLAN.md)
   =====================================================================
   PHASE B — THE LOG ANNOUNCES. log(html, cls) (03-engine) emits BUS 'log' {html, cls} and nothing else; the DOM writer logDom
     (03-engine, subscribed at load, so FIRST) prepends the <li>, keeps 400, pushes S.logLines {turn, cls, text} and calls caption()
     for CPU turns / 'big' lines. caption(html) emits BUS 'caption' {html}; captionDom (03-engine, first) writes #caption. The log
     WRAPPERS (54, 56, 60, 93, 113, 134, 139, 204, 218, 220, 233, 321) still wrap log() and run in the same order: those that change
     the html run before the base (so the BUS carries the final line), those that read #log / S.logLines run after it and find the
     line already written (emit is synchronous). 218 no longer emits (it did after the base; 312/314 listen and read only S).
     HEADLESS: log/caption return before the BUS (as before: no DOM, no S.logLines) — sims stay as fast.
   PHASE C — THE PRESENTATION PORT. The rules never wait or paint by themselves:
     beat(kind, ms)  every pause in the core (25: 03-engine revealOffering, 04-rules npcWalk/resolveDrawn, 05-flow beginTurn/movePlayer,
                     06-ai's CPU pacing) — kind = the rule function's name. The default port IS today's sleep(ms) (02-data: SPEEDMUL,
                     pause polling, Step's stepGate/stepWait, snap's yield, 235's Fast SLEEP_HOOK, 230's speed re-read); HEADLESS
                     resolves at once (sleep's own Promise.resolve — the very same promise, so a sim's microtask order is unchanged).
                     beatUse(fn) installs another port (a server / a test): fn(kind, ms) → a promise, or null to fall through.
                     BEAT101.n / .count[kind] count the beats; BUS 'beat' {kind, ms} is announced only while someone listens.
     paint(k)        every render()/draw() the core made (36: 04-rules 8, 05-flow 14, 06-ai 14) — k 'render' | 'draw'. It announces
                     BUS 'state' {k}; the UI subscriber below (installed first) calls today's render()/draw() at once, so the same
                     frames reach the screen (230/235/260 keep their own coalescing inside render/draw). HEADLESS calls render()/draw()
                     directly (their wrappers, e.g. 319's sweep, still run in sims; no payload is built).
     awaiting()      what the engine waits for: {k:'ask', kind, seat, ds} while a match decision is on screen (326's ASK.pend: a non-local
                     ask() whose window has not answered), else {k:'command', seat} when the game idles for a turn action (phase
                     choice/action/command, not busy, no endTurn()/settle() running, not over), else null.
                     ENG101 counts the endTurn()/settle() spans per arena S (the counters 254-v98fastonl kept as F98 until v1.01):
                     during them phase is still 'action' and S.busy false, yet the engine is NOT awaiting a command. 254 now reads
                     engRunning101(); 113's onlmReady (via 254) refuses board inputs while it is true (tonl98f).
   Dice, the log and S are unchanged (replay goldens: treplay101). No save change, no protocol bump. Test tv101r.
   ===================================================================== */
var BEAT101={n:0,count:Object.create(null),port:null};
/* beat — one presentation pause of the rules; returns a promise (the port's, else sleep's) */
function beat(kind,ms){BEAT101.n++;BEAT101.count[kind]=(BEAT101.count[kind]|0)+1;
  if(!HEADLESS&&BUS.has('beat'))BUS.emit('beat',{kind,ms});
  if(BEAT101.port){const p=BEAT101.port(kind,ms);if(p)return p}
  return sleep(ms)}
/* beatUse — another presentation port (fn(kind, ms) → promise | null); returns off() */
function beatUse(fn){BEAT101.port=fn;return ()=>{if(BEAT101.port===fn)BEAT101.port=null}}
/* paint — the rules say "the state changed, show it" */
function paint(k){if(HEADLESS)return k==='draw'?draw():render();BUS.emit('state',{k})}
/* the UI: the first 'state' subscriber repaints exactly as the rules used to */
function paintUI101(d){if(d&&d.k==='draw')draw();else render()}
BUS.on('state',paintUI101);

/* ---------------- what the engine waits for ---------------- */
var ENG101={G:null,run:0};
function engRunning101(){return !!(S&&ENG101.G===S&&ENG101.run>0)}
function eng101Wrap(fn){return async function(){const G=S;if(ENG101.G!==G){ENG101.G=G;ENG101.run=0}ENG101.run++;
  try{return await fn.apply(this,arguments)}finally{if(ENG101.G===G)ENG101.run=Math.max(0,ENG101.run-1);
    try{if(typeof onlmOn==='function'&&onlmOn())setTimeout(onlmPump,30)}catch(e){}}}}
endTurn=eng101Wrap(endTurn);
settle=eng101Wrap(settle);
function awaiting(){if(!S||S.over)return null;
  if(ASK.pend&&ASK.pend.size){let q=null;for(const x of ASK.pend)q=x;return {k:'ask',kind:q.kind,seat:q.seat,ds:q.ds}}
  if(engRunning101()||S.busy)return null;
  if(['choice','action','command'].includes(S.phase))return {k:'command',seat:typeof cur==='function'&&cur()?askSeat(cur()):-1};
  return null}
