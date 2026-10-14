/* 200-v91panel — v0.91 THE FIGHTER PANEL BREATHES (his call 2026-10-06): the five rating numbers above the avatar told a player little in a
   bout. The header now shows only what the ratings GIVE this bout, as perk chips ("🏃 +1 move · 💪 +2 dmg · 🍀 +1 coin/turn ·
   🎭 +1 CF/turn"; nothing when nothing is earned, and none while the round bans class abilities); the 🧠 mind chip only on CPU fighters
   (how smart an opponent is); the five ratings in the tooltip of that row. 🤖 Hand to CPU / 🎮 Take control moves up into that corner.
   Full ratings stay in the record, the Studio and the Manager. Runs after 81's panelStatsUp (the row already sits in .pb-head). */
function panelPerks91(p){if(!p||!p.st)return '';const b=statBonuses(p.st);const on=typeof caAllowed!=='function'||caAllowed();const bits=[];
  if(on&&b.mv)bits.push(['🏃',_T`+${b.mv} move`]);if(on&&b.dmg)bits.push(['💪',_T`+${b.dmg} dmg`]);if(on&&b.coin)bits.push(['🍀',_T`+${b.coin} coin/turn`]);if(on&&b.cf)bits.push(['🎭',_T`+${b.cf} CF/turn`]);
  return bits.map(([i,t])=>`<span class="perk91">${i} ${t}</span>`).join('')}
{const base=panelStatsUp;panelStatsUp=function(){const r0=base.apply(this,arguments);try{const b=document.getElementById('board');const h=b&&b.querySelector(':scope>.pb-head');const row=h&&h.querySelector(':scope>.statrow');
  if(!row||!S||!S.players)return r0;const nm0=((h.querySelector('.pname')||{}).textContent||'').trim();const p=S.players.find(x=>x.name===nm0);if(!p||!p.st)return r0;
  const sig=[p.id,p.cpu?1:0,JSON.stringify(p.st),typeof caAllowed==='function'?caAllowed():1].join('|');
  if(row.dataset.p91!==sig){row.dataset.p91=sig;
    const full=STATS.map(([k,n])=>`${n} ${statFix(p.st[k])}`).join(' · ');row.title=_T`Ratings: ${full}`;
    row.innerHTML=`${panelPerks91(p)}${p.cpu&&typeof aiTierChip==='function'?aiTierChip(statFix(p.st.int)):''}`;row.classList.add('row91')}
  const chip=h.querySelector('.seatchip');if(chip&&chip.parentElement!==row)row.appendChild(chip)}catch(e){console.error(e)}return r0}}
{const st=document.createElement('style');st.textContent=`
#board .pb-head>.statrow.row91{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;align-items:flex-start;align-content:flex-start}
#board .statrow.row91 .perk91{font:600 11px/1 var(--mono,monospace);padding:4px 7px;border-radius:999px;background:rgba(201,162,78,.14);border:1px solid rgba(201,162,78,.45);color:#e8cf8e;white-space:nowrap}
#board .statrow.row91 .seatchip{margin:0}`;document.head.appendChild(st)}
