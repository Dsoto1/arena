/* node tools/plans/mock100/world_art.js — renders the game's OWN art for world.html into world_img/:
   house top gladiators (gArt), lanista faces (portraitHTML), event cards (cardHTML 'e:'), trophies (trophySVG), and data (houses, cities, fixtures 3 seasons,
   world events, arena stones AR91MAT, CITY75 colours, CITY94/SPEC94, CITY_CLS99) → world_img/data.js. Runs the built game over http. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const OUT=path.resolve(__dirname,'world_img');const root=path.resolve(__dirname,'../../..');
(async()=>{const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/flavius-arena.html';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}
 openManager();await W8(800);
 newWorld({type:'custom',mgr:{name:'Virgilante',ludus:'Ludus Virgilanti',city:'Capua',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});
 const w=W_(),m=me();
 const box=document.createElement('div');box.id='art';box.style.cssText='position:fixed;left:0;top:0;z-index:999999;display:flex;flex-wrap:wrap;gap:12px;width:1400px;background:transparent';document.body.appendChild(box);
 const add=(id,html,wd,ht)=>{const d=document.createElement('div');d.id=id;d.style.cssText=`width:${wd}px;height:${ht}px;display:flex;align-items:center;justify-content:center;overflow:hidden`;d.innerHTML=html;box.appendChild(d);
   const s=d.querySelector(':scope>svg');if(s){s.setAttribute('width',wd);s.setAttribute('height',ht);s.style.width=wd+'px';s.style.height=ht+'px'}const sp=d.querySelector('.portrait');if(sp){sp.style.width=wd+'px';sp.style.height=ht+'px'}};
 const houses=w.mgrs.slice(0,8).map((x,i)=>{const ro=rosterOf(x).filter(g=>!g.dead).sort((a,b)=>effOvr(b)-effOvr(a));const g=ro[0];
   if(g)add('g'+i,gArt(g,'md'),120,168);add('l'+i,portraitHTML({name:x.name,portrait:x.portrait,color:x.color},'md'),120,168);
   return {i,me:x===m,ludus:x.ludus,name:x.name,city:x.city,color:x.color,flag:mgrFlagOf(x),top:g?{name:g.name,cls:g.cls,ovr:Math.round(effOvr(g)),grade:trait96Grade(effOvr(g))}:null,n:ro.length}});
 const sch=[1,2,3].map(s=>seasonSchedule(s).map(f=>({wk:f.wk,loc:f.loc,city:(LOCATIONS[f.loc]||{}).n,ev:f.ev,evn:(EVENTS[f.ev]||{}).n,purse:f.purse,date:empireDate(s,f.wk).short})));
 const evs=[...new Set(sch.flat().map(f=>f.ev))];evs.forEach(e=>add('e_'+e,cardHTML('e:'+e,'md')||'',140,202));
 TROPHY_LIB.forEach(t=>add('t_'+t.id,trophySVG(t,150),150,150));
 const locs=LOCATIONS.map((L,i)=>L?{i,n:L.n,x:L.x,y:L.y,px:MAP_PX(L.x,L.y).map(v=>v),mat:(AR91MAT[i]||{}),c75:CITY75[L.n]||null,c94:CITY94[L.n]||null,cls:CITY_CLS99[L.n]||null,closed:(worldImpact(i).closed||{}).n||null}:null).filter(Boolean);
 const wev=worldEvents().map(e=>({t:e.t,i:e.i,c:e.c,n:e.n,city:e.city,sev:e.sev,tag:e.tag,att:e.att,mood:e.mood,px:MAP_PX(e.x,e.y),war:e.war||null}));
 return {houses,sch,evs,locs,wev,spec:Object.fromEntries(Object.entries(SPEC94).map(([k,v])=>[k,v.n])),troph:TROPHY_LIB.map(t=>({id:t.id,name:t.name,desc:t.desc,cat:t.cat})),mapw:MAPW,maph:MAPH,temple:Object.fromEntries(Object.entries(TEMPLE76).map(([k,v])=>[k,[v[0],v[1],v[2]]]))}});
await pg.evaluate(()=>{document.documentElement.style.background='transparent';document.body.style.background='transparent';for(const e of document.body.children)if(e.id!=='art')e.style.visibility='hidden'});await pg.waitForTimeout(2500);
const ids=await pg.$$eval('#art>div',ds=>ds.map(d=>d.id));for(const id of ids){const el=await pg.$('#'+id);await el.screenshot({path:path.join(OUT,id+'.png'),omitBackground:true})}
fs.writeFileSync(path.join(OUT,'data.js'),'window.WD='+JSON.stringify(info)+';');console.log(JSON.stringify(info).slice(0,1500),'\nerrs',errs.slice(0,5));
await b.close();srv.close()})();
