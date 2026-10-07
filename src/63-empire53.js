/* =====================================================================
   63-EMPIRE53 · THE EMPIRE DECIDES WHERE THE GAMES ARE (v0.53)
   =====================================================================
   When a week is set up (right after the last one ends), the empire's news is read for the host city.
   If a war, plague, quake or eruption has shut its arena, the games move to the NEAREST open arena
   (by the Imperium map). Only if no arena can host does the league take an impromptu bye — at most once
   a season; after that the games go to the least troubled city regardless.
   Match Week shows a notice for a moved week; the Acta carries the story.
   ===================================================================== */
/* nearestOpenCity(from, weekKey) → city index, or -1 for the season's impromptu bye */
function nearestOpenCity(from,wkey){const L0=LOCATIONS[from];const w=W_();
  const open=LOCATIONS.map((L,i)=>i).filter(i=>i>0&&i!==from&&LOCATIONS[i]&&!worldImpact(i,wkey).closed);
  if(open.length)return open.sort((a,b)=>Math.hypot(LOCATIONS[a].x-L0.x,LOCATIONS[a].y-L0.y)-Math.hypot(LOCATIONS[b].x-L0.x,LOCATIONS[b].y-L0.y))[0];
  if(w&&w.closedByeSeason!==w.season&&!w.tutorial)return -1;
  /* the bye is spent: the least-affected city hosts anyway (TWEAK) */
  return LOCATIONS.map((L,i)=>i).filter(i=>i>0&&i!==from&&LOCATIONS[i]).sort((a,b)=>(worldImpact(a,wkey).att||0)>(worldImpact(b,wkey).att||0)?-1:1)[0]||6}
/* an impromptu bye is a bye week in every way (59-bye), with its reason on the page */
{const baseMake=makeNight;makeNight=function(){const r=baseMake.apply(this,arguments);try{const w=W_();
  if(w&&w.closedBye&&w.closedBye.week===w.week&&w.night&&!w.night.bye){w.closedByeSeason=w.season;const why=w.closedBye.why;const from=LOCATIONS[w.closedBye.from]?LOCATIONS[w.closedBye.from].n:_T('the host city');
    byeSetup(w);w.night.imposed={from,why};mnews(_T`<b>No arena in the empire can host this week</b> — ${esc(from)} is shut (${esc(why)}). The editor calls an impromptu bye.`,'bad');tnews(_T`🌋 Impromptu bye: ${esc(from)} is shut (${esc(why)}) and no arena can take the games.`,'big')}
  if(w&&w.moved&&w.moved.week===w.week&&w.night){w.night.moved={...w.moved};tnews(_T`🛣 This week’s games move from <b>${esc(LOCATIONS[w.moved.from].n)}</b> (${esc(w.moved.why)}) to <b>${esc(LOCATIONS[w.moved.to].n)}</b>, the nearest open arena.`,'big')}}catch(e){console.error(e)}return r}}
{const baseNight=nightHTML;nightHTML=function(){let h=baseNight.apply(this,arguments);try{const w=W_(),n=w&&w.night;
  if(n&&n.moved&&!n.bye)h=`<div class="card2 movedcard" style="border-color:var(--blood2)">${_T`🛣 <b>The games moved.</b> ${esc(LOCATIONS[n.moved.from].n)} is shut (${esc(n.moved.why)}); the nearest open arena, <b>${esc(LOCATIONS[n.moved.to].n)}</b>, hosts this week.`}</div>`+h;
  if(n&&n.imposed)h=h.replace('<h4 style="margin-top:0">'+TXPRE('🌿 Bye week · week {0} of season {1}'),m0=>`<p class="rc-sub" style="margin:0 0 6px">${_T`🌋 Impromptu bye: ${esc(n.imposed.from)} is shut (${esc(n.imposed.why)}) and no arena can take the games.`}</p>`+m0)}catch(e){}return h}}
