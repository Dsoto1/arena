/* v1.04 beta-2 fixes B29 B34 B35 (358-v104fixp) · kill switch localStorage flavius_v104poff=1 · test tv104k
   B29  Play Now's top-right action row: 🎲 Random event · Begin Event · 🏛 Home read as one tight row — the 🎲 gets the sandstone tile of 🏛
        (306/300's #mClose look), the same height as Begin Event (46 px; phones keep 300's 50 px row), and Begin Event sits 10 px from Home
        (247's .pn-top margin-right: 40 px pulled it away) — the same 10 px as the 🎲↔Begin gap.
   B34  The bracket buttons (Match Week banner weeks 9–11 .po104bb, the League banner's 🏛 Superbus .v104slb) take the regal look of the
        popup they open: gold on crimson (345's .sb103c Superbus card), a laurel each side and the Superbus Cup icon.
   B35  Match Week during the playoffs: (a) the tree card is a block (title + legend above, the tree under, full width; 355's .v104top sat
        in a flex row, so the tree was pushed right and its Champion column was cut); the seven columns are spread evenly, a narrow
        screen scrolls inside .v104sx; (b) bout titles are one line, "Bout A · seeds 5·8·9·12" (the title text itself is in 355's
        sb104Tree; here it never wraps); (c) the banner's day tabs (data-bt85) of playoff bouts read "Round 1 / Bout A", "Round 1 / Bout B",
        "Superbus / Semifinal I", "Superbus / The Final" instead of two chips both called "Superbus". (d, the Your stake row) is v1.05. */
{const V104P={off:(()=>{try{return localStorage.getItem('flavius_v104poff')==='1'}catch(e){return false}})()};window.V104P=V104P;
if(!V104P.off){
const ABp=i=>i?'B':'A',SIp=i=>i?'II':'I';
/* the playoff tabs of the Match Week banner + the regal bracket buttons */
function v104pPost(h){const w=W_();if(!w||w.dead||MGR.view||typeof h!=='string')return h;
  const hasTab=h.indexOf('data-bt85')>=0&&h.indexOf('b73-night')>=0,hasBtn=h.indexOf('po104bb')>=0||h.indexOf('data-v104s="sb"')>=0;if(!hasTab&&!hasBtn)return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;let ch=false;
  if(hasTab&&w.night&&w.night.bouts)for(const el of R.querySelectorAll('.roomhd.b73-night [data-bt85]')){const b=w.night.bouts[+el.dataset.bt85];const p=b&&b.po104;if(!p)continue;
    const d=p.r==='r1'?_T('Round 1'):_T('Superbus');const n=p.r==='r1'?_T`Bout ${ABp(p.i)}`:p.r==='sf'?_T`Semifinal ${SIp(p.i)}`:_T('The Final');
    const de=el.querySelector('.bt85d'),be=el.querySelector('b');if(de)de.textContent=d;if(be)be.textContent=n;el.title=d+' · '+n;el.classList.add('v104pt');el.removeAttribute('data-en84');ch=true}
  if(hasBtn){const lau=typeof lau103==='function'?lau103:()=>'';const cup=typeof trophySVG==='function'?trophySVG((typeof trophyDef==='function'&&trophyDef('palm_roma'))||{},22):'';
    for(const x of R.querySelectorAll('.roomhd .po104bb,.roomhd .v104slb[data-v104s="sb"]')){if(x.classList.contains('v104rg'))continue;const lbl=x.classList.contains('v104slb')?_T('Superbus'):_T('Bracket');
      x.classList.add('v104rg');x.setAttribute('aria-label',_T('The Superbus bracket'));x.innerHTML=`${lau(false)}<span class="v104cup">${cup}</span><b>${esc(lbl)}</b>${lau(true)}`;ch=true}}
  return ch?t.innerHTML:h}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{return v104pPost(h)}catch(e){console.error(e)}return h}}
{const st=document.createElement('style');st.textContent=`
/* B29 */
.pn100 .pn98go .pn98dice.pn98dice{border:0;border-radius:9px;color:#4a2e14;background:radial-gradient(circle at 40% 35%,#e3cb9f,#b08a58 70%);box-shadow:inset 0 1px 0 rgba(255,244,214,.8),inset 0 -2px 0 rgba(80,52,24,.6),0 2px 0 #5a4024,0 4px 8px rgba(0,0,0,.5)}
.pn100 .pn98go .pn98dice.pn98dice:hover,.pn100 .pn98go .pn98dice.pn98dice:focus-visible{background:radial-gradient(circle at 40% 35%,#f0dbb2,#c19a63 70%);box-shadow:inset 0 1px 0 rgba(255,244,214,.9),inset 0 -2px 0 rgba(80,52,24,.6),0 2px 0 #5a4024,0 4px 8px rgba(0,0,0,.5),0 0 0 2px #fff2be}
@media (min-width:601px){.pn100 .pn98go .pn98dice.pn98dice{width:46px;height:46px}.pn100 .pn98go{gap:10px}.pn98 .pn-top{margin-right:8px!important}.mbox:has(.pn100) > #mClose.menu101{z-index:9!important}}
@media (min-width:601px) and (max-width:760px){.pn98 .pn-top{margin-right:-2px!important}}
/* B34 */
.po104bb.v104rg,.v104slb.v104rg{display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 6px;border:1px solid #d6ab4c!important;border-radius:9px!important;background:linear-gradient(160deg,#5b1b47,#3b1030 55%,#2a0c22)!important;color:#f0cf7d!important;box-shadow:0 0 0 2px #1a0a15,0 0 0 3px #8a6a2c,0 3px 8px rgba(0,0,0,.45);font:400 14px var(--display,serif);letter-spacing:.08em;text-shadow:0 1px 0 #1a0a15;cursor:pointer;white-space:nowrap;vertical-align:middle}
.roomhd .v104rg{align-self:flex-start;width:max-content;max-width:100%}.roomhd .v104rg b,.v104rg b{font:400 14px/1.2 var(--display,serif)!important;letter-spacing:.08em;color:#f6dc98!important;margin:0;padding:0;text-shadow:0 1px 0 #1a0a15}.roomhd .v104rg svg,.roomhd .v104rg span{position:static!important;display:inline-flex!important;opacity:1!important;margin:0!important;transform:none;filter:none!important;font-size:0;overflow:visible}.roomhd .v104rg .lau{width:16px!important;height:16px!important;flex:none}.roomhd .v104rg .lau[style]{transform:scaleX(-1)}.roomhd .v104rg .v104cup{width:22px;height:22px;flex:none}.roomhd .v104rg .v104cup svg{width:22px!important;height:22px!important}
.v104rg:hover,.v104rg:focus-visible{background:linear-gradient(160deg,#6d2456,#4a1639 55%,#33102a)!important;box-shadow:0 0 0 2px #1a0a15,0 0 0 3px #d6ab4c,0 3px 10px rgba(0,0,0,.5)}
/* B35 */
.card2.v104sbr.v104top{display:block}
.v104top .v104sx,.v104slg .v104sx{width:100%}
.v104g{grid-template-columns:minmax(170px,1fr) 28px minmax(170px,1fr) 28px minmax(170px,1fr) 28px minmax(140px,1fr);min-width:780px}
.v104bt{white-space:nowrap}
.roomstat.bt85w .bt85.bt85{flex:0 0 auto}@media (max-width:600px){.roomstat.bt85w .bt85.v104pt>b{display:block!important}.roomstat.bt85w .bt85.v104pt>.bt85d{display:none}}
.roomstat.bt85w .bt85.bt85{flex:0 0 auto}.roomstat.bt85w .bt85.bt85>span,.roomstat.bt85w .bt85.bt85>b{max-width:none;overflow:visible;text-overflow:clip}
`;document.head.appendChild(st)}
}}
