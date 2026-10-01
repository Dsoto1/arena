/* =====================================================================
   19-CALENDAR · THE EMPIRE'S DATE AND THE SEASON SCHEDULE (v0.20)
   =====================================================================
   One calendar for the whole app. A season is 12 weeks; each week the editor's games are held
   at ONE arena on ONE event. The schedule is drawn for the season (classic eliminations far
   outnumber the risky specials, which carry bigger purses), it is the same for everyone who opens
   the page, and every mode locks into it:
     • Manager mode: match night is the week's fixture (city + event).
     • New event: the setup opens on the current fixture; the player may still go off-schedule.
     • Imperium / Menagerie / status bar: show the date, e.g. "Ante diem VI Kalendas Maias, season II".
   Manager careers advance the calendar as their weeks end; outside a career, every event played moves it on
   one week (v0.22). The world's stories and weather (18-world) evolve on the same weekly tick (v0.26).
   ===================================================================== */
const CAL_KEY='flavius_calendar';
const ROMAN_MONTHS=['Ianuarius','Februarius','Martius','Aprilis','Maius','Iunius','Iulius','Augustus','September','October','November','December'];
const RN=n=>{const t=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [v,r] of t)while(n>=v){s+=r;n-=v}return s||'—'};
// weight of each event kind on the schedule: classics dominate; specials are rare and pay more
const SCHED_WEIGHTS=[['democritus',22],['egidious',16],['cassian',14],['familia',5],['goldenEagle',4],['juggernaut',3],['orpheus',3],['triumviratus',3],['ludus',2],['chariot',2],['naumachia',1],['commodus',2]];
const SCHED_PURSE={democritus:1,egidious:0.9,cassian:1.15,familia:1.5,goldenEagle:1.6,juggernaut:1.7,orpheus:1.5,triumviratus:1.4,ludus:1.4,chariot:1.8,naumachia:2,commodus:1.7};
let CAL=null;
function calLoad(){if(CAL)return CAL;try{CAL=JSON.parse(localStorage.getItem(CAL_KEY)||'null')}catch(e){CAL=null}
  if(!CAL){CAL={season:1,week:1,epoch:new Date().toISOString().slice(0,10),sched:{}};calSave()}
  // the empire keeps moving while nobody plays: a real day is a week of games
  CAL.frozen=1; // v0.22: the calendar moves by play — one week per event played (and per Manager week), not by the wall clock
  if(!CAL.frozen){const days=Math.floor((Date.now()-new Date(CAL.epoch).getTime())/864e5);const total=(CAL.season-1)*12+(CAL.week-1);
    if(days>total){const t=days;CAL.season=Math.floor(t/12)+1;CAL.week=t%12+1;calSave()}}
  return CAL}
function calSave(){try{localStorage.setItem(CAL_KEY,JSON.stringify(CAL))}catch(e){}}
// deterministic schedule for a season: 12 fixtures {loc,ev,purse}, from the season number alone
function seasonSchedule(season){
  const C=calLoad();if(C.sched[season])return C.sched[season];
  const R=mulberry32(hashStr('sched'+season));const r=()=>R.next();
  const locs=LOCATIONS.map((L,i)=>L?i:null).filter(x=>x);const order=[...locs].sort(()=>r()-.5);
  const total=SCHED_WEIGHTS.reduce((a,[,w])=>a+w,0);
  const isCl=ev=>/democritus|egidious|cassian/.test(ev);const fx=[];
  order.slice(0,12).forEach((loc,i)=>{
    let ev='democritus';if(i===11)ev='cassian'; // the season's last regular week is always a Cassian classic
    else{let x=r()*total;for(const [k,w] of SCHED_WEIGHTS){if((x-=w)<0){ev=k;break}}}
    if(!isCl(ev)&&i>0&&!isCl(fx[i-1].ev))ev='democritus'; // never two specials back to back
    fx.push({wk:i+1,loc,ev,purse:SCHED_PURSE[ev]||1})});
  C.sched[season]=fx;calSave();return fx;
}
const fixtureFor=(season,week)=>seasonSchedule(season)[((week-1)%12+12)%12];
function calNow(){const C=calLoad();return {season:C.season,week:C.week,fx:fixtureFor(C.season,C.week)}}
// "a.d. VI Kal. Mai." — the Roman way of naming a day, from season and week
function empireDate(season,week){
  const dayOfYear=((week-1)*30+((season-1)*7)%30)%360;const m=Math.floor(dayOfYear/30),d=dayOfYear%30+1;
  const month=ROMAN_MONTHS[m];const nextMonth=ROMAN_MONTHS[(m+1)%12];
  let s;if(d===1)s=`Kalendae ${month}`;else if(d===5)s=`Nonae ${month}`;else if(d===13)s=`Idus ${month}`;
  else if(d<5)s=`a.d. ${RN(6-d)} Non. ${month}`;else if(d<13)s=`a.d. ${RN(14-d)} Id. ${month}`;else s=`a.d. ${RN(32-d)} Kal. ${nextMonth}`;
  // v0.21: plain English for everyday reading; the Roman form survives in tooltips
  const EN=['January','February','March','April','May','June','July','August','September','October','November','December'][m];
  return {short:`${EN} ${d}`,long:`${EN} ${d} — season ${season}, week ${week} of 12 (${s})`,roman:s,season,week};
}
function calAdvance(){const C=calLoad();C.week++;if(C.week>12){C.week=1;C.season++}C.frozen=1;calSave();return calNow()}
function calSet(season,week){const C=calLoad();C.season=season;C.week=week;C.frozen=1;calSave()}
function scheduleHTML(season,week){
  const fx=seasonSchedule(season);
  return `<table class="tally" style="margin-top:6px"><tr><th>Week</th><th>Date</th><th>Arena</th><th>Games</th><th>Purse</th></tr>${fx.map(f=>`<tr class="${f.wk===week?'me schednow':''}"><td class="n">${f.wk===week?'▶ ':''}${f.wk}</td><td class="rc-sub">${empireDate(season,f.wk).short}</td><td>📍 ${esc(LOCATIONS[f.loc].n)}</td><td>${esc(EVENTS[f.ev]?EVENTS[f.ev].n:f.ev)}${/democritus|egidious|cassian/.test(f.ev)?'':' <span class="badge gold" title="A special: riskier, and it pays">special</span>'}${f.wk===12?' <span class="badge" title="The regular season ends here; the top four stables are invited to the Flavius Superbus">last regular week</span>':''}</td><td class="n">×${f.purse}</td></tr>`).join('')}</table>`;
}

// v0.21: the season schedule, from anywhere — the date chip on the main screen opens it
function openSchedule(){
  if(typeof modalBusy==='function'&&modalBusy())return;const c=calNow();const dt=empireDate(c.season,c.week);
  modal(`📅 Season ${c.season} schedule`,`<p>Today in the empire: <b>${dt.short}</b>, week ${c.week} of 12. One arena hosts the editor's games each week; classics dominate, and the rarer specials carry fatter purses. Manager mode and New event both follow this schedule.</p>${scheduleHTML(c.season,c.week)}`,[{label:'Close',value:0}],{wide:1});
}
document.addEventListener('click',e=>{if(e.target.closest('#calChip'))openSchedule()});
