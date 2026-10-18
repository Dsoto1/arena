/* tv105ab — v1.05 B73 (390-v105wban, his L1a L2a): the Lanista tab and the five World tabs (News, League, Imperium, Tituli, Season) wear the
   slim banner of the Roster / Yard (388's .cp105ban): each banner = the Roster banner ±2 px at 1440 (and in German), the picture + face + title
   kept (.roomhd.b73 + .roomttl), the counters as chips; League: three medal chips 🥇🥈🥉 (house parma + short name + points = the table's top
   three, the old podium is gone); Tituli: ≤ 4 small earned-trophy icons + an "N of M" chip (none earned = "Your first honour awaits" as the one
   line; all earned = a gold N of N chip); 390 px: no sideways scroll, chips wrap and stay inside; kill switch flavius_v105wbanoff=1 = today's
   painted banners. SHOT=<dir> saves screenshots (the six banners at 1440 + the Training Yard at 2000x1150, 1440x900, 390x844). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT;
const open=async(W,H,o)=>{o=o||{};const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_v105wbanoff','1');if(o.lang){localStorage.setItem('flavius_lang',o.lang);localStorage.setItem('flavius_langask86','1')}},{off:o.off?1:0,lang:o.lang||''});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    /* a settled league: three houses with points so the podium order is stable */
    {const rv=w.mgrs.filter(x=>!x.isPlayer);const fx=(x,pts,wn,bb)=>{const q=msp(x);q.pts=pts;q.w=wn;q.b=bb};fx(rv[0],9,3,3);fx(rv[1],8,2,4);fx(pm,3,1,3)}
    window.TAB=async t=>{MGR.view=null;MGR.tab=t;if(t==='me')MGR.teamId=me().id;MGR_REDRAW();await W8(500);const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0;await W8(60)};
    window.BOX=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),b:Math.round(r.bottom),r:Math.round(r.right)}};
    window.HSCROLL=()=>{const mb=document.getElementById('mBody');return document.documentElement.scrollWidth>innerWidth+1||(!!mb&&mb.scrollWidth>mb.clientWidth+1)};
    menuHide();openManager('roster');await W8(800);await TAB('roster')},{});return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,400));await b.close();process.exit(1)}};
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:`${SHOT}/${n}.png`})};
const BAN='#mgrBody .roomhd';
const TABS=['news','league','imp','trophy','sched','me'];
/* measures the six banners + the Roster (reference) in the page */
const measure=async pg=>ev(pg,async(a)=>{const q=s=>document.querySelector(s);const r={};await TAB('roster');r.roster=BOX(a.BAN).h;
  for(const t of a.TABS){await TAB(t);const hd=q(a.BAN);const ttl=hd&&hd.querySelector('.roomttl');r[t]={h:hd?BOX(a.BAN).h:-1,slim:!!hd&&hd.classList.contains('cp105ban'),b73:!!hd&&hd.classList.contains('b73')&&hd.classList.contains('b73-'+t),ttl:!!ttl,
    title:((hd&&(hd.querySelector('.roomttl h2,.roomttl b'))||{}).textContent||'').trim(),face:!!hd&&!!hd.querySelector('.wd100ico,.wb105f'),chips:hd?hd.querySelectorAll('.roomstat').length:0,
    over:!!hd&&hd.scrollWidth>hd.clientWidth+1,right:hd?Math.max(0,...[...hd.querySelectorAll('.roomstat,.wd100ico,.wb105f')].map(e=>Math.round(e.getBoundingClientRect().right))):0,hscroll:HSCROLL(),tall:hd?hd.getBoundingClientRect().width:0}}
  return r},{BAN,TABS});

/* ---- 1440x900 ---- */
const pg=await open(1440,900);
const m=await measure(pg);console.log('H1440',JSON.stringify(Object.fromEntries(Object.entries(m).map(([k,v])=>[k,v.h??v]))));
for(const t of TABS){ok(m[t].slim&&m[t].b73&&m[t].ttl,t+': the slim banner, still .roomhd.b73.b73-'+t+' with .roomttl');ok(m[t].h>0&&Math.abs(m[t].h-m.roster)<=2,t+': banner '+m[t].h+' px = the Roster banner ('+m.roster+') ±2');ok(m[t].face&&m[t].title,t+': face + title kept ('+m[t].title+')')}
for(const t of ['news','imp','sched'])ok(m[t].chips>=1,t+': its numbers are chips');
/* League */
const lg=await ev(pg,async BAN=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];await TAB('league');const w=W_();const Ls=leagueSort(w.mgrs);const hd=q(BAN);
  const ch=qa(BAN+' .wb105med');return {n:ch.length,medals:ch.map(c=>c.querySelector('.wb105m').textContent).join(''),pts:ch.map(c=>+c.querySelector('.wb105p').textContent.replace(/\D.*/,'')),want:Ls.slice(0,3).map(x=>msp(x).pts),
    names:ch.map(c=>c.querySelector('.wb105n').textContent),wantN:Ls.slice(0,3).map(x=>String(x.ludus).replace(/^\s*Ludus\s+/i,'')),parma:ch.every(c=>!!c.querySelector('.wd100parma')),mine:ch.filter(c=>c.classList.contains('me')).length,tip:ch.every(c=>!!c.title),
    oldPod:!!q(BAN+' .lp96pod'),season:!!q(BAN+' [data-mg="tab"][data-id="sched"]'),tbl:qa('#mgrPane .wd100lgt .wd100r').length}},BAN);
console.log('LEAGUE',JSON.stringify(lg));
ok(lg.n===3&&lg.medals==='\u{1F947}\u{1F948}\u{1F949}','League: three medal chips 🥇🥈🥉 '+lg.medals);ok(lg.pts.join()===lg.want.join(),'League chips = the table\'s top 3 points '+lg.pts+' / '+lg.want);ok(lg.names.every((n,i)=>n.length&&lg.wantN[i].startsWith(n.replace(/…$/,''))),'League chips: short house names '+lg.names);
ok(lg.parma&&lg.tip&&lg.mine===1&&!lg.oldPod&&lg.season&&lg.tbl>=3,'League: house parma on every chip, the prize line as title, mine marked, the old podium gone, Season button kept '+JSON.stringify([lg.parma,lg.tip,lg.mine,lg.oldPod,lg.season,lg.tbl]));
await shot(pg,'ab-league-1440');
/* Tituli */
const tr=await ev(pg,async BAN=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const w=W_();const r={};const E=id=>earnTrophy(w,id,{who:'Testus',why:'test'});
  const read=async()=>{await TAB('trophy');const hd=q(BAN);const c=hd.querySelector('.wb105of');return {ico:hd.querySelectorAll('.wb105tro .wd100pl').length,svg:hd.querySelectorAll('.wb105tro .wd100pl .tr svg').length,w:Math.round(((hd.querySelector('.wb105tro .tr svg')||{getBoundingClientRect:()=>({width:0})}).getBoundingClientRect()).width),chip:c?c.textContent.replace(/\s+/g,' ').trim():'',sub:(hd.querySelector('.sub')||{}).textContent||'',old:!!hd.querySelector('.wd100tro,.wd100all'),all:!!c&&c.classList.contains('all'),h:BOX(BAN).h,names:[...hd.querySelectorAll('.wb105tro .wd100pl')].map(x=>x.title)}};
  r.none=await read();
  E('tiro');r.one=await read();
  E('horn');E('flavian_cup');E('aureus');E('darling');r.some=await read();
  r.M=tit100Mgr().length;for(const d of TROPHY_LIB)if(!(w.trophies||[]).some(x=>x.tid===d.id))E(d.id);r.all=await read();return r},BAN);
console.log('TRO',JSON.stringify(tr));
ok(tr.none.ico===0&&/Your first honour awaits/.test(tr.none.sub)&&/^0 of \d+\s*earned$/.test(tr.none.chip)&&!tr.none.old,'Tituli, none earned: no icons, "Your first honour awaits" is the one line, "0 of M earned" '+JSON.stringify(tr.none));
ok(tr.one.ico===1&&tr.one.svg===1&&!/first honour/.test(tr.one.sub)&&/^1 of \d+\s*earned$/.test(tr.one.chip),'Tituli, one earned: one icon + "1 of M earned" '+JSON.stringify(tr.one));
ok(tr.some.ico===4&&tr.some.names.join('|')==='The Flavian Cup|The Aureus Gladius|Darling of the Stands|The Bestiarius Horn'&&/^5 of \d+\s*earned$/.test(tr.some.chip),'Tituli: at most 4 icons, cups first then the most recent, "5 of M" '+JSON.stringify(tr.some));
ok(tr.some.w>=20&&tr.some.w<=24,'Tituli: the icons are ~22 px ('+tr.some.w+')');
ok(tr.all.ico===4&&tr.all.names.join('|')==='The Flavian Cup|The Superbus Cup|The Aureus Gladius|The Colossus Crown'&&new RegExp('^'+tr.M+' of '+tr.M+'\\s*earned$').test(tr.all.chip)&&tr.all.all,'Tituli, all earned: the four most prestigious + a gold "N of N" chip '+JSON.stringify(tr.all));
ok([tr.none,tr.one,tr.some,tr.all].every(x=>Math.abs(x.h-m.roster)<=2),'Tituli banner stays the Roster height in every state '+[tr.none.h,tr.one.h,tr.some.h,tr.all.h]);
await shot(pg,'ab-trophy-1440');
/* the Lanista's unspent perk points (317) = a chip in the slim banner */
const pk2=await ev(pg,async BAN=>{const pm=me();pm.perkPts=3;await TAB('me');const hd=document.querySelector(BAN);const c=hd.querySelector('.roomstat .ptbox');const r={n:c?c.textContent:'',chip:!!hd.querySelector('.roomstat.cp105c'),h:BOX(BAN).h};pm.perkPts=0;await TAB('me');return r},BAN);
console.log('PERK',JSON.stringify(pk2));ok(pk2.n==='3'&&pk2.chip&&Math.abs(pk2.h-m.roster)<=2,'Lanista: 3 perk points = a chip, banner still the Roster height '+JSON.stringify(pk2));
if(SHOT){for(const t of ['news','imp','sched','me']){await ev(pg,async t=>{await TAB(t)},t);await shot(pg,'ab-'+t+'-1440')}}
/* the Yard shots for the lead */
if(SHOT){await ev(pg,async()=>{await TAB('practice')});await shot(pg,'yard-1440x900');await pg.setViewportSize({width:2000,height:1150});await pg.waitForTimeout(500);await ev(pg,async()=>{await TAB('practice')});await shot(pg,'yard-2000x1150');await pg.setViewportSize({width:1440,height:900})}
await pg.close();

/* ---- German at 1440 ---- */
const pd=await open(1440,900,{lang:'de'});
const md=await measure(pd);
for(const t of TABS)ok(md[t].slim&&Math.abs(md[t].h-md.roster)<=2&&!md[t].over,'German '+t+': banner '+md[t].h+' px = the Roster ('+md.roster+') ±2, nothing clipped sideways');
await pd.close();

/* ---- 390x844 ---- */
const ph=await open(390,844);
const mp=await measure(ph);console.log('H390',JSON.stringify(Object.fromEntries(Object.entries(mp).map(([k,v])=>[k,v.h??v]))));
for(const t of TABS)ok(mp[t].slim&&!mp[t].hscroll&&!mp[t].over&&mp[t].right<=391,'390 px '+t+': no sideways scroll, chips inside the banner (right '+mp[t].right+')');
await ev(ph,async()=>{await TAB('league')});await shot(ph,'ab-league-390');await ev(ph,async()=>{await TAB('practice')});await shot(ph,'yard-390x844');await ph.close();

/* ---- kill switch ---- */
const pk=await open(1440,900,{off:1});
const k=await ev(pk,async BAN=>{const q=s=>document.querySelector(s);const r={};for(const t of ['league','trophy','news','me']){await TAB(t);r[t]={slim:!!q('.wb105'),h:BOX(BAN).h}}
  await TAB('league');r.pod=!!q(BAN+' .lp96pod');await TAB('trophy');r.tro=!!q(BAN+' .wd100tro');return r},BAN);
console.log('OFF',JSON.stringify(k));
ok(!k.league.slim&&!k.trophy.slim&&!k.news.slim&&!k.me.slim&&k.pod&&k.tro&&k.league.h>100&&k.news.h>100,'kill switch: today\'s painted banners (podium + plinths, tall)');
await pk.close();
console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
