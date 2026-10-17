/* =====================================================================
   384-v105start — v1.05 B64 (tools/plans/v105/NOTES.md). Manager only. Kill switch localStorage flavius_v105startoff=1 (= the v1.04 warning).
   The Match Week warning "⚠ Match Week: only N of your M starters are fit to fight" (351 mq104Warn, widened by 352) counted the OLD three-starter depth
   (need = min(3, bouts)) against slot holders, so with 3 of the 4 First-team places filled and each one set to a bout it still said "only 2 of 3".
   Now it reads THIS WEEK'S CARD: every undone bout the house is in (a fighter of yours is entered, or a starter holds / was moved off that bout's slot)
   must have a fit fighter (entered or the slot holder; not hurt, not resting). A bout without one is named ("Sat Feature has no fit fighter"), with the
   "promote one on the Roster" hint when the bench has a fit fighter. Nothing when every bout you are in has its fighter, on a bye week, in the
   off-season (no card) and in the tutorial. ONE check: mq104Warn is replaced here, so every place that shows it (Your ludus banner, Match Week,
   Infirmary tabula, the task list) uses the same answer; it clears itself on the next redraw when fixed (378's M1a rule). Test tv105u.
   B65  The Consilium / checklist task "None of your fighters is on this week's card" (88 weekChecklist, 17 ludusTodos) also needs st105Can: in a
   Superbus week (348) a house that is eliminated, not seeded, resting (seeds 1-4 in Round 1) or not drawn gets no such task and no warning; the same
   for byes and the off-season. A drawn house is entered by the draw itself, so only the "no fit fighter" warning applies to it.
   No save change.
   ===================================================================== */
const V105S={on:(()=>{try{return localStorage.getItem('flavius_v105startoff')!=='1'}catch(e){return true}})()};
/* can this house enter a bout this week? no on a bye, in the off-season / tutorial, and in a Superbus week when it is not drawn (eliminated, not seeded, resting) */
function st105Can(w,pm){try{if(!V105S.on)return true;w=w||W_();pm=pm||me();if(!w||!pm)return true;if(w.tutorial||w.dead||!w.night||w.night.bye||w.night.selfBye)return false;
  const B=(w.night.bouts||[]).filter(b=>!b.done);if(!B.length)return false;
  if(w.night.po104||B.some(b=>b.po104))return B.some(b=>b.po104&&(b.po104.k||[]).includes('m:'+pm.id));return true}catch(e){return true}}
/* the bouts of this week's card that the house is in but cannot field: [{b,i,lab}] */
function st105Gaps(w,pm){const out=[];try{w=w||W_();pm=pm||me();if(!w||!pm||!st105Can(w,pm))return out;
  const pool=rosterOf(pm).filter(g=>g&&g.alive!==false);const mine=new Set(pool.map(g=>g.id));
  const fit=g=>!!g&&g.alive!==false&&!g.inj&&g.restWk!==w.week&&!(typeof inj104==='function'&&inj104(g));
  (w.night.bouts||[]).forEach((b,i)=>{if(b.done)return;const ents=(b.ents||[]).filter(id=>mine.has(id)).map(gById);const s=(b.any100||b.po104)?0:i+1;
    const holder=s?pool.find(g=>g.slot95===s):null;const waits=s?pool.some(g=>g.home104&&g.home104.s===s):false;
    if(!ents.length&&!holder&&!waits)return;
    if(ents.some(fit)||(holder&&fit(holder)))return;
    let lab='';try{lab=typeof mw105Lab==='function'?mw105Lab(b):''}catch(e){}if(!lab)lab=((TIERS[b.tier]||{}).n)||_T('A bout');
    out.push({b,i,lab})})}catch(e){console.error(e)}return out}
if(V105S.on&&typeof mq104Warn==='function'){const base=mq104Warn;mq104Warn=function(w,pm){
  try{if(!V105S.on)return base.apply(this,arguments);w=w||W_();pm=pm||me();const G=st105Gaps(w,pm);if(!G.length)return '';
    const used=new Set((w.night.bouts||[]).flatMap(b=>b.done?[]:(b.ents||[])));
    const bench=rosterOf(pm).filter(g=>g.alive!==false&&!g.slot95&&!g.inj&&g.restWk!==w.week&&!(typeof inj104==='function'&&inj104(g))&&!used.has(g.id)).length;
    const names=G.map(x=>x.lab).join(', ');
    const head=G.length>1?_T`⚠ Match Week: ${names} have no fit fighter`:_T`⚠ Match Week: ${names} has no fit fighter`;
    return head+(bench?_T` — ${bench} fit on the bench: promote one on the Roster or enter one`:_T(' — and nobody fit on the bench'))+'.'}
  catch(e){console.error(e);return ''}}}
