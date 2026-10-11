/* 248-v98bar — v0.98 part C: ACTION BAR v2 + THE FOCUS DIGITAL RULE (his approved mock tools/plans/mock98/actionbar2.html, bar2_*.png).
   1 · ACTION BAR v2 (display only). 233-v96bar still builds its five-column bar from 07-ui's own buttons and 236 still post-processes it; this
       module's render wrapper (outermost — only 08-setup loads later) then MOVES those same nodes into the v2 layout: ONE plate (rail + tray),
       Move · Attack · Forum · End turn with a shared header height and button height. Nothing new is clicked: every button keeps its data-act and
       07-ui handler, so the online lockstep (113 records trusted [data-act] clicks) and the tutorial see the same acts.
       • MOVE (wood): Move · Push / Topple · Tunnel (+ chest, exit, mount… rows), orange movement pips in the header.
       • ATTACK (brass): one larger button per equipped weapon (icon, name, power + range icons, key A on the first). Docked on its right: a small ◎
         Focus button = the ONE focus act (07-ui's toggle). The first weapon's dock holds 07-ui's own button; the others hold copies with the
         same data-act="focus" (same act, same handler); a click remembers its weapon (data-w98) and, once focus is on, points the attack mode at
         that weapon (a local m- mode, never recorded — the tile input carries mode + focus). While focus is on, the other docks switch the weapon
         without toggling. Throwable weapons get a small ↗ Throw = 07-ui's own m-atk?T button, moved and restyled.
       • FORUM (parchment → leather strip): Market + Crowd Favor on top (row keeps .k96 so 236's No-CF labels/tips stay), Loot + Trade · Truce below,
         coin · CF in the header.
       • CHOICE phase: one centred gold "✦ Choose one" group (Take 2 coin / Draw an arena card, larger text, keys 1 / 2).
       • CPU / Resolve / not your turn: the same plate, greyed (233's placeholders moved).
       Extras of 233 keep working (hover previews, pips + spend dimming, unused line, done-phase tips, whose turn + next, key hints A/P/Enter,
       the guide's glow, phones: one swipe row with End turn fixed right; the weapon's power·range hides on phones and a long-press shows it).
       Kill switch: localStorage flavius_bar98off=1 → 233's bar (flavius_bar96off=1 → the old dock, which also skips v2).
   2 · FOCUS — DIGITAL RULE (his v0.95 note): players only (beasts never Focus — they have no focus path); Focus needs at least FOCUS98.min (3)
       movement and spends ALL that is left — walk 2 of 5, then Focus with the last 3. Below 3 the button is refused with the reason; the engine
       (doAttack wrapper, every client + CPUs) ignores a focus flag below 3, so lockstep stays consistent; a focus flag left on after Push/Topple
       took movement below 3 is cleared when that action ends (act wrapper). CPUs: 06-ai asks for mv ≥ FOCUS98.min.
       BLESSINGS (rule B, his call 2026-10-08 — FOCUS98.bless, default ON; a digital rule): with Focus on, a RANGED or THROWN weapon may also
       target a pillar's Blessings pot in range + line of sight (targetsFor wrapper — today pots are melee-only, adjacent, never thrown); a focused
       attack on a pot deals +1 damage when it hits (statDmgB +1 for that one attack), so a power-1 weapon can snap the chains; the pot falls one
       tile toward the shooter as today (breakPot); a throw spends a throw like any other (the weapon lands by today's thrown rule: a pillar tile
       → at the thrower's feet). Melee pot attacks without Focus are unchanged. Like the Focus button itself, this lives in PvP rounds (07-ui shows
       Focus only there). CPUs: Veteran and Master minds (aiTier ≥ 3) only, only when the focused pot scores higher than their best attack
       (focus98CpuPot, called from 06-ai). Engine only → every client computes the same (online-safe). */
const FOCUS98={min:3,bless:true,cur:null,aim:null};
const BAR98={on:true,lp:null};
try{BAR98.on=localStorage.getItem('flavius_bar98off')!=='1'}catch(e){}

/* ---------------- 2 · the Focus rule (engine) ---------------- */
/* the extra pots a focused ranged / thrown attack may reach */
function focus98Aiming(player){return !!(FOCUS98.bless&&player&&(player.focusRoll||FOCUS98.aim===player)&&(player.mv||0)>=FOCUS98.min)}
{const base=targetsFor;targetsFor=function(player,source){const res=base.apply(this,arguments);try{
  if(!focus98Aiming(player)||!source||!S||!S.pillars||(typeof isChariot==='function'&&isChariot()))return res;
  let rng=srcRange(source);if(swimming(player))rng--;if(!source.thr&&rng<=1)return res;
  const have=new Set(res.map(t=>t.key));
  for(const pl of S.pillars)if(pl.pots&&pl.pots.length&&!have.has('b'+pl.id)&&!player.hitTargets.has('b'+pl.id)&&cheb(player,pl)<=rng&&los(player,pl))res.push({kind:'pot',ref:pl,key:'b'+pl.id,r:pl.r,c:pl.c,f98:1})}catch(e){}return res}}
{const base=doAttack;doAttack=async function(player,source,target,opt){let o=opt;
  if(o&&o.focusRoll&&player&&(player.mv||0)<FOCUS98.min)o=Object.assign({},o,{focusRoll:false});
  const bl=!!(FOCUS98.bless&&o&&o.focusRoll&&player&&target&&target.kind==='pot');
  if(!bl)return base.call(this,player,source,target,o);
  const prev=FOCUS98.cur;FOCUS98.cur=player;try{return await base.call(this,player,source,target,o)}finally{FOCUS98.cur=prev}}}
/* CPUs (06-ai): a Veteran or Master mind with 3+ movement takes a focused shot at a pot only when it beats its best attack */
function focus98CpuPot(player,best){if(!FOCUS98.bless||!player||!player.cpu||(player.mv||0)<FOCUS98.min||player.hesitant)return null;
  try{if(!RD().pvp||(typeof aiTier==='function'?aiTier(player):2)<3||(typeof isChariot==='function'&&isChariot()))return null}catch(e){return null}
  let top=null;const pa=FOCUS98.aim,pc=FOCUS98.cur;
  try{for(const src of attackSources(player)){FOCUS98.aim=player;const ts=targetsFor(player,src).filter(t=>t.f98);FOCUS98.aim=pa;
      for(const t of ts){FOCUS98.cur=player;const s=cpuScoreAttack(player,src,t);FOCUS98.cur=pc;if(s>0&&(!top||s>top.s))top={s,src,t}}}}
  catch(e){}finally{FOCUS98.aim=pa;FOCUS98.cur=pc}
  return top&&(!best||top.s>best.s)?top:null}
{const base=statDmgB;statDmgB=function(p){const b=base.apply(this,arguments);return FOCUS98.cur&&p===FOCUS98.cur?b+1:b}}
/* a focus flag left on after another action took the movement below the minimum is cleared (same call on every client) */
{const base=act;act=async function(fn){const p=S&&S.players?cur():null;try{return await base.apply(this,arguments)}finally{try{if(p&&p.focusRoll&&(p.mv||0)<FOCUS98.min)p.focusRoll=false}catch(e){}}}}
function focus98Why(p){return _T`Focus needs at least ${FOCUS98.min} movement and spends all you have left (digital rule). You have ${p.mv||0}.`}
/* the focus button in #actions: refused below the minimum (works under v2, 233 and the old dock) */
function focus98Gate(){try{if(!S||!S.players||S.phase!=='action'||S.over)return;const p=cur();if(!p||p.cpu)return;
  for(const b of document.querySelectorAll('#actions [data-act="focus"]')){
    if(!p.focusRoll&&(p.mv||0)<FOCUS98.min){b.disabled=true;b.classList.add('ref98');const why=focus98Why(p);b.dataset.tip=why;b.removeAttribute('title');
      const sm=b.querySelector('small');if(sm)sm.textContent=_T`needs ${FOCUS98.min}+ movement`;b.setAttribute('aria-label',_T('Focus')+' — '+why)}
    else if(!p.focusRoll&&FOCUS98.bless&&b.disabled&&!S.busy){const pa=FOCUS98.aim;try{FOCUS98.aim=p;if(attackSources(p).some(s=>targetsFor(p,s).some(t=>t.f98))){b.disabled=false;b.dataset.tip=_T('Focus: a ranged or thrown shot may now reach a Blessings pot (+1 damage on a hit)')}}catch(e){}finally{FOCUS98.aim=pa}}}}catch(e){}}
try{RULE_ACT.focus=_T`Focus roll (digital rule): needs at least 3 movement and spends ALL you have left — walk first, then Focus with the rest. The location die is rolled three times; you pick where the blow lands. With Focus a ranged or thrown weapon may also hit a pillar's Blessings pot in range, +1 damage on a hit. Players only.`}catch(e){}

/* ---------------- 1 · the bar ---------------- */
const b98Ico=(src)=>{try{const w=src.w;const k=w.shield?'abs':src.thr?'thr':w.ammo!=null?'ammo':'dmg';return wIco87(k)}catch(e){return ''}};
const b98Stats=(src)=>{try{return _T`Attack power ${srcPow(src)} · Range ${srcRange(src)}`}catch(e){return ''}};
/* the face shows his icons (attack power, range) instead of words */
const b98StatsIco=(src)=>{try{return `<span class=sv98>${wIco87('dmg')}${srcPow(src)}</span><span class=sd98>·</span><span class=sv98>${wIco87('rng')}${srcRange(src)}</span>`}catch(e){return ''}};
const B98_FOC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.6"/><circle cx="12" cy="12" r=".9" fill="currentColor"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" stroke-linecap="round"/></svg>';
/* the weapon a button attacks with (arm R|L, thrown or not) */
function b98Src(p,k){try{const m=/^m-atk([RL])(T?)$/.exec(k||'');if(!m)return null;return attackSources(p).find(s=>s.arm===m[1]&&!!s.thr===(m[2]==='T'))||null}catch(e){return null}}
/* a weapon button's face: icon · name · power icon · range icon · key (the hidden reason <small> stays) */
function b98Face(b,src,key){const sm=b.querySelector('small.r96');const kb=b.querySelector('.kb96');const k=key||(kb?kb.textContent:'');
  const name=src.thr?_T`Throw ${esc(src.w.n)}`:esc(src.w.n);const st=b98Stats(src);
  b.innerHTML=`<span class="l96">${name}</span><i class="c96 st98" aria-hidden="true">${b98StatsIco(src)}</i>${k?`<kbd class="kb96" aria-hidden="true">${k}</kbd>`:''}`;
  if(sm)b.appendChild(sm);b.dataset.st98=b96Txt(name)+' — '+st;b.dataset.lp98=name+' — '+b98StatsIco(src);const tip=b.dataset.tip||'';if(tip.indexOf(st)<0)b.dataset.tip=st+(tip?'<br>'+tip:'');
  b.setAttribute('aria-label',b96Txt(name)+' — '+st+(tip?' — '+b96Txt(tip):''));b.classList.add('wb98')}
const b98Btn=(cls,inner,tip,extra='')=>`<button type="button" class="btn b96 ph96b ${cls}" disabled ${tip?`data-tip="${esc(tip)}"`:''} ${extra}>${inner}</button>`;
/* one weapon row: [weapon][◎ focus][↗ throw] */
function b98WpnRow(main,foc,thr){const r=document.createElement('div');r.className='wpn98'+(thr?' thr98':'')+(main.classList.contains('on')||thr&&thr.classList.contains('on')?' on':'')+(main.disabled?' used98':'');
  r.appendChild(main);const d=document.createElement('div');d.className='dock98';if(foc)d.appendChild(foc);if(thr)d.appendChild(thr);r.appendChild(d);return r}
/* the Attack block: weapons from 233's moved buttons (or greyed stand-ins) */
function b98Attack(p,G96,idle){const box=document.createElement('div');box.className='bd98 w96';
  const live=[...G96.querySelectorAll('[data-g96="atk"] [data-act^="m-atk"]')];const F=G96.querySelector('[data-g96="atk"] [data-act="focus"]');
  const extra=[...G96.querySelectorAll('[data-g96="atk"] [data-act]')].filter(b=>!/^m-atk/.test(b.dataset.act)&&b.dataset.act!=='focus'&&b.dataset.act!=='none');
  const arms=['R','L'];const rows=[];let first=true;const ch=typeof isChariot==='function'&&isChariot();
  const focWhy=()=>{if(ch)return '';if(idle)return _T('Focus with this weapon');try{if(!RD().pvp)return _T('Focus: only in a PvP round');if((p.mv||0)<FOCUS98.min)return focus98Why(p)}catch(e){}return _T('Focus: a gladiator in reach and movement left')};
  for(const a of arms){const main0=live.find(b=>b.dataset.act==='m-atk'+a),thr0=live.find(b=>b.dataset.act==='m-atk'+a+'T');
    let main=main0,thr=thr0;if(!main&&thr){main=thr;thr=null}
    if(!main){/* a greyed stand-in for the weapon in this hand (no attack left with it) */
      const w=p['w'+a];if(w&&(w.lyre||w.noAtk||w.shield&&!w.p))continue;if(!w&&idle&&a==='L'&&p.wR&&p.wR.both)continue;
      const ww=w||(typeof PUNCH!=='undefined'?PUNCH:{n:_T('Fist'),p:1,r:1});const src={arm:a,w:ww};
      const T=document.createElement('template');T.innerHTML=b98Btn('wb98','',idle?'':_T('No attack left with it'));main=T.content.firstElementChild;b98Face(main,src,'');
      const T2=document.createElement('template');T2.innerHTML=ch?'':b98Btn('fo98',B98_FOC,focWhy());rows.push(b98WpnRow(main,T2.content.firstElementChild,null));continue}
    const src=b98Src(p,main.dataset.act)||{arm:a,w:p['w'+a]||PUNCH,thr:main.dataset.act.endsWith('T')?1:0};
    b98Face(main,src,first?'A':'');first=false;
    if(thr){const ts=b98Src(p,thr.dataset.act);const st=ts?b98Stats(ts):'';const sm=thr.querySelector('small.r96');
      thr.innerHTML=`<span class="th98i" aria-hidden="true">${wIco87('thr')}</span>`;if(sm)thr.appendChild(sm);thr.classList.add('th98');
      const nm=ts?_T`Throw ${esc(ts.w.n)}`:_T('Throw');thr.dataset.tip=nm+(st?' — '+st:'')+(thr.dataset.tip&&thr.dataset.tip!==nm?'<br>'+thr.dataset.tip:'');thr.setAttribute('aria-label',b96Txt(nm)+(st?' — '+st:''))}
    rows.push({main,thr,arm:a,mode:'atk'+a})}
  /* the focus docks: 07-ui's one toggle; copies of the same act on the other weapons */
  const liveRows=rows.filter(x=>x&&x.main);
  if(liveRows.length){const on=!!p.focusRoll;let home=on?liveRows.find(x=>S.mode===x.mode||S.mode===x.mode+'T'):null;if(!home)home=liveRows[0];
    for(const x of liveRows){let f=null;
      if(F){if(x===home)f=F;else if(on){const T=document.createElement('template');T.innerHTML=`<button type="button" class="btn b96 fo98 sw98" data-m98="m-atk${x.arm}" data-tip="${esc(_T`Focus is on — aim it with this weapon`)}" ${S.busy?'disabled':''}>${B98_FOC}</button>`;f=T.content.firstElementChild}
        else{f=F.cloneNode(true);f.removeAttribute('id')}
        if(f!==null&&f.dataset.act==='focus'){const sm=f.querySelector('small.r96');f.innerHTML=B98_FOC+(f.classList.contains('on')?'<i class="on98">ON</i>':'');if(sm)f.appendChild(sm);
          f.classList.add('fo98');f.dataset.w98=x.mode;const why=f.classList.contains('ref98')?focus98Why(p):'';
          const t=on&&x===home?_T('Focus is ON — click to turn it off'):why||_T`Focus with this weapon: needs ${FOCUS98.min}+ movement, spends all you have left; pick 1 of 3 rolled locations`;
          f.dataset.tip=t;f.setAttribute('aria-label',_T('Focus')+' — '+b96Txt(t))}}
      else if(!ch){const T=document.createElement('template');T.innerHTML=b98Btn('fo98',B98_FOC,focWhy());f=T.content.firstElementChild}
      const i=rows.indexOf(x);rows[i]=b98WpnRow(x.main,f,x.thr)}}
  for(const r of rows)box.appendChild(r);
  if(!rows.length){const n=G96.querySelector('[data-g96="atk"] [data-act="none"]');const T=document.createElement('template');T.innerHTML=b98Btn('wb98',`<span class="l96">${_T('Attack')}</span>`,_T('No attacks left'));box.appendChild(n||T.content.firstElementChild)}
  if(extra.length){const r=document.createElement('div');r.className='r96 r2';for(const b of extra)r.appendChild(b);box.appendChild(r)}
  return box}
function b98Head(ic,title,small,cls=''){return `<div class="hd96 hd98 ${cls}"><i class="nz96"></i><span class="ic98">${ic}</span><span>${title}</span><span class="sp98"></span><small>${small}</small></div>`}
/* the whole v2 plate for an Action / idle turn */
function bar98Grid(p,G96){const idle=G96.classList.contains('idle96');const T=document.createElement('template');
  const hdOf=k=>{const h=G96.querySelector(`[data-g96="${k}"] .hd96 small`);return h?h.innerHTML:''};
  T.innerHTML=`<div class="acts grid96 grid98 ${idle?'idle96':''}">
    <div class="g96 g98 wood" data-g96="mv" role="group" aria-label="${_T('Move')}">${b98Head('🏃',_T('Move'),hdOf('mv'))}<div class="bd98 m96"></div></div>
    <div class="g96 g98 brass" data-g96="atk" role="group" aria-label="${_T('Attack')}">${b98Head('⚔',_T('Attack'),hdOf('atk'))}</div>
    <div class="g96 g98 forum" data-g96="fm" role="group" aria-label="${_T('Forum')}">${b98Head('🏛',_T('Forum'),hdOf('mk'),'fmhd98')}<div class="bd98"><div class="r96 k96 r2"></div><div class="r96 d96 r2"></div><div class="r96 x98 r2"></div></div></div>
    <div class="end96" data-g96="end"></div></div>`;
  const G=T.content.firstElementChild;
  /* move: everything 233 put in the Move column, Move · Push / Topple · Tunnel first */
  const mv=G.querySelector('.m96');for(const b of [...G96.querySelectorAll('[data-g96="mv"] .m96 > *')])mv.appendChild(b);mv.classList.add('r2');
  G.querySelector('[data-g96="atk"]').appendChild(b98Attack(p,G96,idle));
  /* forum: market + crowd on top, loot + trade below, the rest (chest, …) after */
  const k=G.querySelector('.k96'),d=G.querySelector('.d96'),x=G.querySelector('.x98');
  for(const b of [...G96.querySelectorAll('[data-g96="mk"] .k96 > *')])k.appendChild(b);
  const dl=[...G96.querySelectorAll('[data-g96="dl"] .d96 > *')];const isL=b=>b.dataset.act==='loot'||(!b.dataset.act&&/Loot/.test(b.textContent)&&!b.classList.contains('seal96'));
  const loot=dl.filter(isL),trade=dl.filter(b=>b.classList.contains('seal96')),rest=dl.filter(b=>!loot.includes(b)&&!trade.includes(b));
  for(const b of [...loot,...trade])d.appendChild(b);for(const b of rest)x.appendChild(b);
  const end=G.querySelector('.end96');const e0=G96.querySelector('.end96');if(e0)for(const c of [...e0.childNodes])end.appendChild(c);
  return G}
/* Choice: one centred gold group */
function bar98Choice(p,G96){const T=document.createElement('template');
  T.innerHTML=`<div class="acts grid96 grid98 ch96 ch98"><div class="chs98 l">${_T('🏃 Move · ⚔ Attack')}</div><div class="g96 g98 chg98" data-g96="ch" role="group" aria-label="${_T('Choose one')}">${b98Head('✦',_T('Choose one'),_T('pick one'),'chhd98')}<div class="bd98 c98"></div></div><div class="chs98 r">${_T('🏛 Forum')}</div><div class="end96" data-g96="end"></div></div>`;
  const G=T.content.firstElementChild;const box=G.querySelector('.c98');let i=0;
  for(const b of [...G96.querySelectorAll('[data-g96="ch"] button')]){i++;b.classList.add('cb98');const kb=b.querySelector('.kb96');if(kb)kb.remove();
    if(b.dataset.act==='card'){const l=b.querySelector('.l96');if(l)l.textContent=_T('🂠 Draw an arena card')}
    b.insertAdjacentHTML('beforeend',`<kbd class="kb96" aria-hidden="true">${i}</kbd>`);box.appendChild(b)}
  const end=G.querySelector('.end96');const e0=G96.querySelector('.end96');if(e0)for(const c of [...e0.childNodes])end.appendChild(c);return G}
function bar98Apply(){if(!BAR98.on||typeof BAR96==='undefined'||!BAR96.on)return;const A=document.getElementById('actions');if(!A||!A.classList.contains('bar96'))return;
  const G96=A.querySelector(':scope > .acts.grid96:not(.grid98)');if(!G96){A.classList.toggle('bar98',!!A.querySelector(':scope > .grid98'));return}
  const p=cur();if(!p)return;let G;try{G=G96.classList.contains('ch96')?bar98Choice(p,G96):bar98Grid(p,G96)}catch(e){console.error(e);return}
  G96.replaceWith(G);A.classList.add('bar98')}
{const base=render;render=function(){const r=base.apply(this,arguments);try{focus98Gate();if(!HEADLESS)bar98Apply()}catch(e){console.error(e)}return r}}

/* Focus docks: a click remembers its weapon; once focus is on, the attack mode points at it (local m- mode, like 07-ui's own m- buttons) */
document.addEventListener('click',e=>{if(!BAR98.on||!S)return;const b=e.target.closest&&e.target.closest('[data-w98],[data-m98]');if(!b)return;
  if(b.dataset.m98){const t=document.querySelector(`#actions [data-act="${b.dataset.m98}"]:not([disabled])`);if(t)t.click();return}
  try{const p=cur();if(p&&p.focusRoll&&S.phase==='action'&&!S.busy){const m=b.dataset.w98;if(m&&attackSources(p).some(s=>'atk'+s.arm===m&&!s.thr)&&S.mode!==m){S.mode=m;render()}}}catch(err){}});
/* Choice keys 1 / 2 (offline, your own Choice, nothing open — like 233's A/P/Enter) */
window.addEventListener('keydown',e=>{if(!BAR98.on||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;if(e.key!=='1'&&e.key!=='2')return;
  const t=document.activeElement;if(t&&(['INPUT','SELECT','TEXTAREA'].includes(t.tagName)||t.isContentEditable))return;
  if(typeof CUR_MODAL!=='undefined'&&CUR_MODAL)return;const m=document.getElementById('modal');if(m&&!m.hidden)return;if(document.querySelector('.ask76bg'))return;
  if(typeof tutLive==='function'&&tutLive())return;if(!S||S.over||S.phase!=='choice'||!humanTurn()||S.onl)return;
  const b=document.querySelector(`#actions .c98 [data-act="${e.key==='1'?'coin':'card'}"]:not([disabled])`);if(b){e.preventDefault();b.click()}});
/* phones: a long-press on a weapon shows its damage · range (the text is hidden there) */
function b98LpEnd(){if(BAR98.lp){clearTimeout(BAR98.lp.t);BAR98.lp=null}}
document.addEventListener('pointerdown',e=>{if(!BAR98.on||e.pointerType==='mouse')return;const b=e.target.closest&&e.target.closest('#actions .wb98[data-st98]');if(!b)return;
  b98LpEnd();BAR98.lp={b,t:setTimeout(()=>{try{let el=document.getElementById('lp98');if(!el){el=document.createElement('div');el.id='lp98';el.setAttribute('role','status');document.body.appendChild(el)}
    el.innerHTML=b.dataset.lp98||'';if(!el.innerHTML)el.textContent=b.dataset.st98;const r=b.getBoundingClientRect();el.style.left=Math.max(8,Math.min(innerWidth-8,r.left+r.width/2))+'px';el.style.top=Math.max(4,r.top-30)+'px';el.hidden=false;
    BAR98.lpShown=Date.now();clearTimeout(BAR98.lpHide);BAR98.lpHide=setTimeout(()=>{el.hidden=true},1600)}catch(err){}},450)}},true);
for(const ev of ['pointerup','pointercancel','pointerleave'])document.addEventListener(ev,b98LpEnd,true);
window.addEventListener('click',e=>{if(BAR98.lpShown&&Date.now()-BAR98.lpShown<700&&e.target.closest&&e.target.closest('#actions .wb98')){BAR98.lpShown=0;e.preventDefault();e.stopImmediatePropagation()}},true);
window.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('#actions .wb98[data-st98]')&&(e.pointerType==='touch'||matchMedia('(hover:none)').matches))e.preventDefault()},true);

/* ---------- the look (on top of 233's) ---------- */
(()=>{const st=document.createElement('style');st.textContent=`
#actions.bar98{--hd98:24px;--row98:34px;position:relative;border-radius:10px;padding:5px 6px 6px;background:linear-gradient(#271b12,#1d140d);border:1px solid #5a4128;box-shadow:inset 0 1px 0 #ffffff10,inset 0 0 0 1px #00000060,0 4px 14px #00000080}
#actions.bar98 .rail96{margin-bottom:5px}
#actions .acts.grid96.grid98{grid-template-columns:1fr 1.2fr 1.42fr 112px;gap:0;border-radius:7px;background:#160f0a;border:1px solid #3e2d1c;box-shadow:inset 0 1px 3px #000a;overflow:hidden}
#actions .grid98 .g96.g98{border:0;border-radius:0;background:transparent;padding:0;gap:0;border-right:1px solid #00000080;box-shadow:1px 0 0 #ffffff0c}
#actions .grid98 .g96.g98:first-child .hd96{border-top-left-radius:6px}
#actions .grid98 .hd96.hd98{margin:0;height:var(--hd98);padding:0 9px;gap:7px;font-size:13px;border-bottom:1px solid #00000080}
#actions .grid98 .hd98 .sp98{flex:1}#actions .grid98 .hd98 .ic98{font-size:13px;line-height:1;position:relative}
#actions .grid98 .bd98{padding:6px;display:grid;gap:5px;align-content:start;flex:1;min-width:0}
#actions .grid98 .r2{display:grid;grid-template-columns:1fr 1fr;gap:5px}#actions .grid98 .r96:empty{display:none}
#actions .grid98 .bd98.m96{grid-template-columns:1fr 1fr}
#actions .grid98 .g96 .btn.b96{height:var(--row98);align-items:center;font-size:13.5px;gap:6px;padding:0 9px;background:linear-gradient(#3a291c,#2f2117);box-shadow:inset 0 1px 0 #ffffff12}
#actions .grid98 .g96 .btn.b96 .c96{font-size:10.5px}
#actions .grid98 .forum .hd96{background:linear-gradient(90deg,#e3cb98 0,#d2b47c 46%,#7a3c22 54%,#5c2812 100%);color:#3a2410}
#actions .grid98 .forum .hd96 small{color:#f4e2c4;text-shadow:0 1px 0 #0008}
#actions .grid98 .forum .hd96::after{content:"";position:absolute;left:50%;top:3px;bottom:3px;border-left:1px dashed #f4e2c450}
#actions .grid98 .forum .k96 .btn.b96{border-color:#7a4a2e}#actions .grid98 .forum .d96 .btn.b96,#actions .grid98 .forum .x98 .btn.b96{border-color:#8a7450}
#actions .grid98 .wpn98{display:grid;grid-template-columns:1fr auto;height:var(--row98);min-width:0}
#actions .grid98 .wpn98 .btn.b96.wb98{border-radius:5px 0 0 5px;font-size:15px;font-weight:700;gap:7px;padding:0 8px 0 7px}
#actions .grid98 .wpn98 .wi98{width:22px;height:22px;flex:none;border-radius:4px;background:#1b130c;border:1px solid #8a6a3680;display:grid;place-items:center}
#actions .grid98 .wpn98 .wi98 i{width:16px;height:16px;margin:0}
#actions .grid98 .wpn98 .wb98 .c96{font-weight:400}
#actions .grid98 .wpn98 .wb98 .l96{flex:0 0 auto;max-width:62%}#actions .grid98 .wpn98 .wb98 .st98{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}
#actions .grid98 .dock98{display:flex;height:var(--row98)}
#actions .grid98 .dock98 .btn.b96{width:36px;padding:0;justify-content:center;border-radius:0;border-left:1px solid #00000090;background:linear-gradient(#4a3418,#33241a);color:#f0cf7d;position:relative}
#actions .grid98 .dock98 .btn.b96:last-child{border-radius:0 5px 5px 0}
#actions .grid98 .dock98 .th98{width:30px!important;font:700 15px var(--mono)}#actions .grid98 .th98 .th98i{display:grid;place-items:center}#actions .grid98 .th98 .th98i i{width:20px;height:20px;margin:0;background-color:#e8d7a8;border-radius:5px;box-sizing:border-box;padding:1px}
#actions .grid98 .wpn98 .wb98 .st98{font:700 14px/1 var(--mono);opacity:1;color:#f3dfae;display:inline-flex;flex-wrap:nowrap;align-items:center;gap:5px;margin:0;white-space:nowrap}#actions .grid98 .wpn98 .wb98 .st98 span{border:0;padding:0;border-radius:0;font-size:inherit;color:inherit;background:none}#actions .grid98 .wpn98 .st98 .sv98{display:inline-flex;align-items:center;gap:0}#actions .grid98 .wpn98 .st98 .sd98{opacity:.5}#actions .grid98 .wpn98 .st98 [class^=wi87]{width:18px;height:18px;margin:0 2px 0 0;vertical-align:0;background-color:#e8d7a8;border-radius:5px;box-sizing:border-box;padding:1px}
#lp98 [class^=wi87]{width:16px;height:16px;margin:0 2px 0 3px;vertical-align:-4px;background-color:#e8d7a8;border-radius:4px;box-sizing:border-box;padding:1px}#lp98 .sd98{margin:0 4px;opacity:.6}
#actions .grid98 .dock98 svg{width:19px;height:19px}
#actions .grid98 .dock98 .on98{position:absolute;right:2px;bottom:1px;font:8.5px var(--mono);font-style:normal;color:#ffd77a}
#actions .grid98 .dock98 .btn.b96.on{color:#fff1cc}
#actions .grid98 .dock98 .sw98{opacity:.7}
#actions .grid98 .wpn98.on .wb98{border-color:#ffd77a;box-shadow:0 0 0 1px #ffd77a,0 0 8px #ffd77a60;color:#fff1cc;z-index:1}
#actions .grid98 .wpn98.on .dock98 .btn{border-color:#ffd77a}
#actions .grid98 .g96 .btn.b96:disabled{opacity:.42;box-shadow:none}
#actions .grid98 .end96{margin:4px;display:flex}
#actions .grid98 .end96 .btn.end96b{height:auto;padding:6px}
#actions .acts.grid96.grid98.ch98{grid-template-columns:1fr minmax(0,560px) 1fr 112px}
#actions .grid98 .chs98{display:flex;align-items:center;justify-content:center;color:#4a3b2b;font:11px var(--mono);letter-spacing:.08em;text-transform:uppercase;border-right:1px solid #00000080;white-space:nowrap;overflow:hidden}
#actions .grid98 .chs98.l{border-right:1px solid #00000080}
#actions .grid98 .chg98 .hd96{background:linear-gradient(#e6c06a,#b88a34);color:#24180a;text-shadow:0 1px 0 #f7dd9a80;justify-content:center}
#actions .grid98 .chg98 .hd96 .sp98{display:none}#actions .grid98 .chg98 .hd96 small{position:absolute;right:9px}
#actions .grid98 .bd98.c98{display:flex;justify-content:center;gap:12px;padding:8px 14px 9px}
#actions .grid98 .g96 .btn.b96.cb98{width:260px;max-width:48%;height:44px;justify-content:center;gap:7px;padding:0 8px;border-radius:6px;font-size:16px;font-weight:700;color:#fff1cc;background:linear-gradient(#4a3418,#33241a);border:1px solid #c9a44a;box-shadow:inset 0 1px 0 #ffffff18,0 1px 0 #000;text-align:center}
#actions .grid98 .cb98 .kb96{margin-left:0;font-weight:400}#actions .grid98 .cb98 .l96{overflow:visible;text-overflow:clip}#actions .grid98 .cb98 .c96{font-size:11px}
#actions .grid98 .cb98 .amt87 .ic87c{width:16px;height:16px}
#actions.bar98 .grid98.idle96 .g96{opacity:.62;filter:saturate(.7)}
#lp98{position:fixed;transform:translateX(-50%);z-index:70;pointer-events:none;padding:4px 10px;border-radius:12px;background:#2a1d13f0;border:1px solid #c9a44a;color:#f6e7b8;font:12px var(--mono);white-space:nowrap}
@media (hover:none),(max-width:1180px){#actions .grid98 .cb98 .kb96{display:none}}
body.phoneL #actions .acts.grid98,body.phoneP2 #actions .acts.grid98,body.phoneP #actions .acts.grid98{display:flex}
body.phoneL #actions .grid98 .g98,body.phoneP2 #actions .grid98 .g98,body.phoneP #actions .grid98 .g98{width:206px}
body.phoneL #actions .grid98 .g98.wood,body.phoneP2 #actions .grid98 .g98.wood,body.phoneP #actions .grid98 .g98.wood{width:172px}
body.phoneL #actions .grid98 .wpn98 .st98,body.phoneP2 #actions .grid98 .wpn98 .st98,body.phoneP #actions .grid98 .wpn98 .st98{display:none}
body.phoneL #actions .grid98 [data-act="m-move"] .c96,body.phoneP2 #actions .grid98 [data-act="m-move"] .c96,body.phoneP #actions .grid98 [data-act="m-move"] .c96{display:none}
body.phoneL #actions .grid98 .end96 .btn.end96b .l96,body.phoneP2 #actions .grid98 .end96 .btn.end96b .l96,body.phoneP #actions .grid98 .end96 .btn.end96b .l96{font-size:14px;white-space:normal;line-height:1.1}
body.phoneL #actions.bar98,body.phoneP2 #actions.bar98,body.phoneP #actions.bar98{--row98:38px}
body.phoneL #actions .grid98 .chs98,body.phoneP2 #actions .grid98 .chs98,body.phoneP #actions .grid98 .chs98{display:none}
body.phoneL #actions .grid98 .chg98,body.phoneP2 #actions .grid98 .chg98,body.phoneP #actions .grid98 .chg98{width:auto;flex:1 1 auto}
body.phoneL #actions .grid98 .cb98,body.phoneP2 #actions .grid98 .cb98,body.phoneP #actions .grid98 .cb98{max-width:none;width:auto;flex:1;font-size:16px}
@media (max-width:620px){#actions .acts.grid98{display:flex}#actions .grid98 .g98{width:206px}#actions .grid98 .g98.wood{width:172px}#actions .grid98 .wpn98 .st98{display:none}#actions.bar98{--row98:38px}#actions .grid98 [data-act="m-move"] .c96{display:none}#actions .grid98 .end96 .btn.end96b .l96{font-size:14px;white-space:normal;line-height:1.1}
 #actions .grid98 .chs98{display:none}#actions .grid98 .chg98{width:auto;flex:1 1 auto}#actions .grid98 .cb98{max-width:none;width:auto;flex:1;font-size:16px}}`;document.head.appendChild(st)})();
