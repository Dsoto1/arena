/* tools/replay/lib.js — shared by record.js / check.js (the replay harness, Phase 0 of tools/plans/layers100/PLAN.md).
   One fresh browser CONTEXT per match (empty localStorage), so a recording and its playback both start from a clean browser:
   anything the rules read from outside S (and so outside the opening snapshot) shows up as a divergence. */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const GOLD=path.join(__dirname,'golden');
/* the fixed set. human = seat 0 is a scripted 'human' (answers through the same inputs 309 records); hturns = his turns before ⏭ To the end */
const SEATS4=['royalty','amazonia','soldier','hero','veteranus','venatore','slave','damnatio'];
const mk=(n,h)=>Array.from({length:n},(_,i)=>({cls:SEATS4[i%8],cpu:!(h&&i===0),name:['Varinius','Galla','Scourge','Tertius','Cassia','Bruttius','Nerva','Spurius'][i]}));
const SPECS=[
  {name:'democritus-cpu',ev:'democritus',loc:6,seed:4242,n:4},
  {name:'democritus-human',ev:'democritus',loc:6,seed:9191,n:4,human:1,hturns:6},
  {name:'egidious-cpu',ev:'egidious',loc:2,seed:1717,n:4},
  {name:'cassian-human',ev:'cassian',loc:3,seed:3131,n:4,human:1,hturns:5},
  {name:'triumviratus-cpu',ev:'triumviratus',loc:12,seed:2323,n:3},
  {name:'familia-cpu',ev:'familia',loc:4,seed:5151,n:4},
  {name:'ludus-cpu',ev:'ludus',loc:5,seed:6161,n:4},
  {name:'goldenEagle-cpu',ev:'goldenEagle',loc:7,seed:7171,n:4},
  {name:'gauntlet-human',ev:'gauntlet',loc:8,seed:8181,n:1,human:1,hturns:4},
  {name:'commodus-cpu',ev:'commodus',loc:1,seed:9292,n:4},
  {name:'naumachia-cpu',ev:'naumachia',loc:9,seed:1313,n:6},
  {name:'chariot-cpu',ev:'chariot',loc:10,seed:1414,n:4},
  {name:'orpheus-cpu',ev:'orpheus',loc:11,seed:1515,n:4},
  {name:'juggernaut-cpu',ev:'juggernaut',loc:12,seed:1616,n:4},
];
const seatsOf=sp=>mk(sp.n,sp.human);
const fileOf=name=>path.join(GOLD,name+'.json.gz');
const save=(name,obj)=>{fs.mkdirSync(GOLD,{recursive:true});fs.writeFileSync(fileOf(name),zlib.gzipSync(JSON.stringify(obj),{level:9}))};
const load=f=>JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString());
/* a page on the built game, harness probe on (325), menus and rule pop-ups out of the way */
async function openPage(b,file){const ctx=await b.newContext({viewport:{width:1280,height:720}});const pg=await ctx.newPage();const errs=[];
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+String(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_replay0','1');localStorage.setItem('flavius_first100off','1')});
  await pg.goto('file://'+path.resolve(file));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  /* the first-visit crowd (~140 regulars) is seeded into the Store about a second AFTER FLAVIUS_READY; regulars change who sits in the
     stands and so how many dice the opening rolls. Wait for it, then empty the crowd memory on both sides (recording and playback). */
  await pg.waitForFunction(()=>CROWD_CACHE.length>0,null,{timeout:6000,polling:100}).catch(()=>{});
  await pg.evaluate(()=>{CROWD_CACHE=[];menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');POPPED.add('mandata');SPEEDMUL.fast=0;window.__m=ERR92.n});
  return {pg,ctx,errs}}
/* what is compared, field by field: the first difference wins */
function diff(want,got){const F=['h','rng','turns','ri','rot','win','reason','res','npcs'];
  /* per-turn state hashes first: the first turn whose opening state differs (then the end fields say what, the log says which event) */
  const TA=want.th||[],TB=got.th||[];let tdiv=null;if(want.th)for(let i=0;i<Math.max(TA.length,TB.length);i++)if(TA[i]!==TB[i]){tdiv={field:'turn hash',idx:i,turn:String(TA[i]||TB[i]||'').split(':')[0],want:TA[i]===undefined?'(none)':TA[i],got:TB[i]===undefined?'(none)':TB[i]};break}
  if(tdiv){const A=want.log||[],B=got.log||[];for(let i=0;i<Math.max(A.length,B.length);i++)if(A[i]!==B[i]){tdiv.line=i;tdiv.event=(A[i]===undefined?'(none)':A[i])+'  ≠  '+(B[i]===undefined?'(none)':B[i]);break}return tdiv}
  for(const f of F){const a=JSON.stringify(want[f]),b=JSON.stringify(got[f]);if(a!==b)return {field:f,want:a.slice(0,300),got:b.slice(0,300)}}
  const A=want.log||[],B=got.log||[];for(let i=0;i<Math.max(A.length,B.length);i++)if(A[i]!==B[i])return {field:'log',line:i,turn:String(A[i]||B[i]||'').split('|')[0],want:A[i]===undefined?'(none)':A[i],got:B[i]===undefined?'(none)':B[i]};
  return null}
module.exports={GOLD,SPECS,seatsOf,fileOf,save,load,openPage,diff};
