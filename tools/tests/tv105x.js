/* tv105x — v1.05 B68 + B69 + home overrides (387-v105task, 382-v105home): empty-hand tasks only for fighters who fight this week (reserve: none,
   First-team starter: yes) · a building project's chip on its page banner (Infirmary) and on Your ludus, once each · Londinium -> Nemausus,
   Antiochia -> Syracusae · kill switch flavius_v105taskoff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105taskoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();w.welc99=1;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}});return pg};
const probe=async(pg)=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const out={};const w=W_(),pm=me();
  const ros=rosterOf(pm).filter(g=>!g.inj);out.n=ros.length;
  if(w.night){w.night.bouts=(w.night.bouts||[]).map(b=>({...b,ents:[]}))}
  const [st,rs]=[ros[0],ros[ros.length-1]];
  for(const g of ros){g.slot95=0;g.tm104='R'}st.tm104='A';rs.tm104='R';
  for(const g of [st,rs]){arm94EnsureG(w,g);g.eq94.R=null;g.eq94.L=null}
  const names=()=>weekChecklist().map(x=>x.txt).join('|');
  const t=names();out.starter=t.includes('<b>'+esc(st.name)+'</b>');out.reserve=t.includes('<b>'+esc(rs.name)+'</b>');out.same=st!==rs;
  out.empt=arm94Todo(pm).empty.map(g=>g.name);
  /* a reserve entered in a bout this week fights */
  if(w.night&&w.night.bouts&&w.night.bouts[0]){w.night.bouts[0].ents=[rs.id];out.enteredRes=names().includes('<b>'+esc(rs.name)+'</b>');w.night.bouts[0].ents=[]}
  /* project chip */
  pm.bp104={k:'valet',l:1,s:w.week,n:2,end:w.week+1};
  const cnt=tab=>{MGR.tab=tab;MGR.view=null;const h=mgrHTML();const d=document.createElement('div');d.innerHTML=h;return {all:d.querySelectorAll('.bp104c').length,ban:d.querySelectorAll('.roomhd .bp104c').length}};
  out.infirm=cnt('infirm');out.ludus=cnt('ludus');out.infirm2=cnt('infirm');out.practice=cnt('practice');
  /* home */
  out.lon=homeArena105({city:'Londinium'});out.ant=homeArena105({city:'Antiochia'});out.cyr=homeArena105({city:'Cyrene'});
  return out});
{const pg=await open(false);const r=await probe(pg);console.log(JSON.stringify(r));
  ok(r.n>=2&&r.same,'roster');ok(r.starter,'starter with empty hands gets the task');ok(!r.reserve,'reserve gets none');
  if(r.enteredRes!==undefined)ok(r.enteredRes,'reserve entered in a bout gets the task');
  ok(r.infirm.all>=1&&r.infirm.ban===r.infirm.all&&r.infirm.all===1,'chip once on the Infirmary banner '+JSON.stringify(r.infirm));
  ok(r.infirm2.all===1,'no duplicate on re-render');ok(r.ludus.all===1,'chip once on Your ludus '+JSON.stringify(r.ludus));ok(r.practice.all===0,'none on the Yard page');
  ok(r.lon==='Nemausus','Londinium -> Nemausus got '+r.lon);ok(r.ant==='Syracusae','Antiochia -> Syracusae got '+r.ant);
  await pg.close()}
{const pg=await open(true);const r=await probe(pg);console.log('off',JSON.stringify(r));
  ok(r.reserve,'kill switch: reserve task back');ok(r.infirm.all===0,'kill switch: no chip on Infirmary banner');await pg.close()}
console.log('ERRS',JSON.stringify(errs));if(miss.length)console.log('MISS',JSON.stringify(miss));await b.close();process.exit(errs.length||miss.length?1:0)})();
