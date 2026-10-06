/* 210-v92fix — v0.92 fixes from his notes.
   • The Attack tile says WHY there is no attack (his note: "no attacks left" after coming out of a tunnel with no attack made):
     Telemachus Interdico! in play (no gladiator may attack until a 1 or 6 at a turn's start drags him out), no arm left, weapons
     spent (ammo / uses), or the two attacks already made. Display only. */
function atk92Why(p){try{if(S.active&&S.active.telemachus&&!isChariot())return _T('Telemachus Interdico! — no attacks until he is dragged out (a 1 or 6 at a turn’s start)');
  const arms=armsAttached(p);if(!arms.length)return _T('no arm left to attack with');if(p.attacks>=arms.length)return _T('no attacks left');
  return _T('your weapons are spent (no ammo or uses left)')}catch(e){return ''}}
{const base=render;render=function(){const r=base.apply(this,arguments);try{if(S&&S.phase==='action'){const b=document.querySelector('[data-act="none"]');const p=cur();
  if(b&&p&&!p.cpu){const why=atk92Why(p);const sm=b.querySelector('small');if(why&&sm&&sm.textContent!==why){sm.textContent=why;b.title=why}}}}catch(e){console.error(e)}return r}}
/* • Music in the Manager (his note: clicking a recruit card's buttons paused/restarted the music): a popup opened from the Manager
     replaces its window for a moment, so audWant saw "no Manager window" and crossfaded to a city theme. While a window is up and
     it was opened over the Manager, the Manager theme stays. */
const MUS92={mgr:false};
{const base=audWant;audWant=function(){const w=base.apply(this,arguments);try{if(AUD.manual)return w;
  const m=document.getElementById('modal');const up=!!m&&!m.hidden;
  if(up&&document.getElementById('mgrBody'))MUS92.mgr=true;else if(!up)MUS92.mgr=false;
  if(MUS92.mgr&&up&&!(typeof audLive==='function'&&audLive())&&w!==_T('Superbus')&&w!==_T('Special'))return _T('Manager')}catch(e){}return w}}
/* • Mail: an invitation's gladiator picker inherited the letter's dark ink (dark text on a dark box) */
{const st=document.createElement('style');st.textContent='.mail .mbody select,.mail .mbody select option,.mail .mbody input{color:var(--bone)!important;background:var(--ink)}';document.head.appendChild(st)}
/* • Sitting the week out (his note: the away host city's square still opened): a house that sits out never takes the road, so
     Match Week's 🏙 button walks YOUR HOME square instead (its own thumbnail and name); the host city stays shut that week. */
function sitOut92(){try{const w=W_();const n=w&&w.night;if(!n||!n.selfBye||n.bye)return null;const h=travelHome(me());return h!==n.loc?h:null}catch(e){return null}}
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{const home=sitOut92();if(home==null||typeof h!=='string')return h;
  const T=document.createElement('template');T.innerHTML=h;const L=LOCATIONS[home];
  for(const b of T.content.querySelectorAll('[data-mg="city"]')){b.style.backgroundImage='';b.classList.remove('city90');b.classList.add('home92');b.innerHTML=_T`🏠 Walk your home square · ${esc(L.n)}`;
    const nt=b.nextElementSibling;if(nt&&nt.classList.contains('city90n'))nt.innerHTML=_T`Your house sits this week out — no road to ${esc(LOCATIONS[W_().night.loc].n)}.`}
  setTimeout(()=>{try{const u=typeof city90Thumb==='function'?city90Thumb(home):'';if(u)document.querySelectorAll('#mgrBody [data-mg="city"].home92').forEach(b=>{b.style.backgroundImage=`linear-gradient(90deg,rgba(18,10,4,.88),rgba(18,10,4,.42) 70%,rgba(18,10,4,.2)),url(${u})`})}catch(e){}},60);
  return T.innerHTML}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mgrBody [data-mg="city"]');if(!b)return;const home=sitOut92();if(home==null)return;
  e.preventDefault();e.stopImmediatePropagation();try{openCitySquare(home,{})}catch(err){console.error(err)}},true);
/* • Training Yard (his call): fighters in the Infirmary do NOT train. A hurt fighter's row shows "🩹 In the Infirmary — rehab only"
     and a resting one's "🛏 Resting this week"; the routine picker is locked (his routine waits and runs again once he is fit /
     the rest week is over). Rest set in the Infirmary is undone there only. */
function yard92Lock(g){try{const w=W_();if(g.inj&&!g.inj.war)return ['🩹',_T('In the Infirmary — rehab only')];if(g.restWk!=null&&g.restWk===w.week)return ['🛏',_T('Resting this week')]}catch(e){}return null}
if(typeof yard87Row==='function'){const base=yard87Row;yard87Row=function(g){const h=base.apply(this,arguments);try{const L=yard92Lock(g);if(!L)return h;
  return h.replace(/<span class="yo87rt">[\s\S]*?<\/span>/,`<span class="yo87rt"><button type="button" class="btn tksm yo92lk" data-mg="tab" data-id="infirm" title="${esc(_T('Undo or change it in the Infirmary'))}">${L[0]} ${L[1]}</button></span>`).replace('class="yo87r ','class="yo87r yo92lock ')}catch(e){return h}}}
{const st=document.createElement('style');st.textContent='.yo92lk{white-space:nowrap;font-size:12px;padding:2px 8px;opacity:.9}.yo87r.yo92lock .yo90pv{opacity:.45}';document.head.appendChild(st)}
