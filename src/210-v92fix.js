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
