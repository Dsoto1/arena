/* v0.56: the mailbox in Your ludus (offers, invitations, letters, reports; actions inside; past mail; unread count), Match Week's quiet line, ratings in the glossary, guides, to-do list and arena hints */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),pm=me();
  const g=freeAgents()[0];w.payJoin={gid:g.id,pay:6,until:w.week+1};
  const base=worldImpact;worldImpact=()=>({att:-0.3,mood:-14,list:[{i:'🦠',n:'Plague in the port',city:'Ostia',k:1,att:-0.3,mood:-14}]});try{adviseWeek(w)}finally{worldImpact=base}
  pm.coin=-5;w.loanAsk=1;w.qsLast&&(w.qsLast.seen=false)});
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(1000);
o.box=await pg.evaluate(()=>{MGR.tab='ludus';MGR_REDRAW();const box=document.getElementById('mailBox');const items=[...document.querySelectorAll('#mailBox .mlist>details.mail')].map(d=>d.className.replace('mail ','').split(' ')[0]);
  return {box:!!box,items,payjoinInMail:!!document.querySelector('#mailBox .payjoin'),loanInMail:!!document.querySelector('#mailBox .loanbox.offer'),loanOutside:!!document.querySelector('#mgrPane > .loanbox.offer'),count:(document.querySelector('.mcount')||{}).textContent||''}});
o.otherTabs=await pg.evaluate(()=>{const r={};for(const t of ['recruit','league','night']){MGR.tab=t;MGR_REDRAW();r[t]=!!document.querySelector('#mgrPane .payjoin')}return r});
o.night=await pg.evaluate(()=>{MGR.tab='night';MGR_REDRAW();return {line:!!document.querySelector('.mailline [data-mailgo]'),letter:!!document.querySelector('#mgrPane .letter')}});
o.read=await pg.evaluate(async()=>{MGR.tab='ludus';MGR_REDRAW();const d=[...document.querySelectorAll('#mailBox details.mail.unread')].find(x=>x.dataset.mail.startsWith('L:'));if(!d)return 'nounread';const k=d.dataset.mail;d.open=false;d.open=true;await new Promise(r=>setTimeout(r,80));
  const read=W_().mailRead.includes(k);const btn=d.querySelector('[data-ltr]');btn.click();await new Promise(r=>setTimeout(r,120));MGR_REDRAW();
  return {read,gone:!document.querySelector(`#mailBox .mlist>details[data-mail="${k}"]`),past:!!document.querySelector('#mailBox .mpast')}});
o.act=await pg.evaluate(async()=>{const c0=me().coin;const b=document.querySelector('#mailBox [data-v54="payjoin-yes"]');if(!b)return 'nobtn';b.click();await new Promise(r=>setTimeout(r,150));MGR_REDRAW();return {coin:me().coin-c0,gone:!document.querySelector('#mailBox .payjoin')}});
o.week=await pg.evaluate(async()=>{const w=W_();const g=rosterOf(me())[0];statGain(g,'str',1.5);for(const b of w.night.bouts)b.done=true;w.pend=[];me().coin=50;await endWeek();MGR.tab='ludus';MGR_REDRAW();
  return {growth:(W_().letters||[]).some(l=>/^grow-/.test(l.key)),inbox:[...document.querySelectorAll('#mailBox details.mail')].map(d=>d.dataset.mail).some(k=>/L:grow-/.test(k))}});
o.help=await pg.evaluate(()=>{const g=rosterOf(me())[0];const st=gStats(g);st.str=74;const todo=ludusTodos().some(t=>/Strength from \+1 damage/.test(t[1]));
  return {gloss:['ratings','spd','str','int','lck','cha','synd'].every(k=>GLOSS[k]),chip:statChips(st).includes('data-tt="spd"'),play:playGuideHTML().includes('Ratings: Speed'),mgr:mgrGuideHTML().includes('Ratings that grow'),todo}});
o.arena=await pg.evaluate(()=>{S&&(S.over=true);startEvent({ev:'democritus',loc:6,seats:[{cls:'slave',cpu:false,stats:{spd:90,str:80,int:70,lck:60,cha:60}},{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  const p=S.players[0];S.phase='action';HINTS=true;const h=strategyHints(p);S.over=true;return h[0]||''});
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,4));await b.close()})();
