/* Art for the any-event mock (event cards + fighter faces): node tools/plans/mock100/anyevent_art.js flavius-arena.html */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{const b=await chromium.launch();const out=__dirname+'/anyevent_img';fs.mkdirSync(out,{recursive:true});
const pg=await b.newPage({viewport:{width:1200,height:900},deviceScaleFactor:2});
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const names=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'pre',key:MGR_PRE[0].key});for(let k=0;k<6&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(300)}menuHide();
 const d=document.createElement('div');d.id='aeArt';d.style.cssText='position:fixed;left:0;top:0;z-index:99999;background:#1f1711;display:flex;flex-wrap:wrap;gap:12px;padding:10px;width:1200px';
 let h='';for(const e of ['egidious','democritus','cassian','juggernaut','familia','goldenEagle','orpheus','gauntlet','naumachia','chariot'])h+=`<div class="aeC" data-k="ev_${e}" style="width:84px">${cardHTML('e:'+e,'sm')}</div>`;
 const ros=rosterOf(me());const n=[];ros.forEach((g,i)=>{h+=`<div class="aeC" data-k="me_${i}" style="display:inline-block;line-height:0">${gArt(g,'md')}</div>`;n.push(g.name+'|'+g.cls+'|'+Math.round(effOvr(g)))});
 const riv=W_().glads.filter(g=>g.alive&&g.contract&&!mgrById(g.contract.mgr).isPlayer).slice(0,10);riv.forEach((g,i)=>{h+=`<div class="aeC" data-k="rv_${i}" style="display:inline-block;line-height:0">${gArt(g,'md')}</div>`;n.push('R '+g.name+'|'+g.cls+'|'+Math.round(effOvr(g))+'|'+mgrById(g.contract.mgr).ludus)});
 d.innerHTML=h;document.body.appendChild(d);await W8(1500);return n});
fs.writeFileSync(out+'/names.txt',names.join('\n'));
for(const el of await pg.$$('#aeArt .aeC')){const k=await el.getAttribute('data-k');await el.screenshot({path:out+'/'+k+'.png'})}
await b.close()})();
