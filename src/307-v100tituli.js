/* =====================================================================
   307-v100tituli · v1.0 THE TITULI — achievements unified across every mode (his pick, backlog "v1.0 EXTRAS" 2 + the RULE line)
   =====================================================================
   ONE CATALOGUE `TITULI100` merges the Manager trophy case (22 TROPHY_LIB), Immortalis (157 mgrImmortalis88 / 156 onlImmortalis88), the
   online Domus trophies (111 trophyName keys: first:<ev>, rank:<k>, slew:tholo|commodus, vday, surv10, surv25, thumb) + the season Tituli
   (111 SEASON100.TITULI s100v/s100p/s100x) and the Annals feats (10 ACHIEVEMENTS, Play Now). Entry = {id, n (Latin-flavoured title), sub
   (plain words), how, modes:[manager|playnow|online], tags (+ 'any' when it is earned in 2+ modes), art(px)}. The same honour in two modes is
   ONE titulus (Tholo, Commodus, Immortalis): earned in either.
   RULE (his): NO basic emoji as art. Art is composed from in-house pieces only — trophySVG (the silverware), the token rounds (rtok.webp cells
   drawn as an svg <image>), the Summa Rudis medallions (sr_*.webp), the rank medals (302 medal100), the Fate card art (fates.jpg cell, the
   Thumb of Flavius), insignia100 scutum (bouts / events survived), the class token rounds (ptok81 / ptokf81), the map, Flavius's painted face,
   generated laurel crowns (tit100Laurel: Victor of the Day, Immortalis, the season's three). Every art root is an <svg> or <img>.
   EARNED / PROGRESS: read-only adapters over what is stored already — Manager: W_() trophies (290 tit100Mgr gives the lib's progress) and the
   house's Immortalis stamps (g.imm88); Play Now: Store hall/ach (achLoad), hall/progress (locs, killed), hall/road, hallTrophies; Online: the
   Domus reply ONL82.dg (trophies, glads). Nothing is rewritten on load, no new Store collection.
   WHERE: (1) 290's Manager Trophies tab — the view is fed from the catalogue (filters Manager · Play Now · Online; Manager keeps the glass case,
   Play Now adds your own events' trophies); (2) the Annals → Hall of Flavius: the achievements grid → Tituli plaques (Play Now feats);
   (3) the online Domus trophy shelf (137 onl83Trophies: TROPHY_IC83's emoji gone — each key mapped to its plaque art) and the house card's season
   tituli (293's 🏅 → a laurel). (4) "Titulus earned": a small plaque reveal when one is earned (achGrant, hallTrophy, earnTrophy, imm88Stamp, new
   online trophy keys seen on an Online redraw); the old 🏆 toast for that same honour is swallowed. Reduce motion / Animations Off = static.
   Kill switch localStorage flavius_tituli100off=1 → today's views. Test tv100ti.
   ===================================================================== */
const TIT100={off:(()=>{try{return localStorage.getItem('flavius_tituli100off')==='1'}catch(e){return false}})(),pnD:null,pnBusy:false,q:[],cur:null,sw:[],onlSeen:null,uid:0};
const tit100On=()=>!TIT100.off;
const tit100A=f=>typeof assetURL==='function'?assetURL(f):'assets/'+f;
const tit100E=s=>typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------------- ART (svg / img only) ---------------- */
/* one cell of a sprite sheet as an svg <image> (crisp, no CSS background) */
function tit100Sheet(file,cols,rows,cw,ch,i,px,round){const c=i%cols,r=Math.floor(i/cols);const h=Math.round(px*ch/cw);const id='t100c'+(++TIT100.uid);
  return `<svg class="t100a" viewBox="0 0 ${cw} ${ch}" width="${px}" height="${h}" role="img" aria-hidden="true">${round?`<defs><clipPath id="${id}"><circle cx="${cw/2}" cy="${ch/2}" r="${cw/2-1}"/></clipPath></defs>`:''}<image href="${tit100A(file)}" x="${-c*cw}" y="${-r*ch}" width="${cols*cw}" height="${rows*ch}"${round?` clip-path="url(#${id})"`:''} preserveAspectRatio="none"/></svg>`}
const tit100Tok=(k,px)=>{const i=typeof RTOK_NAMES!=='undefined'?RTOK_NAMES.indexOf(k):-1;return i<0?tit100Laurel({},px):tit100Sheet('rtok.webp',typeof RTOK_COLS!=='undefined'?RTOK_COLS:8,typeof RTOK_ROWS!=='undefined'?RTOK_ROWS:5,100,100,i,px)};
const tit100Card=(ref,px)=>{try{const r=cardRef(ref);if(!r)return tit100Laurel({},px);const [a,b]=String(r.sh.ar||'240/346').split('/').map(Number);return tit100Sheet(r.sh.f,r.sh.cols,r.sh.rows,a,b,r.i,Math.round(px*.72))}catch(e){return tit100Laurel({},px)}};
const tit100Img=(file,px,cls)=>`<img class="t100a ${cls||''}" src="${tit100A(file)}" alt="" width="${px}" height="${px}" loading="lazy" decoding="async">`;
/* a laurel crown (generated svg): metal [light, dark], ribbon colour, an optional numeral */
function tit100Laurel(o,px){o=o||{};const m=o.m||['#ffe39a','#a8781e'];const id='t100l'+(++TIT100.uid);px=px||90;const L=[];
  for(let i=0;i<9;i++){const t=.35+i*.27;for(const sx of [-1,1]){const x=50+sx*34*Math.sin(t),y=48+30*Math.cos(t);const ang=Math.atan2(-30*Math.sin(t),sx*34*Math.cos(t))*57.3;
    L.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8.5" ry="3.6" transform="rotate(${ang.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#${id})" stroke="${m[1]}" stroke-width=".7"/>`)}}
  const rib=o.rib?`<path d="M42 80 L36 96 L42 92 L46 98 L50 82 L54 98 L58 92 L64 96 L58 80 Z" fill="${o.rib}" stroke="#2a1606" stroke-width=".8"/>`:'';
  return `<svg class="t100a t100lau" viewBox="0 0 100 100" width="${px}" height="${px}" role="img" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${m[0]}"/><stop offset="1" stop-color="${m[1]}"/></linearGradient></defs>${rib}${L.join('')}${o.gem?`<circle cx="50" cy="21" r="5" fill="${o.gem}" stroke="${m[1]}"/>`:''}${o.txt?`<text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="${m[1]}">${tit100E(o.txt)}</text>`:''}</svg>`}
/* a scutum from the insignia painter (system designs), else a plain painted shield */
function tit100Scutum(key,px){try{if(typeof insignia100==='function'&&typeof ins100Sys==='function'){const S=ins100Sys();const D=(S[key]||S.empire||{}).d;const u=D&&insignia100(D,'scutum',px);if(u)return `<img class="t100a" src="${u}" alt="" width="${Math.round(px*.78)}" height="${px}">`}}catch(e){}
  return `<svg class="t100a" viewBox="0 0 80 100" width="${Math.round(px*.8)}" height="${px}" aria-hidden="true"><rect x="8" y="6" width="64" height="88" rx="10" fill="#8a2a1c" stroke="#d6ab4c" stroke-width="4"/><circle cx="40" cy="50" r="10" fill="#d6ab4c"/></svg>`}
/* eight class token rounds in a ring (figure side when fig) */
function tit100Ring(fig,px){const C=typeof BASE_CLS!=='undefined'?BASE_CLS:['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'];
  const im=C.map((k,i)=>{const a=i/C.length*Math.PI*2-Math.PI/2;const x=50+33*Math.cos(a)-12,y=50+33*Math.sin(a)-12;return `<image href="${tit100A((fig?'ptokf81_':'ptok81_')+k+'.webp')}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="24" height="24"/>`}).join('');
  return `<svg class="t100a" viewBox="0 0 100 100" width="${px}" height="${px}" role="img" aria-hidden="true"><circle cx="50" cy="50" r="18" fill="#2a1a0c" stroke="#d6ab4c" stroke-width="1.5"/><text x="50" y="57" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="700" fill="#e8c66a">VIII</text>${im}</svg>`}
const tit100Map=px=>`<svg class="t100a" viewBox="0 0 100 100" width="${px}" height="${px}" role="img" aria-hidden="true"><defs><clipPath id="t100m${++TIT100.uid}"><circle cx="50" cy="50" r="46"/></clipPath></defs><image href="${tit100A('map.jpg')}" x="-70" y="-10" width="260" height="146" preserveAspectRatio="none" clip-path="url(#t100m${TIT100.uid})"/><circle cx="50" cy="50" r="46" fill="none" stroke="#d6ab4c" stroke-width="3"/></svg>`;
const tit100Medal=(k,px)=>{try{if(typeof medal100==='function')return medal100(k,px)}catch(e){}return tit100Laurel({},px)};
const tit100Sr=(k,px)=>tit100Img('sr_'+k+'.webp',px,'t100sr');
const TIT100_LAU={vday:{m:['#f3e09a','#5f8a3a'],rib:'#3f7a3a'},imm:{m:['#fff0b8','#b0841e'],rib:'#5b2a86',gem:'#7a3fb0'},s100v:{m:['#ffe39a','#a8781e'],rib:'#9b2a1c',txt:'I'},s100p:{m:['#eef2f6','#7a848e'],rib:'#2a4a7a',txt:'III'},s100x:{m:['#e6b07a','#7a4a20'],rib:'#4a3a2a',txt:'X'}};

/* ---------------- THE CATALOGUE ---------------- */
/* Latin titles are names (never translated); `sub` / `how` are the plain words */
const TIT100_ACH={ /* Annals feat key → [Latin title, art] */
  tutor:['Tiro Probatus',px=>tit100Medal('tiro',px)], /* i18n:skip */
  first:['Prima Palma',px=>tit100Sr('democritus',px)], /* i18n:skip */
  fifty:['Amor Populi',px=>tit100Tok('cf2',px)], /* i18n:skip */
  tholo:['Gigantis Victor',px=>tit100Tok('tholo',px)], /* i18n:skip */
  commodus:['Tyrannicida',px=>tit100Tok('commodus',px)], /* i18n:skip */
  tamer:['Domitor Ferarum',px=>tit100Tok('leo',px)], /* i18n:skip */
  classes:['Mors Octo Colorum',px=>tit100Ring(false,px)], /* i18n:skip */
  eightwins:['Magister Scholarum',px=>tit100Ring(true,px)], /* i18n:skip */
  twelve:['Iter Duodecim',px=>tit100Map(px)], /* i18n:skip */
  freed:['Rudis Data',px=>typeof trophySVG==='function'?trophySVG({shape:'rudis',metal:'bronze',base:'wood',ins:'RUDIS',name:'Rudis'},Math.round(px*.75)):tit100Laurel({},px)], /* i18n:skip */
  veteran:['Harena in Soleis',px=>tit100Scutum('city:capua',px)], /* i18n:skip */
  road3:['Peregrinus Viae',px=>tit100Img('flavmood_pleased.webp',px)], /* i18n:skip */
  bracket:['Rex Certaminis',px=>typeof trophySVG==='function'?trophySVG({shape:'eagle',metal:'gold',base:'obsidian',topper:'crown',gem:'#c0433a',ins:'XVI',name:'Rex'},Math.round(px*.75)):tit100Laurel({},px)], /* i18n:skip */
  longshot:['Fortuna Audax',px=>tit100Img('coin.webp',px)], /* i18n:skip */
  road12:['Via Flavia',px=>{try{const S=ins100Sys();const u=insignia100(S.flavius.d,'flammula',px);if(u)return `<img class="t100a" src="${u}" alt="" width="${Math.round(px*.62)}" height="${px}">`}catch(e){}return tit100Laurel(TIT100_LAU.imm,px)}]}; /* i18n:skip */
const TIT100_EVN={democritus:'Democritus',egidious:'Egidious',cassian:'Cassian',familia:'Familia'}; /* i18n:skip */
function tit100Build(){const T=[];const add=e=>{e.tags=[...e.modes];if(e.modes.length>1)e.tags.push('any');T.push(e)};
  /* the silverware: won in a Manager career, or attached to a Play Now tournament / custom event (the Annals' trophy case) */
  for(const d of (typeof TROPHY_LIB!=='undefined'?TROPHY_LIB:[]))add({id:d.id,n:d.name,sub:d.desc,how:d.desc,modes:['manager','playnow'],kind:'trophy',cat:d.cat,art:px=>trophySVG(d,px)});
  /* the Annals feats; Tholo and Commodus are one titulus with the online kills */
  for(const a of (typeof ACHIEVEMENTS!=='undefined'?ACHIEVEMENTS:[])){const X=TIT100_ACH[a.k]||[a.n,px=>tit100Laurel({},px)];const both=a.k==='tholo'||a.k==='commodus';
    add({id:'pn:'+a.k,ach:a.k,n:X[0],sub:a.d,how:a.d,old:a.n,modes:both?['playnow','online']:['playnow'],onl:both?'slew:'+a.k:null,kind:'feat',art:X[1]})}
  add({id:'immortalis',n:'Immortalis',sub:_T('A legend of the sand'),how:_T('Manager: rating 82+, 15 wins and a title. Online: Invictus with 25 Ranked bouts survived.'),modes:['manager','online'],kind:'imm',art:px=>tit100Laurel(TIT100_LAU.imm,px)});
  /* online (the server awards them; these are its keys) */
  for(const ev of Object.keys(TIT100_EVN))add({id:'o:first:'+ev,onl:'first:'+ev,n:_T('Palma ')+TIT100_EVN[ev],sub:_T`First Ranked win · ${TIT100_EVN[ev]}`,how:_T('Win a Ranked match of this event and live.'),modes:['online'],kind:'onl',
    art:px=>ev==='familia'?tit100Card('e:familia',px):tit100Sr(ev,px)});
  const R=(typeof ONLC!=='undefined'&&ONLC.RANKS)||[];for(const r of R.slice(1))add({id:'o:rank:'+r.k,onl:'rank:'+r.k,n:r.n,sub:_T`${r.n} reached`,how:_T`Reach ${r.glory} Glory with one gladiator.`,modes:['online'],kind:'onl',rank:r,art:px=>tit100Medal(r.k,px)});
  add({id:'o:vday',onl:'vday',n:'Victor Diei',sub:_T('Victor of the Day'),how:_T('The most Crowd Favor in one match of the online day.'),modes:['online'],kind:'onl',art:px=>tit100Laurel(TIT100_LAU.vday,px)});
  add({id:'o:surv10',onl:'surv10',n:'Decem Pugnae',sub:_T('10 Ranked bouts survived'),how:_T('One gladiator walks away from 10 Ranked bouts.'),modes:['online'],kind:'onl',need:10,art:px=>tit100Scutum('empire',px)});
  add({id:'o:surv25',onl:'surv25',n:'Viginti Quinque',sub:_T('25 Ranked bouts survived'),how:_T('One gladiator walks away from 25 Ranked bouts.'),modes:['online'],kind:'onl',need:25,art:px=>tit100Scutum('flavius',px)});
  add({id:'o:thumb',onl:'thumb',n:'Pollex Flavii',sub:_T('Survived the Thumb of Flavius'),how:_T('End a Ranked match on 17–19 Crowd Favor and be spared.'),modes:['online'],kind:'onl',art:px=>tit100Card('f:9',px)});
  for(const s of ((typeof ONLC!=='undefined'&&ONLC.SEASON100&&ONLC.SEASON100.TITULI)||[]))add({id:'o:'+s.k,onl:s.k,n:s.n,sub:_T(s.n),how:_T`Finish an online season in the top ${s.upto} by Glory gained.`,modes:['online'],kind:'season',art:px=>tit100Laurel(TIT100_LAU[s.k]||{},px)});
  return T}
let TITULI100=null;
const tit100Cat=()=>TITULI100||(TITULI100=tit100Build());
const tit100ById=id=>tit100Cat().find(e=>e.id===id)||null;
/* an online trophy key → its titulus */
function tit100ForOnl(k){k=String(k||'');return tit100Cat().find(e=>e.onl===k)||null}

/* ---------------- EARNED / PROGRESS (read-only adapters) ---------------- */
function tit100MgrD(){try{const w=typeof W_==='function'?W_():null;const pm=w&&typeof me==='function'?me():null;if(!w||!pm)return null;
  let lib={};try{if(typeof tit100Mgr==='function')for(const x of tit100Mgr())lib[x.id]=x}catch(e){}return {w,pm,lib}}catch(e){return null}}
function tit100PnLoad(){if(TIT100.pnD||TIT100.pnBusy)return TIT100.pnD;TIT100.pnBusy=true;
  const g=(c,k)=>Promise.resolve(Store.getDoc(c,k)).catch(()=>null);
  Promise.all([typeof achLoad==='function'?achLoad().catch(()=>null):null,g('hall','progress'),g('hall','road'),Promise.resolve(Store.list('hallTrophies')).catch(()=>[])]).then(([A,hall,R,tro])=>{
    TIT100.pnD={A:A||{got:{},events:0,classWins:[]},hall:hall||{locs:[],killed:[]},R:R||null,tro:tro||[]};TIT100.pnBusy=false;
    try{if(typeof MGR!=='undefined'&&MGR.tab==='trophy'&&typeof WD100!=='undefined'&&WD100.tf==='pn'&&typeof MGR_REDRAW==='function')MGR_REDRAW()}catch(e){}}).catch(()=>{TIT100.pnBusy=false});return null}
async function tit100PnLoadNow(){TIT100.pnD=null;TIT100.pnBusy=false;tit100PnLoad();for(let i=0;i<40&&!TIT100.pnD;i++)await new Promise(r=>setTimeout(r,25));return TIT100.pnD}
function tit100OnlD(){try{const dg=typeof ONL82!=='undefined'&&ONL82.dg;if(!dg)return null;const got={};for(const t of dg.trophies||[])if(t&&t.k)got[t.k]=t;return {dg,got,glads:dg.glads||[]}}catch(e){return null}}
/* the state of one entry in one mode: {won (text|''), prog [have, need]|null, hint} */
function tit100State(e,mode,D){const none={won:'',prog:null,hint:''};try{
  if(mode==='manager'){const M=D.mgr;if(!M)return {...none,hint:_T('open a Manager career')};
    if(e.kind==='trophy'){const x=M.lib[e.id];return x?{won:x.won,prog:x.prog,hint:x.hint}:none}
    if(e.kind==='imm'){const mine=(M.w.glads||[]).filter(g=>g&&g.contract&&g.contract.mgr===M.pm.id);
      const own=mine.filter(g=>g.imm88);if(own.length){const g=own[0];return {won:`${g.name} · ${_T('Season')} ${g.imm88.season||''}`,prog:null,hint:''}}
      const best=mine.reduce((m,g)=>Math.max(m,(g.rec&&g.rec.w)||0),0);return {won:'',prog:[best,15],hint:''}}
    return none}
  if(mode==='playnow'){const P=D.pn;if(!P)return {...none,hint:_T('Reading the Hall…')};
    if(e.kind==='trophy'){const h=P.tro.filter(t=>t.tid===e.id);return h.length?{won:`${h[0].who||''}${h.length>1?' · ×'+h.length:''}`,prog:null,hint:''}:{...none,hint:_T('win it in Play Now')}}
    if(e.kind==='feat'){const d=(P.A.got||{})[e.ach];if(d)return {won:_T`earned ${d}`,prog:null,hint:''};const H=P.hall;
      const pr={veteran:[P.A.events|0,25],eightwins:[(P.A.classWins||[]).length,8],classes:[(H.killed||[]).length,8],twelve:[(H.locs||[]).length,12],road3:[P.R&&!P.R.over?P.R.step|0:0,3],road12:[P.R&&!P.R.over?P.R.step|0:0,12]}[e.ach];
      return {won:'',prog:pr||null,hint:pr?'':_T('not yet earned')}}
    return none}
  if(mode==='online'){const O=D.onl;if(!O)return {...none,hint:_T('open Online to see your Domus')};
    if(e.kind==='imm'){const g=O.glads.find(c=>typeof onlImmortalis88==='function'&&onlImmortalis88(c));if(g)return {won:g.name||'',prog:null,hint:''};const best=O.glads.reduce((m,c)=>Math.max(m,c.survived|0),0);return {won:'',prog:[best,25],hint:''}}
    if(e.kind==='season')return {...none,hint:_T('shown on your house card')};
    const t=O.got[e.onl];if(t)return {won:`${t.glad||''}${(t.x|0)>1?' · ×'+t.x:''}`,prog:null,hint:''};
    if(e.rank){const g=O.glads.reduce((m,c)=>Math.max(m,typeof ONLC!=='undefined'&&ONLC.gloryOf?ONLC.gloryOf(c):0),0);return {won:'',prog:[Math.min(Math.round(g),e.rank.glory),e.rank.glory],hint:''}}
    if(e.need){const best=O.glads.reduce((m,c)=>Math.max(m,c.survived|0),0);return {won:'',prog:[best,e.need],hint:''}}
    return {...none,hint:_T('not yet')}}}catch(err){console.error(err)}return none}
/* the plaque of one entry (290's tituli100Plaque look) */
function tit100Plaque(e,st,px){const o={id:e.kind==='trophy'?e.id:e.id,art:e.art(px||100),name:e.n,sub:e.sub,won:st.won,prog:st.prog,hint:st.hint,tip:`${e.old?e.old+' — ':''}${e.how||''}`};
  const h=typeof tituli100Plaque==='function'?tituli100Plaque(o):`<div class="wd100tp${o.won?'':' lock'}"><div class="art">${o.art}</div><b>${tit100E(o.name)}</b><span class="sb">${tit100E(o.sub)}</span></div>`;
  return h.replace('class="wd100tp',`data-t100="${tit100E(e.id)}" class="t100p wd100tp`)} /* i18n:skip */
function tit100List(mode,D,filter){return tit100Cat().filter(e=>e.modes.includes(mode)&&(!filter||filter(e))).map(e=>({e,st:tit100State(e,mode,D)}))}

/* ---------------- (4) "Titulus earned" ---------------- */
function tit100Calm(){try{return (typeof reduceMotion==='function'&&reduceMotion())||(typeof animOn==='function'&&!animOn())}catch(e){return false}}
function tit100Reveal(e,who){if(!e||TIT100.off)return;try{if(typeof HEADLESS!=='undefined'&&HEADLESS)return;if(typeof S!=='undefined'&&S&&S.sim)return}catch(x){}
  if(TIT100.q.length>=3)TIT100.q.shift();TIT100.q.push({e,who:who||''});if(!TIT100.cur)tit100Next()}
function tit100Next(){const it=TIT100.q.shift();TIT100.cur=it||null;const old=document.getElementById('tit100rv');if(old)old.remove();if(!it)return;
  const el=document.createElement('div');el.id='tit100rv';el.className='tit100rv'+(tit100Calm()?' rm':'');el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  el.innerHTML=`<div class="rvh">${_T('Titulus earned')}</div>${tit100Plaque(it.e,{won:it.who||_T('earned'),prog:null,hint:''},90)}`;
  el.addEventListener('click',()=>{clearTimeout(TIT100.tm);tit100Next()});document.body.appendChild(el);
  try{if(typeof sfx==='function')sfx('fanfare')}catch(x){}TIT100.tm=setTimeout(tit100Next,3800)}
/* the old 🏆 toast for an honour that gets the reveal is dropped (same name, within 4 s) */
function tit100Hush(name){if(name)TIT100.sw.push({n:String(name),until:Date.now()+4000})}

/* ---------------- the views ---------------- */
/* (1) 290's Trophies tab, fed from the catalogue */
function tit100WorldView(old){const tf=WD100.tf;let body='',count='';const D={};const pl=x=>tit100Plaque(x.e,x.st);const lit=L=>L.filter(x=>x.st.won).length;
  if(tf==='mgr'){D.mgr=tit100MgrD();const T=tit100List('manager',D);const main=T.filter(x=>x.e.cat!=='fun'),fun=T.filter(x=>x.e.cat==='fun');
    count=_T`${lit(T)} of ${T.length} earned · locked ones show how close you are`;
    body=plq100(_T('The Flavian awards & invitationals'),_T`season ${W_().season}`)+`<div class="wd100tit">${main.map(pl).join('')}</div>`+plq100(_T('For the laughs'),'')+`<div class="wd100tit">${fun.map(pl).join('')}</div>`+(old?`<div class="wd100case">${plq100(_T('The glass case'),_T('arrange what stands on the shelves'))}${old}</div>`:'')}
  else if(tf==='pn'){D.pn=tit100PnLoad();if(!D.pn)body=`<p class="wd100empty">${_T('Reading the Hall…')}</p>`;else{const T=tit100List('playnow',D);const feats=T.filter(x=>x.e.kind!=='trophy'),tro=T.filter(x=>x.e.kind==='trophy');
      const lib=new Set(tro.map(x=>x.e.id));const by={};for(const t of D.pn.tro){const k=t.tid||'n:'+t.name;if(lib.has(k))continue;(by[k]=by[k]||[]).push(t)}
      const cust=Object.entries(by).map(([k,h])=>tituli100Plaque({id:'pn:'+k,art:h[0].spec&&typeof trophySVG==='function'?trophySVG(h[0].spec,100):tit100Laurel({},100),name:h[0].name||'',sub:_T('your own event'),won:`${h[0].who||''}${h.length>1?' · ×'+h.length:''}`}));
      count=_T`${lit(T)+cust.length} of ${T.length+cust.length} earned in Play Now`;
      body=plq100(_T('Feats of the Annals'),_T('Play Now'))+`<div class="wd100tit">${feats.map(pl).join('')}</div>`+plq100(_T('Silverware won outside a career'),_T('tournaments and your own events'))+`<div class="wd100tit">${tro.map(pl).join('')}${cust.join('')}</div>`}}
  else{D.onl=tit100OnlD();const T=tit100List('online',D);count=_T`${lit(T)} of ${T.length} earned`;body=plq100(_T('Online honours'),_T('awarded by the server to your Domus'))+`<div class="wd100tit">${T.map(pl).join('')}</div>`}
  return `<div class="wd100tools">${seg100('data-wd100tf',tf,[['mgr',_T('Manager')],['pn',_T('Play Now')],['onl',_T('Online')]])}<span class="sp"></span><small>${count}</small></div>${body}`}
/* a balanced <div …>…</div> starting at index i → [i, end) */
function tit100Span(h,i){const re=/<div\b|<\/div>/g;re.lastIndex=i;let d=0,m;while((m=re.exec(h))){if(m[0]==='</div>'){d--;if(d===0)return re.lastIndex}else d++}return -1}
/* (2) the Annals Hall tab: the achievements grid → Tituli plaques (the feats of Play Now) */
async function tit100AnnalsHTML(h){const i=h.indexOf('<div class="achgrid">');if(i<0)return h;const j=tit100Span(h,i);if(j<0)return h;
  const P=await tit100PnLoadNow();const T=tit100List('playnow',{pn:P},e=>e.kind==='feat');
  const hi=h.lastIndexOf('<h4>',i);const head=`<h4 class="t100h">${_T('Tituli')} <span class="rc-sub">${_T`${T.filter(x=>x.st.won).length} of ${T.length} · the feats of Play Now`}</span></h4>`;
  const grid=`<div class="wd100tit t100ann">${T.map(x=>tit100Plaque(x.e,x.st)).join('')}</div>`;
  return (hi>=0&&hi<i&&h.slice(hi,i).indexOf('</h4>')>=0?h.slice(0,hi)+head:h.slice(0,i))+grid+h.slice(j)}
/* (3) the online Domus trophy shelf: plaque art instead of emoji */
function tit100OnlShelf(list,empty){const T=(list||[]).slice().sort((a,b)=>(b.at||0)-(a.at||0));const nm=t=>t.n||(typeof ONLC!=='undefined'?ONLC.trophyName(t.k):t.k);
  const art=t=>{const e=tit100ForOnl(t.k);return e?e.art(48):tit100Laurel({},48)};
  return `<div class="tr83 t100sh"><div class="tr83-h">${_T`Tituli <small class="rc-sub">${T.length}</small>`}</div>${T.length?`<div class="tr83-shelf">${T.map(t=>`<div class="tr83-t" data-t100k="${tit100E(t.k)}" title="${tit100E(_T(nm(t)))}${t.glad?' · '+tit100E(t.glad):''}"><span class="tr83-ic t100ic">${art(t)}${(t.x|0)>1?`<i>×${t.x}</i>`:''}</span><b>${tit100E(_T(nm(t)))}</b><small>${tit100E(typeof date83==='function'?date83(t.at):'')}${t.glad?' · '+tit100E(t.glad):''}</small></div>`).join('')}</div>`:`<p class="rc-sub tr83-none">${empty||_T('No Tituli yet — first Ranked wins, ranks reached, Commodus or Tholo slain.')}</p>`}</div>`}
/* new online trophy keys since the Domus was first read this session → the reveal */
function tit100OnlCheck(){const O=tit100OnlD();if(!O)return;const keys=Object.keys(O.got);const imm=O.glads.some(c=>typeof onlImmortalis88==='function'&&onlImmortalis88(c));
  if(!TIT100.onlSeen){TIT100.onlSeen={k:new Set(keys),imm};return}
  for(const k of keys)if(!TIT100.onlSeen.k.has(k)){TIT100.onlSeen.k.add(k);const e=tit100ForOnl(k);if(e)tit100Reveal(e,O.got[k].glad||'')}
  if(imm&&!TIT100.onlSeen.imm){TIT100.onlSeen.imm=true;tit100Reveal(tit100ById('immortalis'),'')}}

/* ---------------- wiring (all behind the kill switch) ---------------- */
if(tit100On()){
  if(typeof wd100TrophyView==='function'){const base=wd100TrophyView;wd100TrophyView=function(old){try{return tit100WorldView(old)}catch(e){console.error(e);return base.apply(this,arguments)}}}
  if(typeof hallHTML==='function'){const base=hallHTML;hallHTML=async function(tab){const h=await base.apply(this,arguments);if(tab!=='hall'||typeof h!=='string')return h;try{return await tit100AnnalsHTML(h)}catch(e){console.error(e);return h}}}
  if(typeof onl83Trophies==='function'){const base=onl83Trophies;onl83Trophies=function(list,empty){try{return tit100OnlShelf(list,empty)}catch(e){console.error(e);return base.apply(this,arguments)}}}
  if(typeof hc98HTML==='function'){const base=hc98HTML;hc98HTML=function(r){const h=base.apply(this,arguments);try{if(!r||!(r.tit100||[]).length||typeof h!=='string')return h;
    return h.replace(/(<span class="tit100"[^>]*>)🏅 /g,(m,a)=>a.replace('class="tit100"','class="tit100 t100s"')+tit100Laurel(TIT100_LAU.s100v,18)+' ')}catch(e){return h}}}
  if(typeof onlRedraw==='function'){const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);try{tit100OnlCheck()}catch(e){}return r}}
  /* the reveal hooks */
  if(typeof mToast==='function'){const base=mToast;mToast=function(m){try{if(typeof m==='string'&&m.indexOf('🏆')>=0){const now=Date.now();TIT100.sw=TIT100.sw.filter(x=>x.until>now);const t=m.replace(/<[^>]+>/g,'');if(TIT100.sw.some(x=>t.indexOf(x.n)>=0))return}}catch(e){}return base.apply(this,arguments)}}
  if(typeof achGrant==='function'){const base=achGrant;achGrant=async function(ach,key){const was=!!(ach&&ach.got&&ach.got[key]);const a=typeof ACHIEVEMENTS!=='undefined'&&ACHIEVEMENTS.find(x=>x.k===key);if(!was&&a)tit100Hush(a.n);
    const r=await base.apply(this,arguments);try{if(r){TIT100.pnD=null;const e=tit100ById('pn:'+key);if(e)tit100Reveal(e,'')}}catch(x){}return r}}
  if(typeof hallTrophy==='function'){const base=hallTrophy;hallTrophy=async function(tid,opts){const d=typeof trophyDef==='function'&&trophyDef(tid);if(d)tit100Hush(d.name);const r=await base.apply(this,arguments);
    try{TIT100.pnD=null;if(d)tit100Reveal(tit100ById(tid)||{id:'pn:'+tid,n:d.name,sub:_T('your own event'),how:d.desc||'',art:px=>trophySVG(d,px)},(opts&&opts.who)||'')}catch(x){}return r}}
  if(typeof earnTrophy==='function'){const base=earnTrophy;earnTrophy=function(world,tid,opts){const r=base.apply(this,arguments);try{if(r&&typeof W_==='function'&&world===W_()&&!world.tutorial){const d=trophyDef(tid);
    tit100Reveal(tit100ById(tid)||{id:tid,n:d?d.name:tid,sub:d?d.desc:'',how:'',art:px=>trophySVG(d||{},px)},(opts&&opts.who)||'')}}catch(x){}return r}}
  if(typeof imm88Stamp==='function'){const base=imm88Stamp;imm88Stamp=function(g){const had=!!(g&&g.imm88);const r=base.apply(this,arguments);try{const w=W_();const pm=me();
    if(!had&&g&&g.imm88&&pm&&g.contract&&g.contract.mgr===pm.id&&!w.tutorial)tit100Reveal(tit100ById('immortalis'),g.name)}catch(x){}return r}}
  const st=document.createElement('style');st.textContent=`
.wd100tp .art img.t100a{max-height:100px;max-width:90%;filter:drop-shadow(0 3px 4px #000)}.wd100tp .art svg.t100a{max-width:90%}
.wd100tp.lock .art img.t100a,.wd100tp.lock .art svg.t100a,.wd100tp.lock .art svg.medal100{filter:grayscale(1) brightness(.32) drop-shadow(0 0 1px #8a7a62);opacity:.75}
.wd100tp .art .medal100{width:96px;height:96px}.wd100tp .art img.t100sr{border-radius:50%}
.t100ann{margin:6px 0 12px}
.tr83-ic.t100ic{font-size:0;display:grid;place-items:center;width:52px;height:52px}.tr83-ic.t100ic svg,.tr83-ic.t100ic img{max-width:52px;max-height:52px}.tr83-ic.t100ic .medal100{width:48px;height:48px}
.tit100.t100s{display:inline-flex;align-items:center;gap:4px}.tit100.t100s svg{width:18px;height:18px;flex:none}
#tit100rv{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:10050;display:grid;justify-items:center;gap:6px;padding:10px 12px 12px;border-radius:10px;background:#1a1009ee;border:1px solid #d6ab4c;box-shadow:0 10px 30px #000a;cursor:pointer;max-width:calc(100vw - 32px);box-sizing:border-box;animation:t100in .55s cubic-bezier(.2,1.4,.4,1) both}
#tit100rv .rvh{font:400 15px var(--display,Georgia,serif);letter-spacing:.12em;text-transform:uppercase;color:#e8c66a}
#tit100rv .wd100tp{width:184px}
#tit100rv.rm{animation:none}
@keyframes t100in{from{opacity:0;transform:translateX(-50%) translateY(18px) scale(.86)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
@media (max-width:600px){#tit100rv{bottom:10px}#tit100rv .wd100tp{width:160px}.t100ann{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
  document.head.appendChild(st)}
