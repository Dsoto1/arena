/* v0.91 the online server's version (196-v91srv): the chip on the Online screen (practice / up to date / older), the friendly
   message for a request the server does not know, the mock's hello carries the expected build, srvstamp's files agree. */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:850}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));onlineOpen();for(let i=0;i<60&&!document.getElementById('srv91');i++)await W8(100);
  const h=await NET.req('hello',{});const o={mockBuild:h.build,expect:SRV_EXPECT91,t1:(document.getElementById('srv91')||{}).textContent||''};
  SRV91.mode='aws';SRV91.build={v:'0.89',hash:'x'};srv91Chip();o.t2=document.getElementById('srv91').textContent;o.c2=document.getElementById('srv91').className;
  SRV91.build=null;srv91Chip();o.t3=document.getElementById('srv91').textContent;
  SRV91.build={...SRV_EXPECT91};srv91Chip();o.t4=document.getElementById('srv91').textContent;o.c4=document.getElementById('srv91').className;
  try{await NET.req('nope.route91',{})}catch(e){o.e=e.message}o.t5=document.getElementById('srv91').textContent;return o});
const B=JSON.parse(fs.readFileSync(path.join(path.dirname(page),'server/src/build.json'),'utf8'));
ok(r.expect&&r.expect.hash===B.hash,'0 the page expects server/src/build.json');ok(r.mockBuild&&r.mockBuild.hash===B.hash,'1 the mock hello carries the build');
ok(/practice/i.test(r.t1),'2 practice chip: '+r.t1);ok(/0\.89/.test(r.t2)&&/old/.test(r.c2),'3 an older server warns: '+r.t2);ok(/older/i.test(r.t3),'4 no build = older');
ok(r.t4==='Server v'+B.v&&/ok/.test(r.c4),'5 up to date: '+r.t4);ok(/older than this page/.test(r.e||''),'6 friendly unknown request: '+r.e);ok(/nope\.route91/.test(r.t5),'7 the chip names the missing request');
console.log(JSON.stringify(r));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
