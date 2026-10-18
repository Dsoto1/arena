/* 397-v106b1 (v1.06 beta-1 notes G1–G3):
   • G1: in a Match Week AWAY from home, before the house has SET OFF (389's sq105Locked: trip cost > 0, not gone, not bye/home/tutorial),
     NO bout can be fought, watched or simulated: runBoutSim / watchBout / boutCfg refuse (the play functions themselves), the bout cards'
     Watch / Simulate / Fight / Spectate, "Simulate the rest" and End-the-week-that-plays-bouts show "🔒 Set off first" (360's click handler
     calls bt106Locked before its auto set-off). Entering fighters stays allowed. After Set off everything works as before.
   • G2: City Square look: sign plates fit their text (lab106W: ink width, shrinks the font for long names; used by 172's label code) and the
     city's edges get a soft fade to the dark backdrop (baked once into the fg layer, no per-frame cost).
   • G3: the square's speed control is gone (25-city); walking stays at normal speed (CITY.speed stays 1).
   Kill switch: localStorage flavius_v106b1off=1 (G1 + G2; G3 is a removal). Test tv106e. */
function b1106On(){try{return localStorage.getItem('flavius_v106b1off')!=='1'}catch(e){return true}}
function bt106Locked(){try{return b1106On()&&typeof sq105Locked==='function'&&sq105Locked()}catch(e){return false}}
function bt106Toast(){try{mToast(sq105Why())}catch(e){}}
{const base=runBoutSim;runBoutSim=async function(){if(bt106Locked()){bt106Toast();return}return base.apply(this,arguments)}}
{const base=watchBout;watchBout=function(){if(bt106Locked()){bt106Toast();return}return base.apply(this,arguments)}}
{const base=boutCfg;boutCfg=function(){if(bt106Locked())throw new Error('Set off first');return base.apply(this,arguments)}}
/* the buttons: stop them before the set-off ask, and mark them locked */
window.addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-mg="fight"],[data-mg="watch"],[data-mg="sim"],[data-mg="spect"],[data-mg="simall"],[data-mg="underdog"],[data-mg="endweek"]');
  if(!el||!el.closest('#mgrBody')||!bt106Locked())return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();bt106Toast()},true);
/* the Match Week card: 🔒 on the buttons that play a bout, and on End the week while bouts are left */
function bt106Mark(root){try{if(!root||!bt106Locked())return;const w=W_();const left=w.night.bouts.some(b=>!b.done);
  for(const b of root.querySelectorAll('[data-mg="fight"],[data-mg="watch"],[data-mg="sim"],[data-mg="spect"],[data-mg="simall"],[data-mg="underdog"],[data-mg="endweek"],[data-mw105="end"]')){
    if(b.matches('[data-mw105="end"],[data-mg="endweek"]')&&!left)continue;if(b.getAttribute('data-bt106'))continue;
    b.setAttribute('data-bt106','1');b.title=sq105Why();b.classList.add('bt106l');b.setAttribute('aria-disabled','true');
    if(b.matches('[data-mg="simall"],[data-mw105="end"],[data-mg="endweek"]')){b.innerHTML=sq105Why()}else b.insertAdjacentText('afterbegin','🔒 ')}}catch(e){console.error(e)}}
{const base=mw105Shape;mw105Shape=function(T){const r=base.apply(this,arguments);try{if(T&&T.content)bt106Mark(T.content)}catch(e){}return r}}
{let q=0;const mo=new MutationObserver(()=>{if(q)return;q=1;requestAnimationFrame(()=>{q=0;if(!bt106Locked())return;const rb=document.getElementById('mgrBody');if(rb)bt106Mark(rb)})});
  const arm=()=>{try{mo.observe(document.body,{childList:true,subtree:true})}catch(e){}};if(document.body)arm();else document.addEventListener('DOMContentLoaded',arm)}
(function(){const st=document.createElement('style');st.textContent='.bt106l{opacity:.55;cursor:not-allowed}';document.head.appendChild(st)})();

/* ---- G2: sign plates + soft city edges ---- */
function lab106W(c2,t,fs,T,W){let f=fs;const fam='IBM Plex Mono, monospace';c2.font=`600 ${f}px ${fam}`;
  if(!b1106On())return c2.measureText(t).width+12;
  const cap=Math.max(120,Math.min(W*0.3,T*3.6));
  let m=c2.measureText(t),w=Math.max(m.width,(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||0));
  while(w+16>cap&&f>7){f--;c2.font=`600 ${f}px ${fam}`;m=c2.measureText(t);w=Math.max(m.width,(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||0))}
  const pw=Math.ceil(w+16);try{(CITY.lab106=CITY.lab106||{})[t]=[pw,w,f]}catch(e){}return pw}
{const base=bake89;bake89=function(){const K=base.apply(this,arguments);
  try{if(b1106On()&&K&&K.fg&&!K.fg._e106){K.fg._e106=1;const W=CITY.W,H=CITY.H,dpr=CITY.dpr||1;const f=K.fg.getContext('2d');f.save();f.setTransform(dpr,0,0,dpr,0,0);
    const e=Math.max(28,Math.round(Math.min(W,H)*0.09));const c0='rgba(22,15,9,.96)',c1='rgba(22,15,9,0)';
    for(const [x0,y0,x1,y1,rx,ry,rw,rh] of [[0,0,e,0,0,0,e,H],[W,0,W-e,0,W-e,0,e,H],[0,H,0,H-e,0,H-e,W,e],[0,0,0,e*0.6,0,0,W,e*0.6]]){const g=f.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,c0);g.addColorStop(1,c1);f.fillStyle=g;f.fillRect(rx,ry,rw,rh)}
    f.restore()}}catch(x){console.error(x)}
  return K}}
