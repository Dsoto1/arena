/* =====================================================================
   v0.96/v0.97 · 239-v96auc — FLAVIUS'S AUCTION: the lot card redesigned (owner's note).
   • big card art on the left (~40% of the card), name + base line + a "Bonuses" list on the right: one row per affix = glyph + name
     + a plain sentence on what it does in play; the Legendary unique as its own gold row (name + full rule); value line after.
   • a compact bottom strip: leader / opens at, countdown, bid input + button, Owners and bids folds (all existing data-* hooks kept).
   • a refusal reason ("Test houses may not bid.") is printed ONCE above the grid, not on every lot.
   • phones (≤600 px): one column, art on top. Built as a final onl84Auction wrapper over the finished HTML (after 197's fold).
   ===================================================================== */
/* every bonus: glyph, Latin-style name, and exactly what it does (ONE place) */
const AUC96_AFF={
  dmg:['⚔',_T('Cruentus'),_T('+1 damage on every hit.')],
  rng:['🎯',_T('Longus'),_T('+1 range: it reaches one tile farther.')],
  use:['♻',_T('Perpetuus'),_T('+1 use before it is spent.')],
  pierce:['🗡',_T('Acutus'),_T('Armor-piercing 1: 1 damage of each hit ignores armor.')],
  crowd:['🌾',_T('Gloriosus'),_T('Each hit earns 1 Crowd Favor.')],
  ap:['🛡',_T('Solidus'),_T('+1 AP on the location it guards.')],
  bonus:['🛡',_T('Amplus'),_T('+1 AP on another location of the wearer.')],
  ward:['🛡',_T('Tutus'),_T('The first hit on the wearer each rotation loses 1 damage.')],
  swift:['👟',_T('Velox'),_T('+1 movement while the wearer is unhurt.')],
  venat:['🦁',_T('Venatorius'),_T('Beasts deal 1 less damage to this location.')],
  miss:['🏹',_T('Missilis'),_T('Thrown and shot weapons deal 1 less damage to this location.')],
  firm:['⛓',_T('Firmus'),_T('Floor spikes deal 0 damage to this leg.')],
  spin:['🌵',_T('Spinosus'),_T('A melee hit on this location costs the attacker 1 HP.')],
  lapid:['🪨',_T('Lapidarius'),_T('Stones thrown from the stands deal 0 here.')],
  integ:['💎',_T('Integer'),_T('Never comes back Broken from a bout.')],
  fid:['🔒',_T('Fidelis'),_T('Cannot be looted: if the wearer falls, it goes home.')],
  fort:['🍀',_T('Fortunae'),_T('+1 on the wearer’s Thumb of Flavius roll.')]};
function auc96Rows(L){const a=L.w||{};const rows=[];
  for(const k of a.aff||[]){const e=AUC96_AFF[k];let name=e?e[1]:k,txt=e?e[2]:((ONLC.AFFIX_A[k]||ONLC.AFFIX[k]||{}).n||'');
    if(k==='bonus'&&a.bonus){const ls=Object.keys(a.bonus).map(l=>(typeof LOCN84!=='undefined'&&LOCN84[l])||l).join(', ');txt=_T`+1 AP on the ${ls}.`}
    rows.push(`<li data-aff96="${esc2(k)}"><i aria-hidden="true">${e?e[0]:'✦'}</i><span><b>${esc2(name)}</b> — ${esc2(txt)}</span></li>`)}
  const U=a.uq?(L.kind==='a'?ONLC.UNIQUES_A:ONLC.UNIQUES).find(u=>u.k===a.uq):null;
  if(U)rows.push(`<li class="uq" data-uq96="${esc2(U.k)}"><i aria-hidden="true">👑</i><span><b>${esc2(U.n)}</b> — ${esc2(U.d)}</span></li>`);
  return rows}
function auc96Card(L){const a=L.w||{};const isA=L.kind==='a'||ONLC.isNamedA(L.item);const R=ONLC.rarOf(L.rar||a.rar);const col=ONL83.rarCol[R.k];const base=a.base||'';
  const B=isA?((typeof ARM!=='undefined'&&ARM[base])||{}):((typeof W!=='undefined'&&W[base])||{});
  const art=typeof cardHTML==='function'&&B.n?cardHTML((isA?'a:':'w:')+base,'md'):(isA?'🛡':'⚔');
  const line=isA?_T`${esc2(B.n||base)} · ${esc2(SLOT84[a.slot]||_T('Armor'))}${a.pair?_T(' (pair)'):''} · <b>${a.ap|0} AP</b>`
    :`${esc2(B.n||base)} · ${_T('Weapon')} · ${_T('power')} <b>${a.p!=null?a.p:'—'}</b> · ${_T('range')} <b>${a.r!=null?a.r:'—'}</b>`;
  const rows=auc96Rows(L);const brk=L.st==='broken';
  return `<div class="nw83 au96c ${isA?'na84':''} ${R.k!=='common'?'holo84':''} r-${R.k}" style="--rc:${col}" title="${esc2(a.n||L.n)} · ${R.n}">
    <div class="nw83-art au96a">${art}<i class="nw83-tint"></i><span class="nw83-gem">${R.n}</span></div>
    <div class="au96b"><b class="nw83-n">${esc2(a.n||L.n)}</b><small class="nw83-base">${line}</small>
     <div class="au96h">${_T`Bonuses`}</div>${rows.length?`<ul class="au96l">${rows.join('')}</ul>`:`<p class="au96none">${_T`No bonuses — a plain named piece.`}</p>`}
     <small class="nw83-val">${brk?_T('💔 Broken · '):''}${_T`Value`} ${c83()} <b>${ONLC.valueOf({item:L.item,rar:L.rar,w:a,val:L.val,kind:L.kind})}</b></small></div></div>`}
function auc96Fix(h){if(!h||h.indexOf('au84-lot')<0)return h;const X=ONL84.auc;if(!X)return h;const M=X.mine||{};const byId={};for(const L of [...(X.lots||[]),...(X.past||[])])byId[L.id]=L;
  const T=document.createElement('template');T.innerHTML=h;let note='';
  for(const lot of T.content.querySelectorAll('.au84-lot')){const L=byId[lot.dataset.au84];if(!L||!L.w)continue;
    const old=lot.querySelector(':scope>.nw83');if(!old)continue;const fresh=document.createElement('template');fresh.innerHTML=auc96Card(L);old.replaceWith(fresh.content.firstElementChild);
    const foot=document.createElement('div');foot.className='au96f';
    const bid=lot.querySelector(':scope>.au84-bid');
    if(bid&&!bid.querySelector('input,.au84-me')){const t=bid.textContent.trim();if(t&&!note)note=t;bid.remove()}
    for(const sel of ['.vlt89']){const v=lot.querySelector(':scope>'+sel);if(v)lot.querySelector('.au96a').appendChild(v)}
    for(const x of [...lot.children])if(!x.classList.contains('nw83'))foot.appendChild(x);
    lot.appendChild(foot);lot.classList.add('au96')}
  if(note){const g=T.content.querySelector('.au84-grid:not(.past)');if(g)g.insertAdjacentHTML('beforebegin',`<p class="au96-note" role="status">${esc2(note)}</p>`)}
  return T.innerHTML}
{const base=onl84Auction;onl84Auction=function(){const h=base.apply(this,arguments);try{return auc96Fix(h)}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.id='auc96css';st.textContent=`
#onl .au84-grid{grid-template-columns:repeat(auto-fill,minmax(380px,1fr))}
#onl .au84-lot.au96{height:auto;height:330px;box-sizing:border-box;padding:8px;gap:6px;display:flex;flex-direction:column}
#onl .au84-lot.au96>.nw83.au96c{flex:1 1 auto;height:auto;max-height:none;overflow:hidden;display:grid;grid-template-columns:40% minmax(0,1fr);gap:10px;max-width:none;padding:8px;box-sizing:border-box;align-items:stretch}
#onl .au96c .au96a{align-self:stretch;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.28);position:relative}
#onl .au96c .au96a>.cimg{width:100%;height:auto;max-height:100%;image-rendering:auto}
#onl .au96c .au96a>.vlt89{position:absolute;top:4px;left:4px;z-index:3;margin:0}
#onl .au96c.na84 .au96a>.cimg{width:82%;height:82%;max-height:82%;aspect-ratio:auto;background-size:contain;background-repeat:no-repeat;background-position:center}
#onl .au96c .au96b{display:flex;flex-direction:column;gap:4px;min-width:0}
#onl .au96c .nw83-n{font-size:17px}
#onl .au96h{font:700 10.5px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#d9c08a;border-bottom:1px solid rgba(217,192,138,.3);margin-top:2px}
#onl .au96l{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px;flex:1 1 auto;min-height:0}
#onl .au96l li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:6px;font-size:12px;line-height:1.3;color:#eadbb8;padding:3px 5px;border-radius:6px;background:rgba(255,255,255,.04);border-left:3px solid color-mix(in srgb,var(--rc) 70%,transparent)}
#onl .au96l li i{font-style:normal;text-align:center}#onl .au96l li b{color:#fff3d0}
#onl .au96l li.uq{background:rgba(232,201,106,.14);border-left-color:#e8c96a;color:#f6e7c4}#onl .au96l li.uq b{color:#e8c96a}
#onl .au96none{margin:0;font-size:12px;color:var(--muted)}
#onl .au96f{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 8px;align-items:center;font-size:12px;padding:2px 2px 0}
#onl .au96f>*{min-width:0;margin:0}#onl .au96f>.au84-lead,#onl .au96f>.au84-bid{grid-column:1/-1}
#onl .au96f>.au84-lead{grid-column:1}#onl .au96f>.au84-cd{grid-column:2;justify-self:end;white-space:nowrap}
#onl .au96f .au84-bid{display:flex;gap:6px;align-items:center;flex-wrap:wrap}#onl .au96f .au84-bid .tin{width:84px}
#onl .au96f>.hist91,#onl .au96f>.au84-bids{grid-column:1/-1;display:inline-block}
#onl .au96-note{margin:6px 0;padding:6px 10px;border:1px solid rgba(232,201,106,.4);border-radius:8px;background:rgba(232,201,106,.08);color:#f6e7c4;font-size:13px}
@media (max-width:600px){#onl .au84-grid{grid-template-columns:1fr}#onl .au84-lot.au96{height:auto}
 #onl .au84-lot.au96>.nw83.au96c{grid-template-columns:1fr}#onl .au96c .au96a>.cimg{width:min(100%,220px);margin:0 auto}#onl .au96c.na84 .au96a{min-height:240px}#onl .au96c.na84 .au96a>.cimg{width:82%;height:200px;max-height:none}}`;document.head.appendChild(st)}
