/* =====================================================================
   99-PHONE73 · v0.73 — phones in portrait, and the big windows on phones (Virgilante)
   =====================================================================
   • A match in portrait no longer asks you to turn the phone: the arena sits on top, a bottom sheet below it with three
     tabs — ⚔ Actions · 🛡 Fighter · 📜 Log — and the top bar (speed, rules, menu) waits behind ⋯ (body.phoneP2).
     Your move switches the sheet to Actions; the tab you pick stays until your next move.
   • Manager mode and Creator Studio on a phone: the rail becomes a row of tabs along the bottom of the window (scrolls
     sideways); windows fill the screen.
   ===================================================================== */
const PP={tab:'act',turn:null};
const phoneP2=()=>typeof phonePort==='function'&&phonePort();
function ppBuild(){if(document.getElementById('ppTabs'))return;const t=document.createElement('div');t.id='ppTabs';
  t.innerHTML=`<button type="button" data-pp="act">⚔ Actions</button><button type="button" data-pp="side">🛡 Fighter</button><button type="button" data-pp="log">📜 Log</button><button type="button" data-pp="nav" class="ppmore" title="Speed, rules and the menu">⋯</button>`;document.body.appendChild(t)}
function ppSync(){const B=document.body;for(const k of ['act','side','log'])B.classList.toggle('pp-'+k,PP.tab===k);
  document.querySelectorAll('#ppTabs [data-pp]').forEach(b=>b.classList.toggle('on',b.dataset.pp==='nav'?B.classList.contains('pp-nav'):PP.tab===b.dataset.pp));
  const wrap=document.querySelector('.canvas-wrap');if(wrap){const r=wrap.getBoundingClientRect();B.style.setProperty('--ppTop',Math.max(120,Math.round(r.bottom))+'px')}}
function ppTick(){try{const B=document.body;const on=phoneP2();if(on!==B.classList.contains('phoneP2')){B.classList.toggle('phoneP2',on);if(on)ppBuild();if(!on)B.classList.remove('pp-nav');try{draw()}catch(e){}}
  if(!on)return;const mine=!S.over&&typeof humanTurn==='function'&&humanTurn()&&(S.phase==='action'||S.phase==='choice');const key=(S.turnNo||0)+':'+mine;
  if(key!==PP.turn){PP.turn=key;if(mine)PP.tab='act'}ppSync()}catch(e){}}
setInterval(ppTick,300);addEventListener('resize',()=>{ppTick();try{draw()}catch(e){}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-pp]');if(!b)return;e.preventDefault();const k=b.dataset.pp;if(k==='nav'){document.body.classList.toggle('pp-nav');ppSync();return}PP.tab=k;document.body.classList.remove('pp-nav');ppSync()});
document.addEventListener('pointerdown',e=>{if(document.body.classList.contains('pp-nav')&&e.target===cv){document.body.classList.remove('pp-nav');ppSync()}},true);
/* the arena gets the top ~55% of the screen */
{const base=fitReserve;fitReserve=function(){if(phoneP2())return Math.round(innerHeight*0.45);return base.apply(this,arguments)}}
(()=>{const st=document.createElement('style');st.textContent=`
body.phoneP2 #plRot{display:none!important}
body.phoneP2{overflow:hidden}
body.phoneP2 header.bar{position:fixed;left:0;right:0;top:0;z-index:60;transform:translateY(-105%);transition:transform .2s;box-shadow:0 6px 18px rgba(0,0,0,.6)}
body.phoneP2.pp-nav header.bar{transform:none}
body.phoneP2 main.layout{display:block!important;padding:0!important;margin:0!important;max-width:none!important}
body.phoneP2 .canvas-wrap{margin:0!important;border-radius:0!important;max-height:58dvh;overflow:hidden}
body.phoneP2 .hover,body.phoneP2 #mobTabs{display:none!important}
#ppTabs{display:none}
body.phoneP2 #ppTabs{display:flex;position:fixed;left:0;right:0;top:var(--ppTop,55dvh);z-index:57;background:#1c140e;border-top:1px solid var(--gold);border-bottom:1px solid var(--line2)}
#ppTabs button{flex:1;background:none;border:0;border-right:1px solid var(--line2);color:var(--muted);padding:9px 4px;font-size:13.5px}
#ppTabs button.on{color:var(--gold2);background:rgba(240,207,125,.08);box-shadow:inset 0 -2px 0 var(--gold)}#ppTabs .ppmore{flex:0 0 46px;border-right:0;font-size:18px}
body.phoneP2 #actions,body.phoneP2 aside.side,body.phoneP2 .logbar{position:fixed!important;left:0;right:0;top:calc(var(--ppTop,55dvh) + 40px);bottom:0;z-index:55;margin:0!important;overflow-y:auto;background:var(--panel,#1c140e);display:none!important;border-radius:0!important;max-height:none!important;width:auto!important;transform:none!important}
body.phoneP2.pp-act #actions{display:block!important}body.phoneP2.pp-side aside.side{display:flex!important}body.phoneP2.pp-log .logbar{display:flex!important}
body.phoneP2 .logbar #log{height:auto!important;flex:1}
body.phoneP2 #actions.dock{position:fixed!important;box-shadow:none}
@media (max-width:600px){
  .mbox,.mbox.wide,.mbox.xwide{max-width:100vw!important;width:100vw!important;max-height:100dvh!important;height:100dvh;border-radius:0!important;padding:12px 10px!important;margin:0}
  .modal{padding:0!important}
  #modal.full .railwrap,.railwrap{display:flex!important;flex-direction:column-reverse;gap:8px}
  #modal.full .railwrap>.tabrow,.railwrap>.tabrow{flex-direction:row!important;position:sticky!important;top:auto!important;bottom:-12px;z-index:5;margin:0 -10px!important;background:#1c140e;border-top:1px solid var(--gold);padding:4px;gap:4px}
  #modal.full .railwrap .rail,.railwrap .rail{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto;gap:4px;padding:0!important;border:0!important;background:none!important;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  #modal.full .railwrap .rail .railgrp,.railwrap .rail .railgrp{display:contents!important}#modal.full .railwrap .rail .railhd,.railwrap .rail .railhd{display:none!important}
  #modal.full .railwrap .rail button,.railwrap .rail button{flex:0 0 auto;white-space:nowrap;padding:7px 10px!important;border-radius:999px!important;font-size:13px;width:auto!important}
  #modal.full .railwrap .endwk{width:auto!important;flex:0 0 auto;font-size:12px;padding:6px 8px}
  .railwrap .railmain{min-width:0}
  .roomhd{height:92px}.roomttl b{font-size:18px}.roomttl span{display:none}
  .mgrid,.mgrid.wide,.lan2,.lan3,.impgrid{grid-template-columns:minmax(0,1fr)!important}
}`;document.head.appendChild(st)})();
/* the side column's own tabs (Fighter · Field · Stands) decide what shows inside the sheet */
(()=>{const st=document.createElement('style');st.textContent=`body.phoneP2 aside.side{flex-direction:column}
body.phoneP2 aside.side>*:not(.sidehide):not(#crowdPanel):not([hidden]){display:block!important}body.phoneP2 aside.side>#sideTabs{display:flex!important}
@media (max-width:600px){.railwrap>.tabrow{transition:transform .2s}.railwrap>.tabrow.navhide{transform:translateY(110%)}}`;document.head.appendChild(st)})();
/* phones: the bottom tab row slides away while you scroll down a window and comes back when you scroll up */
{let lastY=0;document.addEventListener('scroll',e=>{if(innerWidth>600)return;const el=e.target;if(!el||!el.querySelector)return;const row=el.querySelector('.railwrap>.tabrow');if(!row)return;
  const y=el.scrollTop||0;if(y>lastY+8&&y>80)row.classList.add('navhide');else if(y<lastY-8||y<80)row.classList.remove('navhide');lastY=y},true)}
/* phones: the Manager header folds to one scrolling line of badges and a smaller face */
(()=>{const st=document.createElement('style');st.textContent=`@media (max-width:600px){.badges.mhead{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}.badges.mhead .badge{flex:0 0 auto;font-size:12px!important;padding:3px 7px!important}
#mBody .mgrhd img,#mBody .mgrhd svg{max-height:56px}}`;document.head.appendChild(st)})();
