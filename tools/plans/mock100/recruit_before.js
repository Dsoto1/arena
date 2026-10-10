/* BEFORE shots of today's Manager "Your ludus" + the room banners (tile art): node tools/plans/mock100/before.js flavius-arena.html */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:W>500?900:844},deviceScaleFactor:W>500?1:2});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';
 for(let i=0;i<2;i++){try{const w=W_();w.night&&w.night.bouts.forEach(x=>x.done=true);await endWeek();await W8(300)}catch(e){console.log('ew',e)}}
 for(let k=0;k<6&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(300)}menuHide();openManager('ludus');await W8(1200);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(900);
 const W2=W_();
 return {wk:W2.week,ck:weekChecklist().map(x=>(x.done?'✓':'·')+x.ic+' '+x.txt.replace(/<[^>]+>/g,'')),
  desk:(typeof deskItems99==='function'?deskItems99():[]).map(x=>JSON.stringify({ic:x.ic,t:(x.line||x.txt||'').replace(/<[^>]+>/g,'').slice(0,140),btn:(x.btn||'').replace(/<[^>]+>/g,'').slice(0,60),tier:x.tier})),
  sections:[...document.querySelectorAll('#mgrBody .sect, #mgrBody h3, #mgrBody h4')].map(e=>e.textContent.trim().slice(0,60)),
  ros:rosterOf(me()).map(g=>g.name+' · '+g.cls+' · '+Math.round(effOvr(g))),ludus:me().ludus,city:W2.night&&W2.night.city,
  bouts:W2.night&&W2.night.bouts.map(x=>x.tier+' '+(EVENTS[x.ev]||{}).n+' '+x.ents.length)}});
if(W===1440)fs.writeFileSync(out+'/before_info.json',JSON.stringify(info,null,1));
await pg.screenshot({path:out+`/before_ludus_${W}.png`});
if(W>500){const tall=await pg.evaluate(()=>{const e=document.getElementById('mgrBody');return e?e.scrollHeight:0});
 await pg.setViewportSize({width:1440,height:Math.min(3200,tall+200)});await pg.waitForTimeout(500);await pg.screenshot({path:out+`/before_ludus_1440_full.png`});
 await pg.setViewportSize({width:1440,height:900});
 /* the room banners as standalone SVG files (tile art = crops of these) */
 const svgs=await pg.evaluate(()=>{const o={};for(const k of ['ludus','roster','recruit','night','news','league','trophy','me','sched','exch','imp'])o[k]=roomScene73(k);
  try{o.yard=roomScene('yard')}catch(e){}try{o.infirm=roomScene('infirm')}catch(e){}try{o.armory=armoryScene96()}catch(e){}
  try{o.city=cityScene75(W_().night.city)}catch(e){} return o});
 fs.mkdirSync(out+'/img',{recursive:true});
 for(const [k,s] of Object.entries(svgs)){if(!s)continue;let t=s;if(!/xmlns=/.test(t))t=t.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');fs.writeFileSync(out+`/img/scene_${k}.svg`,t)}
 /* every Manager tab, to see the live banners */
 for(const t of ['roster','practice','infirm','me','news','night']){await pg.evaluate(t=>{MGR.tab=t;MGR.view=null;MGR_REDRAW()},t);await pg.waitForTimeout(700);
  const hd=await pg.$('#mgrBody .roomhd');if(hd)await hd.screenshot({path:out+`/img/banner_${t}.png`})}
}else{await pg.screenshot({path:out+`/before_ludus_390_full.png`,fullPage:true})}
console.log(W,'ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();
