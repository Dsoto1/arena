/* 162-v88gear — v0.88 GEAR BETWEEN TURNS (his rule, 2026-10-05): while it is NOT a gladiator's turn and nobody is attacking them, they may
   ⇄ swap their primary (right hand) and secondary (left hand) weapons and take ANY weapons / armor lying on their tile (the loot token:
   drop piles, corpses, thrown weapons in the sand) — as much as they have room for. On their own turn, or while an attack on them is
   being resolved, they may not. The Loot action on your own turn stays as it was (1 item per turn; off-turn takes never use it up).
   • People: a "🎒 Between turns" bar under the weapons on their fighter board (gear88Ok). The window pauses the CPU turn like any window.
   • CPUs: when another gladiator's turn begins, a CPU standing on loot picks up weapons for a free hand and armor for a free equip point
     (no swaps, no prompts — deterministic, no dice).
   • Online: not yet (the lockstep needs its own input; his pick: offline + hot seat first, online in v0.89). */
const ATK88=new Set();
{const base=doAttack;doAttack=async function(player,source,target){const t=target;if(t)ATK88.add(t);try{return await base.apply(this,arguments)}finally{if(t)ATK88.delete(t)}}}
function gear88Opts(p){try{return lootOptions(p).filter(o=>o.t==='w'||o.t==='a'||o.t==='fw')}catch(e){return []}}
function gear88Ok(p){return !!(S&&!S.over&&!S.onl&&p&&!p.cpu&&p.alive!==false&&!p.out&&!p.underground&&cur()!==p&&!ATK88.has(p)&&S.phase!=='setup')}
function gear88Bar(p){if(!gear88Ok(p))return '';const n=gear88Opts(p).length;const arms=armsAttached(p);const canSwap=arms.length===2&&(p.wR||p.wL);
  if(!n&&!canSwap)return '';
  return `<div class="gb88" data-pid="${p.id}"><span class="gb88h">${_T`🎒 Between turns`}</span>${canSwap?`<button type="button" class="btn tksm" data-gear88="swap">${_T`⇄ Swap hands`}</button>`:''}${n?`<button type="button" class="btn tksm primary" data-gear88="take">${_T`Take from the ground · ${n}`}</button>`:''}</div>`}
{const base=boardHTML;boardHTML=function(player){let h=base.apply(this,arguments);try{const bar=gear88Bar(player);if(bar){const T=document.createElement('template');T.innerHTML=h;const w=T.content.querySelector('.warms');if(w){w.insertAdjacentHTML('afterend',bar);h=T.innerHTML}}}catch(e){console.error(e)}return h}}
function gear88Swap(p){if(!gear88Ok(p))return;const r=p.wR,l=p.wL;p.wR=l||null;p.wL=r||null;if(p.armUses){const u=p.armUses.R;p.armUses.R=p.armUses.L;p.armUses.L=u}
  log(_T`${nm(p)} swaps hands: ${p.wR?esc(p.wR.n):_T('nothing')} is now primary, ${p.wL?esc(p.wL.n):_T('nothing')} secondary.`);render()}
async function gear88Take(p){for(;;){if(!gear88Ok(p))break;const opts=gear88Opts(p);if(!opts.length)break;
    const i=await modal(_T('🎒 Between turns'),`<p>${_T`Not your turn and nobody is attacking you: take anything lying here. Weapons go to a free hand (or swap one out); armor goes on a free spot.`}</p>`,
      opts.map((o,j)=>{const w=o.t==='w'?o.pl.weapons[o.i]:o.t==='fw'?o.floor.w:null;const a=o.t==='a'?o.pl.armor[o.i]:null;return {label:o.label,sub:o.sub,value:j,card:w&&w.key?'w:'+w.key:a&&a.key?'a:'+a.key:null}}).concat([{label:_T('Done'),value:null}]),{close:null});
    if(i==null||!gear88Ok(p))break;const was=p.looted;try{await doLoot(p,opts[i])}finally{p.looted=was}render()}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-gear88]');if(!b)return;e.preventDefault();e.stopPropagation();
  const bar=b.closest('.gb88');const p=bar&&S&&S.players[+bar.dataset.pid];if(!p||!gear88Ok(p))return;if(b.dataset.gear88==='swap')gear88Swap(p);else gear88Take(p)},true);
/* CPUs tidy up between turns: free hands and free spots only */
async function gear88Cpu(){if(!S||S.over||S.onl)return;const c=cur();
  for(const p of S.players||[]){if(!p.cpu||p===c||p.alive===false||p.out||p.underground)continue;
    for(let k=0;k<6;k++){const opts=gear88Opts(p).filter(o=>{if(o.t==='a'){const a=o.pl.armor[o.i];const d=a&&ARM[a.key];return !!d&&sideLocs(d).some(l=>p.hp[l]>0&&!armorConflict(p,l,a.key))}
        return armsAttached(p).some(x=>!p['w'+x])}).sort((x,y)=>(y.val||0)-(x.val||0));if(!opts.length)break;
      const was=p.looted;try{await doLoot(p,opts[0])}catch(e){break}finally{p.looted=was}}}}
{const base=beginTurn;beginTurn=async function(){try{await gear88Cpu()}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const css=document.createElement('style');css.textContent=`
.gb88{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0 2px;padding:6px 8px;border:1px dashed rgba(232,196,106,.45);border-radius:8px;background:rgba(232,196,106,.06)}
.gb88h{font-size:12px;color:var(--muted);margin-right:2px}`;document.head.appendChild(css)}
