/* =====================================================================
   362-v105league — v1.05 workstream C (tools/plans/v105/NOTES.md: N1 + F1; v104/NOTES.md N1, B4). Kill switch localStorage flavius_v105coff=1;
   test tv105c.
   N1  LEAGUE SEASON PICKER. On the League tab a "Season" select (current + every past season of the career; shown from season 2): a past season
       shows its final table (from m.spS[season], which every season keeps), its Superbus bracket (355's sb104Tree, read-only, drawn on a
       stand-in world that carries the archived playoff state) and its Flavian awards (w.awardHist, 22-trophies). The one thing not kept
       anywhere was a finished season's bracket (w.po104 is replaced by the next season's), so endWeek is wrapped: when the season rolls over,
       w.seasons105[season] = {po: a copy of that season's w.po104} (a few hundred bytes). Seasons played before v1.05 show whatever exists
       (table, awards, an older Superbus champion from w.specialLog) and "not recorded" for the rest. Old worlds load unchanged (the field is
       optional). Display only; never the dice.
   F1  RAIL CHIPS. Every rail count / hours chip / tick sits at the RIGHT edge of its row: 272's Recruiting hours oval (.hr99), 95's hours chip
       (.hrchip) and the Done ✓ (.tabchk) now float right like the c73 / c85n / dk99n ovals.
   ===================================================================== */
const V105C={on:(()=>{try{return localStorage.getItem('flavius_v105coff')!=='1'}catch(e){return true}})()};
if(V105C.on){
MGR.lg105=0;
/* ---------------- N1 · archive the bracket when the season rolls over ---------------- */
{const base=endWeek;endWeek=async function(){let w=null,s0=0,P0=null;
  try{w=W_();if(w&&!w.tutorial){s0=w.season;P0=w.po104&&w.po104.s===s0?JSON.parse(JSON.stringify(w.po104)):null}}catch(e){}
  const r=await base.apply(this,arguments);
  try{const w2=W_();if(w2&&w2===w&&w2.season>s0&&s0){const A=w2.seasons105=w2.seasons105||{};A[s0]={po:P0};if(typeof saveWorld==='function')saveWorld()}}catch(e){console.error(e)}
  return r}}
/* ---------------- N1 · the past-season view ---------------- */
const lg105Seasons=w=>{const a=[];for(let s=w.season;s>=1;s--)a.push(s);return a};
function lg105Po(w,s){const A=w.seasons105&&w.seasons105[s];if(A&&A.po)return A.po;return w.po104&&w.po104.s===s?w.po104:null}
function lg105Table(w,s){const rows=(w.mgrs||[]).map(m=>({m,sp:(m.spS||{})[s]})).filter(x=>x.sp&&(x.sp.b||x.sp.pts));
  rows.sort((a,b)=>((b.sp.pts||0)-(a.sp.pts||0))||((b.sp.b?b.sp.w/b.sp.b:0)-(a.sp.b?a.sp.w/a.sp.b:0)));
  if(!rows.length)return `<p class="hint">${_T('Not recorded.')}</p>`;
  const po=lg105Po(w,s);const top=po&&po.seeds?po.seeds.slice(0,12):[];
  return `<div style="overflow-x:auto"><table class="tally lg105t"><tr><th>#</th><th>${_T`Lanista`}</th><th>${_T`Pts`}</th><th>${_T`Season`}</th></tr>${rows.map((x,i)=>{const m=x.m;const inPo=top.includes('m:'+m.id);
    return `<tr class="${m.isPlayer?'me':''}"><td class="n">${i+1}${inPo?' <span title="'+esc(_T('Superbus place'))+'">🏛</span>':''}</td><td>${typeof flagChip==='function'?flagChip(m,16):`<span style="color:${m.color}">■</span>`} <b>${esc(m.name)}</b><br><span class="rc-sub">${esc(m.ludus)}</span></td><td class="n"><b>${x.sp.pts||0}</b></td><td class="rc-sub">${typeof lp102Txt==='function'?lp102Txt(x.sp):`${x.sp.w||0}–${Math.max(0,(x.sp.b||0)-(x.sp.w||0))}`}</td></tr>`}).join('')}</table></div>`}
function lg105Bracket(w,s){const po=lg105Po(w,s);
  if(po&&po.seeds&&po.r1&&typeof sb104Tree==='function'){try{const fw=Object.create(w);fw.po104=po;fw.season=po.s;fw.night=null;
      const h=sb104Tree(fw,true).replace(/(<div class="po104bk[^"]*")/,'$1 data-lg105="1"');return `<div class="card2 v104sbr lg105br"><div class="v104sh">${_T`🏛 The Flavius Superbus · season ${s}`}</div>${h}</div>`}catch(e){console.error(e)}}
  const L=(w.specialLog||[]).find(x=>x.season===s&&/Superbus/.test(x.n||''));
  return `<div class="card2 v104sbr lg105br"><div class="v104sh">${_T`🏛 The Flavius Superbus · season ${s}`}</div><p class="hint">${L&&L.champ?_T`Champion: <b>${esc(L.champ)}</b>. The bracket was not recorded.`:_T('Not recorded.')}</p></div>`}
function lg105Awards(w,s){const H=(w.awardHist||[]).find(x=>x.season===s);
  if(!H||!H.awards||!H.awards.length)return `<div class="card2 lg105aw"><div class="v104sh">${_T('🏆 The Flavian Awards')}</div><p class="hint">${_T('Not recorded.')}</p></div>`;
  return `<div class="card2 lg105aw"><div class="v104sh">${_T('🏆 The Flavian Awards')}</div><ul class="po104rv">${H.awards.map(a=>`<li><b>${esc(a.name||'')}</b> — ${esc(a.who||'?')}${a.ludus?` (${esc(a.ludus)})`:''}${a.stat?` · ${esc(a.stat)}`:''}${a.mine?' ★':''}</li>`).join('')}</ul></div>`}
function lg105Past(w,s){return `<div class="lg105past" data-lg105s="${s}"><div class="v104sh">${_T`📊 Season ${s} · final table`}</div>${lg105Table(w,s)}${lg105Bracket(w,s)}${lg105Awards(w,s)}</div>`}
function lg105Bar(w){const sel=MGR.lg105&&MGR.lg105!==w.season?MGR.lg105:w.season;
  return `<div class="lg105bar"><label>${_T('Season')} <select data-lg105sel aria-label="${esc(_T('Season'))}">${lg105Seasons(w).map(s=>`<option value="${s}"${s===sel?' selected':''}>${s===w.season?_T`${s} · now`:s}</option>`).join('')}</select></label></div>`}
function lg105Post(h){const w=W_();if(!w||w.dead||w.tutorial||MGR.view||MGR.tab!=='league'||typeof h!=='string')return h;
  if(w.season<2){MGR.lg105=0;return h}
  if(MGR.lg105&&(MGR.lg105>=w.season||MGR.lg105<1))MGR.lg105=0;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;const pane=R.querySelector('#mgrPane');if(!pane)return h;
  if(MGR.lg105){MGR.sb104v=0;pane.innerHTML=lg105Past(w,MGR.lg105)}
  pane.insertAdjacentHTML('afterbegin',lg105Bar(w));return t.innerHTML}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{return lg105Post(h)}catch(e){console.error(e)}return h}}
document.addEventListener('change',e=>{const s=e.target&&e.target.closest&&e.target.closest('[data-lg105sel]');if(!s)return;const w=W_();if(!w)return;
  const v=parseInt(s.value,10);MGR.lg105=v&&v<w.season?v:0;if(MGR.lg105)MGR.sb104v=0;if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
document.addEventListener('click',e=>{const t=e.target;if(t&&t.closest&&t.closest('[data-mg="tab"]'))MGR.lg105=0;
  if(t&&t.closest&&t.closest('[data-v104s="sb"]'))MGR.lg105=0},true);
/* ---------------- styles (N1 picker + past view, F1 rail chips) ---------------- */
{const st=document.createElement('style');st.textContent=`
.lg105bar{display:flex;justify-content:flex-end;margin:0 0 8px}.lg105bar label{font:13px var(--sans,system-ui);color:var(--dim,#b9a98c);display:flex;align-items:center;gap:6px}
.lg105bar select{font:14px var(--display,serif);color:#f3e3bd;background:#3a2c14;border:1px solid #c9a458;border-radius:6px;padding:3px 8px;min-height:30px}
.lg105past .v104sh{margin:8px 0 4px}.lg105past .card2{margin:0 0 12px}
.mtabs button .mcount.hr99,.mtabs button .hrchip,.mtabs button .tabchk{float:right;margin-left:6px}
`;document.head.appendChild(st)}
}
