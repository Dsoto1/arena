/* 227-v95board — v0.95 PART A: BOARD & MATCH (his stabilization notes 2026-10-07). New code wraps or listens (BUS); the few direct edits are
   marked v0.95 in 07-ui (teamColor hues), 16-crowd (ate95), 24-sponsors (edTold95), 104-cards74 (class card key text).
   1  ZORA fits one tile: the mini is scaled so its wings stay inside the tile (ZORA95_W of a tile wide; standee path capped too).
   2  TEAM RINGS: in team events (Familia, Juggernaut…) every piece stands in a thick ring in its team colour (teamColor: A blue, B orange,
      C green, D pink — fixed, Okabe–Ito-like). With a colour-blind mode (SETTINGS.cvdMode) the rings also change pattern (A solid, B dashed,
      C dotted, D dash-dot) so colour is never the only clue. Cylinders get it too.
   3  FLOATING NUMBERS draw on their own overlay canvas (#fx95) ABOVE the speech/thought bubbles (z-index over #bubbles); several numbers
      popping on one tile at once (AP + damage) fan out up and outward. Off path: Reduce motion / Animations Off place them at once, no easing.
   4  CROWD FAVOR SPEND feedback (BUS window.close of the Crowd Favor window): toast "−5 CF · Arena Key", a floating number, the bought
      token flies to the fighter's inventory (or only a static highlight with Reduce motion / Animations Off); the window reopens with its
      buttons held for 650 ms and clicks inside it are swallowed meanwhile, so nothing is bought twice by accident.
   5  ARENA KEY TOKENS in the inventory (boardHTML wrapper): the engine counts keys as a number (class start 2), shown as tokens — the
      "2 keys" face (rtok key2), flipping to "1 key" (rtok key) after one use, gone at 0. Class cards read "1x Arena Key Token (2 keys)".
   6  ARENA CHEST SWAP: when the chest weapon asks which hand to replace, each "Replace …" button shows the outgoing weapon's CARD above its text.
   7  FOCUS ROLL window: the three dice are art from assets/locdie.jpg (head, chest, L arm, R arm, R leg, L leg — the sprite order locIcon
      already uses), still cycling while they roll, stacked in a COLUMN beside the avatar and as tall as it; the clickable limbs on the
      avatar get a stronger solid outline.
   8  "Editors unlocked" toast: once (edTold95 → localStorage flavius_edtold95), never with the developer key, never after every event.
   9  BESTIARY: humanoids (Tholo, Commodus, custom figures with a human token) read "slain", beasts keep "eaten" (ate95); the Bestiary
      button in Rules & strategy opens as a tab INSIDE that window (#rulTab-best95) — other tabs and Close behave as before, no jump to the menu. */
const ZORA95_W=0.68; /* TWEAK: Zora's width against one tile (the sprite cell is ~0.86 tile wide) */
const B95={fxCv:null,fxCx:null,fxW:0,fxH:0,fxFull:false,lock:0,last:null};
const anim95=()=>{try{if(typeof reduceMotion==='function'&&reduceMotion())return false;if(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')return false;if(typeof SETTINGS!=='undefined'&&SETTINGS.fx===false)return false}catch(e){}return true};
const lsGet95=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const lsSet95=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};

/* ---------- 1 Zora ---------- */
{const base=standeeSize;standeeSize=function(k){const r=base.apply(this,arguments);if(k!=='zoraMini')return r;
  try{if(typeof miniOn==='function'&&miniOn())return r;const im=standeeImg(k);if(im&&im.naturalWidth)return Math.min(r,TW*ZORA95_W*im.naturalHeight/im.naturalWidth)}catch(e){}return r}}
{const base=drawZoraMini;drawZoraMini=function(x,y,filt){let mini=false;try{mini=typeof miniOn==='function'&&miniOn()}catch(e){}
  if(!mini)return base.apply(this,arguments);
  /* the 8-facing cell is ~0.86 tile wide: shrink it round its base so the wings stay inside the tile */
  let k=0.79;try{const M=typeof MINI8!=='undefined'&&MINI8.zora;if(M){const s=miniScale('zora');k=Math.min(1,ZORA95_W*TW/(M[0]*s))}}catch(e){}
  ctx.save();ctx.translate(x,y);ctx.scale(k,k);ctx.translate(-x,-y);let t;try{t=base.apply(this,arguments)}finally{ctx.restore()}
  return t==null?t:y+(t-y)*k}}

/* ---------- 2 team rings ---------- */
const TEAMDASH95={A:[],B:[9,5],C:[2,5],D:[10,4,2,4]};
{const base=drawPlayer;drawPlayer=function(player){
  try{if(player&&S&&EV()&&(EV().teams||EV().coop)&&player.team){const m=center(player.r,player.c);const col=teamColor(player.team);
    const cvd=(SETTINGS.cvdMode||'off')!=='off'||!!SETTINGS.cvd;
    ctx.save();ctx.translate(0,swimming(player)?TW*0.02:0);
    ctx.fillStyle=col;ctx.globalAlpha=0.2;ell(m.x,m.y+TW*0.03,TW*0.42,TW*0.21);ctx.fill();ctx.globalAlpha=0.95;
    ctx.strokeStyle='rgba(10,6,4,.7)';ctx.lineWidth=6;ell(m.x,m.y+TW*0.03,TW*0.42,TW*0.21);ctx.stroke();
    ctx.strokeStyle=col;ctx.lineWidth=4;if(cvd)ctx.setLineDash((TEAMDASH95[player.team]||[]).map(v=>v*Math.max(0.6,TW/55)));
    ell(m.x,m.y+TW*0.03,TW*0.42,TW*0.21);ctx.stroke();ctx.restore()}}catch(e){}
  return base.apply(this,arguments)}}

/* ---------- 3 floating numbers above the bubbles ---------- */
function fx95Cv(){if(HEADLESS||typeof cv==='undefined'||!cv)return null;let c=B95.fxCv;
  if(!c||!c.isConnected){const wrap=cv.parentElement;if(!wrap)return null;c=document.createElement('canvas');c.id='fx95';c.setAttribute('aria-hidden','true');wrap.appendChild(c);B95.fxCv=c;B95.fxCx=c.getContext('2d');B95.fxW=0}
  const w=cv.clientWidth,h=cv.clientHeight,dpr=window.devicePixelRatio||1;
  if(w!==B95.fxW||h!==B95.fxH||B95.fxDpr!==dpr){c.width=Math.max(1,Math.round(w*dpr));c.height=Math.max(1,Math.round(h*dpr));c.style.width=w+'px';c.style.height=h+'px';B95.fxW=w;B95.fxH=h;B95.fxDpr=dpr}
  c.style.left=cv.offsetLeft+'px';c.style.top=cv.offsetTop+'px';return c}
/* the number's place: one alone rises straight; a cluster on one tile (AP + damage…) fans out, outer ones higher */
function fx95Pos(f,idx,n,k,m){const sp=anim95()?Math.min(1,k*5):1;let x=m.x,y=m.y-TW*(0.9+k*0.8);
  if(n>1){const off=idx-(n-1)/2;x+=off*TW*0.95*sp;y-=(Math.abs(off)*TW*0.22+(idx%2)*TW*0.14)*sp}
  return [Math.max(14,Math.min((B95.fxW||x+14)-14,x)),y]}
{const base=drawFX;drawFX=function(){
  if(HEADLESS||typeof FX==='undefined'||typeof SETTINGS==='undefined'||!SETTINGS.fx||!S)return base.apply(this,arguments);
  const c=fx95Cv();if(!c)return base.apply(this,arguments);
  /* the text numbers leave FX while the old drawFX runs (flashes, lines and picture pops stay on the board canvas) and come back after */
  const mine=[];for(let i=FX.length-1;i>=0;i--)if(!FX[i].img)mine.unshift(...FX.splice(i,1));
  let r;
  try{r=base.apply(this,arguments)}finally{
    try{const cx=B95.fxCx,dpr=window.devicePixelRatio||1;cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,B95.fxW,B95.fxH);
      const now=performance.now();const live=mine.filter(f=>(now-f.t0)/f.dur<1);
      /* clusters: same tile, starts within half a second */
      const sorted=[...live].sort((a,b)=>a.t0-b.t0);const grp=new Map();
      for(const f of sorted){const key=f.r+','+f.c;const list=grp.get(key)||[];const g=list[list.length-1];
        if(g&&f.t0-g[g.length-1].t0<=520)g.push(f);else list.push([f]);grp.set(key,list)}
      const place=new Map();for(const list of grp.values())for(const g of list)g.forEach((f,i)=>place.set(f,[i,g.length]));
      for(const f of live){const k=(now-f.t0)/f.dur;if(k<0)continue;
        const m=center(f.r,f.c);const [i,n]=place.get(f)||[0,1];const [px,py]=fx95Pos(f,i,n,k,m);
        const sz=Math.round(TW*(f.big?0.42:0.3)*(k<0.15?0.6+k*2.7:1));
        cx.save();cx.globalAlpha=k>0.7?(1-k)/0.3:1;cx.font=`700 ${sz}px Marcellus SC, serif`;cx.textAlign='center';cx.textBaseline='middle';
        cx.lineWidth=Math.max(3,sz/5);cx.strokeStyle='rgba(10,6,4,.9)';cx.lineJoin='round';cx.strokeText(f.text,px,py);cx.fillStyle=f.color;cx.fillText(f.text,px,py);cx.restore()}
      FX.push(...live)}catch(e){FX.push(...mine.filter(f=>(performance.now()-f.t0)/f.dur<1));try{console.error(e)}catch(x){}}}
  return r}}
(()=>{const st=document.createElement('style');st.textContent=`#fx95{position:absolute;pointer-events:none;z-index:5}body.chromeoff #fx95{display:none}`;document.head.appendChild(st)})();

/* ---------- 4 Crowd Favor spend feedback ---------- */
const CF95={key:[5,'key'],card:[5,'card'],el:[8,'el'],ap:[8,'ap'],mk:[3,'mk'],sp:[3,'sp'],dc:[-2,'dc']};
const cfTitle95=t=>String(t||'')===_T('Crowd Favor');
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#pickgrid.cf88g .btn');if(!b)return;
  if(performance.now()<B95.lock){e.preventDefault();e.stopImmediatePropagation();return} /* the window just reopened: a second click is not a second buy */
  const r=b.getBoundingClientRect();const pic=b.querySelector('.cf88p');const nm=b.querySelector('.cf88t b');
  B95.last={x:r.left+r.width/2,y:r.top+r.height/2,html:pic?pic.innerHTML:'',name:nm?nm.textContent:''}},true);
BUS.on('window.close',d=>{try{if(!d||!cfTitle95(d.title)||!CF95[d.value]||typeof S==='undefined'||!S||S.sim)return;
  const L=B95.last;B95.last=null;const [cost]=CF95[d.value];const p=typeof cur==='function'?cur():null;if(!p)return;
  B95.lock=performance.now()+650;
  const nm=L&&L.name?L.name:'';const amt=cost>0?`−${cost} CF`:`+${-cost} CF`; // i18n:skip
  try{if(typeof mToast==='function')mToast(nm?`${amt} · ${esc(nm)}`:amt)}catch(e){}
  try{if(typeof fx==='function'&&d.value!=='sp')fx(p.r,p.c,amt,cost>0?'#f0cf7d':'#9bd070')}catch(e){}
  setTimeout(()=>cf95Fly(d.value,L),90)}catch(e){console.error(e)}});
function cf95Target(v){const q=s=>document.querySelector(s);if(v==='key')return q('#board .key95')||q('#board .items')||q('#board .econ');
  if(v==='mk'||v==='dc')return q('#board .econ')||q('#board');return q('#board .items')||q('#board .econ')||q('#board')}
function cf95Fly(v,L){const t=cf95Target(v);if(!t)return;t.classList.remove('pulse95');void t.offsetWidth;t.classList.add('pulse95');setTimeout(()=>t.classList.remove('pulse95'),1400);
  if(!L||!L.html||!anim95()||typeof t.animate!=='function')return;
  const r=t.getBoundingClientRect();const el=document.createElement('div');el.className='fly95';el.innerHTML=L.html;el.style.left=(L.x-28)+'px';el.style.top=(L.y-30)+'px';document.body.appendChild(el);
  const dx=r.left+Math.min(40,r.width/2)-L.x,dy=r.top+Math.min(24,r.height/2)-L.y;
  const a=el.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*0.5}px,${dy*0.5-40}px) scale(1.15)`,opacity:1,offset:0.4},{transform:`translate(${dx}px,${dy}px) scale(.45)`,opacity:.15}],{duration:SETTINGS.anim88==='quick'?420:700,easing:'cubic-bezier(.3,.7,.4,1)'}); // i18n:skip
  a.onfinish=a.oncancel=()=>el.remove();setTimeout(()=>el.remove(),1500)}
/* the reopened window: its buttons are held a moment (clicks are also swallowed above) */
BUS.on('window.open',d=>{try{if(!d||!cfTitle95(d.title)||performance.now()>=B95.lock)return;
  let n=0;const hold=()=>{const g=document.getElementById('pickgrid');if(!g||!g.children.length){if(++n<12)requestAnimationFrame(hold);return}
    const bs=[...g.querySelectorAll('.btn:not([disabled])')];bs.forEach(b=>{b.disabled=true;b.dataset.hold95='1'});
    setTimeout(()=>{bs.forEach(b=>{if(b.isConnected&&b.dataset.hold95){b.disabled=false;delete b.dataset.hold95}})},Math.max(60,B95.lock-performance.now()))};
  requestAnimationFrame(hold)}catch(e){}});
(()=>{const st=document.createElement('style');st.textContent=`
.fly95{position:fixed;z-index:99999;width:56px;height:60px;display:grid;place-items:center;pointer-events:none;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6))}
.fly95 .rtok{width:48px!important;height:48px!important}.fly95 .cimg.xs{height:58px;width:auto}.fly95 img{max-width:56px}
@keyframes pulse95{0%,100%{box-shadow:0 0 0 0 rgba(240,207,125,0)}35%{box-shadow:0 0 0 3px rgba(240,207,125,.9),0 0 18px rgba(240,207,125,.6)}}
#board .pulse95,.pulse95{animation:pulse95 1.2s ease-out 1;border-radius:6px}
@media (prefers-reduced-motion:reduce){#board .pulse95,.pulse95{animation:none;box-shadow:0 0 0 3px rgba(240,207,125,.9)}}
body.calm #board .pulse95,body.calm .pulse95{animation:none;box-shadow:0 0 0 3px rgba(240,207,125,.9)}`;document.head.appendChild(st)})();

/* ---------- 5 Arena Key tokens in the inventory ---------- */
function keyTokens95(n){const out=[];n=Math.max(0,n|0);for(let i=0;i<Math.floor(n/2);i++)out.push(2);if(n%2)out.push(1);return out}
{const base=boardHTML;boardHTML=function(player){let h=base.apply(this,arguments);
  try{if(typeof h==='string'&&player&&player.keys>0&&h.indexOf('data-key95')<0){const tk=keyTokens95(player.keys);
    const row=tk.map(v=>`<div class="item key95" data-key95="${v}"><span>${typeof rtokHTML==='function'?rtokHTML(v===2?'key2':'key',30,v===2?_T('Arena Key Token (2 keys)'):_T('Arena Key Token (1 key)')):ICO.key}<span><b>${_T('Arena Key Token')}</b><em>${v===2?_T('2 keys · using one flips it to 1 key'):_T('1 key · using it discards the token')}</em></span></span></div>`).join('');
    if(h.indexOf('<div class="items">')>=0)h=h.replace('<div class="items">','<div class="items">'+row);
    else{const at=h.lastIndexOf('</div>');if(at>=0)h=h.slice(0,at)+`<div class="sect">${_T`Hand, offerings & objectives`}</div><div class="items">${row}</div>`+h.slice(at)}}}catch(e){}
  return h}}
(()=>{const st=document.createElement('style');st.textContent=`.item.key95{border:1px solid rgba(214,171,76,.4);background:linear-gradient(90deg,rgba(214,171,76,.10),transparent)}.item.key95 .rtok{margin-right:8px}`;document.head.appendChild(st)})();

/* ---------- 6 Arena Chest swap shows the outgoing card ---------- */
{const base=openChest;openChest=async function(player){const keep=B95.chest;B95.chest=player;try{return await base.apply(this,arguments)}finally{B95.chest=keep}}}
{const base=modal;modal=function(title,body,buttons,opt){
  try{if(B95.chest&&Array.isArray(buttons)&&buttons.some(b=>b&&b.value==='drop')&&buttons.some(b=>b&&(b.value==='R'||b.value==='L'))){const p=B95.chest;
    buttons=buttons.map(b=>{if(!b||(b.value!=='R'&&b.value!=='L'))return b;const w=p['w'+b.value];if(!w||!w.key||!W[w.key]||typeof cardHTML!=='function')return b;
      return {...b,label:`<span class="c95top">${cardHTML('w:'+w.key,'sm')}</span>${b.label}`}})}}catch(e){}
  return base.call(this,title,body,buttons,opt)}}
(()=>{const st=document.createElement('style');st.textContent=`.mbtns .btn .c95top{display:block;text-align:center;margin:0 0 6px}.mbtns .btn .c95top .cimg{float:none;margin:0 auto;display:block}`;document.head.appendChild(st)})();

/* ---------- 7 Focus roll: die art, a column beside the avatar ---------- */
BUS.on('window.open',d=>{try{if(!d||!/Focus roll/.test(String(d.title)))return;let n=0;
  const fit=()=>{const a=document.querySelector('#mBody>.av92 svg'),box=document.getElementById('mBody');if(!a||!box){if(++n<14)setTimeout(fit,70);return}
    const h=a.getBoundingClientRect().height;if(h>40)box.style.setProperty('--fh95',Math.round(h)+'px')};setTimeout(fit,70)}catch(e){}});
(()=>{const st=document.createElement('style');st.textContent=`
#mBody .focdice2{display:flex;flex-direction:column;gap:8px;float:left;width:calc(100% - 178px);min-height:var(--fh95,300px);margin:4px 0 8px;justify-content:stretch;flex-wrap:nowrap}
#mBody .focdice2 .focdie2{flex:1 1 0;display:grid;grid-template-columns:auto 1fr;grid-template-areas:'art name' 'art sub';align-items:center;justify-items:start;column-gap:12px;row-gap:2px;min-width:0;padding:6px 12px;text-align:left}
#mBody .focdie2 .fdface{display:contents}
#mBody .focdie2 .fdface .loc-ic{background-image:url(${assetURL('locdie.jpg')});background-size:600% 100%;grid-area:art;display:block;width:78px;height:78px;border-radius:9px;margin:0;vertical-align:baseline;box-shadow:0 2px 8px rgba(0,0,0,.55),inset 0 0 0 1px rgba(240,207,125,.35)}
#mBody .focdie2 .fdface b{grid-area:name;align-self:end;font-size:14px}
#mBody .focdie2 .fdsub{grid-area:sub;align-self:start}
#mBody .focdie2.best .loc-ic{box-shadow:0 0 12px rgba(240,207,125,.7),inset 0 0 0 2px #f0cf7d}
#mBody>.av92[data-kind="focus"] .av92l path:nth-of-type(2){stroke-width:3.8px;stroke-dasharray:none;stroke-opacity:1;fill-opacity:.3}
#mBody>.av92[data-kind="focus"] .av92l:hover path:nth-of-type(2){fill-opacity:.5}
#mBody #fdHint{clear:both}
@media(max-width:520px){#mBody .focdice2{float:none;width:auto;min-height:0}#mBody .focdice2 .focdie2{flex:none;min-height:68px}#mBody .focdie2 .fdface .loc-ic{width:56px;height:56px}}`;document.head.appendChild(st)})();

/* ---------- 8 "editors unlocked": once ---------- */
function edTold95(){if(lsGet95('flavius_edtold95'))return false;lsSet95('flavius_edtold95','1');return true}

/* ---------- 9 Bestiary: humanoids slay; the tab lives inside Rules & strategy ---------- */
const humanoid95=x=>{if(!x)return false;if(typeof x==='string')return x==='tholo'||x==='commodus';return !!(x.tok&&x.tok.kind==='human')||x.t==='tholo'||x.t==='commodus'};
function ate95(x){return humanoid95(x)?_T('slain'):_T('eaten')}
window.addEventListener('click',async e=>{const b=e.target&&e.target.closest&&e.target.closest('#modal [data-bestiary]');if(!b)return;
  const box=document.getElementById('mBody');if(!box||!box.querySelector('[data-rul]'))return;
  e.stopImmediatePropagation();e.preventDefault();
  try{if(typeof loadBestiary==='function')await loadBestiary()}catch(x){}
  let pane=document.getElementById('rulTab-best95');
  if(!pane){pane=document.createElement('div');pane.id='rulTab-best95';const anchor=box.querySelector('[id^="rulTab-"]');(anchor?anchor.parentNode:box).appendChild(pane);pane.innerHTML=`<div id="menagBody">${bestiaryHTML()}</div>`}
  box.querySelectorAll('[id^="rulTab-"]').forEach(el=>{el.hidden=el!==pane});box.querySelectorAll('[data-rul]').forEach(x=>x.classList.remove('on'));b.classList.add('on')},true);
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('#modal [data-rul]');if(!t)return;
  const pane=document.getElementById('rulTab-best95');if(pane){pane.hidden=true}const bb=document.querySelector('#modal [data-bestiary]');if(bb)bb.classList.remove('on')});
