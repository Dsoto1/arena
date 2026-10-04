/* =====================================================================
   18-WORLD · THE EMPIRE BEYOND THE SAND (v0.18)
   =====================================================================
   World events, weather, and the Imperium hub window (formerly "The Stands").

   • worldEvents(key): 5-11 evolving stories across the empire (v0.26: each lives 1-5 weeks) — politics, military, economy, famine,
     geography, plague, trade — generated DETERMINISTICALLY from a key (today's date for regular
     play, the league week in Manager mode) with its own PRNG, so the seeded dice are never touched
     and everyone sees the same empire on the same day.
   • worldImpact(locIdx,key): what those events do to one arena — attendance and crowd mood. The
     host city feels an event at full strength, nearby cities at half. Used by the "Random — the
     empire decides" turnout, crowd moods at the start of an event, and Manager-mode purses.
   • weatherCells(key): storm/rain/heat/fog cells for the map's weather "doppler" layer.
   • imperiumHTML(): the hub — a map with toggleable layers (fans streaming in, weather, world
     events), an empire pulse, the focused arena's day, and the old Stands panels below.
   ===================================================================== */
/* hashStr — FNV-1a hash of a string (32-bit) — seeds the world's own PRNGs, never the dice. */
const hashStr=text=>{let h=2166136261;for(const ch of String(text))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h};
/* worldKey — the key the empire is generated from: the Manager league week during a Manager bout, else the empire calendar week. */
function worldKey(){
  const w=typeof mgrWorldAny==='function'?mgrWorldAny():null;
  if(S&&S.mgrCtx&&w)return `m:${w.id}:${w.season}:${w.week}`;
  // v0.26: outside a career the world runs on the empire calendar too (one week per event played), not the wall clock
  if(typeof calNow==='function'){const c=calNow();return `e:${c.season}:${c.week}`}
  return 'e:1:1';
}
/* WORLD_TYPES — world event types: icon, color and [headline, attendance change, mood change] stories. TWEAK: the effects. */
const WORLD_TYPES={
  politics:{i:'🏛️',c:'#c9a0dc',ev:[['Senate feud spills into the streets',-.05,-8],['An election year: candidates buy the games',.25,8],['A new governor wants to be loved',.18,6],['Proscription lists posted in the forum',-.2,-12]]},
  military:{i:'⚔️',c:'#d24a3a',ev:[['The legions march north',-.18,-4],['Veterans return from the frontier',.15,10],['Barbarian raid on the border towns',-.25,-10],['A triumph through the city gates',.3,14]]},
  economy:{i:'💰',c:'#d6ab4c',ev:[['The grain fleet arrives early',.15,8],['Silver shortage; coin clipped thin',-.1,-6],['Tax riots in the market',-.12,-10],['A merchant prince pays for the games',.28,7]]},
  famine:{i:'🌾',c:'#b08a52',ev:[['Blight in the fields',-.25,-12],['Bread lines at dawn',-.2,-9]]},
  geo:{i:'🌋',c:'#e0843a',ev:[['An earthquake cracks the aqueduct',-.3,-10],['The river floods the lower town',-.25,-8],['Ash falls from the mountain',-.35,-12]]},
  plague:{i:'☠️',c:'#8fae6a',ev:[['Fever in the harbor district',-.35,-10],['Quarantine at the city gates',-.4,-8]]},
  trade:{i:'⛵',c:'#5fc7c0',ev:[['Spice caravans reach the city',.1,6],['Pirates close the sea lanes',-.12,-6],['A new road opens to the provinces',.12,5]]},
};
WORLD_TYPES.volcano={i:'🌋',c:'#ff5a2a',ev:[['Vesuvius grumbles; ash on the wind',-.3,-10],['VESUVIUS ERUPTS',-.6,-22]]};
/* WAR_TRIBES — enemies a war can bring. */
const WAR_TRIBES=['the Marcomanni','the Quadi','Numidian raiders','the Garamantes','Ligurian hill clans','Illyrian pirates'];
/* WAR_LEGIONS — Roman forces that hold the line. */
const WAR_LEGIONS=['Legio II Augusta','Legio X Fretensis','Legio III Gallica','the city garrison','Legio VI Victrix'];
/* WORLD_CACHE — world events cached by key. */
const WORLD_CACHE={};
/* v0.26 THE WORLD EVOLVES: stories are no longer re-rolled each week. Every week (a "tick" on the empire's
   calendar) a few new stories break; each lives 1-5 weeks, building to its peak severity and then easing.
   Everything is deterministic from the key's base + week index, so every screen and every career sees the same
   history without storing it. A war drifts along its front; a plague lingers; a feud blows over. */
/* WORLD_LIFE — how many weeks each type of story lives [min, max]. TWEAK. */
const WORLD_LIFE={politics:[1,3],military:[2,5],economy:[1,3],famine:[3,5],geo:[1,3],plague:[2,4],trade:[1,3]};
/* worldTick — splits a world key into its base and absolute week index T. */
function worldTick(key){const m=/^(.*):(\d+):(\d+)$/.exec(String(key));if(!m)return {base:String(key),T:0};
  const season=+m[2],wk=((+m[3]-1)%12)+1;return {base:m[1],T:(season-1)*12+wk}}
/* worldBorn — the stories that break in week T (2–4, plus a 12% chance Vesuvius stirs), from a PRNG seeded by base + T. TWEAK: the 0.12. */
function worldBorn(base,tick){ // the stories that break in week T
  const R=mulberry32(hashStr('born:'+base+':'+tick));const r=()=>R.next();const pick=a=>a[Math.floor(r()*a.length)];
  const locs=LOCATIONS.map((L,i)=>[L,i]).filter(([L])=>L);const types=Object.keys(WORLD_TYPES).filter(t=>t!=='volcano');
  const n=2+Math.floor(r()*3);const out=[];
  for(let k=0;k<n;k++){const t=pick(types);const T2=WORLD_TYPES[t];const ev=pick(T2.ev);const [L,li]=pick(locs);
    const [lo,hi]=WORLD_LIFE[t]||[1,3];const dur=lo+Math.floor(r()*(hi-lo+1));const peak=1+Math.floor(r()*3);
    const e={id:tick+'.'+k,born:tick,dur,peak,t,i:T2.i,c:T2.c,n:ev[0],att0:ev[1],mood0:ev[2],li,city:L.n,x:L.x,y:L.y};
    if(t==='military')e.war={foe:pick(WAR_TRIBES),rome:pick(WAR_LEGIONS),ang0:Math.floor(r()*628)/100,drift:(r()-.5)*.8};
    out.push(e)}
  if(r()<0.12){const li=LOCATIONS.findIndex(L2=>L2&&L2.n==='Pompeii');const L2=LOCATIONS[li];const big=r()<0.3;const ev=WORLD_TYPES.volcano.ev[big?1:0];
    out.push({id:tick+'.v',born:tick,dur:big?3:2,peak:big?3:2,t:'volcano',i:'🌋',c:'#ff5a2a',n:ev[0],att0:ev[1],mood0:ev[2],li,city:L2.n,x:L2.x+0.024,y:L2.y+0.004,volc:1})}
  return out}
/* worldEvents — every story alive this week (born in the last 5 weeks), with its severity arc, attendance and mood effect and reach; wars drift along their front. */
function worldEvents(key=worldKey()){
  if(WORLD_CACHE[key])return WORLD_CACHE[key];
  const {base,T}=worldTick(key);const out=[];
  for(let b=T-5;b<=T;b++)for(const s of worldBorn(base,b)){const age=T-s.born;if(age>=s.dur)continue;
    // the arc: breaks one notch under its peak, holds, then eases in its final week
    const last=age===s.dur-1&&s.dur>1;const sev=clamp(age===0&&s.dur>2?s.peak-1:last?s.peak-1:s.peak,1,3);
    const tag=s.dur===1?'this week only':age===0?'breaking':last?'easing':`week ${age+1} of ${s.dur}`;
    const e={t:s.t,i:s.i,c:s.c,n:s.n,li:s.li,city:s.city,x:s.x,y:s.y,sev,age,dur:s.dur,tag,sid:s.id,
      att:s.att0*(0.6+sev*0.2),mood:Math.round(s.mood0*(0.6+sev*0.2)),reach:s.volc?(s.peak>=3?0.3:0.16):0.18+sev*0.05};
    if(s.war)e.war={foe:s.war.foe,rome:s.war.rome,ang:s.war.ang0+s.war.drift*age}; // the front line creeps week by week
    out.push(e)}
  return (WORLD_CACHE[key]=out);
}
/* worldImpact — what this week's stories do to one arena: attendance (±0.6) and mood (±25), full strength in the host city, half within reach; severity-3 war/quake/plague/eruption closes the arena. */
function worldImpact(locIdx,key=worldKey()){
  const L=LOCATIONS[locIdx];if(!L)return {att:0,mood:0,list:[]};
  let att=0,mood=0;const list=[];
  for(const e of worldEvents(key)){const d=Math.hypot(e.x-L.x,e.y-L.y);const k=e.li===locIdx?1:d<e.reach?0.5:0;if(!k)continue;
    att+=e.att*k;mood+=e.mood*k;list.push({...e,k})}
  const closed=list.find(e=>e.li===locIdx&&e.sev>=3&&['military','geo','plague','volcano'].includes(e.t))||null;
  return {att:clamp(att,-.6,.6),mood:clamp(Math.round(mood),-25,25),list,closed};
}
/* WX_DESC — weather descriptions for the map tooltips. */
const WX_DESC={storm:'Thunderstorm — lightning and hard rain; crowds thin and augurs get busy.',rain:'Rain — wet sand and damp benches; the regulars still come.',heat:'Heatwave — scorching sun; the awnings (vela) go up and tempers run short.',fog:'Sea fog — a grey blanket off the water; the far stands can barely see the sand.',wind:'Hard wind — dust and snapping awnings; arrows and nets fly strangely.'};
/* WEATHER_T — weather types: name and two colors. */
const WEATHER_T={storm:{n:'Thunderstorm',c:'#e04a3a',c2:'#f0cf7d'},rain:{n:'Rain',c:'#3a7fd0',c2:'#6fd07a'},heat:{n:'Heatwave',c:'#f0843a',c2:'#f0cf7d'},fog:{n:'Sea fog',c:'#b8c0c8',c2:'#e8ecef'},wind:{n:'Hard wind',c:'#8fc3ea',c2:'#e8ecef'}};
/* v0.26 SEASONAL WEATHER THAT MOVES: each week of the calendar is a month of the Roman year. Fronts form with the
   season's weather (summer heat, autumn storms, winter fog and wind, spring rain), live 2-3 weeks and drift east
   on the prevailing wind, so next week's sky is this week's sky, moved on. */
const WX_SEASON=[ // Jan..Dec: weights for storm, rain, heat, fog, wind
  [3,3,0,4,4],[3,4,0,3,4],[2,5,0,2,3],[2,5,1,1,2],[1,3,3,1,1],[1,1,6,0,1],[2,0,8,0,1],[2,0,7,0,1],[4,2,3,1,2],[5,4,0,2,3],[4,4,0,4,3],[3,3,0,5,4]];
/* wxBorn — the weather fronts that form in week T, weighted by the month (WX_SEASON). */
function wxBorn(base,tick){const R=mulberry32(hashStr('wx:'+base+':'+tick));const r=()=>R.next();const types=['storm','rain','heat','fog','wind'];
  const W=WX_SEASON[((tick-1)%12+12)%12];const tot=W.reduce((a,b)=>a+b,0);const pickT=()=>{let x=r()*tot;for(let i=0;i<5;i++)if((x-=W[i])<0)return types[i];return 'rain'};
  return Array.from({length:2+Math.floor(r()*2)},()=>({t:pickT(),x:0.04+r()*0.7,y:0.08+r()*0.84,r:0.06+r()*0.09,vx:0.05+r()*0.09,vy:(r()-.5)*0.06,dur:2+Math.floor(r()*2),born:tick}))}
/* weatherCells — weather fronts alive this week, drifted east by their age; today's rain/heat omen sits over the live arena. */
function weatherCells(key=worldKey()){
  const {base,T}=worldTick(key);const cells=[];
  for(let b=T-2;b<=T;b++)for(const c of wxBorn(base,b)){const age=T-c.born;if(age>=c.dur)continue;const x=c.x+c.vx*age,y=c.y+c.vy*age;
    if(x>0.98||y<0.02||y>0.98)continue;cells.push({t:c.t,x,y,r:c.r*(age===c.dur-1&&age>0?0.8:1),age})}
  // today's omen at the live arena becomes weather right over it
  if(S&&S.omen&&LOCATIONS[S.locIdx]&&(S.omen.k==='rain'||S.omen.k==='heat')){const L=LOCATIONS[S.locIdx];cells.push({t:S.omen.k,x:L.x,y:L.y,r:0.1,here:1})}
  return cells;
}
/* weatherAt — the weather front over an arena this week, if any. */
function weatherAt(locIdx,key){const L=LOCATIONS[locIdx];if(!L)return null;let best=null,bd=9;for(const c of weatherCells(key)){const d=Math.hypot(c.x-L.x,c.y-L.y);if(d<c.r*1.2&&d<bd){bd=d;best=c}}return best}

/* ---------------- the Imperium window ---------------- */
/* HUB — the Imperium window state: map layers, focused city, view. */
const HUB={layers:{fans:1,weather:1,events:1,war:1},focus:null,view:'city'};
/* hubFocus — the city the Imperium window focuses (the chosen one, the live event's, or New event's). */
const hubFocus=()=>HUB.focus??(S&&S.locIdx!=null?S.locIdx:(typeof CFG!=='undefined'&&CFG.loc)||6);
/* gladColorByName — a gladiator's color by name (live seats, the Ludus, the league), gold when unknown. */
function gladColorByName(name){
  const k=String(name||'').toLowerCase();
  if(S&&S.players){const p=S.players.find(p=>p.name.toLowerCase()===k);if(p)return p.color}
  const L=(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).find(g=>String(g.name).toLowerCase()===k);if(L&&CLASSES[L.cls])return CLASSES[L.cls].color;
  const w=typeof mgrWorldAny==='function'?mgrWorldAny():null;const g=w&&w.glads.find(g=>String(g.name).toLowerCase()===k);if(g&&CLASSES[g.cls])return CLASSES[g.cls].color;
  return '#d6ab4c';
}
/* MAP_PX — map fraction (0–1) → map pixels, kept inside the edges. */
const MAP_PX=(x,y)=>[clamp(x,0.02,0.98)*MAPW,clamp(y,0.02,0.98)*MAPH];
/* ---- travel routes: fans follow the ROADS and the SEA LANES, not crow-flight ----
   A small graph over the twelve cities plus named sea waypoints; Dijkstra picks each journey.
   Land legs draw solid (the roads), sea legs dashed with a boat at mid-crossing. */
/* SEA_NODES — sea waypoints on the map for routes by sail. */
const SEA_NODES={tyrrhenum:[.565,.42],fretum:[.665,.53],sinusAfr:[.50,.615],ligusticum:[.30,.31],syrticum:[.735,.78]};
/* ROUTE_EDGES — the road and sea-lane graph between cities: [from, to, land | sea]. */
const ROUTE_EDGES=[ // [from,to,'land'|'sea']
  ['Verona','Pola','land'],['Verona','Roma','land'],['Roma','Capua','land'],['Capua','Pompeii','land'],
  ['Pompeii','Puteoli','land'],['Puteoli','Roma','land'],['Arles','Nemausus','land'],['Arles','Verona','land'],
  ['Uthina','Thysdrus','land'],['Thysdrus','Leptis Magna','land'],
  ['Roma','tyrrhenum','sea'],['Puteoli','tyrrhenum','sea'],['Pompeii','tyrrhenum','sea'],
  ['Nemausus','ligusticum','sea'],['Arles','ligusticum','sea'],['ligusticum','tyrrhenum','sea'],
  ['tyrrhenum','fretum','sea'],['fretum','Syracusae','sea'],['tyrrhenum','sinusAfr','sea'],
  ['sinusAfr','Uthina','sea'],['sinusAfr','Thysdrus','sea'],['fretum','syrticum','sea'],
  ['syrticum','Leptis Magna','sea'],['Syracusae','syrticum','sea'],['Syracusae','sinusAfr','sea'],['Pola','Verona','land']];
/* routeNodes — every route node's map position (cities and sea waypoints). */
function routeNodes(){const nd={};for(const L of LOCATIONS)if(L)nd[L.n]=[L.x,L.y];for(const [k,v] of Object.entries(SEA_NODES))nd[k]=v;return nd}
/* routePath — the shortest road/sea route between two cities (sea legs a little cheaper) → points, leg kinds. */
function routePath(fromCity,toCity){
  const nd=routeNodes();if(!nd[fromCity]||!nd[toCity])return null;
  const adj={};const D=(a,b)=>Math.hypot(nd[a][0]-nd[b][0],nd[a][1]-nd[b][1]);
  for(const [a,b,k] of ROUTE_EDGES){if(!nd[a]||!nd[b])continue;(adj[a]=adj[a]||[]).push([b,k]);(adj[b]=adj[b]||[]).push([a,k])}
  const dist={[fromCity]:0},prev={},seen={};
  for(;;){let u=null,ud=1e9;for(const k in dist)if(!seen[k]&&dist[k]<ud){ud=dist[k];u=k}
    if(u==null||u===toCity)break;seen[u]=1;
    for(const [v,kind] of adj[u]||[]){const w=ud+D(u,v)*(kind==='sea'?0.9:1);if(w<(dist[v]??1e9)){dist[v]=w;prev[v]=[u,kind]}}}
  if(dist[toCity]==null)return null;
  const pts=[];let cur=toCity;const kinds=[];
  while(cur!==fromCity){pts.unshift(cur);const [pv,kind]=prev[cur];kinds.unshift(kind);cur=pv}
  pts.unshift(fromCity);
  return {pts:pts.map(k=>nd[k]),kinds,sea:kinds.includes('sea')};
}
/* routeSVG — SVG of a group of fans traveling from their city to the focused arena (roads solid, sea dashed with a boat). */
function routeSVG(fromCity,count,col,who){
  const F=hubFocus();const FL=LOCATIONS[F];if(!FL)return '';
  const R=routePath(fromCity,FL.n);if(!R)return '';
  const px=R.pts.map(([x,y])=>MAP_PX(x,y));
  const dpts=px.map((p2,i)=>i?`L${p2[0]} ${p2[1]}`:`M${p2[0]} ${p2[1]}`).join('');
  const w2=Math.min(9,1.5+count*1.3);
  let segs='';let boat='';
  for(let i=0;i<R.kinds.length;i++){const a=px[i],b=px[i+1];
    segs+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${w2}" stroke-opacity="${who?.8:.4}" stroke-linecap="round" ${R.kinds[i]==='sea'?'stroke-dasharray="7 9" class="flow"':'class="flowland"'}/>`;
    if(R.kinds[i]==='sea'&&!boat)boat=`<text x="${(a[0]+b[0])/2}" y="${(a[1]+b[1])/2}" font-size="15" text-anchor="middle">⛵</text>`}
  const [sx,sy]=px[0];
  return `<g><title>${count} from ${esc(fromCity)}${who?` · for ${esc(who)}`:' · no allegiance yet'}${R.sea?' · by road and sail':' · by road'}</title>${segs}${boat}<circle cx="${sx}" cy="${sy}" r="${3+Math.min(6,count)}" fill="${col}" fill-opacity=".85"/></g>`;
}
/* imperiumMapSVG — the Imperium map: weather, fans on the roads, world events, the war map and the city markers (closed arenas marked). */
function imperiumMapSVG(key){
  const F=hubFocus();
  let layers='';
  if(HUB.layers.weather){ // stronger cells, no radar: the sky reads at a glance
    layers+=`<g class="wx">${weatherCells(key).map((c,i)=>{const [x,y]=MAP_PX(c.x,c.y);const W=WEATHER_T[c.t];const R2=c.r*MAPW;
      return `<radialGradient id="wg${i}"><stop offset="0" stop-color="${W.c2}" stop-opacity=".8"/><stop offset=".45" stop-color="${W.c}" stop-opacity=".6"/><stop offset="1" stop-color="${W.c}" stop-opacity="0"/></radialGradient><circle class="wxcell" cx="${x}" cy="${y}" r="${R2}" fill="url(#wg${i})"><title>${WX_DESC[c.t]||W.n}${c.here?' (over today\u2019s arena)':''}</title></circle><text class="wxico" x="${x}" y="${y+5}" text-anchor="middle" font-size="16" opacity=".9" style="cursor:help"><title>${WX_DESC[c.t]||W.n}${c.here?' (over today\u2019s arena)':''}</title>${{storm:'⛈',rain:'🌧',heat:'☀️',fog:'🌫',wind:'💨'}[c.t]||''}</text>`}).join('')}</g>`;
  }
  if(HUB.layers.fans){
    const flows={};
    const live=S&&S.spect&&S.spect.length&&S.locIdx===F;
    if(live)for(const sp of S.spect){if(sp.gone||sp.human)continue;const r=CROWD_CACHE.find(x=>x.id===sp.rid);const city=r&&r.city;if(!city)continue;
      const who=sp.fav!=null&&S.players[sp.fav]?S.players[sp.fav].name:'';flows[city+'|'+who]=(flows[city+'|'+who]||0)+1}
    if(!Object.keys(flows).length) // no known home cities in today's crowd (new faces): show the empire's standing allegiances instead
      for(const r of CROWD_CACHE){if(!r.city||r.banned||r.recruited)continue;const who=r.kin?r.kin.name:r.fanOf||r.patronFav||'';const k=r.city+'|'+who;flows[k]=(flows[k]||0)+1}
    layers+=`<g class="fansg">${Object.entries(flows).map(([k,n])=>{const [city,who]=k.split('|');if(LOCATIONS[F]&&city===LOCATIONS[F].n)return '';return routeSVG(city,n,who?gladColorByName(who):'#9a8a78',who)}).join('')}</g>`;
  }
  if(HUB.layers.events){
    layers+=`<g class="wev">${worldEvents(key).filter(e=>e.t!=='military'||!HUB.layers.war).map(e=>{const [x,y]=MAP_PX(e.x,e.y);
      const ox=e.t==='volcano'?0:24,oy=e.t==='volcano'?0:-22; // icons sit up-and-right of their city; the volcano sits on the mountain itself
      return `<g transform="translate(${x+ox} ${y+oy})" style="pointer-events:none"><circle class="wpulse" r="${9+e.sev*3}" fill="none" stroke="${e.c}" stroke-width="2"/><circle r="10" fill="#1c1410" stroke="${e.c}" stroke-width="1.6"/><text y="4.5" text-anchor="middle" font-size="12">${e.i}</text><title>${esc(e.n)} — ${esc(e.city)} (severity ${e.sev}): attendance ${e.att>=0?'+':''}${Math.round(e.att*100)}%, mood ${e.mood>=0?'+':''}${e.mood}${e.sev>=3?' · ARENA CLOSED while it lasts':''}</title></g>`}).join('')}</g>`;
  }
  if(HUB.layers.war){ // the war map: who is pressing, who holds the line
    layers+=`<g class="warg">${worldEvents(key).filter(e=>e.war).map(e=>{const [x,y]=MAP_PX(e.x,e.y);const a=e.war.ang;const dx=Math.cos(a),dy=Math.sin(a);const R2=34+e.sev*10;
      const fx2=x+dx*R2*1.7,fy2=y+dy*R2*1.7,rx=x-dx*R2*1.1,ry=y-dy*R2*1.1;
      const perp=[-dy,dx];const jag=[];const segs=7;
      for(let k=0;k<=segs;k++){const t=(k/segs-0.5)*2;jag.push([x+perp[0]*t*R2*1.4+dx*R2*0.35+(k%2?dx*7:-dx*7),y+perp[1]*t*R2*1.4+dy*R2*0.35+(k%2?dy*7:-dy*7)])}
      const d2=jag.map((p2,k)=>`${k?'L':'M'}${p2[0]} ${p2[1]}`).join('');
      return `<g><title>${esc(e.n)} at ${esc(e.city)}: ${esc(e.war.foe)} press the walls; ${esc(e.war.rome)} hold the line. Severity ${e.sev}${e.sev>=3?' — the arena is CLOSED and the legions are calling men up':''}.</title>
        <path d="${d2}" fill="none" stroke="#d24a3a" stroke-width="3.5" stroke-dasharray="3 4"/>
        <line x1="${fx2}" y1="${fy2}" x2="${x+dx*R2*0.5}" y2="${y+dy*R2*0.5}" stroke="#d24a3a" stroke-width="2.5" marker-end="" opacity=".8"/>
        <g transform="translate(${fx2} ${fy2})"><circle r="13" fill="#3a1512" stroke="#d24a3a" stroke-width="2"/><text y="5" text-anchor="middle" font-size="13">⚑</text><text y="24" text-anchor="middle" font-size="11.5" fill="#f2a497" font-family="IBM Plex Mono">${esc(e.war.foe)}</text></g>
        <g transform="translate(${rx} ${ry})"><circle r="13" fill="#14202e" stroke="#8fc3ea" stroke-width="2"/><text y="5" text-anchor="middle" font-size="13">🦅</text><text y="24" text-anchor="middle" font-size="11.5" fill="#bcd6ea" font-family="IBM Plex Mono">${esc(e.war.rome)}</text></g></g>`}).join('')}</g>`;
  }
  const key2=key;
  const cities=LOCATIONS.map((L,i)=>{if(!L)return '';const [x,y]=MAP_PX(L.x,L.y);const on=i===F;const closed=worldImpact(i,key2).closed;
    return `<g class="city" data-hubloc="${i}" style="cursor:pointer"><title>${esc(L.n)}${closed?' — ARENA CLOSED: '+esc(closed.n):''} — click to focus</title>${on?`<circle cx="${x}" cy="${y}" r="40" fill="none" stroke="#f0cf7d" stroke-width="4"/>`:''}<circle cx="${x}" cy="${y}" r="${on?32:27}" fill="${closed?'#5a2018':on?'#a3281f':'#2a1d13'}" stroke="${closed?'#ff5a44':on?'#f0cf7d':'#d6ab4c'}" stroke-width="2.2"/><text x="${x}" y="${y+1}" fill="#f5e8cc" font-size="${on?26:22}" font-weight="700" font-family="IBM Plex Mono, monospace" text-anchor="middle" dominant-baseline="middle" pointer-events="none">${closed?'🚫':i}</text></g>`}).join('');
  return `<svg viewBox="0 0 ${MAPW} ${MAPH}" class="impmap" role="img" aria-label="Map of the empire"><image href="${typeof assetURL==='function'?assetURL('map.jpg'):'assets/map.jpg'}" width="${MAPW}" height="${MAPH}" opacity=".85"/>${layers}${cities}</svg>`;
}
/* the focused city, as a framed tile worth reading */
/* ---------- the city, up close (v0.20) ---------- */
// small news a city talks about on its own: never moves the gate much, but sets the mood at the taverns
/* small local news a city talks about. */
const LOCAL_NEWS=[['🍞','The bakers’ guild is feuding with the millers again'],['🐟','The fish market smells of a good catch'],['🎭','A troupe of mimes has been thrown out of two taverns'],['💍','A senator’s daughter is to be married on the games’ eve'],['🐎','Someone’s prize horse got loose in the forum'],['🏛','The magistrates have repaved the arena road'],['🍷','The new vintage is in, and the whole town knows it'],['⚖️','A bookmaker was flogged for short odds'],['🔥','A kitchen fire in the potters’ quarter, nobody hurt'],['🎶','A famous lyre player is in town — the gladiators are jealous'],['🛒','Cloth merchants from the south fill the square'],['🐕','A pack of stray dogs has adopted the ushers'],['📜','Graffiti on the ludus wall names next week’s winner'],['🌾','The harvest came in early; the wine flows'],['🧹','The city fathers ordered the stands scrubbed'],['🪙','A hoard of old coin turned up under a tavern floor']];
/* cityNews — 2–4 local news lines for a city this week (seeded by city + key). */
function cityNews(locIdx,key){const R=mulberry32(hashStr('local'+locIdx+key));const n=2+Math.floor(R.next()*3);const out=[];const used=new Set();
  while(out.length<n){const k=Math.floor(R.next()*LOCAL_NEWS.length);if(used.has(k))continue;used.add(k);out.push(LOCAL_NEWS[k])}return out}
/* cityMoodWord — a town mood number in words. */
const cityMoodWord=mood=>mood>=12?'jubilant':mood>=5?'cheerful':mood>-5?'ordinary — bread, gossip, and the games':mood>-12?'sour':'grim';
// what a resident is doing right now — from the day's key and their own habits
/* whereabouts — what a resident is doing right now (in the stands, staying away, at the baths…), seeded by their id + key. */
function whereabouts(reg,key,live){const R=mulberry32(hashStr(reg.id+key));const lore=typeof specLore==='function'?specLore(reg):{snack:'olives',district:'the forum'};
  if(live&&S.spect.some(x=>x.rid===reg.id&&!x.gone))return `in the stands, ${['on their feet','eating '+lore.snack,'arguing with the usher','shouting themselves hoarse','placing a small bet'][Math.floor(R.next()*5)]}`;
  if(reg.quit)return `staying away — ${reg.quit.reason}`;if(reg.banned)return 'barred at the gate, loudly';if(reg.ticket)return 'clutching a ticket for the next games';
  return ['haggling in the market','asleep in the baths','at the tavern, betting on tomorrow','queuing for the grain dole','watching the ludus train from the wall','mending nets by the harbor','at the temple, buying an omen','walking the dog around '+lore.district,'eating '+lore.snack+' by the fountain','telling the story of the last games, again'][Math.floor(R.next()*10)]}
/* localHeroes — the top 5 fighters tied to a city (rating + fans). */
function localHeroes(location){ // top 5 fighters tied to this city: rated best, most beloved
  const w=typeof mgrWorldAny==='function'?mgrWorldAny():null;const fans={};for(const r of CROWD_CACHE){for(const n of [r.fanOf,r.patronFav,r.kin&&r.kin.name])if(n)fans[String(n).toLowerCase()]=(fans[String(n).toLowerCase()]||0)+1}
  const pool=[];
  if(w)for(const g of w.glads.filter(g=>g.alive&&g.city===location.n))pool.push({name:g.name,cls:g.cls,rating:effOvr(g),stars:starsOf(pubOvr(g)),src:g.contract&&w.mgrs.find(m=>m.id===g.contract.mgr)?w.mgrs.find(m=>m.id===g.contract.mgr).ludus:'free sword'});
  for(const g of (typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).filter(g=>gladActive(g)&&(g.history||[]).some(h=>h.loc===location.n)))if(!pool.some(x=>x.name===g.name))pool.push({name:g.name,cls:g.cls,rating:typeof ludusOvr==='function'?ludusOvr(g):50,stars:starsOf(typeof ludusOvr==='function'?ludusOvr(g):50),src:'Ludus Flavius'});
  for(const x of pool)x.fans=fans[x.name.toLowerCase()]||0;
  return pool.sort((a,b)=>(b.rating+b.fans*4)-(a.rating+a.fans*4)).slice(0,5);
}
/* cityTileHTML — the focused city's tile: weather, the city square button, the city today, its arena chronicle, pens, crowd, heroes and residents. */
function cityTileHTML(key){
  const F=hubFocus();const L=LOCATIONS[F];if(!L)return '';
  const imp=worldImpact(F,key);const wx=weatherAt(F,key);const A=typeof arenaOf==='function'?arenaOf(F):null;
  const LC=typeof LOC_CROWD!=='undefined'?LOC_CROWD[F]:null;const live=S&&!S.over&&S.phase!=='setup'&&S.locIdx===F&&S.spect&&S.spect.length; // v0.33: between events the stands read empty here too, exactly like the drawer
  const residents=CROWD_CACHE.filter(r=>r.city===L.n&&!r.recruited);const news=cityNews(F,key);const mood=imp.mood+(live?Math.round(S.spect.reduce((a,x)=>a+x.mood,0)/S.spect.length/4):0);
  const heroes=localHeroes(L);const B=CITY_BEASTS[L.n];
  const notable=live?S.spect.filter(x=>!x.gone&&!x.human).map(sp=>{const r=CROWD_CACHE.find(y=>y.id===sp.rid);
      const tags=[sp.glad?`🗡 fighter for ${esc(sp.glad.ludus)}`:'',r&&r.kin?`👪 ${esc(r.kin.rel)} of ${esc(r.kin.name)}`:'',r&&r.custom?'✦ your creation':'',r&&r.exGlad?'ex-gladiator':'',sp.ticketed||(r&&r.ticketed)?'🎟 ticketed':''].filter(Boolean);
      return tags.length?`<div>${specFaceSVG(sp.look)} <b>${esc(sp.name)}</b> <span class="rc-sub">${tags.join(' · ')}</span></div>`:''}).filter(Boolean):[];
  return `<div class="citytile">
    <div class="ct-head"><span class="ct-num">${F}</span><div><b>${esc(L.n)}${typeof CITY_FLAG!=='undefined'&&CITY_FLAG[L.n]&&typeof flagURIk==='function'?` <img class="flagchip" src="${flagURIk(CITY_FLAG[L.n])}" style="height:15px;vertical-align:-2px" alt="" title="The banner of ${esc(L.n)} — its people rep it in the stands and the square">`:''}</b><div class="rc-sub">${EVENTS[L.ev]?EVENTS[L.ev].n:''} · ${live&&!S.over?'<span class="badge gold">event on the sand</span>':imp.closed?`<span class="badge bad">🚫 ARENA CLOSED — ${esc(imp.closed.n)}</span>`:'the sand rests'}</div></div>
      <span class="ct-wx" title="${wx?WX_DESC[wx.t]||WEATHER_T[wx.t].n:'Fair skies — clear and calm'}">${wx?{storm:'⛈',rain:'🌧',heat:'☀️',fog:'🌫',wind:'💨'}[wx.t]:'☀️'}</span></div>
    <div class="acts" style="margin:6px 0">${(()=>{const why=typeof citySquareGate==='function'?citySquareGate(F):null;return why?`<button class="btn tksm" type="button" disabled title="${esc(why)}">🔒 City square closed to you<small>${esc(why)}</small></button>`:`<button class="btn primary tksm" type="button" data-ct="square" data-li="${F}">🏛 Visit the city square<small>walk it — the crowd, the shops, the auction block</small></button>`})()}</div>
    ${LC?`<p class="rc-sub" style="margin:4px 0">${esc(LC.n)}</p>`:''}
    <div class="ct-row"><span title="Named regulars who call this city home">🏠 ${residents.length}K spectators</span><span title="From world events">🎟 ${imp.att>=0?'+':''}${Math.round(imp.att*100)}% attendance</span><span title="The mood around town">😐 ${esc(cityMoodWord(mood))}</span></div>
    <div class="sect">🏛 The city today</div>
    <div style="font-size:12px;display:grid;gap:2px">${imp.list.map(e=>`<div>${e.i} <b>${esc(e.n)}</b>${e.k<1?' <span class="rc-sub">(felt from '+esc(e.city)+')</span>':''}${e.war?` — <span style="color:#f2a497">${esc(e.war.foe)}</span> vs <span style="color:#bcd6ea">${esc(e.war.rome)}</span>`:''}</div>`).join('')}${news.map(([i,t])=>`<div>${i} ${esc(t)}</div>`).join('')}</div>
    ${typeof standsDrawerHTML==='function'?`<div class="ctchron">${standsDrawerHTML({li:F,chronOnly:1})}</div>`:''}
    <div class="sect">🏟 The stands</div>
    ${A&&(A.events||0)?`<div class="ct-row"><span>${A.events} events held</span><span>✝ ${A.elims||0} fallen</span><span>🍯 ${A.conc||0} concessions</span>${A.spears?`<span>🔱 ${A.spears} speared</span>`:''}${A.brawls?`<span>👊 ${A.brawls} brawls</span>`:''}</div>${A.spearLast?`<p class="rc-sub" style="margin:2px 0 0">Last speared here: <b>${esc(A.spearLast.name)}</b>, by ${esc(A.spearLast.by)}.</p>`:''}`:'<p class="rc-sub" style="margin:2px 0 0">No games on record here yet.</p>'}
    ${B?`<p class="rc-sub" style="margin:4px 0 0">The pens: ${esc(B.Ursa)} &amp; ${esc(B.Brutum)} (bears), ${esc(B.Valencia)} &amp; ${esc(B.Moechus)} (wolves), ${esc(B.Glykon)} &amp; ${esc(B.Arenosus)} (snakes); the lions ${esc(B.Leo)} &amp; ${esc(B.Leaena)}; the champion <b>${esc(B.Commodus)}</b>.</p>`:''}
    ${live?`<div class="sect">In the stands now · ${S.spect.length}K spectators</div>${notable.length?`<div style="font-size:12.5px;display:grid;gap:3px;max-height:120px;overflow:auto">${notable.join('')}</div>`:'<p class="rc-sub" style="margin:0">No kin, creations, ticket-holders or off-duty fighters — just the city.</p>'}${S.famous?`<p style="margin:4px 0 0">👑 <b>${esc(S.famous.n)}</b> — ${esc(S.famous.who)} (${S.famous.eff}).</p>`:''}`:''}
    <div class="sect">🏆 Local heroes</div>${heroes.length?`<div style="font-size:12.5px;display:grid;gap:2px">${heroes.map((h,i)=>`<div>${RN(i+1)}. <b>${esc(h.name)}</b> <span class="stars">${'★'.repeat(h.stars)}</span> <span class="rc-sub">${CLASSES[h.cls]?CLASSES[h.cls].name:h.cls} · ${esc(h.src)} · ${h.fans}K fans</span></div>`).join('')}</div>`:'<p class="rc-sub" style="margin:0">No fighter of note calls this city home yet.</p>'}
    <div class="sect">🏠 Who lives here · what they are up to</div>${residents.length?`<div style="font-size:12px;display:grid;gap:2px;max-height:150px;overflow:auto">${residents.slice(0,20).map(r=>`<div class="sprow" data-spid="${esc(r.id)}" style="padding:2px 0">${specFaceSVG(r.look)}<span><b>${esc(r.name)}</b> <span class="rc-sub">— ${esc(whereabouts(r,key,live))}</span></span></div>`).join('')}</div>`:'<p class="rc-sub" style="margin:0">Nobody named lives here yet — hold games and the neighborhood forms.</p>'}
  </div>`;
}
/* imperiumHTML — the Imperium window: empire strip, layered map, top world stories, family ties, and the city tile or the spectator roster. */
function imperiumHTML(){
  const key=worldKey();const F=hubFocus();const evs=[...worldEvents(key)].sort((a,b)=>(b.sev*10+Math.abs(b.att)*100+Math.abs(b.mood))-(a.sev*10+Math.abs(a.att)*100+Math.abs(a.mood))).slice(0,10);
  const live=S&&S.locIdx===F&&S.spect&&S.spect.length;
  const tog=(k,l)=>`<button type="button" data-hublayer="${k}" class="${HUB.layers[k]?'on':''}">${l}</button>`;
  const dt=typeof calNow==='function'?(()=>{const c=calNow();return empireDate(c.season,c.week)})():null;
  const nReg=CROWD_CACHE.filter(r=>!r.recruited).length;const vt=(k,l)=>`<button type="button" data-hubview="${k}" class="${HUB.view===k?'on':''}">${l}</button>`;
  return `${typeof empireStripHTML==='function'?empireStripHTML():''}<div class="impgrid">
   <div class="impleft"><div class="seg" style="margin-bottom:6px">${tog('fans','👥 Fans & roads')}${tog('weather','🌦 Weather')}${tog('events','📯 World events')}${tog('war','⚔️ War map')}</div>
    ${imperiumMapSVG(key)}
    <p class="rc-sub" style="margin:4px 0 0">Click a city to focus it. Hover the weather for the sky. Fans travel the roads (solid) and the sea lanes (dashed, ⛵), colored by whom they cheer.${live&&S.turnoutWhy?` Today's turnout: ${S.turnoutWhy.join(', ')}.`:''}</p>
    <div class="sect">🌍 The empire today${typeof EMPIRE_FLAG!=='undefined'&&typeof houseFlagURI==='function'?` <img class="flagchip" src="${houseFlagURI(EMPIRE_FLAG)}" style="height:14px;vertical-align:-2px" alt="" title="The empire's one banner — S·P·Q·R, over every city banner, every house banner, every family">`:''} · top 10${dt?` <span class="rc-sub">· 📅 ${esc(dt.short)}</span>`:''}</div>
    <div style="font-size:12.5px;display:grid;gap:3px;max-height:220px;overflow:auto">${evs.map(e=>`<div>${e.i} <b>${esc(e.n)}</b> <span class="rc-sub">· ${esc(e.city)} · severity ${'●'.repeat(e.sev)}${'○'.repeat(3-e.sev)}${e.tag?` · <i>${esc(e.tag)}</i>`:''} · gate ${e.att>=0?'+':''}${Math.round(e.att*100)}%, mood ${e.mood>=0?'+':''}${e.mood}${e.sev>=3?' · <b style="color:var(--blood2)">major</b>':''}</span></div>`).join('')}</div>${typeof familyTiesHTML==='function'?familyTiesHTML():''}</div>
   <div><div class="seg" style="margin-bottom:6px">${vt('city','🏙 '+esc(LOCATIONS[F]?LOCATIONS[F].n:'City'))}${vt('roster',`👥 Spectator roster · ${nReg}`)}</div>
    ${HUB.view==='roster'&&typeof standsRosterViewHTML==='function'?standsRosterViewHTML():cityTileHTML(key)}
   </div></div>`;
}
/* Imperium clicks: view tabs, map layers, focus a city. */
document.addEventListener('click',e=>{
  const hv=e.target.closest('[data-hubview]');if(hv){HUB.view=hv.dataset.hubview;const b=$('#standsHubBody');if(b)b.innerHTML=imperiumHTML();return}
  const lay=e.target.closest('[data-hublayer]');if(lay){HUB.layers[lay.dataset.hublayer]=HUB.layers[lay.dataset.hublayer]?0:1;const b=$('#standsHubBody');if(b)b.innerHTML=imperiumHTML();return}
  const hl=e.target.closest('[data-hubloc]');if(hl&&$('#standsHubBody')){HUB.focus=+hl.dataset.hubloc;HUB.view='city';$('#standsHubBody').innerHTML=imperiumHTML();return}
});
