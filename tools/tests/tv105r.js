/* tv105r — v1.05 B58 (381-v105seed): the League table shows each house's Superbus seed from week 9 (po104Seeds itself; Sica "—"; seeds 1-4 marked as
   a rest week), the # header carries the tie-break order, the Consilium letter carries its week, and the Match Week banner chip equals the column;
   forged week-10 table with Sica above the player; kill switch flavius_v105seedoff. SHOTDIR=<dir> also saves screenshots (never committed). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105seedoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const mgr=async pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    window.W8=W8;window.ENS=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager(MGR.tab||'ludus');await W8(900)}};
    window.SIMS=async()=>{const w=W_();for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k)};
    window.PW=async(keep,pre)=>{const w=W_(),pm=me();if(!keep)for(const g of rosterOf(pm)){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
      if(w.special&&!w.special.done)await specAutoRun();await SIMS();if(pre)pre();
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(150);return rr};
    window.TBL=()=>JSON.stringify(W_().mgrs.map(m=>{const s=msp(m);return [m.id,s.pts,s.w||0,s.ev||0]}));
    window.FIT=n=>{const w=W_(),pm=me();const A=[];for(let i=0;i<n;i++){const g=genGlad({ovr:64+i});g.contract={mgr:pm.id,wage:3,weeks:30,since:w.week};w.glads.push(g);A.push(g)}return A};
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('ludus');await W8(600);MGR.view=null});
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));await b.close();process.exit(1)}};
const SD=process.env.SHOTDIR;
const forge=()=>{const w=W_(),pm=me();w.week=10;w.pj104=0;w.po104=null;if(w.night)w.night.po104=undefined;
  if(!w.mgrs.some(m=>m.sica)&&typeof sicaEnsure==='function')sicaEnsure(w);const sica=w.mgrs.find(m=>m.sica);
  const H=w.mgrs.filter(m=>!m.isPlayer&&!m.sica&&!m.dead);
  for(const m of w.mgrs){const s=msp(m);s.pts=0;s.w=0;s.b=0}
  const set=(m,p,wn,bt,f)=>{const s=msp(m);s.pts=p;s.w=wn;s.b=bt;m.fame=f};
  if(sica)set(sica,15,5,8,90);H.forEach((m,i)=>set(m,i<5?9:Math.max(0,8-i),4,8,50-i));set(pm,9,1,8,5);return {sica:sica&&sica.id,pm:pm.id}};
const read=()=>{const w=W_();const rows=[...document.querySelectorAll('.wd100lgt .wd100r')].map(r=>({id:r.dataset.wd100h,place:r.querySelector('.pl').textContent.trim(),sd:r.querySelector('.sd105')?r.querySelector('.sd105').textContent.trim():null,ttl:r.querySelector('.sd105')?r.querySelector('.sd105').title:''}));
  const hd=document.querySelector('.wd100lgt .wd100rh');return {rows,hdr:hd?hd.textContent.trim():'',tie:hd?[...hd.querySelectorAll('[title]')].map(x=>x.title).join('|'):'',seeds:po104Seeds(w).slice(),ow:document.documentElement.scrollWidth,iw:innerWidth}};
const pg=await open(false);await mgr(pg);
out.f=await ev(pg,forge);
const show=async(p,tag)=>{await p.evaluate(async()=>{await ENS();MGR.tab='league';MGR.view=null;MGR_REDRAW();await W8(900)});if(SD)await p.screenshot({path:SD+'/'+tag+'.png'})};
await show(pg,'league-wk10-1440');
out.r=await pg.evaluate(read);
{const R=out.r,f=out.f;const col=R.rows.map(x=>x.sd);
  ok(R.rows.length>=12&&R.rows.every(x=>x.sd!==null),'every row has a seed cell');
  const expect=R.rows.map(x=>{if(x.id===f.sica)return '—';const s=R.seeds.indexOf('m:'+x.id)+1;return s?String(s):''});
  ok(JSON.stringify(col)===JSON.stringify(expect),'the seed column equals po104Seeds '+JSON.stringify([col,expect]));
  const sr=R.rows.find(x=>x.id===f.sica);ok(sr&&sr.sd==='—'&&/no seed/.test(sr.ttl)&&R.rows.indexOf(sr)===0,'Sica shows — and sits first '+JSON.stringify(sr));
  const pr=R.rows.findIndex(x=>x.id===f.pm);ok(pr>=0&&R.rows[pr].place!==R.rows[pr].sd&&R.rows[pr].sd!=='','the player: table place differs from seed '+JSON.stringify(R.rows[pr]));
  ok(/Ties: points, then win rate, then fame/.test(R.tie),'header tooltip carries the tie-break order '+R.tie);
  ok(await pg.evaluate(()=>[...document.querySelectorAll('.wd100r .sd105.rest')].map(x=>x.textContent).sort().join()==='1,2,3,4'),'seeds 1-4 marked as a rest week');
  ok(R.ow<=R.iw+1,'no horizontal page scroll (1440)')}
/* the letter: dated, and gone at the week's end */
out.L=await ev(pg,()=>{const w=W_();w.letters=[];w.pj104=0;pj104Send(w);const L=(w.letters||[]).find(x=>/^pj104-/.test(x.key));return L?{title:L.title,body:L.body.slice(0,200),until:L.until,wk:L.wk,week:w.week}:{dbg:[w104mLive()?1:0,cal104New(w),wkOf(w.week),!!po104P(w),JSON.stringify(pj104Build(w)),w.pj104,w.season,w.dead]}});
ok(out.L&&/after week 9/.test(out.L.title)&&/After week 9/.test(out.L.body)&&out.L.until===out.L.week,'the Consilium letter carries its week and files for that week '+JSON.stringify(out.L));
/* the banner chip equals the column in the drawn playoffs */
out.chip=await ev(pg,()=>{const w=W_(),pm=me();w.po104=po104New(w);w.night=w.night||{bouts:[]};w.night.po104='r1';const html=mw105PoChip(w,{bouts:[]});const m=/seed #(\d+)/.exec(html);return {chip:m?+m[1]:0,real:w.po104.seeds.indexOf('m:'+pm.id)+1,live:po104Seeds(w).indexOf('m:'+pm.id)+1}});
ok(out.chip.chip>0&&out.chip.chip===out.chip.real&&out.chip.real===out.chip.live,'the banner chip equals the seed '+JSON.stringify(out.chip));
await show(pg,'league-playoff-1440');
out.r2=await pg.evaluate(read);
ok(out.r2.rows.every(x=>x.sd!==null)&&out.r2.rows.find(x=>x.id===out.f.pm).sd===String(out.chip.chip),'the playoff-week column shows the real seeds and matches the chip '+JSON.stringify(out.r2.rows.find(x=>x.id===out.f.pm)));
/* 390 px */
await pg.close();const p2=await open(false,{width:390,height:844});await mgr(p2);await ev(p2,forge);
await show(p2,'league-wk10-390');out.r3=await p2.evaluate(read);
ok(out.r3.rows.every(x=>x.sd!==null)&&out.r3.ow<=out.r3.iw+1,'390 px: the seed column is there, no page scroll '+out.r3.ow+'/'+out.r3.iw);
await ev(p2,()=>{const w=W_();w.po104=po104New(w);w.night=w.night||{bouts:[]};w.night.po104='r1'});await show(p2,'league-playoff-390');
/* kill switch */
await p2.close();const p3=await open(true);await mgr(p3);await ev(p3,forge);await show(p3,'off');
out.off=await p3.evaluate(()=>({n:document.querySelectorAll('.wd100r .sd105').length,rows:document.querySelectorAll('.wd100r').length}));
ok(out.off.rows>=12&&out.off.n===0,'kill switch: no seed column '+JSON.stringify(out.off));
console.log(JSON.stringify(out,null,1).slice(0,2500));
console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISS',JSON.stringify(miss,null,1));await b.close();process.exit(1)}
await b.close();process.exit(errs.length?1:0)})();
