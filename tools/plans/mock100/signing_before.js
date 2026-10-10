/* BEFORE shot of today's signing card (signCard73) + a large free-agent portrait for the mock: node tools/plans/mock100/signing_before.js flavius-arena.html */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const W of [1440,390]){const pg=await b.newPage({viewport:{width:W,height:W>500?900:844},deviceScaleFactor:W>500?1:2});
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'pre',key:MGR_PRE[0].key});for(let k=0;k<6&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(300)}menuHide();openManager('ludus');await W8(900);
 const w=W_();const fa=(typeof freeAgents==='function'?freeAgents():(w.gladiators||w.glads||[]).filter(x=>!x.owner))||[];const g=fa.find(x=>CLASSES[x.cls]&&!CLASSES[x.cls].custom)||rosterOf(me())[0];
 g.contract=g.contract||{wage:34,weeks:12};signCard73(g);await W8(600);
 const box=document.createElement('div');box.id='bigface';box.style.cssText='position:fixed;left:0;top:0;width:240px;height:300px;z-index:9999;background:transparent';box.innerHTML=gArt(g,'lg');document.body.appendChild(box);await W8(800);
 return {name:g.name,cls:g.cls,clsName:CLASSES[g.cls].name,color:CLASSES[g.cls].color,age:g.age,st:gStats(g),ovr:effOvr(g)}});
if(W>500){fs.writeFileSync(out+'/signing_before_info.json',JSON.stringify(info,null,1));const f=await pg.$('#bigface');await f.screenshot({path:out+'/ludus_img/sign_face.png',omitBackground:true})}
await pg.evaluate(()=>document.getElementById('bigface').remove());
await pg.screenshot({path:out+`/before_signing_${W}.png`});await pg.close()}
await b.close()})();
