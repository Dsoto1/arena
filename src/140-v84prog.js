/* =====================================================================
   140-V84PROG · v0.84 — PROGRAMMATA: painted notices on the city walls (Virgilante, approved 2026-10-04)
   =====================================================================
   1. THE ACTION — Your ludus → 📯 Promote gets a 4th button, 🖌 Paint the programmata (promoteCardHTML wrapper).
      It opens an inline setup in the panel (never a modal): up to 3 cities (the 12 arenas; cities hosting the
      season's fixtures inside the chosen weeks come first and say which week), 2–4 weeks, a featured fighter.
      Cost: PROG84.perCity (8) coin a city a week, the first week paid at once, + PROG84.hours (1) recruiting hour.
      One campaign at a time (m.prog84); ✕ Cancel any time (ask76 popup; the week paid is not refunded).
      State: m.prog84 = {cities:[li],from,until,gid,gname,cost,paid,def:{wk:mgrId},fame,fans,gate,gl:[],memorial}.
      UI state only: MGR.pg84 = {open,cities,weeks,gid}.
   2. EACH WEEK (endWeek wrapper, after the base, only when the week really advanced; seeded by hashStr from the
      career id + week — never the dice RNG): the week resolves — fame +1 (+2 with Showmanship ≥ 70), the featured
      fighter +1 fame and new regulars in those cities turn his fans (CROWD_CACHE r.fanOf, like 🍞 Feast a city);
      then the next week is paid (can't pay → it lapses, a letter from the clerk) and may be defaced.
      GATE (applyBout wrapper): a bout of a campaigning house in one of its cities pays +20% (PROG84.gate) of the
      appearance fee and of the lanista's purse cut on a win.
   3. RIVALS — DEFACED: when a week is paid, a rival house may whitewash the notices (chance PROG84.defBase + the
      bitterest grudge (m.rivalry / m.rivals[me]) × defPer, ≤ defMax; the first, fresh week is safe). That week
      brings nothing; a Consilium letter names the house. PROG84.force='deface' forces the next roll (tests).
      AI houses with Showmanship ≥ 65 sometimes paint their own (PROG84.aiP a week, 2–3 weeks, their next host cities,
      their star): fame +1 a week, fans, the gate bonus; a news line; shown on the city tile and the map.
   4. MEMORIAL — the featured fighter dies mid-campaign → P.memorial = that week: the wall turns to a memorial
      (D·M lettering, dark paint), fame keeps coming, no more fans.
   5. LOOK — .pg84wall: plaster (CSS gradients) over a stone plinth (assets/stone_wall.webp), Pompeian red lettering
      in Marcellus SC, a weeks bar (paid / done / defaced), cost a week, Cancel. The Imperium map marks campaign
      cities with a 🖌 disc (imperiumMapSVG wrapper; yours red, rivals' grey, tooltip); the city tile names them.
   ===================================================================== */
const PROG84={perCity:8,hours:1,gate:0.2,fame:1,showAt:70,fanP:0.3,aiFanP:0.15,defBase:0.06,defPer:1/250,defMax:0.35,aiShow:65,aiP:0.12,maxCities:3,weeks:[2,3,4],force:null};
const pg84R=(w,k)=>mulberry32(hashStr('prog84:'+((w&&w.id)||'')+':'+k));
const pg84On=(P,wk)=>!!P&&wk>=P.from&&wk<=P.until;
const pg84City=li=>LOCATIONS[li]?LOCATIONS[li].n:'?';
const pg84Names=c=>(c||[]).map(pg84City).join(', ');
function pg84Season(w,aw){return w.season+Math.floor((wkOf(w.week)-1+(aw-w.week))/12)}
/* the fixture of an absolute week: this week's real night (closures move it), else the shared schedule */
function pg84Fx(w,aw){
  const bye=typeof BYE_WKS!=='undefined'&&BYE_WKS.includes(wkOf(aw));
  if(aw===w.week&&w.night){const mb=(w.night.bouts||[])[2];return {loc:w.night.loc,ev:mb?mb.ev:'',bye:!!w.night.bye||bye}}
  const f=typeof fixtureFor==='function'?fixtureFor(pg84Season(w,aw),aw):null;return f?{loc:f.loc,ev:f.ev,bye}:null}
function pg84Dead(P){const g=P&&gById(P.gid);return !!P&&(!!P.memorial||(g&&g.alive===false))}
function pg84MemCheck(w,m,P){if(!P||P.memorial)return;const g=gById(P.gid);if(!g||g.alive!==false)return;P.memorial=w.week;
  if(m.isPlayer){tnews(`🖌 The programmata for ${esc(P.gname)} become a memorial.`);mnews(`✝ In ${esc(pg84Names(P.cities))} the painted notices for <b>${esc(P.gname)}</b> of ${esc(m.ludus)} now honour the dead.`)}}
/* regulars of those cities who turn fans of the featured fighter */
function pg84Fans(w,P,wk,p){const g=gById(P.gid);if(!g||g.alive===false)return 0;g.fame=clamp((g.fame||0)+1,0,100);let n=0;
  if(typeof CROWD_CACHE!=='undefined'){const R=pg84R(w,'fans'+P.gid+':'+wk);const names=new Set(P.cities.map(pg84City));
    for(const r of CROWD_CACHE)if(names.has(r.city)&&!r.banned&&!r.recruited&&r.fanOf!==g.name&&R.next()<p){r.fanOf=g.name;n++}}
  P.fans=(P.fans||0)+n;return n}
function pg84Bitter(w,m,m2){return Math.max(m2.rivalry||0,(m2.rivals&&m2.rivals[m.id])||0)}
/* a rival whitewashes the notices for week wk (decided when the week is paid) */
function pg84DefRoll(w,m,P,wk){const cands=w.mgrs.filter(m2=>!m2.isPlayer&&!m2.dead);if(!cands.length)return null;
  const R=pg84R(w,'def'+wk);let bit=0;for(const m2 of cands)bit=Math.max(bit,pg84Bitter(w,m,m2));
  const p=Math.min(PROG84.defMax,PROG84.defBase+bit*PROG84.defPer);const roll=R.next();const force=PROG84.force==='deface';if(force)PROG84.force=null;
  if(!force&&roll>=p)return null;
  const wt=m2=>1+Math.pow(pg84Bitter(w,m,m2),2)/50;let x=R.next()*cands.reduce((a,m2)=>a+wt(m2),0),who=cands[0];for(const m2 of cands){if((x-=wt(m2))<0){who=m2;break}}
  P.def[wk]=who.id;const b=pg84Bitter(w,m,who);
  sendLetter(w,{key:'pg84def-'+wk,kind:'letter',from:'the Consilium',adv:'consilium',seal:'🖌',title:'Our notices were painted over',until:wk+2,
    body:`<p>Men of <b>${esc(who.ludus)}</b>${b>=35?' — '+rivalTier(b).toLowerCase()+' rivals —':''} whitewashed our programmata in ${esc(pg84Names(P.cities))} overnight. This week they bring us nothing.</p>`});
  tnews(`🖌 ${esc(who.ludus)} painted over your notices: no gain this week.`,'bad');return who}
/* ---- start / cancel ---- */
function pg84Start(cities,weeks,gid){const w=W_(),m=me();if(!w||!m||m.prog84)return false;cities=[...new Set(cities)].filter(li=>LOCATIONS[li]).slice(0,PROG84.maxCities);
  const cost=PROG84.perCity*cities.length;const g=gById(gid);
  if(!cities.length||!PROG84.weeks.includes(+weeks)||!g||g.alive===false||w.hours<PROG84.hours||m.coin<cost)return false;
  w.hours-=PROG84.hours;m.coin-=cost;
  m.prog84={cities,from:w.week,until:w.week+(+weeks)-1,gid,gname:g.name,cost,paid:w.week,def:{},fame:0,fans:0,gate:0,gl:[],memorial:0};
  tnews(`🖌 Programmata for ${esc(g.name)} in ${esc(pg84Names(cities))}: ${weeks} weeks, ${cost} coin a week.`);mlog(m,`painted programmata for ${g.name} in ${pg84Names(cities)}`);
  return true}
function pg84Cancel(){const w=W_(),m=me();const P=m&&m.prog84;if(!P)return false;tnews(`🖌 The programmata in ${esc(pg84Names(P.cities))} were called off.`);delete m.prog84;return true}
/* ---- the week (endWeek wrapper) ---- */
function pg84Week(w,wk){const m=me();const P=m&&m.prog84;
  if(P&&pg84On(P,wk)){pg84MemCheck(w,m,P);
    if(P.def[wk]){/* defaced: nothing this week */}
    else{const f=PROG84.fame+((m.p&&m.p.show||0)>=PROG84.showAt?1:0);m.fame=clamp(m.fame+f,0,100);P.fame+=f;
      const n=P.memorial?0:pg84Fans(w,P,wk,PROG84.fanP);
      tnews(P.memorial?`✝ The memorial notices for ${esc(P.gname)}: fame +${f}.`:`🖌 Programmata: fame +${f}, ${esc(P.gname)} +1 fame${n?`, ${n}K new fans`:''}.`)}
    if(wk>=P.until){tnews(`🖌 The programmata in ${esc(pg84Names(P.cities))} fade: fame +${P.fame}, ${P.fans}K fans, +${P.gate} gate.`);delete m.prog84}
    else if(m.coin<P.cost){sendLetter(w,{key:'pg84lapse-'+wk,kind:'letter',from:'your clerk',adv:'clerk',seal:'🖌',title:'The painters stopped',until:wk+2,
        body:`<p>We could not pay the painters their ${P.cost} coin for the week. The notices in ${esc(pg84Names(P.cities))} are gone.</p>`});tnews('🖌 The programmata lapsed: no coin for the painters.','bad');delete m.prog84}
    else{m.coin-=P.cost;P.paid=wk+1;tnews(`🖌 Programmata: ${P.cost} coin for the painters.`);pg84DefRoll(w,m,P,wk+1)}}
  else if(P&&wk>P.until)delete m.prog84;
  /* the other houses */
  for(const m2 of w.mgrs){if(m2.isPlayer||m2.dead)continue;const Q=m2.prog84;
    if(Q){pg84MemCheck(w,m2,Q);if(pg84On(Q,wk)){m2.fame=clamp((m2.fame||0)+1,0,100);Q.fame+=1;if(!Q.memorial)pg84Fans(w,Q,wk,PROG84.aiFanP)}
      if(wk>=Q.until)delete m2.prog84;else if((m2.coin||0)>=Q.cost){m2.coin-=Q.cost;Q.paid=wk+1}else delete m2.prog84;continue}
    if(w.tutorial||m2.sica||((m2.p&&m2.p.show)||0)<PROG84.aiShow)continue;
    const R=pg84R(w,'ai'+m2.id+':'+(wk+1));const force=PROG84.force==='ai';if(!force&&R.next()>=PROG84.aiP)continue;
    const weeks=2+Math.floor(R.next()*2);const cities=[];for(let k=1;k<=weeks;k++){const fx=pg84Fx(w,wk+k);if(fx&&!fx.bye&&LOCATIONS[fx.loc]&&!cities.includes(fx.loc))cities.push(fx.loc)}
    cities.splice(1+Math.floor(R.next()*2));const star=rosterOf(m2).filter(g=>g.alive!==false).sort((x,y)=>effOvr(y)-effOvr(x))[0];
    const cost=PROG84.perCity*cities.length;if(!cities.length||!star||(m2.coin||0)<cost)continue;if(force)PROG84.force=null;
    m2.coin-=cost;m2.prog84={cities,from:wk+1,until:wk+weeks,gid:star.id,gname:star.name,cost,paid:wk+1,def:{},fame:0,fans:0,gate:0,memorial:0};
    mnews(`🖌 <b>${esc(m2.ludus)}</b> paints programmata for ${esc(star.name)} on the walls of ${esc(pg84Names(cities))}.`);mlog(m2,`painted programmata in ${pg84Names(cities)}`)}
}
{const base=endWeek;endWeek=async function(){const w0=W_();const wk=w0&&w0.week;const r=await base.apply(this,arguments);
  try{const w=W_();if(w&&w===w0&&!w.dead&&wk!=null&&w.week!==wk){pg84Week(w,wk);saveWorld()}}catch(e){console.error(e)}return r}}
/* ---- the gate (applyBout wrapper) ---- */
function pg84Gate(w,b){const li=w.night.loc,wk=w.week;
  for(const gid of b.ents){const g=gById(gid);const M=g&&g.contract&&mgrById(g.contract.mgr);const Q=M&&M.prog84;
    if(!Q||!pg84On(Q,wk)||Q.def[wk]||!Q.cities.includes(li))continue;
    const row=(b.res.rows||[]).find(x=>x.gid===gid);const base=(b.fee||0)+(row&&row.won?Math.round((b.purse||0)*(0.5+((M.p&&M.p.greed)||0)/300)):0);
    const add=Math.max(1,Math.round(base*PROG84.gate));M.coin+=add;Q.gate=(Q.gate||0)+add;
    if(M.isPlayer){(Q.gl=Q.gl||[]).push({wk,tier:b.tier,gid,n:add});tnews(`🖌 Your notices in ${esc(pg84City(li))} filled seats: +${add} coin (${esc(g.name)}).`)}}}
{const base=applyBout;applyBout=function(bi,res,opt){const w=W_();const b=w&&w.night&&w.night.bouts[bi];const was=b&&b.done;const r=base.apply(this,arguments);
  try{if(b&&!was&&b.done&&b.res)pg84Gate(w,b);for(const m of w.mgrs)if(m.prog84)pg84MemCheck(w,m,m.prog84)}catch(e){console.error(e)}return r}}
/* ---- the Promote panel ---- */
function pg84UI(){const m=me();MGR.pg84=MGR.pg84||{open:false,cities:[],weeks:3,gid:null};const U=MGR.pg84;
  const ros=rosterOf(m).filter(g=>g.alive!==false);if(!U.gid||!ros.some(g=>g.id===U.gid))U.gid=(ros.sort((x,y)=>effOvr(y)-effOvr(x))[0]||{}).id||null;return U}
function pg84BtnHTML(){const w=W_(),m=me();const P=m.prog84;
  if(P)return `<button class="btn" type="button" data-pg84="none" data-dis="One campaign at a time — cancel the one on the walls first.">🖌 Paint the programmata<small>on the walls now · ${P.until-w.week+1} week${P.until-w.week?'s':''} left</small></button>`;
  const U=pg84UI();
  return `<button class="btn${U.open?' on':''}" type="button" data-pg84="open" ${dis([!rosterOf(m).some(g=>g.alive!==false),'You need a fighter to feature.'],needHrs(w,PROG84.hours))}>🖌 Paint the programmata<small>${PROG84.hours} h · ${PROG84.perCity} coin a city a week · 2–4 weeks: fame, gate and fans where you fight</small></button>`}
function pg84SetupHTML(){const w=W_(),m=me();const U=pg84UI();const n=U.weeks;
  const fx={};for(let k=0;k<n;k++){const f=pg84Fx(w,w.week+k);if(f&&!f.bye&&LOCATIONS[f.loc])(fx[f.loc]=fx[f.loc]||[]).push(wkOf(w.week+k))}
  const lis=LOCATIONS.map((L,i)=>L?i:null).filter(i=>i!=null);
  lis.sort((a,b)=>((fx[a]?fx[a][0]:99)-(fx[b]?fx[b][0]:99))||pg84City(a).localeCompare(pg84City(b)));
  const rivals=w.mgrs.filter(m2=>!m2.isPlayer&&m2.prog84&&pg84On(m2.prog84,w.week));
  const cost=PROG84.perCity*U.cities.length;const ros=rosterOf(m).filter(g=>g.alive!==false).sort((x,y)=>effOvr(y)-effOvr(x));
  return `<div class="pg84set"><div class="pg84h"><b>🖌 Paint the programmata</b><button class="btn tksm" type="button" data-pg84="close" title="Close">✕</button></div>
    <div class="pg84lab">Cities <span class="rc-sub">up to ${PROG84.maxCities} · ⚔ = your league fights there</span></div>
    <div class="pg84cities">${lis.map(li=>{const on=U.cities.includes(li);const full=!on&&U.cities.length>=PROG84.maxCities;const rv=rivals.filter(m2=>m2.prog84.cities.includes(li));
      return `<button type="button" class="pg84c${on?' on':''}${fx[li]?' fx':''}" data-pg84="city" data-v="${li}" ${full?`data-dis="Three cities at most."`:''}><b>${esc(pg84City(li))}</b>${fx[li]?`<span>⚔ wk ${fx[li].join(', ')}</span>`:''}${rv.length?`<span class="pg84rv" title="Already on the walls">🖌 ${rv.map(m2=>esc(m2.ludus)).join(', ')}</span>`:''}</button>`}).join('')}</div>
    <div class="pg84row"><span class="pg84lab">Weeks</span><span class="seg">${PROG84.weeks.map(k=>`<button type="button" class="${k===n?'on':''}" data-pg84="wk" data-v="${k}">${k}</button>`).join('')}</span>
      <span class="pg84lab">Featured</span><select id="pg84g">${ros.map(g=>`<option value="${esc(g.id)}" ${g.id===U.gid?'selected':''}>${esc(g.name)}</option>`).join('')}</select></div>
    <p class="rc-sub" style="margin:4px 0">Each week: fame +${PROG84.fame} (+${PROG84.fame+1} with Showmanship ${PROG84.showAt}+), +${Math.round(PROG84.gate*100)}% fees and purses at your bouts there, new fans for your fighter. Rivals may paint over them.</p>
    <div class="acts"><button class="btn primary" type="button" data-pg84="go" ${dis([!U.cities.length,'Pick at least one city.'],[!U.gid,'Pick a fighter to feature.'],needHrs(w,PROG84.hours),needCoin(m,cost))}>🖌 Paint · ${cost} coin a week<small>${U.cities.length?`${cost*n} over ${n} weeks · first week now`:'pick a city'}</small></button></div></div>`}
function pg84WallHTML(){const w=W_(),m=me();const P=m.prog84;if(!P)return '';const g=gById(P.gid);const dead=pg84Dead(P);const up=s=>esc(String(s||'').toUpperCase());
  const weeks=[];for(let k=P.from;k<=P.until;k++){const st=P.def[k]?'def':k<w.week?'done':k===w.week?'now':'next';const who=P.def[k]&&mgrById(P.def[k]);
    weeks.push(`<i class="pg84w ${st}" title="Week ${wkOf(k)}${st==='def'?` — painted over by ${esc(who?who.ludus:'a rival')}`:st==='now'?' — this week (paid)':st==='done'?' — done':' — to come'}">${st==='def'?'✗':''}</i>`)}
  const left=P.until-w.week+1;
  const cityTx=P.cities.map(pg84City).map(up).join(' · ');
  const lines=dead?`<div class="pg84l1">${typeof faithMark85==='function'?faithMark85(gById(P.gid)):'D · M'}</div><div class="pg84l2">${up(P.gname)}</div><div class="pg84l3">FELL FOR THE FAMILIA OF ${up(m.ludus)}</div><div class="pg84l4">${cityTx} · REMEMBER HIM</div>`
    :`<div class="pg84l1">THE FAMILIA GLADIATORIA OF</div><div class="pg84l2">${up(m.ludus)}</div><div class="pg84l3">${up(P.gname)} FIGHTS AT</div><div class="pg84l4">${cityTx} · FELICITER</div>`;
  return `<div class="pg84wall${dead?' mem':''}" id="pg84wall"><div class="pg84plaster">${lines}</div>
    <div class="pg84foot"><div class="pg84bar" title="${left} week${left===1?'':'s'} left">${weeks.join('')}</div>
      <span>${dead?'✝ Memorial':'🖌 On the walls'} · ${left} week${left===1?'':'s'} left · ${P.cost} coin a week</span>
      <span class="rc-sub">fame +${P.fame}${dead?'':` · ${P.fans}K fans`} · gate +${P.gate}</span>
      <button class="btn tksm" type="button" data-pg84="cancel">✕ Cancel</button></div></div>`}
function pg84PanelHTML(){const m=me();if(m.prog84)return pg84WallHTML();return MGR.pg84&&MGR.pg84.open?pg84SetupHTML():''}
{const base=promoteCardHTML;promoteCardHTML=function(){const h=base.apply(this,arguments);try{const i=h.lastIndexOf('</div></div>');if(i<0)return h;
  return h.slice(0,i)+pg84BtnHTML()+'</div>'+pg84PanelHTML()+'</div>'+h.slice(i+12)}catch(e){console.error(e);return h}}}
document.addEventListener('click',async e=>{const t=e.target.closest&&e.target.closest('[data-pg84]');if(!t||!t.closest('#mgrBody'))return;if(t.hasAttribute('data-dis')||t.disabled)return;
  e.stopPropagation();e.preventDefault();const a=t.dataset.pg84,v=t.dataset.v;const U=pg84UI();const re=()=>{if(typeof MGR_REDRAW==='function')MGR_REDRAW()};
  if(a==='open'){U.open=!U.open;re();return}
  if(a==='close'){U.open=false;re();return}
  if(a==='city'){const li=+v;U.cities=U.cities.includes(li)?U.cities.filter(x=>x!==li):U.cities.length<PROG84.maxCities?[...U.cities,li]:U.cities;re();return}
  if(a==='wk'){U.weeks=+v;re();return}
  if(a==='go'){if(pg84Start(U.cities,U.weeks,U.gid)){U.open=false;U.cities=[];saveWorld();re();mToast(`🖌 The painters are at work in ${esc(pg84Names(me().prog84.cities))}.`)}return}
  if(a==='cancel'){const P=me().prog84;if(!P)return;const ok=await ask76('🖌 Cancel the programmata?',`The notices in <b>${esc(pg84Names(P.cities))}</b> come down. This week's ${P.cost} coin is not refunded.`,'Cancel them','Keep');
    if(ok&&pg84Cancel()){saveWorld();re()}return}},true);
document.addEventListener('change',e=>{if(e.target&&e.target.id==='pg84g'){pg84UI().gid=e.target.value}});
/* ---- the Imperium map + the city tile ---- */
function pg84All(){const w=typeof W_==='function'?W_():null;if(!w||!w.mgrs)return [];return w.mgrs.filter(m=>m.prog84&&pg84On(m.prog84,w.week)&&!m.dead).map(m=>({m,P:m.prog84}))}
{const base=imperiumMapSVG;imperiumMapSVG=function(){const h=base.apply(this,arguments);try{const all=pg84All();if(!all.length)return h;const w=W_();const by={};
  for(const {m,P} of all)for(const li of P.cities)(by[li]=by[li]||[]).push({m,P});
  const mk=Object.entries(by).map(([li,arr])=>{const L=LOCATIONS[li];if(!L)return '';const [x,y]=MAP_PX(L.x,L.y);const mine=arr.some(o=>o.m.isPlayer);
    const tip=arr.map(({m,P})=>`${m.isPlayer?'Your':esc(m.ludus)+'’s'} ${pg84Dead(P)?'memorial notices for':'programmata for'} ${esc(P.gname)} · ${P.until-w.week+1} wk left${P.def[w.week]?' (painted over)':''}`).join('\n');
    return `<g class="pg84mk${mine?' mine':''}" transform="translate(${x+34} ${y+30})"><circle r="21" fill="${mine?'#f3e6c8':'#cfc6b4'}" stroke="${mine?'#a3241c':'#6b6358'}" stroke-width="4"/><text y="8" text-anchor="middle" font-size="22">🖌</text><title>🖌 ${esc(L.n)}\n${tip}</title></g>`}).join('');
  const i=h.lastIndexOf('</svg>');return i<0?h:h.slice(0,i)+`<g class="pg84mks">${mk}</g>`+h.slice(i)}catch(e){console.error(e);return h}}}
{const base=cityTileHTML;cityTileHTML=function(){const h=base.apply(this,arguments);try{const F=hubFocus();const L=LOCATIONS[F];const all=pg84All().filter(o=>o.P.cities.includes(F));
  const mark='<div class="sect">🏛 The city today</div>';if(!all.length||!L||!h.includes(mark))return h;
  const line=`<p class="rc-sub pg84city">🖌 On the walls: ${all.map(({m,P})=>`<b>${m.isPlayer?'your':esc(m.ludus)}</b> ${pg84Dead(P)?'memorial for':'notices for'} ${esc(P.gname)}`).join(' · ')}</p>`;
  return h.replace(mark,line+mark)}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`
.pg84set{margin-top:8px;padding:8px 10px;border:1px solid var(--line,#5a4a36);border-radius:8px;background:rgba(0,0,0,.18)}
.pg84h{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.pg84lab{font-size:12.5px;color:var(--gold2,#e6c77a);margin-right:6px}
.pg84cities{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:5px;margin:4px 0 8px}
.pg84c{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:5px 7px;border-radius:6px;border:1px solid #5a4a36;background:#211912;color:inherit;font:inherit;font-size:12.5px;cursor:pointer;text-align:left}
.pg84c span{font-size:11px;opacity:.8}.pg84c.fx{border-color:#9a7a3c}.pg84c.fx span{color:#e6c77a;opacity:1}
.pg84c.on{background:#5c1a14;border-color:#e0574a;box-shadow:0 0 0 1px #e0574a inset}.pg84c .pg84rv{color:#c9bca6}
.pg84row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0}.pg84row select{max-width:200px}
.pg84wall{margin-top:8px;border-radius:6px;overflow:hidden;border:1px solid #6e5a40;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.pg84plaster{position:relative;padding:14px 12px 16px;text-align:center;font-family:'Marcellus SC',Georgia,serif;color:#a3241c;
  background:radial-gradient(ellipse at 20% 30%,rgba(255,255,255,.35),transparent 55%),radial-gradient(ellipse at 80% 70%,rgba(120,90,50,.18),transparent 60%),
  repeating-linear-gradient(97deg,rgba(0,0,0,.025) 0 2px,transparent 2px 7px),repeating-linear-gradient(8deg,rgba(255,255,255,.04) 0 3px,transparent 3px 11px),linear-gradient(180deg,#efe2c4,#e2cfa6 70%,#d6c094);
  border-bottom:10px solid transparent;border-image:url(${typeof assetURL==='function'?assetURL('stone_wall.webp'):'assets/stone_wall.webp'}) 30 round}
.pg84plaster::after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 12% 80%,rgba(90,60,30,.18) 0 6px,transparent 7px),radial-gradient(circle at 88% 18%,rgba(90,60,30,.14) 0 4px,transparent 5px),radial-gradient(circle at 63% 90%,rgba(90,60,30,.12) 0 9px,transparent 10px)}
.pg84plaster div{text-shadow:0 0 1px rgba(163,36,28,.55),1px 1px 0 rgba(120,20,10,.12);line-height:1.15;word-break:break-word}
.pg84l1{font-size:12px;letter-spacing:.18em}.pg84l2{font-size:24px;letter-spacing:.08em;margin:2px 0}.pg84l3{font-size:15px;letter-spacing:.1em}.pg84l4{font-size:13px;letter-spacing:.14em;margin-top:3px}
.pg84wall.mem .pg84plaster{color:#2a2420;filter:saturate(.55);background:linear-gradient(180deg,#ddd3bf,#c9bda4)}
.pg84wall.mem .pg84plaster div{text-shadow:0 0 1px rgba(30,25,20,.6)}
.pg84foot{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;padding:6px 10px;background:#1c1510;font-size:12.5px}
.pg84foot .btn{margin-left:auto}
.pg84bar{display:flex;gap:3px;flex:0 0 auto}.pg84w{display:inline-block;width:22px;height:9px;border-radius:2px;background:#3a2e22;font-style:normal;font-size:9px;line-height:9px;text-align:center;color:#fff}
.pg84w.done{background:#8a2a20}.pg84w.now{background:#d24a3a;box-shadow:0 0 0 1px #f0cf7d}.pg84w.def{background:#6b6358}
.pg84wall.mem .pg84w.done,.pg84wall.mem .pg84w.now{background:#7a7064}
.pg84city{margin:2px 0 4px}
@media (max-width:600px){.pg84l2{font-size:19px}.pg84cities{grid-template-columns:repeat(2,1fr)}}
`;document.head.appendChild(st)}
