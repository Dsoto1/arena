/* =====================================================================
   100-SICA73 · v0.73 — Sica's syndicate, a house of its own (designed with Virgilante)
   =====================================================================
   • Sica's Syndicate joins the league as a full house (m.sica): standings, bouts, a roster of enforcers (high Strength, low
     Intelligence). It is never invited to the Flavius Superbus (17-manager top4 filter).
   • Dirty tricks: when one of Sica's fighters is on a card, his men may throw a spear from the stands at the strongest rival
     (the loan spear's own mechanism, S.syndSpear); he bribes fighters to hold back (rumours in the mail first); he lures
     unhappy fighters (low morale) away with cash.
   • You: his loans stay as they are; he may offer YOU a bribe for your fighter to hold back in a bout — paid if they lose
     while the CPU fights them (fight them yourself and the deal is off); if it gets out, fame and your fighters' morale suffer.
   TWEAK: SICA (chances and sums).
   ===================================================================== */
const SICA={spear:0.45,bribeAI:0.35,bribeYou:0.3,caught:0.25,poach:0.3,poachMorale:35,fameHit:8,moraleHit:8};
function sicaMgr(w){return (w||W_()).mgrs.find(m=>m.sica)}
function sicaEnsure(w){if(!w||sicaMgr(w))return false;
  const m={id:'m_sica',key:'sica',name:'Sica',ludus:_T("Sica's Syndicate"),city:'Roma',color:'#5b2a6e',p:{ambition:85,cunning:96,honor:4,greed:95,show:40,discipline:35,risk:80},fame:30,coin:420,wins:0,bouts:0,deaths:0,betNet:0,poached:0,improved:0,
    bio:_T('Moneylender of the Subura. His men sit in every crowd; his debts are paid in coin or in blood.'),sica:true,rivals:{},rivalry:0,portrait:{skin:'#8a5a3a',hair:'#1a120c',helm:'none',beard:true,bg:typeof sysBG==='function'?sysBG():undefined}};
  w.mgrs.push(m);const ENF=[_T('the Collector'),_T('the Debt'),_T('Knucklebone'),_T('the Quiet One'),_T('Ironjaw')];
  for(let i=0;i<4;i++){const g=genGlad({ovr:58+rnd(12)});{const n0=genName();g.name=/^The |"/.test(n0)?n0:n0+' '+ENF[i%ENF.length]}g.enforcer=true;g.contract={mgr:m.id,wage:askWage(g),weeks:12,since:w.week};g.morale=70;g.interest={};
    const st=gStats(g);st.str=Math.max(st.str,86+rnd(10));st.int=Math.min(st.int,54+rnd(8));w.glads.push(g)}
  mnews(_T`🗡 <b>Sica's Syndicate</b> buys a seat in the league. The Subura sends its enforcers to the sand — and its men to the stands.`,'big');return true}
{const base=newWorld;newWorld=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&sicaEnsure(w)){try{makeNight()}catch(e){}saveWorld(true)}}catch(e){console.error(e)}return r}}
/* older careers: the syndicate arrives at the next week's end */
{const base=endWeek;endWeek=async function(){const w=W_();try{if(w&&!w.dead)sicaEnsure(w)}catch(e){console.error(e)}
  try{if(w&&!w.dead)sicaPoach(w)}catch(e){console.error(e)}const r=await base.apply(this,arguments);try{sicaBribes(W_())}catch(e){console.error(e)}return r}}
const isSicaG=g=>{const w=W_();const m=g&&g.contract&&mgrById(g.contract.mgr);return !!(m&&m.sica)};
/* the spear: a card with one of his fighters on it */
{const base=boutCfg;boutCfg=function(b,watch,fightGid){const cfg=base.apply(this,arguments);try{const w=W_();if(!b||!cfg||!cfg.seats)return cfg;
  const ids=b.ents||[];if(ids.some(id=>isSicaG(gById(id)))&&!cfg.syndSpear&&b.sicaSpear==null)b.sicaSpear=Math.random()<SICA.spear;
  if(b.sicaSpear&&!cfg.syndSpear){const t=ids.map(gById).filter(g=>g&&!isSicaG(g)).sort((x,y)=>effOvr(y)-effOvr(x))[0];if(t)cfg.syndSpear=t.id}
  /* a bought fighter holds back while the CPU fights them */
  cfg.seats.forEach((s,i)=>{const g=gById(ids[i]);if(!g)return;const bought=(g.thrown===w.season+':'+w.week)||(w.sicaBribe&&w.sicaBribe.state==='yes'&&w.sicaBribe.gid===g.id&&w.sicaBribe.wk===w.week);
    if(bought&&s.cpu!==false&&ids[i]!==fightGid){s.aiDiff='easy';s.aiBlunder=0.6;b.sicaThrow=g.id}
    else if(bought&&w.sicaBribe&&w.sicaBribe.gid===g.id)w.sicaBribe.off=1})}catch(e){console.error(e)}return cfg}}
/* bribes: rumours for the AI, an offer for you */
function sicaBribes(w){if(!w||w.dead||!w.night)return;const sm=sicaMgr(w);if(!sm)return;const pm=me();
  const cards=w.night.bouts.filter(b=>!b.done&&b.ents.some(id=>isSicaG(gById(id))));if(!cards.length)return;const b=pickOne(cards);
  const others=b.ents.map(gById).filter(g=>g&&!isSicaG(g));const mine=others.find(g=>g.contract&&g.contract.mgr===pm.id);
  if(mine&&Math.random()<SICA.bribeYou){const amt=10+Math.round(effOvr(mine)/4);w.sicaBribe={wk:w.week,gid:mine.id,amt,state:'offer'};
    sendLetter(w,{key:'sica-bribe-'+w.season+'-'+w.week,kind:'offer',from:_T('Sica'),seal:'🗡',title:_T`A quiet word about ${esc(mine.name)}`,until:w.week,
      body:`<p>${_T`Sica's man leans close: <b>${amt} coin</b> if <b>${esc(mine.name)}</b> does not win this week's ${esc(TIERS[b.tier]?TIERS[b.tier].n:'bout')}. Paid after the bout — and only if the CPU fights for them; take the reins yourself and the deal is off.`}</p><p class="rc-sub">${_T`If it gets out: −${SICA.fameHit} fame and your fighters lose heart.`}</p>
       <div class="acts"><button class="btn" type="button" data-sicabribe="yes">${_T`Take the coin`}</button><button class="btn" type="button" data-sicabribe="no">${_T`Send him away`}</button></div>`});return}
  const t=others.filter(g=>g.contract&&mgrById(g.contract.mgr)&&!mgrById(g.contract.mgr).isPlayer&&(mgrById(g.contract.mgr).p.honor||50)<70);
  if(t.length&&Math.random()<SICA.bribeAI){const g=pickOne(t);g.thrown=w.season+':'+w.week;
    sendLetter(w,{key:'sica-rumour-'+w.season+'-'+w.week,kind:'letter',from:_T('A tavern rumour'),seal:'🍷',title:_T`Sica's coin reached ${esc(g.name)}?`,until:w.week,
      body:`<p>${_T`They say a purse changed hands in the Subura and <b>${esc(g.name)}</b> (${esc(mgrById(g.contract.mgr).ludus)}) will not try too hard this week. Bet accordingly — or don't.`}</p>`})}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-sicabribe]');if(!b)return;const w=W_();if(!w||!w.sicaBribe||w.sicaBribe.state!=='offer')return;e.stopPropagation();
  const yes=b.dataset.sicabribe==='yes';w.sicaBribe.state=yes?'yes':'no';const g=gById(w.sicaBribe.gid);
  tnews(yes?_T`🗡 You shook Sica's hand: ${esc(g?g.name:_T('your fighter'))} holds back this week.`:_T`🗡 You sent Sica's man away. He smiled, which is worse.`);
  if(!yes&&sicaMgr(w)){const sm=sicaMgr(w);const pm=me();pm.rivals=pm.rivals||{};sm.rivals[pm.id]=Math.min(90,(sm.rivals[pm.id]||0)+15)}
  const L=(w.letters||[]).find(x=>x.key==='sica-bribe-'+w.season+'-'+w.week);if(L)L.read=true;saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* after the bout: pay, or not; and maybe it gets out */
{const base=applyBout;applyBout=function(bi,res,opt){const w=W_();const b=w&&w.night&&w.night.bouts[bi];const was=b&&b.done;const r=base.apply(this,arguments);
  try{const B=w.sicaBribe;if(!b||was||!B||B.state!=='yes'||B.wk!==w.week||!b.ents.includes(B.gid)||B.settled)return r;B.settled=1;const g=gById(B.gid);const pm=me();
    const row=res&&res.rows.find(x=>x.mgrId===B.gid);const won=!!(row&&res.winners.includes(row.id));
    if(B.off){tnews(_T`🗡 You fought ${esc(g.name)} yourself — Sica's deal is off.`);return r}
    if(won){tnews(_T`🗡 ${esc(g.name)} won anyway. Sica's men are not pleased.`,'big');const sm=sicaMgr(w);if(sm){sm.rivals[pm.id]=Math.min(90,(sm.rivals[pm.id]||0)+20)}return r}
    pm.coin+=B.amt;tnews(_T`🗡 Sica pays: <b>+${B.amt} coin</b> for ${esc(g.name)}'s quiet afternoon.`);
    if(Math.random()<SICA.caught){pm.fame=Math.max(0,(pm.fame||0)-SICA.fameHit);for(const x of rosterOf(pm))x.morale=Math.max(0,(x.morale||50)-SICA.moraleHit);
      tnews(_T`📯 <b>It gets out.</b> The crowd hisses at ${esc(pm.ludus)} — −${SICA.fameHit} fame; your fighters are ashamed (−${SICA.moraleHit} morale).`,'big')}}catch(e){console.error(e)}return r}}
/* poaching: an unhappy fighter takes Sica's cash */
function sicaPoach(w){const sm=sicaMgr(w);if(!sm||Math.random()>=SICA.poach||rosterOf(sm).length>=7)return;
  const c=w.glads.filter(g=>g.alive!==false&&g.contract&&!isSicaG(g)&&(g.morale||50)<SICA.poachMorale&&!g.inj);if(!c.length)return;const g=pickOne(c);const from=mgrById(g.contract.mgr);
  g.contract={mgr:sm.id,wage:askWage(g)+3,weeks:8,since:w.week};g.morale=60;sm.poached=(sm.poached||0)+1;if(typeof ghist==='function')ghist(g,_T`lured to Sica's Syndicate from ${esc(from.ludus)}`);
  if(from.isPlayer){tnews(_T`🗡 <b>${esc(g.name)}</b> is gone — Sica's cash found them unhappy. They fight for the Syndicate now.`,'big');sendLetter(w,{key:'sica-poach-'+g.id,kind:'letter',from:_T('Sica'),seal:'🗡',title:_T`${esc(g.name)} works for me now`,until:w.week+1,body:`<p>${_T`An unhappy fighter is an expensive fighter, lanista. <b>${esc(g.name)}</b> took my coin. Keep the others happy.`}</p>`})}
  else mnews(_T`🗡 ${esc(g.name)} leaves ${esc(from.ludus)} for Sica's Syndicate — the Subura pays better than pride.`)}
(()=>{const st=document.createElement('style');st.textContent=`.badge.sicab{border-color:#5b2a6e;color:#d9b8ea}`;document.head.appendChild(st)})();
