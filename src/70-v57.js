/* =====================================================================
   70-V57 · v0.57
   =====================================================================
   ARENA — laurels and flowers fly only after the closing horns (LAUREL_DELAY; none mid-match); the numbered
   start marks fade once the first turn begins; the camera comes back to the normal view when an event ends;
   the clean-up show leaves no live beast on the sand (07-ui); Save on the results keeps the window up (07-ui).
   MANAGER — (sections below)
   ===================================================================== */
const LAUREL_DELAY=3400; /* ms after the end: fanfare, the closing horns, then the laurels (TWEAK) */
/* startTileAlpha — 1 before the match; fades to 0 over a second once the first turn begins */
function startTileAlpha(){if(!S||S.phase==='setup'||!S.turnNo)return 1;if(HEADLESS)return 0;
  if(!S._stFade){S._stFade=performance.now()}const k=(performance.now()-S._stFade)/1100;
  if(k<1&&!S._stRaf){S._stRaf=requestAnimationFrame(()=>{S._stRaf=0;try{draw()}catch(e){}})}return Math.max(0,1-k)}
{const base=gameOver;gameOver=async function(){if(S){S.zoomIn=false;S.zoomOut=false}return base.apply(this,arguments)}}
/* ---------- MANAGER · a new house picks its starting difficulty ---------- */
const START_DIFF={easy:{n:'Easy',coin:250,glads:2,d:'250 coin and two fighters on the roster'},normal:{n:'Normal',coin:125,glads:1,d:'125 coin and one fighter'},hard:{n:'Hard',coin:50,glads:0,d:'50 coin and an empty roster'}}; /* TWEAK */
{const base=newWorld;newWorld=function(choice){const w=base.apply(this,arguments);try{if(choice&&choice.type==='custom'&&!w.tutorial){const D=START_DIFF[(choice.mgr&&choice.mgr.diff)||'normal'];const pm=me();
  let ros=rosterOf(pm);while(ros.length>D.glads){ros[ros.length-1].contract=null;ros=rosterOf(pm)}
  while(ros.length<D.glads){const g=genGlad({ovr:44+rnd(9),rookie:true});g.contract={mgr:pm.id,wage:askWage(g),weeks:8,since:1};g.scout=2;w.glads.push(g);ros=rosterOf(pm)}
  pm.coin=D.coin;w.startDiff=(choice.mgr&&choice.mgr.diff)||'normal';
  w.qsLast={season:w.season,founding:true,lines:[[`🏛 The Senate’s founding grant — ${D.n} start`,D.coin],...(ros.length?[[`🛡 ${ros.length} raw recruit${ros.length===1?'':'s'} under contract`,0]]:[])],total:D.coin,seen:false};saveWorld(true)}}catch(e){console.error(e)}return w}}
function startDiffHTML(c){const k=c.diff||'normal';return `<h4>Starting difficulty</h4><div class="seg sdiff">${Object.entries(START_DIFF).map(([id,D])=>`<button type="button" class="${k===id?'on':''}" data-sdiff="${id}" title="${esc(D.d)}">${D.n}<small style="display:block;font-size:11px;color:var(--muted)">${D.coin}c · ${D.glads} fighter${D.glads===1?'':'s'}</small></button>`).join('')}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sdiff]');if(!b||typeof NEWMGR==='undefined'||!NEWMGR)return;e.stopPropagation();NEWMGR.diff=b.dataset.sdiff;if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* ---------- MANAGER · houses called in by a word can be taken over like any other ---------- */
function houseTakeRows(){return Object.entries(FAMILY_HOUSES).filter(([k])=>houseOn(k)).map(([k,H])=>`<div class="lrow" style="--pc:${H.mgr.color}"><div class="t"><b>${esc(H.mgr.name)}</b><small>${esc(H.mgr.ludus)} · ${esc(H.mgr.city)} · fame 22 · 180 coin · ${esc(H.child.name)} and three fighters</small><small style="color:var(--bone)">${esc(H.mgr.bio)}</small></div><div class="a"><button class="btn primary" type="button" data-takehouse="${k}">Take over</button></div></div>`).join('')}
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{
  if(MGR.view==='take'){const rows=houseTakeRows();if(rows)h=h.replace('</div><div class="mbtns"><button class="btn" type="button" data-mg="back">Back</button></div>',rows+'</div><div class="mbtns"><button class="btn" type="button" data-mg="back">Back</button></div>')}
  if(MGR.view==='create'&&typeof NEWMGR!=='undefined'&&NEWMGR&&!NEWMGR.takeKey&&!NEWMGR.sale){const D=START_DIFF[NEWMGR.diff||'normal'];
    h=h.replace(/You start with 40 coin, no fame and one raw recruit\./,`You start with ${D.coin} coin, no fame and ${D.glads?D.glads===1?'one raw recruit':'two raw recruits':'no fighters'}.`);
    h=h.replace('<div class="mbtns"><button class="btn primary" type="button" data-mg="nmgo">',startDiffHTML(NEWMGR)+'<div class="mbtns"><button class="btn primary" type="button" data-mg="nmgo">')}
  h=h.replace(/start Unknown, with 40 coin and one raw recruit/,'start Unknown — choose Easy, Normal or Hard')}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-takehouse]');if(!b)return;e.stopPropagation();const k=b.dataset.takehouse;if(!houseOn(k))return;
  MGR.view=null;const w=newWorld({type:'pre',key:MGR_PRE[0].key});const m=houseMgr(w,k);if(!m){if(typeof mToast==='function')mToast('That house could not be found in the league.');return}
  const old=w.mgrs.find(x=>x.isPlayer);if(old){old.isPlayer=false}m.isPlayer=true;w.playerId=m.id;
  for(const x of w.mgrs)if(!x.isPlayer)x.rivalry=(x.rivals&&x.rivals[m.id])||0;
  const ros=rosterOf(m);w.qsLast={season:w.season,founding:true,lines:[['🏛 The treasury as it stands today — the coffers you take over with the house',m.coin],[`🛡 ${ros.length} fighters already under contract`,0]],total:m.coin,seen:false};
  MGR.tab='ludus';saveWorld(true);if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* ---------- MANAGER · the mail keeps only what is unread ---------- */
/* a letter stays while unread (up to 8 weeks); once read it goes at the week's end; nothing is archived */
{const base=mailLive;mailLive=function(){const w=W_();const R=new Set(w.mailRead||[]);const L0=w.letters;
  w.letters=(L0||[]).filter(x=>!x.read&&(x.until>=w.week||(!R.has('L:'+x.key)&&w.week-x.wk<=8))).map(x=>x.until>=w.week?x:{...x,until:w.week});
  try{return base.apply(this,arguments)}finally{w.letters=L0}}}
{const base=mailPanelHTML;mailPanelHTML=function(){return base.apply(this,arguments).replace(/<details class="mpast">[\s\S]*<\/details><\/div>$/,'</div>')}}
/* ---------- MANAGER · courting shows on the shortlist; scouting or courting puts them there ---------- */
{const base=offerVerdict;offerVerdict=function(g,wage,weeks,bonus){const v=base.apply(this,arguments);try{const w=W_(),m=me();const ask=/wants about (\d+) coin a week/.exec(v.why||'');
  g.court={mgr:m.id,wk:w.week,wage,weeks,ask:ask?+ask[1]:null,ok:!!v.ok,why:v.ok?'':String(v.why||'').replace(/^[^ ]+ [^ ]+ /,'')};g.favd=true}catch(e){}return v}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg]');if(!b)return;const a=b.dataset.mg;if(!['scout','pitch','visit','gift','trial','offer','feast'].includes(a))return;
  try{const gid=String(b.dataset.id||MGR.sel||'').split('|')[0];const g=gById(gid);if(g&&!(g.contract&&g.contract.mgr===me().id))g.favd=true}catch(err){}},true);
{const base=recruitHTML;recruitHTML=function(){let h=base.apply(this,arguments);try{const i=h.indexOf('<div class="card2 favbox">');if(i<0)return h;const j=h.indexOf('</table>',i);let box=h.slice(i,j);const m=me(),w=W_();
  for(const g of w.glads.filter(x=>x.favd&&x.court&&x.court.mgr===m.id&&w.week-x.court.wk<=2)){const c=g.court;
    const chip=`<span class="courtchip" data-tip="${esc(`Week ${wkOf(c.wk)}: you offered ${c.wage} coin a week for ${c.weeks} weeks. ${c.ok?'They would sign.':c.ask?`They want about ${c.ask} coin a week.`:c.why}`)}">💬 ${c.wage}c×${c.weeks}wk${c.ok?' · ✓ would sign':c.ask?` · asks ${c.ask}c`:' · not yet'}</span>`;
    box=box.replace(`<b>${esc(g.name)}</b> <span class="rc-sub">`,`<b>${esc(g.name)}</b> ${chip} <span class="rc-sub">`)}
  h=h.slice(0,i)+box+h.slice(j)}catch(e){}return h}}
/* ---------- MANAGER · Match Week: tags, wagers count, travel first, end-week buttons ---------- */
loanTag=function(g){if(!g||!g.loanFrom)return '';const pm=me();const from=mgrById(g.loanFrom.mid);const to=g.contract?mgrById(g.contract.mgr):null;const L=g.loanFrom;
  const tip=`On loan from ${from?from.ludus:'another house'} to ${to?to.ludus:'another house'} · ${L.fee} coin a week · ${L.weeks} week${L.weeks===1?'':'s'} left${pm&&L.mid===pm.id?' · your fighter':''}`;
  return ` <span class="loantag" data-tip="${esc(tip)}">LOANED</span>`};
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(w&&w.night&&!w.dead){const n=(w.night.bouts||[]).reduce((a,b)=>a+(b.bets||[]).length,0);if(n)h=h.replace('💰 Wagers</button>',`💰 Wagers · ${n}</button>`)}}catch(e){}return h}}
{const base=nightHTML;nightHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(typeof travelOK==='function'&&!travelOK(w)&&!w.night.bye){const t=travelState(w);const msg=`Travel to ${LOCATIONS[w.night.loc].n} first (${t.cost} coin) — pay the road at the top of Match Week, then enter, watch or walk the sand.`;
  h=h.replace(/<button ([^>]*?)data-mg="(enter|fight|watch|spect|scoutarena)"/g,(m0,pre,a)=>`<button ${pre}data-mg="${a}" data-dis="${esc(msg)}" data-tip="${esc(msg)}" aria-disabled="true"`)}}catch(e){}return h}}
{const base=weekLoopBtns;weekLoopBtns=function(){const w=W_();if(MGR.confirmEnd||(w&&MGR.loopHidden===w.week))return '';return base.apply(this,arguments)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.wkloop [data-mg="endask"]');if(!b)return;const w=W_();if(w)MGR.loopHidden=w.week},true);
/* ---------- MANAGER · the first bye week brings a letter ---------- */
{const base=endWeek;endWeek=async function(){const w0=W_();const r=await base.apply(this,arguments);try{const w=W_();if(r!==false&&w&&w===w0&&!w.dead&&!w.tutorial&&w.night&&w.night.bye&&!w.byeLetter){w.byeLetter=1;
  sendLetter(w,{key:'bye-'+w.week,kind:'letter',from:'the Consilium',seal:'🌿',title:'A bye week: no games, and much to do',until:w.week,
    body:`<p>No bouts this week, lanista. The houses that win seasons use these weeks well:</p><ul><li><b>Heal</b>: send the hurt to the Infirmary; a week without the sand lets wounds close.</li><li><b>Drill</b>: set the Training Yard; no Match Week means no wear on top of the work.</li><li><b>Recruit</b>: you have ${BYE_HOURS} extra lanista's hours — scout, pitch and sign before the others wake up.</li><li><b>Shop</b>: Vulso's cart and the market are in town; kit your starters for the weeks ahead.</li><li><b>Plan</b>: bill a fighter on the Season tab for a big bout three or more weeks out.</li></ul>`});saveWorld()}}catch(e){console.error(e)}return r}}
/* ---------- MANAGER · call a loaned fighter home (the rest of the loan + 25%) ---------- */
const RECALL_MULT=1.25; /* TWEAK */
const recallFee=g=>Math.ceil((g.loanFrom.fee||1)*Math.max(1,g.loanFrom.weeks||1)*RECALL_MULT);
{const base=loansCardHTML;loansCardHTML=function(){let h=base.apply(this,arguments);try{const pm=me(),w=W_();
  for(const g of w.glads.filter(g=>g.alive&&g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract&&g.contract.mgr!==pm.id)){const f=recallFee(g);const busy=(w.night&&w.night.bouts||[]).some(b=>!b.done&&b.ents.includes(g.id));
    h=h.replace(`<b>${esc(g.name)}</b> <span class="rc-sub">${effOvr(g)}</span></td>`,`<b>${esc(g.name)}</b> <span class="rc-sub">${effOvr(g)}</span> <button class="btn tksm" type="button" data-recall="${g.id}" ${busy?dis([true,'They fight for the borrowing house this week — call them back after the bout.']):pm.coin<f?dis([true,`The treasury cannot cover the ${f} coin recall fee.`]):`data-tip="${esc(`Pay ${esc((mgrById(g.contract.mgr)||{}).ludus||'them')} ${f} coin — the rest of the loan plus a quarter — and ${esc(g.name)} returns to your roster now.`)}"`}>↩ Call back · ${f}c</button></td>`)}}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-recall]');if(!b)return;e.stopPropagation();if(b.dataset.dis)return;const w=W_(),pm=me();const g=gById(b.dataset.recall);if(!g||!g.loanFrom||g.loanFrom.mid!==pm.id)return;
  const f=recallFee(g);if(pm.coin<f)return;const bor=mgrById(g.contract.mgr);pm.coin-=f;if(bor){bor.coin+=f;bor.relB=(bor.relB||0)-3}
  g.contract.mgr=pm.id;delete g.loanFrom;ghist(g,`called home early from ${bor?bor.ludus:'a loan'} (${f} coin)`);tnews(`↩ ${esc(g.name)} is called home from ${esc(bor?bor.ludus:'the loan')} — ${f} coin paid.`);saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* ---------- styles ---------- */
{const st=document.createElement('style');st.textContent=`
table.tally tr.won td b{color:var(--gold2)}.mytag{background:#7fc0d8!important;color:#0e1a20!important}
.loantag{border-color:#9a6ad6!important;color:#f0e2ff!important;background:rgba(138,92,192,.28)!important;font-weight:700;letter-spacing:.06em;cursor:help}
.courtchip{display:inline-block;font:11px var(--mono);padding:1px 6px;border-radius:9px;border:1px solid #6a5130;color:var(--gold2);background:rgba(240,207,125,.08);cursor:help}
.sdiff button{min-width:110px}`;document.head.appendChild(st)}
