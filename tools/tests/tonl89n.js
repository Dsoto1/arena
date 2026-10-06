/* v0.89 N · FLAVIUS'S VAULT (182-v89vault + 111-onlcore "v0.89 N") through the MOCK server: a fresh world's Auction tab shows three lots, each
   "From Flavius's vault" with an owner history of the old houses (Virgilante, Zora350, SrgtSlaughta, Duckio, Sotonius), the same lots as the
   shared rules draw for the week; the five names are refused for a real house / lanista; the ⓘ odds card names the vault; a bid escrows as
   usual; an unsold vault lot goes back to the vault (never the chest). SHOT=<dir> saves v89N_auction.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0,{timeout:90000});
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|acct)/.test(k))localStorage.removeItem(k);try{sessionStorage.clear()}catch(e){}});await P.reload({timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const peek=(fn,arg)=>P.evaluate(([fn,arg])=>(0,eval)('('+fn+')')(mockLoad(),arg),[fn.toString(),arg]);
const idle=()=>P.waitForFunction(()=>!ONL.busy,null,{timeout:15000}).then(()=>W(250)).catch(()=>{});
const rej=(fn,arg)=>P.evaluate(async([fn,arg])=>{try{await (0,eval)('('+fn+')')(arg);return null}catch(e){return {code:e.code||null,msg:e.message}}},[fn.toString(),arg]);
const LANS=['Virgilante','Zora350','SrgtSlaughta','Duckio','Sotonius'];

/* Ann: a lanista; the old houses' names are refused */
await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Annabel Realname',google:1})});
for(const n of ['Duckio','Sotonius','Virgilante'])ok((await rej(n=>NET.req('lanista.name',{name:n}),n)||{}).code==='lname','lanista name refused: '+n);
await P.evaluate(()=>NET.req('lanista.name',{name:'Marcus Aurelius'}));
for(const n of ['House Sotonius','Anas Ferox','Lanius','Zora350'])ok((await rej(n=>NET.req('domus.create',{name:n}),n)||{}).code==='domus_name','house name refused: '+n);
const ann=await P.evaluate(async()=>{ONL.domus=(await NET.req('domus.create',{name:'Annii'})).domus;ONL.needDomus=false;const c=await NET.req('char.create',{name:'Anna Fortis',cls:'slave'});return {id:ONL.acct.id,dom:ONL.domus.id,ch:c.id}});
await world((w,ch)=>{const c=w.chars[ch];c.glory=600;c.wallet=20000},ann.ch);
await P.evaluate(async()=>{await onlRefresh();onlineOpen('play');await new Promise(r=>setTimeout(r,700))});await idle();
await P.click('#onl .onl-rail [data-v="auction"]');await idle();await W(400);await P.evaluate(()=>{ONL84.aucAt=0;onlRedraw()});await W(700);await P.evaluate(()=>onlRedraw());await idle();

/* the tab: three vault lots with histories */
const st=await P.evaluate(LANS=>{const lots=[...document.querySelectorAll('#onl .au84-grid:not(.past) .au84-lot')];
  return {n:lots.length,vault:lots.filter(l=>l.querySelector('.vlt89')).length,hist:lots.map(l=>{const h=l.querySelector('.hist83');return h?h.textContent.replace(/\s+/g,' '):''}),
    lans:lots.map(l=>LANS.filter(n=>l.textContent.includes(n)).length),empty:/No lots this week/.test(document.getElementById('onl').textContent),
    ids:(ONL84.auc&&ONL84.auc.lots||[]).map(x=>[x.id,x.item,x.n])}},LANS);
ok(st.n===6,'six lots on a fresh world (v0.91): '+st.n);ok(st.vault===6,'each from Flavius’s vault');ok(!st.empty,'no "no lots" line');
ok(st.hist.every(h=>/Worn by .+ of House .+ · (fell|slain) at .+, (Ranked|Custom), week \d+/.test(h)),'histories: '+JSON.stringify(st.hist));ok(st.lans.every(x=>x>=1),'the old lanistas named '+JSON.stringify(st.lans));
const same=await P.evaluate(ids=>{const S=ONLC.seasonAt(mockT84());const w=mockLoad();/* v0.91 the week's plan (guarantees) */const exp=[];const tW=[],tA=[];ONLC.aucPlan91([],ONLC.AUC_LOTS,[],[]).forEach((o,j)=>{const P=ONLC.vaultLot89(S.key,j+1,onlCatalog(),tW,tA,{at:S.start,...o});if(P.pc.w.uq)(P.kind==='a'?tA:tW).push(P.pc.w.uq);exp.push(P)});return ids.every(([id,item,n])=>{const k=+id.split('#')[1];const P=exp[k-1];return P.item===item&&P.pc.w.n===n})},st.ids);
ok(same,'the same lots as the shared rules draw for the week');
/* the odds card */
const od=await P.evaluate(()=>{const h=odds89HTML();return /Flavius’s vault/.test(h)&&/Rare 60%/.test(h)&&/Epic 32%/.test(h)&&/Legendary 8%/.test(h)});ok(od,'the ⓘ odds card names the vault and its split');
if(SHOT){await P.evaluate(()=>{const g=document.querySelector('#onl .au84-grid');if(g)g.scrollIntoView({block:'start'})});await W(300);await P.screenshot({path:path.join(SHOT,'v89N_auction.png')})}
/* a bid escrows as usual */
const L1=st.ids[0][0];await P.click(`#onl [data-onl84="bid"][data-v="${L1}"]`);await idle();await W(400);
const bid=await peek((w,[ch,id])=>{const c=w.chars[ch];const X=Object.values(w.auc84).flatMap(a=>a.lots).find(x=>x.id===id);return {wallet:c.wallet,lead:!!(X&&X.bid&&X.bid.char===ch),min:X&&X.min}},[ann.ch,L1]);
ok(bid.lead&&bid.wallet===20000-bid.min,'the bid leads, the coin in escrow '+JSON.stringify(bid));
/* the week ends: the won piece is Ann's (history appended), the unsold ones go back to the vault */
await world((w)=>{for(const A of Object.values(w.auc84))for(const X of A.lots)X.ends=Date.now()-1000},null);await P.evaluate(()=>NET.req('auction.list',{}));
const end=await peek((w,[ch,id])=>{const c=w.chars[ch];const X=Object.values(w.auc84).flatMap(a=>a.lots).find(x=>x.id===id);const it=(c.gear||[]).find(g=>g===X.item);
  return {got:!!it,last:it?(ONLC.pcOf(c,it).hist.slice(-1)[0]||{}).how:null,chest:(w.chest83||[]).some(x=>/v89-/.test(x.item))}},[ann.ch,L1]);
ok(end.got&&end.last==='auction','the won vault piece is hers, history appended '+JSON.stringify(end));ok(!end.chest,'unsold vault lots never enter the chest');

console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
