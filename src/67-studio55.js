/* =====================================================================
   67-STUDIO55 · v0.55 CREATOR STUDIO: ratings
   =====================================================================
   - Character designer: five rating sliders (50–99) sharing a 375-point pool (STAT_BUDGET); Sandbox characters
     skip the pool. The perks they earn are shown live. Old characters get ratings that reproduce their class
     ability (statsFromAbil).
   - Class designer: a class no longer picks movement, damage, coin or CF — the ratings grant those. It can still
     carry stones, or a tamed ally released once per event: Zora the eagle or any beast (ally).
   - Beast designer: Speed and Strength shown from the beast's Movement and Attack.
   ===================================================================== */
ABILITIES.zora=[_T('Tamed ally'),_T('Releases a tamed ally (Zora the eagle, or another beast) once per event (Venatore).'),4,_T('+1 ally release per event')];
/* allyOpts — beasts a class can bring as its tamed ally */
function allyOpts(){return Object.entries(NPCT).map(([k,T])=>[k,(k==='zora'?_T('Golden Eagle (Zora)'):T.n)+(k.startsWith('cn_')?' ✦':'')])}
/* fitBudget — trims the highest ratings until the pool fits */
function fitBudget(st){st=cleanStats(st);while(statSum(st)>STAT_BUDGET){const k=STAT_KEYS.reduce((a,b)=>st[a]>=st[b]?a:b);if(st[k]<=STAT_MIN)break;st[k]--}return st}
function draftStats(c){if(!c.stats){const ref=c.classRef||'';const lean=ref.startsWith('cls:')?STAT_LEAN[ref.slice(4)]||[]:[];
  c.stats=c.id&&STAT_ABILS.has(c.abil)?statsFromAbil(c.abil,c.abilVal):rollStats(lean,70);if(!c.sandbox)c.stats=fitBudget(c.stats)}return c.stats}
function statSlidersHTML(c){const st=draftStats(c);const sum=statSum(st);const over=!c.sandbox&&sum>STAT_BUDGET;
  return `<h4>${_T`Ratings`} <span class="rc-sub">${c.sandbox?_T('sandbox: no pool'):_T`share a pool of ${STAT_BUDGET}`}</span></h4>
    <div class="statbudget${over?' over':''}" id="stStatSum">${_T`${sum} / ${c.sandbox?'—':STAT_BUDGET} points ·`} <span id="stPerks">${_T`${statPerks(st).join(' · ')||_T('no perks yet')} · plays ${bandInt(st.int)==='hard'?_T('Hard'):bandInt(st.int)==='normal'?_T('Normal'):_T('Easy')}`}</span></div>
    <div style="display:grid;gap:4px">${STATS.map(([k,n,ic,what])=>`<label class="sliderow" title="${n}: ${k==='int'?_T('how a CPU plays (Normal at 76, Hard at 96)'):k==='str'?_T('+1 damage at 76, +2 at 87, +3 at 96'):_T`+1 ${what} at 76, +2 at 96`}"><span>${ic} ${n}</span><input type="range" min="${STAT_MIN}" max="${STAT_MAX}" data-stat="${k}" value="${st[k]}"><output>${st[k]}</output><span class="rc-sub" data-statperk="${k}"></span></label>`).join('')}</div>
    <p class="rc-sub" style="margin:4px 0 0">${_T`Movement, damage, coin and CF bonuses pay in rounds that allow class abilities. In Manager mode, ratings grow with training and fights.`}</p>`}
{const base=charEditorHTML;charEditorHTML=function(){const c=ST.draft;let h=base.apply(this,arguments);if(!c)return h;
  const i=h.indexOf('<h4>'+TX('CPU personality (when a CPU plays this character)'));return i<0?h:h.slice(0,i)+statSlidersHTML(c)+h.slice(i)}}
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.stat||typeof ST==='undefined'||!ST.draft)return;const c=ST.draft;const st=draftStats(c);const k=t.dataset.stat;
  let v=statFix(t.value);if(!c.sandbox){const others=statSum(st)-st[k];v=Math.min(v,STAT_BUDGET-others)}v=statFix(v);st[k]=v;t.value=v;if(t.nextElementSibling)t.nextElementSibling.textContent=v;
  const sum=statSum(st);const box=document.getElementById('stStatSum');if(box){box.classList.toggle('over',!c.sandbox&&sum>STAT_BUDGET);box.firstChild.textContent=_T`${sum} / ${c.sandbox?'—':STAT_BUDGET} points · `}
  const pk=document.getElementById('stPerks');if(pk)pk.textContent=_T`${statPerks(st).join(' · ')||_T('no perks yet')} · plays ${bandInt(st.int)==='hard'?_T('Hard'):bandInt(st.int)==='normal'?_T('Normal'):_T('Easy')}`},true);
{const base=stSaveDraft;stSaveDraft=function(){if(ST.tab==='chars'&&ST.draft){draftStats(ST.draft);if(!ST.draft.sandbox)ST.draft.stats=fitBudget(ST.draft.stats)}return base.apply(this,arguments)}}
/* a class's ally travels to the characters that use it, and onto the sand */
{const base=classLoadout;classLoadout=function(ref){const L=base.apply(this,arguments);if(L&&ref&&String(ref).startsWith('ccl:')){const c=(CUSTOM.classes||[]).find(x=>x.id===String(ref).slice(4));L.ally=c&&c.abil==='zora'?c.ally||'zora':null}return L}}
{const base=charClass;charClass=function(c){const C=base.apply(this,arguments);C.ally=c.abil==='zora'?c.ally||'zora':null;
  const perks=statPerks(c.stats||statsFromAbil(c.abil,c.abilVal));const rest=STAT_ABILS.has(c.abil)||c.abil==='none'||!c.abil?'':`${c.abilText?esc(c.abilText)+' — ':''}${c.abil==='zora'?_T`tamed ally: ${esc(NPCT[C.ally]?(C.ally==='zora'?_T('Zora the eagle'):NPCT[C.ally].n):_T('Zora'))}, released ${c.abilVal>1?c.abilVal+' times':_T('once')} per event`:abilDesc(c.abil,c.abilVal||1)}. `;
  C.ab=_T`Ability: ${rest}${perks.length?_T('ratings grant ')+perks.join(', ')+'.':_T('no rating perks yet.')}${c.weak&&c.weak!=='none'&&WEAKNESSES[c.weak]?_T(' Weakness: ')+WEAKNESSES[c.weak][1]:''}`;return C}}
/* ---- the Beast designer: Speed and Strength read off Movement and Attack ---- */
{const base=npcEditorHTML;npcEditorHTML=function(){let h=base.apply(this,arguments);const n=ST.draft;if(!n)return h;
  const sp=statFix((NPC_SPD[clamp(+n.mv||1,1,7)]||73)),str=statFix((NPC_STR[clamp(+n.ap||1,1,6)]||99));
  const chip=`<div class="rc-sub" style="margin:4px 0 8px">${_T`Ratings: 🏃 Speed <b>${sp}</b> · 💪 Strength <b>${str}</b> <span>— set by Movement and Attack</span>`}</div>`;
  const i=h.indexOf('<label>'+TXPRE('Coin when slain {0}'));return i<0?h:h.slice(0,i)+`<div style="grid-column:1/-1">${chip}</div>`+h.slice(i)}}
