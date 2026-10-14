/* 161-v88pl — v0.88 (his ask, 2026-10-05): the Online landing's FAMILIA playlist box slowly cycles through every other event playlist
   once it is tested and approved for online. ONL_EVENTS_OK88 = the approved list (add an event key here AND to the shared online
   events in 111-onlcore / the server when he gives the ok); only events the online rules know (ONLC.EVENTS_ALL, not the three
   Classics, which have their own box) join the cycle. One event → the box is the plain Familia card, as before.
   The cycle: a card every 9 s with a slow cross-fade, dots to jump, paused while the pointer or focus is in the box or the tab is hidden;
   reduce motion → no fade. The choice survives landing redraws (ROT88.i). */
const ONL_EVENTS_OK88=[]; /* approved for online, in the order they cycle after Familia — e.g. 'ludus' once he says ok */
const ROT88={i:0,at:0,MS:9000};
function rot88Events(){try{return ['familia',...ONL_EVENTS_OK88.filter(k=>k!=='familia'&&EVENTS[k]&&ONLC.EVENTS_ALL.includes(k)&&!ONLC.EVENTS3.includes(k))]}catch(e){return ['familia']}}
function rot88Card(k){const open=(ONL.lobbies||[]).filter(L=>L.ev===k&&L.status==='waiting');const E=EVENTS[k]||{};const tm=ONLC.EVENTS_TEAM.includes(k);
  const seats=k==='familia'?_T('👥 Teams · 4–8 seats'):tm?_T`👥 Teams · ${E.min}–${E.max} seats`:_T`${E.min===E.max?E.min:E.min+'–'+E.max} seats`;
  return `<div class="onl-pl pl81 pl81-${ONL_PLTONE81[k]||'olive'} ${tm?'team':''}" data-pl81="${k}"><div class="onl-plart">${typeof cardHTML==='function'?cardHTML('e:'+k,'sm'):''}</div><div class="onl-plb">${_T`<b>${esc2(onlEvName(k))}</b><span class="badge gold">${seats}</span><small>${open.length} open · ${open.filter(L=>L.ranked).length} ranked</small>`}
    <div class="acts"><button type="button" class="btn primary tksm" data-onl="quick" data-v="${k}|1">${_T`⚔ Ranked`}</button><button type="button" class="btn tksm" data-onl="quick" data-v="${k}|0">${_T`Custom`}</button></div></div></div>`}
{const base=onlPlayHTML;onlPlayHTML=function(){const h=base.apply(this,arguments);const evs=rot88Events();if(evs.length<2)return h;
  try{const T=document.createElement('template');T.innerHTML=h;const fam=T.content.querySelector('[data-pl81="familia"]');if(!fam)return h;
    /* an approved event gets no card of its own: it lives in the cycle */
    for(const k of evs.slice(1))T.content.querySelectorAll(`[data-pl81="${k}"]`).forEach(x=>x.remove());
    ROT88.i%=evs.length;if(!ROT88.at)ROT88.at=Date.now();const box=document.createElement('div');box.className='rot88';box.dataset.rot88='1';
    box.innerHTML=evs.map((k,i)=>`<div class="rot88s ${i===ROT88.i?'on':''}" aria-hidden="${i===ROT88.i?'false':'true'}">${k==='familia'?fam.outerHTML:rot88Card(k)}</div>`).join('')+
      `<div class="rot88d" role="tablist">${evs.map((k,i)=>`<button type="button" class="${i===ROT88.i?'on':''}" data-rot88i="${i}" aria-label="${esc2(onlEvName(k))}"></button>`).join('')}</div>`;
    fam.replaceWith(box);return T.innerHTML}catch(e){console.error(e);return h}}}
function rot88Show(box,i){const s=box.querySelectorAll(':scope > .rot88s'),d=box.querySelectorAll('.rot88d button');if(!s.length)return;ROT88.i=(i+s.length)%s.length;ROT88.at=Date.now();
  s.forEach((x,j)=>{x.classList.toggle('on',j===ROT88.i);x.setAttribute('aria-hidden',j===ROT88.i?'false':'true')});d.forEach((x,j)=>x.classList.toggle('on',j===ROT88.i))}
setInterval(()=>{try{if(document.hidden)return;const box=document.querySelector('#onl .rot88');if(!box||!box.offsetParent)return;
  if(box.matches(':hover')||box.contains(document.activeElement))return;if(Date.now()-ROT88.at<ROT88.MS)return;rot88Show(box,ROT88.i+1)}catch(e){}},1000);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rot88i]');if(!b)return;const box=b.closest('.rot88');if(box)rot88Show(box,+b.dataset.rot88i)});
{const css=document.createElement('style');css.textContent=`
#onl .rot88{position:relative;display:grid;min-height:100%}
#onl .rot88>.rot88s{grid-area:1/1;opacity:0;visibility:hidden;transition:opacity 1.2s ease,visibility 0s linear 1.2s}
#onl .rot88>.rot88s.on{opacity:1;visibility:visible;transition:opacity 1.2s ease}
#onl .rot88>.rot88s>.onl-pl{height:100%;box-sizing:border-box}
#onl .rot88d{position:absolute;right:10px;bottom:8px;display:flex;gap:6px;z-index:2}
#onl .rot88d button{width:9px;height:9px;padding:0;border-radius:50%;border:1px solid rgba(240,223,176,.7);background:transparent;cursor:pointer}
#onl .rot88d button.on{background:#e8c46a;border-color:#e8c46a}
body.calm #onl .rot88>.rot88s{transition:none}`;document.head.appendChild(css)}
