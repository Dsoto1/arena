/* evlist.js — lists EVENTS keys with their seat/team fields (balance pass helper). Usage: node tools/balance100/evlist.js flavius-arena.html */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
console.log(JSON.stringify(await pg.evaluate(()=>Object.keys(EVENTS).map(k=>{const e=EVENTS[k];const o={k,n:e.n};for(const x of Object.keys(e))if(typeof e[x]!=='object'&&typeof e[x]!=='function'&&x!=='n'&&x!=='d'&&x!=='blurb')o[x]=e[x];return o}))));
await b.close()})();
