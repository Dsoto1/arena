/* tv107g — v1.07 beta-2 note 3 (404-v107corpse): the CORPSES on the sand are the 3D figure, never the old token minis tipped over.
   1 with the sheets: slain beasts (bear, wolf, lion, Tholo, snake) lie as the last frame of their 3D die row (312's die4), a gladiator who
     fell with Animations Off (no 311 ghost) as the last frame of his fall row; 07's old corpse picture (tokenImg of the spec) is never asked;
   2 sheets blocked (the standalone download): the lying pose made from the still107 sheets, built once and cached (no rebuild a frame);
   3 a corpse the crew cleared (gone) is not drawn; 4 the kill switch flavius_v107corpseoff=1 = 07's corpse (tokenImg) exactly; no errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const mk=async(o={})=>{const pg=await b.newPage({viewport:{width:1280,height:860}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  if(o.block)await pg.route(/anim100_|beast100_/,r=>r.abort());const reqs=[];pg.on('request',r=>reqs.push(r.url()));pg.reqs=reqs;pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_v107corpseoff','1')},{off:!!o.off});
  await pg.goto('file://'+page,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});return pg};
const play=p=>p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<120&&!(humanTurn()&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  SPEED='normal';S.npcs=S.npcs.filter(n=>n.alive);
  const spots=[[3,3],[3,6],[3,9],[6,3],[6,9]],kinds=[['bear','Ursa'],['wolf','Valencia'],['lion','Leo'],['tholo','Tholo'],['snake','Glykon']];
  const ns=kinds.map(([t,k],i)=>{const n=mkNPC(t,k,spots[i][0],spots[i][1]);S.npcs.push(n);return n});for(let i=0;i<8;i++){draw();await W8(120)}
  for(const n of ns){n.alive=false;try{BUS.emit('hit',{target:{id:n.id,name:n.name,npc:true},amount:9,after:{hp:0}})}catch(e){}}
  /* a gladiator falls with Animations Off → no 311 ghost, no 321 corpse: 404 draws him */
  const keepA=window.animOn;window.animOn=()=>false;const G=S.players[2];G.r=9;G.c=6;try{eliminate(G,{type:'env'})}finally{window.animOn=keepA}
  const ti=window.tokenImg,dc=window.drawCorpseFig;let tiN=0,inC=0;window.tokenImg=function(sp){if(inC&&sp&&typeof sp==='object')tiN++;return ti.apply(this,arguments)};
  window.drawCorpseFig=function(){inC++;try{return dc.apply(this,arguments)}finally{inC--}};
  const st0=typeof CV107!=='undefined'?{...CV107.stats}:null;
  for(let i=0;i<24;i++){draw();await W8(150)}
  const tiA=tiN;const st1=typeof CV107!=='undefined'?{...CV107.stats}:null;
  /* steady state: 10 more draws build nothing new */
  for(let i=0;i<10;i++)draw();const st2=typeof CV107!=='undefined'?{...CV107.stats}:null;
  /* the crew carts them out */
  for(const n of ns)n.gone=true;for(const pl of S.piles)if(pl.corpse)pl.gone=true;const st3a=typeof CV107!=='undefined'?{...CV107.stats}:null;tiN=0;
  for(let i=0;i<4;i++)draw();const st3=typeof CV107!=='undefined'?{...CV107.stats}:null;window.tokenImg=ti;window.drawCorpseFig=dc;
  const d=(a,b2,k)=>a&&b2?b2[k]-a[k]:0;
  return {on:typeof CV107!=='undefined'&&CV107.on,tiA,tiGone:tiN,d3:d(st0,st1,'d3'),g3:d(st0,st1,'g3'),lie:d(st0,st1,'lie'),base:d(st0,st1,'base'),
    built:d(st1,st2,'built'),lie2:d(st1,st2,'lie'),d32:d(st1,st2,'d3'),gone:st3a&&st3?(st3.d3+st3.lie+st3.g3)-(st3a.d3+st3a.lie+st3a.g3):0,
    piles:S.piles.filter(p=>p.corpse).length,c101:CORPSE101.filter(g=>g.S===S).length}});
/* ---- 1 with the sheets ---- */
const p1=await mk();const s1=await play(p1);await p1.close();
ok(s1.on&&s1.d3>=5*10&&s1.g3>=10&&s1.base===0&&s1.tiA===0,'1 3D corpses: beasts die4 + the gladiator fall frame, no old token picture '+JSON.stringify(s1));
ok(s1.built===0&&s1.d32>=50,'1b steady: nothing rebuilt per frame '+JSON.stringify(s1));
ok(s1.gone===0,'3 cleared corpses are not drawn '+JSON.stringify(s1));
/* ---- 2 sheets blocked ---- */
const p2=await mk({block:true});const s2=await play(p2);const noMini=p2.reqs.filter(u=>/minis8_|\/mini_(?!pillar)/.test(u));console.log('mini reqs',noMini);await p2.close();
ok(s2.on&&s2.d3===0&&s2.g3===0&&s2.lie>=6*10&&s2.base===0&&s2.tiA===0&&!noMini.length,'2 sheets blocked: lying stills, never the old minis '+JSON.stringify({...s2,noMini}));
ok(s2.built===0&&s2.lie2>=60,'2b lying canvases cached '+JSON.stringify(s2));
/* ---- 4 kill switch ---- */
const p4=await mk({off:true});const s4=await play(p4);await p4.close();
ok(!s4.on&&s4.tiA>0,'4 kill switch: 07\'s corpse (tokenImg) '+JSON.stringify(s4));
await b.close();
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
