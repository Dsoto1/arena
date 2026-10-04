/* =====================================================================
   46-TOURNEY · PLAY NOW TOURNAMENTS, REBUILT — AND THE TOURNAMENT DESIGNER (v0.47)
   =====================================================================
   • Every Play Now tournament is a bracket of 4-gladiator heats of the three classics (Democritus,
     Egidious, Cassian). The TOP TWO of each heat go through, so a field of 4, 8, 16 or 32 always halves
     cleanly: 32 → 16 → 8 → 4 → the final.
   • Each heat gets its own city (random, unique while the empire has cities to spare); the final is
     in Roma unless you say otherwise, and a festival can be chosen for it. The summa rudis (the event)
     is random per heat, or one you choose.
   • 🏆 Tournament Designer (Creator Studio → Arena): name it, pick the bracket size, then fill every
     first-round seat from Your Play Now Gladiators — or leave seats open and the ludus of Flavius
     lends invited gladiators for that tournament only (they are never saved). Tick 🎮 on the seats you
     want to fight yourself.
   • The active roster of Your Play Now Gladiators grows to 32 (the rolls below hold 60 more).
   ===================================================================== */
const T_EVS=['democritus','egidious','cassian'];
const T_SIZES=[4,8,16,32];
const SYS_TOURNEYS=[
  {id:'t_tiro',sys:1,name:'The Tiro Four',icon:'🗡',size:4,evMode:'democritus',trophy:'tiro',stars:1,opp:[50,66],fest:'',finaleLoc:6,blurb:_T('Four raw recruits, one bout in Roma — the gentlest way into a bracket.')},
  {id:'t_leptis',sys:1,name:'The Leptis Magna Cup',icon:'🦁',size:8,evMode:'random',trophy:'lion_leptis',stars:3,opp:[62,82],fest:'',finaleLoc:6,blurb:_T('Two heats in the provinces, then the best four meet for the Lion.')},
  {id:'t_trident',sys:1,name:'The Golden Trident Challenge',icon:'🔱',size:8,evMode:'egidious',trophy:'trident',stars:4,opp:[74,90],fest:'saturnalia',finaleLoc:6,blurb:_T('Invited champions only. Egidious presides over every heat.')},
  {id:'t_colossus',sys:1,name:'The Colossus Invitational',icon:'🏛',size:16,evMode:'random',trophy:'colossus',stars:5,opp:[68,86],fest:'ludi',finaleLoc:6,blurb:_T('Sixteen of the empire’s best: four heats, two semi-finals, a final under the Flavian amphitheater.')},
  {id:'t_grand',sys:1,name:'The Grand Ludi of Flavius',icon:'👑',size:32,evMode:'random',trophy:'flavian_cup',stars:5,opp:[60,90],fest:'fortuna',finaleLoc:6,blurb:_T('Thirty-two gladiators across the empire. Four rounds. One crown.')}];
CUSTOM.tourneys=CUSTOM.tourneys||[];
if(typeof SAVE_COLS!=='undefined'&&!SAVE_COLS.includes('customTourneys'))SAVE_COLS.push('customTourneys');
{const _lc=loadCustoms;loadCustoms=async function(){const r=await _lc();try{CUSTOM.tourneys=(await Store.list('customTourneys')).sort((a,b)=>String(a.name).localeCompare(String(b.name)))}catch(e){CUSTOM.tourneys=CUSTOM.tourneys||[]}return r}}
if(typeof NAME_KINDS!=='undefined')NAME_KINDS.tourneys=['tournament',()=>CUSTOM.tourneys];
const allTourneys=()=>[...SYS_TOURNEYS,...(CUSTOM.tourneys||[])];
const tourneyById=id=>allTourneys().find(t=>t.id===id)||null;
const tRounds=size=>Math.max(1,Math.round(Math.log2(size))-1);
function tShape(size){const out=[];let n=size;while(n>=4){out.push(n/4);if(n===4)break;n=n/2}return out} /* heats per round */
function tSummary(T){const sh=tShape(T.size);const fl=LOCATIONS[T.finaleLoc||6];const ev=T.evMode==='random'?_T('random summa each heat'):'summa: '+((EVENTS[T.evMode]||{}).sr||(EVENTS[T.evMode]||{}).n||T.evMode);
  return _T`${T.size}-gladiator bracket · ${sh.map((h,i)=>i===sh.length-1?_T('the final'):h===1?'1 heat':h+' heats').join(' → ')} · top 2 of each heat go through · ${ev} · final in ${fl?fl.n:_T('Roma')}${T.fest&&FEST_KINDS[T.fest]?_T(' during the ')+FEST_KINDS[T.fest].n:''}`}
function tBlank(){return {id:'tt'+Date.now().toString(36),name:_T('The ')+pickOne([_T('Ides'),_T('Kalends'),_T('Vulcan'),_T('Janus'),_T('Consul’s'),_T('Senate’s')])+_T(' Bracket'),icon:'🏆',size:8,evMode:'random',trophy:'',stars:3,opp:[60,82],fest:'',finaleLoc:6,blurb:'',seats:[],fates:true}}

/* ---------------- Your Play Now Gladiators: a roster of 32 ---------------- */
const LUDUS_CAP=92;
async function roster32(){try{if(localStorage.getItem('flavius_roster32'))return}catch(e){return}
  const all=await loadLudus();let ros=all.filter(g=>g.roster&&gladActive(g));
  for(const g of all.filter(g=>!g.roster&&gladActive(g))){if(ros.length>=ROSTER_MAX)break;g.roster=true;await Store.put('gladiators',g.id,g).catch(()=>{});ros.push(g)}
  /* not enough gladiators of your own yet: the ludus of Flavius recruits some (retired and fallen records make room first) */
  let need=ROSTER_MAX-ros.length;const dead=all.filter(g=>!gladActive(g)).sort((a,b)=>(a.cf||0)-(b.cf||0));
  while(need>0){if(LUDUS_CACHE.length>=LUDUS_CAP&&dead.length){const cut=dead.shift();await Store.del('gladiators',cut.id).catch(()=>{});LUDUS_CACHE=LUDUS_CACHE.filter(x=>x.id!==cut.id)}
    const cls=pickOne(BASE_CLS);const id='g'+Date.now()+'r'+need;const fem=Math.random()<.3;
    const rec={id,name:genName({female:fem}),cls,cf:14+rnd(10),carry:0,wins:0,events:0,kP:0,kN:0,coin:0,created:new Date().toISOString().slice(0,10),status:'alive',roster:true,history:[],recruit:true,portrait:gladPortrait(id,cls)};
    await Store.put('gladiators',id,rec).catch(()=>{});need--}
  await loadLudus();try{localStorage.setItem('flavius_roster32','1')}catch(e){}}
setTimeout(()=>{if(!HEADLESS)roster32().catch(e=>console.error(e))},2500);

/* ---------------- the run ---------------- */
function tEntrant(slot,T,i){const g=slot&&slot.g?LUDUS_CACHE.find(x=>x.id===slot.g&&gladActive(x)):null;
  if(g)return {name:g.name,human:!!slot.human,rating:ludusOvr(g),ludus:true,seat:{cls:g.cls,cpu:!slot.human,diff:'normal',name:g.name,saved:g.id,pers:g.pers,cfStart:g.carry||0,severed:g.severed||[]}};
  const o=T.opp[0]+rnd(T.opp[1]-T.opp[0]+1);const nm=genName();
  return {name:nm,human:false,rating:o,temp:true,seat:{cls:pickOne(BASE_CLS),cpu:true,diff:o>=76?'hard':'normal',name:nm,boost:{ap:clamp(Math.round((o-62)/6),0,5),coin:clamp(Math.round((o-70)/5),0,4),cf:0},rating:o}}}
function tPlan(T){const sh=tShape(T.size);const cities=shuffle(LOCATIONS.map((L,i)=>L&&i!==(T.finaleLoc||6)?i:null).filter(x=>x!=null));let ci=0;
  return sh.map((n,ri)=>Array.from({length:n},()=>{const fin=ri===sh.length-1;const loc=fin?(T.finaleLoc||6):cities[(ci++)%cities.length];return {ev:T.evMode==='random'?pickOne(T_EVS):T.evMode,loc}}))}
tournStart=function(seat,defId){const T=JSON.parse(JSON.stringify(tourneyById(defId||CFG.tSid)||SYS_TOURNEYS[1]));const plan=tPlan(T);const slots=[...(T.seats||[])];
  /* Play Now's own fighter takes the first open seat when the tournament names no fighter of yours */
  if(seat&&!slots.some(s=>s&&s.human)){const i=Math.max(0,slots.findIndex(s=>!s||!s.g));slots[i]={g:seat.saved||null,human:true,seat}}
  const ents=Array.from({length:T.size},(_,i)=>{const s=slots[i];if(s&&s.seat){const x={...s.seat,cpu:false};return {name:x.name||CLASSES[x.cls].hero||'You',human:true,rating:null,seat:x}}return tEntrant(s,T,i)});
  const heats=plan[0].map((p,hi)=>({ents:ents.slice(hi*4,hi*4+4),res:null,ev:p.ev,loc:p.loc}));
  TOURN={v:2,sid:T.id,D:T,plan,stage:0,rounds:[heats],champ:null,done:false,out:!ents.some(e=>e.human),started:new Date().toISOString().slice(0,10)};tournSave();openTourn()};
tournCfg=function(s,h,live){const T=TOURN;if(!T.v)return null;const hh=T.rounds[s][h];const fin=s===T.plan.length-1;const FK=fin&&T.D.fest&&FEST_KINDS[T.D.fest];
  const seats=hh.ents.map(e=>{const x={...e.seat};if(!live)x.cpu=true;if(FK){x.cfStart=x.cfStart||0;x.coinStart=x.coinStart||0;FK.ap(x)}return x});
  return {ev:hh.ev,loc:hh.loc,seats,opts:{mods:true,mandata:false,optOffers:true,eaglePot:true,spect:live?'auto':0}}};
tournRecord=function(s,h,res){const T=TOURN,hh=T.rounds[s][h];if(hh.res)return;
  const rows=res.rows.map((r,i)=>({i,f:r.f,won:res.winners.includes(r.id),alive:r.alive!==false&&!r.dead}));let wi=rows.find(r=>r.won);if(!wi)wi=[...rows].sort((a,b)=>b.f-a.f)[0];
  const second=rows.filter(r=>r.i!==wi.i).sort((a,b)=>(b.alive-a.alive)||(b.f-a.f))[0];
  hh.res={win:wi.i,second:second?second.i:null,rows,turns:res.turns};
  const fin=s===T.plan.length-1;
  if(T.rounds[s].every(x=>x.res)){
    if(!fin){const up=[];T.rounds[s].forEach(x=>{up.push(x.ents[x.res.win]);if(x.res.second!=null)up.push(x.ents[x.res.second])});
      const nxt=T.plan[s+1].map((p,hi)=>({ents:up.slice(hi*4,hi*4+4),res:null,ev:p.ev,loc:p.loc}));T.rounds.push(nxt);T.stage=s+1;
      if(!up.some(e=>e.human))T.out=true}
    else{T.champ=hh.ents[wi.i];T.done=true;const td=T.D.trophy;
      if(T.champ.human&&td)hallTrophy(td,{who:T.champ.name,why:_T`Won ${T.D.n||T.D.name}`,cls:T.champ.seat.cls,saved:T.champ.seat.saved}).catch(()=>{});
      else if(td&&typeof rivalTrophy==='function')rivalTrophy(td,{who:T.champ.name,why:_T`Won ${T.D.name}`,saved:T.champ.seat.saved,cls:T.champ.seat.cls}).catch(()=>{})}}
  else if(hh.ents.some(e=>e.human)){const adv=[wi.i,hh.res.second];if(!hh.ents.some((e,i)=>e.human&&adv.includes(i))&&!T.rounds[s].some(x=>!x.res&&x.ents.some(e=>e.human)))T.out=true}
  tournSave()};
tournSimRest=async function(stopAtHuman=true){let g=0;while(TOURN&&!TOURN.champ&&g++<80){const s=TOURN.stage;const h=TOURN.rounds[s].findIndex(x=>!x.res);if(h<0)break;
  if(stopAtHuman&&TOURN.rounds[s][h].ents.some(e=>e.human))break;let res=null;try{res=await simEvent(tournCfg(s,h,false))}catch(err){console.warn(err);res=null}if(res&&!res.error)tournRecord(s,h,res);else tournRecord(s,h,{rows:TOURN.rounds[s][h].ents.map((e,i)=>({id:i,f:0})),winners:[],turns:0}) /* a heat called off: the seeds go through */}};
openTourn=async function(){if(!TOURN)return;if(!TOURN.v){TOURN=null;tournSave();return}if(typeof modalBusy==='function'&&modalBusy())return;
  if(!TOURN.out)await tournSimRest(true); /* heats before yours play out; a bracket with none of yours waits for ⏩ */const T=TOURN;const D=T.D;const td=D.trophy&&typeof trophyDef==='function'?trophyDef(D.trophy):null;
  const s=T.stage;const h=T.rounds[s]?T.rounds[s].findIndex(x=>!x.res):-1;const mineNext=h>=0&&T.rounds[s][h].ents.some(e=>e.human);
  const rn=si=>si===T.plan.length-1?_T('The final'):T.plan.length-si===2?'Semi-finals':_T('Round ')+(si+1);
  const heat=(hh,hi,si)=>`<div class="bheat${hh.res?' done':''}${hh.ents.some(e=>e.human)?' mine':''}"><div class="bheathd">${T.plan[si].length>1?_T('Heat ')+(hi+1)+' · ':''}📍 ${esc((LOCATIONS[hh.loc]||{}).n||'')} · ${esc((EVENTS[hh.ev]||{}).sr||(EVENTS[hh.ev]||{}).n||'')}</div>${hh.ents.map((e,i)=>{const w=hh.res&&hh.res.win===i,sec=hh.res&&hh.res.second===i;
    return `<div class="bent${w?' win':''}${sec&&si<T.plan.length-1?' adv':''}">${w?'🏆 ':sec&&si<T.plan.length-1?'➚ ':''}<span class="${e.human?'bmine':''}">${esc(e.name)}</span> <span class="rc-sub">${esc(CLASSES[e.seat.cls]?CLASSES[e.seat.cls].name:'')}${e.rating?' · '+e.rating:''}${e.ludus?_T(' · your ludus'):''}${e.temp?' · invited':''}</span>${hh.res&&hh.res.rows[i]?` <span class="bcf">${_T`${hh.res.rows[i].f} CF`}</span>`:''}</div>`}).join('')}</div>`;
  const cols=T.plan.map((p,si)=>{const rd=T.rounds[si];return `<div class="bcol"><div class="bcolhd">${rn(si)}</div>${rd?rd.map((hh,hi)=>heat(hh,hi,si)).join(''):p.map(q=>`<div class="bheat tbd"><div class="bheathd">📍 ${esc((LOCATIONS[q.loc]||{}).n||'')} · ${esc((EVENTS[q.ev]||{}).sr||'')}</div>${'<div class="bent">— to be decided —</div>'.repeat(4)}</div>`).join('')}</div>`}).join('');
  const body=`<div style="display:flex;gap:10px;align-items:center">${td?trophySVG(td,60):''}<div><b style="font:400 22px var(--display);color:var(--gold2)">${esc(D.icon||'🏆')} ${esc(D.name)}</b><div class="rc-sub">${esc(tSummary(D))}</div></div></div>
    <div class="bracket tb2">${cols}</div>
    ${T.champ?`<div class="bchamp"><div><div class="rc-sub">CHAMPION</div><b style="font:400 22px var(--display);color:var(--gold2)">${esc(T.champ.name)}</b>${td?`<div class="badge gold">${esc(td.name)} → ${T.champ.human?_T("the Annals' trophy case"):_T('their shelf (a rival holds it)')}</div>`:''}</div></div>`:T.out?'<p class="rc-sub">None of your fighters are left in the bracket — play it out to crown a champion.</p>':''}`;
  const btns=T.champ?[{label:_T('Close'),value:'close',primary:1}]:mineNext?[{label:_T('⚔ Fight your heat'),value:'fight',primary:1},{label:_T('⏩ Simulate my heat'),value:'simmine'},{label:_T('Later'),value:'close'}]:[{label:_T('⏩ Play out the bracket'),value:'rest',primary:1},{label:_T('Later'),value:'close'}];
  const v=await modal(_T('🏟 Tournament'),body,btns,{wide:1,full:T.size>=16});
  if(v==='fight'){const cfg=tournCfg(s,h,true);cfg.tourn={stage:s,heat:h,final:s===T.plan.length-1,nofates:D.fates===false};startEvent(cfg);return}
  if(v==='simmine'){let res=null;try{res=await simEvent(tournCfg(s,h,false))}catch(err){}if(res&&!res.error)tournRecord(s,h,res);openTourn();return}
  if(v==='rest'){await tournSimRest(false);openTourn();return}
  if(T.champ){TOURN=null;tournSave()}};
if(TOURN&&!TOURN.v){TOURN=null;tournSave()} /* an old-style bracket in progress is retired with the old rules */
tournChoices=function(){return allTourneys().map(t=>[t.id,t])};
tournSetupHTML=function(tabs){const ch=tournChoices();if(!tourneyById(CFG.tSid))CFG.tSid='t_leptis';const D=tourneyById(CFG.tSid);const td=D.trophy&&trophyDef(D.trophy);
  const mine=(D.seats||[]).filter(s=>s&&s.human).length;
  return tabs+`<div class="setup-grid"><div>
    <div class="evdesc">${_T`<b>Tournaments</b> are brackets of 4-gladiator heats — Democritus, Egidious or Cassian presiding. The <b>top two</b> of every heat go through (a field of 32 → 16 → 8 → 4 → the final), each heat in its own city, the final in Roma. Design your own in the Creator Studio → 🏆 Tournament Designer.`}</div>
    ${TOURN&&!TOURN.done?`<div class="card2" style="margin:8px 0;border-color:var(--gold)">${_T`<b>A tournament is under way:</b> ${esc(TOURN.D.name)} —`} <button class="btn primary tksm" type="button" data-tourn="resume">${_T`Back to the bracket`}</button> <button class="btn tksm" type="button" data-tourn="abandon">${_T`Abandon it`}</button></div>`:''}
    <h4>${_T`Choose the tournament`}</h4><div class="items">${ch.map(([k,d])=>{const t=d.trophy&&trophyDef(d.trophy);return `<label class="item tpick ${CFG.tSid===k?'on':''}"><input type="radio" name="tsid" value="${esc(k)}" ${CFG.tSid===k?'checked':''}>${t?trophySVG(t,40):'<span style="font-size:30px">'+esc(d.icon||'🏆')+'</span>'}<span><b>${esc(d.icon||'')} ${esc(d.name)}</b> ${d.sys?'':'<span class="cbadge">✦ custom</span>'} ${starsHTML(d.stars||3)}<br><em class="rc-sub" style="font-style:normal">${esc(tSummary(d))}${t?' · 🏆 '+esc(t.name):''}</em></span></label>`}).join('')}</div>
   </div><div>
    <div class="card2"><div style="display:flex;gap:10px;align-items:center">${td?trophySVG(td,70):''}<div><b style="font:400 20px var(--display);color:var(--gold2)">${esc(D.icon||'')} ${esc(D.name)}</b><div class="rc-sub">${_T`${starsHTML(D.stars||3)} · field of ${D.size}`}</div><div class="rc-sub">${esc(D.blurb||'')}</div></div></div>
      <ul class="rc-sub" style="margin:6px 0 0 16px;padding:0"><li>${esc(tSummary(D))}</li><li>${_T`invited opponents rated ${D.opp[0]}–${D.opp[1]}${(D.seats||[]).some(s=>s&&s.g)?_T` · ${(D.seats||[]).filter(s=>s&&s.g).length} seats filled from your ludus`:''}`}</li>${D.fates===false?'<li>no Fates: an exhibition bracket</li>':'<li>the Fate table applies, as in any event</li>'}<li>${_T`Champion takes ${td?`<b>${esc(td.name)}</b> — ${rewardText(td.rewards)}`:_T('the glory')}`}</li></ul></div>
    ${mine?`<p class="rc-sub">${_T`🎮 You fight the ${mine} seat${mine>1?'s':''} ticked in the designer.`}</p>`:`<h4>${_T`Your gladiator`}</h4><div class="seats">${seatRows(null,1,BASE_CLS)}</div>`}
    <p id="setupErr" style="color:var(--blood2);margin-top:8px"></p>
    <div class="mbtns"><button class="btn primary" type="button" id="goBtn">${_T`Enter the tournament`}</button><button class="btn" type="button" id="rulesBtn2">${_T`Rules in this build`}</button></div></div></div>`};

/* ---------------- 🏆 the Tournament Designer (Creator Studio) ---------------- */
function tourneyStudioHTML(){const d=ST.tnd||(ST.tnd=tBlank());const n=d.size;d.seats=(d.seats||[]).slice(0,n);while(d.seats.length<n)d.seats.push(null);
  const ros=(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).filter(g=>g.roster&&gladActive(g));const used=new Set(d.seats.filter(s=>s&&s.g).map(s=>s.g));
  const errs=tErrors(d);const sh=tShape(n);
  const seat=(i)=>{const s=d.seats[i];const g=s&&s.g?ros.find(x=>x.id===s.g):null;return `<div class="tseat ${g?'fill':''} ${s&&s.human?'hum':''}"><span class="tsn">${i+1}</span>${g?gladFace(g,'xs'):'<span class="tsauto">?</span>'}
    <select class="tin" data-tns="${i}"><option value="">${_T`— invited (the ludus of Flavius lends one) —`}</option>${ros.map(x=>`<option value="${x.id}" ${s&&s.g===x.id?'selected':''} ${used.has(x.id)&&!(s&&s.g===x.id)?'disabled':''}>${esc(x.name)} · ${esc((CLASSES[x.cls]||{}).name||'')} · ${ludusOvr(x)}</option>`).join('')}</select>
    <label class="chk" title="${_T`You control this gladiator in their heats`}"><input type="checkbox" data-tnh="${i}" ${s&&s.human?'checked':''} ${g?'':'disabled'}> 🎮</label></div>`};
  const td=d.trophy&&trophyDef(d.trophy);
  return `<p>${_T`Design a <b>tournament</b> for Play Now → New event → 🏆 Tournament. Pick the bracket size, then fill the first-round seats from <b>Your Play Now Gladiators</b> (Main Menu → Annals). Seats you leave open get invited gladiators — lent for this tournament only, never saved. Tick 🎮 on the seats you fight yourself; the rest are played by the computer. ${customTag()}`}</p>
   <div class="setup-grid" style="grid-template-columns:minmax(0,260px) minmax(0,1fr)"><div><div class="sxinv">${td?trophySVG(td,70):`<div class="sxicon">${esc(d.icon)}</div>`}<b>${esc(d.name||_T('Tournament'))}</b><div class="rc-sub">${starsHTML(d.stars||3)}</div><div class="sxrules"><div>• ${esc(tSummary(d))}</div><div>${_T`• invited opponents rated ${d.opp[0]}–${d.opp[1]}`}</div><div>${_T`• ${d.seats.filter(s=>s&&s.g).length} of ${n} seats from your ludus · ${d.seats.filter(s=>s&&s.human).length} for you to fight`}</div></div></div></div>
    <div><div class="formgrid"><label>${_T`Name`}<input class="tin" data-tnf="name" value="${esc(d.name)}" maxlength="36"></label><label>${_T`Icon`}<select class="tin" data-tnf="icon">${['🏆','🏛','🔱','🦁','🗡','👑','🦅','🔥','⚔','🛡','🌙','☀'].map(i=>`<option ${d.icon===i?'selected':''}>${i}</option>`).join('')}</select></label>
     <label>${_T`Bracket size`}<span class="seg">${T_SIZES.map(z=>`<button type="button" data-tnsize="${z}" class="${n===z?'on':''}">${z}</button>`).join('')}</span></label>
     <label>${_T`Summa rudis`}<select class="tin" data-tnf="evMode"><option value="random" ${d.evMode==='random'?'selected':''}>${_T`🎲 Random for every heat`}</option>${T_EVS.map(k=>`<option value="${k}" ${d.evMode===k?'selected':''}>${esc(EVENTS[k].sr||EVENTS[k].n)} · ${esc(EVENTS[k].n)}</option>`).join('')}</select></label>
     <label>${_T`The final's city`}<select class="tin" data-tnf="finaleLoc">${LOCATIONS.map((L,i)=>L?`<option value="${i}" ${+d.finaleLoc===i?'selected':''}>${i} · ${esc(L.n)}${i===6?' (default)':''}</option>`:'').join('')}</select></label>
     <label>${_T`Festival for the final`}<select class="tin" data-tnf="fest"><option value="">— none —</option>${Object.entries(FEST_KINDS).map(([k,F])=>`<option value="${k}" ${d.fest===k?'selected':''}>${esc(F.n)} — ${esc(F.boon)}</option>`).join('')}</select></label>
     <label>${_T`Trophy for the champion`}<select class="tin" data-tnf="trophy">${(typeof trophyOptions==='function'?trophyOptions():[['',_T('No trophy')]]).map(([v,l])=>`<option value="${esc(v)}" ${d.trophy===v?'selected':''}>${esc(l)}</option>`).join('')}</select></label>
     <label>${_T`Stars (difficulty)`}<select class="tin" data-tnf="stars">${[1,2,3,4,5].map(v=>`<option ${+d.stars===v?'selected':''}>${v}</option>`).join('')}</select></label>
     <label>${_T`Invited opponents from`}<input type="range" data-tnf="opp0" min="40" max="95" value="${d.opp[0]}"><output>${d.opp[0]}</output></label><label>${_T`…up to`}<input type="range" data-tnf="opp1" min="40" max="99" value="${d.opp[1]}"><output>${d.opp[1]}</output></label>
     <label style="grid-column:1/-1">${_T`Blurb`}<input class="tin" data-tnf="blurb" value="${esc(d.blurb||'')}" maxlength="160"></label></div>
     <div class="chkgrid" style="margin-top:6px"><label class="chk"><input type="checkbox" data-tnf="fates" ${d.fates!==false?'checked':''}> ${_T`The Fate table applies`}</label></div>
     <div class="sect">${_T`⚔ The first round`} <span class="rc-sub">${_T`${sh[0]} heat${sh[0]>1?'s':''} of 4 · each heat in its own city`}</span> <button type="button" class="btn tksm" data-tnx="fill">${_T`⭐ Fill open seats from my roster`}</button><button type="button" class="btn tksm" data-tnx="clear">${_T`Clear`}</button></div>
     ${ros.length<n?`<p class="rc-sub">${_T`Your active roster has ${ros.length} gladiator${ros.length===1?'':'s'} — the other seats will be invited.`}</p>`:''}
     <div class="theats">${Array.from({length:sh[0]},(_,hi)=>`<div class="theat"><div class="theathd">${_T`Heat ${hi+1}`}</div>${[0,1,2,3].map(k=>seat(hi*4+k)).join('')}</div>`).join('')}</div>
     ${errs.length?`<p style="color:var(--blood2);margin:6px 0 0">${errs.map(esc).join(' ')}</p>`:''}
     <div class="mbtns"><button class="btn primary" type="button" data-tnx="save" ${errs.length?'disabled':''}>${_T`💾 Save tournament`}</button><button class="btn" type="button" data-tnx="new">${_T`↺ A fresh one`}</button></div></div></div>
   <h4>${_T`Your tournaments · ${(CUSTOM.tourneys||[]).length}`}</h4>${(CUSTOM.tourneys||[]).length?`<div class="list2 one">${CUSTOM.tourneys.map(t=>`<div class="lrow"><span class="sxic">${esc(t.icon||'🏆')}</span><div class="t"><b>${esc(t.name)}</b> ${customTag()}<small>${esc(tSummary(t))}</small></div><div class="a">${crActs('tn',t)}</div></div>`).join('')}</div>`:'<p class="rc-sub">None yet.</p>'}
   <h4>${_T`🏛 The system tournaments`} <span class="rc-sub">${_T`locked — copy one to make it yours`}</span></h4><div class="list2 one">${SYS_TOURNEYS.map(t=>`<div class="lrow"><span class="sxic">${esc(t.icon)}</span><div class="t"><b>${esc(t.name)}</b><small>${esc(tSummary(t))}</small><small>${esc(t.blurb)}</small></div><div class="a">${sysActs(`data-tnx="copysys" data-v="${t.id}"`,{rolls:false})}</div></div>`).join('')}</div>`}
function tErrors(d){const e=[];if(!String(d.name||'').trim())e.push(_T('Give the tournament a name.'));if(!T_SIZES.includes(+d.size))e.push(_T('Pick a bracket size.'));if(+d.opp[1]<+d.opp[0])e.push(_T('The opponents’ rating range is upside down.'));return e}
if(typeof CR_KINDS!=='undefined')CR_KINDS.tn={list:()=>CUSTOM.tourneys||[],set:v=>{CUSTOM.tourneys=v},store:'customTourneys',nm:'tourneys',rolls:_T('Play Now'),
  on:x=>x.listed!==false,toggle:x=>{x.listed=x.listed===false},edit:x=>{ST.tnd=JSON.parse(JSON.stringify(x))}};
{const _tc=tournChoices;tournChoices=function(){return _tc().filter(([k,t])=>t.listed!==false)}}
document.addEventListener('click',async e=>{if(typeof ST==='undefined'||!document.getElementById('studio'))return;const b=e.target.closest('[data-tnx],[data-tnsize]');if(!b||!document.getElementById('studio').contains(b))return;e.stopPropagation();
  const d=ST.tnd||(ST.tnd=tBlank());
  if(b.dataset.tnsize){d.size=+b.dataset.tnsize}
  const a=b.dataset.tnx;
  if(a==='new')ST.tnd=tBlank();
  if(a==='clear')d.seats=[];
  if(a==='fill'){const ros=LUDUS_CACHE.filter(g=>g.roster&&gladActive(g));const used=new Set((d.seats||[]).filter(s=>s&&s.g).map(s=>s.g));const free=ros.filter(g=>!used.has(g.id));
    d.seats=Array.from({length:d.size},(_,i)=>{const s=(d.seats||[])[i];if(s&&s.g)return s;const g=free.shift();return g?{g:g.id,human:false}:null})}
  if(a==='copysys'){const T=SYS_TOURNEYS.find(t=>t.id===b.dataset.v);const x={...JSON.parse(JSON.stringify(T)),id:'tt'+Date.now().toString(36),sys:undefined,name:T.name+' (copy)',seats:[]};if(nameClash('tourneys',x.name))x.name=nameSuggest('tourneys',x.name);ST.tnd=x}
  if(a==='save'){if(tErrors(d).length)return;if(!nameGuard('tourneys',d,'[data-tnf="name"]'))return;CUSTOM.tourneys=[...(CUSTOM.tourneys||[]).filter(x=>x.id!==d.id),JSON.parse(JSON.stringify(d))].sort((x,y)=>String(x.name).localeCompare(String(y.name)));
    await Store.put('customTourneys',d.id,d).catch(()=>{});if(typeof mToast==='function')mToast(_T`🏆 <b>${esc(d.name)}</b> is on the Play Now tournament list.`)}
  studioRedraw()},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.tnf==null||typeof ST==='undefined'||!ST.tnd)return;const k=t.dataset.tnf;const d=ST.tnd;
  if(k==='opp0'||k==='opp1'){d.opp[k==='opp0'?0:1]=+t.value;if(t.nextElementSibling)t.nextElementSibling.textContent=t.value;return}
  if(t.type==='text'||t.tagName==='INPUT'&&t.type!=='checkbox')d[k]=t.value},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||typeof ST==='undefined'||!ST.tnd||!document.getElementById('studio'))return;const d=ST.tnd;
  if(t.dataset.tnf!=null){const k=t.dataset.tnf;if(t.type==='checkbox')d[k]=t.checked;else if(k==='finaleLoc'||k==='stars')d[k]=+t.value;else if(k==='opp0'||k==='opp1')d.opp[k==='opp0'?0:1]=+t.value;else d[k]=t.value;if(t.tagName==='SELECT'||t.type==='checkbox'||t.type==='range')studioRedraw();return}
  if(t.dataset.tns!=null){const i=+t.dataset.tns;d.seats[i]=t.value?{g:t.value,human:!!(d.seats[i]&&d.seats[i].human)}:null;studioRedraw();return}
  if(t.dataset.tnh!=null){const i=+t.dataset.tnh;if(d.seats[i])d.seats[i].human=t.checked;studioRedraw();return}},true);
function allRowsTourneys(){return (CUSTOM.tourneys||[]).map(t=>({t:_T('Tournament'),k:'tourneys',id:t.id,icon:`<span style="font-size:18px">${esc(t.icon||'🏆')}</span>`,n:t.name,d:esc(tSummary(t)),s:t.listed===false?_T('✎ Design only'):_T('📜 On the rolls'),u:''}))}

{const _ae=allRowsExtra;allRowsExtra=function(){return [..._ae(),...allRowsTourneys()]}}
