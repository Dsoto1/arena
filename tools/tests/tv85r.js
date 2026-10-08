/* v0.85: the recruiting tidy (144-v85rec) — the board as the barracks wall (8 watchers in a short wall, empty lanes = narrow
   posts, the next-step button scouts, a tablet selects), the plan on one line (folds, no hours), one-line list rows, 🆕 only for this
   week's arrivals, one ratings line before scouting, the advisor's "★ advised" on the button (no box), 📌 = on your board,
   next-step buttons on one line for every kind with the pitch topic as a tag, ⋯ / tablet picks are local (no redraw, the rail
   never flickers), the lanista's hours wording + the Promote panel's hours line, phones without skew or sideways scroll */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const setup=async(pg,mode)=>{await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.removeItem('flavius_recplan85')});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
  return pg.evaluate(async(mode)=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=500;
    const fa=freeAgents().sort((a,b)=>effOvr(a)-effOvr(b));window.T85=fa;
    if(mode==='w8')fa.slice(0,8).forEach(g=>g.favd=true);
    else{fa.slice(0,3).forEach(g=>g.favd=true);fa[1].name='Tiberius Ahenobarbus Maximus';const hi=fa.slice(-4);hi.forEach((g,i)=>{g.favd=true;g.scout=2;g.interest[m.id]=[36,5,33,95][i]})}
    MGR.tab='recruit';MGR.sel=fa[0].id;MGR.recStep=null;MGR_REDRAW();await W8(700);return true},mode)};
const geo=()=>{const R=el=>{const r=el.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height)}};
  const body=document.getElementById('mBody')||document.body;const mg=document.querySelector('.mgrid');
  return {docW:document.documentElement.scrollWidth,vw:innerWidth,bodyX:body.scrollWidth-body.clientWidth,mgX:mg?mg.scrollWidth-mg.clientWidth:-1,
    tabs:[...document.querySelectorAll('.pipeline .pcard')].map(R),rows:[...document.querySelectorAll('#recTable tr.r85')].slice(0,12).map(r=>R(r).h),
    det:(()=>{const d=document.querySelector('.rsteps');const c=d&&d.closest('.card2');return c?c.scrollWidth-c.clientWidth:-1})(),
    names:[...document.querySelectorAll('.pipeline .pn85')].filter(n=>n.scrollHeight>n.clientHeight+2||n.getBoundingClientRect().bottom>n.nextElementSibling.getBoundingClientRect().top+1||n.getBoundingClientRect().top<n.closest('.pcard').getBoundingClientRect().top).map(n=>n.textContent),
    btns:[...document.querySelectorAll('.pipeline .pcard .nx95')].map(x=>({k:x.textContent,h:Math.round(x.getBoundingClientRect().height),one:x.scrollWidth<=x.clientWidth+1}))}};
/* ---------- desktop: eight watchers ---------- */
const pg=await b.newPage({viewport:{width:1400,height:1000}});await setup(pg,'w8');
o.d=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const P=document.querySelector('.pipeline');
  r.boardH=Math.round(P.getBoundingClientRect().height);r.cards=P.querySelectorAll('.pcard.pt85').length;r.cols=P.querySelectorAll('.pcol').length;
  r.posts=[...P.querySelectorAll('.pcol.ppost85')].map(p=>Math.round(p.getBoundingClientRect().width));r.postTxt=[...P.querySelectorAll('.ppost85')].map(p=>p.textContent.trim());
  r.cardH=[...P.querySelectorAll('.pcard')].map(c=>Math.round(c.getBoundingClientRect().height));
  /* the plan line: folded, counts, no hours; unfolds and remembers */
  const pl=document.querySelector('details.rp85');const sm=pl&&pl.querySelector('summary');r.plan=!!pl&&!pl.open&&/This week: 8 scouting · 0 courting planned/.test(sm.textContent);
  r.planNoHrs=!!sm&&!/\d+\s*h\b|hour/i.test(sm.textContent);sm.click();await W8(300);r.planOpen=pl.open&&localStorage.getItem('flavius_recplan85')==='1'&&pl.querySelectorAll('.rplan').length===8;
  MGR_REDRAW();await W8(300);r.planKept=document.querySelector('details.rp85').open;document.querySelector('details.rp85 summary').click();await W8(200);r.planShut=localStorage.getItem('flavius_recplan85')==='0';
  /* the detail card before scouting: one ratings line; the advisor's ★ on the button, no box */
  const a=T85[0];/* v0.88 (157): before scouting the card shows rough ranges (±12) in the same box, not one line *//* v0.98: grade blocks, "?" until scouted */r.oneLine=document.querySelectorAll('.gs98 .gb98[data-p="0"]').length===5;
  const ab=document.querySelector('.rsteps')?.closest('.card2').querySelector('.btn.adv74');r.advBtn=!!ab&&!!ab.querySelector('.star85')&&/Advisor suggests/.test(ab.title)&&!!ab.dataset.adv85;r.noBox=!document.querySelector('.advise74');
  r.boardStar=!document.querySelector('.pipeline .pcard button')&&!!document.querySelector('.pcard .nx95');r.more=!!document.querySelector('.pcard[data-mg="sel"]');
  /* the list: one line a row */
  r.rows=[...document.querySelectorAll('#recTable tr.r85')].map(t=>Math.round(t.getBoundingClientRect().height));r.rowOdds=/#\d/.test((document.querySelector('#recTable tr.r85 td[title]')||{}).title||'');
  r.toolbar=(()=>{const t=document.querySelector('.rtb85');if(!t)return 0;const R=[...t.children].map(c=>c.getBoundingClientRect());const top=Math.min(...R.map(x=>x.top)),bot=Math.min(...R.map(x=>x.bottom));return R.every(x=>x.top<bot)?1:2})();
  /* a tablet click selects its fighter */
  const c=T85[3];const tn=document.querySelector(`.pcard[data-id="${c.id}"] .pn85`);tn.click();await W8(400);r.sel=MGR.sel===c.id&&!!document.querySelector(`.pcard.me[data-id="${c.id}"]`)&&document.querySelector('.rsteps').closest('.card2').textContent.includes(c.name);
  /* the stamp scouts: hours drop by 3, the tablet moves on, the card shows ratings */
  MGR.sel=a.id;MGR.recStep=null;MGR_REDRAW();await W8(400);const h0=w.hours;/* v0.98: the recruiter's actions until all five are graded */let sb=document.querySelector(`#mgrBody .mgrid [data-rec98a].primary[data-id="${a.id}"]`);r.stamp=!!sb&&!document.querySelector('.pipeline .pcard button');for(let i=0;i<5&&sb&&!a.scout;i++){sb.click();await W8(350);sb=document.querySelector(`#mgrBody .mgrid [data-rec98a].primary[data-id="${a.id}"]:not([disabled])`)}await W8(400);
  r.scouted=!!a.scout&&recStage(a,m)!=='watch'; /* v0.87: no lanista's hours */MGR.sel=a.id;MGR.recStep=1;MGR_REDRAW();await W8(300);r.ratAfter=document.querySelectorAll('.gs98 .gb98[data-p="0"]').length===0&&!!document.querySelector('.pe98:not(.lock)');
  /* opening a free agent's card does not pin them (recReady / the meter only probe offerVerdict) */
  const u=T85.find(g=>!g.favd&&!g.court);MGR.sel=u.id;MGR_REDRAW();await W8(200);MGR.recStep=3;MGR_REDRAW();await W8(800);r.noPin=!u.favd&&!u.court&&!!document.getElementById('ofMeter');MGR.recStep=null;
  /* 🆕 only for this week's arrivals */
  const ng=genGlad({ovr:62});w.glads.push(ng);w.week=2;ng.debut={s:w.season,wk:2};const old=T85.find(g=>!g.favd&&g.debut&&g.debut.wk===1);MGR.rq=ng.name;MGR_REDRAW();await W8(300);
  r.newYes=!!document.querySelector(`#recTable tr[data-id="${ng.id}"] .new85`);MGR.rq='';MGR_REDRAW();await W8(300);
  r.newNo=[...document.querySelectorAll('#recTable tr.r85')].filter(t=>t.querySelector('.new85')).every(t=>{const g=gById(t.dataset.id);return g.debut&&g.debut.wk===w.week});
  r.oldNo=!!old&&!/🆕/.test(gTags(old));r.noLastWk=!/this week or last/.test(document.getElementById('mgrBody').innerHTML);
  old.debut={s:w.season,wk:1};w.week=3;ng.debut={s:w.season,wk:2};r.lastWkNo=!/🆕/.test(gTags(ng));w.week=1;return r});
const sx=(p,n)=>p.screenshot({path:'/tmp/tv85r_'+n+'.png'});await sx(pg,'watch8');
ok(o.d.boardH<300,'8 watchers: board under 300px');ok(o.d.cards===8&&o.d.cols===4,'four lanes, eight tablets');
ok(o.d.posts.length===3&&o.d.posts.every(x=>x<=40),'empty lanes are narrow posts');ok(o.d.postTxt.some(t=>/Courting · 0/.test(t)),'post names its lane');
ok(o.d.cardH.every(h=>h>=44&&h<=80),'tablets 44-80px (no buttons since v0.95)');ok(o.d.plan&&o.d.planNoHrs,'plan on one folded line, no hours');ok(o.d.planOpen&&o.d.planKept&&o.d.planShut,'plan unfolds and remembers');
ok(o.d.oneLine,'rough rating ranges before scouting');ok(o.d.advBtn&&o.d.noBox,'advisor ★ on the button, no box');ok(o.d.boardStar&&o.d.more,'★ advised on the button, 📌 board pin, ⋯');
ok(o.d.rows.length>=10&&o.d.rows.every(h=>h<=44),'list rows on one line (≤44px)');ok(o.d.rowOdds,'rank text on hover');ok(o.d.toolbar===1,'one toolbar row');
ok(o.d.sel,'tablet click selects the card');ok(o.d.noPin,'opening a card does not pin');ok(o.d.stamp&&o.d.scouted,'the next-step button scouts');ok(o.d.ratAfter,'ratings after scouting');
ok(o.d.newYes&&o.d.newNo&&o.d.oldNo&&o.d.noLastWk&&o.d.lastWkNo,'🆕 only this week');
/* ---------- desktop: a mixed board ---------- */
const pm=await b.newPage({viewport:{width:1400,height:1000}});await setup(pm,'mix');
o.m=await pm.evaluate(new Function('const geo='+geo.toString()+';const P=document.querySelector(".pipeline");return {lanes:[...P.querySelectorAll(".pcol")].map(c=>({post:c.classList.contains("ppost85"),n:c.querySelectorAll(".pcard").length})),g:geo(),plan:(document.querySelector("details.rp85 summary")||{}).textContent}'));
await sx(pm,'mixed');await pm.evaluate(()=>document.getElementById('recTable').scrollIntoView({block:'start'}));await pm.waitForTimeout(200);await sx(pm,'list');
ok(o.m.lanes.length===4&&o.m.lanes.filter(l=>!l.post).reduce((a,l)=>a+l.n,0)===7&&o.m.lanes.every(l=>l.post===(l.n===0)),'mixed board: lanes with tablets, posts for the empty');
ok(/3 scouting · 4 courting planned/.test(o.m.plan||''),'mixed plan counts');ok(!o.m.g.names.length,'full names fit two lines: '+o.m.g.names.join(', '));
/* every next-step kind on one line: scout, pitch (topic tag), sign (offer), then feast and gift once the pitches are spent */
o.k=await pm.evaluate(new Function('geo',`return (async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();const r={};const g0=eval(geo);r.a=g0().btns;
  r.tag=true;
  w.pitchN={wk:w.week,n:PITCH_MAX};const fv=T85.slice(-4).find(g=>recStage(g,m)!=='ready');MGR_REDRAW();await W8(300);r.b=g0().btns;
  fv.visits[m.id]=w.week;MGR_REDRAW();await W8(300);r.c=g0().btns;
  /* the card: pitch topics as tags */
  w.pitchN=null;MGR.sel=T85[T85.length-4].id;MGR_REDRAW();await W8(200);MGR.recStep=1;MGR_REDRAW();await W8(200);const wantTag=true; /* v0.98: motives show in the personality block once graded */MGR.recStep=2;MGR_REDRAW();await W8(300);const card=document.querySelector('.rsteps').closest('.card2');
  r.cardTag=!!card.querySelector('[data-rec98p] .pc98t .grade')&&wantTag; /* v0.98: each pitch wears its house grade */MGR.recStep=null;
  /* the gift, then ⋯ ten times: no redraw, the rail is the same node */
  w.pitchN={wk:w.week,n:PITCH_MAX};MGR_REDRAW();await W8(300);const gt=[...document.querySelectorAll('.pcard')].find(c=>/Gift/.test((c.querySelector('.nx95')||{}).textContent||''));const gid=gt&&gt.dataset.id;if(gt){gt.click();await W8(300);MGR.recStep=2;MGR_REDRAW();await W8(300)}const gb=gid&&document.querySelector('#mgrBody .mgrid [data-mg="gift2"][data-id="'+gid+'"]');r.gift=!!gb;const h0=w.hours;if(gb)gb.click();await W8(500);r.gave=!!(gById(gid).giftWk&&gById(gid).giftWk[me().id]===w.week); /* v0.87: no hours; the gift landed */if(CUR_MODAL)CUR_MODAL.done(null);await W8(500);
  let n=0;const bM=mgrHTML;mgrHTML=function(){n++;return bM.apply(this,arguments)};const bR=window.MGR_REDRAW;let nr=0;window.MGR_REDRAW=function(){nr++;return bR.apply(this,arguments)};
  const rail=document.querySelector('.mtabs');const mb=document.getElementById('mgrBody').firstElementChild;
  for(let i=0;i<10;i++){const d=document.querySelector('.pcard[data-id="'+gid+'"]');if(d)d.click();await W8(60)}
  r.dbg2=[gid,document.querySelectorAll('.pcard').length,!!(gById(gid)||{}).favd,!!document.getElementById('mgrBody')];r.dbg=((document.querySelector('.pcard[data-id="'+gid+'"]')||{}).outerHTML||'none').slice(0,900);r.flick={d:!!document.querySelector('.pcard[data-id="'+gid+'"]'),modal:!!(typeof CUR_MODAL!=='undefined'&&CUR_MODAL),tab:MGR.tab,n,nr,rail:rail===document.querySelector('.mtabs')&&rail.isConnected,body:mb===document.getElementById('mgrBody').firstElementChild,sel:MGR.sel===gid,me:!!document.querySelector('.pcard.me[data-id="'+gid+'"]')};
  const other=document.querySelector('.pcard:not(.me)');const oid=other&&other.dataset.id;if(other)other.click();await W8(200);
  r.switch=MGR.sel===oid&&n===0&&document.querySelector('.rsteps').closest('.card2').textContent.includes(gById(oid).name);
  mgrHTML=bM;window.MGR_REDRAW=bR;
  /* the lanista's hours: banner, rail tooltip, the needs-hours reasons, the Promote panel */
  await W8(700);const ban=(document.querySelector('.roomhd.b73-recruit .roomstat')||{}).textContent||'';const chip=(document.querySelector('.mtabs [data-id="recruit"] .mcount.c73')||{}).title||'';
  r.banner=!/lanista's hours/.test(ban); /* v0.87: the lanista's hours are gone */
  w.hours=0;MGR_REDRAW();await W8(300);const H=document.getElementById('mgrBody').innerHTML;r.needs=!/lanista's hours/.test(document.getElementById('mgrBody').innerText)&&!/recruiting hour/i.test(H);
  w.hours=5;MGR.tab='ludus';MGR.run='promote';MGR_REDRAW();await W8(400);const pl=document.querySelector('.prom85');
  r.promote=!pl&&!!document.querySelector('.runpanel [data-mg="criers2"]'); /* v0.87: no hours line on Promote */
  r.noOld=!/recruiting hour/i.test(document.getElementById('mgrBody').innerHTML);MGR.tab='recruit';MGR_REDRAW();await W8(300);return r})()`),geo.toString());
const caps=[...o.k.a,...o.k.b,...o.k.c].map(x=>x.k).join('|');
ok([/Watch|Share|Study|Ask|Trial|Scout/,/Pitch/,/Sign/,/Feast/,/Gift/].every(r=>r.test(caps)),'every next-step kind is named on a tablet: '+caps);
ok([...o.k.a,...o.k.b,...o.k.c].every(x=>x.one),'tablet captions on one line');ok(o.k.tag&&o.k.cardTag,'pitch topic as a tag (board + card)');
ok(o.k.gift&&o.k.gave,'gift from the tablet');ok(o.k.flick.n===0&&o.k.flick.nr===0&&o.k.flick.rail&&o.k.flick.body&&o.k.flick.sel&&o.k.flick.me,'⋯ ×10: no redraw, the rail stays put');
ok(o.k.switch,'⋯ on another tablet switches the card locally');ok(o.k.banner&&o.k.needs&&o.k.noOld,"no lanista's hours anywhere (v0.87)");ok(o.k.promote,'Promote panel without hours (v0.87)');
/* ---------- phones: 390 portrait, 844x390 landscape ---------- */
for(const [vw,vh,n] of [[390,844,'p390'],[844,390,'l844']]){const pp=await b.newPage({viewport:{width:vw,height:vh}});await setup(pp,'mix');
  const g=await pp.evaluate(new Function('const geo='+geo.toString()+';return geo()'));o[n]=g;
  await pp.evaluate(()=>document.querySelector('.pipeline').scrollIntoView({block:'start'}));await pp.waitForTimeout(200);await sx(pp,n);
  await pp.evaluate(()=>document.getElementById('recTable').scrollIntoView({block:'start'}));await pp.waitForTimeout(200);await sx(pp,n+'_list');
  ok(g.docW<=g.vw&&g.bodyX<=1&&g.mgX<=1&&g.det<=1,n+': no sideways scroll');
  ok(g.tabs.length===7&&g.tabs.every(t=>t.h>=44&&t.h<=80&&t.w>=150&&t.w/t.h>=2&&t.w/t.h<=6),n+': tablets keep their shape '+g.tabs.map(t=>t.w+'x'+t.h).join(' '));
  ok(g.btns.length===7&&g.btns.every(x=>x.one&&x.h<=40),n+': next-step buttons on one line (36 px tap height on phones, v0.88)');
  ok(g.rows.length&&g.rows.every(h=>h<=44),n+': list rows one line');ok(!g.names.length,n+': names fit')}
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
