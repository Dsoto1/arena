/* =====================================================================
   381-v105seed — v1.05 B58 (tools/plans/v105/NOTES.md, last entry). Kill switch localStorage flavius_v105seedoff=1; test tv105r.
   Seeds are not table places: 348's po104Seeds skips Sica's Syndicate (wildcard only) and sorts with leagueSort (points, then win rate,
   then fame), so a house can sit 6th in the table and hold seed #4.
   • League table (290 wd100LeagueView, wrapped): a narrow SEED column after the place, from week V104A.proj (9) on. It reads the seed list
     from po104Seeds itself (the bracket's own function — no second sort), or from the real w.po104.seeds once the playoffs are drawn.
     Seeds 1–4 are marked as a rest week; Sica shows "—" (title "Sica takes no seed (wildcard only)"); houses outside the twelve show
     nothing. The # header carries the tie-break order. Phone-safe (extra column in all three grid widths).
   • B33 Consilium letter (357 pj104Send): dated "after week N", title + first line, so a snapshot never reads as live, and filed
     for that week only (until = the week it is sent) — M1a's "info letters leave mail at the week's end", applied to this letter alone.
   • The Match Week banner's Superbus chip (360 mw105PoChip) only shows in the drawn playoffs and reads w.po104.seeds, the same real seeds
     the column shows then; it needed no change.
   ===================================================================== */
const SD105={on:(()=>{try{return localStorage.getItem('flavius_v105seedoff')!=='1'}catch(e){return true}})()};
if(SD105.on){
/* the seed list the League shows: the real bracket once drawn, else the projection (week 9 on); null before that */
function sd105List(w){try{if(!w||w.dead||w.tutorial||typeof po104Seeds!=='function'||typeof cal104New!=='function'||!cal104New(w))return null;
  const P=po104P(w);if(P&&P.seeds)return P.seeds;return wkOf(w.week)>=V104A.proj?po104Seeds(w):null}catch(e){return null}}
function sd105Cell(m,L){if(m.sica)return `<span class="sd105 no" title="${esc(_T('Sica takes no seed (wildcard only)'))}">—</span>`;
  const s=L.indexOf('m:'+m.id)+1;if(!s)return '<span class="sd105"></span>';
  return `<span class="sd105${s<=4?' rest':''}" title="${esc(s<=4?_T`Seed #${s} · rests in Round 1`:_T`Seed #${s}`)}">${s}</span>`}
{const base=wd100LeagueView;wd100LeagueView=function(){const h=base.apply(this,arguments);
  try{const w=W_(),L=sd105List(w);if(!L||typeof h!=='string')return h;
    const tie=esc(_T('Ties: points, then win rate, then fame'));
    return h.replace('<div class="wd100lgt">','<div class="wd100lgt sd105t">')
      .replace(/(data-wd100h="([^"]+)"[^>]*>\s*<span class="pl">[^<]*<\/span>)/g,(a,b,id)=>{const m=mgrById(id);return m?b+sd105Cell(m,L):b+'<span class="sd105"></span>'})
      .replace('<span>#</span><span></span>',`<span title="${tie}">#</span><span class="sd105h" title="${esc(_T('Superbus seed from week 9 · seeds 1–4 rest in Round 1'))} · ${tie}">${_T('Seed')}</span><span></span>`)
  }catch(e){console.error(e)}return h}}

/* B33: the letter says which week's table it reads and files itself that week */
{const base=sendLetter;sendLetter=function(w,o){try{if(o&&typeof o.key==='string'&&o.key.startsWith('pj104-')&&!o.sd105){const n=Math.max(1,wkOf(w.week)-1);
  o={...o,sd105:1,until:w.week,title:o.title+' '+_T`(after week ${n})`,body:`<p class="rc-sub">${_T`After week ${n}'s games.`}</p>`+(o.body||'')}}}catch(e){console.error(e)}return base.call(this,w,o)}}

{const st=document.createElement('style');st.textContent=`
.wd100lgt.sd105t .wd100rh,.wd100lgt.sd105t .wd100r{grid-template-columns:22px 30px 28px minmax(0,1.5fr) 40px 84px minmax(0,1.2fr) 112px 48px 12px}
@media (max-width:1100px){.wd100lgt.sd105t .wd100rh,.wd100lgt.sd105t .wd100r{grid-template-columns:22px 30px 28px minmax(0,1.5fr) 40px 84px minmax(0,1fr) 108px 12px}}
@media (max-width:760px){.wd100lgt.sd105t .wd100rh,.wd100lgt.sd105t .wd100r{grid-template-columns:18px 26px 24px minmax(0,1fr) 34px 70px 12px}}
.wd100r .sd105{font:600 11px var(--mono);text-align:center;color:#6a4a1a}.wd100r .sd105.no{color:#9a8560}
.wd100r .sd105.rest{color:#3a2208;background:rgba(240,207,125,.7);border-radius:8px;padding:1px 0}
.wd100rh .sd105h{text-align:center;letter-spacing:.04em}`;document.head.appendChild(st)}
}
