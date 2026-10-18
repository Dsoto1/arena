/* tv104h — v1.04 beta 1 fixes (355-v104fixs): B22 a playoff bout takes only the houses the bracket put in it (every entry path refuses with the
   reason: 17's classic picker, 296's any100Enter / any100Classic / any100Book / any100Open, 350's reserve cover + bout menu (st95Set / r104Do),
   319's rest pulling him off, an eliminated house's pick); B21 the bracket tree (League "Superbus" view from week 9 with projected seeds, open at
   the top of Match Week in the playoffs, the finished bracket on the off-season page, no duplicate bracket buttons, phones scroll inside it);
   B23 the off-season page opens first after the final (awards + Acta buttons there); B24 the playoff Acta editions named and kept apart;
   B4 the league table survives the playoffs + the off-season on a new career; B3 Play Now's 🏛 button sits with Begin Event; kill switch
   flavius_v104soff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v106b1off','1');if(o){localStorage.setItem('flavius_v104soff','1');localStorage.setItem('flavius_v104poff','1');localStorage.setItem('flavius_v105poff2','1')}},off?1:0);
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
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));console.log(JSON.stringify(out,null,1).slice(0,6000));await b.close();process.exit(1)}};

const pg=await open(false);await mgr(pg);

/* ---- week 9: the League "Superbus" view (projected, grey), one overlay button on Match Week ---- */
out.w9=await ev(pg,async()=>{const w=W_();const r={};let g=0;while(wkOf(w.week)<9&&g++<12)if(!await PW())break;r.wk=wkOf(w.week);await ENS();
  MGR.tab='league';MGR_REDRAW();await W8(700);r.oldBtn=document.querySelectorAll('.roomhd.b73-league [data-po104="bracket"]').length;const sb=document.querySelector('.roomhd.b73-league [data-v104s="sb"]');r.sb=!!sb;
  if(sb){sb.click();await W8(600)}const bk=document.querySelector('#mgrPane .v104slg .po104bk.v104tr');r.view=!!bk;r.proj=bk?bk.dataset.po104proj:'';r.boxes=bk?bk.querySelectorAll('.v104b').length:0;
  r.grey=bk?bk.querySelectorAll('.v104e.pj').length:0;r.links=bk?bk.querySelectorAll('.v104k').length:0;r.me=bk?bk.querySelectorAll('.v104e.me').length:0;r.back=!!document.querySelector('.roomhd.b73-league [data-v104s="std"]');
  r.flags=bk?bk.querySelectorAll('.v104e .fl img').length:0;
  const bk2=document.querySelector('[data-v104s="std"]');if(bk2){bk2.click();await W8(600)}r.std=!document.querySelector('#mgrPane .v104slg');
  MGR.tab='night';MGR_REDRAW();await W8(700);r.night=document.querySelectorAll('#mgrBody [data-po104="bracket"]').length;
  po104Open();await W8(200);r.ov=!!document.querySelector('#po104br .v104tr');po104Close();return r});
ok(out.w9.wk===9&&out.w9.oldBtn===0&&out.w9.sb&&out.w9.view&&out.w9.proj==='1'&&out.w9.boxes===5&&out.w9.grey>=12&&out.w9.links===4&&out.w9.back&&out.w9.std,'B21 League Superbus view week 9 '+JSON.stringify(out.w9));
ok(out.w9.night===1&&out.w9.ov,'B21 one overlay button on Match Week weeks 9–11 + overlay tree '+JSON.stringify(out.w9));

/* ---- weeks 10, 11 → Round 1 (your house in Round 1) ---- */
out.r1=await ev(pg,async()=>{const w=W_(),pm=me();const r={};await PW();await PW();r.wk=wkOf(w.week);await SIMS();msp(pm).pts=-99;r.ok=await PW();r.ph=OFF104.phase(w);
  window.T11=TBL();const n=w.night;const M=po104MyBout(w);r.mine=!!M;const oi=M?1-M.bi:-1;const ob=n.bouts[oi];
  const fit=FIT(3);await ENS();MGR.tab='night';MGR_REDRAW();await W8(800);
  r.top=!!document.querySelector('#mgrBody .v104top .po104bk.v104tr');r.topFirst=(()=>{const a=document.querySelector('#mgrBody .v104top'),c=document.querySelector('#mgrBody .po104card');return !!(a&&c&&(a.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING))})();
  r.btns=document.querySelectorAll('#mgrBody [data-po104="bracket"]').length;r.enterBtns=document.querySelectorAll('#mgrBody .card2.bout.sb104 [data-mg="enter"],#mgrBody .card2.bout.sb104 select[id^="ent"]').length;
  r.why=[...document.querySelectorAll('#mgrBody .v104sno')].map(x=>x.textContent);
  const E=()=>JSON.stringify(n.bouts.map(b=>b.ents));const e0=E();const g=fit[0];
  /* (a) 17's classic picker, forced back onto the page */
  const host=document.querySelector('#mgrBody .card2.bout.sb104')||document.querySelector('#mgrBody');host.insertAdjacentHTML('beforeend',`<select id="ent${oi}"><option value="${g.id}" selected>x</option></select><button type="button" data-mg="enter" data-id="${oi}" id="t104h">x</button>`);
  document.getElementById('t104h').click();await W8(300);r.a=E()===e0;
  /* (b) 296's entry functions */
  const b1=any100Enter(w,oi,g.id,{mgr:pm,move:true});const b2=any100Classic(oi,g.id);const b3=any100Book(oi,g.id,null);const b4=M?any100Classic(M.bi,fit[1].id):{ok:false};
  any100Open(oi);await W8(200);r.b=!b1.ok&&!b2.ok&&!b3.ok&&!b4.ok&&E()===e0&&!document.querySelector('.any100pk')&&!(typeof ANY100!=='undefined'&&ANY100.pk);r.bwhy=[b1.why,b2.why,b4.why];
  r.why296=any100Why(w,ob,g);
  /* (c) 350's reserve cover + bout menu */
  const ros=rosterOf(pm);ros.forEach(x=>{delete x.slot95});fit[2].tm104='A';ros.filter(x=>x!==fit[2]).slice(0,3).forEach((x,i)=>{x.slot95=i+1;x.tm104='A';x.inj={until:w.week+3,label:'a cut',pen:2}});
  const f1=st95Fill(w,pm,true);r104Do(fit[1].id,'A',1);r104Do(fit[2].id,'A',2);r.c=f1===0&&E()===e0;
  /* (e) 319's rest does not pull your playoff fighter off */
  if(M){const myG=gById(n.bouts[M.bi].ents[M.j]);const k=r101OffCard(w,myG,'test');host.insertAdjacentHTML('beforeend',`<button type="button" data-rest="${myG.id}" id="t104r">r</button>`);const rw=myG.restWk;document.getElementById('t104r').click();await W8(300);r.e=k===0&&E()===e0&&myG.restWk===rw}
  r.tbl=TBL()===window.T11;
  /* the League banner keeps one Superbus button, no overlay button */
  MGR.tab='league';MGR_REDRAW();await W8(600);r.lg=document.querySelectorAll('.roomhd.b73-league .po104bb').length+':'+document.querySelectorAll('.roomhd.b73-league [data-v104s]').length;
  for(const x of document.querySelectorAll('#t104h,#t104r,#ent'+oi))x.remove();
  /* your house finishes last in its Round 1 bout (so it is out for the semifinals) */
  window.MYKEY='m:'+pm.id;window.MYBI=M?M.bi:-1;return r});
ok(out.r1.wk===11&&out.r1.ok&&out.r1.ph==='r1'&&out.r1.mine,'round 1 set '+JSON.stringify(out.r1));
ok(out.r1.top&&out.r1.topFirst&&out.r1.btns===0&&out.r1.enterBtns===0&&out.r1.why.length===2&&out.r1.why.some(t=>/chosen on the Superbus card/.test(t))&&out.r1.why.some(t=>/not in this bout/.test(t)),'B21/B22 Match Week: tree on top, no bracket buttons, reasons on the cards '+JSON.stringify(out.r1));
ok(out.r1.a&&out.r1.b&&out.r1.c&&out.r1.e&&/not in this bout/.test(out.r1.why296),'B22 every entry path refuses '+JSON.stringify(out.r1));
ok(out.r1.lg==='0:1','B21 League banner: one Superbus button '+out.r1.lg);
ok(out.r1.tbl,'B4 table unchanged in Round 1');

/* ---- Round 1 → the semifinals: your house is out ---- */
out.sf=await ev(pg,async()=>{const w=W_(),pm=me();const r={};const n0=w.night;
  r.ok=await PW(true,()=>{const b=n0.bouts[window.MYBI];if(!b||!b.res)return;const j=b.po104.k.indexOf(window.MYKEY);const gid=b.ents[j];const R=b.res.rows;const mine=R.find(x=>x.gid===gid);if(!mine)return;
    const others=R.filter(x=>x!==mine).sort((a,c)=>(a.place||99)-(c.place||99));others.forEach((x,i)=>x.place=i+1);mine.place=R.length});
  r.ph=OFF104.phase(w);const P=w.po104;r.reach=po104Reach(P,window.MYKEY);const n=w.night;
  r.whys=n.bouts.map(b=>V104S.why(w,b));const E=()=>JSON.stringify(n.bouts.map(b=>b.ents));const e0=E();
  const g=rosterOf(pm).find(x=>!x.inj)||FIT(1)[0];g.inj=null;
  /* an eliminated house cannot swap a fighter in: the card's picker + the entry functions */
  await ENS();MGR.tab='night';MGR_REDRAW();await W8(700);r.pickSel=!!document.querySelector('[data-po104pick]');
  const s=document.createElement('select');s.setAttribute('data-po104pick','');s.innerHTML=`<option value="${g.id}" selected>x</option>`;document.querySelector('#mgrBody').appendChild(s);s.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);s.remove();
  const x1=any100Enter(w,0,g.id,{mgr:pm,move:true});const x2=any100Classic(1,g.id);r.swap=E()===e0&&!x1.ok&&!x2.ok;r.x=x1.why;
  const bk=document.querySelector('#mgrBody .v104top .v104tr');r.meOut=bk?bk.querySelectorAll('.v104e.me.out').length:0;r.adv=bk?bk.querySelectorAll('.v104b:not(.fin) .v104e.adv').length:0;r.lit=bk?bk.querySelectorAll('.v104k.k1.lit').length:0;
  r.tbl=TBL()===window.T11;
  /* B24: the Round 1 edition */
  MGR.tab='paper';MGR.ak102=null;MGR_REDRAW();await W8(600);r.pager=(document.querySelector('.ak102pg > div > b')||{}).textContent||'';r.dek=(document.querySelector('.ak102dek')||{}).textContent||'';
  r.ed=(document.querySelector('.paper.ak102')||{dataset:{}}).dataset.v104ed;r.next=(document.querySelector('.ak102nw b')||{}).textContent||'';
  r.keys=(w.acta102||[]).map(x=>x.key).filter(k=>/^1\.1[12]/.test(k));return r});
ok(out.sf.ok&&out.sf.ph==='sf'&&out.sf.reach==='r1','semifinals set, your house out '+JSON.stringify(out.sf));
ok(out.sf.whys.every(t=>/out of the Superbus/.test(t))&&!out.sf.pickSel&&out.sf.swap,'B22 an eliminated house cannot enter or swap '+JSON.stringify(out.sf));
ok(out.sf.meOut>=1&&out.sf.adv===4&&out.sf.lit>=2,'B21 tree: through gold, out faded, yours outlined '+JSON.stringify(out.sf));
ok(out.sf.pager==='Superbus · Round 1'&&/Superbus · Round 1/.test(out.sf.dek)&&!/Week XI/.test(out.sf.dek)&&out.sf.ed==='r1'&&out.sf.next==='Superbus · Semifinals'&&out.sf.keys.includes('1.11')&&out.sf.keys.includes('1.11.r1'),'B24 the Round 1 edition '+JSON.stringify(out.sf));
ok(out.sf.tbl,'B4 table unchanged in the semifinals');

/* ---- the semifinals → Superbus Week → the off-season (End the week's own tab choice) ---- */
out.off=await ev(pg,async()=>{const w=W_();const r={};r.ok1=await PW(true);r.ph1=OFF104.phase(w);r.tbl1=TBL()===window.T11;
  MGR.tab='paper';MGR.ak102=null;MGR_REDRAW();await W8(500);r.ed1=(document.querySelector('.ak102pg > div > b')||{}).textContent||'';
  MGR.tab='night';MGR_REDRAW();await W8(600);r.finTop=!!document.querySelector('#mgrBody .v104top .v104tr');r.finBtns=document.querySelectorAll('#mgrBody [data-po104="bracket"]').length;
  /* 17's endweek: ok → MGR.tab = the awards (unseen) or the paper → redraw */
  await SIMS();let ok2;const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);try{ok2=await endWeek()}finally{clearInterval(hold)}r.ok2=ok2;
  if(ok2){MGR.confirmEnd=false;MGR.tab=w.awardShow&&!w.awardShow.seen?'awards':'paper';MGR.awI=0;MGR_REDRAW()}await W8(700);
  r.ph=OFF104.phase(w);r.tab=MGR.tab;const off=document.querySelector('#mgrBody .po104off');r.page=!!off;
  r.awBtn=!!(off&&off.querySelector('[data-mg="tab"][data-id="awards"]'));r.paperBtn=!!(off&&off.querySelector('[data-mg="paper"]'));
  const bk=off&&off.querySelector('.v104sbr .v104tr');r.tree=!!bk;r.champ=!!(bk&&bk.querySelector('.v104ch.on'));r.btns=document.querySelectorAll('#mgrBody [data-po104="bracket"]').length;
  r.tbl=TBL()===window.T11;
  /* the standings page still shows the season */
  MGR.tab='league';MGR_REDRAW();await W8(600);r.lgRows=document.querySelectorAll('#mgrPane .wd100r').length;r.lgSb=!!document.querySelector('.roomhd.b73-league [data-v104s="sb"]');
  const pb=document.querySelector('[data-mg="paper"]');MGR.tab='paper';MGR.ak102=null;MGR_REDRAW();await W8(500);r.ed2=(document.querySelector('.ak102pg > div > b')||{}).textContent||'';r.next2=(document.querySelector('.ak102nw b')||{}).textContent||'';
  /* the off-season ends: its edition */
  r.ok3=await PW(true);r.season=w.season;MGR.tab='paper';MGR.ak102=null;MGR_REDRAW();await W8(500);r.ed3=(document.querySelector('.ak102pg > div > b')||{}).textContent||'';
  MGR.tab='league';MGR_REDRAW();await W8(500);r.s2Sb=!!document.querySelector('.roomhd.b73-league [data-v104s]');return r});
ok(out.off.ok1&&out.off.ph1==='fin'&&out.off.tbl1&&out.off.ed1==='Superbus · Semifinals'&&out.off.finTop&&out.off.finBtns===0,'Superbus Week: tree on top, no buttons, Semifinals edition '+JSON.stringify(out.off));
ok(out.off.ok2&&out.off.ph==='off'&&out.off.tab==='night'&&out.off.page&&out.off.awBtn&&out.off.paperBtn,'B23 the off-season page opens first '+JSON.stringify(out.off));
ok(out.off.tree&&out.off.champ&&out.off.btns===0,'B21 the finished bracket on the off-season page '+JSON.stringify(out.off));
ok(out.off.tbl&&out.off.lgRows>=12&&out.off.lgSb,'B4 table kept through the off-season '+JSON.stringify(out.off));
ok(out.off.ed2==='Superbus · The Final'&&out.off.next2==='Off-season'&&out.off.ok3&&out.off.season===2&&out.off.ed3==='Off-season'&&!out.off.s2Sb,'B24 Final + Off-season editions, season 2 '+JSON.stringify(out.off));

/* ---- a phone: the tree scrolls inside its own box ---- */
await pg.setViewportSize({width:390,height:800});
out.ph=await ev(pg,async()=>{const w=W_();const r={};const P=w.po104;w.season=1;w.week=11;w.night.po104='fin';
  po104Open();await W8(300);const box=document.querySelector('#po104br .po104box');const sx=document.querySelector('#po104br .v104sx');r.box=box?[box.scrollWidth,box.clientWidth]:null;r.sx=sx?[sx.scrollWidth,sx.clientWidth]:null;po104Close();
  r.page=[document.documentElement.scrollWidth,innerWidth];w.season=2;w.week=13;w.night.po104=null;return r});
ok(out.ph.box&&out.ph.box[0]<=out.ph.box[1]+2&&out.ph.sx&&out.ph.sx[0]>out.ph.sx[1]&&out.ph.page[0]<=390,'B21 phone '+JSON.stringify(out.ph));
out.errs=await ev(pg,()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]);

/* ---- B3: Play Now's 🏛 button with Begin Event ---- */
const pn=await open(false);
out.pn=await ev(pn,async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}openSetup(true);await new Promise(r=>setTimeout(r,1200));
  const R=e=>{const x=e.getBoundingClientRect();return {l:x.left,t:x.top,w:x.width,h:x.height}};const go=document.querySelector('#goBtn'),c=document.querySelector('#mClose.menu101');return go&&c?{go:R(go),c:R(c)}:null});
ok(out.pn&&Math.abs(out.pn.go.t-out.pn.c.t)<=3&&Math.abs(out.pn.go.h-out.pn.c.h)<=3&&out.pn.c.l>out.pn.go.l+out.pn.go.w&&out.pn.c.l-(out.pn.go.l+out.pn.go.w)<90,'B3 the 🏛 button sits with Begin Event '+JSON.stringify(out.pn));

/* ---- kill switch ---- */
const pk=await open(true);
out.ks=await ev(pk,async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}openSetup(true);await new Promise(r=>setTimeout(r,1200));
  const c=document.querySelector('#mClose.menu101');const go=document.querySelector('#goBtn');const r={h:c?Math.round(c.getBoundingClientRect().height):0,gh:go?Math.round(go.getBoundingClientRect().height):0,on:V104S.on,why:typeof V104S.why};
  if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300));menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await new Promise(r=>setTimeout(r,100));await new Promise(r=>setTimeout(r,400));
  newWorld({type:'pre',key:MGR_PRE[0].key});for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}
  r.tree=/v104tr/.test(po104BracketHTML(W_(),false));return r});
ok(!out.ks.on&&out.ks.why==='undefined'&&!out.ks.tree&&out.ks.h!==out.ks.gh,'kill switch '+JSON.stringify(out.ks));
ok(!out.errs.length,'00c errors '+JSON.stringify(out.errs));
console.log(JSON.stringify(out,null,1).slice(0,6000));console.log('PAGEERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));
await b.close();process.exit(miss.length||errs.length?1:0)})();
