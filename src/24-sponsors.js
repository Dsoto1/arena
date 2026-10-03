/* =====================================================================
   24-SPONSORS · THE FACE IN THE BOX (v0.28)
   =====================================================================
   The framed portrait over the A-1 corner is the games' SPONSOR. Flavius sponsors every arena to begin
   with; win a match (as a human, not a simulation) at a city and that city's own patron takes over there.
   Win at all twelve and the Sponsor creator opens in the Creator Studio. Settings → Sponsors picks who
   sponsors each city; the Event Designer can name a sponsor for a custom event.
   ===================================================================== */
const SPONSOR_FLAVIUS={id:'flavius',name:'Flavius',short:'Flavius',title:'Editor of the games, lord of the sand',city:'Roma',skin:'#e0ac7e',hair:'#2a1c12',beard:'full',head:'laurel',robe:'#5a3566',trim:'#e8dcc0',bg:'#4a2a52',bg2:'#2a1830',gem:'#c0433a',acc:'goblet',voice:'flavius',long:false};
// one patron per city (index = LOCATIONS index); Roma is Flavius's own
const CITY_SPONSORS={
  1:{name:'Archias the Shipwright',short:'Archias',title:'Builder of the grain fleet',skin:'#d8a47a',hair:'#bcbcbc',beard:'long',head:'none',robe:'#2e5a8a',trim:'#d9e2ea',bg:'#1c3a5a',bg2:'#0e1e30',gem:'#5fc7c0',acc:'scroll',voice:'merchant'},
  2:{name:'Lady Aurelia of Verona',short:'Aurelia',title:'Patroness of the northern games',skin:'#f0c9a6',hair:'#7a3b1a',beard:'none',long:true,head:'diadem',robe:'#7a1f3a',trim:'#f0d7a0',bg:'#5a1f35',bg2:'#2a0f1a',gem:'#5fc7c0',acc:'fan',voice:'noble'},
  3:{name:'Gaius Tolosanus',short:'Tolosanus',title:'Veteran of the Fourth Legion',skin:'#c98e62',hair:'#5a4a3a',beard:'short',head:'helm',robe:'#6b4a2a',trim:'#c9a458',bg:'#3a2a1a',bg2:'#1a120a',gem:'#c0433a',acc:'goblet',voice:'soldier'},
  4:{name:'Batiatus the Younger',short:'Batiatus',title:'Heir to the oldest ludus in Capua',skin:'#dcae88',hair:'#1a1410',beard:'short',head:'none',robe:'#2e2e2e',trim:'#c9a458',bg:'#2a2418',bg2:'#120f0a',gem:'#e6b93a',acc:'coins',voice:'merchant'},
  5:{name:'The Oracle of Tanit',short:'Oracle',title:'Voice of the goddess in Thysdrus',skin:'#9a6a48',hair:'#101010',beard:'none',long:true,head:'hood',robe:'#c28a2a',trim:'#3a2a10',bg:'#3a2a0a',bg2:'#1a1204',gem:'#5fc7c0',acc:'scroll',voice:'priest'},
  7:{name:'Marcus Celer',short:'Celer',title:'Prince of the chariot circus',skin:'#e2b48c',hair:'#3a2a1a',beard:'none',head:'helm',robe:'#2e6a3a',trim:'#e8dcc0',bg:'#1c3a24',bg2:'#0a1a10',gem:'#4f9a57',acc:'goblet',voice:'showman'},
  8:{name:'Julia Felicitas',short:'Julia',title:'Owner of the finest baths in Pompeii',skin:'#f2cfae',hair:'#2a1a10',beard:'none',long:true,head:'flowers',robe:'#b04a6a',trim:'#f0e0c0',bg:'#5a2a3a',bg2:'#2a1018',gem:'#e07b9a',acc:'fan',voice:'noble'},
  9:{name:'Septimus of Leptis',short:'Septimus',title:'Son of Africa, friend of emperors',skin:'#7a4e30',hair:'#141010',beard:'full',head:'laurel',robe:'#8a2a2a',trim:'#e6b93a',bg:'#4a1a12',bg2:'#200a06',gem:'#e6b93a',acc:'goblet',voice:'noble'},
  10:{name:'Hanno the Lyre-Keeper',short:'Hanno',title:'Poet of Uthina',skin:'#a87450',hair:'#2a1a10',beard:'short',head:'turban',robe:'#1f6a6a',trim:'#e8dcc0',bg:'#10363a',bg2:'#061a1c',gem:'#f0cf7d',acc:'scroll',voice:'poet'},
  11:{name:'Mother Histria',short:'Histria',title:'Keeper of the Pola fish market',skin:'#e0b090',hair:'#cfcfcf',beard:'none',long:true,head:'hood',robe:'#3a4a5a',trim:'#c9ccd3',bg:'#243240',bg2:'#10181f',gem:'#8fc3ea',acc:'coins',voice:'crone'},
  12:{name:'Tiberius Mercator',short:'Mercator',title:'Harbor-master of Puteoli',skin:'#d9a07a',hair:'#3a2a20',beard:'full',head:'none',robe:'#1e2e4e',trim:'#c9a458',bg:'#141e34',bg2:'#080c18',gem:'#e6b93a',acc:'coins',voice:'merchant'}};
for(const [li,sp] of Object.entries(CITY_SPONSORS)){sp.id='city:'+li;sp.li=+li;sp.city=LOCATIONS[li]?LOCATIONS[li].n:''}
const SPONSOR_VOICES={
  merchant:{pleased:['Good for business.','The ledger smiles.','Worth every denarius.'],laugh:['Ha! Put that on a poster!','Profit AND blood!'],cheer:['SOLD! To the crowd!','That is a season ticket, right there!','Magnificent returns!'],angry:['I am paying for THIS?','Refunds. Everyone wants refunds.','Fight or I sell you to the mines.'],
    facepalm:['There goes my margin.','Who scouted this one?'],shock:['My insurance!','The masonry is NOT cheap!'],bored:['Time is money. This is neither.','Wake me when it pays.'],smug:['As I invested.','Bought low, cheering high.'],weep:['I will name a ship after this one.','Priceless. And I know prices.']},
  noble:{pleased:['How very fine.','Charming.','Yes, that will do.'],laugh:['Oh! How deliciously vulgar!','Darling, did you SEE that?'],cheer:['Bravo! BRAVO!','Magnificent!','Throw them roses!'],angry:['Dreadful. Simply dreadful.','Do they not know who is watching?'],
    facepalm:['How tiresome.','Someone fetch my smelling salts.'],shock:['Good heavens!','My dear!'],bored:['I have seen more passion at a tax hearing.','Is it over yet?'],smug:['I did say so.','Naturally.'],weep:['Oh, my heart…','I shall weep at dinner.']},
  soldier:{pleased:['Solid work.','Good form.','Keep the shield up.'],laugh:['HA! Like the Rhine campaign!','That one would have made centurion!'],cheer:['FOR ROME!','THAT is a soldier!','Hold the line — no, take it!'],angry:['Discipline, you dogs!','My recruits fight harder asleep.'],
    facepalm:['Sloppy.','Who trained this rabble?'],shock:['Ambush!','By Mars!'],bored:['March faster.','I have stood night watches with more excitement.'],smug:['Textbook.','As drilled.'],weep:['A good death.','The legion salutes you.']},
  priest:{pleased:['The goddess approves.','A fair omen.'],laugh:['Even the gods laugh!','Tanit is amused!'],cheer:['The heavens roar!','An offering worthy of the altar!'],angry:['You insult the gods!','The omens darken!'],
    facepalm:['The entrails warned me.','Sacrilege.'],shock:['A sign!','The birds fly left!'],bored:['The gods grow restless.','Even the sacred chickens are asleep.'],smug:['It was foretold.','I read it in the smoke.'],weep:['The gods receive you.','Go with the goddess.']},
  poet:{pleased:['A fine stanza.','Almost… lyrical.'],laugh:['Comedy! Pure comedy!','I shall write a satire!'],cheer:['Sing, O Muse!','An epic in a single blow!','Odes! I need more tablets!'],angry:['Where is the drama?','This scene needs rewriting.'],
    facepalm:['Clumsy prose.','A tragedy, and not the good kind.'],shock:['What a twist!','Not in my draft!'],bored:['Too long, too dull.','Cut this act.'],smug:['I foresaw the ending.','Rhymes with glory.'],weep:['Such pathos…','I shall write your elegy.']},
  showman:{pleased:['Nice move!','The crowd likes that.'],laugh:['What a SHOW!','Crash! Beautiful!'],cheer:['WHAT A RACE!','ON YOUR FEET, NEMAUSUS!','A lap of honor!'],angry:['BORING! Faster!','Give them a show!'],
    facepalm:['Rookie mistake.','Who taught them to steer?'],shock:['Whoa-ho!','Mind the wall!'],bored:['I have seen livelier mules.','Pick up the pace!'],smug:['Called it.','All according to the script.'],weep:['A legend of the circus.','They will sing of this lap.']},
  crone:{pleased:['Not bad, dearie.','Fresh as the morning catch.'],laugh:['Hee hee! Serves him right!','Oh, I needed that!'],cheer:['Gut him like a mackerel!','THAT is my kind of fishing!'],angry:['Soft as week-old squid.','My grandsons hit harder.'],
    facepalm:['Oh, for Neptune’s sake.','Seen better at the market.'],shock:['Mind my stall!','Well I never!'],bored:['Wake me for the gutting.','Slow as a Pola tide.'],smug:['Told you so, didn’t I?','Old Histria knows.'],weep:['Poor lamb.','The sea takes them all, in the end.']}};
const SPON_KEY='flavius_sponsors';let SPON={map:{}};try{SPON=JSON.parse(localStorage.getItem(SPON_KEY)||'null')||{map:{}}}catch(e){SPON={map:{}}}
const sponSave=()=>{try{localStorage.setItem(SPON_KEY,JSON.stringify(SPON))}catch(e){}};
let HALL_LOCS=[];async function sponsorsRefresh(){try{const h=await Store.getDoc('hall','progress');HALL_LOCS=(h&&h.locs)||[]}catch(e){}}
setTimeout(()=>{sponsorsRefresh();if(typeof CUSTOM!=='undefined')loadSponsors()},750);
async function loadSponsors(){try{CUSTOM.sponsors=(await Store.list('customSponsors')).sort((a,b)=>String(a.name).localeCompare(b.name))}catch(e){CUSTOM.sponsors=CUSTOM.sponsors||[]}}
/* v0.36 THE DEVELOPER'S KEY: seven clicks on the version badge ask for a passphrase; the right one opens
   the Editor creator and every city editor without winning anywhere. Kept in this browser; re-lock in Settings → Editors. */
const DEV_KEY=()=>{try{return localStorage.getItem('flavius_devEditor')==='1'}catch(e){return false}};
const cityUnlocked=li=>+li===6||DEV_KEY()||HALL_LOCS.includes(+li);
const creatorUnlocked=()=>DEV_KEY()||LOCATIONS.every((L,i)=>!L||HALL_LOCS.includes(i));
/* v0.41 THE CURTAIN'S WORD: ONE click on the version badge opens a single box for every code, now and later.
   Register a code with cheatRegister(cheatKey-hash, run, 'label') — compute the hash once, offline; run() returns the message to show. */
const CHEATS={};
const cheatKey=w=>'h'+hashStr('code:'+String(w).trim().toUpperCase()); // codes are kept as hashes — the words never appear in the page source
function cheatRegister(key,run,label){CHEATS[key]={run,label:label||''}}
cheatRegister('h891493828',()=>{if(DEV_KEY())return '🔑 The developer\u2019s key is already turned. Re-lock it in Settings → Editors.';try{localStorage.setItem('flavius_devEditor','1')}catch(err){}return '🔑 <b>Unlocked.</b> The Editor creator and every city editor are yours — Creator Studio → 🎭 Editors.'},'The developer\u2019s key');
cheatRegister('h2501629703',()=>{try{localStorage.setItem('flavius_musica','1')}catch(e){}try{if(typeof audListRefresh==='function'){const el=document.getElementById('audTracks');if(el)el.innerHTML=audListHTML()}}catch(e){}return '🎶 <b>MUSICA.</b> All sixteen themes are yours — the twelve cities and the four others. Settings → Audio.'},'All sixteen themes');
cheatRegister('h3429076038',()=>{const w=typeof ACTIVE!=='undefined'&&ACTIVE.world||typeof MGR!=='undefined'&&MGR.world;if(typeof MGR!=='undefined'&&MGR.world&&typeof me==='function'&&me()){me().coin+=50;try{saveWorld(true)}catch(e){}return `💰 <b>LUDUS.</b> +50 coin in ${esc(me().ludus)}'s treasury.`}
  if(typeof applyActivePurse==='function'&&typeof getPurse==='function'){getPurse().then(p=>{if(!p){if(typeof mToast==='function')mToast('No lanista holds the wallet yet — open Manager mode first.');return}p.coin+=50;p.noBet=true;return setPurse(p)}).catch(()=>{});return '💰 <b>LUDUS.</b> +50 coin in the active wallet\u2019s treasury.'}
  return 'No ludus to pay — open Manager mode first.'},'+50 coin');
/* v0.45: the words themselves, for the strategy guide — kept scrambled in the source and only spelled out when the player asks */
const CHEAT_SHOW=[[[76,75,80,91,86,89,56,57],'🔑 Every city editor and the Editor creator unlocked without the need to win in each city'],[[84,92,90,80,74,72,56,61],'🎶 All sixteen themes in Settings → Audio — the twelve cities and the four others'],[[83,92,75,92,90,60,55],'💰 +50 coin to your ludus treasury (or the active wallet) — as often as you like']];
function cheatsGuideHTML(){return `<h4>🔑 Words of power</h4><p class="rc-sub" style="margin:0 0 6px">Cheats. Press <b>C</b> on the main menu and speak one. They stay hidden until you ask.</p>
  <div class="cheatbox"><button class="btn primary" type="button" data-cheatshow="1">🔑 Reveal the words</button><div class="cheatlist" hidden></div></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-cheatshow]');if(!b)return;const box=b.parentElement.querySelector('.cheatlist');if(!box)return;
  if(!box.hidden){box.hidden=true;box.innerHTML='';b.textContent='🔑 Reveal the words';return}
  box.innerHTML=CHEAT_SHOW.map(([c,d])=>`<div class="cheatrow"><code>${esc(String.fromCharCode(...c.map(x=>x-7)))}</code><span>${d}</span></div>`).join('');box.hidden=false;b.textContent='🙈 Hide them again'});
async function cheatPrompt(){if(typeof modalBusy==='function'&&modalBusy())return;
  const v=await modal('🔑 A voice from behind the curtain','<p>“Speak the word, and doors open.”</p><input type="text" id="devPass" class="tin" autocomplete="off" autocapitalize="characters" spellcheck="false" style="width:100%" placeholder="a word of power">',[{label:'Speak it',value:'go',primary:1},{label:'Cancel',value:null}],{close:null,onOpen:()=>{const i=document.getElementById('devPass');if(i){i.focus();i.addEventListener('keydown',k=>{if(k.key==='Enter'){const b2=document.querySelector('#mBtns [data-mi="0"]');if(b2)b2.click()}})}}});
  const word=((document.getElementById('devPass')||{}).value||'').trim().toUpperCase();
  if(v!=='go'||!word)return;const C=CHEATS[cheatKey(word)];
  const msg=C?C.run():'The curtain stays closed.';if(typeof mToast==='function')mToast(msg);try{if(typeof render==='function')render()}catch(e){}}
{const ed=document.querySelector('.brand .ed');if(ed){ed.setAttribute('role','button');ed.tabIndex=0;ed.title='Version — click to speak a word of power';
  ed.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();cheatPrompt()});ed.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();cheatPrompt()}})}}
function sponsorById(id){if(!id||id==='flavius')return SPONSOR_FLAVIUS;if(String(id).startsWith('city:'))return CITY_SPONSORS[+id.slice(5)]||SPONSOR_FLAVIUS;return ((typeof CUSTOM!=='undefined'&&CUSTOM.sponsors)||[]).find(s=>s.id===id)||SPONSOR_FLAVIUS}
function sponsorForLoc(li){const set=SPON.map[li];if(set){if(set==='flavius')return 'flavius';if(set.startsWith('city:')&&cityUnlocked(+set.slice(5)))return set;if(!set.startsWith('city:')&&sponsorById(set)!==SPONSOR_FLAVIUS)return set}
  return 'flavius'} /* v0.45: an unlocked editor presides only once you seat them (Settings → Editors); until then it is Flavius */
/* v0.43: whoever edits today's games is the one who rises, laughs and turns a thumb */
const edName=()=>{try{const sp=curSponsor();return sp&&sp!==SPONSOR_FLAVIUS&&(sp.short||sp.name)?String(sp.short||sp.name):'Flavius'}catch(e){return 'Flavius'}};
function curSponsor(){if(S&&S.sponsorId)return sponsorById(S.sponsorId);return sponsorById(sponsorForLoc(S&&S.locIdx!=null?S.locIdx:6))}
function sponsorVoice(){const sp=curSponsor();const V=SPONSOR_VOICES[sp.voice]||FLAV_LINES;const out={...V};if(sp.lines){for(const [k,v] of Object.entries(sp.lines))if(v)out[k]=[...(out[k]||[]),v,v]}return out}
function sponsorOptions(){const o=[['','The city’s seated editor (default)'],['flavius','Flavius']];for(const [li,sp] of Object.entries(CITY_SPONSORS))if(cityUnlocked(li))o.push([sp.id,`${sp.name} (${sp.city})`]);for(const s of ((typeof CUSTOM!=='undefined'&&CUSTOM.sponsors)||[]))o.push([s.id,`✦ ${s.name}`]);return o}
// the games begin: who is paying for them today?
function sponsorStart(cfg){if(!S)return;const ev=EV();S.sponsorId=ev&&ev.custom&&ev.sponsor?ev.sponsor:sponsorForLoc(cfg.loc);
  if(!HEADLESS&&!S.sim&&S.sponsorId!=='flavius'){const sp=sponsorById(S.sponsorId);later(()=>log(`🎭 Today's games are given by <b>${esc(sp.name)}</b>, editor of the games${sp.title?`, ${esc(sp.title)}`:''}.`,'thought'),0)}}
// after an event: a human win at a new city unlocks its patron
async function sponsorAfterEvent(hall){const before=new Set(HALL_LOCS);HALL_LOCS=(hall&&hall.locs)||HALL_LOCS;
  for(const li of HALL_LOCS)if(!before.has(li)&&CITY_SPONSORS[li]&&typeof mToast==='function'){const sp=CITY_SPONSORS[li];setTimeout(()=>mToast(`🎭 <b>${esc(sp.name)}</b>, editor of ${esc(sp.city)}, is unlocked — seat them in Settings → Editors to have them give the games there`),1600)}
  if(before.size<12&&creatorUnlocked()&&typeof mToast==='function')setTimeout(()=>mToast('🎭 You have won in all twelve cities — the <b>Editor creator</b> is open in the Creator Studio!'),3400)}
const sponImg=(sp,mood='calm')=>`<img class="sponimg" src="${flavFaceURL(mood,sp)}" alt="${esc(sp.name)}">`;
function sponsorSettingsHTML(){const n=LOCATIONS.filter((L,i)=>L&&HALL_LOCS.includes(i)).length;
  return `${DEV_KEY()?`<div class="card2" style="margin-bottom:8px;border-color:var(--gold)">🔑 <b>Developer\u2019s key turned</b> — every editor and the Editor creator are open regardless of wins. <button class="btn tksm" type="button" onclick="try{localStorage.removeItem('flavius_devEditor')}catch(e){};openSettings('sponsors')">Re-lock</button></div>`:''}<p>The <b>editor of the games</b> is the face in the framed box over the arena — the one who pays for the games, and the rulebook's own word for them. Flavius edits every city's games to begin with; <b>win a match as a human player</b> at a city and its own editor is <b>unlocked</b> — pick them for that city below to seat them in the box (and their name replaces Flavius in the herald’s lines). Win at all twelve and the <b>Editor creator</b> opens in the Creator Studio. <span class="rc-sub">(${n}/12 cities won)</span></p>
   <div class="sponlist">${LOCATIONS.map((L,li)=>{if(!L)return '';const cur=sponsorById(sponsorForLoc(li));const u=CITY_SPONSORS[li];const unl=cityUnlocked(li);
     return `<div class="sponrow">${sponImg(cur)}<div><b>${esc(L.n)}</b> <span class="rc-sub">· ${esc(cur.name)}</span>${u?(unl?(cur.id!==u.id?`<div class="rc-sub">editor: ${esc(u.name)}</div>`:''):'<div class="rc-sub">🔒 this city\u2019s editor unlocks when you win here</div>'):'<div class="rc-sub">Flavius’s own city</div>'}
       <select data-spcity="${li}" style="margin-top:4px;max-width:100%">${[['','Default (Flavius)'],['flavius','Flavius'],...(u?[[u.id,unl?u.name:'🔒 '+u.name]]:[]),...((CUSTOM.sponsors||[]).filter(s=>s.offered!==false).map(s=>[s.id,'✦ '+s.name]))].map(([k,l])=>`<option value="${k}" ${(SPON.map[li]||'')===k?'selected':''} ${k===(u&&u.id)&&!unl?'disabled':''}>${esc(l)}</option>`).join('')}</select></div></div>`}).join('')}</div>`}
function sponsorSettingsChange(t){if(t.dataset.spcity==null)return false;const li=+t.dataset.spcity;if(t.value)SPON.map[li]=t.value;else delete SPON.map[li];sponSave();return true}

/* ---------------- Creator Studio → Sponsors ---------------- */
function blankSponsor(){return {id:'cs'+Date.now().toString(36),name:'',short:'',title:'',skin:'#d9a07a',hair:'#2a1c12',beard:'full',long:false,head:'laurel',robe:'#5a3566',trim:'#e8dcc0',bg:'#4a2a52',bg2:'#2a1830',gem:'#c0433a',acc:'goblet',voice:'flavius',lines:{cheer:'',angry:''},custom:true,v:1}}
function sponsorStudioHTML(){
  if(!creatorUnlocked()){const won=new Set(HALL_LOCS);return `<div class="card2 lockcard"><div style="font-size:40px">🔒🎭</div><h4 style="margin:4px 0">The Editor creator is locked</h4>
    <p>Win one match <b>as a human player</b> (not a simulation) in <b>every one of the twelve cities</b> to open it. Each win also seats that city's own editor in the box.</p>
    <div class="spongrid">${LOCATIONS.map((L,i)=>L?`<span class="badge ${won.has(i)?'gold':''}">${won.has(i)?'✓':'·'} ${esc(L.n)}</span>`:'').join('')}</div></div>
    <h4>The editors of the empire</h4><div class="sponlist">${[SPONSOR_FLAVIUS,...Object.values(CITY_SPONSORS)].map(sp=>`<div class="sponrow">${sponImg(sp)}<div><b>${esc(sp.name)}</b><div class="rc-sub">${esc(sp.title||'')} · ${esc(sp.city||'')}</div><div class="rc-sub">${sp.id==='flavius'||cityUnlocked(sp.li)?'unlocked':'🔒 win at '+esc(sp.city)}</div></div></div>`).join('')}</div>`}
  ST.spd2=ST.spd2||blankSponsor();const d=ST.spd2;const L=CUSTOM.sponsors||[];
  const sel=(f,opts,v)=>`<select data-sonf="${f}">${opts.map(([k,l])=>`<option value="${esc(k)}" ${String(v)===String(k)?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const col=(f,l)=>`<label>${l}<input type="color" data-sonf="${f}" value="${esc(d[f])}"></label>`;
  return `<p>Design an editor for the framed box: their face, their colors and their <b>voice</b> — what they shout when the blood flows or the fight bores them. Use them for any city (Settings → Editors) or any custom event (Event Designer → Rounds &amp; rules).</p>
   <div class="trstudio"><div class="trprev" id="spPrev">${sponPrevHTML(d)}</div>
    <div class="formgrid"><label>Name<input type="text" data-sonf="name" value="${esc(d.name)}" maxlength="32" placeholder="e.g. Marcia the Wine Queen"></label><label>Label on the frame<input type="text" data-sonf="short" value="${esc(d.short)}" maxlength="14" placeholder="MARCIA"></label>
     <label style="grid-column:1/-1">Title<input type="text" data-sonf="title" value="${esc(d.title)}" maxlength="60" placeholder="Queen of the Falernian vineyards"></label>
     ${col('skin','Skin')}${col('hair','Hair')}<label>Long hair${sel('long',[['','No'],['1','Yes']],d.long?'1':'')}</label>
     <label>Beard${sel('beard',[['none','None'],['short','Short'],['full','Full'],['long','Long']],d.beard)}</label><label>Headgear${sel('head',[['none','None'],['laurel','Laurel wreath'],['flowers','Flower crown'],['diadem','Diadem'],['hood','Hood'],['helm','Crested helm'],['turban','Turban']],d.head)}</label>
     <label>In hand when thrilled${sel('acc',[['goblet','A goblet'],['scroll','A scroll'],['fan','A fan'],['coins','A fistful of coin'],['none','Nothing']],d.acc)}</label>
     ${col('robe','Robe')}${col('trim','Robe trim')}${col('gem','Accent')}${col('bg','Background (top)')}${col('bg2','Background (bottom)')}
     <label>Voice${sel('voice',[['flavius','Cruel editor (Flavius)'],['merchant','Merchant'],['noble','Noble'],['soldier','Old soldier'],['priest','Priest / oracle'],['poet','Poet'],['showman','Showman'],['crone','Market crone']],d.voice)}</label>
     <label style="grid-column:1/-1">Catchphrase when thrilled<input type="text" data-sonf="l.cheer" value="${esc((d.lines||{}).cheer||'')}" maxlength="60" placeholder="e.g. Pour the Falernian!"></label>
     <label style="grid-column:1/-1">Catchphrase when bored or angry<input type="text" data-sonf="l.angry" value="${esc((d.lines||{}).angry||'')}" maxlength="60" placeholder="e.g. I have seen grapes fight harder."></label></div></div>
   <div class="mbtns"><button class="btn primary" type="button" data-sps="save">Save editor</button><button class="btn" type="button" data-sps="new">↺ Start a fresh one</button><button class="btn" type="button" data-sps="rand">🎲 Surprise me</button></div>
   <h4>Your editors · ${L.length}</h4>${L.length?`<div class="sponlist">${L.map(s=>`<div class="sponrow">${sponImg(s)}<div><b>${esc(s.name)}</b><div class="rc-sub">${esc(s.title||'')}</div>${crActs('sp',s)}</div></div>`).join('')}</div>`:'<p class="rc-sub">None yet.</p>'}`}
function sponPrevHTML(d){d.v=(d.v||0)+1;return `<div class="sponmoods">${['calm','cheer','laugh','angry','weep','facepalm'].map(m=>`<div><img src="${flavFaceURL(m,{...d,id:d.id+'p'})}" alt="${m}"><span class="rc-sub">${m}</span></div>`).join('')}</div><div class="rc-sub" style="text-align:center;margin-top:4px">${esc(d.name||'Unnamed sponsor')}</div>`}
async function sponsorStudioClick(b,redraw){const a=b.dataset.sps,id=b.dataset.id;
  if(a==='new'){ST.spd2=blankSponsor();redraw();return}
  if(a==='rand'){const d=blankSponsor();const hex=()=>'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');Object.assign(d,{skin:pickOne(['#f2cfae','#e0ac7e','#c98e62','#9a6a48','#7a4e30']),hair:pickOne(['#141010','#3a2a1a','#7a3b1a','#bcbcbc','#d8b060']),beard:pickOne(['none','short','full','long']),long:Math.random()<.4,head:pickOne(['none','laurel','flowers','diadem','hood','helm','turban']),robe:hex(),bg:hex(),gem:hex(),acc:pickOne(['goblet','scroll','fan','coins']),voice:pickOne(Object.keys(SPONSOR_VOICES)),name:genName()});d.short=d.name.split(' ')[0];ST.spd2=d;redraw();return}
  if(a==='edit'){const s=(CUSTOM.sponsors||[]).find(x=>x.id===id);if(s)ST.spd2=JSON.parse(JSON.stringify(s));redraw();return}
  if(a==='del'){CUSTOM.sponsors=(CUSTOM.sponsors||[]).filter(x=>x.id!==id);await Store.del('customSponsors',id).catch(()=>{});for(const k of Object.keys(SPON.map))if(SPON.map[k]===id)delete SPON.map[k];sponSave();redraw();return}
  if(a==='save'){const d=ST.spd2;if(!String(d.name).trim())d.name=genName();if(!d.short)d.short=d.name.split(' ')[0];d.custom=true;if(!nameGuard('sponsors',d,'[data-sonf="name"],[data-spf="name"],[data-spsf="name"]'))return;
    CUSTOM.sponsors=[...(CUSTOM.sponsors||[]).filter(x=>x.id!==d.id),JSON.parse(JSON.stringify(d))].sort((x,y)=>String(x.name).localeCompare(y.name));await Store.put('customSponsors',d.id,d).catch(()=>{});
    if(typeof mToast==='function')mToast(`🎭 Saved <b>${esc(d.name)}</b> — assign them in Settings → Sponsors or on a custom event`);redraw();return}}
function sponsorStudioInput(t){const d=ST.spd2;if(!d)return;const f=t.dataset.sonf;if(f.startsWith('l.'))(d.lines=d.lines||{})[f.slice(2)]=t.value;else if(f==='long')d.long=!!t.value;else d[f]=t.value;
  if(t.type==='text'&&!['name'].includes(f))return;const pv=document.getElementById('spPrev');if(pv)pv.innerHTML=sponPrevHTML(d)}
