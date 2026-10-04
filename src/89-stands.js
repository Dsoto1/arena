/* 89-stands (v0.68) — one home for the stands during an event.
   • The right column gets tabs: Fighter (the player panel) · Field (the four fighter cards, beasts & cards in play) ·
     Stands (the arena's chronicle, the crowd, the stands log and the spectator roster at full height).
     SIDE.tab is remembered in localStorage flavius_sidetab; inspecting a fighter jumps back to Fighter.
   • A one-line crowd ticker under the board shows the newest stands-log line; a click opens the Stands tab.
   • The top-bar 🐾 Menagerie button becomes 🏟 Stands · N (opens the tab). The Menagerie is now the 📖 Bestiary only
     (lore and ledgers): B key, a button in the Field tab, and a button in Rules & strategy.
   • The old slide-over Stands drawer (12) never opens: its content lives in the Stands tab. */
const SIDE={tab:'fighter'};try{const t=localStorage.getItem('flavius_sidetab');if(['fighter','field','stands'].includes(t))SIDE.tab=t}catch(e){}
const sideLive=()=>!!(S&&S.phase!=='setup');
const standsCount=()=>S&&S.spect?S.spect.filter(s=>!s.gone).length:0;
function sideTabsEnsure(){const side=document.querySelector('aside.side');if(!side)return null;let bar=document.getElementById('sideTabs');
  if(!bar){bar=document.createElement('div');bar.id='sideTabs';bar.className='seg sidetabs';bar.setAttribute('role','tablist');side.prepend(bar);
    const pane=document.createElement('div');pane.id='standsPane';pane.className='panel standspane';pane.hidden=true;side.appendChild(pane)}
  return bar}
function sideTabsHTML(){const n=standsCount(),k=S&&S.npcKills||0;
  return [['fighter',_T('⚔ Fighter')],['field',_T`🐾 Field${k?_T` · ${k} slain`:''}`],['stands',`🏟 Stands · ${n}K`]].map(([t,l])=>`<button type="button" role="tab" data-sidetab="${t}" aria-selected="${SIDE.tab===t}" class="${SIDE.tab===t?'on':''}">${l}</button>`).join('')}
function standsPaneHTML(){if(!S||!S.spect||!S.spect.length)return `<p class="hint" style="margin:0">${_T`The stands are empty this event.`}</p>${typeof standsDrawerHTML==='function'?standsDrawerHTML({chronOnly:1}):''}`;
  if(typeof standsDrawerHTML!=='function')return crowdPanelHTML();
  /* the crowd first; the arena's chronicle as one quiet line after the stands log, then the roster */
  const h=standsDrawerHTML({noChron:1}).replace('<div class="sect">In the stands right now</div>',''),ch=standsDrawerHTML({chronOnly:1})||'';const i=h.indexOf('<div class="sect">Spectator roster');
  return i<0?h+ch:h.slice(0,i)+ch+h.slice(i)}
function fieldHeadHTML(){const d=S&&S.deck&&EV()&&EV().deck?_T`${S.deck.length} arena card${S.deck.length===1?'':'s'} left`:'';
  return `<div class="fieldhd"><span class="rc-sub">${d}</span><button class="btn tksm" type="button" data-bestiary>${_T`📖 Bestiary`}</button></div>`}
function sideApply(){const bar=sideTabsEnsure();if(!bar)return;const live=sideLive();bar.hidden=!live;
  const t=live?SIDE.tab:'fighter';bar.innerHTML=live?sideTabsHTML():'';
  const vis=(id,on)=>{const el=document.getElementById(id);if(el)el.classList.toggle('sidehide',!on)};
  vis('board',t==='fighter');vis('rosterGrp',t==='field');vis('npcPanel',t==='field');vis('crowdPanel',false);const npc=document.getElementById('npcPanel');if(npc&&live)npc.hidden=false;
  const pane=document.getElementById('standsPane');if(pane){pane.hidden=t!=='stands';if(t==='stands'){const sc=pane.scrollTop;pane.innerHTML=standsPaneHTML();pane.scrollTop=sc}}
  const np=document.getElementById('npcPanel');if(np&&t==='field'&&!np.querySelector('.fieldhd'))np.insertAdjacentHTML('afterbegin',fieldHeadHTML());
  const bb=document.getElementById('btnDrawB');if(bb){bb.innerHTML=`🏟 Stands · <b>${standsCount()}K</b>`;bb.title=_T('The stands: the crowd, the stands log and the spectator roster, in the right column');bb.classList.toggle('on',t==='stands')}
  tickerApply()}
function sideTab(t){SIDE.tab=t;try{localStorage.setItem('flavius_sidetab',t)}catch(e){}if(document.body.classList.contains('phoneL')){const d=document.querySelector('#plDock [data-pl="side"]');if(d&&!document.body.classList.contains('pl-side'))d.click()}sideApply()}
/* the crowd ticker under the board */
let TICK_LAST=0;
function tickerApply(){let el=document.getElementById('crowdTick');const wrap=document.querySelector('.canvas-wrap');
  if(!el&&wrap){el=document.createElement('button');el.type='button';el.id='crowdTick';el.className='crowdtick';el.title=_T('Open the stands');wrap.insertAdjacentElement('afterend',el)}
  if(!el)return;const L=S&&S.spectLog||[];const e=L[L.length-1];el.hidden=!(sideLive()&&e&&!S.over);if(el.hidden)return;
  el.innerHTML=`<span class="tk">🏟</span><span class="tkr">R${e.r}</span><span class="tkt">${e.html}</span>`;
  if(L.length!==TICK_LAST){if(TICK_LAST&&!(typeof reduceMotion==='function'&&reduceMotion())){el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash')}TICK_LAST=L.length}}
{const base=render;render=function(){const r=base.apply(this,arguments);try{sideApply()}catch(e){console.error(e)}return r}}
{const base=renderDrawer;renderDrawer=function(){const r=base.apply(this,arguments);try{const p=document.getElementById('standsPane');if(p&&!p.hidden&&SIDE.tab==='stands'){const sc=p.scrollTop;p.innerHTML=standsPaneHTML();p.scrollTop=sc}}catch(e){}return r}}
{const base=openDrawer;openDrawer=function(tab){if(tab==='stands'||tab==='beasts'){sideTab(tab==='stands'?'stands':'field');return}return base.apply(this,arguments)}}
document.addEventListener('click',e=>{
  const st=e.target.closest('[data-sidetab]');if(st){sideTab(st.dataset.sidetab);return}
  if(e.target.closest('#btnDrawB')||e.target.closest('#crowdTick')){e.stopImmediatePropagation();e.preventDefault();sideTab('stands');return}
  if(e.target.closest('[data-bestiary]')){e.stopImmediatePropagation();const go=()=>openMenagerie();if(CUR_MODAL&&e.target.closest('#modal')){CUR_MODAL.done(null);setTimeout(go,350)}else go();return}
  const ins=e.target.closest('[data-act="inspect"]');if(ins&&SIDE.tab==='field')setTimeout(()=>sideTab('fighter'),0)},true);
/* the Menagerie → the Bestiary: lore and all-time ledgers only (what is on the sand lives in the Field tab) */
function bestiaryHTML(){const box=document.createElement('div');box.innerHTML=menagerieHTML();const g=box.querySelector('.setup-grid');const right=g&&g.children[1];return right?right.innerHTML:box.innerHTML}
openMenagerie=async function(){if(typeof modalBusy==='function'&&modalBusy())return;await loadBestiary();
  await modal(_T('📖 Bestiary · the beasts and their ledgers'),`<div id="menagBody">${bestiaryHTML()}</div>`,[{label:_T('Close'),value:0}],{wide:1})};
{const base=showRules;showRules=function(){const r=base.apply(this,arguments);setTimeout(()=>{try{const t=document.querySelector('#mBody [data-rul="learn"]');if(t&&!document.querySelector('#mBody [data-bestiary]'))t.insertAdjacentHTML('afterend',`<button type="button" data-bestiary>${_T`📖 Bestiary`}</button>`)}catch(e){}},60);return r}}
(()=>{const st=document.createElement('style');st.textContent=`
.sidetabs{display:flex;gap:0;position:sticky;top:0;z-index:5;background:var(--panel,#1f1711)}
.sidetabs button{flex:1;padding:7px 6px;font-size:13px}
.side .sidehide{display:none!important}
.standspane{max-height:calc(100vh - 140px);overflow-y:auto}
.standspane .crowd{max-height:none!important}
.standspane .slog{max-height:260px;overflow-y:auto}
.fieldhd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px}
.crowdtick{display:flex;align-items:baseline;gap:8px;width:100%;margin:4px 0 0;padding:4px 10px;border:1px solid var(--line2,#4a3826);border-radius:6px;background:rgba(20,14,10,.6);color:var(--bone,#efe3cc);font-size:13px;text-align:left;cursor:pointer;overflow:hidden;white-space:nowrap}
.crowdtick .tk,.crowdtick .tkr{flex:none}.crowdtick .tkr{color:var(--dim,#9a8a74);font:11px var(--mono)}.crowdtick .tkt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.crowdtick .tkt *{display:inline}
.crowdtick:hover{border-color:var(--gold,#c9a458)}
.crowdtick.flash{animation:tkflash 1.2s ease-out}@keyframes tkflash{0%{background:rgba(201,164,88,.35)}100%{background:rgba(20,14,10,.6)}}
.standspane .slog+.sect,.standspane .sect:has(+.chron){margin-top:12px!important}
.standspane .chron.mini{display:flex;flex-wrap:wrap;gap:2px 12px;margin:0 0 4px}
.standspane .chron.mini .stat{display:inline-flex;flex-direction:row;align-items:baseline;gap:4px;border:0;background:none;padding:0;min-width:0;min-height:0;font-size:12px;color:var(--muted)}
.standspane .chron.mini .stat b{font:600 13px var(--mono);color:var(--gold2);display:inline}
.standspane .chron.mini+p{font-size:12px;margin:2px 0 6px!important}
#btnDrawB.on{border-color:var(--gold,#c9a458)}`;document.head.appendChild(st)})();
