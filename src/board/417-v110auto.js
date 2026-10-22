/* =====================================================================
   417-v110auto — v1.10 AUTO QUALITY + THE SAFARI FIXES (tools/plans/v110/NOTES.md, his 1a–6a; ROADMAP "v1.10 — Arena Foundation" B).
   DISPLAY ONLY: rules, dice (RNG), S, the log, saves' match data, replays and the online lockstep / hash are untouched — nothing here
   calls rand() or sends anything; every lever is how the board is drawn.
   • SETTINGS (3a) → Board & pieces → the first card "Quality": Auto / High / Medium / Low (SETTINGS.quality110, default 'auto' for new
     AND existing players). Lighting (399's Full / Light / Off) stays under it as the advanced choice, plus "By quality" (no override):
     an explicit Lighting choice (SETTINGS.light106) overrides the preset's lighting part, nothing else.
       High   = today's best: Lighting Full, 2× figure sheets where 410 allows them, the board at the device ratio up to today's caps
                (Safari / WebKit 1.5 = 406 W1.cap; others uncapped), the full crowd (walk-in, cheering bursts, stand-ups).
       Medium = Lighting Light, 1× sheets, the board at ≤ 1.5× (WebKit: 1×), the crowd reacts to blows only (no walk-in, no idle bursts,
                no stand-ups).
       Low    = Lighting Off, 1× sheets, the board at 1×, a still crowd (moods on the faces, no arm-waving).
     Phones at a device ratio ≥ 3 (follow-up 2a, 2026-10-22): the board is capped at 2× ALWAYS, zoomed or not, in every preset
     (REPLACES 6a's "only when zoomed").
     LIGHT BOARD (follow-up 3a): the old separate setting "Light board for older phones" (138 lite84, v0.84: sand grain, scars, wear)
     is REPLACED by Quality: Low turns it on, High / Medium turn it off, Auto turns it on at rung 3. The control is gone from
     Settings (246); the flag SETTINGS.lite84 stays — the modules that read lite84On() are untouched — but Quality now writes it
     ('on' / 'off', in q110Refresh). Migration (q110v 2): a player who had lite84 'on' and had not chosen a Quality (none or the
     default Auto) gets Quality Low; one who chose High / Medium / Low keeps it.
   • AUTO (2a 4a 6a; follow-up 1a: on DESKTOPS Auto never steps below Medium, rung 2 — Low only when picked; phones keep the full ladder): ONE controller, a ladder of four rungs — 0 High · 1 High with Lighting Light · 2 Medium · 3 Low.
       START from capability: desktop → 0; a phone (399's l106Phone) → 1 (= today's phone default, Light); navigator.deviceMemory ≤ 4 GB
       (410's old memory gate, now an INPUT) → ≥ 1, ≤ 2 GB → 2; hardwareConcurrency ≤ 2 (not WebKit: it reports a fixed number) → 2;
       399's old "frames were slow" drop (flavius_light106drop) → ≥ 1. Headless test browsers: the phone rule only (no runtime stepping
       unless flavius_v110autorun=1).
       RUNTIME: the interval of the two animation frames after a board draw (399's measure — real frames, never JS time). Over the last
       Q110K.win ms, ≥ Q110K.min samples, ≥ Q110K.share of them over the budget (17.5 ms laptop / 34 ms phone) → one rung DOWN.
       Sustained headroom (≤ Q110K.upShare late over Q110K.upWin, ≥ Q110K.upMin samples) → one rung UP. Hysteresis: ≥ Q110K.gap ms
       between steps, the samples restart Q110K.settle ms after a step (caches rebuild), each further step down at a boundary doubles the
       wait to climb back over it (20 s, 40 s, 80 s), and after Q110K.maxDowns drops at one boundary it is not climbed again this visit.
       A decided step waits for a QUIET frame (no FX loop, no figure animation, no zoom ease, no walk-in, 250 ms without a draw) or the next
       turn — never mid-animation.
       2× SHEETS (4a): permitted at rung 0 — at once off WebKit; on WebKit (Safari) only after Q110K.x2Win ms of on-time frames at rung 0.
       Never taken back by Auto (memory: no flipping); sheets already loaded swap at the next event start. A manual preset that changes
       the sheets swaps them at the next event start too.
   • REPLACES (name what is replaced): Lighting as the first / only quality choice (v1.06, 399); 399's own Full → Light auto-drop + its
     toast (the Auto ladder's rung 1 does it; manual presets never drop by themselves); 406 W1's own WebKit drop rule (median > 45 ms →
     1×: now Auto's DPR lever — W1.cap is High's WebKit cap, flavius_v107dpr still fixes it); 410's deviceMemory gate (an Auto input; the
     other 410 gates — http, not a phone, ≥ 900 px, helps, x2off / x2force — stay as they were).
   • 5a SAFARI "NO SHADOWS AFTER LOAD" (known-issues 2026-10-21, fixed blind): 399's l106Build drew into the old layer canvas in place
     when the size matched; it now gets a FRESH canvas every build (what the Lighting off/on toggle did). Kill switch
     flavius_l106freshoff=1. 399's sprites / cells are never redrawn in place (new canvas per key) — unchanged.
   • READ-ONLY STATE window.Q110 {mode, tier, rung, why, cap, steps, lv, x2ok…}; 405's recorder report carries it (q110).
   • Reduce motion / Animations Off: the crowd's own gates (193 / 209 / 283) still come first; this only takes more away.
   Kill switch localStorage flavius_v110autooff=1 = v1.09c exactly (no Quality card, 399 / 406 / 410 as before, no fresh layer).
   Test tv110a.
   ===================================================================== */
const Q110=window.Q110={off:(()=>{try{return localStorage.getItem('flavius_v110autooff')==='1'}catch(e){return false}})(),
  fresh:(()=>{try{return localStorage.getItem('flavius_l106freshoff')!=='1'}catch(e){return true}})(),
  run:(()=>{try{const v=localStorage.getItem('flavius_v110autorun');return v==='1'||(v!=='0'&&!/HeadlessChrome/.test(navigator.userAgent||''))}catch(e){return false}})(),
  mode:'auto',tier:'high',rung:0,why:'',cap:'',start:0,steps:[],downs:[0,0,0],pend:null,bk:[],tLast:0,lastStep:-1e9,quietUntil:0,lastDraw:0,smp:0,
  x2ok:false,sheets:null,lv:null,raw:0,real:null,webkit:false,phone:false,st:{samples:0,commits:0,x2swap:0,fresh:0}};
const Q110K={slowMs:17.5,slowPh:34,win:5000,min:40,share:0.6,upWin:20000,upMin:120,upShare:0.1,gap:10000,settle:4000,x2Win:30000,x2Min:200,maxDowns:3,maxWait:160000}; /* TWEAK */
/* the four rungs (Auto) and the three presets (manual) */
const Q110_R=[{n:'high',tier:'high',light:'full',crowd:'full',dpr:'top'},{n:'high-light',tier:'high',light:'light',crowd:'full',dpr:'top'},
  {n:'medium',tier:'medium',light:'light',crowd:'react',dpr:'mid'},{n:'low',tier:'low',light:'off',crowd:'still',dpr:'low'}];
const Q110_P={high:0,medium:2,low:3};
const q110MaxRung=()=>Q110.phone?3:2;   /* follow-up 1a: desktops floor at Medium */
if(!Q110.off){try{Q110.webkit=typeof P107S!=='undefined'&&!P107S.off&&!!P107S.webkit}catch(e){}
  try{SETTINGS_DEF.quality110='auto'}catch(e){}}

/* the chosen preset: auto | high | medium | low */
function q110Mode(){let v='auto';try{v=SETTINGS.quality110||'auto'}catch(e){}return Q110_P[v]!=null?v:'auto'}
/* the levers now: {n, tier, light, crowd, dpr, x2} */
function q110Refresh(){const m=Q110.mode=q110Mode();const r=m==='auto'?Q110.rung:Q110_P[m];const R=Q110_R[r];
  Q110.lv={...R,x2:m==='auto'?Q110.x2ok:m==='high'};Q110.tier=R.tier;Q110.n=R.n;
  /* follow-up 3a: Quality drives the Light board flag (Low, or Auto at rung 3) */
  try{SETTINGS.lite84=(m==='low'||(m==='auto'&&r===3))?'on':'off'}catch(e){}return Q110.lv}
const q110Lv=()=>Q110.lv||q110Refresh();
const q110Phone=()=>{try{return typeof l106Phone==='function'?l106Phone():Math.min(innerWidth||9999,(screen&&screen.width)||9999)<=700}catch(e){return false}};

/* ---------- capability: the rung Auto starts on ---------- */
function q110Cap(){const why=[];let r=0;
  try{if(Q110.phone){r=Math.max(r,1);why.push('phone')}
    if(!Q110.run&&/HeadlessChrome/.test(navigator.userAgent||''))why.push('headless');   /* test machines: their memory / cores say nothing */
    else{const mem=navigator.deviceMemory;if(mem&&mem<=4){r=Math.max(r,mem<=2?2:1);why.push('memory '+mem+' GB')}
      const cores=navigator.hardwareConcurrency||0;if(!Q110.webkit&&cores&&cores<=2){r=Math.max(r,2);why.push(cores+' cores')}}
    if(Q110.webkit)why.push('webkit');
    let drop=false;try{drop=localStorage.getItem('flavius_light106drop')==='1'}catch(e){}if(drop){r=Math.max(r,1);why.push('slow before')}}catch(e){}
  return {r,why:why.join(', ')||'desktop'}}

/* ---------- the board's device ratio (406 W1's lever, every browser) ---------- */
function q110Real(){try{return Q110.real?Q110.real():1}catch(e){return 1}}
/* the ratio the page had before v1.10 (WebKit: 406's cap) — for decisions that are not about sharpness (138/160 lite84On) */
function q110BaseDpr(r){if(!Q110.webkit||typeof W1==='undefined')return r;return Math.min(r,W1.fixed||W1.cap)}
function q110DprCap(r){if(Q110.raw)return q110BaseDpr(r);const L=q110Lv();let c=Infinity;const wk=Q110.webkit&&typeof W1!=='undefined';
  if(L.dpr==='top')c=wk?W1.cap:Infinity;else if(L.dpr==='mid')c=wk?W1.low:1.5;else c=1;
  if(wk&&W1.fixed)c=W1.fixed;
  if(Q110.phone&&r>=3)c=Math.min(c,2);   /* follow-up 2a: always, not only zoomed */
  return c}
if(!Q110.off){(()=>{let o=window,d=null;while(o&&!(d=Object.getOwnPropertyDescriptor(o,'devicePixelRatio')))o=Object.getPrototypeOf(o);
  const wk=Q110.webkit&&typeof W1!=='undefined'&&W1.real;if(!wk&&(!d||!d.get))return;
  Q110.real=wk?W1.real:()=>d.get.call(window);
  try{Object.defineProperty(window,'devicePixelRatio',{configurable:true,get(){const r=q110Real()||1;return Math.min(r,q110DprCap(r))}})}catch(e){Q110.real=null;return}
  /* 406 W1's own drop rule retired: its draw wrapper stops sampling once "dropped"; the value is ours now */
  if(Q110.webkit&&typeof W1!=='undefined')W1.dropped=true})()}
if(!Q110.off&&typeof w1Real==='function'){const base=w1Real;w1Real=function(){return Q110.real?q110Real():base.apply(this,arguments)}}
if(!Q110.off&&typeof lite84On==='function'){const base=lite84On;lite84On=function(){Q110.raw++;try{return base.apply(this,arguments)}finally{Q110.raw--}}}

/* ---------- lighting (399 / 409 follow l106Pref) ---------- */
const q110LightSet=()=>{let v=null;try{v=SETTINGS.light106}catch(e){}return v==='full'||v==='light'||v==='off'?v:null};
if(!Q110.off&&typeof l106Pref==='function'&&typeof L106!=='undefined'){const base=l106Pref;
  l106Pref=function(){if(L106.kill||L106.ov||q110LightSet())return base.apply(this,arguments);return q110Lv().light};
  /* 399's own Full → Light drop is Auto's rung 1 now */
  L106.noAuto=true;L106.auto=null}

/* ---------- crowd / secondary animation (193 walk-in, 209 bursts, 283 stand-ups) ---------- */
const Q110C={p0:typeof CHEER92!=='undefined'&&Array.isArray(CHEER92.p)?CHEER92.p.slice():null,st0:typeof STAND100!=='undefined'?STAND100.on:null,cur:''};
function q110Crowd(){const c=q110Lv().crowd;if(c===Q110C.cur)return;Q110C.cur=c;
  try{if(Q110C.p0)CHEER92.p=c==='full'?Q110C.p0.slice():Q110C.p0.map(()=>0)}catch(e){}
  try{if(Q110C.st0!=null)STAND100.on=c==='full'?Q110C.st0:false}catch(e){}}
if(!Q110.off&&typeof walkOK91==='function'){const base=walkOK91;walkOK91=function(){if(q110Lv().crowd!=='full')return false;return base.apply(this,arguments)}}
if(!Q110.off&&typeof cheer92OK==='function'){const base=cheer92OK;cheer92OK=function(){if(q110Lv().crowd==='still')return false;return base.apply(this,arguments)}}

/* ---------- 2× figure sheets (410) ---------- */
if(!Q110.off&&typeof x108Want==='function'){const base=x108Want;
  x108Want=function(){const e=base.apply(this,arguments);if(!e||X108.force)return e;return !!q110Lv().x2}}
/* at an event start: the loaded sheets follow the choice (Auto only ever upgrades; a manual preset may go back to 1×) */
function q110Sheets(){if(typeof x108Want!=='function'||typeof X108==='undefined')return;const want=!!x108Want();
  if(Q110.sheets===null||Q110.sheets===want){Q110.sheets=want;return}Q110.sheets=want;Q110.st.x2swap++;
  try{for(const s of AN100.src.values()){if(!s.cls)continue;for(const set of ['move','act']){const o=s[set];if(!o||!o.meta||!o.meta.x2||o.loading||!o.img)continue;
      if((o.k===2)===want)continue;for(const n of Object.keys(o.bm||{})){const b=o.bm[n];if(b&&b.bm&&b.bm.close)try{b.bm.close()}catch(e){}}o.bm={};o.img=null;o.k=0}}}catch(e){}
  try{if(want){for(const k of Object.keys(BEAST100X2_META))if(!BST108X1[k])for(const id of [k,k+'_act'])if(BST100.img[id]&&!BST100.img[id]._x2)delete BST100.img[id];BST100.cc.clear()}
    else for(const k of Object.keys(BST108X1))x108Back(k)}catch(e){}}

/* ---------- Auto: samples, judgement, steps ---------- */
function q110Budget(){return Q110.phone?Q110K.slowPh:Q110K.slowMs}
/* one frame interval (ms) at time t: per-second buckets {s, n, late} */
function q110Feed(dt,t){if(Q110.off||Q110.mode!=='auto'||!(dt>0)||dt>250)return;t=t==null?performance.now():t;Q110.tLast=t;if(t<Q110.quietUntil)return;
  const s=Math.floor(t/1000),B=Q110.bk;let b=B[B.length-1];if(!b||b.s!==s){b={s,n:0,late:0};B.push(b);while(B.length&&B[0].s<s-Q110K.maxWait/1000)B.shift()}
  b.n++;if(dt>q110Budget())b.late++;Q110.st.samples++;q110Judge(t)}
function q110Win(t,ms){let n=0,late=0;const s0=(t-ms)/1000;for(let i=Q110.bk.length-1;i>=0;i--){const b=Q110.bk[i];if(b.s<s0)break;n+=b.n;late+=b.late}return {n,late,share:n?late/n:0}}
function q110Judge(t){if(Q110.pend||Q110.mode!=='auto')return;if(t-Q110.lastStep<Q110K.gap)return;const r=Q110.rung;
  const w=q110Win(t,Q110K.win);
  if(r<q110MaxRung()&&w.n>=Q110K.min&&w.share>=Q110K.share){q110Pend(r+1,'slow frames ('+Math.round(w.share*100)+'% late)',t);return}
  if(r>0){const dn=Q110.downs[r-1]||0;if(dn>=Q110K.maxDowns)return;const need=Math.min(Q110K.maxWait,Q110K.upWin*Math.pow(2,Math.max(0,dn-1)));
    if(t-Q110.lastStep<need)return;const u=q110Win(t,need);if(u.n>=Q110K.upMin&&u.share<=Q110K.upShare)q110Pend(r-1,'headroom',t);return}
  if(!Q110.x2ok&&t-Q110.lastStep>=Q110K.x2Win){const u=q110Win(t,Q110K.x2Win);if(u.n>=Q110K.x2Min&&u.share<=Q110K.upShare){Q110.x2ok=true;q110Refresh();
    Q110.steps.push({t:Math.round(t),x2:true,why:'2× sheets: frames keep up'});Q110.why='2× sheets: frames keep up'}}}
function q110Pend(to,why,t){Q110.pend={to,why,t};q110Poll()}
/* quiet: nothing animating on the sand now */
function q110Quiet(strict){try{if(typeof fxRAF!=='undefined'&&fxRAF)return false;if(typeof AN100!=='undefined'&&AN100.raf)return false;
  if(typeof zoom103Moving==='function'&&zoom103Moving())return false;if(typeof WALK91_RAF!=='undefined'&&WALK91_RAF)return false;
  if(strict&&performance.now()-Q110.lastDraw<250)return false}catch(e){}return true}
let Q110_POLL=0;
function q110Poll(){if(Q110_POLL||!Q110.pend)return;Q110_POLL=setTimeout(()=>{Q110_POLL=0;if(!Q110.pend)return;if(q110Quiet(true))q110Commit();else q110Poll()},300)}
function q110Commit(){const P=Q110.pend;if(!P)return false;Q110.pend=null;if(Q110.mode!=='auto')return false;const from=Q110.rung,t=Q110.tLast||P.t;
  if(P.to>from)Q110.downs[from]=(Q110.downs[from]||0)+1;
  Q110.rung=P.to;Q110.why=P.why;Q110.lastStep=t;Q110.quietUntil=t+Q110K.settle;Q110.bk=[];
  if(P.to===0&&!Q110.webkit)Q110.x2ok=true;
  Q110.steps.push({t:Math.round(t),from:Q110_R[from].n,to:Q110_R[P.to].n,why:P.why});if(Q110.steps.length>40)Q110.steps.shift();Q110.st.commits++;
  q110Refresh();q110Crowd();try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(e){}return true}
/* test / bench hooks */
Q110.feed=q110Feed;Q110.judge=q110Judge;Q110.commit=q110Commit;Q110.refresh=()=>{q110Refresh();q110Crowd();return Q110.lv};

if(!Q110.off){
  Q110.phone=q110Phone();const C=q110Cap();Q110.rung=Q110.start=C.r;Q110.cap=C.why;Q110.why='start: '+C.why;Q110.x2ok=C.r===0&&!Q110.webkit;
  /* settings migration (once): 399's old drop under an explicit Full = Auto decides now; any other explicit Lighting choice stays as the override */
  try{if((SETTINGS.q110v|0)<2){const v0=SETTINGS.q110v|0;SETTINGS.q110v=2;
    /* follow-up 3a: an explicit old Light board ON becomes Quality Low, only if no Quality was chosen yet */
    if(SETTINGS.lite84==='on'&&(!SETTINGS.quality110||SETTINGS.quality110==='auto'))SETTINGS.quality110='low';
    if(!v0){let drop=false;try{drop=localStorage.getItem('flavius_light106drop')==='1'}catch(e){}
    if(drop&&SETTINGS.light106==='full')delete SETTINGS.light106;if(!SETTINGS.quality110)SETTINGS.quality110='auto'}
    try{lsSet('settings',SETTINGS)}catch(e){}}}catch(e){}
  q110Refresh();q110Crowd();
  /* samples: the two frames after a board draw (both commit what the draw asked for) */
  {const base=draw;draw=function(){const r=base.apply(this,arguments);try{Q110.lastDraw=performance.now();
      if(Q110.run&&!Q110.smp&&Q110.mode==='auto'&&!HEADLESS&&!document.hidden&&typeof S!=='undefined'&&S&&!S.sim){Q110.smp=1;
        requestAnimationFrame(a=>requestAnimationFrame(b=>{Q110.smp=0;q110Feed(b-a,b)}))}}catch(e){}return r}}
  if(typeof BUS!=='undefined'){BUS.on('turn.begin',()=>{if(Q110.pend&&q110Quiet(false))q110Commit()});
    BUS.on('event.start',e=>{if(e&&e.sim)return;Q110.quietUntil=(Q110.tLast||0)+Q110K.settle;try{q110Sheets()}catch(x){}})}
  if(typeof applySettings==='function'){const base=applySettings;applySettings=function(){const m0=Q110.mode,r=base.apply(this,arguments);try{q110Refresh();q110Crowd();
      if(Q110.mode!==m0){Q110.pend=null;Q110.bk=[];Q110.steps.push({t:Math.round(performance.now()),set:Q110.mode})}}catch(e){}return r}}
  /* 405's recorder: what Auto chose */
  if(typeof rec107Extra==='function'){const base=rec107Extra;rec107Extra=function(){const o=base.apply(this,arguments)||{};try{
      o.q110={mode:Q110.mode,tier:Q110.tier,rung:Q110.n,why:Q110.why,cap:Q110.cap,lv:{...Q110.lv},x2ok:Q110.x2ok,x2:typeof X108!=='undefined'?{on:X108.on,why:X108.why}:null,
        dpr:{real:q110Real(),used:window.devicePixelRatio||1},steps:Q110.steps.slice(-12),light:typeof l106Mode==='function'?l106Mode():'',pend:Q110.pend};
      if(o.page)o.page.dprDropped=Q110.tier!=='high'}catch(e){o.q110err=String(e)}return o}}}

/* ---------- 5a · 399's static layer: a fresh canvas every build ---------- */
if(!Q110.off&&Q110.fresh&&typeof l106Build==='function'&&typeof L106!=='undefined'){const base=l106Build;
  l106Build=function(){const old=L106.layer;L106.layer=null;try{const r=base.apply(this,arguments);Q110.st.fresh++;return r}catch(e){if(!L106.layer)L106.layer=old;throw e}}}

/* ---------- Settings → Board & pieces: Quality first, Lighting under it ---------- */
function q110Name(t){return t==='high'?_T('High'):t==='medium'?_T('Medium'):_T('Low')}
function q110Desc(){const m=Q110.mode;let d=_T('High: sharpest board, full shadows and crowd. Medium: lighter shadows, calmer crowd. Low: the fastest.');
  if(m==='auto')d=_T('Auto picks for this device and adjusts while you play.')+' '+_T`Now: ${q110Name(Q110.tier)}.`;return d}
function q110Card(){const m=Q110.mode;
  const seg=`<div class="seg s98-seg" role="group" aria-label="${_T('Quality')}">${[['auto',_T('Auto')],['high',_T('High')],['medium',_T('Medium')],['low',_T('Low')]].map(([k,l])=>`<button type="button" data-q110="${k}" class="${m===k?'on':''}" aria-pressed="${m===k}">${l}</button>`).join('')}</div>`;
  let rows=set98Row(_T('Quality'),`<span id="q110d">${q110Desc()}</span>`,seg);
  if(typeof L106!=='undefined'&&!L106.kill){const own=q110LightSet(),cur=own||'q';
    const ls=`<div class="seg s98-seg" role="group" aria-label="${_T('Lighting')}">${[['q',_T('By quality')],['full',_T('Full')],['light',_T('Light')],['off',_T('Off')]].map(([k,l])=>`<button type="button" data-light106="${k}" class="${cur===k?'on':''}" aria-pressed="${cur===k}">${l}</button>`).join('')}</div>`;
    rows+=set98Row(_T('Lighting'),_T('Full: the sun casts shadows from pillars, gladiators and beasts. Light: soft shadows at their feet only. Off: flat, the fastest.'),ls)}
  return set98Card('⚙',_T('Quality'),`<div class="s98-rows">${rows}</div>`,{span:1})}
if(!Q110.off&&typeof set98Pieces==='function'&&typeof set98Card==='function'){const base=set98Pieces;set98Pieces=function(){const h=base.apply(this,arguments);try{
    const t=document.createElement('template');t.innerHTML=h;const old=t.content.querySelector('[data-light106]');const card=old&&old.closest('section.s98-card');if(card)card.remove();
    const st=t.content.querySelector('.s98-stack');if(!st)return h;const w=document.createElement('template');w.innerHTML=q110Card();st.insertBefore(w.content,st.firstChild);
    return t.innerHTML}catch(e){console.error(e);return h}}}
if(!Q110.off){document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
  const q=t.closest('[data-q110]');if(q){SETTINGS.quality110=q.dataset.q110;applySettings();
    q.parentElement.querySelectorAll('[data-q110]').forEach(x=>{x.classList.toggle('on',x===q);x.setAttribute('aria-pressed',String(x===q))});
    const d=document.getElementById('q110d');if(d)d.textContent=q110Desc();try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(x){}return}
  const l=t.closest('[data-light106="q"]');if(l){delete SETTINGS.light106;applySettings();try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(x){}}})}
