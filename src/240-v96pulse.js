/* v0.97 (240-v96pulse): hosting pulse + join flash in Online. While I host a WAITING room the Lobby Browser rail tab pulses (my list row = a static gold outline)
   (gold, ~2 s; Reduce motion/calm = a static highlight; body.idle92 pauses it). A NEW lanista joining it flashes the rail tab and the
   new seat/name GREEN for 1.5 s and, if the room screen is not showing, a toast "<name> joined your room". Cosmetic only: state lives on PULSE96,
   classes are re-applied after every onlRedraw (morph91 patches). Never in S / onlHash. */
const PULSE96={seen:{},left:{},flash:{},tm:0};
function pu96Mine(){const me=typeof onlMe80==='function'?onlMe80():null;if(!me)return null;return (ONL.lobbies||[]).find(L=>L&&L.status==='waiting'&&L.host&&L.host.id===me&&(L.members||L.players||[]).some(m=>m.id===me))||null}
function pu96Looking(){return !!(document.getElementById('onl')&&document.getElementById('onlRoom80')&&ONL.tab==='play')}
function pu96Scan(){try{const me=onlMe80();const L=pu96Mine();const now=Date.now();
  if(!L){PULSE96.seen={};PULSE96.flash={};return}
  const ids=(L.members||L.players||[]).map(m=>m.id);const prev=PULSE96.seen[L.id];
  for(const k of Object.keys(PULSE96.seen))if(k!==L.id)delete PULSE96.seen[k];
  if(prev){for(const id of prev)if(!ids.includes(id))PULSE96.left[id]=now;
    for(const id of ids){if(prev.includes(id)||id===me)continue;if(now-(PULSE96.left[id]||0)<5000)continue;
      const m=(L.members||L.players).find(x=>x.id===id);PULSE96.flash[id]=now+1500;PULSE96.flash.__tab=now+1500;
      if(!pu96Looking()&&typeof mToast==='function')mToast(_T`${esc2((m&&m.name)||'A lanista')} joined your room`)}}
  PULSE96.seen[L.id]=ids}catch(e){}}
function pu96Apply(){try{const root=document.getElementById('onl');if(!root)return;const now=Date.now();const L=pu96Mine();
  const tab=root.querySelector('.onl-rail [data-onl="tab"][data-v="lobby"]');
  const flashTab=(PULSE96.flash.__tab||0)>now;
  if(tab){tab.classList.toggle('pu96',!!L);tab.classList.toggle('pu96g',!!L&&flashTab)}
  root.querySelectorAll('tr[data-row]').forEach(r=>{const mine=!!L&&r.dataset.row===L.id;r.classList.toggle('pu96row',mine)});
  root.querySelectorAll('[data-bub96]').forEach(s=>{const seat=s.closest('.r80-seat');if(seat)seat.classList.toggle('pu96g',(PULSE96.flash[s.dataset.bub96]||0)>now)});
  root.querySelectorAll('[data-u96]').forEach(u=>u.classList.toggle('pu96g',(PULSE96.flash[u.dataset.u96]||0)>now));
  clearTimeout(PULSE96.tm);let next=0;for(const k of Object.keys(PULSE96.flash)){const t=PULSE96.flash[k];if(t>now&&(!next||t<next))next=t}
  if(next)PULSE96.tm=setTimeout(pu96Apply,next-now+30)}catch(e){}}
{const base=onlRedraw;onlRedraw=function(){pu96Scan();const r=base.apply(this,arguments);pu96Apply();return r}}
/* my own leave: the stale copy of the room goes at once (the host passes on; the list refreshes later) */
{const base=NET.req;NET.req=function(t,d){const r=base.apply(this,arguments);if(t==='lobby.leave'||t==='lobby.close'){const id=d&&d.id;Promise.resolve(r).then(()=>{try{ONL.lobbies=(ONL.lobbies||[]).filter(x=>x&&x.id!==id);pu96Scan();pu96Apply()}catch(e){}},()=>{})}return r}}
NET.on('lobby.update',()=>{setTimeout(()=>{pu96Scan();pu96Apply()},0)});
{const st=document.createElement('style');st.textContent=`
@keyframes pu96p{0%,100%{box-shadow:0 0 0 0 rgba(232,170,60,0)}50%{box-shadow:0 0 10px 2px rgba(232,170,60,.65)}}
@keyframes pu96f{0%{box-shadow:0 0 0 0 rgba(80,220,110,.9)}100%{box-shadow:0 0 14px 4px rgba(80,220,110,0)}}
#onl .onl-rail button.pu96{animation:pu96p 2s ease-in-out infinite;border-color:#d9a441}
#onl tr.pu96row td{background:rgba(232,170,60,.12);border-top:1px solid #d9a441;border-bottom:1px solid #d9a441}
body.idle92 #onl .pu96{animation-play-state:paused}
#onl .pu96g{animation:pu96f 1.5s ease-out 1;background:rgba(80,220,110,.22)!important;outline:1px solid #50dc6e}
body.calm #onl .pu96,body.calm #onl .pu96g{animation:none}
body.calm #onl .onl-rail button.pu96{box-shadow:inset 0 0 0 2px rgba(232,170,60,.7)}
@media (prefers-reduced-motion:reduce){#onl .pu96,#onl .pu96g{animation:none}#onl .onl-rail button.pu96{box-shadow:inset 0 0 0 2px rgba(232,170,60,.7)}}`;
document.head.appendChild(st)}
