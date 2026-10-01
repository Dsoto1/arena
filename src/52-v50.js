/* =====================================================================
   52-V50 · LESS NOISE, NESTED TOOLTIPS, HOT-SEAT MANNERS, ZORA, AND THE FIXES
   ===================================================================== */

/* ---------- achievements are never won twice: the device remembers what it has granted, even if the shared
   store answers with an older copy (a replay read the record before the last write had landed) ---------- */
const achLocal=()=>{try{return JSON.parse(localStorage.getItem('flavius_ach_got')||'{}')}catch(e){return {}}};
{const _al=achLoad;achLoad=async function(){const A=await _al();A.got={...achLocal(),...(window.ACH_GOT||{}),...(A.got||{})};A.events=Math.max(A.events||0,+(localStorage.getItem('flavius_ach_ev')||0)||0);return A}}
{const _ag=achGrant;achGrant=async function(A,k){if((window.ACH_GOT||{})[k]||achLocal()[k]){A.got[k]=A.got[k]||achLocal()[k]||window.ACH_GOT[k];return false}const r=await _ag(A,k);try{if(r){const L=achLocal();L[k]=A.got[k];localStorage.setItem('flavius_ach_got',JSON.stringify(L))}}catch(e){}return r}}
{const _ae=achievementsAfterEvent;achievementsAfterEvent=async function(rows,hall){const r=await _ae(rows,hall);try{const A=await achLoad();localStorage.setItem('flavius_ach_ev',String(A.events||0))}catch(e){}return r}}

/* ---------- Zora: the Venatore carries his card; everyone else meets it only if the table asks ----------
   • a Venatore starts holding the Zora card (one per release his ability allows) and plays it on his turn —
     the card IS the release, so the separate button is spent
   • the arena deck carries Zora only when "Zora in the arena deck" is ticked in the setup (off by default) */
{const _ns=newState;newState=function(cfg){const r=_ns(cfg);try{if(S&&S.players){const zoraOpt=!!(cfg&&cfg.opts&&cfg.opts.zoraCard);
  if(Array.isArray(S.deck)&&!zoraOpt)S.deck=S.deck.filter(k=>k!=='zora');
  for(const p of S.players)if(p.abil==='zora'&&!p.noEagle&&!(p.items||[]).some(i=>i.kind==='card'&&i.key==='zora')){const n=Math.max(1,p.abilVal||1);for(let i=0;i<n;i++)p.items.push(mkCard('zora'));p.zoraUsed=n}}}catch(e){console.error(e)}return r}}
{const _oh=optionsHTML;optionsHTML=function(ev,L){const h=_oh(ev,L);try{const o=CFG.opts;if(!ev||!ev.deck||/id="oZora"/.test(h))return h;const box=optBox('oZora','zoraCard',o.zoraCard,'Zora in the arena deck <span class="rc-sub">(anyone can draw him · the Venatore always carries his own)</span>',ev.noVenatore?'This event keeps Zora out':null);
  const out=h.replace(/(<label[^>]*><input type="checkbox" id="oEagle"[\s\S]*?<\/label>)/,`$1${box}`);return out===h?h+box:out}catch(e){return h}}}

/* ---------- the nav drawer: 🏛 stays; New event, sound and settings slide out from the right when asked ---------- */
document.addEventListener('click',e=>{const t=e.target.closest('#navTog');const nr=document.getElementById('navRight');if(!nr)return;
  if(t){const open=!nr.classList.contains('open');nr.classList.toggle('open',open);t.setAttribute('aria-expanded',String(open));return}
  if(nr.classList.contains('open')&&!e.target.closest('#navRight')){nr.classList.remove('open');const tg=document.getElementById('navTog');if(tg)tg.setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const nr=document.getElementById('navRight');if(nr&&nr.classList.contains('open')){nr.classList.remove('open')}}});

/* ---------- multiplayer tables play without hints: everyone at a hot seat knows the game ---------- */
let HS_HINTS_SAVE=null;
{const _ns=newState;newState=function(cfg){if(cfg&&cfg.hotseat){if(HS_HINTS_SAVE==null)HS_HINTS_SAVE=HINTS;HINTS=false}else if(HS_HINTS_SAVE!=null){HINTS=HS_HINTS_SAVE;HS_HINTS_SAVE=null}return _ns(cfg)}}
{const _ms=typeof menuShow==='function'?menuShow:null;if(_ms)menuShow=function(){if(HS_HINTS_SAVE!=null&&(!S||S.over||!S.hotseat)){HINTS=HS_HINTS_SAVE;HS_HINTS_SAVE=null}return _ms.apply(this,arguments)}}

/* ---------- the arena's frame takes on the colour of whoever is acting ---------- */
function turnTint(p){const cw=document.querySelector('.canvas-wrap');if(!cw)return;if(!p||!S||S.over){cw.classList.remove('turntint');return}cw.style.setProperty('--turnc',p.color||'#f0cf7d');cw.classList.add('turntint')}
setInterval(()=>{try{if(HEADLESS)return;if(!S||S.over||S.phase==='setup')turnTint(null)}catch(e){}},1000);

/* ---------- hot seat: what happened while you were away ---------- */
const hsSnap=p=>({hp:Object.values(p.hp||{}).reduce((a,v)=>a+(+v||0),0),ap:Object.values(p.ap||{}).reduce((a,v)=>a+(+v||0),0),cf:Math.round(p.cf||0),coin:p.coin||0,items:(p.items||[]).length,tro:(p.trophies||[]).length,alive:p.alive,log:(S.logLines||[]).length});
function hsAwayHTML(p,a){const b=hsSnap(p);const d=(k,lab,ico,good)=>{const v=b[k]-a[k];if(!v)return '';const up=v>0;return `<span class="awaychip ${up===good?'pos':'neg'}">${ico} ${up?'+':''}${v} ${lab}</span>`};
  const chips=[d('hp','HP','❤',true),d('ap','AP','🛡',true),d('cf','CF','👑',true),d('coin','coin','💰',true),d('items','in hand','🂠',true),d('tro','trophies','🏆',true)].join('');
  const name=String(p.name);const L=(S.logLines||[]).slice(a.log).filter(l=>l.cls!=='hd'&&l.text&&l.text.includes(name)).slice(-6);
  return `<div class="away">${chips?`<div class="awaychips">${chips}</div>`:'<p class="rc-sub" style="margin:0 0 6px">Nothing touched you.</p>'}${L.length?`<ul class="awaylog">${L.map(l=>`<li>${esc(l.text)}</li>`).join('')}</ul>`:''}</div>`}
{const _bt=beginTurn;beginTurn=async function(){try{const p=cur();turnTint(p);
  if(S&&S.hotseat&&!S.over&&!HEADLESS&&!S.sim){S.hsSnaps=S.hsSnaps||{};const prev=S.hsPrevP;if(prev&&prev!==p&&!prev.cpu)S.hsSnaps[prev.id]=hsSnap(prev);S.hsPrevP=p;
    const a=S.hsSnaps[p.id];if(p&&!p.cpu&&a&&S.hotseat.players.length>=2){const P=(typeof HS_PROFILES!=='undefined'&&HS_PROFILES.find(x=>x.id===p.pid))||null;
      await modal(`🎮 ${esc(P?P.name:p.name)} — your turn`,`<p class="rc-sub" style="margin:0 0 6px">Since your last turn</p>${hsAwayHTML(p,a)}`,[{label:'Start my turn',value:1,primary:1}],{close:1})}}}catch(e){console.error(e)}
  return _bt.apply(this,arguments)}}

/* =====================================================================
   TOOLTIPS THAT NEST · THE GLOSSARY · LESS NOISE
   =====================================================================
   One tooltip engine for the whole game (after Crusader Kings III):
   • hover anything with data-tip (plain help) or a glossary term (data-tt) → a tooltip opens beside it
   • keep the pointer on it for a moment and it LOCKS (a gold bar fills, then a 🔒): now you can move into it and
     hover the terms inside, each opening its own tooltip on top — as deep as you like
   • leave a locked tooltip and it (and anything opened from it) closes; Esc closes them all; on touch, a long
     press opens one and a tap elsewhere closes it
   Glossary terms are linked automatically — the first time each appears — in the guides, the rules, the event
   briefing, rule pop-ups and Manager mode. Screens lose their small print: it lives in these tooltips now.
   ===================================================================== */
const GLOSS={
  cf:{t:'Crowd Favor (CF)',re:/\bCF\b|Crowd Favou?r/,d:'Your score with the crowd. Earn it from [[blessings|pots]], beast trophies, kills and your class. At the end: 20+ saves you to the [[ludusf|Ludus Flavius]], 50+ wins freedom, 17–19 faces the [[thumb|Thumb of Flavius]], under 17 the [[fate|Fate table]].'},
  ap:{t:'Armor Points (AP)',re:/\bAP\b/,d:'Armor on each body location, at most 7. A hit strips AP before it reaches [[hp|HP]]. Shields can absorb a hit instead.'},
  hp:{t:'Health (HP)',re:/\bHP\b/,d:'Health on each body location. Lose the head or the chest and you are out; lose an arm or a leg and it is severed.'},
  fate:{t:'The Fate table',re:/Fate table|\bFates\b/,d:'At the end, a gladiator under 17 [[cf|CF]] rolls the d12: Damnatio, the Fatal Charades or worse. In Manager mode, [[blood|blood money]] can buy them back.'},
  thumb:{t:'Thumb of Flavius',re:/Thumb of Flavius/,d:'For 17–19 [[cf|CF]]: a d6 decides. 4–6 spares you; 1–3 the thumb goes down and the [[fate|Fate table]] follows.'},
  ludusf:{t:'Ludus Flavius',re:/Ludus Flavius/,d:'Gladiators who end with 20+ [[cf|CF]] and survive are saved here, and can be summoned into later events.'},
  rudis:{t:'The rudis',re:/\brudis\b/,d:'The wooden sword of freedom. A fighter with enough events and wins can be granted it: freed, or kept for the house.'},
  blessings:{t:'Blessings pots',re:/Blessings pots?|Blessings bag/,d:'Pots on the pillars. Break one (2 damage) for 2 coin, 1 [[cf|CF]] and a hidden offering. Power-2 weapons break them best.'},
  mandati:{t:'Mandati Flavi',re:/Mandati Flavi/,d:'Secret objectives dealt at the start. Each one still hidden at the end costs 5 [[cf|CF]].'},
  aggro:{t:'Aggro',re:/\baggro\b/,d:'The gladiator a beast is hunting: the last one to hit it. Tunnels and the Ward of the Evil Eye shake it off.'},
  raged:{t:'Raged and Fazed',re:/\bRaged\b|\bFazed\b/,d:'Lions, Commodus and Tholo turn Raged as they lose HP (harder hits, faster), then Fazed near death (slow, weak). Finish a Fazed boss before a rival steals the trophy.'},
  truce:{t:'Truce',re:/\btruces?\b/,d:'A pact not to attack. It ends the moment either side strikes.'},
  blood:{t:'Blood money',re:/blood money/,d:'Manager mode: pay the editor to spare a condemned fighter the [[fate|Fate table]]. Small, struggling houses pay half.'},
  fee:{t:'Appearance fee',re:/appearance fee/,d:'Paid to your house for every fighter on the card, win or lose.'},
  morale:{t:'Morale',re:/\bmorale\b/,d:'80+: +1 [[ap|AP]] and +1 [[cf|CF]] on the sand. Under 35: −1 AP. Under 20: the fighter thinks a tier worse.'},
  starters:{t:'Starters and bench',re:/\bstarters\b/,d:'Starters are the fighters you can enter on [[mweek|Match Week]]. The bench trains or goes on loan.'},
  mweek:{t:'Match Week',re:/Match Week/,d:'Flavius’s travelling games: three bouts in one city each week — the Undercard on Friday, the Feature on Saturday, the Main event on Sunday.'},
  superbus:{t:'The Flavius Superbus',re:/Superbus/,d:'The season’s championship in Roma for the top four houses. The awards, the recap paper and the [[ledger|Quaestor’s Ledger]] follow it.'},
  ledger:{t:'The Quaestor’s Ledger',re:/Quaestor[’']s Ledger/,d:'The season’s pay to every house: a stipend, tax returns, bounties, [[fame]] and league finish. Thriving houses get no stipend.'},
  fame:{t:'Fame',re:/\bfame\b/,d:'How known your house is. It opens doors to recruits and drifts back toward 35 at every season’s close.'},
  omen:{t:'The omen',re:/\bomen\b/,d:'The week’s sign from the gods: it sways attendance, purses and moods.'},
  zora:{t:'Zora',re:/\bZora\b/,d:'The Venatore’s tamed golden eagle: moves 6, carries items and attacks for him. The Venatore carries his card; others meet it only if the arena deck includes it.'},
  hygeia:{t:'Hygeia’s Blessing',re:/Hygeia[’']s Blessing/,d:'Once a season, every house can heal its whole roster for free.'},
  thriving:{t:'Thriving house',re:/\bthriving\b/,d:'350+ coin, or fame 55+ with 150+ coin. A thriving house gets no loans, cart, paid road or stipend.'}};
const glossMark=s=>String(s).replace(/\[\[(\w+)(?:\|([^\]]+))?\]\]/g,(m,k,l)=>`<span class="gl" data-tt="${k}">${l||(GLOSS[k]?GLOSS[k].t:k)}</span>`);
const TT={stack:[],hideT:null,openT:null,lockT:null};
function ttHTML(a){if(a.dataset.tt&&GLOSS[a.dataset.tt]){const G=GLOSS[a.dataset.tt];return `<div class="ttt">${esc(G.t)}</div><div class="ttd">${glossMark(G.d)}</div>`}
  const h=a.dataset.tip||'';return `<div class="ttd">${glossMark(h)}</div>`}
function ttPlace(el,a){const r=a.getBoundingClientRect();el.style.left='0px';el.style.top='0px';const w=el.offsetWidth,h=el.offsetHeight;let x=r.left,y=r.bottom+8;
  if(x+w>innerWidth-8)x=Math.max(8,innerWidth-w-8);if(y+h>innerHeight-8)y=Math.max(8,r.top-h-8);el.style.left=x+'px';el.style.top=y+'px'}
function ttOpen(a){const lvl=TT.stack.findIndex(t=>t.el.contains(a))+1; /* a term inside tooltip k opens at level k+1 */
  ttClose(lvl);const el=document.createElement('div');el.className='tt';el.setAttribute('role','tooltip');el.innerHTML=ttHTML(a)+'<div class="ttlock"><i></i></div>';document.body.appendChild(el);ttPlace(el,a);
  const T={el,a,locked:false};TT.stack.push(T);a.classList.add('tton');
  clearTimeout(TT.lockT);TT.lockT=setTimeout(()=>{if(TT.stack.includes(T)){T.locked=true;el.classList.add('locked')}},900);
  el.addEventListener('mouseenter',()=>{clearTimeout(TT.hideT)});el.addEventListener('mouseleave',e=>ttLeave(e))}
function ttClose(from=0){while(TT.stack.length>from){const T=TT.stack.pop();T.a.classList.remove('tton');T.el.remove()}}
function ttLeave(e){clearTimeout(TT.hideT);TT.hideT=setTimeout(()=>{const hov=document.querySelectorAll(':hover');const last=hov[hov.length-1];
  let keep=0;for(let i=0;i<TT.stack.length;i++){const T=TT.stack[i];if(last&&(T.el.contains(last)||T.a.contains(last)))keep=i+1;else if(T.locked&&i<keep)keep=i+1}
  /* a locked tooltip stays while the pointer is inside it or any tooltip opened from it */
  if(last){for(let i=TT.stack.length-1;i>=0;i--){if(TT.stack[i].el.contains(last)){keep=Math.max(keep,i+1);break}}}
  ttClose(keep)},TT.stack.some(t=>t.locked)?320:140)}
document.addEventListener('mouseover',e=>{const a=e.target.closest&&e.target.closest('[data-tt],[data-tip]');if(!a||HEADLESS)return;if(TT.stack.some(t=>t.a===a))return clearTimeout(TT.hideT);
  clearTimeout(TT.openT);const inside=TT.stack.some(t=>t.el.contains(a));TT.openT=setTimeout(()=>{if(a.matches(':hover'))ttOpen(a)},inside?120:260)});
document.addEventListener('mouseout',e=>{const a=e.target.closest&&e.target.closest('[data-tt],[data-tip]');if(!a)return;clearTimeout(TT.openT);if(TT.stack.length)ttLeave(e)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&TT.stack.length){ttClose(0);e.stopPropagation()}},true);
document.addEventListener('focusin',e=>{const a=e.target.closest&&e.target.closest('[data-tip]');if(a&&!HEADLESS&&!TT.stack.some(t=>t.a===a))ttOpen(a)});
document.addEventListener('focusout',()=>{if(TT.stack.length&&!TT.stack.some(t=>t.locked))ttClose(0)});
{let lp=null;document.addEventListener('touchstart',e=>{const a=e.target.closest&&e.target.closest('[data-tt],[data-tip]');if(!a){if(TT.stack.length&&!TT.stack.some(t=>t.el.contains(e.target)))ttClose(0);return}clearTimeout(lp);lp=setTimeout(()=>{ttOpen(a);const T=TT.stack[TT.stack.length-1];if(T){T.locked=true;T.el.classList.add('locked')}},450)},{passive:true});
 document.addEventListener('touchend',()=>clearTimeout(lp),{passive:true});document.addEventListener('touchmove',()=>clearTimeout(lp),{passive:true})}
window.addEventListener('scroll',()=>{if(TT.stack.length&&!TT.stack.some(t=>t.locked))ttClose(0)},true);

/* the glossary finds its own terms: the first appearance of each in a container is linked */
const GL_SKIP='a,button,select,option,input,textarea,code,.gl,.tt,svg,canvas,script,style,h1,h2,h3,h4,h5,summary,th,.sect,.ph,.phead,[data-tip],[data-tt],[data-card],.btn,.seg,.nogl,label,.badge,.rail,.mtabs';
function glossLink(root){if(!root||root.dataset.glDone)return;root.dataset.glDone='1';const seen=new Set();const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest(GL_SKIP)||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
  const nodes=[];while(W.nextNode())nodes.push(W.currentNode);
  for(let node of nodes){for(const [k,G] of Object.entries(GLOSS)){if(seen.has(k))continue;const m=G.re.exec(node.nodeValue);if(!m)continue;seen.add(k);
    const after=node.splitText(m.index);const rest=after.splitText(m[0].length);const sp=document.createElement('span');sp.className='gl';sp.dataset.tt=k;sp.textContent=after.nodeValue;after.replaceWith(sp);node=rest}}}
const GL_ROOTS=['#rulTab-guide','#rulTab-mguide','#rulTab-build','.rulepop','#mgrPane','.brief'];
/* the small print moves into tooltips: settings hints, the setup's seat notes, long button subtitles */
function quietHints(root){for(const h of root.querySelectorAll('.hint:not([data-keep])')){if(h.closest('.tt,.welc,details'))continue;const host=h.closest('label,.setrow')||h.parentElement;if(!host||host.dataset.quiet)continue;
    const txt=h.innerHTML.replace(/^\s*[—–-]\s*/,'').trim();if(!txt)continue;host.dataset.tip=(host.dataset.tip?host.dataset.tip+' ':'')+txt;h.remove();const b=host.querySelector('b');if(b&&!b.querySelector('.qi'))b.insertAdjacentHTML('beforeend',' <span class="qi" aria-hidden="true">ⓘ</span>');host.dataset.quiet='1'}}
function quietButtons(root,min=34){for(const b of root.querySelectorAll('.btn small')){const t=b.textContent.trim();if(t.length<min)continue;const btn=b.closest('.btn');if(!btn||btn.dataset.tip)continue;
    const parts=t.split(' · ');const keep=parts.filter(x=>/^(\d+\s?h|\d+\s?coin|free|🔒|\d+\s?wk|\d+\/wk)/.test(x.trim()));const rest=parts.filter(x=>!keep.includes(x));
    btn.dataset.tip=esc(rest.join(' · ')||t);if(keep.length)b.textContent=keep.join(' · ');else b.remove()}}
function quietSeats(root){for(const ab of root.querySelectorAll('.seat .ab')){if(ab.dataset.quiet)continue;ab.dataset.quiet='1';const card=ab.querySelector('[data-card]');const txt=ab.textContent.replace(card?card.textContent:'','').replace(/^\s*·\s*/,'').trim();
    ab.innerHTML='';if(card)ab.appendChild(card);if(txt){const i=document.createElement('span');i.className='qi';i.dataset.tip=esc(txt);i.textContent=' ⓘ';ab.appendChild(i)}}
  for(const n of root.querySelectorAll('.seat span,.seat small')){if(!n.children.length&&/^\(?active roster\)?$/.test(n.textContent.trim()))n.remove()}}
let GL_T=null;const glObs=new MutationObserver(()=>{clearTimeout(GL_T);GL_T=setTimeout(glSweep,90)});
function glSweep(){try{{const i=TT.stack.findIndex(t=>!t.a.isConnected);if(i>=0)ttClose(i)}for(const sel of GL_ROOTS)for(const el of document.querySelectorAll(sel))glossLink(el);
  const mb=document.getElementById('mBody');const title=(document.getElementById('mTitle')||{}).textContent||'';
  if(mb&&/^Settings/.test(title))quietHints(mb);
  if(mb&&/Choose the arena/.test(title)){quietSeats(mb);quietHints(mb);quietButtons(mb,6)}
  const mp=document.getElementById('mgrPane');if(mp&&typeof MGR!=='undefined'&&(MGR.tab==='ludus'||MGR.tab==='night'))quietButtons(mp)}catch(e){console.error(e)}}
if(!HEADLESS)glObs.observe(document.body,{childList:true,subtree:true});

/* ---------- the main menu: names only; what each one does is a hover away ---------- */
const MM_NAMES={learn:'🎓 Learn to Play',learnmgr:'💼 Learn Manager Mode',play:'⚔️ Play Now',multi:'👥 Multiplayer',manager:'💼 Manager Mode',studio:'🎨 Creator Studio',annals:'🏛️ The Annals',rules:'📜 Rules & Strategy',settings:'⚙️ Settings',hotseat:'🪑 Hot Seat',lan:'🖧 LAN',online:'🌐 Online'};
function mmQuiet(){const box=document.querySelector('#mainMenu .mmbtns');if(!box)return;for(const b of box.querySelectorAll('[data-mm]')){if(b.dataset.quietDone)continue;const sm=b.querySelector('small');const tip=sm?sm.textContent.trim():'';
    if(MM_NAMES[b.dataset.mm]){b.textContent=MM_NAMES[b.dataset.mm]}else if(sm)sm.remove();if(tip)b.dataset.tip=esc(tip.charAt(0).toUpperCase()+tip.slice(1));b.dataset.quietDone='1'}
  const f=document.querySelector('#mainMenu .mmfoot');if(f)f.innerHTML='© 2026 Flavius Rule · <button type="button" class="mmlink" data-proto title="The prototype this game was distilled from">D.Soto</button>'}
setTimeout(mmQuiet,30);setTimeout(mmQuiet,600);

/* ---------- the setup: the options fold away, the calendar is one line ---------- */
{const _oh=optionsHTML;optionsHTML=function(ev,L){let h=_oh(ev,L);try{const o=CFG.opts;const on=[o.mods,o.mandata,o.carmina,o.optOffers,o.eaglePot,o.zoraCard].filter(Boolean).length;
  h=h.replace('<h4>Options</h4><div class="opts">',`<details class="optfold" ${CFG.optOpen?'open':''}><summary><b>⚙ Options</b> <span class="rc-sub">${on} on</span></summary><div class="opts">`);
  h=h.replace(/<p style="font-size:13px;color:var\(--muted\);margin-top:6px">([\s\S]*?)<\/p>\s*$/,(m0,t)=>`<p class="rc-sub" style="margin-top:6px"><span class="qi" data-tip="${esc(t.replace(/<[^>]+>/g,''))}">ⓘ How the Blessings bag works</span></p></details>`);
  if(!/<\/details>\s*$/.test(h))h+='</details>'}catch(e){}return h}}
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('optfold'))CFG.optOpen=e.target.open},true);
{const _sb=setupBody;setupBody=function(){let h=_sb();try{
  h=h.replace(/<div class="card2" style="margin-bottom:8px;border-color:[^"]*"><b>📅 ([^<]*)<\/b>[\s\S]*?<\/div>\s*(?=<label style="display:grid;gap:4px;font-size:14px">Event)/,(m0,date)=>{const c=calNow();const L=LOCATIONS[c.fx.loc];const on=c.fx.loc===CFG.loc&&c.fx.ev===CFG.ev;
    return `<div class="calline ${on?'on':''}"><b data-tip="The empire's calendar: each week Flavius's games play in one city. Follow the schedule to fight where the empire is watching — or play anywhere; the empire won't mind.">📅 ${date} <span class="qi">ⓘ</span></b> <span class="rc-sub">this week: <b>${esc(L?L.n:'?')}</b> · ${esc((EVENTS[c.fx.ev]||{}).short||(EVENTS[c.fx.ev]||{}).n||'')}</span>${on?'<span class="badge gold">on schedule</span>':'<button type="button" class="btn tksm" data-calgo="1">Follow</button>'}</div>`});
  h=h.replace(/<span>City <span class="rc-sub" style="font-size:12px">· or click a city on the map<\/span><\/span>/,'<span>City</span>');
  h=h.replace(/Class modifiers \(applied once, before the event\):/,'<span data-tip="Each city favours some classes and hinders others — applied once, before the event.">Class modifiers <span class="qi">ⓘ</span></span>');
  }catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-calgo]');if(!b)return;const c=calNow();const f=[...document.querySelectorAll('#mBody button')].find(x=>/Follow the schedule/.test(x.textContent));if(f){f.click();return}
  CFG.loc=c.fx.loc;CFG.ev=c.fx.ev;const box=document.getElementById('mBody');if(box){box.innerHTML=setupBody();try{render()}catch(err){}}},true);

/* ---------- Your ludus: the welcome is for the first week; after that it is one click away ---------- */
{const _mh=mgrHTML;mgrHTML=function(){let h=_mh();try{const w=W_();if(w&&!w.dead&&(w.week-(w.founded||1))>=1){h=h.replace(/<div class="revbox"><div class="sect" style="margin-top:0">👋 Welcome to ([^<]*)<\/div>([\s\S]*?)<\/div>`?/,(m0,nm,body)=>`<details class="revbox welcfold"><summary>👋 How a week works</summary>${body}</details>`)}}catch(e){}return h}}

/* ---------- the city themes, take two: every one of them trap, and in tune with itself ----------
   • the melody's strong beats land on chord tones (passing notes stay on the off-beats); the bridge the same
   • a dark 7th-chord pad under every bar; the 808 slides only to the NEXT chord's root (never off the key)
   • half-time trap kit for all twelve: 808 + sub, clap on three, 8th hats with 16th and triplet rolls, open hats
   • trap bells answer the melody in the second half of each A section */
for(const k of Object.keys(AUD_GROOVE)){if(AUD_GROOVE[k]==='edm'&&AUD_THEMES[k]&&AUD_THEMES[k].v49&&!AUD_THEMES[k].v50){AUD_THEMES[k].bpm=Math.round(AUD_THEMES[k].bpm/1.18*1.05)}if(AUD_THEMES[k])AUD_THEMES[k].v50=1;AUD_GROOVE[k]='trap'}
function audSnap(m,chord){if(m==null)return m;const opts=[];for(const o of [-7,0,7])for(const t of [0,2,4])opts.push(chord+t+o);return opts.sort((a,b)=>Math.abs(a-m)-Math.abs(b-m))[0]}
{const _th=audTheme;audTheme=function(name){const th=_th(name);try{if(AUD_GROOVE[name]){for(let bar=0;bar<8;bar++){const c=th.prog[bar];const row=th.mel[bar];for(const st of [0,2,4,6])if(row[st]!=null)row[st]=audSnap(row[st],c)}
  if(th.brMel&&th.brProg)for(let bar=0;bar<8;bar++){const c=th.brProg[bar];const row=th.brMel[bar];for(let st=0;st<8;st++)if(row[st]!=null)row[st]=audSnap(row[st],c)}}}catch(e){}return th}}
audGroove=function(th,t,step,inten){if(!AUD_GROOVE[th.name])return;const spb=60/th.bpm/2;const S9=audSect(step);const {bar,st}=S9;const B=S9.kind==='B';const P=B?th.brProg:th.prog;const chord=P[bar];const next=P[(bar+1)%8];const d=AUD.music;
  const root=audMtof(th.deg(chord,-2)),nroot=audMtof(th.deg(next,-2));const lv=0.8+0.1*inten;
  /* the pad: root, third, fifth and seventh, soft and slow */
  if(st===0)for(const k of [0,2,4,6])audNote(d,t,audMtof(th.deg(chord+k,0)),spb*8.3,'sine',k===6?0.012:0.018,{a:0.5,r:0.9,lp:1400,verb:1});
  if(B){if(st===0)audNote(d,t,audMtof(th.deg(chord,-1)),spb*8,'sine',0.05,{a:0.3,r:0.6});
    if(bar>=4){if(st%2===0)audHat(t,0.06*lv)}if(bar>=6){audNoise(d,t+spb/2,0.05,(0.05+0.03*(bar-6))*lv,{f:2300});if(bar===7&&st>=4)for(const k of [0,1,2,3])audNoise(d,t+k*spb/4,0.03,0.1*lv,{f:2500})}
    if(bar===7&&st===0)audRiser(t,spb*8,0.1);return}
  /* the 808: the one, a pickup, and a slide into the next chord */
  if(st===0)aud808(t,root,spb*(bar%2?3.2:5.4),0.3*lv);
  if(st===3&&bar%2===1)aud808(t,root,spb*1.1,0.2*lv);
  if(st===6&&next!==chord)aud808(t,root,spb*2,0.22*lv,nroot);
  /* the kit */
  if(st===4)audClap(t,0.2*lv);if(st===4&&bar%4===3)audClap(t+spb*0.5,0.12*lv);
  audHat(t,0.09*lv);if(st===1||st===5||(st===7&&bar%2))audHat(t+spb/2,0.06*lv);
  if(bar%4===3&&st>=5)for(const k of [1,2])audHat(t+spb*k/3,0.05*lv);if(st===6&&bar%4===1)audHat(t,0.07*lv,true);
  /* trap bells in the answer: the chord broken upward, an octave above the melody */
  if(S9.kind==='A2'&&bar%2===1&&st>=4){const tone=[0,2,4,7][st-4];audNote(d,t,audMtof(th.deg(chord+tone,2)),spb*1.4,'sine',0.028,{a:0.002,r:0.35,verb:1})}};
