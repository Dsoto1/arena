/* =====================================================================
   120-V80FIX · v0.80 fixes outside Online
   =====================================================================
   • Hot seat stays at the hot-seat table. Only an event started from the hot-seat setup (its ▶ Sound the horns, or a replay of
     such an event, which carries cfg.hotseat) seats players from profiles. Before, one visit to Hot seat left CFG.hotseat on, and
     lessons, Manager bouts, exhibitions, the beast pen and an Online host's match were then renamed after profiles, saved junk
     profiles and turned hints off. Going back to the main menu now ends hot-seat mode (seats return to you + CPUs).
   • (10-meta / 11-extra edits) the Gate of Life saves under the gladiator's real id; a record already written this event is not
     written again, so no ghost record, no double-counted event, and the infirmary state holds.
   • A reload never shows the empty arena: #boot (01-head, painted first, in the main menu's colours) covers the page until the menu,
     a first window, the Online screen or a live event is up (a 12 s CSS safety in the page itself).
   • The Summa Rudis seal beside Flavius's box is gone (Virgilante): the top bar's event chip already wears the medallion and
     its pop-up shows the Summa Rudis, the medallion and the event card.
   ===================================================================== */
let HS_GO=0;
document.addEventListener('click',e=>{if(!CFG.hotseat)return;const b=e.target.closest&&e.target.closest('#goBtn');if(!b)return;const m=document.getElementById('modal');if(m&&m.querySelector('.hsbanner'))HS_GO=Date.now()},true);
{const base=startEvent;startEvent=function(cfg){if(!CFG.hotseat||(cfg&&cfg.hotseat)||Date.now()-HS_GO<4000)return base.apply(this,arguments);
  /* not from the hot-seat table: run it as a normal event */
  CFG.hotseat=false;try{return base.apply(this,arguments)}finally{CFG.hotseat=true}}}
{const base=menuShow;menuShow=function(){try{if(CFG.hotseat){CFG.hotseat=false;CFG.seats.forEach((s,i)=>{s.cpu=i>0;s.hsName=''})}}catch(e){}return base.apply(this,arguments)}}
{srBtnAt=function(){const b=document.getElementById('srInfo');if(b)b.hidden=true;if(typeof srPopHide==='function')srPopHide()}}
(function(){const b=document.getElementById('boot');if(!b)return;const t0=Date.now();
  const up=()=>{const m=document.getElementById('mainMenu');return (m&&!m.hidden)||(typeof CUR_MODAL!=='undefined'&&!!CUR_MODAL)||!!document.getElementById('onl')||!!document.getElementById('onlLoad')||(typeof S!=='undefined'&&!!S&&!!(S.players&&S.players.length))};
  const iv=setInterval(()=>{if(!b.isConnected){clearInterval(iv);return}if(up()||Date.now()-t0>8000){clearInterval(iv);b.classList.add('out');setTimeout(()=>b.remove(),400)}},50)})();
