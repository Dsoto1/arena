/* 321-v101board — v1.01 workstream D: BOARD + GENERAL fixes from his v1.0 notes (tools/plans/v101/notes-his.txt, GENERAL). Display / UI only —
   never S, the dice, the RNG, the log lines the engine writes or onlHash. Wraps; the only direct source edits are G1 (225 + the Domus/online
   hand code) and the WICO75 throw/both swap (106). Kill switch for the display items: localStorage flavius_board101off=1.
   G1  LABRYS: a weapon with both:1 may attack once or twice, the OTHER hand may hold a weapon or a shield (a shield still absorbs). 225's
       arm94Fit / arm94Put-by-fit / auto-dress / settle and the label "· two hands" → "· both attacks"; the Domus showcase + 112/133 online
       kit dressing no longer park the second weapon. 111-onlcore has NO hand rule (checked: nothing to change on the server).
   G2  TUTORIALS: ONE coach for both lessons, named "Terynious Tutorialis" (prefix on every coach step line; MTUTOR99 = TUTOR99); the 'hello'
       step loses the sentence naming Flavius (language-proof: the sentence holding <b>Flavius</b> is cut at runtime); Learn to play step 5
       ('hand'): when the pillar was toppled the offering lies on the sand — the step says WHERE (tile name), lights a walk-there suggestion and
       waits for the pickup (or the end of the turn) instead of claiming the offering is in the hand.
   G3  Play Now submenu tablet (#modal.sand100): only "Back" — the ✕ stud and the "ESC · BACK" seal are hidden (Esc still closes).
   G4  The 3D crowd faced the wrong way: the sheets' four facings are mirrored against 313's comment (cell 0 = down-RIGHT …). The meta rows are
       reversed once, so near stands show backs facing the sand and far stands fronts facing it; forum walkers follow.
   G5  Daily / weekly challenges (S.daily100): no ⏭ To the end (simToEnd refused, button hidden), no 🤖 Hand to CPU (seatCanToggle false),
       no replay recording (rp100RecOK false) so nothing to watch, no seed anywhere (challenge card line hidden, log line + toast dropped).
   G8/G9  SEVERED LIMB: while the severed set (or its move sheet) is not decoded the figure keeps drawing the CURRENT whole-body 3D set (a
       temporary sevT in an100DrawP) instead of falling back to today's flat token / the class stand-in; it switches when the sheet is ready.
       3D CORPSES: the last frame of the fall row stays on the sand until the corpse is carted away and replaces the old flat corpse figure.
   G14 CROWD FLAGS: no flag floating above the stands (drawFanFlags is a no-op); the first fan seated for each gladiator HOLDS his flag (any mode) — was: up to two fans of each section's
       gladiator hold a small vexillum (the section's house flag, same colours) on the 313 sprite path: seated = planted by the hip, standing
       cheering (stand100 / cheer92 poses) = raised. Near stands are clipped off the sand (313's rule). No waving.
   G15 Play Now setup window: its ✕ is the main-menu 🏛 button (title "Main menu"); a stale "Save this career…" title from a Manager window
       can no longer follow any window (mClose is reset at every modal()).
   G16 Online → Lobby Browser: Join by code / FID moves to the right and shrinks to a quiet tool; Refresh / Ranked room / Custom room get the
       sandstone buttons (306's generator).
   G17 The action bar's ↗ Throw wore the "both attacks" icon: the two images were swapped in WICO75 (his sheet: pink double arrow = throw, the
       blue bundle = both attacks — matching the old hand-drawn CW_ICO colours); 106 now has them right everywhere.
   G18 Play Now: the Challenges row is a TAB beside 🏆 Tournament (opens the challenges window); the empire-calendar date moves into the
       "Follow the schedule" option.
   G19 Token bases 15% thinner (BASE101.thin 0.85: the base's side wall is squeezed per column; a sprite drawn through miniDraw / an100Cell /
       the Studio 3D token) + Settings → Board & pieces → "Show token bases" (SETTINGS.bases101, default on). Off removes the base by a
       flood from its outline over the base's own colours (needs readable pixels: https / data: sheets; a file:// page keeps the thin base).
   G20 ZOOM HITCH: see the section's own comment (measured with tools/plans/v101/zoom101.js).
   G21 SPECTATOR REACTIONS cascade: emote() is rate limited (≤ 3 a 0.9 s, the rest queued ~90–260 ms apart, ≤ 10 waiting) — a big moment
       ripples through the stands instead of flooding the board; your own seat's reactions are immediate.
   G22 Minerva's Push: the step window shows a small board picture of the 3×3 tiles round the fighter in the board's own projection (turned
       with the camera), the tiles you may step to lit and clickable, blocked tiles marked (pillar / fighter / spikes), the attacker if near.
   Tests: tv101e. */
const B101={off:(()=>{try{return localStorage.getItem('flavius_board101off')==='1'}catch(e){return false}})(),skip:new Set() /* tests / profiling: 'flags' | 'base' | 'hands' | 'corpse' */};
const dc101=()=>{try{return !!(S&&S.daily100)}catch(e){return false}};

/* ---------------- G2 · one coach, Terynious Tutorialis ---------------- */
const COACH101=_T('Terynious Tutorialis');
try{
  if(typeof MTUTOR99==='function'&&typeof TUTOR99==='function')MTUTOR99=function(){return TUTOR99()};
  const hello=TUT_STEPS.find(s=>s.id==='hello');
  if(hello&&typeof hello.say==='string')hello.say=hello.say.replace(/\s*[^.!?。]*<b>Flavius<\/b>[^.!?。]*[.!?。]\s*/,' ').replace(/\s{2,}/g,' ');
  const hand=TUT_STEPS.find(s=>s.id==='hand');
  if(hand&&!hand.step101){hand.step101=1;const say0=hand.say,sug0=hand.sug,until0=hand.until;
    /* the pot's offering lying on the sand (a toppled pillar drops it a few tiles away) */
    const lying=p=>{try{let best=null,bd=1e9;for(const f of S.floor||[]){if(f.kind!=='offer')continue;const d=p?cheb(p,f):0;if(d<bd){bd=d;best=f}}return best}catch(e){return null}};
    hand.say=()=>{const f=lying(TUT.p);return f?_T`The pot's offering landed on the sand at <b>${tl(f.r,f.c)}</b> — walk onto that tile to pick it up.`:(typeof say0==='function'?say0():say0)};
    hand.sug=p=>{const f=lying(p);if(f)return tutGo(p,[f.r,f.c]);return sug0?sug0(p):null};
    hand.until=p=>{const f=lying(p);if(f)return S.ri>0||cur()!==p;return until0?until0(p):false};
  }
}catch(e){console.error(e)}
function coachName101(){try{for(const id of ['tutCoach','mtutCoach']){const el=document.getElementById(id);if(!el)continue;
  el.querySelectorAll('.tutstep').forEach(t=>{if(t.dataset.n101)return;t.dataset.n101='1';t.textContent=COACH101+' · '+t.textContent})}}catch(e){}}
{const b=tutCoach;tutCoach=function(){const r=b.apply(this,arguments);coachName101();return r}}
{const b=mtCoach;mtCoach=function(){const r=b.apply(this,arguments);coachName101();return r}}

/* ---------------- G5 · challenges are played by hand, no seed, no replay ---------------- */
{const b=simToEnd;simToEnd=function(){if(dc101())return;return b.apply(this,arguments)}}
{const b=seatCanToggle;seatCanToggle=function(){if(dc101())return false;return b.apply(this,arguments)}}
if(typeof rp100RecOK==='function'){const b=rp100RecOK;rp100RecOK=function(){return dc101()?false:b.apply(this,arguments)}}
{const b=render;render=function(){const r=b.apply(this,arguments);try{if(dc101()){const se=document.getElementById('btnSimEnd');if(se)se.hidden=true}}catch(e){}return r}}
{const b=log;log=function(html,cls){try{if(dc101()&&typeof html==='string'&&S.seed!=null&&html.indexOf('<b>'+S.seed+'</b>')>=0&&/seed/i.test(html))return}catch(e){}return b.apply(this,arguments)}}
{const b=mToast;mToast=function(t){try{if(dc101()&&typeof t==='string'&&S.seed!=null&&t.indexOf(String(S.seed))>=0&&/seed/i.test(t))return}catch(e){}return b.apply(this,arguments)}}

/* ---------------- G4 · the 3D crowd's four facings are mirrored against 313's comment ---------------- */
try{if(typeof CROWD100_META!=='undefined'&&CROWD100_META.a&&!CROWD100_META._m101){CROWD100_META._m101=1;
  for(const k in CROWD100_META.a){const r=CROWD100_META.a[k].r;for(const n in r)if(Array.isArray(r[n]))r[n].reverse()}}}catch(e){console.error(e)}

/* ---------------- G8 / G9 · severed limb: keep the current 3D figure until the new sheet is decoded; 3D corpses stay ---------------- */
const CORPSE101=[];
if(typeof an100DrawP==='function'){const base=an100DrawP;an100DrawP=function(sp,x,y,opt){const r=base.apply(this,arguments);if(r!=null||B101.off)return r;
  try{const p=AN100.cur;if(!p||!an100On()||an100Lost(p).length!==1)return r;
    const ls=an100SrcFor(p,sp);if(ls&&an100Bm(ls,'move','idle'))return r; /* the severed set is decoded: whatever returned null stays as it was */
    const s0=an100St(p);const keep=s0.sevT;
    s0.sevT=an100Now()+AN100.poseMs;try{return base.apply(this,arguments)}finally{s0.sevT=keep}}catch(e){return r}}}
if(typeof BUS!=='undefined'){BUS.on('elim',e=>{try{if(B101.off||!e||e.sim||typeof AN100==='undefined')return;const g=AN100.ghosts[AN100.ghosts.length-1];
    if(g&&g.p&&e.victim&&g.p.id===e.victim.id&&g.S===S){CORPSE101.push({r:g.r,c:g.c,src:g.src,face:g.face,t0:g.t0,S,color:g.color})}}catch(x){}});
  BUS.on('event.start',()=>{CORPSE101.length=0})}
const corpsePile101=g=>{try{return (S.piles||[]).some(pl=>pl.corpse&&!pl.gone&&pl.r===g.r&&pl.c===g.c)}catch(e){return false}};
function corpses101(){if(!CORPSE101.length||typeof ctx==='undefined')return;const now=an100Now();
  for(let i=CORPSE101.length-1;i>=0;i--){const g=CORPSE101[i];if(g.S!==S||(now-g.t0>1800&&!corpsePile101(g)))CORPSE101.splice(i,1)}
  if(typeof SETTINGS!=='undefined'&&SETTINGS.gore===false)return;
  for(const g of CORPSE101){const R=g.src.act&&g.src.act.meta.rows.fall;if(!R)continue;if(now-g.t0<AN100.poseMs*R.length)continue;
    const m=center(g.r,g.c);const keep=AN100.cur;AN100.cur={color:null};
    try{an100Cell(g.src,{set:'act',name:'fall',i:R.length-1},g.face,m.x,m.y,null)}finally{AN100.cur=keep}}}
{const base=drawLayers93;drawLayers93=function(layers){
  if(!B101.off&&Array.isArray(layers)&&CORPSE101.length)layers=layers.map(l=>l&&l[0]==='pieces'?['pieces',()=>{try{corpses101()}catch(e){console.error(e)}return l[1]()}]:l);
  return base.call(this,layers)}}
{const base=drawCorpseFig;drawCorpseFig=function(m){try{if(!B101.off&&CORPSE101.length)for(const g of CORPSE101){if(g.S!==S)continue;const c=center(g.r,g.c);if(Math.abs(c.x-m.x)<0.5&&Math.abs(c.y-m.y)<0.5)return}}catch(e){}return base.apply(this,arguments)}}

/* ---------------- G21 · spectator reactions cascade ---------------- */
const EM101={win:[],q:[],tm:0,MAX:3,WIN:900,GAP:[90,260],QMAX:10};
{const base=emote;emote=function(sp,emo,text){try{if(B101.off||HEADLESS||!S||!sp||sp.human)return base.apply(this,arguments)}catch(e){return base.apply(this,arguments)}
  const now=performance.now();EM101.win=EM101.win.filter(t=>now-t<EM101.WIN);
  if(!EM101.q.length&&EM101.win.length<EM101.MAX){EM101.win.push(now);return base.apply(this,arguments)}
  if(EM101.q.length>=EM101.QMAX)EM101.q.shift();EM101.q.push({a:[sp,emo,text],S});
  if(!EM101.tm)EM101.tm=setTimeout(em101Drain,EM101.GAP[0]+Math.random()*(EM101.GAP[1]-EM101.GAP[0]))}}
function em101Drain(){EM101.tm=0;const now=performance.now();EM101.win=EM101.win.filter(t=>now-t<EM101.WIN);
  while(EM101.q.length&&EM101.q[0].S!==S)EM101.q.shift();if(!EM101.q.length)return;
  if(EM101.win.length<EM101.MAX){const it=EM101.q.shift();EM101.win.push(now);try{emote.apply(null,it.a)}catch(e){}}
  if(EM101.q.length)EM101.tm=setTimeout(em101Drain,EM101.GAP[0]+Math.random()*(EM101.GAP[1]-EM101.GAP[0]))}

/* ---------------- G14 · flags in the spectators' hands ---------------- */
const POSE101=new Map();
{const base=look91;look91=function(sp,back){const o=base.apply(this,arguments);try{if(!B101.off&&sp)POSE101.set(sp.id,{up:o.up||0,st:o.st||0})}catch(e){}return o}}
if(typeof drawFanFlags==='function'&&!B101.off)drawFanFlags=function(){};
const FLAG101={n:0,hold:null,hk:'',des:{},im:{}};
/* who holds a flag (his call 2026-10-14): for every gladiator, in any mode, the FIRST fan seated for him (S.spect order) carries his flag
   (the design of his section: house in Manager, custom banner, city/class otherwise), wherever that fan sits. Cached while the stands'
   makeup is the same (spectators, seats seen, camera turn, favourites). */
function flag101Holders(){const seen=CR91&&CR91.seen;if(!seen||!S||!S.spect||!S.players)return [];
  let fk='';for(const sp of S.spect)fk+=(sp.fav==null?'-':sp.fav)+(sp.gone?'g':'')+',';
  const key=S.spect.length+'|'+seen.length+'|'+(typeof ROT89!=='undefined'?ROT89.k:0)+'|'+S.players.length+'|'+fk;if(key===FLAG101.hk&&FLAG101.hold)return FLAG101.hold;
  const at=new Map();for(const e of seen)if(!e.human)at.set(e.id,e);
  const list=[];for(const p of S.players){const sp=S.spect.find(x=>!x.gone&&!x.human&&x.fav===p.id&&at.has(x.id));if(!sp)continue;
    const si=typeof SEAT_SEC!=='undefined'?SEAT_SEC[p.id%8]:at.get(sp.id).sec;list.push({sp,back:at.get(sp.id).back,si})}
  FLAG101.hk=key;FLAG101.hold=list;return list}
function flag101Img(si,fw,fh,dpr,now){let c=FLAG101.im[si];const w=Math.ceil(fw*dpr/4)*4,h=Math.ceil(fh*dpr/4)*4;
  if(c&&c.w===w&&c.h===h&&now-c.t<1200)return c.im;let im=null;try{let d=FLAG101.des[si];if(!d||now-d.t>1500){d=FLAG101.des[si]={d:ar91Design100(si),t:now}}
    im=d.d&&typeof insignia100!=='undefined'?insignia100.bmp(d.d,'vexillum',32,{},w,h):null}catch(e){}
  FLAG101.im[si]={w,h,im,t:now};return im}
function flag101Draw(){if(!S||!S.spect||typeof ctx==='undefined'||!STANDS)return;
  const M0=cr100Scale('s0');if(!M0)return;const S1=TW*SIZE91*0.765*CR100.size/M0._hs;const drop=CR100.drop*M0.ppm*S1;const mid=center((N-1)/2,(N-1)/2);const D=cr100Sand();const dpr=window.devicePixelRatio||1;const now=performance.now();let n=0;
  for(const h of flag101Holders()){const {sp,si,back}=h;const ps=POSE101.get(sp.id)||{up:0,st:0};const dr=DRAWN91.get(sp);if(!dr||dr.hidden||dr.walking||dr.x!==dr.x)continue;
    const row=(ps.st?'stand':'sit')+(ps.up===2?'cheer':ps.up===1?'fist':'');const W1=cr100Of(sp),M=cr100Meta(W1.k);if(!M||!M.r[row])continue;
    const fi=back?(mid.x<dr.x?1:2):(mid.x<dr.x?0:3);const cell=M.r[row][fi];if(!cell)continue;const up=M.k[row]==='u';const dy=up?drop:0;
    const hx=dr.x+(cell[6]-cell[4])*S1,hy=dr.y+dy+(cell[7]-cell[5])*S1;
    const raised=ps.up>=1;const gx=hx+TW*(raised?0.2:0.25),gy=raised?hy-TW*0.02:hy+TW*0.3;const len=TW*(raised?0.6:0.64);
    const fw=TW*0.34,fh=TW*0.46;const im=flag101Img(si,fw,fh,dpr,now);
    ctx.save();ctx.beginPath();ctx.rect(-1e5,-1e5,2e5,2e5);ctx.moveTo(D.top[0],D.top[1]);ctx.lineTo(D.left[0],D.left[1]);ctx.lineTo(D.bottom[0],D.bottom[1]);ctx.lineTo(D.right[0],D.right[1]);ctx.closePath();ctx.clip('evenodd');
    ctx.strokeStyle='#4a321c';ctx.lineWidth=Math.max(1.2,TW*0.028);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(gx,gy+TW*0.05);ctx.lineTo(gx,gy-len);ctx.stroke();
    ctx.fillStyle='#c9a24e';ctx.beginPath();ctx.arc(gx,gy-len,TW*0.022,0,Math.PI*2);ctx.fill();
    if(im)ctx.drawImage(im,gx,gy-len+TW*0.02,fw,fh);else{ctx.fillStyle=(S.players[sp.fav]||{}).color||'#8f8474';ctx.fillRect(gx,gy-len+TW*0.02,fw,fh*0.7)}
    ctx.restore();n++}
  FLAG101.n=n}
{const base=draw91;draw91=function(){const r=base.apply(this,arguments);if(!B101.off&&!B101.skip.has('flags')&&typeof cr100StandsReady==='function'&&cr100StandsReady()){try{flag101Draw()}catch(e){console.error(e)}}return r}}

/* the tall tapestry flags on two poles above each section (192/304 ar91DecoPaint) are the floating flags: gone while the 3D crowd carries the flags in
   its hands; the coloured section line along the stands stays. Without the sheets (the standalone) the old tapestries stay. */
const hands101=()=>{try{return !B101.off&&!B101.skip.has('hands')&&typeof cr100StandsReady==='function'&&cr100StandsReady()}catch(e){return false}};
if(typeof ar91DecoPaint==='function'){const bp=ar91DecoPaint;ar91DecoPaint=function(g){if(!hands101())return bp.apply(this,arguments);if(ar91Lud())return;const T4=ar91Tiers()>3;
  for(let si=0;si<8;si++){const col=secColor(si);const TT=T4?3:2;const Q=secQuad(si,1.35+TT*0.47,1.82+TT*0.47).map(([r,c])=>pt(r,c)).map(p=>({x:p.x,y:p.y-TT*TW*0.08}));
    g.save();g.strokeStyle='rgba(20,12,6,.6)';g.lineWidth=Math.max(3,TW*0.085);g.lineCap='butt';g.beginPath();g.moveTo(Q[2].x,Q[2].y);g.lineTo(Q[3].x,Q[3].y);g.stroke();
    g.strokeStyle=col;g.lineWidth=Math.max(2,TW*0.06);g.beginPath();g.moveTo(Q[2].x,Q[2].y);g.lineTo(Q[3].x,Q[3].y);g.stroke();g.restore()}}}
if(typeof ar91DecoKey==='function'){const bk=ar91DecoKey;ar91DecoKey=function(){const k=bk.apply(this,arguments);return hands101()?k+'|h101':k}}

/* ---------------- G15 · the Play Now window's ✕ is the main-menu button ---------------- */
{const base=modal;modal=function(title,body,buttons,opt){
  const mc=document.getElementById('mClose');if(mc){mc.removeAttribute('title');mc.classList.remove('saveq','menu101');mc.removeAttribute('aria-label');mc.setAttribute('aria-label',_T('Close'))}
  const p=base.apply(this,arguments);
  try{if(!B101.off&&mc&&typeof body==='string'&&body.indexOf('id="goBtn"')>=0&&opt&&opt.full){mc.textContent='🏛';mc.title=_T('Main menu');mc.setAttribute('aria-label',_T('Main menu'));mc.classList.add('menu101')}}catch(e){}
  return p}}

/* ---------------- G16 · Lobby Browser: Join by FID to the right, quiet; the other buttons sandstone ---------------- */
{const base=onlLobbyHTML;onlLobbyHTML=function(){let h=base.apply(this,arguments);try{if(!B101.off&&typeof h==='string'&&h.indexOf('lb100-jb')>=0)h=h.replace(/(<form class="lb100-jb"[\s\S]*?)<button type="submit" class="btn primary"/,_T('$1<button type="submit" class="btn tksm"'))}catch(e){}return h}}

/* ---------------- G18 · Play Now: Challenges = a tab; the calendar date lives in "Follow the schedule" ---------------- */
{const base=setupBody;setupBody=function(){let h=base.apply(this,arguments);try{if(B101.off||typeof h!=='string'||h.indexOf('pn-tabs')<0)return h;
  const T=document.createElement('template');T.innerHTML=h;const f=T.content;let ch=false;
  const strip=f.querySelector('.dc100pn');if(strip){strip.remove();ch=true}
  const seg=f.querySelector('.pn-tabs .seg');
  if(seg&&strip&&!seg.querySelector('[data-dc100pn]')){const b=document.createElement('button');b.type='button';b.setAttribute('data-dc100pn','');b.className='tab101';b.textContent=_T('📅 Challenges');seg.appendChild(b);ch=true}
  const fol=f.querySelector('.pn100follow'),cal=f.querySelector('.pn-cal .calline');
  if(fol&&cal){cal.classList.add('cal101');const sw=fol.querySelector('.t');fol.insertBefore(cal,sw||null);const pc=f.querySelector('.pn-cal');if(pc&&!pc.children.length)pc.remove();ch=true}
  return ch?T.innerHTML:h}catch(e){console.error(e);return h}}}

/* ---------------- G19 · token bases: 15% thinner, optional ---------------- */
const BS101={f:null,thin:0.85,cache:new WeakMap(),stats:{proc:0,hit:0,off:0,taint:0},nat:null,
  FAM:{rig:{ct:-3.3,T:3.5,rx:12.75},tts:{ct:-2.4,T:2.2,rx:12.5}}};
const bs101Mode=()=>{try{if(B101.off||HEADLESS||B101.skip.has('base'))return 0;return SETTINGS.bases101===false?2:1}catch(e){return 1}};
function bs101Proc(img,sx,sy,sw,sh,f,ax,ay,ppm,mode){
  let m=BS101.cache.get(img);if(!m){m=new Map();BS101.cache.set(img,m)}
  const key=mode+'|'+sx+'|'+sy+'|'+sw+'|'+sh+'|'+f.fam+'|'+ax.toFixed(1)+'|'+ay.toFixed(1)+'|'+ppm.toFixed(3);let c=m.get(key);if(c){BS101.stats.hit++;return c}
  const G=BS101.FAM[f.fam],W=Math.max(1,Math.ceil(sw)),H=Math.max(1,Math.ceil(sh));
  const cx=ax,cyT=ay+G.ct*ppm,rx=G.rx*ppm,ry=rx/2,Tp=G.T*ppm;
  const src=document.createElement('canvas');src.width=W;src.height=H;const sg=src.getContext('2d');sg.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
  c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');let done=false;
  if(mode===2){try{done=bs101Off(sg,src,c,g,W,H,cx,cyT,rx,ry,Tp)}catch(e){BS101.stats.taint++}}
  if(!done){ /* thin: squeeze the wall of each column to 85% */
    const k=BS101.thin;const x0=Math.max(0,Math.floor(cx-rx-2)),x1=Math.min(W,Math.ceil(cx+rx+2));
    if(x0>0)g.drawImage(src,0,0,x0,H,0,0,x0,H);if(x1<W)g.drawImage(src,x1,0,W-x1,H,x1,0,W-x1,H);
    for(let x=x0;x<x1;x++){const u=Math.min(1,Math.abs(x+0.5-cx)/rx),e=cyT+ry*Math.sqrt(Math.max(0,1-u*u));
      g.drawImage(src,x,0,1,e,x,0,1,e);
      g.drawImage(src,x,e,1,Tp,x,e,1,Tp*k);
      g.drawImage(src,x,e+Tp,1,Math.max(0,H-e-Tp),x,e+Tp*k,1,Math.max(0,H-e-Tp))}}
  c._off=!!done;/* v1.02 G6: a base-less cell is drawn T lower (feet on the tile floor) */m.set(key,c);if(m.size>80)m.delete(m.keys().next().value);BS101.stats.proc++;return c}
/* off: flood from the base's outline inward over the base's own colours (a tight tolerance on the flat top, a looser one on the wall: the figure's
   skin / leather is close to the cream top, its ink outline is not); then the outline ring of the base itself (a thin band along the silhouette) */
function bs101Off(sg,src,c,g,W,H,cx,cyT,rx,ry,Tp){
  const id=sg.getImageData(0,0,W,H),d=id.data;
  const inCyl=(x,y,m)=>{const dx=x+0.5-cx,dy=y+0.5-cyT,a=rx+m,b=ry+m;if(Math.abs(dx)>a)return false;
    if((dx/a)**2+(dy/b)**2<=1)return true;const dy2=dy-Tp;if((dx/a)**2+(dy2/b)**2<=1)return true;return dy>=0&&dy<=Tp};
  const top=[],wall=[];const smp=(L,x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4;if(d[i+3]>200)L.push([d[i],d[i+1],d[i+2]])};
  for(const s of [-1,1]){smp(top,cx+s*0.9*rx,cyT);smp(top,cx+s*0.62*rx,cyT-0.7*ry);smp(top,cx+s*0.8*rx,cyT+0.45*ry);smp(top,cx+s*0.5*rx,cyT+0.75*ry);
    smp(wall,cx+s*0.9*rx,cyT+Tp*0.5);smp(wall,cx+s*0.55*rx,cyT+ry*0.83+Tp*0.5);smp(wall,cx+s*0.3*rx,cyT+ry*0.95+Tp*0.5)}
  smp(top,cx,cyT-0.8*ry);smp(wall,cx,cyT+ry*0.98+Tp*0.5);smp(wall,cx,cyT+ry*0.98+Tp*0.85);
  if(top.length+wall.length<4)return false;const tT=10*10,tW=22*22;
  const near=i=>{for(const p of top){const a=d[i]-p[0],b=d[i+1]-p[1],e=d[i+2]-p[2];if(a*a+b*b+e*e<=tT)return true}
    for(const p of wall){const a=d[i]-p[0],b=d[i+1]-p[1],e=d[i+2]-p[2];if(a*a+b*b+e*e<=tW)return true}return false};
  const seen=new Uint8Array(W*H),st=[];
  const edge=(x,y)=>{for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)return true;if(!inCyl(X,Y,1.5)||d[(Y*W+X)*4+3]<30)return true}return false};
  const y0=Math.max(0,Math.floor(cyT-ry-4)),y1=Math.min(H,Math.ceil(cyT+ry+Tp+4)),x0=Math.max(0,Math.floor(cx-rx-4)),x1=Math.min(W,Math.ceil(cx+rx+4));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(!inCyl(x,y,1.5))continue;const i=(y*W+x)*4;if(d[i+3]<30||!near(i)||!(edge(x,y)||!inCyl(x,y,-3.5)))continue;seen[y*W+x]=1;st.push(x,y)}
  let removed=0;while(st.length){const y=st.pop(),x=st.pop();d[(y*W+x)*4+3]=0;removed++;
    for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<x0||Y<y0||X>=x1||Y>=y1||seen[Y*W+X])continue;if(!inCyl(X,Y,1.5))continue;const i=(Y*W+X)*4;if(d[i+3]<30||!near(i))continue;seen[Y*W+X]=1;st.push(X,Y)}}
  if(!removed)return false;
  /* the base's own outline / rim highlight: opaque pixels in the 3-px band along the silhouette that touch a removed pixel (5 passes) */
  for(let pass=0;pass<5;pass++){const kill=[];for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*4;if(d[i+3]<30)continue;if(!inCyl(x,y,3)||inCyl(x,y,-4))continue;
      let t=false;for(let a=-1;a<=1&&!t;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H||d[(Y*W+X)*4+3]<30){t=true;break}}if(t)kill.push(i)}
    for(const i of kill)d[i+3]=0}
  g.putImageData(id,0,0);BS101.stats.off++;return true}
function bs101Patch(){if(typeof ctx==='undefined')return;if(!BS101.nat)BS101.nat=CanvasRenderingContext2D.prototype.drawImage;
  if(ctx.drawImage===BS101.patched)return;
  BS101.patched=ctx.drawImage=function(img,a,b,c,d,e,f2,g,h){const F=BS101.f;if(!F||arguments.length<5||!img)return BS101.nat.apply(this,arguments);
    try{let sx=0,sy=0,sw,sh,dx,dy,dw,dh;if(arguments.length>=9){sx=a;sy=b;sw=c;sh=d;dx=e;dy=f2;dw=g;dh=h}else{sw=img.width||img.naturalWidth;sh=img.height||img.naturalHeight;dx=a;dy=b;dw=c;dh=d}
      if(!sw||!sh||!dw||!dh)return BS101.nat.apply(this,arguments);const mode=bs101Mode();if(!mode)return BS101.nat.apply(this,arguments);
      const sc=dw/sw;if(!(sc>0))return BS101.nat.apply(this,arguments);const ax=sx+(F.x-dx)/sc,ay=sy+(F.y-dy)/sc,ppm=F.ppm/sc;
      const pc=bs101Proc(img,sx,sy,sw,sh,F,ax-sx,ay-sy,ppm,mode);return BS101.nat.call(this,pc,0,0,Math.ceil(sw),Math.ceil(sh),dx,dy+(pc._off&&!window.V102C_OFF?BS101.FAM[F.fam].T*F.ppm:0),dw*Math.ceil(sw)/sw,dh*Math.ceil(sh)/sh)}
    catch(err){return BS101.nat.apply(this,arguments)}}}
/* off: the soft ground shadow under a token shrinks with the base (it was drawn for the whole disc) */
if(typeof ell==='function'){const be=ell;ell=function(x,y,rx,ry){if(BS101.f&&bs101Mode()===2){rx*=0.62;ry*=0.62}return be.call(this,x,y,rx,ry)}}
const bs101Wrap=(fam,get)=>function(base){return function(){if(B101.off||HEADLESS)return base.apply(this,arguments);let prev=BS101.f;
  try{const f=get.apply(this,arguments);if(f){bs101Patch();BS101.f={fam,...f}}}catch(e){}
  try{return base.apply(this,arguments)}finally{BS101.f=prev}}};
if(typeof miniDraw==='function')miniDraw=bs101Wrap('tts',function(k,x,y){if(k==='pillar'||!MINI_A[k]||Math.abs(MINI_A[k][2]-25.4)>0.5)return null;return {x,y,ppm:miniScale(k)*MINI_PXMM}})(miniDraw);
if(typeof an100Cell==='function')an100Cell=bs101Wrap('rig',function(src,P,face,x,y){return {x,y,ppm:TW*MINI_BASE/25.4}})(an100Cell);
{const base=drawFigureTok;drawFigureTok=function(sp,x,y,h,opt){if(B101.off||HEADLESS||!sp||!sp.t93)return base.apply(this,arguments);const prev=BS101.f;
  try{bs101Patch();BS101.f={fam:'rig',x,y:y-h*0.015,ppm:(h/1.3)*MINI_BASE/25.4}}catch(e){}
  try{return base.apply(this,arguments)}finally{BS101.f=prev}}}
/* Settings → Board & pieces: Show token bases */
if(typeof set98Pieces==='function'){const base=set98Pieces;set98Pieces=function(){let h=base.apply(this,arguments);try{
  const ctrl=`<input type="checkbox" data-set="bases101"${SETTINGS.bases101===false?'':' checked'}>`;
  const card=typeof set98Card==='function'?set98Card('⭕',_T('Token bases'),`<div class="s98-rows">${set98Row(_T('Show token bases'),_T('The round base under each gladiator and beast. Off: they stand straight on the sand.'),ctrl)}</div>`):'';
  h=h.replace(/<\/div>$/,card+'</div>')}catch(e){console.error(e)}return h}}
{const base=applySettings;applySettings=function(){const r=base.apply(this,arguments);try{if(BS101.mode!==bs101Mode()){BS101.mode=bs101Mode();if(S&&!HEADLESS)draw()}}catch(e){}return r}}

/* ---------------- G22 · Minerva's Push: a small board of the tiles you can step to ---------------- */
const MIN101={v:null,a:null};
{const base=minervaStep;minervaStep=async function(victim,attacker){MIN101.v=victim;MIN101.a=attacker;try{return await base.apply(this,arguments)}finally{MIN101.v=null;MIN101.a=null}}}
function min101HTML(opts){try{const v=MIN101.v;if(!v)return '';const ok=new Map(opts.map((o,i)=>[o.value,i]));
  const tiles=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const r=v.r+dr,c=v.c+dc;if(r<0||c<0||r>=N||c>=N)continue;
    let kind=dr===0&&dc===0?'me':'';const idx=ok.has(r*N+c)?ok.get(r*N+c):-1;
    if(!kind){if(idx>=0)kind='go';else if(pillarAt(r,c))kind='pillar';else if(spikeAt(r,c))kind='spike';else if(unitAt(r,c))kind='unit';else kind='block'}
    const u=kind==='unit'?unitAt(r,c):null;const m=center(r,c);tiles.push({r,c,kind,idx,m,u,att:!!(MIN101.a&&MIN101.a.r===r&&MIN101.a.c===c)})}
  const me=center(v.r,v.c);const w=TW,hh=TH;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const t of tiles){t.x=t.m.x-me.x;t.y=t.m.y-me.y;x0=Math.min(x0,t.x-w/2);x1=Math.max(x1,t.x+w/2);y0=Math.min(y0,t.y-hh/2);y1=Math.max(y1,t.y+hh/2)}
  const pad=6,VW=x1-x0+pad*2,VH=y1-y0+pad*2+8;const ord=tiles.slice().sort((a,b)=>a.y-b.y);
  const FILL={me:'#3a2a18',go:'#6f5416',pillar:'#4b4b50',spike:'#5a2222',unit:'#2b3a4a',block:'#2a2420'};
  const lbl={pillar:'▮',spike:'✶',unit:u2=>u2};
  const poly=t=>`${t.x},${t.y-hh/2} ${t.x+w/2},${t.y} ${t.x},${t.y+hh/2} ${t.x-w/2},${t.y}`;
  const cells=ord.map(t=>{let inner='';if(t.kind==='me'){inner=`<circle cx="${t.x}" cy="${t.y-hh*0.1}" r="${hh*0.28}" fill="${v.color||'#e8c96a'}" stroke="#fff4d0" stroke-width="1.5"/>`}
      else if(t.kind==='pillar')inner=`<rect x="${t.x-w*0.07}" y="${t.y-hh*0.55}" width="${w*0.14}" height="${hh*0.8}" fill="#cfcfd4" stroke="#222" stroke-width="1"/>`;
      else if(t.kind==='spike')inner=`<text x="${t.x}" y="${t.y+hh*0.14}" text-anchor="middle" font-size="${hh*0.5}" fill="#ff8a7a">✶</text>`;
      else if(t.kind==='unit')inner=`<circle cx="${t.x}" cy="${t.y-hh*0.1}" r="${hh*0.24}" fill="${(t.u&&t.u.color)||'#8f8474'}" stroke="#111" stroke-width="1"/>`;
      if(t.att)inner+=`<text x="${t.x}" y="${t.y-hh*0.38}" text-anchor="middle" font-size="${hh*0.34}" fill="#ff6a5a">⚔</text>`;
      const nm=typeof tl==='function'?tl(t.r,t.c):'';
      const go=t.kind==='go';return `<g class="m101t ${t.kind}${go?' go':''}" ${go?`data-m101="${t.idx}" tabindex="0" role="button" aria-label="${esc(nm)}"`:''}><polygon points="${poly(t)}" fill="${FILL[t.kind]}" stroke="${go?'#ffd77a':'#6a5a44'}" stroke-width="${go?2.4:1}"/>${inner}<text x="${t.x}" y="${t.y+hh*0.43}" text-anchor="middle" font-size="${Math.max(9,hh*0.3)}" fill="${go?'#fff2c0':'#a89a80'}" class="nm">${esc(nm)}</text></g>`}).join('');
  return `<div class="m101" data-m101box="1"><svg viewBox="${x0-pad} ${y0-pad} ${VW} ${VH}" width="${Math.round(Math.min(340,Math.max(250,VW*2.1)))}" style="max-width:100%;height:auto" role="group" aria-label="${_T('The tiles round you')}">${cells}</svg><div class="m101lg"><span class="g">${_T('gold: you may step here')}</span> · <span>${_T('dark: blocked')}</span></div></div>`}catch(e){console.error(e);return ''}}
{const base=modal;modal=function(title,body,buttons,opt){
  try{if(!B101.off&&MIN101.v&&Array.isArray(buttons)&&buttons.length&&buttons.some(b=>b&&b.value===-1)&&typeof body==='string'&&body.indexOf('m101')<0){
      const pic=min101HTML(buttons.filter(b=>b.value!==-1));if(pic)arguments[1]=body+pic}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('#mBody [data-m101]');if(!t)return;e.preventDefault();e.stopPropagation();
  const b=document.querySelectorAll('#mBtns [data-mi]')[+t.dataset.m101];if(b)b.click()},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target&&e.target.closest&&e.target.closest('#mBody [data-m101]');if(!t)return;e.preventDefault();t.dispatchEvent(new MouseEvent('click',{bubbles:true}))},true);

/* ---------------- G20 · zoom in / out: the crisp repaint is spread over frames ---------------- */
/* MEASURED (tools/plans/v101/zoom101.js; a paused 4-seat Democritus + 48 spectators over http, the Zoom button clicked, 60 frames timed, LAYERS93 reset
   before; Z101.on false vs true alternated in ONE page): the zoom MOTION already draws the last crisp layers scaled (294) — about 20 frames of 30–45 ms
   in headless software raster — and the lock is the SETTLE draw Z100.hold ms later: ONE draw repaints stands/under + deco + the 260 tiles chunks +
   walls/top + walls/light + wear together. Zoom IN, load ≈ 2: longest draw median 122 ms → 88 ms (tv101e's own A/B 116/102 → 69/68), longest frame gap
   152 → 131 ms, zoom OUT 49 → 49 ms (no settle burst there); on a box at load 40 the same A/B read 872 → 507 ms. What is left is the single biggest layer: the
   260 tiles bake (50–190 ms, one paint) — slicing that bake per pass, or pre-baking it while the match is idle, is the next lever (open question).
   321 splits the settle into one rebuild a frame: Z100.force draws run with a budget (Z101.budget layers); a stale layer over budget is drawn scaled again
   (294's own path, forced through z100Moving) and the next rAF draw continues. Zoom stays available online (his answer 10a). Z101.on=false (or the board
   kill switch) = 294's one big settle. */
const Z101={on:true,budget:1,stale:0,iter:0,raf:0,hold:false,loop:0,stats:{slices:0,loops:0}};
if(typeof Z100!=='undefined'&&typeof ar91Layer==='function'&&typeof z100Moving==='function'&&typeof z100Settle==='function'){
  {const b=z100Moving;z100Moving=function(){if(Z101.hold)return true;return b.apply(this,arguments)}}
  const gate=(stale,run)=>{if(!Z101.on||B101.off||HEADLESS||!Z100.force||!stale)return run();
    if(Z101.budget<=0){Z101.stale++;Z101.hold=true;try{return run()}finally{Z101.hold=false}}
    Z101.budget--;Z101.stats.slices++;return run()};
  {const b=ar91Layer;ar91Layer=function(name,key,paint){const L=AR91.L[name];const args=arguments,self=this;
    return gate(name!=='sky'&&L&&L.key&&L.key!==key&&L.tw&&L.ox!=null&&Math.abs(L.tw-TW)>1e-6,()=>b.apply(self,args))}}
  if(typeof tiles96Paint==='function'&&typeof Z99!=='undefined'){const b=tiles96Paint;tiles96Paint=function(paint){const args=arguments,self=this;
    let st=false;try{st=!!(Z99.on&&Z99.cache&&Z99.ch&&Z99.ch.length&&Z99.key&&Z100.tw99&&Math.abs(Z100.tw99-TW)>1e-6&&z99Zoomed()&&!S.ed94&&!(typeof isNaum==='function'&&isNaum())&&!(typeof isChariot==='function'&&isChariot()))}catch(e){}
    return gate(st,()=>b.apply(self,args))}}
  if(typeof wear91Layer==='function'&&typeof WEAR91_C!=='undefined'){const b=wear91Layer;wear91Layer=function(rubble){const args=arguments,self=this;const C=WEAR91_C;
    let st=false;try{st=!!(WEAR91.on&&S&&C.cv&&C.key&&C.tw&&Math.abs(C.tw-TW)>1e-6&&C.sid===sid91())}catch(e){}
    return gate(st,()=>b.apply(self,args))}}
  const step=()=>{Z101.raf=0;if(!S||HEADLESS)return;Z101.stale=0;Z101.budget=1;Z100.force=true;try{draw()}catch(e){console.error(e)}finally{Z100.force=false}
    if(Z101.stale&&++Z101.iter<16)Z101.raf=requestAnimationFrame(step);else Z101.iter=0};
  {const b=z100Settle;z100Settle=function(){if(!Z101.on||B101.off||HEADLESS)return b.apply(this,arguments);
    if(Z101.raf)return;if(Z100.st)clearTimeout(Z100.st);Z100.st=setTimeout(()=>{Z100.st=0;Z101.iter=0;Z101.stats.loops++;if(!Z101.raf)Z101.raf=requestAnimationFrame(step)},Z100.hold)}}
}

/* ---------------- the look ---------------- */
{const st=document.createElement('style');st.id='board101css';st.textContent=`
#modal.sand100 #mClose{display:none!important}
#modal.sand100 .sand100ft .seal{display:none}
.mclose.menu101{width:auto;min-width:40px;font-size:20px;line-height:1}
.dc100 .sd,.dc100c .sd{display:none}
.pn-tabs .seg button.tab101{margin-left:6px}
@media (max-width:760px){.pn-tabs,.pn98 .pn-tabs{max-width:100%}.pn-tabs .seg{display:flex;flex-wrap:wrap;gap:4px}.pn-tabs .seg button{flex:1 1 auto;margin:0}}
.pn100follow .calline.cal101{flex:none;display:flex;align-items:center;gap:7px;border:1px solid var(--line2);border-radius:6px;padding:4px 9px;background:var(--panel2,#1a130e);font-size:13.5px;white-space:nowrap}
.m101{margin:10px 0 2px;text-align:center}.m101 svg{display:block;margin:0 auto;overflow:visible}
.m101 .m101t.go{cursor:pointer}.m101 .m101t.go polygon{filter:drop-shadow(0 0 4px rgba(255,215,122,.55))}.m101 .m101t.go:hover polygon,.m101 .m101t.go:focus-visible polygon{fill:#8a6a1e}
.m101 .nm{font-family:var(--mono,monospace);pointer-events:none}.m101lg{font-size:12px;color:var(--dim,#a3907a);margin-top:2px}.m101lg .g{color:#ffd77a}
#onl .onl-lbtop h3{order:0}#onl .onl-lbtop .acts{order:1;margin-right:auto;margin-left:14px}
#onl .onl-lbtop .lb100-jb{order:2;margin:0 0 0 auto;padding:2px 6px 2px 8px;border:1px solid rgba(214,171,76,.28);background:transparent;gap:5px}
#onl .onl-lbtop .lb100-jb .l{font-size:10px;opacity:.7;letter-spacing:.08em}
#onl .onl-lbtop .lb100-jb input{width:118px;font-size:12px;padding:3px 6px}
#onl .onl-lbtop .lb100-jb .btn{font-size:11px;padding:3px 9px;min-height:0;background:transparent;border:1px solid rgba(214,171,76,.35);color:var(--muted,#b9a88c)}
@media (max-width:760px){#onl .onl-lbtop .lb100-jb{order:3;margin:6px 0 0;width:100%}#onl .onl-lbtop .acts{margin-left:0}}
`;document.head.appendChild(st)}
/* Lobby Browser buttons in the sandstone family (306's generator, same tokens) */
try{if(typeof sd100CSS==='function'&&!B101.off){const st=document.createElement('style');st.id='board101sd';
  st.textContent=sd100CSS({pri:['#onl .onl-lbtop .acts .btn.primary[data-onl="mkroom"]','#onl .onl-lbtop .acts .btn.primary[data-onl="newgame"]'],sec:['#onl .onl-lbtop .acts .btn:not(.primary)[data-onl="refresh"]','#onl .onl-lbtop .acts .btn:not(.primary)[data-onl="mkroom"]'],dan:[],m:[]});
  document.head.appendChild(st)}}catch(e){console.error(e)}
