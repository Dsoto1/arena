/* =====================================================================
   48-ARENA47 · ON THE SAND AND AROUND IT (v0.47)
   =====================================================================
   • Offerings spilled from a broken pot lie on the sand as their printed round tokens, laid flat in the
     arena's isometric view (tokens without printed art get the same bronze ring around their sign).
   • Zora — the printed round token, standing on a little base in Standee style (the sheets have no Zora
     standee, so the token stands in for one).
   • Hover a token in a hand (offerings, the key, objectives' seals) for the enlarged token, like cards.
   • Naumachia: every ship shows its hull above the pillar it defends.
   • 🔁 Replay event on the results; the wagers panel is a real ledger (you · gladiators on themselves ·
     the crowd, summarized, the full list folded away).
   • Achievements are honors only — no rewards; two new ones.  The Road of Flavius: send a gladiator from
     their record in Your Play Now Gladiators, and watch their token walk a real road in the Annals.
   ===================================================================== */
/* ---------------- offerings on the sand ---------------- */
const FT_CACHE={};let FT_SPRITE=null;
function ftSprite(){if(FT_SPRITE)return FT_SPRITE.complete&&FT_SPRITE.naturalWidth?FT_SPRITE:null;FT_SPRITE=new Image();FT_SPRITE.onload=()=>{try{draw()}catch(e){}};FT_SPRITE.src=assetURL('rtok.webp');return null}
function ftCanvas(key){if(FT_CACHE[key])return FT_CACHE[key];const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
  const tk=typeof OFFER_TOK!=='undefined'?OFFER_TOK[key]:null;
  if(tk){const spr=ftSprite();if(!spr)return null;const i=RTOK_NAMES.indexOf(tk);if(i<0)return null;x.drawImage(spr,(i%RTOK_COLS)*128,Math.floor(i/RTOK_COLS)*128,128,128,0,0,128,128)}
  else{/* the bronze ring, struck around the offering's sign */const g=x.createRadialGradient(52,44,8,64,64,64);g.addColorStop(0,'#f0cf7d');g.addColorStop(.5,'#b8843e');g.addColorStop(1,'#5a3a18');
    x.fillStyle='#2a1a0c';x.beginPath();x.arc(64,64,63,0,Math.PI*2);x.fill();x.fillStyle=g;x.beginPath();x.arc(64,64,59,0,Math.PI*2);x.fill();
    x.fillStyle='#2a1a0c';x.beginPath();x.arc(64,64,47,0,Math.PI*2);x.fill();const g2=x.createRadialGradient(56,52,4,64,64,46);g2.addColorStop(0,'#f3e6c6');g2.addColorStop(1,'#bda77a');x.fillStyle=g2;x.beginPath();x.arc(64,64,45,0,Math.PI*2);x.fill();
    for(let k=0;k<12;k++){const a=k*Math.PI/6;x.fillStyle='#f5dc9a';x.beginPath();x.arc(64+Math.cos(a)*53,64+Math.sin(a)*53,2.6,0,Math.PI*2);x.fill()}
    const O=typeof OFFER!=='undefined'?OFFER[key]:null;const sign=(typeof OFFER_SIGN!=='undefined'&&OFFER_SIGN[key])||(O&&O.g)||'?';x.font='52px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#3a2508';x.fillText(sign,64,68)}
  FT_CACHE[key]=cv;return cv}
function drawFloorTok(f,m){const key=f.kind==='eagle'?'eagle':f.kind==='key'?'key':f.kind==='offer'?f.key:null;if(!key)return false;const cv=ftCanvas(key);if(!cv)return false;
  const s=TW*(key==='eagle'?0.58:0.46);const sq=0.52; /* the arena's isometric squash */
  ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(m.x+2,m.y+3,s*0.5,s*0.5*sq,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4a3014';ctx.beginPath();ctx.ellipse(m.x,m.y+TW*0.03,s*0.5,s*0.5*sq,0,0,Math.PI*2);ctx.fill(); /* the token's edge — it has thickness */
  ctx.translate(m.x,m.y);ctx.scale(1,sq);ctx.drawImage(cv,-s/2,-s/2,s,s);ctx.restore();return true}

/* ---------------- Zora stands on a base in Standee style ---------------- */
{const _dn=drawNPC;drawNPC=function(n){if(n.t!=='zora'||typeof tokenStyle!=='function'||tokenStyle()!=='standee')return _dn(n);
  const spr=ftSprite();const i=typeof RTOK_NAMES!=='undefined'?RTOK_NAMES.indexOf('zora'):-1;if(!spr||i<0)return _dn(n);const m=center(n.r,n.c);if(pillarAt(n.r,n.c))m.y-=TW*1.05;
  const s=TW*0.62;ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(m.x+2,m.y+2,TW*0.26,TW*0.12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6a4a2a';ctx.beginPath();ctx.ellipse(m.x,m.y,TW*0.22,TW*0.1,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a2616';ctx.fillRect(m.x-TW*0.03,m.y-TW*0.1,TW*0.06,TW*0.1);
  const st=npcStats(n);if(st.state==='Fazed')ctx.filter='brightness(.6) saturate(.6)';ctx.drawImage(spr,(i%RTOK_COLS)*128,Math.floor(i/RTOK_COLS)*128,128,128,m.x-s/2,m.y-TW*0.08-s,s,s);ctx.filter='none';
  const T=NPCT[n.t];const maxhp=Math.max(T.hp,n.hp);const bw=TW*0.5,y=m.y-TW*0.08-s-8;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(m.x-bw/2,y,bw,4);ctx.fillStyle=n.tamedBy!=null?'#7fb4e0':n.aggro!=null?'#e05a44':'#9cc46e';ctx.fillRect(m.x-bw/2,y,bw*Math.max(0,n.hp)/maxhp,4);ctx.restore()}}

/* ---------------- a token in a hand zooms like a card ---------------- */
{const _ot=offerTokHTML;offerTokHTML=function(k,size=28){return _ot(k,size).replace('<span class="rtok',_T('<span data-tokz="')+esc(k)+'" class="rtok')}}
(function(){const tip=$('#tip');if(!tip)return;let on=null;
  document.addEventListener('mouseover',e=>{const el=e.target.closest('[data-tokz]');if(!el){if(on){on=null}return}if(el===on)return;on=el;const k=el.dataset.tokz;const O=typeof OFFER!=='undefined'?OFFER[k]:null;
    tip.innerHTML=`<div style="text-align:center">${offerTokHTML(k,170).replace(/data-tokz="[^"]*" /,'')}</div>${O?`<div class="tt"><b>${esc(O.n)}</b> · ${esc(O.s||'')}${O.d?'<br>'+esc(O.d):''}</div>`:''}`;tip.hidden=false;
    const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+18,y=e.clientY-h/2;if(x+w>innerWidth-8)x=e.clientX-w-18;y=clamp(y,8,innerHeight-h-8);tip.style.left=x+'px';tip.style.top=y+'px'},true)})();

/* ---------------- naumachia: the hulls ---------------- */
{const _fx=drawFX;drawFX=function(){_fx();try{if(!S||!S.ships||!S.ships.length||typeof isNaum!=='function'||!isNaum())return;
  for(const sh of S.ships){const pl=S.pillars.find(x=>x.ship===sh.id)||{r:sh.pillar[0],c:sh.pillar[1],pots:[]};const m=center(pl.r,pl.c);const y=m.y-TW*0.95-TW*0.2-(pl.pots||[]).length*TW*0.44-TW*0.18;const bw=TW*1.1,bh=Math.max(5,TW*0.1);
    ctx.save();ctx.fillStyle='rgba(10,6,4,.78)';ctx.fillRect(m.x-bw/2-3,y-TW*0.2,bw+6,bh+TW*0.2+4);const k=sh.sunk?0:Math.max(0,sh.hp)/12;ctx.fillStyle='#2a1a10';ctx.fillRect(m.x-bw/2,y,bw,bh);
    ctx.fillStyle=sh.sunk?'#555':k>0.5?'#7fb4e0':k>0.25?'#e0b040':'#e05a44';ctx.fillRect(m.x-bw/2,y,bw*k,bh);ctx.fillStyle='#f5ead2';ctx.font=`600 ${Math.max(9,Math.round(TW*0.15))}px IBM Plex Mono, monospace`;ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText(sh.sunk?'⚓ sunk':`${Math.max(0,sh.hp)}/12 HP`,m.x,y-1);ctx.restore();(S._shipBars=S._shipBars||{})[sh.id]={x:m.x-bw/2-3,y:y-TW*0.2,w:bw+6,h:bh+TW*0.2+4}}}catch(e){}}} /* v0.58: the bar shows the hull's HP; its name comes on hover */

/* ---------------- the bubbles never outlive the event ---------------- */
setInterval(()=>{try{if(S&&(S.over||S.clean)){const b=document.getElementById('bubbles');if(b&&b.children.length)b.innerHTML='';S.bubbles=[]}}catch(e){}},900);

/* ---------------- 🔁 replay ---------------- */
let LAST_CFG=null;
{const _se=startEvent;startEvent=function(cfg,...a){try{if(cfg&&!cfg.mgrCtx&&!cfg.specCtx&&!cfg.tourn&&!cfg.fest&&!cfg.missio&&!cfg.road&&!cfg.tutorial&&!cfg.sim&&!cfg.exhibCtx&&cfg.seats)LAST_CFG=JSON.parse(JSON.stringify(cfg));else if(cfg&&(cfg.mgrCtx||cfg.specCtx||cfg.tourn))LAST_CFG=null}catch(e){LAST_CFG=null}return _se(cfg,...a)}}
function replayOK(){return !!(LAST_CFG&&S&&!S.mgrCtx&&!S.specCtx&&!S.tourn&&!S.fest&&!S.missio&&!S.road&&!S.tutorial&&!S.exhibCtx)}
function replayEvent(){if(!LAST_CFG)return;const c=JSON.parse(JSON.stringify(LAST_CFG));try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}
  const go=()=>{startEvent(c)};if(typeof transitRun==='function')transitRun(go,_T('The same sand, again…'));else go()}

/* ---------------- the wagers, as a ledger ---------------- */
function wagerPanelHTML(lines){const B=(S.bets||[]).filter(b=>b.won!=null);const SB=(S.selfBets||[]);const C=S.crowdBets;
  const won=B.filter(b=>b.won).reduce((a,b)=>a+(b.paid||0),0),stake=B.reduce((a,b)=>a+b.stake,0),lostSt=B.filter(b=>!b.won).reduce((a,b)=>a+b.stake,0);const net=won-B.filter(b=>b.won).reduce((a,b)=>a+b.stake,0)-lostSt;
  const tile=(v,l,cls='')=>`<div class="wtile ${cls}"><b>${v}</b><span>${l}</span></div>`;
  const mine=B.length?`<div class="wsec"><div class="whd">${_T`💰 Your wagers${S.purseAfter?` <span class="rc-sub">${_T`· ${esc(S.purseAfter.name||'your')} treasury now ${S.purseAfter.coin}`}</span>`:''}`}</div>
    <div class="wtiles">${tile('+'+won,_T('total won'),'good')}${tile('−'+lostSt,_T('total lost'),'bad')}${tile((net>=0?'+':'')+net,'net',net>=0?'good':'bad')}${tile(stake,'staked')}</div>
    <div class="wlist">${B.map(b=>`<div class="wrowl ${b.won?'w':'l'}"><span>${b.won?'✔':'✖'} ${esc(b.label)}</span><span class="rc-sub">${_T`${b.stake} at ${fmtOdds(b.odds)}`}</span><b>${b.won?'+'+b.paid:'−'+b.stake}</b></div>`).join('')}</div></div>`:'';
  const self=SB.length?`<div class="wsec"><div class="whd">${_T`🗡 Gladiators on themselves`}</div><div class="wlist">${SB.map(b=>{const p=S.players[b.pid];return `<div class="wrowl ${b.won?'w':'l'}"><span style="border-left:3px solid ${p.color};padding-left:5px">${esc(p.name)}${p.cpu?'':' (you)'}</span><span class="rc-sub">${_T`${b.stake} at ${fmtOdds(b.odds)}`}</span><b>${b.won?'+'+b.paid:'−'+b.stake}</b></div>`}).join('')}</div></div>`:'';
  const crowd=C&&C.n?`<div class="wsec"><div class="whd">${_T`👥 The crowd`} <span class="rc-sub">${_T`· in Crowd Favor`}</span></div>
    <div class="wtiles">${tile(C.n,_T('slips laid'))}${tile(C.staked,_T('CF staked'))}${tile(C.winners.length,_T('backed the winner'),'good')}${tile(C.n-C.winners.length,_T('lost their bet'),'bad')}${tile(C.winners.reduce((a,x)=>a+x.pay,0),_T('CF paid out'))}</div>

    ${C.winners.length?`<details class="wmore"><summary>${_T`Who collected (${C.winners.length})`}</summary><div class="wlist scroll">${C.winners.map(x=>`<div class="wrowl w"><span>${esc(x.name)}</span><span class="rc-sub">${_T`on ${esc(x.on||'')}`}</span>${_T`<b>+${x.pay} CF</b>`}</div>`).join('')}</div></details>`:''}</div>`:'';
  const other=lines.filter(l=>/bookmaker/i.test(l));
  return `<div class="card2 wagerpanel"><div class="sect" style="margin-top:0">${_T`🎲 Wagers`}</div>${mine}${self}${crowd}${other.map(l=>`<div class="rc-sub" style="margin-top:4px">${l}</div>`).join('')}</div>`}

/* ---------------- achievements: honors, not rewards — and two new ones ---------------- */
for(const a of ACHIEVEMENTS){a.r={};a.rn=''}
ACHIEVEMENTS.push({k:'bracket',n:'King of the Bracket',d:_T('Win a Play Now tournament of 16 or more gladiators with a gladiator you control.'),r:{},rn:''},
  {k:'longshot',n:'The Long Shot',d:_T('Win a wager on yourself at odds of 4.0 or longer.'),r:{},rn:''});
{const _tr=tournRecord;tournRecord=function(s,h,res){const was=TOURN&&TOURN.champ;_tr(s,h,res);try{const T=TOURN;if(T&&T.champ&&!was&&T.champ.human&&T.D.size>=16)achLoad().then(A=>achGrant(A,'bracket').then(g=>{if(g)Store.put('hall','ach',A)}))}catch(e){}}}
{const _sw=settleWagers;settleWagers=async function(rows,wset){const out=await _sw(rows,wset);try{if(!S.sim&&!HEADLESS&&(S.selfBets||[]).some(b=>b.won&&b.odds>=4&&!S.players[b.pid].cpu)){const A=await achLoad();if(await achGrant(A,'longshot'))await Store.put('hall','ach',A)}}catch(e){}return out}}

/* ---------------- 🛣 the Road of Flavius ---------------- */
const ROAD_PTS=Array.from({length:12},(_,i)=>{const x=70+i*78;const y=150+Math.sin(i*0.95)*62+(i%2?10:-6);return [x,Math.round(y)]});
function roadPath(){const P=ROAD_PTS;let d=`M${P[0][0]-50} ${P[0][1]+30} Q${P[0][0]-20} ${P[0][1]+10} ${P[0][0]} ${P[0][1]}`;for(let i=1;i<P.length;i++){const [x0,y0]=P[i-1],[x1,y1]=P[i];const cx=(x0+x1)/2;d+=` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`}return d+` Q${P[11][0]+30} ${P[11][1]-20} ${P[11][0]+55} ${P[11][1]-40}`}
function roadVisualHTML(R,cand,old){const live=R&&!R.over;const step=live?R.step:R&&R.over==='complete'?12:0;const g=R&&typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE.find(x=>x.id===R.gid):null;
  let shown=0;try{shown=+(localStorage.getItem('flavius_roadShown_'+(R&&R.gid))||0)}catch(e){}
  const at=i=>{const P=ROAD_PTS[Math.max(0,Math.min(11,i))];return i<0?[P[0]-50,P[1]+30]:i>11?[P[0]+55,P[1]-40]:P};const to=at(live?step:step-1),from=at(Math.min(shown,live?step:step-1));
  const face=g?portraitSVG(g.portrait,(CLASSES[g.cls]||CLASSES.soldier).color):'';
  const svg=`<svg class="roadsvg" id="roadSvg" viewBox="0 0 1000 260" role="img" aria-label="${_T`The Road of Flavius: twelve arenas, in order`}">
    <defs><linearGradient id="rdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1a"/><stop offset="1" stop-color="#1c130b"/></linearGradient><clipPath id="rdFace"><circle cx="0" cy="0" r="22"/></clipPath></defs>
    <rect width="1000" height="260" fill="url(#rdSky)" rx="10"/>${Array.from({length:14},(_,i)=>`<path d="M${i*80-20} 250 q40 -${30+(i*37)%40} 80 0" fill="#2a1e12"/>`).join('')}
    <path d="${roadPath()}" fill="none" stroke="#5a4028" stroke-width="30" stroke-linecap="round"/><path d="${roadPath()}" fill="none" stroke="#b89a68" stroke-width="22" stroke-linecap="round"/><path d="${roadPath()}" fill="none" stroke="#e8d4a0" stroke-width="2" stroke-dasharray="10 12" opacity=".6"/>
    ${HALL_ORDER.map((li,i)=>{const [x,y]=ROAD_PTS[i];const L=LOCATIONS[li];const done=i<step,next=live&&i===step;return `<g class="rdstop ${done?'done':next?'next':''}"><rect x="${x-5}" y="${y-44}" width="10" height="34" fill="#8a7a60"/><rect x="${x-26}" y="${y-62}" width="52" height="20" rx="3" fill="${done?'#6f8a3a':next?'#8a5cc0':'#3a2e20'}" stroke="#c9a458"/><text x="${x}" y="${y-48}" text-anchor="middle" font-family="Marcellus SC, Georgia, serif" font-size="10" fill="#fff3d8">${esc(L.n.length>9?L.n.slice(0,8)+'.':L.n)}</text>
      <circle cx="${x}" cy="${y}" r="11" fill="${done?'#6f8a3a':next?'#f0cf7d':'#2a1e12'}" stroke="#c9a458" stroke-width="2"/><text x="${x}" y="${y+4}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" fill="${next?'#1a120c':'#fff3d8'}">${done?'✓':i+1}</text><text x="${x}" y="${y+28}" text-anchor="middle" font-size="9" fill="#cdb98a" font-family="Georgia,serif">${esc((EVENTS[L.ev]||{}).sr||'')}</text></g>`}).join('')}
    <text x="14" y="248" font-family="Marcellus SC, Georgia, serif" font-size="12" fill="#cdb98a">ARLES →</text><text x="986" y="24" text-anchor="end" font-family="Marcellus SC, Georgia, serif" font-size="12" fill="#f0cf7d">→ ROMA · IMMORTALITY</text>
    ${g?`<g class="roadtok" data-to="${to[0]},${to[1]-30}" style="transform:translate(${from[0]}px,${from[1]-30}px)"><ellipse cx="0" cy="34" rx="18" ry="6" fill="rgba(0,0,0,.4)"/><circle cx="0" cy="0" r="25" fill="#1a120c" stroke="#f0cf7d" stroke-width="3"/><g clip-path="url(#rdFace)"><svg x="-22" y="-26" width="44" height="62" viewBox="0 0 100 140">${face.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</svg></g></g>`:''}</svg>`;
  setTimeout(()=>{const t=document.querySelector('#roadSvg .roadtok');if(!t)return;const [x,y]=t.dataset.to.split(',');requestAnimationFrame(()=>{t.style.transform=`translate(${x}px,${y}px)`});try{localStorage.setItem('flavius_roadShown_'+R.gid,String(live?step:12))}catch(e){}},120);
  const head=`<div class="sect" style="margin-top:0">${_T`🛣 The Road of Flavius`} <span class="rc-sub">${_T`one gladiator · twelve arenas · in the Hall's order · no second chances`}</span></div>`;
  if(live){const st=roadStage(R);return `<div class="roadbox">${head}${svg}<p style="margin:6px 0 4px"><b>${esc(R.name)}</b> (${CLASSES[R.cls]?CLASSES[R.cls].name:''}) walks the Road — stage <b>${R.step+1} of 12</b>. Next: <b>${esc(st.L.n)}</b> · ${esc(EVENTS[st.ev].n)}. Win it with ${esc(R.name)} to go on; lose, and the road ends.</p>
    <div class="acts"><button class="btn primary" type="button" data-road="go">${_T`⚔ Walk stage ${R.step+1}: ${esc(st.L.n)}<small>opens New event with ${esc(R.name)} summoned</small>`}</button><button class="btn" type="button" data-road="abandon">${_T`Abandon the road`}</button></div></div>`}
  return `<div class="roadbox">${head}${svg}<p style="margin:6px 0 4px">${_T`Send one of <b>Your Play Now Gladiators</b> down the Road: win all twelve arenas in the Hall's order — Arles to Roma — each at its own event, with that same gladiator. Lose once and the road is over. <b>To send one:</b> open their record (Annals → 🛡 Your Play Now Gladiators) and press <b>🛣 Send on the Road</b> — or pick them here.`}</p>
    ${R&&R.over?`<p class="rc-sub">${R.over==='complete'?_T`👑 <b>${esc(R.name)}</b> walked the whole Road.`:_T`Last walker: <b>${esc(R.name)}</b> — fell at ${esc(R.fell?R.fell.loc:'')}, stage ${(R.fell?R.fell.step:0)+1}.`}</p>`:''}
    ${cand.length?`<div class="acts" style="align-items:center"><select class="tin" id="roadPick">${cand.map(g2=>`<option value="${g2.id}">${_T`${esc(g2.name)} · ${CLASSES[g2.cls].name} · ${g2.wins||0} wins`}</option>`).join('')}</select><button class="btn primary" type="button" data-road="commit">${_T`🛣 Send on the Road`}</button></div>`:'<p class="rc-sub">You need a living gladiator of the eight classes on your roster (save one after an event).</p>'}</div>`}
/* the record in Your Play Now Gladiators gets its own button, top right */
{const _ld=ludusDetail;ludusDetail=function(g){let h=_ld(g);if(!g||!gladActive(g)||g.cpu||!BASE_CLS.includes(g.cls))return h;
  return h.replace('<div class="gdetail" id="gDetail">',`<div class="gdetail" id="gDetail"><button type="button" class="btn roadsend" data-roadsend="${g.id}" title="Win the twelve arenas in order with ${esc(g.name)}">🛣 Send on the Road</button>`)}}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-roadsend]');if(!b)return;e.stopPropagation();const g=LUDUS_CACHE.find(x=>x.id===b.dataset.roadsend);if(!g)return;
  const R=await roadLoad();if(R&&!R.over&&R.gid!==g.id){if(!b.dataset.armed){b.dataset.armed='1';b.innerHTML=_T`⚠ ${esc(R.name)} is on the Road — press again to replace them`;return}const past=(await Store.getDoc('hall','roadPast').catch(()=>null))||{list:[]};R.over='fell';R.fell={step:R.step,loc:'the roadside',how:'replaced'};past.list.unshift(R);await Store.put('hall','roadPast',past)}
  if(R&&!R.over&&R.gid===g.id){if(typeof mToast==='function')mToast(_T`🛣 ${esc(g.name)} is already on the Road.`)}
  else{await Store.put('hall','road',{gid:g.id,name:g.name,cls:g.cls,step:0,history:[],started:new Date().toISOString().slice(0,10)});try{localStorage.setItem('flavius_roadShown_'+g.id,'-1')}catch(err){}if(typeof mToast==='function')mToast(_T`🛣 <b>${esc(g.name)}</b> sets out on the Road of Flavius. Twelve arenas. One life.`)}
  const cur=CUR_MODAL;if(cur)cur.done('road');setTimeout(()=>{openHall('hall');setTimeout(()=>{const r=document.getElementById('roadSvg');if(r)r.scrollIntoView({block:'center',behavior:'smooth'})},600)},250)},true);

/* ---------------- the lessons ---------------- */
/* 34: the tunnel step walks you to a tunnel mouth first, then asks for the Tunnel button (your Arena Key) */
function tutTunnelSug2(p){if(S.phase!=='action')return null;const ex=tunnelExits(p);if(ex.length)return tutTunnelSug(p);if(p.keys<1)p.keys=1;
  if(p.mv>0){const R=reach(p);let best=null,bc=1e9;for(const [k,c] of R.tiles){if(c>p.mv)continue;const r=Math.floor(k/N),cc=k%N;if(unitAt(r,cc))continue;if(S.tunnels.some(t=>tunnelUsable(t)&&cheb({r,c:cc},t)<=1)&&c<bc){bc=c;best=[r,cc]}}
    if(best)return {act:'m-move',mode:'move',tile:{r:best[0],c:best[1]},text:''}}return null}
{const T=TUT_STEPS.find(x=>x.id==='tunnel');if(T){T.say=p=>`${TUT.p&&tunnelExits(TUT.p).length?_T('Press <b>🕳 Tunnel</b> — it spends your <b>Arena Key</b> — then click the gold tunnel nearest your rival. (It ends your turn.)'):_T('Walk to the <b>tunnel mouth</b> (the gold tile), then press <b>🕳 Tunnel</b> — it spends your <b>Arena Key</b>.')}`;T.sug=p=>tutTunnelSug2(p)}}
/* 35: when the bout is over the results window (and then the show) have the floor; the coach steps aside, and
   after the show a proper "lesson complete" window asks what next — never an automatic dump to the menu */
{const _tc=tutCoach;tutCoach=function(){try{if(S&&S.over&&(S.tutorial||S.tutShow)&&((!$('#modal').hidden)||S.clean||S.tutShow)){const el=document.getElementById('tutCoach');if(el)el.remove();tutSpot(null);return}}catch(e){}return _tc()}}
async function tutDoneModal(){const won=!!(S&&S.result&&(S.result.winners||[]).includes(TUT.p?TUT.p.id:0));const mDone=typeof lessonDone==='function'&&lessonDone('manager');
  const el=document.getElementById('tutCoach');if(el)el.remove();
  const v=await modal(_T('🎓 Lesson complete'),`<div style="display:flex;gap:12px;align-items:center"><img src="${typeof flavFaceURL==='function'?flavFaceURL(won?'cheer':'pleased'):''}" alt="" style="width:84px;border-radius:8px"><div><p style="margin:0 0 6px">${won?_T('<b>Victory.</b> You are a graduate of the ludus — Flavius will remember the name.'):_T('<b>You fell</b> — every champion did, once. The sand teaches.')}</p><p class="rc-sub" style="margin:0">${_T`What next? Play a real event, learn Manager mode, or head back to the menu.`}</p></div></div>`,
    [{label:_T('⚔ Play a real event'),sub:_T('Play Now → New event'),value:'play',primary:1},...(mDone?[]:[{label:_T('💼 Learn Manager mode'),sub:_T('one guided week of a ludus'),value:'mgr'}]),{label:_T('🏛 Main menu'),value:'menu'}],{close:'menu'});
  try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}TUT.on=false;if(S)S.tutorial=false;
  if(v==='play'){if(typeof transitRun==='function')transitRun(()=>{menuHide();openSetup(true)},_T('Play now…'));else openSetup(true);return}
  if(v==='mgr'){if(typeof transitRun==='function')transitRun(()=>{menuHide();if(typeof startManagerTutorial==='function')startManagerTutorial()},_T('Loading the Manager lesson…'));return}
  const go=()=>{if(typeof menuShow==='function')menuShow()};if(typeof fadeTo==='function')fadeTo(go);else go()}
tutAfterShow=function(){if(S&&(S.tutorial||S.tutShow)&&S.over){S.tutorial=false;setTimeout(()=>{if(typeof modalDismiss==='function'&&!$('#modal').hidden)modalDismiss();tutDoneModal()},1400)}};
/* 36: the Learn-to-play coach belongs to the lesson only — never in Play Now, never on the main menu */
{const _se=startEvent;startEvent=function(cfg,...a){try{if(!cfg||!cfg.tutorial){if(typeof TUT!=='undefined'){TUT.on=false;TUT.hidden=0}const el=document.getElementById('tutCoach');if(el)el.remove();if(typeof tutSpot==='function')tutSpot(null)}}catch(e){}return _se(cfg,...a)}}
{const _ms=menuShow;menuShow=function(...a){try{const el=document.getElementById('tutCoach');if(el)el.remove();if(typeof tutSpot==='function')tutSpot(null);if(typeof TUT!=='undefined'&&!(S&&S.tutorial&&!S.over))TUT.on=false}catch(e){}return _ms(...a)}}
