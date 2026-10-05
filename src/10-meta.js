
/* =====================================================================
   10-META · MEMORY BETWEEN EVENTS
   =====================================================================
   - Store: one tiny persistence layer (localStorage here; a shared DB when published).
   - gameOver(): builds S.lastResult for EVERY finished event (sims read it too), settles
     wagers, updates the crowd's regulars, auto-updates summoned Ludus gladiators
     (roguelike: the fallen are struck), then shows the results modal (reopenable
     from Standings via S.showResults).
   - claimFreedom(): the rudis — 50+ CF winners retire into the Liberti memorial.
   - recordEvent(): Infamis top-20 (monthly), per-event high scores with attendance,
     the latest-playthrough card, Hall of Flavius progress.
   - Also: the betting exchange ledger (betRec/betPay/exchangeHTML), log export, the Thumb
     of Flavius ritual (thumbRitual), achievements and the Road of Flavius, the scribes'
     seeded event records, festivals, Carmina Fescennina, missios, the Fates table and
     the Annals window (hallHTML/openHall).
   ===================================================================== */
/* ================= STORAGE (shared db when available, else this browser) ================= */
/* withTimeout — resolves with the promise's value, or null if it takes longer than ms. */
const withTimeout=(promise,ms)=>Promise.race([promise,new Promise(r=>setTimeout(()=>r(null),ms))]);
/* Store — the persistence layer: list/put/getDoc/del on named collections — the shared artifact DB when the page has one (window.claude.use('db')), else localStorage flavius_<collection>. Failed DB writes are kept locally (_local) and merged back by list(). TWEAK: the 4000 ms DB timeout, the 450 ms retry. */
const Store={db:undefined,
  async get(){if(this.db===undefined){try{this.db=window.claude&&window.claude.use?await withTimeout(window.claude.use('db'),4000):null}catch(e){this.db=null}}return this.db},
  local(col){try{return JSON.parse(localStorage.getItem('flavius_'+col)||'[]')}catch(e){return []}},
  // v0.27: a db write that failed falls back to this browser; list() now merges those local-only docs back in,
  // so a record can never vanish from a board just because the shared store hiccupped.
  async list(col){const db=await this.get();if(db){try{const s=await db.collection(col).get();const out=s.docs.map(d=>({id:d.id,...d.data()}));const have=new Set(out.map(x=>x.id));
      for(const x of this.local(col))if(x._local&&!have.has(x.id))out.push(x);return out}catch(e){}}return this.local(col)},
  async put(col,id,data){const db=await this.get();if(db){for(let k=0;k<2;k++){try{await db.collection(col).doc(id).set(data);
        try{const arr=this.local(col);if(arr.some(x=>x.id===id&&x._local))localStorage.setItem('flavius_'+col,JSON.stringify(arr.filter(x=>x.id!==id)))}catch(e){}return true}catch(e){if(!k)await new Promise(r=>setTimeout(r,450))}}}
    try{const arr=this.local(col).filter(x=>x.id!==id);arr.push(db?{id,...data,_local:1}:{id,...data});localStorage.setItem('flavius_'+col,JSON.stringify(arr))}catch(e){}return false},
  async getDoc(col,id){const all=await this.list(col);return all.find(x=>x.id===id)||null},
  async del(col,id){const db=await this.get();if(db){try{await db.collection(col).doc(id).delete()}catch(e){}}
    try{localStorage.setItem('flavius_'+col,JSON.stringify(this.local(col).filter(x=>x.id!==id)))}catch(e){}},
};

/* ================= v0.22 THE BETTING EXCHANGE: a real ledger of every wager laid across the empire =================
   Written by the game itself: your wagers, gladiators betting on themselves, the crowd's opening slips (in CF),
   your Match Week bets and the rival lanistae's. Kept in this browser (last 300 slips). */
let BETLOG=null;
/* betlogLoad — the betting exchange ledger (localStorage flavius_betlog), loaded once. */
function betlogLoad(){if(BETLOG)return BETLOG;try{BETLOG=JSON.parse(localStorage.getItem('flavius_betlog')||'[]')||[]}catch(e){BETLOG=[]}return BETLOG}
/* betlogSave — saves the ledger, keeping the newest 300 slips. TWEAK: the 300. */
function betlogSave(){try{localStorage.setItem('flavius_betlog',JSON.stringify(betlogLoad().slice(-300)))}catch(e){}}
/* v0.24: slips carry EMPIRE time — the day of the month and the hour they were laid — so the board reads like a real week of betting */
const EN_MONTHS=[_T('January'),_T('February'),_T('March'),_T('April'),_T('May'),_T('June'),_T('July'),_T('August'),_T('September'),_T('October'),_T('November'),_T('December')];
/* betWhen — empire date and hour for a slip: "Month D · HH:MM" plus a sortable empire-time key (etk). */
function betWhen(season,week,dayOff=0,min=720){const w12=((week-1)%12+12)%12+1;const doy=((w12-1)*30+((season-1)*7)%30+Math.max(0,Math.min(29,dayOff)))%360;const m=Math.floor(doy/30),d=doy%30+1;
  const hh=Math.floor(min/60)%24,mm=Math.floor(min%60);return {when:`${EN_MONTHS[m]} ${d} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`,etk:((season-1)*360+doy)*1440+min}}
/* betRec — writes a wager slip into the exchange ledger (not for sims); returns its id. Unknown times get a random hour of the day. */
function betRec(slip){if(typeof S!=='undefined'&&S&&S.sim&&slip.src==='event')return null;const L=betlogLoad();
  const c=typeof calNow==='function'?calNow():null;const W=betWhen(slip.season||(c?c.season:1),slip.week||(c?c.week:1),slip.dayOff??0,slip.min??(600+Math.floor(Math.random()*600)));
  const r={id:'b'+Date.now().toString(36)+Math.floor(Math.random()*1e5).toString(36),at:new Date().toISOString(),date:W.when,etk:W.etk,status:'open',cur:'coin',...slip};
  L.push(r);if(L.length>300)L.splice(0,L.length-300);betlogSave();return r.id}
/* v0.28 THE EMPEROR'S TENTH and THE HOUSE LIMIT: winnings (the profit, not the stake) pay a 10% imperial tax,
   and no bookmaker will write a slip that could pay more than 500 coin — long odds take small stakes. */
const BET_TAX=0.10,BET_MAXPAY=500;
/* betPay — what a winning slip pays: gross, the Emperor's tenth on the profit, and net. */
function betPay(stake,odds){const gross=Math.round(stake*odds);const tax=Math.round(Math.max(0,gross-stake)*BET_TAX);return {gross,tax,net:gross-tax}}
/* betMaxStake — the largest stake a bookmaker accepts at these odds (pay-out capped at BET_MAXPAY), never more than the bank. */
const betMaxStake=(odds,bank)=>Math.max(1,Math.min(bank,Math.floor(BET_MAXPAY/Math.max(1.01,odds))));
/* betSettle — marks a slip won or lost (with its pay-out). */
function betSettle(id,won,pay){if(!id)return;const r=betlogLoad().find(x=>x.id===id);if(!r)return;r.status=won?'won':'lost';r.pay=won?(pay||0):0;r.settled=new Date().toISOString();betlogSave()}
/* exchangeHTML — the exchange board table: the newest slips (filtered, up to limit) with stake, odds and result. */
function exchangeHTML(filter,limit=30){const L=betlogLoad().filter(filter||(()=>true)).slice().sort((a,b)=>(b.etk||0)-(a.etk||0)||(b.at>a.at?1:-1)).slice(0,limit);
  if(!L.length)return `<p class="rc-sub" style="margin:4px 0">${_T`No slips on the board yet — the first wager of the day will appear here.`}</p>`;
  const cur=r=>r.cur==='CF'?'CF':'c';
  return `<div class="exch"><table><tr><th>${_T`When (empire time)`}</th><th>${_T`Where`}</th><th>${_T`Bettor`}</th><th>${_T`Selection`}</th><th class="n">${_T`Stake`}</th><th class="n">${_T`Odds`}</th><th class="n">${_T`Result`}</th></tr>${L.map(r=>`<tr class="${r.status}"><td>${esc(r.date||new Date(r.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}))}</td><td>${esc(r.city||'')}</td><td>${r.kind==='you'?_T('<b>You</b>'):esc(r.who||'')}<span class="dim"> · ${esc(r.kind==='you'?_T('your treasury'):r.kind||'')}</span></td><td>${esc(r.on||'')}</td><td class="n">${r.stake}${cur(r)}</td><td class="n">${(+r.odds).toFixed(2)}×</td><td class="n">${r.status==='open'?'<span class="opn">● open</span>':r.status==='void'?'<span class="dim">↩ void · returned</span>':r.status==='won'?`<span class="up">+${r.pay}${cur(r)}</span>`:`<span class="dn">−${r.stake}${cur(r)}</span>`}</td></tr>`).join('')}</table></div>`}
/* ================= LOG EXPORT ================= */
/* logText — the event log as plain text, with a header line (event, city, export time). */
function logText(){
  const ev=S?EV():null;
  const head=_T`FLAVIUS RULE · ${ev?ev.n:''} at ${S&&LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:''}\nExported ${new Date().toLocaleString()}\n`;
  return head+(S&&S.logLines?S.logLines.map(l=>l.cls==='hd'?`\n== ${l.text} ==`:(l.cls==='big'?'* ':'  ')+l.text).join('\n'):'');
}
/* exportLog — downloads the log as a .txt (or shows it in a copyable box when downloads are unavailable). */
async function exportLog(){
  const text=logText();
  const name=`flavius-log-${S?S.evKey:'event'}-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.txt`;
  let dl=null;try{dl=window.claude&&window.claude.use?await withTimeout(window.claude.use('downloads'),4000):null}catch(e){}
  if(dl){try{await dl.save({filename:name,data:text});return}catch(e){if(e&&e.code==='declined')return}}
  await modal(_T('Arena log'),`<p>${_T`Saving files is not available in this view. Copy the log below instead.`}</p><textarea id="logCopy" readonly style="width:100%;height:320px;background:var(--ink);color:var(--bone);border:1px solid var(--line2);border-radius:4px;font:12px var(--mono);padding:8px"></textarea>`,[{label:_T('Copy to clipboard'),value:'copy',primary:1},{label:_T('Close'),value:'close'}],{wide:1,onOpen:done=>{const ta=$('#logCopy');ta.value=text;$('#mBtns').querySelector('[data-mi="0"]').addEventListener('click',e=>{e.stopPropagation();navigator.clipboard.writeText(text).then(()=>{e.target.closest('button').firstChild.textContent=_T('Copied')},()=>{ta.select()})},{capture:true})}});
}
/* the Export log button. */
$('#btnExport').onclick=()=>{if(S&&S.logLines&&S.logLines.length)exportLog()};

/* ================= GAME OVER, RECORDS ================= */
/* fateBreakdown — the Fate score lines for a gladiator: CF held, −5 per hidden Mandata, and for winners the event reward, 5 per 3 trophies, 2 per Flavius item, 15 for the Golden Eagle, 10 for a crowd-hated win, 5 for a festival champion. TWEAK: those bonuses. */
function fateBreakdown(player,won,champ){
  if(player.retired)return {lines:[[_T('Retired from the event'),'0']],total:0};
  const L=[[_T('Crowd Favor held'),player.cf]];
  const mf=player.items?player.items.filter(i=>i.kind==='mf').length:0;if(mf)L.push([_T`Mandata Flavi still hidden ×${mf}`,-5*mf]);
  if(won){const ev=EV();L.push([_T('Event win'),ev.rounds[ev.rounds.length-1].reward.win||15]);
    const t3=Math.floor(player.trophies.length/3);if(t3)L.push([_T`Trophies: ${player.trophies.length} (5 CF per 3)`,t3*5]);
    const fl=['R','L'].filter(a=>player['w'+a]&&player['w'+a].flav).length+LOCS.reduce((s,l)=>s+player.pieces[l].filter(pc=>ARM[pc.key].flav).length,0);if(fl)L.push([_T`Flavius items ×${fl}`,fl*2]);
    if(player.items.some(i=>i.kind==='offer'&&i.key==='eagle'))L.push([_T('Golden Eagle held'),15]);
    if(weak(player,'pelted'))L.push([player.cls==='damnatio'?_T('Damnatio victory'):_T('Crowd-hated victory'),10]);}
  if(champ)L.push([_T('Festival champion'),5]);
  const total=L.reduce((s,[,v])=>s+v,0);
  return {lines:L.map(([a,v])=>[a,(v>0&&a!=='Crowd Favor held'?'+':'')+v]),total};
}
/* fateIdxOf — which Fate card image matches a fate result ([title, text]); spared thumbs show the 20 CF card. */
const fateIdxOf=fate=>{if(!fate)return null;if(/spared/.test(fate[0]))return fateRow(20).img;const F=FATES.find(F=>fate[0].endsWith(F.n));return F?F.img:null};
/* aliveInUniverse — whether a result row's gladiator lives on after the event: not retired, not thumbed down, and 20+ CF or spared. */
const aliveInUniverse=row=>!row.p.retired&&row.fate&&!/^Thumbs down/.test(row.fate[0])&&(row.f>=20||/spared/.test(row.fate[0]));
/* placements — result rows in finishing order: winners, then survivors by CF, then the eliminated, last out first. */
function placements(rows,winnerIds){
  const order=S.elimOrder||[];const pos=id=>order.findIndex(o=>o.id===id);
  return [...rows].sort((a,b)=>(winnerIds.has(b.p.id)-winnerIds.has(a.p.id))||((b.p.alive&&!b.p.retired)-(a.p.alive&&!a.p.retired))||(b.p.alive?b.f-a.f:pos(b.p.id)-pos(a.p.id)));
}
/* ================= THE THUMB OF FLAVIUS · the ritual (v0.18) =================
   A gladiator who ends on 17-19 CF faces the editor's judgement. The player rolls the d6 themself:
   4-6 and the thumb goes UP (spared, saved to the Ludus at 20 CF); 1-3 and a d12 decides which
   death on the Fate table claims them. Flavius's face reacts to every roll. Used by the results
   window AND Manager mode (same markup, same animation). */
const D6F=['⚀','⚁','⚂','⚃','⚄','⚅'];
/* thumbStageHTML — markup of one stage of the Thumb of Flavius ritual: Flavius's face, the die, the message, the verdict and a button. */
function thumbStageHTML(stage){ // stage:{mood,msg,die,dieLbl,btn,btnAttr,fate}
  return `<div class="thumbrite"><img class="flavface" src="${flavFaceURL(stage.mood||'calm')}" alt="${_T`Flavius, ${stage.mood||'calm'}`}">
    <div class="tr-body"><div class="tr-die">${stage.die!=null?`<span class="die-big">${stage.die}</span>`:''}${stage.dieLbl?`<span class="rc-sub">${stage.dieLbl}</span>`:''}</div>
    <p style="margin:4px 0 8px">${stage.msg}</p>${stage.fate?`<div class="rc-fname">${stage.fate}</div>`:''}${stage.btn?`<button class="btn primary" type="button" ${stage.btnAttr}>${stage.btn}</button>`:''}</div></div>`;
}
// tumble a die in place, then settle on the real (already-rolled) value
function tumbleDie(el,final,sides,ms=950){return new Promise(res=>{
  const face=v=>sides===6?D6F[v-1]:String(v);const t0=performance.now();
  const tick=()=>{const t=performance.now()-t0;if(t>=ms){el.textContent=face(final);el.classList.add('settled');res();return}
    el.textContent=face(1+Math.floor(Math.random()*sides));setTimeout(tick,60+t/12)};tick()})}
// run the whole ritual inside a container element; resolves {spared,d6,d12}
async function thumbRitual(box,{name,f,d6,d12,d12Fate}){
  box.innerHTML=thumbStageHTML({mood:'calm',msg:_T`<b>${esc(name)}</b> ends on <b>${cfAmt87(f)}</b>. The roar dies to a murmur; every eye climbs to the editor's box. ${esc(edName())} raises a hand…`,die:'🎲',dieLbl:'the d6',btn:_T('🎲 Roll the d6'),btnAttr:'data-tr-go="1"'});
  await new Promise(r=>{box.querySelector('[data-tr-go]').onclick=r});
  box.innerHTML=thumbStageHTML({mood:'shock',msg:_T('The die leaves his hand…'),die:'⚀',dieLbl:'the d6'});
  await tumbleDie(box.querySelector('.die-big'),d6,6);
  if(d6>=4){box.innerHTML=thumbStageHTML({mood:'cheer',msg:_T`<b>${d6}</b> — the thumb goes <b>UP</b>. The crowd erupts: <b>${esc(name)}</b> is spared, raised to ${cfAmt87(20)} and sent to the Ludus Flavius.`,die:D6F[d6-1],dieLbl:_T('spared (4-6)'),fate:_T('👍 Spared · Ludus Flavius')});
    try{flaviusMood('cheer',4200,.9)}catch(e){}return {spared:true,d6}}
  box.innerHTML=thumbStageHTML({mood:'smug',msg:_T`<b>${d6}</b> — the thumb turns <b>DOWN</b>. Flavius smiles thinly and calls for the d12: it will choose how ${esc(name)} leaves this world.`,die:D6F[d6-1],dieLbl:_T('condemned (1-3)'),btn:_T('🎲 Roll the d12'),btnAttr:'data-tr-go="2"'});
  await new Promise(r=>{box.querySelector('[data-tr-go]').onclick=r});
  box.innerHTML=thumbStageHTML({mood:'laugh',msg:_T('The d12 clatters across the marble…'),die:'1',dieLbl:'the d12'});
  await tumbleDie(box.querySelector('.die-big'),d12,12,1200);
  const F=d12Fate||fateRow(d12);
  box.innerHTML=thumbStageHTML({mood:'laugh',msg:_T`The d12 shows <b>${d12}</b>. ${esc(F.t)}`,die:String(d12),dieLbl:'the d12',fate:`✝ ${esc(F.g)} · ${esc(F.n)}`});
  try{flaviusMood('laugh',4200,.9)}catch(e){}
  return {spared:false,d6,d12};
}
/* resultCard — one gladiator's card in the results window: place, status, the Fate and its math, stats, and Save / Claim freedom buttons (or the hidden Thumb button). */
function resultCard(row,place,interim){
  const p=row.p,C=CLASSES[p.cls];const fb=fateBreakdown(p,row.won,row.champ);const el=(S.elimOrder||[]).find(o=>o.id===p.id);
  const status=row.won?_T('<span class="badge gold">Winner</span>'):p.retired?_T('<span class="badge bad">Retired</span>'):el?`<span class="badge bad">${_T`Eliminated · turn ${el.turn}${el.by?' · '+esc(el.by):''}`}</span>`:p.exited?_T('<span class="badge good">Exited</span>'):_T('<span class="badge good">Survived</span>');
  const fi=fateIdxOf(row.fate);
  if(row.thumbHide&&!row.thumbShown){ // the die has not been cast: hide the verdict behind the button
    return `<div class="rcard" style="--pc:${p.color}">
      <div class="rc-top"><span class="rc-place">${place}</span>${pArt(p,'sm')}<div><div class="rc-name">${esc(p.name)}</div><div class="rc-sub">${C.name} · ${typeof hsYou==='function'?hsYou(p):_T('You')}</div>${status}</div></div>
      <div class="rc-fate"><div><div class="rc-fname">${_T`🖑 Thumb of Flavius`}</div><p style="margin:6px 0">${_T`${cfAmt87(row.f)} — one short of certainty. The arena falls silent; every eye turns to the editor's box. Flavius weighs your ${row.won?_T('victory'):_T('showing')}… and reaches for the die.`}</p>
      <button class="btn primary" type="button" data-thumb="${p.id}" style="border-color:var(--gold)">${_T`🎲 Face the thumb — roll the d6<small>4-6 spares you to the Ludus; 1-3 hands your fate to the d12</small>`}</button></div></div>
    </div>`;
  }
  const st=p.stats||{};
  const stats=[[_T('⚔ Gladiators'),p.trophies.filter(t=>t.pk==='player').length],[_T('🐾 Beasts'),p.trophies.filter(t=>t.pk!=='player').length],[_T('Pots'),st.pots||0],[_T('Damage dealt'),st.dmgDealt||0],[_T('Cards'),st.cardsDrawn||0],[_T('Buys'),st.buy||0],[_T('Coin'),p.coin]];
  const pr=p.cpu&&p.pers?`<div class="rc-sub">${_T`<b>CPU priorities</b> ${PERS_KEYS.map(([k,l])=>`${l} ${p.pers[k]}`).join(' · ')}`}</div>`:'';
  const feel=p.cpu&&p.rel?Object.entries(p.rel).filter(([,v])=>Math.abs(v)>=25).map(([id,v])=>_T`${relState(v)[2]} ${relState(v)[1]} toward ${esc(S.players[id].name)}`).join(' · '):'';
  const survives=!interim&&aliveInUniverse(row);const table=typeof hsTable==='function'&&hsTable(); /* v0.88: a hot-seat table stays out of the Ludus Flavius */
  const free50=!interim&&!table&&row.won&&row.f>=50&&survives&&!p.mgrGid&&!p.cpu&&!isCustomCls(p.cls);
  const saveBit=survives&&!table?(row.savedDone?`<button class="btn" type="button" disabled>${_T`✓ ${esc(p.name)}'s Ludus record ${p.saved?_T('updated'):_T('saved')}<small>${p.saved?_T('automatic for summoned gladiators'):_T('one save per event')}</small>`}</button>`:`<button class="btn" type="button" data-save="${p.id}">${_T`Save ${esc(p.name)} in the Ludus<small>returns with ${cfAmt87(Math.min(25,Math.floor(row.f/2)))}${p.cpu?_T(' · CPU record: rival or bet-on gladiator, no missios'):''}</small>`}</button>`):'';
  const freeBit=free50?`<button class="btn" type="button" data-free="${p.id}" style="border-color:var(--gold)">${_T`🗡 Claim freedom · the rudis<small>leaves the sands forever, memorialized among the Liberti</small>`}</button>`:'';
  return `<div class="rcard" style="--pc:${p.color}">
    <div class="rc-top"><span class="rc-place">${place}</span>${pArt(p,'sm')}<div><div class="rc-name">${esc(p.name)}</div><div class="rc-sub">${C.name} · ${p.cpu?'CPU '+cpuMind(p):typeof hsYou==='function'?hsYou(p):_T('You')}</div>${status}</div></div>
    <div class="rc-fate">${interim?`<div>${S.exhib?_T`<b>${cfAmt87(row.f)}</b> · exhibition: ${p.alive?_T('still standing when the bout was called'):_T('pulled from the sand by the doctors — no Fate is drawn')}`:_T`<b>${cfAmt87(row.f)}</b> carried into the next event`}</div>`:`${fi!=null?cardHTML('f:'+fi,'md'):''}<div><div class="rc-fname">${esc(row.fate[0])}</div><table class="fmath">${fb.lines.map(([a,v])=>`<tr><td>${esc(a)}</td><td class="n">${cfAmt87(v)}</td></tr>`).join('')}<tr class="tot"><td>${_T`Final Fate score`}</td><td class="n">${cfAmt87(row.f)}</td></tr></table>${/Thumb/.test(row.fate[0])?`<div class="rc-sub">${esc(row.fate[1])}</div>`:''}${p.mgrGid?'':`<div class="rc-sub">${survives?(row.f>=50?_T('Free, or back for glory: can be saved in the Ludus.'):_T('Survives to the Ludus Flavius: can be saved.')):p.retired?_T('Retired: this character is gone.'):_T('Does not survive. Any saved record or missio for this character ends.')}</div>`}</div>`}</div>
    <details class="rc-more"><summary>${_T`Event stats`}</summary><div class="rc-stats">${stats.map(([a,v])=>`<span><b>${v}</b>${a}</span>`).join('')}</div></details>
    ${(st.spectCF||st.spectOffers)?`<div class="rc-sub">${_T`🏟 The stands (${houseHTML(S.attendance||0,S.seed,S.locIdx)} attended): <b>${cfAmt87('+'+(st.spectCF||0))}</b> in section cheers${st.spectOffers?_T` · <b>${st.spectOffers}</b> offering${st.spectOffers>1?'s':''} thrown, worth ~<b>${coinAmt87(st.spectVal||0)}</b>`:''}${(S.attendance||0)>8?_T(' · cheers scaled for the big house'):''}.`}</div>`:''}
    ${pr}${feel?`<div class="rc-sub">${feel}</div>`:''}
    ${p.mgrGid&&S.exhib?`<div class="rc-sub">${_T`Exhibition: no Fate — back to their ludus either way.`}</div>`:p.mgrGid?`<div class="rc-sub">${_T`Manager mode fighter: this Fate applies in the league too${survives?'.':_T(' — unless their lanista pays the editor blood money (settled on Match Week).')}`}</div>`:survives&&isCustomCls(p.cls)?`<div class="rc-sub"><span class="cbadge">✦ custom</span> ${_T`Result logged on ${esc(p.name)}'s character sheet (Creator Studio).`}</div>`:row.freedDone?`<div class="rc-sub"><span class="badge gold">${_T`🗡 Freed`}</span> ${_T`${esc(p.name)} takes the rudis and leaves the sands forever — memorialized among the <b>Liberti</b> (the Annals).`}</div>`:saveBit+freeBit}
  </div>`;
}
// v0.29 ONE CLOCK: while a living Manager career holds the wallet, ONLY its "End the week" advances the empire.
// Play-now events are fought on today's date. With no career, each event still moves the empire on a week.
async function careerHoldsClock(){try{if(typeof activeCid!=='function')return false;const id=await activeCid();if(!id)return false;const d=await Store.getDoc('mgrCareers',id);return !!(d&&!d.dead)}catch(e){return false}}
// v0.37: a survivor under Flavius's thumbs-down is executed by the d12 of the Fates, whatever their CF
function thumbsDownFate(){const d=1+rnd(12);const s=fateRow(d);return Object.assign([_T`Thumbs down · ${s.n}`,_T`Flavius's thumb turned down on a truce. The d12 shows ${d}: ${s.t}`],{d12:d,sub:s})}
/* gameOver — ends the event: builds S.result / S.lastResult (sims stop here), moves the calendar, settles wagers, updates the crowd, Ludus records, missios and the Gate of Life, then shows the results window (S.showResults reopens it). Wrapped by many later modules. */
async function gameOver(winners,reason){
  if(S.overShown)return;S.overShown=true;if(S.snap){S.snap=false;if(SPEED==='snap'){SPEED='normal';document.querySelectorAll('[data-speed]').forEach(x=>x.classList.toggle('on',x.dataset.speed==='normal'))}if(typeof simSnapHide==='function')simSnapHide()}
  S.over=true;S.phase='over';S.busy=false;render();
  if(!HEADLESS&&!S.sim)setTimeout(()=>{try{startCleanCrew()}catch(e){}},4200); // v0.33: the full post-show reset runs gore or no gore
  const G=S,ev=EV();recordHist();
  if(!S.sim&&!HEADLESS&&typeof sfx==='function'){setTimeout(()=>sfx('fanfare'),300);setTimeout(()=>sfx('horn'),1500)} /* v0.57: the closing horns, then the laurels */
  if(!S.sim&&!HEADLESS&&typeof isSpecialShow==='function'&&isSpecialShow())setTimeout(()=>{try{const ws=(winners||[]).map(w=>typeof w==='number'?S.players[w]:w).filter(player=>player&&player.alive&&!player.exited);const tg=ws.length?ws:[{r:6,c:6}];for(const w of tg)tossFrom(Math.round(36/tg.length),w,0.6)}catch(e){}},LAUREL_DELAY); /* v0.42: laurels and flowers from the stands — v0.57: only once the closing horns have sounded */
  // v0.22: every event played on its own moves the empire's calendar one week (Manager bouts belong to their career's week)
  if(!S.sim&&!HEADLESS&&!S.mgrCtx&&!S.specCtx&&!S.tourn&&!S.exhib&&!(S.fest&&S.fest.stage<2)&&typeof calAdvance==='function'&&!(await careerHoldsClock())){const c=calAdvance();S.calAdvanced=c;later(()=>log(_T`📅 The empire moves on: it is now <b>${empireDate(c.season,c.week).short}</b> — next on the schedule, ${esc(EVENTS[c.fx.ev]?EVENTS[c.fx.ev].n:_T('the games'))} at ${esc(LOCATIONS[c.fx.loc]?LOCATIONS[c.fx.loc].n:'')}.`,'thought'),400)}
  const wset=new Set(winners.map(w=>w.id));
  const interim=(S.fest&&S.fest.stage===1)||!!S.exhib||!!(S.specCtx&&S.specCtx.nofates)||!!(S.tourn&&S.tourn.nofates)||!!(ev.custom&&ev.nofates); // v0.29: Fates everywhere unless an event is set Fate-free // v0.27: invitational and tournament heats draw no Fate; a tournament's final does // exhibitions, like a festival's first leg, draw no Fate
  const rows=S.players.map(player=>{const won=wset.has(player.id);const f=finalCF(player,won);const fate=interim||(typeof missioNoFate==='function'&&missioNoFate(player))?null:(player.retired?[FATES[0].g+' · '+FATES[0].n,FATES[0].t]:(S.thumbsDown||[]).includes(player.id)?thumbsDownFate():fateFor(f));
    // a human facing the Thumb of Flavius rolls the die themselves, in the results window: the outcome
    // is already decided here (records need it), but it stays hidden until they press the button.
    const thumbHide=!!(fate&&/^Thumb of Flavius/.test(fate[0])&&!player.cpu&&!S.sim&&!HEADLESS);
    return {p:player,won,f,fate,thumbHide}});
  S.result={winners:[...wset],rows:rows.map(x=>({id:x.p.id,cls:x.p.cls,f:x.f,won:x.won,fate:x.fate?x.fate[0]:'',pers:x.p.pers,pots:x.p.stats.pots||0,r1pots:x.p.r1pots??(x.p.stats.pots||0),kp:x.p.trophies.filter(t=>t.pk==='player').length,kn:x.p.trophies.filter(t=>t.pk!=='player').length,buys:x.p.stats.buy||0,cards:x.p.stats.cardsDrawn||0,alive:x.p.alive,diff:x.p.diff,wR:x.p.wR&&x.p.wR.key,wL:x.p.wL&&x.p.wL.key,ap:LOCS.reduce((s,l)=>s+x.p.ap[l],0),armor:LOCS.flatMap(l=>x.p.pieces[l].map(pc=>pc.key)),bought:x.p.bought||[]}))};
  {const el=id=>(S.elimOrder||[]).find(o=>o.id===id);
    S.lastResult=({winners:[...wset],reason,turns:S.turnNo,rotations:S.rotation,att:S.attendance||0,seed:S.seed,npcKills:S.npcKills,firstOut:(S.elimOrder||[])[0]?S.elimOrder[0].id:null,
      rows:rows.map(x=>({id:x.p.id,name:x.p.name,cls:x.p.cls,f:x.f,won:x.won,alive:x.p.alive&&!x.p.retired,fate:x.fate?x.fate[0]:'',survives:aliveInUniverse(x),coin:x.p.coin,
        kp:x.p.trophies.filter(t=>t.pk==='player').length,kn:x.p.trophies.filter(t=>t.pk!=='player').length,pots:x.p.stats.pots||0,dmg:x.p.stats.dmgDealt||0,taken:x.p.stats.dmgTaken||0,
        buys:x.p.stats.buy||0,cards:x.p.stats.cardsDrawn||0,elimTurn:el(x.p.id)?el(x.p.id).turn:null,elimBy:el(x.p.id)?el(x.p.id).by:null,severed:['rarm','larm','rleg','lleg'].filter(l=>x.p.hp[l]<=0),mgrId:x.p.mgrGid||null,human:!x.p.cpu}))});
    if(S.sim){S.sim.done(S.lastResult);return}}
  try{if(!HEADLESS)render()}catch(e){} // v0.29: the player boards switch to the final Fate score
  if(S.mgrCtx)await mgrAfterWatch(S.lastResult,S.mgrCtx).catch(e=>console.error(e));
  if(S.specCtx&&typeof specAfterWatch==='function')await specAfterWatch(S.lastResult,S.specCtx).catch(e=>console.error(e));
  if(S.tourn&&typeof tournAfter==='function')await tournAfter(S.lastResult,S.tourn).catch(e=>console.error(e));
  // v0.27: your own event with a trophy attached — a human winner takes it home to the Annals
  if(!interim&&!S.tourn&&ev.custom&&ev.trophy&&typeof hallTrophy==='function'){const hw=rows.find(x=>x.won&&!x.p.cpu);if(hw)await hallTrophy(ev.trophy,{who:hw.p.name,why:_T`Won ${ev.n}`,saved:hw.p.saved}).catch(()=>{});
    else{const cw=rows.find(x=>x.won&&x.p.cpu);if(cw&&typeof rivalTrophy==='function')await rivalTrophy(ev.trophy,{who:cw.p.name,why:_T`Won ${ev.n}`,saved:cw.p.saved,cls:cw.p.cls}).catch(()=>{})}} /* v0.47: a CPU winner keeps it too — on their shelf */
  if(S.exhibCtx)await mgrAfterExhib(S.lastResult,S.exhibCtx).catch(e=>console.error(e));
  const wagers=await settleWagers(rows,wset).catch(()=>[]);
  if(!interim)await updateCrowdAfterEvent(wset).catch(()=>{}); // the regulars remember
  try{if(typeof bestiaryTally==='function'&&!interim)bestiaryTally()}catch(e){} // the keepers update the bestiary's ledgers
  let extra='';
  if(S.fest&&S.fest.stage===2){const top=[...rows].sort((a,b)=>b.f-a.f)[0];top.f+=5;top.champ=true;top.fate=fateFor(top.f);extra=`<p>${_T`<b>${esc(top.p.name)}</b> is crowned festival champion (${cfAmt87('+5')}).`}</p>`}
  log(winners.length?`${winners.map(nm).join(' & ')} ${winners.length>1?'win':'wins'} ${ev.n}! ${reason}`:reason,'big');
  if(!interim){recordEvent(rows).catch(()=>{});logCustomChars(rows).catch(()=>{})}
  // THE GATE OF LIFE (v0.19): a human-run gladiator who survives but leaves badly hurt — severed
  // limbs or a body near ruin — is carried to the Ludus INFIRMARY even if nobody saves them by hand.
  if(!interim)for(const x of rows){const p=x.p;
    if(p.cpu||p.saved||p.mgrGid||x.savedDone||isCustomCls(p.cls)||!aliveInUniverse(x)||x.thumbHide)continue;
    const sev=['rarm','larm','rleg','lleg'].filter(l=>p.hp[l]<=0);
    const lowHp=LOCS.reduce((s2,l)=>s2+Math.max(0,p.hp[l]),0)<=10;
    if(!sev.length&&!lowHp)continue;
    x.savedDone=true;const rec=await saveGladiator(x).catch(()=>null);
    if(rec){rec.status='infirmary';rec.infirm={wait:0,need:sev.length?_T('the Blessings of Hygeia'):_T('a Medicus regimen'),cost:(sev.length?HYGEIA*sev.length:0)+MEDICUS};
      await Store.put('gladiators',rec.id||p.saved,rec).catch(()=>{});await loadLudus();
      log(_T`${nm(p)} is carried through the Gate of Life to the <b>Ludus infirmary</b> — saved, but they need ${rec.infirm.need} (${coinAmt87(rec.infirm.cost)}) before they can fight again. Left untended too long, wounds write their own endings.`,'big')}}
  let mres=null;if(S.missio&&!interim)mres=await advanceMissio(rows);
  // roguelike Ludus: summoned gladiators update automatically at the end of every event they fight in.
  // Survive and the record grows; fall short and the record is struck for good. The sand keeps what it takes.
  if(!interim)for(const x of rows){const p=x.p;if(!p.saved)continue;
    if(x.thumbHide||x.savedDone)continue; /* v0.80: the Gate of Life already wrote this record */ // deferred until they roll the die in the results window
    if(aliveInUniverse(x)){x.savedDone=true;const rec=await saveGladiator(x).catch(()=>null);if(rec)log(_T`${nm(p)}'s Ludus record updates automatically: ${cfAmt87(rec.cf)}, returns with ${rec.carry}.`)}
    else if(!(S.missio&&(!p.cpu||(typeof missioHero==='function'&&p===missioHero())))){await markFallen(p,x).catch(()=>{});log(_T`${nm(p)} did not survive; their Ludus record is struck from the rolls for good.`,'bad')}}
  if(G!==S)return;
  await loadLudus().catch(()=>{});
  const ranked=placements(rows,wset);
  const ord=['1st','2nd','3rd','4th','5th','6th','7th','8th'];
  const title=winners.length?`${winners.map(w=>w.name).join(' & ')} ${winners.length>1?'win':'wins'} ${ev.short}`:_T('Flavius is not entertained');
  const hero=winners.length?`<div class="rbanner">${winners.map(w=>pArt(w,'md')).join('')}<div><div class="rb-title">${winners.map(w=>esc(w.name)).join(' & ')}</div><div class="rc-sub">${esc(reason)}</div><div class="rc-sub" title="${_T`Enter this under Options → Dice seed to replay the exact same rolls (same choices, same saved world required).`}">${_T`🎲 Seed ${S.seed}${S.attendance?_T` · 🏟 ${S.attendance}K spectators`:''}`}</div>${extra}${mres?`<p>${mres.msg}</p>`:''}</div></div>`:`<div class="rbanner"><div><div class="rb-title">${_T`No victor`}</div><div class="rc-sub">${esc(reason)}</div>${mres?`<p>${mres.msg}</p>`:''}</div></div>`;
  const body=()=>`${hero}
    <div class="rtabs seg" role="tablist"><button type="button" data-rtab="res" class="on">${_T`Results &amp; Fates`}</button><button type="button" data-rtab="graph">${_T`Performance graph`}</button><button type="button" data-rtab="fates">${_T`⚖️ The Fates table`}</button></div>
    ${wagers.length?(typeof wagerPanelHTML==='function'?wagerPanelHTML(wagers):`<div class="card2" style="margin-bottom:10px"><div class="sect" style="margin-top:0">${_T`Wagers`}</div>${wagers.map(w=>`<div style="font-size:13.5px">${w}</div>`).join('')}</div>`):''}
    <div id="rtab-res"><div class="rgrid">${ranked.map((x,i)=>resultCard(x,ord[i]||'',interim)).join('')}</div>
    <p class="hint">${_T`Final Fate score = Crowd Favor held, −5 per Mandata Flavi still hidden; winners add the event reward, ${cfAmt87(5)} per 3 trophies, ${cfAmt87(2)} per Flavius item, 15 for a held Golden Eagle and 10 for a Damnatio win. Gladiators slain by beasts already lost ${cfAmt87(5)} when they fell.`}</p></div>
    <div id="rtab-graph" hidden><div id="perfWrap">${perfTabs('s')+perfChartHTML('s')}</div></div><div id="rtab-fates" hidden>${fatesHTML()}</div>`;
  const btns=[];
  if(interim&&S.fest)btns.push({label:_T('Continue the festival'),sub:_T('Classic Elimination'),value:'fest',primary:1});
  if(mres&&mres.next)btns.push({label:_T('Next missio event'),sub:_T`step ${mres.rec.step+1} of 5`,value:'missio',primary:1});
  if(S.exhibCtx)btns.unshift({label:_T('Back to your ludus'),sub:_T('read the exhibition report'),value:'mgr',primary:1});
  if(S.specCtx)btns.unshift({label:_T('Back to your ludus'),sub:_T('back to the invitational bracket'),value:'mgr',primary:1});
  if(S.tourn)btns.unshift({label:_T('Back to the bracket'),sub:_T('the tournament goes on'),value:'tourn',primary:1});
  // v0.35: a Match Week bout watched live goes back to MATCH NIGHT — the next bout, your entries, your sims wait there
  /* v0.54: one button saves every survivor who may go to the Ludus Flavius */
  const saveAllOK=()=>!interim&&!S.mgrCtx&&!S.tutorial&&!(typeof hsTable==='function'&&hsTable())&&rows.filter(x=>aliveInUniverse(x)&&!x.savedDone&&!x.thumbHide&&!x.p.mgrGid).length>0;
  const saveAllBtn={label:_T('🏛 Save all to the Ludus Flavius'),sub:_T('every survivor not yet saved'),value:'saveall'};
  if(S.mgrCtx)btns.push({label:_T('⏎ Return to Match Week'),sub:_T('the next bout is waiting — enter, fight, watch or simulate it'),value:'mgrnight',primary:1},{label:_T('Watch the crew reset the arena'),sub:_T('Match Week fades back in when they finish'),value:'close'},{label:_T('Export log'),value:'export'});
  else if(S.tutorial)btns.push({label:S.cleanDone?_T('🧹 The show is over'):_T('🧹 Watch the clean-up show'),sub:S.cleanDone?_T('the crew has swept the sand'):_T('the crew resets the arena — then the main menu'),value:'close',disabled:!!S.cleanDone,primary:!S.cleanDone},{label:_T('🏛 Back to the main menu'),value:'menu',primary:!!S.cleanDone}); /* v0.46: a lesson ends simply */
  else btns.push({label:_T('New event'),value:'new',primary:!btns.length},...(typeof replayOK==='function'&&replayOK()?[{label:_T('🔁 Replay event'),sub:_T('same arena, gladiators and settings'),value:'replay'}]:[]),{label:_T('Export log'),value:'export'},{label:_T('Look at the board'),value:'close'},{label:'🏛',sub:_T('main menu'),value:'menu',title:_T('Back to the main menu')});
  if(saveAllOK())btns.splice(Math.max(0,btns.findIndex(b=>b.value==='export')),0,saveAllBtn);
  // the Standings button re-opens this results modal for as long as the board shows this event
  S.showResults=async(tab0)=>{let first=true;for(;;){
    const v=await modal(title,body(),btns,{wide:1,close:'close',keep:v=>v==='saveall'||v==='export'||/^(save|free|thumb):/.test(String(v)),onOpen:done=>{const mb=$('#mBody');wirePerf(mb);if(first&&tab0==='graph'){const gt=mb.querySelector('[data-rtab="graph"]');if(gt)setTimeout(()=>gt.click(),0)}first=false;mb.addEventListener('click',e=>{
      const t=e.target.closest('[data-rtab]');if(t){mb.querySelectorAll('[data-rtab]').forEach(b=>b.classList.toggle('on',b===t));$('#rtab-res').hidden=t.dataset.rtab!=='res';$('#rtab-graph').hidden=t.dataset.rtab!=='graph';{const f=$('#rtab-fates');if(f)f.hidden=t.dataset.rtab!=='fates'}return}
      const sv=e.target.closest('[data-save]');if(sv)done('save:'+sv.dataset.save);const fr=e.target.closest('[data-free]');if(fr)done('free:'+fr.dataset.free);const th=e.target.closest('[data-thumb]');
      if(th&&!th.dataset.busy){th.dataset.busy='1';const x=rows.find(r=>r.p.id===+th.dataset.thumb);const fz=th.closest('.rc-fate');
        if(x&&fz&&x.fate){const d6v=x.fate.d6||(/spared/.test(x.fate[0])?4+Math.floor(Math.random()*3):1+Math.floor(Math.random()*3));
          thumbRitual(fz,{name:x.p.name,f:x.f,d6:d6v,d12:x.fate.d12||1,d12Fate:x.fate.sub}).then(()=>{const b3=document.createElement('button');b3.className='btn';b3.type='button';b3.textContent=_T('Continue');b3.onclick=()=>done('thumb:'+x.p.id);fz.querySelector('.tr-body').appendChild(b3);setTimeout(()=>{if(b3.isConnected)done('thumb:'+x.p.id)},4500)})}
        else done('thumb:'+th.dataset.thumb)}})}});
    if(v==='export'){await exportLog();continue}
    if(v==='saveall'){for(const x of rows){if(!aliveInUniverse(x)||x.savedDone||x.thumbHide||x.p.mgrGid)continue;x.savedDone=true;const rec=await saveGladiator(x).catch(()=>null);if(rec)log(_T`${nm(x.p)} is saved in the Ludus Flavius with ${cfAmt87(rec.cf)} (returns with ${rec.carry}).`,'big')}
      saveAllBtn.disabled=true;saveAllBtn.label=_T('✓ All survivors saved');saveAllBtn.sub=_T('see them in the Ludus Flavius');continue}
    if(typeof v==='string'&&v.startsWith('save:')){const x=rows.find(r=>r.p.id===+v.slice(5));if(x&&!x.savedDone){x.savedDone=true;const rec=await saveGladiator(x);log(_T`${nm(x.p)} is saved in the Ludus Flavius with ${cfAmt87(rec.cf)} (returns with ${rec.carry}).`,'big')}continue}
    if(typeof v==='string'&&v.startsWith('thumb:')){const x=rows.find(r=>r.p.id===+v.slice(6));
      if(x&&x.thumbHide&&!x.thumbShown){x.thumbShown=true;
        log(_T`The die leaves ${edName()}’s hand… <b>${esc(x.fate[1])}</b>`,'big');
        flaviusMood&&flaviusMood(/spared/.test(x.fate[0])?'cheer':'laugh',4200,.9);
        // now the deferred roguelike consequence lands
        if(x.p.saved){if(aliveInUniverse(x)){x.savedDone=true;const rec=await saveGladiator(x).catch(()=>null);if(rec)log(_T`${nm(x.p)}'s Ludus record updates automatically: ${cfAmt87(rec.cf)}, returns with ${rec.carry}.`)}
          else if(!(S.missio&&(!x.p.cpu||(typeof missioHero==='function'&&x.p===missioHero())))){await markFallen(x.p,x).catch(()=>{});log(_T`${nm(x.p)} did not survive the thumb; their Ludus record is struck from the rolls for good.`,'bad')}}}
      continue}
    if(typeof v==='string'&&v.startsWith('free:')){const x=rows.find(r=>r.p.id===+v.slice(5));if(x&&!x.freedDone){x.freedDone=true;x.savedDone=true;await claimFreedom(x).catch(e=>console.error(e));log(_T`${nm(x.p)} takes the <b>rudis</b> and walks free, to a standing crowd. Their name joins the Liberti.`,'big')}continue}
    if(v==='mgr'){openManager('night');break}
    if(v==='mgrnight'){if(typeof cleanFinishNow==='function')cleanFinishNow();mgrFadeBack();break}
    if(v==='close'&&S.mgrCtx){S.mgrReturnPending=true;if(S.cleanDone)mgrFadeBack();break} // back once the crew is done
    if(v==='menu'){if(S.tutorial&&typeof tutToMenu==='function'){tutToMenu();break}try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}if(typeof transitRun==='function')transitRun(()=>menuShow(),_T('The main menu…'));else menuShow();break}
    if(v==='tourn'){openTourn();break}
    if(v==='replay'&&typeof replayEvent==='function'){replayEvent();break}
    if(v==='fest')continueFestival(rows);
    else if(v==='missio')startMissio(mres.rec);
    else if(v==='new')openSetup(true);
    break;
  }};
  await S.showResults();
}
/* isCustomCls — true for a Creator Studio class. */
const isCustomCls=clsKey=>!!(CLASSES[clsKey]&&CLASSES[clsKey].custom);
// Freedom: a winner with 50+ CF may take the rudis. They leave the system — Ludus record closed — and are memorialized among the Liberti.
async function claimFreedom(row){
  const p=row.p,ev=EV(),L=LOCATIONS[S.locIdx];
  const rec=p.saved?(LUDUS_CACHE.find(g=>g.id===p.saved)||await Store.getDoc('gladiators',p.saved).catch(()=>null)):null;
  const entry={name:p.name,cls:p.cls,clsName:CLASSES[p.cls].name,cf:row.f,event:`${ev.short||ev.n}${ev.sr?' · '+ev.sr:''}`,loc:L?L.n:'',date:new Date().toISOString().slice(0,10),
    kP:rec?gk(rec,'P'):p.trophies.filter(t=>t.pk==='player').length,kN:rec?gk(rec,'N'):p.trophies.filter(t=>t.pk!=='player').length,
    wins:rec?rec.wins:1,events:rec?rec.events:1,coin:(rec?rec.coin:0)||p.coin,missio:!!S.missio,
    portrait:rec&&rec.portrait||gladPortrait(p.saved||p.name,p.cls)};
  // v0.27: the whole career, not just the last night — the saved record's totals plus this final event
  {const st=p.stats||{},R=rec||{};const hs=typeof houseCount==='function'?houseCount(S.attendance||0,S.seed,S.locIdx):0;
    entry.career={events:(R.events||0)+1,wins:(R.wins||0)+1,kP:entry.kP+(rec?0:0),kN:entry.kN,dmg:(R.dmg||0)+(st.dmgDealt||0),taken:(R.taken||0)+(st.dmgTaken||0),
      cfSum:(R.cfSum||0)+row.f,best:Math.max(R.best||0,row.f),coin:entry.coin,pots:(R.pots||0)+(st.pots||0),house:(R.house||0)+hs,
      arenas:new Set([...(R.arenas||[]),S.locIdx]).size,fans:typeof fansFor==='function'?fansFor(p.name):0,
      fame:null,since:R.created||null,history:(R.history||[]).slice(-12).map(h=>({ev:h.event,loc:h.loc,won:h.won,cf:h.cf}))};
    if(rec){entry.career.kP=gk(rec,'P')+p.trophies.filter(t=>t.pk==='player').length;entry.career.kN=gk(rec,'N')+p.trophies.filter(t=>t.pk!=='player').length;entry.career.coin=(rec.coin||0)+p.coin}
    entry.career.history.push({ev:entry.event,loc:entry.loc,won:true,cf:row.f});
    entry.kP=entry.career.kP;entry.kN=entry.career.kN;entry.wins=entry.career.wins;entry.events=entry.career.events}
  if(typeof flaviusMood==='function')flaviusMood('weep',5200,.95);
  await libertiAdd({...entry,mine:!p.cpu});
  if(rec){rec.status='freed';rec.roster=false;rec.carry=0;rec.fate=_T('Freedom · the rudis');await Store.put('gladiators',rec.id,rec);await loadLudus().catch(()=>{})}
  return entry;
}
/* monthKey — "YYYY-MM" of a date — the Infamis month. */
const monthKey=(d=new Date())=>d.toISOString().slice(0,7);
/* monthName — "Month YYYY" for a "YYYY-MM" key. */
const monthName=mo=>{const [y,m]=mo.split('-');return new Date(+y,+m-1,15).toLocaleString(undefined,{month:'long',year:'numeric'})};
// The Infamis is a monthly season: only this month's top 20 stay on the board; each month's best is archived as its champion.
async function infamisMaintain(mo=monthKey()){
  try{const all=(await Store.list('infamis')).filter(r=>!r.ex);
    const old=all.filter(r=>(r.mo||String(r.date||'').slice(0,7))!==mo);
    if(old.length){const past=(await Store.getDoc('hall','infamisPast'))||{months:{}};past.months=past.months||{};
      for(const r of old){const m=r.mo||String(r.date||'').slice(0,7)||'earlier';const b=past.months[m];if(!b||r.cf>b.cf)past.months[m]={name:r.name,cls:r.cls,clsName:r.clsName||'',cf:r.cf,event:r.event,loc:r.loc,cpu:!!r.cpu}}
      await Store.put('hall','infamisPast',past);for(const r of old)await Store.del('infamis',r.id)}
    const cur=all.filter(r=>(r.mo||String(r.date||'').slice(0,7))===mo).sort((a,b)=>b.cf-a.cf);
    for(const r of cur.slice(20))await Store.del('infamis',r.id);
  }catch(e){}
}
/* infirmaryTick — each event, untended Ludus infirmary patients wait one more; after 4 the infirmary decides: 30% die, 30% limp off into the stands, 40% walk out healed (−3 CF). TWEAK: the 4 events and the .3/.6 odds. */
async function infirmaryTick(){
  for(const g of [...LUDUS_CACHE]){if(g.status!=='infirmary')continue;
    g.infirm=g.infirm||{wait:0,need:_T('a Medicus regimen'),cost:MEDICUS};g.infirm.wait++;
    if(g.infirm.wait<4){await Store.put('gladiators',g.id,{...g}).catch(()=>{});continue}
    const roll=Math.random(); // four events untended: the infirmary decides for you
    if(roll<.3){g.status='fallen';await Store.put('gladiators',g.id,{...g}).catch(()=>{});
      log(_T`🏥 <b>${esc(g.name)}</b> dies in the Ludus infirmary — four events on a cot and nobody paid for care.`,'bad')}
    else if(roll<.6){await Store.del('gladiators',g.id).catch(()=>{});LUDUS_CACHE=LUDUS_CACHE.filter(x=>x.id!==g.id);
      if(typeof CROWD_CACHE!=='undefined'){const r={id:'spinf'+g.id,name:g.name,taste:'survival',temper:'loyal',exGlad:1,visits:0,mem:[{d:new Date().toISOString().slice(0,10),kind:'exglad',note:_T`limped out of the Ludus infirmary untreated and never looked back: ${g.events||0} events, ${g.wins||0} wins`}],
        look:{skin:(g.portrait&&g.portrait.skin)||'#e0ac7e',hair:(g.portrait&&g.portrait.hair)||'#4a2c17',fem:!!(g.portrait&&g.portrait.fem),robe:'#5a4636'}};
        CROWD_CACHE.push(r);Store.put('crowd',r.id,r).catch(()=>{})}
      log(_T`🏥 <b>${esc(g.name)}</b> limps out of the infirmary in the night, wounds and all — gone from the rolls. The ushers say someone very like them now heckles from the cheap seats.`,'bad')}
    else{g.status='active';g.cf=Math.max(0,(g.cf||0)-3);g.carry=Math.min(25,Math.floor((g.cf||0)/2));delete g.infirm;await Store.put('gladiators',g.id,{...g}).catch(()=>{});
      log(_T`🏥 <b>${esc(g.name)}</b> grits their teeth and walks out of the infirmary HEALED by sheer spite — back on the rolls (${cfAmt87('−3')} for the limp).`)}}
  await loadLudus().catch(()=>{});
}
/* recordEvent — after a counted event: the latest-playthrough card, Infamis rows for winners, per-event high scores, Hall of Flavius progress, then sponsors, the Road and achievements. Custom events only update the latest card. */
async function recordEvent(rows){
  try{await infirmaryTick()}catch(e){}
  const ev=EV(),L=LOCATIONS[S.locIdx];
  const date=new Date().toISOString().slice(0,10),mo=monthKey();
  const customEv=!!ev.custom;
  // the most recent playthrough, win or lose: your gladiator (or the winner of an all-CPU event)
  const lr=rows.find(x=>!x.p.cpu)||rows.find(x=>x.won)||rows[0];
  if(lr){const p=lr.p;const el=(S.elimOrder||[]).find(o=>o.id===p.id);
    await Store.put('hall','latest',{name:p.name,cls:p.cls,clsName:CLASSES[p.cls].name,event:`${ev.short||ev.n}${ev.sr?' · '+ev.sr:''}`,loc:L?L.n:'',cf:lr.f,held:p.cf,att:S.attendance||0,fate:lr.fate?lr.fate[0]:'',
      status:lr.won?_T('Won the event'):p.retired?_T('Retired'):el?_T`Eliminated on turn ${el.turn}${el.by?' by '+el.by:''}`:p.exited?_T('Exited'):_T('Survived'),date,cpu:!!p.cpu,custom:customEv||isCustomCls(p.cls),manager:S.mgrCtx?S.mgrCtx.name:null,ts:Date.now()}).catch(()=>{});}
  if(customEv)return; // custom events never count toward the Infamis or the Hall of Flavius
  for(const x of rows.filter(x=>(x.won||x.champ)&&!isCustomCls(x.p.cls))){
    const p=x.p;const id=`${Date.now()}-${p.id}`;
    await Store.put('infamis',id,{name:p.name,cls:p.cls,clsName:CLASSES[p.cls].name,event:`${ev.short}${ev.sr?' · '+ev.sr:''}`,loc:L?L.n:'',att:S.attendance||0,rr:S.missio&&!p.cpu?(S.missioRR||0)+p.coin:p.coin,ff:(p.stats.mfRevealed||0)>0,cf:x.f,held:p.cf,notes:`${x.fate?x.fate[0]:''}${x.champ?_T(' · festival champion'):''}${p.cpu?' · CPU':''}`,date,mo,cpu:!!p.cpu});
  }
  await infamisMaintain(mo);
  // per-event high scores: the best Fate ever recorded in each event, with the attendance that watched it
  try{const er=(await Store.getDoc('hall','eventRecords'))||{};
    for(const x of rows.filter(x=>!isCustomCls(x.p.cls))){const cur=er[S.evKey];
      if(!cur||x.f>cur.cf)er[S.evKey]={name:x.p.name,cls:x.p.cls,clsName:CLASSES[x.p.cls].name,cf:x.f,won:!!x.won,att:S.attendance||0,loc:L?L.n:'',date,cpu:!!x.p.cpu}}
    await Store.put('hall','eventRecords',er)}catch(e){}
  // Hall of Flavius progress: human gladiators of the eight classes only
  const hall=(await Store.getDoc('hall','progress'))||{locs:[],killed:[],chars:{},classicWin:false};
  for(const x of rows.filter(x=>x.won&&!x.p.cpu&&!isCustomCls(x.p.cls))){
    if(!hall.locs.includes(S.locIdx))hall.locs.push(S.locIdx);
    if(['democritus','egidious','cassian'].includes(S.evKey))hall.classicWin=true;
    const ch=hall.chars[x.p.name]||(hall.chars[x.p.name]={locs:[],orderIdx:0});
    if(!ch.locs.includes(S.locIdx))ch.locs.push(S.locIdx);
    if(HALL_ORDER[ch.orderIdx]===S.locIdx)ch.orderIdx++;
  }
  for(const c of S.killedClasses||[])if(BASE_CLS.includes(c)&&!hall.killed.includes(c))hall.killed.push(c);
  await Store.put('hall','progress',hall);
  try{if(typeof sponsorAfterEvent==='function')await sponsorAfterEvent(hall)}catch(e){}
  try{await roadAfterEvent(rows)}catch(e){}
  try{await achievementsAfterEvent(rows,hall)}catch(e){}
}
/* =====================================================================
   v0.24 THE HALL OF FLAVIUS, FOR REAL: achievements that unlock rewards, the Road of Flavius,
   the scribes' seeded event records, and the Liberti fed from every road to freedom.
   ===================================================================== */
/* ACHIEVEMENTS — the Annals achievements: key, name, how to earn it and its reward (r). TWEAK: the rewards and texts. */
const ACHIEVEMENTS=[
  {k:'tutor',n:'Graduate of the Ludus',d:_T('Win the Learn-to-play bout.'),r:{title:_T('Graduate of the Ludus')},rn:_T('Title: Graduate of the Ludus')},
  {k:'first',n:'First Blood of Glory',d:_T('Win an event with a gladiator of your own.'),r:{helm:'laurel'},rn:_T('The laurel wreath for your tokens')},
  {k:'fifty',n:'The Crowd Is Yours',d:_T('Finish an event with 50+ Crowd Favor.'),r:{title:_T('Beloved of the Crowd')},rn:_T('Title: Beloved of the Crowd')},
  {k:'tholo',n:'Giant-Killer',d:_T('Eliminate Tholo.'),r:{weapon:'greatclub'},rn:_T("Tholo's great blunted club for your tokens")},
  {k:'commodus',n:'Usurper Unmasked',d:_T('Eliminate Commodus.'),r:{emblem:'eagle'},rn:_T('The imperial eagle shield emblem')},
  {k:'tamer',n:'Beast Whisperer',d:_T('Tame a beast.'),r:{extra:'collar'},rn:_T('The spiked collar for your beast tokens')},
  {k:'classes',n:'Every Colour of Death',d:_T('Eliminate every one of the eight classes (over any number of events).'),r:{base:'#1a1a1a'},rn:_T('The obsidian token base')},
  {k:'eightwins',n:'Master of Every School',d:_T('Win an event with each of the eight classes.'),r:{cape:'gold'},rn:_T('The golden cloak')},
  {k:'twelve',n:'The Grand Tour',d:_T('Win at all twelve arenas (any gladiators).'),r:{title:_T('Hero of the Twelve Arenas')},rn:_T('Title: Hero of the Twelve Arenas')},
  {k:'freed',n:'The Wooden Sword',d:_T('See one of your gladiators take the rudis.'),r:{title:_T('Friend of the Liberti')},rn:_T('Title: Friend of the Liberti')},
  {k:'veteran',n:'Sand in the Sandals',d:_T('Play 25 events.'),r:{coin:25},rn:_T('+25 coin for every new Manager career')},
  {k:'road3',n:'Pilgrim of the Road',d:_T('Walk three stages of the Road of Flavius.'),r:{face:'warpaint'},rn:_T('Road war paint for your tokens')},
  {k:'road12',n:'The Road of Flavius',d:_T('Win all twelve arenas, in the Hall\u2019s order, with ONE gladiator.'),r:{title:_T('Walker of the Road'),armor:'flavius'},rn:_T("Flavius's own gilded armor — and immortality in the Annals")}];
window.ACH_GOT=window.ACH_GOT||{};
/* loads the earned achievements into window.ACH_GOT shortly after start. */
setTimeout(()=>{achLoad().then(A=>{window.ACH_GOT=A.got||{}}).catch(()=>{})},600);
/* achLoad — the achievements record from Store hall/ach (earned dates, events played, classes that have won). */
async function achLoad(){return (await Store.getDoc('hall','ach').catch(()=>null))||{got:{},events:0,classWins:[]}}
/* achGrant — grants an achievement once: date, toast, fanfare and a log line. Returns false if it was already earned. */
async function achGrant(ach,key){if(ach.got[key])return false;ach.got[key]=new Date().toISOString().slice(0,10);window.ACH_GOT={...ach.got};const a=ACHIEVEMENTS.find(x=>x.k===key);
  if(typeof mToast==='function')setTimeout(()=>mToast(_T`🏆 <b>Achievement: ${esc(a.n)}</b> — ${esc(a.d)}`),900);if(typeof sfx==='function')setTimeout(()=>sfx('fanfare'),900);if(S&&!S.sim)log(_T`🏆 <b>Achievement unlocked: ${esc(a.n)}</b> — ${esc(a.d)} Engraved in the Annals.`,'big');return true}
/* achievementsAfterEvent — checks every achievement after a counted human event and saves the record. */
async function achievementsAfterEvent(rows,hall){if(S.sim||HEADLESS||(EV()&&EV().custom))return;const A=await achLoad();A.events=(A.events||0)+(S.simmed?0:1);
  const mine=rows.filter(x=>!x.p.cpu);const won=mine.filter(x=>x.won);
  if(won.length&&S.tutorial)await achGrant(A,'tutor'); // v0.42
  if(won.length)await achGrant(A,'first');if(mine.some(x=>x.f>=50))await achGrant(A,'fifty');
  const killedT=t=>S.npcs.some(n=>n.t===t&&!n.alive&&n.killedBy&&mine.some(x=>x.p.name===n.killedBy));if(killedT('tholo'))await achGrant(A,'tholo');if(killedT('commodus'))await achGrant(A,'commodus');
  if(S.npcs.some(n=>n.tamedBy!=null&&mine.some(x=>x.p.id===n.tamedBy)))await achGrant(A,'tamer');
  if(BASE_CLS.every(c=>(hall.killed||[]).includes(c)))await achGrant(A,'classes');
  for(const x of won)if(BASE_CLS.includes(x.p.cls)&&!A.classWins.includes(x.p.cls))A.classWins.push(x.p.cls);if(BASE_CLS.every(c=>A.classWins.includes(c)))await achGrant(A,'eightwins');
  if((hall.locs||[]).length>=12)await achGrant(A,'twelve');if(A.events>=25)await achGrant(A,'veteran');
  await Store.put('hall','ach',A)}
/* achUnlocked — the earned achievements map {key: date}. */
async function achUnlocked(){const A=await achLoad();return A.got||{}}
// The Road of Flavius: commit ONE Ludus gladiator; win the twelve arenas in the Hall's order, each at its own event.
async function roadLoad(){return (await Store.getDoc('hall','road').catch(()=>null))||null}
/* roadStage — the Road of Flavius stage a road record is on: location index, location and its event. */
function roadStage(road){const li=HALL_ORDER[road.step];return {li,L:LOCATIONS[li],ev:LOCATIONS[li].ev}}
/* roadAfterEvent — after an event on the Road: a win moves the walker on a stage (achievements at 3 and 12), a loss ends the road; past roads are kept (20). */
async function roadAfterEvent(rows){if(S.sim||HEADLESS||!S.road)return;const R=await roadLoad();if(!R||R.over||R.gid!==S.road.gid||R.step!==S.road.step)return;
  const x=rows.find(r=>r.p.saved===R.gid&&!r.p.cpu);if(!x)return;const st=roadStage(R);
  if(x.won){R.history.push({step:R.step,loc:st.L.n,ev:EVENTS[st.ev].n,cf:x.f,date:new Date().toISOString().slice(0,10)});R.step++;
    log(_T`🛣 <b>The Road of Flavius</b>: ${esc(R.name)} conquers ${esc(st.L.n)} — stage ${R.step} of 12.`,'big');
    const A=await achLoad();if(R.step>=3)await achGrant(A,'road3');if(R.step>=12){R.over='complete';await achGrant(A,'road12');log(_T`👑 <b>${esc(R.name)} HAS WALKED THE ROAD OF FLAVIUS.</b> Twelve arenas, in order, one gladiator. The Annals will never forget.`,'big')}await Store.put('hall','ach',A)}
  else{R.over='fell';R.fell={step:R.step,loc:st.L.n,date:new Date().toISOString().slice(0,10),how:x.p.alive?_T('lost the event'):_T('fell on the sand')};log(_T`🛣 The Road of Flavius ends for ${esc(R.name)} at ${esc(st.L.n)}, stage ${R.step+1}. The road forgives no one.`,'big')}
  await Store.put('hall','road',R);const past=(await Store.getDoc('hall','roadPast').catch(()=>null))||{list:[]};if(R.over){past.list.unshift({...R});past.list=past.list.slice(0,20);await Store.put('hall','roadPast',past)}}
// the scribes fill any empty event record: three matches of hard CPUs per event, the best Fate kept
async function seedEventRecords(onProg){if(S&&S.phase!=='setup'&&!S.over)return false;const er=(await Store.getDoc('hall','eventRecords'))||{};const keys=Object.keys(EVENTS).filter(k=>!EVENTS[k].custom&&!er[k]);if(!keys.length)return false;
  let done=0;for(const k of keys){const E=EVENTS[k];if(onProg&&onProg.start)onProg.start(k,done,keys.length);const n=Math.max(E.min,Math.min(4,E.max));const pool=(E.classes||BASE_CLS).filter(c=>!(E.noVenatore&&c==='venatore'));let best=null;
    for(let t=0;t<3;t++){const seats=Array.from({length:n},(_,i)=>{const cls=pool[(i+t)%pool.length];return {cls,cpu:true,diff:'hard',name:genName(),team:E.coop?'A':E.teams==='jugg'?(i===0?'J':'T'):E.teams?(i%2?'B':'A'):'P'+(i+1)}});
      let r=null;try{r=await simEvent({ev:k,loc:E.loc||6,seats,opts:{mods:true,mandata:true,optOffers:true,eaglePot:true,spect:12}})}catch(e){}
      if(r&&r.rows)for(const x of r.rows)if(!best||x.f>best.f)best={...x,att:r.att||0};await new Promise(z=>setTimeout(z,0))}
    if(best)er[k]={name:best.name,cls:best.cls,clsName:CLASSES[best.cls]?CLASSES[best.cls].name:best.cls,cf:best.f,won:!!best.won,att:best.att,loc:LOCATIONS[E.loc||6]?LOCATIONS[E.loc||6].n:'',date:_T('from the old scrolls'),cpu:true,seeded:true};
    done++;if(onProg)onProg(done,keys.length,k,er[k])}
  await Store.put('hall','eventRecords',er);return true}
// every freedom — from an event, or a Manager-mode rudis — is written among the Liberti
// v0.27 THE CAREER PLAQUE: every Liberti keeps the totals of a whole life on the sand
function libertiCareerHTML(entry){const c=entry.career||{events:entry.events||1,wins:entry.wins||1,kP:entry.kP||0,kN:entry.kN||0,coin:entry.coin||0,best:entry.cf,cfSum:entry.cf,legacy:1};
  const fans=c.fans??(typeof fansFor==='function'?fansFor(entry.name):0);
  const fame=c.fame!=null&&c.fame!==undefined&&c.fame!==null?c.fame:Math.max(0,Math.min(100,Math.round((c.wins||0)*5+(c.events||0)+fans*2+(c.best||0)/5)));
  const pct=c.events?Math.round(100*(c.wins||0)/c.events):0;const k=v=>typeof houseK==='function'?houseK(v):v;
  const T=(v,l,t='')=>`<span title="${esc(t)}"><b>${v}</b>${l}</span>`;
  return `<div class="lcareer"><div class="sect" style="margin:6px 0 4px">${_T`📜 Career${c.legacy?_T(' <span class="rc-sub">(freed before career ledgers — last-event figures)</span>'):c.seasons?` <span class="rc-sub">${_T`· ${c.seasons} season${c.seasons===1?'':'s'}${c.ludus?' with '+esc(c.ludus):''}${c.age?_T(' · freed at ')+c.age:''}`}</span>`:c.since?` <span class="rc-sub">${_T`· on the rolls since ${esc(c.since)}`}</span>`:''}`}</div>
    <div class="rc-stats lc-big">${T(c.events||0,_T('Events'))}${T(`${c.wins||0}<small> · ${pct}%</small>`,_T('Wins'))}${T(c.kP||0,_T('⚔ Gladiators slain'))}${T(c.kN||0,_T('🐾 Beasts slain'))}</div>
    <div class="rc-stats">${T(fans?'≈'+k(fans*1000):'—',_T('👥 Fans'),_T('Named regulars across the empire who still follow them — each stands for about a thousand Romans'))}${T(fame,_T('★ Fame'),_T('Renown across the empire, 0–100'))}${c.dmg!=null?T(c.dmg,_T('🗡 Damage dealt')):''}${c.taken!=null?T(c.taken,_T('🩸 Damage taken')):''}
      ${T(c.best||entry.cf,_T('Best Fate CF'))}${c.cfSum!=null&&!c.legacy?T(c.cfSum,_T('Career Fate CF'),_T('Every Fate score of every event, added up')):''}${T(c.coin||0,_T('Coin'))}${c.house?T(k(c.house),_T('🏟 Watched by'),_T('Everyone who ever watched them fight')):''}${c.arenas?T(c.arenas,_T('Arenas')):''}</div>
    ${c.history&&c.history.length>1?`<div class="lc-road" title="${_T`Their last events, oldest first`}">${c.history.map(h=>`<span class="${h.won?'w':''}" title="${_T`${esc(h.ev)} · ${esc(h.loc)} · ${h.cf} CF`}">${h.won?'🏆':'·'}${h.cf}</span>`).join('')}</div>`:''}
    <div class="rc-sub" style="margin-top:4px">${_T`Took the rudis with <b>${cfAmt87(entry.cf)}</b> after ${esc(entry.event)}${entry.loc?' at '+esc(entry.loc):''}${entry.missio?_T(' · missio fulfilled'):''}.`}</div></div>`}
/* libertiAdd — adds a freed gladiator to the Liberti (newest first, 80 kept) and grants the freedom achievement for your own. */
async function libertiAdd(entry){const h=(await Store.getDoc('hall','liberti').catch(()=>null))||{list:[]};if(h.list.some(x=>x.name===entry.name&&x.date===entry.date))return;h.list.unshift(entry);h.list=h.list.slice(0,80);await Store.put('hall','liberti',h);
  try{const A=await achLoad();if(entry.mine)await achGrant(A,'freed');await Store.put('hall','ach',A)}catch(e){}}

/* ================= FESTIVALS ================= */
/* startFestival — starts a festival with its first leg, the chariot race at Ludus Magnus (location 7) with no PvP. */
function startFestival(kind,sr,seats,opts){
  const fest={kind,sr,stage:1,seats:seats.map(s=>({...s}))};
  startEvent({ev:'chariot',loc:7,seats,opts,fest,chPvp:false});
}
// v0.16: FIVE festival kinds, each with its own fixed between-events gift. Every gift reuses an
// existing mechanic: cfStart/coinStart carry-over, the Health Elixir token, or the s.boost AP fitting.
const FEST_KINDS={
  ludi:{n:'Ludi Apollinare',boon:_T('+3 CF to every gladiator between events'),ap:s=>s.cfStart+=3},
  saturnalia:{n:'Saturnalia',boon:_T('+4 coin to every gladiator between events'),ap:s=>s.coinStart+=4},
  asclepieia:{n:'Asclepieia',boon:_T('a Health Elixir token (2 HP) for every gladiator between events'),ap:s=>(s.festItems=s.festItems||[]).push('elix2')},
  vulcanalia:{n:'Vulcanalia',boon:_T("+2 AP forged onto every gladiator's armor between events"),ap:s=>s.boost={...(s.boost||{}),ap:2}},
  fortuna:{n:'Fors Fortuna',boon:_T('+2 CF and +2 coin to every gladiator — Fortuna spreads it around'),ap:s=>{s.cfStart+=2;s.coinStart+=2}},
};
/* festName — a festival kind's display name. */
const festName=k=>FEST_KINDS[k]?FEST_KINDS[k].n:String(k||_T('Festival'));
/* continueFestival — after the festival's chariot race: carries CF and coin, applies the festival's gift and starts the Summa Rudis event in race order. */
function continueFestival(rows){
  const f=S.fest;const FK=FEST_KINDS[f.kind]||FEST_KINDS.ludi;
  const ranked=[...rows].sort((a,b)=>(b.won-a.won)||((b.p.alive-a.p.alive))||((b.p.ch.laps+chProg(b.p.r,b.p.c))-(a.p.ch.laps+chProg(a.p.r,a.p.c))));
  const seats=f.seats.map((s0,i)=>{const x=rows[i];const s={...s0,cfStart:x.f,coinStart:x.p.coin};FK.ap(s);return s});
  const srLoc={democritus:6,egidious:2,cassian:4}[f.sr]||6;
  const missio=S.missio;
  startEvent({ev:f.sr,loc:srLoc,seats,opts:{...S.opts},fest:{...f,stage:2},order:ranked.map(x=>x.p.id),missio});
  log(_T`Between events the ${FK.n} grants its gift: ${FK.boon}. Race order sets the turn order.`);
}

/* ================= CARMINA FESCENNINA ================= */
/* runCarmina — Carmina Fescennina before the event: each gladiator recites one unclaimed verse (CPUs by personality) or opts out. */
async function runCarmina(){
  log(_T('Carmina Fescennina: each gladiator recites one verse.'),'hd');
  const used=new Set();
  for(const p of S.players){
    const avail=CARMINA.map((c,i)=>i).filter(i=>!used.has(i));
    let i;
    if(p.cpu){const P=pers(p);const val=k=>({0:P.aggression,1:P.survival,2:P.survival,3:P.survival,4:P.aggression,5:(P.cf+P.coin)/2,6:P.aggression,7:P.coin,8:(P.coin+P.cf)/2,9:P.cf+10,10:P.coin,11:P.survival})[k]+rand()*30;i=avail.sort((a,b)=>val(b)-val(a))[0]}
    else i=await modal(_T`Carmina Fescennina · ${p.name}`,`<p>${_T`Recite one unique verse for its reward, or opt out and forfeit it. Each verse can be claimed by only one gladiator.`}</p>`,avail.map(k=>({label:`${k+1}. “${CARMINA[k].v.length>70?CARMINA[k].v.slice(0,68)+'…':CARMINA[k].v}”`,sub:CARMINA[k].d,value:k,card:'x:'+CARMINA[k].img})).concat([{label:_T('Opt out'),value:-1}]),{wide:1});
    if(i==null||i<0){log(_T`${nm(p)} declines to recite.`);continue}
    used.add(i);log(_T`${nm(p)} recites: “${CARMINA[i].v}” (${CARMINA[i].d}).`);think(p,'“'+CARMINA[i].v+'”','say');cardShow('x:'+CARMINA[i].img,p,_T('🎭 Recited'));await CARMINA[i].apply(p);
  }
  render();
}

/* ================= MISSIOS ================= */
/* newMissio — a fresh missio record for a character of a printed class. */
function newMissio(cls,name){return {id:`m${Date.now()}`,name,cls,step:0,cfCarry:0,rr:0,trophies:0,events:0,severed:[],status:'active',history:[],started:new Date().toISOString().slice(0,10)}}
/* missioCfg — the startEvent config for a missio's current step: the event, location, seats (the hero plus CPU classes the step names), teams and options. */
function missioCfg(rec){
  const st=MISSIOS[rec.cls].path[rec.step];const ev=EVENTS[st.ev];
  const me={cls:rec.cls,cpu:false,name:rec.name,cfStart:rec.cfCarry,severed:rec.severed,noHelm:st.noHelm,noZora:st.noZora,saved:rec.gladId||undefined};
  let n=st.solo||st.ev==='gauntlet'?1:ev.kind==='naumachia'?6:st.ev==='triumviratus'?3:clamp(4,ev.min,ev.max);
  let others=[...(st.vs||[]),...(st.pair?[st.pair]:[])];
  for(const c of shuffle(BASE_CLS.filter(c=>c!==rec.cls&&!others.includes(c)&&(!ev.classes||st.vs||ev.classes.includes(c)))))others.push(c);
  const seats=[me,...others.map(c=>({cls:c,cpu:true,diff:'normal'}))].slice(0,n);
  if(ev.teams==='jugg'){seats.forEach((s,i)=>s.team=st.jugg?(i===0?'J':'T'):(i===1?'J':'T'))}
  else if(ev.teams){seats.forEach((s,i)=>s.team=st.soloTeam?(i===0?'A':'B'):st.pair?(i<=1?'A':'B'):(i%2?'B':'A'))}
  else if(ev.coop)seats.forEach(s=>s.team='A');
  const opts={...CFG.opts,mods:true,carmina:false};
  const missio={id:rec.id,name:rec.name,cls:rec.cls,step:rec.step};
  if(st.fest)return {fest:{kind:st.fest,sr:st.ev},seats,opts,missio};
  return {ev:st.ev,loc:st.loc,seats,opts,missio,noCommodus:!!st.noCommodus,chPvp:st.ev==='chariot'?true:undefined};
}
/* startMissio — starts a missio's current step (a festival step starts with its chariot race). */
function startMissio(rec){
  const cfg=missioCfg(rec);S&&(S.over=true);
  if(cfg.fest){const fest={kind:cfg.fest.kind,sr:cfg.fest.sr,stage:1,seats:cfg.seats.map(s=>({...s}))};startEvent({ev:'chariot',loc:7,seats:cfg.seats,opts:cfg.opts,fest,chPvp:false,missio:cfg.missio});}
  else startEvent(cfg);
  S.missioRR=rec.rr;
}
/* advanceMissio — after a missio event: pass → carry CF, coin and severed limbs to the next step (complete after 5); fail → the missio ends (struck from the rolls if the hero died). Replaced by 84-v64. */
async function advanceMissio(rows){
  const recs=await Store.list('missios');const rec=recs.find(r=>r.id===S.missio.id);if(!rec)return null;
  const x=rows.find(x=>!x.p.cpu&&x.p.name===rec.name)||rows[0];const p=x.p;
  const st=MISSIOS[rec.cls].path[rec.step];
  const spared=x.fate&&/spared/.test(x.fate[0]);
  const pass=st.win?x.won:(x.won||x.f>=20||spared);
  rec.events++;rec.trophies+=p.trophies.length;
  rec.history.push({step:rec.step,ev:EVENTS[S.evKey].short,loc:LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:'',cf:x.f,won:x.won});
  let msg;
  if(pass){
    rec.rr+=p.coin;rec.cfCarry=Math.min(25,Math.floor(x.f/2));rec.severed=['rarm','larm','rleg','lleg'].filter(l=>p.hp[l]<=0);rec.step++;
    if(rec.step>=5){const req=MISSIOS[rec.cls].req||{};const ok=(!req.rr||rec.rr>=req.rr)&&(!req.trophies||rec.trophies>=req.trophies);
      rec.status=ok?'complete':'incomplete';
      msg=ok?_T`<b>Missio complete!</b> ${rec.name} claims the Missio Spoils: a Rudis, a Laurel Crown, ${coinAmt87(rec.rr)} from the Royal Reserve, freedom, and a hearty “Gratulationes”.`:_T`${rec.name} finished all five events but missed the missio requirement (${req.rr?_T`${rec.rr}/${req.rr} coin in RR`:''}${req.trophies?_T`${rec.trophies}/${req.trophies} trophies`:''}).`}
    else msg=_T`${rec.name} advances to step ${rec.step+1} of their missio, carrying ${cfAmt87(rec.cfCarry)}. Royal Reserve: ${coinAmt87(rec.rr)}.${rec.severed.length?_T` Severed limbs persist: ${rec.severed.map(l=>LOCN[l]).join(', ')}.`:''}`;
  } else {
    const dead=p.retired||!(x.f>=20||spared);
    if(dead){await Store.del('missios',rec.id);if(rec.gladId)await Store.del('gladiators',rec.gladId);return {rec,next:false,msg:_T`${rec.name} did not survive. The missio and the character are struck from the rolls.`}}
    rec.status='ended';msg=_T`${rec.name}'s missio ends here (this step had to be won). ${rec.name} survives with ${cfAmt87(x.f)} and can still be saved in the Ludus. The Royal Reserve is forfeit.`}
  await Store.put('missios',rec.id,rec);
  if(rec.gladId&&pass){const g=LUDUS_CACHE.find(x=>x.id===rec.gladId);if(g){p.saved=g.id;await saveGladiator(x);x.savedDone=true}}
  return {rec,next:rec.status==='active',msg};
}

/* v0.24: results show the gladiator — their portrait with their board token — not the old class-loadout cards */
function pArt(player,size='sm'){if(CLASSES[player.cls]&&CLASSES[player.cls].custom)return `<span class="partw">${classArt(player.cls,size)}<span class="ptok">${figureHTML(tokenForCls(player.cls),size==='md'?56:38)}</span></span>`;
  let look=null;try{const w=typeof mgrWorldAny==='function'?mgrWorldAny():null;const g=w&&player.mgrGid&&w.glads.find(x=>x.id===player.mgrGid);if(g&&typeof gLook==='function')look=gLook(g)}catch(e){}
  if(!look&&typeof gladPortrait==='function')look=gladPortrait(player.name||String(player.id),player.cls);
  return `<span class="partw">${look?portraitHTML({name:player.name,portrait:look,color:player.color},size):classArt(player.cls,size)}<span class="ptok">${figureHTML(tokenForCls(player.cls),size==='md'?56:38)}</span></span>`}
/* ================= FATES VIEWER ================= */
/* fatesHTML — the Fates table: after an event, how each fate was decided; during one, where each gladiator stands (if they fall / if they win). */
function fatesHTML(){
  // v0.24: once the event is over, the table shows what WAS decided, not guesses
  if(S&&S.over&&S.result&&S.result.rows){const R=S.result.rows;const fr=f=>fateRow(f);
    const done=`<h4>${_T`How each gladiator's fate was decided`}</h4><table class="tally"><tr><th>${_T`Gladiator`}</th><th>${_T`Result`}</th><th>${_T`Final CF`}</th><th>${_T`Fate`}</th></tr>${R.map(r=>{const p=S.players[r.id];return `<tr><td>${p?nm(p):'?'}</td><td>${r.won?'<b style="color:var(--gold2)">🏆 won</b>':p&&p.retired?'retired':p&&p.alive===false?'fell':'standing'}</td><td class="n">${r.f}</td><td><b>${esc(String(r.fate||fr(r.f).g+' · '+fr(r.f).n))}</b></td></tr>`}).join('')}</table>`;
    const who=f=>R.filter(r=>fr(r.f)===f).map(r=>{const p=S.players[r.id];return `<span class="badge ${r.won?'gold':''}" style="border-color:${p?p.color:''}">${p?esc(p.name):'?'}</span>`}).join(' ');
    return done+`<h4>${_T`The Fates (p.54-55)`}</h4><table class="tally"><tr><th>CF</th><th></th><th>${_T`Fate`}</th><th></th></tr>${FATES.map(f=>`<tr><td class="n" style="white-space:nowrap">${f.hi>999?f.lo+'+':f.lo===f.hi?f.lo:f.lo+'–'+f.hi}</td><td>${cardHTML('f:'+f.img,'sm')}</td><td><b>${f.g} · ${f.n}</b><br><span style="color:var(--muted);font-size:13px">${f.t}</span></td><td>${who(f)}</td></tr>`).join('')}</table>`}
  const live=S&&S.players&&S.phase!=='setup'?S.players.map(player=>{const fall=finalCF(player,false),win=finalCF(player,true);return {p:player,fall,win,rf:fateRow(fall),rw:fateRow(win)}}):[];
  const who=f=>live.filter(x=>x.rf===f).map(x=>`<span class="badge" style="border-color:${x.p.color}">${x.p.name}</span>`).join(' ')+live.filter(x=>x.rw===f&&x.rw!==x.rf).map(x=>`<span class="badge gold" title="${_T`if they win`}">${_T`${x.p.name} (if win)`}</span>`).join(' ');
  return `${live.length?`<h4>${_T`Where each gladiator stands right now`}</h4><table class="tally"><tr><th>${_T`Gladiator`}</th><th>${_T`CF now`}</th><th>${_T`If they fall`}</th><th>${_T`If they win`}</th></tr>${live.map(x=>`<tr><td>${nm(x.p)}</td><td class="n">${x.p.cf}</td><td>${_T`${cfAmt87(x.fall)} · <b>${x.rf.n}</b>`}</td><td>${_T`${cfAmt87(x.win)} · <b>${x.rw.n}</b>`}</td></tr>`).join('')}</table><p style="margin-top:6px">${_T`“If they fall” subtracts ${cfAmt87(5)} per unrevealed Mandata Flavi. “If they win” adds the event reward, ${cfAmt87(5)} per 3 trophies and ${cfAmt87(2)} per Flavius item.`}</p>`:''}
  <h4>${_T`The Fates (p.54-55)`}</h4><table class="tally"><tr><th>CF</th><th></th><th>${_T`Fate`}</th><th></th></tr>${FATES.map(f=>`<tr><td class="n" style="white-space:nowrap">${f.hi>999?f.lo+'+':f.lo===f.hi?f.lo:f.lo+'–'+f.hi}</td><td>${cardHTML('f:'+f.img,'sm')}</td><td><b>${f.g} · ${f.n}</b><br><span style="color:var(--muted);font-size:13px">${f.t}</span></td><td>${who(f)}</td></tr>`).join('')}</table>`;
}
if($('#btnFates'))$('#btnFates').onclick=()=>{if(modalBusy())return;modal(_T('Fate'),fatesHTML(),[{label:_T('Close'),value:1}],{wide:1})};

/* ================= INFAMIS & HALL OF FLAVIUS ================= */
/* hallHTML — the Annals window body for a tab: Infamis, event records, Hall of Flavius (achievements, arenas, the Road), Liberti, trophies, archives or missios. */
async function hallHTML(tab){
  const tabs=`<div class="seg" role="tablist" style="margin-bottom:10px">${[['infamis',_T('Infamis')],['events',_T('Event records')],['hall',_T('Hall of Flavius')],['liberti',_T('Liberti')],['trophies',_T('🏆 Trophy case')],['missios',_T('Missios')],['ludus',_T('🛡 Your Play Now Gladiators')]].map(([k,l])=>`<button type="button" data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div>`;
  if(tab==='events'){
    let er=(await Store.getDoc('hall','eventRecords'))||{};
    const empty=Object.keys(EVENTS).filter(k=>!EVENTS[k].custom&&!er[k]);
    const keys=Object.keys(EVENTS).filter(k=>!EVENTS[k].custom);
    return tabs+`${empty.length?`<div class="card2 scrollbox" id="seedProg"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:26px">📜</span><div style="flex:1;min-width:220px">${empty.length===1?_T`<b>1 event record lies empty.</b>`:_T`<b>${empty.length} event records lie empty.</b>`}<div class="rc-sub">${_T`The scribes can unroll the old scrolls: three bouts of hard CPUs for each event, and the best Fate stands as the record to beat.`}</div></div><button class="btn primary" type="button" data-seedrun="1" ${S&&S.phase!=='setup'&&!S.over?_T('disabled title="Finish the event on the sand first"'):''}>${_T`📜 Unroll the old scrolls`}</button></div></div>`:''}<p>${_T`The best Fate score ever recorded in each event, with the <b>attendance</b> that watched it. Records marked <i>from the old scrolls</i> were filled by the scribes — beat them.`}</p> ${_T`Section cheers scale with the crowd (a house over 8 cheers louder, not richer), so a packed arena means glory, not free Crowd Favor.`}</p>
    <div style="overflow-x:auto"><table class="tally"><tr><th>${_T`Event`}</th><th>${_T`Record holder`}</th><th>${_T`Class`}</th><th>${_T`Final CF`}</th><th>${_T`Attendance`}</th><th>Where / when</th></tr>
    ${keys.map(k=>{const r=er[k];return `<tr><td><b>${esc(EVENTS[k].n)}</b></td>${r?`<td>${esc(r.name)}${r.cpu?' · CPU':''}${r.won?' <span class="badge gold" style="font-size:10px">won</span>':''}</td><td>${esc(r.clsName||'')}</td><td class="n"><b>${r.cf}</b></td><td class="n">${r.att!=null?houseK(houseCount(r.att,r.cf,LOCATIONS.findIndex(L=>L&&L.n===r.loc))):'—'} 🏟</td><td style="color:var(--muted);font-size:13px">${esc(r.loc||'')} · ${esc(r.date||'')}</td>`:`<td colspan="5" style="color:var(--muted)">${_T`No record yet.`}</td>`}</tr>`}).join('')}</table></div>`;
  }
  if(tab==='archives'){
    let arcs=[];try{arcs=(await Store.list('mgrArchives')).sort((a,b)=>String(b.date).localeCompare(String(a.date)))}catch(e){}
    return tabs+`<p>${_T`🏺 <b>The Ludus Archives</b> — the leather-bound season recaps of every Manager-mode career: the finale, the crown, the ledger. (The full shelf, week by week, lives in Manager mode → Archives.)`}</p>
    ${arcs.length?`<div class="list2">${arcs.map(d=>{let R=null;try{R=JSON.parse(d.rec)}catch(e){}
      return `<div class="lrow" style="--pc:var(--gold)"><div class="t">${_T`<b>Season ${d.season}</b> · ${esc(d.ludus)} <small>${esc(d.lanista)} · ${esc(d.date)}${R&&R.finale&&R.finale.champ?_T` · ${esc(R.finale.kind)} finale: ${esc(R.finale.champ)}`:''}${R&&R.champLanista?_T` · crown: ${esc(R.champLanista.ludus)}${R.champLanista.you?' (yours 🏆)':''}`:''}${R?_T` · record ${R.you.rec}`:''}</small>`}</div></div>`}).join('')}</div>`:`<p style="color:var(--muted)">${_T`No seasons archived yet — finish a season in Manager mode.`}</p>`}`;
  }
  if(tab==='trophies'&&typeof hallTrophiesHTML==='function')return tabs+await hallTrophiesHTML();
  if(tab==='liberti'){
    const h=(await Store.getDoc('hall','liberti'))||{list:[]};
    return tabs+`<p>${_T`The <b>Liberti</b>: gladiators who won an event with <b>50+ Crowd Favor</b> and took the <b>rudis</b> — the wooden sword of freedom — instead of returning to the Ludus. They have left the sands, and the game, forever. Only their glory remains.`}</p>
    ${h.list.length?`<div class="rgrid">${h.list.map(r=>{const col=CLASSES[r.cls]?CLASSES[r.cls].color:'#c9a458';
      return `<div class="rcard" style="--pc:${col}"><div class="rc-top">${r.portrait?portraitHTML({name:r.name,portrait:r.portrait,color:col},'sm'):CLASSES[r.cls]?figureHTML(tokenForCls(r.cls),76):''}<div><div class="rc-name">${esc(r.name)}</div><div class="rc-sub">${_T`${esc(r.clsName||'')} · freed ${esc(r.date)}${r.missio?_T(' · missio fulfilled'):''}`}</div><span class="badge gold">${_T`🗡 Rudis · ${cfAmt87(r.cf)}`}</span></div></div>
      <div class="rc-sub">${_T`${r.league?esc(r.league):_T`Won ${esc(r.event)} at ${esc(r.loc)}`} — and walked out of the arena to a standing crowd, the wooden sword in hand.`}</div>
      ${libertiCareerHTML(r)}</div>`}).join('')}</div>`:`<p style="color:var(--muted)">${_T`No one has claimed the wooden sword yet. Win an event with 50+ CF and choose freedom over the Ludus.`}</p>`}`;
  }
  if(tab==='infamis'){
    const mo=monthKey();await infamisMaintain(mo);
    const rows=(await Store.list('infamis')).filter(r=>!r.ex&&(r.mo||String(r.date||'').slice(0,7))===mo).sort((a,b)=>b.cf-a.cf).slice(0,20);
    const latest=await Store.getDoc('hall','latest');const past=(await Store.getDoc('hall','infamisPast'))||{months:{}};
    const clsN=r=>CLASSES[r.cls]?CLASSES[r.cls].name:esc(r.clsName||r.cls);
    const ex=[{name:'Virgilante',event:_T('Classic'),loc:'Roma',cls:'slave',rr:'',ff:false,cf:68,notes:_T('FR Creator'),ex:1},{name:'Zora350',event:_T('Classic'),loc:'Roma',cls:'venatore',rr:'',ff:true,cf:55,notes:_T('FR QA Team'),ex:1}];
    const days=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth()+1,1)-d})();
    return tabs+(latest?`<div class="card2" style="margin-bottom:12px;border-left:4px solid var(--gold)"><div class="sect" style="margin-top:0">${_T`Most recent playthrough`}</div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">${CLASSES[latest.cls]?figureHTML(tokenForCls(latest.cls),76):''}<div><div style="font:400 20px var(--display);color:var(--gold2)">${esc(latest.name)} ${latest.custom?'<span class="cbadge">✦ custom</span>':''}</div>
      <div class="rc-sub">${_T`${clsN(latest)} · ${esc(latest.event)} at ${esc(latest.loc)} · ${esc(latest.date)}${latest.cpu?' · CPU':''}${latest.manager?_T(' · managed by ')+esc(latest.manager):''}`}</div>
      <div><span class="badge ${/Won/.test(latest.status)?'gold':/Elim|Retired/.test(latest.status)?'bad':'good'}">${esc(latest.status)}</span> <span class="badge" title="${_T`Final Fate score: Crowd Favor held at the end plus the winner's bonuses — the number the Infamis ranks`}">${_T`${latest.cf} Fate CF${latest.held!=null&&latest.held!==latest.cf?_T` (held ${latest.held} ${latest.cf>latest.held?'+':'−'} ${Math.abs(latest.cf-latest.held)} ${latest.cf>latest.held?_T('winner\u2019s bonus'):_T('hidden Mandata')})`:''} · ${esc(latest.fate||'')}`}</span>${latest.att!=null?`<span class="badge">${_T`🏟 ${latest.att}K spectators`}</span>`:''}</div></div></div>
      <p class="hint" style="margin-bottom:0">${_T`Shown whether they won or fell. The Fate score is what the Infamis ranks: the CF a gladiator held at the end, plus the winner's bonuses — which is why a winner's board card (held CF) reads lower than this.`}</p></div>`:'')+
      `<p>${_T`The <b>top 20</b> Fate scores of <b>${monthName(mo)}</b>, ordered by final Crowd Favor. The board resets at the start of every month (${Math.ceil(days/864e5)} day${Math.ceil(days/864e5)===1?'':'s'} left); each month's best is kept below as its champion. RR is the Royal Reserve; FF marks Flavius Fidelis (a revealed Mandata Flavi). Custom characters and custom events are not eligible.${Store.db?_T(' Records are shared with everyone who opens this page.'):_T(' Records are kept in this browser.')}`}</p>
      <div style="overflow-x:auto"><table class="tally"><tr><th>#</th><th>${_T`Character`}</th><th>Event / Location</th><th>${_T`Class`}</th><th>RR</th><th>FF</th><th>${_T`Final CF`}</th><th>🏟</th><th>${_T`Notes`}</th></tr>
      ${rows.map((r,i)=>`<tr><td class="n">${i+1}</td><td><b>${esc(r.name)}</b></td><td>${esc(r.event)} / ${esc(r.loc)}</td><td>${clsN(r)}</td><td class="n">${r.rr??''}</td><td>${r.ff?'✓':''}</td><td class="n" title="${r.held!=null?_T`held ${r.held} CF at the end`:''}">${_T`${cfAmt87(r.cf)}${r.held!=null&&r.held!==r.cf?`<br><span class="rc-sub">${_T`held ${r.held}`}</span>`:''}`}</td><td class="n">${r.att!=null?r.att+'K':'—'}</td><td style="color:var(--muted);font-size:13px">${esc(r.notes||'')} · ${esc(r.date||'')}</td></tr>`).join('')||`<tr><td colspan="9" style="color:var(--muted)">${_T`No winners recorded yet in ${monthName(mo)}.`}</td></tr>`}
      ${ex.map(r=>`<tr style="opacity:.6;font-style:italic"><td></td><td>${r.name}</td><td>${r.event} / ${r.loc}</td><td>${CLASSES[r.cls].name}</td><td></td><td>${r.ff?'✓':''}</td><td class="n">${cfAmt87(r.cf)}</td><td></td><td>${_T`${r.notes} (rulebook example)`}</td></tr>`).join('')}</table></div>
      ${Object.keys(past.months||{}).length?`<h4>${_T`Past monthly champions`}</h4><table class="tally"><tr><th>${_T`Month`}</th><th>${_T`Champion`}</th><th>${_T`Class`}</th><th>${_T`Event`}</th><th>${_T`Final CF`}</th></tr>${Object.entries(past.months).sort((a,b)=>b[0].localeCompare(a[0])).map(([m,r])=>`<tr><td>${m==='earlier'?_T('Earlier'):monthName(m)}</td><td><b>${esc(r.name)}</b>${r.cpu?' · CPU':''}</td><td>${clsN(r)}</td><td>${esc(r.event||'')} / ${esc(r.loc||'')}</td><td class="n">${cfAmt87(r.cf)}</td></tr>`).join('')}</table>`:''}`;
  }
  if(tab==='hall'){
    const hall=(await Store.getDoc('hall','progress'))||{locs:[],killed:[],chars:{},classicWin:false};
    const A=await achLoad();const R=await roadLoad();const past=(await Store.getDoc('hall','roadPast').catch(()=>null))||{list:[]};
    const box=ok=>`<span class="badge ${ok?'good':''}" style="min-width:1.6em;text-align:center">${ok?'✓':''}</span>`;
    const got=Object.keys(A.got||{}).length;const titles=ACHIEVEMENTS.filter(a=>A.got[a.k]&&a.r.title).map(a=>a.r.title);
    const cand=(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).filter(g=>gladActive(g)&&!g.cpu&&BASE_CLS.includes(g.cls));
    let road;
    if(R&&!R.over){const st=roadStage(R);road=`<div class="roadbox"><div class="sect" style="margin-top:0">${_T`🛣 The Road of Flavius`} <span class="rc-sub">${_T`one gladiator · twelve arenas · in order · no second chances`}</span></div>
      <p style="margin:4px 0">${_T`<b>${esc(R.name)}</b> (${CLASSES[R.cls]?CLASSES[R.cls].name:''}) walks the road — stage <b>${R.step+1} of 12</b>. Next: <b>${esc(st.L.n)}</b> · ${esc(EVENTS[st.ev].n)}. Win it with ${esc(R.name)} to go on; lose, and the road ends.`}</p>
      <div class="roadtrack">${HALL_ORDER.map((li,i)=>`<span class="rstep ${i<R.step?'done':i===R.step?'next':''}" title="${esc(LOCATIONS[li].n)} · ${esc(EVENTS[LOCATIONS[li].ev].n)}">${i<R.step?'✓':i+1}<small>${esc(LOCATIONS[li].n)}</small></span>`).join('')}</div>
      <div class="acts" style="margin-top:6px"><button class="btn primary" type="button" data-road="go">${_T`⚔ Walk stage ${R.step+1}: ${esc(st.L.n)}<small>opens New event with ${esc(R.name)} summoned</small>`}</button><button class="btn" type="button" data-road="abandon">${_T`Abandon the road`}</button></div></div>`}
    else road=`<div class="roadbox"><div class="sect" style="margin-top:0">${_T`🛣 The Road of Flavius`} <span class="rc-sub">${_T`the Hall's oldest, hardest honor`}</span></div>
      <p style="margin:4px 0">${_T`Commit one gladiator of your Ludus to the <b>Road</b>: win all twelve arenas in the Hall's order — Arles to Roma — each at its own event, with that same gladiator. Lose once and the road is over. No one has ever finished it.`}</p>
      ${R&&R.over?`<p class="rc-sub">${R.over==='complete'?_T`👑 <b>${esc(R.name)}</b> walked the whole Road.`:_T`Last walker: <b>${esc(R.name)}</b> — fell at ${esc(R.fell?R.fell.loc:'')}, stage ${(R.fell?R.fell.step:0)+1}.`}</p>`:''}
      ${cand.length?`<div class="acts" style="align-items:center"><select class="tin" id="roadPick">${cand.map(g=>`<option value="${g.id}">${_T`${esc(g.name)} · ${CLASSES[g.cls].name} · ${g.wins||0} wins`}</option>`).join('')}</select><button class="btn primary" type="button" data-road="commit">${_T`🛣 Commit to the Road`}</button></div>`:`<p class="rc-sub">${_T`You need a living Ludus gladiator of the eight classes (save one after an event).`}</p>`}</div>`;
    if(typeof roadVisualHTML==='function')road=roadVisualHTML(R,cand,road);
    let annals=[];try{annals=(await Store.list('hall')).filter(x=>x&&x.kind==='annal').sort((a,b)=>b.score-a.score)}catch(e){}
    const annalsHTML=annals.length?`<h4>${_T`🏺 Retired houses · the lanistae who left in glory`}</h4><div class="list2">${annals.map(a=>`<div class="lrow"><div class="t"><b>${esc(a.ludus)}</b> <span class="badge gold">${_T`${typeof gradeChip==='function'?gradeChip(a.grade):esc(a.grade)} · ${a.score} legacy`}</span><br><span class="rc-sub">${_T`${esc(a.name)} · ${a.seasons} season${a.seasons===1?'':'s'} · ${esc(a.rec)} · fame ${a.fame} · ${a.trophies} trophies · ${esc(a.date)}`}</span><br><i style="font-size:12px">${esc(a.epitaph||'')}</i></div></div>`).join('')}</div>`:'';
    return tabs+annalsHTML+`<h4>${_T`🏆 Achievements`} <span class="rc-sub">${_T`${got} of ${ACHIEVEMENTS.length}${titles.length?_T` · titles: ${titles.map(esc).join(', ')}`:''}`}</span></h4>
      <div class="achgrid">${ACHIEVEMENTS.map(a=>`<div class="ach ${A.got[a.k]?'got':''}"><b>${A.got[a.k]?'🏆':'🔒'} ${esc(a.n)}</b><span>${esc(a.d)}</span><small>${A.got[a.k]?_T`🏛 earned ${esc(A.got[a.k])} — engraved in the Annals`:_T('not yet earned')}</small></div>`).join('')}</div>
      <h4>${_T`The twelve arenas`} <span class="rc-sub">${_T`wins by human gladiators, in the Hall's order`}</span></h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px">${HALL_ORDER.map((li,i)=>`<div class="item">${i+1}. ${LOCATIONS[li].n}${box(hall.locs.includes(li))}</div>`).join('')}</div>
      <p style="margin-top:8px">${_T`Classes eliminated so far: ${hall.killed.length?hall.killed.map(c=>CLASSES[c].name).join(', '):_T('none')}.`}</p>
      <h4>${_T`🛣 The Road of Flavius`}</h4>${road}
      ${past.list.length?`<h4>${_T`Walkers of the Road`}</h4><div class="items">${past.list.map(r=>`<div class="item">${r.over==='complete'?'👑':'✝'} <b>${esc(r.name)}</b> <span class="rc-sub">${_T`${r.over==='complete'?_T('walked all twelve'):_T`fell at ${esc(r.fell?r.fell.loc:'')} (stage ${(r.fell?r.fell.step:0)+1})`} · ${r.history.length} arena${r.history.length===1?'':'s'} won`}</span></div>`).join('')}</div>`:''}`;
  }
  const ms=(await Store.list('missios')).sort((a,b)=>b.id.localeCompare(a.id));
  return tabs+`<p>${_T`Missio campaigns (p.56-57). Start or continue one from New event → Missio.`}</p>${ms.length?`<table class="tally"><tr><th>${_T`Character`}</th><th>${_T`Class`}</th><th>${_T`Step`}</th><th>${_T`Status`}</th><th>RR</th><th>${_T`Trophies`}</th><th>${_T`History`}</th></tr>${ms.map(m=>`<tr><td><b>${esc(m.name)}</b></td><td>${CLASSES[m.cls].name}</td><td class="n">${Math.min(m.step+1,5)}/5</td><td>${m.status}</td><td class="n">${m.rr}</td><td class="n">${m.trophies}</td><td style="font-size:13px;color:var(--muted)">${(m.history||[]).map(h=>`${h.ev} ${h.won?'won':h.cf+' CF'}`).join(' → ')}</td></tr>`).join('')}</table>`:`<p style="color:var(--muted)">${_T`No missios yet.`}</p>`}`;
}
/* esc — HTML-escapes text (& < > ") for template literals. */
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let HALL_TO_LUDUS=0; // v0.43: the Ludus lives inside the Annals now — its tab opens the roster window and comes back here
async function openHall(tab='infamis'){
  if(!$('#modal').hidden&&!$('#hallBody'))return;
  const html=await hallHTML(tab);
  if($('#hallBody')){$('#hallBody').innerHTML=html;return}
  modal(_T('🏛️ The Annals · Infamis, Hall of Flavius & Liberti'),`<div id="hallBody">${html}</div>`,[{label:_T('Close'),value:1}],{wide:1,full:1,onOpen:()=>{const x=$('#mClose');if(x){x.textContent=_T('🏛 Back to Main Menu');x.classList.add('saveq')}$('#mBody').onclick=async e=>{const b=e.target.closest('[data-tab]');if(b){if(b.dataset.tab==='ludus'){HALL_TO_LUDUS=1;const c=CUR_MODAL;if(c)c.done(1);return}openHall(b.dataset.tab);return}const rd=e.target.closest('[data-road]');if(!rd)return;const act=rd.dataset.road;
      if(act==='commit'){const id=$('#roadPick')&&$('#roadPick').value;const g=LUDUS_CACHE.find(x=>x.id===id);if(!g)return;await Store.put('hall','road',{gid:g.id,name:g.name,cls:g.cls,step:0,history:[],started:new Date().toISOString().slice(0,10)});if(typeof mToast==='function')mToast(_T`🛣 <b>${esc(g.name)}</b> sets out on the Road of Flavius. Twelve arenas. One life.`);openHall('hall');return}
      if(act==='abandon'){const R=await roadLoad();if(R){R.over='fell';R.fell={step:R.step,loc:'the roadside',how:'abandoned'};await Store.put('hall','road',R);const past=(await Store.getDoc('hall','roadPast').catch(()=>null))||{list:[]};past.list.unshift(R);await Store.put('hall','roadPast',past)}openHall('hall');return}
      if(act==='go'){const R=await roadLoad();if(!R||R.over)return;const g=LUDUS_CACHE.find(x=>x.id===R.gid);if(!g||!gladActive(g)){if(typeof mToast==='function')mToast(_T('That gladiator can no longer walk the road.'));return}const st=roadStage(R);
        const cur=CUR_MODAL;if(cur)cur.done(1);setTimeout(()=>{CFG.mode='event';CFG.loc=st.li;CFG.ev=st.ev;const E=EVENTS[st.ev];CFG.n=clamp(CFG.n,E.min,E.max);summonToSetup(g);CFG.road={gid:R.gid,step:R.step,loc:st.li,ev:st.ev};openSetup()},120)}}}}).then(v=>{$('#mBody').onclick=null;if(!HALL_TO_LUDUS&&typeof screenSettle!=='function'&&typeof menuShow==='function'&&$('#mainMenu').hidden&&!(S&&!S.over&&S.phase!=='setup')){setTimeout(()=>{if($('#modal').hidden&&$('#mainMenu').hidden&&!(S&&!S.over&&S.phase!=='setup')){MM.fromMenu=false;menuShow()}},320)}if(HALL_TO_LUDUS){HALL_TO_LUDUS=0;setTimeout(()=>{if(typeof openLudus==='function')openLudus(null,true)},60)}});
}
/* the top-bar Annals button. */
$('#btnHall').onclick=()=>openHall('infamis');

/* A Ludus gladiator can start (or pick up) the missio of their class: events already won or survived with 20+ CF,
   in the missio's order and at the right locations, count as completed steps. */
function missioCredit(glad){
  const path=MISSIOS[glad.cls].path;let step=0;
  for(const h of (glad.history||[])){if(step>=path.length)break;const st=path[step];
    if(h.ev===st.ev&&(h.li==null||h.li===st.loc)&&(st.win?h.won:(h.won||h.cf>=20)))step++;}
  return Math.min(step,4);
}
/* missioFromLudus — creates (and saves) a missio for a Ludus gladiator, crediting the steps their history already covers. */
async function missioFromLudus(glad){
  const step=missioCredit(glad);
  const rec={...newMissio(glad.cls,glad.name),step,cfCarry:glad.carry||0,rr:glad.coin||0,trophies:(glad.kP||0)+(glad.kN||0),events:glad.events||0,severed:glad.severed||[],gladId:glad.id,history:[]};
  await Store.put('missios',rec.id,rec);return rec;
}

/* v0.42: the scribes at work — a button, a progress bar that walks city to city, and each record as it is set */
async function seedRun(btn){if(window._seeding)return;window._seeding=1;const box=document.getElementById('seedProg');if(!box){window._seeding=0;return}
  box.innerHTML=`<div class="seedhd">${_T`<b>📜 The scribes are at work</b>`} <span class="rc-sub" id="seedCount"></span></div><div class="seedbar"><i id="seedFill"></i></div><div class="seedcity" id="seedCity">${_T`Opening the archive…`}</div><div class="seedrec" id="seedRec"></div>`;
  const cb=(done,total,k,rec)=>{const f=document.getElementById('seedFill');if(f)f.style.width=Math.round(done/total*100)+'%';const c=document.getElementById('seedCount');if(c)c.textContent=`${done} / ${total}`;
    if(rec){const r=document.getElementById('seedRec');if(r){const el=document.createElement('div');el.className='seedhit';el.innerHTML=_T`🏆 <b>${esc(EVENTS[k].n)}</b> — ${esc(rec.name)} (${esc(rec.clsName||'')}), <b>${cfAmt87(rec.cf)}</b> at ${esc(rec.loc||'')}`;r.prepend(el);setTimeout(()=>el.classList.add('out'),2600);setTimeout(()=>el.remove(),3400)}}};
  cb.start=(k,done,total)=>{const E=EVENTS[k];const L=LOCATIONS[E.loc||6];const el=document.getElementById('seedCity');if(el)el.innerHTML=`${pickOne([_T('Copying the scrolls of'),_T('Unrolling the ledgers of'),_T('Reading the tallies of'),_T('Dusting off the records of')])} <b>${esc(L?L.n:_T('Roma'))}</b> — ${esc(E.n)}`;const c=document.getElementById('seedCount');if(c)c.textContent=`${done} / ${total}`};
  try{await seedEventRecords(cb)}finally{window._seeding=0}
  const el=document.getElementById('seedCity');if(el)el.innerHTML=_T('✔ Every scroll is copied.');setTimeout(()=>{if($('#hallBody'))openHall('events')},1400)}
/* the "Unroll the old scrolls" button, wherever it is drawn. */
document.addEventListener('click',e=>{const b=e.target.closest('[data-seedrun]');if(b&&!b.disabled)seedRun(b)});
