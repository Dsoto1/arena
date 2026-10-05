/* 152-v87npc — v0.87 beast cards (his notes):
   • A beast that entered from an ARENA DECK card (Leo, Leaena, Tholo, Commodus, a custom beast's spawn_cn_<id>) keeps that card in the
     Field tab's top row (beside Crowd Restless…) while it lives: resolveDrawn marks the new beast n.card87 = the card key; the row is
     data-nc82 (129's click → its beast card). Beasts placed at the start carry no card.
   • The beasts that start on the sand (wolves, snakes, bears… — never in the arena deck) have NO card: clicking one opens a popup with
     its token face (40-rtok npcTokHTML) on the left and its stats on the right (npcStats87). Custom and printed beasts keep their cards. */
{const base=resolveDrawn;resolveDrawn=async function(player,k){
  const spawn=typeof k==='string'&&k.startsWith('spawn');const before=spawn&&S?new Set((S.npcs||[]).map(n=>n.id)):null;
  const r=await base.apply(this,arguments);
  try{if(before)for(const n of S.npcs||[])if(!before.has(n.id)&&n.card87==null)n.card87=k}catch(e){}
  return r}}
{const base=npcTrackerHTML;npcTrackerHTML=function(){let h=base.apply(this,arguments);
  try{if(!S)return h;const list=(S.npcs||[]).filter(n=>n.alive&&n.card87&&CARDS[n.card87]);if(!list.length)return h;
    const cards=list.map(n=>`<span class="ac ac87" data-nc82="${n.id}">${cardHTML('c:'+n.card87,'xs')}<span><b>${esc(n.name)}</b><br><span style="color:var(--muted)">${_T`on the sand · ${Math.max(0,n.hp)} HP`}</span></span></span>`).join('');
    if(h.includes('<div class="actcards">'))h=h.replace('<div class="actcards">','<div class="actcards">'+cards);
    else h=h.replace(/(<h3>[\s\S]*?<\/h3>)/,`$1<div class="actcards">${cards}</div>`)}catch(e){console.error(e)}
  return h}}
/* the starting beasts (wolves, snakes, bears… — never in the arena deck) have no card: their popup = the token face on the LEFT,
   the stats on the RIGHT (name, kind · HP, attack / range / move per behaviour state, the rules lines) */
function npcBase87(t){return !!NPCT[t]&&!String(t).startsWith('cn_')&&!nc82Printed({t,name:'',key:''})}
function npcStats87(t,key,name){const sp=nc82Spec(t,key,name),T=sp.T;const st=T.states&&T.states.length===3?T.states:null;
  const rows=st?st.map((x,i)=>({lab:x[4]||'',hp:i===0?T.hp:Math.max(0,st[i-1][0]-1),a:x[1],r:x[2],m:x[3]})):[{lab:'',hp:T.hp,a:T.ap,r:T.rng||1,m:T.mv}];
  const tok=typeof npcTokHTML==='function'?npcTokHTML({t,name:sp.name},150):'';const kind=typeof npcKind==='function'?npcKind(t):T.n;
  const tbl=`<table class="ns87t"><tr>${st?'<th></th>':''}<th>${_T`Attack`}</th><th>${_T`Range`}</th><th>${_T`Move`}</th>${st?`<th>${_T`From HP`}</th>`:''}</tr>${rows.map(x=>`<tr>${st?`<td>${esc(x.lab)}</td>`:''}<td>${x.a}</td><td>${x.r}</td><td>${x.m}</td>${st?`<td>${x.hp}</td>`:''}</tr>`).join('')}</table>`;
  return `<div class="ns87">${tok?`<div class="ns87tok">${tok}</div>`:`<div class="ns87tok g" style="background:${esc(T.col||'#777')}">${esc(T.g||'?')}</div>`}
    <div class="ns87info"><b class="ns87nm">${esc(sp.name)}</b><div class="ns87kd">${_T`${kind&&kind!=='Unknown'?esc(kind)+' · ':''}${T.hp} HP`}</div>${tbl}
    <div class="ns87rules">${nc82Rules(sp).slice(0,-1).map(x=>`<p>${esc(x)}</p>`).join('')}
    <p class="ns87rw">${_T`Slain:`} <span class="ns87i">${ICO.coin}<b>${T.coin||0}</b></span> <span class="ns87i">${ICO.wheat}<b>${T.cf||0}</b> CF</span></p></div></div></div>`}
{const base=nc82Open;nc82Open=function(t,key,name){if(HEADLESS||!NPCT[t]||!npcBase87(t))return base.apply(this,arguments);
  let pop=document.getElementById('nc82pop');if(pop)pop.remove();pop=document.createElement('div');pop.id='nc82pop';
  pop.innerHTML=`<div class="nc82popin">${npcStats87(t,key,name)}<div class="rc-sub">${_T`Esc to close`}</div></div>`;
  document.body.appendChild(pop)}}
{const css=document.createElement('style');css.textContent=`
.ns87{display:flex;gap:18px;align-items:center;background:linear-gradient(#2a1f17,#1c140f);border:1px solid var(--gold);border-radius:10px;padding:16px 18px;max-width:min(520px,92vw);box-shadow:0 14px 40px rgba(0,0,0,.6)}
.ns87tok{flex:0 0 auto;width:clamp(96px,26vw,150px);aspect-ratio:1;border-radius:50%;filter:drop-shadow(0 3px 8px rgba(0,0,0,.6))}
.ns87tok .rtok{display:block;width:100%!important;height:100%!important;border-radius:50%}
.ns87tok.g{display:grid;place-items:center;font-size:48px;color:#fff}
.ns87info{min-width:0;flex:1;text-align:left}.ns87nm{display:block;font:400 24px var(--display);color:var(--gold2)}.ns87kd{color:var(--muted);font-size:13px;margin:2px 0 8px}
.ns87t{border-collapse:collapse;font-size:13px;margin-bottom:8px}.ns87t th{color:var(--muted);font-weight:500;padding:2px 8px 2px 0;text-align:left}
.ns87t td{padding:2px 8px 2px 0;color:var(--bone);font-variant-numeric:tabular-nums}.ns87t td:first-child{color:var(--muted)}
.ns87rules p{margin:4px 0;font-size:13px;color:var(--bone)}
.ns87rw{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ns87i{display:inline-flex;align-items:center;gap:4px}.ns87i .ico,.ns87i img{width:18px;height:18px}.ns87i b{color:var(--gold2)}
@media (max-width:480px){.ns87rw{justify-content:center}}
@media (max-width:480px){.ns87{flex-direction:column}.ns87info{text-align:center}.ns87t{margin:0 auto 8px}}
#npcPanel .ac87{cursor:pointer}
`;document.head.appendChild(css)}
