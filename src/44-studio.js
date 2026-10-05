/* =====================================================================
   44-STUDIO · SPECIAL EVENTS & PAIRINGS, ROSTER SETS, THE SUMMA RUDIS FACE, PORTRAIT BANNERS (v0.46)
   =====================================================================
   • ⭐ SPECIAL EVENTS — design the invitationals that pop up in Manager mode (format, field, rewards, how
     often they come) next to the three system ones (locked, copy only). 🤝 PAIRINGS link characters and
     beasts — teams of four, duos with a bond (family, friends, master & slave, co-workers, the Blood of
     Asclepius…), a keeper and their beasts, a pack. A pairing rides along in a special event, can join
     the ARENA DECK as a card (its beasts burst onto the sand), and can be placed in any custom event.
   • 📚 ROSTER SETS — like the custom rosters of the sports games: choose which of your creations are in
     play. Classic (system only) is the default; "Everything on the rolls" is the old behaviour; your own
     sets are ticked tab by tab. A set is chosen when a career is founded and on the New event screen.
   • 🧑 THE SUMMA RUDIS — the Event Designer's Rounds & rules tab has a portrait maker for the event's
     referee; the face goes on the event's Summa Rudis card.
   • 🖼 PORTRAIT BANNERS — the Banner press can cut a banner for portraits: the canvas shows the window a
     portrait keeps. They hang only behind portraits (the character creator and system portraits).
   ===================================================================== */
CUSTOM.specials=CUSTOM.specials||[];CUSTOM.pairings=CUSTOM.pairings||[];CUSTOM.rosters=CUSTOM.rosters||[];
if(typeof SAVE_COLS!=='undefined')for(const c of ['customSpecials','customPairings','rosterSets'])if(!SAVE_COLS.includes(c))SAVE_COLS.push(c);
const byName=(a,b)=>String(a.name).localeCompare(String(b.name));
{const _lc=loadCustoms;loadCustoms=async function(){const r=await _lc();
  try{CUSTOM.specials=(await Store.list('customSpecials')).sort(byName)}catch(e){CUSTOM.specials=CUSTOM.specials||[]}
  try{CUSTOM.pairings=(await Store.list('customPairings')).sort(byName)}catch(e){CUSTOM.pairings=CUSTOM.pairings||[]}
  try{CUSTOM.rosters=(await Store.list('rosterSets')).sort(byName)}catch(e){CUSTOM.rosters=CUSTOM.rosters||[]}
  pairRegister();return r}}
if(typeof NAME_KINDS!=='undefined'){NAME_KINDS.specials=[_T('special event'),()=>CUSTOM.specials];NAME_KINDS.pairings=['pairing',()=>CUSTOM.pairings];NAME_KINDS.rosters=[_T('roster set'),()=>CUSTOM.rosters]}

/* ---------------- 🖼 system portraits may hang a portrait banner behind the face ---------------- */
function sysBG(){const P=((typeof CUSTOM!=='undefined'&&CUSTOM.flags)||[]).filter(f=>f.fmt==='portrait'&&f.rack!==false&&(typeof rosterGate!=='function'||rosterGate('flags',f,true)));
  if(P.length&&Math.random()<0.3)return 'flag:c:'+pickOne(P).id;return pickOne(BGS)}
/* the window of the banner a portrait keeps (portraitSVG hangs the cloth at x −60, 220 wide, sliced to 140 high) */
const PB_WIN=[0.297,0.702];
{const _fs=flagStudioHTML;flagStudioHTML=function(){const d=ST.fd||(ST.fd=blankFlag());let h=_fs();const pb=d.fmt==='portrait';
  const seg=`<div class="seg pbseg" role="radiogroup" aria-label="${_T`What the banner is for`}"><button type="button" data-pbfmt="banner" class="${pb?'':'on'}">${_T`🚩 House banner<small>the banner rack, masthead, stands</small>`}</button><button type="button" data-pbfmt="portrait" class="${pb?'on':''}">${_T`🖼 Portrait banner<small>behind a portrait's face only</small>`}</button></div>`;
  h=h.replace('<div class="trstudio">',seg+'<div class="trstudio">');
  if(pb)h=h.replace(/(<img id="fdPrev"[^>]*>)/,`<span class="pbwrap">$1<span class="pbcrop" aria-hidden="true"><i style="width:${PB_WIN[0]*100}%"></i><b style="left:${PB_WIN[0]*100}%;width:${(PB_WIN[1]-PB_WIN[0])*100}%">${_T`<em>the portrait's window</em>`}</b><i style="left:${PB_WIN[1]*100}%;right:0"></i></span></span><span class="pbface">${portraitSVG({skin:SKINS[3],hair:HAIRS[2],bg:'flag:c:__draft',helm:'none'},'#8a1c1c').replace('<svg ',_T('<svg class="pbmini" '))}</span>`);
  /* the list: portrait banners wear their frame */
  h=h.replace(/<h4>Your banners · (\d+)<\/h4>/,(m,n)=>`<h4>${_T`Your banners · ${n}`} <span class="rc-sub">${_T`🖼 portrait banners hang only behind portraits (the character creator and system portraits) — the rack never shows them`}</span></h4>`);
  return h}}
/* the preview face uses the banner on the bench */
{window.__pbDraft=()=>ST&&ST.fd?houseFlagURI(ST.fd):null}
{const _ps=portraitSVG;portraitSVG=function(pt={},color){if(pt&&pt.bg==='flag:c:__draft'){const u=window.__pbDraft&&window.__pbDraft();const s=_ps({...pt,bg:'#1a120c'},color);return u?s.replace(/(<rect width="100" height="140" fill="#1a120c"\/>)/,`$1<image href="${u}" x="-60" y="0" width="220" height="140" preserveAspectRatio="xMidYMid slice" opacity=".85"/><rect width="100" height="140" fill="rgba(10,6,4,.18)"/>`):s}return _ps(pt,color)}}

/* ---------------- 🧑 the Summa Rudis of a custom event ---------------- */
function srBlank(){const fem=Math.random()<.3;return {skin:pickOne(SKINS),hair:pickOne(HAIRS.slice(0,10)),helm:pickOne(['laurel','none','none','galea']),fem,bs:fem?'':pickOne(['full','goatee','stache','']),hs:fem?'long':pickOne(['','crop','curly']),eyes:pickOne(EYES)[0],mark:'',garb:'toga',bg:sysBG(),smile:''}}
function srCardSVG(e){const p=e.srp||{};const nm=e.srName||_T('Summa Rudis');const R=(e.rounds||[]).slice(0,3);
  const face=portraitSVG(p,e.srColor||'#7a1c1c').replace('<svg ',_T('<svg x="46" y="60" width="148" height="207" '));
  const zone=z=>({1:'13×13',2:'9×9',3:'5×5'})[+z]||'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 346"><defs><linearGradient id="srg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2616"/><stop offset="1" stop-color="#1a100a"/></linearGradient><clipPath id="src"><path d="M46 268V130a74 74 0 0 1 148 0V268Z"/></clipPath></defs>
   <rect width="240" height="346" rx="12" fill="url(#srg)"/><rect x="6" y="6" width="228" height="334" rx="9" fill="none" stroke="#c9964a" stroke-width="2"/><rect x="11" y="11" width="218" height="324" rx="7" fill="none" stroke="#6b4a22" stroke-width="1"/>
   <text x="120" y="27" text-anchor="middle" font-family="Marcellus SC, Georgia, serif" font-size="12" letter-spacing="3" fill="#c9964a">${_T`SVMMA RVDIS`}</text>
   <text x="120" y="46" text-anchor="middle" font-family="Marcellus SC, Georgia, serif" font-size="16" fill="#f0cf7d">${esc(nm).slice(0,22)}</text>
   <g clip-path="url(#src)">${face}</g><path d="M46 268V130a74 74 0 0 1 148 0V268" fill="none" stroke="#c9964a" stroke-width="2.4"/>
   <rect x="20" y="272" width="200" height="22" rx="4" fill="#6e1414" stroke="#c9964a" stroke-width="1"/><text x="120" y="287" text-anchor="middle" font-family="Marcellus SC, Georgia, serif" font-size="11.5" fill="#fff0d0">${esc(e.name||_T('Custom event')).slice(0,30)}</text>
   ${R.map((r,i)=>`<text x="24" y="${310+i*11}" font-family="Georgia, serif" font-size="9.5" fill="#e8dcc0">${['I','II','III'][i]} · ${esc(r.n||_T('Round ')+(i+1)).slice(0,16)} · ${zone(r.zone)}${r.pvp?' · PvP':''}${r.pve?' · PvE':''}</text>`).join('')}</svg>`}
const SR_CACHE={};
function srCardURL(e){const s=srCardSVG(e);const k=e.id+'|'+hashStr(s);return SR_CACHE[k]||(SR_CACHE[k]='data:image/svg+xml,'+encodeURIComponent(s))}
{const _ch=cardHTML;cardHTML=function(ref,size='md',extra=''){try{if(ref&&ref.startsWith('e:ce_')){const e=(CUSTOM.events||[]).find(x=>'ce_'+x.id===ref.slice(2));if(e&&e.srp)return `<span class="cimg ${size}" style="background-image:url('${srCardURL(e)}');background-size:100% 100%;aspect-ratio:240/346" role="img" aria-label="${esc((e.srName||_T('Summa Rudis'))+' — '+(e.name||''))}" data-card="${ref}" ${extra}></span>`}
    if(ref&&ref.startsWith('c:pair_')){const P=pairById(ref.slice(7));if(P)return `<span class="cimg ${size}" style="background-image:url('${pairCardURL(P)}');background-size:100% 100%;aspect-ratio:5/7" role="img" aria-label="${_T`${esc(P.name)} (cohort card)`}" data-card="${ref}" ${extra}></span>`}}catch(err){}
  return _ch(ref,size,extra)}}
{const _ed=eventDef;eventDef=function(e){const d=_ed(e);if(e.srName)d.sr=e.srName;if(e.srp)d.srFace=true;return d}}
{const _er=edRulesHTML;edRulesHTML=function(){const e=ST.draft;const p=e.srp;const has=!!p;
  const sel=(f,opts,v)=>fSel(_T('srp.')+f,opts,v);
  const box=`<div class="card2 srcard"><div class="srhd">${_T`<b>🧑‍⚖️ The Summa Rudis</b>`} <span class="rc-sub">${_T`the referee of the rounds below — give them a name and a face; they go on the event's Summa Rudis card`}</span></div>
   <div class="srgrid"><div class="srprev" id="srPrev">${has?`<img src="${srCardURL(e)}" alt="${_T`The Summa Rudis card`}">`:`<div class="srnone">${_T`No face yet`}<br><button class="btn primary" type="button" data-srx="make">${_T`🧑 Make their face`}</button></div>`}</div>
    <div><div class="formgrid"><label>${_T`Name${fTxt('srName',e.srName||'',_T('maxlength="22" placeholder="e.g. Democritus"'))}`}</label><label>${_T`Sash color`}<input type="color" data-f="srColor" value="${esc(e.srColor||'#7a1c1c')}" style="width:44px;height:30px;border:0;background:none;padding:0"></label></div>
     ${has?`<div class="formgrid" style="grid-template-columns:1fr 1fr;margin-top:6px">
      <label>${_T`Skin${sel('skin',SKINS.map((v,i)=>[v,SKIN_NAMES[i]||_T('Tone ')+(i+1)]),p.skin)}`}</label><label>${_T`Hair${sel('hair',HAIRS.map((v,i)=>[v,HAIR_NAMES[i]||_T('Shade ')+(i+1)]),p.hair)}`}</label>
      <label>${_T`Headgear${sel('helm',HELMS,p.helm)}`}</label><label>${_T`Hairstyle${sel('hs',HAIRSTYLES,p.hs||'')}`}</label>
      <label>${_T`Beard${sel('bs',BEARDS,p.bs||'')}`}</label><label>${_T`Eyes${sel('eyes',EYES,p.eyes||EYES[0][0])}`}</label>
      <label>${_T`Marks${sel('mark',MARKS,p.mark||'')}`}</label><label>${_T`Garb${sel('garb',GARBS,p.garb||'')}`}</label>
      <label>${_T`Build${sel('fem',[['',_T('Man')],['1',_T('Woman')]],p.fem?'1':'')}`}</label><label>${_T`Expression${sel('smile',[['',_T('Stern')],['1',_T('Smiling')]],p.smile?'1':'')}`}</label>
      <label style="grid-column:1/-1">${_T`Backdrop${sel('bg',BGS.map((v,i)=>[v,BG_NAMES[i]||_T('Backdrop ')+(i+1)]).concat(typeof FLAGS!=='undefined'?Object.entries(FLAGS).map(([k,F])=>['flag:'+k,_T('🏳 City banner · ')+F.n]):[]).concat((CUSTOM.flags||[]).map(f=>['flag:c:'+f.id,(f.fmt==='portrait'?'🖼 ':'✦ ')+(f.name||_T('your banner'))])),p.bg)}`}</label></div>
      <div class="mbtns"><button class="btn" type="button" data-srx="rand">${_T`🎲 Another face`}</button><button class="btn" type="button" data-srx="clear">${_T`✖ No face`}</button></div>`:''}</div></div></div>`;
  return _er().replace('<h4>Rounds</h4>',box+`<h4>${_T`Rounds`}</h4>`)}}
function srPrevRefresh(){const pv=document.getElementById('srPrev');const e=ST&&ST.draft;if(pv&&e&&e.srp)pv.innerHTML=`<img src="${srCardURL(e)}" alt="${_T`The Summa Rudis card`}">`}

/* ---------------- 🤝 PAIRINGS ---------------- */
const PAIR_TYPES={duo:[_T('Team duo'),_T('two fighters (or a fighter and a beast) bound to each other'),2,2],team4:[_T('Team of four'),_T('four who enter together'),4,4],handler:['Keeper & beasts',_T('one character and the beasts they keep (1–3)'),2,4],pack:[_T('Pack'),_T('two to four beasts that hunt together'),2,4],trio:[_T('Trio'),_T('any three'),3,3]};
const PAIR_RELS=[_T('Family'),_T('Friends'),'Master & slave','Co-workers',_T('The Blood of Asclepius'),_T('Rivals'),'Mentor & pupil',_T('Lovers'),_T('Brothers in arms'),_T('Sworn enemies')];
const SYS_PAIRINGS=[
  {id:'sys_androcles',sys:1,name:'Androcles & the Lion',type:'handler',rel:_T('Friends'),members:['cls:slave','npc:lion'],blurb:_T('The runaway who pulled the thorn — the lion remembers him.')},
  {id:'sys_romulus',sys:1,name:'The Wolves of Romulus',type:'pack',members:['npc:wolf','npc:wolf'],blurb:_T('Two she-wolves of the Lupercal, loose on the sand.')},
  {id:'sys_dioscuri',sys:1,name:'The Dioscuri',type:'duo',rel:_T('Family'),members:['cls:soldier','cls:hero'],blurb:_T('Castor and Pollux: one mortal, one divine, never parted.')},
  {id:'sys_asclepius',sys:1,name:'The Blood of Asclepius',type:'duo',rel:_T('The Blood of Asclepius'),members:['cls:veteranus','npc:snake'],blurb:_T('The old physician’s line and the serpent of the staff.')},
  {id:'sys_guard',sys:1,name:'The Flavian Guard',type:'team4',members:['cls:soldier','cls:veteranus','cls:amazonia','cls:royalty'],blurb:_T('Four sworn to the editor’s box.')}];
const allPairings=()=>[...SYS_PAIRINGS,...(CUSTOM.pairings||[])];
const pairById=id=>allPairings().find(p=>p.id===id)||null;
function pmParse(ref){const [k,id]=String(ref||'').split(':');if(k==='cls')return CLASSES[id]?{char:1,cls:id,name:CLASSES[id].hero||CLASSES[id].name,label:CLASSES[id].name}:null;
  if(k==='cc'){const c=(CUSTOM.chars||[]).find(x=>x.id===id);return c?{char:1,cls:'cc_'+id,name:c.name,label:c.name,cc:c}:null}
  if(k==='npc')return NPCT[id]?{beast:1,t:id,name:NPCT[id].n,label:NPCT[id].n}:null;
  if(k==='cn'){const n=(CUSTOM.npcs||[]).find(x=>x.id===id);return n?{beast:1,t:'cn_'+id,name:n.name,label:n.name,cn:n}:null}return null}
function pmTok(ref,size=40){const m=pmParse(ref);if(!m)return `<span class="pmtok none" style="width:${size}px;height:${size}px">?</span>`;
  if(m.beast)return m.cn?cnTokHTML(m.cn,size):(typeof npcTokHTML==='function'?npcTokHTML({t:m.t,name:m.name,id:0},size):'');
  if(m.cc)return `<span class="pmtok" style="width:${size}px;height:${size}px">${portraitHTML(m.cc,'xs').replace('width:26px;height:36px',`width:${size}px;height:${size}px`)}</span>`;
  return `<span class="pmtok fig" style="width:${size}px;height:${size}px">${figureHTML(tokenForCls(m.cls),size*1.15)}</span>`}
function pairMembersOK(P){const T=PAIR_TYPES[P.type]||PAIR_TYPES.duo;const M=(P.members||[]).map(pmParse).filter(Boolean);if(M.length<T[2]||M.length>T[3])return _T`a ${T[0].toLowerCase()} needs ${T[2]===T[3]?T[2]:T[2]+'–'+T[3]} members`;
  if(P.type==='pack'&&M.some(m=>!m.beast))return _T('a pack is beasts only');if(P.type==='handler'&&(M.filter(m=>m.char).length!==1))return _T('a keeper pairing has exactly one character');return ''}
function pairBlank(){return {id:'px'+Date.now().toString(36),name:'',type:'duo',rel:_T('Family'),members:['cls:soldier','cls:hero'],deck:false,blurb:''}}
function pairCardSVG(P){const M=(P.members||[]).map(pmParse).filter(Boolean);const T=PAIR_TYPES[P.type]||PAIR_TYPES.duo;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 350"><defs><linearGradient id="pcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d12"/><stop offset="1" stop-color="#120b06"/></linearGradient></defs><rect width="250" height="350" rx="14" fill="url(#pcg)"/><rect x="7" y="7" width="236" height="336" rx="10" fill="none" stroke="#c9964a" stroke-width="2"/>
   <text x="125" y="36" text-anchor="middle" font-family="Marcellus SC, Georgia, serif" font-size="12" letter-spacing="3" fill="#c9964a">🤝 COHORT · ${esc(T[0].toUpperCase())}</text><text x="125" y="62" text-anchor="middle" font-family="Marcellus SC, Georgia, serif" font-size="18" fill="#f0cf7d">${esc(P.name||_T('Pairing')).slice(0,22)}</text>
   ${P.type==='duo'?`<text x="125" y="80" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="11" fill="#e8dcc0">${esc(P.rel||'')}</text>`:''}
   ${M.map((m,i)=>{const n=M.length;const x=125+(i-(n-1)/2)*Math.min(56,200/n);return `<circle cx="${x}" cy="170" r="24" fill="${m.beast?(NPCT[m.t]||{}).col||'#5f8a3a':(CLASSES[m.cls]||{}).color||'#8a1c1c'}" stroke="#c9964a" stroke-width="2"/><text x="${x}" y="177" text-anchor="middle" font-family="Marcellus SC, Georgia, serif" font-size="19" fill="#fff3d8">${esc((m.name||'?')[0])}</text><text x="${x}" y="210" text-anchor="middle" font-family="Georgia, serif" font-size="8.5" fill="#e8dcc0">${esc(m.name).slice(0,12)}</text>`}).join('')}
   <text x="125" y="258" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" fill="#e8dcc0">${M.some(m=>m.beast)?_T('When drawn, the beasts burst onto the sand.'):_T('When drawn, the crowd hears their story.')}</text>
   <text x="125" y="274" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" fill="#e8dcc0">${M.some(m=>m.char)&&M.some(m=>m.beast)?_T('Their keeper, if on the sand, commands them.'):_T('+2 CF to whoever draws it.')}</text></svg>`}
const PC_CACHE={};function pairCardURL(P){const s=pairCardSVG(P);const k=P.id+'|'+hashStr(s);return PC_CACHE[k]||(PC_CACHE[k]='data:image/svg+xml,'+encodeURIComponent(s))}
/* pairings on the rolls become arena cards */
function pairRegister(){for(const P of allPairings())CARDS['pair_'+P.id]={n:'🤝 '+P.name,type:'npc',d:_T`${(PAIR_TYPES[P.type]||PAIR_TYPES.duo)[0]}${P.type==='duo'?' ('+P.rel+')':''}: ${(P.members||[]).map(pmParse).filter(Boolean).map(m=>m.name).join(', ')}. When drawn, its beasts burst onto the sand${(P.members||[]).some(r=>/^(cls|cc):/.test(r))?_T(' — and a keeper on the sand commands them'):''}.`,img:null,pair:P.id}}
function pairDeckCards(ev){return (CUSTOM.pairings||[]).filter(P=>P.deck&&!pairMembersOK(P)&&(typeof rosterGate!=='function'||rosterGate('pairs',P,true))).map(P=>'pair_'+P.id)}
async function pairEnter(P,drawer,why){const M=(P.members||[]).map(pmParse).filter(Boolean);
  const keeper=M.find(m=>m.char)&&S.players.find(p=>p.alive!==false&&!p.out&&M.some(m=>m.char&&m.cls===p.cls));
  let n=0;for(const m of M.filter(m=>m.beast)){if(!NPCT[m.t])continue;const x=spawnNPC(m.t,m.name,null,keeper&&P.type==='handler'?{tamedBy:keeper.id}:{});if(x)n++}
  const chars=S.players.filter(p=>M.some(m=>m.char&&m.cls===p.cls));
  if(chars.length>=2){for(const p of chars){p.cf+=P.type==='team4'?1:2}log(_T`🤝 <b>${esc(P.name)}</b>${P.type==='duo'?` — ${esc(P.rel)}`:''}: ${chars.map(nm).join(' and ')} are on the same sand. The crowd knows the story: ${cfAmt87('+'+(P.type==='team4'?1:2))} each.`,'big')}
  if(n)log(_T`🤝 <b>${esc(P.name)}</b> ${why||'enters'}: ${M.filter(m=>m.beast).map(m=>esc(m.name)).join(', ')} ${n===1?_T('is'):_T('are')} loose on the sand${keeper&&P.type==='handler'?_T` — and answer to ${nm(keeper)}`:''}.`,'big');
  if(!n&&drawer&&!chars.length){drawer.cf+=2;log(_T`🤝 ${nm(drawer)} draws <b>${esc(P.name)}</b> — the crowd loves a story: ${cfAmt87('+2')}.`)}
  try{draw()}catch(e){}}
async function pairCardPlay(p,k){const P=pairById(String(k).slice(5));if(!P)return;await pairEnter(P,p,_T`is drawn by ${nm(p)}`)}
async function pairStart(cfg){const ids=[...((cfg&&cfg.pairs)||[]),...(((EV()||{}).src||{}).pairs||[])];const seen=new Set();
  for(const id of ids){if(seen.has(id))continue;seen.add(id);const P=pairById(id);if(P&&!pairMembersOK(P))await pairEnter(P,null,_T('enters with the pompa'))}}

/* ---------------- ⭐ SPECIAL EVENTS (Manager invitationals) ---------------- */
const SX_FREQ=[['off',_T('Off (not sent)'),0],['rare',_T('Rare'),0.4],['occasional',_T('Occasional'),1],['common',_T('Common'),2],['headliner','Headliner — often',4]];
const SX_ICONS=['⭐','🏛','🔱','🦁','🦅','🐺','🐍','🔥','⚔','🏆','🌊','🌙','☀','👑','🎭','🛡'];
const SX_FORMATS=[['single',_T('A single bout'),1],['bracket2',_T('Two heats → a final'),2],['bracket4',_T('Four heats → a final'),4]];
const sxEvents=()=>Object.keys(EVENTS).filter(k=>{const E=EVENTS[k];return E&&!['chariot','naumachia'].includes(E.kind)&&E.min<=4&&E.max>=2}).map(k=>[k,(EVENTS[k].custom?'✦ ':'')+EVENTS[k].n+(EVENTS[k].custom?' · custom':'')]);
function sxBlank(){return {id:'sx'+Date.now().toString(36),name:_T('The ')+pickOne([_T('Ides'),_T('Kalends'),_T('Saturnalia'),_T('Vulcan'),_T('Janus'),_T('Mars')])+_T(' Invitational'),icon:'⭐',loc:6,format:'single',ev:'democritus',finalEv:'cassian',slots:1,oppLo:62,oppHi:82,stars:3,purse:300,appear:12,fame:8,trophy:'',freq:'off',fates:true,blurb:'',pairs:[]}}
function sxDef(x){const F=SX_FORMATS.find(f=>f[0]===x.format)||SX_FORMATS[0];const E=EVENTS[x.ev]||EVENTS.democritus;const size=clamp(4,E.min,E.max);
  let fin=EVENTS[x.finalEv]?x.finalEv:'cassian';if(EVENTS[fin].min>F[2]||EVENTS[fin].max<F[2])fin=F[2]<=2?'orpheus':'cassian'; /* the final must seat exactly the heat winners */
  const stages=F[2]===1?[{ev:x.ev,size,heats:1}]:[{ev:x.ev,size,heats:F[2]},{ev:fin,size:F[2],heats:1}];
  const pairs=(x.pairs||[]).filter(id=>{const P=pairById(id);return P&&!pairMembersOK(P)});
  return {n:x.name||'Special event',icon:x.icon||'⭐',loc:clamp(+x.loc||6,1,LOCATIONS.length-1),kind:F[2]===1?'single':'bracket',stages,slots:clamp(+x.slots||1,1,2),opp:[+x.oppLo||60,Math.max(+x.oppLo||60,+x.oppHi||80)],stars:clamp(+x.stars||3,1,5),purse:+x.purse||0,appear:+x.appear||0,fame:+x.fame||0,trophy:x.trophy||null,custom:true,fates:x.fates!==false,pairs,
    blurb:x.blurb||_T`Your own invitational, ${x.name}.`,rules:[F[1]+(F[2]>1?_T` (${size} a heat)`:_T` of ${size}`),_T`opponents rated ${+x.oppLo||60}–${Math.max(+x.oppLo||60,+x.oppHi||80)}`,...pairs.map(id=>_T`🤝 ${pairById(id).name} take part`),x.fates!==false?_T('the Fate table applies, as in any event'):_T('an exhibition: no Fates')]}}
{const _sd=specDef;specDef=function(sid){if(String(sid).startsWith('cs:')){const x=(CUSTOM.specials||[]).find(y=>y.id===sid.slice(3));return x?sxDef(x):null}return _sd(sid)}}
/* the invitations pool: the system three, your events with trophies, your special events — weighted by how often you asked */
function specPickSid(){const pool=[];for(const k of Object.keys(SPECIALS))pool.push([k,1]);
  for(const e of CUSTOM.events||[])if(e.trophy&&EVENTS['ce_'+e.id]&&(typeof rosterGate!=='function'||rosterGate('events',e,true)))pool.push(['ce:ce_'+e.id,0.8]);
  for(const x of CUSTOM.specials||[]){const f=(SX_FREQ.find(q=>q[0]===x.freq)||SX_FREQ[2])[2];if(f>0&&(typeof rosterGate!=='function'||rosterGate('specials',x,true)))pool.push(['cs:'+x.id,f])}
  const tot=pool.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot;for(const [k,wt] of pool){r-=wt;if(r<=0)return k}return pool[0][0]}
/* a pairing's characters are invited into the field — side by side in one heat */
{const _sb=specBuild;specBuild=function(D,iv,mine){const T=_sb(D,iv,mine);try{if(D.pairs&&D.pairs.length){const heats=T.rounds[0];
    for(const id of D.pairs){const P=pairById(id);const chars=(P.members||[]).map(pmParse).filter(m=>m&&m.char);if(!chars.length)continue;
      const h=heats.find(x=>x.ents.filter(e=>e.opp).length>=chars.length);if(!h)continue;
      chars.forEach(m=>{const slot=h.ents.findIndex(e=>e.opp&&!e.pairOf);if(slot<0)return;const g=h.ents[slot].opp;g.cls=m.cls;g.name=m.name;h.ents[slot].pairOf=id})}}}catch(err){console.error(err)}return T}}
{const _sh=specHeatCfg;specHeatCfg=function(T,s,h,watch,human){const cfg=_sh(T,s,h,watch,human);if(T.D&&T.D.pairs&&T.D.pairs.length)cfg.pairs=[...T.D.pairs];return cfg}}

/* ---------------- 📚 ROSTER SETS ---------------- */
const ROSTER_SYS=[{id:'classic',sys:1,name:'Classic — the system roster',desc:_T('only the printed game: none of your creations')},{id:'rolls',sys:1,name:'Everything on the rolls',desc:_T('every creation you have added to the rolls (the old behaviour)')}];
let ROSTER_ACTIVE=null;
const RS_KINDS=[['chars',_T('🛡 Characters')],['npcs',_T('🐾 Beasts')],['weapons',_T('⚔ Weapons')],['armor',_T('🛡 Armor')],['flags',_T('🚩 Banners')],['trophies',_T('🏆 Trophies')],['sponsors',_T('🎭 Editors')],['events',_T('🎪 Events')],['specials',_T('⭐ Invitationals')],['pairs',_T('🤝 Cohorts')]];
function rosterById(id){return ROSTER_SYS.find(r=>r.id===id)||(CUSTOM.rosters||[]).find(r=>r.id===id)||ROSTER_SYS[0]}
function rosterSnap(R){return R?JSON.parse(JSON.stringify({id:R.id,name:R.name,sel:R.sel||null})):{id:'classic',name:ROSTER_SYS[0].name}}
function rosterCur(){return ROSTER_ACTIVE||rosterById((typeof CFG!=='undefined'&&CFG.roster)||'classic')}
function rosterGate(kind,item,rollsOn){const R=rosterCur();if(!R||R.id==='classic')return false;if(R.id==='rolls')return !!rollsOn;return !!(item&&R.sel&&(R.sel[kind]||[]).includes(item.id))}
const onRollsR=c=>!!c&&(!c.status||c.status==='active')&&rosterGate('chars',c,onRolls(c));
function rosterUse(R){ROSTER_ACTIVE=R?rosterSnap(R):null;try{if(typeof gearRebuild==='function')gearRebuild()}catch(e){}}
try{const v=localStorage.getItem('flavius_roster_play');if(v&&typeof CFG!=='undefined')CFG.roster=v}catch(e){}
/* the roster in force follows the context: a career's own set in Manager mode, the New event choice otherwise */
{const _se=startEvent;startEvent=function(cfg,...a){try{const mg=cfg&&(cfg.mgrTier||cfg.specCtx||cfg.mgrCtx)&&typeof MGR!=='undefined'&&MGR.world;rosterUse(mg?(MGR.world.roster||ROSTER_SYS[1]):rosterById(CFG.roster||'classic'))}catch(e){}return _se(cfg,...a)}}
{const _nw=newWorld;newWorld=function(choice){const R=rosterById((typeof NEWMGR!=='undefined'&&NEWMGR&&NEWMGR.roster)||'classic');rosterUse(R);const out=_nw(choice);try{if(MGR.world&&!MGR.world.roster)MGR.world.roster=rosterSnap(R)}catch(e){}return out}}
{const _mm=mgrMigrate;mgrMigrate=function(w){const o=_mm(w);const W9=o||w;try{if(W9&&!W9.roster)W9.roster={id:'rolls',name:ROSTER_SYS[1].name};rosterUse(W9.roster)}catch(e){}return o}}
function rosterEnsure(kind,id){const R=rosterCur();if(R.id==='rolls')return;if(R.id!=='classic'&&R.sel&&(R.sel[kind]||[]).includes(id))return;CFG.roster='rolls';try{localStorage.setItem('flavius_roster_play','rolls')}catch(e){}rosterUse(null);
  if(typeof mToast==='function')mToast(_T('📚 The roster switched to <b>Everything on the rolls</b> so your creation can play.'))}
function rosterPickHTML(ctx,cur){const L=[...ROSTER_SYS,...(CUSTOM.rosters||[])];cur=cur||'classic';const R=rosterById(cur);
  return `<label class="rspick" style="display:grid;gap:4px;font-size:14px;margin-top:6px"><span data-tip="${_T`Which of your creations are in play. Make sets in the Creator Studio.`}">${_T`📚 Roster set`} <span class="qi">ⓘ</span></span><select data-roster="${ctx}" title="${esc(R.desc||rosterSummary(R))}">${L.map(r=>`<option value="${esc(r.id)}" ${r.id===cur?'selected':''}>${r.sys?'':'✦ '}${esc(r.name)}</option>`).join('')}</select></label>`}
function rosterSummary(R){if(!R.sel)return '';const n=RS_KINDS.map(([k,l])=>[(R.sel[k]||[]).length,l.split(' ').slice(1).join(' ')]).filter(x=>x[0]);return n.length?_T('your picks: ')+n.map(([c,l])=>`${c} ${l.toLowerCase()}`).join(', '):_T('no creations ticked — plays like Classic')}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.roster)return;const v=t.value;
  if(t.dataset.roster==='nm'&&typeof NEWMGR!=='undefined'&&NEWMGR){NEWMGR.roster=v}
  if(t.dataset.roster==='cfg'){CFG.roster=v;try{localStorage.setItem('flavius_roster_play',v)}catch(err){}rosterUse(rosterById(v));const ev=document.getElementById('evSel');if(ev)ev.dispatchEvent(new Event('change',{bubbles:true}))}});
/* the studio tab: tick what goes in */
function rsItems(kind){const sys=[],mine=[];
  if(kind==='chars'){for(const k of BASE_CLS)sys.push([k,CLASSES[k].name]);for(const c of CUSTOM.chars||[])mine.push([c.id,c.name,portraitHTML(c,'xs'),c.status&&c.status!=='active'?c.status:''])}
  if(kind==='npcs'){for(const k of Object.keys(NPCT).filter(k=>!NPCT[k].custom))sys.push([k,NPCT[k].n]);for(const n of CUSTOM.npcs||[])mine.push([n.id,n.name,cnTokHTML(n,24)])}
  if(kind==='weapons'){for(const k of Object.keys(W).filter(k=>!W[k].custom&&W[k].lv>=1&&!W[k].limb))sys.push([k,W[k].n]);for(const c of CUSTOM.weapons||[])mine.push([c.id,c.name,typeof cwCardURL==='function'?`<img src="${cwCardURL('cw_'+c.id)}" style="width:30px;border-radius:2px" alt="">`:''])}
  if(kind==='armor'){for(const k of Object.keys(ARM).filter(k=>!ARM[k].custom))sys.push([k,ARM[k].n]);for(const c of CUSTOM.armor||[])mine.push([c.id,c.name,typeof armArtURL==='function'&&ARM['ca_'+c.id]?`<img src="${armArtURL('ca_'+c.id)}" style="width:24px" alt="">`:''])}
  if(kind==='flags'){if(typeof FLAGS!=='undefined')for(const [k,F] of Object.entries(FLAGS))sys.push([k,F.n]);for(const f of CUSTOM.flags||[])mine.push([f.id,(f.fmt==='portrait'?'🖼 ':'')+f.name,`<img src="${houseFlagURI(f)}" style="height:20px;border-radius:2px" alt="">`])}
  if(kind==='trophies'){for(const t of (typeof TROPHY_LIB!=='undefined'?TROPHY_LIB:[]))sys.push([t.id,t.name]);for(const t of CUSTOM.trophies||[])mine.push([t.id,t.name,typeof trophySVG==='function'?trophySVG(t,22):''])}
  if(kind==='sponsors'){sys.push(['flavius',_T('Flavius')]);for(const s of CUSTOM.sponsors||[])mine.push([s.id,s.name,''])}
  if(kind==='events'){for(const k of Object.keys(EVENTS).filter(k=>!EVENTS[k].custom))sys.push([k,EVENTS[k].n]);for(const e of CUSTOM.events||[])mine.push([e.id,e.name,e.srp?`<img src="${srCardURL(e)}" style="height:26px;border-radius:2px" alt="">`:'🏟'])}
  if(kind==='specials'){for(const [k,D] of Object.entries(SPECIALS))sys.push([k,D.n]);for(const x of CUSTOM.specials||[])mine.push([x.id,x.name,esc(x.icon||'⭐')])}
  if(kind==='pairs'){for(const P of SYS_PAIRINGS)sys.push([P.id,P.name]);for(const P of CUSTOM.pairings||[])mine.push([P.id,P.name,'🤝'])}
  return {sys,mine}}
function rsBlank(){const sel={};for(const [k] of RS_KINDS)sel[k]=[];return {id:'rs'+Date.now().toString(36),name:'My roster',sel}}
function rosterStudioHTML(){const d=ST.rsd||(ST.rsd=rsBlank());const tab=ST.rsTab||'chars';const {sys,mine}=rsItems(tab);const on=new Set(d.sel[tab]||[]);
  const tabs=`<div class="seg rstabs" role="tablist">${RS_KINDS.map(([k,l])=>{const n=(d.sel[k]||[]).length;return `<button type="button" role="tab" data-rs="tab" data-v="${k}" class="${tab===k?'on':''}">${l}${n?` <b class="rsn">${n}</b>`:''}</button>`}).join('')}</div>`;
  const L=[...ROSTER_SYS,...(CUSTOM.rosters||[])];
  return `<p>${_T`A <b>roster set</b> decides which of your creations are in play — the way sports games let you build a custom roster. <b>Classic</b> (the printed game only) is the default for every new career and every New event; pick another set when you found a career or on the New event screen. Your creations start <b>unticked</b>: tick them tab by tab, then save the set.`}</p>
   <div class="card2 rsed"><div class="formgrid"><label>${_T`Set name`}<input class="tin" data-rsf="name" value="${esc(d.name)}" maxlength="32"></label><div class="rc-sub" style="align-self:end">${rosterSummary(d)}</div></div>
    ${tabs}
    <div class="rsbody"><div class="rscol"><div class="sect">${_T`🏛 The system set`} <span class="rc-sub">${_T`always in — locked`}</span></div><div class="rschips">${sys.map(([k,n])=>`<span class="rschip sys" title="${_T`Part of the classic game`}">✓ ${esc(n)}</span>`).join('')||'<span class="rc-sub">—</span>'}</div></div>
     <div class="rscol"><div class="sect">${_T`✦ Your creations`} <span class="rc-sub">${mine.length?_T`${on.size} of ${mine.length} ticked`:''}</span>${mine.length?` <button type="button" class="btn tksm" data-rs="all">${_T`Tick all`}</button><button type="button" class="btn tksm" data-rs="none">${_T`Untick all`}</button>`:''}</div>
      ${mine.length?`<div class="rslist">${mine.map(([id,n,ic,st])=>`<label class="rsrow ${on.has(id)?'on':''}"><input type="checkbox" data-rsk="${esc(id)}" ${on.has(id)?'checked':''} ${st?'disabled':''}><span class="rsic">${ic||''}</span><b>${esc(n||'')}</b>${st?` <span class="rc-sub">(${esc(st)})</span>`:''}</label>`).join('')}</div>`:`<p class="rc-sub">${_T`Nothing of yours in this tab yet.`}</p>`}</div></div>
    <div class="mbtns"><button class="btn primary" type="button" data-rs="save">${_T`💾 Save roster set`}</button><button class="btn" type="button" data-rs="new">${_T`↺ A fresh set`}</button></div></div>
   <h4>${_T`Roster sets · ${L.length}`}</h4><div class="list2 one">${L.map(r=>`<div class="lrow"><div class="t"><b>${r.sys?'🏛 ':'✦ '}${esc(r.name)}</b>${r.id===(CFG.roster||'classic')?_T(' <span class="badge gold">New event uses this</span>'):''}<small>${esc(r.desc||rosterSummary(r))}</small></div><div class="a">${r.sys?sysActs(`data-rs="copy" data-v="${r.id}"`,{rolls:false}):`${lockBtn(r).replace('data-st="lock"',`data-rs="lock" data-v="${r.id}"`)}<button class="btn tksm" type="button" data-rs="edit" data-v="${r.id}" ${r.locked?'disabled':''}>${_T`Edit`}</button><button class="btn tksm" type="button" data-rs="copy" data-v="${r.id}">${_T`Copy`}</button><button class="btn tksm" type="button" data-rs="del" data-v="${r.id}" ${r.locked?'disabled':''}>${_T`Delete`}</button>`}<button class="btn tksm" type="button" data-rs="useplay" data-v="${r.id}" title="${_T`Use this set on the New event screen`}">${_T`▶ Use for New event`}</button></div></div>`).join('')}</div>`}

/* ---------------- the Special Events tab ---------------- */
function specialStudioHTML(){const d=ST.sxd||(ST.sxd=sxBlank());const P=ST.pxd||(ST.pxd=pairBlank());const D=sxDef(d);const F=SX_FORMATS.find(f=>f[0]===d.format)||SX_FORMATS[0];
  const f=(k,v,attrs='')=>`<input class="tin" data-sxf="${k}" value="${esc(v??'')}" ${attrs}>`;
  const s=(k,opts,v)=>`<select class="tin" data-sxf="${k}">${opts.map(([a,b])=>`<option value="${esc(a)}" ${String(v)===String(a)?'selected':''}>${esc(b)}</option>`).join('')}</select>`;
  const n=(k,v,min,max,step=1)=>`<span class="slider" style="grid-template-columns:1fr 42px"><input type="range" data-sxf="${k}" min="${min}" max="${max}" step="${step}" value="${v}"><output>${v}</output></span>`;
  const pairs=allPairings();
  const inv=`<div class="sxinv"><div class="sxicon">${esc(d.icon||'⭐')}</div><b>${esc(d.name||_T('Special event'))}</b><div class="rc-sub">${esc((LOCATIONS[D.loc]||{}).n||'')} · ${starsHTML(D.stars)}</div><div class="sxrules">${D.rules.map(r=>`<div>• ${esc(r)}</div>`).join('')}</div><div class="sxpay">${_T`💰 ${D.purse} purse · ${coinAmt87(D.appear)} a fighter · ⭐ +${D.fame} fame${D.trophy&&typeof trophyDef==='function'&&trophyDef(D.trophy)?` · 🏆 ${esc(trophyDef(D.trophy).name)}`:''}`}</div>${D.pairs.length?`<div class="sxpairs">${D.pairs.map(id=>{const Q=pairById(id);return `<span title="${esc(Q.name)}">${(Q.members||[]).map(r=>pmTok(r,24)).join('')}</span>`}).join('')}</div>`:''}<div class="rc-sub" style="margin-top:4px">${d.freq==='off'?_T('Off — not sent in Manager mode yet'):_T('Sent in Manager mode: ')+esc((SX_FREQ.find(q=>q[0]===d.freq)||SX_FREQ[2])[1])}</div></div>`;
  const pOK=pairMembersOK(P);const PT=PAIR_TYPES[P.type]||PAIR_TYPES.duo;
  const memOpts=[['','— empty —'],...BASE_CLS.map(k=>['cls:'+k,'🛡 '+CLASSES[k].name]),...(CUSTOM.chars||[]).map(c=>['cc:'+c.id,'✦ '+c.name]),...Object.keys(NPCT).filter(k=>!NPCT[k].custom).map(k=>['npc:'+k,'🐾 '+NPCT[k].n]),...(CUSTOM.npcs||[]).map(x=>['cn:'+x.id,'✦🐾 '+x.name])];
  const slots=Math.max(PT[3],(P.members||[]).length);
  return `<p>${_T`Design the <b>special events</b> that arrive as invitations in Manager mode — how often they come, the field, the purse and the prize — and the <b>pairings</b> that make them memorable. The system invitationals sit at the bottom: locked, copy one to make it yours. ${customTag()}`}</p>
   <div class="setup-grid" style="grid-template-columns:minmax(0,250px) minmax(0,1fr)"><div>${inv}</div>
    <div><div class="formgrid"><label>${_T`Name${f('name',d.name,'maxlength="36"')}`}</label><label>${_T`Icon${s('icon',SX_ICONS.map(i=>[i,i]),d.icon)}`}</label>
     <label>${_T`City${s('loc',LOCATIONS.map((L,i)=>L?[i,`${i} · ${L.n}`]:null).filter(Boolean),d.loc)}`}</label><label>${_T`How often it comes${s('freq',SX_FREQ.map(q=>[q[0],q[1]]),d.freq)}`}</label>
     <label>${_T`Format${s('format',SX_FORMATS.map(q=>[q[0],q[1]]),d.format)}`}</label><label>${F[2]===1?_T('The bout'):_T('The heats')}${s('ev',sxEvents(),d.ev)}</label>${F[2]>1?`<label>${_T`The final`} <span class="rc-sub">${_T`(for ${F[2]})`}</span>${s('finalEv',sxEvents().filter(([k])=>EVENTS[k].min<=F[2]&&EVENTS[k].max>=F[2]),D.stages[1].ev)}</label>`:''}
     <label>${_T`Your fighters invited ${n('slots',d.slots,1,2)}`}</label><label>${_T`Stars (difficulty) ${n('stars',d.stars,1,5)}`}</label>
     <label>${_T`Opponents rated from ${n('oppLo',d.oppLo,40,95)}`}</label><label>${_T`…up to ${n('oppHi',d.oppHi,40,99)}`}</label>
     <label>${_T`Winner's purse ${n('purse',d.purse,0,1200,20)}`}</label><label>${_T`Appearance fee ${n('appear',d.appear,0,60)}`}</label><label>${_T`Fame to the winner ${n('fame',d.fame,0,25)}`}</label>
     <label>${_T`Trophy${s('trophy',typeof trophyOptions==='function'?trophyOptions():[['',_T('No trophy')]],d.trophy||'')}`}</label>
     <label style="grid-column:1/-1">${_T`Blurb`}<textarea class="tin" data-sxf="blurb" maxlength="300" placeholder="${_T`What the invitation says…`}">${esc(d.blurb||'')}</textarea></label></div>
     <div class="chkgrid" style="margin-top:6px"><label class="chk"><input type="checkbox" data-sxf="fates" ${d.fates!==false?'checked':''}> ${_T`The Fate table applies`}</label></div>
     <div class="sect">${_T`🤝 Cohorts in this event`} <span class="rc-sub">${_T`their characters are invited into one heat; their beasts enter every heat`}</span></div>
     <div class="chkgrid">${pairs.map(Q=>`<label class="chk ${pairMembersOK(Q)?'dim':''}"><input type="checkbox" data-sxpair="${Q.id}" ${(d.pairs||[]).includes(Q.id)?'checked':''} ${pairMembersOK(Q)?'disabled':''}> ${Q.sys?'🏛 ':'✦ '}${esc(Q.name)}</label>`).join('')}</div>
     <div class="mbtns"><button class="btn primary" type="button" data-sx="save">${_T`💾 Save special event`}</button><button class="btn" type="button" data-sx="new">${_T`↺ A fresh one`}</button></div></div></div>
   <h4>${_T`Your special events · ${(CUSTOM.specials||[]).length}`}</h4>${(CUSTOM.specials||[]).length?`<div class="list2 one">${CUSTOM.specials.map(x=>{const Dx=sxDef(x);return `<div class="lrow"><span class="sxic">${esc(x.icon||'⭐')}</span><div class="t">${_T`<b>${esc(x.name)}</b> ${customTag()}<small>${esc((LOCATIONS[Dx.loc]||{}).n||'')} · ${starsHTML(Dx.stars)} · ${esc((SX_FREQ.find(q=>q[0]===x.freq)||SX_FREQ[2])[1])} · ${Dx.purse} purse${Dx.pairs.length?` · 🤝 ${Dx.pairs.length}`:''}</small>`}</div><div class="a">${crActs('sx',x)}</div></div>`}).join('')}</div>`:`<p class="rc-sub">${_T`None yet — the three system invitationals below keep the league busy meanwhile.`}</p>`}
   <h4>${_T`🏛 The system special events`} <span class="rc-sub">${_T`locked — copy one to make it yours`}</span></h4><div class="list2 one">${Object.entries(SPECIALS).map(([k,S0])=>`<div class="lrow"><span class="sxic">${S0.icon}</span><div class="t">${_T`<b>${esc(S0.n)}</b><small>${esc(S0.blurb)}</small><small>${starsHTML(S0.stars)} · ${S0.purse} purse · ${S0.rules.slice(0,2).map(esc).join(' · ')}</small>`}</div><div class="a">${sysActs(`data-sx="copysys" data-v="${k}"`)}</div></div>`).join('')}</div>
   <h3 class="sxh3">${_T`🤝 Cohorts`}</h3><p class="rc-sub" style="margin-top:0">${_T`Link characters and beasts — system or your own. A cohort can ride in a special event, join the <b>arena deck</b> as a card (📜 Add to the rolls on the cohort), and be placed in any custom event (Event Designer → Classes &amp; NPCs).`}</p>
   <div class="setup-grid" style="grid-template-columns:minmax(0,190px) minmax(0,1fr)"><div style="text-align:center"><img src="${pairCardURL(P)}" alt="${_T`The cohort card`}" style="width:170px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.5)"><div class="pxrow">${(P.members||[]).filter(Boolean).map(r=>pmTok(r,34)).join('')}</div></div>
    <div><div class="formgrid"><label>${_T`Name`}<input class="tin" data-pxf="name" value="${esc(P.name)}" maxlength="30" placeholder="${_T`e.g. The Twins of Capua`}"></label><label>${_T`Kind of pairing`}<select class="tin" data-pxf="type">${Object.entries(PAIR_TYPES).map(([k,v])=>`<option value="${k}" ${P.type===k?'selected':''}>${v[0]} — ${v[1]}</option>`).join('')}</select></label>
     ${P.type==='duo'?`<label>${_T`Their bond`}<select class="tin" data-pxf="rel">${PAIR_RELS.map(r=>`<option ${P.rel===r?'selected':''}>${esc(r)}</option>`).join('')}</select></label>`:''}
     ${Array.from({length:slots},(_,i)=>`<label>${_T`Member ${i+1}`}<select class="tin" data-pxm="${i}">${memOpts.map(([v,l])=>`<option value="${esc(v)}" ${(P.members||[])[i]===v?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`).join('')}
     <label style="grid-column:1/-1">${_T`Their story`}<input class="tin" data-pxf="blurb" value="${esc(P.blurb||'')}" maxlength="120"></label></div>
     ${pOK?`<p style="color:var(--blood2);margin:6px 0 0">${esc(pOK)}.</p>`:''}
     <div class="mbtns"><button class="btn primary" type="button" data-px="save" ${pOK?'disabled':''}>${_T`💾 Save pairing`}</button><button class="btn" type="button" data-px="new">${_T`↺ A fresh one`}</button></div></div></div>
   <h4>${_T`Your cohorts · ${(CUSTOM.pairings||[]).length}`}</h4>${(CUSTOM.pairings||[]).length?`<div class="list2 one">${CUSTOM.pairings.map(Q=>`<div class="lrow"><span class="pxrow">${(Q.members||[]).map(r=>pmTok(r,28)).join('')}</span><div class="t"><b>${esc(Q.name)}</b> ${customTag()}<small>${esc((PAIR_TYPES[Q.type]||PAIR_TYPES.duo)[0])}${Q.type==='duo'?' · '+esc(Q.rel):''}${Q.deck?_T(' · 🃏 in the arena deck'):''}${pairMembersOK(Q)?` · ⚠ ${esc(pairMembersOK(Q))}`:''}</small></div><div class="a">${crActs('px',Q)}</div></div>`).join('')}</div>`:`<p class="rc-sub">${_T`None yet.`}</p>`}
   <h4>${_T`🏛 The system cohorts`} <span class="rc-sub">${_T`locked — copy one to make it yours`}</span></h4><div class="list2 one">${SYS_PAIRINGS.map(Q=>`<div class="lrow"><span class="pxrow">${Q.members.map(r=>pmTok(r,28)).join('')}</span><div class="t"><b>${esc(Q.name)}</b><small>${esc(PAIR_TYPES[Q.type][0])}${Q.type==='duo'?' · '+esc(Q.rel):''} · ${esc(Q.blurb)}</small></div><div class="a">${sysActs(`data-px="copysys" data-v="${Q.id}"`,{rolls:false})}</div></div>`).join('')}</div>`}
if(typeof CR_KINDS!=='undefined'){
  CR_KINDS.sx={list:()=>CUSTOM.specials||[],set:v=>{CUSTOM.specials=v},store:'customSpecials',nm:'specials',rolls:_T('Manager mode’s invitations'),
    on:x=>x.freq!=='off',toggle:x=>{x.freq=x.freq==='off'?'occasional':'off'},edit:x=>{ST.sxd=JSON.parse(JSON.stringify(x))}};
  CR_KINDS.px={list:()=>CUSTOM.pairings||[],set:v=>{CUSTOM.pairings=v},store:'customPairings',nm:'pairings',rolls:_T('the arena deck'),nm2:'cohorts',
    on:x=>!!x.deck,toggle:x=>{x.deck=!x.deck},edit:x=>{ST.pxd=JSON.parse(JSON.stringify(x))},after:()=>pairRegister()}}

/* ---------------- wiring (the studio's own handlers run on #mBody; these run first, on the document) ---------------- */
async function sxSave(){const d=ST.sxd;if(!String(d.name).trim())d.name='Special event';if(!nameGuard('specials',d,'[data-sxf="name"]'))return;
  CUSTOM.specials=[...(CUSTOM.specials||[]).filter(x=>x.id!==d.id),JSON.parse(JSON.stringify(d))].sort(byName);await Store.put('customSpecials',d.id,d).catch(()=>{});if(typeof mToast==='function')mToast(_T`⭐ <b>${esc(d.name)}</b> is in the calendar’s drawer${d.freq==='off'?_T(' (off — not sent)'):''}.`)}
async function pxSave(){const P=ST.pxd;if(pairMembersOK(P))return;if(!String(P.name).trim())P.name='Pairing';if(!nameGuard('pairings',P,'[data-pxf="name"]'))return;P.members=(P.members||[]).filter(Boolean);
  CUSTOM.pairings=[...(CUSTOM.pairings||[]).filter(x=>x.id!==P.id),JSON.parse(JSON.stringify(P))].sort(byName);await Store.put('customPairings',P.id,P).catch(()=>{});pairRegister();if(typeof mToast==='function')mToast(_T`🤝 Cohort <b>${esc(P.name)}</b> saved.`)}
async function rsSave(){const d=ST.rsd;if(!String(d.name).trim())d.name='My roster';if(!nameGuard('rosters',d,'[data-rsf="name"]'))return;
  CUSTOM.rosters=[...(CUSTOM.rosters||[]).filter(x=>x.id!==d.id),JSON.parse(JSON.stringify(d))].sort(byName);await Store.put('rosterSets',d.id,d).catch(()=>{});if(typeof mToast==='function')mToast(_T`📚 Roster set <b>${esc(d.name)}</b> saved — pick it when you found a career or on the New event screen.`)}
document.addEventListener('click',async e=>{if(typeof ST==='undefined')return;const b=e.target.closest('[data-sx],[data-px],[data-rs],[data-srx],[data-pbfmt]');if(!b||!document.getElementById('studio')||!document.getElementById('studio').contains(b))return;e.stopPropagation();
  if(b.dataset.pbfmt){ST.fd.fmt=b.dataset.pbfmt==='portrait'?'portrait':undefined;studioRedraw();return}
  if(b.dataset.srx){const d=ST.draft;if(!d)return;const a=b.dataset.srx;if(a==='make'||a==='rand'){d.srp=srBlank();if(!d.srName)d.srName=genName()}if(a==='clear')delete d.srp;const pane=document.getElementById('edPane');if(pane){const box=$('#mBody'),sc=box.scrollTop;pane.innerHTML=edRulesHTML();box.scrollTop=sc}return}
  if(b.dataset.sx){const a=b.dataset.sx;if(a==='new')ST.sxd=sxBlank();if(a==='save')await sxSave();
    if(a==='copysys'){const S0=SPECIALS[b.dataset.v];const x=sxBlank();const fm=S0.kind==='single'?'single':S0.stages[0].heats>=4?'bracket4':'bracket2';
      Object.assign(x,{name:S0.n+' (copy)',icon:S0.icon,loc:S0.loc||Math.max(1,LOCATIONS.findIndex(L=>L&&L.n===S0.locName)),format:fm,ev:S0.stages[0].ev,finalEv:(S0.stages[1]||S0.stages[0]).ev,slots:S0.slots,oppLo:S0.opp[0],oppHi:S0.opp[1],stars:S0.stars,purse:S0.purse,appear:S0.appear,fame:S0.fame,trophy:S0.trophy||'',blurb:S0.blurb});
      if(nameClash('specials',x.name))x.name=nameSuggest('specials',x.name);ST.sxd=x;if(typeof mToast==='function')mToast(_T`⧉ <b>${esc(x.name)}</b> is on the bench — save it to keep it.`)}
    studioRedraw();return}
  if(b.dataset.px){const a=b.dataset.px;if(a==='new')ST.pxd=pairBlank();if(a==='save')await pxSave();
    if(a==='copysys'){const Q=SYS_PAIRINGS.find(q=>q.id===b.dataset.v);const x={...JSON.parse(JSON.stringify(Q)),id:'px'+Date.now().toString(36),sys:undefined,name:Q.name+' (copy)',deck:false};if(nameClash('pairings',x.name))x.name=nameSuggest('pairings',x.name);ST.pxd=x;if(typeof mToast==='function')mToast(_T`⧉ <b>${esc(x.name)}</b> is on the bench — save it to keep it.`)}
    studioRedraw();return}
  if(b.dataset.rs){const a=b.dataset.rs,v=b.dataset.v;const d=ST.rsd||(ST.rsd=rsBlank());
    if(a==='tab')ST.rsTab=v;if(a==='new')ST.rsd=rsBlank();if(a==='save')await rsSave();
    if(a==='all'||a==='none'){const t=ST.rsTab||'chars';d.sel[t]=a==='all'?rsItems(t).mine.filter(m=>!m[3]).map(m=>m[0]):[]}
    if(a==='edit'){const r=(CUSTOM.rosters||[]).find(x=>x.id===v);if(r&&!r.locked)ST.rsd=JSON.parse(JSON.stringify(r))}
    if(a==='copy'){const r=rosterById(v);const x=rsBlank();if(r.id==='rolls'){x.sel.chars=(CUSTOM.chars||[]).filter(onRolls).map(c=>c.id);x.sel.weapons=(CUSTOM.weapons||[]).filter(c=>c.rolls&&(c.rolls.market||c.rolls.loadout)).map(c=>c.id);x.sel.armor=(CUSTOM.armor||[]).filter(c=>c.rolls&&(c.rolls.market||c.rolls.loadout)).map(c=>c.id);x.sel.flags=(CUSTOM.flags||[]).filter(f=>f.rack!==false).map(f=>f.id);x.sel.trophies=(CUSTOM.trophies||[]).filter(t=>t.offered!==false).map(t=>t.id);x.sel.sponsors=(CUSTOM.sponsors||[]).filter(t=>t.offered!==false).map(t=>t.id);x.sel.specials=(CUSTOM.specials||[]).filter(s=>s.freq!=='off').map(s=>s.id);x.sel.pairs=(CUSTOM.pairings||[]).filter(p=>p.deck).map(p=>p.id);x.sel.events=(CUSTOM.events||[]).map(e=>e.id);x.sel.npcs=(CUSTOM.npcs||[]).map(n=>n.id)}
      else if(r.sel)x.sel=JSON.parse(JSON.stringify(r.sel));x.name=r.name.replace(/ — .*/,'')+' (copy)';if(nameClash('rosters',x.name))x.name=nameSuggest('rosters',x.name);ST.rsd=x}
    if(a==='del'){const r=(CUSTOM.rosters||[]).find(x=>x.id===v);if(r&&!r.locked){CUSTOM.rosters=CUSTOM.rosters.filter(x=>x.id!==v);await Store.del('rosterSets',v).catch(()=>{});if(CFG.roster===v){CFG.roster='classic';try{localStorage.setItem('flavius_roster_play','classic')}catch(err){}}}}
    if(a==='lock'){const r=(CUSTOM.rosters||[]).find(x=>x.id===v);if(r){r.locked=!r.locked;await Store.put('rosterSets',r.id,r).catch(()=>{})}}
    if(a==='useplay'){CFG.roster=v;try{localStorage.setItem('flavius_roster_play',v)}catch(err){}if(typeof mToast==='function')mToast(_T`📚 New event will use <b>${esc(rosterById(v).name)}</b>.`)}
    studioRedraw();return}},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||typeof ST==='undefined')return;
  if(t.dataset.sxf!=null&&ST.sxd){const k=t.dataset.sxf;ST.sxd[k]=t.type==='checkbox'?t.checked:t.type==='range'?+t.value:t.value;if(t.nextElementSibling&&t.nextElementSibling.tagName==='OUTPUT')t.nextElementSibling.textContent=t.value;return}
  if(t.dataset.pxf!=null&&ST.pxd&&t.tagName==='INPUT'){ST.pxd[t.dataset.pxf]=t.value;return}
  if(t.dataset.rsf!=null&&ST.rsd){ST.rsd[t.dataset.rsf]=t.value;return}
  if(t.dataset.f&&/^(srName|srColor)$/.test(t.dataset.f)&&ST.draft){ST.draft[t.dataset.f]=t.value;srPrevRefresh()}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||typeof ST==='undefined'||!document.getElementById('studio'))return;
  if(t.dataset.sxf!=null&&ST.sxd){const k=t.dataset.sxf;ST.sxd[k]=t.type==='checkbox'?t.checked:t.type==='range'?+t.value:t.tagName==='SELECT'&&['loc'].includes(k)?+t.value:t.value;if(t.type!=='text'&&t.tagName!=='TEXTAREA')studioRedraw();return}
  if(t.dataset.sxpair!=null&&ST.sxd){const id=t.dataset.sxpair;ST.sxd.pairs=t.checked?[...new Set([...(ST.sxd.pairs||[]),id])]:(ST.sxd.pairs||[]).filter(x=>x!==id);studioRedraw();return}
  if(t.dataset.pxf!=null&&ST.pxd){ST.pxd[t.dataset.pxf]=t.value;if(t.dataset.pxf==='type'){const T=PAIR_TYPES[t.value];ST.pxd.members=(ST.pxd.members||[]).slice(0,T[3])}if(t.tagName==='SELECT')studioRedraw();return}
  if(t.dataset.pxm!=null&&ST.pxd){const i=+t.dataset.pxm;ST.pxd.members=ST.pxd.members||[];ST.pxd.members[i]=t.value;studioRedraw();return}
  if(t.dataset.rsk!=null&&ST.rsd){const k=ST.rsTab||'chars';const id=t.dataset.rsk;const L=new Set(ST.rsd.sel[k]||[]);if(t.checked)L.add(id);else L.delete(id);ST.rsd.sel[k]=[...L];studioRedraw();return}
  if(t.dataset.f&&t.dataset.f.startsWith('srp.')&&ST.draft){setTimeout(srPrevRefresh,0)}},true);

/* ---------------- the Event Designer: pairings in a custom event ---------------- */
{const _ro=edRosterHTML;edRosterHTML=function(){const e=ST.draft;const P=allPairings().filter(Q=>!pairMembersOK(Q));
  return _ro()+`<h4>${_T`🤝 Cohorts`} <span class="rc-sub" style="font-weight:400">${_T`their beasts enter with the pompa; characters of a cohort who are on the sand share the crowd's love of the story`}</span></h4><div class="chkgrid">${P.map(Q=>`<label class="chk"><input type="checkbox" data-edpair="${Q.id}" ${(e.pairs||[]).includes(Q.id)?'checked':''}> ${Q.sys?'🏛 ':'✦ '}${esc(Q.name)} <span class="rc-sub">${(Q.members||[]).map(r=>(pmParse(r)||{}).name).join(', ')}</span></label>`).join('')||_T('<span class="rc-sub">Make cohorts under Fighters → 🤝 Cohorts.</span>')}</div>`}}
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.edpair!=null&&typeof ST!=='undefined'&&ST.draft){const id=t.dataset.edpair;ST.draft.pairs=t.checked?[...new Set([...(ST.draft.pairs||[]),id])]:(ST.draft.pairs||[]).filter(x=>x!==id);e.stopPropagation()}},true);

/* ---------------- All creations: the new kinds too ---------------- */
function allRowsExtra(){return [...(CUSTOM.specials||[]).map(x=>({t:_T('Special event'),k:'specials',id:x.id,icon:`<span style="font-size:18px">${esc(x.icon||'⭐')}</span>`,n:x.name,d:_T`${esc((SX_FREQ.find(q=>q[0]===x.freq)||SX_FREQ[2])[1])} · ${x.purse||0} purse`,s:x.freq!=='off'?_T('📜 On the rolls'):_T('✎ Design only'),u:''})),
  ...(CUSTOM.pairings||[]).map(P=>({t:_T('Pairing'),k:'pairings',id:P.id,icon:'<span style="font-size:18px">🤝</span>',n:P.name,d:`${esc((PAIR_TYPES[P.type]||PAIR_TYPES.duo)[0])} · ${(P.members||[]).map(r=>esc((pmParse(r)||{}).name||'?')).join(', ')}`,s:P.deck?_T('🃏 In the arena deck'):'',u:''})),
  ...(CUSTOM.rosters||[]).map(R=>({t:_T('Roster set'),k:'rosters',id:R.id,icon:'<span style="font-size:18px">📚</span>',n:R.name,d:esc(rosterSummary(R)),s:R.locked?'🔒 locked':'',u:''}))]}

/* the built-in silverware: locked, copy onto the bench */
document.addEventListener('click',e=>{const b=e.target.closest('[data-trsys]');if(!b||typeof ST==='undefined')return;e.stopPropagation();const x=(typeof TROPHY_LIB!=='undefined'?TROPHY_LIB:[]).find(t=>t.id===b.dataset.trsys);if(!x)return;
  const y=JSON.parse(JSON.stringify(x));y.id='t'+Date.now().toString(36);y.name=x.name+' (copy)';y.custom=true;y.locked=false;if(nameClash('trophies',y.name))y.name=nameSuggest('trophies',y.name);ST.trd=y;studioRedraw();
  const box=$('#mBody');if(box)box.scrollTop=0;if(typeof mToast==='function')mToast(_T`⧉ <b>${esc(y.name)}</b> is on the bench — save it to keep it.`)},true);
