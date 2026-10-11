/* node tools/plans/mock100/recruit3_art.js — renders the game's OWN painters into img3/ for recruit3.html:
   face99 portraits (recruit xl, champion, rival lanistas), council83 faces, lit sculpted figures (figureSVG + lit89 / sc3dSVG),
   crowd faces (face99Spect), the city square canvas (172-v89city), the arena canvas (192-v91arena), roomScene73('recruit'). */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const OUT=path.resolve(__dirname,'img3');const root=path.resolve(__dirname,'../../..');
(async()=>{const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/flavius-arena.html';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}
 openManager();await W8(800);
 newWorld({type:'custom',mgr:{name:'Virgilante',ludus:'Ludus Virgilanti',city:'Capua',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});
 const w=W_(),m=me();m.fame=60;const fa=freeAgents().filter(x=>m.fame>=reqFame(x)).sort((a,b)=>effOvr(b)-effOvr(a));
 const g=fa.find(x=>x.cls==='royalty')||fa[0];const champ=fa.find(x=>x!==g&&x.cls==='hero')||fa[1];
 const box=document.createElement('div');box.id='art3';box.style.cssText='position:fixed;left:0;top:0;z-index:999999;display:flex;flex-wrap:wrap;gap:12px;width:1400px;background:transparent';document.body.appendChild(box);
 const add=(id,html,wd,ht)=>{const d=document.createElement('div');d.id=id;d.style.cssText=`width:${wd}px;height:${ht}px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden`;d.innerHTML=html;box.appendChild(d);
   const s=d.querySelector('svg');if(s){s.setAttribute('width',wd);s.setAttribute('height',ht);s.style.width=wd+'px';s.style.height=ht+'px'}const sp=d.querySelector('.portrait');if(sp){sp.style.width=wd+'px';sp.style.height=ht+'px'}};
 add('rec',gArt(g,'xl'),250,350);add('champ',gArt(champ,'lg'),170,238);
 const C=council83(w);C.forEach(a=>add('c_'+a.k,face83(a,180),180,180));
 const riv=w.mgrs.filter(x=>x!==m).slice(0,4);riv.forEach((x,i)=>add('riv'+i,portraitHTML({name:x.name,portrait:x.portrait,color:x.color},'md'),110,154));
 const cls=['soldier','hero','royalty','veteranus','amazonia','venatore','slave','damnatio'];cls.forEach(k=>add('fig_'+k,lit89(figureSVG(tokenForCls(k),{})),130,208));
 const S1=SKINS,H1=HAIRS;for(let i=0;i<14;i++){const L={skin:S1[(i*5)%S1.length],hair:H1[(i*3)%H1.length],beard:i%3===0,fem:i%4===1,long:i%4===1,hat:['','wreath','hood','pileus',''][i%5],robe:['#7a2230','#35606a','#a86a2a','#5a4636','#c9b27a','#3a5a2a'][i%6],tunic:'#e8dcc0'};
   add('crowd'+i,face99Spect(L,{px:90}),90,90)}
 window.SCN=roomScene73('recruit');
 return {g:{name:g.name,cls:g.cls,age:gAge(g),city:g.city,fame:g.fame},champ:{name:champ.name,cls:champ.cls},council:C.map(a=>({k:a.k,name:a.name,role:a.role})),riv:riv.map(x=>({ludus:x.ludus,name:x.name,color:x.color})),
   grades:MGR_KEYS.map(([k,l])=>[l,trait96Grade(m.p[k]||0)]),locs:LOCATIONS.map(L=>(L||{}).n||"")}});
await pg.evaluate(()=>{document.documentElement.style.background='transparent';document.body.style.background='transparent';for(const e of document.body.children)if(e.id!=='art3')e.style.visibility='hidden'});await pg.waitForTimeout(2500);
const ids=await pg.$$eval('#art3>div',ds=>ds.map(d=>d.id));for(const id of ids){const el=await pg.$('#'+id);await el.screenshot({path:path.join(OUT,'r3_'+id+'.png'),omitBackground:true})}
fs.writeFileSync(path.join(OUT,'r3_room_recruit.svg'),await pg.evaluate(()=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-600 0 1800 120" preserveAspectRatio="xMidYMid slice">${typeof SCN==='string'?SCN:''}</svg>`));
await pg.evaluate(()=>{document.getElementById('art3').remove();document.documentElement.style.background='';document.body.style.background='';for(const e of document.body.children)e.style.visibility=''});
/* the city square: Capua, painted forum */
const ci=info.locs.findIndex(n=>/Capua/.test(n));
await pg.evaluate(async ci=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));MGR.tab='night';try{if(typeof B89!=='undefined')B89.forEach(B=>{B.lab=''})}catch(e){}try{openCitySquare(ci)}catch(e){console.error(e)}await W8(4000)},ci<0?0:ci);
await pg.screenshot({path:path.join(OUT,'r3_city_full.png')});
const ri=info.locs.findIndex(n=>/^Roma/.test(n));await pg.evaluate(async ri=>{try{closeCity(()=>{})}catch(e){}await new Promise(x=>setTimeout(x,900));try{openCitySquare(ri)}catch(e){}await new Promise(x=>setTimeout(x,4000))},ri<0?1:ri);await pg.screenshot({path:path.join(OUT,'r3_city2_full.png')});
await pg.evaluate(async()=>{try{closeCity(()=>{})}catch(e){}await new Promise(x=>setTimeout(x,800));try{if(CUR_MODAL)CUR_MODAL.done(null)}catch(e){}});
/* the arena (all-CPU Democritus at Capua, by day) */
await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await pg.evaluate(async ci=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}
 const ev=Object.keys(EVENTS).find(k=>/democ/i.test(k))||Object.keys(EVENTS)[0];
 startEvent({ev,loc:ci,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});
 for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
 SPEED='pause';await W8(1500);try{menuHide()}catch(e){}for(const id of ['cardShow','bubbles'])(document.getElementById(id)||{}).innerHTML='';for(let i=0;i<30;i++){draw();await W8(100)}},ci<0?0:ci);
await (await pg.$('#cv')).screenshot({path:path.join(OUT,'r3_arena_full.png')});
fs.writeFileSync(path.join(OUT,'r3_data.json'),JSON.stringify(info,null,1));console.log(JSON.stringify(info).slice(0,600),'errs',errs.slice(0,5));
await b.close();srv.close()})();
