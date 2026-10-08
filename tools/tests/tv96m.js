/* v0.96 part A — MANAGER (231-v96mgr): 1 trait cards on the perk card (letter grade, green +2 preview, the button still pays) · 2 "Save and Exit" ·
   3 Standings: podium + table (Ludus / Top gladiator / Record / Latest event, no prize or Quaestor column, hover = prizes) · 4 the Acta card of each finished
   week beside Billing · 5 Match Week road box (note inside, no next-prize line, no Gear-up tile) + the next-prize letter once a week · 6 a warning for
   another city is dropped · 8 any fighter on a card clears "none entered" · 11 Answer = fighter picker + Accept · 13 anvil rail icon + Damaged section
   on the right of the Armory. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W=ms=>pg.waitForTimeout(ms);const SHOT=process.env.SHOT||'';
const mark=await pg.evaluate(()=>ERR92.n);
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let sd=96;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;me().coin=3000;MGR.tab='ludus';MGR_REDRAW();await W8(400)});
/* ---- 1 · trait cards ---- */
const r1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const m=me(),o={};m.perkPts=3;MGR.tab='me';MGR_REDRAW();await W8(500);
  const cs=[...document.querySelectorAll('#schoolCard .pk96c')];o.n=cs.length;o.want=MGR_KEYS.length;o.chip=cs.every(c=>c.querySelector('.grade'));o.gain=cs.filter(c=>/^\+\d → \d+/.test((c.querySelector('.pk96gain')||{}).textContent||'')).length;
  o.green=cs[0]&&getComputedStyle(cs[0].querySelector('.pk96gain')).color;o.old=!!document.querySelector('#schoolCard .acts [data-mg="perk"]');
  const k=MGR_KEYS[0][0];const v0=m.p[k];const bt=document.querySelector(`#schoolCard .pk96c [data-mg="perk"][data-id="${k}"]`);bt.click();await W8(400);o.paid=m.p[k]===v0+2&&m.perkPts===2;
  o.grades=[trait96Grade(95),trait96Grade(70),trait96Grade(10)].join('');return o});
ok(r1.n===r1.want&&r1.chip&&r1.gain===r1.want,'1 a trait card per trait with a grade chip and a +N → preview '+JSON.stringify(r1));ok(/^rgb\((1[0-4]\d|[5-9]\d), *(1[6-9]\d|2\d\d)/.test(r1.green||''),'1 the preview is green '+r1.green);
ok(r1.paid&&!r1.old,'1 Hone pays 1 point for +2 (old row gone) '+JSON.stringify(r1));ok(r1.grades==='A+BF','1 grades A+/B/F '+r1.grades);
if(SHOT){await W(300);await pg.screenshot({path:SHOT+'/tv96m_traits.png'})}
/* ---- 2 · Save and Exit ---- */
const r2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='ludus';MGR_REDRAW();await W8(300);MGR.tab='me';MGR_REDRAW();await W8(300);
  const t=[...document.querySelectorAll('#mgrPane [data-mg="quit"],#mgrBody [data-mg="quit"],[data-mg="quit"]')].map(x=>x.textContent.trim());return t});
ok(r2.includes('Save and Exit')&&!r2.some(x=>/leave this career/.test(x)),'2 Save and Exit '+JSON.stringify(r2));
/* ---- 3 · standings ---- */
const r3=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const rv=w.mgrs.filter(x=>!x.isPlayer);msp(rv[0]).pts=9;msp(rv[1]).pts=6;msp(m).pts=3;
  const g=rosterOf(rv[0])[0];if(g)g.recent=[{s:w.season,wk:1,t:'Feature',ev:'Egidious',loc:'Roma',place:1,won:true}];
  MGR.tab='league';MGR_REDRAW();await W8(500);const B=document.getElementById('mgrBody');const o={};const box=B.querySelector('.lp96');o.box=!!box;
  o.pod=[...B.querySelectorAll('.lp96pod .lp96p')].map(x=>x.className.replace(/\s*me/,'').replace('lp96p ',''));o.cup=!!B.querySelector('.lp96p.p1 .lp96cup svg');
  o.tip=(B.querySelector('.lp96p.p1')||{}).title||'';o.tip2=(B.querySelector('.lp96p.p2')||{}).title||'';
  const th=[...B.querySelectorAll('.lp96t tr:first-child th')].map(x=>x.textContent.trim());o.th=th;o.txt=B.querySelector('.lp96').textContent;
  o.rows=B.querySelectorAll('.lp96t tr').length-1;o.me=!!B.querySelector('.lp96t tr.me');o.latest=/won/.test(B.querySelector('.lp96t tr:nth-child(2)').textContent);
  o.rec=/^\d+-\d+$/.test(B.querySelector('.lp96t tr:nth-child(2) td:nth-child(4)').textContent.trim());return o});
ok(r3.box&&r3.pod.join()==='p2,p1,p3'&&r3.cup,'3 podium 2nd-1st-3rd with the cup on 1st '+JSON.stringify(r3.pod));ok(/120/.test(r3.tip)&&/Superbus/.test(r3.tip)&&/Quaestor/.test(r3.tip)&&/80/.test(r3.tip2),'3 hover = the season-finish prizes '+r3.tip);
ok(r3.th.join('|')==='Place|Ludus|Top gladiator|Record|Latest event|Superbus','3 table columns '+r3.th.join('|'));ok(!/Quaestor|League prize/.test(r3.txt.replace(/Quaestor's/g,'')===r3.txt?r3.txt:r3.txt),'3 no Quaestor / prize column');
ok(r3.rows>=Math.min(6,4)&&r3.rows<=8&&r3.me&&r3.latest&&r3.rec,'3 rows, your row lit, record + latest event '+JSON.stringify(r3));
if(SHOT){await W(300);await pg.screenshot({path:SHOT+'/tv96m_league.png'})}
/* ---- 4 · Acta card per finished week ---- */
const r4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};
  /* the week's real end: fight whatever is entered, then end it */
  for(const x of w.night.bouts){x.done=true;x.res=x.res||{att:0,winners:[],rows:[],turns:1,lines:[],reason:''}}w.pend=[];
  const b0=w.night.bouts[0];const mine=rosterOf(m)[0];b0.ents[0]=mine.id;b0.res={att:1,winners:[mine.id],rows:[{gid:mine.id,place:1,won:true,f:5,fname:'',alive:true}],turns:3,lines:[],reason:'x'};
  const wk=w.week;const ok2=await endWeek();o.ok=ok2;o.stored=!!(w.acta96&&w.acta96[wk]);o.rows=o.stored?w.acta96[wk].rows.length:0;o.row=o.stored?w.acta96[wk].rows[0]:null;
  MGR.tab='sched';MGR_REDRAW();await W8(500);const B=document.getElementById('mgrBody');const ths=[...B.querySelectorAll('table.stable2 tr:first-child th')].map(x=>x.textContent.trim());o.ths=ths;
  const cell=B.querySelector('table.stable2 tr.spast td.sact96');o.cell=cell?cell.textContent.trim():null;o.past=B.querySelectorAll('table.stable2 tr.spast').length;
  o.colsOk=[...B.querySelectorAll('table.stable2 tr')].every(tr=>[...tr.children].reduce((a,c)=>a+(c.colSpan||1),0)===ths.length);return o});
ok(r4.ok!==false&&r4.stored&&r4.rows>=1&&r4.row&&r4.row.w===true,'4 the week\'s results card is stored in w.acta96 '+JSON.stringify(r4));ok(/Billing/.test(r4.ths[5]||'')&&/Acta/.test(r4.ths[6]||''),'4 an Acta column right of Billing '+JSON.stringify(r4.ths));
ok(r4.past>=1&&r4.cell&&/🏆|1st/.test(r4.cell),'4 the finished week shows its bouts '+r4.cell);ok(r4.colsOk,'4 every season row spans the new column');
if(SHOT){await W(300);await pg.screenshot({path:SHOT+'/tv96m_season.png'})}
/* ---- 5 · Match Week road box + next-prize letter ---- */
const r5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};
  const rv=w.mgrs.filter(x=>!x.isPlayer);msp(rv[0]).pts=30;msp(rv[1]).pts=20;msp(m).pts=1;
  w.letters=(w.letters||[]).filter(l=>l.key!=='lp96');w.lp96=null;
  /* a Consilium letter for THIS city sits inside the road box */
  sendLetter(w,{key:'consil-'+w.week,from:'the Consilium',seal:'🏛',title:'Counsel for here',body:'<p>hold back</p>',until:w.week});
  MGR.tab='night';MGR_REDRAW();await W8(700);const B=document.getElementById('mgrBody');const tc=B.querySelector('.travelcard');
  o.tc=!!tc;o.note=!!(tc&&tc.querySelector('.road96note [data-mailgo]'));o.noline=!B.querySelector('.lp90next');o.nogear=!B.querySelector('[data-arm94sq]')&&!B.querySelector('.ar94mw');
  o.loose=!![...B.querySelectorAll('.mailline')].some(x=>/Consilium/.test(x.textContent));
  /* the letter: once, when the standing changed; not again the same week */
  MGR.tab='ludus';MGR_REDRAW();await W8(400);const L=(w.letters||[]).filter(l=>l.key==='lp96');o.letter=L.length===1&&/next prize|Top of the table/.test(L[0].title);o.lk=L.length&&L[0].title;
  w.letters=w.letters.filter(l=>l.key!=='lp96');MGR_REDRAW();await W8(300);o.once=!(w.letters||[]).some(l=>l.key==='lp96');
  return o});
ok(r5.tc&&r5.note&&!r5.loose,'5 the advisor\'s note is inside the road box '+JSON.stringify(r5));ok(r5.noline,'5 no next-prize line on Match Week');ok(r5.nogear,'5 no Gear-up tile on Match Week');
ok(r5.letter,'5 the next-prize line is a letter '+r5.lk);ok(r5.once,'5 and not sent twice in one week');
const r5b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='night';MGR_REDRAW();await W8(500);const tc=document.querySelector('.travelcard');const r=tc.getBoundingClientRect();const side=tc.querySelector('.road85side').getBoundingClientRect();
  return {h:Math.round(r.height),sideH:Math.round(side.height),w:Math.round(r.width)}});
ok(r5b.h<=r5b.sideH+40,'5 the road box is as tall as its content '+JSON.stringify(r5b));
if(SHOT){await W(300);await pg.screenshot({path:SHOT+'/tv96m_night.png'})}
/* ---- 6 · warnings only for this week's city ---- */
const r6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const o={};const loc=w.night.loc;
  sendLetter(w,{key:'consil-'+w.week,from:'the Consilium',seal:'🏛',title:'Counsel for Capua: hold our fighters back',body:'<p>x</p>',until:w.week});
  o.stamp=w.letters.find(l=>l.key==='consil-'+w.week).loc96===loc;
  /* the games move to another city: the old warning goes */
  w.letters.find(l=>l.key==='consil-'+w.week).loc96=(loc===3?4:3);MGR.tab='ludus';MGR_REDRAW();await W8(400);
  const L=w.letters.find(l=>l.key==='consil-'+w.week);o.dropped=!L||/Capua/.test(L.title)===false;o.mail=!/Counsel for Capua/.test(document.getElementById('mgrBody').textContent);
  /* last week's warning never shows */
  sendLetter(w,{key:'consil-'+(w.week-1),from:'the Consilium',seal:'🏛',title:'Counsel for Roma',body:'<p>old</p>',until:w.week});w.letters.find(l=>l.key==='consil-'+(w.week-1)).wk=w.week-1;
  MGR_REDRAW();await W8(300);o.old=!w.letters.some(l=>l.key==='consil-'+(w.week-1));return o});
ok(r6.stamp,'6 the Consilium letter is stamped with the host city');ok(r6.dropped&&r6.mail,'6 a warning for another city is dropped '+JSON.stringify(r6));ok(r6.old,'6 last week\'s warning is dropped');
/* ---- 8 · any fighter on a card clears "none entered" ---- */
const r8=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};const mineIds=new Set(rosterOf(m).map(g=>g.id));
  for(const b of w.night.bouts){b.ents=b.ents.map(id=>mineIds.has(id)?null:id);b.ents=b.ents.filter(x=>x)}
  MGR.tab='ludus';MGR_REDRAW();await W8(400);const txt=()=>[...document.querySelectorAll('#mgrBody .wkitem')].map(x=>x.textContent).join('|');
  o.before=/None of your fighters is on this week/.test(txt());o.none=onCard96()===0;
  const g=rosterOf(m).find(x=>!x.inj);w.night.bouts[0].ents.push(g.id);MGR_REDRAW();await W8(400);
  o.after=!/None of your fighters is on this week/.test(txt())&&/on this week's card/.test(document.querySelector('#mgrBody .wkcheck').textContent);o.n=onCard96();
  o.todo=!(ludusTodos().some(x=>x[0]==='⚔'&&/None of your fighters/.test(x[1])));return o});
ok(r8.before&&r8.none,'8 nobody entered shows the item first '+JSON.stringify(r8));ok(r8.after&&r8.n===1&&r8.todo,'8 one fighter on a card clears it at once '+JSON.stringify(r8));
/* ---- 11 · invitational Answer ---- */
const r11=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};
  const sid=Object.keys(SPECIALS||{})[0];const D=specDef(sid);o.sid=!!D;if(!D)return o;
  const iv={id:'iv96t',sid,n:D.n,wk:w.week+3,status:'open',ents:[]};w.invites=[...(w.invites||[]),iv];MGR.tab='ludus';MGR_REDRAW();await W8(500);
  const mailEl=document.querySelector('#mgrBody details.mail');if(mailEl)mailEl.open=true;
  const bt=document.querySelector('#mgrBody [data-mg="iv_open"][data-id="iv96t"]');o.btn=!!bt;if(!bt)return o;bt.click();await W8(300);
  const pop=document.querySelector('.iv96bg');o.pop=!!pop;o.sels=pop?pop.querySelectorAll('.iv96s').length:0;o.dis=pop?pop.querySelector('[data-iv96="ok"]').disabled:null;
  const s=pop.querySelector('.iv96s');const ros=rosterOf(m).filter(g=>!g.inj);s.value=ros[0].id;s.dispatchEvent(new Event('change',{bubbles:true}));o.en=!pop.querySelector('[data-iv96="ok"]').disabled;
  pop.querySelector('[data-iv96="ok"]').click();await W8(400);o.acc=iv.status==='accepted'&&iv.ents[0]===ros[0].id;o.gone=!document.querySelector('.iv96bg');o.open=MGR.ivOpen==null;return o});
ok(r11.sid&&r11.btn&&r11.pop&&r11.sels>=1&&r11.dis===true&&r11.en,'11 Answer opens the fighter picker (Accept waits for a pick) '+JSON.stringify(r11));ok(r11.acc&&r11.gone&&r11.open,'11 Accept accepts at once '+JSON.stringify(r11));
/* ---- 13 · anvil + Damaged on the right ---- */
const r13=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};
  const rail=document.querySelector('#mgrBody .rail button[data-id="armory"],#mgrBody .rail [data-id="armory"]');o.rail=!!rail;o.anvil=!!(rail&&rail.querySelector('svg.anv96'));o.rosterIcon=!!document.querySelector('#mgrBody .rail [data-id="roster"] svg.anv96');
  const H=arm94H(m);const P=H.sh[0]||arm94New(w,'w',Object.keys(W)[0]);if(!H.sh.includes(P))H.sh.push(P);P.dmg=1;
  MGR.tab='armory';MGR_REDRAW();await W8(500);const B=document.getElementById('mgrBody');const d=B.querySelector('#ar96dmg'),a=B.querySelector('#ar94');o.dmg=!!d;
  if(d&&a){const rd=d.getBoundingClientRect(),ra=a.getBoundingClientRect();o.right=rd.left>=ra.right-2;}o.items=d?d.querySelectorAll('.ar96it').length:0;o.all=!!(d&&d.querySelector('[data-arm94fixall]'));
  const c0=m.coin;const fb=d.querySelector('[data-ar96fix]');o.fix=!!fb;if(fb){fb.click();await W8(400)}o.mended=!P.dmg&&m.coin<c0;o.empty=/Nothing needs repair/.test(B.querySelector('#ar96dmg').textContent);return o});
ok(r13.rail&&r13.anvil&&!r13.rosterIcon,'13 the Armory rail icon is an anvil '+JSON.stringify(r13));ok(r13.dmg&&r13.right&&r13.items>=1&&r13.all,'13 damaged pieces on the right with repair buttons '+JSON.stringify(r13));ok(r13.fix&&r13.mended&&r13.empty,'13 a piece can be mended there '+JSON.stringify(r13));
if(SHOT){await W(300);await pg.screenshot({path:SHOT+'/tv96m_armory.png'})}
/* ---- phone 390 ---- */
await pg.setViewportSize({width:390,height:800});await W(300);
const ph=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};for(const t of ['league','me','night','sched','armory']){MGR.tab=t;MGR_REDRAW();await W8(350);o[t]=document.documentElement.scrollWidth<=window.innerWidth+2||document.getElementById('mgrBody').scrollWidth<=window.innerWidth+2}return o});
ok(Object.values(ph).every(Boolean),'390 px: no sideways page scroll '+JSON.stringify(ph));
if(SHOT){await pg.evaluate(()=>{MGR.tab='league';MGR_REDRAW()});await W(400);await pg.screenshot({path:SHOT+'/tv96m_league390.png'})}
const newErr=await pg.evaluate(m0=>ERR92.n-m0,mark);ok(newErr===0,'no new entries in the error log '+newErr);
console.log(miss.length?'FAIL '+miss.join('\n  '):'tv96m OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
