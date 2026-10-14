/* 232-v96board — v0.96 part B, BOARD & MATCH (his v0.96 notes 2026-10-07; numbering = the batch list). Display + small rule fixes;
   nothing here draws from the dice except where a rule says so (the location dice of a Focus roll, exactly as before).
   1 🔴 THE SILENT ATTACK. Root cause (traced 2026-10-08): hurt() (03-engine) writes a log line only when something happened — AP lost,
       HP lost, a shield raised. A strike whose dice all MISSED (or whose last die Fidelis Constans took) reached hurt() with 0 damage and
       left NO line at all, only a grey 'miss' float; with Focus the attacker was still asked WHERE to strike after the dice had missed
       (Focus! / the Focus roll pick the location after the hit dice), so a fatal-looking head shot "used the weapon, applied nothing,
       logged nothing". Beasts' missed bites were silent the same way. Second path: the Focus roll window (62-rules53) closes with
       value 0 (× / Escape) — the 0 became the hit location, so the damage landed on a phantom location "0" (nothing applied, "undefined"
       in the log, a NaN key left in victim.hp). FIX: every attack on a gladiator logs — a 0-damage strike says "… → misses X." (hurt
       wrapper); a human whose dice already missed is not asked where to strike (Focus! = the fastest finish, the Focus roll = the same
       three location dice + log line, the best of them — no window, the same on every screen); any non-location answer from the Focus
       windows falls back to the best location (the rolled dice for a roll). Saves show on screen for everyone: Fidelis and a Health Elixir
       get a floating word over the gladiator (Minerva, shields, armor already had one).
   2  Belts sit ON the chest armor and UNDER every limb piece (90-armfit armZ: belt −0.5); custom forge pieces join the same layer order
       (07-ui no longer draws them first, under everything — 90-armfit armWornSVG draws them).
   3  "Raise the Shield of Achilles?" printed the attack line as escaped HTML (03-engine hurt: esc(prefix) → prefix, our own HTML).
   4  Your turn begins → the fighter panel comes back to your own gladiator (S.boardPid cleared; online only on your own seat). BUS turn.begin.
   5  ⏭ To the end: no beast spawn cards (129 beastShow82) and no card pop-ups (#cardShow) while the event snaps, and none linger after the
       end (cleared when the snap starts and at event.over). S.cardsSeen still records every card.
   6  The pinned stands line #slogPin is gone (slogPinApply removes it). Spectator actions that touch a gladiator or the arena (stones,
       offerings, the Tholo chant, spears) stay in the arena log; seat switches and wagers are written only to the Stands log
       (16-crowd / 128-v82stands edits: log → slog).
   7  A human spectator with nothing to do (no stone, offering or Tholo chant affordable / in reach) gets NO upkeep window (offline; the first
       pick-a-favourite still asks). "🚶 Switch section · 3 CF" in the arena tools (#btnSec96) moves seats any time (once a rotation);
       the upkeep window, when it opens for a stone/offering/Tholo, still offers the switch.
   8  STONE CAP: at most STONE96 (3) stones HIT one gladiator in one turn (S.stone96 = {t:turnNo, h:{id:hits}}); further stones fly wide
       with a log line and roll no dice. Deterministic (state in S; same on every screen).
   9  FAST: a move (movePlayer / npcWalk) runs its steps with no waits and no in-between board draws — the piece jumps, one draw at the end
       of the action; no card pop-ups / beast cards at Fast (230 already drops bubbles). Slow / Normal unchanged; rules, log and dice unchanged.
   10 Weapon counters: chips read left / total (ammo, throws, shield uses with the absorb beside, uses before it breaks) wherever weaponChips
       shows a weapon (fighter panel, market, class cards), and a counter badge sits on the weapon card in the fighter panel (.wctr96).
   11 The Leather Tasset (legwrapsU) is no longer padding: it takes the upper leg alone like a thigh plate. armPad() (03-engine) = lower
       padding + belt; armorConflict, 111-onlcore armPlace (shared with the server — redeploy), 225 armory fit/replace and the try-on label
       use it. Manager fighters wearing a tasset under a hard upper-leg piece: the tasset goes back to the house shelf (arm94EnsureG wrapper).
   12 Carmina Fescennina: one window with the 3 verse cards, each card's verses a clickable column to its LEFT (runCarmina replaced; CPUs
       and the values sent are exactly as before). */

/* ---------------- 1 · every attack is logged ---------------- */
{const base=hurt;hurt=function(victim,location,damage,source,prefix){
  try{if(!(damage>0)&&prefix&&victim&&victim.cls&&victim.alive&&!victim.exited&&source&&(source.type==='player'||source.type==='npc'))
    log(_T`${prefix} → misses ${nm(victim)}.`)}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
{const base=chooseLocation;chooseLocation=async function(p,q,how,damage){
  const alive=q&&q.hp?LOCS.filter(l=>q.hp[l]>0):[];
  if(p&&!p.cpu&&alive.length&&!(damage>0)){ /* the hit dice already missed: nothing to aim, no window (the same rule on every screen) */
    if(how==='card')return bestLocation(q,alive,0);
    const rolls=[rollLoc(q),rollLoc(q),rollLoc(q)];
    log(_T`${nm(p)} focuses: the location die shows ${rolls.map(l=>LOCN[l]).join(', ')}.`);
    return bestLocation(q,[...new Set(rolls)],0)}
  const seen=[];const rl=rollLoc;rollLoc=function(){const l=rl.apply(this,arguments);seen.push(l);return l};
  let pr;try{pr=base.apply(this,arguments)}finally{rollLoc=rl}
  const v=await pr;
  if(LOCS.includes(v)&&q&&q.hp&&q.hp[v]>0)return v;
  /* × / Escape / a stale value: the best location the attacker could have picked (deterministic) */
  const opts=how==='card'?alive:[...new Set(seen)].filter(l=>q.hp[l]>0);
  return bestLocation(q,opts.length?opts:alive,damage||0)}}
/* saves show on screen */
{const base=defend;defend=async function(victim){const n0=victim&&victim.items?victim.items.filter(x=>x.kind==='card'&&x.key==='fidelis').length:0;
  const r=await base.apply(this,arguments);
  try{if(r>=0&&victim&&victim.items&&victim.items.filter(x=>x.kind==='card'&&x.key==='fidelis').length<n0)fx(victim.r,victim.c,_T('Fidelis: −1 die'),'#9fd3ff',{big:1})}catch(e){}
  return r}}
{const base=askCard;askCard=async function(p){const r=await base.apply(this,arguments);
  try{if(r&&/^elixir/.test(r)&&p&&p.r!=null)fx(p.r,p.c,_T('✚ Elixir'),'#7fe08a',{big:1})}catch(e){}return r}}

/* ---------------- 4 · your turn → your own gladiator in the panel ---------------- */
BUS.on('turn.begin',d=>{if(!S||!d||d.cpu||d.sim||S.boardPid==null)return;
  if(S.onl&&typeof ONLM!=='undefined'&&d.seat!==ONLM.me)return;
  S.boardPid=null});

/* ---------------- 5 + 9 · no card pop-ups while snapping (or at Fast), none left over ---------------- */
const noCards96=()=>!!(S&&(S.snap||(typeof SPEED!=='undefined'&&(SPEED==='snap'||SPEED==='fast'))));
function cardsClear96(){try{if(typeof BS82!=='undefined'){BS82.q.length=0;BS82.busy=false}const h=document.getElementById('bs82');if(h)h.innerHTML='';
  const c=document.getElementById('cardShow');if(c)c.innerHTML=''}catch(e){}}
{const base=cardShow;cardShow=function(ref,player){if(!HEADLESS&&noCards96()){try{if(S&&ref)(S.cardsSeen=S.cardsSeen||[]).push({ref,n:cardLabel(ref).replace(/ \(.*\)$/,''),by:player?player.name:''})}catch(e){}return}
  return base.apply(this,arguments)}}
if(typeof beastShow82==='function'){const base=beastShow82;beastShow82=function(){if(noCards96())return;return base.apply(this,arguments)}}
if(typeof simSnapShow==='function'){const base=simSnapShow;simSnapShow=function(){cardsClear96();return base.apply(this,arguments)}}
BUS.on('event.over',d=>{if(d&&d.sim)return;cardsClear96()});

/* ---------------- 6 · no pinned stands line ---------------- */
slogPinApply=function(){const li=document.getElementById('slogPin');if(li)li.remove()};

/* ---------------- 7 · upkeep only when there is something to do; the section switch in the arena tools ---------------- */
function spectCan96(me){if(!S||!me||me.gone)return false;const q=SECTIONS[me.sec].q;
  const inQ=activePlayers().filter(p=>!p.underground&&quadOf(p)===q);const foes=inQ.filter(p=>p.id!==me.fav);
  const tholoOK=!bossSpent(_T('Tholo'))&&!EV().noBoss&&!EV().noTholo&&[1,2,3,4].every(k=>S.spect.some(s=>!s.gone&&SECTIONS[s.sec].q===k&&s.cf>=3));
  return (foes.length&&me.cf>=2)||(inQ.length&&me.cf>=8)||tholoOK}
{const base=humanSpectatorTurn;humanSpectatorTurn=async function(me){
  try{if(S&&!S.onl&&!S.snap&&me&&me.human&&me.fav!==undefined&&!(typeof fell87==='function'&&fell87())&&!spectCan96(me))return}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
const SEC96={busy:false};
function sec96Me(){return S&&!S.onl&&!S.over&&S.phase!=='setup'&&!S.sim&&(S.spect||[]).find(s=>s.human&&!s.gone)||null}
function sec96Sync(){let b=document.getElementById('btnSec96');const box=document.getElementById('ctBody');if(!box)return;
  const me=sec96Me();if(!me){if(b)b.hidden=true;return}
  if(!b){b=document.createElement('button');b.type='button';b.className='btn';b.id='btnSec96';const z=document.getElementById('btnZoom');if(z)z.before(b);else box.appendChild(b)}
  const used=me._sec96===S.rotation;const lbl=_T`🚶 Switch section · ${cfAmt87(3)}`;if(b.innerHTML!==lbl)b.innerHTML=lbl;b.hidden=false;
  b.disabled=me.cf<3||used||SEC96.busy;b.title=used?_T('Once a rotation — you already moved this rotation.'):me.cf<3?_T('Not enough Crowd Favor (3 CF).'):_T('Move to another stand. Its gladiator earns 1 CF from you every turn.')}
BUS.on('render',()=>{try{sec96Sync()}catch(e){}});
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('#btnSec96');if(!b||b.disabled||SEC96.busy||CUR_MODAL)return;
  const me=sec96Me();if(!me||me.cf<3||typeof seatMapPick!=='function')return;SEC96.busy=true;sec96Sync();
  try{const G=S;const to=await seatMapPick(_T`Change section · ${cfAmt87(3)}`,_T`Pick a new stand. Its gladiator earns ${cfAmt87(1)} from you every turn.`,{disabled:i=>i===me.sec});
    if(to!=null&&G===S&&!S.over&&me.cf>=3){me.cf-=3;me.sec=to;me._sec96=S.rotation;slog(_T`You move to ${SECTIONS[to].n}.`);try{emote(me,'🚶','')}catch(e){}}}
  catch(err){console.error(err)}finally{SEC96.busy=false;try{render()}catch(e){}}});

/* ---------------- 8 · at most 3 stones hit one gladiator a turn ---------------- */
const STONE96=3; /* TWEAK: stones that may hit one gladiator in one turn */
{const base=spectStone;spectStone=async function(spect,target){
  let m=null;
  try{if(S&&target&&target.cls){const t=S.turnNo|0;m=S.stone96&&S.stone96.t===t?S.stone96:(S.stone96={t,h:{}});
    if((m.h[target.id]|0)>=STONE96){S.stonesThrown=(S.stonesThrown||0)+1;try{emote(spect,'🪨','')}catch(e){}
      const who=spect.human?_T('You hurl'):_T`${esc(spect.name)} (${SECTIONS[spect.sec].n}) hurls`;
      log(_T`${who} a stone at ${nm(target)} — it flies wide (${STONE96} stones have already struck this turn).`);
      slog(_T`<b>${esc(spect.name)}</b>'s stone flies wide of ${esc(target.name)}.`);return}}}catch(e){console.error(e)}
  const before=target?hpSumOf(target):0;
  const r=await base.apply(this,arguments);
  try{if(m&&target&&(hpSumOf(target)<before||!target.alive))m.h[target.id]=(m.h[target.id]|0)+1}catch(e){}
  return r}}

/* ---------------- 9 · Fast: pieces jump ---------------- */
const F96={batch:0,dirty:0,n:0};
const fast96=()=>!HEADLESS&&typeof SPEED!=='undefined'&&SPEED==='fast'&&!!S&&!S.sim&&!S.snap;
async function fast96Batch(fn){if(F96.batch||!fast96())return fn();
  F96.batch=1;F96.n++;const keep=SPEEDMUL.fast;SPEEDMUL.fast=0;
  try{return await fn()}finally{SPEEDMUL.fast=keep;F96.batch=0;if(F96.dirty){F96.dirty=0;try{draw()}catch(e){console.error(e)}}}}
{const base=movePlayer;movePlayer=function(){const a=arguments,t=this;return fast96Batch(()=>base.apply(t,a))}}
{const base=npcWalk;npcWalk=function(){const a=arguments,t=this;return fast96Batch(()=>base.apply(t,a))}}
{const base=draw;draw=function(){if(F96.batch&&!CUR_MODAL){F96.dirty=1;return}return base.apply(this,arguments)}}

/* ---------------- 10 · weapon counters ---------------- */
/* WCTR96.badge: set while the fighter panel's weapon rows are built — the counter sits on the card's badge there, not in the chips */
const WCTR96={badge:false};
const ctr96=(left,max)=>left==null||max==null?String(max??left??''):`${left}/${max}`;
weaponChips=function(w){const I=(k,v,t)=>`<span class="wchip wchip75" title="${esc(t)}"><img src="${WICO75[k]}" alt="">${v}</span>`;
  if(!w)return I('dmg','1',_T('Power (fists)'))+I('rng','1',_T('Range'));if(w.lyre)return '<span class="wchip">🎵 lyre</span>';if(w.noAtk)return '<span class="wchip">✋ held</span>';const c=[];
  if(w.p)c.push(I('dmg',w.p,_T('Attack power')));if(w.r)c.push(I('rng',w.r,_T('Range')));
  const nb=WCTR96.badge;
  if(w.ammo!=null&&!nb)c.push(I('ammo',ctr96(w.ammoLeft,w.ammo),_T('Ammo left')));
  if(w.throw)c.push(nb?I('thr',`${w.throw.p}·${w.throw.r}`,_T('Throw: power · range')):I('thr',`${w.throw.p}·${w.throw.r} ×${ctr96(w.throwsLeft,w.throw.n)}`,_T('Throw: power · range × throws left')));
  if(w.shield){c.push(I('abs',w.absorb,_T('Shield absorb per hit')));if(!nb)c.push(I('use',ctr96(w.usesLeft,w.uses),_T('Shield uses left')))}
  if(w.atkUses&&!nb)c.push(I('use',ctr96(w.atkLeft,w.atkUses),_T('Uses left before it breaks')));if(w.both)c.push(I('both','',_T('Both attacks')));
  if(w.cfw)c.push(I('cf','+'+w.cfw,_T('Crowd favor per hit')));if(w.soul)c.push(I('soul','+'+w.soul,_T('Soul steal')));return c.join('')};
/* the badge on the card: the counter that runs out (several when it has several) */
function wCtr96(w){if(!w||w.lyre||w.noAtk)return '';const o=[];
  if(w.shield&&w.uses!=null)o.push([_T('uses'),ctr96(w.usesLeft,w.uses),'use']);
  if(w.ammo!=null)o.push([_T('ammo'),ctr96(w.ammoLeft,w.ammo),'ammo']);
  if(w.throw)o.push([_T('throws'),ctr96(w.throwsLeft,w.throw.n),'thr']);
  if(w.atkUses)o.push([_T('uses'),ctr96(w.atkLeft,w.atkUses),'use']);
  if(!o.length)return '';
  return `<span class="wctr96" title="${esc(o.map(x=>x[0]+' '+x[1]).join(' · '))}">${o.map(x=>`<i><img src="${WICO75[x[2]]}" alt="">${x[1]}</i>`).join('')}</span>`}
if(typeof armsHTML==='function'){const base=armsHTML;armsHTML=function(p){let h;WCTR96.badge=true;try{h=base.apply(this,arguments)}finally{WCTR96.badge=false}
  try{const parts=h.split('<div class="wart">');if(parts.length===3){const ws=['R','L'].map(a=>armAlive(p,a)?p['w'+a]:null);h=parts[0]+'<div class="wart">'+wCtr96(ws[0])+parts[1]+'<div class="wart">'+wCtr96(ws[1])+parts[2]}}catch(e){console.error(e)}
  return h}}

/* ---------------- 11 · the tasset off the padding list (Manager shelves) ---------------- */
if(typeof arm94EnsureG==='function'){const base=arm94EnsureG;arm94EnsureG=function(w,g){let ch=base.apply(this,arguments);
  try{const E=g&&g.eq94;if(E&&Array.isArray(E.a)){const m=arm94M(w,E.h);if(m&&!m.dead)for(const P of E.a.slice()){const A=ARM[P.k];if(!A||!A.stack||armPad(A))continue;const L=arm94Locs(P);
      const clash=E.a.some(x=>x!==P&&ARM[x.k]&&!armPad(ARM[x.k])&&ARM[x.k].slot===A.slot&&ARM[x.k].pt===A.pt&&arm94Locs(x).some(l=>L.includes(l)));
      if(clash){E.a.splice(E.a.indexOf(P),1);arm94H(m).sh.push(P);ch=true}}}}catch(e){console.error(e)}
  return ch}}

/* ---------------- 12 · Carmina Fescennina: three cards, their verses beside them ---------------- */
function carm96HTML(avail){const imgs=[...new Set(CARMINA.map(c=>c.img))];
  return `<p class="rc-sub" style="margin:0 0 8px">${_T`Recite one unique verse for its reward, or opt out and forfeit it. Each verse can be claimed by only one gladiator.`}</p><div class="cm96">${imgs.map(im=>`<div class="cm96g"><div class="cm96v">${CARMINA.map((c,k)=>c.img!==im?'':`<button type="button" class="cm96b" data-cm96="${k}" ${avail.includes(k)?'':'disabled'}><b>${k+1}.</b> “${esc(c.v)}”<small>${avail.includes(k)?c.d:_T('already recited')}</small></button>`).join('')}</div><div class="cm96c">${cardHTML('x:'+im,'lg')}</div></div>`).join('')}</div>`}
runCarmina=async function(){
  log(_T('Carmina Fescennina: each gladiator recites one verse.'),'hd');
  const used=new Set();
  for(const p of S.players){
    const avail=CARMINA.map((c,i)=>i).filter(i=>!used.has(i));
    let i;
    if(p.cpu){const P=pers(p);const val=k=>({0:P.aggression,1:P.survival,2:P.survival,3:P.survival,4:P.aggression,5:(P.cf+P.coin)/2,6:P.aggression,7:P.coin,8:(P.coin+P.cf)/2,9:P.cf+10,10:P.coin,11:P.survival})[k]+rand()*30;i=avail.sort((a,b)=>val(b)-val(a))[0]}
    else i=await modal(_T`Carmina Fescennina · ${p.name}`,carm96HTML(avail),avail.map(k=>({label:`${k+1}. “${CARMINA[k].v.length>70?CARMINA[k].v.slice(0,68)+'…':CARMINA[k].v}”`,sub:CARMINA[k].d,value:k,style:'display:none'})).concat([{label:_T('Opt out'),value:-1}]),{xwide:1,
      onOpen:done=>{const box=document.getElementById('mBody');if(box)box.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cm96]');if(!b||b.disabled)return;done(+b.dataset.cm96)})}});
    if(i==null||i<0){log(_T`${nm(p)} declines to recite.`);continue}
    used.add(i);log(_T`${nm(p)} recites: “${CARMINA[i].v}” (${CARMINA[i].d}).`);think(p,'“'+CARMINA[i].v+'”','say');cardShow('x:'+CARMINA[i].img,p,_T('🎭 Recited'));await CARMINA[i].apply(p);
  }
  render()};

(()=>{const st=document.createElement('style');st.textContent=`
#ctBody #btnSec96[hidden]{display:none}
.warm .wart{position:relative}
.wctr96{position:absolute;right:-4px;bottom:-4px;display:flex;flex-direction:column;gap:1px;pointer-events:auto}
.wctr96 i{display:inline-flex;align-items:center;gap:1px;font:700 11px/1 var(--mono);font-style:normal;color:#fff;background:rgba(20,14,10,.88);border:1px solid var(--gold,#c9a458);border-radius:9px;padding:1px 4px 1px 2px;white-space:nowrap}
.wctr96 img{width:13px;height:13px;display:block}
.cm96{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:stretch}
.cm96g{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:stretch;border:1px solid var(--line,#4a3a2a);border-radius:8px;padding:6px;background:rgba(0,0,0,.18)}
.cm96v{display:flex;flex-direction:column;gap:5px;min-width:0}
.cm96b{flex:1 1 0;text-align:left;font:13px/1.3 inherit;color:var(--bone,#eadfc8);background:rgba(40,28,18,.9);border:1px solid var(--line,#5a4632);border-radius:6px;padding:6px 8px;cursor:pointer}
.cm96b small{display:block;color:var(--gold,#c9a458);margin-top:3px}
.cm96b:hover:not([disabled]),.cm96b:focus-visible{border-color:var(--gold,#c9a458);background:rgba(70,48,26,.95)}
.cm96b[disabled]{opacity:.45;cursor:default}
.cm96c{display:flex;align-items:center}.cm96c .cimg{width:150px;height:auto}
@media(max-width:1100px){.cm96{grid-template-columns:1fr}.cm96c .cimg{width:120px}}`;document.head.appendChild(st)})();
