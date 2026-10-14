/* v1.01 ONLINE (322-v101onl + the "v1.01" section of 111-onlcore; one window, mock server):
   1 · online loadouts follow v1.0: the Damnatio's class kit lists Iron Helm + Belt I; an online giveLoadout gives the Amazonia no Falcata.
   2 · real match states pass the server's snapshot check (no false refusals): Democritus and Familia after some turns.
   3 · a doctored state (markup in a name, a colour that breaks out of its attribute, an <img onerror> in the log) loads with nothing able to run.
   4 · another page's move is cleaned; the mock server refuses what the real one refuses. ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await P.goto(URL0,{timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
/* 1 · loadouts */
out.kits=await P.evaluate(()=>{const k=onlKits92();return {dam:k.damnatio,ama:k.amazonia,cls:ONLC.kitList92('cls','damnatio')}});
ok(out.kits.dam.includes('galea')&&out.kits.dam.includes('balteus1'),'Damnatio kit: Iron Helm + Belt I '+JSON.stringify(out.kits));ok(!out.kits.ama.includes('falcata'),'no Falcata in a kit');
ok(JSON.stringify(out.kits.cls)===JSON.stringify(out.kits.dam),'the page kit list = the class data');
const run=async(ev,seats)=>P.evaluate(async([ev,seats])=>{menuHide();SPEED='fast';startEvent({ev,loc:6,seed:101,seats:seats.map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{...CFG.opts,spect:'auto'}});
  for(let i=0;i<120&&(!S||S.turnNo<6)&&!(S&&S.over);i++){if(CUR_MODAL)try{CUR_MODAL.done(CUR_MODAL.def!==undefined?CUR_MODAL.def:null)}catch(e){}await new Promise(r=>setTimeout(r,100))}return S?S.turnNo:-1},[ev,seats]);
out.t1=await run('democritus',['amazonia','damnatio','soldier','hero']);
out.ama=await P.evaluate(()=>{const p=S.players.find(x=>x.cls==='amazonia');const was=S.onl;S.onl={test:1};const q={...p,wR:null,wL:null,pieces:JSON.parse(JSON.stringify(p.pieces||{})),items:[],cards:[]};
  let r=null;try{giveLoadout(q);r={R:q.wR&&q.wR.key,L:q.wL&&q.wL.key}}catch(e){r={err:String(e)}}S.onl=was;return r});
ok(out.ama&&out.ama.R==='axe'&&!out.ama.L,'online Amazonia: the Axe alone '+JSON.stringify(out.ama));
/* 2 · real states pass */
const realOK=async()=>P.evaluate(()=>{const s=matchSnapshot('t');const c=snap101Clean(s);return {bad:ONLC.snapBad101(s),same:c.S===s.S,n:s.S.length,log:s.log.length}});
out.real1=await realOK();ok(out.real1.bad===''&&out.real1.same&&out.real1.n>1000,'Democritus state passes, S unchanged '+JSON.stringify(out.real1));
out.t2=await run('familia',['soldier','slave','hero','venatore']);out.real2=await realOK();ok(out.real2.bad===''&&out.real2.same,'Familia state passes '+JSON.stringify(out.real2));
/* 3 · a doctored state */
out.evil=await P.evaluate(async()=>{const s=matchSnapshot('evil');const o=JSON.parse(s.S);o.players[0].name='<img src=x onerror="window.__x101=1">Ann';o.players[1].color='red" onmouseover="window.__x101=2';
  o.zz='<svg><a href="javascript:window.__x101=4"><text>x</text></a></svg><script>window.__x101=5</script>';s.S=JSON.stringify(o);s.log='<li><img src=x onerror="window.__x101=3"><b style="color:#fff">kept</b></li>';
  const refused=!!ONLC.snapBad101(s);matchSlotPut('t101',s);await matchLoad('t101');matchSlotDel('t101');try{render();draw()}catch(e){}await new Promise(r=>setTimeout(r,800));
  const evil=[...document.querySelectorAll('*')].filter(e=>[...e.attributes].some(a=>/^on/i.test(a.name))).map(e=>e.tagName);
  return {refused,x:window.__x101===undefined?null:window.__x101,name:S.players[0].name,color:S.players[1].color,zz:S.zz,log:document.querySelector('#log').innerHTML,evil}});
ok(out.evil.refused,'the server check refuses it');ok(out.evil.x===null,'nothing ran ('+out.evil.x+')');ok(!/onerror|onmouseover|javascript|script/i.test(out.evil.name+out.evil.color+out.evil.zz),'strings cleaned '+JSON.stringify(out.evil));
ok(/kept/.test(out.evil.log)&&!/onerror/.test(out.evil.log),'the log keeps its text, loses the handler');ok(!out.evil.evil.length,'no element with an inline handler on the page '+out.evil.evil);
/* 4 · inputs + the mock */
out.inp=await P.evaluate(()=>{const i=snap101Deep({k:'act',a:'buy',id:'<img src=x onerror=alert(1)>',v:{t:'a" onfocus="x'},n:3},0);
  const tries={};for(const [t,d] of [['match.open',{id:'x',snap:{S:'{"a":"<img src=x onerror=1>"}'}}],['match.snap',{id:'x',snap:{log:'<script>1</script>'}}],['match.input',{id:'x',in:{k:'act',a:'<svg onload=1>'}}]]){
    try{MOCK_ROUTES[t]({lobbies:{},matches:{}},d,'me');tries[t]='ok'}catch(e){tries[t]=e.message}}return {i,tries}});
ok(!/onerror/.test(JSON.stringify(out.inp.i))&&!/["']/.test(out.inp.i.v.t)&&out.inp.i.n===3&&out.inp.i.a==='buy','a move cleaned '+JSON.stringify(out.inp.i));
for(const [t,m] of Object.entries(out.inp.tries))ok(/markup/.test(m),'mock refuses '+t+': '+m);
console.log(JSON.stringify(out).slice(0,1500));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
