/* 303-v100bubbles — v1.0 ONE BUBBLE FAMILY (his note 4; spec tools/plans/mock100/NOTES-bubbles.md, mock bubbles.html; answers B1a B2 B3 B4a B5b
   B6a; open picks: phones crowd = glyph only unless zoomed, click = the log line, hover holds). Display only — never S, never onlHash.
   FIVE VARIANTS, one shape language (parchment body, ink text, 14×12 tail whose tip sits on the ANCHOR):
     SPEECH  CPU lines from think() (06-ai → S.bubbles, read only): moods tint the ink (angry red, gift green); THOUGHTS + card quotes = the
             same box, words in italics (B2). Name plate only while 2+ speech/thought bubbles are up; a single one wears the colour dot (B3).
     SHOUT   Flavius / the sponsor (FLAV.line, 16-crowd): gold double rim, display face, beside his box — taken OFF the canvas (B6a).
     WAGER   the bets of 93's wagerWatch (wagerBubble re-pointed): coin or wheat + amount, the only one that drifts up as it fades.
     CHAT    online quick chat (118's onlBubble80 re-pointed, match.say untouched): speech body + a 5 px band in the player's colour, one
             bold line, 6 s; a seat not on the sand → a tab hanging from the board's top edge with the name. 234's ROOM phrase (slot S under
             the seat token) keeps its code, restyled to CHAT here.
     CROWD   stands shouts (16 emote/drawEmotes replaced while on) + city square chatter (172 calls cityBub100): tiny, one line (city 2),
             no name, short tail, the emote as the first glyph INSIDE (no loose emoji); phones show the glyph only unless zoomed.
   WHERE: board voices (speech/thought/shout/wager/chat) live in ONE HTML layer #bb100 (replaces #bubbles + #wbubs) positioned by
     transform only: each bubble is measured ONCE on arrival (and when its plate/size changes), placed after draw() returns, no layout read
     per frame. ZOOMED (ar91Zoomed: CAM.z / S.zoomIn / the duel camera) the layer hides and the same bubbles are painted ON THE BOARD by the
     layer 'bubbles' (order 85, after 'pieces') from cached text pictures (BB100.pics, LRU; re-made only when the zoom has settled, scaled
     while it moves). The crowd always stays on the canvas, same cache.
   PLACEMENT (rule 2/3): slots N → NE → NW → E → W (S only for room seats; Flavius E → W); keep-out = every piece's head box (gladiators,
     beasts, Zora), Flavius's box, the turn chip, the board edge (6 px) and the bubbles already placed (newest first); nothing fits → the
     least-covering slot. keep100(rect,list,pad) is the shared test (172's keep89 list goes through it for the city chatter).
   LIFETIME (rule 7): in .16 s → hold 2 s + 0.05 s a character (≤ 6 s) → fade .3 s; Slow ×1.6; Pause and hover hold; chat 6 s; FAST = no
     bubbles at all (B5b; chat excepted — online has no Fast). Cap (B4a): 3 speakers (speech/thought/chat) + Flavius + wagers (≤4);
     over it thoughts go first, then the oldest speech, chat never early. Clears: turnSweep drops thoughts; event over / clean-up = all.
   Reduce motion / calm / Animations Off = opacity only (120 ms), wagers don't drift. Layer aria-hidden (words are in the log + live region).
   Settings stay the switches: thoughts (THOUGHTS), flavius, shoutsSpect, emotesSpect, cityChatter. Clicking a bubble scrolls the log to its
   line (capture listener on coordinates — the click still reaches the board below). Kill switch localStorage flavius_bubbles100off=1
   → today's bubbles exactly (the city hook returns false). TWEAK: BB100 numbers below. */
const BB100={on:true,ver:0,items:new Map(),seq:1,el:null,S:null,pics:new Map(),picMax:140,cap:3,wgMax:4,fsMin:11,fsMax:15,fsK:0.24,
  hold:2000,perCh:50,holdMax:6000,inMs:160,outMs:300,chatMs:6000,wagerMs:2200,slow:1.6,t:null,turn:null,lastTW:0,zoom:false,
  stats:{place:0,meas:0,pics:0,picHits:0,canvas:0},done:new Set(),rm:false,rmAt:0};
try{if(localStorage.getItem('flavius_bubbles100off')==='1')BB100.on=false}catch(e){}
const BB_TL='<svg class="tl" viewBox="0 0 14 12" aria-hidden="true"><path class="f" d="M0 -2H14V0L7 12L0 0Z"/><path class="s" d="M0 0L7 12L14 0"/></svg>';
/* keep100 — does rect [x,y,w,h] touch any rect of list (pad px apart)? The shared keep-out test (172 city chatter + the board). */
function keep100(r,list,pad=3){for(const k of list)if(r[0]<k[0]+k[2]+pad&&r[0]+r[2]>k[0]-pad&&r[1]<k[1]+k[3]+pad&&r[1]+r[3]>k[1]-pad)return true;return false}
function bbOver(r,list){let a=0;for(const k of list){const w=Math.min(r[0]+r[2],k[0]+k[2])-Math.max(r[0],k[0]),h=Math.min(r[1]+r[3],k[1]+k[3])-Math.max(r[1],k[1]);if(w>0&&h>0)a+=w*h}return a}
const bbFast=()=>typeof SPEED!=='undefined'&&SPEED==='fast';
function bbCalm(){const n=performance.now();if(n-BB100.rmAt>800){BB100.rmAt=n;let r=false;try{r=(typeof reduceMotion==='function'&&reduceMotion())||(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')}catch(e){}BB100.rm=r}return BB100.rm}
const bbFs=()=>Math.max(BB100.fsMin,Math.min(BB100.fsMax,BB100.fsK*(typeof TW!=='undefined'?TW:52)));
function bbZoomed(){try{return typeof ar91Zoomed==='function'?ar91Zoomed():false}catch(e){return false}}
function bbBoard(){const d=window.devicePixelRatio||1;return {W:cv.width/d,H:cv.height/d}}
function bbPhone(){return Math.min(innerWidth,innerHeight)<=520}
function bbLife(it){if(it.v==='ch')return BB100.chatMs;if(it.v==='wg')return BB100.wagerMs;const n=String(it.text||'').length;
  return Math.min(BB100.holdMax,BB100.hold+BB100.perCh*n)*(typeof SPEED!=='undefined'&&SPEED==='slow'?BB100.slow:1)}

/* ---------------- the layer + one element per bubble ---------------- */
function bbLayer(){if(BB100.el&&BB100.el.isConnected)return BB100.el;const wrap=typeof cv!=='undefined'&&cv&&cv.parentElement;if(!wrap)return null;
  const el=document.createElement('div');el.id='bb100';el.setAttribute('aria-hidden','true');wrap.appendChild(el);BB100.el=el;return el}
function bbHTML(it){const nm=it.name?`<span class="nm">${esc(it.name)}</span>`:'';
  if(it.v==='wg')return `<div class="bi"><div class="bd">${it.unit==='cf'?(ICO.wheat||'🌾'):(ICO.coin||'🪙')}<b>${esc(it.text)}</b>${it.unit==='cf'?'<small>CF</small>':''}</div>${BB_TL}</div>`;
  if(it.v==='ch')return `<div class="bi"><div class="bd">${it.far?nm:''}<span class="q">💬</span>${esc(it.text)}</div>${BB_TL}</div>`;
  return `<div class="bi"><div class="bd">${nm}${esc(it.text)}</div>${BB_TL}</div>`}
function bbCls(it){return 'b100 '+(it.v==='sp'?'sp':it.v==='th'?'sp th':it.v)+(it.mood&&it.mood!=='say'&&it.mood!=='think'?' '+it.mood:'')+(it.solo?' solo':'')+(it.far?' far':'')+(it.tp?' tp':'')+' '+(it.slot||'n')+(it.out?' out':'')} // i18n:skip
function bbMake(it){const L=bbLayer();if(!L)return;const el=document.createElement('div');it.el=el;el.className=bbCls(it);
  el.style.setProperty('--pc',it.pc||'#6a5540');el.innerHTML=bbHTML(it);L.appendChild(el);bbMeasure(it)}
/* measured ONCE on arrival (and again only when its plate or text size changed) */
function bbMeasure(it){if(!it.el)return;const fs=bbFs();const mw=it.v==='sh'?240:200;const {W}=bbBoard();const mw2=W<=600?Math.min(150,Math.round(W*0.4),mw):mw;
  it.el.style.setProperty('--fs',(it.v==='wg'?fs-0.5:it.v==='sh'?fs+1:fs).toFixed(1)+'px');it.el.style.setProperty('--mw',mw2+'px');
  it.el.className=bbCls({...it,slot:'n',out:false});const bd=it.el.firstChild.firstChild;it.w=bd.offsetWidth;it.h=bd.offsetHeight;it.fs=fs;it.mfs=fs;it.msolo=it.solo;
  it.el.className=bbCls(it);BB100.stats.meas++;BB100.ver++}

/* ---------------- items ---------------- */
function bbAdd(it){const B=BB100;const now=performance.now();it.born=now;it.end=now+B.inMs+bbLife(it);it.seq=B.seq++;
  const old=B.items.get(it.key);if(old)bbDrop(old);
  if(it.pid!=null)for(const o of [...B.items.values()])if(o.pid===it.pid&&o.v!=='ch'&&o.v!=='wg'&&o!==it)bbDrop(o); /* one bubble per speaker */
  B.items.set(it.key,it);
  /* cap (B4a): 3 speakers + Flavius + wagers; over it the oldest thought goes first, then the oldest speech; chat never early */
  for(;;){const L=[...B.items.values()].filter(o=>o.v==='sp'||o.v==='th'||o.v==='ch');if(L.length<=B.cap)break;
    const x=L.filter(o=>o.v==='th').sort((a,b)=>a.seq-b.seq)[0]||L.filter(o=>o.v==='sp').sort((a,b)=>a.seq-b.seq)[0];if(!x)break;bbDrop(x)}
  const wg=[...B.items.values()].filter(o=>o.v==='wg').sort((a,b)=>a.seq-b.seq);while(wg.length>B.wgMax)bbDrop(wg.shift());
  bbSolo();if(B.items.get(it.key)===it)bbMake(it);bbSchedule();return B.items.get(it.key)===it}
function bbDrop(it){BB100.ver++;if(it.el)it.el.remove();it.el=null;if(BB100.items.get(it.key)===it)BB100.items.delete(it.key);if(it.bid!=null)BB100.done.add(it.bid)}
function bbClear(){for(const it of [...BB100.items.values()])bbDrop(it);BB100.items.clear()}
/* B3: the name plate only while 2+ speech/thought bubbles are up */
function bbSolo(){const sp=[...BB100.items.values()].filter(o=>o.v==='sp'||o.v==='th');const solo=sp.length<2;
  for(const o of sp){if(o.solo!==solo){o.solo=solo;if(o.el)bbMeasure(o)}}}
function bbSchedule(){clearTimeout(BB100.t);if(!BB100.items.size)return;const now=performance.now();let nx=Infinity;
  for(const it of BB100.items.values())nx=Math.min(nx,it.out?it.gone:it.end);BB100.t=setTimeout(bbTick,Math.max(40,Math.min(1000,nx-now+5)))}
function bbTick(){const B=BB100;const now=performance.now();let ch=false;
  if(!S||S!==B.S||S.over||S.clean){if(B.items.size){bbClear();ch=true}B.S=S}
  const fast=bbFast(),pause=typeof SPEED!=='undefined'&&SPEED==='pause';
  for(const it of [...B.items.values()]){
    if(fast&&it.v!=='ch'){bbDrop(it);ch=true;continue}
    if(!it.out&&(pause&&it.v!=='ch'||it.hover))it.end=Math.max(it.end,now+400);
    if(!it.out&&now>=it.end){it.out=true;it.gone=now+(bbCalm()?120:B.outMs);if(it.el)it.el.classList.add('out');if(it.v==='wg')it.gone=now+40}
    else if(it.out&&now>=it.gone){bbDrop(it);ch=true}}
  if(ch){bbSolo();bbPlace()}bbSchedule()}

/* ---------------- anchors + keep-out + slots ---------------- */
function bbHeadAnchor(p){if(!p||p.r==null||p.exited||p.alive===false&&p.cls)return null;const m=center(p.r,p.c);return {x:m.x,y:m.y-TW*0.95}}
function bbHeads(){const R=[];if(!S)return R;const one=q=>{if(!q||q.r==null||q.exited)return;const m=center(q.r,q.c);R.push([m.x-TW*0.18,m.y-TW*0.95,TW*0.36,TW*1.05]) /* TWEAK: the head column (narrower than the base) */};
  for(const p of S.players||[])if(p.alive)one(p);for(const n of S.npcs||[])if(n.alive!==false&&n.hp!==0)one(n);return R}
function bbFlavBox(){try{if(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false)return null;if(bbZoomed())return null;const f=flavXY89();return [f.cx-f.w/2,f.cy-f.h/2,f.w,f.h+TW*0.3]}catch(e){return null}}
function bbTurnChip(){const B=BB100;const now=performance.now();if(B.chip&&now-B.chipAt<2000)return B.chip;B.chipAt=now;
  try{const t=document.getElementById('turnInd');B.chip=t&&t.offsetWidth?[t.offsetLeft,t.offsetTop,t.offsetWidth,t.offsetHeight]:null}catch(e){B.chip=null}return B.chip}
function bbRect(slot,a,w,h){const t=11;switch(slot){case 'ne':return [a.x-18,a.y-t-h,w,h];case 'nw':return [a.x+18-w,a.y-t-h,w,h];
  case 'e':return [a.x+t,a.y-h/2<6?a.y-10:a.y-h/2,w,h];case 'w':return [a.x-t-w,a.y-h/2<6?a.y-10:a.y-h/2,w,h]; /* clamped to the board top (.tp) */case 's':return [a.x-w/2,a.y+t,w,h];default:return [a.x-w/2,a.y-t-h,w,h]}}
const BB_SLOTS={sp:['n','ne','nw','e','w'],th:['n','ne','nw','e','w'],ch:['n','ne','nw','e','w'],wg:['n','ne','nw'],sh:['e','w']};
/* layout — newest first; returns [{it,a,slot,rect}] in board px. dims(it) → {w,h} (measured HTML or the canvas picture) */
function bbLayout(dims,zoomed){const {W,H}=bbBoard();const keep=bbHeads();const fb=bbFlavBox();if(fb)keep.push(fb);const ch=bbTurnChip();if(ch)keep.push(ch);
  const out=[];let farX=W/2;const L=[...BB100.items.values()].sort((a,b)=>(b.v==='sh')-(a.v==='sh')||b.seq-a.seq);
  for(const it of L){const d=dims(it);if(!d||!d.w)continue;let a=it.anchor?it.anchor(zoomed):null;
    if(!a||a.far){const r=[Math.max(6,Math.min(W-6-d.w,farX-d.w/2)),0,d.w,d.h];let k=0;while(keep100(r,out.map(o=>o.rect),2)&&k++<6)r[0]=Math.min(W-6-d.w,r[0]+d.w+8);
      out.push({it,a:{x:r[0]+d.w/2,y:0},slot:'far',rect:r});keep.push(r);continue}
    const slots=BB_SLOTS[it.v]||BB_SLOTS.sp;let best=null,bestA=Infinity;
    for(const s of slots){const aa=s==='w'&&a.box?{x:a.x-a.box,y:a.y}:a; /* the shout's W side is the box's other edge */
      const r=bbRect(s,aa,d.w,d.h);const edge=r[0]<6||r[1]<6||r[0]+r[2]>W-6||r[1]+r[3]>H-6;const ov=bbOver(r,keep)+2*bbOver(r,out.map(o=>o.rect))+(edge?1e6:0); /* TWEAK: covering another bubble counts 3× */
      if(ov===0){best=[s,r,aa];bestA=0;break}if(ov<bestA){bestA=ov;best=[s,r,aa]}}
    out.push({it,a:best[2],slot:best[0],rect:best[1],forced:bestA>0,tp:(best[0]==='e'||best[0]==='w')&&best[2].y-best[1][3]/2<6});keep.push(best[1])}
  return out}

/* ---------------- HTML path (not zoomed): transforms only, after the paint ---------------- */
function bbPlace(){const B=BB100;if(!B.on||!B.items.size)return;
  if(typeof cv==='undefined'||!cv||typeof TW==='undefined')return;const z=bbZoomed();const L=bbLayer();if(!L)return;
  if(z!==B.zoom||L.style.visibility!==(z?'hidden':'')){B.zoom=z;L.style.visibility=z?'hidden':''}if(z)return; /* zoomed: the canvas layer paints them */
  B.stats.place++;const fs=bbFs();
  if(Math.abs(fs-(B.lastFs||fs))>0.05)for(const it of B.items.values())if(it.el)bbMeasure(it);B.lastFs=fs;
  const rm=bbCalm();if(B.el&&B.el.classList.contains('rm')!==rm)B.el.classList.toggle('rm',rm);
  /* nothing moved (camera, pieces, bubbles) → the last placement stands */
  let pk='';for(const q of S.players||[])pk+=q.r+','+q.c+(q.alive?'':'x')+';';for(const n of S.npcs||[])pk+=n.r+','+n.c+';';
  const key=[OX,OY,TW,B.ver,pk,typeof ROT89!=='undefined'?ROT89.k:0].join('|');if(key===B.pkey)return;B.pkey=key;
  const P=bbLayout(it=>it.el?{w:it.w,h:it.h}:null,false);B.lastP=P;
  for(const {it,a,slot,tp} of P){const el=it.el;if(!el)continue;if(it.slot!==slot||!!it.tp!==!!tp){it.slot=slot;it.tp=tp;el.className=bbCls(it)}
    const tr=`translate3d(${Math.round(a.x*2)/2}px,${Math.round(a.y*2)/2}px,0)`;if(it.tr!==tr){it.tr=tr;el.style.transform=tr}}} // i18n:skip

/* ---------------- canvas pictures (zoomed board, crowd, city) ---------------- */
function bbWrap(c,text,mw,lines){const words=String(text).split(/\s+/);const out=[];let ln='';
  for(const w of words){const t=ln?ln+' '+w:w;if(c.measureText(t).width<=mw||!ln)ln=t;else{out.push(ln);ln=w}}if(ln)out.push(ln);
  if(out.length>lines){out.length=lines;let s=out[lines-1];while(s.length>1&&c.measureText(s+'…').width>mw)s=s.slice(0,-1);out[lines-1]=s+'…'}
  for(let i=0;i<out.length;i++){let s=out[i];if(c.measureText(s).width>mw){while(s.length>1&&c.measureText(s+'…').width>mw)s=s.slice(0,-1);out[i]=s+'…'}}return out}
const BB_STY={sp:{lines:3,mw:200},th:{lines:2,mw:200,it:true},sh:{lines:2,mw:240},ch:{lines:1,mw:240},wg:{lines:1,mw:120},cr:{lines:1,mw:120},city:{lines:2,mw:190}};
/* bbPic — a cached picture of one bubble body: {cv,w,h} in CSS px (drawn at the device pixel ratio) */
function bbPic(v,text,o={}){const B=BB100;const dpr=window.devicePixelRatio||1;const fs=Math.round((o.fs||12)*2)/2;
  const key=[v,text,o.name||'',o.pc||'',o.mood||'',fs,o.glyph||'',o.unit||'',dpr].join('|');const hit=B.pics.get(key);if(hit){B.pics.delete(key);B.pics.set(key,hit);B.stats.picHits++;return hit}
  const st=BB_STY[v]||BB_STY.sp;const c=document.createElement('canvas').getContext('2d');const face=v==='sh'?`400 ${fs+1}px "Marcellus SC", Georgia, serif`:`${v==='ch'||v==='wg'?700:v==='cr'||v==='city'?600:500} ${st.it||o.mood==='quote'?'italic ':''}${fs}px "Alegreya Sans", sans-serif`; // i18n:skip
  c.font=face;const mw=(o.mw||st.mw)-16;const t=(o.glyph?o.glyph+' ':'')+(v==='wg'?text+(o.unit==='cf'?' CF':''):text);const lines=o.glyphOnly?[o.glyph]:bbWrap(c,t,mw,st.lines);
  const lh=Math.round(fs*1.28),nf=Math.max(8,fs-3);const plate=o.name?Math.round(nf*1.25):0;const dot=o.dot?10:0;const coin=v==='wg'?fs+4:0;const band=v==='ch'?5:0;
  let tw=0;for(const s of lines)tw=Math.max(tw,c.measureText(s).width);if(plate){c.font=`600 ${nf}px "IBM Plex Mono", monospace`;tw=Math.max(tw,c.measureText(String(o.name).toUpperCase()).width+11)}
  const pad=v==='cr'||v==='city'?6:v==='wg'?7:9;const w=Math.ceil(tw+pad*2+dot+coin+band),h=Math.ceil(lines.length*lh+plate+(v==='cr'||v==='city'?4:8));
  const cvp=document.createElement('canvas');cvp.width=Math.ceil(w*dpr)+2;cvp.height=Math.ceil(h*dpr)+2;const g=cvp.getContext('2d');g.scale(dpr,dpr);g.translate(0.75,0.75);
  const rim=v==='sh'?'#d6ab4c':o.mood==='angry'?'#a3281f':o.mood==='gift'?'#4f7a3a':v==='wg'?'#8a6418':'#7a5a34';const r=v==='wg'?h/2:v==='cr'||v==='city'?6:9;
  const gr=g.createLinearGradient(0,0,0,h);if(v==='sh'){gr.addColorStop(0,'#fff7e2');gr.addColorStop(1,'#f3e2b8')}else if(v==='wg'){gr.addColorStop(0,'#fff3cf');gr.addColorStop(1,'#f0d488')}else{gr.addColorStop(0,'#fbf3e0');gr.addColorStop(1,'#f5ead2')}
  g.beginPath();g.roundRect(0,0,w-1.5,h-1.5,r);g.fillStyle=gr;g.fill();g.lineWidth=v==='sh'?2:v==='cr'||v==='city'?1:1.5;g.strokeStyle=rim;g.stroke();
  if(band){g.save();g.beginPath();g.roundRect(0,0,w-1.5,h-1.5,r);g.clip();g.fillStyle=o.pc||'#c9a24a';g.fillRect(0,0,band,h);g.restore()}
  let x=pad+band,y=(v==='cr'||v==='city'?2:4);
  if(plate){g.font=`600 ${nf}px "IBM Plex Mono", monospace`;g.fillStyle=o.pc||'#6a5540';g.beginPath();g.arc(x+3.5,y+nf*0.6,3.5,0,Math.PI*2);g.fill();g.fillStyle='#3a2a18';g.textBaseline='top';g.fillText(String(o.name).toUpperCase(),x+11,y+1);y+=plate}
  if(dot){g.fillStyle=o.pc||'#6a5540';g.beginPath();g.arc(x+3.5,y+lh/2,3.5,0,Math.PI*2);g.fill();x+=dot}
  if(coin){g.fillStyle=o.unit==='cf'?'#b88a2a':'#e2b23e';g.beginPath();g.arc(x+coin/2-2,h/2-0.75,coin/2-2,0,Math.PI*2);g.fill();g.strokeStyle='#7a5a14';g.lineWidth=1;g.stroke();x+=coin}
  g.font=face;g.fillStyle=v==='sh'?'#2a1a08':'#241910';g.textBaseline='top';for(const s of lines){g.fillText(s,x,y+(lh-fs)/2);y+=lh}
  const P={cv:cvp,w,h,fs};B.pics.set(key,P);B.stats.pics++;if(B.pics.size>B.picMax)B.pics.delete(B.pics.keys().next().value);return P}
/* the tail on the canvas: a wedge from the body edge to the anchor */
function bbTail(c2,slot,a,r,rim,k=1){if(slot==='far')return;const s=6*k;c2.beginPath();
  if(slot==='e'){c2.moveTo(r[0]+1,a.y-s);c2.lineTo(a.x,a.y);c2.lineTo(r[0]+1,a.y+s)}else if(slot==='w'){c2.moveTo(r[0]+r[2]-2,a.y-s);c2.lineTo(a.x,a.y);c2.lineTo(r[0]+r[2]-2,a.y+s)}
  else if(slot==='s'){c2.moveTo(a.x-s,r[1]+1);c2.lineTo(a.x,a.y);c2.lineTo(a.x+s,r[1]+1)}else{const by=r[1]+r[3]-2;c2.moveTo(a.x-s,by);c2.lineTo(a.x,a.y);c2.lineTo(a.x+s,by)}
  c2.closePath();c2.fillStyle='#f5ead2';c2.fill();c2.strokeStyle=rim;c2.lineWidth=1.2;c2.stroke()}
function bbItemPic(it,fs){const name=it.v==='sh'?(it.name||''):(it.v==='sp'||it.v==='th')&&!it.solo?it.name:it.v==='ch'&&it.far?it.name:'';
  return bbPic(it.v,it.text,{fs:it.v==='wg'?fs-0.5:fs,name,pc:it.pc,mood:it.mood,dot:(it.v==='sp'||it.v==='th')&&it.solo,unit:it.unit})}
/* the zoomed board layer: same bubbles, painted after the pieces */
function bbCanvasLayer(){const B=BB100;if(!B.on||!B.items.size||!bbZoomed()||bbFast()&&![...B.items.values()].some(o=>o.v==='ch'))return;
  const fs=bbFs();const moving=Math.abs(TW-B.lastTW)>0.01;B.lastTW=TW;const now=performance.now();
  if(!moving)B.picFs=fs;const pf=B.picFs||fs;
  const P=bbLayout(it=>{const p=bbItemPic(it,pf);const k=fs/pf;return {w:p.w*k,h:p.h*k,p}},true);B.lastP=P;B.stats.canvas++;
  for(const {it,a,slot,rect} of P){const p=bbItemPic(it,pf);const k=fs/pf;const age=now-it.born;let al=Math.min(1,age/BB100.inMs);if(it.out)al*=Math.max(0,(it.gone-now)/BB100.outMs);if(it.v==='wg')al*=Math.max(0,Math.min(1,(it.end-now)/600+0.3));
    if(al<=0)continue;ctx.save();ctx.globalAlpha=al;ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=6;ctx.shadowOffsetY=2;ctx.drawImage(p.cv,rect[0],rect[1],p.cv.width/(window.devicePixelRatio||1)*k,p.cv.height/(window.devicePixelRatio||1)*k);ctx.shadowColor='transparent';
    bbTail(ctx,slot,a,rect,it.v==='sh'?'#d6ab4c':it.mood==='angry'?'#a3281f':it.mood==='gift'?'#4f7a3a':'#7a5a34');ctx.restore()}}

/* ---------------- the CROWD: stands shouts (canvas) ---------------- */
function bbCrowd(){if(!S||!S.emotes||!S.emotes.length)return;const now=performance.now();const life=SPEED==='fast'?1400:SPEED==='slow'?4200:2600;
  S.emotes=S.emotes.filter(e=>now-e.t0<life);if(bbFast())return;const z=bbZoomed();const phone=bbPhone()&&!z;const calm=bbCalm();
  const fs=Math.max(9.5,bbFs()-2);const keep=[];const fb=bbFlavBox();if(fb)keep.push(fb);const ch=bbTurnChip();if(ch)keep.push(ch);
  for(const e of S.emotes){const sp=S.spect.find(x=>x.id===e.sid);if(!sp||sp._x==null)continue;const k=(now-e.t0)/life;const g=e.g100||'';
    if(phone&&!g)continue;const p=bbPic('cr',phone?'':e.text,{fs,glyph:g,glyphOnly:phone});
    const ax=sp._x,ay=sp._y-TW*(0.5+(calm?0:k*0.2));let r=[ax-p.w/2,ay-8-p.h,p.w,p.h];let n=0;while(keep100(r,keep,2)&&n++<4)r=[r[0],r[1]-p.h*1.1,r[2],r[3]];keep.push(r);
    ctx.save();ctx.globalAlpha=k>0.75?(1-k)/0.25:Math.min(1,(now-e.t0)/160);ctx.drawImage(p.cv,r[0],r[1],p.cv.width/(window.devicePixelRatio||1),p.cv.height/(window.devicePixelRatio||1));
    if(n===0)bbTail(ctx,'n',{x:ax,y:ay},r,'#7a5a34',0.7);ctx.restore()}}
/* the CITY square chatter (172 calls this; false = draw the old chips) */
function cityBub100(c2,say,keep89,T,W,H){if(!BB100.on)return false;const fs=Math.max(10,Math.round(T*0.2));
  for(const [s,p] of say){const P=bbPic('city',s,{fs});const bx=Math.max(4,Math.min(W-P.w-4,p.x-P.w/2));const a={x:p.x,y:p.y-T*1.2};
    let by=a.y-8-P.h;for(const d of [0,-1,-2,-3,1,2,3,-4,4,-5,5]){const y=a.y-8-P.h+d*P.h*1.1;if(y>2&&y+P.h<H-2&&!keep100([bx,y,P.w,P.h],keep89,3)){by=y;break}}
    const r=[bx,by,P.w,P.h];keep89.push(r);c2.save();c2.drawImage(P.cv,bx,by,P.cv.width/(window.devicePixelRatio||1),P.cv.height/(window.devicePixelRatio||1));
    if(Math.abs(by-(a.y-8-P.h))<1&&a.x>bx+6&&a.x<bx+P.w-6){const cx=c2;cx.beginPath();cx.moveTo(a.x-4,by+P.h-2);cx.lineTo(a.x,a.y);cx.lineTo(a.x+4,by+P.h-2);cx.closePath();cx.fillStyle='#f5ead2';cx.fill();cx.strokeStyle='#7a5a34';cx.lineWidth=1;cx.stroke()}
    c2.restore()}return true}

/* ---------------- wiring (each wrapper checks BB100.on live; the kill switch leaves them all on the old path) ---------------- */
if(BB100.on){
  /* speech + thoughts: S.bubbles stays the source; renderBubbles now only syncs our items */
  {const base=renderBubbles;renderBubbles=function(){if(!BB100.on||HEADLESS)return base.apply(this,arguments);try{bbSync()}catch(e){console.error(e)}}}
  /* placement after every paint (the layer reads only cached sizes; writes transforms) */
  {const base=draw;draw=function(){const r=base.apply(this,arguments);if(BB100.on&&BB100.items.size&&!HEADLESS){try{bbPlace()}catch(e){}}return r}}
  /* Flavius's line: off the canvas, onto the layer (B6a) */
  {const base=drawFlavius;drawFlavius=function(){if(!BB100.on||HEADLESS||!S)return base.apply(this,arguments);const ln=FLAV.line,lu=FLAV.lineUntil;
    if(ln&&performance.now()<lu&&!(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false)&&!bbFast()){const it=BB100.items.get('flav');if(!it||it.text!==ln||it.out)bbFlavAdd(ln)}
    FLAV.line='';try{return base.apply(this,arguments)}finally{FLAV.line=ln;FLAV.lineUntil=lu}}}
  /* wagers */
  if(typeof wagerBubble==='function'){const base=wagerBubble;wagerBubble=function(x,y,amt,unit,who){if(!BB100.on||HEADLESS)return base.apply(this,arguments);if(bbFast()||!S)return;
    const bx=(x-OX)/TW,by=(y-OY)/TW;bbAdd({key:'wg'+BB100.seq,v:'wg',text:String(amt),unit,who,anchor:()=>({x:OX+bx*TW,y:OY+by*TW})})}}
  /* online quick chat */
  if(typeof onlBubble80==='function'){const base=onlBubble80;onlBubble80=function(seat,q){if(!BB100.on||HEADLESS)return base.apply(this,arguments);if(!S)return;
    const p=S.players[seat];const on=p&&p.alive&&!p.exited&&p.r!=null;const nm=onlSeatName80(seat);
    bbAdd({key:'ch'+seat,v:'ch',text:onlQ80(q),name:nm,far:!on,pc:p&&p.color||'#c9a24a',seat,anchor:z=>{const a=on&&p.alive&&!p.exited?bbHeadAnchor(p):null;return a||{far:true}}});
    if(S.over&&CUR_MODAL)onlToast80(`💬 <b>${esc2(nm)}</b>: ${esc2(onlQ80(q))}`)}}
  /* clears: the turn sweep takes the thoughts; the event's end takes everything */
  if(typeof turnSweep==='function'){const base=turnSweep;turnSweep=function(){const r=base.apply(this,arguments);try{if(BB100.on){for(const it of [...BB100.items.values()])if(it.v==='th')bbDrop(it);bbSolo();bbPlace()}}catch(e){}return r}}
  /* the crowd: one glyph inside, no loose emoji */
  {const base=emote;emote=function(sp,emo,text=''){const r=base.apply(this,arguments);try{if(BB100.on&&S&&S.emotes&&sp){const e=S.emotes.find(x=>x.sid===sp.id);if(e&&!e.g100)e.g100=emo||sp.lastEmo||''}}catch(e){}return r}}
  {const base=drawEmotes;drawEmotes=function(){if(!BB100.on)return base.apply(this,arguments);try{bbCrowd()}catch(e){}}}
  /* the zoomed board layer, after the pieces */
  if(typeof LAYERS93!=='undefined'){const i=LAYERS93.defs.findIndex(d=>d[0]==='pieces');if(i>=0&&!LAYERS93.byName.bubbles){LAYERS93.defs.splice(i+1,0,['bubbles',85]);
    LAYERS93.byName.bubbles={name:'bubbles',order:85,cached:false,sub:[],key:()=>null,off:()=>LAYERS93.dbg.has('bubbles')}}}
  {const base=drawLayers93;drawLayers93=function(layers){if(BB100.on&&Array.isArray(layers)&&!HEADLESS){const i=layers.findIndex(l=>l&&l[0]==='pieces');
      if(i>=0)layers=[...layers.slice(0,i+1),['bubbles',()=>{try{bbCanvasLayer()}catch(e){}}],...layers.slice(i+1)]}return base.call(this,layers)}}
}
/* BB100.set(on) — dev/tests: switch the family off/on at runtime (off = the old renderBubbles/wager/chat/Flavius paths) */
BB100.set=function(on){bbClear();BB100.done.clear();BB100.on=!!on;if(BB100.el)BB100.el.textContent='';try{draw()}catch(e){}};
function bbSync(){const B=BB100;if(!S){bbClear();return}if(S!==B.S){bbClear();B.S=S;B.done.clear()}
  if(S.over||S.clean){if(B.items.size)bbClear();return}if(bbFast())return;
  const now=Date.now();let add=false;
  for(const b of S.bubbles||[]){const k='b'+b.id;if(B.items.has(k)||B.done.has(b.id))continue;const p=S.players[b.pid];if(!p)continue;
    const v=b.mood==='think'?'th':'sp';const probe={v,text:b.text};if(now-b.at>bbLife(probe)){B.done.add(b.id);continue}
    bbAdd({key:k,bid:b.id,v,mood:b.mood,text:b.text,name:p.name,pc:p.color,pid:b.pid,anchor:()=>bbHeadAnchor(S.players[b.pid])||{far:true}});add=true}
  if(add)bbPlace()}
function bbFlavAdd(ln){const sp=typeof curSponsor==='function'?(()=>{try{return curSponsor()}catch(e){return null}})():null;
  bbAdd({key:'flav',v:'sh',text:ln,name:sp&&(sp.short||sp.name)||'Flavius',pc:'#d6ab4c',anchor:z=>{if(z)return {far:true};const f=flavXY89();return {x:f.cx+f.w/2+2,y:f.cy-f.h*0.15,box:f.w+4}}})}

/* hover holds · click scrolls the log to the bubble's line (coordinates only — the click still reaches the board) */
function bbHit(e){const P=BB100.lastP;if(!P||!P.length||typeof cv==='undefined'||!cv)return null;const R=cv.getBoundingClientRect();const x=e.clientX-R.left,y=e.clientY-R.top;
  for(const o of P)if(x>=o.rect[0]&&x<=o.rect[0]+o.rect[2]&&y>=o.rect[1]&&y<=o.rect[1]+o.rect[3])return o.it;return null}
if(BB100.on){
  document.addEventListener('pointermove',e=>{if(!BB100.items.size||e.pointerType==='touch')return;if(!e.target.closest||!e.target.closest('.canvas-wrap'))return;const h=bbHit(e);
    for(const it of BB100.items.values()){const v=it===h;if(it.hover!==v){it.hover=v;if(v&&it.out&&it.el){it.out=false;it.el.classList.remove('out')}if(v)it.end=Math.max(it.end,performance.now()+400)}}},{passive:true});
  document.addEventListener('click',e=>{if(!BB100.items.size||!e.target.closest||!e.target.closest('.canvas-wrap'))return;const it=bbHit(e);if(!it)return;
    try{const want=String(it.text).slice(0,24);const li=[...document.querySelectorAll('#log li')].find(l=>l.textContent.includes(want)||it.name&&l.textContent.includes(it.name));
      if(li){li.scrollIntoView({block:'nearest',behavior:bbCalm()?'auto':'smooth'});li.classList.remove('bb100hit');void li.offsetWidth;li.classList.add('bb100hit')}}catch(err){}},true);
}

(()=>{const st=document.createElement('style');st.textContent=`
#bb100{position:absolute;inset:0;pointer-events:none;z-index:3;overflow:hidden;contain:layout style}
body.chromeoff #bb100{visibility:hidden}
#bb100 .b100{position:absolute;left:0;top:0;width:0;height:0;--fs:12.5px;--mw:200px;--parch:#f5ead2;--ink:#241910;--inkl:#7a5a34;--rim:#d6ab4c;--rimk:#5a3c10;will-change:transform;transition:opacity .3s}
#bb100 .b100 .bi{position:absolute;left:0;top:0}
#bb100 .b100 .bd{position:absolute;width:max-content;max-width:var(--mw);padding:4px 9px 5px;border-radius:9px;box-sizing:border-box;
  background:linear-gradient(#fbf3e0,var(--parch));color:var(--ink);border:1.5px solid var(--inkl);
  font:500 var(--fs)/1.28 var(--body);box-shadow:0 3px 10px #0000006b,0 1px 0 #ffffff80 inset;
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--lines,3);overflow:hidden;animation:in100 .16s ease-out both}
#bb100 .b100 .nm{display:block;font:600 calc(var(--fs) - 3px)/1.15 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:color-mix(in srgb,var(--pc,#6a5540) 72%,#241910);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:1px}
#bb100 .b100 .nm::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--pc,#6a5540);margin-right:4px;vertical-align:1px;box-shadow:0 0 0 1px #0004}
#bb100 .b100 .tl{position:absolute;width:14px;height:12px;left:-7px;top:-12px;overflow:visible}
#bb100 .b100 .tl path.f{fill:var(--parch)}#bb100 .b100 .tl path.s{fill:none;stroke:var(--inkl);stroke-width:1.5;stroke-linejoin:round}
#bb100 .b100.n .bd{left:0;bottom:11px;transform:translateX(-50%)}
#bb100 .b100.ne .bd{left:-18px;bottom:11px}
#bb100 .b100.nw .bd{right:-18px;bottom:11px}
#bb100 .b100.e .bd{left:11px;top:0;transform:translateY(-50%)}
#bb100 .b100.w .bd{right:11px;top:0;transform:translateY(-50%)}
#bb100 .b100.s .bd{left:0;top:11px;transform:translateX(-50%)}
#bb100 .b100.e.tp .bd,#bb100 .b100.w.tp .bd{transform:none;top:-10px}
#bb100 .b100.e .tl{transform:rotate(90deg);left:-1px;top:-6px}
#bb100 .b100.w .tl{transform:rotate(-90deg);left:-13px;top:-6px}
#bb100 .b100.s .tl{transform:rotate(180deg);top:0}
#bb100 .b100.far .tl{display:none}#bb100 .b100.far .bd{left:0;top:0;bottom:auto;transform:translateX(-50%);border-radius:0 0 8px 8px;border-top:0}
#bb100 .b100.out{opacity:0}#bb100 .b100.sh{z-index:2}#bb100 .b100.ch{z-index:1}
@keyframes in100{from{opacity:0;translate:0 4px;scale:.94}to{opacity:1;translate:0 0;scale:1}}
@keyframes in100o{from{opacity:0}to{opacity:1}}
#bb100 .b100.angry .bd{border-color:#a3281f;color:#a3281f}#bb100 .b100.angry .tl path.s{stroke:#a3281f}
#bb100 .b100.gift .bd{border-color:#4f7a3a;color:#3d6a2a}#bb100 .b100.gift .tl path.s{stroke:#4f7a3a}
#bb100 .b100.quote .bd,#bb100 .b100.th .bd{font-style:italic}#bb100 .b100.th .nm{font-style:normal}
#bb100 .b100.sp{--lines:3}#bb100 .b100.th{--lines:2}
#bb100 .b100.solo .nm{display:none}
#bb100 .b100.solo .bd::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--pc,#6a5540);margin-right:5px;vertical-align:1px;box-shadow:0 0 0 1px #0004}
#bb100 .b100.sh{--lines:2}
#bb100 .b100.sh .bd{background:linear-gradient(#fff7e2,#f3e2b8);border:2px solid var(--rim);box-shadow:0 0 0 1px var(--rimk),0 4px 12px #00000080,0 1px 0 #fff inset;
  font:400 var(--fs)/1.22 var(--display);letter-spacing:.02em;color:#2a1a08;padding:4px 10px 5px}
#bb100 .b100.sh .nm{font-family:var(--mono);color:#8a6418}#bb100 .b100.sh .nm::before{background:var(--rim)}
#bb100 .b100.sh .tl path.f{fill:#f6e8c4}#bb100 .b100.sh .tl path.s{stroke:var(--rim);stroke-width:2}
#bb100 .b100.wg .bd{display:flex;align-items:center;gap:3px;padding:1px 8px 1px 2px;border-radius:999px;border:1.5px solid #8a6418;
  background:linear-gradient(#fff3cf,#f0d488);font:700 var(--fs)/1.2 var(--mono);color:#2a1c06;box-shadow:0 2px 7px #0007}
#bb100 .b100.wg .bd img,#bb100 .b100.wg .bd svg,#bb100 .b100.wg .bd .ico{width:17px;height:17px;flex:none}
#bb100 .b100.wg .bd small{font-size:9px;font-weight:600;color:#6b4a12}
#bb100 .b100.wg .tl{width:10px;height:8px;left:-5px;top:-8px}#bb100 .b100.wg.n .bd,#bb100 .b100.wg.ne .bd,#bb100 .b100.wg.nw .bd{bottom:7px}
#bb100 .b100.wg .tl path.s{stroke:#8a6418}
#bb100 .b100.wg .bi{animation:rise100 2.2s ease-out forwards}
@keyframes rise100{0%,70%{translate:0 0;opacity:1}100%{translate:0 -10px;opacity:0}}
#bb100 .b100.ch .bd{border-left:5px solid var(--pc);padding-left:7px;font-weight:700;--lines:1;white-space:nowrap;display:block;text-overflow:ellipsis}
#bb100 .b100.ch .bd .q{display:inline-block;margin-right:4px;font-size:.9em;opacity:.75}
#bb100 .b100.ch.far .bd .nm{display:inline;margin-right:6px}
#bb100.rm .b100 .bd{animation:in100o .12s linear both}#bb100.rm .b100.wg .bi{animation:none}#bb100.rm .b100{transition:opacity .12s}
body.calm #bb100 .b100 .bd{animation:in100o .12s linear both}body.calm #bb100 .b100.wg .bi{animation:none}
body.onlarena #bb100 .b100.wg{display:none}
#log li.bb100hit{outline:2px solid #d6ab4c;outline-offset:-2px;transition:outline-color .6s}
/* 234's ROOM phrase (slot S under the seat token) in the CHAT look */
#onl .r96 .r96-bub i,#onl .r96 .r96-lb i{background:linear-gradient(#fbf3e0,#f5ead2)!important;color:#241910!important;border:1.5px solid #7a5a34;border-left:5px solid #c9a24a;border-radius:9px!important;font-weight:700;box-shadow:0 3px 10px #0000006b!important}
#onl .r96 .r96-bub i::before{border-bottom-color:#7a5a34!important;top:-6px!important}`;
if(BB100.on)document.head.appendChild(st)})();
