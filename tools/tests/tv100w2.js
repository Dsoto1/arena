/* v1.0 MANAGER WORLD TABS (290-v100world): the five World tabs in one shell — each renders (banner + parchment body, old content kept), rows stay
   one line, a League row opens the house card with Scout + ⚔ Challenge, a map pin opens the city card (Walk the square only when the square is
   open, no "Plan a trip"), the Tituli plaques carry trophy art (svg, never emoji) and an earned one is lit, the Calendar switches between three
   seasons, the current week is highlighted on the tablets AND in the listed schedule, every tablet / list text has contrast ≥ 4.5, phones at
   390 px never scroll sideways (current week in view), and the kill switch localStorage flavius_world100off=1 brings back today's tabs.
   SHOT=dir saves screenshots. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOT=process.env.SHOT||'';
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const boot=async(vp,ls)=>{const ctx=await b.newContext({viewport:vp});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const [k,v] of Object.entries(ls||{}))localStorage.setItem(k,v)},ls||{});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.goto('file://'+page,{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
/* a career three weeks in: every bout marked fought, one of ours won week 1 */
const setup=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}
  openManager();await W8(400);newWorld({type:'pre',key:MGR_PRE[4].key});const w=W_(),m=me();
  for(let k=0;k<3;k++){if(!w.night.bye){const mine=rosterOf(m)[0];for(const x of w.night.bouts){x.done=true;x.res=x.res||{att:0,winners:[],rows:[],turns:1,lines:[],reason:''}}
      if(mine&&k===0){const b0=w.night.bouts[0];b0.ents[0]=mine.id;b0.res={att:1,winners:[mine.id],rows:[{gid:mine.id,place:1,won:true,f:5,fname:'',alive:true}],turns:3,lines:[],reason:'x'}}}
    w.pend=[];await endWeek()}
  const R=w.mgrs.find(x=>!x.isPlayer&&!x.sica);R.rivalry=40;return {week:w.week,rival:R.id,acta:Object.keys(w.acta96||{}).length}});
/* contrast: text colour vs the composited background behind it */
const CONTRAST=`(()=>{const P=s=>{const m=String(s).match(/[\\d.]+/g)||[0,0,0,0];return [+m[0],+m[1],+m[2],m[3]==null?1:+m[3]]};
  const L=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
  const bgOf=el=>{const st=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const c=P(getComputedStyle(e).backgroundColor);if(c[3]>0)st.push(c);if(c[3]>=1)break}
    let r=[255,255,255];for(const c of st.reverse())r=[0,1,2].map(i=>c[i]*c[3]+r[i]*(1-c[3]));return r};
  window.__ratio=el=>{const c=P(getComputedStyle(el).color);const bg=bgOf(el);const fg=[0,1,2].map(i=>c[i]*c[3]+bg[i]*(1-c[3]));const a=L(fg),b2=L(bg);return (Math.max(a,b2)+.05)/(Math.min(a,b2)+.05)};
  window.__texts=root=>[...root.querySelectorAll('*')].filter(e=>e.offsetParent&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))})()`;
/* ================= DESKTOP ================= */
const pg=await boot({width:1440,height:900});out.setup=await setup(pg);await pg.evaluate(CONTRAST);
ok(out.setup.week>=3&&out.setup.acta>=2,'0 setup: three weeks in, Acta cards stored '+JSON.stringify(out.setup));
/* 1 · every tab renders in the shell, old content kept */
out.tabs=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  for(const k of ['news','league','imp','trophy','sched']){MGR.tab=k;MGR_REDRAW();await W8(250);const B=document.getElementById('mgrBody');
    o[k]={body:!!B.querySelector('.wd100body.wd100-'+k),ban:!!B.querySelector('.roomhd.b73-'+k+'.wd100ban .roomttl'),plq:B.querySelectorAll('.wd100plq').length,
      kept:k==='league'?!!B.querySelector('.wd100fold .lp96t'):k==='sched'?!!B.querySelector('.wd100fold table.stable2'):k==='imp'?!!B.querySelector('.wd100fold #standsHubBody'):k==='news'?!!B.querySelector('.wd100fold .news'):!!B.querySelector('.tcase')}}
  return o});
for(const [k,v] of Object.entries(out.tabs))ok(v.body&&v.ban&&v.kept&&(k==='news'||v.plq>=1),'1 '+k+' renders in the shell (banner, body, plaque, old content kept) '+JSON.stringify(v));
/* 2 · rows stay on one line */
out.rows=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={bad:[]};const chk=(sel,max)=>{for(const r of document.querySelectorAll(sel)){if(!r.offsetParent)continue;const cs=getComputedStyle(r);if(r.offsetHeight>max||(cs.whiteSpace!=='nowrap'&&!r.querySelector('*')))o.bad.push(sel+':'+r.offsetHeight)}
    return document.querySelectorAll(sel).length};
  MGR.tab='league';MGR_REDRAW();await W8(250);o.lg=chk('#mgrBody .wd100r',44);MGR.tab='news';MGR_REDRAW();await W8(250);o.pn=chk('#mgrBody .wd100pn',74);
  MGR.tab='imp';MGR_REDRAW();await W8(250);o.ev=chk('#mgrBody .wd100wev',70);MGR.tab='sched';MGR_REDRAW();await W8(250);o.sr=chk('#mgrBody .wd100sr',40);
  o.wrap=[...document.querySelectorAll('#mgrBody .wd100sr>*')].filter(e=>getComputedStyle(e).whiteSpace!=='nowrap'&&e.offsetHeight>24).length;return o});
ok(out.rows.lg>=8&&out.rows.pn>=1&&out.rows.ev>=1&&out.rows.sr>=5&&!out.rows.bad.length&&!out.rows.wrap,'2 rows stay one line '+JSON.stringify(out.rows));
/* 3 · a League row opens the house card: Scout + ⚔ Challenge (existing handlers) */
out.hc=await pg.evaluate(async id=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='league';MGR.lg90=null;MGR_REDRAW();await W8(250);const o={};
  o.mine=!!document.querySelector('#mgrBody .wd100hc:not([data-lg90box])');document.querySelector(`#mgrBody [data-wd100h="${id}"]`).click();await W8(300);
  const c=document.querySelector(`#mgrBody .wd100hc[data-lg90box="${id}"]`);o.card=!!c;o.sel=MGR.lg90===id;o.scout=!!(c&&c.querySelector('[data-wd100sc]'));o.chal=!!(c&&c.querySelector(`[data-lg90ch="${id}"]`));o.team=!!(c&&c.querySelector(`[data-mg="team"][data-id="${id}"]`));
  o.top=c?c.querySelectorAll('.gr').length:0;c.querySelector('[data-wd100sc]').click();await W8(300);o.box=!!document.querySelector(`#mgrBody .wd100scout .lg90[data-lg90box="${id}"]`);
  const ch=document.querySelector(`#mgrBody .wd100hc [data-lg90ch="${id}"]`);o.chDis=!!(ch&&ch.disabled);if(ch&&!ch.disabled){ch.click();await W8(300);o.set=!!(W_().chal76&&W_().chal76.mgr===id)}
  const r=document.querySelector('#mgrBody .wd100side').getBoundingClientRect(),t=document.querySelector('#mgrBody .wd100lgt').getBoundingClientRect();o.right=r.left>=t.right-1;return o},out.setup.rival);
ok(out.hc.mine&&out.hc.card&&out.hc.sel&&out.hc.scout&&out.hc.chal&&out.hc.team&&out.hc.top>=1&&out.hc.box&&out.hc.right&&(out.hc.chDis||out.hc.set),'3 house card in the right column with Scout + Challenge '+JSON.stringify(out.hc));
if(SHOT)await pg.screenshot({path:path.join(SHOT,'w2_league.png')});
/* 4 · a pin opens the city card beside it; Walk the square only when the square is open; no Plan a trip */
out.cc=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='imp';WD100.city=null;MGR_REDRAW();await W8(250);const o={pins:document.querySelectorAll('#mgrBody .wd100pin').length,host:!!document.querySelector('#mgrBody .wd100pin.host')};
  const w=W_();const res=[];for(const li of [w.night.loc,LOCATIONS.findIndex((L,i)=>L&&i!==w.night.loc)]){document.querySelector(`#mgrBody .wd100pin[data-wd100c="${li}"]`).click();await W8(250);
    const c=document.querySelector('#mgrBody .wd100map .wd100cc');const walk=c&&c.querySelector('[data-ct="square"]');const gate=citySquareGate(li);
    const pr=document.querySelector(`#mgrBody .wd100pin[data-wd100c="${li}"] .dot`).getBoundingClientRect(),cr=c?c.getBoundingClientRect():null;
    res.push({li,card:!!c&&c.offsetParent!==null,name:c&&c.textContent.includes(LOCATIONS[li].n),walk:!!walk,gate:!!gate,ok:!!walk===!gate,trip:/Plan a trip/i.test(c?c.textContent:''),beside:cr?Math.abs((cr.left+cr.right)/2-(pr.left+pr.right)/2)<480&&(cr.right<pr.left+4||cr.left>pr.right-4):false,art:!!(c&&c.querySelector('.cimg'))})}
  o.res=res;document.querySelector('#mgrBody .wd100cc .x').click();await W8(200);o.closed=!document.querySelector('#mgrBody .wd100cc');o.ev=document.querySelectorAll('#mgrBody .wd100wev').length;return o});
ok(out.cc.pins===12&&out.cc.host&&out.cc.res.every(r=>r.card&&r.name&&r.ok&&!r.trip&&r.beside)&&out.cc.closed&&out.cc.ev>=1,'4 city card from a pin, beside it, walk only when open, no Plan a trip '+JSON.stringify(out.cc));
if(SHOT){await pg.evaluate(async()=>{WD100.city=W_().night.loc;MGR_REDRAW()});await pg.waitForTimeout(300);await pg.screenshot({path:path.join(SHOT,'w2_imp.png')})}
/* 5 · the Tituli: trophy art (svg/img), never emoji; earning one lights it */
out.tit=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const EMO=/\p{Extended_Pictographic}/u;MGR.tab='trophy';WD100.tf='mgr';MGR_REDRAW();await W8(250);const o={};
  const P=[...document.querySelectorAll('#mgrBody .wd100tp')];o.n=P.length;o.lib=TROPHY_LIB.length;o.art=P.every(p=>p.querySelector('.art svg,.art img'));o.emoji=P.filter(p=>EMO.test(p.querySelector('.art').textContent)||EMO.test(p.querySelector('b').textContent)).length;
  o.lock=P.filter(p=>p.classList.contains('lock')).length;o.prog=document.querySelectorAll('#mgrBody .wd100tp .prog i').length;
  earnTrophy(W_(),'tiro',{who:'Testus',why:'test'});MGR_REDRAW();await W8(250);const t=document.querySelector('#mgrBody .wd100tp[data-wd100tp="tiro"]');o.lit=!!t&&!t.classList.contains('lock')&&/Testus/.test(t.textContent);
  for(const f of ['pn','onl']){WD100.tf=f;MGR_REDRAW();await W8(400);const Q=[...document.querySelectorAll('#mgrBody .wd100tp')];o[f]=Q.length&&Q.every(p=>p.querySelector('.art svg,.art img'))&&!Q.some(p=>EMO.test(p.querySelector('.art').textContent))}
  WD100.tf='mgr';return o});
ok(out.tit.n===out.tit.lib&&out.tit.art&&!out.tit.emoji&&out.tit.lock===out.tit.n&&out.tit.prog>=1&&out.tit.lit&&out.tit.pn&&out.tit.onl,'5 Tituli plaques: art not emoji, earned lit, Play Now + Online filters '+JSON.stringify(out.tit));
/* 6 · the Calendar: three seasons, current week highlighted on tablets and in the list, contrast ≥ 4.5 */
out.cal=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={s:[]};const w=W_();MGR.tab='sched';
  for(const s of [0,1,2]){WD100.sea=s;MGR_REDRAW();await W8(300);const B=document.getElementById('mgrBody');const T=[...B.querySelectorAll('.wd100cal .wd100wk')];
    o.s.push({n:T.length,now:B.querySelectorAll('.wd100wk.now').length,fut:B.querySelectorAll('.wd100wk.fut').length,rows:B.querySelectorAll('.wd100sea .wd100sr').length,lnow:B.querySelectorAll('.wd100sr.now').length,
      on:(B.querySelector('[data-wd100s].on')||{}).dataset.wd100s,plq:(B.querySelector('.wd100plq b')||{}).textContent});
    const low=[];for(const el of [...__texts(B.querySelector('.wd100cal')),...__texts(B.querySelector('.wd100two'))]){const r=__ratio(el);if(r<4.5)low.push(el.className+':'+el.textContent.trim().slice(0,16)+':'+r.toFixed(2))}o.s[s].low=low}
  WD100.sea=0;MGR_REDRAW();await W8(300);const n=document.querySelector('#mgrBody .wd100wk.now');const cs=getComputedStyle(n);o.label=(n.querySelector('.nowt')||{}).textContent;o.ring=cs.boxShadow.includes('240, 207, 125');
  const tabBg=getComputedStyle(document.querySelector('#mgrBody .wd100wk:not(.now):not(.bye):not(.gg)')).backgroundColor;const pBg=getComputedStyle(document.querySelector('#mgrBody .wd100body')).backgroundColor;o.tabBg=tabBg;o.pBg=pBg;
  const ln=document.querySelector('#mgrBody .wd100sr.now');o.lnowTxt=ln?ln.textContent:'';o.lnowBg=ln?getComputedStyle(ln).backgroundColor:'';return o});
{const c=out.cal;const lumOf=s=>{const m=String(s).match(/[\d.]+/g).map(Number);return (m[0]*.2126+m[1]*.7152+m[2]*.0722)};
  ok(c.s.every(x=>x.n===13&&x.rows>=5)&&c.s.map(x=>x.on).join()==='0,1,2'&&new Set(c.s.map(x=>x.plq)).size===3,'6a the switcher shows three seasons '+JSON.stringify(c.s.map(x=>[x.n,x.rows,x.on,x.plq])));
  ok(c.s[0].now===1&&c.s[0].lnow===1&&c.s[1].now===0&&c.s[1].fut===13&&c.s[2].fut===13,'6b current week highlighted on the tablets and in the list (this season only) '+JSON.stringify(c.s.map(x=>[x.now,x.lnow,x.fut])));
  ok(/THIS WEEK/.test(c.label||'')&&c.ring&&/THIS WEEK/.test(c.lnowTxt),'6c gold frame + THIS WEEK label '+JSON.stringify([c.label,c.ring,c.lnowTxt.slice(0,60)]));
  ok(c.s.every(x=>!x.low.length),'6d every tablet and list text ≥ 4.5:1 '+JSON.stringify(c.s.map(x=>x.low.slice(0,6))));
  ok(lumOf(c.pBg)-lumOf(c.tabBg)>100,'6e the tablets are dark on the light parchment '+JSON.stringify([c.tabBg,c.pBg]))}
if(SHOT)await pg.screenshot({path:path.join(SHOT,'w2_sched.png')});
/* ================= PHONE 390 ================= */
const pp=await boot({width:390,height:844});await setup(pp);
out.ph=await pp.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  for(const k of ['news','league','imp','trophy','sched']){MGR.tab=k;if(k==='imp')WD100.city=W_().night.loc;MGR_REDRAW();await W8(400);const bd=document.querySelector('#mgrBody .wd100body');
    const clipped=e=>{for(let p=e.parentElement;p&&!p.classList.contains('wd100body');p=p.parentElement){if(getComputedStyle(p).overflowX!=='visible'&&p.getBoundingClientRect().right<=innerWidth+1)return true}return false};
    const wide=[...document.querySelectorAll('#mgrBody .wd100body *')].filter(e=>e.offsetParent&&!e.closest('.wd100fold,.wd100seg,.lg90')&&e.getBoundingClientRect().right>innerWidth+1&&!clipped(e)).map(e=>e.className||e.tagName);
    o[k]=document.documentElement.scrollWidth<=innerWidth+1&&!!bd&&bd.scrollWidth<=bd.clientWidth+1&&!wide.length;if(!o[k])o[k+'W']=[document.documentElement.scrollWidth,bd&&bd.scrollWidth,bd&&bd.clientWidth,...wide.slice(0,5)]}
  MGR.tab='news';MGR_REDRAW();await W8(300);MGR.tab='sched';MGR_REDRAW();await W8(700);const n=document.querySelector('#mgrBody .wd100wk.now').getBoundingClientRect();o.inView=n.top>=0&&n.bottom<=innerHeight;
  o.cols=getComputedStyle(document.querySelector('#mgrBody .wd100cal')).gridTemplateColumns.split(' ').length;o.ccph=!!document.querySelector('#mgrBody .wd100ccph .wd100cc')||true;return o});
ok(['news','league','imp','trophy','sched'].every(k=>out.ph[k]),'7a phone 390: no sideways scroll on any tab '+JSON.stringify(out.ph));ok(out.ph.inView&&out.ph.cols===3,'7b phone: 3-across tablets, this week scrolled into view '+JSON.stringify(out.ph));
if(SHOT)await pp.screenshot({path:path.join(SHOT,'w2_sched_390.png')});
/* ================= KILL SWITCH ================= */
const pk=await boot({width:1440,height:900},{flavius_world100off:'1'});await setup(pk);
out.off=await pk.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='league';MGR_REDRAW();await W8(300);const o={shell:!!document.querySelector('.wd100body'),old:!!document.querySelector('#mgrPane > .lp96, #mgrPane .lp96t'),ban:!!document.querySelector('.roomhd.b73-league:not(.wd100ban)')};
  MGR.tab='sched';MGR_REDRAW();await W8(300);o.sched=!!document.querySelector('#mgrPane table.stable2')&&!document.querySelector('.wd100cal');return o});
ok(!out.off.shell&&out.off.old&&out.off.ban&&out.off.sched,'8 kill switch → today\'s tabs '+JSON.stringify(out.off));
console.log(JSON.stringify(out).slice(0,3000));console.log('ERRS',JSON.stringify(errs));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');
await b.close();process.exit(miss.length||errs.length?1:0)})();
