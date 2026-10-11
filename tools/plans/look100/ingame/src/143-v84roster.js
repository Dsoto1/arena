/* =====================================================================
   143-V84ROSTER · v0.84 — the depth chart as the barracks wall (Virgilante, approved 2026-10-04)
   =====================================================================
   • Manager → Roster → 📋 Depth chart: depthChartHTML (50-v48, called by name from the rosterBlockHTML wrapper)
     is replaced. Same data and rules (starters = fit and not benched, bench, hurt; lenders = friendly non-rival
     houses with opinion 30+ and room), same controls and handlers: the toggle `.dctog[data-m48="bench"]` and the
     Lend select `.dclend[data-m47lend]`; loansCardHTML still follows.
   • The look: the three columns hang on a dark stone barracks wall (assets/stone_wall.webp under a dark wash).
     Each fighter = a small wooden plaque `.dcard` (~56px: portrait xs; the name across the top;
     under it rating, class chip, ⚕ / 🤝 / 🏋 badges, then the ⭐ Start / 🪑 Bench stamp and, on a lendable bench fighter,
     the Lend select).
   • A column with fighters lays its plaques in a grid (auto-fill, minmax(200px,1fr)) and grows with its head count;
     an EMPTY column collapses to a narrow carved post (vertical "🪑 Bench · 0"), so the populated ones get the width.
     Columns never stretch to the tallest one.
   • Phones (≤600px): columns stack, plaques in one column, empty columns are one-line headers.
   Test: tv84r.
   ===================================================================== */
function depthChartHTML(){const pm=me(),w=W_();const own=ownRoster(pm).concat(loanedIn(pm)).sort((a,b)=>effOvr(b)-effOvr(a));
  const hurt=own.filter(g=>g.inj),fit=own.filter(g=>!g.inj);const st=fit.filter(g=>!g.bench),bn=fit.filter(g=>g.bench);
  const lenders=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=30&&rosterOf(m).length<9);
  const card=g=>{const C=CLASSES[g.cls];const cn=C?C.name:'';const from=g.loanFrom&&g.loanFrom.mid!==pm.id?((mgrById(g.loanFrom.mid)||{}).ludus||''):'';
    const badges=`${g.inj?`<span class="dbg84 hurt" title="${esc(g.inj.label)}">⚕ ${esc(g.inj.label)}</span>`:''}${from?`<span class="dbg84 loan" title="${_T`On loan from ${esc(from)}`}">🤝 ${esc(from.replace(/^(Ludus|House of|The) /,''))}</span>`:''}${g.sparWk===w.week?'<span class="dbg84 spar" title="Sparred: +1 AP +2 CF tonight">🏋</span>':''}`;
    const tog=g.inj?'':`<button type="button" class="btn tksm dctog" data-m48="bench" data-id="${g.id}" title="${g.bench?_T('Make starter'):_T('Send to the bench')}">${g.bench?_T('⭐ Start'):_T('🪑 Bench')}</button>`;
    const lend=g.bench&&!g.inj&&!g.loanFrom&&lenders.length?`<select class="tin dclend" data-m47lend="${g.id}" title="${_T`Lend out for 3 weeks`}"><option value="">${_T`Lend…`}</option>${lenders.map(m=>`<option value="${m.id}">${esc(m.ludus)} · ${loanFee(g)}/wk · 3 wk</option>`).join('')}</select>`:'';
    return `<div class="dcard ${g.bench?'bench':''} ${g.loanFrom?'loan':''} ${g.inj?'hurt84':''}" data-gid84="${g.id}"><div class="dpa84">${gArt(g,'xs')}</div><b class="dpn84" title="${esc(g.name)}">${esc(g.name)}</b><span class="dps84"><b class="dpr84">${effOvr(g)}</b>${cn?`<span class="dcl84" style="--cc:${C.color||'#a3281f'}">${esc(cn)}</span>`:''}${badges}</span>${tog||lend?`<div class="dpx84">${tog}${lend}</div>`:''}</div>`};
  const col=(ic,t,L,none)=>L.length?`<div class="dcol84" style="--n:${L.length}"><div class="dhd">${ic} ${t} · ${L.length}</div><div class="dpl84">${L.map(card).join('')}</div></div>`
    :`<div class="dcol84 dpost84" title="${esc(none)}"><div class="dhd">${ic} ${t} · 0</div></div>`;
  return `<div class="card2 depth"><div class="sect" style="margin-top:0">${_T`📋 Depth chart`} <span class="rc-sub">${_T`starters can be entered on Match Week`}</span></div>
   <div class="dgrid dg84">${col('⭐',_T('Starters'),st,_T('None — make someone a starter.'))}${col('🪑',_T('Bench'),bn,_T('Nobody on the bench.'))}${col('⚕',_T('Hurt'),hurt,_T('Nobody hurt.'))}</div></div>${loansCardHTML()}`}
(()=>{const st=document.createElement('style');const stone=typeof assetURL==='function'?assetURL('stone_wall.webp'):'assets/stone_wall.webp',wood=typeof assetURL==='function'?assetURL('stands_wood81.webp'):'assets/stands_wood81.webp';st.textContent=`
.depth .dgrid.dg84{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;padding:10px;border-radius:8px;border:1px solid #3a2b1f;
  background:linear-gradient(180deg,rgba(26,19,13,.86),rgba(16,11,8,.92)),url('${stone}') center/300px;box-shadow:inset 0 3px 12px rgba(0,0,0,.65)}
.dg84 .dcol84{flex:var(--n,1) 1 214px;min-width:0}
.dg84 .dhd{margin:0 0 6px;text-shadow:0 1px 0 #000}
.dg84 .dpl84{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px}
.dg84 .dpost84{flex:0 0 40px;align-self:stretch;min-height:104px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:1px solid #4a3622;
  background:linear-gradient(90deg,rgba(14,9,5,.88),rgba(52,36,21,.72) 45%,rgba(14,9,5,.9)),url('${wood}') center/120px;box-shadow:2px 3px 6px rgba(0,0,0,.55);cursor:help}
.dg84 .dpost84 .dhd{margin:0;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;color:var(--gold2,#f0cf7d);text-shadow:-1px -1px 0 rgba(0,0,0,.8),1px 1px 0 rgba(255,220,160,.12)}
.dg84 .dcard{display:grid;grid-template-columns:28px minmax(0,1fr) auto;grid-template-rows:auto auto;gap:3px 8px;align-items:center;align-content:center;height:56px;box-sizing:border-box;margin:0;padding:4px 7px 4px 8px;position:relative;
  border:1px solid #6b4f2e;border-top:2px solid #c9a24a;border-radius:4px;background:linear-gradient(180deg,rgba(78,55,33,.9),rgba(42,30,19,.95)),url('${wood}') center/160px;
  box-shadow:0 2px 5px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,220,160,.1)}
.dg84 .dcard::before,.dg84 .dcard::after{content:'';position:absolute;top:3px;width:4px;height:4px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#e8c27a,#7a5a2a 70%);box-shadow:0 1px 1px #000}
.dg84 .dcard::before{left:3px}.dg84 .dcard::after{right:3px}
.dg84 .dcard.bench{border-top-color:#7a6a55;background:linear-gradient(180deg,rgba(58,44,30,.92),rgba(32,24,16,.96)),url('${wood}') center/160px}
.dg84 .dcard.hurt84{border-top-color:#a3281f;border-left:3px solid #a3281f}.dg84 .dcard.loan{border-style:dashed;border-top-style:solid}
.dg84 .dcard>div{display:block}
.dg84 .dpa84{grid-row:1/3;width:28px;height:40px;overflow:hidden;display:grid;place-items:center}.dg84 .dpa84 .portrait{width:26px!important;height:36px!important}.dg84 .dpa84 .cimg{max-width:28px;max-height:40px}
.dg84 .dpn84{grid-column:2/4;min-width:0;display:block;font-size:13px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--bone,#e8dcc0)}
.dg84 .dps84{grid-column:2;display:flex;gap:4px;align-items:center;min-width:0;overflow:hidden;white-space:nowrap;font-size:11px;color:var(--muted)}
.dg84 .dpr84{font:600 12px var(--mono);color:var(--gold2)}
.dg84 .dcl84{border-left:3px solid var(--cc);padding:0 4px;background:rgba(0,0,0,.25);border-radius:2px;overflow:hidden;text-overflow:ellipsis;flex:0 1 auto;min-width:0}
.dg84 .dbg84{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;padding:0 4px;border-radius:2px;background:rgba(0,0,0,.3)}.dg84 .dbg84.hurt{color:#f2a497}.dg84 .dbg84.loan{color:var(--gold2)}.dg84 .dbg84.spar{flex:none}
.dg84 .dpx84{grid-column:3;display:flex!important;flex-direction:row;gap:3px;align-items:center;min-width:0}
.dg84 .dcard .dctog{grid-column:auto;margin:0;padding:1px 5px;font-size:11px;line-height:1.3;height:20px;white-space:nowrap;min-height:0}
.dg84 .dcard .dclend{grid-column:auto;font-size:11px;padding:1px 2px;height:20px;width:62px;min-width:0}
@media (max-width:600px){.depth .dgrid.dg84{flex-direction:column;align-items:stretch;padding:8px;gap:8px}.dg84 .dcol84{flex:none;width:100%}.dg84 .dpl84{grid-template-columns:1fr}
  .dg84 .dpost84{flex:none;min-height:0;width:auto;justify-content:flex-start;padding:5px 8px;background:linear-gradient(180deg,rgba(52,36,21,.85),rgba(14,9,5,.92))}.dg84 .dpost84 .dhd{writing-mode:horizontal-tb;transform:none}}`;document.head.appendChild(st)})();
