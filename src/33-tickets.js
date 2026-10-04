/* =====================================================================
   33-TICKETS · THE BOX OFFICE (v0.41)
   =====================================================================
   Every Match Week bout sells tickets through the week. Demand comes from the billing, the fame of
   the fighters on the card, the city's arena and the week's news (world events, weather); the stands
   fill as game day nears (the week's recruiting hours are the clock). Each change is logged, so the
   card shows the count, the arena's capacity, the trend since the last change, and a small sparkline.
   After the card is fought, each result shows how many actually came.
   ===================================================================== */
const TIER_DRAW={under:0.42,feature:0.62,main:0.82};
function boutCapacity(li){const L=LOCATIONS[li];return Math.round(40000*((typeof ARENA_CAP!=='undefined'&&L&&ARENA_CAP[L.n])||1))}
function boutSales(b){const w=W_();const n=w&&w.night;if(!n||!b)return null;const cap=boutCapacity(n.loc);
  const fames=b.ents.map(gById).filter(Boolean).map(g=>g.fame||0);const fa=fames.length?fames.reduce((a,x)=>a+x,0)/fames.length:0;
  const star=Math.max(0,...fames);
  let d=(TIER_DRAW[b.tier]||0.5)+fa/260+star/600+(b.special?0.1:0)+(n.wAtt||0)+(n.grand?0.12:0);d=Math.max(0.12,Math.min(1,d));
  const hm=typeof hoursMax==='function'?hoursMax():10;const prog=0.38+0.62*(1-Math.max(0,Math.min(hm,w.hours??hm))/hm);
  // a little life in the numbers, fixed per bout and hour so a re-render never jitters
  const wob=1+((hashStr(String(w.week)+b.tier+(w.hours??0))%9)-4)/200;
  const sold=b.done&&b.res&&b.res.att?b.res.att:Math.min(cap,Math.round(cap*d*prog*wob));
  b.salesLog=b.salesLog||[];const last=b.salesLog[b.salesLog.length-1];
  if(!b.done&&(!last||last.s!==sold))b.salesLog.push({h:w.hours??0,s:sold}),b.salesLog.length>14&&b.salesLog.shift();
  const prev=b.salesLog.length>1?b.salesLog[b.salesLog.length-2].s:sold;
  return {sold,cap,delta:sold-prev,log:b.salesLog.map(x=>x.s)}}
function sparkSVG(vals,w=64,h=18){if(!vals||vals.length<2)return '';const lo=Math.min(...vals),hi=Math.max(...vals);const k=hi>lo?(h-4)/(hi-lo):0;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1)*(w-4)+2).toFixed(1)},${(h-2-(v-lo)*k).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--gold2)" stroke-width="1.6" stroke-linejoin="round"/></svg>`}
function boutSalesStat(b){let S2=null;try{S2=boutSales(b)}catch(e){}if(!S2)return '';const pct=Math.round(S2.sold/S2.cap*100);
  const tr=S2.delta>0?`<em class="up">▲ ${houseK(S2.delta)}</em>`:S2.delta<0?`<em class="dn">▼ ${houseK(-S2.delta)}</em>`:'<em class="rc-sub">—</em>';
  return `<span class="bstat tix" title="${_T`Tickets sold for this bout, of the arena's ${S2.cap.toLocaleString()} seats. Demand follows the billing, the fighters' fame, the city and the week's news; sales climb as game day nears. The arrow is the change since the last sale was counted.`}"><i>${b.done?_T('Attendance'):_T('Tickets sold')}</i><b>🎟 ${houseK(S2.sold)} <span class="rc-sub">/ ${houseK(S2.cap)} · ${pct}%</span> ${b.done?'':tr}</b>${b.done?'':sparkSVG(S2.log)}</span>`}

/* ================= v0.42 SEAT CONTROL =================
   Every fighter's board carries a chip: 🎮 Take control of a CPU gladiator, or 🤖 Hand to CPU your own.
   In Play now any gladiator may change hands at any moment; in a Manager bout only your own fighter.
   A hand-off mid-turn takes effect at once when the fighter is waiting on you, otherwise from their next turn. */
function seatCanToggle(p){if(!S||S.over||S.phase==='setup'||!p||!p.alive||p.exited||S.snap)return false;if(S.tutorial)return false;
  if(S.mgrCtx||S.specCtx)return !!p.mine||(p.mgrGid&&typeof gById==='function'&&(()=>{const g=gById(p.mgrGid);return g&&g.contract&&typeof me==='function'&&me()&&g.contract.mgr===me().id})());
  return true}
function seatChipHTML(p){if(!seatCanToggle(p))return '';return `<button type="button" class="seatchip ${p.cpu?'take':'give'}" data-seat="${p.id}" title="${p.cpu?_T('Play this gladiator yourself'):_T('Let the CPU play this gladiator')}">${p.cpu?_T('🎮 Take control'):_T('🤖 Hand to CPU')}</button>`}
async function seatToggle(p){if(!seatCanToggle(p))return;const G=S;
  if(p.cpu){p.cpu=false;p.simmed=false;log(_T`🎮 You take the reins of ${nm(p)}${cur()===p&&S.busy?_T(' — from their next turn'):''}.`,'big');render();return}
  p.cpu=true;p.diff=p.diff||'normal';log(_T`🤖 ${nm(p)} is handed to the CPU.`,'thought');render();
  if(cur()!==p||S.busy)return; // the loop will find a CPU at its next step
  S.busy=true;
  if(S.phase==='choice'){await takeChoice(p,cpuChoice(p));await flushMF();checkEnd();await settle();if(G!==S||S.over)return;
    if(!p.alive||p.exited){S.busy=false;return advanceTurn()}if(p.forceEnd){S.busy=false;return endTurn()}}
  if(isNaum())await cpuNaum(p);else if(isChariot())await cpuChariot(p);else await cpuAct(p);if(G!==S)return;
  S.busy=false;checkEnd();await settle();if(G!==S||S.over)return;await endTurn()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-seat]');if(!b||!S)return;e.stopPropagation();const p=S.players[+b.dataset.seat];if(p)seatToggle(p)},true);
/* the snap: a quiet card over the board while the event resolves */
function simSnapShow(){const w=cv&&cv.parentElement;if(!w)return;let el=document.getElementById('snapCard');if(!el){el=document.createElement('div');el.id='snapCard';el.className='snapcard';w.appendChild(el)}
  el.innerHTML='<div class="snapspin">⏭</div><b>Simulating to the end…</b><div class="rc-sub">every fighter in the CPU’s hands</div>';el.hidden=false}
function simSnapHide(){const el=document.getElementById('snapCard');if(el)el.remove();try{draw()}catch(e){}}

/* ================= v0.42 LAURELS FROM THE STANDS =================
   At a special event — the Superbus, an invitational, a festival, any non-classic billing — the crowd
   itself throws: a few flowers on every elimination, and a shower of laurels and flowers on the winner
   when it is over. Each toss leaves a real spectator's seat and lands on the sand, where it stays. */
const isSpecialShow=()=>!!(S&&(S.specCtx||S.fest||(S.evKey&&!/^(democritus|egidious|cassian)$/.test(S.evKey))));
function tossFrom(n,to,spread=0.5){if(!S||HEADLESS||!S.spect)return;S.tosses=S.tosses||[];const seats=S.spect.filter(s=>!s.gone&&s._x!=null);if(!seats.length)return;
  const now=performance.now();for(let i=0;i<n;i++){const s=seats[Math.floor(Math.random()*seats.length)];const m=center(to.r,to.c);
    S.tosses.push({sx:s._x,sy:s._y-TW*0.3,tx:m.x+(Math.random()-.5)*TW*spread*2,ty:m.y+(Math.random()-.5)*TW*spread,t0:now+i*90+Math.random()*120,dur:900+Math.random()*500,
      r:to.r,c:to.c,kind:Math.random()<.5?'laurel':'flower',col:['#e04a6a','#f2d04a','#f0f0e8','#b04ac8','#e8803a'][Math.floor(Math.random()*5)],rot:Math.random()*6,sp:s});if(Math.random()<.4)try{emote(s,Math.random()<.5?'🌸':'🌿','')}catch(e){}}
  if(S.tosses.length>220)S.tosses.splice(0,S.tosses.length-220);tossTick()}
function tossTick(){if(tossTick.on)return;tossTick.on=1;const loop=()=>{try{draw()}catch(e){}const now=performance.now();if(S&&S.tosses&&S.tosses.some(q=>now<q.t0+q.dur+50))requestAnimationFrame(loop);else tossTick.on=0};requestAnimationFrame(loop)}
function drawTosses(){if(!S||!S.tosses||!S.tosses.length)return;const now=performance.now();
  for(const q of S.tosses){if(now<q.t0)continue;const k=Math.min(1,(now-q.t0)/q.dur);const x=q.sx+(q.tx-q.sx)*k,y=q.sy+(q.ty-q.sy)*k-Math.sin(k*Math.PI)*TW*1.6;
    ctx.save();ctx.translate(x,y);ctx.rotate(q.rot+(k<1?k*9:0));const u=TW/34;
    if(q.kind==='laurel'){ctx.fillStyle='#4f8a3a';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse((i*4-6)*u,(i%2?2.4:-2.4)*u,4*u,1.8*u,(i%2?0.5:-0.5),0,Math.PI*2);ctx.fill()}}
    else{ctx.fillStyle=q.col;for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(Math.cos(i*1.256)*2.8*u,Math.sin(i*1.256)*2.8*u,2.3*u,2.3*u,0,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#f5d65a';ctx.beginPath();ctx.arc(0,0,1.5*u,0,Math.PI*2);ctx.fill()}
    ctx.restore()}}

/* ================= v0.42 A PIACULUM FOR EVERY FIGHTER =================
   The arena deck carries only the Piacula of the classes on the sand. A custom character — who has no
   printed card — gets one drawn for them in their own color, named for them, and shuffled in. */
function piaCustomCard(cls){const C=CLASSES[cls];if(!C)return null;const k='pia_'+cls;
  CARDS[k]={n:'Piaculum',type:'instant',d:_T`Give ${C.name} 2 coin. If that player is you, everyone gives you 2 coin.`,q:_T('To bear this worthily is good fortune'),img:null,cls,custom:1};return k}
const PIA_URLS={};
function piaCardURL(cls){if(PIA_URLS[cls])return PIA_URLS[cls];const C=CLASSES[cls]||{name:'Gladiator',color:'#a3281f'};const col=C.color||'#a3281f';const nm=String(C.name||'').toUpperCase().slice(0,16);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 350"><rect width="250" height="350" rx="14" fill="#2a1d12"/><rect x="8" y="8" width="234" height="334" rx="10" fill="${col}"/><rect x="16" y="16" width="218" height="318" rx="6" fill="#efe2c4"/>
   <rect x="16" y="16" width="218" height="46" fill="${col}"/><text x="125" y="48" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="700" letter-spacing="4" fill="#f5e8cc">PIACULUM</text>
   <circle cx="125" cy="150" r="62" fill="${col}" opacity=".18"/><circle cx="125" cy="150" r="46" fill="#e6b93a" stroke="#8a6a2a" stroke-width="4"/><text x="125" y="168" text-anchor="middle" font-family="Georgia,serif" font-size="48" font-weight="700" fill="#6a4e14">2</text>
   <text x="125" y="236" text-anchor="middle" font-family="Georgia,serif" font-size="${nm.length>11?16:20}" font-weight="700" fill="${col}">${nm.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>
   <text x="125" y="262" text-anchor="middle" font-family="Georgia,serif" font-size="12.5" fill="#3a2a1a">${_T`Give this gladiator 2 coin.`}</text><text x="125" y="280" text-anchor="middle" font-family="Georgia,serif" font-size="12.5" fill="#3a2a1a">${_T`If it is you, everyone gives you 2.`}</text>
   <text x="125" y="316" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-style="italic" fill="#6a5a44">${_T`“To bear this worthily is good fortune”`}</text></svg>`;
  return PIA_URLS[cls]='data:image/svg+xml,'+encodeURIComponent(svg)}
