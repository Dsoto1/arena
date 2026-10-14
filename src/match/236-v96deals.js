/* 236-v96deals — v0.97 DEALS, NO-CF EVENTS AND THE CHEST STEP (owner-approved items 1, 2a, 3, 4, 5a, 6a, 7).
   1 · NO-CF EVENTS (every round forbids Crowd Favor, like missioNoCF): the action bar's Market and Crowd Favor tiles read "No CF this event"
       for the whole match, with a tip saying why nothing can be bought (233 bar, post-processed after each render).
   2a · THE TRADE · TRUCE MENU: a "🕊 Truce" / "🛡 Teammate" chip beside each name, those rows first (a modal wrapper over the list).
   3 · AN ACCEPTED TRUCE / TRADE shows a banner over the arena for ~2.5 s ("🤝 Truce: A ⟷ B"); cosmetic only (DOM, never in S).
       Wrapped at makeTruce / doTrade (every accept point, CPU or human, offline and online — online each client runs the same call).
   4 · A chip "🌾 No CF: no Market buys" on Manager Match Week bout rows (nightHTML) and the online room's head (r96Layout).
   5a · ONE trade-or-truce OFFER per gladiator per other player per turn (a declined offer counts). S.offers96 = {turnNo, from, to:[ids]} lives in S
       (so lockstep + onlHash stay consistent). Marked where an offer is put to the target (cpuAcceptsTruce / cpuAcceptsTrade / hsAsk for human targets).
       Humans: the row is greyed in the menu ("Already offered this turn") and Trade / Propose a truce are disabled in the next window (gifts and
       breaking a truce stay open); CPUs: tradePartners drops used targets while cpuDiplomacy picks its partner.
   6a · DIGITAL HOUSE RULE: lifting the Arena Chest costs 1 movement — with none left it cannot be taken (07-ui button + handler, 06-ai, 201 Zora).
       Forced hand-overs (Zora, ...) are free. The −1 while carrying (mvMax) still applies on FOLLOWING turns only.
   7 · At 0 movement the Move button is dimmed (not the gold "on" edge). */
function noCF96(key){try{const E=key?EVENTS[key]:EV();return !!E&&Array.isArray(E.rounds)&&E.rounds.length>0&&E.rounds.every(r=>!r.cf)}catch(e){return false}}
const noCFTip96=()=>_T`Crowd Favor can't be spent this event, so nothing can be bought at the Market. Cards and offerings can still provide weapons and armor.`;
const noCFChip96=()=>`<span class="nocf96c" data-tip="${esc(noCFTip96())}" tabindex="0">${_T`🌾 No CF: no Market buys`}</span>`;

/* ---------- 1 + 7 · the bar ---------- */
function deals96Bar(){try{if(typeof BAR96==='undefined'||!BAR96.on||!S||!S.players||S.phase==='setup')return;const A=document.getElementById('actions');if(!A||!A.classList.contains('bar96'))return;
  const p=cur();
  if(noCF96()){const reason=_T('No CF this event'),tip=noCFTip96(),names=[_T('Market'),_T('Crowd Favor')];
    for(const b of A.querySelectorAll('.k96 .b96')){const lab=b.querySelector('.l96');const l=((lab&&lab.textContent)||'').trim();
      if(!(b.dataset.act==='market'||b.dataset.act==='crowd'||names.includes(l)))continue;
      let c=b.querySelector('.c96');if(!c){c=document.createElement('i');c.className='c96';(lab||b).after(c)}
      c.textContent=reason;b.dataset.tip=tip;b.setAttribute('aria-label',l+' — '+reason);b.classList.add('nocf96');
      if(b.dataset.act==='market'){b.disabled=true;b.classList.add('off90')}}}
  if(p&&!p.cpu&&p.mv<=0&&S.phase==='action'){const mv=A.querySelector('[data-act="m-move"]');if(mv){mv.classList.remove('on');mv.classList.add('spent96')}}}catch(e){}}
{const base=render;render=function(){const r=base.apply(this,arguments);deals96Bar();return r}}

/* ---------- 5a · the offer limit ---------- */
function offers96(){if(!S)return null;const o=S.offers96;if(!o||o.turnNo!==S.turnNo)S.offers96={turnNo:S.turnNo,from:cur()?cur().id:null,to:[]};return S.offers96}
function offered96(player,other){try{const o=S&&S.offers96;return !!(o&&o.turnNo===S.turnNo&&o.from===player.id&&o.to.includes(other.id))}catch(e){return false}}
function offerMark96(player,other){try{if(!S||!player||!other)return;const o=offers96();if(o.from!==player.id)return;if(!o.to.includes(other.id))o.to.push(other.id)}catch(e){}}
{const base=cpuAcceptsTruce;cpuAcceptsTruce=function(other,player){offerMark96(player,other);return base.apply(this,arguments)}}
{const base=cpuAcceptsTrade;cpuAcceptsTrade=function(other,give,get){offerMark96(TRADE88&&TRADE88.from||cur(),other);return base.apply(this,arguments)}}
{const base=hsAsk;hsAsk=function(q,f){offerMark96(cur(),q);return base.apply(this,arguments)}}
var CPUDIP96=false; /* read by tradePartners (05-flow) */
{const base=cpuDiplomacy;cpuDiplomacy=function(player){CPUDIP96=true;try{return base.apply(this,arguments)}finally{CPUDIP96=false}}}

/* ---------- 2a · the menu chips + the limit in the windows ---------- */
{const base=modal;modal=function(title,body,buttons,opt){try{
  if(!HEADLESS&&S&&S.players&&Array.isArray(buttons)){const p=cur();const t=String(title||'');const Q=typeof askNow==='function'?askNow():null;const K=Q?Q.kind:''; /* v1.01: by kind (326) */
    if(p&&(K?K==='tradeMenu':t===_T('Trade or truce'))){
      const rows=buttons.map((b,i)=>({b,i,q:typeof b.value==='number'?S.players[b.value]:null}));
      const rank=x=>!x.q?9:inTruce(p,x.q)||EV().teams&&friendly(p,x.q)?0:1;
      for(const x of rows){if(!x.q)continue;const chips=[];
        if(EV().teams&&friendly(p,x.q))chips.push(`<span class="chip96 mate">${_T('🛡 Teammate')}</span>`);
        if(inTruce(p,x.q))chips.push(`<span class="chip96 truce">${_T('🕊 Truce')}</span>`);
        if(chips.length)x.b={...x.b,label:x.b.label+' '+chips.join(' ')};
        if(offered96(p,x.q))x.b={...x.b,sub:(x.b.sub?x.b.sub+' · ':'')+_T('Already offered this turn'),style:'opacity:.5'}}
      buttons=rows.sort((a,b)=>rank(a)-rank(b)||a.i-b.i).map(x=>x.b)}
    else{const q=K?(K==='tradeWith'&&Q.spec&&Q.spec.q||null):S.players.find(x=>x&&t===_T`With ${x.name}`);
      if(q&&p&&offered96(p,q))buttons=buttons.map(b=>b.value==='trade'||b.value==='truce'&&!inTruce(p,q)?{...b,disabled:true,sub:_T('Already offered this turn')}:b)}}}catch(e){}
  return base.call(this,title,body,buttons,opt)}}

/* ---------- 3 · the accepted banner ---------- */
let ACC96=null;
function acc96Show(txt){try{if(HEADLESS||!S||S.sim||typeof document==='undefined')return;if(ACC96){clearTimeout(ACC96.t);ACC96.el.remove()}
  const el=document.createElement('div');el.className='acc96';el.setAttribute('role','status');el.textContent=txt;
  const cv=document.getElementById('cv');const r=cv?cv.getBoundingClientRect():null;
  if(r&&r.width){el.style.left=(r.left+r.width/2)+'px';el.style.top=(r.top+Math.min(90,r.height*0.14))+'px'}
  if(typeof reduceMotion==='function'&&reduceMotion()||document.body.classList.contains('calm')||(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off'))el.classList.add('still');
  document.body.appendChild(el);ACC96={el,t:setTimeout(()=>{try{el.remove()}catch(e){}if(ACC96&&ACC96.el===el)ACC96=null},2500)}}catch(e){}}
{const base=makeTruce;makeTruce=function(player,other){const had=S.truces&&S.truces.has(truceKey(player.id,other.id));const r=base.apply(this,arguments);
  try{if(!had&&S.truces&&S.truces.has(truceKey(player.id,other.id)))acc96Show(_T`🤝 Truce: ${player.name} ⟷ ${other.name}`)}catch(e){}return r}}
{const base=doTrade;doTrade=function(player,other,give,get){const r=base.apply(this,arguments);try{acc96Show(_T`🤝 Trade: ${player.name} ⟷ ${other.name}`)}catch(e){}return r}}

/* ---------- 4 · chips on Match Week rows and the online room ---------- */
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{const T=document.createElement('template');T.innerHTML=h;let n=0;
  for(const c of T.content.querySelectorAll('.bout')){const ref=c.querySelector('[data-card^="e:"]');const key=ref&&ref.dataset.card.slice(2);if(!key||!noCF96(key))continue;
    const t=c.querySelector('.bouttitle');if(t){t.insertAdjacentHTML('beforeend',noCFChip96());n++}}
  if(n){const d=document.createElement('div');d.appendChild(T.content);return d.innerHTML}}catch(e){}return h}}
{const base=r96Layout;r96Layout=function(h,L){const out=base.apply(this,arguments);try{if(L&&noCF96(L.ev)&&typeof out==='string'&&out.indexOf('nocf96c')<0){
  const T=document.createElement('template');T.innerHTML=out;const hd=T.content.querySelector('.r80-head');if(hd){const t=hd.querySelector('.r96-acts');
    const sp=document.createElement('div');sp.className='r96-nocf';sp.innerHTML=noCFChip96();if(t)hd.insertBefore(sp,t);else hd.appendChild(sp);const d=document.createElement('div');d.appendChild(T.content);return d.innerHTML}}}catch(e){}return out}}

/* ---------- 6a · the chest text ---------- */
try{RULE_TILE.chest=_T`The Arena Chest: 1 Arena Key opens it for a level-4 weapon. You can also pick it up and carry it (−1 movement while held). Digital rule: lifting it costs 1 movement, so you cannot take it with none left.`;
  RULE_ACT.chestup=_T`Pick up the chest: costs 1 movement (digital rule), then −1 movement on later turns while you carry it.`}catch(e){}

(()=>{const st=document.createElement('style');st.textContent=`
#actions .g96 .btn.b96.spent96{opacity:.42}
#actions .g96 .btn.b96.nocf96:not(:disabled){opacity:.8}
.chip96{display:inline-block;margin-left:5px;padding:0 6px;border-radius:9px;font:bold 10px/16px var(--mono);letter-spacing:.03em;vertical-align:1px;background:#3a2a52;color:#d8c4ff;border:1px solid #7a62a8}
.chip96.mate{background:#1f3550;color:#bcd8ff;border-color:#4f7fb0}
.nocf96c{display:inline-block;padding:1px 8px;border-radius:9px;font:11px/16px var(--mono);background:#3b3320;color:#e8d79a;border:1px solid #8a7438;cursor:help;white-space:nowrap}
.r96-nocf{margin:4px 0}
.acc96{position:fixed;transform:translateX(-50%);z-index:60;pointer-events:none;padding:8px 18px;border-radius:20px;background:#2a1d13ee;border:2px solid #c9a44a;color:#f6e7b8;font:bold 15px var(--mono);box-shadow:0 4px 18px #000a;animation:acc96 2.5s ease both}
.acc96.still{animation:none}
@keyframes acc96{0%{opacity:0;transform:translate(-50%,-10px)}12%{opacity:1;transform:translate(-50%,0)}85%{opacity:1}100%{opacity:0}}
body.calm .acc96{animation:none}`;document.head.appendChild(st)})();
