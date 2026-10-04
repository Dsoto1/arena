/* =====================================================================
   129-v82beasts · v0.82 beast cards, custom beast spawn cards, deck beast slots, the spear scowl
   =====================================================================
   A · BEAST CARDS (his printed NPC cards, tools/art/npccards82, built by tools/art/npccards82/mk82.py):
       Tholo, Commodus, Leo, Leaena and Zora wear his fronts (assets/npccard82_<key>.webp, cropped to the gold border);
       every other beast (snakes, wolves, bears, custom beasts) gets a front from the same ACTIVE frame
       (assets/npcfront82.webp: art = its mini / token, name in stone lettering, the strip attack · range · eye if it
       hunts · move · HP). INFO side = his template (npcback82_3 / npcback82_1 for one-state beasts) filled live:
       name, Initial / Raged / Fazed rows from NPCT[t].states [minHP, atk, rng, mv, name], the HP where a state
       starts IN the black circle, rules text below. nc82Front / nc82Back / nc82Flip build the HTML (cqw-sized).
   B · SPAWN SHOW: every beast that enters (spawnNPC: card, chant, trigger, Gauntlet chain) rises art side up after the
       drawn card, flips to the info side, holds (SPEED scales it), shrinks into the Field tab's beast row.
       reduceMotion → both sides side by side, no flip. Clicking a beast on the board (a tile with no move on it), its
       row in the Field tab or in the Bestiary opens its card (#nc82pop; click flips, outside / Esc closes).
   C · CUSTOM BEASTS: ☐ Unique (n.unique82 → NPCT.unique82, UNIQUE_CARD82['cn_<id>'], bossSpent/spawnNPC guards: once an
       event, its card leaves the deck when placed or entered); behaviour states 1 or 3 (n.states + editable rows
       n.st82 [[minHP,atk,rng,mv]×3]); the two-sided card in the designer; an arena spawn card CARDS['spawn_cn_<id>']
       (type npc) that spawns by the grid dice (resolveDrawn wrapper → spawnNPC → freeGrid).
   D · ARENA DECK BEAST SLOTS: at most 4 beast spawn cards = Tholo + 3 slots (spawnLeo, spawnLeaena, spawnCommodus by
       default = the rulebook). A roster set may carry R.beasts82 [3 card keys] (Studio → Roster sets → "Arena deck beasts":
       printed or the set's own beasts); custom events carry e.slots82 {tholo, s:[4]} (Event Designer → Classes & NPCs;
       untick Tholo to free a 4th slot); old events' deckSpawns convert once (saved once). Applied in a newState
       wrapper by swapping cards in place (no reshuffle → the rulebook deck draws exactly as before). Event exclusions
       stay (no Tholo/Commodus where noBoss, no lions in the Orpheus deck); placed beasts use no slot; Zora is no slot;
       online (S.onl / cfg.onl) ignores all of it.
   E · SPEARING A SPECTATOR: Flavius scowls (angry, his spear lines) instead of laughing; every spearing that lands
       "refunds" the seat (a "−N coin" float off his box: 3 offline, the room's ticket price online); the spearer draws
       one EXTRA Mandata Flavi from the undealt rest (S.mfDeck82, seeded shuffle built at the first spearing).
   ===================================================================== */
const NC82_PRINTED={tholo:1,commodus:1,leo:1,leaena:1,zora:1};
const NC82_MINIS=['glykon','arenosus','valencia','moechus','ursa','brutum','leo','leaena','tholo','commodus','zora'];
const NC82_MINI_T={snake:'glykon',wolf:'valencia',bear:'ursa',lion:'leo',tholo:'tholo',commodus:'commodus',zora:'zora'};
const NC82_STATE_N=['Initial','Raged','Fazed'];
const SPEAR_LINES82=['My spectators are not targets!','Who pays for that seat now?'];
const SEAT_PRICE82=3;
function nc82Spec(t,key,name){const T=NPCT[t]||{n:String(t||'?'),hp:1,ap:1,mv:1};const rec=T.custom?(CUSTOM.npcs||[]).find(x=>x.id===T.cid)||null:null;
  return {t,T,key:key||name||'',name:name||(rec&&rec.name)||T.n,rec}}
function nc82Printed(sp){const t=sp.t;if(t==='tholo'||t==='commodus'||t==='zora')return t;
  if(t==='lion'){const k=String(sp.key||sp.name||'').toLowerCase();return k==='leaena'?'leaena':'leo'}return null}
function nc82Mini(sp){const k=String(sp.key||'').toLowerCase();return NC82_MINIS.includes(k)?k:NC82_MINI_T[sp.t]||null}
/* his medallion for the beast (rtok.webp), when it has one */
function nc82Med(sp){if(typeof RTOK_NAMES==='undefined')return '';const k=String(sp.key||'').toLowerCase();const nmx=RTOK_NAMES.includes(k)?k:RTOK_NAMES.includes(nc82Mini(sp))?nc82Mini(sp):'';if(!nmx)return '';
  const i=RTOK_NAMES.indexOf(nmx),c=i%RTOK_COLS,r=Math.floor(i/RTOK_COLS);
  return `<div class="med" style="background-image:url('${assetURL('rtok.webp')}');background-size:${RTOK_COLS*100}% ${RTOK_ROWS*100}%;background-position:${(c/(RTOK_COLS-1)*100).toFixed(3)}% ${(r/(RTOK_ROWS-1)*100).toFixed(3)}%"></div>`}
function nc82Behave(T){return T.scan?'Hunts the closest gladiator.':T.huntCF?'Hunts the gladiator with the most Crowd Favor.':'Guards its zone and attacks gladiators who come close.'}
function nc82Rules(sp){const T=sp.T,t=sp.t;const out=[];
  const card={tholo:'spawnTholo',commodus:'spawnCommodus',zora:'zora'}[t]||(t==='lion'?(nc82Printed(sp)==='leaena'?'spawnLeaena':'spawnLeo'):null);
  if(card&&CARDS[card])out.push(CARDS[card].d);
  else if(T.custom){out.push(nc82Behave(T));if(sp.rec&&sp.rec.lore)out.push(String(sp.rec.lore).slice(0,160))}
  else out.push(nc82Behave(T));
  const tags=[];const said=out.join(' ');if(T.fly)tags.push('Flies over pillars and units');if(t!=='zora'&&!/tamed/i.test(said))tags.push(T.tameable?'Can be tamed':'Cannot be tamed');
  if(T.unique82||['tholo','commodus'].includes(t)||(t==='lion'&&/^(leo|leaena)$/i.test(sp.key||'')))tags.push('Enters an event at most once');
  if(tags.length)out.push(tags.join(' · ')+'.');
  if(t!=='zora')out.push(`Slain: ${T.coin||0} coin · ${T.cf||0} CF.`);
  return out}
/* the ART side */
function nc82Front(sp){const pk=nc82Printed(sp);
  if(pk)return `<div class="nc82c" role="img" aria-label="${esc(sp.name)} — beast card"><img class="bg" src="${assetURL('npccard82_'+pk+'.webp')}" alt="" draggable="false"></div>`;
  const T=sp.T;let art='';
  if(sp.rec&&typeof figureSVG==='function'&&typeof tokenOfNpc==='function'){try{art=`<div class="fig">${figureSVG(tokenOfNpc(sp.rec),{w:'100%',h:'100%'})}</div>`}catch(e){art=''}}
  if(!art){const m=nc82Mini(sp);const med=nc82Med(sp);
    art=med||m?`${med}${m?`<img class="mini${med?' withmed':''}" src="${assetURL('mini_'+m+'.webp')}" alt="" draggable="false">`:''}`:`<div class="glyph" style="background:${esc(T.col||'#777')}">${esc(T.g||'?')}</div>`}
  const nmU=String(sp.name||'').toUpperCase();const fs=Math.min(9,9*10/Math.max(6,nmU.length)).toFixed(2);
  return `<div class="nc82c gen" role="img" aria-label="${esc(sp.name)} — beast card" style="--nc:${esc(T.col||'#777')}"><img class="bg" src="${assetURL('npcfront82.webp')}" alt="" draggable="false">
    <div class="win"></div><div class="art">${art}</div><div class="nm" style="font-size:${fs}cqw">${esc(nmU)}</div>
    <b class="sv s1">${T.states?T.states[0][1]:T.ap}</b><b class="sv s2">${T.rng||1}</b>${T.scan?'':'<i class="noeye"></i>'}<b class="sv s3">${T.states?T.states[0][3]:T.mv}</b><b class="sv s4">${T.hp}</b></div>`}
/* the INFO side */
function nc82Back(sp){const T=sp.T;const st=T.states&&T.states.length===3?T.states:null;
  const rows=st?st.map((s,i)=>({hp:i===0?T.hp:Math.max(0,st[i-1][0]-1),a:s[1],r:s[2],m:s[3]})):[{hp:T.hp,a:T.ap,r:T.rng||1,m:T.mv}]; /* the circle = the HP the state STARTS at, as printed (Tholo 20/14/5) */
  const Y=st?[32.15,38.7,45.6]:[32.15];
  const rr=rows.map((x,i)=>`<b class="v va" style="top:${Y[i]}%">${x.a}</b><b class="v vr" style="top:${Y[i]}%">${x.r}</b><b class="v vm" style="top:${Y[i]}%">${x.m}</b><b class="v vh" style="top:${Y[i]}%">${x.hp}</b>`).join('');
  const kind=typeof npcKind==='function'?npcKind(sp.t):T.n;
  return `<div class="nc82c back" role="img" aria-label="${esc(sp.name)} — behaviour"><img class="bg" src="${assetURL(st?'npcback82_3.webp':'npcback82_1.webp')}" alt="" draggable="false">
    <div class="ttl">${esc(sp.name)}</div><div class="kd">${kind&&kind!=='Unknown'?esc(kind)+' · ':''}${T.hp} HP</div>${rr}
    <div class="rules">${nc82Rules(sp).map(x=>`<p>${esc(x)}</p>`).join('')}</div></div>`}
function nc82Flip(sp,opt={}){return `<div class="nc82flip ${opt.flipped?'flipped':''} ${opt.cls||''}" data-nc82flip style="${opt.w?`width:${opt.w}px`:''}"><div class="in"><div class="face f">${nc82Front(sp)}</div><div class="face b">${nc82Back(sp)}</div></div></div>`}
function nc82Pair(sp,w){return `<div class="nc82pair">${`<div style="width:${w}px">${nc82Front(sp)}</div><div style="width:${w}px">${nc82Back(sp)}</div>`}</div>`}

/* ---------------- B · the spawn show ---------------- */
const BS82={q:[],busy:false};
function nc82Scale(){const b=document.body;if(b.classList.contains('phoneL')||b.classList.contains('phoneP2'))return .5;
  const w=innerWidth,h=innerHeight;if(w<=600||h<=520)return .5;if(w<=1100)return .75;return 1}
function nc82Ms(ms){return SPEED==='fast'?ms*.5:SPEED==='slow'?ms*1.6:ms}
function beastShow82(n){if(HEADLESS||!S||S.sim||!n)return;BS82.q.push({sp:nc82Spec(n.t,n.key,n.name),id:n.id});if(!BS82.busy)bs82Next()}
function bs82Next(){const job=BS82.q.shift();if(!job){BS82.busy=false;return}BS82.busy=true;
  let host=document.getElementById('bs82');if(!host){host=document.createElement('div');host.id='bs82';document.body.appendChild(host)}
  const w=Math.round(230*nc82Scale());const calm=typeof reduceMotion==='function'&&reduceMotion();
  const el=document.createElement('div');el.className='bs82card'+(calm?' calm':'');
  el.innerHTML=calm?nc82Pair(job.sp,w):nc82Flip(job.sp,{w});host.innerHTML='';host.appendChild(el);
  const T=(f,ms)=>setTimeout(()=>{try{f()}catch(e){console.error(e)}},ms);
  const lead=nc82Ms(650);
  T(()=>el.classList.add('in'),lead);
  if(calm){T(()=>el.classList.add('fade'),lead+nc82Ms(3400));T(()=>{el.remove();bs82Next()},lead+nc82Ms(3400)+500);return}
  const flipAt=lead+450+nc82Ms(900);T(()=>{const f=el.querySelector('.nc82flip');if(f)f.classList.add('flipped')},flipAt);
  const outAt=flipAt+700+nc82Ms(3000);
  T(()=>{const r0=el.getBoundingClientRect();const tg=bs82Target(job.id);
    if(tg){const r1=tg.getBoundingClientRect();const dx=(r1.left+r1.width/2)-(r0.left+r0.width/2),dy=(r1.top+r1.height/2)-(r0.top+r0.height/2);el.style.transform=`translate(-50%,-50%) translate(${dx}px,${dy}px) scale(.08)`}
    el.classList.add('out')},outAt);
  T(()=>{el.remove();bs82Next()},outAt+650)}
function bs82Target(id){const vis=e=>e&&e.offsetParent!==null&&e.getBoundingClientRect().width>0;
  const row=document.querySelector(`#npcPanel [data-nc82="${id}"]`);if(vis(row))return row;
  const p=document.getElementById('npcPanel');if(vis(p))return p;const tb=document.querySelector('[data-sidetab="field"]');return vis(tb)?tb:null}
/* the card on demand */
function nc82Open(t,key,name){if(HEADLESS||!NPCT[t])return;let pop=document.getElementById('nc82pop');if(pop)pop.remove();
  pop=document.createElement('div');pop.id='nc82pop';const w=Math.round(270*Math.max(.62,nc82Scale()));const calm=typeof reduceMotion==='function'&&reduceMotion();
  pop.innerHTML=`<div class="nc82popin">${calm?nc82Pair(nc82Spec(t,key,name),Math.round(w*.8)):nc82Flip(nc82Spec(t,key,name),{w})}<div class="rc-sub">${calm?'':'Click the card to turn it · '}Esc to close</div></div>`;
  document.body.appendChild(pop);if(!calm)setTimeout(()=>{const f=pop.querySelector('.nc82flip');if(f&&!f.dataset.touched)f.classList.add('flipped')},nc82Ms(700))}
document.addEventListener('click',e=>{const pop=document.getElementById('nc82pop');
  if(pop&&pop.contains(e.target)){const f=e.target.closest('.nc82flip');if(f){f.dataset.touched='1';f.classList.toggle('flipped')}else if(!e.target.closest('.nc82popin'))pop.remove();return}
  if(pop)pop.remove();
  const f=e.target.closest('.nc82flip.clickflip');if(f){f.classList.toggle('flipped');return}
  const row=e.target.closest('[data-nc82],[data-nc82k]');if(row&&S){if(row.dataset.nc82!=null){const n=(S.npcs||[]).find(x=>String(x.id)===row.dataset.nc82);if(n)nc82Open(n.t,n.key,n.name)}else{const [t,nmx]=row.dataset.nc82k.split('|');nc82Open(t,nmx,nmx)}return}
  const br=e.target.closest('#menagBody .brow');if(br){const nmx=(br.querySelector('.t b')||{}).textContent||'';const hit=nc82Bestiary(nmx);if(hit)nc82Open(hit[0],hit[1],nmx)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const p=document.getElementById('nc82pop');if(p){p.remove();e.stopPropagation()}}},true);
function nc82Bestiary(nmx){if(nmx==='Tholo')return ['tholo','Tholo'];
  for(const [k,t] of (typeof BEAST_ROLES!=='undefined'?BEAST_ROLES:[]))for(const c of Object.keys(CITY_BEASTS))if(CITY_BEASTS[c][k]===nmx)return [t,k];return null}
{const base=npcTrackerHTML;npcTrackerHTML=function(){let h=base.apply(this,arguments);try{if(!S)return h;let i=0;const N=S.npcs.length;
    const spawn=(isChariot()||isNaum())?[]:SPAWNABLE.filter(([nmx])=>!S.npcs.some(n=>n.name===nmx));
    h=h.replace(/<div class="npcrow/g,m=>{const k=i++;if(k<N)return `<div data-nc82="${S.npcs[k].id}" class="npcrow`;const s=spawn[k-N];return s?`<div data-nc82k="${s[1]}|${s[0]}" class="npcrow`:m})}catch(e){console.error(e)}return h}}
{const base=onTile;onTile=function(r,c){try{if(S&&!S.over&&typeof HL!=='undefined'&&!HL.get(r*N+c)){const n=(S.npcs||[]).find(x=>x.alive&&x.r===r&&x.c===c);if(n)nc82Open(n.t,n.key,n.name)}}catch(e){}return base.apply(this,arguments)}}

/* ---------------- C · custom beasts: unique, 1 or 3 states, their card, their spawn card ---------------- */
function st82Rows(n){const hp=clamp(+n.hp||1,1,60),ap=clamp(+n.ap||1,1,9),rng=clamp(+n.rng||1,1,5),mv=clamp(+n.mv||1,0,7);
  const def=[[Math.ceil(hp*.5),ap,rng,mv],[Math.ceil(hp*.2),ap+1,rng,Math.min(7,mv+1)],[0,Math.max(1,ap-1),1,1]];
  const R=Array.isArray(n.st82)&&n.st82.length===3?n.st82:def;
  let s0=clamp(Math.round(+R[0][0]||def[0][0]),2,Math.max(2,hp)),s1=clamp(Math.round(+R[1][0]||def[1][0]),1,Math.max(1,s0-1));
  return R.map((x,i)=>[i===0?s0:i===1?s1:0,clamp(+x[1]||1,1,9),clamp(+x[2]||1,1,5),clamp(+x[3]||0,0,7),NC82_STATE_N[i]])}
{const base=npcType;npcType=function(n){const T=base.apply(this,arguments);try{T.unique82=n.unique82?1:0;if(n.states&&(+n.hp||1)>=3)T.states=st82Rows(n);else if(n.states&&(+n.hp||1)<3)T.states=null}catch(e){console.error(e)}return T}}
function cn82Card(n){const T=NPCT['cn_'+n.id]||npcType(n);
  return {n:n.name,type:'npc',d:`${n.name} enters the arena: spawn it by the grid dice. ${nc82Behave(T)}${T.unique82?' Once per event.':''}`,img:null,cn:n.id}}
{const base=registerCustoms;registerCustoms=function(){const r=base.apply(this,arguments);try{
    for(const n of CUSTOM.npcs||[]){const k='spawn_cn_'+n.id;CARDS[k]=cn82Card(n);if(n.unique82)UNIQUE_CARD82['cn_'+n.id]=k;else delete UNIQUE_CARD82['cn_'+n.id]}}catch(e){console.error(e)}return r}}
{const base=bossSpent;bossSpent=function(key){if(typeof key==='string'&&key.startsWith('cn_'))return !!(S&&S.spawnedOnce&&S.spawnedOnce[key])||(S&&S.npcs||[]).some(n=>n.t===key);return base.apply(this,arguments)}}
{const base=spawnNPC;spawnNPC=function(target,name,at,extra={}){
  const T=NPCT[target];const tame=extra&&extra.tamedBy!=null;
  if(T&&T.unique82&&!tame&&String(target).startsWith('cn_')){if(bossSpent(target)){log(`${esc(name||T.n)} has already entered this event — the pens stay shut.`);return null}}
  const n=base.apply(this,arguments);
  try{if(n&&T&&T.unique82&&!tame){(S.spawnedOnce=S.spawnedOnce||{})[target]=1;uniqueOut82(target)}}catch(e){}
  try{if(n&&!HEADLESS&&S&&!S.sim&&S.phase!=='setup')beastShow82(n)}catch(e){console.error(e)}
  return n}}
{const base=resolveDrawn;resolveDrawn=async function(player,k){if(typeof k==='string'&&k.startsWith('spawn_cn_')){const C=CARDS[k];const t='cn_'+k.slice(9);
    cardShow('c:'+k,player,'🂠 Drawn');if(!C||!NPCT[t]){log(`${nm(player)} draws a beast card for a beast that is no longer in the pens.`);return}
    log(`${nm(player)} reveals <b>${esc(C.n)}</b>: ${esc(C.d)}`,'big');spawnNPC(t,C.n,null);draw();await sleep(400);return}
  return base.apply(this,arguments)}}
{const base=cardHTML;cardHTML=function(ref,size='md',extra=''){if(typeof ref==='string'&&ref.startsWith('c:spawn_cn_')){const t='cn_'+ref.slice(11);
    if(NPCT[t])return `<span class="cimg ${size} nc82arena" style="aspect-ratio:600/866" role="img" aria-label="${esc((CARDS[ref.slice(2)]||{}).n||'beast')} (arena card)" data-card="${ref}" ${extra}>${nc82Front(nc82Spec(t))}</span>`}
  return base.apply(this,arguments)}}
/* the designer: unique tick, 1 or 3 states (with their rows), the card */
{const base=npcEditorHTML;npcEditorHTML=function(){let h=base.apply(this,arguments);const n=ST.draft;if(!n)return h;try{
    const three=!!n.states;const rows=st82Rows(n);
    const tbl=three?`<table class="st82tbl"><tr><th></th><th title="the HP where this state starts">From HP</th><th>Attack</th><th>Range</th><th>Move</th></tr>${rows.map((x,i)=>`<tr><th>${x[4]}</th>${[0,1,2,3].map(j=>i===2&&j===0?'<td class="rc-sub">0</td>':`<td><input class="tin" type="number" data-st82="${i}.${j}" value="${x[j]}" min="${j===3?0:j===0?1:1}" max="${j===0?60:j===1?9:j===2?5:7}"></td>`).join('')}</tr>`).join('')}</table>`:'';
    const blk=`<div class="st82blk"><label class="st82sel">Behaviour states <select class="tin" data-st82="n"><option value="1" ${three?'':'selected'}>1 — one row (same all fight long)</option><option value="3" ${three?'selected':''}>3 — Initial · Raged · Fazed</option></select></label>${tbl}
      <label class="chk"><input type="checkbox" data-st82="unique" ${n.unique82?'checked':''}> Unique — enters an event at most once</label></div>
      <div class="nc82des"><div class="rc-sub">Its card · front and back</div>${nc82Pair(nc82Spec('cn_tmp82'),170)}</div>`;
    h=h.replace(/<label class="chk"><input type="checkbox" data-f="states"[^>]*>[^<]*<\/label>/,'');
    const i=h.indexOf('<p class="hint">Beasts attack with 2 hit dice');h=i<0?h+blk:h.slice(0,i)+blk+h.slice(i);
  }catch(e){console.error(e)}return h}}
/* the preview card reads the draft through a temporary NPCT entry */
{const base=npcEditorHTML;npcEditorHTML=function(){const n=ST.draft;try{if(n){const T=npcType(n);T.custom=true;T.cid='__draft82';NPCT.cn_tmp82=T}}catch(e){}
  const oldF=CUSTOM.npcs;let h;try{if(n){CUSTOM.npcs=[...(CUSTOM.npcs||[]).filter(x=>x.id!=='__draft82'),{...n,id:'__draft82'}]}h=base.apply(this,arguments)}finally{CUSTOM.npcs=oldF;delete NPCT.cn_tmp82}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.st82==null||typeof ST==='undefined'||!ST.draft||ST.tab!=='npcs')return;const d=ST.draft;const k=t.dataset.st82;
  if(k==='n'){d.states=t.value==='3';if(d.states&&!Array.isArray(d.st82))d.st82=st82Rows(d).map(x=>x.slice(0,4))}
  else if(k==='unique')d.unique82=t.checked;
  else{const [i,j]=k.split('.').map(Number);d.st82=st82Rows(d).map(x=>x.slice(0,4));d.st82[i][j]=+t.value;d.st82=st82Rows(d).map(x=>x.slice(0,4))}
  studioRedraw()},true);

/* ---------------- D · arena deck beast slots ---------------- */
const SLOT82_DEF=['spawnLeo','spawnLeaena','spawnCommodus'];
const SLOT82_PRINTED=[['spawnLeo','Leo'],['spawnLeaena','Leaena'],['spawnCommodus','Commodus']];
function slot82Excluded(ev,k){return (ev.noBoss&&(k==='spawnTholo'||k==='spawnCommodus'))||(ev.noTholo&&k==='spawnTholo')||(ev.kind==='orpheus'&&(k==='spawnLeo'||k==='spawnLeaena'))}
function slot82Name(k){if(!k)return '— empty —';const p=SLOT82_PRINTED.find(x=>x[0]===k);if(p)return p[1];return CARDS[k]?CARDS[k].n+' ✦':k}
/* the roster set in force: its 3 slots, or null (= the rulebook) */
function rosterSlots82(){try{const R=typeof rosterCur==='function'?rosterCur():null;if(!R||R.id==='classic'||R.id==='rolls')return null;
  const live=(CUSTOM.rosters||[]).find(x=>x.id===R.id);const b=(live&&live.beasts82)||R.beasts82;if(!Array.isArray(b))return null;
  const sel=new Set(((live||R).sel||{}).npcs||[]);
  return [0,1,2].map(i=>{const k=b[i]||'';if(!k||SLOT82_DEF.includes(k))return k;if(k.startsWith('spawn_cn_')&&CARDS[k]&&sel.has(k.slice(9)))return k;return SLOT82_DEF[i]})}catch(e){return null}}
function deckSlots82Apply(config){const ev=EV();if(!S||!ev||!ev.deck||!Array.isArray(S.deck))return;if((config&&config.onl)||S.onl)return;
  let pairs=null;
  if(ev.custom){if(ev.slots82)pairs=ev.slots82}
  else{const sl=rosterSlots82();if(sl)pairs=SLOT82_DEF.map((d,i)=>[d,sl[i]])}
  if(!pairs)return;
  for(const [d,t] of pairs){if(d===t)continue;const ok=!!(t&&CARDS[t]&&!slot82Excluded(ev,t));const i=S.deck.indexOf(d);
    if(i>=0){if(ok)S.deck[i]=t;else S.deck.splice(i,1)}
    else if(ok&&t.startsWith('spawn_cn_')){const bottom=S.deck[0]==='endgame'?1:0;S.deck.splice(bottom+rnd(S.deck.length-bottom+1),0,t)}}
  /* a unique card twice is one card */
  const uq=new Set(Object.values(UNIQUE_CARD82));const seen=new Set();
  for(let i=S.deck.length-1;i>=0;i--){const k=S.deck[i];if(!uq.has(k))continue;if(seen.has(k))S.deck.splice(i,1);else seen.add(k)}}
{const base=newState;newState=function(config){const r=base.apply(this,arguments);try{deckSlots82Apply(config)}catch(e){console.error(e)}return r}}
function deckBeasts82(D){return (D||[]).filter(k=>CARDS[k]&&CARDS[k].type==='npc'&&k!=='zora')}
/* roster sets carry their slots */
{const base=rosterSnap;rosterSnap=function(R){const o=base.apply(this,arguments);try{if(R&&Array.isArray(R.beasts82))o.beasts82=[...R.beasts82]}catch(e){}return o}}
function rs82RowHTML(d,ro){const sel=new Set((d.sel||{}).npcs||[]);const mine=(CUSTOM.npcs||[]).filter(n=>sel.has(n.id));const b=Array.isArray(d.beasts82)?d.beasts82:SLOT82_DEF;
  const opts=v=>[['','— empty —'],...SLOT82_PRINTED,...mine.map(n=>['spawn_cn_'+n.id,n.name+' ✦'])].map(([k,l])=>`<option value="${esc(k)}" ${k===(v||'')?'selected':''}>${esc(l)}</option>`).join('');
  return `<section class="rs77k rs82"><div class="rs77kh"><b>🃏 Arena deck beasts</b> <span class="rc-sub">${Array.isArray(d.beasts82)?'your slots':'the rulebook'} · at most 4 beast cards</span>${!ro&&Array.isArray(d.beasts82)?' <button type="button" class="btn tksm" data-rs82="reset">↺ Rulebook</button>':''}</div>
    <div class="slot82row"><span class="slot82 fix" title="Tholo stays in every deck (the rulebook removes him from Orpheus and the Juggernaut)">🔒 Tholo</span>${[0,1,2].map(i=>`<label class="slot82">Slot ${i+1}<select class="tin" data-rs82="${i}" ${ro?'disabled':''}>${opts(b[i])}</select></label>`).join('')}</div>
    ${mine.length||ro?'':'<div class="rc-sub">Put your own beasts in this set (🐾 Beasts above) to deal them a slot.</div>'}</section>`}
{const base=rosterStudioHTML;rosterStudioHTML=function(){let h=base.apply(this,arguments);try{const id=ST.rs77;const sysR=ROSTER_SYS.find(r=>r.id===id);
    if(sysR){const i=h.indexOf('<p class="rs77note">');if(i>=0)h=h.slice(0,i)+rs82RowHTML({},true)+h.slice(i)}
    else if(ST.rsd){const mine=(CUSTOM.rosters||[]).find(r=>r.id===ST.rsd.id);const i=h.indexOf('<input class="tin rs77q"');if(i>=0)h=h.slice(0,i)+rs82RowHTML(ST.rsd,!!(mine&&mine.locked))+h.slice(i)}
  }catch(e){console.error(e)}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.rs82==null||typeof ST==='undefined'||!ST.rsd)return;const d=ST.rsd;
  const b=Array.isArray(d.beasts82)?[...d.beasts82]:[...SLOT82_DEF];b[+t.dataset.rs82]=t.value;d.beasts82=b;studioRedraw()},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rs82="reset"],[data-rs="copy"]');if(!b||typeof ST==='undefined')return;
  if(b.dataset.rs82==='reset'){e.stopPropagation();if(ST.rsd)delete ST.rsd.beasts82;studioRedraw();return}
  const src=rosterById(b.dataset.v);if(src&&Array.isArray(src.beasts82))setTimeout(()=>{if(ST.rsd&&ST.rsd.id!==src.id&&!ST.rsd.beasts82){ST.rsd.beasts82=[...src.beasts82];studioRedraw()}},30)},true);
/* custom events: Tholo + 3 slots (Tholo removable → a 4th) */
function ed82Convert(e){if(!e||e.slots82)return false;const ds=e.deckSpawns||{};
  e.slots82={tholo:!!ds.Tholo,s:[ds.Leo?'spawnLeo':'',ds.Leaena?'spawnLeaena':'',ds.Commodus?'spawnCommodus':'','']};return true}
function ed82Sync(e){const s=e.slots82;if(!s)return;const all=[s.tholo?'spawnTholo':'',...s.s];e.deckSpawns=e.deckSpawns||{};
  e.deckSpawns.Leo=all.includes('spawnLeo');e.deckSpawns.Leaena=all.includes('spawnLeaena');e.deckSpawns.Commodus=all.includes('spawnCommodus');e.deckSpawns.Tholo=all.includes('spawnTholo');}
{const base=blankEvent;blankEvent=function(){const e=base.apply(this,arguments);e.slots82={tholo:true,s:[...SLOT82_DEF,'']};return e}}
{const base=eventDef;eventDef=function(e){const d=base.apply(this,arguments);try{if(e&&e.slots82){const s=e.slots82.s||[];
    d.noCards=(d.noCards||[]).filter(k=>!['spawnLeo','spawnLeaena','spawnCommodus','spawnTholo'].includes(k));
    d.slots82=[['spawnTholo',e.slots82.tholo?'spawnTholo':(s[3]||'')],['spawnLeo',s[0]||''],['spawnLeaena',s[1]||''],['spawnCommodus',s[2]||'']]}}catch(err){console.error(err)}return d}}
{const base=loadCustoms;loadCustoms=async function(){const r=await base.apply(this,arguments);try{let any=false;
    for(const e of CUSTOM.events||[])if(ed82Convert(e)){any=true;Store.put('customEvents',e.id,e).catch(()=>{})}
    if(any)for(const e of CUSTOM.events)EVENTS['ce_'+e.id]=Object.assign(eventDef(e),{trophy:e.trophy||null,sponsor:e.sponsor||null,nofates:!!e.nofates})}catch(e){console.error(e)}return r}}
function ed82HTML(e){ed82Convert(e);const s=e.slots82;const mine=CUSTOM.npcs||[];
  const opts=v=>[['','— empty —'],...SLOT82_PRINTED,...mine.map(n=>['spawn_cn_'+n.id,n.name+' ✦'])].map(([k,l])=>`<option value="${esc(k)}" ${k===(v||'')?'selected':''}>${esc(l)}</option>`).join('');
  const n=s.tholo?3:4;
  return `<h4>Arena deck beasts</h4><p class="hint" style="margin-top:0">At most 4 beast cards: Tholo + 3 slots. Untick Tholo to free his place. Beasts you place on the board use no slot.</p>
   <div class="slot82row"><label class="chk slot82 fix"><input type="checkbox" data-ed82="tholo" ${s.tholo?'checked':''}> Tholo</label>${Array.from({length:n},(_,i)=>`<label class="slot82">Slot ${i+1}<select class="tin" data-ed82="${i}">${opts(s.s[i])}</select></label>`).join('')}</div>
   <div class="chkgrid">${fChk('deckSpawns.Zora',!!(e.deckSpawns||{}).Zora,'Zora card stays in the deck')}</div>`}
{const base=edRosterHTML;edRosterHTML=function(){let h=base.apply(this,arguments);try{const e=ST.draft;if(e&&e.deck)h=h.replace(/<h4>Arena deck spawn cards<\/h4><div class="chkgrid">[\s\S]*?<\/label><\/div>/,ed82HTML(e))}catch(err){console.error(err)}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.ed82==null||typeof ST==='undefined'||!ST.draft||ST.tab!=='events')return;const d=ST.draft;ed82Convert(d);
  if(t.dataset.ed82==='tholo'){d.slots82.tholo=t.checked;if(t.checked)d.slots82.s[3]=''}else d.slots82.s[+t.dataset.ed82]=t.value;ed82Sync(d);studioRedraw()},true);

/* ---------------- E · spearing a spectator ---------------- */
{const base=flaviusReact;flaviusReact=function(kind,c={}){if(kind!=='spear')return base.apply(this,arguments);if(HEADLESS)return;
  flaviusMood('angry',3600,.8);if(FLAV.mood==='angry'){FLAV.line=upick(SPEAR_LINES82);FLAV.lineUntil=FLAV.until;try{draw()}catch(e){}}}}
{const base=payMandata;payMandata=async function(player,idx){try{if(S)(S.mfOut82=S.mfOut82||[]).push(idx)}catch(e){}return base.apply(this,arguments)}}
function mfDeck82(){if(!S)return [];if(Array.isArray(S.mfDeck82))return S.mfDeck82;const ev=EV();
  if(!(ev&&ev.mandata&&S.opts&&S.opts.mandata))return (S.mfDeck82=[]);
  const used=new Set();for(const q of S.players)for(const it of q.items||[])if(it&&it.kind==='mf')used.add(it.idx);
  for(const x of S.mfQ||[])used.add(x.idx);for(const i of S.mfOut82||[])used.add(i);
  return (S.mfDeck82=shuffle(MANDATA.map((_,i)=>i).filter(i=>!used.has(i))))}
function seatPrice82(){const o=S&&S.onl;const v=o?+(o.ticket||o.price||o.tix||0):0;return v>0?v:SEAT_PRICE82}
function flavPos82(){const cv=typeof ctx!=='undefined'&&ctx&&ctx.canvas;if(!cv||!FLAV.m82)return null;const r=cv.getBoundingClientRect();const k=r.width/cv.width;const p=FLAV.m82;return {x:r.left+p.x*k,y:r.top+p.y*k}}
{const base=drawFlavius;drawFlavius=function(){try{if(!HEADLESS&&S&&typeof ctx!=='undefined'){const a=iso(0,0);const w=TW*1.55,h=TW*1.2;
    const cx=STANDS?a.x:Math.max(w/2+8,a.x-TW*5.2),cy=STANDS?Math.max(h/2+6,a.y-TW*2.62-h/2):h/2+8;const M=ctx.getTransform();FLAV.m82={x:M.a*cx+M.c*(cy-h/2)+M.e,y:M.b*cx+M.d*(cy-h/2)+M.f}}}catch(e){}
  return base.apply(this,arguments)}}
function refundFloat82(n){if(HEADLESS||!S||S.sim)return;const p=flavPos82();const el=document.createElement('div');el.className='flref82';el.innerHTML=`−${n} ${ICO.coin}`;
  if(p){el.style.left=p.x+'px';el.style.top=p.y+'px'}else{el.style.left='80px';el.style.top='90px'}document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}
function spearAfter82(p,s){const n=seatPrice82();log(`Flavius scowls and refunds ${esc(s.name)}'s seat (−${n} coin).`);
  try{refundFloat82(n)}catch(e){}
  const D=mfDeck82();if(!D.length)return;const idx=D.pop();p.items.push({id:uid++,kind:'mf',idx});
  log(`${nm(p)} draws a Mandati Flavi (Mandate from Flavius).`,'big');try{if(!HEADLESS)render()}catch(e){}}
{const base=doSpear;doSpear=async function(p,s){const was=!!(s&&s.gone);const r=await base.apply(this,arguments);try{if(s&&s.gone&&!was)spearAfter82(p,s)}catch(e){console.error(e)}return r}}

/* ---------------- styles ---------------- */
{const st=document.createElement('style');st.textContent=`
.nc82c{position:relative;container-type:inline-size;aspect-ratio:600/866;width:100%;border-radius:3.5%/2.4%;overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.55);background:#1a120c;user-select:none}
.nc82c>.bg{position:absolute;inset:0;width:100%;height:100%;display:block}
.nc82c.gen .win{position:absolute;left:5%;right:5%;top:10.5%;bottom:21%;background:radial-gradient(ellipse at 50% 60%,color-mix(in srgb,var(--nc) 34%,transparent),transparent 70%)}
.nc82c.gen .art{position:absolute;left:12%;right:12%;top:11%;bottom:20%;display:grid;place-items:center}
.nc82c.gen .art .med{width:66cqw;aspect-ratio:1;border-radius:50%;box-shadow:0 1.6cqw 3.4cqw rgba(0,0,0,.55);margin-top:-8cqw}
.nc82c.gen .art .mini.withmed{position:absolute;bottom:1cqw;left:50%;transform:translateX(-50%);max-width:40cqw;max-height:30cqw}
.nc82c.gen .art .mini{max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 1.4cqw 1.6cqw rgba(0,0,0,.5))}
.nc82c.gen .art .fig{width:62cqw;height:96cqw;max-height:100%}.nc82c.gen .art .fig svg{width:100%;height:100%}
.nc82c.gen .art .glyph{width:46cqw;height:46cqw;border-radius:50%;display:grid;place-items:center;color:#fff6e6;font:400 26cqw "Marcellus SC",serif;box-shadow:0 2cqw 4cqw rgba(0,0,0,.45)}
.nc82c .nm{position:absolute;left:4%;right:4%;top:84.4%;transform:translateY(-50%);text-align:center;font-family:"Marcellus SC",Georgia,serif;letter-spacing:.06em;color:#e8e6e2;-webkit-text-stroke:.28cqw #3b3936;text-shadow:0 .5cqw 0 #6d6a66,0 1cqw 1.6cqw rgba(0,0,0,.65);white-space:nowrap}
.nc82c .sv{position:absolute;top:93.9%;transform:translate(-50%,-52%);font:400 8.2cqw "Marcellus SC",Georgia,serif;color:#5d5b58;-webkit-text-stroke:.18cqw #2e2c2a;text-shadow:0 .3cqw 0 #fff}
.nc82c .s1{left:17.2%}.nc82c .s2{left:35.2%}.nc82c .s3{left:70.6%}.nc82c .s4{left:90%}
.nc82c .noeye{position:absolute;left:45.6%;width:8.8%;top:91.4%;height:5.4%;background:linear-gradient(#d4cdb9,#e3dcc7 40%,#e2dbc6)}
.nc82c.back .ttl{position:absolute;left:8%;right:20%;top:12%;text-align:center;font:400 8.5cqw "Marcellus SC",Georgia,serif;color:#3a2614;line-height:1.05}
.nc82c.back .kd{position:absolute;left:8%;right:20%;top:21.5%;text-align:center;font:500 3.6cqw "Alegreya Sans",sans-serif;color:#6a4e30}
.nc82c.back .v{position:absolute;transform:translateY(-50%);font:400 6.6cqw "Marcellus SC",Georgia,serif;color:#2a1c10}
.nc82c.back .va{left:30.5%}.nc82c.back .vr{left:49.2%}.nc82c.back .vm{left:65.4%}
.nc82c.back .vh{left:87.1%;transform:translate(-50%,-50%);color:#fff;font-size:5.6cqw;text-shadow:0 0 .6cqw #000}
.nc82c.back .rules{text-align:left;position:absolute;left:8%;right:9%;top:51%;bottom:8%;overflow:hidden;font:500 4.3cqw/1.28 "Alegreya Sans",sans-serif;color:#3a2a18}
.nc82c.back .rules p{margin:0 0 2.4cqw;color:#3a2a18!important;font:inherit!important}
.nc82flip{perspective:1400px;display:inline-block;cursor:pointer}.nc82flip .in{position:relative;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.3,.7,.3,1)}
.nc82flip .face{backface-visibility:hidden;-webkit-backface-visibility:hidden}.nc82flip .face.b{position:absolute;inset:0;transform:rotateY(180deg)}
.nc82flip.flipped .in{transform:rotateY(180deg)}
.nc82pair{display:flex;gap:10px}
#bs82{position:fixed;left:0;top:0;width:0;height:0;z-index:60;pointer-events:none}
.bs82card{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) translateY(46vh) scale(.6);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.3,1),opacity .35s}
.bs82card.in{transform:translate(-50%,-50%);opacity:1}
.bs82card.out{transition:transform .6s cubic-bezier(.5,0,.8,.4),opacity .6s .1s;opacity:0}
.bs82card.calm{transition:opacity .4s;transform:translate(-50%,-50%)}.bs82card.calm.fade{opacity:0}
#nc82pop{position:fixed;inset:0;z-index:70;display:grid;place-items:center;background:rgba(10,6,3,.55)}
.nc82popin{display:grid;gap:8px;justify-items:center;text-align:center}
.nc82arena{position:relative;overflow:hidden}.nc82arena .nc82c{box-shadow:none}
.st82blk{display:grid;gap:6px;margin-top:8px}.st82sel{display:grid;gap:3px;max-width:340px}
.st82tbl{border-collapse:collapse;font-size:13px}.st82tbl th,.st82tbl td{padding:2px 4px;text-align:left}.st82tbl{width:auto}.st82tbl input{width:60px!important;min-width:0}
.nc82des{margin-top:10px;display:grid;gap:4px;justify-items:start}
.slot82row{display:flex;flex-wrap:wrap;gap:8px;align-items:end;margin:6px 0}.slot82{display:grid;gap:3px;font-size:12.5px}.slot82 select{min-width:140px}
.slot82.fix.chk{display:flex;gap:6px;align-items:center}.slot82.fix{padding:7px 10px;border:1px solid var(--gold,#c9a458);border-radius:6px;align-self:end}
.flref82{position:fixed;z-index:65;pointer-events:none;transform:translate(-50%,0);font:700 15px "Alegreya Sans",sans-serif;color:#ffb3a0;text-shadow:0 1px 3px #000;animation:flref82 2.4s ease-out forwards;display:flex;gap:3px;align-items:center}
.flref82 .ico{width:16px;height:16px}
@keyframes flref82{0%{opacity:0;transform:translate(-50%,0)}12%{opacity:1}100%{opacity:0;transform:translate(-50%,-46px)}}
body.calm .flref82{animation:none;opacity:1}`;document.head.appendChild(st)}
/* his note: the printed beasts' INFO side already exists — it is their arena-deck card (Tholo, Commodus, Leo, Leaena, Zora);
   their card flips to that printed card; the template back stays for every other beast */
const NC82_BACKCARD={tholo:'spawnTholo',commodus:'spawnCommodus',leo:'spawnLeo',leaena:'spawnLeaena',zora:'zora'};
{const base=nc82Back;nc82Back=function(sp){const pk=sp&&nc82Printed(sp);const k=pk&&NC82_BACKCARD[pk];
  if(k&&CARDS[k]&&typeof cardHTML==='function')return `<div class="nc82pback">${cardHTML('c:'+k,'xl')}</div>`;return base.apply(this,arguments)}}
{const st=document.createElement('style');st.textContent=`.nc82pback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1a120c;border-radius:6px;overflow:hidden}
.nc82pback .cimg{width:100%!important;border-radius:6px}`;document.head.appendChild(st)}
