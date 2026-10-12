/* v1.0 beasts in matches (312-v100beasts) — screenshots: node tools/plans/beasts100/shots.js [page] → tools/plans/beasts100/*.png
   every system beast on the board (idle, ON vs the kill switch), zoomed in, poses (walk / attack / hit / die), the spider swarm,
   the Rete, Fortuna's Bounty. Served over http (python3 -m http.server) so the sheets decode like on the site. */
const {chromium}=require('playwright');const path=require('path');const {spawn}=require('child_process');
const ROOT=path.resolve(__dirname,'../../..');const OUT=__dirname;const PORT=8852;const page=process.argv[2]||'flavius-arena.html';
const SETUP=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:4242,seats:[{cls:'hero'},{cls:'soldier'},{cls:'royalty'},{cls:'venatore'}],opts:{spect:0}});
  await W8(1500);while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}
  SPEED='slow';
  S.npcs=[];const put=(t,k,r,c)=>{const n=mkNPC(t,k,r,c);S.npcs.push(n);return n};
  for(const p of S.players){p.r=12;p.c=S.players.indexOf(p)*3}
  put('lion','Leo',2,2);put('lion','Leaena',2,6);put('bear','Ursa',2,10);put('wolf','Valencia',5,2);put('wolf','Moechus',5,5);put('snake','Glykon',5,8);put('snake','Arenosus',5,11);
  put('zora','Zora',8,2);put('tholo','Tholo',8,6);put('commodus','Commodus',8,10);put('bear','Brutum',10,6);
  render();draw();await W8(3000);draw();await W8(300)};
(async()=>{const srv=spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});await new Promise(r=>setTimeout(r,700));
const b=await chromium.launch();try{
for(const off of [0,1]){const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_beasts100off','1')},off);
  await pg.goto(`http://127.0.0.1:${PORT}/${page}`,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  await pg.evaluate(SETUP);
  await pg.screenshot({path:path.join(OUT,off?'board_off.png':'board_on.png')});
  if(!off){
    /* poses: walk / attack / hit / die, caught mid-run, zoomed on the middle */
    await pg.evaluate(async()=>{CAM.z=1.8;draw();await new Promise(r=>setTimeout(r,800));draw()});
    const shot=async(name,fn,wait)=>{await pg.evaluate(fn);await pg.waitForTimeout(wait);await pg.screenshot({path:path.join(OUT,name+'.png'),clip:{x:16,y:68,width:972,height:612}})};
    await shot('pose_attack',()=>{for(const n of S.npcs)BST100.anim.get(n)&&bst100Act(n,'attack')},300);
    await shot('pose_hit',()=>{for(const n of S.npcs)bst100Act(n,'hit')},150);
    await shot('pose_walk',()=>{for(const n of S.npcs){BST100.walking.add(n)}draw()},400);
    await pg.evaluate(()=>{BST100.walking.clear();draw()});
    await shot('pose_die',()=>{for(const n of S.npcs.slice(0,6)){n.alive=false;bst100Die(n)}draw()},700);
    await pg.evaluate(()=>{for(const n of S.npcs)n.alive=true;BST100.ghosts=[];draw()});
    await shot('fx_spiders',()=>{hitFlash(S.npcs[8].r,S.npcs[8].c,'spiders');hitFlash(S.players[1].r,S.players[1].c,'spiders')},900);
    await shot('fx_rete_flight',()=>{S.cur=0;S.players[0].r=11;S.players[0].c=4;S.npcs.find(n=>n.key==='Tholo').netted=true;bst100NetScan()},450);
    await shot('fx_rete_wrapped',()=>{draw()},900);
    await shot('fx_fortuna',()=>{const p=S.players[0];BST100.fortune=2;for(let i=0;i<2;i++){placeFloor('offer',drawOffer(),6+i,6+i*2)}draw()},420);
    await shot('fx_fortuna_land',()=>{draw()},1200);
    await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));CAM.z=2.2;try{draw()}catch(e){}await W8(1500);draw()});
    await pg.screenshot({path:path.join(OUT,'zoom_on.png')});
    const st=await pg.evaluate(()=>({stats:BST100.stats,last:[...BST100.last.values()].map(x=>x.k+':'+x.pose)}));console.log(JSON.stringify(st));
  }
  console.log(off?'OFF':'ON','errs',JSON.stringify(errs.slice(0,5)));await pg.close()}
}finally{await b.close();srv.kill()}})();
