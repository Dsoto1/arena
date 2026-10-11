/* v1.0 MANAGER WORLD TABS (290-v100world): the five World tabs in one shell — each renders (banner + parchment body) and NO fold keeps old content any more
   (his 1c): the old full ledger lives in the house card ("Ledger"), Billing + invitations in the Calendar, the layer toggles are chips on the new map (the old
   map is gone, the city file / roster / family ties sit under it), every notice of the old list is on the wall (Show all), the Ludus Archives sit under it.
   Rows stay one line, a League row opens the house card with Scout + ⚔ Challenge, a map pin opens the city card (Walk the square only when the square is
   open, no "Plan a trip"), the Tituli plaques carry trophy art (svg, never emoji), season-award progress is hidden before week 12 (4c) and an earned one is
   lit, the trophy banner shows ONLY earned trophies (none → 4 empty plinths + "Your first honour awaits", some → the most prestigious first, all → a laurel
   ring "ALL n"), the Calendar switches between three seasons, the current week is highlighted on the tablets AND in the listed schedule, every tablet / list
   text has contrast ≥ 4.5, phones at 390 px never scroll sideways (current week in view), and the kill switch localStorage flavius_world100off=1 brings
   back today's tabs. SHOT=dir saves screenshots. */
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
      fold:!!B.querySelector('.wd100fold,details.wd100fold'),
      kept:k==='league'?!!B.querySelector('.wd100hc .wd100led'):k==='sched'?!!B.querySelector('.wd100bill .wd100sr.bill')&&!B.querySelector('table.stable2'):k==='imp'?!!B.querySelector('#standsHubBody.wd100file .empstrip,#standsHubBody.wd100file .citytile')&&!B.querySelector('svg.impmap'):k==='news'?!!B.querySelector('.wd100arc [data-mg="arcpap"]')&&!B.querySelector('.news'):!!B.querySelector('.tcase')}}
  return o});
for(const [k,v] of Object.entries(out.tabs))ok(v.body&&v.ban&&v.kept&&!v.fold&&(k==='news'||v.plq>=1),'1 '+k+' renders in the shell (banner, body, plaque, old content moved in, no fold) '+JSON.stringify(v));
/* 2 · rows stay on one line */
/* 1b · News: every notice of the old list is on the wall (Show all), the four filters cover them, the Archives are under it */
out.news=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const q=s=>document.querySelectorAll('#mgrBody '+s).length;const o={};
  w.news=w.news||[];w.news.push({s:w.season,wk:w.week,text:'<b>Test</b> — a notice nobody expected',cls:'bad'});
  const strip=t=>String(t).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();o.want=new Set(w.news.map(n=>strip(n.text)+'|'+n.s+'|'+n.wk)).size;
  WD100.nf='all';WD100.nmore=false;MGR.tab='news';MGR_REDRAW();await W8(300);o.first=q('.wd100pn');o.btn=!!document.querySelector('[data-wd100nm]');
  document.querySelector('[data-wd100nm]').click();await W8(300);o.all=q('.wd100pn');o.bad=q('.wd100pn.bad');
  const c={};for(const f of ['h','r','a','e']){WD100.nf=f;MGR_REDRAW();await W8(200);c[f]=q('.wd100pn')}o.sum=c.h+c.r+c.a+c.e;o.c=c;WD100.nf='all';
  MGR_REDRAW();await W8(250);o.eds=q('.wd100arc [data-mg="arcpap"]');o.papers=(w.papers||[]).length;
  if(o.eds){document.querySelector('.wd100arc [data-mg="arcpap"]').click();await W8(300);o.paper=!!document.querySelector('#mgrBody .wd100arc .paper');const bk=document.querySelector('#mgrBody .wd100arc [data-mg="arcback"]');o.back=!!bk;if(bk){bk.click();await W8(250)}}
  o.recaps=!!document.querySelector('#mgrBody .wd100arc')&&/Season recaps/.test(document.querySelector('#mgrBody .wd100arc').textContent);
  w.news.pop();WD100.nmore=false;return o});
ok(out.news.btn&&out.news.all>=out.news.want&&out.news.all>out.news.first&&out.news.sum===out.news.all&&out.news.bad>=1,'1b every notice of the old list is on the wall, the filters cover them '+JSON.stringify(out.news));
ok(out.news.eds===out.news.papers&&out.news.eds>=1&&out.news.paper&&out.news.back&&out.news.recaps,'1b the Ludus Archives (editions open, back, season recaps) sit under the wall '+JSON.stringify([out.news.eds,out.news.papers,out.news.paper,out.news.back,out.news.recaps]));

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
/* 3b · the old full ledger's facts live in the house card (a rival's and your own) */
out.led=await pg.evaluate(async id=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const o={};const names=()=>[...document.querySelectorAll('#mgrBody .wd100hc .wd100led .kv>span:first-child')].map(x=>x.textContent.trim());
  const vals=()=>[...document.querySelectorAll('#mgrBody .wd100hc .wd100led .kv>span:last-child')].map(x=>x.textContent.trim());
  MGR.tab='league';MGR.lg90=id;MGR_REDRAW();await W8(300);o.rival=names();o.rv=vals();const R=mgrById(id);o.coin=document.querySelector('#mgrBody .wd100hc .wd100led').textContent.includes(String(R.coin));o.fame=document.querySelector('#mgrBody .wd100hc .wd100led').textContent.includes(String(R.fame||0));
  MGR.lg90=null;MGR_REDRAW();await W8(300);o.mine=names();o.fold=!!document.querySelector('#mgrBody .wd100fold');return o},out.setup.rival);
{const all=['Roster','Fame','Treasury','Morale','Rivals','All-time','Bets','Personality','Latest event','Prize now'];
  ok(all.every(x=>out.led.rival.includes(x))&&out.led.rival.includes('Toward you')&&all.every(x=>out.led.mine.includes(x))&&!out.led.mine.includes('Toward you')&&out.led.rv.every(v=>v.length)&&out.led.coin&&out.led.fame&&!out.led.fold,'3b the ledger (roster, fame, treasury, morale, rivals/heat, record, bets, personality, latest event) is in the house card '+JSON.stringify(out.led))}

/* 4 · a pin opens the city card beside it; Walk the square only when the square is open; no Plan a trip */
out.cc=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='imp';WD100.city=null;MGR_REDRAW();await W8(250);const o={pins:document.querySelectorAll('#mgrBody .wd100pin').length,host:!!document.querySelector('#mgrBody .wd100pin.host')};
  const w=W_();const res=[];for(const li of [w.night.loc,LOCATIONS.findIndex((L,i)=>L&&i!==w.night.loc)]){document.querySelector(`#mgrBody .wd100pin[data-wd100c="${li}"]`).click();await W8(250);
    const c=document.querySelector('#mgrBody .wd100map .wd100cc');const walk=c&&c.querySelector('[data-ct="square"]');const gate=citySquareGate(li);
    const pr=document.querySelector(`#mgrBody .wd100pin[data-wd100c="${li}"] .dot`).getBoundingClientRect(),cr=c?c.getBoundingClientRect():null;
    res.push({li,card:!!c&&c.offsetParent!==null,name:c&&c.textContent.includes(LOCATIONS[li].n),walk:!!walk,gate:!!gate,ok:!!walk===!gate,trip:/Plan a trip/i.test(c?c.textContent:''),beside:cr?Math.abs((cr.left+cr.right)/2-(pr.left+pr.right)/2)<480&&(cr.right<pr.left+4||cr.left>pr.right-4):false,art:!!(c&&c.querySelector('.cimg'))})}
  o.res=res;document.querySelector('#mgrBody .wd100cc .x').click();await W8(200);o.closed=!document.querySelector('#mgrBody .wd100cc');o.ev=document.querySelectorAll('#mgrBody .wd100wev').length;return o});
ok(out.cc.pins===12&&out.cc.host&&out.cc.res.every(r=>r.card&&r.name&&r.ok&&!r.trip&&r.beside)&&out.cc.closed&&out.cc.ev>=1,'4 city card from a pin, beside it, walk only when open, no Plan a trip '+JSON.stringify(out.cc));
if(SHOT){await pg.evaluate(async()=>{WD100.city=W_().night.loc;MGR_REDRAW()});await pg.waitForTimeout(300);await pg.screenshot({path:path.join(SHOT,'w2_imp.png')})}
/* 4b · the old map's layers are toggle chips on the new map (fans & roads, weather, world events, war map); the old map is gone, its city file sits under it */
out.lay=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelectorAll('#mgrBody '+s).length;const o={};const click=k=>{document.querySelector(`#mgrBody [data-wd100lay="${k}"]`).click()};
  MGR.tab='imp';WD100.city=null;WD100.lay={fans:1,weather:1,events:1,war:0};MGR_REDRAW();await W8(300);
  o.chips=q('.wd100map [data-wd100lay]');o.on=[...document.querySelectorAll('#mgrBody [data-wd100lay].on')].map(x=>x.dataset.wd100lay).join();o.oldMap=q('svg.impmap');
  o.fans1=q('.wd100lay .fansg');o.wx1=q('.wd100lay .wx');o.badges1=q('.wd100pin .badg');o.warOff=q('.wd100lay .warg');
  click('fans');await W8(250);o.fans0=q('.wd100lay .fansg');o.fansPr=document.querySelector('#mgrBody [data-wd100lay="fans"]').getAttribute('aria-pressed');o.glow0=q('.wd100pin .warm');
  click('weather');await W8(250);o.wx0=q('.wd100lay .wx');o.badges2=q('.wd100pin .badg');
  click('events');await W8(250);o.badges3=q('.wd100pin .badg');
  click('war');await W8(250);o.war1=q('.wd100lay .warg');
  /* the city file: view tabs re-render in place, no old map comes back */
  const fv=document.querySelector('#mgrBody .wd100file [data-hubview="roster"]');o.fv=!!fv;if(fv){fv.click();await W8(250);o.view=HUB.view;o.file=q('#standsHubBody.wd100file');o.oldMap2=q('svg.impmap');document.querySelector('#mgrBody .wd100file [data-hubview="city"]').click();await W8(250);o.back=HUB.view}
  /* the stands window refresh keeps the Manager's file */
  try{renderDrawer()}catch(e){}o.kept=q('#standsHubBody.wd100file');o.oldMap3=q('svg.impmap');
  WD100.lay={fans:1,weather:1,events:1,war:0};HUB.view='city';return o});
ok(out.lay.chips===4&&out.lay.on==='fans,weather,events'&&!out.lay.oldMap&&out.lay.fans1>=1&&out.lay.wx1>=1&&out.lay.badges1>=1&&!out.lay.warOff,'4b four layer chips on the new map, the old map is gone '+JSON.stringify(out.lay));
ok(out.lay.fans0===0&&out.lay.fansPr==='false'&&out.lay.wx0===0&&out.lay.badges2<=out.lay.badges1&&out.lay.badges3<=out.lay.badges2&&out.lay.war1>=1,'4b each chip switches its layer '+JSON.stringify(out.lay));
ok(out.lay.fv&&out.lay.view==='roster'&&out.lay.file===1&&!out.lay.oldMap2&&out.lay.back==='city'&&out.lay.kept===1&&!out.lay.oldMap3,'4b the city file (view tabs) works in place and survives the stands refresh '+JSON.stringify([out.lay.fv,out.lay.view,out.lay.file,out.lay.oldMap2,out.lay.back,out.lay.kept,out.lay.oldMap3]));

/* 5 · the Tituli: trophy art (svg/img), never emoji; season-award progress hidden before week 12 (his 4c); earning one lights it */
out.tit=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const EMO=/\p{Extended_Pictographic}/u;MGR.tab='trophy';WD100.tf='mgr';MGR_REDRAW();await W8(250);const o={};const w=W_();const q=s=>document.querySelectorAll('#mgrBody '+s);
  const P=[...q('.wd100tp')];o.n=P.length;o.lib=TROPHY_LIB.length;o.art=P.every(p=>p.querySelector('.art svg,.art img'));o.emoji=P.filter(p=>EMO.test(p.querySelector('.art').textContent)||EMO.test(p.querySelector('b').textContent)).length;
  o.lock=P.filter(p=>p.classList.contains('lock')).length;o.week=w.week;
  /* before week 12: no tally on any season-award plaque, the plaque says it comes at season's end */
  const sea=P.filter(p=>{const d=TROPHY_LIB.find(x=>x.id===p.dataset.wd100tp);return d&&(d.cat==='season'||d.cat==='fun')&&d.id!=='palm_roma'});
  o.seaN=sea.length;o.seaProg=sea.filter(p=>p.querySelector('.prog i')).length;o.seaHint=sea.filter(p=>/awarded at season/.test(p.querySelector('.prog').textContent)).length;
  const w0=w.week;w.week=12;MGR_REDRAW();await W8(250);o.prog12=q('.wd100tp .prog i').length;w.week=w0;
  /* the banner: nothing earned → four empty plinths and the invitation */
  MGR_REDRAW();await W8(250);const bn=document.querySelector('#mgrBody .wd100ban');o.none={pl:bn.querySelectorAll('.wd100tro.none .wd100pl').length,tro:bn.querySelectorAll('.wd100pl .tr').length,txt:/Your first honour awaits/.test(bn.textContent),chip:/0 \/ \d+/.test(bn.textContent),all:!!bn.querySelector('.wd100all')};
  /* earn a few: only earned ones, most prestigious first (cups, then other awards by recency) */
  const E=id=>earnTrophy(w,id,{who:'Testus',why:'test'});E('tiro');o.lit=false;MGR_REDRAW();await W8(250);const t=document.querySelector('#mgrBody .wd100tp[data-wd100tp="tiro"]');o.lit=!!t&&!t.classList.contains('lock')&&/Testus/.test(t.textContent);
  o.one={tro:document.querySelectorAll('#mgrBody .wd100ban .wd100pl .tr').length,none:!!document.querySelector('#mgrBody .wd100ban .wd100tro.none')};
  E('horn');E('flavian_cup');E('aureus');E('darling');MGR_REDRAW();await W8(250);o.some=[...document.querySelectorAll('#mgrBody .wd100ban .wd100pl')].map(x=>x.title);o.someChip=/5 \/ \d+/.test(document.querySelector('#mgrBody .wd100ban').textContent);
  /* all earned: the four most prestigious + a laurel ring round "ALL n" */
  for(const d of TROPHY_LIB)if(!(w.trophies||[]).some(x=>x.tid===d.id))E(d.id);MGR_REDRAW();await W8(250);const b2=document.querySelector('#mgrBody .wd100ban');
  o.all={names:[...b2.querySelectorAll('.wd100pl')].map(x=>x.title),ring:!!b2.querySelector('.wd100all svg'),txt:(b2.querySelector('.wd100all')||{}).textContent||'',chip:!!b2.querySelector('.wd100bc')};
  for(const f of ['pn','onl']){WD100.tf=f;MGR_REDRAW();await W8(400);const Q=[...document.querySelectorAll('#mgrBody .wd100tp')];o[f]=Q.length&&Q.every(p=>p.querySelector('.art svg,.art img'))&&!Q.some(p=>EMO.test(p.querySelector('.art').textContent))}
  WD100.tf='mgr';return o});
ok(out.tit.n===out.tit.lib&&out.tit.art&&!out.tit.emoji&&out.tit.lock===out.tit.n&&out.tit.lit&&out.tit.pn&&out.tit.onl,'5 Tituli plaques: art not emoji, earned lit, Play Now + Online filters '+JSON.stringify(out.tit));
ok(out.tit.seaN>=10&&out.tit.seaProg===0&&out.tit.seaHint===out.tit.seaN&&out.tit.prog12>=1,'5 season-award progress hidden before week 12, shown in week 12 '+JSON.stringify([out.tit.week,out.tit.seaN,out.tit.seaProg,out.tit.seaHint,out.tit.prog12]));
ok(out.tit.none.pl===4&&out.tit.none.tro===0&&out.tit.none.txt&&out.tit.none.chip&&!out.tit.none.all,'5 banner, none earned: four empty plinths + "Your first honour awaits" '+JSON.stringify(out.tit.none));
ok(out.tit.one.tro===1&&!out.tit.one.none&&out.tit.some.join('|')==='The Flavian Cup|The Aureus Gladius|Darling of the Stands|The Bestiarius Horn'&&out.tit.someChip,'5 banner shows only earned ones, cups first then the most recent '+JSON.stringify([out.tit.one,out.tit.some]));
ok(out.tit.all.names.join('|')==='The Flavian Cup|The Superbus Cup|The Aureus Gladius|The Colossus Crown'&&out.tit.all.ring&&/ALL\s*\d+/.test(out.tit.all.txt)&&!out.tit.all.chip,'5 banner, all earned: the four most prestigious + a laurel ring "ALL n" '+JSON.stringify(out.tit.all));
if(SHOT)await pg.screenshot({path:path.join(SHOT,'w2_trophy_all.png')});
/* 6 · the Calendar: three seasons, current week highlighted on tablets and in the list, contrast ≥ 4.5 */
out.cal=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={s:[]};const w=W_();MGR.tab='sched';
  for(const s of [0,1,2]){WD100.sea=s;MGR_REDRAW();await W8(300);const B=document.getElementById('mgrBody');const T=[...B.querySelectorAll('.wd100cal .wd100wk')];
    o.s.push({n:T.length,now:B.querySelectorAll('.wd100wk.now').length,fut:B.querySelectorAll('.wd100wk.fut').length,rows:B.querySelectorAll('.wd100sea .wd100sr').length,lnow:B.querySelectorAll('.wd100sr.now').length,
      on:(B.querySelector('[data-wd100s].on')||{}).dataset.wd100s,plq:(B.querySelector('.wd100plq b')||{}).textContent});
    const low=[];for(const el of [...__texts(B.querySelector('.wd100cal')),...[...B.querySelectorAll('.wd100two')].flatMap(x=>__texts(x))]){const r=__ratio(el);if(r<4.5)low.push(el.className+':'+el.textContent.trim().slice(0,16)+':'+r.toFixed(2))}o.s[s].low=low}
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
/* 6f · Billing + invitations live in the Calendar as one-line rows (the old Season table is gone); the handlers are the old ones */
out.bill=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const o={};WD100.sea=0;MGR.tab='sched';
  const sid=Object.keys(SPECIALS)[0];const D=specDef(sid);w.invites=w.invites||[];w.invites.push({id:'ivT1',sid,wk:w.week+3,status:'open',ents:[],n:D.n});MGR_REDRAW();await W8(300);
  const B=()=>document.getElementById('mgrBody');const q=s=>B().querySelectorAll(s);
  o.rows=q('.wd100bill .wd100sr.bill').length;o.table=q('table.stable2').length;o.heads=[...q('.wd100bill .wd100plq b')].map(x=>x.textContent.trim());
  o.tall=[...q('.wd100bill .wd100sr')].filter(r=>r.offsetHeight>40).length;
  const sels=[...q('.wd100bill select[id^="cm_"]')];o.sels=sels.length;const abs=+sels[0].id.slice(3);const g=rosterOf(me())[0];sels[0].value=g.id;B().querySelector(`[data-mg="cm_set"][data-id="${abs}"]`).click();await W8(300);o.set=!!(w.commits&&w.commits[abs]&&w.commits[abs].gid===g.id);
  MGR_REDRAW();await W8(250);o.named=[...q('.wd100bill .wd100sr.bill b')].some(b=>b.textContent===g.name);const un=B().querySelector(`[data-mg="cm_undo"][data-id="${abs}"]`);o.undo=!!un;if(un){un.click();await W8(300)}o.cleared=!(w.commits&&w.commits[abs]);
  MGR_REDRAW();await W8(250);o.iv=q('.wd100bill .wd100sr.iv:not(.past)').length;const ob=B().querySelector('[data-mg="iv_open"][data-id="ivT1"]');o.open=!!ob;if(ob){ob.click();await W8(300)}
  o.pick=document.querySelectorAll('.iv96bg .iv96s').length;o.slots=D.slots;o.acc=!!document.querySelector('.iv96bg [data-iv96="ok"]');o.dec=!!document.querySelector('.iv96bg [data-iv96="dec"]');
  const s0=document.querySelector('.iv96bg .iv96s');if(s0){s0.value=g.id;s0.dispatchEvent(new Event('change',{bubbles:true}));await W8(100);document.querySelector('.iv96bg [data-iv96="ok"]').click();await W8(300)}o.accepted=(w.invites.find(x=>x.id==='ivT1')||{}).status==='accepted';
  MGR_REDRAW();await W8(250);o.wd=!!B().querySelector('[data-mg="iv_withdraw"][data-id="ivT1"]');
  w.invites=w.invites.filter(x=>x.id!=='ivT1');w.special=w.special&&w.special.done?w.special:w.special;MGR.ivOpen=null;
  WD100.sea=1;MGR_REDRAW();await W8(250);o.nextNoBill=q('.wd100bill').length===0;WD100.sea=0;return o});
ok(out.bill.rows>=1&&!out.bill.table&&out.bill.heads.includes('Billing')&&out.bill.heads.includes('Invitations')&&!out.bill.tall,'6f Billing + Invitations in the Calendar, one-line rows, no old table '+JSON.stringify([out.bill.rows,out.bill.table,out.bill.heads,out.bill.tall]));
ok(out.bill.sels>=1&&out.bill.set&&out.bill.named&&out.bill.undo&&out.bill.cleared,'6f early billing works from the Calendar (pin, shows the name, ✕ withdraws) '+JSON.stringify([out.bill.sels,out.bill.set,out.bill.named,out.bill.undo,out.bill.cleared]));
ok(out.bill.iv>=1&&out.bill.open&&out.bill.pick===out.bill.slots&&out.bill.acc&&out.bill.dec&&out.bill.accepted&&out.bill.wd,'6f an invitation: Answer opens the fighter popup, Accept books it, Withdraw appears '+JSON.stringify(out.bill));
ok(out.bill.nextNoBill,'6f no billing section on the later seasons\' fixtures');

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
