/* =====================================================================
   84-V64 · v0.64 MISSIOS BY THE RULEBOOK, CHARIOT TOKENS
   =====================================================================
   MISSIOS (rulebook p.56): an event counts when the character earns 20+ CF and/or wins (a spared thumb counts too);
   steps that say "Win" must be won. Events where no CF can be earned (Chariot, Familia, Naumachia, Golden Eagle,
   Juggernaut, Gauntlet, Commodus — missioNoCF) pass by surviving to the end, and the Fate table never rolls for the missio
   character there (missioNoFate, read by the results in 10-meta). Elimination ends the character's story: the event stops
   at once (checkEnd wrapper), the Ludus record is marked fallen (markFallen, kept in the Annals — no longer deleted), the
   Royal Reserve is lost, and the results open on "Missio failed". A survivor who misses a step: missio failed, back to the
   rolls. A missio is fought by hand: no "To the end" (07-ui hides it; simToEnd refuses).
   CHARIOTS: on the board a racer rides on their chariot token (chtok.webp, nearest of the six colours to the player's) —
   no loose horse/wheel tokens beside it; the side panel lays the horse and wheel tokens on the chariot card's dashed
   circles; spare horses and wheels on the sand are the printed tokens.
   ===================================================================== */
const missioNoCF=k=>{const E=EVENTS[k];return !!E&&E.rounds.every(r=>!r.cf)};
const missioHero=()=>S&&S.missio?S.players.find(p=>!p.cpu&&p.name===S.missio.name)||S.players.find(p=>p.name===S.missio.name)||S.players[0]:null;
function missioNoFate(p){return !!(S&&S.missio&&p&&p===missioHero()&&missioNoCF(S.evKey))}
/* elimination ends the missio at once */
{const base=checkEnd;checkEnd=function(){if(S&&S.missio&&!S.over&&!S.pending&&S.phase!=='setup'&&!(S.fest&&S.fest.stage===1)){const h=missioHero();
  if(h&&!h.alive){S.pending={over:1,winners:activePlayers().filter(p=>p!==h).length===1?activePlayers().filter(p=>p!==h):[],reason:_T`${h.name} has fallen — the missio is lost.`};S.missioFell=true;return}}
  return base.apply(this,arguments)}}
{const base=simToEnd;simToEnd=async function(){if(S&&S.missio&&!HEADLESS){try{mToast(_T('A missio is fought by hand.'))}catch(e){}return}return base.apply(this,arguments)}}
advanceMissio=async function(rows){
  const recs=await Store.list('missios');const rec=recs.find(r=>r.id===S.missio.id);if(!rec)return null;
  const x=rows.find(x=>!x.p.cpu&&x.p.name===rec.name)||rows.find(x=>x.p.name===rec.name)||rows[0];const p=x.p;
  const st=MISSIOS[rec.cls].path[rec.step];const noCF=missioNoCF(S.evKey);
  const spared=!!(x.fate&&/spared/.test(x.fate[0]));
  const fell=!p.alive||p.retired||S.missioFell;
  const fateDeath=!noCF&&!fell&&!!x.fate&&!aliveInUniverse(x);
  const dead=fell||fateDeath;
  const pass=!dead&&(st.win?x.won:(x.won||(noCF?true:(x.f>=20||spared))));
  rec.events++;rec.trophies+=p.trophies.length;
  rec.history.push({step:rec.step,ev:EVENTS[S.evKey].short,loc:LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:'',cf:x.f,won:x.won});
  const head=(t,c)=>`<div class="missiohd ${c}"><b>${t}</b></div>`;let msg;
  if(pass){
    rec.rr+=p.coin;rec.cfCarry=Math.min(25,Math.floor(x.f/2));rec.severed=['rarm','larm','rleg','lleg'].filter(l=>p.hp[l]<=0&&((rec.severed||[]).includes(l)||!(p.modLoss||[]).includes(l)));rec.step++;
    if(rec.step>=5){const req=MISSIOS[rec.cls].req||{};const ok=(!req.rr||rec.rr>=req.rr)&&(!req.trophies||rec.trophies>=req.trophies);
      rec.status=ok?'complete':'incomplete';
      msg=ok?head(_T('Missio complete'),'ok')+_T`${esc(rec.name)} claims the Missio Spoils: a Rudis, a Laurel Crown, ${rec.rr} coin from the Royal Reserve, freedom, and a hearty “Gratulationes”.`
        :head(_T('Missio incomplete'),'bad')+_T`${esc(rec.name)} finished all five events but missed the requirement (${req.rr?_T`${rec.rr}/${req.rr} coin in RR`:''}${req.trophies?_T`${rec.trophies}/${req.trophies} trophies`:''}).`}
    else msg=head(_T`Step ${rec.step} of 5 complete`,'ok')+_T`${esc(rec.name)} moves on to step ${rec.step+1}, carrying ${rec.cfCarry} CF. Royal Reserve: ${rec.rr} coin.${rec.severed.length?_T` Severed limbs persist: ${rec.severed.map(l=>LOCN[l]).join(', ')}.`:''}`;
  } else if(dead){
    rec.status='fallen';rec.rr=0;
    if(rec.gladId&&p.saved){try{await markFallen(p,x)}catch(e){console.error(e)}}
    msg=head(_T('Missio failed'),'bad')+_T`${esc(rec.name)} ${fell?_T('was eliminated'):_T('did not survive the Fates')} at step ${rec.step+1} of 5. Their story ends here${rec.gladId?_T(' — they are marked fallen in the Ludus'):''}, and the Royal Reserve is lost.`;
  } else {
    rec.status='failed';const why=st.win?_T('this step had to be won'):noCF?_T('they did not make it to the end'):_T`${x.f} CF — 20 were needed, or a win`;
    msg=head(_T('Missio failed'),'bad')+_T`${esc(rec.name)} survives, but the missio ends at step ${rec.step+1} of 5 (${why}). The Royal Reserve is forfeit; ${esc(rec.name)} returns to the rolls.`}
  await Store.put('missios',rec.id,rec);
  if(rec.gladId&&pass){const g=LUDUS_CACHE.find(y=>y.id===rec.gladId);if(g){p.saved=g.id;await saveGladiator(x);x.savedDone=true}}
  return {rec,next:rec.status==='active',msg}};
{const st=document.createElement('style');st.textContent=`.missiohd{font:400 22px var(--display);margin:4px 0 6px}.missiohd.bad b{color:var(--blood2)}.missiohd.ok b{color:var(--gold2)}`;document.head.appendChild(st)}
/* the result card of a missio character with no Fate (a no-CF event) */
{const base=resultCard;resultCard=function(x,place,interim){if(!interim&&x&&!x.fate){const h=base.call(this,x,place,true);return h.replace(/<b>[^<]*<\/b> carried into the next event/,_T`<b>${x.f} CF</b> · missio — no Fate in this event`)}return base.apply(this,arguments)}}
/* ---------- chariots: the racer rides on their chariot token; the spares on the sand are the printed tokens ---------- */
/* chTokFlat — a round token lying on the sand: the sheet cell drawn squashed to the iso floor */
function chTokFlat(art,x,y,w){const im=typeof chTokImg==='function'?chTokImg():null;const i=CHTOK_IDX[art];if(!im||i==null)return false;const cw=im.naturalWidth/5,h=w*0.56;
  ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ell(x+2,y+3,w*0.5,h*0.5);ctx.fill();ctx.drawImage(im,(i%5)*cw,Math.floor(i/5)*cw,cw,cw,x-w/2,y-h/2,w,h);ctx.restore();return true}
function chRideTok(p,m){if(HEADLESS||!p.ch)return false;const art=CHTOK_IDX[p.ch.art]!=null?p.ch.art:'chRed';return chTokFlat(art,m.x,m.y,TW*0.86)}
function chFloorTok(f,m){if(HEADLESS||!f.part)return false;const art=f.kind==='wheel'?f.part.art:(f.part.sides&&f.part.sides[f.part.face||0]||{}).art;return !!art&&chTokFlat(art,m.x,m.y,TW*0.7)}
/* the side panel: the horse and wheel tokens sit on the chariot card's dashed circles (horse by the shaft, wheel over the axle) */
{const st=document.createElement('style');st.textContent=`.chcomp{position:relative;display:inline-block;width:210px;flex:none}
.chcomp>.cimg{width:100%!important;height:auto!important;display:block}.chcomp .chtk{position:absolute;width:29%;transform:translate(-50%,-50%);pointer-events:auto}
.chcomp .chtk .cimg{width:100%!important;height:auto!important;display:block;border-radius:50%}.chcomp .chtk.horse{left:74.5%;top:40%}.chcomp .chtk.wheel{left:31%;top:66%}
.chcomp .chtk.gone{opacity:.25;filter:grayscale(1)}`;document.head.appendChild(st)}
function chCardComp(p){const ch=p.ch;if(!ch||!ch.art)return '';const H=ch.horse,hart=H?(H.sides[H.face]||{}).art||'saxoA':null;
  return `<span class="chcomp">${cardHTML('g:'+ch.art,'sm')}${H?`<span class="chtk horse" data-card="h:${hart}" title="${esc(H.name||'horse')}">${cardHTML('h:'+hart,'xs')}</span>`:''}${ch.wheel?`<span class="chtk wheel" data-card="h:${ch.wheel.art||'wheel8'}" title="${esc(ch.wheel.name||'wheel')}">${cardHTML('h:'+(ch.wheel.art||'wheel8'),'xs')}</span>`:''}</span>`}
{const base=boardHTML;boardHTML=function(player){let h=base.apply(this,arguments);try{if(player&&player.ch&&player.ch.mounted&&player.ch.art){
  const card=cardHTML('g:'+player.ch.art,'xs');const i=h.indexOf('<div class="sect">Chariot</div>');if(i>=0){const j=h.indexOf(card,i);if(j>=0)h=h.slice(0,j)+chCardComp(player)+h.slice(j+card.length)}}}catch(e){}return h}}
