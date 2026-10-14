/* =====================================================================
   180-v89profile · v0.89 L · THE ONLINE PROFILE + LANISTA NAME (his approval 2026-10-05; contract tools/plans/onl89-profile.md)
   =====================================================================
   1 · LANISTA NAME — the rail's account box showed the Google sign-in name. Now every account picks its own lanista name at the first
       sign-in (before the house is founded): a random Roman praenomen + nomen to start (🎲), 3–24 letters, word-filtered, unique
       (server LNAME#). Old accounts get the same step at their next sign-in. The sign-in name is never shown or kept (server index.js).
       It shows in the rail, on the public profile / visit ("formerly X" for 14 days after a rename), on followed houses and on room seats.
   2 · 👤 PROFILE & SETTINGS (rail tab 'prof', after the Hall, before the account box): Name (rename once every 30 days, says when next),
       FID (Flavius ID, FID-XXXXXX, 📋 Copy), 🔍 Find a house by FID (+ ★ Follow by FID), Privacy (Here now / Orbis; who may invite me:
       everyone / houses I follow / nobody — enforced by the server), Account (Sign out; Delete my account: asks twice, the second asks
       for the house name). Guests see a short note + the FID search.
   3 · FID everywhere: the landing's ★ Followed houses card gets a Find / Follow by FID box; a room gets ✉ Invite by FID; seats name the
       lanista + FID on hover; links #fid=FID-XXXXXX open that house's visit (renames never break them).
   4 · 🏛 THE VISIT — any house name, followed house, FID search or #fid link opens THEIR Domus read-only (pseudo-tab 'visit'): a
       "Visiting House X" strip (★ Follow, ✉ Invite, FID 📋, ← Back to your Domus), the banner (crest, colours, record, 🏆 Trophies), the
       showcase of a gladiator (avatar in his armor, weapon cards, rank, record — click another card to show him), the memorial wall.
       Never a treasury, purse, stake, shelf, offerings, loadouts or an edit button (the server's domus.visit sends none of them).
       The 137 profile popup stays (and gains 🏛 Visit + the lanista line).
   MOCK: lanista.name, lanista.names, acct.priv, acct.delete, fid.find, domus.visit + the hello / who.list / follow / invite / profile
   wrappers, as server/src/routes.js "v0.89 L". Test tools/tests/tonl89p.js.
   ===================================================================== */
const V89L={lan:null,need:false,draft:'',err:'',visit:null,vSel:null,names:{},ask:new Set(),askT:0,find:'',findErr:'',back:'char'};
const PRAE89=[_T('Gaius'),_T('Marcus'),_T('Lucius'),_T('Publius'),_T('Quintus'),_T('Titus'),_T('Gnaeus'),_T('Sextus'),_T('Aulus'),_T('Decimus'),_T('Servius'),_T('Tiberius'),_T('Manius'),_T('Spurius'),_T('Appius'),_T('Numerius')];
const NOMEN89=[_T('Varro'),_T('Fabius'),_T('Cornelius'),_T('Valerius'),_T('Claudius'),_T('Junius'),_T('Aemilius'),_T('Licinius'),_T('Sempronius'),_T('Tullius'),_T('Petronius'),_T('Vettius'),_T('Calpurnius'),_T('Domitius'),_T('Flavius'),_T('Sulpicius'),_T('Pompeius'),_T('Antonius'),_T('Caecilius'),_T('Octavius'),_T('Plautius'),_T('Annius'),_T('Marius'),_T('Livius')];
const roman89=()=>PRAE89[Math.floor(Math.random()*PRAE89.length)]+' '+NOMEN89[Math.floor(Math.random()*NOMEN89.length)];
const l89Guest=()=>typeof onlIsGuest82==='function'&&onlIsGuest82();
const l89Now=()=>typeof onlNow82==='function'?onlNow82():Date.now();
const l89Date=t=>new Date(t).toLocaleDateString();
async function l89Copy(txt){let ok=false;try{await navigator.clipboard.writeText(txt);ok=true}catch(e){}
  if(!ok){try{const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove()}catch(e){}}return ok}
const l89FidChip=fid=>fid?`<span class="fid89" title="${_T`Flavius ID — share it so friends can follow or invite you`}"><small>${_T`FID`}</small> <b>${esc2(fid)}</b> <button type="button" class="btn tksm" data-l89="copy" data-v="${esc2(fid)}" aria-label="${_T`Copy the FID`}">📋</button></span>`:'';

/* =========================== THE MOCK SERVER (as server/src/routes.js "v0.89 L") =========================== */
function mockFid89(w,A){if(!A||A.bot)return null;if(A.fid)return A.fid;w.fids89=w.fids89||{};for(let i=0;i<20;i++){const c=ONLC.fidMake();if(!w.fids89[c]){w.fids89[c]=A.id;A.fid=c;return c}}return null}
const mockByFid89=(w,s)=>{const c=ONLC.fidClean(s);const id=c&&(w.fids89||{})[c];const A=id&&w.accounts[id];return A?{A,code:c}:null};
const MOCK_GQ89={};
function mockLook89(w,me){const m=Math.floor(Date.now()/60e3);let q;if(typeof mockIsGuest82==='function'&&mockIsGuest82(me))q=MOCK_GQ89[me]=MOCK_GQ89[me]||{};else{const A=w.accounts[me];if(!A)throw new Error(_T('Sign in first.'));q=A.fq89=A.fq89||{}}
  if(q.h!==m){q.h=m;q.n=0}if(q.n>=ONLC.FIND_MAX89)throw onlErr82(_T('Too many lookups — wait a minute.'),'slow');q.n++}
function mockHouse89(w,d){if(d.fid!=null||(d.id==null&&d.name&&ONLC.fidClean(d.name))){const F=mockByFid89(w,d.fid!=null?d.fid:d.name);const D=F&&F.A.domus&&mockDomus82(w,F.A.domus);if(!D)throw onlErr82(_T('No house with that FID.'),'no_fid');return D}
  let D=d.id?mockDomus82(w,String(d.id)):null;if(!D&&d.name){const id=(w.dnames82||{})[ONLC.domusKey(d.name)];D=mockDomus82(w,id)}if(!D)throw onlErr82(_T('No such house.'),'no_domus');return D}
function mockLanMe89(A){return {name:A.lname||null,need:!A.lname,fid:ONLC.fidShow(A.fid),next:ONLC.renameAt(A),old:(ONLC.lanOut(A,Date.now())||{}).old||null,priv:ONLC.privOf89(A)}}
const mockHidden89=(w,id)=>ONLC.privOf89(w.accounts[id]).hide;
Object.assign(MOCK_ROUTES,{
  'lanista.name':(w,d,me)=>{const A=w.accounts[me];if(!A)throw new Error(_T('Sign in first.'));const why=ONLC.lnameWhy(d.name);if(why)throw onlErr82(_T(why),'lname');
    const name=ONLC.lnameClean(d.name);const k=ONLC.lnameKey(name);const same=A.lname&&ONLC.lnameKey(A.lname)===k;if(same&&A.lname===name)return {lan:mockLanMe89(A)};const now=Date.now();
    if(A.lname&&!same){const t=ONLC.renameAt(A);if(t>now)throw onlErr82(_T`One rename every 30 days — next on ${new Date(t).toISOString().slice(0,10)}.`,'too_soon')}
    w.lnames89=w.lnames89||{};const X=w.lnames89[k];if(X&&X.acct!==me&&!(X.until&&X.until<=now))throw onlErr82(_T('Another lanista has that name.'),'name_taken');
    w.lnames89[k]={acct:me,name};if(A.lname&&!same){A.nameAt=now;A.lold={n:A.lname,until:now+ONLC.LOLD_MS89};w.lnames89[ONLC.lnameKey(A.lname)]={acct:me,name:A.lname,until:now+ONLC.LOLD_MS89}}else if(!A.lname)A.nameAt=now;
    A.lname=name;A.name=name;return {lan:mockLanMe89(A)}},
  'lanista.names':(w,d)=>{const out={};for(const id of (Array.isArray(d.ids)?d.ids:[]).map(String).slice(0,16)){const A=w.accounts[id];if(!A||A.bot||!A.lname)continue;mockFid89(w,A);const o=ONLC.lanOut(A,Date.now());out[id]={n:A.lname,fid:ONLC.fidShow(A.fid),...(o.old?{old:o.old}:{})}}return out},
  'acct.priv':(w,d,me)=>{const A=w.accounts[me];if(!A)throw new Error(_T('Sign in first.'));A.priv89=ONLC.cleanPriv89(d,A.priv89);if(A.priv89.hide)A.tz='';return {priv:A.priv89}},
  'fid.find':(w,d,me)=>{mockLook89(w,me);const F=mockByFid89(w,d.fid);const D=F&&F.A.domus&&mockDomus82(w,F.A.domus);if(!D)throw onlErr82(_T('No house with that FID.'),'no_fid');
    return {fid:ONLC.fidShow(F.code),domus:ONLC.domusPub89(D),lan:ONLC.lanOut(F.A,Date.now())}},
  'domus.visit':(w,d,me)=>{mockLook89(w,me);const D=mockHouse89(w,d||{});const O=w.accounts[D.owner];const mine=Object.values(w.chars).filter(c=>c.owner===D.owner&&c.domus===D.id);
    const glads=mine.filter(c=>c.alive).sort((a,b)=>(a.born||0)-(b.born||0)).map(ONLC.visitChar89);const A=w.accounts[me];
    const st=(typeof mockFollows83==='function'?mockFollows83(w,[{id:D.id,name:D.name}]):[])[0]||null;const inv=A&&O&&A.id!==O.id?ONLC.invWhy89(O,{domus:A.domus}):'';
    return {domus:{...ONLC.domusPub89(D),archived:!!D.archived,trophies:D.trophies||[],recent:D.recent||[]},glads,active:O&&glads.some(c=>c.id===O.active)?O.active:(glads[glads.length-1]||{}).id||null,
      memo:D.memo89||[],fallen:mine.filter(c=>!c.alive).slice(0,60).map(c=>({id:c.id,name:c.name,cls:c.cls,rank:(c.died&&c.died.rank)||ONLC.rankFor(c).k,at:(c.died&&c.died.at)||0})),
      lan:ONLC.lanOut(O,Date.now()),fid:O?ONLC.fidShow(mockFid89(w,O)):'',following:!!(A&&(A.follows||[]).some(f=>f.id===D.id)),mine:!!(A&&A.domus===D.id),now:st,acct:st&&st.st==='free'&&!inv?st.acct:null,inv}},
  'acct.delete':(w,d,me)=>{const A=w.accounts[me];if(!A)throw new Error(_T('Sign in first.'));const D=mockDomus82(w,A.domus);const want=D?D.name:(A.lname||'');
    if(!want||String(d.confirm||'').trim().toLowerCase()!==want.toLowerCase())throw onlErr82(D?_T('Type your house name to confirm.'):_T('Type your lanista name to confirm.'),'confirm');
    if(mockRoomOf80(w,me)||mockLive80(w,me))throw onlErr82(_T('Leave your room or finish your match first.'),'in_match');
    for(const c of Object.values(w.chars))if(c.owner===me)delete w.chars[c.id];
    for(const id of [A.domus,...(A.domusOld||[])].filter(Boolean)){const X=mockDomus82(w,id);if(!X)continue;const k=ONLC.domusKey(X.name);if((w.dnames82||{})[k]===id)delete w.dnames82[k];delete w.domus82[id]}
    for(const [k,X] of Object.entries(w.lnames89||{}))if(X.acct===me)delete w.lnames89[k];if(A.fid&&w.fids89)delete w.fids89[A.fid];
    if(w.invites82)delete w.invites82[me];if(A.party&&w.parties&&w.parties[A.party]){const P=w.parties[A.party];P.members=(P.members||[]).filter(x=>x!==me);if(!P.members.length)delete w.parties[A.party]}
    delete w.accounts[me];try{sessionStorage.removeItem('flavius_onlacct');localStorage.removeItem('flavius_onlacct')}catch(e){}return {deleted:true}}});
/* the mock's sign-in box IS the lanista name (when it is a valid, free one) — {google:1} keeps the real path (the name step), as the server's dev sign-in */
{const base=MOCK_ROUTES['auth.signin'];MOCK_ROUTES['auth.signin']=(w,d,me)=>{const a=base(w,d,me);if(d&&!d.google&&a&&!ONLC.lnameWhy(d.name)){const name=ONLC.lnameClean(d.name);const k=ONLC.lnameKey(name);w.lnames89=w.lnames89||{};const X=w.lnames89[k];
    if(!X||(X.until&&X.until<=Date.now())){w.lnames89[k]={acct:a.id,name};a.lname=name;a.name=name}}return a}}
/* hello: FID made once, the sign-in name rewritten, the lanista block */
{const base=MOCK_ROUTES['hello'];MOCK_ROUTES['hello']=(w,d,me)=>{const A=me&&w.accounts[me];if(A&&!A.bot){mockFid89(w,A);const nm=A.lname||_T('Lanista');if(A.name!==nm)A.name=nm}
  const o=base(w,d,me);if(A&&!A.bot&&o){if(ONLC.privOf89(A).hide)A.tz='';o.lan89=mockLanMe89(A);o.needLname=!A.lname;if(o.me)o.me={...o.me,name:A.name}}return o}}
/* hidden lanistas glow nowhere (still counted); no Here-now pill; the invite rules */
{const base=mockHere80;mockHere80=function(w){return base.apply(this,arguments).map(h=>!h.bot&&mockHidden89(w,h.id)?{...h,tz:''}:h)}}
{const base=MOCK_ROUTES['who.list'];MOCK_ROUTES['who.list']=(w,d,me)=>{const B=w.accounts[me]||{};return base(w,d,me).filter(r=>!mockHidden89(w,r.id)).map(r=>{const A=w.accounts[r.id]||{};return {...r,...(A.lname?{lan:A.lname}:{}),...(ONLC.invWhy89(A,{domus:B.domus})?{noinv:1}:{})}})}}
{const base=mockInvite80;mockInvite80=function(w,me,L,to){const T=w.accounts[to];if(T){const why=ONLC.invWhy89(T,{domus:(w.accounts[me]||{}).domus});if(why)return _T(why)}return base.apply(this,arguments)}}
{const base=mockFree80;mockFree80=function(w,by){const B=w.accounts[by]||{};return base.apply(this,arguments).filter(id=>!ONLC.invWhy89(w.accounts[id],{domus:B.domus}))}}
{const base=MOCK_ROUTES['lobby.invite'];MOCK_ROUTES['lobby.invite']=(w,d,me)=>{if(d&&(d.fid!=null||(!w.accounts[d.to]&&ONLC.fidClean(d.to)))){mockLook89(w,me);const F=mockByFid89(w,d.fid!=null?d.fid:d.to);if(!F)throw onlErr82(_T('No lanista with that FID.'),'no_fid');d={...d,to:F.A.id}}return base(w,d,me)}}
{const base=MOCK_ROUTES['domus.follow'];MOCK_ROUTES['domus.follow']=(w,d,me)=>{if(d&&d.fid!=null){mockLook89(w,me);const F=mockByFid89(w,d.fid);if(!F||!F.A.domus)throw onlErr82(_T('No house with that FID.'),'no_fid');d={...d,id:F.A.domus}}return base(w,d,me)}}
{const base=MOCK_ROUTES['domus.profile'];MOCK_ROUTES['domus.profile']=(w,d,me)=>{const o=base(w,d,me);try{const D=mockDomus82(w,o.domus.id);const O=D&&w.accounts[D.owner];if(O){o.lan=ONLC.lanOut(O,Date.now());o.fid=ONLC.fidShow(mockFid89(w,O));if(o.now&&o.now.st!=='off'&&mockHidden89(w,O.id))o.now={id:D.id,name:D.name,st:'off'}}}catch(e){}return o}}
if(typeof mockFollows83==='function'){const base=mockFollows83;mockFollows83=function(w,fs){return base.apply(this,arguments).filter(f=>mockDomus82(w,f.id)).map(f=>{const D=mockDomus82(w,f.id);const O=w.accounts[D.owner]||{};const y={...f,...(O.lname?{lan:O.lname}:{})};
  return O.id&&mockHidden89(w,O.id)&&y.st!=='off'?{id:y.id,name:y.name,st:'off',...(y.lan?{lan:y.lan}:{})}:y})}}

/* =========================== THE CLIENT =========================== */
{const base=NET.req;NET.req=function(t,d){const p=base.apply(this,arguments);if(p&&typeof p.then==='function')p.then(r=>{try{
    if(t==='hello'&&r&&r.me){if(r.lan89){V89L.lan=r.lan89;V89L.need=!!r.needLname}else{V89L.lan=null;V89L.need=false}}
    if(t==='lanista.name'&&r&&r.lan){V89L.lan={...(V89L.lan||{}),...r.lan};V89L.need=false;if(ONL.acct)ONL.acct.name=r.lan.name}
    if(t==='acct.priv'&&r&&r.priv&&V89L.lan)V89L.lan.priv=r.priv}catch(e){}}).catch(()=>{});return p}}
const l89Main=(h,html)=>{const a=h.indexOf('<main class="onl-main">');const b=h.lastIndexOf('</main>');return a<0||b<a?h:h.slice(0,a+23)+html+h.slice(b)};

/* ---------------- 1 · the name step ---------------- */
function l89StepHTML(){const v=V89L.draft||(V89L.draft=roman89());
  return `<div class="card2 ln89-step"><div class="dom82-crest">📜</div><div class="dom82-fb"><h2>${_T`Choose your lanista name`}</h2>
    <p>${_T`Other lanistas see this name — never the name of your sign-in account.`}</p>
    <div class="dom82-row"><input class="tin" id="ln89Name" maxlength="${ONLC.LNAME_MAX89}" value="${esc2(v)}" autocomplete="off"><button type="button" class="btn" data-l89="dice" title="${_T`Another Roman name`}">🎲</button><button type="button" class="btn primary" data-l89="take">${_T`✓ Take this name`}</button></div>
    <small class="rc-sub">${_T`${ONLC.LNAME_MIN89}–${ONLC.LNAME_MAX89} letters · no two lanistas share a name · one rename every 30 days.`}</small>${V89L.err?`<p class="onl-err">${esc2(V89L.err)}</p>`:''}</div></div>`}

/* ---------------- 2 · the profile tab ---------------- */
function l89FindHTML(follow){return `<div class="fd89l"><label class="rc-sub" for="fd89In">${_T`🔍 Find a house by FID`}</label><div class="dom82-row"><input class="tin" id="fd89In" placeholder="${follow?_T('🔍 Find a house by FID'):'FID-XXXXXX'}" maxlength="14" value="${esc2(V89L.find)}" autocomplete="off" spellcheck="false">
    <button type="button" class="btn tksm primary" data-l89="find" title="${_T`🔍 Find a house by FID`}">${follow?'🔍':_T`🔍 Find`}</button>${follow&&ONL.acct&&!l89Guest()?`<button type="button" class="btn tksm" data-l89="ffollow" title="${_T`★ Follow by FID`}">★</button>`:''}</div>${V89L.findErr?`<small class="onl-err">${esc2(V89L.findErr)}</small>`:''}</div>`}
function l89ProfHTML(){if(!ONL.acct||l89Guest())return `<div class="pr89"><div class="card2 pr89-s"><h3>${_T`👤 Profile & Settings`}</h3><p class="rc-sub">${_T`Guests only watch. Sign in to choose a lanista name, get your FID and set who may invite you.`}</p></div><div class="card2 pr89-s">${l89FindHTML(false)}</div></div>`;
  const L=V89L.lan||{};const P=L.priv||{hide:false,inv:'all'};const next=L.next||0;const can=!next||next<=l89Now();const D=ONL.domus;
  const inv=[['all',_T('Everyone')],['follow',_T('Houses I follow')],['none',_T('Nobody')]];
  return `<div class="pr89">
   <div class="card2 pr89-s"><h3>${_T`📜 Name`}</h3><div class="pr89-name"><b>${esc2(L.name||'—')}</b>${L.old?`<small class="rc-sub">${_T`formerly ${esc2(L.old)}`}</small>`:''}</div>${l89FidChip(L.fid)}
     <div class="dom82-row"><input class="tin" id="ln89Ren" maxlength="${ONLC.LNAME_MAX89}" value="${esc2(L.name||'')}" ${can?'':'disabled'} autocomplete="off"><button type="button" class="btn tksm" data-l89="rename" ${can?'':'disabled'}>${_T`✎ Rename`}</button></div>
     <small class="rc-sub">${can?_T('One rename every 30 days. Your old name shows as “formerly” for 14 days.'):_T`Next rename: ${esc2(l89Date(next))}`}</small>${V89L.err?`<p class="onl-err">${esc2(V89L.err)}</p>`:''}</div>
   <div class="card2 pr89-s">${l89FindHTML(true)}</div>
   <div class="card2 pr89-s"><h3>${_T`🔒 Privacy`}</h3><label class="pr89-ck"><input type="checkbox" data-l89p="hide" ${P.hide?'':'checked'}> ${_T`Show me in “Here now” and on the Orbis map`}</label>
     <small class="rc-sub">${_T`Hidden, you still count in the totals — without your name.`}</small>
     <div class="pr89-inv" role="radiogroup" aria-label="${_T`Who may invite me`}"><small>${_T`Who may invite me`}</small>${inv.map(([k,l])=>`<label><input type="radio" name="inv89" data-l89p="inv" value="${k}" ${P.inv===k?'checked':''}> ${l}</label>`).join('')}</div></div>
   <div class="card2 pr89-s"><h3>${_T`⚙ Account`}</h3><div class="mbtns"><button type="button" class="btn" data-onl="signout">${_T`Sign out`}</button><button type="button" class="btn danger pr89-del" data-l89="del">${_T`🗑 Delete my account`}</button></div>
     <small class="rc-sub">${D?_T`Deleting removes House ${esc2(D.name)}, its gladiators, gear, shelf and follows for good.`:_T('Deleting removes your account for good.')}</small></div></div>`}

/* ---------------- 4 · the visit ---------------- */
function l89VisitHTML(){const r=V89L.visit;if(!r)return '';const D=r.domus||{};const L=D.look89&&D.look89.crest?D.look89:{c1:'#7a2230',c2:'#d6ab4c',crest:ONLC.CREST89[Math.abs(typeof hashStr==='function'?hashStr(String(D.id||'d')):7)%12]};
  let crest='';try{crest=flagURI(L.c1,L.c2,ludusInitials(String(D.name||'')),L.crest)}catch(e){}
  const glads=r.glads||[];const ch=glads.find(c=>c.id===V89L.vSel)||glads.find(c=>c.id===r.active)||glads[0]||null;const room=typeof onlMyLobby==='function'?onlMyLobby():null;const inRoom=room&&room.status==='waiting';
  const st={off:_T('⚫ Away'),free:_T('🟢 In the arena'),room:_T('🟡 In a room'),fight:_T('🔴 Fighting now')}[(r.now||{}).st]||'';
  const acts=r.mine||l89Guest()||!ONL.acct?'':`<button type="button" class="btn tksm ${r.following?'':'primary'}" data-l89="vfollow" data-on="${r.following?0:1}">${r.following?_T('★ Following'):_T('☆ Follow')}</button>
    <button type="button" class="btn tksm" data-l89="vinv" ${inRoom&&r.acct?'':_T`disabled title="${esc2(r.inv?_T(r.inv):!inRoom?_T('Open a room first'):_T('Not free right now'))}"`}>${_T`✉ Invite`}</button>${(r.now||{}).st==='fight'&&r.now.match?`<button type="button" class="btn tksm" data-onl="watch" data-v="${esc2(r.now.match)}">${_T`👁 Watch`}</button>`:''}`;
  const rec=[[_T('Bouts'),D.bouts|0],[_T('Won'),D.wins|0],[_T('Survived'),D.survived|0],[_T('Fallen'),D.fallen|0],[_T('Fame'),`✦ ${D.fame|0}`],[_T('Lifetime CF'),cfAmt87(D.lifeCF|0)]];
  const strip=`<div class="vs89"><span class="vs89-t">${_T`🏛 Visiting <b>${esc2(onlHouse82(D.name||''))}</b>`}${r.lan&&r.lan.n?` <small>${_T`lanista ${esc2(r.lan.n)}`}${r.lan.old?_T` (formerly ${esc2(r.lan.old)})`:''}</small>`:''}${st?` <small>· ${esc2(st)}</small>`:''}</span>
    <span class="vs89-a">${acts}${l89FidChip(r.fid)}<button type="button" class="btn tksm" data-l89="vback">${ONL.acct&&!l89Guest()&&ONL.domus?_T('← Back to your Domus'):_T('← Back')}</button></span></div>`;
  const banner=`<div class="db89" style="--hc1:${esc2(L.c1)};--hc2:${esc2(L.c2)}"><div class="db89-top"><img class="db89-crest" src="${crest}" alt="">
     <div class="db89-ttl"><h3>${esc2(onlHouse82(D.name||''))}${D.test?' <i class="test83">TEST</i>':''}</h3><small>${D.founded?_T`founded ${esc2(l89Date(D.founded))}`:''}</small><div class="db89-rec">${rec.map(([k,v])=>`<span><b>${v}</b> ${k}</span>`).join('')}</div></div>
     <div class="db89-side"><button type="button" class="btn tksm tr89b" data-l89="vtro">${_T`🏆 Trophies`}${(D.trophies||[]).length?` <b>${D.trophies.length}</b>`:''}</button></div></div></div>`;
  let show=`<div class="sc89 none"><p class="rc-sub">${_T`No living gladiators.`}</p></div>`;
  if(ch){let av='';try{av=avatarSVG(avatarFor73(dom88Armor(ch),'vs89_'+ch.id))}catch(e){}const ws=ONLC.equipOf(ch).filter(it=>(ONL83.piece(ch,it)||{}).kind==='w');const h=d89Hands(ch.cls,ws,it=>d89Base(ONL83.piece(ch,it)));
    const hand=(x,side)=>{const lbl=side==='R'?_T('Right hand - Primary'):_T('Left hand - Secondary');if(!x)return `<div class="wp89 empty"><div class="wp89-c"><span>${_T`Empty hand`}</span></div><small>${lbl}</small></div>`;
      const I=x.it?ONL83.piece(ch,x.it):null;const named=I&&I.named;const nm=named?I.n:(W[x.k]||{}).n||x.k;return `<div class="wp89 ${named?'nm89':''} ${x.kit?'kit':''}" ${named?_T`style="--rc:${ONL83.rarCol[I.rar]}"`:''}><div class="wp89-c">${typeof cardHTML==='function'?cardHTML('w:'+x.k,'md').replace(/ data-card="[^"]*"/g,''):''}</div><small>${lbl} · <b>${esc2(nm)}</b>${x.kit?_T(' <i>recruit kit</i>'):''}</small></div>`};
    const worn=ONLC.equipOf(ch).map(it=>ONL83.piece(ch,it)).filter(I=>I&&I.kind==='a').map(I=>`<span class="wr89 ${I.named?'nm89':''}"><span class="wr89-p">${_T`${esc2(I.n)} · ${I.ap|0} AP`}</span></span>`).join('');
    const imm=typeof onlImmortalis88==='function'&&onlImmortalis88(ch);const crec=[[_T('Bouts'),ch.bouts|0],[_T('Wins'),ch.wins|0],[_T('Survived'),ch.survived|0],[_T('Lifetime CF'),cfAmt87(ch.lifeCF|0)],[_T('Glory'),`✦ ${ch.glory|0}`]];
    show=`<div class="sc89 vs89sc ${imm?'imm88':''}"><div class="sc89-wp">${hand(h.R,'R')}${hand(h.L,'L')}</div><div class="sc89-av"><div class="av89">${av}</div><div class="wr89-l">${worn||`<small class="rc-sub">${_T`No armor.`}</small>`}</div></div>
      <div class="sc89-info"><div class="sc89-n">${esc2(ch.name)}</div>${imm&&typeof imm88Chip==='function'?imm88Chip():''}<div class="sc89-sub">${esc2((CLASSES[ch.cls]||{}).name||'')} ${onlRankChip(ch.rank)}${ch.id===r.active?_T(' <span class="badge gold">⚔ Active</span>'):''}</div>
      <div class="sc89-rec">${crec.map(([k,v])=>`<div><b>${v}</b><small>${k}</small></div>`).join('')}</div></div></div>`}
  const cards=glads.length?`<div class="gc89-row" style="--n:${glads.length}">${glads.map(c=>{let av='';try{av=avatarSVG(avatarFor73(dom88Armor(c),'vc89_'+c.id))}catch(e){}
      return `<button type="button" class="gc89 ${ch&&c.id===ch.id?'act':''}" data-l89="vsel" data-v="${esc2(c.id)}"><span class="gc89-av">${av}</span><span class="gc89-b"><b>${esc2(c.name)}</b><small>${esc2((CLASSES[c.cls]||{}).name||'')} · ${onlRankChip(c.rank)}</small><small>${_T`${c.wins|0} won · ${c.survived|0} survived`}</small></span></button>`}).join('')}</div>`:'';
  const memo=(r.memo||[]).slice();const seen=new Set(memo.map(m=>m.id));for(const c of r.fallen||[])if(!seen.has(c.id))memo.push({...c,old:1});
  const wall=memo.length?`<div class="mw89"><div class="mw89-h">${_T`🕯 Memorial wall <small class="rc-sub">${memo.length}</small>`}</div><div class="mw89-r">${memo.map(m=>`<div class="pq89"><span class="pq89-m">${m.fa==='c'?'✝':'D·M'}</span><b>${esc2(m.name)}</b><small>${esc2((CLASSES[m.cls]||{}).name||'')} · ${onlRankChip(m.rank||'tiro')}</small>${m.at?`<small>${esc2(l89Date(m.at))}</small>`:''}</div>`).join('')}</div></div>`:'';
  return `<div class="dom82-wrap d89w vs89w"><div class="dom82-main dom89" style="--hc1:${esc2(L.c1)};--hc2:${esc2(L.c2)}">${strip}${banner}${show}${cards}${wall}</div></div>`}
async function onl89Visit(x){if(!x)return;V89L.findErr='';const d=typeof x==='object'?x:ONLC.fidClean(x)?{fid:x}:/^D/.test(String(x))?{id:x}:{name:String(x).replace(/^House /i,'')};let r;
  try{r=await NET.req('domus.visit',d)}catch(e){const msg=e&&(e.code==='no_fid'||e.code==='no_domus')?(d.name!=null?_T('No house with that name.'):_T('No house with that FID.')):errText92(e,_T('No such house.'));if(d.fid!=null){V89L.findErr=msg;if(document.getElementById('onl'))onlRedraw()}onlToast80('🏛 '+esc2(msg));return null}
  V89L.visit=r;V89L.vSel=r.active;if(ONL.tab!=='visit')V89L.back=ONL.tab==='prof'?'prof':'char';ONL.tab='visit';for(const p of document.querySelectorAll('.pf83pop,.pop89l'))p.remove();
  if(document.getElementById('onl'))onlRedraw();else if(typeof onlineOpen==='function')onlineOpen('visit');return r}

/* ---------------- the rail + the tabs ---------------- */
{const base=onlHTML;onlHTML=function(){const want=ONL.tab;const fake=want==='prof'||want==='visit';if(fake)ONL.tab='hall';let h;try{h=base.apply(this,arguments)}finally{if(fake)ONL.tab=want}
  try{if(!h.includes('class="onl-rail"')||(ONL.newGlad&&!fake))return h;const guest=l89Guest();
    if(ONL.acct&&!guest&&V89L.lan){h=h.replace(/(<div class="onl-acct"><span>)[^<]*(<\/span>)/,(m,a,b)=>a+esc2(V89L.lan.name||'—')+b)}
    const btn=`<button type="button" data-onl="tab" data-v="prof" class="${want==='prof'?'on':''}">${_T`👤 Profile & Settings`}</button>`;h=h.replace('<div class="onl-acct">',btn+'<div class="onl-acct">');
    if(fake)h=h.replace(/(<button type="button" data-[a-z0-9]+="tab" data-v="hall" class=")on(")/,'$1$2');
    if(ONL.acct&&!guest&&V89L.need){h=h.replace(/data-(onl|d82)="([\w-]+)"/g,(m,k,a)=>a==='signout'?m:`data-d82="${a}" aria-disabled="true" title="${_T`Choose your lanista name first`}"`);return l89Main(h,l89StepHTML())}
    if(want==='prof')return l89Main(h,l89ProfHTML());if(want==='visit')return l89Main(h,V89L.visit?l89VisitHTML():'')}catch(e){console.error(e)}return h}}
/* the followed houses: the lanista beside the house; Find / Follow by FID */
if(typeof onl83Follows==='function'){const base=onl83Follows;onl83Follows=function(){let h=base.apply(this,arguments);if(!h)return h;try{const F=ONL83U.follows||[];let i=0;
    h=h.replace(/(<button type="button" class="fl83-n"[^>]*>[\s\S]*?<\/button>)/g,m=>{const f=F[i++];return f&&f.lan?m+`<small class="ln89f">${esc2(f.lan)}</small>`:m});
    const k=h.lastIndexOf('</div>');if(k>0)h=h.slice(0,k)+l89FindHTML(true)+h.slice(k)}catch(e){console.error(e)}return h}}
/* room seats: the lanista's name + FID on hover; ✉ Invite by FID */
function l89Ask(ids){const miss=ids.filter(id=>id&&!/^bot/.test(id)&&!(id in V89L.names)&&!V89L.ask.has(id));if(!miss.length)return;for(const id of miss)V89L.ask.add(id);clearTimeout(V89L.askT);
  V89L.askT=setTimeout(async()=>{const q=[...V89L.ask].slice(0,16);let r={};try{r=await NET.req('lanista.names',{ids:q})}catch(e){}for(const id of q){V89L.ask.delete(id);V89L.names[id]=r[id]||null}
    if(document.getElementById('onl')&&typeof onlFocus80==='function'&&!onlFocus80())onlRedraw()},150)}
if(typeof onlRoomHTML80==='function'){const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){let h=base.apply(this,arguments);try{if(!L||!ONL.acct||l89Guest())return h;const me=typeof onlMe80==='function'?onlMe80():null;
    const ppl=[...(L.players||[]),...(L.members||[]).filter(m=>!(L.players||[]).some(p=>p.id===m.id))];l89Ask(ppl.map(p=>p.id));
    for(const p of ppl){const v=V89L.names[p.id];if(!v)continue;const tip=esc2(_T`Lanista ${v.n} · ${v.fid}`);const nm=esc2(p.id===me?_T('You'):p.name);
      h=h.replace(`<b>${nm}</b>`,`<b title="${tip}">${nm}</b><small class="ln89r" title="${tip}">${esc2(v.n)}</small>`);h=h.replace(new RegExp(`(<span class="r80-sm[^"]*")>${nm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')} `),`$1 title="${tip}">${nm} <small class="ln89r">${esc2(v.n)}</small> `)}
    if(L.status==='waiting'&&!grey&&(L.members||[]).some(m=>m.id===me)){const row=`<div class="fi89 dom82-row"><input class="tin" id="fi89In" placeholder="FID-XXXXXX" maxlength="14" autocomplete="off" spellcheck="false" aria-label="${_T`Invite by FID`}"><button type="button" class="btn tksm" data-l89="finv" data-v="${esc2(L.id)}">${_T`✉ Invite by FID`}</button></div>`;
      if(h.includes('<div class="r80-body">'))h=h.replace('<div class="r80-body">','<div class="r80-body">'+row);else{const k=h.lastIndexOf('</div>');if(k>0)h=h.slice(0,k)+row+h.slice(k)}}}catch(e){console.error(e)}return h}}
/* the 137 profile popup: the lanista line + 🏛 Visit */
if(typeof onl83Profile==='function'){const base=onl83Profile;onl83Profile=async function(x){V89L.prof=null;const r=await base.apply(this,arguments);try{const pop=document.querySelector('.pf83pop');const P=V89L.prof;if(pop&&P){
    const t=pop.querySelector('.pf83-t');if(t&&P.lan&&P.lan.n&&!t.querySelector('.ln89p'))t.insertAdjacentHTML('beforeend',`<small class="rc-sub ln89p">${_T`lanista ${esc2(P.lan.n)}`}${P.lan.old?_T` (formerly ${esc2(P.lan.old)})`:''}${P.fid?` · ${l89FidChip(P.fid)}`:''}</small>`);
    const a=pop.querySelector('.pf83-act');if(a&&P.domus&&!a.querySelector('[data-l89="pvisit"]'))a.insertAdjacentHTML('afterbegin',`<button type="button" class="btn primary" data-l89="pvisit" data-v="${esc2(P.domus.id)}">${_T`🏛 Visit the Domus`}</button>`)}}catch(e){console.error(e)}return r}}
if(typeof ONL83!=='undefined'&&typeof ONL83.profile==='function'){const base=ONL83.profile;ONL83.profile=async function(){const r=await base.apply(this,arguments);V89L.prof=r;return r}}
/* any other house name, a followed house → the visit (window capture: before 137's own handlers); your own house keeps its popup */
window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.dom82c,.dom84c,[data-onl83="prof"]');if(!t||!t.closest('#onl,.onl80pop')||t.closest('.pf83pop'))return;
  const v=t.dataset&&t.dataset.v;const own=ONL.domus&&(v===ONL.domus.id||String(t.textContent||'').replace(/TEST/g,'').replace(/^[\s🏛·]+/,'').trim().replace(/^House /i,'')===ONL.domus.name);if(own)return;
  if(t.closest('.dom82-ttl,.dom82-pl'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();onl89Visit(v||String(t.textContent||'').replace(/TEST/g,'').replace(/^[\s🏛·]+/,'').trim())},true);
/* links: #fid=FID-XXXXXX opens that house's visit */
(function(){const m=/[#&]fid=([^&]+)/i.exec(location.hash||'');const fid=m&&ONLC.fidClean(decodeURIComponent(m[1]));if(!fid)return;let n=0;const iv=setInterval(()=>{n++;if(n>120){clearInterval(iv);return}
  const up=document.getElementById('mainMenu');if(!up||typeof onlineOpen!=='function'||document.getElementById('boot')&&getComputedStyle(document.getElementById('boot')).display!=='none')return;clearInterval(iv);
  try{localStorage.setItem('flavius_online77','1')}catch(e){}if(typeof menuHide==='function')try{menuHide()}catch(e){}onlineOpen('play');
  let k=0;const iv2=setInterval(()=>{k++;if(document.getElementById('onl')&&NET.mode){clearInterval(iv2);onl89Visit({fid})}else if(k>60)clearInterval(iv2)},250)},250)})();

/* ---------------- the controls ---------------- */
function l89Pop(inner){for(const x of document.querySelectorAll('.pop89l'))x.remove();const bg=document.createElement('div');bg.className='veraskbg onl80pop pop89l';
  bg.innerHTML=`<div class="card2 verask pop89lbox" role="dialog" aria-modal="true">${inner}</div>`;bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()});document.body.appendChild(bg);return bg}
function l89Delete(){const D=ONL.domus;const want=D?D.name:((V89L.lan||{}).name||'');
  const b1=l89Pop(`<h3>${_T`🗑 Delete your account?`}</h3><p>${D?_T`House <b>${esc2(D.name)}</b>, its gladiators, their gear, the shelf, your follows and loadouts are gone for good.`:_T('Your account is gone for good.')}</p>
    <p class="rc-sub">${_T`Past results keep your gladiators’ names, without your house.`}</p><div class="acts"><button type="button" class="btn" data-p89="x">${_T`Cancel`}</button><button type="button" class="btn danger" data-p89="go">${_T`Continue…`}</button></div>`);
  b1.addEventListener('click',e=>{const b=e.target.closest('[data-p89]');if(!b)return;if(b.dataset.p89==='x'){b1.remove();return}b1.remove();
    const b2=l89Pop(`<h3>${_T`Are you sure?`}</h3><p>${D?_T`Type your house name <b>${esc2(want)}</b> to delete everything.`:_T`Type your lanista name <b>${esc2(want)}</b> to delete your account.`}</p>
      <input class="tin" id="del89In" autocomplete="off" spellcheck="false" aria-label="${_T`Confirm`}"><p class="onl-err" id="del89Err" hidden></p><div class="acts"><button type="button" class="btn" data-p89="x">${_T`Cancel`}</button><button type="button" class="btn danger" data-p89="del">${_T`🗑 Delete forever`}</button></div>`);
    b2.addEventListener('click',async e2=>{const c=e2.target.closest('[data-p89]');if(!c)return;if(c.dataset.p89==='x'){b2.remove();return}
      const v=(b2.querySelector('#del89In')||{}).value||'';try{await NET.req('acct.delete',{confirm:v})}catch(err){const er=b2.querySelector('#del89Err');if(er){er.hidden=false;er.textContent=errText92(err)}return}
      b2.remove();onlToast80(_T('🗑 Your account is deleted.'));V89L.lan=null;V89L.need=false;V89L.visit=null;ONL.tab='play';ONL.domus=null;ONL.chars=[];ONL.char=null;
      const so=document.querySelector('#onl [data-onl="signout"]');if(so)so.click();else{ONL.acct=null;if(document.getElementById('onl'))onlRedraw()}})})}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#onl')||!t.dataset||!t.dataset.l89p)return;const k=t.dataset.l89p;
  const d=k==='hide'?{hide:!t.checked}:{inv:t.value};onlDo(async()=>{const r=await NET.req('acct.priv',d);if(V89L.lan)V89L.lan.priv=r.priv;onlToast80(_T('🔒 Saved.'))})});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='ln89Name')V89L.draft=t.value;if(t&&t.id==='fd89In')V89L.find=t.value});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const t=e.target;if(!t||!t.id)return;const a={ln89Name:'take',fd89In:'find',ln89Ren:'rename',fi89In:'finv'}[t.id];if(!a)return;
  const b=t.parentElement&&t.parentElement.querySelector(`[data-l89="${a}"]`);if(b){e.preventDefault();b.click()}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-l89]');if(!b||!b.closest('#onl,.onl80pop'))return;e.preventDefault();e.stopPropagation();const a=b.dataset.l89,v=b.dataset.v;
  if(a==='dice'){V89L.draft=roman89();const i=document.getElementById('ln89Name');if(i)i.value=V89L.draft;return}
  if(a==='take'||a==='rename'){const i=document.getElementById(a==='take'?'ln89Name':'ln89Ren');const name=(i&&i.value)||'';V89L.err='';
    return onlDo(async()=>{try{const r=await NET.req('lanista.name',{name});V89L.lan={...(V89L.lan||{}),...r.lan};V89L.need=false;if(ONL.acct)ONL.acct.name=r.lan.name;onlToast80(_T`📜 You are ${esc2(r.lan.name)}.`)}catch(err){V89L.err=errText92(err)}onlRedraw()})}
  if(a==='copy'){l89Copy(v).then(ok=>{b.textContent=ok?'✓':'📋';onlToast80(ok?_T`📋 ${esc2(v)} copied.`:esc2(v))});return}
  if(a==='find'){const i=b.parentElement&&b.parentElement.querySelector('input');const s=(i&&i.value)||V89L.find;V89L.find=s;if(!ONLC.fidClean(s)){V89L.findErr=_T('No house with that FID.');onlRedraw();return}return onl89Visit({fid:s})}
  if(a==='ffollow'){const i=b.parentElement&&b.parentElement.querySelector('input');const s=(i&&i.value)||V89L.find;V89L.findErr='';
    return onlDo(async()=>{try{const r=await NET.req('domus.follow',{fid:s,on:true});ONL83U.follows=r.follows||ONL83U.follows;onlToast80(_T('★ Following.'))}catch(err){V89L.findErr=err.code==='no_fid'?_T('No house with that FID.'):errText92(err)}onlRedraw()})}
  if(a==='finv'){const i=document.getElementById('fi89In');const s=(i&&i.value)||'';if(!ONLC.fidClean(s)){onlToast80(_T('⚠ No lanista with that FID.'));return}
    return onlDo(async()=>{await NET.req('lobby.invite',{id:v,to:ONLC.fidShow(ONLC.fidClean(s))});onlToast80(_T('✉ Invitation sent.'));if(i)i.value=''})}
  if(a==='del')return l89Delete();
  if(a==='pvisit'){for(const p of document.querySelectorAll('.pf83pop'))p.remove();return onl89Visit(v)}
  const r=V89L.visit;if(!r)return;
  if(a==='vback'){V89L.visit=null;ONL.tab=ONL.acct&&!l89Guest()&&ONL.domus?V89L.back:'play';onlRedraw();return}
  if(a==='vsel'){V89L.vSel=v;onlRedraw();return}
  if(a==='vtro'){l89Pop(`<h3>${_T`🏆 Trophies`}</h3>${typeof onl83Trophies==='function'?onl83Trophies((r.domus||{}).trophies,_T('No trophies yet.')):''}<div class="acts"><button type="button" class="btn" onclick="this.closest('.pop89l').remove()">${_T`Close`}</button></div>`);return}
  if(a==='vfollow')return onlDo(async()=>{const on=b.dataset.on==='1';const x=await ONL83.follow(r.domus.id,on);ONL83U.follows=x.follows||[];r.following=on;onlRedraw()});
  if(a==='vinv'){const L=onlMyLobby();if(!L||!r.acct)return;return onlDo(async()=>{await NET.req('lobby.invite',{id:L.id,to:r.acct});onlToast80(_T('✉ Invitation sent.'));b.disabled=true;b.textContent=_T('✉ Sent')})}},true);
/* leaving the visit: any rail tab */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-onl="tab"]');if(b&&b.dataset.v!=='visit')V89L.visit=null},true);

{const st=document.createElement('style');st.textContent=`
#onl .ln89-step{display:flex;gap:14px;align-items:flex-start;margin-bottom:12px}#onl .ln89-step .tin{flex:1;min-width:0;font-size:16px}
#onl .pr89{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:12px;align-items:start}
#onl .pr89-s{display:grid;gap:8px;padding:14px}#onl .pr89-s h3{margin:0;font-size:16px}#onl .pr89-name b{font:700 22px/1.2 var(--display,Georgia),serif;color:var(--gold,#e8c96a)}#onl .pr89-name small{display:block}
#onl .pr89 .dom82-row,.fi89,.fd89l .dom82-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}#onl .pr89 .dom82-row .tin,#onl .fd89l .tin,#onl .fi89 .tin{flex:1 1 140px;min-width:0}
#onl .pr89-ck{display:flex;gap:8px;align-items:center}#onl .pr89-inv{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center}#onl .pr89-inv small{width:100%;color:var(--muted)}
.fid89{justify-self:start;display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 8px;border:1px solid var(--line,#4a3a28);border-radius:8px;background:rgba(0,0,0,.18);white-space:nowrap}
.fid89 small{color:var(--muted)}.fid89 b{font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em}
#onl .btn.danger,.pop89l .btn.danger{border-color:#b33a2a;color:#ffb3a6}#onl .btn.danger:hover,.pop89l .btn.danger:hover{background:rgba(179,58,42,.25)}
#onl .fd89l{display:grid;gap:4px;margin-top:8px}#onl .fl83 .fd89l{border-top:1px solid var(--line,#4a3a28);padding-top:8px}
/* the landing's followed card: one compact row under the list (the narrow column stretched the whole landing) */
#onl .fl83 .fd89l{flex:1 0 100%;width:100%;margin-top:6px;padding-top:6px}#onl .fl83:not(:has(.fl83-r))>p{display:none}#onl .fl83:not(:has(.fl83-r)) .fd89l{flex:1 1 auto;width:auto;margin:0;padding:0;border:0}#onl .fl83 .fd89l label{display:none}#onl .fl83 .fd89l .dom82-row{flex-wrap:nowrap}#onl .fl83 .fd89l .tin{flex:1 1 auto;min-width:0;padding:3px 6px;font-size:12px}#onl .fl83 .fd89l .btn{padding:3px 7px;white-space:nowrap}
#onl .ln89f,#onl .ln89r{color:var(--muted);font-size:12px;margin-left:6px}#onl .r80-who .ln89r{display:block;margin:0}#onl .fi89{margin:6px 0}
#onl .vs89{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;padding:8px 12px;margin-bottom:10px;border:1px solid var(--hc2,#d6ab4c);border-radius:10px;background:linear-gradient(90deg,color-mix(in srgb,var(--hc1,#7a2230) 40%,transparent),transparent)}
#onl .vs89-t small{color:var(--muted)}#onl .vs89-a{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#onl .vs89sc{grid-template-columns:auto auto 1fr}
.pop89l .tin{width:100%;box-sizing:border-box;margin:6px 0}.pop89lbox{max-width:min(440px,94vw)}
@media(max-width:600px){#onl .ln89-step{flex-direction:column}#onl .vs89{padding:6px 8px}#onl .vs89sc{grid-template-columns:1fr}#onl .pr89-s{padding:10px}}`;document.head.appendChild(st)}
