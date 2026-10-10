/* clean city square shot + townsfolk positions (bubbles_city.json) for the CROWD variant */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');const OUT=__dirname;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(__dirname,'../../../flavius-arena.html'));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}SETTINGS.cityChatter=false;openCitySquare(1,{});await W8(5000)});
await pg.evaluate(()=>{for(const n of CITY.npcs)n.say=null;CITY.speed=0;const t=document.querySelector('#cityOv .toast,#cityOv [class*=toast]');if(t)t.remove()});
await pg.waitForTimeout(800);
const o=await pg.evaluate(()=>{const cv=document.querySelector('#cityOv canvas');const r=cv.getBoundingClientRect();return {cv:{x:r.x,y:r.y,w:r.width,h:r.height},npcs:CITY.npcs.filter(n=>n._x!=null).map(n=>({x:n._x+r.x,y:n._y+r.y,name:n.name||''})),me:CITY.player&&{x:CITY.player._x+r.x,y:CITY.player._y+r.y}}});
await pg.screenshot({path:path.join(OUT,'bubbles_city_clean.png')});fs.writeFileSync(path.join(OUT,'bubbles_city.json'),JSON.stringify(o));console.log(o.npcs.length);await b.close()})();
