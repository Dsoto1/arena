/* =====================================================================
   427-v112econ — v1.12 ECONOMY TUNING (his 1a, 2026-10-23; tools/plans/econ111/REPORT.md P1 + P6, docs/economy.md, docs/decisions.md).
   Manager only. Kill switch localStorage flavius_v112econoff=1 (= v1.11d's economy exactly). Test tv112e.
   P1 THE PLAYER'S PATRON — every in-season week the player's house gets +10 + 0.3 × fame (rounded) at the start of endWeek (before the
       wages and the walk-out check, as REPORT.md's sim patch did). Not in the off-season week (348 po104Ph 'off'), not in the tutorial,
       not when endWeek is going to refuse (unplayed bouts, unsettled verdicts, an open invitational). Once per week end: the key
       w.e112p = season:week:playoff phase (348's playoff weeks keep w.week at 11, so the phase tells them apart → Superbus weeks pay too).
       Booked by 413's money ledger as its own category 'patron' (LED109_FN.e112Patron; led109Sheet gets a "💼 Patron" row before
       Senate & other) and one line in the ludus ledger (tnews "💼 Your patron: +N coin").
   P6 THE RIVALS' BACKER FLOOR — after 23 aiLanistaWeek, a rival house (not Sica, not dead) below 40 is topped up toward 40 by at most
       one more stipend (22 + 0.6 × fame), and at most ONCE a season per house (m.e112top = the season it was used; old saves have none
       → eligible, no SAVE_MIGRATIONS needed). A line in that house's log (mlog).
   The Trades 2 fixes of the same decision (3a received-below-median at 50%, 4a settling-in main fighter) live in 426-v112trade.
   Never the dice (no rand()).
   ===================================================================== */
const E112={on:(()=>{try{return localStorage.getItem('flavius_v112econoff')!=='1'}catch(e){return true}})(),
  pat:{base:10,fame:0.3},floor:40,riv:{base:22,fame:0.6}};
window.E112=E112;
const e112Ph=w=>{try{return typeof po104Ph==='function'?po104Ph(w)||'':''}catch(e){return ''}};
const e112Amt=m=>Math.round(E112.pat.base+((m&&m.fame)||0)*E112.pat.fame);
/* would 17's endWeek go ahead? (its own early returns) */
function e112Ready(w){try{if(!w||!w.night)return false;if((w.night.bouts||[]).some(b=>!b.done))return false;if((w.pend||[]).length)return false;if(w.special&&!w.special.done)return false;return true}catch(e){return false}}
/* P1: the stipend itself — its own function so 413's ledger books it as 'patron' (LED109_FN) */
function e112Patron(w,pm){const n=e112Amt(pm);if(n<=0)return 0;pm.coin+=n;tnews(_T`💼 Your patron: +${n} coin`);return n}
function e112PatronWeek(){const w=W_();if(!w||w.dead||w.tutorial||!w.mgrs)return 0;const pm=me();if(!pm)return 0;const ph=e112Ph(w);if(ph==='off')return 0;
  if(!e112Ready(w))return 0;const key=w.season+':'+w.week+':'+ph;if(w.e112p===key)return 0;w.e112p=key;
  try{if(typeof led109Install==='function')led109Install(w)}catch(e){}return e112Patron(w,pm)}
/* P6: the rivals' floor, once a season */
function e112RivalFloor(w){let n=0;if(!w||!w.mgrs)return 0;
  for(const m of w.mgrs){if(!m||m.isPlayer||m.dead||m.sica)continue;if(!(m.coin<E112.floor))continue;if(m.e112top===w.season)continue;
    const add=Math.min(E112.floor-m.coin,Math.round(E112.riv.base+(m.fame||0)*E112.riv.fame));if(add<=0)continue;
    m.coin+=add;m.e112top=w.season;n++;try{mlog(m,_T`💼 the backers topped up the treasury (+${add})`)}catch(e){}}
  return n}
if(E112.on){
  if(typeof LED109_FN!=='undefined')LED109_FN.e112Patron='patron';
  {const base=endWeek;endWeek=async function(){try{e112PatronWeek()}catch(e){console.error(e)}return base.apply(this,arguments)}}
  {const base=aiLanistaWeek;aiLanistaWeek=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&!w.dead&&!w.tutorial)e112RivalFloor(w)}catch(e){console.error(e)}return r}}
}
/* the Accounts room shows the 'patron' category (also for a season booked before the kill switch was set) */
if(typeof led109Sheet==='function'){const base=led109Sheet;led109Sheet=function(w,pm){const X=base.apply(this,arguments);try{if(!X||!Array.isArray(X.rows)||X.rows.some(r=>r[0]==='patron'))return X;
    const c=(X.L&&X.L.c&&X.L.c.patron)||null;if(!c&&!E112.on)return X;const row=['patron','💼',_T('Patron'),c?c.i:0,c?c.o:0];
    const i=X.rows.findIndex(r=>r[0]==='senate');if(i>=0)X.rows.splice(i,0,row);else X.rows.push(row);
    X.sum=X.rows.reduce((a,r)=>a+r[3]-r[4],0);X.res=X.now-X.start-X.sum}catch(e){console.error(e)}return X}}
