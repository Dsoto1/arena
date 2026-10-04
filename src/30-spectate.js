/* =====================================================================
   30-SPECTATE · A SEAT IN THE STANDS (v0.38)
   =====================================================================
   You can watch ANY live event from the stands as a spectator:
   • Play now: with every seat CPU, "Join the stands yourself" seats you before the horns.
   • Mid-match: whenever no gladiator of yours is standing (none entered, or yours has fallen), the
     "🎟 Buy a ticket" button seats you. The ticket is paid from the active wallet (the lanista whose
     treasury bankrolls your wagers) and priced by the billing:
       general admission 4 · Undercard 3 · Feature bout 6 · Main event 12 · a special 10 · the Superbus 20.
   • Manager mode: every Match Week bout and every special/Superbus heat has a 🎟 Spectate button
     (if the career allows it — a house rule chosen at the founding, on by default).
   • Helping your own: every stone at a rival of your contracted fighter, or offering to your fighter,
     is noticed — the house loses 1 fame each, at most 3 in a bout. Allowed; never free.
   ===================================================================== */
const SPECT={pending:false,fameHit:0,S:null};
function ticketPrice(){if(!S)return 4;
  if(S.specCtx){const w=typeof W_==='function'?W_():null;return w&&w.special&&w.special.D&&w.special.D.finale?20:10}
  if(S.mgrCtx){const w=typeof W_==='function'?W_():null;const b=w&&w.night&&w.night.bouts[S.mgrCtx.bout];return b?({under:3,feature:6,main:12}[b.tier]||6):6}
  return 4}
function ticketLabel(){if(!S)return _T('general admission');if(S.specCtx){const w=W_();return w&&w.special&&w.special.D&&w.special.D.finale?_T('the Superbus'):_T('a special')}if(S.mgrCtx){const w=W_();const b=w&&w.night&&w.night.bouts[S.mgrCtx.bout];return b?TIERS[b.tier].n:_T('a Match Week bout')}return _T('general admission')}
function mgrSpectAllowed(){if(!(S&&(S.mgrCtx||S.specCtx)))return true;const w=typeof W_==='function'?W_():null;return !w||w.spectOK!==false}
function ticketOK(){return !!(S&&!S.over&&S.phase!=='setup'&&!HEADLESS&&!S.sim&&!S.tutorial&&!S.passive&&!S.exhib&&!EV().noSpect&&!isChariot()&&!isNaum()
  &&!S.players.some(p=>!p.cpu&&p.alive&&!p.exited)&&!(S.spect||[]).some(s=>s.human&&!s.gone)&&mgrSpectAllowed())}
async function buyTicket(){
  if(!ticketOK()||modalBusy())return;
  const price=(S.mgrCtx||S.specCtx)?ticketPrice():0;
  const inMgr=!!((S.mgrCtx||S.specCtx)&&typeof me==='function'&&me());
  let purse=inMgr?{coin:me().coin,name:me().name,ludus:me().ludus}:{coin:999,name:'You',ludus:'you',free:1}; /* v0.46: outside Manager mode a seat is free — no treasury, no wagers */
  if(purse.coin<price){await modal(_T`🎟 A ticket · ${price} coin`,`<p>${_T`A seat for <b>${esc(ticketLabel())}</b> costs <b>${price} coin</b>, but <b>${esc(purse.ludus||purse.name)}</b>'s treasury holds ${purse.coin}.`}</p>`,[{label:_T('Close'),value:null}],{close:null});return}
  const sec=await seatMapPick(price?_T`🎟 Choose your seat · ${price} coin`:_T('🎟 Choose your seat'),price?_T`A seat for <b>${esc(ticketLabel())}</b> costs <b>${price} coin</b> from <b>${esc(purse.ludus||purse.name)}</b>'s treasury (${purse.coin} coin). Click a stand.`:_T('Pick any stand — the seat is yours. Click a stand.'),{note:inMgr?_T('⚖ Helping your own fighter from the stands costs your house 1 fame each time (at most 3 a bout).'):''});
  if(sec==null||!ticketOK())return;
  if(inMgr){const m=me();m.coin-=price;if(typeof tnews==='function')tnews(_T`Bought a ${price}-coin ticket for ${esc(ticketLabel())} and sat in ${SECTIONS[sec].n}.`);saveWorld()}
  /* free seat outside Manager mode */
  const me9={id:S.spect.length?Math.max(...S.spect.map(s=>s.id))+1:0,rid:'you',name:'You',taste:'cf',temper:'loyal',look:{skin:SKINS[0],hair:HAIRS[0],beard:false,long:false},mem:[],visits:0,grudgeName:null,isNew:false,trouble:0,cf:0,sec,fav:null,favCls:null,mood:20,grudge:null,bet:null,human:true,gone:false,log:[],ticket:price};
  S.spect.push(me9);S.attendance=(S.attendance||0)+1;
  log(_T`🎟 ${price?_T`You buy a ticket (${price} coin) and take`:_T('You take')} a seat in <b>${SECTIONS[sec].n}</b>. From the next rotation, the stands are yours to use.`,'big');
  if(typeof slog==='function')slog(_T`<b>You</b> take a seat in ${SECTIONS[sec].n}.`);
  if(typeof sfx==='function')sfx('coin');render();me9.fav=undefined;await spectChooseFav(me9);render()}
/* who in this bout fights for your house? */
function myFighterIds(){if(!(S&&(S.mgrCtx||S.specCtx))||typeof me!=='function'||!me())return [];const mid=me().id;
  return S.players.filter(p=>{const g=p.mgrGid&&typeof gById==='function'?gById(p.mgrGid):null;return g&&g.contract&&g.contract.mgr===mid}).map(p=>p.id)}
function spectHelpCheck(kind,q){
  if(SPECT.S!==S){SPECT.S=S;SPECT.fameHit=0}
  const mine=myFighterIds();if(!mine.length)return;
  const helps=kind==='offer'?mine.includes(q.id):kind==='stone'?!mine.includes(q.id)&&mine.some(id=>S.players[id].alive):false;
  if(!helps)return;
  if(SPECT.fameHit>=3){log(_T('<i>The editors have stopped counting.</i>'));return}
  SPECT.fameHit++;const m=me();m.fame=clamp((m.fame||0)-1,0,100);saveWorld();
  log(_T`👁 Heads turn in the editor's box: the lanista of <b>${esc(m.ludus)}</b> is helping their own from the stands. <b>−1 fame</b>${SPECT.fameHit>=3?_T(' (that is the most it can cost this bout)'):''}.`,'bad');
  if(typeof tnews==='function')tnews(_T`Seen helping your own fighter from the stands: −1 fame.`,'bad')}
/* the button, and the Spectate entries in Manager mode */
function spectUI(){if(HEADLESS)return;const tb=document.getElementById('btnTicket');if(!tb)return;const ok=ticketOK();tb.hidden=!ok;
  if(ok){const paid=S.mgrCtx||S.specCtx;tb.innerHTML=paid?_T`🎟 Buy a ticket <small>${ticketPrice()} coin</small>`:_T('🎟 Take a seat');tb.title=paid?_T('Take a seat in the stands as a spectator — paid from the active wallet'):_T('Take a seat in the stands and interact with the event as a spectator')}
  if(SPECT.pending&&S&&!S.over&&S.phase!=='setup'&&S.turnNo>=1&&!modalBusy()){SPECT.pending=false;setTimeout(()=>buyTicket(),400)}}
document.addEventListener('click',e=>{if(e.target.closest('#btnTicket'))buyTicket()});
/* v0.41: who do you cheer for? You can't stone them, and the crowd sees your colors */
async function spectChooseFav(me){const act=activePlayers();if(!act.length){me.fav=null;return}
  const v=await modal(_T('📣 Who do you cheer for?'),`<p>${_T`Pick your gladiator for today. You will never throw a stone at them, and you wear their colors in the stands. (You may still throw offerings to anyone you can reach.)`}</p>`,
    [...act.map(p=>({label:p.name,sub:_T`${CLASSES[p.cls]?CLASSES[p.cls].name:''}${p.cpu?' · CPU':''} · CF ${p.cf}`,value:'p'+p.id})),{label:_T('No one — I just love the games'),value:'none'}],{close:'none'});
  me.fav=v&&v!=='none'?+String(v).slice(1):null;if(me.fav!=null){me.favCls=S.players[me.fav].cls;log(_T`📣 You cheer for <b>${esc(S.players[me.fav].name)}</b> from ${SECTIONS[me.sec].n}.`)}else log(_T('📣 You cheer for no one in particular.'))}
/* ================= v0.42 THE SEAT MAP =================
   Choosing a seat looks like a stadium box office: the empty arena from above, one colored circle on each of
   the eight stands (in its own color), how full it is, whose section it is — click a circle to sit there. */
function seatMapShot(){if(!cv)return null;const was=DRAW_EMPTY;DRAW_EMPTY=true;let url=null;
  const snap=S.snap;S.snap=false;try{draw();url=cv.toDataURL('image/jpeg',0.82)}catch(e){}DRAW_EMPTY=was;S.snap=snap;try{draw()}catch(e){}return url}
function seatMapPoints(){const out=[];for(let si=0;si<SECTIONS.length;si++){let x=0,y=0,n=0;for(let k=0;k<6;k++){const p=seatPos(si,k);if(p){x+=p.x;y+=p.y;n++}}if(n)out.push({si,x:x/n,y:y/n})}return out}
async function seatMapPick(title,intro,opt={}){const img=seatMapShot();const pts=seatMapPoints();const dpr=window.devicePixelRatio||1;const W=cv.width/dpr,H=cv.height/dpr; // v0.43: seat positions are in CSS pixels, the canvas is in device pixels
  const corner=(r,c)=>center(r,c);const P=[corner(0,0),corner(0,N-1),corner(N-1,N-1),corner(N-1,0)];
  const seats=[];for(let si=0;si<SECTIONS.length;si++)for(let k=0;k<10;k++){const q=seatPos(si,k);if(q)seats.push(`<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${(TW*0.09).toFixed(1)}" fill="${SECTIONS[si].col}" opacity=".55"/>`)}
  const plan=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto" aria-hidden="true"><rect width="${W}" height="${H}" fill="#1a120b"/><polygon points="${P.map(q=>q.x.toFixed(1)+','+q.y.toFixed(1)).join(' ')}" fill="#c9a877" stroke="#6b4d2a" stroke-width="3"/>${(S.pillars||[]).map(pl=>{const m=center(pl.r,pl.c);return `<ellipse cx="${m.x}" cy="${m.y}" rx="${TW*0.18}" ry="${TW*0.1}" fill="#8a7a64"/>`}).join('')}${seats.join('')}</svg>`;
  const html=`<p>${intro}</p><div class="seatmap">${plan}${img?`<img class="shot" src="${img}" alt="${_T`The arena from above`}">`:''}
    ${pts.map(({si,x,y})=>{const s=SECTIONS[si];const g=secPlayer(si);const n=(S.spect||[]).filter(x2=>!x2.gone&&x2.sec===si&&!x2.human).length;const dis=opt.disabled&&opt.disabled(si);
      return `<button type="button" class="seatdot${dis?' dis':''}" data-seatsec="${si}" ${dis?'disabled':''} style="left:${(x/W*100).toFixed(2)}%;top:${(y/H*100).toFixed(2)}%;--sc:${s.col}" title="${_T`${esc(s.n)} · Q${s.q}${g?' · '+esc(g.name)+_T('’s section'):''} · ${n}K seated`}">${_T`<span></span><em>${esc(s.n)}<small>Q${s.q}${g?' · '+esc(g.name):''} · ${n}K seated</small></em>`}</button>`}).join('')}</div>
    <p class="rc-sub" style="margin-top:6px">${_T`Your stand’s quadrant decides whom you can reach. ${opt.note||''}`}</p>`;
  const v=await modal(title,html,[{label:_T('Cancel'),value:null}],{wide:true,close:null,onOpen:done=>{const box=document.querySelector('.seatmap');if(box)box.addEventListener('click',e=>{const b=e.target.closest('[data-seatsec]');if(b&&!b.disabled)done('sec:'+b.dataset.seatsec)})}});
  return v&&String(v).startsWith('sec:')?+String(v).slice(4):null}
