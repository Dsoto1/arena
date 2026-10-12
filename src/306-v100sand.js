/* 306-v100sand — v1.0 THE SANDSTONE SLAB ON EVERY WINDOW'S MAIN BUTTON (his A3a, extended: "spread the style to every window's main
   button"). Display only: no handler, value, data-*, id, text, order or disabled state changes; no DOM moved or rebuilt.
   The look mirrors 300-v100pn's .sb100 slab (porphyry + gold primary, sandstone secondary, carbon danger) but is written for EXISTING
   .btn buttons (labels with <small> sub-lines wrap, no .t span needed), so it never depends on 300's markup:
   • modal() windows: a MutationObserver on #mBtns (childList — fires once per window build; NO onOpen added, so 290's online NOTICE
     detection is unchanged) tags the footer buttons: the .primary one (or the only one, or the non-cancel one of a two-button
     confirm) = primary slab size m, the rest = secondary size s, destructive labels (Delete · Abandon · Leave · Release · Remove ·
     Close/Exit lobby · Restore defaults · Cancel them · Ad Flamma · Retire from · Give up · Forfeit · Erase, any language via LBLRX,
     or class danger/red) = carbon. LEFT AS THEY ARE: full-screen windows (#modal.full), 290's docked decisions (.dock100/.sheet100),
     301's briefing (.bf100), 300's tablets (.sand100), windows whose buttons carry card art / svg / img (pick windows), more than 8
     footer buttons (dense choice lists), buttons with their own inline colours. CSS scopes the modal rules with :not(...) so a class
     added later (dock100 in an onOpen) still wins.
   • ask76 popups (delete confirm, abandon, reload, restore defaults…): an ask76 wrapper tags yes = primary m (carbon when destructive),
     no = secondary s.
   • full-screen main actions by CSS only (selectors on existing hooks): Manager ⏭ End the week (rail button ≥601 px wide only — the
     phone pill row keeps its look; the .wkloop pair), ⚡ Simulate Match Week; Online ⚔ Ranked / Custom / ⚔ Play (data-onl="quick" =
     Find me a fight), the room's ▶ Start (size m) and 🚪 Leave / Close lobby (carbon); Studio Save in every designer; Settings ↺ Restore
     all defaults (carbon). NOT restyled (his rule: panel controls keep the dark style): chips, tabs, rails, the action bar, list rows,
     small panel controls, the online rail's gold ⚔ Play (already a CTA).
   Accessibility: AA text on every state (secondary #3a2410 on sandstone ≥4.9:1 at the darkest stop, primary #f6dc98 on porphyry
   ≥6.2:1, carbon #f08a70 ≥7:1), gold :focus-visible outline kept, min-height 40 px, labels wrap (never overflow at 390 px; m → s size
   under 600 px). Reduce motion / calm / Animations Off (html.sd100rm, synced on each tag) = no lift. No box-shadow animation
   (transition only on transform/filter); the texture = the same tiny inline SVG noise as 300 (no new files).
   Kill switch localStorage flavius_sand100off=1 (no html.sd100on → no rule matches, no tagging). Test tv100sb; shots tools/plans/sand100/. */
const SD100={off:(()=>{try{return localStorage.getItem('flavius_sand100off')==='1'}catch(e){return false}})(),n:0};
if(!SD100.off)document.documentElement.classList.add('sd100on');
function sd100Calm(){try{return (typeof reduceMotion==='function'&&!!reduceMotion())||(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')}catch(e){return false}}
function sd100Sync(){try{document.documentElement.classList.toggle('sd100rm',sd100Calm())}catch(e){}}
/* the label without its <small> sub-line, leading emoji / punctuation stripped */
function sd100Label(b){let t=b.textContent||'';const sm=b.querySelector('small');if(sm){const s=sm.textContent||'';const i=t.lastIndexOf(s);if(i>=0)t=t.slice(0,i)+t.slice(i+s.length)}return t.replace(/^[^\p{L}\p{N}]+/u,'').trim()}
let SD100_DRX=null,SD100_LRX=null,SD100_CRX=null;
function sd100Danger(b){if(!b)return false;if(b.classList.contains('danger')||b.classList.contains('red'))return true;
  try{if(!SD100_DRX){SD100_DRX=LBLRX('Delete|Abandon|Release|Remove|Close lobby|Exit lobby|Restore defaults|Restore all defaults|Cancel them|Ad Flamma|Retire from|Give up|Forfeit|Erase|Leave the lesson|Leave the match');SD100_LRX=LBLRX('Leave',1)}
    const t=sd100Label(b);return SD100_DRX.test(t)||SD100_LRX.test(t)}catch(e){return false}}
function sd100Cancel(b){try{if(!SD100_CRX)SD100_CRX=LBLRX('Close|Cancel|Keep|Not now|Not yet|Back|Stay|Skip|Later|Look at the board');return SD100_CRX.test(sd100Label(b))}catch(e){return false}}
function sd100Tag(b,k,sz){b.classList.add('sd100');b.classList.toggle('sd100p',k==='p');b.classList.toggle('sd100d',k==='d');b.classList.toggle('sd100m',sz==='m')}
function sd100Untag(b){b.classList.remove('sd100','sd100p','sd100d','sd100m')}
/* sd100Modal — tag the footer buttons of the window just built (see the header for what is left alone) */
function sd100Modal(){if(SD100.off)return;const bt=document.getElementById('mBtns');if(!bt)return;sd100Sync();
  const B=[...bt.querySelectorAll(':scope > button')];if(!B.length)return;
  if(B.length>8||B.some(b=>b.querySelector('img,svg,canvas,.cimg'))){B.forEach(sd100Untag);return}
  const tt=(document.getElementById('mTitle')||{}).textContent||'';const big=/^\s*🎓/u.test(tt);
  let pri=B.filter(b=>b.classList.contains('primary'));
  if(!pri.length){if(B.length===1)pri=[B[0]];else if(B.length===2){const c=B.filter(sd100Cancel);if(c.length===1)pri=B.filter(b=>!c.includes(b))}}
  for(const b of B){const st=b.getAttribute('style')||'';if(/background|color|border/i.test(st)){sd100Untag(b);continue}
    const p=pri.includes(b),d=sd100Danger(b);sd100Tag(b,d?'d':p?'p':'',(p||big)?'m':'s')}
  SD100.n++}
(()=>{try{const bt=document.getElementById('mBtns');if(bt&&!SD100.off)new MutationObserver(()=>{try{sd100Modal()}catch(e){console.error(e)}}).observe(bt,{childList:true})}catch(e){console.error(e)}})();
/* ask76 popups: yes = primary (carbon when it destroys), no = secondary */
if(typeof ask76==='function'){const base=ask76;ask76=function(title,body,yes,no){const p=base.apply(this,arguments);
  try{if(!SD100.off){sd100Sync();const bg=[...document.querySelectorAll('.ask76bg')].pop();if(bg){const y=bg.querySelector('[data-ask76="1"]'),n=bg.querySelector('[data-ask76="0"]');
    if(y)sd100Tag(y,(sd100Danger(y)||/^\s*🗑/u.test(String(title||'')))?'d':'p','m');if(n)sd100Tag(n,'','s')}}}catch(e){console.error(e)}return p}}
if(typeof applySettings==='function'){const base=applySettings;applySettings=function(){const r=base.apply(this,arguments);sd100Sync();return r}}

/* ---------- the CSS: one generator, applied to selector groups ---------- */
function sd100CSS(G,wrap){const P='html.sd100on:is(#sd100i,html) ';const L=(list,suf)=>list.map(s=>P+s+(suf||'')).join(',');
  const ALL=[...G.pri,...G.sec,...G.dan];
  const NOISE=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 .32 0 0 0 0 .22 0 0 0 0 .1 0 0 0 .8 0'/%3E%3C/filter%3E%3Crect width='240' height='120' filter='url(%23n)'/%3E%3C/svg%3E")`;
  const hov=(l,suf)=>l.map(s=>P+s+':hover:not(:disabled)'+(suf||'')+','+P+s+':focus-visible'+(suf||'')).join(',');
  const css=`
${L(ALL)}{--sdh:40px;--sdf:15px;position:relative;isolation:isolate;display:inline-flex;flex-flow:row wrap;align-items:center;align-content:center;justify-content:center;gap:1px .3em;
  min-height:var(--sdh);height:auto;min-width:0;max-width:100%;box-sizing:border-box;padding:5px 16px;border:0;border-radius:5px;cursor:pointer;white-space:normal;overflow-wrap:anywhere;
  text-align:center;font:400 var(--sdf)/1.15 var(--display);letter-spacing:.05em;color:#3a2410;opacity:1;
  background:${NOISE},linear-gradient(176deg,#dcc196 0%,#c9a877 38%,#b48f5c 100%);background-size:240px 120px,100% 100%;
  box-shadow:inset 0 2px 0 rgba(255,244,214,.75),inset 0 -3px 0 rgba(92,60,28,.55),inset 2px 0 0 rgba(255,238,204,.35),inset -2px 0 0 rgba(80,52,24,.4),0 3px 0 #6b4e2b,0 4px 0 #4b3519,0 7px 12px rgba(0,0,0,.55);
  text-shadow:0 1px 0 rgba(255,240,206,.6);transition:transform .12s,filter .12s}
${L(ALL,'::before')}{content:"";position:absolute;inset:4px;border-radius:3px;border:1px solid rgba(96,64,30,.45);box-shadow:0 1px 0 rgba(255,238,204,.4);background:none;pointer-events:none;z-index:-1;animation:none;transform:none;opacity:1}
${L(ALL,'::after')}{content:"";position:absolute;inset:0;border-radius:5px;pointer-events:none;z-index:-1;background:linear-gradient(180deg,rgba(255,246,222,.18),transparent 38%,rgba(60,36,14,.14));animation:none;transform:none;opacity:1}
${L(ALL,' small')}{display:block;flex:1 0 100%;font:500 11.5px/1.25 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.02em;color:#4a2e14;opacity:1;margin:1px 0 0;text-shadow:none}
${hov(ALL)}{transform:translateY(-1px);filter:brightness(1.06);color:#3a2410;border:0;
  box-shadow:inset 0 2px 0 rgba(255,244,214,.75),inset 0 -3px 0 rgba(92,60,28,.55),0 4px 0 #6b4e2b,0 5px 0 #4b3519,0 10px 16px rgba(0,0,0,.6),0 0 0 2px rgba(240,207,125,.75)}
${L(ALL,':focus-visible')}{outline:2px solid #f0cf7d;outline-offset:3px}
${L(ALL,':active:not(:disabled)')}{transform:translateY(2px);filter:brightness(.94);box-shadow:inset 0 3px 6px rgba(60,36,14,.45),0 1px 0 #6b4e2b,0 2px 0 #4b3519,0 3px 6px rgba(0,0,0,.6)}
${L(ALL,':disabled')}{cursor:not-allowed;filter:grayscale(.65) brightness(.72);transform:none;opacity:1;box-shadow:inset 0 2px 0 rgba(255,244,214,.4),0 3px 0 #4b3519}
${L(G.pri)}{color:#f6dc98;text-shadow:0 1px 0 #3a0e08,0 0 2px rgba(58,14,8,.7)}
${L(G.pri,'::before')}{inset:5px;border:0;background:linear-gradient(180deg,#8f2a1e,#6d1c13 60%,#5a160f);box-shadow:inset 0 2px 4px rgba(0,0,0,.6),inset 0 -1px 0 rgba(255,180,150,.25),0 1px 0 rgba(255,238,204,.55)}
${L(G.pri,' small')}{color:#f3d9a8}
${hov(G.pri)}{color:#ffe9b0}
${L(G.dan)}{color:#f08a70;text-shadow:0 1px 0 #000;
  background:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 2px,transparent 2px 4px),repeating-linear-gradient(-45deg,rgba(0,0,0,.35) 0 2px,transparent 2px 4px),linear-gradient(178deg,#26262a 0%,#151517 45%,#0b0b0c 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -2px 0 rgba(0,0,0,.8),0 3px 0 #050505,0 4px 0 #000,0 7px 12px rgba(0,0,0,.65)}
${L(G.dan,'::before')}{border:1px solid rgba(224,101,76,.3);box-shadow:none;background:none}
${L(G.dan,'::after')}{background:linear-gradient(180deg,rgba(255,255,255,.06),transparent 40%)}
${L(G.dan,' small')}{color:#e8b4a2}
${hov(G.dan)}{color:#ffa088;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 4px 0 #050505,0 5px 0 #000,0 10px 16px rgba(0,0,0,.7),0 0 0 2px rgba(224,101,76,.6)}
${L(G.m)}{--sdh:46px;--sdf:18px;padding:6px 22px}
@media (max-width:600px){${L(G.m)}{--sdh:42px;--sdf:15.5px;padding:5px 14px}${L(ALL)}{padding-left:12px;padding-right:12px}}
@media (prefers-reduced-motion:reduce){${L(ALL)}{transition:none}${L(ALL,':hover')},${L(ALL,':active')}{transform:none}}
${L(ALL).split(',').map(s=>s.replace('html.sd100on','html.sd100on.sd100rm')).join(',')}{transition:none}
${L(ALL,':hover').split(',').map(s=>s.replace('html.sd100on','html.sd100on.sd100rm')).join(',')},${L(ALL,':active').split(',').map(s=>s.replace('html.sd100on','html.sd100on.sd100rm')).join(',')}{transform:none}
`;return wrap?`${wrap}{${css}}`:css}
(()=>{try{
  const MD='#modal:not(.full):not(.dock100):not(.sheet100):not(.sand100):not(.bf100) #mBtns > .btn.sd100',AK='.ask76bg .btn.sd100';
  const STU='#studio .btn.primary:is([data-st="save"],[data-st="spsave"],[data-st="toksave"],[data-gs="asave"],[data-gs="wsave"],[data-clsa="save"],[data-lna="save"],[data-sx="save"],[data-px="save"],[data-rs="save"],[data-tnx="save"],[data-fda="save"],[data-sps="save"],[data-trs="save"],[data-in100a="save"])';
  const G={pri:[MD+'.sd100p:not(.sd100d)',AK+'.sd100p:not(.sd100d)','#mgrBody .wkloop .btn[data-mg="endask"]','#mgrBody .btn[data-mg="simall"]','#onl .btn[data-onl="quick"].primary','#onl .btn[data-onl="start"]',STU],
    sec:[MD+':not(.sd100p):not(.sd100d)',AK+':not(.sd100p):not(.sd100d)','#mgrBody .wkloop .btn[data-mg="tab"]','#onl .btn[data-onl="quick"]:not(.primary)'],
    dan:[MD+'.sd100d',AK+'.sd100d','.btn[data-rst84]','#onl .btn[data-onl="leave"]'],
    m:[MD+'.sd100m',AK+'.sd100m','#onl .btn[data-onl="start"]']};
  /* the rail's ⏭ End the week: on wide screens only (the phone pill row keeps its own look) */
  const R={pri:['#mgrBody .tabrow .btn.endwk.primary[data-mg="endask"]'],sec:['#mgrBody .tabrow .btn.endwk:not(.primary)[data-mg="endask"]'],dan:[],m:[]};
  const st=document.createElement('style');st.id='sd100css';
  st.textContent=sd100CSS(G)+sd100CSS(R,'@media (min-width:601px)')+`
html.sd100on #mBtns > .btn.sd100{flex:1 1 160px}
html.sd100on .ask76bg .acts{display:flex;flex-wrap:wrap;gap:10px}html.sd100on .ask76bg .acts .btn.sd100{flex:1 1 140px}
@media (min-width:601px){html.sd100on:is(#sd100i,html) #mgrBody .tabrow .btn.endwk[data-mg="endask"]{width:100%;margin-top:8px;white-space:normal}}`;
  document.head.appendChild(st)}catch(e){console.error(e)}})();
