/* tv105s — v1.05 B61 (382-v105home): a recruit's home-city want + interest bonus name a city WITH AN ARENA.
   every free agent's home arena is an arena city · a forced Alexandria recruit -> the nearest arena city by map distance (Leptis Magna) ·
   an arena-city recruit keeps his own city · glad.city is untouched · the +8 interest bonus follows the arena city · want88Fits/chip text ·
   the kill switch flavius_v105homeoff=1 restores the old behaviour. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105homeoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();w.welc99=1;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}});return pg};
const probe=async(pg)=>pg.evaluate(()=>{const out={};const w=W_(),pm=me();
  const arenas=LOCATIONS.slice(1).map(L=>L.n);
  const fa=freeAgents();out.n=fa.length;out.allArena=fa.every(g=>arenas.includes(homeArena105(g)));out.fa=fa.length;
  /* expected nearest by distance, computed here independently from the map art's coordinates */
  const near=(xy)=>{let b=null,bd=1e9;for(const L of LOCATIONS.slice(1)){const d=Math.hypot((L.x-xy[0])*MAPW,(L.y-xy[1])*MAPH);if(d<bd){bd=d;b=L.n}}return b};
  out.expAlex=near(MI100_XTRA.Alexandria);
  const al=genGlad({city:'Alexandria'});out.alexCity=al.city;out.alexArena=homeArena105(al);out.alexKeep=al.city==='Alexandria';
  const ar=genGlad({city:'Capua'});out.capua=homeArena105(ar);
  /* every non-arena birthplace the game uses has an arena home */
  out.table={};for(const c of HOME_CITIES()){if(!arenas.includes(c)){const g=genGlad({city:c});out.table[c]=homeArena105(g)}}
  /* interest: a ludus in the arena city leans toward the Alexandrian; one elsewhere does not */
  const target=homeArena105(al);const other=arenas.find(c=>c!==target);
  const m1={...pm,city:target,id:'t1'},m2={...pm,city:other,id:'t2'};
  out.i1=baseInterest(m1,al);out.i1n=baseInterest(m1,{...al,city:target,homeArena105:undefined});out.i2=baseInterest(m2,al);out.cityAfter=al.city;
  /* the want */
  out.fitYes=want88Fits(al,m1,'home',null);out.fitNo=want88Fits(al,m2,'home',null);
  out.how=want88How(al,'home');out.label=want88Def('home',al)[2];out.labelArena=want88Def('home',ar)[2];
  out.migr=typeof SAVE_MIGRATIONS;
  return out});
{const pg=await open(false);const r=await probe(pg);console.log(JSON.stringify(r));
  ok(r.n>0,'free agents exist');ok(r.allArena,'every free agent home want is an arena city');
  ok(r.alexKeep,'birthplace kept');ok(r.alexArena===r.expAlex,'Alexandria -> nearest arena '+r.expAlex+' got '+r.alexArena);
  ok(r.capua==='Capua','arena city recruit keeps his city');
  ok(Object.values(r.table).every(Boolean),'table complete');
  ok(r.i1===r.i1n&&r.i1>r.i2,'interest as if native to the arena city, above a ludus elsewhere ('+r.i1+' / '+r.i1n+' / '+r.i2+')');
  ok(r.cityAfter==='Alexandria','glad.city restored after interest');
  ok(r.fitYes===true&&r.fitNo===false,'want88Fits follows the arena city');
  ok(r.how.includes(r.expAlex),'how names the arena city');
  ok(r.label.includes(r.expAlex)&&r.label.includes('Alexandria'),'chip names both: '+r.label);
  ok(r.labelArena==='Home city','arena-city chip unchanged');
  await pg.close()}
{const pg=await open(true);const r=await pg.evaluate(()=>{const al=genGlad({city:'Alexandria'});const pm=me();const m={...pm,city:'Alexandria',id:'t3'},m2={...pm,city:'Thysdrus',id:'t4'};
    return {a:homeArena105(al),fit:want88Fits(al,m,'home',null),fit2:want88Fits(al,m2,'home',null),i:baseInterest(m,al)-baseInterest(m2,al),label:want88Def('home',al)[2]}});
  console.log(JSON.stringify(r));ok(r.a==='Alexandria','off: home stays the birthplace');ok(r.fit===true&&r.fit2===false,'off: old want logic');ok(r.i>0&&r.label==='Home city','off: old bonus and label');await pg.close()}
await b.close();console.log('ERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));process.exit(errs.length||miss.length?1:0)})();
