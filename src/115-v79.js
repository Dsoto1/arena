/* =====================================================================
   115-V79 · v0.79 (Virgilante's notes after trying Online)
   =====================================================================
   • Main menu: the version badge shows what is new in this version (the Rules window's What's new card);
     pressing C on the main menu opens the words of power (never during a match, never with a window up or typing).
   • The Multiplayer row holds two buttons (Hot seat · Online, Online slightly wider — CSS in 01-head).
   The online parts of v0.79 live in 111-114 (shared rules, window, lockstep, socket) and server/.
   ===================================================================== */
function verNotes79(){if(typeof modalBusy==='function'&&modalBusy())return;
  return modal(`📜 What's new · v${GAME_VER}`,`${typeof whatsNewHTML==='function'?whatsNewHTML():''}`,[{label:'Version history',value:'hist'},{label:'Close',value:null,primary:1}],{close:null}).then(v=>{if(v==='hist'&&typeof showRules==='function')showRules('hist')})}
function menuUp79(){const m=document.getElementById('mainMenu');return !!(m&&!m.hidden)}
window.addEventListener('keydown',e=>{if(e.key!=='c'&&e.key!=='C')return;if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
  const t=document.activeElement;if(t&&(['INPUT','TEXTAREA','SELECT'].includes(t.tagName)||t.isContentEditable))return;
  if(!menuUp79()||CUR_MODAL||(typeof modalBusy==='function'&&modalBusy()))return;if(S&&!S.over&&S.phase!=='setup'&&S.onl)return;
  e.preventDefault();if(typeof cheatPrompt==='function')cheatPrompt()});
