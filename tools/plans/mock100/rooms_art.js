/* node tools/plans/mock100/rooms_art.js — rooms.html art: 8 fighter portraits from the game's painter (gArt → face99) into img3/r4_f*.png + names */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const OUT=path.resolve(__dirname,'img3');const root=path.resolve(__dirname,'../../..');
(async()=>{const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const pg=await ctx.newPage();await pg.goto('http://127.0.0.1:'+srv.address().port+'/flavius-arena.html');await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}openManager();await W8(800);
 newWorld({type:'custom',mgr:{name:'Virgilante',ludus:'Ludus Virgilanti',city:'Capua',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});
 const want=['soldier','hero','amazonia','veteranus','venatore','slave','royalty','damnatio'];const fa=freeAgents();const out=[];
 for(const c of want){const g=fa.find(x=>x.cls===c&&!out.some(o=>o.id===x.id));if(g)out.push(g)}
 const box=document.createElement('div');box.id='art4';box.style.cssText='position:fixed;left:0;top:0;z-index:999999;display:flex;flex-wrap:wrap;gap:10px;width:1400px';document.body.appendChild(box);
 document.documentElement.style.background='transparent';document.body.style.background='transparent';for(const e of document.body.children)if(e!==box)e.style.visibility='hidden';
 out.forEach((g,i)=>{const d=document.createElement('div');d.id='f'+i;d.style.cssText='width:170px;height:238px';d.innerHTML=gArt(g,'lg');box.appendChild(d);const s=d.querySelector('.portrait');if(s){s.style.width='170px';s.style.height='238px'}});
 return out.map(g=>({name:g.name,cls:CLASSES[g.cls].name,age:gAge(g),city:g.city,st:gStats(g)}))});
await pg.waitForTimeout(2000);for(let i=0;i<info.length;i++){await (await pg.$('#f'+i)).screenshot({path:path.join(OUT,`r4_f${i}.png`),omitBackground:true})}
fs.writeFileSync(path.join(OUT,'r4_data.json'),JSON.stringify(info,null,1));console.log(JSON.stringify(info.map(x=>[x.name,x.cls])));await b.close();srv.close()})();
