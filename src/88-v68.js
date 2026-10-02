/* =====================================================================
   88-V68 · v0.68 MANAGER: THE WEEK AT A GLANCE
   =====================================================================
   • Weekly checklist (replaces the "This week" to-do box in Your ludus): the week's work in order — verdicts, the hurt,
     contracts about to run out, the regime, training hours, the card, a thin roster — each with ONE button that does it or
     takes you there; finished items fold into a "✓ done" line.
   • Money ledger in the header: this week's wages against the gate share and your appearance fees, the net, and the runway
     (weeks of coin left) in amber/red when it runs short.
   • End the week: the confirmation lists what you are about to skip (fighters fit but not entered, unspent training hours,
     contracts that lapse, untreated wounds).
   ===================================================================== */
function weekMoney(){const w=W_(),m=me();const ros=rosterOf(m);const wages=ros.reduce((a,g)=>a+((g.contract&&g.contract.wage)||0)+(g.ptrain?PTRAIN_COST:0),0)+((TRAIN_REGIMES[w.train]||{}).c||0);
  const mine=new Set(ros.map(g=>g.id));const fees=(w.night&&w.night.bouts||[]).filter(b=>b.ents.some(id=>mine.has(id))).reduce((a,b)=>a+(b.fee||0),0);
  const gate=typeof gateShare==='function'?gateShare(m):0;const net=gate+fees-wages;const runway=net>=0?Infinity:Math.max(0,Math.floor(m.coin/-net));return {wages,fees,gate,net,runway,coin:m.coin}}
function weekChecklist(){const w=W_(),m=me();const ros=rosterOf(m);const n=w.night;const I=[];const go=(tab,l)=>`<button class="btn tksm" type="button" data-mg="tab" data-id="${tab}">${l}</button>`;
  const item=(done,ic,txt,btn)=>I.push({done,ic,txt,btn});
  if((w.pend||[]).length)item(false,'⚖',`<b>${w.pend.length} verdict${w.pend.length===1?'':'s'}</b> wait for you`,go('night','Settle'));
  const hurt=ros.filter(g=>g.inj&&!g.inj.war&&g.medWk!==w.week&&g.bathWk!==w.week);
  item(!hurt.length,'⚕',hurt.length?`${hurt.map(g=>esc(g.name)).join(', ')} ${hurt.length===1?'is':'are'} hurt`:'No untreated wounds',hurt.length?go('infirm','Infirmary'):'');
  const exp=ros.filter(g=>g.contract&&g.contract.weeks<=1);
  item(!exp.length,'📜',exp.length?`${exp.map(g=>`<b>${esc(g.name)}</b>`).join(', ')}: contract ends ${exp.length===1?'':'— each '}this week`:'No contract runs out this week',exp.length?exp.slice(0,2).map(g=>`<button class="btn tksm" type="button" data-mg="extend" data-id="${g.id}">Renew ${esc(g.name.split(' ')[0])}<small>${askWage(g)}/wk</small></button>`).join(''):'');
  item(!!w.train&&w.train!=='off','🏋',w.train&&w.train!=='off'?`Regime: ${esc((TRAIN_REGIMES[w.train]||{}).n||w.train)}`:'No drills set for the week',w.train&&w.train!=='off'?'':go('practice','Set drills'));
  const th=typeof thLeft==='function'?thLeft(w):0;item(!th||!ros.length,'⏳',th?`<b>${th}</b> training hour${th===1?'':'s'} unspent`:'Training hours planned',th&&ros.length?go('practice','Plan hours'):'');
  const mine=new Set(ros.map(g=>g.id));const entered=n?n.bouts.filter(b=>b.ents.some(id=>mine.has(id))).length:0;const open=n?n.bouts.filter(b=>!b.done).length:0;const fit=ros.filter(g=>!g.inj&&g.morale>15).length;
  item(entered>=Math.min(open,fit)||!fit,'⚔',entered?`${entered} of ${open} bout${open===1?'':'s'} carry your fighters`:fit?'None of your fighters is on this week\'s card':'Nobody fit to fight',entered>=Math.min(open,fit)?'':go('night','Enter fighters'));
  item(ros.length>=4,'🤝',ros.length>=4?`${ros.length} fighters on the roster`:`Only ${ros.length} fighter${ros.length===1?'':'s'} — the card needs bodies`,ros.length>=4?'':go('recruit','Recruit'));
  return I}
function checklistHTML(){const I=weekChecklist();const todo=I.filter(x=>!x.done),done=I.filter(x=>x.done);
  return `<div class="todobox wkcheck"><div class="sect" style="margin-top:0">✅ This week <span class="rc-sub">${todo.length?`${todo.length} to do`:'all done — end the week when ready'}</span></div>
    ${todo.map(x=>`<div class="wkitem"><span class="wkic">${x.ic}</span><span class="wktxt">${x.txt}</span><span class="wkbtn">${x.btn||''}</span></div>`).join('')}
    ${done.length?`<details class="wkdone"><summary class="rc-sub">✓ ${done.length} done</summary>${done.map(x=>`<div class="wkitem done"><span class="wkic">✓</span><span class="wktxt">${x.txt}</span></div>`).join('')}</details>`:''}</div>`}
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_(),m=me();if(!w||w.dead||!m||MGR.view)return h;
  /* the ledger strip in the header */
  const M=weekMoney();const tone=M.net>=0?'good':M.runway<=2?'bad':M.runway<=5?'warn':'';
  const led=`<span class="badge ledger ${tone}" title="This week: wages and drills ${M.wages} · gate share +${M.gate} · appearance fees +${M.fees} (fighters entered) — purses and bets on top">${M.net>=0?'▲':'▼'} ${M.net>=0?'+':''}${M.net}/wk${M.net<0?` · ${M.runway===Infinity?'':M.runway+' wk runway'}`:''}${!M.fees&&w.night&&w.night.bouts.some(b=>!b.done)?' · before fees':''}</span>`;
  h=h.replace(/(<span class="badge [^"]*">Treasury [^<]*<\/span>)/,`$1${led}`);
  /* the checklist replaces the to-do box */
  if(MGR.tab==='ludus'){const i=h.indexOf('<div class="todobox">');if(i>=0){const c=cutDiv(h,i);if(c)h=c[1].slice(0,i)+checklistHTML()+c[1].slice(i)}}}catch(e){console.error(e)}return h}}
/* end the week: what you are about to skip */
{const base=endConfirmHTML;endConfirmHTML=function(){let h=base.apply(this,arguments);try{const skip=weekChecklist().filter(x=>!x.done&&!/verdict/.test(x.txt));
  if(skip.length)h=h.replace('<div class="acts"><button class="btn primary" type="button" data-mg="endweek">',`<div class="skiplist"><b>You are about to skip:</b>${skip.map(x=>`<div>${x.ic} ${x.txt}</div>`).join('')}</div><div class="acts"><button class="btn primary" type="button" data-mg="endweek">`)}catch(e){}return h}}
{const st=document.createElement('style');st.textContent=`
.wkcheck .wkitem{display:grid;grid-template-columns:24px 1fr auto;gap:8px;align-items:center;padding:5px 0;border-top:1px solid var(--line2)}.wkcheck .wkitem:first-of-type{border-top:0}
.wkcheck .wkic{text-align:center;font-size:16px}.wkcheck .wkbtn{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}.wkcheck .wkitem.done{opacity:.6;grid-template-columns:24px 1fr}.wkcheck .wkitem.done .wkic{color:#9cc46e}
.wkdone summary{cursor:pointer;margin-top:4px}
.badge.ledger{font-variant-numeric:tabular-nums}.badge.ledger.good{border-color:#3d5a2e;color:#b7d59d}.badge.ledger.warn{border-color:#6b5420;color:#f0cf7d}.badge.ledger.bad{border-color:#7a2a22;color:#f2a093}
.skiplist{border:1px solid rgba(217,164,65,.45);border-radius:7px;padding:6px 10px;margin:0 0 8px;font-size:13px}.skiplist div{margin-top:2px}`;document.head.appendChild(st)}
