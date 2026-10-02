/* =====================================================================
   64-V54 · PIACULA FOR EVERY CLASS, THE PRINTED CLASSES AS THE DEFAULTS,
             INVITATIONALS, A FRIENDLIER EVENT DESIGNER (v0.54)
   =====================================================================
   Tweakables are marked TWEAK.
   ===================================================================== */

/* =========================== A. PIACULA =========================== */
/* Every class on the sand brings exactly one Piaculum into the arena deck — and only those classes.
   A printed class uses its printed card. Any other class (Damnatio, your own classes) gets a card drawn
   from the printed art, with that class's name written in that class's colour.
   A character built on a printed class shares that class's card; a character on one of your classes
   shares that class's card. The card pays whoever of that class is still standing. */

/* piaIdentity(player) → the class key a Piaculum is about */
function piaIdentity(player){const C=CLASSES[player.cls];if(!C||!C.custom)return player.cls;const ref=C.clsRef||'';
  if(ref.startsWith('cls:'))return ref.slice(4);if(ref.startsWith('ccl:'))return 'ccl_'+ref.slice(4);return player.cls}
/* piaLabel(identity) → {name, color} to print on the card */
function piaLabel(id){if(CLASSES[id]&&!CLASSES[id].custom)return {name:CLASSES[id].name,color:CLASSES[id].color};
  if(String(id).startsWith('ccl_')){const k=(CUSTOM.classes||[]).find(c=>c.id===id.slice(4));if(k)return {name:k.name,color:k.color}}
  const C=CLASSES[id];return {name:C?C.name:'Gladiator',color:C?C.color:'#a3281f'}}
const hasPrintedPia=id=>!!(CARDS['pia_'+id]&&!CARDS['pia_'+id].custom&&CARDS['pia_'+id].img!=null);
/* piaKeyFor(identity) → the card key in CARDS (registers a drawn card when there is no printed one) */
function piaKeyFor(id){if(hasPrintedPia(id))return 'pia_'+id;const key='pia_cc_'+String(id).replace(/[^a-zA-Z0-9_]/g,'');const L=piaLabel(id);
  CARDS[key]={n:'Piaculum',type:'instant',d:`Give ${L.name} 2 coin. If that player is you, everyone gives you 2 coin.`,q:'To bear this worthily is good fortune',img:null,cls:id,custom:1};return key}
/* the deck: strip every Piaculum, then add one per class identity actually playing */
{const baseState=newState;newState=function(config){const r=baseState.apply(this,arguments);try{if(S&&Array.isArray(S.deck)&&S.deck.length){
    const bottom=S.deck[0]==='endgame'?S.deck.shift():null;S.deck=S.deck.filter(k=>!(CARDS[k]&&CARDS[k].cls));
    const ids=[...new Set(S.players.map(piaIdentity))];for(const id of ids){const k=piaKeyFor(id);S.deck.splice(Math.floor(rand()*(S.deck.length+1)),0,k)}
    if(bottom)S.deck.unshift(bottom)}}catch(e){console.error(e)}return r}}
/* drawing one: pay the gladiator of that class (by identity, so characters count as their class) */
{const baseDrawn=resolveDrawn;resolveDrawn=async function(player,k){const C=CARDS[k];if(!C||!C.cls)return baseDrawn.apply(this,arguments);
  const id=C.cls;const L=piaLabel(id);cardShow('c:'+k,player,'🂠 Drawn');log(`${nm(player)} reveals <b>${C.n}</b>: ${C.d}`);
  const tgt=activePlayers().find(q=>piaIdentity(q)===id);
  if(!tgt){log(`No ${esc(L.name)} is in the arena. The Piaculum is discarded.`);return}
  if(tgt===player){let tot=0;for(const q of activePlayers())if(q!==player){const v=Math.min(2,q.coin);q.coin-=v;coinLog(q,-v,'cards');tot+=v}player.coin+=tot;coinLog(player,tot,'cards');log(`Everyone pays the ${esc(L.name)}: ${nm(player)} collects ${tot} coin.`)}
  else{const v=Math.min(2,player.coin);player.coin-=v;coinLog(player,-v,'cards');tgt.coin+=v;coinLog(tgt,v,'cards');log(`${nm(player)} pays ${nm(tgt)} ${v} coin.`)}}}
/* the drawn card: the printed Piaculum art, with the first line re-lettered — the class name in its colour.
   Built as layered HTML over the printed card (no canvas), so it works from any origin. */
{const baseCard=cardHTML;cardHTML=function(ref,size='md',extra=''){if(ref&&String(ref).startsWith('c:pia_cc_')){const C=CARDS[ref.slice(2)];const L=piaLabel(C?C.cls:'');
    return `<span class="cimg ${size} piagen" style="${cardStyle('c:pia_royalty')}" role="img" aria-label="Piaculum · ${esc(L.name)}" data-card="${ref}" ${extra}><span class="piamask" style="font-size:${Math.min(7.3,7.3*21/(14+String(L.name).length)).toFixed(2)}cqw">Give <b style="color:${esc(L.color)}">${esc(L.name)}</b> [2 coin]</span></span>`}
  return baseCard.apply(this,arguments)}}
function piaArtImage(){return null} /* kept for callers; the card is layered HTML now */
/* ================ B. THE CLASS DESIGNER: THE PRINTED CLASSES ARE THE DEFAULTS ================ */
/* printedClass(key) → a class object built from a printed class card (its colour, weapons, armor, items) */
function printedClass(key){const C=CLASSES[key];const t=charFromClass({},key);
  return {sysKey:key,id:'sys_'+key,name:C.name,hero:C.hero,city:C.city,color:C.color,R:t.R,L:t.L,arm:t.arm,coin:t.coin,keys:t.keys,cf:0,items:[...(C.items||[]),'','',''].slice(0,3),abil:t.abil,abilVal:1,weak:t.weak,abilText:'',lore:C.ab||''}}
const PRINTED_KEYS=()=>BASE_CLS.filter(k=>CLASSES[k]&&!CLASSES[k].custom);
/* colours: yours must stay clear of the printed ones and of each other */
const hexRGB=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(String(h||''));const n=m?parseInt(m[1],16):0;return [n>>16&255,n>>8&255,n&255]};
const colorGap=(a,b)=>{const A=hexRGB(a),B=hexRGB(b);return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2])};
const CLASS_COLOR_GAP=70; /* TWEAK: how different two class colours must be */
function classColorClash(col,exceptId){const printed=PRINTED_KEYS().map(k=>({n:CLASSES[k].name,c:CLASSES[k].color}));const mine=(CUSTOM.classes||[]).filter(c=>c.id!==exceptId).map(c=>({n:c.name,c:c.color}));
  return [...printed,...mine].find(x=>colorGap(x.c,col)<CLASS_COLOR_GAP)||null}
function uniqueClassColor(exceptId){const hsl=(h,s,l)=>{s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return '#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')};
  for(let i=0;i<240;i++){const c=hsl(Math.floor(Math.random()*360),45+Math.floor(Math.random()*45),35+Math.floor(Math.random()*30));if(!classColorClash(c,exceptId))return c}return '#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}
{const baseBlank=blankClass;blankClass=function(){const k=baseBlank();k.color=uniqueClassColor();k.hero='';return k}}
/* only printed classes and yours are offered (the v0.53 presets become ordinary classes of yours, below) */
classOpts=function(){return [...PRINTED_KEYS().map(k=>['cls:'+k,`🛡 ${CLASSES[k].name} · printed`]),...(CUSTOM.classes||[]).filter(c=>c.status!=='retired'&&c.rolls!==false).map(c=>['ccl:'+c.id,`✦ ${c.name}${c.sandbox?' · sandbox':''}`])]};
{const baseLoad=loadCustoms;loadCustoms=async function(){const r=await baseLoad.apply(this,arguments);try{let changed=0;
  for(const c of CUSTOM.chars||[]){if(!String(c.classRef||'').startsWith('ccp:'))continue;const P=CLASS_PRESETS.find(k=>k.key===c.classRef.slice(4));if(!P){c.classRef='cls:soldier';applyClassToChar(c);changed++;Store.put('customChars',c.id,JSON.parse(JSON.stringify(c))).catch(()=>{});continue}
    let mine=(CUSTOM.classes||[]).find(k=>k.from==='preset:'+P.key);
    if(!mine){mine={...JSON.parse(JSON.stringify(P)),id:'kp_'+P.key,from:'preset:'+P.key,sys:0,custom:true,status:'active',created:new Date().toISOString().slice(0,10)};delete mine.key;delete mine.sysKey;
      let nm0=P.name;for(let i=2;(CUSTOM.classes||[]).some(k=>k.name.toLowerCase()===nm0.toLowerCase())||PRINTED_KEYS().some(k=>CLASSES[k].name.toLowerCase()===nm0.toLowerCase());i++)nm0=P.name+' '+i;mine.name=nm0;
      if(classColorClash(mine.color,mine.id))mine.color=uniqueClassColor(mine.id);CUSTOM.classes.push(mine);await saveClass(mine)}
    c.classRef='ccl:'+mine.id;applyClassToChar(c);changed++;Store.put('customChars',c.id,JSON.parse(JSON.stringify(c))).catch(()=>{})}
  if(changed)registerCustoms()}catch(e){console.error(e)}return r}}
/* a small, legible thumbnail instead of a shrunken card */
function classThumbHTML(k,tokenHTML=''){const W2=(k.R&&W[k.R]?W[k.R].n:'fists')+(k.L&&W[k.L]?' & '+W[k.L].n:'');
  return `<span class="clsthumb" style="--cc:${esc(k.color||'#a3281f')}"><span class="cthead">${esc(String(k.name||'Class').toUpperCase())}</span><span class="ctbody">${tokenHTML||'<span class="ctnotok" title="A character’s token appears here">?</span>'}</span><span class="ctfoot">${esc(W2)}</span></span>`}
{const baseStudio=classStudioHTML;classStudioHTML=function(){let h=baseStudio();try{const k=ST.draft||{};
  /* the champion is whoever takes the class — no field for it */
  h=h.replace(/<label>Champion \(card subtitle\)[\s\S]*?<\/label>/,'');
  /* what the weakness does */
  const W0=WEAKNESSES[k.weak||'none'];h=h.replace(/(<label>Weakness<select[\s\S]*?<\/select>)<\/label>/,`$1<small class="rc-sub weakdesc">${esc(W0?W0[1]:'')}</small></label>`);
  /* name and colour checks, live */
  const dup=classNameTaken(k.name,k.id);const clash=classColorClash(k.color,k.id);
  h=h.replace(/(<label>Class name[\s\S]*?<\/label>)/,`$1${dup?`<p class="clswarn">⚠ “${esc(k.name)}” is taken — class names are unique.</p>`:''}`);
  h=h.replace(/(<label>Color<input type="color"[^>]*><\/label>)/,`$1${clash?`<p class="clswarn">⚠ Too close to ${esc(clash.n)}’s colour — pick another, or <button type="button" class="btn tksm" data-clsa="newcolor">🎲 a free colour</button></p>`:''}`);
  if(dup||clash)h=h.replace(/(data-clsa="save")/,'$1 disabled');
  /* the lists: your classes as thumbnails, the printed classes as the system defaults */
  const used=id=>(CUSTOM.chars||[]).filter(c=>c.classRef==='ccl:'+id);
  const mine=(CUSTOM.classes||[]).map(c=>{const u=used(c.id);const tok=u[0]&&typeof figureHTML==='function'?figureHTML(tokenOfChar(u[0]),54):'';
    return `<div class="lrow" style="--pc:${esc(c.color||'#c9a44a')}">${classThumbHTML(c,tok)}<div class="t"><b>${esc(c.name)}</b> ${c.sandbox?customTag({sandbox:1}):''}<small>${c.abil&&c.abil!=='none'?esc(ABILITIES[c.abil][0]):'no ability'} · ${c.coin||0} coin${+c.cf?` · ${c.cf} CF`:''} · used by ${u.length?u.map(x=>esc(x.name)).join(', '):'no one yet'}</small></div>${crActs('cl',c)}</div>`}).join('');
  const printed=PRINTED_KEYS().map(key=>{const P=printedClass(key);const tok=typeof clsPieceHTML==='function'?clsPieceHTML(key,54):'';const items=(CLASSES[key].items||[]).map(i=>{const o=CLS_ITEM_OPTS.find(z=>z[0]===i);return o?o[1]:i}).join(', ');
    return `<div class="lrow" style="--pc:${P.color}" data-card="k:${key}">${classThumbHTML(P,tok)}<div class="t"><b>${esc(P.name)}</b> <span class="rc-sub">${esc(CLASSES[key].sub||'')}</span><small>${esc(String(CLASSES[key].ab||'').replace(/^Ability:\s*/,''))}</small><small>${[P.R,P.L].filter(Boolean).map(w=>W[w].n).join(' & ')} · ${P.coin} coin · ${P.keys} key${P.keys===1?'':'s'}${items?' · '+esc(items):''}</small></div>${sysActs(`data-clsa="copybase" data-v="${key}"`)}</div>`}).join('');
  h=h.replace(/<div class="stlist"><h4>Your classes[\s\S]*$/,`<div class="stlist"><h4>Your classes · ${(CUSTOM.classes||[]).length}</h4>${mine?`<div class="list2 onecol">${mine}</div>`:'<p class="hint">None yet — save one above, or copy a printed class.</p>'}<h4>🔒 System classes · the printed ${PRINTED_KEYS().length} <span class="rc-sub">hover for the printed card · copy one to make it yours</span></h4><div class="list2 onecol">${printed}</div></div>`)}catch(e){console.error(e)}return h}}
function classNameTaken(name,exceptId){const n=String(name||'').trim().toLowerCase();if(!n)return false;return PRINTED_KEYS().some(k=>CLASSES[k].name.toLowerCase()===n)||(CUSTOM.classes||[]).some(c=>c.id!==exceptId&&String(c.name).toLowerCase()===n)}
{const baseClick=classStudioClick;classStudioClick=async function(b,redraw){const a=b.dataset.clsa;
  if(a==='newcolor'&&ST.draft){ST.draft.color=uniqueClassColor(ST.draft.id);return redraw()}
  if(a==='save'&&ST.draft){if(classNameTaken(ST.draft.name,ST.draft.id)){mToast('🎭 That class name is taken — class names are unique.');return}if(classColorClash(ST.draft.color,ST.draft.id)){mToast('🎨 That colour is too close to another class — pick another.');return}}
  const r=await baseClick(b,redraw);
  if((a==='copybase'||a==='copypreset'||a==='random'||a==='fresh'||a==='new')&&ST.draft&&ST.draft._cls&&classColorClash(ST.draft.color,ST.draft.id)){ST.draft.color=uniqueClassColor(ST.draft.id);let nm0=ST.draft.name;for(let i=2;classNameTaken(nm0,ST.draft.id);i++)nm0=ST.draft.name.replace(/ (II|\d+)$/,'')+' '+(i===2?'II':i);ST.draft.name=nm0;redraw()}
  return r}}
/* name typing re-checks without a full redraw */
document.addEventListener('input',e=>{const t=e.target;if(typeof ST==='undefined'||ST.tab!=='classes'||!ST.draft||!ST.draft._cls||!t.dataset||(t.dataset.f!=='name'&&t.dataset.f!=='color'))return;
  clearTimeout(document._clsChk);document._clsChk=setTimeout(()=>{const st=$('#studio'),box=$('#mBody');if(!st||!box)return;const sc=box.scrollTop;const focus=t.dataset.f;const pos=t.selectionStart;st.innerHTML=studioHTML();box.scrollTop=sc;const n=st.querySelector(`[data-f="${focus}"]`);if(n){n.focus();try{if(pos!=null)n.setSelectionRange(pos,pos)}catch(err){}}},450)});

/* ======================= C. INVITATIONALS (was: Special events) ======================= */
/* An Invitational is a shell: pick the ARENA (any printed event or one of your Custom Events) and the
   TROPHY (printed or yours), then the purse, the field and how often it comes. New ones start off the
   rolls. Cohorts belong to Custom Events now (Event Designer → Classes & NPCs). */
{const baseOnly=specialOnlyHTML;specialOnlyHTML=function(){let h=baseOnly();try{
  h=h.replace(/<div class="sect">🤝 Cohorts in this event[\s\S]*?<\/div>\s*<div class="chkgrid">[\s\S]*?<\/div>/,'');
  const pull=re=>{const m=h.match(re);if(!m)return '';h=h.replace(m[0],'');return m[0]};
  const arena=pull(/<label>(?:The bout|The heats)<select[\s\S]*?<\/select><\/label>/);const trophy=pull(/<label>Trophy<select[\s\S]*?<\/select><\/label>/);
  const shell=`<div class="card2 sxshell"><div class="sect" style="margin-top:0">The invitational</div><div class="formgrid">${arena.replace(/<label>(The bout|The heats)/,'<label>🏟 The arena · $1 <span class="rc-sub">printed or your Custom Event</span>')}${trophy.replace('<label>Trophy','<label>🏆 The trophy <span class="rc-sub">printed or yours</span>')}</div></div>`;
  h=h.replace('<div><div class="formgrid"><label>Name',`<div>${shell}<div class="formgrid"><label>Name`);
  h=h.replace(/^<p>[\s\S]*?<\/p>/,`<p>Design the <b>invitationals</b> that arrive in Manager mode. Each is a shell: pick the <b>arena</b> (a printed event or one of your Custom Events) and the <b>trophy</b>, then the field, the purse and how often it comes. New ones start off the rolls. The system invitationals sit at the bottom: locked, copy one to make it yours. ${customTag()}</p>`)
    .replace('💾 Save special event','💾 Save invitational').replace(/Your special events/,'Your invitationals').replace(/The system special events/,'The system invitationals').replace(/special event/g,'invitational').replace(/Special event/g,'Invitational')}catch(e){console.error(e)}return h}}

/* ============ D. THE EVENT DESIGNER: BEASTS & COHORTS, REAL PIECES, ARENA MUSIC ============ */
/* One “🐾 Beasts & cohorts” picker with four shelves — the stock beasts, your beasts, the myth starters
   and the cohorts — each shown as its real token. “Add” places a beast on the board (a myth starter is
   first saved as one of your beasts); a cohort joins the event. */
function edHubHTML(){const e=ST.draft;const L=e.layout;const tab=ST.edHub||'stock';
  const onBoard=nm=>L.npcs.some(n=>n.name===nm);const tok=(html,label,sub,btn)=>`<div class="hubcard">${html}<b>${esc(label)}</b><small>${sub}</small>${btn}</div>`;
  let body='';
  if(tab==='stock')body=[...BASE_NPCS.map(b=>[b.name,b.t]),...SPAWN_NPCS.map(([n,t])=>[n,t])].map(([nm,t])=>tok(npcTokHTML({t,name:nm},54),nm,`${NPCT[t].n} · HP ${NPCT[t].hp} · ATK ${NPCT[t].ap}`,`<button type="button" class="btn tksm ${onBoard(nm)?'on':''}" data-hub="stock" data-v="${esc(nm)}">${onBoard(nm)?'✓ On the board':'✚ Add'}</button>`)).join('');
  if(tab==='mine')body=(CUSTOM.npcs||[]).map(n=>{const on=L.npcs.some(x=>x.t==='cn_'+n.id);return tok(cnTokHTML(n,54),n.name,`${esc(n.kind||'custom')} · HP ${n.hp} · ATK ${n.ap}`,`<button type="button" class="btn tksm ${on?'on':''}" data-hub="mine" data-v="${n.id}">${on?'✓ On the board':'✚ Add'}</button>`)}).join('')||'<p class="hint">No beasts of your own yet — make one under Fighters → 🐾 Beasts, or add a myth starter.</p>';
  if(tab==='myth')body=MYTH_BEASTS.map((M,i)=>{const have=(CUSTOM.npcs||[]).find(n=>n.name===M.name);const on=have&&L.npcs.some(x=>x.t==='cn_'+have.id);
    return tok(rtokSvgHTML(M.rt,M,54,M.name),M.name,`${esc(M.kind)} · HP ${M.hp} · ATK ${M.ap}`,`<button type="button" class="btn tksm ${on?'on':''}" data-hub="myth" data-v="${i}" title="${esc(M.lore)}">${on?'✓ On the board':'✚ Add'}</button>`)}).join('');
  if(tab==='cohorts'){const P=(typeof allPairings==='function'?allPairings():[]).filter(Q=>!pairMembersOK(Q));body=P.map(Q=>{const on=(e.pairs||[]).includes(Q.id);return tok(`<span class="hubrow">${(Q.members||[]).filter(Boolean).map(r=>pmTok(r,30)).join('')}</span>`,Q.name,`${esc((PAIR_TYPES[Q.type]||PAIR_TYPES.duo)[0])}${Q.sys?' · system':''}`,`<button type="button" class="btn tksm ${on?'on':''}" data-hub="cohort" data-v="${Q.id}">${on?'✓ In the event':'✚ Add'}</button>`)}).join('')||'<p class="hint">No cohorts yet — make them under Fighters → 🤝 Cohorts.</p>'}
  const tabs=[['stock','🏟 Stock beasts'],['mine','✦ Your beasts'],['myth','📜 Myth starters'],['cohorts','🤝 Cohorts']];
  return `<div class="card2 edhub"><div class="sect" style="margin-top:0">🐾 Beasts &amp; cohorts <span class="rc-sub">add them to this event — move beasts with the Beast tool</span></div><div class="seg" role="tablist">${tabs.map(([k,l])=>`<button type="button" data-hubtab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div><div class="hubgrid">${body}</div></div>`}
{const baseRoster=edRosterHTML;edRosterHTML=function(){let h=baseRoster();try{
  /* the tick-box lists give way to the picker (cohort and beast ticks included) */
  h=h.replace(/<h4>NPCs \(select NPCs\)<\/h4>[\s\S]*?<\/div>(?=\s*(?:\$\{|<h4>|$))/,'');h=h.replace(/<h4>🤝 Cohorts[\s\S]*?<\/div>\s*$/,'');
  h=h.replace(/<h4>NPCs \(select NPCs\)<\/h4><p class="hint"[^>]*>[\s\S]*?<\/p>\s*<div class="chkgrid">[\s\S]*?<\/div>/,'');
  h+=edHubHTML()}catch(e){console.error(e)}return h}}
function edStudioRedraw(){const st=$('#studio'),box=$('#mBody');if(!st)return;const sc=box.scrollTop;st.innerHTML=studioHTML();box.scrollTop=sc}
document.addEventListener('click',async e=>{if(typeof ST==='undefined'||ST.tab!=='events'||!ST.draft)return;const t=e.target.closest('[data-hubtab],[data-hub]');if(!t)return;e.stopPropagation();
  const d=ST.draft,L=d.layout;if(t.dataset.hubtab){ST.edHub=t.dataset.hubtab;return edStudioRedraw()}
  const kind=t.dataset.hub,v=t.dataset.v;
  const toggleStock=nm=>{if(L.npcs.some(n=>n.name===nm)){L.npcs=L.npcs.filter(n=>n.name!==nm);return}const b=BASE_NPCS.find(x=>x.name===nm),sp=SPAWN_NPCS.find(x=>x[0]===nm);const home=b?b.home:sp[2];L.npcs=L.npcs.filter(n=>!(n.r===home[0]&&n.c===home[1]));L.npcs.push({key:nm,t:b?b.t:sp[1],name:nm,r:home[0],c:home[1],beh:b?'zone':NPCT[sp[1]].scan?'hunt':'zone'})};
  const freeTile=()=>{for(const [r,c] of [[6,6],[5,6],[6,5],[5,5],[6,7],[7,6],[4,6],[6,4]])if(!L.npcs.some(n=>n.r===r&&n.c===c)&&!L.pillars.some(p=>p.r===r&&p.c===c))return [r,c];return [6,6]};
  const toggleMine=id=>{if(L.npcs.some(n=>n.t==='cn_'+id)){L.npcs=L.npcs.filter(n=>n.t!=='cn_'+id);return}const cn=CUSTOM.npcs.find(x=>x.id===id);if(!cn)return;const [r,c]=freeTile();L.npcs.push({key:'cn_'+id,t:'cn_'+id,name:cn.name,r,c,beh:cn.beh||'zone'})};
  if(kind==='stock')toggleStock(v);
  if(kind==='mine')toggleMine(v);
  if(kind==='myth'){const M=MYTH_BEASTS[+v];let have=(CUSTOM.npcs||[]).find(n=>n.name===M.name);
    if(!have){const n=mythDraft(+v);n.id='n'+Date.now().toString(36);n.custom=true;n.created=new Date().toISOString().slice(0,10);CUSTOM.npcs.push(JSON.parse(JSON.stringify(n)));await Store.put('customNpcs',n.id,JSON.parse(JSON.stringify(n))).catch(()=>{});registerCustoms();have=n;mToast(`📜 ${esc(M.name)} is now one of your beasts — tweak it any time under 🐾 Beasts.`)}
    toggleMine(have.id)}
  if(kind==='cohort'){d.pairs=(d.pairs||[]).includes(v)?d.pairs.filter(x=>x!==v):[...(d.pairs||[]),v]}
  edStudioRedraw()},true);
/* real pieces on the design grid: beast tokens, the Blessings token, the tunnel door */
{const baseCell=edCell;edCell=function(r,c){let h=baseCell(r,c);try{const L=ST.draft.layout;const n=L.npcs.find(x=>x.r===r&&x.c===c);
  if(n&&NPCT[n.t]){const cn=typeof cnRecord==='function'?cnRecord(n):null;const tk=cn?cnTokHTML({...cn,name:n.name},999):npcTokHTML(n,999);h=h.replace(/<span class="ic">[\s\S]*?<\/span><\/span>|<span class="ic"><span[\s\S]*?<\/span><\/span>/,`<span class="ic edtok">${tk.replace(/width:999px;height:999px/,'width:86%;height:86%')}</span>`)}
  const pl=L.pillars.find(p=>p.r===r&&p.c===c);if(pl&&pl.pot)h=h.replace('<span class="sub">🏺</span>',`<span class="sub edpot" style="background-image:url('${assetURL('blessing.png')}')"></span>`);
  if(L.tunnels.some(([a,b])=>a===r&&b===c)&&!pl)h=h.replace('<span class="ic">◙</span>',`<span class="ic edtun" style="background-image:url('${assetURL('tunnel_door.jpg')}')"></span>`)}catch(e){}return h}}
/* the arena's music: any of the sixteen themes you have unlocked */
function edMusicOpts(){const all=[...AUD_TRACKS,...(typeof AUD_EXTRA!=='undefined'?AUD_EXTRA:[])];return [['','🎲 A random theme each time'],...all.map(([k,nm])=>[k,`${musicUnlocked(k)?'🎵':'🔒'} ${k} — ${nm}${musicUnlocked(k)?'':' (locked)'}`])]}
{const baseRules=edRulesHTML;edRulesHTML=function(){let h=baseRules();try{const e=ST.draft;const opts=edMusicOpts();
  h=`<div class="card2" style="margin-bottom:8px"><label style="display:grid;gap:4px">🎶 Arena music <select class="tin" data-edmusic="1">${opts.map(([k,l])=>`<option value="${esc(k)}" ${(e.music||'')===k?'selected':''} ${k&&!musicUnlocked(k)?'disabled':''}>${esc(l)}</option>`).join('')}</select><span class="rc-sub">Themes unlock as you win in each city. The final duel keeps its boss theme.</span></label></div>`+h}catch(err){}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.edmusic||typeof ST==='undefined'||!ST.draft)return;e.stopPropagation();ST.draft.music=t.value||''},true);
/* the event carries its music into play */
{const baseDef=eventDef;eventDef=function(e){const d=baseDef.apply(this,arguments);try{if(d&&e&&e.music)d.music=e.music}catch(err){}return d}}

/* ============================ E. MANAGER MODE ============================ */
/* a fighter who survives (or wins) a weekly bout banks the coin they finished with */
{const baseApply=applyBout;applyBout=function(bi,res,opt){const w=W_();const b=w&&w.night&&w.night.bouts[bi];const was=b?b.done:true;const r=baseApply.apply(this,arguments);
  try{if(b&&!was&&res&&res.rows)for(const row of res.rows){const g=gById(row.mgrId);if(!g||g.lanista||row.alive===false||!(row.coin>0))continue;g.purse=(g.purse||0)+row.coin;g.rec.banked=(g.rec.banked||0)+row.coin;
      const m=g.contract?mgrById(g.contract.mgr):null;if(m&&m.isPlayer)ghist(g,`banked ${row.coin} coin from the ${TIERS[b.tier].n}`)}}catch(e){console.error(e)}return r}}
/* hungry free agents pay a small house to take them; fame-hungry fighters ask to be entered */
const PAYJOIN={maxFame:35,ovr:[44,64],weeksUnsigned:3,chance:0.35,wage:1,weeks:6}; /* TWEAK */
const FIGHT_REQ={idleWeeks:2,moraleUp:4,moraleDown:6}; /* TWEAK */
const fameHungry=g=>!!(g.motives&&g.motives[0]&&['glory','playing','spectacle'].includes(g.motives[0][0]));
function payJoinOffer(w,pm){if(w.payJoin&&w.payJoin.until>=w.week)return;w.payJoin=null;if((pm.fame||0)>PAYJOIN.maxFame||isByeWk(w.week))return;if(Math.random()>PAYJOIN.chance)return;
  const pool=freeAgents().filter(g=>!g.inj&&!g.noPayJoin&&g.unsigned>=PAYJOIN.weeksUnsigned&&effOvr(g)>=PAYJOIN.ovr[0]&&effOvr(g)<=PAYJOIN.ovr[1]);if(!pool.length)return;
  const g=pickOne(pool);const pay=3+Math.floor((PAYJOIN.ovr[1]-effOvr(g))/3)+rnd(5);w.payJoin={gid:g.id,pay,until:w.week+1};
  tnews(`${ICO.coin} <b>${esc(g.name)}</b> has gone ${g.unsigned} weeks without a house and offers to <b>pay you ${pay} coin</b> to join — they want a name. Answer it at the top of any tab.`,'big')}
function fightRequests(w,pm){for(const g of rosterOf(pm)){const req=g.wantFight;if(req&&req.week<w.week){ /* last week's ask: was it honoured? */
      if(req.bye){}else if(g.lastBout===req.week){g.morale=clamp(g.morale+FIGHT_REQ.moraleUp,0,100);ghist(g,'got the fight they asked for')}else{g.morale=clamp(g.morale-FIGHT_REQ.moraleDown,0,100);tnews(`😠 ${esc(g.name)} asked to fight and sat out again (−${FIGHT_REQ.moraleDown} morale).`,'bad')}
      delete g.wantFight}}
  if(isByeWk(w.week))return;
  for(const g of rosterOf(pm)){if(g.wantFight||g.inj||!fameHungry(g))continue;const last=g.lastBout||(g.contract?g.contract.since:w.week);if(w.week-last<=FIGHT_REQ.idleWeeks)continue;if(Math.random()>0.6)continue;
    g.wantFight={week:w.week};tnews(`🗣 <b>${esc(g.name)}</b> wants to be on this week’s card — ${w.week-last} weeks without a fight is too long for someone chasing a name.`)}}
{const baseEnd=endWeek;endWeek=async function(){const r=await baseEnd.apply(this,arguments);try{const w=W_();if(r!==false&&w&&!w.dead&&!w.tutorial){const pm=me();payJoinOffer(w,pm);fightRequests(w,pm)}}catch(e){console.error(e)}return r}}
/* the cards at the top of every Manager tab */
{const baseTop=buyOfferHTML;buyOfferHTML=function(){let h=baseTop();try{const w=W_(),pm=me();if(!w||!pm)return h;
  const o=w.payJoin&&w.payJoin.until>=w.week?w.payJoin:null;const g=o&&gById(o.gid);
  if(g&&!g.contract)h+=`<div class="card2 payjoin"><div style="display:flex;gap:10px;align-items:center">${gArt(g,'sm')}<div style="flex:1"><b>${ICO.coin} ${esc(g.name)} will pay to join ${esc(pm.ludus)}</b><p style="margin:4px 0">“No house will look at me. Take me on and I’ll pay you <b>${o.pay} coin</b> — give me the sand and I’ll give you a name.” <span class="rc-sub">${CLASSES[g.cls]?CLASSES[g.cls].name:''} · rated ~${pubOvr(g)} · ${PAYJOIN.weeks} weeks at ${PAYJOIN.wage}/wk</span></p>
    <div class="acts"><button class="btn primary" type="button" data-v54="payjoin-yes">✍ Take them on<small>+${o.pay} coin</small></button><button class="btn" type="button" data-v54="payjoin-no">✋ No thanks</button></div></div></div></div>`;
  const reqs=rosterOf(pm).filter(x=>x.wantFight&&x.wantFight.week===w.week);
  if(reqs.length&&!(w.night&&w.night.bye))h+=`<div class="card2 fightreq"><b>🗣 Asking for a fight this week:</b> ${reqs.map(x=>esc(x.name)).join(', ')} <span class="rc-sub">enter them on Match Week (+${FIGHT_REQ.moraleUp} morale) or they sulk (−${FIGHT_REQ.moraleDown})</span> <button class="btn tksm" type="button" data-mg="tab" data-id="night">⚔️ Match Week</button></div>`}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-v54]');if(!b)return;const w=W_(),pm=me();if(!w||!pm)return;const a=b.dataset.v54;
  if(a==='payjoin-yes'&&w.payJoin){const g=gById(w.payJoin.gid);if(g&&!g.contract){g.contract={mgr:pm.id,wage:PAYJOIN.wage,weeks:PAYJOIN.weeks,since:w.week};g.unsigned=0;g.morale=clamp((g.morale||60)+10,0,100);pm.coin+=w.payJoin.pay;
    ghist(g,`paid ${w.payJoin.pay} coin to join ${esc(pm.ludus)}`);tnews(`✍ ${esc(g.name)} joins ${esc(pm.ludus)} and pays ${w.payJoin.pay} coin for the chance.`)}w.payJoin=null;saveWorld()}
  if(a==='payjoin-no'&&w.payJoin){const g=gById(w.payJoin.gid);if(g)g.noPayJoin=true;w.payJoin=null;saveWorld()}
  if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
/* a new career opens with “How a week works” open (collapse it any time); a taken-over house too */
{const baseNew=newWorld;newWorld=function(choice){const out=baseNew.apply(this,arguments);try{const w=MGR.world;if(w)w.startWeek=w.week}catch(e){}return out}}
{const baseMgr=mgrHTML;mgrHTML=function(){try{if(MGR.tab==='board')MGR.tab='recruit';if(!MGR.sort)MGR.sort='stars'}catch(e){}let h=baseMgr.apply(this,arguments);try{const w=W_();if(w&&w.startWeek===w.week){
    if(h.includes('<details class="revbox welcfold">'))h=h.replace('<details class="revbox welcfold">','<details class="revbox welcfold" open>');
    else h=h.replace(/<div class="revbox"><div class="sect" style="margin-top:0">👋 Welcome to ([^<]*)<\/div>([\s\S]*?<\/p><\/div>)/,(m0,nm,body)=>`<details class="revbox welcfold" open><summary>👋 How a week works · ${nm}</summary>${body.replace(/<\/div>$/,'')}</details>`)}}catch(e){}return h}}
/* ★ Favorites live inside Recruiting now: a shortlist above the board, same actions on the card */
{const baseRail=railTabs;railTabs=function(tabs,groups,cur,attr,cls){if(typeof MGR_GROUPS!=='undefined'&&groups===MGR_GROUPS)tabs=tabs.filter(t=>t[0]!=='board');return baseRail(tabs,groups,cur,attr,cls)}}
{const baseRec=recruitHTML;recruitHTML=function(){let h=baseRec.apply(this,arguments);try{const w=W_(),m=me();const favs=w.glads.filter(g=>g.alive&&g.favd&&!(g.contract&&g.contract.mgr===m.id)).sort((a,b)=>interestOf(b,m)-interestOf(a,m));
  const fav=favs.length?`<div class="card2 favbox"><div class="sect" style="margin-top:0">★ Favorites · ${favs.length} <span class="rc-sub">your shortlist — click one for their card and every courting action</span></div><table class="tally">${favs.map(g=>{const iv=interestOf(g,m);return `<tr class="${MGR.sel===g.id?'me':''}" data-mg="sel" data-id="${g.id}" style="cursor:pointer"><td><button class="btn" type="button" data-mg="fav" data-id="${g.id}" title="Remove from Favorites" style="padding:1px 6px;border:none;background:none;font-size:15px;color:var(--gold2)">★</button>${gArt(g,'xs')} <b>${esc(g.name)}</b> <span class="rc-sub">${CLASSES[g.cls]?CLASSES[g.cls].name:''}${g.contract?` · ${esc(mgrById(g.contract.mgr).ludus)}`:' · free agent'}</span></td><td>${starHTML(starsOf(estOvr(g).v))}</td><td style="min-width:120px"><div class="meter gold"><i style="width:${iv}%"></i></div><span class="rc-sub">interest ${iv}</span></td><td class="n">${askWage(g)}/wk</td></tr>`}).join('')}</table></div>`:'';
  h=h.replace('<div class="mgrid"><div>',`<div class="mgrid"><div>${fav}`);
  h=h.replace('<div class="seg"><span class="lbl">Sort</span>',`<div class="seg sorttray${MGR.sortOpen?' open':''}"><span class="lbl">Sort</span>`);
  h=h.replace('<div style="overflow-x:auto;max-height:62vh">','<div id="recTable" style="overflow-x:auto;max-height:62vh">')}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="sort"],[data-mg="fav"]');if(!b||typeof MGR==='undefined')return;
  if(b.dataset.mg==='sort'){const tray=b.closest('.sorttray');if(tray&&!tray.classList.contains('open')&&b.classList.contains('on')){e.stopImmediatePropagation();e.preventDefault();MGR.sortOpen=true;tray.classList.add('open');return}MGR.sortOpen=false;return}
  /* favouriting keeps your place in the list */
  const tbl=document.getElementById('recTable');const keep=tbl?tbl.scrollTop:0;const box=$('#mBody');const keepBox=box?box.scrollTop:0;setTimeout(()=>{const t=document.getElementById('recTable');if(t)t.scrollTop=keep;if(box)box.scrollTop=keepBox},0)},true);

/* ============================ F. ALSO ============================ */
/* hints: off once for everyone (turn them back on in Settings or with 💡 / H — that choice sticks) */
try{if(localStorage.getItem('flavius_hints54')!=='1'){localStorage.setItem('flavius_hints54','1');if(!FIRST_RUN)hintsMaster(false,true)}}catch(e){}
/* the Play Now roster is yours to fill: no more automatic recruits */
try{if(!localStorage.getItem('flavius_roster32'))localStorage.setItem('flavius_roster32','1')}catch(e){}
/* music: Play Now plays a random unlocked theme (or the Custom Event's own); Manager mode keeps the city themes */
{const baseWant=audWant;audWant=function(){try{if(!AUD.manual&&audLive()&&S&&!S.mgrCtx&&!S.specCtx&&!S.tourn&&!audFinalOn()&&!audSuperbusOn()){
    if(!S.musicPick){const all=[...AUD_TRACKS,...(typeof AUD_EXTRA!=='undefined'?AUD_EXTRA:[])].map(x=>x[0]).filter(musicUnlocked);const want=EV()&&EV().music;S.musicPick=want&&musicUnlocked(want)?want:all[Math.floor(Math.random()*all.length)]||'Roma'}
    return S.musicPick}}catch(e){}return baseWant.apply(this,arguments)}}
/* cohorts: a fresh cohort starts empty (its preview card no longer shows members the pickers can't show) */
{const basePB=pairBlank;pairBlank=function(){const P=basePB();P.members=['',''];return P}}
if(typeof ST!=='undefined'&&ST.pxd&&JSON.stringify(ST.pxd.members)==='["cls:soldier","cls:hero"]')ST.pxd.members=['',''];
{const baseCo=cohortStudioHTML;cohortStudioHTML=function(){return baseCo.apply(this,arguments).replace(/special event/g,'invitational')}}
setTimeout(()=>{try{if(!HEADLESS)piaArtImage()}catch(e){}},1500); /* load the Piaculum template early */
