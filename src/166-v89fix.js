/* 166-v89fix — v0.89 fixes.
   • (his report 2026-10-05) Leaving Online after the Google sign-in showed an empty arena with four gladiators in the corners: the
     sign-in return opens Online straight from the boot (not from the menu), so MM.fromMenu was false and closing it only uncovered
     the page — revealing the boot's background state (newState in 08-setup, phase 'setup', never played). Now when a window closes
     and nothing else is on screen — no window, no live event or city, nothing on its way — and the only arena is that unplayed
     background, the main menu comes back. A played or finished event keeps its board as before.
   • (his report) the Naumachia draft dropped to the main menu while the CPUs picked: between the start-up windows (drafts, the
     chariot draft, Carmina, class modifiers) the event is still in 'setup', so the screen decider took it for "nothing on screen".
     While startEvent runs (START89) the arena counts as live: the decider only uncovers it; the 08-setup / 72-v59 launch watchdogs
     (15 s) wait too.
   • (his report) Play Now: tapping a CPU's 🧠 mind chip redrew the whole setup (the cards and bars flickered). The chip now changes
     only that seat's mind and its own label — no redraw (nothing else on the page depends on it). */

let START89=0;
{const base=startEvent;startEvent=async function(){START89++;try{return await base.apply(this,arguments)}finally{START89--}}}
{const base=screenSettle;screenSettle=function(){if(START89>0&&!HEADLESS){if(!screenWindowUp()&&typeof transitUncover==='function')transitUncover();return}
  const r=base.apply(this,arguments);try{
  if(HEADLESS||screenWindowUp()||screenLive()||SCREEN.pending>0)return r;
  const idle=!S||S.phase==='setup';const m=$('#mainMenu');
  if(idle&&m&&m.hidden)menuShow()}catch(e){console.error(e)}return r}}
mmAfterClose=function(){screenSettle()};

window.addEventListener('click',e=>{const mb=e.target.closest&&e.target.closest('#mBody .pn75 [data-mind76]');if(!mb)return;
  const i=+mb.dataset.mind76;const s=document.getElementById('dif'+i);if(!s||!CFG.seats[i])return;e.stopImmediatePropagation();e.preventDefault();
  s.selectedIndex=(s.selectedIndex+1)%s.options.length;CFG.seats[i].diff=s.value;
  if(typeof brain87Sweep==='function')brain87Sweep(mb.parentElement);else mb.textContent=s.options[s.selectedIndex].textContent},true);
{const base=modal;modal=function(){const pk=document.getElementById('mk88peek');if(pk){try{pk.click()}catch(e){}}return base.apply(this,arguments)}}
