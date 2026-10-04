/* =====================================================================
   116-ONL79 · ONLINE, v0.79 (Virgilante's first-session notes)
   =====================================================================
   • 🛡 My Gladiators: up to 3 living gladiators (ONLC.GLAD_MAX), one ACTIVE (it fights, bets and buys tickets);
     edit name, class (the 8 printed; ratings, rank and bought gear stay), look (the Studio's portrait controls + colour),
     an own board token (or the class mini) and which bought pieces to bring — only between events (server 'char.edit').
   • In the arena a gladiator wears its look: seat kit.look → p._onlLook; its own token is drawn as a figure (tokenForP +
     a drawPlayer wrapper that lends the class the 'custom' flag while drawing); the result cards show its portrait (pArt).
   • The pre-match room (Your game card): seats + ready, host settings (Custom: abandoning eliminates or hands the seat to a
     CPU; the stands round 1 only or closed), chat (closes at the horns), Start only with 2+ lanistas (ONLC.canStart).
     When the host starts, everyone seated enters by themselves.
   • In a match: the online bar (body.onlarena hides New event, sim, saves, Studio, Manager, Annals, main menu…);
     🚪 Abandon (fighters) / 🚪 Leave (watchers, the stands) — the only way out. Rejoin a live match at any time from Play
     (a fresh snapshot from another lanista); after abandoning, or once a CPU took the seat, you may only watch.
   • Online opens on Play; the stage figure sits smaller, lower and to the right.
   • Coming back from Google: a loading screen covers the page until the Online window is up (no arena/menu flash).
   ===================================================================== */
const ONL_TOKKEYS=['body','helm','shield','emblem','hair','hairC','skin','c1','c2','cape','capeC','base'];
function onlTokenOf(cls,look){const t=look&&look.token;if(!t||!Object.keys(t).length)return null;
  const base=(typeof TOKEN_DEF!=='undefined'&&TOKEN_DEF[cls])||{kind:'human',body:'tunic',helm:'galea',shield:'round',weapon:'gladius'};const o={...base,kind:'human'};
  for(const k of ONL_TOKKEYS)if(t[k]!=null&&t[k]!=='')o[k]=t[k];return o}
function onlFig(cls,look,h){const tk=onlTokenOf(cls,look);return tk&&typeof figureHTML==='function'?figureHTML(tk,h):onlMini(cls,h)}
function onlPortraitOf(ch){const L=ch.look||{};return {name:ch.name,portrait:L.portrait||{},color:L.color||(CLASSES[ch.cls]||{}).color||'#a3281f'}}

/* ---------------- the Play stage: the figure smaller, lower, to the right ---------------- */
{const base=onlStageHTML;onlStageHTML=function(ch){const h=base.apply(this,arguments);return h.replace(onlMini(ch.cls,250),'').replace('<div class="onl-plate">',`<div class="onl-fig79">${onlFig(ch.cls,ch.look,165)}</div><div class="onl-plate">`)}}

/* ---------------- 🛡 My Gladiators ---------------- */
function onlBusy(){const me=ONL.acct&&ONL.acct.id;return (ONL.lobbies||[]).find(L=>(L.status==='waiting'||L.status==='live')&&L.players.some(p=>p.id===me))||null}
function onlDraft(ch){if(ONL.ged&&ONL.ged.id===ch.id)return ONL.ged;const L=ch.look||{};
  const eq=ONLC.equipOf(ch);const left=eq.slice();const on=(ch.gear||[]).map(k=>{const i=left.indexOf(k);if(i>=0){left.splice(i,1);return true}return false});
  return ONL.ged={id:ch.id,name:ch.name,cls:ch.cls,look:{portrait:{...(L.portrait||(typeof randomPortrait==='function'?randomPortrait():{}))},color:L.color||(CLASSES[ch.cls]||{}).color||'#a3281f',token:L.token?{...L.token}:null},on,dirty:false}}
function onlSel(path,opts,val,attr){return `<select class="tin" ${attr}="${path}">${opts.map(([v,l])=>`<option value="${esc2(v??'')}" ${String(val??'')===String(v??'')?'selected':''}>${esc2(l)}</option>`).join('')}</select>`}
onlCharHTML=function(){const live=ONL.chars.filter(c=>c.alive).sort((a,b)=>a.born-b.born);const dead=ONL.chars.filter(c=>!c.alive);
  const sel=live.find(c=>c.id===ONL.gsel)||ONL.char||live[0];if(!sel)return '';ONL.gsel=sel.id;const D=onlDraft(sel);const busy=onlBusy();const cat=onlCatalog();const p=D.look.portrait;
  const slot=c=>{const act=c.id===(ONL.char&&ONL.char.id);return `<button type="button" class="onl-gslot ${c.id===sel.id?'on':''}" data-onl="gpick" data-v="${c.id}">${_T`${onlFig(c.cls,c.look,96)}<b>${esc2(c.name)}</b><small>${esc2((CLASSES[c.cls]||{}).name||'')} · ${onlRankChip(ONLC.rankFor(c).k)}</small><small>${typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙'} ${c.wallet} · ⭐ ${c.lifeCF} CF</small>${act?_T('<span class="badge gold">⚔ Active</span>'):''}`}</button>`};
  const empty=Array.from({length:Math.max(0,ONLC.GLAD_MAX-live.length)},()=>`<button type="button" class="onl-gslot empty" data-onl="gnew">${_T`＋<b>New gladiator</b><small>starts as a Tiro</small>`}</button>`).join('');
  const P=(path,label,opts,val)=>`<label>${label}${onlSel(path,opts,val,'data-onlgp')}</label>`;
  const T=(f,label,opts)=>`<label>${label}${onlSel(f,opts,(D.look.token||{})[f]||(onlTokenOf(D.cls,{token:{x:1}})||{})[f]||'','data-onlgt')}</label>`;
  const TC=(f,label,def)=>`<label>${label}<input type="color" data-onlgt="${f}" value="${/^#[0-9a-f]{6}$/i.test((D.look.token||{})[f]||'')?D.look.token[f]:def}"></label>`;
  const gearRows=(sel.gear||[]).map((k,i)=>`<label class="chk"><input type="checkbox" data-onlgeq="${i}" ${D.on[i]?'checked':''}> ${esc2((cat[k]||{}).n||k)} <small class="rc-sub">L${(cat[k]||{}).lv||'?'}</small></label>`).join('');
  const CK=CLASSES[D.cls]||{};const kit=[CK.R,CK.L].filter(Boolean).map(k=>(W[k]||{}).n).filter(Boolean);
  return `<div class="onl-lbtop"><h3>${_T`🛡 My Gladiators`} <span class="rc-sub">${_T`${live.length}/${ONLC.GLAD_MAX} living · the active one fights`}</span></h3></div>
   <div class="onl-gslots">${live.map(slot).join('')}${empty}</div>
   ${busy?`<p class="onl-busy">${_T`⏳ In a game (${esc2(onlEvName(busy.ev))}) — changes wait until it is over.`}</p>`:''}
   <div class="onl-ged"><div class="onl-gprev"><div id="onlGPort">${typeof portraitHTML==='function'?portraitHTML({...onlPortraitOf({name:D.name,cls:D.cls,look:D.look})},'lg'):''}</div>
      <div id="onlGTok" title="${_T`The board token`}">${onlFig(D.cls,D.look,120)}</div>
      ${sel.id!==(ONL.char&&ONL.char.id)?`<button type="button" class="btn primary" data-onl="gact" data-v="${sel.id}" ${busy?'disabled':''}>${_T`⚔ Make active`}</button>`:_T('<span class="badge gold">⚔ Active gladiator</span>')}</div>
    <div class="onl-gform">
     <label>${_T`Name`}<input class="tin" data-onlge="name" maxlength="24" value="${esc2(D.name)}"></label>
     <div class="sect">${_T`Class`} <span class="rc-sub">${_T`switch freely between events — ratings, rank and bought gear stay`}</span></div>
     <div class="onl-clsgrid">${ONLC.CLASSES8.map(k=>`<button type="button" class="onl-cls ${D.cls===k?'on':''}" data-onl="gcls" data-v="${k}">${typeof cardHTML==='function'?cardHTML('k:'+k,'sm'):''}<span>${esc2(CLASSES[k].name)}</span></button>`).join('')}</div>
     <p class="rc-sub" style="margin:2px 0 0">${_T`Recruit kit: ${esc2(kit.join(', ')||_T('the class weapons'))}`}</p>
     <div class="sect">${_T`Look`}</div>
     <div class="formgrid onl-g2">${P('portrait.skin',_T('Skin'),SKINS.map((v,i)=>[v,SKIN_NAMES[i]||_T('Tone ')+(i+1)]),p.skin)}${P('portrait.hair',_T('Hair'),HAIRS.map((v,i)=>[v,HAIR_NAMES[i]||_T('Shade ')+(i+1)]),p.hair)}
      ${P('portrait.helm',_T('Headgear'),HELMS,p.helm)}${P('portrait.hs',_T('Hairstyle'),HAIRSTYLES,p.hs||(p.long?'long':''))}${P('portrait.bs',_T('Beard'),BEARDS,p.bs&&p.bs!=='none'?p.bs:(p.beard?'full':''))}
      ${P('portrait.eyes',_T('Eyes'),EYES,p.eyes||EYES[0][0])}${P('portrait.mark',_T('Marks'),MARKS,p.mark||'')}${P('portrait.garb',_T('Garb'),GARBS,p.garb||'')}
      ${P('portrait.fem',_T('Build'),[['',_T('Gladiator')],['1',_T('Gladiatrix')]],p.fem?'1':'')}${P('portrait.smile',_T('Expression'),[['',_T('Stern')],['1',_T('Grin')]],p.smile?'1':'')}
      ${typeof EARRINGS!=='undefined'?P('portrait.ear',_T('Earring'),EARRINGS,p.ear||''):''}<label>${_T`Colour`}<input type="color" data-onlgp="color" value="${esc2(D.look.color)}"></label></div>
     <div class="mbtns" style="margin:4px 0"><button type="button" class="btn tksm" data-onl="grlook">${_T`🎲 Random look`}</button></div>
     <div class="sect">${_T`Board token`}</div>
     <label class="chk"><input type="checkbox" data-onl="gtok" ${D.look.token?'checked':''}> ${_T`My own token`} <span class="rc-sub">${_T`(off: the class mini)`}</span></label>
     ${D.look.token?`<div class="formgrid onl-g2">${T('body',_T('Body'),T_BODIES)}${T('helm',_T('Headgear'),T_HELMS)}${T('shield',_T('Shield'),T_SHIELDS)}${T('emblem',_T('Shield emblem'),T_EMBLEM)}${T('hair',_T('Hair'),T_HAIRS)}
       ${T('skin',_T('Skin'),TOKEN_SKINS.map((v,i)=>[v,_T('Tone ')+(i+1)]))}${TC('c1',_T('Main colour'),'#a3281f')}${TC('c2',_T('Trim colour'),'#d6ab4c')}${TC('hairC',_T('Hair colour'),'#3a2616')}
       <label class="chk" style="align-self:end"><input type="checkbox" data-onlgt="cape" ${(D.look.token||{}).cape?'checked':''}> ${_T`Cape`}</label></div>`:''}
     <div class="sect">${_T`Gear to bring`} <span class="rc-sub">${_T`bought in the Armory`}</span></div>
     <div class="chkgrid">${gearRows||_T('<span class="rc-sub">Nothing bought yet — the recruit kit only.</span>')}</div>
     <div class="mbtns"><button type="button" class="btn primary" data-onl="gsave" ${busy?'disabled':''}>${_T`💾 Save ${esc2(D.name)}`}</button></div>
    </div></div>
   ${dead.length?`<div class="sect">${_T`The fallen`}</div><div class="rc-sub">${dead.map(c=>esc2(c.name)).join(' · ')}</div>`:''}`};
function onlGPrev(){const D=ONL.ged;if(!D)return;const a=document.getElementById('onlGPort');if(a&&typeof portraitHTML==='function')a.innerHTML=portraitHTML(onlPortraitOf({name:D.name,cls:D.cls,look:D.look}),'lg');
  const b=document.getElementById('onlGTok');if(b)b.innerHTML=onlFig(D.cls,D.look,120)}
document.addEventListener('click',e=>{const b=e.target.closest('#onl [data-onl]');if(!b)return;const a=b.dataset.onl,v=b.dataset.v;const D=ONL.ged;
  if(a==='gpick'){ONL.gsel=v;ONL.ged=null;onlRedraw();return}
  if(a==='gnew'){ONL.newGlad=true;ONL.creating=null;onlRedraw();return}
  if(a==='gcls'&&D){D.cls=v;D.dirty=true;onlRedraw();return}
  if(a==='grlook'&&D){D.look.portrait=typeof randomPortrait==='function'?randomPortrait():D.look.portrait;D.dirty=true;onlRedraw();return}
  if(a==='gtok'&&D){D.look.token=D.look.token?null:{...(onlTokenOf(D.cls,{token:{x:1}})||{}),c1:D.look.color};delete (D.look.token||{}).x;D.dirty=true;onlRedraw();return}
  if(a==='gact')return onlDo(async()=>{await NET.req('char.active',{char:v});ONL.active=v;await onlRefresh();if(typeof mToast==='function')mToast(_T`⚔ <b>${esc2(ONL.char.name)}</b> is your active gladiator.`)});
  if(a==='gsave'&&D)return onlDo(async()=>{const ch=ONL.chars.find(c=>c.id===D.id);const equip=(ch.gear||[]).filter((k,i)=>D.on[i]);
    const tok=D.look.token?Object.fromEntries(Object.entries(D.look.token).filter(([k])=>ONL_TOKKEYS.includes(k))):null;
    await NET.req('char.edit',{char:D.id,name:D.name,cls:D.cls,look:{portrait:D.look.portrait,color:D.look.color,...(tok?{token:tok}:{})},equip});ONL.ged=null;await onlRefresh();if(typeof mToast==='function')mToast(_T`💾 <b>${esc2(D.name)}</b> is ready.`)})},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#onl'))return;const D=ONL.ged;if(!D)return;
  if(t.dataset.onlge){D[t.dataset.onlge]=t.value;D.dirty=true;return}
  if(t.dataset.onlgp){const f=t.dataset.onlgp;let v=t.value;if(f==='portrait.fem'||f==='portrait.smile')v=!!v;if(f==='color')D.look.color=v;else setPath(D.look,f,v);D.dirty=true;onlGPrev();return}
  if(t.dataset.onlgt&&D.look.token){const f=t.dataset.onlgt;D.look.token[f]=t.type==='checkbox'?t.checked:t.value;D.dirty=true;onlGPrev();return}
  if(t.dataset.onlgeq!=null){D.on[+t.dataset.onlgeq]=t.checked;D.dirty=true}},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.closest&&t.closest('#onl')&&(t.dataset.onlgp||t.dataset.onlgt))t.dispatchEvent(new Event('input',{bubbles:true}))},true);

/* ---------------- the look in the arena ---------------- */
{const base=mkPlayer;mkPlayer=function(i,seat){const p=base.apply(this,arguments);try{if(seat&&seat.onl&&seat.onl.look){p._onlLook=seat.onl.look;const tk=onlTokenOf(p.cls,seat.onl.look);if(tk)p._onlTok=tk}}catch(e){}return p}}
{const base=tokenForP;tokenForP=function(p){if(p&&p._onlTok){const C=CLASSES[p.cls];const was=C&&C.custom;if(C)C.custom=false;let r;try{r=base.apply(this,arguments)}finally{if(C)C.custom=was}
    const o={...r};for(const k of ONL_TOKKEYS)if(p._onlTok[k]!=null)o[k]=p._onlTok[k];return o}return base.apply(this,arguments)}}
{const base=drawPlayer;drawPlayer=function(p){if(p&&p._onlTok&&CLASSES[p.cls]&&!CLASSES[p.cls].custom){const C=CLASSES[p.cls];C.custom=true;try{return base.apply(this,arguments)}finally{C.custom=false}}return base.apply(this,arguments)}}
{const base=pArt;pArt=function(p,size){if(p&&p._onlLook&&p._onlLook.portrait&&typeof portraitHTML==='function')return `<span class="partw">${portraitHTML({name:p.name,portrait:p._onlLook.portrait,color:p._onlLook.color||p.color},size||'sm')}</span>`;return base.apply(this,arguments)}}
{const base=onlSeatsFor;onlSeatsFor=function(L){const seats=base.apply(this,arguments);L.players.forEach((p,i)=>{const k=p.kit||{};if(seats[i]&&seats[i].onl&&k.look)seats[i].onl.look=k.look});return seats}}

/* ---------------- the pre-match room ---------------- */
function onlMyLobby(){const me=ONL.acct&&ONL.acct.id;return (ONL.lobbies||[]).find(x=>x.status!=='done'&&(x.players.some(p=>p.id===me)||(x.stands||[]).some(t=>t.id===me)))||null}
onlMyLobbyHTML=function(){const me=ONL.acct&&ONL.acct.id;const L=onlMyLobby();if(!L)return '';const host=L.host.id===me;const fan=!L.players.some(p=>p.id===me);const tm=ONLC.seatTeams(L);
  const humans=ONLC.humansOf(L);const why=host?ONLC.canStart(L,me):'';const left=(ONL.leftMatch||{})[L.id];const inMatch=S&&S.onl&&S.onl.lobby===L.id&&!S.over;
  const seat=i=>{const p=L.players[i];const t=tm?`<i class="onl-team t${tm[i]}">${tm[i]}</i>`:'';const k=p&&p.kit;
    return `<div class="onl-rseat ${p?'on':''}">${p&&k?onlFig(k.cls,k.look,54):'<span class="onl-rq">?</span>'}<div>${t}${p?`<b>${esc2(p.name)}</b>${p.id===L.host.id?' 👑':''}${p.ready?' <span class="onl-rdy">✓ ready</span>':''}<small>${k?esc2((CLASSES[k.cls]||{}).name||'')+' · ':''}${onlRankChip(p.rank)}</small>`:_T('<small>Open — a CPU if empty</small>')}</div></div>`};
  const rule=ONLC.abandonRule(L);
  const settings=L.status==='waiting'?`<div class="onl-rset">${_T`<b>Rules of this game</b>`}
     <label>${_T`Leaving the sand ${host&&!L.ranked?`<select class="tin" data-onlset="abandon"><option value="cpu" ${rule==='cpu'?'selected':''}>${_T`a CPU takes the seat`}</option><option value="fate" ${rule==='fate'?'selected':''}>${_T`the gladiator is eliminated`}</option></select>`:`<span>${L.ranked?_T('Ranked: eliminated — Damnatio, the gladiator dies'):rule==='fate'?_T('the gladiator is eliminated'):_T('a CPU takes the seat')}</span>`}`}</label>
     <label>${_T`The stands ${host?`<select class="tin" data-onlset="standsOff"><option value="0" ${L.standsOff?'':'selected'}>${_T`may act in round 1`}</option><option value="1" ${L.standsOff?'selected':''}>${_T`watch only`}</option></select>`:`<span>${L.standsOff?_T('watch only'):_T('may act in round 1')}</span>`}`}</label></div>`:'';
  const chat=L.status==='waiting'?`<div class="onl-chat"><div class="onl-chatlog" id="onlChatLog">${(L.chat||[]).map(m=>`<div><b>${esc2(m.name)}</b> ${esc2(m.text)}</div>`).join('')||'<div class="rc-sub">Say ave to the other lanistas.</div>'}</div>
     <div class="onl-chatrow"><input class="tin" id="onlChat" maxlength="${ONLC.CHAT_LEN}" placeholder="${_T`Message the room`}"><button type="button" class="btn tksm" data-onl="chat" data-v="${L.id}">${_T`Send`}</button></div></div>`:'';
  const acts=L.status==='waiting'?(fan?'':(host?`<button type="button" class="btn primary" data-onl="start" data-v="${L.id}" ${why?_T`disabled title="${esc2(why)}"`:''}>${_T`▶ Start the match`}</button>`:`<button type="button" class="btn" data-onl="ready" data-v="${L.id}">${_T`✓ Ready`}</button>`))
    :(inMatch?'':left||fan?`<button type="button" class="btn primary" data-onl="${fan&&!left?'enter':'watch'}" data-v="${L.id}">${fan&&!left?_T('🎟 Take your seat'):_T('👁 Watch')}</button>`:`<button type="button" class="btn primary" data-onl="rejoin" data-v="${L.id}">${_T`⚔ Rejoin the match`}</button>`);
  return `<div class="card2 onl-mine onl-room"><div class="onl-rhead">${_T`<b>${fan?_T('🎟 Your seat in the stands'):_T('⚔ Your game')}</b> · ${esc2(onlEvName(L.ev))} at ${esc2(onlCityName(L.loc))} · ${L.ranked?_T('⚔ Ranked'):_T('Custom')}${L.team?_T(' · 👥 Team A vs Team B'):''}`}
     <span class="rc-sub">${L.status==='waiting'?_T`${humans.length} lanista${humans.length===1?'':'s'} · ${L.players.length}/${L.seats} seated`:_T('🔴 Live')}</span></div>
   <div class="onl-rbody"><div><div class="onl-rseats">${Array.from({length:L.seats},(_,i)=>seat(i)).join('')}</div>
     ${(L.stands||[]).length?`<div class="rc-sub">${_T`🎟 In the stands: ${L.stands.map(t=>esc2(t.name)).join(', ')} · pot ${L.pot||0} coin`}</div>`:''}
     ${host&&why&&L.status==='waiting'?`<p class="onl-busy">⏳ ${esc2(why)}</p>`:''}${settings}
     <div class="acts">${acts}${L.status==='waiting'?`<button type="button" class="btn" data-onl="leave" data-v="${L.id}">${fan?_T('Give back the ticket'):host?_T('Close the game'):_T('Leave')}</button>`:''}</div></div>${chat}</div></div>`};
document.addEventListener('click',e=>{const b=e.target.closest('#onl [data-onl]');if(!b)return;const a=b.dataset.onl,v=b.dataset.v;
  if(a==='chat')return onlChatSend(v);
  if(a==='rejoin'){const L=ONL.lobbies.find(x=>x.id===v);if(L)onlDo(()=>onlAttach(L,'seat'));return}},true);
function onlChatSend(id){const i=document.getElementById('onlChat');const t=i&&i.value.trim();if(!t)return;i.value='';onlDo(async()=>{await NET.req('lobby.chat',{id,text:t});ONL.lobbies=await NET.req('lobby.list')}).then(()=>{const n=document.getElementById('onlChat');if(n)n.focus()})}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='onlChat'){e.preventDefault();const L=onlMyLobby();if(L)onlChatSend(L.id)}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.onlset)return;const L=onlMyLobby();if(!L)return;const k=t.dataset.onlset;
  onlDo(async()=>{await NET.req('lobby.set',{id:L.id,[k]:k==='standsOff'?t.value==='1':t.value});ONL.lobbies=await NET.req('lobby.list')})},true);
/* a redraw keeps what you were typing in the chat, and the chat scrolled to its end */
{const base=onlRedraw;onlRedraw=function(){const c=document.getElementById('onlChat');const val=c&&c.value,foc=c&&document.activeElement===c;const r=base.apply(this,arguments);
  const n=document.getElementById('onlChat');if(n&&val){n.value=val}if(n&&foc)n.focus();const lg=document.getElementById('onlChatLog');if(lg)lg.scrollTop=lg.scrollHeight;return r}}
/* when the host sounds the horns, everyone seated walks in (the host already has) */
ONL.entered=ONL.entered||{};
{const base=onlEnter;onlEnter=function(L){ONL.entered[L.id]=1;return base.apply(this,arguments)}}
NET.on('lobby.update',d=>{setTimeout(async()=>{if(!ONL.acct||!document.getElementById('onl'))return;const L=onlMyLobby();if(!L||L.status!=='live'||ONL.entered[L.id]||(ONL.leftMatch||{})[L.id])return;
  if(S&&S.onl&&!S.over)return;ONL.entered[L.id]=1;onlEnter(L)},250)});
/* the Spectate tab and the lobby list: your own live match shows Rejoin, not Watch */

/* ---------------- rejoin / watch: a fresh snapshot from another lanista ---------------- */
async function onlAttach(L,role){const r=await NET.req('match.watch',{id:L.id});const lob=r.lobby||L;const me=ONL.acct.id;
  if(role==='seat'&&((r.abandoned||[]).includes(me)||(r.dropped||[]).includes(me))){role='watch';if(typeof mToast==='function')mToast(r.abandoned.includes(me)?_T('🚪 You left that match — you may watch it.'):_T('🔌 A CPU holds your seat now — you may watch.'))}
  if(role!=='seat')return onlWatch(lob);
  const seats=onlSeatsFor(lob);let seat=lob.players.findIndex(p=>p.id===me);const tk=(lob.stands||[]).findIndex(t=>t.id===me);if(seat<0&&tk>=0)seat=lob.seats+tk;if(seat<0)return onlWatch(lob);
  const onl={lobby:lob.id,ranked:!!lob.ranked,seat,owners:onlOwnersFor(lob,seats),host:lob.host.id===me,opened:true,stands:(lob.stands||[]).map(t=>({id:t.id,name:t.name})),fighters:lob.seats,team:!!lob.team,standsOff:!!lob.standsOff};
  ONL.live={id:lob.id,ranked:!!lob.ranked,seat,char:(lob.players[seat]||{}).char||null,seed:lob.seed};ONL.entered[lob.id]=1;ONL.watching={id:lob.id,onl,buf:[],at:Date.now(),seat:true};
  if(CUR_MODAL)CUR_MODAL.done('rejoin');if(typeof mToast==='function')mToast(_T('⚔ Back to the sand — fetching the arena…'));
  const ask=(r.players||[]).filter(a=>a!==me).concat(r.specs||[]);let k=0;const tryOne=()=>{const W=ONL.watching;if(!W||W.id!==lob.id||W.done)return;if(k>=ask.length){if(typeof mToast==='function')mToast(_T('⚠ Nobody answered — try Rejoin again in a moment.'));ONL.watching=null;return}
    NET.req('match.snapreq',{id:lob.id,to:ask[k++],seq:0}).catch(()=>{});setTimeout(tryOne,7000)};tryOne()}
/* the watcher path (113) loads as seat -1; a rejoining fighter takes their own seat back */
{const base=onlmWatchOn;onlmWatchOn=function(next,ins){const r=base.apply(this,arguments);const W=ONL.watching;if(W&&W.seat&&S&&S.onl){S.onl.watch=false;ONLM.me=S.onl.seat}return r}}
/* onlEnter on a match that started a while ago (a reload, a late click) is a rejoin from a snapshot — never a second opening */
{const base=onlEnter;onlEnter=function(L){if(L&&L.status==='live'&&L.started&&Date.now()-L.started>20000&&!(S&&S.onl&&S.onl.lobby===L.id&&!S.over))return onlDo(()=>onlAttach(L,'seat'));return base.apply(this,arguments)}}
{const base=onlEnter;onlEnter=function(L){const r=base.apply(this,arguments);try{if(S&&S.onl&&L)S.onl.standsOff=!!L.standsOff}catch(e){}return r}}
{const base=startEvent;startEvent=function(cfg){if(cfg&&cfg.onl){const L=(ONL.lobbies||[]).find(x=>x.id===cfg.onl.lobby);if(L)cfg.onl.standsOff=!!L.standsOff}return base.apply(this,arguments)}}

/* ---------------- the online arena bar · 🚪 Abandon / Leave ---------------- */
function onlInArena(){return !!(S&&S.onl&&ONLM.on)}
function onlBarSync(){const on=!!(S&&S.onl&&!S.over&&(ONLM.on||S.onl.watch));document.body.classList.toggle('onlarena',on);let b=document.getElementById('btnOnlLeave');
  if(!on&&!(S&&S.onl&&S.over)){if(b)b.remove();return}
  if(!b){const m=document.getElementById('btnMenu');if(!m)return;b=document.createElement('button');b.id='btnOnlLeave';b.type='button';b.className='btn';m.after(b)}
  const fighter=S.onl.seat>=0&&S.onl.seat<(S.onl.fighters||S.players.length)&&ONLM.me>=0;
  b.textContent=S.over?_T('🌐 Back to Online'):fighter?_T('🚪 Abandon match'):_T('🚪 Leave');b.dataset.mode=S.over?'back':fighter?'abandon':'leave';
  b.title=S.over?_T('Back to the Online arena'):fighter?(S.onl.ranked?_T('Leave the match — in Ranked your gladiator dies (Damnatio)'):_T('Leave the match')):_T('Stop watching')}
setInterval(()=>{try{onlBarSync()}catch(e){}},500);
document.addEventListener('click',async e=>{const b=e.target.closest('#btnOnlLeave');if(!b)return;e.preventDefault();e.stopPropagation();ONLM.uiAt=Date.now();const mode=b.dataset.mode;const id=S&&S.onl&&S.onl.lobby;
  if(mode==='back'){onlExit();return}
  if(mode==='leave'){if(ONL.watching)NET.req('match.unwatch',{id}).catch(()=>{});onlExit();return}
  const rule=S.onl.ranked?'fate':((ONL.lobbies||[]).find(x=>x.id===id)||{}).abandon==='fate'?'fate':'cpu';
  const v=await modal(_T('🚪 Abandon the match?'),`<p>${S.onl.ranked?_T('<b>Ranked:</b> your gladiator is eliminated and <b>dies by Damnatio</b>. This cannot be undone.'):rule==='fate'?_T('Your gladiator is eliminated — the bout is over for you.'):_T('A CPU takes your seat and fights on.')}</p><p class="rc-sub">${_T`You may come back to watch, but not to fight.`}</p>`,
    [{label:_T('Abandon'),value:'go'},{label:_T('Stay'),value:null,primary:1}],{close:null});
  if(v!=='go')return;try{const r=await NET.req('match.abandon',{id});(ONL.leftMatch=ONL.leftMatch||{})[id]=1;if(r&&r.out&&r.out.died&&typeof mToast==='function')setTimeout(()=>mToast(_T('🌫 Your gladiator abandoned the sand — Damnatio.')),600)}catch(err){if(typeof mToast==='function')mToast('⚠ '+esc(err.message))}onlExit()},true);
function onlExit(){try{if(S&&!S.over){S.over=true}}catch(e){}ONLM.on=false;ONL.watching=null;ONL.live=ONL.live&&ONL.live.reported?ONL.live:null;onlBarSync();
  try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}try{if(typeof menuShow==='function')menuShow()}catch(e){}setTimeout(()=>{try{onlineOpen('play')}catch(e){}},200)}
{const st=document.createElement('style');st.textContent=`
body.onlarena #btnNew,body.onlarena #btnSimEnd,body.onlarena #btnMSave,body.onlarena #btnStudio,body.onlarena #btnLudus,body.onlarena #btnManager,body.onlarena #btnHall,
body.onlarena #btnExport,body.onlarena #btnTicket,body.onlarena #btnBets,body.onlarena #btnMenu,body.onlarena #btnGraph,body.onlarena .navnew{display:none!important}
#btnOnlLeave{border-color:#a3281f;color:#f0a090}
.onl-stage{grid-template-columns:minmax(0,1fr) auto}.onl-fig79{grid-column:2;grid-row:1 / span 3;align-self:end;justify-self:end;margin:0 6px -8px 0;position:relative;z-index:1}.onl-stage .onl-party{grid-column:1}.onl-fig79 .onl-mini{filter:drop-shadow(0 14px 10px rgba(0,0,0,.6))}.onl-stage .onl-plate{grid-column:1;grid-row:1}
.onl-gslots{display:grid;grid-template-columns:repeat(${ONLC.GLAD_MAX},minmax(0,1fr));gap:10px;margin:8px 0 12px}
.onl-gslot{all:unset;cursor:pointer;display:grid;justify-items:center;gap:3px;padding:10px;border:1px solid #5a4428;border-radius:10px;background:rgba(255,255,255,.03);text-align:center;font-size:13px}
.onl-gslot.on{border-color:var(--gold,#e8c96a);background:rgba(232,201,106,.08)}.onl-gslot.empty{border-style:dashed;color:var(--muted);font-size:22px}.onl-gslot.empty b,.onl-gslot.empty small{font-size:13px}
.onl-ged{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px}.onl-gprev{display:grid;justify-items:center;gap:10px;align-content:start}.onl-gform{display:grid;gap:6px;align-content:start}
.onl-g2{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important}.onl-g2 input[type=color]{width:100%;height:30px;padding:0;border:0;background:none}
.onl-busy{color:#f0cf7d;font-size:13px;margin:4px 0}
.onl-room .onl-rbody{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;margin-top:8px}.onl-rseats{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-bottom:8px}
.onl-rseat{display:flex;gap:8px;align-items:center;padding:6px 10px;border:1px dashed #6b5636;border-radius:10px;font-size:13px}.onl-rseat.on{border-style:solid}.onl-rseat small{display:block;color:var(--muted)}
.onl-rq{display:grid;place-items:center;width:40px;height:54px;color:var(--muted);font-size:22px}.onl-rdy{color:#8fd18f}
.onl-rset{display:grid;gap:4px;font-size:13px;margin:6px 0}.onl-rset label{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.onl-rset select{width:auto}
.onl-chat{display:grid;grid-template-rows:1fr auto;gap:6px;border:1px solid #5a4428;border-radius:10px;padding:8px;min-height:180px;max-height:280px}
.onl-chatlog{overflow-y:auto;font-size:13px;display:grid;gap:3px;align-content:start}.onl-chatrow{display:flex;gap:4px}
#onlLoad{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;background:radial-gradient(ellipse at center,#2a1d12,#0d0906);color:#f0cf7d;font:600 20px Georgia,serif;text-align:center}
#onlLoad .ring{width:56px;height:56px;border:4px solid rgba(240,207,125,.25);border-top-color:#f0cf7d;border-radius:50%;margin:0 auto 16px;animation:onlspin 1s linear infinite}@keyframes onlspin{to{transform:rotate(360deg)}}
@media(max-width:760px){.onl-ged,.onl-room .onl-rbody{grid-template-columns:1fr}.onl-gslots{grid-template-columns:1fr}}`;document.head.appendChild(st)}

/* ---------------- back from Google: a loading screen until the Online window is up ---------------- */
(function(){try{const u=new URL(location.href);if(!u.searchParams.get('code')||!u.searchParams.get('state'))return;const d=document.createElement('div');d.id='onlLoad';
  d.innerHTML='<div><div class="ring"></div>Entering the Online arena…</div>';document.body.appendChild(d);const t0=Date.now();
  const iv=setInterval(()=>{if(document.getElementById('onl')||Date.now()-t0>20000){clearInterval(iv);setTimeout(()=>d.remove(),250)}},120)}catch(e){}})();

/* ---------------- no gladiator yet: the main window anyway (v0.79 follow-up) ----------------
   Online opens on Play even before the first gladiator exists. Watching, the Spectate tab, the Lobby Browser and the Hall work;
   anything that needs a gladiator (play, host, join, wager, ticket, armory, party) opens the creator first. */
const ONL_NEEDS_GLAD=new Set(['quick','join','newgame','host','bet','betgo','ticket','buy','pinvite','pjoin','start','ready']);
/* on window, capturing: runs before the Online window's own click handlers */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-onl]');if(!b||ONL.char||!ONL.acct)return;if(!ONL_NEEDS_GLAD.has(b.dataset.onl))return;
  e.preventDefault();e.stopImmediatePropagation();onlNeedGlad(b.dataset.onl)},true);
/* ask first (a small centred popup over the Online window — never a second modal) */
const ONL_WHY={quick:_T('to fight in a playlist'),join:_T('to join a game'),newgame:_T('to host a game'),host:_T('to host a game'),start:_T('to start a game'),ready:_T('to take a seat'),
  bet:_T('to place a wager — it is paid from a gladiator’s wallet'),betgo:_T('to place a wager — it is paid from a gladiator’s wallet'),ticket:_T('to buy a ticket — it is paid from a gladiator’s wallet'),
  buy:_T('to buy gear'),pinvite:_T('to form a party'),pjoin:_T('to join a party')};
async function onlNeedGlad(act){const go=typeof ask76==='function'?await ask76(_T('⚔ You need a gladiator'),`<p style="margin:0">${_T`You need a gladiator ${esc2(ONL_WHY[act]||_T('for that'))}. Make one now? It takes a minute: a name and a class.`}</p><p class="rc-sub" style="margin:6px 0 0">${_T`Watching live matches and the Hall of the Fallen are open without one.`}</p>`,_T('⚔ Make my gladiator'),_T('Not now')):true;
  if(!go)return;ONL.newGlad=true;ONL.creating=null;onlRedraw()}
function onlNoGladHTML(what){return `<div class="card2 onl-noglad"><div class="onl-ngfig">${onlMini('hero',96)}</div><div>${_T`<b>No gladiator yet</b>`}<p class="rc-sub" style="margin:4px 0 8px">${_T`${what} Watching live matches and the Hall of the Fallen are open to everyone.`}</p>
  <button type="button" class="btn primary" data-onl="gnew">${_T`⚔ Make your gladiator`}</button></div></div>`}
{const base=onlPlayHTML;onlPlayHTML=function(){if(ONL.char)return base.apply(this,arguments);
  const fake={id:'-',name:'',cls:'hero',stats:{...ONLC.START_STATS},wallet:0,lifeCF:0,bouts:0,survived:0,wins:0,gear:[],look:{}};const keep=ONL.char;ONL.char=fake;let h;try{h=base.apply(this,arguments)}finally{ONL.char=keep}
  /* the stage becomes the invitation; the playlists stay (their buttons open the creator) */
  return h.replace(/<div class="onl-stage">[\s\S]*?<div class="onl-side">/,`${onlNoGladHTML(_T('Make one to fight, host, wager or buy a ticket.'))}<div class="onl-side">`)}}
{const base=onlArmoryHTML;onlArmoryHTML=function(){return ONL.char?base.apply(this,arguments):`<h3>${_T`🛒 Armory &amp; Market`}</h3>${onlNoGladHTML(_T('The armory sells to a gladiator, from their own wallet.'))}`}}
{const base=onlCharHTML;onlCharHTML=function(){if(ONL.chars.some(c=>c.alive))return base.apply(this,arguments);
  return `<div class="onl-lbtop"><h3>${_T`🛡 My Gladiators`} <span class="rc-sub">${_T`0/${ONLC.GLAD_MAX} living`}</span></h3></div><div class="onl-gslots">${Array.from({length:ONLC.GLAD_MAX},()=>`<button type="button" class="onl-gslot empty" data-onl="gnew">${_T`＋<b>New gladiator</b><small>starts as a Tiro</small>`}</button>`).join('')}</div>`}}
{const st=document.createElement('style');st.textContent=`.onl-noglad{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;padding:18px 20px;min-height:180px;border-color:var(--gold,#e8c96a)!important}
.onl-cstage{gap:10px}.onl-cmini{opacity:.95}.onl-cstage .portrait{border-radius:10px;box-shadow:0 8px 20px rgba(0,0,0,.5)}`;document.head.appendChild(st)}
