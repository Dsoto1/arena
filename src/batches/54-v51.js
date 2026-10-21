/* =====================================================================
   54-V51 · THE VERSION ON THE MENU, SAVES THAT UPGRADE, THE FIGHTER'S PANEL, THE LOG ON THE SAND
   ===================================================================== */
/* v1.08c: GAME_VER stays NUMERIC (saves, resume, replays, SAVE_MIGRATIONS — a rollback never meets a letter);
   GAME_VERL = the full badge version WITH its letter ('1.08b'), for display + the update notice + the recorder. */
const GAME_VERL=(()=>{const m=/v(\d+\.\d+[a-z]?)(?![a-z0-9])/.exec(((document.querySelector('.brand .ed')||{}).textContent)||'');return m?m[1]:'0.51'})();
const GAME_VER=(()=>{const m=/^(\d+\.\d+)/.exec(GAME_VERL);return m?m[1]:'0.51'})();
/* '1.08b' -> [[1,8],'b']; order 1.08 < 1.08a < 1.08b < 1.09 < 1.10 (a letter only breaks a numeric tie; no letter < any letter) */
const verParse=v=>{const m=/^(\d+(?:\.\d+)*)([a-z]?)/.exec(String(v||'0'));return m?[m[1].split('.').map(Number),m[2]]:[[0],'']};
const verCmp=(a,b)=>{const [A,la]=verParse(a),[B,lb]=verParse(b);for(let i=0;i<Math.max(A.length,B.length);i++){const d=(A[i]||0)-(B[i]||0);if(d)return d<0?-1:1}return la===lb?0:(la<lb?-1:1)};

/* ---------- the version button lives on the main menu (click it to speak a word of power) ---------- */
function mmVerInstall(){const f=document.querySelector('#mainMenu .mmfoot');if(!f||f.querySelector('.mmver'))return;f.innerHTML=`${_T`© 2026 Flavius Rule ·`} <button type="button" class="mmlink" data-proto title="${_T`The prototype this game was distilled from`}">D.Soto</button> · <button type="button" class="mmver" title="${_T`Version — click for what is new`}">v${GAME_VERL}</button>`}
setTimeout(mmVerInstall,60);setTimeout(mmVerInstall,700);
document.addEventListener('click',e=>{const b=e.target.closest('.mmver');if(!b)return;e.preventDefault();e.stopPropagation();if(typeof verNotes79==='function')verNotes79();else if(typeof cheatPrompt==='function')cheatPrompt()},true);
{const _mq=typeof mmQuiet==='function'?mmQuiet:null;if(_mq)mmQuiet=function(){_mq();mmVerInstall()}}

/* ---------- tooltips: no loading bar, no lock — a tooltip simply stays while the pointer is on it ---------- */
{const _to=ttOpen;ttOpen=function(a){_to(a);const T=TT.stack[TT.stack.length-1];if(T){T.locked=true;clearTimeout(TT.lockT)}}}

/* ---------- a fist needs an empty hand: two weapons held, no punching ---------- */
{const _as=attackSources;attackSources=function(p){const out=_as(p);try{if(p&&p.wR&&p.wL)return out.filter(s=>!(s.w&&s.w.punch))}catch(e){}return out}}

/* ---------- the tab goes to the background: the music and effects pause instead of stuttering ---------- */
document.addEventListener('visibilitychange',()=>{try{if(typeof AUD==='undefined'||!AUD.ctx)return;if(document.hidden){AUD.bgPaused=AUD.ctx.state==='running';if(AUD.bgPaused)AUD.ctx.suspend()}
  else if(AUD.bgPaused){AUD.bgPaused=false;AUD.ctx.resume().then(()=>{AUD.next=AUD.ctx.currentTime+0.1}).catch(()=>{})}}catch(e){}});

/* =====================================================================
   SAVES THAT UPGRADE: every save now carries the version that wrote it. Opening an older one asks first, then
   carries it forward (careers through the migrations; matches and backups load as they are, tagged anew).
   ===================================================================== */
const SAVE_MIGRATIONS=[
  ['0.48',w=>{for(const g of w.glads||[])if(g.purse==null)g.purse=3+Math.floor(Math.random()*13)}],
  ['0.49',w=>{if(w.founded==null)w.founded=-99; /* an older career is not a newcomer */}],
  ['0.50',w=>{w.offers=(w.offers||[]).filter(o=>o&&o.mid&&o.gid)}],
  ['0.51',w=>{for(const m of w.mgrs||[])if(m.hygSeason==null)m.hygSeason=0}]];
function migrateWorld(w){const from=w.ver||'0.0';for(const [v,fn] of SAVE_MIGRATIONS)if(verCmp(from,v)<0)try{fn(w)}catch(e){console.error(e)}w.ver=GAME_VER;return w}
{const _sw=saveWorld;saveWorld=function(now){try{const w=W_();if(w&&!w.tutorial){if(verCmp(w.ver,GAME_VER)<0)migrateWorld(w);w.ver=GAME_VER}}catch(e){}return _sw(now)}}
{const _ms=matchSnapshot;matchSnapshot=function(n){const s=_ms(n);s.v=GAME_VER;return s}}
{const _sa=snapshotAll;snapshotAll=async function(){const s=await _sa();s.v=GAME_VER;return s}}
const verOf=d=>{if(!d)return null;if(d.game==='flavius-rule'||d.game==='flavius-match')return d.v||null;if(typeof d.world==='string'){try{return JSON.parse(d.world).ver||null}catch(e){return null}}return d.ver||null};
const verLabel=v=>v?'v'+v:_T('an earlier version');
/* an inline question, right where the player clicked (works inside any open window) */
function verAsk(anchor,v){return new Promise(res=>{const old=document.querySelector('.verask');if(old)old.remove();const bar=document.createElement('div');bar.className='card2 verask';
  bar.innerHTML=`${_T`<b>⬆ This save is from ${esc(verLabel(v))}.</b>`}<div class="rc-sub" style="margin:2px 0 6px">${_T`It will be upgraded to v${GAME_VER} as it loads: fields newer versions need are filled in (fighters’ purses, season records) and broken offers are dropped. Your record, roster and treasury stay as they are.`}</div><div class="acts"><button type="button" class="btn primary" data-verask="yes">${_T`Upgrade and load`}</button><button type="button" class="btn" data-verask="no">${_T`Cancel`}</button></div>`;
  (anchor&&anchor.parentElement?anchor.closest('.lrow,.item,.acts,label,div')||anchor:document.getElementById('mBody')||document.body).after(bar);bar.scrollIntoView({block:'nearest'});
  bar.addEventListener('click',e=>{const b=e.target.closest('[data-verask]');if(!b)return;e.stopPropagation();bar.remove();res(b.dataset.verask==='yes')})})}
/* a career loaded from the list */
document.addEventListener('click',async e=>{const b=e.target.closest('[data-mg="load"]');if(!b||b.dataset.verOk)return;const d=(typeof MGR!=='undefined'&&MGR.careers||[]).find(c=>c.id===b.dataset.id);if(!d)return;const v=verOf(d);
  if(v&&verCmp(v,GAME_VER)>=0)return;e.stopPropagation();e.preventDefault();if(!(await verAsk(b,v)))return;try{const w=migrateWorld(JSON.parse(d.world));d.world=JSON.stringify(w);await Store.put('mgrCareers',d.id,d)}catch(err){console.error(err)}
  b.dataset.verOk='1';b.click()},true);
/* a Play now match from the slots */
document.addEventListener('click',async e=>{const b=e.target.closest('[data-mload]');if(!b||b.dataset.verOk)return;const sv=matchSlotGet(b.dataset.mload);if(!sv)return;const v=verOf(sv);if(v&&verCmp(v,GAME_VER)>=0)return;
  e.stopPropagation();e.preventDefault();if(!(await verAsk(b,v)))return;sv.v=GAME_VER;matchSlotPut(b.dataset.mload,sv);b.dataset.verOk='1';b.click()},true);
/* an uploaded file */
{const _su=saveUpload;saveUpload=async function(file){let d=null;try{d=JSON.parse(await file.text())}catch(e){return _su(file)}const v=verOf(d);
  if(d&&(d.game==='flavius-match'||typeof d.world==='string')&&!(v&&verCmp(v,GAME_VER)>=0)){if(!(await verAsk(document.querySelector('.upsave'),v)))return false;
    if(typeof d.world==='string'){try{d.world=JSON.stringify(migrateWorld(JSON.parse(d.world)))}catch(e){}}else d.v=GAME_VER;
    return _su(new File([JSON.stringify(d)],file.name||'save.json'))}
  return _su(new File([JSON.stringify(d)],file.name||'save.json'))}}
/* a whole-game backup: the restore bar says what it will do, and the careers inside are carried forward */
{const _ls=loadSnapshot;loadSnapshot=async function(snap){try{if(snap&&snap.cols&&verCmp(snap.v,GAME_VER)<0){for(const d of snap.cols.mgrCareers||[])if(typeof d.world==='string'){try{d.world=JSON.stringify(migrateWorld(JSON.parse(d.world)))}catch(e){}}snap.v=GAME_VER}}catch(e){console.error(e)}return _ls(snap)}}
new MutationObserver(()=>{const bar=document.querySelector('.restoreask:not([data-vdone])');if(!bar)return;bar.dataset.vdone='1';const nm=/Restore “([^”]*)”/.exec(bar.textContent);
  const inp=document.getElementById('saveFile');/* the version is read from the file the bar was built for */
  const tag=document.createElement('div');tag.className='rc-sub';tag.style.margin='0 0 6px';tag.textContent=_T`Saves from older versions are upgraded to v${GAME_VER} as they are restored.`;const acts=bar.querySelector('.acts');if(acts)acts.before(tag)}).observe(document.body,{childList:true,subtree:true});

/* =====================================================================
   THE FIGHTER'S PANEL: it stays on YOUR gladiator. Click an opponent's card under "Fighting in this event" to
   look at them in the same panel; click your own card (or ↩) to come back. At a hot seat, each human's turn
   brings their own gladiator up. Coin, CF and trophies explain themselves on hover.
   ===================================================================== */
function boardHome(p){if(!S||!S.players)return p;const humans=S.players.filter(q=>!q.cpu);if(!humans.length)return p;
  if(S.hotseat){if(p&&!p.cpu)return p;const last=S.players.find(q=>q.pid&&q.pid===S.hsActive);return last||humans[0]}
  return humans.find(q=>q.alive&&!q.exited)||humans[0]}
function boardShown(p){if(S.boardPid!=null&&S.players[S.boardPid])return S.players[S.boardPid];return boardHome(p)}
{const _bt=beginTurn;beginTurn=async function(){try{const p=cur();if(S&&S.hotseat&&p&&!p.cpu)S.boardPid=null}catch(e){}return _bt.apply(this,arguments)}}
function trophyTip(p){const g=p.trophies.filter(t=>t.pk==='player'),b=p.trophies.filter(t=>t.pk!=='player');const row=t=>`${esc(t.name)} · R${t.round}${t.cf?_T` · +${t.cf} CF`:''}${t.coin?_T` · +${t.coin} coin`:''}`;
  return _T`<b>Trophies · ${p.trophies.length}</b><br>${g.length?`⚔ ${g.map(row).join('<br>⚔ ')}<br>`:''}${b.length?`🐾 ${b.map(row).join('<br>🐾 ')}<br>`:''}${p.trophies.length?'':_T('None yet. ')}Every 3 held by a winner add 5 CF.`}
const W_TIPS={p:_T('Power: damage dealt by each hit'),r:_T('Range in tiles'),ammo:_T('shots left'),throw:_T('can be thrown once, farther and harder'),shield:_T('absorbs damage when you choose to block'),both:_T('attacks twice each turn'),cfw:_T('CF for every hit'),soul:_T('heals you for every hit'),atkUses:_T('uses left before it breaks')};
function weaponTip(w){if(!w)return _T('An empty hand punches for 1 at range 1 — and glances off armor unless you wear a Cestus.');const L=[];
  if(w.lyre)L.push(_T('Plays the lyre: control one beast each Resolve.'));else if(w.noAtk)L.push(_T('Held, not swung: it occupies this hand.'));
  else{if(w.p)L.push(_T`Power ${w.p}: each hit deals ${w.p} damage.`);if(w.r)L.push(_T`Range ${w.r}: reaches ${w.r} tile${w.r===1?'':'s'}${w.r>=3?_T(' — strikes from out of reach'):''}.`)}
  if(w.ammo!=null)L.push(_T`${w.ammoLeft??w.ammo} shot${(w.ammoLeft??w.ammo)===1?'':'s'} left.`);if(w.throw)L.push(_T`Throw: power ${w.throw.p}, range ${w.throw.r} (${w.throwsLeft??w.throw.n} left) — it leaves your hand.`);
  if(w.shield)L.push(_T`Shield: absorbs ${w.absorb} per hit, ${w.usesLeft??w.uses} uses.`);if(w.atkUses)L.push(_T`${w.atkLeft??w.atkUses} uses before it breaks.`);if(w.both)L.push(_T('Strikes twice: can make both of your turn’s attacks.'));
  if(w.cfw)L.push(_T`+${w.cfw} CF for every hit.`);if(w.soul)L.push(_T`Heals ${w.soul} HP for every hit.`);if(w.flav)L.push(_T('A Flavius item: +2 CF if you win.'));return L.join(' ')}
function weaponChips(w){if(!w)return '<span class="wchip">✊ P1</span><span class="wchip">↔ R1</span>';const c=[];if(w.lyre)return '<span class="wchip">🎵 lyre</span>';if(w.noAtk)return '<span class="wchip">✋ held</span>';
  if(w.p)c.push(`<span class="wchip" title="${_T`Power`}">⚔ P${w.p}</span>`);if(w.r)c.push(`<span class="wchip" title="${_T`Range`}">↔ R${w.r}</span>`);if(w.ammo!=null)c.push(`<span class="wchip" title="${_T`Ammo`}">🏹 ${w.ammoLeft??w.ammo}</span>`);
  if(w.throw)c.push(`<span class="wchip" title="${_T`Throw`}">↗ P${w.throw.p}·R${w.throw.r}</span>`);if(w.shield)c.push(`<span class="wchip" title="${_T`Shield`}">🛡 ${w.absorb}×${w.usesLeft??w.uses}</span>`);if(w.atkUses)c.push(`<span class="wchip">⏳ ${w.atkLeft??w.atkUses}</span>`);if(w.cfw)c.push(`<span class="wchip">👑 +${w.cfw}</span>`);if(w.soul)c.push(`<span class="wchip">❤ +${w.soul}</span>`);return c.join('')}
function armsHTML(p){return `<div class="sect">${_T`⚔ Weapons`}</div><div class="warms">${['R','L'].map(a=>{const w=p['w'+a];const alive=armAlive(p,a);const used=alive&&p.armUses[a]>=(w&&w.both?2:1);
    const art=w&&alive?(w.gart?cardHTML(w.gart,'sm'):w.lyre?cardHTML('c:lyre','sm'):cardRef('w:'+w.key)?cardHTML('w:'+w.key,'sm'):''):'';
    return `<div class="warm ${used?'used':''} ${alive?'':'sev'}"><div class="wart">${art||`<span class="wfist">${alive?'✊':'✖'}</span>`}</div><div class="winfo"><span class="whand">${a==='R'?_T('Right hand'):_T('Left hand')}<span class="wrole"> - ${a==='R'?_T('Primary'):_T('Secondary')}</span></span><b>${alive?(w?esc(w.n):_T('Empty hand')):_T('Severed')}</b>
      ${alive?`<div class="wchips">${weaponChips(w)}<span class="qi" data-tip="${esc(weaponTip(w))}">ⓘ</span></div>`:''}${used?_T('<span class="wspent">spent this turn</span>'):''}</div></div>`}).join('')}</div>`}
{const _bh=boardHTML;boardHTML=function(p,interactive){let h=_bh(p,interactive);try{
  h=h.replace(new RegExp('<div class="sect">'+RXE(TX('Weapons'))+'<\\/div>[\\s\\S]*?(?=<div class="sect">'+RXE(TX('Movement'))+')'),armsHTML(p));
  h=h.replace(/<button class="stat" type="button" data-act="trophies"[^>]*>/,m0=>m0.replace(/ title="[^"]*"/,'').replace('<button class="stat"',_T('<button class="stat" data-tip="')+esc(trophyTip(p)).replace(/&lt;br&gt;/g,'<br>').replace(/&lt;(\/?)b&gt;/g,'<$1b>')+'"').replace('Trophies ▸',_T('Trophies ⓘ')));
  h=h.replace(TXHEAD('<span>Trophies ▸</span><b>{0} {1}','<b>'),_T('<span>Trophies ⓘ</span>'));
  h=h.replace('<div class="stat">'+TXHEAD('<span>Keys</span><b>{0} {1}','<b>'),`<div class="stat" data-tip="${_T`<b>Arena keys · ${p.keys}</b><br>Each key opens the chest (a Level 4 weapon) or a tunnel to another tunnel tile. A used key is gone.${weak(p,'noTunnel')?_T('<br>This gladiator cannot use tunnels.'):''}`}">${_T`<span>Keys ⓘ</span>`}`);
  h=h.replace(/<div class="stat" title="([^"]*)">/g,(m0,t)=>`<div class="stat" data-tip="${t.replace(/&#10;|\n/g,'<br>')}">`);
  }catch(e){console.error(e)}
  try{const home=boardHome(cur());if(S&&!S.over&&home&&p!==home&&!home.cpu)h=`<div class="boardback"><span>${_T`Looking at`} <b style="color:${p.color}">${esc(p.name)}</b></span><button type="button" class="btn tksm" data-act="inspect" data-pid="${home.id}">↩ ${esc(home.name)}</button></div>`+h}catch(e){}
  return h}}

/* =====================================================================
   THE LOG ON THE SAND: tucked into the corner, edged in the colour of whoever acted, and pinned or hidden with
   one button (📌 On arena) or the Settings switch "Log on the arena". The full log below records movement too.
   ===================================================================== */
function actorOf(text){if(!S||!S.players)return null;let best=null,bi=1e9;for(const q of S.players){const i=String(text).indexOf(q.name);if(i>=0&&i<bi){bi=i;best=q}}return best}
function tintNames(el){if(!el||!S||!S.players)return;const names=S.players.map(q=>q.name).filter(Boolean).sort((a,b)=>b.length-a.length);if(!names.length)return;
  const re=new RegExp('('+names.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g');
  const W=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(W.nextNode())nodes.push(W.currentNode);
  for(const n of nodes){if(n.parentElement&&n.parentElement.closest('.pname,.tname'))continue;if(!re.test(n.nodeValue)){re.lastIndex=0;continue}re.lastIndex=0;const frag=document.createDocumentFragment();let last=0;n.nodeValue.replace(re,(m,_,i)=>{frag.append(n.nodeValue.slice(last,i));const q=S.players.find(x=>x.name===m);const b=document.createElement('b');b.className='tname';b.style.color=q?q.color:'';b.textContent=m;frag.append(b);last=i+m.length;return m});frag.append(n.nodeValue.slice(last));n.replaceWith(frag)}}
function capFeedSync(){const on=!(typeof SETTINGS!=='undefined'&&SETTINGS.capFeed===false);const cw=document.querySelector('.canvas-wrap');if(cw)cw.classList.toggle('nocap',!on);const b=document.getElementById('btnCapFeed');if(b){b.setAttribute('aria-pressed',String(on));b.classList.toggle('on',on);b.textContent=on?_T('📌 On arena'):_T('📌 Off arena')}}
document.addEventListener('click',e=>{if(!e.target.closest('#btnCapFeed'))return;SETTINGS.capFeed=SETTINGS.capFeed===false;applySettings();capFeedSync()});
{const _ap=applySettings;applySettings=function(){const r=_ap.apply(this,arguments);try{capFeedSync()}catch(e){}return r}}
setTimeout(capFeedSync,200);
{const _cap=caption;caption=function(html){_cap(html);try{const el=document.getElementById('caption');const d=el&&el.firstElementChild;if(!d)return;const q=actorOf(d.textContent)||(S&&S.players&&cur());if(q)d.style.borderLeftColor=q.color;tintNames(d)}catch(e){}}}
{const _lg=log;log=function(html,cls){_lg(html,cls);try{if(HEADLESS)return;const li=document.getElementById('log').firstElementChild;if(li&&cls!=='hd'){const q=actorOf(li.textContent);if(q)li.style.setProperty('--actor',q.color)}}catch(e){}}}
/* movement is logged: where a fighter went and what it cost */
{const _mp=movePlayer;movePlayer=async function(p,path){const r0=p.r,c0=p.c,mv0=p.mv;const out=await _mp(p,path);try{if(!HEADLESS&&S&&!S.sim&&(p.r!==r0||p.c!==c0)){const used=mv0-p.mv;const steps=Math.max(Math.abs(p.r-r0),Math.abs(p.c-c0));
  log(_T`${nm(p)} moves ${steps} tile${steps===1?'':'s'}, ${tl(r0,c0)} → ${tl(p.r,p.c)} (${used} movement${p.mv>0?_T`, ${p.mv} left`:''}).`,'mv')}}catch(e){}return out}}
/* step through: names in their colours, and the phase named */
const PH_NAME={resolve:_T('Resolve'),command:_T('Resolve'),choice:_T('Choice'),action:_T('Action'),end:'End'};
{const _sw=stepWait;stepWait=function(){const pr=_sw();try{const el=document.getElementById('stepBar');if(el){tintNames(el);const hd=el.querySelector('.stepcap .rc-sub');if(hd&&S)hd.insertAdjacentHTML('afterend',` <span class="phtag ph-${S.phase==='command'?'resolve':S.phase}">${PH_NAME[S.phase]||S.phase}</span>`);const p=cur();if(p)el.style.setProperty('--actor',p.color)}}catch(e){}return pr}}
/* the fighter shown in the panel is marked on the roster */
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(!HEADLESS&&S&&S.players){const sh=boardShown(cur());for(const b of document.querySelectorAll('#roster .rc'))b.classList.toggle('shown',!!sh&&+b.dataset.pid===sh.id)}}catch(e){}return r}}

/* =====================================================================
   PHONES: the arena first, full width; everything else in four tabs under it (Actions · Fighter · Gladiators · Log)
   ===================================================================== */
const MOB_TABS=[['act',_T('⚔ Actions')],['fighter',_T('🛡 Fighter')],['glads',_T('👥 Gladiators')],['log',_T('📜 Log')]];
function mobTabsInstall(){if(document.getElementById('mobTabs'))return;const cw=document.querySelector('.arena-col .canvas-wrap');if(!cw)return;const bar=document.createElement('div');bar.id='mobTabs';bar.className='mobtabs';bar.setAttribute('role','tablist');
  bar.innerHTML=MOB_TABS.map(([k,l])=>`<button type="button" role="tab" data-mobtab="${k}">${l}</button>`).join('');cw.after(bar);mobTab(localStorage.getItem('flavius_mobtab')||'act')}
function mobTab(k){document.body.dataset.mtab=k;for(const b of document.querySelectorAll('[data-mobtab]'))b.classList.toggle('on',b.dataset.mobtab===k);try{localStorage.setItem('flavius_mobtab',k)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-mobtab]');if(b)mobTab(b.dataset.mobtab)});
setTimeout(mobTabsInstall,0);
/* a tap on a gladiator's card on a phone shows them on the Fighter tab */
document.addEventListener('click',e=>{const b=e.target.closest('#roster [data-act="inspect"]');if(b&&innerWidth<=700)setTimeout(()=>mobTab('fighter'),30)});
