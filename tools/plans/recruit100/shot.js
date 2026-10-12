/* v1.0 Recruiting dossier + Signing Day shots (299-v100recruit) → tools/plans/recruit100/*.png
   node tools/plans/recruit100/shot.js flavius-arena.html [only]   (served over http so the cut-outs/rasters behave like the site)
   states: scout court offer (1440 + 390), signing pre/gem/fair/dud/static (1440 + 390 gem), off (kill switch) */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const page=path.resolve(process.argv[2]||'flavius-arena.html');const ONLY=process.argv[3]||'';const OUT=__dirname;
(async()=>{const root=path.dirname(page),file=path.basename(page);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const U='http://127.0.0.1:'+srv.address().port+'/'+file;
const b=await chromium.launch();
const boot=async(vp,ls)=>{const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());const pg=await ctx.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));
 await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls||{})localStorage.setItem(k,ls[k])},ls||{});
 await pg.goto(U);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});return pg};
const setup=async(pg,step,scouted)=>pg.evaluate(async([step,scouted])=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(900);
 newWorld({type:'custom',mgr:{name:'Virgilante',ludus:'Ludus Virgilanti',city:'Capua',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});const m=me();m.fame=58;m.coin=214;
 const fa=freeAgents().filter(x=>m.fame>=reqFame(x)&&!x.fem).sort((a,b)=>effOvr(b)-effOvr(a));const g=fa[0];g.favd=true;fa.slice(1,4).forEach(x=>x.favd=true);
 if(scouted===1){rec98Act(g,'ask');rec98Act(g,'watch')}if(scouted===2){rec98Act(g,'watch');rec98Act(g,'cup');rec98Act(g,'study')}
 window.G=g;MGR.view=null;MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=step;MGR_REDRAW();await W8(900);
 const c=document.querySelector('#mgrBody .card2.rc100');if(c)c.scrollIntoView({block:'start'});await W8(300)},[step,scouted]);
const shots=[['scout',1,1],['court',2,2],['offer',3,2]];
for(const vp of [[1440,900],[390,844]])for(const [n,step,sc] of shots){if(ONLY&&!ONLY.split(',').includes(n))continue;const pg=await boot({width:vp[0],height:vp[1]});await setup(pg,step,sc);
 await pg.screenshot({path:path.join(OUT,`rc100_${n}_${vp[0]}.png`)});
 if(vp[0]===1440)await pg.screenshot({path:path.join(OUT,`tabs_${n}_1440.png`)}); /* C2b: the card scrolled to the top of the screen */
 if(vp[0]<600){await pg.evaluate(()=>{const b=document.getElementById('mBody')||document.scrollingElement;const c=document.querySelector('#mgrBody .card2.rc100');if(c){const r=c.getBoundingClientRect();(document.getElementById('mBody')||window).scrollBy(0,r.top+560)}});await pg.waitForTimeout(300);await pg.screenshot({path:path.join(OUT,`rc100_${n}_${vp[0]}_2.png`)})}
 await pg.context().close()}
/* signing */
for(const [n,kind,vp,ls] of [['pre','gem',[1440,900]],['gem','gem',[1440,900]],['fair','fair',[1440,900]],['dud','dud',[1440,900]],['static','gem',[1440,900],{flavius_settings:JSON.stringify({calm:true})}],['gem390','gem',[390,844]]]){
 if(ONLY&&!ONLY.split(',').includes('sign'))continue;const pg=await boot({width:vp[0],height:vp[1]},ls);await setup(pg,2,2);
 await pg.evaluate(async(kind)=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const g=G;const m=me();m.coin=999;
  const st=gStats(g);const G2=v=>trait96Grade(v);const ORD=['F','D','C','C+','B','B+','A','A+'];const sh=(v,d)=>ORD[Math.max(0,Math.min(7,ORD.indexOf(G2(v))+d))];
  signGlad(g,askWage(g),12,40,false);await W8(20);const d=kind==='gem'?-2:kind==='dud'?2:0;const s={};for(const [k] of STATS)s[k]=sh(st[k],d);s.lck=kind==='gem'?'?':s.lck;s.ovr=sh(effOvr(g),d);g.truth98.s=s},kind);
 const t=n==='pre'?120:n==='static'?600:4600;await pg.waitForTimeout(t);await pg.screenshot({path:path.join(OUT,`sg100_${n}.png`)});await pg.context().close()}
if(!ONLY||ONLY.includes('off')){const pg=await boot({width:1440,height:900},{flavius_recruit100off:'1'});await setup(pg,2,2);await pg.screenshot({path:path.join(OUT,'rc100_off_1440.png')});await pg.context().close()}
await b.close();srv.close()})();
