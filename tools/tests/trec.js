const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
const o=await pg.evaluate(async()=>{startEvent({ev:'democritus',loc:6,seats:['soldier','hero'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:20}});await new Promise(r=>setTimeout(r,2500));
  const sp=S.spect.find(x=>x.rid);const r=(sp&&CROWD_CACHE.find(y=>y.id===sp.rid))||CROWD_CACHE[0]||{id:'t1',name:'Titus the baker',look:{},city:'Roma',temper:'loyal'};const o={};const txt=h=>h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  const grab=h=>{const m=txt(h).match(/(Offer them the sword|✔ YES[^.]*|✖ NO[^.]*)[^·]{0,80}/);return m?m[0]:''};
  o.fresh=grab(spectInspectorHTML(r));r.recruited=1;o.yes=grab(spectInspectorHTML(r));r.recruited=0;r.signAsked=1;o.no=grab(spectInspectorHTML(r));r.signAsked=0;return o});
console.log(JSON.stringify(o),errs.slice(0,3));await b.close()})();
