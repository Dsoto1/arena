
/* =====================================================================
   08-SETUP · THE NEW EVENT SCREEN (loaded last, boots the page)
   =====================================================================
   openSetup() is the big configuration modal: map + event pick, seats (with the Ludus
   active-roster dropdowns), options, spectators and the crowd-personality sliders.
   clean() turns a seat row into an engine seat (generated CPU names happen here).
   Also: showRules() (the tabbed Rules & strategy window), the abandon-event guard on
   New event, and the boot sequence at the bottom of the file.
   ===================================================================== */
/* ================= SETUP: LOCATIONS MAP & EVENTS ================= */
let CFG={loc:6,ev:'democritus',n:4,seats:[
  {cls:'slave',cpu:false,diff:'normal',team:'A'},{cls:'soldier',cpu:true,diff:'normal',team:'B'},
  {cls:'royalty',cpu:true,diff:'normal',team:'A'},{cls:'hero',cpu:true,diff:'normal',team:'B'}],
  opts:{mods:false,mandata:false,optOffers:false,eaglePot:false,carmina:false,spect:'auto'}, // 'auto' = the empire decides attendance
  mode:'event',festKind:'ludi',festSR:'democritus',chPvp:true,mCls:'hero',mName:''};
let MISSIO_CACHE=[];
const PALETTE=['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#cfc6b4','#dc7a34','#8a5cc0','#9a8f84'];
const MAPW=900,MAPH=909;
// the rulebook's own locations map (p.21) is the underlay; numbered markers sit on its city dots
function mapSVG(){
  const cities=LOCATIONS.slice(1).map((L,i)=>{const n=i+1;const x=L.x*MAPW,y=L.y*MAPH;const on=CFG.loc===n;
    return `<g class="city" tabindex="0" role="button" aria-label="${n} ${L.n}${on?' (selected)':''}" data-loc="${n}"><title>${n} · ${L.n} · ${EVENTS[L.ev].n}</title>${on?`<circle cx="${x}" cy="${y}" r="32" fill="none" stroke="#f0cf7d" stroke-width="3.5" opacity=".9"/>`:''}<circle cx="${x}" cy="${y}" r="${on?24:20}" fill="${on?'#a3281f':'#2a1d13'}" fill-opacity="${on?1:.88}" stroke="${on?'#f0cf7d':'#d6ab4c'}" stroke-width="3"/><text x="${x}" y="${y+1}" fill="#f5e8cc" font-size="${on?20:17}" font-weight="700" font-family="IBM Plex Mono, monospace" text-anchor="middle" dominant-baseline="middle" pointer-events="none">${n}</text></g>`}).join('');
  return `<svg viewBox="0 0 ${MAPW} ${MAPH}" role="group" aria-label="Arena locations map"><image href="${typeof assetURL==='function'?assetURL('map.jpg'):'assets/map.jpg'}" width="${MAPW}" height="${MAPH}"/>${cities}</svg>`;
}
function eventOptions(){const o=([k,e])=>`<option value="${k}" ${CFG.ev===k?'selected':''}>${e.custom?'✦ ':''}${esc(e.n)} (${e.min===e.max?e.min:e.min+'–'+e.max} players)</option>`;const base=Object.entries(EVENTS).filter(([,e])=>!e.custom),cust=CUSTOM.events.map(x=>['ce_'+x.id,EVENTS['ce_'+x.id]]).filter(([,e])=>e);return base.map(o).join('')+(cust.length?`<optgroup label="✦ Custom events (Creator Studio)">${cust.map(o).join('')}</optgroup>`:'')}
/* v0.21: seats list classes only; each class plays under its default name — or under the name you last gave it, which sticks */
let CLS_NAMES={};try{CLS_NAMES=JSON.parse(localStorage.getItem('flavius_clsnames')||'{}')||{}}catch(e){}
const clsSavedName=k=>CLASSES[k]&&CLASSES[k].custom?'':(CLS_NAMES[k]||'');
function saveClsName(k,v){if(!CLASSES[k]||CLASSES[k].custom)return;if(v)CLS_NAMES[k]=v;else delete CLS_NAMES[k];try{localStorage.setItem('flavius_clsnames',JSON.stringify(CLS_NAMES))}catch(e){}}
function classOptions(cls,sel){const o=k=>`<option value="${k}" ${k===sel?'selected':''}>${CLASSES[k].custom?'✦ '+esc(CLASSES[k].name)+' · custom':CLASSES[k].name}</option>`;const b=cls.filter(k=>!CLASSES[k].custom),c=cls.filter(k=>CLASSES[k].custom&&CUSTOM.chars.some(x=>'cc_'+x.id===k));return b.map(o).join('')+(c.length?`<optgroup label="✦ Custom characters">${c.map(o).join('')}</optgroup>`:'')}
function roundsChips(ev){return ev.rounds.map((r,i)=>`<span class="chip">R${i+1} ${esc(r.n)} · Z${r.zone} · ${r.pvp?'PvP':'no PvP'}${r.cf?'':' · no CF'}${r.ca?'':' · no CA'}${ev.custom?' · '+(END_CONDS.find(x=>x[0]===r.end)||['',''])[1].replace(/\bN\b/,r.endN):''}</span>`).join('')}
function allowedClasses(ev){let c=[...BASE_CLS,...CUSTOM.chars.filter(typeof onRollsR==='function'?onRollsR:onRolls).map(x=>'cc_'+x.id).filter(k=>CLASSES[k])];if(ev.classes)c=ev.classes.filter(k=>CLASSES[k]);if(ev.noVenatore)c=c.filter(x=>x!=='venatore');return c.length?c:[...BASE_CLS]}
function teamOptions(ev,i){
  if(ev.teams==='jugg')return ['J','T'];
  if(ev.teams)return ['A','B','C','D'];
  return null;
}
function seatRows(ev,n,cls){
  while(CFG.seats.length<8)CFG.seats.push({cls:BASE_CLS.find(c=>!CFG.seats.some(s=>s.cls===c))||'soldier',cpu:true,diff:'normal',team:CFG.seats.length%2?'B':'A'});
  return CFG.seats.slice(0,n).map((s,i)=>{
    if(!cls.includes(s.cls))s.cls=cls.find(c=>!CFG.seats.slice(0,n).some(o=>o!==s&&o.cls===c))||cls[0];
    const tops=ev?teamOptions(ev,i):null;
    return `<div class="seat" style="--pc:${CLASSES[s.cls].color}"><span class="cn">${clsPieceHTML(s.cls,34)}Seat ${i+1}</span>
      <div class="row"><select id="cls${i}" aria-label="Class for seat ${i+1}">${classOptions(cls,s.cls)}</select>
      <select id="cpu${i}" aria-label="Controller for seat ${i+1}"><option value="0" ${!s.cpu?'selected':''}>You</option><option value="1" ${s.cpu?'selected':''}>CPU</option></select>
      ${s.cpu?`<select id="dif${i}" aria-label="CPU difficulty for seat ${i+1}">${['easy','normal','hard'].map(d=>`<option value="${d}" ${s.diff===d?'selected':''}>${d[0].toUpperCase()+d.slice(1)}</option>`).join('')}</select>
        <select id="pre${i}" aria-label="CPU personality for seat ${i+1}"><option value="class" ${!s.preset||s.preset==='class'?'selected':''}>Personality: class default</option><option value="random" ${s.preset==='random'?'selected':''}>Random</option>${Object.entries(PERS_PRESETS).map(([k,v])=>`<option value="${k}" ${s.preset===k?'selected':''}>${v.n}</option>`).join('')}<option value="custom" ${s.preset==='custom'?'selected':''}>Custom…</option></select>
        <button class="btn" type="button" data-tune="${i}" aria-expanded="${!!s.tune}" style="padding:4px 8px">${s.tune?'Hide':'Tune'}</button>
        ${LUDUS_CACHE.some(g=>g.roster&&gladActive(g))?`<select id="lcp${i}" aria-label="Field an active-roster Ludus gladiator in CPU seat ${i+1}"><option value="">Generated rival</option>${LUDUS_CACHE.filter(g=>g.roster&&gladActive(g)&&cls.includes(g.cls)).map(g=>`<option value="${g.id}" ${s.saved===g.id?'selected':''}>Ludus rival: ${esc(g.name)} (${CLASSES[g.cls].name}${g.cpu?' · CPU':''})</option>`).join('')}</select>`:''}`:`<input id="nam${i}" type="text" maxlength="24" placeholder="${esc(CLASSES[s.cls].hero)} (default name)" title="The name you give a class is remembered and used every time you pick it" value="${esc(s.name||clsSavedName(s.cls)||'')}" aria-label="Gladiator name for seat ${i+1}" style="background:var(--ink);color:var(--bone);border:1px solid var(--line2);border-radius:3px;padding:5px 6px;font-size:14px;width:11em">${diceBtn('#nam'+i)}
        ${LUDUS_CACHE.some(g=>g.roster&&gladActive(g))?`<select id="sav${i}" aria-label="Summon an active-roster gladiator for seat ${i+1}"><option value="">New gladiator</option>${LUDUS_CACHE.filter(g=>g.roster&&gladActive(g)).map(g=>`<option value="${g.id}" ${s.saved===g.id?'selected':''}>Ludus: ${esc(g.name)} (${CLASSES[g.cls].name}, returns with ${g.carry} CF)</option>`).join('')}</select>`:''} <span style="font-size:11px;color:var(--dim);align-self:center" title="Only the Ludus screen's active roster (up to 10) is listed here">(active roster)</span>`}
      ${tops?`<select id="team${i}" aria-label="Team for seat ${i+1}">${tops.map(t=>`<option value="${t}" ${s.team===t?'selected':''}>${t==='J'?'Juggernaut':t==='T'?'Team':'Team '+t}</option>`).join('')}</select>`:''}</div>
      <span class="ab"><span data-card="k:${s.cls}" style="text-decoration:underline dotted;cursor:help">${CLASSES[s.cls].name} card</span> · ${ev&&ev.draft?'Drafted event: class sets name and color only.':CLASSES[s.cls].ab}${i>=4?' Starts on a '+(i<6?'snake':'wolf')+' home tile.':''}${s.saved&&!s.cpu?` <b style="color:var(--gold2)">Summoned from the Ludus.</b>`:''}${s.cpu?` <span style="color:var(--dim)">· ${{easy:'Easy: loose aim, rarely shops or plays cards.',normal:'Normal: solid play with the odd slip.',hard:"Hard: sharpest play (dodges, focus, market, beast hunting) plus a veteran's edge of +3 coin and a 2 HP Health Elixir."}[s.diff||'normal']}</span>`:''}${CFG.seats.slice(0,n).filter(o=>o.cls===s.cls).length>1?' <i>Shares a class: gets its own color and a numbered name in the arena.</i>':''}</span>
      ${s.cpu&&s.tune?`<div class="perswrap">${PERS_KEYS.map(([k,l,d])=>`<label class="slider" title="${d}"><span>${l}</span><input type="range" min="1" max="100" value="${seatPers(s)[k]}" data-pk="${k}" data-seat="${i}" aria-label="${l} priority for seat ${i+1}"><output>${seatPers(s)[k]}</output></label>`).join('')}<span style="font-size:11px;color:var(--dim)">1-100 priorities. Moving a slider switches this seat to Custom.</span></div>`:''}</div>`}).join('');
}
function seatPers(s){if(s.preset==='custom'&&s.pers)return s.pers;const b=PERS_PRESETS[s.preset]||PERS_PRESETS[CLASS_PERS[s.cls]]||PERS_PRESETS.balanced;return {...b.v}}
function finalPers(s){
  if(!s.cpu)return undefined;
  if(s.preset==='custom'&&s.pers)return {...s.pers};
  if(s.preset==='random'){const o={};for(const [k] of PERS_KEYS)o[k]=1+rnd(100);return o}
  if(s.preset&&PERS_PRESETS[s.preset]){const o={};for(const [k] of PERS_KEYS)o[k]=clamp(PERS_PRESETS[s.preset].v[k]+rnd(21)-10,1,100);return o}
  return rollPersonality(s.cls);
}
// which options can apply to an event (the rest are shown grayed out with the reason)
function optApplies(ev){
  const k=ev?ev.kind:null;
  return {
    mods:ev&&(ev.draft||k==='orpheus'||k==='eagle')?'Drafted and capture events ignore class modifiers':null,
    mandata:ev&&!ev.mandata?'Only classic events deal Mandati Flavi':null,
    carmina:null,
    optOffers:k==='chariot'?'Chariot Racing uses its own offerings (Speed of Mercury, Crowd Favor, Curse Tablets)':k==='naumachia'?'No Blessings pots in the flooded arena':null,
    eaglePot:k==='chariot'||k==='naumachia'?'No Blessings pots in this event':k==='eagle'?'The Golden Eagle is already the objective of this event':null,
  };
}
function optBox(id,key,on,label,why){return `<label ${why?`style="opacity:.45" title="${esc(why)}"`:''}><input type="checkbox" id="${id}" ${on&&!why?'checked':''} ${why?'disabled':''}> ${label}${why?` <span style="font-size:12px;color:var(--dim)">(${esc(why)})</span>`:''}</label>`}
function optionsHTML(ev,L){
  const o=CFG.opts;const na=optApplies(ev);
  return `<h4>Options</h4><div class="opts">
     ${L?optBox('oMods','mods',o.mods,`Apply ${L.n}'s class modifiers`,na.mods):''}
     ${optBox('oMandata','mandata',o.mandata,'Mandati Flavi secret objectives',na.mandata)}
     ${optBox('oCarmina','carmina',o.carmina,'Carmina Fescennina before the event',na.carmina)}
     ${optBox('oOpt','optOffers',o.optOffers,'Shuffle the optional offerings into the Blessings bag (Crowd Favor, Speed of Mercury, Curse Tablet)',na.optOffers)}
     ${optBox('oEagle','eaglePot',o.eaglePot,'Include the Golden Eagle as one of the 12 Blessings',na.eaglePot)}
     ${ev&&ev.kind==='chariot'?`<label><input type="checkbox" id="oChPvp" ${CFG.chPvp?'checked':''}> Allow PvP attacks during the race</label>`:''}
     <label title="Leave blank for fresh dice. Enter a seed from a past event's results screen to replay its exact rolls.">Dice seed <input type="text" id="oSeed" value="${CFG.seed||''}" placeholder="random" style="width:8em"></label>
     <label class="spectopt" style="grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px">Spectators <select id="oSpectMode" ${ev&&ev.noSpect?'disabled':''}><option value="auto" ${o.spect==='auto'?'selected':''}>🎲 Random — the empire decides</option><option value="set" ${o.spect!=='auto'?'selected':''}>Set a number</option></select>${o.spect!=='auto'?` <input type="number" id="oSpect" min="0" max="96" value="${o.spect}" style="width:5em" ${ev&&ev.noSpect?'disabled':''}>`:''} ${ev&&ev.noSpect?'<span class="rc-sub" style="flex:1 1 280px">none allowed in this event</span>':ev&&ev.passiveSpect?'<span class="rc-sub" style="flex:1 1 280px">this crowd only watches: cheers, jeers and words — no stones, gifts or spears</span> ':o.spect==='auto'?'<span class="rc-sub" style="flex:1 1 280px">city appetite, hometown regulars, fans of today\u2019s fighters, billing and omen fill the stands · up to 96, each ≈1,000 Romans</span>':'<span class="rc-sub" style="flex:1 1 280px">0–96 named regulars, each ≈1,000 Romans with their own tastes, moods and CF (rulebook p.35)</span>'}</label>
     ${ev&&!ev.noSpect?`<details style="grid-column:1/-1"><summary style="cursor:pointer;font-size:13.5px">Crowd personality <span style="color:var(--dim)">(interactivity ${CROWD.act}% · saved in this browser)</span></summary>
       <div style="display:grid;gap:6px;padding:8px 2px 2px">
        <label class="slider" title="Scales how often spectators throw stones and offerings, change sections, chant for Tholo and emote."><span style="min-width:110px">Interactivity</span><input type="range" min="10" max="200" step="5" value="${CROWD.act}" data-crowd="act"><output>${CROWD.act}%</output></label>
        ${Object.entries(SPECT_TEMPERS).map(([k,[l,d]])=>`<label class="slider" title="${esc(d)}"><span style="min-width:110px">${l}</span><input type="range" min="0" max="200" step="5" value="${CROWD.t[k]??100}" data-crowd="${k}"><output>${CROWD.t[k]??100}%</output></label>`).join('')}
        <p class="hint" style="margin:0">Trait weights shape the tempers of <b>new faces</b> joining the crowd; your regulars keep the tempers you already know them by. 100% everywhere is the printed game.</p>
        ${typeof LOC_CROWD!=='undefined'&&LOC_CROWD[CFG.loc]?`<p class="hint" style="margin:0"><b>Local flavor at ${esc((LOCATIONS[CFG.loc]||{}).n||'this arena')}</b>: ${esc(LOC_CROWD[CFG.loc].n)} — interactivity ×${(LOC_CROWD[CFG.loc].act||100)}%${Object.entries(LOC_CROWD[CFG.loc].t||{}).map(([k,v])=>`, ${SPECT_TEMPERS[k]?SPECT_TEMPERS[k][0].toLowerCase():k} ×${v}%`).join('')}. Layered on top of your sliders.</p>`:''}
       </div></details>`:''}
     ${ev&&!ev.noSpect&&!ev.passive&&ev.kind!=='chariot'&&ev.kind!=='naumachia'?`<label class="spectme" ${CFG.seats.slice(0,CFG.n).some(s=>!s.cpu)?'style="opacity:.45" title="Only non-players can spectate"':''}><input type="checkbox" id="oSpectMe" ${CFG.spectHuman&&!CFG.seats.slice(0,CFG.n).some(s=>!s.cpu)?'checked':''} ${CFG.seats.slice(0,CFG.n).some(s=>!s.cpu)?'disabled':''}> 🎟 <b>Play as a spectator</b> (all seats CPU): earn CF each rotation, throw stones or offerings, change sections and chant for Tholo</label>`:''}
    </div><p style="font-size:13px;color:var(--muted);margin-top:6px">Every Blessings token goes into one face-down bag (${36+(o.optOffers?13:0)} tokens). Twelve are drawn, one pot per pillar; nobody knows what's inside until a pot breaks. Offerings spawned later by cards, spectators or events are drawn from the same bag. Events with an arena deck use the full 70 cards (12 more are set aside for round 2 in classic events), with Flavius Rule placed at the bottom.</p>`;
}
function setupBody(){
  const tabs=`<div class="seg" role="tablist" style="margin-bottom:12px">${[['event','Single event'],['festival','Festival'],['missio','Missio'],['tourn','🏆 Tournament']].map(([k,l])=>`<button type="button" data-mode="${k}" class="${CFG.mode===k?'on':''}">${l}</button>`).join('')}</div>`;
  if(CFG.mode==='festival'){
    const cls=allowedClasses({});CFG.n=4;
    return tabs+`<div class="setup-grid"><div>
      <div class="evdesc"><b>Festivals</b> (p.42) chain three events: Carmina Fescennina, a Chariot Race with no PvP (finishing order sets the next turn order), then a Classic Elimination. Coin and CF carry across; the highest CF at the end is crowned champion (+5 CF).</div>
      <h4>Festival</h4><div class="opts">
      ${Object.entries(FEST_KINDS).map(([k,F])=>`<label><input type="radio" name="fk" value="${k}" ${CFG.festKind===k?'checked':''}> ${F.n}: ${F.boon}</label>`).join('')}</div>
      <label style="display:grid;gap:4px;font-size:14px;margin-top:10px">Summa Rudis for the main event<select id="festSR">${['democritus','egidious','cassian'].map(k=>`<option value="${k}" ${CFG.festSR===k?'selected':''}>${EVENTS[k].n}</option>`).join('')}</select></label>
     </div><div><div class="seats">${seatRows(null,4,cls)}</div>${optionsHTML(EVENTS.chariot,null)}
      <p id="setupErr" style="color:var(--blood2);margin-top:8px"></p>
      <div class="mbtns"><button class="btn primary" type="button" id="goBtn">Begin the festival</button><button class="btn" type="button" id="rulesBtn2">Rules in this build</button></div></div></div>`;
  }
  if(CFG.mode==='tourn'&&typeof tournSetupHTML==='function')return tournSetupHTML(tabs);
  if(CFG.mode==='missio'){
    const act=MISSIO_CACHE.filter(m=>m.status==='active');
    const M=MISSIOS[CFG.mCls];
    return tabs+`<div class="setup-grid"><div>
      <div class="evdesc"><b>Missios</b> (p.56-57) are five-event campaigns for one character. Finish each event with a win or at least 20 CF to advance. Half your CF (up to 25) carries over, coin goes to the Royal Reserve, and severed limbs persist.</div>
      <h4>Continue a missio</h4>${act.length?`<div class="items">${act.map(m=>{const st=MISSIOS[m.cls].path[m.step];return `<div class="item"><span><b>${esc(m.name)}</b> · ${CLASSES[m.cls].name} · step ${m.step+1}/5<em>Next: ${st.fest?'Festival '+festName(st.fest)+', ':''}${EVENTS[st.ev].n} at ${LOCATIONS[st.loc].n} · RR ${m.rr} · carrying ${m.cfCarry} CF</em></span><button class="btn primary" type="button" data-cont="${m.id}">Continue</button></div>`}).join('')}</div>`:'<p style="color:var(--muted)">No active missios yet.</p>'}
      <h4>Start from the Ludus</h4>${LUDUS_CACHE.filter(g=>gladActive(g)&&!g.cpu&&MISSIOS[g.cls]).length?`<div class="items">${LUDUS_CACHE.filter(g=>gladActive(g)&&!g.cpu&&MISSIOS[g.cls]).map(g=>{const c=missioCredit(g);const act=MISSIO_CACHE.find(m=>m.gladId===g.id&&m.status==='active');return `<div class="item"><span><span class="mfacetok">${gladFace(g,'xs')}${typeof figureHTML==='function'&&typeof tokenForCls==='function'?figureHTML(tokenForCls(g.cls),40):''}</span><span><b>${esc(g.name)}</b> · ${CLASSES[g.cls].name}<em>${act?`missio in progress · step ${act.step+1}/5`:`${c?`${c} step${c>1?'s':''} already earned from past events · `:''}starts at step ${c+1}/5 with ${g.carry||0} CF`}</em></span></span><button class="btn" type="button" data-lmissio="${g.id}">${act?'Continue':'Start'}</button></div>`}).join('')}</div>`:'<p style="color:var(--muted)">No saved gladiators yet. Save one from the results screen after an event.</p>'}
     </div><div>
      <h4>Start a new missio</h4>
      <div class="opts"><label>Class <select id="mCls">${BASE_CLS.map(k=>`<option value="${k}" ${CFG.mCls===k?'selected':''}>${CLASSES[k].name} · ${CLASSES[k].sub}</option>`).join('')}</select></label>
      <label>Character name <input type="text" id="mName" maxlength="24" value="${esc(CFG.mName)}" placeholder="${CLASSES[CFG.mCls].hero}" style="background:var(--ink);color:var(--bone);border:1px solid var(--line2);border-radius:3px;padding:5px 6px;font-size:14px"> ${diceBtn('#mName')}</label></div>
      <div class="evdesc" style="margin-top:8px"><b>${M.goal}</b>${M.req?` Requirement: ${M.req.rr?M.req.rr+' coin in the Royal Reserve':''}${M.req.trophies?M.req.trophies+' trophies on record':''}.`:''}<ol style="margin:6px 0 0;padding-left:18px">${M.path.map(st=>`<li>${st.fest?festName(st.fest)+' festival, ':''}${EVENTS[st.ev].n} at ${LOCATIONS[st.loc].n}: <span style="color:var(--muted)">${st.t}</span></li>`).join('')}</ol></div>
      <p id="setupErr" style="color:var(--blood2);margin-top:8px"></p>
      <div class="mbtns"><button class="btn primary" type="button" id="goBtn">Begin the missio</button><button class="btn" type="button" id="rulesBtn2">Rules in this build</button></div></div></div>`;
  }
  const ev=EVENTS[CFG.ev],L=LOCATIONS[CFG.loc];
  const n=clamp(CFG.n,ev.min,ev.max);CFG.n=n;
  const mods=L?`<div class="mods"><span class="badge good">${modText(L.good)}</span><span class="badge bad">${modText(L.bad)}</span></div>`:'';
  return tabs+`<div class="setup-grid">
   <div><div class="locinfo lochead" style="margin:0 auto 8px"><b style="font-family:var(--display);font-size:18px;color:var(--gold2)">${L.n}</b> <span class="rc-sub">· the city's own event: ${EVENTS[L.ev].n}</span><div style="color:var(--muted);font-size:13px;margin-top:4px">Class modifiers (applied once, before the event):</div>${mods}<div id="rollmsg" style="color:var(--muted);font-size:13px;margin-top:6px"></div></div>
    <div class="mapbox" id="mapbox">${mapSVG()}<div class="maprolls"><button class="btn tksm" type="button" id="roll6" title="Roll a d6: a random city from 1–6">🎲 Random 1–6</button><button class="btn tksm" type="button" id="roll12" title="Roll a d12: a random city, 1–12 — 1s and 12s re-rolled with 4+ gladiators">🎲 Random 1–12</button></div></div>
   </div>
   <div>
    ${(()=>{const c=calNow();const dt=empireDate(c.season,c.week);const on=c.fx.loc===CFG.loc&&c.fx.ev===CFG.ev;return `<div class="card2" style="margin-bottom:8px;border-color:${on?'var(--gold)':'var(--line2)'}"><b>📅 ${esc(dt.short)}</b> <span class="rc-sub">season ${RN(c.season)}, week ${RN(c.week)}</span><div style="font-size:13px;margin-top:3px">This week the editor's games are at <b>${esc(LOCATIONS[c.fx.loc].n)}</b>: <b>${esc(EVENTS[c.fx.ev]?EVENTS[c.fx.ev].n:c.fx.ev)}</b>${on?' — <span style="color:var(--gold2)">you are on the schedule</span>':` — <button class="btn" type="button" data-fixture="1" style="padding:2px 8px;font-size:12px">Follow the schedule</button> <span class="rc-sub">or play off-schedule; the empire won't mind</span>`}</div><details style="margin-top:4px"><summary class="rc-sub" style="cursor:pointer">The season's schedule</summary>${scheduleHTML(c.season,c.week)}</details></div>`})()}
    <label style="display:grid;gap:4px;font-size:14px">Event<select id="evSel">${eventOptions()}</select></label>
    <label style="display:grid;gap:4px;font-size:14px;margin-top:6px"><span>City <span class="rc-sub" style="font-size:12px">· or click a city on the map</span></span><select id="locSel">${LOCATIONS.map((L2,i)=>L2?`<option value="${i}" ${i===CFG.loc?'selected':''}>${i} · ${esc(L2.n)}${evDefaultLoc(CFG.ev)===i?' — this event\u2019s home':L2.ev&&EVENTS[L2.ev]?' · home of '+esc(EVENTS[L2.ev].short||EVENTS[L2.ev].n):''}</option>`:'').join('')}</select></label>
    <div class="evdesc" style="margin-top:8px;display:flex;gap:10px;align-items:flex-start">${ev.custom?'<span style="font-size:38px;line-height:1;color:#cdb8ff">✦</span>':cardHTML('e:'+CFG.ev,'sm')}<div>${ev.custom?customTag()+' ':''}${ev.blurb}<div class="rounds">${roundsChips(ev)}</div>${ev.custom?`<div class="rc-sub" style="margin-top:4px">${{ffa:'Free-for-all',teams:'Teams',coop:'Co-op against the beasts'}[ev.src.mode]} · ${ev.layout.pillars.length} pillars · ${ev.layout.npcs.length} beasts · loadout: ${{class:'class gear',empty:'nothing',draft:'snake draft'}[ev.loadout]}${ev.noMarket?' · market closed':''}${ev.limits&&ev.limits.rot?' · '+ev.limits.rot+' rotation limit':''}${ev.limits&&ev.limits.min?' · '+ev.limits.min+' minute limit':''}. Custom events do not count toward the Infamis or the Hall of Flavius.</div>`:''}</div></div>
    ${ev.min!==ev.max?`<label style="display:flex;gap:8px;align-items:center;margin-top:8px;font-size:14px">Gladiators <select id="nSel">${Array.from({length:ev.max-ev.min+1},(_,i)=>ev.min+i).map(v=>`<option ${v===n?'selected':''}>${v}</option>`).join('')}</select></label>`:''}
    ${typeof rosterPickHTML==='function'?rosterPickHTML('cfg',CFG.roster):''}
    <div class="seats">${seatRows(ev,n,allowedClasses(ev))}</div>
   </div></div>
   <div class="setup-opts">${optionsHTML(ev,L)}</div>
    <p id="setupErr" style="color:var(--blood2);margin-top:8px"></p>
    <div class="mbtns"><button class="btn primary" type="button" id="goBtn">Sound the horns</button><button class="btn" type="button" id="rulesBtn2">Rules in this build</button></div>`;
}
// v0.27: an event's home city — its own EVENTS.loc, else the city whose games it is
function evDefaultLoc(ev){const E=EVENTS[ev];if(!E)return null;if(E.loc&&LOCATIONS[E.loc])return E.loc;const i=LOCATIONS.findIndex(L=>L&&L.ev===ev);return i>0?i:null}
async function openSetup(fresh){
  if(fresh){CFG.mode='event';CFG.loc=6;CFG.ev='democritus';CFG.n=4;CFG.touched=1} // v0.22: a fresh New event always opens on Roma · Classic Democritus (the week's fixture is one click away)
  MISSIO_CACHE=await Store.list('missios');await loadLudus().catch(()=>{});await Promise.all([loadCustoms(),loadCrowd().catch(()=>{})]).then(x=>x[0]).catch(()=>{});
  if(!EVENTS[CFG.ev])CFG.ev='democritus';
  window.SETUP_OPEN=true;try{render()}catch(e){}
  modal('Choose the arena, event and gladiators',setupBody(),[],{wide:1,full:1,close:'closed',onOpen:done=>{
    const box=$('#mBody');
    const redraw=()=>{box.innerHTML=setupBody();try{render()}catch(e){}};
    const setLoc=n=>{CFG.loc=n;const L=LOCATIONS[n];if(L.ev&&!(EVENTS[CFG.ev]&&EVENTS[CFG.ev].custom))CFG.ev=L.ev;redraw()};
    box.onclick=e=>{
      const mt=e.target.closest('[data-mode]');if(mt){CFG.mode=mt.dataset.mode;redraw();return}
      const tr=e.target.closest('[data-tourn]');if(tr){if(tr.dataset.tourn==='resume'){done('tournresume');return}if(tr.dataset.tourn==='abandon'){TOURN=null;tournSave();redraw();return}}
      const tp=e.target.closest('input[name="tsid"]');if(tp){CFG.tSid=tp.value;redraw();return}
      if(e.target.closest('[data-fixture]')){const c=calNow();CFG.loc=c.fx.loc;CFG.ev=c.fx.ev;const E=EVENTS[CFG.ev];CFG.n=clamp(CFG.n,E.min,E.max);redraw();return}
      const city=e.target.closest('.city');if(city){setLoc(+city.dataset.loc);return}
      const cont=e.target.closest('[data-cont]');if(cont){done({missio:cont.dataset.cont});return}
      const lm=e.target.closest('[data-lmissio]');if(lm){done({lmissio:lm.dataset.lmissio});return}
      if(e.target.closest('#roll6')){const r=d6();setLoc(r);$('#rollmsg').textContent=`d6 rolled ${r}.`;return}
      if(e.target.closest('#roll12')){let r=1+rnd(12),tries=[r];while((r===1||r===12)&&CFG.n>=4){r=1+rnd(12);tries.push(r)}setLoc(r);$('#rollmsg').textContent=`d12 rolled ${tries.join(' → ')}.`;return}
      if(e.target.closest('#rulesBtn2')){done('rules');return}
      const tu=e.target.closest('[data-tune]');if(tu){const st=CFG.seats[+tu.dataset.tune];st.tune=!st.tune;redraw();return}
      if(e.target.closest('#goBtn')){
        const err=m=>{const el=$('#setupErr');if(el){el.textContent=m;el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}if(typeof mToast==='function')mToast('⚠ '+esc(m))}; // v0.41: never a silent button
        if(CFG.mode==='missio'){done('missio');return}
        if(CFG.mode==='tourn'){done('tourn');return}
        const ev=CFG.mode==='festival'?EVENTS.democritus:EVENTS[CFG.ev];const seats=CFG.seats.slice(0,CFG.mode==='festival'?4:CFG.n);

        if(CFG.mode==='event'){
          if(ev.teams==='jugg'){if(seats.filter(s=>s.team==='J').length!==1)return err('Choose exactly one Juggernaut.')}
          else if(ev.teams&&new Set(seats.map(s=>s.team)).size<2)return err('Split the gladiators into at least two teams.');
        }
        done('go');return;
      }
    };
    box.onkeydown=e=>{const city=e.target.closest('.city');if(city&&(e.key==='Enter'||e.key===' ')){e.preventDefault();setLoc(+city.dataset.loc)}};
    box.oninput=e=>{const t=e.target,id=t.id;
      if(t.dataset.crowd){const k=t.dataset.crowd;const v=clamp(+t.value||100,0,200);if(k==='act')CROWD.act=Math.max(10,v);else CROWD.t[k]=v;if(t.nextElementSibling)t.nextElementSibling.textContent=(k==='act'?CROWD.act:v)+'%';saveCrowdCfg();return}
      if(id.startsWith('nam')){const st=CFG.seats[+id.slice(3)];st.name=t.value.trim();if(!st.saved)saveClsName(st.cls,st.name)}if(id==='mName')CFG.mName=t.value.trim();
      if(t.dataset.pk){const st=CFG.seats[+t.dataset.seat];if(st.preset!=='custom'){st.pers=seatPers(st);st.preset='custom';const sel=$('#pre'+t.dataset.seat);if(sel)sel.value='custom'}st.pers[t.dataset.pk]=+t.value;t.nextElementSibling.textContent=t.value}};
    box.onchange=e=>{
      const t=e.target,id=t.id;
      if(t.name==='fk'){CFG.festKind=t.value;return}
      if(id==='festSR'){CFG.festSR=t.value;return}
      if(id==='mCls'){CFG.mCls=t.value;redraw();return}
      if(id==='evSel'){CFG.ev=t.value;const E=EVENTS[CFG.ev];if(E&&E.custom){CFG.opts.spect=E.spect||0;CFG.loc=E.loc||CFG.loc}else{const dl=evDefaultLoc(CFG.ev);if(dl)CFG.loc=dl}if(E)CFG.n=clamp(CFG.n,E.min,E.max);redraw();return}if(id==='locSel'){CFG.loc=+t.value;redraw();return}
      if(id==='nSel'){CFG.n=+t.value;redraw();return}
      const o=CFG.opts;
      if(id==='oMods')o.mods=t.checked;if(id==='oMandata')o.mandata=t.checked;if(id==='oOpt'){o.optOffers=t.checked;redraw();return}if(id==='oEagle'){o.eaglePot=t.checked;redraw();return}if(id==='oZora')o.zoraCard=t.checked;if(id==='oFalls')o.fallsApart=t.checked;if(id==='oBoar')o.boar=t.checked;if(id==='oCarmina')o.carmina=t.checked;
      if(id==='oSeed'){const v2=t.value.trim();CFG.seed=v2===''?null:(Math.abs(parseInt(v2,10))||null);return}
      if(id==='oSpect'){o.spect=clamp(+t.value||0,0,96);redraw();return}if(id==='oSpectMode'){o.spect=t.value==='auto'?'auto':16;redraw();return}if(id==='oSpectMe')CFG.spectHuman=t.checked;if(id==='oChPvp')CFG.chPvp=t.checked;
      const i=+id.slice(-1);
      if(/^cls\d$/.test(id)){const st=CFG.seats[i];st.cls=t.value;if(!st.saved)st.name=clsSavedName(st.cls);redraw()}
      if(/^cpu\d$/.test(id)){CFG.seats[i].cpu=t.value==='1';redraw()}
      if(/^dif\d$/.test(id)){CFG.seats[i].diff=t.value;redraw()}
      if(/^pre\d$/.test(id)){const st=CFG.seats[i];if(t.value==='custom'){st.pers=seatPers(st);st.tune=true}st.preset=t.value;redraw()}
      if(/^lcp\d$/.test(id)){const st=CFG.seats[i];const g=LUDUS_CACHE.find(x=>x.id===t.value);if(g){const clash=CFG.seats.find((o,j)=>j!==i&&o.cls===g.cls);if(clash)clash.cls=st.cls;Object.assign(st,{cls:g.cls,name:g.name,saved:g.id});if(g.pers){st.preset='custom';st.pers={...g.pers}}}else{st.saved=null;st.name=''}redraw()}
      if(/^sav\d$/.test(id)){const st=CFG.seats[i];const g=LUDUS_CACHE.find(x=>x.id===t.value);if(g){const clash=CFG.seats.find((o,j)=>j!==i&&o.cls===g.cls);if(clash)clash.cls=st.cls;Object.assign(st,{cls:g.cls,name:g.name,saved:g.id})}else{st.saved=null}redraw()}
      if(/^team\d$/.test(id))CFG.seats[i].team=t.value;
    };
  }}).then(async v=>{window.SETUP_OPEN=false;try{render()}catch(e){}
    $('#mBody').onclick=null;$('#mBody').onchange=null;$('#mBody').onkeydown=null;$('#mBody').oninput=null;
    if(v==='closed'){if(!S||S.phase==='setup'||S.over)log('Setup closed. Press <b>New event</b> when you are ready.');return}
    if(v==='rules'){showRules().then(openSetup);return}
    if(v&&v.missio){const rec=MISSIO_CACHE.find(m=>m.id===v.missio);if(rec)startMissio(rec);return}
    if(v&&v.lmissio){const g=LUDUS_CACHE.find(x=>x.id===v.lmissio);if(g){const ex=MISSIO_CACHE.find(m=>m.gladId===g.id&&m.status==='active');startMissio(ex||await missioFromLudus(g))}return}
    if(v==='tournresume'){openTourn();return}
    if(v==='tourn'){const s0=CFG.seats[0];const g=s0.saved?LUDUS_CACHE.find(x=>x.id===s0.saved):null;tournStart({cls:s0.cls,cpu:false,name:g?g.name:(s0.name||undefined),saved:g?g.id:undefined,cfStart:g?g.carry:undefined,severed:g?g.severed:undefined});return}
    if(v==='missio'){const rec=newMissio(CFG.mCls,CFG.mName||CLASSES[CFG.mCls].hero);await Store.put('missios',rec.id,rec);startMissio(rec);return}
    if(v!=='go')return;
    const clean=s=>{const g=s.saved?LUDUS_CACHE.find(x=>x.id===s.saved):null;return {...s,name:g?g.name:(s.name||(s.cpu?genName():undefined)),pers:s.preset==='custom'?finalPers(s):undefined,preset:s.preset, /* v0.46: rolled inside the event, from its seed */saved:g?g.id:undefined,cfStart:g?g.carry:undefined,severed:g?g.severed:undefined,tune:undefined}};
    if(CFG.mode==='festival'){startFestival(CFG.festKind,CFG.festSR,CFG.seats.slice(0,4).map(s=>({...clean(s),team:undefined})),{...CFG.opts});return}
    const ev=EVENTS[CFG.ev];
    const seats=CFG.seats.slice(0,CFG.n).map(s=>({...clean(s),team:ev.coop?'A':ev.teams?s.team:undefined}));
    const road=CFG.road&&CFG.road.loc===CFG.loc&&CFG.road.ev===CFG.ev&&seats.some(x=>x.saved===CFG.road.gid&&!x.cpu)?CFG.road:null;CFG.road=null;
    const spMe=!!CFG.spectHuman&&!seats.some(s=>!s.cpu);
    try{window.scrollTo({top:0,behavior:'smooth'});const cw=cv&&cv.parentElement;if(cw)cw.scrollIntoView({block:'start',behavior:'smooth'})}catch(e){} // v0.41: the horns sound — eyes on the sand
    try{window.scrollTo(0,0);document.documentElement.scrollTop=0}catch(e){} /* v0.45: the horns land you at the top of the arena */
    startEvent({road,ev:CFG.ev,loc:CFG.loc,seats,opts:{...CFG.opts,...(spMe&&!(CFG.opts.spect==='auto'||CFG.opts.spect>0)?{spect:'auto'}:{})},chPvp:CFG.chPvp,seed:CFG.seed||undefined,spectHuman:!!CFG.spectHuman&&!seats.some(s=>!s.cpu)});
  });
}
function showRules(tab='build'){
  const buildHTML=`<div class="rules">
  <div class="rsplit"><div><h4>📜 From the original Magnus Edition of Flavius Rule</h4><p class="rc-sub" style="margin:0 0 6px"><b>One word, one meaning:</b> the <b>editor</b> is the one who gives (pays for) the games — the rulebook's term. Flavius is the empire's great editor; win in a city and its own editor takes the box. A house's financial <b>backer</b> is money behind a ludus, not the games' host.</p><p class="rc-sub" style="margin:0 0 6px">Played as printed — page references are to the Magnus Edition rulebook. The same game is on the table as the <b>print &amp; play</b> edition and as the <b>Tabletop Simulator mod</b>.</p><div class="rtiles"><div class="rtile"><span class="rti">🏟</span><div><b>The arena</b><span>Board from p.9: 12 pillars, 4 tunnels, the chest, spikes and 6 base beasts with their zones.</span></div></div><div class="rtile"><span class="rti">⚔</span><div><b>Turns & combat</b><span>Phases, movement, pushing & toppling, tunnels, focus rolls, throws, looting, trading and truces. PvP 2 hit dice, PvE 4, NPCs 2; shields absorb by choice.</span></div></div><div class="rtile"><span class="rti">🛡</span><div><b>Armor & weapons</b><span>Every armor piece (to 7 AP) and all 40 weapon cards, the market, and the level 4 treasures.</span></div></div><div class="rtile"><span class="rti">🐾</span><div><b>Beasts</b><span>Base and spawned NPCs with Initial / Raged / Fazed states, Commodus, Tholo, the lions, Zora, taming and lures.</span></div></div><div class="rtile"><span class="rti">🏺</span><div><b>Blessings</b><span>One face-down bag: 12 pots, one per pillar; spawned offerings come from the same bag.</span></div></div><div class="rtile"><span class="rti">⚖</span><div><b>Summa rudis & Fates</b><span>Per-round PvE/PvP/CF/ability flags, rewards, the zone, and your Fate from final CF.</span></div></div><div class="rtile"><span class="rti">🗺</span><div><b>Locations</b><span>The 12-city map, d6/d12 rolls and class modifiers.</span></div></div><div class="rtile"><span class="rti">🎪</span><div><b>Special events</b><span>Chariot racing, Naumachia, festivals, Carmina Fescennina, missios, events for 5–8 gladiators.</span></div></div><div class="rtile"><span class="rti">👥</span><div><b>Spectators</b><span>8 sections, section cheers, stones, offerings and the Tholo chant (p.34-35).</span></div></div><div class="rtile"><span class="rti">🂠</span><div><b>Every card</b><span>The 70-card arena deck, round-2 cards, Mandati Flavi, Carmina, class and event cards, the Fates.</span></div></div><div class="rtile"><span class="rti">🏛</span><div><b>Infamis & Hall</b><span>The monthly high-score table and the Hall of Flavius.</span></div></div></div></div>
  <div><h4>✨ Extra in this digital standalone edition</h4><p class="rc-sub" style="margin:0 0 6px">Built around the printed game — none of it changes a printed rule.</p><div class="rtiles ext"><div class="rtile"><span class="rti">💼</span><div><b>Manager mode</b><span>A living league: stables, contracts, morale, the fate table, blood money, Match Week, the Acta Diurna.</span></div></div><div class="rtile"><span class="rti">🌍</span><div><b>Imperium & the crowd</b><span>Named regulars with memories and tempers, fans on the roads, world events, weather and omens.</span></div></div><div class="rtile"><span class="rti">🎨</span><div><b>Creator Studio</b><span>Custom characters, beasts, events, spectators and board tokens — with a shape editor.</span></div></div><div class="rtile"><span class="rti">📅</span><div><b>Calendar</b><span>A shared empire calendar and 12-week season schedule; every event moves it on.</span></div></div><div class="rtile"><span class="rti">💰</span><div><b>Wagers & exchange</b><span>A bookmaker for every event and one betting ledger across the empire.</span></div></div><div class="rtile"><span class="rti">🏆</span><div><b>Annals & the Road</b><span>Achievements with real rewards, seeded records, the Liberti and the Road of Flavius.</span></div></div><div class="rtile"><span class="rti">🎭</span><div><b>Sponsors</b><span>A patron for every city, unlocked by winning there, and a Sponsor creator once you have won in all twelve.</span></div></div><div class="rtile"><span class="rti">🏆</span><div><b>Trophies &amp; tournaments</b><span>A trophy room and the Flavian Awards in Manager mode, invitationals that pause the week, bracket tournaments, and a trophy designer for your own events.</span></div></div><div class="rtile"><span class="rti">🔊</span><div><b>Audio</b><span>A generated theme for every arena and sound effects.</span></div></div><div class="rtile"><span class="rti">💾</span><div><b>Saves</b><span>Named game saves and portable save files.</span></div></div></div></div></div>
  <details class="card2" style="margin-top:10px"><summary><b>Interpretations, simplifications and the card sheets</b> <span class="rc-sub">where the digital game had to decide</span></summary>
  <h4>From your card sheets (v0.4)</h4><ul>
  <li>All 40 weapon cards (power, range, ammo, uses, throws, absorb, CF per hit, soul steal, both attacks); one card of each in the market, class weapons pulled out for the gladiators in play, and the level 4 Labrys, Psykhe and Shield of Achilles in the Arena Chest.</li>
  <li>The full 70-card arena deck and the 12 round-2 cards, the 15 Mandati Flavi, the 12 Carmina verses, the 8 class cards, the 13 Summa Rudis event cards and the 12 Fates. Hover any card name or thumbnail to see the card.</li></ul>
  <h4>Interpretations</h4><ul>
  <li>Commodus' entrance damage goes to the location every gladiator can best afford. Lure and Rete use range 4 from the thrower. Herculean Vigor applies to your next attack. "A generous applause" is flavor.</li>
  <li>The Naumachia water tokens now use the printed set (water tiles, crocodiles, sunken Level 1–3 weapons and armor, and +2/+3 AP Armor Upgrades; 16 drawn face-down), and the chariot horses (Palmatus, Ocianus, Saxo, Vindex), wheels (Wagon, Laurel, Gilded) and chariot names use the printed token stats. The 36 Blessings tokens remain an estimated mix.</li></ul>
  <h4>Simplifications</h4><ul>
  <li>Naumachia teams take turns one gladiator at a time (grouped by team) rather than moving simultaneously. Festival and missio events always use CPU opponents for the empty seats.</li></ul></details></div>`;
  const histHTML0=`<div class="rules"><ul>
  <li>New in v0.40: a grouped left rail for Manager mode and the Creator Studio in full screen (Ludus · Arena · World · Lanista; Overview · Fighters · Gear · Arena · Tools).</li>
  <li>New in v0.39: one sculptor (drag, bake and unbake) in the Token, Weapon, Armor, Trophy and Banner designers, blank canvases with a Start-from picker, a weapon-first forge with its card below, and armor fitted on the avatar and worn in play.</li>
  <li>New in v0.38: spectating everywhere — Play-as-spectator for all-CPU games, tickets mid-match from the active wallet, Spectate buttons for every Match Week bout, special and the Superbus (helping your own costs fame), a founding house rule for it — and the menu show’s beasts, Commodus’s triumph and the dust-cloud duel.</li>
  <li>New in v0.37: Learn to play (a guided first bout with Flavius), gold turn hints, rule hints on hover, a start-of-turn recap, right-click context menus, the Step speed, thumbs-down endings for all-truce arenas, Both attacks, and a complete All creations list.</li>
  <li>New in v0.36: fighters’ own purses and the ludus buyout (or the walk-out that founds a rival), home cities with real perks, working Easy/Standard/Hard house rules, a balanced Lanista tab, Naumachia reset to Classic, a developer’s key, unique creation names, trophy sculpting and materials, eight new banner devices, a headless Tholo, baked details that follow the body, a twelve-track playlist with fades, printed-style custom weapon cards, every printed ability in the forge, and settings that apply live.</li>
  <li>New in v0.35: once-per-event bosses, full-screen modes that return to the menu, a frozen group photo, Load game, save overwrite, the share build saving properly, the reordered post-show (with Naumachia fishing and draining), its countdown and Return to Match Week, live bouts landing back on Match Week, a sealed gate when no games are on, clear YES/NO when recruiting a spectator, banners above the board, Visuals folded into General, and a self-sorting version history.</li>
  <li>New in v0.34: the rebranded main menu with the group photo, the Sutler’s Stall market, the crew sweeping up leftovers and emptying the stands, the Debtor’s Gambit, the one-file share build, honors gated by legacy, Shut down the ludus, Easy/Standard/Hard house rules.</li>
  <li>New in v0.33: the main menu (first cut), the post-show arena reset with Charun and the corpse carts, corpse states for everything slain, the banner hierarchy and press presets, the gate lock after the horns, the arena-owner tag, stands-list parity.</li>
  <li>New in v0.32: blood, severed limbs and the clean-up crew; sculpting on the gear benches with the art in the fighter's hand; "the editor" named properly everywhere; flags became banners; the city square roomier, textured and speed-controlled with the gate flow into Match Week; Safari audio unlocked; Settings reorganized (Themes tab, Voices &amp; bubbles); attendance scales with the card.</li>
  <li>New in v0.31: the Gear forge (custom weapons with printed-bounds stats and their own cards, custom armor), the drawn armor set from the designer's own scans (with a legacy toggle), house flags everywhere (picker, Flag press, the stands superfan), one unified spectator system (full figures in the city, faces in the tiers), textured city shops, spectator dealings limited to three a week, loans sized to fame and record, house rules locked at creation.</li>
  <li>New in v0.30: explorable city squares in every arena city (crowds, shops, the auction block, beasts, the horns and a fade into the arena), start-of-bout kit shopping, loans from a syndicate or a friendly house, the Legacy score and retirement into the Annals, Match Week in order, exhibition (Fate-free) invitations, the Archives moved into News.</li>
  <li>New in v0.29: one empire clock (End the week), the weekly loop with End the week at the far right of the tabs, league points and the table, Fates on every sand (with a Fate-free switch), a Running-the-ludus dashboard, compact invitations, sixteen Flavian Awards, team form and fixtures, recruit search, a healthier league economy, attendance wording, the sling, audio fixes.</li>
  <li>New in v0.28: coin-first recruiting (one of each action per recruit a week, three pitches), facilities and the Ludus grade, team screens with correspondence and trades, rival houses that act (and keep ledgers), the Flavius Superbus finale, city sponsors and the Sponsor creator, beast kinds, the Emperor's tenth on betting, a unified Season tab, the Imperium and Wagers tabs, the care guide and wage breakdown, spectator search.</li>
  <li>New in v0.27: the trophy room and the Flavian Awards, invitational special events with brackets, early billing, New event → Tournament, a trophy designer (and trophies on custom events), Liberti career plaques, the Fate score explained (held CF vs the winner's bonus), an event's home city and a City dropdown, the Imperium map inside News.</li>
  <li>New in v0.26: big crowds scale Crowd Favor by exact share of the house (max 3 CF per cheer over 8 seated), world stories and weather evolve week to week on the empire calendar, a career started mid-season joins a league already under way, a tidier Spectators option.</li>
  <li>New in v0.25: an event title card, all three token styles side by side, a token library, hair under helmets and no more portrait checkboxes, a mute button, crowds counted in thousands, close buttons on the right, a broadsheet Acta Diurna, the Road of Flavius in plain sight, and this reorganised rules window (see <b>What's new</b>).</li>
  <li>New in v0.24: <b>🔊 Audio</b> — a generated theme for every arena (pulsing strings, soft pads, a plucky lead, timpani) and sound effects, all in Settings → Audio · sculpted <b>figure tokens by default</b> (two secret styles hide in Settings → Tokens), a cyclopean Tholo with his great club, dozens of new token wearables and a <b>shape editor</b> (add, drag, resize, rotate, commit) · a compact Settings window · the <b>Hall of Flavius</b> comes alive: twelve achievements with real rewards, and an old inscription about a Road… · the scribes fill every empty event record · every freedom — even in the league — joins the Liberti · results show portraits and tokens, drawn and declared cards are labelled, the Fates view knows when it's over · betting slips carry empire dates and hours · <b>Manager mode</b>: a letter from the capital when your career falls behind the empire (let the doctores catch up), the Consilium of advisors, separate Roster and Recruiting tabs, and the Acta Diurna's Darwinius Awards.</li>
  <li>New in v0.23: <b>Board tokens</b> — Standees, sculpted <b>Figures</b> or the original Cylinders (Settings), true-to-scale standees, and a <b>🗿 Token creator</b> in the Creator Studio for every class, beast and creation · every event you play moves the empire's calendar one week · New event opens on Roma · Classic Democritus, with the options spanning the bottom, and the top bar follows your pick · Imperium joins the main bar; the Fates table lives inside Standings · named beasts read “Archimedes (Human)” · <b>Manager mode</b>: Roster &amp; Recruiting, the ledger and the Fallen under the training yard, the league rules on the Lanista page, a full <b>📈 Exchange</b> tab, a Match Week results sheet after “Simulate every remaining bout”, “Walk the sand” for this week's arena, and an Acta Diurna with top-ten tables and an Overheard column of real crowd chatter and imperial satire.</li>
  <li>New in v0.22: the <b>classic standees</b> — the real Flavius Rule minis for all eight classes and the default beasts (Tholo, Commodus, Leo &amp; Leaena, Ursa &amp; Brutum, Valencia &amp; Moechus, Glykon &amp; Arenosus) stand on the board, in the Menagerie, the beast tracker, the seats and the gladiator card (Settings → Classic standees) · the Menagerie quotes the rulebook's own <b>ludus notes</b> · any window pauses a live match and resuming picks up at the same pace · “?” when no event is on · gold coin, wheat (CF), key and trophy icons · <b>Manager mode</b>: a landing page with the week in review and a to-do list, the ludus tools above the roster, morale that really changes how fighters fight, careers that join the empire's calendar where it stands, gladiators from 16 to 80, fight cards that name teams and the Juggernaut, laurel-wreath fame · <b>the betting exchange</b>: a real ledger of every wager laid across the empire · an <b>All creations</b> table in the Creator Studio · empire banners behind portraits · optional add-ons start unchecked · the Empire Today shows its top ten.</li>
  <li>New in v0.21 (part 2): <b>💾 Game saves</b> (Settings → Game saves: named saves in this browser, download a save file, open one on any device) · <b>empire banners</b> — fourteen city flags for the page background (Settings → Visuals) · <b>the Bookie's Haven</b> — a live ticker of money moving through the betting network, drifting odds, smart money and the house handle · the <b>Creator Studio</b> opens every tab ready to create, with your creations listed beneath · more looks for custom characters (hairstyles, beard styles, eyes, scars and marks, garb, six new helmets, earrings, new hair dyes and backdrops) and hats for spectators.</li>
  <li>New in v0.21 (part 1): custom creations join the league only when you <b>add them to the rolls</b> — and the fallen stay fallen · <b>⏩ Sim to end</b> at any moment of an event, even while fighting it yourself · a redesigned <b>Match Week</b> card (purse, appearance fee, summa rudis, ratings, fame) · the <b>Acta Diurna</b> leads with the week's biggest story by the numbers, recaps the empire, lets you ☆ favorite living gladiators and strikes out the dead and freed in old editions · the Ludus tab gathers training, schooling, promotion, ledger and the Fallen · ⚕ injury badges and healing right from the roster · 🏵 fame marks · richer obituaries · rivalries between old stables · four new stables and five new lanista presets · take over a ludus under your own name · a gentler default league (rookie mercy, "arena time") · × close buttons everywhere · English calendar dates and a Season tab · many alignment and window fixes.</li>
  <li>New in v0.20: the empire keeps a <b>calendar</b> — a Roman date on every event, and a 12-week <b>season schedule</b> (one arena a week, classics by far the commonest, rare specials with fatter purses, Cassian's Grand Games in week XII) that Manager mode locks into and New event opens on (play off-schedule if you like); the top bar reads where, when, and the round in one breath; <b>every city names its own beasts</b> (Capua's bears are Tifata and Sannio, its champion Spartacus…) — with per-beast ledgers in the Menagerie, custom beasts' ledgers, and a 🐾 beast tab in the name generator; manager mode: <b>bribe the levy</b> (or let them march), a <b>bookmaker's cut</b> of every wager laid on your rostered fighters, 🔭 <b>arena scouting</b> ahead of match night (+1 AP, +1 coin at the gates), Promote and Schooling moved to Your ludus, and a Lanista tab that fits on one screen; <b>Imperium</b>: the empire's 15 weightiest events up top, then a city card with the stands, local news and mood, the pens, the top-5 local heroes, who lives there and what they are doing right now (attendees only during a live event); spectators wear <b>two-part togas</b> (tunic in their home city's wool, mantle in their fighter's colors); a CF ledger on the player board (hover CF ⓘ); Flavius keeps clear of the sand with the stands off; big windows hold their size across tabs; and Infamis &amp; Hall is now <b>the Annals</b>.</li>
  <li>New in v0.19: <b>🐾 Menagerie</b> — Beasts &amp; cards grown into a full window with a Bestiary: lore, stats and all-time ledgers (slain, gladiators eaten, tamed) for every beast; <b>Imperium reworked</b> — fans now travel real roads and sea lanes (⛵ dashed) instead of crow-flight, the radar sweep is gone, weather reads bolder, a ⚔️ <b>war-map layer</b> shows who presses whom (severity-3 wars CLOSE that arena and the levy may conscript soldiers — survive the war for a hero's return, +rating, +fame, fans across the empire), 🌋 <b>Vesuvius</b> stirs near Pompeii, and the focused city gets its own framed tile; Ludus gladiators wear <b>star ratings</b> everywhere; Manager mode gains a 🏜 <b>Sandbox</b> (lethality, blood-money prices, injuries, training gains, rookie influx — all sliders), a season-ending <b>festival finale</b> in Roma (leader picks the festival, top four stables draft champions, Cassian presides), 🏺 <b>Archives</b> (every Acta of the season re-readable, leather-bound season recaps, also shelved in the Annals), 📯 <b>promotion</b> (feast a city, sponsor games, hire criers — fans land on the Imperium map), 🤝 <b>bout-fixing</b> (guaranteed win, real risk: caught twice in a career and Flavius seizes the ludus; even unseen, bought palms weigh on the barracks), an ⚕ <b>Infirmary</b> (the wound picks its cure — rest, Medicus, or the surgeon's knife; festering wounds kill, send fighters fleeing, or scar them; bathhouse days and the priests of Asclepius for the rich; badly-hurt arena survivors are now carried to the Ludus infirmary automatically and must be treated within four events), tab icons throughout, ★ <b>Favorites</b> (the Board, renamed and explained), a sharper <b>Your scouts</b> column (▲ value / ▼ trap against the bookmaker), hoverable disabled buttons that say what they need, an on-screen 📍 location chip for every event, a hoverable <b>coin ledger</b> on the player board, and smarter CPU tunnels (escape AND travel) and pillar-toppling (weaponless looters bring the pillar down).</li>
  <li>New in v0.18: <b>Manager mode now plays by the printed Fate table</b> — every fighter in every league bout, win or lose: under 17 CF condemned, 17-19 the <b>Thumb of Flavius</b>, 20-49 the Ludus Flavius, 50+ the <b>rudis</b> — with <b>blood money</b> (pay the editor to buy back a condemned fighter) and your own thumbs, blood money and rudis choices waiting on Match Week; results show finishing order and each fighter's Fate by name; <b>the Thumb of Flavius is now a ritual</b> — you roll the d6 yourself (4-6 spared) and, if it goes down, the d12, with Flavius reacting at every roll; a <b>missio</b> means what the rulebook says — a five-event campaign — everywhere; <b>The Stands became 🌍 Imperium</b>: a map with fans streaming in (colored by whom they cheer), a weather "doppler", and world events (politics, war, economy, famine, earthquakes, plague, trade) that move attendance and moods, plus who of note is in attendance; spectators wear <b>robes</b> (color them in the creator), can be <b>bought tickets</b> (seated now, or guaranteed next time) — and you can ticket your fighters' families for loyalty; off-duty league fighters sometimes watch from the stands; rare <b>famous visitors</b> from Roman history (toggle in Settings); a 🏋 <b>Practice</b> tab for exhibitions against rival stables (nobody dies — the doctors pull them; the stands fill with gladiators who only watch and talk); the Acta Diurna previews <b>next week</b> (forecast, world news, the card, purses, bad blood); cards always show beside every manager list; gladiatrices (♀, mostly Amazonia) join the league; the Ludus's <b>active roster</b> (now 8) stands apart from the rolls; and American spelling throughout ("doctore" is now the Latin <i>doctor</i>).</li>
  <li>New in v0.17: spectators default to <b>🎲 Random — the empire decides</b>: the city's appetite, hometown regulars, every fan, kin and patron following today's fighters, the billing and the omen fill the stands (the log says why), and manager live-watches use it too; the header wears icons, the ⚙️ settings cog sits alone at the far right, and <b>Standings pulses in the leader's color</b> (flashing when the lead changes); visual sliders (board brightness, text size, highlights) now stay where you leave them, even across arena tints; manager results now say <b>eliminated · spared</b> (missio — back to the ludus) vs <b>✝ killed</b> (gone for good); the recruiting <b>Board</b> opens cards in its own side panel (and a Scout-button lockup is fixed); and your own fighters get a full card with <b>retention</b> actions — meals, a private word, bonuses, raises, main-event promises, a personal doctor — all feeding a loyalty meter that rivals must beat to poach them.</li>
  <li>New in v0.16: <b>five festivals</b> to choose from, each with its own between-events gift (Ludi Apollinare, Saturnalia, Asclepieia, Vulcanalia, Fors Fortuna); <b>The Stands is now a full window</b> — the spectator world's hub, with empire-wide fandom counts, home cities (regulars pack their own city's stands first), family ties and a pool grown to ~160 regulars; manager mode gains a <b>career chronicle</b> on every fighter (wins, signings, poaches, class changes, deaths — with team, arena and date), a <b>perk tree</b> for the lanista (points earned each week, spent the next, on the same traits recruits grade), <b>training regimes</b> (light/standard/brutal — cheaper is safer, brutal bruises) plus a per-fighter personal doctor, <b>gems and the overhyped</b> hidden in the recruit pool (scout twice or run a <b>trial bout</b> on your own sand to find out), recruit cards for your own signed fighters (with ★ pinning everywhere), win-rate now sways recruit interest, bout injuries, freedom purchases and thematic deaths at season's end, a tiny weekly chance anyone simply dies (bookies, fevers, roof tiles), and real age variance — the old are not automatically good, and the good do not always last.</li>
  <li>New in v0.15: league fighters now carry <b>ages</b> (the young arrive as slaves and soldiers, the graying re-badge as Veteranus, and past 35 they start hanging up the sword), generated <b>faces</b>, a debut date, and mid-career <b>class changes</b> the criers report; "granted missio" is now explained where it happens (the editor's mercy — spared, keeping the bout's CF); a weekly <b>training yard</b> budget drills your whole stable, with a report in the Acta Diurna and the occasional training injury (Medicus clears it); your ludus keeps a private <b>ledger</b> of everything that touched it; festival gladiators now <b>choose their boon</b> (laurels, purse, elixir, armor fitting, or Flavius' notice); spectators can be created as <b>kin of a gladiator</b> — family colors in the stands, grief when they fall; the Ludus grid sinks the fallen and retired to the last tiles with a ⇄ tile-swap system; and the Hints toggle now lives on the arena itself.</li>
  <li>New in v0.14: <b>seeded dice</b> — set a Dice seed in Options and the whole event replays identically (the seed is stamped on the results banner, so any legendary match can be re-fought roll for roll); every event now opens with the pompa — a proper procession, roll call and (with hints on) a primer on the mode; CPU speed always starts on Slow; ending a manager week now prints the <b>Acta Diurna</b> — a week-end gazette with a generated lead story, the league's top fives and the obituaries; the League table lists each stable's top 3 rivals with a separate "toward you" gauge; Manager mode stretches out on big screens; and the spectator creator's face preview updates properly with a 🎲 randomizer to match.</li>
  <li>New in v0.13: retirement is real now — one confirm and the record is deleted from the game forever, though about one in four dodges Flavius's ledger and turns up in the cheap seats as a spectator, story intact; a spectator gets exactly ONE offer of the sword and some refuse it (ask the sausage guy — he also declines); buy a spectator's cheers (5 coin from your lanista) for any gladiator in play or on your roster; and a certain pair of anonymous crowd voices now narrate disasters in the stands log.</li>
  <li>New in v0.12: The Stands drawer above the arena (T / B keys) — beast tracker and cards in play, the arena's own chronicle (last spectator speared and by whom, concessions, brawls, commonest omen), and a full spectator roster with an inspector: personal lore, bans, standing a round, and signing a regular to your ludus as a raw recruit; troublemakers slip in (two at most); a Spectator creator in the Studio; per-location crowd temperaments layered on your sliders; you roll the Thumb of Flavius d6 yourself in the results window; theme colors for stands, pillars, pots, spikes, chest and rubble (all captured in saved profiles); distinct preset previews; a Recruiting board (★) in Manager mode; live-watched bouts sharpen scouting; the chariot card, horse and wheel tokens and the Lyre of Orpheus shown as real equipment.</li>
  <li>New in v0.11: sharper CPUs (shield discipline, danger-aware pathing, no more losing track of a walled-in beast); the strategy guide rebuilt on 300 fresh simulations, with sections on the newer rules and manager recruiting; a deeper recruiting portal (gifts, main-event pledges, grade tooltips that say how to raise them); fight your entered fighter yourself on match night; morale and a living Rivalry system in the League tab; the code under the hood now reads like a guided tour.</li>
  <li>New in v0.10: section cheers scale with attendance (a big house cheers louder, not richer) and attendance is recorded everywhere; per-event high scores; spectator contribution shown in results; crowd personality sliders; per-location arena palettes; lock/unlock on saved creations with an unlock log; gladiatrix option in the creator; force-retire in the Ludus; no coin-camping in the Gauntlet (12 stingy spectators at most, and the editor's lash); abandoning a live event now has mortal consequences.</li>
  <li>New in v0.9: the printed player-board avatar with your equipped armor tokens worn on the body; armor art cut out with transparent backgrounds; the printed square tunnel tokens on the board; chariot cards, horse and wheel tokens and the Naumachia water tokens as printed, with hover popups.</li>
  <li>New in v0.8: shields absorb by choice; freedom (the rudis) for 50+ CF winners, memorialized among the Liberti; a persistent crowd of regulars with memories, faces and allegiance colors; match-day omens swaying attendance, purses and hometown fighters; Flavius himself reacting above the A-1 corner; a deeper Creator Studio (named skin tones, ability values, beast templates); career leaderboard and one-click lanistae at the bookmaker's table.</li>
  <li>New in v0.6–0.7: spectator tastes, tempers and moods with emotes (up to 48 in the stands, one section per class color); the bookmaker's wagers, banked in your active lanista's treasury; the Creator Studio (custom characters, beasts and events, name generator); Manager mode with bankruptcy, weekly repairs and generated rivals; the roguelike Ludus (saved gladiators update automatically after every event they fight in — the fallen are struck for good).</li></ul></div>`;
  /* v0.35: the history sorts itself, newest first — an entry added in the wrong spot can never read out of order */
  const histHTML=(()=>{const items=histHTML0.match(/<li>[\s\S]*?<\/li>/g)||[];
    const ver=li=>{const m=li.match(/v0\.(\d+)(?:[\u2013-](\d+))?(?: \(part (\d+)\))?/);return m?(+m[1])+(m[3]?+m[3]/10:0):-1};
    return `<div class="rules"><ul>${items.sort((x,y)=>ver(y)-ver(x)).join('\n')}</ul></div>`})();
  const newHTML=`<div class="rules changelog"><h4>New in v0.40</h4><ul>
  <li>🧭 <b>The full-screen split.</b> Manager mode and the Creator Studio no longer squeeze every tab into one row. In full screen they sit in a grouped <b>left rail</b>: Manager as <b>Ludus</b> (your ludus, roster, recruiting, favorites, infirmary, practice), <b>Arena</b> (Match Week, wagers), <b>World</b> (news, league, Imperium, trophies, season) and <b>Lanista</b>, with ⏭ End the week under the rail; the Studio as <b>Overview</b>, <b>Fighters</b> (characters, beasts, tokens), <b>Gear</b> (weapons &amp; armor, trophies, banners), <b>Arena</b> (events, editors, spectators) and <b>Tools</b>. The chosen tab fills the rest of the screen. In a small window the familiar row of tabs returns. Match Week and the live bout are unchanged.</li>
</ul><h4>New in v0.39</h4><ul>
  <li>✏️ <b>One sculptor, every designer.</b> The Token Designer’s shape bench — add, click or <b>drag on the preview</b> (it keeps your grip), nudge, bring forward / send back, duplicate, delete, color, outline, width, height, rotation, opacity, <b>🔨 Commit</b> (bake) and <b>Unbake</b> — is now the very same bench in the Token Designer, the Weapon forge, the Armor forge, the Trophy designer and the Banner press. Baked shapes are drawn under the live ones and saved with the piece.</li>
  <li>⬜ <b>Blank canvases.</b> New weapons, armor pieces, trophies and banners start empty, on a gridded canvas. A <b>Start from…</b> picker still offers every printed silhouette, casting and heraldic device as a template. Characters and beasts keep their bodies.</li>
  <li>⚔ <b>The Weapon forge, weapon first.</b> The weapon itself is drawn large, upright, and sculpted there; its printed-style <b>card</b> is generated from it underneath — the same arrangement as the character creator’s portrait and token.</li>
  <li>🛡 <b>Armor on the body.</b> Toggle <b>On the avatar</b> to see the piece on the blank player avatar: drag it into place, size it, and click a body zone (head, chest, arm, leg) to choose where it equips. A fitted piece is <b>worn</b> on your player-board avatar in play (mirrored on the left side).</li>
</ul><h4>New in v0.38</h4><ul>
  <li>🎟 <b>Spectating is back — everywhere.</b> In Play now, with every seat CPU, <b>Play as a spectator</b> seats you in the stands before the horns (the crowd is filled in if you had none). During any match with no fighter of yours standing — none entered, or yours has fallen — <b>🎟 Buy a ticket</b> seats you mid-bout, paid from the active wallet (general admission 4 coin, not counted as betting). Each rotation you earn 1 CF and may throw stones or offerings, change sections or join a chant for Tholo.</li>
  <li>🏛 <b>Manager mode.</b> Every Match Week bout, special heat and the Superbus has a <b>🎟 Spectate</b> button: the ticket comes from your treasury, priced by the billing (Undercard 3 · Feature 6 · Main event 12 · a special 10 · the Superbus 20). Everything is allowed — but noticed: each offering to your own fighter, or stone at their rivals, costs your house <b>1 fame</b>, at most 3 a bout. Whether a career may spectate is a house rule chosen at the founding (on by default).</li>
  <li>🦅 <b>The show goes on.</b> On the main menu, after the Damnatio is hauled off, the base beasts come for the rest: the eagle drops from above, the bear rises from behind, wolves and snakes come in from the front, and Tholo reaches out of the shadows. With the sand empty, <b>Commodus</b> strides in and raises his sword as laurels and flowers rain at his feet — and now and then a gladiator comes back, fights him in a cloud of dust, and kneels over his body.</li>
</ul></div>`;
  const body=`<div class="seg" role="tablist" style="margin-bottom:10px"><button type="button" data-rul="build" class="${tab==='build'?'on':''}">Rules at a glance</button><button type="button" data-rul="new" class="${tab==='new'?'on':''}">What's new</button><button type="button" data-rul="hist" class="${tab==='hist'?'on':''}">Version history</button><button type="button" data-rul="guide" class="${tab==='guide'?'on':''}">Play Now guide</button><button type="button" data-rul="mguide" class="${tab==='mguide'?'on':''}">Manager guide</button><button type="button" data-rul="learn" class="${tab==='learn'?'on':''}">🎓 Lessons</button></div>
    <p style="margin:0 0 10px"><a class="btn" href="https://drive.google.com/file/d/1gNMkuRG4_kFjeGMBWAdAMaj58CFBbo-t/view" target="_blank" rel="noopener" style="text-decoration:none">📖 Read the full rulebook ↗</a> <span class="rc-sub" style="margin-left:8px">the printed rules this build is based on (PDF, opens in a new tab)</span></p>
    <div id="rulTab-build" ${tab==='build'?'':'hidden'}>${buildHTML}</div><div id="rulTab-new" ${tab==='new'?'':'hidden'}>${typeof whatsNewHTML==='function'?whatsNewHTML():newHTML}</div><div id="rulTab-hist" ${tab==='hist'?'':'hidden'}>${typeof historyHTML==='function'?historyHTML():histHTML}</div><div id="rulTab-guide" ${tab==='guide'?'':'hidden'}>${typeof playGuideHTML==='function'?playGuideHTML():''}</div><div id="rulTab-mguide" ${tab==='mguide'?'':'hidden'}>${typeof mgrGuideHTML==='function'?mgrGuideHTML():''}</div><div id="rulTab-learn" ${tab==='learn'?'':'hidden'}>${typeof lessonsHTML==='function'?lessonsHTML():''}</div>`;
  return modal('Rules & strategy',body,[{label:'Close',value:'x'}],{wide:1,full:1,onOpen:()=>{const mb=$('#mBody');mb.addEventListener('click',e=>{const t=e.target.closest('[data-rul]');if(!t)return;mb.querySelectorAll('[data-rul]').forEach(b=>b.classList.toggle('on',b===t));['build','new','hist','guide','mguide','learn'].forEach(k=>{const el=$('#rulTab-'+k);if(el)el.hidden=t.dataset.rul!==k})});mb.addEventListener('click',e=>{const l=e.target.closest('[data-lesson]');if(!l)return;const c=CUR_MODAL;if(c)c.done('x');setTimeout(()=>{if(l.dataset.lesson==='manager')startManagerTutorial();else startTutorial()},120)})}});
}
$('#btnRules').onclick=()=>{if(modalBusy())return;showRules()};
/* v0.45: walking away from a live event is always a conscious choice — New event and the 🏛 menu both ask.
   From the menu you may also save the match to a slot (when it is your move) and come back to it later. */
async function abandonAsk(ctx){
  const summoned=S.players.filter(p=>p.saved&&p.alive&&!p.retired);
  const bets=(S.bets||[]).reduce((a,b)=>a+b.stake,0);
  const canSave=ctx==='menu'&&typeof matchSaveOK==='function'&&matchSaveOK();
  const v=await modal(ctx==='menu'?'Leave the arena?':'Abandon this event?',`<p>${ctx==='menu'?'An event is still on the sand. Before the main menu, decide what happens to it:':'The event on the sand has not resolved. Walking away now has consequences:'}</p><ul style="margin:6px 0 8px 18px;display:grid;gap:4px">
      ${summoned.length?`<li><b>${summoned.map(p=>esc(p.name)).join(', ')}</b> ${summoned.length>1?'were':'was'} summoned from the Ludus. Deserting the arena is death in the crowd's eyes: ${summoned.length>1?'their records':'the record'} will be <b>struck from the rolls for good</b>.</li>`:''}
      ${bets?`<li>Your open wagers — <b>${bets} coin</b> staked — are forfeit to the bookmaker.</li>`:''}
      <li>Abandoning awards no Fates; nothing reaches the Ludus, the Infamis or the records.</li>
      ${ctx==='menu'?`<li>${canSave?'<b>💾 Save &amp; leave</b> keeps the match exactly as it stands — every token, wound and coin — in a save slot you can load from <b>Load game</b>.':'<i>Saving the match is possible on your own move (action phase, nothing waiting).</i>'}</li>`:''}</ul>`,
      [{label:ctx==='menu'?'Stay in the arena':'Keep fighting',value:0,primary:1},...(canSave?[{label:'💾 Save & leave',sub:'pick a slot, then the main menu',value:2}]:[]),{label:'Abandon the event',sub:summoned.length||bets?'accept the consequences above':'walk away',value:1}]);
  if(v===2){const ok=await matchSaveDialog(true);return ok?'saved':'keep'}
  if(v!==1)return 'keep';
  for(const p2 of summoned)await markFallen(p2,{p:p2,won:false,f:0,fate:['Deserted the arena','']}).catch(()=>{});
  if(summoned.length)log(`${summoned.map(nm).join(', ')} deserted the arena: struck from the Ludus rolls.`,'bad');
  if(bets)log(`The bookmaker pockets your ${bets} coin in abandoned wagers with a smile.`,'bad');
  return 'abandon'}
function eventLive(){return !!(S&&!S.over&&S.phase!=='setup')}
$('#btnNew').onclick=async()=>{if(modalBusy())return;
  if(S&&!S.over&&S.phase!=='setup'&&S.turnNo>0){
    if(await abandonAsk('new')!=='abandon')return;
  }
  if(S&&!S.over&&typeof transitCover==='function')transitCover(7000); // v0.41: the frozen board is never shown while the sand settles
  if(S){S.over=true;for(let i=0;i<60&&S.busy;i++)await new Promise(r=>setTimeout(r,100))}
  try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){} // v0.33: opening the new-event screen jumps the post-show straight to its reset
  openSetup(true);setTimeout(()=>{if(typeof transitUncover==='function')transitUncover()},260)};
document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{SPEED=b.dataset.speed;document.querySelectorAll('[data-speed]').forEach(x=>x.classList.toggle('on',x===b));renderTurnInd()});

/* ================= v0.33-34 THE MAIN MENU =================
   The front door: the logo, the group photo, and the roads in. Fully revertible — Settings → General
   has "Skip the main menu", and the 🏛 button on the top bar reopens the menu any time. Rules and
   Settings open OVER the menu; the big modes open FULL-SCREEN and close back to the menu — unless
   they launched you into a live event, in which case the arena has you. */
const MM={raf:0,t0:0,fromMenu:false,launchedAt:0};
function menuShow(){const m=$('#mainMenu');if(!m)return;m.hidden=false;MM.fromMenu=false;try{lessonsMenuVis()}catch(e){}
  MM.t0=performance.now();MM.spl=0;MM.plan=mmPlan();if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}MM.raf=requestAnimationFrame(mmLoop); // v0.35: the photo plays ONCE per visit, then holds still
  try{if(typeof audTick==='function')audTick()}catch(e){} // Roma's theme plays at the door (Settings → Audio → Music between events)
}
function menuHide(){const m=$('#mainMenu');if(m)m.hidden=true;if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}}
/* v0.35: a mode launched from the menu brings you back to the menu only when its LAST window has closed
   and nothing else claimed the screen — no event started since, no city square open. */
function mmLaunch(fn,label){if(Date.now()-(MM.launchedAt||0)<700)return; // v0.41: a double click never launches twice
  MM.fromMenu=true;MM.launchedAt=Date.now();
  const fail=e=>{console.error(e);MM.fromMenu=false;menuShow();if(typeof mToast==='function')mToast(`⚠ ${esc(label||'That mode')} could not open: ${esc(String(e&&e.message||e))}`)};
  transitRun(()=>{menuHide();try{const r=fn();if(r&&r.catch)r.catch(fail)}catch(e){fail(e)}},`Loading ${label||''}…`)
  // watchdog: if nothing took the screen, bring the menu back instead of leaving a blank arena
  const t0=MM.launchedAt;setTimeout(()=>{if(MM.launchedAt!==t0)return;const m=$('#mainMenu');if(!m||!m.hidden)return;
    if(!$('#modal').hidden||!$('#mReturn').hidden||CUR_MODAL)return;if(typeof CITY!=='undefined'&&CITY.open)return;if(S&&!S.over&&S.phase!=='setup')return;if(Date.now()-(MM.goAt||0)<15000)return;
    MM.fromMenu=false;menuShow()},3000)}
/* v0.46: each mode owns its saves — Play now: a new event, load a Play now save, or manage those saves;
   Manager mode: continue the last career, load a career, or manage the careers */
async function playNowMenu(){if(modalBusy())return;const any=MSAVE_SLOTS.some(k=>matchSlotGet(k));
  const v=await modal('⚔️ Play now','<p class="rc-sub" style="margin:0">Set up a new event, or pick up a saved match where you left it.</p>',[{label:'⚔️ New event',sub:'choose the arena, the event and the gladiators',value:'new',primary:1},{label:'📂 Load game',sub:any?'continue a saved Play now match':'no saved matches yet',value:'load',disabled:!any},{label:'🗂 Manage saves',sub:'rename, download or delete your match saves',value:'manage'},{label:'Back',value:null}],{close:null,wide:false});
  if(v==='new'){mmLaunch(()=>openSetup(true),'Play now');return}
  if(v==='load'||v==='manage')matchSavesWindow(v)}
async function matchSavesWindow(mode){const v=await modal(mode==='load'?'📂 Load a Play now match':'🗂 Play now saves',`<div id="msWin" data-mode="${mode}">${matchSavesHTML(mode)}</div>`,[{label:'Back',value:'back'}],{wide:true,close:'back'});
  if(v==='back')playNowMenu()}
async function managerMenu(){if(modalBusy())return;let L=[];try{L=(await Store.list('mgrCareers')).filter(c=>!c.dead).sort((a,b)=>String(b.updated).localeCompare(String(a.updated)))}catch(e){}
  if(!L.length){mmLaunch(()=>openManager(),'Manager mode');return}
  const last=L[0];
  const v=await modal('💼 Manager mode','<p class="rc-sub" style="margin:0">Only Manager careers live here — Play now matches have their own saves.</p>',[{label:`▶ Continue · ${last.ludus}`,sub:`${last.name} · season ${last.season}, week ${wkOf(last.week)} · saved ${last.updated||''}`,value:'cont',primary:1},{label:'📂 Load a career',sub:`${L.length} saved career${L.length===1?'':'s'}`,value:'load'},{label:'🗂 Manage saves',sub:'download or delete careers',value:'manage'},{label:'✚ New career',sub:'found a house or take one over',value:'new'},{label:'Back',value:null}],{close:null});
  if(!v)return;
  if(v==='cont'){MGR.pendingLoad=last.id;mmLaunch(()=>openManager(),'Manager mode');return}
  MGR.view=v==='load'?'load':v==='manage'?'manage':null;MGR.world=null;mmLaunch(()=>openManager(),'Manager mode')}
function mmAfterClose(){
  if(!MM.fromMenu)return;
  if(Date.now()-(MM.launchedAt||0)<600)return; // a window closed in the launch's own wake — not the user leaving
  if(!$('#modal').hidden||CUR_MODAL)return; // another window took its place — wait for that one
  if(typeof CITY!=='undefined'&&CITY.open){transitUncover();return}
  if(S&&!S.over&&(S.startedAt||0)>=MM.launchedAt){MM.fromMenu=false;transitUncover();return} // an event began: the arena has you now
  menuShow();setTimeout(transitUncover,60)}
{const mm=$('#mainMenu');if(mm)mm.addEventListener('click',e=>{
  const b=e.target.closest('[data-mm]');if(!b)return;const a=b.dataset.mm;
  if(a==='rules'){if(!modalBusy())showRules();return}        // full screen, over the menu
  if(a==='settings'){if(!modalBusy()&&typeof openSettings==='function')openSettings();return}
  if(!$('#mReturn').hidden){$('#mReturn').click();menuHide();return} // v0.41: a minimised window comes back rather than blocking the menu
  if(modalBusy())return;
  if(a==='learn'){MM.fromMenu=false;transitRun(()=>{menuHide();if(typeof startTutorial==='function')startTutorial()},'Loading the lesson…');return}
  if(a==='learnmgr'){MM.fromMenu=false;transitRun(()=>{menuHide();if(typeof startManagerTutorial==='function')startManagerTutorial()},'Loading the Manager lesson…');return}
  if(a==='play'){playNowMenu();return}
  if(a==='manager'&&typeof openManager==='function'){managerMenu();return}
  if(a==='studio'&&typeof openStudio==='function'){mmLaunch(()=>openStudio(),'The Creator Studio');return}
  if(a==='annals'&&typeof openHall==='function'){mmLaunch(()=>openHall('infamis'),'The Annals');return}});
 const bm=$('#btnMenu');if(bm)bm.onclick=()=>menuAsk()}
/* v0.45: the 🏛 button never leaves a live event running behind the menu */
async function menuAsk(){if(modalBusy())return;
  if(eventLive()&&!S.tutorial){
    if(S.mgrCtx||S.specCtx){const v=await modal('Leave this bout?','<p>This Match Week bout is still on the sand. Manager mode needs its result before the week can move on.</p>',[{label:'Stay and watch',value:0,primary:1},{label:'⏭ Sim to the end',sub:'resolve it now — the result goes back to your career',value:1}]);
      if(v===1&&typeof simToEnd==='function')simToEnd(true);return}
    const r=await abandonAsk('menu');if(r==='keep')return;
    if(r==="abandon"){S.over=true;for(let i=0;i<8&&S.busy;i++)await new Promise(res=>setTimeout(res,100));try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}}
    if(r==='saved'){S.over=true;S.shelved=true}
  }
  transitRun(()=>menuShow(),'The main menu…')}

/* ---- the group photo: eight gladiators shuffle in for the camera; two soldiers haul the
   condemned one away, as is right and proper. Camera slightly above, like a drone over a
   family photo. Loops every ~18 seconds. ---- */
function mmLoop(){
  MM.raf=0;const m=$('#mainMenu');if(!m||m.hidden)return;
  const cv2=$('#mmCv');if(!cv2){return}
  const c2=cv2.getContext('2d');const W9=cv2.width,H9=cv2.height;
  if(!MM.plan)MM.plan=mmPlan();const t=Math.min(MM.plan.tEnd,(performance.now()-MM.t0)/1000); // scene clock — plays once, then the photo holds
  c2.clearRect(0,0,W9,H9);
  // the sand, seen from above
  const g=c2.createRadialGradient(W9/2,H9*0.78,40,W9/2,H9*0.78,W9*0.55);
  g.addColorStop(0,'rgba(196,164,116,.35)');g.addColorStop(.7,'rgba(150,120,84,.18)');g.addColorStop(1,'rgba(0,0,0,0)');
  c2.fillStyle=g;c2.beginPath();c2.ellipse(W9/2,H9*0.78,W9*0.52,H9*0.34,0,0,Math.PI*2);c2.fill();
  const cls9=(typeof BASE_CLS!=='undefined'?BASE_CLS:['soldier','hero','slave','royalty','amazonia','veteranus','venatore','damnatio']).slice(0,8);
  const di=Math.max(0,cls9.indexOf('damnatio'));
  const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
  // formation: back row of 4 (smaller — the camera is above), front row of 4; damnatio front-right
  const order=cls9.filter(k=>k!=='damnatio');order.splice(7,0,'damnatio'); // damnatio last = front-right
  const spots=[];for(let i=0;i<8;i++){const back=i<4;const k=back?i:i-4;
    spots.push({x:W9/2+(k-1.5)*(back?128:150),y:back?H9*0.62:H9*0.9,h:back?H9*0.52:H9*0.64})}
  const form=ease(t/3.2); // 0→1 shuffle-in
  const figs=order.map((k9,i)=>{const sp2=spots[i];
    const sx=i%2?W9+80+i*30:-80-i*30,sy=H9*1.05; // enter from the wings
    let x=sx+(sp2.x-sx)*form,y=sy+(sp2.y-sy)*form,h=sp2.h,rot=0,alpha=1;
    const walking=form<1;const bob=walking?Math.abs(Math.sin(performance.now()/110+i))*5:Math.sin(performance.now()/650+i*1.7)*1.5;
    // the condemned one's exit
    if(k9==='damnatio'&&t>5.2){const dr=ease((t-6.6)/3.4); // grabbed at ~6.6, dragged off by ~10
      x=sp2.x+dr*(W9-sp2.x+140);y=sp2.y+6;rot=-0.5*Math.min(1,(t-5.2)/1.2);
      if(t>5.8&&dr<1&&Math.random()<.5)MM.spl=Math.max(MM.spl||0,Math.min(x,W9*0.84)); // the streak follows the heels, to the sand's edge
      if(dr>=1)alpha=0}
    return {k9,x,y:y-bob,h,rot,alpha,i}});
  // the blood the condemned leaves behind
  if(MM.spl&&t>5.8){const x0=spots[7].x;c2.save();c2.globalAlpha=0.55;c2.fillStyle='#7a150d';
    c2.beginPath();c2.ellipse(x0,spots[7].y+4,26,9,0,0,Math.PI*2);c2.fill();
    c2.globalAlpha=0.4;c2.fillRect(x0,spots[7].y+1,Math.max(0,Math.min(MM.spl,W9)-x0),5);
    for(let i2=0;i2<6;i2++){c2.beginPath();c2.ellipse(x0+18+i2*14,spots[7].y+3+(i2%2?4:-2),5,2.4,0,0,Math.PI*2);c2.fill()}
    c2.restore()}
  // the two soldiers of the escort
  if(t>4.2){const dr=ease((t-6.6)/3.4);const dm=figs.find(f=>f.k9==='damnatio');
    const inX=ease((t-4.2)/1.6); // they march in from the right
    for(const off of [-46,52]){const sx2=W9+60-(W9+60-(dm.x+off))*inX;
      mmFig(c2,'soldier',sx2,dm.y+4,spots[7].h*0.98,0,1)}}
  // v0.38 the rest of the show: the beasts come for the others, then Commodus
  const extra=mmShow2(c2,t,figs,spots,W9,H9);
  // back row first, then front — painter's order
  for(const f of [...figs,...extra].sort((a2,b2)=>a2.y-b2.y))if(f.alpha>0){if(f.draw)f.draw();else mmFig(c2,f.k9,f.x,f.y,f.h,f.rot,f.alpha,f.npc)}
  mmOverlay(c2,t,W9,H9);
  if(t<MM.plan.tEnd)MM.raf=requestAnimationFrame(mmLoop); // frozen once the show is over, until the menu is reopened
}
function mmFig(c2,cls,x,y,h,rot,alpha,npc){
  const im=typeof tokenImg==='function'&&typeof tokenForCls==='function'?tokenImg(npc?tokenForNPC({t:cls}):tokenForCls(cls)):null;
  c2.save();c2.globalAlpha=alpha;
  c2.fillStyle='rgba(0,0,0,.3)';c2.beginPath();c2.ellipse(x,y,h*0.2,h*0.07,0,0,Math.PI*2);c2.fill();
  if(im){const w=h*100/170;c2.translate(x,y);if(rot)c2.rotate(rot);c2.drawImage(im,-w/2,-h*(157/170),w,h)}
  c2.restore();
}

/* v0.38 THE SHOW GOES ON. After the Damnatio is hauled off, the base beasts come for the rest:
   the eagle drops from above, the bear rises from behind, wolves and a snake come in from the front,
   another snake slithers through to the back row, and Tholo reaches out of the shadows. With the sand
   empty, Commodus strides in and raises his sword while the stands shower laurels and flowers at his feet.
   Now and then (about one visit in three) a gladiator comes back, and they fight in a cloud of dust. */
function mmPlan(){const R=Math.random;const sh=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const back=sh([0,1,2,3]),front=sh([4,5,6]);
  const hunts=[{k:'zora',how:'eagle',v:back[0],t0:11.0},{k:'bear',how:'bear',v:back[1],t0:12.3},{k:'wolf',how:'front',v:front[0],t0:13.6,side:-1},{k:'wolf',how:'front',v:front[1],t0:14.4,side:1},
    {k:'snake',how:'front',v:front[2],t0:15.4,side:1,low:1},{k:'lion',how:'front',v:back[2],t0:16.2,side:-1},{k:'tholo',how:'shadow',v:back[3],t0:17.4}];
  const tosses=Array.from({length:30},(_,i)=>({t0:22.4+i*0.13+R()*0.2,sx:R()<.5?-30-R()*80:1270+R()*80,sy:30+R()*120,dx:(R()-.5)*170,dy:(R()-.2)*16,kind:R()<.5?'laurel':'flower',col:['#e04a6a','#f2d04a','#f0f0e8','#b04ac8','#e8803a'][Math.floor(R()*5)],rot:R()*6}));
  const duel=R()<0.35;const land=Math.max(...tosses.map(q=>q.t0))+1.3; // v0.43: the scene ends only after the last laurel has landed
  return {hunts,tosses,duel,rival:Math.floor(R()*7),tEnd:Math.max(duel?34:27,land)}}
function mmShow2(c2,t,figs,spots,W9,H9){
  const P=MM.plan;const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);const out=[];if(t<10.8)return out;
  const byI=i=>figs.find(f=>f.i===i);
  for(const H of P.hunts){const f=byI(H.v);if(!f)continue;if(t<H.t0){continue}
    const a=ease((t-H.t0)/1.1),d=ease((t-H.t0-1.2)/1.7);const bh=f.h*(H.low?0.8:H.k==='bear'?1.4:H.k==='lion'?1.15:H.k==='tholo'?1.25:1.0);
    let bx,by,ba=1,brot=0;
    if(H.how==='eagle'){const fy0=f.y;const tx=f.x,ty=fy0-f.h*0.98;bx=f.x+300+(tx-f.x-300)*a;by=-120+(ty+120)*a;
      if(d>0){bx+=-380*d;by+=-(ty+f.h*0.1+60)*d;f.x=bx+4;f.y=by+f.h*0.98;f.rot=0.25*Math.sin(t*4)*d}
      const ex=bx,ey=by,es=f.h*0.5;out.push({x:ex,y:fy0+1,h:0,alpha:1,draw:()=>mmEagle(c2,ex,ey,es,t)});
      if(d>=1)f.alpha=0;else f.captured=1;continue}
    else if(H.how==='bear'){const tx=f.x+34,ty=f.y-18;bx=tx;by=H9*0.3+(ty-H9*0.3)*a;ba=a;
      if(d>0){by-=H9*0.34*d;f.y-=H9*0.34*d;f.x+=12*d;f.rot=-0.5*d;f.alpha=1-d;ba=1-d}}
    else if(H.how==='front'){const side=H.side||1;const tx=f.x+side*38,ty=f.y+14;const sx=f.x+side*(W9*0.5),sy=H9+90;bx=sx+(tx-sx)*a;by=sy+(ty-sy)*a;
      if(d>0){bx+=side*W9*0.55*d;by+=90*d;f.x+=side*W9*0.55*d;f.y+=90*d;f.rot=side*1.2*Math.min(1,d*2.5)}}
    else if(H.how==='shadow'){const tx=f.x-52,ty=f.y-6;bx=tx;by=ty;ba=a;
      if(d>0){f.alpha=1-d;ba=1-d;bx-=60*d;f.x-=60*d;f.rot=-0.3*d}}
    if(d>=1){f.alpha=0;continue}
    f.captured=1;
    // a smear of blood where they were taken
    if(d>0){const sp=spots[H.v];c2.save();c2.globalAlpha=0.35;c2.fillStyle='#6d130b';c2.beginPath();c2.ellipse(sp.x,sp.y+4,16,5,0,0,Math.PI*2);c2.fill();c2.restore()}
    out.push({k9:H.k,npc:1,x:bx,y:H.how==='eagle'?by+f.h*0.5:by,h:bh,rot:brot,alpha:ba,draw:()=>mmFig(c2,H.k,bx,by,bh,brot,ba,1)})}
  // Tholo's darkness
  const th=P.hunts.find(h=>h.how==='shadow');if(th&&t>th.t0-0.6&&t<th.t0+3.6){const f=spots[th.v];const k=Math.min(1,(t-th.t0+0.6)/0.8)*(t>th.t0+2.6?Math.max(0,1-(t-th.t0-2.6)):1);
    const g=c2.createRadialGradient(f.x-50,f.y-f.h*0.4,10,f.x-50,f.y-f.h*0.4,f.h*1.1);g.addColorStop(0,`rgba(5,3,8,${0.75*k})`);g.addColorStop(1,'rgba(5,3,8,0)');c2.fillStyle=g;c2.fillRect(0,0,W9,H9)}
  // Commodus
  if(t>=20.2){const cx=W9/2,cy=H9*0.86,ch=H9*0.7;const w=ease((t-20.2)/2);const x=cx,y=H9*0.5+(cy-H9*0.5)*w,h=ch*(0.7+0.3*w);
    const duelT=P.duel?t-27:-1;const dead=P.duel&&duelT>=3.2;
    if(!dead){const bob=w<1?Math.abs(Math.sin(t*9))*4:0;
      out.push({x,y:y-bob,h,alpha:1,draw:()=>{const r=ease((t-22.1)/0.5);const up=r>=0.5&&!(P.duel&&duelT>0);
        const im=tokenImg(up?{...tokenForNPC({t:'commodus'}),raise:1}:tokenForNPC({t:'commodus'}));const yb=y-bob;
        c2.save();c2.fillStyle='rgba(0,0,0,.3)';c2.beginPath();c2.ellipse(x,yb,h*0.2,h*0.07,0,0,Math.PI*2);c2.fill();if(im){const w=h*100/170;c2.drawImage(im,x-w/2,yb-h*(157/170),w,h)}c2.restore();
        if(up&&r>=1){const w=h*100/170;const tx=x+(83-50)/100*w,ty=yb-h*(157/170)+(24/170)*h;const gl=(Math.sin(t*3)+1)/2;const fade=Math.max(0,Math.min(1,(24.1-t)/0.5)); /* v0.54: the gleam appears at 22.6s and is gone 1.5s later (fading over the last 0.5s) */ if(fade<=0)return;
          c2.save();c2.globalAlpha=(0.5+0.5*gl)*fade;c2.fillStyle='#fff6c8';c2.translate(tx,ty);c2.rotate(t);c2.beginPath();for(let k=0;k<8;k++){const rr=k%2?3:12;c2.lineTo(Math.cos(k*Math.PI/4)*rr,Math.sin(k*Math.PI/4)*rr)}c2.fill();c2.restore()}}})}
    else{const k=ease((duelT-3.2)/0.6);// his corpse, and the kneeling victor
      out.push({x,y:y-1,h,alpha:1,draw:()=>{c2.save();c2.globalAlpha=0.6;c2.fillStyle='#6d130b';c2.beginPath();c2.ellipse(x+h*0.3,y+2,h*0.42,h*0.07,0,0,Math.PI*2);c2.fill();c2.restore();mmFig(c2,'commodus',x-h*0.25,y,h,Math.PI/2*0.97,1,1)}})}
    // the challenger
    if(P.duel&&duelT>0){const pool=figs.filter(f=>f.k9!=='damnatio');const rv=pool[P.rival%pool.length];const rk=rv?rv.k9:'soldier';
      const wi=ease(duelT/1.2);const gx=-120+(x-110+120)*wi,gy=y+4;
      if(!dead)out.push({x:gx,y:gy,h:h*0.93,alpha:1,draw:()=>mmFig(c2,rk,gx+(duelT>1.2&&duelT<3.2?Math.sin(t*23)*6:0),gy,h*0.93,duelT>1.2&&duelT<3.2?Math.sin(t*17)*0.12:0,1)});
      else out.push({x:x-h*0.9,y:y+2,h:h*0.8,alpha:1,draw:()=>mmFig(c2,rk,x-h*0.95,y+6,h*0.78,0.18,1)})}}
  return out}
function mmEagle(c2,x,y,s,t){const fl=Math.sin(t*14);c2.save();c2.translate(x,y);
  c2.fillStyle='#6a4520';c2.strokeStyle='#3a240f';c2.lineWidth=1;
  for(const sd of [-1,1]){c2.beginPath();c2.moveTo(sd*s*0.08,-s*0.05);c2.quadraticCurveTo(sd*s*0.5,-s*(0.35+0.3*fl),sd*s*0.95,-s*(0.1+0.45*fl));c2.lineTo(sd*s*0.7,s*0.02);c2.lineTo(sd*s*0.5,-s*0.02);c2.lineTo(sd*s*0.3,s*0.06);c2.closePath();c2.fill();c2.stroke()}
  c2.fillStyle='#5a3a1a';c2.beginPath();c2.ellipse(0,0,s*0.13,s*0.24,0,0,Math.PI*2);c2.fill();
  c2.fillStyle='#7a5128';c2.beginPath();c2.moveTo(-s*0.1,s*0.18);c2.lineTo(s*0.1,s*0.18);c2.lineTo(0,s*0.36);c2.closePath();c2.fill();
  c2.fillStyle='#f3efe4';c2.beginPath();c2.arc(0,-s*0.26,s*0.1,0,Math.PI*2);c2.fill();
  c2.fillStyle='#e0b020';c2.beginPath();c2.moveTo(s*0.06,-s*0.27);c2.lineTo(s*0.17,-s*0.23);c2.lineTo(s*0.06,-s*0.2);c2.closePath();c2.fill();
  c2.fillStyle='#d9a826';for(const sd of [-1,1]){c2.fillRect(sd*s*0.07-1.5,s*0.18,3,s*0.12)}
  c2.restore()}
function mmOverlay(c2,t,W9,H9){const P=MM.plan;if(!P||t<22)return;const cx=W9/2,cy=H9*0.86;const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
  // laurels and flowers from the stands, arcing down to the emperor's feet
  for(const q of P.tosses){if(t<q.t0)continue;const k=Math.min(1,(t-q.t0)/1.1);const ex=cx+q.dx,ey=cy+q.dy;
    const x=q.sx+(ex-q.sx)*k,y=q.sy+(ey-q.sy)*k-Math.sin(k*Math.PI)*90;c2.save();c2.translate(x,y);c2.rotate(q.rot+(k<1?t*5:0));
    if(q.kind==='laurel'){c2.fillStyle='#4f8a3a';for(let i=0;i<4;i++){c2.beginPath();c2.ellipse(i*5-8,(i%2?3:-3),5,2.2,(i%2?0.5:-0.5),0,Math.PI*2);c2.fill()}}
    else{c2.fillStyle=q.col;for(let i=0;i<5;i++){c2.beginPath();c2.ellipse(Math.cos(i*1.256)*3.4,Math.sin(i*1.256)*3.4,2.8,2.8,0,0,Math.PI*2);c2.fill()}c2.fillStyle='#f5d65a';c2.beginPath();c2.arc(0,0,1.8,0,Math.PI*2);c2.fill()}
    c2.restore()}
  // the dust cloud of the duel
  if(P.duel){const dt=t-27;if(dt>1.1&&dt<4){const k=dt<1.6?ease((dt-1.1)/0.5):dt>3.3?1-ease((dt-3.3)/0.7):1;const bx=cx-60,by=cy-H9*0.28;
    for(let i=0;i<26;i++){const a=i*2.39+t*(i%2?1.3:-1.1);const r=40+((i*37)%70)+Math.sin(t*4+i)*8;c2.save();c2.globalAlpha=0.55*k;c2.fillStyle=i%3?'#b89a6c':'#9c7f55';c2.beginPath();c2.arc(bx+Math.cos(a)*r*1.3,by+Math.sin(a)*r*0.6+40,26+(i%4)*8,0,Math.PI*2);c2.fill();c2.restore()}
    if(dt>1.3&&dt<3.3&&Math.sin(t*11)>0.6){c2.save();c2.fillStyle='#fff3c0';c2.globalAlpha=0.8;c2.beginPath();c2.arc(bx+Math.sin(t*7)*50,by+Math.cos(t*5)*20,4,0,Math.PI*2);c2.fill();c2.restore()}}}}

// board preview behind the setup dialog (or behind the main menu)
newState({ev:'democritus',loc:6,seats:CFG.seats.slice(0,4),opts:CFG.opts});
render();
log('Choose an arena location, an event and your gladiators to begin.');
if(SETTINGS.skipMenu||navigator.webdriver)openSetup(true);else menuShow(); // automated test runs boot the old way
