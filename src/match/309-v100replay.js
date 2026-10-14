/* =====================================================================
   309-V100REPLAY · REPLAYS (v1.0 — backlog "v1.0 EXTRAS" item 3 + "Replays (c)")
   =====================================================================
   Every player keeps their LAST 10 matches in this browser (Play Now, Manager bouts, hot seat, tournaments, festivals, online),
   ★ keeps one for good; the SERVER keeps recent RANKED matches 30 days (replay.put / replay.get, the "v1.0 REPLAYS" block of
   server/src/routes.js + the "v1.0 REPLAYS" section of 111-onlcore) — the same record a future Ranked check can replay.
   A REPLAY = the opening snapshot (matchSnapshot at the first beginTurn — dice stream, uid, every token: the same thing 113's
   lockstep hands a joiner) + the ORDERED LIST OF HUMAN DECISIONS + the end hash (113's onlHash at gameOver). CPU turns, beasts,
   the crowd and every die re-derive from the seeded stream, so a replay is small (gzip + base64 in localStorage, ~10–40 KB).
   RECORDING (offline; observe only — S, the dice and onlHash are never touched):
     tile  onTile(r,c) with S.mode + the Focus toggle (wrapper, like 113's)          · act   a [data-act] click (its data-* copied;
     m-… modes, inspect, trophies are local)                                           · modal the value every live decision window
     resolved with + its title (40 chars) + the hash when it opened; windows that look opened by the player from a bar (a trusted click
     outside the board / actions, or within 300 ms of one) carry u:1 — playback skips them when nothing asks · seat 🤖/🎮 Hand to CPU ·
     sim ⏭ To the end · gear 162's off-turn ⇄ swap / take · tu the sand-glass running out (timeUp).
     A seat / gear / vetpref made while something resolves is timing-bound: it is filed with its POSITION (turn + the dice stream's state
     RNG.s) and replayed right after the roll that reached that state ("best effort" — see below). A match loaded from a save slot starts
     a recording from that save. Never recorded: HEADLESS sims, lessons, the Event Designer's test play, replays themselves.
   ONLINE: the lockstep stream IS the replay. At gameOver a fighter fetches match.get (the host's opening + every input in server order,
     account ids blanked) into the local list; a Ranked fighter also sends replay.put {id, h, v} — the server builds the replay from ITS
     OWN stored opening + inputs (a client cannot forge it), once a match, after it is settled.
   PLAYBACK (rp100Play): matchLoad of the opening (online: onlmLoad + onlmWatchOn — the late watcher's path, S.onl.rp100) → beginTurn;
     the recorded decisions are applied at the same settled points 113 uses (twin buttons, onTile, decision windows answered with their
     values — never opened). Controls #rp100bar: ⏸/▶, ×1 ×2 ×4, ⏭ next turn, jump to a round, 🔇, ✕ Exit. No records while it plays:
     the record functions (224's list), Store writes, autosaves and the calendar are muted; rule pop-ups pass by themselves; the
     viewer's board clicks / hotkeys are ignored. The end compares onlHash with the recorded one: ✓ the same ending, or ⚠ it drifted
     (an older version — the bar says "made with vX — may not replay exactly" — a creation edited/deleted since, a best-effort seat
     hand-off). The online summary's 🔗 #replay=<id> opens it (local first, else the server for Ranked).
   Kill switch localStorage flavius_replay100off=1 (no recording, the old "coming soon"). Test tools/tests/tv100rp.js.
   ===================================================================== */
const RP100_OFF=(()=>{try{return localStorage.getItem('flavius_replay100off')==='1'}catch(e){return false}})();
/* TWEAK: KEEP = unpinned replays kept, PIN_MAX = ★ kept, MAX_IN = inputs before a recording gives up, GAP/MGAP = ms a decision shows at ×1 */
const RP100={KEEP:10,PIN_MAX:30,MAX_IN:20000,GAP:650,MGAP:900,IDX:'flavius_rp100i',PRE:'flavius_rp100.',FV:1};
const RPR={rec:null,seen:new WeakSet(),byS:new WeakMap(),uiAt:0,saving:{}};
const RPP={on:false,S:null,R:null,i:0,ins:[],pend:[],applying:0,paused:false,speed:1,div:null,end:null,ctx:null,readyAt:0,pt:0,step:false,jump:null,onl:false,uiAt:0,cap:'',exiting:false,loading:false};
if(typeof SPEEDMUL!=='undefined')SPEEDMUL.rp100x2=.5;

/* ---------------- storage: an index + one gzip payload per replay ---------------- */
function rp100Idx(){try{const a=JSON.parse(localStorage.getItem(RP100.IDX)||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
function rp100IdxPut(a){try{localStorage.setItem(RP100.IDX,JSON.stringify(a));return true}catch(e){return false}}
async function rp100Zip(str){try{if(typeof CompressionStream!=='function')return 'j:'+str;const buf=await new Response(new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
  const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return 'z:'+btoa(s)}catch(e){return 'j:'+str}}
async function rp100Unzip(t){if(!t)return null;if(t.startsWith('j:'))return t.slice(2);const b=atob(t.slice(2));const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  return await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
/* keep the newest KEEP unpinned + every ★ (the oldest pins beyond PIN_MAX lose their pin); drops the payloads that fell off */
function rp100Prune(a){const pins=a.filter(x=>x.pin).sort((x,y)=>y.at-x.at);for(const x of pins.slice(RP100.PIN_MAX))x.pin=false;
  const un=a.filter(x=>!x.pin).sort((x,y)=>y.at-x.at);const drop=new Set(un.slice(RP100.KEEP).map(x=>x.id));
  for(const id of drop)try{localStorage.removeItem(RP100.PRE+id)}catch(e){}return a.filter(x=>!drop.has(x.id)).sort((x,y)=>y.at-x.at)}
/* saves a replay (newest first); a full browser drops the oldest unpinned ones until it fits */
async function rp100Save(R){const txt=await rp100Zip(JSON.stringify(R));let a=rp100Idx().filter(x=>x.id!==R.id);
  const row={id:R.id,at:R.at,v:R.v,kind:R.kind,mode:R.mode,title:R.title,sub:R.sub,pin:false,kb:Math.max(1,Math.round(txt.length/1024)),n:(R.ins||R.inputs||[]).length,ranked:!!R.ranked};
  a.unshift(row);a=rp100Prune(a);for(let k=0;k<12;k++){try{localStorage.setItem(RP100.PRE+R.id,txt);break}catch(e){const old=a.filter(x=>!x.pin&&x.id!==R.id).pop();if(!old)return false;a=a.filter(x=>x!==old);try{localStorage.removeItem(RP100.PRE+old.id)}catch(x){}}}
  rp100IdxPut(a);return row}
async function rp100Local(id){const row=rp100Idx().find(x=>x.id===id);if(!row)return null;try{const t=await rp100Unzip(localStorage.getItem(RP100.PRE+id));return t?JSON.parse(t):null}catch(e){console.error(e);return null}}
function rp100Pin(id){const a=rp100Idx();const x=a.find(r=>r.id===id);if(!x)return;x.pin=!x.pin;rp100IdxPut(rp100Prune(a))}
function rp100Del(id){try{localStorage.removeItem(RP100.PRE+id)}catch(e){}rp100IdxPut(rp100Idx().filter(x=>x.id!==id))}
/* a server replay (replay.get) in the page's shape */
function rp100FromSrv(X){if(!X||!X.open)return null;let ev=X.ev,loc=X.loc;try{const s=JSON.parse(X.open.S);if(ev==null)ev=s.evKey;if(loc==null)loc=s.locIdx}catch(e){}
  return {f:'flavius-replay',fv:RP100.FV,id:X.id,kind:'onl',v:X.v||'',at:X.at||Date.now(),title:rp100Title(ev,loc),sub:_T('⚔ Ranked · kept on the server'),mode:'onl',ranked:true,open:X.open,inputs:X.inputs||[],end:{h:X.h||null}}}
async function rp100Get(id){const L=await rp100Local(id);if(L)return L;if(!/^[A-Za-z0-9_-]{1,40}$/.test(id)||typeof NET==='undefined')return null;
  try{return rp100FromSrv(await NET.req('replay.get',{id}))}catch(e){RPP.lastErr=e;return null}}

/* ---------------- describing a match ---------------- */
const RP100_MODES={pn:_T('⚔ Play Now'),mgr:_T('💼 Manager'),hs:_T('🪑 Hot seat'),onl:_T('🌐 Online'),tourn:_T('🏆 Tournament'),fest:_T('🎉 Festival'),missio:_T('🗡 Missio'),spec:_T('✉ Invitational')};
function rp100Mode(s){return s.onl?'onl':s.mgrCtx||s.pen76||s.exhib||s.exhibCtx?'mgr':s.hotseat?'hs':s.tourn?'tourn':s.fest?'fest':s.missio?'missio':s.specCtx?'spec':'pn'}
function rp100Title(ev,loc){const E=(typeof EVENTS!=='undefined'&&EVENTS[ev])||{};const L=(typeof LOCATIONS!=='undefined'&&LOCATIONS[loc])||{};return [E.short||E.n||ev||_T('An event'),L.n||''].filter(Boolean).join(' · ')}
function rp100Who(){try{return S.players.map(p=>p.name).join(', ')}catch(e){return ''}}
function rp100NewId(){return 'L'+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36)}
/* may this event be recorded? (offline; online goes through the stream) */
function rp100RecOK(){return !RP100_OFF&&!HEADLESS&&!RPP.on&&!!S&&!S.over&&!S.sim&&!S.tutorial&&!S.e94test&&!S.onl}

/* ---------------- recording ---------------- */
function rp100Begin(start,snap){const R={id:rp100NewId(),at:Date.now(),v:GAME_VER,start,snap:{...snap,log:'',name:'replay'},ins:[],S,mode:rp100Mode(S),title:rp100Title(S.evKey,S.locIdx),sub:rp100Who(),seed:S.seed};
  RPR.rec=R;RPR.seen.add(S);return R}
const rp100Live=()=>{const R=RPR.rec;return R&&R.S===S&&S&&!S.over&&!RPP.on&&!R.full?R:null};
function rp100Push(x){const R=rp100Live();if(!R)return;if(R.ins.length>=RP100.MAX_IN){R.full=1;return}R.ins.push(x)}
const rp100Settled=()=>!!(S&&!S.over&&!S.busy&&!CUR_MODAL&&['choice','action','command'].includes(S.phase));
const rp100Pos=()=>({pos:1,t:S.turnNo,s:RNG?RNG.s:0});
const rp100H=()=>{try{return onlHash()}catch(e){return ''}};
/* a window the player opened from a bar (not a decision the game asked for): a trusted click outside the board, or just after one */
const RP100_BOARD='#actions,#modal,canvas,#ctxMenu,[data-gear88],[data-seat],#rp100bar';
function rp100UiOpen(at){const e=window.event;if(e&&e.isTrusted&&(e.type==='click'||e.type==='keydown')){const t=e.target;if(!(t&&t.closest&&t.closest(RP100_BOARD)))return true}return Date.now()-(at||0)<300}

if(!RP100_OFF){
/* the opening: the first beginTurn of a recorded event (also playback's turn hooks) */
{const base=beginTurn;beginTurn=async function(){try{
    if(RPP.on&&S===RPP.S)rp100PlayTurn();
    else if(S&&!S.over&&!RPR.seen.has(S)&&rp100RecOK())rp100Begin('bt',matchSnapshot('replay'))}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* a saved match resumed: the save itself is the opening */
{const base=matchLoad;matchLoad=function(k){let snap=null;try{if(!RPP.on&&typeof MSAVE_SLOTS!=='undefined'&&MSAVE_SLOTS.includes(String(k)))snap=matchSlotGet(k)}catch(e){}
  const r=base.apply(this,arguments);try{if(snap&&S&&!S.over&&rp100RecOK()&&!RPR.seen.has(S))rp100Begin('load',snap)}catch(e){console.error(e)}return r}}
/* board clicks */
{const base=onTile;onTile=function(r,c){try{if(rp100Live()&&!RPP.applying&&typeof HL!=='undefined'&&HL.get(r*N+c)){const p=cur();const x={k:'tile',r,c,mode:S.mode,focus:p&&p.focusRoll?1:0};rp100Push(rp100Settled()?{...x,h:rp100H()}:{...x,...rp100Pos()})}}catch(e){}
  return base.apply(this,arguments)}}
/* action buttons (trusted or the hotkeys' .click()); playback: the viewer's board, buttons and hotkeys do nothing */
function rp100DataOf(b){const d={};for(const [k,v] of Object.entries(b.dataset||{})){if(/^(tip|tt|lp98|st98|en84|tipx|avtip)/.test(k)||String(v).length>60)continue;d[k]=String(v)}return d}
document.addEventListener('click',e=>{
  if(RPP.on&&S===RPP.S){if(RPP.applying||!e.isTrusted)return;const t=e.target;if(!t||!t.closest)return;if(t.closest('#rp100bar'))return;
    if(t.closest('#actions [data-act],canvas,[data-seat],[data-gear88],[data-gear89],#btnSimEnd,#btnMSave')&&!t.closest('[data-act="inspect"],[data-act="trophies"],[data-act^="m-"]')){e.preventDefault();e.stopImmediatePropagation();rp100Nudge();return}
    if(!t.closest('#modal'))RPP.uiAt=Date.now();return}
  const R=rp100Live();if(!R)return;const b=e.target&&e.target.closest&&e.target.closest('[data-act]');
  if(!b){if(e.isTrusted&&!(e.target.closest&&e.target.closest('#modal,canvas,#ctxMenu')))RPR.uiAt=Date.now();return}
  if(RPP.applying||b.disabled)return;const k=b.dataset.act;if(/^m-/.test(k)||k==='inspect'||k==='trophies')return;
  /* the handler takes off-turn toggles and a tamed beast's commands any time, the rest on your own move (humanTurn) */
  if(!(k==='vetpref'||(S.cmd&&/^(cmddone|zpick|zdrop)$/.test(k))||(typeof humanTurn==='function'&&humanTurn())))return;
  rp100Push(rp100Settled()?{k:'act',d:rp100DataOf(b),h:rp100H()}:{k:'act',d:rp100DataOf(b),...rp100Pos()})},true);
document.addEventListener('pointerdown',e=>{if(RPP.on&&S===RPP.S&&e.isTrusted&&e.target&&e.target.tagName==='CANVAS')e.stopImmediatePropagation()},true);
window.addEventListener('keydown',e=>{if(!RPP.on||S!==RPP.S||!e.isTrusted)return;const t=document.activeElement;if(t&&(['INPUT','TEXTAREA','SELECT'].includes(t.tagName)||t.isContentEditable))return;
  if(CUR_MODAL)return;if(e.key===' '&&!(t&&t.closest&&t.closest('#rp100bar'))){e.preventDefault();rp100Pause(!RPP.paused)}
  if(/^(Enter| |[0-9aApPeEmM])$/.test(e.key)||(t&&t.tagName==='CANVAS'))e.stopImmediatePropagation()},true);
/* decision windows: recorded with their value; playback answers them from the list */
{const base=modal;modal=function(title,body,buttons,opt){
  if(RPP.on&&S===RPP.S)return rp100PlayModal(base,this,arguments);
  /* the results window offers the replay */
  try{const id=S&&S.over&&RPR.byS.get(S);if(id&&Array.isArray(buttons)&&buttons.some(b=>b&&b.value==='new')&&!buttons.some(b=>b&&b.value==='rp100w')){const i=buttons.findIndex(b=>b&&b.value==='export');
      const nb={label:_T('🎞 Watch the replay'),sub:_T('every move again, from the first turn'),value:'rp100w'};buttons=buttons.slice();buttons.splice(i<0?buttons.length:i,0,nb);
      return Promise.resolve(base.call(this,title,body,buttons,opt)).then(v=>{if(v==='rp100w')setTimeout(()=>rp100Play(id),160);return v})}}catch(e){console.error(e)}
  const R=rp100Live();if(!R||(typeof ONLM!=='undefined'&&ONLM.info>0))return base.apply(this,arguments);
  const u=rp100UiOpen(RPR.uiAt);const pre=rp100H();const t=String(title||'').slice(0,40);
  return Promise.resolve(base.apply(this,arguments)).then(v=>{try{let vv=v===undefined?null:v;try{JSON.stringify(vv)}catch(x){vv=null}
      if(rp100Live()===R)rp100Push({k:'modal',v:vv,t,h:pre,...(u?{u:1}:{})})}catch(e){}return v})}}
/* 🤖 / 🎮 hand-offs, ⏭ to the end, 162's off-turn gear, the sand-glass */
{const base=seatToggle;seatToggle=async function(p){if(RPP.on&&S===RPP.S&&!RPP.applying)return;
  try{if(rp100Live()&&!RPP.applying&&seatCanToggle(p)){const seat=S.players.indexOf(p);rp100Push(rp100Settled()?{k:'seat',seat,h:rp100H()}:{k:'seat',seat,...rp100Pos()})}}catch(e){}
  return base.apply(this,arguments)}}
{const base=simToEnd;simToEnd=async function(){if(RPP.on&&S===RPP.S&&!RPP.applying)return;return base.apply(this,arguments)}}
if(typeof simSnapShow==='function'){const base=simSnapShow;simSnapShow=function(){try{if(rp100Live()&&!RPP.applying)rp100Push(S.busy?{k:'sim',...rp100Pos()}:{k:'sim'})}catch(e){}return base.apply(this,arguments)}}
for(const [nm,op] of [['gear88Swap','swap'],['gear88Take','take']]){try{const base=eval(nm);if(typeof base!=='function')continue;
  const w=function(p){if(RPP.on&&S===RPP.S&&!RPP.applying)return;try{if(rp100Live()&&!RPP.applying&&p&&!p.cpu&&typeof gear88Ok==='function'&&gear88Ok(p))rp100Push({k:'gear',op,seat:S.players.indexOf(p),...rp100Pos()})}catch(e){}return base.apply(this,arguments)};
  eval(`${nm}=w`)}catch(e){}}
{const base=timeUp;timeUp=function(){try{if(rp100Live())rp100Push({k:'tu',t:S.turnNo})}catch(e){}return base.apply(this,arguments)}}
/* the end: the end hash, then the recording is kept (offline) / fetched from the stream (online) */
{const base=gameOver;gameOver=async function(winners,reason){
  if(RPP.on&&S===RPP.S)return rp100PlayEnd(winners,reason);
  try{if(S&&!S.overShown){const h=rp100H();const R=RPR.rec&&RPR.rec.S===S&&!RPP.on?RPR.rec:null;
      if(R&&!R.full){const win=(winners||[]).map(w=>typeof w==='number'?S.players[w]:w).filter(Boolean).map(p=>p.name);
        const out={f:'flavius-replay',fv:RP100.FV,id:R.id,kind:'off',v:R.v,at:R.at,start:R.start,mode:R.mode,title:R.title,sub:R.sub,seed:R.seed,snap:R.snap,ins:R.ins,end:{h,turns:S.turnNo,win}};
        RPR.byS.set(S,R.id);RPR.rec=null;RPR.saving[R.id]=rp100Save(out).catch(e=>console.error(e))}
      else if(S.onl&&!S.onl.watch&&!S.onl.rp100&&S.onl.seat>=0&&S.onl.seat<(S.onl.fighters||S.players.length)){const id=S.onl.lobby;
        const meta={id,h,ranked:!!S.onl.ranked,title:rp100Title(S.evKey,S.locIdx),sub:(S.onl.ranked?_T('⚔ Ranked'):_T('Custom'))+' · '+rp100Who(),at:Date.now(),win:(winners||[]).map(w=>typeof w==='number'?S.players[w]:w).filter(Boolean).map(p=>p.name)};
        setTimeout(()=>rp100OnlSave(meta),1500)}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
}

/* ---------------- online: the stream → the local list (+ the server for Ranked) ---------------- */
const rp100Anon=x=>ONLC.replayAnon100(x);
async function rp100OnlSave(m,n=0){let g=null;try{g=await NET.req('match.get',{id:m.id,from:0})}catch(e){if(n<2){setTimeout(()=>rp100OnlSave(m,n+1),4000)}return}
  if(!g||!g.open)return;const R={f:'flavius-replay',fv:RP100.FV,id:m.id,kind:'onl',v:GAME_VER,at:m.at,mode:'onl',ranked:m.ranked,title:m.title,sub:m.sub,open:{...g.open,log:''},inputs:(g.inputs||[]).map(rp100Anon),end:{h:m.h,win:m.win}};
  RPR.saving[m.id]=rp100Save(R);await RPR.saving[m.id];if(m.ranked)rp100SrvPut(m.id,m.h,0)}
function rp100SrvPut(id,h,n){NET.req('replay.put',{id,h:h||'',v:GAME_VER}).then(r=>{RPR.srv=RPR.srv||{};RPR.srv[id]=1}).catch(e=>{const c=e&&e.code;
  if((c==='replay_wait'||!c)&&n<4)setTimeout(()=>rp100SrvPut(id,h,n+1),[6e3,15e3,40e3,90e3][n])})}

/* ---------------- playback ---------------- */
const rp100Gap=ms=>RPP.jump!=null?0:ms/(RPP.speed||1);
const rp100SpeedName=n=>n===1?'normal':n>=4?'fast':'rp100x'+n; /* ×4 = Fast (its frame pacing keeps the board smooth) */
function rp100Strip(h){return String(h||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim()}
/* ▶ watch: loads the replay, leaves whatever runs (asks first during a live match) */
async function rp100Play(id,o={}){if(RP100_OFF||RPP.loading)return false;RPP.loading=true;try{
    if(RPR.saving[id])await RPR.saving[id];
    const R=o.R||await rp100Get(id);
    if(!R){const e=RPP.lastErr;mToast(e&&(e.code==='unknown_req'||/Unknown request/.test(e.message||''))?_T('🎞 The server keeps no replays yet.'):_T('🎞 That replay is not in this browser, and the server keeps none for it.'));return false}
    if(S&&!S.over&&!(RPP.on&&S===RPP.S)&&!o.force){const ok=await modal(_T('🎞 Watch the replay?'),`<p>${_T('This leaves the match on the sand — it is not saved.')}</p>`,[{label:_T('🎞 Watch the replay'),value:1,primary:1},{label:_T('Stay'),value:0}],{close:0});if(!ok)return false}
    for(let k=0;k<30&&CUR_MODAL;k++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,60))}
    try{const a=document.getElementById('as100');if(a)a.remove()}catch(e){}
    RPP.jump=o.jump!=null?o.jump:null;rp100Load(R);return true}
  catch(e){console.error(e);mToast(errText92(e,_T('🎞 The replay could not be opened.')));return false}finally{RPP.loading=false}}
function rp100Load(R){
  if(!RPP.ctx)RPP.ctx={speed:SPEED,hints:typeof HINTS!=='undefined'?HINTS:null,hs:typeof CFG!=='undefined'?{h:CFG.hotseat,m:CFG.mode}:null,last:typeof LAST_CFG!=='undefined'?LAST_CFG:null};
  if(S&&!S.over)S.over=true;try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}
  try{if(typeof screenIntent==='function')screenIntent('rp100Play')}catch(e){}
  Object.assign(RPP,{on:true,R,i:0,used:new Set(),pend:[],div:null,end:null,applying:0,readyAt:0,paused:false,step:false,onl:R.kind==='onl',cap:''});RPP.ins=RPP.onl?[]:(R.ins||[]).map(x=>({...x}));
  if(RPP.onl){let o0={};try{o0=JSON.parse(R.open.S).onl||{}}catch(e){}const onl={...o0,lobby:'rp100:'+R.id,seat:-1,host:false,watch:true,rp100:true,opened:true};
    onlmLoad({...R.open,log:''},onl);RPP.S=S;const ins=(R.inputs||[]).map(x=>({...x}));const s0=ins.reduce((m,x)=>Math.min(m,x.seq|0),Infinity);onlmWatchOn(Number.isFinite(s0)?s0:0,ins)}
  else{matchSlotPut('rp100',{...R.snap,log:''});matchLoad('rp100');matchSlotDel('rp100');RPP.S=S}
  if(S.limits)S.limits={...S.limits,min:0};
  try{$('#log').innerHTML=''}catch(e){}
  log(_T`🎞 <b>Replay</b> — ${esc(R.title||'')} · recorded ${esc(new Date(R.at).toLocaleString())}${R.v&&R.v!==GAME_VER?_T` · made with v${esc(R.v)} — may not replay exactly`:''}.`,'big');
  rp100Rng();try{if(typeof menuHide==='function')menuHide()}catch(e){}window.SETUP_OPEN=false;if(typeof MM!=='undefined')MM.fromMenu=false;
  document.body.classList.add('rp100on');SPEED=RPP.jump!=null?'fast':rp100SpeedName(RPP.speed);rp100Bar();
  if(RPP.onl||R.start!=='load'){const G=S;later(()=>{if(S===G&&RPP.on)beginTurn()},80)}else{try{render()}catch(e){}}
  rp100Pump()}
/* timing-bound inputs: applied right after the roll that brought the dice stream to their state */
function rp100Rng(){const R0=RNG;if(!R0||R0._rp100)return;const nx=R0.next;R0.next=function(){const v=nx.call(this);if(RPP.on&&RNG===R0&&!RPP.onl)rp100PosHit();return v};R0._rp100=1}
/* the next input that must happen: windows that only MAY have been the player's own (u:1) are passed over until something asks for them */
function rp100Head(){while(RPP.used.has(RPP.i))RPP.i++;let j=RPP.i;while(RPP.ins[j]&&(RPP.used.has(j)||RPP.ins[j].k==='modal'&&RPP.ins[j].u))j++;return j}
/* the recorded window a window opening now answers to: the next one in the list with its title, past windows that only MAY have been the player's
   own and moves timed by the dice (those may land just after it); -1 = the recording does not know it (it opens for the viewer) */
function rp100Match(t){let k=RPP.i;for(const P of RPP.pend)k=Math.max(k,P.j+1);for(let n=0;n<10;k++){const x=RPP.ins[k];if(!x)return -1;if(RPP.used.has(k))continue;n++;
    if(x.k==='modal'&&x.t===t)return k;if(!((x.k==='modal'&&x.u)||x.pos))return -1}return -1}
function rp100PosHit(){const j=rp100Head(),x=RPP.ins[j];if(x&&x.pos&&x.s===RNG.s&&!x._q){x._q=1;setTimeout(()=>rp100ApplyPos(x),0)}}
function rp100ApplyPos(x){if(!RPP.on||S!==RPP.S)return;const j=rp100Head();if(RPP.ins[j]!==x)return;RPP.i=j+1;rp100Do(x);setTimeout(rp100Pump,30)}
/* each turn: the sand-glass (if it ran out here), ⏭ next turn, the round jump */
function rp100PlayTurn(){if(RPP.onl){rp100TurnMarks();return}const j=rp100Head(),x=RPP.ins[j];
  if(x&&x.k==='tu'&&x.t===S.turnNo+1){RPP.i=j+1;S.limits={...(S.limits||{}),min:1e-9};S.startedAt=1}
  rp100TurnMarks()}
function rp100TurnMarks(){if(RPP.step){RPP.step=false;rp100Pause(true)}if(RPP.jump!=null&&S.ri>=RPP.jump){RPP.jump=null;rp100Pause(true)}rp100BarSync()}
function rp100Pump(){clearTimeout(RPP.pt);if(!RPP.on||S!==RPP.S||!S||S.over)return;RPP.pt=setTimeout(rp100Pump,90);if(RPP.onl||RPP.paused)return;
  if(RPP.pend.length){rp100Decide();return}
  const j=rp100Head(),x=RPP.ins[j];
  if(!x){if(rp100Settled()&&!cur().cpu){if(!RPP.readyAt)RPP.readyAt=Date.now();else if(Date.now()-RPP.readyAt>2500){RPP.readyAt=0;rp100Div(_T('the recorded moves ran out'));RPP.applying++;try{simToEnd(true)}finally{RPP.applying--}}}return}
  if(x.pos){if(RNG&&RNG.s===x.s&&!x._q){x._q=1;setTimeout(()=>rp100ApplyPos(x),0);return}
    /* its roll went by unseen: once the game waits on a player, it happens there (best effort) */
    if(!rp100Settled()){RPP.readyAt=0;return}if(!RPP.readyAt){RPP.readyAt=Date.now();return}if(Date.now()-RPP.readyAt>2500&&!x._q){RPP.readyAt=0;x._q=1;rp100Div(_T`turn ${S.turnNo}`);rp100ApplyPos(x)}return}
  if(x.k==='tu')return;
  if(!rp100Settled()){RPP.readyAt=0;return}
  if(!RPP.readyAt){RPP.readyAt=Date.now();return}const since=Date.now()-RPP.readyAt;
  if(x.k==='modal'){if(since>3000){RPP.i=j+1;RPP.readyAt=0;rp100Div(_T('a window never came'))}return}
  if(since<rp100Gap(RP100.GAP))return;RPP.readyAt=0;RPP.i=j+1;if(x.h&&x.h!==rp100H())rp100Div(_T`turn ${S.turnNo}`);rp100Do(x);setTimeout(rp100Pump,30)}
function rp100Do(x){RPP.applying++;try{rp100Caption(x);
    if(x.k==='tile'){const p=cur();if(p)p.focusRoll=!!x.focus;S.mode=x.mode;try{computeHL()}catch(e){}onTile(x.r,x.c)}
    else if(x.k==='act'){const b=document.createElement('button');b.type='button';for(const [k,v] of Object.entries(x.d||{}))b.dataset[k]=v;b.style.display='none';document.body.appendChild(b);try{b.click()}finally{b.remove()}}
    else if(x.k==='seat'){const p=S.players[x.seat];if(p)seatToggle(p)}
    else if(x.k==='sim')simToEnd(true);
    else if(x.k==='gear'){const p=S.players[x.seat];if(p){if(x.op==='swap')gear88Swap(p);else gear88Take(p)}}}
  catch(e){console.error(e)}finally{RPP.applying--}}
/* a decision window during playback: answered from the list (never opened); rule pop-ups pass by; the viewer's own windows open */
function rp100PlayModal(base,self,args){const [title,,buttons,opt]=args;
  if(rp100UiOpen(RPP.uiAt))return base.apply(self,args);
  const def=opt&&('close' in opt)?opt.close:((buttons||[]).slice(-1)[0]||{}).value??null;
  if(typeof ONLM!=='undefined'&&ONLM.info>0)return Promise.resolve(def);
  if(RPP.onl||S.over)return base.apply(self,args);const t=String(title||'').slice(0,40);const j=rp100Match(t);
  if(j<0){rp100Div(rp100Strip(title).slice(0,40));return base.apply(self,args)}
  return new Promise(res=>{RPP.pend.push({res,j,t,title:String(title||''),buttons:buttons||[],def,pre:rp100H(),at:0});setTimeout(rp100Pump,0)})}
function rp100Decide(){const P=RPP.pend[0];const j=P.j,x=RPP.ins[j];
  if(x){if(!P.at){P.at=Date.now();const b=P.buttons.find(b=>b&&JSON.stringify(b.value)===JSON.stringify(x.v));RPP.cap=`🗳 ${rp100Strip(P.title).slice(0,48)}${b?' → '+rp100Strip(b.label).slice(0,40):''}`;rp100BarSync()}
    if(Date.now()-P.at<rp100Gap(x.u?150:RP100.MGAP))return;RPP.used.add(j);RPP.pend.shift();if(x.h&&x.h!==P.pre)rp100Div(_T`turn ${S.turnNo}`);P.res(x.v);setTimeout(rp100Pump,30);return}
  if(!P.at)P.at=Date.now();if(Date.now()-P.at<1500)return;RPP.pend.shift();rp100Div(rp100Strip(P.title).slice(0,40));P.res(P.def);setTimeout(rp100Pump,30)}
const RP100_ACTS={end:_T('ends the turn'),coin:_T('takes the coin'),card:_T('draws a card'),market:_T('goes to the market'),crowd:_T('spends Crowd Favor'),trade:_T('offers a deal'),loot:_T('loots'),chest:_T('opens the Arena Chest'),focus:_T('focuses')};
function rp100Caption(x){const p=cur();const who=p?p.name:'';const a=x.d&&x.d.act;RPP.cap=x.k==='tile'?_T`👣 ${who} → ${typeof tl==='function'?tl(x.r,x.c):x.r+','+x.c}`:x.k==='act'?_T`▶ ${who} ${RP100_ACTS[a]||a||''}`:x.k==='seat'?_T('🤖 a seat changes hands'):x.k==='sim'?_T('⏭ the rest is simulated'):x.k==='gear'?_T('🎒 off-turn gear'):RPP.cap;rp100BarSync()}
function rp100Div(where){if(RPP.div)return;RPP.div={where:String(where||''),turn:S?S.turnNo:0};rp100BarSync()}
/* the end: compare the end hash; nothing is recorded */
async function rp100PlayEnd(winners,reason){if(S.overShown)return;const h=rp100H();S.overShown=true;S.over=true;S.phase='over';S.busy=false;if(S.snap){S.snap=false;try{if(typeof simSnapHide==='function')simSnapHide()}catch(e){}}
  for(const P of RPP.pend.splice(0))try{P.res(P.def)}catch(e){}
  if(RPP.onl&&typeof ONLM!=='undefined'){ONLM.on=false;try{onlmWaitShow()}catch(e){}}
  const R=RPP.R;const want=R&&R.end&&R.end.h;RPP.end={h,same:want?h===want:null,win:(winners||[]).map(w=>typeof w==='number'?S.players[w]:w).filter(Boolean).map(p=>p.name),reason:rp100Strip(reason)};
  try{render()}catch(e){}if(SPEED==='pause'||SPEED==='snap')SPEED=rp100SpeedName(RPP.speed);RPP.paused=false;rp100BarSync()}
function rp100Pause(on){RPP.paused=!!on;if(!RPP.on)return;SPEED=on?'pause':RPP.jump!=null?'fast':rp100SpeedName(RPP.speed);if(!on)setTimeout(rp100Pump,0);rp100BarSync()}
function rp100Speed(n){RPP.speed=n;if(!RPP.paused&&RPP.jump==null)SPEED=rp100SpeedName(n);rp100BarSync()}
function rp100Restart(jump){const R=RPP.R;if(!R)return;if(S)S.over=true;for(const P of RPP.pend.splice(0))try{P.res(P.def)}catch(e){}RPP.jump=jump!=null?jump:null;setTimeout(()=>rp100Load(R),120)}
function rp100Jump(n){if(!RPP.on)return;if(!S||S.over||n<=S.ri){rp100Restart(n);return}RPP.jump=n;RPP.paused=false;SPEED='fast';setTimeout(rp100Pump,0);rp100BarSync()}
/* ✕ leave: everything the replay touched goes back (speed, hints, the hot-seat switch); quiet = a new event is taking over */
function rp100Exit(quiet){if(!RPP.on)return;RPP.exiting=true;try{if(S&&!S.over)S.over=true;for(const P of RPP.pend.splice(0))try{P.res(P.def)}catch(e){}
    if(RPP.onl){try{if(typeof ONLM!=='undefined')ONLM.on=false;if(typeof onl80RulesOff==='function')onl80RulesOff();const w=document.getElementById('onlWait');if(w)w.hidden=true;document.body.classList.remove('onl-off')}catch(e){}}
    const c=RPP.ctx||{};RPP.ctx=null;SPEED=c.speed&&c.speed!=='pause'&&!/^rp100/.test(c.speed)?c.speed:'normal';try{if(c.hints!=null)HINTS=c.hints}catch(e){}
    try{if(c.hs&&typeof CFG!=='undefined'){CFG.hotseat=c.hs.h;CFG.mode=c.hs.m}if(typeof LAST_CFG!=='undefined')LAST_CFG=c.last}catch(e){}
    Object.assign(RPP,{on:false,S:null,R:null,ins:[],pend:[],jump:null,step:false,paused:false,onl:false,cap:''});clearTimeout(RPP.pt);
    document.body.classList.remove('rp100on');const b=document.getElementById('rp100bar');if(b)b.remove();
    if(!quiet){if(typeof transitRun==='function')transitRun(()=>menuShow(),_T('The main menu…'));else menuShow()}}finally{RPP.exiting=false}}
function rp100Nudge(){const b=document.getElementById('rp100bar');if(!b)return;b.classList.remove('nudge');void b.offsetWidth;b.classList.add('nudge')}

/* ---------------- the replay bar ---------------- */
function rp100RoundOpts(){let rs=[];try{rs=EV().rounds||[]}catch(e){}const roman=['I','II','III','IV','V','VI','VII','VIII'];
  return rs.map((r,i)=>`<option value="${i}" ${S&&S.ri===i?'selected':''}>${_T`Round ${roman[i]||i+1}`}</option>`).join('')}
function rp100Bar(){let b=document.getElementById('rp100bar');if(!b){b=document.createElement('div');b.id='rp100bar';b.setAttribute('role','toolbar');b.setAttribute('aria-label',_T('Replay controls'));document.body.appendChild(b)}
  const R=RPP.R||{};const old=R.v&&R.v!==GAME_VER;
  b.innerHTML=`<div class="rp1h"><b class="rp1tag">🎞 ${_T('REPLAY')}</b><span class="rp1t">${esc(R.title||'')}</span>${old?`<span class="rp1old" title="${esc(_T('Recorded with another version of the game'))}">${_T`made with v${esc(R.v)} — may not replay exactly`}</span>`:''}</div>
  <div class="rp1c"><button type="button" class="btn tksm" data-rp1="play" aria-label="${esc(_T('Pause or play'))}"></button>
   <span class="seg rp1sp" role="group" aria-label="${esc(_T('Replay speed'))}">${[1,2,4].map(n=>`<button type="button" class="btn tksm" data-rp1="sp" data-n="${n}">×${n}</button>`).join('')}</span>
   <button type="button" class="btn tksm" data-rp1="step" title="${esc(_T('Play to the next turn, then pause'))}">⏭ ${_T('Next turn')}</button>
   <label class="rp1j">${_T('Jump to')} <select data-rp1="jump" aria-label="${esc(_T('Jump to a round'))}">${rp100RoundOpts()}</select></label>
   <button type="button" class="btn tksm" data-rp1="mute" aria-label="${esc(_T('Sound on or off'))}"></button>
   <button type="button" class="btn tksm rp1x" data-rp1="exit">✕ ${_T('Exit')}</button></div>
  <div class="rp1s" role="status" aria-live="polite"></div>`;rp100BarSync()}
function rp100BarSync(){const b=document.getElementById('rp100bar');if(!b||!RPP.on)return;const q=s=>b.querySelector(s);
  const pl=q('[data-rp1="play"]');if(pl){pl.textContent=RPP.paused?_T('▶ Play'):_T('⏸ Pause');pl.classList.toggle('primary',RPP.paused)}
  b.querySelectorAll('[data-rp1="sp"]').forEach(x=>x.classList.toggle('on',+x.dataset.n===RPP.speed));
  const mu=q('[data-rp1="mute"]');if(mu){let on=true;try{on=audSet().on}catch(e){}mu.textContent=on?'🔊':'🔇'}
  const j=q('[data-rp1="jump"]');if(j&&S&&document.activeElement!==j){if(!j.options.length)j.innerHTML=rp100RoundOpts();j.value=String(RPP.jump!=null?RPP.jump:S.ri||0)}
  const s=q('.rp1s');if(!s)return;let h='';
  if(RPP.end){h=`🏁 ${RPP.end.win.length?_T`${esc(RPP.end.win.join(', '))} — the end.`:_T('The end.')} `+(RPP.end.same===true?`<span class="rp1ok">${_T('✓ The same ending as the match.')}</span>`:RPP.end.same===false?`<span class="rp1bad">${_T('⚠ This replay drifted from the match')}${RPP.div?' ('+esc(RPP.div.where)+')':''}.</span>`:'')+
    ` <button type="button" class="btn tksm" data-rp1="again">↺ ${_T('Watch again')}</button>`}
  else{h=`<span class="rp1turn">${_T`Turn ${S?S.turnNo:0} · round ${S?S.ri+1:1}`}</span> ${RPP.jump!=null?_T('⏩ jumping…'):esc(RPP.cap||'')}${RPP.div?` <span class="rp1bad">${_T('⚠ out of step with the match')}</span>`:''}`}
  s.innerHTML=h}
/* the bar's clicks are handled first and kept from the game's own listeners (113 would read them as a bar window's click) */
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#rp100bar [data-rp1]');if(!b)return;if(b.tagName==='SELECT')return;e.stopPropagation();e.preventDefault();const a=b.dataset.rp1;
  if(a==='play')rp100Pause(!RPP.paused);else if(a==='sp')rp100Speed(+b.dataset.n);else if(a==='step'){RPP.step=true;rp100Pause(false)}
  else if(a==='mute'){try{audToggleMute()}catch(err){}rp100BarSync()}else if(a==='exit')rp100Exit(false);else if(a==='again')rp100Restart(null)},true);
window.addEventListener('change',e=>{const s=e.target&&e.target.closest&&e.target.closest('#rp100bar [data-rp1="jump"]');if(!s)return;e.stopPropagation();rp100Jump(+s.value)},true);

if(!RP100_OFF){
/* a new event or the main menu ends the replay */
{const base=startEvent;startEvent=function(){if(RPP.on&&!RPP.exiting)rp100Exit(true);return base.apply(this,arguments)}}
{const base=menuShow;menuShow=function(){if(RPP.on&&!RPP.exiting)rp100Exit(true);return base.apply(this,arguments)}}
/* NO RECORDS while a replay plays (224's list) — nor Store writes, autosaves, the calendar or a match save */
for(const nm of ['recordEvent','achievementsAfterEvent','logCustomChars','updateCrowdAfterEvent','bestiaryTally','saveGladiator','markFallen','claimFreedom','hallTrophy','rivalTrophy',
  'sponsorAfterEvent','roadAfterEvent','infirmaryTick','achGrant','betRec','betSettle','matchAutosave','advanceMissio','calAdvance','setPurse']){
  try{const base=eval(nm);if(typeof base!=='function')continue;const isAsync=base.constructor&&base.constructor.name==='AsyncFunction';
    const w=function(){if(RPP.on){RPP.muted=(RPP.muted|0)+1;return isAsync?Promise.resolve(null):null}return base.apply(this,arguments)};eval(`${nm}=w`)}catch(e){}}
{const base=careerHoldsClock;careerHoldsClock=async function(){if(RPP.on)return true;return base.apply(this,arguments)}}
{const base=matchSaveOK;matchSaveOK=function(){return RPP.on?false:base.apply(this,arguments)}}
{const put=Store.put,del=Store.del;Store.put=function(){if(RPP.on){RPP.muted=(RPP.muted|0)+1;return Promise.resolve(false)}return put.apply(this,arguments)};Store.del=function(){if(RPP.on)return Promise.resolve();return del.apply(this,arguments)}}
/* an online replay never reaches the server's match routes (no clocks, reports, drops) */
{const base=NET.req;NET.req=function(t,d){if(RPP.on&&RPP.onl&&/^(match\.|stands\.|bet\.)/.test(String(t)))return Promise.resolve(t==='match.get'?{open:null,inputs:[]}:{});return base.apply(this,arguments)}}
}

/* the in-page mock server mirrors routes.js "v1.0 REPLAYS" (w.replays100) */
if(typeof MOCK_ROUTES!=='undefined'){const C=ONLC;const err=(m,c)=>{const e=new Error(m);e.code=c;return e};
  MOCK_ROUTES['replay.put']=(w,d,me)=>{d=d||{};const why=C.replayPutWhy100(d);if(why)throw err(_T(why),'replay_bad');const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw err(_T('No such match.'),'replay_bad');
    if(!(L.players||[]).some(p=>p.id===me))throw err(_T('Not your match.'),'replay_bad');if(!L.ranked)throw err(_T('Only Ranked matches are kept on the server.'),'replay_custom');
    if(L.status==='live'&&M.status!=='done')throw err(_T('The match is still being settled — try again in a moment.'),'replay_wait');w.replays100=w.replays100||{};if(w.replays100[d.id])return {done:1,id:d.id,dup:1};
    if(!M.open)throw err(_T('That match can no longer be kept.'),'replay_gone');const rp=C.replayPack100({id:d.id,v:d.v,h:d.h,at:Date.now(),ev:L.ev,loc:L.loc,open:M.open,inputs:M.inputs||[]});
    if(C.replaySize100(rp)>C.REPLAY100.MAX)throw err(_T('That match is too long to keep.'),'replay_big');w.replays100[d.id]=rp;return {done:1,id:d.id}};
  MOCK_ROUTES['replay.get']=(w,d)=>{const X=d&&C.replayIdOK100(d.id)&&(w.replays100||{})[d.id];if(!X)throw err(_T('No replay is kept for that match.'),'replay_none');return X}}

/* ---------------- 📜 Saves → 🎞 Replays ---------------- */
function rp100ListHTML(){const a=rp100Idx();
  const rows=a.map(x=>`<div class="hub76card rp100row${x.pin?' pin':''}"><div>${_T`<b>${esc(x.title||'')}</b><small>${esc(RP100_MODES[x.mode]||RP100_MODES.pn)} · ${esc(x.sub||'')}</small>
    <small>${esc(new Date(x.at).toLocaleString())} · v${esc(x.v||'?')}${x.v&&x.v!==GAME_VER?' ⚠':''} · ${x.kb} KB${x.ranked?' · '+_T('also on the server (30 days)'):''}</small>`}</div>
    <span class="rp100btns"><button type="button" class="btn tksm" data-rp100pin="${esc(x.id)}" aria-pressed="${!!x.pin}" title="${esc(x.pin?_T('Kept for good — click to let it go with the oldest'):_T('Keep this replay for good'))}">${x.pin?'★':'☆'}</button>
    <button type="button" class="btn primary" data-rp100go="${esc(x.id)}">${_T('▶ Watch')}</button><button type="button" class="btn" data-rp100del="${esc(x.id)}" aria-label="${esc(_T('Delete this replay'))}">🗑</button></span></div>`).join('');
  return `${rows?`<div class="hub76list rp100list">${rows}</div>`:`<p class="rc-sub">${_T('No replays yet — every match you finish is kept here.')}</p>`}
  <p class="rc-sub">${_T`Your last ${RP100.KEEP} matches stay in this browser; ★ keeps one for good. Ranked online matches are also kept on the server for 30 days — their 🔗 link opens them anywhere.`}</p>`}
if(!RP100_OFF){
{const base=hubBody76;hubBody76=async function(tab){if(tab!=='replays'){const h=await base.apply(this,arguments);return rp100HubTab(h,tab)}const h=await base.call(this,'matches');return rp100HubTab(h.replace(/<div class="hub76body">[\s\S]*$/,''),tab)+`<div class="hub76body">${rp100ListHTML()}</div>`}}
function rp100HubTab(h,tab){const btn=`<button type="button" role="tab" data-hub76="replays" class="${tab==='replays'?'on':''}" aria-selected="${tab==='replays'}">${_T('🎞 Replays')}</button>`;
  h=tab==='replays'?h.replace(/(data-hub76="matches" class=")on(")/,'$1$2').replace(/(data-hub76="matches"[^>]*aria-selected=")true/,'$1false'):h;
  const i=h.indexOf('data-hub76="backups"');if(i<0)return h;const s=h.lastIndexOf('<button',i);return h.slice(0,s)+btn+h.slice(s)}
document.addEventListener('click',async e=>{const t=e.target;if(!t||!t.closest)return;
  const go=t.closest('[data-rp100go]');if(go){e.preventDefault();e.stopPropagation();const id=go.dataset.rp100go;if(t.closest('#hub76')&&CUR_MODAL)CUR_MODAL.done('x');setTimeout(()=>rp100Play(id),120);return}
  if(!t.closest('#hub76'))return;
  const pn=t.closest('[data-rp100pin]');if(pn){rp100Pin(pn.dataset.rp100pin);if(typeof hubRedraw76==='function')hubRedraw76('replays');return}
  const dl=t.closest('[data-rp100del]');if(dl){if(!dl.dataset.armed){dl.dataset.armed=1;dl.textContent=_T('Confirm delete');return}rp100Del(dl.dataset.rp100del);if(typeof hubRedraw76==='function')hubRedraw76('replays')}});

/* ---------------- 293's after-match summary + the #replay=<id> link ---------------- */
if(typeof b100Summary==='function'){const base=b100Summary;b100Summary=function(id,res){const r=base.apply(this,arguments);try{const el=document.getElementById('as100');if(!el)return r;const ranked=!!(B100.sum&&B100.sum.ranked);
    const sm=[...el.querySelectorAll(':scope > small.rc-sub')].find(x=>/📼/.test(x.textContent));const txt=ranked?_T('🎞 Anyone with the link can watch this match for 30 days.'):_T('🎞 Custom matches are kept in your browser (📜 Saves → 🎞 Replays).');
    if(sm)sm.textContent=txt;const cp=el.querySelector('[data-as100="copy"]');if(cp)cp.title=ranked?_T('Copy the replay link'):_T('Copy the link — it opens where the replay is kept');
    const acts=el.querySelector('.acts');if(acts&&!acts.querySelector('[data-rp100go]'))acts.insertAdjacentHTML('afterbegin',`<button type="button" class="btn tksm" data-rp100go="${esc(id)}">${_T('🎞 Watch the replay')}</button>`)}catch(e){console.error(e)}return r}}
function rp100Deep(h){try{const m=/^#replay=([A-Za-z0-9_-]{1,40})$/.exec(h||location.hash||'');if(!m)return;const id=decodeURIComponent(m[1]);try{history.replaceState(null,'',location.pathname+location.search)}catch(x){}
    rp100Play(id).then(ok=>{if(ok)return;const e=RPP.lastErr;const why=e&&(e.code==='unknown_req'||/Unknown request/.test(e.message||''))?_T('The server keeps no replays yet.'):_T('This browser does not hold that match, and the server keeps only Ranked matches (for 30 days).');
      if(typeof onl83Pop!=='function')return;const bg=onl83Pop('rp100pop',`<div class="rp100"><h3>${_T('🎞 A match replay')}</h3><p>${_T`Match <b>${esc(id)}</b>.`}</p><p class="rc-sub">${why}</p><div class="acts"><button type="button" class="btn" data-dl100x="1">${_T('Close')}</button></div></div>`);
      bg.addEventListener('click',ev=>{if(ev.target.closest&&ev.target.closest('[data-dl100x]'))bg.remove()})})}catch(e){console.error(e)}}
if(typeof b100Deep==='function')b100Deep=rp100Deep;
/* 293's own hashchange listener holds the old function: its "coming soon" card never opens any more */
if(typeof onl83Pop==='function'){const base=onl83Pop;onl83Pop=function(cls,inner){if(cls==='rp100pop'&&/📼/.test(String(inner||'')))return document.createElement('div');return base.apply(this,arguments)}}
/* the hash is read and cleared here, before 293's own listener looks at it (it would open its old "coming soon" card) */
window.addEventListener('hashchange',e=>{const h=location.hash||'';if(/^#replay=/.test(h)){e.stopImmediatePropagation();try{history.replaceState(null,'',location.pathname+location.search)}catch(x){}rp100Deep(h)}},true);
}

/* ---------------- look ---------------- */
{const st=document.createElement('style');st.textContent=`#rp100bar{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:75;max-width:min(980px,calc(100vw - 16px));box-sizing:border-box;padding:6px 10px;border-radius:12px;
  background:rgba(18,12,7,.94);border:1px solid var(--gold,#e8c96a);color:#f3e6c4;box-shadow:0 6px 22px #000a;font-size:13px;display:flex;flex-direction:column;gap:4px}
#rp100bar .rp1h{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}#rp100bar .rp1tag{color:var(--gold,#e8c96a);letter-spacing:.06em}#rp100bar .rp1t{font-weight:600}
#rp100bar .rp1old{color:#f0b070}#rp100bar .rp1c{display:flex;gap:6px;align-items:center;flex-wrap:wrap}#rp100bar .rp1sp{display:inline-flex;gap:2px}#rp100bar .rp1sp .on{outline:2px solid var(--gold,#e8c96a)}
#rp100bar .rp1j select{max-width:120px}#rp100bar .rp1x{margin-left:auto}#rp100bar .rp1s{min-height:18px;color:#e9dcc0}#rp100bar .rp1ok{color:#9fe0a0}#rp100bar .rp1bad{color:#ffb08a}
#rp100bar.nudge{animation:rp1nudge .4s}@keyframes rp1nudge{0%,100%{transform:translateX(-50%)}25%{transform:translateX(calc(-50% - 6px))}75%{transform:translateX(calc(-50% + 6px))}}
body.calm #rp100bar.nudge{animation:none}body.rp100on #onlWait{display:none!important}body.rp100on #actions{opacity:.8}
.rp100row .rp100btns{display:flex;gap:4px;align-items:center;flex-shrink:0}.rp100row.pin{border-color:var(--gold,#e8c96a)}
@media (max-width:600px){#rp100bar{left:8px;right:8px;transform:none;max-width:none;bottom:6px}#rp100bar.nudge{animation:none}#rp100bar .rp1x{margin-left:0}}`;document.head.appendChild(st)}
