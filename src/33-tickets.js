/* =====================================================================
   33-TICKETS · THE BOX OFFICE (v0.41)
   =====================================================================
   Every Match Week bout sells tickets through the week. Demand comes from the billing, the fame of
   the fighters on the card, the city's arena and the week's news (world events, weather); the stands
   fill as game day nears (the week's recruiting hours are the clock). Each change is logged, so the
   card shows the count, the arena's capacity, the trend since the last change, and a small sparkline.
   After the card is fought, each result shows how many actually came.
   ===================================================================== */
/* TIER_DRAW — the base share of seats each billing sells. TWEAK: 0.42 / 0.62 / 0.82. */
const TIER_DRAW={under:0.42,feature:0.62,main:0.82};
/* boutCapacity — an arena's seats: 40,000 × its city's ARENA_CAP factor. */
function boutCapacity(locIdx){const L=LOCATIONS[locIdx];return Math.round(40000*((typeof ARENA_CAP!=='undefined'&&L&&ARENA_CAP[L.n])||1))}
/* boutSales — a Match Week bout's ticket sales: demand from billing, fame, specials, news and Grand Games, filling as the week's hours run down; logs each change (14 kept). The real attendance once fought. TWEAK: fame /260, star /600, the 0.12–1 clamp. */
function boutSales(bout){const w=W_();const n=w&&w.night;if(!n||!bout)return null;const cap=boutCapacity(n.loc);
  const fames=bout.ents.map(gById).filter(Boolean).map(g=>g.fame||0);const fa=fames.length?fames.reduce((a,x)=>a+x,0)/fames.length:0;
  const star=Math.max(0,...fames);
  let d=(TIER_DRAW[bout.tier]||0.5)+fa/260+star/600+(bout.special?0.1:0)+(n.wAtt||0)+(n.grand?0.12:0);d=Math.max(0.12,Math.min(1,d));
  const hm=typeof hoursMax==='function'?hoursMax():10;const prog=0.38+0.62*(1-Math.max(0,Math.min(hm,w.hours??hm))/hm);
  // a little life in the numbers, fixed per bout and hour so a re-render never jitters
  const wob=1+((hashStr(String(w.week)+bout.tier+(w.hours??0))%9)-4)/200;
  const sold=bout.done&&bout.res&&bout.res.att?bout.res.att:Math.min(cap,Math.round(cap*d*prog*wob));
  bout.salesLog=bout.salesLog||[];const last=bout.salesLog[bout.salesLog.length-1];
  if(!bout.done&&(!last||last.s!==sold))bout.salesLog.push({h:w.hours??0,s:sold}),bout.salesLog.length>14&&bout.salesLog.shift();
  const prev=bout.salesLog.length>1?bout.salesLog[bout.salesLog.length-2].s:sold;
  return {sold,cap,delta:sold-prev,log:bout.salesLog.map(x=>x.s)}}
/* sparkSVG — a small sparkline of values, width × height px. */
function sparkSVG(vals,width=64,height=18){if(!vals||vals.length<2)return '';const lo=Math.min(...vals),hi=Math.max(...vals);const k=hi>lo?(height-4)/(hi-lo):0;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1)*(width-4)+2).toFixed(1)},${(height-2-(v-lo)*k).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--gold2)" stroke-width="1.6" stroke-linejoin="round"/></svg>`}
/* boutSalesStat — the tickets chip on a bout card: sold (K), % of capacity, the trend and the sparkline. */
function boutSalesStat(bout){let S2=null;try{S2=boutSales(bout)}catch(e){}if(!S2)return '';const pct=Math.round(S2.sold/S2.cap*100);
  const tr=S2.delta>0?`<em class="up">▲ ${houseK(S2.delta)}</em>`:S2.delta<0?`<em class="dn">▼ ${houseK(-S2.delta)}</em>`:'<em class="rc-sub">—</em>';
  return `<span class="bstat tix" title="${_T`Tickets sold for this bout, of the arena's ${S2.cap.toLocaleString()} seats. Demand follows the billing, the fighters' fame, the city and the week's news; sales climb as game day nears. The arrow is the change since the last sale was counted.`}"><i>${bout.done?_T('Attendance'):_T('Tickets sold')}</i><b>🎟 ${houseK(S2.sold)} <span class="rc-sub">/ ${houseK(S2.cap)} · ${pct}%</span> ${bout.done?'':tr}</b>${bout.done?'':sparkSVG(S2.log)}</span>`}

/* ================= v0.42 SEAT CONTROL =================
   Every fighter's board carries a chip: 🎮 Take control of a CPU gladiator, or 🤖 Hand to CPU your own.
   In Play now any gladiator may change hands at any moment; in a Manager bout only your own fighter.
   A hand-off mid-turn takes effect at once when the fighter is waiting on you, otherwise from their next turn. */
/* seatCanToggle — may this gladiator change hands (CPU ↔ you) now? Any in Play now; only your own fighter in a Manager bout. */
function seatCanToggle(player){if(!S||S.over||S.phase==='setup'||!player||!player.alive||player.exited||S.snap)return false;if(S.tutorial)return false;
  if(S.mgrCtx||S.specCtx)return !!player.mine||(player.mgrGid&&typeof gById==='function'&&(()=>{const g=gById(player.mgrGid);return g&&g.contract&&typeof me==='function'&&me()&&g.contract.mgr===me().id})());
  return true}
/* seatChipHTML — the 🎮 Take control / 🤖 Hand to CPU chip on a fighter's board. */
function seatChipHTML(player){if(!seatCanToggle(player))return '';return `<button type="button" class="seatchip ${player.cpu?'take':'give'}" data-seat="${player.id}" title="${player.cpu?_T('Play this gladiator yourself'):_T('Let the CPU play this gladiator')}">${player.cpu?_T('🎮 Take control'):_T('🤖 Hand to CPU')}</button>`}
/* seatToggle — hands a gladiator to you or to the CPU; when the CPU takes over a fighter whose turn is waiting, it plays that turn at once. */
async function seatToggle(player){if(!seatCanToggle(player))return;const G=S;
  if(player.cpu){player.cpu=false;player.simmed=false;log(_T`🎮 You take the reins of ${nm(player)}${cur()===player&&S.busy?_T(' — from their next turn'):''}.`,'big');render();return}
  player.cpu=true;player.diff=player.diff||'normal';log(_T`🤖 ${nm(player)} is handed to the CPU.`,'thought');render();
  if(cur()!==player||S.busy)return; // the loop will find a CPU at its next step
  S.busy=true;
  if(S.phase==='choice'){await takeChoice(player,cpuChoice(player));await flushMF();checkEnd();await settle();if(G!==S||S.over)return;
    if(!player.alive||player.exited){S.busy=false;return advanceTurn()}if(player.forceEnd){S.busy=false;return endTurn()}}
  if(isNaum())await cpuNaum(player);else if(isChariot())await cpuChariot(player);else await cpuAct(player);if(G!==S)return;
  S.busy=false;checkEnd();await settle();if(G!==S||S.over)return;await endTurn()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-seat]');if(!b||!S)return;e.stopPropagation();const p=S.players[+b.dataset.seat];if(p)seatToggle(p)},true);
/* the snap: a quiet card over the board while the event resolves */
/* simSnapShow — the "Simulating to the end…" card over the board. */
function simSnapShow(){const w=cv&&cv.parentElement;if(!w)return;let el=document.getElementById('snapCard');if(!el){el=document.createElement('div');el.id='snapCard';el.className='snapcard';w.appendChild(el)}
  el.innerHTML=`<div class="snapspin">⏭</div>${_T`<b>Simulating to the end…</b>`}<div class="rc-sub">${_T`every fighter in the CPU’s hands`}</div>`;el.hidden=false}
/* simSnapHide — removes the simulation card and redraws. */
function simSnapHide(){const el=document.getElementById('snapCard');if(el)el.remove();try{draw()}catch(e){}}

/* ================= v0.42 LAURELS FROM THE STANDS =================
   At a special event — the Superbus, an invitational, a festival, any non-classic billing — the crowd
   itself throws: a few flowers on every elimination, and a shower of laurels and flowers on the winner
   when it is over. Each toss leaves a real spectator's seat and lands on the sand, where it stays. */
/* isSpecialShow — is this a special show (Superbus, invitational, festival, any non-classic billing) whose crowd throws flowers? */
const isSpecialShow=()=>!!(S&&(S.specCtx||S.fest||(S.evKey&&!/^(democritus|egidious|cassian)$/.test(S.evKey))));
/* tossFrom — count flowers and laurels thrown from random seats to a tile (spread in tiles); a few throwers cheer. TWEAK: 220 tosses kept. */
function tossFrom(count,to,spread=0.5){if(!S||HEADLESS||!S.spect)return;S.tosses=S.tosses||[];const seats=S.spect.filter(s=>!s.gone&&s._x!=null);if(!seats.length)return;
  const now=performance.now();for(let i=0;i<count;i++){const s=seats[Math.floor(Math.random()*seats.length)];const m=center(to.r,to.c);
    S.tosses.push({sx:s._x,sy:s._y-TW*0.3,tx:m.x+(Math.random()-.5)*TW*spread*2,ty:m.y+(Math.random()-.5)*TW*spread,t0:now+i*90+Math.random()*120,dur:900+Math.random()*500,
      r:to.r,c:to.c,kind:Math.random()<.5?'laurel':'flower',col:['#e04a6a','#f2d04a','#f0f0e8','#b04ac8','#e8803a'][Math.floor(Math.random()*5)],rot:Math.random()*6,sp:s});if(Math.random()<.4)try{emote(s,Math.random()<.5?'🌸':'🌿','')}catch(e){}}
  if(S.tosses.length>220)S.tosses.splice(0,S.tosses.length-220);tossTick()}
/* tossTick — keeps redrawing while tosses are in the air. */
function tossTick(){if(tossTick.on)return;tossTick.on=1;const loop=()=>{try{draw()}catch(e){}const now=performance.now();if(S&&S.tosses&&S.tosses.some(q=>now<q.t0+q.dur+50))requestAnimationFrame(loop);else tossTick.on=0};requestAnimationFrame(loop)}
/* drawTosses — draws the tosses arcing from the stands to the sand (laurel sprigs or five-petal flowers). */
function drawTosses(){if(!S||!S.tosses||!S.tosses.length)return;const now=performance.now();
  for(const q of S.tosses){if(now<q.t0)continue;const k=Math.min(1,(now-q.t0)/q.dur);const x=q.sx+(q.tx-q.sx)*k,y=q.sy+(q.ty-q.sy)*k-Math.sin(k*Math.PI)*TW*1.6;
    ctx.save();ctx.translate(x,y);ctx.rotate(q.rot+(k<1?k*9:0));const u=TW/34;
    if(q.kind==='laurel'){ctx.fillStyle='#4f8a3a';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse((i*4-6)*u,(i%2?2.4:-2.4)*u,4*u,1.8*u,(i%2?0.5:-0.5),0,Math.PI*2);ctx.fill()}}
    else{ctx.fillStyle=q.col;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(Math.cos(i*1.256)*2.8*u,Math.sin(i*1.256)*2.8*u,2.3*u,2.3*u,0,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#f5d65a';ctx.beginPath();ctx.arc(0,0,1.5*u,0,Math.PI*2);ctx.fill()}
    ctx.restore()}}

/* ================= v0.42 A PIACULUM FOR EVERY FIGHTER =================
   The arena deck carries only the Piacula of the classes on the sand. A custom character — who has no
   printed card — gets one drawn for them in their own color, named for them, and shuffled in. */
/* piaCustomCard — registers a drawn Piaculum card for a custom class and returns its card key. */
function piaCustomCard(cls){const C=CLASSES[cls];if(!C)return null;const k='pia_'+cls;
  CARDS[k]={n:'Piaculum',type:'instant',d:_T`Give ${C.name} 2 coin. If that player is you, everyone gives you 2 coin.`,q:_T('To bear this worthily is good fortune'),img:null,cls,custom:1};return k}
/* PIA_URLS — cache of drawn Piaculum cards per class. */
const PIA_URLS={};
/* piaCardURL — a drawn Piaculum card in the class colour with its name, as a cached data URI. */
function piaCardURL(cls){if(PIA_URLS[cls])return PIA_URLS[cls];const C=CLASSES[cls]||{name:'Gladiator',color:'#a3281f'};const col=C.color||'#a3281f';const nm=String(C.name||'').toUpperCase().slice(0,16);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 350"><rect width="250" height="350" rx="14" fill="#2a1d12"/><rect x="8" y="8" width="234" height="334" rx="10" fill="${col}"/><rect x="16" y="16" width="218" height="318" rx="6" fill="#efe2c4"/>
   <rect x="16" y="16" width="218" height="46" fill="${col}"/><text x="125" y="48" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="700" letter-spacing="4" fill="#f5e8cc">PIACULUM</text>
   <circle cx="125" cy="150" r="62" fill="${col}" opacity=".18"/><circle cx="125" cy="150" r="46" fill="#e6b93a" stroke="#8a6a2a" stroke-width="4"/><text x="125" y="168" text-anchor="middle" font-family="Georgia,serif" font-size="48" font-weight="700" fill="#6a4e14">2</text>
   <text x="125" y="236" text-anchor="middle" font-family="Georgia,serif" font-size="${nm.length>11?16:20}" font-weight="700" fill="${col}">${nm.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>
   <text x="125" y="262" text-anchor="middle" font-family="Georgia,serif" font-size="12.5" fill="#3a2a1a">${_T`Give this gladiator 2 coin.`}</text><text x="125" y="280" text-anchor="middle" font-family="Georgia,serif" font-size="12.5" fill="#3a2a1a">${_T`If it is you, everyone gives you 2.`}</text>
   <text x="125" y="316" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-style="italic" fill="#6a5a44">${_T`“To bear this worthily is good fortune”`}</text></svg>`;
  return PIA_URLS[cls]='data:image/svg+xml,'+encodeURIComponent(svg)}
