/* 233-v96bar — v0.96 part C: THE ACTION BAR (his FINAL PICK 2026-10-08, tools/plans/mock96/mock4.html · mock96e_full.png · mock96f_rail.png).
   Display only: 07-ui render() still writes #actions exactly as before (every button with its data-act, handlers in 07-ui, the guide's glow,
   186/201/210 post-processing); a render wrapper (outermost — only 08-setup loads after this) then MOVES those same buttons into the new bar.
   Nothing is re-created: tests, the tutorial (TUT_PLAY '#actions') and the online lockstep (113 records trusted [data-act] clicks; replays click
   its own hidden twin on <body>) see the same buttons. Kill switch: localStorage flavius_bar96off=1 (the old dock).
   LAYOUT (desktop, today's height): a slim PHASE RAIL (whose turn + small face + "next: …" · Resolve · Choice · Action · End in the phase colours
   .ph-resolve teal / .ph-choice gold / .ph-action red / .ph-end grey: underline per segment, done ✓, current filled), then FIVE columns on the
   house's dark panels — material only on each group's header strip (subtle noise): ⚔ Attack (brass: one button per weapon + Focus centred
   below), 🏃 Move (wood: Move · Push · Topple · Tunnel), 🤝 Deal (parchment: Trade · Truce with a wax-seal dot, Loot, chest), 🏛 Market · Crowd
   (leather: Market, Crowd Favor) and END TURN (red, gold edge, 4 rivets, "Enter"). One-line buttons: a short cost beside the name, the full
   reason on hover (data-tip — the old <small> line, kept hidden in the button). A button the turn can't use is dimmed IN ITS PLACE (missing
   ones become disabled placeholders without data-act), so the bar never jumps. "Wager on yourself" left the bar (his call; the function stays).
   EXTRAS (all 8): (1) hovering a button previews on the board — weapon → targets in range, Move → reachable tiles, Push/Topple/Tunnel →
   usable tiles/pillars, Trade → partners; drawn in the 'highlights' layer from BAR96.pv (never S); Market's tip lists the affordable levels.
   (2) header pips — Move = orange movement pips (hovering a cost dims what it would spend), Attack = 2 sword pips. (3) "3 move · 2 attacks
   unused" on End turn. (4) hovering a DONE phase shows what happened in it this turn (this turn's log lines, tagged by a log wrapper in a
   WeakMap — S untouched). (5) whose turn + "next: <name>" with a small face at the left of the rail. (6) key hints: A (attack, cycles the
   weapons), P (push), Esc (back to Move — 220's), Enter (End turn, only when nothing has focus); M/T are taken (mute / stands hub).
   Keys are offline only (113 blocks keys online) and never in a lesson. (7) the guide's suggestion (29-guide sugglow — hints mode only,
   Ranked turns hints off) glows softly. (8) phones (phoneL / phoneP2 / phoneP, ≤620 px): the groups are one swipe row, End turn fixed right.
   Other turns: Choice = the two choice buttons in one gold group; CPU / Resolve / not-your-turn = the same bar greyed (placeholders). */
const BAR96={on:true,face:new Map(),pv:null,tag:new WeakMap(),mv0:{k:'',v:0},n:0};
try{BAR96.on=localStorage.getItem('flavius_bar96off')!=='1'}catch(e){}
const B96_ATK=new Set(['focus','none','zora','m-rete']),B96_MV=new Set(['m-move','m-push','m-topple','m-tunnel','chestup','chestdown','exit','leavedoor','mount','dismount']),
  B96_MK=new Set(['market','crowd']);
/* bar96Grp — which group an action button belongs to */
function bar96Grp(b){const k=b.dataset.act;if(!k)return 'dl';if(/^m-atk/.test(k)||B96_ATK.has(k))return 'atk';if(B96_MV.has(k))return 'mv';if(B96_MK.has(k))return 'mk';if(k==='end')return 'end';return 'dl'}
/* bar96Src — the attack source behind an m-atk button (arm R|L, T = throw) */
function bar96Src(p,k){try{const m=/^m-atk([RL])(T?)$/.exec(k||'');if(!m)return null;return attackSources(p).find(s=>s.arm===m[1]&&!!s.thr===(m[2]==='T'))||null}catch(e){return null}}
const b96Txt=h=>{const d=document.createElement('div');d.innerHTML=h||'';return (d.textContent||'').replace(/\s+/g,' ').trim()};
/* the log lines of this turn, by the phase they were written in (extra 4) */
{const base=log;log=function(html,cls){const r=base.apply(this,arguments);try{if(S&&S.logLines&&S.logLines.length){const L=S.logLines[S.logLines.length-1];if(L&&!BAR96.tag.has(L))BAR96.tag.set(L,S.phase==='command'?'resolve':S.phase)}}catch(e){}return r}}
function bar96PhaseTip(ph){try{const out=[];const L=S.logLines||[];for(let i=L.length-1;i>=0&&out.length<40;i--){const l=L[i];if(l.turn!==S.turnNo)break;
    if(l.cls==='hd'||!l.text)continue;if(BAR96.tag.get(l)===ph)out.unshift(l.text)}
  const cut=out.slice(-5).map(t=>esc(t.length>110?t.slice(0,107)+'…':t));
  if(!cut.length)return ph==='resolve'?_T('No beasts stirred.'):ph==='choice'?_T('Nothing noted.'):'';return cut.join('<br>')}catch(e){return ''}}
/* the next fighter to move (extra 5) */
function bar96Next(){try{const order=S.order&&S.order.length?S.order:S.players.map(q=>q.id);const pos=order.indexOf(S.cur);
  for(let i=1;i<=order.length;i++){const q=S.players[order[(pos+i)%order.length]];if(q&&q.alive&&!q.exited&&q.id!==S.cur)return q}}catch(e){}return null}
/* a small face, built once per fighter and moved back in after every render (no re-decode) */
function bar96Face(p){const k=p.id+'|'+p.cls;let el=BAR96.face.get(k);if(el)return el;el=document.createElement('span');el.className='f96';el.setAttribute('aria-hidden','true');
  try{el.innerHTML=typeof figureHTML==='function'?figureHTML(tokenForCls(p.cls),30):''}catch(e){}if(!el.innerHTML)el.textContent=(p.name||'?').charAt(0);BAR96.face.set(k,el);return el}
const B96_PH=[['resolve','p1'],['choice','p2'],['action','p3'],['end','p4']];
function bar96Rail(p){const ph=S.phase==='command'?'resolve':S.phase;const idx=B96_PH.findIndex(x=>x[0]===ph);
  const nm={resolve:_T('Resolve'),choice:_T('Choice'),action:_T('Action'),end:_T('End')};const ro=['I','II','III','IV'];const nx=bar96Next();
  const segs=B96_PH.map(([k,c],i)=>{const st=S.over||idx<0?'':i<idx?'done':i===idx?'now':'';const tip=st==='done'?bar96PhaseTip(k):'';
    return `<div class="ph96 ${c} ${st}" data-ph96="${k}" ${st==='now'?'aria-current="step"':''} ${tip?`data-tip="${esc(tip)}" tabindex="0"`:''}>${st==='now'?`<span class="ro96">${ro[i]} · </span>`:''}${nm[k]}</div>`}).join('');
  return `<div class="rail96" role="group" aria-label="${_T`Turn phases`}"><div class="who96" style="--pc:${p.color||'#c9a44a'}"><span class="fslot96"></span><b>${esc(p.name)}</b>${nx&&nx!==p?`<small>${_T`next: ${esc(nx.name)}`}</small>`:''}</div>${segs}</div>`}
/* header pips (extra 2) */
function bar96MvPips(p){const k=S.turnNo+':'+S.cur;if(BAR96.mv0.k!==k)BAR96.mv0={k,v:0};BAR96.mv0.v=Math.max(BAR96.mv0.v,p.mv||0);
  const tot=Math.min(10,Math.max(BAR96.mv0.v,p.mv||0));let h='';for(let i=0;i<tot;i++)h+=`<i class="pip96 ${i<(p.mv||0)?'on':''}" data-pi="${i}"></i>`;return h}
function bar96AtkPips(p){let arms=2,left=0;try{arms=Math.min(2,armsAttached(p).length);left=Math.max(0,Math.min(arms,armsAttached(p).length-(p.attacks||0)))}catch(e){}
  let h='';for(let i=0;i<arms;i++)h+=`<i class="sw96 ${i<left?'on':''}">🗡</i>`;return {h,left}}
/* dress96 — one real button: short label + cost, the old reason → data-tip (the <small> stays, hidden, for anything that reads it) */
let wpnKey96=0;
function bar96Dress(b,p){const k=b.dataset.act||'';const sm=b.querySelector('small');const reason=sm?sm.innerHTML:'';
  const cl=b.cloneNode(true);for(const s of cl.querySelectorAll('small'))s.remove();let label=(cl.innerHTML||'').replace(/\s+/g,' ').trim();
  let cost='',key='',spend=0;const src=/^m-atk/.test(k)?bar96Src(p,k):null;
  if(src){label=src.thr?_T`Throw ${esc(src.w.n)}`:esc(src.w.n);if(!wpnKey96){key='A';wpnKey96=1}}
  else if(k==='m-move'){label=_T('Move');cost=p.focusRoll?'':_T('diag 2')}
  else if(k==='m-push'){cost='2';key='P';spend=2}
  else if(k==='m-topple'){label=_T('Topple');cost='3';spend=3}
  else if(k==='m-tunnel'){cost=_T('1 key')}
  else if(k==='chest'){cost=_T('1 key')}
  else if(k==='chestup'){spend=1}
  else if(k==='focus'){label=_T('🎯 Focus');cost=p.focusRoll?_T('ON'):_T`${p.mv} mv`;spend=p.focusRoll?0:p.mv}
  else if(k==='market'){cost=p.market?_T('open'):'<span class=amt87><i class=ic87w></i>3</span>'}
  else if(k==='crowd'){cost=`<span class=amt87><i class=ic87w></i>${p.cf}</span>`}
  else if(k==='trade'){label=_T('Trade · Truce');b.classList.add('seal96')}
  else if(k==='end'){label=_T('End turn');key=_T('Enter')}
  let tip=b.title||reason;if(b.title){b.removeAttribute('title')}
  if(k==='market'){try{const lv=[1,2,3].filter(l=>purchaseCost(p,l)<=p.coin);tip+=(tip?'<br>':'')+(p.market?(lv.length?_T`Affordable now: level ${lv.join(', ')}`:_T('Nothing affordable right now')):_T`Opens for 3 CF; then level ${lv.length?lv.join(', '):'—'} fits your purse`)}catch(e){}}
  if(tip&&!b.dataset.tip)b.dataset.tip=tip;
  b.setAttribute('aria-label',b96Txt(label)+(tip?' — '+b96Txt(tip):''));if(spend)b.dataset.cost96=spend;
  b.innerHTML=`<span class="l96">${label}</span>${cost?`<i class="c96">${cost}</i>`:''}${key?`<kbd class="kb96" aria-hidden="true">${key}</kbd>`:''}${sm?`<small class="r96">${reason}</small>`:''}`;
  b.classList.add('b96');return b}
const b96Ph=(label,tip,cls='')=>`<button type="button" class="btn b96 ph96b ${cls}" disabled ${tip?`data-tip="${esc(tip)}"`:''}><span class="l96">${label}</span></button>`;
function bar96Group(id,mat,title,small,body){return `<div class="g96 ${mat}" data-g96="${id}" role="group" aria-label="${b96Txt(title)}"><div class="hd96"><i class="nz96"></i><span>${title}</span><small>${small}</small></div>${body}</div>`}
/* the five columns for a live Action phase (buttons = the moved originals) */
function bar96Grid(p,acts,idle){const all=acts?[...acts.querySelectorAll('button')]:[];wpnKey96=0;const by={atk:[],mv:[],dl:[],mk:[],end:[]};
  for(const b of all){if(b.dataset.act==='selfbet'){b.remove();continue}bar96Dress(b,p);by[bar96Grp(b)].push(b)}
  const T=document.createElement('template');const ch=typeof isChariot==='function'&&isChariot();
  const have=k=>all.some(b=>b.dataset.act===k);let srcs=[];try{srcs=attackSources(p)}catch(e){}
  /* attack */
  const ap=bar96AtkPips(p);const wpn=by.atk.filter(b=>b.dataset.act!=='focus');const foc=by.atk.find(b=>b.dataset.act==='focus');
  let atkPh='';if(!wpn.length){const ws=[p.wR,p.wL].map(w=>w?w.n:(typeof PUNCH!=='undefined'?PUNCH.n:_T('Fist')));atkPh=ws.map(n=>b96Ph(esc(n),idle?'':_T('No attacks left'))).join('')}
  const atkHd=`<span class="pips96" aria-label="${_T`${ap.left} attacks left`}">${ap.h}</span>`;
  const mvHd=`<span class="pips96 mv96" aria-label="${_T`${p.mv||0} movement left`}">${bar96MvPips(p)}</span><b class="n96">${p.mv||0}</b>`;
  const mvPh=ch?'':[['m-push',_T('Push'),_T('Nothing to push next to you')],['m-topple',_T('Topple'),_T('No pillar next to you')],['m-tunnel',_T('Tunnel'),_T('No tunnel exit, or no Arena Key')]].filter(([k])=>!have(k)).map(([k,l,t])=>b96Ph(l,idle?'':t,'ph-'+k)).join('');
  const dlNear=(()=>{try{return tradePartners(p).length}catch(e){return 0}})();
  const dlPh=(have('trade')?'':b96Ph(_T('Trade · Truce'),idle?'':_T('Nobody within 4 tiles'),'seal96'))+(have('loot')?'':b96Ph(_T('Loot'),idle?'':_T('Nothing to loot here')));
  const noMk=EV()&&EV().noMarket;const mkPh=(have('market')?'':b96Ph(_T('Market'),noMk?_T('No market in this event'):''))+(have('crowd')?'':b96Ph(_T('Crowd Favor'),''));
  const mkHd=`<span>${typeof coinAmt87==='function'?coinAmt87(p.coin):p.coin} · ${typeof cfAmt87==='function'?cfAmt87(p.cf):p.cf+' CF'}</span>`;
  T.innerHTML=`<div class="acts grid96 ${idle?'idle96':''}">${bar96Group('atk','brass',_T('⚔ Attack'),atkHd,`<div class="r96 w96"></div>${atkPh?`<div class="r96">${atkPh}</div>`:''}<div class="fc96"></div>`)}
    ${bar96Group('mv','wood',_T('🏃 Move'),mvHd,`<div class="r96 m96"></div>`)}
    ${bar96Group('dl','parch',_T('🤝 Deal'),dlNear?_T`${dlNear} near`:_T('none near'),`<div class="r96 d96"></div>`)}
    ${bar96Group('mk','leath',_T('🏛 Market · Crowd'),mkHd,`<div class="r96 k96"></div>`)}
    <div class="end96" data-g96="end"></div></div>`;
  const G=T.content.firstElementChild;const put=(sel,list,ph)=>{const box=G.querySelector(sel);for(const b of list)box.appendChild(b);if(ph)box.insertAdjacentHTML('beforeend',ph)};
  put('.w96',wpn,'');
  const fc=G.querySelector('.fc96');if(foc)fc.appendChild(foc);else if(!ch)fc.innerHTML=b96Ph(_T('🎯 Focus'),idle?'':_T('Focus: a PvP round, movement left and a gladiator in reach'));
  const order=['m-move','m-push','m-topple','m-tunnel'];by.mv.sort((a,b)=>{const x=order.indexOf(a.dataset.act),y=order.indexOf(b.dataset.act);return (x<0?9:x)-(y<0?9:y)});
  if(!by.mv.length&&!ch)G.querySelector('.m96').insertAdjacentHTML('beforeend',b96Ph(_T('Move'),''));
  put('.m96',by.mv,mvPh);
  const dOrd=['trade','loot'];by.dl.sort((a,b)=>{const x=dOrd.indexOf(a.dataset.act),y=dOrd.indexOf(b.dataset.act);return (x<0?9:x)-(y<0?9:y)});
  put('.d96',by.dl,dlPh);
  by.mk.sort((a,b)=>a.dataset.act==='market'?-1:1);put('.k96',by.mk,mkPh);
  const end=G.querySelector('.end96');const eb=by.end[0];
  if(eb){end.appendChild(eb);eb.classList.add('end96b');const u=bar96Unused(p,srcs);if(u)eb.insertAdjacentHTML('beforeend',`<span class="u96">${u}</span>`)}
  else end.innerHTML=`<button type="button" class="btn b96 ph96b end96b" disabled><span class="l96">${_T('End turn')}</span></button>`;
  return G}
/* "3 move · 2 attacks unused" (extra 3) */
function bar96Unused(p,srcs){const out=[];try{if(p.mv>0&&!p.focusRoll)out.push(_T`${p.mv} move`)}catch(e){}
  try{const n=Math.max(0,armsAttached(p).length-(p.attacks||0));if(n&&srcs&&srcs.length)out.push(_T`${Math.min(2,n)} attack${Math.min(2,n)===1?'':'s'}`)}catch(e){}
  return out.length?_T`${out.join(' · ')} unused`:''}
/* the bar for this render */
function bar96Apply(){const A=document.getElementById('actions');if(!A||!S||S.phase==='setup'||!S.players||!S.players.length)return;
  if(A.firstElementChild&&A.firstElementChild.classList.contains('rail96'))return; /* a deferred render (230): already built */
  const p=cur();if(!p)return;BAR96.n++;
  const pbar=A.querySelector(':scope > .phasebar');const acts=A.querySelector(':scope > .acts');
  const T=document.createElement('template');T.innerHTML=bar96Rail(p);const rail=T.content.firstElementChild;
  rail.querySelector('.fslot96').appendChild(bar96Face(p));
  if(pbar)pbar.replaceWith(rail);else A.prepend(rail);
  A.classList.add('bar96');A.classList.toggle('over96',!!S.over);
  if(S.over)return;
  const ph=S.phase;
  if(ph==='action'&&!p.cpu&&acts&&acts.querySelector('[data-act="end"]')){const G=bar96Grid(p,acts,false);acts.replaceWith(G);return}
  if(ph==='choice'&&!p.cpu&&acts){acts.classList.add('choice96');const T2=document.createElement('template');
    T2.innerHTML=`<div class="acts grid96 ch96">${bar96Group('ch','brass',_T('II · Choice'),_T('pick one'),'<div class="r96 c96"></div>')}<div class="end96" data-g96="end"><button type="button" class="btn b96 ph96b end96b" disabled><span class="l96">${_T('End turn')}</span></button></div></div>`;
    const G=T2.content.firstElementChild;const box=G.querySelector('.c96');for(const b of [...acts.querySelectorAll('button')]){bar96Dress(b,p);box.appendChild(b)}acts.replaceWith(G);return}
  if(acts){acts.classList.add('cmd96');return} /* command phase and anything else keep their own row */
  /* CPU / Resolve / not your turn: the same bar, greyed */
  const G=bar96Grid(p,null,true);rail.after(G)}
{const base=render;render=function(){const r=base.apply(this,arguments);try{if(BAR96.on&&!HEADLESS)bar96Apply()}catch(e){console.error(e)}return r}}

/* ---------- (1) hover preview on the board ---------- */
function bar96Tiles(p,k){const out=[];const add=(r,c)=>out.push([r,c]);
  try{if(k==='m-move'){if(p.focusRoll)return out;for(const [key,c] of reach(p).tiles)if(c>0&&c<=p.mv)add(Math.floor(key/N),key%N);return out}
    if(/^m-atk/.test(k)){const s=bar96Src(p,k);if(s){for(const t of targetsFor(p,s))add(t.r,t.c);if(!s.thr&&typeof shipTargets==='function')for(const t of shipTargets(p))add(t.r,t.c)}return out}
    if(k==='focus'){for(const s of attackSources(p))for(const t of targetsFor(p,s))if(t.kind==='player')add(t.r,t.c);return out}
    if(k==='m-push'){for(const t of pushTargets(p))add(t.r,t.c);return out}
    if(k==='m-topple'){for(const t of toppleTargets(p))add(t.r,t.c);return out}
    if(k==='m-tunnel'){for(const t of tunnelExits(p))add(t.r,t.c);return out}
    if(k==='trade'){for(const q of tradePartners(p))add(q.r,q.c);return out}}catch(e){}return out}
const B96_COL={'m-move':'#f0a040','m-push':'#f0d060','m-topple':'#f0d060','m-tunnel':'#6aa0e0',trade:'#e8cf98',focus:'#ff8a70'};
function bar96Preview(b){const k=b&&b.dataset.act;if(!k||!S||S.over||S.phase!=='action'||S.busy||!humanTurn()||document.body.classList.contains('onl-off'))return bar96PvClear();
  const p=cur();const mode=k.startsWith('m-')?k.slice(2):null;if(mode&&S.mode===mode)return bar96PvClear();
  const tiles=bar96Tiles(p,k);const pv=tiles.length?{S,turn:S.turnNo,k,tiles,col:B96_COL[k]||(/^m-atk/.test(k)?'#ff6a5a':'#f0cf7d')}:null;
  const same=BAR96.pv&&pv&&BAR96.pv.k===k&&BAR96.pv.turn===pv.turn;if(same)return;BAR96.pv=pv;try{draw()}catch(e){}}
function bar96PvClear(){if(!BAR96.pv)return;BAR96.pv=null;try{if(!HEADLESS)draw()}catch(e){}}
function bar96Paint(){const v=BAR96.pv;if(!v||v.S!==S||v.turn!==S.turnNo||S.over)return;ctx.save();
  for(const [r,c] of v.tiles){tilePath(r,c,3);ctx.globalAlpha=0.32;ctx.fillStyle=v.col;ctx.fill();ctx.globalAlpha=1;ctx.setLineDash([5,4]);ctx.lineWidth=2.5;ctx.strokeStyle=v.col;ctx.stroke()}
  ctx.restore()}
{const base=drawLayers93;drawLayers93=function(layers){if(BAR96.pv&&Array.isArray(layers))layers=layers.map(l=>l&&l[0]==='highlights'?[l[0],()=>{l[1]();try{bar96Paint()}catch(e){}}]:l);return base.call(this,layers)}}
/* (2) hovering a cost dims the pips it would spend */
function bar96Spend(n){const box=document.querySelector('#actions .mv96');if(!box)return;const on=[...box.querySelectorAll('.pip96.on')];
  on.forEach((x,i)=>x.classList.toggle('spend96',n>0&&i>=on.length-n))}
document.addEventListener('mouseover',e=>{if(!BAR96.on)return;const b=e.target.closest&&e.target.closest('#actions.bar96 .b96');if(!b)return;
  if(b.dataset.act)bar96Preview(b);else bar96PvClear();bar96Spend(b.disabled?0:+(b.dataset.cost96||0))});
document.addEventListener('mouseout',e=>{if(!BAR96.on)return;const b=e.target.closest&&e.target.closest('#actions.bar96 .b96');if(!b)return;
  const to=e.relatedTarget;if(to&&b.contains(to))return;bar96PvClear();bar96Spend(0)});
document.addEventListener('click',e=>{if(BAR96.pv&&e.target.closest&&e.target.closest('#actions [data-act]'))BAR96.pv=null},true);

/* ---------- (6) keys: A attack (cycles the weapons), P push, Enter End turn (Esc = Move is 220's) ---------- */
window.addEventListener('keydown',e=>{if(!BAR96.on||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
  const t=document.activeElement;if(t&&(['INPUT','SELECT','TEXTAREA'].includes(t.tagName)||t.isContentEditable))return;
  if(typeof CUR_MODAL!=='undefined'&&CUR_MODAL)return;const m=document.getElementById('modal');if(m&&!m.hidden)return;if(document.querySelector('.ask76bg'))return;
  if(typeof tutLive==='function'&&tutLive())return;if(!S||S.over||S.phase!=='action'||!humanTurn()||S.onl)return;
  const q=s=>document.querySelector(`#actions ${s}:not([disabled])`);const k=e.key;
  if(k==='a'||k==='A'){const L=[...document.querySelectorAll('#actions [data-act^="m-atk"]:not([disabled])')];if(!L.length)return;
    const i=L.findIndex(b=>b.classList.contains('on'));e.preventDefault();L[(i+1)%L.length].click()}
  else if(k==='p'||k==='P'){const b=q('[data-act="m-push"]');if(b){e.preventDefault();b.click()}}
  else if(k==='Enter'){if(t&&t!==document.body&&t!==document.documentElement)return;const b=q('[data-act="end"]');if(!b)return;e.preventDefault();
    const go=()=>{const n=q('[data-act="end"]');if(!n)return;const E=typeof END84!=='undefined'?END84:null;if(E)E.go=true;try{n.click()}finally{if(E)E.go=false}};
    let left='';try{if(SETTINGS.confirmEnd&&typeof endLeft84==='function')left=endLeft84(cur())}catch(err){}
    if(left&&typeof ask76==='function')ask76(_T('⏭ End your turn?'),_T`You still have ${left}.`,_T('End turn'),_T('Keep playing')).then(ok=>{if(ok)go()});else go()}});

/* ---------- the look ---------- */
(()=>{const st=document.createElement('style');st.textContent=`
#actions.bar96{padding:6px 10px}
#actions.bar96 .rail96{display:grid;grid-template-columns:minmax(0,auto) repeat(4,1fr);height:22px;margin-bottom:6px;border-radius:11px;background:#1c130c;border:1px solid #4a3620;overflow:hidden}
.rail96 .who96{display:flex;align-items:center;gap:5px;padding:0 9px 0 2px;font-size:11.5px;white-space:nowrap;border-right:1px solid #0008;max-width:230px;overflow:hidden;color:var(--bone,#efe2c8)}
.rail96 .who96 b{max-width:110px;overflow:hidden;text-overflow:ellipsis}.rail96 .who96 small{font:10px var(--mono);color:var(--muted);overflow:hidden;text-overflow:ellipsis}
.rail96 .f96{flex:0 0 18px;width:18px;height:18px;border-radius:50%;overflow:hidden;border:1.5px solid var(--pc);display:inline-flex;align-items:flex-start;justify-content:center;background:#2a1d13;font:bold 11px/16px var(--mono);color:var(--pc)}
.rail96 .f96 .tkfig{height:30px!important;width:18px!important;margin-top:-1px}
.ph96{display:flex;align-items:center;justify-content:center;gap:4px;font:11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--pc);opacity:.55;border-right:1px solid #00000060;box-shadow:inset 0 -2px 0 var(--pb);white-space:nowrap;overflow:hidden}
.ph96:last-child{border-right:0}.ph96.done{opacity:.85;cursor:help}.ph96.done::before{content:"✓"}
.ph96.now{opacity:1;font-weight:bold;color:#1a0f08;background:var(--pc);box-shadow:inset 0 0 0 1px var(--pb),0 0 10px var(--pb)}
.ph96.p1{--pc:#9fe0d8;--pb:#4f9a94}.ph96.p2{--pc:#f0cf7d;--pb:#c9a44a}.ph96.p3{--pc:#ffb3a3;--pb:#c8604c}.ph96.p4{--pc:#c9ccd6;--pb:#7d8290}
#actions .acts.grid96{display:grid;grid-template-columns:1fr 1.15fr .85fr 1.4fr 104px;gap:8px;min-height:0;flex-wrap:nowrap}
#actions .acts.grid96.ch96{grid-template-columns:1fr 108px}
#actions .grid96.idle96 .g96{opacity:.62;filter:saturate(.7)}
.g96{position:relative;border-radius:8px;padding:0 6px 5px;background:#2a1d13;border:1px solid #4e3a24;display:flex;flex-direction:column;gap:5px;overflow:hidden;min-width:0}
.g96 .hd96{position:relative;margin:0 -6px;padding:3px 8px;display:flex;justify-content:space-between;align-items:center;gap:6px;white-space:nowrap;font-size:13px;font-weight:bold;border-bottom:1px solid #00000060;overflow:hidden}
.g96 .hd96>span,.g96 .hd96>small{position:relative}
.g96 .hd96 small{display:flex;align-items:center;gap:4px;font-size:10.5px;font-weight:normal;letter-spacing:.05em;text-transform:uppercase;opacity:.9}
.g96 .hd96 small img{height:12px;vertical-align:-2px}
.g96 .nz96{position:absolute;inset:0;pointer-events:none;mix-blend-mode:overlay;opacity:.35;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E")}
.g96.brass .hd96{background:linear-gradient(#c9a456,#94702e);color:#24180a;text-shadow:0 1px 0 #f0d58a80}
.g96.wood .hd96{background:repeating-linear-gradient(0deg,#6e4120 0 3px,#7b4a26 3px 6px);color:#f3e2c2}
.g96.parch .hd96{background:linear-gradient(#e6cf9c,#c9a86c);color:#3a2410}
.g96.leath .hd96{background:linear-gradient(#743820,#55240f);color:#f4e2c4;box-shadow:inset 0 -3px 0 -2px #d9a77060}
.g96 .r96{display:grid;grid-template-columns:1fr 1fr;gap:5px}.g96.parch .r96{grid-template-columns:1fr}.g96 .r96:empty{display:none}
.g96 .fc96{display:flex;justify-content:center}.g96 .fc96:empty{display:none}.g96 .fc96 .btn{width:62%}
#actions .g96 .btn.b96{position:relative;display:flex;align-items:baseline;gap:4px;min-width:0;flex:none;border-radius:5px;padding:4px 7px;font-size:12.5px;line-height:1.15;background:#33241a;border:1px solid #5a4128;color:#efe2c8;white-space:nowrap;overflow:hidden;text-align:left}
#actions .g96 .btn.b96 .l96{overflow:hidden;text-overflow:ellipsis;min-width:0}
#actions .b96 .c96{font:10px var(--mono);font-style:normal;opacity:.72;white-space:nowrap}#actions .b96 .c96 img{height:11px;vertical-align:-1px}
#actions .b96 .kb96{margin-left:auto;font:9.5px var(--mono);padding:0 3px;border:1px solid #ffffff30;border-radius:3px;opacity:.55;line-height:13px}
#actions .b96 small.r96{display:none}
#actions .g96.brass .btn.b96{border-color:#8a6a36}#actions .g96.wood .btn.b96{border-color:#6e4a2a}#actions .g96.parch .btn.b96{border-color:#8a7450}#actions .g96.leath .btn.b96{border-color:#7a4a2e}
#actions .g96 .btn.b96:hover:not(:disabled){border-color:var(--gold);color:var(--gold2)}
#actions .g96 .btn.b96.on{border-color:#ffd77a;box-shadow:0 0 0 1px #ffd77a,0 0 8px #ffd77a60;color:#fff1cc}
#actions .g96 .btn.b96:disabled{opacity:.42}
#actions .b96.seal96 .l96::before{content:"";display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;vertical-align:-1px;background:radial-gradient(circle at 40% 35%,#d0423a,#7e1612)}
#actions .bar96 .sugglow,#actions.bar96 .sugglow{box-shadow:0 0 0 1px #f0cf7d,0 0 10px 2px rgba(240,207,125,.45)!important;border-color:#f0cf7d!important;animation:sug96 2.2s ease-in-out infinite}
@keyframes sug96{0%,100%{box-shadow:0 0 0 1px #f0cf7d,0 0 6px 1px rgba(240,207,125,.3)}50%{box-shadow:0 0 0 1px #f0cf7d,0 0 12px 3px rgba(240,207,125,.55)}}
body.calm #actions .sugglow,body.idle92 #actions .sugglow{animation:none!important}@media (prefers-reduced-motion:reduce){#actions .sugglow{animation:none!important}}
.pips96{display:inline-flex;gap:2px;align-items:center}.pip96{display:inline-block;width:6px;height:9px;border-radius:2px;background:#00000050;border:1px solid #f0a04060}
.pip96.on{background:#f0a040;border-color:#ffc070}.pip96.on.spend96{background:#6b4a24;border-color:#f0a04080;opacity:.55}
.mv96+.n96{color:#ffd77a}
.sw96{font-style:normal;font-size:11px;opacity:.3;filter:grayscale(1)}.sw96.on{opacity:1;filter:none}
.end96{display:flex;min-width:0}
#actions .end96 .btn.end96b{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;text-align:center;border-radius:8px;border:1px solid #d8b45a;color:#fff1d8;padding:6px 6px;white-space:nowrap;
 background:radial-gradient(circle at 6px 6px,#d8b45a 2px,transparent 2.6px),radial-gradient(circle at calc(100% - 6px) 6px,#d8b45a 2px,transparent 2.6px),radial-gradient(circle at 6px calc(100% - 6px),#d8b45a 2px,transparent 2.6px),radial-gradient(circle at calc(100% - 6px) calc(100% - 6px),#d8b45a 2px,transparent 2.6px),linear-gradient(#a8322a,#7a1b14);
 box-shadow:inset 0 0 0 2px #5a100a}
#actions .end96 .btn.end96b:hover:not(:disabled){filter:brightness(1.1);color:#fff}
#actions .end96 .btn.end96b .l96{font-size:16px;font-weight:bold}#actions .end96 .kb96{margin:0;opacity:.75;border-color:#ffffff40}
#actions .end96 .u96{font:9.5px var(--mono);opacity:.85;white-space:normal;line-height:1.15;color:#ffd9c8}
#actions .end96 .btn.end96b:disabled{opacity:.45}
#actions .end96 .btn.end96b.heartbeat{box-shadow:inset 0 0 0 2px #5a100a,0 0 0 2px var(--gold),0 0 14px rgba(240,207,125,.5)}
#actions.bar96 .acts.cmd96 .btn{flex:1 1 150px}
#actions.bar96 > .hint{margin:4px 0 0;font-size:12px;line-height:1.35}
@media (hover:none),(max-width:1180px){#actions .g96 .b96 .kb96{display:none}}
body.phoneL #actions .acts.grid96,body.phoneP2 #actions .acts.grid96,body.phoneP #actions .acts.grid96{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x proximity;gap:6px;min-height:0;padding-bottom:3px;-webkit-overflow-scrolling:touch}
body.phoneL #actions .grid96 .g96,body.phoneP2 #actions .grid96 .g96,body.phoneP #actions .grid96 .g96{flex:0 0 auto;width:200px;scroll-snap-align:start}
body.phoneL #actions .grid96 .end96,body.phoneP2 #actions .grid96 .end96,body.phoneP #actions .grid96 .end96{position:sticky;right:0;flex:0 0 86px;z-index:3;background:var(--panel,#1c140e);padding-left:4px;box-shadow:-8px 0 12px rgba(0,0,0,.5)}
body.phoneL #actions .end96 [data-act="end"],body.phoneP2 #actions .end96 [data-act="end"],body.phoneP #actions .end96 [data-act="end"]{position:relative;bottom:auto}
body.phoneL #actions .rail96 .who96 b,body.phoneL #actions .rail96 .who96 small,body.phoneP2 #actions .rail96 .who96 b,body.phoneP2 #actions .rail96 .who96 small,body.phoneP #actions .rail96 .who96 b,body.phoneP #actions .rail96 .who96 small,body.phoneL #actions .ro96,body.phoneP2 #actions .ro96,body.phoneP #actions .ro96{display:none}
body.phoneL #actions .ph96,body.phoneP2 #actions .ph96,body.phoneP #actions .ph96{font-size:9.5px;letter-spacing:.02em}
body.phoneL #actions .g96 .btn.b96,body.phoneP2 #actions .g96 .btn.b96,body.phoneP #actions .g96 .btn.b96{min-height:36px;align-items:center}
@media (max-width:620px){#actions .acts.grid96{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x proximity;gap:6px;min-height:0;padding-bottom:3px}
 #actions .grid96 .g96{flex:0 0 auto;width:200px;scroll-snap-align:start}
 #actions .grid96 .end96{position:sticky;right:0;flex:0 0 86px;z-index:3;background:var(--panel,#1c140e);padding-left:4px;box-shadow:-8px 0 12px rgba(0,0,0,.5)}
 #actions .end96 [data-act="end"]{position:relative;bottom:auto}
 #actions .rail96 .who96 small,#actions .rail96 .who96 b,#actions .ro96{display:none}#actions .ph96{font-size:9.5px;letter-spacing:.02em}#actions .g96 .btn.b96{min-height:36px;align-items:center}}`;document.head.appendChild(st)})();
