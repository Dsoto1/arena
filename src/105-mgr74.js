/* =====================================================================
   105-MGR74 · v0.74 — every hour has a use, and recruiting is your call (Virgilante)
   =====================================================================
   • Training Yard, one-hour jobs (training hours, outside the 4 h per fighter): 🗣 Morale talk (+5 morale, once per fighter a week),
     📜 Study the card (once a week: the opponents on your fighters' cards are scouted, your entered fighters gain a little
     Intelligence), 🛡 Gear care (+1 AP for that fighter's next bout, once per fighter a week). Kept in thPlan(w).x74.
   • Infirmary: each hurt fighter's bed shows the body — the wounded part tinted, lost limbs marked — and the 🛁 baths: a Rubdown
     (1 training hour, −10 fatigue, once per fighter a week).
   • Recruiting: the first step adds 👁 Watch them train (1 h: two ratings as ranges + their top motive) and 🍺 Ask around (1 h, free:
     who courts them, roughly their ask, a personality hint — wrong one time in four); the second step adds ✉ Private note (1 h, no
     pitch): Praise / Promise (their ask rises 10% when you sign) / Plain truth, landing by what they want. Each step marks one
     action "★ Advisor suggests" with a reason; the board's next-step button wears the ★ and a ⋯ for every other option.
   ===================================================================== */
function x74(w){const P=thPlan(w);if(!P.x74)P.x74={morale:[],study:0,gear:[],rub:[]};return P.x74}
{const base=thUsed;thUsed=function(w){const n=base.apply(this,arguments);try{const X=thPlan(w||W_()).x74;if(!X)return n;return n+X.morale.length+X.study+X.gear.length+X.rub.length}catch(e){return n}}}
function yardJobsHTML(){const w=W_(),m=me();const X=x74(w);const ros=rosterOf(m);const left=thLeft(w);const dis=c=>c||left<1?'disabled':'';
  const row=g=>`<div class="yj"><span class="yjn">${esc(g.name)}</span><span class="rc-sub">morale ${g.morale}</span>
    <button class="btn tksm" type="button" data-yj="morale" data-id="${g.id}" ${dis(X.morale.includes(g.id))}>🗣 Morale talk<small>1 h · +5 morale</small></button>
    <button class="btn tksm" type="button" data-yj="gear" data-id="${g.id}" ${dis(X.gear.includes(g.id)||g.inj)}>🛡 Gear care<small>1 h · +1 AP next bout</small></button></div>`;
  return `<div class="card2 yjobs"><div class="sect" style="margin-top:0">⏱ One-hour jobs <span class="rc-sub">${left} training hour${left===1?'':'s'} left · outside the 4 h per fighter</span></div>
    <div class="acts" style="margin-bottom:6px"><button class="btn tksm" type="button" data-yj="study" ${dis(X.study)}>📜 Study the card<small>1 h · scout this week's opponents · a little Intelligence</small></button></div>${ros.map(row).join('')}</div>`}
{const base=thPlanHTML;thPlanHTML=function(){return base.apply(this,arguments)+yardJobsHTML()}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-yj]');if(!b||b.disabled)return;e.stopPropagation();const w=W_(),m=me();const X=x74(w);if(thLeft(w)<1)return;const k=b.dataset.yj;const g=gById(b.dataset.id);
  if(k==='morale'&&g&&!X.morale.includes(g.id)){X.morale.push(g.id);g.morale=clamp((g.morale||50)+5,0,100);tnews(`🗣 A word in the yard: ${esc(g.name)} stands taller (+5 morale).`)}
  else if(k==='gear'&&g&&!X.gear.includes(g.id)){X.gear.push(g.id);g.gear74=w.season+':'+w.week;tnews(`🛡 ${esc(g.name)}'s kit is oiled and buckled tight: +1 AP next bout.`)}
  else if(k==='study'&&!X.study){X.study=1;const mine=new Set(rosterOf(m).map(x=>x.id));let n=0;
    for(const bt of w.night?w.night.bouts:[]){if(!bt.ents.some(id=>mine.has(id)))continue;for(const id of bt.ents){const o=gById(id);if(!o)continue;if(mine.has(id)){if(typeof statGain==='function')statGain(o,'int',0.4)}else if((o.scout||0)<1){o.scout=1;n++}}}
    tnews(`📜 Your doctores study the card: ${n} opponent${n===1?'':'s'} read like a scroll.`)}
  else return;saveWorld();MGR_REDRAW()},true);
{const base=boostFor;boostFor=function(g){const b=base.apply(this,arguments);try{const w=W_();if(g&&w&&g.gear74===w.season+':'+w.week)b.ap=Math.min(7,(b.ap||0)+1)}catch(e){}return b}}
/* ---------- the infirmary: the body and the baths ---------- */
function injLoc74(label){const t=String(label||'').toLowerCase();return /skull|head|eye|jaw/.test(t)?'head':/rib|chest|gut|back/.test(t)?'chest':/shoulder|arm|elbow|wrist/.test(t)?'larm':/hand|finger/.test(t)?'rarm':/thigh|knee|leg|ankle|foot/.test(t)?'rleg':'chest'}
function injuryAvatar74(g){if(typeof avatarFor73!=='function')return '';const p=avatarFor73([],'inj'+g.id);for(const l of g.severed||[])if(p.hp[l]!=null)p.hp[l]=0;
  if(g.inj&&!g.inj.war){const l=injLoc74(g.inj.label);if(p.hp[l]>0)p.hp[l]=Math.max(1,Math.round(p.hp[l]*0.35))}
  let sv=avatarSVG(p).replace(/<text[^>]*>(?:R|L|fist|[^<]*)<\/text>/g,m0=>/✂|✝|SEVER|LOST/i.test(m0)?m0:'');
  if(g.inj&&!g.inj.war){const l=injLoc74(g.inj.label);const m=sv.match(new RegExp(`<path d="([^"]*)"[^>]*data-avloc="${l}"`));if(m)sv=sv.replace('</svg>',`<path d="${m[1]}" fill="#ff4a3a" fill-opacity=".45" stroke="#ff6a55" stroke-width="2.5" class="injmark" pointer-events="none"/></svg>`)}
  return sv}
{const base=infirmaryHTML;infirmaryHTML=function(){let h=base.apply(this,arguments);try{const w=W_(),m=me();const ros=rosterOf(m);const X=x74(w);
  for(const g of ros.filter(g=>(g.inj&&!g.inj.war)||(g.severed||[]).length)){const i=h.indexOf(`<b>${esc(g.name)}</b>`);if(i<0)continue;const c=h.lastIndexOf('<div class="bedcard',i);if(c<0)continue;const e=h.indexOf('>',c)+1;
    const where=[g.inj&&!g.inj.war?`🩸 ${esc(LOCN[injLoc74(g.inj.label)]||'')}`:'',...(g.severed||[]).map(l=>`✂ ${esc(LOCN[l]||l)} lost`)].filter(Boolean).join(' · ');
    h=h.slice(0,e)+`<div class="injav" title="${where}">${injuryAvatar74(g)}<span>${where}</span></div>`+h.slice(e)}
  const left=thLeft(w);
  h+=`<div class="sect">🛁 The baths <span class="rc-sub">care beyond wounds · ${left} training hour${left===1?'':'s'} left</span></div><div class="baths">${ros.map(g=>`<div class="bath"><b>${esc(g.name)}</b><span class="rc-sub">fatigue ${Math.round(g.fat||0)}</span><i class="meter"><i style="width:${Math.min(100,g.fat||0)}%"></i></i>
    <button class="btn tksm" type="button" data-bath="${g.id}" ${X.rub.includes(g.id)||left<1||!(g.fat>0)?'disabled':''}>🛁 Rubdown<small>1 h · −10 fatigue</small></button></div>`).join('')}</div>`}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-bath]');if(!b||b.disabled)return;e.stopPropagation();const w=W_();const X=x74(w);const g=gById(b.dataset.bath);if(!g||X.rub.includes(g.id)||thLeft(w)<1)return;
  X.rub.push(g.id);g.fat=Math.max(0,(g.fat||0)-10);tnews(`🛁 Oil, steam and strong hands: ${esc(g.name)} sheds some weariness (−10 fatigue).`);saveWorld();MGR_REDRAW()},true);
/* ---------- recruiting: your choice at every step ---------- */
const TONES74={praise:['Praise',['glory','spectacle']],promise:['Promise',['coin','playing']],truth:['Plain truth',['honor','training']]};
const toneW74=(g,t)=>TONES74[t][1].reduce((a,k)=>a+((g.motives||[]).find(x=>x[0]===k)||[0,0])[1],0);
const wkKey74=()=>{const w=W_();return w.season+':'+w.week};
function recAdvice74(g,m,step){const w=W_();
  if(step===1){if(!g.scout&&w.hours>=3&&m.coin>=scoutCost(g))return ['scout','A full report — what they want and how they really fight.'];if(w.hours>=1&&g.watch74!==wkKey74())return ['watch','An hour in the yard tells you a lot for nothing.'];return null}
  if(step===2){const bp=typeof bestPitch==='function'?bestPitch(g,m):null;if(bp&&pitchesLeft()>0)return ['pitch:'+bp.k,`They care about ${MOTIVES[bp.k][0].toLowerCase()} — say so.`];
    if(w.hours>=1&&g.note74!==wkKey74()){const t=Object.keys(TONES74).sort((a,b)=>toneW74(g,b)-toneW74(g,a))[0];return ['note:'+t,`A private note — the ${TONES74[t][0].toLowerCase()} tone suits them.`]}return null}
  if(step===3)return ['offer','They are listening — make the offer.'];return null}
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{const w=W_(),m=me();if(!g||g.contract||!h.includes('class="rsteps"'))return h;const step=MGR.recStep||recStepNow(g,m);const adv=recAdvice74(g,m,step);
  const wk=wkKey74();let add='';
  if(step===1){const watched=g.watch74===wk&&g.watchK;const rum=g.rumor74&&g.rumor74.wk===wk?g.rumor74:null;
    add=`<div class="acts" style="margin-top:6px"><button class="btn tksm" type="button" data-rec74="watch" data-id="${g.id}" ${w.hours<1||g.watch74===wk?'disabled':''}>👁 Watch them train<small>1 h · two ratings + what they want most</small></button><button class="btn tksm" type="button" data-rec74="ask" data-id="${g.id}" ${w.hours<1||rum?'disabled':''}>🍺 Ask around<small>1 h · rumours, free</small></button></div>
      ${watched?`<div class="rc-sub recnote">👁 ${g.watchK.map(([n,lo,hi])=>`${n} <b>${lo}–${hi}</b>`).join(' · ')} · wants <b>${esc(g.watchTop||'?')}</b></div>`:''}
      ${rum?`<div class="rc-sub recnote">🍺 ${rum.txt}</div>`:''}`}
  if(step===2){const sent=g.note74===wk;add=`<div class="sect">✉ Private note <span class="rc-sub">1 h · doesn't use a pitch · once a week</span></div><div class="acts">${Object.entries(TONES74).map(([t,[n]])=>{const fit=g.scout?(toneW74(g,t)>=0.45?' · lands well':toneW74(g,t)>=0.2?' · fair':' · weak'):'';
    return `<button class="btn tksm" type="button" data-rec74="note:${t}" data-id="${g.id}" ${w.hours<1||sent?'disabled':''}>${n}<small>${t==='promise'?'more interest · ask +10% at signing':t==='truth'?'steady':'proud fighters like it'}${fit}</small></button>`}).join('')}</div>`}
  const advLine=adv?`<div class="advise74">★ <b>Advisor suggests</b> — ${esc(adv[1])}</div>`:'';
  const i=h.lastIndexOf('</div></div>');h=add||advLine?h.replace(/(<div class="rpane">)/,`$1${advLine}`).replace(/(<div class="rpane">[\s\S]*?)(<\/div>\s*<\/div>\s*$)/,`$1${add}$2`):h;
  if(adv){const [a,arg]=adv[0].split(':');const sel=a==='pitch'?`data-mg="pitch" data-id="${g.id}|${arg}"`:a==='note'?`data-rec74="note:${arg}"`:a==='watch'?`data-rec74="watch"`:a==='scout'?`data-mg="scout"`:a==='offer'?`data-mg="offer"`:'';
    if(sel)h=h.replace(new RegExp(`(<button class="btn[^"]*)("[^>]*${sel.replace(/[|]/g,'\\|')})`),'$1 adv74$2')}}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-rec74]');if(!b||b.disabled)return;e.stopPropagation();const w=W_(),m=me();const g=gById(b.dataset.id);if(!g||w.hours<1)return;const wk=wkKey74();const [a,t]=b.dataset.rec74.split(':');
  if(a==='watch'&&g.watch74!==wk){w.hours-=1;g.watch74=wk;const st=gStats(g);const two=[...STATS].sort(()=>Math.random()-.5).slice(0,2); /* UI randomness: never the dice RNG */g.watchK=two.map(([k,n])=>{const v=st[k];const lo=Math.max(1,v-5-Math.floor(Math.random()*3)),hi=v+5+Math.floor(Math.random()*3);return [n,lo,hi]});
    const top=(g.motives||[]).slice().sort((x,y)=>y[1]-x[1])[0];g.watchTop=top?MOTIVES[top[0]][0]:'?'}
  else if(a==='ask'&&!(g.rumor74&&g.rumor74.wk===wk)){w.hours-=1;const s=suitors(g).filter(x=>x.m!==m).slice(0,2).map(x=>esc(x.m.ludus));const ask=Math.round(askWage(g)*(0.85+Math.random()*0.3));
    let tag=(typeof persTags73==='function'?persTags73(g):[])[0]||'';if(Math.random()<0.25){const all=(typeof PERS_KEYS!=='undefined'?PERS_KEYS.map(x=>x[1]):[]).filter(x=>x!==tag);if(all.length)tag=all[Math.floor(Math.random()*all.length)]}
    g.rumor74={wk,txt:`${s.length?`Courted by ${s.join(' and ')}.`:'Nobody else seems to be courting them.'} Talk is they'd want about <b>${ask}/wk</b>.${tag?` They say: <b>${esc(tag)}</b> (rumours lie).`:''}`}}
  else if(a==='note'&&TONES74[t]&&g.note74!==wk){w.hours-=1;g.note74=wk;const wt=toneW74(g,t);let d=Math.round(2+wt*14+Math.floor(Math.random()*3)-1);if(t==='promise'){d+=3;g.promise74=m.id}if(t==='truth'&&(m.p.honor||50)>60)d+=2;if(t==='praise'&&wt<0.15)d=Math.max(0,d-2);
    const before=interestOf(g,m);g.interest[m.id]=capInterest(g,m,before+d);tnews(`✉ A private note to ${esc(g.name)} (${TONES74[t][0].toLowerCase()}): interest +${g.interest[m.id]-before}.`)}
  else return;saveWorld();MGR_REDRAW()},true);
/* a promise is kept at signing: you need to offer 10% more than they'd otherwise take */
{const base=offerVerdict;offerVerdict=function(g,wage,...rest){try{const m=me();if(g&&m&&g.promise74===m.id&&!g.contract)return base.call(this,g,Math.floor(wage/1.1),...rest)}catch(e){}return base.apply(this,arguments)}}
/* the board: the advisor's pick wears a ★, and ⋯ opens every other option */
{const base=nextStep;nextStep=function(g,m){const h=base.apply(this,arguments);if(!g||g.contract)return h;return `<span class="advwrap" title="Advisor suggests">★ ${h}<button class="btn tksm" type="button" data-mg="sel" data-id="${g.id}" title="Every option for ${esc(g.name)}">⋯</button></span>`}}
(()=>{const st=document.createElement('style');st.textContent=`
.yjobs{margin-top:8px}.yj{display:grid;grid-template-columns:minmax(90px,1fr) auto auto auto;gap:6px;align-items:center;padding:3px 0;border-top:1px solid var(--line2)}.yjn{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.injav{display:flex;gap:8px;align-items:center;margin:0 0 4px}.injav svg{width:84px;height:auto;flex:none}.injmark{animation:injp 1.6s ease-in-out infinite}@keyframes injp{50%{fill-opacity:.15}}body.calm .injmark{animation:none}.injav span{font-size:12px;color:#f2a497}
.baths{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:6px}.bath{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center;padding:6px 8px;background:var(--panel2);border:1px solid var(--line2);border-radius:6px}.bath .meter{grid-column:1/2}.bath button{grid-row:1/4;grid-column:2}
.advise74{font-size:12.5px;color:var(--gold2);margin:0 0 6px;padding:4px 8px;border:1px dashed var(--gold);border-radius:6px;background:rgba(240,207,125,.06)}
.btn.adv74{box-shadow:0 0 0 2px var(--gold) inset}.recnote{margin-top:4px}.advwrap{display:flex;gap:4px;align-items:stretch;color:var(--gold2);width:100%}.advwrap>.btn:first-of-type{flex:1;min-width:0}.advwrap>.btn:last-child{flex:0 0 auto;padding:2px 8px}
@media (max-width:600px){.yj{grid-template-columns:1fr 1fr}.yjn{grid-column:1/-1}}`;document.head.appendChild(st)})();
