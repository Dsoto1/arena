/* 166-v89fix — v0.89 fixes.
   • (his report 2026-10-05) Leaving Online after the Google sign-in showed an empty arena with four gladiators in the corners: the
     sign-in return opens Online straight from the boot (not from the menu), so MM.fromMenu was false and closing it only uncovered
     the page — revealing the boot's background state (newState in 08-setup, phase 'setup', never played). Now when a window closes
     and nothing else is on screen — no window, no live event or city, nothing on its way — and the only arena is that unplayed
     background, the main menu comes back. A played or finished event keeps its board as before. */
{const base=screenSettle;screenSettle=function(){const r=base.apply(this,arguments);try{
  if(HEADLESS||screenWindowUp()||screenLive()||SCREEN.pending>0)return r;
  const idle=!S||S.phase==='setup';const m=$('#mainMenu');
  if(idle&&m&&m.hidden)menuShow()}catch(e){console.error(e)}return r}}
mmAfterClose=function(){screenSettle()};
