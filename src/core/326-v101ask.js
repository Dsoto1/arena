/* =====================================================================
   326-V101ASK · THE QUESTION PORT + THE COMMAND REGISTRY (v1.01 wave 2, Phase A of tools/plans/layers100/PLAN.md)
   =====================================================================
   ONE QUESTION PORT. A rule that needs a human's choice calls
       ask(seat, kind, spec) → Promise<value>        (askW(seat, kind, title, body, buttons, opt) = the window form;
                                                      askX(seat, kind, extra, title, body, buttons, opt) = with extra data)
     seat  the player (or a ticket holder in the stands) the question is FOR — a player object, a seat index, or null;
     kind  a stable key that never depends on the language ('defend', 'focusLoc', 'limbRegrow', 'truceOffer', 'roundReward', …);
     spec  {title, body, buttons, opt} exactly as modal() took them + the options as data (values) + extras (from, q, …);
           local:1 = a window the player opened outside the shared stream (a confirm behind a button, off-turn gear): not a
           decision of the match — not counted, and online it keeps the old "opened from a bar" path.
   PROVIDERS. The UI provider is today's modal() call with the SAME title/body/buttons/opt (same pixels, every modal wrapper still
     runs); in HEADLESS, modal() answers with askAuto (07-ui's rule: the close value, else the first enabled button). askUse(kind|'*', fn)
     installs another provider (tests now; a replayer / the server later): fn(Q) returns a value, or undefined to fall through to the UI.
     CPU branches stay where they are (`p.cpu ? … : await ask(…)`).
   WHILE A WINDOW OPENS the asking question is askNow() = Q {n, kind, seat, who, ds, local, spec} — set only during the synchronous
     modal() call, so wrappers read it at their entry (113, 290, 309, 163, 236). askKind() = its kind or ''.
   THE DECISION NUMBER. Every non-local ask counts S.ask101 (in S, so in every snapshot); Q.ds = that number. Online (113/290) a window
     answer travels as {k:'modal', v, kd: kind, ds, pre} and BOTH the sender's pre-hash and the waiting client's window hash are
     onlHash()+'|'+kind+'#'+ds (onlmQHash) — a client whose next decision is a different question (or the same question at another
     point) fails the hash check and takes the majority's arena (119/121), never a wrong value. The old title slice is gone.
   THE COMMAND REGISTRY. command(seat, {k:'act', a, id, i | d}) dispatches a turn action through CMD101.reg (07-ui's act handler is
     uiAct(k, dataset) — the click listener calls it, every 07-ui act is registered here); an act nobody registered falls back to the
     old hidden twin button click (cmdTwin). command(seat, {k:'tile', r, c, mode, focus}) = the tile replay (S.mode + Focus + onTile).
     Used by the lockstep (113 onlmApply, drops, abandons, 290's timeout finish) and the replay player (309 rp100Do).
     Kill switch localStorage flavius_cmd101off=1 → every act through the twin button again.
   WHY 121's "void after 2.5 s" STAYS LOCAL (Phase A decision): the skip is a pure function of the state at the head of the stream —
     onl80fImpossible() reads only S (phase, busy, cur(), the open decision's seat) at a settled point, and the 2.5 s is a settle wait, not
     part of the decision. Every client in the same state (the hash) reaches the same verdict for the same seq; a client in another state
     fails the hash check first and resyncs. A server-ordered void could not be decided by the server (it does not run the rules) and would
     have to name an input that is already blocking the head, so it would add a round trip without adding information. A replayer
     applies the same rule (skip the head when it cannot apply at a settled point); Phase C's `awaiting` replaces the settle wait.
   Counts (ASK.count, CMD101.used/twin) are for tests (tv101q). No save change; protocol 9 (the "v1.01 QUESTION PORT" section of 111).
   ===================================================================== */
var ASK={n:0,now:null,prov:Object.create(null),count:Object.create(null),log:[],LOG_MAX:200,pend:new Set()};
/* askSeat — a seat index: a fighter's place in S.players, a ticket holder's online index, else -1 */
function askSeat(x){if(x==null)return -1;if(typeof x==='number')return x;try{if(S&&S.players){const i=S.players.indexOf(x);if(i>=0)return i}}catch(e){}return x&&x.onlIdx!=null?x.onlIdx:-1}
/* askAuto — the headless answer (07-ui modal's HEADLESS rule): the close value, else the first enabled button (grid included) */
function askAuto(buttons,opt){opt=opt||{};const b=[...(buttons||[]),...(opt.grid||[])].find(x=>x&&!x.disabled);return opt.close!==undefined?opt.close:b?b.value:null}
function askNow(){return ASK.now}
function askKind(){return ASK.now?ASK.now.kind:''}
/* askUse — a provider for one kind ('*' = every kind); returns off() */
function askUse(kind,fn){ASK.prov[kind]=fn;return ()=>{if(ASK.prov[kind]===fn)delete ASK.prov[kind]}}
function ask(seat,kind,spec){spec=spec||{};kind=String(kind||'?');
  const Q={n:++ASK.n,kind,seat:askSeat(seat),who:seat,ds:0,local:!!spec.local,spec};
  if(!Q.local){try{if(S)Q.ds=S.ask101=(S.ask101|0)+1}catch(e){}}
  ASK.count[kind]=(ASK.count[kind]|0)+1;ASK.log.push({n:Q.n,kind,seat:Q.seat,ds:Q.ds,local:Q.local});if(ASK.log.length>ASK.LOG_MAX)ASK.log.shift();
  try{if(typeof BUS!=='undefined'&&BUS.has&&BUS.has('ask'))BUS.emit('ask',{kind,seat:Q.seat,ds:Q.ds,local:Q.local})}catch(e){}
  const pv=ASK.prov[kind]||ASK.prov['*'];if(pv){let v;try{v=pv(Q)}catch(e){console.error(e)}if(v!==undefined)return Promise.resolve(v)}
  const prev=ASK.now;ASK.now=Q;let pr;
  try{pr='opt' in spec?modal(spec.title,spec.body,spec.buttons||[],spec.opt):modal(spec.title,spec.body,spec.buttons||[])}finally{ASK.now=prev}
  /* v1.01 Phase C (327 awaiting): a match decision on screen is PENDING until its window answers. Never in HEADLESS (the answer is
     already there, and no extra promise reaction may enter a sim's microtask order). */
  if(!HEADLESS&&!Q.local&&pr&&typeof pr.then==='function'){ASK.pend.add(Q);const clr=()=>{ASK.pend.delete(Q)};pr.then(clr,clr)}
  return pr}
/* askW — the window form: today's modal(title, body, buttons, opt) arguments behind a seat and a kind.
   askX — the same with extra data first (from: who offers, q: the other gladiator, local: 1 …) for wrappers and providers */
function askX(seat,kind,extra,title,body,buttons,opt){const spec={...(extra||{}),title,body,buttons:buttons||[],values:(buttons||[]).map(b=>b&&b.value)};
  if(arguments.length>6)spec.opt=opt;return ask(seat,kind,spec)}
function askW(seat,kind,title,body,buttons,opt){return arguments.length>5?askX(seat,kind,null,title,body,buttons,opt):askX(seat,kind,null,title,body,buttons)}

/* ---------------- the command registry ---------------- */
var CMD101={reg:Object.create(null),used:0,twin:0,n:0,last:'',off:(()=>{try{return localStorage.getItem('flavius_cmd101off')==='1'}catch(e){return false}})()};
function cmdReg(a,fn){CMD101.reg[a]=fn}
function cmdFor(a){a=String(a||'');return CMD101.reg[a]||(a.startsWith('m-')?CMD101.reg['m-*']:null)||null}
/* the old path: a hidden button with the act's data-* clicked once (every document listener runs, as for a real click) */
function cmdTwin(d){CMD101.twin++;const b=document.createElement('button');b.type='button';for(const [k,v] of Object.entries(d||{}))if(v!=null)b.dataset[k]=v;b.style.display='none';document.body.appendChild(b);try{b.click()}finally{b.remove()}}
function command(seat,c){if(!c)return;CMD101.n++;
  if(c.k==='tile'){const p=cur();if(p&&'focus' in c)p.focusRoll=!!c.focus;if('mode' in c)S.mode=c.mode;try{if(typeof computeHL==='function')computeHL()}catch(e){}return onTile(c.r,c.c)}
  if(c.k!=='act')return;
  const d=c.d?{...c.d}:{act:c.a};if(c.d==null){if(c.id!=null)d.id=String(c.id);if(c.i!=null)d.i=String(c.i)}
  const h=CMD101.off?null:cmdFor(d.act);if(!h)return cmdTwin(d);CMD101.used++;CMD101.last=d.act;return h(d,seat)}
/* every act 07-ui's dispatcher knows (uiAct) — the click and the registry run the same code */
const UI_ACTS101=['inspect','cmddone','zpick','zdrop','vetpref','coin','card','focus','end','market','crowd','chest','chestup','chestdown','loot','trade','spear','selfbet','zora','dismount','mount','leavedoor','exit','item'];
if(typeof uiAct==='function'){for(const k of UI_ACTS101)cmdReg(k,d=>uiAct(k,d));cmdReg('m-*',d=>uiAct(d.act,d))}
