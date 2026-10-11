/* v1.0 World tabs, owner's answers 1c/4c + trophy banner — screenshots into tools/plans/world100/
   node tools/plans/world100/shot2.js flavius-arena.html [only]  */
const L=require('./_lib.js');const path=require('path');const OUT=__dirname;const only=process.argv[3]||'';
(async()=>{const {b,pg}=await L.boot({width:1440,height:1500});const st=await L.setup(pg);
 const W=ms=>pg.waitForTimeout(ms);
 const go=async(tab,fn)=>{await pg.evaluate(async([tab,fn])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(fn)eval(fn);MGR.tab=tab;MGR_REDRAW();await W8(500)},[tab,fn||''])};
 const snap=async(name,sel)=>{if(only&&!name.includes(only))return;const el=await pg.$(sel||'#mgrBody');await el.scrollIntoViewIfNeeded();await el.screenshot({path:path.join(OUT,name+'.png')})};
 /* trophy banner: none / some / all */
 await go('trophy','');await snap('trophy_banner_none','#mgrBody .wd100ban');
 await pg.evaluate(()=>{const w=W_();earnTrophy(w,'tiro',{who:'Testus',why:'t'});earnTrophy(w,'horn',{who:'Testus',why:'t'});earnTrophy(w,'flavian_cup',{who:'Testus',why:'t'})});
 await go('trophy','');await snap('trophy_banner_some','#mgrBody .wd100ban');
 await snap('trophy_tab_some','#mgrBody');
 await pg.evaluate(()=>{const w=W_();for(const d of TROPHY_LIB)if(!(w.trophies||[]).some(t=>t.tid===d.id))earnTrophy(w,d.id,{who:'Testus',why:'t'})});
 await go('trophy','');await snap('trophy_banner_all','#mgrBody .wd100ban');
 /* league: a rival's house card with the ledger */
 await go('league',`MGR.lg90='${st.rival}'`);await snap('league_house_card','#mgrBody');
 /* calendar billing + invitations */
 await pg.evaluate(()=>{const w=W_();const iv=(w.invites=w.invites||[]);const sid=Object.keys(typeof SPECIALS!=='undefined'?SPECIALS:{})[0];if(sid)iv.push({id:'ivX1',sid,wk:w.week+4,status:'open',ents:[],n:(SPECIALS[sid]||{}).n});});
 await go('sched','');await pg.evaluate(()=>{const e=document.querySelector('#mgrBody .wd100bill');e&&e.scrollIntoView({block:'center'})});await W(300);await snap('calendar_billing','#mgrBody .wd100bill');
 await pg.screenshot({path:path.join(OUT,'calendar_full.png')});
 /* imperium toggles */
 await go('imp','');await snap('imperium_toggles','#mgrBody');
 await go('imp','WD100.lay.war=1;WD100.lay.fans=1');await snap('imperium_war_on','#mgrBody .wd100map');
 await go('imp','WD100.lay={fans:0,weather:0,events:0,war:0}');await snap('imperium_all_off','#mgrBody .wd100map');
 await go('news','');await snap('news_archives','#mgrBody');
 await b.close()})();
