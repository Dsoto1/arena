/* 288-v100fps (v1.0) — FRAME METER. Settings → General → Performance → "Show frame meter" (SETTINGS.fps100, default off).
   On: a small corner overlay #fps100 — FPS over 1 s, slowest frame of the last 5 s, share of frames over 16.7 / 33 ms, a 60-frame
   sparkline; green >=55 fps, amber 30-54, red <30. Click = expands: the screen being measured + the top 3 draw layers by ms
   (LAYERS93.report()) while a match is on; the ⇱ button moves it to the next corner (localStorage flavius_fps100pos).
   Frames are requestAnimationFrame timestamps only. Off = no rAF loop, no element. Hidden tab = loop stops and restarts on return.
   It keeps rAF alive, so it keeps the page awake (idle mode still pauses CSS animations: it does not mark activity). */
const F100={on:false,raf:0,last:0,fr:[],exp:false,pos:'bl',el:null,cv:null,upd:0,stat:null};
try{F100.pos=localStorage.getItem('flavius_fps100pos')||'bl'}catch(e){}
const F100_CORNERS=['bl','br','tl','tr'];
function fps100Screen(){try{
  if(document.getElementById('cityOv'))return _T('City');
  const o=document.getElementById('onl');if(o&&!o.hidden&&o.offsetParent!==null)return _T('Online');
  const m=document.getElementById('modal');const mv=m&&!m.hidden&&typeof CUR_MODAL!=='undefined'&&CUR_MODAL;
  if(mv){if(m.querySelector('.railmain'))return _T('Manager');if(m.querySelector('#studio'))return _T('Studio');return _T('Window')}
  const mm=document.getElementById('mainMenu');if(mm&&!mm.hidden)return _T('Menu');
  if(typeof S!=='undefined'&&S&&!S.over&&S.players)return _T('Match');
  return _T('Arena')}catch(e){return '-'}}
function fps100Stats(now){const a=F100.fr;while(a.length&&a[0].t<now-5000)a.shift();
  let n1=0,worst=0,o16=0,o33=0;for(const f of a){if(f.t>now-1000)n1++;if(f.dt>worst)worst=f.dt;if(f.dt>17.5)o16++;if(f.dt>33.4)o33++}
  const n=a.length||1;return {fps:n1,worst,p16:Math.round(100*o16/n),p33:Math.round(100*o33/n),n:a.length}}
function fps100Col(fps){return fps>=55?'#4cc46a':fps>=30?'#e6a93a':'#e5564a'}
function fps100Build(){if(F100.el)return;const el=document.createElement('div');el.id='fps100';
  el.innerHTML=`<div class="f1"><b class="fv">--</b><span>${_T('fps')}</span><canvas width="60" height="18" aria-hidden="true"></canvas></div><div class="f2"></div><div class="f3" hidden></div>`;
  el.setAttribute('role','status');el.setAttribute('aria-label',_T('Frame meter'));el.setAttribute('translate','no');
  el.title=_T('Frame meter — click for details. The meter keeps the page awake while shown.');
  el.addEventListener('click',e=>{if(e.target.closest('[data-f100pos]')){const i=(F100_CORNERS.indexOf(F100.pos)+1)%4;F100.pos=F100_CORNERS[i];try{localStorage.setItem('flavius_fps100pos',F100.pos)}catch(x){}fps100Place();return}
    F100.exp=!F100.exp;fps100Paint(performance.now())});
  document.body.appendChild(el);F100.el=el;F100.cv=el.querySelector('canvas');fps100Place()}
function fps100Place(){const e=F100.el;if(!e)return;e.dataset.pos=F100.pos}
function fps100Paint(now){const e=F100.el;if(!e)return;const s=fps100Stats(now);F100.stat=s;const c=fps100Col(s.fps);
  const fv=e.querySelector('.fv');fv.textContent=s.fps;fv.style.color=c;
  e.querySelector('.f2').textContent=_T`${_T('slowest')} ${s.worst.toFixed(0)} ms · >16.7 ${s.p16}% · >33 ${s.p33}%`;
  const g=F100.cv.getContext('2d');g.clearRect(0,0,60,18);const a=F100.fr.slice(-60);g.strokeStyle=c;g.lineWidth=1;g.beginPath();
  a.forEach((f,i)=>{const y=18-Math.min(1,f.dt/50)*17;i?g.lineTo(i+(60-a.length),y):g.moveTo(i+(60-a.length),y)});g.stroke();
  const d=e.querySelector('.f3');d.hidden=!F100.exp;
  if(F100.exp){let rows='';try{if(typeof S!=='undefined'&&S&&!S.over&&S.players&&typeof LAYERS93!=='undefined'){
      rows=LAYERS93.report().rows.filter(r=>!r.cached&&r.n).sort((x,y)=>y.avg-x.avg).slice(0,3).map(r=>`<div>${_T`${r.name} <b>${r.avg.toFixed(1)}</b> ms`}</div>`).join('')}}catch(x){}
    d.innerHTML=`<div>${_T('Measuring')}: <b>${fps100Screen()}</b></div>${rows}<button type="button" data-f100pos class="f100b" aria-label="${_T('Move to another corner')}">⇱</button>`}}
function fps100Tick(ts){F100.raf=0;if(!F100.on||document.hidden)return;
  if(F100.last){const dt=ts-F100.last;if(dt<1000)F100.fr.push({t:ts,dt})}F100.last=ts;
  if(ts-F100.upd>250){F100.upd=ts;fps100Paint(ts)}
  F100.raf=requestAnimationFrame(fps100Tick)}
function fps100Start(){if(F100.on)return;F100.on=true;F100.fr=[];F100.last=0;fps100Build();F100.el.hidden=false;if(!document.hidden)F100.raf=requestAnimationFrame(fps100Tick)}
function fps100Stop(){F100.on=false;if(F100.raf)cancelAnimationFrame(F100.raf);F100.raf=0;F100.last=0;F100.fr=[];if(F100.el){F100.el.remove();F100.el=null;F100.cv=null}}
function fps100Sync(){const want=!!SETTINGS.fps100;if(want&&!F100.on)fps100Start();else if(!want&&F100.on)fps100Stop()}
document.addEventListener('visibilitychange',()=>{if(!F100.on)return;if(document.hidden){if(F100.raf)cancelAnimationFrame(F100.raf);F100.raf=0;F100.last=0}else if(!F100.raf){F100.last=0;F100.fr=[];F100.raf=requestAnimationFrame(fps100Tick)}});
{const base=applySettings;applySettings=function(){const r=base.apply(this,arguments);try{fps100Sync()}catch(e){console.error(e)}return r}}
/* Settings → General: a Performance card */
if(typeof set98General==='function'){const base=set98General;set98General=function(){const h=base.apply(this,arguments);
  try{const ctrl=`<input type="checkbox" data-set="fps100"${SETTINGS.fps100?' checked':''} data-tip="${_T('The meter keeps the page awake while shown.')}">`;
    const card=set98Card('📈',_T('Performance'),`<div class="s98-rows">${set98Row(_T('Show frame meter'),_T('Frames per second, the slowest frame and the draw layers, in a corner. The meter keeps the page awake while shown.'),ctrl)}</div>`);
    return h.replace(/<\/div>\s*$/,card+'</div>')}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`#fps100{position:fixed;z-index:9000;font:600 11px/1.3 system-ui,sans-serif;color:#eee;background:rgba(14,12,10,.82);border:1px solid #5a4a30;border-radius:6px;padding:3px 6px;cursor:pointer;max-width:200px;user-select:none}
#fps100[hidden]{display:none}
#fps100[data-pos=bl]{left:6px;bottom:6px}#fps100[data-pos=br]{right:6px;bottom:6px}#fps100[data-pos=tl]{left:6px;top:6px}#fps100[data-pos=tr]{right:6px;top:6px}
#fps100 .f1{display:flex;align-items:center;gap:4px}#fps100 .fv{font-size:15px;min-width:22px;text-align:right}#fps100 canvas{width:60px;height:18px}
#fps100 .f2{font-weight:400;opacity:.85;font-size:10px}#fps100 .f3{margin-top:3px;border-top:1px solid #5a4a30;padding-top:3px;font-weight:400}
#fps100 .f100b{float:right;background:none;border:1px solid #5a4a30;color:#eee;border-radius:4px;cursor:pointer}
@media (max-width:600px){#fps100{font-size:10px;padding:2px 4px;max-width:150px}#fps100 canvas{width:40px}}`;document.head.appendChild(st)}
