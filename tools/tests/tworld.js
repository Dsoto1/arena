const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);
const r=await pg.evaluate(()=>{const o=[];for(let wk=5;wk<=9;wk++){const k='e:1:'+wk;const ev=worldEvents(k);const wx=weatherCells(k);
 o.push(`wk${wk} n=${ev.length} `+ev.slice(0,4).map(e=>`${e.city}:${e.n.slice(0,14)}[${e.tag},s${e.sev}]`).join(' | ')+` || wx ${wx.map(c=>c.t+'@'+c.x.toFixed(2)).join(',')}`)}
 const counts=[];for(let T=1;T<=48;T++)counts.push(worldEvents('e:'+(Math.floor((T-1)/12)+1)+':'+((T-1)%12+1)).length);
 return {o,key:worldKey(),min:Math.min(...counts),max:Math.max(...counts),avg:(counts.reduce((a,b)=>a+b)/48).toFixed(1),html:imperiumHTML().length}});
console.log(r.o.join('\n'));console.log(r.key,r.min,r.max,r.avg,r.html,errs);await b.close()})();
