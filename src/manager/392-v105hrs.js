/* =====================================================================
   392-V105HRS · v1.05 beta-4 B79 + B80 + B81 (his answers T1a T2a H1a H2a H3a, 2026-10-18). Manager only, LAYOUT ONLY: wraps mgrHTML after 388's
   slim banner (.cp105ban — no second banner style) and edits the DOM it built. Kill switch localStorage flavius_v105hrsoff=1 (388's banners,
   the Yard's Tabula + "Last week in the yard", the four old hours styles). Test tv105ad.
   B79  TRAINING YARD: the Tabula ("the week's plan" strip, 373 .y105tab) and "📜 Last week in the yard" (.yd76log) are gone — REPLACES 373's
        bottom strip (B44 / y1a). "↻ Same as last week" (data-y105="same", 373's same handler + disabled rule) moves into the banner beside
        Lock in. Last week's results are not shown in the Yard any more (the week-in-review letter has them).
   B80  WAGERS (MGR.tab 'exch'): the slim 74 px banner — a 💰 medallion, the week's bouts as small chips (day, ★ your fighter, ✓ fought; the full
        line in the chip's title), 95's counter chip if any.
   B81  ONE LOOK FOR REMAINING HOURS. hrs105Chip(left,total,label,state,tip): big "6 of 8 h" + a small label naming whose hours — Training (Yard),
        Recruiter (Recruiting), Medicus (Infirmary). gold = hours left · dim ✓ = all spent · red = overbooked (booked > available). Same size on
        every banner. REPLACES the Yard's .y105hrs plate (373/388), Recruiting's hours .roomstat chip (299/249/388) and the Infirmary's Medicus-hours
        box (.w104hb, 351/354; its wound care / recovery split moves to the chip's data-tip). The Infirmary's Capsarius (.v104cap, same buttons)
        is a small chip beside the hours chip and the Infirmary banner is the 74 px slim banner (H3a).
        The RAIL: one pill (.hp105) "6 h" on Recruiting and the Training Yard — gold while hours are left, dim ✓ once spent (🛣 while Recruiting is
        locked on the road). REPLACES the green hr99 oval (272) and the grey c73 oval (95) on those two tabs (hidden by CSS; the sweeps still run).
        Other rail badges (mail, ⚕ fighters needing care, ✓ ticks) are untouched. Numbers come from the old sources: thLeft/thMax (Yard),
        rec99Left/rec98HrsMax (Recruiting), mh101Left/mh101Max (Infirmary).
   ===================================================================== */
function hrs105On(){try{return localStorage.getItem('flavius_v105hrsoff')!=='1'}catch(e){return true}}
/* one chip for every banner: state 'on' (gold) · 'done' (all spent, dim ✓) · 'over' (red) */
function hrs105State(left,over){return over?'over':left>0?'on':'done'}
function hrs105Chip(left,total,label,state,tip){
  return `<div class="hc105 hc105-${state}"${tip?` data-tip="${esc(tip)}"`:''} tabindex="0"><span class="hc105n">${state==='done'?'✓ ':''}${left}<small> ${_T`of ${total} h`}</small></span><span class="hc105l">${esc(label)}</span></div>`}
/* the numbers: the same sources the old displays used */
function hrs105Src(tab,w,pm){
  if(tab==='practice'){const mx=thMax(),away=typeof yd90Away==='function'&&yd90Away(w);let over=false;try{over=!away&&mx-thUsed(w)<0}catch(e){}
    return {left:thLeft(w),total:mx,label:_T('Training'),over,tip:_T('Training hours left this week')}}
  if(tab==='recruit'){const mx=rec98HrsMax(w);let over=false;try{over=mx-rec98Used(w)<0}catch(e){}return {left:rec99Left(w),total:mx,label:_T('Recruiter'),over,tip:''}}
  if(tab==='infirm'){const mx=mh101Max(pm,w);let over=false;try{const r=mh101Rec(w,pm);over=mx-(r?r.u:0)<0}catch(e){}return {left:mh101Left(w,pm),total:mx,label:_T('Medicus'),over,tip:_T('Medicus hours left this week — every treatment takes some')}}
  return null}
function hrs105Make(html){const d=document.createElement('div');d.innerHTML=html;return d.firstElementChild}
function hrs105Ban(R,tab,w,pm){
  const hd=R.querySelector('#mgrPane .roomhd, .railmain>.roomhd');if(!hd)return false;
  if(tab==='practice'){
    const hrs=hd.querySelector(':scope>.y105hrs');const S=hrs105Src(tab,w,pm);
    if(hrs){hrs.replaceWith(hrs105Make(hrs105Chip(S.left,S.total,S.label,hrs105State(S.left,S.over),S.tip)))}
    /* B79 + T1a: Same as last week beside Lock in; the Tabula and last week's log are dropped (T2a) */
    const same=R.querySelector('#mgrPane .y105tab [data-y105="same"]'),lk=hd.querySelector(':scope>.y105lock');
    if(same&&lk){same.classList.add('y105sameb');lk.before(same)}
    for(const x of R.querySelectorAll('#mgrPane .y105tab, #mgrPane .yd76log'))x.remove();
    return true}
  if(tab==='recruit'){
    const st=hd.querySelector(':scope>.roomstat');if(!st)return false;const S=hrs105Src(tab,w,pm);
    st.replaceWith(hrs105Make(hrs105Chip(S.left,S.total,S.label,hrs105State(S.left,S.over),st.dataset.tip||'')));return true}
  if(tab==='infirm'){
    if(!hd.classList.contains('w104ban')||typeof cp105Ban!=='function')return false;
    if(!cp105Ban(R,'infirm'))return false;
    const S=hrs105Src(tab,w,pm),bar=hd.querySelector(':scope>.w104hb');
    let tip=S.tip;if(bar){const lg=[...bar.querySelectorAll('.w104hbl>span')].map(x=>x.textContent.trim()).filter(Boolean).join(' · ');if(lg)tip=lg+' — '+S.tip}
    const chip=hrs105Make(hrs105Chip(S.left,S.total,S.label,hrs105State(S.left,S.over),tip));
    if(bar)bar.replaceWith(chip);else hd.appendChild(chip);
    const cap=hd.querySelector(':scope>.v104cap'),bp=hd.querySelector(':scope>.bp104c');
    if(cap){cap.classList.add('cp105cap');chip.before(cap)}
    if(bp)(cap||chip).before(bp);
    return true}
  if(tab==='exch'){
    if(typeof cp105Ban!=='function'||!cp105Ban(R,'exch'))return false;
    if(!hd.querySelector('.rm100rd'))hd.insertAdjacentHTML('afterbegin','<span class="rm100rd rm100adv cp105md" aria-hidden="true">💰</span>');
    const tb=hd.querySelector('.roomttl b'),tx=tb&&tb.firstChild;if(tx&&tx.nodeType===3)tx.nodeValue=tx.nodeValue.replace(/^\s*\u{1F4B0}️?\s*/u,'');
    /* the week's bouts as small chips: day · ★ your fighter · ✓ fought (the full line stays in the title) */
    for(const c of hd.querySelectorAll('.b73wk .wkb')){const b=c.querySelector('b'),mine=!!c.querySelector('i'),done=c.classList.contains('done');
      c.innerHTML=`<b>${b?b.innerHTML.replace('★','✦'):''}</b>${mine?' <i>★</i>':''}${done?' ✓':''}`}
    const wk=hd.querySelector('.b73wk');if(wk)hd.querySelector('.roomttl').after(wk);
    return true}
  return false}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{
  if(!hrs105On()||typeof cp105On!=='function'||!cp105On()||typeof h!=='string'||MGR.view)return h;
  const tab=MGR.tab;if(tab!=='practice'&&tab!=='recruit'&&tab!=='infirm'&&tab!=='exch')return h;if(h.indexOf('roomhd')<0)return h;
  const w=W_(),pm=me();if(!w||w.dead||!pm)return h;if(tab==='practice'&&!(typeof y105Live==='function'&&y105Live()))return h;
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;
  if(!hrs105Ban(R,tab,w,pm))return h;
  const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- the rail pill: "6 h" gold while hours are left, dim ✓ once spent ---------- */
function hp105Sync(){try{
  if(!hrs105On()){document.body.classList.remove('hp105on');for(const c of document.querySelectorAll('.mtabs .hp105'))c.remove();return}
  const w=typeof W_==='function'?W_():null;if(!w||w.dead||typeof me!=='function'||!me()){for(const c of document.querySelectorAll('.mtabs .hp105'))c.remove();return}
  document.body.classList.add('hp105on');
  for(const k of ['recruit','practice']){const b=document.querySelector(`.mtabs [data-mg="tab"][data-id="${k}"]`);if(!b)continue;let c=b.querySelector('.hp105');
    let left=0,tx,tt,cls;
    if(k==='recruit'){if(w.tutorial){if(c)c.remove();continue}left=rec99Left(w);tt=_T`${left} of the Recruiter's hours left this week`}
    else{left=thLeft(w);tt=_T`${left} training hours left this week`}
    cls=left>0?'hp105 gold':'hp105 done';tx=left>0?left+' h':'✓';
    if(k==='recruit'&&typeof mw105RecLocked==='function'&&mw105RecLocked(w)){cls='hp105 done';tx='🛣';try{tt=mw105RecWhy(w).replace(/<[^>]+>/g,'')}catch(e){}}
    if(left<=0&&tx==='✓')tt=k==='recruit'?_T('All the Recruiter\'s hours are spent'):_T('All training hours are spent');
    if(!c){c=document.createElement('span');b.appendChild(c)}
    if(c.className!==cls)c.className=cls;if(c.textContent!==tx)c.textContent=tx;if(c.title!==tt)c.title=tt}}catch(e){}}
if(typeof hr99Sync==='function'){const base=hr99Sync;hr99Sync=function(){const r=base.apply(this,arguments);hp105Sync();return r}}
setInterval(hp105Sync,600);
try{if(typeof MM101_OWN!=='undefined')MM101_OWN.push('hp105')}catch(e){}

/* ---------- the look ---------- */
(()=>{if(typeof document==='undefined'||document.getElementById('hrs105css'))return;const st=document.createElement('style');st.id='hrs105css';st.textContent=`
.hc105{position:relative;z-index:2;flex:none;display:grid;justify-items:end;align-content:center;gap:0;min-width:92px;max-height:52px;box-sizing:border-box;padding:4px 12px;border:1px solid #c9a458;border-radius:6px;background:#1a120de0;text-align:right;cursor:default}
.hc105 .hc105n{font:400 21px/1.1 var(--display,serif);color:#f0cf7d;white-space:nowrap}
.hc105 .hc105n small{font:400 13px var(--display,serif);color:#c9a44a}
.hc105 .hc105l{font:11px var(--mono,monospace);color:#cbb593;white-space:nowrap}
.hc105.hc105-done{border-color:#6b5a3e;opacity:.72}.hc105.hc105-done .hc105n,.hc105.hc105-done .hc105n small{color:#b8a27c}
.hc105.hc105-over{border-color:#c0433a}.hc105.hc105-over .hc105n,.hc105.hc105-over .hc105n small{color:#ffb0a0}
#mgrBody .roomhd.cp105ban>.y105sameb{position:relative;z-index:2;flex:none;min-height:44px;max-height:52px;padding:0 14px;border-radius:8px;font-size:15px;white-space:nowrap}
#mgrBody .roomhd.cp105ban .b73wk{position:relative;inset:auto;top:auto;left:auto;right:auto;flex:0 1 auto;display:flex;flex-wrap:nowrap;justify-content:flex-end;gap:6px;padding:0;margin-left:auto}
#mgrBody .roomhd.cp105ban .b73wk .wkb{padding:2px 9px;font-size:12px;white-space:nowrap}
#mgrBody .roomhd.cp105ban .cp105cap{position:relative;z-index:2;flex:none;display:flex;align-items:center;gap:6px;max-height:52px;box-sizing:border-box;padding:3px 8px;border:1px solid #6b5236;border-radius:6px;background:#1a120de0;margin:0}
#mgrBody .roomhd.cp105ban .cp105cap .v104cf{width:34px;height:34px;flex:none}#mgrBody .roomhd.cp105ban .cp105cap .v104cf svg{width:100%;height:100%}
#mgrBody .roomhd.cp105ban .cp105cap .v104ci{display:grid;gap:0;min-width:0}#mgrBody .roomhd.cp105ban .cp105cap .v104ci b{font-size:12px;line-height:1.2;white-space:nowrap}
#mgrBody .roomhd.cp105ban .cp105cap .v104cs,#mgrBody .roomhd.cp105ban .cp105cap .v104cw{font-size:11px;line-height:1.2;white-space:nowrap}
#mgrBody .roomhd.cp105ban .cp105cap .btn{min-height:26px;padding:1px 8px;font-size:12px}
#mgrBody .roomhd.cp105ban>.w104bx{position:relative;z-index:2;flex:none;margin:0}
#mgrBody .roomhd.w104ban.cp105ban{height:auto!important;min-height:74px!important;flex-wrap:wrap!important}
.mtabs button .hp105{float:right;margin-left:6px;font:600 11px var(--mono,monospace);line-height:1.5;border-radius:999px;padding:0 6px;border:1px solid #d9a441;background:#d9a441;color:#2a1a08}
.mtabs button .hp105.done{background:transparent;border-color:var(--line2,#5a4325);color:var(--muted,#b8a27c);opacity:.8}
body.hp105on .mtabs [data-id="recruit"] .mcount.hr99,body.hp105on .mtabs [data-id="recruit"] .mcount.c73,body.hp105on .mtabs [data-id="practice"] .mcount.c73,body.hp105on .mtabs [data-id="practice"] .hrchip{display:none!important}
@media (max-width:760px){#mgrBody .roomhd.cp105ban>.y105sameb{flex:1 1 110px;min-height:42px;font-size:14px}
  #mgrBody .roomhd.cp105ban .b73wk{flex:1 1 100%;order:5;justify-content:flex-start;margin-left:0;flex-wrap:wrap}
  #mgrBody .roomhd.cp105ban .hc105{flex:none;padding:3px 10px;margin-left:auto;min-width:0}#mgrBody .roomhd.cp105ban .y105hrs+.y105lock{margin-left:0}
  #mgrBody .roomhd.cp105ban .cp105cap{flex:1 1 auto}}
@media (max-width:600px){#mgrBody .roomhd.cp105ban>.y105sameb{font-size:13px;padding:0 8px;flex:1 1 100px}#mgrBody .roomhd.cp105ban>.y105lock{flex:1 1 100px}#mgrBody .roomhd.cp105ban .hc105 .hc105n{font-size:18px}#mgrBody .roomhd.cp105ban .hc105 .hc105l{font-size:10px}#mgrBody .roomhd.cp105ban.cp105one .hc105{order:1}}
`;document.head.appendChild(st)})();
