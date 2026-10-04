/* 93-v71 — Virgilante's printed pieces in the game.
   • His medallion tokens replace the matching cells of assets/rtok.webp (chest, keys, armor/weapon L1-3, armor upgrades, elixirs,
     Speed of Mercury, Crowd Favor, spiders, curse, golden eagle, water, boar, blessing) — every rtok consumer picks them up;
     a 'key2' cell (2× Arena Keys) was added. Source art: tools/art/medallions/.
   • His gold coin (assets/coin.webp) is ICO.coin everywhere.
   • The summa rudis medallions (assets/sr_<key>.webp): beside Flavius's box while they officiate, in the event briefing, the
     status chip, the festival picker and on Manager's Grand Games line.
   • The Mandata Flavi card back (assets/mandata_back.webp) on hidden objectives; "Mandati" → "Mandata" across the game.
   • The round marker (assets/round.webp, "ROUND :" baked in, the number on top) in the status bar.
   • The stands line moves from under the arena into the arena log as a pinned top row (#slogPin, click → Stands).
   • A gold wager bubble pops above whoever places a live wager (spectators, gladiators, you). */
const SR_KEYS=['democritus','egidious','cassian'];
const srKey=ev=>{const k=String((ev&&ev.sr)||'').toLowerCase();return SR_KEYS.includes(k)?k:null};
const srImgHTML=(k,size,cls)=>k?`<img class="srmed ${cls||''}" src="${assetURL('sr_'+k+'.webp')}" alt="Summa Rudis ${k[0].toUpperCase()+k.slice(1)}" title="Summa Rudis ${k[0].toUpperCase()+k.slice(1)}" style="width:${size}px;height:${size}px">`:'';
/* the coin */
ICO.coin=`<img class="ico coinimg" src="${assetURL('coin.webp')}" alt="coin">`;
/* summa rudis beside Flavius (canvas) */
const SR_IMG={};const srImage=k=>{if(SR_IMG[k])return SR_IMG[k].complete&&SR_IMG[k].naturalWidth?SR_IMG[k]:null;const im=new Image();im.onload=()=>{try{draw()}catch(e){}};im.src=assetURL('sr_'+k+'.webp');SR_IMG[k]=im;return null};
{const base=drawFlavius;drawFlavius=function(){const r=base.apply(this,arguments);try{if(!S||HEADLESS||S.phase==='setup'||(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false))return r;const k=srKey(EV());if(!k)return r;const im=srImage(k);if(!im)return r;
  const a=iso(0,0);const w=TW*1.55*flavK(),h=TW*1.2*flavK();const cx=STANDS?a.x:Math.max(w/2+8,a.x-TW*5.2),cy=STANDS?Math.max(h/2+6,a.y-TW*2.62-h/2):h/2+8;const d=h*0.78;
  if(typeof srBtnAt==='function')srBtnAt(cx+w/2,cy-h/2,d) /* v0.74: never drawn on the sand — a seal at the box's corner opens it */}catch(e){}return r}}
/* the briefing and the status bar */
{const base=briefingHTML;briefingHTML=function(){let h=base.apply(this,arguments);try{const k=srKey(EV());if(k)h=h.replace('<div class="brname">',`<div class="brsr">${srImgHTML(k,58)}<span class="rc-sub">Summa Rudis<br><b>${esc(EV().sr)}</b></span></div><div class="brname">`)}catch(e){}return h}}
function statusDecor(){const st=document.getElementById('status');if(!st||!S||S.phase==='setup')return;
  for(const c of st.querySelectorAll('.chip')){const t=c.getAttribute('title')||'';
    const m=/^Round (\d+) of/.exec(t);if(m&&!c.querySelector('.roundmk')){c.classList.add('roundchip');c.innerHTML=c.innerHTML.replace(/^Round \d+\/\d+ · /,'');c.insertAdjacentHTML('afterbegin',`<span class="roundmk" aria-label="Round ${m[1]}"><img src="${assetURL('round.webp')}" alt=""><b>${m[1]}</b></span>`)}
    const k=srKey(EV());if(k&&/Summa Rudis/.test(t)&&!c.querySelector('.srmed'))c.insertAdjacentHTML('afterbegin',srImgHTML(k,20,'inchip'))}}
{const base=render;render=function(){const r=base.apply(this,arguments);try{statusDecor()}catch(e){}return r}}
/* festival setup: the medallion beside the picker */
document.addEventListener('change',e=>{if(e.target&&e.target.id==='festSR'){const im=document.getElementById('festSRimg');if(im)im.outerHTML=srImgHTML(e.target.value,44,'festsr').replace('<img','<img id="festSRimg"')}});
{const base=openSetup;openSetup=function(){const r=base.apply(this,arguments);setTimeout(function fx(n){const s=document.getElementById('festSR');if(s&&!document.getElementById('festSRimg'))s.insertAdjacentHTML('afterend',srImgHTML(s.value,44,'festsr').replace('<img','<img id="festSRimg"'));else if(!s&&n<20)setTimeout(()=>fx(n+1),250)},300,0);return r}}
/* Manager: Cassian presides over the Grand Games */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(' · the Grand Games: purses ×1.6',` · ${srImgHTML('cassian',22,'inline')} the Grand Games, Cassian presiding: purses ×1.6`)}catch(e){}return h}}
/* the Mandata Flavi card back on hidden objectives */
{const base=boardHTML;boardHTML=function(){let h=base.apply(this,arguments);try{h=h.split('<div class="item mf"><span><span>Mandata Flavi<em>Secret objective').join(`<div class="item mf"><span><img class="mfback" src="${assetURL('mandata_back.webp')}" alt="Mandata Flavi card back"><span>Mandata Flavi<em>Secret objective`)}catch(e){}return h}}
/* the stands line, pinned at the top of the arena log */
tickerApply=function(){const el=document.getElementById('crowdTick');if(el)el.hidden=true;slogPinApply()};
let SLOG_N=0;
function slogPinApply(){const ol=document.getElementById('log');if(!ol)return;let li=document.getElementById('slogPin');
  const L=S&&S.spectLog||[];const e=L[L.length-1];const on=!!(S&&S.phase!=='setup'&&!S.over&&e);
  if(!on){if(li)li.remove();SLOG_N=0;return}
  if(!li){li=document.createElement('li');li.id='slogPin';li.className='slogpin';li.setAttribute('role','button');li.tabIndex=0;li.title='Open the stands'}
  if(ol.firstChild!==li)ol.prepend(li);
  if(L.length!==SLOG_N){li.innerHTML=`<span class="tk">🏟</span><span class="tkr">R${e.r}</span><span class="tkt">${e.html}</span>`;
    if(SLOG_N&&!(typeof reduceMotion==='function'&&reduceMotion())){li.classList.remove('flash');void li.offsetWidth;li.classList.add('flash')}SLOG_N=L.length}}
{const base=log;log=function(){const r=base.apply(this,arguments);try{const li=document.getElementById('slogPin');const ol=document.getElementById('log');if(li&&ol&&ol.firstChild!==li)ol.prepend(li)}catch(e){}return r}}
document.addEventListener('click',e=>{if(e.target.closest('#slogPin')&&typeof sideTab==='function')sideTab('stands')});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest&&e.target.closest('#slogPin')&&typeof sideTab==='function'){e.preventDefault();sideTab('stands')}});
/* live wager bubbles */
const WB_SEEN=new WeakSet();let WB_SELF=0,WB_ME=0,WB_EV=null;
function wagerBubble(x,y,amt,unit,who){if(HEADLESS)return;let box=document.getElementById('wbubs');if(!box){const cw=document.querySelector('.canvas-wrap');if(!cw)return;box=document.createElement('div');box.id='wbubs';cw.appendChild(box)}const el=document.createElement('div');el.className='wbub';
  el.innerHTML=`${unit==='cf'?ICO.wheat:ICO.coin}<b>${amt}</b>${unit==='cf'?'<small>CF</small>':''}`;if(who)el.title=`${who} places a wager`;
  el.style.left=x+'px';el.style.top=y+'px';box.appendChild(el);setTimeout(()=>el.remove(),2300)}
function wagerWatch(){if(HEADLESS||!S||S.phase==='setup'||S.sim||S.snap||S.over)return;
  if(WB_EV!==S){WB_EV=S;WB_SELF=0;WB_ME=(S.bets||[]).length;for(const sp of S.spect||[])if(sp.bet)WB_SEEN.add(sp.bet);for(const p of S.players)if(p.selfBet)WB_SEEN.add(p.selfBet);return}
  for(const sp of S.spect||[]){if(!sp.bet||WB_SEEN.has(sp.bet)||sp.gone)continue;WB_SEEN.add(sp.bet);if(sp._x!=null&&STANDS)wagerBubble(sp._x,sp._y-TW*0.5,sp.bet.amt,'cf',sp.name)}
  for(const p of S.players){if(!p.selfBet||WB_SEEN.has(p.selfBet))continue;WB_SEEN.add(p.selfBet);if(p.alive){const m=center(p.r,p.c);wagerBubble(m.x,m.y-TW*1.1,p.selfBet.stake,'coin',p.name)}}
  const B=S.bets||[];if(B.length>WB_ME){const b=B[B.length-1];const me=(S.spect||[]).find(s=>s.human);const p=S.players.find(q=>!q.cpu&&q.alive);
    if(me&&me._x!=null&&STANDS)wagerBubble(me._x,me._y-TW*0.5,b.stake,'coin','You');else if(p){const m=center(p.r,p.c);wagerBubble(m.x,m.y-TW*1.1,b.stake,'coin','You')}}WB_ME=B.length}
setInterval(()=>{try{wagerWatch();slogPinApply()}catch(e){}},300);
(()=>{const st=document.createElement('style');st.textContent=`
.ico.coinimg{width:1.15em;height:1.15em;vertical-align:-.22em;object-fit:contain;display:inline-block}
.srmed{border-radius:50%;object-fit:contain;vertical-align:middle;flex:none}.srmed.inchip{margin-right:5px;vertical-align:-5px}.srmed.inline{vertical-align:-6px}.srmed.festsr{margin-left:8px;vertical-align:middle}
.brsr{display:flex;align-items:center;gap:8px;margin:0 0 4px}.brsr b{color:var(--gold2)}
.roundchip{display:inline-flex;align-items:center;gap:6px}
.roundmk{position:relative;display:inline-block;height:30px;margin:-5px 0;flex:none}.roundmk img{height:30px;width:auto;display:block}
.roundmk b{position:absolute;left:76.2%;top:50%;transform:translate(-50%,-48%);font:700 17px/1 var(--display);color:#f0e8d6;text-shadow:0 0 2px #96703c,0 1px 1px #000}
.item .mfback{width:30px;height:auto;border-radius:3px;margin-right:8px;box-shadow:0 1px 4px rgba(0,0,0,.5)}
#log li.slogpin{position:sticky;top:-10px;z-index:2;display:flex;gap:8px;align-items:baseline;cursor:pointer;background:var(--panel2);border-bottom:2px solid var(--line2);margin:-10px -14px 4px;padding:6px 14px;font-size:14px;color:var(--bone)}
#log li.slogpin:hover{background:#33261b}#log li.slogpin .tkr{color:var(--dim);font:11px var(--mono);flex:none}#log li.slogpin .tk{flex:none}
#log li.slogpin .tkt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#log li.slogpin .tkt *{display:inline}
#log li.slogpin.flash{animation:tkflash 1.2s ease-out}
#wbubs{position:absolute;inset:0;pointer-events:none;z-index:3}
.wbub{position:absolute;transform:translate(-50%,-100%);display:flex;align-items:center;gap:4px;padding:3px 9px 3px 4px;border-radius:999px;background:linear-gradient(#f6d77a,#c99a2e);border:2px solid #7a5a14;color:#2a1c06;font:700 14px var(--mono);box-shadow:0 4px 12px rgba(0,0,0,.55);pointer-events:none;animation:wbub 2.2s ease-out forwards;white-space:nowrap}
.wbub .ico{width:20px;height:20px}.wbub small{font-size:10px;margin-left:1px}
@keyframes wbub{0%{opacity:0;transform:translate(-50%,-70%) scale(.7)}12%{opacity:1;transform:translate(-50%,-100%) scale(1.08)}22%{transform:translate(-50%,-100%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-160%)}}
body.calm .wbub{animation:none;opacity:1}
body.chromeoff #wbubs{display:none}`;document.head.appendChild(st)})();
/* the old-save question opens as its own small centred window (it used to be inserted beside the button and squeezed save cards) */
verAsk=function(anchor,v){return new Promise(res=>{for(const o of document.querySelectorAll('.verask,.veraskbg'))o.remove();
  const bg=document.createElement('div');bg.className='veraskbg';const bar=document.createElement('div');bar.className='card2 verask';bar.setAttribute('role','dialog');bar.setAttribute('aria-modal','true');
  bar.innerHTML=`<b>⬆ This save is from ${esc(verLabel(v))}.</b><div class="rc-sub" style="margin:4px 0 10px">It will be upgraded to v${GAME_VER} as it loads: fields newer versions need are filled in (fighters’ purses, season records) and broken offers are dropped. Your record, roster and treasury stay as they are.</div><div class="acts"><button type="button" class="btn primary" data-verask="yes">Upgrade and load</button><button type="button" class="btn" data-verask="no">Cancel</button></div>`;
  bg.appendChild(bar);document.body.appendChild(bg);const done=ok=>{bg.remove();document.removeEventListener('keydown',key,true);res(ok)};
  const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done(false)}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-verask]');if(b)done(b.dataset.verask==='yes');else if(e.target===bg)done(false)});
  setTimeout(()=>{const y=bar.querySelector('[data-verask="yes"]');if(y)y.focus()},30)})};
(()=>{const st=document.createElement('style');st.textContent=`.veraskbg{position:fixed;inset:0;z-index:4000;background:rgba(8,5,3,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.veraskbg .verask{width:min(440px,100%);margin:0;padding:14px 16px;border-color:var(--gold);box-shadow:0 18px 50px rgba(0,0,0,.7)}.veraskbg .verask .acts .btn{flex:1 1 140px}`;document.head.appendChild(st)})();
