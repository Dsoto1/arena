/* =====================================================================
   24-SPONSORS · THE FACE IN THE BOX (v0.28)
   =====================================================================
   The framed portrait over the A-1 corner is the games' SPONSOR. Flavius sponsors every arena to begin
   with; win a match (as a human, not a simulation) at a city and that city's own patron takes over there.
   Win at all twelve and the Sponsor creator opens in the Creator Studio. Settings → Sponsors picks who
   sponsors each city; the Event Designer can name a sponsor for a custom event.
   ===================================================================== */
const SPONSOR_FLAVIUS={id:'flavius',name:'Flavius',short:'Flavius',title:_T('Editor of the games, lord of the sand'),city:'Roma',skin:'#e0ac7e',hair:'#2a1c12',beard:'full',head:'laurel',robe:'#5a3566',trim:'#e8dcc0',bg:'#4a2a52',bg2:'#2a1830',gem:'#c0433a',acc:'goblet',voice:'flavius',long:false};
// one patron per city (index = LOCATIONS index); Roma is Flavius's own
const CITY_SPONSORS={
  1:{name:'Archias the Shipwright',short:'Archias',title:_T('Builder of the grain fleet'),skin:'#d8a47a',hair:'#bcbcbc',beard:'long',head:'none',robe:'#2e5a8a',trim:'#d9e2ea',bg:'#1c3a5a',bg2:'#0e1e30',gem:'#5fc7c0',acc:'scroll',voice:'merchant'},
  2:{name:'Lady Aurelia of Verona',short:'Aurelia',title:_T('Patroness of the northern games'),skin:'#f0c9a6',hair:'#7a3b1a',beard:'none',long:true,head:'diadem',robe:'#7a1f3a',trim:'#f0d7a0',bg:'#5a1f35',bg2:'#2a0f1a',gem:'#5fc7c0',acc:'fan',voice:'noble'},
  3:{name:'Gaius Tolosanus',short:'Tolosanus',title:_T('Veteran of the Fourth Legion'),skin:'#c98e62',hair:'#5a4a3a',beard:'short',head:'helm',robe:'#6b4a2a',trim:'#c9a458',bg:'#3a2a1a',bg2:'#1a120a',gem:'#c0433a',acc:'goblet',voice:'soldier'},
  4:{name:'Batiatus the Younger',short:'Batiatus',title:_T('Heir to the oldest ludus in Capua'),skin:'#dcae88',hair:'#1a1410',beard:'short',head:'none',robe:'#2e2e2e',trim:'#c9a458',bg:'#2a2418',bg2:'#120f0a',gem:'#e6b93a',acc:'coins',voice:'merchant'},
  5:{name:'The Oracle of Tanit',short:'Oracle',title:_T('Voice of the goddess in Thysdrus'),skin:'#9a6a48',hair:'#101010',beard:'none',long:true,head:'hood',robe:'#c28a2a',trim:'#3a2a10',bg:'#3a2a0a',bg2:'#1a1204',gem:'#5fc7c0',acc:'scroll',voice:'priest'},
  7:{name:'Marcus Celer',short:'Celer',title:_T('Prince of the chariot circus'),skin:'#e2b48c',hair:'#3a2a1a',beard:'none',head:'helm',robe:'#2e6a3a',trim:'#e8dcc0',bg:'#1c3a24',bg2:'#0a1a10',gem:'#4f9a57',acc:'goblet',voice:'showman'},
  8:{name:'Julia Felicitas',short:'Julia',title:_T('Owner of the finest baths in Pompeii'),skin:'#f2cfae',hair:'#2a1a10',beard:'none',long:true,head:'flowers',robe:'#b04a6a',trim:'#f0e0c0',bg:'#5a2a3a',bg2:'#2a1018',gem:'#e07b9a',acc:'fan',voice:'noble'},
  9:{name:'Septimus of Leptis',short:'Septimus',title:_T('Son of Africa, friend of emperors'),skin:'#7a4e30',hair:'#141010',beard:'full',head:'laurel',robe:'#8a2a2a',trim:'#e6b93a',bg:'#4a1a12',bg2:'#200a06',gem:'#e6b93a',acc:'goblet',voice:'noble'},
  10:{name:'Hanno the Lyre-Keeper',short:'Hanno',title:_T('Poet of Uthina'),skin:'#a87450',hair:'#2a1a10',beard:'short',head:'turban',robe:'#1f6a6a',trim:'#e8dcc0',bg:'#10363a',bg2:'#061a1c',gem:'#f0cf7d',acc:'scroll',voice:'poet'},
  11:{name:'Mother Histria',short:'Histria',title:_T('Keeper of the Pola fish market'),skin:'#e0b090',hair:'#cfcfcf',beard:'none',long:true,head:'hood',robe:'#3a4a5a',trim:'#c9ccd3',bg:'#243240',bg2:'#10181f',gem:'#8fc3ea',acc:'coins',voice:'crone'},
  12:{name:'Tiberius Mercator',short:'Mercator',title:_T('Harbor-master of Puteoli'),skin:'#d9a07a',hair:'#3a2a20',beard:'full',head:'none',robe:'#1e2e4e',trim:'#c9a458',bg:'#141e34',bg2:'#080c18',gem:'#e6b93a',acc:'coins',voice:'merchant'}};
for(const [li,sp] of Object.entries(CITY_SPONSORS)){sp.id='city:'+li;sp.li=+li;sp.city=LOCATIONS[li]?LOCATIONS[li].n:''}
/* SPONSOR_VOICES — what each sponsor voice says, by mood (replaces Flavius's lines for that sponsor). */
const SPONSOR_VOICES={
  merchant:{pleased:[_T('Good for business.'),_T('The ledger smiles.'),_T('Worth every denarius.')],laugh:[_T('Ha! Put that on a poster!'),_T('Profit AND blood!')],cheer:[_T('SOLD! To the crowd!'),_T('That is a season ticket, right there!'),_T('Magnificent returns!')],angry:[_T('I am paying for THIS?'),_T('Refunds. Everyone wants refunds.'),_T('Fight or I sell you to the mines.')],
    facepalm:[_T('There goes my margin.'),_T('Who scouted this one?')],shock:[_T('My insurance!'),_T('The masonry is NOT cheap!')],bored:[_T('Time is money. This is neither.'),_T('Wake me when it pays.')],smug:[_T('As I invested.'),_T('Bought low, cheering high.')],weep:[_T('I will name a ship after this one.'),_T('Priceless. And I know prices.')]},
  noble:{pleased:[_T('How very fine.'),_T('Charming.'),_T('Yes, that will do.')],laugh:[_T('Oh! How deliciously vulgar!'),_T('Darling, did you SEE that?')],cheer:[_T('Bravo! BRAVO!'),_T('Magnificent!'),_T('Throw them roses!')],angry:[_T('Dreadful. Simply dreadful.'),_T('Do they not know who is watching?')],
    facepalm:[_T('How tiresome.'),_T('Someone fetch my smelling salts.')],shock:[_T('Good heavens!'),_T('My dear!')],bored:[_T('I have seen more passion at a tax hearing.'),_T('Is it over yet?')],smug:[_T('I did say so.'),_T('Naturally.')],weep:[_T('Oh, my heart…'),_T('I shall weep at dinner.')]},
  soldier:{pleased:[_T('Solid work.'),_T('Good form.'),_T('Keep the shield up.')],laugh:[_T('HA! Like the Rhine campaign!'),_T('That one would have made centurion!')],cheer:[_T('FOR ROME!'),_T('THAT is a soldier!'),_T('Hold the line — no, take it!')],angry:[_T('Discipline, you dogs!'),_T('My recruits fight harder asleep.')],
    facepalm:[_T('Sloppy.'),_T('Who trained this rabble?')],shock:[_T('Ambush!'),_T('By Mars!')],bored:[_T('March faster.'),_T('I have stood night watches with more excitement.')],smug:[_T('Textbook.'),_T('As drilled.')],weep:[_T('A good death.'),_T('The legion salutes you.')]},
  priest:{pleased:[_T('The goddess approves.'),_T('A fair omen.')],laugh:[_T('Even the gods laugh!'),_T('Tanit is amused!')],cheer:[_T('The heavens roar!'),_T('An offering worthy of the altar!')],angry:[_T('You insult the gods!'),_T('The omens darken!')],
    facepalm:[_T('The entrails warned me.'),_T('Sacrilege.')],shock:[_T('A sign!'),_T('The birds fly left!')],bored:[_T('The gods grow restless.'),_T('Even the sacred chickens are asleep.')],smug:[_T('It was foretold.'),_T('I read it in the smoke.')],weep:[_T('The gods receive you.'),_T('Go with the goddess.')]},
  poet:{pleased:[_T('A fine stanza.'),_T('Almost… lyrical.')],laugh:[_T('Comedy! Pure comedy!'),_T('I shall write a satire!')],cheer:[_T('Sing, O Muse!'),_T('An epic in a single blow!'),_T('Odes! I need more tablets!')],angry:[_T('Where is the drama?'),_T('This scene needs rewriting.')],
    facepalm:[_T('Clumsy prose.'),_T('A tragedy, and not the good kind.')],shock:[_T('What a twist!'),_T('Not in my draft!')],bored:[_T('Too long, too dull.'),_T('Cut this act.')],smug:[_T('I foresaw the ending.'),_T('Rhymes with glory.')],weep:[_T('Such pathos…'),_T('I shall write your elegy.')]},
  showman:{pleased:[_T('Nice move!'),_T('The crowd likes that.')],laugh:[_T('What a SHOW!'),_T('Crash! Beautiful!')],cheer:[_T('WHAT A RACE!'),_T('ON YOUR FEET, NEMAUSUS!'),_T('A lap of honor!')],angry:[_T('BORING! Faster!'),_T('Give them a show!')],
    facepalm:[_T('Rookie mistake.'),_T('Who taught them to steer?')],shock:[_T('Whoa-ho!'),_T('Mind the wall!')],bored:[_T('I have seen livelier mules.'),_T('Pick up the pace!')],smug:[_T('Called it.'),_T('All according to the script.')],weep:[_T('A legend of the circus.'),_T('They will sing of this lap.')]},
  crone:{pleased:[_T('Not bad, dearie.'),_T('Fresh as the morning catch.')],laugh:[_T('Hee hee! Serves him right!'),_T('Oh, I needed that!')],cheer:[_T('Gut him like a mackerel!'),_T('THAT is my kind of fishing!')],angry:[_T('Soft as week-old squid.'),_T('My grandsons hit harder.')],
    facepalm:[_T('Oh, for Neptune’s sake.'),_T('Seen better at the market.')],shock:[_T('Mind my stall!'),_T('Well I never!')],bored:[_T('Wake me for the gutting.'),_T('Slow as a Pola tide.')],smug:[_T('Told you so, didn’t I?'),_T('Old Histria knows.')],weep:[_T('Poor lamb.'),_T('The sea takes them all, in the end.')]}};
/* SPON_KEY — localStorage key of the per-city sponsor picks. */
const SPON_KEY='flavius_sponsors';
/* SPON — the per-city sponsor picks {map: {locIdx: sponsor id}}. */
let SPON={map:{}};try{SPON=JSON.parse(localStorage.getItem(SPON_KEY)||'null')||{map:{}}}catch(e){SPON={map:{}}}
/* sponSave — saves the sponsor picks. */
const sponSave=()=>{try{localStorage.setItem(SPON_KEY,JSON.stringify(SPON))}catch(e){}};
/* HALL_LOCS — arena cities where a human has won (unlocks their patrons and music). */
let HALL_LOCS=[];
/* sponsorsRefresh — reloads HALL_LOCS from the Hall progress. */
async function sponsorsRefresh(){try{const h=await Store.getDoc('hall','progress');HALL_LOCS=(h&&h.locs)||[]}catch(e){}}
/* refreshes the unlocked cities at start. */
setTimeout(()=>{sponsorsRefresh();if(typeof CUSTOM!=='undefined')loadSponsors()},750);
/* loadSponsors — loads the custom sponsors (Store customSponsors). */
async function loadSponsors(){try{CUSTOM.sponsors=(await Store.list('customSponsors')).sort((a,b)=>String(a.name).localeCompare(b.name))}catch(e){CUSTOM.sponsors=CUSTOM.sponsors||[]}}
/* v0.36 THE DEVELOPER'S KEY: seven clicks on the version badge ask for a passphrase; the right one opens
   the Editor creator and every city editor without winning anywhere. Kept in this browser; re-lock in Settings → Editors. */
const DEV_KEY=()=>{try{return localStorage.getItem('flavius_devEditor')==='1'}catch(e){return false}};
/* cityUnlocked — whether a city's patron is unlocked (Roma always; or a human win there; or the developer's key). */
const cityUnlocked=locIdx=>+locIdx===6||DEV_KEY()||HALL_LOCS.includes(+locIdx);
/* creatorUnlocked — whether the sponsor creator is open (a win in all twelve cities, or the developer's key). */
const creatorUnlocked=()=>DEV_KEY()||LOCATIONS.every((L,i)=>!L||HALL_LOCS.includes(i));
/* v0.41 THE CURTAIN'S WORD: ONE click on the version badge opens a single box for every code, now and later.
   Register a code with cheatRegister(cheatKey-hash, run, 'label') — compute the hash once, offline; run() returns the message to show. */
const CHEATS={};
/* cheatKey — the hashed key of a word of power (the words never appear in the source). */
const cheatKey=word=>'h'+hashStr('code:'+String(word).trim().toUpperCase()); // codes are kept as hashes — the words never appear in the page source
function cheatRegister(key,run,label){CHEATS[key]={run,label:label||''}}
/* word of power: unlocks every city editor and the Editor creator. */
cheatRegister('h891493828',()=>{if(DEV_KEY())return _T('🔑 The developer\u2019s key is already turned. Re-lock it in Settings → Editors.');try{localStorage.setItem('flavius_devEditor','1')}catch(err){}return _T('🔑 <b>Unlocked.</b> The Editor creator and every city editor are yours — Creator Studio → 🎭 Editors.')},_T('The developer\u2019s key'));
/* word of power: unlocks every music theme. */
cheatRegister('h2501629703',()=>{try{localStorage.setItem('flavius_musica','1')}catch(e){}try{if(typeof audListRefresh==='function'){const el=document.getElementById('audTracks');if(el)el.innerHTML=audListHTML()}}catch(e){}return _T('🎶 All sixteen themes are yours — the twelve cities and the four others. Settings → Audio.')},_T('All sixteen themes'));
/* word of power: +50 coin to the open (or active) lanista. */
cheatRegister('h3429076038',()=>{const w=typeof ACTIVE!=='undefined'&&ACTIVE.world||typeof MGR!=='undefined'&&MGR.world;if(typeof MGR!=='undefined'&&MGR.world&&typeof me==='function'&&me()){me().coin+=50;try{saveWorld(true)}catch(e){}return _T`💰 <b>LUDUS.</b> ${coinAmt87('+50')} in ${esc(me().ludus)}'s treasury.`}
  if(typeof applyActivePurse==='function'&&typeof getPurse==='function'){getPurse().then(p=>{if(!p){if(typeof mToast==='function')mToast(_T('No lanista holds the wallet yet — open Manager mode first.'));return}p.coin+=50;p.noBet=true;return setPurse(p)}).catch(()=>{});return _T`💰 <b>LUDUS.</b> ${coinAmt87('+50')} in the active wallet\u2019s treasury.`}
  return _T('No ludus to pay — open Manager mode first.')},'+50 coin');
/* v0.45: the words themselves, for the strategy guide — kept scrambled in the source and only spelled out when the player asks */
const CHEAT_SHOW=[[[76,75,80,91,86,89,56,57],_T('🔑 Every city editor and the Editor creator unlocked without the need to win in each city')],[[84,92,90,80,74,72,56,61],_T('🎶 All sixteen themes in Settings → Audio — the twelve cities and the four others')],[[83,92,75,92,90,60,55],_T('💰 +50 coin to your ludus treasury (or the active wallet) — as often as you like')]];
/* cheatsGuideHTML — the Words of power section of the guide (the words stay scrambled until you ask). */
function cheatsGuideHTML(){return `<h4>${_T`🔑 Words of power`}</h4><p class="rc-sub" style="margin:0 0 6px">${_T`Cheats. Press <b>C</b> on the main menu (on a phone or tablet: hold the version badge) and speak one. They stay hidden until you ask.`}</p>
  <div class="cheatbox"><button class="btn primary" type="button" data-cheatshow="1">${_T`🔑 Reveal the words`}</button><div class="cheatlist" hidden></div></div>`}
/* reveals the words of power list on request. */
document.addEventListener('click',e=>{const b=e.target.closest('[data-cheatshow]');if(!b)return;const box=b.parentElement.querySelector('.cheatlist');if(!box)return;
  if(!box.hidden){box.hidden=true;box.innerHTML='';b.textContent=_T('🔑 Reveal the words');return}
  box.innerHTML=CHEAT_SHOW.map(([c,d])=>`<div class="cheatrow"><code>${esc(String.fromCharCode(...c.map(x=>x-7)))}</code><span>${d}</span></div>`).join('');box.hidden=false;b.textContent=_T('🙈 Hide them again')});
/* cheatPrompt — the word-of-power prompt: runs the matching cheat and toasts its message. */
async function cheatPrompt(){if(typeof modalBusy==='function'&&modalBusy())return;
  const v=await modal(_T('🔑 A voice from behind the curtain'),`<p>${_T`“Speak the word, and doors open.”`}</p><input type="text" id="devPass" class="tin" autocomplete="off" autocapitalize="characters" spellcheck="false" style="width:100%" placeholder="${_T`a word of power`}">`,[{label:_T('Speak it'),value:'go',primary:1},{label:_T('Cancel'),value:null}],{close:null,onOpen:()=>{const i=document.getElementById('devPass');if(i){i.focus();i.addEventListener('keydown',k=>{if(k.key==='Enter'){const b2=document.querySelector('#mBtns [data-mi="0"]');if(b2)b2.click()}})}}});
  const word=((document.getElementById('devPass')||{}).value||'').trim().toUpperCase();
  if(v!=='go'||!word)return;const C=CHEATS[cheatKey(word)];
  const msg=C?C.run():_T('The curtain stays closed.');if(typeof mToast==='function')mToast(msg);try{if(typeof render==='function')render()}catch(e){}}
/* the version badge also opens the prompt (click or Enter). */
{const ed=document.querySelector('.brand .ed');if(ed){ed.setAttribute('role','button');ed.tabIndex=0;ed.title=_T('Version — click to speak a word of power');
  ed.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();cheatPrompt()});ed.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();cheatPrompt()}})}}
/* sponsorById — a sponsor by id: Flavius, a city patron (city:N) or a custom one; Flavius when unknown. */
function sponsorById(id){if(!id||id==='flavius')return SPONSOR_FLAVIUS;if(String(id).startsWith('city:'))return CITY_SPONSORS[+id.slice(5)]||SPONSOR_FLAVIUS;return ((typeof CUSTOM!=='undefined'&&CUSTOM.sponsors)||[]).find(s=>s.id===id)||SPONSOR_FLAVIUS}
/* sponsorForLoc — the sponsor id seated at a city: your pick if still valid, else the city's patron once unlocked, else Flavius. */
function sponsorForLoc(locIdx){const set=SPON.map[locIdx];if(set){if(set==='flavius')return 'flavius';if(set.startsWith('city:')&&cityUnlocked(+set.slice(5)))return set;if(!set.startsWith('city:')&&sponsorById(set)!==SPONSOR_FLAVIUS)return set}
  return 'flavius'} /* v0.45: an unlocked editor presides only once you seat them (Settings → Editors); until then it is Flavius */
/* v0.43: whoever edits today's games is the one who rises, laughs and turns a thumb */
const edName=()=>{try{const sp=curSponsor();return sp&&sp!==SPONSOR_FLAVIUS&&(sp.short||sp.name)?String(sp.short||sp.name):_T('Flavius')}catch(e){return _T('Flavius')}};
/* curSponsor — the sponsor of the live event (or of the city the board shows). */
function curSponsor(){if(S&&S.sponsorId)return sponsorById(S.sponsorId);return sponsorById(sponsorForLoc(S&&S.locIdx!=null?S.locIdx:6))}
/* sponsorVoice — the current sponsor's lines by mood (their own lines added twice). */
function sponsorVoice(){const sp=curSponsor();const V=SPONSOR_VOICES[sp.voice]||FLAV_LINES;const out={...V};if(sp.lines){for(const [k,v] of Object.entries(sp.lines))if(v)out[k]=[...(out[k]||[]),v,v]}return out}
/* sponsorOptions — [id, label] options for picking an event's sponsor. */
function sponsorOptions(){const o=[['',_T('The city’s seated editor (default)')],['flavius',_T('Flavius')]];for(const [li,sp] of Object.entries(CITY_SPONSORS))if(cityUnlocked(li))o.push([sp.id,`${sp.name} (${sp.city})`]);for(const s of ((typeof CUSTOM!=='undefined'&&CUSTOM.sponsors)||[]))o.push([s.id,`✦ ${s.name}`]);return o}
// the games begin: who is paying for them today?
function sponsorStart(cfg){if(!S)return;const ev=EV();S.sponsorId=ev&&ev.custom&&ev.sponsor?ev.sponsor:sponsorForLoc(cfg.loc);
  if(!HEADLESS&&!S.sim&&S.sponsorId!=='flavius'){const sp=sponsorById(S.sponsorId);later(()=>log(_T`🎭 Today's games are given by <b>${esc(sp.name)}</b>, editor of the games${sp.title?`, ${esc(sp.title)}`:''}.`,'thought'),0)}}
// after an event: a human win at a new city unlocks its patron
async function sponsorAfterEvent(hall){const before=new Set(HALL_LOCS);HALL_LOCS=(hall&&hall.locs)||HALL_LOCS;
  for(const li of HALL_LOCS)if(!before.has(li)&&CITY_SPONSORS[li]&&typeof mToast==='function'){const sp=CITY_SPONSORS[li];setTimeout(()=>mToast(_T`🎭 <b>${esc(sp.name)}</b>, editor of ${esc(sp.city)}, is unlocked — seat them in Settings → Editors to have them give the games there`),1600)}
  if(before.size<12&&creatorUnlocked()&&typeof mToast==='function')setTimeout(()=>mToast(_T('🎭 You have won in all twelve cities — the <b>Editor creator</b> is open in the Creator Studio!')),3400)}
/* sponImg — a sponsor's face image in a mood. */
const sponImg=(sponsor,mood='calm')=>`<img class="sponimg" src="${flavFaceURL(mood,sponsor)}" alt="${esc(sponsor.name)}">`;
/* sponsorSettingsHTML — Settings → Editors: who sponsors each unlocked city. */
function sponsorSettingsHTML(){const n=LOCATIONS.filter((L,i)=>L&&HALL_LOCS.includes(i)).length;
  return `${DEV_KEY()?`<div class="card2" style="margin-bottom:8px;border-color:var(--gold)">${_T`🔑 <b>Developer\u2019s key turned</b> — every editor and the Editor creator are open regardless of wins.`} <button class="btn tksm" type="button" onclick="try{localStorage.removeItem('flavius_devEditor')}catch(e){};openSettings('sponsors')">Re-lock</button></div>`:''}<p>${_T`The <b>editor of the games</b> is the face in the framed box over the arena — the one who pays for the games, and the rulebook's own word for them. Flavius edits every city's games to begin with; <b>win a match as a human player</b> at a city and its own editor is <b>unlocked</b> — pick them for that city below to seat them in the box (and their name replaces Flavius in the herald’s lines). Win at all twelve and the <b>Editor creator</b> opens in the Creator Studio.`} <span class="rc-sub">${_T`(${n}/12 cities won)`}</span></p>
   <div class="sponlist">${LOCATIONS.map((L,li)=>{if(!L)return '';const cur=sponsorById(sponsorForLoc(li));const u=CITY_SPONSORS[li];const unl=cityUnlocked(li);
     return `<div class="sponrow">${sponImg(cur)}<div><b>${esc(L.n)}</b> <span class="rc-sub">· ${esc(cur.name)}</span>${u?(unl?(cur.id!==u.id?`<div class="rc-sub">${_T`editor: ${esc(u.name)}`}</div>`:''):`<div class="rc-sub">${_T`🔒 this city’s editor unlocks when you win here`}</div>`):`<div class="rc-sub">${_T`Flavius’s own city`}</div>`}
       <select data-spcity="${li}" style="margin-top:4px;max-width:100%">${[['',_T('Default (Flavius)')],['flavius',_T('Flavius')],...(u?[[u.id,unl?u.name:'🔒 '+u.name]]:[]),...((CUSTOM.sponsors||[]).filter(s=>s.offered!==false).map(s=>[s.id,'✦ '+s.name]))].map(([k,l])=>`<option value="${k}" ${(SPON.map[li]||'')===k?'selected':''} ${k===(u&&u.id)&&!unl?'disabled':''}>${esc(l)}</option>`).join('')}</select></div></div>`}).join('')}</div>`}
/* sponsorSettingsChange — stores a city's sponsor pick from Settings → Editors (returns true when it handled the change). */
function sponsorSettingsChange(input){if(input.dataset.spcity==null)return false;const li=+input.dataset.spcity;if(input.value)SPON.map[li]=input.value;else delete SPON.map[li];sponSave();return true}

/* ---------------- Creator Studio → Sponsors ---------------- */
function blankSponsor(){return {id:'cs'+Date.now().toString(36),name:'',short:'',title:'',skin:'#d9a07a',hair:'#2a1c12',beard:'full',long:false,head:'laurel',robe:'#5a3566',trim:'#e8dcc0',bg:'#4a2a52',bg2:'#2a1830',gem:'#c0433a',acc:'goblet',voice:'flavius',lines:{cheer:'',angry:''},custom:true,v:1}}
/* sponsorStudioHTML — Creator Studio → Editors: the sponsor designer and your sponsors. */
function sponsorStudioHTML(){
  if(!creatorUnlocked()){const won=new Set(HALL_LOCS);return `<div class="card2 lockcard"><div style="font-size:40px">🔒🎭</div><h4 style="margin:4px 0">${_T`The Editor creator is locked`}</h4>
    <p>${_T`Win one match <b>as a human player</b> (not a simulation) in <b>every one of the twelve cities</b> to open it. Each win also seats that city's own editor in the box.`}</p>
    <div class="spongrid">${LOCATIONS.map((L,i)=>L?`<span class="badge ${won.has(i)?'gold':''}">${won.has(i)?'✓':'·'} ${esc(L.n)}</span>`:'').join('')}</div></div>
    <h4>${_T`The editors of the empire`}</h4><div class="sponlist">${[SPONSOR_FLAVIUS,...Object.values(CITY_SPONSORS)].map(sp=>`<div class="sponrow">${sponImg(sp)}<div><b>${esc(sp.name)}</b><div class="rc-sub">${esc(sp.title||'')} · ${esc(sp.city||'')}</div><div class="rc-sub">${sp.id==='flavius'||cityUnlocked(sp.li)?'unlocked':_T('🔒 win at ')+esc(sp.city)}</div></div></div>`).join('')}</div>`}
  ST.spd2=ST.spd2||blankSponsor();const d=ST.spd2;const L=CUSTOM.sponsors||[];
  const sel=(f,opts,v)=>`<select data-sonf="${f}">${opts.map(([k,l])=>`<option value="${esc(k)}" ${String(v)===String(k)?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const col=(f,l)=>`<label>${l}<input type="color" data-sonf="${f}" value="${esc(d[f])}"></label>`;
  return `<p>${_T`Design an editor for the framed box: their face, their colors and their <b>voice</b> — what they shout when the blood flows or the fight bores them. Use them for any city (Settings → Editors) or any custom event (Event Designer → Rounds &amp; rules).`}</p>
   <div class="trstudio"><div class="trprev" id="spPrev">${sponPrevHTML(d)}</div>
    <div class="formgrid"><label>${_T`Name`}<input type="text" data-sonf="name" value="${esc(d.name)}" maxlength="32" placeholder="${_T`e.g. Marcia the Wine Queen`}"></label><label>${_T`Label on the frame`}<input type="text" data-sonf="short" value="${esc(d.short)}" maxlength="14" placeholder="MARCIA"></label>
     <label style="grid-column:1/-1">${_T`Title`}<input type="text" data-sonf="title" value="${esc(d.title)}" maxlength="60" placeholder="${_T`Queen of the Falernian vineyards`}"></label>
     ${col('skin',_T('Skin'))}${col('hair',_T('Hair'))}<label>${_T`Long hair${sel('long',[['','No'],['1',_T('Yes')]],d.long?'1':'')}`}</label>
     <label>${_T`Beard${sel('beard',[['none',_T('None')],['short',_T('Short')],['full',_T('Full')],['long',_T('Long')]],d.beard)}`}</label><label>${_T`Headgear${sel('head',[['none',_T('None')],['laurel',_T('Laurel wreath')],['flowers',_T('Flower crown')],['diadem',_T('Diadem')],['hood',_T('Hood')],['helm',_T('Crested helm')],['turban',_T('Turban')]],d.head)}`}</label>
     <label>${_T`In hand when thrilled${sel('acc',[['goblet',_T('A goblet')],['scroll',_T('A scroll')],['fan',_T('A fan')],['coins',_T('A fistful of coin')],['none',_T('Nothing')]],d.acc)}`}</label>
     ${col('robe',_T('Robe'))}${col('trim',_T('Robe trim'))}${col('gem',_T('Accent'))}${col('bg',_T('Background (top)'))}${col('bg2',_T('Background (bottom)'))}
     <label>${_T`Voice${sel('voice',[['flavius',_T('Cruel editor (Flavius)')],['merchant',_T('Merchant')],['noble',_T('Noble')],['soldier',_T('Old soldier')],['priest','Priest / oracle'],['poet',_T('Poet')],['showman',_T('Showman')],['crone',_T('Market crone')]],d.voice)}`}</label>
     <label style="grid-column:1/-1">${_T`Catchphrase when thrilled`}<input type="text" data-sonf="l.cheer" value="${esc((d.lines||{}).cheer||'')}" maxlength="60" placeholder="${_T`e.g. Pour the Falernian!`}"></label>
     <label style="grid-column:1/-1">${_T`Catchphrase when bored or angry`}<input type="text" data-sonf="l.angry" value="${esc((d.lines||{}).angry||'')}" maxlength="60" placeholder="${_T`e.g. I have seen grapes fight harder.`}"></label></div></div>
   <div class="mbtns"><button class="btn primary" type="button" data-sps="save">${_T`Save editor`}</button><button class="btn" type="button" data-sps="new">${_T`↺ Start a fresh one`}</button><button class="btn" type="button" data-sps="rand">${_T`🎲 Surprise me`}</button></div>
   <h4>${_T`Your editors · ${L.length}`}</h4>${L.length?`<div class="sponlist">${L.map(s=>`<div class="sponrow">${sponImg(s)}<div><b>${esc(s.name)}</b><div class="rc-sub">${esc(s.title||'')}</div>${crActs('sp',s)}</div></div>`).join('')}</div>`:`<p class="rc-sub">${_T`None yet.`}</p>`}`}
/* sponPrevHTML — the sponsor designer's preview in six moods. */
function sponPrevHTML(draft){draft.v=(draft.v||0)+1;return `<div class="sponmoods">${['calm','cheer','laugh','angry','weep','facepalm'].map(m=>`<div><img src="${flavFaceURL(m,{...draft,id:draft.id+'p'})}" alt="${m}"><span class="rc-sub">${m}</span></div>`).join('')}</div><div class="rc-sub" style="text-align:center;margin-top:4px">${esc(draft.name||_T('Unnamed sponsor'))}</div>`}
/* sponsorStudioClick — the sponsor designer's buttons. */
async function sponsorStudioClick(btn,redraw){const a=btn.dataset.sps,id=btn.dataset.id;
  if(a==='new'){ST.spd2=blankSponsor();redraw();return}
  if(a==='rand'){const d=blankSponsor();const hex=()=>'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');Object.assign(d,{skin:pickOne(['#f2cfae','#e0ac7e','#c98e62','#9a6a48','#7a4e30']),hair:pickOne(['#141010','#3a2a1a','#7a3b1a','#bcbcbc','#d8b060']),beard:pickOne(['none','short','full','long']),long:Math.random()<.4,head:pickOne(['none','laurel','flowers','diadem','hood','helm','turban']),robe:hex(),bg:hex(),gem:hex(),acc:pickOne(['goblet','scroll','fan','coins']),voice:pickOne(Object.keys(SPONSOR_VOICES)),name:genName()});d.short=d.name.split(' ')[0];ST.spd2=d;redraw();return}
  if(a==='edit'){const s=(CUSTOM.sponsors||[]).find(x=>x.id===id);if(s)ST.spd2=JSON.parse(JSON.stringify(s));redraw();return}
  if(a==='del'){CUSTOM.sponsors=(CUSTOM.sponsors||[]).filter(x=>x.id!==id);await Store.del('customSponsors',id).catch(()=>{});for(const k of Object.keys(SPON.map))if(SPON.map[k]===id)delete SPON.map[k];sponSave();redraw();return}
  if(a==='save'){const d=ST.spd2;if(!String(d.name).trim())d.name=genName();if(!d.short)d.short=d.name.split(' ')[0];d.custom=true;if(!nameGuard('sponsors',d,'[data-sonf="name"],[data-spf="name"],[data-spsf="name"]'))return;
    CUSTOM.sponsors=[...(CUSTOM.sponsors||[]).filter(x=>x.id!==d.id),JSON.parse(JSON.stringify(d))].sort((x,y)=>String(x.name).localeCompare(y.name));await Store.put('customSponsors',d.id,d).catch(()=>{});
    if(typeof mToast==='function')mToast(_T`🎭 Saved <b>${esc(d.name)}</b> — assign them in Settings → Sponsors or on a custom event`);redraw();return}}
/* sponsorStudioInput — the sponsor designer's fields. */
function sponsorStudioInput(input){const d=ST.spd2;if(!d)return;const f=input.dataset.sonf;if(f.startsWith('l.'))(d.lines=d.lines||{})[f.slice(2)]=input.value;else if(f==='long')d.long=!!input.value;else d[f]=input.value;
  if(input.type==='text'&&!['name'].includes(f))return;const pv=document.getElementById('spPrev');if(pv)pv.innerHTML=sponPrevHTML(d)}
