/* =====================================================================
   380-V105RUDIS · v1.05 B56 — gladiators ask for the RUDIS only in the OFF-SEASON (his call 2026-10-17)
   =====================================================================
   REPLACES rudis / freedom asks at any week. In-season weeks 1-12 and the Superbus playoff weeks make none.
   rudis105Window(w)  — true while a rudis ask may be made = the off-season week (OFF104.active, 348). THE HOOK: when the
                        Winter festival (v1.07) comes before the off-season, move this one function after the festival.
   Gated paths (all in 17-manager / 28-purses):
     1. leagueFate (17): a 50+ CF "Freedom" fate after a bout of a fighter who has the record (rudisReady). Outside the window it is
        NOT lost: the fighter keeps the earned rudis (g.rudis105 = {s,f}), the bout reads as a survival, and the ask is made when the
        off-season opens (OFF104.on handler below): yours becomes a pending 'rudis' verdict (answered on the off-season page, which
        now lists the pending verdicts), a rival house's fighter decides at once (same odds as before).
     2. purseWeek (28): the "buy their freedom" ask (pend 'buyfree'). purseWeek is masked (freeAsked pinned for the call) and the
        same ask is made in the off-season handler instead (same price/record rule, once per 8 weeks, rivals 50%).
   Left alone: asks already pending in a save stay answerable; Sotonium's third-season rudis (39) and the old-age freedom at season's
   end (17) are events, not requests; the Online release/grant (340) and Play Now.
   Kill switch: localStorage flavius_v105rudisoff=1 (asks at any week again).
   ===================================================================== */
const V105RUDIS_OFF=(()=>{try{return localStorage.getItem('flavius_v105rudisoff')==='1'}catch(e){return false}})();
/* rudis105Window — true when a rudis ask may be made (the off-season). v1.07: move this after the Winter festival. */
function rudis105Window(w){if(V105RUDIS_OFF)return true;try{return !!(typeof OFF104!=='undefined'&&OFF104.active(w))}catch(e){return false}}
if(!V105RUDIS_OFF){
  /* 1. the fate after a bout: a rudis earned in the season waits for the off-season */
  {const base=leagueFate;leagueFate=function(glad,row,mgr,bout,boutIdx,opt){
    try{const w=W_();
      if(w&&!rudis105Window(w)&&glad&&row&&rudisReady(glad)&&!/^Thumbs down · /.test(row.fate||'')){
        const F=fateRow(row.f);
        if(F&&F.g==='Freedom'){const where=LOCATIONS[w.night.loc].n;
          glad.rec.surv++;glad.rudis105={s:w.season,f:row.f};
          ghist(glad,_T`earned the rudis at ${where} (${cfAmt87(row.f)}) — the request waits for the off-season`);
          return {vd:'ludus',fname:_T('Rudis · off-season'),line:_T`${esc(glad.name)} earns the rudis (${cfAmt87(row.f)}) — the request comes in the off-season`}}}
    }catch(e){console.error(e)}
    return base.apply(this,arguments)}}
  /* 2. the purse freedom ask: masked in every week, made in the off-season handler */
  if(typeof purseWeek==='function'){const base=purseWeek;purseWeek=function(world,pm){
    const saved=[];try{for(const x of world.mgrs)for(const g of rosterOf(x)){saved.push([g,g.freeAsked,'freeAsked' in g]);g.freeAsked=world.week}}catch(e){}
    try{return base.apply(this,arguments)}finally{for(const [g,v,had] of saved){if(had)g.freeAsked=v;else delete g.freeAsked}}}}
  /* the off-season opens: the deferred asks are made */
  const ask105=(w)=>{const pm=me();if(!pm)return 0;const where=_T('the off-season');let n=0;
    w.pend=w.pend||[];
    for(const g of w.glads.filter(x=>x.alive&&x.rudis105)){
      const f=g.rudis105.f;delete g.rudis105;
      const m=g.contract?mgrById(g.contract.mgr):null;if(!m||!rudisReady(g))continue;
      if(m.isPlayer){if(!w.pend.some(p=>p.t==='rudis'&&p.gid===g.id)){w.pend.push({t:'rudis',gid:g.id,bi:-1,f});n++;
        tnews(_T`🗡 <b>${esc(g.name)}</b> has earned the <b>rudis</b> and asks for it — your call on the off-season page.`,'big')}}
      else{const takes=!g.sotonium&&(gAge(g)>=28||Math.random()<.35);
        if(takes)freeFighter(g,m,where);else ghist(g,_T`earned the rudis — and chose to fight on`)}}
    for(const x of w.mgrs){if(x.dead)continue;for(const g of rosterOf(x)){
      if(!g.alive||g.lanista||g.starChild||rudisReady(g)||(g.purse||0)<freedomPrice(g)||w.week-(g.freeAsked??-99)<8)continue;
      const price=freedomPrice(g);g.freeAsked=w.week;
      if(x.isPlayer){if(!w.pend.some(p=>p.t==='buyfree'&&p.gid===g.id)){w.pend.push({t:'buyfree',gid:g.id,price,f:0});n++;tnews(_T`👛 <b>${esc(g.name)}</b> asks to buy their freedom for ${coinAmt87(price)} — decide on the off-season page.`,'big')}}
      else if(Math.random()<.5){g.purse-=price;x.coin+=price;ghist(g,_T`bought their freedom from ${x.ludus} for ${coinAmt87(price)}`);g.alive=false;g.freed2=true;g.contract=null;try{libertyEntry(g,x,_T('the Gate of Life'),_T('bought their freedom'))}catch(e){}mnews(_T`👛 <b>${esc(g.name)}</b> buys their freedom from ${esc(x.ludus)} for ${coinAmt87(price)}.`)}
      break}}
    return n};
  window.rudis105Ask=ask105; /* v1.09c (416): the asks are made after the Saturnalia */
  if(typeof OFF104!=='undefined')OFF104.on((w,ctx)=>{if(!rudis105Window(w))return;const n=ask105(w);if(n&&ctx&&ctx.add)ctx.add(_T`${n} freedom ask${n===1?'':'s'} waiting`)});
  /* the off-season page shows the pending verdicts (they block the week's end) */
  {const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);
    try{const w=W_();if(w&&typeof OFF104!=='undefined'&&OFF104.active(w)&&(w.pend||[]).length&&typeof pendingHTML==='function'&&h.indexOf('id="pendbox"')<0)return pendingHTML()+h}catch(e){console.error(e)}
    return h}}
}
