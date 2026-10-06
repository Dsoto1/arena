/* =====================================================================
   126-v82fix · fixes after v0.81 (his notes while testing)
   =====================================================================
   • Unique beasts (Tholo, Commodus, Leo, Leaena): the moment one enters the event by ANY route (start layout, chant, Gauntlet chain,
     custom layout, its card), its arena card leaves the deck (S.deck and the round-2 cards). A drawn card for a beast already
     spent is set aside and the next card is drawn instead (safety net) — no more wasted "Tholo" draws while he is on the sand.
   ===================================================================== */
const UNIQUE_CARD82={Tholo:'spawnTholo',Commodus:'spawnCommodus',Leo:'spawnLeo',Leaena:'spawnLeaena'};
function uniqueOut82(key){const k=UNIQUE_CARD82[key];if(!k||!S)return;let n=0;
  for(const D of [S.deck,S.round2])if(Array.isArray(D))for(let i=D.length-1;i>=0;i--)if(D[i]===k){D.splice(i,1);n++}
  return n}
{const base=spawnNPC;spawnNPC=function(target,name,at,extra={}){const r=base.apply(this,arguments);
  try{const k=extra&&extra.tamedBy!=null?null:spawnKey(target,name);if(r&&k)uniqueOut82(k)}catch(e){}return r}}
{const base=drawArena;drawArena=async function(player){
  try{for(let g=0;g<6&&S&&S.deck&&S.deck.length;g++){const top=S.deck[S.deck.length-1];const key=Object.keys(UNIQUE_CARD82).find(x=>UNIQUE_CARD82[x]===top);
    if(!key||!bossSpent(key))break;S.deck.pop();log(_T`${key} is already in this event — that card is set aside and another is drawn.`)}}catch(e){}
  return base.apply(this,arguments)}}
/* an event that starts with a unique beast on the sand: clean the deck once it is built */
{const base=beginTurn;beginTurn=async function(){try{if(S&&!S._uq82&&S.deck){S._uq82=1;for(const k of Object.keys(UNIQUE_CARD82))if(bossSpent(k))uniqueOut82(k)}}catch(e){}return base.apply(this,arguments)}}
/* the Hero's SCULPTED token (20-tokens figureSVG, stance 'hunched' — he leans in to attack) stood 8 units shorter than the others:
   a hunched gladiator is drawn 6% larger so the top of his head meets everyone else's (Tholo keeps his own scale) */
{const base=figureSVG;figureSVG=function(sp,opts){if(sp&&sp.stance==='hunched'&&sp.kind!=='beast'&&!((sp.scale||1)>1.1))sp={...sp,scale:(sp.scale||1)*1.062};return base.call(this,sp,opts)}}
/* Tholo's sculpted token follows his card: grey curly hair + full grey beard, a laurel wreath, the one great eye, a grey-green
   cloth drape over his hips (v0.89: no hanging cape — under the lit look it read as a dark slab behind his legs), warm bronzed skin, his wooden club (owner's ask, from his card back) */
if(typeof TOKEN_DEF!=='undefined'&&TOKEN_DEF.tholo)Object.assign(TOKEN_DEF.tholo,{hair:'long',hairC:'#d6d2c8',beard:'full',helm:'laurel',skin:'#cf8a5c',
  c1:'#9aa596',c2:'#6f5a3a',cape:false,neck:'none',legs:'wraps',base:'#2e2a24',scale:1.32});
/* the main menu, leaner (his ask: "not scare them off"): Play Now and Manager Mode share the first row, Multiplayer below,
   then the two lessons beside the Creator Studio, then one slim row: Annals · Rules · Settings · Saves · sound.
   CSS only (grid order) — every button keeps its own element and handler */
{const st=document.createElement('style');st.textContent=`
#mainMenu .mmbtns{display:grid!important;grid-template-columns:repeat(12,minmax(0,1fr));gap:8px;align-items:stretch;max-width:460px;width:100%;margin-inline:auto}
#mainMenu .mmbtns>*{grid-column:span 12;margin:0!important;min-width:0}
#mainMenu .mmbtns>[data-mm="continue"]{order:0}
#mainMenu .mmbtns>[data-mm="play"]{order:1;grid-column:span 12}
#mainMenu .mmbtns>[data-mm="manager"]{order:2;grid-column:span 12}
#mainMenu .mmbtns>[data-mm="play"],#mainMenu .mmbtns>[data-mm="manager"]{padding:14px 10px;font-size:17px}
#mainMenu .mmbtns>[data-mm="multi"]{order:3}
#mainMenu .mmbtns>#mmMulti{order:4}
#mainMenu .mmbtns>#mmLearn{order:5;grid-column:span 7;display:flex;gap:6px}
#mainMenu .mmbtns>#mmLearn>button{flex:1 1 0;min-width:0;font-size:13px;padding:6px}
#mainMenu .mmbtns>#mmLearn small,#mainMenu .mmbtns>[data-mm="studio"] small,#mainMenu .mmbtns>[data-mm="annals"] small,#mainMenu .mmbtns>[data-mm="rules"] small,#mainMenu .mmbtns>.mmrow small,#mainMenu .mmbtns>[data-mm="multi"] small{display:none}
#mainMenu .mmbtns>[data-mm="studio"]{order:6;grid-column:span 5}
#mainMenu .mmbtns>[data-mm="annals"]{order:7;grid-column:span 3;font-size:13px;padding:6px 4px;white-space:nowrap}
#mainMenu .mmbtns>[data-mm="rules"]{order:8;grid-column:span 3;font-size:13px;padding:6px 4px;white-space:nowrap}
#mainMenu .mmbtns>.mmrow{order:9;grid-column:span 6;display:flex;gap:6px}
#mainMenu .mmbtns>.mmrow>button{flex:1 1 0;font-size:13px;padding:6px 4px;white-space:nowrap}
#mainMenu .mmbtns>.mmrow>#mmMute{flex:0 0 44px}
#mainMenu .mmbtns>*:not([data-mm="play"]):not([data-mm="manager"]):not([data-mm="continue"]){opacity:.92}
@media (max-width:520px){#mainMenu .mmbtns>[data-mm="annals"],#mainMenu .mmbtns>[data-mm="rules"]{grid-column:span 6}#mainMenu .mmbtns>.mmrow{grid-column:span 12}#mainMenu .mmbtns>#mmLearn,#mainMenu .mmbtns>[data-mm="studio"]{grid-column:span 12}}`;document.head.appendChild(st)}
{const b=document.querySelector('#mainMenu [data-mm="rules"]');if(b)b.innerHTML=_T('📜 Rules');const a=document.querySelector('#mainMenu [data-mm="annals"]');if(a&&a.firstChild&&a.firstChild.nodeType===3)a.firstChild.textContent=_T('🏛️ Annals')}
/* the two lessons sit behind one "🎓 Tutorials" button (his ask) — it opens the Classic / Manager lessons like Multiplayer opens its row */
{const box=document.querySelector('#mainMenu .mmbtns'),L=document.getElementById('mmLearn');
  if(box&&L&&!box.querySelector('[data-mm82="tut"]')){const t=document.createElement('button');t.type='button';t.className='btn';t.dataset.mm82='tut';
    t.innerHTML=_T('🎓 Tutorials<small>learn Classic or Manager mode</small>');box.appendChild(t);L.classList.add('tut82');
    t.addEventListener('click',()=>{const open=!L.classList.contains('on');L.classList.toggle('on',open);t.classList.toggle('on',open)})}
  const st=document.createElement('style');st.textContent=`#mainMenu .mmbtns>[data-mm82="tut"]{order:5;grid-column:span 6}
#mainMenu .mmbtns>[data-mm82="tut"] small{display:none}
#mainMenu .mmbtns>[data-mm="studio"]{grid-column:span 6!important}
#mainMenu .mmbtns>#mmLearn.tut82{order:6!important;grid-column:span 12!important;display:none!important}
#mainMenu .mmbtns>#mmLearn.tut82.on{display:flex!important}
#mainMenu .mmbtns>#mmLearn.tut82>button{font-size:14px}
#mainMenu .mmbtns>[data-mm="studio"]{order:5!important}`;document.head.appendChild(st)}
/* v0.84 (his asks): Saves wears a floppy disc 💾 (Rules keeps the scroll) and sits before Settings — row = Annals · Rules · Saves · Settings · mute */
{const st=document.createElement('style');st.textContent='#mainMenu .mmrow>[data-mm="saves"]{order:1}#mainMenu .mmrow>[data-mm="settings"]{order:2}#mainMenu .mmrow>#mmMute{order:3}';document.head.appendChild(st)}
function mmSaves84(){const s=document.querySelector('#mainMenu [data-mm="saves"]');if(s&&s.firstChild&&s.firstChild.nodeType===3&&!/^💾/.test(s.firstChild.textContent))s.firstChild.textContent=_T('💾 Saves')}
function mmLabels82(){try{mmSaves84()}catch(e){}const b=document.querySelector('#mainMenu [data-mm="rules"]');if(b&&!/^📜 Rules$/.test((b.dataset.en84||b.textContent).trim()))b.innerHTML=_T('📜 Rules');
  const a=document.querySelector('#mainMenu [data-mm="annals"]');if(a&&!/^🏛️ Annals$/.test((a.dataset.en84||a.textContent).trim()))a.innerHTML=_T('🏛️ Annals')}
{const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);try{mmLabels82()}catch(e){}return r}}
setTimeout(()=>{try{mmLabels82()}catch(e){}},500);setTimeout(()=>{try{mmLabels82()}catch(e){}},2500);
/* Online Domus: the gladiator showcase sits on his parchment (dark cards on light parchment, framed in gold) */
{const st=document.createElement('style');st.textContent=`#onl .onl-gslots{background:url(${typeof assetURL==='function'?assetURL('stone_wall.webp'):'assets/stone_wall.webp'}) center/cover;padding:14px;border-radius:10px;border:1px solid var(--gold,#d6ab4c);box-shadow:inset 0 0 40px rgba(60,40,20,.55),0 4px 18px rgba(0,0,0,.45)}
#onl .onl-gslots>*{background:linear-gradient(180deg,#2c2016,#1d150e)!important;box-shadow:0 4px 12px rgba(40,25,10,.55)}
#onl .onl-gslot.empty{background:rgba(30,20,12,.55);border-color:rgba(60,40,20,.6);color:#f0e2c4}`;document.head.appendChild(st)}
/* the Domus main card (house name, record, patron) on his parchment — dark ink text, the record tiles and inputs stay dark */
{const st=document.createElement('style');st.textContent=`#onl .dom82{background:url(${typeof assetURL==='function'?assetURL('parchment.webp'):'assets/parchment.webp'}) center/cover!important;border:1px solid var(--gold,#d6ab4c)!important;box-shadow:inset 0 0 50px rgba(90,60,25,.45),0 4px 18px rgba(0,0,0,.4);color:#3a2414}
#onl .dom82 h3{color:#5a1e10!important;text-shadow:none}
#onl .dom82 .rc-sub,#onl .dom82 small.rc-sub,#onl .dom82 p,#onl .dom82 label,#onl .dom82 summary,#onl .dom82 .pat82-f b{color:#4a3018!important}
#onl .dom82 .dom82-crest{filter:sepia(1) saturate(2) brightness(.6)}
#onl .dom82 .dom82-rec>div{background:rgba(36,24,14,.9);border-color:#6a4a26}
#onl .dom82 .dom82-rec small{color:#d8c6a2!important}
#onl .dom82 .pat82{border-top-color:rgba(90,60,25,.35)}
#onl .dom82 select,#onl .dom82 .tin{background:#241a12;color:#f0e2c4}
#onl .dom82 .btn{background:rgba(36,24,14,.9);color:#f0e2c4}`;document.head.appendChild(st)}
/* the Glory rank bar runs down to the bottom of the gladiator cards (measured; wide layout only, ≥300 px) */
function rb82Fit(){const rb=document.querySelector('#onl .rb82'),gs=document.querySelector('#onl .onl-gslots'),bd=rb&&rb.querySelector('.rb82-body');if(!bd)return;
  if(!gs||innerWidth<=760){if(bd.style.height)bd.style.height='';return}
  const r=bd.getBoundingClientRect(),pad=rb.getBoundingClientRect().bottom-r.bottom;const h=Math.round(gs.getBoundingClientRect().bottom-r.top-pad);const v=Math.max(300,h)+'px';if(bd.style.height!==v)bd.style.height=v}
{const st=document.createElement('style');st.textContent='@media(min-width:761px){#onl .rb82{position:static}}';document.head.appendChild(st);
 setInterval(()=>{if(document.querySelector('#onl .rb82'))rb82Fit()},400);addEventListener('resize',()=>setTimeout(rb82Fit,50))}
/* the round's switched-off rules live only in the turn panel's ⓘ — the ⃠ chip row under the name never shows (it crept back) */
{const st=document.createElement('style');st.textContent='#turnInd .tprules{display:none!important}';document.head.appendChild(st)}
/* the Blessings bag holds 2 spiders (was 6 of 36 in the placeholder mix — two could turn up in the first rotations) */
BLESSING_TABLE.spiders=2;
/* the Open Arena Chest button glimmers gold while it is offered (you stand on or hold the chest with a key);
   the chest's Level 4 card flips LANDSCAPE, like the weapon cards: the back art turned on its side, the weapon face upright */
{const st=document.createElement('style');st.textContent=`
[data-act="chest"]:not([disabled]){position:relative;overflow:hidden;border-color:#e8c96a!important;color:#ffe9a8!important;background:linear-gradient(180deg,#5a4214,#2e2008)!important;box-shadow:0 0 0 1px rgba(232,201,106,.5),0 0 12px rgba(232,180,60,.45);animation:chestGlow82 2.4s ease-in-out infinite}
[data-act="chest"]:not([disabled])::after{content:'';position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,240,190,.55),transparent);animation:chestSheen82 2.4s ease-in-out infinite;pointer-events:none}
@keyframes chestGlow82{50%{box-shadow:0 0 0 1px rgba(255,220,120,.85),0 0 20px rgba(240,190,70,.75)}}
@keyframes chestSheen82{0%{left:-60%}60%,100%{left:130%}}
body.calm [data-act="chest"]::after{animation:none;display:none}body.calm [data-act="chest"]{animation:none}
@media (prefers-reduced-motion:reduce){[data-act="chest"]::after{display:none}[data-act="chest"]{animation:none}}
.chest75-card{width:300px!important;aspect-ratio:600/416!important}
.chest75-back{right:auto!important;bottom:auto!important;left:50%!important;top:50%!important;width:208px;height:300px;transform:translate(-50%,-50%) rotate(90deg)}
.chest75-front .cimg{width:100%!important;transform:translate(-50%,-50%)!important}`;document.head.appendChild(st)}
/* phones sideways: the actions drawer never sits over your move. In your ACTION phase it stays shut (the orange tiles show at once;
   ⚔ glows gold and opens it); picking an action or tapping the sand shuts it again; the CHOICE phase still opens it (you need its two buttons). */
function plActMine82(){return !!(S&&!S.over&&typeof humanTurn==='function'&&humanTurn())}
function plActFix82(){const B=document.body;if(!B.classList.contains('phoneL')||typeof PL==='undefined')return;
  const act=plActMine82()&&S.phase==='action';
  if(act&&B.classList.contains('pl-act')&&PL.actUser!==true){B.classList.remove('pl-act');try{plSync()}catch(e){}}
  const b=document.querySelector('#plDock [data-pl="act"]');if(b)b.classList.toggle('glow82',act&&!B.classList.contains('pl-act'))}
setInterval(plActFix82,120);
new MutationObserver(()=>plActFix82()).observe(document.body,{attributes:true,attributeFilter:['class']});
document.addEventListener('click',e=>{const B=document.body;if(!B.classList.contains('phoneL')||typeof PL==='undefined')return;
  if(e.target.closest&&e.target.closest('#actions [data-act]')&&S&&S.phase==='action'){setTimeout(()=>{B.classList.remove('pl-act');PL.actUser=null;try{plSync()}catch(err){}},0)}},true);
document.addEventListener('pointerdown',e=>{const B=document.body;if(!B.classList.contains('phoneL')||typeof PL==='undefined')return;
  if(e.target&&e.target.id==='cv'&&B.classList.contains('pl-act')&&S&&S.phase==='action'){B.classList.remove('pl-act');PL.actUser=null;try{plSync()}catch(err){}}},true);
{const st=document.createElement('style');st.textContent=`#plDock button.glow82{border-color:#e8c96a;color:#ffe9a8;background:rgba(90,66,20,.92);box-shadow:0 0 0 2px rgba(232,201,106,.55),0 0 14px rgba(240,190,70,.7);animation:chestGlow82 1.8s ease-in-out infinite}
body.calm #plDock button.glow82{animation:none}`;document.head.appendChild(st)}
/* words of power on touch screens (no keyboard for C): HOLD the main menu's version badge ~0.7 s → the same prompt; a tap still opens What's new */
{let t82=null,held82=false;const clr=()=>{if(t82){clearTimeout(t82);t82=null}};
 document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.mmver');if(!b)return;held82=false;clr();
   t82=setTimeout(()=>{t82=null;if(typeof menuUp79==='function'&&!menuUp79())return;if(CUR_MODAL||(typeof modalBusy==='function'&&modalBusy()))return;held82=true;try{navigator.vibrate&&navigator.vibrate(20)}catch(err){}if(typeof cheatPrompt==='function')cheatPrompt()},700)},true);
 for(const ev of ['pointerup','pointercancel','pointerleave'])document.addEventListener(ev,clr,true);
 window.addEventListener('click',e=>{if(held82&&e.target.closest&&e.target.closest('.mmver')){held82=false;e.preventDefault();e.stopPropagation()}},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.mmver'))e.preventDefault()},true);
 const st=document.createElement('style');st.textContent='.mmver{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}';document.head.appendChild(st)}
/* the main menu's show keeps its proportions: on narrow screens it scales DOWN instead of squeezing the figures sideways */
{const st=document.createElement('style');st.textContent='#mmCv{height:auto!important;aspect-ratio:1240/340;max-height:170px}';document.head.appendChild(st)}
/* buttons inside a parchment letter keep light text (they inherited the letter's dark ink on their dark face — "File it away" read blank) */
{const st=document.createElement('style');st.textContent='details.mail .btn{color:#f0e2c4!important}details.mail .btn.primary{color:#fff3e6!important}';document.head.appendChild(st)}
