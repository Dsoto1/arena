/* =====================================================================
   56-V52 · RULEBOOK ROUNDS, MISSILES, A CLEANER ARENA
   =====================================================================
   • Damnatio keeps the stones the crowd misses him with (+1 in the sling, up to 6).
   ===================================================================== */
{const _ss=spectStone;spectStone=async function(s,q){const before=q?hpSumOf(q):0;const r=await _ss(s,q);
  try{if(q&&q.alive&&q.abil==='stone'&&hpSumOf(q)>=before){const w=['R','L'].map(a=>q['w'+a]).find(w=>w&&w.stones);if(w&&w.ammoLeft<6){w.ammoLeft++;log(`${nm(q)} picks up the stone (${w.ammoLeft} in the sling).`)}}}catch(e){}
  return r}}

/* ---------- grid coordinates in the log: tokens placed on the sand name their tiles ---------- */
let PF_BUF=[];
{const _pf=placeFloor;placeFloor=function(kind,key,r,c,extra){_pf(kind,key,r,c,extra);try{if(S&&!S.sim&&r!=null){if(!PF_BUF.length)Promise.resolve().then(()=>{PF_BUF=[]});PF_BUF.push(tl(r,c))}}catch(e){}}}
{const _lg=log;log=function(html,cls){if(PF_BUF.length&&typeof html==='string'&&/[A-M]-\d/.test(html))PF_BUF=[];if(PF_BUF.length&&typeof html==='string'){const t=PF_BUF.join(', ');PF_BUF=[];html=html.replace(/(\.?)\s*$/,` (${t})$1`)}return _lg(html,cls)}}

/* ---------- CPU speed: a tray that shows only the active pace ---------- */
{const seg=document.querySelector('#speedTray .speedseg');if(seg){
  seg.addEventListener('click',e=>{const b=e.target.closest('[data-speed]');if(!b)return;
    if(!seg.classList.contains('open')&&b.classList.contains('on')){e.stopImmediatePropagation();e.preventDefault();seg.classList.add('open');return}
    setTimeout(()=>seg.classList.remove('open'),0)},true);
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#speedTray'))seg.classList.remove('open')});
  seg.querySelectorAll('[data-speed]').forEach(b=>b.title=(b.title?b.title+' · ':'')+'click the active pace to change it')}}
/* the tray must still show something when no pace is lit (a snapshot jump) */
{const fix=()=>{const seg=document.querySelector('#speedTray .speedseg');if(seg&&!seg.querySelector('.on')){const b=seg.querySelector(`[data-speed="${typeof SPEED!=='undefined'&&SPEED!=='snap'?SPEED:'slow'}"]`)||seg.querySelector('[data-speed="slow"]');if(b)b.classList.add('on')}};setInterval(()=>{try{fix()}catch(e){}},700)}

/* ---------- arena tools drawer (bottom right) with the hints master switch ---------- */
function ctSync(){const t=document.getElementById('cTools'),b=document.getElementById('ctTog');let open=false;try{open=localStorage.getItem('flavius_ctopen')==='1'}catch(e){}
  if(t)t.classList.toggle('open',open);if(b){b.setAttribute('aria-expanded',String(open));b.textContent=open?'✕':'🧰';b.title=open?'Hide the arena tools':'Arena tools: stands, see-through, hints, zoom'}
  const h=document.getElementById('btnHintsM');if(h){const on=typeof HINTS!=='undefined'&&!!HINTS;h.classList.toggle('on',on);h.setAttribute('aria-pressed',String(on));h.title=on?'Hints are on — click to turn every hint off (H)':'Hints are off — click to turn them on (H)'}}
document.addEventListener('click',e=>{
  if(e.target.closest('#ctTog')){let open=false;try{open=localStorage.getItem('flavius_ctopen')==='1'}catch(_){}try{localStorage.setItem('flavius_ctopen',open?'0':'1')}catch(_){}ctSync();return}
  if(e.target.closest('#btnHintsM')){try{hintsMaster(!HINTS)}catch(_){setHints(!HINTS)}ctSync();return}});
{const _ap=applySettings;applySettings=function(){const r=_ap.apply(this,arguments);try{ctSync()}catch(e){}return r}}
setTimeout(ctSync,150);

/* ---------- Menagerie lives in the top bar, but only while an event is on the sand ---------- */
{const _rn=render;render=function(){const r=_rn.apply(this,arguments);try{const b=document.getElementById('btnDrawB');if(b)b.hidden=!(S&&S.phase!=='setup');ctSync();capFit()}catch(e){}return r}}

/* ---------- the caption never covers Flavius ---------- */
function capFit(){const el=document.getElementById('caption'),cv=document.getElementById('cv');if(!el||!cv||!cv.width||typeof iso!=='function')return;
  const a=iso(0,0);const w=TW*1.55;const on=!(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false);
  const left=on?(STANDS?a.x:Math.max(w/2+8,a.x-TW*5.2))-w/2:cv.clientWidth;
  if(cv.clientWidth<560){el.style.setProperty('top','auto','important');el.style.setProperty('bottom','8px','important');el.style.removeProperty('left');el.style.setProperty('--capmax',Math.round(cv.clientWidth*0.72)+'px');return}
  el.style.removeProperty('top');el.style.removeProperty('bottom');
  if(on&&!STANDS&&left<170){const right=left+w;el.style.setProperty('left',Math.round(right+10)+'px','important');el.style.setProperty('--capmax',Math.max(150,cv.clientWidth*0.5-right)+'px');return}
  el.style.removeProperty('left');el.style.setProperty('--capmax',Math.max(150,Math.min(left-22,cv.clientWidth*0.62))+'px')}
{const _cap=caption;caption=function(html){_cap(html);try{capFit()}catch(e){}}}
window.addEventListener('resize',()=>{try{capFit()}catch(e){}});

/* ---------- “Sound the horns” always reaches the sand (never the menu) ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&(b.id==='goBtn'||b.id==='cityBell'||/Sound the horns/i.test(b.textContent||'')))MM.goAt=Date.now()},true);
{const _ac=mmAfterClose;mmAfterClose=function(){if(Date.now()-(MM.goAt||0)<15000){ /* the horns sounded: wait for the event rather than fall back to the menu */
    const t0=MM.goAt;const wait=()=>{if(MM.goAt!==t0)return;if(S&&!S.over&&S.phase!=='setup'||(typeof CITY!=='undefined'&&CITY.open)||!$('#modal').hidden){MM.fromMenu=false;transitUncover();return}
      if(Date.now()-t0>15000){MM.goAt=0;return _ac()}setTimeout(wait,200)};return wait()}
  return _ac()}}

/* ---------- the passage between screens: a health bar that fills, and a line to read ---------- */
const RULE_LINES=['When a weapon runs out of throws, discard it from play.','Thrown weapons cannot be picked up in the same turn.','Ammo cards can only refill a weapon to its original ammo.',
  'Lose the head or the chest and you are out of the event.','A hit strips armor before it reaches health.','Crowd Favor of 20 or more saves you to the Ludus Flavius.','50 Crowd Favor wins your freedom.',
  'Every 3 trophies held by the winner add 5 CF.','Hidden Mandata Flavi cost 5 CF each at the end.','No CF can be spent while Commodus is in the arena.','Beasts you attack will hunt you: that is aggro.',
  'Spectators may throw a stone for 2 CF.','Arena keys open the chest or a tunnel.','The zone shrinks each round: two turns of grace to get inside.'];
function transitQuote(){const pool=[];try{for(const k in CARDS){const q=CARDS[k].q;if(q&&!pool.includes('“'+q+'”'))pool.push('“'+q+'”')}}catch(e){}
  for(const l of RULE_LINES)pool.push('📜 '+l);
  try{for(const k in GLOSS){const d=String(GLOSS[k].d||'').replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g,'$1').replace(/\[\[([^\]]*)\]\]/g,'$1');const s=d.split(/(?<=\.)\s/)[0];if(s&&s.length<120)pool.push('💡 '+GLOSS[k].t+': '+s)}}catch(e){}
  return pool[Math.floor(Math.random()*pool.length)]||''}
{const _te=transitEl;transitEl=function(){const t=_te();if(!t.querySelector('.tbar')){t.insertAdjacentHTML('beforeend','<div class="tbar" aria-hidden="true"><i></i></div><div class="tquote"></div>')}return t}}
{const _tr=transitRun;transitRun=function(fn,label){if(HEADLESS)return _tr(fn,label);const t=transitEl();const bar=t.querySelector('.tbar i'),q=t.querySelector('.tquote');
  if(q)q.textContent=transitQuote();if(bar){bar.style.transition='none';bar.style.width='0%';void bar.offsetWidth;bar.style.transition='width 1.4s cubic-bezier(.2,.7,.3,1)';bar.style.width='88%'}
  const t0=Date.now();
  const fin=setInterval(()=>{if(!t.classList.contains('on')||Date.now()-t0>6000){clearInterval(fin);return}if(bar&&Date.now()-t0>700&&(document.getElementById('mainMenu').hidden===false||(S&&!S.over&&S.phase!=='setup')||!$('#modal').hidden)){bar.style.transition='width .25s ease';bar.style.width='100%'}},60);
  return _tr(fn,label)}}

/* ---------- tooltips sit BESIDE what they explain, never over the next button ---------- */
ttPlace=function(el,a){const r=a.getBoundingClientRect();el.style.left='0px';el.style.top='0px';const w=el.offsetWidth,h=el.offsetHeight,G=10;
  const vy=y=>Math.max(8,Math.min(innerHeight-h-8,y));let x,y;
  if(r.right+G+w<=innerWidth-8){x=r.right+G;y=vy(r.top)}
  else if(r.left-G-w>=8){x=r.left-G-w;y=vy(r.top)}
  else{x=Math.max(8,Math.min(innerWidth-w-8,r.left));y=r.bottom+G+h<=innerHeight-8?r.bottom+G:Math.max(8,r.top-h-G)}
  el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px';
  /* nothing to hover inside it? then it lets every click through */
  el.style.pointerEvents=el.querySelector('.gl,[data-tt],[data-tip],a,button')?'auto':'none'};

/* ---------- the lesson-buttons switch also lives on the Lessons tab ---------- */
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.lessonsmenu||t.closest('#setBody'))return;SETTINGS.lessonsMenu=t.checked;applySettings();try{lessonsMenuVis()}catch(err){}if(typeof mToast==='function')mToast(t.checked?'🎓 Lesson buttons shown on the main menu':'🎓 Lesson buttons hidden from the main menu')});

/* ---------- first run: the lessons, and hints you choose ---------- */
const HINT_LABELS={turnHints:['💡 Turn hints','a suggested move each turn'],ruleHints:['📜 Rule hints','what the rules say about what you hover'],hintDock:['🧭 Strategy panel','the hint box under your actions'],rulePops:['📖 Rule popups','a short note the first time a rule comes up'],turnRecap:['📰 Turn recap','what happened since your last turn']};
async function firstRunPrompt(){let st=null;try{st=localStorage.getItem('flavius_firstrun')}catch(e){}if(st!=='pending'||navigator.webdriver)return;
  if(CUR_MODAL||$('#mainMenu').hidden)return setTimeout(firstRunPrompt,1500);
  try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}
  const rows=Object.entries(HINT_LABELS).map(([k,[t,d]])=>`<label class="setrow" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-frh="${k}"><span><b>${t}</b> <span class="rc-sub">${d}</span></span></label>`).join('');
  const body=`<p>New to the sand? A short lesson teaches the arena in a few minutes.</p>
   <div class="sect">Hints</div><p class="rc-sub" style="margin-top:0">They start off. Tick any you want, or press <b>H</b> or 💡 in the arena tools any time.</p>
   <label class="setrow" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="frhAll"><span><b>All hints</b></span></label><div style="display:grid;gap:4px;padding-left:22px">${rows}</div>`;
  const v=await modal('👋 Welcome to Flavius Rule',body,[{label:'🎓 Learn to Play',value:'learn',primary:1},{label:'💼 Manager lesson',value:'learnmgr'},{label:'Just play',value:'play'}],{onOpen:()=>{const mb=$('#mBody');
      mb.addEventListener('change',e=>{const t=e.target;if(t.id==='frhAll')mb.querySelectorAll('[data-frh]').forEach(x=>x.checked=t.checked);else if(t.dataset.frh){const all=[...mb.querySelectorAll('[data-frh]')];$('#frhAll').checked=all.every(x=>x.checked)}});
      mb.addEventListener('change',()=>{const on=[...mb.querySelectorAll('[data-frh]')].filter(x=>x.checked).map(x=>x.dataset.frh);for(const k of Object.keys(HINT_LABELS))SETTINGS[k]=on.includes(k);SETTINGS.hints=on.length>0;applySettings()})}});
  if(v==='learn'||v==='learnmgr'){const b=document.querySelector(`#mainMenu [data-mm="${v}"]`);if(b)b.click();else if(v==='learn'&&typeof startTutorial==='function'){menuHide();startTutorial()}else if(typeof startManagerTutorial==='function'){menuHide();startManagerTutorial()}}}
{const _ms=menuShow;menuShow=function(){const r=_ms.apply(this,arguments);setTimeout(()=>{try{firstRunPrompt()}catch(e){}},900);return r}}
setTimeout(()=>{try{if(!$('#mainMenu').hidden)firstRunPrompt()}catch(e){}},2200);
/* …and the stones a gladiator slings at him and misses */
{const _da=doAttack;doAttack=async function(p,src,t,opt){const q=t&&t.ref;const isStone=src&&src.w&&(src.w.key==='stones'||src.w.key==='sling'||src.w.stones);const before=q&&isStone&&q.abil==='stone'?hpSumOf(q):null;
  const r=await _da(p,src,t,opt);
  try{if(before!=null&&q.alive&&hpSumOf(q)>=before){const w=['R','L'].map(a=>q['w'+a]).find(w=>w&&w.stones);if(w&&w.ammoLeft<6){w.ammoLeft++;log(`${nm(q)} picks up the missed stone (${w.ammoLeft} in the sling).`)}}}catch(e){}
  return r}}
