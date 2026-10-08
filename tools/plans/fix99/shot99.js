/* v0.99 fix2 screenshots: node tools/plans/fix99/shot99.js <page> <outdir> <prefix>
   attack bar (1440), recruiting card (1440 / 1280 / 390), online lobby rows + room + squares (mock, one window). */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const page=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]),pre=process.argv[4]||'x';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const res={};
const boot=async(vp,mob,url)=>{const ctx=await b.newContext(mob?{viewport:vp,screen:vp,isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:vp});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1')});
  const pg=await ctx.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));await pg.goto(url||('file://'+page));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
/* 2 · attack bar */
{const pg=await boot({width:1440,height:900});
 await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';startEvent({ev:'democritus',loc:6,seats:['venatore','hero','royalty','soldier'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';const p=cur();S.ri=1;p.wR=mkW('hasta');p.wL=mkW('gladius');p.attacks=0;p.mv=5;p.armUses={R:0,L:0};p.hitTargets=new Set();p.focusRoll=false;S.mode='move';const q=S.players[1];const fr=p.r>0?p.r-1:p.r+1;for(const x of [...S.players,...S.npcs])if(x!==q&&x.r===fr&&x.c===p.c)x.r=-9;S.pillars=S.pillars.filter(x=>!(x.r===fr&&x.c===p.c));q.r=fr;q.c=p.c;q.alive=true;render();await W8(300)});
 await (await pg.$('#actions')).screenshot({path:path.join(out,pre+'_attackbar.png')});await pg.context().close()}
/* 5 · recruiting */
for(const [w,h,mob] of [[1440,900,0],[1280,800,0],[390,844,1]]){const pg=await boot({width:w,height:h},mob);
 const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});const m=me();m.fame=Math.max(m.fame,60);
  const fa=freeAgents().filter(x=>m.fame>=reqFame(x)).sort((a,b)=>effOvr(b)-effOvr(a));fa.slice(0,4).forEach(g=>g.favd=true);const g=fa[0];
  MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=1;MGR.view=null;MGR_REDRAW();await W8(700);
  const rect=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return Math.round(r.width)};
  const card=document.querySelector('#mgrBody .gs98')&&document.querySelector('#mgrBody .gs98').closest('.card2');
  return {list:rect('#recTable'),card:card?Math.round(card.getBoundingClientRect().width):null,body:rect('#mgrBody'),scrollX:document.documentElement.scrollWidth-innerWidth}});
 res['rec'+w]=r;await pg.screenshot({path:path.join(out,pre+'_recruit'+w+'.png')});await pg.context().close()}
console.log(JSON.stringify(res));
/* 4 · online (mock) */
const root=path.dirname(page),file=path.basename(page);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const U='http://127.0.0.1:'+srv.address().port+'/'+file;
{const pg=await boot({width:1440,height:900},0,U);
 await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  ONL.acct=await NET.req('auth.signin',{name:'Alpha'});await NET.req('domus.create',{name:'Domus Alpha'});ONL.char=await NET.req('char.create',{name:'Alpha the Bold',cls:'hero'});
  try{onlineOpen()}catch(e){}await W8(800);
  /* second house hosts one Custom + one Ranked room through the mock (switch account id in sessionStorage is per window; use the same account twice is refused, so create two as the same host in sequence) */
  ONL.lobbies=await NET.req('lobby.list',{});ONL.tab='lobby';onlRedraw();await W8(300)});
 await pg.screenshot({path:path.join(out,pre+'_lobby_empty.png')});
 await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=await NET.req('lobby.quick',{ev:'democritus',ranked:true}).catch(e=>String(e.message||e));ONL.lobbies=await NET.req('lobby.list',{});ONL.tab='lobby';onlRedraw();await W8(500)});
 await pg.screenshot({path:path.join(out,pre+'_lobby_room.png')});
 await pg.evaluate(async()=>{ONL.tab='play';onlRedraw();await new Promise(r=>setTimeout(r,500))});await pg.screenshot({path:path.join(out,pre+'_play.png')});
 await pg.context().close()}
srv.close();await b.close()})();
