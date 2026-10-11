/* v0.97 bout tracker (242-v96bt): the sword mark never overlaps the day/bout/result text, in every state, at 2000/1440/390 px.
   Shots go to tools/plans/bt96 when BTSHOTS=1 (or $SHOTS). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const SH=process.env.BTSHOTS?'tools/plans/bt96':process.env.SHOTS;
for(const W of [2000,1440,390]){
const pg=await b.newPage({viewport:{width:W,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_any100off','1')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='night';MGR_REDRAW();await W8(600)});
for(const k of ['fresh','mine','won','lost','dead','noentry','bye']){
 const r=await pg.evaluate(async(k)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),n=w.night,g=rosterOf(me())[0];
  n.bye=false;n.bouts.forEach(x=>{x.done=false;x.res=null;x.bets=x.bets||[]});g.alive=true;
  if(k==='mine')n.bouts[0].ents[0]=g.id;
  if(k==='won'){n.bouts[0].ents[0]=g.id;n.bouts[0].done=true;n.bouts[0].res={rows:[],lines:[],turns:5,winners:[g.id]}}
  if(k==='lost'){n.bouts[0].ents[0]=g.id;n.bouts[0].done=true;n.bouts[0].res={rows:[],lines:[],turns:5,winners:['x']};n.bouts[1].done=true;n.bouts[1].res={rows:[],lines:[],turns:5,winners:['y']}}
  if(k==='dead'){n.bouts.forEach(x=>{x.done=true;x.res={rows:[],lines:[],turns:5,winners:['z']}});n.bouts[2].ents[0]=g.id;g.alive=false}
  if(k==='noentry'){const mine=new Set(rosterOf(me()).map(q=>q.id));n.bouts.forEach(x=>{x.ents=x.ents.filter(id=>!mine.has(id))})}
  if(k==='bye')n.bye=true;
  MGR_REDRAW();await W8(500);
  const wr=document.querySelector('#mgrBody .bt85w');if(!wr)return {none:true};
  const R=e=>e.getBoundingClientRect();const hit=(a,c)=>a.left<c.right-0.5&&c.left<a.right-0.5&&a.top<c.bottom-0.5&&c.top<a.bottom-0.5;
  let chips=0,bad=0;
  wr.querySelectorAll('.bt85').forEach(c=>{chips++;const x=c.querySelector('svg.bt85x');const cr=R(c);
   c.querySelectorAll('span.bt85d,b,span.bt85m').forEach(t=>{const tr=R(t);if(!tr.width||getComputedStyle(t).display==='none')return;if(x&&hit(R(x),tr))bad++;if(tr.right>cr.right+1||tr.left<cr.left-1)bad++})});
  return {chips,bad,svgs:wr.querySelectorAll('svg.bt85x').length,wrRight:R(wr).right,vw:innerWidth,sw:document.documentElement.scrollWidth}},k);
 if(k==='bye'){ok(r.none,'bye W'+W+' no tracker');continue}
 ok(!r.none&&r.chips===3,k+' W'+W+' 3 chips');ok(r.bad===0,k+' W'+W+' overlap/overflow '+JSON.stringify(r));ok(r.wrRight<=r.vw+1&&r.sw<=r.vw+1,k+' W'+W+' fits '+JSON.stringify(r));
 if(SH){const h=await pg.$('#mgrBody .bt85w');if(h)await h.screenshot({path:SH+'/bt_'+k+'_'+W+'.png'});if(k==='won')await pg.screenshot({path:SH+'/banner_won_'+W+'.png',clip:{x:0,y:0,width:W,height:340}})}
}
await pg.close()}
console.log(miss.length?'FAIL\n'+miss.join('\n'):'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
