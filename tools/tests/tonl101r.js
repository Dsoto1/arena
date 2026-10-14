/* v1.01 TWO DOMUS RECORDS (111-onlcore "v1.01 DOMUS RECORDS" + 324-v101domrec) through the MOCK server, one window:
   a Ranked and a Custom seat settle through the mock's own ONLC.domusNote path -> the house's top-level record is the Ranked one, D.cu the Unranked one;
   domus.get / house.card carry cu; the Domus banner, the house card and the visit page print the two lines (⚔ Ranked / 🎭 Unranked); the ⓘ note shows for a
   house that had bouts before the split. ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0,{timeout:90000});
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|acct)/.test(k))localStorage.removeItem(k);try{sessionStorage.clear()}catch(e){}});await P.reload({timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const info=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Ann Realname',google:1});await NET.req('lanista.name',{name:'Marcus Recordus'});
  const D=(await NET.req('domus.create',{name:'Recordii'})).domus;await NET.req('char.create',{name:'Recordus Ferox',cls:'hero'});return {id:ONL.acct.id,dom:D.id}});
/* an old house (bouts before the split) and a fresh one */
const w0=await P.evaluate(([dom])=>{const w=mockLoad();const D=w.domus82[dom];D.bouts=10;D.wins=4;D.survived=6;D.fallen=2;D.lifeCF=100;delete D.cu;delete D.split101;mockSave(w);return 1},[info.dom]);
const row0=await P.evaluate(async()=>(await NET.req('domus.get',{})).domus);
ok(row0.cu&&row0.cu.bouts===0&&!row0.split101,'before any write: zero unranked, no split time');
/* settle one Ranked (won, +20 CF) and two Custom seats (won +7, fell) through the mock's own domusNote */
await P.evaluate(([dom])=>{const w=mockLoad();const D=w.domus82[dom];ONLC.domusNote(D,{won:true},{cf:20},true);ONLC.domusNote(D,{won:true},{cf:7},false);ONLC.domusNote(D,{won:false},{cf:0,died:true},false);mockSave(w)},[info.dom]);
const row=await P.evaluate(async()=>{const r=await NET.req('domus.get',{});return r.domus});
ok(row.bouts===11&&row.wins===5&&row.survived===7&&row.lifeCF===120&&row.fallen===2,'ranked record = old totals + the ranked seat: '+JSON.stringify([row.bouts,row.wins,row.survived,row.fallen,row.lifeCF]));
ok(JSON.stringify(row.cu)===JSON.stringify({bouts:2,wins:1,lifeCF:7,survived:1,fallen:1}),'unranked record: '+JSON.stringify(row.cu));
ok(row.split101>0&&row.pre101===10,'split time + pre-split bouts: '+row.split101+' '+row.pre101);
/* the UI */
const ui=await P.evaluate(async()=>{ONL.domus=(await NET.req('domus.get',{})).domus;const ban=d89Banner();const hc=hc98HTML({domus:ONL.domus,glads:[],last:[],fallen:2,best:'tiro'});
  const t=h=>{const d=document.createElement('div');d.innerHTML=h;return d};const B=t(ban),H=t(hc);
  return {ban:(B.querySelector('.db89-rec')||{}).textContent||'',hc:(H.querySelector('.hc98-rec')||{}).textContent||'',banI:!!B.querySelector('.dr101i'),hcI:!!H.querySelector('.dr101i'),
    lines:B.querySelectorAll('.dr101l').length}});
const sp=s=>s.replace(/\s+/g,' ');
ok(/Ranked:\s*11 bouts · 5 wins · 7 survived · 2 fallen · .*120/.test(sp(ui.ban)),'Domus banner Ranked line: '+sp(ui.ban));
ok(/Unranked:\s*2 bouts · 1 wins · 1 survived · 1 fallen · .*7/.test(sp(ui.ban)),'Domus banner Unranked line: '+sp(ui.ban));
ok(ui.lines===2,'two lines, not more: '+ui.lines);ok(ui.banI&&ui.hcI,'the ⓘ note shows for a house with earlier bouts');
ok(/Ranked:\s*11 bouts/.test(sp(ui.hc))&&/Unranked:\s*2 bouts/.test(sp(ui.hc)),'house card lines: '+sp(ui.hc));
/* the visit page (own record via V89L.visit) */
const vis=await P.evaluate(()=>{V89L.visit={domus:ONL.domus,glads:[],mine:true,now:{st:'free'},lan:{n:'Marcus Recordus'},fid:'FID-AAAAAA',inv:''};const d=document.createElement('div');d.innerHTML=l89VisitHTML();return (d.querySelector('.db89-rec')||{}).textContent||''});
ok(/Ranked:/.test(vis)&&/Unranked:/.test(vis),'visit page prints both: '+sp(vis));
/* a house founded after the split: no ⓘ */
const ni=await P.evaluate(()=>{const D={...ONL.domus,pre101:0};const d=document.createElement('div');d.innerHTML=hc98HTML({domus:D,glads:[],last:[],best:'tiro'});return !!d.querySelector('.dr101i')});
ok(!ni,'no ⓘ when the house had no bouts before the split');
if(miss.length||errs.length){console.log('FAIL',miss,'ERRS',errs);process.exit(1)}console.log('tonl101r: ok');console.log('ERRS []');await b.close();srv.close()})().catch(e=>{console.error(e);process.exit(1)});
