/* =====================================================================
   220-V93A11Y · v0.93 ACCESSIBILITY PASS (his yes 2026-10-07, §8 "v0.93 ALSO" A)
   =====================================================================
   1. KEYBOARD ON THE SAND: the board canvas takes focus (Tab). Arrow keys move a gold tile cursor in SCREEN directions
      (the view may be turned, 168-v89rotate): ↑ up-right, → down-right, ↓ down-left, ← up-left — the four grid neighbours
      as they sit on screen. Enter / Space = a click on that tile (a real click event on the canvas at the tile's centre,
      so pick/onTile and every guard see the same path as the mouse). Escape = back to Move (cancels an attack/push/
      topple/tunnel mode). I = read the board aloud (summary). The cursor shows only while the keyboard drives the board
      (a mouse click never draws it; Space still pauses unless the arrows were used since the last pointer).
      Hotkeys kept: X see-through, S stands, B Bestiary, T stands hub, M mute, H hints, C words (menu), Space pause.
   2. WINDOWS: every open dialog (#modal's #mboxEl, ask76/verAsk popups, [role=dialog][aria-modal], [role=alertdialog]
      such as #tab92) takes focus when it opens (primary button, else the first control that is not a text field),
      Tab / Shift+Tab are trapped inside the top one (the lesson coach #mtutCoach/#tutCoach stays reachable), focus goes
      back to the opener when it closes. When a window redraws under a keyboard user, focus returns to the same control.
   3. SCREEN READERS: a polite live region (#a11yLive93) speaks turn changes, important log lines (big/bad) and the
      cursor's tile; a hidden region (#a11ySum93) holds the board summary (whose turn, phase, every gladiator's tile +
      HP/AP by location, beasts and which are in reach). Icon-only buttons/chips get an aria-label from their title,
      data-tip or a small icon dictionary (a debounced MutationObserver over added nodes).
   4. FOCUS RINGS: one gold :focus-visible ring everywhere (mouse focus never shows it).
   5. CONTRAST (WCAG AA): a few muted text tones lifted (CON93 below) — measured by tools/tests/tv93a.js.
   Off: nothing to switch; none of it draws unless the keyboard is used. Phones: no change (no ring without a keyboard).
   Test: tv93a.
   ===================================================================== */
const A93={kbd:false,cur:null,stack:[],last:null,sig:null,liveQ:[],liveT:0,sumT:0};
/* ---------- styles: the ring, visually hidden helpers, contrast lifts ---------- */
{const st=document.createElement('style');st.id='a11y93css';st.textContent=`
:focus-visible{outline:2px solid #f2c75c!important;outline-offset:2px!important;box-shadow:0 0 0 4px rgba(20,12,4,.85)!important}
#cv:focus{outline:none}#cv:focus-visible{outline:2px solid #f2c75c!important;outline-offset:-3px!important;box-shadow:none!important}
.sr93{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important;border:0!important}
.sr93f:focus{position:fixed!important;left:12px!important;top:12px!important;width:auto!important;height:auto!important;clip:auto!important;padding:6px 10px!important;margin:0!important;z-index:99999;background:#2a1d10;color:#f6e7c8;border:1px solid #f2c75c!important;border-radius:6px;white-space:normal!important}
.mbox:focus,.verask:focus,[role="dialog"]:focus,[role="alertdialog"]:focus{outline:none}
:root{--dim:#a3907a}
`;document.head.appendChild(st)}
/* ---------- the live region, the board summary, the skip button ---------- */
function a11yNodes93(){if(document.getElementById('a11yLive93'))return;
  const live=document.createElement('div');live.id='a11yLive93';live.className='sr93';live.setAttribute('aria-live','polite');live.setAttribute('role','status');document.body.appendChild(live);
  const sum=document.createElement('div');sum.id='a11ySum93';sum.className='sr93';sum.setAttribute('role','region');sum.setAttribute('aria-label',_T('Board summary'));document.body.appendChild(sum);
  if(typeof cv!=='undefined'&&cv){cv.tabIndex=0;cv.setAttribute('role','application');cv.setAttribute('aria-roledescription',_T('arena board'));
    cv.setAttribute('aria-label',_T('The arena. Arrow keys move the cursor, Enter or Space picks the tile, Escape goes back to Move, I reads the board.'));
    const b=document.createElement('button');b.type='button';b.id='a11ySumBtn93';b.className='sr93 sr93f';b.textContent=_T('Read the board (I)');
    b.addEventListener('click',()=>a11yRead93());cv.insertAdjacentElement('afterend',b)}}
/* a11ySay93 — queue words for the polite live region (merged, spoken once per ~0.6 s). */
function a11ySay93(t,now){if(HEADLESS||!t)return;t=String(t).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();if(!t)return;
  const live=document.getElementById('a11yLive93');if(!live)return;if(now){A93.liveQ=[];live.textContent='';setTimeout(()=>{live.textContent=t.slice(0,900)},30);return}
  A93.liveQ.push(t);if(A93.liveT)return;A93.liveT=setTimeout(()=>{A93.liveT=0;const s=A93.liveQ.join(' · ').slice(0,600);A93.liveQ=[];live.textContent=s},600)}
const a11yLocN93=l=>({head:_T('head'),chest:_T('chest'),rarm:_T('right arm'),larm:_T('left arm'),rleg:_T('right leg'),lleg:_T('left leg')}[l]||l);
/* a11yInReach93 — beasts the gladiator can reach this turn: next to a tile he can walk to (or to him). */
function a11yInReach93(p){const out=[];try{if(!p||p.r==null)return out;const ok=new Set([p.r*N+p.c]);
    try{for(const [k,c] of reach(p).tiles)if(c<=(p.mv||0))ok.add(k)}catch(e){}
    for(const n of S.npcs||[]){if(!n.alive||n.r==null)continue;let near=false;for(const k of ok){const r=Math.floor(k/N),c=k%N;if(Math.max(Math.abs(r-n.r),Math.abs(c-n.c))<=1){near=true;break}}if(near)out.push(n)}}catch(e){}return out}
/* a11ySummary93 — the board in words: event, round, phase, whose turn, every gladiator (tile, HP/AP by location, CF), beasts. */
function a11ySummary93(){if(!S||!S.players)return _T('No event on the sand.');const L=[];
  try{const ev=EV();const p=cur();L.push(_T`${ev?ev.n||ev.name||'':''} · round ${(S.ri||0)+1}${S.over?_T(' · the event is over'):''}`);
    if(p&&!S.over)L.push(_T`${p.name}'s turn${p.cpu?_T(' (CPU)'):''} · phase: ${S.phase||''}`);
    for(const q of S.players){if(!q)continue;if(!q.alive){L.push(_T`${q.name}: out`);continue}
      const locs=(typeof LOCS!=='undefined'?LOCS:['head','chest','rarm','larm','rleg','lleg']).map(l=>`${a11yLocN93(l)} ${q.hp[l]}${q.ap&&q.ap[l]?'+'+q.ap[l]+' AP':''}`).join(', ');
      L.push(_T`${q.name}${q.cpu?'':_T(' (you)')} on ${q.r!=null?tl(q.r,q.c):'—'}: ${locs}; CF ${q.cf||0}, coin ${q.coin||0}`)}
    const bs=(S.npcs||[]).filter(n=>n.alive&&n.r!=null);
    if(bs.length){const near=new Set(p&&!p.cpu?a11yInReach93(p):[]);L.push(_T`Beasts: ${bs.map(n=>`${typeof nm==='function'?nm(n):n.name} ${n.hp} HP on ${tl(n.r,n.c)}${near.has(n)?_T(' — in reach'):''}`).join('; ')}`)}
    else L.push(_T('No beasts on the sand.'))}catch(e){L.push(_T('The board could not be read.'))}
  return L.join('. ')}
function a11ySumUpd93(){const el=document.getElementById('a11ySum93');if(el){const t=a11ySummary93();if(el.textContent!==t)el.textContent=t}}
/* a11yRead93 — the I key / the hidden button: refresh the panel and speak it. */
function a11yRead93(){a11ySumUpd93();a11ySay93(a11ySummary93(),true)}
/* ---------- the tile cursor ---------- */
function a11yCurInit93(){if(A93.cur&&inB(A93.cur.r,A93.cur.c))return;const p=S&&cur&&cur();A93.cur=p&&p.r!=null?{r:p.r,c:p.c}:{r:Math.floor(N/2),c:Math.floor(N/2)}}
/* a11yMove93 — the neighbour whose screen offset best matches the arrow (skewed a quarter turn so each arrow has one tile). */
const A93_DIR={ArrowUp:[0.35,-1],ArrowRight:[1,0.35],ArrowDown:[-0.35,1],ArrowLeft:[-1,-0.35]};
function a11yNext93(key,from){const d=A93_DIR[key];if(!d||!from)return null;const {r,c}=from;const o=center(r,c);let best=null,bs=-1e9;
  for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const nr=r+dr,nc=c+dc;if(!inB(nr,nc))continue;const q=center(nr,nc);const vx=q.x-o.x,vy=q.y-o.y;const len=Math.hypot(vx,vy)||1;
    const s=(vx*d[0]+vy*d[1])/len;if(s>bs){bs=s;best={r:nr,c:nc}}}
  return best&&bs>0?best:null}
function a11yMove93(key){a11yCurInit93();const n=a11yNext93(key,A93.cur);if(n)A93.cur=n;a11yShowCur93(true)}
function a11yShowCur93(say){const t=A93.cur;if(!t)return;try{hoverTile={r:t.r,c:t.c};const h=document.getElementById('hover');if(h)h.innerHTML=describeTile(hoverTile)+(typeof ruleForTile==='function'?ruleForTile(hoverTile):'');draw()}catch(e){}
  if(say){let x='';try{x=describeTile(t);const hl=HL.get(t.r*N+t.c);if(hl)x+=' · '+({move:_T('you can move here'),atk:_T('you can attack here'),push:_T('you can push here'),topple:_T('you can topple this pillar'),tunnel:_T('tunnel exit')}[hl.t]||_T('you can act here'))}catch(e){}a11ySay93(x,true)}}
/* a11yPick93 — Enter/Space: a click on the canvas at the tile's centre (same path as the mouse); onTile if the point misses. */
function a11yPick93(){a11yCurInit93();const {r,c}=A93.cur;const b=cv.getBoundingClientRect();const m=center(r,c);const x=b.left+m.x,y=b.top+m.y;
  let hit=null;try{hit=pick({clientX:x,clientY:y})}catch(e){}
  if(hit&&hit.r===r&&hit.c===c)cv.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,view:window}));
  else{hoverTile={r,c};onTile(r,c)}}
/* the cursor on the canvas: a gold double diamond, only while the keyboard drives the board */
{const base=draw;draw=function(){const r=base.apply(this,arguments);try{if(A93.kbd&&A93.cur&&document.activeElement===cv&&S&&!S.over&&inB(A93.cur.r,A93.cur.c)){
    const dpr=window.devicePixelRatio||1;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);tilePath(A93.cur.r,A93.cur.c,0);ctx.lineWidth=4;ctx.strokeStyle='rgba(20,12,4,.9)';ctx.stroke();
    tilePath(A93.cur.r,A93.cur.c,2);ctx.lineWidth=2.5;ctx.strokeStyle='#f2c75c';ctx.setLineDash([6,3]);ctx.stroke();ctx.restore()}}catch(e){}return r}}
/* board keys (on the canvas itself, so window hotkeys only lose the keys the board uses) */
function a11yBoardKey93(e){if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;
  if(A93_DIR[k]){e.preventDefault();e.stopPropagation();A93.kbd=true;a11yMove93(k);return}
  if((k==='Enter'||k===' ')&&A93.kbd){e.preventDefault();e.stopPropagation();a11yPick93();return}
  if(k==='Escape'){if(S&&!S.over&&S.phase==='action'&&typeof humanTurn==='function'&&humanTurn()){const p=cur();if(S.mode!=='move'||p.focusRoll){e.preventDefault();e.stopPropagation();S.mode='move';if(p.focusRoll)p.focusRoll=false;try{render();draw()}catch(er){}a11ySay93(_T('Back to Move.'),true)}}return}
  if(k==='i'||k==='I'){e.preventDefault();e.stopPropagation();a11yRead93()}}
/* ---------- windows: focus in, trap, focus back ---------- */
const A93_FOC='a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';
const a11yVis93=e=>!!e&&e.isConnected&&e.getClientRects().length>0&&!e.closest('[hidden],[aria-hidden="true"]')&&(!e.checkVisibility||e.checkVisibility({visibilityProperty:true}));
function a11yDlgs93(){return [...document.querySelectorAll('[role="dialog"][aria-modal="true"],[role="alertdialog"]')].filter(a11yVis93)}
/* the top dialog: a popup over the big window wins (they are appended later), else #mboxEl */
function a11yTop93(){const d=a11yDlgs93();if(!d.length)return null;const pop=d.filter(x=>x.id!=='mboxEl');return pop.length?pop[pop.length-1]:d[0]}
function a11yFocusables93(root){return [...root.querySelectorAll(A93_FOC)].filter(e=>a11yVis93(e)&&getComputedStyle(e).visibility!=='hidden')}
function a11yExtras93(){return ['#mtutCoach','#tutCoach'].map(s=>document.querySelector(s)).filter(e=>e&&a11yVis93(e))}
function a11yFirst93(root){const f=a11yFocusables93(root).filter(e=>!e.matches('#mClose,#mPeek'));
  return root.querySelector('[autofocus]')||(root.id==='mboxEl'?root.querySelector('#mBtns .btn.primary:not([disabled])'):null)||root.querySelector('[data-ask76="1"]')||f.find(e=>!e.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),textarea'))||f[0]||null}
function a11yFoc93(el){if(!el)return false;try{if(!el.matches(A93_FOC)&&!el.hasAttribute('tabindex'))el.tabIndex=-1;el.focus({preventScroll:true});return document.activeElement===el}catch(e){return false}}
/* a11ySig93 — a way to find "the same control" after a redraw */
function a11ySig93(el){if(!el||el===document.body)return null;const at=['id','data-mg','data-id','data-act','data-mi','data-tab','data-y92s','data-y92lock','data-ask76','data-mt'];const o={tag:el.tagName};let any=false;
  for(const a of at){const v=el.getAttribute(a);if(v!=null){o[a]=v;any=true}}return any?o:null}
function a11yFind93(root,s){if(!s)return null;const sel=s.tag.toLowerCase()+Object.entries(s).filter(([k])=>k!=='tag').map(([k,v])=>k==='id'?`#${CSS.escape(v)}`:`[${k}="${CSS.escape(v)}"]`).join('');try{const e=root.querySelector(sel);return e&&a11yVis93(e)?e:null}catch(e){return null}}
function a11ySync93(){A93.syncT=0;if(HEADLESS)return;
  /* closed dialogs leave the stack; focus goes back to the opener of the last one closed */
  let back=null;while(A93.stack.length&&!a11yVis93(A93.stack[A93.stack.length-1].el)){back=A93.stack.pop()}
  A93.stack=A93.stack.filter(x=>a11yVis93(x.el));
  const top=a11yTop93();
  if(top&&!A93.stack.some(x=>x.el===top)){const opener=A93.last&&!top.contains(A93.last)?A93.last:null;A93.stack.push({el:top,opener});
    if(!top.contains(document.activeElement)&&!a11yExtras93().some(x=>x.contains(document.activeElement))){const f=a11yFirst93(top);if(!a11yFoc93(f)){if(!top.hasAttribute('tabindex'))top.tabIndex=-1;a11yFoc93(top)}}
    return}
  if(back&&!top){const o=back.opener;if(o&&a11yVis93(o))a11yFoc93(o);else if(S&&!S.over&&S.phase!=='setup'&&typeof cv!=='undefined'&&a11yVis93(cv)&&A93.kbd)a11yFoc93(cv);return}
  if(back&&top){const f=back.opener&&top.contains(back.opener)&&a11yVis93(back.opener)?back.opener:a11yFirst93(top);a11yFoc93(f);return}
  /* the window redrew under a keyboard user: the same control again */
  if(top&&A93.kbd&&A93.lastEl&&!A93.lastEl.isConnected){const e=a11yFind93(top,A93.sig)||a11yFirst93(top);A93.lastEl=null;if(e)a11yFoc93(e)}}
function a11ySyncSoon93(){if(!A93.syncT)A93.syncT=setTimeout(a11ySync93,40)}
document.addEventListener('focusin',e=>{const t=e.target;if(!t||t===document.body)return;A93.lastEl=t;A93.sig=a11ySig93(t);if(!t.closest('[role="dialog"][aria-modal="true"],[role="alertdialog"]'))A93.last=t},true);
document.addEventListener('keydown',e=>{if(e.key==='Tab'||/^Arrow/.test(e.key))A93.kbd=true;if(e.key!=='Tab'||e.ctrlKey||e.metaKey||e.altKey)return;
  const top=a11yTop93();if(!top)return;const list=[...a11yFocusables93(top),...a11yExtras93().flatMap(a11yFocusables93)];if(!list.length){e.preventDefault();return}
  const i=list.indexOf(document.activeElement);e.preventDefault();const L=list.length,dir=e.shiftKey?-1:1;let n=i<0?(e.shiftKey?L-1:0):(i+dir+L)%L;
  for(let k=0;k<L;k++){if(a11yFoc93(list[n]))break;n=(n+dir+L)%L}},true);
for(const ev of ['pointerdown','mousedown','touchstart'])document.addEventListener(ev,e=>{if(e.isTrusted)A93.kbd=false},{capture:true,passive:true});
/* ---------- accessible names for icon-only controls ---------- */
const A93_ICO=[['×',_T('Close')],['✕',_T('Remove')],['✖',_T('Close')],['👁',_T('Look')],['⏭',_T('Skip to the end')],['🔇',_T('Sound off')],['🔊',_T('Sound on')],['⚙',_T('Settings')],['🏛',_T('Main menu')],['▶',_T('Play')],['⏸',_T('Pause')],
  ['🔍',_T('Zoom')],['ⓘ',_T('More information')],['＋',_T('Add')],['+',_T('Add')],['−',_T('Take one back')],['-',_T('Take one back')],['★',_T('Favourite')],['☆',_T('Favourite')],['📌',_T('Pin')],['⋯',_T('More')],['↻',_T('Again')],['🗑',_T('Delete')],
  ['✎',_T('Edit')],['🔒',_T('Lock')],['📜',_T('Scroll')],['💾',_T('Save')],['🎓',_T('Lessons')],['☰',_T('Menu')],['◀',_T('Back')],['▲',_T('Up')],['▼',_T('Down')],['?',_T('Help')]];
const A93_SEL='button,[role="button"],a[href],[data-act],[data-mg],[data-tab],.chip[title],.badge[title],.fchip[title],[data-card][title]';
const a11yWordy93=t=>/[\p{L}\p{N}]/u.test(t||'');
function a11yName93(el){if(el.hasAttribute('aria-labelledby'))return;const al=el.getAttribute('aria-label');if(al&&a11yWordy93(al))return;
  const txt=(el.textContent||'').trim();if(a11yWordy93(txt)&&!al)return;
  let n=el.getAttribute('title')||'';if(!a11yWordy93(n)){const tip=el.getAttribute('data-tip');if(tip)n=tip.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
  if(!a11yWordy93(n)){const im=el.querySelector('img[alt]');if(im&&a11yWordy93(im.alt))n=im.alt}
  if(!a11yWordy93(n)){const s=(txt||al||'').replace(/️/g,'');const hit=A93_ICO.find(([k])=>s.startsWith(k));if(hit)n=hit[1]}
  if(!a11yWordy93(n))return;n=n.slice(0,120);el.setAttribute('aria-label',n);
  if(!el.matches('button,a,[role]')){el.setAttribute('role',el.matches('[data-act],[data-mg],[data-tab]')?'button':'img');if(el.matches('[data-act],[data-mg],[data-tab]')&&!el.hasAttribute('tabindex'))el.tabIndex=0}}
/* ---------- contrast: text in a player's / class's own colour (inline style) is lifted (same hue) until it reads at AA ---------- */
const a11yRGB93=s=>{const m=s&&s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
const a11yLum93=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b)};
const a11yRatio93=(a,b)=>{const x=a11yLum93(a),y=a11yLum93(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
function a11yBg93(el){const L=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none'&&!/gradient/.test(cs.backgroundImage))return null;
    const c=a11yRGB93(cs.backgroundColor);if(c&&c.a>0){L.push(c);if(c.a>=0.99)break}}
  let acc=(!L.length||L[L.length-1].a<0.99)?(a11yRGB93(getComputedStyle(document.body).backgroundColor)||{r:20,g:14,b:10,a:1}):{r:0,g:0,b:0,a:1};
  for(let i=L.length-1;i>=0;i--){const t=L[i];acc={r:t.r*t.a+acc.r*(1-t.a),g:t.g*t.a+acc.g*(1-t.a),b:t.b*t.a+acc.b*(1-t.a),a:1}}return acc}
function a11yHSL93(c){const r=c.r/255,g=c.g/255,b=c.b/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}return {h,s,l}}
function a11yRGBof93(h,s,l){const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p};if(!s)return {r:l*255,g:l*255,b:l*255};const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;return {r:f(p,q,h+1/3)*255,g:f(p,q,h)*255,b:f(p,q,h-1/3)*255}}
function a11yLift93(el){try{if(!el.style||!el.style.color||el.dataset.lift93)return;if(!a11yWordy93(el.textContent))return;el.dataset.lift93='1';
  const cs=getComputedStyle(el);const fg=a11yRGB93(cs.color);const bg=a11yBg93(el);if(!fg||!bg||fg.a<0.9)return;const px=parseFloat(cs.fontSize),wt=+cs.fontWeight||400;const need=(px>=24||(px>=18.66&&wt>=700))?3:4.5;
  if(a11yRatio93(fg,bg)>=need)return;const up=a11yLum93(bg)<0.4;const hs=a11yHSL93(fg);let c=fg;
  for(let i=0;i<20&&a11yRatio93(c,bg)<need+0.15;i++){hs.l=Math.max(0,Math.min(1,hs.l+(up?0.03:-0.03)));c=a11yRGBof93(hs.h,hs.s,hs.l)}
  el.style.color=`rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`}catch(e){}}
const A93_LIFT='[style*="color"]';
function a11yNameAll93(root){try{if(root.nodeType!==1)return;if(root.matches&&root.matches(A93_SEL))a11yName93(root);for(const el of root.querySelectorAll(A93_SEL))a11yName93(el);
  if(root.closest&&root.closest('header.bar,main.layout,#mboxEl')||root===document.body){if(root.matches&&root.matches(A93_LIFT))a11yLift93(root);for(const el of root.querySelectorAll(A93_LIFT))if(el.closest('header.bar,main.layout,#mboxEl'))a11yLift93(el)}}catch(e){}}
/* Escape from the action dock also goes back to Move */
document.addEventListener('keydown',e=>{if(e.key!=='Escape'||a11yTop93())return;const t=document.activeElement;if(!t||!t.closest||!t.closest('#actions'))return;a11yBoardKey93(e)});
/* non-button clickables in the action dock answer Enter/Space like buttons */
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target;if(!t||!t.matches||t.matches('button,a,input,select,textarea,summary,#cv'))return;
  if(t.matches('[role="button"][tabindex]')){e.preventDefault();t.click()}});
{const pend=new Set();let tm=0;const run=()=>{tm=0;const list=[...pend];pend.clear();for(const n of list)if(n.isConnected)a11yNameAll93(n);a11ySyncSoon93()};
  const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='attributes'){a11ySyncSoon93();continue}for(const n of m.addedNodes)if(n.nodeType===1)pend.add(n);if(m.removedNodes.length)a11ySyncSoon93()}if(pend.size&&!tm)tm=setTimeout(run,150);else if(!pend.size)a11ySyncSoon93()});
  const start=()=>{if(HEADLESS)return;a11yNodes93();a11yNameAll93(document.body);mo.observe(document.body,{childList:true,subtree:true});
    const m=document.getElementById('modal');if(m)mo.observe(m,{attributes:true,attributeFilter:['hidden']});
    if(typeof cv!=='undefined'&&cv)cv.addEventListener('keydown',a11yBoardKey93);
    if(typeof cv!=='undefined'&&cv)cv.addEventListener('focus',()=>{if(A93.kbd){a11yCurInit93();a11yShowCur93(false)}});
    if(typeof cv!=='undefined'&&cv)cv.addEventListener('blur',()=>{try{draw()}catch(e){}})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start()}
/* ---------- speaking the game: turns and the big log lines ---------- */
{const base=beginTurn;beginTurn=function(){const r=base.apply(this,arguments);try{if(!HEADLESS&&S&&!S.sim&&!S.snap)setTimeout(()=>{try{if(!S||S.over)return;const p=cur();if(!p)return;
    a11ySay93(p.cpu?_T`Round ${(S.ri||0)+1}: ${p.name}'s turn.`:_T`Round ${(S.ri||0)+1}: your turn, ${p.name}.`);a11ySumUpd93();
    if(!p.cpu&&A93.kbd&&document.activeElement===cv){A93.cur={r:p.r,c:p.c};a11yShowCur93(false)}}catch(e){}},60)}catch(e){}return r}}
{const base=log;log=function(html,cls){const r=base.apply(this,arguments);try{if(!HEADLESS&&S&&!S.sim&&!S.snap&&(cls==='big'||cls==='bad'))a11ySay93(html)}catch(e){}return r}}
